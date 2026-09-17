# PAGE-SCR004 — SCR-004 동행 조회 페이지 조립

| Field | Value |
|---|---|
| Category | PAGE_OWNER |
| Implementation Status | PLANNED_FULL |
| Priority | P0 |
| Screen | SCR-004 |
| Route | `/mates` |
| Page Entry | `src/app/mates/page.tsx` |
| Depends On | COMP-SCR004-FILTER-BAR, COMP-SCR004-MATE-LIST, COMP-SCR004-MATE-DETAIL, COMP-SCR004-PARTICIPATION-REQUEST, COMP-SCR004-REPORT-FORM, COMP-SCR004-BLOCK-ACTION, COMP-SHARED-MATE-POST-CARD, COMP-SHARED-MATE-STATE-UTIL, COMP-SHARED-CTA-BANNER, GLOBAL-LAYOUT-NAV-FOOTER |
| Source | TASKS/00_TASK_LIST.md Seq 51 |

## Context

SCR-004 동행 조회 페이지 조립. Category: PAGE_OWNER. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 51)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-064, REQ-FUNC-065, REQ-FUNC-070

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: SCR-004
- Route: `/mates`
- Page Entry: `src/app/mates/page.tsx`

## Design Ref

design-reference/D-001/DESIGN.md §19 (SCR-004 Section 순서/최소 콘텐츠 수 계약), §16(Section 최대 폭/여백), §17(Hero 규칙), §20(Empty State/Placeholder 금지 규칙), §7(Header/Footer); design-reference/UI_CONTRACT.md의 SCR-004 절(영역 순서/주요 Component/상태/이동)

## Depends On

COMP-SCR004-FILTER-BAR, COMP-SCR004-MATE-LIST, COMP-SCR004-MATE-DETAIL, COMP-SCR004-PARTICIPATION-REQUEST, COMP-SCR004-REPORT-FORM, COMP-SCR004-BLOCK-ACTION, COMP-SHARED-MATE-POST-CARD, COMP-SHARED-MATE-STATE-UTIL, COMP-SHARED-CTA-BANNER, GLOBAL-LAYOUT-NAV-FOOTER

## Expected Files

`src/app/mates/page.tsx`(신규)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

**Section 순서**: Intro → Filter·결과 요약 → 동행 목록 → 상세 → 신청 방법 3단계 → 안전·신고·차단 안내와 CTA. COMP-SCR004-* 6개(FILTER-BAR/MATE-LIST/MATE-DETAIL/PARTICIPATION-REQUEST/REPORT-FORM/BLOCK-ACTION)를 전부 조립, Desktop 좌(목록)+우(상세) 분할/Mobile 목록→Drawer 전환. **Section별 데이터 출처**: Filter·목록·상세=API-MATE-POSTS; 참가=API-MATE-APPLICATIONS; 신고·차단=API-REPORTS-BLOCKS; 파생 상태=COMP-SHARED-MATE-STATE-UTIL.

## Visual AC

최소 콘텐츠: 목록 최대 8건 우선 노출, 3단계 안내 3단계. **Lorem ipsum·"준비 중"·빈 카드 금지.** 결과 0건 시 완성형 Empty State(안내 문장+"검색 조건 초기화"+"새 동행글 작성하기" CTA), Desktop/Mobile 여백 규칙 준수. 목록·상세 로딩 중 Skeleton 표시(COMP-SCR004-MATE-LIST/MATE-DETAIL), API 조회 실패 시 빈 화면 대신 재시도 버튼이 있는 인라인 오류 상태 표시.

## Security/Privacy AC

상세 API 응답에 이메일·전화번호 등 연락처 필드 미포함(REQ-FUNC-033); 참가 요청·신고·차단은 비로그인/미성년 시 실제 폼 대신 로그인 유도로 대체(서버 RLS로도 차단, REQ-FUNC-044); 차단된 사용자 간 글/프로필/요청 미노출

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: **Section 순서**: Intro → Filter·결과 요약 → 동행 목록 → 상세 → 신청 방법 3단계 → 안전·신고·차단 안내와 CTA. COMP-SCR004-* 6개(FILTER-BAR/MATE-LIST/MATE-DETAIL/PARTICIPATION-REQUEST/REPORT-FORM/BLOCK-ACTION)를 전부 조립, Desktop 좌(목록)+우(상세) 분할/Mobile 목록→Drawer 전환. **Section별 데이터 출처**: Filter·목록·상세=API-MATE-POSTS; 참가=API-MATE-APPLICATIONS; 신고·차단=API-REPORTS-BLOCKS; 파생 상태=COMP-SHARED-MATE-STATE-UTIL.
- Visual AC 전체가 렌더링 결과에서 확인된다: 최소 콘텐츠: 목록 최대 8건 우선 노출, 3단계 안내 3단계. **Lorem ipsum·"준비 중"·빈 카드 금지.** 결과 0건 시 완성형 Empty State(안내 문장+"검색 조건 초기화"+"새 동행글 작성하기" CTA), Desktop/Mobile 여백 규칙 준수. 목록·상세 로딩 중 Skeleton 표시(COMP-SCR004-MATE-LIST/MATE-DETAIL), API 조회 실패 시 빈 화면 대신 재시도 버튼이 있는 인라인 오류 상태 표시.
- Security/Privacy AC가 위반되지 않는다: 상세 API 응답에 이메일·전화번호 등 연락처 필드 미포함(REQ-FUNC-033); 참가 요청·신고·차단은 비로그인/미성년 시 실제 폼 대신 로그인 유도로 대체(서버 RLS로도 차단, REQ-FUNC-044); 차단된 사용자 간 글/프로필/요청 미노출
- Verify 절 방법으로 재현 가능하다: TEST-RLS-BASIC, E2E-MATE-AUTH

## Verify

TEST-RLS-BASIC, E2E-MATE-AUTH

## Definition of Done

- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음

## Forbidden

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/app/mates/page.tsx`(신규)
- 본 Task는 **Route Page 조립만**을 범위로 한다 — 새로운 Component/Data/API/DB Task를 만들지 않는다. Depends On에 나열된 기존 산출물만 가져와 조립한다.
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
