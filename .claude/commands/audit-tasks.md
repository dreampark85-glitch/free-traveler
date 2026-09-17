---
description: Run scripts/audit_tasks.py standalone against the current TASKS/00_TASK_LIST.md and TASKS/TASK-*.md, and report the result.
---

# /audit-tasks

Load the `traveler-project-pipeline` skill first — it defines what each of the 18 audit checks means and which binding rule it enforces. This command only reports; it does not regenerate or fix anything.

독립 실행 Command — `/gen-tasklist`나 `/gen-task-details` 없이 언제든 사용 가능하다(예: 상세 Task 파일을 수동으로 고친 뒤, 또는 작업 재개 전 현재 상태를 확인할 때). 구현 코드는 만들지 않는다.

## Procedure

1. **실제 파일을 읽는다** — `TASKS/00_TASK_LIST.md`와 `TASKS/TASK-*.md`가 실제로 존재하는지 먼저 확인한다. `TASKS/00_TASK_LIST.md`가 없으면 스크립트를 실행하지 않고 사용자에게 `/gen-tasklist`(그다음 `/gen-task-details`)를 먼저 실행하라고 안내한다. 감사 결과를 지어내지 않는다.

2. **감사를 실행한다.**
   ```
   python3 scripts/audit_tasks.py
   ```
   이 스크립트는 `TASKS/00_TASK_LIST.md`, `TASKS/TASK-*.md`, `docs/PROJECT_SCOPE.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`만 입력으로 사용해 18개 검사를 수행하고, `TASKS/TASK_MANIFEST.csv`와 `TASKS/TASK_AUDIT_REPORT.md`를 다시 쓴다.

3. **`TASKS/TASK_AUDIT_REPORT.md`를 실제로 읽고** 사용자에게 다음을 요약해 보고한다:
   - `AUDIT_PASS` 또는 `AUDIT_FAIL`, 그리고 18개 중 통과한 검사 수.
   - 실패한 검사마다: 검사 번호·이름(예: "#12 DB Table 범위가 6개 기본 테이블을 크게 넘지 않음")과 구체적 오류 내용. `.claude/skills/traveler-project-pipeline/SKILL.md`의 어느 Rule을 위반하는지 함께 적는다.
   - 경고는 차단 사유는 아니지만 판단이 필요한 항목으로 별도로 알린다(예: 같은 Screen Component 의존이 0건인 Page Owner).

4. **이 Command에서는 아무것도 스스로 고치지 않는다.** `/audit-tasks`는 보고만 한다 — **실패를 무시하거나 "사소하다"고 판단해 넘어가지 않는다.** 수정이 필요하면 `/gen-task-details`(마지막에 다시 감사함)를 다시 실행하거나, 수동 수정 후 `/audit-tasks`를 재실행하라고 사용자에게 안내한다.

5. **`AUDIT_PASS`라도 그것이 코드 정확성을 증명하지 않는다고 명시한다** — 18개 검사는 Task List/상세 파일 구조가 파이프라인 규칙(1:1 매핑, 순환 없음, Requirement 커버리지, DB 테이블 상한, 금지 키워드, Page Owner AC 완전성 등)을 지키는지만 검증한다. 실제 구현의 정확성은 각 Task의 Test Cases/Verify 절과, 이후 실제 Vitest/Playwright 실행으로 확인된다.

6. **exit code를 그대로 존중한다** — 스크립트가 non-zero로 종료하면(즉 `AUDIT_FAIL`이거나 Task List 자체를 파싱하지 못한 경우) 이 Command도 실패로 보고를 마친다. exit code가 0이 아닌 것을 성공으로 재해석하거나, 실패를 사용자에게 알리지 않고 넘어가지 않는다.
