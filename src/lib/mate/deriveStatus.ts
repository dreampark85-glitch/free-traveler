export type MateStatus = "OPEN" | "CLOSED";

type Today = Date | string;

/** 로컬 날짜를 YYYY-MM-DD 문자열로 만든다. */
function toDateString(day: Today): string {
  if (typeof day === "string") return day;
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, "0");
  const d = String(day.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 조회 시점에 동행글 모집 상태를 파생한다(배치 없음).
 * 저장된 상태가 CLOSED(수동 마감)이거나 종료일(YYYY-MM-DD)이 오늘보다 이전이면 CLOSED.
 */
export function deriveStatus(
  post: { status?: MateStatus; endDate: string },
  today: Today = new Date(),
): MateStatus {
  if (post.status === "CLOSED") return "CLOSED";
  return post.endDate < toDateString(today) ? "CLOSED" : "OPEN";
}
