"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import DestinationCard from "@/components/shared/DestinationCard";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { destinations } from "@/data/destinations";
import {
  DESTINATION_THEMES,
  type Destination,
  type DestinationScope,
  type DestinationSeason,
} from "@/data/destinations.schema";

/** URL에 직렬화하는 필터 키는 이 목록뿐이다. 그 밖의 query는 읽지도 쓰지도 않는다. */
const FILTER_KEYS = [
  "scope",
  "country",
  "city",
  "season",
  "theme",
  "q",
] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const SEASONS: readonly DestinationSeason[] = ["봄", "여름", "가을", "겨울"];
const INITIAL_VISIBLE = 6;
const RELATED_MAX = 6;

type Filters = {
  scope: DestinationScope;
  country: string;
  city: string;
  season: string;
  theme: string;
  q: string;
};

function readFilters(params: URLSearchParams): Filters {
  const scope: DestinationScope =
    params.get("scope") === "OVERSEAS" ? "OVERSEAS" : "DOMESTIC";
  const inScope = destinations.filter((d) => d.scope === scope);
  const countries = new Set(inScope.map((d) => d.country));
  const country = params.get("country") ?? "";
  const validCountry = countries.has(country) ? country : "";
  const city = params.get("city") ?? "";
  const validCity = inScope.some(
    (d) => d.name === city && (!validCountry || d.country === validCountry),
  )
    ? city
    : "";
  const season = params.get("season") ?? "";
  const theme = params.get("theme") ?? "";
  return {
    scope,
    country: validCountry,
    city: validCity,
    season: SEASONS.includes(season as DestinationSeason) ? season : "",
    theme: (DESTINATION_THEMES as readonly string[]).includes(theme)
      ? theme
      : "",
    q: (params.get("q") ?? "").slice(0, 50),
  };
}

function matches(d: Destination, f: Filters): boolean {
  if (d.scope !== f.scope) return false;
  if (f.country && d.country !== f.country) return false;
  if (f.city && d.name !== f.city) return false;
  if (f.season && !d.bestSeasons.includes(f.season as DestinationSeason))
    return false;
  if (f.theme && !(d.themes as readonly string[]).includes(f.theme))
    return false;
  if (f.q) {
    const haystack =
      `${d.name} ${d.country} ${d.themes.join(" ")}`.toLowerCase();
    if (!haystack.includes(f.q.toLowerCase())) return false;
  }
  return true;
}

/** 같은 국가 또는 같은 테마의 다른 여행지를 최대 6개 고른다(현재 여행지 제외). */
export function getRelatedDestinations(
  current: Destination,
  all: readonly Destination[] = destinations,
): Destination[] {
  const others = all.filter((d) => d.id !== current.id);
  const sameCountry = others.filter(
    (d) => d.countryCode === current.countryCode,
  );
  const sameTheme = others.filter(
    (d) =>
      d.countryCode !== current.countryCode &&
      d.themes.some((t) => current.themes.includes(t)),
  );
  return [...sameCountry, ...sameTheme].slice(0, RELATED_MAX);
}

type ExplorerProps = {
  /** 카드를 선택하면 같은 화면의 Drawer를 연다. */
  onSelectDestination?: (destination: Destination) => void;
};

const selectClass = `${touchTargetClass} ${focusRingClass} rounded-sm border border-hairline bg-canvas px-3 text-body-md text-ink`;

