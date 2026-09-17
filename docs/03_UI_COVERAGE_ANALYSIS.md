# UI Coverage Analysis — Free Traveler

- **Document ID:** UICOV-TRAVEL-001
- **기반 문서:** `02_SRS_BASELINE.md`, `PROJECT_SCOPE.md`
- **대상 요구사항:** `REQ-FUNC-001`~`REQ-FUNC-080`(80개), `REQ-NF-001`~`REQ-NF-034`(34개) — **총 114개**
- **목적:** SRS 전체 요구사항을 삭제 없이 5개 디자인 Screen 위에 배치하고, 각 요구사항이 화면 자체(UI_DIRECT), 화면을 움직이는 상태/로직(UI_STATE), 화면과 무관한 기술 요구사항(NON_UI), 운영·관리 기능(OPERATIONS) 중 무엇인지 분류한다.

## 1. 분류 기준

| 분류 | 정의 |
|---|---|
| **UI_DIRECT** | 사용자에게 직접 렌더링되는 화면 요소(필드, 버튼, 배지, 섹션, 안내문 등)로 구현되는 요구사항 |
| **UI_STATE** | 화면에는 직접 드러나지 않지만 화면의 동작을 결정하는 클라이언트 상태·파생 로직(URL 동기화, localStorage, 파생 마감 상태 등) |
| **NON_UI** | 서버·데이터·보안·빌드 검증 등 화면 요소로 직접 렌더링되지 않는 기술 요구사항 |
| **OPERATIONS** | 관리자·운영자·거버넌스·모니터링·SLA·비용 등 운영 업무에 속하는 요구사항(관리자 탭에 렌더링되는 경우도 포함) |

`PROJECT_SCOPE` 열의 값은 `docs/PROJECT_SCOPE.md`의 분류(IMPLEMENT / IMPLEMENT(축소) / EXCLUDED)를 그대로 인용한다. 본 문서에서 EXCLUDED 항목을 구현 범위로 되돌리지 않는다.

## 2. 디자인 Screen 5종 고정

| Screen ID | Route | 사용자 목표 | 주요 영역 | 상태 | 이동 목적지 |
|---|---|---|---|---|---|
| **SCR-001** | `/` 메인 | 국내·해외 여행지를 탐색하고 상세·안전정보까지 한 화면 흐름에서 확인한다 | 여행지 목록/필터/검색, 통합 검색바, 즐겨찾기, 여행지 상세 Drawer/Modal, 국가 안전정보 Drawer/Modal, 전역 내비게이션·푸터 | 목록(default) → 필터 적용 → 상세 Drawer 열림 → 안전정보 Drawer 열림 | SCR-003(항공/숙소 조건 입력 시작), SCR-002(대표 추천 여행지), 외부 MOFA 링크(새 탭) |
| **SCR-002** | `/about` 대표 소개 | `free_traveler`의 여행 경력과 편집 기준을 확인해 콘텐츠 신뢰도를 판단한다 | 대표 이미지·소개, `50+`/`30+` 수치 카드, 철학·편집 원칙, 방문 권역 지도/목록, 여행 타임라인, 추천 여행지 6곳, 문의·SNS 링크 | 정적 열람 화면(단일 상태) | SCR-001(추천 여행지 상세로 이동) |
| **SCR-003** | `/travel-tools` 통합 여행 준비 | 항공·숙소 조건을 정리해 외부 사이트로 이동하거나 동행 모집글을 작성한다 | 3탭 구조: ①항공 입력·요약·외부 이동 ②숙소 입력·요약·외부 이동 ③동행 글쓰기(안전수칙 동의 포함) | 탭별 입력 → 검증 → 요약 → (항공/숙소)외부 이동 또는 (동행)게시 | 항공: 외부 항공 사이트(새 탭) · 숙소: 외부 숙소 사이트(새 탭) · 동행: 게시 후 SCR-004 해당 글 상세로 이동 |
| **SCR-004** | `/mates` 동행 조회 | 조건에 맞는 동행 모집글을 찾아 참가를 요청하거나 신고·차단한다 | 모집글 목록·필터, 모집글 상세 패널(참가 요청 폼, 신고, 차단) | 목록 → 상세 패널 열림 → 참가 요청 제출/신고/차단 처리 | SCR-003(동행 글쓰기 탭으로 새 글 작성), SCR-005(내 활동에서 요청 상태 확인) |
| **SCR-005** | `/account` 계정·관리 | 로그인하고 내 프로필·활동을 관리하며(관리자는) 신고 상태·외부 URL을 관리한다 | 탭 구조: ①로그인/가입/성인확인 ②프로필 ③내 활동(내 글, 참가 요청 관리, 차단 관리) ④간단 관리자(신고 상태, 외부 URL 설정) | 비로그인(로그인 탭) → 로그인 후 프로필/내 활동 탭 → (권한 있는 경우) 관리자 탭 | SCR-004(내 글/요청 관련 모집글 상세로 이동) |

