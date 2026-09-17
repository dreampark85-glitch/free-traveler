# SRS — UI/UX Revised — Free Traveler

- **Document ID:** SRS-TRAVEL-002
- **Revises:** `docs/02_SRS_BASELINE.md`(SRS-TRAVEL-001 v1.0) §3.5 Page and Route Inventory, §4 Specific Requirements(Screen/Route 연결 열 추가)
- **기반 문서:** `docs/02_SRS_BASELINE.md`, `docs/PROJECT_SCOPE.md`, `docs/03_UI_COVERAGE_ANALYSIS.md`, `docs/05_UIUX_APPROVED.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`, `docs/UIUX_TRACEABILITY.md`
- **상태:** Implementation Baseline(개정) — 요구사항 본문·우선순위·수용 기준은 `SRS-TRAVEL-001`을 그대로 승계하며 삭제하지 않는다. 개정 범위는 Route/Screen 아키텍처, UI Route Contract, Release Acceptance Criteria다.
- **구현 진행 상태:** 본 문서는 요구사항-Screen 연결의 개정 기록이며 구현 완료를 선언하지 않는다. `src/app`은 현재 `create-next-app` 스타터 템플릿 상태다. 실제 구현·테스트 진행 상태는 `docs/UIUX_TRACEABILITY.md`에서 관리한다.

---

## 0. 개정 사유와 범위

`SRS-TRAVEL-001`(§3.5)은 15개 이상의 공개 Route(`/destinations`, `/destinations/domestic`, `/destinations/overseas`, `/destinations/[slug]`, `/flights`, `/hotels`, `/mates`, `/mates/[id]`, `/mates/new`, `/safety`, `/safety/[countryCode]`, `/about`, `/auth/*`, `/my/*`, `/admin/*` 등)를 상정했다. `docs/03_UI_COVERAGE_ANALYSIS.md`와 `docs/04_UIUX_PLAN.md`를 거쳐 Stitch에서 검증(`docs/STITCH_VALIDATION_REPORT.md`, `STITCH_VALIDATION_PASS`)된 디자인 결과, 이 기능들은 **5개 디자인 Screen(SCR-001~005)**의 탭·패널·Drawer/Modal 구조로 통합되었다(`docs/05_UIUX_APPROVED.md` §3 매핑표).

본 개정 SRS는:
1. §1에 개정된 **Route Inventory**(§3.5 대체)를 반영한다.
2. §2에 신규 섹션 **UI Route Contract**를 추가한다.
3. §3~§4에 `REQ-FUNC-001`~`080`, `REQ-NF-001`~`034` **114개 요구사항 전수를 삭제 없이** 재수록하고, 각 요구사항에 배치된 **Screen/Route**와 `PROJECT_SCOPE.md` 기준 **Scope 분류**를 추가 열로 연결한다(요구사항 본문·우선순위·Acceptance Criteria는 `SRS-TRAVEL-001`과 동일하며 재작성하지 않는다).
4. §5에 신규 섹션 **Release Acceptance Criteria**를 추가한다.
5. §6에 EXCLUDED 처리와 삭제 금지 원칙을 재확인한다.

`SRS-TRAVEL-001`의 §1(Introduction), §2(Stakeholders), §3.1~3.4·3.6~3.7(Architecture, Tech Stack, External Systems, Client, Use Cases, Sequences), §6(Appendix: API, Data Model, ERD, State Models, Validation Plan)은 본 개정에서 변경하지 않으며 계속 유효하다.

---

## 1. 개정된 Route Inventory (§3.5 대체)

### 1.1 디자인 Screen (5개)

| Screen ID | Route | Page | Access | Tier |
|---|---|---|---|---|
| SCR-001 | `/` | 홈(여행지 탐색 + 안전정보 + 동행 미리보기 + 대표 소개 도입) | Public | 핵심(core) |
| SCR-002 | `/about` | 대표 소개 | Public | 보조(supporting) |
| SCR-003 | `/travel-tools` | 통합 여행 준비(항공·숙소·동행 작성 3탭) | Public(동행 탭은 Adult Member 작성 권한 필요) | 핵심(core) |
| SCR-004 | `/mates` | 동행 조회(목록+상세 패널) | Public(참가 요청·신고·차단은 Adult Member) | 핵심(core) |
| SCR-005 | `/account` | 계정·관리(로그인/가입, 프로필, 내 활동, 간단 관리자) | Public(로그인 탭)/Adult Member/Role Restricted(관리자 탭) | 핵심(core) |

### 1.2 기술 Route(디자인 Screen 수에서 제외)

| Route | 성격 | Access |
|---|---|---|
| `/auth/callback` | 인증 콜백(Route Handler) | Public |
| `/api/mates`, `/api/mates/[id]/requests`, `/api/mates/[id]/report`, `/api/admin/outbound-urls` | Route Handler(API) | 역할별 제한 |
| `/not-found`(404), 런타임 오류 경계(500) | 오류 화면 | Public |
| `/terms`, `/privacy`, `/safety-guidelines` | 정적 정책 페이지 | Public |

