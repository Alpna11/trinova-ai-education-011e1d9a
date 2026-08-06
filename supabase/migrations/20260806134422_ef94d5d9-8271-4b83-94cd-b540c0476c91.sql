-- 1. Never trust client-supplied role at signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, second_language)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name',
          COALESCE(NEW.raw_user_meta_data->>'second_language','Hindi'))
  ON CONFLICT (id) DO NOTHING;

  -- Roles are never taken from client-controlled metadata.
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $function$;

-- 2. Trigger/definer functions must not be callable from the Data API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 3. Explicit owner-scoped UPDATE policy for question-uploads
DROP POLICY IF EXISTS "question uploads update own" ON storage.objects;
CREATE POLICY "question uploads update own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'question-uploads' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'question-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Teacher notes: explicit current-role check on every operation
DROP POLICY IF EXISTS "teacher manage own notes" ON public.teacher_notes;
CREATE POLICY "teacher manage own notes"
ON public.teacher_notes FOR ALL TO authenticated
USING (
  auth.uid() = teacher_id
  AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
)
WITH CHECK (
  auth.uid() = teacher_id
  AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
);