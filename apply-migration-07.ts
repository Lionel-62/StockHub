import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  console.log("Checking if onboarding_completed column exists...");
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, onboarding_completed')
    .limit(1);
  
  if (error && error.message.includes('column')) {
    console.error("Column does not exist. Please run this SQL in your Supabase SQL Editor:");
    console.log(`
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

UPDATE public.profiles 
SET onboarding_completed = true 
WHERE shop_id IS NOT NULL;
    `);
  } else if (error) {
    console.error("Other error:", error.message);
  } else {
    console.log("✅ Column onboarding_completed exists.");
    
    // Update existing profiles that have shop_id to mark as completed
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .not('shop_id', 'is', null);
    
    if (updateError) {
      console.error("Update error:", updateError.message);
    } else {
      console.log("✅ Existing profiles with shops marked as onboarding_completed = true");
    }
  }
}

run();
