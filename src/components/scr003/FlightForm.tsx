"use client";

import { useId, useState, type FormEvent } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { destinations } from "@/data/destinations";
import { outboundUrlSchema } from "@/lib/validation/outbound-link.schema";

/**
 * 항공·숙소 입력값은 서버, DB, 외부 URL 쿼리, 로그, 분석 이벤트 어디로도 보내지 않는다.
 * 이 파일의 모든 상태는 React state(휘발성)로만 유지하고 네트워크 호출을 하지 않는다.
 */

// ---- 공유 헬퍼 (HotelForm도 재사용한다) -------------------------------------------------

export const COUNTRY_OPTIONS: readonly string[] = [
  ...new Set(destinations.map((d) => d.country)),
];

/** 선택한 국가에 종속된 지역(도시) 목록을 정적 여행지 데이터에서 파생한다. */
export function getRegionOptions(country: string): string[] {
  return destinations.filter((d) => d.country === country).map((d) => d.name);
}

/** 로컬 날짜를 YYYY-MM-DD로 만든다. */
export function todayString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type DateErrors = { start?: string; end?: string };

/**
 * 항공 날짜 검증: 출발일은 오늘 이후여야 하고, 귀국일은 출발일보다 빠를 수 없다
 * (같은 날 왕복은 허용한다).
 */
export function validateFlightDates(
  departure: string,
  returnDate: string,
  today: string = todayString(),
): DateErrors {
  const errors: DateErrors = {};
  if (!departure) errors.start = "출발일을 입력해 주세요.";
  else if (departure < today) errors.start = "출발일은 오늘 이후여야 해요.";
  if (!returnDate) errors.end = "귀국일을 입력해 주세요.";
  else if (departure && returnDate < departure) {
    errors.end = "귀국일은 출발일보다 빠를 수 없어요.";
  }
  return errors;
}

export function NonTransmissionNotice() {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-surface-soft px-4 py-3 text-body-sm text-info">
      <p>
        <span aria-hidden="true">ℹ </span>
        입력값은 외부 사이트로 전달되지 않습니다. 이 화면 안에서만 사용돼요.
      </p>
      <p>
        <span aria-hidden="true">ℹ </span>
        여행 정보는 공식 판단을 대체하지 않아요. 출국 전 항공사·숙소·공식 안내를
        다시 확인해 주세요.
      </p>
    </div>
  );
}

// ---- 공통 폼 ---------------------------------------------------------------------------

type TravelConditionFormProps = {
  /** 이름 접두어: "항공" | "숙소" (id, 문구에 사용) */
  kind: string;
  startLabel: string;
  endLabel: string;
  validate: (start: string, end: string) => DateErrors;
  /** 서버가 검증해 넘겨 준 외부 이동 주소. 없으면 이동을 막고 오류를 보여준다. */
  outboundUrl: string | null;
  outboundLabel: string;
};

type Step = "form" | "summary";

