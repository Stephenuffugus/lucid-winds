/* Twin Lanterns had no test of any kind. This runs the REAL puzzle generator and
   scorer out of index.html in a vm sandbox and asks the only questions that
   matter for a deduction game:
     - is the same night the same garden for everyone (no Math.random in logic)
     - is the generated path actually a legal contiguous 4-direction walk
     - is the hidden half DEDUCIBLE, or is the player being asked to guess
     - does the scorer agree with a perfect solve
   Every assertion here was watched fail (by feeding it a broken generator and a
   deliberately wrong solver) before being trusted green. */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(HERE, "..", "index.html");
let pass = 0, fail = 0;
const ok = (n, c, x) => (c ? (pass++, console.log("  ok   " + n))
                           : (fail++, console.log("  FAIL " + n + (x ? "  <- " + x : ""))));

function el() {
  const e = { innerHTML: "", textContent: "", value: "", style: {}, className: "",
    classList: { add() {}, remove() {}, contains: () => false },
    addEventListener() {}, appendChild(c) { return c; }, firstChild: null };
  return e;
}

function load(dayOverride) {
  const html = fs.readFileSync(GAME, "utf8");
  const open = html.lastIndexOf("<script>");
  const src = html.slice(open + "<script>".length, html.indexOf("</script>", open));
  if (src.indexOf("function genPuzzle") < 0) throw new Error("probe: game script not found");
  /* splice the export at the LAST refreshTitle() call, the one at module end —
     the first one lives inside a click handler that never runs here */
  const ANCHOR = "refreshTitle();";
  const at = src.lastIndexOf(ANCHOR);
  if (at < 0) throw new Error("probe: cannot reach internals, anchor missing");
  const EXPORT = "\nglobalThis.__TL={genPuzzle:genPuzzle,shape:shape,dayNum:dayNum,scoreRound:scoreRound,ownerOf:ownerOf,setRound:function(pz,r){PZ=pz;R=r;}};";
  const patched = src.slice(0, at + ANCHOR.length) + EXPORT + src.slice(at + ANCHOR.length);
  const store = new Map();
  const sandbox = {
    console, Math, Date, JSON, setTimeout, clearTimeout,
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    matchMedia: () => ({ matches: false }),
    location: { search: "", pathname: "/satellites/twin-lanterns/" },
    navigator: {}, history: { length: 1 }, document: {
      getElementById: () => el(), createElement: () => el(),
      querySelectorAll: () => [], addEventListener() {}, referrer: "",
    },
  };
  sandbox.window = sandbox; sandbox.parent = sandbox; sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(patched, ctx, { filename: "twin-lanterns.game.js" });
  return sandbox.__TL;
}

const TL = load();

console.log("A. the same night is the same garden");
{
  const a = TL.genPuzzle(9000), b = TL.genPuzzle(9000);
  ok("generator is a pure function of the day",
     JSON.stringify(a.path) === JSON.stringify(b.path));
  const c = TL.genPuzzle(9001);
  ok("a different day is a different garden", JSON.stringify(a.path) !== JSON.stringify(c.path));
  const src = fs.readFileSync(GAME, "utf8");
  const logic = src.slice(src.indexOf("function genPuzzle"), src.indexOf("function renderResult"));
  ok("no Math.random anywhere in puzzle logic", logic.indexOf("Math.random") < 0);
}

console.log("B. the path is a legal walk");
{
  let bad = [], short = [], noEnd = [];
  for (let d = 8000; d < 8400; d++) {
    const p = TL.genPuzzle(d);
    for (let i = 1; i < p.path.length; i++) {
      const dx = Math.abs(p.path[i][0] - p.path[i - 1][0]), dy = Math.abs(p.path[i][1] - p.path[i - 1][1]);
      if (dx + dy !== 1) { bad.push(d); break; }
    }
    const seen = new Set(p.path.map(c => c.join(",")));
    if (seen.size !== p.path.length) bad.push(d);
    if (p.path.length < 5) short.push(d);
    if (p.end[0] !== p.W - 1) noEnd.push(d);
  }
  ok("every path moves one orthogonal step at a time and never revisits", bad.length === 0, bad.slice(0, 5).join());
  ok("every path is long enough to be a puzzle", short.length === 0, short.slice(0, 5).join());
  ok("every path reaches the far lantern", noEnd.length === 0, noEnd.slice(0, 5).join());
}

