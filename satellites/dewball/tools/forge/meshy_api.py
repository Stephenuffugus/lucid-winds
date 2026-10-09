#!/usr/bin/env python3
"""Dewball forge: drives Meshy Text to 3D over the API, preview then refine, no hands.

    python3 satellites/dewball/tools/forge/meshy_api.py --balance
    python3 satellites/dewball/tools/forge/meshy_api.py --pilot --dry-run          # bodies + cost, spends nothing
    python3 satellites/dewball/tools/forge/meshy_api.py --pilot --max-credits 240  # the five pilot kinds x both arms
    python3 satellites/dewball/tools/forge/meshy_api.py --kinds teapot,ant --arms t2 --max-credits 40
    python3 satellites/dewball/tools/forge/meshy_api.py --status                   # what the ledger says was spent

Recipes (prompt, texture prompt, the two arms, the refine settings) live in recipes.json;
triangle budgets come from manifest.json (smart topology asks Meshy for the kind's own
budget). Downloads land in tools/forge/meshy-out/<kind>.<arm>.glb (+ .png thumbnail),
which is NOT committed: those files cost credits, so they are backed up as a release in
the private vault repo, never left only on one codespace.

THE DOUBLE SPEND LEDGER (meshy-tasks.json, committed). Credits are spent at the POST.
The task id is written to disk, fsynced, BEFORE the poll starts, for the preview and
again for the refine. A rerun of the same command RESUMES the ledger's task; it never
creates a second one for a job whose task is alive or done. Only a task Meshy itself
reports FAILED or CANCELED (which refunds) may be bought again. The ledger keeps every
job forever with its consumed_credits, so the spend is auditable after the fact.
(test_no_double_spend.py kills a run mid poll and proves one POST per stage.)

BUDGET GUARD: sequential, stops on the first failure or the first non 200 (printed
verbatim, the key never printed), refuses to start when the planned spend exceeds
--max-credits or the live balance.
"""
import json, os, sys, time, urllib.request, urllib.error, datetime, threading
from concurrent.futures import ThreadPoolExecutor

# --parallel N: jobs run on Meshy's servers, not this box, so several can be in flight.
# Every ledger write takes this lock (read, merge, fsync, replace), so two jobs never
# lose each other's task ids; each job is still preview then refine, in order.
LEDGER_LOCK = threading.RLock()
QUIET = {'on': False}

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'meshy-out')
TASKS = os.path.join(HERE, 'meshy-tasks.json')
BASE = 'https://api.meshy.ai'
CREATE = '/openapi/v2/text-to-3d'
STATUS = '/openapi/v2/text-to-3d/{id}'
BALANCE = '/openapi/v1/balance'
DEAD = ('FAILED', 'CANCELED', 'EXPIRED')
POLL_S = 10
STAGE_TIMEOUT_S = 1200
PREVIEW_COST = {'meshy-7.1': 20, 'latest': 20, 'meshy-6': 20, 'meshy-6-lite': 5, 'meshy-t2': 5}
REFINE_COST = {'2k': 10, '4k': 10, '8k': 15}


def now():
    return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


def key():
    k = os.environ.get('MESHY_API_KEY', '').strip()
    if not k:
        sys.exit('MESHY_API_KEY is not set (and must never be committed or printed).')
    return k


