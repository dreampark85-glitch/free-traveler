# ARCHITECTURE — Free Traveler 구현 경계

- **Document ID:** ARCH-TRAVEL-001
- **근거 문서:** `package.json`, `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`, `design-reference/D-001/DESIGN.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`, `TASKS/TASK_MANIFEST.csv`
- **목적:** 이 문서는 새 기능/코드를 설계하지 않는다. `TASKS/` 산출물이 이미 확정한 구현 경계를 한 곳에 모아, "무엇을 만들고 무엇을 만들지 않는지"를 코드 작성 전에 확인하는 참조 문서다.

---

## 1. 기술 스택 — Next.js App Router + TypeScript

`package.json` 기준 현재 설치된 스택:

| 구분 | 패키지 | 버전 |
|---|---|---|
| Framework | `next` | 16.3.4 |
| UI | `react`, `react-dom` | 19.2.8 |
| Language | `typescript` | ^5 |
| Style | `tailwindcss`, `@tailwindcss/postcss` | ^4 |
| Lint | `eslint`, `eslint-config-next` | ^9 / 16.3.4 |

- 전체 구현은 **App Router**(`src/app/`) 구조로 이루어지며, Pages Router(`pages/`)는 사용하지 않는다.
- 모든 신규 파일은 TypeScript(`.ts`/`.tsx`)로 작성하고 `any`를 원칙적으로 금지한다(zod 스키마로 외부 입력을 좁힌다 — §9 참고).
- Route Handler(`route.ts`)는 App Router의 API 계층으로만 사용하며, 별도 Express/커스텀 서버를 두지 않는다.

## 2. 화면 구성 — 핵심 4개 · 보조 1개

`design-reference/SCREEN_ROUTE_CONTRACT.json`(`schema_version: traveler-screen-route-v1`)이 Screen의 단일 소스다. 총 5개 Screen, 핵심 4 / 보조 1로 고정한다.

| Screen | Tier | Route | Page Entry |
|---|---|---|---|
| SCR-001 (메인/여행지) | 핵심 | `/` | `src/app/page.tsx` |
| SCR-003 (통합 여행 준비: 비행기·숙소·동행 찾기) | 핵심 | `/travel-tools` | `src/app/travel-tools/page.tsx` |
| SCR-004 (동행 조회) | 핵심 | `/mates` | `src/app/mates/page.tsx` |
| SCR-005 (계정·관리) | 핵심 | `/account` | `src/app/account/page.tsx` |
| SCR-002 (국가별 주의사항/대표 소개 성격의 정적 열람 화면) | 보조 | `/about` | `src/app/about/page.tsx` |

- 핵심 4개는 탐색 → 조건 정리/동행 작성 → 동행 조회 → 계정 관리로 이어지는 사용자의 핵심 과업 흐름을 구성한다(`UI_CONTRACT.md`).
- 보조 1개(SCR-002)는 핵심 흐름 밖의 정적 신뢰도 열람 화면이며 CTA를 통해서만 핵심 흐름과 연결된다.
- 국가별 주의사항(Country Safety)은 별도 화면이 아니라 SCR-001의 Section(안전정보 Drawer)으로 조립되며, 대표 소개는 SCR-002 본문이다 — 이 두 콘텐츠 축이 "보조 화면 1개"의 실체다.
- `technical_routes`(auth callback, API route, `not-found`/`error`, 정책 정적 페이지)는 `screen_count`에서 명시적으로 제외된다.

## 3. Server Component / Client Component 구분

기본값은 **Server Component**다. `"use client"`는 아래 조건 중 하나 이상을 만족할 때만 최상단에 선언한다.

| Client Component가 되는 조건 | 해당 Task 예시 |
|---|---|
| 브라우저 전용 상태(React state/hook)를 직접 다룸 | 항공/숙소 조건 입력 폼, 탭 스위처, 필터 바 |
| `localStorage`/`sessionStorage`/Web Share API 접근 | 즐겨찾기 토글, 공유 버튼(REQ-FUNC-068/069) |
| 사용자 이벤트 핸들러(`onClick`/`onChange`/`onSubmit`) | Drawer 오픈, 신고/차단 버튼, 참가 요청 폼 |
| 클라이언트 전용 검증/포맷팅 로직 | 날짜 경계값 검증(REQ-FUNC-013/021), 연락처 탐지 1차(REQ-FUNC-032) |

