import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireVerifiedUser } from "@/lib/auth/session";
import { deriveStatus, type MateStatus } from "@/lib/mate/deriveStatus";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  dateStringSchema,
  plainText,
  travelStylesSchema,
  uuidSchema,
} from "@/lib/validation/common.schema";

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

/** 허용 목록 필드만 직렬화한다. 이메일·전화번호는 조회도, 응답도 하지 않는다(REQ-FUNC-033). */
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

const patchSchema = z
  .object({
    title: plainText(2, 100).optional(),
    region: plainText(1, 60).optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    capacity: z.number().int().min(1).max(10).optional(),
    travelStyles: travelStylesSchema.min(1).optional(),
    description: plainText(1, 3000).optional(),
    /** 작성자가 직접 모집을 마감하거나 다시 연다. */
    status: z.enum(["OPEN", "CLOSED"]).optional(),
    /** 승인된 참가 요청이 있는 글을 고칠 때 경고를 확인했다는 표시 */
    confirmAcceptedRequests: z.boolean().optional(),
  })
  .refine((v) => !(v.startDate && v.endDate) || v.endDate >= v.startDate, {
    path: ["endDate"],
    message: "종료일은 시작일보다 빠를 수 없어요.",
  });

async function parseId(ctx: RouteContext<"/api/mates/[id]">) {
  const { id } = await ctx.params;
  const parsed = uuidSchema.safeParse(id);
  return parsed.success ? parsed.data : null;
}

/** 동행 글 상세. 로그인하지 않아도 모집 중인 글은 볼 수 있다. */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/mates/[id]">,
) {
  const id = await parseId(ctx);
  if (!id) return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");

  const supabase = await createSupabaseServerClient();
  const { data, error: dbError } = await supabase
    .from("mate_post")
    .select(SELECT)
    .eq("post_id", id)
    .maybeSingle();
  if (dbError) {
    return error(500, "QUERY_FAILED", "동행 글을 불러오지 못했어요.");
  }
  if (!data) return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");
  return Response.json(serialize(data as unknown as PostRow));
}

/** 작성자만 수정·마감할 수 있다. */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/mates/[id]">,
) {
  const session = await requireVerifiedUser();
  if (!session.ok) return session.response;

  const id = await parseId(ctx);
  if (!id) return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "INVALID_JSON", "요청 형식이 올바르지 않아요.");
  }
  const parsed = patchSchema.safeParse(body);
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
  const { data: post } = await supabase
    .from("mate_post")
    .select("post_id, owner_id, start_date, end_date")
    .eq("post_id", id)
    .maybeSingle();
  if (!post) return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");
  if (post.owner_id !== session.user.id) {
    return error(403, "FORBIDDEN", "작성자만 수정할 수 있어요.");
  }

  // 시작일·종료일 중 하나만 바뀌어도 합쳐서 역전되지 않는지 확인한다.
  const start = input.startDate ?? post.start_date;
  const end = input.endDate ?? post.end_date;
  if (end < start) {
    return error(
      422,
      "VALIDATION_FAILED",
      "종료일은 시작일보다 빠를 수 없어요.",
    );
  }

  // 승인된 참가 요청이 있으면 확인을 받은 뒤에만 고친다(REQ-FUNC-038).
  const { count } = await supabase
    .from("mate_application")
    .select("application_id", { count: "exact", head: true })
    .eq("post_id", id)
    .eq("status", "ACCEPTED");
  if ((count ?? 0) > 0 && !input.confirmAcceptedRequests) {
    return error(
      409,
      "ACCEPTED_REQUESTS_EXIST",
      "승인된 참가 요청이 있어요. 수정하면 참가자에게 영향이 있을 수 있어요.",
    );
  }

  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.region !== undefined) update.region = input.region;
  if (input.startDate !== undefined) update.start_date = input.startDate;
  if (input.endDate !== undefined) update.end_date = input.endDate;
  if (input.capacity !== undefined) update.capacity = input.capacity;
  if (input.travelStyles !== undefined) {
    update.travel_styles = input.travelStyles;
  }
  if (input.description !== undefined) update.description = input.description;
  if (input.status !== undefined) update.status = input.status;
  if (Object.keys(update).length === 0) {
    return error(400, "NOTHING_TO_UPDATE", "바꿀 내용이 없어요.");
  }

  const { data, error: dbError } = await supabase
    .from("mate_post")
    .update(update)
    .eq("post_id", id)
    .select(SELECT)
    .single();
  if (dbError) {
    return error(500, "UPDATE_FAILED", "동행 글을 수정하지 못했어요.");
  }
  return Response.json(serialize(data as unknown as PostRow));
}

/** 작성자만 삭제할 수 있다. 데이터는 지우지 않고 상태를 DELETED로 바꾼다. */
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/mates/[id]">,
) {
  const session = await requireVerifiedUser();
  if (!session.ok) return session.response;

  const id = await parseId(ctx);
  if (!id) return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");

  const supabase = await createSupabaseServerClient();
  const { data: post } = await supabase
    .from("mate_post")
    .select("post_id, owner_id")
    .eq("post_id", id)
    .maybeSingle();
  if (!post) return error(404, "NOT_FOUND", "동행 글을 찾을 수 없어요.");
  if (post.owner_id !== session.user.id) {
    return error(403, "FORBIDDEN", "작성자만 삭제할 수 있어요.");
  }

  const { error: dbError } = await supabase
    .from("mate_post")
    .update({ status: "DELETED" })
    .eq("post_id", id);
  if (dbError) {
    return error(500, "DELETE_FAILED", "동행 글을 삭제하지 못했어요.");
  }
  return new Response(null, { status: 204 });
}
