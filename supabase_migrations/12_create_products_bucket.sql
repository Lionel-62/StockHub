-- Migration to create the products storage bucket and set it to public
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public access to files in the products bucket
CREATE POLICY "Public Access for products"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users to upload files
CREATE POLICY "Auth Upload for products"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their files
CREATE POLICY "Auth Update for products"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their files
CREATE POLICY "Auth Delete for products"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);
