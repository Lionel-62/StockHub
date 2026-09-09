-- ==============================================================================
-- MIGRATION 14 : Gestion Multi-boutiques (Multi-Shop Support)
-- ==============================================================================

-- 1. Ajout de la colonne owner_id à la table shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS owner_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Migration des données existantes
-- On assigne comme owner de la boutique le profil existant qui a le rôle 'owner' et qui est lié à cette boutique.
UPDATE public.shops s
SET owner_id = p.id
FROM public.profiles p
WHERE p.shop_id = s.id AND p.role = 'owner' AND s.owner_id IS NULL;

-- 3. Mise à jour des politiques (RLS) pour la table shops
-- Supprimer l'ancienne politique si nécessaire (par précaution)
DROP POLICY IF EXISTS "Les propriétaires peuvent modifier leur boutique" ON public.shops;
DROP POLICY IF EXISTS "Les owners peuvent modifier leur boutique" ON public.shops;
DROP POLICY IF EXISTS "Les boutiques peuvent etre crees par des profiles" ON public.shops;
DROP POLICY IF EXISTS "Les owners peuvent gérer leurs propres boutiques" ON public.shops;

-- Création d'une politique permettant aux propriétaires de gérer TOUTES leurs boutiques
CREATE POLICY "Les owners peuvent gérer leurs propres boutiques" ON public.shops
    FOR ALL USING (
        owner_id::text = auth.uid()::text 
        OR 
        id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid()::text)
    );
