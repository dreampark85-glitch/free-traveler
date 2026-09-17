#!/usr/bin/env python3
"""
validate_harness.py — Validates that the Traveler Agent Harness itself is
correctly set up: CLAUDE.md, the Skill file, the 7 pipeline Commands, the
Harness Marker block, and the binding rules those files must state.

This script does NOT validate Task List / Task Detail content
(scripts/validate_inputs.py and scripts/audit_tasks.py do that). It only
validates that the harness scaffolding — the files and rules an Agent reads
before doing anything — exists and is internally consistent.

Inputs:
    CLAUDE.md
    .claude/skills/traveler-project-pipeline/SKILL.md
    .claude/commands/*.md (7 required)
    design-reference/SCREEN_ROUTE_CONTRACT.json
    design-reference/D-001/DESIGN.md

Usage:
    python3 scripts/validate_harness.py

Exit code 0 = VALIDATE_HARNESS_PASS.
Exit code 1 = at least one check failed; missing files/rules are printed.
"""

from __future__ import annotations

import json
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
CLAUDE_MD_PATH = ROOT / "CLAUDE.md"
SKILL_MD_PATH = ROOT / ".claude" / "skills" / "traveler-project-pipeline" / "SKILL.md"
COMMANDS_DIR = ROOT / ".claude" / "commands"
SCREEN_CONTRACT_PATH = ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"
DESIGN_PATH = ROOT / "design-reference" / "D-001" / "DESIGN.md"

REQUIRED_COMMANDS = [
    "gen-tasklist.md",
    "gen-task-details.md",
    "audit-tasks.md",
    "prepare-task.md",
    "implement-task.md",
    "run-wave.md",
    "release-check.md",
]

HARNESS_SCHEMA = "traveler-screen-route-v1"
ALLOWED_DB_TABLES = [
    "user_profile", "mate_post", "mate_application",
    "user_block", "report", "outbound_link_setting",
]

CHECK_NAMES = {
    1: "CLAUDE.md 존재",
    2: "Claude Code Skill 파일 존재",
    3: "7개 Command 존재",
    4: "traveler-screen-route-v1 Marker 존재",
    5: "D-001 DESIGN 경로 일치",
    6: "Screen Contract 경로 일치",
    7: "Page Owner 5개 규칙 존재",
    8: "DB Table 6개 기본 범위 존재",
    9: "외부 입력 비저장 규칙 존재",
    10: "Playwright Chromium Smoke 규칙 존재",
    11: "AUTO_MERGE=false",
    12: "AWS_ENABLED=false",
    13: "EXCLUDED 보호 규칙 존재",
}

errors: dict[int, list[str]] = {n: [] for n in CHECK_NAMES}


def err(n: int, msg: str) -> None:
    errors[n].append(msg)


def rel(p: Path) -> str:
    try:
        return str(p.relative_to(ROOT))
    except ValueError:
        return str(p)


