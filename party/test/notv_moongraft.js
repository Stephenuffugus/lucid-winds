/* NO TV MODE, MOONGRAFT end to end (18 Oct 2026, W3 from Astra's review B5.5).
   A phone sized host page (412x915) in no TV mode DRAWS TOO from its seat, and two phones in separate browser contexts
   join a real room (?cloud=1, the live party database). Three plants are drawn, assembled and saved.
   Asserts: phones only is offered and is the default on a phone; the seat is in the roster; every phone (the seat
   included) shows the rules, gets a part with a brief and draws it, and shows only its OWN surface while drawing;
   every phone assembles each plant from the same data (the three reveal canvases are byte identical) with its name;
   every phone ends on the gallery with three cards; Save card makes a 1200 x 1600 PNG with a Download link; only the
   host's seat can remove a card, and removing one takes it off every phone; the host bar carries Start now, then
   Grow more, Another game, End night; End night leaves the cards reachable on a phone. Removes its room.
   Run: node party/test/notv_moongraft.js [base] [shotdir]      base default http://127.0.0.1:8765 (serve the repo root) */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const SHOTS = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* every phone draws from inside its own page: a real pointer scribble on its surface, then Done for now */
const AUTOPILOT = () => {
  let drew = {};
  setInterval(() => {
    const on = document.querySelector('#game-root .screen.on'); if (!on || on.id !== 'mgp-draw') return;
    const s = window.__mgpState && window.__mgpState(); if (!s || !s.key) return;
    const tag = s.g + ':' + s.r; drew[tag] = (drew[tag] || 0) + 1;
    const cv = document.getElementById('mgp-can'), r = cv.getBoundingClientRect(); if (!r.width) return;
    if (drew[tag] <= 3) {
      const ev = (t, x, y) => cv.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true }));
      let x = r.left + r.width * (0.2 + 0.2 * drew[tag]), y = r.top + r.height * 0.2;
      ev('pointerdown', x, y);
      for (let i = 0; i < 8; i++) { y += r.height * 0.07; x += (i % 2 ? 1 : -1) * r.width * 0.04; ev('pointermove', x, y); }
      window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true }));
    } else if (drew[tag] === 5 && !s.done) { const d = document.getElementById('mgp-done'); if (d) d.click(); }
  }, 300);
};
const VIEW = () => {
  const s = window.__mgpState ? window.__mgpState() : {};
  const g = (id) => { const e = document.getElementById(id); return e ? e.textContent.trim() : ''; };
  return { on: s.screen || '', key: s.key || '', brief: g('mgp-brief'), canvases: document.querySelectorAll('#game-root canvas').length,
    name: g('mgp-pn'), gallery: s.gallery || 0, rm: !!document.getElementById('mgp-rm'), rules: g('mgp-rules').length,
    out: (() => { const c = document.getElementById('mgp-out'); return c ? c.toDataURL().length : 0; })() };
};

