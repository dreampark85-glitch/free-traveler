#!/usr/bin/env python3
"""
validate_inputs.py — Precondition gate for the Traveler Task 생성 Pipeline.

Run before /gen-tasklist. Validates that every source document the pipeline
depends on exists, is internally consistent, and agrees with the others
(schema version, Screen count/IDs, requirement counts, IMPLEMENT/EXCLUDED
totals). Also inspects the *real* src/app file tree so downstream task
generation never assumes file state instead of checking it (Skill Rule 4).

Usage:
    python scripts/validate_inputs.py

Exit code 0  = no blocking errors (warnings may still be present).
Exit code 1  = at least one blocking error found; do not proceed to
               /gen-tasklist until fixed.

Writes a machine-readable report to scripts/.validate_inputs_report.json
and prints a human-readable summary to stdout.
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# Windows terminals often default to a legacy codepage (e.g. cp949) that
# cannot print the Korean text or Unicode symbols this script emits.
# Force UTF-8 stdout/stderr so `python scripts/validate_inputs.py` works
# the same on Windows, macOS, and Linux.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8")
        except Exception:  # noqa: BLE001
            pass

ROOT = Path(__file__).resolve().parent.parent
HARNESS_SCHEMA = "traveler-screen-route-v1"
EXPECTED_SCREEN_IDS = [f"SCR-00{i}" for i in range(1, 6)]
IMPLEMENTATION_STATUS_VALUES = {
    "PLANNED_FULL",
    "PLANNED_REDUCED",
    "PLANNED_TARGET_METRIC",
    "EXCLUDED",
}

errors: list[str] = []
warnings: list[str] = []
report: dict = {}


def err(msg: str) -> None:
    errors.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


def read_text(rel_path: str) -> str | None:
    p = ROOT / rel_path
    if not p.exists():
        err(f"필수 입력 파일이 없습니다: {rel_path}")
        return None
    try:
        return p.read_text(encoding="utf-8")
    except Exception as exc:  # noqa: BLE001
        err(f"{rel_path} 읽기 실패: {exc}")
        return None


# ---------------------------------------------------------------------------
# 1. SCREEN_ROUTE_CONTRACT.json — Screen list source of truth (Rule 1, 2, 3)
# ---------------------------------------------------------------------------

def check_screen_route_contract() -> dict:
    result: dict = {"path": "design-reference/SCREEN_ROUTE_CONTRACT.json"}
    text = read_text("design-reference/SCREEN_ROUTE_CONTRACT.json")
    if text is None:
        return result

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        err(f"SCREEN_ROUTE_CONTRACT.json이 유효한 JSON이 아닙니다: {exc}")
        return result

    schema_version = data.get("schema_version")
    if schema_version != HARNESS_SCHEMA:
        err(
            "HARNESS_SCHEMA 불일치: SCREEN_ROUTE_CONTRACT.json.schema_version="
            f"{schema_version!r}, 기대값={HARNESS_SCHEMA!r}"
        )
    result["schema_version"] = schema_version

    screens = data.get("screens", [])
    result["screen_count"] = len(screens)
    if len(screens) != 5:
        err(f"Screen 수가 5가 아닙니다: {len(screens)}개")

    screen_ids = [s.get("screen_id") for s in screens]
    result["screen_ids"] = screen_ids
    if sorted(screen_ids) != sorted(EXPECTED_SCREEN_IDS):
        err(f"Screen ID 집합이 SCR-001~005와 다릅니다: {screen_ids}")

    routes = [s.get("route") for s in screens]
    if len(set(routes)) != len(routes):
        err(f"Route 중복이 발견되었습니다: {routes}")

    page_entries = [s.get("page_entry") for s in screens]
    if len(set(page_entries)) != len(page_entries):
        err(f"Page Entry 중복이 발견되었습니다: {page_entries}")

    tiers = [s.get("tier") for s in screens]
    core = tiers.count("core")
    supporting = tiers.count("supporting")
    result["tier_counts"] = {"core": core, "supporting": supporting}
    if core != 4 or supporting != 1:
        err(f"핵심/보조 Screen 구성이 4/1이 아닙니다: core={core}, supporting={supporting}")

    result["screens"] = [
        {
            "screen_id": s.get("screen_id"),
            "route": s.get("route"),
            "page_entry": s.get("page_entry"),
            "tier": s.get("tier"),
        }
        for s in screens
    ]

    tech_routes = data.get("technical_routes", [])
    result["technical_route_count"] = len(tech_routes)

    return result


# ---------------------------------------------------------------------------
# 2. UIUX_TRACEABILITY.md — per-requirement Implementation Status (Rule 15/16)
# ---------------------------------------------------------------------------

ROW_RE = re.compile(
    r"^\|\s*(REQ-(?:FUNC|NF)-\d{3})\s*\|\s*(PLANNED_FULL|PLANNED_REDUCED|"
    r"PLANNED_TARGET_METRIC|EXCLUDED)\s*\|",
    re.MULTILINE,
)


def check_traceability() -> dict:
    result: dict = {"path": "docs/UIUX_TRACEABILITY.md"}
    text = read_text("docs/UIUX_TRACEABILITY.md")
    if text is None:
        return result

    rows = ROW_RE.findall(text)
    by_id: dict[str, str] = {}
    duplicates: list[str] = []
    for req_id, status in rows:
        if req_id in by_id:
            duplicates.append(req_id)
        by_id[req_id] = status

    if duplicates:
        err(f"UIUX_TRACEABILITY.md에 중복 Requirement 행이 있습니다: {sorted(set(duplicates))}")

    func_ids = {rid for rid in by_id if rid.startswith("REQ-FUNC-")}
    nf_ids = {rid for rid in by_id if rid.startswith("REQ-NF-")}

    expected_func = {f"REQ-FUNC-{i:03d}" for i in range(1, 81)}
    expected_nf = {f"REQ-NF-{i:03d}" for i in range(1, 35)}

    missing_func = sorted(expected_func - func_ids)
    missing_nf = sorted(expected_nf - nf_ids)
    extra_func = sorted(func_ids - expected_func)
    extra_nf = sorted(nf_ids - expected_nf)

    if missing_func:
        err(f"UIUX_TRACEABILITY.md에서 누락된 REQ-FUNC ID: {missing_func}")
    if missing_nf:
        err(f"UIUX_TRACEABILITY.md에서 누락된 REQ-NF ID: {missing_nf}")
    if extra_func:
        warn(f"UIUX_TRACEABILITY.md에 예상 범위 밖 REQ-FUNC ID가 있습니다: {extra_func}")
    if extra_nf:
        warn(f"UIUX_TRACEABILITY.md에 예상 범위 밖 REQ-NF ID가 있습니다: {extra_nf}")

    status_counts: dict[str, int] = {}
    for status in by_id.values():
        status_counts[status] = status_counts.get(status, 0) + 1

    implement_count = sum(
        v for k, v in status_counts.items() if k != "EXCLUDED"
    )
    excluded_count = status_counts.get("EXCLUDED", 0)

    result["total_requirements_found"] = len(by_id)
    result["status_counts"] = status_counts
    result["implement_count"] = implement_count
    result["excluded_count"] = excluded_count
    result["by_id"] = by_id

    if len(by_id) == 114 and implement_count + excluded_count != 114:
        err("Implementation Status 합계가 114와 일치하지 않습니다.")

    return result


# ---------------------------------------------------------------------------
# 3. PROJECT_SCOPE.md — cross-check IMPLEMENT/EXCLUDED totals (91/23)
# ---------------------------------------------------------------------------

def check_project_scope(traceability: dict) -> dict:
    result: dict = {"path": "docs/PROJECT_SCOPE.md"}
    text = read_text("docs/PROJECT_SCOPE.md")
    if text is None:
        return result

    func_row = re.search(
        r"REQ-FUNC-001~080\s*\|\s*80\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|", text
    )
    nf_row = re.search(
        r"REQ-NF-001~034\s*\|\s*34\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|", text
    )

    if not func_row:
        warn("PROJECT_SCOPE.md에서 REQ-FUNC 커버리지 요약 행을 찾지 못했습니다.")
    if not nf_row:
        warn("PROJECT_SCOPE.md에서 REQ-NF 커버리지 요약 행을 찾지 못했습니다.")

    if func_row and nf_row:
        func_impl, func_excl = int(func_row.group(1)), int(func_row.group(2))
        nf_impl, nf_excl = int(nf_row.group(1)), int(nf_row.group(2))
        result["func_implement"] = func_impl
        result["func_excluded"] = func_excl
        result["nf_implement"] = nf_impl
        result["nf_excluded"] = nf_excl

        total_implement = func_impl + nf_impl
        total_excluded = func_excl + nf_excl

        trace_implement = traceability.get("implement_count")
        trace_excluded = traceability.get("excluded_count")
        if trace_implement is not None and trace_implement != total_implement:
            err(
                "PROJECT_SCOPE.md IMPLEMENT 합계"
                f"({total_implement})와 UIUX_TRACEABILITY.md IMPLEMENT 합계"
                f"({trace_implement})가 다릅니다."
            )
        if trace_excluded is not None and trace_excluded != total_excluded:
            err(
                "PROJECT_SCOPE.md EXCLUDED 합계"
                f"({total_excluded})와 UIUX_TRACEABILITY.md EXCLUDED 합계"
                f"({trace_excluded})가 다릅니다."
            )

    return result


# ---------------------------------------------------------------------------
# 4. 06_SRS_UIUX_REVISED.md — required sections + full requirement coverage
# ---------------------------------------------------------------------------

REQ_ID_RE = re.compile(r"REQ-(?:FUNC|NF)-\d{3}")


def check_srs_revised() -> dict:
    result: dict = {"path": "docs/06_SRS_UIUX_REVISED.md"}
    text = read_text("docs/06_SRS_UIUX_REVISED.md")
    if text is None:
        return result

    required_sections = ["UI Route Contract", "Release Acceptance Criteria"]
    missing_sections = [s for s in required_sections if s not in text]
    if missing_sections:
        err(f"06_SRS_UIUX_REVISED.md에 필수 섹션이 없습니다: {missing_sections}")

    all_ids = set(REQ_ID_RE.findall(text))
    func_ids = {i for i in all_ids if i.startswith("REQ-FUNC-")}
    nf_ids = {i for i in all_ids if i.startswith("REQ-NF-")}
    result["func_id_count"] = len(func_ids)
    result["nf_id_count"] = len(nf_ids)
    if len(func_ids) != 80:
        err(f"06_SRS_UIUX_REVISED.md의 REQ-FUNC ID 수가 80이 아닙니다: {len(func_ids)}")
    if len(nf_ids) != 34:
        err(f"06_SRS_UIUX_REVISED.md의 REQ-NF ID 수가 34가 아닙니다: {len(nf_ids)}")

    return result


# ---------------------------------------------------------------------------
# 5. UI_CONTRACT.md — every Screen documented
# ---------------------------------------------------------------------------

def check_ui_contract() -> dict:
    result: dict = {"path": "design-reference/UI_CONTRACT.md"}
    text = read_text("design-reference/UI_CONTRACT.md")
    if text is None:
        return result

    missing = [sid for sid in EXPECTED_SCREEN_IDS if sid not in text]
    if missing:
        err(f"UI_CONTRACT.md에 언급되지 않은 Screen ID가 있습니다: {missing}")

    for keyword in ("Tier", "핵심", "보조"):
        if keyword not in text:
            warn(f"UI_CONTRACT.md에 '{keyword}' 관련 티어 구분 표기가 보이지 않습니다.")

    return result


# ---------------------------------------------------------------------------
# 6. D-001/DESIGN.md — LOCKED status
# ---------------------------------------------------------------------------

def check_design_lock() -> dict:
    result: dict = {"path": "design-reference/D-001/DESIGN.md"}
    text = read_text("design-reference/D-001/DESIGN.md")
    if text is None:
        return result

    if "status: LOCKED" not in text and "LOCKED" not in text.split("\n\n", 1)[0]:
        # be lenient about exact frontmatter formatting, but require the word
        if "LOCKED" not in text[:2000]:
            err("design-reference/D-001/DESIGN.md 상단에서 'LOCKED' 상태 표기를 찾지 못했습니다.")

    result["locked_found"] = "LOCKED" in text[:2000]
    return result


# ---------------------------------------------------------------------------
# 7. Real src/app tree + package.json (Rule 4)
# ---------------------------------------------------------------------------

STARTER_MARKERS = [
    "To get started, edit the",
    "create-next-app",
    "Deploy Now",
    "next.svg",
]


def check_src_tree(screen_route_contract: dict) -> dict:
    result: dict = {}

    app_dir = ROOT / "src" / "app"
    if not app_dir.exists():
        err("src/app 디렉터리가 존재하지 않습니다.")
        result["exists"] = False
        return result

    files = sorted(
        str(p.relative_to(ROOT)).replace("\\", "/")
        for p in app_dir.rglob("*")
        if p.is_file()
    )
    result["exists"] = True
    result["files"] = files

    page_entries = [
        s["page_entry"] for s in screen_route_contract.get("screens", []) if s.get("page_entry")
    ]
    existing = {}
    for entry in page_entries:
        existing[entry] = (ROOT / entry).exists()
    result["page_entry_existence"] = existing

    page_tsx = ROOT / "src" / "app" / "page.tsx"
    starter_detected = False
    if page_tsx.exists():
        try:
            content = page_tsx.read_text(encoding="utf-8")
            starter_detected = any(marker in content for marker in STARTER_MARKERS)
        except Exception as exc:  # noqa: BLE001
            warn(f"src/app/page.tsx 읽기 실패: {exc}")
    result["starter_template_detected_in_page_tsx"] = starter_detected
    if starter_detected:
        warn(
            "src/app/page.tsx가 아직 create-next-app 스타터 템플릿입니다 — "
            "PAGE-SCR-001 Task는 Skill Rule 7의 스타터 제거 AC를 반드시 포함해야 합니다."
        )

    pkg_path = ROOT / "package.json"
    if pkg_path.exists():
        try:
            pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
            result["dependencies"] = sorted((pkg.get("dependencies") or {}).keys())
            result["dev_dependencies"] = sorted((pkg.get("devDependencies") or {}).keys())
        except Exception as exc:  # noqa: BLE001
            warn(f"package.json 파싱 실패: {exc}")
    else:
        err("package.json이 존재하지 않습니다.")

    return result


# ---------------------------------------------------------------------------
# 8. Explicit input checklist (11 checks) — PASS/FAIL with missing items
# ---------------------------------------------------------------------------

EXPECTED_ROUTES = {
    "SCR-001": "/",
    "SCR-002": "/about",
    "SCR-003": "/travel-tools",
    "SCR-004": "/mates",
    "SCR-005": "/account",
}
REQUIRED_DOCS = [
    "docs/01_PRD.md",
    "docs/02_SRS_BASELINE.md",
    "docs/PROJECT_SCOPE.md",
    "docs/03_UI_COVERAGE_ANALYSIS.md",
    "docs/04_UIUX_PLAN.md",
    "docs/05_UIUX_APPROVED.md",
    "docs/06_SRS_UIUX_REVISED.md",
    "docs/UIUX_TRACEABILITY.md",
    "design-reference/UI_CONTRACT.md",
]
PAGE_ENTRY_RE = re.compile(r"^src/app(?:/[a-z0-9\-\[\]\.]+)*/page\.tsx$|^src/app/page\.tsx$")
AWS_RE = re.compile(r"\b(AWS|EC2)\b", re.IGNORECASE)
AWS_NEGATION = ("제외", "EXCLUDED", "않", "금지", "없", "아니", "false", "추가하지", "사용하지", "두지")


def _load_contract() -> dict | None:
    p = ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return None


def expected_page_entry(route: str) -> str:
    return "src/app/page.tsx" if route == "/" else f"src/app{route}/page.tsx"


def run_spec_checks() -> list[tuple[str, bool, list[str]]]:
    checks: list[tuple[str, bool, list[str]]] = []

    def add(name: str, missing: list[str]) -> None:
        checks.append((name, not missing, missing))

    # 1. package.json Next.js dependency
    missing: list[str] = []
    try:
        pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
        if "next" not in {**(pkg.get("dependencies") or {}), **(pkg.get("devDependencies") or {})}:
            missing.append("package.json에 next 의존성 없음")
    except Exception as exc:  # noqa: BLE001
        pkg = {}
        missing.append(f"package.json 읽기 실패: {exc}")
    add("1. package.json Next.js 의존성", missing)

    # 2. src/app/page.tsx, layout.tsx
    add(
        "2. src/app/page.tsx · layout.tsx 존재",
        [f for f in ("src/app/page.tsx", "src/app/layout.tsx") if not (ROOT / f).exists()],
    )

    # 3. PRD · SRS · Scope · UI documents
    add("3. PRD·SRS·Project Scope·UI 문서 존재", [d for d in REQUIRED_DOCS if not (ROOT / d).exists()])

    # 4. D-001 DESIGN.md + LOCKED manifest
    missing = [f for f in ("design-reference/D-001/DESIGN.md", "design-reference/DESIGN_MANIFEST.md") if not (ROOT / f).exists()]
    manifest = ROOT / "design-reference" / "DESIGN_MANIFEST.md"
    if manifest.exists():
        mtext = manifest.read_text(encoding="utf-8")
        if not re.search(r"Status\W{0,6}LOCKED", mtext):
            missing.append("DESIGN_MANIFEST.md에 Status: LOCKED 없음")
        if "design-reference/D-001/DESIGN.md" not in mtext:
            missing.append("DESIGN_MANIFEST.md Active File이 D-001/DESIGN.md가 아님")
    add("4. D-001 DESIGN.md와 LOCKED Manifest", missing)

    contract = _load_contract()
    screens = (contract or {}).get("screens", []) if isinstance(contract, dict) else []

    # 5. contract parses as JSON
    add("5. SCREEN_ROUTE_CONTRACT.json JSON 파싱", [] if contract is not None else ["파싱 실패 또는 파일 없음"])

    # 6. exactly 5 screens
    add("6. Screen 수 정확히 5개", [] if len(screens) == 5 else [f"현재 {len(screens)}개"])

    # 7. SCR-001..005 all present
    present = {s.get("screen_id") for s in screens}
    add("7. SCR-001~005 존재", [sid for sid in EXPECTED_SCREEN_IDS if sid not in present])

    # 8. routes
    by_id = {s.get("screen_id"): s for s in screens}
    missing = [
        f"{sid}: 기대 {route!r}, 실제 {by_id.get(sid, {}).get('route')!r}"
        for sid, route in EXPECTED_ROUTES.items()
        if by_id.get(sid, {}).get("route") != route
    ]
    add("8. Route가 / /about /travel-tools /mates /account", missing)

    # 9. page entries are real App Router paths and match the route
    missing = []
    for sid, route in EXPECTED_ROUTES.items():
        entry = by_id.get(sid, {}).get("page_entry")
        if not isinstance(entry, str) or not PAGE_ENTRY_RE.match(entry):
            missing.append(f"{sid}: 형식 오류 {entry!r}")
        elif entry != expected_page_entry(route):
            missing.append(f"{sid}: Route와 불일치 {entry!r} (기대 {expected_page_entry(route)})")
    add("9. Page Entry가 App Router 경로 형식", missing)

    # 10. PROJECT_SCOPE lists all 114 requirements
    scope_path = ROOT / "docs" / "PROJECT_SCOPE.md"
    scope_text = scope_path.read_text(encoding="utf-8") if scope_path.exists() else ""
    expected_ids = [f"REQ-FUNC-{i:03d}" for i in range(1, 81)] + [f"REQ-NF-{i:03d}" for i in range(1, 35)]
    found = set(REQ_ID_RE.findall(scope_text))
    add("10. PROJECT_SCOPE에 REQ-FUNC 80개·REQ-NF 34개", [i for i in expected_ids if i not in found])

    # 11. AWS / EC2 not defined as an active technology
    missing = []
    deps = {**(pkg.get("dependencies") or {}), **(pkg.get("devDependencies") or {})} if pkg else {}
    missing += [f"package.json: {d}" for d in deps if d.startswith("@aws-sdk/") or d in ("aws-sdk", "aws-cdk", "aws-cdk-lib")]
    claude_md = ROOT / "CLAUDE.md"
    if claude_md.exists() and re.search(r"AWS_ENABLED\s*=\s*true", claude_md.read_text(encoding="utf-8"), re.IGNORECASE):
        missing.append("CLAUDE.md: AWS_ENABLED=true")
    for rel in ("docs/PROJECT_SCOPE.md", "docs/06_SRS_UIUX_REVISED.md"):
        p = ROOT / rel
        if not p.exists():
            continue
        for n, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
            if AWS_RE.search(line) and not any(w in line for w in AWS_NEGATION):
                missing.append(f"{rel}:{n}: 활성 기술로 읽히는 AWS/EC2 언급")
    add("11. AWS·EC2가 활성 기술로 정의되지 않음", missing)

    return checks


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main() -> int:
    report["generated_at"] = datetime.now(timezone.utc).isoformat()
    report["harness_schema"] = HARNESS_SCHEMA

    screen_route_contract = check_screen_route_contract()
    report["screen_route_contract"] = screen_route_contract

    traceability = check_traceability()
    report["uiux_traceability"] = traceability

    report["project_scope"] = check_project_scope(traceability)
    report["srs_uiux_revised"] = check_srs_revised()
    report["ui_contract"] = check_ui_contract()
    report["design_lock"] = check_design_lock()
    report["src_tree"] = check_src_tree(screen_route_contract)

    spec_checks = run_spec_checks()
    failed_checks = [c for c in spec_checks if not c[1]]
    report["spec_checks"] = [
        {"name": n, "ok": ok, "missing": m} for n, ok, m in spec_checks
    ]
    report["errors"] = errors
    report["warnings"] = warnings
    report["ok"] = len(errors) == 0 and not failed_checks

    out_path = ROOT / "scripts" / ".validate_inputs_report.json"
    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print("=== Traveler Task Pipeline — Input Validation ===")
    print(f"Report written to: {out_path.relative_to(ROOT)}")
    print()
    for name, ok, missing in spec_checks:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
        for m in missing:
            print(f"        - 누락/불일치: {m}")
    print()
    if errors:
        print(f"BLOCKING ERRORS ({len(errors)}):")
        for e in errors:
            print(f"  ✗ {e}")
    else:
        print("BLOCKING ERRORS: none")
    print()
    if warnings:
        print(f"WARNINGS ({len(warnings)}):")
        for w in warnings:
            print(f"  ! {w}")
    else:
        print("WARNINGS: none")
    print()
    if errors or failed_checks:
        print(
            f"VALIDATE_INPUTS_FAIL — 검사 {len(spec_checks) - len(failed_checks)}/{len(spec_checks)} 통과, "
            f"실패 {len(failed_checks)}개, 차단 오류 {len(errors)}건"
        )
        print("DO NOT proceed with /gen-tasklist until errors are fixed.")
        return 1
    print(f"VALIDATE_INPUTS_PASS — 검사 {len(spec_checks)}/{len(spec_checks)} 통과")
    print("OK to proceed with /gen-tasklist.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
