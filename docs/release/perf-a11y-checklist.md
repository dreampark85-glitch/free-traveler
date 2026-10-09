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

2026-10-09, Lighthouse 12.8.2 명령줄(headless Chrome, Mobile 기본 프로필, Performance만)로 Production을 1회씩 측정했다.
개발 PC에서 측정한 참고값이며, 실제 사용자 환경과 다를 수 있다. 사람이 시크릿 창 개발자도구로 다시 재면 이 표를 갱신한다.

| 화면 | Performance | LCP | INP | CLS | TBT | 측정일 | 비고 |
|---|---|---|---|---|---|---|---|
| `/` | 100 | 1.8s | 미측정 | 0 | 50ms | 2026-10-09 | 목표 충족 |
| `/about` | 100 | 1.8s | 미측정 | 0 | 60ms | 2026-10-09 | 목표 충족 |
| `/travel-tools` | 99 | 2.1s | 미측정 | 0 | 70ms | 2026-10-09 | 목표 충족 |
| `/mates` | 100 | 1.8s | 미측정 | 0 | 60ms | 2026-10-09 | 목표 충족 |
| `/account` | 97 | 2.4s | 미측정 | 0 | 80ms | 2026-10-09 | 목표 충족, LCP가 2.5s에 가까움 |

- INP는 실제 사용자 상호작용이 있어야 측정되므로 페이지 로드 측정에서는 나오지 않는다. 대신 상호작용 반응의 대리 지표인
  TBT(총 차단 시간)를 적었다. 5개 화면 모두 50~80ms로 낮아 INP 목표(200ms) 위험은 작아 보이나, INP 자체는 측정하지 않았다.
- 5개 화면 모두 LCP ≤ 2.5s, CLS ≤ 0.1 목표를 만족한다. `/account`의 LCP 2.4s는 여유가 작아 후속 관찰 대상이다.

## 3. 키보드 탐색 (Tab / Shift+Tab / Enter / Space / Esc)

2026-10-09, Production에서 Playwright(chromium)로 키보드 입력만으로 실행했다. 포커스 이동, 열림·닫힘, 포커스 위치처럼
자동으로 판별되는 항목만 확인했고, 보이는 모양(링 색, 겹침)은 사람이 눈으로 확인해야 한다.

| 화면 | 확인 항목 | 결과 | 비고 |
|---|---|---|---|
| 공통 | 헤더 메뉴가 Tab 순서(홈 → 여행지 → 여행 준비 → 동행 찾기 → 대표 소개 → 로그인)로 이동, 포커스 링 표시 | 통과 | 링크·버튼은 2px 코랄 실선 outline. 메인 검색 입력창은 outline이 없다(다른 포커스 표시가 있는지 눈 확인 필요) |
| 공통(Mobile 390) | 메뉴 버튼 Enter로 시트 열림, 포커스가 시트 안으로 이동, Esc로 닫힘 | 통과 | |
| 공통(Mobile 390) | 시트가 닫힌 뒤 포커스가 메뉴 버튼으로 돌아옴 | **결함** | 닫힌 뒤 포커스가 `body`로 간다 |
| `/` | 여행지 카드 Enter로 상세 Drawer 열림, 포커스가 Drawer 안으로 이동, Esc로 닫힘, 닫힌 뒤 포커스가 눌렀던 카드로 복귀 | 통과 | |
| `/` | 상세 Drawer 열린 동안 Tab이 Drawer 안에 머묾(포커스 가둠) | **결함** | `aria-modal`이지만 Tab을 계속 누르면 Drawer 밖(헤더·푸터 링크)으로 포커스가 나간다 |
| `/` | 안전정보 Drawer Enter로 열고 Esc로 닫기, 포커스가 안으로 이동 | 통과 | Tab 가둠은 확인하지 않음(상세 Drawer와 같은 구조로 보임) |
| `/about` | 권역 버튼을 Enter, Space로 펼침·접힘 | 통과 | |
| `/travel-tools` | 탭을 방향키 →, ←로 이동 | 통과 | |
| `/travel-tools` | 키보드만으로 국가 선택 후 조건 확인 → 오류 안내(alert) 표시 | 통과 | 외부 이동 버튼은 Production E2E에서 확인 |
| `/mates` | 목록 카드에 포커스 후 Enter로 상세 열림, Esc | 통과 | 참가 요청 폼은 로그인이 필요해 확인하지 않음 |
| `/account` | 로그인·가입 탭을 방향키로 이동, 이어서 Tab으로 폼 필드 진입 | 통과 | |

### 발견한 결함 (후속 조치 대상, 이번 Task 범위에서는 고치지 않음)

1. **모달 Drawer·시트에 포커스 트랩이 없다.** `aria-modal="true"`인 상세 Drawer에서 Tab을 계속 누르면 뒤쪽 페이지로 포커스가
   나간다. 보조기기 사용자가 배경 내용을 읽게 되는 문제다. 관련 파일: `src/components/scr001/DestinationDrawer.tsx`,
   `SafetyDrawer.tsx`, `src/components/layout/MobileNavSheet.tsx`, `src/components/scr004/MateDetailPanel.tsx`.
2. **모바일 메뉴 시트를 닫으면 포커스가 사라진다.** Esc로 닫은 뒤 포커스가 `body`로 가서 키보드 사용자가 다시 처음부터 Tab을 눌러야 한다.
   상세 Drawer는 눌렀던 카드로 정상 복귀한다.

## 4. 판정

- [x] 5개 화면 Lighthouse 기록 완료(명령줄 측정, INP 제외)
- [x] 목표치를 넘은 항목의 원인과 후속 조치 기록(넘은 항목 없음, `/account` LCP는 관찰)
- [x] 키보드 탐색 항목 확인(자동 판별 범위). 결함 2건을 위에 기록했고, 포커스 링의 시각적 확인과 검색 입력창 포커스 표시는 사람 확인 필요
