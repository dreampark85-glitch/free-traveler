---
description: Orchestrate one Wave's Tasks end to end — prepare then implement pending Tasks one at a time in dependency order, run per-Task minimum checks, and stop at Browser Checkpoints. Options --status, --dry-run, --resume. No auto Commit/Push/PR/Merge.
---

# /run-wave

Load the `prepare-task` and `implement-task` skills/commands before doing anything else — `/run-wave` does not duplicate their checks or their implementation logic, it only sequences them. It also follows the root `CLAUDE.md` rules (Rule 6: `/run-wave WXX`는 표준 개발 명령; Rule 7: Wave 내부 Task는 Depends On 순서로 한 번에 하나만; Rule 22: 사람의 Preview 확인 후 다음 Wave로 진행).

**이 Command는 자동 Commit, Push, Branch 생성, PR 생성, Merge를 하지 않는다.** 어떤 하위 단계에서도 하지 않는다 — 코드 구현과 상태 갱신만 한다.

## 입력

```
/run-wave <WAVE_ID> [--status | --dry-run | --resume]
```

- `WAVE_ID` — `TASKS/WAVE_PLAN.md`에 실제로 존재하는 Wave ID(예: `W07`). ID는 `build_waves.py`가 만든 값이 정본이며 추측하지 않는다. 없거나 존재하지 않으면 시작하지 않고 `WAVE_PLAN.md`에 있는 ID 목록을 보여준 뒤 종료한다.
- 옵션은 하나만 줄 수 있다. 옵션이 없으면 기본 실행이다. (구형 표기 `/run-wave status`, `/run-wave resume`, `/run-wave dry-run WXX`도 같은 뜻으로 받는다. `--status`만 `WAVE_ID` 없이 쓰면 전체 Wave를 보여준다.)

| 옵션 | 동작 |
|---|---|
| `--status` | 현재 Wave와 Task 상태만 보여준다. 아무것도 실행·수정하지 않는다. |
| `--dry-run` | 실행할 Task·파일·검증·Checkpoint만 보여주고 아무것도 수정하지 않는다. |
| (없음) | `pending` Task를 한 개씩 prepare하고 implement한다. |
| `--resume` | 첫 `pending` 또는 `blocked` Task부터(또는 `in_progress`로 남은 Task부터) 다시 시작한다. |

## 상태 파일

이 Command가 쓰기(write)를 수행하는 파일은 `TASKS/WAVE_STATE.json`뿐이다. 단 Browser Checkpoint 승인을 사람이 알려 준 경우에 한해 `docs/preview-checks/SCR-00N.md`도 기록한다(아래 "Browser Checkpoint"). 애플리케이션 코드는 `/implement-task`가 쓴다.

- **`TASKS/WAVE_PLAN.md`** — Wave별 Task 구성과 Preview Checkpoint를 정의한다. **읽기만** 한다. 없으면 Wave를 지어내지 않고 중단해 `python scripts/build_waves.py` 실행을 요청한다.

  ```markdown
  ## W09 — <제목>
  - Tasks: PAGE-SCR001
  - Preview Checkpoint: PAGE-SCR001  <!-- 이 Task가 done이면 사람의 Browser 확인 전까지 Wave를 완료하지 않는다 -->
  ```

- **`TASKS/WAVE_STATE.json`** — 진행 상태(`schema_version: traveler-wave-state-v1`). `scripts/build_waves.py`가 초기본을 만들고 이 Command가 갱신한다. Wave 항목의 기존 필드(`wave_id`, `title`, `task_ids`, `status`, `checkpoint_required`, `checkpoint_result`)는 그대로 두고 `task_status`만 추가한다.

  ```json
  {
    "wave_id": "W07",
    "title": "...",
    "task_ids": ["COMP-SCR002-STAT-CARD", "PAGE-SCR002"],
    "status": "in_progress",
    "checkpoint_required": true,
    "checkpoint_result": null,
    "task_status": { "COMP-SCR002-STAT-CARD": "done", "PAGE-SCR002": "pending" }
  }
  ```

  - `task_status`가 없으면 `task_ids` 전체를 `pending`으로 만든다.
  - Task 상태: `pending` / `in_progress`(구현 중 — 비정상 종료 감지용) / `done`(구현 + 최소 검증 PASS) / `blocked`(`/prepare-task`가 `BLOCKED_*`를 냈거나 검증 실패로 사람 개입 필요).
  - Wave 상태(`status`): `pending` / `in_progress` / `blocked` / `completed`. 사람의 확인 대기는 `status: in_progress` + `checkpoint_result: "waiting_for_preview"`로 기록하고, 승인되면 `"approved"`로 바꾼다.
  - JSON에는 소문자 값으로 기록하고 보고에서는 대문자로 표기해도 된다.
  - **주의:** `build_waves.py`는 진행 기록이 있으면 `--force` 없이는 덮어쓰지 않는다. 진행 중인 상태를 `--force`로 지우려면 먼저 사용자에게 확인한다.

