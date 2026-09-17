# UI/UX Traceability Matrix — Free Traveler

- **Document ID:** UIUX-TRACE-TRAVEL-001
- **기반 문서:** `docs/02_SRS_BASELINE.md`, `docs/PROJECT_SCOPE.md`, `docs/03_UI_COVERAGE_ANALYSIS.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`, `docs/05_UIUX_APPROVED.md`
- **대상:** `REQ-FUNC-001`~`REQ-FUNC-080`(80개), `REQ-NF-001`~`REQ-NF-034`(34개) — **총 114개, 전수 기록. 삭제 없음.**
- **구현 진행 상태(중요)**: `src/app`은 현재 `create-next-app` 스타터 템플릿 상태이며 승인된 5개 Screen 중 어떤 것도 아직 코드로 구현되지 않았다. 이 문서의 **Task** 열은 Task 생성 전이므로 전 항목 `PENDING_TASK_GENERATION`으로 기록하며, **Status** 열은 실제 구현 여부를 반영해 EXCLUDED가 아닌 모든 항목을 `NOT_STARTED`로 기록한다(거짓 구현 기록 금지).

## 열 정의

| 열 | 정의 |
|---|---|
| Requirement | `02_SRS_BASELINE.md` §4의 요구사항 ID |
| Implementation Status | `PROJECT_SCOPE.md` 분류를 반영한 계획 상태 — `PLANNED_FULL`(IMPLEMENT) / `PLANNED_REDUCED`(IMPLEMENT(축소)) / `PLANNED_TARGET_METRIC`(IMPLEMENT(목표치), CI 게이트 없이 목표치만 지향) / `EXCLUDED` |
| Screen | 배치된 디자인 Screen ID(SCR-001~005), 여러 Screen 공통이면 `GLOBAL`, 화면과 무관한 비-UI 항목이면 `N/A`, 기술 Route에 해당하면 `TECHNICAL_ROUTE` |
| Route | 해당 Screen/기술 Route의 URL 경로 |
| Page Entry | `design-reference/SCREEN_ROUTE_CONTRACT.json` 기준 Next.js App Router 진입 파일. 페이지가 아닌 항목은 실제 파일 경로를 확정하지 않고 항목 성격만 기술 |
| Task | 구현 Task ID — Task 생성 전이므로 전 항목 `PENDING_TASK_GENERATION` |
| Test | `02_SRS_BASELINE.md` §5 Traceability Matrix가 지정한 계획된 테스트 케이스 ID(`TC-FUNC-xxx`/`TC-NF-xxx`). 아직 작성·실행되지 않았으므로 상태 접미사 `(PENDING)`을 병기. EXCLUDED 항목은 `N/A(EXCLUDED)` |
| Status | 이 요구사항의 현재 진행 상태 — `NOT_STARTED` 또는 `EXCLUDED` (구현 완료를 의미하는 값은 어떤 항목에도 기록하지 않는다) |

---

## F1. Destination Guide → SCR-001 (REQ-FUNC-001~010)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-001 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-001 (PENDING) | NOT_STARTED |
| REQ-FUNC-002 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-002 (PENDING) | NOT_STARTED |
| REQ-FUNC-003 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-003 (PENDING) | NOT_STARTED |
| REQ-FUNC-004 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(상세 Drawer/Modal 컴포넌트) | PENDING_TASK_GENERATION | TC-FUNC-004 (PENDING) | NOT_STARTED |
| REQ-FUNC-005 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-005 (PENDING) | NOT_STARTED |
| REQ-FUNC-006 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(상세 Drawer → 안전정보 Drawer 연결) | PENDING_TASK_GENERATION | TC-FUNC-006 (PENDING) | NOT_STARTED |
| REQ-FUNC-007 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-007 (PENDING) | NOT_STARTED |
| REQ-FUNC-008 | PLANNED_FULL | N/A | N/A | N/A(빌드 시 데이터 수량 검증 스크립트 — Page 아님) | PENDING_TASK_GENERATION | TC-FUNC-008 (PENDING) | NOT_STARTED |
| REQ-FUNC-009 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(상세 Drawer 내 관련 여행지) | PENDING_TASK_GENERATION | TC-FUNC-009 (PENDING) | NOT_STARTED |
| REQ-FUNC-010 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(URL 쿼리 상태 동기화) | PENDING_TASK_GENERATION | TC-FUNC-010 (PENDING) | NOT_STARTED |

