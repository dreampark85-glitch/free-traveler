# PROJECT_STATE — Free Traveler

- **Document ID:** STATE-TRAVEL-001
- **목적:** 이 프로젝트의 "지금 어디까지 왔는가"를 한 곳에서 확인하는 살아있는 상태 문서다. `/run-wave`, `/prepare-task`, `/implement-task`, `/release-check`가 실행될 때마다 해당 필드를 최신 상태로 갱신한다. 이 문서 자체는 판정을 내리지 않는다 — 판정은 각 Command(`AUDIT_PASS`/`READY_TO_IMPLEMENT`/`RELEASE_READY` 등)의 몫이고, 이 문서는 그 결과를 요약해 보관한다.
- **최종 갱신:** 2026-09-17 — 파이프라인 문서/Task 산출물만 완료된 초기 상태(구현 미착수).

---

| 필드 | 값 |
|---|---|
| Harness Schema | `traveler-screen-route-v1` (`design-reference/SCREEN_ROUTE_CONTRACT.json.schema_version`과 일치 확인됨) |
| Design Version | D-001 (`design-reference/DESIGN_MANIFEST.md` 기준 `Status: LOCKED`) |
| Scope Mode | `docs/PROJECT_SCOPE.md` 기준 — REQ-FUNC 80(IMPLEMENT 70/EXCLUDED 10) + REQ-NF 34(IMPLEMENT 21/EXCLUDED 13) = 114(IMPLEMENT 91/EXCLUDED 23) |
| Current Wave | (없음) — `TASKS/WAVE_PLAN.md`가 아직 생성되지 않아 어떤 Wave도 시작되지 않았다 |
| Current Task | (없음) — 착수된 Task 없음 |
| Completed Tasks | 0 / 64 (구현 Task 64개 중 `DONE` 0개 — `TASKS/00_TASK_LIST.md`의 Task Table 기준 총수) |
| Blocked Tasks | (없음) |
| Latest CI | 미구성 — `.github/workflows/`가 저장소에 없음(`CI-LINT-TYPECHECK-TEST`류 Task 미착수) |
| Supabase State | 미프로비저닝 — `supabase/` 디렉터리 없음, `DB-SCHEMA-BASE`/`DB-RLS-BASE`/`DB-ACCESS`/`DB-SEED-BASE` 전부 미착수. 6개 Table(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`) 스키마 미생성 |
| Vercel Preview URL | (없음) — Vercel CLI 미설치, 배포 이력 없음 |
| Screen Checkpoints | 아래 표 참고 |
| Playwright State | 미구성 — `@playwright/test` 미설치(`package.json` 확인 결과), `E2E-PUBLIC-SMOKE`/`E2E-TRAVEL-TOOLS`/`E2E-MATE-AUTH` 전부 미착수 |
| Deferred Items | `TASKS/00_TASK_LIST.md`의 `## NON_IMPLEMENTATION` 표 23건(EXCLUDED) — CMS, 미디어 업로드 승인, 범용 감사 로그, 자동 백업/장애 알림/부하 테스트, 외부 이메일 연동, EC2/AWS, 무인 자동 Merge 등. 상세 근거는 그 표와 `docs/PROJECT_SCOPE.md` §3 참고 |
| Next Action | `TASKS/WAVE_PLAN.md` 작성(Wave 구성 확정) → 첫 Wave에 대해 `/run-wave W01` 실행 |

## Screen Checkpoints

| Screen | Route | 상태 |
|---|---|---|
| SCR-001 | `/` | PENDING |
| SCR-002 | `/about` | PENDING |
| SCR-003 | `/travel-tools` | PENDING |
| SCR-004 | `/mates` | PENDING |
| SCR-005 | `/account` | PENDING |
| FINAL | — | PENDING |

각 Screen 행은 해당 Page Owner Task(`PAGE-SCR001`~`PAGE-SCR005`)가 `DONE`이 되고 사람이 Vercel Preview로 실제 확인을 마치면 `PENDING` → `DONE`으로 갱신한다(`/run-wave`의 Preview Checkpoint, CLAUDE.md Rule 22). `FINAL`은 `/release-check`가 `RELEASE_READY`를 낸 시점에만 `DONE`으로 갱신한다.

## 갱신 규칙

- 이 문서는 사람이 손으로 값을 지어내지 않는다 — 모든 필드는 대응하는 실제 산출물(`TASKS/WAVE_STATE.md`, `TASKS/TASK_AUDIT_REPORT.md`, CI 로그, Playwright 리포트, Supabase 마이그레이션, Vercel 배포 기록)을 실제로 확인한 뒤에만 갱신한다.
- `Current Wave`/`Current Task`/`Completed Tasks`/`Blocked Tasks`는 `/run-wave`가 매 Task 완료·중단 시점에 갱신한다.
- `Screen Checkpoints`는 `/run-wave`가 Preview Checkpoint에 도달할 때, `FINAL`은 `/release-check`가 실행될 때 갱신한다.
- `Latest CI`/`Playwright State`/`Supabase State`/`Vercel Preview URL`은 해당 상태를 바꾸는 Task(`CI-*`, `E2E-*`, `DB-*`, `DEPLOY-*`)가 완료될 때 갱신한다.
- `Deferred Items`는 `TASKS/00_TASK_LIST.md`의 `## NON_IMPLEMENTATION` 표가 바뀔 때만(즉 `/gen-tasklist` 재실행 시) 함께 갱신한다.
