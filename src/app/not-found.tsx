import Link from "next/link";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center md:py-24">
      <h1 className="text-display-lg text-ink">찾는 페이지가 없어요</h1>
      <p className="text-body-md text-body">
        주소가 바뀌었거나 삭제된 페이지일 수 있어요. 홈이나 아래 메뉴에서 원하는
        화면으로 이동해 보세요.
      </p>
      <ul className="flex flex-col gap-3 sm:flex-row">
        <li>
          <Link
            href="/"
            className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
          >
            홈으로 이동
          </Link>
        </li>
        <li>
          <Link
            href="/travel-tools"
            className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm border border-coral px-6 py-3 text-button text-coral hover:bg-coral-tint`}
          >
            여행 준비하기
          </Link>
        </li>
        <li>
          <Link
            href="/mates"
            className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm border border-coral px-6 py-3 text-button text-coral hover:bg-coral-tint`}
          >
            동행 찾기
          </Link>
        </li>
      </ul>
    </section>
  );
}
