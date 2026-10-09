import type { NextRequest } from "next/server";
import { requireVerifiedUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { blockSchema } from "@/lib/validation/report.schema";

function error(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

/** 내가 차단한 사용자 목록. RLS가 내 차단 기록만 돌려준다. */
export async function GET() {
  const session = await requireVerifiedUser();
  if (!session.ok) return session.response;

  const supabase = await createSupabaseServerClient();
  const { data, error: dbError } = await supabase
    .from("user_block")
    .select("blocked_id, created_at")
    .order("created_at", { ascending: false });
  if (dbError) {
    return error(500, "QUERY_FAILED", "차단 목록을 불러오지 못했어요.");
  }
  return Response.json({
    items: data.map((row) => ({
      blockedId: row.blocked_id,
      createdAt: row.created_at,
    })),
  });
}

/** 사용자 차단. 이미 차단한 사용자를 다시 차단해도 오류 없이 성공으로 본다. */
export async function POST(request: NextRequest) {
  const session = await requireVerifiedUser();
  if (!session.ok) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "INVALID_JSON", "요청 형식이 올바르지 않아요.");
  }
  const parsed = blockSchema.safeParse(body);
  if (!parsed.success) {
    return error(422, "VALIDATION_FAILED", "차단할 사용자를 확인해 주세요.");
  }
  if (parsed.data.blockedId === session.user.id) {
    return error(422, "SELF_BLOCK", "자기 자신은 차단할 수 없어요.");
  }

  const supabase = await createSupabaseServerClient();
  const { error: dbError } = await supabase.from("user_block").insert({
    blocker_id: session.user.id,
    blocked_id: parsed.data.blockedId,
  });
  if (dbError && dbError.code !== "23505") {
    if (dbError.code === "23503") {
      return error(404, "NOT_FOUND", "사용자를 찾을 수 없어요.");
    }
    return error(500, "BLOCK_FAILED", "차단하지 못했어요.");
  }
  return Response.json(
    { blockedId: parsed.data.blockedId, blocked: true },
    { status: dbError ? 200 : 201 },
  );
}
