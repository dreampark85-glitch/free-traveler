import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionResult =
  { ok: true; user: User } | { ok: false; response: Response };

function json(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

/** 요청의 세션 쿠키로 현재 사용자를 확인한다. 로그인하지 않았으면 null. */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  // getUser는 Auth 서버에 토큰을 검증하므로 쿠키 값만 믿는 getSession보다 안전하다.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * 동행 쓰기 API 진입 전 서버 세션 검증.
 * - 비회원: 401
 * - 이메일 인증을 마치지 않은 계정: 403 (쓰기 권한 없음)
 * 통과하면 `{ ok: true, user }`를 돌려주고, 아니면 그대로 반환할 수 있는 Response를 돌려준다.
 */
export async function requireVerifiedUser(): Promise<SessionResult> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      response: json(401, "UNAUTHENTICATED", "로그인이 필요해요."),
    };
  }
  if (!user.email_confirmed_at) {
    return {
      ok: false,
      response: json(
        403,
        "EMAIL_NOT_VERIFIED",
        "이메일 인증을 마친 뒤 이용할 수 있어요.",
      ),
    };
  }
  return { ok: true, user };
}
