'use server';

import { createAuthenticatedClient, createAdminClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function getProductsAction() {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = await createAuthenticatedClient(session);
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

  // Fetch subscription status & current product count to enforce Free Plan limits
  const adminSupabase = createAdminClient();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('subscription_status, subscription_plan')
    .eq('id', session.id)
    .single();

  if (profile?.subscription_status === 'trial' || profile?.subscription_plan === 'free') {
    const { count } = await adminSupabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', session.shopId);
      
    if (count !== null && count >= 20) {
      return { 
        success: false, 
        error: "Limite atteinte : Le Plan Gratuit vous permet d'ajouter jusqu'à 20 produits maximum. Veuillez activer votre abonnement pour ajouter plus de produits." 
      };
    }
  }

  // Check Pro plan limit (up to 100 products)
  if (profile?.subscription_plan === 'pro') {
    const { count } = await adminSupabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', session.shopId);
      
    if (count !== null && count >= 100) {
      return { 
        success: false, 
        error: "Limite atteinte : Le Plan Pro vous permet d'ajouter jusqu'à 100 produits. Veuillez passer au Plan Business pour des produits illimités." 
      };
    }
  }

  const supabase = await createAuthenticatedClient(session);
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

  const supabase = await createAuthenticatedClient(session);
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .eq('shop_id', session.shopId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteProductAction(id: string) {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = await createAuthenticatedClient(session);
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('shop_id', session.shopId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function decreasePublicStockAction(shopId: string, items: { id: string, quantity: number }[]) {
  const supabase = createAdminClient();
  
  // Update each item
  for (const item of items) {
    // 1. Fetch current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock, alert_threshold')
      .eq('id', item.id)
      .eq('shop_id', shopId)
      .single();
      
    if (fetchError || !product) continue;
    
    // 2. Calculate new stock
    const newStock = Math.max(0, product.stock - item.quantity);
    const alertThreshold = product.alert_threshold ?? 5;
    const newStatus = newStock === 0 ? "Rupture" : (newStock <= alertThreshold ? "Stock faible" : "En stock");
    
    // 3. Update
    await supabase
      .from('products')
      .update({ stock: newStock, status: newStatus })
      .eq('id', item.id);
  }
  
  return { success: true };
}
