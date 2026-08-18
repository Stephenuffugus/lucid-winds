#!/usr/bin/env python3
"""Build the Windows .ico for Jumping Jimothy from the SAME hero art the capsules use.

    python3 store/jimothy-steam/capsules/icon.py

WHY THIS EXISTS. STEAM_SUBMIT.md lists two honest gaps in the exe, and the first
is "no icon and no version metadata are embedded... and it needs an .ico that does
not exist yet anyway". This makes the .ico. Embedding it still needs rcedit under
wine, or one `npm run dist:win` on a Windows box.

WHY NOT THE EXISTING ICON. assets/icons/jimothy-512.png is the paper keyart: a
wordmark, a skyline, Mount Rainier and a small raccoon. Lovely at 512, and at the
16px a Windows taskbar actually draws it is an unreadable smudge, because an icon
gets ONE shape. So this crops tight to the raccoon, on the capsule's own dark
ground, so the exe matches what a Steam player sees everywhere else.

⛔ An icon is not done until you have looked at the 16px, not the 256px. Every
size is written out beside the .ico for exactly that reason.
"""
from PIL import Image, ImageDraw
import pathlib

ROOT = pathlib.Path("/workspaces/lucid-winds")
HERO = ROOT / "satellites/stream-hop/assets/hero/idle.png"
OUT = ROOT / "store/jimothy-steam/capsules/out"
OUT.mkdir(parents=True, exist_ok=True)

# the capsule ground, sampled from header_capsule's dark city
BG_TOP, BG_BOT = (18, 26, 22), (8, 12, 10)
SIZES = [256, 128, 64, 48, 32, 24, 16]

hero = Image.open(HERO).convert("RGBA")
hero = hero.crop(hero.getbbox())          # trim the transparent margin first

def render(px):
    """One square icon at px.

    ⛔ TWO CROPS, judged off the contact sheet rather than assumed. The first pass
    used one crop for every size and at 16px it was a pale blob: the face only
    resolved at 32 and up, and 16 is exactly what the taskbar and Alt-Tab draw. So
    below 32 the icon is the HEAD, filling the frame. Icon sets do this routinely.
    ⛔ The first pass also drew a 1px #7ab356 rim. At 16px a hairline is a large
    fraction of the icon and it read as a green box competing with the animal.
    The rim is now dark and only on the big sizes, where it is an edge, not a frame.
    """
    im = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for y in range(px):                    # vertical gradient ground
        t = y / max(1, px - 1)
        d.line([(0, y), (px, y)], fill=tuple(
            int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3)) + (255,))

    small = px <= 32
    if small:
        # head and shoulders: the top 62% of the animal, centred on the face.
        src = hero.crop((0, 0, hero.width, int(hero.height * 0.62)))
        fill, top = 1.34, -0.06
    else:
        src, fill, top = hero, 1.06, 0.06

    scale = (px * fill) / src.width
    w, h = max(1, round(src.width * scale)), max(1, round(src.height * scale))
    resized = src.resize((w, h), Image.LANCZOS)
    im.alpha_composite(resized, (round((px - w) / 2), round(px * top)))

    if not small:
        d.rectangle([0, 0, px - 1, px - 1], outline=(10, 16, 12, 140))
    return im

frames = [render(px) for px in SIZES]
for px, im in zip(SIZES, frames):
    im.convert("RGB").save(OUT / f"icon_{px}.png")

ico = OUT / "jimothy.ico"
frames[0].save(ico, format="ICO", sizes=[(px, px) for px in SIZES])
print(f"wrote {ico.relative_to(ROOT)}  sizes {', '.join(str(s) for s in SIZES)}")

# a contact sheet, so the small sizes get LOOKED at rather than assumed
pad, x = 12, 12
sheet = Image.new("RGB", (sum(SIZES) + pad * (len(SIZES) + 1), 256 + pad * 2 + 18), (26, 26, 26))
for px, im in zip(SIZES, frames):
    sheet.paste(im.convert("RGB"), (x, pad + (256 - px)))
    ImageDraw.Draw(sheet).text((x, pad + 256 + 4), f"{px}", fill=(180, 180, 180))
    x += px + pad
sheet.save(OUT / "icon_contact_sheet.png")
print(f"wrote {(OUT / 'icon_contact_sheet.png').relative_to(ROOT)}  <- OPEN THIS, judge the 16 and the 24")
