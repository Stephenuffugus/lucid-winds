#!/usr/bin/env python3
"""Generate 1200x630 social preview cards for every /play/ game shell.

WHY THIS EXISTS
  2026-07-25 audit: 0 of 68 game shells had an og:image, so every game link
  Stephen posted to Instagram / Facebook / Twitter rendered as a bare grey
  box. A link with no picture is a link nobody taps.

WHAT IT MAKES
  play/og/<id>.jpg — the game's square card art, sharp, in a gold frame on the
  left; a blurred darkened blow-up of the same art as the backdrop; title,
  the free-to-play line, and the studio wordmark on the right.

INPUT
  play/icons/<id>-512.png (produced alongside the per-game manifests). Games
  with no card art are skipped and reported, never given a placeholder.

RUN
  python3 scripts/make_og_cards.py

NOTE ON THE FONT
  Uses DejaVu Sans Bold because it ships with the container and needs no
  network. The brand faces are Fredoka / Nunito — if these cards ever become
  a front-facing brand surface, swap FONT_BOLD/FONT_REG for the real files.
"""
import re, os, glob
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_REG  = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W, H      = 1200, 630
BG        = (13, 16, 12)     # --bg
CREAM     = (232, 220, 200)  # --cream
SAGE      = (122, 179, 86)   # --sage
GOLD      = (200, 168, 75)   # --gold


def build(gid, name, out):
    src = 'play/icons/%s-512.png' % gid
    if not os.path.exists(src):
        return False
    art = Image.open(src).convert('RGB')

    bg = art.resize((W, W), Image.LANCZOS).crop((0, (W - H) // 2, W, (W - H) // 2 + H))
    bg = bg.filter(ImageFilter.GaussianBlur(28))
    bg = Image.blend(bg, Image.new('RGB', (W, H), BG), 0.62)

    card, top = art.resize((430, 430), Image.LANCZOS), (H - 430) // 2
    bg.paste(card, (86, top))
    d = ImageDraw.Draw(bg)
    d.rectangle([86, top, 516, top + 430], outline=GOLD, width=3)

    x, maxw, size = 590, W - 590 - 80, 62
    while size > 30:
        f = ImageFont.truetype(FONT_BOLD, size)
        lines, cur = [], ''
        for word in name.split():
            t = (cur + ' ' + word).strip()
            if d.textlength(t, font=f) <= maxw:
                cur = t
            else:
                lines.append(cur); cur = word
        if cur:
            lines.append(cur)
        if len(lines) <= 2:
            break
        size -= 6

    y = (H - len(lines) * (size + 10)) // 2 - 26
    for ln in lines:
        d.text((x, y), ln, font=f, fill=CREAM); y += size + 10
    d.text((x, y + 14), 'Free to play. No ads, no sign up.',
           font=ImageFont.truetype(FONT_REG, 27), fill=SAGE)
    d.text((x, H - 92), 'SKY WOLF STUDIO',
           font=ImageFont.truetype(FONT_BOLD, 24), fill=GOLD)

    bg.save(out, quality=86, optimize=True)
    return True


def main():
    os.makedirs('play/og', exist_ok=True)
    made, skipped = 0, []
    for path in sorted(glob.glob('play/*.html')):
        s = open(path, encoding='utf-8').read()
        m = re.search(r'window\.LW_PLAY\s*=\s*\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"', s)
        if not m:
            continue
        gid, name = m.group(1), m.group(2)
        if build(gid, name, 'play/og/%s.jpg' % gid):
            made += 1
        else:
            skipped.append(gid)
    print('OG cards: %d made, %d skipped (no card art): %s'
          % (made, len(skipped), ', '.join(skipped) or 'none'))


if __name__ == '__main__':
    main()
