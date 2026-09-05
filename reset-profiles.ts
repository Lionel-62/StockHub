import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  console.log("Suppression des shops et du shop_id pour tous les profils...");
  
  // Mettre tous les shop_id à null dans les profils
  const { error } = await supabase
    .from('profiles')
    .update({ shop_id: null })
    .not('id', 'eq', '00000000-0000-0000-0000-000000000000'); // Dummy condition to update all
    
  if (error) {
    console.error("Erreur Profils:", error);
  } else {
    console.log("Profils réinitialisés.");
  }
}

run();