> API Route, 인증 콜백(`/auth/callback` 등), 404/500/권한 오류 화면은 기술 Route로 취급하며 위 5개 디자인 Screen 수에 포함하지 않는다(지시사항 9). 이용약관·개인정보 처리방침 등 정적 정책 페이지도 보조 콘텐츠 Route로 취급해 핵심 Screen 수에 포함하지 않는다.

---

## 3. REQ-FUNC-001~080 매핑

### 3.1 F1. Destination Guide → SCR-001

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-FUNC-001 | UI_DIRECT | SCR-001 (국내/해외 탭) | IMPLEMENT |
| REQ-FUNC-002 | UI_DIRECT | SCR-001 (필터 컨트롤) | IMPLEMENT |
| REQ-FUNC-003 | UI_DIRECT | SCR-001 (검색 입력) | IMPLEMENT |
| REQ-FUNC-004 | UI_DIRECT | SCR-001 (여행지 상세 Drawer/Modal) | IMPLEMENT |
| REQ-FUNC-005 | UI_DIRECT | SCR-001 (빈 결과 안내·초기화) | IMPLEMENT |
| REQ-FUNC-006 | UI_DIRECT | SCR-001 (상세 Drawer → 안전정보 Drawer 연결) | IMPLEMENT |
| REQ-FUNC-007 | UI_DIRECT | SCR-001 (이미지 alt/출처 표시) | IMPLEMENT |
| REQ-FUNC-008 | NON_UI | N/A (빌드 시 데이터 수량 검증 스크립트) | IMPLEMENT |
| REQ-FUNC-009 | UI_DIRECT | SCR-001 (상세 Drawer 내 관련 여행지) | IMPLEMENT |
| REQ-FUNC-010 | UI_STATE | SCR-001 (URL 쿼리 필터 상태 동기화) | IMPLEMENT |

### 3.2 F2. Flight Link-out → SCR-003 (탭 1: 항공)

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-FUNC-011 | UI_DIRECT | SCR-003 항공 탭 (입력 필드) | IMPLEMENT |
| REQ-FUNC-012 | UI_STATE | SCR-003 항공 탭 (국가 종속 지역 목록 파생) | IMPLEMENT |
| REQ-FUNC-013 | UI_DIRECT | SCR-003 항공 탭 (날짜 검증 오류 표시) | IMPLEMENT |
| REQ-FUNC-014 | UI_DIRECT | SCR-003 항공 탭 (입력 요약 화면) | IMPLEMENT |
| REQ-FUNC-015 | UI_DIRECT | SCR-003 항공 탭 (비전달 고지문) | IMPLEMENT |
| REQ-FUNC-016 | UI_DIRECT | SCR-003 항공 탭 (외부 이동 버튼) | IMPLEMENT |
| REQ-FUNC-017 | NON_UI | SCR-003 항공 탭 (서버 미저장 원칙) | IMPLEMENT |
| REQ-FUNC-018 | UI_DIRECT | SCR-003 항공 탭 (오류·재시도 UI) | IMPLEMENT |

