#!/usr/bin/env python3
"""
generate_task_details.py — Expands TASKS/00_TASK_LIST.md into per-task
detail files TASKS/TASK-<ID>.md.

Steps performed (matches the "TASK 상세 파일 생성" procedure):
  1. Parse the Task Table in TASKS/00_TASK_LIST.md, in Seq order.
  2. Validate: no duplicate Task IDs, no empty required columns, every
     Depends On reference resolves to a real Task ID. Abort on failure.
  3. Write/refresh TASKS/TASK-<ID>.md for every row (EXCLUDED requirements
     live only in the NON_IMPLEMENTATION register, never as task rows here,
     so every parsed row gets a detail file).
  4. Report 1:1 cross-check between Task List IDs and TASK-*.md filenames.

Never touches src/app, src/components, src/data, etc. — this script only
writes into TASKS/. It does not create git branches or commits.

Usage:
    python3 scripts/generate_task_details.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8")
        except Exception:  # noqa: BLE001
            pass

ROOT = Path(__file__).resolve().parent.parent
TASK_LIST_PATH = ROOT / "TASKS" / "00_TASK_LIST.md"
TASKS_DIR = ROOT / "TASKS"

COLUMNS = [
    "seq", "task_id", "title", "category", "impl_status", "req_ref",
    "screen", "route", "page_entry", "depends_on", "expected_files",
    "functional_ac", "visual_ac", "security_ac", "verify", "priority",
]

errors: list[str] = []
warnings: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


def split_row(line: str) -> list[str]:
    """Split a markdown table row on unescaped pipes, trimming outer pipes."""
    inner = line.strip()
    if inner.startswith("|"):
        inner = inner[1:]
    if inner.endswith("|"):
        inner = inner[:-1]
    return [c.strip() for c in inner.split("|")]


def parse_task_table(text: str) -> list[dict]:
    if "## Task Table" not in text:
        err("TASKS/00_TASK_LIST.md에 '## Task Table' 섹션이 없습니다.")
        return []
    if "## NON_IMPLEMENTATION" not in text:
        err("TASKS/00_TASK_LIST.md에 '## NON_IMPLEMENTATION' 섹션이 없습니다.")
        table_text = text.split("## Task Table", 1)[1]
    else:
        table_text = text.split("## Task Table", 1)[1].split("## NON_IMPLEMENTATION", 1)[0]

    rows: list[dict] = []
    for line in table_text.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        if line.startswith("| Seq") or re.match(r"^\|\s*-{2,}", line):
            continue
        cells = split_row(line)
        if len(cells) != len(COLUMNS):
            warn(f"열 개수가 {len(COLUMNS)}이 아닌 행을 건너뜁니다({len(cells)}개): {line[:80]}...")
            continue
        rows.append(dict(zip(COLUMNS, cells)))
    return rows


def validate_rows(rows: list[dict]) -> None:
    required_nonempty = ["task_id", "title", "category", "impl_status", "expected_files"]

    seen_ids: dict[str, int] = {}
    for r in rows:
        tid = r["task_id"]
        seen_ids[tid] = seen_ids.get(tid, 0) + 1
        for col in required_nonempty:
            val = r.get(col, "")
            if not val or val in ("(없음)", "—", "-"):
                err(f"{tid}: 필수 열 '{col}'이 비어 있습니다.")

    dupes = sorted(k for k, v in seen_ids.items() if v > 1)
    if dupes:
        err(f"중복된 Task ID가 있습니다: {dupes}")

    all_ids = set(seen_ids.keys())
    for r in rows:
        deps_cell = r.get("depends_on", "")
        if deps_cell in ("(없음)", "—", "-", ""):
            continue
        for dep in re.split(r",\s*", deps_cell):
            dep = dep.strip()
            if dep and dep not in all_ids:
                err(f"{r['task_id']}: 존재하지 않는 Depends On 참조입니다: {dep}")


# ---------------------------------------------------------------------------
# Detail-file content generation
# ---------------------------------------------------------------------------

DESIGN_SECTION_BY_KEYWORD = [
    (("HERO", "SEARCH", "EXPLORER"), "§8 Search·Filter, §17 Hero 규칙"),
    (("CARD",), "§9 Destination Card"),
    (("FORM", "TAB"), "§10 Form·Tabs"),
    (("MATE-POST", "MATE-LIST", "MATE-PREVIEW", "FILTER"), "§9~§10 Card/Form 패턴, §11 Mate Post Card"),
    (("DRAWER",), "§12 Drawer·Modal"),
    (("TOAST", "A11Y"), "§13 Alert·Toast, §11 접근성 규칙"),
    (("GALLERY", "TIMELINE", "CHIPS", "STAT", "FAVORITE", "INTRO"), "§9 Card, §18 Section 리듬"),
    (("ROLE-TABS", "ADMIN", "AUTH-FORMS", "PROFILE", "MY-ACTIVITY"), "§10 Form·Tabs, §19 SCR-005 계약"),
]


def design_ref_for(row: dict) -> str:
    category = row["category"]
    tid = row["task_id"]
    screen = row["screen"]

    if category == "PAGE_OWNER":
        return (
            f"design-reference/D-001/DESIGN.md §19 ({screen} Section 순서/최소 콘텐츠 수 계약), "
            "§16(Section 최대 폭/여백), §17(Hero 규칙), §20(Empty State/Placeholder 금지 규칙), "
            f"§7(Header/Footer); design-reference/UI_CONTRACT.md의 {screen} 절(영역 순서/주요 Component/상태/이동)"
        )
    if category in ("DATA", "DB", "AUTH", "API"):
        return (
            "docs/06_SRS_UIUX_REVISED.md §3~§4(해당 Requirement 행), "
            "docs/PROJECT_SCOPE.md §2 구현 방식 원칙(정적 데이터/6-테이블 DB 범위/관리자 범위 제한)"
        )
    if category == "GLOBAL":
        if "TOKENS" in tid:
            return "design-reference/D-001/DESIGN.md §1~§6(Visual Theme/Color/Typography/Spacing/Radius/Shadow)"
        if "SEO" in tid:
            return "docs/06_SRS_UIUX_REVISED.md REQ-FUNC-070/REQ-NF-030"
        return "design-reference/D-001/DESIGN.md §7(Header·Footer), §11 접근성 규칙, §13 Alert·Toast"
    if category == "ROUTE":
        return "docs/06_SRS_UIUX_REVISED.md §1.2 기술 Route, §3.7 REQ-FUNC-078/080"
    if category in ("UNIT_TEST", "INTEGRATION_TEST", "E2E_TEST", "RELEASE_CHECK", "CI", "DEPLOY"):
        return "docs/06_SRS_UIUX_REVISED.md §5 Release Acceptance Criteria; docs/PROJECT_SCOPE.md 항목 11~12"

    for keywords, ref in DESIGN_SECTION_BY_KEYWORD:
        if any(k in tid for k in keywords):
            return f"design-reference/D-001/DESIGN.md {ref}; design-reference/UI_CONTRACT.md의 {screen} 절"
    return "design-reference/D-001/DESIGN.md 관련 절; design-reference/UI_CONTRACT.md 해당 Screen 절"


PROJECT_SCOPE_BY_STATUS = {
    "PLANNED_FULL": "docs/PROJECT_SCOPE.md 분류: **IMPLEMENT** — 전체 구현 대상, 축소 없음.",
    "PLANNED_REDUCED": (
        "docs/PROJECT_SCOPE.md 분류: **IMPLEMENT(축소)** — 관련 Requirement의 처리 방법 칸에 명시된 "
        "축소 범위(우선순위/증거 UI 제외 등)를 그대로 따른다. 축소 이상으로 확장 구현하지 않는다."
    ),
    "PLANNED_TARGET_METRIC": (
        "docs/PROJECT_SCOPE.md 분류: **IMPLEMENT(목표치)** — CI 게이트 없이 목표치를 지향하고 배포 전 "
        "수동으로 확인한다. 자동화된 성능/접근성 게이트를 새로 구축하지 않는다."
    ),
}

PROJECT_SCOPE_COMMON = (
    "구현 방식 원칙(docs/PROJECT_SCOPE.md §2)을 따른다 — 콘텐츠(여행지/안전정보/대표 소개)는 "
    "Supabase가 아닌 `src/data` 정적 파일로 관리; 즐겨찾기는 서버 저장 없이 `localStorage`; 알림은 "
    "실제 이메일 발송 없이 Toast/화면 상태로 대체; 동행글 자동 마감과 안전정보 최신성은 배치 없이 "
    "조회 시점 계산으로 파생; 관리자 범위는 신고 상태 변경과 외부 URL 설정으로 한정; DB는 정확히 6개 "
    "테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, "
    "`outbound_link_setting`)로 제한한다."
)


def project_scope_for(row: dict) -> str:
    base = PROJECT_SCOPE_BY_STATUS.get(row["impl_status"], PROJECT_SCOPE_BY_STATUS["PLANNED_FULL"])
    return base + "\n\n" + PROJECT_SCOPE_COMMON


def test_cases_for(row: dict) -> str:
    """Render Test Cases as a set of clearly-scoped verification bullets.

    Earlier attempts tried to auto-split Functional AC prose into discrete
    checkpoints (sentence-boundary regex, then bold-label regex). Both
    produced grammatically broken or mis-bounded output because the AC cells
    in TASKS/00_TASK_LIST.md were authored as free-form prose, not a
    machine-parseable checkpoint list — some `**bold**` spans are emphasis,
    not "Label: content" pairs. Rather than keep guessing, quote each AC
    section in full under an honest label; this is correct even if less
    "clever" than per-checkpoint bullets.
    """
    functional = row["functional_ac"].strip()
    visual = row["visual_ac"].strip()
    security = row["security_ac"].strip()
    verify = row["verify"].strip()

    lines = [f"- Functional AC 전체가 구현되어 실제로 동작한다: {functional}"]

    if visual not in ("해당 없음", "", "—", "-"):
        lines.append(f"- Visual AC 전체가 렌더링 결과에서 확인된다: {visual}")

    if security not in ("해당 없음", "", "—", "-"):
        lines.append(f"- Security/Privacy AC가 위반되지 않는다: {security}")

    lines.append(f"- Verify 절 방법으로 재현 가능하다: {verify}")

    return "\n".join(lines)


DOD_TEMPLATE = """- [ ] Functional AC 전체 충족
- [ ] Visual AC 전체 충족(해당 항목이 있는 경우)
- [ ] Security/Privacy AC 전체 충족(해당 항목이 있는 경우)
- [ ] Test Cases 전부 통과(Verify 절 방법 기준)
- [ ] Expected Files 목록과 실제 변경 파일이 정확히 일치 — 목록 밖 파일 생성/수정 없음
- [ ] Depends On에 나열된 Task가 모두 완료 상태
- [ ] EXCLUDED로 분류된 Requirement 관련 기능을 추가 구현하지 않음"""


def forbidden_for(row: dict) -> str:
    lines = [f"- Expected Files 목록 밖의 파일을 생성·수정하지 않는다: {row['expected_files']}"]

    if row["category"] == "PAGE_OWNER":
        lines.append(
            "- 본 Task는 **Route Page 조립만**을 범위로 한다 — 새로운 Component/Data/API/DB Task를 "
            "만들지 않는다. Depends On에 나열된 기존 산출물만 가져와 조립한다."
        )
    if row["category"] == "DB":
        lines.append(
            "- 정의된 6개 테이블(`user_profile`, `mate_post`, `mate_application`, `user_block`, "
            "`report`, `outbound_link_setting`) 외의 테이블을 추가하지 않는다. 여행지·안전정보·대표 "
            "소개·감사 로그용 테이블은 만들지 않는다."
        )
    if "FLIGHT" in row["task_id"] or "HOTEL" in row["task_id"] or row["task_id"] == "PAGE-SCR003":
        lines.append("- 항공·숙소 입력값(국가/지역/날짜)을 서버·DB·외부 URL 쿼리·분석 이벤트로 전송하지 않는다.")
    if row["category"] == "E2E_TEST":
        lines.append("- Chromium 외 브라우저 프로젝트(firefox/webkit)를 추가하지 않는다.")
    if row["task_id"] == "COMP-SCR005-ADMIN-PANEL":
        lines.append("- 신고 처리 현황/외부 연결 링크 관리 2개 Section 외에 통계 그래프·KPI 카드·감사 로그 타임라인을 추가하지 않는다.")

    lines.append("- `docs/UIUX_TRACEABILITY.md`에서 EXCLUDED로 표시된 Requirement에 대응하는 기능을 구현하지 않는다.")
    return "\n".join(lines)


def render_detail(row: dict) -> str:
    tid = row["task_id"]
    return f"""# {tid} — {row['title']}

