/* The TOFU eaters bot (THE EATERS, ?eat=1). One run, not a suite: it plays the four first taste levels with the game's own
 * keys, stepping the physics inside the page as levels.mjs does, and one wrong bite run on the first level. A level passes
 * when the bowl serves with the stars the script expects and the page threw no error.
 *   (cd /workspaces/lucid-winds/satellites/tofu && setsid python3 -m http.server 8791 >/dev/null 2>&1 &)
 *   node tools/tofu-tests/eaters.mjs          TRACE=1 adds the tofu's state every 0.25 s
 */
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/package.json');
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const wait = ms => new Promise(r => setTimeout(r, ms));

function play(name, trace) {
  const T = window.TOFU, P = T.P, DT = 1 / 120, E0 = T.EAT_FROM;
  const W = () => T.world, ea = k => W().eaters.find(e => e.kind === k), beaten = k => ea(k).st === 'beaten';
  const tile = (x, y) => { const w = W(); return (x < 0 || y < 0 || x >= w.W || y >= w.H) ? '#' : w.grid[y][x]; };
  const waterAhead = d => tile(Math.floor(P.x + d * (P.hw + 0.5)), Math.floor(P.y)) === '~';
  const served = () => T.mode === 'served';
  const RUNS = {
    cold: [E0, [{ m: 1, until: () => P.x >= 8.2, max: 5 }, { m: 0, until: () => P.frozen, max: 4 }, { m: 1, until: () => beaten('gulper'), max: 8 }, { m: 1, until: served, max: 8 }]],
    coldwrong: [E0, [{ m: 1, until: () => ea('gulper').st === 'happy', max: 10 }, { m: 1, until: served, max: 8 }]],
    beak: [E0 + 1, [{ m: 0, pr: 1, until: () => P.f >= 0.95, max: 3 }, { m: 1, until: () => P.x >= 8.5, max: 4 }, { m: 0, until: () => beaten('pecker'), max: 6 },
      { m: 1, until: () => P.zone === 'o' && P.onGround, max: 5 }, { m: 0, until: () => P.fried, max: 2 }, { m: 1, until: () => beaten('tongue'), max: 8 }, { m: 1, until: served, max: 8 }]],
    salt: [E0 + 2, [{ m: 1, until: () => P.zone === 's', max: 4 }, { m: 0, until: () => P.soy >= 0.9, max: 4 }, { m: 1, until: () => P.zone === 'f', max: 4 }, { m: 0, until: () => P.stink >= 0.9, max: 4 },
      { m: () => !beaten('slurper') ? Math.sign(ea('slurper').x - P.x) : beaten('sniffer') ? 1 : 0, pj: 1, until: () => beaten('slurper') && beaten('sniffer'), max: 20 }, { m: 0, pr: 1, until: () => P.f >= 0.9, max: 3 }, { m: 1, until: served, max: 10 }]],
    table: [E0 + 3, [{ m: 1, until: () => P.inWater, max: 4 }, { m: 0, until: () => beaten('chopsticks'), max: 8 },
      { m: 1, until: () => P.zone === '*' && P.x >= 18, max: 8 }, { m: 0, until: () => P.frozen, max: 4 }, { m: 1, until: () => beaten('gulper'), max: 8 },
      { m: 1, until: () => P.zone === 'o' && P.onGround, max: 6 }, { m: 0, until: () => P.fried, max: 2 }, { m: 1, until: () => beaten('tongue'), max: 8 },
      { m: -1, until: () => P.zone === 'o' && P.onGround, max: 8 }, { m: 0, until: () => P.fried, max: 2 }, { m: 1, until: served, max: 10 }]],
    scent: [E0 + 4, [{ m: 1, until: () => P.zone === 'f', max: 4 }, { m: 0, until: () => beaten('sniffer'), max: 8 }, { m: () => Math.sign(9.9 - P.x), until: () => P.zone === 'f' && P.onGround, max: 4 }, { m: 0, until: () => P.stink >= 0.9, max: 4 }, { m: 1, until: served, max: 8 }]],
    small: [E0 + 5, [{ m: 1, until: () => P.inWater, max: 4 }, { m: 0, until: () => beaten('chopsticks'), max: 8 }, { m: 1, until: () => P.x >= 8.5 && P.onGround, max: 5 }, { m: 0, pr: 1, until: () => P.f >= 0.95, max: 3 }, { m: 1, until: () => P.x >= 16.5, max: 6 }, { m: 0, until: () => beaten('pecker'), max: 6 },
      { m: 1, until: () => P.zone === 'o' && P.onGround, max: 6 }, { m: 0, until: () => P.fried, max: 2 }, { m: 1, until: () => beaten('tongue'), max: 8 }, { m: 1, until: served, max: 8 }]],
    smallbig: [E0 + 5, [{ m: 1, aj: 1, until: () => P.x >= 35.4, max: 12 }, { m: 1, until: () => false, max: 1.5 }]],
    rush: [E0 + 6, [{ m: 1, until: () => P.zone === 'f', max: 4 }, { m: 0, until: () => beaten('sniffer'), max: 8 }, { m: 1, until: () => P.zone === 's', max: 4 }, { m: 0, until: () => beaten('slurper'), max: 12 },
      { m: 1, aj: 1, until: () => P.x >= 19.6 && P.onGround && P.y < 8, max: 8 }, { m: 0, until: () => P.frozen, max: 4 }, { m: 1, until: () => beaten('gulper'), max: 8 }, { m: 0, pr: 1, until: () => P.f >= 0.9, max: 3 }, { m: 1, until: served, max: 8 }]],
  };
  const solid = ch => ch === '#' || ch === 'n';
  const wallAhead = d => solid(tile(Math.floor(P.x + d * (P.hw + 0.6)), Math.floor(P.y + P.hh - 0.1)));
  const [n, S] = RUNS[name];
  const held = {};
  const key = (k, down) => { if (!!held[k] === down) return; held[k] = down; window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: k })); };
  const tap = k => { window.dispatchEvent(new KeyboardEvent('keydown', { key: k })); window.dispatchEvent(new KeyboardEvent('keyup', { key: k })); };
  T.go(n);
  const log = []; let t = 0, deaths = 0, wasDead = false, lastBites = 6;
  for (let i = 0; i < S.length && !served(); i++) {
    const ph = S[i]; let pt = 0;
    while (!ph.until() && !served()) {
      if (pt > ph.max) { log.push('phase ' + (i + 1) + ' timed out at x ' + P.x.toFixed(1)); i = S.length; break; }
      const mv = typeof ph.m === 'function' ? ph.m() : ph.m; key('d', mv > 0); key('a', mv < 0); key('s', !!ph.pr);
      if (mv && P.onGround && ((ph.pj && waterAhead(mv)) || (ph.aj && wallAhead(mv)))) tap(' ');
      T.input.move = (T.input.keys.d ? 1 : 0) - (T.input.keys.a ? 1 : 0);
      T.step(DT); t += DT; pt += DT;
      if (P.bites !== lastBites) { log.push('t' + t.toFixed(1) + ' bites ' + lastBites + ' to ' + P.bites + ' at x ' + P.x.toFixed(1)); lastBites = P.bites; }
      if (trace && Math.round(t * 120) % 30 === 0) log.push(`p${i + 1} t${t.toFixed(1)} x${P.x.toFixed(1)} y${P.y.toFixed(1)} ${T.stateLabel().main} b${P.bites} ` + W().eaters.map(e => e.kind[0] + ':' + e.st + '@' + e.x.toFixed(1)).join(' '));
      if (P.dead && !wasDead) deaths++; wasDead = P.dead;
      if (t > 90) break;
    }
  }
  key('d', false); key('a', false); key('s', false);
  return { served: served(), stars: W().stars, bites: P.bites, t: +t.toFixed(1), deaths, eaters: W().eaters.map(e => e.kind + ':' + e.st).join(' '), log };
}