Server Component로 유지하는 부분:

- Page Owner(`page.tsx`)의 최상위 레이아웃과 정적 데이터(`src/data`) 조회는 기본적으로 Server Component에서 수행한다.
- Supabase 서버 클라이언트(§9)를 사용하는 읽기/쓰기는 Server Component 또는 Route Handler에서만 수행하고, 브라우저로 서비스 role key나 서버 전용 값을 전달하지 않는다.
- `generateMetadata`/`export const metadata`(GLOBAL-SEO-METADATA)는 Server Component 영역에서만 정의한다.

Page Owner 5개(`PAGE-SCR001`~`PAGE-SCR005`)는 각자 Server/Client Component를 조립만 하며, 신규 Server/Client 경계를 그 자리에서 새로 발명하지 않는다 — 경계는 해당 Component Task에서 이미 결정된 대로 따른다.

## 4. 항공·숙소 입력 폼 — Client Component의 일시 상태만 사용

- SCR-003의 항공/숙소 폼(`TravelConditionForm` 계열)은 **Client Component**이며, 입력값은 React state(예: `useState`/`useReducer`)로만 유지한다.
- 이 상태는 페이지 세션 동안만 존재하는 **일시 상태**다 — Server Action, Route Handler, 전역 상태 저장소(Redux/Zustand 등의 영속화), `localStorage` 어디에도 이 값을 반영하지 않는다.
- "수정" 버튼으로 요약 단계에서 폼으로 돌아가도 값이 유지되어야 하지만(REQ-FUNC-014/022), 이는 같은 Client Component 트리 내 React state 유지로 충족하며 서버 왕복이나 영속 저장을 도입하지 않는다.

## 5. 항공·숙소 입력값 비전송 원칙

REQ-FUNC-017/025, REQ-NF-017에 따라 다음을 **절대 금지**한다.

| 금지 대상 | 구체적으로 |
|---|---|
| API/Server Action 전송 | 항공/숙소 폼 값을 `fetch`, Server Action, Route Handler로 전송하지 않는다 |
| DB 저장 | Supabase 어떤 테이블에도 원시 항공/숙소 조건을 저장하지 않는다(§8의 6개 테이블 어디에도 해당 컬럼을 두지 않는다) |
| URL 노출 | 외부 이동 URL(`FLIGHT_OUTBOUND_URL`/`HOTEL_OUTBOUND_URL`)에 쿼리 파라미터로 조건값을 붙이지 않는다 — 새 탭은 항상 무쿼리로 연다 |
| 로그 기록 | 서버 로그, 클라이언트 analytics 이벤트 어디에도 원시 입력값을 기록하지 않는다 |

허용되는 것은 오직: (1) 입력값에서 파생된 UI 요약 텍스트를 화면에 표시, (2) `noopener,noreferrer`로 외부 사이트를 새 탭으로 여는 것뿐이다. 검증은 Client Component 내부에서 완결하며, 서버 측 검증이 필요하지 않다(서버로 아무것도 보내지 않으므로).

## 6. 여행지·안전·대표 소개 — `src/data` 정적 데이터

- 여행지(Destination Guide), 국가 안전정보(Country Safety), `free_traveler` 대표 소개(About) 3개 콘텐츠 축은 **Supabase 테이블이 아니라 `src/data`의 정적 TypeScript/JSON 데이터**로 관리한다(`DATA-DESTINATIONS`, `DATA-SAFETY`, `DATA-REPRESENTATIVE` Task).
- 콘텐츠 변경은 코드 리뷰(PR)로 검증하며, 콘텐츠 CMS·관리자 CRUD 화면·업로드 승인 워크플로는 만들지 않는다(§14 EXCLUDED와 동일 근거: REQ-FUNC-072/073/074/055).
- 파생 계산(모집글 자동 마감, 안전정보 최신성 stale 배지)은 배치 작업 없이 **조회 시점 계산**으로 처리한다 — 별도 크론/워커를 두지 않는다.
- 이미지: 업로드·라이선스 승인 워크플로 없이 외부 URL 참조 + 필수 `alt`/`sourceUrl`/`author`/`licenseType` 메타데이터만 정적 데이터에 둔다.

