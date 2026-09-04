#!/usr/bin/env python3
"""forge3d/meshy_api.py - drives Meshy image-to-3D over the API, no hands.

    export MESHY_API_KEY=...       (never commit it, never echo it)
    python3 tools/forge3d/meshy_api.py --pilot          # bell, moth, cleaver, orbit
    python3 tools/forge3d/meshy_api.py --ids core-bell,blade-orbit
    python3 tools/forge3d/meshy_api.py --all            # the other 40, only after
                                                        # the pilot passed meshyfit

Feeds each image from the meshy-in set as a data URI, polls the task,
downloads the GLB into tools/forge3d/meshy-out/, then you run:

    blender -b --factory-startup -P tools/forge3d/meshyfit.py -- \
        --in tools/forge3d/meshy-out

BUDGET GUARD: runs SEQUENTIALLY and stops on the first failed task, so a
bad key, an empty credit pool, or an API change costs one attempt, not
forty-four. Every non-200 prints the response body verbatim - if Meshy
has moved the endpoints since this was written, the fix is the three
constants below, and the error will say so in plain text.
"""
import base64, json, os, sys, time, zipfile, io, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'meshy-out')
# ⛔ THE DOUBLE-SPEND LEDGER. Credits are spent at the POST, but the task id used to
# live only in a local variable, so ANY death between the POST and the download
# (Ctrl-C, an OOM kill, a dropped connection, the 20-minute timeout) threw the id
# away. The only rerun guard was "is the .glb on disk", which is false in exactly
# that case, so the rerun POSTed again and paid twice. Now the id is written here
# the instant it exists and a rerun RESUMES that task instead. Sep 04 2026.
TASKS = os.path.join(HERE, 'meshy-tasks.json')
BASE = 'https://api.meshy.ai'
CREATE = '/openapi/v1/image-to-3d'          # POST
STATUS = '/openapi/v1/image-to-3d/{id}'     # GET
PILOT = ['core-bell', 'core-moth', 'blade-cleaver', 'blade-orbit']

def key():
    k = os.environ.get('MESHY_API_KEY', '').strip()
    if not k:
        sys.exit('MESHY_API_KEY is not set. export it first (and never commit it).')
    return k

def req(method, path, body=None):
    r = urllib.request.Request(BASE + path, method=method,
        headers={'Authorization': 'Bearer ' + key(),
                 'Content-Type': 'application/json'},
        data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:800]
        sys.exit('API %s %s -> HTTP %d\n%s\n(if the endpoint moved, fix the '
                 'three constants at the top of this file)' % (method, path, e.code, detail))

def tasks_load():
    try:
        with open(TASKS) as f:
            return json.load(f)
    except Exception:
        return {}

def tasks_set(name, tid):
    """Write the id to disk BEFORE polling, and fsync it. A ledger that is still in
       the OS buffer when the process is killed is not a ledger."""
    d = tasks_load()
    d[name] = tid
    tmp = TASKS + '.tmp'
    with open(tmp, 'w') as f:
        json.dump(d, f, indent=1)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, TASKS)

def tasks_clear(name):
    d = tasks_load()
    if d.pop(name, None) is not None:
        tmp = TASKS + '.tmp'
        with open(tmp, 'w') as f:
            json.dump(d, f, indent=1)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, TASKS)

def images():
    """The meshy-in set, from the zip so this works on a fresh clone."""
    z = zipfile.ZipFile(os.path.join(HERE, 'meshy-in.zip'))
    out = {}
    for n in z.namelist():
        if n.endswith('.png'):
            out[os.path.splitext(os.path.basename(n))[0]] = z.read(n)
    return out

def run(names):
    os.makedirs(OUT, exist_ok=True)
    imgs = images()
    missing = [n for n in names if n not in imgs]
    if missing:
        sys.exit('not in meshy-in.zip: %s' % ', '.join(missing))
    done = 0
    for n in names:
        dst = os.path.join(OUT, n + '.glb')
        if os.path.exists(dst):
            print('%-16s already downloaded, skipping' % n)
            continue
        # Resume an in-flight task rather than paying for it twice.
        tid = tasks_load().get(n)
        if tid:
            print('%-16s RESUMING task %s (already paid for, no new spend)' % (n, tid),
                  end='', flush=True)
        else:
            uri = 'data:image/png;base64,' + base64.b64encode(imgs[n]).decode()
            task = req('POST', CREATE, {
                'image_url': uri,
                'enable_pbr': True,
                'should_remesh': True,
                'should_texture': True,
                # retopo at the SOURCE: the first pilot came back ~300k tris,
                # my 98% decimate shredded the ring and the boolean crashed
                # blender. Meshy's own retopo keeps shape and UVs.
                'topology': 'triangle',
                'target_polycount': 30000,
            })
            tid = task.get('result') or task.get('id')
            if not tid:
                sys.exit('no task id in response: %s' % json.dumps(task)[:400])
            # Credits are now spent. Record it before ANYTHING else can fail.
            tasks_set(n, tid)
            print('%-16s task %s' % (n, tid), end='', flush=True)
        t0 = time.time()
        while True:
            time.sleep(12)
            st = req('GET', STATUS.format(id=tid))
            status = st.get('status', '?')
            if status in ('SUCCEEDED', 'succeeded'):
                url = (st.get('model_urls') or {}).get('glb')
                if not url:
                    sys.exit('\nsucceeded but no glb url: %s' % json.dumps(st)[:400])
                with urllib.request.urlopen(url, timeout=120) as g:
                    open(dst, 'wb').write(g.read())
                tasks_clear(n)          # safely on disk; the ledger entry is spent
                print('  -> %s (%dKB, %ds)' % (os.path.relpath(dst, HERE),
                      os.path.getsize(dst) // 1024, int(time.time() - t0)))
                done += 1
                break
            if status in ('FAILED', 'failed', 'CANCELED', 'canceled', 'EXPIRED'):
                # Dead task: resuming it can never produce a mesh, so drop it from the
                # ledger. A rerun WILL legitimately spend again for this one.
                tasks_clear(n)
                sys.exit('\n%s FAILED (%s) - STOPPING so no more credits burn: %s'
                         % (n, status, json.dumps(st)[:400]))
            if time.time() - t0 > 1200:
                # KEEP the ledger entry: this task is still alive and already paid for,
                # so the next run must resume it rather than buy another.
                sys.exit('\n%s still %s after 20 minutes - stopping. Already paid for; '
                         'rerun the same command and it RESUMES task %s.' % (n, status, tid))
            print('.', end='', flush=True)
    print('\n%d downloaded. Next:\n  blender -b --factory-startup -P '
          'tools/forge3d/meshyfit.py -- --in tools/forge3d/meshy-out' % done)

if __name__ == '__main__':
    if '--pilot' in sys.argv:
        run(PILOT)
    elif '--all' in sys.argv:
        run(sorted(images().keys()))
    else:
        ids = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--ids=')),
                   next((sys.argv[i + 1] for i, a in enumerate(sys.argv)
                         if a == '--ids' and i + 1 < len(sys.argv)), None))
        if not ids:
            sys.exit(__doc__)
        run([x.strip() for x in ids.split(',') if x.strip()])
