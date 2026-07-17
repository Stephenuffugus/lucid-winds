#!/usr/bin/env python3
"""Cut the Cosmic Cadets STYLE COLLECTION sheets (Jul 17 drop) into named skins.

Six style sheets (clay/crayon/glass/metallic/neon/retro) on a flat magenta
knockout. The generator did NOT use the flat 4x4 spec: each sheet is
  comets = 4 skins x 3 poses (burst / streak / settle), laid out 6-wide x 2 rows
  then tails / buddies / stars in rows below,
and the exact packing VARIES per sheet (square sheets vs 1536x1024 landscape
put the buddies/stars in different places). So we do NOT assume a grid.

Two modes:
  detect  <sheet.png> <out.png>          -> connected-component overlay: every
                                            object numbered + boxed, for mapping.
                                            Also prints the component table.
  cut     <sheet.png> <style> <mapfile>  -> emit named PNGs from a mapping that
                                            assigns component indices (or explicit
                                            boxes) to asset names.

The mapping (JSON) per asset is either
  {"name": "...", "comp": [idx, ...]}     merge these components, magenta-cut
  {"name": "...", "box": [x0,y0,x1,y1]}   explicit box, magenta-cut inside it
Crayon (tight poses) uses explicit boxes where CC merges neighbours.
"""
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import scipy.ndimage as ndi

def load(fp):
    return np.asarray(Image.open(fp).convert("RGB"))

def magenta_mask(a):
    R, G, B = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    # bright magenta: strong R and B, G clearly lower than both
    return (R > 150) & (B > 140) & (G < np.minimum(R, B) - 45)

def foreground(a):
    fg = ~magenta_mask(a)
    fg = ndi.binary_closing(fg, iterations=3)   # join body+rays across thin slivers
    fg = ndi.binary_opening(fg, iterations=1)   # drop salt noise
    return fg

def components(a, min_frac=0.00035):
    H, W = a.shape[:2]
    fg = foreground(a)
    lbl, n = ndi.label(fg)
    out = []
    min_area = min_frac * H * W
    for i in range(1, n + 1):
        ys, xs = np.where(lbl == i)
        area = ys.size
        if area < min_area:
            continue
        out.append({"idx": len(out), "x0": int(xs.min()), "y0": int(ys.min()),
                    "x1": int(xs.max()) + 1, "y1": int(ys.max()) + 1,
                    "cx": int(xs.mean()), "cy": int(ys.mean()), "area": int(area)})
    # reading order: top-to-bottom in bands, then left-to-right
    out.sort(key=lambda c: (round(c["cy"] / (H * 0.06)), c["cx"]))
    for j, c in enumerate(out):
        c["idx"] = j
    return out, (W, H)

def detect(fp, outp):
    a = load(fp)
    comps, (W, H) = components(a)
    scale = 1000.0 / max(W, H)
    im = Image.fromarray(a).convert("RGB")
    dr = ImageDraw.Draw(im)
    try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(H*0.028))
    except Exception: font = ImageFont.load_default()
    for c in comps:
        dr.rectangle([c["x0"], c["y0"], c["x1"], c["y1"]], outline=(0,255,0), width=3)
        dr.text((c["x0"]+4, c["y0"]+2), str(c["idx"]), fill=(0,255,0), font=font)
    im.resize((int(W*scale), int(H*scale)), Image.LANCZOS).save(outp)
    print("n=%d  size=%dx%d" % (len(comps), W, H))
    for c in comps:
        print("  %2d  box=(%4d,%4d,%4d,%4d)  c=(%4d,%4d)  area=%d"
              % (c["idx"], c["x0"], c["y0"], c["x1"], c["y1"], c["cx"], c["cy"], c["area"]))
    return comps

def sample_bg(a):
    """Median of the four corners = the exact flat magenta background."""
    H, W = a.shape[:2]; s = 16
    corners = [a[0:s,0:s], a[0:s,W-s:W], a[H-s:H,0:s], a[H-s:H,W-s:W]]
    px = np.concatenate([c.reshape(-1,3) for c in corners], 0).astype(float)
    return np.median(px, 0)