def main() -> int:
    claude_md_text = ""
    skill_md_text = ""

    # 1. CLAUDE.md 존재
    if not CLAUDE_MD_PATH.exists():
        err(1, f"{rel(CLAUDE_MD_PATH)} 파일이 없습니다.")
    else:
        claude_md_text = CLAUDE_MD_PATH.read_text(encoding="utf-8")

    # 2. Claude Code Skill 파일 존재
    if not SKILL_MD_PATH.exists():
        err(2, f"{rel(SKILL_MD_PATH)} 파일이 없습니다.")
    else:
        skill_md_text = SKILL_MD_PATH.read_text(encoding="utf-8")

    # 3. 7개 Command 존재
    missing_commands = []
    for name in REQUIRED_COMMANDS:
        if not (COMMANDS_DIR / name).exists():
            missing_commands.append(name)
    if missing_commands:
        err(3, f".claude/commands/ 에 다음 Command 파일이 없습니다: {missing_commands}")
    if not COMMANDS_DIR.exists():
        err(3, f"{rel(COMMANDS_DIR)} 디렉터리 자체가 없습니다.")

    combined_text = claude_md_text + "\n" + skill_md_text

    # 4. traveler-screen-route-v1 Marker 존재 (+ 실제 Screen Contract schema_version과 일치)
    if f"HARNESS_SCHEMA={HARNESS_SCHEMA}" not in claude_md_text and HARNESS_SCHEMA not in combined_text:
        err(4, f"CLAUDE.md(또는 SKILL.md)에 '{HARNESS_SCHEMA}' Marker가 없습니다.")
    if SCREEN_CONTRACT_PATH.exists():
        try:
            contract = json.loads(SCREEN_CONTRACT_PATH.read_text(encoding="utf-8"))
            if contract.get("schema_version") != HARNESS_SCHEMA:
                err(4, f"{rel(SCREEN_CONTRACT_PATH)}.schema_version이 '{HARNESS_SCHEMA}'가 아닙니다: {contract.get('schema_version')!r}")
        except json.JSONDecodeError as e:
            err(4, f"{rel(SCREEN_CONTRACT_PATH)} JSON 파싱 실패: {e}")
    else:
        err(4, f"{rel(SCREEN_CONTRACT_PATH)} 파일이 없어 Marker와의 일치 여부를 확인할 수 없습니다.")

    # 5. D-001 DESIGN 경로 일치
    if "DESIGN_PATH=design-reference/D-001/DESIGN.md" not in claude_md_text:
        err(5, "CLAUDE.md에 'DESIGN_PATH=design-reference/D-001/DESIGN.md' Marker가 없습니다.")
    if not DESIGN_PATH.exists():
        err(5, f"{rel(DESIGN_PATH)} 파일이 실제로 존재하지 않습니다 — Marker가 가리키는 경로와 실제 파일이 어긋납니다.")

    # 6. Screen Contract 경로 일치
    if "SCREEN_CONTRACT=design-reference/SCREEN_ROUTE_CONTRACT.json" not in claude_md_text:
        err(6, "CLAUDE.md에 'SCREEN_CONTRACT=design-reference/SCREEN_ROUTE_CONTRACT.json' Marker가 없습니다.")
    if not SCREEN_CONTRACT_PATH.exists():
        err(6, f"{rel(SCREEN_CONTRACT_PATH)} 파일이 실제로 존재하지 않습니다 — Marker가 가리키는 경로와 실제 파일이 어긋납니다.")

    # 7. Page Owner 5개 규칙 존재
    page_owner_pattern = re.compile(
        r"(정확히\s*)?5\s*개\s*(?:의\s*)?(?:Screen\S*\s*)?(?:마다\s*)?.{0,40}Page\s*Owner"
        r"|Page\s*Owner.{0,40}5\s*개",
        re.IGNORECASE | re.DOTALL,
    )
    if not page_owner_pattern.search(combined_text):
        err(7, "CLAUDE.md/SKILL.md 어디에도 'Page Owner가 정확히 5개'라는 취지의 규칙 문구가 없습니다.")

    # 8. DB Table 6개 기본 범위 존재
    if not re.search(r"6\s*개.{0,20}(?:테이블|Table)", combined_text, re.IGNORECASE):
        err(8, "CLAUDE.md/SKILL.md에 'DB는 6개 테이블로 제한한다'는 취지의 규칙 문구가 없습니다.")
    missing_tables = [t for t in ALLOWED_DB_TABLES if t not in combined_text]
    if missing_tables:
        err(8, f"CLAUDE.md/SKILL.md에 다음 허용 테이블명이 명시되어 있지 않습니다: {missing_tables}")

    # 9. 외부 입력 비저장 규칙 존재
    has_flight_hotel = ("항공" in combined_text) and ("숙소" in combined_text)
    has_non_transmission = re.search(r"(서버|DB|URL|로그).{0,30}(전송하지|보내지)\s*않", combined_text) is not None
    if not (has_flight_hotel and has_non_transmission):
        err(9, "CLAUDE.md/SKILL.md에 '항공·숙소 입력값을 서버·DB·URL·로그로 전송/저장하지 않는다'는 취지의 규칙 문구가 없습니다.")

    # 10. Playwright Chromium Smoke 규칙 존재
    if not re.search(r"Playwright.{0,60}[Cc]hromium|[Cc]hromium.{0,60}Playwright", combined_text, re.DOTALL):
        err(10, "CLAUDE.md/SKILL.md에 'Playwright는 Chromium 전용 Smoke만 작성한다'는 취지의 규칙 문구가 없습니다.")

    # 11. AUTO_MERGE=false
    if "AUTO_MERGE=false" not in claude_md_text:
        err(11, "CLAUDE.md에 'AUTO_MERGE=false' Marker가 없습니다.")

    # 12. AWS_ENABLED=false
    if "AWS_ENABLED=false" not in claude_md_text:
        err(12, "CLAUDE.md에 'AWS_ENABLED=false' Marker가 없습니다.")

    # 13. EXCLUDED 보호 규칙 존재
    if not re.search(r"EXCLUDED.{0,30}(구현하지\s*않|만들지\s*않)", combined_text, re.DOTALL):
        err(13, "CLAUDE.md/SKILL.md에 'EXCLUDED로 분류된 기능을 임의로 구현하지 않는다'는 취지의 규칙 문구가 없습니다.")

    all_pass = all(not v for v in errors.values())

    print("=== Traveler Harness Validation ===")
    for n in range(1, 14):
        status = "PASS" if not errors[n] else "FAIL"
        print(f"  [{status}] #{n} {CHECK_NAMES[n]}")
        for e in errors[n]:
            print(f"           - {e}")

    print()
    if all_pass:
        print("VALIDATE_HARNESS_PASS")
        return 0

    print("VALIDATE_HARNESS_FAIL")
    return 1


if __name__ == "__main__":
    sys.exit(main())