## 시작 전 확인 (기본 실행·`--resume`·`--dry-run` 공통)

1. `TASKS/WAVE_PLAN.md`와 `TASKS/WAVE_STATE.json`를 실제로 읽고, 둘의 Wave ID·Task 목록이 일치하는지 확인한다(`python scripts/check_waves.py`). 불일치하면 중단한다.
2. **이전 Wave가 `completed`가 아니면 시작하지 않는다.** `WAVE_STATE.json`의 순서상 바로 앞 Wave들이 모두 `completed`여야 한다. 아니면 어떤 Wave가 미완료인지 알려 주고 종료한다(`--status`는 예외 — 항상 볼 수 있다).
3. 이 Wave가 이미 `completed`이면 할 일이 없다고 보고하고 종료한다.

## 기본 실행: `/run-wave WXX`

`pending` Task를 **한 번에 하나씩, Depends On 순서로** 처리한다(Wave 안의 Task ID 순서는 `task_ids` 배열 순서를 따르되 선행 Task가 먼저 `done`이어야 한다).

1. **다음 Task 선택.** `task_status`가 `pending`이고 Depends On이 모두 `done`(이전 Wave의 Task 포함)인 Task 중 `task_ids`에서 가장 앞선 하나만 고른다. 병렬로 고르지 않는다(Rule 7).
2. **`/prepare-task WXX <TASK_ID>` 규칙으로 검사한다.** 8개 검사를 실제로 수행한다.
   - `READY_TO_IMPLEMENT`가 아니면 이 Task를 건너뛰지 않는다. Task를 `blocked`로 기록하고 **Wave도 `status: blocked`로 기록한 뒤** 판정과 이유를 보고하고 멈춘다(규칙 2).
3. **구현.** Task를 `in_progress`로 표시하고 `/implement-task WXX <TASK_ID>` 규칙으로 구현한다. Expected Files 밖은 수정하지 않는다.
4. **Task별 최소 검증을 실행한다**(규칙 3). 아래 표의 명령을 실제로 실행하고 결과를 기록한다. 이 Task의 상세 파일 `Verify` 절에 적힌 명령이 있으면 그것도 실행한다.

   | Task Category | 최소 검증 |
   |---|---|
   | `GLOBAL`, `COMPONENT`, `DATA`, `ROUTE`, `AUTH` | `npm run lint` · `npm run typecheck` · `npm run format:check` · `npm run test:unit` |
   | `API`, `DB` | 위와 동일 + Verify 절의 마이그레이션/RLS 확인 명령 |
   | `PAGE_OWNER` | 위와 동일 + `npm run build` + `python scripts/check_screen_contract.py --mode=plan` + (Page Entry가 생겼으므로) 해당 화면 Page 파일 존재 확인 |
   | `UNIT_TEST`, `INTEGRATION_TEST` | `npm run test:unit`(통합은 Verify 절 명령) + `npm run lint` · `npm run typecheck` |
   | `E2E_TEST` | `npx playwright test --project=chromium <해당 spec>` + `npm run lint` · `npm run typecheck` (인증 환경변수가 없어 skip된 테스트는 skip으로 보고하고 PASS로 세지 않는다) |
   | `CI`, `DEPLOY`, `RELEASE_CHECK` | Verify 절 명령 + `npm run lint` · `npm run typecheck` |

   검증이 하나라도 실패하면 Task를 `in_progress`로 두거나(원인이 명확하면 `blocked`) 멈추고 실패 출력을 보고한다. 실패를 무시하고 다음 Task로 넘어가지 않는다. 실행하지 못한 검증은 "미실행"으로 적고 통과로 세지 않는다.
5. **통과하면 Task를 `done`으로 기록**하고 다음 Task(1번)로 돌아간다.
6. **Page Owner를 `done`으로 만든 순간 멈춘다**(아래 "Browser Checkpoint"). Wave에 남은 Task가 있어도 이어가지 않는다.
7. **Wave의 모든 Task가 `done`이고 Browser Checkpoint가 필요 없거나 승인되었으면** Wave를 `completed`로 기록하고 종료 보고를 낸다. **다음 Wave를 자동으로 실행하지 않는다**(규칙 5).

## Browser Checkpoint

`checkpoint_required: true`인 Wave(Page Owner가 있는 Wave)는 사람이 실제 브라우저로 화면을 확인해야 한다(규칙 4).