console.log("C. the hidden half is deducible, not a coin flip");
/* A solver that knows only its OWN rows plus the one gifted stone, and marks a
   hidden cell when EVERY legal completion of the path uses it. If the puzzle is
   fair, that solver should score at or near a perfect night. */
function solve(p, me, gift) {
  const W = p.W, H = p.H;
  const truth = new Set(p.path.map(c => c.join(",")));
  const known = new Set();                    // cells the solver is allowed to see
  for (const c of p.path) if (TL.ownerOf(c[1]) === me) known.add(c.join(","));
  if (gift) known.add(gift.join(","));
  const startK = p.start.join(","), endK = p.end.join(",");
  known.add(startK); known.add(endK);
  /* enumerate every simple path start->end that agrees with what the solver sees */
  const hiddenRow = y => TL.ownerOf(y) !== me;
  const results = [];
  const seen = new Set();
  const LIMIT = 60000; let steps = 0;
  (function walk(x, y, trail) {
    if (steps++ > LIMIT || results.length > 4000) return;
    const k = x + "," + y;
    if (k === endK) {
      // must cover every visible stone the solver knows about
      for (const kk of known) if (!trail.has(kk)) return;
      results.push(new Set(trail));
      return;
    }
    for (const [dx, dy] of [[1, 0], [0, 1], [0, -1], [-1, 0]]) {
      const nx = x + dx, ny = y + dy, nk = nx + "," + ny;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || trail.has(nk)) continue;
      // a cell in a row the solver CAN see is known ground: it is on the path
      // only if the solver sees a stone there
      if (!hiddenRow(ny) && !known.has(nk)) continue;
      trail.add(nk); walk(nx, ny, trail); trail.delete(nk);
    }
  })(p.start[0], p.start[1], new Set([startK]));
  if (!results.length) return null;
  const marks = {};
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!hiddenRow(y)) continue;
    const k = x + "," + y;
    if (k === startK || k === endK) continue;
    if (results.every(r => r.has(k))) marks[k] = 1;   // forced in every completion
  }
  return { marks, options: results.length, truth };
}
{
  let perfect = 0, lit = 0, tried = 0, worst = 0;
  for (let d = 8000; d < 8060; d++) {
    const p = TL.genPuzzle(d);
    // both players gift the stone that is most useful: the first one they own
    const own = m => p.path.filter(c => TL.ownerOf(c[1]) === m &&
      !(c[0] === p.start[0] && c[1] === p.start[1]) && !(c[0] === p.end[0] && c[1] === p.end[1]));
    const g0 = own(0)[Math.floor(own(0).length / 2)] || null;
    const g1 = own(1)[Math.floor(own(1).length / 2)] || null;
    const s0 = solve(p, 0, g1), s1 = solve(p, 1, g0);
    if (!s0 || !s1) continue;
    tried++;
    TL.setRound(p, { phase: 3, gifts: [g0, g1], marks: [s0.marks, s1.marks], player: 0 });
    const sc = TL.scoreRound();
    if (sc.errors === 0) perfect++;
    if (sc.errors <= 2) lit++;
    worst = Math.max(worst, sc.errors);
  }
  ok("a deducing pair can light the path", tried > 0 && lit / tried >= 0.9,
     `${lit}/${tried} lit, worst night ${worst} errors`);
  ok("a deducing pair is often perfect (the puzzle rewards reasoning)",
     tried > 0 && perfect / tried >= 0.5, `${perfect}/${tried} perfect`);
  console.log(`     (deduction solver: ${lit}/${tried} lit, ${perfect}/${tried} perfect, worst ${worst})`);
}

console.log("D. the scorer punishes a bad night");
{
  const p = TL.genPuzzle(8123);
  TL.setRound(p, { phase: 3, gifts: [null, null], marks: [{}, {}], player: 0 });
  const empty = TL.scoreRound();
  ok("marking nothing does not light the path", empty.errors > 2, "errors " + empty.errors);
  const all = [{}, {}];
  for (let y = 0; y < p.H; y++) for (let x = 0; x < p.W; x++) all[1 - TL.ownerOf(y)][x + "," + y] = 1;
  TL.setRound(p, { phase: 3, gifts: [null, null], marks: all, player: 0 });
  const flood = TL.scoreRound();
  ok("marking every cell does not light the path", flood.errors > 2, "errors " + flood.errors);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
