# DATA-REPRESENTATIVE — 대표 소개 정적 데이터

| Field | Value |
|---|---|
| Category | DATA |
| Implementation Status | PLANNED_FULL |
| Priority | P1 |
| Screen | SCR-002 |
| Route | `/about` |
| Page Entry | — |
| Depends On | (없음) |
| Source | TASKS/00_TASK_LIST.md Seq 7 |

## Context

대표 소개 정적 데이터. Category: DATA. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 7)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-057, REQ-FUNC-058, REQ-FUNC-059, REQ-FUNC-060, REQ-FUNC-061, REQ-FUNC-063, REQ-NF-029

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: SCR-002
- Route: `/about`
- Page Entry: —

## Design Ref

docs/06_SRS_UIUX_REVISED.md §3~§4(해당 Requirement 행), docs/PROJECT_SCOPE.md §2 구현 방식 원칙(정적 데이터/6-테이블 DB 범위/관리자 범위 제한)

## Depends On

(없음)

## Expected Files

`src/data/representative-profile.ts`(신규)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

`displayName`(free_traveler)/`50+ Trips`/`30+ Countries`/소개문/철학/`visitedCountries[]`(30개국 이상)/`timeline[]`(6개 이상)/추천 여행지 6곳(slug 참조)

## Visual AC

이미지 메타데이터 누락 시 빌드 경고 + 기본 플레이스홀더 지정

## Security/Privacy AC

해당 없음

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: `displayName`(free_traveler)/`50+ Trips`/`30+ Countries`/소개문/철학/`visitedCountries[]`(30개국 이상)/`timeline[]`(6개 이상)/추천 여행지 6곳(slug 참조)
- Visual AC 전체가 렌더링 결과에서 확인된다: 이미지 메타데이터 누락 시 빌드 경고 + 기본 플레이스홀더 지정
- Verify 절 방법으로 재현 가능하다: 데이터 리뷰 체크리스트(REQ-FUNC-057/058/059/060)

## Verify

데이터 리뷰 체크리스트(REQ-FUNC-057/058/059/060)

## Definition of Done

- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음

## Forbidden

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/data/representative-profile.ts`(신규)
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
