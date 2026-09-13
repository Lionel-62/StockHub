-- 1. Ajouter la colonne logo_url à la table shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Créer le bucket de stockage pour les logos s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop_logos', 'shop_logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Configurer les politiques d'accès (RLS) pour le bucket 'shop_logos'
-- Tout le monde peut voir les logos (lecture publique)
CREATE POLICY "Logos publics" ON storage.objects
    FOR SELECT USING (bucket_id = 'shop_logos');

-- Les propriétaires peuvent ajouter des logos dans ce bucket (on simplifie avec authentification)
CREATE POLICY "Upload logos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'shop_logos' AND auth.role() = 'authenticated');

-- Les propriétaires peuvent mettre à jour / supprimer leurs propres logos
CREATE POLICY "Update logos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'shop_logos' AND auth.role() = 'authenticated');

CREATE POLICY "Delete logos" ON storage.objects
    FOR DELETE USING (bucket_id = 'shop_logos' AND auth.role() = 'authenticated');
