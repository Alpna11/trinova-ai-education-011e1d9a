CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('teacher','admin'));
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

DROP POLICY "staff manage boards" ON public.boards;
CREATE POLICY "staff manage boards" ON public.boards FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "staff manage grade_levels" ON public.grade_levels;
CREATE POLICY "staff manage grade_levels" ON public.grade_levels FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "staff manage subjects" ON public.subjects;
CREATE POLICY "staff manage subjects" ON public.subjects FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "staff manage chapters" ON public.chapters;
CREATE POLICY "staff manage chapters" ON public.chapters FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "own profile" ON public.profiles;
CREATE POLICY "own profile" ON public.profiles FOR SELECT TO authenticated
  USING ((auth.uid() = id) OR private.is_staff(auth.uid()));

DROP POLICY "staff read quizzes" ON public.quizzes;
CREATE POLICY "staff read quizzes" ON public.quizzes FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

DROP POLICY "staff read progress" ON public.chapter_progress;
CREATE POLICY "staff read progress" ON public.chapter_progress FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

DROP POLICY "teacher manage own notes" ON public.teacher_notes;
CREATE POLICY "teacher manage own notes" ON public.teacher_notes FOR ALL TO authenticated
  USING (auth.uid() = teacher_id AND (private.has_role(auth.uid(), 'teacher') OR private.has_role(auth.uid(), 'admin')))
  WITH CHECK (auth.uid() = teacher_id AND (private.has_role(auth.uid(), 'teacher') OR private.has_role(auth.uid(), 'admin')));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_staff(uuid);