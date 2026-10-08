import type { ReactNode } from "react";
import FavoritePlaces from "@/components/scr002/FavoritePlaces";
import FootprintChips from "@/components/scr002/FootprintChips";
import Gallery from "@/components/scr002/Gallery";
import IntroPhilosophy from "@/components/scr002/IntroPhilosophy";
import { ProfileStats } from "@/components/scr002/StatCard";
import Timeline from "@/components/scr002/Timeline";
import { focusRingClass } from "@/components/ui/FocusRing";
import {
  representativeProfile,
  resolveProfileImage,
} from "@/data/representative-profile";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "대표 소개",
  description:
    "50회 이상의 자유여행, 30개국 이상의 경험을 가진 free_traveler의 여행 철학과 여정, 다시 가고 싶은 여행지를 소개합니다.",
  path: "/about",
});

/** 문의·SNS 링크는 https와 mailto만 연다. 값이 비어 있거나 다른 프로토콜이면 렌더링하지 않는다. */
function isAllowedLink(href: string): boolean {
  return /^(https:\/\/|mailto:)\S+$/.test(href.trim());
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="mx-auto w-full max-w-[1200px] px-5 py-10 md:py-16"
    >
      <header className="mb-6 flex flex-col gap-1">
        {eyebrow ? (
          <p className="text-caption tracking-wide text-coral">{eyebrow}</p>
        ) : null}
        <h2 id={id} className="text-display-md text-ink md:text-display-lg">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

export default function AboutPage() {
  const { displayName, intro, contactLinks, heroImage } = representativeProfile;
  const hero = resolveProfileImage(heroImage);
  const firstSentence = intro.replaceAll("`", "").split(". ")[0] + ".";
  const links = contactLinks.filter((link) => isAllowedLink(link.href));

  return (
    <>
      <section
        aria-labelledby="about-hero"
        className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-8 px-5 py-10 md:grid-cols-2 md:py-16"
      >
        <div className="flex flex-col gap-4">
          <h1
            id="about-hero"
            className="text-display-lg text-ink md:text-display-xl"
          >
            {displayName}를 소개합니다
          </h1>
          <p className="text-body-lg text-body">{firstSentence}</p>
          {links.length > 0 ? (
            <ul className="flex flex-wrap gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${focusRingClass} rounded-sm text-body-md text-info underline`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-soft">
          {"src" in hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hero.src}
              alt={hero.alt}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      </section>

      <div className="bg-surface-soft">
        <Section
          id="about-numbers"
          eyebrow="BY THE NUMBERS"
          title="숫자로 보는 여행 이력"
        >
          <ProfileStats />
        </Section>
      </div>

      <Section
        id="about-philosophy"
        eyebrow="PHILOSOPHY"
        title="왜, 어떻게 여행하는가"
      >
        <IntroPhilosophy />
      </Section>

      <div className="bg-surface-soft">
        <Section
          id="about-milestones"
          eyebrow="MILESTONES"
          title="지금까지의 여정"
        >
          <Timeline />
        </Section>
      </div>

      <Section
        id="about-footprints"
        eyebrow="FOOTPRINTS"
        title="30개국, 4개 권역"
      >
        <FootprintChips />
      </Section>

      <div className="bg-surface-soft">
        <Section
          id="about-gallery"
          eyebrow="GALLERY"
          title="카메라에 담은 순간들"
        >
          <Gallery images={[]} />
        </Section>
      </div>

      <Section
        id="about-favorites"
        eyebrow="FAVORITE PLACES"
        title="다시 가고 싶은 여행지"
      >
        <FavoritePlaces />
      </Section>
    </>
  );
}
