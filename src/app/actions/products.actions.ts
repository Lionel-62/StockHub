'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function getProductsAction() {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', session.shopId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addProductAction(productData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .insert({ ...productData, shop_id: session.shopId })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateProductAction(id: string, productData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .eq('shop_id', session.shopId) // Security check
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteProductAction(id: string) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('shop_id', session.shopId); // Security check

  if (error) return { success: false, error: error.message };
  return { success: true };
}
