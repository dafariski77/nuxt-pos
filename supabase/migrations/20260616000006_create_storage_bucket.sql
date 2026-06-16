-- Create the storage bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO NOTHING;

-- RLS for storage objects (bucket: product-images)
-- 1. Allow public to view images (Select)
CREATE POLICY "Public Access for product images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- 2. Allow authenticated users to upload images (Insert)
CREATE POLICY "Authenticated users can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- 3. Allow users to update their own uploaded images
CREATE POLICY "Users can update their uploaded images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'product-images' 
  AND auth.uid() = owner
);

-- 4. Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their uploaded images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'product-images' 
  AND auth.uid() = owner
);