### 3.3 F3. Hotel Link-out → SCR-003 (탭 2: 숙소)

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-FUNC-019 | UI_DIRECT | SCR-003 숙소 탭 (입력 필드) | IMPLEMENT |
| REQ-FUNC-020 | UI_STATE | SCR-003 숙소 탭 (국가 종속 지역 목록 파생) | IMPLEMENT |
| REQ-FUNC-021 | UI_DIRECT | SCR-003 숙소 탭 (날짜 검증 오류 표시) | IMPLEMENT |
| REQ-FUNC-022 | UI_DIRECT | SCR-003 숙소 탭 (입력 요약 화면) | IMPLEMENT |
| REQ-FUNC-023 | UI_DIRECT | SCR-003 숙소 탭 (비전달 고지문) | IMPLEMENT |
| REQ-FUNC-024 | UI_DIRECT | SCR-003 숙소 탭 (외부 이동 버튼) | IMPLEMENT |
| REQ-FUNC-025 | NON_UI | SCR-003 숙소 탭 (서버 미저장 원칙) | IMPLEMENT |
| REQ-FUNC-026 | UI_DIRECT | SCR-003 숙소 탭 (오류·재시도 UI) | IMPLEMENT |

### 3.4 F4. Travel Mate → SCR-003(작성) / SCR-004(조회·상세) / SCR-005(내 활동·관리자)

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-FUNC-027 | NON_UI | SCR-003 동행 탭 (쓰기 진입 인증 게이트) | IMPLEMENT |
| REQ-FUNC-028 | UI_STATE | SCR-005 계정 탭 (성인 확인 상태) | IMPLEMENT |
| REQ-FUNC-029 | UI_DIRECT | SCR-005 프로필 탭 (닉네임·연령대·스타일 필드) | IMPLEMENT |
| REQ-FUNC-030 | UI_DIRECT | SCR-004 목록 (필터 컨트롤) | IMPLEMENT |
| REQ-FUNC-031 | UI_DIRECT | SCR-003 동행 탭 (작성 폼) | IMPLEMENT |
| REQ-FUNC-032 | UI_DIRECT | SCR-003 동행 탭 (연락처 탐지 오류) | IMPLEMENT |
| REQ-FUNC-033 | NON_UI | SCR-004 상세 패널 (응답 필드 제외) | IMPLEMENT |
| REQ-FUNC-034 | UI_DIRECT | SCR-004 상세 패널 (참가 요청 폼) | IMPLEMENT |
| REQ-FUNC-035 | NON_UI | SCR-004 상세 패널 (중복 요청 제약) | IMPLEMENT |
| REQ-FUNC-036 | UI_DIRECT | SCR-005 내 활동 탭 (요청 승인·거절) | IMPLEMENT |
| REQ-FUNC-037 | UI_STATE | SCR-004 목록/상세 (자동 마감 파생 상태) | IMPLEMENT |
| REQ-FUNC-038 | UI_DIRECT | SCR-005 내 활동 탭 (내 글 수정·마감·삭제) | IMPLEMENT |
| REQ-FUNC-039 | UI_DIRECT | SCR-004 상세 패널 (신고 폼) | IMPLEMENT(축소) |
| REQ-FUNC-040 | UI_DIRECT | SCR-004 상세 패널 (차단 버튼) | IMPLEMENT(축소) |
| REQ-FUNC-041 | OPERATIONS | SCR-005 관리자 탭 (신고 상태 목록) | IMPLEMENT(축소) |
| REQ-FUNC-042 | OPERATIONS | 해당 없음(관리자 탭에 별도 제재 기능 미배치) | EXCLUDED |
| REQ-FUNC-043 | UI_DIRECT | 전역 Toast (트리거: SCR-004 요청/SCR-005 처리) | IMPLEMENT(축소) |
| REQ-FUNC-044 | NON_UI | 전역 (SCR-004·SCR-005 비공개 데이터 접근 제어) | IMPLEMENT |
| REQ-FUNC-045 | OPERATIONS | SCR-005 계정 탭 (탈퇴 처리 백엔드) | EXCLUDED |

