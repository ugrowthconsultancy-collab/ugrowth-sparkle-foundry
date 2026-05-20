
-- Create public storage bucket for brochure PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('brochure_pdfs', 'brochure_pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read for brochure_pdfs
DROP POLICY IF EXISTS "Brochure PDFs are publicly readable" ON storage.objects;
CREATE POLICY "Brochure PDFs are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'brochure_pdfs');

-- Only admins can write/update/delete brochure PDFs
DROP POLICY IF EXISTS "Admins manage brochure PDFs" ON storage.objects;
CREATE POLICY "Admins manage brochure PDFs"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'brochure_pdfs' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'brochure_pdfs' AND public.is_admin(auth.uid()));
