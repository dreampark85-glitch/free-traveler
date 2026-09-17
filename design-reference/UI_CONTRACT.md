# UI Contract — Free Traveler (Next.js App Router)

- **Document ID:** UICONTRACT-TRAVEL-001
- **기반 문서:** `docs/03_UI_COVERAGE_ANALYSIS.md`, `docs/04_UIUX_PLAN.md`, `docs/STITCH_VALIDATION_REPORT.md`, `design-reference/D-001/DESIGN.md`
- **대상:** 승인된 5개 Screen(SCR-001~005)을 `src/app`(App Router) 구현 계약으로 변환한다.
- **현재 `src/app` 상태:** `src/app/page.tsx`는 아직 `create-next-app` 스타터 템플릿(Next.js 로고 + "To get started, edit the page.tsx file" 보일러플레이트)이다 — SCR-001 구현 시 전량 교체 대상이며, 이 계약의 `starter_template_forbidden` 플래그가 이를 명시적으로 금지한다.
- **화면 티어**: **핵심 4개** — SCR-001(`/`), SCR-003(`/travel-tools`), SCR-004(`/mates`), SCR-005(`/account`) — 는 탐색→조건 정리/동행 작성→동행 조회→계정 관리로 이어지는 사용자의 핵심 과업 흐름을 구성한다. **보조 1개** — SCR-002(`/about`) — 는 신뢰도 판단을 위한 정적 열람 화면으로 핵심 과업 흐름 밖에 있으며 CTA를 통해서만 핵심 흐름과 연결된다.

---

## SCR-001 — 메인 (핵심)

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-001 |
| **Route** | `/` |
| **Page Entry** | `src/app/page.tsx` |
| **Tier** | 핵심(core) |

### 영역 순서 (Section, 7개)

1. Hero — 검색 입력 + Primary CTA("여행 조건부터 정리하기" → SCR-003)
2. 국내 인기 여행지 — Card Grid 6장
3. 해외 인기 도시 — Card Grid 6장
4. 여행 동기 — Chip 목록 6~7개
5. 국가별 안전정보 — Card Grid 6장(상태 배지 포함)
6. 함께 떠날 동행 — 좌우 분할(Mate Post Card 3건 미리보기)
7. free_traveler 소개 — CTA Banner(통계 배지 + `/about` CTA)

### 주요 Component

- `SearchBar`(pill), `DestinationCard`(§D-001 §9), `ThemeChip`, `SafetyBadgeCard`, `MatePostCard`(미리보기), `DestinationDrawer`, `SafetyInfoDrawer`(중첩 push), `CtaBanner`, 전역 `Header`/`Footer`

### 상태

| 상태 | 적용 영역 | 내용 |
|---|---|---|
| Loading | 2·3·5번 초기 렌더, Drawer 오픈 시 | 카드형 스켈레톤(제목 바+이미지 블록), 문구 없음 |
| Success | 전체 | 정적 데이터 기반 기본 상태 |
| Empty | 6번 | "아직 모집중인 동행글이 없어요. 새 동행글을 가장 먼저 올려보세요." + "동행글 작성하기" CTA(→ SCR-003 동행 탭) |
| Error | 5·6번 Drawer 로드 실패, 검색 실패 | "정보를 불러오지 못했습니다. 다시 시도해 주세요." + 재시도 버튼 |
| Unauthorized | 해당 없음 | 전체 공개 화면 |

### 사용자 행동

- 검색어 입력·제출(REQ-FUNC-003), 국내/해외 탭 전환(REQ-FUNC-001), 필터 적용(REQ-FUNC-002/010 URL 동기화), 테마 Chip 클릭 → 카드 그리드 필터링, 여행지 카드 선택 → 상세 Drawer 오픈(REQ-FUNC-004/009), Drawer 내 "이 국가 안전정보 보기" → 안전정보 Drawer push(REQ-FUNC-006/047~054), 즐겨찾기 토글(REQ-FUNC-068, localStorage), 공유 버튼(REQ-FUNC-069), 빈 결과 초기화(REQ-FUNC-005)

### 다른 화면으로의 이동

| 트리거 | 대상 |
|---|---|
| Hero 보조 CTA "여행 조건부터 정리하기" | SCR-003 `/travel-tools` |
| 동행 미리보기 카드/Empty CTA | SCR-004 `/mates` |
| CTA Banner "free_traveler가 소개하는 이유" | SCR-002 `/about` |
| 안전정보 Drawer 내 MOFA 링크(REQ-FUNC-049) | 외부(새 탭, `noopener,noreferrer`) |

