"""SIXFOLD Play graphics (13 Nov 2026), all from the game's own files; nothing here draws new art.
  frame.png                      the kit frame for compose.mjs: the icon's navy (#171d30), a gold line round a clear
                                 738 x 1640 window (the raw phone screen) under a headline band
  feature-graphic-1024x500.png   the Sunset Cliff arena (backgrounds/sunset.jpg), the Crimson Ronin and Hannya guard
                                 frames from their atlases (the foe mirrored, as the game shows it), the title screen's
                                 own wordmark and tagline (raw/wordmark.png, raw/tagline.png, captured by shoot.mjs)
  play-icon-512.png              the game's icon.svg rendered at 512 (raw/icon-512.png), flattened, no alpha
Run after shoot.mjs:  python3 store/sixfold-play/graphics.py
and after compose.mjs: python3 store/sixfold-play/graphics.py --squeeze   (any shot over 1 MB to 256 colours)"""
from PIL import Image, ImageDraw, ImageFilter
import os
GAME = '/workspaces/sixfold'
KIT = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(KIT, 'raw')
NAVY = (23, 29, 48)
GOLD = (205, 166, 79)

def frame():
    W, H = 1080, 1920
    x, y, w, h = 171, 250, 738, 1640
    im = Image.new('RGBA', (W, H), NAVY + (255,))
    # a soft lighter glow behind the headline, like the icon's vignette
    glow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(glow).ellipse((-200, -380, W + 200, 520), fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    im = Image.composite(Image.new('RGBA', (W, H), (40, 50, 82, 255)), im, glow)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((x - 6, y - 6, x + w + 5, y + h + 5), radius=40, outline=GOLD + (255,), width=4)
    hole = Image.new('L', (W, H), 255)
    ImageDraw.Draw(hole).rounded_rectangle((x, y, x + w - 1, y + h - 1), radius=34, fill=0)
    im.putalpha(hole)
    im.save(os.path.join(KIT, 'frame.png'), optimize=True)

def cell(path, idx, inset=8):
    a = Image.open(path).convert('RGBA')
    cw, ch = a.width // 3, a.height // 2
    cx, cy = (idx % 3) * cw, (idx // 3) * ch
    c = a.crop((cx + inset, cy + inset, cx + cw - inset, cy + ch - inset))
    c.putalpha(c.getchannel('A').point(lambda v: 0 if v < 48 else v))   # the atlas keeps a faint haze; drop it
    return c.crop(c.getbbox())

def feature():
    W, H = 1024, 500
    bg = Image.open(os.path.join(GAME, 'backgrounds/sunset.jpg')).convert('RGB')
    m = 28                                             # the print's paper edge stays out
    band = round((bg.width - 2 * m) * H / W)           # 760 x 371 of the 816 x 1456 portrait art
    top = 130                                          # the sun, the snow peak, the tree line
    bg = bg.crop((m, top, bg.width - m, top + band)).resize((W, H), Image.LANCZOS)
    # darken the middle so the wordmark reads, keep the edges' colour
    shade = Image.new('L', (W, H), 0)
    ImageDraw.Draw(shade).ellipse((170, -40, 854, 330), fill=150)
    shade = shade.filter(ImageFilter.GaussianBlur(70))
    bg = Image.composite(Image.new('RGB', (W, H), (14, 16, 28)), bg, shade)
    floor = Image.linear_gradient('L').resize((W, H)).point(lambda v: max(0, (v - 150) * 2))   # dusk at their feet
    bg = Image.composite(Image.new('RGB', (W, H), (12, 14, 24)), bg, floor)
    im = bg.convert('RGBA')
    # the duel: the Ronin strikes from the left, Hannya (mirrored) from the right; feet on a shared line
    ground = 452
    ronin = cell(os.path.join(GAME, 'skins/ronin.png'), 4)
    hannya = cell(os.path.join(GAME, 'skins/hannya.png'), 4).transpose(Image.FLIP_LEFT_RIGHT)
    for f, side in ((ronin, 'l'), (hannya, 'r')):
        s = 250 / f.height
        f2 = f.resize((round(f.width * s), 250), Image.LANCZOS)
        sh = Image.new('RGBA', f2.size, (0, 0, 0, 0)); sh.putalpha(f2.getchannel('A').point(lambda v: v * 0.55))
        sh = sh.filter(ImageFilter.GaussianBlur(6))
        px = 116 if side == 'l' else W - 116 - f2.width
        im.alpha_composite(sh, (px + 6, ground - f2.height + 6))
        im.alpha_composite(f2, (px, ground - f2.height))
    mark = Image.open(os.path.join(RAW, 'wordmark.png')).convert('RGBA')
    mark = mark.crop(mark.getbbox())
    mw = 560; mark = mark.resize((mw, round(mark.height * mw / mark.width)), Image.LANCZOS)
    im.alpha_composite(mark, ((W - mw) // 2, 70))
    tag = Image.open(os.path.join(RAW, 'tagline.png')).convert('RGBA')
    tag = tag.crop(tag.getbbox())
    tw = 560; tag = tag.resize((tw, round(tag.height * tw / tag.width)), Image.LANCZOS)
    im.alpha_composite(tag, ((W - tw) // 2, 70 + mark.height + 26))
    im.convert('RGB').save(os.path.join(KIT, 'feature-graphic-1024x500.png'), optimize=True)

def icon():
    ic = Image.open(os.path.join(RAW, 'icon-512.png')).convert('RGBA')
    flat = Image.new('RGB', ic.size, NAVY); flat.paste(ic, (0, 0), ic)
    flat = flat.resize((512, 512), Image.LANCZOS)
    flat.save(os.path.join(KIT, 'play-icon-512.png'), optimize=True)

def squeeze():
    # after compose.mjs: a shot over 1 MB is saved again as a 256 colour PNG (Floyd-Steinberg dither)
    for i in range(1, 9):
        p = os.path.join(KIT, 'play-shot-%d.png' % i)
        if os.path.exists(p) and os.path.getsize(p) > 1000000:
            Image.open(p).convert('RGB').quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(p, optimize=True)
            print('squeezed', os.path.basename(p), os.path.getsize(p), 'bytes')

import sys
if '--squeeze' in sys.argv:
    squeeze(); sys.exit(0)
frame(); feature(); icon()
for f in ('frame.png', 'feature-graphic-1024x500.png', 'play-icon-512.png'):
    p = os.path.join(KIT, f); im = Image.open(p); print(f, im.size, im.mode, os.path.getsize(p), 'bytes')
