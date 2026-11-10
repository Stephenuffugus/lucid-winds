// node tools/tofu-tests/lab.mjs <shotdir>   The TOFU level lab (?lab=1), one browser run at 412x915: the lab opens over the game,
// a shipped dish loads, a tile is painted by a real tap, the text round trips, PLAY starts the level in the lab slot, a serve
// leaves progress alone, LAB comes back. Without ?lab=1 the lab stays hidden. Repo root on 8777.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const SHOTS = process.argv[2] || ''; const BASE = 'http://127.0.0.1:8777/satellites/tofu/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const fails = [], notes = []; const F = (ok, m) => (ok ? notes : fails).push(m);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e.message || e).slice(0, 140)));
await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await p.goto(BASE, { waitUntil: 'networkidle2' }); await sleep(500);
F(await p.evaluate(() => document.getElementById('lab').classList.contains('hidden') && !window.TOFU.lab), 'without ?lab=1 the lab is hidden and never starts');
await p.goto(BASE + '?lab=1', { waitUntil: 'networkidle2' }); await sleep(600);
const o = await p.evaluate(() => ({ open: !document.getElementById('lab').classList.contains('hidden'), cells: document.getElementById('labgrid').children.length, pal: document.getElementById('labpal').children.length, overlay: document.getElementById('overlay').classList.contains('hidden') }));
F(o.open && o.cells === 28 * 11 && o.pal === 22 && o.overlay, `the lab opens on a blank kitchen with twenty two tiles (${JSON.stringify(o)})`);
await p.select('#labload', '3'); await sleep(300);   // AGEDASHI
const l = await p.evaluate(() => ({ dish: window.TOFU.lab.level.dish, rows: window.TOFU.lab.level.map.length, rec: window.TOFU.lab.level.recipe.join() }));
F(l.dish === 'AGEDASHI 2' && l.rows === 13 && l.rec === 'FRIED', `a shipped dish loads as a copy (${JSON.stringify(l)})`);
// paint one soy tile by a real tap on cell (3,2)
await (await p.$('#labpal button[data-t="s"]')).tap(); const cell = await p.$('#labgrid b[data-x="3"][data-y="2"]'); await cell.tap(); await sleep(150);
F(await p.evaluate(() => window.TOFU.lab.level.map[2][3] === 's' && document.querySelector('#labgrid b[data-x="3"][data-y="2"]').textContent === 's'), 'a tap paints the picked tile');
if (SHOTS) await p.screenshot({ path: SHOTS + '/tofu-lab-412.png' });
const rt = await p.evaluate(() => { const t = window.TOFU.lab.toText(); const before = JSON.stringify(window.TOFU.lab.level.map); const ok = window.TOFU.lab.fromText(t); return { ok, same: JSON.stringify(window.TOFU.lab.level.map) === before, dish: window.TOFU.lab.level.dish, rec: window.TOFU.lab.level.recipe.join(), head: t.slice(0, 60) }; });
F(rt.ok && rt.same && rt.dish === 'AGEDASHI 2' && rt.rec === 'FRIED', `the copied text reads back to the same level (${rt.head})`);
const prog = await p.evaluate(() => localStorage.getItem('tofu.progress'));
await (await p.$('#labplay')).tap(); await sleep(500);
const pl = await p.evaluate(() => ({ mode: window.TOFU.mode, idx: window.TOFU.world.idx, lab: window.TOFU.world.L.lab === true, hidden: document.getElementById('lab').classList.contains('hidden'), back: !document.getElementById('labback').classList.contains('hidden') }));
F(pl.mode === 'play' && pl.idx === 8 && pl.lab && pl.hidden && pl.back, `PLAY starts the level in the lab slot (${JSON.stringify(pl)})`);
if (SHOTS) await p.screenshot({ path: SHOTS + '/tofu-lab-play-412.png' });
// put the tofu in the bowl, fried: a serve in the lab leaves progress alone
await p.evaluate(() => { const T = window.TOFU, w = T.world; T.P.fried = true; T.P.x = w.bowl.x + 0.5; T.P.y = w.bowl.y + 0.5; }); await sleep(1200);
const sv = await p.evaluate(() => ({ mode: window.TOFU.mode, prog: localStorage.getItem('tofu.progress') }));
F(sv.mode === 'served' && sv.prog === prog, `a lab serve leaves progress alone (${JSON.stringify(sv)}, before ${prog})`);
await (await p.$('#labback')).tap(); await sleep(300);
F(await p.evaluate(() => !document.getElementById('lab').classList.contains('hidden') && window.TOFU.lab.level.map[2][3] === 's'), 'LAB returns to the editor with the level kept');
F(errs.length === 0, `no page errors (${JSON.stringify(errs)})`);
await b.close();
for (const n of notes) console.log('  ok ' + n); for (const f of fails) console.log('  FAIL ' + f);
console.log(`tofu lab: ${notes.length} passed, ${fails.length} failed`); process.exit(fails.length ? 1 : 0);
