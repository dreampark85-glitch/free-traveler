import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

/** 같은 사이트 안의 경로만 허용한다(open redirect 방지). */
function safeNextPath(value: string | null): string {
  if (!value) return "/account";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/account";
  }
  return value;
}

/**
 * Supabase 이메일 인증·비밀번호 재설정 링크가 돌아오는 주소.
 * - `code`: PKCE 코드를 세션으로 교환한다.
 * - `token_hash` + `type`: 이메일 OTP를 검증한다.
 * 성공하면 `next`(같은 사이트 경로)로, 실패하면 오류 표시와 함께 /account로 보낸다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createSupabaseServerClient();
  let failed = true;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
  } else if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    failed = Boolean(error);
  }

  if (failed) {
    return NextResponse.redirect(new URL("/account?auth_error=1", origin));
  }
  return NextResponse.redirect(new URL(next, origin));
}
