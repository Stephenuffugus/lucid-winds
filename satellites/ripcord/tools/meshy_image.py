#!/usr/bin/env python3
"""Ripcord arena art through Meshy's text to image API, with the forge's money rules.

    python3 satellites/ripcord/tools/meshy_image.py --list
    python3 satellites/ripcord/tools/meshy_image.py --jobs market_lantern,market_lantern-bg --model nano-banana-pro --dry-run
    python3 satellites/ripcord/tools/meshy_image.py --jobs market_lantern,market_lantern-bg --model nano-banana-pro --max-credits 18
    python3 satellites/ripcord/tools/meshy_image.py --status | --balance

The prompts are NOT copied here: they are read out of ART_ASSETS-ARENAS.md (section 3), the source
of truth, from the code block under each "Plate `<id>`" and "Backdrop `<id>-bg`" line. A plate is a
1:1 image, a backdrop 9:16.

Money rules, reused rather than rewritten: this imports the Dewball forge driver
(satellites/dewball/tools/forge/meshy_api.py) and points it at the text to image endpoint and at
Ripcord's own ledger (tools/meshy-images.json). So: the task id is written (fsync) the instant it
exists; a rerun RESUMES a paid task, never buys it twice; GET polls retry, a POST never does; one
spending run at a time per ledger (flock); a refused prompt is noted and the run carries on, the third
stops it. Its tests (test_no_double_spend.py) cover that code path.
Masters land in tools/meshy-images/<job>.<model>.png (gitignored; back them up to the vault).
"""
import argparse, importlib.util, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
FORGE = os.path.join(GAME, '..', 'dewball', 'tools', 'forge', 'meshy_api.py')
SPEC = os.path.join(GAME, 'ART_ASSETS-ARENAS.md')
OUT = os.path.join(HERE, 'meshy-images')
COST = {'nano-banana': 3, 'nano-banana-2': 6, 'nano-banana-pro': 9, 'gpt-image-2': 9,
        'gpt-image-2-5-flare': 9, 'gpt-image-2-5-sunburst': 9}


def forge():
    spec = importlib.util.spec_from_file_location('meshy_api', FORGE)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    m.TASKS = os.path.join(HERE, 'meshy-images.json')
    m.OUT = OUT
    m.CREATE = '/openapi/v1/text-to-image'
    m.STATUS = '/openapi/v1/text-to-image/{id}'
    return m


def prompts():
    """{job: (aspect, prompt)} from the spec's section 3 code blocks"""
    s = open(SPEC, encoding='utf-8').read()
    out = {}
    for m in re.finditer(r'^(Plate|Backdrop) `([a-z_]+(?:-bg)?)` \((\d+) x (\d+)\):\n```\n(.*?)\n```', s, re.M | re.S):
        kind, job, w, h, text = m.group(1), m.group(2), int(m.group(3)), int(m.group(4)), m.group(5).strip()
        out[job] = ('1:1' if w == h else '9:16', text)
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--jobs', default='')
    p.add_argument('--model', default='nano-banana-pro', choices=sorted(COST))
    p.add_argument('--max-credits', type=int, default=None)
    p.add_argument('--parallel', type=int, default=2)
    p.add_argument('--dry-run', action='store_true')
    p.add_argument('--list', action='store_true')
    p.add_argument('--status', action='store_true')
    p.add_argument('--balance', action='store_true')
    a = p.parse_args()
    P = prompts()
    if a.list:
        for j, (asp, t) in sorted(P.items()):
            print('%-22s %-5s %4d chars  %s...' % (j, asp, len(t), t[:70]))
        print('%d prompts in %s' % (len(P), os.path.relpath(SPEC, os.getcwd())))
        return
    m = forge()
    if a.balance:
        print('balance', m.req('GET', m.BALANCE).get('balance')); return
    if a.status:
        L = m.ledger()
        for n, e in sorted(L.items()):
            st = e.get('image', {})
            print('%-34s %-10s %s credits %s' % (n, st.get('status', '-'), st.get('credits', '-'), e.get('file', '')))
        print('LEDGER: %d image job(s), %d credits' % (len(L), sum(int(e.get('image', {}).get('credits') or 0) for e in L.values())))
        return
    jobs = [j for j in a.jobs.split(',') if j]
    unknown = [j for j in jobs if j not in P]
    if not jobs or unknown:
        sys.exit('name jobs from --list; unknown: %s' % ','.join(unknown))
    os.makedirs(OUT, exist_ok=True)
    plan = []
    for j in jobs:
        name = '%s.%s' % (j, a.model)
        e = m.ledger().get(name, {})
        done = e.get('done') and os.path.exists(os.path.join(OUT, name + '.png'))
        live = e.get('image', {}).get('id') and e.get('image', {}).get('status') not in m.DEAD
        cost = 0 if (done or live) else COST[a.model]
        plan.append((name, j, cost, done))
        print('%-34s %s' % (name, 'done, skipped' if done else ('RESUMES a paid task' if live else 'plans %d credits' % cost)))
    total = sum(c for _, _, c, _ in plan)
    print('PLANNED SPEND: %d credits for %d image(s)' % (total, sum(1 for x in plan if not x[3])))
    if a.dry_run:
        for name, j, c, d in plan:
            asp, t = P[j]
            print('  %s body: %s' % (name, json.dumps({'ai_model': a.model, 'aspect_ratio': asp, 'prompt': t[:90] + '...'})))
        print('DRY RUN: nothing sent.'); return
    if a.max_credits is None:
        sys.exit('refusing to spend without --max-credits N')
    if total > a.max_credits:
        sys.exit('planned %d > --max-credits %d: refusing.' % (total, a.max_credits))
    m.hold_run_lock()
    if total:
        bal = m.req('GET', m.BALANCE).get('balance')
        print('BALANCE BEFORE: %s' % bal, flush=True)
        if bal is None or bal < total:
            sys.exit('balance %s is below the planned %d: refusing.' % (bal, total))
    m.QUIET['on'] = True
    refused = []

    def one(entry):
        name, j, cost, done = entry
        if done:
            return
        asp, text = P[j]
        m.ledger_put(name, arena=j, model=a.model, aspect=asp, prompt=text)
        try:
            st = m.stage(name, 'image', {'ai_model': a.model, 'prompt': text, 'aspect_ratio': asp})
        except m.TaskFailed as e:
            refused.append(str(e))
            if len(refused) >= m.MAX_CONTENT_FAILS or not e.content():
                raise SystemExit('STOPPING after %s' % e)
            print('%s REFUSED, refunded; carrying on: %s' % (name, e), flush=True)
            return
        urls = st.get('image_urls') or []
        if not urls:
            raise SystemExit('%s succeeded with no image url: %s' % (name, json.dumps(st)[:300]))
        dst = os.path.join(OUT, name + '.png')
        n = m.download(urls[0], dst)
        m.ledger_put(name, done=True, file=os.path.relpath(dst, HERE), bytes=n)
        print('  -> %s (%d KB)' % (os.path.relpath(dst, GAME), n // 1024), flush=True)

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max(1, a.parallel)) as ex:
        for f in [ex.submit(one, e) for e in plan]:
            f.result()
    if refused:
        print('REFUSED (refunded): %d\n  %s' % (len(refused), '\n  '.join(refused)))
    if total:
        print('BALANCE AFTER: %s' % m.req('GET', m.BALANCE).get('balance'))


main()
