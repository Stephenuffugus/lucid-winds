#!/usr/bin/env python3
"""Cut the first chess pack (ChatGPT, 25 Oct 2026; vault-20261025-chess-first-pack) into the 2D court format the live game
reads: assets/games/chess/courts/<court>/{wK..wP, bK..bP, capW, capB}.png + tileL/tileD.jpg (the July cut's layout).
Run: python3 -I scripts/cut_chess_pack.py <extracted pack dir> [out dir]
The pack draws every piece on a plain mid grey plate (about #787878) with a soft shadow: the plate is keyed out by colour
distance from the plate colour sampled at the corners (soft edge, then a colour bleed so no grey fringe), the piece is cropped
to its visible bounds and scaled to 240 px tall. Only the white side is drawn; the dark side is the white piece recoloured
toward the dark king's measured palette (per court: the dark king's mean hue, saturation and lightness against the white
king's), the way Meshy would retint one mesh: a palette transfer by luminance, the king's own colours at each shade. Jimothy is skipped: it is not his raccoon (no reference was supplied)."""
import json, os, sys, colorsys
from PIL import Image, ImageFilter
SRC = sys.argv[1]; OUT = sys.argv[2] if len(sys.argv) > 2 else "assets/games/chess/courts"
COURTS = {"staunton": "walnut", "cats": "cats", "dogs": "dogs", "greenhouse": "greenhouse", "petri": "petri", "dragonlings": "dragonlings"}
PIECES = {"K": "king", "Q": "queen", "R": "rook", "B": "bishop", "N": "knight", "P": "pawn"}
BOARDS = {c["slug"]: c.get("board", "walnut") for c in json.load(open(os.path.join(SRC, "docs", "courts.json")))}
H = 240

def key_out(im):
    im = im.convert("RGB"); w, h = im.size; px = im.load()
    cs = [px[3, 3], px[w - 4, 3], px[3, h - 4], px[w - 4, h - 4]]
    bg = tuple(sum(c[i] for c in cs) // 4 for i in range(3))
    out = Image.new("RGBA", im.size); op = out.load()
    lo, hi = 22, 60   # distance from the plate colour: under lo transparent, over hi opaque, soft between
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            d = max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2]))
            a = 0 if d <= lo else 255 if d >= hi else int(255 * (d - lo) / (hi - lo))
            op[x, y] = (r, g, b, a)
    return out

def bleed(im, passes=4):   # edge pixels take the nearest solid colour so the resample has no grey fringe (the Part A rule)
    rgb = im.convert("RGB"); a = im.getchannel("A")
    for _ in range(passes):
        blurred = rgb.filter(ImageFilter.BoxBlur(1))
        mask = a.point(lambda v: 255 if v > 8 else 0)
        rgb = Image.composite(rgb, blurred, mask)
    out = rgb.convert("RGBA"); out.putalpha(a); return out

def crop_scale(im, height):
    bb = im.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
    im = im.crop(bb)
    s = height / im.height
    return im.resize((max(1, round(im.width * s)), height), Image.LANCZOS)

