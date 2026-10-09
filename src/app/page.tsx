"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import CtaBanner from "@/components/shared/CtaBanner";
import DestinationCard from "@/components/shared/DestinationCard";
import DestinationDrawer from "@/components/scr001/DestinationDrawer";
import DestinationExplorer from "@/components/scr001/DestinationExplorer";
import MatePreview from "@/components/scr001/MatePreview";
import SafetyDrawer from "@/components/scr001/SafetyDrawer";
import SearchBar from "@/components/scr001/SearchBar";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { getCountrySafety, isSafetyStale } from "@/data/country-safety";
import { destinations } from "@/data/destinations";
import {
  DESTINATION_THEMES,
  type Destination,
} from "@/data/destinations.schema";
import { representativeProfile } from "@/data/representative-profile";

const CARDS_PER_SECTION = 6;

const domesticPicks = destinations
  .filter((d) => d.scope === "DOMESTIC")
  .slice(0, CARDS_PER_SECTION);

/** 해외는 국가마다 한 도시씩, 앞에서부터 6곳을 고른다. */
const overseasPicks = (() => {
  const seen = new Set<string>();
  const picks: Destination[] = [];
  for (const d of destinations) {
    if (d.scope !== "OVERSEAS" || seen.has(d.countryCode)) continue;
    seen.add(d.countryCode);
    picks.push(d);
    if (picks.length === CARDS_PER_SECTION) break;
  }
  return picks;
})();

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="mx-auto w-full max-w-[1200px] px-5 py-10 md:py-16"
    >
      <header className="mb-6 flex flex-col gap-1">
        <h2 id={id} className="text-display-md text-ink md:text-display-lg">
          {title}
        </h2>
        {description ? (
          <p className="text-body-md text-body">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function CardGrid({
  items,
  onSelect,
  badge,
}: {
  items: readonly Destination[];
  onSelect: (destination: Destination) => void;
  badge?: (destination: Destination) => ReactNode;
}) {
  return (
    <ul className="grid grid-cols-1 gap-base sm:grid-cols-2 lg:grid-cols-3">
      {items.map((d) => (
        <li key={d.id}>
          <DestinationCard
            destination={d}
            onSelect={onSelect}
            statusBadge={badge?.(d)}
          />
        </li>
      ))}
    </ul>
  );
}

function SafetyBadge({ countryCode }: { countryCode: string }) {
  const safety = getCountrySafety(countryCode);
  // 공식 출처와 대조하지 않았거나 확인일이 7일을 넘기면 재확인이 필요하다.
  const stale = isSafetyStale(safety?.verifiedAt ?? null);
  return stale ? (
    <span className="rounded-full bg-warning-bg px-2 py-0.5 text-caption text-warning">
      <span aria-hidden="true">⚠ </span>재확인 필요
    </span>
  ) : (
    <span className="rounded-full bg-success-bg px-2 py-0.5 text-caption text-success">
      <span aria-hidden="true">✓ </span>최근 확인
    </span>
  );
}

/** 테마 Chip. 선택한 테마는 URL의 theme query로 유지되고 아래 탐색 목록이 그 테마로 좁혀진다. */
function ThemeChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTheme = searchParams.get("theme") ?? "";

  function toggleTheme(theme: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (activeTheme === theme) next.delete("theme");
    else next.set("theme", theme);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <ul className="mb-8 flex flex-wrap gap-2">
      {DESTINATION_THEMES.map((theme) => {
        const active = activeTheme === theme;
        return (
          <li key={theme}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => toggleTheme(theme)}
              className={`${touchTargetClass} ${focusRingClass} rounded-full px-5 text-title-sm ${
                active
                  ? "bg-coral text-on-coral"
                  : "bg-surface-strong text-ink hover:text-coral"
              }`}
            >
              {theme}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function HomeContent() {
  const [selected, setSelected] = useState<Destination | null>(null);
  const [safetyCountry, setSafetyCountry] = useState<string | null>(null);

  const { displayName, tripCountLabel, countryCountLabel } =
    representativeProfile;

  return (
    <>
      <section aria-labelledby="home-hero" className="bg-surface-soft">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-6 px-5 py-14 md:py-20">
          <h1
            id="home-hero"
            className="max-w-2xl text-display-lg text-ink md:text-display-xl"
          >
            어디로 떠날지, 오늘 정해볼까요?
          </h1>
          <p className="max-w-xl text-body-lg text-body">
            국내외 여행지와 국가별 안전정보를 한곳에서 살펴보고, 같은 일정으로
            떠날 동행도 찾아보세요.
          </p>
          <div className="w-full max-w-xl">
            <Suspense
              fallback={<div className="h-14 rounded-full bg-canvas" />}
            >
              <SearchBar
                onSelectDestination={setSelected}
                onSelectSafety={setSafetyCountry}
              />
            </Suspense>
          </div>
          <Link
            href="/travel-tools"
            className={`${touchTargetClass} ${focusRingClass} inline-flex items-center justify-center rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
          >
            여행 조건부터 정리하기
          </Link>
        </div>
      </section>

      <Section
        id="home-domestic"
        title="국내에서 다시 발견하는 여행지"
        description="가까워서 더 자주 가고 싶은 도시와 바다, 마을을 모았어요."
      >
        <CardGrid items={domesticPicks} onSelect={setSelected} />
      </Section>

      <div className="bg-surface-soft">
        <Section
          id="home-overseas"
          title="해외에서 처음 만나는 도시들"
          description="처음 떠나는 자유여행으로도 부담이 적은 도시부터 골랐어요."
        >
          <CardGrid items={overseasPicks} onSelect={setSelected} />
        </Section>
      </div>

      <Section
        id="home-themes"
        title="어떤 이유로 떠나고 싶으신가요?"
        description="마음에 끌리는 이유를 고르면 아래 목록이 그 테마로 좁혀져요."
      >
        <Suspense fallback={<div className="mb-8 h-11" />}>
          <ThemeChips />
        </Suspense>
        <Suspense
          fallback={<div className="h-64 rounded-md bg-surface-soft" />}
        >
          <DestinationExplorer onSelectDestination={setSelected} />
        </Suspense>
      </Section>

      <div className="bg-surface-soft">
        <Section
          id="home-safety"
          title="떠나기 전 꼭 확인할 안전정보"
          description="국가를 고르면 치안·사기·법규·교통·재난·보건·문화와 긴급연락처를 볼 수 있어요."
        >
          <CardGrid
            items={overseasPicks}
            onSelect={(d) => setSafetyCountry(d.countryCode)}
            badge={(d) => <SafetyBadge countryCode={d.countryCode} />}
          />
        </Section>
      </div>

      <Section
        id="home-mates"
        title="함께 떠날 동행을 찾고 있어요"
        description="모집중인 최신 동행글을 먼저 만나 보세요."
      >
        <MatePreview />
      </Section>

      <div className="mx-auto w-full max-w-[1200px] px-5 pb-10 md:pb-16">
        <CtaBanner
          title="free_traveler가 소개하는 이유"
          description="직접 이해한 정보와 공식 출처를 구분해서 소개해요. 어떤 기준으로 고르는지 확인해 보세요."
          actions={[{ label: `${displayName} 소개 보기`, href: "/about" }]}
        >
          <ul className="flex flex-wrap justify-center gap-2">
            <li className="rounded-full bg-canvas px-4 py-2 text-title-sm text-coral">
              {tripCountLabel}
            </li>
            <li className="rounded-full bg-canvas px-4 py-2 text-title-sm text-coral">
              {countryCountLabel}
            </li>
          </ul>
        </CtaBanner>
      </div>

      <DestinationDrawer
        destination={selected}
        onClose={() => setSelected(null)}
        onSelectRelated={setSelected}
      />
      <SafetyDrawer
        countryCode={safetyCountry}
        onClose={() => setSafetyCountry(null)}
      />
    </>
  );
}

export default function Home() {
  return <HomeContent />;
}
