/* NO TV MODE, BEARING end to end (18 Oct 2026, W4 from Astra's review B8.5).
   A phone sized host page (412x915) in no TV mode PLAYS TOO from its seat, and two phones in separate browser
   contexts join a real room (?cloud=1, the live party database). A full Bearing game runs to the podium, and the
   Lantern role rotates through the host's seat like anybody.
   Asserts: phones only is offered and is the default on a phone; the seat is in the roster; every phone (the seat
   included) shows the rules with the game's length and the worked example, holds the Lantern (sees its secret spot
   and the clue buttons), waits as the Lantern with its spot, watches someone else choose a clue, places and saves a
   position, and sees the reveal with every saved position by name and symbol; while one phone is the Lantern no
   other phone shows a spot; the seat scores; the host bar carries Start now and Short game, then the podium
   controls. Removes its room.
   Run: node party/test/notv_bearing.js [base] [shotdir]      base default http://127.0.0.1:8765 (serve the repo root) */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const SHOTS = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the phones play themselves from inside the page, hit tested (the element really at the button's centre gets the
   tap, so a covered button does nothing, as for a person): give the clue as the Lantern; as a guesser nudge the
   pointer a few steps and save it */
const AUTOPILOT = (steps) => {
  const hit = (id) => { const b = document.getElementById(id); if (!b || b.disabled || b.hidden) return false;
    const r = b.getBoundingClientRect(); if (!r.width) return false;
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const t = el && (el.closest('button') || el); if (t === b) { t.click(); return true; } return false; };
  let moved = 0, key = '';
  setInterval(() => {
    const on = document.querySelector('#game-root .screen.on'); if (!on) return;
    if (on.id === 'brp-lant') { if (/Your secret spot/.test(document.getElementById('brp-lspot').textContent)) hit('brp-said'); }
    if (on.id === 'brp-guess') {
      const k = document.getElementById('brp-gn').textContent; if (k !== key) { key = k; moved = 0; }
      if (moved < steps) { if (hit('brp-up')) moved++; } else hit('brp-lock');
    }
  }, 250);
};
const VIEW = () => {
  const on = document.querySelector('#game-root .screen.on');
  const g = (id) => { const e = document.getElementById(id); return e ? e.textContent.trim() : ''; };
  return { on: on ? on.id : '', spot: g('brp-lspot'), mspot: g('brp-mspot'), watch: g('brp-wask') + ' ' + g('brp-wends'),
    gs: g('brp-gs'), marks: document.querySelectorAll('#brp-marks .brp-row').length, rsub: g('brp-rs'), result: g('brp-rt2'),
    text: document.body.innerText, pod: document.querySelectorAll('#brp-podrows .brp-row').length, podme: g('brp-podme'),
    len: g('brp-len'), ex: document.querySelector('#brp-rules .brp-ex') ? g('brp-rules').length : 0 };
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
  await host.goto(BASE + '/party/host.html?game=bearing&cloud=1&br_fast=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2000);
  const lob = await host.evaluate(() => ({ code: document.getElementById('ps-code').textContent.trim(),
    mode: !document.getElementById('ps-mode').hidden, phonesOn: document.getElementById('ps-mode-phones').classList.contains('on'),
    seatRow: !document.getElementById('ps-seatrow').hidden }));
  ok(/^[A-Z0-9]{4}$/.test(lob.code), 'room code made');
  ok(lob.mode && lob.phonesOn && lob.seatRow, 'Bearing offers phones only, the default on a phone sized host, with a name field');
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
  await seat.evaluate(AUTOPILOT, 3);
  await phones[0].p.evaluate(AUTOPILOT, 5);
  await phones[1].p.evaluate(AUTOPILOT, 8);
  await host.tap('#ps-start');
  await sleep(1500);
  const views = async () => [await seat.evaluate(VIEW), await phones[0].p.evaluate(VIEW), await phones[1].p.evaluate(VIEW)];
  let v = await views();
  ok(v.every((x) => x.on === 'brp-rules'), 'rules on every phone, the seat too: ' + v.map((x) => x.on).join(','));
  ok(/6 rounds\. Each of you gives the clue 2 times/.test(v[1].len), 'the rules say this game\'s length: "' + v[1].len + '"');
  ok(/Library/.test(v[1].text) && /one room/.test(v[1].text), 'the rules carry the worked example and say the clue is spoken in one room');
  const bar = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar === 'Start now,Short game', 'the host bar offers Start now and Short game during the rules: ' + bar);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/br-phone-rules-412.png', fullPage: false });
  await host.tap('#ps-hostbar .ps-hb-btn');
  const seen = { lant: [0, 0, 0], lwait: [0, 0, 0], watch: [0, 0, 0], guess: [0, 0, 0], saved: [0, 0, 0], marks: [0, 0, 0] };
  let leak = 0; const shot = {};
  let done = false; const t0 = Date.now();
  while (Date.now() - t0 < 240000) {
    v = await views();
    const lanternUp = v.findIndex((x) => x.on === 'brp-lant' && /Your secret spot: \d/.test(x.spot));
    v.forEach((x, i) => {
      if (x.on === 'brp-lant' && /Your secret spot: \d+ of 100/.test(x.spot)) seen.lant[i]++;
      if (x.on === 'brp-lwait' && /Your secret spot: \d+ of 100/.test(x.mspot)) seen.lwait[i]++;
      if (x.on === 'brp-watch' && / is choosing a clue\./.test(x.watch)) seen.watch[i]++;
      if (x.on === 'brp-guess') seen.guess[i]++;
      if (x.on === 'brp-guess' && /^Saved position: \d+/.test(x.gs)) seen.saved[i]++;
      if (x.on === 'brp-r' && x.marks >= 2 && /The secret spot was \d+/.test(x.rsub)) seen.marks[i]++;
      if (lanternUp >= 0 && i !== lanternUp && /secret spot: \d/.test(x.text)) leak++;
    });
    if (SHOTS) {
      const P = phones[0].p;
      if (!shot.lant && v[1].on === 'brp-lant' && /Your secret spot: \d/.test(v[1].spot)) { shot.lant = 1; await P.screenshot({ path: SHOTS + '/br-phone-lantern-412.png' }); }
      if (!shot.guess && v[1].on === 'brp-guess' && /^Saved position/.test(v[1].gs)) { shot.guess = 1; await P.screenshot({ path: SHOTS + '/br-phone-guesser-412.png' }); }
      if (!shot.watch && v[1].on === 'brp-watch') { shot.watch = 1; await P.screenshot({ path: SHOTS + '/br-phone-watch-412.png' }); }
      if (!shot.lwait && v[1].on === 'brp-lwait' && /Your secret/.test(v[1].mspot)) { shot.lwait = 1; await P.screenshot({ path: SHOTS + '/br-phone-lwait-412.png' }); }
      if (!shot.rev && v[1].on === 'brp-r' && v[1].marks >= 2) { shot.rev = 1;
        await P.evaluate(() => { const t = document.getElementById('brp-tog'); if (t && /Show/.test(t.textContent)) t.click(); });
        await P.screenshot({ path: SHOTS + '/br-phone-reveal-412.png' }); }
      if (!shot.hostlant && v[0].on === 'brp-lant') { shot.hostlant = 1; await sleep(200); await host.screenshot({ path: SHOTS + '/br-host-seat-lantern-412.png' }); }
    }
    if (v.every((x) => x.on === 'brp-pod')) { done = true; break; }
    await sleep(200);
  }
  ok(done, 'the game reached the podium on every phone in ' + Math.round((Date.now() - t0) / 1000) + ' s');
  ['seat', 'Penny', 'Jessie'].forEach((n, i) => {
    ok(seen.lant[i] > 0, `${n} held the Lantern and saw their secret spot`);
    ok(seen.lwait[i] > 0, `${n} waited as the Lantern with their spot while the room placed`);
    ok(seen.watch[i] > 0, `${n} watched someone else choose a clue`);
    ok(seen.guess[i] > 0 && seen.saved[i] > 0, `${n} placed and saved a position`);
    ok(seen.marks[i] > 0, `${n} saw the reveal with every saved position by name and symbol`);
  });
  ok(leak === 0, 'while one phone held the Lantern, no other phone showed a spot (' + leak + ' leaks)');
  const pod = await seat.evaluate(VIEW);
  ok(pod.pod === 3 && /^Your total is [1-9]\d*/.test(pod.podme), 'the host seat scored and sees the podium: "' + pod.podme + '"');
  const bar2 = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar2 === 'Play again,Another game,End night', 'the host bar carries the podium controls: ' + bar2);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/br-phone-podium-412.png' });
  const words = await phones[0].p.evaluate(() => document.body.innerText);
  ok(!/big screen/i.test(words), 'no "big screen" words on a phone in no TV mode');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await host.evaluate(async (c) => { try { await firebase.app('party').database().ref('party/' + c).remove(); } catch (e) {} }, lob.code);
  await b.close();
  console.log(fails.length ? 'NOTV_BEARING_FAIL ' + fails.length : 'NOTV_BEARING_PASS');
  process.exit(fails.length ? 1 : 0);
})();