## F2. Flight Link-out → SCR-003 항공 탭 (REQ-FUNC-011~018)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-011 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(항공 탭) | PENDING_TASK_GENERATION | TC-FUNC-011 (PENDING) | NOT_STARTED |
| REQ-FUNC-012 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(항공 탭) | PENDING_TASK_GENERATION | TC-FUNC-012 (PENDING) | NOT_STARTED |
| REQ-FUNC-013 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(항공 탭) | PENDING_TASK_GENERATION | TC-FUNC-013 (PENDING) | NOT_STARTED |
| REQ-FUNC-014 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(항공 탭 요약 단계) | PENDING_TASK_GENERATION | TC-FUNC-014 (PENDING) | NOT_STARTED |
| REQ-FUNC-015 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(비전달 고지) | PENDING_TASK_GENERATION | TC-FUNC-015 (PENDING) | NOT_STARTED |
| REQ-FUNC-016 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(외부 이동 버튼) | PENDING_TASK_GENERATION | TC-FUNC-016 (PENDING) | NOT_STARTED |
| REQ-FUNC-017 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(Client 상태, 서버 미전송) | PENDING_TASK_GENERATION | TC-FUNC-017 (PENDING) | NOT_STARTED |
| REQ-FUNC-018 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(오류·재시도) | PENDING_TASK_GENERATION | TC-FUNC-018 (PENDING) | NOT_STARTED |

## F3. Hotel Link-out → SCR-003 숙소 탭 (REQ-FUNC-019~026)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-019 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(숙소 탭) | PENDING_TASK_GENERATION | TC-FUNC-019 (PENDING) | NOT_STARTED |
| REQ-FUNC-020 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(숙소 탭) | PENDING_TASK_GENERATION | TC-FUNC-020 (PENDING) | NOT_STARTED |
| REQ-FUNC-021 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(숙소 탭) | PENDING_TASK_GENERATION | TC-FUNC-021 (PENDING) | NOT_STARTED |
| REQ-FUNC-022 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(숙소 탭 요약) | PENDING_TASK_GENERATION | TC-FUNC-022 (PENDING) | NOT_STARTED |
| REQ-FUNC-023 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(비전달 고지) | PENDING_TASK_GENERATION | TC-FUNC-023 (PENDING) | NOT_STARTED |
| REQ-FUNC-024 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(외부 이동 버튼) | PENDING_TASK_GENERATION | TC-FUNC-024 (PENDING) | NOT_STARTED |
| REQ-FUNC-025 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(Client 상태, 서버 미전송) | PENDING_TASK_GENERATION | TC-FUNC-025 (PENDING) | NOT_STARTED |
| REQ-FUNC-026 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(오류·재시도) | PENDING_TASK_GENERATION | TC-FUNC-026 (PENDING) | NOT_STARTED |

