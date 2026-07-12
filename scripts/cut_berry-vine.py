#!/usr/bin/env python3
"""Cut the Berry Vine "Starberry Cosmos" art pack into named game assets.

Reuses the Dew Snip / Nectar Drop magenta-KEY-distance pipeline (sample flat
#FF00FF key from a corner, mask by colour DISTANCE not hue so rose/violet
survive, despill, connected-component keep, alpha trim). Three cell modes:
  - "cut"  : magenta #FF00FF knockout grid cell -> transparent PNG (sprites,
             pods, ui, fx). Alpha-trimmed to content unless mode "full".
  - "full" : knockout to transparent but KEEP the full cell bounds (vignette
             frames, full-cell radial glows that must stay centred in a square).
  - bgfile : an individual full-bleed portrait PNG (NOT a grid) -> resized to
             <=1600 long edge (Hostinger resizer floor) opaque JPG <150KB.

Source sheets were identified by CONTENT (not filename) against the
art-asset-lists/berry-vine specs:
  sheet1  -> bv_orbs       (01-berryvine-orbs)
  sheet2  -> bv_world      (02-berryvine-shooter-track)
  sheet9  -> bv_ui         (04-berryvine-ui)
  sheet10 -> bv_fx         (05-berryvine-fx)
  sheet11 -> bv_cosmetics  (06-berryvine-cosmetics)
  sheet3  -> bg_play       (03-berryvine-backgrounds #1)
  sheet4  -> bg_title      (03 #2)
  sheet5  -> bg_results    (03 #3)
  sheet6  -> bg_nebula_serpentine (03 #4)
  sheet7  -> bg_nebula_loops      (03 #5)
  sheet8  -> bg_nebula_spiral     (03 #6)

Grid sheets are 1254x1254 -> native cell ~313px. maxedge is set to 340 so a
cell is NEVER upscaled and NEVER downscaled unless the 150KB file cap forces it
(never overshrink). Backgrounds cap at 1600 long edge.

Usage:
  python3 scripts/cut_berry-vine.py [SRC_DIR] [OUT_DIR] [only]
    SRC_DIR  dir holding the sheetN.png masters (default: the artpack scratchpad)
    OUT_DIR  staging output (default: satellites/berry-vine/assets)
    only     one of: orbs world ui fx cosmetics bg  (default: all)
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/dcdc7df0-dfcf-4605-8196-38934935c607/scratchpad/artpacks/Berry Vine"
OUT = sys.argv[2] if len(sys.argv) > 2 else \
    "/workspaces/lucid-winds/satellites/berry-vine/assets"
only = sys.argv[3] if len(sys.argv) > 3 else "all"

CELL = 340  # >= native cell (~313) -> no resize unless 150KB cap forces it

def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p

# ---- knockout grid sheets: (src_file, cols, rows, cells[]) --------------------
# cells[i] = (relpath, maxedge)            -> mode "cut" (alpha-trim to content)
#          | (relpath, maxedge, "full")    -> mode "full" (keep full cell box)
#          | None                          -> skip cell
def c(path, edge=CELL, mode="cut"): return (path, edge, mode)

SHEETS = {
 # Sheet 1 (sheet1.png) — Star-Berry Orbs   (bv_orbs, 4x4)
 "orbs": ("sheet1.png", 4, 4, [
    c("orbs/orb_circle"),       c("orbs/orb_heart"),      c("orbs/orb_star"),          c("orbs/orb_teardrop"),
    c("orbs/orb_diamond"),      c("orbs/orb_hex"),        c("orbs/orb_template_neutral"), c("orbs/orb_loaded_ring"),
    c("orbs/orb_paint_halo"),   c("orbs/orb_prism"),      c("orbs/orb_matched_flash"), c("orbs/pop_shard"),
    c("orbs/sheen_crescent"),   c("orbs/next_orb_mini"),  c("orbs/sparkle_small"),     c("orbs/orb_ghost"),
 ]),
 # Sheet 2 (sheet2.png) — Launch Pod + Track + Wormhole   (bv_world, 4x4)
 "world": ("sheet2.png", 4, 4, [
    c("world/pod_base"),        c("world/pod_fins"),      c("world/pod_mouth_glow"),   c("world/burst_ring"),
    c("world/aim_beam"),        c("world/aim_beam_burst"),c("world/track_ribbon"),     c("world/track_ribbon_dread"),
    c("world/track_underglow"), c("world/track_node"),    c("world/spawn_glint"),      c("world/wormhole_idle"),
    c("world/wormhole_dread"),  c("world/wormhole_swallow"), c("world/pod_shadow"),    c("world/comet_head"),
 ]),
 # Sheet 9 (sheet9.png) — UI / HUD   (bv_ui, 4x4)
 "ui": ("sheet9.png", 4, 4, [
    c("ui/btn_plate"),          c("ui/btn_plate_primary"),c("ui/icon_journey"),        c("ui/icon_daily"),
    c("ui/icon_rush"),          c("ui/icon_zen"),         c("ui/icon_wardrobe"),       c("ui/icon_settings"),
    c("ui/chip_menu"),          c("ui/chip_retry"),       c("ui/score_diamond"),       c("ui/charge_track"),
    c("ui/charge_fill"),        c("ui/burst_plate"),      c("ui/star_full"),           c("ui/star_empty"),
 ]),
 # Sheet 10 (sheet10.png) — FX & Feedback   (bv_fx, 4x4)
 "fx": ("sheet10.png", 4, 4, [
    c("fx/match_burst"),        c("fx/cascade_burst"),    c("fx/flash_wash",CELL,"full"), c("fx/vignette_dread",CELL,"full"),
    c("fx/float_glow"),         c("fx/combo_ring"),       c("fx/star_confetti"),       c("fx/sparkle_small"),
    c("fx/glow_soft",CELL,"full"), c("fx/star_drift"),    c("fx/trail_mote"),          c("fx/launch_flash"),
    c("fx/swap_swirl"),         c("fx/charge_pop"),       c("fx/star_pop"),            c("fx/vignette_edge",CELL,"full"),
 ]),
 # Sheet 11 (sheet11.png) — Cosmetics   (bv_cosmetics, 4x4)
 "cosmetics": ("sheet11.png", 4, 4, [
    c("cosmetics/pod_seedpod"), c("cosmetics/pod_amber"), c("cosmetics/pod_blossom"),  c("cosmetics/pod_thorn"),
    c("cosmetics/pal_orchard"), c("cosmetics/pal_dusk"),  c("cosmetics/pal_frost"),    c("cosmetics/pal_ember"),
    c("cosmetics/ward_card_frame"), c("cosmetics/ward_card_locked"), c("cosmetics/ward_equipped_ring"), c("cosmetics/unlock_badge"),
    c("cosmetics/pod_exhaust_glow"), c("cosmetics/palette_swatch_chip"), c("cosmetics/mastery_meter"), c("cosmetics/lock_padlock"),
 ]),
}

# ---- individual full-bleed backgrounds: (relpath, src_file, maxedge) ----------
BGFILES = [
 ("bg/bg_play",               "sheet3.png", 1600),
 ("bg/bg_title",              "sheet4.png", 1600),
 ("bg/bg_results",            "sheet5.png", 1600),
 ("bg/bg_nebula_serpentine",  "sheet6.png", 1600),
 ("bg/bg_nebula_loops",       "sheet7.png", 1600),
 ("bg/bg_nebula_spiral",      "sheet8.png", 1600),
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
    # Only knock back TRUE magenta fringe (very low green): #FF00FF spill has G~0.
    # Berry Vine's rose #e24d6a (G=77) and violet #a468d8 (G=104) legitimately
    # lean toward the magenta axis, so gate on G<60 to spare their bodies while
    # still cleaning anti-aliased magenta edge pixels.
    Rf,Gf,Bf = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    lean = (((Rf+Bf)//2 - Gf) > 30) & (Gf < 60)
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

todo = ["orbs","world","ui","fx","cosmetics","bg"] if only=="all" else [only]
for s in todo:
    if s=="bg": process_bg()
    elif s in SHEETS: process_sheet(s)
    else: print("?? unknown target", s)
print("DONE ->", OUT)
