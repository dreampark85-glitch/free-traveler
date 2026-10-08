import type {
  Destination,
  DestinationSeason,
  DestinationTheme,
} from "./destinations.schema";

/**
 * 여행지 정적 데이터(시드).
 * 모든 항목은 reviewStatus "DRAFT"다. 출처 원문 대조와 검수를 마치기 전에는
 * 공개 릴리스의 근거로 쓰지 않는다. 이미지는 출처·작가·라이선스를 확인한 뒤에만 추가한다.
 */

const UPDATED_AT = "2026-10-09";

type Country = {
  scope: Destination["scope"];
  code: string;
  country: string;
  transport: string;
  etiquette: string[];
  sourceName: string;
  sourceUrl: string;
};

type Spot = {
  id: string;
  name: string;
  themes: DestinationTheme[];
  summary: string;
  attractions: [string, string, string, string, string];
  seasons: DestinationSeason[];
  budget: [number, number];
  foods: [string, string, string];
};

function build(c: Country, s: Spot): Destination {
  const [a1, a2, a3, a4, a5] = s.attractions;
  return {
    id: s.id,
    scope: c.scope,
    countryCode: c.code,
    country: c.country,
    name: s.name,
    themes: s.themes,
    summary: s.summary,
    attractions: s.attractions.map((name) => ({ name })),
    bestSeasons: s.seasons,
    itinerary: {
      oneDay: [a1, a2, a3],
      threeDay: [[a1, a2], [a3, a4], [a5]],
    },
    budgetPerDayKRW: { min: s.budget[0], max: s.budget[1] },
    transport: c.transport,
    foods: s.foods.map((name) => ({ name })),
    etiquette: c.etiquette,
    sourceName: c.sourceName,
    sourceUrl: c.sourceUrl,
    updatedAt: UPDATED_AT,
    reviewStatus: "DRAFT",
  };
}

const KR: Country = {
  scope: "DOMESTIC",
  code: "KR",
  country: "대한민국",
  transport:
    "KTX·SRT 등 철도와 시외·고속버스로 이동하고, 도시 안에서는 지하철·버스·택시를 이용합니다.",
  etiquette: [
    "문화재와 사찰에서는 정숙하고 안내문을 따릅니다.",
    "쓰레기는 지정된 곳에 분리해서 버립니다.",
  ],
  sourceName: "한국관광공사",
  sourceUrl: "https://korean.visitkorea.or.kr",
};

const JP: Country = {
  scope: "OVERSEAS",
  code: "JP",
  country: "일본",
  transport:
    "교통 IC카드로 지하철·전철·버스를 탈 수 있고, 도시 간에는 신칸센과 고속버스를 이용합니다.",
  etiquette: [
    "대중교통 안에서는 통화를 자제하고 조용히 이동합니다.",
    "길거리에서 걸어 다니며 먹는 행동은 삼갑니다.",
  ],
  sourceName: "일본정부관광국(JNTO)",
  sourceUrl: "https://www.japan.travel/ko/",
};

const TH: Country = {
  scope: "OVERSEAS",
  code: "TH",
  country: "태국",
  transport:
    "방콕은 BTS·MRT 같은 도시철도와 차량 호출 앱을 쓰고, 도시 간에는 항공·야간열차·버스를 이용합니다.",
  etiquette: [
    "왕실과 불교 사원을 존중하고 사원에서는 어깨와 무릎을 가립니다.",
    "머리를 만지거나 발로 물건을 가리키는 행동은 피합니다.",
  ],
  sourceName: "태국관광청(TAT)",
  sourceUrl: "https://www.tourismthailand.org/",
};

const VN: Country = {
  scope: "OVERSEAS",
  code: "VN",
  country: "베트남",
  transport:
    "시내에서는 차량 호출 앱과 택시를 이용하고, 도시 간에는 국내선 항공과 열차를 이용합니다.",
  etiquette: [
    "사원과 사적지에서는 노출이 심한 옷을 피합니다.",
    "교통량이 많으니 길을 건널 때 천천히 일정한 속도로 걷습니다.",
  ],
  sourceName: "베트남관광청",
  sourceUrl: "https://vietnam.travel/",
};

