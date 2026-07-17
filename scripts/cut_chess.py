#!/usr/bin/env python3
"""Cut the 13 chess court sheets (Jul 17 drop) into per-court game assets.

Source: art-asset-lists/Chess-20260717T145706Z-1-001.zip  (extract anywhere,
pass the extracted "Chess " folder as argv[1]).

Every sheet is nominally a 4x4 grid, 512px cells on a 2048 master; the
delivered masters are 1254x1254 with thin white gridlines, so we slice on the
PROPORTIONAL grid and inset each cell to drop the gridlines (frost-watch
pattern). Magenta #FF00FF knockout on piece + chip cells; tile cells are
full-bleed opaque.

Standard cell order (spec: CHESS SKINS — 00 art direction docx):
  r1: wK wQ wR wB   r2: wN wP bK bQ   r3: bR bB bN bP
  r4: tile-light tile-dark cap-w cap-b

POTTERY deviates (verified by eye Jul 17): black court shifted down one row
(cells 7-8 empty), tiles live in cells 15-16, and the capture chips are drawn
as small discs UNDER the bN/bP pieces in cells 13-14 — we split those cells by
connected component (piece = big top blob, chip = small bottom disc) and fall
back to pawn art for a chip if the split fails.

Output -> assets/games/chess/courts/<court>/{wK..bP,capW,capB}.png + tileL/tileD.jpg
Pieces <=150KB each, tiles jpg 256px.
"""
import sys, os, shutil
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/tmp/claude-1000/-workspaces-lucid-winds/3adfad7e-5227-40e2-8d60-45835fc82f63/scratchpad/chess-drop/Chess "
OUT = sys.argv[2] if len(sys.argv) > 2 else "assets/games/chess/courts"

STD = ['wK','wQ','wR','wB','wN','wP','bK','bQ','bR','bB','bN','bP','tileL','tileD','capW','capB']

COURTS = {
    'deepsea':      '01.png',
    'cosmic':       '02.png',
    'dino':         '03.png',
    'candy':        '04.png',
    'manor':        '05.png',
    'forest':       '06.png',
    'foodtruck':    'foodtruck.png',
    'stainedglass': 'stainedglass.png',
    'pottery':      'pottery.png',
    'poolparty':    'poolparty.png',
    'origami':      'origamizoo.png',
    'paper':        'paper.png',
    'cardboard':    'cardboard.png',
}

# pottery: cell index -> name (None = empty magenta cell). Cells 12/13 hold a
# piece AND a chip disc below it; 'SPLIT' marks them.
POTTERY = {0:'wK',1:'wQ',2:'wR',3:'wB',4:'wN',5:'wP',6:None,7:None,
           8:'bK',9:'bQ',10:'bR',11:'bB',12:'SPLIT_bN_capW',13:'SPLIT_bP_capB',
           14:'tileL',15:'tileD'}

INSET = 6          # px shaved from every cell edge to drop white gridlines
PIECE_EDGE = 240   # max px, board squares render ~44px so this is 3-5x retina
CHIP_EDGE = 160
TILE_EDGE = 256

