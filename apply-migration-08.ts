import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  console.log("Adding location columns to shops...");
  
  const { error } = await supabase.rpc('exec_sql' as any, {
    sql: `
      ALTER TABLE public.shops 
      ADD COLUMN IF NOT EXISTS country TEXT,
      ADD COLUMN IF NOT EXISTS city TEXT,
      ADD COLUMN IF NOT EXISTS country_code TEXT;
    `
  });
  
  if (error) {
    console.error("Please run this manually in Supabase SQL editor:");
    console.log(`
      ALTER TABLE public.shops 
      ADD COLUMN IF NOT EXISTS country TEXT,
      ADD COLUMN IF NOT EXISTS city TEXT,
      ADD COLUMN IF NOT EXISTS country_code TEXT;
    `);
  } else {
    console.log("✅ Migration applied successfully.");
  }
}

run();
