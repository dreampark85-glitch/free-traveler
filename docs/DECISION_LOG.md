# DECISION_LOG — Free Traveler

- **Document ID:** DECLOG-TRAVEL-001
- **목적:** 이 프로젝트의 구조·범위·프로세스에 관한 확정된 결정을 번호로 추적한다. 각 결정은 번복하려면 새 DEC 번호로 후속 결정을 남기고 여기서 상태를 갱신하며, 기존 항목의 내용을 직접 덮어쓰지 않는다.
- **상태 값:** `ACTIVE`(현재 유효) / `SUPERSEDED`(후속 DEC로 대체)

| ID | 결정 | 상태 |
|---|---|---|
| DEC-001 | 실제 개발 루트는 `traveler/app` | ACTIVE |
| DEC-002 | 디자인 Screen은 핵심 4개·보조 1개 | ACTIVE |
| DEC-003 | `/travel-tools`에 항공·숙소·동행 작성을 통합 | ACTIVE |
| DEC-004 | 여행지·안전·대표는 정적 TypeScript Data | ACTIVE |
| DEC-005 | Supabase는 Auth와 동행 기능 중심 | ACTIVE |
| DEC-006 | DB는 6개 Table로 제한 | ACTIVE |
| DEC-007 | 항공·숙소 입력은 Browser Memory에만 유지 | ACTIVE |
| DEC-008 | Airbnb DESIGN.md는 vendor 참고본, D-001이 실제 정본 | ACTIVE |
| DEC-009 | Playwright는 Chromium Smoke만 필수 | ACTIVE |
| DEC-010 | 사용자의 개발 실행 단위는 Wave | ACTIVE |
| DEC-011 | Single Agent가 Wave 내부 Task를 순차 수행 | ACTIVE |
| DEC-012 | PR·Merge는 사용자가 수동 수행 | ACTIVE |
| DEC-013 | EC2·AWS는 사용하지 않음 | ACTIVE |
| DEC-014 | 제외 기능은 EXCLUDED로 관리 | ACTIVE |

---

## DEC-001 — 실제 개발 루트는 `traveler/app`

**결정:** 리포지토리는 `traveler/`(구 PRD/SRS 베이스라인 문서 — `docs/00_PRD_Travel_v1.md`, `docs/05_SRS_Travel_v1.md`)와 `traveler/app/`(실제 Next.js 애플리케이션, `package.json`/`src/`/`design-reference/`/`TASKS/`/`docs/` 포함)로 나뉘어 있다. 모든 코드 작성·Task 실행·감사(`validate_inputs.py`/`audit_tasks.py`)·문서 산출물(`docs/PROJECT_SCOPE.md`, `docs/ARCHITECTURE.md` 등)은 `traveler/app`을 루트로 삼는다.

**이유:** `traveler/docs`의 문서는 상위 베이스라인(제품 기획 초안)이고, 이후 상세화된 SRS/UI/설계/Task 문서는 모두 `traveler/app/docs`·`traveler/app/design-reference`·`traveler/app/TASKS` 아래에 위치한다. 실행 가능한 코드(`package.json`, `src/app`)도 `traveler/app`에만 존재한다.

**영향:** 상대 경로 인용은 항상 `traveler/app` 기준이다. `traveler/docs`의 구버전 문서를 구현 근거로 재인용하지 않는다.

---

## DEC-002 — 디자인 Screen은 핵심 4개·보조 1개

**결정:** 승인된 Screen은 정확히 5개이며, 핵심(core) 4개 — SCR-001(`/`), SCR-003(`/travel-tools`), SCR-004(`/mates`), SCR-005(`/account`) — 와 보조(supporting) 1개 — SCR-002(`/about`) — 로 고정한다.

