---
name: traveler-project-pipeline
description: Traveler PRD/SRS에서 Task를 생성·상세화·감사하고 5개 Screen과 Wave 개발을 지원하는 프로젝트 Skill
---

# Traveler Project Pipeline

This skill is the single source of truth for the **Task 생성 Pipeline** that turns the approved UI/UX contract (5 Screens) and the 114-requirement SRS into an implementable Next.js Task List + per-task detail files. `.claude/commands/gen-tasklist.md`, `.claude/commands/gen-task-details.md`, and `.claude/commands/audit-tasks.md` all defer to the rules, schemas, and taxonomy defined here. If a command's instructions and this skill ever disagree, this skill wins.

**이 파일은 실제 저장소 상태(2026-09-17 기준)를 기준으로 유지된다.** 과거에 존재했던 `tasks/TASK_LIST.json`(소문자, JSON) 스키마는 폐기되었다 — 실제 산출물은 아래 표의 대문자 `TASKS/` 경로다.

## Inputs (read-only — never edit these from this pipeline)

| Path | Role |
|---|---|
| `docs/06_SRS_UIUX_REVISED.md` | Requirement 원문, Priority, Screen/Route/Scope, Release Acceptance Criteria |
| `docs/UIUX_TRACEABILITY.md` | Requirement별 Implementation Status와 Screen/Route/Page Entry 연결(114행) |
| `docs/PROJECT_SCOPE.md` | IMPLEMENT vs EXCLUDED 분류, 구현 방식 원칙(정적 데이터, localStorage, Toast-not-email, 조회 시점 파생, 6-테이블 DB 범위, 관리자 범위 제한), 91/23/114 커버리지 총계(§6) |
| `design-reference/D-001/DESIGN.md` | LOCKED 디자인 토큰, Section 계약, 최소 콘텐츠 수, Empty State 규칙, Do/Do Not |
| `design-reference/UI_CONTRACT.md` | 화면별 Section 순서, Component 목록, 상태, 사용자 행동, 이동, Desktop/Mobile 규칙, 금지 기능 |
| `design-reference/SCREEN_ROUTE_CONTRACT.json` | **Screen 목록의 단일 소스**(Rule 2) — routes, page entries, tiers, technical_routes, required_navigation |
| `package.json`, 실제 `src/app/**` 트리 | 현재 실제 구현 상태 — 항상 실시간으로 확인하고 가정하지 않는다(Rule 4) |

`docs/UIUX_TRACEABILITY.md`는 Requirement별 Implementation Status(IMPLEMENT/EXCLUDED)와 Screen·Route 연결의 입력이며, `scripts/validate_inputs.py`가 114개 전수·중복·IMPLEMENT/EXCLUDED 합계를 `docs/PROJECT_SCOPE.md` §6 요약 표(80/70/10, 34/21/13, 114/91/23)와 교차검증한다. 이 Pipeline은 이 문서를 수정하지 않는다 — Task 열(`PENDING_TASK_GENERATION`)의 실제 Task ID 채우기는 별도 승인된 갱신 작업으로만 수행한다.

## Outputs (this pipeline owns and overwrites these)

| Path | Produced by |
|---|---|
| `TASKS/00_TASK_LIST.md` | `/gen-tasklist` (사람이 읽는 단일 정본 — Task Table + `## NON_IMPLEMENTATION` 표 + `## 커버리지 검증`) |
| `TASKS/TASK-<TASK-ID>.md` | `/gen-task-details` (`scripts/generate_task_details.py` 실행), Task List의 구현 Task 행과 1:1 |
| `TASKS/TASK_MANIFEST.csv` | `scripts/audit_tasks.py`(via `/audit-tasks` 또는 `/gen-task-details`의 마지막 단계) |
| `TASKS/TASK_AUDIT_REPORT.md` | `scripts/audit_tasks.py` — 18개 검사 결과 표 + 오류/경고 상세 + Result |
| `scripts/.validate_inputs_report.json` | `scripts/validate_inputs.py` |

---

## Skill 핵심 규칙 (binding — every command below must enforce these)

