"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import MobileNavSheet, { type NavItem } from "./MobileNavSheet";

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "여행지", href: "/" },
  { label: "여행 준비", href: "/travel-tools" },
  { label: "동행 찾기", href: "/mates" },
  { label: "대표 소개", href: "/about" },
];

const ACCOUNT_HREF = "/account";
// 로그인 상태에 따른 닉네임·아바타 표시는 인증 Task(AUTH-SETUP) 이후 연결한다.
const ACCOUNT_LABEL = "로그인";

export default function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 md:h-[72px] md:px-6">
        <Link
          href="/"
          aria-label="Free Traveler 홈"
          className={`${focusRingClass} inline-flex items-center gap-2 rounded-sm`}
        >
          <span aria-hidden="true" className="size-2.5 rounded-full bg-coral" />
          <span className="text-title-md text-ink">Free Traveler</span>
        </Link>

        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`${focusRingClass} inline-flex items-center rounded-sm border-b-2 py-2 text-body-md ${
                      active
                        ? "border-coral text-ink"
                        : "border-transparent text-body hover:text-coral"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href={ACCOUNT_HREF}
            className={`${touchTargetClass} ${focusRingClass} hidden items-center justify-center rounded-sm px-3 text-body-md text-ink hover:text-coral md:inline-flex`}
          >
            {ACCOUNT_LABEL}
          </Link>
          <Link
            href={ACCOUNT_HREF}
            aria-label="계정"
            className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm text-ink md:hidden`}
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ◯
            </span>
          </Link>
          <MobileNavSheet
            items={NAV_ITEMS}
            isActive={isActive}
            accountHref={ACCOUNT_HREF}
            accountLabel={ACCOUNT_LABEL}
          />
        </div>
      </div>
    </header>
  );
}
