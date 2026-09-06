ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS gallery_urls jsonb,
ADD COLUMN IF NOT EXISTS is_published_on_store boolean DEFAULT true;
