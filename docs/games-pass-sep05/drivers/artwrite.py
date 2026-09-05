import json, os, re
R='/workspaces/lucid-winds/'
G=json.load(open('/tmp/claude-1000/-workspaces-lucid-winds/ee8bf60f-bf23-4bbe-99e3-cacf1c6deb3b/scratchpad/artlists.json'))
# rank from the audit's ranked table
rank={}
for line in open(R+'FLEET-ART-AUDIT-SEP04.md'):
    m=re.match(r'^\| *(\d+) *\| \*\*(.+?)\*\* \|', line)
    if m: rank[m.group(2).strip()]=int(m.group(1))
def x2(spec):
    return spec
HEAD='''# {name} art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`{folder}` under the names below; say which landed and the code side wires them.

## Conventions, read once
- Sizes in the rows are written at 1x, the size the game shows them at. Deliver full bleed plates at
  900x1600 portrait (a row that says 540x960 means that file at 900x1600) and everything else at twice
  the size the row names. Never a side over 1600 px: the host's image optimizer resizes anything bigger
  on the way out, so a 1080x1920 plate would arrive at 900x1600 anyway, resampled by a stranger.
- PNG with alpha for anything that sits on the game (pieces, parts, tiles, frames, tokens); JPG or
  WebP for full bleed plates. Your master goes in the vault and the web copy is cut under a new
  name; nothing you send is ever overwritten or shrunk in place.
- Style anchors: the midnight greenhouse palette (deep blacks, sage #7ab356, gold #c8a84b, cream
  #e8dcc8) unless the row names its own, one light direction (upper left), no text baked into a
  plate unless the row asks for it, no real trademarks or mascots, generated art is never called
  hand painted.
- The "replaces" column says what is on screen today and what the file unlocks. Rows are in the
  order they change the most.

'''
def write(g, extra_rows=None, note=None):
    name=g['name']; folder=g['folder']
    body=HEAD.format(name=name.upper(), folder=folder)
    body+='**Game:** `%s` · %s · %s · audit impact %d/5 · effort %s · audit rank %s\n\n'%(g['slug'],g['kind'],g['genre'],g['impact'],g['effort'],rank.get(name,'?'))
    if note: body+=note+'\n\n'
    if g['bg']: body+='## Background wanted\n\n'+g['bg']+'\n\n'
    rows=extra_rows if extra_rows is not None else g['rows']
    body+='## Files\n\n| file | spec | replaces |\n|---|---|---|\n'
    for r in rows: body+='| %s | %s | %s |\n'%(r[0],r[1],r[2])
    body+='\n_%d file%s._\n'%(len(rows),'' if len(rows)==1 else 's')
    return body
