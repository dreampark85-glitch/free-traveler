/**
 * 해외 15개국 안전정보 정적 데이터 (REQ-FUNC-046~053).
 *
 * - `advisoryLevel`: 외교부 여행경보 단계. 공식 원문으로 확인하기 전에는 "UNVERIFIED"이며
 *   화면에서 "공식 원문 재확인 필요"로 표시해야 한다. 경보 없음을 뜻하지 않는다.
 * - `verifiedAt`: 공식 출처 원문과 대조한 날짜(YYYY-MM-DD). 대조 전에는 null이고,
 *   null이거나 7일을 넘기면 stale로 취급한다.
 * - 본문은 일반 안내이며 공식 판단을 대체하지 않는다. 출국 전 원문을 다시 확인한다.
 */

export type SafetyCategory =
  | "security"
  | "scam"
  | "law"
  | "transport"
  | "disaster"
  | "health"
  | "culture"
  | "emergency";

export const SAFETY_CATEGORIES: readonly SafetyCategory[] = [
  "security",
  "scam",
  "law",
  "transport",
  "disaster",
  "health",
  "culture",
  "emergency",
];

export const SAFETY_CATEGORY_LABELS: Record<SafetyCategory, string> = {
  security: "치안",
  scam: "사기",
  law: "법규",
  transport: "교통",
  disaster: "재난",
  health: "보건",
  culture: "문화",
  emergency: "긴급연락처",
};

export type AdvisoryLevel =
  | "UNVERIFIED"
  | "NONE"
  | "CAUTION"
  | "RESTRAINT"
  | "EVACUATION_ADVISED"
  | "BAN";

export type SafetyScope =
  | { scopeType: "COUNTRY"; scopeText?: string }
  | { scopeType: "REGION"; scopeText: string };

export interface EmergencyContact {
  label: string;
  phone: string;
}

export interface CountrySafety {
  countryCode: string;
  country: string;
  advisoryLevel: AdvisoryLevel;
  scope: SafetyScope;
  /** 치안·사기·법규·교통·재난·보건·문화 본문 */
  sections: Record<Exclude<SafetyCategory, "emergency">, string>;
  /** 긴급연락처: 현지 긴급전화와 영사콜센터 */
  emergencyContacts: EmergencyContact[];
  sourceName: string;
  /** 공식 출처 URL. 없으면 게시할 수 없다. */
  sourceUrl: string;
  verifiedAt: string | null;
  editor: string;
}

const EDITOR = "free_traveler 편집팀";
const SOURCE_NAME = "외교부 해외안전여행";
const SOURCE_URL = "https://www.0404.go.kr/";
const CONSULAR: EmergencyContact = {
  label: "영사콜센터(24시간)",
  phone: "+82-2-3210-0404",
};

function entry(
  countryCode: string,
  country: string,
  sections: CountrySafety["sections"],
  local: EmergencyContact[],
): CountrySafety {
  return {
    countryCode,
    country,
    advisoryLevel: "UNVERIFIED",
    scope: { scopeType: "COUNTRY" },
    sections,
    emergencyContacts: [...local, CONSULAR],
    sourceName: SOURCE_NAME,
    sourceUrl: SOURCE_URL,
    verifiedAt: null,
    editor: EDITOR,
  };
}

