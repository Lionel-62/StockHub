'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function getTeamMembersAction() {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('shop_id', session.shopId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addTeamMemberAction(userData: any) {
  const session = await getSession();
  console.log("addTeamMemberAction - Session:", session);
  if (!session) {
     return { success: false, error: 'Non autorisé: Session manquante ou invalide (Cookie non trouvé)' };
  }
  if (!session.shopId) {
     return { success: false, error: 'Non autorisé: shopId manquant dans la session' };
  }
  if (session.role !== 'owner') {
     return { success: false, error: 'Non autorisé: Seul le gérant (owner) peut ajouter un employé' };
  }

  const supabase = createAdminClient();
  
  if (userData.role === 'employee') {
    // Check limit
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', session.shopId)
      .eq('role', 'employee');
      
    if (count !== null && count >= 2) {
      return { success: false, error: 'Limite atteinte : Vous ne pouvez pas ajouter plus de 2 employés.' };
    }
    
    // Use random UUID for employees
    const crypto = require('crypto');
    userData.id = crypto.randomUUID();
  } else {
     // If they are signing up as an owner for a NEW shop, this shouldn't go through here anymore.
     // Owner signup is handled differently now or we assume this is only for dashboard additions.
     return { success: false, error: 'Création de propriétaire non autorisée ici.' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({ 
      id: userData.id,
      name: userData.name,
      identifier: userData.identifier,
      pin_code: userData.pinCode,
      role: userData.role,
      permissions: userData.permissions,
      created_at: userData.createdAt || new Date().toISOString(),
      shop_id: session.shopId 
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteTeamMemberAction(id: string) {
  const session = await getSession();
  if (!session?.shopId || session.role !== 'owner') return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)
    .eq('shop_id', session.shopId)
    .neq('id', session.id); // Cannot delete oneself

  if (error) return { success: false, error: error.message };
  return { success: true };
}
