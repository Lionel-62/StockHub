'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function getInvoicesAction() {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('shop_id', session.shopId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addInvoiceAction(invoiceData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('invoices')
    .insert({ ...invoiceData, shop_id: session.shopId })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateInvoiceAction(id: string, invoiceData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('invoices')
    .update(invoiceData)
    .eq('id', id)
    .eq('shop_id', session.shopId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteInvoiceAction(id: string) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('shop_id', session.shopId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function addPublicInvoiceAction(shopId: string, invoiceData: any) {
  if (!shopId) return { success: false, error: 'Shop ID manquant' };
  
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('invoices')
    .insert({ ...invoiceData, shop_id: shopId })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