**이유:** `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `tier_summary: {core: 4, supporting: 1}`과 `design-reference/UI_CONTRACT.md`의 티어 구분이 이를 확정한다. 핵심 4개는 탐색→조건 정리/동행 작성→동행 조회→계정 관리로 이어지는 사용자의 핵심 과업 흐름이며, SCR-002는 CTA를 통해서만 핵심 흐름과 연결되는 정적 신뢰도 열람 화면이다.

**영향:** 신규 Screen을 추가하려면 `docs/STITCH_VALIDATION_REPORT.md`에 상응하는 검증 통과 기록과 `SCREEN_ROUTE_CONTRACT.json`/`DESIGN_MANIFEST.md` 갱신이 선행되어야 한다.

---

## DEC-003 — `/travel-tools`에 항공·숙소·동행 작성을 통합

**결정:** 항공편 찾기(Flight Link-out), 숙소 찾기(Hotel Link-out), 동행글 작성(Travel Mate 작성 폼)은 별도 Route로 분리하지 않고 단일 Screen SCR-003(`/travel-tools`, `src/app/travel-tools/page.tsx`) 안에서 `TabSwitcher`(pill, 3탭: `flight`/`hotel`/`mate-write`)로 통합한다.

**이유:** `design-reference/SCREEN_ROUTE_CONTRACT.json`의 SCR-003 `tabs: ["flight", "hotel", "mate-write"]`, `design-reference/UI_CONTRACT.md`의 SCR-003 절("통합 여행 준비")이 이 통합 구조를 명시한다. 세 기능은 "여행 조건부터 정리하고 이동/게시한다"는 동일한 3단계 흐름(입력→요약→외부 이동 또는 게시)을 공유한다.

**영향:** 세 탭은 각자 독립된 클라이언트 상태를 가지며 탭 전환 시 값이 서로 오염되지 않아야 한다. `PAGE-SCR003`(Page Owner)은 이 3탭 전체를 조립하는 것을 완료 조건으로 한다.

---

## DEC-004 — 여행지·안전·대표는 정적 TypeScript Data

**결정:** 여행지(Destination Guide), 국가 안전정보(Country Safety), `free_traveler` 대표 소개(About) 콘텐츠는 Supabase 테이블이 아니라 `src/data`의 정적 TypeScript/JSON 데이터로 관리한다.

**이유:** `docs/PROJECT_SCOPE.md` §2 "콘텐츠 소스" 원칙 — "여행지·안전정보·대표 소개 콘텐츠는 Supabase CMS가 아니라 `src/data`의 정적 TypeScript/JSON 데이터로 관리하고, 변경은 코드 리뷰로 검증한다." 콘텐츠 CMS·관리자 CRUD·업로드 승인 워크플로는 EXCLUDED로 분류되어 있다(REQ-FUNC-055/056/072/073/074/075).

**영향:** `DATA-DESTINATIONS`/`DATA-SAFETY`/`DATA-REPRESENTATIVE` Task가 이 데이터를 정의하며, DB 스키마(DEC-006)에는 이 콘텐츠용 테이블을 두지 않는다. 콘텐츠 수정은 PR 리뷰로만 이루어진다.

---

## DEC-005 — Supabase는 Auth와 동행 기능 중심

**결정:** Supabase 사용 범위를 (1) 이메일 인증/로그인/비밀번호 재설정 및 성인 확인 상태 저장(Auth), (2) 동행글 작성·조회·수정·마감, 참가 요청/승인/거절, 신고, 차단, 관리자의 신고 상태 변경·외부 URL 설정(Mate 기능)으로 한정한다.

**이유:** `docs/PROJECT_SCOPE.md` §1 요약 항목(6~10번: Supabase 이메일 인증/성인 확인, 동행글 CRUD, 참가 요청, 차단·신고, 관리자 탭)과 §2 구현 방식 원칙이 Supabase의 역할을 이 두 축으로 한정한다. 콘텐츠(DEC-004)나 즐겨찾기(`localStorage`)는 Supabase를 거치지 않는다.

**영향:** 새로운 기능을 추가할 때 "Supabase에 테이블/RPC를 새로 만들면 되지 않을까"라는 판단을 기본값으로 삼지 않는다 — Auth/Mate 축에 속하지 않으면 우선 정적 데이터·클라이언트 상태로 처리 가능한지 먼저 검토한다.

---

## DEC-006 — DB는 6개 Table로 제한

**결정:** Supabase Postgres 스키마는 정확히 6개 테이블 — `user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting` — 로 제한한다.

**이유:** `docs/PROJECT_SCOPE.md` §2 "DB는 정확히 6개 테이블로 제한한다" 원칙과 이를 구현하는 `TASKS/TASK-DB-SCHEMA-BASE.md`/`TASK-DB-RLS-BASE.md`의 Forbidden 절("정의된 6개 테이블 외의 테이블을 추가하지 않는다. 여행지·안전정보·대표 소개·감사 로그용 테이블은 만들지 않는다")이 이를 명시한다.

**영향:** `scripts/audit_tasks.py`의 Check 12("DB Table 범위가 6개 기본 테이블을 크게 넘지 않음")가 이 결정을 지속 검증한다. 새 테이블이 필요하다고 판단되면 먼저 DEC-004/DEC-005 범위 재검토를 선행한다.

---

## DEC-007 — 항공·숙소 입력은 Browser Memory에만 유지

**결정:** 항공/숙소 조건 입력값(국가·지역·날짜 등)은 Client Component의 React state(브라우저 메모리)로만 유지하며, 서버(API/Server Action/DB), URL 쿼리, 로그 어디에도 저장·전송하지 않는다.

**이유:** REQ-FUNC-017/025, REQ-NF-017("항공·호텔 원시 입력값을 Client Component 상태로만 유지하고 서버 전송을 만들지 않는다")이 근거이며, `TASKS/00_TASK_LIST.md`의 관련 Task(예: `PAGE-SCR003`, 항공/숙소 폼 Component)에 동일한 AC가 반복 명시되어 있다.

**영향:** 요약 단계에서 "수정" 버튼으로 폼에 돌아가도 값이 유지되어야 하지만, 이는 같은 Client Component 트리 내 state 보존으로 충족하며 서버 왕복을 도입하지 않는다. `scripts/audit_tasks.py`의 Check 13("외부 입력 비저장 AC 존재")이 이 결정을 지속 검증한다.

---

## DEC-008 — Airbnb DESIGN.md는 vendor 참고본, D-001이 실제 정본

**결정:** `design-reference/vendor/airbnb/DESIGN.md`는 레이아웃 철학(여백, 카드 형태, 단일 액센트, 둥근 형태) 참고 전용 vendor 문서다. 실제 구현·디자인 작업의 단일 진실 공급원(SSOT)은 `design-reference/D-001/DESIGN.md`(Active Design Version: D-001, Status: LOCKED)뿐이다.

**이유:** `design-reference/DESIGN_MANIFEST.md`가 "Active Design Version: D-001", "Vendor Reference: `design-reference/vendor/airbnb/DESIGN.md`(레이아웃 철학 참고 전용 — 상표 요소 미사용)"으로 명시하며, "Active Design Version이 가리키는 버전만 구현·디자인 작업의 단일 진실 공급원(SSOT)이다"라고 규칙화한다.

**영향:** Airbnb 워드마크·Cereal VF 서체·Rausch `#ff385c` 정확 색상값·하트 저장 아이콘·"Guest favorite"/"NEW" 배지 등 상표적 요소는 어떤 Task에서도 재현하지 않는다(`DESIGN_MANIFEST.md` 금지 사항). D-001이 LOCKED 상태인 동안 토큰 값·Section 계약·Do/Do Not 규칙은 직접 수정하지 않고, 변경이 필요하면 D-002 신버전 발행 절차를 따른다.

