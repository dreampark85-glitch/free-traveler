import type { NextRequest } from "next/server";
import { requireVerifiedUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { outboundLinkSchema } from "@/lib/validation/outbound-link.schema";

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
  return { ok: true as const, supabase, userId: session.user.id };
}

/** 현재 설정된 항공·숙소 외부 이동 주소. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { data, error: dbError } = await admin.supabase
    .from("outbound_link_setting")
    .select("link_key, url, updated_at");
  if (dbError) {
    return error(500, "QUERY_FAILED", "설정을 불러오지 못했어요.");
  }
  const find = (key: string) => data.find((row) => row.link_key === key);
  return Response.json({
    flight: find("FLIGHT")?.url ?? null,
    hotel: find("HOTEL")?.url ?? null,
  });
}

/** 항공 또는 숙소 주소 저장. HTTPS 주소만 저장할 수 있다(http, javascript, data 등은 거부). */
export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "INVALID_JSON", "요청 형식이 올바르지 않아요.");
  }
  const parsed = outboundLinkSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      422,
      "INVALID_URL",
      "https:// 로 시작하는 올바른 주소만 저장할 수 있어요.",
    );
  }

  const { error: dbError } = await admin.supabase
    .from("outbound_link_setting")
    .upsert(
      {
        link_key: parsed.data.linkKey,
        url: parsed.data.url,
        updated_by: admin.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "link_key" },
    );
  if (dbError) {
    return error(500, "SAVE_FAILED", "주소를 저장하지 못했어요.");
  }
  return Response.json({ linkKey: parsed.data.linkKey, url: parsed.data.url });
}
