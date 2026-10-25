#!/usr/bin/env python3
"""Fail watch for Tally Part 4's smoke rows: each broken copy of src/Game.jsx (mutated in place, restored in finally) must turn its row red.
python3 -I tools/tally-tests/fw_p4.py   (runs npm run test:dom in /workspaces/Tally per copy)"""
import os, shutil, subprocess, sys
T = "/workspaces/Tally"; G = os.path.join(T, "src", "Game.jsx"); SRC = open(G, encoding="utf-8").read()
M = [
 ("a fresh save skips the guide", [("const fresh = !(m.earns && m.earns.first_solve) && (m.level || 1) === 1 && !m.guideDone;", "const fresh = false;")], "a fresh save gets the guide"),
 ("Skip does nothing", [("    setMeta((m) => ({ ...m, guideDone: true }));\n    setOverlay(null); setCampaign(genPuzzle(1001, levelOpts(1)));", "    return;")], "Skip ends the guide"),
]
ok = True
ONLY = os.environ.get('FW_ONLY', '')
for name, pairs, expect in M:
    if ONLY and ONLY not in name: continue
    s = SRC
    for a, b in pairs:
        assert s.count(a) == 1, (name, s.count(a)); s = s.replace(a, b)
    open(G, "w", encoding="utf-8").write(s)
    try:
        r = subprocess.run(["npm", "run", "test:dom"], cwd=T, capture_output=True, text=True, timeout=600)
    finally:
        open(G, "w", encoding="utf-8").write(SRC)
    fails = [l for l in r.stdout.splitlines() if l.startswith("FAIL")]
    red = any(expect in l for l in fails)
    ok = ok and red
    print(("RED   " if red else "GREEN(!) ") + name + "  [" + " | ".join(l[6:90] for l in fails) + "]" + ("" if fails else "  exit " + str(r.returncode) + " " + r.stderr[-300:].replace("\n", " ")))
assert open(G, encoding="utf-8").read() == SRC, "Game.jsx not restored"
print("every copy red on its row" if ok else "A COPY PASSED"); sys.exit(0 if ok else 1)
