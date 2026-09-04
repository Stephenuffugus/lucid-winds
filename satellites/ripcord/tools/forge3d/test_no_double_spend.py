"""Guard for the meshy_api double-spend bug. Spends NOTHING: stubs req() and counts
   POSTs across a simulated kill + rerun.

       python3 tools/forge3d/test_no_double_spend.py

   Run it after ANY edit to meshy_api.py. Credits are spent at the POST, so the task id
   must reach disk before the poll loop starts, and a rerun must resume rather than
   re-create. Verified both ways on Sep 04 2026: against the pre-fix file this same test
   reports 2 POSTs and no ledger; against the fixed file, 1 POST and a ledger that clears
   on success. A test that cannot fail is not evidence."""
import sys, os, json, importlib.util, shutil, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("meshy_api", os.path.join(HERE, "meshy_api.py"))
m = importlib.util.module_from_spec(spec)
os.environ["MESHY_API_KEY"] = "test-not-a-real-key"
spec.loader.exec_module(m)

tmp = tempfile.mkdtemp()
m.OUT = os.path.join(tmp, "meshy-out")
m.TASKS = os.path.join(tmp, "meshy-tasks.json")
m.images = lambda: {"widget": b"\x89PNG-fake"}

POSTS = {"n": 0}
class Killed(Exception): pass

def make_req(die_while_polling):
    polls = {"n": 0}
    def req(method, path, body=None):
        if method == "POST":
            POSTS["n"] += 1
            return {"result": "task-abc-123"}
        polls["n"] += 1
        if die_while_polling and polls["n"] == 1:
            raise Killed("simulated OOM kill / Ctrl-C mid-poll")
        return {"status": "SUCCEEDED", "model_urls": {"glb": "http://x/y.glb"}}
    return req

# make the "download" a no-op that writes a stub file
import urllib.request
class FakeResp:
    def read(self): return b"GLB"
    def __enter__(self): return self
    def __exit__(self, *a): return False
urllib.request.urlopen = lambda *a, **k: FakeResp()
m.time.sleep = lambda s: None

print("RUN 1 — submits, then the process is killed mid-poll")
m.req = make_req(die_while_polling=True)
try:
    m.run(["widget"])
except Killed as e:
    print("   killed:", e)
ledger = json.load(open(m.TASKS)) if os.path.exists(m.TASKS) else {}
print("   POSTs so far:", POSTS["n"])
print("   ledger on disk:", ledger)
assert ledger.get("widget") == "task-abc-123", "FAIL: task id was not persisted before polling"
assert not os.path.exists(os.path.join(m.OUT, "widget.glb")), "no glb should exist yet"

print("\nRUN 2 — rerun the exact same command")
m.req = make_req(die_while_polling=False)
m.run(["widget"])
print("   TOTAL POSTs across both runs:", POSTS["n"])
print("   ledger after success:", json.load(open(m.TASKS)))
assert POSTS["n"] == 1, "DOUBLE SPEND: %d POSTs, expected 1" % POSTS["n"]
assert os.path.exists(os.path.join(m.OUT, "widget.glb")), "glb should be downloaded now"
assert json.load(open(m.TASKS)) == {}, "ledger should be cleared after a successful download"
shutil.rmtree(tmp, ignore_errors=True)
print("\n*** PASS: one POST across a kill and a rerun. Before the fix this was two. ***")
