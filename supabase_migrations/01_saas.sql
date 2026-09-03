-- ==============================================================================
-- MIGRATION SAAS MULTI-TENANT : Création des boutiques et isolation des données
-- ==============================================================================

-- 1. Création de la table des Boutiques (Shops)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    whatsapp_number TEXT,
    is_active BOOLEAN DEFAULT true,
    theme_color TEXT DEFAULT 'blue',
    meta_api_enabled BOOLEAN DEFAULT false,
    meta_phone_number_id TEXT,
    meta_access_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Ajouter la colonne shop_id à TOUTES les tables existantes
-- Table Profiles (utilisateurs/employés liés à une boutique)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;

-- Table Products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;

-- Table Clients (si elle existe, ou pour plus tard)
-- Note: les autres tables comme orders, invoices seront créées dans un script ultérieur si elles n'existent pas dans Supabase encore, 
-- mais ajoutons-le au cas où elles existent.
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
        ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
        ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ==============================================================================
-- 3. ACTIVATION DE LA SÉCURITÉ AU NIVEAU DES LIGNES (Row Level Security - RLS)
-- ==============================================================================

-- Activer RLS sur les tables clés
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Politiques pour Shops (Boutiques)
-- Tout le monde peut lire une boutique si elle est active (pour la vitrine en ligne)
CREATE POLICY "Les boutiques actives sont publiques" ON public.shops
    FOR SELECT USING (is_active = true);

-- Politique pour Profiles
-- Les utilisateurs peuvent voir les profils de la même boutique
CREATE POLICY "Les profils de la même boutique" ON public.profiles
    FOR ALL USING (shop_id IN (
        SELECT shop_id FROM public.profiles WHERE id = auth.uid()::text
    ));

-- Politique pour Products
-- 1. Les clients publics peuvent voir les produits de la boutique associée
CREATE POLICY "Les produits sont publics pour la lecture" ON public.products
    FOR SELECT USING (true); -- La restriction se fera dans le code via .eq('shop_id', ...)

-- 2. Seuls les employés/propriétaires de la boutique peuvent créer/modifier/supprimer
CREATE POLICY "Modification des produits" ON public.products
    FOR ALL USING (shop_id IN (
        SELECT shop_id FROM public.profiles WHERE id = auth.uid()::text
    ));

-- ==============================================================================
-- Note pour le développeur : 
-- Ce script prépare la base de données pour le Multi-Tenant.
-- Vous devrez modifier vos requêtes Supabase frontend pour TOUJOURS inclure
-- .eq('shop_id', currentShopId)
-- ==============================================================================
