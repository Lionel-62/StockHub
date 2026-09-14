-- ==============================================================================
-- MIGRATION 18 : Afficher le vrai stock sur la vitrine publique
-- ==============================================================================

-- Remplacer la vue publique pour retourner la vraie valeur de 'stock'
-- au lieu de l'ancienne valeur masquée '999'.

CREATE OR REPLACE VIEW public.public_store_products AS
SELECT 
    id,
    created_at,
    shop_id,
    name,
    description,
    category,
    sale_price,
    promotional_price,
    image_url,
    gallery_urls,
    pack_offers,
    is_published_on_store,
    status,
    stock -- On affiche désormais la vraie valeur en stock
FROM public.products
WHERE is_published_on_store = true;