## 7. Supabase — Auth와 동행(Mate) 기능 중심

Supabase는 다음 두 축에만 사용한다.

1. **Auth**: 이메일 가입/인증/로그인/로그아웃/비밀번호 재설정, 성인 확인 상태(`is_adult`, `adult_verified_at`) 저장(`AUTH-SETUP`).
2. **동행(Mate) 기능**: 동행글 작성/조회/수정/마감, 참가 요청/승인/거절, 신고, 차단, 관리자의 신고 상태 변경·외부 URL 설정(`API-MATE-POSTS`, `API-MATE-APPLICATIONS`, `API-REPORTS-BLOCKS`, `API-ADMIN-OPERATIONS`).

여행지/안전정보/대표 소개(§6), 즐겨찾기(`localStorage`), 알림(Toast로 대체)은 Supabase를 거치지 않는다 — Supabase를 콘텐츠 저장소나 범용 백엔드로 확장하지 않는다.

## 8. DB — 정확히 6개 Table

`DB-SCHEMA-BASE`가 정의하는 스키마는 아래 6개 테이블로 고정하며, 그 외 테이블(여행지/안전정보/대표 소개/미디어 자산/감사 로그용 테이블 포함)을 추가하지 않는다.

| Table | 용도 |
|---|---|
| `user_profile` | 닉네임/연령대/여행 스타일 등 프로필, `is_adult`/`adult_verified_at`(정확한 생년월일 미저장) |
| `mate_post` | 동행 모집글 |
| `mate_application` | 참가 요청, `(post_id, applicant_id, status IN PENDING/ACCEPTED)` UNIQUE 제약 |
| `user_block` | 차단 관계 |
| `report` | 신고 접수/상태 |
| `outbound_link_setting` | 관리자가 설정하는 항공/숙소 외부 URL(HTTPS 허용목록) |

마이그레이션은 `supabase/migrations/0001_base_schema.sql`(스키마) + `0002_rls_policies.sql`(RLS) + `supabase/seed.sql`(시드)로 분리한다(`DB-SCHEMA-BASE`/`DB-RLS-BASE`/`DB-SEED-BASE`).

## 9. Browser · Server Supabase Client 분리

`DB-ACCESS` Task가 두 개의 Supabase 클라이언트 진입점을 둔다.

| 파일 | 용도 |
|---|---|
| `src/lib/supabase/client.ts` | 브라우저(Client Component)용 — anon key만 사용, 세션 쿠키는 `SameSite` 설정을 따른다 |
| `src/lib/supabase/server.ts` | Server Component/Route Handler용 — 서버 전용 값(`NEXT_PUBLIC_` 접두사 없는 키)을 사용하며 클라이언트 번들에 노출되지 않는다 |

모든 쓰기 경로는 `src/lib/validation/*.schema.ts`(zod)로 서버 측 입력 검증을 거친 뒤에만 Supabase로 전달한다(REQ-NF-015 저장 XSS 방지, React 자동 이스케이프와 별도 계층).

## 10. RLS 원칙 (간단)

- 6개 테이블 전체에 RLS를 활성화한다(`DB-RLS-BASE`).
- 접근 허용 대상은 **본인 글/요청 소유자**, **요청 대상(모집글 작성자)**, **Moderator/Admin** 셋으로만 한정한다 — 그 외에는 403 또는 빈 결과를 반환한다.
- RLS는 서버 측 인증/역할 검증과 함께 모든 쓰기 경로에 적용하며(REQ-NF-013), 정교한 세분화(예: 필드 단위 마스킹, 시간 기반 정책)는 도입하지 않는다 — "간단한" 원칙을 유지한다.
- API 응답 직렬화 시 이메일·전화번호 등 연락처 필드는 RLS와 별개로 애플리케이션 계층에서 제외한다(REQ-FUNC-033).

## 11. Prisma·ORM 미사용

