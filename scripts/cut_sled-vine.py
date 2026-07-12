#!/usr/bin/env python3
"""Cut the Sled Vine "Moonlit Inkwash" art pack into named game assets.

Reuses the Nova Bloom / Dew Snip magenta-KEY-distance pipeline verbatim
(sample flat #FF00FF key from a corner, mask by colour DISTANCE not hue so the
neon glows survive, despill, connected-component keep, alpha trim). Modes:
  - "cut"  : magenta knockout grid cell -> alpha-trimmed transparent PNG.
  - "full" : knockout to transparent but KEEP full cell bounds (radial FX /
             round glows that must stay centred).
  - bgfile : full-bleed portrait PNG -> <=1600 long edge opaque JPG <150KB.

Sheet -> role verified BY EYE against art-asset-lists/sled-vine/*.md (aspect +
content), NOT by filename:
  sheet1 = 01 sleds (4x3)          sheet2 = 02 trail/gates (4x4)
  sheet3 = 03 bg PLAY  (portrait)  sheet4 = 03 bg TITLE (portrait)
  sheet 5 = 03 bg TRIALS(portrait) sheet6 = 03 bg GROVE (portrait)
  sheet7 = 04 ui (4x4)             sheet8 = 05 fx (4x3)

Outputs stage into satellites/sled-vine/assets/{sleds,trail,ui,fx,backgrounds}/.

Usage:
  python3 scripts/cut_sled-vine.py [SRC_DIR] [OUT_DIR] [only]
    only one of: sleds trail ui fx bg  (default: all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/c1cd2839-a799-47c5-954b-ca2fed064633/scratchpad/sled-raw/Sled Vine"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/sled-vine/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p

def c(path, edge, mode="cut"): return (path, edge, mode)

SHEETS = {
 # Sheet 01 — Sled skins + ride states + crash + perch + ink caps. 4x3, 12 cells.
 "sleds": ("sheet1.png", 4, 3, [
    c("sleds/sled_seed",512),        c("sleds/sled_seed_ride",512),      c("sleds/sled_leafboard",512),      c("sleds/sled_leafboard_ride",512),
    c("sleds/sled_acorn",512),       c("sleds/sled_acorn_ride",512),     c("sleds/sled_dragonfly",512),      c("sleds/sled_dragonfly_ride",512),
    c("sleds/sled_crash_puff",480,"full"), c("sleds/sled_spawn_perch",480), c("trail/trail_ink_cap",256,"full"), c("trail/trail_ink_cap_gold",256,"full"),
 ]),
 # Sheet 02 — Trail strokes / leaves / gates idle+lit / goal flower / thorns / branch. 4x4, 16 cells.
 "trail": ("sheet2.png", 4, 4, [
    c("trail/ink_stroke_plain",512),  c("trail/ink_stroke_vine",512),   c("trail/ink_stroke_gold",512),   c("trail/trail_leaf_small",256),
    c("trail/trail_leaf_pair",256),   c("trail/gate_ring_idle",440,"full"),  c("trail/gate_ring_lit",440,"full"),  c("trail/gate_diamond_idle",440,"full"),
    c("trail/gate_diamond_lit",440,"full"), c("trail/gate_star_idle",440,"full"), c("trail/gate_star_lit",440,"full"), c("trail/goal_flower_wait",420),
    c("trail/goal_flower_ready",440), c("trail/thorn_strip",512),       c("trail/thorn_cluster",360),     c("trail/terrain_branch",512),
 ]),
 # Sheet 04 — UI plates, glyphs, ink meter, cards. 4x4, 16 cells.
 "ui": ("sheet7.png", 4, 4, [
    c("ui/btn_plate",512),        c("ui/btn_plate_primary",512),  c("ui/chip_frame",420),      c("ui/chip_frame_selected",420),
    c("ui/glyph_draw",256),       c("ui/glyph_erase",256),        c("ui/glyph_clear",256),     c("ui/glyph_ride",256),
    c("ui/glyph_stop",256),       c("ui/glyph_retry",256),        c("ui/glyph_home",256),      c("ui/inkmeter_frame",512),
    c("ui/inkmeter_fill",512),    c("ui/lvlcard_frame",420),      c("ui/lvlcard_done",320),    c("ui/goalchip_pill",512),
 ]),
 # Sheet 05 — FX bursts / bloom wave / crash / keepsakes / laurel / flame. 4x3, 12 cells.
 "fx": ("sheet8.png", 4, 3, [
    c("fx/fx_gate_burst",480,"full"), c("fx/fx_gate_mote",256,"full"), c("fx/fx_crash_splash",480,"full"), c("fx/fx_bloom_wave",512),
    c("fx/fx_leaf_flutter",360),      c("fx/fx_speed_lines",480),      c("fx/fx_dust_ring",420,"full"),    c("fx/keepsake_petal_set",480),
    c("fx/keepsake_core",360),        c("fx/keepsake_stem",360),       c("fx/fx_daily_laurel",420),        c("fx/fx_streak_flame",300,"full"),
 ]),
}

# ---- individual full-bleed backdrops: (relpath, src_file, maxedge) ------------
BGFILES = [
 ("backgrounds/bg_play",   "sheet3.png",  1600),  # PLAY   backdrop (quiet centre)
 ("backgrounds/bg_title",  "sheet4.png",  1600),  # TITLE  hero (diagonal stroke)
 ("backgrounds/bg_trials", "sheet 5.png", 1600),  # TRIALS select (margin dashes)
 ("backgrounds/bg_grove",  "sheet6.png",  1600),  # GROVE / wardrobe (pressed shelf)
]

# ---- magenta key machinery (ported verbatim) ---------------------------------
def sample_key(a):
    H,W = a.shape[:2]; s=10
    cands=[a[0:s,0:s], a[0:s,W-s:W], a[H-s:H,0:s], a[H-s:H,W-s:W]]
    best=None
    for cc in cands:
        m = cc.reshape(-1,3).astype(float).mean(0)
        if m[0]>150 and m[2]>150 and m[1]<90:
            if best is None or m[1] < best[1]: best=m
    return best

def magenta_mask(a, key=None):
    R,G,B = a[:,:,0].astype(np.float32), a[:,:,1].astype(np.float32), a[:,:,2].astype(np.float32)
    if key is not None:
        d = np.sqrt((R-key[0])**2 + (G-key[1])**2 + (B-key[2])**2)
        return d < 100.0
    hue = (R > G+24) & (B > G+24)
    return hue & (np.minimum(R,B) > 150) & (G < 85)

def despill(a):
    Rf,Gf,Bf = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    lean = ((Rf+Bf)//2 - Gf) > 30
    Rf2 = np.where(lean, np.minimum(Rf, Gf+40), Rf)
    Bf2 = np.where(lean, np.minimum(Bf, Gf+40), Bf)
    return np.dstack([Rf2, Gf, Bf2]).astype(np.uint8)

def fit(im, maxedge):
    w,h = im.size; m = max(w,h)
    if m > maxedge:
        r = maxedge/m; im = im.resize((max(1,int(w*r)), max(1,int(h*r))), Image.LANCZOS)
    return im

def save_png(im, path, maxedge):
    p = P(path+".png"); e = maxedge
    for _ in range(6):
        fit(im, e).save(p, optimize=True)
        if os.path.getsize(p) <= 150*1024 or e < 90: break
        e = int(e*0.82)
    return p

def save_jpg(im, path, maxedge):
    base = im.convert("RGB"); p = P(path+".jpg"); e = maxedge
    for _ in range(7):
        cur = fit(base, e); q = 86; cur.save(p, quality=q)
        while os.path.getsize(p) > 150*1024 and q > 46:
            q -= 6; cur.save(p, quality=q)
        if os.path.getsize(p) <= 150*1024 or e < 700: break
        e = int(e*0.85)
    return p, q

def cut_cell(cell, path, maxedge, key, keep_full=False):
    ch,cw = cell.shape[:2]
    fg = ~magenta_mask(cell, key)
    fg = ndi.binary_opening(fg, iterations=1)
    fg = ndi.binary_erosion(fg, iterations=1)
    fg = ndi.binary_closing(fg, iterations=2)
    lbl,n = ndi.label(fg)
    if n==0: print("   EMPTY",path); return None
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1,n+1))
    biggest = sizes.max()
    keep = np.zeros_like(fg)
    for i in range(1,n+1):
        if sizes[i-1] >= max(40, biggest*0.02): keep |= (lbl==i)
    if not keep.any(): print("   NOISE",path); return None
    m = ndi.binary_dilation(keep, iterations=1)
    if keep_full:
        y0,y1,x0,x1 = 0,ch,0,cw
    else:
        ys,xs = np.where(m)
        y0,y1,x0,x1 = ys.min(),ys.max()+1,xs.min(),xs.max()+1
        pad=4
        y0,x0 = max(0,y0-pad),max(0,x0-pad); y1,x1=min(ch,y1+pad),min(cw,x1+pad)
    rgb = despill(cell)[y0:y1,x0:x1]
    alpha = ndi.gaussian_filter((m[y0:y1,x0:x1].astype(np.uint8))*255, 0.6)
    out = np.dstack([rgb,alpha]).astype(np.uint8)
    save_png(Image.fromarray(out,"RGBA"), path, maxedge)
    return (x1-x0, y1-y0)

def process_sheet(key_name):
    src_file, cols, rows, cells = SHEETS[key_name]
    fp = os.path.join(SRC, src_file)
    if not os.path.exists(fp):
        print("!! MISSING", fp, "-- skip"); return
    im = Image.open(fp).convert("RGB")
    a = np.asarray(im); H,W = a.shape[:2]
    key = sample_key(a)
    cw,chh = W/cols, H/rows
    ok=0
    for idx,spec in enumerate(cells):
        if spec is None: continue
        path,maxedge,mode = (spec[0], spec[1], (spec[2] if len(spec)>2 else "cut"))
        rr,cc = idx//cols, idx%cols
        y0,y1 = int(round(rr*chh)), int(round((rr+1)*chh))
        x0,x1 = int(round(cc*cw)),  int(round((cc+1)*cw))
        cell = a[y0:y1, x0:x1]
        r = cut_cell(cell, path, maxedge, key, keep_full=(mode=="full"))
        if r: print("  %-34s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s (%s): %d/%d assets"%(key_name, src_file, ok, len([x for x in cells if x])))

def process_bg():
    ok=0
    for relpath, src_file, maxedge in BGFILES:
        fp = os.path.join(SRC, src_file)
        if not os.path.exists(fp): print("!! MISSING", fp, "-- skip"); continue
        im = Image.open(fp).convert("RGB")
        _,q = save_jpg(im, relpath, maxedge)
        print("  %-30s bg src %dx%d q%d"%(relpath, im.size[0], im.size[1], q)); ok+=1
    print("bg: %d/%d files"%(ok, len(BGFILES)))

todo = ["sleds","trail","ui","fx","bg"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_bg()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown target", s)
print("DONE ->", OUT)
