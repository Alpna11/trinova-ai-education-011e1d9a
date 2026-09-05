DROP POLICY IF EXISTS "students read classes" ON public.classes;
CREATE POLICY "enrolled students and owner read classes"
ON public.classes FOR SELECT TO authenticated
USING (
  teacher_id = auth.uid()
  OR private.is_enrolled(auth.uid(), id)
);

DROP POLICY IF EXISTS "teacher materials read" ON storage.objects;
CREATE POLICY "teacher materials scoped read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'teacher-materials'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM public.study_materials sm
      WHERE sm.published
        AND sm.file_url IS NOT NULL
        AND sm.file_url LIKE '%' || storage.objects.name
        AND (sm.class_id IS NULL OR private.is_enrolled(auth.uid(), sm.class_id))
    )
  )
);