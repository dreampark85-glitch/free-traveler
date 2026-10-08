---
description: Orchestrate one Wave's Tasks end to end — select the next READY Task in dependency order, run prepare-task then implement-task, track state, and stop at Preview Checkpoints. No auto Branch/PR/Merge.
---

# /run-wave

Load the `prepare-task` and `implement-task` skills/commands before doing anything else — `/run-wave` does not duplicate their checks or their implementation logic, it only sequences them. It also follows the root `CLAUDE.md` rules (Rule 6: `/run-wave WXX`는 표준 개발 명령; Rule 7: Wave 내부 Task는 Depends On 순서로 한 번에 하나만; Rule 22: 사람의 Preview 확인 후 다음 Wave로 진행).

**이 Command는 Branch 생성, PR 생성, Merge를 자동으로 수행하지 않는다.** 어떤 하위 단계에서도 이 세 가지를 하지 않는다 — 코드 구현과 상태 갱신만 한다.

## 지원 명령

- `/run-wave WXX` — 지정된 Wave를 순차 실행한다(아래 "동작" 참고).
- `/run-wave status` — 아무것도 실행하지 않고 `TASKS/WAVE_STATE.json`(와 `TASKS/WAVE_PLAN.md`)를 읽어 모든 Wave/Task의 현재 상태를 보고한다.
- `/run-wave resume` — `TASKS/WAVE_STATE.json`에서 마지막으로 `IN_PROGRESS`/`WAITING_FOR_PREVIEW`였던 Wave를 찾아, 마지막으로 처리한 지점부터 그 Wave를 이어서 실행한다(사람이 Preview를 확인했거나 중단 사유가 해소되었다고 판단한 경우 사용).
- `/run-wave dry-run WXX` — 실제 구현 없이 이번에 실행되었을 순서와 각 Task의 `/prepare-task` 판정만 보고한다(아래 "dry-run" 참고).

## 상태 파일

이 Command가 유일하게 쓰기(write)를 수행하는 대상은 `TASKS/WAVE_STATE.json`뿐이다(애플리케이션 코드는 `/implement-task`가 쓴다).

- **`TASKS/WAVE_PLAN.md`** — Wave별 Task 구성과 Preview Checkpoint를 정의하는 문서. 이 Command는 이 파일을 **읽기만** 한다. 파일이 없으면 Wave를 지어내지 않고 즉시 중단해, 사용자에게 `python3 scripts/build_waves.py` 실행 또는 Wave 구성 제공을 요청한다. 형식:

  ```markdown
  ## W03 — <제목>
  - Tasks: DB-RLS-BASE, DB-SEED-BASE, AUTH-SETUP, ...
  - Preview Checkpoint: PAGE-SCR001  <!-- 이 Task가 DONE되면 사람 Preview 전까지 Wave를 멈춘다 -->
  ```

- **`TASKS/WAVE_STATE.json`** — 이 Command가 실행마다 갱신하는 진행 상태(`schema_version: traveler-wave-state-v1`). `scripts/build_waves.py`가 초기본을 만든다. Wave 항목의 기존 필드는 그대로 두고 Task 단위 상태만 추가한다.

  ```json
  {
    "wave_id": "W03",
    "title": "...",
    "task_ids": ["DB-RLS-BASE", "AUTH-SETUP"],
    "status": "pending",
    "checkpoint_required": false,
    "checkpoint_result": null,
    "task_status": { "DB-RLS-BASE": "done", "AUTH-SETUP": "ready" }
  }
  ```

  `task_status`가 없으면 첫 실행 때 `task_ids` 전체를 만들되, 각 Task를 `00_TASK_LIST.md`의 Depends On 기준으로 `pending`/`ready`로 초기화한다.
  JSON에는 소문자 snake_case 값으로 기록하고, 보고에서는 대문자 이름으로 표기한다.
  - Task 상태: `pending`(PENDING, Depends On 미충족) / `ready`(READY, 충족·미착수) / `in_progress`(IN_PROGRESS, 구현 중 — 비정상 종료 감지용) / `done`(DONE, 구현 완료 + 검증 PASS) / `blocked`(BLOCKED, `/prepare-task`가 `BLOCKED_*`를 반환해 사람 개입 필요)
  - Wave 상태(`status`): `pending`(NOT_STARTED) / `in_progress` / `blocked` / `completed`(DONE). Preview 대기(WAITING_FOR_PREVIEW)는 별도 상태값이 아니라 `status: in_progress` + `checkpoint_result: "waiting_for_preview"`로 기록한다.
  - Preview 확인 후 재개하면 `checkpoint_result`에 확인 결과(예: `"approved"`)를 기록한다.
  - **주의:** `build_waves.py`를 진행 중에 다시 실행하면 상태가 초기화될 수 있다. 진행 기록이 있으면 먼저 사용자에게 확인한다.

