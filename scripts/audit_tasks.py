#!/usr/bin/env python3
"""
audit_tasks.py — Final audit gate for the Traveler Task Pipeline.

Inputs:
    TASKS/00_TASK_LIST.md                 (Task Table + NON_IMPLEMENTATION register)
    TASKS/TASK-<ID>.md                    (one detail file per Task Table row)
    docs/PROJECT_SCOPE.md                 (IMPLEMENT/EXCLUDED totals, cross-check)
    design-reference/SCREEN_ROUTE_CONTRACT.json  (Screen source of truth: route/page_entry)

Runs exactly 18 named checks (see CHECK NAMES below) and writes:
    TASKS/TASK_MANIFEST.csv               (machine-readable manifest of every task row)
    TASKS/TASK_AUDIT_REPORT.md            (human-readable pass/fail report)

Usage:
    python3 scripts/audit_tasks.py

Exit code 0 = AUDIT_PASS (all 18 checks pass; warnings may remain).
Exit code 1 = AUDIT_FAIL (at least one check failed), or the Task List
              could not be parsed at all.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8")
        except Exception:  # noqa: BLE001
            pass

ROOT = Path(__file__).resolve().parent.parent
TASKS_DIR = ROOT / "TASKS"
TASK_LIST_PATH = TASKS_DIR / "00_TASK_LIST.md"
SCREEN_CONTRACT_PATH = ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"
PROJECT_SCOPE_PATH = ROOT / "docs" / "PROJECT_SCOPE.md"
MANIFEST_PATH = TASKS_DIR / "TASK_MANIFEST.csv"
REPORT_PATH = TASKS_DIR / "TASK_AUDIT_REPORT.md"

COLUMNS = [
    "seq", "task_id", "title", "category", "impl_status", "req_ref",
    "screen", "route", "page_entry", "depends_on", "expected_files",
    "functional_ac", "visual_ac", "security_ac", "verify", "priority",
]

ALLOWED_DB_TABLES = {
    "user_profile", "mate_post", "mate_application",
    "user_block", "report", "outbound_link_setting",
}
FORBIDDEN_TABLE_HINTS = ["destination", "country_safety", "representative_profile", "media_asset", "audit_log"]
FORBIDDEN_KEYWORDS = ["auto-merge", "automerge", "자동 병합", "무인 병합", "ec2", "aws", "amazon web services"]
NEGATION_MARKERS = ["금지", "않는다", "없음", "없이", "제외", "추가하지", "차단", "아니", "미포함", "미노출", "0건"]

CHECK_NAMES = {
    1: "Task List 구현 ID와 상세 Task 파일 1:1",
    2: "중복 Task ID 0",
    3: "Depends On 누락 0",
    4: "Dependency Cycle 0",
    5: "Screen 5개 모두 Page Owner 정확히 1개",
    6: "Route·Page Entry·Expected Files 일치",
    7: "Component-only Screen 0",
    8: "SCR-001 Starter 제거 AC 존재",
    9: "SCR-003 세 탭 조립 AC 존재",
    10: "SCR-005 역할별 상태 조립 AC 존재",
    11: "DB Schema·RLS·Access·Seed Task 존재",
    12: "DB Table 범위가 6개 기본 테이블을 크게 넘지 않음",
    13: "외부 입력 비저장 AC 존재",
    14: "Auth·성인·기본 RLS AC 존재",
    15: "Playwright Chromium Smoke Task 존재",
    16: "AWS·EC2·자동 Merge 구현 Task 0",
    17: "REQ-FUNC 80개와 REQ-NF 34개가 Task 또는 EXCLUDED 표에 존재",
    18: "EXCLUDED 상세 구현 파일이 생성되지 않음",
}

check_errors: dict[int, list[str]] = {n: [] for n in CHECK_NAMES}
check_warnings: dict[int, list[str]] = {n: [] for n in CHECK_NAMES}


def err(n: int, msg: str) -> None:
    check_errors[n].append(msg)


def warn(n: int, msg: str) -> None:
    check_warnings[n].append(msg)


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def split_row(line: str) -> list[str]:
    inner = line.strip()
    if inner.startswith("|"):
        inner = inner[1:]
    if inner.endswith("|"):
        inner = inner[:-1]
    return [c.strip() for c in inner.split("|")]


def parse_task_list(text: str) -> tuple[list[dict], list[dict]]:
    if "## Task Table" not in text:
        return [], []
    table_text = text.split("## Task Table", 1)[1]
    noimpl_text = ""
    if "## NON_IMPLEMENTATION" in table_text:
        table_text, rest = table_text.split("## NON_IMPLEMENTATION", 1)
        noimpl_text = rest.split("## 커버리지 검증", 1)[0] if "## 커버리지 검증" in rest else rest

    rows: list[dict] = []
    for line in table_text.splitlines():
        line = line.strip()
        if not line.startswith("|") or line.startswith("| Seq") or re.match(r"^\|\s*-{2,}", line):
            continue
        cells = split_row(line)
        if len(cells) != len(COLUMNS):
            continue
        rows.append(dict(zip(COLUMNS, cells)))

    excluded_rows: list[dict] = []
    for line in noimpl_text.splitlines():
        line = line.strip()
        if not line.startswith("|") or line.startswith("| Requirement ID") or re.match(r"^\|\s*-{2,}", line):
            continue
        cells = split_row(line)
        if len(cells) >= 1 and re.fullmatch(r"REQ-(?:FUNC|NF)-\d{3}", cells[0]):
            excluded_rows.append({"requirement_id": cells[0], "reason": cells[2] if len(cells) > 2 else ""})

    return rows, excluded_rows


def load_screen_contract() -> dict:
    if not SCREEN_CONTRACT_PATH.exists():
        return {}
    try:
        return json.loads(SCREEN_CONTRACT_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def load_detail_files(rows: list[dict]) -> dict[str, str]:
    texts: dict[str, str] = {}
    for r in rows:
        p = TASKS_DIR / f"TASK-{r['task_id']}.md"
        if p.exists():
            try:
                texts[r["task_id"]] = p.read_text(encoding="utf-8")
            except Exception:  # noqa: BLE001
                pass
    return texts


def _is_negated_mention(text: str, start: int, end: int, window: int = 60) -> bool:
    starts = [text.rfind(c, 0, start) for c in ".;\n"]
    clause_start = max(starts) + 1
    ends = [text.find(c, end) for c in ".;\n"]
    ends = [e for e in ends if e != -1]
    clause_end = min(ends) if ends else min(len(text), end + window)
    return any(m in text[clause_start:clause_end] for m in NEGATION_MARKERS)


def _find_unnegated(text: str, keyword: str) -> bool:
    for m in re.finditer(re.escape(keyword), text, re.IGNORECASE):
        if not _is_negated_mention(text, m.start(), m.end()):
            return True
    return False


# ---------------------------------------------------------------------------
# Checks 1-3: structural integrity of the Task List itself
# ---------------------------------------------------------------------------

def check_1_2_3(rows: list[dict]) -> None:
    required_nonempty = ["task_id", "title", "category", "impl_status", "expected_files"]
    seen: dict[str, int] = {}
    for r in rows:
        tid = r["task_id"]
        seen[tid] = seen.get(tid, 0) + 1
        for col in required_nonempty:
            if not r.get(col) or r[col] in ("(없음)", "—", "-"):
                err(2, f"{tid}: 필수 열 '{col}'이 비어 있습니다.")

    dupes = sorted(k for k, v in seen.items() if v > 1)
    if dupes:
        err(2, f"중복된 Task ID: {dupes}")

    all_ids = set(seen.keys())
    for r in rows:
        for dep in _depends(r):
            if dep not in all_ids:
                err(3, f"{r['task_id']}: 존재하지 않는 Depends On 참조: {dep}")

    detail_ids = {p.stem[len("TASK-"):] for p in TASKS_DIR.glob("TASK-*.md")}
    missing = sorted(all_ids - detail_ids)
    orphans = sorted(detail_ids - all_ids)
    if missing:
        err(1, f"상세 파일이 없는 Task: {missing}")
    if orphans:
        err(1, f"Task List에 없는 상세 파일(고아): {orphans}")


def _depends(row: dict) -> list[str]:
    cell = row.get("depends_on", "")
    if cell in ("(없음)", "—", "-", ""):
        return []
    return [d.strip() for d in re.split(r",\s*", cell) if d.strip()]


# ---------------------------------------------------------------------------
# Check 4: dependency cycle detection
# ---------------------------------------------------------------------------

def check_4_cycles(rows: list[dict]) -> None:
    graph = {r["task_id"]: [d for d in _depends(r) if d in {x["task_id"] for x in rows}] for r in rows}
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {tid: WHITE for tid in graph}
    path_stack: list[str] = []

    def dfs(node: str) -> list[str] | None:
        color[node] = GRAY
        path_stack.append(node)
        for nxt in graph.get(node, []):
            if color.get(nxt, WHITE) == GRAY:
                cycle_start = path_stack.index(nxt)
                return path_stack[cycle_start:] + [nxt]
            if color.get(nxt, WHITE) == WHITE:
                found = dfs(nxt)
                if found:
                    return found
        path_stack.pop()
        color[node] = BLACK
        return None

    for tid in graph:
        if color[tid] == WHITE:
            cycle = dfs(tid)
            if cycle:
                err(4, f"Dependency Cycle 발견: {' -> '.join(cycle)}")
                return


# ---------------------------------------------------------------------------
# Checks 5-7: Screen / Page Owner structure
# ---------------------------------------------------------------------------

def check_5_6_7(rows: list[dict], contract: dict) -> dict[str, dict]:
    screens = contract.get("screens", [])
    if not screens:
        warn(5, "SCREEN_ROUTE_CONTRACT.json에서 screens[]를 읽지 못해 5/6/7번 검사를 최소한으로만 수행합니다.")
    expected_ids = sorted(s["screen_id"] for s in screens) or [f"SCR-00{i}" for i in range(1, 6)]
    expected_route = {s["screen_id"]: s["route"] for s in screens}
    expected_entry = {s["screen_id"]: s["page_entry"] for s in screens}

    page_owners = [r for r in rows if r.get("category") == "PAGE_OWNER"]
    by_screen: dict[str, list[dict]] = {}
    for r in page_owners:
        by_screen.setdefault(r.get("screen"), []).append(r)

    for sid in expected_ids:
        count = len(by_screen.get(sid, []))
        if count != 1:
            err(5, f"{sid}의 Page Owner Task 수가 1이 아닙니다: {count}개")

    extra_screens = set(by_screen.keys()) - set(expected_ids)
    if extra_screens:
        warn(5, f"SCREEN_ROUTE_CONTRACT.json에 없는 Screen에 Page Owner가 있습니다: {sorted(extra_screens)}")

    by_screen_single: dict[str, dict] = {}
    for sid, owners in by_screen.items():
        if owners:
            by_screen_single[sid] = owners[0]

    for sid, row in by_screen_single.items():
        route = row.get("route", "").strip("`")
        entry = row.get("page_entry", "").strip("`")
        exp_route = expected_route.get(sid)
        exp_entry = expected_entry.get(sid)
        if exp_route is not None and route != exp_route:
            err(6, f"{row['task_id']}({sid}) Route 불일치: {route!r} (기대값 {exp_route!r})")
        if exp_entry is not None and entry != exp_entry:
            err(6, f"{row['task_id']}({sid}) Page Entry 불일치: {entry!r} (기대값 {exp_entry!r})")
        if exp_entry and exp_entry not in row.get("expected_files", ""):
            err(6, f"{row['task_id']}({sid}) Expected Files에 Page Entry({exp_entry})가 포함되어 있지 않습니다.")

    # Check 7: every COMPONENT task tagged to a Screen must be wired into
    # that Screen's Page Owner depends_on — otherwise it's an orphaned
    # component that never actually gets assembled ("Component-only Screen").
    for sid in expected_ids:
        components = {r["task_id"] for r in rows if r.get("category") == "COMPONENT" and r.get("screen") == sid}
        owner = by_screen_single.get(sid)
        owner_deps = set(_depends(owner)) if owner else set()
        orphaned = sorted(components - owner_deps)
        if orphaned:
            err(7, f"{sid}: Page Owner가 조립하지 않는 Component Task가 있습니다(Component-only): {orphaned}")

    return by_screen_single


# ---------------------------------------------------------------------------
# Checks 8-10: mandatory Page Owner ACs
# ---------------------------------------------------------------------------

def check_8_9_10(by_screen: dict[str, dict], details: dict[str, str]) -> None:
    scr001 = by_screen.get("SCR-001")
    if scr001:
        text = details.get(scr001["task_id"], "")
        if not any(k in text for k in ("스타터", "starter", "create-next-app")):
            err(8, f"{scr001['task_id']}(SCR-001)에 Next.js 스타터 제거 AC가 없습니다.")
    else:
        err(8, "SCR-001 Page Owner Task 자체가 없어 스타터 제거 AC를 확인할 수 없습니다.")

    scr003 = by_screen.get("SCR-003")
    if scr003:
        text = details.get(scr003["task_id"], "")
        for tab_kw in ("항공", "숙소", "동행"):
            if tab_kw not in text:
                err(9, f"{scr003['task_id']}(SCR-003)에 '{tab_kw}' 탭 조립 언급이 없습니다.")
    else:
        err(9, "SCR-003 Page Owner Task 자체가 없어 3탭 조립 AC를 확인할 수 없습니다.")

    scr005 = by_screen.get("SCR-005")
    if scr005:
        text = details.get(scr005["task_id"], "")
        has_guest = any(k in text for k in ("Guest", "게스트"))
        has_member = any(k in text for k in ("Member", "회원"))
        has_admin = any(k in text for k in ("Admin", "관리자"))
        if not (has_guest and has_member and has_admin):
            err(10, f"{scr005['task_id']}(SCR-005)에 Guest/Member/Admin 상태 조립 언급이 모두 있지 않습니다.")
    else:
        err(10, "SCR-005 Page Owner Task 자체가 없어 역할별 상태 조립 AC를 확인할 수 없습니다.")


# ---------------------------------------------------------------------------
# Checks 11-12: DB scope
# ---------------------------------------------------------------------------

def check_11_12(rows: list[dict], details: dict[str, str]) -> None:
    db_rows = [r for r in rows if r.get("category") == "DB"]
    db_ids_upper = [r["task_id"].upper() for r in db_rows]

    def has(keyword: str) -> bool:
        return any(keyword in tid for tid in db_ids_upper)

    for keyword, label in [("SCHEMA", "Schema"), ("RLS", "RLS"), ("ACCESS", "Access"), ("SEED", "Seed")]:
        if not has(keyword):
            err(11, f"DB {label} Task를 찾지 못했습니다(Task ID에 '{keyword}' 포함된 DB 카테고리 Task 없음).")

    all_db_text = "\n".join(details.get(r["task_id"], "") for r in db_rows)
    found_tables: set[str] = set()
    # Only treat a backtick token as a *table name* when it appears in a clause
    # that actually talks about tables — otherwise column names like
    # `adult_verified_at` (e.g. "`user_profile.is_adult`/`adult_verified_at`")
    # get miscounted as extra tables.
    for clause in re.split(r"(?<=[.;\n])", all_db_text):
        if "테이블" not in clause and "table" not in clause.lower():
            continue
        for m in re.finditer(r"`([a-z][a-z0-9]*(?:_[a-z0-9]+)+)`", clause):
            token = m.group(1)
            if "." in token:
                continue
            found_tables.add(token)

    forbidden_present = {t for t in found_tables if any(h in t for h in FORBIDDEN_TABLE_HINTS)}
    if forbidden_present:
        err(12, f"DB Task 상세에 금지된 테이블류 토큰이 있습니다: {sorted(forbidden_present)}")

    known = found_tables & ALLOWED_DB_TABLES
    unknown = found_tables - ALLOWED_DB_TABLES - forbidden_present
    total_tables = len(known) + len(unknown)

    if total_tables > 8:
        err(12, f"DB Table 수가 6개 기본 테이블을 크게 초과합니다: 총 {total_tables}개(허용 6개 + 미상 {sorted(unknown)})")
    elif total_tables > 6:
        warn(12, f"DB Table 수가 기본 6개보다 많습니다({total_tables}개): 추가분 {sorted(unknown)} — 근거를 확인하세요.")


# ---------------------------------------------------------------------------
# Check 13: no server/DB/URL transmission of raw flight/hotel input
# ---------------------------------------------------------------------------

def check_13(rows: list[dict], details: dict[str, str]) -> None:
    target_ids = [
        r["task_id"] for r in rows
        if "FLIGHT" in r["task_id"].upper() or "HOTEL" in r["task_id"].upper() or r["task_id"] == "PAGE-SCR003"
    ]
    if not target_ids:
        warn(13, "항공/숙소 관련 Task를 찾지 못했습니다.")
        return

    markers = ["전송하지 않는다", "전송하지 않", "저장하지 않", "미전송", "서버·DB·외부 URL"]
    for tid in target_ids:
        text = details.get(tid, "")
        if not any(m in text for m in markers):
            err(13, f"{tid}에 '외부 입력값을 서버·DB·URL로 전송/저장하지 않는다'는 AC가 보이지 않습니다.")


# ---------------------------------------------------------------------------
# Check 14: Auth / adult-verification / base RLS AC
# ---------------------------------------------------------------------------

def check_14(rows: list[dict], details: dict[str, str]) -> None:
    def text_of(task_id: str) -> str:
        return details.get(task_id, "")

    auth_rows = [r["task_id"] for r in rows if r.get("category") == "AUTH"] or \
        [r["task_id"] for r in rows if "AUTH" in r["task_id"].upper()]
    auth_text = "\n".join(text_of(t) for t in auth_rows)
    if not auth_rows or not any(k in auth_text for k in ("인증", "세션", "로그인")):
        err(14, "Auth 관련 Task(예: AUTH-SETUP)에서 인증/세션 AC를 찾지 못했습니다.")

    rls_rows = [r["task_id"] for r in rows if "RLS" in r["task_id"].upper()]
    rls_text = "\n".join(text_of(t) for t in rls_rows)
    if not rls_rows or "RLS" not in rls_text:
        err(14, "RLS Task(예: DB-RLS-BASE)에서 RLS AC를 찾지 못했습니다.")

    adult_candidates = [
        r["task_id"] for r in rows
        if r.get("screen") == "SCR-005" or "SCHEMA" in r["task_id"].upper() or "PROFILE" in r["task_id"].upper()
    ]
    adult_text = "\n".join(text_of(t) for t in adult_candidates)
    if "성인" not in adult_text:
        err(14, "성인 확인(만 19세 이상) 관련 AC를 SCR-005/DB Schema/Profile Task에서 찾지 못했습니다.")


# ---------------------------------------------------------------------------
# Check 15: Playwright Chromium smoke task
# ---------------------------------------------------------------------------

def check_15(rows: list[dict], details: dict[str, str]) -> None:
    e2e_rows = [r for r in rows if r.get("category") == "E2E_TEST" or "E2E" in r["task_id"].upper()]
    if not e2e_rows:
        err(15, "Playwright E2E Smoke Task가 하나도 없습니다.")
        return

    any_chromium = False
    for r in e2e_rows:
        text = details.get(r["task_id"], "")
        if "chromium" in text.lower():
            any_chromium = True
        for other in ("firefox", "webkit", "safari", "cross-browser", "크로스 브라우저"):
            if _find_unnegated(text, other):
                err(15, f"{r['task_id']} 상세 파일에 Chromium 외 브라우저를 실제로 사용하는 언급이 있습니다: '{other}'")

    if not any_chromium:
        err(15, "어떤 E2E Task 상세 파일에도 'chromium' 명시가 없습니다.")


# ---------------------------------------------------------------------------
# Check 16: forbidden infrastructure/process keywords
# ---------------------------------------------------------------------------

def check_16(rows: list[dict], details: dict[str, str]) -> None:
    for r in rows:
        haystack = f"{r.get('task_id', '')} {r.get('title', '')}".lower()
        for kw in FORBIDDEN_KEYWORDS:
            if kw in haystack:
                err(16, f"금지 키워드가 Task 제목/ID에 있습니다: {r.get('task_id')} ~ '{kw}'")

    for tid, text in details.items():
        for kw in FORBIDDEN_KEYWORDS:
            if _find_unnegated(text, kw):
                err(16, f"금지 키워드를 실제로 사용하는 언급이 {tid} 상세 파일에 있습니다: '{kw}'")


# ---------------------------------------------------------------------------
# Checks 17-18: full 114-requirement coverage, EXCLUDED never gets a detail file
# ---------------------------------------------------------------------------

def check_17_18(rows: list[dict], excluded_rows: list[dict]) -> None:
    req_id_re = re.compile(r"REQ-(?:FUNC|NF)-\d{3}")

    task_req_ids: set[str] = set()
    req_to_tasks: dict[str, list[str]] = {}
    for r in rows:
        for rid in req_id_re.findall(r.get("req_ref", "")):
            task_req_ids.add(rid)
            req_to_tasks.setdefault(rid, []).append(r["task_id"])

    excluded_ids = {e["requirement_id"] for e in excluded_rows}

    expected_func = {f"REQ-FUNC-{i:03d}" for i in range(1, 81)}
    expected_nf = {f"REQ-NF-{i:03d}" for i in range(1, 35)}
    universe = expected_func | expected_nf

    covered = task_req_ids | excluded_ids
    missing = sorted(universe - covered)
    if missing:
        err(17, f"Task에도 EXCLUDED 등록부에도 없는 Requirement ID: {missing}")

    overlap = sorted(task_req_ids & excluded_ids)
    if overlap:
        err(17, f"EXCLUDED이면서 동시에 Task에도 배정된 Requirement ID(모순): {overlap}")
        for rid in overlap:
            err(18, f"{rid}는 EXCLUDED인데 {req_to_tasks.get(rid)}에서 구현 Task로도 참조됩니다.")

    unexpected = sorted(covered - universe)
    if unexpected:
        warn(17, f"REQ-FUNC-001~080/REQ-NF-001~034 범위 밖 ID: {unexpected}")

    if not PROJECT_SCOPE_PATH.exists():
        warn(17, "docs/PROJECT_SCOPE.md를 찾을 수 없어 IMPLEMENT/EXCLUDED 총계 교차검증을 건너뜁니다.")
        return

    scope_text = PROJECT_SCOPE_PATH.read_text(encoding="utf-8")
    func_row = re.search(r"REQ-FUNC-001~080\s*\|\s*80\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|", scope_text)
    nf_row = re.search(r"REQ-NF-001~034\s*\|\s*34\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|", scope_text)
    if func_row and nf_row:
        expected_implement = int(func_row.group(1)) + int(nf_row.group(1))
        expected_excluded = int(func_row.group(2)) + int(nf_row.group(2))
        if len(task_req_ids) != expected_implement:
            err(17, f"Task에 배정된 IMPLEMENT ID 수({len(task_req_ids)})가 PROJECT_SCOPE.md 합계({expected_implement})와 다릅니다.")
        if len(excluded_ids) != expected_excluded:
            err(17, f"EXCLUDED 등록부 ID 수({len(excluded_ids)})가 PROJECT_SCOPE.md 합계({expected_excluded})와 다릅니다.")

    # Check 18: no TASK-<ID>.md detail file exists whose task_id is itself an
    # EXCLUDED requirement ID (defensive — should never happen since EXCLUDED
    # requirements never become Task rows in the first place), and no task
    # row's own task_id collides with an EXCLUDED requirement ID pattern.
    detail_ids = {p.stem[len("TASK-"):] for p in TASKS_DIR.glob("TASK-*.md")}
    stray = sorted(detail_ids & excluded_ids)
    if stray:
        err(18, f"EXCLUDED Requirement ID와 동일한 이름의 상세 Task 파일이 존재합니다: {stray}")


# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------

def write_manifest(rows: list[dict]) -> None:
    fieldnames = COLUMNS + ["detail_file", "detail_file_exists"]
    with MANIFEST_PATH.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            detail_file = f"TASKS/TASK-{r['task_id']}.md"
            exists = (ROOT / detail_file).exists()
            writer.writerow({**r, "detail_file": detail_file, "detail_file_exists": exists})


def write_report(rows: list[dict], excluded_rows: list[dict], details: dict[str, str]) -> bool:
    TASKS_DIR.mkdir(parents=True, exist_ok=True)

    lines = [
        "# TASKS/TASK_AUDIT_REPORT.md",
        "",
        f"- Generated at: {datetime.now(timezone.utc).isoformat()}",
        "- Inputs: TASKS/00_TASK_LIST.md, TASKS/TASK-*.md, docs/PROJECT_SCOPE.md, "
        "design-reference/SCREEN_ROUTE_CONTRACT.json",
        f"- Task Table rows: {len(rows)}",
        f"- Detail files found: {len(details)}",
        f"- EXCLUDED requirements registered: {len(excluded_rows)}",
        "",
        "## 검사 결과 (18개)",
        "",
        "| # | 검사 | 결과 | 오류 수 | 경고 수 |",
        "|---:|---|---|---:|---:|",
    ]

    all_pass = True
    for n in range(1, 19):
        n_errors = len(check_errors[n])
        n_warnings = len(check_warnings[n])
        status = "PASS" if n_errors == 0 else "FAIL"
        if n_errors:
            all_pass = False
        lines.append(f"| {n} | {CHECK_NAMES[n]} | **{status}** | {n_errors} | {n_warnings} |")

    lines += ["", "## 오류 상세", ""]
    any_err = False
    for n in range(1, 19):
        if check_errors[n]:
            any_err = True
            lines.append(f"### #{n} — {CHECK_NAMES[n]}")
            lines += [f"- ✗ {e}" for e in check_errors[n]]
            lines.append("")
    if not any_err:
        lines.append("(없음)")

    lines += ["", "## 경고 상세", ""]
    any_warn = False
    for n in range(1, 19):
        if check_warnings[n]:
            any_warn = True
            lines.append(f"### #{n} — {CHECK_NAMES[n]}")
            lines += [f"- ! {w}" for w in check_warnings[n]]
            lines.append("")
    if not any_warn:
        lines.append("(없음)")

    passed_count = sum(1 for n in range(1, 19) if not check_errors[n])
    lines += [
        "",
        "## Result",
        "",
        f"**{'AUDIT_PASS' if all_pass else 'AUDIT_FAIL'}** — {passed_count}/18 검사 통과",
        "",
    ]
    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")
    return all_pass


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main() -> int:
    if not TASK_LIST_PATH.exists():
        print(f"ERROR: {TASK_LIST_PATH.relative_to(ROOT)}가 없습니다.")
        return 1

    text = TASK_LIST_PATH.read_text(encoding="utf-8")
    rows, excluded_rows = parse_task_list(text)

    if not rows:
        print("ERROR: TASKS/00_TASK_LIST.md의 Task Table을 파싱하지 못했습니다.")
        return 1

    contract = load_screen_contract()
    details = load_detail_files(rows)

    check_1_2_3(rows)
    check_4_cycles(rows)
    by_screen = check_5_6_7(rows, contract)
    check_8_9_10(by_screen, details)
    check_11_12(rows, details)
    check_13(rows, details)
    check_14(rows, details)
    check_15(rows, details)
    check_16(rows, details)
    check_17_18(rows, excluded_rows)

    write_manifest(rows)
    all_pass = write_report(rows, excluded_rows, details)

    print("=== Traveler Task Pipeline — Final Audit ===")
    print(f"Task Table rows: {len(rows)} | Detail files: {len(details)} | EXCLUDED registered: {len(excluded_rows)}")
    print(f"Manifest: {MANIFEST_PATH.relative_to(ROOT)}")
    print(f"Report:   {REPORT_PATH.relative_to(ROOT)}")
    print()

    passed_count = sum(1 for n in range(1, 19) if not check_errors[n])
    for n in range(1, 19):
        status = "PASS" if not check_errors[n] else "FAIL"
        print(f"  [{status}] #{n} {CHECK_NAMES[n]}")
        for e in check_errors[n]:
            print(f"           ✗ {e}")
        for w in check_warnings[n]:
            print(f"           ! {w}")

    print()
    if all_pass:
        print(f"AUDIT_PASS — {passed_count}/18 검사 통과")
    else:
        print(f"AUDIT_FAIL — {passed_count}/18 검사 통과")

    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())
