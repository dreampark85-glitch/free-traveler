# PAGE-SCR002 — SCR-002 대표 소개 페이지 조립

| Field | Value |
|---|---|
| Category | PAGE_OWNER |
| Implementation Status | PLANNED_FULL |
| Priority | P1 |
| Screen | SCR-002 |
| Route | `/about` |
| Page Entry | `src/app/about/page.tsx` |
| Depends On | COMP-SCR002-STAT-CARD, COMP-SCR002-INTRO-PHILOSOPHY, COMP-SCR002-TIMELINE, COMP-SCR002-FOOTPRINT-CHIPS, COMP-SCR002-GALLERY, COMP-SCR002-FAVORITE-PLACES, COMP-SHARED-DESTINATION-CARD, COMP-SHARED-CTA-BANNER, DATA-REPRESENTATIVE, GLOBAL-LAYOUT-NAV-FOOTER |
| Source | TASKS/00_TASK_LIST.md Seq 49 |

## Context

SCR-002 대표 소개 페이지 조립. Category: PAGE_OWNER. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq 49)에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.

구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `outbound_link_setting`)로 제한한다.

## Requirement Ref

REQ-FUNC-062, REQ-FUNC-064, REQ-FUNC-065, REQ-FUNC-070

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: SCR-002
- Route: `/about`
- Page Entry: `src/app/about/page.tsx`

## Design Ref

design-reference/D-001/DESIGN.md §19 (SCR-002 Section 순서/최소 콘텐츠 수 계약), §16(Section 최대 폭/여백), §17(Hero 규칙), §20(Empty State/Placeholder 금지 규칙), §7(Header/Footer); design-reference/UI_CONTRACT.md의 SCR-002 절(영역 순서/주요 Component/상태/이동)

## Depends On

COMP-SCR002-STAT-CARD, COMP-SCR002-INTRO-PHILOSOPHY, COMP-SCR002-TIMELINE, COMP-SCR002-FOOTPRINT-CHIPS, COMP-SCR002-GALLERY, COMP-SCR002-FAVORITE-PLACES, COMP-SHARED-DESTINATION-CARD, COMP-SHARED-CTA-BANNER, DATA-REPRESENTATIVE, GLOBAL-LAYOUT-NAV-FOOTER

## Expected Files

`src/app/about/page.tsx`(신규)

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

**Section 순서**: Profile Hero → 여행 지표 → 소개·철학 → Timeline 6개 → 방문 국가 30개 → Gallery 8개 → 기억에 남는 여행지 4개와 CTA. **Section별 데이터 출처**: 전 Section이 단일 소스 DATA-REPRESENTATIVE(대표명/50+/30+/소개문/철학/방문국가/타임라인/갤러리/추천 여행지)를 사용하며, 추천 여행지 카드만 COMP-SHARED-DESTINATION-CARD를 재사용해 SCR-001 상세 Drawer로 연결. 문의/SNS 링크(REQ-FUNC-062)는 본 Page Owner가 직접 렌더링하며 빈 링크는 렌더링하지 않고 허용 프로토콜만 연다.

## Visual AC

최소 콘텐츠 수: Timeline 6개 이상, 방문 국가 Chip 30개 이상, Gallery 8장 이상, 추천 여행지 4장. Desktop/Mobile 여백 규칙 SCR-001과 동일 적용, Hero는 `100vh` 금지·auto-height로 다음 Section 제목 노출. **Lorem ipsum·"준비 중"·빈 카드 금지** — 대표 소개는 정적 시드 데이터로 항상 완비되므로 Empty State는 해당 없으나, 시드 누락 시에도 빈 카드 대신 데이터 검증 스크립트가 빌드를 차단해야 한다.

## Security/Privacy AC

이미지 메타데이터(alt/출처/작가/라이선스) 누락 시 렌더링 대신 기본 플레이스홀더 대체(REQ-FUNC-061)

## Test Cases

- Functional AC 전체가 구현되어 실제로 동작한다: **Section 순서**: Profile Hero → 여행 지표 → 소개·철학 → Timeline 6개 → 방문 국가 30개 → Gallery 8개 → 기억에 남는 여행지 4개와 CTA. **Section별 데이터 출처**: 전 Section이 단일 소스 DATA-REPRESENTATIVE(대표명/50+/30+/소개문/철학/방문국가/타임라인/갤러리/추천 여행지)를 사용하며, 추천 여행지 카드만 COMP-SHARED-DESTINATION-CARD를 재사용해 SCR-001 상세 Drawer로 연결. 문의/SNS 링크(REQ-FUNC-062)는 본 Page Owner가 직접 렌더링하며 빈 링크는 렌더링하지 않고 허용 프로토콜만 연다.
- Visual AC 전체가 렌더링 결과에서 확인된다: 최소 콘텐츠 수: Timeline 6개 이상, 방문 국가 Chip 30개 이상, Gallery 8장 이상, 추천 여행지 4장. Desktop/Mobile 여백 규칙 SCR-001과 동일 적용, Hero는 `100vh` 금지·auto-height로 다음 Section 제목 노출. **Lorem ipsum·"준비 중"·빈 카드 금지** — 대표 소개는 정적 시드 데이터로 항상 완비되므로 Empty State는 해당 없으나, 시드 누락 시에도 빈 카드 대신 데이터 검증 스크립트가 빌드를 차단해야 한다.
- Security/Privacy AC가 위반되지 않는다: 이미지 메타데이터(alt/출처/작가/라이선스) 누락 시 렌더링 대신 기본 플레이스홀더 대체(REQ-FUNC-061)
- Verify 절 방법으로 재현 가능하다: E2E-PUBLIC-SMOKE

## Verify

E2E-PUBLIC-SMOKE

## Definition of Done

- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음

## Forbidden

- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: `src/app/about/page.tsx`(신규)
- 본 Task는 **Route Page 조립만**을 범위로 한다 — 새로운 Component/Data/API/DB Task를 만들지 않는다. Depends On에 나열된 기존 산출물만 가져와 조립한다.
- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.