def req(method, path, body=None):
    """A GET (a status poll, the balance) is free and repeatable: a dropped connection is
       retried with backoff (9 Oct: one 'Connection reset by peer' mid poll stopped a 38 job
       batch). A POST is never retried: a POST whose answer was lost may still have created
       a task, and retrying it blind is exactly how you pay twice. It stops instead, and the
       ledger plus a rerun sort it out."""
    tries = 6 if method == 'GET' else 1
    for attempt in range(tries):
        r = urllib.request.Request(BASE + path, method=method,
                                   headers={'Authorization': 'Bearer ' + key(), 'Content-Type': 'application/json'},
                                   data=json.dumps(body).encode() if body is not None else None)
        try:
            with urllib.request.urlopen(r, timeout=60) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            detail = e.read().decode()[:800]
            if method == 'GET' and e.code >= 500 and attempt < tries - 1:
                time.sleep(2 ** (attempt + 1)); continue
            sys.exit('API %s %s -> HTTP %d\n%s\nSTOPPED: nothing further was sent.' % (method, path, e.code, detail))
        except (urllib.error.URLError, ConnectionError, TimeoutError, OSError) as e:
            if method == 'GET' and attempt < tries - 1:
                print('  (network: %s; retrying %s in %ds)' % (e, path.split('/')[-1][:12], 2 ** (attempt + 1)), flush=True)
                time.sleep(2 ** (attempt + 1)); continue
            raise


def download(url, dst):
    with urllib.request.urlopen(url, timeout=180) as g:
        data = g.read()
    tmp = dst + '.part'
    with open(tmp, 'wb') as f:
        f.write(data)
    os.replace(tmp, dst)
    return len(data)


# ---- the ledger -------------------------------------------------------------
def ledger():
    try:
        with open(TASKS) as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def ledger_put(job, **fields):
    """Merge fields into one job and fsync before returning. A ledger still sitting in
       an OS buffer when the process dies is not a ledger."""
    with LEDGER_LOCK:
        _ledger_put(job, **fields)


def _ledger_put(job, **fields):
    d = ledger()
    e = d.get(job, {})
    for k, v in fields.items():
        if isinstance(v, dict) and isinstance(e.get(k), dict):
            e[k].update(v)
        else:
            e[k] = v
    d[job] = e
    tmp = TASKS + '.tmp'
    with open(tmp, 'w') as f:
        json.dump(d, f, indent=1, sort_keys=True)
        f.write('\n')
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, TASKS)


# ---- recipes ------------------------------------------------------------------
def load_recipes():
    with open(os.path.join(HERE, 'recipes.json')) as f:
        R = json.load(f)
    with open(os.path.join(HERE, 'manifest.json')) as f:
        M = {k['id']: k for k in json.load(f)['kinds']}
    return R, M


def bodies(R, M, kind, arm):
    rk, a = R['kinds'][kind], R['arms'][arm]
    pv = dict(R['common'])
    pv.update(a['preview'])
    if pv.get('target_polycount') == 'budget':
        pv['target_polycount'] = max(100, min(15000, int(M[kind]['budgetTris'])))
    pv['mode'] = 'preview'
    st = R['styles'][rk.get('style', 'toyshop')]
    pv['prompt'] = (rk['prompt'] + ' ' + st['style'])[:800]
    rf = dict(R['common'])
    rf.update(R['refine'])
    rf['mode'] = 'refine'
    rf['texture_prompt'] = (rk['texture'] + ' ' + st['textureStyle'])[:800]
    return pv, rf


def job_cost(pv, rf):
    return PREVIEW_COST.get(pv.get('ai_model'), 20) + REFINE_COST.get(rf.get('texture_resolution', '2k'), 10)


def remaining_cost(job, pv, rf):
    """What this job would still spend: nothing for a stage whose task is alive or done."""
    e = ledger().get(job, {})
    c = 0
    p, r = e.get('preview', {}), e.get('refine', {})
    if not p.get('id') or p.get('status') in DEAD:
        c += PREVIEW_COST.get(pv.get('ai_model'), 20)
    if not r.get('id') or r.get('status') in DEAD:
        c += REFINE_COST.get(rf.get('texture_resolution', '2k'), 10)
    return c


