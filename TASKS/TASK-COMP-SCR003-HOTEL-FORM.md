# COMP-SCR003-HOTEL-FORM — 숙소 폼·요약·외부 이동

| Field | Value |
|---|---|
| Category | COMPONENT |
| Implementation Status | PLANNED_FULL |
| Priority | P0 |
| Screen | SCR-003 |
| Route | `/travel-tools` |
| Page Entry | — |
| Depends On | (없음) |
| Source | TASKS/00_TASK_LIST.md Seq 35 |

## Context

숙소 폼·요약·외부 이동. Category: COMPONENT. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 35)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-019, REQ-FUNC-020, REQ-FUNC-021, REQ-FUNC-022, REQ-FUNC-023, REQ-FUNC-024, REQ-FUNC-025, REQ-FUNC-026, REQ-NF-017

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: SCR-003
- Route: `/travel-tools`
- Page Entry: —

## Design Ref

design-reference/D-001/DESIGN.md §10 Form·Tabs; design-reference/UI_CONTRACT.md의 SCR-003 절

## Depends On

(없음)

## Expected Files

`src/components/scr003/HotelForm.tsx`(신규)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

국가/지역/체크인/체크아웃 필수 필드, 국가 종속 지역 파생(FlightForm과 로직 공유 가능), 경계값 검증, 요약, 비전달 고지, `HOTEL_OUTBOUND_URL` 새 탭 이동

## Visual AC

오류/재시도 UI 인라인 표시

## Security/Privacy AC

**숙소 입력값을 서버·DB·외부 URL 쿼리·분석 이벤트로 전송하지 않는다**(REQ-FUNC-025, REQ-NF-017); 새 탭+`noopener,noreferrer`, HTTPS 허용목록만

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: 국가/지역/체크인/체크아웃 필수 필드, 국가 종속 지역 파생(FlightForm과 로직 공유 가능), 경계값 검증, 요약, 비전달 고지, `HOTEL_OUTBOUND_URL` 새 탭 이동
- Visual AC 전체가 렌더링 결과에서 확인된다: 오류/재시도 UI 인라인 표시
- Security/Privacy AC가 위반되지 않는다: **숙소 입력값을 서버·DB·외부 URL 쿼리·분석 이벤트로 전송하지 않는다**(REQ-FUNC-025, REQ-NF-017); 새 탭+`noopener,noreferrer`, HTTPS 허용목록만
- Verify 절 방법으로 재현 가능하다: UNIT-TRAVEL-DATES + 네트워크 탭 검사

## Verify

UNIT-TRAVEL-DATES + 네트워크 탭 검사

## Definition of Done

- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음

## Forbidden

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/components/scr003/HotelForm.tsx`(신규)
- 항공·숙소 입력값(국가/지역/날짜)을 서버·DB·외부 URL 쿼리·분석 이벤트로 전송하지 않는다.
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