1. **HARNESS_SCHEMA는 `traveler-screen-route-v1`이다.** 모든 Command는 `design-reference/SCREEN_ROUTE_CONTRACT.json.schema_version`을 읽어 이 값과 다르면 중단한다.
2. **Screen 목록의 단일 소스는 `SCREEN_ROUTE_CONTRACT.json`이다.** `UI_CONTRACT.md` 산문이나 기억에서 Screen 목록을 손으로 옮기지 않는다 — 항상 `screens[]`를 JSON에서 파싱한다.
3. **정확히 5개 Screen → 정확히 5개 Page Owner Task**, `screens[].screen_id`(SCR-001~005)마다 하나씩. 더 많거나 적으면 안 된다.
4. **Expected Files는 실제 `src/app` 트리를 반영해야 한다.** 생성 시점에 Glob/Bash로 확인하고, 이 문서나 이전 실행 기억에서 가정하지 않는다. 파일이 이미 존재하면 "신규"가 아니라 그렇게 명시한다.
5. **Page Owner Task ≠ Component Task.** *Page Owner Task*는 한 Screen의 `page.tsx`를 조립한다(계약된 순서로 Section을 구성하고 상태를 연결해 최종 렌더). *Component Task*는 Page Owner가 소비하는 재사용 가능한 한 조각(카드, 폼, 탭 스위처, Drawer, 필터 바, 데이터/로직 모듈)을 만든다. Screen 전체를 하나의 "component" Task로 접지 않고, Component Task가 `page.tsx` 파일을 소유하지 않는다.
6. **Page Owner는 같은 Screen의 Component Task에 의존한다.** Page Owner Task의 Depends On은 그것이 조립하는 모든 Component Task를 포함해야 한다. 같은 Screen의 Component 의존성이 0건인 Page Owner는 감사에서 경고로만 처리한다(무조건 금지는 아님, 하지만 근거를 남긴다).
7. **`PAGE-SCR001`(SCR-001 Page Owner)은 "Next.js 스타터 제거" AC를 명시적으로 가져야 한다** — `create-next-app` 보일러플레이트(Next.js 로고, "To get started, edit the page.tsx file", Vercel/Docs 링크) 제거는 pass/fail AC 줄이지 암묵적 정리가 아니다.
8. **`PAGE-SCR003`(`/travel-tools` Owner)은 항공/숙소/동행 작성 3개 탭을 실제로 조립해야 한다** — 탭 전환 시 각 탭의 실제 폼/콘텐츠가 렌더되는지 AC에 명시한다(placeholder·"준비 중" 탭 금지).
9. **`PAGE-SCR005`(`/account` Owner)는 Guest/Member/Admin 상태를 실제로 조립해야 한다** — 역할에 없는 탭은 DOM에도 렌더링하지 않는 실제 역할 조건부 렌더링임을 AC에 명시한다.
10. **DB는 정확히 6개 테이블로 제한한다**: `user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`. 어떤 Task도 7번째 테이블을 도입하지 않는다. `audit_log`, `destination*`, `country_safety*`, `representative_profile*`, `media_asset*` 성격의 테이블은 명시적으로 금지한다.
11. **여행지·국가 안전정보·대표 소개는 정적 데이터 Task로만 만든다** — `src/data/destinations.ts`, `src/data/country-safety.ts`, `src/data/representative-profile.ts`(또는 동등물). DB 테이블이나 관리자 CRUD 화면을 만들지 않는다.
12. **항공·숙소 입력값은 서버·DB·URL·로그·분석으로 전송하지 않는다.** 이 폼/조립을 다루는 모든 Component/Page Owner Task는 이를 명시적 AC 또는 Forbidden 줄로 가진다(REQ-FUNC-017/025, REQ-NF-017).
13. **Playwright는 Chromium 전용 Smoke Task만 만든다.** 실제 Task List에는 여러 Test Task(`UNIT-TRAVEL-DATES`, `UNIT-CONTACT-DETECTION`, `UNIT-MATE-STATE`, `TEST-RLS-BASIC`, `E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH`)가 존재할 수 있으나, **모든 E2E Task는 `chromium` 프로젝트만 사용**하고 firefox/webkit 등 크로스 브라우저 프로젝트를 추가하지 않는다. axe-core 통합은 E2E Smoke Task에 포함한다(REQ-NF-024).
14. **다음 목적의 Task는 만들지 않는다**: 무인/자동 병합 또는 릴리스 자동화, EC2/AWS 인프라, 범용 CMS/감사 로그 콘솔, 실제 이메일 발송, `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 어떤 기능. 후보 Task가 EXCLUDED Requirement만을 위해 존재한다면 그 Task를 만들지 않고 EXCLUDED 등록부에 기록한다(Rule 16).
15. **114개 Requirement(`REQ-FUNC-001..080`, `REQ-NF-001..034`) 전수가 설명되어야 한다** — 각 Requirement ID는 다음 둘 중 정확히 하나에만 나타나야 한다: (a) 어떤 Task의 Requirement Ref 칸(IMPLEMENT류), 또는 (b) Task List의 `## NON_IMPLEMENTATION` 표(EXCLUDED류). 둘 다이거나 둘 다 아니면 안 된다.
16. **EXCLUDED Requirement는 상세 Task를 만들지 않지만 삭제하지도 않는다.** Task List를 재생성할 때마다 `## NON_IMPLEMENTATION` 표(Requirement ID + 원문 요약 + 근거 + 후속 방향)에 계속 등재한다.
17. **Task List 항목과 상세 파일은 1:1이다.** `TASKS/00_TASK_LIST.md`의 Task Table에 있는 모든 구현 Task ID는 정확히 하나의 `TASKS/TASK-<task_id>.md`를 가져야 하고, `TASKS/TASK-*.md` 아래의 모든 파일은 여전히 Task List에 있는 task_id에 대응해야 한다. 양방향 고아 파일 없음.
18. **`/gen-task-details`가 상세 파일 작성/갱신을 마치면 반드시 `python3 scripts/audit_tasks.py`를 실행**하고 결과를 보여준다 — 이번 산출물에 대해 감사를 최소 1회 실행하기 전에는 "완료"로 선언하지 않는다.
19. **Page Owner AC는 Screen의 Section 순서와 최소 콘텐츠 수를 `design-reference/D-001/DESIGN.md` §19 / `design-reference/UI_CONTRACT.md`에서 원문 그대로 가져와 명시해야 한다**(예: SCR-001 7개 Section, 국내 6장/해외 6장/동기 6~7개/안전정보 6장/동행 미리보기 3건; SCR-002 7개 Section, Timeline 6+/Footprints 30개국+/Gallery 8+/Favorite Places 4; SCR-003 6개 Section, Tip 3장, 탭 3개; SCR-004 6개 Section, 목록 최대 8장; SCR-005 역할별 탭 + 관리자 탭 정확히 2 섹션).
20. **Page Owner AC는 큰 빈 영역과 placeholder 문구를 금지해야 한다**, 모든 Empty State가 (a) 완결된 한국어 안내 문장, (b) 이용 방법 문장, (c) 다음 행동 CTA 세 요소를 포함하도록 요구한다(D-001 §20 반영). 이 세 요소 없이 "빈 상태 처리" 정도로만 적은 AC는 감사에 실패한다.

