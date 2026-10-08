---
description: Pre-flight check for one Task before implementation starts — verifies Wave membership, dependencies, scope, and environment, but changes nothing.
---

# /prepare-task

Load the `traveler-project-pipeline` skill first — it defines the Task List/Task Detail schema, the 6-table DB cap, the flight/hotel non-transmission rule, and the EXCLUDED register this command checks against. Also honor the root `CLAUDE.md` rules (Harness Marker, Wave/Task execution order, Expected Files boundary).

**이 Command는 코드를 수정하지 않는다.** 파일을 쓰거나, 고치거나, 커밋하거나, git 상태를 바꾸는 어떤 동작도 하지 않는다 — 오직 읽고 판정만 한다. 검사에서 문제를 발견해도 이 Command 안에서 고치지 않는다; 판정과 이유만 보고한다.

## 입력

- `WAVE_ID` — 이번에 실행 중인 Wave 식별자(예: `W01`). 사용자가 제공한다.
- `TASK_ID` — 착수하려는 단일 Task ID(예: `PAGE-SCR001`). 사용자가 제공한다.
- 선택된 상세 Task 파일 — `TASKS/TASK-<TASK_ID>.md`. 이 Command가 직접 찾아 읽는다(사용자가 내용을 붙여넣을 필요 없음).

`WAVE_ID` 또는 `TASK_ID` 중 하나라도 없으면 검사를 시작하지 않고 즉시 `BLOCKED_INPUT`으로 응답한다.

## 검사 (8개, 아래 순서대로 전부 실행하고 결과를 모은다)

### 1. Working Tree 상태

```
git status --porcelain
```

출력이 비어 있지 않으면 어떤 파일이 staged/unstaged/untracked 상태인지 그대로 기록한다. 이 Task와 무관해 보이는 변경(다른 Task의 산출물, 이전 세션의 미커밋 작업)이라도 판단을 왜곡하지 않기 위해 검사는 실패로 표시한다 — 삭제/stash/커밋 등 어떤 조치도 이 Command 안에서 취하지 않는다.

### 2. Task가 현재 Wave에 포함되는지

- Wave의 Task 구성을 정의한 문서를 찾는다. 기본 소스는 `TASKS/WAVE_PLAN.md`(Wave별 Task 목록)이며, 같은 구성이 `TASKS/WAVE_STATE.json`의 `waves[].task_ids`에도 있다. 두 파일이 서로 다르면 이 검사를 실패로 기록하고 어느 쪽과 어느 쪽이 다른지 적는다. `TASKS/WAVE_<WAVE_ID>.md` 같은 다른 형태도 저장소에 실제로 있으면 함께 확인한다.
- 그런 문서가 아예 없다면, 이 검사를 통과로 처리할 수 없다 — Wave 범위가 어디에도 기록되어 있지 않으면 `TASK_ID`가 `WAVE_ID`에 속하는지 판정할 근거가 없기 때문이다. 이 경우 검사를 실패로 기록하고, 최종 판정에서 `BLOCKED_INPUT`의 근거로 사용한다(사용자에게 Wave 구성을 어디서 확인해야 하는지, 혹은 이번 호출에 Task 목록을 함께 제공해야 하는지 명확히 요청한다).
- Wave 정의 문서가 있다면 그 문서에서 `WAVE_ID`에 배정된 Task ID 목록을 읽고, `TASK_ID`가 그 목록에 있는지 확인한다.

### 3. Depends On 완료 여부

- `TASKS/TASK-<TASK_ID>.md`의 `Depends On` 절(과 머리글 표의 `Depends On` 값)을 읽는다.
- 각 선행 Task ID에 대해 완료 여부의 실제 증거를 확인한다 — 예를 들어 해당 Task의 Expected Files가 실제로 저장소에 존재하는지(Glob), 그리고 Definition of Done에 해당하는 검증(테스트/감사)이 통과 기록으로 남아 있는지. "아마 끝났을 것"이라고 가정하지 않는다.
- 하나라도 미완료(파일이 없거나, 명백히 스타터/placeholder 상태이거나, 검증 근거가 없음)면 실패로 기록하고 어떤 선행 Task가 걸림돌인지 구체적으로 적는다.

### 4. Expected Files

- `TASKS/TASK-<TASK_ID>.md`의 `Expected Files` 절을 읽는다.
- 나열된 각 경로에 대해 실제 저장소 상태(Glob/Bash)를 확인하고, 상세 파일의 "신규"/"기존 파일 수정" 표기가 실제 상태와 일치하는지 확인한다.
- 다른 아직 완료되지 않은 Task가 소유해야 할 경로가 이미 존재하며 충돌 가능성이 있는지(예: 다른 Task의 Expected Files와 겹치는 파일을 이 Task도 건드리게 되어 있는지) 확인한다.
- 목록과 실제 상태가 어긋나면(예: "신규"라고 적혀 있는데 이미 다른 목적의 파일이 그 경로에 존재) 실패로 기록한다.

### 5. SRS·Scope·Design·Screen Ref

- `TASKS/TASK-<TASK_ID>.md`의 Requirement Ref에 나열된 각 `REQ-FUNC-*`/`REQ-NF-*` ID가 `docs/06_SRS_UIUX_REVISED.md`와 `docs/PROJECT_SCOPE.md`에 실제로 존재하는지 확인한다.
- Design Ref에 인용된 절(예: `design-reference/D-001/DESIGN.md §19`)이 실제로 그 문서에 존재하는지 확인한다.
- Screen/Route/Page Entry가 `design-reference/SCREEN_ROUTE_CONTRACT.json`의 값과 정확히 일치하는지 확인한다.
- 어느 하나라도 존재하지 않거나 불일치하면 실패로 기록한다(참조가 끊어진 상태로 구현을 시작하지 않기 위함).

