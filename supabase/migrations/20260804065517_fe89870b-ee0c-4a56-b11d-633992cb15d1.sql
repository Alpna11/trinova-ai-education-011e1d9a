DROP POLICY "Signed-in users can cache chapter content" ON public.chapter_content;
DROP POLICY "Signed-in users can refresh chapter content" ON public.chapter_content;
REVOKE INSERT, UPDATE ON public.chapter_content FROM authenticated;