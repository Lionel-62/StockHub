-- ==============================================================================
-- MIGRATION 04 : Automatisation (Trigger) à l'inscription (Supabase Auth)
-- ==============================================================================

-- 1. Fonction qui sera appelée par le Trigger à chaque nouvelle inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_shop_id UUID;
    slug_base TEXT;
    generated_slug TEXT;
BEGIN
    -- a. Création automatique de la boutique
    -- On génère un slug basique basé sur le nom ou l'ID
    slug_base := COALESCE(
        regexp_replace(lower(new.raw_user_meta_data->>'full_name'), '[^a-z0-9]+', '-', 'g'), 
        'boutique-' || substr(new.id::text, 1, 8)
    );
    
    -- Pour s'assurer de l'unicité du slug (version simple)
    generated_slug := slug_base || '-' || substr(new.id::text, 1, 4);

    INSERT INTO public.shops (name, slug, is_active)
    VALUES (
        COALESCE(new.raw_user_meta_data->>'full_name', 'Ma Boutique'), 
        generated_slug, 
        true
    )
    RETURNING id INTO new_shop_id;

    -- b. Création automatique du profil rattaché à la boutique
    INSERT INTO public.profiles (id, name, identifier, role, shop_id, permissions)
    VALUES (
        new.id, -- L'ID du profil est le même que l'ID auth.users
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        COALESCE(new.email, new.phone),
        'owner',
        new_shop_id,
        '{"canViewDashboard": true}'::jsonb
    );

    RETURN NEW;
END;
$$;

-- 2. Création du Trigger sur la table auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