(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage',
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'] });
  const fails = []; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
  const fresh = async (vp) => { const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
    await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} });
    await p.setViewport(vp); return p; };
  const PHONE = { width: 412, height: 915, isMobile: true, hasTouch: true };
  const errs = [];
  const host = await fresh(PHONE);
  host.on('pageerror', (e) => errs.push('host: ' + e.message.slice(0, 140)));
  await host.goto(BASE + '/party/host.html?game=moongraft&cloud=1&mg_fast=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2000);
  const lob = await host.evaluate(() => ({ code: document.getElementById('ps-code').textContent.trim(),
    mode: !document.getElementById('ps-mode').hidden, phonesOn: document.getElementById('ps-mode-phones').classList.contains('on'),
    seatRow: !document.getElementById('ps-seatrow').hidden }));
  ok(/^[A-Z0-9]{4}$/.test(lob.code), 'room code made');
  ok(lob.mode && lob.phonesOn && lob.seatRow, 'Moongraft offers phones only, the default on a phone sized host, with a name field');
  await host.type('#ps-seat-name', 'Hosty');
  await host.tap('#ps-seat-go');
  const phones = [];
  for (const n of ['Penny', 'Jessie']) {
    const p = await fresh(PHONE);
    p.on('pageerror', (e) => errs.push(n + ': ' + e.message.slice(0, 140)));
    await p.goto(BASE + '/party/play.html?cloud=1&r=' + lob.code, { waitUntil: 'networkidle2', timeout: 90000 });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    await p.tap('#pj-go');
    phones.push({ n, p });
  }
  let roster = '';
  for (let i = 0; i < 30; i++) { await sleep(500); roster = await host.evaluate(() => document.getElementById('ps-roster').textContent);
    if (/Hosty \(you\)/.test(roster) && /Penny/.test(roster) && /Jessie/.test(roster)) break; }
  ok(/Hosty \(you\)/.test(roster), 'the host is in the roster as a player');
  const seat = host.frames().find((f) => /seat=1/.test(f.url()));
  ok(!!seat, 'the host page carries its seat');
  for (const pg of [seat, phones[0].p, phones[1].p]) await pg.evaluate(AUTOPILOT);
  await host.tap('#ps-start');
  await sleep(1500);
  const views = async () => [await seat.evaluate(VIEW), await phones[0].p.evaluate(VIEW), await phones[1].p.evaluate(VIEW)];
  let v = await views();
  ok(v.every((x) => x.on === 'mgp-rules' && x.rules > 100), 'the rules on every phone, the seat too: ' + v.map((x) => x.on).join(','));
  const bar = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar === 'Start now', 'the host bar offers Start now during the rules: ' + bar);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/mg-phone-rules-412.png' });
  await host.tap('#ps-hostbar .ps-hb-btn');
  const seen = { draw: [0, 0, 0], brief: [0, 0, 0], own: [0, 0, 0], show: [0, 0, 0], named: [0, 0, 0], keys: [new Set(), new Set(), new Set()] };
  const outs = {}; const shot = {};
  let done = false; const t0 = Date.now();
  while (Date.now() - t0 < 150000) {
    v = await views();
    v.forEach((x, i) => {
      if (x.on === 'mgp-draw') { seen.draw[i]++; if (x.brief) seen.brief[i]++; if (x.key) seen.keys[i].add(x.key);
        /* drawing: this phone's own surface, and the reveal canvas is still blank */
        if (x.canvases >= 1) seen.own[i]++; }
      if (x.on === 'mgp-show') { seen.show[i]++; if (x.name) seen.named[i]++; }
    });
    if (v.every((x) => x.on === 'mgp-show')) {
      /* once the assembly has run, the three reveal canvases must be the same picture */
      await sleep(4200);
      const pngs = [];
      for (const pg of [seat, phones[0].p, phones[1].p]) pngs.push(await pg.evaluate(() => document.getElementById('mgp-out').toDataURL()));
      const nm = await phones[0].p.evaluate(() => document.getElementById('mgp-sn').textContent);
      if (!outs[nm]) outs[nm] = pngs[0] === pngs[1] && pngs[1] === pngs[2] && pngs[0].length > 3000;
      if (SHOTS && !shot.show) { shot.show = 1; await phones[0].p.screenshot({ path: SHOTS + '/mg-phone-grow-412.png' }); }
    }
    if (SHOTS && !shot.draw && v[1].on === 'mgp-draw') { shot.draw = 1; await sleep(1200); await phones[0].p.screenshot({ path: SHOTS + '/mg-phone-draw-412.png' }); }
    if (SHOTS && !shot.hostdraw && v[0].on === 'mgp-draw') { shot.hostdraw = 1; await sleep(800); await host.screenshot({ path: SHOTS + '/mg-host-seat-drawing-412.png' }); }
    if (v.every((x) => x.on === 'mgp-gal')) { done = true; break; }
    await sleep(250);
  }
  ok(done, 'the game reached the gallery on every phone in ' + Math.round((Date.now() - t0) / 1000) + ' s');
  ['seat', 'Penny', 'Jessie'].forEach((n, i) => {
    ok(seen.draw[i] > 0 && seen.brief[i] > 0, `${n} drew a part with its brief`);
    ok(seen.keys[i].size === 3, `${n} drew three different parts across the three plants: ${[...seen.keys[i]].join(', ')}`);
    ok(seen.show[i] > 0 && seen.named[i] > 0, `${n} watched each plant assemble with its name`);
  });
  ok(Object.keys(outs).length === 3 && Object.values(outs).every(Boolean), 'all three plants were the same picture on every phone: ' + JSON.stringify(outs));
  v = await views();
  ok(v.every((x) => x.gallery === 3), 'every phone holds the three cards: ' + v.map((x) => x.gallery).join(','));
  ok(v[0].rm && !v[1].rm && !v[2].rm, 'only the host\'s seat can remove a card');
  const bar2 = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar2 === 'Grow more,Another game,End night', 'the host bar carries the gallery controls: ' + bar2);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/mg-phone-gallery-412.png' });
  if (SHOTS) await host.screenshot({ path: SHOTS + '/mg-host-seat-gallery-412.png' });

  // save a card on a phone
  const P = phones[0].p;
  await P.tap('#mgp-save1');
  const saved = await (async () => { for (let i = 0; i < 20; i++) { await sleep(300);
    const s = await P.evaluate(() => { const img = document.querySelector('#mgp-sheet-imgs img'); const a = document.querySelector('#mgp-sheet-imgs a.mgp-dl');
      return img && img.complete && img.naturalWidth ? { w: img.naturalWidth, h: img.naturalHeight, dl: a ? a.getAttribute('download') : '', on: window.__mgpState().screen } : null; });
    if (s) return s; } return null; })();
  ok(saved && saved.w === 1200 && saved.h === 1600 && /^moongraft-.*\.png$/.test(saved.dl) && saved.on === 'mgp-saves',
    'Save card opens the card: ' + JSON.stringify(saved));
  if (SHOTS) await P.screenshot({ path: SHOTS + '/mg-phone-save-412.png' });
  await P.tap('#mgp-saves-back');

  // the seat removes a card: it leaves every shelf
  await seat.evaluate(() => document.getElementById('mgp-rm').click());
  await sleep(2500);
  v = await views();
  ok(v.every((x) => x.gallery === 2), 'a card the host removed is gone from every phone: ' + v.map((x) => x.gallery).join(','));

  // End night: the cards stay reachable on a phone
  await host.evaluate(() => { const b = [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].find((x) => x.textContent === 'End night'); if (b) b.click(); });
  await sleep(600);
  await host.evaluate(() => { const y = document.getElementById('ps-confirm-yes'); if (y) y.click(); });
  const back = await (async () => { for (let i = 0; i < 20; i++) { await sleep(400); if (await P.evaluate(() => !!document.getElementById('mgp-back'))) return true; } return false; })();
  ok(back, 'after End night the closed room screen offers "Save your cards"');
  if (back) { await P.tap('#mgp-back'); await sleep(400); }
  const after = await P.evaluate(() => window.__mgpState());
  ok(after.screen === 'mgp-gal' && after.gallery === 2, 'and it leads back to the cards: ' + after.screen + ' ' + after.gallery);
  const words = await phones[1].p.evaluate(() => document.body.innerText);
  ok(!/big screen/i.test(words) && !/sunbeam/i.test(words) && !/unique/i.test(words), 'no "big screen", sunbeam or unique poem words on a phone');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await phones[1].p.evaluate(async (c) => { try { await firebase.app('party').database().ref('party/' + c).remove(); } catch (e) {} }, lob.code);
  await b.close();
  console.log(fails.length ? 'NOTV_MOONGRAFT_FAIL ' + fails.length : 'NOTV_MOONGRAFT_PASS');
  process.exit(fails.length ? 1 : 0);
})();
