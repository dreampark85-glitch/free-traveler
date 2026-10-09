"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { destinations } from "@/data/destinations";
import { DESTINATION_THEMES } from "@/data/destinations.schema";
import { todayString } from "./FlightForm";

/** 동행 안전수칙 정책 버전. /safety-guidelines 페이지에 표시되는 버전과 같은 값이다. */
export const SAFETY_POLICY_VERSION = "safety-guidelines-2026-10-09-draft";

// ---- 연락처 패턴 탐지 (REQ-FUNC-032) --------------------------------------------------

export type ContactKind = "phone" | "email" | "messenger";

const PHONE_PATTERNS = [
  /01[016789][\s.\-)]*\d{3,4}[\s.\-]*\d{4}/, // 휴대전화
  /\b0\d{1,2}[\s.\-)]+\d{3,4}[\s.\-]+\d{4}\b/, // 지역번호
  /\+\d{1,3}[\s.\-]?\d{1,4}[\s.\-]?\d{3,4}[\s.\-]?\d{3,4}/, // 국제번호
  /공\s*일\s*공[\s\-.]*[0-9공일이삼사오육칠팔구]{3,}/, // 한글 숫자로 쓴 번호
];

const EMAIL_PATTERNS = [
  /[\w.+-]+\s*(?:@|\(at\)|\[at\]|\s+at\s+|\s앳\s|골뱅이)\s*[\w-]+\s*(?:\.|\(dot\)|\[dot\]|\s+dot\s+|\s점\s|닷)\s*[a-z]{2,}/i,
];

const MESSENGER_PATTERNS = [
  /(?:카카오톡|카톡|카카오|오픈\s*채팅|라인|line|텔레그램|텔레|telegram|인스타그램|인스타|instagram|왓츠앱|whatsapp|위챗|wechat|디엠|dm)\s*(?:아이디|id|계정)?\s*[:：=]?\s*@?[a-z0-9][a-z0-9._-]{2,}/i,
  /(?:open\.kakao\.com|t\.me|line\.me|wa\.me|instagram\.com|discord\.gg)\/?\S*/i,
  /(?:^|\s)@[a-z0-9._]{4,}/i,
];

/**
 * 글 안에 전화번호·이메일·메신저 ID로 보이는 내용이 있는지 찾는다.
 * 서버에서도 같은 기준으로 다시 확인해야 하므로(이중 방어) 이 함수는 순수 함수로 둔다.
 */
export function detectContact(text: string): ContactKind[] {
  const found: ContactKind[] = [];
  if (PHONE_PATTERNS.some((p) => p.test(text))) found.push("phone");
  if (EMAIL_PATTERNS.some((p) => p.test(text))) found.push("email");
  if (MESSENGER_PATTERNS.some((p) => p.test(text))) found.push("messenger");
  return found;
}

const KIND_LABEL: Record<ContactKind, string> = {
  phone: "전화번호",
  email: "이메일 주소",
  messenger: "메신저·SNS 아이디",
};

// ---- 컴포넌트 ---------------------------------------------------------------------------

export type MateViewer = "GUEST" | "NOT_ADULT" | "READY";

type MateComposerProps = {
  /** 서버가 세션과 성인 확인 여부로 판단한 사용자 상태 */
  viewer: MateViewer;
};

const COUNTRIES = [
  ...new Map(destinations.map((d) => [d.countryCode, d.country])).entries(),
];

type FieldErrors = Partial<
  Record<
    | "title"
    | "country"
    | "region"
    | "startDate"
    | "endDate"
    | "capacity"
    | "styles"
    | "description"
    | "consent",
    string
  >
>;

const fieldBase = `${touchTargetClass} ${focusRingClass} rounded-sm border bg-canvas px-3 text-body-md text-ink`;

