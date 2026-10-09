import { describe, expect, it } from "vitest";
import { detectContact } from "@/components/scr003/MateComposer";

/** 연락처가 들어간 글. 모두 탐지되어야 한다. */
const CONTACT_POSTS: string[] = [
  // 전화번호
  "제 번호는 010-1234-5678 입니다",
  "연락은 01012345678로 주세요",
  "010 1234 5678 로 문자 주세요",
  "010.1234.5678 연락 부탁",
  "문의 02-123-4567",
  "031-123-4567 로 전화 주세요",
  "+82 10 1234 5678 로 연락",
  "+82-10-1234-5678",
  "공일공 1234 5678",
  "연락처 011-123-4567",
  "연락처 010-123-4567",
  // 이메일
  "test@example.com 으로 메일 주세요",
  "메일은 kim.travel@gmail.com",
  "hong at gmail dot com",
  "메일은 kim(at)naver.com",
  "my_id@naver.com 연락 주세요",
  "abc골뱅이naver닷com",
  // 메신저·SNS
  "카톡 아이디 abc123",
  "카카오톡: hello_trip",
  "카톡 id: trip2026",
  "인스타 @travel_kim",
  "인스타그램 travel.kim 팔로우",
  "open.kakao.com/o/abcd1234 로 들어오세요",
  "텔레그램 trip_lee99",
  "t.me/trip_lee",
  "라인 아이디 : trip_line",
  "왓츠앱 +82 10 2222 3333",
  "디엠 @trip_dm 주세요",
  "line.me/ti/p/abc123",
  "instagram.com/trip_kim 에서 연락",
  "위챗 wxid_trip01",
];

/** 연락처가 없는 평범한 동행글. 탐지되면 오탐이다. */
const PLAIN_POSTS: string[] = [
  "도쿄 4박 5일 같이 걸어요",
  "2026년 12월 1일부터 5일까지 일정입니다",
  "비용은 각자 부담, 1인 약 150만원 예상",
  "오사카에서 타코야키 먹어요",
  "숙소는 2인실 예정이고 총 3명 모집",
  "저는 30대 직장인이고 사진을 좋아해요",
  "맛집 위주로 천천히 다닙니다",
  "11월 3일 출발 11월 7일 귀국",
  "공항에서 만나서 같이 이동해요",
  "1일차는 시내 관광, 2일차는 근교",
  "예산은 하루 10만원 내외",
  "at the airport 만나요",
  "방콕 3박 4일 야시장과 사원 위주",
  "아침 8시에 숙소 앞에서 만나요",
  "항공권은 각자 예약하고 현지에서 합류해요",
  "여행 스타일은 느긋하게, 하루 두 곳 정도",
  "저는 조용한 편이라 함께 걷기 좋아요",
  "교통카드는 현지에서 같이 사요",
  "프랑스 파리 5일, 미술관 위주 일정입니다",
  "1월 15일부터 20일까지 5박 6일",
  "인원은 3명이고 남녀 무관합니다",
  "식비는 하루 3만원 정도 예상해요",
  "일본어를 조금 할 수 있어요",
  "카페 투어와 빵집 탐방을 좋아합니다",
  "새벽 비행기라 전날 공항 근처에서 묵어요",
  "현지 유심은 각자 준비해 주세요",
  "숙소 위치는 역에서 도보 5분 거리",
  "6박 7일 일정이고 중간에 하루는 자유 시간",
  "사진 찍는 걸 좋아하는 분이면 좋겠어요",
  "호텔은 1박에 12만원 정도로 생각 중",
];

describe("연락처 패턴 탐지 (REQ-FUNC-032)", () => {
  it("연락처가 있는 글을 95% 이상 탐지한다", () => {
    const missed = CONTACT_POSTS.filter((t) => detectContact(t).length === 0);
    const rate = (CONTACT_POSTS.length - missed.length) / CONTACT_POSTS.length;
    expect(rate, `미탐지: ${missed.join(" | ")}`).toBeGreaterThanOrEqual(0.95);
  });

  it("평범한 글의 오탐은 5% 이하다", () => {
    const falsePositives = PLAIN_POSTS.filter(
      (t) => detectContact(t).length > 0,
    );
    const rate = falsePositives.length / PLAIN_POSTS.length;
    expect(rate, `오탐: ${falsePositives.join(" | ")}`).toBeLessThanOrEqual(
      0.05,
    );
  });

  it("종류를 구분해 돌려준다", () => {
    expect(detectContact("010-1234-5678")).toContain("phone");
    expect(detectContact("test@example.com")).toContain("email");
    expect(detectContact("카톡 아이디 abc123")).toContain("messenger");
    expect(detectContact("도쿄 같이 가요")).toEqual([]);
  });
});