export function TravelConditionForm({
  kind,
  startLabel,
  endLabel,
  validate,
  outboundUrl,
  outboundLabel,
}: TravelConditionFormProps) {
  const uid = useId();
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [errors, setErrors] = useState<
    DateErrors & { country?: string; region?: string }
  >({});
  const [step, setStep] = useState<Step>("form");
  const [outboundError, setOutboundError] = useState<string | null>(null);

  const regions = country ? getRegionOptions(country) : [];
  const today = todayString();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = { ...validate(start, end) };
    if (!country) next.country = "국가를 선택해 주세요.";
    if (!region) next.region = "지역을 선택해 주세요.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setOutboundError(null);
      setStep("summary");
    }
  }

  function goOutbound() {
    const parsed = outboundUrlSchema.safeParse(outboundUrl ?? "");
    if (!parsed.success) {
      setOutboundError(
        "이동할 주소가 아직 설정되지 않았거나 안전하지 않아 이동을 막았어요. 입력한 내용은 그대로 남아 있어요.",
      );
      return;
    }
    setOutboundError(null);
    // 입력값을 주소에 붙이지 않고, 새 탭에서 opener를 끊고 연다.
    window.open(parsed.data, "_blank", "noopener,noreferrer");
  }

  const errorList = Object.values(errors).filter(Boolean) as string[];

  if (step === "summary") {
    return (
      <div className="flex flex-col gap-5">
        <h3 className="text-title-md text-ink">입력한 조건을 확인해 주세요</h3>
        <dl className="grid grid-cols-1 gap-3 rounded-md border border-hairline bg-canvas p-lg sm:grid-cols-2">
          <div>
            <dt className="text-caption text-muted">국가</dt>
            <dd className="text-body-md text-ink">{country}</dd>
          </div>
          <div>
            <dt className="text-caption text-muted">지역</dt>
            <dd className="text-body-md text-ink">{region}</dd>
          </div>
          <div>
            <dt className="text-caption text-muted">{startLabel}</dt>
            <dd className="text-body-md text-ink">{start}</dd>
          </div>
          <div>
            <dt className="text-caption text-muted">{endLabel}</dt>
            <dd className="text-body-md text-ink">{end}</dd>
          </div>
        </dl>
        <NonTransmissionNotice />
        {outboundError ? (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-md bg-danger-bg px-4 py-3 text-body-md text-danger"
          >
            <p>
              <span aria-hidden="true">⚠ </span>
              {outboundError}
            </p>
            <button
              type="button"
              onClick={goOutbound}
              className={`${touchTargetClass} ${focusRingClass} w-fit rounded-sm border border-danger px-4 text-button`}
            >
              다시 시도
            </button>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={goOutbound}
            className={`${touchTargetClass} ${focusRingClass} rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
          >
            {outboundLabel} (새 탭)
          </button>
          <button
            type="button"
            onClick={() => setStep("form")}
            className={`${touchTargetClass} ${focusRingClass} rounded-sm border border-coral px-6 py-3 text-button text-coral hover:bg-coral-tint`}
          >
            수정하기
          </button>
        </div>
      </div>
    );
  }

  const fieldClass = `${touchTargetClass} ${focusRingClass} rounded-sm border bg-canvas px-3 text-body-md text-ink`;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label={`${kind} 여행 조건`}
      className="flex flex-col gap-5"
    >
      {errorList.length > 0 ? (
        <div
          role="alert"
          className="rounded-md bg-danger-bg px-4 py-3 text-body-md text-danger"
        >
          <p className="text-title-sm">
            <span aria-hidden="true">⚠ </span>
            입력한 내용을 확인해 주세요
          </p>
          <ul className="mt-1 list-disc pl-5">
            {errorList.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-country`} className="text-title-sm text-ink">
            국가
          </label>
          <select
            id={`${uid}-country`}
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setRegion(""); // 국가가 바뀌면 지역을 초기화한다.
            }}
            aria-invalid={Boolean(errors.country)}
            aria-describedby={`${uid}-country-help`}
            className={`${fieldClass} ${errors.country ? "border-danger" : "border-hairline"}`}
          >
            <option value="">국가를 선택하세요</option>
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p
            id={`${uid}-country-help`}
            className={`text-body-sm ${errors.country ? "text-danger" : "text-muted"}`}
          >
            {errors.country ?? "여행할 국가를 먼저 골라 주세요."}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-region`} className="text-title-sm text-ink">
            지역
          </label>
          <select
            id={`${uid}-region`}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={!country}
            aria-invalid={Boolean(errors.region)}
            aria-describedby={`${uid}-region-help`}
            className={`${fieldClass} ${errors.region ? "border-danger" : "border-hairline"}`}
          >
            <option value="">지역을 선택하세요</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <p
            id={`${uid}-region-help`}
            className={`text-body-sm ${errors.region ? "text-danger" : "text-muted"}`}
          >
            {errors.region ?? "선택한 국가의 도시 중에서 골라요."}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-start`} className="text-title-sm text-ink">
            {startLabel}
          </label>
          <input
            id={`${uid}-start`}
            type="date"
            min={today}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            aria-invalid={Boolean(errors.start)}
            aria-describedby={`${uid}-start-help`}
            className={`${fieldClass} ${errors.start ? "border-danger" : "border-hairline"}`}
          />
          <p
            id={`${uid}-start-help`}
            className={`text-body-sm ${errors.start ? "text-danger" : "text-muted"}`}
          >
            {errors.start ?? "오늘 이후의 날짜를 입력해 주세요."}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-end`} className="text-title-sm text-ink">
            {endLabel}
          </label>
          <input
            id={`${uid}-end`}
            type="date"
            min={start || today}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            aria-invalid={Boolean(errors.end)}
            aria-describedby={`${uid}-end-help`}
            className={`${fieldClass} ${errors.end ? "border-danger" : "border-hairline"}`}
          />
          <p
            id={`${uid}-end-help`}
            className={`text-body-sm ${errors.end ? "text-danger" : "text-muted"}`}
          >
            {errors.end ?? `${startLabel} 이후의 날짜를 입력해 주세요.`}
          </p>
        </div>
      </div>

      <NonTransmissionNotice />

      <button
        type="submit"
        className={`${touchTargetClass} ${focusRingClass} w-fit rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
      >
        조건 확인하기
      </button>
    </form>
  );
}

// ---- 항공 폼 ---------------------------------------------------------------------------

type FlightFormProps = {
  /** 서버가 읽어 검증한 FLIGHT_OUTBOUND_URL. 없으면 이동을 막고 오류를 보여준다. */
  outboundUrl: string | null;
};

export default function FlightForm({ outboundUrl }: FlightFormProps) {
  return (
    <TravelConditionForm
      kind="항공"
      startLabel="출발일"
      endLabel="귀국일"
      validate={(start, end) => validateFlightDates(start, end)}
      outboundUrl={outboundUrl}
      outboundLabel="항공권 검색 사이트로 이동"
    />
  );
}
