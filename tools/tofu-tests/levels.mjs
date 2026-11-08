/* The TOFU levels bot (TOFU_BUILD_PLAN.md step 4). Runs ONCE per the testing law; it is not a suite.
 * For every level it opens ?dev=1&level=<index>, starts play with TOFU.go, and drives the game's own keys
 * (keydown and keyup on window, the move axis read from input.keys exactly as the page's pollInput does)
 * through a short script written from the handoff's level table, stepping the physics at the game's 1/120 s
 * inside the page. A level passes when the bowl serves the dish with TOFU.recipeCheck() true and the page
 * threw no error. Math.random is seeded so a run is repeatable.
 *
 *   (cd /workspaces/lucid-winds/satellites/tofu && setsid python3 -m http.server 8791 >/dev/null 2>&1 &)
 *   node tools/tofu-tests/levels.mjs            all eight      ONLY=8 node ...   only L8 (1 based)
 *   TRACE=1 adds the tofu's state every 0.1 s to the line
 *   then pkill -f "http.server 8791"
 */
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/package.json');
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean).map(Number);
const wait = ms => new Promise(r => setTimeout(r, ms));

// The page side: one level, played synchronously so the page's own loop never steps between our steps.
function play(n, trace) {
  const T = window.TOFU, P = T.P, CFG = T.CFG, DT = 1 / 120;
  const W = () => T.world;
  const tile = (x, y) => { const w = W(); return (x < 0 || y < 0 || x >= w.W || y >= w.H) ? '#' : w.grid[y][x]; };
  const solid = ch => ch === '#' || ch === '<' || ch === '>' || (ch === 'c' && !P.frozen) || (ch === 'g' && P.f >= CFG.thresholds.silken);
  const foot = () => Math.floor(P.y + P.hh - 0.1);
  const wallAhead = d => solid(tile(Math.floor(P.x + d * (P.hw + 0.6)), foot()));
  const ledgeAhead = d => !solid(tile(Math.floor(P.x + d * (P.hw + 0.1)), foot() + 1));
  const waterAhead = d => tile(Math.floor(P.x + d * (P.hw + 0.5)), Math.floor(P.y)) === '~';
  const eye = () => W().eyes[0];
  const cyc = CFG.eye.open + CFG.eye.closed;
  const blinkStarted = () => { const e = eye(); const ph = e.t % cyc; return !e.open && ph < CFG.eye.open + 0.15; };
  const served = () => T.mode === 'served';
  const still = () => P.onGround && Math.abs(P.vx) < 0.3;
  // phases: m move, pr squeeze held, aj jump at a wall, ej jump at a ledge, pj jump a puddle, until, max seconds
  const S = [
    [{ m: 1, aj: 1, ej: 1, until: served, max: 20 }],
    [{ m: 1, until: served, max: 20 }],
    [{ m: 0, pr: 1, until: () => P.f >= 0.98, max: 4 }, { m: 1, aj: 1, until: served, max: 15 }],
    [{ m: 1, aj: 1, until: () => P.zone === 'o' && P.onGround, max: 8 }, { m: 0, until: () => P.fried, max: 2 }, { m: 1, aj: 1, until: served, max: 20 }],
    [{ m: 1, until: () => P.x >= 6.9, max: 5 }, { m: 0, until: () => P.frozen, max: 5 }, { m: 1, until: served, max: 15 }],
    [{ m: 1, until: () => P.zone === 's' && P.onGround, max: 5 }, { m: 0, until: () => P.soy >= 0.97, max: 6 }, { m: 0, pr: 1, until: () => P.f >= 0.95, max: 4 },
     { m: 1, aj: 1, until: () => P.x >= 8.3, max: 5 }, { m: 0, until: still, max: 4 }, { m: 0, until: blinkStarted, max: 8 }, { m: 1, until: served, max: 15 }],
    [{ m: 1, until: () => P.zone === 'f' && P.onGround, max: 5 }, { m: 0, until: () => P.stink >= 0.98, max: 5 }, { m: 1, pj: 1, until: served, max: 15 }],
    [{ m: 1, until: () => P.zone === '*' && P.onGround && P.x >= 5.3, max: 5 }, { m: 0, until: () => P.frozen, max: 5 },
     { m: 1, until: () => P.zone === 's' && P.onGround, max: 6 }, { m: 0, until: () => P.soy >= 0.95 && !P.frozen, max: 10 },
     { m: 1, aj: 1, until: () => P.zone === 'o' && P.onGround, max: 6 }, { m: 0, until: () => P.fried, max: 2 }, { m: 1, until: () => P.x >= 18.15, max: 4 }, { m: 0, until: still, max: 3 },
     { m: 0, until: blinkStarted, max: 8 }, { m: 1, until: served, max: 15 }],
  ][n];
  const held = {};
  const key = (k, down) => { if (!!held[k] === down) return; held[k] = down; window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: k })); };
  const tap = k => { window.dispatchEvent(new KeyboardEvent('keydown', { key: k })); window.dispatchEvent(new KeyboardEvent('keyup', { key: k })); };
  T.go(n);
  const log = [], deaths = [];
  let t = 0, wasDead = false, rc = null;
  for (let i = 0; i < S.length; i++) {
    const ph = S[i]; let pt = 0;
    while (!ph.until()) {
      if (served()) break;
      if (pt > ph.max) { log.push('phase ' + (i + 1) + ' timed out'); i = S.length; break; }
      key('d', ph.m > 0); key('a', ph.m < 0); key('s', !!ph.pr);
      const d = ph.m;
      if (d && (P.onGround || P.inWater) && ((ph.aj && wallAhead(d)) || (ph.ej && P.onGround && ledgeAhead(d)) || (ph.pj && P.onGround && waterAhead(d)))) tap(' ');
      T.input.move = ((T.input.keys.arrowright || T.input.keys.d) ? 1 : 0) - ((T.input.keys.arrowleft || T.input.keys.a) ? 1 : 0);
      const before = T.recipeCheck().ok;
      T.step(DT); t += DT; pt += DT;
      if (trace && Math.round(t * 120) % 12 === 0) log.push(`p${i + 1} t${t.toFixed(1)} x${P.x.toFixed(2)} y${P.y.toFixed(2)} vx${P.vx.toFixed(1)} vy${P.vy.toFixed(1)} g${P.onGround ? 1 : 0} z${P.zone} f${P.f.toFixed(2)} soy${P.soy.toFixed(2)} h${P.heat.toFixed(2)} fr${P.fried ? 1 : 0}`);
      if (served()) { rc = before && T.recipeCheck().ok; break; }
      if (P.dead && !wasDead) deaths.push(document.querySelector('#hint') ? (T.P.puddle ? 'died (puddle)' : 'died') + ' at x ' + P.x.toFixed(1) : 'died');
      wasDead = P.dead;
      if (t > 60) break;
    }
    if (served()) break;
  }
  key('d', false); key('a', false); key('s', false);
  const lab = T.stateLabel();
  return { served: served(), recipe: rc, t: +t.toFixed(2), deaths, log, state: lab.main + (lab.tags.length ? ' ' + lab.tags.join(' ') : ''),
    at: { x: +P.x.toFixed(2), y: +P.y.toFixed(2), f: +P.f.toFixed(2), soy: +P.soy.toFixed(2), stink: +P.stink.toFixed(2), heat: +P.heat.toFixed(2), fried: P.fried, frozen: P.frozen } };
}

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu'], protocolTimeout: 120000, timeout: 120000 });
let fails = 0;
for (let n = 0; n < 8; n++) {
  if (ONLY.length && !ONLY.includes(n + 1)) continue;
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/sunbeam-sdk|404/.test(m.text())) errs.push('console: ' + m.text()); });
  await page.evaluateOnNewDocument(() => { let s = 20261108; Math.random = () => { s = (s + 0x6D2B79F5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; });
  await page.setViewport({ width: 915, height: 412, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8791/?dev=1&level=' + n, { waitUntil: 'networkidle0', timeout: 90000 });
  await wait(300);
  let r;
  try { r = await page.evaluate(play, n, !!process.env.TRACE); } catch (e) { r = { served: false, recipe: null, log: ['bot threw: ' + e.message], deaths: [] }; }
  await wait(900); // the served card appears 700 ms after the serve
  const card = await page.evaluate(() => { const o = document.querySelector('#overlay'); return o && !o.classList.contains('hidden') ? (document.querySelector('#card h2') || {}).textContent || 'card' : ''; });
  const ok = r.served && r.recipe === true && !errs.length;
  if (!ok) fails++;
  console.log(`L${n + 1} ${ok ? 'PASS' : 'FAIL'} served=${r.served} recipe=${r.recipe} t=${r.t}s deaths=${r.deaths.length ? r.deaths.join(', ') : 0} card="${card}" state=${r.state} ${JSON.stringify(r.at)}${r.log.length ? ' ' + r.log.join('; ') : ''}${errs.length ? ' ERRORS: ' + errs.join(' ; ') : ''}`);
  await page.close();
}
await browser.close();
console.log(fails ? fails + ' level(s) failed' : 'all levels served');
process.exit(fails ? 1 : 0);
