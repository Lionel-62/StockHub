'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function getShopSettingsAction() {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('id', session.shopId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateShopSettingsAction(shopData: any) {
  const session = await getSession();
  if (!session?.shopId || session.role !== 'owner') return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('shops')
    .update(shopData)
    .eq('id', session.shopId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getShopBySlugAction(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('shops')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return { success: false, error: 'Boutique introuvable' };
  }
  
  return { success: true, data };
}
