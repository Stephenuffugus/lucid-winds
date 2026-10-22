/* MOONGRAFT rules (W3, 18 Oct 2026, Astra B5): a practice room on a local server, the host and three phones as tabs
   of one browser (the practice transport), real timers.
   Asserts:
   1. ASSIGNMENT, 3 to 8 players: one part each, all different in a plant, and nobody draws the same part twice across
      the three plants (D03 rotation).
   2. CONNECTED, 3 to 8 players: the parts crossing the plant's spine cover it from the top of the bloom to the bottom
      of the pot with no gap; a room with no stem, and a room whose stem player drew nothing, both PAINT the neutral
      connector along the spine (pixels), and a drawn stem switches it off (D01).
   3. VARIANTS: a variant never moves a part (zone and paint order stay the base part's) (D05).
   4. ONE RENDERER: the same card painted on the host page and on a phone page gives byte identical PNG data, and the
      reveal a phone actually shows equals the host's composite (D02).
   5. STROKE RECOVERY: a phone reloaded mid drawing gets its strokes back from its own tab; a phone whose tab storage is
      gone gets the room's accepted copy back (D02).
   6. STALE PACKETS: an older revision arriving late never replaces a newer one (D02).
   7. DONE FOR NOW: when everyone is done the room says "All set. Finishing soon." and moves on (D03, SHELL-D04).
   Run: node party/test/moongraft_rules.js      (serves the repo root itself on port 8247) */
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const puppeteer = require(path.join(ROOT, 'node_modules', 'puppeteer'));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
});
const BASE = 'http://127.0.0.1:8247/party';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = []; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
async function until(fn, ms, step) { const t = Date.now(); let v; while (Date.now() - t < ms) { v = await fn(); if (v) return v; await sleep(step || 300); } return v; }

/* a real pointer stroke on the drawing surface, the input path a player uses */
async function stroke(page, fx, fy) {
  await page.evaluate((fx, fy) => {
    const cv = document.getElementById('mgp-can'); const r = cv.getBoundingClientRect();
    const ev = (t, x, y) => cv.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true }));
    let x = r.left + r.width * fx, y = r.top + r.height * fy;
    ev('pointerdown', x, y);
    for (let i = 0; i < 6; i++) { x += r.width * 0.05; y += r.height * 0.03; ev('pointermove', x, y); }
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true }));
  }, fx, fy);
}

