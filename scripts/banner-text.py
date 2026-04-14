#!/usr/bin/env python3
"""Bake category text onto a banner PNG at source resolution.

Usage:
    python3 scripts/banner-text.py <source.png> <dest.png> "LABEL"
"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
GOLD = (232, 212, 140)
CREAM = (232, 220, 200)
SHADOW = (0, 0, 0, 180)

def main():
    src, dst, label = sys.argv[1], sys.argv[2], sys.argv[3].upper()
    img = Image.open(src).convert('RGBA')
    w, h = img.size

    # Target text width ~55% of banner width
    font_size = 40
    while True:
        font = ImageFont.truetype(FONT, font_size)
        bbox = font.getbbox(label)
        tw = bbox[2] - bbox[0]
        if tw > w * 0.55 or font_size > 400:
            break
        font_size += 4

    bbox = font.getbbox(label)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (w - tw) // 2 - bbox[0]
    y = (h - th) // 2 - bbox[1]

    # Shadow layer (blurred dark copy)
    shadow_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_layer)
    sd.text((x + 6, y + 6), label, font=font, fill=SHADOW)
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=8))
    img = Image.alpha_composite(img, shadow_layer)

    # Gold text with subtle cream outline
    d = ImageDraw.Draw(img)
    for dx in [-2, 0, 2]:
        for dy in [-2, 0, 2]:
            if dx or dy:
                d.text((x + dx, y + dy), label, font=font, fill=(20, 16, 8))
    d.text((x, y), label, font=font, fill=GOLD)

    img.convert('RGB').save(dst, 'PNG', optimize=True)
    print(f'Wrote {dst} ({w}x{h}, font {font_size}pt)')

if __name__ == '__main__':
    main()
