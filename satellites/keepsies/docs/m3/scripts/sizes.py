import os, sys, re
sys.path.append("/home/codespace/.local/lib/python3.14/site-packages")
from PIL import Image
root = sys.argv[1]
rows = []
for dp, dn, fn in os.walk(root):
    for f in sorted(fn):
        p = os.path.join(dp, f)
        rel = os.path.relpath(p, root)
        b = os.path.getsize(p)
        ext = f.rsplit('.',1)[-1].lower()
        dim = ''
        mode = ''
        alpha = ''
        if ext in ('png','jpg','jpeg','webp'):
            try:
                im = Image.open(p)
                dim = '%dx%d' % im.size
                mode = im.mode
                if im.mode in ('RGBA','LA') or (im.mode=='P' and 'transparency' in im.info):
                    a = im.convert('RGBA').getchannel('A')
                    mn, mx = a.getextrema()
                    # fraction transparent
                    hist = a.histogram()
                    tot = sum(hist)
                    zero = hist[0]
                    alpha = 'a[%d..%d] clear%.0f%%' % (mn, mx, 100.0*zero/tot)
            except Exception as e:
                dim = 'ERR ' + str(e)
        elif ext == 'svg':
            s = open(p, encoding='utf-8', errors='replace').read()
            m = re.search(r'viewBox="([^"]+)"', s)
            w = re.search(r'<svg[^>]*\swidth="([^"]+)"', s)
            h = re.search(r'<svg[^>]*\sheight="([^"]+)"', s)
            dim = 'vb[' + (m.group(1) if m else '?') + ']'
            if w and h: dim += ' %sx%s' % (w.group(1), h.group(1))
            cc = 'currentColor' in s
            mode = 'cc' if cc else 'nocc'
            if '<image' in s: mode += ' +embedded-image'
        rows.append((rel, b, dim, mode, alpha))
for r in sorted(rows):
    print('%-48s %9d  %-26s %-6s %s' % r)
