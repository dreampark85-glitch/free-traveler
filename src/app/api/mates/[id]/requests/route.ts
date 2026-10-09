import type { NextRequest } from "next/server";
import { requireVerifiedUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common.schema";
import { mateApplicationSchema } from "@/lib/validation/mate.schema";

function error(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

async function parseId(ctx: RouteContext<"/api/mates/[id]/requests">) {
  const { id } = await ctx.params;
  const parsed = uuidSchema.safeParse(id);
  return parsed.success ? parsed.data : null;
}

/** 참가 요청 보내기. 메시지는 500자 이하이고 PENDING 상태로 저장된다. */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/mates/[id]/requests">,
) {
  const session = await requireVerifiedUser();
  if (!session.ok) return session.response;

  const postId = await parseId(ctx);
  if (!postId) return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "INVALID_JSON", "요청 형식이 올바르지 않아요.");
  }
  const message =
    typeof body === "object" && body !== null && "message" in body
      ? (body as { message: unknown }).message
      : undefined;
  const parsed = mateApplicationSchema.safeParse({ postId, message });
  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "입력 내용을 확인해 주세요.",
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
  const { data, error: dbError } = await supabase
    .from("mate_application")
    .insert({
      post_id: parsed.data.postId,
      applicant_id: session.user.id,
      message: parsed.data.message,
      status: "PENDING",
    })
    .select("application_id, post_id, status, created_at")
    .single();

  if (dbError) {
    // 같은 글에 진행 중(PENDING/ACCEPTED) 요청이 이미 있으면 DB UNIQUE 제약이 막는다.
    if (dbError.code === "23505") {
      return error(
        409,
        "DUPLICATE_REQUEST",
        "이미 이 글에 참가 요청을 보냈어요.",
      );
    }
    if (dbError.code === "23503") {
      return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");
    }
    if (dbError.code === "42501") {
      return error(
        403,
        "FORBIDDEN",
        "이 글에는 참가 요청을 보낼 수 없어요. 성인 확인, 본인 글 여부, 모집 상태, 차단 관계를 확인해 주세요.",
      );
    }
    return error(500, "CREATE_FAILED", "참가 요청을 보내지 못했어요.");
  }

  return Response.json(
    {
      id: data.application_id,
      postId: data.post_id,
      status: data.status,
      createdAt: data.created_at,
    },
    { status: 201 },
  );
}

/**
 * 이 글의 참가 요청 목록. 글 작성자는 전체를, 요청자는 자신의 요청만 본다
 * (그 구분은 RLS가 한다). 요청자 정보는 닉네임과 여행 스타일만 내려준다.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/mates/[id]/requests">,
) {
  const session = await requireVerifiedUser();
  if (!session.ok) return session.response;

  const postId = await parseId(ctx);
  if (!postId) return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");

  const supabase = await createSupabaseServerClient();
  const { data, error: dbError } = await supabase
    .from("mate_application")
    .select(
      "application_id, post_id, applicant_id, message, status, created_at, applicant:user_profile!applicant_id(nickname, travel_styles)",
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (dbError) {
    return error(500, "QUERY_FAILED", "참가 요청을 불러오지 못했어요.");
  }

  type Row = {
    application_id: string;
    post_id: string;
    applicant_id: string;
    message: string;
    status: string;
    created_at: string;
    applicant: { nickname: string; travel_styles: string[] } | null;
  };
  return Response.json({
    items: (data as unknown as Row[]).map((row) => ({
      id: row.application_id,
      postId: row.post_id,
      applicantId: row.applicant_id,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
      applicant: row.applicant
        ? {
            nickname: row.applicant.nickname,
            travelStyles: row.applicant.travel_styles,
          }
        : null,
    })),
  });
}
