"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";

export const TABS = [
  { key: "flight", label: "비행기 찾기" },
  { key: "hotel", label: "숙소 찾기" },
  { key: "mate", label: "동행 구하기" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

type TabSwitcherProps = {
  /**
   * 탭별 내용. 세 패널을 모두 마운트해 두고 활성 탭만 보여주므로,
   * 탭을 오가도 각 탭의 입력 상태가 서로 독립적으로 유지된다.
   */
  panels: Record<TabKey, ReactNode>;
};

function isTabKey(value: string | null): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

/** 활성 탭은 URL의 `tab` query로 유지하므로 새로고침·공유 후에도 같은 탭이 열린다. */
export default function TabSwitcher({ panels }: TabSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    flight: null,
    hotel: null,
    mate: null,
  });

  const param = searchParams.get("tab");
  const active: TabKey = isTabKey(param) ? param : "flight";

  function select(key: TabKey, focus = false) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    if (focus) tabRefs.current[key]?.focus();
  }

  function onKeyDown(event: KeyboardEvent, index: number) {
    let target = -1;
    if (event.key === "ArrowRight") target = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") {
      target = (index - 1 + TABS.length) % TABS.length;
    } else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = TABS.length - 1;
    if (target >= 0) {
      event.preventDefault();
      select(TABS[target].key, true);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="여행 준비 종류"
        className="flex w-full gap-2 overflow-x-auto"
      >
        {TABS.map((tab, index) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              ref={(el) => {
                tabRefs.current[tab.key] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.key)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`${touchTargetClass} ${focusRingClass} whitespace-nowrap rounded-full px-5 text-title-sm ${
                selected
                  ? "bg-coral text-on-coral"
                  : "bg-surface-strong text-body hover:text-coral"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`panel-${tab.key}`}
          aria-labelledby={`tab-${tab.key}`}
          hidden={tab.key !== active}
        >
          {panels[tab.key]}
        </div>
      ))}
    </div>
  );
}
