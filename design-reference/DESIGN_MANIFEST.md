# Design Manifest — Free Traveler

- **Active Design Version**: D-001
- **Status**: LOCKED
- **Active File**: `design-reference/D-001/DESIGN.md`
- **Vendor Reference**: `design-reference/vendor/airbnb/DESIGN.md` (레이아웃 철학 참고 전용 — 상표 요소 미사용)
- **Approved Screens**: SCR-001, SCR-002, SCR-003, SCR-004, SCR-005
- **Mobile Variants**: SCR-001, SCR-003

## 이력

| 버전 | 상태 | 일자 | 입력 문서 | 비고 |
|---|---|---|---|---|
| D-001 | LOCKED | 2026-09-15 | `docs/04_UIUX_PLAN.md`, `docs/STITCH_VALIDATION_REPORT.md`, `design-reference/vendor/airbnb/DESIGN.md` | Stitch 승인 화면(SCR-001~005 Desktop, SCR-001·SCR-003 Mobile) 검증 결과를 반영해 04_UIUX_PLAN.md의 계획값을 정본화. 최초 LOCKED 버전. |
| D-001 | LOCKED (정정) | 2026-10-08 | `docs/STITCH_VALIDATION_REPORT.md`(재검증) | 버전 변경 없는 정정: 매너온도 허용 문구 삭제, 관리자 탭을 신고 상태+항공·숙소 URL 2개 섹션으로 명확화, 여행 동기 Chip 6개로 확정, 실시간 채팅 금지 추가. 새 토큰·색상 추가 없음. |

## 규칙

- **Active Design Version**이 가리키는 버전만 구현·디자인 작업의 단일 진실 공급원(SSOT)이다.
- **Status: LOCKED**인 동안 `design-reference/D-001/DESIGN.md`의 토큰 값·Section 계약·Do/Do Not 규칙은 직접 수정하지 않는다. 변경이 필요하면 새 디렉터리(`design-reference/D-002/`)를 만들어 새 버전을 발행하고, 이 매니페스트의 Active Design Version/Active File을 갱신한 뒤 이전 버전은 이력 표에 종료 처리한다.
- **Approved Screens**는 `docs/04_UIUX_PLAN.md`의 5개 화면(SCR-001~005)으로 한정한다. 신규 화면은 별도 검증 보고서 없이는 이 목록에 추가할 수 없다. 2026-10-08 재검증(`docs/STITCH_VALIDATION_REPORT.md`)의 최종 판정은 `STITCH_VALIDATION_NEEDS_HUMAN`이므로, Stitch 화면은 시각 참고용이며 문구·범위는 D-001 DESIGN.md가 우선한다.
- **Vendor Reference**는 레이아웃 철학(여백, 카드 형태, 단일 액센트, 둥근 형태) 참고용으로만 인용되며, Active File에는 벤더의 상표적 요소(워드마크, 서체 파일, 정확한 브랜드 색상값, 아이콘·배지)를 복제하지 않는다.

## 금지 사항 (모든 버전 공통)

- Airbnb 상표 요소(워드마크, Cereal VF 서체, Rausch `#ff385c` 정확 색상값, 하트 저장 아이콘, "Guest favorite"/"NEW" 배지 등) 재사용 금지.
- 구매·예약·결제 UI(Reserve 버튼, 예약 캘린더, 결제 카드 입력, 수수료 계산기 등) 추가 금지.
- Proprietary(상용/라이선스) 폰트 파일 번들 금지 — 시스템 폰트 스택 + Inter(오픈소스)만 허용.
- Active File의 디자인 토큰 표에 정의되지 않은 임의 색상 추가 금지 — 새 색상은 반드시 새 버전 발행 절차를 통해 토큰화한다.
