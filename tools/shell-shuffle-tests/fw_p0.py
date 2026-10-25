#!/usr/bin/env python3
"""Fail watch for Shell Shuffle Part 0: each copy is written beside index.html as index-fw.html (it parses: checked),
the suite runs against it (SS_PAGE), and must go red on the named check. python3 -I tools/shell-shuffle-tests/fw_p0.py"""
import os, re, subprocess, sys
D = "/workspaces/lucid-winds/satellites/shell-shuffle"; SRC = open(D + "/index.html", encoding="utf-8").read()
LIVE = subprocess.run(["git", "-C", D, "show", "HEAD:satellites/shell-shuffle/index.html"], capture_output=True, text=True).stdout
M = [
 ("the live page (v1.0)", None, ["exclamation", "named by its place", "cream check", "in words", "Enter on a focused", "shows the build"]),
 ("no ring on the tapped cup", [("markCup(ballCup,'ok'); markCup(guess,'ring');", "markCup(ballCup,'ok');")], ["cream check"]),
 ("left and right swapped in the words", [("(s===0?'left':(s===n-1?'right':'middle'))", "(s===0?'right':(s===n-1?'left':'middle'))")], ["in words"]),
 ("the cups stay buttons after the guess", [("state.phase='reveal'; updatePause(); cupsAsButtons(false);", "state.phase='reveal'; updatePause();")], ["stop being buttons"]),
 ("no Enter on a cup", [("if(state.phase!=='guessing' || (e.key!=='Enter' && e.key!==' ')) return;", "return;")], ["Enter on a focused"]),
 ("Space ignored", [("if(state.phase!=='guessing' || (e.key!=='Enter' && e.key!==' ')) return;", "if(state.phase!=='guessing' || e.key!=='Enter') return;")], ["Space makes the guess"]),
 ("cup numbers off by one", [("return 'cup '+(s+1)+' of '+n; }", "return 'cup '+s+' of '+n; }")], ["Space makes the guess"]),
 ("the cups are buttons while they shuffle", [("    ballEl=document.createElement('div'); ballEl.className='ball'; decorateBall(ballEl, state.selected);",
   "    for(const k in wraps){ wraps[k].setAttribute('role','button'); wraps[k].tabIndex=0; }\n    ballEl=document.createElement('div'); ballEl.className='ball'; decorateBall(ballEl, state.selected);")], ["while the cups shuffle"]),
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
