INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('chat-media', 'chat-media', true, 52428800, NULL),
  ('chat_attachments', 'chat_attachments', true, 52428800, NULL),
  ('media', 'media', true, 52428800, NULL),
  ('stories', 'stories', true, 52428800, NULL),
  ('screenshots', 'screenshots', true, 52428800, NULL),
  ('meeting-assets', 'meeting-assets', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access to Avatars') THEN
    CREATE POLICY "Public Access to Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload Avatars') THEN
    CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Update Avatars') THEN
    CREATE POLICY "Authenticated Update Avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Delete Avatars') THEN
    CREATE POLICY "Authenticated Delete Avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access to Chat Media') THEN
    CREATE POLICY "Public Access to Chat Media" ON storage.objects FOR SELECT USING (bucket_id = 'chat-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload Chat Media') THEN
    CREATE POLICY "Authenticated Upload Chat Media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-media' AND auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Update Chat Media') THEN
    CREATE POLICY "Authenticated Update Chat Media" ON storage.objects FOR UPDATE USING (bucket_id = 'chat-media' AND auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access to Chat Attachments') THEN
    CREATE POLICY "Public Access to Chat Attachments" ON storage.objects FOR SELECT USING (bucket_id = 'chat_attachments');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload Chat Attachments') THEN
    CREATE POLICY "Authenticated Upload Chat Attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat_attachments' AND auth.uid() IS NOT NULL);
  END IF;
END $$;
