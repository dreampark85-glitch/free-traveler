import { representativeProfile } from "@/data/representative-profile";

type StatCardProps = {
  value: string;
  label: string;
};

export default function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-hairline bg-canvas p-lg">
      <p className="text-display-xl text-coral">{value}</p>
      <p className="text-body-md text-body">{label}</p>
    </div>
  );
}

/**
 * 대표 통계 카드 2개. 값은 SCR-001 소개 배지와 같은 단일 소스(representativeProfile)에서 읽는다.
 */
export function ProfileStats() {
  const { tripCountLabel, countryCountLabel } = representativeProfile;
  return (
    <ul className="grid grid-cols-1 gap-base sm:grid-cols-2">
      <li>
        <StatCard value={tripCountLabel} label="자유여행 경험" />
      </li>
      <li>
        <StatCard value={countryCountLabel} label="방문한 국가" />
      </li>
    </ul>
  );
}
