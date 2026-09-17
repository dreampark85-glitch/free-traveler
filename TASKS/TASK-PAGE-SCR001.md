# PAGE-SCR001 — SCR-001 홈 페이지 조립

| Field | Value |
|---|---|
| Category | PAGE_OWNER |
| Implementation Status | PLANNED_FULL |
| Priority | P0 |
| Screen | SCR-001 |
| Route | `/` |
| Page Entry | `src/app/page.tsx` |
| Depends On | COMP-SCR001-SEARCH-BAR, COMP-SCR001-DESTINATION-EXPLORER, COMP-SHARED-DESTINATION-CARD, COMP-SCR001-DESTINATION-DRAWER, COMP-SCR001-SAFETY-DRAWER, COMP-SCR001-MATE-PREVIEW, COMP-SHARED-MATE-POST-CARD, COMP-SHARED-CTA-BANNER, COMP-SHARED-FAVORITES-SHARE, DATA-DESTINATIONS, DATA-SAFETY, GLOBAL-LAYOUT-NAV-FOOTER, GLOBAL-DESIGN-TOKENS |
| Source | TASKS/00_TASK_LIST.md Seq 48 |

## Context

SCR-001 홈 페이지 조립. Category: PAGE_OWNER. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 48)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-001, REQ-FUNC-064, REQ-FUNC-065, REQ-FUNC-070

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: SCR-001
- Route: `/`
- Page Entry: `src/app/page.tsx`

## Design Ref

design-reference/D-001/DESIGN.md §19 (SCR-001 Section 순서/최소 콘텐츠 수 계약), §16(Section 최대 폭/여백), §17(Hero 규칙), §20(Empty State/Placeholder 금지 규칙), §7(Header/Footer); design-reference/UI_CONTRACT.md의 SCR-001 절(영역 순서/주요 Component/상태/이동)

## Depends On

COMP-SCR001-SEARCH-BAR, COMP-SCR001-DESTINATION-EXPLORER, COMP-SHARED-DESTINATION-CARD, COMP-SCR001-DESTINATION-DRAWER, COMP-SCR001-SAFETY-DRAWER, COMP-SCR001-MATE-PREVIEW, COMP-SHARED-MATE-POST-CARD, COMP-SHARED-CTA-BANNER, COMP-SHARED-FAVORITES-SHARE, DATA-DESTINATIONS, DATA-SAFETY, GLOBAL-LAYOUT-NAV-FOOTER, GLOBAL-DESIGN-TOKENS

## Expected Files

`src/app/page.tsx`(전면 교체)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

**Section 순서**: Hero → 국내 여행지 6개 → 해외 여행지 6개 → 여행 동기 6개 → 국가별 주의사항 6개 → 최근 동행글 3개(또는 완성형 Empty State) → free_traveler 소개. **Section별 데이터 출처**: Hero=검색 입력(클라이언트 상태, COMP-SCR001-SEARCH-BAR); 국내/해외=DATA-DESTINATIONS(scope 필터, COMP-SCR001-DESTINATION-EXPLORER); 여행 동기=DATA-DESTINATIONS themes 파생 Chip; 주의사항=DATA-SAFETY 6개 요약 카드; 최근 동행글=API-MATE-POSTS 최신 3건(COMP-SCR001-MATE-PREVIEW); 소개=DATA-REPRESENTATIVE 통계 배지. 위 Component/Data Task 전체를 실제로 조립해 최종 렌더. **`src/app/page.tsx`의 create-next-app 스타터(Next.js 로고, "To get started, edit the page.tsx file" 문구, Deploy Now/Documentation 링크)를 전량 제거**하고 실제 콘텐츠로 교체한다.

## Visual AC

최소 콘텐츠 수: 국내 카드 6장/해외 카드 6장/동기 Chip 6개/주의사항 카드 6장/동행 미리보기 3건(또는 Empty State). Desktop 1440px 콘텐츠 폭 1200~1280px 중앙정렬, Card Grid 3~4열/Mobile 390px 1열, Section 상하 여백 Desktop 64~96px·Mobile 40~64px(D-001 §16); Hero 높이 뷰포트 55~65%, 다음 Section 제목이 fold에 걸쳐 보여야 함(D-001 §17). **Lorem ipsum·"준비 중"·"정보 확인 필요"·내용 없는 빈 카드 절대 금지.** 동행 미리보기 0건 시 완성형 Empty State(안내 문장+이용 방법+"동행글 작성하기" CTA) 필수, 큰 빈 영역 금지.

## Security/Privacy AC

즐겨찾기는 localStorage에만 저장(REQ-FUNC-068), 안전정보 Drawer MOFA 링크는 새 탭+`noopener,noreferrer`(REQ-FUNC-049)

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: **Section 순서**: Hero → 국내 여행지 6개 → 해외 여행지 6개 → 여행 동기 6개 → 국가별 주의사항 6개 → 최근 동행글 3개(또는 완성형 Empty State) → free_traveler 소개. **Section별 데이터 출처**: Hero=검색 입력(클라이언트 상태, COMP-SCR001-SEARCH-BAR); 국내/해외=DATA-DESTINATIONS(scope 필터, COMP-SCR001-DESTINATION-EXPLORER); 여행 동기=DATA-DESTINATIONS themes 파생 Chip; 주의사항=DATA-SAFETY 6개 요약 카드; 최근 동행글=API-MATE-POSTS 최신 3건(COMP-SCR001-MATE-PREVIEW); 소개=DATA-REPRESENTATIVE 통계 배지. 위 Component/Data Task 전체를 실제로 조립해 최종 렌더. **`src/app/page.tsx`의 create-next-app 스타터(Next.js 로고, "To get started, edit the page.tsx file" 문구, Deploy Now/Documentation 링크)를 전량 제거**하고 실제 콘텐츠로 교체한다.
- Visual AC 전체가 렌더링 결과에서 확인된다: 최소 콘텐츠 수: 국내 카드 6장/해외 카드 6장/동기 Chip 6개/주의사항 카드 6장/동행 미리보기 3건(또는 Empty State). Desktop 1440px 콘텐츠 폭 1200~1280px 중앙정렬, Card Grid 3~4열/Mobile 390px 1열, Section 상하 여백 Desktop 64~96px·Mobile 40~64px(D-001 §16); Hero 높이 뷰포트 55~65%, 다음 Section 제목이 fold에 걸쳐 보여야 함(D-001 §17). **Lorem ipsum·"준비 중"·"정보 확인 필요"·내용 없는 빈 카드 절대 금지.** 동행 미리보기 0건 시 완성형 Empty State(안내 문장+이용 방법+"동행글 작성하기" CTA) 필수, 큰 빈 영역 금지.
- Security/Privacy AC가 위반되지 않는다: 즐겨찾기는 localStorage에만 저장(REQ-FUNC-068), 안전정보 Drawer MOFA 링크는 새 탭+`noopener,noreferrer`(REQ-FUNC-049)
- Verify 절 방법으로 재현 가능하다: E2E-PUBLIC-SMOKE + RELEASE-PERF-A11Y-CHECK

## Verify

E2E-PUBLIC-SMOKE + RELEASE-PERF-A11Y-CHECK

## Definition of Done

- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음

## Forbidden

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/app/page.tsx`(전면 교체)
- 본 Task는 **Route Page 조립만**을 범위로 한다 — 새로운 Component/Data/API/DB Task를 만들지 않는다. Depends On에 나열된 기존 산출물만 가져와 조립한다.
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
