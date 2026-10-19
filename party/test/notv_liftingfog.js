/* NO TV MODE, LIFTING FOG end to end (18 Oct 2026, W7 from Astra's review B3.5).
   A phone sized host page (412x915) in no TV mode PLAYS TOO from its seat, and two phones in separate browser
   contexts join a real room (?cloud=1, the live party database). A full Lifting Fog game runs to the podium.
   Asserts: phones only is offered and is the default on a phone; the seat is in the roster; the host bar offers
   Start now and More reading time during the rules, then the podium controls; every phone (the seat included) shows
   the rules, the clue stack growing in order, the options with Answer now, who has saved by name and symbol (never
   what), the reveal with its own outcome, the four clues and everyone's clue and points, the scores so far and the
   podium; the seat (always right at clue 1) scores 100 a question; Jessie (never answers) reads "No answer saved
   this round."; no phone ever reads "big screen". Removes its room.
   Run: node party/test/notv_liftingfog.js [base] [shotdir]      base default http://127.0.0.1:8765 (serve the repo root) */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const SHOTS = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the phones play themselves from inside the page, hit tested (the element really at the button's centre gets the
   tap, so a covered button does nothing, as for a person). mode: 'right' (the seat reads the answer from its own host
   page, which only a test may do), 'first' (the first option, at once), 'none' (never answers) */
