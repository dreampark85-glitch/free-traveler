---
description: Final read-only release gate — checks Task/Wave completion, the 5 Page Owners, CI, Playwright Smoke, Supabase schema/RLS record, Vercel Preview Checkpoint, and the EXCLUDED register.
---

# /release-check

Load the `traveler-project-pipeline` and `run-wave` skills first — this command reads the same artifacts they define (`TASKS/00_TASK_LIST.md`, `TASKS/TASK-*.md`, `TASKS/WAVE_PLAN.md`/`TASKS/WAVE_STATE.md`) and does not redefine their schemas. Also honor the root `CLAUDE.md` rules.

**이 Command는 읽기 전용이다.** 배포하지 않고, Merge하지 않고, 어떤 파일도 만들거나 고치지 않는다 — 오직 이미 존재하는 산출물·기록을 확인해 판정만 낸다. 검사에서 문제를 발견해도 여기서 고치지 않는다.

## 검사 (7개, 전부 실행하고 결과를 모은다)

### 1. Task·Wave 상태

- `TASKS/WAVE_PLAN.md`/`TASKS/WAVE_STATE.md`를 실제로 읽어, 릴리스 대상 범위의 모든 Wave가 `DONE` 상태인지 확인한다. `WAITING_FOR_PREVIEW`나 `BLOCKED` 상태로 남은 Wave가 하나라도 있으면 실패로 기록한다.
- `TASKS/00_TASK_LIST.md`의 Task Table에 있는 구현 Task 중 `WAVE_STATE.md`에서 `DONE`이 아닌 것이 있으면 그 Task ID를 구체적으로 나열한다.
- Wave 관련 파일 자체가 없으면(아직 어떤 Wave도 실행되지 않았으면) 이 검사는 실패이며, 그 사실을 그대로 보고한다 — "Wave가 없으니 통과"로 처리하지 않는다.

### 2. 5개 Page Owner DONE

- `PAGE-SCR001`, `PAGE-SCR002`, `PAGE-SCR003`, `PAGE-SCR004`, `PAGE-SCR005` 5개 전부가 `TASKS/WAVE_STATE.md`에서 `DONE`인지 확인한다.
- `python3 scripts/audit_tasks.py`를 실행(또는 최신 `TASKS/TASK_AUDIT_REPORT.md`를 실제로 읽어)해 Check 5(Screen 5개 모두 Page Owner 정확히 1개), Check 6(Route·Page Entry·Expected Files 일치), Check 8/9/10(SCR-001 Starter 제거 / SCR-003 세 탭 조립 / SCR-005 역할별 상태 조립 AC 존재)이 PASS인지 확인한다.
- 하나라도 `DONE`이 아니거나 관련 감사 Check가 FAIL이면 실패로 기록한다.

### 3. CI PASS

- 저장소의 CI 설정(GitHub Actions 워크플로)이 실제로 존재하는지 확인하고, `gh run list --limit 5`(또는 동등 명령)로 main 브랜치 기준 최신 실행 결과를 실제로 조회한다.
- 최신 실행이 성공(lint/typecheck/build/Vitest 통과)이 아니면 실패로 기록하고, 어떤 Job이 실패했는지 적는다.
- CI 자체가 아직 구성되지 않았으면(`CI-*` Task가 미완료) 그 사실을 실패로 기록한다 — CI가 없다고 통과로 넘기지 않는다.

### 4. Playwright Smoke PASS

- `E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH` 3개 Task가 `TASKS/WAVE_STATE.md`에서 `DONE`인지 확인한다.
- 가장 최근 Playwright 실행 결과(테스트 리포트 파일 또는 CI 로그)를 실제로 확인해 Chromium 프로젝트에서 전부 PASS했는지 확인한다 — "Task가 DONE이니 통과했을 것"이라고 가정하지 않고 실행 기록 자체를 확인한다.
- axe-core 통합 검사(REQ-NF-024)에서 serious/critical 위반이 0건인지도 같은 리포트에서 확인한다.
- 리포트를 찾을 수 없으면 실패로 기록한다.

