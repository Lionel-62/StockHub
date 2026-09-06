import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { getOrdersAction, addOrderAction, updateOrderAction, deleteOrderAction } from "@/app/actions/orders.actions";

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  totalAmount: number;
  itemsCount: number;
  status: "Payée" | "En attente" | "Livrée" | "Annulée";
  date: string;
  paymentMethod: "Espèces" | "Mobile Money" | "Carte Bancaire" | "Virement";
  clientId?: string;
  items?: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  source?: "En ligne" | "Sur place";
}

export function useOrders(publicShopId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getShopId = () => {
    if (publicShopId) return publicShopId;
    const session = localStorage.getItem("stockhub_session");
    if (session) {
      const user = JSON.parse(session);
      return user.shopId;
    }
    return null;
  };

  useEffect(() => {
    const shopId = getShopId();
    if (shopId) {
      const cached = localStorage.getItem("stockhub_cache_orders_" + shopId);
      if (cached) {
        setOrders(JSON.parse(cached));
        setIsLoaded(true);
      }
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const shopId = getShopId();
    if (!shopId) {
      setIsLoaded(true);
      return;
    }

    if (publicShopId) {
       // Storefront has no session and doesn't need to read existing orders
       setIsLoaded(true);
       return;
    }

    // Use server action for Dashboard (handles employees & owners via cookie)
    const res = await getOrdersAction();
    if (res.success && res.data) {
      const mapped: Order[] = res.data.map((d: any) => ({
        id: d.id,
        orderNumber: d.order_number,
        clientName: d.client_name,
        totalAmount: d.total_amount,
        itemsCount: d.items_count,
        status: d.status,
        paymentMethod: d.payment_method,
        source: d.source,
        items: typeof d.items === 'string' ? JSON.parse(d.items) : d.items,
        date: d.date,
        clientId: undefined
      }));
      setOrders(mapped);
      localStorage.setItem("stockhub_cache_orders_" + shopId, JSON.stringify(mapped));
    }
    setIsLoaded(true);
  };

  const addOrder = async (order: Order) => {
    const shopId = getShopId();
    if (!shopId) return;

    setOrders([order, ...orders]);
    
    const dbPayload = {
      id: order.id,
      order_number: order.orderNumber,
      client_name: order.clientName,
      total_amount: order.totalAmount,
      items_count: order.itemsCount,
      status: order.status,
      payment_method: order.paymentMethod,
      source: order.source,
      items: order.items,
      date: order.date
    };

    if (publicShopId) {
      // Public Storefront: Can insert via Supabase client because RLS allows anonymous INSERTS
      await supabase.from('orders').insert({ ...dbPayload, shop_id: shopId });
    } else {
      // Dashboard: Use Server Action
      await addOrderAction(dbPayload);
    }
  };

  const updateOrder = async (order: Order) => {
    setOrders(orders.map(o => o.id === order.id ? order : o));
    
    const dbPayload = {
      client_name: order.clientName,
      total_amount: order.totalAmount,
      items_count: order.itemsCount,
      status: order.status,
      payment_method: order.paymentMethod,
      source: order.source,
      items: order.items,
      date: order.date
    };

    if (publicShopId) {
      await supabase.from('orders').update(dbPayload).eq('id', order.id);
    } else {
      await updateOrderAction(order.id, dbPayload);
    }
  };

  const deleteOrder = async (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    if (!publicShopId) {
      await deleteOrderAction(id);
    }
  };

  const replaceAllOrders = async (newOrders: Order[]) => {
    setOrders(newOrders);
    for (const order of newOrders) {
      const shopId = getShopId();
      if (!shopId) continue;
      
      const dbPayload = {
        client_name: order.clientName,
        total_amount: order.totalAmount,
        items_count: order.itemsCount,
        status: order.status,
        payment_method: order.paymentMethod,
        source: order.source,
        items: order.items,
        date: order.date
      };

      if (!publicShopId) {
        await updateOrderAction(order.id, dbPayload);
      }
    }
  };

  return { 
    orders, 
    addOrder,
    updateOrder,
    deleteOrder,
    setOrders: replaceAllOrders, 
    isLoaded 
  };
}
