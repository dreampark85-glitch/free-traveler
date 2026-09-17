# PROJECT_SCOPE — Free Traveler 구현 범위 정의서

- **Document ID:** SCOPE-TRAVEL-001
- **기반 문서:** `01_PRD.md`, `02_SRS_BASELINE.md`
- **대상:** `REQ-FUNC-001`~`REQ-FUNC-080`, `REQ-NF-001`~`REQ-NF-034` 전수
- **상태 정의**
  - **IMPLEMENT**: 구현하고 테스트한다. (축소·단순화 구현인 경우 처리 방법에 명시한다.)
  - **EXCLUDED**: 만들지 않는다. 제외 이유를 기록한다.

---

## 1. 반드시 직접 구현할 범위 (요약)

1. 핵심 화면 4개(여행지, 비행기 찾기, 호텔 찾기, 동행 찾기)와 보조 화면 1개(국가별 주의사항/대표 소개)
2. 여행지 검색·필터와 상세 패널
3. 국가 안전정보 패널
4. `free_traveler` 대표 소개
5. 항공·숙소 입력·검증·요약·외부 이동
6. Supabase 이메일 인증과 성인 확인
7. 동행글 작성·조회·수정·마감
8. 참가 요청·승인·거절
9. 간단한 차단·신고
10. 내 활동과 간단한 관리자 탭(신고 상태, 외부 URL 설정)
11. Playwright 핵심 Smoke Test
12. Vercel 배포

## 2. 구현 방식 원칙

| 원칙 | 내용 |
|---|---|
| 콘텐츠 소스 | 여행지·안전정보·대표 소개 콘텐츠는 Supabase CMS가 아니라 `src/data`의 정적 TypeScript/JSON 데이터로 관리하고, 변경은 코드 리뷰로 검증한다. |
| 즐겨찾기 | 서버 저장 없이 `localStorage`에만 보존한다. |
| 알림 | 실제 이메일 발송 없이 Toast 또는 화면 내 상태 표시로 대체한다. |
| 모집글 자동 마감 | 배치 작업 없이 조회 시점에 `종료일 < 오늘`을 계산해 상태를 파생시킨다. |
| 안전정보 최신성 | 배치 작업 없이 렌더링 시점에 `오늘 - 최종 확인일 > 7일` 여부를 계산해 표시한다. |
| 이미지 | 업로드·라이선스 승인 워크플로 없이 일반 인터넷 이미지 URL과 필수 alt 텍스트만 사용한다. |
| 관리자 범위 | 신고 상태 변경과 외부 URL(항공·호텔) 설정만 다루며, 콘텐츠 CRUD·감사 로그·모더레이션 제재 시스템은 제공하지 않는다. |

## 3. 제외 기능 (요약)

| 제외 항목 | 제외 이유 |
|---|---|
| 전체 콘텐츠 CMS | 콘텐츠는 정적 데이터 파일로 관리하며 관리자 CRUD/게시 워크플로를 구축하지 않는다. |
| 미디어 업로드·라이선스 승인 워크플로 | 이미지는 외부 URL만 참조하며 업로드·심사 기능을 만들지 않는다. |
| 범용 감사 로그 | 별도 감사 로그 테이블·UI 없이 Git 커밋 이력으로 변경 추적을 대체한다. |
| 자동 백업·장애 알림·부하 테스트 | 운영 모니터링·알림·성능 테스트 인프라를 구축하지 않는다. |
| 외부 이메일 사업자 연동 | 이메일 알림은 Toast/화면 상태로 대체하고 이메일 발송 연동을 만들지 않는다. |
| EC2·AWS 인프라 | Vercel과 Supabase만 사용하고 별도 AWS 인프라를 두지 않는다. |
| 무인 자동 Merge Runner | 배포·병합은 수동 검토로 진행하며 자동 병합 자동화를 만들지 않는다. |

---

## 4. 기능 요구사항 (REQ-FUNC-001 ~ 080)