export default function MateComposer({ viewer }: MateComposerProps) {
  const uid = useId();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [region, setRegion] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [styles, setStyles] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (viewer !== "READY") {
    const guest = viewer === "GUEST";
    return (
      <div className="flex flex-col gap-4 rounded-md bg-surface-soft px-6 py-10">
        <h3 className="text-title-md text-ink">
          {guest
            ? "로그인하고 성인 확인을 완료하면 동행을 모집할 수 있어요"
            : "성인 확인을 마치면 동행을 모집할 수 있어요"}
        </h3>
        <p className="text-body-md text-body">
          동행 모집은 만 19세 이상 회원만 이용할 수 있어요.{" "}
          {guest
            ? "계정 화면에서 가입하거나 로그인한 뒤 성인 확인을 마쳐 주세요."
            : "계정 화면의 프로필에서 성인 확인을 완료해 주세요."}
        </p>
        <ul className="list-disc pl-5 text-body-md text-body">
          <li>처음 만날 때는 낮 시간대의 사람이 많은 공공장소를 고르세요.</li>
          <li>글에는 전화번호나 메신저 아이디를 적지 않아요.</li>
          <li>
            <Link
              href="/safety-guidelines"
              className={`${focusRingClass} rounded-sm text-info underline`}
            >
              동행 안전수칙
            </Link>
            을 먼저 읽어 보세요.
          </li>
        </ul>
        <Link
          href="/account"
          className={`${touchTargetClass} ${focusRingClass} w-fit rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
        >
          {guest ? "로그인·가입하러 가기" : "성인 확인하러 가기"}
        </Link>
      </div>
    );
  }

  function toggleStyle(style: string) {
    setStyles((current) =>
      current.includes(style)
        ? current.filter((s) => s !== style)
        : [...current, style],
    );
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const today = todayString();
    if (title.trim().length < 2) next.title = "제목을 2자 이상 입력해 주세요.";
    if (!countryCode) next.country = "국가를 선택해 주세요.";
    if (!region) next.region = "지역을 선택해 주세요.";
    if (!startDate) next.startDate = "시작일을 입력해 주세요.";
    else if (startDate < today) {
      next.startDate = "시작일은 오늘 이후여야 해요.";
    }
    if (!endDate) next.endDate = "종료일을 입력해 주세요.";
    else if (startDate && endDate < startDate) {
      next.endDate = "종료일은 시작일보다 빠를 수 없어요.";
    }
    const people = Number(capacity);
    if (!Number.isInteger(people) || people < 1 || people > 10) {
      next.capacity = "모집 인원은 1~10명으로 입력해 주세요.";
    }
    if (styles.length === 0) {
      next.styles = "여행 스타일을 1개 이상 선택해 주세요.";
    }
    if (description.trim().length === 0) {
      next.description = "동행에게 알리고 싶은 내용을 적어 주세요.";
    }
    const kinds = detectContact(`${title}\n${description}`);
    if (kinds.length > 0) {
      next.description = `${kinds.map((k) => KIND_LABEL[k]).join(", ")}로 보이는 내용이 있어요. 연락처는 지우고, 대화는 참가 요청 메시지 안에서 시작해 주세요.`;
    }
    if (!consent) next.consent = "동행 안전수칙에 동의해 주세요.";
    return next;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/mates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          countryCode,
          region,
          startDate,
          endDate,
          capacity: Number(capacity),
          travelStyles: styles,
          description: description.trim(),
          safetyAgreed: true,
          policyVersion: SAFETY_POLICY_VERSION,
        }),
      });
      if (response.status === 201) {
        router.push("/mates");
        return;
      }
      const body = (await response.json().catch(() => null)) as {
        error?: { code?: string; message?: string };
      } | null;
      if (response.status === 401) {
        setFormError("로그인 상태가 끝났어요. 다시 로그인한 뒤 올려 주세요.");
      } else {
        setFormError(
          body?.error?.message ?? "글을 올리지 못했어요. 다시 시도해 주세요.",
        );
      }
    } catch {
      setFormError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  const regions = countryCode
    ? destinations
        .filter((d) => d.countryCode === countryCode)
        .map((d) => d.name)
    : [];
  const errorMessages = Object.values(errors).filter(Boolean) as string[];

  const help = (key: keyof FieldErrors, fallback: string) => (
    <p
      id={`${uid}-${key}-help`}
      className={`text-body-sm ${errors[key] ? "text-danger" : "text-muted"}`}
    >
      {errors[key] ?? fallback}
    </p>
  );
  const border = (key: keyof FieldErrors) =>
    errors[key] ? "border-danger" : "border-hairline";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="동행 모집글 작성"
      className="flex flex-col gap-5"
    >
      {errorMessages.length > 0 || formError ? (
        <div
          role="alert"
          className="rounded-md bg-danger-bg px-4 py-3 text-body-md text-danger"
        >
          <p className="text-title-sm">
            <span aria-hidden="true">⚠ </span>
            {formError ?? "입력한 내용을 확인해 주세요"}
          </p>
          {errorMessages.length > 0 ? (
            <ul className="mt-1 list-disc pl-5">
              {errorMessages.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-title`} className="text-title-sm text-ink">
          제목
        </label>
        <input
          id={`${uid}-title`}
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={`${uid}-title-help`}
          className={`${fieldBase} ${border("title")}`}
        />
        {help(
          "title",
          "어디를 어떻게 함께 여행하고 싶은지 한 줄로 적어 주세요.",
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-country`} className="text-title-sm text-ink">
            국가
          </label>
          <select
            id={`${uid}-country`}
            value={countryCode}
            onChange={(e) => {
              setCountryCode(e.target.value);
              setRegion("");
            }}
            aria-invalid={Boolean(errors.country)}
            aria-describedby={`${uid}-country-help`}
            className={`${fieldBase} ${border("country")}`}
          >
            <option value="">국가를 선택하세요</option>
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          {help("country", "여행할 국가를 골라 주세요.")}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-region`} className="text-title-sm text-ink">
            지역
          </label>
          <select
            id={`${uid}-region`}
            value={region}
            disabled={!countryCode}
            onChange={(e) => setRegion(e.target.value)}
            aria-invalid={Boolean(errors.region)}
            aria-describedby={`${uid}-region-help`}
            className={`${fieldBase} ${border("region")}`}
          >
            <option value="">지역을 선택하세요</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {help("region", "선택한 국가의 도시 중에서 골라요.")}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-start`} className="text-title-sm text-ink">
            시작일
          </label>
          <input
            id={`${uid}-start`}
            type="date"
            min={todayString()}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-invalid={Boolean(errors.startDate)}
            aria-describedby={`${uid}-startDate-help`}
            className={`${fieldBase} ${border("startDate")}`}
          />
          {help("startDate", "오늘 이후의 날짜를 입력해 주세요.")}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-end`} className="text-title-sm text-ink">
            종료일
          </label>
          <input
            id={`${uid}-end`}
            type="date"
            min={startDate || todayString()}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            aria-invalid={Boolean(errors.endDate)}
            aria-describedby={`${uid}-endDate-help`}
            className={`${fieldBase} ${border("endDate")}`}
          />
          {help("endDate", "시작일 이후의 날짜를 입력해 주세요.")}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-capacity`} className="text-title-sm text-ink">
            모집 인원
          </label>
          <input
            id={`${uid}-capacity`}
            type="number"
            min={1}
            max={10}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            aria-invalid={Boolean(errors.capacity)}
            aria-describedby={`${uid}-capacity-help`}
            className={`${fieldBase} ${border("capacity")}`}
          />
          {help("capacity", "본인을 제외하고 1~10명까지 모집할 수 있어요.")}
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-title-sm text-ink">여행 스타일</legend>
        <ul className="flex flex-wrap gap-2">
          {DESTINATION_THEMES.map((theme) => {
            const active = styles.includes(theme);
            return (
              <li key={theme}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleStyle(theme)}
                  className={`${touchTargetClass} ${focusRingClass} rounded-full px-4 text-body-md ${
                    active
                      ? "bg-coral text-on-coral"
                      : "bg-surface-strong text-body hover:text-coral"
                  }`}
                >
                  {theme}
                </button>
              </li>
            );
          })}
        </ul>
        {help("styles", "함께하고 싶은 여행 방식을 모두 골라 주세요.")}
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-desc`} className="text-title-sm text-ink">
          설명
        </label>
        <textarea
          id={`${uid}-desc`}
          rows={6}
          maxLength={3000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={`${uid}-description-help`}
          className={`${fieldBase} ${border("description")} py-2`}
        />
        {help(
          "description",
          "일정, 비용 분담 방식, 원하는 동행 분위기를 적어 주세요. 연락처는 적지 마세요.",
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-3 text-body-md text-ink">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={`${uid}-consent-help`}
            className={`${focusRingClass} mt-1 size-5 accent-coral`}
          />
          <span>
            <Link
              href="/safety-guidelines"
              target="_blank"
              rel="noopener noreferrer"
              className={`${focusRingClass} rounded-sm text-info underline`}
            >
              동행 안전수칙
            </Link>
            을 읽었고 동의해요. (동의한 시각과 버전이 함께 기록돼요.)
          </span>
        </label>
        {help("consent", "동의해야 글을 올릴 수 있어요.")}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`${touchTargetClass} ${focusRingClass} w-fit rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover disabled:opacity-60`}
      >
        {submitting ? "올리는 중..." : "동행글 올리기"}
      </button>
    </form>
  );
}
