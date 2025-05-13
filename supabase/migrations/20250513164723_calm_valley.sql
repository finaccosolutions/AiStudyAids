/*
  # Create storage bucket for evaluations

  1. New Storage Bucket
    - Creates a new public storage bucket named 'evaluations'
    - Contains subdirectories for answer sheets and question papers
  
  2. Security
    - Enable RLS policies for the bucket
    - Add policies for authenticated users to:
      - Upload their own files
      - Read their own files
      - Delete their own files
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('evaluations', 'evaluations', false);

-- Create RLS policies for the bucket
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evaluations' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'evaluations' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'evaluations' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create folder structure
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES 
  ('evaluations', 'answer-sheets/', auth.uid(), '{"contentType": "application/x-directory"}'),
  ('evaluations', 'question-papers/', auth.uid(), '{"contentType": "application/x-directory"}');