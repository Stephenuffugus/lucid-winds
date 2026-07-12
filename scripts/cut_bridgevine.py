#!/usr/bin/env python3
"""Cut the Bridgevine "Copperwood Atelier" art pack into named game assets.

Reuses the Dew Snip / Nectar Drop magenta-KEY-distance pipeline (sample flat
#FF00FF key from a corner, mask by colour DISTANCE not hue so rose/violet
survive, despill, connected-component keep, alpha trim). Two cell modes:
  - "cut"  : magenta #FF00FF knockout grid cell -> transparent PNG (pods,
             struts, world, ui, fx). Alpha-trimmed to content.
  - "bgfile": an individual full-bleed portrait PNG (NOT a grid) -> resized to
             <=1600 long edge (Hostinger resizer floor) opaque JPG <150KB.

The pack ships nine masters named sheet1.png .. sheet9.png. Verified by eye
against art-asset-lists/bridgevine/*.md:
  sheet1 -> pods    (4x3)      sheet2 -> struts (4x3)   sheet3 -> world (4x3)
  sheet4 -> bg_meadow_dusk     sheet5 -> bg_high_cirrus
  sheet6 -> bg_aurora_loft     sheet7 -> bg_deep_night
  sheet8 -> ui      (4x4 wide) sheet9 -> fx     (4x4)

Outputs land in the LIVE asset tree satellites/bridgevine/assets/<sub>/ so the
wiring can address every cell. Native cell resolution is preserved (maxedge is
above the native cell size); the save loop only shrinks when a PNG breaks 150KB.

Usage:
  python3 scripts/cut_bridgevine.py [SRC_DIR] [OUT_DIR] [only]
    SRC_DIR  dir holding sheet1..sheet9.png (default: scratchpad artpack)
    OUT_DIR  asset staging (default: satellites/bridgevine/assets)
    only     one of: pods struts world ui fx bg  (default: all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/dcdc7df0-dfcf-4605-8196-38934935c607/scratchpad/artpacks/Bridgevine"
OUT = sys.argv[2] if len(sys.argv) > 2 else "satellites/bridgevine/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p

def c(path, edge, mode="cut"): return (path, edge, mode)

# ---- knockout grid sheets: (src_file, cols, rows, cells[]) --------------------
SHEETS = {
 # Sheet 1 — Pods, Anchors & Pod Skins  (sheet1.png, 4x3)
 "pods": ("sheet1.png", 4, 3, [
    c("pods/pod_sprout",480),        c("pods/pod_sprout_fresh",480),  c("pods/pod_acorn",480),         c("pods/pod_lantern",480),
    c("pods/pod_berry",480),         c("pods/anchor_root",480),       c("pods/anchor_root_platform",480), c("pods/pod_ghost_ok",480),
    c("pods/pod_ghost_bad",480),     c("pods/dew_pouch_pod",480),     c("pods/pod_worried",480),       c("pods/pod_falling",480),
 ]),
 # Sheet 2 — Struts, Crystal States & Strain Marks  (sheet2.png, 4x3)
 "struts": ("sheet2.png", 4, 3, [
    c("struts/strut_vine_calm",480),     c("struts/strut_vine_worried",480),  c("struts/strut_vine_critical",480), c("struts/strut_snap",480),
    c("struts/strut_crystal_calm",480),  c("struts/strut_crystal_worried",480),c("struts/strut_crystal_critical",480),c("struts/strut_braid",480),
    c("struts/strut_goldthread",480),    c("struts/crystal_tap_ring",480),    c("struts/strut_joint_wrap",480),    c("struts/cable_ghost",480),
 ]),
 # Sheet 3 — Terrain, Sun Bloom & Dewdrops  (sheet3.png, 4x3)
 "world": ("sheet3.png", 4, 3, [
    c("world/terrain_ledge_top",480),    c("world/terrain_ledge_body",480),   c("world/terrain_ledge_edge",480),   c("world/terrain_shelf_floating",480),
    c("world/sun_bloom_waiting",480),    c("world/sun_bloom_touched",480),    c("world/sun_bloom_won",480),        c("world/dewdrop",480),
    c("world/dewdrop_taken_burst",480),  c("world/wind_wisp",480),            c("world/survey_flag",480),          c("world/void_mist",480),
 ]),
 # Sheet 8 — UI / HUD  (sheet8.png, 4x4 wide cells)
 "ui": ("sheet8.png", 4, 4, [
    c("ui/btn_primary",480),         c("ui/btn_secondary",480),       c("ui/btn_ghost",480),           c("ui/chip_pods",480),
    c("ui/chip_dew",480),            c("ui/btn_home",480),            c("ui/btn_reset",480),           c("ui/goal_banner",480),
    c("ui/lvlcard_frame",480),       c("ui/lvlcard_done_wreath",480), c("ui/lvlcard_lock",480),        c("ui/wardcard_plate",480),
    c("ui/toggle_track_off",480),    c("ui/toggle_knob",480),         c("ui/toast_plate",480),         c("ui/grove_frame",480),
 ]),
 # Sheet 9 — FX & Keepsakes  (sheet9.png, 4x4)
 "fx": ("sheet9.png", 4, 4, [
    c("fx/fx_snap_burst",480),       c("fx/fx_place_pulse",480),      c("fx/fx_crystal_flash",480),    c("fx/fx_dew_sparkle",480),
    c("fx/fx_bloom_petal",480),      c("fx/fx_bloom_ring",480),       c("fx/fx_pollen_mote",480),      c("fx/fx_hold_arc",480),
    c("fx/keepsake_flower_a",480),   c("fx/keepsake_flower_b",480),   c("fx/keepsake_flower_c",480),   c("fx/keepsake_flower_d",480),
    c("fx/keepsake_flower_e",480),   c("fx/fx_wind_leaf",480),        c("fx/fx_fall_puff",480),        c("fx/fx_confetti_seed",480),
 ]),
}

# ---- individual full-bleed backgrounds: (relpath, src_file, maxedge) ----------
BGFILES = [
 ("backgrounds/bg_meadow_dusk", "sheet4.png", 1600),
 ("backgrounds/bg_high_cirrus", "sheet5.png", 1600),
 ("backgrounds/bg_aurora_loft", "sheet6.png", 1600),
 ("backgrounds/bg_deep_night",  "sheet7.png", 1600),
]

# ---- magenta key machinery (ported from cut_dewsnip.py) -----------------------
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
    base = im.convert("RGB"); p = P(path+".jpg"); e = maxedge; q=86
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
        print("  %-34s bg %dx%d q%d"%(relpath, im.size[0], im.size[1], q)); ok+=1
    print("bg: %d/%d files"%(ok, len(BGFILES)))

todo = ["pods","struts","world","ui","fx","bg"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_bg()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown target", s)
print("DONE ->", OUT)
