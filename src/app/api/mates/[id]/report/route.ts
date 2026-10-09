import type { NextRequest } from "next/server";
import { requireVerifiedUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common.schema";
import { reportSchema } from "@/lib/validation/report.schema";

function error(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

/** 동행 글 신고. 사유 코드와 설명을 받고 접수 ID와 접수 시각을 바로 돌려준다. */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/mates/[id]/report">,
) {
  const session = await requireVerifiedUser();
  if (!session.ok) return session.response;

  const idResult = uuidSchema.safeParse((await ctx.params).id);
  if (!idResult.success) {
    return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "INVALID_JSON", "요청 형식이 올바르지 않아요.");
  }
  const fields =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const parsed = reportSchema.safeParse({
    targetType: "POST",
    targetId: idResult.data,
    reasonCode: fields.reasonCode,
    description: fields.description,
  });
  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "신고 내용을 확인해 주세요.",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
      },
      { status: 422 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: post } = await supabase
    .from("mate_post")
    .select("post_id")
    .eq("post_id", idResult.data)
    .maybeSingle();
  if (!post) return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");

  const { data, error: dbError } = await supabase
    .from("report")
    .insert({
      reporter_id: session.user.id,
      target_type: parsed.data.targetType,
      target_id: parsed.data.targetId,
      reason_code: parsed.data.reasonCode,
      description: parsed.data.description ?? null,
      status: "OPEN",
    })
    .select("report_id, created_at")
    .single();
  if (dbError) {
    return error(500, "REPORT_FAILED", "신고를 접수하지 못했어요.");
  }
  return Response.json(
    { reportId: data.report_id, receivedAt: data.created_at },
    { status: 201 },
  );
}
