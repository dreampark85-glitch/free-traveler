import Link from "next/link";
import { focusRingClass } from "@/components/ui/FocusRing";

const linkClass = `${focusRingClass} rounded-sm text-ink hover:text-coral`;

const SHORTCUTS = [
  { label: "여행지", href: "/" },
  { label: "여행 준비", href: "/travel-tools" },
  { label: "동행 찾기", href: "/mates" },
  { label: "대표 소개", href: "/about" },
];

const POLICIES = [
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "동행 안전수칙", href: "/safety-guidelines" },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface-soft">
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <section
            aria-labelledby="footer-brand"
            className="flex flex-col gap-2"
          >
            <h2 id="footer-brand" className="text-title-sm text-ink">
              Free Traveler
            </h2>
            <p className="text-body-sm text-muted">
              자유여행을 준비하는 사람들을 위한 여행지·안전정보·동행 안내
              서비스입니다.
            </p>
          </section>

          <nav
            aria-labelledby="footer-shortcuts"
            className="flex flex-col gap-2"
          >
            <h2 id="footer-shortcuts" className="text-title-sm text-ink">
              바로가기
            </h2>
            <ul className="flex flex-col gap-2 text-body-sm">
              {SHORTCUTS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="footer-policies"
            className="flex flex-col gap-2"
          >
            <h2 id="footer-policies" className="text-title-sm text-ink">
              정책
            </h2>
            <ul className="flex flex-col gap-2 text-body-sm">
              {POLICIES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="text-muted">
                콘텐츠 면책: 공식 판단을 대체하지 않으며 출국 전 원문을 다시
                확인해 주세요.
              </li>
            </ul>
          </nav>

          <section
            aria-labelledby="footer-sources"
            className="flex flex-col gap-2"
          >
            <h2 id="footer-sources" className="text-title-sm text-ink">
              출처 안내
            </h2>
            <ul className="flex flex-col gap-2 text-body-sm">
              <li>
                <a
                  href="https://www.0404.go.kr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  외교부 해외안전여행
                </a>
              </li>
              <li className="text-muted">
                이미지는 각 이미지에 표기된 출처와 라이선스를 따릅니다.
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-1 border-t border-hairline pt-6 text-body-sm text-muted md:flex-row md:justify-between">
          <p>© Free Traveler</p>
          <p>
            본 서비스는 항공·호텔 예약을 대행하지 않으며 외부 사이트로
            안내합니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
