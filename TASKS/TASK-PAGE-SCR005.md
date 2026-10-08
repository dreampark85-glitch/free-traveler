# PAGE-SCR005 — SCR-005 계정·관리 페이지 조립

| Field | Value |
|---|---|
| Category | PAGE_OWNER |
| Implementation Status | PLANNED_FULL |
| Priority | P0 |
| Screen | SCR-005 |
| Route | `/account` |
| Page Entry | `src/app/account/page.tsx` |
| Depends On | COMP-SCR005-ROLE-TABS, COMP-SCR005-AUTH-FORMS, COMP-SCR005-PROFILE-FORM, COMP-SCR005-MY-ACTIVITY, COMP-SCR005-ADMIN-PANEL, GLOBAL-LAYOUT-NAV-FOOTER, AUTH-SETUP |
| Source | TASKS/00_TASK_LIST.md Seq 52 |

## Context

SCR-005 계정·관리 페이지 조립. Category: PAGE_OWNER. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 52)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-064, REQ-FUNC-065, REQ-FUNC-070

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: SCR-005
- Route: `/account`
- Page Entry: `src/app/account/page.tsx`

## Design Ref

design-reference/D-001/DESIGN.md §19 (SCR-005 Section 순서/최소 콘텐츠 수 계약), §16(Section 최대 폭/여백), §17(Hero 규칙), §20(Empty State/Placeholder 금지 규칙), §7(Header/Footer); design-reference/UI_CONTRACT.md의 SCR-005 절(영역 순서/주요 Component/상태/이동)

## Depends On

COMP-SCR005-ROLE-TABS, COMP-SCR005-AUTH-FORMS, COMP-SCR005-PROFILE-FORM, COMP-SCR005-MY-ACTIVITY, COMP-SCR005-ADMIN-PANEL, GLOBAL-LAYOUT-NAV-FOOTER, AUTH-SETUP

## Expected Files

`src/app/account/page.tsx`(신규)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

현재 역할(Guest/Member/Admin)의 **Intro → 핵심 작업 → 도움말 또는 다음 행동**만 표시. 역할별 구성: Guest=로그인/가입(COMP-SCR005-AUTH-FORMS); Adult Member=프로필(COMP-SCR005-PROFILE-FORM)+내 활동(COMP-SCR005-MY-ACTIVITY); Moderator/Admin=프로필+내 활동+관리자(COMP-SCR005-ADMIN-PANEL). COMP-SCR005-ROLE-TABS로 역할별 탭을 **실제로 조립**하며, **역할에 없는 관리 영역은 렌더링하지 않는다**(서버/클라이언트 모두, CSS 숨김으로 대체 금지). **Section별 데이터 출처**: Guest 로그인/가입=AUTH-SETUP 세션; 프로필=`user_profile`(DB-ACCESS); 내 글·받은/보낸 요청=`mate_post`·`mate_application`(API-MATE-POSTS/API-MATE-APPLICATIONS); 차단 목록=`user_block`; 신고 처리 현황=`report`(API-ADMIN-OPERATIONS); 외부 URL 설정=`outbound_link_setting`(API-ADMIN-OPERATIONS).

## Visual AC

관리자 탭은 정확히 2개 Section(신고 처리 현황/외부 URL 설정(항공·숙소 HTTPS URL 2개)), 통계 그래프·KPI 카드·감사 로그 타임라인 절대 금지. **Lorem ipsum·"준비 중"·빈 카드 금지.** 내 글/받은요청/보낸요청/차단목록/신고목록 0건 시 각각 완성형 Empty State("아직 ○○이 없어요"+이용 방법+CTA), Desktop/Mobile 여백 규칙 준수. 내 활동·관리자 탭 데이터 로딩 중 Skeleton 표시(COMP-SCR005-MY-ACTIVITY/ADMIN-PANEL), API 조회 실패 시 빈 화면 대신 재시도 버튼이 있는 인라인 오류 상태 표시.

## Security/Privacy AC

역할에 없는 탭은 서버 컴포넌트+RLS 양쪽에서 접근 불가(REQ-FUNC-044, REQ-NF-013); 성인 확인은 생년월일 대신 `is_adult`+`adult_verified_at`만 저장(REQ-FUNC-028); 관리자 외부 URL 설정은 HTTPS 허용목록만 저장 가능(REQ-FUNC-077)

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: 현재 역할(Guest/Member/Admin)의 **Intro → 핵심 작업 → 도움말 또는 다음 행동**만 표시. 역할별 구성: Guest=로그인/가입(COMP-SCR005-AUTH-FORMS); Adult Member=프로필(COMP-SCR005-PROFILE-FORM)+내 활동(COMP-SCR005-MY-ACTIVITY); Moderator/Admin=프로필+내 활동+관리자(COMP-SCR005-ADMIN-PANEL). COMP-SCR005-ROLE-TABS로 역할별 탭을 **실제로 조립**하며, **역할에 없는 관리 영역은 렌더링하지 않는다**(서버/클라이언트 모두, CSS 숨김으로 대체 금지). **Section별 데이터 출처**: Guest 로그인/가입=AUTH-SETUP 세션; 프로필=`user_profile`(DB-ACCESS); 내 글·받은/보낸 요청=`mate_post`·`mate_application`(API-MATE-POSTS/API-MATE-APPLICATIONS); 차단 목록=`user_block`; 신고 처리 현황=`report`(API-ADMIN-OPERATIONS); 외부 URL 설정=`outbound_link_setting`(API-ADMIN-OPERATIONS).
- Visual AC 전체가 렌더링 결과에서 확인된다: 관리자 탭은 정확히 2개 Section(신고 처리 현황/외부 URL 설정(항공·숙소 HTTPS URL 2개)), 통계 그래프·KPI 카드·감사 로그 타임라인 절대 금지. **Lorem ipsum·"준비 중"·빈 카드 금지.** 내 글/받은요청/보낸요청/차단목록/신고목록 0건 시 각각 완성형 Empty State("아직 ○○이 없어요"+이용 방법+CTA), Desktop/Mobile 여백 규칙 준수. 내 활동·관리자 탭 데이터 로딩 중 Skeleton 표시(COMP-SCR005-MY-ACTIVITY/ADMIN-PANEL), API 조회 실패 시 빈 화면 대신 재시도 버튼이 있는 인라인 오류 상태 표시.
- Security/Privacy AC가 위반되지 않는다: 역할에 없는 탭은 서버 컴포넌트+RLS 양쪽에서 접근 불가(REQ-FUNC-044, REQ-NF-013); 성인 확인은 생년월일 대신 `is_adult`+`adult_verified_at`만 저장(REQ-FUNC-028); 관리자 외부 URL 설정은 HTTPS 허용목록만 저장 가능(REQ-FUNC-077)
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

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/app/account/page.tsx`(신규)
- 본 Task는 **Route Page 조립만**을 범위로 한다 — 새로운 Component/Data/API/DB Task를 만들지 않는다. Depends On에 나열된 기존 산출물만 가져와 조립한다.
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
