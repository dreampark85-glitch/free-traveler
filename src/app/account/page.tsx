import type { ReactNode } from "react";
import CtaBanner from "@/components/shared/CtaBanner";
import AdminPanel from "@/components/scr005/AdminPanel";
import AuthForms, { LogoutButton } from "@/components/scr005/AuthForms";
import MyActivity from "@/components/scr005/MyActivity";
import ProfileForm from "@/components/scr005/ProfileForm";
import RoleTabs, {
  type AccountRole,
  type AccountTab,
} from "@/components/scr005/RoleTabs";
import { getSessionUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = buildMetadata({
  title: "내 계정",
  description:
    "로그인하고 프로필과 내 동행 활동, 참가 요청을 관리하세요. 관리자는 신고와 외부 이동 주소를 관리할 수 있어요.",
  path: "/account",
});

/** 세션과 역할을 요청 시점에 읽는다. */
export const dynamic = "force-dynamic";

type Viewer = { role: AccountRole; userId: string | null };

/**
 * 서버에서 세션과 프로필의 role로 역할을 정한다.
 * - 로그인하지 않았거나 이메일 인증 전이면 GUEST
 * - 로그인하고 이메일 인증을 마쳤으면 MEMBER, 프로필 role이 ADMIN이면 ADMIN
 * Supabase에 연결할 수 없으면 GUEST로 취급한다. 데이터 접근은 어느 경우에도 RLS가 다시 막는다.
 */
async function loadViewer(): Promise<Viewer> {
  try {
    const user = await getSessionUser();
    if (!user || !user.email_confirmed_at)
      return { role: "GUEST", userId: null };
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("user_profile")
      .select("role, status")
      .eq("user_id", user.id)
      .maybeSingle();
    const admin = data?.role === "ADMIN" && data.status === "ACTIVE";
    return { role: admin ? "ADMIN" : "MEMBER", userId: user.id };
  } catch {
    return { role: "GUEST", userId: null };
  }
}

const GUEST_FEATURES = [
  "동행글 작성",
  "참가 요청 보내기",
  "내 활동 관리",
  "프로필·성인 확인",
] as const;

function Block({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-display-md text-ink">{title}</h2>
        {description ? (
          <p className="text-body-md text-body">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default async function AccountPage({
  searchParams,
}: PageProps<"/account">) {
  const { role, userId } = await loadViewer();
  const params = await searchParams;
  const authFailed = params.auth_error !== undefined;

  // 이 역할이 볼 수 있는 패널만 만든다. 역할에 없는 패널은 만들지도, 응답에 싣지도 않는다.
  const panels: Partial<Record<AccountTab, ReactNode>> = {};
  if (role === "GUEST") {
    panels.guest = (
      <div className="flex flex-col gap-10">
        <Block
          title="계정으로 할 수 있는 일"
          description="가입하고 로그인하면 동행 모집과 참가를 직접 관리할 수 있어요."
        >
          <ul className="flex flex-wrap gap-2">
            {GUEST_FEATURES.map((feature) => (
              <li
                key={feature}
                className="rounded-full bg-surface-strong px-4 py-2 text-body-md text-ink"
              >
                {feature}
              </li>
            ))}
          </ul>
        </Block>
        <Block
          title="로그인하거나 가입하세요"
          description="이메일로 가입하면 인증 메일이 도착해요. 인증을 마친 뒤 로그인할 수 있어요."
        >
          <div className="max-w-[36rem]">
            <AuthForms />
          </div>
        </Block>
        <CtaBanner
          title="안전하게 계정을 지켜요"
          description="비밀번호는 서비스가 알 수 없게 암호화돼요. 동행 글에는 연락처를 적지 않고, 성인 확인은 확인한 사실만 저장해요."
          actions={[
            { label: "개인정보처리방침 보기", href: "/privacy" },
            { label: "동행 안전수칙 읽기", href: "/safety-guidelines" },
          ]}
        />
      </div>
    );
  } else if (userId) {
    panels.profile = <ProfileForm userId={userId} />;
    panels.activity = <MyActivity userId={userId} />;
    if (role === "ADMIN") panels.admin = <AdminPanel />;
  }

  return (
    <>
      <section aria-labelledby="account-intro" className="bg-surface-soft">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-4 px-5 py-14 md:py-20">
          <p
            className={`w-fit rounded-full px-3 py-1 text-caption ${
              role === "GUEST"
                ? "bg-surface-strong text-body"
                : "bg-success-bg text-success"
            }`}
          >
            {role === "GUEST" ? "로그인 전" : "✓ 로그인됨"}
          </p>
          <h1
            id="account-intro"
            className="max-w-2xl text-display-lg text-ink md:text-display-xl"
          >
            계정을 관리하고 내 활동을 확인하세요
          </h1>
          <p className="max-w-[36rem] text-body-lg text-body">
            {role === "GUEST"
              ? "로그인하면 동행글을 올리고 참가 요청을 주고받을 수 있어요."
              : "프로필을 가꾸고, 내가 올린 글과 받은 요청을 한곳에서 관리해요."}
          </p>
          {authFailed ? (
            <p
              role="alert"
              className="rounded-md bg-danger-bg px-4 py-3 text-body-md text-danger"
            >
              <span aria-hidden="true">⚠ </span>
              인증 링크가 만료됐거나 올바르지 않아요. 다시 로그인하거나 인증
              메일을 새로 받아 주세요.
            </p>
          ) : null}
          {role !== "GUEST" ? <LogoutButton /> : null}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:py-16">
        <RoleTabs role={role} panels={panels} />
      </div>
    </>
  );
}
