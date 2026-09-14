-- ==============================================================================
-- MIGRATION 15 : Sécurisation RLS pour les produits via Custom JWT
-- ==============================================================================

-- 1. Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Modification des produits" ON public.products;
DROP POLICY IF EXISTS "Les produits sont publics pour la lecture" ON public.products;

-- 2. Créer les nouvelles politiques strictes

-- Lecture (SELECT) : 
CREATE POLICY "Les produits sont publics pour la lecture" ON public.products
    FOR SELECT USING (true);

-- Modification (INSERT, UPDATE, DELETE) :
-- Le shop_id DOIT correspondre au shop_id injecté dans le JWT (custom token généré par le backend).
CREATE POLICY "Modification des produits" ON public.products
    FOR ALL USING (
        shop_id = (current_setting('request.jwt.claims', true)::json->>'shop_id')::uuid
    );
