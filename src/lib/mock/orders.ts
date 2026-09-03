import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

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

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getShopId = () => {
    const session = localStorage.getItem("stockhub_session");
    if (session) {
      const user = JSON.parse(session);
      return user.shopId;
    }
    return null;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const shopId = getShopId();
    if (!shopId) {
      setIsLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('date', { ascending: false });

    if (!error && data) {
      const mapped: Order[] = data.map(d => ({
        id: d.id,
        orderNumber: d.order_number,
        clientName: d.client_name,
        totalAmount: d.total_amount,
        itemsCount: d.items_count,
        status: d.status as any,
        paymentMethod: d.payment_method as any,
        source: d.source as any,
        items: typeof d.items === 'string' ? JSON.parse(d.items) : d.items,
        date: d.date,
        clientId: undefined
      }));
      setOrders(mapped);
    }
    setIsLoaded(true);
  };

  const addOrder = async (order: Order) => {
    const shopId = getShopId();
    if (!shopId) return;

    setOrders([order, ...orders]);
    await supabase.from('orders').insert({
      id: order.id,
      shop_id: shopId,
      order_number: order.orderNumber,
      client_name: order.clientName,
      total_amount: order.totalAmount,
      items_count: order.itemsCount,
      status: order.status,
      payment_method: order.paymentMethod,
      source: order.source,
      items: order.items,
      date: order.date
    });
  };

  const updateOrder = async (order: Order) => {
    setOrders(orders.map(o => o.id === order.id ? order : o));
    await supabase.from('orders').update({
      client_name: order.clientName,
      total_amount: order.totalAmount,
      items_count: order.itemsCount,
      status: order.status,
      payment_method: order.paymentMethod,
      source: order.source,
      items: order.items,
      date: order.date
    }).eq('id', order.id);
  };

  const deleteOrder = async (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    await supabase.from('orders').delete().eq('id', id);
  };

  const replaceAllOrders = async (newOrders: Order[]) => {
    setOrders(newOrders);
    // Usually used when status changes or a new order is added
    // For full compatibility, we'd need to sync changes, but for now we rely on explicit methods where possible
    for (const order of newOrders) {
      const shopId = getShopId();
      if (!shopId) continue;
      
      await supabase.from('orders').upsert({
        id: order.id,
        shop_id: shopId,
        order_number: order.orderNumber,
        client_name: order.clientName,
        total_amount: order.totalAmount,
        items_count: order.itemsCount,
        status: order.status,
        payment_method: order.paymentMethod,
        source: order.source,
        items: order.items,
        date: order.date
      });
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