export const countrySafety: readonly CountrySafety[] = [
  entry(
    "JP",
    "일본",
    {
      security:
        "전반적으로 치안이 안정적이지만 번화가와 유흥가에서는 소지품과 음료를 주의합니다.",
      scam: "호객꾼을 따라가 고액을 청구받는 사례가 있으니 가격을 확인하고 동행하지 않습니다.",
      law: "공공장소 흡연은 지정 구역에서만 허용되고, 일부 의약품은 반입이 제한됩니다.",
      transport: "열차 안에서는 통화를 삼가고 우선석 이용 예절을 지킵니다.",
      disaster:
        "지진·태풍이 잦으니 숙소의 대피 경로와 재난 알림 앱을 미리 확인합니다.",
      health: "여름철 온열질환에 주의하고 상비약 반입 기준을 확인합니다.",
      culture: "신사와 사찰에서는 조용히 하고 사진 촬영 금지 표지를 지킵니다.",
    },
    [
      { label: "경찰", phone: "110" },
      { label: "화재·구급", phone: "119" },
    ],
  ),
  entry(
    "TH",
    "태국",
    {
      security:
        "관광지에서 소매치기와 오토바이 날치기가 있으니 가방을 도로 반대편에 메고 다닙니다.",
      scam: "툭툭 기사나 호객꾼이 특정 가게로 유도하는 사례가 있으니 미터 요금과 가격을 확인합니다.",
      law: "왕실을 모욕하는 행위는 처벌 대상이며 전자담배 반입·사용이 제한됩니다.",
      transport:
        "차량 호출 앱 이용을 권하고 오토바이 택시는 헬멧과 보험 여부를 확인합니다.",
      disaster: "우기에는 홍수와 갑작스러운 폭우가 있을 수 있습니다.",
      health:
        "모기 매개 질환이 있으니 기피제를 사용하고 길거리 음식은 위생을 확인합니다.",
      culture:
        "사원에서는 어깨와 무릎을 가리고 승려에게 신체 접촉을 하지 않습니다.",
    },
    [
      { label: "경찰", phone: "191" },
      { label: "관광경찰", phone: "1155" },
      { label: "구급", phone: "1669" },
    ],
  ),
  entry(
    "VN",
    "베트남",
    {
      security:
        "오토바이 날치기가 있으니 휴대폰과 가방을 차도 쪽으로 들지 않습니다.",
      scam: "택시 요금 부풀리기가 있으니 차량 호출 앱이나 미터기를 사용합니다.",
      law: "마약 관련 처벌이 매우 엄격하고 일부 지역 촬영이 제한됩니다.",
      transport:
        "차선 없이 오토바이가 많아 횡단은 천천히 일정한 속도로 걷습니다.",
      disaster: "태풍과 홍수 시기에는 항공·열차 지연이 생길 수 있습니다.",
      health:
        "수돗물은 마시지 않고 생수를 이용하며 모기 매개 질환에 대비합니다.",
      culture: "사원과 기념관에서는 단정한 복장을 갖춥니다.",
    },
    [
      { label: "경찰", phone: "113" },
      { label: "구급", phone: "115" },
    ],
  ),
  entry(
    "TW",
    "대만",
    {
      security:
        "치안이 비교적 안정적이지만 야시장에서는 소지품을 앞쪽에 둡니다.",
      scam: "관광객 대상 가격 바가지에 대비해 가격표를 확인합니다.",
      law: "MRT 역 안에서의 음식 섭취·음용은 과태료 대상입니다.",
      transport: "스쿠터가 많으니 횡단보도에서도 좌우를 확인합니다.",
      disaster: "지진과 태풍이 잦으니 기상 특보와 숙소 대피 안내를 확인합니다.",
      health: "여름철 뎅기열 등 모기 매개 질환에 대비합니다.",
      culture: "사원에서는 향 사용과 촬영 규칙을 따르고 정숙합니다.",
    },
    [
      { label: "경찰", phone: "110" },
      { label: "화재·구급", phone: "119" },
    ],
  ),
  entry(
    "FR",
    "프랑스",
    {
      security:
        "에펠탑 등 관광지와 지하철에서 소매치기가 많으니 소지품을 앞쪽에 둡니다.",
      scam: "서명을 요구하는 청원 사기와 팔찌 씌우기 수법에 응하지 않습니다.",
      law: "공공장소 음주와 일부 구역 내 촬영에 제한이 있습니다.",
      transport:
        "지하철 승차권은 탑승·하차까지 보관하고 파업 일정은 미리 확인합니다.",
      disaster: "여름철 폭염과 산불 경보 지역을 확인합니다.",
      health: "의료비가 높아 해외여행자보험 가입을 권합니다.",
      culture: "가게에 들어갈 때 인사말을 먼저 건네는 것이 예의입니다.",
    },
    [
      { label: "경찰", phone: "17" },
      { label: "응급(통합)", phone: "112" },
    ],
  ),
  entry(
    "IT",
    "이탈리아",
    {
      security: "로마·피렌체 등 관광지와 대중교통에서 소매치기에 주의합니다.",
      scam: "거리 호객, 가짜 가이드, 팔찌 씌우기 수법에 응하지 않습니다.",
      law: "유적지 주변 앉기·음식 섭취 금지 구역이 있어 과태료가 부과될 수 있습니다.",
      transport:
        "열차 승차권은 탑승 전 검인이 필요한 경우가 있으니 확인합니다.",
      disaster: "지진과 화산 활동 지역이 있어 현지 안내를 확인합니다.",
      health: "여름철 폭염에 주의하고 의료비 대비 여행자보험을 권합니다.",
      culture: "성당 입장 시 어깨와 무릎을 가리는 복장을 갖춥니다.",
    },
    [{ label: "응급(통합)", phone: "112" }],
  ),
  entry(
    "ES",
    "스페인",
    {
      security:
        "바르셀로나·마드리드는 소매치기가 많은 편이니 가방을 앞쪽에 둡니다.",
      scam: "길거리 게임과 서명 요구, 팔찌 씌우기에 응하지 않습니다.",
      law: "일부 해변과 거리에서는 음주나 노상 판매에 제한이 있습니다.",
      transport: "지하철과 관광지 인근 역에서 소지품을 특히 주의합니다.",
      disaster:
        "여름철 폭염과 산불 위험이 있고 일부 지역은 폭우 피해가 날 수 있습니다.",
      health: "한낮 폭염을 피하고 의료비 대비 여행자보험을 권합니다.",
      culture: "식사 시간이 늦은 편이라 식당 영업시간을 미리 확인합니다.",
    },
    [{ label: "응급(통합)", phone: "112" }],
  ),
  entry(
    "GB",
    "영국",
    {
      security:
        "관광지와 지하철에서 휴대폰 날치기가 있으니 도로 쪽에서 사용하지 않습니다.",
      scam: "무허가 택시와 길거리 복권·게임 사기에 주의합니다.",
      law: "공공장소 음주와 칼 소지에 대한 규정이 엄격합니다.",
      transport: "차량이 좌측통행이라 횡단 시 오른쪽을 먼저 살핍니다.",
      disaster: "강풍과 홍수가 일부 지역에서 발생할 수 있습니다.",
      health:
        "국민보건서비스는 외국인 이용에 제한이 있어 여행자보험을 권합니다.",
      culture: "줄을 서는 문화가 강하니 차례를 지킵니다.",
    },
    [{ label: "응급(경찰·소방·구급)", phone: "999" }],
  ),
  entry(
    "DE",
    "독일",
    {
      security: "역과 번화가에서 소매치기가 있으니 소지품을 몸 앞에 둡니다.",
      scam: "서명 요구와 기부 요구를 가장한 사기에 응하지 않습니다.",
      law: "일요일에는 대부분의 상점이 문을 닫고 무임승차는 과태료 대상입니다.",
      transport: "승차권은 탑승 전 구입·검인하고 검표에 대비해 보관합니다.",
      disaster: "일부 지역은 홍수와 폭설이 있을 수 있습니다.",
      health: "의료비 대비 여행자보험을 권합니다.",
      culture: "시간 약속과 소음 규칙, 분리수거 규칙을 지킵니다.",
    },
    [
      { label: "경찰", phone: "110" },
      { label: "소방·구급", phone: "112" },
    ],
  ),
  entry(
    "CZ",
    "체코",
    {
      security:
        "프라하 중심가와 트램에서 소매치기가 많으니 소지품에 주의합니다.",
      scam: "환전소 수수료와 택시 요금 부풀리기에 주의하고 호출 앱을 이용합니다.",
      law: "무허가 환전과 노점 판매를 이용하지 않습니다.",
      transport: "트램·지하철 승차권은 개시 검인이 필요합니다.",
      disaster: "홍수 위험 지역이 있어 기상 특보를 확인합니다.",
      health: "의료비 대비 여행자보험을 권합니다.",
      culture: "식당 팁 관행을 확인하고 정중하게 인사합니다.",
    },
    [{ label: "응급(통합)", phone: "112" }],
  ),
  entry(
    "TR",
    "튀르키예",
    {
      security:
        "관광지에서는 소매치기와 호객이 있고 국경 인근 지역은 별도 안내를 확인해야 합니다.",
      scam: "그랜드 바자르 등에서 가격을 먼저 정하고 가짜 가이드·택시 요금에 주의합니다.",
      law: "국기와 국가 지도자를 모욕하는 행위는 처벌 대상이며 문화재 반출은 금지됩니다.",
      transport:
        "택시는 미터기 사용을 확인하고 도시 간 이동은 시간 여유를 둡니다.",
      disaster: "지진 위험 지역이므로 숙소의 대피 경로를 확인합니다.",
      health: "수돗물은 마시지 않고 생수를 이용합니다.",
      culture: "모스크에서는 신발을 벗고 어깨와 무릎을 가립니다.",
    },
    [
      { label: "경찰", phone: "155" },
      { label: "응급(통합)", phone: "112" },
    ],
  ),
  entry(
    "US",
    "미국",
    {
      security: "도시별로 치안 편차가 크니 야간 이동과 외진 지역을 피합니다.",
      scam: "길거리 판매와 가짜 티켓, 팁 강요에 주의합니다.",
      law: "주마다 법규가 다르고 공공장소 음주 제한이 있습니다.",
      transport:
        "차량 호출 앱 이용 시 차량 번호를 확인하고 대중교통 야간 운행은 확인합니다.",
      disaster: "허리케인·토네이도·산불 등 지역별 재난 경보를 확인합니다.",
      health: "의료비가 매우 높아 해외여행자보험이 사실상 필수입니다.",
      culture:
        "식당·택시 등 서비스에는 팁 관행이 있으니 기준을 미리 확인합니다.",
    },
    [{ label: "응급(경찰·소방·구급)", phone: "911" }],
  ),
  entry(
    "AU",
    "호주",
    {
      security:
        "치안이 대체로 안정적이지만 야간 번화가와 해변 소지품에 주의합니다.",
      scam: "온라인 숙소·티켓 사기에 주의하고 정식 예약처를 이용합니다.",
      law: "농산물·식품 반입 검역이 매우 엄격하고 위반 시 벌금이 부과됩니다.",
      transport:
        "좌측통행이므로 횡단 시 방향을 확인하고 장거리 운전은 휴식을 충분히 합니다.",
      disaster: "산불과 홍수 시기에는 지역 경보를 확인합니다.",
      health:
        "자외선이 매우 강하니 선크림과 모자를 쓰고 해변 안전 깃발을 지킵니다.",
      culture: "원주민 성지와 보호 구역 출입 규칙을 지킵니다.",
    },
    [{ label: "응급(경찰·소방·구급)", phone: "000" }],
  ),
  entry(
    "ID",
    "인도네시아",
    {
      security:
        "발리 등 관광지에서 날치기와 소매치기가 있으니 휴대폰 사용에 주의합니다.",
      scam: "환전소 환율 사기와 택시 요금 부풀리기에 주의합니다.",
      law: "마약 관련 처벌이 매우 엄격하며 혼전 동거 등 일부 규정이 있습니다.",
      transport:
        "오토바이 사고가 잦아 헬멧을 착용하고 국제운전면허 요건을 확인합니다.",
      disaster:
        "지진·화산 활동과 쓰나미 위험 지역이 있어 현지 경보를 확인합니다.",
      health: "수돗물은 마시지 않고 모기 매개 질환과 식중독에 대비합니다.",
      culture:
        "사원에서는 사롱 등 복장을 갖추고 예배 행렬을 방해하지 않습니다.",
    },
    [
      { label: "경찰", phone: "110" },
      { label: "구급", phone: "118" },
    ],
  ),
  entry(
    "PT",
    "포르투갈",
    {
      security:
        "리스본·포르투 관광지와 트램에서 소매치기가 있으니 소지품을 주의합니다.",
      scam: "거리 호객과 택시 요금 부풀리기에 주의합니다.",
      law: "일부 구역 음주와 노점 판매에 제한이 있습니다.",
      transport:
        "언덕과 돌길이 많아 트램과 도보 이동 시 미끄러움에 주의합니다.",
      disaster: "여름철 산불과 지진 가능성이 있어 현지 안내를 확인합니다.",
      health: "여름 폭염에 주의하고 의료비 대비 여행자보험을 권합니다.",
      culture:
        "식당에서 먼저 나온 에피타이저는 손대면 비용이 청구될 수 있습니다.",
    },
    [{ label: "응급(통합)", phone: "112" }],
  ),
];

export function getCountrySafety(
  countryCode: string,
): CountrySafety | undefined {
  return countrySafety.find((c) => c.countryCode === countryCode);
}

/** 렌더링 시점에 오늘 − verifiedAt이 7일을 넘기거나 verifiedAt이 없으면 stale. */
export function isSafetyStale(
  verifiedAt: string | null,
  today: Date = new Date(),
): boolean {
  if (!verifiedAt) return true;
  const diffDays =
    (today.getTime() - new Date(verifiedAt).getTime()) / 86_400_000;
  return diffDays > 7;
}