### 1.3 §3.5 대비 변경 요약

기존 §3.5의 15개 Route가 위 5개 디자인 Screen + 기술 Route로 통합되었다. 상세 1:1 매핑은 `docs/05_UIUX_APPROVED.md` §3을 참조한다. 통합은 **화면(Route) 수의 축소**이며 **기능(요구사항)의 축소가 아니다** — 각 기존 Route가 담당하던 요구사항은 아래 §3~§4에서 Screen/Route 열로 재확인한다.

---

## 2. UI Route Contract (신규)

본 섹션은 `design-reference/SCREEN_ROUTE_CONTRACT.json`(schema_version: `traveler-screen-route-v1`, framework: `nextjs-app-router`)을 SRS 문서 체계에 편입한 요약이며, 전체 필드는 원본 JSON과 `design-reference/UI_CONTRACT.md`를 정본으로 한다.

### 2.1 Screen 계약 요약

| Screen ID | Route | Page Entry | page_owner_task_required | preview_required | starter_template_forbidden | mobile_variant_approved |
|---|---|---|---|---|---|---|
| SCR-001 | `/` | `src/app/page.tsx` | true | true | **true** | true |
| SCR-002 | `/about` | `src/app/about/page.tsx` | true | true | false | false |
| SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | true | true | false | true |
| SCR-004 | `/mates` | `src/app/mates/page.tsx` | true | true | false | false |
| SCR-005 | `/account` | `src/app/account/page.tsx` | true | true | false | false |

SCR-001은 `starter_template_forbidden=true`다 — 현재 `src/app/page.tsx`는 `create-next-app` 스타터 템플릿(Next.js 로고 + "To get started, edit the page.tsx file" 보일러플레이트)이며, 구현 시 전량 교체해야 한다.

### 2.2 Required Navigation(요약)

`design-reference/SCREEN_ROUTE_CONTRACT.json`의 `required_navigation`(14건)을 요약한다. 전체 트리거 문구는 원본 JSON과 `design-reference/UI_CONTRACT.md`를 참조한다.

| From | To | 성격 |
|---|---|---|
| SCR-001 | SCR-002, SCR-003, SCR-004 | 내부 이동(Hero/CTA Banner/미리보기 카드) |
| SCR-001 | EXTERNAL(MOFA) | 외부 새 탭(안전정보 Drawer) |
| SCR-002 | SCR-001, SCR-003, SCR-004 | 내부 이동(추천 카드/CTA Banner) |
| SCR-003 | EXTERNAL(항공/숙소) | 외부 새 탭(2건) |
| SCR-003 | SCR-004, SCR-005 | 내부 이동(동행 게시 완료 리다이렉트, 로그인 유도) |
| SCR-004 | SCR-003, SCR-005 | 내부 이동(작성 CTA, 로그인 유도/내 활동 링크) |
| SCR-005 | SCR-004 | 내부 이동(내 글/요청 카드 → 모집글 상세) |

### 2.3 Completion Checks

| 검사 | 결과 |
|---|---|
| Route 중복 없음 | true |
| Page Entry 중복 없음 | true |
| Screen 수 = 5 | true |
| 핵심/보조 구분 존재 | true (핵심 4: SCR-001·003·004·005 / 보조 1: SCR-002) |

---

## 3. Functional Requirements (REQ-FUNC-001~080) — Screen/Route 연결

> 요구사항 ID·본문·우선순위(P)·Source·Acceptance Criteria는 `SRS-TRAVEL-001` §4.1과 동일하며 재작성하지 않는다(원문 인용). **Screen/Route**와 **Scope**(`PROJECT_SCOPE.md` 분류) 열을 추가해 승인된 5개 Screen과 연결한다.

### 3.1 F1. Destination Guide → SCR-001 `/`

| ID | Requirement | P | Screen/Route | Scope |
|---|---|:---:|---|---|
| REQ-FUNC-001 | 시스템은 국내·해외 여행지 목록을 구분해 제공한다. | M | SCR-001 `/` | IMPLEMENT |
| REQ-FUNC-002 | 시스템은 국가·도시·계절·테마·권장 기간 필터를 제공한다. | M | SCR-001 `/` | IMPLEMENT |
| REQ-FUNC-003 | 시스템은 키워드로 여행지명·국가명·테마를 검색한다. | M | SCR-001 `/` | IMPLEMENT |
| REQ-FUNC-004 | 시스템은 여행지 상세에 소개·명소 5개 이상·추천 시기·1일/3일 일정·예산·교통·음식 3개 이상·에티켓·출처·수정일을 표시한다. | M | SCR-001 `/`(상세 Drawer/Modal) | IMPLEMENT |
| REQ-FUNC-005 | 시스템은 필터 결과가 없으면 조건 완화 안내와 전체 초기화 버튼을 제공한다. | M | SCR-001 `/` | IMPLEMENT |
| REQ-FUNC-006 | 시스템은 해외 여행지 상세에서 해당 국가의 안전 페이지를 연결한다. | M | SCR-001 `/`(상세 Drawer → 안전정보 Drawer) | IMPLEMENT |
| REQ-FUNC-007 | 시스템은 대표 이미지에 대체텍스트·출처·작가·라이선스를 연결한다. | M | SCR-001 `/` | IMPLEMENT |
| REQ-FUNC-008 | 시스템은 MVP 게시 기준 국내 10개 이상, 해외 15개국 30개 도시 이상을 검증한다. | M | N/A(빌드 검증 스크립트) | IMPLEMENT |
| REQ-FUNC-009 | 시스템은 같은 국가·테마의 관련 여행지를 상세 하단에 최대 6개 표시한다. | S | SCR-001 `/`(상세 Drawer) | IMPLEMENT |
| REQ-FUNC-010 | 시스템은 목록 필터 상태를 URL query에 반영해 새로고침·공유 시 복원한다. | S | SCR-001 `/` | IMPLEMENT |

