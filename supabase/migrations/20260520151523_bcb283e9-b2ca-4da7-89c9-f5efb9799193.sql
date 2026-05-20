
DROP POLICY IF EXISTS "Brochure PDFs are publicly readable" ON storage.objects;
CREATE POLICY "Brochure PDFs are publicly readable by name"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'brochure_pdfs'
  AND name IN (
    'brilliant-people-average-lives.pdf',
    'from-job-to-first-client-90-days.pdf'
  )
);
