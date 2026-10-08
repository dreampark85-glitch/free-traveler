"use client";

import { useRouter } from "next/navigation";
import CtaBanner from "@/components/shared/CtaBanner";
import DestinationCard from "@/components/shared/DestinationCard";
import { destinations } from "@/data/destinations";
import type { Destination } from "@/data/destinations.schema";
import { representativeProfile } from "@/data/representative-profile";

const SHOWN = 4;

/**
 * 대표 추천 여행지 4곳을 고른다. 목록에 없는(공개되지 않은) id는 건너뛰고,
 * 모자란 만큼은 아직 고르지 않은 여행지로 채운다.
 */
function pickFavorites(): Destination[] {
  const picked: Destination[] = [];
  for (const id of representativeProfile.featuredDestinationIds) {
    const found = destinations.find((d) => d.id === id);
    if (found && !picked.includes(found)) picked.push(found);
  }
  for (const d of destinations) {
    if (picked.length >= SHOWN) break;
    if (!picked.includes(d)) picked.push(d);
  }
  return picked.slice(0, SHOWN);
}

export default function FavoritePlaces() {
  const router = useRouter();
  const favorites = pickFavorites();

  // 카드를 고르면 SCR-001로 이동해 그 여행지를 찾은 상태로 보여준다.
  function goToDestination(destination: Destination) {
    const params = new URLSearchParams({ q: destination.name });
    if (destination.scope === "OVERSEAS") params.set("scope", "OVERSEAS");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-10">
      <ul className="grid grid-cols-1 gap-base sm:grid-cols-2 lg:grid-cols-4">
        {favorites.map((d) => (
          <li key={d.id}>
            <DestinationCard destination={d} onSelect={goToDestination} />
          </li>
        ))}
      </ul>
      <CtaBanner
        title="다음 여행을 함께 준비해 볼까요?"
        description="여행 조건을 정리하고, 같은 일정으로 떠날 동행도 찾아보세요."
        actions={[
          { label: "여행 조건 정리하기", href: "/travel-tools" },
          { label: "동행 찾아보기", href: "/mates" },
        ]}
      />
    </div>
  );
}