# ---- one stage: create (or resume) then poll -------------------------------
def stage(job, which, body):
    e = ledger().get(job, {}).get(which, {})
    tid = e.get('id')
    if tid and e.get('status') not in DEAD:
        print('  %s %-7s RESUMING task %s (already paid for, no new spend)' % (job, which, tid), flush=True)
    else:
        r = req('POST', CREATE, body)
        tid = r.get('result') or r.get('id')
        if not tid:
            sys.exit('no task id in response: %s' % json.dumps(r)[:400])
        # Credits are now spent. Record it before ANYTHING else can fail.
        ledger_put(job, **{which: {'id': tid, 'status': 'PENDING', 'created': now()}})
        print('  %s %-7s task %s' % (job, which, tid), end='' if not QUIET['on'] else '\n', flush=True)
    t0 = time.time()
    while True:
        st = req('GET', STATUS.format(id=tid))
        status = st.get('status', '?')
        if status == 'SUCCEEDED':
            ledger_put(job, **{which: {'status': status, 'credits': st.get('consumed_credits'), 'finished': now()}})
            print('  %s %s done (%s credits, %ds)' % (job, which, st.get('consumed_credits'), int(time.time() - t0)), flush=True)
            return st
        if status in DEAD:
            ledger_put(job, **{which: {'status': status, 'credits': st.get('consumed_credits', 0), 'error': st.get('task_error'), 'finished': now()}})
            sys.exit('\n%s %s %s (%s). STOPPING so no more credits burn. A FAILED task refunds; a rerun may buy it again.'
                     % (job, which, status, json.dumps(st.get('task_error'))[:300]))
        if time.time() - t0 > STAGE_TIMEOUT_S:
            sys.exit('\n%s %s still %s after %d min. Already paid for: rerun the same command and it RESUMES task %s.'
                     % (job, which, status, STAGE_TIMEOUT_S // 60, tid))
        if not QUIET['on']:
            print('.', end='', flush=True)
        time.sleep(POLL_S)


RUN_LOCK = {'f': None}


def hold_run_lock():
    """ONE spending run at a time, across processes. The ledger lock above is a thread
       lock inside one process; a second meshy_api.py would read, merge and write the same
       ledger file in its own time and could drop a task id the first one just paid for.
       Held until the process exits (the OS releases it on a kill too)."""
    import fcntl
    path = TASKS + '.lock'
    if RUN_LOCK['f'] is not None:
        if RUN_LOCK.get('path') == path:   # this process already holds it (a resumed run() in the same process)
            return
        RUN_LOCK['f'].close(); RUN_LOCK['f'] = None
    f = open(path, 'w')
    try:
        fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        sys.exit('another meshy_api.py run is spending right now (it holds %s.lock); '
                 'wait for it to finish: two runs on one ledger can lose a paid task id' % os.path.basename(TASKS))
    RUN_LOCK['f'] = f
    RUN_LOCK['path'] = path


def run(jobs, R, M, dry, max_credits, parallel=1):
    os.makedirs(OUT, exist_ok=True)
    plan = []
    for kind, arm in jobs:
        if kind not in R['kinds']:
            sys.exit('no recipe for %s in recipes.json' % kind)
        if kind not in M:
            sys.exit('%s is not a kind in manifest.json' % kind)
        pv, rf = bodies(R, M, kind, arm)
        name = '%s.%s' % (kind, arm)
        done = ledger().get(name, {}).get('done') and os.path.exists(os.path.join(OUT, name + '.glb'))
        plan.append((name, kind, arm, pv, rf, 0 if done else remaining_cost(name, pv, rf), done))
    total = sum(p[5] for p in plan)
    for name, kind, arm, pv, rf, cost, done in plan:
        print('%-18s %s' % (name, 'done, skipped' if done else 'plans %d credits (preview %s %s polycount %s)'
                            % (cost, pv['model_type'], pv['ai_model'], pv.get('target_polycount'))))
        if dry:
            print('   preview body:', json.dumps(pv))
            print('   refine body: ', json.dumps(dict(rf, preview_task_id='<preview id>')))
    print('PLANNED SPEND: %d credits for %d job(s)' % (total, sum(1 for p in plan if not p[6])))
    if dry:
        print('DRY RUN: nothing sent.')
        return
    if max_credits is None:
        sys.exit('refusing to spend without --max-credits N')
    hold_run_lock()
    if total > max_credits:
        sys.exit('planned %d > --max-credits %d: refusing.' % (total, max_credits))
    if total:
        bal = req('GET', BALANCE).get('balance')
        print('BALANCE BEFORE: %s' % bal, flush=True)
        if bal is None or bal < total:
            sys.exit('balance %s is below the planned %d: refusing.' % (bal, total))
    stop = {'why': None}

    def job(entry):
        name, kind, arm, pv, rf, cost, done = entry
        if done:
            return
        if stop['why']:
            print('%s not started: %s' % (name, stop['why']), flush=True)
            return
        try:
            print(name, flush=True)
            ledger_put(name, kind=kind, arm=arm, prompt=pv['prompt'], texture_prompt=rf['texture_prompt'],
                       preview_body={k: v for k, v in pv.items() if k not in ('prompt',)})
            stage(name, 'preview', pv)
            r = stage(name, 'refine', dict(rf, preview_task_id=ledger()[name]['preview']['id']))
            url = (r.get('model_urls') or {}).get('glb')
            if not url:
                raise RuntimeError('%s refine succeeded with no glb url: %s' % (name, json.dumps(r)[:400]))
            n = download(url, os.path.join(OUT, name + '.glb'))
            if r.get('thumbnail_url'):
                try:
                    download(r['thumbnail_url'], os.path.join(OUT, name + '.png'))
                except Exception as e:
                    print('  thumbnail not saved: %s' % e)
            ledger_put(name, done=True, glb=os.path.relpath(os.path.join(OUT, name + '.glb'), HERE), bytes=n)
            print('  -> meshy-out/%s.glb (%d KB)' % (name, n // 1024), flush=True)
        except BaseException as e:      # SystemExit from req() included: record it, start nothing new
            stop['why'] = stop['why'] or ('%s: %s' % (name, e))
            raise

    if parallel <= 1:
        for entry in plan:
            job(entry)
    else:
        QUIET['on'] = True
        with ThreadPoolExecutor(max_workers=parallel) as ex:
            futs = [ex.submit(job, entry) for entry in plan]
            errs = []
            for f in futs:
                try:
                    f.result()
                except BaseException as e:
                    errs.append(e)
        if errs:
            raise errs[0]
    if total:
        print('BALANCE AFTER: %s' % req('GET', BALANCE).get('balance'))


def status():
    d = ledger()
    tot = 0
    for name in sorted(d):
        e = d[name]
        c = (e.get('preview', {}).get('credits') or 0) + (e.get('refine', {}).get('credits') or 0)
        tot += c
        print('%-18s preview %-9s refine %-9s %3d credits %s' % (name, e.get('preview', {}).get('status', '-'),
              e.get('refine', {}).get('status', '-'), c, 'done' if e.get('done') else ''))
    print('LEDGER: %d job(s), %d credits recorded as consumed' % (len(d), tot))


if __name__ == '__main__':
    a = sys.argv[1:]
    def opt(k):
        return a[a.index(k) + 1] if k in a and a.index(k) + 1 < len(a) else None
    if '--balance' in a:
        print('balance', req('GET', BALANCE).get('balance'))
        sys.exit(0)
    if '--status' in a:
        status()
        sys.exit(0)
    R, M = load_recipes()
    arms = (opt('--arms') or 'std,t2').split(',')
    kinds = R['pilot'] if '--pilot' in a else [k for k in (opt('--kinds') or '').split(',') if k]
    if not kinds:
        sys.exit(__doc__)
    mc = opt('--max-credits')
    run([(k, arm) for k in kinds for arm in arms], R, M, '--dry-run' in a, int(mc) if mc else None,
        int(opt('--parallel') or 1))
