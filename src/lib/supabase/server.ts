import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

import { SignJWT } from 'jose';

export async function createAuthenticatedClient(session: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  if (!supabaseUrl || !anonKey || !jwtSecret) {
    throw new Error('Variables d\'environnement manquantes pour Supabase (URL, ANON_KEY ou JWT_SECRET).');
  }

  // Create a short-lived JWT specifically for Supabase PostgREST
  const token = await new SignJWT({ 
    sub: session.id,
    role: 'authenticated',
    shop_id: session.shopId, 
    app_role: session.role 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1m')
    .sign(new TextEncoder().encode(jwtSecret));

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}
