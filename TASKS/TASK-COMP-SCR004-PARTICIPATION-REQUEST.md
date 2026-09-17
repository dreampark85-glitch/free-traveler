# COMP-SCR004-PARTICIPATION-REQUEST — 참가 요청 폼

| Field | Value |
|---|---|
| Category | COMPONENT |
| Implementation Status | PLANNED_FULL |
| Priority | P0 |
| Screen | SCR-004 |
| Route | `/mates` |
| Page Entry | — |
| Depends On | API-MATE-APPLICATIONS, AUTH-SETUP |
| Source | TASKS/00_TASK_LIST.md Seq 40 |

## Context

참가 요청 폼. Category: COMPONENT. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 40)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-034, REQ-FUNC-035

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: SCR-004
- Route: `/mates`
- Page Entry: —

## Design Ref

design-reference/D-001/DESIGN.md 관련 절; design-reference/UI_CONTRACT.md 해당 Screen 절

## Depends On

API-MATE-APPLICATIONS, AUTH-SETUP

## Expected Files

`src/components/scr004/ParticipationRequestForm.tsx`(신규)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

최대 500자 비공개 메시지 제출, 중복 PENDING/ACCEPTED 시 인라인 오류

## Visual AC

해당 없음

## Security/Privacy AC

비로그인/미성년 시 폼 대신 로그인 유도 안내(REQ-FUNC-044 서버 이중 방어)

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: 최대 500자 비공개 메시지 제출, 중복 PENDING/ACCEPTED 시 인라인 오류
- Security/Privacy AC가 위반되지 않는다: 비로그인/미성년 시 폼 대신 로그인 유도 안내(REQ-FUNC-044 서버 이중 방어)
- Verify 절 방법으로 재현 가능하다: E2E-MATE-AUTH

## Verify

E2E-MATE-AUTH

## Definition of Done

- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음

## Forbidden

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/components/scr004/ParticipationRequestForm.tsx`(신규)
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
