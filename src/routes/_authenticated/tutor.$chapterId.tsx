import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy tutor URL — the chapter hub now owns tutoring. */
export const Route = createFileRoute("/_authenticated/tutor/$chapterId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/chapter/$chapterId", params: { chapterId: params.chapterId } });
  },
});
