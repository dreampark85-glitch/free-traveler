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

  1. Parse the Depends On graph from TASK_MANIFEST.csv.
  2. Detect dependency cycles (DFS 3-color). Abort if any cycle is found —
     a Wave plan cannot be built on a cyclic graph.
  3. Classify every Task into one of the 10 narrative Wave groups the user
     specified (Scaffold -> common UI/data -> Supabase/Auth -> SCR-001..
     SCR-005 -> Unit/Playwright/CI -> Release) from its category/screen.
  4. Batch Tasks into Waves with Kahn's algorithm: repeatedly take up to
     MAX_WAVE_SIZE Tasks from the set of Tasks whose dependencies are ALL
     already assigned to a strictly earlier Wave, always preferring the
     lowest (group, seq) Tasks first. Because a Task only ever becomes
     eligible once every dependency already sits in an earlier Wave, two
     Tasks placed in the same batch can never depend on each other, and
     rule 2 (a predecessor is never placed in a later Wave than something
     that depends on it) holds by construction — not by chance. Depth
     (longest path from a root) is computed separately only for the
     informational TASK_DAG.md report. Wave IDs are assigned sequentially
     in this order — they are NOT fixed to W00..W10; the actual generated
     TASKS/WAVE_PLAN.md/WAVE_STATE.json IDs become the source of truth for
     later steps.
  5. Single forward pass: if two Tasks placed in the same Wave touch the same
     Expected File path, push the later one (by group/seq order) into the
     immediately following Wave. This is a one-shot forward sweep, not a
     retry loop — a Task is moved at most once per pass.
  6. Within each Wave's printed Task list, PAGE_OWNER Tasks are ordered last
     (a Page Owner depends on nearly everything else in its screen, so it
     already becomes eligible last within its own group — this only affects
     display order, never membership).
  7. Final verification pass: for every dependency edge, confirm the
     dependency's Wave index is strictly less than the dependent's Wave
     index. Abort loudly rather than emit an inconsistent plan.

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

    # Kahn's algorithm with (group, seq) priority, batched into Waves of up to
    # MAX_WAVE_SIZE. Depth-stratification alone would group Tasks purely by
    # how deep their dependency chain is, which coincidentally mixes unrelated
    # screens (and even scattered all 5 Page Owners into one Wave) whenever
    # their chains happened to be equally long. Priority batching instead
    # always schedules the lowest (group, seq) Tasks whose dependencies are
    # already scheduled, so Tasks naturally cluster by the user's 10 narrative
    # groups while still never violating dependency order — a Task only ever
    # enters `ready` once every dependency has been assigned to a strictly
    # earlier Wave, so two Tasks in the same batch can never depend on each
    # other.
    dependents: dict[str, list[str]] = {t: [] for t in by_id}
    remaining_deps: dict[str, int] = {}
    for task_id, dlist in deps.items():
        remaining_deps[task_id] = len(dlist)
        for d in dlist:
            dependents[d].append(task_id)

    scheduled: set[str] = set()
    ready = sorted([t for t in by_id if remaining_deps[t] == 0], key=lambda t: (groups[t], seq_of[t]))
    waves: list[list[str]] = []

    while ready:
        batch = ready[:MAX_WAVE_SIZE]
        ready = ready[MAX_WAVE_SIZE:]
        waves.append(batch)
        newly_ready: list[str] = []
        for task_id in batch:
            scheduled.add(task_id)
            for dependent in dependents[task_id]:
                remaining_deps[dependent] -= 1
                if remaining_deps[dependent] == 0:
                    newly_ready.append(dependent)
        ready = sorted(ready + newly_ready, key=lambda t: (groups[t], seq_of[t]))

    if len(scheduled) != len(by_id):
        unscheduled = sorted(set(by_id) - scheduled)
        die(f"위상 배치가 끝났지만 스케줄되지 않은 Task가 남음(그래프 이상): {unscheduled}")

    # Single forward pass: separate Tasks that touch the same Expected File
    # within one Wave by pushing the later one into the next Wave.
    files_of = {r["task_id"]: extract_files(r["expected_files"]) for r in rows}
    conflict_moves = 0
    i = 0
    while i < len(waves):
        seen_files: dict[str, str] = {}
        kept: list[str] = []
        pushed: list[str] = []
        for task_id in waves[i]:
            conflict = next((f for f in files_of[task_id] if f in seen_files), None)
            if conflict is not None:
                pushed.append(task_id)
                conflict_moves += 1
            else:
                kept.append(task_id)
                for f in files_of[task_id]:
                    seen_files[f] = task_id
        waves[i] = kept
        if pushed:
            if i + 1 == len(waves):
                waves.append([])
            waves[i + 1] = pushed + waves[i + 1]
        i += 1
    waves = [w for w in waves if w]

    # Page Owner Tasks are listed last within their own Wave (display order only).
    for w in waves:
        w.sort(key=lambda t: (1 if by_id[t]["category"] == "PAGE_OWNER" else 0, seq_of[t]))

    wave_index_of: dict[str, int] = {}
    for idx, w in enumerate(waves):
        for task_id in w:
            wave_index_of[task_id] = idx

    violations = []
    for task_id, dlist in deps.items():
        for d in dlist:
            if wave_index_of[d] >= wave_index_of[task_id]:
                violations.append(f"{task_id}가 자신의 선행 Task {d}와 같거나 더 이른 Wave에 있음")
    if violations:
        die("Wave 배치가 Depends On 순서를 위반함:\n  - " + "\n  - ".join(violations))

    wave_ids = [f"W{idx+1:02d}" for idx in range(len(waves))]

    def dominant_group(task_ids: list[str]) -> int:
        counts: dict[int, int] = {}
        for t in task_ids:
            counts[groups[t]] = counts.get(groups[t], 0) + 1
        return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]

    wave_titles = [GROUP_TITLES[dominant_group(w)] for w in waves]
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
                "status": "pending",
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
    print(f"파일 충돌로 인해 다음 Wave로 이동된 Task 수: {conflict_moves}건")
    print(f"생성된 Wave 수: {len(waves)}")
    print()
    for wid, title, w, checkpoint in zip(wave_ids, wave_titles, waves, wave_checkpoints):
        marker = f" [Preview Checkpoint: {checkpoint}]" if checkpoint else ""
        print(f"  {wid} ({len(w)}개) — {title}{marker}")
        print(f"    {', '.join(w)}")
    print()
    print(f"출력: {TASK_DAG_PATH.relative_to(ROOT)}, {WAVE_PLAN_PATH.relative_to(ROOT)}, "
          f"{WAVE_STATE_PATH.relative_to(ROOT)}, {MANIFEST_PATH.relative_to(ROOT)}(wave_id 열 갱신)")
    print()
    print("BUILD_WAVES_PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
