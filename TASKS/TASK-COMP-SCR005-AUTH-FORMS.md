# COMP-SCR005-AUTH-FORMS — 로그인/가입/비밀번호 재설정 폼

| Field | Value |
|---|---|
| Category | COMPONENT |
| Implementation Status | PLANNED_FULL |
| Priority | P0 |
| Screen | SCR-005 |
| Route | `/account` |
| Page Entry | — |
| Depends On | AUTH-SETUP |
| Source | TASKS/00_TASK_LIST.md Seq 44 |

## Context

로그인/가입/비밀번호 재설정 폼. Category: COMPONENT. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 44)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-066

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: SCR-005
- Route: `/account`
- Page Entry: —

## Design Ref

design-reference/D-001/DESIGN.md §10 Form·Tabs; design-reference/UI_CONTRACT.md의 SCR-005 절

## Depends On

AUTH-SETUP

## Expected Files

`src/components/scr005/AuthForms.tsx`(신규)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

이메일 가입/인증/로그인/로그아웃/비밀번호 재설정 폼 3종

## Visual AC

해당 없음

## Security/Privacy AC

미인증 계정은 쓰기 권한 없음(E2E로 확인)

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: 이메일 가입/인증/로그인/로그아웃/비밀번호 재설정 폼 3종
- Security/Privacy AC가 위반되지 않는다: 미인증 계정은 쓰기 권한 없음(E2E로 확인)
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

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/components/scr005/AuthForms.tsx`(신규)
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
