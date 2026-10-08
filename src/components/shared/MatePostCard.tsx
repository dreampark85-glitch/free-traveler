export type MatePostCardProps = {
  title: string;
  country: string;
  region?: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  /** 모집 인원(명) */
  capacity: number;
  styleTags: string[];
  /** 작성자의 성인 확인 완료 여부 — 텍스트 배지로만 표시한다. */
  adultVerified: boolean;
};

function formatDate(iso: string): string {
  return iso.replaceAll("-", ".");
}

export default function MatePostCard({
  title,
  country,
  region,
  startDate,
  endDate,
  capacity,
  styleTags,
  adultVerified,
}: MatePostCardProps) {
  const place = region ? `${country} · ${region}` : country;

  return (
    <article className="flex h-full flex-col gap-3 rounded-[14px] border border-[#E4E1DA] bg-white p-5 transition-shadow hover:shadow-[0_1px_2px_rgba(36,35,39,.06),0_8px_20px_rgba(36,35,39,.08)]">
      <h3 className="text-lg font-semibold text-[#242327]">{title}</h3>
      <p className="text-sm text-[#6E6D76]">
        {place} · {formatDate(startDate)} – {formatDate(endDate)}
      </p>
      <ul className="flex flex-wrap gap-2" aria-label="모집 정보와 여행 스타일">
        <li className="rounded-full bg-[#F0EEE9] px-3 py-1 text-xs text-[#4B4A52]">
          모집 {capacity}명
        </li>
        {styleTags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-[#F0EEE9] px-3 py-1 text-xs text-[#4B4A52]"
          >
            {tag}
          </li>
        ))}
      </ul>
      {adultVerified ? (
        <p className="mt-auto">
          <span className="inline-block rounded-full bg-[#FCE7DE] px-3 py-1 text-xs font-medium text-[#E85A34]">
            성인 확인 완료
          </span>
        </p>
      ) : null}
    </article>
  );
}
