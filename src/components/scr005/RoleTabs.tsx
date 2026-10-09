"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";

export type AccountRole = "GUEST" | "MEMBER" | "ADMIN";
export type AccountTab = "guest" | "profile" | "activity" | "admin";

/** 역할마다 렌더링하는 탭. 여기에 없는 탭은 버튼도 패널도 DOM에 만들지 않는다. */
const TABS_BY_ROLE: Record<
  AccountRole,
  readonly { key: AccountTab; label: string }[]
> = {
  GUEST: [{ key: "guest", label: "로그인·가입" }],
  MEMBER: [
    { key: "profile", label: "프로필" },
    { key: "activity", label: "내 활동" },
  ],
  ADMIN: [
    { key: "profile", label: "프로필" },
    { key: "activity", label: "내 활동" },
    { key: "admin", label: "관리자" },
  ],
};

type RoleTabsProps = {
  /** 서버가 세션과 프로필(role)로 판정한 역할 */
  role: AccountRole;
  /**
   * 탭별 내용. 서버(Page)는 이 역할이 볼 수 있는 패널만 만들어 넘겨야 한다.
   * 특히 admin 패널은 role이 ADMIN일 때만 만든다. 이 컴포넌트는 역할에 없는 패널을
   * 넘겨받아도 그리지 않지만, 그 내용이 응답에 실리는 것은 서버가 막아야 한다.
   * 데이터 접근은 어느 경우에나 서버(RLS)가 다시 확인한다.
   */
  panels: Partial<Record<AccountTab, ReactNode>>;
};

export default function RoleTabs({ role, panels }: RoleTabsProps) {
  const tabs = TABS_BY_ROLE[role];
  const [active, setActive] = useState<AccountTab>(tabs[0].key);

  // 역할이 바뀌어 현재 탭이 없어지면 첫 탭으로 돌아간다.
  const current = tabs.some((tab) => tab.key === active) ? active : tabs[0].key;

  function onKeyDown(event: KeyboardEvent, index: number) {
    let target = -1;
    if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") {
      target = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = tabs.length - 1;
    if (target >= 0) {
      event.preventDefault();
      setActive(tabs[target].key);
      document.getElementById(`account-tab-${tabs[target].key}`)?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="계정 메뉴"
        className="flex w-full gap-2 overflow-x-auto"
      >
        {tabs.map((tab, index) => {
          const selected = tab.key === current;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`account-tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`account-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.key)}
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

      <div
        role="tabpanel"
        id={`account-panel-${current}`}
        aria-labelledby={`account-tab-${current}`}
      >
        {panels[current]}
      </div>
    </div>
  );
}
