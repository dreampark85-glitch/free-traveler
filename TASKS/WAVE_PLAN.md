# WAVE_PLAN — Free Traveler

`scripts/build_waves.py`가 생성한 Wave 계획이다. `/run-wave`는 이 파일을 **읽기만** 한다. Wave ID는 W00~W10으로 미리 고정하지 않고, 이 생성 결과의 실제 ID가 이후 단계의 정본이다.

## W01 — Airbnb 스타일 공통 UI, 정적 데이터, Layout
- Tasks: COMP-SHARED-MATE-POST-CARD, COMP-SHARED-MATE-STATE-UTIL, DATA-DESTINATIONS, DATA-REPRESENTATIVE, DATA-SAFETY, GLOBAL-DESIGN-TOKENS, GLOBAL-SEO-METADATA

## W02 — Airbnb 스타일 공통 UI, 정적 데이터, Layout
- Tasks: COMP-SHARED-CTA-BANNER, COMP-SHARED-DESTINATION-CARD, COMP-SHARED-FAVORITES-SHARE, GLOBAL-A11Y-TOAST, GLOBAL-LAYOUT-NAV-FOOTER

## W03 — Airbnb 스타일 공통 UI, 정적 데이터, Layout
- Tasks: DB-SCHEMA-BASE, ROUTE-NOT-FOUND-ERROR, ROUTE-POLICY-PAGES

## W04 — Supabase Auth, 6개 Table, 기본 RLS
- Tasks: COMP-SCR001-DESTINATION-EXPLORER, COMP-SCR001-SAFETY-DRAWER, DB-RLS-BASE, DB-SEED-BASE

## W05 — Supabase Auth, 6개 Table, 기본 RLS
- Tasks: COMP-SCR001-DESTINATION-DRAWER, COMP-SCR001-SEARCH-BAR, DB-ACCESS

## W06 — Supabase Auth, 6개 Table, 기본 RLS
- Tasks: AUTH-SETUP

## W07 — SCR-002 대표 소개 Component와 Page Owner
- Tasks: COMP-SCR002-FAVORITE-PLACES, COMP-SCR002-FOOTPRINT-CHIPS, COMP-SCR002-GALLERY, COMP-SCR002-INTRO-PHILOSOPHY, COMP-SCR002-STAT-CARD, COMP-SCR002-TIMELINE

## W08 — SCR-002 대표 소개 Component와 Page Owner
- Tasks: PAGE-SCR002
- Preview Checkpoint: PAGE-SCR002  <!-- 이 Task가 DONE되면 사람 Preview 전까지 Wave를 멈춘다 -->

## W09 — SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner
- Tasks: API-MATE-POSTS, COMP-SCR003-FLIGHT-FORM, COMP-SCR003-HOTEL-FORM, COMP-SCR003-TAB-SWITCHER

## W10 — SCR-001 메인 Component와 Page Owner
- Tasks: COMP-SCR001-MATE-PREVIEW

## W11 — SCR-001 메인 Component와 Page Owner
- Tasks: PAGE-SCR001
- Preview Checkpoint: PAGE-SCR001  <!-- 이 Task가 DONE되면 사람 Preview 전까지 Wave를 멈춘다 -->

## W12 — SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner
- Tasks: API-MATE-APPLICATIONS, API-REPORTS-BLOCKS, COMP-SCR003-MATE-COMPOSER, COMP-SCR004-FILTER-BAR

## W13 — SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner
- Tasks: PAGE-SCR003
- Preview Checkpoint: PAGE-SCR003  <!-- 이 Task가 DONE되면 사람 Preview 전까지 Wave를 멈춘다 -->

## W14 — SCR-004 동행 목록·상세·신청 Component와 Page Owner
- Tasks: COMP-SCR004-BLOCK-ACTION, COMP-SCR004-MATE-DETAIL, COMP-SCR004-MATE-LIST, COMP-SCR004-PARTICIPATION-REQUEST, COMP-SCR004-REPORT-FORM

## W15 — SCR-004 동행 목록·상세·신청 Component와 Page Owner
- Tasks: PAGE-SCR004
- Preview Checkpoint: PAGE-SCR004  <!-- 이 Task가 DONE되면 사람 Preview 전까지 Wave를 멈춘다 -->

## W16 — SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner
- Tasks: API-ADMIN-OPERATIONS, COMP-SCR005-AUTH-FORMS, COMP-SCR005-MY-ACTIVITY, COMP-SCR005-PROFILE-FORM, COMP-SCR005-ROLE-TABS

## W17 — SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner
- Tasks: COMP-SCR005-ADMIN-PANEL

## W18 — SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner
- Tasks: PAGE-SCR005
- Preview Checkpoint: PAGE-SCR005  <!-- 이 Task가 DONE되면 사람 Preview 전까지 Wave를 멈춘다 -->

## W19 — Unit·Playwright·접근성·CI
- Tasks: CI-LINT-TYPECHECK-TEST, E2E-MATE-AUTH, E2E-PUBLIC-SMOKE, E2E-TRAVEL-TOOLS, TEST-RLS-BASIC, UNIT-CONTACT-DETECTION, UNIT-MATE-STATE

## W20 — Unit·Playwright·접근성·CI
- Tasks: UNIT-TRAVEL-DATES

## W21 — Vercel Preview와 Release 확인
- Tasks: DEPLOY-VERCEL-ENV, RELEASE-PERF-A11Y-CHECK
