import json,os,collections
SP=os.environ['SP']
rows=json.load(open(SP+'/games-enriched.json'))
STORE={'flock-the-world':'ON SALE: Google Play ($0.99, live since 17 Sep 2026). Steam package prepared (store/ftw-steam), not live.',
 'tiny-world':'ON SALE: Google Play as Pixel Petri (published 4 Oct 2026; the Play app is the live page, so every deploy reaches buyers).',
 'tumble':'Google Play submission PREPARED, waiting on Stephen\'s Play Console steps (store/tumble-play).',
 'stream-hop':'ON SALE: Steam as Jumping Jimothy (v9.4 live 18 Sep 2026; the Steam app is a vendored copy, store/jimothy-steam). itch and Play folders prepared.',
 'tally':'Listed on Listdle (daily puzzle site).','hues':'Listed on Listdle (daily puzzle site).'}
PRIVATE={'tiny-world':'private repo Stephenuffugus/tiny-world (design docs, tests, STATUS.md there); this folder is its deploy output, never edit it',
 'lumen':'private repo /workspaces/lumen; this folder is its deploy output, never edit it',
 'pixelmeba':'built from its own repo (this folder is a deploy output, stamped by version.json); never edit it'}
EXIT={'PASS':'has its own way back to the arcade','PARTIAL':'a way back that works but is off the studio contract','GRAFT':'no exit of its own; the arcade\'s injected exit button is the way back','FAIL':'STRANDED: no way back to the arcade except the browser back button'}
def flags(r):
    t=[]
    if r.get('gated'): t.append('DEV-GATED (hidden from players)' if r['kind']!='native' else 'SOON (not open yet)')
    else: t.append('open to players')
    if r.get('fresh'): t.append('marked new')
    if r.get('premium'): t.append('premium')
    if r.get('ownMusic'): t.append('own music')
    return ', '.join(t)
def entry(r):
    L=[f"#### {r['name']}"]
    L.append(f"- **What it is:** {r['desc']}" if r['desc'] else "- **What it is:** (no card description)")
    L.append(f"- **Status:** {flags(r)}")
    if r.get('dir') in STORE: L.append(f"- **Store:** {STORE[r['dir']]}")
    if r['kind']=='satellite':
        where=f"`satellites/{r['dir']}/` in lucid-winds"
        if r.get('vendored'): where+=f"; VENDORED from `{r['vendored']}` (fix upstream and re-vendor; never hand-edit the copy)"
        if r['dir'] in PRIVATE: where+=f"; {PRIVATE[r['dir']]}"
        u0=r['url'].split('?')[0]
        if u0 and not u0.endswith('/'+r['dir']+'/'): where+=f"; card opens `{u0}`"
        L.append(f"- **Lives at:** {where}")
        tech=', '.join(r.get('tech') or []) or 'plain HTML'
        L.append(f"- **Build signals:** {tech}; {r.get('kb',0):,} KB in {r.get('files',0)} files")
        if r.get('exit'): L.append(f"- **Way home:** {EXIT[r['exit']]}")
        if r.get('defects'): L.append(f"- **Automated audit flags (candidates, not verdicts):** {r['defects']}")
        if r.get('docs'): L.append(f"- **Notes in its folder:** {', '.join('`'+d+'`' for d in r['docs'])}")
    elif r['kind']=='native':
        if r.get('external'): L.append(f"- **Lives at:** its own site, `{r['url']}` (opens in its own tab)")
        else: L.append(f"- **Lives at:** inside Lucid Winds: code `{r['module'] or 'inline in index.html'}`, standalone page `{r['page'] or 'none'}`" + (f" ({r['kb']} KB)" if r.get('kb') else ''))
    elif r['kind']=='page': L.append(f"- **Lives at:** `{r['url']}` in lucid-winds")
    return '\n'.join(L)
CATS=[('action','Action'),('puzzle','Puzzle'),('creative','Creative and toys'),('math','Math'),('word','Word'),('card','Card'),('board','Board'),('dice','Dice'),('party','Party'),('pattern','Pattern and memory'),('','Uncategorised')]
out=[]
sats=[r for r in rows if r['kind'] in ('satellite','page')]
nat=[r for r in rows if r['kind']=='native']
cnt=collections.Counter(r['cat'] for r in sats)
out.append('## 6. Every arcade game, by category\n')
out.append('Each card on the arcade (`lucidwinds.com/portal/`) that opens its own game. The description is the card\'s own player facing sentence, word for word.\n')
for key,label in CATS:
    g=sorted([r for r in sats if (r['cat'] or '')==key],key=lambda r:r['name'].lower())
    if not g: continue
    out.append(f"### {label} ({len(g)})\n")
    out.extend(entry(r)+'\n' for r in g)
out.append('## 7. The mini games inside Lucid Winds\n')
out.append('Lucid Winds (the flagship garden app) carries its own games: each one earns Sunbeams toward a one of one plant, and each also has a standalone card on the arcade. Code lives in `games/<id>.js` (loaded on demand) or inline in `index.html`; the standalone pages are `play/<id>.html`. The full engineering inventory is `GAMES_MANIFEST.md` (May 2026).\n')
for key,label in CATS:
    g=sorted([r for r in nat if (r['cat'] or '')==key],key=lambda r:r['name'].lower())
    if not g: continue
    out.append(f"### {label} ({len(g)})\n")
    out.extend(entry(r)+'\n' for r in g)
open(SP+'/doc-catalog.md','w').write('\n'.join(out))
# worklists
gated=sorted([r['name'] for r in rows if r['gated'] and r['kind']!='native'],key=str.lower)
soon=sorted([r['name'] for r in rows if r['gated'] and r['kind']=='native'],key=str.lower)
stranded=sorted([r['name'] for r in sats if r.get('exit')=='FAIL'],key=str.lower)
graft=sorted([r['name'] for r in sats if r.get('exit')=='GRAFT'],key=str.lower)
partial=sorted([r['name'] for r in sats if r.get('exit')=='PARTIAL'],key=str.lower)
flagged=sorted([(r['name'],r['defects']) for r in sats if r.get('defects')],key=lambda x:x[0].lower())
nodesc=sorted([r['name'] for r in rows if not r['desc']])
json.dump({'gated':gated,'soon':soon,'stranded':stranded,'graft':graft,'partial':partial,'flagged':flagged,'nodesc':nodesc,
 'counts':{'sats':sum(1 for r in rows if r['kind']=='satellite'),'pages':sum(1 for r in rows if r['kind']=='page'),'native':len(nat),'open':sum(1 for r in rows if not r['gated']),'all':len(rows)},
 'cats':dict(cnt)},open(SP+'/doc-lists.json','w'),indent=1)
print('catalog section chars',sum(len(x) for x in out),'| gated',len(gated),'soon',len(soon),'stranded',len(stranded),'graft',len(graft),'partial',len(partial),'flagged',len(flagged),'no desc',nodesc)
