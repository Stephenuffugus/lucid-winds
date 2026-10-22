/* NO TV MODE, WIDE MARGIN end to end (18 Oct 2026, W6 from Astra's review B7.5).
   A phone sized host page (412x915) in no TV mode PLAYS TOO from its seat, and two phones in separate browser
   contexts join a real room (?cloud=1, the live party database). A full Wide Margin game runs to the podium.
   Asserts: phones only is offered and is the default on a phone; the seat is in the roster; every phone (the seat
   included) shows the rules with "25% means 25 out of 100" and the game's length, the question with the dial, its
   own saved guess, the reveal with the truth and every saved guess by name and symbol, the scores after round five,
   and the podium; while a question is open no phone's screen names any player or shows anybody's guess; the seat
   scores; the host bar carries Start now, then the podium controls. Removes its room.
   Run: node party/test/notv_widemargin.js [base] [shotdir]      base default http://127.0.0.1:8765 (serve the repo root) */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const SHOTS = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the phones play themselves from inside the page, hit tested (the element really at the button's centre gets the
   tap, so a covered button does nothing, as for a person): nudge the dial a few steps, then save it */
const AUTOPILOT = (steps) => {
  const hit = (id) => { const b = document.getElementById(id); if (!b || b.disabled || b.hidden) return false;
    const r = b.getBoundingClientRect(); if (!r.width) return false;
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const t = el && (el.closest('button') || el); if (t === b) { t.click(); return true; } return false; };
  let moved = 0, key = '';
  setInterval(() => {
    const on = document.querySelector('#game-root .screen.on'); if (!on) return;
    if (on.id === 'wmp-q') {
      const k = document.getElementById('wmp-n').textContent; if (k !== key) { key = k; moved = 0; }
      if (moved < steps) { if (hit('wmp-up')) moved++; } else hit('wmp-lock');
    }
  }, 220);
};
const VIEW = () => {
  const on = document.querySelector('#game-root .screen.on');
  const g = (id) => { const e = document.getElementById(id); return e ? e.textContent.trim() : ''; };
  return { on: on ? on.id : '', screen: on ? on.innerText : '', note: g('wmp-note'), truth: g('wmp-truth'),
    marks: document.querySelectorAll('#wmp-marks .wmp-row').length, result: g('wmp-rt2'), len: g('wmp-len'),
    rules: g('wmp-rules') + ' ' + (document.querySelector('#wmp-rules .wmp-ex') ? document.querySelector('#wmp-rules .wmp-ex').textContent : ''),
    standh: g('wmp-standh'), stand: document.querySelectorAll('#wmp-standrows .wmp-row').length,
    pod: document.querySelectorAll('#wmp-podrows .wmp-row').length, podme: g('wmp-podme'), text: document.body.innerText };
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
  await host.goto(BASE + '/party/host.html?game=widemargin&cloud=1&wm_fast=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2000);
  const lob = await host.evaluate(() => ({ code: document.getElementById('ps-code').textContent.trim(),
    mode: !document.getElementById('ps-mode').hidden, phonesOn: document.getElementById('ps-mode-phones').classList.contains('on'),
    seatRow: !document.getElementById('ps-seatrow').hidden }));
  ok(/^[A-Z0-9]{4}$/.test(lob.code), 'room code made');
  ok(lob.mode && lob.phonesOn && lob.seatRow, 'Wide Margin offers phones only, the default on a phone sized host, with a name field');
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
  await seat.evaluate(AUTOPILOT, 2);
  await phones[0].p.evaluate(AUTOPILOT, 5);
  await phones[1].p.evaluate(AUTOPILOT, 9);
  await host.tap('#ps-start');
  await sleep(1500);
  const views = async () => [await seat.evaluate(VIEW), await phones[0].p.evaluate(VIEW), await phones[1].p.evaluate(VIEW)];
  let v = await views();
  ok(v.every((x) => x.on === 'wmp-rules'), 'rules on every phone, the seat too: ' + v.map((x) => x.on).join(','));
  ok(/This game: 10 questions/.test(v[1].len), 'the rules say this game\'s length: "' + v[1].len + '"');
  ok(v.every((x) => /Every saved guess earns at least 5 points/.test(x.rules) && /25% means 25 out of 100/.test(x.rules)), 'every phone teaches out of one hundred and makes the scoring promise');
  const bar = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar === 'Start now', 'the host bar offers Start now during the rules: ' + bar);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/wm-phone-rules-412.png' });
  await host.tap('#ps-hostbar .ps-hb-btn');
  const seen = { q: [0, 0, 0], saved: [0, 0, 0], rev: [0, 0, 0], stand: [0, 0, 0] };
  let leak = 0; const shot = {}; const NAMES = ['Hosty', 'Penny', 'Jessie'];
  let done = false; const t0 = Date.now();
  while (Date.now() - t0 < 240000) {
    v = await views();
    v.forEach((x, i) => {
      if (x.on === 'wmp-q') { seen.q[i]++; if (NAMES.some((n) => x.screen.indexOf(n) >= 0)) leak++; }
      if (x.on === 'wmp-q' && /^Saved guess: \d+%/.test(x.note)) seen.saved[i]++;
      if (x.on === 'wmp-r' && x.marks >= 2 && /^(About )?\d+%\.$/.test(x.truth)) seen.rev[i]++;
      if (x.on === 'wmp-stand' && /^Scores so far, after round 5 of 10/.test(x.standh) && x.stand === 3) seen.stand[i]++;
    });
    if (SHOTS) {
      const P = phones[0].p;
      if (!shot.q && v[1].on === 'wmp-q' && !/^Saved/.test(v[1].note)) { shot.q = 1; await P.screenshot({ path: SHOTS + '/wm-phone-question-412.png' }); }
      if (!shot.saved && v[1].on === 'wmp-q' && /^Saved guess/.test(v[1].note)) { shot.saved = 1; await P.screenshot({ path: SHOTS + '/wm-phone-saved-412.png' }); }
      if (!shot.rev && v[1].on === 'wmp-r' && v[1].marks >= 2) { shot.rev = 1; await sleep(700);
        await P.screenshot({ path: SHOTS + '/wm-phone-reveal-412.png' });
        await P.evaluate(() => { const t = document.getElementById('wmp-tog'); if (t && /Show/.test(t.textContent)) t.click(); });
        await P.screenshot({ path: SHOTS + '/wm-phone-reveal-scores-412.png' }); }
      if (!shot.stand && v[1].on === 'wmp-stand') { shot.stand = 1; await P.screenshot({ path: SHOTS + '/wm-phone-standings-412.png' }); }
      if (!shot.hostq && v[0].on === 'wmp-q') { shot.hostq = 1; await sleep(200); await host.screenshot({ path: SHOTS + '/wm-host-seat-question-412.png' }); }
    }
    if (v.every((x) => x.on === 'wmp-pod')) { done = true; break; }
    await sleep(200);
  }
  ok(done, 'the game reached the podium on every phone in ' + Math.round((Date.now() - t0) / 1000) + ' s');
  ['seat', 'Penny', 'Jessie'].forEach((n, i) => {
    ok(seen.q[i] > 0 && seen.saved[i] > 0, `${n} set the dial and saved a guess`);
    ok(seen.rev[i] > 0, `${n} saw the reveal with the truth and every saved guess by name and symbol`);
    ok(seen.stand[i] > 0, `${n} saw the scores after round five`);
  });
  ok(leak === 0, 'while a question was open no phone screen named a player or showed a guess (' + leak + ' leaks)');
  const pod = await seat.evaluate(VIEW);
  ok(pod.pod === 3 && /^Your total is [1-9]\d*/.test(pod.podme), 'the host seat scored and sees the podium: "' + pod.podme + '"');
  const bar2 = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar2 === 'Play again,Another game,End night', 'the host bar carries the podium controls: ' + bar2);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/wm-phone-podium-412.png' });
  const words = await phones[0].p.evaluate(() => document.body.innerText);
  ok(!/big screen/i.test(words), 'no "big screen" words on a phone in no TV mode');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await host.evaluate(async (c) => { try { await firebase.app('party').database().ref('party/' + c).remove(); } catch (e) {} }, lob.code);
  await b.close();
  console.log(fails.length ? 'NOTV_WIDEMARGIN_FAIL ' + fails.length : 'NOTV_WIDEMARGIN_PASS');
  process.exit(fails.length ? 1 : 0);
})();
