import re, collections
rows = []
for line in open('/tmp/claude-1000/-workspaces-lucid-winds/c614e34d-7999-40c8-ad65-9b1cec65bb8b/scratchpad/kp/sizes.txt'):
    parts = line.split()
    if not parts: continue
    f = parts[0]; b = int(parts[1]); rest = ' '.join(parts[2:])
    rows.append((f, b, rest))
groups = collections.OrderedDict()
order = ['assets/a_statues', 'assets/b_fixes', 'assets/c_screens', 'assets/d_icons', 'assets/e_store', 'previews', '.']
for g in order: groups[g] = []
for f, b, rest in rows:
    d = f.rsplit('/', 1)[0] if '/' in f else '.'
    groups.setdefault(d, []).append((f, b, rest))
def dims(rest):
    m = re.match(r'(\d+x\d+)', rest)
    if m: return m.group(1)
    m = re.search(r'vb\[([^\]]+)\]', rest)
    if m:
        v = m.group(1).split()
        return 'svg ' + v[2] + 'x' + v[3]
    return ''
for g, items in groups.items():
    if not items: continue
    # merge base names
    base = collections.OrderedDict()
    for f, b, rest in items:
        n = f.rsplit('/', 1)[-1]; stem, ext = n.rsplit('.', 1)
        base.setdefault(stem, []).append((ext, b, rest))
    tot = sum(b for _, b, _ in items)
    print('\n### %s (%d files, %.1f KB)\n' % (g, len(items), tot / 1024.0))
    print('| file | formats | pixels | bytes |')
    print('|---|---|---|---|')
    for stem, lst in base.items():
        exts = '+'.join(e for e, _, _ in lst)
        px = ''
        for e, _, r in lst:
            if e != 'svg': px = dims(r); break
        if not px: px = dims(lst[0][2])
        bts = ' / '.join(str(b) for _, b, _ in lst)
        print('| %s | %s | %s | %s |' % (stem, exts, px, bts))