**정정 기록(2026-10-08):** 재검증(`docs/STITCH_VALIDATION_REPORT.md`, 최종 판정 `STITCH_VALIDATION_NEEDS_HUMAN`)에서 Stitch 화면에 계획에 없던 요소(실시간 채팅, 매너온도, 특정 외부 업체명, 공공데이터 연동 링크)가 확인되어, 새 토큰·색상 없이 D-001 안에서 해당 허용 문구를 삭제하고 금지로 정정했다. 버전 번호는 올리지 않았고 `design-reference/DESIGN_MANIFEST.md` 이력 표에 정정 행으로 남겼다. 토큰 값·Section 계약을 바꾸는 변경은 여전히 D-002 발행 대상이다.

---

## DEC-009 — Playwright는 Chromium Smoke만 필수

**결정:** E2E 테스트는 Playwright의 **Chromium 프로젝트만** 필수로 구성한다(`E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH`). firefox/webkit 등 크로스 브라우저 프로젝트는 추가하지 않는다.

**이유:** `docs/PROJECT_SCOPE.md` §1 요약 항목 11("Playwright 핵심 Smoke Test")과 `TASKS/00_TASK_LIST.md`/`TASK-E2E-*.md`의 Forbidden 절("Chromium 외 브라우저 프로젝트(firefox/webkit)를 추가하지 않는다")이 근거다. 전체 매트릭스 크로스 브라우저 테스트는 "핵심 Smoke Test" 범위를 넘어선다.

