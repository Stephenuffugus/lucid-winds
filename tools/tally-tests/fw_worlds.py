#!/usr/bin/env python3
"""Fail watch for worlds.mjs (Tally Part 2): each broken copy of the BUILT Tally (dist) must turn its check red.
python3 -I tools/tally-tests/fw_worlds.py <dist dir>   (serves each copy on 8779, one browser at a time)"""
import glob, os, shutil, subprocess, sys, time
DIST = sys.argv[1]
M = [
 ("the scrim removed (the plate bare under the text)", [('"color-mix(in srgb, var(--bg) "+(', '"transparent"||(')]   # the minified form: the scrim becomes transparent, "contrast", "space"),
 ("the map buttons 40 px", [(".mv-lvl { position: absolute; width: 56px; height: 56px;", ".mv-lvl { position: absolute; width: 40px; height: 40px;")], "map", "48 or more"),
]
ok = True
for name, pairs, only, expect in M:
    d = "/tmp/claude-1000/tally-mut"; shutil.rmtree(d, ignore_errors=True); shutil.copytree(DIST, d)
    js = glob.glob(d + "/assets/index-*.js"); assert len(js) == 1
    s = open(js[0], encoding="utf-8").read()
    for a, b in pairs:
        if s.count(a) != 1:   # the minifier may rename around the literal: report rather than guess
            print("SKIP " + name + ": pattern not found once (" + str(s.count(a)) + ")"); ok = False; break
        s = s.replace(a, b)
    else:
        open(js[0], "w", encoding="utf-8").write(s)
        subprocess.run(["node", "--check", js[0]], check=True)
        srv = subprocess.Popen([sys.executable, "-m", "http.server", "8779", "--bind", "127.0.0.1"], cwd=d, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1)
        try:
            r = subprocess.run(["node", "/workspaces/lucid-winds/tools/tally-tests/worlds.mjs", "http://127.0.0.1:8779/", "-"], capture_output=True, text=True, env={**os.environ, "ONLY": only}, timeout=600)
        finally:
            srv.terminate(); srv.wait()
        tail = r.stdout.split("FAIL", 1)[-1] if "FAIL" in r.stdout else ""
        red = r.returncode != 0 and expect in tail
        ok = ok and red
        print(("RED   " if red else "GREEN(!) ") + name + ("" if red else "\n" + r.stdout[-400:] + r.stderr[-300:]))
shutil.rmtree("/tmp/claude-1000/tally-mut", ignore_errors=True)
print("all broken copies red" if ok else "A BROKEN COPY PASSED"); sys.exit(0 if ok else 1)
