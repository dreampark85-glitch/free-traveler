"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import type { MateViewer } from "@/components/scr003/MateComposer";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { showToast } from "@/hooks/useToast";

const REASONS = [
  { code: "SPAM", label: "스팸·광고" },
  { code: "CONTACT_EXPOSURE", label: "연락처 노출" },
  { code: "HARASSMENT", label: "괴롭힘·부적절한 언행" },
  { code: "FRAUD", label: "사기 의심" },
  { code: "OTHER", label: "기타" },
] as const;

type ReportFormProps = {
  /** 신고할 동행 글의 ID */
  postId: string;
  viewer: MateViewer;
};

type Receipt = { reportId: string; receivedAt: string };

/** 사유 코드와 설명을 받아 신고를 접수하고, 접수 ID와 시각을 바로 보여준다. */
export default function ReportForm({ postId, viewer }: ReportFormProps) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  if (viewer !== "READY") {
    return (
      <p className="text-body-sm text-muted">
        <Link
          href="/account"
          className={`${focusRingClass} rounded-sm text-info underline`}
        >
          {viewer === "GUEST" ? "로그인" : "성인 확인"}
        </Link>
        {viewer === "GUEST" ? "하면" : "을 마치면"} 부적절한 글을 신고할 수
        있어요.
      </p>
    );
  }

  if (receipt) {
    return (
      <div
        role="status"
        className="flex flex-col gap-1 rounded-md bg-success-bg px-4 py-3 text-success"
      >
        <p className="text-title-sm">
          <span aria-hidden="true">✓ </span>
          신고가 접수됐어요
        </p>
        <p className="text-body-sm">접수 번호: {receipt.reportId}</p>
        <p className="text-body-sm">
          접수 시각: {new Date(receipt.receivedAt).toLocaleString("ko-KR")}
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${touchTargetClass} ${focusRingClass} w-fit rounded-sm border border-hairline px-4 text-button text-body hover:bg-surface-soft`}
      >
        이 글 신고하기
      </button>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!reason) {
      setError("신고 사유를 선택해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/mates/${postId}/report`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reasonCode: reason,
          description: description.trim() || undefined,
        }),
      });
      if (response.status === 201) {
        setReceipt((await response.json()) as Receipt);
        showToast("신고가 접수됐어요");
        return;
      }
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setError(
        body?.error?.message ?? "신고를 접수하지 못했어요. 다시 시도해 주세요.",
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
      aria-label="글 신고"
      className="flex flex-col gap-3 rounded-md border border-hairline p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-reason`} className="text-title-sm text-ink">
          신고 사유
        </label>
        <select
          id={`${uid}-reason`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-invalid={Boolean(error && !reason)}
          className={`${touchTargetClass} ${focusRingClass} rounded-sm border border-hairline bg-canvas px-3 text-body-md text-ink`}
        >
          <option value="">사유를 선택하세요</option>
          {REASONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-desc`} className="text-title-sm text-ink">
          설명 (선택)
        </label>
        <textarea
          id={`${uid}-desc`}
          rows={3}
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${focusRingClass} rounded-sm border border-hairline bg-canvas px-3 py-2 text-body-md text-ink`}
        />
        <p className="text-body-sm text-muted">
          어떤 점이 문제인지 알려 주세요. 접수된 신고는 관리자가 확인해요.
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-body-sm text-danger">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className={`${touchTargetClass} ${focusRingClass} rounded-sm bg-coral px-6 text-button text-on-coral hover:bg-coral-hover disabled:opacity-60`}
        >
          {busy ? "접수 중..." : "신고 접수"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setOpen(false)}
          className={`${touchTargetClass} ${focusRingClass} rounded-sm border border-hairline px-4 text-button text-body`}
        >
          취소
        </button>
      </div>
    </form>
  );
}