LB_ROWS=[
 ['`bg-alley-900x1600.jpg`','900x1600 painted night alley in the composition the drawn one now sets: brick wall with two lit windows, a green dumpster left with the lid up and a black cat on it, a chain link fence panel right, one sodium lamp top right with a puddle under it, a fire escape at the far left, trash bags and a box, near black ground band across the bottom third so cream copy reads over it','the SVG alley drawn in `alleyMarkup()` that sits behind every screen and on the HOME card; the drawing is honest but flat'],
 ['`trial-chute-988x1480.jpg`','988x1480 (2x the 494x740 field), a steel sorting chute seen from above: a hopper mouth at the top stencilled RECYCLING, two rails, a ribbed belt running down the middle, brick either side, a lamp glow top right, the belt darkening into three bin mouths at the bottom','`chuteScene()` in Sort the Recycling'],
 ['`trial-heap-988x1480.jpg`','988x1480, the inside of a dumpster: green steel walls with rust drips, the rim across the top with lamp light spilling under it, two mounds of bags and boxes rising from the bottom, a tyre and a crate half buried, everything in the grey blue heap tones so 56px junk silhouettes and a green grub read on it','`heapScene()` in Grub Hunt'],
 ['`trial-wall-988x1480.jpg`','988x1480, a brick wall with a junction box top centre (hazard stripe, a small LIVE plate), conduit running across and down both sides, cable clips, a vignette; nothing busy in the middle third where the cables and sockets are drawn','`wallScene()` in Wire Untangle'],
 ['`trial-shelf-988x1480.jpg`','988x1480, brick wall with a warm lamp pool at the top and a worn pine plank across the bottom 60px with brackets; the middle stays plain for the lid','`shelfScene()` in Pry the Lids'],
 ['`lid-640x640.png`','640x640 transparent, a tin lid seen from above: steel with a brushed radial sheen, a raised rim, a dark seam groove at 62% of the radius, a printed label ALLEY PRESERVES in the centre; no seam highlight (the code draws the gold arc)','`lidSVG()`, the gradient lid'],
 ['`jar-88x124.png`','88x124 transparent, an open glass jar with its lid leaning off, a little light in the glass','`jarSVG()`, one per lid levered off on the plank'],
 ['`dumpster-locked-520x360.png`','520x360 transparent, a closed green dumpster with a padlock and chain on the lid, BUGS ONLY stencilled on the side, wheels, a trash bag beside it, lamp glow top right','`dumpsterLockSVG()` on the locked Dumpster screen'],
 ['`bug-style-hero-1024x1024.png`','ONE painted hero bug in the game palette (rust, moss, spark, ooze, glass, ash) at 1024, cel shaded, flat vector look, facing right: this is the style reference every traced part will follow; not shipped, traced','nothing yet; the bugs are procedural SVG (`_generateBugSVG`) and stay procedural, the hero sets the `--sref` and the part vocabulary (see `PART_CATALOG.md` upstream). The 24 PNGs in assets/heads, bodies, patterns are generated ellipses and are not used by the game'],
]
AT_ROWS=[
 ['`bg-attic-900x1600.png`','900x1600, no transparency. A painted midnight attic: rafters across the top third, a round dormer window right with one cool shaft of light falling left to right, a crate stack along the floor, a hanging bulb top left, a chair nobody has sat in; roughly fifteen points of separation from the #171310 ground so the shapes read at a glance, the code holds it back with one scrim','the inline `.atticbg` SVG room (lifted this pass, still drawn)'],
 ['`dust-veil-600x600.png`','600x600 transparent, greyed felt and lint texture with uneven density, a few hair fibres, a web in one corner, about 55% coverage','the drawn grime layer in `sleeve-render.js grime()` (0.62 + 0.42 now, so the object shows through; a real texture would let it breathe)'],
 ['`shelf-plank-1080x240.png`','1080x240, tileable horizontally, painted worn pine plank with a shadow lip along the front edge','the canvas fillRect stripes the shelf strip uses'],
 ['`ticket-128x128.png`','128x128 transparent, a torn paper carnival ticket stub in cream and gold','"5 tickets" as plain text in the header'],
]
written=[]; index=[]
for g in G:
    if g['slug']=='litter-bug': rows=LB_ROWS; note='**Note from the Sep 05 pass:** the audit row for this game asked for the "24 painted part PNGs" to be used; they are flat generated silhouettes from `scripts/gen-*.js` and the live renderer never reads them. The rows below are the real ask. The game is vendored from `Stephenuffugus/Litter_Bug`; this file also lives upstream.'
    elif g['slug']=='attic': rows=AT_ROWS; note=None
    else: rows=g['rows']; note=None
    if g['slug']=='flock-the-world': g['folder']='docs/art-lists/flock-the-world/'
    if not rows: continue
    body=write(g, rows, note)
    path=R+g['folder']+'ART_ASSETS.md'
    os.makedirs(R+g['folder'], exist_ok=True)
    MARK='Written Sep 05 2026 from the fleet art audit'
    if os.path.exists(path) and MARK not in open(path).read():
        s=open(path).read()
        if '## Fleet audit rows (Sep 04)' not in s:
            s=s.rstrip()+'\n\n## Fleet audit rows (Sep 04)\n\nAdded Sep 05 from the fleet art audit. Same rules as above.\n\n| file | spec | replaces |\n|---|---|---|\n'+''.join('| %s | %s | %s |\n'%(r[0],r[1],r[2]) for r in rows)
            open(path,'w').write(s); mode='appended'
        else: mode='kept'
    else:
        open(path,'w').write(body); mode='written'
    written.append((g['name'],path,mode,len(rows)))
    index.append({'name':g['name'],'rank':rank.get(g['name'],999),'folder':g['folder'],'n':len(rows),'first':rows[0][0],'impact':g['impact'],'kind':g['kind'],'vendored':g['vendored'],'page':g['page']})
# litter bug upstream copy
lb=[g for g in G if g['slug']=='litter-bug'][0]
open('/workspaces/Litter_Bug/ART_ASSETS.md','w').write(write(lb, LB_ROWS, 'Vendored into the arcade at `satellites/litter-bug/` (the copy there is byte identical; edit here and re-vendor).'))
index.sort(key=lambda d:d['rank'])
with open(R+'ART-ASSETS-INDEX.md','w') as f:
    f.write('''# ART ASSETS INDEX, every game that needs paint (Sep 05 2026)

One `ART_ASSETS.md` per game, in the game's own folder. Natives keep theirs in `assets/games/<id>/`
(drop the files there too); satellites in `satellites/<slug>/`; the eleven vendored satellites in
`docs/art-lists/<slug>/` because their folders are byte copies of their upstream repos. Order is the
Sep 04 audit rank (the games that change the most first). "first ask" is the row that matters most.

**Where to start, by return per file:** every native's first row is a full bleed backdrop and the hook
is already live (`assets/games/bg/<id>.jpg` is picked up automatically), so a backdrop is one file for
a whole game. After that, the boards and tables (Chess is the ceiling), then Litter Bug's places and
its style hero, then The Attic's plate and veil.

| rank | game | folder | files | first ask |
|---|---|---|---|---|
''')
    for d in index:
        f.write('| %s | %s%s | `%s` | %d | %s |\n'%(d['rank'],d['name'],' (vendored)' if d['vendored'] else '',d['folder'],d['n'],d['first']))
    f.write('\n_%d games, %d files._\n\nNot listed: Whack Box and LOAF live outside this repo (`ext-` cards).\n'%(len(index),sum(d['n'] for d in index)))
print('written',len(written),'files;',sum(1 for w in written if w[2]=='appended'),'appended;',sum(d['n'] for d in index),'rows')
print([w for w in written if w[2]=='appended'][:12])
