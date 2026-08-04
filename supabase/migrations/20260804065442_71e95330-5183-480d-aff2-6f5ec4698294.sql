-- 1. Cache table for AI-generated chapter material
CREATE TABLE public.chapter_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('notes','practice','pyq','resources')),
  mode text NOT NULL DEFAULT 'standard',
  language text NOT NULL DEFAULT 'English',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chapter_id, kind, mode, language)
);

GRANT SELECT, INSERT, UPDATE ON public.chapter_content TO authenticated;
GRANT ALL ON public.chapter_content TO service_role;

ALTER TABLE public.chapter_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can read chapter content"
  ON public.chapter_content FOR SELECT TO authenticated USING (true);

CREATE POLICY "Signed-in users can cache chapter content"
  ON public.chapter_content FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Signed-in users can refresh chapter content"
  ON public.chapter_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER chapter_content_updated_at
  BEFORE UPDATE ON public.chapter_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Seed boards
INSERT INTO public.boards (name, description) VALUES
  ('CBSE', 'Central Board of Secondary Education'),
  ('ICSE', 'Indian Certificate of Secondary Education');

-- 3. Seed classes for each board
INSERT INTO public.grade_levels (board_id, name, position)
SELECT b.id, g.name, g.position
FROM public.boards b
CROSS JOIN (VALUES ('Class 9', 9), ('Class 10', 10)) AS g(name, position);

-- 4. Seed subjects for each class
INSERT INTO public.subjects (grade_level_id, name, position)
SELECT gl.id, s.name, s.position
FROM public.grade_levels gl
CROSS JOIN (VALUES
  ('Mathematics', 1),
  ('Science', 2),
  ('Social Science', 3),
  ('English', 4)
) AS s(name, position);

-- 5. Seed chapters per class + subject
INSERT INTO public.chapters (subject_id, name, summary, position)
SELECT s.id, c.chapter, c.summary, c.position
FROM public.subjects s
JOIN public.grade_levels gl ON gl.id = s.grade_level_id
JOIN (VALUES
  ('Class 9','Mathematics','Number Systems','Rational and irrational numbers, real numbers on the number line, laws of exponents.',1),
  ('Class 9','Mathematics','Polynomials','Degrees, zeroes, remainder and factor theorems, algebraic identities.',2),
  ('Class 9','Mathematics','Coordinate Geometry','Cartesian plane, plotting points, quadrants and axes.',3),
  ('Class 9','Mathematics','Linear Equations in Two Variables','Solutions, graphs of linear equations and their interpretation.',4),
  ('Class 9','Mathematics','Triangles','Congruence criteria, inequalities in triangles and proofs.',5),
  ('Class 9','Science','Matter in Our Surroundings','States of matter, evaporation, latent heat and change of state.',1),
  ('Class 9','Science','Atoms and Molecules','Laws of chemical combination, mole concept, atomic and molecular masses.',2),
  ('Class 9','Science','The Fundamental Unit of Life','Cell structure, organelles, plasma membrane and osmosis.',3),
  ('Class 9','Science','Motion','Distance, displacement, velocity, acceleration and graphs of motion.',4),
  ('Class 9','Science','Gravitation','Universal law of gravitation, free fall, mass, weight and buoyancy.',5),
  ('Class 9','Social Science','The French Revolution','Causes, events, rise of Napoleon and the legacy of the revolution.',1),
  ('Class 9','Social Science','India: Size and Location','Location, latitudinal extent, neighbours and standard meridian.',2),
  ('Class 9','Social Science','What is Democracy? Why Democracy?','Features of democracy, arguments for and against, broader meanings.',3),
  ('Class 9','Social Science','The Story of Village Palampur','Farming, factors of production, non-farm activities in a village economy.',4),
  ('Class 9','Social Science','Drainage','River systems of India, Himalayan and peninsular rivers, lakes.',5),
  ('Class 9','English','The Fun They Had','A futuristic story contrasting mechanical teachers with real schools.',1),
  ('Class 9','English','The Sound of Music','Stories of Evelyn Glennie and Bismillah Khan and their music.',2),
  ('Class 9','English','The Little Girl','A daughter''s changing view of her stern father.',3),
  ('Class 9','English','Writing Skills: Diary and Story','Formats and marking scheme for diary entries and story writing.',4),
  ('Class 9','English','Grammar: Tenses and Modals','Using tenses accurately and modals for advice, obligation and possibility.',5),
  ('Class 10','Mathematics','Real Numbers','Euclid''s division lemma, fundamental theorem of arithmetic, irrationality proofs.',1),
  ('Class 10','Mathematics','Polynomials','Zeroes and coefficients, division algorithm for polynomials.',2),
  ('Class 10','Mathematics','Pair of Linear Equations in Two Variables','Graphical and algebraic methods, consistency of systems.',3),
  ('Class 10','Mathematics','Quadratic Equations','Roots, discriminant, nature of roots and word problems.',4),
  ('Class 10','Mathematics','Introduction to Trigonometry','Trigonometric ratios, identities and standard angles.',5),
  ('Class 10','Science','Chemical Reactions and Equations','Balancing equations, types of reactions, corrosion and rancidity.',1),
  ('Class 10','Science','Acids, Bases and Salts','pH scale, indicators, neutralisation and important salts.',2),
  ('Class 10','Science','Life Processes','Nutrition, respiration, transport and excretion in living organisms.',3),
  ('Class 10','Science','Light: Reflection and Refraction','Mirrors, lenses, mirror and lens formulae, refractive index.',4),
  ('Class 10','Science','Electricity','Current, potential difference, Ohm''s law, resistance and heating effect.',5),
  ('Class 10','Social Science','The Rise of Nationalism in Europe','Unification movements, nationalism and the making of nation-states.',1),
  ('Class 10','Social Science','Resources and Development','Types of resources, land use, soil types and conservation.',2),
  ('Class 10','Social Science','Power Sharing','Forms of power sharing and why it matters in a democracy.',3),
  ('Class 10','Social Science','Development','Income and other criteria, comparing states, sustainability.',4),
  ('Class 10','Social Science','Water Resources','Scarcity, multi-purpose projects, dams and rainwater harvesting.',5),
  ('Class 10','English','A Letter to God','Lencho''s unshakable faith and the irony of the postmaster''s help.',1),
  ('Class 10','English','Nelson Mandela: Long Walk to Freedom','Apartheid, freedom and the meaning of courage.',2),
  ('Class 10','English','Two Stories about Flying','His First Flight and The Black Aeroplane — courage and mystery.',3),
  ('Class 10','English','Writing Skills: Letter and Analytical Paragraph','Formal letter formats and writing analytical paragraphs from data.',4),
  ('Class 10','English','Grammar: Reported Speech and Determiners','Converting speech and using determiners correctly.',5)
) AS c(grade, subject, chapter, summary, position)
  ON c.grade = gl.name AND c.subject = s.name;