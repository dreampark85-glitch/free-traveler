import {
  representativeProfile,
  type TimelineEntry,
} from "@/data/representative-profile";

type TimelineProps = {
  entries?: readonly TimelineEntry[];
};

/** 연도·장소·요약으로 이루어진 여행 타임라인. Desktop은 가로, Mobile은 세로로 쌓는다. */
export default function Timeline({
  entries = representativeProfile.timeline,
}: TimelineProps) {
  return (
    <ol className="grid grid-cols-1 gap-base md:grid-cols-3">
      {entries.map((entry, index) => (
        <li
          key={`${entry.place}-${index}`}
          className="flex flex-col gap-2 rounded-md border border-hairline bg-canvas p-lg"
        >
          {entry.year !== null ? (
            <p className="text-caption text-coral">{entry.year}</p>
          ) : null}
          <h3 className="text-title-md text-ink">{entry.place}</h3>
          <p className="text-body-sm text-body">{entry.summary}</p>
        </li>
      ))}
    </ol>
  );
}