### 5. Supabase 6개 Table·기본 RLS 확인 기록

- `supabase/migrations/0001_base_schema.sql`, `supabase/migrations/0002_rls_policies.sql`이 실제로 존재하고, 스키마에 정의된 테이블이 정확히 `user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting` 6개인지 확인한다(`scripts/audit_tasks.py` Check 11/12와 동일 기준).
- `DB-SCHEMA-BASE`, `DB-RLS-BASE`, `DB-ACCESS`, `DB-SEED-BASE`, `TEST-RLS-BASIC` 5개 Task가 `TASKS/WAVE_STATE.md`에서 `DONE`인지 확인한다.
- `TEST-RLS-BASIC`의 실행 기록(역할별 403/빈 결과 확인 결과)이 실제로 남아 있는지 확인한다 — 스키마 파일만 있고 RLS 검증 기록이 없으면 실패로 기록한다.

### 6. Vercel Preview Checkpoint

- `TASKS/WAVE_STATE.md`의 각 Wave에 `WAITING_FOR_PREVIEW`로 걸렸던 이력이 있다면, 그 Preview Checkpoint가 실제로 사람의 확인을 거쳐 다음 단계로 넘어갔다는 기록(재개 시점의 상태 갱신, 또는 사용자가 확인했다고 남긴 메모)이 있는지 확인한다.
- 최신 Vercel Preview 배포가 실제로 존재하는지 확인한다(예: PR에 연결된 Preview URL, 또는 `vercel ls`/`vercel inspect` 결과 — Vercel CLI가 설치되어 있지 않으면 그 사실을 그대로 보고하고 이 항목을 실패로 기록한다. 값을 추측하지 않는다).
- Preview Checkpoint가 하나라도 사람 확인 기록 없이 건너뛰어졌으면 실패로 기록한다.

### 7. EXCLUDED 목록

- `TASKS/00_TASK_LIST.md`의 `## NON_IMPLEMENTATION` 표가 `docs/PROJECT_SCOPE.md` §6 요약(REQ-FUNC 10건 + REQ-NF 13건 = 23건 EXCLUDED)과 수·내용이 일치하는지 확인한다.
- `scripts/audit_tasks.py`의 Check 17(REQ-FUNC 80개/REQ-NF 34개 전수가 Task 또는 EXCLUDED 표에 존재)과 Check 18(EXCLUDED 상세 구현 파일 미생성)이 PASS인지 확인한다.
- EXCLUDED로 등록된 Requirement에 대응하는 기능이 실제 코드나 Task 상태에 몰래 들어와 있지 않은지(예: 제재 시스템, 콘텐츠 CMS, 실제 이메일 발송, EC2/AWS, 자동 Merge 관련 파일)도 확인한다. Check 16(AWS·EC2·자동 Merge 구현 Task 0)이 PASS인지 함께 확인한다.

## 판정

- **`RELEASE_READY`** — 7개 검사 전부 통과.
- **`RELEASE_BLOCKED`** — 7개 검사 중 하나라도 실패. 어느 검사가 왜 실패했는지 전부 나열하고(하나만 골라 보고하지 않는다), 다음 재확인 전 무엇이 먼저 해결되어야 하는지 명시한다.

## 출력 형식

```
검사 결과:
1. Task·Wave 상태                       [PASS|FAIL] <근거>
2. 5개 Page Owner DONE                  [PASS|FAIL] <근거>
3. CI PASS                              [PASS|FAIL] <근거>
4. Playwright Smoke PASS                [PASS|FAIL] <근거>
5. Supabase 6개 Table·기본 RLS 확인 기록 [PASS|FAIL] <근거>
6. Vercel Preview Checkpoint            [PASS|FAIL] <근거>
7. EXCLUDED 목록                        [PASS|FAIL] <근거>

최종 판정: RELEASE_READY | RELEASE_BLOCKED
```

`RELEASE_READY`가 나와도 이 Command는 배포·태그·Merge 등 어떤 후속 행동도 자동으로 수행하지 않는다 — 판정만 보고하고 다음 행동은 사용자의 별도 지시를 기다린다.
