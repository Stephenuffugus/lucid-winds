#!/usr/bin/env python3
"""Fail watch for Tally Part 3's smoke rows: each broken copy of src/Game.jsx (mutated in place, restored in finally) must turn its row red.
python3 -I tools/tally-tests/fw_p3.py   (runs npm run test:dom in /workspaces/Tally per copy)"""
import os, shutil, subprocess, sys
T = "/workspaces/Tally"; G = os.path.join(T, "src", "Game.jsx"); SRC = open(G, encoding="utf-8").read()
M = [
 ("the midnight check removed", [("if (k !== dailyKeyRef.current) {", "if (false) {")], "the daily regenerates when the day changes"),
 ("confetti on a daily replay", [("const confetti = !still && !replay;", "const confetti = !still;")], "a daily replay says so and brings no confetti"),
 ("the splash plate never removed", [('el.classList.add("out"); const t = setTimeout(() => el.remove(), 320);', 'const t = setTimeout(() => {}, 320);')], "the splash plate is removed after mount"),
]
ok = True
for name, pairs, expect in M:
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
    print(("RED   " if red else "GREEN(!) ") + name + "  [" + " | ".join(l[6:90] for l in fails) + "]")
assert open(G, encoding="utf-8").read() == SRC, "Game.jsx not restored"
print("every copy red on its row" if ok else "A COPY PASSED"); sys.exit(0 if ok else 1)
