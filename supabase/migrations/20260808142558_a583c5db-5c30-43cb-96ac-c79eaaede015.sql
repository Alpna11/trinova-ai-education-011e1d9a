CREATE POLICY "teacher materials read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'teacher-materials');
CREATE POLICY "teacher materials insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'teacher-materials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "teacher materials update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'teacher-materials' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'teacher-materials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "teacher materials delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'teacher-materials' AND (storage.foldername(name))[1] = auth.uid()::text);