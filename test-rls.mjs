import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';
import 'dotenv/config'; // We need dotenv if running standalone

// Make sure to run this script with `node --env-file=.env.local test-rls.mjs` or similar

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const jwtSecret = process.env.JWT_SECRET;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !jwtSecret || !serviceKey) {
  console.error("Missing env vars!");
  process.exit(1);
}

// Helper to create an authenticated client for a specific shop
async function getClientForShop(shopId) {
  const token = await new SignJWT({ 
    sub: '00000000-0000-0000-0000-000000000000', // Fake user UUID
    role: 'authenticated',
    shop_id: shopId,
    app_role: 'owner'
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
    }
  });
}

async function runTest() {
  console.log("=== DEBUT DU TEST RLS ===");
  
  // 1. Create two fake shops using Service Role (bypasses RLS)
  const adminClient = createClient(supabaseUrl, serviceKey);
  
  console.log("1. Création de deux boutiques de test (A et B)...");
  const uniqueId = Date.now();
  const shopA = await adminClient.from('shops').insert({ name: 'Boutique A', slug: `boutique-a-test-${uniqueId}`, is_active: true }).select().single();
  const shopB = await adminClient.from('shops').insert({ name: 'Boutique B', slug: `boutique-b-test-${uniqueId}`, is_active: true }).select().single();
  
  if (shopA.error) console.error("Error inserting shopA:", shopA.error);
  if (shopB.error) console.error("Error inserting shopB:", shopB.error);

  const shopAId = shopA.data.id;
  const shopBId = shopB.data.id;
  console.log(`Boutique A : ${shopAId}`);
  console.log(`Boutique B : ${shopBId}`);

  // 2. Insert one product in each shop using Service Role
  console.log("2. Ajout de produits via Admin...");
  const prodAId = crypto.randomUUID();
  const prodBId = crypto.randomUUID();
  const prodA = await adminClient.from('products').insert({ id: prodAId, name: 'Produit de A', sale_price: 1000, shop_id: shopAId, status: 'En stock' }).select().single();
  const prodB = await adminClient.from('products').insert({ id: prodBId, name: 'Produit de B', sale_price: 2000, shop_id: shopBId, status: 'En stock' }).select().single();

  if (prodA.error) console.error("Error inserting prodA:", prodA.error);
  if (prodB.error) console.error("Error inserting prodB:", prodB.error);

  // 3. Connect as User A (Shop A)
  console.log("3. Connexion en tant que Commerçant A...");
  const clientA = await getClientForShop(shopAId);
  
  // 4. Test RLS: Try to update Product B using Client A (WITHOUT .eq filters!)
  console.log("4. TENTATIVE : Le Commerçant A essaie de modifier le produit de B (SANS filtre .eq)...");
  
  const { data: updateData, error: updateError } = await clientA
    .from('products')
    .update({ name: 'HACKED BY A' })
    .eq('id', prodB.data.id) // Only targeting the ID, no shop_id filter!
    .select();
    
  if (updateData && updateData.length > 0) {
    console.error("❌ ECHEC : Le RLS a permis la modification !");
  } else {
    console.log("✅ SUCCES : Le RLS a bloqué la modification silencieusement (0 ligne affectée).");
  }

  // 5. Test RLS: Try to update Product A using Client A
  console.log("5. TENTATIVE : Le Commerçant A essaie de modifier SON propre produit (SANS filtre .eq)...");
  const { data: updateDataA, error: updateErrorA } = await clientA
    .from('products')
    .update({ name: 'MODIFIED BY A' })
    .eq('id', prodA.data.id)
    .select();

  if (updateDataA && updateDataA.length > 0) {
    console.log("✅ SUCCES : Le Commerçant A peut modifier son propre produit.");
  } else {
    console.error("❌ ECHEC : Le Commerçant A ne peut pas modifier son produit.");
    if (updateErrorA) console.error(updateErrorA);
  }

  // 6. Cleanup
  console.log("6. Nettoyage des données de test...");
  await adminClient.from('shops').delete().in('id', [shopAId, shopBId]);
  
  console.log("=== FIN DU TEST ===");
}

runTest();