const WANT = { cold: 3, coldwrong: 1, beak: 3, salt: 3, table: 3, scent: 3, small: 3, smallbig: 0, rush: 3 };   // smallbig: a whole tofu must NOT get through the slot
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu'], protocolTimeout: 120000, timeout: 120000 });
let fails = 0;
for (const name of (process.env.ONLY || Object.keys(WANT).join(',')).split(',')) {
  const page = await browser.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/sunbeam-sdk|404/.test(m.text())) errs.push('console: ' + m.text()); });
  await page.evaluateOnNewDocument(() => { let s = 20261110; Math.random = () => { s = (s + 0x6D2B79F5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; });
  await page.setViewport({ width: 915, height: 412, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8791/?eat=1', { waitUntil: 'networkidle0', timeout: 90000 }); await wait(300);
  let r; try { r = await page.evaluate(play, name, !!process.env.TRACE); } catch (e) { r = { served: false, log: ['bot threw: ' + e.message] }; }
  await wait(900);
  const card = await page.evaluate(() => { const o = document.querySelector('#overlay'); return o && !o.classList.contains('hidden') ? (document.querySelector('#card .stats') || {}).textContent || 'card' : ''; });
  const ok = (WANT[name] ? r.served && r.stars === WANT[name] : !r.served) && !errs.length; if (!ok) fails++;
  console.log(`${name} ${ok ? 'PASS' : 'FAIL'} served=${r.served} stars=${r.stars} bites=${r.bites} t=${r.t}s deaths=${r.deaths} [${r.eaters}] card="${card}" ${(r.log || []).join('; ')}${errs.length ? ' ERRORS: ' + errs.join(' ; ') : ''}`);
  await page.close();
}
await browser.close(); console.log(fails ? fails + ' run(s) failed' : 'all eaters runs served'); process.exit(fails ? 1 : 0);
