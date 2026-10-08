# UI/UX Approved — Free Traveler

- **Document ID:** UIUX-APPROVED-TRAVEL-001
- **기반 문서:** `docs/02_SRS_BASELINE.md`(Route Inventory §3.5), `docs/PROJECT_SCOPE.md`, `docs/03_UI_COVERAGE_ANALYSIS.md`, `docs/04_UIUX_PLAN.md`, `docs/STITCH_VALIDATION_REPORT.md`, `design-reference/D-001/DESIGN.md`, `design-reference/DESIGN_MANIFEST.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`
- **상태:** **APPROVED** (디자인 단계 승인 — 구현 단계는 별도로 진행되며 본 문서는 구현 완료를 의미하지 않는다)
- **승인 대상:** SCR-001~SCR-005 5개 디자인 Screen(Stitch 검증 `STITCH_VALIDATION_PASS`), Mobile 변형(SCR-001, SCR-003), 디자인 정본 D-001(LOCKED)

> 본 문서는 승인된 5개 Screen과 기존 SRS Baseline의 Route Inventory(§3.5)를 연결하는 **승인 기록**이다. 요구사항(REQ-FUNC-001~080, REQ-NF-001~034)의 삭제·재작성은 없으며, 전체 요구사항-Screen-Route 연결은 `docs/UIUX_TRACEABILITY.md`에서 관리한다. Route 구조의 상세 반영은 `docs/06_SRS_UIUX_REVISED.md`에 기록한다.

---

## 1. 승인 요약

| 항목 | 값 |
|---|---|
| 승인된 디자인 Screen 수 | 5 (SCR-001~SCR-005) |
| Mobile 변형 | SCR-001, SCR-003 |
| Stitch 검증 결과 | `STITCH_VALIDATION_PASS` (`docs/STITCH_VALIDATION_REPORT.md`) |
| 디자인 정본 버전 | D-001, Status: LOCKED (`design-reference/DESIGN_MANIFEST.md`) |
| UI 구현 계약 | `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json` |
| 요구사항 삭제 여부 | 없음 — REQ-FUNC-001~080(80개), REQ-NF-001~034(34개) 전수 유지 |
| 구현 진행 상태 | **미착수** — `src/app`은 아직 `create-next-app` 스타터 템플릿 상태이며, 본 승인은 디자인·계약 단계의 승인이다(거짓 구현 기록 금지 원칙) |

---

## 2. 핵심/보조 Screen 구성

| Tier | Screen ID | Route | Page Entry | 비고 |
|---|---|---|---|---|
| 핵심(core) | SCR-001 | `/` | `src/app/page.tsx` | 탐색 진입점, `starter_template_forbidden=true` |
| 핵심(core) | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | 항공·숙소·동행 작성 3탭 통합 |
| 핵심(core) | SCR-004 | `/mates` | `src/app/mates/page.tsx` | 동행 조회·참가·신고·차단 |
| 핵심(core) | SCR-005 | `/account` | `src/app/account/page.tsx` | 인증·프로필·내 활동·간단 관리자 |
| 보조(supporting) | SCR-002 | `/about` | `src/app/about/page.tsx` | 대표 소개, 정적 열람 |

**`/travel-tools`(SCR-003) 구성 확인**: Tab 스위처 3개 — ①항공(비행기 찾기) ②숙소(숙소 찾기) ③동행 작성(동행 구하기, 안전수칙 동의 포함) — 각 탭은 독립된 입력·검증·완료 상태를 가진다(`design-reference/UI_CONTRACT.md` SCR-003 절 참고).

**`/account`(SCR-005) 구성 확인**: 역할 기반 탭 — Guest(로그인/가입) · Adult Member(프로필, 내 활동) · Moderator/Admin(프로필, 내 활동, 관리자[신고 처리 현황 + 외부 URL 설정, 2개 섹션 고정]) — 역할에 없는 탭은 렌더링하지 않는다(`design-reference/UI_CONTRACT.md` SCR-005 절 참고).

---

## 3. 기존 Route → 승인된 5개 Screen 통합 매핑

`02_SRS_BASELINE.md` §3.5 Page and Route Inventory에 정의된 다수의 공개 Route를 5개 디자인 Screen의 탭·패널·Drawer/Modal로 통합한다. 통합 후에도 원래 접근 경로가 제공하던 기능은 요구사항 단위로 100% 유지되며(`docs/UIUX_TRACEABILITY.md` 참고), 화면 수만 축소된다.