### 3.2 F2. Flight Link-out → SCR-003 `/travel-tools`(항공 탭)

| ID | Requirement | P | Screen/Route | Scope |
|---|---|:---:|---|---|
| REQ-FUNC-011 | 시스템은 항공 폼에 목적 국가, 지역·도시, 출발일, 귀국일을 필수 입력으로 제공한다. | M | SCR-003 `/travel-tools`(항공 탭) | IMPLEMENT |
| REQ-FUNC-012 | 시스템은 선택 국가에 속하는 지역·도시만 선택 가능하게 한다. | M | SCR-003 `/travel-tools`(항공 탭) | IMPLEMENT |
| REQ-FUNC-013 | 시스템은 출발일이 오늘 이전이거나 귀국일이 출발일보다 빠르면 진행을 차단한다. | M | SCR-003 `/travel-tools`(항공 탭) | IMPLEMENT |
| REQ-FUNC-014 | 시스템은 유효한 입력 후 국가·지역·출발일·귀국일 요약 단계를 표시한다. | M | SCR-003 `/travel-tools`(항공 탭) | IMPLEMENT |
| REQ-FUNC-015 | 시스템은 폼과 요약에 "입력값은 외부 사이트로 전달되지 않습니다"를 표시한다. | M | SCR-003 `/travel-tools`(항공 탭) | IMPLEMENT |
| REQ-FUNC-016 | 시스템은 외부 이동 시 설정된 항공 일반 URL을 새 탭으로 열고 `noopener,noreferrer`를 적용한다. | M | SCR-003 `/travel-tools`(항공 탭) | IMPLEMENT |
| REQ-FUNC-017 | 시스템은 항공 입력값을 서버 DB, 서버 로그, 분석 이벤트에 저장하지 않는다. | M | SCR-003 `/travel-tools`(항공 탭) | IMPLEMENT |
| REQ-FUNC-018 | 시스템은 외부 URL이 없거나 허용목록 밖이면 이동을 차단하고 오류와 재시도를 제공한다. | M | SCR-003 `/travel-tools`(항공 탭) | IMPLEMENT |

### 3.3 F3. Hotel Link-out → SCR-003 `/travel-tools`(숙소 탭)

| ID | Requirement | P | Screen/Route | Scope |
|---|---|:---:|---|---|
| REQ-FUNC-019 | 시스템은 호텔 폼에 숙박 국가, 지역·도시, 체크인, 체크아웃을 필수 입력으로 제공한다. | M | SCR-003 `/travel-tools`(숙소 탭) | IMPLEMENT |
| REQ-FUNC-020 | 시스템은 선택 국가에 속하는 지역·도시만 선택 가능하게 한다. | M | SCR-003 `/travel-tools`(숙소 탭) | IMPLEMENT |
| REQ-FUNC-021 | 시스템은 체크인이 오늘 이전이거나 체크아웃이 체크인과 같거나 빠르면 진행을 차단한다. | M | SCR-003 `/travel-tools`(숙소 탭) | IMPLEMENT |
| REQ-FUNC-022 | 시스템은 유효한 입력 후 국가·지역·체크인·체크아웃 요약을 표시한다. | M | SCR-003 `/travel-tools`(숙소 탭) | IMPLEMENT |
| REQ-FUNC-023 | 시스템은 폼과 요약에 입력값 비전달 안내를 표시한다. | M | SCR-003 `/travel-tools`(숙소 탭) | IMPLEMENT |
| REQ-FUNC-024 | 시스템은 설정된 호텔 일반 URL을 새 탭으로 열고 `noopener,noreferrer`를 적용한다. | M | SCR-003 `/travel-tools`(숙소 탭) | IMPLEMENT |
| REQ-FUNC-025 | 시스템은 호텔 입력값을 서버 DB, 서버 로그, 분석 이벤트에 저장하지 않는다. | M | SCR-003 `/travel-tools`(숙소 탭) | IMPLEMENT |
| REQ-FUNC-026 | 시스템은 호텔 URL 오류 시 이동을 차단하고 재시도와 운영 오류 로그를 제공한다. | M | SCR-003 `/travel-tools`(숙소 탭) | IMPLEMENT |