---

## CLAUDE.md와의 관계

루트 `CLAUDE.md`의 23개 전역 규칙과 Harness Marker가 우선한다. 이 Skill의 규칙은 그 규칙을 Task 생성·감사 관점에서 구체화한 것이며 충돌하지 않는다. 충돌처럼 보이는 경우 `CLAUDE.md`를 따르고 사용자에게 보고한다. Screen 목록은 `SCREEN_ROUTE_CONTRACT.json`, 디자인은 `design-reference/D-001/DESIGN.md`, 요구사항은 `docs/06_SRS_UIUX_REVISED.md`, 분류는 `docs/PROJECT_SCOPE.md`가 정본이다.

## 기본 Auth · 성인 · RLS 규칙

- **Auth**: Supabase 이메일 인증만 사용한다. 동행 쓰기 API는 진입 전에 서버에서 세션을 검증하고 비회원은 401로 차단한다(REQ-FUNC-027).
- **성인 확인**: `is_adult`(boolean)와 `adult_verified_at`만 저장하고 생년월일은 수집·저장하지 않는다(REQ-FUNC-028). 성인 확인이 없으면 동행 글 작성·참가 요청이 불가하다.
- **RLS**: 6개 테이블 모두 RLS를 활성화한다. 본인 글·요청, 요청 대상 작성자, Moderator/Admin만 비공개 데이터를 열람하며, 부정 접근은 403 또는 빈 결과여야 한다(REQ-FUNC-044, REQ-NF-013). Client 코드는 RLS가 적용되는 경로로만 접근한다.
- **키 분리**: `NEXT_PUBLIC_` 접두사가 없는 값(Service Role Key 포함)은 서버 전용이며 Client Component·브라우저 번들에서 사용하지 않는다.
- **쓰기 범위**: Supabase 쓰기는 Auth·동행·신고·차단·관리자 설정(외부 URL)으로 제한한다. 여행지·안전정보·대표 소개는 `src/data` 정적 데이터이며 DB에 쓰지 않는다.

