#!/usr/bin/env python3
"""Fail watch for targets.mjs: each broken copy of the BUILT Tally (dist) must turn the gate red on its own check.
python3 -I tools/tally-tests/fw_targets.py <dist dir>   (serves each copy on 8779, one browser at a time)"""
import glob, os, shutil, subprocess, sys, time
DIST = sys.argv[1]
M = [
 ("eyebrow box clipped by .mv-main", "min-height: 48px; margin: -4px 0 -28px;", "min-height: 48px; margin: -16px 0;", "fresh", "412", "Open the world map"),
 ("install bar over the controls", ".mv-hasbar .mv-board { padding-bottom: 66px; }", ".mv-hasbar .mv-board { padding-bottom: 8px; }", "fresh", "412", "Undo"),
 ("header overflows at 360 (the narrow rule undone)", [(".mv-boost .mv-chip-x { display: none; }", ".mv-boost .mv-chip-x { display: inline; }"),
   (".mv-wallet { gap: 3px; }", ".mv-wallet { gap: 5px; }"), ("padding: 6px 6px; font-size: 12px; gap: 3px;", "padding: 6px 7px; font-size: 12px;")], None, "worst", "360", "outside the viewport"),
 ("preview close under the pal", "z-index: 2; background-color", "background-color", "fresh", "412", "Close pal preview"),
]
ok = True
for name, a, b, save, view, expect in [m for m in M if len(sys.argv) < 3 or sys.argv[2] in m[0]]:
    d = "/tmp/claude-1000/tally-mut"; shutil.rmtree(d, ignore_errors=True); shutil.copytree(DIST, d)
    js = glob.glob(d + "/assets/index-*.js"); assert len(js) == 1
    src = open(js[0], encoding="utf-8").read()
    for x, y in (a if isinstance(a, list) else [(a, b)]):
        assert src.count(x) == 1, (name, src.count(x)); src = src.replace(x, y)
    open(js[0], "w", encoding="utf-8").write(src)
    subprocess.run(["node", "--check", js[0]], check=True)          # the broken copy parses
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8779", "--bind", "127.0.0.1"], cwd=d, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        r = subprocess.run(["node", "/workspaces/lucid-winds/tools/tally-tests/targets.mjs", "http://127.0.0.1:8779/"], capture_output=True, text=True,
                           env={**os.environ, "SAVE": save, "VIEW": view}, timeout=300)
    finally:
        srv.terminate(); srv.wait()
    red = r.returncode != 0 and expect in r.stdout
    ok = ok and red
    print(("RED   " if red else "GREEN(!) ") + name + ("" if red else "\n" + r.stdout[-600:] + r.stderr[-600:]))
shutil.rmtree("/tmp/claude-1000/tally-mut", ignore_errors=True)
print("all broken copies red" if ok else "A BROKEN COPY PASSED"); sys.exit(0 if ok else 1)
