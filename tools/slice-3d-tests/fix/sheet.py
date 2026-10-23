import sys, glob, os
from PIL import Image, ImageDraw
src, pat, outp, cols = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 5
fs = sorted(glob.glob(os.path.join(src, pat)))
ims = [Image.open(f).convert('RGB') for f in fs]
w, h = ims[0].size; s = 0.5
tw, th = int(w * s), int(h * s)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + 16)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * tw, (i // cols) * (th + 16)
    sheet.paste(im.resize((tw, th)), (x, y + 16))
    d.text((x + 4, y + 2), os.path.basename(f)[:40], fill=(255, 255, 0))
sheet.save(outp)
print(outp, sheet.size, len(ims))