## Wave 내부 순차 실행

- 사용자의 개발 실행 단위는 Wave이며 표준 명령은 `/run-wave WXX`다. Wave 밖의 임의 진입점으로 개발을 시작하지 않는다.
- 한 Agent가 Wave 안의 Task를 `Depends On` 순서로 **한 번에 하나씩** 구현한다. 여러 Task를 동시에 병렬로 건드리지 않는다.
- 각 Task는 `/prepare-task`(읽기 전용 사전 점검)를 통과한 뒤 `/implement-task`로 구현하고, 현재 Task의 Expected Files 밖 파일은 수정하지 않는다.
- Preview Checkpoint(Page Owner Task 완료 시점)에서 Wave를 멈추고, 사람의 Preview 확인 후에만 다음 화면 Wave로 진행한다.
- Branch·PR·Merge는 자동으로 만들지 않는다. PR은 사용자가 요청할 때만 만들고 Merge는 항상 사람이 수동으로 한다.

## EXCLUDED 보호

`docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 23개 Requirement는 구현하지 않는다. Task List의 `## NON_IMPLEMENTATION` 표에 계속 등재하며 삭제하지 않고, 상세 Task 파일도 만들지 않는다. 구현 중 EXCLUDED 기능이 필요해 보이면 구현하지 말고 사용자에게 보고한다. AWS·EC2 인프라, 자동 Merge Runner, 전체 콘텐츠 CMS, 외부 이메일 사업자 연동, 범용 감사 로그, 자동 백업·장애 알림도 만들지 않는다.

---

## Task Taxonomy (Category, `TASKS/00_TASK_LIST.md` 기준)

