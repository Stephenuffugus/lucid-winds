import re, os, json, sys
R='/workspaces/lucid-winds/'
DRY = '--write' not in sys.argv
def parse(fn):
    s=open(R+fn).read()
    games=[]; cur=None
    for line in s.split('\n'):
        m=re.match(r'^### (.+)$', line)
        if m:
            cur={'name':m.group(1).strip(),'meta':'','path':'','bg':'','rows':[],'css':[]}; games.append(cur); mode=None; continue
        if not cur: continue
        if not cur['meta'] and re.match(r'^`[a-z0-9-]+` · ', line): cur['meta']=line; continue
        if not cur['path'] and re.match(r'^`[^`]+`$', line): cur['path']=line.strip('`'); continue
        if line.startswith('**Background wanted:**'): cur['bg']=line.replace('**Background wanted:**','').strip(); continue
        if line.startswith('**Art to paint:**'): mode='art'; continue
        if line.startswith('**CSS to do:**'): mode='css'; continue
        if line.startswith('**'): mode=None; continue
        if mode=='art' and line.startswith('| `'):
            cells=[c.strip() for c in line.strip('|').split('|')]
            if len(cells)>=3: cur['rows'].append(cells[:3])
        if mode=='css' and line.startswith('- '): cur['css'].append(line[2:].strip())
    return games
nat=parse('FLEET-ART-DETAIL-NATIVES.md'); sat=parse('FLEET-ART-DETAIL-SATELLITES.md')
VENDORED={'tomato-man','abduct-a-chameleon','glyph-forge','litter-bug','sweet-spot','tarot-run','sixfold','letter-launch','skitterlings','wild-wardens','tally','hunch'}
out=[]; missing=[]
for g in nat+sat:
    mm=re.match(r'^`([a-z0-9-]+)` · (native|satellite) · ([^·]+) ·.*impact (\d)/5 · effort (\w)', g['meta'])
    if not mm: missing.append((g['name'],'meta')); continue
    slug,kind,genre,impact,effort=mm.groups(); genre=genre.strip()
    if kind=='native':
        pid=slug[len('play-'):] if slug.startswith('play-') else slug
        folder='assets/games/'+pid+'/'; page='play/'+pid+'.html'
        if not os.path.exists(R+page): missing.append((g['name'],page)); 
    else:
        folder='satellites/'+slug+'/'; page=folder+'index.html'
        if slug in VENDORED: folder='docs/art-lists/'+slug+'/'
        elif not os.path.isdir(R+'satellites/'+slug): missing.append((g['name'],'no folder satellites/'+slug)); continue
    out.append({'name':g['name'],'slug':slug,'kind':kind,'genre':genre,'impact':int(impact),'effort':effort,'folder':folder,'page':page,'bg':g['bg'],'rows':g['rows'],'css':g['css'],'vendored':slug in VENDORED})
print('games parsed', len(nat), len(sat), 'usable', len(out), 'rows total', sum(len(g['rows']) for g in out))
print('missing/skipped', missing[:12])
json.dump(out, open('/tmp/claude-1000/-workspaces-lucid-winds/ee8bf60f-bf23-4bbe-99e3-cacf1c6deb3b/scratchpad/artlists.json','w'))