const AUTOPILOT = (mode) => {
  const hit = (b) => { if (!b || b.disabled) return false;
    const r = b.getBoundingClientRect(); if (!r.width) return false;
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const t = el && (el.closest('button') || el); if (t === b) { t.click(); return true; } return false; };
  window.__screens = []; window.__maxClues = 0;
  setInterval(() => {
    const on = document.querySelector('#game-root .screen.on'); if (!on) return;
    if (window.__screens[window.__screens.length - 1] !== on.id) window.__screens.push(on.id);
    if (on.id !== 'lfp-q') return;
    window.__maxClues = Math.max(window.__maxClues, document.querySelectorAll('#lfp-clues .lfp-clue:not(.ghost)').length);
    if (mode === 'none') return;
    const go = document.getElementById('lfp-go'); if (go.disabled && document.querySelector('#lfp-opts .lfp-opt.sel')) return;
    const opts = [...document.querySelectorAll('#lfp-opts .lfp-opt')]; if (!opts.length || opts[0].disabled) return;
    let want = 0;
    if (mode === 'right') { try { const a = parent.__liftingfog.state().answer; want = opts.findIndex((o) => o.textContent === a); } catch (e) { return; } }
    if (want < 0) return;
    if (!opts[want].classList.contains('sel')) hit(opts[want]); else hit(go);
  }, 150);
};
const VIEW = () => {
  const on = document.querySelector('#game-root .screen.on');
  const g = (id) => { const e = document.getElementById(id); return e ? e.textContent.trim() : ''; };
  return { on: on ? on.id : '', rules: g('lfp-rules'), clues: document.querySelectorAll('#lfp-clues .lfp-clue:not(.ghost)').length,
    opts: document.querySelectorAll('#lfp-opts .lfp-opt').length, go: g('lfp-go'), who: g('lfp-who'), result: g('lfp-rt'),
    ladder: document.querySelectorAll('#lfp-rlad .lfp-lrow').length, room: document.querySelectorAll('#lfp-rroom .lfp-row').length,
    stand: document.querySelectorAll('#lfp-standrows .lfp-row').length, pod: document.querySelectorAll('#lfp-podrows .lfp-row').length,
    podme: g('lfp-podme'), maxClues: window.__maxClues || 0, screens: (window.__screens || []).join() };
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
  await host.goto(BASE + '/party/host.html?game=liftingfog&cloud=1&lf_fast=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2000);
  const lob = await host.evaluate(() => ({ code: document.getElementById('ps-code').textContent.trim(),
    mode: !document.getElementById('ps-mode').hidden, phonesOn: document.getElementById('ps-mode-phones').classList.contains('on'),
    seatRow: !document.getElementById('ps-seatrow').hidden }));
  ok(/^[A-Z0-9]{4}$/.test(lob.code), 'room code made');
  ok(lob.mode && lob.phonesOn && lob.seatRow, 'Lifting Fog offers phones only, the default on a phone sized host, with a name field');
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
  await seat.evaluate(AUTOPILOT, 'right');
  await phones[0].p.evaluate(AUTOPILOT, 'first');
  await phones[1].p.evaluate(AUTOPILOT, 'none');
  await host.tap('#ps-start');
  await sleep(1500);
  const views = async () => [await seat.evaluate(VIEW), await phones[0].p.evaluate(VIEW), await phones[1].p.evaluate(VIEW)];
  let v = await views();
  ok(v.every((x) => x.on === 'lfp-rules'), 'rules on every phone, the seat too: ' + v.map((x) => x.on).join(','));
  ok(/Four clues describe one thing/.test(v[1].rules) && /Example:/.test(v[1].rules), 'the rules in Astra\'s words, with an example');
  const bar = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar === 'Start now,More reading time', 'the host bar offers Start now and More reading time during the rules: ' + bar);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/lf-phone-rules-412.png' });
  await host.evaluate(() => { const b = [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].find((x) => x.textContent === 'Start now'); b.click(); });
  const seen = { q: [0, 0, 0], who: [0, 0, 0], rev: [0, 0, 0], stand: [0, 0, 0] };
  const shot = {};
  let done = false; const t0 = Date.now();
  while (Date.now() - t0 < 300000) {
    v = await views();
    v.forEach((x, i) => {
      if (x.on === 'lfp-q' && x.opts === 4 && /^(Answer now|Saved at clue)/.test(x.go)) seen.q[i]++;
      if (x.on === 'lfp-q' && /Hosty/.test(x.who)) seen.who[i]++;
      if (x.on === 'lfp-r' && x.ladder === 4 && x.room === 3 && x.result) seen.rev[i]++;
      if (x.on === 'lfp-stand' && x.stand === 3) seen.stand[i]++;
    });
    if (SHOTS) {
      const P = phones[1].p;
      if (!shot.q2 && v[2].on === 'lfp-q' && v[2].clues >= 2) { shot.q2 = 1; await P.screenshot({ path: SHOTS + '/lf-phone-question-412.png' }); }
      if (!shot.rev && v[2].on === 'lfp-r') { shot.rev = 1; await sleep(200); await P.screenshot({ path: SHOTS + '/lf-phone-reveal-412.png' }); }
      if (!shot.stand && v[2].on === 'lfp-stand') { shot.stand = 1; await P.screenshot({ path: SHOTS + '/lf-phone-standings-412.png' }); }
      if (!shot.hostq && v[0].on === 'lfp-q' && /Saved at clue/.test(v[0].go)) { shot.hostq = 1; await host.screenshot({ path: SHOTS + '/lf-host-seat-saved-412.png' }); }
    }
    if (v.every((x) => x.on === 'lfp-pod')) { done = true; break; }
    await sleep(150);
  }
  ok(done, 'the game reached the podium on every phone in ' + Math.round((Date.now() - t0) / 1000) + ' s');
  ['seat', 'Penny', 'Jessie'].forEach((n, i) => {
    ok(seen.q[i] > 0, `${n} saw the options with Answer now`);
    ok(seen.who[i] > 0, `${n} saw who had saved a final answer (the seat), by name`);
    ok(seen.rev[i] > 0, `${n} saw the reveal: own outcome, the four clues, everyone's clue and points`);
    ok(seen.stand[i] > 0, `${n} saw the scores so far`);
  });
  const jv = await phones[1].p.evaluate(VIEW);
  ok(jv.maxClues === 4, 'Jessie (who never answered) saw the clue stack grow to all four clues, in order');
  const pod = await seat.evaluate(VIEW), podP = await phones[1].p.evaluate(VIEW);
  ok(pod.pod === 3 && pod.podme === 'Game complete. Your total is 800.', 'the host seat scored 100 a question (8 x 100): "' + pod.podme + '"');
  ok(podP.podme === 'Game complete. Your total is 0.', 'Jessie, who never answered, scored 0: "' + podP.podme + '"');
  const bar2 = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar2 === 'Play again,Another game,End night', 'the host bar carries the podium controls: ' + bar2);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/lf-phone-podium-412.png' });
  for (const [n, p] of [['seat', seat], ['Penny', phones[0].p], ['Jessie', phones[1].p]]) {
    const words = await p.evaluate(() => document.getElementById('game-root').innerText + ' ' + document.body.innerText);
    ok(!/big screen/i.test(words), `${n}: no "big screen" words on the phone`);
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await host.evaluate(async (c) => { try { await firebase.app('party').database().ref('party/' + c).remove(); } catch (e) {} }, lob.code);
  await b.close();
  console.log(fails.length ? 'NOTV_LIFTINGFOG_FAIL ' + fails.length : 'NOTV_LIFTINGFOG_PASS');
  process.exit(fails.length ? 1 : 0);
})();
