-- Migration: Ajout colonne onboarding_completed sur profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Met à jour les profils qui ont déjà une boutique comme "onboarding complété"
UPDATE public.profiles 
SET onboarding_completed = true 
WHERE shop_id IS NOT NULL;
