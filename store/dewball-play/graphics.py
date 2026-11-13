"""DEWBALL Play graphics (13 Nov 2026), all from the game's own pictures; nothing here draws new art.
  frame-land.png                 the kit frame: the game's own night green (#0d100c), a gold line (#c8a84b) round a
                                 clear 1830 x 824 window (one landscape raw) under a headline band
  play-shot-1..8.png             1920 x 1080 landscape shots: each raw from shoot.mjs in the window, the headline from
                                 kit.json in Roboto (the type Android draws the game's own sans in), cream on the band
  feature-graphic-1024x500.png   a real capture (kit.json feature.src), the game's title set the way its menu sets it
                                 (cream, heavy, wide spaced, a gold glow) and the game's own icon; no alpha
  play-icon-512.png              the game's icons/icon-512.png flattened onto its own background, no alpha
compose.mjs (tools/store-kit) only makes portrait 1080 x 1920 frames, so the landscape set is composed here.
Roboto (Apache 2.0) is read from FONTS below; fetch it once from Google Fonts if the box has none (BUILD.md, step 5).
Run after shoot.mjs:  python3 store/dewball-play/graphics.py"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import json, os, sys
KIT = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(KIT, '..', '..'))
GAME = os.path.join(ROOT, 'satellites', 'dewball')
FONTS = os.environ.get('DEWBALL_FONTS', '/tmp/claude-1000/dewball-kit/fonts')
K = json.load(open(os.path.join(KIT, 'kit.json')))
BG = (13, 16, 12); GOLD = (200, 168, 75); CREAM = (232, 220, 200); SAGE = (122, 179, 86)
W, H = 1920, 1080
WX, WY, WW, WH = K['frame']['window']
HX, HY, HW, HH = K['frame']['headBox']

def font(weight, size):
    return ImageFont.truetype(os.path.join(FONTS, 'roboto-%d.ttf' % weight), size)

def frame():
    im = Image.new('RGBA', (W, H), BG + (255,))
    glow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(glow).ellipse((260, -260, W - 260, 330), fill=80)
    glow = glow.filter(ImageFilter.GaussianBlur(110))
    im = Image.composite(Image.new('RGBA', (W, H), (36, 44, 28, 255)), im, glow)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((WX - 7, WY - 7, WX + WW + 6, WY + WH + 6), radius=34, outline=GOLD + (255,), width=4)
    hole = Image.new('L', (W, H), 255)
    ImageDraw.Draw(hole).rounded_rectangle((WX, WY, WX + WW - 1, WY + WH - 1), radius=28, fill=0)
    im.putalpha(hole)
    im.save(os.path.join(KIT, 'frame-land.png'), optimize=True)
    return im

def headline(im, text):
    d = ImageDraw.Draw(im)
    size = 92
    while size > 40:
        f = font(900, size)
        b = d.textbbox((0, 0), text, font=f)
        if b[2] - b[0] <= HW and b[3] - b[1] <= HH: break
        size -= 2
    b = d.textbbox((0, 0), text, font=f)
    x = HX + (HW - (b[2] - b[0])) // 2 - b[0]
    y = HY + (HH - (b[3] - b[1])) // 2 - b[1]
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((x, y), text, font=f, fill=GOLD + (120,))
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    im.alpha_composite(sh)
    ImageDraw.Draw(im).text((x, y), text, font=f, fill=CREAM + (255,))

def shots(fr):
    for s in K['shots']:
        src = os.path.join(ROOT, s['src'])
        if not os.path.exists(src):
            print('MISSING raw', s['src']); continue
        raw = Image.open(src).convert('RGB')
        if raw.size != (WW, WH):
            raw = raw.resize((WW, WH), Image.LANCZOS)
        im = Image.new('RGBA', (W, H), BG + (255,))
        im.paste(raw, (WX, WY))
        im.alpha_composite(fr)
        headline(im, s['head'])
        out = os.path.join(KIT, s['out'])
        im.convert('RGB').save(out, optimize=True)
        if os.path.getsize(out) > 1000000:
            im.convert('RGB').quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(out, optimize=True)
        print(s['out'], os.path.getsize(out), 'bytes')

def title(text, size):
    """the menu's h1: cream, weight 800 (Roboto Black on a phone), letter spacing .06em, a gold glow"""
    f = font(900, size); sp = round(size * 0.06)
    widths = [f.getbbox(c)[2] for c in text]
    tw = sum(f.getlength(c) for c in text) + sp * (len(text) - 1)
    pad = size
    im = Image.new('RGBA', (int(tw) + 2 * pad, int(size * 1.4) + 2 * pad), (0, 0, 0, 0))
    def draw(dr, fill):
        x = pad
        for c in text:
            dr.text((x, pad), c, font=f, fill=fill); x += f.getlength(c) + sp
    glow = Image.new('RGBA', im.size, (0, 0, 0, 0)); draw(ImageDraw.Draw(glow), GOLD + (150,))
    im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(size * 0.22)))
    shadow = Image.new('RGBA', im.size, (0, 0, 0, 0)); draw(ImageDraw.Draw(shadow), (0, 0, 0, 150))
    im.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(4)), (0, 3))
    draw(ImageDraw.Draw(im), CREAM + (255,))
    return im.crop(im.getbbox())

