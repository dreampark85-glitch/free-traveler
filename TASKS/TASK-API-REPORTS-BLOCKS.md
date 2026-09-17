# API-REPORTS-BLOCKS — 신고·차단 API

| Field | Value |
|---|---|
| Category | API |
| Implementation Status | PLANNED_REDUCED |
| Priority | P0 |
| Screen | SCR-004 |
| Route | `/api/mates/[id]/report` |
| Page Entry | `src/app/api/mates/[id]/report/route.ts` |
| Depends On | DB-SCHEMA-BASE, DB-RLS-BASE, DB-ACCESS, AUTH-SETUP |
| Source | TASKS/00_TASK_LIST.md Seq 15 |

## Context

신고·차단 API. Category: API. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 15)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT(축소)** — 관련 Requirement의 처리 방법 칸에 명시된 축소 범위(우선순위/증거 UI 제외 등)를 그대로 따른다. 축소 이상으로 확장 구현하지 않는다.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-039, REQ-FUNC-040, REQ-NF-019

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: SCR-004
- Route: `/api/mates/[id]/report`
- Page Entry: `src/app/api/mates/[id]/report/route.ts`

## Design Ref

docs/06_SRS_UIUX_REVISED.md §3~§4(해당 Requirement 행), docs/PROJECT_SCOPE.md §2 구현 방식 원칙(정적 데이터/6-테이블 DB 범위/관리자 범위 제한)

## Depends On

DB-SCHEMA-BASE, DB-RLS-BASE, DB-ACCESS, AUTH-SETUP

## Expected Files

`src/app/api/mates/[id]/report/route.ts`, `src/app/api/blocks/route.ts`, `src/app/api/blocks/[id]/route.ts`(신규)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

신고 접수(사유 코드+설명) 즉시 접수 ID/시각 반환; 차단/차단 해제, 차단 관계 기반 노출 제한

## Visual AC

해당 없음

## Security/Privacy AC

축소 구현: 우선순위·증거 UI 없음(REQ-FUNC-041과 연동해 상태만 관리)

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: 신고 접수(사유 코드+설명) 즉시 접수 ID/시각 반환; 차단/차단 해제, 차단 관계 기반 노출 제한
- Security/Privacy AC가 위반되지 않는다: 축소 구현: 우선순위·증거 UI 없음(REQ-FUNC-041과 연동해 상태만 관리)
- Verify 절 방법으로 재현 가능하다: UNIT + 수동 확인(차단 후 상호 미노출)

## Verify

UNIT + 수동 확인(차단 후 상호 미노출)

## Definition of Done

- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음

## Forbidden

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/app/api/mates/[id]/report/route.ts`, `src/app/api/blocks/route.ts`, `src/app/api/blocks/[id]/route.ts`(신규)
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