## F4. Travel Mate → SCR-003(작성) / SCR-004(조회·상세) / SCR-005(내 활동·관리자) (REQ-FUNC-027~045)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-027 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(동행 탭 인증 게이트) | PENDING_TASK_GENERATION | TC-FUNC-027 (PENDING) | NOT_STARTED |
| REQ-FUNC-028 | PLANNED_FULL | SCR-005 | `/account` | `src/app/account/page.tsx`(성인 확인 상태) | PENDING_TASK_GENERATION | TC-FUNC-028 (PENDING) | NOT_STARTED |
| REQ-FUNC-029 | PLANNED_FULL | SCR-005 | `/account` | `src/app/account/page.tsx`(프로필 탭) | PENDING_TASK_GENERATION | TC-FUNC-029 (PENDING) | NOT_STARTED |
| REQ-FUNC-030 | PLANNED_FULL | SCR-004 | `/mates` | `src/app/mates/page.tsx`(Filter Bar) | PENDING_TASK_GENERATION | TC-FUNC-030 (PENDING) | NOT_STARTED |
| REQ-FUNC-031 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(동행 작성 폼) | PENDING_TASK_GENERATION | TC-FUNC-031 (PENDING) | NOT_STARTED |
| REQ-FUNC-032 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(연락처 탐지 오류) | PENDING_TASK_GENERATION | TC-FUNC-032 (PENDING) | NOT_STARTED |
| REQ-FUNC-033 | PLANNED_FULL | SCR-004 | `/mates` | `src/app/mates/page.tsx`(상세 패널, 응답 필드 제외) | PENDING_TASK_GENERATION | TC-FUNC-033 (PENDING) | NOT_STARTED |
| REQ-FUNC-034 | PLANNED_FULL | SCR-004 | `/mates` | `src/app/mates/page.tsx`(참가 요청 폼) | PENDING_TASK_GENERATION | TC-FUNC-034 (PENDING) | NOT_STARTED |
| REQ-FUNC-035 | PLANNED_FULL | SCR-004 | `/mates` | `src/app/mates/page.tsx`(중복 요청 제약) | PENDING_TASK_GENERATION | TC-FUNC-035 (PENDING) | NOT_STARTED |
| REQ-FUNC-036 | PLANNED_FULL | SCR-005 | `/account` | `src/app/account/page.tsx`(내 활동 탭, 요청 승인·거절) | PENDING_TASK_GENERATION | TC-FUNC-036 (PENDING) | NOT_STARTED |
| REQ-FUNC-037 | PLANNED_FULL | SCR-004 | `/mates` | `src/app/mates/page.tsx`(자동 마감 파생 상태) | PENDING_TASK_GENERATION | TC-FUNC-037 (PENDING) | NOT_STARTED |
| REQ-FUNC-038 | PLANNED_FULL | SCR-005 | `/account` | `src/app/account/page.tsx`(내 활동 탭, 내 글 수정·마감·삭제) | PENDING_TASK_GENERATION | TC-FUNC-038 (PENDING) | NOT_STARTED |
| REQ-FUNC-039 | PLANNED_REDUCED | SCR-004 | `/mates` | `src/app/mates/page.tsx`(신고 폼) | PENDING_TASK_GENERATION | TC-FUNC-039 (PENDING) | NOT_STARTED |
| REQ-FUNC-040 | PLANNED_REDUCED | SCR-004 | `/mates` | `src/app/mates/page.tsx`(차단 버튼) | PENDING_TASK_GENERATION | TC-FUNC-040 (PENDING) | NOT_STARTED |
| REQ-FUNC-041 | PLANNED_REDUCED | SCR-005 | `/account` | `src/app/account/page.tsx`(관리자 탭, 신고 상태 목록) | PENDING_TASK_GENERATION | TC-FUNC-041 (PENDING) | NOT_STARTED |
| REQ-FUNC-042 | EXCLUDED | N/A | N/A | N/A(제재 시스템 미구현) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-043 | PLANNED_REDUCED | GLOBAL | `/mates`, `/account` | `src/app/mates/page.tsx`, `src/app/account/page.tsx`(전역 Toast 컴포넌트) | PENDING_TASK_GENERATION | TC-FUNC-043 (PENDING) | NOT_STARTED |
| REQ-FUNC-044 | PLANNED_FULL | GLOBAL | `/mates`, `/account` | N/A(Supabase RLS 정책 — Page 아님) | PENDING_TASK_GENERATION | TC-FUNC-044 (PENDING) | NOT_STARTED |
| REQ-FUNC-045 | EXCLUDED | N/A | N/A | N/A(탈퇴 배치·30일 삭제 정책 미구현) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |

## F5. Country Safety → SCR-001 Drawer/Modal (REQ-FUNC-046~056)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-046 | PLANNED_FULL | N/A | N/A | N/A(빌드 시 국가 커버리지 검증 스크립트) | PENDING_TASK_GENERATION | TC-FUNC-046 (PENDING) | NOT_STARTED |
| REQ-FUNC-047 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(안전정보 Drawer/Modal) | PENDING_TASK_GENERATION | TC-FUNC-047 (PENDING) | NOT_STARTED |
| REQ-FUNC-048 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(안전정보 Drawer/Modal) | PENDING_TASK_GENERATION | TC-FUNC-048 (PENDING) | NOT_STARTED |
| REQ-FUNC-049 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(안전정보 Drawer/Modal, MOFA 링크) | PENDING_TASK_GENERATION | TC-FUNC-049 (PENDING) | NOT_STARTED |
| REQ-FUNC-050 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(안전정보 Drawer/Modal, stale 배지) | PENDING_TASK_GENERATION | TC-FUNC-050 (PENDING) | NOT_STARTED |
| REQ-FUNC-051 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(안전정보 Drawer/Modal, 중대 경보 상단) | PENDING_TASK_GENERATION | TC-FUNC-051 (PENDING) | NOT_STARTED |
| REQ-FUNC-052 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(안전정보 Drawer/Modal, 범위 표시) | PENDING_TASK_GENERATION | TC-FUNC-052 (PENDING) | NOT_STARTED |
| REQ-FUNC-053 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(안전정보 Drawer/Modal, 긴급연락처) | PENDING_TASK_GENERATION | TC-FUNC-053 (PENDING) | NOT_STARTED |
| REQ-FUNC-054 | PLANNED_FULL | SCR-001, SCR-003 | `/`, `/travel-tools` | `src/app/page.tsx`, `src/app/travel-tools/page.tsx`(공통 고지 컴포넌트) | PENDING_TASK_GENERATION | TC-FUNC-054 (PENDING) | NOT_STARTED |
| REQ-FUNC-055 | EXCLUDED | N/A | N/A | N/A(콘텐츠 저작 워크플로 미제공) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-056 | EXCLUDED | N/A | N/A | N/A(변경 이력 UI 미제공) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |

