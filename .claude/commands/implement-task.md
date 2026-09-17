---
description: Implement exactly one Task that /prepare-task has certified READY_TO_IMPLEMENT — the only pipeline command that writes application code.
---

# /implement-task

Load the `traveler-project-pipeline` skill first — it defines the Task Detail schema (Expected Files, Functional/Visual/Security AC, Forbidden), the 6-table DB cap, the flight/hotel non-transmission rule, and the EXCLUDED register this command must not violate. Also honor the root `CLAUDE.md` rules (Harness Marker, Expected Files boundary, Page Owner scope, Chromium-only Playwright, no AWS/EC2/auto-merge, destructive Git commands).

이 Command는 이 Pipeline에서 **실제 애플리케이션 코드를 작성하는 유일한 단계**다. `/gen-tasklist`, `/gen-task-details`, `/audit-tasks`, `/prepare-task`는 모두 문서/판정만 다루고 코드를 만들지 않는다 — 그 경계를 여기서도 지킨다: 이 Command는 지금 지시받은 **Task 하나**의 Expected Files 안에서만 코드를 작성한다.

## 입력

- `WAVE_ID`, `TASK_ID` — `/prepare-task`와 동일한 두 값.
- `TASKS/TASK-<TASK_ID>.md` — 이 Command가 직접 읽는다.

## Procedure

### 0. 선행 조건 — `/prepare-task`가 READY_TO_IMPLEMENT를 낸 Task만 구현한다 (Rule 1)

- 이번 대화 안에서 같은 `WAVE_ID`/`TASK_ID`로 `/prepare-task`를 실행한 결과가 이미 있고 그 결과가 `READY_TO_IMPLEMENT`인지 확인한다.
- 그런 결과가 없거나, 있어도 `READY_TO_IMPLEMENT`가 아니거나, Working Tree/Depends On 상태가 그 사이 바뀌었을 수 있다고 판단되면(예: 마지막 `/prepare-task` 실행 이후 시간이 지났거나 다른 파일 변경이 있었던 것으로 보이면) **먼저 `/prepare-task`를 다시 실행**하고, 그 결과가 `READY_TO_IMPLEMENT`일 때만 아래 단계로 진행한다.
- `BLOCKED_*` 상태라면 이 Command는 구현을 시작하지 않고 그 판정과 이유를 그대로 사용자에게 보고한 뒤 종료한다.
- 한 번 호출에 **Task 하나만** 구현한다 — 같은 Wave의 다른 Task를 이어서 구현하지 않는다(Depends On 순서로 하나씩 진행하는 것은 CLAUDE.md 규칙이며, 다음 Task는 별도 `/prepare-task` → `/implement-task` 호출로 진행한다).

### 1. Expected Files 안에서 작업한다 (Rule 2)

- `TASKS/TASK-<TASK_ID>.md`의 Expected Files 절에 나열된 경로만 생성·수정한다.
- 목록에 없는 파일을 만들거나 고쳐야 할 필요를 느끼면(예: 공용 유틸이 없어서), 구현을 멈추고 그 사실을 사용자에게 보고한다 — Expected Files 목록을 이 Command가 스스로 확장하지 않는다.
- 목록에 있는 파일이 "신규"인지 "기존 파일 수정"인지는 상세 파일의 표기를 따르되, 실제 트리 상태와 다르면(예: "신규"라고 되어 있는데 이미 다른 내용의 파일이 있음) 작업 전에 사용자에게 알린다.

### 2. Functional·Visual·Security AC를 따른다 (Rule 3)

- `TASKS/TASK-<TASK_ID>.md`의 Functional AC, Visual AC, Security/Privacy AC를 전부 충족하도록 구현한다. AC에 없는 기능을 임의로 추가하지 않는다(과잉 구현 금지 — 특히 EXCLUDED Requirement에 해당하는 기능).
- Forbidden 절에 나열된 항목은 절대 하지 않는다(예: 항공/숙소 입력값을 서버·DB·URL·로그로 보내는 코드, 6개 테이블 밖 스키마 추가, Chromium 외 브라우저 프로젝트 추가).

### 3. Page Owner는 실제 Page Entry를 조립한다 (Rule 4)

