-- ==============================================================================
-- MIGRATION: 17_digital_products.sql
-- Description: Create a dedicated table for Digital Products to keep it strictly 
-- separated from physical products logic.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.digital_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Digital specific fields
    file_url TEXT,
    file_size TEXT,
    file_type TEXT, -- e.g., 'application/pdf', 'video/mp4'
    access_type TEXT DEFAULT 'download', -- 'download', 'link', 'course'
    
    -- Media
    cover_image TEXT,
    gallery_urls JSONB,
    
    is_published BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activer RLS sur les tables
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;

-- Politique : Les clients publics peuvent voir les produits publiés
CREATE POLICY "Les produits digitaux publiés sont publics" ON public.digital_products
    FOR SELECT USING (is_published = true);

-- Politique : Seuls les membres de la boutique peuvent gérer (CRUD)
CREATE POLICY "Modification des produits digitaux" ON public.digital_products
    FOR ALL USING (shop_id IN (
        SELECT shop_id FROM public.profiles WHERE id = auth.uid()::text
    ));
