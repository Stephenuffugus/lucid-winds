import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__))
HEAD = re.compile(r'^(STANCE|WARDROBE AND PROPS|HOW THIS BODY WORKS)\b.*:\s*$')
def unwrap(t):
    out, buf = [], []
    for line in t.split('\n'):
        st = line.strip()
        if not st or HEAD.match(st):
            if buf: out.append(' '.join(buf)); buf = []
            if st: out.append(''); out.append(st)
            continue
        buf.append(st)
    if buf: out.append(' '.join(buf))
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out)).strip()
def js(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
s = open(os.path.join(D, 'page.src.html')).read()
chars = open(os.path.join(D, 'chars.inline.json')).read()
prompts = json.load(open(os.path.join(D, 'docprompts.json')))
poses = {}
wf = os.path.join(D, 'wf-out.json')
if os.path.exists(wf):
    w = json.load(open(wf))
    for cid, v in (w.get('blocks') or {}).items():
        if cid in prompts: continue
        prompts[cid] = {'block': unwrap(v['block'].strip()), 'frames': {}, 'left': ''}
    for p in (w.get('poses') or []):
        poses[p['frame']] = {'inGame': p['inGame'].strip(), 'pose': p['pose'].strip()}
for k, v in (('__CHARS__', chars), ('__PROMPTS__', js(prompts)), ('__POSES__', js(poses))):
    assert s.count(k) == 1, k
    s = s.replace(k, v)
open(os.path.join(D, 'jimothy-frame-triage.html'), 'w').write(s)
skel = open(os.path.join(D, 'skeleton.head.html')).read()
mock = open(os.path.join(D, 'mock.js')).read() if '--mock' in sys.argv else ''
open(os.path.join(D, 'local.html'), 'w').write(skel + ('<script>' + mock + '</script>' if mock else '') + s + '</body></html>')
print('built', len(s), 'prompts', len(prompts), 'poses', len(poses))