### 3.5 F5. Country Safety → SCR-001 (Drawer/Modal)

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-FUNC-046 | NON_UI | N/A (빌드 시 국가 커버리지 검증) | IMPLEMENT |
| REQ-FUNC-047 | UI_DIRECT | SCR-001 안전정보 Drawer/Modal (8개 카테고리) | IMPLEMENT |
| REQ-FUNC-048 | UI_DIRECT | SCR-001 안전정보 Drawer/Modal (출처·확인일) | IMPLEMENT |
| REQ-FUNC-049 | UI_DIRECT | SCR-001 안전정보 Drawer/Modal (MOFA 링크) | IMPLEMENT |
| REQ-FUNC-050 | UI_DIRECT | SCR-001 안전정보 Drawer/Modal (stale 배지) | IMPLEMENT |
| REQ-FUNC-051 | UI_DIRECT | SCR-001 안전정보 Drawer/Modal (중대 경보 상단 표시) | IMPLEMENT |
| REQ-FUNC-052 | UI_DIRECT | SCR-001 안전정보 Drawer/Modal (국가·지역 범위 표시) | IMPLEMENT |
| REQ-FUNC-053 | UI_DIRECT | SCR-001 안전정보 Drawer/Modal (긴급연락처) | IMPLEMENT |
| REQ-FUNC-054 | UI_DIRECT | SCR-001 안전정보 Drawer/Modal + SCR-003 요약(고지 재사용) | IMPLEMENT |
| REQ-FUNC-055 | OPERATIONS | 해당 없음(콘텐츠 저작 워크플로 미제공) | EXCLUDED |
| REQ-FUNC-056 | OPERATIONS | 해당 없음(변경 이력 UI 미제공) | EXCLUDED |

### 3.6 F6. About free_traveler → SCR-002

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-FUNC-057 | UI_DIRECT | SCR-002 (대표명·수치 카드) | IMPLEMENT |
| REQ-FUNC-058 | UI_DIRECT | SCR-002 (소개문·철학·편집 원칙) | IMPLEMENT |
| REQ-FUNC-059 | UI_DIRECT | SCR-002 (방문 권역 지도/목록) | IMPLEMENT |
| REQ-FUNC-060 | UI_DIRECT | SCR-002 (여행 타임라인) | IMPLEMENT |
| REQ-FUNC-061 | UI_DIRECT | SCR-002 (대표 이미지 메타데이터) | IMPLEMENT |
| REQ-FUNC-062 | UI_DIRECT | SCR-002 (문의·SNS 링크) | IMPLEMENT |
| REQ-FUNC-063 | UI_DIRECT | SCR-002 (추천 여행지 6곳 → SCR-001 상세로 이동) | IMPLEMENT |

