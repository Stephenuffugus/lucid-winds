#!/usr/bin/env python3
"""publish/marketing/CONTACT-SHEET.png: every game's five sizes on one image, to be OPENED.

  python3 publish/tools/contact_sheet.py

marketing.mjs documents a --sheet flag that was never implemented; the first sheet was
built by a scratch script that did not survive the session (Fable review, 2026-09-02).
This one is checked in so the sheet can always be regenerated."""
import os, sys
from PIL import Image, ImageDraw
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MK = os.path.join(REPO, 'publish', 'marketing')
SIZES = ['512x384', '512x512', '200x120', '1280x720', '1280x550']
games = sorted(d for d in os.listdir(MK) if os.path.isdir(os.path.join(MK, d)))
CELL_H, PAD, LABEL = 200, 8, 14
COLS = [256, 256, 200, 320, 320]          # thumbnails: squares at half, banners at quarter
W = sum(COLS) + PAD * (len(COLS) + 1)
H = len(games) * (CELL_H + LABEL + PAD) + PAD
sheet = Image.new('RGB', (W, H), (16, 18, 14)); d = ImageDraw.Draw(sheet)
y = PAD
for g in games:
    d.text((PAD, y), g, fill=(220, 210, 190)); y += LABEL
    x = PAD
    for sz, cw in zip(SIZES, COLS):
        p = os.path.join(MK, g, sz + '.png')
        if os.path.exists(p):
            im = Image.open(p).convert('RGB'); w, h = im.size
            s = min(cw / w, CELL_H / h); im = im.resize((max(1, int(w * s)), max(1, int(h * s))), Image.LANCZOS)
            sheet.paste(im, (x, y))
        else:
            d.rectangle([x, y, x + cw, y + CELL_H], outline=(120, 40, 40)); d.text((x + 4, y + 4), 'missing ' + sz, fill=(200, 80, 80))
        d.text((x, y + CELL_H + 1), sz, fill=(140, 145, 120))
        x += cw + PAD
    y += CELL_H + PAD
out = os.path.join(MK, 'CONTACT-SHEET.png'); sheet.save(out)
print(f'wrote {out} {sheet.size[0]}x{sheet.size[1]} for {len(games)} games')