- DB 접근은 `@supabase/supabase-js`(또는 Supabase SSR 헬퍼) 클라이언트를 직접 사용하며, Prisma·Drizzle 등 별도 ORM을 도입하지 않는다.
- 타입 안전성은 (a) Supabase 생성 타입 또는 수동 정의 TS 인터페이스, (b) zod 스키마(§9)로 확보하며, ORM 마이그레이션 도구 대신 `supabase/migrations/*.sql`을 직접 작성한다.

## 12. 테스트 — Vitest + Playwright(Chromium Smoke)

| 도구 | 범위 |
|---|---|
| Vitest | 단위 테스트 — 날짜/기간 계산(`UNIT-TRAVEL-DATES`), 연락처 탐지 정규식(`UNIT-CONTACT-DETECTION`), 동행 상태 파생(`UNIT-MATE-STATE`) |
| Vitest + Supabase 로컬/테스트 프로젝트 | RLS 정책 통합 테스트(`TEST-RLS-BASIC`) |
| Playwright | **Chromium 단일 브라우저**로만 실행하는 Smoke E2E(`E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH`) — firefox/webkit 프로젝트를 추가하지 않는다 |
| axe-core | Playwright Smoke에 통합해 serious/critical 접근성 위반 0건을 확인(REQ-NF-024) |

CI Lighthouse 성능 게이트나 전체 매트릭스 수동 접근성 테스트(REQ-NF-007/025)는 범위 밖이며, `next lint`/`tsc`/Vitest/Playwright Smoke 통과만 병합 조건으로 둔다(REQ-NF-031).

## 13. 배포 — GitHub Actions + Vercel Preview

- CI: GitHub Actions에서 `lint` → `build` → Vitest → Playwright(Chromium) Smoke 순으로 실행한다.
- 배포: Vercel의 PR Preview 배포 + main 병합 후 Production 배포를 사용한다. 별도 스테이징 인프라(EC2, 온프레미스 등)를 두지 않는다.
- 병합은 항상 사람이 리뷰 후 수동으로 진행한다(§15).

## 14. AWS·EC2 미사용

- 인프라는 **Vercel + Supabase 두 곳만** 사용한다(REQ-NF-034). AWS 계정, EC2 인스턴스, 별도 컨테이너 오케스트레이션(ECS/EKS 등)을 두지 않는다.
- 자동 백업·장애 알림·부하 테스트·구조화 로깅 인프라(REQ-NF-008~011/032/033)는 운영 모니터링 체계가 필요해 범위에서 제외하며, Vercel 기본 로그/Supabase 기본 백업 정책에 의존한다.

## 15. 자동 Merge 미사용

- 병합·배포는 항상 사람의 코드 리뷰를 거쳐 수동으로 진행한다.
- GitHub Actions는 검증(lint/build/test) 게이트로만 사용하며, 조건 충족 시 자동으로 PR을 병합하는 워크플로(auto-merge, merge queue 자동화, 무인 병합 봇)는 구성하지 않는다.

---

## 16. Page Entry 전체 목록

| Screen | Page Entry |
|---|---|
| SCR-001 | `src/app/page.tsx` |
| SCR-002 | `src/app/about/page.tsx` |
| SCR-003 | `src/app/travel-tools/page.tsx` |
| SCR-004 | `src/app/mates/page.tsx` |
| SCR-005 | `src/app/account/page.tsx` |

현재 `src/app/`에는 `page.tsx`(아직 `create-next-app` 스타터 상태), `layout.tsx`, `globals.css`, `favicon.ico`만 존재한다 — 나머지 4개 Page Entry 디렉터리(`about/`, `travel-tools/`, `mates/`, `account/`)는 아직 생성되지 않았다. 이는 각 Page Owner Task(`PAGE-SCR002`~`PAGE-SCR005`)가 신규로 만들 대상이며, 착수를 막는 결함이 아니다(§17 참고).

## 17. 착수 차단 — 실제로 필요한데 누락된 파일·환경변수만 기록

아래 항목은 `TASKS/TASK-*.md`에 정의된 구현을 시작하기 전에 **실제로 있어야 하는데 현재 저장소에 없는** 것만 기록한다. 존재하지 않는 것을 예방적으로 나열하지 않는다.

