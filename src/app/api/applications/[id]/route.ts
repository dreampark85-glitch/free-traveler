import type { NextRequest } from "next/server";
import { requireVerifiedUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common.schema";
import { applicationDecisionSchema } from "@/lib/validation/mate.schema";

function error(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

/** 글 작성자만 대기 중인 참가 요청을 승인(ACCEPTED)하거나 거절(REJECTED)한다. */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/applications/[id]">,
) {
  const session = await requireVerifiedUser();
  if (!session.ok) return session.response;

  const idResult = uuidSchema.safeParse((await ctx.params).id);
  if (!idResult.success) {
    return error(404, "NOT_FOUND", "참가 요청을 찾을 수 없어요.");
  }
  const id = idResult.data;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "INVALID_JSON", "요청 형식이 올바르지 않아요.");
  }
  const parsed = applicationDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      422,
      "VALIDATION_FAILED",
      "decision은 ACCEPTED 또는 REJECTED여야 해요.",
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: application } = await supabase
    .from("mate_application")
    .select("application_id, status, post:mate_post!post_id(owner_id)")
    .eq("application_id", id)
    .maybeSingle();
  if (!application) {
    return error(404, "NOT_FOUND", "참가 요청을 찾을 수 없어요.");
  }

  const post = application.post as unknown as { owner_id: string } | null;
  if (!post || post.owner_id !== session.user.id) {
    return error(403, "FORBIDDEN", "글 작성자만 요청을 처리할 수 있어요.");
  }
  if (application.status !== "PENDING") {
    return error(409, "ALREADY_DECIDED", "이미 처리된 요청이에요.");
  }

  const { data, error: dbError } = await supabase
    .from("mate_application")
    .update({ status: parsed.data.decision })
    .eq("application_id", id)
    .select("application_id, status")
    .single();
  if (dbError) {
    return error(500, "UPDATE_FAILED", "요청을 처리하지 못했어요.");
  }
  return Response.json({ id: data.application_id, status: data.status });
}
