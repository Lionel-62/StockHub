'use server';

import { createAuthenticatedClient, createAdminClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { sendAdminTelegram } from '@/lib/telegram';

export async function getTeamMembersAction() {
  const session = await getSession();
  if (!session?.shopId) return { success: false, error: 'Non autorisé' };

  const supabase = await createAuthenticatedClient(session);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('shop_id', session.shopId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addTeamMemberAction(userData: any) {
  try {
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
      userData.id = globalThis.crypto.randomUUID();
    } else {
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
  } catch (error: any) {
    console.error("Action error:", error);
    return { success: false, error: error.message || 'Une erreur inattendue est survenue.' };
  }
}

export async function deleteTeamMemberAction(id: string) {
  const session = await getSession();
  if (!session?.shopId || session.role !== 'owner') return { success: false, error: 'Non autorisé' };

  const supabase = createAdminClient();
  const { data: userToDelete } = await supabase.from('profiles').select('name, identifier').eq('id', id).single();

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)
    .eq('shop_id', session.shopId)
    .neq('id', session.id); // Cannot delete oneself

  if (error) return { success: false, error: error.message };

  if (userToDelete) {
    sendAdminTelegram(`🗑️ ⚠️ Sécurité : L'employé "${userToDelete.name}" (${userToDelete.identifier}) a été supprimé par ${session.name}.`);
  }

  return { success: true };
}
