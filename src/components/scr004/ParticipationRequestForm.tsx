"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import type { MateViewer } from "@/components/scr003/MateComposer";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { showToast } from "@/hooks/useToast";

const MAX_LENGTH = 500;

type ParticipationRequestFormProps = {
  postId: string;
  viewer: MateViewer;
};

/** 글 작성자에게만 보이는 비공개 참가 메시지를 보낸다. 최대 500자. */
export default function ParticipationRequestForm({
  postId,
  viewer,
}: ParticipationRequestFormProps) {
  const uid = useId();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (viewer !== "READY") {
    const guest = viewer === "GUEST";
    return (
      <div className="flex flex-col gap-2 rounded-md bg-surface-soft px-4 py-4">
        <p className="text-title-sm text-ink">
          {guest
            ? "로그인하고 성인 확인을 마치면 참가를 요청할 수 있어요"
            : "성인 확인을 마치면 참가를 요청할 수 있어요"}
        </p>
        <p className="text-body-sm text-body">
          참가 요청은 만 19세 이상 회원만 보낼 수 있어요.
        </p>
        <Link
          href="/account"
          className={`${touchTargetClass} ${focusRingClass} w-fit rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
        >
          {guest ? "로그인·가입하러 가기" : "성인 확인하러 가기"}
        </Link>
      </div>
    );
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col gap-2 rounded-md bg-success-bg px-4 py-4 text-success"
      >
        <p className="text-title-sm">
          <span aria-hidden="true">✓ </span>
          참가 요청을 보냈어요
        </p>
        <p className="text-body-sm">
          글 작성자가 승인하거나 거절하면 내 활동에서 확인할 수 있어요.
        </p>
        <Link
          href="/account"
          className={`${focusRingClass} w-fit rounded-sm text-body-sm underline`}
        >
          내 활동에서 요청 상태 확인
        </Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (text.length === 0) {
      setError("작성자에게 보낼 메시지를 적어 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/mates/${postId}/requests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (response.status === 201) {
        setSent(true);
        showToast("참가 요청을 보냈어요");
        return;
      }
      const body = (await response.json().catch(() => null)) as {
        error?: { code?: string; message?: string };
      } | null;
      setError(
        response.status === 409
          ? "이미 이 글에 참가 요청을 보냈어요. 처리 결과를 기다려 주세요."
          : (body?.error?.message ??
              "참가 요청을 보내지 못했어요. 다시 시도해 주세요."),
      );
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="참가 요청"
      className="flex flex-col gap-3"
    >
      <label htmlFor={`${uid}-message`} className="text-title-sm text-ink">
        참가 요청 메시지
      </label>
      <textarea
        id={`${uid}-message`}
        rows={4}
        maxLength={MAX_LENGTH}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={`${uid}-help`}
        className={`${focusRingClass} rounded-sm border bg-canvas px-3 py-2 text-body-md text-ink ${
          error ? "border-danger" : "border-hairline"
        }`}
      />
      <div className="flex items-start justify-between gap-3">
        <p
          id={`${uid}-help`}
          className={`text-body-sm ${error ? "text-danger" : "text-muted"}`}
          role={error ? "alert" : undefined}
        >
          {error ??
            "글 작성자에게만 보이는 비공개 메시지예요. 연락처는 적지 마세요."}
        </p>
        <p className="shrink-0 text-body-sm text-muted">
          {message.length}/{MAX_LENGTH}
        </p>
      </div>
      <button
        type="submit"
        disabled={busy}
        className={`${touchTargetClass} ${focusRingClass} w-fit rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover disabled:opacity-60`}
      >
        {busy ? "보내는 중..." : "참가 요청 보내기"}
      </button>
    </form>
  );
}
