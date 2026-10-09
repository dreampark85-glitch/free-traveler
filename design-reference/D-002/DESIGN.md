---
version: D-002
status: LOCKED
name: Free-Traveler-design-system-a11y-coral
description: D-001에 대한 접근성 보정판. 코랄 계열 색상 토큰 3개만 바꾸고, 그 밖의 모든 토큰·Section 계약·Do/Do Not은 D-001을 그대로 따른다.
extends: design-reference/D-001/DESIGN.md
approved_screens: [SCR-001, SCR-002, SCR-003, SCR-004, SCR-005]
---

# D-002 — 코랄 접근성 보정 (D-001 확장판)

## 0. 발행 이유

Playwright + axe-core 접근성 검사(REQ-NF-024, 기준 serious/critical 0건)에서 `/`와 `/about`이 모두
`color-contrast`(serious)로 실패했다. 원인은 D-001 `color.coral` `#E85A34`의 대비가 일반 글자 기준
WCAG AA(4.5:1)에 못 미치기 때문이다.

| 조합 | D-001 `#E85A34` | 기준 |
|---|---|---|
| 코랄 글자 / `canvas` `#FFFFFF` | 3.53 : 1 | 4.5 : 1 |
| 코랄 글자 / `surface-soft` `#F7F6F3` | 3.27 : 1 | 4.5 : 1 |
| 코랄 글자 / `coral-tint` `#FCE7DE` | 2.97 : 1 | 4.5 : 1 |
| `on-coral` `#FFFFFF` 글자 / 코랄 배경 | 3.53 : 1 | 4.5 : 1 |

D-001은 LOCKED라 직접 수정하지 않고(`DESIGN_MANIFEST.md` 규칙), 새 버전으로 발행한다.

## 1. 변경하는 토큰

색상환의 같은 색상(hue)과 채도를 유지하고 밝기만 낮췄다. "코랄 하나의 액센트" 방향은 그대로다.

| 토큰 | D-001 | D-002 | 용도 | 대비 (D-002 값) |
|---|---|---|---|---|
| `color.coral` | `#E85A34` | **`#C03A16`** | Primary 버튼 배경, 활성 탭, 링크·강조 글자, 포커스 아웃라인 | 흰 배경 5.44 · `surface-soft` 5.03 · `coral-tint` 4.56 · 흰 글자(`on-coral`) 5.44 |
| `color.coral-hover` | `#D14A26` | **`#A93313`** | Primary 버튼 hover/active | 흰 글자 6.61 |
| `color.coral-accent` | (없음) | **`#E85A34`** | D-001 원색 보존. 글자·버튼에는 쓰지 않고 로고 점 같은 장식에만 사용 | 장식 전용(글자 대비 요구 없음) |

`color.coral-tint` `#FCE7DE`, `color.on-coral` `#FFFFFF`와 나머지 모든 색상 토큰은 D-001 값 그대로다.

## 2. 사용 규칙

- 글자·버튼 배경·아웃라인에는 `color.coral`을 쓴다. `color.coral-accent`는 글자나 버튼에 쓰지 않는다.
- 새 색상이 필요하면 D-003 이상으로 발행한다. 인라인 hex 값을 컴포넌트에 직접 쓰지 않는다
  (D-001 §21 Do Not 유지).
- 다른 색상 조합(경고 `#B45309`, 위험 `#C21E33`, 성공 `#1F8A57`, 정보 `#2A5FD9` 등)도 배경 위
  글자 대비가 4.5:1 이상이어야 하며, 현재 axe 검사에서 위반이 나오지 않았다.

## 3. 변경하지 않는 것

D-001의 타이포그래피, Spacing, Radius, Shadow, Header·Footer, Section 계약(§19), Empty State 규칙(§20),
Do/Do Not(§21)은 모두 그대로다. 이 문서와 D-001이 다르면 이 문서의 §1이 우선한다.

## 4. 구현 위치

- `tailwind.config.ts`의 `colors.coral`, `colors["coral-hover"]`, `colors["coral-accent"]`
- 인라인 hex를 쓰던 곳(`MatePostCard`, 체크박스 `accent`)은 토큰 클래스로 교체했다.
- 검증: `tests/e2e/public-smoke.spec.ts`의 axe 검사(`/`, `/about`)
