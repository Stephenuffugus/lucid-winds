#!/usr/bin/env python3
"""Fail watch for Shell Shuffle Part 2: each copy is written beside index.html as index-fw.html (it parses: checked), the suite runs
against it (SS_PAGE), and must go red on the named check. python3 -I tools/shell-shuffle-tests/fw_p2.py"""
import os, re, subprocess, sys
D = "/workspaces/lucid-winds/satellites/shell-shuffle"; SRC = open(D + "/index.html", encoding="utf-8").read()
M = [
 ("the results path pays coins", [("$('results').classList.add('open'); $('rAgain').focus();", "state.coins+=5; save(); $('results').classList.add('open'); $('rAgain').focus();")], ["the sheet pays nothing"]),
 ("the frames ignore reduced motion", [("function motionOff(){ try{ return pf.classList.contains('no-anim') ||", "function motionOff(){ return false; } function motionOffUnused(){ try{ return pf.classList.contains('no-anim') ||")], ["no frames under reduced motion"]),   # the gate gone for good (a first try left the media query behind an || and the copy stayed green)
 ("Play again restarts at the same level", [("$('rAgain').onclick=()=>{ closeResults(); startAt(back); };", "$('rAgain').onclick=()=>{ closeResults(); startAt(back+1); };")], ["Play again starts one level lower"]),
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
