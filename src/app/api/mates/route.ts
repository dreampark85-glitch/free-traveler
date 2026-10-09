import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireVerifiedUser } from "@/lib/auth/session";
import { deriveStatus, type MateStatus } from "@/lib/mate/deriveStatus";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dateStringSchema, plainText } from "@/lib/validation/common.schema";
import { matePostSchema } from "@/lib/validation/mate.schema";

const SELECT =
  "post_id, owner_id, title, country_code, region, start_date, end_date, capacity, travel_styles, description, status, created_at, owner:user_profile!owner_id(nickname, is_adult)";

type PostRow = {
  post_id: string;
  owner_id: string;
  title: string;
  country_code: string;
  region: string | null;
  start_date: string;
  end_date: string;
  capacity: number;
  travel_styles: string[];
  description: string | null;
  status: MateStatus | "HIDDEN" | "DELETED";
  created_at: string;
  owner: { nickname: string; is_adult: boolean } | null;
};

/**
 * 응답에는 허용 목록의 필드만 담는다. 이메일·전화번호 같은 연락처 필드는
 * 조회하지도 않고 직렬화하지도 않는다(REQ-FUNC-033).
 */
function serialize(row: PostRow) {
  return {
    id: row.post_id,
    ownerId: row.owner_id,
    title: row.title,
    countryCode: row.country_code,
    region: row.region,
    startDate: row.start_date,
    endDate: row.end_date,
    capacity: row.capacity,
    travelStyles: row.travel_styles,
    description: row.description,
    status:
      row.status === "OPEN" || row.status === "CLOSED"
        ? deriveStatus({ status: row.status, endDate: row.end_date })
        : row.status,
    createdAt: row.created_at,
    owner: row.owner
      ? { nickname: row.owner.nickname, adultVerified: row.owner.is_adult }
      : null,
  };
}

function error(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

const listQuerySchema = z.object({
  country: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .optional(),
  style: plainText(1, 20).optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(8),
});

/** 모집 중인 동행 글 목록. 로그인하지 않아도 볼 수 있고, 차단 관계의 글은 RLS가 제외한다. */
export async function GET(request: NextRequest) {
  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return error(400, "INVALID_QUERY", "조회 조건이 올바르지 않아요.");
  }
  const { country, style, from, to, page, limit } = parsed.data;

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("mate_post")
    .select(SELECT, { count: "exact" })
    .eq("status", "OPEN")
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (country) query = query.eq("country_code", country);
  if (style) query = query.contains("travel_styles", [style]);
  // 기간 겹침: 글의 시작일 <= 조회 종료일, 글의 종료일 >= 조회 시작일
  if (to) query = query.lte("start_date", to);
  if (from) query = query.gte("end_date", from);

  const { data, error: dbError, count } = await query;
  if (dbError) {
    return error(500, "QUERY_FAILED", "동행 글을 불러오지 못했어요.");
  }
  return Response.json({
    items: (data as unknown as PostRow[]).map(serialize),
    page,
    limit,
    total: count ?? 0,
  });
}

/** 동행 글 작성. 세션이 없으면 401, 이메일 미인증이면 403, 성인 확인이 없으면 RLS가 403으로 막는다. */
export async function POST(request: NextRequest) {
  const session = await requireVerifiedUser();
  if (!session.ok) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "INVALID_JSON", "요청 형식이 올바르지 않아요.");
  }
  const parsed = matePostSchema.safeParse(body);
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
  const input = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error: dbError } = await supabase
    .from("mate_post")
    .insert({
      owner_id: session.user.id,
      title: input.title,
      country_code: input.countryCode,
      region: input.region ?? null,
      start_date: input.startDate,
      end_date: input.endDate,
      capacity: input.capacity,
      travel_styles: input.travelStyles,
      description: input.description,
      status: "OPEN",
      policy_version: input.policyVersion,
      policy_agreed_at: new Date().toISOString(),
    })
    .select(SELECT)
    .single();

  if (dbError) {
    if (dbError.code === "42501") {
      return error(
        403,
        "ADULT_REQUIRED",
        "성인 확인을 마친 계정만 동행 글을 쓸 수 있어요.",
      );
    }
    return error(500, "CREATE_FAILED", "동행 글을 저장하지 못했어요.");
  }
  return Response.json(serialize(data as unknown as PostRow), { status: 201 });
}
