#!/usr/bin/env python3
"""Fail watch for Shell Shuffle Part 1: each copy is written beside index.html as index-fw.html (it parses: checked),
the suite runs against it (SS_PAGE), and must go red on the named check. python3 -I tools/shell-shuffle-tests/fw_p1.py"""
import os, re, subprocess, sys
D = "/workspaces/lucid-winds/satellites/shell-shuffle"; SRC = open(D + "/index.html", encoding="utf-8").read()
LIVE = subprocess.run(["git", "-C", D, "show", "HEAD:satellites/shell-shuffle/index.html"], capture_output=True, text=True).stdout
M = [
 ("the live page (v1.1)", None, ["painted plate", "painted feet", "100 to 110", "house cup", "left the page"]),
 ("the cups at the plate's far edge", [("const want=0.70*window.innerHeight,", "const want=0.55*window.innerHeight,")], ["painted feet"]),
 ("the plate without its build stamp", [("const artUrl = rel => 'art/s1/'+rel+'?v='+BUILD;", "const artUrl = rel => 'art/s1/'+rel;")], ["painted plate"]),
 ("six cups at 46 px", [("w = Math.max(48, Math.min(110, w));", "w = Math.max(46, Math.min(110, w));"), ("const gap = count>4 ? 6 : 14, side = 6;", "const gap = count>4 ? 8 : 14, side = 6;")], ["six cups at 360"]),
 ("a fresh save on Sunset", [("    coins:0, owned:['classic'], selected:'classic', selectedCup:'house',\n    ownedCups:", "    coins:0, owned:['classic'], selected:'classic', selectedCup:'sunset',\n    ownedCups:"),
   ("      coins:0, owned:['classic'], selected:'classic', selectedCup:'house',\n      ownedCups:", "      coins:0, owned:['classic'], selected:'classic', selectedCup:'sunset',\n      ownedCups:")], ["house cup"]),
 ("cups capped at 94 px", [("w = Math.max(48, Math.min(110, w));", "w = Math.max(48, Math.min(94, w));")], ["100 to 110"]),
]
ok = True
for name, pairs, expect in M:
    s = LIVE if pairs is None else SRC
    for a, b in (pairs or []):
        assert s.count(a) == 1, (name, s.count(a)); s = s.replace(a, b)
    for m in re.finditer(r"<script(?![^>]*src)[^>]*>([\s\S]*?)</script>", s):   # the copy parses
        subprocess.run(["node", "-e", "new (require('vm').Script)(require('fs').readFileSync(0,'utf8'))"], input=m.group(1), text=True, check=True)
    open(D + "/index-fw.html", "w", encoding="utf-8").write(s)
    try:
        r = subprocess.run(["node", D + "/audit_check.mjs"], capture_output=True, text=True, env={**os.environ, "SS_PAGE": "index-fw.html"}, timeout=500)
    finally:
        os.remove(D + "/index-fw.html")
    fails = [l for l in r.stdout.splitlines() if l.strip().startswith("✗")]
    red = all(any(e in l for l in fails) for e in expect)
    ok = ok and red
    print(("RED   " if red else "GREEN(!) ") + name + "  [" + " | ".join(l.strip()[2:70] for l in fails) + "]")
print("every copy red on its check" if ok else "A COPY PASSED"); sys.exit(0 if ok else 1)
