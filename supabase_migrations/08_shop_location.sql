-- Migration: Ajout des informations de localisation de la boutique
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT;
