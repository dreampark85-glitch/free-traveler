import type { ReactNode } from "react";

/** 키보드 포커스 표시: 2px 코랄 아웃라인, offset 2px. */
export const focusRingClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral";

/** 터치 대상 최소 크기 44×44px. */
export const touchTargetClass = "min-h-11 min-w-11";

/**
 * 안쪽 요소가 키보드 포커스를 받으면 코랄 아웃라인을 그리는 래퍼.
 * 자체 포커스 스타일을 줄 수 없는 요소를 감쌀 때 쓴다.
 */
export default function FocusRing({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex rounded-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-coral ${className}`}
    >
      {children}
    </span>
  );
}
