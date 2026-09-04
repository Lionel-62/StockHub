-- ==============================================================================
-- MIGRATION 06 : Réactivation et verrouillage de RLS
-- ==============================================================================

-- 1. Réactiver RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques (au cas où elles existeraient)
DROP POLICY IF EXISTS "Les profils de la même boutique" ON public.profiles;
DROP POLICY IF EXISTS "Les produits sont publics pour la lecture" ON public.products;
DROP POLICY IF EXISTS "Modification des produits" ON public.products;
DROP POLICY IF EXISTS "Les boutiques actives sont publiques" ON public.shops;
DROP POLICY IF EXISTS "Les commerçants gèrent leurs clients" ON public.clients;
DROP POLICY IF EXISTS "Les commerçants gèrent leurs commandes" ON public.orders;
DROP POLICY IF EXISTS "Les commerçants gèrent leurs factures" ON public.invoices;
DROP POLICY IF EXISTS "Le public peut créer des clients" ON public.clients;
DROP POLICY IF EXISTS "Le public peut créer des commandes" ON public.orders;

-- 3. Nouvelles politiques de sécurité STRICTES (Back-end prioritaire)

-- SHOPS (Boutiques) :
-- Lecture publique autorisée via l'API pour la vitrine. Modification par le service_role uniquement.
CREATE POLICY "Les boutiques actives sont publiques" ON public.shops
    FOR SELECT USING (is_active = true);

-- PRODUCTS (Produits) :
-- Lecture publique autorisée via l'API pour la vitrine. Modification par le service_role uniquement.
CREATE POLICY "Les produits sont publics pour la lecture" ON public.products
    FOR SELECT USING (true);

-- AUTRES TABLES (Profiles, Clients, Orders, Invoices) :
-- Aucune politique permettant l'accès via la clé Anonyme (sauf création de commandes et clients depuis la vitrine publique).
-- Toute lecture ou modification doit passer par les Server Actions (service_role).

-- La vitrine doit pouvoir envoyer de nouvelles commandes et clients via l'API client (anonyme)
CREATE POLICY "Le public peut créer des clients" ON public.clients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Le public peut créer des commandes" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Remarque : Pour profiles et invoices, l'accès anonyme direct est 100% refusé (ni SELECT, ni INSERT, ni UPDATE, ni DELETE).
