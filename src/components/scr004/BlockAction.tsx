"use client";

import Link from "next/link";
import { useState } from "react";
import type { MateViewer } from "@/components/scr003/MateComposer";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { showToast } from "@/hooks/useToast";

type BlockActionProps = {
  /** 차단할 상대 사용자의 ID (글 작성자) */
  targetUserId: string;
  viewer: MateViewer;
  /** 이미 차단한 상대인지. 모르면 false. */
  initiallyBlocked?: boolean;
  onChange?: (blocked: boolean) => void;
};

const small = `${touchTargetClass} ${focusRingClass} rounded-sm px-4 text-button`;

/** 차단과 차단 해제를 하나의 버튼으로 전환한다. 차단하면 서로의 글과 프로필이 보이지 않는다. */
export default function BlockAction({
  targetUserId,
  viewer,
  initiallyBlocked = false,
  onChange,
}: BlockActionProps) {
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (viewer !== "READY") {
    return (
      <p className="text-body-sm text-muted">
        <Link
          href="/account"
          className={`${focusRingClass} rounded-sm text-info underline`}
        >
          {viewer === "GUEST" ? "로그인" : "성인 확인"}
        </Link>
        {viewer === "GUEST" ? "하면" : "을 마치면"} 이 사용자를 차단할 수
        있어요.
      </p>
    );
  }

  async function submit(next: boolean) {
    setBusy(true);
    setError(null);
    try {
      const response = next
        ? await fetch("/api/blocks", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ blockedId: targetUserId }),
          })
        : await fetch(`/api/blocks/${targetUserId}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) {
        throw new Error("request failed");
      }
      setBlocked(next);
      setConfirming(false);
      showToast(next ? "이 사용자를 차단했어요" : "차단을 해제했어요");
      onChange?.(next);
    } catch {
      setError(
        next
          ? "차단하지 못했어요. 잠시 뒤 다시 시도해 주세요."
          : "차단을 해제하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {confirming ? (
        <div
          role="alertdialog"
          aria-label="차단 확인"
          className="flex flex-col gap-2 rounded-md bg-danger-bg px-4 py-3 text-body-sm text-danger"
        >
          <p>
            이 사용자를 차단할까요? 차단하면 서로의 글과 프로필이 보이지 않아요.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => submit(true)}
              className={`${small} bg-danger text-on-coral disabled:opacity-60`}
            >
              {busy ? "처리 중..." : "차단하기"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming(false)}
              className={`${small} border border-danger`}
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => (blocked ? submit(false) : setConfirming(true))}
          className={`${small} w-fit border ${
            blocked ? "border-coral text-coral" : "border-hairline text-body"
          } hover:bg-surface-soft disabled:opacity-60`}
        >
          {blocked ? "차단 해제" : "이 사용자 차단하기"}
        </button>
      )}
      {error ? (
        <p role="alert" className="text-body-sm text-danger">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
