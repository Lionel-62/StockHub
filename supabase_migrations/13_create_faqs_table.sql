-- ==============================================================================
-- MIGRATION : Création de la table FAQs pour chaque boutique
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- ACTIVATION DE LA SÉCURITÉ AU NIVEAU DES LIGNES (Row Level Security - RLS)
-- ==============================================================================

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Les FAQs sont publiques pour la lecture (sur la vitrine)
CREATE POLICY "Les FAQs sont publiques pour la lecture" ON public.faqs
    FOR SELECT USING (true);

-- Seuls les utilisateurs associés à la boutique peuvent modifier les FAQs
CREATE POLICY "Modification des FAQs" ON public.faqs
    FOR ALL USING (shop_id IN (
        SELECT shop_id FROM public.profiles WHERE id = auth.uid()::text
    ));
