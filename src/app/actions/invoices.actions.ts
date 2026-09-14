'use server';

import { createAdminClient, createAuthenticatedClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function getInvoicesAction() {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = await createAuthenticatedClient(session);
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('issue_date', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addInvoiceAction(invoiceData: any) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = await createAuthenticatedClient(session);
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

  const supabase = await createAuthenticatedClient(session);
  const { data, error } = await supabase
    .from('invoices')
    .update(invoiceData)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteInvoiceAction(id: string) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = await createAuthenticatedClient(session);
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

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