const TW: Country = {
  scope: "OVERSEAS",
  code: "TW",
  country: "대만",
  transport:
    "교통 IC카드로 MRT·버스를 타고, 도시 간에는 고속철도(THSR)와 일반 열차를 이용합니다.",
  etiquette: [
    "MRT 역 안에서는 음식을 먹거나 마시지 않습니다.",
    "에스컬레이터에서는 한쪽을 비워 둡니다.",
  ],
  sourceName: "대만관광청",
  sourceUrl: "https://eng.taiwan.net.tw/",
};

const FR: Country = {
  scope: "OVERSEAS",
  code: "FR",
  country: "프랑스",
  transport:
    "도시 안에서는 지하철·트램·버스를 이용하고, 도시 간에는 TGV 고속열차와 국내선을 이용합니다.",
  etiquette: [
    "가게와 식당에 들어갈 때 먼저 인사말을 건넵니다.",
    "소매치기가 많은 관광지에서는 소지품을 앞쪽에 둡니다.",
  ],
  sourceName: "프랑스관광청(Atout France)",
  sourceUrl: "https://www.france.fr/",
};

const IT: Country = {
  scope: "OVERSEAS",
  code: "IT",
  country: "이탈리아",
  transport:
    "도시 간에는 고속열차(Frecciarossa 등)를 이용하고, 시내에서는 도보·지하철·버스를 이용합니다.",
  etiquette: [
    "성당에서는 어깨와 무릎을 가리는 복장을 갖춥니다.",
    "기차 승차권은 탑승 전에 검인 기계에 찍어야 하는 경우가 있습니다.",
  ],
  sourceName: "이탈리아관광청(ENIT)",
  sourceUrl: "https://www.italia.it/",
};

const ES: Country = {
  scope: "OVERSEAS",
  code: "ES",
  country: "스페인",
  transport:
    "도시 간에는 AVE 고속열차를 이용하고, 시내에서는 지하철과 버스를 이용합니다.",
  etiquette: [
    "저녁 식사 시간이 늦어 식당은 대개 오후 8시 이후에 붐빕니다.",
    "붐비는 지하철과 관광지에서는 소매치기에 주의합니다.",
  ],
  sourceName: "스페인관광청",
  sourceUrl: "https://www.spain.info/",
};

const GB: Country = {
  scope: "OVERSEAS",
  code: "GB",
  country: "영국",
  transport:
    "런던은 지하철(Tube)과 버스를 비접촉 카드로 이용하고, 도시 간에는 내셔널 레일을 이용합니다.",
  etiquette: [
    "줄을 서는 문화가 강하니 차례를 지킵니다.",
    "에스컬레이터에서는 오른쪽에 서고 왼쪽을 비워 둡니다.",
  ],
  sourceName: "영국관광청(VisitBritain)",
  sourceUrl: "https://www.visitbritain.com/",
};

const DE: Country = {
  scope: "OVERSEAS",
  code: "DE",
  country: "독일",
  transport:
    "도시 안에서는 U-Bahn·S-Bahn·트램을 이용하고, 도시 간에는 ICE 고속열차를 이용합니다.",
  etiquette: [
    "승차권은 탑승 전에 구입하고 검표에 대비해 보관합니다.",
    "일요일에는 대부분의 상점이 문을 닫습니다.",
  ],
  sourceName: "독일관광청",
  sourceUrl: "https://www.germany.travel/",
};

const CZ: Country = {
  scope: "OVERSEAS",
  code: "CZ",
  country: "체코",
  transport:
    "프라하는 지하철·트램을 이용하고, 도시 간에는 버스와 열차를 이용합니다.",
  etiquette: [
    "환전소는 환율과 수수료를 확인한 뒤 이용합니다.",
    "택시는 호출 앱을 쓰면 요금 분쟁을 줄일 수 있습니다.",
  ],
  sourceName: "체코관광청(CzechTourism)",
  sourceUrl: "https://www.czechtourism.com/",
};

const TR: Country = {
  scope: "OVERSEAS",
  code: "TR",
  country: "튀르키예",
  transport:
    "이스탄불은 트램·지하철·페리를 이용하고, 도시 간에는 국내선 항공과 장거리 버스를 이용합니다.",
  etiquette: [
    "모스크에서는 신발을 벗고 어깨와 무릎을 가립니다.",
    "기도 시간에는 모스크 내부 관람을 삼갑니다.",
  ],
  sourceName: "튀르키예관광청",
  sourceUrl: "https://goturkiye.com/",
};