### 4.1 F1. Destination Guide

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-001 | IMPLEMENT | `src/data` 정적 목록에 `scope: DOMESTIC/OVERSEAS` 필드를 두고 탭 전환 시 클라이언트에서 필터링한다. | Playwright: 국내/해외 탭 전환 시 오분류 항목 0건 확인 |
| REQ-FUNC-002 | IMPLEMENT | 국가·도시·계절·테마·기간 필터를 클라이언트 상태로 구현하고 AND 조건으로 정적 데이터를 필터링한다. | 필터 조합 테스트로 결과 정확성 확인, 정적 데이터라 응답 1초 요건은 자연 충족 |
| REQ-FUNC-003 | IMPLEMENT | 여행지명·국가명·테마 키워드에 대한 클라이언트 부분 일치 검색을 구현한다. | 한글 키워드 검색·결과 없음 상태 수동 확인 |
| REQ-FUNC-004 | IMPLEMENT | 여행지 콘텐츠 타입(TS interface)으로 소개/명소 5개↑/추천시기/1·3일 일정/예산/교통/음식 3개↑/에티켓/출처/수정일 필드를 강제한다. | 타입 검사 + 데이터 리뷰로 누락 필드 0건 확인 |
| REQ-FUNC-005 | IMPLEMENT | 필터 결과 0건 시 조건 완화 안내와 초기화 버튼 컴포넌트를 표시한다. | Playwright로 빈 결과 화면과 초기화 동작 확인 |
| REQ-FUNC-006 | IMPLEMENT | 해외 여행지 데이터의 `countryCode`로 `/safety/[countryCode]` 링크를 생성한다. | 전체 해외 여행지 순회 스크립트로 국가 코드 일치 확인 |
| REQ-FUNC-007 | IMPLEMENT | 이미지 데이터에 `alt`, `sourceUrl`, `author`, `licenseType` 필드를 필수화한다. | 데이터 스키마 검증 스크립트로 메타데이터 누락 0건 확인 |
| REQ-FUNC-008 | IMPLEMENT | 국내 10곳·해외 15개국 30개 도시 이상 시드 데이터를 구성하고 build/test 단계에서 수량 검증 스크립트를 실행한다. | CI에서 수량 미달 시 실패하는 테스트로 확인 |
| REQ-FUNC-009 | IMPLEMENT | 동일 국가·테마 정적 데이터를 클라이언트에서 최대 6개 계산해 상세 하단에 표시한다(비공개 제외). | 수동 확인: 관련 여행지 목록에 현재/비공개 항목 미포함 |
| REQ-FUNC-010 | IMPLEMENT | Next.js `useSearchParams`로 허용된 필터 키만 URL에 직렬화/복원한다. | 새로고침·URL 공유 후 필터 상태 복원 수동 확인 |

### 4.2 F2. Flight Link-out

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-011 | IMPLEMENT | 국가·지역·출발일·귀국일 4개 필수 필드를 라벨·도움말·오류 영역과 함께 구현한다. | Playwright로 필드 렌더링·오류 영역 존재 확인 |
| REQ-FUNC-012 | IMPLEMENT | 국가 선택값에 종속된 지역 목록을 정적 데이터에서 파생시키고 국가 변경 시 지역값을 초기화한다. | 국가 변경 후 지역값 리셋 여부 수동/자동 테스트 |
| REQ-FUNC-013 | IMPLEMENT | 클라이언트 검증으로 과거 출발일, 귀국일<출발일 조합을 차단한다. | 경계값 단위 테스트(오늘/과거/역전 날짜) |
| REQ-FUNC-014 | IMPLEMENT | 검증 통과 후 요약 단계 컴포넌트로 전환하고 값은 React 상태(세션 내)로 유지한다. | 수정 버튼으로 폼 복귀 시 값 유지 확인 |
| REQ-FUNC-015 | IMPLEMENT | 폼·요약 화면에 "입력값은 외부 사이트로 전달되지 않습니다" 고지 컴포넌트를 공통 배치한다. | Playwright로 고지 텍스트 노출 확인 |
| REQ-FUNC-016 | IMPLEMENT | 환경변수 `FLIGHT_OUTBOUND_URL`을 `target="_blank" rel="noopener noreferrer"`로 새 탭 오픈하며 쿼리 파라미터를 붙이지 않는다. | 새 탭 URL에 쿼리 없음, opener 접근 불가 확인 |
| REQ-FUNC-017 | IMPLEMENT | 항공 입력값은 Client Component의 휘발성 상태로만 유지하고 서버 액션/DB/로그로 전송하지 않는다. | 네트워크 탭·서버 로그 검사에서 원시 입력값 0건 확인 |
| REQ-FUNC-018 | IMPLEMENT | 외부 URL이 없거나 허용 프로토콜(HTTPS)이 아니면 이동을 막고 인라인 오류·재시도 버튼을 표시한다. | 환경변수 미설정 시나리오로 오류 UI 수동 확인 |

