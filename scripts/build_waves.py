#!/usr/bin/env python3
"""
build_waves.py — Builds the Wave execution plan from the already-audited Task
pipeline (TASKS/TASK_MANIFEST.csv, TASKS/TASK-*.md, design-reference/SCREEN_ROUTE_CONTRACT.json).

This script does NOT audit Task content (scripts/audit_tasks.py does that) and
does NOT validate harness scaffolding (scripts/validate_harness.py does that).
It only reads the Depends On graph and produces a deterministic Wave plan:

    TASKS/TASK_DAG.md          — dependency graph, depth per Task, cycle check
    TASKS/WAVE_PLAN.md         — Wave -> Task assignment + Preview Checkpoints
    TASKS/WAVE_STATE.json      — initial per-Wave/per-Task execution state
    TASKS/TASK_MANIFEST.csv    — rewritten with a trailing `wave_id` column

Algorithm (deliberately simple — no retry loops, no "auto-fix" heuristics):

  1. Parse the Depends On graph from TASK_MANIFEST.csv; abort on a cycle.
  2. Classify every Task into one of the 10 narrative groups (Scaffold ->
     common UI/data -> Supabase/Auth -> SCR-001..SCR-005 -> tests/CI -> Release).
  3. Build Waves one at a time: among Tasks whose dependencies all sit in
     earlier Waves, take the lowest group and put up to MAX_WAVE_SIZE of its
     Tasks (Task ID order) into the Wave. A Task whose Expected File is already
     used by another Task of the Wave is left for a later Wave. A Page Owner
     (4개 미만이면 바로 다음 그룹의 ready Task로 채운다) A Page Owner
     only becomes eligible after every other Task of its screen group is in
     an earlier Wave, so it is always the screen's last integration Task.
  4. Verify: every dependency is in a strictly earlier Wave, Page Owners come
     after their screen's other Tasks, at most one Page Owner per Wave.

Wave IDs are assigned sequentially (W01, W02, ...) — they are NOT fixed to
W00..W10; the generated WAVE_PLAN.md/WAVE_STATE.json IDs are the source of
truth. Inside a Wave, Tasks run one at a time in Task ID order (Page Owner last).
An existing WAVE_STATE.json with progress is never overwritten without --force.

No automatic Branch/PR/Merge feature exists anywhere in this script.
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
MANIFEST_PATH = ROOT / "TASKS" / "TASK_MANIFEST.csv"
SCREEN_CONTRACT_PATH = ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"
TASK_DAG_PATH = ROOT / "TASKS" / "TASK_DAG.md"
WAVE_PLAN_PATH = ROOT / "TASKS" / "WAVE_PLAN.md"
WAVE_STATE_PATH = ROOT / "TASKS" / "WAVE_STATE.json"

MIN_WAVE_SIZE = 4
MAX_WAVE_SIZE = 7  # default target is 4-7 Tasks per Wave; small trailing batches under 4 are allowed

GROUP_TITLES: dict[int, str] = {
    1: "Scaffold, 문서, Harness 확인",
    2: "Airbnb 스타일 공통 UI, 정적 데이터, Layout",
    3: "Supabase Auth, 6개 Table, 기본 RLS",
    4: "SCR-001 메인 Component와 Page Owner",
    5: "SCR-002 대표 소개 Component와 Page Owner",
    6: "SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner",
    7: "SCR-004 동행 목록·상세·신청 Component와 Page Owner",
    8: "SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner",
    9: "Unit·Playwright·접근성·CI",
    10: "Vercel Preview와 Release 확인",
}

SCR_RE = re.compile(r"SCR-(00[1-5])")
FILE_RE = re.compile(r"`([^`]+)`")


def die(msg: str) -> None:
    print(f"BUILD_WAVES_FAIL: {msg}")
    sys.exit(1)


def load_manifest() -> list[dict]:
    if not MANIFEST_PATH.exists():
        die(f"{MANIFEST_PATH} 파일이 없습니다. 먼저 scripts/audit_tasks.py를 실행해 생성한다.")
    with MANIFEST_PATH.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        die(f"{MANIFEST_PATH}에 Task 행이 없습니다.")
    return rows


def split_ids(field: str) -> list[str]:
    field = (field or "").strip()
    if not field or field in ("(없음)", "—", "-"):
        return []
    return [x.strip() for x in field.split(",") if x.strip()]


def extract_files(field: str) -> list[str]:
    return [m.strip() for m in FILE_RE.findall(field or "")]


def group_number(task_id: str, category: str, screen_field: str) -> int:
    if task_id.startswith("COMP-SHARED"):
        return 2
    if category == "DEPLOY":
        return 10
    if category == "RELEASE_CHECK":
        return 10
    if category in ("UNIT_TEST", "INTEGRATION_TEST", "E2E_TEST", "CI"):
        return 9
    if category in ("DB", "AUTH"):
        return 3
    if category in ("GLOBAL", "DATA"):
        return 2
    if category == "ROUTE":
        return 2
    nums = [int(m) for m in SCR_RE.findall(screen_field or "")]
    if nums:
        return 3 + min(nums)
    return 2


def detect_cycle(deps: dict[str, list[str]]) -> list[str] | None:
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {t: WHITE for t in deps}
    path: list[str] = []

    def dfs(node: str) -> list[str] | None:
        color[node] = GRAY
        path.append(node)
        for dep in deps.get(node, []):
            if dep not in color:
                continue  # dangling dep, not this script's concern (audit_tasks.py Check 3 covers it)
            if color[dep] == GRAY:
                cycle_start = path.index(dep)
                return path[cycle_start:] + [dep]
            if color[dep] == WHITE:
                found = dfs(dep)
                if found:
                    return found
        path.pop()
        color[node] = BLACK
        return None

    for t in deps:
        if color[t] == WHITE:
            found = dfs(t)
            if found:
                return found
    return None


def compute_depths(deps: dict[str, list[str]]) -> dict[str, int]:
    depth: dict[str, int] = {}

    def depth_of(node: str) -> int:
        if node in depth:
            return depth[node]
        d = 0
        for dep in deps.get(node, []):
            if dep not in deps:
                continue
            d = max(d, depth_of(dep) + 1)
        depth[node] = d
        return d

    for t in deps:
        depth_of(t)
    return depth


def main() -> int:
    rows = load_manifest()
    by_id = {r["task_id"]: r for r in rows}

    # 입력 확인: 상세 Task 파일(TASKS/details/ 또는 TASKS/), Screen 계약의 Page Owner 5개.
    detail_dirs = [d for d in (ROOT / "TASKS" / "details", ROOT / "TASKS") if d.is_dir()]
    for task_id in by_id:
        if not any((d / f"TASK-{task_id}.md").exists() for d in detail_dirs):
            die(f"TASK-{task_id}.md 상세 파일이 없다. 먼저 /gen-task-details를 실행한다.")
    if not SCREEN_CONTRACT_PATH.exists():
        die(f"{SCREEN_CONTRACT_PATH} 파일이 없다.")
    contract = json.loads(SCREEN_CONTRACT_PATH.read_text(encoding="utf-8"))
    screen_ids = [s["screen_id"] for s in contract.get("screens", [])]
    owners = sorted(t for t, r in by_id.items() if r["category"] == "PAGE_OWNER")
    expected_owners = sorted("PAGE-" + sid.replace("-", "") for sid in screen_ids)
    if owners != expected_owners:
        die(f"Page Owner Task({owners})가 Screen 계약({expected_owners})과 다르다.")

    # 진행 기록 보호: 이미 시작된 Wave 상태가 있으면 --force 없이 덮어쓰지 않는다.
    if WAVE_STATE_PATH.exists() and "--force" not in sys.argv:
        old = json.loads(WAVE_STATE_PATH.read_text(encoding="utf-8"))
        started = [w["wave_id"] for w in old.get("waves", [])
                   if w.get("status") != "pending" or w.get("task_status")
                   and any(v != "pending" for v in w["task_status"].values())]
        if started:
            die(f"WAVE_STATE.json에 진행 기록이 있는 Wave({', '.join(started)})가 있어 덮어쓰지 않는다. "
                "초기화하려면 --force를 붙인다.")
    seq_of = {r["task_id"]: int(r["seq"]) for r in rows}

    deps: dict[str, list[str]] = {r["task_id"]: split_ids(r["depends_on"]) for r in rows}

    for task_id, dlist in deps.items():
        for d in dlist:
            if d not in by_id:
                die(f"{task_id}의 Depends On '{d}'가 TASK_MANIFEST.csv에 없는 Task ID다. "
                    f"scripts/audit_tasks.py Check 3(Depends On 누락)을 먼저 통과시킨다.")

    cycle = detect_cycle(deps)
    if cycle:
        die("순환 의존성 발견: " + " -> ".join(cycle))
    cycle_count = 0

    depths = compute_depths(deps)  # informational only (TASK_DAG.md) — waving uses Kahn batching below

    groups = {
        r["task_id"]: group_number(r["task_id"], r["category"], r["screen"])
        for r in rows
    }

    # Wave 배치: 한 Wave에는 한 그룹의 Task만 넣는다. 매 단계마다 "선행 Task가 모두
    # 이전 Wave에 배치된" ready Task 중 가장 낮은 그룹을 골라 최대 MAX_WAVE_SIZE개를
    # Task ID 순으로 담는다. 같은 Expected File을 건드리는 Task는 같은 Wave에 담지 않고
    # (건너뛰어 다음 Wave 후보로 남긴다), Page Owner는 같은 그룹의 나머지 Task가 모두
    # 이전 Wave에 배치된 뒤에만 후보가 된다(= 그 화면의 마지막 통합 Task).
    files_of = {r["task_id"]: extract_files(r["expected_files"]) for r in rows}
    is_po = {t: by_id[t]["category"] == "PAGE_OWNER" for t in by_id}
    scheduled: set[str] = set()
    waves: list[list[str]] = []
    wave_anchor: list[int] = []  # Wave 제목을 정하는 그룹(가장 낮은 그룹)
    conflict_moves = 0

    while len(scheduled) < len(by_id):
        ready = [t for t in by_id
                 if t not in scheduled and all(d in scheduled for d in deps[t])
                 and (not is_po[t] or all(x in scheduled for x in by_id
                      if groups[x] == groups[t] and not is_po[x]))]
        if not ready:
            die("배치 가능한 Task가 없음(Page Owner가 같은 그룹 Task의 선행이 되는 등 그래프 이상): "
                + ", ".join(sorted(set(by_id) - scheduled)))
        g = min(groups[t] for t in ready)
        batch: list[str] = []
        used_files: set[str] = set()
        for t in sorted((t for t in ready if groups[t] == g), key=lambda t: (is_po[t], t)):
            if len(batch) >= MAX_WAVE_SIZE:
                break
            if any(f in used_files for f in files_of[t]):
                conflict_moves += 1
                continue
            batch.append(t)
            used_files.update(files_of[t])
        # 4개 미만이면 바로 다음 그룹의 ready Task(Page Owner 제외, Release 그룹 제외)로 채운다(Page Owner Wave는 채우지 않는다).
        for t in sorted((t for t in ready if groups[t] == g + 1 <= 9 and not is_po[t]
                         and not any(is_po[x] for x in batch)),
                        key=lambda t: (groups[t], t)):
            if len(batch) >= MIN_WAVE_SIZE:
                break
            if any(f in used_files for f in files_of[t]):
                continue
            batch.append(t)
            used_files.update(files_of[t])
        batch.sort(key=lambda t: (is_po[t], t))
        waves.append(batch)
        wave_anchor.append(g)
        scheduled.update(batch)

    wave_index_of: dict[str, int] = {}
    for idx, w in enumerate(waves):
        for task_id in w:
            wave_index_of[task_id] = idx

    violations = []
    for task_id, dlist in deps.items():
        for d in dlist:
            if wave_index_of[d] >= wave_index_of[task_id]:
                violations.append(f"{task_id}가 자신의 선행 Task {d}와 같거나 더 이른 Wave에 있음")
    for t in by_id:
        if is_po[t]:
            for x in by_id:
                if groups[x] == groups[t] and not is_po[x] and wave_index_of[x] >= wave_index_of[t]:
                    violations.append(f"Page Owner {t}가 같은 화면의 {x}보다 먼저(또는 같은 Wave에) 있음")
    for idx, w in enumerate(waves):
        if sum(is_po[t] for t in w) > 1:
            violations.append(f"Wave 인덱스 {idx}에 Page Owner가 2개 이상 있음")
    if violations:
        die("Wave 배치가 규칙을 위반함:\n  - " + "\n  - ".join(violations))

    wave_ids = [f"W{idx+1:02d}" for idx in range(len(waves))]

    wave_titles = [GROUP_TITLES[g] for g in wave_anchor]
    wave_checkpoints = [
        next((t for t in w if by_id[t]["category"] == "PAGE_OWNER"), None) for w in waves
    ]

    # --- TASKS/TASK_DAG.md ---
    dag_lines = [
        "# TASK_DAG — Free Traveler",
        "",
        "`scripts/build_waves.py`가 `TASKS/TASK_MANIFEST.csv`의 Depends On 열에서 생성한 의존성 그래프다. "
        "이 문서는 읽기 전용 산출물이며 사람이 직접 편집하지 않는다 — 다시 만들려면 `python3 scripts/build_waves.py`를 재실행한다.",
        "",
        f"- 순환 의존성 검사 결과: **{cycle_count}건**",
        f"- Task 총 수: **{len(by_id)}**",
        f"- 최대 Depth: **{max(depths.values())}**",
        "",
        "## Task별 Depth·Group·Wave",
        "",
        "| Task ID | Category | Depth | Group | Depends On | Wave |",
        "|---|---|---|---|---|---|",
    ]
    for task_id in sorted(by_id, key=lambda t: (depths[t], seq_of[t])):
        r = by_id[task_id]
        dep_str = ", ".join(deps[task_id]) if deps[task_id] else "(없음)"
        dag_lines.append(
            f"| {task_id} | {r['category']} | {depths[task_id]} | {groups[task_id]} "
            f"({GROUP_TITLES[groups[task_id]]}) | {dep_str} | {wave_ids[wave_index_of[task_id]]} |"
        )
    dag_lines.append("")
    dag_lines.append("## 위상 순서(Depth 오름차순, 참고용 — 실제 Wave 배치 기준은 아래 WAVE_PLAN.md)")
    dag_lines.append("")
    depth_groups: dict[int, list[str]] = {}
    for task_id, d in depths.items():
        depth_groups.setdefault(d, []).append(task_id)
    for d in sorted(depth_groups):
        ids_in_depth = sorted(depth_groups[d], key=lambda t: seq_of[t])
        dag_lines.append(f"- Depth {d}: {', '.join(ids_in_depth)}")
    TASK_DAG_PATH.write_text("\n".join(dag_lines) + "\n", encoding="utf-8")

    # --- TASKS/WAVE_PLAN.md ---
    plan_lines = [
        "# WAVE_PLAN — Free Traveler",
        "",
        "`scripts/build_waves.py`가 생성한 Wave 계획이다. `/run-wave`는 이 파일을 **읽기만** 한다. "
        "Wave ID는 W00~W10으로 미리 고정하지 않고, 이 생성 결과의 실제 ID가 이후 단계의 정본이다.",
        "",
    ]
    for idx, (wid, title, w, checkpoint) in enumerate(zip(wave_ids, wave_titles, waves, wave_checkpoints)):
        plan_lines.append(f"## {wid} — {title}")
        plan_lines.append(f"- Tasks: {', '.join(w)}")
        if checkpoint:
            plan_lines.append(f"- Preview Checkpoint: {checkpoint}  <!-- 이 Task가 DONE되면 사람 Preview 전까지 Wave를 멈춘다 -->")
        plan_lines.append("")
    WAVE_PLAN_PATH.write_text("\n".join(plan_lines).rstrip() + "\n", encoding="utf-8")

    # --- TASKS/WAVE_STATE.json ---
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    state = {
        "schema_version": "traveler-wave-state-v1",
        "generated_at": now,
        "waves": [
            {
                "wave_id": wid,
                "title": title,
                "task_ids": w,
                "status": "pending",  # pending | in_progress | blocked | completed
                "checkpoint_required": checkpoint is not None,
                "checkpoint_result": None,
            }
            for wid, title, w, checkpoint in zip(wave_ids, wave_titles, waves, wave_checkpoints)
        ],
    }
    WAVE_STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # --- TASKS/TASK_MANIFEST.csv (+wave_id column) ---
    fieldnames = list(rows[0].keys())
    if "wave_id" not in fieldnames:
        fieldnames.append("wave_id")
    for r in rows:
        r["wave_id"] = wave_ids[wave_index_of[r["task_id"]]]
    with MANIFEST_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print("=== Traveler Wave Builder ===")
    print(f"순환 의존성: {cycle_count}건")
    print(f"파일 충돌로 같은 Wave에서 제외된 횟수: {conflict_moves}건")
    print(f"Wave당 Task 수 범위: {min(len(w) for w in waves)}~{max(len(w) for w in waves)}개")
    print(f"생성된 Wave 수: {len(waves)}")
    print()
    for wid, title, w, checkpoint in zip(wave_ids, wave_titles, waves, wave_checkpoints):
        marker = f" [Preview Checkpoint: {checkpoint}]" if checkpoint else ""
        print(f"  {wid} ({len(w)}개) — {title}{marker}")
        print(f"    {', '.join(w)}")
    print()
    print("Page Owner 위치: " + ", ".join(f"{t}→{wave_ids[wave_index_of[t]]}" for t in owners))
    print(f"출력: {TASK_DAG_PATH.relative_to(ROOT)}, {WAVE_PLAN_PATH.relative_to(ROOT)}, "
          f"{WAVE_STATE_PATH.relative_to(ROOT)}, {MANIFEST_PATH.relative_to(ROOT)}(wave_id 열 갱신)")
    print()
    print("BUILD_WAVES_PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