### Desktop · Mobile 규칙

- Desktop 1440px: 콘텐츠 폭 1200~1280px, Card Grid 3~4열, Hero 높이 뷰포트 55~65%(D-001 §17), Drawer는 우측 슬라이드인(폭 480~560px).
- Mobile 390px: Card Grid 1열, Drawer는 하단 풀스크린 슬라이드업(닫기 버튼 44×44px 이상), Header는 햄버거 시트로 수렴.
- Section 상하 여백: Desktop 64~96px / Mobile 40~64px(D-001 §16).

### 금지 기능

- 검색 결과에 실시간 가격·광고·별점(★) 표시 금지.
- Hero `100vh` 금지, 다음 Section 제목이 항상 fold에 걸쳐 보여야 함.
- Airbnb 워드마크/하트 저장 아이콘/"Guest favorite" 배지 재현 금지.
- Lorem ipsum·"준비 중"·"정보 확인 필요" placeholder 금지 — Empty는 완성형 3요소로만 구성.

---

## SCR-002 — 대표 소개 (보조)

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-002 |
| **Route** | `/about` |
| **Page Entry** | `src/app/about/page.tsx` |
| **Tier** | 보조(supporting) |

### 영역 순서 (Section, 7개)

1. Hero(좌우 분할형) — 대표 인물 사진 + 소개 한 문장
2. 숫자로 보는 여행 이력(BY THE NUMBERS) — 좌우 분할, 통계 카드 2개 이상
3. 왜, 어떻게 여행하는가(PHILOSOPHY) — 좌우 분할(에디토리얼), 문단 2~4개 + 인용구
4. 지금까지의 여정(MILESTONES) — 3단계 안내형 확장 Timeline, 6개 이상 시점
5. 30개국, 4개 권역(FOOTPRINTS) — Chip 목록, 30개국 이상
6. 카메라에 담은 순간들(GALLERY) — Card Grid, 8장 이상
7. 다시 가고 싶은 여행지(FAVORITE PLACES) — Card Grid 4장 + CTA Banner

### 주요 Component

- `ProfileHero`, `StatCard`, `TimelineItem`, `RegionChip`, `GalleryCard`, `DestinationCard`(재사용), `CtaBanner`(2 CTA 결합형)

### 상태

| 상태 | 적용 | 내용 |
|---|---|---|
| Loading | 6번 갤러리 이미지 lazy-load | `color.surface-soft` 블록, 치수 고정(CLS 방지) |
| Success | 전체 | 정적 프로필 데이터 |
| Empty | 해당 없음 | 정적 시드 데이터로 항상 채워짐 |
| Error | 7번 카드 → SCR-001 이동 실패 | "여행지 정보를 열 수 없습니다" 인라인 오류 + 다시 시도 |
| Unauthorized | 해당 없음 | 전체 공개 |

### 사용자 행동

- 타임라인 스크롤 열람(REQ-FUNC-060), 권역 Chip 클릭 → 설명 토글(REQ-FUNC-059), 갤러리 열람(REQ-FUNC-061), 추천 여행지 카드 선택(REQ-FUNC-063), 문의·SNS 링크 클릭(REQ-FUNC-062, 외부)

### 다른 화면으로의 이동

| 트리거 | 대상 |
|---|---|
| 추천 여행지 카드(7번) | SCR-001 `/` (해당 여행지 상세 Drawer) |
| CTA Banner "직접 조건을 정리해볼까요?" | SCR-003 `/travel-tools` |
| CTA Banner "함께 갈 동행을 찾아볼까요?" | SCR-004 `/mates` |
| 문의·SNS 링크 | 외부(새 탭) |

### Desktop · Mobile 규칙

- Desktop 1440px: 좌우 분할 Section은 2컬럼, Timeline은 가로 배열, Chip 목록은 랩(wrap).
- Mobile 390px: 좌우 분할 → 세로 스택(상→하), Timeline은 세로 스택, Card Grid 1열.
- Hero는 `100vh`/고정 뷰포트 높이 금지, auto-height로 바로 아래 "BY THE NUMBERS" 제목이 노출되어야 함(Stitch 검증 확인 사항).

### 금지 기능

- 별점·리뷰 위젯 금지(정량 지표는 여행 통계 숫자로만 표현).
- 갤러리에 라이트박스/이미지 확대 예약 UI 없이 그리드로만 노출(D-001 §19 계약 준수).
- Airbnb "Rating display"(64px 대형 숫자) 등 상표적 레이아웃 재현 금지 — 통계 카드는 `type.display-xl` 토큰만 재사용.
- Lorem ipsum·"준비 중" placeholder 금지.