## `/run-wave WXX` 동작

1. **`TASKS/WAVE_PLAN.md`와 `TASKS/WAVE_STATE.json`를 읽는다.** 둘 다 실제로 파싱해 이번 Wave(`WXX`)에 속한 Task 목록, 각 Task의 현재 상태, Preview Checkpoint 지정 여부를 파악한다. `WAVE_STATE.json`가 없으면 위 형식으로 초기화한다.

2. **현재 Wave의 READY Task를 Depends On 순서로 하나 선택한다.** `TASKS/00_TASK_LIST.md`의 Depends On 그래프를 위상 정렬해, 이 Wave 안에서 `READY` 상태이며 선행 Task가 전부 `DONE`인 Task 중 가장 앞선 것 하나만 고른다. 여러 Task가 동시에 조건을 만족해도 **하나만** 고른다 — 병렬로 고르지 않는다(CLAUDE.md Rule 7).

3. **`/prepare-task WXX <TASK_ID>`의 규칙으로 검사한다.** 실제로 그 판정 절차(Working Tree, Wave 소속, Depends On, Expected Files, SRS·Scope·Design·Screen Ref, 환경변수 이름, Secret 위험, EXCLUDED 침범)를 실행한다.
   - `READY_TO_IMPLEMENT`가 아니면(`BLOCKED_INPUT`/`BLOCKED_DEPENDENCY`/`BLOCKED_DIRTY_TREE`/`BLOCKED_SCOPE`), **이 Task를 건너뛰고 다른 Task로 넘어가지 않는다** — Depends On 순서를 깨뜨릴 수 있기 때문이다. 즉시 루프를 멈추고, 해당 Task를 `TASKS/WAVE_STATE.json`에 `BLOCKED`로 기록한 뒤, 판정과 이유를 그대로 사용자에게 보고하고 종료한다.

4. **`/implement-task WXX <TASK_ID>`의 규칙으로 Task 하나를 구현한다.** 시작 직전에 `TASKS/WAVE_STATE.json`에서 해당 Task를 `IN_PROGRESS`로 표시한다. Expected Files 경계, AC 준수, Page Owner 조립 규칙, Unit Test, (해당 시) Playwright, 금지 기능 제약을 그대로 적용한다.

5. **관련 검증이 PASS하면 Task 상태를 `DONE`으로 갱신한다.** Unit Test(및 해당 시 Playwright)가 전부 통과했을 때만 `TASKS/WAVE_STATE.json`에서 그 Task를 `DONE`으로 바꾼다. 검증이 하나라도 실패하면 `IN_PROGRESS`로 남겨두고(또는 실패 원인이 명확하면 `BLOCKED`로 바꾸고) 루프를 멈추고 실패 내용을 보고한 뒤 종료한다 — 검증 실패를 무시하고 다음 Task로 넘어가지 않는다.

6. **같은 Wave의 다음 READY Task를 계속 처리한다.** 5번까지 문제없이 끝났고, 방금 완료한 Task가 Preview Checkpoint가 아니면 2번으로 돌아가 다음 Task를 선택한다.

7. **Wave의 모든 Task가 `DONE`이면 종료한다.** `TASKS/WAVE_STATE.json`에서 Wave 전체 상태를 `DONE`으로 표시하고, 완료된 Task 목록과 각 Task의 검증 결과 요약을 사용자에게 보고한다. 다음 Wave를 자동으로 이어서 실행하지 않는다.

