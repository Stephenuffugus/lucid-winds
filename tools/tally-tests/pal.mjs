// node tools/tally-tests/pal.mjs [url] [shotdir] [only]
// Tally Part 1 gate (the painted pals and beads), on a served copy (repo root on 8777; default the vendored copy).
// At 412 x 915 and 360 x 640 on a seeded five bead level: the play screen does not scroll; the pal's box misses Undo,
// Clear, Hint and every bead; the painted feet (the lowest opaque row of the frame on screen, read from the pixels)
// stand on the box's bottom edge; a bank, played with REAL taps, plays cheer_01..04 and the box keeps one size at every
// swap; the bubble sits inside the board and over no control. A fresh load's requests stay under 450 KB.
// `only` = feet | box | bytes runs one check (the fail watch uses it on broken copies). Shots with a shotdir.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const URL = process.argv[2] || 'http://127.0.0.1:8777/satellites/tally/';
const SHOTS = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : '';
const ONLY = process.argv[4] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = []; const notes = []; const errs = [];
const F = (ok, msg) => { if (!ok) fails.push(msg); else notes.push('ok ' + msg); };
const want = (k) => !ONLY || ONLY === k;

const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
async function open(v, seed) {
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  await p.setViewport({ width: v.w, height: v.h, deviceScaleFactor: SHOTS ? 2 : 1, isMobile: true, hasTouch: true });
  const cdp = await p.createCDPSession(); await cdp.send('Network.enable');
  let bytes = 0; const big = [];
  cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });
  cdp.on('Network.responseReceived', (e) => { if (e.response.encodedDataLength > 60000) big.push(e.response.url.split('/').slice(-2).join('/')); });
  if (seed) await p.evaluateOnNewDocument((s) => { try { localStorage.setItem('tally:v1', s); } catch (e) {} }, JSON.stringify(seed));
  await p.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await p.waitForSelector('.mv-beacon-num', { timeout: 20000 });
  await sleep(700);
  return { ctx, p, bytes: () => bytes, big };
}
const rect = (p, sel) => p.evaluate((sel) => [...document.querySelectorAll(sel)].map((e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, t: (e.textContent || '').trim().slice(0, 12) }; }), sel);
const hit = (a, c) => a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h;
// the painted feet on screen: the lowest row of the current frame with alpha > 24, mapped through the img's box
const feet = (p) => p.evaluate(() => new Promise((res) => {
  const img = document.querySelector('.mv-pal-img'); const box = document.querySelector('.mv-pal-box');
  if (!img || !box) return res(null);
  const go = () => {
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
    let low = -1; for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 24) { low = y; break; }
    const r = img.getBoundingClientRect(); const bb = box.getBoundingClientRect();
    res({ feetY: r.top + (low + 1) / c.height * r.height, boxBottom: bb.bottom, frame: img.dataset.frame });
  };
  if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
}));
// solve one way with real taps: the expression is found from the board's numbers and target, here
async function bankOne(p) {
  const st = await p.evaluate(() => ({ pool: [...document.querySelectorAll('.mv-tile')].map((t) => parseInt(t.textContent, 10)), target: parseInt(document.querySelector('.mv-beacon-num').textContent, 10) }));
  const OPS = ['+', '-', '×', '÷'];
  const ev = (tok) => { // integer, standard precedence
    const t = tok.slice(); for (let i = 1; i < t.length; i += 2) if (t[i] === '×' || t[i] === '÷') {
      const a = t[i - 1], c = t[i + 1]; if (t[i] === '÷' && (c === 0 || a % c)) return NaN; t.splice(i - 1, 3, t[i] === '×' ? a * c : a / c); i -= 2; }
    let v = t[0]; for (let i = 1; i < t.length; i += 2) v = t[i] === '+' ? v + t[i + 1] : v - t[i + 1]; return v; };
  // every ordered choice of 2 to 4 distinct beads and every operator between them (the engine's own reach)
  let found = null; const n = st.pool.length;
  const rec = (idx) => {
    if (found) return;
    if (idx.length >= 2) {
      const ops = Math.pow(4, idx.length - 1);
      for (let c = 0; c < ops && !found; c++) { const tok = []; let k = c;
        idx.forEach((ix, m) => { tok.push(st.pool[ix]); if (m < idx.length - 1) { tok.push(OPS[k % 4]); k = Math.floor(k / 4); } });
        if (ev(tok) === st.target) found = tok; }
    }
    if (idx.length < 4) for (let x = 0; x < n && !found; x++) if (!idx.includes(x)) rec(idx.concat(x));
  };
  rec([]);
  if (!found) return false;
  for (const tkn of found) {
    const c = await p.evaluate((tkn) => {
      const el = typeof tkn === 'number' ? [...document.querySelectorAll('.mv-tile')].find((t) => parseInt(t.textContent, 10) === tkn)
        : [...document.querySelectorAll('.mv-op')].find((b) => b.textContent === (tkn === '-' ? '−' : tkn));
      const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, tkn);
    await p.touchscreen.tap(c.x, c.y); await sleep(90);
  }
  return true;
}

const SEED = { seenIntro: true, level: 3 };
for (const v of [{ w: 412, h: 915 }, { w: 360, h: 640 }]) {
  const tag = v.w + 'x' + v.h;
  const { ctx, p, bytes, big } = await open(v, SEED);
  if (want('bytes') && v.w === 412) {
    await sleep(1500);   // every request the play screen makes, as the browser timed them (the page itself plus each resource)
    const t = await p.evaluate(() => { const all = [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')];
      return { sum: all.reduce((s, e) => s + (e.transferSize || e.encodedBodySize || 0), 0), big: all.filter((e) => (e.transferSize || e.encodedBodySize) > 60000).map((e) => e.name.split('/').slice(-2).join('/')) }; });
    const kb = Math.max(t.sum, bytes()) / 1024;
    F(kb < 450, `${tag} fresh load requests ${kb.toFixed(0)} KB < 450 (big: ${t.big.join(', ') || 'none'})`);
  }
  const nb = (await rect(p, '.mv-tile')).length;
  if (!ONLY) F(nb === 5, `${tag} a five bead level (got ${nb})`);
  if (!ONLY) {
    const sc = await p.evaluate(() => ({ sh: document.documentElement.scrollHeight, ih: window.innerHeight }));
    F(sc.sh <= sc.ih, `${tag} the play screen does not scroll (${sc.sh} <= ${sc.ih})`);
    const box = (await rect(p, '.mv-pal-box'))[0];
    F(!!box, `${tag} the painted pal is on the board`);
    if (box) for (const c of [...(await rect(p, '.mv-ctrl')), ...(await rect(p, '.mv-tile'))]) F(!hit(box, c), `${tag} the pal misses "${c.t}"`);
    if (SHOTS) await p.screenshot({ path: `${SHOTS}/play-${tag}.png` });
  }
  if (want('feet')) {
    const f = await feet(p);
    F(f && Math.abs(f.feetY - f.boxBottom) <= 1.5, `${tag} the painted feet stand on the box (${f && f.feetY.toFixed(1)} vs ${f && f.boxBottom.toFixed(1)}, ${f && f.frame})`);
  }
  if (want('box') || !ONLY) {
    // record the frame and the img box at every swap through a bank's cheer
    await p.evaluate(() => {
      window.__swaps = []; const img = document.querySelector('.mv-pal-img');
      new MutationObserver(() => { const r = img.getBoundingClientRect(); window.__swaps.push({ f: img.dataset.frame, w: +r.width.toFixed(2), h: +r.height.toFixed(2), b: +r.bottom.toFixed(2) }); })
        .observe(img, { attributes: true, attributeFilter: ['src'] });
    });
    const okBank = await bankOne(p);
    if (!ONLY) F(okBank, `${tag} a way banked with real taps`);
    await sleep(160);
    const bub = (await rect(p, '.mv-pal-bubble'))[0]; const board = (await rect(p, '.mv-board'))[0];
    if (!ONLY) {
      // the bubble must speak at 412; on a 360 phone it may stay quiet when no spot is free (never over a control)
      const shown = !!bub && bub.w > 0;
      F(v.w === 360 || shown, `${tag} the bubble speaks on the bank`);
      if (shown && board) {
        F(bub.x >= board.x - 0.5 && bub.y >= board.y - 0.5 && bub.x + bub.w <= board.x + board.w + 0.5 && bub.y + bub.h <= board.y + board.h + 0.5, `${tag} the bubble inside the board`);
        for (const c of [...(await rect(p, '.mv-ctrl')), ...(await rect(p, '.mv-tile')), ...(await rect(p, '.mv-op'))]) F(!hit(bub, c), `${tag} the bubble over no control ("${c.t}")`);
      }
      if (SHOTS) await p.screenshot({ path: `${SHOTS}/bank-${tag}.png` });
    }
    await sleep(900);
    const sw = await p.evaluate(() => window.__swaps);
    const names = sw.map((s) => s.f);
    const c1 = names.indexOf('cheer_01');
    if (!ONLY) F(c1 >= 0 && names.slice(c1, c1 + 5).join() === 'cheer_01,cheer_02,cheer_03,cheer_04,idle_01', `${tag} cheer frames in order (${names.join(' ')})`);
    const sizes = new Set(sw.map((s) => s.w + 'x' + s.h + '@' + s.b));
    F(sw.length >= 4 && sizes.size === 1, `${tag} one box at every swap (${[...sizes].join(' ')})`);
  }
  await ctx.close();
}
if (!ONLY) {
  const kb = parseInt(execSync(`du -sk ${'/workspaces/lucid-winds/satellites/tally/art/t1/pals'} 2>/dev/null || echo 0`).toString(), 10);
  F(URL.indexOf('8777/satellites/tally/') < 0 || (kb > 0 && kb < 2.6 * 1024), `the vendored pals folder ${kb} KB < 2662`);
}
await b.close();
if (errs.length) fails.push('page errors: ' + errs.join(' | '));
console.log(notes.join('\n'));
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'PASS');
process.exit(fails.length ? 1 : 0);