export default function DestinationExplorer({
  onSelectDestination,
}: ExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [limit, setLimit] = useState(INITIAL_VISIBLE);

  const filters = readFilters(searchParams);
  const inScope = destinations.filter((d) => d.scope === filters.scope);
  const countryOptions = [...new Set(inScope.map((d) => d.country))];
  const cityOptions = inScope
    .filter((d) => !filters.country || d.country === filters.country)
    .map((d) => d.name);

  const results = destinations.filter((d) => matches(d, filters));
  const visible = results.slice(0, limit);

  function update(changes: Partial<Record<FilterKey, string>>) {
    const next = new URLSearchParams();
    const merged: Record<FilterKey, string> = {
      scope: filters.scope === "OVERSEAS" ? "OVERSEAS" : "",
      country: filters.country,
      city: filters.city,
      season: filters.season,
      theme: filters.theme,
      q: filters.q,
      ...changes,
    };
    for (const key of FILTER_KEYS) {
      if (merged[key]) next.set(key, merged[key]);
    }
    setLimit(INITIAL_VISIBLE);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const hasFilter = Boolean(
    filters.country ||
    filters.city ||
    filters.season ||
    filters.theme ||
    filters.q,
  );

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="여행지 구분" className="flex gap-2">
        {(
          [
            ["DOMESTIC", "국내"],
            ["OVERSEAS", "해외"],
          ] as const
        ).map(([scope, label]) => {
          const selected = filters.scope === scope;
          return (
            <button
              key={scope}
              type="button"
              role="tab"
              id={`explorer-tab-${scope}`}
              aria-selected={selected}
              aria-controls="explorer-panel"
              onClick={() =>
                update({
                  scope: scope === "OVERSEAS" ? "OVERSEAS" : "",
                  country: "",
                  city: "",
                })
              }
              className={`${touchTargetClass} ${focusRingClass} rounded-full px-5 text-title-sm ${
                selected
                  ? "bg-coral text-on-coral"
                  : "bg-surface-strong text-body hover:text-coral"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        role="group"
        aria-label="여행지 필터"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="flex flex-col gap-1 text-body-sm text-muted">
          국가
          <select
            className={selectClass}
            value={filters.country}
            onChange={(e) => update({ country: e.target.value, city: "" })}
          >
            <option value="">전체</option>
            {countryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-body-sm text-muted">
          도시
          <select
            className={selectClass}
            value={filters.city}
            onChange={(e) => update({ city: e.target.value })}
          >
            <option value="">전체</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-body-sm text-muted">
          계절
          <select
            className={selectClass}
            value={filters.season}
            onChange={(e) => update({ season: e.target.value })}
          >
            <option value="">전체</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-body-sm text-muted">
          테마
          <select
            className={selectClass}
            value={filters.theme}
            onChange={(e) => update({ theme: e.target.value })}
          >
            <option value="">전체</option>
            {DESTINATION_THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        id="explorer-panel"
        role="tabpanel"
        aria-labelledby={`explorer-tab-${filters.scope}`}
        className="flex flex-col gap-4"
      >
        <p aria-live="polite" className="text-body-sm text-muted">
          조건에 맞는 여행지가 총 {results.length}곳 있어요.
        </p>

        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md bg-surface-soft px-6 py-12 text-center">
            <p className="text-title-md text-ink">
              조건에 맞는 여행지가 아직 없어요.
            </p>
            <p className="text-body-md text-body">
              국가나 계절, 테마 조건을 하나씩 빼면 더 많은 여행지를 볼 수
              있어요.
            </p>
            <button
              type="button"
              onClick={() =>
                update({ country: "", city: "", season: "", theme: "", q: "" })
              }
              className={`${touchTargetClass} ${focusRingClass} rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-base sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((d) => (
              <li key={d.id}>
                <DestinationCard
                  destination={d}
                  onSelect={onSelectDestination}
                />
              </li>
            ))}
          </ul>
        )}

        {hasFilter && results.length > 0 ? (
          <button
            type="button"
            onClick={() =>
              update({ country: "", city: "", season: "", theme: "", q: "" })
            }
            className={`${touchTargetClass} ${focusRingClass} self-start text-body-sm text-coral underline`}
          >
            필터 초기화
          </button>
        ) : null}

        {results.length > visible.length ? (
          <button
            type="button"
            onClick={() => setLimit((n) => n + INITIAL_VISIBLE)}
            className={`${touchTargetClass} ${focusRingClass} self-center rounded-sm border border-coral px-6 py-3 text-button text-coral hover:bg-coral-tint`}
          >
            여행지 더 보기
          </button>
        ) : null}
      </div>
    </div>
  );
}