### 3.7 F7. Common, Admin, Governance

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-FUNC-064 | UI_DIRECT | 전역 (SCR-001~005 공통 내비게이션·푸터) | IMPLEMENT |
| REQ-FUNC-065 | UI_DIRECT | 전역 (반응형 레이아웃) | IMPLEMENT |
| REQ-FUNC-066 | UI_DIRECT | SCR-005 로그인/가입 탭 | IMPLEMENT |
| REQ-FUNC-067 | UI_DIRECT | SCR-001 (통합 검색바) | IMPLEMENT |
| REQ-FUNC-068 | UI_STATE | SCR-001 (localStorage 즐겨찾기) | IMPLEMENT |
| REQ-FUNC-069 | UI_DIRECT | SCR-001 (공유 버튼, SCR-004 상세 패널 보조 적용) | IMPLEMENT |
| REQ-FUNC-070 | NON_UI | 전역 (페이지별 head 메타데이터) | IMPLEMENT |
| REQ-FUNC-071 | NON_UI | 해당 없음(전용 분석 이벤트 파이프라인 미제공) | EXCLUDED |
| REQ-FUNC-072 | OPERATIONS | 해당 없음(콘텐츠 CRUD 관리자 화면 미제공) | EXCLUDED |
| REQ-FUNC-073 | OPERATIONS | 해당 없음(미디어 업로드 관리자 화면 미제공) | EXCLUDED |
| REQ-FUNC-074 | OPERATIONS | 해당 없음(게시 게이트 관리자 UI 미제공) | EXCLUDED |
| REQ-FUNC-075 | OPERATIONS | 해당 없음(stale 대시보드 미제공) | EXCLUDED |
| REQ-FUNC-076 | OPERATIONS | 해당 없음(감사 로그 화면 미제공) | EXCLUDED |
| REQ-FUNC-077 | OPERATIONS | SCR-005 관리자 탭 (외부 URL 설정) | IMPLEMENT |
| REQ-FUNC-078 | UI_DIRECT | 기술 Route (404/500/오류 화면, Screen 미계수) | IMPLEMENT |
| REQ-FUNC-079 | UI_DIRECT | 전역 (폼·모달·탭 접근성) | IMPLEMENT |
| REQ-FUNC-080 | UI_DIRECT | SCR-003 동행 탭 (안전수칙 동의) + 보조 정책 페이지(Screen 미계수) | IMPLEMENT |

---

## 4. REQ-NF-001~034 매핑

### 4.1 Performance

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-NF-001 | NON_UI | 전역 (핵심 페이지 LCP) | IMPLEMENT(목표치) |
| REQ-NF-002 | NON_UI | 전역 (INP) | IMPLEMENT(목표치) |
| REQ-NF-003 | NON_UI | 전역 (CLS) | IMPLEMENT(목표치) |
| REQ-NF-004 | NON_UI | SCR-001/SCR-004 (필터 응답성능) | IMPLEMENT |
| REQ-NF-005 | OPERATIONS | 해당 없음(부하 테스트 미수행) | EXCLUDED |
| REQ-NF-006 | NON_UI | 전역 (이미지 최적화) | IMPLEMENT |
| REQ-NF-007 | OPERATIONS | 해당 없음(CI 성능 게이트 미구축) | EXCLUDED |

### 4.2 Reliability and Recovery

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-NF-008 | OPERATIONS | 해당 없음 | EXCLUDED |
| REQ-NF-009 | OPERATIONS | 해당 없음 | EXCLUDED |
| REQ-NF-010 | OPERATIONS | 해당 없음 | EXCLUDED |
| REQ-NF-011 | OPERATIONS | 해당 없음 | EXCLUDED |

### 4.3 Security and Privacy

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-NF-012 | NON_UI | 전역 (HTTPS/TLS) | IMPLEMENT |
| REQ-NF-013 | NON_UI | 전역 (RLS/역할 검증) | IMPLEMENT |
| REQ-NF-014 | NON_UI | 전역 (CSRF/SameSite) | IMPLEMENT |
| REQ-NF-015 | NON_UI | 전역 (입력 검증/XSS 방지) | IMPLEMENT |
| REQ-NF-016 | NON_UI | 전역 (비밀키 관리) | IMPLEMENT |
| REQ-NF-017 | NON_UI | SCR-003 (항공·숙소 원시값 미전송) | IMPLEMENT |
| REQ-NF-018 | OPERATIONS | SCR-005 계정 탭 (탈퇴 백엔드 처리) | EXCLUDED |

### 4.4 Safety and Moderation

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-NF-019 | NON_UI | SCR-004 (신고 접수 응답성능) | IMPLEMENT |
| REQ-NF-020 | OPERATIONS | 해당 없음(SLA 측정 체계 미구축) | EXCLUDED |
| REQ-NF-021 | OPERATIONS | 해당 없음(속도 제한 미들웨어 미구축) | EXCLUDED |
| REQ-NF-022 | OPERATIONS | 해당 없음(조치 추적성 미구축) | EXCLUDED |

