---
description: Generate/update TASKS/TASK-<TASK-ID>.md for every implementation task in TASKS/00_TASK_LIST.md, then run the audit.
---

# /gen-task-details

Load the `traveler-project-pipeline` skill first — it defines the 14-section Task Detail File Schema and the Page Owner–specific Acceptance Criteria requirements (Rules 7, 8, 9, 19, 20) this command must satisfy for every detail file it writes.

이 Command는 상세 명세 **문서**만 만든다 — Task가 기술하는 실제 구현 코드(`src/**`, `supabase/**` 등)는 작성하지 않는다.

## Procedure

1. **Task List가 있어야 한다.** `TASKS/00_TASK_LIST.md`가 없으면 중단하고 사용자에게 `/gen-tasklist`를 먼저 실행하라고 안내한다 — 여기서 Task를 새로 지어내지 않는다.

2. **실제 파일 트리를 다시 확인한다**(Rule 4) — 각 Task의 Expected Files에 대해 `src/app/**`, `src/components/**`, `src/data/**`, `src/hooks/**`, `src/app/api/**`, `supabase/**`를 지금 Glob/Bash로 확인한다. 각 상세 파일에 해당 경로가 신규인지 기존 파일 수정인지 명확히 적는다 — 이전 실행 기록만 믿고 "신규"라고 가정하지 않는다.

3. **`TASKS/00_TASK_LIST.md`의 Task Table을 실제로 파싱**해 모든 구현 Task 행(Seq/Task ID/제목/Category/Implementation Status/Requirement Ref/Screen/Route/Page Entry/Depends On/Expected Files/Functional AC/Visual AC/Security-Privacy AC/Verify/Priority)을 읽는다. `## NON_IMPLEMENTATION` 표의 EXCLUDED Requirement는 상세 파일을 만들지 않는다(Rule 16).

4. **파싱 직후 구조 검증**: 중복 Task ID, 필수 열이 비어있는 행, 존재하지 않는 Task를 가리키는 Depends On이 있으면 중단하고 사용자에게 보고한다 — 구조가 깨진 Task List로 상세 파일을 만들지 않는다.

5. **구현 Task마다 `TASKS/TASK-<task_id>.md`를 작성/갱신**한다. 스킬의 14개 섹션 순서(Context, Project Scope, Requirement Ref, Screen/Route/Page Entry, Design Ref, Depends On, Expected Files, Functional AC, Visual AC, Security/Privacy AC, Test Cases, Verify, Definition of Done, Forbidden)를 그대로 따른다. Task List의 해당 행 값을 그대로 인용하고 지어내지 않는다.

6. **Page Owner Task(`PAGE-SCR001`~`PAGE-SCR005`)는 추가로 다음을 `design-reference/D-001/DESIGN.md` §19·§20과 `design-reference/UI_CONTRACT.md`에서 원문 그대로 가져와 포함한다:**
   - Section 순서와 Section별 최소 콘텐츠 수(Rule 19).
   - 모든 Empty State가 완결된 안내 문장 + 이용 방법 + CTA 3요소를 포함해야 한다는 AC, 큰 빈 영역·placeholder 문구 금지(Rule 20).
   - **`PAGE-SCR001`만**: `create-next-app` 스타터(로고, "To get started" 문구, Deploy Now/Docs 링크) 전량 제거 AC(Rule 7).
   - **`PAGE-SCR003`만**: 항공/숙소/동행 작성 3개 탭이 실제로 조립되어 실제 콘텐츠를 렌더한다는 AC(Rule 8), 항공/숙소 입력값 서버·DB·URL 미전송 제약을 Forbidden에 재기술(Rule 12).
   - **`PAGE-SCR005`만**: Guest/Member/Admin 상태가 실제 역할 조건부 렌더링으로 조립된다는 AC(Rule 9).

7. **그 외 Task도 구체적이고 검증 가능한 AC를 갖는다** — "컴포넌트를 구현한다" 같은 모호한 문장은 쓰지 않는다. Rule 10/11/12/13/14가 관련될 때마다 Forbidden 절에 명시한다(DB Task는 6-테이블 상한 재기술, 항공/숙소 폼 관련 Component는 비전송 규칙 재기술, E2E Task는 Chromium 전용임을 명시).

8. **감사를 실행한다 — 이 단계는 필수이며 생략할 수 없다(Rule 18, "Task Audit 실패를 무시하지 않는다"):**
   ```
   python3 scripts/audit_tasks.py
   ```
   결과(`AUDIT_PASS`/`AUDIT_FAIL`, 통과한 검사 수, 오류/경고 목록)를 사용자에게 그대로 보여준다. `AUDIT_FAIL`이면 지적된 상세 파일(또는 구조적 문제면 Task List)을 고치고 재실행해 통과시키거나, 이 Command 범위를 벗어나는 판단(예: 공유 Component의 소유 Screen을 누가 가질지)이 필요하면 남은 실패를 사용자에게 명확히 넘긴다. **`AUDIT_FAIL` 상태를 그대로 두고 "완료"라고 보고하지 않는다.**

9. `python3 scripts/audit_tasks.py`가 이번 산출물에 대해 최소 1회 실행되고 그 결과(통과 또는 남은 실패 목록)가 사용자에게 보고되기 전까지는 파이프라인을 "완료"로 선언하지 않는다.
