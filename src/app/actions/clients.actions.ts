'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function getClientsAction() {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('shop_id', session.shopId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addClientAction(clientData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...clientData, shop_id: session.shopId })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateClientAction(id: string, clientData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', id)
    .eq('shop_id', session.shopId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteClientAction(id: string) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('shop_id', session.shopId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