def sample_key(a):
    H, W = a.shape[:2]; s = 10
    cands = [a[0:s,0:s], a[0:s,W-s:W], a[H-s:H,0:s], a[H-s:H,W-s:W],
             a[0:s, W//2-s:W//2+s]]
    best = None
    for cc in cands:
        m = cc.reshape(-1,3).astype(float).mean(0)
        if m[0] > 150 and m[2] > 150 and m[1] < 90:
            if best is None or m[1] < best[1]: best = m
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
    os.makedirs(os.path.dirname(path), exist_ok=True)
    e = maxedge
    for _ in range(6):
        fit(im, e).save(path, optimize=True)
        if os.path.getsize(path) <= 150*1024 or e < 90: break
        e = int(e*0.82)
    return path

def fg_components(cell, key):
    fg = ~magenta_mask(cell, key)
    fg = ndi.binary_opening(fg, iterations=1)
    fg = ndi.binary_erosion(fg, iterations=1)
    fg = ndi.binary_closing(fg, iterations=2)
    return ndi.label(fg)

def is_sliver(lbl, i, ch, cw):
    """Gridline residue / neighbor-cell bleed: a very flat (or very skinny)
    component spanning most of the cell. Real art never has this shape."""
    ys, xs = np.where(lbl == i)
    h = ys.max()-ys.min()+1; w = xs.max()-xs.min()+1
    flat = h <= max(8, ch*0.07) and w >= cw*0.45
    skinny = w <= max(8, cw*0.07) and h >= ch*0.45
    return flat or skinny

def crop_mask(cell, keep, path, maxedge):
    ch, cw = cell.shape[:2]
    m = ndi.binary_dilation(keep, iterations=1)
    ys, xs = np.where(m)
    if ys.size == 0: return None
    y0,y1,x0,x1 = ys.min(),ys.max()+1,xs.min(),xs.max()+1
    pad = 4
    y0,x0 = max(0,y0-pad), max(0,x0-pad); y1,x1 = min(ch,y1+pad), min(cw,x1+pad)
    rgb = despill(cell)[y0:y1, x0:x1]
    alpha = ndi.gaussian_filter((m[y0:y1,x0:x1].astype(np.uint8))*255, 0.6)
    out = np.dstack([rgb, alpha]).astype(np.uint8)
    save_png(Image.fromarray(out, "RGBA"), path, maxedge)
    return (x1-x0, y1-y0)

def cut_piece(cell, path, maxedge, key):
    ch, cw = cell.shape[:2]
    lbl, n = fg_components(cell, key)
    if n == 0: print("   EMPTY", path); return None
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1, n+1))
    biggest = sizes.max()
    kept = [i for i in range(1, n+1)
            if sizes[i-1] >= max(40, biggest*0.02) and not is_sliver(lbl, i, ch, cw)]
    if not kept: print("   NOISE", path); return None
    main = max(kept, key=lambda i: sizes[i-1])
    mys, _ = np.where(lbl == main); m0, m1 = mys.min(), mys.max()
    keep = np.zeros(lbl.shape, bool)
    for i in kept:
        ys, _ = np.where(lbl == i)
        # detached blob fully below/above the piece that touches the cell edge
        # = the next/previous row's art bleeding across the gridline
        if i != main and ys.min() > m1 and ys.max() >= ch-5: continue
        if i != main and ys.max() < m0 and ys.min() <= 4: continue
        keep |= (lbl == i)
    return crop_mask(cell, keep, path, maxedge)

def cut_split(cell, piece_path, chip_path, key):
    """Pottery cells 12/13: big top component = piece, small bottom = chip."""
    ch, cw = cell.shape[:2]
    lbl, n = fg_components(cell, key)
    if n == 0: print("   EMPTY", piece_path); return False, False
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1, n+1))
    order = np.argsort(sizes)[::-1] + 1
    comps = [i for i in order if sizes[i-1] >= 200]
    piece_keep = np.zeros(lbl.shape, bool)
    for i in comps:
        if is_sliver(lbl, i, ch, cw): continue
        ys, _ = np.where(lbl == i)
        cy = ys.mean()
        # chips sit against the bottom edge (and run off the sheet — verified
        # half-clipped Jul 17, so they are DISCARDED; caller falls back to pawn)
        if cy > ch*0.80 and sizes[i-1] < sizes[comps[0]-1]*0.6:
            continue
        piece_keep |= (lbl == i)
    ok = crop_mask(cell, piece_keep, piece_path, PIECE_EDGE) is not None
    return ok, False

