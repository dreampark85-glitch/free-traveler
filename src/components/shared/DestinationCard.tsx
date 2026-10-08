"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { Destination } from "@/data/destinations.schema";

export type DestinationCardProps = {
  destination: Destination;
  /** 카드를 선택하면 같은 화면의 Drawer를 연다. */
  onSelect?: (destination: Destination) => void;
  /** 안전정보 카드처럼 제목 옆에 붙일 상태 배지(아이콘+텍스트) */
  statusBadge?: ReactNode;
};

export default function DestinationCard({
  destination,
  onSelect,
  statusBadge,
}: DestinationCardProps) {
  const { image, name, country, bestSeasons, themes } = destination;
  const meta = `${country} · 추천 시기 ${bestSeasons.join("·")}`;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(destination)}
      className="group flex w-full flex-col gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-surface-soft">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            unoptimized
            loading="lazy"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-title-md text-ink">{name}</span>
        {statusBadge}
      </span>
      <span className="text-body-sm text-muted">{meta}</span>
      {themes[0] ? (
        <span className="w-fit rounded-full bg-surface-strong px-3 py-1 text-caption text-body">
          {themes[0]}
        </span>
      ) : null}
    </button>
  );
}