| Category | Meaning | Depends on | Typical `Expected Files` |
|---|---|---|---|
| `PAGE_OWNER` | 한 Screen의 `page.tsx` 조립 | 같은 Screen의 COMPONENT Task | `src/app/<route>/page.tsx` |
| `COMPONENT` | 재사용 가능한 UI 조각/훅/클라이언트 상태 모듈 | 그것이 읽는 DATA/API Task, GLOBAL 토큰 Task | `src/components/**`, `src/hooks/**` |
| `DATA` | 정적 `src/data` 콘텐츠 모듈(Rule 11) | 없음(또는 GLOBAL 타입 Task) | `src/data/**` |
| `DB` | Supabase 스키마/RLS/접근 레이어/시드 | `DB-SCHEMA-BASE` | `supabase/migrations/*.sql`, `supabase/seed.sql`, `src/lib/supabase/**` |
| `AUTH` | Supabase Auth 흐름, 세션 검증 | `DB-SCHEMA-BASE` | `src/app/auth/callback/route.ts`, `src/lib/auth/**` |
| `API` | Route Handler(Server Action 포함) | `DB-SCHEMA-BASE`, `DB-RLS-BASE`, `DB-ACCESS`, `AUTH-SETUP` | `src/app/api/**/route.ts` |
| `GLOBAL` | 전역 레이아웃, 토큰, SEO, a11y 프리미티브 | 없음 | `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.*` |
| `ROUTE` | not-found/error/정책 페이지 등 기술 Route | 없음 또는 `AUTH-SETUP` | `src/app/not-found.tsx`, `src/app/error.tsx`, 정책 `page.tsx` |
| `UNIT_TEST` | Vitest 단위 테스트 | 테스트 대상 로직을 만든 Task | `src/**/*.test.ts` |
| `INTEGRATION_TEST` | RLS 등 통합 테스트 | `DB-RLS-BASE` | `tests/**` |
| `E2E_TEST` | Playwright(Chromium) + axe Smoke | 검증하는 모든 `PAGE_OWNER` Task | `e2e/**`, `playwright.config.ts` |
| `RELEASE_CHECK` | 성능/접근성 수동 점검 체크리스트 | 관련 `PAGE_OWNER` Task | 문서/체크리스트 |
| `CI` | CI 파이프라인 | 없음 | `.github/workflows/**` |
| `DEPLOY` | Vercel env/deploy 설정 | `CI` | `vercel.json`/env 문서 |

### Task ID naming (실제 사용 규칙)

- Page Owner: `PAGE-<SCREEN_ID_NO_HYPHEN>` — 예: `PAGE-SCR001`, `PAGE-SCR002`, `PAGE-SCR003`, `PAGE-SCR004`, `PAGE-SCR005` (SCR과 숫자 사이 하이픈 없음)
- Component: `COMP-<SCREEN_ID_NO_HYPHEN>-<UPPER-KEBAB-NAME>` — 예: `COMP-SCR001-DESTINATION-CARD`; 여러 Screen이 공유하면 `COMP-SHARED-<NAME>` — 예: `COMP-SHARED-CTA-BANNER`
- Data: `DATA-DESTINATIONS`, `DATA-SAFETY`, `DATA-REPRESENTATIVE`
- DB: `DB-SCHEMA-BASE`, `DB-RLS-BASE`, `DB-ACCESS`, `DB-SEED-BASE`
- Auth: `AUTH-SETUP`
- API: `API-<UPPER-KEBAB-NAME>` — 예: `API-MATE-POSTS`, `API-MATE-APPLICATIONS`, `API-REPORTS-BLOCKS`, `API-ADMIN-OPERATIONS`
- Global: `GLOBAL-<UPPER-KEBAB-NAME>` — 예: `GLOBAL-DESIGN-TOKENS`, `GLOBAL-LAYOUT-NAV-FOOTER`, `GLOBAL-SEO-METADATA`, `GLOBAL-A11Y-TOAST`
- Route(기술): `ROUTE-<UPPER-KEBAB-NAME>`
- Test: `UNIT-<UPPER-KEBAB-NAME>`(예: `UNIT-TRAVEL-DATES`, `UNIT-CONTACT-DETECTION`, `UNIT-MATE-STATE`), `TEST-RLS-BASIC`, `E2E-<UPPER-KEBAB-NAME>`(예: `E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH`)
- Release/CI/Deploy: `RELEASE-*`, `CI-*`, `DEPLOY-*`

ID는 재생성 간에 안정적이어야 한다 — 한 번 부여된 task_id는 Screen/목적이 실질적으로 바뀌지 않는 한 재생성 시 이름을 바꾸지 않는다. Diff는 추가/삭제로 읽혀야지 churn으로 읽히면 안 된다.

---

## `TASKS/00_TASK_LIST.md` 형식

Markdown 문서, 3개 섹션:

1. **머리말** — 기반 문서, 선행 검사(`validate_inputs.py`) 결과, 실제 `src/app` 트리 확인 결과, `package.json` 확인 결과.
2. **요약** — Task 수(Category별), Implementation Status별 수, Requirement 커버리지 총계. Task 수 자체는 완료 조건이 아니라고 명시한다.
3. **`## Task Table`** — 열: `Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority`
4. **`## NON_IMPLEMENTATION`** — 열: `Requirement ID | 원문 요약 | 근거 | 후속 방향`. EXCLUDED Requirement 전수 등재.
5. **`## 커버리지 검증`** — IMPLEMENT 배정 수 + EXCLUDED 등재 수 = 114 확인.

