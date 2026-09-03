-- ==============================================================================
-- FONCTION DE CONNEXION SÉCURISÉE (Bypass RLS pour la vérification du PIN)
-- ==============================================================================

-- Comme nous avons activé la sécurité RLS, un utilisateur non connecté ne peut plus 
-- lire la table "profiles". Pour permettre la connexion par Code PIN, nous devons
-- créer une fonction spéciale (SECURITY DEFINER) qui a le droit de vérifier le PIN.

CREATE OR REPLACE FUNCTION public.verify_pin_login(p_identifier TEXT, p_pin_code TEXT)
RETURNS TABLE (
    id TEXT,
    name TEXT,
    identifier TEXT,
    role TEXT,
    permissions JSONB,
    shop_id UUID,
    shop_slug TEXT,
    shop_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Permet à la fonction de contourner les règles RLS
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, 
        p.name, 
        p.identifier, 
        p.role, 
        p.permissions::jsonb, 
        p.shop_id, 
        s.slug AS shop_slug, 
        s.name AS shop_name
    FROM public.profiles p
    LEFT JOIN public.shops s ON s.id = p.shop_id
    WHERE p.identifier = p_identifier 
      AND p.pin_code = p_pin_code
    LIMIT 1;
END;
$$;
