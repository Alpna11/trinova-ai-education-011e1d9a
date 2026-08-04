import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ChapterMaterialSchema, type MaterialPayload } from "./chapter.schemas";

/**
 * Loads AI-generated chapter material (notes / practice / previous-year questions /
 * resources) from the shared cache, generating and caching it on a miss.
 */
export const getChapterMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChapterMaterialSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { callGateway, parseJsonLoose } = await import("./tutor.server");
    const { materialPrompt } = await import("./chapter.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const lang = data.bilingual ? data.language : "English";

    const { data: chapter, error: chapterError } = await context.supabase
      .from("chapters")
      .select("id, name, summary, subjects(name, grade_levels(name, boards(name)))")
      .eq("id", data.chapterId)
      .maybeSingle();
    if (chapterError) throw new Error(chapterError.message);
    if (!chapter) throw new Error("Chapter not found.");

    const subject = chapter.subjects as unknown as {
      name: string;
      grade_levels: { name: string; boards: { name: string } | null } | null;
    } | null;
    const contextLine = [
      subject?.grade_levels?.boards?.name,
      subject?.grade_levels?.name,
      subject?.name,
      chapter.name,
    ]
      .filter(Boolean)
      .join(" • ");

    if (!data.refresh) {
      const { data: cached } = await supabaseAdmin
        .from("chapter_content")
        .select("content")
        .eq("chapter_id", data.chapterId)
        .eq("kind", data.kind)
        .eq("mode", data.mode)
        .eq("language", lang)
        .maybeSingle();
      if (cached?.content) {
        return { payload: cached.content as MaterialPayload, cached: true };
      }
    }

    const raw = await callGateway(
      [
        {
          role: "system",
          content: materialPrompt({
            kind: data.kind,
            mode: data.mode,
            language: data.language,
            bilingual: data.bilingual,
            context: `${contextLine}${chapter.summary ? `. ${chapter.summary}` : ""}`,
          }),
        },
        { role: "user", content: `Generate the ${data.kind} for: ${contextLine}` },
      ],
      { json: true, maxTokens: 4000 },
    );

    const payload = parseJsonLoose<MaterialPayload>(raw);

    await supabaseAdmin
      .from("chapter_content")
      .upsert(
        {
          chapter_id: data.chapterId,
          kind: data.kind,
          mode: data.mode,
          language: lang,
          content: payload as never,
        } as never,
        { onConflict: "chapter_id,kind,mode,language" },
      );

    return { payload, cached: false };
  });
