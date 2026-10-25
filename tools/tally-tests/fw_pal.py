#!/usr/bin/env python3
"""Fail watch for pal.mjs: each broken copy of the BUILT Tally must turn its check red.
python3 -I tools/tally-tests/fw_pal.py <dist dir> <astra extract dir>   (serves each copy on 8779, one browser at a time)
  feet : the frames keep her whole canvas (the feet 10 percent above the box bottom: the rabbit float)
  box  : the img sizes itself per frame and one frame is cut to its own bounds
  bytes: the play screen pulls the 1.9 MB card art"""
import glob, os, shutil, subprocess, sys, time
from PIL import Image
DIST, SRC = sys.argv[1], sys.argv[2]
def bundle(d): js = glob.glob(d + "/assets/index-*.js"); assert len(js) == 1; return js[0]
def edit_js(d, pairs):
    p = bundle(d); s = open(p, encoding="utf-8").read()
    for a, b in pairs: assert s.count(a) == 1, (a[:60], s.count(a)); s = s.replace(a, b)
    open(p, "w", encoding="utf-8").write(s)
def feet(d):
    import json; art = json.load(open(d + "/art/t1/art.json"))["pals"]["pip"]
    for f in art["frames"]:
        Image.open(f"{SRC}/pals/pip_fox/{f}.png").convert("RGBA").resize((art["w"], art["h"]), Image.LANCZOS).save(f"{d}/art/t1/pals/pip/{f}.webp", "WEBP", quality=85)
def box(d):
    edit_js(d, [(".mv-pal-img { position: absolute; left: 0; bottom: 0; width: 100%; height: 100%;", ".mv-pal-img { position: static; width: auto; height: auto;"),
                (".mv-pal-box { position: relative; height: calc(var(--palh) * var(--ph)); width: calc(var(--palh) * var(--pw)); }", ".mv-pal-box { position: relative; }")])
    im = Image.open(f"{SRC}/pals/pip_fox/cheer_02.png").convert("RGBA"); bb = im.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
    c = im.crop(bb); c.resize((c.width // 2, c.height // 2)).save(f"{d}/art/t1/pals/pip/cheer_02.webp", "WEBP", quality=85)
def bytes_(d):
    edit_js(d, [(".mv-pal-box { position: relative;", ".mv-pal-box { background: url(./thumbnail.png) 0 0 / 1px 1px no-repeat; position: relative;")])
M = [("feet", feet, "the painted feet stand on the box"), ("box", box, "one box at every swap"), ("bytes", bytes_, "fresh load requests")]
ok = True
for name, mut, expect in M:
    d = "/tmp/claude-1000/tally-mut"; shutil.rmtree(d, ignore_errors=True); shutil.copytree(DIST, d)
    mut(d); subprocess.run(["node", "--check", bundle(d)], check=True)
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8779", "--bind", "127.0.0.1"], cwd=d, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        r = subprocess.run(["node", "/workspaces/lucid-winds/tools/tally-tests/pal.mjs", "http://127.0.0.1:8779/", "-", name], capture_output=True, text=True, timeout=300)
    finally:
        srv.terminate(); srv.wait()
    red = r.returncode != 0 and expect in r.stdout.split("FAIL", 1)[-1]
    ok = ok and red
    print(("RED   " if red else "GREEN(!) ") + name + ("" if red else "\n" + r.stdout[-500:] + r.stderr[-300:]))
shutil.rmtree("/tmp/claude-1000/tally-mut", ignore_errors=True)
print("all broken copies red" if ok else "A BROKEN COPY PASSED"); sys.exit(0 if ok else 1)
