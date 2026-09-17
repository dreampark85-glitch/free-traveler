# GLOBAL-LAYOUT-NAV-FOOTER — 전역 Header/Footer 레이아웃

| Field | Value |
|---|---|
| Category | GLOBAL |
| Implementation Status | PLANNED_FULL |
| Priority | P0 |
| Screen | GLOBAL |
| Route | 전체 5개 Screen |
| Page Entry | `src/app/layout.tsx` |
| Depends On | GLOBAL-DESIGN-TOKENS |
| Source | TASKS/00_TASK_LIST.md Seq 2 |

## Context

전역 Header/Footer 레이아웃. Category: GLOBAL. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 2)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-064, REQ-FUNC-065

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: GLOBAL
- Route: 전체 5개 Screen
- Page Entry: `src/app/layout.tsx`

## Design Ref

design-reference/D-001/DESIGN.md §7(Header·Footer), §11 접근성 규칙, §13 Alert·Toast

## Depends On

GLOBAL-DESIGN-TOKENS

## Expected Files

`src/app/layout.tsx`(전면 교체), `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/MobileNavSheet.tsx`(신규)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

Desktop 72px/Mobile 56px Header, 4개 내비(여행지/여행 준비/동행 찾기/대표 소개)+계정 진입, Mobile 햄버거 시트; Footer 4열/1열 반응형(D-001 §7)

## Visual AC

320px~Desktop 가로 스크롤/겹침 없음; 활성 메뉴 코랄 밑줄+`aria-current`

## Security/Privacy AC

해당 없음

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: Desktop 72px/Mobile 56px Header, 4개 내비(여행지/여행 준비/동행 찾기/대표 소개)+계정 진입, Mobile 햄버거 시트; Footer 4열/1열 반응형(D-001 §7)
- Visual AC 전체가 렌더링 결과에서 확인된다: 320px~Desktop 가로 스크롤/겹침 없음; 활성 메뉴 코랄 밑줄+`aria-current`
- Verify 절 방법으로 재현 가능하다: Playwright E2E-PUBLIC-SMOKE 반응형 뷰포트 확인

## Verify

Playwright E2E-PUBLIC-SMOKE 반응형 뷰포트 확인

## Definition of Done

- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음

## Forbidden

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/app/layout.tsx`(전면 교체), `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/MobileNavSheet.tsx`(신규)
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
