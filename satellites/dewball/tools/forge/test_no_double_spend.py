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
print('PASS: one preview POST and one refine POST across two kills and three runs.')
