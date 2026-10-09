/**
 * 대표(free_traveler) 소개 정적 데이터.
 * 출처: docs/00_PRD_Travel_v1.md §6 확정 프로필·소개문.
 *
 * `profileStatus`로 확정 값과 초안 값을 구분한다.
 * - CONFIRMED: PRD에 확정된 원문. 그대로 표시한다.
 * - DRAFT: PRD에 근거가 없어 임시로 채운 값. 대표가 확인해 교체하기 전에는 공개하지 않는다.
 */

export type ProfileFieldStatus = "CONFIRMED" | "DRAFT";

export type VisitedRegion = "아시아" | "유럽" | "북미" | "오세아니아";

export interface VisitedCountry {
  name: string;
  region: VisitedRegion;
}

export interface TimelineEntry {
  /** 알 수 없으면 null (DRAFT 단계) */
  year: number | null;
  place: string;
  summary: string;
}

export interface ProfileImage {
  src: string;
  alt: string;
  sourceUrl: string;
  author: string;
  licenseType: string;
}

export interface ContactLink {
  label: string;
  /** https: 또는 mailto: 만 허용 */
  href: string;
}

export interface RepresentativeProfile {
  displayName: string;
  tripCountLabel: string;
  countryCountLabel: string;
  intro: string;
  philosophy: string;
  editorialPrinciple: string;
  regions: VisitedRegion[];
  expertise: string[];
  visitedCountries: VisitedCountry[];
  timeline: TimelineEntry[];
  /** `destinations`의 id를 참조한다. */
  featuredDestinationIds: string[];
  heroImage: ProfileImage | null;
  /** 값이 없는 링크는 렌더링하지 않는다. */
  contactLinks: ContactLink[];
  profileStatus: {
    core: ProfileFieldStatus;
    visitedCountries: ProfileFieldStatus;
    timeline: ProfileFieldStatus;
    featuredDestinations: ProfileFieldStatus;
  };
}

export const representativeProfile: RepresentativeProfile = {
  displayName: "free_traveler",
  tripCountLabel: "50+ Trips",
  countryCountLabel: "30+ Countries",
  intro:
    "`free_traveler`는 50회 이상의 자유여행으로 30개국 이상을 경험한 여행 큐레이터다. 유명 명소만 나열하기보다 이동 동선, 머무는 시간, 여행자의 체력, 안전정보까지 함께 살피는 여행을 지향한다. 처음 해외여행을 준비하는 사람도 목적지와 일정을 스스로 결정할 수 있도록 여행지의 장점뿐 아니라 불편한 점과 주의할 점을 함께 소개한다.",
  philosophy:
    "좋은 여행은 많이 보는 여행이 아니라, 내가 감당할 수 있는 속도로 현지를 이해하는 여행이다.",
  editorialPrinciple:
    "직접 이해한 정보와 공식 출처를 구분하고, 변동 가능한 정보에는 확인일을 표시한다.",
  regions: ["아시아", "유럽", "북미", "오세아니아"],
  expertise: [
    "첫 자유여행 설계",
    "도시 간 이동",
    "일정 밀도 조절",
    "예산과 안전의 균형",
  ],

  // DRAFT: 4개 권역 중심이라는 PRD 문장만 근거이고 국가 목록은 대표 확인이 필요하다.
  visitedCountries: [
    { name: "일본", region: "아시아" },
    { name: "태국", region: "아시아" },
    { name: "베트남", region: "아시아" },
    { name: "대만", region: "아시아" },
    { name: "인도네시아", region: "아시아" },
    { name: "싱가포르", region: "아시아" },
    { name: "말레이시아", region: "아시아" },
    { name: "필리핀", region: "아시아" },
    { name: "캄보디아", region: "아시아" },
    { name: "라오스", region: "아시아" },
    { name: "인도", region: "아시아" },
    { name: "튀르키예", region: "아시아" },
    { name: "프랑스", region: "유럽" },
    { name: "이탈리아", region: "유럽" },
    { name: "스페인", region: "유럽" },
    { name: "영국", region: "유럽" },
    { name: "독일", region: "유럽" },
    { name: "체코", region: "유럽" },
    { name: "포르투갈", region: "유럽" },
    { name: "스위스", region: "유럽" },
    { name: "오스트리아", region: "유럽" },
    { name: "네덜란드", region: "유럽" },
    { name: "헝가리", region: "유럽" },
    { name: "그리스", region: "유럽" },
    { name: "미국", region: "북미" },
    { name: "캐나다", region: "북미" },
    { name: "멕시코", region: "북미" },
    { name: "호주", region: "오세아니아" },
    { name: "뉴질랜드", region: "오세아니아" },
    { name: "피지", region: "오세아니아" },
  ],

  // DRAFT: 연도와 내용은 대표가 직접 채운다. year가 null이면 연도를 표시하지 않는다.
  timeline: [
    { year: null, place: "국내", summary: "대표 확인 후 작성" },
    { year: null, place: "아시아", summary: "대표 확인 후 작성" },
    { year: null, place: "유럽", summary: "대표 확인 후 작성" },
    { year: null, place: "북미", summary: "대표 확인 후 작성" },
    { year: null, place: "오세아니아", summary: "대표 확인 후 작성" },
    { year: null, place: "free_traveler 시작", summary: "대표 확인 후 작성" },
  ],

  // DRAFT: 편집 선택이므로 대표 확인이 필요하다.
  featuredDestinationIds: [
    "jeju",
    "gyeongju",
    "tokyo",
    "taipei",
    "paris",
    "lisbon",
  ],

  heroImage: {
    src: "/images/about/n-seoul-tower-night.jpg",
    alt: "어두운 밤하늘 아래 푸른 조명이 켜진 N서울타워와 남산 성곽길의 가로등 불빛",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Seoul_Tower_from_Namsan_Park_(9595146693).jpg",
    author: "travel oriented from Manila, Philippines",
    licenseType: "CC BY-SA 2.0",
  },

  contactLinks: [],

  profileStatus: {
    core: "CONFIRMED",
    visitedCountries: "DRAFT",
    timeline: "DRAFT",
    featuredDestinations: "DRAFT",
  },
};

/** 메타데이터가 빠진 이미지는 쓰지 않고 기본 플레이스홀더로 대체한다. */
export const PROFILE_IMAGE_PLACEHOLDER = { kind: "placeholder" } as const;

export function resolveProfileImage(
  image: Partial<ProfileImage> | null | undefined,
): ProfileImage | typeof PROFILE_IMAGE_PLACEHOLDER {
  const required = [
    "src",
    "alt",
    "sourceUrl",
    "author",
    "licenseType",
  ] as const;
  const missing = required.filter((k) => !image?.[k]?.trim());
  if (!image || missing.length > 0) {
    if (image) {
      console.warn(
        `[representative-profile] 이미지 메타데이터 누락(${missing.join(", ")}) — 플레이스홀더로 대체합니다.`,
      );
    }
    return PROFILE_IMAGE_PLACEHOLDER;
  }
  return image as ProfileImage;
}
