"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export type NavItem = { label: string; href: string };

type MobileNavSheetProps = {
  items: readonly NavItem[];
  isActive: (href: string) => boolean;
  accountHref: string;
  accountLabel: string;
};

/** Mobile 전용 전체화면 메뉴 시트. Esc 키 또는 닫기 버튼으로 닫는다. */
export default function MobileNavSheet({
  items,
  isActive,
  accountHref,
  accountLabel,
}: MobileNavSheetProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="메뉴 열기"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm text-ink md:hidden`}
      >
        <span aria-hidden="true" className="text-xl leading-none">
          ☰
        </span>
      </button>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="전체 메뉴"
          className="fixed inset-0 z-50 flex flex-col bg-canvas md:hidden"
        >
          <div className="flex h-14 items-center justify-between border-b border-hairline px-4">
            <span className="text-title-sm text-ink">메뉴</span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="메뉴 닫기"
              className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm text-ink`}
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ×
              </span>
            </button>
          </div>
          <nav aria-label="모바일 주 메뉴" className="flex-1 overflow-y-auto">
            <ul className="flex flex-col px-4 py-2">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`${touchTargetClass} ${focusRingClass} flex items-center border-b border-hairline-soft py-3 text-title-md ${
                        active ? "text-coral underline" : "text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-hairline p-4">
            <Link
              href={accountHref}
              onClick={() => setOpen(false)}
              className={`${touchTargetClass} ${focusRingClass} flex w-full items-center justify-center rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
            >
              {accountLabel}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
