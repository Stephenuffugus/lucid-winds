"""Rebuild the pictures the frame triage page publishes, from the game's own frames.

  sheets/<id>.jpg  4 frames across, 240 px cells, grey 111,112,118, JPEG q80 (the page's tiles)
  refs/<id>.jpg    4 frames across, 360 px cells, same grey, JPEG q86 (the "reference sheet" and
                   the "frame to fix" crop the page offers for ChatGPT)
  test-upload.png  a fake ChatGPT result for kit-test.cjs

Frame order and folders come from manifest.json (one entry per character, 45 in all).
Run from this folder:  python3 make_sheets.py
The published sheets were made by an earlier inline script with the same layout, so a rebuild is
the same picture but not byte-identical.
"""
import json, os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.join(HERE, '..', '..', '..', 'satellites', 'stream-hop')
BG = (111, 112, 118)
man = json.load(open(os.path.join(HERE, 'manifest.json')))
def sheet(c, cell, pad, q, out):
    rows = (len(c['frames']) + 3) // 4
    s = Image.new('RGB', (4 * cell, rows * cell), BG)
    for i, f in enumerate(c['frames']):
        im = Image.open(os.path.join(GAME, c['folder'], f + '.png')).convert('RGBA')
        box = cell - 2 * pad
        k = min(box / im.width, box / im.height)
        w, h = max(1, round(im.width * k)), max(1, round(im.height * k))
        im = im.resize((w, h), Image.LANCZOS)
        s.paste(im, ((i % 4) * cell + (cell - w) // 2, (i // 4) * cell + (cell - h) // 2), im)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    s.save(out, quality=q, optimize=True, progressive=True)
for c in man:
    sheet(c, 240, 10, 80, os.path.join(HERE, 'sheets', c['id'] + '.jpg'))
    sheet(c, 360, 14, 86, os.path.join(HERE, 'refs', c['id'] + '.jpg'))
t = Image.new('RGB', (512, 512), (255, 0, 255))
t.paste(Image.open(os.path.join(HERE, 'refs', 'sasquatch.jpg')).crop((360, 0, 720, 360)).resize((400, 400)), (56, 56))
t.save(os.path.join(HERE, 'test-upload.png'))
print('built', len(man), 'characters')