### 4.3 F3. Hotel Link-out

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-019 | IMPLEMENT | 국가·지역·체크인·체크아웃 4개 필수 필드를 항공 폼과 동일 패턴으로 구현한다. | Playwright로 필드·오류 영역 확인 |
| REQ-FUNC-020 | IMPLEMENT | 국가 종속 지역 목록과 국가 변경 시 초기화 로직을 항공과 공유 컴포넌트/훅으로 재사용한다. | 국가 변경 후 지역값 리셋 테스트 |
| REQ-FUNC-021 | IMPLEMENT | 과거 체크인, 체크아웃≤체크인 조합을 클라이언트 검증으로 차단한다. | 경계값 단위 테스트 |
| REQ-FUNC-022 | IMPLEMENT | 요약 단계에서 국가·지역·체크인·체크아웃을 폼 입력과 동일하게 표시한다. | 폼-요약 값 일치 스냅샷 테스트 |
| REQ-FUNC-023 | IMPLEMENT | 항공과 동일한 비전달 고지 컴포넌트를 재사용한다. | Playwright로 고지 노출 확인 |
| REQ-FUNC-024 | IMPLEMENT | 환경변수 `HOTEL_OUTBOUND_URL`을 새 탭·`noopener,noreferrer`로 오픈하고 쿼리를 붙이지 않는다. | 새 탭 URL 쿼리 없음 확인 |
| REQ-FUNC-025 | IMPLEMENT | 호텔 입력값도 서버 DB/로그/분석에 저장하지 않는다. | 네트워크·로그 검사 |
| REQ-FUNC-026 | IMPLEMENT | URL 오류 시 이동을 차단하고 현재 입력을 유지한 채 오류를 표시한다. | 환경변수 미설정 시나리오 수동 확인 |

