"use client";

import Link from "next/link";
import MatePostCard from "@/components/shared/MatePostCard";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { destinations } from "@/data/destinations";
import { deriveStatus } from "@/lib/mate/deriveStatus";
import type { MatePostSummary } from "./FilterBar";

const COUNTRY_NAMES = new Map(
  destinations.map((d) => [d.countryCode, d.country]),
);

type MateListProps = {
  posts: readonly MatePostSummary[];
  selectedId: string | null;
  onSelect: (post: MatePostSummary) => void;
};

/**
 * 동행 글 카드 목록. 받은 글을 그대로 보여준다. 처음에는 8건만 받아 오고(FilterBar의 쪽 크기),
 * "더 보기"를 누르면 FilterBar가 더 많이 받아 와서 목록이 늘어난다.
 * 종료일이 지난 글은 서버가 준 상태와 무관하게 이 시점에 다시 계산해 마감으로 표시한다.
 */
export default function MateList({
  posts,
  selectedId,
  onSelect,
}: MateListProps) {
  return (
    <ul className="grid grid-cols-1 gap-base sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
      {posts.map((post) => {
        const closed =
          deriveStatus({
            status: post.status === "CLOSED" ? "CLOSED" : "OPEN",
            endDate: post.endDate,
          }) === "CLOSED";
        const selected = post.id === selectedId;
        return (
          <li key={post.id} className="flex flex-col gap-1">
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(post)}
              className={`${focusRingClass} block h-full rounded-md text-left ${
                selected ? "ring-2 ring-coral" : ""
              }`}
            >
              <MatePostCard
                title={post.title}
                country={
                  COUNTRY_NAMES.get(post.countryCode) ?? post.countryCode
                }
                region={post.region ?? undefined}
                startDate={post.startDate}
                endDate={post.endDate}
                capacity={post.capacity}
                styleTags={post.travelStyles}
                adultVerified={post.owner?.adultVerified ?? false}
              />
            </button>
            {closed ? (
              <p className="text-caption text-muted">
                <span aria-hidden="true">⏹ </span>모집 마감
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** 결과가 0건일 때 보여주는 완성형 Empty State(안내 문장 + 이용 방법 + 다음 행동). */
export function MateListEmpty({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md bg-surface-soft px-6 py-12 text-center">
      <p className="text-title-md text-ink">
        조건에 맞는 동행글이 아직 없어요.
      </p>
      <p className="text-body-md text-body">
        조건을 줄이면 더 많은 글이 보여요. 원하는 글이 없다면 직접 올려서 동행을
        기다려 보세요.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className={`${touchTargetClass} ${focusRingClass} rounded-sm border border-coral px-6 py-3 text-button text-coral hover:bg-coral-tint`}
        >
          검색 조건 초기화
        </button>
        <Link
          href="/travel-tools?tab=mate"
          className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
        >
          새 동행글 작성하기
        </Link>
      </div>
      <a
        href="#how-it-works"
        className={`${focusRingClass} rounded-sm text-body-sm text-info underline`}
      >
        참가는 어떻게 진행되나요?
      </a>
    </div>
  );
}
