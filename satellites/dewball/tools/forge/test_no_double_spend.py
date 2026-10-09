"""Guard for the Dewball meshy_api double spend. Spends NOTHING: stubs req() and the
   downloads, then kills a run mid poll (once in the preview, once in the refine) and
   reruns the same command.

       python3 satellites/dewball/tools/forge/test_no_double_spend.py

   Run it after ANY edit to meshy_api.py. Credits are spent at each POST, so each task
   id must reach disk before its poll starts, and a rerun must resume rather than
   re-create. A test that cannot fail is not evidence: --plant-forget makes the driver
   forget to write the id (the original ripcord bug) and the test must then report FAIL.
"""
import sys, os, json, importlib.util, shutil, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('meshy_api', os.path.join(HERE, 'meshy_api.py'))
m = importlib.util.module_from_spec(spec)
os.environ['MESHY_API_KEY'] = 'test-not-a-real-key'
spec.loader.exec_module(m)

tmp = tempfile.mkdtemp()
m.OUT = os.path.join(tmp, 'meshy-out')
m.TASKS = os.path.join(tmp, 'meshy-tasks.json')
m.time.sleep = lambda s: None
m.download = lambda url, dst: (open(dst, 'wb').write(b'GLB'), 3)[1]
if '--plant-forget' in sys.argv:
    real_put = m.ledger_put
    def forgetful(job, **fields):
        fields.pop('preview', None)
        fields.pop('refine', None)
        return real_put(job, **fields)
    m.ledger_put = forgetful

R = {'styles': {'toyshop': {'style': 's', 'textureStyle': 't'}}, 'common': {'target_formats': ['glb']},
     'arms': {'t2': {'preview': {'model_type': 'smart-topology', 'ai_model': 'meshy-t2', 'target_polycount': 'budget'}}},
     'refine': {'ai_model': 'meshy-6', 'texture_resolution': '2k'},
     'kinds': {'widget': {'prompt': 'a widget', 'texture': 'red'}}}
M = {'widget': {'budgetTris': 600}}
POSTS = {'preview': 0, 'refine': 0}
class Killed(Exception):
    pass

def make_req(kill_at):
    polls = {'n': 0}
    def req(method, path, body=None):
        if path.endswith('/balance'):
            return {'balance': 1000}
        if method == 'POST':
            POSTS[body['mode']] += 1
            return {'result': 'task-' + body['mode']}
        polls['n'] += 1
        if kill_at and path.endswith(kill_at) and polls['n'] >= 1:
            raise Killed('simulated kill while polling ' + kill_at)
        return {'status': 'SUCCEEDED', 'consumed_credits': 5 if 'preview' in path else 10,
                'model_urls': {'glb': 'http://x/y.glb'}}
    return req

def attempt(kill_at):
    m.req = make_req(kill_at)
    try:
        m.run([('widget', 't2')], R, M, False, 100)
        return 'finished'
    except Killed as e:
        return 'killed: %s' % e
    except (Exception, SystemExit) as e:
        return 'crashed: %r' % e

print('RUN 1:', attempt('task-preview'))
print('RUN 2:', attempt('task-refine'))
print('RUN 3:', attempt(None))
led = json.load(open(m.TASKS)) if os.path.exists(m.TASKS) else {}
print('POSTs:', POSTS, 'ledger done:', led.get('widget.t2', {}).get('done'))
shutil.rmtree(tmp, ignore_errors=True)
if POSTS != {'preview': 1, 'refine': 1}:
    print('FAIL: DOUBLE SPEND, expected one preview and one refine POST, got %s' % POSTS)
    sys.exit(1)
if not led.get('widget.t2', {}).get('done'):
    print('FAIL: the job never completed')
    sys.exit(1)
# ---- the parallel path (--parallel): two jobs at once, one killed mid refine poll, then a rerun ----
R['kinds']['gadget'] = {'prompt': 'a gadget', 'texture': 'blue'}
M['gadget'] = {'budgetTris': 600}
R['kinds']['widget'] = {'prompt': 'a widget', 'texture': 'red'}
P2 = {'preview': 0, 'refine': 0}
KILLED = {'hit': False}
def make_req2(kill_job):
    def req(method, path, body=None):
        if path.endswith('/balance'):
            return {'balance': 1000}
        if method == 'POST':
            P2[body['mode']] += 1
            who = body['prompt'].split()[1] if 'prompt' in body else body['texture_prompt'].split()[0]
            return {'result': 'task-' + body['mode'] + '-' + who}
        if kill_job and path.endswith('refine-' + kill_job):
            KILLED['hit'] = True
            raise Killed('simulated kill while polling ' + kill_job + ' refine')
        return {'status': 'SUCCEEDED', 'consumed_credits': 5 if 'preview' in path else 10, 'model_urls': {'glb': 'http://x/y.glb'}}
    return req
R['kinds']['gadget']['texture'] = 'gadget blue'; R['kinds']['widget']['texture'] = 'widget red'
tmp2 = tempfile.mkdtemp(); m.OUT = os.path.join(tmp2, 'meshy-out'); m.TASKS = os.path.join(tmp2, 'meshy-tasks.json')
m.req = make_req2('gadget')
try:
    m.run([('widget', 't2'), ('gadget', 't2')], R, M, False, 100, parallel=2); print('PARALLEL RUN 1: finished')
except BaseException as e:
    print('PARALLEL RUN 1: stopped:', e)
m.req = make_req2(None)
m.run([('widget', 't2'), ('gadget', 't2')], R, M, False, 100, parallel=2)
led2 = json.load(open(m.TASKS))
shutil.rmtree(tmp2, ignore_errors=True)
print('PARALLEL POSTs:', P2, 'done:', sorted((k, bool(v.get('done'))) for k, v in led2.items()))
if not KILLED['hit']:
    print('FAIL: the parallel kill never fired; this case proved nothing'); sys.exit(1)
if P2 != {'preview': 2, 'refine': 2} or not all(v.get('done') for v in led2.values()):
    print('FAIL: PARALLEL DOUBLE SPEND or unfinished: expected 2 previews and 2 refines, got %s' % P2)
    sys.exit(1)
# ---- two processes: a second spending run must refuse while the first holds the run lock ----
import subprocess
tmp3 = tempfile.mkdtemp(); m.TASKS = os.path.join(tmp3, 'meshy-tasks.json'); m.OUT = os.path.join(tmp3, 'meshy-out')
m.hold_run_lock()
child = subprocess.run([sys.executable, '-c', 'import sys; sys.argv=["x"]; sys.path.insert(0, %r); import importlib.util as u; '
                        's=u.spec_from_file_location("mm", %r); mm=u.module_from_spec(s); s.loader.exec_module(mm); '
                        'mm.TASKS=%r; mm.hold_run_lock(); print("SECOND RUN GOT THE LOCK")'
                        % (HERE, os.path.join(HERE, 'meshy_api.py'), m.TASKS)], capture_output=True, text=True)
if m.RUN_LOCK['f'] is not None:
    m.RUN_LOCK['f'].close(); m.RUN_LOCK['f'] = None
shutil.rmtree(tmp3, ignore_errors=True)
if 'SECOND RUN GOT THE LOCK' in child.stdout or 'another meshy_api.py run' not in (child.stdout + child.stderr):
    print('FAIL: a second process could start spending while the first held the run lock:', child.stdout, child.stderr[-300:])
    sys.exit(1)
print('PASS: one preview POST and one refine POST across two kills and three runs.')
print('PASS: in parallel, two jobs, one killed mid refine: still one POST per stage per job.')
print('PASS: a second process refuses to spend while the first holds the run lock.')