**영향:** `playwright.config.ts`의 `projects`는 Chromium 하나만 등록한다. `scripts/audit_tasks.py`의 Check 15("Playwright Chromium Smoke Task 존재")가 이를 지속 검증하며, 다른 브라우저 언급이 있으면(부정문이 아닌 실사용 맥락) 실패로 처리한다.

---

## DEC-010 — 사용자의 개발 실행 단위는 Wave

**결정:** 사용자는 `TASKS/00_TASK_LIST.md`의 개별 Task를 하나씩 지시하지 않고, 여러 Task를 묶은 **Wave** 단위로 개발 실행을 지시한다. Wave는 이 프로젝트의 최상위 실행 단위이며, Task는 그 하위 단위다.

**이유:** 64개 Task를 개별적으로 순차 요청하는 것은 비효율적이며, Depends On 그래프(`scripts/audit_tasks.py` Check 3/4가 검증하는 의존성·순환 없음)상 서로 독립적이거나 선후 관계가 명확한 Task들을 하나의 실행 묶음으로 지시하는 편이 실제 작업 흐름과 맞다.

**영향:** Wave의 범위(포함 Task 목록, 순서)는 이 결정 시점에는 별도로 정의하지 않았다 — Wave 계획 문서(예: `TASKS/WAVE_PLAN.md` 등)가 필요해지면 그 시점에 별도 산출물로 정의한다. 이 결정은 실행 단위의 존재만 확정한다.

---

## DEC-011 — Single Agent가 Wave 내부 Task를 순차 수행

**결정:** 하나의 Wave 안에 포함된 Task들은 여러 Agent로 병렬 분담하지 않고, **단일 Agent(Single Agent)가 순차적으로** 수행한다.

**이유:** Task 간 Depends On 관계와 Expected Files 경계(Task별로 수정 가능한 파일이 명시적으로 한정됨)가 이미 순서를 강제하며, 동일 파일(`src/app/layout.tsx` 등 GLOBAL Task 산출물)에 여러 Task가 의존하는 구조상 병렬 수행 시 충돌 위험이 병렬화로 얻는 이득보다 크다고 판단한다.

**영향:** Wave 실행 시 Task 순서는 Depends On을 위상 정렬한 순서를 따르며, 각 Task 완료(Definition of Done 충족) 후 다음 Task로 넘어간다. 여러 Agent를 동시에 띄워 Task를 나눠 맡기지 않는다.

---

## DEC-012 — PR·Merge는 사용자가 수동 수행

**결정:** Pull Request 생성과 병합(Merge)은 Agent가 자동으로 수행하지 않고, **사용자가 직접 검토 후 수동으로** 수행한다.

**이유:** `docs/PROJECT_SCOPE.md` §3 "무인 자동 Merge Runner — 배포·병합은 수동 검토로 진행하며 자동 병합 자동화를 만들지 않는다" 제외 항목과 일관되게, 코드 변경의 최종 승인 권한은 사용자에게 있다. `REQ-NF-031`은 lint/build/test 통과를 병합 전 필수 조건으로 자동화할 뿐, 병합 행위 자체를 자동화하지 않는다.

