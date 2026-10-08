#!/usr/bin/env python3
"""check_screen_contract.py — 고정 화면 5개와 Page Owner/Route 계약 검사.

입력: design-reference/SCREEN_ROUTE_CONTRACT.json, TASKS/TASK_MANIFEST.csv, src/app/

  --mode=plan     Page Owner와 경로 계획만 검사 (기본값)
  --mode=ci       plan + 구현된 Page 파일과 공개 경로 검사 (W13 이후 CI에서 사용)
  --mode=release  ci + docs/preview-checks/SCR-001~005.md 존재 확인

오류는 파일·화면 ID·수정 힌트와 함께 출력하고 exit 1, 통과하면 SCREEN_CONTRACT_PASS.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
CONTRACT = ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"
MANIFEST = ROOT / "TASKS" / "TASK_MANIFEST.csv"
APP = ROOT / "src" / "app"
PREVIEW_DIR = ROOT / "docs" / "preview-checks"

HARNESS_SCHEMA = "traveler-screen-route-v1"
FIXED = {
    "SCR-001": ("/", "src/app/page.tsx"),
    "SCR-002": ("/about", "src/app/about/page.tsx"),
    "SCR-003": ("/travel-tools", "src/app/travel-tools/page.tsx"),
    "SCR-004": ("/mates", "src/app/mates/page.tsx"),
    "SCR-005": ("/account", "src/app/account/page.tsx"),
}
# 사용자 화면이 아닌 기술 경로로 허용하는 종류. 계약(technical_routes)에 선언된 것만 허용한다.
TECH_CATEGORIES = {"auth_callback", "api_route", "not_found", "error_boundary", "static_policy_page"}
STARTER_MARKERS = ("To get started", "Deploy Now", "Documentation", "next.svg", "vercel.svg")

errors: list[str] = []


def err(file: str, screen: str, msg: str, hint: str) -> None:
    errors.append(f"[{screen}] {file}\n    문제: {msg}\n    수정 힌트: {hint}")


def rel(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()


def load() -> tuple[dict, list[dict]]:
    for p in (CONTRACT, MANIFEST):
        if not p.exists():
            print(f"SCREEN_CONTRACT_FAIL\n  {rel(p)} 파일이 없습니다. 먼저 해당 산출물을 생성하세요.")
            sys.exit(1)
    contract = json.loads(CONTRACT.read_text(encoding="utf-8"))
    with MANIFEST.open(encoding="utf-8-sig", newline="") as f:
        return contract, list(csv.DictReader(f))


def check_contract(contract: dict) -> None:
    f = rel(CONTRACT)
    if contract.get("schema_version") != HARNESS_SCHEMA:
        err(f, "-", f"schema_version이 {contract.get('schema_version')!r}", f"{HARNESS_SCHEMA!r}로 맞추세요.")
    screens = contract.get("screens", [])
    ids = [s.get("screen_id") for s in screens]
    # 1. 고정 화면 5개가 정확히 존재
    if sorted(ids) != sorted(FIXED) or contract.get("screen_count") != 5:
        err(f, "-", f"screens={ids}, screen_count={contract.get('screen_count')}",
            f"screens[]를 {sorted(FIXED)} 5개로 정확히 맞추고 screen_count를 5로 두세요.")
    for s in screens:
        sid = s.get("screen_id")
        if sid in FIXED and (s.get("route"), s.get("page_entry")) != FIXED[sid]:
            err(f, sid, f"route/page_entry={s.get('route')}, {s.get('page_entry')}",
                f"route={FIXED[sid][0]}, page_entry={FIXED[sid][1]}로 고정하세요.")
    # 3. 기술 경로는 화면으로 세지 않는다
    for t in contract.get("technical_routes", []):
        if t.get("category") not in TECH_CATEGORIES:
            err(f, "-", f"허용되지 않은 기술 경로 종류 {t.get('category')} ({t.get('path')})",
                "기술 경로는 auth callback, /api/**, not-found(및 error·정책 페이지)만 둘 수 있습니다.")
        if t.get("counted_in_screen_count") is not False:
            err(f, "-", f"기술 경로 {t.get('path')}가 화면 수에 포함됨", "counted_in_screen_count를 false로 두세요.")
        if t.get("category") == "api_route" and not str(t.get("path", "")).startswith("/api/"):
            err(f, "-", f"api_route 경로 {t.get('path')}가 /api/ 아래가 아님", "/api/** 경로만 사용하세요.")


def check_page_owners(rows: list[dict]) -> dict[str, dict]:
    owners: dict[str, dict] = {}
    f = rel(MANIFEST)
    po_rows = [r for r in rows if r["category"] == "PAGE_OWNER"]
    for sid, (route, entry) in FIXED.items():
        mine = [r for r in po_rows if r["screen"].strip() == sid]
        # 2. 화면마다 Page Owner Task가 정확히 하나
        if len(mine) != 1:
            err(f, sid, f"Page Owner Task {len(mine)}개 ({[r['task_id'] for r in mine]})",
                f"{sid}의 PAGE_OWNER Task를 정확히 1개만 두세요(00_TASK_LIST.md 수정 후 audit_tasks.py 재실행).")
            continue
        r = mine[0]
        owners[sid] = r
        if route not in r["route"] or entry not in r["page_entry"]:
            err(f, sid, f"{r['task_id']}의 Route/Page Entry가 {r['route']} / {r['page_entry']}",
                f"{route} / {entry}와 일치시키세요.")
    extra = [r["task_id"] for r in po_rows if r["screen"].strip() not in FIXED]
    if extra:
        err(f, "-", f"고정 화면 밖의 Page Owner Task: {extra}", "새 화면용 Page Owner를 만들지 마세요.")
    return owners


def check_no_new_pages_plan(contract: dict, rows: list[dict]) -> None:
    """4(계획). Task가 5개 화면과 계약의 기술 경로 밖의 page.tsx를 만들도록 계획하지 않았는지."""
    allowed = {e for _, e in FIXED.values()} | {t["entry"] for t in contract.get("technical_routes", [])}
    for r in rows:
        for path in re.findall(r"`([^`]+)`", r["expected_files"]):
            if re.search(r"(^|/)page\.tsx$", path) and path.startswith("src/app/") and path not in allowed:
                err(f"TASKS/TASK-{r['task_id']}.md", r["screen"] or "-", f"계약에 없는 Page 파일 계획: {path}",
                    "여행지 상세·안전정보는 Drawer로 구현하고 새 page.tsx를 Expected Files에서 빼세요.")


def check_scr003(owners: dict[str, dict]) -> None:
    """5. SCR-003 Task가 여행 입력과 동행 작성 요구를 모두 포함."""
    r = owners.get("SCR-003")
    if not r:
        return
    f = f"TASKS/TASK-{r['task_id']}.md"
    for need, label in (("FLIGHT-FORM", "항공 입력"), ("HOTEL-FORM", "숙소 입력"), ("MATE-COMPOSER", "동행 작성")):
        if need not in r["depends_on"]:
            err(f, "SCR-003", f"Depends On에 {label} Component(COMP-SCR003-{need})가 없음",
                f"PAGE-SCR003의 Depends On에 COMP-SCR003-{need}를 추가하세요.")
    for kw, label in (("항공", "항공"), ("숙소", "숙소"), ("동행", "동행 작성")):
        if kw not in r["functional_ac"]:
            err(f, "SCR-003", f"Functional AC에 '{kw}' 요구가 없음", f"{label} 탭 조립 AC를 추가하세요.")


def check_implemented(contract: dict, owners: dict[str, dict]) -> None:
    """ci/release: 구현된 Page 파일과 공개 경로."""
    for sid, (_route, entry) in FIXED.items():
        p = ROOT / entry
        if not p.exists():
            task = owners.get(sid, {}).get("task_id", "PAGE-" + sid.replace("-", ""))
            err(entry, sid, "Page 파일이 없음", f"{task} Task를 구현해 {entry}를 만드세요.")
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        if "export default" not in text:
            err(entry, sid, "default export가 없음", "Page 컴포넌트를 export default로 내보내세요.")
        if sid == "SCR-001":
            hit = [m for m in STARTER_MARKERS if m in text]
            if hit:
                err(entry, sid, f"create-next-app 스타터 흔적 {hit}",
                    "스타터 콘텐츠를 전량 제거하고 계약된 7개 Section으로 교체하세요.")
    # 4(구현). 계약 밖 page.tsx / route.ts 금지
    allowed = {e for _, e in FIXED.values()} | {t["entry"] for t in contract.get("technical_routes", [])}
    for p in sorted(APP.rglob("page.tsx")):
        if rel(p) not in allowed:
            err(rel(p), "-", "계약에 없는 Page(화면 추가)",
                "여행지 상세·안전정보는 새 Page 대신 Drawer로 구현하고 이 파일을 삭제하세요.")
    for p in sorted(APP.rglob("route.ts")):
        if rel(p) not in allowed:
            err(rel(p), "-", "계약에 없는 Route Handler",
                "SCREEN_ROUTE_CONTRACT.json technical_routes에 등록하거나 삭제하세요.")


def check_release() -> None:
    """6. Preview Checkpoint 문서."""
    for sid in FIXED:
        p = PREVIEW_DIR / f"{sid}.md"
        if not p.exists() or not p.read_text(encoding="utf-8", errors="replace").strip():
            err(rel(p), sid, "Preview 확인 문서가 없거나 비어 있음",
                f"사람이 Preview를 확인한 결과를 docs/preview-checks/{sid}.md에 기록하세요.")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--mode", choices=("plan", "ci", "release"), default="plan")
    args = ap.parse_args()

    contract, rows = load()
    check_contract(contract)
    owners = check_page_owners(rows)
    check_no_new_pages_plan(contract, rows)
    check_scr003(owners)
    if args.mode in ("ci", "release"):
        check_implemented(contract, owners)
    if args.mode == "release":
        check_release()

    if errors:
        print(f"SCREEN_CONTRACT_FAIL (mode={args.mode}) — 오류 {len(errors)}건")
        for e in errors:
            print(f"  - {e}")
        return 1
    print(f"SCREEN_CONTRACT_PASS (mode={args.mode}) — 고정 화면 5개, Page Owner 5개")
    return 0


if __name__ == "__main__":
    sys.exit(main())
