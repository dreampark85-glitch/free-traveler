export type DestinationScope = "DOMESTIC" | "OVERSEAS";

export const DESTINATION_THEMES = [
  "자연",
  "미식",
  "역사·문화",
  "도시 탐방",
  "휴양",
  "액티비티",
] as const;
export type DestinationTheme = (typeof DESTINATION_THEMES)[number];

export type DestinationSeason = "봄" | "여름" | "가을" | "겨울";

/** 이미지는 alt·출처·작가·라이선스를 모두 갖춘 경우에만 등록한다. */
export interface DestinationImage {
  src: string;
  alt: string;
  sourceUrl: string;
  author: string;
  licenseType: string;
}

export interface DestinationFood {
  name: string;
}

export interface DestinationAttraction {
  name: string;
}

export interface DestinationItinerary {
  /** 1일 코스: 방문 순서대로의 명소 이름 */
  oneDay: string[];
  /** 3일 코스: 일차별 명소 이름 */
  threeDay: [string[], string[], string[]];
}

export interface Destination {
  id: string;
  scope: DestinationScope;
  /** ISO 3166-1 alpha-2 (국내는 KR) */
  countryCode: string;
  country: string;
  /** 도시·지역 이름 */
  name: string;
  themes: DestinationTheme[];
  summary: string;
  /** 5개 이상 */
  attractions: DestinationAttraction[];
  bestSeasons: DestinationSeason[];
  itinerary: DestinationItinerary;
  /** 1인 1일 예상 비용(원), 항공권 제외 */
  budgetPerDayKRW: { min: number; max: number };
  transport: string;
  /** 3개 이상 */
  foods: DestinationFood[];
  etiquette: string[];
  sourceName: string;
  sourceUrl: string;
  /** 수정일 YYYY-MM-DD */
  updatedAt: string;
  /** 출처 대조와 검수가 끝나기 전에는 DRAFT */
  reviewStatus: "DRAFT" | "REVIEWED";
  image?: DestinationImage;
}

export const MIN_ATTRACTIONS = 5;
export const MIN_FOODS = 3;
export const MIN_DOMESTIC = 10;
export const MIN_OVERSEAS_COUNTRIES = 15;
export const MIN_OVERSEAS_CITIES = 30;
