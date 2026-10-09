import { requireVerifiedUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common.schema";

function error(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

/** 차단 해제. [id]는 차단한 상대 사용자의 ID이고, 내 차단 기록만 지울 수 있다. */
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/blocks/[id]">,
) {
  const session = await requireVerifiedUser();
  if (!session.ok) return session.response;

  const idResult = uuidSchema.safeParse((await ctx.params).id);
  if (!idResult.success) {
    return error(404, "NOT_FOUND", "차단 기록을 찾을 수 없어요.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error: dbError } = await supabase
    .from("user_block")
    .delete()
    .eq("blocker_id", session.user.id)
    .eq("blocked_id", idResult.data)
    .select("blocked_id");
  if (dbError) {
    return error(500, "UNBLOCK_FAILED", "차단을 해제하지 못했어요.");
  }
  if (data.length === 0) {
    return error(404, "NOT_FOUND", "차단 기록을 찾을 수 없어요.");
  }
  return new Response(null, { status: 204 });
}
