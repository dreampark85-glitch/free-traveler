"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import type { Destination } from "@/data/destinations.schema";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { getRelatedDestinations } from "./DestinationExplorer";
import SafetyDrawer from "./SafetyDrawer";

type DestinationDrawerProps = {
  /** 열려 있는 여행지. null이면 Drawer를 렌더링하지 않는다. */
  destination: Destination | null;
  onClose: () => void;
  /** 관련 여행지를 선택하면 같은 Drawer에서 그 여행지로 바꾼다. */
  onSelectRelated?: (destination: Destination) => void;
};

const krw = new Intl.NumberFormat("ko-KR");

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-title-sm text-ink">{title}</h3>
      {children}
    </section>
  );
}

export default function DestinationDrawer({
  destination,
  onClose,
  onSelectRelated,
}: DestinationDrawerProps) {
  const open = destination !== null;
  const [safetyCountry, setSafetyCountry] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const safetyOpenRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    safetyOpenRef.current = safetyCountry !== null;
  }, [safetyCountry]);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      // 안전정보 패널이 위에 열려 있으면 그 패널이 먼저 닫힌다.
      if (event.key === "Escape" && !safetyOpenRef.current) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!destination) return null;
  const d = destination;
  const related = getRelatedDestinations(d);

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end">
        <button
          type="button"
          aria-label="여행지 상세 닫기"
          tabIndex={-1}
          onClick={onClose}
          className="absolute inset-0 bg-scrim"
        />
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="destination-drawer-title"
          className="relative flex h-full w-full flex-col bg-canvas shadow-card md:max-w-[540px] md:rounded-l-lg"
        >
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3 md:px-6">
            <h2
              id="destination-drawer-title"
              className="text-title-md text-ink"
            >
              {d.name}
              <span className="ml-2 text-body-sm text-muted">{d.country}</span>
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

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5 md:px-6">
            {d.image ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-surface-soft">
                <Image
                  src={d.image.src}
                  alt={d.image.alt}
                  fill
                  unoptimized
                  sizes="540px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <p className="text-body-lg text-body">{d.summary}</p>

            <Section title="추천 시기">
              <p className="text-body-md text-body">
                {d.bestSeasons.join(" · ")}
              </p>
            </Section>

            <Section title="대표 명소">
              <ul className="list-disc pl-5 text-body-md text-body">
                {d.attractions.map((a) => (
                  <li key={a.name}>{a.name}</li>
                ))}
              </ul>
            </Section>

            <Section title="1일 일정">
              <ol className="list-decimal pl-5 text-body-md text-body">
                {d.itinerary.oneDay.map((place) => (
                  <li key={place}>{place}</li>
                ))}
              </ol>
            </Section>

            <Section title="3일 일정">
              <ul className="flex flex-col gap-1 text-body-md text-body">
                {d.itinerary.threeDay.map((day, index) => (
                  <li key={index}>
                    <span className="text-ink">{index + 1}일차</span>{" "}
                    {day.join(" → ")}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="예산">
              <p className="text-body-md text-body">
                1인 하루 약 {krw.format(d.budgetPerDayKRW.min)}원 ~{" "}
                {krw.format(d.budgetPerDayKRW.max)}원 (항공권 제외)
              </p>
            </Section>

            <Section title="교통">
              <p className="text-body-md text-body">{d.transport}</p>
            </Section>

            <Section title="대표 음식">
              <ul className="list-disc pl-5 text-body-md text-body">
                {d.foods.map((f) => (
                  <li key={f.name}>{f.name}</li>
                ))}
              </ul>
            </Section>

            <Section title="여행 에티켓">
              <ul className="list-disc pl-5 text-body-md text-body">
                {d.etiquette.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Section>

            {d.scope === "OVERSEAS" ? (
              <button
                type="button"
                onClick={() => setSafetyCountry(d.countryCode)}
                className={`${touchTargetClass} ${focusRingClass} rounded-sm border border-coral px-6 py-3 text-button text-coral hover:bg-coral-tint`}
              >
                이 국가 안전정보 보기
              </button>
            ) : null}

            {related.length > 0 ? (
              <Section title="함께 보면 좋은 여행지">
                <ul className="flex flex-wrap gap-2">
                  {related.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => onSelectRelated?.(r)}
                        className={`${touchTargetClass} ${focusRingClass} rounded-full bg-surface-strong px-4 text-body-sm text-body hover:text-coral`}
                      >
                        {r.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            <p className="border-t border-hairline pt-4 text-body-sm text-muted">
              출처:{" "}
              <a
                href={d.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${focusRingClass} rounded-sm text-info underline`}
              >
                {d.sourceName}
              </a>{" "}
              · 수정일 {d.updatedAt}
              {d.reviewStatus === "DRAFT" ? " · 출처 대조 전 초안" : ""}
            </p>
          </div>
        </div>
      </div>

      <SafetyDrawer
        countryCode={safetyCountry}
        onClose={() => setSafetyCountry(null)}
      />
    </>
  );
}