### 3.4 F4. Travel Mate → SCR-003(작성) / SCR-004(조회·상세) / SCR-005(내 활동·관리자)

| ID | Requirement | P | Screen/Route | Scope |
|---|---|:---:|---|---|
| REQ-FUNC-027 | 시스템은 동행 쓰기 작업에 이메일 인증 세션을 요구한다. | M | SCR-003 `/travel-tools`(동행 탭) | IMPLEMENT |
| REQ-FUNC-028 | 시스템은 동행 글·요청 전에 만 19세 이상 확인 상태를 요구하며 정확한 생년월일은 저장하지 않는다. | M | SCR-005 `/account`(성인 확인 상태) | IMPLEMENT |
| REQ-FUNC-029 | 시스템은 동행 프로필에 닉네임, 연령대, 선택형 성별, 여행 스타일, 자기소개를 제공한다. | M | SCR-005 `/account`(프로필 탭) | IMPLEMENT |
| REQ-FUNC-030 | 시스템은 국가·지역·여행 기간 겹침·연령대·성별·여행 스타일·모집 상태로 동행글을 필터한다. | M | SCR-004 `/mates`(Filter Bar) | IMPLEMENT |
| REQ-FUNC-031 | 시스템은 모집글에 제목, 국가, 지역, 시작일, 종료일, 모집 인원, 선호 조건, 여행 스타일, 상세 설명, 안전수칙 동의를 입력받는다. | M | SCR-003 `/travel-tools`(동행 탭 작성 폼) | IMPLEMENT |
| REQ-FUNC-032 | 시스템은 본문에서 전화번호·이메일·일반 메신저 ID 패턴을 탐지해 제출을 차단한다. | M | SCR-003 `/travel-tools`(동행 탭) | IMPLEMENT |
| REQ-FUNC-033 | 시스템은 모집글 작성자·상태·조건·설명을 표시하되 이메일과 외부 연락처를 노출하지 않는다. | M | SCR-004 `/mates`(상세 패널) | IMPLEMENT |
| REQ-FUNC-034 | 시스템은 모집중 글에 최대 500자의 참가 메시지를 비공개로 제출하게 한다. | M | SCR-004 `/mates`(상세 패널, 참가 요청 폼) | IMPLEMENT |
| REQ-FUNC-035 | 시스템은 동일 사용자의 동일 글 중복 PENDING·ACCEPTED 요청을 차단한다. | M | SCR-004 `/mates`(상세 패널) | IMPLEMENT |
| REQ-FUNC-036 | 시스템은 글 작성자가 참가 요청을 ACCEPTED 또는 REJECTED로 변경하게 한다. | M | SCR-005 `/account`(내 활동 탭) | IMPLEMENT |
| REQ-FUNC-037 | 시스템은 여행 종료일 다음 날 모집글을 CLOSED로 자동 전환한다. | M | SCR-004 `/mates`(목록/상세, 파생 상태) | IMPLEMENT |
| REQ-FUNC-038 | 시스템은 작성자가 모집글을 수동 마감·수정·삭제하게 한다. | M | SCR-005 `/account`(내 활동 탭) | IMPLEMENT |
| REQ-FUNC-039 | 시스템은 글·사용자·참가 요청을 사유 코드와 설명으로 신고하게 한다. | M | SCR-004 `/mates`(상세 패널, 신고 폼) | IMPLEMENT(축소) |
| REQ-FUNC-040 | 시스템은 사용자가 다른 사용자를 차단·해제하게 한다. | M | SCR-004 `/mates`(상세 패널, 차단 버튼) | IMPLEMENT(축소) |
| REQ-FUNC-041 | 시스템은 Moderator에게 신고 우선순위·상태·대상·증거·접수 시각 큐를 제공한다. | M | SCR-005 `/account`(관리자 탭) | IMPLEMENT(축소) |
| REQ-FUNC-042 | 시스템은 Moderator가 경고, 콘텐츠 숨김, 계정 일시 제한, 신고 기각 조치를 기록하게 한다. | M | 해당 없음 | **EXCLUDED** |
| REQ-FUNC-043 | 시스템은 참가 요청 접수·승인·거절·신고 처리 결과를 인앱 알림으로 제공하고 이메일은 선택적으로 발송한다. | M | SCR-004 `/mates`, SCR-005 `/account`(전역 Toast) | IMPLEMENT(축소) |
| REQ-FUNC-044 | 시스템은 RLS로 본인 글·요청, 요청 대상 작성자, Moderator/Admin만 비공개 데이터를 열람하게 한다. | M | SCR-004 `/mates`, SCR-005 `/account`(전역, 비-Page) | IMPLEMENT |
| REQ-FUNC-045 | 시스템은 회원 탈퇴 시 공개 프로필을 즉시 비식별화하고 법적·분쟁 보존 대상이 아닌 개인정보를 30일 이내 삭제한다. | M | 해당 없음 | **EXCLUDED** |

