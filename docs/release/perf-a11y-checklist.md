# 성능·접근성 릴리스 체크리스트 (RELEASE-PERF-A11Y-CHECK)

- 대상: Production https://free-traveler-orcin.vercel.app
- 성격: 배포 직전 수동 점검 기록이다. CI 게이트가 아니다(목표치 원칙, `docs/PROJECT_SCOPE.md`).
- 기록 규칙: 측정하지 않은 칸은 비워 둔다. 측정값을 추정해서 채우지 않는다.

## 1. 자동 접근성 검사 (axe-core, serious/critical 기준)

2026-10-09, Production에 chromium으로 실행했다.

| 화면 | Desktop 1440 | Mobile 390 |
|---|---|---|
| `/` (SCR-001) | 위반 0 | (E2E는 Desktop만) |
| `/about` (SCR-002) | 위반 0 | (E2E는 Desktop만) |
| `/travel-tools` 항공 탭 (SCR-003) | 위반 0 | 위반 0 |
| `/travel-tools?tab=hotel` | 위반 0 | 위반 0 |
| `/travel-tools?tab=mate` | 위반 0 | 위반 0 |
| `/mates` (SCR-004) | 위반 0 | 위반 0 |
| `/account` (SCR-005, 비로그인) | 위반 0 | 위반 0 |

- 태그: wcag2a, wcag2aa, wcag21aa. 로그인 상태 화면(회원·관리자 탭)은 계정이 없어 검사하지 않았다.

## 2. Lighthouse 수동 측정 (목표: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1)

Chrome 개발자도구 → Lighthouse → Mobile, 시크릿 창(확장 프로그램 없이)에서 측정해 아래에 적는다.

| 화면 | Performance | LCP | INP | CLS | 측정일 | 비고 |
|---|---|---|---|---|---|---|
| `/` | | | | | | |
| `/about` | | | | | | |
| `/travel-tools` | | | | | | |
| `/mates` | | | | | | |
| `/account` | | | | | | |

## 3. 키보드 탐색 (Tab / Shift+Tab / Enter / Space / Esc)

| 화면 | 확인 항목 | 결과 |
|---|---|---|
| 공통 | 헤더 메뉴 순서대로 포커스 이동, 포커스 링 보임 | |
| 공통 | 모바일 메뉴 시트가 Esc로 닫히고 포커스가 돌아옴 | |
| `/` | 테마 필터 → 카드 → 상세 Drawer 열기/Esc 닫기 | |
| `/` | 안전정보 Drawer 열기/닫기 | |
| `/about` | 권역 토글, CTA 링크 | |
| `/travel-tools` | 탭 전환(방향키), 폼 입력·오류 안내, 외부 이동 버튼 | |
| `/mates` | 필터, 카드 → 상세, 참가 요청 폼 | |
| `/account` | 로그인 폼, 탭 전환 | |

## 4. 판정

- [ ] 5개 화면 Lighthouse 기록 완료
- [ ] 목표치를 넘은 항목의 원인과 후속 조치 기록
- [ ] 키보드 탐색 전 항목 확인