def lum_lut(dark):   # the dark king's own colours by luminance: a 256 entry table, each entry the mean colour of its pixels at that luminance
    px = dark.load(); w, h = dark.size; acc = [[0, 0, 0, 0] for _ in range(256)]
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 200: continue
            L = int(0.299 * r + 0.587 * g + 0.114 * b); e = acc[L]; e[0] += r; e[1] += g; e[2] += b; e[3] += 1
    lut = [None] * 256
    for L in range(256):
        if acc[L][3] >= 3: lut[L] = (acc[L][0] // acc[L][3], acc[L][1] // acc[L][3], acc[L][2] // acc[L][3])
    known = [L for L in range(256) if lut[L]]
    for L in range(256):   # fill the gaps from the nearest known luminance
        if lut[L] is None:
            n = min(known, key=lambda k: abs(k - L)); lut[L] = lut[n]
    # the dark side must read dark: the white piece's span lands on the king's darker body tones (its 3rd to 62nd luminance
    # percentile), so only the brightest highlights reach the king's cream accents
    ws = []
    for L in range(256):
        ws += [L] * acc[L][3]
    ws.sort(); lo = ws[int(len(ws) * 0.03)]; hi = ws[int(len(ws) * 0.62)]
    return lut, lo, hi

def lum_range(im):
    px = im.load(); w, h = im.size; ls = []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b, a = px[x, y]
            if a >= 200: ls.append(int(0.299 * r + 0.587 * g + 0.114 * b))
    ls.sort(); return ls[int(len(ls) * 0.03)], ls[int(len(ls) * 0.97)]

def retint(im, src_range, lut_pack):   # a white piece takes the dark king's colouring: its shading mapped onto the king's luminance span
    lut, dlo, dhi = lut_pack; slo, shi = src_range
    px = im.load(); w, h = im.size; out = Image.new("RGBA", im.size); op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0: op[x, y] = (0, 0, 0, 0); continue
            L = 0.299 * r + 0.587 * g + 0.114 * b
            t = (L - slo) / max(1, (shi - slo)); t = 0 if t < 0 else 1 if t > 1 else t
            D = int(dlo + t * (dhi - dlo)); c = lut[max(0, min(255, D))]
            op[x, y] = (c[0], c[1], c[2], a)
    return out

def chip(pawn, size=128):   # a round chip from the pawn, the capture row marker
    pw = pawn.copy(); pw.thumbnail((size - 16, size - 16), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    disc = Image.new("L", (size, size), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(disc).ellipse((2, 2, size - 3, size - 3), fill=255)
    base = Image.new("RGBA", (size, size), (34, 30, 26, 255)); base.putalpha(disc)
    out.alpha_composite(base); out.alpha_composite(pw, ((size - pw.width) // 2, (size - pw.height) // 2))
    return out

sizes = {}
for src_set, cid in COURTS.items():
    d = os.path.join(OUT, cid); os.makedirs(d, exist_ok=True)
    whites = {}
    for code, name in PIECES.items():
        im = bleed(key_out(Image.open(os.path.join(SRC, "sets", src_set, name + ".png"))))
        whites[code] = crop_scale(im, H)
        whites[code].save(os.path.join(d, "w" + code + ".png"), optimize=True)
    wk = whites["K"]; dk = crop_scale(bleed(key_out(Image.open(os.path.join(SRC, "sets", src_set, "dark.png")))), H)
    lutp = lum_lut(dk); src_rng = lum_range(wk)
    dk.save(os.path.join(d, "bK.png"), optimize=True)   # the painted dark king itself
    for code in "QRBNP":
        retint(whites[code], src_rng, lutp).save(os.path.join(d, "b" + code + ".png"), optimize=True)
    chip(whites["P"]).save(os.path.join(d, "capW.png")); chip(retint(whites["P"], src_rng, lutp)).save(os.path.join(d, "capB.png"))
    board = BOARDS.get(src_set, "walnut")
    # the squares: the light tile as painted; the dark tile lifted 30 percent toward the light one, so a dark piece still
    # reads on a dark square at 45 px (seen on the live board, 25 Oct 2026)
    tl = Image.open(os.path.join(SRC, "boards", board + "-light.png")).convert("RGB").resize((256, 256), Image.LANCZOS)
    td = Image.open(os.path.join(SRC, "boards", board + "-dark.png")).convert("RGB").resize((256, 256), Image.LANCZOS)
    tl.save(os.path.join(d, "tileL.jpg"), "JPEG", quality=86, optimize=True)
    Image.blend(td, tl, 0.30).save(os.path.join(d, "tileD.jpg"), "JPEG", quality=86, optimize=True)
    total = sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d))
    sizes[cid] = total
    print("%-12s board %-10s white king luminance %s, dark king span %s  %d KB" % (cid, board, src_rng, (lutp[1], lutp[2]), total // 1024))
big = [(c, s) for c, s in sizes.items() if s > 2 * 1024 * 1024]
print("FAIL: over 2 MB: " + str(big) if big else "PASS")
