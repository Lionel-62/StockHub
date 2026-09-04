'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { setSession, deleteSession } from '@/lib/auth/session';
import { checkRateLimit, incrementRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';

export async function loginAction(identifier: string, pinCode: string, allowedRole?: "owner" | "employee") {
  const rateLimit = checkRateLimit(identifier);
  if (!rateLimit.allowed) {
    return { success: false, error: `Trop de tentatives. Veuillez réessayer dans ${rateLimit.retryAfter} secondes.` };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('verify_pin_login', {
    p_identifier: identifier,
    p_pin_code: pinCode,
  });

  const userRecord = data?.[0];

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
      shopSlug: userRecord.shop_slug,
      shopName: userRecord.shop_name,
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
