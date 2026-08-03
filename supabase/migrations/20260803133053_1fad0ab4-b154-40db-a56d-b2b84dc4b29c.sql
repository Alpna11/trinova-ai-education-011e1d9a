CREATE POLICY "own uploads read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'question-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own uploads insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'question-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own uploads delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'question-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);