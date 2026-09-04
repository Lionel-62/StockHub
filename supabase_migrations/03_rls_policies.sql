-- ==============================================================================
-- MIGRATION 03 : Sécurisation (RLS) des tables Clients, Orders et Invoices
-- ==============================================================================

-- 1. Activer le Row Level Security (RLS) sur les tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLITIQUES POUR LES COMMERÇANTS (Dashboard)
-- Seul le personnel d'une boutique peut voir et modifier ses propres données
-- ==============================================================================

-- Politiques pour Clients
CREATE POLICY "Les commerçants gèrent leurs clients" ON public.clients
    FOR ALL 
    USING (
        shop_id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid()::text)
    );

-- Politiques pour Orders (Commandes)
CREATE POLICY "Les commerçants gèrent leurs commandes" ON public.orders
    FOR ALL 
    USING (
        shop_id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid()::text)
    );

-- Politiques pour Invoices (Factures)
CREATE POLICY "Les commerçants gèrent leurs factures" ON public.invoices
    FOR ALL 
    USING (
        shop_id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid()::text)
    );

-- ==============================================================================
-- POLITIQUES POUR LA VITRINE EN LIGNE (Public / Clients finaux)
-- Permet aux clients de passer commande depuis le site web
-- ==============================================================================

-- Permettre l'insertion de nouveaux clients depuis la vitrine (non connectés)
CREATE POLICY "Le public peut créer des clients" ON public.clients
    FOR INSERT 
    WITH CHECK (true);

-- Permettre l'insertion de nouvelles commandes depuis la vitrine
CREATE POLICY "Le public peut créer des commandes" ON public.orders
    FOR INSERT 
    WITH CHECK (true);

-- Permettre l'insertion de nouvelles factures depuis la vitrine (si nécessaire pour le checkout)
CREATE POLICY "Le public peut créer des factures" ON public.invoices
    FOR INSERT 
    WITH CHECK (true);