### 4.4 F4. Travel Mate

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-027 | IMPLEMENT | 동행 쓰기(API-06~API-12 상당) 요청 전 Supabase Auth 세션을 서버에서 검증한다. | 비로그인 POST가 401/리다이렉트로 차단되는지 테스트 |
| REQ-FUNC-028 | IMPLEMENT | `is_adult`(boolean), `adult_verified_at`만 저장하고 정확한 생년월일은 수집하지 않는다. | Supabase 테이블 스키마·요청 페이로드 검사 |
| REQ-FUNC-029 | IMPLEMENT | 닉네임·연령대·여행 스타일 필수, 성별·자기소개 선택 필드를 프로필 폼에 구현한다. | 필수/선택 필드 검증 테스트 |
| REQ-FUNC-030 | IMPLEMENT | 국가·지역·기간 겹침·연령대·성별·여행 스타일·모집 상태 필터와 차단 사용자 제외 로직을 서버 쿼리에 구현한다. | 필터 조합 테스트, 차단 사용자 글 제외 확인 |
| REQ-FUNC-031 | IMPLEMENT | 모집글 필수 필드(제목·국가·지역·기간·인원·조건·설명·안전수칙 동의)를 검증하는 작성 폼을 구현한다. | 필수값 누락·역전 날짜·과거 종료일 제출 차단 테스트 |
| REQ-FUNC-032 | IMPLEMENT | 전화번호·이메일·메신저 ID 정규식 기반 탐지를 클라이언트+서버에 이중 적용해 제출을 차단한다. | 기준 테스트셋으로 탐지율/오탐률 측정 |
| REQ-FUNC-033 | IMPLEMENT | API 응답 직렬화 시 이메일·전화번호 필드를 제외한다. | API 응답 스냅샷에서 연락처 필드 부재 확인 |
| REQ-FUNC-034 | IMPLEMENT | 500자 제한 참가 메시지를 PENDING 상태로 저장하고 작성자·요청자만 조회 가능하게 한다(RLS). | 상태 저장·권한별 조회 테스트 |
| REQ-FUNC-035 | IMPLEMENT | (post_id, applicant_id, status IN PENDING/ACCEPTED) UNIQUE 제약을 DB에 둔다. | 중복 요청 시도 시 DB 오류/UI 오류 확인 |
| REQ-FUNC-036 | IMPLEMENT | 작성자만 ACCEPTED/REJECTED로 상태 변경 가능하도록 RLS·서버 검증을 구현한다. | 비작성자 변경 403 테스트 |
| REQ-FUNC-037 | IMPLEMENT | 별도 배치 없이 조회 시점에 `종료일 < 오늘`이면 CLOSED로 파생 표시한다(구현 방식 원칙). | 종료일 경과 데이터로 목록 미노출 확인 |
| REQ-FUNC-038 | IMPLEMENT | 작성자의 수동 마감·수정·삭제 기능과 승인된 요청 존재 시 경고 다이얼로그를 구현한다. | 승인 요청 있는 글 수정 시 경고 노출 확인 |
| REQ-FUNC-039 | IMPLEMENT(간단) | 사유 코드 + 설명 입력의 신고 폼을 구현하고 접수 ID·시각을 즉시 반환한다. | 신고 제출 후 접수 ID 표시 확인 |
| REQ-FUNC-040 | IMPLEMENT(간단) | 차단/차단 해제 기능과 차단 관계 기반 글·프로필·요청 노출 제한을 구현한다. | 차단 후 상호 노출 제한 테스트 |
| REQ-FUNC-041 | IMPLEMENT(축소) | 관리자 탭에 신고 목록과 상태(OPEN/RESOLVED/DISMISSED) 필터만 제공한다(우선순위·증거 UI 제외). | 관리자 계정으로 상태 필터 동작 확인 |
| REQ-FUNC-042 | EXCLUDED | 경고·콘텐츠 숨김·계정 일시 제한 등 별도 제재 시스템과 그 감사 기록은 범용 감사 로그·모더레이션 콘솔 수준 기능이라 "간단한 관리자 탭" 범위를 벗어나 제외한다. 신고 상태 변경(041)과 기존 차단 기능(040) 재사용으로 대체한다. | 관리자 탭에 제재 기능이 없음을 화면 검토로 확인 |
| REQ-FUNC-043 | IMPLEMENT(축소) | 참가 요청 접수·승인·거절·신고 처리 결과를 인앱 Toast/상태 배지로만 제공하고 실제 이메일 발송은 만들지 않는다(외부 이메일 사업자 연동 제외). | 상태 변경 시 Toast 노출 및 DB 상태값으로 확인 가능 여부 테스트 |
| REQ-FUNC-044 | IMPLEMENT | Supabase RLS 정책으로 본인 글/요청, 대상 작성자, Moderator/Admin만 비공개 데이터 접근을 허용한다. | 역할별 부정 접근 테스트(403/빈 결과) |
| REQ-FUNC-045 | EXCLUDED | 30일 이내 예약 삭제 배치, 법적 보존 예외 처리는 백엔드 배치·감사 인프라가 필요해 제외한다. 대신 탈퇴 요청 시 Supabase Auth 계정 삭제와 함께 공개 프로필(닉네임·소개)을 즉시 수동 비식별화하는 처리만 제공한다. | 탈퇴 처리 후 공개 프로필 비식별화 여부 수동 확인 |

### 4.5 F5. Country Safety

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-046 | IMPLEMENT | `src/data`에 소개 대상 해외 15개국 전체의 안전정보 정적 데이터를 구성하고 수량 검증 스크립트로 커버리지를 확인한다. | 국가 수 vs 안전 데이터 국가 수 diff 0건 테스트 |
| REQ-FUNC-047 | IMPLEMENT | 치안·사기·법규·교통·재난·보건·문화·긴급연락처 8개 카테고리를 TS 타입으로 강제한다. | 데이터 스키마 검증으로 누락 카테고리 0건 확인 |
| REQ-FUNC-048 | IMPLEMENT | 정적 데이터에 `sourceName`, `sourceUrl`, `verifiedAt`, `editor`(고정 팀명) 필드를 기록한다. | 데이터 리뷰로 필드 존재 확인 |
| REQ-FUNC-049 | IMPLEMENT | 외교부 해외안전여행 링크를 `target="_blank" rel="noopener noreferrer"`로 제공한다. | 링크 클릭 시 새 탭·속성 확인 |
| REQ-FUNC-050 | IMPLEMENT | 렌더링 시점에 `오늘 - verifiedAt > 7일`이면 stale 배지와 재확인 경고를 표시한다(구현 방식 원칙). | verifiedAt 값 조작 테스트로 stale 배지 노출 확인 |
| REQ-FUNC-051 | IMPLEMENT | 여행금지·출국권고 등 중대 경보를 텍스트 라벨과 함께 페이지 상단에 표시한다. | 중대 경보 데이터로 상단 노출·텍스트 라벨 확인 |
| REQ-FUNC-052 | IMPLEMENT | `scopeType`(COUNTRY/REGION), `scopeText` 필드를 데이터 모델에 두고 REGION일 때 `scopeText` 필수화한다. | 스키마 검증: REGION인데 scopeText 없는 데이터 실패 |
| REQ-FUNC-053 | IMPLEMENT | 현지 긴급전화, 영사콜센터 연결 정보를 정적 데이터 필드로 제공한다. | 데이터 리뷰로 번호·출처 존재 확인 |
| REQ-FUNC-054 | IMPLEMENT | "공식 판단 대체 아님, 출국 전 원문 재확인 필요" 고지를 안전 페이지와 항공/호텔 요약에 공통 컴포넌트로 배치한다. | 각 화면에서 고지 문구 노출 확인 |
| REQ-FUNC-055 | EXCLUDED | Editor/Admin 저작·검수·게시 승인 구분과 인앱 워크플로는 콘텐츠 CMS 기능이라 제외한다. 콘텐츠는 `src/data` 정적 파일을 코드 리뷰(PR)로 검수·병합해 관리한다. | 안전정보 관련 관리자 CRUD 화면 부재를 화면 검토로 확인 |
| REQ-FUNC-056 | EXCLUDED | 이전값/새값/사유/담당자/시각의 버전 이력 관리는 범용 감사 로그 기능이라 제외한다. 변경 이력은 Git 커밋 로그로 대체한다. | 안전정보 데이터에 별도 이력 테이블/화면이 없음을 확인 |