| Field | Value |
|---|---|
| Category | {row['category']} |
| Implementation Status | {row['impl_status']} |
| Priority | {row['priority']} |
| Screen | {row['screen']} |
| Route | {row['route']} |
| Page Entry | {row['page_entry']} |
| Depends On | {row['depends_on']} |
| Source | TASKS/00_TASK_LIST.md Seq {row['seq']} |

## Context

{row['title']}. Category: {row['category']}. 이 Task는 `TASKS/00_TASK_LIST.md`(Seq {row['seq']})에 정의된
구현 Task이며, 본 파일은 그 Task의 실제 개발 착수를 위한 상세 명세다.

## Project Scope

{project_scope_for(row)}

## Requirement Ref

{row['req_ref']}

(전체 Requirement 원문·Priority·Acceptance Criteria는 `docs/06_SRS_UIUX_REVISED.md` §3~§4, EXCLUDED
근거는 `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표 및 `docs/PROJECT_SCOPE.md`를 참조한다.)

## Screen / Route / Page Entry

- Screen: {row['screen']}
- Route: {row['route']}
- Page Entry: {row['page_entry']}

## Design Ref

{design_ref_for(row)}

## Depends On

{row['depends_on']}

## Expected Files

{row['expected_files']}

이 목록 밖의 파일은 생성·수정하지 않는다(Forbidden 절 참고).

## Functional AC

{row['functional_ac']}

## Visual AC

{row['visual_ac']}

## Security/Privacy AC

{row['security_ac']}

## Test Cases

{test_cases_for(row)}

## Verify

{row['verify']}

## Definition of Done

{DOD_TEMPLATE}

## Forbidden

{forbidden_for(row)}
"""


def main() -> int:
    if not TASK_LIST_PATH.exists():
        print(f"ERROR: {TASK_LIST_PATH.relative_to(ROOT)}가 없습니다.")
        return 1

    text = TASK_LIST_PATH.read_text(encoding="utf-8")
    rows = parse_task_table(text)

    print(f"파싱된 Task 행 수: {len(rows)}")

    validate_rows(rows)

    if errors:
        print("\n검증 실패 — 상세 파일을 생성하지 않습니다:")
        for e in errors:
            print(f"  ✗ {e}")
        return 1

    if warnings:
        print("\n경고:")
        for w in warnings:
            print(f"  ! {w}")

    TASKS_DIR.mkdir(parents=True, exist_ok=True)

    written = []
    for row in rows:
        out_path = TASKS_DIR / f"TASK-{row['task_id']}.md"
        out_path.write_text(render_detail(row), encoding="utf-8")
        written.append(out_path)

    print(f"\n{len(written)}개 상세 파일을 작성했습니다: TASKS/TASK-<ID>.md 형식으로 저장.")

    # 1:1 cross-check
    task_ids = {r["task_id"] for r in rows}
    detail_files = {
        p.stem[len("TASK-"):]
        for p in TASKS_DIR.glob("TASK-*.md")
    }
    missing = sorted(task_ids - detail_files)
    orphans = sorted(detail_files - task_ids)

    print("\n=== 1:1 대조 ===")
    print(f"Task List 항목 수: {len(task_ids)}")
    print(f"상세 파일 수: {len(detail_files)}")
    if missing:
        print(f"누락된 상세 파일: {missing}")
    if orphans:
        print(f"고아 상세 파일(Task List에 없음): {orphans}")
    if not missing and not orphans:
        print("1:1 일치 확인 완료.")

    return 1 if (missing or orphans) else 0


if __name__ == "__main__":
    sys.exit(main())
