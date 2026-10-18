/* NO TV MODE, FIREFLY FUTURES end to end (18 Oct 2026, W5 from Astra's review B2.5).
   A phone sized host page (412x915) in no TV mode PLAYS TOO from its seat, and two phones in separate browser
   contexts join a real room (?cloud=1, the live party database). A full Firefly game runs to the podium.
   Asserts: phones only is offered and is the default on a phone; the seat is in the roster; every phone (the seat
   included) shows the rules with the worked example, answers, guesses with "How many of these 3 answers were Yes?" and
   a 0 to 3 grid, sees its own answer privately while it guesses, sees the reveal with the total and every guess by
   name and symbol, the scores so far and the podium; the seat scores (it is the only exact guess every round);
   the host bar carries Start now, then the podium controls; no phone ever reads "big screen", "bet" or "market".
   Removes its room.
   Run: node party/test/notv_firefly.js [base] [shotdir]      base default http://127.0.0.1:8765 (serve the repo root) */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const SHOTS = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the phones play themselves from inside the page, hit tested (the element really at the button's centre gets the
   tap, so a covered button does nothing, as for a person): answer, then guess the given number */
const AUTOPILOT = (ans, guess) => {
  const hit = (sel) => { const b = document.querySelector(sel); if (!b || b.disabled) return false;
    const r = b.getBoundingClientRect(); if (!r.width) return false;
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const t = el && (el.closest('button') || el); if (t === b) { t.click(); return true; } return false; };
  window.__screens = [];
  setInterval(() => {
    const on = document.querySelector('#game-root .screen.on'); if (!on) return;
    if (window.__screens[window.__screens.length - 1] !== on.id) window.__screens.push(on.id);
    if (on.id === 'ffp-poll' && !document.getElementById('ffp-' + ans).classList.contains('sel')) hit('#ffp-' + ans);
    if (on.id === 'ffp-mkt') { const b = document.querySelector('#ffp-grid .ffp-numbtn[data-v="' + guess + '"]');
      if (b && !b.classList.contains('sel')) hit('#ffp-grid .ffp-numbtn[data-v="' + guess + '"]'); }
  }, 200);
};
const VIEW = () => {
  const on = document.querySelector('#game-root .screen.on');
  const g = (id) => { const e = document.getElementById(id); return e ? e.textContent.trim() : ''; };
  return { on: on ? on.id : '', rules: g('ffp-rules'), ask: g('ffp-ask'), grid: [...document.querySelectorAll('#ffp-grid .ffp-numbtn')].map((x) => x.textContent).join(),
    own: g('ffp-own'), yes: g('ffp-yes-line'), chips: document.querySelectorAll('#ffp-marks .ffp-chip').length, result: g('ffp-rt'),
    stand: document.querySelectorAll('#ffp-standrows .ffp-row').length, pod: document.querySelectorAll('#ffp-podrows .ffp-row').length,
    podme: g('ffp-podme'), screens: (window.__screens || []).join() };
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
  await host.goto(BASE + '/party/host.html?game=firefly&cloud=1&ff_fast=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2000);
  const lob = await host.evaluate(() => ({ code: document.getElementById('ps-code').textContent.trim(),
    mode: !document.getElementById('ps-mode').hidden, phonesOn: document.getElementById('ps-mode-phones').classList.contains('on'),
    seatRow: !document.getElementById('ps-seatrow').hidden }));
  ok(/^[A-Z0-9]{4}$/.test(lob.code), 'room code made');
  ok(lob.mode && lob.phonesOn && lob.seatRow, 'Firefly offers phones only, the default on a phone sized host, with a name field');
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
  // everybody answers Yes, so every round has 3 answers and 3 Yes; the seat guesses 3 (the only exact: 130 a round),
  // Penny 2 (one away: 40), Jessie 0 (0)
  await seat.evaluate(AUTOPILOT, 'yes', 3);
  await phones[0].p.evaluate(AUTOPILOT, 'yes', 2);
  await phones[1].p.evaluate(AUTOPILOT, 'yes', 0);
  await host.tap('#ps-start');
  await sleep(1500);
  const views = async () => [await seat.evaluate(VIEW), await phones[0].p.evaluate(VIEW), await phones[1].p.evaluate(VIEW)];
  let v = await views();
  ok(v.every((x) => x.on === 'ffp-rules'), 'rules on every phone, the seat too: ' + v.map((x) => x.on).join(','));
  ok(/Example: four people answer and three say Yes/.test(v[1].rules), 'the rules carry the worked example');
  const bar = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar === 'Start now', 'the host bar offers Start now during the rules: ' + bar);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/ff-phone-rules-412.png' });
  await host.tap('#ps-hostbar .ps-hb-btn');
  const seen = { ask: [0, 0, 0], own: [0, 0, 0], rev: [0, 0, 0], stand: [0, 0, 0] };
  const shot = {};
  let done = false; const t0 = Date.now();
  while (Date.now() - t0 < 240000) {
    v = await views();
    v.forEach((x, i) => {
      if (x.on === 'ffp-mkt' && x.ask === 'How many of these 3 answers were Yes?' && x.grid === '0,1,2,3') seen.ask[i]++;
      if (x.on === 'ffp-mkt' && x.own === 'You answered Yes.') seen.own[i]++;
      if (x.on === 'ffp-r' && x.yes === '3 of 3 answers were Yes.' && x.chips === 3) seen.rev[i]++;
      if (x.on === 'ffp-stand' && x.stand === 3) seen.stand[i]++;
    });
    if (SHOTS) {
      const P = phones[0].p;
      if (!shot.poll && v[1].on === 'ffp-poll') { shot.poll = 1; await sleep(250); await P.screenshot({ path: SHOTS + '/ff-phone-answer-412.png' }); }
      if (!shot.mkt && v[1].on === 'ffp-mkt' && v[1].own) { shot.mkt = 1; await sleep(250); await P.screenshot({ path: SHOTS + '/ff-phone-guess-412.png' }); }
      if (!shot.rev && v[1].on === 'ffp-r' && v[1].chips === 3) { shot.rev = 1;
        await P.evaluate(() => { const t = document.getElementById('ffp-tog'); if (t && /Show/.test(t.textContent)) t.click(); });
        await P.screenshot({ path: SHOTS + '/ff-phone-reveal-412.png' }); }
      if (!shot.stand && v[1].on === 'ffp-stand') { shot.stand = 1; await P.screenshot({ path: SHOTS + '/ff-phone-standings-412.png' }); }
      if (!shot.hostpoll && v[0].on === 'ffp-poll') { shot.hostpoll = 1; await sleep(300); await host.screenshot({ path: SHOTS + '/ff-host-seat-answer-412.png' }); }
    }
    if (v.every((x) => x.on === 'ffp-pod')) { done = true; break; }
    await sleep(150);
  }
  ok(done, 'the game reached the podium on every phone in ' + Math.round((Date.now() - t0) / 1000) + ' s');
  ['seat', 'Penny', 'Jessie'].forEach((n, i) => {
    ok(seen.ask[i] > 0, `${n} guessed with "How many of these 3 answers were Yes?" and 0 to 3`);
    ok(seen.own[i] > 0, `${n} saw their own answer privately while guessing`);
    ok(seen.rev[i] > 0, `${n} saw the reveal: the total, then every guess by name and symbol`);
    ok(seen.stand[i] > 0, `${n} saw the scores so far`);
  });
  const pod = await seat.evaluate(VIEW), podP = await phones[0].p.evaluate(VIEW);
  ok(pod.pod === 3 && pod.podme === 'Your total is 1300.', 'the host seat scored the only exact guess every round (10 x 130): "' + pod.podme + '"');
  ok(podP.podme === 'Your total is 400.', 'Penny scored one away every round (10 x 40): "' + podP.podme + '"');
  const bar2 = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar2 === 'Play again,Another game,End night', 'the host bar carries the podium controls: ' + bar2);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/ff-phone-podium-412.png' });
  for (const [n, p] of [['seat', seat], ['Penny', phones[0].p], ['Jessie', phones[1].p]]) {
    const words = await p.evaluate(() => document.getElementById('game-root').innerText + ' ' + document.body.innerText);
    ok(!/big screen/i.test(words) && !/\bbets?\b|market/i.test(words), `${n}: no "big screen", "bet" or "market" words on the phone`);
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await host.evaluate(async (c) => { try { await firebase.app('party').database().ref('party/' + c).remove(); } catch (e) {} }, lob.code);
  await b.close();
  console.log(fails.length ? 'NOTV_FIREFLY_FAIL ' + fails.length : 'NOTV_FIREFLY_PASS');
  process.exit(fails.length ? 1 : 0);
})();
