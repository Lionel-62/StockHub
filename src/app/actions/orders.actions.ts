'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function getOrdersAction() {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('shop_id', session.shopId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addOrderAction(orderData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...orderData, shop_id: session.shopId })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateOrderAction(id: string, orderData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .update(orderData)
    .eq('id', id)
    .eq('shop_id', session.shopId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteOrderAction(id: string) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)
    .eq('shop_id', session.shopId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
