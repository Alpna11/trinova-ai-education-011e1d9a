-- ============ classes ============
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  board_id uuid REFERENCES public.boards(id) ON DELETE SET NULL,
  grade_level_id uuid REFERENCES public.grade_levels(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  join_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher manage own classes" ON public.classes FOR ALL TO authenticated
  USING (auth.uid() = teacher_id AND (private.has_role(auth.uid(),'teacher') OR private.has_role(auth.uid(),'admin')))
  WITH CHECK (auth.uid() = teacher_id AND (private.has_role(auth.uid(),'teacher') OR private.has_role(auth.uid(),'admin')));
CREATE POLICY "students read classes" ON public.classes FOR SELECT TO authenticated USING (true);

CREATE TRIGGER classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ enrollments ============
CREATE TABLE public.class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_enrollments TO authenticated;
GRANT ALL ON public.class_enrollments TO service_role;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own enrollment" ON public.class_enrollments FOR ALL TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "teacher manage roster" ON public.class_enrollments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid()));

-- helper: enrollment check (private schema, not API-exposed)
CREATE OR REPLACE FUNCTION private.is_enrolled(_user_id uuid, _class_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.class_enrollments e WHERE e.class_id = _class_id AND e.student_id = _user_id)
$$;

-- ============ study materials ============
CREATE TABLE public.study_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  board_id uuid REFERENCES public.boards(id) ON DELETE SET NULL,
  grade_level_id uuid REFERENCES public.grade_levels(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  topic text,
  title text NOT NULL,
  description text,
  body text,
  file_url text,
  file_type text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_materials TO authenticated;
GRANT ALL ON public.study_materials TO service_role;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher manage own materials" ON public.study_materials FOR ALL TO authenticated
  USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "students read published materials" ON public.study_materials FOR SELECT TO authenticated
  USING (published AND (class_id IS NULL OR private.is_enrolled(auth.uid(), class_id)));
CREATE TRIGGER study_materials_updated_at BEFORE UPDATE ON public.study_materials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ question bank ============
CREATE TABLE public.question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  board_id uuid REFERENCES public.boards(id) ON DELETE SET NULL,
  grade_level_id uuid REFERENCES public.grade_levels(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  topic text,
  difficulty text NOT NULL DEFAULT 'medium',
  kind text NOT NULL DEFAULT 'mcq',
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text,
  explanation text,
  marks integer NOT NULL DEFAULT 1,
  source text NOT NULL DEFAULT 'manual',
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_bank TO authenticated;
GRANT ALL ON public.question_bank TO service_role;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher manage own bank" ON public.question_bank FOR ALL TO authenticated
  USING (auth.uid() = teacher_id AND (private.has_role(auth.uid(),'teacher') OR private.has_role(auth.uid(),'admin')))
  WITH CHECK (auth.uid() = teacher_id AND (private.has_role(auth.uid(),'teacher') OR private.has_role(auth.uid(),'admin')));
CREATE TRIGGER question_bank_updated_at BEFORE UPDATE ON public.question_bank FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ teacher quizzes ============
CREATE TABLE public.teacher_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  title text NOT NULL,
  instructions text,
  time_limit_minutes integer NOT NULL DEFAULT 15,
  total_marks integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_quizzes TO authenticated;
GRANT ALL ON public.teacher_quizzes TO service_role;
ALTER TABLE public.teacher_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher manage own quizzes" ON public.teacher_quizzes FOR ALL TO authenticated
  USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "students read published quizzes" ON public.teacher_quizzes FOR SELECT TO authenticated
  USING (published AND (class_id IS NULL OR private.is_enrolled(auth.uid(), class_id)));
CREATE TRIGGER teacher_quizzes_updated_at BEFORE UPDATE ON public.teacher_quizzes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.teacher_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.teacher_quizzes(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'mcq',
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text,
  explanation text,
  marks integer NOT NULL DEFAULT 1,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_quiz_questions TO authenticated;
GRANT ALL ON public.teacher_quiz_questions TO service_role;
ALTER TABLE public.teacher_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher manage own quiz questions" ON public.teacher_quiz_questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.teacher_quizzes q WHERE q.id = quiz_id AND q.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.teacher_quizzes q WHERE q.id = quiz_id AND q.teacher_id = auth.uid()));
CREATE POLICY "students read published quiz questions" ON public.teacher_quiz_questions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.teacher_quizzes q
    WHERE q.id = quiz_id AND q.published
      AND (q.class_id IS NULL OR private.is_enrolled(auth.uid(), q.class_id))
  ));

-- ============ quiz submissions ============
CREATE TABLE public.quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.teacher_quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score integer,
  total integer NOT NULL DEFAULT 0,
  weak_topics text[] NOT NULL DEFAULT '{}',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quiz_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_submissions TO authenticated;
GRANT ALL ON public.quiz_submissions TO service_role;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own quiz submissions" ON public.quiz_submissions FOR ALL TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "teacher read quiz submissions" ON public.quiz_submissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.teacher_quizzes q WHERE q.id = quiz_id AND q.teacher_id = auth.uid()));

-- ============ assignments ============
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  deadline timestamptz,
  max_marks integer NOT NULL DEFAULT 10,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher manage own assignments" ON public.assignments FOR ALL TO authenticated
  USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "students read published assignments" ON public.assignments FOR SELECT TO authenticated
  USING (published AND (class_id IS NULL OR private.is_enrolled(auth.uid(), class_id)));
CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text,
  file_url text,
  marks integer,
  feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_submissions TO authenticated;
GRANT ALL ON public.assignment_submissions TO service_role;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assignment submissions" ON public.assignment_submissions FOR ALL TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "teacher read assignment submissions" ON public.assignment_submissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND a.teacher_id = auth.uid()));
CREATE POLICY "teacher grade assignment submissions" ON public.assignment_submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND a.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND a.teacher_id = auth.uid()));
CREATE TRIGGER assignment_submissions_updated_at BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ announcements ============
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher manage own announcements" ON public.announcements FOR ALL TO authenticated
  USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "students read announcements" ON public.announcements FOR SELECT TO authenticated
  USING (published AND (class_id IS NULL OR private.is_enrolled(auth.uid(), class_id)));
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ teacher profiles ============
CREATE TABLE public.teacher_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  bio text,
  subjects text[] NOT NULL DEFAULT '{}',
  classes_taught text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_profiles TO authenticated;
GRANT ALL ON public.teacher_profiles TO service_role;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own teacher profile" ON public.teacher_profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "students read teacher profiles" ON public.teacher_profiles FOR SELECT TO authenticated USING (true);
CREATE TRIGGER teacher_profiles_updated_at BEFORE UPDATE ON public.teacher_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

REVOKE ALL ON FUNCTION private.is_enrolled(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_enrolled(uuid, uuid) TO authenticated, service_role;