### 4.6 F6. About free_traveler

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-057 | IMPLEMENT | 대표명·`50+ Trips`·`30+ Countries`를 단일 정적 프로필 데이터에서 참조해 대표 페이지·홈 소개 카드에 표시한다. | 두 화면 값 일치 스냅샷 테스트 |
| REQ-FUNC-058 | IMPLEMENT | PRD 6장의 확정 소개문·철학·편집 원칙을 대표 페이지에 그대로 표시한다. | 페이지 텍스트와 PRD 원문 대조 확인 |
| REQ-FUNC-059 | IMPLEMENT | 방문 권역/30개국 이상 목록을 정적 데이터로 제공하고 국가별 이름·권역을 표시한다. | 목록 렌더링·링크 오류 수동 확인 |
| REQ-FUNC-060 | IMPLEMENT | 연도·장소·요약을 포함한 여행 타임라인을 정적 데이터로 구현한다. | 타임라인 항목 필드 존재 확인 |
| REQ-FUNC-061 | IMPLEMENT | 대표 이미지에 alt·출처·작가·라이선스 URL 메타데이터를 정적 데이터에 필수화한다. | 메타데이터 누락 시 플레이스홀더 대체 테스트 |
| REQ-FUNC-062 | IMPLEMENT | 문의·SNS 링크를 정적 설정 데이터로 관리하고 빈 값은 렌더링하지 않으며 허용 프로토콜만 연다. | 빈 링크 미노출, 허용 프로토콜 외 링크 차단 확인 |
| REQ-FUNC-063 | IMPLEMENT | 대표 추천 여행지 6곳을 정적 데이터로 지정하고 공개 상태가 아닌 항목은 자동 제외한다. | 비공개 여행지 제외 및 대체 후보 노출 확인 |

