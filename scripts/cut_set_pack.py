#!/usr/bin/env python3
"""Cut Astra's Three Sisters return (vault-20261025-three-sisters-astra) into the WebP set the standalone game loads:
assets/games/set/t1/. Run: python3 -I scripts/cut_set_pack.py <extracted pack dir> [out dir]
Her originals are never touched. Glyphs keep their whole 400 canvas (the manifest's occupied bounds are shared, so every
glyph sits on the same baseline) at 200 px; the three display variants ship side by side (botanical, clear, mono).
Opaque plates as WebP q80, alpha pieces q85. Writes art.json (every file with its size, the theme block from her manifest)."""
import json, os, sys
from PIL import Image
SRC = sys.argv[1]; OUT = sys.argv[2] if len(sys.argv) > 2 else "assets/games/set/t1"
man = json.load(open(os.path.join(SRC, "manifest.json")))
art = {"version": "t1", "theme": man["themes"][0], "seals": man.get("colour_seals"), "files": {}}
def save(im, rel, q=85, alpha=True):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    if alpha and im.mode == "RGBA": im.save(p, "WEBP", quality=q, method=6, alpha_quality=92)
    else: im.convert("RGB").save(p, "WEBP", quality=q, method=6)
    art["files"][rel] = os.path.getsize(p); return rel
def src(*p): return os.path.join(SRC, *p)
def rs(im, w, h=None): return im.resize((w, h if h else round(im.height * w / im.width)), Image.LANCZOS)
SHAPES, COLOURS, FILLS = ["corn", "bean", "squash"], ["gold", "blue", "rose"], ["solid", "striped", "empty"]
for variant, folder in (("botanical", "seed_catalogue"), ("clear", "seed_catalogue_clear"), ("mono", "seed_catalogue_mono")):
    for sh in SHAPES:
        for co in COLOURS:
            for fi in FILLS:
                n = f"{sh}_{co}_{fi}"
                save(rs(Image.open(src("glyphs", folder, n + ".png")).convert("RGBA"), 200, 200), f"glyphs/{variant}/{n}.webp")
save(rs(Image.open(src("glyphs", "seed_catalogue", "fill_key.png")).convert("RGBA"), 600), "glyphs/fill_key.webp")
for n, w, h in (("card_face", 300, 420), ("card_selected", 300, 420), ("card_back", 300, 420), ("card_edge", 300, 20), ("card_shadow", 360, 480)):
    save(rs(Image.open(src("cards", "seed_catalogue", n + ".png")).convert("RGBA"), w, h), f"cards/{n}.webp")
save(rs(Image.open(src("table", "seed_catalogue", "table_main.jpg")).convert("RGB"), 540, 960), "table/table_main.webp", q=80, alpha=False)
save(rs(Image.open(src("table", "seed_catalogue", "table_main.jpg")).convert("RGB"), 900, 1600), "table/table_main_900.webp", q=80, alpha=False)
save(rs(Image.open(src("table", "seed_catalogue", "mat.png")).convert("RGBA"), 420, 120), "table/mat.webp")
save(rs(Image.open(src("table", "seed_catalogue", "deck_pile.png")).convert("RGBA"), 150, 200), "table/deck_pile.webp")
save(rs(Image.open(src("table", "seed_catalogue", "found_pile.png")).convert("RGBA"), 150, 200), "table/found_pile.webp")
save(rs(Image.open(src("table", "seed_catalogue", "lamp_glow.png")).convert("RGBA"), 450, 450), "table/lamp_glow.webp")
for n, w, h in (("logo", 600, 250), ("button_pill", 300, 80), ("button_pill_quiet", 300, 80), ("results_card", 450, 550), ("seal_gold", 64, 64), ("seal_blue", 64, 64), ("seal_rose", 64, 64),
                ("check", 64, 64), ("focus", 64, 64), ("hint_lens", 64, 64), ("share_leaf", 64, 64), ("mode_classic", 128, 128), ("mode_daily", 128, 128)):
    save(rs(Image.open(src("ui", n + ".png")).convert("RGBA"), w, h), f"ui/{n}.webp")
for n, cnt, side in (("trio_found", 6, 256), ("wrong", 3, 256), ("deal", 4, 256), ("daily_done", 6, 450)):
    for i in range(1, cnt + 1):
        save(rs(Image.open(src("fx", f"{n}_{i:02d}.png")).convert("RGBA"), side, side), f"fx/{n}_{i:02d}.webp")
for n in ("same_shapes_different_colours", "all_three_different", "one_that_is_wrong"):
    save(rs(Image.open(src("tutorial", n + ".png")).convert("RGBA"), 450, 300), f"tutorial/{n}.webp")
art["tutorial"] = json.load(open(src("tutorial", "examples.json")))
with open(os.path.join(OUT, "art.json"), "w") as fh: json.dump(art, fh, indent=1)
boot = ["table/table_main.webp", "table/mat.webp", "cards/card_face.webp", "ui/seal_gold.webp", "ui/logo.webp"] + [f"glyphs/botanical/{s}_{c}_{f}.webp" for s in SHAPES for c in COLOURS for f in FILLS]
bt = sum(art["files"][k] for k in boot); total = sum(art["files"].values())
for k in ("cards/card_face.webp", "table/table_main.webp", "ui/results_card.webp", "glyphs/botanical/corn_gold_solid.webp"): print("%7.1f KB  %s" % (art["files"][k] / 1024, k))
print("files %d, boot set %.0f KB (the plate, the mat, a face, a seal, the logo, the 27 botanical glyphs), all %.0f KB" % (len(art["files"]), bt / 1024, total / 1024))
print("FAIL: boot set over 900 KB" if bt > 900 * 1024 else "PASS")
