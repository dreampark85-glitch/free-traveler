"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { showToast } from "@/hooks/useToast";
import { deriveStatus } from "@/lib/mate/deriveStatus";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// ---- 목록 조회 상태 ---------------------------------------------------------------------

type ListState<T> =
  { status: "loading" } | { status: "error" } | { status: "ready"; items: T[] };

/** 목록을 불러오고 다시 불러오는 상태 관리. RLS가 본인 데이터만 돌려준다. */
function useList<T>(load: () => Promise<T[]>) {
  const [state, setState] = useState<ListState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((items) => {
        if (!cancelled) setState({ status: "ready", items });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);
  return { state, reload };
}

const btn = `${touchTargetClass} ${focusRingClass} rounded-sm px-4 text-button`;

/** 로딩 Skeleton, 오류+재시도, 완성형 Empty를 공통으로 처리하는 목록 영역 */
function ListPanel<T>({
  title,
  state,
  reload,
  empty,
  children,
}: {
  title: string;
  state: ListState<T>;
  reload: () => void;
  empty: {
    message: string;
    howTo: string;
    cta: { label: string; href: string };
  };
  children: (items: T[]) => ReactNode;
}) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h3 className="text-title-md text-ink">{title}</h3>
      {state.status === "loading" ? (
        <div aria-busy="true" className="flex flex-col gap-2">
          <div className="h-16 rounded-md bg-surface-soft" />
          <div className="h-16 rounded-md bg-surface-soft" />
        </div>
      ) : null}
      {state.status === "error" ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-2 rounded-md bg-danger-bg px-4 py-4 text-danger"
        >
          <p className="text-body-md">
            <span aria-hidden="true">⚠ </span>
            목록을 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={reload}
            className={`${btn} border border-danger`}
          >
            다시 시도
          </button>
        </div>
      ) : null}
      {state.status === "ready" && state.items.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-md bg-surface-soft px-4 py-6">
          <p className="text-title-sm text-ink">{empty.message}</p>
          <p className="text-body-sm text-body">{empty.howTo}</p>
          <Link
            href={empty.cta.href}
            className={`${btn} inline-flex items-center bg-coral text-on-coral hover:bg-coral-hover`}
          >
            {empty.cta.label}
          </Link>
        </div>
      ) : null}
      {state.status === "ready" && state.items.length > 0
        ? children(state.items)
        : null}
    </section>
  );
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기 중",
  ACCEPTED: "승인됨",
  REJECTED: "거절됨",
  WITHDRAWN: "철회됨",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-surface-strong px-2 py-0.5 text-caption text-body">
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// ---- 내가 쓴 동행글 ----------------------------------------------------------------------

type MyPost = {
  post_id: string;
  title: string;
  description: string | null;
  capacity: number;
  start_date: string;
  end_date: string;
  status: string;
};

type PendingAction =
  | { kind: "close"; post: MyPost }
  | { kind: "reopen"; post: MyPost }
  | { kind: "delete"; post: MyPost }
  | { kind: "edit"; post: MyPost; title: string; capacity: number };