def feature():
    fe = K['feature']
    raw = Image.open(os.path.join(ROOT, fe['src'])).convert('RGB')
    x0, y0, cw = fe['crop']                         # a 2.048:1 crop of the raw, scaled to 1024 x 500
    ch = round(cw * 500 / 1024)
    bg = raw.crop((x0, y0, x0 + cw, y0 + ch)).resize((1024, 500), Image.LANCZOS)
    shade = Image.linear_gradient('L').rotate(90).resize((1024, 500)).point(lambda v: int(max(0, 255 - v * 1.6)))
    bg = Image.composite(Image.new('RGB', (1024, 500), BG), bg, shade.point(lambda v: int(v * 0.85)))
    im = bg.convert('RGBA')
    ic = Image.open(os.path.join(GAME, 'icons', 'icon-512.png')).convert('RGBA')
    # the icon's ball without its square: a circle mask round the ball (the art's ring sits at r about 152 of 256)
    m = Image.new('L', ic.size, 0); ImageDraw.Draw(m).ellipse((105, 105, 407, 407), fill=255)
    ball = Image.new('RGBA', ic.size, (0, 0, 0, 0)); ball.paste(ic, (0, 0), m)
    ball = ball.crop((105, 105, 407, 407)).resize((118, 118), Image.LANCZOS)
    t = title('Dewball', 100)
    gap = 26
    total = ball.width + gap + t.width
    x = 40; cy = 250
    sh = Image.new('RGBA', ball.size, (0, 0, 0, 0)); sh.putalpha(ball.getchannel('A').point(lambda v: int(v * 0.6)))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)), (x + 4, cy - ball.height // 2 + 8))
    im.alpha_composite(ball, (x, cy - ball.height // 2))
    im.alpha_composite(t, (x + ball.width + gap, cy - t.height // 2 - 6))
    im.convert('RGB').save(os.path.join(KIT, 'feature-graphic-1024x500.png'), optimize=True)

def icon():
    ic = Image.open(os.path.join(GAME, 'icons', 'icon-512.png')).convert('RGBA')
    flat = Image.new('RGB', ic.size, BG); flat.paste(ic, (0, 0), ic)
    flat.resize((512, 512), Image.LANCZOS).save(os.path.join(KIT, 'play-icon-512.png'), optimize=True)

fr = frame()
if '--frame-only' not in sys.argv:
    shots(fr); feature(); icon()
for f in ['frame-land.png', 'feature-graphic-1024x500.png', 'play-icon-512.png'] + [s['out'] for s in K['shots']]:
    p = os.path.join(KIT, f)
    if os.path.exists(p):
        im = Image.open(p); print(f, im.size, im.mode, os.path.getsize(p), 'bytes')
