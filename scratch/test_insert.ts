import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { SignJWT } from 'jose';

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const jwtSecret = process.env.JWT_SECRET;
  
  const token = await new SignJWT({ 
    sub: '125288b8-ba4d-451d-b4f6-9f574e73290f',
    role: 'authenticated',
    shop_id: '125288b8-ba4d-451d-b4f6-9f574e73290f', 
    app_role: 'owner'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1m')
    .sign(new TextEncoder().encode(jwtSecret));

  const supabase = createClient(supabaseUrl!, anonKey!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data, error } = await supabase
    .from('products')
    .insert({
      id: 'test-api-id-123',
      name: 'Test via API',
      category: 'Test',
      stock: 10,
      purchase_price: 100,
      sale_price: 150,
      shop_id: '125288b8-ba4d-451d-b4f6-9f574e73290f',
      is_published_on_store: true
    })
    .select()
    .single();

  console.log("Result:", data, error);
}

run();
