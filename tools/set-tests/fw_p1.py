#!/usr/bin/env python3
"""Fail watch for Three Sisters Part 1: each copy of games/_inline/set.js is written beside it as set-fw.js (it parses: checked), the
page is pointed at it (play/set-fw.html, a copy of play/set.html with the script swapped), the gate runs, and must go red on the
named row. python3 -I tools/set-tests/fw_p1.py   (repo root served on 8777 by this script)"""
import os, re, subprocess, sys, time
R = "/workspaces/lucid-winds"; SRC = open(R + "/games/_inline/set.js", encoding="utf-8").read(); PAGE = open(R + "/play/set.html", encoding="utf-8").read()
M = [
 ("a found trio never counts", [("        found++; table.querySelector('#ts-found').textContent = found; _e('pheno'); SFX.trio();", "        _e('pheno'); SFX.trio();")], "a real trio counts and the board refills"),
 ("a wrong trio is not explained", [("        say('Check ' + bad.join(' and ') + ': two match and one differs.', true);", "        say('Not quite.', true);")], "a wrong trio is explained and kept"),
 ("settings are never saved", [("  function saveSettings(){ try{ localStorage.setItem(SET_KEY, JSON.stringify(SET)); }catch(e){} }", "  function saveSettings(){ }")], "settings survive a reload"),
 ("the frames play under reduced motion", [("      if (motionOff()) return; var img = document.createElement('img'); img.className = 'ts-fx';", "      var img = document.createElement('img'); img.className = 'ts-fx';")], "under reduced motion a trio counts with no frames"),
]
ok = True
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8777", "--bind", "127.0.0.1"], cwd=R, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.5)
try:
    for name, pairs, expect in M:
        s = SRC
        for a, b in pairs:
            assert s.count(a) == 1, (name, s.count(a)); s = s.replace(a, b)
        subprocess.run(["node", "-e", "new (require('vm').Script)(require('fs').readFileSync(0,'utf8'))"], input=s, text=True, check=True)
        open(R + "/games/_inline/set-fw.js", "w", encoding="utf-8").write(s)
        open(R + "/play/set-fw.html", "w", encoding="utf-8").write(PAGE.replace("/games/_inline/set.js?v=", "/games/_inline/set-fw.js?v="))
        try:
            r = subprocess.run(["node", R + "/tools/set-tests/audit.mjs", "-"], capture_output=True, text=True, env={**os.environ, "TS_PAGE": "set-fw.html"}, timeout=600)
        finally:
            for f in ("/games/_inline/set-fw.js", "/play/set-fw.html"):
                if os.path.exists(R + f): os.remove(R + f)
        fails = [l for l in r.stdout.splitlines() if l.strip().startswith("✗")]
        red = any(expect in l for l in fails); ok = ok and red
        print(("RED   " if red else "GREEN(!) ") + name + "  [" + " | ".join(l.strip()[2:80] for l in fails) + "]" + ("" if fails else " exit " + str(r.returncode) + " " + r.stderr[-200:].replace("\n", " ")))
finally:
    srv.terminate(); srv.wait()
print("every copy red on its row" if ok else "A COPY PASSED"); sys.exit(0 if ok else 1)