### 3.5 F5. Country Safety → SCR-001 `/`(Drawer/Modal)

| ID | Requirement | P | Screen/Route | Scope |
|---|---|:---:|---|---|
| REQ-FUNC-046 | 시스템은 게시된 모든 해외 국가에 하나 이상의 공개 안전 페이지를 요구한다. | M | N/A(빌드 검증 스크립트) | IMPLEMENT |
| REQ-FUNC-047 | 시스템은 치안, 흔한 사기, 현지 법규, 교통, 재난·기후, 보건, 문화·복장, 긴급연락처 섹션을 제공한다. | M | SCR-001 `/`(안전정보 Drawer/Modal) | IMPLEMENT |
| REQ-FUNC-048 | 시스템은 각 안전 페이지에 공식 출처명·URL·최종 확인일·편집자를 기록한다. | M | SCR-001 `/`(안전정보 Drawer/Modal) | IMPLEMENT |
| REQ-FUNC-049 | 시스템은 외교부 해외안전여행 원문 링크를 새 탭으로 제공한다. | M | SCR-001 `/`(안전정보 Drawer/Modal) | IMPLEMENT |
| REQ-FUNC-050 | 시스템은 최종 확인 후 7일이 지나면 stale 상태와 재확인 경고를 표시한다. | M | SCR-001 `/`(안전정보 Drawer/Modal) | IMPLEMENT |
| REQ-FUNC-051 | 시스템은 출국권고·여행금지·특별여행주의보 등 중대 경보를 본문 상단에 텍스트로 표시한다. | M | SCR-001 `/`(안전정보 Drawer/Modal) | IMPLEMENT |
| REQ-FUNC-052 | 시스템은 국가 전체 경보와 특정 지역 경보를 별도 범위로 모델링한다. | M | SCR-001 `/`(안전정보 Drawer/Modal) | IMPLEMENT |
| REQ-FUNC-053 | 시스템은 현지 긴급전화와 대한민국 재외공관 또는 영사콜센터 연결 정보를 표시한다. | M | SCR-001 `/`(안전정보 Drawer/Modal) | IMPLEMENT |
| REQ-FUNC-054 | 시스템은 안전정보가 공식 판단을 대체하지 않으며 출국 직전 원문 재확인이 필요함을 고지한다. | M | SCR-001 `/`, SCR-003 `/travel-tools`(공통 고지) | IMPLEMENT |
| REQ-FUNC-055 | 시스템은 Editor/Admin이 안전 콘텐츠를 작성·검수·게시·보관하게 한다. | M | 해당 없음 | **EXCLUDED** |
| REQ-FUNC-056 | 시스템은 안전정보 변경 이력을 이전 값·새 값·사유·담당자·시각과 함께 보존한다. | M | 해당 없음 | **EXCLUDED** |

### 3.6 F6. About free_traveler → SCR-002 `/about`

| ID | Requirement | P | Screen/Route | Scope |
|---|---|:---:|---|---|
| REQ-FUNC-057 | 시스템은 대표명 `free_traveler`, `50+ Trips`, `30+ Countries`를 표시한다. | M | SCR-002 `/about` | IMPLEMENT |
| REQ-FUNC-058 | 시스템은 대표 소개문·여행 철학·콘텐츠 편집 원칙을 표시한다. | M | SCR-002 `/about` | IMPLEMENT |
| REQ-FUNC-059 | 시스템은 방문 권역 지도 또는 30개국 이상의 국가 목록을 제공한다. | M | SCR-002 `/about` | IMPLEMENT |
| REQ-FUNC-060 | 시스템은 대표 여행 타임라인과 대표 여행 기록을 제공한다. | M | SCR-002 `/about` | IMPLEMENT |
| REQ-FUNC-061 | 시스템은 대표 이미지에 대체텍스트·출처·작가·라이선스 URL을 제공한다. | M | SCR-002 `/about` | IMPLEMENT |
| REQ-FUNC-062 | 시스템은 관리자 설정 기반 문의·SNS 링크를 제공한다. | S | SCR-002 `/about` | IMPLEMENT |
| REQ-FUNC-063 | 시스템은 대표 추천 여행지 6개를 공개 여행지 상세로 연결한다. | S | SCR-002 `/about` → SCR-001 `/`(상세 Drawer) | IMPLEMENT |

### 3.7 F7. Common, Admin, Governance

