#!/usr/bin/env python3
"""
shrink-screenshot.py — compress a screenshot to under 1 MB for Pi review.

Usage:
    python3 scripts/shrink-screenshot.py <input.png>
    python3 scripts/shrink-screenshot.py <input.png> --max-mb=0.95
    python3 scripts/shrink-screenshot.py <input.png> --out=path/to/output.jpg

Strategy:
    1. If input is PNG, try lossless palette quantization first
       (TinyPNG-equivalent — best quality, often enough).
    2. If still too big, save as JPEG at quality 90, then 85, 80, 75, 70.
    3. If JPEG at 70 still too big, downscale 90% and retry.
    4. Stops at the first variant under target size.

Outputs alongside the input by default with a -compressed suffix.
"""
import argparse
import io
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow not installed. Run: pip install Pillow")


def try_save(img, fmt, **kwargs):
    buf = io.BytesIO()
    img.save(buf, format=fmt, **kwargs)
    return buf.getvalue()


def shrink(input_path: Path, target_bytes: int, out_path: Path) -> tuple[bytes, str]:
    img = Image.open(input_path)
    orig_size = input_path.stat().st_size
    print(f"  input: {input_path.name} — {orig_size/1024/1024:.2f} MB ({img.width}x{img.height}, {img.mode})")

    # Step 1: lossless PNG palette quantization (only if PNG and has alpha
    # or palette doesn't lose detail).
    if input_path.suffix.lower() == ".png":
        try:
            quantized = img.convert("RGBA").quantize(method=Image.Quantize.MEDIANCUT, colors=256)
            data = try_save(quantized, "PNG", optimize=True)
            if len(data) <= target_bytes:
                print(f"  win: PNG quantize 256 colors → {len(data)/1024/1024:.2f} MB")
                return data, ".png"
        except Exception as e:
            print(f"  PNG quantize skipped: {e}")

    # Step 2: JPEG at descending quality.
    rgb = img.convert("RGB") if img.mode in ("RGBA", "LA", "P") else img
    for q in (92, 88, 84, 80, 76, 72, 68):
        data = try_save(rgb, "JPEG", quality=q, optimize=True, progressive=True)
        print(f"  try: JPEG q={q} → {len(data)/1024/1024:.2f} MB", end="")
        if len(data) <= target_bytes:
            print("  ✓")
            return data, ".jpg"
        print()

    # Step 3: downscale, retry JPEG.
    for scale in (0.9, 0.8, 0.7, 0.6):
        w, h = int(img.width * scale), int(img.height * scale)
        scaled = rgb.resize((w, h), Image.Resampling.LANCZOS)
        for q in (84, 78, 72):
            data = try_save(scaled, "JPEG", quality=q, optimize=True, progressive=True)
            print(f"  try: scale {int(scale*100)}% JPEG q={q} → {w}x{h}, {len(data)/1024/1024:.2f} MB", end="")
            if len(data) <= target_bytes:
                print("  ✓")
                return data, ".jpg"
            print()

    sys.exit(f"  ✗ could not get under {target_bytes/1024/1024:.2f} MB even at 60% scale, q=72")


def main():
    p = argparse.ArgumentParser(description="Compress a screenshot to under N MB.")
    p.add_argument("input", type=Path)
    p.add_argument("--max-mb", type=float, default=0.95,
                   help="Target ceiling in MB. Default 0.95 leaves headroom under Pi's 1 MB cap.")
    p.add_argument("--out", type=Path, default=None,
                   help="Output path. Default: <input>-compressed.<ext> next to the input.")
    args = p.parse_args()

    if not args.input.exists():
        sys.exit(f"not found: {args.input}")

    target_bytes = int(args.max_mb * 1024 * 1024)
    out = args.out

    print(f"shrink: target ≤ {args.max_mb:.2f} MB")
    data, ext = shrink(args.input, target_bytes, out)

    if out is None:
        out = args.input.with_name(args.input.stem + "-compressed" + ext)
    out.write_bytes(data)
    print(f"  saved: {out} — {len(data)/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