def cut_tile(cell, path, key):
    """Full-bleed opaque tile — but neighbors' piece bases and magenta strips
    can bleed across the proportional gridline (origami), so trim any row/col
    containing meaningful magenta, then take the biggest clean center square."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    mm = magenta_mask(cell, key)
    def longest_clean(bad):
        best = (0, 0); cur = None
        for i, b in enumerate(list(bad)+[True]):
            if not b:
                if cur is None: cur = i
            else:
                if cur is not None and i-cur > best[1]-best[0]: best = (cur, i)
                cur = None
        return best
    # sequential: a top strip spans every column, so trim rows FIRST, then
    # recompute the column mask on the row-trimmed band (and once more rows)
    y0, y1 = longest_clean(mm.mean(axis=1) > 0.03)
    if y1-y0 < 60: y0, y1 = 0, cell.shape[0]
    x0, x1 = longest_clean(mm[y0:y1].mean(axis=0) > 0.03)
    if x1-x0 < 60: x0, x1 = 0, cell.shape[1]
    yb0, yb1 = longest_clean(mm[y0:y1, x0:x1].mean(axis=1) > 0.03)
    if yb1-yb0 >= 60: y0, y1 = y0+yb0, y0+yb1
    sub = cell[y0:y1, x0:x1]
    h, w = sub.shape[:2]
    s = min(h, w)
    yy = (h-s)//2; xx = (w-s)//2
    im = Image.fromarray(sub[yy:yy+s, xx:xx+s]).resize((TILE_EDGE, TILE_EDGE), Image.LANCZOS)
    q = 88
    im.save(path, quality=q)
    while os.path.getsize(path) > 90*1024 and q > 50:
        q -= 6; im.save(path, quality=q)
    return path

def process(court, fname):
    fp = os.path.join(SRC, fname)
    if not os.path.exists(fp): print("!! MISSING", fp); return
    a = np.asarray(Image.open(fp).convert("RGB")); H, W = a.shape[:2]
    key = sample_key(a)
    cw, chh = W/4.0, H/4.0
    outdir = os.path.join(OUT, court)
    print("%s (%s) key=%s" % (court, fname, None if key is None else [int(x) for x in key]))
    layout = POTTERY if court == 'pottery' else {i: STD[i] for i in range(16)}
    got_chips = {'capW': False, 'capB': False}
    for idx in range(16):
        name = layout.get(idx)
        if name is None: continue
        rr, cc = idx//4, idx%4
        y0 = int(round(rr*chh))+INSET; y1 = int(round((rr+1)*chh))-INSET
        x0 = int(round(cc*cw))+INSET;  x1 = int(round((cc+1)*cw))-INSET
        cell = a[y0:y1, x0:x1]
        if name.startswith('SPLIT_'):
            _, pname, cname = name.split('_')
            ok, chip_ok = cut_split(cell, os.path.join(outdir, pname+'.png'),
                                    os.path.join(outdir, cname+'.png'), key)
            got_chips[cname] = chip_ok
            print("  %-6s %s  chip:%s" % (pname, "ok" if ok else "FAIL", "ok" if chip_ok else "fallback"))
        elif name in ('tileL','tileD'):
            cut_tile(cell, os.path.join(outdir, name+'.jpg'), key)
            print("  %-6s tile" % name)
        elif name in ('capW','capB'):
            r = cut_piece(cell, os.path.join(outdir, name+'.png'), CHIP_EDGE, key)
            got_chips[name] = r is not None
            if r: print("  %-6s %dx%d" % (name, r[0], r[1]))
        else:
            r = cut_piece(cell, os.path.join(outdir, name+'.png'), PIECE_EDGE, key)
            if r: print("  %-6s %dx%d" % (name, r[0], r[1]))
    # chip fallback: reuse pawn art so capW/capB always exist
    for cap, pawn in (('capW','wP'), ('capB','bP')):
        cp = os.path.join(outdir, cap+'.png')
        if not os.path.exists(cp) or not got_chips.get(cap, True):
            src = os.path.join(outdir, pawn+'.png')
            if os.path.exists(src):
                shutil.copy(src, cp); print("  %-6s <- %s (fallback)" % (cap, pawn))

only = sys.argv[3] if len(sys.argv) > 3 else 'all'
for court, fname in COURTS.items():
    if only != 'all' and court != only: continue
    process(court, fname)
print("DONE ->", OUT)
