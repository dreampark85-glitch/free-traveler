---
version: D-001
status: LOCKED
name: Free-Traveler-design-system
description: A trustworthy, photo-first travel-prep hub on a pure white canvas with a single coral accent. Layout philosophy (generous whitespace, photo-first cards, one accent color, soft rounded shapes, pill search/tabs) is inspired by design-reference/vendor/airbnb/DESIGN.md — no Airbnb trademark element (wordmark, Cereal VF font, Rausch #ff385c exact hue, heart-save icon, "Guest favorite" badge, booking/payment UI) is reproduced. All tokens below are Free Traveler originals.
derived_from:
  vendor_reference: design-reference/vendor/airbnb/DESIGN.md
  source_plan: docs/04_UIUX_PLAN.md
  validation: docs/STITCH_VALIDATION_REPORT.md
approved_screens: [SCR-001, SCR-002, SCR-003, SCR-004, SCR-005]
mobile_variants: [SCR-001, SCR-003]

colors:
  canvas: "#FFFFFF"
  surface-soft: "#F7F6F3"
  surface-strong: "#F0EEE9"
  hairline: "#E4E1DA"
  hairline-soft: "#EFEDE8"
  ink: "#242327"
  body: "#4B4A52"
  muted: "#6E6D76"
  muted-soft: "#9B9AA2"
  coral: "#E85A34"
  coral-hover: "#D14A26"
  coral-tint: "#FCE7DE"
  on-coral: "#FFFFFF"
  info: "#2A5FD9"
  warning: "#B45309"
  warning-bg: "#FDF3E6"
  danger: "#C21E33"
  danger-bg: "#FBEAEA"
  success: "#1F8A57"
  success-bg: "#EAF6EF"

typography:
  display-xl:
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 36px
    fontWeight: 700
    use: "SCR-001·SCR-002 Hero 헤드라인(Desktop)"
  display-lg:
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
    fontSize: 28px
    fontWeight: 700
    use: "Hero 헤드라인(Mobile), Section 대제목(Desktop)"
  display-md:
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
    fontSize: 22px
    fontWeight: 600
    use: "Section 제목(공통)"
  title-md:
    fontSize: 18px
    fontWeight: 600
    use: "카드 제목, 탭 라벨"
  title-sm:
    fontSize: 16px
    fontWeight: 600
    use: "서브 섹션 제목, 폼 라벨"
  body-lg:
    fontSize: 17px
    fontWeight: 400
    use: "Hero 서브텍스트"
  body-md:
    fontSize: 15px
    fontWeight: 400
    use: "기본 본문"
  body-sm:
    fontSize: 14px
    fontWeight: 400
    use: "카드 메타, 목록 보조 텍스트"
  caption:
    fontSize: 13px
    fontWeight: 500
    use: "배지, 태그, 폼 헬프텍스트"
  button:
    fontSize: 16px
    fontWeight: 600
    use: "버튼 라벨"

radius:
  sm: 8px
  md: 14px
  lg: 20px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section-desktop: "64–96px"
  section-mobile: "40–64px"

elevation:
  card: "0 1px 2px rgba(36,35,39,.06), 0 8px 20px rgba(36,35,39,.08)"
  scrim: "rgba(36,35,39,.4)"

breakpoints:
  mobile: 390px
  tablet: "744–1128px"
  desktop: 1440px

layout:
  content-max-width: "1200–1280px"
  hero-height-ratio: "55–65% of viewport height (desktop), never 100vh"
---

## 0. 원칙과 근거

이 문서는 **D-001**, Free Traveler의 잠긴(LOCKED) 디자인 정본이다. 세 개의 입력을 통합한다:

1. **레이아웃 철학만** 참고한 `design-reference/vendor/airbnb/DESIGN.md` — 사진 중심의 넉넉한 여백, 단일 포인트 컬러, 부드러운 라운드, pill 검색/탭 형태. Airbnb의 정확한 색상값(Rausch #ff385c), Cereal VF 서체, 하트 저장 아이콘, "Guest favorite" 배지, 예약/결제 UI 등 **상표적 요소는 전혀 가져오지 않았다.**
2. `docs/04_UIUX_PLAN.md` — Free Traveler 고유 디자인 토큰(색상·타이포·spacing·radius·breakpoint)과 5개 화면의 Section 계약 원안.
3. `docs/STITCH_VALIDATION_REPORT.md` — 승인된 Stitch 화면(SCR-001~005 Desktop, SCR-001·SCR-003 Mobile)에서 실제로 검증·확정된 Section 순서, 최소 콘텐츠 수, 상태 문구, 탭 라벨을 역주입해 계획과 구현 화면 간 불일치를 제거했다.

D-001이 LOCKED 상태인 동안 이 문서의 토큰 값·Section 계약·Do/Do Not 규칙은 구현·후속 디자인 반복의 단일 진실 공급원(SSOT)이다. 값 변경이 필요하면 새 버전(D-002)을 발행해야 하며 D-001을 직접 수정하지 않는다.

---

## 1. Visual Theme

- **캔버스**: 순백(`color.canvas` #FFFFFF) 기본 배경. Section 구분에는 옅은 웜그레이 Surface(`color.surface-soft`)만 사용하고, 그림자나 다크 Section을 남용하지 않는다.
- **톤**: 신뢰할 수 있는 여행 준비 허브. 사진과 정보 밀도를 함께 존중하되 광고성 문구·과장된 슬로건을 쓰지 않는다.
- **포인트 컬러**: 코랄(`color.coral` #E85A34) 단일 액센트 — Primary 버튼, 활성 탭, 링크, 강조 배지에만 제한적으로 사용한다. 페이지의 90% 이상은 흰 배경 + Ink 텍스트이고, 코랄은 "결정적 순간"에만 등장한다(Airbnb의 "단일 액센트, 절제된 사용" 철학을 그대로 계승하되 코랄 자체는 Free Traveler 고유 값).
- **형태 언어**: 부드러움. 버튼 8px, 카드 14px, Hero 이미지·Drawer 20px, Chip·배지·탭은 완전한 pill(9999px). 하드 코너는 body 그리드 자체 외에는 존재하지 않는다.
- **서체**: 한글 본문은 Inter + 시스템 한글 폰트 fallback(`'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', -apple-system, BlinkMacSystemFont, sans-serif`). Proprietary 서체 파일(Cereal VF 등)은 사용하지 않는다.
- **사진**: 여행지·인물 사진은 실제 장면을 설명하는 alt 텍스트를 갖는다(예: "저녁 노을이 물든 산토리니 해안 마을 전경"). 사진은 장식이 아니라 신뢰 신호로 취급한다.

---

## 2. Color Token

| 토큰 | 값 | 용도 |
|---|---|---|
| `color.canvas` | `#FFFFFF` | 기본 배경 |
| `color.surface-soft` | `#F7F6F3` | Section 배경 구분, Empty State 배경, 이미지 lazy-load 플레이스홀더 블록 |
| `color.surface-strong` | `#F0EEE9` | Chip 기본 배경, 비활성 탭 배경 |
| `color.hairline` | `#E4E1DA` | 카드 테두리, 구분선 |
| `color.hairline-soft` | `#EFEDE8` | 옅은 구분선(리스트 행 등) |
| `color.ink` | `#242327` | 제목, 본문 기본 텍스트 (순수 검정 `#000` 금지) |
| `color.body` | `#4B4A52` | 본문 보조 텍스트 |
| `color.muted` | `#6E6D76` | 캡션, 메타 정보(날짜·지역) |
| `color.muted-soft` | `#9B9AA2` | 비활성 텍스트 (placeholder **문구**가 아닌 입력 필드 미입력 상태의 텍스트 색상에만 사용) |
| `color.coral` (Primary) | `#E85A34` | Primary 버튼, 활성 탭 밑줄/배경, 링크, 강조 배지 |
| `color.coral-hover` | `#D14A26` | Primary 버튼 hover/active |
| `color.coral-tint` | `#FCE7DE` | CTA Banner 배경, 강조 배지 배경 |
| `color.on-coral` | `#FFFFFF` | 코랄 배경 위 텍스트 |
| `color.info` | `#2A5FD9` | 정보성 링크(외부 출처, 이용약관) |
| `color.warning` | `#B45309` | 안전정보 재확인 경고, 주의 배지 |
| `color.warning-bg` | `#FDF3E6` | 경고 배지/배너 배경 |
| `color.danger` | `#C21E33` | 폼 오류, 중대 여행경보, 신고·차단 확인 |
| `color.danger-bg` | `#FBEAEA` | 오류/위험 배너 배경 |
| `color.success` | `#1F8A57` | 승인·성공 상태(Toast 포함) |
| `color.success-bg` | `#EAF6EF` | 성공 배너 배경 |

**규칙**: 코랄(`#E85A34`)과 경고(`#B45309`)·위험(`#C21E33`)은 색상환에서 명확히 분리된 축을 사용해 "일반 강조"와 "위험 신호"를 혼동하지 않게 한다. 색상만으로 의미를 전달하지 않고, 모든 경고·오류·안전 배지는 아이콘 + 텍스트 라벨을 함께 표시한다(예: "⚠ 재확인 필요", "🚫 여행유의"). 위 표에 없는 임의 색상은 신규 화면·컴포넌트에 추가할 수 없다 — 필요하면 D-002 발행 절차를 거친다.

---

## 3. Typography

- **font-family**: `'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', -apple-system, BlinkMacSystemFont, sans-serif`. 웹폰트 파일을 별도로 번들하지 않고 시스템 폰트 스택과 구글 Inter(오픈소스 라이선스) 로 구성한다 — Proprietary 폰트 파일 사용 금지.
- 한글은 Inter의 라틴 숫자·영문과 시스템 한글 폰트가 자연스럽게 섞이도록, 숫자·영문 라벨(50+, 30+, PENDING 등)에만 Inter 웨이트를 강하게 적용하고 한글 본문은 시스템 폰트 굵기를 따른다.

| 토큰 | 크기/굵기 | 용도 |
|---|---|---|
| `type.display-xl` | 36px / 700 | SCR-001·SCR-002 Hero 헤드라인(Desktop) |
| `type.display-lg` | 28px / 700 | Hero 헤드라인(Mobile), Section 대제목(Desktop) |
| `type.display-md` | 22px / 600 | Section 제목(공통) — 예: "국내에서 다시 발견하는 여행지" |
| `type.title-md` | 18px / 600 | 카드 제목, 탭 라벨 |
| `type.title-sm` | 16px / 600 | 서브 섹션 제목, 폼 라벨 |
| `type.body-lg` | 17px / 400 | Hero 서브텍스트 |
| `type.body-md` | 15px / 400 | 기본 본문 |
| `type.body-sm` | 14px / 400 | 카드 메타, 목록 보조 텍스트 |
| `type.caption` | 13px / 500 | 배지, 태그, 폼 헬프텍스트 |
| `type.button` | 16px / 600 | 버튼 라벨 |

**원칙**: Display 웨이트는 절제한다 — Hero 헤드라인이 36px/28px에 머무는 이유는 사진과 카드 그리드가 시각적 무게를 대신 지기 때문이다(Airbnb가 28px h1로 사진에 위계를 위임하는 방식과 동일한 철학). 시스템 전체에서 유일하게 큰 타이포는 SCR-002의 "50+ Trips / 30+ Countries" 같은 통계 숫자 카드이며, 이 경우에도 `type.display-xl`을 재사용하고 별도의 초대형 토큰을 신설하지 않는다.

---

## 4. Spacing

| 토큰 | 값 |
|---|---|
| `space.xs` | 4px |
| `space.sm` | 8px |
| `space.md` | 12px |
| `space.base` | 16px |
| `space.lg` | 24px |
| `space.xl` | 32px |
| `space.xxl` | 48px |
| `space.section-desktop` | **64–96px** (Section 상하 여백, Desktop) |
| `space.section-mobile` | **40–64px** (Section 상하 여백, Mobile) |

- 카드 내부 패딩: `space.lg`(24px, 목록/상세 패널형 카드), `space.base`(16px, 여행지·동행 카드 메타 블록).
- 카드 그리드 gutter: `space.base`(16px, Desktop 3~4열) / Mobile 1열에서는 카드 간 수직 gutter만 `space.base`.
- Chip 그룹 gutter: `space.sm`(8px).

---

## 5. Radius

| 토큰 | 값 | 적용 |
|---|---|---|
| `radius.sm` | 8px | 버튼, 입력 필드 |
| `radius.md` | 14px | 카드(여행지·동행·통계) |
| `radius.lg` | 20px | Hero 이미지, Drawer |
| `radius.full` | 9999px | Chip, 배지, 탭 pill, 검색창 |

하드 코너(0px)는 body 그리드 컨테이너 외에는 사용하지 않는다.

---

## 6. Shadow (Elevation)

시스템은 **단일 그림자 단계**만 사용한다(Airbnb의 "one shadow tier" 철학 계승).

- **Flat(그림자 없음)**: Body, Hero, Footer, 대부분의 Section — 전체 화면의 95% 이상.
- **Card**: `elevation.card` = `0 1px 2px rgba(36,35,39,.06), 0 8px 20px rgba(36,35,39,.08)` — 카드 hover, Drawer, Dropdown에만 적용한다.
- **Scrim**: `elevation.scrim` = `rgba(36,35,39,.4)` — Drawer/Modal 배경 스크림.

단계적(multi-tier) 그림자 시스템을 새로 만들지 않는다. 깊이는 사진과 흰 배경 위 여백, 라운드 클리핑으로 표현한다.

---

## 7. Header · Footer

### 7.1 Header (SCR-001~005 공통)

| 항목 | Desktop(1440px) | Mobile(390px) |
|---|---|---|
| 높이 | 72px | 56px |
| 좌측 | Free Traveler 로고타입(코랄 점 + 워드마크) → `/` | 로고타입(축약) → `/` |
| 중앙 | 내비게이션: 여행지 · 여행 준비 · 동행 찾기 · 대표 소개 | 숨김(햄버거 메뉴로 이동) |
| 우측 | 계정 진입: 게스트=`로그인`, 회원=닉네임+아바타 → `/account` | 계정 아이콘 + 햄버거 아이콘 |
| 활성 상태 | 현재 화면 메뉴에 코랄 밑줄(2px) + `aria-current="page"` | 슬라이드 시트 내 동일 표시 |
| 포커스 | 모든 링크·버튼에 2px 코랄 아웃라인, offset 2px | 동일 |
| 모바일 메뉴 | — | 햄버거 탭 시 전체화면 시트: 4개 내비게이션 + 계정 진입 버튼, `Esc`/닫기 버튼으로 닫힘 |

### 7.2 Footer (SCR-001~005 공통)

| 항목 | Desktop(1440px) | Mobile(390px) |
|---|---|---|
| 레이아웃 | 콘텐츠 폭 1200~1280px, 4열: ①브랜드 소개 ②바로가기 ③정책(이용약관·개인정보처리방침·동행 안전수칙·콘텐츠 면책) ④출처 안내(외교부 해외안전여행, 이미지 출처) | 1열 스택, 그룹 순서 유지 |
| 상하 여백 | 64px | 40px |
| 하단 바 | 저작권 + "본 서비스는 항공·호텔 예약을 대행하지 않으며 외부 사이트로 안내합니다" 고지 | 동일(줄바꿈 허용) |
| 텍스트 색상 | `color.muted` 기본, 링크 `color.ink`/hover `color.coral` | 동일 |

Header·Footer는 5개 승인 화면 전체에서 완전히 동일해야 한다(검증된 SCR-001 Mobile에서 확인된 하단 내비: 홈/여행지/여행 준비/동행 찾기 4탭 구조를 Mobile Footer 내비게이션의 기준으로 삼는다).

---

## 8. Search · Filter

- **검색창(pill)**: `radius.full`, 흰 배경, `elevation.card`는 hover/focus 시에만 부여(평상시 flat). SCR-001 Hero 내 검색 입력 하나("여행지, 국가, 테마로 검색해보세요")로 구성하며, Airbnb식 Where/When/Who 3분할 구조는 사용하지 않는다(여행지 탐색이 목적이지 예약이 목적이 아니므로).
- **Filter Bar**(SCR-004): 국가/지역, 여행 기간, 테마, 모집 상태 4개 드롭다운/Chip 필터 + 결과 요약 문장("총 24개의 동행 모집글이 있습니다") 1줄. 필터 변경 시 목록만 갱신되고 페이지 이동은 없다.
- **정렬**: 최신순/마감임박순/출발임박순 등 텍스트 링크형 정렬 컨트롤을 결과 요약 옆에 배치한다.
- 모든 필터·정렬 컨트롤의 실제 터치 영역은 44×44px 이상을 확보한다(시각 크기가 작아도 패딩으로 히트 영역 확장).

---

## 9. Destination Card

여행지(국내/해외), 안전정보, "다시 가고 싶은 여행지"(SCR-002) 등에서 공통으로 쓰는 사진 우선 카드.

- 구조: `radius.md`(14px) 클리핑 이미지 → 제목(`type.title-md`) → 메타 1줄(`type.body-sm`, `color.muted` — 지역/기간) → 태그 1개(`radius.full` Chip).
- 안전정보 카드는 동일 골격에 상태 배지(아이콘+텍스트, `color.warning`/`color.danger`/`color.success`)를 제목 옆에 추가한다.
- 이미지 비율은 일관되게 고정하고(예: 4:3), Airbnb의 하트 저장 아이콘·"Guest favorite" 배지·별점 표시는 사용하지 않는다 — Destination Card에는 예약/평점 관련 UI를 올리지 않는다.
- 카드 클릭은 별도 라우트가 아니라 같은 화면의 Drawer를 연다(SCR-001 규정, §14 참고).
- 최소 콘텐츠 수: 국내 6 / 해외 6 / 안전정보 6 / SCR-002 "다시 가고 싶은 여행지" 4 (§16 참고).

---

## 10. Form · Tabs

### 10.1 Form (SCR-003 조건 입력, SCR-005 프로필/URL 설정)

- `text-input`: 흰 배경, `radius.sm`(8px), 1px `color.hairline` 외곽선, 높이 48px 이상, 라벨은 위쪽 `type.caption` `color.muted`. Focus 시 2px `color.coral` 테두리로 전환(그림자/글로우 없음 — Airbnb의 "굵어지는 테두리" 원칙을 색만 코랄로 대체).
- 실시간 검증: 필드 하단에 인라인 오류(`color.danger`), 상단에 요약 오류 배너(`color.danger-bg`)를 함께 노출한다.
- 제출 버튼은 Primary(코랄) 1개만 두고, 보조 액션은 텍스트 버튼(Secondary/Tertiary)으로 구분한다.

### 10.2 Tabs

- **Pill 탭 스위처**(SCR-003 항공/숙소/동행, SCR-005 게스트/회원/관리자): `radius.full` 컨테이너, 비활성 탭 `color.surface-strong` 배경, 활성 탭 `color.coral` 배경 + `color.on-coral` 텍스트.
- 탭 전환은 URL 이동 없이 상태(state)로 처리하며, 탭별 입력·검증·완료 상태는 서로 공유하지 않는다(SCR-003 항공/숙소/동행 독립 원칙, Stitch 검증에서 "flight 비행기 찾기 / hotel 숙소 찾기 / group 동행 구하기" 3탭 라벨로 확정됨).
- **역할 탭**(SCR-005): 로그인 여부·역할에 따라 렌더링되는 탭이 달라진다. 역할에 없는 탭은 DOM에 렌더링하지 않는다(§19 Do Not 참고). 검증된 화면 기준 최종 라벨은 "게스트(Guest) / 회원(Member) / 관리자(Admin)"이며 기본 활성 탭은 로그인 상태에 따라 회원(또는 게스트) 탭이다.
- 탭 밑줄/배경 전환에는 `elevation.card`를 사용하지 않는다(탭은 flat 상태 유지).

---

## 11. Mate Post Card

동행 모집글 카드(SCR-001 §6 미리보기 3건, SCR-004 목록 최대 8건 우선 노출).

- 구조: 제목(`type.title-md`) → 국가·지역·기간(`type.body-sm`, `color.muted`) → 모집 인원/여행 스타일 태그(Chip) → 작성자 신뢰 배지(실명/성인 인증 여부, 매너 온도 — Stitch 검증본 기준 "매너온도 98°C" 형태의 텍스트 배지, **별점(★) 사용 금지**).
- 카드 우측 하단 또는 상세 진입 시 "신고하기" / "이 사용자 차단하기" 보조 액션을 배치한다(SCR-004 상세 패널 필수 요소, §14 참고).
- 카드에는 결제·정산 금액 UI를 넣지 않는다 — "비용 분담 규칙"은 텍스트 설명으로만 노출한다(동행자 간 자율 정산이며 플랫폼 결제가 아님을 명확히 한다).
- 최소 콘텐츠 수: SCR-001 미리보기 3건(0건이면 Empty State), SCR-004 목록 8건 우선 노출(전체는 필터/더보기로 확장).

---

## 12. Drawer · Modal

- **트리거**: 여행지 카드, 안전정보 카드(SCR-001), 동행글 상세(SCR-004 Mobile)는 별도 라우트가 아니라 같은 화면 위 Drawer/Modal로 연다.
- **Desktop(1440px)**: 화면 우측에서 슬라이드인, 폭 480~560px, 배경 스크림 `elevation.scrim`.
- **Mobile(390px)**: 하단에서 슬라이드업하는 풀스크린 Drawer, 상단 고정 닫기 버튼(44×44px 이상).
- 여행지 Drawer 하단의 "이 국가 안전정보 보기" 링크는 같은 Drawer 스택에 안전정보 패널을 push하고, 뒤로가기로 복귀한다(중첩 Drawer, 새 라우트 아님).
- Drawer/Modal이 열릴 때 포커스는 내부 첫 상호작용 요소로 이동하고, `Esc` 또는 배경 클릭으로 닫히며 닫힌 뒤 포커스는 트리거 요소로 복귀한다.
- Radius는 `radius.lg`(20px), `elevation.card`를 항상 적용한다(Drawer는 시스템에서 그림자가 상시 적용되는 유이한 표면 중 하나).

---

## 13. Alert · Toast

- **인라인 오류 배너**: `color.danger-bg` 배경 + `color.danger` 텍스트/아이콘, 폼·목록 액션 실패 시 사용.
- **경고 배지**: `color.warning-bg` 배경 + `color.warning` 텍스트/아이콘 — 여행 안전정보 재확인 필요, 등급 변경 알림 등.
- **정보 배너**: `color.info` 텍스트(배경은 `color.canvas` 또는 `color.surface-soft`) — 외부 이동 고지("이 정보는 외부 사이트로 전달되지 않습니다"), 개인정보 최소 수집 안내 등.
- **성공 Toast**: `color.success-bg`/`color.success`, 화면 상단 또는 하단에 3초 내외 노출 후 자동 소멸("참가 요청을 승인했어요" 등 완료 문장 1개).
- 모든 Alert/Toast는 아이콘 + 텍스트 라벨을 함께 쓴다. 색상만으로 상태를 구분하지 않는다.

---

## 14. Loading · Empty · Error 상태

| 상태 | 규칙 |
|---|---|
| **Loading** | 카드/목록/이미지 자리에 `color.surface-soft` 블록 스켈레톤만 표시하고 텍스트를 넣지 않는다. 스켈레톤은 실제 콘텐츠와 동일한 치수를 가져 레이아웃 이동(CLS)이 없어야 한다. 외부 이동 버튼처럼 순간적인 로딩은 버튼 내부 스피너로 처리한다. |
| **Success** | 정적 데이터 화면(SCR-001·002)은 기본 상태가 곧 Success다. 액션형 화면(SCR-003·004·005)은 완료 즉시 요약 카드 강조 또는 Toast(§13)로 결과를 알린다. |
| **Empty** | 데이터 0건이어도 빈 카드나 빈 여백만 남기지 않는다. 항상 (1) "아직 ○○이 없어요" 완결된 한국어 문장, (2) 이용 방법 1문장, (3) 다음 행동 CTA 버튼 3요소를 갖춘 **완성형 Empty State**로 채운다. (예: SCR-001 동행 미리보기 0건 → "아직 모집중인 동행글이 없어요. 새 동행글을 가장 먼저 올려보세요." + "동행글 작성하기" CTA) |
| **Error** | 실패 원인을 구체적으로 설명하는 한국어 문장 + 재시도 버튼(`color.danger` 텍스트/`color.danger-bg` 배경). "오류가 발생했습니다" 같은 무정보 문구를 단독으로 쓰지 않는다. |
| **Unauthorized** | 역할에 없는 탭·기능은 렌더링하지 않고, 대신 로그인/성인 확인 유도 문장 + CTA로 대체한다(예: SCR-003 동행 탭 비로그인 시 "로그인하고 성인 확인을 완료하면 동행을 모집할 수 있어요"). |

---

## 15. Desktop · Mobile 규칙

| 구분 | 값 |
|---|---|
| Desktop 기준 | **1440px** |
| Mobile 기준 | **390px** |
| Tablet(보조) | 744~1128px — Card Grid 2열, Split은 세로 스택 전환 임계점 |
| Card Grid 컬럼 | Desktop 3~4열 · Tablet 2열 · Mobile 1열(세로 스크롤만, 가로 스크롤 카드열 금지) |
| Split(좌우 분할) | Desktop 좌우 병렬 → Mobile은 세로 스택(상→하) 또는 목록→Drawer 전환 |
| 내비게이션 | Desktop 상단 고정 내비 4항목 노출 → Mobile 햄버거 시트로 수렴 |
| 터치 영역 | 모든 상호작용 요소 최소 44×44px(Mobile·Desktop 공통) |

---

## 16. Page Section 최대 폭과 Desktop·Mobile 상하 여백

- **콘텐츠 최대 폭**: `layout.content-max-width` = **1200~1280px**, 1440px Desktop 캔버스 중앙 정렬(좌우 여백이 잔여 폭 흡수). Mobile은 뷰포트 − 좌우 20px.
- **Section 상하 여백**: Desktop `space.section-desktop`(64~96px), Mobile `space.section-mobile`(40~64px). 모든 Section(Hero 포함)이 이 범위를 벗어나지 않는다 — Airbnb의 64px 단일값보다 Free Traveler는 콘텐츠 밀도에 따라 64~96px 범위를 허용하되 96px을 넘는 "에디토리얼 매거진"급 여백은 사용하지 않는다.
- Header/Footer는 §7의 고정 값(72/56px, 64/40px)을 따르며 이 규칙의 예외가 아니라 이미 그 범위 안에 있다.

---

## 17. Hero 높이와 다음 Section 노출 규칙

- Hero는 1440px 기준 뷰포트 높이의 **55~65%**로 제한한다. `100vh`(뷰포트 전체) Hero는 어떤 화면에서도 금지한다.
- 규칙의 목적은 "첫 화면(fold)에서 다음 Section의 제목 일부가 항상 시각적으로 보이는 것"이다 — Stitch 검증에서 SCR-001·SCR-002 모두 이 기준을 충족함을 확인했다(SCR-002는 Hero가 `100vh`/고정 높이 지정 없이 콘텐츠 기반 auto-height이며 "BY THE NUMBERS" 제목이 바로 아래 노출됨을 검증).
- Hero 내부 구성: 헤드라인(`type.display-xl`/`display-lg`) + 설명 1~2문장(`type.body-lg`) + Primary CTA(+ 검색 입력, SCR-001에 한함). 배경 이미지를 쓰더라도 텍스트 대비를 위한 스크림만 허용하고 Airbnb식 도시 콜라주 그리드는 재현하지 않는다.
- Mobile Hero는 Desktop보다 낮은 비율을 사용하되 동일하게 다음 Section 제목이 fold 하단에 걸쳐 보이도록 한다.

---

## 18. Section별 제목·설명·본문·CTA 계층과 시각적 리듬

모든 Section은 예외 없이 다음 4계층을 갖는다(1~2개만 있는 "장식용 여백 Section"을 만들지 않는다):

1. **제목**(`type.display-md`, 실제 의미가 담긴 한국어 문장형 헤드라인 — "Section 3" 같은 라벨 금지)
2. **설명**(`type.body-md`/`body-lg`, 1~3문장, Section의 목적을 설명)
3. **본문**(Card Grid / Split / Chip 목록 / 3단계 안내 / Form 중 하나의 실제 콘텐츠)
4. **CTA 또는 다음 행동**(버튼, 링크, 또는 다음 Section으로의 자연스러운 유도 — CTA가 없는 Section은 최소한 "다음 행동을 암시하는 문장"을 가져야 한다)

**시각적 리듬**: 같은 패턴(Card Grid 등)이 한 화면에서 반복되더라도 콘텐츠 소재·배지·태그가 서로 달라야 "같은 카드 반복"으로 읽히지 않는다. 6개 재사용 패턴(Hero / Card Grid / 좌우 분할 / Chip 목록 / 3단계 안내 / CTA Banner)은 동일 화면 내에서 동일 패턴을 연속 배치하지 않는다(직전 Section과 다른 패턴을 최소 1회 끼워 넣는다). §22 교차 사용표가 이 규칙의 준수 여부를 화면별로 기록한다.

---

## 19. 화면별 Section 순서와 Card·Timeline·Gallery 최소 콘텐츠 수

아래는 `docs/04_UIUX_PLAN.md` 원안을 Stitch 검증본(docs/STITCH_VALIDATION_REPORT.md)의 실제 확인 결과로 보정한 **최종 확정 계약**이다.

### SCR-001 `/` (7 Section)

| # | 제목 | 패턴 | 최소 콘텐츠 수 |
|---|---|---|---|
| 1 | 어디로 떠날지, 오늘 정해볼까요? | Hero | 검색 입력 1 + Primary CTA 1 |
| 2 | 국내에서 다시 발견하는 여행지 | Card Grid | **6장** |
| 3 | 해외에서 처음 만나는 도시들 | Card Grid | **6장** |
| 4 | 어떤 이유로 떠나고 싶으신가요? | Chip 목록 | **6~7개** |
| 5 | 떠나기 전 꼭 확인할 안전정보 | Card Grid | **6장**(상태 배지 포함) |
| 6 | 함께 떠날 동행을 찾고 있어요 | 좌우 분할 | Mate Post Card **3건**(0건이면 완성형 Empty State) |
| 7 | free_traveler가 소개하는 이유 | CTA Banner | 통계 배지 2개(50+ Trips, 30+ Countries) + `/about` CTA |

### SCR-002 `/about` (7 Section)

| # | 제목 | 패턴 | 최소 콘텐츠 수 |
|---|---|---|---|
| 1 | free_traveler를 소개합니다 | Hero(좌우 분할형) | 인물 사진 1 + 소개 문장 |
| 2 | 숫자로 보는 여행 이력(BY THE NUMBERS) | 좌우 분할 | 통계 카드 **2개 이상** |
| 3 | 왜, 어떻게 여행하는가(PHILOSOPHY) | 좌우 분할(에디토리얼) | 문단 2~4개 + 인용구 1 |
| 4 | 지금까지의 여정(MILESTONES) | 3단계 안내(확장형 Timeline) | **6개 이상** 시점 |
| 5 | 30개국, 4개 권역(FOOTPRINTS) | Chip 목록 | **30개국 이상** |
| 6 | 카메라에 담은 순간들(GALLERY) | Card Grid | **8장 이상** |
| 7 | 다시 가고 싶은 여행지(FAVORITE PLACES) | Card Grid + CTA Banner | **4장** + CTA 2개(`/travel-tools`, `/mates`) |

### SCR-003 `/travel-tools` (6 Section, 탭 전환에 따라 3~6번 교체)

| # | 제목 | 패턴 | 최소 콘텐츠 수 |
|---|---|---|---|
| 1 | 여행 조건부터 정리하고 이동하세요 | 3단계 안내 | 3단계 |
| 2 | 항공편 · 숙소 · 동행 구하기 | Tab 스위처 | **탭 3개**: 비행기 찾기 / 숙소 찾기 / 동행 구하기(각 독립 상태) |
| 3 | 여행 조건을 입력해 주세요 | Form Section | 필드 4개 이상(국가·지역·출발일·귀국일 또는 동행 조건) |
| 4 | 입력한 조건을 확인해 주세요 | CTA Banner(Action Card) | 요약 카드 1 + 외부 이동 CTA(비전달 고지 포함) |
| 5 | 더 편하게 찾는 팁 | Card Grid(Tip) | **3장** |
| 6 | 함께 떠날 동행을 모집해 보세요 | 좌우 분할 | 동행 탭 전용: 안전 안내 또는 작성 폼 |

### SCR-004 `/mates` (6 Section)

| # | 제목 | 패턴 | 최소 콘텐츠 수 |
|---|---|---|---|
| 1 | 함께 떠날 동행을 찾아보세요 | Intro Band | 목적 문장 1~2 + CTA |
| 2 | 조건에 맞는 동행을 좁혀보세요 | Filter Bar | 필터 4종 + 결과 요약 문장 |
| 3 | 모집중인 동행글 | Card Grid | **최대 8장 우선 노출**(0건이면 완성형 Empty State) |
| 4 | 동행글 상세 | 좌우 분할(Desktop) / Drawer(Mobile) | 작성자 요약 + 설명 + 참가 요청 폼 + 신고/차단 버튼 |
| 5 | 참가는 이렇게 진행돼요(HOW IT WORKS) | 3단계 안내 | 3단계 |
| 6 | 안전한 동행을 위한 약속 | CTA Banner | 안전 수칙 문장 + `/travel-tools` CTA |

### SCR-005 `/account` (역할 기반, Dashboard 없음)

| 역할 | 렌더링 탭 | 최소 콘텐츠 수 |
|---|---|---|
| Guest(게스트) | 로그인/가입 | 로그인·회원가입 CTA 2개 + 혜택 안내 3항목 |
| Adult Member(회원) | 프로필 · 내 활동 | 내가 쓴 동행글 **3건**, 보낸/받은 참가 요청 각 목록, 차단 목록 |
| Moderator/Admin(관리자) | 프로필 · 내 활동 · 관리자 | 관리자 탭 정확히 **2개 섹션만**: 신고 처리 현황(목록+상태 배지+처리 버튼), 외부 연결 링크 관리(항공/숙소/공공데이터 링크 상태+수정 버튼) — 통계 그래프·KPI 카드·감사 로그 타임라인 없음 |

역할에 없는 탭은 렌더링하지 않는다(§14 Unauthorized 상태와 연결). 관리자 탭은 Stitch 승인 화면 기준 정확히 2개 섹션으로 고정하며, 이를 초과하는 분석/차트 섹션을 추가하지 않는다.

### Mobile 변형 (SCR-001, SCR-003)

Desktop과 동일한 Section 순서·최소 콘텐츠 수를 유지하고, Card Grid만 1열로 재배치한다. 콘텐츠를 줄이거나 생략하지 않는다(Stitch 검증에서 SCR-001 Mobile 7 Section, SCR-003 Mobile 3탭 모두 Desktop과 동수로 확인됨).

---

## 20. 완성형 Empty State와 Placeholder 문구 금지 규칙

- **금지 문구**: "Lorem ipsum", "준비 중", "정보 확인 필요", "TBD", 빈 문자열 카드, 치수만 있고 텍스트가 없는 카드. 이 문구/패턴은 디자인·구현 어디에도 등장할 수 없다.
- **완성형 Empty State 3요소** (§14 Empty 행과 동일 기준을 재천명):
  1. 완결된 한국어 문장으로 현재 상태 설명("아직 ○○이 없어요.")
  2. 이용 방법을 알려주는 1문장(어떻게 하면 채워지는지)
  3. 다음 행동을 유도하는 CTA 버튼 1개
- Empty State는 빈 여백이나 빈 카드로 대체할 수 없다 — 위 3요소가 모두 있는 완성된 화면 구성 요소로 취급한다.
- 이미지 로딩 지연은 Empty가 아니라 Loading 상태(§14)로 처리하며 `color.surface-soft` 블록으로 치수를 고정한다.
- alt 텍스트도 이 규칙의 적용을 받는다 — "이미지1", "사진" 같은 무의미한 alt를 금지하고 실제 장면을 설명하는 문장을 사용한다.

---

## 21. Do / Do Not

### Do

- 코랄(`color.coral`) 단일 액센트만 사용하고, 페이지의 대부분을 흰 배경 + Ink 텍스트로 유지한다.
- 모든 Section에 제목·설명·본문·CTA 4계층을 채운다(§18).
- Empty State는 항상 완성형 3요소로 채운다(§20).
- 경고·위험·성공은 코랄과 분리된 semantic color + 아이콘 + 텍스트로 표시한다.
- Drawer/Modal, Card, Dropdown에만 `elevation.card` 그림자를 적용한다.
- 여행지·안전정보 상세는 같은 화면의 Drawer로, 항공·숙소·동행 작성은 SCR-003의 3탭으로, 동행 상세는 SCR-004의 상세 패널/Drawer로, 로그인·프로필·내 활동·간단 관리는 SCR-005의 역할별 탭으로 배치한다.
- 모든 상호작용 요소에 44×44px 이상 터치 영역과 2px 코랄 포커스 아웃라인(offset 2px)을 제공한다.
- 이미지 alt 텍스트를 실제 장면 설명 문장으로 작성한다.
- 관리자 탭은 "신고 처리 현황 + 외부 연결 링크 관리" 2개 섹션으로 제한한다.

### Do Not

- **Airbnb 상표 요소**를 재현하지 않는다 — Airbnb 워드마크/로고, Cereal VF 서체, Rausch(#ff385c) 정확 색상값, 하트 저장 아이콘, "Guest favorite"/"NEW" 배지, 3-Product 내비(Homes/Experiences/Services) 등.
- **구매·예약·결제 UI**를 만들지 않는다 — "Reserve" 버튼, 날짜 기반 예약 캘린더, 결제 카드 입력 폼, 수수료/정산 금액 계산 UI는 어떤 화면에도 존재하지 않는다. 항공/숙소는 외부 사이트로 안내만 하고, 동행 비용 분담은 텍스트 설명으로만 언급한다.
- **Proprietary 폰트 파일**을 추가하지 않는다 — 시스템 폰트 스택 + Inter(오픈소스) 외의 상용/라이선스 서체 파일을 프로젝트에 포함하지 않는다.
- **디자인 토큰이 없는 임의 색상**을 추가하지 않는다 — 새 색상이 필요하면 D-002 절차로 토큰화한 뒤 사용한다. 인라인 hex 값을 컴포넌트에 직접 박아 넣지 않는다.
- 별점(★) UI를 사용하지 않는다 — 신뢰 지표는 "매너온도" 같은 텍스트/배지 형태만 허용한다.
- 광고 슬롯, 실시간 항공권/호텔 가격 표시를 넣지 않는다.
- Hero를 `100vh`로 만들지 않는다.
- Dashboard형 통계 그래프·KPI 카드·감사 로그 타임라인을 SCR-005 관리자 탭(혹은 다른 어떤 화면)에도 배치하지 않는다.
- 역할에 없는 탭(Guest에게 프로필/내 활동/관리자 등)을 렌더링하지 않는다.
- Lorem ipsum, "준비 중", "정보 확인 필요" 등 placeholder 문구를 쓰지 않는다(§20).
- 승인된 5개 화면(SCR-001~005) 외의 신규 디자인 Screen을 추가하지 않는다. API Route, 인증 콜백, 404/500/권한 오류 화면은 기술 Route로 유지하고 디자인 Screen으로 세지 않는다.

---

## 22. Section 패턴 교차 사용 점검 (참고)

| 패턴 | SCR-001 | SCR-002 | SCR-003 | SCR-004 |
|---|---:|---:|---:|---:|
| Hero | 1 | 1 | – | – |
| Card Grid | 3 | 2 | 1(팁) | 1 |
| 좌우 분할 | 1 | 2 | 1(폼/동행) | 1(목록+상세) |
| Chip 목록 | 1 | 1 | – | – |
| 3단계 안내 | – | 1(타임라인) | 1 | 1 |
| CTA Banner | 1 | 1(결합) | 1(Action Card) | 1 |

같은 패턴이 한 화면에서 여러 번 쓰여도(SCR-001의 Card Grid 3회 등) 카드 소재(여행지/안전정보/사진)와 배지·태그가 달라 "같은 카드 반복"에 해당하지 않는다(§18 시각적 리듬 규칙 적용 결과).

---

## 23. 커버리지 확인

- 본 문서는 `docs/04_UIUX_PLAN.md`에 정의된 5개 화면(SCR-001~005)과 `docs/STITCH_VALIDATION_REPORT.md`에서 **PASS** 판정을 받은 승인 화면(SCR-001~005 Desktop, SCR-001·SCR-003 Mobile)만을 정본화했다. 화면을 추가로 생성하지 않았다.
- `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 기능(콘텐츠 CMS, 미디어 업로드 워크플로, 범용 감사 로그, 제재 시스템, 실시간 가격 연동 등)은 이 디자인 정본에도 반영하지 않았다.
- 이 문서가 LOCKED 상태인 한, 구현은 §1~§22의 토큰·계약을 그대로 따라야 하며 변경은 새 버전(D-002) 발행을 통해서만 이루어진다.