def cut_region(a, box, bg, thr=92):
    """Key by DISTANCE from the exact background magenta (not hue) so the art's
    own pink/rose is preserved. Erode 1px to shed the blended magenta fringe,
    then feather the alpha. No despill (that would desaturate real pink)."""
    x0, y0, x1, y1 = box
    sub = a[y0:y1, x0:x1].astype(np.int16)
    d = np.sqrt(((sub - bg) ** 2).sum(2))
    m = d >= thr
    m = ndi.binary_closing(m, iterations=2)
    m = ndi.binary_opening(m, iterations=1)
    if not m.any():
        return None
    lbl, n = ndi.label(m)
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1, n+1))
    big = sizes.max()
    keep = np.zeros_like(m)
    for i in range(1, n+1):
        if sizes[i-1] >= max(30, big*0.03):
            keep |= (lbl == i)
    # fill interior holes the key may have punched in near-magenta pink regions
    keep = ndi.binary_fill_holes(keep)
    core = ndi.binary_erosion(keep, iterations=1)   # shed the outer fringe ring
    if not core.any(): core = keep
    ys, xs = np.where(keep)
    ry0, ry1, rx0, rx1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
    pad = 6
    ry0, rx0 = max(0, ry0-pad), max(0, rx0-pad)
    ry1, rx1 = min(sub.shape[0], ry1+pad), min(sub.shape[1], rx1+pad)
    rgb = sub[ry0:ry1, rx0:rx1].astype(np.uint8)
    alpha = ndi.gaussian_filter((core[ry0:ry1, rx0:rx1].astype(np.uint8)) * 255, 0.7)
    return np.dstack([rgb, alpha]).astype(np.uint8)

def save_png(arr, path, maxedge=320):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im = Image.fromarray(arr, "RGBA")
    w, h = im.size; m = max(w, h)
    if m > maxedge:
        r = maxedge/m; im = im.resize((max(1,int(w*r)), max(1,int(h*r))), Image.LANCZOS)
    e = maxedge
    for _ in range(6):
        im.save(path, optimize=True)
        if os.path.getsize(path) <= 150*1024: break
        e = int(e*0.85); im = im.resize((max(1,int(im.size[0]*0.85)), max(1,int(im.size[1]*0.85))), Image.LANCZOS)
    return im.size

def auto_split(a, bg, box, k):
    """Split a box that merged k tight poses into k sub-boxes by finding the
    k-1 widest low-foreground COLUMN gaps between the poses (crayon)."""
    x0, y0, x1, y1 = box
    sub = a[y0:y1, x0:x1].astype(np.int16)
    d = np.sqrt(((sub - bg) ** 2).sum(2))
    col = ndi.gaussian_filter1d((d >= 92).sum(0).astype(float), 3)
    W = len(col)
    thr = col.max() * 0.12
    low = col < thr
    runs = []
    i = 0
    while i < W:
        if low[i]:
            j = i
            while j < W and low[j]: j += 1
            runs.append((i, j, (i+j)//2, j-i))
            i = j
        else:
            i += 1
    inner = [r for r in runs if W*0.08 < r[2] < W*0.92]
    inner.sort(key=lambda r: -r[3])
    cuts = sorted(r[2] for r in inner[:k-1])
    xs = [0] + cuts + [W]
    return [[x0+aa, y0, x0+bb, y1] for aa, bb in zip(xs[:-1], xs[1:])]

def cut(fp, style, mapfp, outdir):
    a = load(fp)
    bg = sample_bg(a)
    comps, _ = components(a)
    cmap = {c["idx"]: c for c in comps}
    spec = json.load(open(mapfp))
    ok = 0; total = 0
    for asset in spec:
        # a "split" entry auto-divides one cluster box into len(names) poses
        if "split" in asset:
            names = asset["names"]
            boxes = auto_split(a, bg, asset["split"], len(names))
            for nm, bx in zip(names, boxes):
                total += 1
                arr = cut_region(a, bx, bg)
                if arr is None: print("  FAIL", nm); continue
                sz = save_png(arr, os.path.join(outdir, nm + ".png"))
                print("  %-28s %dx%d (split)" % (nm, sz[0], sz[1])); ok += 1
            continue
        total += 1
        name = asset["name"]
        if "box" in asset:
            box = asset["box"]
        else:
            idxs = asset["comp"]
            xs0 = min(cmap[i]["x0"] for i in idxs); ys0 = min(cmap[i]["y0"] for i in idxs)
            xs1 = max(cmap[i]["x1"] for i in idxs); ys1 = max(cmap[i]["y1"] for i in idxs)
            box = [xs0, ys0, xs1, ys1]
        arr = cut_region(a, box, bg)
        if arr is None:
            print("  FAIL", name); continue
        sz = save_png(arr, os.path.join(outdir, name + ".png"))
        print("  %-28s %dx%d" % (name, sz[0], sz[1])); ok += 1
    print("cut %d/%d for %s" % (ok, total, style))

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "detect":
        detect(sys.argv[2], sys.argv[3])
    elif mode == "cut":
        cut(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