### 4.7 F7. Common, Admin, Governance

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-064 | IMPLEMENT | 전역 레이아웃(`src/app/layout.tsx`)에 공통 내비게이션·푸터를 구현한다. | 핵심 6개 기능·정책 페이지 2회 이내 이동 확인 |
| REQ-FUNC-065 | IMPLEMENT | Tailwind 반응형 유틸리티로 320px~데스크톱 레이아웃을 구현한다. | 뷰포트별 가로 스크롤·겹침 없음 수동 확인 |
| REQ-FUNC-066 | IMPLEMENT | Supabase Auth로 이메일 가입/인증/로그인/로그아웃/비밀번호 재설정 흐름을 구현한다. | 각 흐름 E2E 테스트, 미인증 계정 쓰기 권한 없음 확인 |
| REQ-FUNC-067 | IMPLEMENT | 정적 여행지·안전정보 데이터에 대한 통합 클라이언트 검색과 결과 유형 라벨을 구현한다. | 검색어별 결과 유형 라벨 노출 확인 |
| REQ-FUNC-068 | IMPLEMENT | 즐겨찾기를 서버 저장 없이 `localStorage`에 slug 배열로 저장·해제한다(구현 방식 원칙). | 중복 방지, 새로고침 후 유지 여부 확인 |
| REQ-FUNC-069 | IMPLEMENT | Web Share API 우선 사용, 미지원 시 클립보드 복사로 폴백한다. | 지원/미지원 브라우저 각각 동작 확인 |
| REQ-FUNC-070 | IMPLEMENT | Next.js Metadata API로 title/description/canonical/OG를 페이지별로 설정한다. | 페이지별 메타 태그 존재 자동 검사 |
| REQ-FUNC-071 | EXCLUDED | 전용 행동 분석 이벤트 스키마·저장 파이프라인은 12개 필수 구현 범위에 없어 제외한다. 필요 시 Vercel 기본 배포 지표만 참고한다. | 별도 analytics 이벤트 전송 코드가 없음을 코드 리뷰로 확인 |
| REQ-FUNC-072 | EXCLUDED | 여행지 콘텐츠 CRUD·미리보기·DRAFT/REVIEW/PUBLISHED/ARCHIVED 워크플로는 전체 콘텐츠 CMS로 분류되어 제외한다. 콘텐츠는 `src/data` 정적 파일 수정 후 PR 리뷰로 반영한다. | 관리자 화면에 여행지 CRUD UI가 없음을 확인 |
| REQ-FUNC-073 | EXCLUDED | 출처·작가·라이선스·원문 URL·alt 필수 입력 업로드 폼은 미디어 업로드·라이선스 승인 워크플로라 제외한다. 이미지는 일반 인터넷 URL과 정적 데이터의 alt 텍스트만 사용한다. | 업로드 UI 부재, 이미지가 외부 URL 참조인지 코드 확인 |
| REQ-FUNC-074 | EXCLUDED | 게시 전 완전성 게이트를 별도 관리자 UI로 만들지 않는다. 동일 목적은 REQ-FUNC-008/046처럼 빌드·테스트 단계 검증 스크립트로 대체한다. | CI 테스트에서 데이터 완전성 스크립트 실행 확인 |
| REQ-FUNC-075 | EXCLUDED | stale 현황·담당자 대시보드는 콘텐츠 관리자 콘솔 기능이라 "간단한 관리자 탭"(신고 상태·외부 URL만) 범위 밖으로 제외한다. 사용자 화면의 stale 배지(050)로 대체한다. | 관리자 탭에 안전정보 대시보드가 없음을 확인 |
| REQ-FUNC-076 | EXCLUDED | actor/action/target/before/after/reason/timestamp 감사 로그 테이블·UI는 범용 감사 로그로 제외한다. 변경 이력은 Git 커밋으로 대체한다. | 감사 로그 테이블/화면 부재 확인 |
| REQ-FUNC-077 | IMPLEMENT | 관리자 탭에서 항공·호텔 외부 URL을 HTTPS 허용목록으로만 설정 가능하게 구현한다(구현 방식 원칙, item 10). | HTTP/`javascript:`/`data:` URL 저장 시도 차단 테스트 |
| REQ-FUNC-078 | IMPLEMENT | Next.js `not-found`/`error` 경계와 외부 연결 실패 화면에 홈/이전/재시도 중 최소 1개 행동을 제공한다. | 각 오류 화면에서 복구 행동 존재 확인 |
| REQ-FUNC-079 | IMPLEMENT | 폼·모달·탭·알림에 시맨틱 HTML과 ARIA 속성을 적용한다. | axe 자동 검사(Playwright 통합) + 키보드 수동 확인 |
| REQ-FUNC-080 | IMPLEMENT | 이용약관·개인정보 처리방침·동행 안전수칙·콘텐츠 면책 정적 페이지를 제공하고, 모집글 작성 시 정책 버전·동의 시각을 저장한다. | 동의 없이 제출 차단, 동의 시각 저장 여부 테스트 |

---

## 5. 비기능 요구사항 (REQ-NF-001 ~ 034)

