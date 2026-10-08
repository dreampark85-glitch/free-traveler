"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { countrySafety } from "@/data/country-safety";
import { destinations } from "@/data/destinations";
import type { Destination } from "@/data/destinations.schema";

type SearchBarProps = {
  /** 여행지 결과를 선택하면 상세 Drawer를 연다. */
  onSelectDestination?: (destination: Destination) => void;
  /** 안전정보 결과를 선택하면 안전정보 Drawer를 연다. */
  onSelectSafety?: (countryCode: string) => void;
};

type Result =
  | {
      kind: "destination";
      key: string;
      label: string;
      destination: Destination;
    }
  | { kind: "safety"; key: string; label: string; countryCode: string };

const MAX_RESULTS = 8;
const FILTER_KEYS = ["scope", "country", "city", "season", "theme"] as const;

function search(keyword: string): Result[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];

  const results: Result[] = [];
  for (const d of destinations) {
    const haystack =
      `${d.name} ${d.country} ${d.themes.join(" ")}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        kind: "destination",
        key: `d-${d.id}`,
        label: `${d.name} · ${d.country}`,
        destination: d,
      });
    }
  }
  for (const s of countrySafety) {
    const haystack =
      `${s.country} ${Object.values(s.sections).join(" ")}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        kind: "safety",
        key: `s-${s.countryCode}`,
        label: `${s.country} 안전정보`,
        countryCode: s.countryCode,
      });
    }
  }
  return results.slice(0, MAX_RESULTS);
}

const TYPE_LABEL = { destination: "여행지", safety: "안전정보" } as const;

export default function SearchBar({
  onSelectDestination,
  onSelectSafety,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const resultsId = useId();

  // 검색어는 이 화면 안에서만 쓰고 서버·로그·분석으로 보내지 않는다.
  const results = search(keyword);

  function writeQuery(value: string) {
    const next = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const current = searchParams.get(key);
      if (current) next.set(key, current);
    }
    if (value) next.set("q", value.slice(0, 50));
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    writeQuery(keyword.trim());
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <form
        role="search"
        onSubmit={onSubmit}
        className="flex w-full items-center rounded-full border border-hairline bg-canvas px-5 transition-shadow focus-within:shadow-card hover:shadow-card"
      >
        <label htmlFor={`${resultsId}-input`} className="sr-only">
          여행지, 국가, 테마 검색
        </label>
        <input
          id={`${resultsId}-input`}
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="여행지, 국가, 테마로 검색해보세요"
          autoComplete="off"
          className="min-h-12 flex-1 bg-transparent text-body-md text-ink outline-none placeholder:text-muted-soft"
        />
        <button
          type="submit"
          className={`${touchTargetClass} ${focusRingClass} rounded-full px-4 text-button text-coral`}
        >
          검색
        </button>
      </form>

      {keyword.trim() ? (
        <div aria-live="polite" className="flex flex-col gap-2">
          {results.length === 0 ? (
            <p className="rounded-md bg-surface-soft px-4 py-3 text-body-md text-body">
              &lsquo;{keyword.trim()}&rsquo;에 맞는 결과가 아직 없어요. 다른
              여행지나 국가 이름, 테마로 다시 검색해 보세요.
            </p>
          ) : (
            <ul
              id={resultsId}
              aria-label="검색 결과"
              className="flex flex-col divide-y divide-hairline-soft rounded-md border border-hairline bg-canvas"
            >
              {results.map((result) => (
                <li key={result.key}>
                  <button
                    type="button"
                    onClick={() =>
                      result.kind === "destination"
                        ? onSelectDestination?.(result.destination)
                        : onSelectSafety?.(result.countryCode)
                    }
                    className={`${touchTargetClass} ${focusRingClass} flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface-soft`}
                  >
                    <span className="rounded-full bg-surface-strong px-2 py-0.5 text-caption text-body">
                      {TYPE_LABEL[result.kind]}
                    </span>
                    <span className="text-body-md text-ink">
                      {result.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