---

## SCR-003 — 통합 여행 준비 (핵심)

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-003 |
| **Route** | `/travel-tools` |
| **Page Entry** | `src/app/travel-tools/page.tsx` |
| **Tier** | 핵심(core) |

### 영역 순서 (Section, 6개 — 탭 전환에 따라 3~6번 콘텐츠 교체)

1. 여행 조건부터 정리하고 이동하세요 — 3단계 안내(입력→요약→외부 이동/게시)
2. 항공편 · 숙소 · 동행 구하기 — Tab 스위처(비행기 찾기 / 숙소 찾기 / 동행 구하기, 탭별 독립 상태)
3. 여행 조건을 입력해 주세요 — Form Section(항공/숙소 탭) 또는 안전 안내/작성 폼(동행 탭)
4. 입력한 조건을 확인해 주세요 — CTA Banner(Action Card), 요약 + 외부 이동 CTA(비전달 고지 포함)
5. 더 편하게 찾는 팁 — Card Grid 3장(Tip)
6. 함께 떠날 동행을 모집해 보세요 — 좌우 분할(동행 탭 콘텐츠)

### 주요 Component

- `TabSwitcher`(pill, 3탭 독립 상태), `TravelConditionForm`, `ValidationErrorBanner`, `SummaryActionCard`, `OutboundLinkButton`, `TipCard`, `MateComposerForm`, `SafetyConsentCheckbox`, `LoginGateBanner`

### 상태

| 상태 | 적용 | 내용 |
|---|---|---|
| Loading | 4번 외부 이동 버튼 클릭 순간 | 버튼 내부 스피너, 짧게 자동 종료 |
| Success | 4번 요약 확인, 6번 동행 글 게시 완료 | 요약 카드 강조 / 게시 완료 시 SCR-004 상세로 리다이렉트 |
| Empty | 해당 없음(입력 폼 초기값은 Empty 상태 아님) | — |
| Error | 3번 검증 실패, 4번 외부 URL 미설정, 6번 연락처 탐지·필수값 누락 | 필드별 인라인 오류 + 상단 요약 오류 배너 |
| Unauthorized | 6번 동행 탭, 비로그인/미성년 | 폼 대신 로그인·성인 확인 안내 + SCR-005 CTA |

### 사용자 행동

- 탭 전환(REQ-FUNC-011/019, URL 유지·state 전환), 국가→지역 종속 선택(REQ-FUNC-012/020), 날짜 입력·검증(REQ-FUNC-013/021), 요약 확인(REQ-FUNC-014/022), 비전달 고지 확인(REQ-FUNC-015/023), 외부 이동 클릭(REQ-FUNC-016/024, `noopener,noreferrer`), 동행 작성 폼 입력·연락처 탐지 검증(REQ-FUNC-031/032), 안전수칙 동의 체크(REQ-FUNC-080)

### 다른 화면으로의 이동

| 트리거 | 대상 |
|---|---|
| 항공 탭 외부 이동 버튼 | 외부 항공 검색 사이트(새 탭) |
| 숙소 탭 외부 이동 버튼 | 외부 숙소 검색 사이트(새 탭) |
| 동행 게시 완료 | SCR-004 `/mates` (게시된 글 상세) |
| 동행 탭 비로그인/미성년 로그인 CTA | SCR-005 `/account` (로그인/가입 탭) |

### Desktop · Mobile 규칙

- Desktop 1440px: Form Section은 좌(입력)/우(안내 카드) 분할.
- Mobile 390px: Form Section 세로 스택(입력 → 안내), 탭 Pill은 가로 스크롤 없이 3개가 한 줄에 들어가도록 축약 라벨 사용.
- 탭별 검증·완료 상태는 클라이언트 상태로 격리하며 URL 파라미터에 탭 외 입력값을 노출하지 않는다(REQ-FUNC-017/025 서버 미저장 원칙과 함께 클라이언트에서도 탭 전환 시 상호 오염 금지).

### 금지 기능

- 실시간 항공권/숙소 가격 표시, 예약·결제 UI(날짜 기반 예약 캘린더, 결제 카드 입력) 절대 금지 — 외부 링크 이동만 허용.
- 동행 탭에 연락처(전화번호/SNS 아이디 패턴) 직접 노출 허용 금지 — 탐지 시 오류 처리(REQ-FUNC-032).
- Lorem ipsum·"준비 중" placeholder 금지.

---

