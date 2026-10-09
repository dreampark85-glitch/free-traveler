"use client";

import { useEffect, useState, type ReactNode } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { destinations } from "@/data/destinations";
import type { MatePostSummary } from "./FilterBar";

type MateDetailPanelProps = {
  /** 선택한 글의 ID. null이면 아직 고르지 않은 상태다. */
  postId: string | null;
  onClose: () => void;
  /** 상세 아래에 놓을 동작(참가 요청, 신고, 차단 등). 글이 로드된 뒤에만 그린다. */
  children?: (post: MatePostSummary) => ReactNode;
};

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; post: MatePostSummary };

const COUNTRY_NAMES = new Map(
  destinations.map((d) => [d.countryCode, d.country]),
);

/**
 * 동행 글 상세. Desktop에서는 목록 옆 오른쪽 패널로, Mobile에서는 화면 전체를 덮는
 * 하단 Drawer로 보인다. 연락처는 API가 내려주지 않으므로 어디에도 표시하지 않는다.
 */
export default function MateDetailPanel({
  postId,
  onClose,
  children,
}: MateDetailPanelProps) {
  const [fetched, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  // 다른 글로 바뀐 직후에는 이전 글을 보여주지 않고 로딩으로 취급한다.
  const state: State =
    fetched.status === "ready" && fetched.post.id !== postId
      ? { status: "loading" }
      : fetched;

  useEffect(() => {
    if (!postId) return;
    const controller = new AbortController();
    fetch(`/api/mates/${postId}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("request failed");
        return response.json() as Promise<MatePostSummary>;
      })
      .then((post) => setState({ status: "ready", post }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setState({ status: "error" });
      });
    return () => controller.abort();
  }, [postId, attempt]);

  useEffect(() => {
    if (!postId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [postId, onClose]);

  // 선택한 글이 없으면 Mobile에서는 아무것도 그리지 않고, Desktop에서는 안내 패널을 둔다.
  if (!postId) {
    return (
      <aside className="hidden flex-col items-center gap-2 rounded-md bg-surface-soft px-6 py-12 text-center md:flex">
        <p className="text-title-md text-ink">글을 선택해 주세요.</p>
        <p className="text-body-md text-body">
          왼쪽 목록에서 동행글을 고르면 자세한 내용과 참가 요청 방법이 여기에
          나와요.
        </p>
      </aside>
    );
  }

  function retry() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  return (
    <aside
      aria-label="동행글 상세"
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-canvas md:static md:z-auto md:rounded-md md:border md:border-hairline"
    >
      <div className="sticky top-0 flex items-center justify-between border-b border-hairline bg-canvas px-4 py-2 md:hidden">
        <span className="text-title-sm text-ink">동행글 상세</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="상세 닫기"
          className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm`}
        >
          <span aria-hidden="true" className="text-xl leading-none">
            ×
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-5 p-5 md:p-lg">
        {state.status === "loading" ? (
          <div
            aria-busy="true"
            aria-label="상세를 불러오는 중"
            className="flex flex-col gap-3"
          >
            <div className="h-7 w-3/4 rounded-sm bg-surface-soft" />
            <div className="h-5 w-1/2 rounded-sm bg-surface-soft" />
            <div className="h-32 rounded-md bg-surface-soft" />
          </div>
        ) : null}

        {state.status === "error" ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-md bg-danger-bg px-6 py-10 text-center text-danger"
          >
            <p className="text-title-md">
              <span aria-hidden="true">⚠ </span>
              상세를 불러오지 못했어요
            </p>
            <p className="text-body-md">
              글이 마감됐거나 삭제됐을 수도 있어요. 다시 시도해 보세요.
            </p>
            <button
              type="button"
              onClick={retry}
              className={`${touchTargetClass} ${focusRingClass} rounded-sm border border-danger px-6 py-3 text-button`}
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {state.status === "ready" ? (
          <>
            <header className="flex flex-col gap-2">
              <p className="w-fit rounded-full bg-surface-strong px-3 py-1 text-caption text-body">
                {state.post.status === "OPEN" ? "모집중" : "모집 마감"}
              </p>
              <h2 className="text-display-md text-ink">{state.post.title}</h2>
              <p className="text-body-md text-muted">
                {COUNTRY_NAMES.get(state.post.countryCode) ??
                  state.post.countryCode}
                {state.post.region ? ` · ${state.post.region}` : ""} ·{" "}
                {state.post.startDate.replaceAll("-", ".")} –{" "}
                {state.post.endDate.replaceAll("-", ".")}
              </p>
            </header>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-caption text-muted">작성자</dt>
                <dd className="flex items-center gap-2 text-body-md text-ink">
                  {state.post.owner?.nickname ?? "비공개"}
                  {state.post.owner?.adultVerified ? (
                    <span className="rounded-full bg-coral-tint px-2 py-0.5 text-caption text-coral">
                      성인 확인 완료
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-muted">모집 인원</dt>
                <dd className="text-body-md text-ink">
                  {state.post.capacity}명
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-caption text-muted">여행 스타일</dt>
                <dd>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {state.post.travelStyles.map((style) => (
                      <li
                        key={style}
                        className="rounded-full bg-surface-strong px-3 py-1 text-caption text-body"
                      >
                        {style}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            <section aria-label="설명" className="flex flex-col gap-1">
              <h3 className="text-title-sm text-ink">설명</h3>
              <p className="whitespace-pre-wrap break-words text-body-md text-body">
                {state.post.description}
              </p>
            </section>

            <p className="rounded-md bg-surface-soft px-4 py-3 text-body-sm text-muted">
              비용은 동행자끼리 자율적으로 나누며 서비스는 결제와 정산에
              관여하지 않아요.
            </p>

            {children ? children(state.post) : null}
          </>
        ) : null}
      </div>
    </aside>
  );
}
