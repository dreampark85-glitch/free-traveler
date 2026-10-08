"use client";

import Link from "next/link";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center md:py-24">
      <div
        role="alert"
        className="w-full rounded-md bg-danger-bg px-6 py-8 text-danger"
      >
        <h1 className="text-display-md">화면을 불러오지 못했어요</h1>
        <p className="mt-2 text-body-md">
          일시적인 문제로 이 화면을 표시하지 못했어요. 잠시 뒤 다시 시도하면
          대부분 해결됩니다.
        </p>
      </div>
      <p className="text-body-md text-body">
        계속 같은 문제가 생기면 홈으로 이동해 다른 화면부터 이용해 주세요.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => retry()}
          className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
        >
          다시 시도하기
        </button>
        <Link
          href="/"
          className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm border border-coral px-6 py-3 text-button text-coral hover:bg-coral-tint`}
        >
          홈으로 이동
        </Link>
      </div>
    </section>
  );
}