## SCR-004 — 동행 조회 (핵심)

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-004 |
| **Route** | `/mates` |
| **Page Entry** | `src/app/mates/page.tsx` |
| **Tier** | 핵심(core) |

### 영역 순서 (Section, 6개)

1. 함께 떠날 동행을 찾아보세요 — Intro Band(목적 문장 + "동행글 작성하기" CTA)
2. 조건에 맞는 동행을 좁혀보세요 — Filter Bar(국가/지역·기간·테마·모집 상태) + 결과 요약 문장
3. 모집중인 동행글 — Card Grid, 최대 8장 우선 노출
4. 동행글 상세 — 좌우 분할(Desktop) / Drawer(Mobile), 참가 요청 폼 + 신고·차단 버튼
5. 참가는 이렇게 진행돼요(HOW IT WORKS) — 3단계 안내
6. 안전한 동행을 위한 약속 — CTA Banner(안전수칙 + `/travel-tools` CTA)

### 주요 Component

- `FilterBar`, `ResultSummaryText`, `MatePostCard`(목록), `MatePostDetailPanel`/`MatePostDetailDrawer`, `ParticipationRequestForm`, `ReportButton`, `BlockButton`, `MannerTemperatureBadge`(텍스트/배지 형태, 별점 아님), `HowItWorksSteps`, `CtaBanner`

### 상태

| 상태 | 적용 | 내용 |
|---|---|---|
| Loading | 3번 목록, 4번 상세 패널 | 카드/패널 스켈레톤 |
| Success | 3·4번 | 기본 목록·상세 표시 |
| Empty | 3번(결과 0건) | "조건에 맞는 동행글이 아직 없어요." + "검색 조건 초기화" + "새 동행글 작성하기" CTA + 5번 앵커 링크 |
| Error | 4번 참가 요청/신고/차단 처리 실패 | 인라인 오류 배너 + 재시도 버튼 |
| Unauthorized | 4번 참가 요청·신고·차단, 비로그인/미성년 | 로그인·성인 확인 안내 + SCR-005 CTA |

### 사용자 행동

- 필터 적용(REQ-FUNC-030), 카드 선택 → 상세 진입(REQ-FUNC-030/033/037), 참가 요청 제출(REQ-FUNC-034, 중복 요청 제약 REQ-FUNC-035), 신고 제출(REQ-FUNC-039), 차단 실행(REQ-FUNC-040), 자동 마감 파생 상태 반영(REQ-FUNC-037), 처리 결과 Toast 수신(REQ-FUNC-043)

### 다른 화면으로의 이동

| 트리거 | 대상 |
|---|---|
| "동행글 작성하기" CTA(1·6번) | SCR-003 `/travel-tools` (동행 탭) |
| "내 활동에서 요청 상태 확인" 링크 | SCR-005 `/account` (내 활동 탭) |
| 비로그인 참가요청/신고/차단 시도 | SCR-005 `/account` (로그인/가입 탭) |

### Desktop · Mobile 규칙

- Desktop 1440px: 4번 상세는 좌(목록 유지)/우(상세 패널) 좌우 분할.
- Mobile 390px: 4번 상세는 목록 아래 하단 슬라이드업 Drawer로 전환(별도 라우트 아님).
- Card Grid는 Desktop 3~4열, Mobile 1열.

### 금지 기능

- 별점(★) UI 금지 — 신뢰 지표는 텍스트/배지형 "매너온도"만 허용.
- 참가 요청·신고·차단 흐름에 결제·정산 UI 금지(비용 분담은 텍스트 설명으로만).
- 신고/차단 처리에 공개 감사 로그 타임라인·통계 대시보드 노출 금지(관리자 처리는 SCR-005 관리자 탭에서만, PROJECT_SCOPE EXCLUDED 항목 REQ-FUNC-042 제재 UI 포함 금지).
- Lorem ipsum·"준비 중" placeholder 금지 — Empty는 완성형 3요소로만.

---

## SCR-005 — 계정 · 관리 (핵심)

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-005 |
| **Route** | `/account` |
| **Page Entry** | `src/app/account/page.tsx` |
| **Tier** | 핵심(core) |

### 영역 순서 (역할 기반 탭 — Section이 아니라 역할별 렌더링 단위)

