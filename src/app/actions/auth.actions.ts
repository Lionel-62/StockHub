'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { setSession, deleteSession } from '@/lib/auth/session';
import { checkRateLimit, incrementRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';

export async function loginAction(identifier: string, pinCode: string, allowedRole?: "owner" | "employee", shopSlug?: string) {
  const rateLimit = checkRateLimit(identifier);
  if (!rateLimit.allowed) {
    return { success: false, error: `Trop de tentatives. Veuillez réessayer dans ${rateLimit.retryAfter} secondes.` };
  }

  const supabase = createAdminClient();
  
  let query = supabase
    .from('profiles')
    .select('*, shops!inner(slug, name)')
    .eq('identifier', identifier)
    .eq('pin_code', pinCode);
    
  if (allowedRole === "employee" && shopSlug) {
    query = query.eq('shops.slug', shopSlug);
  }

  const { data, error } = await query.single();
  const userRecord = data;

  if (!error && userRecord) {
    if (allowedRole && userRecord.role !== allowedRole) {
      return { success: false, error: allowedRole === "owner" ? "Veuillez utiliser l'espace employé." : "Veuillez utiliser l'espace propriétaire." };
    }

    resetRateLimit(identifier);

    // Build session data securely (do not include PIN)
    const sessionData = {
      id: userRecord.id,
      name: userRecord.name,
      identifier: userRecord.identifier,
      role: userRecord.role,
      shopId: userRecord.shop_id,
      shopSlug: userRecord.shops?.slug || userRecord.shop_slug,
      shopName: userRecord.shops?.name || userRecord.shop_name,
      permissions: typeof userRecord.permissions === 'string' ? JSON.parse(userRecord.permissions) : userRecord.permissions,
      createdAt: userRecord.created_at || new Date().toISOString()
    };

    await setSession(sessionData);
    
    // We also return it to the frontend for optimistic UI state
    return { success: true, user: sessionData };
  }

  incrementRateLimit(identifier);
  return { success: false, error: "Identifiant ou code PIN incorrect." };
}

export async function logoutAction() {
  await deleteSession();
  return { success: true };
}

export async function syncSessionAction(sessionData: any) {
  console.log("syncSessionAction called with:", sessionData);
  await setSession(sessionData);
  return { success: true };
}

export async function registerOwnerAction(payload: {
  userId: string;
  name: string;
  email: string;
  shopName: string;
  shopDescription: string;
  whatsapp: string;
}) {
  try {
    const supabase = createAdminClient();

    const shopSlug = payload.shopName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 1000);
          
    const { data: shopData, error: shopError } = await supabase.from('shops').insert({
      name: payload.shopName,
      description: payload.shopDescription,
      whatsapp_number: payload.whatsapp,
      slug: shopSlug,
    }).select().single();

    if (shopError || !shopData) {
      console.error("Shop creation error:", shopError);
      return { success: false, error: "Erreur lors de la création de la boutique." };
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: payload.userId,
      name: payload.name,
      identifier: payload.email,
      pin_code: '0000',
      role: 'owner',
      shop_id: shopData.id,
      permissions: { canViewDashboard: true },
      created_at: new Date().toISOString()
    });
    
    if (profileError) {
      console.error("Profile creation error:", profileError);
      return { success: false, error: "Erreur lors de la création du profil." };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur interne" };
  }
}

export async function updateProfileNameAction(userId: string, newName: string) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('profiles')
      .update({ name: newName })
      .eq('id', userId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur interne" };
  }
}
