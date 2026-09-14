-- ==============================================================================
-- MIGRATION 16 : Vue publique sécurisée et RLS strict pour les produits
-- ==============================================================================

-- 1. Révoquer TOUT accès public direct à la table source
REVOKE ALL ON public.products FROM anon;
DROP POLICY IF EXISTS "Les produits sont publics pour la lecture" ON public.products;
DROP POLICY IF EXISTS "Modification des produits" ON public.products;

-- 2. Restreindre la table products UNIQUEMENT au backend authentifié (Custom JWT)
CREATE POLICY "Le propriétaire peut tout faire sur ses produits" ON public.products
    FOR ALL USING (
        shop_id = (current_setting('request.jwt.claims', true)::json->>'shop_id')::uuid
    );

-- 3. Créer une vue sécurisée pour la vitrine publique
-- Note: 'options' et 'barcode' sont exclus intentionnellement pour sécurité et compatibilité.
CREATE OR REPLACE VIEW public.public_store_products AS
SELECT 
    id,
    created_at,
    shop_id,
    name,
    description,
    category,
    sale_price,
    promotional_price,
    image_url,
    gallery_urls,
    pack_offers,
    is_published_on_store,
    status,
    -- Masquer la quantité réelle en stock (renvoie 999 si en stock, 0 si rupture)
    CASE WHEN stock > 0 THEN 999 ELSE 0 END AS stock
FROM public.products
WHERE is_published_on_store = true;

-- 4. Donner l'accès public uniquement à la vue
GRANT SELECT ON public.public_store_products TO anon;
GRANT SELECT ON public.public_store_products TO authenticated;
