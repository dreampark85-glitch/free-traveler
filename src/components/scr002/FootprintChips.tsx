"use client";

import { useState } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import {
  representativeProfile,
  type VisitedRegion,
} from "@/data/representative-profile";

/** 권역 Chip을 누르면 그 권역의 설명을 펼치거나 접는다. 국가 Chip은 모두 항상 보인다. */
export default function FootprintChips() {
  const { visitedCountries, regions } = representativeProfile;
  const [openRegion, setOpenRegion] = useState<VisitedRegion | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {regions.map((region) => {
        const countries = visitedCountries.filter((c) => c.region === region);
        const open = openRegion === region;
        const panelId = `footprint-${region}`;
        return (
          <section key={region} className="flex flex-col gap-3">
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenRegion(open ? null : region)}
                className={`${touchTargetClass} ${focusRingClass} rounded-full px-5 text-title-sm ${
                  open
                    ? "bg-coral text-on-coral"
                    : "bg-surface-strong text-ink hover:text-coral"
                }`}
              >
                {region} · {countries.length}개국
              </button>
            </h3>
            {open ? (
              <p id={panelId} className="text-body-md text-body">
                {region}에서 {countries.length}개국을 여행했어요:{" "}
                {countries.map((c) => c.name).join(", ")}.
              </p>
            ) : null}
            <ul className="flex flex-wrap gap-2">
              {countries.map((c) => (
                <li
                  key={c.name}
                  className="rounded-full border border-hairline bg-canvas px-4 py-2 text-body-sm text-body"
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
