# 배포 체크리스트 (DEPLOY-VERCEL-ENV)

- 기록일: 2026-10-09
- Production: https://free-traveler-orcin.vercel.app
- 구성: Vercel + Supabase만 사용한다(AWS·EC2 없음, REQ-NF-034).
- 이 문서에는 키·비밀번호 값을 적지 않는다. 변수 이름과 확인 결과만 기록한다.

## 1. 환경변수

`vercel env ls`로 확인한 이름·환경이다(값은 확인하지 않았다).

| 이름 | 유형 | 환경 | 노출 범위 |
|---|---|---|---|
| `FLIGHT_OUTBOUND_URL` | Secret | Production | 서버 전용(`NEXT_PUBLIC_` 없음) |
| `HOTEL_OUTBOUND_URL` | Secret | Production | 서버 전용(`NEXT_PUBLIC_` 없음) |
| `NEXT_PUBLIC_SUPABASE_URL` | Config | Production | 브라우저 공개 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Config | Production | 브라우저 공개(anon 키, RLS 적용) |

- `SUPABASE_SERVICE_ROLE_KEY`는 Vercel에 **등록하지 않았다.** 앱 코드가 쓰지 않으며 로컬 통합 테스트 전용이다.
- Task 문구의 "Supabase 키를 `NEXT_PUBLIC_` 없이"는 service role 같은 서버 전용 키에 해당한다. 앱은 `@supabase/ssr`로
  anon 키와 사용자 세션을 쓰므로 anon 키와 URL은 `NEXT_PUBLIC_` 이름이어야 읽힌다. anon 키는 공개해도 RLS가 보호한다.
- Preview 환경에는 변수를 아직 등록하지 않았다. Preview 배포에서 Supabase를 쓰려면 같은 4개를 Preview에도 추가해야 한다.

## 2. 배포·TLS 확인

| 항목 | 결과 | 근거 |
|---|---|---|
| Production 배포 | 통과 | 5개 화면과 정책 3개 페이지가 모두 HTTP 200 |
| 없는 주소 | 통과 | 404 맞춤 안내 화면 |
| TLS | 통과 | HTTPS 제공, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` |
| Supabase 연결 | 통과 | `/api/mates`가 200과 시드 글을 반환, `/auth/callback`이 오류 코드와 함께 `/account`로 307 |
| 환경변수 반영 | 통과 | 환경변수 등록 전에는 `/auth/callback`, `/api/mates`가 500이었고, 등록 후 재배포하자 해소됨 |
| Preview 배포 | **미확인** | Preview 환경변수가 없고 Preview 배포를 확인하지 않았다 |

## 3. 번들 비밀키 노출 검사

Production의 `/`, `/about`, `/mates`, `/travel-tools`, `/account`가 불러오는 JS 정적 파일 전체를 내려받아 검색했다.

| 검색어 | 발견 수 |
|---|---|
| `service_role` | 0 |
| `FLIGHT_OUTBOUND_URL`, `HOTEL_OUTBOUND_URL` (서버 전용 변수 이름) | 0 |
| Supabase 프로젝트 주소 | 있음(공개용 `NEXT_PUBLIC_` 값이므로 정상) |

→ 클라이언트 번들에 비밀키 노출 0건.

## 4. 배포본 기능 확인

Production에 chromium Smoke를 실행했다(`PLAYWRIGHT_BASE_URL` 지정).

- 통과 11, skip 3. skip은 로그인 계정 환경변수(`E2E_AUTH_*`)가 없는 로그인 흐름 3건이다.
- 항공·숙소 외부 이동: 서버가 준 https 주소가 쿼리 없이 `noopener`·`noreferrer`와 함께 새 탭으로 열렸다.
- 입력값을 담은 fetch/xhr 요청 0건.

## 5. 남은 항목(사람 확인 필요)

- [ ] Supabase Auth → URL Configuration에 Production 주소와 `/auth/callback` Redirect URL을 등록했는지 확인
- [ ] 실제 이메일로 가입·로그인해 인증 링크가 Production 주소로 돌아오는지 확인
- [ ] Preview 배포를 쓸 경우 Preview 환경변수 4개 추가 후 배포 확인
- [ ] GitHub Actions 최신 실행(`quality`, `public-smoke`) 결과 확인
