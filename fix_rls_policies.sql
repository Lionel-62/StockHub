-- ==============================================================================
-- STOCKHUB : CORRECTION CRITIQUE DES RÈGLES DE SÉCURITÉ (RLS)
-- ==============================================================================
-- Attention : À exécuter dans le "SQL Editor" de votre tableau de bord Supabase.
-- Ces règles remplacent la politique temporaire "Dev_Public_Access" par des
-- vérifications strictes pour que seuls les propriétaires et employés 
-- autorisés puissent voir les données d'une boutique.

-- 1. Supprimer les règles "Dev_Public_Access" (ouvre-tout) existantes
DROP POLICY IF EXISTS "Dev_Public_Access" ON profiles;
DROP POLICY IF EXISTS "Dev_Public_Access" ON shops;
DROP POLICY IF EXISTS "Dev_Public_Access" ON products;
DROP POLICY IF EXISTS "Dev_Public_Access" ON clients;
DROP POLICY IF EXISTS "Dev_Public_Access" ON invoices;
DROP POLICY IF EXISTS "Dev_Public_Access" ON orders;

-- 2. Activer explicitement le RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. Confirmer les permissions de base pour le rôle authentifié et service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON shops TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON clients TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated, service_role;

-- 4. Recréer les règles strictes

-- PROFILES : Un utilisateur peut voir son propre profil ou ceux de sa boutique (si owner)
DROP POLICY IF EXISTS "Strict_Profile_Access" ON profiles;
CREATE POLICY "Strict_Profile_Access" ON profiles
FOR ALL USING (
  auth.uid()::text = id::text
);

-- SHOPS : Le propriétaire peut tout faire. Tout le monde peut voir les shops actifs (pour la vitrine).
DROP POLICY IF EXISTS "Strict_Shop_Owner_Access" ON shops;
CREATE POLICY "Strict_Shop_Owner_Access" ON shops
FOR ALL USING (
  owner_id::text = auth.uid()::text
);

DROP POLICY IF EXISTS "Public_Shop_Read" ON shops;
CREATE POLICY "Public_Shop_Read" ON shops
FOR SELECT USING (
  is_active = true
);

-- PRODUCTS : Le propriétaire peut tout faire.
DROP POLICY IF EXISTS "Strict_Product_Owner_Access" ON products;
CREATE POLICY "Strict_Product_Owner_Access" ON products
FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id::text = auth.uid()::text)
);

-- ==============================================================================
-- VUE SÉCURISÉE POUR LA VITRINE PUBLIQUE
-- ==============================================================================
-- Cette vue permet aux clients de voir les produits sur la boutique en ligne
-- SANS exposer les données sensibles (comme le prix d'achat ou le fournisseur)

DROP VIEW IF EXISTS public_store_products;

CREATE VIEW public_store_products AS
SELECT 
  id, 
  shop_id,
  name, 
  description, 
  sale_price,           -- Prix de vente public
  promotional_price,
  pack_offers,
  category, 
  image_url, 
  gallery_urls,
  status,               -- On expose seulement le statut du stock (En stock, Rupture)
  is_published_on_store,
  created_at
FROM products 
WHERE is_published_on_store = true;

-- Donner l'accès public (anon) et authentifié à cette vue
GRANT SELECT ON public_store_products TO anon, authenticated, service_role;

-- Sécurité maximale : on interdit formellement l'accès public direct à la table source
REVOKE ALL ON products FROM anon;

-- CLIENTS : Seul le propriétaire de la boutique peut voir ses clients
DROP POLICY IF EXISTS "Strict_Client_Access" ON clients;
CREATE POLICY "Strict_Client_Access" ON clients
FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id::text = auth.uid()::text)
);

-- INVOICES : Seul le propriétaire de la boutique peut voir ses factures
DROP POLICY IF EXISTS "Strict_Invoice_Access" ON invoices;
CREATE POLICY "Strict_Invoice_Access" ON invoices
FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id::text = auth.uid()::text)
);

-- ORDERS : Seul le propriétaire peut voir les commandes
DROP POLICY IF EXISTS "Strict_Order_Access" ON orders;
CREATE POLICY "Strict_Order_Access" ON orders
FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id::text = auth.uid()::text)
);

-- ==============================================================================
-- NOTE POUR L'AUTHENTIFICATION DES EMPLOYÉS (AVEC CODE PIN)
-- ==============================================================================
-- Si vous utilisez Supabase avec la clé "service_role" dans vos Server Actions 
-- (ex: `createAdminClient()`), ces politiques RLS seront contournées côté serveur 
-- pour permettre aux employés de se connecter via leur code PIN.
-- C'est le comportement attendu. Le RLS protège la base de données côté client.