| ID | Requirement | P | Screen/Route | Scope |
|---|---|:---:|---|---|
| REQ-FUNC-064 | 시스템은 모든 공개 페이지에 일관된 전역 내비게이션과 푸터를 제공한다. | M | GLOBAL(전체 5개 Screen) | IMPLEMENT |
| REQ-FUNC-065 | 시스템은 320px부터 데스크톱까지 레이아웃을 반응형으로 제공한다. | M | GLOBAL(전체 5개 Screen) | IMPLEMENT |
| REQ-FUNC-066 | 시스템은 이메일 가입·인증·로그인·로그아웃·비밀번호 재설정을 제공한다. | M | SCR-005 `/account`(로그인/가입 탭) | IMPLEMENT |
| REQ-FUNC-067 | 시스템은 여행지·국가 안전정보를 통합 검색한다. | M | SCR-001 `/` | IMPLEMENT |
| REQ-FUNC-068 | 시스템은 회원이 여행지를 즐겨찾기·해제·조회하게 한다. | S | SCR-001 `/` | IMPLEMENT |
| REQ-FUNC-069 | 시스템은 여행지·안전·동행 공개 페이지의 URL 공유를 제공한다. | S | SCR-001 `/`, SCR-004 `/mates` | IMPLEMENT |
| REQ-FUNC-070 | 시스템은 공개 페이지별 title, description, canonical, Open Graph, 구조화 데이터를 제공한다. | M | GLOBAL(전체 5개 Screen) | IMPLEMENT |
| REQ-FUNC-071 | 시스템은 폼 시작·검증 완료·외부 클릭·안전 섹션 조회·동행 요청 이벤트를 기록하되 정확한 날짜와 자유서술은 기록하지 않는다. | M | 해당 없음 | **EXCLUDED** |
| REQ-FUNC-072 | 시스템은 Editor/Admin에게 여행지·콘텐츠 CRUD와 미리보기를 제공한다. | M | 해당 없음 | **EXCLUDED** |
| REQ-FUNC-073 | 시스템은 미디어 업로드 시 출처·작가·라이선스·원문 URL·대체텍스트를 필수 입력받는다. | M | 해당 없음 | **EXCLUDED** |
| REQ-FUNC-074 | 시스템은 여행지·안전·대표 콘텐츠의 게시 전 완전성 게이트를 실행한다. | M | 해당 없음 | **EXCLUDED** |
| REQ-FUNC-075 | 시스템은 안전정보 stale 현황, 최근 확인일, 검토 담당자 대시보드를 제공한다. | M | 해당 없음 | **EXCLUDED** |
| REQ-FUNC-076 | 시스템은 관리자 변경·신고 처리·권한 변경을 감사 로그로 남긴다. | M | 해당 없음 | **EXCLUDED** |
| REQ-FUNC-077 | 시스템은 Admin이 항공·호텔 외부 URL을 허용목록 내 HTTPS 주소로 설정하게 한다. | M | SCR-005 `/account`(관리자 탭) | IMPLEMENT |
| REQ-FUNC-078 | 시스템은 404·500·권한 없음·외부 연결 실패 화면에 복구 행동을 제공한다. | M | TECHNICAL_ROUTE(`not-found`/`error`) | IMPLEMENT |
| REQ-FUNC-079 | 시스템은 폼·모달·탭·알림에 올바른 HTML 의미와 ARIA 상태를 제공한다. | M | GLOBAL(전체 5개 Screen) | IMPLEMENT |
| REQ-FUNC-080 | 시스템은 이용약관, 개인정보 처리방침, 동행 안전수칙, 콘텐츠 면책 안내를 제공하고 동행 글 작성 시 안전수칙 동의를 기록한다. | M | SCR-003 `/travel-tools`(동행 탭) + 정적 정책 Route(`/terms`,`/privacy`,`/safety-guidelines`) | IMPLEMENT |

---

## 4. Non-Functional Requirements (REQ-NF-001~034) — Screen/Route 연결

> 지표(Metric)·목표치(Target)·조건(Condition)은 `SRS-TRAVEL-001` §4.2와 동일하며 재작성하지 않는다.

### 4.1 Performance

| ID | Requirement | Screen/Route | Scope |
|---|---|---|---|
| REQ-NF-001 | 공개 핵심 페이지의 LCP를 제한한다. | GLOBAL(전체 5개 Screen) | IMPLEMENT(목표치) |
| REQ-NF-002 | 상호작용 지연을 제한한다. | GLOBAL(전체 5개 Screen) | IMPLEMENT(목표치) |
| REQ-NF-003 | 레이아웃 이동을 제한한다. | GLOBAL(전체 5개 Screen) | IMPLEMENT(목표치) |
| REQ-NF-004 | 여행지·동행 필터 응답을 제한한다. | SCR-001 `/`, SCR-004 `/mates` | IMPLEMENT |
| REQ-NF-005 | 쓰기 API 응답을 제한한다. | 해당 없음 | **EXCLUDED** |
| REQ-NF-006 | 이미지 성능을 최적화한다. | GLOBAL(전체 5개 Screen) | IMPLEMENT |
| REQ-NF-007 | 배포 전 성능 예산을 검사한다. | 해당 없음 | **EXCLUDED** |

### 4.2 Reliability and Recovery

| ID | Requirement | Screen/Route | Scope |
|---|---|---|---|
| REQ-NF-008 | 월간 서비스 가용성. | 해당 없음 | **EXCLUDED** |
| REQ-NF-009 | 내부 API 5xx 비율. | 해당 없음 | **EXCLUDED** |
| REQ-NF-010 | DB 백업 RPO/RTO. | 해당 없음 | **EXCLUDED** |
| REQ-NF-011 | 항공·호텔·공식 출처 링크 자동 검사. | 해당 없음 | **EXCLUDED** |

