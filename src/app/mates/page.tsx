"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import type { MateViewer } from "@/components/scr003/MateComposer";
import BlockAction from "@/components/scr004/BlockAction";
import FilterBar from "@/components/scr004/FilterBar";
import MateDetailPanel from "@/components/scr004/MateDetailPanel";
import MateList, { MateListEmpty } from "@/components/scr004/MateList";
import ParticipationRequestForm from "@/components/scr004/ParticipationRequestForm";
import ReportForm from "@/components/scr004/ReportForm";
import CtaBanner from "@/components/shared/CtaBanner";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STEPS = [
  {
    title: "글 고르기",
    body: "조건에 맞는 동행글을 고르고 작성자와 일정, 설명을 꼼꼼히 읽어요.",
  },
  {
    title: "참가 요청 보내기",
    body: "글 작성자에게만 보이는 비공개 메시지로 참가를 요청해요. 연락처는 적지 않아요.",
  },
  {
    title: "승인 후 일정 맞추기",
    body: "작성자가 승인하면 내 활동에서 확인하고, 만나는 장소와 시간은 안전수칙에 맞춰 정해요.",
  },
] as const;

type ViewerState = { viewer: MateViewer; userId: string | null };

/**
 * 로그인과 성인 확인 상태를 브라우저 Supabase 클라이언트(RLS 적용)로 읽는다.
 * 연결할 수 없으면 비회원으로 취급한다. 쓰기 권한은 어차피 서버와 RLS가 다시 확인한다.
 */
function useViewer(): ViewerState {
  const [state, setState] = useState<ViewerState>({
    viewer: "GUEST",
    userId: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) return;
        if (!user.email_confirmed_at) {
          if (!cancelled) setState({ viewer: "NOT_ADULT", userId: user.id });
          return;
        }
        const { data: profile } = await supabase
          .from("user_profile")
          .select("is_adult, status")
          .eq("user_id", user.id)
          .maybeSingle();
        const ready = Boolean(profile?.is_adult && profile.status === "ACTIVE");
        if (!cancelled) {
          setState({ viewer: ready ? "READY" : "NOT_ADULT", userId: user.id });
        }
      } catch {
        // 연결할 수 없으면 비회원 상태를 유지한다.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="mx-auto w-full max-w-[1200px] px-5 py-10 md:py-16"
    >
      <header className="mb-6 flex flex-col gap-1">
        <h2
          id={`${id}-title`}
          className="text-display-md text-ink md:text-display-lg"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-body-md text-body">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function MatesBoard() {
  const { viewer, userId } = useViewer();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Section
      id="mates-filter"
      title="조건에 맞는 동행을 좁혀보세요"
      description="국가, 지역, 여행 스타일, 기간으로 찾아보세요."
    >
      <FilterBar empty={(reset) => <MateListEmpty onReset={reset} />}>
        {(posts) => (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h3 className="text-title-md text-ink">모집중인 동행글</h3>
              <MateList
                posts={posts}
                selectedId={selectedId}
                onSelect={(post) => setSelectedId(post.id)}
              />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-title-md text-ink">동행글 상세</h3>
              <MateDetailPanel
                postId={selectedId}
                onClose={() => setSelectedId(null)}
              >
                {(post) =>
                  post.ownerId === userId ? (
                    <p className="rounded-md bg-surface-soft px-4 py-3 text-body-md text-body">
                      내가 올린 글이에요. 받은 참가 요청은 내 활동에서 확인할 수
                      있어요.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <ParticipationRequestForm
                        postId={post.id}
                        viewer={viewer}
                      />
                      <div className="flex flex-wrap items-start gap-4 border-t border-hairline pt-4">
                        <ReportForm postId={post.id} viewer={viewer} />
                        <BlockAction
                          targetUserId={post.ownerId}
                          viewer={viewer}
                        />
                      </div>
                    </div>
                  )
                }
              </MateDetailPanel>
            </div>
          </div>
        )}
      </FilterBar>
    </Section>
  );
}

export default function MatesPage() {
  return (
    <>
      <section aria-labelledby="mates-intro" className="bg-surface-soft">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-5 px-5 py-14 md:py-20">
          <h1
            id="mates-intro"
            className="max-w-2xl text-display-lg text-ink md:text-display-xl"
          >
            함께 떠날 동행을 찾아보세요
          </h1>
          <p className="max-w-xl text-body-lg text-body">
            같은 일정으로 떠날 사람을 만나 보세요. 처음 만나기 전에 동행
            안전수칙을 꼭 읽어 주세요.
          </p>
          <Link
            href="/travel-tools?tab=mate"
            className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
          >
            동행글 작성하기
          </Link>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto my-16 h-96 w-full max-w-[1200px] rounded-md bg-surface-soft" />
        }
      >
        <MatesBoard />
      </Suspense>

      <div className="bg-surface-soft">
        <Section
          id="how-it-works"
          title="참가는 이렇게 진행돼요"
          description="처음이라도 세 단계면 충분해요."
        >
          <ol className="grid grid-cols-1 gap-base md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col gap-2 rounded-md bg-canvas p-lg"
              >
                <span className="text-caption text-coral">{index + 1}단계</span>
                <h3 className="text-title-md text-ink">{step.title}</h3>
                <p className="text-body-sm text-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:py-16">
        <CtaBanner
          title="안전한 동행을 위한 약속"
          description="낮 시간대의 공공장소에서 처음 만나고, 연락처는 주고받기 전에 충분히 대화해 보세요. 불편하면 언제든 신고하거나 차단할 수 있어요."
          actions={[
            { label: "여행 조건 정리하기", href: "/travel-tools" },
            { label: "동행 안전수칙 읽기", href: "/safety-guidelines" },
          ]}
        />
      </div>
    </>
  );
}