function MyPosts({ userId }: { userId: string }) {
  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("mate_post")
      .select(
        "post_id, title, description, capacity, start_date, end_date, status",
      )
      .eq("owner_id", userId)
      .neq("status", "DELETED")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as MyPost[];
  }, [userId]);
  const { state, reload } = useList(load);

  const [editing, setEditing] = useState<{
    id: string;
    title: string;
    capacity: number;
  } | null>(null);
  const [warn, setWarn] = useState<PendingAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: PendingAction, confirmAccepted = false) {
    setError(null);
    const id = action.post.post_id;
    try {
      let response: Response;
      if (action.kind === "delete") {
        response = await fetch(`/api/mates/${id}`, { method: "DELETE" });
      } else {
        const body =
          action.kind === "edit"
            ? { title: action.title, capacity: action.capacity }
            : { status: action.kind === "close" ? "CLOSED" : "OPEN" };
        response = await fetch(`/api/mates/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...body,
            confirmAcceptedRequests: confirmAccepted || undefined,
          }),
        });
      }
      if (response.status === 409) {
        // 승인된 참가 요청이 있는 글은 한 번 더 확인받는다.
        setWarn(action);
        return;
      }
      if (!response.ok && response.status !== 204) throw new Error("failed");
      setWarn(null);
      setEditing(null);
      showToast(
        action.kind === "delete"
          ? "글을 삭제했어요"
          : action.kind === "edit"
            ? "글을 수정했어요"
            : action.kind === "close"
              ? "모집을 마감했어요"
              : "모집을 다시 열었어요",
      );
      reload();
    } catch {
      setError("처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    }
  }

  return (
    <ListPanel
      title="내가 쓴 동행글"
      state={state}
      reload={reload}
      empty={{
        message: "아직 올린 동행글이 없어요.",
        howTo: "여행 조건을 정리한 뒤 동행 탭에서 글을 올릴 수 있어요.",
        cta: { label: "동행글 작성하기", href: "/travel-tools?tab=mate" },
      }}
    >
      {(posts) => (
        <>
          {error ? (
            <p role="alert" className="text-body-sm text-danger">
              <span aria-hidden="true">⚠ </span>
              {error}
            </p>
          ) : null}
          {warn ? (
            <div
              role="alertdialog"
              aria-label="승인된 참가 요청 경고"
              className="flex flex-col gap-2 rounded-md bg-warning-bg px-4 py-3 text-body-sm text-warning"
            >
              <p>
                <span aria-hidden="true">⚠ </span>
                승인된 참가 요청이 있는 글이에요. 계속하면 이미 참가하기로 한
                사람에게 영향이 있을 수 있어요.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => run(warn, true)}
                  className={`${btn} bg-warning text-on-coral`}
                >
                  그래도 계속
                </button>
                <button
                  type="button"
                  onClick={() => setWarn(null)}
                  className={`${btn} border border-warning`}
                >
                  취소
                </button>
              </div>
            </div>
          ) : null}
          <ul className="flex flex-col gap-3">
            {posts.map((post) => {
              const derived = deriveStatus({
                status: post.status === "CLOSED" ? "CLOSED" : "OPEN",
                endDate: post.end_date,
              });
              const isEditing = editing?.id === post.post_id;
              return (
                <li
                  key={post.post_id}
                  className="flex flex-col gap-2 rounded-md border border-hairline bg-canvas p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/mates"
                      className={`${focusRingClass} rounded-sm text-title-sm text-ink hover:text-coral`}
                    >
                      {post.title}
                    </Link>
                    <span className="rounded-full bg-surface-strong px-2 py-0.5 text-caption text-body">
                      {post.status === "HIDDEN"
                        ? "숨김"
                        : derived === "OPEN"
                          ? "모집중"
                          : "마감"}
                    </span>
                  </div>
                  <p className="text-body-sm text-muted">
                    {post.start_date.replaceAll("-", ".")} –{" "}
                    {post.end_date.replaceAll("-", ".")} · 모집 {post.capacity}
                    명
                  </p>
                  {isEditing && editing ? (
                    <div className="flex flex-col gap-2">
                      <label className="flex flex-col gap-1 text-body-sm text-muted">
                        제목
                        <input
                          value={editing.title}
                          maxLength={100}
                          onChange={(e) =>
                            setEditing({ ...editing, title: e.target.value })
                          }
                          className={`${touchTargetClass} ${focusRingClass} rounded-sm border border-hairline px-3 text-body-md text-ink`}
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-body-sm text-muted">
                        모집 인원
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={editing.capacity}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              capacity: Number(e.target.value),
                            })
                          }
                          className={`${touchTargetClass} ${focusRingClass} rounded-sm border border-hairline px-3 text-body-md text-ink`}
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            run({
                              kind: "edit",
                              post,
                              title: editing.title.trim(),
                              capacity: editing.capacity,
                            })
                          }
                          className={`${btn} bg-coral text-on-coral`}
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className={`${btn} border border-hairline`}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            id: post.post_id,
                            title: post.title,
                            capacity: post.capacity,
                          })
                        }
                        className={`${btn} border border-hairline`}
                      >
                        수정
                      </button>
                      {post.status === "OPEN" ? (
                        <button
                          type="button"
                          onClick={() => run({ kind: "close", post })}
                          className={`${btn} border border-hairline`}
                        >
                          마감
                        </button>
                      ) : post.status === "CLOSED" ? (
                        <button
                          type="button"
                          onClick={() => run({ kind: "reopen", post })}
                          className={`${btn} border border-hairline`}
                        >
                          다시 열기
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "이 글을 삭제할까요? 삭제한 글은 되돌릴 수 없어요.",
                            )
                          ) {
                            void run({ kind: "delete", post });
                          }
                        }}
                        className={`${btn} border border-danger text-danger`}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </ListPanel>
  );
}

// ---- 보낸 요청 / 받은 요청 -----------------------------------------------------------------

type SentRequest = {
  application_id: string;
  message: string;
  status: string;
  post: { title: string } | null;
};

type ReceivedRequest = {
  application_id: string;
  message: string;
  status: string;
  post: { title: string; owner_id: string } | null;
  applicant: { nickname: string } | null;
};

function SentRequests({ userId }: { userId: string }) {
  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("mate_application")
      .select("application_id, message, status, post:mate_post!post_id(title)")
      .eq("applicant_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as SentRequest[];
  }, [userId]);
  const { state, reload } = useList(load);

  return (
    <ListPanel
      title="보낸 참가 요청"
      state={state}
      reload={reload}
      empty={{
        message: "아직 보낸 참가 요청이 없어요.",
        howTo:
          "동행글 상세에서 작성자에게 비공개 메시지로 참가를 요청할 수 있어요.",
        cta: { label: "동행글 보러 가기", href: "/mates" },
      }}
    >
      {(items) => (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.application_id}
              className="flex flex-col gap-1 rounded-md border border-hairline bg-canvas p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/mates"
                  className={`${focusRingClass} rounded-sm text-title-sm text-ink hover:text-coral`}
                >
                  {item.post?.title ?? "삭제되었거나 볼 수 없는 글"}
                </Link>
                <StatusBadge status={item.status} />
              </div>
              <p className="line-clamp-2 text-body-sm text-muted">
                {item.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </ListPanel>
  );
}

function ReceivedRequests({ userId }: { userId: string }) {
  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("mate_application")
      .select(
        "application_id, message, status, post:mate_post!post_id!inner(title, owner_id), applicant:user_profile!applicant_id(nickname)",
      )
      .eq("post.owner_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as ReceivedRequest[];
  }, [userId]);
  const { state, reload } = useList(load);
  const [error, setError] = useState<string | null>(null);

  async function decide(id: string, decision: "ACCEPTED" | "REJECTED") {
    setError(null);
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (!response.ok) throw new Error("failed");
      showToast(
        decision === "ACCEPTED"
          ? "참가 요청을 승인했어요"
          : "참가 요청을 거절했어요",
      );
      reload();
    } catch {
      setError("요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    }
  }

  return (
    <ListPanel
      title="받은 참가 요청"
      state={state}
      reload={reload}
      empty={{
        message: "아직 받은 참가 요청이 없어요.",
        howTo: "내 글에 요청이 오면 여기에서 승인하거나 거절할 수 있어요.",
        cta: { label: "동행글 작성하기", href: "/travel-tools?tab=mate" },
      }}
    >
      {(items) => (
        <>
          {error ? (
            <p role="alert" className="text-body-sm text-danger">
              <span aria-hidden="true">⚠ </span>
              {error}
            </p>
          ) : null}
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.application_id}
                className="flex flex-col gap-2 rounded-md border border-hairline bg-canvas p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-title-sm text-ink">
                    {item.applicant?.nickname ?? "알 수 없는 사용자"}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-body-sm text-muted">
                  {item.post?.title ?? "삭제된 글"}
                </p>
                <p className="whitespace-pre-wrap break-words text-body-md text-body">
                  {item.message}
                </p>
                {item.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => decide(item.application_id, "ACCEPTED")}
                      className={`${btn} bg-coral text-on-coral hover:bg-coral-hover`}
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(item.application_id, "REJECTED")}
                      className={`${btn} border border-hairline`}
                    >
                      거절
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </ListPanel>
  );
}

// ---- 차단 목록 ---------------------------------------------------------------------------

type BlockedUser = { blockedId: string; createdAt: string };

function BlockList() {
  const load = useCallback(async () => {
    const response = await fetch("/api/blocks");
    if (!response.ok) throw new Error("failed");
    const body = (await response.json()) as { items: BlockedUser[] };
    return body.items;
  }, []);
  const { state, reload } = useList(load);
  const [error, setError] = useState<string | null>(null);

  async function unblock(id: string) {
    setError(null);
    try {
      const response = await fetch(`/api/blocks/${id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) throw new Error("failed");
      showToast("차단을 해제했어요");
      reload();
    } catch {
      setError("차단을 해제하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    }
  }

  return (
    <ListPanel
      title="차단한 사용자"
      state={state}
      reload={reload}
      empty={{
        message: "차단한 사용자가 없어요.",
        howTo: "동행글 상세에서 불편한 사용자를 차단하면 이곳에 모여요.",
        cta: { label: "동행글 보러 가기", href: "/mates" },
      }}
    >
      {(items) => (
        <>
          {error ? (
            <p role="alert" className="text-body-sm text-danger">
              <span aria-hidden="true">⚠ </span>
              {error}
            </p>
          ) : null}
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.blockedId}
                className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-canvas px-4 py-3"
              >
                <span className="text-body-md text-ink">
                  사용자 {item.blockedId.slice(0, 8)}
                  <span className="ml-2 text-body-sm text-muted">
                    {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => unblock(item.blockedId)}
                  className={`${btn} border border-hairline`}
                >
                  차단 해제
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </ListPanel>
  );
}

// ---- 전체 -------------------------------------------------------------------------------

type MyActivityProps = {
  /** 로그인한 사용자의 ID. 목록은 RLS로 본인 데이터만 돌아온다. */
  userId: string;
};

/** 내 활동: 내가 쓴 글, 보낸·받은 참가 요청, 차단 목록. Desktop에서는 요청 목록이 좌우로 나뉜다. */
export default function MyActivity({ userId }: MyActivityProps) {
  return (
    <div className="flex flex-col gap-10">
      <MyPosts userId={userId} />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <SentRequests userId={userId} />
        <ReceivedRequests userId={userId} />
      </div>
      <BlockList />
    </div>
  );
}
