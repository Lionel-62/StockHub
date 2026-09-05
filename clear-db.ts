import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function eraseAllData() {
  console.log("Démarrage du nettoyage complet de la base de données...");

  // 1. Delete all profiles (this will detach shops if not cascaded)
  console.log("Suppression des profils...");
  const { error: profileError } = await supabase.from('profiles').delete().neq('id', 'dummy-id');
  if (profileError) console.error("Erreur Profils:", profileError);
  
  // 2. Delete all shops
  console.log("Suppression des boutiques...");
  const { error: shopsError } = await supabase.from('shops').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (shopsError) console.error("Erreur Boutiques:", shopsError);

  // 3. Delete all auth users
  console.log("Suppression des utilisateurs authentifiés...");
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Erreur lors de la liste des utilisateurs:", listError);
  } else if (usersData && usersData.users) {
    for (const user of usersData.users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Erreur lors de la suppression de l'utilisateur ${user.email}:`, deleteError);
      } else {
        console.log(`Utilisateur ${user.email} supprimé.`);
      }
    }
  }

  console.log("✅ Nettoyage terminé ! La base de données est entièrement vide.");
}

eraseAllData();