### 5.1 Performance

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-001 | IMPLEMENT(목표치) | 핵심 페이지를 Next.js SSR/정적 렌더링과 이미지 최적화로 구성해 LCP 목표를 지향한다. | 핵심 페이지 대상 수동 Lighthouse 측정(자동 CI 게이트 없음) |
| REQ-NF-002 | IMPLEMENT(목표치) | 무거운 클라이언트 로직을 최소화하고 폼 검증을 경량 함수로 구현한다. | 수동 Lighthouse/PageSpeed 측정 |
| REQ-NF-003 | IMPLEMENT(목표치) | 이미지·폰트에 고정 크기/`next/image`를 사용해 레이아웃 이동을 줄인다. | 수동 Lighthouse 측정 |
| REQ-NF-004 | IMPLEMENT | 여행지·동행 필터는 정적 데이터/단순 쿼리 기반이라 1초 이내 응답이 자연 충족된다. | 수동 응답시간 측정 |
| REQ-NF-005 | EXCLUDED | 동시 사용자 50명 기준 쓰기 API 성능 검증은 부하 테스트 인프라가 필요해 제외한다. 단건 응답시간만 개발 환경에서 수동 확인한다. | 단건 요청 응답시간 수동 측정 |
| REQ-NF-006 | IMPLEMENT | `next/image`의 반응형 sizing과 lazy load, LCP 이미지 `priority` 속성을 적용한다. | 네트워크 탭에서 lazy load/priority 적용 확인 |
| REQ-NF-007 | EXCLUDED | CI Lighthouse 성능 게이트(≥85)는 필수 구현 범위(항목 11: Playwright Smoke Test)에 없어 제외한다. 배포 전 수동 Lighthouse 점검으로 대체한다. | CI 파이프라인에 성능 게이트 단계가 없음을 확인 |

### 5.2 Reliability and Recovery

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-008 | EXCLUDED | 월간 가용성 99.5% 측정은 운영 모니터링 체계가 필요해 "자동 백업·장애 알림" 제외 항목에 해당해 제외한다. | 별도 가용성 모니터링 대시보드 부재 확인 |
| REQ-NF-009 | EXCLUDED | 내부 API 5xx 비율 모니터링은 같은 이유로 제외한다. Vercel 기본 로그로만 사후 확인한다. | Vercel 대시보드에서 수동 오류 확인만 가능함을 검토 |
| REQ-NF-010 | EXCLUDED | DB 백업 RPO/RTO 수립은 "자동 백업" 제외 항목에 해당해 제외한다. Supabase 기본 백업 정책에 의존한다. | 별도 백업 자동화 스크립트가 없음을 확인 |
| REQ-NF-011 | EXCLUDED | 외부/공식 출처 링크 주 1회 자동 검사와 Admin 알림은 자동화·장애 알림 제외 항목에 해당해 제외한다. Playwright Smoke Test(항목 11)의 배포 전 1회성 링크 점검으로 대체한다. | Smoke Test에 외부 링크 접근성 케이스 포함 여부 확인 |

### 5.3 Security and Privacy

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-012 | IMPLEMENT | Vercel 기본 HTTPS/TLS 1.2 이상 배포 설정을 사용한다. | 배포 URL SSL 설정 확인 |
| REQ-NF-013 | IMPLEMENT | Supabase RLS 정책과 서버 측 인증/역할 검증을 모든 쓰기 경로에 적용한다. | 역할별 부정 테스트(403/빈 결과) |
| REQ-NF-014 | IMPLEMENT | Supabase SSR 쿠키(`SameSite`) 설정과 Next.js Server Action 기본 보호를 사용한다. | 보안 통합 테스트로 CSRF 시나리오 확인 |
| REQ-NF-015 | IMPLEMENT | React 자동 이스케이프와 서버 측 입력 검증(zod 등)으로 저장 XSS를 차단한다. | OWASP 기반 XSS 페이로드 테스트 |
| REQ-NF-016 | IMPLEMENT | 비밀키는 Vercel 환경변수로만 관리하고 `NEXT_PUBLIC_` 접두사 없는 서버 전용 값으로 구분한다. | 클라이언트 번들 검사에서 비밀키 노출 0건 확인 |
| REQ-NF-017 | IMPLEMENT | 항공·호텔 원시 입력값을 Client Component 상태로만 유지하고 서버 전송을 만들지 않는다. | 네트워크·로그·DB 검사 |
| REQ-NF-018 | EXCLUDED | 개인정보 내보내기와 삭제 요청의 정식 셀프서비스·감사 로그는 REQ-FUNC-045와 동일 이유로 제외한다. 계정 삭제는 Supabase Auth 사용자 삭제로만 수동 처리한다. | 데이터 내보내기 기능 부재 확인 |