- 공통 Intro: 로그인 상태 배지 + "계정을 관리하고 내 활동을 확인하세요"
- **Guest(비로그인)**: 로그인/가입 탭만 렌더링 — 계정 기능 소개 → 인증 Card(로그인/가입/비밀번호 재설정) → 로그인 후 가능한 기능 Chip 4개 → 보안 안내 CTA Banner
- **Adult Member(회원)**: 프로필 탭(프로필 요약 좌우 분할 + 성인 확인 상태 배지) · 내 활동 탭(내가 쓴 동행글 Card Grid, 보낸/받은 참가 요청 좌우 분할, 차단 목록)
- **Moderator/Admin(관리자)**: 프로필 · 내 활동 · 관리자 탭(정확히 2개 섹션만) — 신고 처리 현황(목록+상태 배지+처리 버튼), 외부 연결 링크 관리(항공/숙소 URL + 수정 버튼)

### 주요 Component

- `RoleTabSwitcher`(Guest/Member/Admin — 역할에 없는 탭 미렌더링), `AuthForm`(로그인/가입/비밀번호 재설정), `ProfileEditForm`, `AdultVerificationBadge`, `MyMatePostCard`, `RequestListPanel`(보낸/받은), `BlockListPanel`, `ReportStatusTable`, `OutboundUrlConfigForm`, `Toast`

### 상태

| 상태 | 적용 | 내용 |
|---|---|---|
| Loading | 인증 세션 확인 중, 목록 fetch 중 | 탭 콘텐츠 스켈레톤, 탭 자체는 깜빡임 없이 유지 |
| Success | 로그인 성공, 프로필 저장, 요청 승인/거절, URL 저장 | Toast로 결과 표시("참가 요청을 승인했어요" 등) |
| Empty | 내 글/받은 요청/보낸 요청/차단 목록/신고 목록 0건 | "아직 ○○이 없어요" + 다음 행동 CTA(글쓰기, 여행지 탐색 등) |
| Error | 저장/승인/거절/URL 검증 실패 | 인라인 오류 배너 + 원인 문장(예: "HTTPS 주소만 저장할 수 있어요") |
| Unauthorized | 비로그인 상태로 프로필/내 활동/관리자 탭 접근, 비Admin의 관리자 탭 접근 | 해당 탭 렌더링하지 않고 Guest 탭(로그인/가입)만 표시 |

### 사용자 행동

- 로그인/가입 제출(REQ-FUNC-066), 성인 확인(REQ-FUNC-028), 프로필 수정(REQ-FUNC-029), 내 글 수정·마감·삭제(REQ-FUNC-038), 참가 요청 승인·거절(REQ-FUNC-036), 차단 목록 관리(REQ-FUNC-040 연계), 관리자: 신고 상태 변경(REQ-FUNC-041), 외부 URL 저장(REQ-FUNC-077)

### 다른 화면으로의 이동

| 트리거 | 대상 |
|---|---|
| 내 글/참가 요청 카드 | SCR-004 `/mates` (해당 모집글 상세) |
| Guest 탭 "동행 모집·참가 이용 안내" 내 링크 | SCR-003 `/travel-tools` (동행 탭, 로그인 후 재진입 유도) |

### Desktop · Mobile 규칙

- Desktop 1440px: 프로필/내 활동 하위 영역은 좌우 분할(요약/폼, 보낸/받은 요청).
- Mobile 390px: 좌우 분할 → 세로 스택, 탭 Pill 3개(Guest는 1개)가 한 줄에 들어가도록 축약 라벨 사용.
- 역할 전환(탭 변경) 시 페이지 리로드 없이 클라이언트 상태로 처리한다.

### 금지 기능

- 관리자 탭에 통계 그래프·KPI 카드·감사 로그 타임라인 등 Dashboard형 요소 절대 금지 — "신고 처리 현황"·"외부 연결 링크 관리" 2개 섹션 외 추가 금지(D-001 §19 SCR-005 계약).
- 회원 탈퇴 처리 등 EXCLUDED 백엔드 기능(REQ-FUNC-045/REQ-NF-018)의 UI 노출 금지.
- 역할에 없는 탭을 DOM에 렌더링하거나 CSS로만 숨기는 방식(cross-role leakage) 금지 — 서버/클라이언트 모두에서 실제로 렌더링하지 않는다.
- Lorem ipsum·"준비 중" placeholder 금지.

---

## 부록 — Screen 수·Route 검증

| 검증 항목 | 결과 |
|---|---|
| Screen 수 | 5 (SCR-001~005) |
| Route 중복 | 없음 (`/`, `/about`, `/travel-tools`, `/mates`, `/account`) |
| Page Entry 중복 | 없음 (`page.tsx` 5개, 서로 다른 디렉터리) |
| 핵심/보조 구분 | 핵심 4(SCR-001·003·004·005) / 보조 1(SCR-002) |
| 기술 Route | Screen 수에서 제외 — `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `technical_routes` 참고 |
