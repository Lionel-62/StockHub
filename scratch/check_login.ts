import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  let query = supabase
    .from('profiles')
    .select('*, shops!profiles_shop_id_fkey!inner(slug, name)')
    .eq('identifier', 'loko')
    .eq('pin_code', '1234')
    .eq('shops.slug', 'amadou-fall');

  const { data, error } = await query.single();
  console.log("Query 'loginAction fixed':", data, error);
}
check();