## Task Detail File Schema (`TASKS/TASK-<TASK-ID>.md`)

14개 섹션 고정 순서:

```markdown
# <TASK-ID> — <제목>

| Field | Value |
|---|---|
| Category | ... |
| Implementation Status | ... |
| Priority | ... |
| Screen | ... |
| Route | ... |
| Page Entry | ... |
| Depends On | ... |
| Source | TASKS/00_TASK_LIST.md Seq <N> |

## Context
## Project Scope
## Requirement Ref
## Screen / Route / Page Entry
## Design Ref
## Depends On
## Expected Files
## Functional AC
## Visual AC
## Security/Privacy AC
## Test Cases
## Verify
## Definition of Done
## Forbidden
```

Page Owner Task는 Section 순서/최소 콘텐츠 수 AC(Rule 19), Empty State 3요소 AC(Rule 20), 그리고 SCR-001/003/005 전용 AC(Rule 7/8/9)를 Functional/Visual AC 안에 포함해야 한다. 모든 Task는 "Expected Files 목록 밖 파일을 생성·수정하지 않는다"와 "EXCLUDED Requirement에 대응하는 기능을 구현하지 않는다"를 Forbidden 절에 명시한다.

---

## 감사 (`scripts/audit_tasks.py`) — 18개 검사

`TASKS/00_TASK_LIST.md`, `TASKS/TASK-*.md`, `docs/PROJECT_SCOPE.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`만 입력으로 사용해 다음 18개 검사를 수행한다(번호는 `TASKS/TASK_AUDIT_REPORT.md`의 표 번호와 동일):

1. Task List 구현 ID와 상세 Task 파일 1:1
2. 중복 Task ID 0
3. Depends On 누락 0
4. Dependency Cycle 0
5. Screen 5개 모두 Page Owner 정확히 1개
6. Route·Page Entry·Expected Files 일치
7. Component-only Screen 0
8. SCR-001 Starter 제거 AC 존재
9. SCR-003 세 탭 조립 AC 존재
10. SCR-005 역할별 상태 조립 AC 존재
11. DB Schema·RLS·Access·Seed Task 존재
12. DB Table 범위가 6개 기본 테이블을 크게 넘지 않음
13. 외부 입력 비저장 AC 존재
14. Auth·성인·기본 RLS AC 존재
15. Playwright Chromium Smoke Task 존재
16. AWS·EC2·자동 Merge 구현 Task 0
17. REQ-FUNC 80개와 REQ-NF 34개가 Task 또는 EXCLUDED 표에 존재
18. EXCLUDED 상세 구현 파일이 생성되지 않음

출력: `TASKS/TASK_MANIFEST.csv`, `TASKS/TASK_AUDIT_REPORT.md`. 오류가 있으면 exit 1, 성공 시 `AUDIT_PASS` + 검사 수를 출력한다.

---

## Workflow

```
/gen-tasklist        → python3 scripts/validate_inputs.py 를 먼저 실행,
                        통과하면 TASKS/00_TASK_LIST.md를 (재)작성
/gen-task-details    → TASKS/00_TASK_LIST.md의 구현 Task마다 TASKS/TASK-<ID>.md를
                        작성/갱신(scripts/generate_task_details.py 또는 동등 절차),
                        마지막에 반드시 scripts/audit_tasks.py 실행(Rule 18)
/audit-tasks         → scripts/audit_tasks.py를 재생성 없이 그 자체로 실행
```

`src/app` 아래 코드가 바뀐 뒤 `/gen-tasklist`를 다시 실행하는 것은 정상이며 안전하다 — Expected Files 절은 항상 실시간 트리에서 새로고침해야 하고(Rule 4), 이전 실행에서 그대로 가져오면 안 된다.
