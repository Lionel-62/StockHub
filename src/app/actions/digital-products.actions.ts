'use server';

import { createAuthenticatedClient, createAdminClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function getDigitalProductsAction() {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = await createAuthenticatedClient(session);
  const { data, error } = await supabase
    .from('digital_products')
    .select('*')
    .eq('shop_id', session.shopId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addDigitalProductAction(productData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = await createAuthenticatedClient(session);
  const { data, error } = await supabase
    .from('digital_products')
    .insert({ ...productData, shop_id: session.shopId })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateDigitalProductAction(id: string, productData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = await createAuthenticatedClient(session);
  const { data, error } = await supabase
    .from('digital_products')
    .update(productData)
    .eq('id', id)
    .eq('shop_id', session.shopId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteDigitalProductAction(id: string) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = await createAuthenticatedClient(session);
  const { error } = await supabase
    .from('digital_products')
    .delete()
    .eq('id', id)
    .eq('shop_id', session.shopId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
