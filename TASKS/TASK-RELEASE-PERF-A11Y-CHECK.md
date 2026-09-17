# RELEASE-PERF-A11Y-CHECK — 성능/접근성 목표치 릴리스 점검

| Field | Value |
|---|---|
| Category | RELEASE_CHECK |
| Implementation Status | PLANNED_TARGET_METRIC |
| Priority | P1 |
| Screen | GLOBAL |
| Route | 전체 5개 Screen |
| Page Entry | — |
| Depends On | PAGE-SCR001, PAGE-SCR002, PAGE-SCR003, PAGE-SCR004, PAGE-SCR005 |
| Source | TASKS/00_TASK_LIST.md Seq 62 |

## Context

성능/접근성 목표치 릴리스 점검. Category: RELEASE_CHECK. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 62)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT(목표치)** — CI 게이트 없이 목표치를 지향하고 배포 전 수동으로 확인한다. 자동화된 성능/접근성 게이트를 새로 구축하지 않는다.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-NF-001, REQ-NF-002, REQ-NF-003, REQ-NF-004, REQ-NF-006, REQ-NF-023

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: GLOBAL
- Route: 전체 5개 Screen
- Page Entry: —

## Design Ref

docs/06_SRS_UIUX_REVISED.md §5 Release Acceptance Criteria; docs/PROJECT_SCOPE.md 항목 11~12

## Depends On

PAGE-SCR001, PAGE-SCR002, PAGE-SCR003, PAGE-SCR004, PAGE-SCR005

## Expected Files

`docs/release/perf-a11y-checklist.md`(신규, 결과 기록용)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

배포 직전 5개 Screen에 대해 수동 Lighthouse(LCP≤2.5s/INP≤200ms/CLS≤0.1 목표) + 키보드 탐색 확인 — CI 게이트 아님(PROJECT_SCOPE 목표치 원칙), 브라우저 확인 필요 항목이므로 Manual/Release Check Task로 연결

## Visual AC

해당 없음

## Security/Privacy AC

해당 없음

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: 배포 직전 5개 Screen에 대해 수동 Lighthouse(LCP≤2.5s/INP≤200ms/CLS≤0.1 목표) + 키보드 탐색 확인 — CI 게이트 아님(PROJECT_SCOPE 목표치 원칙), 브라우저 확인 필요 항목이므로 Manual/Release Check Task로 연결
- Verify 절 방법으로 재현 가능하다: 수동 Lighthouse 리포트 + 체크리스트 기록

## Verify

수동 Lighthouse 리포트 + 체크리스트 기록

## Definition of Done

- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음

## Forbidden

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `docs/release/perf-a11y-checklist.md`(신규, 결과 기록용)
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
