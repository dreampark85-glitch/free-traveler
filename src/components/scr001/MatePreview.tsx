"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MatePostCard from "@/components/shared/MatePostCard";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { destinations } from "@/data/destinations";

type PreviewPost = {
  id: string;
  title: string;
  countryCode: string;
  region: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
  travelStyles: string[];
  owner: { nickname: string; adultVerified: boolean } | null;
};

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; posts: PreviewPost[] };

const PREVIEW_COUNT = 3;

const COUNTRY_NAMES = new Map(
  destinations.map((d) => [d.countryCode, d.country]),
);

const linkButton = `${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm px-6 py-3 text-button`;

export default function MatePreview() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/mates?limit=${PREVIEW_COUNT}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("request failed");
        return response.json() as Promise<{ items: PreviewPost[] }>;
      })
      .then((body) => setState({ status: "ready", posts: body.items }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setState({ status: "error" });
      });
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  if (state.status === "loading") {
    return (
      <ul
        aria-busy="true"
        aria-label="동행 글을 불러오는 중"
        className="grid grid-cols-1 gap-base md:grid-cols-3"
      >
        {Array.from({ length: PREVIEW_COUNT }, (_, i) => (
          <li
            key={i}
            className="h-44 rounded-md bg-surface-soft"
            aria-hidden="true"
          />
        ))}
      </ul>
    );
  }

  if (state.status === "error") {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-md bg-danger-bg px-6 py-10 text-center text-danger"
      >
        <p className="text-title-md">
          <span aria-hidden="true">⚠ </span>
          동행 글을 불러오지 못했어요
        </p>
        <p className="text-body-md">
          네트워크 연결이 불안정했을 수 있어요. 잠시 뒤 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={retry}
          className={`${linkButton} border border-danger`}
        >
          다시 시도
        </button>
      </div>
    );
  }

  const { posts } = state;
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md bg-surface-soft px-6 py-12 text-center">
        <p className="text-title-md text-ink">아직 모집중인 동행글이 없어요.</p>
        <p className="text-body-md text-body">
          여행 조건을 정리한 뒤 새 동행글을 가장 먼저 올려보세요. 올린 글은 이
          자리에 바로 보여요.
        </p>
        <Link
          href="/travel-tools?tab=mate"
          className={`${linkButton} bg-coral text-on-coral hover:bg-coral-hover`}
        >
          동행글 작성하기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid grid-cols-1 gap-base md:grid-cols-3">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href="/mates"
              className={`${focusRingClass} block h-full rounded-md`}
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
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/mates"
        className={`${linkButton} self-start border border-coral text-coral hover:bg-coral-tint`}
      >
        동행글 더 보러 가기
      </Link>
    </div>
  );
}