const US: Country = {
  scope: "OVERSEAS",
  code: "US",
  country: "미국",
  transport:
    "도시 안에서는 지하철·버스와 차량 호출 앱을 이용하고, 도시 간에는 국내선 항공을 이용합니다.",
  etiquette: [
    "식당과 택시 등 서비스에는 팁 문화가 있으니 기준을 미리 확인합니다.",
    "입국 전 전자여행허가(ESTA) 등 입국 요건을 확인합니다.",
  ],
  sourceName: "미국관광청(Brand USA)",
  sourceUrl: "https://www.visittheusa.com/",
};

const AU: Country = {
  scope: "OVERSEAS",
  code: "AU",
  country: "호주",
  transport:
    "도시 안에서는 전철·트램·버스를 이용하고, 도시 간에는 국내선 항공을 이용합니다.",
  etiquette: [
    "자외선이 강하니 선크림과 모자를 챙깁니다.",
    "검역이 엄격해 음식과 식물류는 입국 시 신고합니다.",
  ],
  sourceName: "호주관광청",
  sourceUrl: "https://www.australia.com/",
};

const ID: Country = {
  scope: "OVERSEAS",
  code: "ID",
  country: "인도네시아",
  transport:
    "시내에서는 차량 호출 앱과 택시를 이용하고, 섬과 도시 간에는 국내선 항공과 열차를 이용합니다.",
  etiquette: [
    "사원에서는 사롱 등으로 복장을 갖추고 예배 행렬을 방해하지 않습니다.",
    "왼손으로 음식을 건네거나 받는 행동은 피합니다.",
  ],
  sourceName: "인도네시아관광청",
  sourceUrl: "https://www.indonesia.travel/",
};

const PT: Country = {
  scope: "OVERSEAS",
  code: "PT",
  country: "포르투갈",
  transport:
    "도시 안에서는 지하철·트램·버스를 이용하고, 도시 간에는 열차와 고속버스를 이용합니다.",
  etiquette: [
    "언덕과 돌길이 많아 편한 신발이 필요합니다.",
    "식당의 에피타이저는 손대면 비용이 청구될 수 있습니다.",
  ],
  sourceName: "포르투갈관광청",
  sourceUrl: "https://www.visitportugal.com/",
};

