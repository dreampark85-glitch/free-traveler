import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저(Client Component)용 Supabase 클라이언트.
 * 공개 anon 키만 사용하므로 항상 RLS가 적용된다. service role 키는 여기서 쓰지 않는다.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.",
    );
  }
  return createBrowserClient(url, anonKey);
}