### 누락된 파일

| 파일 | 필요한 이유 | 관련 Task |
|---|---|---|
| `supabase/migrations/0001_base_schema.sql` | §8의 6개 테이블 스키마 정의 파일이 아직 없음(`supabase/` 디렉터리 자체가 없음) | `DB-SCHEMA-BASE` |
| `supabase/migrations/0002_rls_policies.sql` | §10 RLS 정책 정의 파일이 아직 없음 | `DB-RLS-BASE` |
| `supabase/seed.sql` | 개발/테스트용 시드 데이터 파일이 아직 없음 | `DB-SEED-BASE` |
| `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` | §9의 Browser/Server 클라이언트 분리 진입점이 아직 없음 | `DB-ACCESS` |

### 누락된 의존성 (`package.json`에 미설치)

| 패키지 | 필요한 이유 |
|---|---|
| `@supabase/supabase-js`(및 SSR 헬퍼) | §7/§9 Supabase Auth·동행 기능 구현에 필수 |
| `zod` | §9 서버 측 입력 검증(모든 쓰기 경로)에 필수 |
| `vitest` | §12 단위/RLS 통합 테스트 실행에 필수 |
| `@playwright/test` | §12 Chromium Smoke E2E 실행에 필수 |
| `@axe-core/playwright` (또는 동등 axe 통합 패키지) | §12 접근성 자동 검사(REQ-NF-024)에 필수 |

각 패키지 설치는 해당 패키지를 최초로 사용하는 Task(`DB-ACCESS`, `UNIT-*`, `E2E-*`)의 착수 시점에 그 Task 범위 안에서 수행한다 — 별도의 선행 "의존성 설치" Task를 새로 만들지 않는다.

### 누락된 환경변수

| 환경변수 | 필요한 이유 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | §9 브라우저 Supabase 클라이언트 초기화 | `NEXT_PUBLIC_` 접두사로 클라이언트 노출 허용 |
| `SUPABASE_SERVICE_ROLE_KEY`(또는 서버 전용 값) | §9 서버 Supabase 클라이언트, RLS를 우회해야 하는 관리자 작업 시에만 사용 | `NEXT_PUBLIC_` 접두사 금지, Vercel 서버 전용 환경변수로만 등록 |
| `FLIGHT_OUTBOUND_URL` | §5 항공 탭 외부 이동 대상(REQ-FUNC-016) | HTTPS 허용목록 검증 대상, 없으면 이동 차단 + 인라인 오류(REQ-FUNC-018) |
| `HOTEL_OUTBOUND_URL` | §5 숙소 탭 외부 이동 대상(REQ-FUNC-024) | 위와 동일(REQ-FUNC-026) |

`.env` 또는 `.env.local` 파일 자체가 저장소에 없으므로(정상 — 커밋 대상 아님), 위 값은 로컬 개발 시 `.env.local`에, 배포 시 Vercel 프로젝트 환경변수에 각각 등록되어야 한다. 이 문서는 값 자체를 다루지 않는다.

### 명시적으로 범위 밖 — 착수 차단 사유로 취급하지 않음

다음은 `docs/PROJECT_SCOPE.md` §3(제외 기능)에 따라 **프로젝트 범위에서 제외**되며, 관련 파일·SDK·환경변수·계정이 없어도 착수를 막는 결함으로 기록하지 않는다.

- **CMS**: 콘텐츠(여행지/안전정보/대표 소개)는 §6과 같이 `src/data` 정적 파일로 관리하며, 헤드리스 CMS·콘텐츠 관리 백엔드를 도입하지 않는다.
- **외부 Email 공급자**: 알림은 Toast/화면 내 상태로 대체하며(REQ-FUNC-043), SendGrid/Postmark 등 트랜잭션 이메일 서비스 연동을 만들지 않는다.
- **Monitoring**: Sentry/Datadog 등 별도 모니터링·장애 알림 서비스를 두지 않으며, Vercel 기본 로그/대시보드로만 사후 확인한다(REQ-NF-008/009/032/033).