export const destinations: readonly Destination[] = [
  // 국내
  build(KR, {
    id: "seoul",
    name: "서울",
    themes: ["도시 탐방", "역사·문화", "미식"],
    summary:
      "궁궐과 현대 도시가 함께 있어 하루 단위로 취향을 바꿔 걷기 좋은 수도입니다.",
    attractions: [
      "경복궁",
      "북촌한옥마을",
      "인사동",
      "남산서울타워",
      "한강공원",
    ],
    seasons: ["봄", "가을"],
    budget: [80000, 200000],
    foods: ["비빔밥", "광장시장 빈대떡", "떡볶이"],
  }),
  build(KR, {
    id: "busan",
    name: "부산",
    themes: ["휴양", "미식", "도시 탐방"],
    summary: "해변과 항구, 언덕 마을이 이어지는 해양 도시입니다.",
    attractions: [
      "해운대해수욕장",
      "감천문화마을",
      "광안대교 야경",
      "자갈치시장",
      "태종대",
    ],
    seasons: ["여름", "가을"],
    budget: [70000, 170000],
    foods: ["돼지국밥", "밀면", "씨앗호떡"],
  }),
  build(KR, {
    id: "jeju",
    name: "제주",
    themes: ["자연", "휴양", "액티비티"],
    summary: "오름과 해안 도로, 바다 풍경으로 천천히 쉬어 가기 좋은 섬입니다.",
    attractions: ["성산일출봉", "한라산", "협재해변", "우도", "섭지코지"],
    seasons: ["봄", "가을"],
    budget: [90000, 220000],
    foods: ["흑돼지구이", "고기국수", "한치물회"],
  }),
  build(KR, {
    id: "gangneung",
    name: "강릉",
    themes: ["자연", "미식", "휴양"],
    summary: "동해 바다와 커피 거리, 솔숲이 가까이 모여 있는 도시입니다.",
    attractions: [
      "경포해변",
      "안목해변 커피거리",
      "오죽헌",
      "정동진",
      "주문진수산시장",
    ],
    seasons: ["여름", "가을"],
    budget: [70000, 160000],
    foods: ["초당순두부", "물회", "커피"],
  }),
  build(KR, {
    id: "gyeongju",
    name: "경주",
    themes: ["역사·문화", "도시 탐방", "자연"],
    summary:
      "신라 천년의 유적이 도시 곳곳에 남아 있어 걸으며 둘러보기 좋습니다.",
    attractions: ["불국사", "석굴암", "대릉원", "첨성대", "동궁과 월지"],
    seasons: ["봄", "가을"],
    budget: [60000, 140000],
    foods: ["경주빵", "쌈밥", "한우 불고기"],
  }),
  build(KR, {
    id: "jeonju",
    name: "전주",
    themes: ["미식", "역사·문화", "도시 탐방"],
    summary: "한옥마을과 한식으로 여행의 중심을 잡기 좋은 도시입니다.",
    attractions: ["전주한옥마을", "경기전", "전동성당", "남부시장", "오목대"],
    seasons: ["봄", "가을"],
    budget: [60000, 140000],
    foods: ["전주비빔밥", "콩나물국밥", "막걸리 한 상"],
  }),
  build(KR, {
    id: "yeosu",
    name: "여수",
    themes: ["휴양", "미식", "자연"],
    summary: "섬과 밤바다가 어우러지는 남해안의 항구 도시입니다.",
    attractions: [
      "여수 해상케이블카",
      "오동도",
      "여수 밤바다",
      "향일암",
      "이순신광장",
    ],
    seasons: ["봄", "가을"],
    budget: [70000, 160000],
    foods: ["갓김치", "게장백반", "서대회"],
  }),
  build(KR, {
    id: "sokcho",
    name: "속초",
    themes: ["자연", "액티비티", "미식"],
    summary: "설악산과 동해 바다를 하루에 함께 볼 수 있는 도시입니다.",
    attractions: [
      "설악산 국립공원",
      "속초해변",
      "속초중앙시장",
      "영금정",
      "아바이마을",
    ],
    seasons: ["여름", "가을"],
    budget: [70000, 160000],
    foods: ["닭강정", "오징어순대", "물회"],
  }),
  build(KR, {
    id: "tongyeong",
    name: "통영",
    themes: ["휴양", "미식", "역사·문화"],
    summary: "한려수도의 섬과 항구, 예술가의 흔적이 남은 바다 도시입니다.",
    attractions: [
      "동피랑 벽화마을",
      "통영 케이블카",
      "이순신공원",
      "통영 중앙시장",
      "소매물도",
    ],
    seasons: ["봄", "가을"],
    budget: [60000, 150000],
    foods: ["충무김밥", "굴 요리", "꿀빵"],
  }),
  build(KR, {
    id: "andong",
    name: "안동",
    themes: ["역사·문화", "자연", "미식"],
    summary:
      "전통 마을과 서원을 조용히 걸으며 유교 문화를 접할 수 있는 도시입니다.",
    attractions: [
      "하회마을",
      "병산서원",
      "도산서원",
      "월영교",
      "안동 찜닭골목",
    ],
    seasons: ["봄", "가을"],
    budget: [55000, 130000],
    foods: ["안동찜닭", "안동 간고등어", "헛제삿밥"],
  }),

  // 일본
  build(JP, {
    id: "tokyo",
    name: "도쿄",
    themes: ["도시 탐방", "미식", "역사·문화"],
    summary:
      "전통 사원과 첨단 거리가 한 도시에 공존해 취향대로 코스를 짤 수 있습니다.",
    attractions: [
      "센소지",
      "시부야 스크램블 교차로",
      "메이지 신궁",
      "도쿄 스카이트리",
      "츠키지 장외시장",
    ],
    seasons: ["봄", "가을"],
    budget: [150000, 330000],
    foods: ["스시", "라멘", "모나카"],
  }),
  build(JP, {
    id: "osaka",
    name: "오사카",
    themes: ["미식", "도시 탐방", "역사·문화"],
    summary:
      "먹거리와 활기찬 거리가 중심이고 교토·나라로 이동하기 좋은 도시입니다.",
    attractions: [
      "오사카성",
      "도톤보리",
      "신세카이",
      "구로몬 시장",
      "우메다 스카이빌딩",
    ],
    seasons: ["봄", "가을"],
    budget: [130000, 300000],
    foods: ["타코야키", "오코노미야키", "쿠시카츠"],
  }),

  // 태국
  build(TH, {
    id: "bangkok",
    name: "방콕",
    themes: ["도시 탐방", "미식", "역사·문화"],
    summary: "왕궁과 사원, 야시장과 쇼핑몰이 한 도시에 모여 있습니다.",
    attractions: [
      "왕궁",
      "왓포",
      "왓아룬",
      "짜뚜짝 시장",
      "차오프라야강 크루즈",
    ],
    seasons: ["겨울"],
    budget: [80000, 220000],
    foods: ["팟타이", "똠얌꿍", "망고 찰밥"],
  }),
  build(TH, {
    id: "chiang-mai",
    name: "치앙마이",
    themes: ["자연", "역사·문화", "휴양"],
    summary:
      "구시가의 사원과 산자락 풍경으로 느리게 머물기 좋은 북부 도시입니다.",
    attractions: [
      "올드시티 사원 투어",
      "왓 프라탓 도이수텝",
      "님만해민 거리",
      "선데이 워킹 스트리트",
      "도이인타논 국립공원",
    ],
    seasons: ["겨울"],
    budget: [60000, 160000],
    foods: ["카오소이", "사이우아", "코코넛 아이스크림"],
  }),

  // 베트남
  build(VN, {
    id: "da-nang",
    name: "다낭",
    themes: ["휴양", "자연", "미식"],
    summary: "긴 해변과 가까운 호이안 구시가를 함께 즐기는 해안 휴양지입니다.",
    attractions: [
      "미케비치",
      "바나힐 골든브릿지",
      "오행산",
      "한 시장",
      "호이안 구시가",
    ],
    seasons: ["봄", "여름"],
    budget: [60000, 170000],
    foods: ["미꽝", "반미", "분짜"],
  }),
  build(VN, {
    id: "hanoi",
    name: "하노이",
    themes: ["역사·문화", "미식", "도시 탐방"],
    summary:
      "호안끼엠 호수와 구시가의 골목 음식으로 일상을 가까이 볼 수 있는 수도입니다.",
    attractions: [
      "호안끼엠 호수",
      "하노이 구시가",
      "문묘",
      "호찌민 묘소",
      "탕롱 황성",
    ],
    seasons: ["가을", "봄"],
    budget: [55000, 150000],
    foods: ["쌀국수 퍼", "분짜", "에그커피"],
  }),

  // 대만
  build(TW, {
    id: "taipei",
    name: "타이베이",
    themes: ["도시 탐방", "미식", "역사·문화"],
    summary: "야시장과 온천, 근교 마을을 짧은 이동으로 이어서 볼 수 있습니다.",
    attractions: [
      "타이베이 101",
      "국립고궁박물원",
      "스린 야시장",
      "용산사",
      "지우펀",
    ],
    seasons: ["봄", "가을"],
    budget: [90000, 220000],
    foods: ["소룡포", "우육면", "버블티"],
  }),
  build(TW, {
    id: "kaohsiung",
    name: "가오슝",
    themes: ["도시 탐방", "휴양", "미식"],
    summary: "항구와 예술 지구가 어우러진 남부의 느긋한 도시입니다.",
    attractions: [
      "보얼예술특구",
      "롄츠탄",
      "치진섬",
      "리우허 야시장",
      "불광산사",
    ],
    seasons: ["겨울", "봄"],
    budget: [80000, 190000],
    foods: ["고기 도시락", "망고 빙수", "굴 요리"],
  }),

  // 프랑스
  build(FR, {
    id: "paris",
    name: "파리",
    themes: ["도시 탐방", "역사·문화", "미식"],
    summary: "미술관과 센강 산책, 카페 문화로 천천히 걷기 좋은 도시입니다.",
    attractions: [
      "에펠탑",
      "루브르 박물관",
      "오르세 미술관",
      "몽마르트르",
      "노트르담 대성당 주변",
    ],
    seasons: ["봄", "가을"],
    budget: [200000, 450000],
    foods: ["크루아상", "양파 수프", "마카롱"],
  }),
  build(FR, {
    id: "nice",
    name: "니스",
    themes: ["휴양", "자연", "미식"],
    summary: "지중해 해안 산책로와 구시가를 느긋하게 즐기는 휴양 도시입니다.",
    attractions: [
      "영국인 산책로",
      "니스 구시가",
      "성 언덕 전망대",
      "마티스 미술관",
      "에즈 마을",
    ],
    seasons: ["봄", "여름"],
    budget: [180000, 400000],
    foods: ["니수아즈 샐러드", "소카", "라타투이"],
  }),

  // 이탈리아
  build(IT, {
    id: "rome",
    name: "로마",
    themes: ["역사·문화", "도시 탐방", "미식"],
    summary: "고대 유적과 광장이 도보 거리에 모여 있는 역사 도시입니다.",
    attractions: [
      "콜로세움",
      "바티칸 박물관",
      "트레비 분수",
      "판테온",
      "스페인 광장",
    ],
    seasons: ["봄", "가을"],
    budget: [170000, 380000],
    foods: ["카르보나라", "카초 에 페페", "젤라토"],
  }),
  build(IT, {
    id: "florence",
    name: "피렌체",
    themes: ["역사·문화", "도시 탐방", "미식"],
    summary: "르네상스 예술을 도보로 둘러볼 수 있는 아담한 도시입니다.",
    attractions: [
      "두오모 대성당",
      "우피치 미술관",
      "베키오 다리",
      "미켈란젤로 광장",
      "아카데미아 미술관",
    ],
    seasons: ["봄", "가을"],
    budget: [160000, 360000],
    foods: ["티본 스테이크", "리볼리타 수프", "젤라토"],
  }),

  // 스페인
  build(ES, {
    id: "barcelona",
    name: "바르셀로나",
    themes: ["도시 탐방", "역사·문화", "미식"],
    summary: "가우디 건축과 지중해 해변, 타파스 문화가 어우러진 도시입니다.",
    attractions: [
      "사그라다 파밀리아",
      "구엘 공원",
      "카사 바트요",
      "고딕 지구",
      "바르셀로네타 해변",
    ],
    seasons: ["봄", "가을"],
    budget: [150000, 340000],
    foods: ["타파스", "파에야", "추로스"],
  }),
  build(ES, {
    id: "madrid",
    name: "마드리드",
    themes: ["도시 탐방", "역사·문화", "미식"],
    summary: "대형 미술관과 광장, 늦은 밤까지 이어지는 식당 거리가 매력입니다.",
    attractions: [
      "프라도 미술관",
      "마요르 광장",
      "레티로 공원",
      "왕궁",
      "산미겔 시장",
    ],
    seasons: ["봄", "가을"],
    budget: [140000, 320000],
    foods: ["하몽", "또르띠야", "초콜릿 추로스"],
  }),

  // 영국
  build(GB, {
    id: "london",
    name: "런던",
    themes: ["도시 탐방", "역사·문화"],
    summary:
      "대영박물관 같은 무료 입장 박물관과 템스강변 풍경이 이어지는 도시입니다.",
    attractions: [
      "대영박물관",
      "타워 브리지",
      "웨스트민스터 사원",
      "버킹엄 궁전",
      "코벤트 가든",
    ],
    seasons: ["봄", "여름"],
    budget: [220000, 480000],
    foods: ["피시 앤 칩스", "선데이 로스트", "애프터눈 티"],
  }),
  build(GB, {
    id: "edinburgh",
    name: "에딘버러",
    themes: ["역사·문화", "도시 탐방", "자연"],
    summary: "언덕 위 성과 중세 골목이 이어지는 스코틀랜드의 수도입니다.",
    attractions: [
      "에딘버러 성",
      "로열 마일",
      "아서스 시트",
      "칼튼 힐",
      "홀리루드 궁전",
    ],
    seasons: ["여름", "가을"],
    budget: [180000, 400000],
    foods: ["해기스", "스코티시 연어", "쇼트브레드"],
  }),

  // 독일
  build(DE, {
    id: "berlin",
    name: "베를린",
    themes: ["도시 탐방", "역사·문화"],
    summary: "분단의 역사와 현대 예술, 활기찬 거리 문화가 공존하는 도시입니다.",
    attractions: [
      "브란덴부르크 문",
      "베를린 장벽 기념관",
      "박물관 섬",
      "이스트 사이드 갤러리",
      "홀로코스트 추모비",
    ],
    seasons: ["봄", "여름"],
    budget: [140000, 320000],
    foods: ["커리부어스트", "되너 케밥", "슈니첼"],
  }),
  build(DE, {
    id: "munich",
    name: "뮌헨",
    themes: ["도시 탐방", "역사·문화", "미식"],
    summary: "광장과 궁전, 맥주 문화가 가까운 바이에른의 중심 도시입니다.",
    attractions: [
      "마리엔 광장",
      "님펜부르크 궁전",
      "잉글리시 가르텐",
      "독일 박물관",
      "노이슈반슈타인성 근교",
    ],
    seasons: ["여름", "가을"],
    budget: [150000, 340000],
    foods: ["바이스부어스트", "학세", "프레첼"],
  }),

  // 체코
  build(CZ, {
    id: "prague",
    name: "프라하",
    themes: ["역사·문화", "도시 탐방"],
    summary: "중세 구시가와 성, 다리가 한눈에 보이는 도보 여행 도시입니다.",
    attractions: [
      "프라하 성",
      "카를교",
      "구시가 광장과 천문시계",
      "바츨라프 광장",
      "페트르진 전망대",
    ],
    seasons: ["봄", "가을"],
    budget: [90000, 230000],
    foods: ["굴라쉬", "트르델닉", "체코 맥주"],
  }),
  build(CZ, {
    id: "cesky-krumlov",
    name: "체스키크룸로프",
    themes: ["역사·문화", "자연", "휴양"],
    summary: "강이 굽이치는 중세 마을 전체가 세계유산인 작은 도시입니다.",
    attractions: [
      "체스키크룸로프 성",
      "블타바강 래프팅",
      "성 비투스 성당",
      "에곤 실레 미술관",
      "구시가 광장",
    ],
    seasons: ["봄", "가을"],
    budget: [80000, 200000],
    foods: ["오리 구이", "마을 맥주", "굴뚝빵"],
  }),

  // 튀르키예
  build(TR, {
    id: "istanbul",
    name: "이스탄불",
    themes: ["역사·문화", "도시 탐방", "미식"],
    summary:
      "동서양이 만나는 해협 도시로 모스크와 시장, 페리 여행이 인상적입니다.",
    attractions: [
      "아야소피아",
      "블루 모스크",
      "톱카프 궁전",
      "그랜드 바자르",
      "보스포루스 크루즈",
    ],
    seasons: ["봄", "가을"],
    budget: [80000, 200000],
    foods: ["케밥", "바클라바", "튀르키예 차이"],
  }),
  build(TR, {
    id: "cappadocia",
    name: "카파도키아",
    themes: ["자연", "액티비티"],
    summary: "기암괴석 지형과 지하 도시를 열기구와 트레킹으로 만나는 곳입니다.",
    attractions: [
      "괴레메 야외박물관",
      "열기구 투어",
      "데린쿠유 지하도시",
      "로즈 밸리 트레킹",
      "우치히사르 전망",
    ],
    seasons: ["봄", "가을"],
    budget: [90000, 230000],
    foods: ["항아리 케밥", "맨티", "튀르키예 커피"],
  }),

  // 미국
  build(US, {
    id: "new-york",
    name: "뉴욕",
    themes: ["도시 탐방", "역사·문화", "미식"],
    summary: "박물관과 공연, 다양한 음식이 모인 대도시입니다.",
    attractions: [
      "센트럴 파크",
      "메트로폴리탄 미술관",
      "브루클린 브리지",
      "타임스 스퀘어",
      "자유의 여신상",
    ],
    seasons: ["봄", "가을"],
    budget: [280000, 600000],
    foods: ["뉴욕 피자", "베이글", "치즈케이크"],
  }),
  build(US, {
    id: "san-francisco",
    name: "샌프란시스코",
    themes: ["도시 탐방", "자연", "미식"],
    summary: "언덕 도시와 금문교, 만을 따라 이어지는 풍경이 매력입니다.",
    attractions: [
      "금문교",
      "피셔맨스 워프",
      "알카트라즈 섬",
      "롬바드 스트리트",
      "골든게이트 파크",
    ],
    seasons: ["가을", "봄"],
    budget: [260000, 560000],
    foods: ["클램 차우더", "사워도우 빵", "미션 부리토"],
  }),

  // 호주
  build(AU, {
    id: "sydney",
    name: "시드니",
    themes: ["도시 탐방", "휴양", "자연"],
    summary: "항구와 해변, 오페라하우스 주변 산책으로 완성되는 도시입니다.",
    attractions: [
      "시드니 오페라하우스",
      "하버 브리지",
      "본다이 해변",
      "로열 보태닉 가든",
      "더 록스",
    ],
    seasons: ["봄", "가을"],
    budget: [200000, 450000],
    foods: ["미트 파이", "피시 앤 칩스", "플랫 화이트"],
  }),
  build(AU, {
    id: "melbourne",
    name: "멜버른",
    themes: ["도시 탐방", "미식", "역사·문화"],
    summary: "골목 카페와 벽화, 예술 문화가 풍부한 도시입니다.",
    attractions: [
      "플린더스 스트리트 역",
      "호지어 레인",
      "퀸 빅토리아 마켓",
      "빅토리아 국립미술관",
      "그레이트 오션 로드 근교",
    ],
    seasons: ["봄", "가을"],
    budget: [180000, 420000],
    foods: ["플랫 화이트", "브런치", "미트 파이"],
  }),

  // 인도네시아
  build(ID, {
    id: "bali",
    name: "발리",
    themes: ["휴양", "자연", "액티비티"],
    summary: "해변과 계단식 논, 사원이 어우러진 휴양 섬입니다.",
    attractions: [
      "울루와뚜 사원",
      "우붓 몽키 포레스트",
      "뜨갈랄랑 계단식 논",
      "탄중 브노아 해변",
      "띠르타 엠풀 사원",
    ],
    seasons: ["여름"],
    budget: [70000, 220000],
    foods: ["나시고렝", "사테", "바비굴링"],
  }),
  build(ID, {
    id: "yogyakarta",
    name: "족자카르타",
    themes: ["역사·문화", "자연"],
    summary: "보로부두르와 프람바난 같은 유적을 둘러보기 좋은 문화 도시입니다.",
    attractions: [
      "보로부두르 사원",
      "프람바난 사원",
      "술탄 궁전",
      "타만 사리",
      "말리오보로 거리",
    ],
    seasons: ["여름"],
    budget: [50000, 150000],
    foods: ["구득", "나시 고렝", "사테 클라텍"],
  }),

  // 포르투갈
  build(PT, {
    id: "lisbon",
    name: "리스본",
    themes: ["도시 탐방", "역사·문화", "미식"],
    summary: "언덕과 트램, 강변 풍경이 매력적인 대서양변의 수도입니다.",
    attractions: [
      "벨렝 탑",
      "제로니무스 수도원",
      "알파마 지구",
      "28번 트램",
      "상 조르제 성",
    ],
    seasons: ["봄", "가을"],
    budget: [110000, 260000],
    foods: ["파스텔 드 나타", "바칼라우", "정어리 구이"],
  }),
  build(PT, {
    id: "porto",
    name: "포르투",
    themes: ["도시 탐방", "역사·문화", "미식"],
    summary: "강변 구시가와 와인 저장고, 타일 장식 건물이 이어지는 도시입니다.",
    attractions: [
      "동 루이스 1세 다리",
      "히베이라 지구",
      "렐루 서점",
      "상 벤투 역",
      "와인 저장고 투어",
    ],
    seasons: ["봄", "가을"],
    budget: [100000, 240000],
    foods: ["프란세지냐", "포트 와인", "대구 요리"],
  }),
];

export const domesticDestinations = destinations.filter(
  (d) => d.scope === "DOMESTIC",
);
export const overseasDestinations = destinations.filter(
  (d) => d.scope === "OVERSEAS",
);