- Page Owner가 `done`이 되면 Wave를 `status: in_progress`, `checkpoint_result: "waiting_for_preview"`로 기록하고 멈춘다. 보고에 확인할 화면 Route, 확인 항목(해당 화면 `UI_CONTRACT.md` Section·상태, Desktop 1440/Mobile 390), 실행 방법(`npm run dev` 후 해당 Route 열기, 또는 Vercel Preview URL)을 적는다.
- 사람이 "확인 완료"를 명시적으로 알려 주면(`--resume`으로 다시 호출하거나 대화에서 승인) `checkpoint_result`를 `"approved"`로 바꾸고, 사람이 알려 준 확인 내용을 `docs/preview-checks/<SCR-ID>.md`에 날짜와 함께 그대로 기록한 뒤 Wave를 `completed`로 바꾼다. **사람의 승인 없이 이 값을 바꾸거나 문서를 만들지 않는다.** 수정 요청이 있으면 `rejected`로 기록하고 해당 Task를 `pending`으로 돌려 사유를 보고한다.
- 사람의 확인 전에는 다음 Wave가 시작되지 않는다(시작 전 확인 2번이 막는다).

## `--resume`

- Wave에서 `in_progress`로 남은 Task가 있으면(직전 실행이 비정상 종료됐을 수 있다) 그 Task부터 `/prepare-task`를 다시 실행해 현재 상태를 재확인한 뒤 이어간다. 완료 여부를 가정하지 않는다.
- 그렇지 않으면 `task_ids`에서 첫 `pending` 또는 `blocked` Task부터 시작한다. `blocked` Task는 먼저 `/prepare-task`를 다시 돌려 원인이 해소되었는지 확인하고, 아직 `BLOCKED_*`이면 그대로 멈춘다. 해소되었으면 Wave `blocked`를 `in_progress`로 되돌리고 진행한다.
- `checkpoint_result: "waiting_for_preview"` 상태이면 먼저 사람의 승인 여부를 확인한다. 승인 전이면 "확인 대기 중"이라고 보고하고 종료한다.
- 이후 절차는 기본 실행과 같다.

## `--status`

- 아무것도 실행하거나 수정하지 않는다. 지정한 Wave(또는 전체)의 Wave 상태, Task별 상태 표, Checkpoint 상태(`waiting_for_preview`/`approved`/없음), 다음에 실행할 Task를 보고한다.
- `TASKS/WAVE_STATE.json`가 없으면 "아직 어떤 Wave도 시작되지 않았다"고 보고한다. 상태를 지어내지 않는다.

## `--dry-run`

- **코드·문서·`WAVE_STATE.json` 어느 것도 만들거나 고치지 않는다.**
- 이번에 실행하면 처리될 `pending` Task를 순서대로 나열하고, Task마다 다음을 보여준다: Task ID, Expected Files(신규/수정), 실행할 최소 검증 명령, `/prepare-task`가 낼 판정(8개 검사를 읽기 전용으로 평가), Browser Checkpoint 여부.
- `BLOCKED_*` 판정이 나오는 Task에서 시뮬레이션을 멈추고, 그 뒤 Task는 "이 Task가 먼저 풀려야 확인 가능"이라고만 적는다.
- 시작 전 확인(이전 Wave `completed` 등)에 걸리면 그 사실도 그대로 보고한다.

## 종료 보고 (기본 실행·`--resume`)

실행이 끝나거나 멈출 때마다 아래를 빠짐없이 보고한다.

- **완료 Task** — 이번 실행에서 `done`이 된 Task ID. 멈춘 경우 멈춘 Task와 판정/실패 이유.
- **변경 파일** — 이번 실행에서 실제로 바뀐 파일 목록(`git status --short`로 확인; `WAVE_STATE.json` 포함).
- **통과한 검사** — 실행한 명령과 결과(PASS/FAIL/미실행/skip). 실행하지 않은 검증을 통과로 쓰지 않는다.
- **남은 수동 Browser 확인** — 확인이 필요한 화면 Route와 항목. 없으면 "없음".
- **다음에 입력할 명령** — 상황별로 하나만 제시한다. 예: Browser 확인 대기 중이면 확인 후 `/run-wave WXX --resume`, Wave가 `completed`이면 다음 Wave의 `/run-wave W(XX+1)`, `blocked`이면 원인 해소 후 `/run-wave WXX --resume`.

커밋은 하지 않았으며 필요하면 사용자가 직접 요청해야 한다고 한 줄 덧붙인다.

## 공통 제약

- 자동 Commit, Push, Branch 생성, PR 생성, Merge는 이 Command의 어떤 하위 단계에도 없다(규칙 6). Commit은 사용자가 명시적으로 요청했을 때 `/implement-task`의 규칙(Task 단위)으로만 한다.
- 한 번에 Task 하나만 구현한다는 원칙은 예외 없이 지킨다 — 여러 Task를 동시에 진행하거나 병렬 Agent로 나누지 않는다.
- 사람의 확인 전에 다음 Wave를 시작하지 않는다(규칙 5).
