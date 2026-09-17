# PAGE-SCR003 — SCR-003 여행 준비 도구 페이지 조립

| Field | Value |
|---|---|
| Category | PAGE_OWNER |
| Implementation Status | PLANNED_FULL |
| Priority | P0 |
| Screen | SCR-003 |
| Route | `/travel-tools` |
| Page Entry | `src/app/travel-tools/page.tsx` |
| Depends On | COMP-SCR003-TAB-SWITCHER, COMP-SCR003-FLIGHT-FORM, COMP-SCR003-HOTEL-FORM, COMP-SCR003-MATE-COMPOSER, COMP-SHARED-CTA-BANNER, GLOBAL-LAYOUT-NAV-FOOTER, AUTH-SETUP |
| Source | TASKS/00_TASK_LIST.md Seq 50 |

## Context

SCR-003 여행 준비 도구 페이지 조립. Category: PAGE_OWNER. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 50)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-064, REQ-FUNC-065, REQ-FUNC-070

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: SCR-003
- Route: `/travel-tools`
- Page Entry: `src/app/travel-tools/page.tsx`

## Design Ref

design-reference/D-001/DESIGN.md §19 (SCR-003 Section 순서/최소 콘텐츠 수 계약), §16(Section 최대 폭/여백), §17(Hero 규칙), §20(Empty State/Placeholder 금지 규칙), §7(Header/Footer); design-reference/UI_CONTRACT.md의 SCR-003 절(영역 순서/주요 Component/상태/이동)

## Depends On

COMP-SCR003-TAB-SWITCHER, COMP-SCR003-FLIGHT-FORM, COMP-SCR003-HOTEL-FORM, COMP-SCR003-MATE-COMPOSER, COMP-SHARED-CTA-BANNER, GLOBAL-LAYOUT-NAV-FOOTER, AUTH-SETUP

## Expected Files

`src/app/travel-tools/page.tsx`(신규)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

**Section 순서**: Intro(3단계 안내) → 탭(항공/숙소/동행 구하기) → 여행정보 Form → 입력 요약·외부 이동 → 찾기 Tip 3개 → 동행 작성 또는 로그인 안내·안전 안내. **탭 전환 시 COMP-SCR003-FLIGHT-FORM/HOTEL-FORM/MATE-COMPOSER를 실제로 교체 렌더**한다(placeholder 탭 금지), 탭별 독립 상태. **Section별 데이터 출처**: Form 필드는 DATA-DESTINATIONS의 국가/지역 목록 재사용; 요약·외부 이동은 각 폼의 클라이언트 상태; 동행 작성은 API-MATE-POSTS(POST)+AUTH-SETUP 세션 상태.

## Visual AC

최소 콘텐츠: Tip 카드 3장, 3단계 안내 3단계. Desktop/Mobile 여백 규칙 준수. **Lorem ipsum·"준비 중"·빈 카드 금지.** 동행 탭 비로그인 시 완성형 안내(로그인 필요 설명+로그인 CTA)로 대체, 빈 폼만 노출 금지.

## Security/Privacy AC

**항공·숙소 입력값(국가/지역/날짜)을 서버·DB·외부 URL 쿼리로 절대 전송하지 않는다**(REQ-FUNC-017/025, REQ-NF-017) — Client 상태로만 유지, 네트워크 탭/서버 로그/DB에서 원시값 0건이어야 함. 외부 이동은 새 탭+`noopener,noreferrer`, HTTPS 허용목록만(REQ-FUNC-016/018/024/026). 동행 작성은 연락처 탐지 통과+성인 확인+안전수칙 동의 없이는 제출 불가(REQ-FUNC-027/028/032/080).

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: **Section 순서**: Intro(3단계 안내) → 탭(항공/숙소/동행 구하기) → 여행정보 Form → 입력 요약·외부 이동 → 찾기 Tip 3개 → 동행 작성 또는 로그인 안내·안전 안내. **탭 전환 시 COMP-SCR003-FLIGHT-FORM/HOTEL-FORM/MATE-COMPOSER를 실제로 교체 렌더**한다(placeholder 탭 금지), 탭별 독립 상태. **Section별 데이터 출처**: Form 필드는 DATA-DESTINATIONS의 국가/지역 목록 재사용; 요약·외부 이동은 각 폼의 클라이언트 상태; 동행 작성은 API-MATE-POSTS(POST)+AUTH-SETUP 세션 상태.
- Visual AC 전체가 렌더링 결과에서 확인된다: 최소 콘텐츠: Tip 카드 3장, 3단계 안내 3단계. Desktop/Mobile 여백 규칙 준수. **Lorem ipsum·"준비 중"·빈 카드 금지.** 동행 탭 비로그인 시 완성형 안내(로그인 필요 설명+로그인 CTA)로 대체, 빈 폼만 노출 금지.
- Security/Privacy AC가 위반되지 않는다: **항공·숙소 입력값(국가/지역/날짜)을 서버·DB·외부 URL 쿼리로 절대 전송하지 않는다**(REQ-FUNC-017/025, REQ-NF-017) — Client 상태로만 유지, 네트워크 탭/서버 로그/DB에서 원시값 0건이어야 함. 외부 이동은 새 탭+`noopener,noreferrer`, HTTPS 허용목록만(REQ-FUNC-016/018/024/026). 동행 작성은 연락처 탐지 통과+성인 확인+안전수칙 동의 없이는 제출 불가(REQ-FUNC-027/028/032/080).
- Verify 절 방법으로 재현 가능하다: UNIT-TRAVEL-DATES, UNIT-CONTACT-DETECTION, E2E-TRAVEL-TOOLS

## Verify

UNIT-TRAVEL-DATES, UNIT-CONTACT-DETECTION, E2E-TRAVEL-TOOLS

## Definition of Done

- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음

## Forbidden

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/app/travel-tools/page.tsx`(신규)
- 본 Task는 **Route Page 조립만**을 범위로 한다 — 새로운 Component/Data/API/DB Task를 만들지 않는다. Depends On에 나열된 기존 산출물만 가져와 조립한다.
- 항공·숙소 입력값(국가/지역/날짜)을 서버·DB·외부 URL 쿼리·분석 이벤트로 전송하지 않는다.
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
