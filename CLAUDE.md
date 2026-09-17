# CLAUDE.md — Free Traveler (traveler/app)

이 파일은 이 저장소(`traveler/app`)에서 작업하는 모든 Agent가 반드시 따라야 할 규칙을 직접 기록한다. 다른 Agent 규칙 파일을 참조(`@`-include)하지 않는다.

## Harness Marker

```
HARNESS_SCHEMA=traveler-screen-route-v1
DESIGN_PATH=design-reference/D-001/DESIGN.md
SCREEN_CONTRACT=design-reference/SCREEN_ROUTE_CONTRACT.json
PROJECT_SCOPE=docs/PROJECT_SCOPE.md
PLAYWRIGHT_ENABLED=true
PLAYWRIGHT_SCOPE=chromium-smoke
AUTO_MERGE=false
AWS_ENABLED=false
```

`SCREEN_CONTRACT`의 `schema_version` 필드는 항상 `HARNESS_SCHEMA` 값과 일치해야 한다. 불일치하면 작업을 중단하고 사용자에게 보고한다.

## 필수 규칙

1. 작업 전 `package.json`과 현재 설치된 Next.js 버전의 문서(`node_modules/next/dist/docs/`)를 확인한다 — 학습 데이터의 Next.js 지식이 아니라 실제 설치된 버전 기준으로 API를 사용한다.
2. SRS(요구사항) 정본은 `docs/06_SRS_UIUX_REVISED.md`다. 다른 SRS 초안 문서를 정본으로 취급하지 않는다.
3. Scope 분류(IMPLEMENT/EXCLUDED) 정본은 `docs/PROJECT_SCOPE.md`다.
4. 디자인 정본은 `design-reference/D-001/DESIGN.md`다. `design-reference/vendor/**`는 레이아웃 철학 참고 전용이며 정본이 아니다.
5. Screen 정본은 `design-reference/SCREEN_ROUTE_CONTRACT.json`이다. Route·Page Entry·Screen 구성에 관한 판단은 이 파일을 우선한다.
6. `/run-wave WXX`를 표준 개발 명령으로 사용한다. Wave 단위 외의 임의 진입점으로 개발을 시작하지 않는다.
7. Wave 내부 Task는 Depends On 순서로 **한 번에 하나만** 구현한다. 여러 Task를 동시에 병렬로 건드리지 않는다.
8. 현재 Task의 Expected Files 목록 밖 파일은 수정하지 않는다.
9. Page Owner Task는 Page Entry(`page.tsx`)에서 이미 정의된 Component를 실제로 조립하는 것만 수행한다 — 새 Component/Data/API/DB Task를 그 자리에서 만들지 않는다.
10. SCR-001 완료 시 `src/app/page.tsx`의 `create-next-app` Starter(로고, "To get started" 문구, Deploy Now/Documentation 링크)를 전량 제거한다.
11. SCR-003(`/travel-tools`)은 항공·숙소·동행 작성 3개 탭을 모두 조립해야 완료로 본다.
12. 항공·숙소 입력값은 서버·DB·URL·로그·분석 이벤트 어디로도 전송하지 않는다. Client Component의 React state로만 유지한다.
13. Supabase 쓰기는 Auth·동행(Mate)·신고·차단·관리자 설정(외부 URL) 범위로만 제한한다. 콘텐츠(여행지/안전/대표 소개)를 Supabase에 쓰지 않는다.
14. RLS를 우회하는 Client 코드를 작성하지 않는다 — Client에서는 항상 RLS가 적용되는 경로로만 접근한다.
15. Service Role Key(또는 그에 준하는 서버 전용 키)를 Client Component/브라우저 번들에서 사용하지 않는다. `NEXT_PUBLIC_` 접두사가 없는 값은 서버 전용으로만 취급한다.
16. 여행지·안전정보·대표 소개는 `src/data`의 정적 Data를 사용한다. Supabase 테이블이나 CMS를 새로 만들지 않는다.
17. Prisma 등 ORM, AWS, EC2를 추가하지 않는다. DB 접근은 Supabase 클라이언트를 직접 사용한다.
18. Playwright는 핵심 Smoke Test만 작성한다(`chromium` 프로젝트만). firefox/webkit 등 다른 브라우저 프로젝트를 추가하지 않는다.
19. `docs/PROJECT_SCOPE.md`/`TASKS/00_TASK_LIST.md`의 `NON_IMPLEMENTATION`에서 EXCLUDED로 분류된 기능을 임의로 구현하지 않는다.
20. destructive Git 명령(`push --force`, `reset --hard`, `checkout .`/`restore .`, `clean -f`, `branch -D` 등)을 사용자 명시 요청 없이 임의로 사용하지 않는다.
21. 자동 PR 생성·자동 Merge를 실행하지 않는다(`AUTO_MERGE=false`). PR 생성은 사용자가 명시적으로 요청했을 때만 수행하고, Merge는 항상 사람이 수동으로 한다.
22. 사람의 Preview 확인 후 다음 화면 Wave로 진행한다 — 한 Wave의 결과물이 검토되기 전에 다음 Wave를 임의로 시작하지 않는다.
23. 작업 완료 시 변경 파일 목록, 검증 결과(lint/typecheck/test/Playwright 등 실행한 것), 남은 제한사항(구현하지 못한 부분, 알려진 한계)을 보고한다.

## Task 완료 순서

1. Task 읽기 — `TASKS/TASK-<ID>.md`의 14개 섹션(Context, Project Scope, Requirement Ref, Screen/Route/Page Entry, Design Ref, Depends On, Expected Files, Functional AC, Visual AC, Security/Privacy AC, Test Cases, Verify, Definition of Done, Forbidden)을 전부 읽는다.
2. 입력 확인 — Depends On에 나열된 선행 Task가 완료 상태인지, 필요한 파일·환경변수가 존재하는지 확인한다.
3. 구현 — Expected Files 목록 안에서만 코드를 작성한다.
4. 관련 포맷·Unit Test — 관련 lint/typecheck와 Vitest 단위 테스트를 실행하고 통과를 확인한다.
5. 필요 시 Playwright — Task의 Verify 절에 E2E가 명시된 경우 `chromium` Smoke Test를 실행한다.
6. Diff 확인 — 변경된 파일이 Expected Files와 정확히 일치하는지 확인한다.
7. 완료 보고 — 변경 파일·검증 결과·남은 제한사항을 보고한다(규칙 23).
