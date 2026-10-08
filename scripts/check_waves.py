#!/usr/bin/env python3
"""check_waves.py — WAVE_PLAN.md / WAVE_STATE.json / TASK_MANIFEST.csv 읽기 전용 검사.

Task 1회 배치, dependency 순서, Page Owner 위치, E2E/DEPLOY 순서, PLAN·STATE·Manifest 일치,
EC2/AWS/자동 Merge Task 부재를 확인한다. 통과 시 WAVES_PASS, 실패 시 exit 1.
"""
import csv, json, re, sys
from pathlib import Path

for s in (sys.stdout, sys.stderr):
    if hasattr(s, "reconfigure"):
        s.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
errors: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


state = json.loads((ROOT / "TASKS/WAVE_STATE.json").read_text(encoding="utf-8"))
plan = (ROOT / "TASKS/WAVE_PLAN.md").read_text(encoding="utf-8")
with (ROOT / "TASKS/TASK_MANIFEST.csv").open(encoding="utf-8-sig", newline="") as f:
    rows = {r["task_id"]: r for r in csv.DictReader(f)}

pos: dict[str, tuple[int, int]] = {}
for i, w in enumerate(state["waves"]):
    for j, t in enumerate(w["task_ids"]):
        if t in pos:
            err(f"{t}가 두 Wave 이상에 있음")
        pos[t] = (i, j)
if set(pos) != set(rows):
    err(f"Wave 미배치/초과 Task: {sorted(set(rows) ^ set(pos))}")
if not all(w["status"] in ("pending", "in_progress", "blocked", "completed") for w in state["waves"]):
    err("WAVE_STATE.json status 값이 허용 목록(pending|in_progress|blocked|completed) 밖")

for t, r in rows.items():
    for d in re.split(r",\s*", r["depends_on"]):
        if d and d != "(없음)" and t in pos and d in pos and pos[d] >= pos[t]:
            err(f"{t}의 선행 {d}가 같은 Wave이거나 더 뒤에 있음")

owners = [t for t, r in rows.items() if r["category"] == "PAGE_OWNER"]
if len(owners) != 5:
    err(f"Page Owner가 {len(owners)}개(5개여야 함)")
for t in owners:
    i, j = pos[t]
    ids = state["waves"][i]["task_ids"]
    if ids[-1] != t:
        err(f"{t}가 자기 Wave의 마지막 Task가 아님")
    for x, r in rows.items():
        if x != t and r["screen"] == rows[t]["screen"] and r["category"] in ("COMPONENT", "DATA", "API") and pos[x] >= pos[t]:
            err(f"{t}가 같은 화면의 {x}보다 앞/같은 Wave에 있음")
    if sum(1 for x in ids if rows[x]["category"] == "PAGE_OWNER") != 1:
        err(f"{state['waves'][i]['wave_id']}에 Page Owner가 2개 이상")

last_owner = max(pos[t] for t in owners)
for t, r in rows.items():
    if r["category"] in ("E2E_TEST", "DEPLOY", "RELEASE_CHECK") and pos[t] <= last_owner:
        err(f"{t}({r['category']})가 마지막 Page Owner보다 앞에 있음")
for t, r in rows.items():
    if r["category"] == "DEPLOY":
        for c, q in rows.items():
            if q["category"] == "CI" and pos[c] >= pos[t]:
                err(f"{t}가 CI Task {c}보다 앞에 있음")

plan_waves = {m.group(1): m.group(2).split(", ") for m in re.finditer(r"## (W\d+) — .*\n- Tasks: (.*)", plan)}
if plan_waves != {w["wave_id"]: w["task_ids"] for w in state["waves"]}:
    err("WAVE_PLAN.md와 WAVE_STATE.json의 Wave ID/Task 목록이 다름")
for t, r in rows.items():
    if r.get("wave_id") != state["waves"][pos[t][0]]["wave_id"]:
        err(f"TASK_MANIFEST.csv wave_id 불일치: {t}")
    if re.search(r"EC2|AWS|AUTO-?MERGE", t, re.I) or re.search(r"EC2|AWS|자동 ?Merge", r["title"], re.I):
        err(f"금지 Task 혼입: {t}")

if errors:
    print("WAVES_FAIL")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
print(f"WAVES_PASS — Wave {len(state['waves'])}개, Task {len(pos)}개")
