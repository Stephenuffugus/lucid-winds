"""Draws the three app icons. Reproducible, no binary blobs pasted in by hand.
   python3 tools/make_icons.py

   The mark is the top itself, close up, spinning, with the red heavy side
   coming round. That red dot is the game's whole mechanic in one pixel, so it
   is the last thing allowed to shrink. Two earlier drafts failed for the same
   reason and are worth remembering: concentric rings around a small top read as
   a target at 48px, not as a top, and a warm ground that only differs from the
   frame by a few values reads as flat black on a phone."""
from PIL import Image, ImageDraw, ImageFilter
import os, math

DIRT   = (61, 47, 37)      # warm ground, far enough off the frame to be seen
FRAME  = (22, 15, 12)
CHALK  = (237, 230, 216)
ROPE   = (201, 162, 39)
EMBER  = (196, 68, 43)
STEEL  = (150, 162, 170)
DARK   = (40, 31, 25)

def draw(size, pad_frac):
    S = size * 4                                  # supersample, downscale at the end
    im = Image.new("RGB", (S, S), FRAME)
    d = ImageDraw.Draw(im, "RGBA")
    c = S / 2
    inner = S * (0.5 - pad_frac)                  # drawable radius after maskable padding

    # ground: one clear warm disc, not a subtle gradient nobody can see
    d.ellipse([c - inner, c - inner, c + inner, c + inner], fill=DIRT)
    for i in range(18):                           # vignette only at the very edge
        t = i / 17
        r = inner * (1 - t * 0.13)
        a = int(120 * t * t)
        d.ellipse([c - inner, c - inner, c + inner, c + inner], outline=FRAME + (a,),
                  width=max(1, int(inner * 0.016)))
        inner_ = r
    # the chalk ring, drawn as a chalk line: broken, not a machined circle
    for i in range(24):
        a0 = i * (360 / 24) + 2
        d.arc([c - inner * 0.97, c - inner * 0.97, c + inner * 0.97, c + inner * 0.97],
              a0, a0 + 11, fill=CHALK + (120,), width=int(S * 0.012))

    R = inner * 0.66                              # the top nearly fills the frame
    # spin blur: the blade is moving, so its rim is a smear and not an outline
    blur = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    bd = ImageDraw.Draw(blur)
    for i in range(16):
        t = i / 15
        rr = R * (1.0 + 0.10 * t)
        bd.ellipse([c - rr, c - rr * 0.78, c + rr, c + rr * 0.78],
                   outline=ROPE + (int(90 * (1 - t)),), width=int(S * 0.012))
    im.paste(Image.alpha_composite(im.convert("RGBA"), blur.filter(ImageFilter.GaussianBlur(S * 0.010))).convert("RGB"), (0, 0))
    d = ImageDraw.Draw(im, "RGBA")

    # contact shadow under the tip
    d.ellipse([c - R * 0.34, c + R * 0.96, c + R * 0.34, c + R * 1.14], fill=(0, 0, 0, 130))

    # the blade disc, seen from slightly above
    d.ellipse([c - R, c - R * 0.78, c + R, c + R * 0.78], fill=DARK)
    d.ellipse([c - R, c - R * 0.78, c + R, c + R * 0.78], outline=ROPE, width=int(S * 0.026))
    # a bright top face so it reads as a solid object and not a hoop
    d.ellipse([c - R * 0.80, c - R * 0.62, c + R * 0.80, c + R * 0.34], fill=(74, 58, 46))
    # teeth: the sharpness tell, cut into the rim rather than stuck onto it
    for i in range(9):
        a = i * 2 * math.pi / 9 + 0.35
        x0, y0 = c + math.cos(a) * R * 0.86, c + math.sin(a) * R * 0.67
        x1, y1 = c + math.cos(a) * R * 1.06, c + math.sin(a) * R * 0.83
        d.line([x0, y0, x1, y1], fill=STEEL, width=int(S * 0.020))
    # the tip, drawn AFTER the disc so it is not swallowed by it. Two earlier
    # drafts hid the shaft behind the blade and the mark read as a bowl; the
    # shaft protruding below the silhouette is the only thing that says "top".
    d.polygon([(c - R * 0.13, c + R * 0.52), (c + R * 0.13, c + R * 0.52),
               (c + R * 0.045, c + R * 1.06), (c - R * 0.045, c + R * 1.06)], fill=STEEL)
    d.polygon([(c - R * 0.13, c + R * 0.52), (c - R * 0.02, c + R * 0.52),
               (c - R * 0.015, c + R * 1.06), (c - R * 0.045, c + R * 1.06)],
              fill=(196, 208, 214))
    d.ellipse([c - R * 0.055, c + R * 1.00, c + R * 0.055, c + R * 1.10], fill=(196, 208, 214))

    # the core
    d.ellipse([c - R * 0.24, c - R * 0.26, c + R * 0.24, c + R * 0.12], fill=CHALK)
    # the heavy side, coming round. Never smaller than this.
    hx, hy = c + math.cos(-0.75) * R * 0.66, c + math.sin(-0.75) * R * 0.52
    d.ellipse([hx - R * 0.21, hy - R * 0.19, hx + R * 0.21, hy + R * 0.19], fill=EMBER)
    d.ellipse([hx - R * 0.21, hy - R * 0.19, hx + R * 0.21, hy + R * 0.19],
              outline=(255, 190, 170, 160), width=int(S * 0.008))
    return im.resize((size, size), Image.LANCZOS)

out = os.path.join(os.path.dirname(__file__), "..")
draw(192, 0.02).save(os.path.join(out, "icon-192.png"))
draw(512, 0.02).save(os.path.join(out, "icon-512.png"))
draw(512, 0.14).save(os.path.join(out, "icon-maskable-512.png"))   # safe zone for the circle crop
draw(48,  0.02).save(os.path.join(os.path.dirname(__file__), "icon-48-preview.png"))
print("icons written")
