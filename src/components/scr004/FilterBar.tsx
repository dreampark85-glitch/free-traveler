"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { destinations } from "@/data/destinations";
import { DESTINATION_THEMES } from "@/data/destinations.schema";

export type MatePostSummary = {
  id: string;
  ownerId: string;
  title: string;
  countryCode: string;
  region: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
  travelStyles: string[];
  description: string | null;
  status: string;
  createdAt: string;
  owner: { nickname: string; adultVerified: boolean } | null;
};

type FilterBarProps = {
  /** 조회가 끝나면 필터에 맞는 글 목록으로 결과 영역을 그린다. */
  children: (posts: MatePostSummary[]) => ReactNode;
  /** 결과가 0건일 때 보여줄 내용(완성형 Empty State). 초기화 함수를 받는다. */
  empty: (reset: () => void) => ReactNode;
};

/** URL에 직렬화하는 필터 키는 이 목록뿐이다. */
const KEYS = ["country", "region", "style", "from", "to"] as const;
type Key = (typeof KEYS)[number];

const PAGE_SIZE = 8;
const MAX_PAGES = 6;

const COUNTRIES = [
  ...new Map(destinations.map((d) => [d.countryCode, d.country])).entries(),
];

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; posts: MatePostSummary[]; total: number };

const control = `${touchTargetClass} ${focusRingClass} w-full rounded-sm border border-hairline bg-canvas px-3 text-body-md text-ink`;

/**
 * 동행 글 필터와 결과 요약, 조회 상태(로딩·오류·재시도)를 맡는다.
 * 국가·스타일·기간은 API 조회 조건으로 보내고, 지역은 받은 결과에서 걸러낸다.
 * 차단 관계에 있는 사용자의 글은 서버(RLS)가 이미 제외해서 내려준다.
 */
export default function FilterBar({ children, empty }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pages, setPages] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ status: "loading" });

  const filters: Record<Key, string> = {
    country: searchParams.get("country") ?? "",
    region: searchParams.get("region") ?? "",
    style: searchParams.get("style") ?? "",
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
  };

  const apiQuery = new URLSearchParams();
  if (filters.country) apiQuery.set("country", filters.country);
  if (filters.style) apiQuery.set("style", filters.style);
  if (filters.from) apiQuery.set("from", filters.from);
  if (filters.to) apiQuery.set("to", filters.to);
  apiQuery.set("limit", String(PAGE_SIZE * pages));
  const apiKey = apiQuery.toString();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/mates?${apiKey}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("request failed");
        return response.json() as Promise<{
          items: MatePostSummary[];
          total: number;
        }>;
      })
      .then((body) =>
        setState({ status: "ready", posts: body.items, total: body.total }),
      )
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setState({ status: "error" });
      });
    return () => controller.abort();
  }, [apiKey, attempt]);

  function update(changes: Partial<Record<Key, string>>) {
    const next = new URLSearchParams();
    const merged = { ...filters, ...changes };
    for (const key of KEYS) {
      if (merged[key]) next.set(key, merged[key]);
    }
    setState({ status: "loading" });
    setPages(1);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function reset() {
    update({ country: "", region: "", style: "", from: "", to: "" });
  }

  function retry() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  const regions = filters.country
    ? destinations
        .filter((d) => d.countryCode === filters.country)
        .map((d) => d.name)
    : [];
  const hasFilter = KEYS.some((key) => filters[key]);

  const visible =
    state.status === "ready"
      ? state.posts.filter(
          (post) => !filters.region || post.region === filters.region,
        )
      : [];

  return (
    <div className="flex flex-col gap-6">
      <div
        role="group"
        aria-label="동행 글 필터"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="flex flex-col gap-1 text-body-sm text-muted">
          국가
          <select
            className={control}
            value={filters.country}
            onChange={(e) => update({ country: e.target.value, region: "" })}
          >
            <option value="">전체</option>
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-body-sm text-muted">
          지역
          <select
            className={control}
            value={filters.region}
            disabled={!filters.country}
            onChange={(e) => update({ region: e.target.value })}
          >
            <option value="">전체</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-body-sm text-muted">
          여행 스타일
          <select
            className={control}
            value={filters.style}
            onChange={(e) => update({ style: e.target.value })}
          >
            <option value="">전체</option>
            {DESTINATION_THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-body-sm text-muted">
          여행 시작 가능일
          <input
            type="date"
            className={control}
            value={filters.from}
            onChange={(e) => update({ from: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 text-body-sm text-muted">
          여행 종료 가능일
          <input
            type="date"
            className={control}
            min={filters.from || undefined}
            value={filters.to}
            onChange={(e) => update({ to: e.target.value })}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p aria-live="polite" className="text-body-md text-body">
          {state.status === "ready"
            ? `조건에 맞는 동행글이 총 ${visible.length}개 있어요.`
            : "동행글을 찾고 있어요."}
        </p>
        {hasFilter ? (
          <button
            type="button"
            onClick={reset}
            className={`${touchTargetClass} ${focusRingClass} text-body-sm text-coral underline`}
          >
            검색 조건 초기화
          </button>
        ) : null}
      </div>

      {state.status === "loading" ? (
        <ul
          aria-busy="true"
          aria-label="동행 글을 불러오는 중"
          className="grid grid-cols-1 gap-base sm:grid-cols-2 lg:grid-cols-4"
        >
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <li
              key={i}
              aria-hidden="true"
              className="h-44 rounded-md bg-surface-soft"
            />
          ))}
        </ul>
      ) : null}

      {state.status === "error" ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-md bg-danger-bg px-6 py-10 text-center text-danger"
        >
          <p className="text-title-md">
            <span aria-hidden="true">⚠ </span>
            동행 글을 불러오지 못했어요
          </p>
          <p className="text-body-md">
            네트워크 연결이 불안정했을 수 있어요. 입력한 조건은 그대로 남아
            있어요.
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

      {state.status === "ready" && visible.length === 0 ? empty(reset) : null}
      {state.status === "ready" && visible.length > 0
        ? children(visible)
        : null}

      {state.status === "ready" &&
      state.posts.length < state.total &&
      pages < MAX_PAGES ? (
        <button
          type="button"
          onClick={() => {
            setState({ status: "loading" });
            setPages((n) => n + 1);
          }}
          className={`${touchTargetClass} ${focusRingClass} self-center rounded-sm border border-coral px-6 py-3 text-button text-coral hover:bg-coral-tint`}
        >
          동행글 더 보기
        </button>
      ) : null}
    </div>
  );
}
