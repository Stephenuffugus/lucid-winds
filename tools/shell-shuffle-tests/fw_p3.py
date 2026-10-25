#!/usr/bin/env python3
"""Fail watch for Shell Shuffle Part 3: each copy is written beside index.html as index-fw.html (it parses: checked), the suite runs
against it (SS_PAGE), and must go red on the named check. python3 -I tools/shell-shuffle-tests/fw_p3.py"""
import os, re, subprocess, sys
D = "/workspaces/lucid-winds/satellites/shell-shuffle"; SRC = open(D + "/index.html", encoding="utf-8").read()
M = [
 ("no hide handler", [("if(document.visibilityState==='hidden' && state.phase==='play' && !paused){", "if(false){")], ["a hide mid shuffle pauses where it is"]),
 ("the sound switch ignored", [("on(){ return !!(state.settings&&state.settings.sound!==false); },", "on(){ return true; },")], ["with sound off a round starts no audio node"]),
 ("the context made at load", [("document.addEventListener('pointerdown',_firstGesture,true); document.addEventListener('keydown',_firstGesture,true);", "SFX.ensure(); document.addEventListener('pointerdown',_firstGesture,true); document.addEventListener('keydown',_firstGesture,true);")], ["no audio context before a gesture"]),
]
ok = True
ONLY = os.environ.get('FW_ONLY', '')   # FW_ONLY=<substring of a name> runs one copy
for name, pairs, expect in M:
    if ONLY and ONLY not in name: continue
    s = SRC
    for a, b in pairs:
        assert s.count(a) == 1, (name, s.count(a)); s = s.replace(a, b)
    for m in re.finditer(r"<script(?![^>]*src)[^>]*>([\s\S]*?)</script>", s):   # the copy parses
        subprocess.run(["node", "-e", "new (require('vm').Script)(require('fs').readFileSync(0,'utf8'))"], input=m.group(1), text=True, check=True)
    open(D + "/index-fw.html", "w", encoding="utf-8").write(s)
    try:
        r = subprocess.run(["node", D + "/audit_check.mjs"], capture_output=True, text=True, env={**os.environ, "SS_PAGE": "index-fw.html"}, timeout=900)
    finally:
        os.remove(D + "/index-fw.html")
    fails = [l for l in r.stdout.splitlines() if l.strip().startswith("\u2717")]
    red = all(any(e in l for l in fails) for e in expect)
    ok = ok and red
    print(("RED   " if red else "GREEN(!) ") + name + "  [" + " | ".join(l.strip()[2:90] for l in fails) + "]")
print("every copy red on its check" if ok else "A COPY PASSED"); sys.exit(0 if ok else 1)
