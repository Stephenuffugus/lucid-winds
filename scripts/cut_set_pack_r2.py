#!/usr/bin/env python3
"""Cut Astra's Three Sisters round-two return (Three_Sisters_Premium_Cards_Round_2.zip, 25 Oct 2026) into the WebP set the
standalone game loads beside the first pack: assets/games/set/t2/. Run: python3 -P scripts/cut_set_pack_r2.py <extracted pack dir> [out dir]
Additive by her rule: t1 is never touched. The 27 painted botanical glyphs keep their whole 400 canvas at 200 px (same
baseline as t1, 368 not 376: no runtime offset). Four faces and their selected twins at 300x420, the medallion seals at 64
and 128, the open tin, the found glow, the morning and rain tables at 540x960 with their lamp glows. The woodcut corn is a
review sample only and is not cut (never a deck). Writes art.json (every file with its size)."""
import json, os, sys
from PIL import Image
SRC = sys.argv[1]; OUT = sys.argv[2] if len(sys.argv) > 2 else "assets/games/set/t2"
man = json.load(open(os.path.join(SRC, "manifest.json")))
art = {"version": "t2", "pack_id": man.get("pack_id"), "date": man.get("date"), "install_mode": man.get("install_mode"), "variant": "painted_botanical_v2", "files": {}}
def save(im, rel, q=85, alpha=True):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    if alpha and im.mode == "RGBA": im.save(p, "WEBP", quality=q, method=6, alpha_quality=92)
    else: im.convert("RGB").save(p, "WEBP", quality=q, method=6)
    art["files"][rel] = os.path.getsize(p); return rel
def src(*p): return os.path.join(SRC, *p)
def rs(im, w, h=None): return im.resize((w, h if h else round(im.height * w / im.width)), Image.LANCZOS)
SHAPES, COLOURS, FILLS = ["corn", "bean", "squash"], ["gold", "blue", "rose"], ["solid", "striped", "empty"]
bad = []
for sh in SHAPES:
    for co in COLOURS:
        for fi in FILLS:
            n = f"{sh}_{co}_{fi}"; im = Image.open(src("glyphs", "painted_botanical_v2", n + ".png")).convert("RGBA")
            if im.size != (400, 400): bad.append(n + " size " + str(im.size))
            bb = im.getchannel("A").point(lambda a: 255 if a > 16 else 0).getbbox()
            if not bb or bb[0] < 32 or bb[1] < 32 or bb[2] > 368 or bb[3] > 368: bad.append(n + " bounds " + str(bb))
            save(rs(im, 200, 200), f"glyphs/painted/{n}.webp")
save(rs(Image.open(src("glyphs", "painted_botanical_v2", "fill_key.png")).convert("RGBA"), 600), "glyphs/painted/fill_key.webp")
for f in "abcd":
    for n in ("card_face", "card_selected"):
        im = Image.open(src("cards", "seed_catalogue", f"{n}_{f}.png")).convert("RGBA")
        if im.size != (600, 840): bad.append(f"{n}_{f} size {im.size}")
        save(rs(im, 300, 420), f"cards/{n}_{f}.webp")
for co in COLOURS:
    for px in (64, 128):
        im = Image.open(src("ui", "seals", f"seal_{co}_{px}.png")).convert("RGBA")
        if im.size != (px, px): bad.append(f"seal_{co}_{px} size {im.size}")
        save(im, f"ui/seals/seal_{co}_{px}.webp")
save(rs(Image.open(src("ui", "found_glow.png")).convert("RGBA"), 300, 420), "ui/found_glow.webp")
save(rs(Image.open(src("ui", "deck_tin_open.png")).convert("RGBA"), 150, 200), "ui/deck_tin_open.webp")
for n in ("table_morning", "table_rain"):
    im = Image.open(src("table", "seed_catalogue", n + ".jpg")).convert("RGB")
    if im.size != (900, 1600): bad.append(n + " size " + str(im.size))
    save(rs(im, 540, 960), f"table/{n}.webp", q=80, alpha=False)
for n in ("lamp_glow_morning", "lamp_glow_rain"):
    save(rs(Image.open(src("table", "seed_catalogue", n + ".png")).convert("RGBA"), 450, 450), f"table/{n}.webp")
with open(os.path.join(OUT, "art.json"), "w") as fh: json.dump(art, fh, indent=1)
total = sum(art["files"].values()); boot = sum(v for k, v in art["files"].items() if k.startswith("glyphs/painted/") and "fill_key" not in k) + art["files"]["cards/card_face_a.webp"] * 4 + art["files"]["ui/seals/seal_gold_64.webp"] * 3
for k in ("cards/card_face_a.webp", "cards/card_selected_a.webp", "table/table_morning.webp", "glyphs/painted/corn_gold_solid.webp", "ui/seals/seal_gold_64.webp", "ui/found_glow.webp"): print("%7.1f KB  %s" % (art["files"][k] / 1024, k))
print("files %d, boot set %.0f KB (27 painted glyphs, four faces, three seals), all %.0f KB" % (len(art["files"]), boot / 1024, total / 1024))
for b in bad: print("CHECK:", b)
print("FAIL: boot set over 900 KB" if boot > 900 * 1024 else ("FAIL: source checks" if bad else "PASS"))