### 4.5 Accessibility

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-NF-023 | NON_UI | 전역 (WCAG AA 목표) | IMPLEMENT(목표치) |
| REQ-NF-024 | OPERATIONS | 해당 없음(CI axe 자동 검사) | IMPLEMENT |
| REQ-NF-025 | OPERATIONS | 해당 없음(정식 수동 테스트 매트릭스 미구축) | EXCLUDED |

### 4.6 Content, Freshness, SEO, Copyright

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-NF-026 | NON_UI | SCR-001 (콘텐츠 완전성 검증) | IMPLEMENT |
| REQ-NF-027 | NON_UI | SCR-001 (안전정보 국가 커버리지 검증) | IMPLEMENT |
| REQ-NF-028 | NON_UI | SCR-001 (stale 확인 지표) | IMPLEMENT |
| REQ-NF-029 | NON_UI | SCR-001/SCR-002 (미디어 메타데이터 검증) | IMPLEMENT |
| REQ-NF-030 | NON_UI | 전역 (head 메타데이터) | IMPLEMENT |

### 4.7 Maintainability, Monitoring, Cost

| ID | 분류 | Screen 배치 | PROJECT_SCOPE |
|---|---|---|---|
| REQ-NF-031 | OPERATIONS | 해당 없음(CI lint/build/test) | IMPLEMENT |
| REQ-NF-032 | OPERATIONS | 해당 없음(구조화 로그 미구축) | EXCLUDED |
| REQ-NF-033 | OPERATIONS | 해당 없음(장애 알림 미구축) | EXCLUDED |
| REQ-NF-034 | OPERATIONS | 해당 없음(인프라 비용 목표) | IMPLEMENT |

---

## 5. 검증

### 5.1 요구사항 총수 확인

| 구간 | 개수 |
|---|---:|
| REQ-FUNC-001~080 | 80 |
| REQ-NF-001~034 | 34 |
| **총 Requirement 수** | **114** |

### 5.2 분류별 분포

| 분류 | FUNC | NF | 합계 |
|---|---:|---:|---:|
| UI_DIRECT | 53 | 0 | 53 |
| UI_STATE | 6 | 0 | 6 |
| NON_UI | 10 | 18 | 28 |
| OPERATIONS | 11 | 16 | 27 |
| **합계** | **80** | **34** | **114** |

### 5.3 Screen별 배치 확인

| Screen | 직접 배치된 UI_DIRECT/UI_STATE Requirement 예시 영역 |
|---|---|
| SCR-001 `/` | 여행지 목록·필터·검색·즐겨찾기·공유(F1, REQ-FUNC-067/068/069) + 여행지 상세 Drawer/Modal(F1) + 안전정보 Drawer/Modal(F5) |
| SCR-002 `/about` | 대표 소개 전체(F6) |
| SCR-003 `/travel-tools` | 항공 탭(F2), 숙소 탭(F3), 동행 작성 탭(F4 작성 관련 REQ-FUNC-027/031/032/080) |
| SCR-004 `/mates` | 동행 목록·필터, 상세 패널(참가 요청/신고/차단)(F4 조회 관련) |
| SCR-005 `/account` | 로그인/가입, 프로필, 내 활동(내 글·요청 관리·차단 관리), 간단 관리자(신고 상태·외부 URL) |
| 전역/기술 Route | 공통 내비게이션·접근성·SEO 메타·오류 화면 등 화면 공통 요구사항, API/콜백/오류 Route는 Screen 수에서 제외 |

핵심 디자인 Screen은 SCR-001~SCR-005 5개로 고정되었으며, 추가 Screen은 생성하지 않았다. `PROJECT_SCOPE.md`의 EXCLUDED 항목(REQ-FUNC-042/045/055/056/071~076, REQ-NF-005/007~011/018/020~022/025/032/033)은 본 문서에서도 동일하게 EXCLUDED로 유지했으며 구현 범위로 되돌리지 않았다.
