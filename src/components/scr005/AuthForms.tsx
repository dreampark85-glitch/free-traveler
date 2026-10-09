"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { showToast } from "@/hooks/useToast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "reset";

const MODES: { key: Mode; label: string }[] = [
  { key: "login", label: "로그인" },
  { key: "signup", label: "가입" },
  { key: "reset", label: "비밀번호 재설정" },
];

const MIN_PASSWORD = 8;

const input = `${touchTargetClass} ${focusRingClass} rounded-sm border border-hairline bg-canvas px-3 text-body-md text-ink`;

/** 인증 오류를 사용자에게 보여줄 한국어 문장으로 바꾼다(원문 메시지는 노출하지 않는다). */
function friendlyError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("invalid login")) {
    return "이메일 또는 비밀번호가 맞지 않아요.";
  }
  if (text.includes("not confirmed")) {
    return "이메일 인증을 아직 마치지 않았어요. 받은 편지함의 인증 메일을 확인해 주세요.";
  }
  if (text.includes("already")) {
    return "이미 가입된 이메일이에요. 로그인하거나 비밀번호를 재설정해 주세요.";
  }
  if (text.includes("rate") || text.includes("too many")) {
    return "요청이 너무 많았어요. 잠시 뒤 다시 시도해 주세요.";
  }
  return "처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.";
}

/** 로그인·가입·비밀번호 재설정 폼 3종을 한 카드에서 전환한다. */
export default function AuthForms() {
  const uid = useId();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function changeMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
    setPassword("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    if (mode !== "reset" && password.length < MIN_PASSWORD) {
      setError(`비밀번호는 ${MIN_PASSWORD}자 이상이어야 해요.`);
      return;
    }

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const callback = `${window.location.origin}/auth/callback`;
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        showToast("로그인했어요");
        // 서버가 새 세션 쿠키로 역할별 화면을 다시 그리도록 서버 컴포넌트를 새로 받는다.
        router.refresh();
      } else if (mode === "signup") {
        const { error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${callback}?next=/account` },
        });
        if (authError) throw authError;
        setNotice(
          "인증 메일을 보냈어요. 메일의 링크를 눌러 인증을 마치면 로그인할 수 있어요.",
        );
      } else {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${callback}?next=/account` },
        );
        if (authError) throw authError;
        setNotice(
          "입력한 주소가 가입된 이메일이라면 재설정 메일을 보냈어요. 받은 편지함을 확인해 주세요.",
        );
      }
    } catch (caught) {
      setError(
        friendlyError(
          caught instanceof Error ? caught.message : String(caught),
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  const submitLabel =
    mode === "login"
      ? "로그인"
      : mode === "signup"
        ? "가입하기"
        : "재설정 메일 보내기";

  return (
    <div className="flex flex-col gap-5 rounded-md border border-hairline bg-canvas p-lg">
      <div
        role="tablist"
        aria-label="계정 인증"
        className="flex flex-wrap gap-2"
      >
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={mode === m.key}
            onClick={() => changeMode(m.key)}
            className={`${touchTargetClass} ${focusRingClass} rounded-full px-4 text-title-sm ${
              mode === m.key
                ? "bg-coral text-on-coral"
                : "bg-surface-strong text-body hover:text-coral"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        aria-label={MODES.find((m) => m.key === mode)?.label}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-email`} className="text-title-sm text-ink">
            이메일
          </label>
          <input
            id={`${uid}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
        </div>

        {mode !== "reset" ? (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`${uid}-password`}
              className="text-title-sm text-ink"
            >
              비밀번호
            </label>
            <input
              id={`${uid}-password`}
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={`${uid}-password-help`}
              className={input}
            />
            <p id={`${uid}-password-help`} className="text-body-sm text-muted">
              {MIN_PASSWORD}자 이상 입력해 주세요.
            </p>
          </div>
        ) : (
          <p className="text-body-sm text-muted">
            가입한 이메일을 입력하면 비밀번호를 다시 정할 수 있는 링크를 보내
            드려요.
          </p>
        )}

        {error ? (
          <p
            role="alert"
            className="rounded-md bg-danger-bg px-4 py-3 text-body-md text-danger"
          >
            <span aria-hidden="true">⚠ </span>
            {error}
          </p>
        ) : null}
        {notice ? (
          <p
            role="status"
            className="rounded-md bg-success-bg px-4 py-3 text-body-md text-success"
          >
            <span aria-hidden="true">✓ </span>
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className={`${touchTargetClass} ${focusRingClass} w-fit rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover disabled:opacity-60`}
        >
          {busy ? "처리 중..." : submitLabel}
        </button>
      </form>
    </div>
  );
}

/** 로그아웃 버튼. 세션을 끝내고 서버 화면을 새로 받아 Guest 화면으로 돌아간다. */
export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={`${touchTargetClass} ${focusRingClass} rounded-sm border border-hairline px-4 text-button text-body hover:bg-surface-soft disabled:opacity-60`}
    >
      {busy ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