### 4.3 Security and Privacy

| ID | Requirement | Screen/Route | Scope |
|---|---|---|---|
| REQ-NF-012 | 모든 통신에 TLS 1.2 이상을 사용한다. | GLOBAL(전체 5개 Screen, 비-Page) | IMPLEMENT |
| REQ-NF-013 | 인증·역할·RLS 정책을 서버에서 검증한다. | GLOBAL(전체 5개 Screen, 비-Page) | IMPLEMENT |
| REQ-NF-014 | 상태 변경 요청에 CSRF 방어·SameSite 쿠키를 적용한다. | GLOBAL(전체 5개 Screen, 비-Page) | IMPLEMENT |
| REQ-NF-015 | 사용자 입력을 검증·이스케이프하고 저장 XSS를 차단한다. | GLOBAL(전체 5개 Screen, 비-Page) | IMPLEMENT |
| REQ-NF-016 | 비밀키는 환경변수로 관리하고 클라이언트 번들에 포함하지 않는다. | GLOBAL(전체 5개 Screen, 비-Page) | IMPLEMENT |
| REQ-NF-017 | 항공·호텔 원시 입력값을 서버·분석에 보존하지 않는다. | SCR-003 `/travel-tools` | IMPLEMENT |
| REQ-NF-018 | 개인정보 내보내기·탈퇴·삭제 요청을 제공한다. | 해당 없음 | **EXCLUDED** |

### 4.4 Safety and Moderation

| ID | Requirement | Screen/Route | Scope |
|---|---|---|---|
| REQ-NF-019 | 신고 접수 응답. | SCR-004 `/mates` | IMPLEMENT |
| REQ-NF-020 | 신고 1차 검토. | 해당 없음 | **EXCLUDED** |
| REQ-NF-021 | 동일 사용자의 글·요청·신고 속도 제한. | 해당 없음 | **EXCLUDED** |
| REQ-NF-022 | Moderator 조치 추적 가능성. | 해당 없음 | **EXCLUDED** |

### 4.5 Accessibility

| ID | Requirement | Screen/Route | Scope |
|---|---|---|---|
| REQ-NF-023 | WCAG 2.2 준수 목표. | GLOBAL(전체 5개 Screen) | IMPLEMENT(목표치) |
| REQ-NF-024 | 자동 접근성 검사. | N/A(Playwright axe, 비-Page) | IMPLEMENT |
| REQ-NF-025 | 키보드·스크린리더 수동 검사. | 해당 없음 | **EXCLUDED** |

### 4.6 Content, Freshness, SEO, Copyright

| ID | Requirement | Screen/Route | Scope |
|---|---|---|---|
| REQ-NF-026 | 여행지 콘텐츠 완전성. | SCR-001 `/`(비-Page 검증 스크립트) | IMPLEMENT |
| REQ-NF-027 | 해외 국가 안전정보 커버리지. | SCR-001 `/`(비-Page 검증 스크립트) | IMPLEMENT |
| REQ-NF-028 | 안전정보 최신 확인. | SCR-001 `/` | IMPLEMENT |
| REQ-NF-029 | 미디어 라이선스 메타데이터. | SCR-001 `/`, SCR-002 `/about`(비-Page 검증 스크립트) | IMPLEMENT |
| REQ-NF-030 | 공개 페이지 SEO 메타데이터. | GLOBAL(전체 5개 Screen) | IMPLEMENT |

### 4.7 Maintainability, Monitoring, Cost

| ID | Requirement | Screen/Route | Scope |
|---|---|---|---|
| REQ-NF-031 | TypeScript strict·lint·unit test. | N/A(CI 파이프라인) | IMPLEMENT |
| REQ-NF-032 | 구조화 로그. | 해당 없음 | **EXCLUDED** |
| REQ-NF-033 | 핵심 오류 알림. | 해당 없음 | **EXCLUDED** |
| REQ-NF-034 | MVP 월 인프라 비용. | N/A(인프라 구성) | IMPLEMENT |

---

## 5. Release Acceptance Criteria (신규)

MVP 릴리스는 아래 게이트를 **모두** 통과해야 승인된다. 게이트는 `SRS-TRAVEL-001` §6.8(Validation Plan)과 `docs/PROJECT_SCOPE.md` 항목 11~12를 승인된 5개 Screen 구조에 맞게 재확인한 것이며, 완화하지 않는다.

### 5.1 Screen/Route 게이트

