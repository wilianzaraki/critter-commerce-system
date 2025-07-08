
-- Criar bucket para armazenar fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-photos', 'product-photos', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-photos', 'service-photos', true);

-- Políticas de acesso para os buckets
CREATE POLICY "Authenticated users can upload pet photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view pet photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'pet-photos');

CREATE POLICY "Authenticated users can upload product photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view product photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-photos');

CREATE POLICY "Authenticated users can upload service photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'service-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view service photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'service-photos');

CREATE POLICY "Authenticated users can delete pet photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete service photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'service-photos' AND auth.role() = 'authenticated');
