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

  // Check limits based on subscription plan
  const adminSupabase = createAdminClient();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('subscription_status, subscription_plan')
    .eq('id', session.id)
    .single();

  if (profile?.subscription_status === 'trial' || profile?.subscription_plan === 'free') {
    const { count } = await adminSupabase
      .from('digital_products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', session.shopId);
      
    if (count !== null && count >= 10) {
      return { 
        success: false, 
        error: "Limite atteinte : Le Plan Gratuit vous permet d'ajouter jusqu'à 10 produits maximum. Veuillez activer votre abonnement pour ajouter plus de produits." 
      };
    }
  }

  // Check Pro plan limit (up to 50 products)
  if (profile?.subscription_plan === 'pro') {
    const { count } = await adminSupabase
      .from('digital_products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', session.shopId);
      
    if (count !== null && count >= 50) {
      return { 
        success: false, 
        error: "Limite atteinte : Le Plan Pro vous permet d'ajouter jusqu'à 50 produits. Veuillez passer au Plan Business pour des produits illimités." 
      };
    }
  }

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
