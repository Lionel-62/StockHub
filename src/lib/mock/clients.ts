import { useState, useEffect } from "react";
import { Contact } from "./contacts";
import { supabase } from "@/lib/supabase/client";

export type Client = Contact;

export function useClients(publicShopId?: string) {
  const [clients, setClients] = useState<Client[]>([]);
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
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const shopId = getShopId();
    if (!shopId) {
      setIsLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped: Client[] = data.map(d => ({
        id: d.id,
        name: d.name,
        email: d.email || "",
        phone: d.phone || "",
        address: d.address || "",
        type: d.type as any,
        status: d.status as any,
        source: d.source as any,
        totalAmount: d.total_amount,
        lastOrderDate: d.last_order_date,
        createdAt: d.created_at
      }));
      setClients(mapped);
    }
    setIsLoaded(true);
  };

  const addClient = async (client: Client) => {
    const shopId = getShopId();
    if (!shopId) return;

    setClients([client, ...clients]);
    
    await supabase.from('clients').insert({
      id: client.id,
      shop_id: shopId,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      type: client.type,
      status: client.status,
      source: client.source,
      total_amount: client.totalAmount || 0,
      last_order_date: client.lastOrderDate,
      created_at: client.createdAt
    });
  };

  const updateClient = async (client: Client) => {
    setClients(clients.map(c => c.id === client.id ? client : c));

    await supabase.from('clients').update({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      type: client.type,
      status: client.status,
      source: client.source,
      total_amount: client.totalAmount || 0,
      last_order_date: client.lastOrderDate
    }).eq('id', client.id);
  };

  const deleteClient = async (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    await supabase.from('clients').delete().eq('id', id);
  };

  return {
    clients,
    addClient,
    updateClient,
    deleteClient,
    isLoaded
  };
}