| 게이트 | 기준 |
|---|---|
| G-01 Screen 수 | 디자인 Screen이 정확히 5개(SCR-001~005)이며 추가 생성이 없다(`design-reference/SCREEN_ROUTE_CONTRACT.json` `completion_checks`). |
| G-02 Route/Page Entry 중복 없음 | `route_no_duplicates=true`, `page_entry_no_duplicates=true`. |
| G-03 스타터 템플릿 제거 | SCR-001(`src/app/page.tsx`)에 `create-next-app` 스타터 콘텐츠(Next.js 로고, "To get started..." 문구)가 남아있지 않다. |
| G-04 필수 탭 구성 | `/travel-tools`(SCR-003)에 항공·숙소·동행 작성 3탭이, `/account`(SCR-005)에 로그인/가입·프로필·내 활동·관리자(역할 기반)가 모두 존재한다. |
| G-05 디자인 정본 준수 | 구현 스타일이 `design-reference/D-001/DESIGN.md`(Status: LOCKED)의 토큰·Section 계약·Do/Do Not을 위반하지 않는다. |

### 5.2 요구사항 게이트

| 게이트 | 기준 |
|---|---|
| G-06 IMPLEMENT 요구사항 구현 | `docs/UIUX_TRACEABILITY.md`에서 `PLANNED_FULL`·`PLANNED_REDUCED`로 표시된 74개 요구사항(FUNC 70 + NF 4)이 각 Screen에 구현되고 해당 Test Case가 통과한다. |
| G-07 목표치(TARGET_METRIC) 요구사항 측정 | `PLANNED_TARGET_METRIC` 4개(REQ-NF-001/002/003/023)는 CI 게이트 없이 배포 전 수동 측정으로 목표치 근접 여부를 기록한다(§4.1/4.5 목표치 기준). |
| G-08 EXCLUDED 요구사항 미구현 확인 | `docs/UIUX_TRACEABILITY.md`에서 `EXCLUDED`로 표시된 23개 요구사항(FUNC 10 + NF 13)이 어떤 Screen에도 구현되지 않았음을 코드 리뷰로 확인한다(`docs/05_UIUX_APPROVED.md` §4). |
| G-09 요구사항 총수 불변 | REQ-FUNC-001~080(80) + REQ-NF-001~034(34) = 114개가 삭제 없이 `docs/UIUX_TRACEABILITY.md`에 유지된다. |

### 5.3 테스트·품질 게이트 (PROJECT_SCOPE 항목 11 연계)

| 게이트 | 기준 |
|---|---|
| G-10 Playwright Smoke Test | UC-01~09에 대응하는 핵심 Smoke Test가 통과한다(`SRS-TRAVEL-001` §6.8.1 Test Levels 중 E2E). |
| G-11 axe 자동 접근성 검사 | Playwright에 통합된 axe-core 검사에서 serious/critical 위반이 0건이다(REQ-NF-024). |
| G-12 TypeScript/Lint | `main` 병합 전 TypeScript strict·ESLint·단위 테스트가 통과한다(REQ-NF-031). |
| G-13 콘텐츠 완전성 검증 | 여행지(REQ-FUNC-008/REQ-NF-026)·안전정보(REQ-FUNC-046/REQ-NF-027) 수량·완전성 검증 스크립트가 통과한다. |

### 5.4 배포 게이트 (PROJECT_SCOPE 항목 12 연계)

| 게이트 | 기준 |
|---|---|
| G-14 Vercel 배포 | Vercel Preview/Production 배포가 성공하고 환경변수(`FLIGHT_OUTBOUND_URL`, `HOTEL_OUTBOUND_URL` 등)가 설정되어 있다. |
| G-15 인프라 범위 준수 | Vercel + Supabase만 사용하며 AWS/EC2 등 별도 인프라가 추가되지 않았다(REQ-NF-034). |

### 5.5 승인 절차

1. §5.1~§5.4의 모든 게이트가 통과하면 `docs/UIUX_TRACEABILITY.md`의 해당 요구사항 Status를 `NOT_STARTED`에서 구현·테스트 결과에 맞는 값으로 갱신한다(허위 기록 금지 — 실제로 통과한 게이트만 갱신한다).
2. 일부 게이트만 통과한 상태에서는 "부분 승인"으로 기록하고 미통과 게이트를 명시한다. 전체 통과 전에는 "MVP Release 승인 완료"를 선언하지 않는다.

---

## 6. 삭제 금지 원칙 재확인

- `REQ-FUNC-001`~`REQ-FUNC-080`, `REQ-NF-001`~`REQ-NF-034` 114개는 본 개정에서도 **전수 유지**되며, EXCLUDED로 분류된 23개도 ID·원문·분류 사유와 함께 §3~§4에 계속 기록된다.
- EXCLUDED 요구사항은 "구현하지 않음"을 뜻할 뿐 "요구사항이 존재하지 않음"을 뜻하지 않는다 — 향후 범위 확장 시 동일 ID로 재분류(IMPLEMENT 전환)할 수 있도록 ID 체계를 보존한다.
- 요구사항별 실시간 구현·테스트 진행 상태는 `docs/UIUX_TRACEABILITY.md`가 단일 진실 공급원이며, 본 문서(SRS-TRAVEL-002)와 `SRS-TRAVEL-001`은 요구사항 정의·Screen 연결의 정본을 유지한다.