**영향:** Agent는 브랜치 작업·커밋까지만 수행하고, `gh pr create`로 PR을 여는 것은 사용자가 명시적으로 요청했을 때만 수행하며, `gh pr merge`나 그에 준하는 병합 행위는 수행하지 않는다.

---

## DEC-013 — EC2·AWS는 사용하지 않음

**결정:** 인프라는 Vercel과 Supabase 두 곳만 사용하며, AWS 계정이나 EC2 인스턴스 등 별도 AWS 인프라를 두지 않는다.

**이유:** `docs/PROJECT_SCOPE.md` §3 "EC2·AWS 인프라 — Vercel과 Supabase만 사용하고 별도 AWS 인프라를 두지 않는다"와 REQ-NF-034("Vercel(무료/저비용 티어)과 Supabase만 사용하고 AWS/EC2 등 별도 인프라를 두지 않아 월 인프라 비용 목표를 자연 충족한다")가 근거다.

**영향:** `scripts/audit_tasks.py`의 Check 16("AWS·EC2·자동 Merge 구현 Task 0")이 이를 지속 검증한다. 배포 파이프라인(GitHub Actions)이나 Task 설계에서 AWS 리소스(S3, Lambda, ECS 등)를 전제하지 않는다.

---

## DEC-014 — 제외 기능은 EXCLUDED로 관리

**결정:** `docs/PROJECT_SCOPE.md`에서 IMPLEMENT로 분류되지 않은 요구사항은 별도로 삭제하거나 방치하지 않고, `TASKS/00_TASK_LIST.md`의 `## NON_IMPLEMENTATION` 표에 Requirement ID·원문 요약·제외 근거·후속 방향과 함께 **EXCLUDED**로 등록해 계속 추적한다.

**이유:** `docs/PROJECT_SCOPE.md`의 상태 정의 — "EXCLUDED: 만들지 않는다. 제외 이유를 기록한다." — 와, REQ-FUNC 80개+REQ-NF 34개 = 114개 요구사항 전수가 IMPLEMENT 또는 EXCLUDED로 커버되어야 한다는 원칙(구현 누락과 의도적 제외를 구분해야 함)이 근거다.

**영향:** 어떤 Requirement ID도 Task 표와 EXCLUDED 표 양쪽에 모두 없거나(누락) 양쪽에 동시에 있으면(모순) 안 된다 — `scripts/audit_tasks.py`의 Check 17/18이 이를 지속 검증한다. EXCLUDED 항목에 대응하는 구현 코드나 상세 Task 파일은 만들지 않는다.

---

## DEC-015 — 코랄 색상을 접근성 기준에 맞춰 D-002로 보정

**결정:** D-001 `color.coral` `#E85A34`는 글자·버튼 배경으로 쓰면 대비가 3.53:1(흰 배경)·3.27:1(`surface-soft`)로 WCAG AA(4.5:1)에 못 미친다. 같은 색상(hue)에서 밝기만 낮춘 `#C03A16`(hover `#A93313`)을 D-002로 발행해 글자·버튼에 쓰고, 원색 `#E85A34`는 장식 전용 토큰 `color.coral-accent`로 남긴다.

**이유:** REQ-NF-024는 Playwright axe 검사에서 serious/critical 위반 0건을 요구한다. `/`와 `/about`이 모두 `color-contrast`(serious)로 실패했고, 위반 지점은 전부 코랄 글자·코랄 배경 흰 글자였다. D-001은 LOCKED라 직접 수정하지 않고 새 버전(`design-reference/D-002/DESIGN.md`)으로 발행했다.

**영향:** `tailwind.config.ts`의 코랄 토큰 3개, 인라인 hex를 쓰던 컴포넌트(`MatePostCard`, 체크박스 `accent`)를 토큰으로 교체. `DESIGN_MANIFEST.md`의 이력과 Overlay를 갱신했다. 그 밖의 D-001 토큰과 Section 계약은 그대로다. CLAUDE.md의 `DESIGN_PATH`는 D-001로 유지하고 D-002는 Overlay로 취급한다.