## F6. About free_traveler → SCR-002 (REQ-FUNC-057~063)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-057 | PLANNED_FULL | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-057 (PENDING) | NOT_STARTED |
| REQ-FUNC-058 | PLANNED_FULL | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-058 (PENDING) | NOT_STARTED |
| REQ-FUNC-059 | PLANNED_FULL | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-059 (PENDING) | NOT_STARTED |
| REQ-FUNC-060 | PLANNED_FULL | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-060 (PENDING) | NOT_STARTED |
| REQ-FUNC-061 | PLANNED_FULL | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-061 (PENDING) | NOT_STARTED |
| REQ-FUNC-062 | PLANNED_FULL | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-062 (PENDING) | NOT_STARTED |
| REQ-FUNC-063 | PLANNED_FULL | SCR-002 | `/about` | `src/app/about/page.tsx`(→ SCR-001 상세 Drawer 연결) | PENDING_TASK_GENERATION | TC-FUNC-063 (PENDING) | NOT_STARTED |

## F7. Common, Admin, Governance (REQ-FUNC-064~080)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-064 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | `src/app/layout.tsx` | PENDING_TASK_GENERATION | TC-FUNC-064 (PENDING) | NOT_STARTED |
| REQ-FUNC-065 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | `src/app/layout.tsx`, `src/app/globals.css` | PENDING_TASK_GENERATION | TC-FUNC-065 (PENDING) | NOT_STARTED |
| REQ-FUNC-066 | PLANNED_FULL | SCR-005 | `/account` | `src/app/account/page.tsx`(로그인/가입 탭) | PENDING_TASK_GENERATION | TC-FUNC-066 (PENDING) | NOT_STARTED |
| REQ-FUNC-067 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(통합 검색바) | PENDING_TASK_GENERATION | TC-FUNC-067 (PENDING) | NOT_STARTED |
| REQ-FUNC-068 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(localStorage 즐겨찾기) | PENDING_TASK_GENERATION | TC-FUNC-068 (PENDING) | NOT_STARTED |
| REQ-FUNC-069 | PLANNED_FULL | SCR-001, SCR-004 | `/`, `/mates` | `src/app/page.tsx`, `src/app/mates/page.tsx`(공유 버튼) | PENDING_TASK_GENERATION | TC-FUNC-069 (PENDING) | NOT_STARTED |
| REQ-FUNC-070 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | 각 Screen `page.tsx`(Next.js Metadata export) | PENDING_TASK_GENERATION | TC-FUNC-070 (PENDING) | NOT_STARTED |
| REQ-FUNC-071 | EXCLUDED | N/A | N/A | N/A(전용 분석 이벤트 파이프라인 미제공) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-072 | EXCLUDED | N/A | N/A | N/A(콘텐츠 CRUD 관리자 화면 미제공) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-073 | EXCLUDED | N/A | N/A | N/A(미디어 업로드 관리자 화면 미제공) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-074 | EXCLUDED | N/A | N/A | N/A(게시 게이트 관리자 UI 미제공) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-075 | EXCLUDED | N/A | N/A | N/A(stale 대시보드 미제공) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-076 | EXCLUDED | N/A | N/A | N/A(감사 로그 화면 미제공) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-077 | PLANNED_FULL | SCR-005 | `/account` | `src/app/account/page.tsx`(관리자 탭, 외부 URL 설정) | PENDING_TASK_GENERATION | TC-FUNC-077 (PENDING) | NOT_STARTED |
| REQ-FUNC-078 | PLANNED_FULL | TECHNICAL_ROUTE | `*`(not-found/error) | `src/app/not-found.tsx`, `src/app/error.tsx` | PENDING_TASK_GENERATION | TC-FUNC-078 (PENDING) | NOT_STARTED |
| REQ-FUNC-079 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | 각 Screen `page.tsx` + 공용 컴포넌트 | PENDING_TASK_GENERATION | TC-FUNC-079 (PENDING) | NOT_STARTED |
| REQ-FUNC-080 | PLANNED_FULL | SCR-003, TECHNICAL_ROUTE | `/travel-tools`, `/terms`, `/privacy`, `/safety-guidelines` | `src/app/travel-tools/page.tsx`(안전수칙 동의), `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, `src/app/safety-guidelines/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-080 (PENDING) | NOT_STARTED |