| 기존 Route(§3.5) | 기존 Page | Access | 통합 결과 |
|---|---|---|---|
| `/` | 홈 | Public | SCR-001 `/` — 그대로 유지 |
| `/destinations` | 전체 여행지 | Public | SCR-001 `/` Card Grid(국내+해외 통합 탐색)로 통합, 별도 Route 폐지 |
| `/destinations/domestic` | 국내 여행지 | Public | SCR-001 `/` 국내 탭/필터로 통합 |
| `/destinations/overseas` | 해외 여행지 | Public | SCR-001 `/` 해외 탭/필터로 통합 |
| `/destinations/[slug]` | 여행지 상세 | Public | SCR-001 여행지 상세 Drawer/Modal로 통합, 별도 Route 폐지 |
| `/flights` | 비행기 찾기 입력·요약 | Public | SCR-003 `/travel-tools` 항공 탭으로 통합 |
| `/hotels` | 호텔 찾기 입력·요약 | Public | SCR-003 `/travel-tools` 숙소 탭으로 통합 |
| `/mates` | 동행 모집글 목록 | Public | SCR-004 `/mates` — Route 동일하게 유지 |
| `/mates/[id]` | 동행 모집글 상세 | Public | SCR-004 상세 패널(Desktop)/Drawer(Mobile)로 통합, 별도 Route 폐지 |
| `/mates/new` | 동행 모집글 작성 | Adult Member | SCR-003 `/travel-tools` 동행 작성 탭으로 통합 |
| `/safety` | 국가별 주의사항 목록 | Public | SCR-001 안전정보 Drawer/Modal 진입점(안전정보 Card Grid Section)으로 통합, 별도 목록 Route 폐지 |
| `/safety/[countryCode]` | 국가별 주의사항 상세 | Public | SCR-001 안전정보 Drawer/Modal(여행지 Drawer에서 push 또는 안전정보 카드에서 직접 진입)로 통합 |
| `/about` | 대표 소개 | Public | SCR-002 `/about` — Route 동일하게 유지 |
| `/auth/*` | 가입·로그인·성인 확인 | Public/Member | SCR-005 `/account` 로그인/가입 탭으로 통합. 세션 콜백만 기술 Route `/auth/callback`(Route Handler)로 별도 유지 |
| `/my/*` | 내 글·참가 요청·차단 | Adult Member | SCR-005 `/account` 내 활동 탭으로 통합 |
| `/admin/*` | 콘텐츠·신고·설정 | Role Restricted | SCR-005 `/account` 관리자 탭(신고 상태 변경, 외부 URL 설정)으로 **축소** 통합. `/admin/*`의 콘텐츠 CRUD·미디어 관리·게시 게이트·stale 대시보드·감사 로그 기능은 `PROJECT_SCOPE.md`에서 EXCLUDED로 분류되어 구현하지 않는다(§4 참고) |

기술 Route(디자인 Screen 수에 포함하지 않음)는 `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `technical_routes`에 기록되어 있다: `/auth/callback`(인증 콜백), `/api/*`(Route Handler), `/not-found` `/error`(오류 화면), `/terms` `/privacy` `/safety-guidelines`(정적 정책 페이지).

---

## 4. EXCLUDED 처리 확인

기존 `/admin/*`이 제공하던 기능 중 아래 항목은 `docs/PROJECT_SCOPE.md`의 분류에 따라 **EXCLUDED**로 유지하며, 5개 Screen 어디에도 구현하지 않는다(요구사항 ID는 삭제하지 않고 SRS·Traceability에 EXCLUDED로 계속 기록한다):

| 제외 기능 | 관련 요구사항 | 대체 방안 |
|---|---|---|
| 콘텐츠(여행지·안전정보) CRUD/게시 워크플로 | REQ-FUNC-072, 074, 055 | `src/data` 정적 파일 + 코드 리뷰(PR) |
| 미디어 업로드·라이선스 승인 워크플로 | REQ-FUNC-073 | 외부 이미지 URL + 정적 alt 메타데이터 |
| 신고 제재 시스템(경고/숨김/계정 제한) | REQ-FUNC-042 | 신고 상태 변경(041)·차단(040) 기능으로 대체 |
| stale 콘텐츠 관리 대시보드 | REQ-FUNC-075 | 사용자 화면 stale 배지(050)로 대체 |
| 범용 감사 로그 화면 | REQ-FUNC-076, 056 | Git 커밋 이력으로 대체 |
| 회원 탈퇴 배치·개인정보 삭제 셀프서비스 | REQ-FUNC-045, REQ-NF-018 | Supabase Auth 계정 삭제 수동 처리로 축소 |

동일 EXCLUDED 목록의 전체 근거는 `docs/PROJECT_SCOPE.md` §3, 요구사항별 상세는 `docs/UIUX_TRACEABILITY.md`를 참고한다.

---

## 5. 승인 조건 충족 확인

- [x] 5개 디자인 Screen이 `STITCH_VALIDATION_PASS` 판정을 받았다(`docs/STITCH_VALIDATION_REPORT.md`).
- [x] 디자인 정본 D-001이 LOCKED 상태로 발행되었다(`design-reference/DESIGN_MANIFEST.md`).
- [x] `/travel-tools`가 항공·숙소·동행 작성 3탭을 포함한다(`design-reference/UI_CONTRACT.md` SCR-003).
- [x] `/account`가 인증·프로필·내 활동·간단 관리자를 포함한다(`design-reference/UI_CONTRACT.md` SCR-005).
- [x] REQ-FUNC-001~080, REQ-NF-001~034 114개 요구사항이 삭제 없이 유지된다(`docs/UIUX_TRACEABILITY.md`에서 전수 확인).
- [x] Route 수가 기존 SRS §3.5의 다수 Route에서 5개 디자인 Screen(+ 기술 Route)으로 통합되었다(§3 매핑표).
- [ ] **구현 완료** — 미체크. `src/app`은 아직 스타터 템플릿이며 본 승인은 구현 완료를 의미하지 않는다. 구현 진행 상태는 `docs/UIUX_TRACEABILITY.md`의 Implementation Status/Status 열에서 추적한다.
