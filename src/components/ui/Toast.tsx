"use client";

import { useToast, type ToastVariant } from "@/hooks/useToast";
import { focusRingClass, touchTargetClass } from "./FocusRing";

const STYLES: Record<
  ToastVariant,
  { box: string; icon: string; label: string }
> = {
  success: {
    box: "bg-success-bg text-success",
    icon: "✓",
    label: "성공",
  },
  error: {
    box: "bg-danger-bg text-danger",
    icon: "⚠",
    label: "오류",
  },
  info: {
    box: "bg-surface-soft text-info",
    icon: "ℹ",
    label: "안내",
  },
};

/** 앱 전체에서 한 번만 렌더링한다(루트 layout). 색상만이 아니라 아이콘과 라벨을 함께 쓴다. */
export default function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => {
        const style = STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-[28rem] items-center gap-3 rounded-md px-4 py-3 text-body-sm shadow-card ${style.box}`}
          >
            <span aria-hidden="true">{style.icon}</span>
            <span className="flex-1">
              <span className="sr-only">{style.label}: </span>
              {toast.message}
            </span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="알림 닫기"
              className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm`}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
