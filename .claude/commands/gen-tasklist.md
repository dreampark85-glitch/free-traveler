---
description: Generate/regenerate TASKS/00_TASK_LIST.md for the Free Traveler implementation from the approved 5-Screen contract.
---

# /gen-tasklist

Load the `traveler-project-pipeline` skill before doing anything else — it defines the Task Taxonomy, ID naming scheme, `TASKS/00_TASK_LIST.md` format, and the 20 binding rules this command must follow. Everything below is the *procedure*; the skill is the *authority* on rule content. If the skill and this file ever disagree, the skill wins.

이 Command는 산출물을 **작성만** 한다 — 애플리케이션 구현 코드(`src/**`의 실제 컴포넌트/API/DB 코드)는 만들지 않는다. Task List가 어떤 파일을 "만들어야 한다"고 기술하는 것과, 이 Command가 그 파일을 실제로 만드는 것은 다르다. 후자는 하지 않는다.

## Procedure

1. **Run the precondition gate.**
   ```
   python3 scripts/validate_inputs.py
   ```
   실패(non-zero exit)하면 즉시 중단하고 blocking error를 사용자에게 보고한다 — 불일치한 입력으로 Task List를 만들지 않는다. 경고(예: "SCR-001에 아직 스타터 콘텐츠 존재")는 정보성이며 차단하지 않는다 — 해당 Task의 AC로 반영한다.

2. **Screen 소스를 실제로 로드한다.** `design-reference/SCREEN_ROUTE_CONTRACT.json`을 직접 읽는다(기억이나 이전 실행 결과를 신뢰하지 않는다). `schema_version == "traveler-screen-route-v1"`(Rule 1)과 정확히 5개 Screen(Rule 3)을 확인한다.

3. **Requirement 소스를 실제로 로드한다.** `docs/06_SRS_UIUX_REVISED.md`에서 요구사항 원문·Priority를, `docs/PROJECT_SCOPE.md`에서 각 `REQ-FUNC-001..080`/`REQ-NF-001..034`의 IMPLEMENT/EXCLUDED 분류와 처리 방법을 실제로 읽는다. Requirement 전수는 숫자 범위(FUNC 80개 + NF 34개 = 114개)로 직접 구성한다.

4. **Section/Component 계약을 실제로 로드한다.** `design-reference/UI_CONTRACT.md`에서 화면별 Section 순서·Component 목록·상태·사용자 행동·이동·금지 기능을 읽는다. `design-reference/D-001/DESIGN.md` §19/§20에서 Section 순서·최소 콘텐츠 수·Empty State 규칙을 원문 그대로 인용할 수 있도록 읽는다.

5. **실제 파일 트리를 확인한다**(Rule 4) — Glob/Bash로 `src/app/**`, `package.json`을 지금 직접 확인한다(기억으로 대체하지 않는다). 5개 Page Entry 중 이미 존재하는 것, `src/app/page.tsx`에 스타터 마커가 남아있는지 확인한다.

6. **Task를 도출한다** — 스킬의 Task Taxonomy와 ID 명명 규칙을 그대로 따른다:
   - Screen마다 정확히 1개 `PAGE_OWNER` Task(`PAGE-SCR001`~`PAGE-SCR005`), 조립하는 모든 `COMPONENT` Task를 Depends On에 포함(Rule 6).
   - `UI_CONTRACT.md`의 "주요 Component" 목록에 이름 붙은 재사용 조각마다 `COMPONENT` Task 1개. 2개 이상 Screen이 공유하면 `COMP-SHARED-*` 하나로 통합.
   - 여행지/안전정보/대표 소개마다 정확히 1개씩 총 3개 `DATA` Task(Rule 11) — 절대 DB Task로 만들지 않는다.
   - `DB` Task는 6개 테이블 범위 내에서 `DB-SCHEMA-BASE`/`DB-RLS-BASE`/`DB-ACCESS`/`DB-SEED-BASE`로 구성(Rule 10).
   - `AUTH-SETUP` 1개, `API-*` Task는 `SCREEN_ROUTE_CONTRACT.json.technical_routes`의 API Route 그룹 수만큼.
   - `GLOBAL` Task로 공용 레이아웃/토큰/SEO/a11y.
   - `ROUTE` Task로 not-found/error/정책 페이지.
   - `UNIT_TEST`/`INTEGRATION_TEST`/`E2E_TEST` Task — E2E는 Chromium 전용만(Rule 13), 크로스 브라우저나 화면별 중복 E2E Task를 만들지 않는다.
   - `CI`/`DEPLOY` Task는 `docs/PROJECT_SCOPE.md` §1 항목 11–12에 대응하는 범위만 — auto-merge/EC2/AWS Task는 절대 만들지 않는다(Rule 14).
   - EXCLUDED Requirement만을 위한 Task는 만들지 않는다(Rule 14/16).

7. **모든 Requirement를 배정한다.** 3단계에서 구성한 114개 ID를 전부 순회한다:
   - IMPLEMENT류 → 해당 Task의 Requirement Ref 칸에 배정.
   - EXCLUDED → `## NON_IMPLEMENTATION` 표에 `Requirement ID | 원문 요약 | 근거 | 후속 방향`으로 기록하고 어떤 Task에도 배정하지 않는다.
   - 모든 ID는 정확히 한 곳에만 존재해야 한다(Rule 15).

8. **`TASKS/00_TASK_LIST.md`만 작성한다.** 스킬의 형식(머리말 → 요약 → `## Task Table` → `## NON_IMPLEMENTATION` → `## 커버리지 검증`)을 따른다. `TASKS/` 디렉터리가 없으면 생성한다.

9. **사용자에게 보고한다**: Category별 Task 수, 5개 Page Owner Task의 Screen/Route, Requirement 커버리지(IMPLEMENT 배정 수 + EXCLUDED 등재 수 = 114). 누락된 Requirement ID가 있으면 완료로 보고하지 않는다. Task 개수 자체(예상 45~65개)는 완료 조건이 아님을 명시한다.

10. **이 Command는 `TASKS/TASK-*.md`를 만들지 않는다** — 그것은 `/gen-task-details`의 역할이다. 다음 단계로 그것을 실행하라고 안내한다. 구현 코드(`src/**` 실제 파일)도 만들지 않는다.

11. **Task Audit 실패를 무시하지 않는다.** 이 Command는 Task List만 작성하므로 감사(`scripts/audit_tasks.py`)는 `/gen-task-details`의 마지막 단계에서 실행된다. 그 감사가 `AUDIT_FAIL`이면 원인이 Task List에 있는지 확인하고(예: Depends On 누락, Requirement 미배정, Page Owner 수 오류), 이 Command의 산출물을 고쳐 다시 실행한다. `/audit-tasks`를 직접 실행해 현재 상태를 확인할 수도 있다. 실패를 사소하다고 판단해 넘기거나 "완료"로 보고하지 않는다.