- Category가 `PAGE_OWNER`인 Task는 Depends On에 나열된 기존 Component/Data/API 산출물을 가져와 해당 Screen의 Page Entry(`src/app/.../page.tsx`)에서 실제로 조립한다 — 새 Component/Data/API/DB Task를 이 자리에서 만들지 않는다(Skill Rule 5/9).
- `PAGE-SCR001`이면 `create-next-app` 스타터를 전량 제거했는지 diff로 직접 확인한다.
- `PAGE-SCR003`이면 항공/숙소/동행 작성 3개 탭이 각각 실제 콘텐츠를 렌더하는지 확인한다.
- `PAGE-SCR005`이면 Guest/Member/Admin 역할별 탭이 실제 조건부 렌더링으로 조립되어 있는지(역할에 없는 탭이 DOM에도 없는지) 확인한다.

### 4. 관련 Unit Test를 실행한다 (Rule 5)

- 이 Task가 만들거나 바꾼 로직에 대응하는 Vitest 단위 테스트가 있으면(이 Task 자신이 `UNIT_TEST` Category이거나, Depends On/같은 모듈에 대응하는 기존 테스트가 있으면) 실행하고 통과를 확인한다.
- 이 Task 때문에 새 Unit Test가 필요하다고 상세 파일의 Test Cases/Verify가 명시하면, 그 테스트도 이번 Task의 Expected Files 범위 안에서 작성한다.
- 단위 테스트가 실패하면 구현을 완료로 보고하지 않고, 실패 내용을 보고서에 그대로 남긴다.

### 5. Page Owner 또는 E2E Task일 때만 Playwright Smoke를 실행한다 (Rule 6)

- Category가 `PAGE_OWNER` 또는 `E2E_TEST`인 Task를 구현할 때만 관련 Playwright Chromium Smoke(`E2E-PUBLIC-SMOKE`/`E2E-TRAVEL-TOOLS`/`E2E-MATE-AUTH` 중 해당 Screen을 검증하는 것)를 실행한다.
- 그 외 Category(`COMPONENT`/`DATA`/`DB`/`AUTH`/`API`/`GLOBAL`/`ROUTE`/`UNIT_TEST` 등)를 구현할 때는 Playwright를 실행하지 않는다 — 불필요하게 전체 E2E를 매번 돌리지 않는다.
- Playwright 실행은 항상 `chromium` 프로젝트만 사용한다.

### 6. 금지 기능을 추가하지 않는다 (Rule 7)

- AWS·EC2 인프라, Prisma 등 ORM, 자동 Merge/자동 PR 병합 기능을 이 Task 구현 중 어떤 형태로도 추가하지 않는다 — Task의 AC가 이를 요구하는 것처럼 보이면(있을 수 없지만) 구현을 멈추고 사용자에게 확인한다.

### 7. 완료 후 보고한다 (Rule 8)

구현을 마치면(또는 BLOCKED로 중단하면) 다음을 사용자에게 보고한다:
- **변경 파일** — 실제로 생성/수정한 파일 목록(`git status --porcelain`/`git diff --stat` 결과 그대로).
- **검증** — 실행한 Unit Test 결과, (해당 시) Playwright 결과, 그 외 lint/typecheck 실행 여부와 결과.
- **제약** — Definition of Done 중 충족하지 못한 항목, 알려진 한계, 다음 Task가 착수 전 알아야 할 사항.

## Git 동작 — Commit·Push·PR

- **기본적으로 Commit·Push·PR 중 어느 것도 자동 수행하지 않는다.** 구현만 하고 Working Tree에 변경 사항을 남겨둔 채 보고로 마친다.
- **사용자가 명시적으로 요청한 경우에만** 이 Task의 변경분을 **Task 단위로 Commit**할 수 있다 — 이 Task의 Expected Files에 해당하는 변경만 스테이징하고, 다른 미완료 Task의 잔여 변경(있다면)은 함께 커밋하지 않는다.
- Commit을 하더라도 **Push와 PR 생성은 이 Command의 범위 밖이다** — 사용자가 Commit과 별개로 명시적으로 요청하지 않는 한 수행하지 않는다(루트 CLAUDE.md Rule 21, 자동 Merge 금지와 별개로 자동 Push/PR도 하지 않는다).
- destructive Git 명령(`reset --hard`, `push --force`, `checkout .`/`restore .`, `clean -f` 등)은 사용자가 명시적으로 요청하지 않는 한 사용하지 않는다.