8. **사람 Preview Checkpoint가 있으면 `WAITING_FOR_PREVIEW`로 종료한다.** 방금 `DONE`으로 바뀐 Task가 `TASKS/WAVE_PLAN.md`에 Preview Checkpoint로 지정되어 있으면(전형적으로 Page Owner Task), 이 Wave에 아직 `READY`/`PENDING` Task가 남아 있어도 여기서 루프를 멈춘다. `TASKS/WAVE_STATE.json`에서 Wave 상태를 `WAITING_FOR_PREVIEW`로 표시하고, 사람이 실제 화면(Preview)을 확인해야 한다고 명시적으로 보고한 뒤 종료한다. 사람이 확인 후 계속을 지시하면(`/run-wave resume` 또는 같은 `WXX`로 다시 `/run-wave` 호출) 2번부터 재개한다.

## `/run-wave status`

- 아무 Task도 실행하지 않는다. `TASKS/WAVE_PLAN.md`와 `TASKS/WAVE_STATE.json`를 읽고, Wave별로 전체 상태(`NOT_STARTED`/`IN_PROGRESS`/`WAITING_FOR_PREVIEW`/`DONE`/`BLOCKED`)와 Task별 상태 표를 그대로 보고한다.
- 파일이 없으면 "아직 어떤 Wave도 시작되지 않았다"고 명확히 보고한다 — 상태를 지어내지 않는다.

## `/run-wave resume`

- `TASKS/WAVE_STATE.json`에서 상태가 `IN_PROGRESS` 또는 `WAITING_FOR_PREVIEW`인 Wave를 찾는다. 없으면 "재개할 Wave가 없다"고 보고하고 종료한다. 여러 개 있으면 사용자에게 어느 Wave를 재개할지 확인한다(임의로 하나를 고르지 않는다).
- `IN_PROGRESS` 상태에서 재개하는 경우, `IN_PROGRESS`로 표시된 Task가 남아 있으면(직전 실행이 비정상 종료됐을 가능성) 그 Task부터 `/prepare-task`를 다시 실행해 현재 상태를 재확인한 뒤 이어간다 — 완료 여부를 가정하지 않는다.
- `WAITING_FOR_PREVIEW` 상태에서 재개하는 경우, 사람이 Preview를 확인했다는 전제로 위 "동작" 2번부터 재개한다.
- 이후 절차는 `/run-wave WXX`의 2~8번과 동일하다.

## `/run-wave dry-run WXX`

- **Task를 구현하지 않는다.** 코드/파일을 전혀 만들거나 고치지 않는다.
- 1~3번 동작(`WAVE_PLAN`/`WAVE_STATE` 읽기 → 다음 READY Task 선택 → `/prepare-task` 판정)만 반복해, 이번에 `/run-wave WXX`를 실제로 실행했다면 어떤 순서로 Task가 처리되고 각 Task에서 `/prepare-task`가 어떤 판정을 낼지 미리 보여준다.
- `BLOCKED_*` 판정이 나오는 Task를 만나면 그 지점에서 dry-run 시뮬레이션도 멈춘다(실제 실행에서도 거기서 멈출 것이므로) — 그 이후 순서는 "이 Task가 먼저 풀려야 확인 가능"이라고만 보고한다.
- `TASKS/WAVE_STATE.json`를 갱신하지 않는다.

## 공통 제약

- 자동 Branch 생성, 자동 PR 생성, 자동 Merge는 이 Command의 어떤 하위 단계에도 포함하지 않는다. Commit 여부는 각 Task 구현 단계에서 `/implement-task`의 규칙(기본적으로 자동 수행하지 않고, 사용자가 요청하면 Task 단위 Commit까지만)을 그대로 따른다 — `/run-wave`가 여러 Task의 Commit을 한꺼번에 묶거나 자동화하지 않는다.
- 한 번에 Task 하나만 구현한다는 원칙은 `/run-wave` 전체에서 예외 없이 지킨다 — 여러 Task를 동시에 진행하거나 병렬 Agent로 나누지 않는다.
