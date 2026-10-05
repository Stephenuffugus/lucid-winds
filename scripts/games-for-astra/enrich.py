import json,os,re,subprocess,collections,glob
SP=os.environ['SP']; os.chdir('/workspaces/lucid-winds')
d=json.load(open(SP+'/catalog.json'))
# exit audit verdicts and defect sweep classes from today's runs
exitv={}
for l in open(SP+'/checks/exit_audit.log'):
    m=re.match(r'^(PASS|PARTIAL|GRAFT|FAIL)\s+([a-z0-9-]+)\s',l)
    if m: exitv[m.group(2)]=m.group(1)
defects={}
for l in open(SP+'/checks/defect_sweep.log'):
    m=re.match(r'^  ([a-z0-9-]+)\s{2,}(.+)$',l)
    if m and not m.group(1).isdigit(): defects[m.group(1)]=m.group(2).strip()
vend={}
for p in glob.glob('satellites/*/VENDORED.json'):
    try: v=json.load(open(p)); vend[p.split('/')[1]]=v
    except Exception: pass
vedit={}
for l in open(SP+'/checks/vendor_check.log'):
    m=re.match(r'^(EDITED|CLEAN|BEHIND|NOREPO)\s+([a-z0-9-]+)\s+(\S+)\s*(.*)$',l)
    if m: vedit[m.group(2)]=m.group(1).strip()+(' ('+m.group(4)[:60]+')' if m.group(4) else '')
def size_kb(path):
    t=0;n=0
    for r,ds,fs in os.walk(path):
        if '/node_modules' in r or '/.git' in r: continue
        for f in fs:
            try: t+=os.path.getsize(os.path.join(r,f)); n+=1
            except OSError: pass
    return round(t/1024), n
def tech(dirp):
    tags=[]; idx=os.path.join(dirp,'index.html')
    src=''
    try: src=open(idx,encoding='utf-8',errors='ignore').read()
    except OSError: pass
    allsrc=src
    for f in glob.glob(dirp+'/**/*.js',recursive=True)[:60]:
        if '/node_modules/' in f: continue
        try: allsrc+=open(f,encoding='utf-8',errors='ignore').read(200000)
        except OSError: pass
    if '_expo' in os.listdir(dirp) if os.path.isdir(dirp) else False: tags.append('Expo web build')
    if glob.glob(dirp+'/assets/index-*.js'): tags.append('Vite build')
    if re.search(r'three(\.module)?(\.min)?\.js|THREE\.',allsrc): tags.append('3D (three.js)')
    if re.search(r'getContext\(\s*["\']2d',allsrc): tags.append('canvas 2D')
    if 'sunbeam-sdk.js' in allsrc or 'Sunbeam.init' in allsrc: tags.append('earns Sunbeams')
    if re.search(r'manifest(\.webmanifest|\.json)',src) : tags.append('installable (PWA)')
    if re.search(r'navigator\.serviceWorker',allsrc): tags.append('offline worker')
    return tags
notes_names=re.compile(r'(AUDIT|HANDOFF|README|GAME_CARD|PLAN|DESIGN|STATUS|NOTES|BRIEF|PLAYTEST|ROADMAP)',re.I)
rows=[]
for x in d['featured']:
    u=x.get('url',''); sd=(re.match(r'^/satellites/([a-z0-9-]+)/',u) or [None,None])[1]
    r={'kind':'satellite' if sd else ('hub' if x.get('hub') else 'page'),'name':x['nm'],'desc':x.get('ds',''),'cat':x.get('cat',''),'url':u,'dir':sd,
       'gated':bool(x.get('beta')),'fresh':bool(x.get('fresh')),'premium':bool(x.get('premium')),'ownMusic':bool(x.get('ownMusic'))}
    if sd:
        p='satellites/'+sd; kb,n=size_kb(p); r['kb']=kb; r['files']=n; r['tech']=tech(p)
        r['docs']=sorted(f for f in os.listdir(p) if f.lower().endswith('.md') and notes_names.search(f))[:8]
        r['exit']=exitv.get(sd); r['defects']=defects.get(sd); 
        if sd in vend: r['vendored']=(vend[sd].get('repo') or vend[sd].get('upstream') or '?'); r['vendorState']=vedit.get(sd)
    rows.append(r)
for gg in d['games']:
    rid,name,cat=gg[0],gg[1],gg[2]; desc=gg[3] if len(gg)>3 else ''; soon=len(gg)>4 and gg[4]=='soon'; ext=gg[5] if len(gg)>5 else ''
    r={'kind':'native','name':name,'desc':desc,'cat':cat,'id':rid,'url':ext or '/play/'+rid+'.html','gated':soon,'soonFlag':soon,'external':bool(ext)}
    gp='games/'+rid+'.js'; pp='play/'+rid+'.html'
    r['module']=gp if os.path.exists(gp) else None; r['page']=pp if os.path.exists(pp) else None
    if r['module']: r['kb']=round(os.path.getsize(gp)/1024)
    rows.append(r)
json.dump(rows,open(SP+'/games-enriched.json','w'),indent=1)
c=collections.Counter(r['kind'] for r in rows); print('rows',len(rows),dict(c))
print('exit verdicts on carded sats:',collections.Counter(r.get('exit') for r in rows if r['kind']=='satellite'))
print('vendored:',sum(1 for r in rows if r.get('vendored')),'| with docs:',sum(1 for r in rows if r.get('docs')),'| native with module:',sum(1 for r in rows if r.get('module')),'with page:',sum(1 for r in rows if r.get('page')))
print('tech:',collections.Counter(t for r in rows for t in r.get('tech',[])))
print('sizes (KB) sats: min',min(r['kb'] for r in rows if r['kind']=='satellite'),'median',sorted(r['kb'] for r in rows if r['kind']=='satellite')[len([1 for r in rows if r['kind']=='satellite'])//2],'max',max(r['kb'] for r in rows if r['kind']=='satellite'))