### 5.4 Safety and Moderation

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-019 | IMPLEMENT | 신고 접수는 단순 Supabase insert로 처리되어 3초 이내 응답이 자연 충족된다. | 수동 응답시간 측정 |
| REQ-NF-020 | EXCLUDED | 24시간 이내 90% 1차 검토 SLA 측정은 운영 인력·모니터링 체계가 필요해 제외한다. 관리자 탭의 신고 상태 목록(041)만 제공한다. | SLA 측정 대시보드 부재 확인 |
| REQ-NF-021 | EXCLUDED | 사용자별 글·요청·신고 속도 제한(429) 미들웨어는 12개 필수 구현 범위 밖이라 제외한다. 즉시 위험은 연락처 탐지(032)와 중복 요청 제약(035)으로 완화한다. | Rate limit 미들웨어 부재 확인 |
| REQ-NF-022 | EXCLUDED | Moderator 조치 추적성은 REQ-FUNC-042/076과 동일하게 감사 로그 기능이 필요해 제외한다. | 별도 조치 이력 테이블 부재 확인 |

### 5.5 Accessibility

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-023 | IMPLEMENT(목표치) | 시맨틱 HTML, 라벨 연결, 색상 외 텍스트 라벨 병기를 기본 구현 원칙으로 삼는다. | 코드 리뷰 체크리스트 |
| REQ-NF-024 | IMPLEMENT | Playwright Smoke Test(항목 11)에 axe-core 자동 검사를 포함해 serious/critical 0건을 확인한다. | Playwright axe 리포트 확인 |
| REQ-NF-025 | EXCLUDED | 전체 핵심 UC에 대한 정식 수동 키보드·스크린리더 테스트 매트릭스는 "핵심 Smoke Test" 범위를 넘어서 제외한다. 자동 axe 검사(024)로 최소 수준만 확인한다. | 별도 수동 접근성 테스트 계획 문서가 없음을 확인 |

### 5.6 Content, Freshness, SEO, Copyright

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-026 | IMPLEMENT | 여행지 콘텐츠 완전성은 TS 타입과 데이터 검증 스크립트로 100% 충족을 강제한다. | CI 데이터 검증 테스트 |
| REQ-NF-027 | IMPLEMENT | 게시 대상 해외 국가 100%에 안전정보를 정적 데이터로 구성한다(046과 동일 검증). | CI 커버리지 검증 테스트 |
| REQ-NF-028 | IMPLEMENT | 렌더링 시 stale 계산(050)으로 7일 초과 항목에 경고를 100% 표시한다. | verifiedAt 조작 테스트 |
| REQ-NF-029 | IMPLEMENT | 공개 미디어 100%에 대해 alt/출처/작가/라이선스 필드를 스키마로 강제한다(007/061과 동일). | 데이터 검증 스크립트 |
| REQ-NF-030 | IMPLEMENT | 모든 공개 페이지에 Next.js Metadata API로 SEO 메타를 설정한다(070과 동일). | 자동 메타 태그 존재 검사 |

### 5.7 Maintainability, Monitoring, Cost

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-031 | IMPLEMENT | TypeScript strict 모드, ESLint, Playwright Smoke Test를 main 병합 전 필수 통과 조건으로 둔다(항목 11). | CI 파이프라인에서 lint/build/test 통과 확인 |
| REQ-NF-032 | EXCLUDED | request_id 기반 구조화 로그 체계는 자체 로깅 인프라가 필요해 제외한다. Vercel 기본 로그로 대체한다. | 별도 구조화 로깅 미들웨어 부재 확인 |
| REQ-NF-033 | EXCLUDED | 5xx>1% 또는 외부 링크 실패 5분 이내 알림은 "장애 알림" 제외 항목에 해당해 제외한다. | 알림 연동(Slack/Email 등) 코드 부재 확인 |
| REQ-NF-034 | IMPLEMENT | Vercel(무료/저비용 티어)과 Supabase만 사용하고 AWS/EC2 등 별도 인프라를 두지 않아 월 인프라 비용 목표를 자연 충족한다(항목 12, EC2·AWS 인프라 제외). | 사용 인프라 목록 검토로 AWS 리소스 없음 확인 |

---

## 6. 요구사항 커버리지 요약

| 구분 | 전체 | IMPLEMENT | EXCLUDED |
|---|---:|---:|---:|
| REQ-FUNC-001~080 | 80 | 70 | 10 |
| REQ-NF-001~034 | 34 | 21 | 13 |
| **합계** | **114** | **91** | **23** |

> 위 표의 IMPLEMENT는 축소·단순화 구현(예: REQ-FUNC-041/043)을 포함한 수치다. EXCLUDED 항목은 각 표의 "처리 방법" 칸에 대체 방안 또는 제외 사유를 기록했다.
