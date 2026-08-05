-- Immutable source and parse history for evidence-driven candidate intelligence.
-- Existing records remain readable; records without an artifact are marked as
-- legacy and can be reprocessed after a one-time source upload.

ALTER TABLE public.rec_candidates
  ADD COLUMN IF NOT EXISTS intelligence_artifact jsonb,
  ADD COLUMN IF NOT EXISTS parser_versions jsonb,
  ADD COLUMN IF NOT EXISTS parser_updated_at timestamptz;

CREATE TABLE IF NOT EXISTS public.rec_candidate_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.rec_candidates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_bucket text NOT NULL DEFAULT 'candidate-documents',
  storage_path text,
  original_file_name text NOT NULL,
  mime_type text NOT NULL,
  native_text text,
  ocr_output text,
  layout_graph jsonb,
  knowledge_graph jsonb,
  parser_versions jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, storage_path)
);

CREATE TABLE IF NOT EXISTS public.rec_candidate_parse_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.rec_candidates(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.rec_candidate_documents(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parser_versions jsonb NOT NULL,
  knowledge_graph jsonb,
  validation_result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rec_candidate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rec_candidate_parse_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rec_candidate_documents_user_all" ON public.rec_candidate_documents;
CREATE POLICY "rec_candidate_documents_user_all" ON public.rec_candidate_documents
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "rec_candidate_parse_versions_user_all" ON public.rec_candidate_parse_versions;
CREATE POLICY "rec_candidate_parse_versions_user_all" ON public.rec_candidate_parse_versions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_rec_candidate_documents_candidate ON public.rec_candidate_documents(candidate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rec_candidate_parse_versions_candidate ON public.rec_candidate_parse_versions(candidate_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-documents', 'candidate-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "candidate_documents_user_read" ON storage.objects;
CREATE POLICY "candidate_documents_user_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'candidate-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "candidate_documents_user_insert" ON storage.objects;
CREATE POLICY "candidate_documents_user_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'candidate-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
