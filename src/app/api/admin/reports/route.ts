import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireVerifiedUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reportStatusSchema } from "@/lib/validation/report.schema";

function error(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

/** 관리자만 통과한다. 비회원은 401, 관리자가 아니면 403. */
async function requireAdmin() {
  const session = await requireVerifiedUser();
  if (!session.ok) return { ok: false as const, response: session.response };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_profile")
    .select("role, status")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (data?.role !== "ADMIN" || data.status !== "ACTIVE") {
    return {
      ok: false as const,
      response: error(403, "FORBIDDEN", "관리자만 사용할 수 있어요."),
    };
  }
  return { ok: true as const, supabase };
}

const listQuerySchema = z.object({
  status: z.enum(["OPEN", "RESOLVED", "DISMISSED"]).optional(),
});

/** 신고 목록. 상태(OPEN/RESOLVED/DISMISSED)로만 거른다. 우선순위·증거 기능은 없다. */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return error(400, "INVALID_QUERY", "상태 값이 올바르지 않아요.");
  }

  let query = admin.supabase
    .from("report")
    .select(
      "report_id, target_type, target_id, reason_code, description, status, created_at, resolved_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (parsed.data.status) query = query.eq("status", parsed.data.status);

  const { data, error: dbError } = await query;
  if (dbError) {
    return error(500, "QUERY_FAILED", "신고 목록을 불러오지 못했어요.");
  }
  return Response.json({
    items: data.map((row) => ({
      id: row.report_id,
      targetType: row.target_type,
      targetId: row.target_id,
      reasonCode: row.reason_code,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
    })),
  });
}

/** 신고 상태 변경. 처리 완료·기각이면 처리 시각을 기록하고, 다시 접수로 돌리면 지운다. */
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "INVALID_JSON", "요청 형식이 올바르지 않아요.");
  }
  const parsed = reportStatusSchema.safeParse(body);
  if (!parsed.success) {
    return error(422, "VALIDATION_FAILED", "신고와 상태를 확인해 주세요.");
  }

  const { data, error: dbError } = await admin.supabase
    .from("report")
    .update({
      status: parsed.data.status,
      resolved_at:
        parsed.data.status === "OPEN" ? null : new Date().toISOString(),
    })
    .eq("report_id", parsed.data.reportId)
    .select("report_id, status, resolved_at")
    .maybeSingle();
  if (dbError) {
    return error(500, "UPDATE_FAILED", "상태를 바꾸지 못했어요.");
  }
  if (!data) return error(404, "NOT_FOUND", "신고를 찾을 수 없어요.");
  return Response.json({
    id: data.report_id,
    status: data.status,
    resolvedAt: data.resolved_at,
  });
}
