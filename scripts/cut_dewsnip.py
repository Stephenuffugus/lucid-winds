#!/usr/bin/env python3
"""Cut the Dew Snip "Paper Nocturne" art pack into named game assets.

Reuses the Nectar Drop magenta-KEY-distance pipeline (sample flat #FF00FF key
from a corner, mask by colour DISTANCE not hue so rose/violet survive, despill,
connected-component keep, alpha trim). Three cell modes:
  - "cut"  : magenta #FF00FF knockout grid cell -> transparent PNG (sprites,
             blooms, ui, fx). Alpha-trimmed to content unless trim=False.
  - "cellfull": knockout to transparent but KEEP the full cell bounds (vignette
             frame, full-cell radial glows that must stay centred in a square).
  - "bgfile": an individual full-bleed portrait PNG (NOT a grid) -> resized to
             <=1600 long edge (Hostinger resizer floor) opaque JPG <150KB.

Masters live one-per-file. Loaded one at a time (box is 8GB/no-swap). Outputs to
a STAGING tree so nothing touches the game until the montages are eyeballed.
Names match the sheet prompt docs exactly so the wiring can address every asset.

Usage:
  python3 scripts/cut_dewsnip.py [SRC_DIR] [OUT_DIR] [only]
    SRC_DIR  dir holding the master PNGs (default satellites/dew-snip/art-src)
    OUT_DIR  staging output (default scratchpad/ds_cut)
    only     one of: sprites blooms ui fx bg  (default: all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else "satellites/dew-snip/art-src"
OUT = sys.argv[2] if len(sys.argv) > 2 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/ccf18c04-24d2-4ff9-aa64-9edb26603195/scratchpad/ds_cut"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p

# ---- knockout grid sheets: (src_file, cols, rows, cells[]) --------------------
# cells[i] = (relpath, maxedge)            -> mode "cut" (alpha-trim to content)
#          | (relpath, maxedge, "full")    -> mode "cellfull" (keep full cell box)
#          | None                          -> skip cell
def c(path, edge, mode="cut"): return (path, edge, mode)

SHEETS = {
 # Sheet 1 — Core Gameplay Sprites  (dewsnip_sprites.png, 4x4, 512 cells)
 "sprites": ("dewsnip_sprites.png", 4, 4, [
    c("sprites/dewdrop",256),        c("sprites/dewdrop_bright",256), c("sprites/vine_anchor",220),   c("sprites/vine_segment",180),
    c("sprites/vine_stub",180),      c("sprites/nectar_mote",200),    c("sprites/thorn",220),         c("sprites/thorn_cluster",220),
    c("sprites/bellows_idle",260),   c("sprites/bellows_fire",300),   c("sprites/sprout_pot_open",340), c("sprites/sprout_pot_bloomed",360),
    c("sprites/leaf_pair",200),      c("sprites/dew_splash",260),     c("sprites/pollen_puff",240),   c("sprites/moon_glint",160),
 ]),
 # Sheet 2 — Keepsake Blooms & Skins  (dewsnip_blooms.png, 4x4) — COSMETICS
 "blooms": ("dewsnip_blooms.png", 4, 4, [
    c("blooms/bloom_dawnrose",360),  c("blooms/bloom_goldeye",360),   c("blooms/bloom_moonbell",360), c("blooms/bloom_emberdaisy",360),
    c("blooms/bloom_violetstar",360),c("blooms/bloom_frostlily",360), c("blooms/bloom_sagethistle",360),c("blooms/bloom_prismbloom",360),
    c("blooms/dew_classic",240),     c("blooms/dew_amber",240),       c("blooms/dew_rose",240),       c("blooms/dew_prism",240),
    c("blooms/vine_braided",200),    c("blooms/vine_lantern",200),    c("blooms/bellows_brass",260),  c("blooms/bellows_bloom",260),
 ]),
 # Sheet 4 — UI / HUD  (dewsnip_ui.png, 4x4)
 "ui": ("dewsnip_ui.png", 4, 4, [
    c("ui/btn_plate",384),           c("ui/btn_plate_primary",384),   c("ui/icon_garden",200),        c("ui/icon_daily",200),
    c("ui/icon_free",200),           c("ui/icon_grove",200),          c("ui/icon_menu",180),          c("ui/icon_retry",180),
    c("ui/icon_gear",180),           c("ui/icon_share",180),          c("ui/nectar_dot_full",140),    c("ui/nectar_dot_empty",140),
    c("ui/star_petal_full",150),     c("ui/star_petal_empty",150),    c("ui/card_frame",360),         c("ui/card_lock",180),
 ]),
 # Sheet 5 — FX & Feedback  (dewsnip_fx.png, 4x4)
 "fx": ("dewsnip_fx.png", 4, 4, [
    c("fx/snip_burst",256),          c("fx/nectar_burst",256),        c("fx/dew_trail_mote",160),     c("fx/bloom_flash",400,"full"),
    c("fx/slice_swipe",300),         c("fx/thorn_hit",256),           c("fx/dew_splash_burst",256),   c("fx/pollen_gust",280),
    c("fx/petal_shower",360,"full"), c("fx/contact_ripple",240),      c("fx/sparkle_small",140),      c("fx/glow_soft",300,"full"),
    c("fx/firefly",140),             c("fx/grow_swirl",300),          c("fx/star_pop",220),           c("fx/vignette_edge",512,"full"),
 ]),
}

# ---- individual full-bleed backgrounds: (relpath, src_file, maxedge) ----------
BGFILES = [
 ("backgrounds/bg_play",          "dewsnip_bg_play.png",          1600),
 ("backgrounds/bg_title",         "dewsnip_bg_title.png",         1600),
 ("backgrounds/bg_results",       "dewsnip_bg_results.png",       1600),
 ("backgrounds/bg_season_spring", "dewsnip_bg_season_spring.png", 1600),
 ("backgrounds/bg_season_summer", "dewsnip_bg_season_summer.png", 1600),
 ("backgrounds/bg_season_autumn", "dewsnip_bg_season_autumn.png", 1600),
 ("backgrounds/bg_season_winter", "dewsnip_bg_season_winter.png", 1600),
]

# ---- magenta key machinery (ported from cut_nectardrop.py) --------------------
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
        y0,y1,x0,x1 = 0,ch,0,cw          # preserve the whole cell box (frames/glows)
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
        if r: print("  %-30s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s (%s): %d/%d assets"%(key_name, src_file, ok, len([x for x in cells if x])))

def process_bg():
    ok=0
    for relpath, src_file, maxedge in BGFILES:
        fp = os.path.join(SRC, src_file)
        if not os.path.exists(fp): print("!! MISSING", fp, "-- skip"); continue
        im = Image.open(fp).convert("RGB")
        _,q = save_jpg(im, relpath, maxedge)
        print("  %-30s bg %dx%d q%d"%(relpath, im.size[0], im.size[1], q)); ok+=1
    print("bg: %d/%d files"%(ok, len(BGFILES)))

todo = ["sprites","blooms","ui","fx","bg"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_bg()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown target", s)
print("DONE ->", OUT)