### 6. 필요한 환경변수 이름

- `TASKS/TASK-<TASK_ID>.md`의 Functional AC/Expected Files/Forbidden에서 요구하는 환경변수 이름을 뽑아낸다(예: `FLIGHT_OUTBOUND_URL`, `HOTEL_OUTBOUND_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 등 — `docs/ARCHITECTURE.md` §17의 목록과 대조한다).
- 그 이름들이 `docs/ARCHITECTURE.md`(또는 동등 문서)에 이미 문서화되어 있는지만 확인한다 — **값 자체는 절대 읽거나 출력하지 않는다.** `.env`/`.env.local` 파일의 내용을 열람하지 않는다(루트 CLAUDE.md의 보안 규칙).
- 이 Task가 요구하는 환경변수 이름이 어디에도 문서화되어 있지 않으면 실패로 기록한다. 문서화는 되어 있지만 로컬에 아직 설정되지 않았을 가능성은 차단 사유가 아니라 `READY_TO_IMPLEMENT` 응답의 "참고" 항목으로만 남긴다.

### 7. Secret 하드코딩 위험

- `TASKS/TASK-<TASK_ID>.md`의 Functional/Visual/Security AC와 Expected Files를 다시 읽어, 실제 키값·토큰·비밀번호를 코드나 커밋에 직접 적어 넣도록 요구하거나 암시하는 문구가 있는지 확인한다.
- Expected Files 목록에 `.env`, `.env.local`, `secrets/**` 등 비밀 파일이 포함되어 있지 않은지 확인한다 — 포함되어 있으면 이 Command 자체가 해당 파일들을 읽지 않은 채로 실패 사유만 기록한다.
- 위험이 있으면 실패로 기록하고 구체적으로 어느 문구/파일이 문제인지 적는다(수정은 하지 않는다).

### 8. EXCLUDED 범위 침범 여부

- `TASKS/00_TASK_LIST.md`의 `## NON_IMPLEMENTATION` 표를 읽는다.
- 이 Task의 Functional AC/Expected Files가 EXCLUDED로 등재된 Requirement에 대응하는 기능(예: 콘텐츠 CMS, 실제 이메일 발송, 범용 감사 로그, 제재 시스템, EC2/AWS 인프라, 자동 Merge)을 구현하도록 요구하는지 확인한다.
- 침범이 있으면 실패로 기록하고 어떤 EXCLUDED Requirement ID와 충돌하는지 적는다.

## 판정 (아래 우선순위로 하나만 최종 출력)

1. **`BLOCKED_INPUT`** — `WAVE_ID`/`TASK_ID` 누락, `TASKS/TASK-<TASK_ID>.md` 없음, 검사 2(Wave 소속 불명/불일치), 검사 4(Expected Files 불일치), 검사 5(SRS·Scope·Design·Screen 참조 깨짐), 검사 6(환경변수 이름 미문서화) 중 하나라도 실패.
2. **`BLOCKED_DIRTY_TREE`** — 검사 1 실패(Working Tree가 clean하지 않음). 위 1번에 해당하지 않을 때만 이 상태로 보고한다.
3. **`BLOCKED_DEPENDENCY`** — 검사 3 실패(Depends On 미완료). 위 1·2에 해당하지 않을 때만.
4. **`BLOCKED_SCOPE`** — 검사 7(Secret 하드코딩 위험) 또는 검사 8(EXCLUDED 범위 침범) 실패. 위 1~3에 해당하지 않을 때만.
5. **`READY_TO_IMPLEMENT`** — 8개 검사 전부 통과.

여러 검사가 동시에 실패해도 최종 출력은 위 우선순위에서 가장 앞선 상태 하나만 낸다. 다만 보고서에는 실패한 검사 전부를 빠짐없이 나열한다 — 최종 상태에 반영되지 않은 나머지 실패도 "추가로 발견된 문제"로 함께 보고해, 한 번 고치고 재실행했을 때 바로 다음 걸림돌이 나오지 않도록 한다.

## 출력 형식

```
WAVE_ID: <값>
TASK_ID: <값>

검사 결과:
1. Working Tree 상태        [PASS|FAIL] <근거>
2. Wave 포함 여부            [PASS|FAIL] <근거>
3. Depends On 완료 여부      [PASS|FAIL] <근거>
4. Expected Files           [PASS|FAIL] <근거>
5. SRS·Scope·Design·Screen Ref [PASS|FAIL] <근거>
6. 필요한 환경변수 이름       [PASS|FAIL] <근거>
7. Secret 하드코딩 위험      [PASS|FAIL] <근거>
8. EXCLUDED 범위 침범 여부    [PASS|FAIL] <근거>

최종 판정: READY_TO_IMPLEMENT | BLOCKED_INPUT | BLOCKED_DEPENDENCY | BLOCKED_DIRTY_TREE | BLOCKED_SCOPE
```

`READY_TO_IMPLEMENT`일 때도 이 Command는 구현을 시작하지 않는다 — 판정만 내리고 다음 행동(예: 실제 구현 작업 착수)은 사용자의 별도 지시를 기다린다.