(async () => {
  await new Promise((r) => server.listen(8247, r));
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage',
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'] });
  const errs = [];
  const watch = (p, tag) => p.on('pageerror', (e) => errs.push(tag + ': ' + e.message.slice(0, 160)));
  const host = await b.newPage(); watch(host, 'host');
  await host.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} });
  await host.setViewport({ width: 1280, height: 720 });
  await host.goto(BASE + '/host.html?game=moongraft', { waitUntil: 'networkidle2' });
  const code = await until(() => host.evaluate(() => { const c = document.getElementById('ps-code').textContent.trim(); return /^[A-Z0-9]{4}$/.test(c) ? c : null; }), 8000);
  ok(!!code, 'practice room made: ' + code);
  await until(() => host.evaluate(() => !!(window.__moongraft && window.MoongraftRender)), 8000);

  // 1 + 2 + 3, from the host's own code
  const geo = await host.evaluate(() => {
    const M = window.__moongraft, R = window.MoongraftRender, out = { assign: [], rotate: [], cover: [], conn: {} };
    for (let n = 3; n <= 8; n++) {
      const ids = []; for (let i = 0; i < n; i++) ids.push('p' + i);
      const rounds = [0, 1, 2].map((r) => M.assignFor(ids, r));
      const distinct = rounds.every((a) => new Set(ids.map((id) => a[id].key)).size === n);
      const one = rounds.every((a) => ids.every((id) => !!a[id]));
      const rot = ids.every((id) => new Set(rounds.map((a) => a[id].key)).size === 3);
      out.assign.push(n + ':' + (one && distinct)); out.rotate.push(n + ':' + rot);
      /* the spine (x 0.5) must be covered from the top of the bloom to the bottom of the pot */
      const parts = M.partsFor(n).filter((L) => L.zone[0] <= R.SPINE_X && L.zone[0] + L.zone[2] >= R.SPINE_X)
        .map((L) => [L.zone[1], L.zone[1] + L.zone[3]]).sort((a, b) => a[0] - b[0]);
      let reach = parts.length ? parts[0][0] : 1, gap = parts.length ? parts[0][0] > 0.03 + 1e-9 : true;
      for (const [a, z] of parts) { if (a > reach + 1e-9) gap = true; reach = Math.max(reach, z); }
      out.cover.push(n + ':' + (!gap && reach >= 0.90 - 1e-9));
    }
    /* pixels: a card with a dot in each part's middle, painted, and the spine sampled */
    function card(keys, stemDrawn) {
      const L = window.MOONGRAFT_LAYERS.filter((x) => keys.indexOf(x.key) >= 0);
      return { palette: window.MOONGRAFT_PALETTE, widths: window.MOONGRAFT_WIDTHS, layers: L.map((x) => ({ key: x.key, zone: x.zone, z: x.z,
        st: (x.key === 'stem' && !stemDrawn) ? [] : [{ i: 1, c: 1, w: 1, p: [500, 500, 520, 520] }] })) };
    }
    function spine(c) {
      const cv = document.createElement('canvas'); cv.width = 450; cv.height = 600; const ctx = cv.getContext('2d');
      R.paint(ctx, c, 450, 600);
      const d = ctx.getImageData(Math.round(450 * R.SPINE_X) - 4, 0, 9, 600).data; let lit = 0, tot = 0;
      for (let y = Math.ceil(600 * (R.SPINE_TOP + 0.01)); y <= Math.floor(600 * (R.SPINE_BOT - 0.01)); y += 6) {
        tot++; let any = false;
        for (let x = 0; x < 9; x++) { const i = (y * 9 + x) * 4; if (d[i] > 70 && d[i + 1] > 70) any = true; }
        if (any) lit++;
      }
      return lit + '/' + tot;
    }
    out.conn.three = spine(card(['pot', 'bloom', 'leaves']));
    out.conn.blankStem = spine(card(['pot', 'bloom', 'leaves', 'stem'], false));
    out.conn.drawnStemNeeds = R.needsConnector(card(['pot', 'bloom', 'leaves', 'stem'], true).layers);
    out.conn.threeNeeds = R.needsConnector(card(['pot', 'bloom', 'leaves']).layers);
    /* variants keep the base part's place */
    window.MOONGRAFT_VARIANTS.push({ key: 'pot_r999', zone: [0, 0, 1, 1], z: 99, brief: 'A test brief.', hint: 'A test hint.' });
    let seen = 0, moved = 0;
    for (let i = 0; i < 200; i++) { const v = M.withVariant(window.MOONGRAFT_LAYERS[0]);
      if (v.variant) { seen++; if (v.zone !== window.MOONGRAFT_LAYERS[0].zone || v.z !== 40 || v.key !== 'pot' || v.brief !== 'A test brief.') moved++; } }
    window.MOONGRAFT_VARIANTS.length = 0;
    out.variant = { seen, moved };
    return out;
  });
  ok(geo.assign.every((s) => /true$/.test(s)), 'one different part each, 3 to 8 players, all three plants: ' + geo.assign.join(' '));
  ok(geo.rotate.every((s) => /true$/.test(s)), 'nobody draws the same part twice across the three plants: ' + geo.rotate.join(' '));
  ok(geo.cover.every((s) => /true$/.test(s)), 'the parts on the spine cover bloom to pot with no gap, 3 to 8: ' + geo.cover.join(' '));
  const full = (s) => { const [a, t] = s.split('/').map(Number); return t > 0 && a === t; };
  ok(geo.conn.threeNeeds && full(geo.conn.three), 'a room of three (no stem part) paints the connector the whole way: ' + geo.conn.three);
  ok(full(geo.conn.blankStem), 'a blank stem part also gets the connector: ' + geo.conn.blankStem);
  ok(geo.conn.drawnStemNeeds === false, 'a drawn stem switches the connector off');
  ok(geo.variant.seen > 20 && geo.variant.moved === 0, 'a variant keeps the base part\'s zone, order and key (' + geo.variant.seen + ' picked, ' + geo.variant.moved + ' moved)');

  // three phones join the practice room (tabs of this same browser)
  const phones = [];
  async function join(p, name) {
    await p.goto(BASE + '/play.html', { waitUntil: 'domcontentloaded' });
    await p.type('#pj-code', code); await p.type('#pj-name', name); await p.click('#pj-go');
  }
  for (const n of ['Ada', 'Bo', 'Cy']) {
    const p = await b.newPage(); watch(p, n);
    await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} });
    await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await join(p, n); phones.push({ n, p });
  }
  await until(() => host.evaluate(() => document.querySelectorAll('.ps-prow').length === 3), 9000);
  await host.bringToFront();
  await host.evaluate(() => document.getElementById('ps-start').click());
  await sleep(1200);
  await host.evaluate(() => { const b = document.getElementById('mg-next'); if (b) b.click(); });
  const drawing = await until(async () => { for (const x of phones) { const s = await x.p.evaluate(() => window.__mgpState && window.__mgpState().screen); if (s !== 'mgp-draw') return false; } return true; }, 9000);
  ok(!!drawing, 'every phone is on its drawing surface');

  // 5. recovery from this tab
  const [A, B, C] = phones;
  await A.p.bringToFront();
  for (const f of [[0.2, 0.2], [0.3, 0.5], [0.5, 0.3]]) { await stroke(A.p, f[0], f[1]); await sleep(150); }
  const aSaved = await until(() => A.p.evaluate(() => { const s = window.__mgpState(); return s.strokes === 3 && s.ack === s.rev && s.rev > 0 ? s : null; }), 6000);
  ok(!!aSaved, 'three strokes, acknowledged by the room ("' + (aSaved && aSaved.save) + '")');
  await A.p.reload({ waitUntil: 'domcontentloaded' });
  await join(A.p, 'Ada');
  const aBack = await until(() => A.p.evaluate(() => { const s = window.__mgpState && window.__mgpState(); return s && s.screen === 'mgp-draw' && s.strokes === 3 ? s : null; }), 9000);
  ok(!!aBack && /back/.test(aBack.save), 'a reloaded phone has its three strokes back from its own tab: ' + (aBack && aBack.save));

  // 5b. recovery from the room's copy (this tab's storage gone)
  await B.p.bringToFront();
  for (const f of [[0.25, 0.25], [0.6, 0.6]]) { await stroke(B.p, f[0], f[1]); await sleep(150); }
  await until(() => B.p.evaluate(() => { const s = window.__mgpState(); return s.strokes === 2 && s.ack === s.rev; }), 6000);
  await B.p.evaluate(() => { try { sessionStorage.removeItem('mg_draw'); } catch (e) {} });
  await B.p.reload({ waitUntil: 'domcontentloaded' });
  await join(B.p, 'Bo');
  const bBack = await until(() => B.p.evaluate(() => { const s = window.__mgpState && window.__mgpState(); return s && s.screen === 'mgp-draw' && s.strokes === 2 ? s : null; }), 9000);
  ok(!!bBack && /saved strokes are back/.test(bBack.save), 'with its tab storage gone, the room hands the two accepted strokes back: ' + (bBack && bBack.save));

  // 6. a late older revision never replaces a newer one
  const cid = await C.p.evaluate(() => window.PartyShell.playerId);
  await C.p.evaluate(() => { const s = window.__mgpState(), st = (n) => { const a = []; for (let i = 1; i <= n; i++) a.push({ i, c: 0, w: 1, p: [100 * i, 100, 100 * i + 50, 150] }); return a; };
    window.PartyShell.sendToHost({ t: 'art', g: s.g, r: s.r, rev: 50, s: st(4) });
    window.PartyShell.sendToHost({ t: 'art', g: s.g, r: s.r, rev: 40, s: st(1) }); });
  await sleep(1200);
  const cCount = await host.evaluate((id) => window.__mgState().counts[id], cid);
  ok(cCount === 4, 'revision 40 arriving after revision 50 is ignored (the room keeps 4 strokes, has ' + cCount + ')');

  // 7. everybody Done for now: All set, then the plant grows
  for (const x of phones) { await x.p.bringToFront(); await x.p.evaluate(() => document.getElementById('mgp-done').click()); }
  const fin = await until(() => host.evaluate(() => window.__mgState().finishing), 20000, 400);
  const allSet = await A.p.evaluate(() => document.getElementById('mgp-save').textContent);
  ok(!!fin && /All set/.test(allSet), 'everyone done: the room says "' + allSet + '"');

  // 4. one renderer: the phone's reveal equals the host's composite, byte for byte
  const grown = await until(() => C.p.evaluate(() => window.__mgpState().screen === 'mgp-show'), 12000);
  ok(!!grown, 'the plant grows on the phones');
  await sleep(6500);   /* the whole assembly schedule (lead + every step) */
  const card = await host.evaluate(() => window.__mgState().cards[0]);
  const hostPNG = await host.evaluate((c) => { const cv = document.createElement('canvas'); cv.width = 450; cv.height = 600; window.MoongraftRender.paint(cv.getContext('2d'), c, 450, 600); return cv.toDataURL('image/png'); }, card);
  const phonePNG = await C.p.evaluate((c) => { const cv = document.createElement('canvas'); cv.width = 450; cv.height = 600; window.MoongraftRender.paint(cv.getContext('2d'), c, 450, 600); return cv.toDataURL('image/png'); }, card);
  const shown = await C.p.evaluate(() => document.getElementById('mgp-out').toDataURL('image/png'));
  ok(hostPNG === phonePNG, 'the same card painted on the host page and on a phone page: identical PNG bytes (' + hostPNG.length + ' chars)');
  ok(shown === hostPNG, 'the reveal the phone shows is the host\'s composite, byte for byte');
  const cardPNG = await C.p.evaluate((c) => { const cv = window.MoongraftRender.cardCanvas(c, {}); return { w: cv.width, h: cv.height }; }, card);
  ok(cardPNG.w === 1200 && cardPNG.h === 1600, 'the saved card is 1200 x 1600');
  ok(card.layers.length === 3 && card.v === 'mgr-1', 'the card carries its parts and the renderer version (' + card.v + ')');

  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await b.close(); server.close();
  console.log(fails.length ? 'MOONGRAFT_RULES_FAIL (' + fails.length + ')' : 'MOONGRAFT_RULES_PASS');
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error('MOONGRAFT RULES CRASHED: ' + e.message); process.exit(3); });
