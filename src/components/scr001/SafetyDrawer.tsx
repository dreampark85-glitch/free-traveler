"use client";

import { useEffect, useRef } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import {
  SAFETY_CATEGORIES,
  SAFETY_CATEGORY_LABELS,
  getCountrySafety,
  isSafetyStale,
  type AdvisoryLevel,
  type CountrySafety,
} from "@/data/country-safety";

type SafetyDrawerProps = {
  /** 안전정보를 보여줄 국가 코드. 열려 있는 동안만 의미가 있다. */
  countryCode: string | null;
  onClose: () => void;
};

const ADVISORY_LABELS: Record<AdvisoryLevel, string> = {
  UNVERIFIED: "여행경보 단계 확인 전",
  NONE: "여행경보 없음",
  CAUTION: "여행유의",
  RESTRAINT: "여행자제",
  EVACUATION_ADVISED: "출국권고",
  BAN: "여행금지",
};

const SERIOUS: readonly AdvisoryLevel[] = [
  "RESTRAINT",
  "EVACUATION_ADVISED",
  "BAN",
];

function AdvisoryBanner({ safety }: { safety: CountrySafety }) {
  const level = safety.advisoryLevel;
  if (SERIOUS.includes(level)) {
    return (
      <p
        role="alert"
        className="rounded-md bg-danger-bg px-4 py-3 text-body-md text-danger"
      >
        <span aria-hidden="true">🚫 </span>
        {ADVISORY_LABELS[level]} 지역입니다. 출국 전 공식 원문을 반드시 확인해
        주세요.
      </p>
    );
  }
  if (level === "UNVERIFIED") {
    return (
      <p className="rounded-md bg-warning-bg px-4 py-3 text-body-md text-warning">
        <span aria-hidden="true">⚠ </span>
        여행경보 단계 확인 전입니다. 출국 전 외교부 해외안전여행에서 현재 경보를
        다시 확인해 주세요.
      </p>
    );
  }
  return (
    <p className="rounded-md bg-surface-soft px-4 py-3 text-body-md text-body">
      현재 여행경보: {ADVISORY_LABELS[level]}
    </p>
  );
}

export default function SafetyDrawer({
  countryCode,
  onClose,
}: SafetyDrawerProps) {
  const open = countryCode !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  const safety = getCountrySafety(countryCode);
  const stale = safety ? isSafetyStale(safety.verifiedAt) : false;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="안전정보 닫기"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-scrim"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-drawer-title"
        className="relative flex h-full w-full flex-col bg-canvas shadow-card md:max-w-[520px] md:rounded-l-lg"
      >
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3 md:px-6">
          <h2 id="safety-drawer-title" className="text-title-md text-ink">
            {safety ? `${safety.country} 안전정보` : "안전정보"}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm`}
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5 md:px-6">
          {safety ? (
            <>
              <AdvisoryBanner safety={safety} />

              <p className="text-body-sm text-muted">
                공식 판단을 대체하지 않습니다. 출국 전 원문을 다시 확인해
                주세요.
              </p>

              <p className="text-body-sm text-muted">
                적용 범위:{" "}
                {safety.scope.scopeType === "COUNTRY"
                  ? "국가 전체"
                  : `지역 한정 — ${safety.scope.scopeText}`}
                {safety.scope.scopeType === "COUNTRY" && safety.scope.scopeText
                  ? ` (${safety.scope.scopeText})`
                  : ""}
              </p>

              {stale ? (
                <p className="w-fit rounded-full bg-warning-bg px-3 py-1 text-caption text-warning">
                  <span aria-hidden="true">⚠ </span>재확인 필요
                  {safety.verifiedAt
                    ? ` (마지막 확인 ${safety.verifiedAt})`
                    : " (아직 공식 출처와 대조하지 않았어요)"}
                </p>
              ) : null}

              {SAFETY_CATEGORIES.map((category) => (
                <section
                  key={category}
                  aria-labelledby={`safety-${category}`}
                  className="flex flex-col gap-1"
                >
                  <h3
                    id={`safety-${category}`}
                    className="text-title-sm text-ink"
                  >
                    {SAFETY_CATEGORY_LABELS[category]}
                  </h3>
                  {category === "emergency" ? (
                    <ul className="flex flex-col gap-1 text-body-md text-body">
                      {safety.emergencyContacts.map((contact) => (
                        <li key={`${contact.label}-${contact.phone}`}>
                          {contact.label}:{" "}
                          <a
                            href={`tel:${contact.phone.replaceAll(" ", "")}`}
                            className={`${focusRingClass} rounded-sm text-info underline`}
                          >
                            {contact.phone}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-body-md text-body">
                      {safety.sections[category]}
                    </p>
                  )}
                </section>
              ))}

              <section
                aria-labelledby="safety-source"
                className="flex flex-col gap-1 border-t border-hairline pt-4"
              >
                <h3 id="safety-source" className="text-title-sm text-ink">
                  출처
                </h3>
                <p className="text-body-sm text-muted">
                  {safety.sourceName} · 확인일 {safety.verifiedAt ?? "확인 전"}{" "}
                  · 편집 {safety.editor}
                </p>
                <a
                  href={safety.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${touchTargetClass} ${focusRingClass} inline-flex items-center rounded-sm text-body-md text-info underline`}
                >
                  외교부 해외안전여행에서 원문 확인하기 (새 탭)
                </a>
              </section>
            </>
          ) : (
            <p className="text-body-md text-body">
              이 국가의 안전정보를 아직 준비하지 못했어요. 외교부 해외안전여행
              원문에서 직접 확인해 주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
