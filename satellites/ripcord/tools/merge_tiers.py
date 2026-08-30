"""Merges the authored Tier 2 and Tier 3 parts into sim2.js.

Run once. It rewrites the five part arrays, adds the two new drawbacks, and
renames the ids that collide.

⛔ IDS MUST BE GLOBALLY UNIQUE, NOT JUST UNIQUE WITHIN A SLOT. Tuning
modifications are stored on the config keyed by PART ID, so a blade and a bit
sharing an id would share their modifications: file the blade, and the bit gets
filed too. Three ids came back colliding across slots and are renamed here.
"""
import json, glob, re, sys

SRC = 'src/sim2.js'
s = open(SRC).read()

def load(pat):
    return json.load(open(glob.glob(pat)[0]))

streams = {
    'core':    load('tools/.wf/core-*.json'),
    'blade':   load('tools/.wf/blade-*.json'),
    'assist':  load('tools/.wf/assist-*.json'),
    'ratchet': load('tools/.wf/ratchet-*.json'),
    'bit':     load('tools/.wf/bit-*.json'),
}

# ---- 1. rename the cross slot collisions. The slot that owns the word keeps it.
RENAME = {
    ('blade',   'bolster'): ('roundel',  'Roundel'),   # a bolster is a cushion, which is an assist
    ('assist',  'chisel'):  ('barb',     'Barb'),      # a chisel is a blade
    ('assist',  'rasp'):    ('nettle',   'Nettle'),    # a rasp is a coarse file, which is a blade
    ('bit',     'rasp'):    ('caltrop',  'Caltrop'),
}
for (slot, old), (new, newname) in RENAME.items():
    for p in streams[slot]['parts']:
        if p['id'] == old:
            p['id'] = new; p['name'] = newname

# ---- 2. cores came back in two tight clusters. Spread them along the same line.
# Four cores at mass 0.0039 and charge 0.54, four at 0.0009 and 1.52, is eight
# parts sitting in two places. The ABILITY is what really separates a core, so
# the numbers were free to converge, but a catalogue where half the entries are
# numerically identical reads as a spreadsheet rather than a case of parts.
# The spread below is inside the measured band either way.
SPREAD = {
 'ballast': (0.00372, 0.58), 'granite': (0.00392, 0.54), 'windlas': (0.00404, 0.51),
 'vise':    (0.00386, 0.56), 'kite':    (0.00104, 1.46), 'reel':    (0.00092, 1.53),
 'tinder':  (0.00112, 1.42), 'wren':    (0.00086, 1.57),
}
for p in streams['core']['parts']:
    if p['id'] in SPREAD:
        p['stats']['mass'], p['stats']['charge'] = SPREAD[p['id']]

# ---- 3. render each slot's new entries
ORDER = {
 'core':    ['mass','dir','ability','charge'],
 'blade':   ['mass','radius','sharp','rest','gear','taken'],
 'assist':  ['mass','gearMul','absorb','radAdd','smash'],
 'ratchet': ['mass','height','lock','strikeHigh'],
 'bit':     ['mass','stamina','drive','stable','dash','shaft'],
}
FMT = {'mass':'%.5f','radius':'%.4f','radAdd':'%.4f','height':'%d','dir':'%d'}

def num(k, v):
    if k in FMT:
        return FMT[k] % v
    return ('%.2f' % v)

def render(slot, p):
    bits = []
    for k in ORDER[slot]:
        if k == 'ability':
            bits.append("ability: '%s'" % p['ability'])
        else:
            bits.append('%s: %s' % (k, num(k, p['stats'][k])))
    line = "    { id: '%s', name: '%s', %s, role: '%s', tier: %d" % (
        p['id'], p['name'], ', '.join(bits), p['role'], p['tier'])
    if p['tier'] == 3 and p.get('drawback'):
        line += ", drawback: '%s'" % p['drawback']
    line += ",\n      desc: %s }," % json.dumps(p['desc'])
    return line

ARRAY = {'core':'CORES','blade':'BLADES','assist':'ASSISTS','ratchet':'RATCHETS','bit':'BITS'}
for slot, data in streams.items():
    name = ARRAY[slot]
    m = re.search(r'(const %s = \[)(.*?)(\n  \];)' % name, s, re.S)
    if not m:
        print('could not find array', name); sys.exit(1)
    t2 = [p for p in data['parts'] if p['tier'] == 2]
    t3 = [p for p in data['parts'] if p['tier'] == 3]
    add  = ",\n\n    // ---- TIER 2, FORGED. One stat pushed about a quarter past the Tier 1\n"
    add += "    //      range, and another pulled back further to pay for it. Not stronger,\n"
    add += "    //      more extreme; that is what a tier is in this game.\n"
    add += '\n'.join(render(slot, p) for p in t2)
    add += "\n\n    // ---- TIER 3, RELIC. One stat at an extreme, plus a named drawback the\n"
    add += "    //      simulation actually enforces. Bosses are the only source.\n"
    add += '\n'.join(render(slot, p) for p in t3)
    s = s[:m.end(2)] + add + s[m.end(2):]

# ---- 4. the two new drawbacks, both one line of physics each
s = s.replace("""    { id: 'oneshot',   name: 'One Shot',
      desc: 'The first hit it lands can end a round; everything after it barely counts.' }
  ];""",
"""    { id: 'oneshot',   name: 'One Shot',
      desc: 'The first hit it lands can end a round; everything after it barely counts.' },
    // Two more, proposed and measured during the tier expansion. Both are a
    // change to a quantity the simulation already computes, which is the bar a
    // drawback has to clear; neither is a special case.
    { id: 'skittish',  name: 'Skittish',
      desc: 'It will slide out of the dish at a speed anything else would ride out.' },
    { id: 'shear',     name: 'Shear',
      desc: 'Every blow it lands rings back through its own teeth at full force.' }
  ];""")
s = s.replace("""      const need = K.exitNeed * g.exitNeed * (sector > 0.62 ? K.pocketMu : 1) * (a.t < a.anchor ? 6 : 1);""",
"""      // Skittish: it leaves the dish at a speed anything else would ride out.
      const need = K.exitNeed * g.exitNeed * (s.dw && s.dw.skittish ? 0.55 : 1) *
                   (sector > 0.62 ? K.pocketMu : 1) * (a.t < a.anchor ? 6 : 1);""")
s = s.replace("""      agg.wear += wear * K.burstBack / agg.spec.burstResist;""",
"""      // Shear: the striker normally takes 14 percent of the wear back. This one
      // takes all of it, so every blow it lands loosens its own teeth as much as
      // the other top's.
      agg.wear += wear * ((agg.spec.dw && agg.spec.dw.shear) ? 1 : K.burstBack) / agg.spec.burstResist;""")

open(SRC, 'w').write(s)

# ---- 5. report
import collections
by = collections.Counter()
ids = collections.Counter(re.findall(r"\{ id: '([a-z0-9-]+)'", s))
dupes = {k: v for k, v in ids.items() if v > 1}
for slot, name in ARRAY.items():
    m = re.search(r'const %s = \[(.*?)\n  \];' % name, s, re.S)
    by[slot] = len(re.findall(r"\{ id: '", m.group(1)))
print('parts per slot:', dict(by), 'total', sum(by.values()))
print('duplicate ids anywhere:', dupes or 'none')
