-- Ajouter la colonne category à la table shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS category TEXT;