---

## NF. Performance (REQ-NF-001~007)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-001 | PLANNED_TARGET_METRIC | GLOBAL | 전체 5개 Screen | 각 Screen `page.tsx`(SSR/이미지 최적화) | PENDING_TASK_GENERATION | TC-NF-001 (PENDING) | NOT_STARTED |
| REQ-NF-002 | PLANNED_TARGET_METRIC | GLOBAL | 전체 5개 Screen | 각 Screen `page.tsx`(경량 클라이언트 로직) | PENDING_TASK_GENERATION | TC-NF-002 (PENDING) | NOT_STARTED |
| REQ-NF-003 | PLANNED_TARGET_METRIC | GLOBAL | 전체 5개 Screen | 각 Screen `page.tsx`(고정 치수 이미지/폰트) | PENDING_TASK_GENERATION | TC-NF-003 (PENDING) | NOT_STARTED |
| REQ-NF-004 | PLANNED_FULL | SCR-001, SCR-004 | `/`, `/mates` | `src/app/page.tsx`, `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | TC-NF-004 (PENDING) | NOT_STARTED |
| REQ-NF-005 | EXCLUDED | N/A | N/A | N/A(부하 테스트 미수행) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-006 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | 각 Screen `page.tsx`(`next/image`) | PENDING_TASK_GENERATION | TC-NF-006 (PENDING) | NOT_STARTED |
| REQ-NF-007 | EXCLUDED | N/A | N/A | N/A(CI 성능 게이트 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |

## NF. Reliability and Recovery (REQ-NF-008~011)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-008 | EXCLUDED | N/A | N/A | N/A(가용성 모니터링 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-009 | EXCLUDED | N/A | N/A | N/A(5xx 비율 모니터링 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-010 | EXCLUDED | N/A | N/A | N/A(백업 RPO/RTO 정책 미수립) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-011 | EXCLUDED | N/A | N/A | N/A(외부 링크 주간 자동 검사 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |

## NF. Security and Privacy (REQ-NF-012~018)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-012 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | N/A(Vercel 배포 설정 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-012 (PENDING) | NOT_STARTED |
| REQ-NF-013 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | N/A(Supabase RLS 정책 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-013 (PENDING) | NOT_STARTED |
| REQ-NF-014 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | N/A(CSRF/SameSite 설정 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-014 (PENDING) | NOT_STARTED |
| REQ-NF-015 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | N/A(입력 검증/XSS 방지 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-015 (PENDING) | NOT_STARTED |
| REQ-NF-016 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | N/A(환경변수 관리 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-016 (PENDING) | NOT_STARTED |
| REQ-NF-017 | PLANNED_FULL | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx`(원시값 미전송) | PENDING_TASK_GENERATION | TC-NF-017 (PENDING) | NOT_STARTED |
| REQ-NF-018 | EXCLUDED | N/A | N/A | N/A(탈퇴 백엔드 처리 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |

## NF. Safety and Moderation (REQ-NF-019~022)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-019 | PLANNED_FULL | SCR-004 | `/mates` | `src/app/mates/page.tsx`(신고 접수) | PENDING_TASK_GENERATION | TC-NF-019 (PENDING) | NOT_STARTED |
| REQ-NF-020 | EXCLUDED | N/A | N/A | N/A(SLA 측정 체계 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-021 | EXCLUDED | N/A | N/A | N/A(속도 제한 미들웨어 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-022 | EXCLUDED | N/A | N/A | N/A(조치 추적성 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |

## NF. Accessibility (REQ-NF-023~025)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-023 | PLANNED_TARGET_METRIC | GLOBAL | 전체 5개 Screen | 각 Screen `page.tsx` + 공용 컴포넌트 | PENDING_TASK_GENERATION | TC-NF-023 (PENDING) | NOT_STARTED |
| REQ-NF-024 | PLANNED_FULL | N/A | N/A | N/A(Playwright axe 자동 검사 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-024 (PENDING) | NOT_STARTED |
| REQ-NF-025 | EXCLUDED | N/A | N/A | N/A(정식 수동 테스트 매트릭스 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |

## NF. Content, Freshness, SEO, Copyright (REQ-NF-026~030)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-026 | PLANNED_FULL | SCR-001 | `/` | N/A(데이터 검증 스크립트 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-026 (PENDING) | NOT_STARTED |
| REQ-NF-027 | PLANNED_FULL | SCR-001 | `/` | N/A(데이터 검증 스크립트 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-027 (PENDING) | NOT_STARTED |
| REQ-NF-028 | PLANNED_FULL | SCR-001 | `/` | `src/app/page.tsx`(stale 계산 렌더링) | PENDING_TASK_GENERATION | TC-NF-028 (PENDING) | NOT_STARTED |
| REQ-NF-029 | PLANNED_FULL | SCR-001, SCR-002 | `/`, `/about` | N/A(데이터 검증 스크립트 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-029 (PENDING) | NOT_STARTED |
| REQ-NF-030 | PLANNED_FULL | GLOBAL | 전체 5개 Screen | 각 Screen `page.tsx`(Metadata export) | PENDING_TASK_GENERATION | TC-NF-030 (PENDING) | NOT_STARTED |

## NF. Maintainability, Monitoring, Cost (REQ-NF-031~034)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-031 | PLANNED_FULL | N/A | N/A | N/A(CI 파이프라인 설정 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-031 (PENDING) | NOT_STARTED |
| REQ-NF-032 | EXCLUDED | N/A | N/A | N/A(구조화 로그 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-033 | EXCLUDED | N/A | N/A | N/A(장애 알림 미구축) | PENDING_TASK_GENERATION | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-034 | PLANNED_FULL | N/A | N/A | N/A(Vercel+Supabase 인프라 구성 — Page 아님) | PENDING_TASK_GENERATION | TC-NF-034 (PENDING) | NOT_STARTED |

---

## 검증

### 총계 확인

| 구간 | 개수 |
|---|---:|
| REQ-FUNC-001~080 | 80 |
| REQ-NF-001~034 | 34 |
| **총 Requirement 수(삭제 없음)** | **114** |

### Implementation Status 분포

| Implementation Status | FUNC | NF | 합계 |
|---|---:|---:|---:|
| PLANNED_FULL | 66 | 17 | 83 |
| PLANNED_REDUCED | 4 | 0 | 4 |
| PLANNED_TARGET_METRIC | 0 | 4 | 4 |
| EXCLUDED | 10 | 13 | 23 |
| **합계** | **80** | **34** | **114** |

`PROJECT_SCOPE.md` §6 요구사항 커버리지 요약과 대조: FUNC `PLANNED_FULL(66) + PLANNED_REDUCED(4) = 70` = PROJECT_SCOPE의 FUNC IMPLEMENT 70과 일치. NF `PLANNED_FULL(17) + PLANNED_TARGET_METRIC(4) = 21` = PROJECT_SCOPE의 NF IMPLEMENT 21과 일치. EXCLUDED `FUNC 10 + NF 13 = 23` = PROJECT_SCOPE의 EXCLUDED 23과 일치. 합계 `70 + 21 + 23 = 114`로 요구사항 총수와 일치한다.

### Task/Status 현황

| Task 값 | 개수 |
|---|---:|
| PENDING_TASK_GENERATION | 114 (전체) |

| Status 값 | 개수 |
|---|---:|
| NOT_STARTED | 91 |
| EXCLUDED | 23 |

구현 완료(`DONE`/`IMPLEMENTED` 등)로 기록된 항목은 없다 — 현재 `src/app`은 스타터 템플릿 상태이며, 실제 Task 생성과 구현이 시작되면 이 문서의 Task/Status 열을 갱신한다.
