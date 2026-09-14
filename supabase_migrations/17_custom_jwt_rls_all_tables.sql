-- 1. Table CLIENTS
-- On retire l'accès public
REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.clients FROM public;

-- On active le RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Politique : On lit et on écrit si shop_id correspond au JWT
DROP POLICY IF EXISTS "Isolation des clients (Lecture)" ON public.clients;
CREATE POLICY "Isolation des clients (Lecture)"
ON public.clients
FOR SELECT
USING (
  shop_id::text = nullif(current_setting('request.jwt.claims', true)::json->>'shop_id', '')
);

DROP POLICY IF EXISTS "Isolation des clients (Ecriture)" ON public.clients;
CREATE POLICY "Isolation des clients (Ecriture)"
ON public.clients
FOR ALL
USING (
  shop_id::text = nullif(current_setting('request.jwt.claims', true)::json->>'shop_id', '')
)
WITH CHECK (
  shop_id::text = nullif(current_setting('request.jwt.claims', true)::json->>'shop_id', '')
);

-- 2. Table INVOICES
REVOKE ALL ON public.invoices FROM anon;
REVOKE ALL ON public.invoices FROM public;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Isolation des factures (Lecture)" ON public.invoices;
CREATE POLICY "Isolation des factures (Lecture)"
ON public.invoices
FOR SELECT
USING (
  shop_id::text = nullif(current_setting('request.jwt.claims', true)::json->>'shop_id', '')
);

DROP POLICY IF EXISTS "Isolation des factures (Ecriture)" ON public.invoices;
CREATE POLICY "Isolation des factures (Ecriture)"
ON public.invoices
FOR ALL
USING (
  shop_id::text = nullif(current_setting('request.jwt.claims', true)::json->>'shop_id', '')
)
WITH CHECK (
  shop_id::text = nullif(current_setting('request.jwt.claims', true)::json->>'shop_id', '')
);

-- 3. Table ORDERS
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.orders FROM public;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Isolation des commandes (Lecture)" ON public.orders;
CREATE POLICY "Isolation des commandes (Lecture)"
ON public.orders
FOR SELECT
USING (
  shop_id::text = nullif(current_setting('request.jwt.claims', true)::json->>'shop_id', '')
);

DROP POLICY IF EXISTS "Isolation des commandes (Ecriture)" ON public.orders;
CREATE POLICY "Isolation des commandes (Ecriture)"
ON public.orders
FOR ALL
USING (
  shop_id::text = nullif(current_setting('request.jwt.claims', true)::json->>'shop_id', '')
)
WITH CHECK (
  shop_id::text = nullif(current_setting('request.jwt.claims', true)::json->>'shop_id', '')
);
