/* NO TV MODE, FIRST FROST end to end (19 Oct 2026, W8 from Astra's review B4.5).
   A phone sized host page (412x915) in no TV mode PLAYS TOO from its seat, and three phones in separate browser
   contexts join a real room (?cloud=1, the live party database). A full First Frost game runs to the podium.
   The seat always answers right (it reads its own host page, which only a test may do), Penny always answers wrong,
   Jessie always answers right (the test tells her phone, as it tells Penny's), Gus never answers: so Penny and Gus
   become the Frost at question 3, choose the weather for nine rounds (Penny Fog, Gus Chill: a tie that rotates), and
   the game ends at the twelve question cap with the seat and Jessie still standing.
   Asserts: phones only is offered and is the default on a phone; the seat is in the roster; the host bar offers Start
   now and More reading time during the rules, then the podium controls; every phone (the seat included) shows the
   rules, a question, a reveal and the podium; a Frost phone gets the weather vote with three choices AND the Frost
   question view (the weather, the question, the ledger of everybody still standing, its weather points); freezing
   says "You are the Frost. Choose the next weather."; the weather announcement reaches every phone; the seat's points
   match its answers (100 a question, +300 if it is the last survivor) and the podium line says the ending; no phone
   ever reads "big screen". Removes its room.
   Run: node party/test/notv_firstfrost.js [base] [shotdir]      base default http://127.0.0.1:8765 (serve the repo root) */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const SHOTS = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const AUTOPILOT = (mode, vote) => {
  const hit = (b) => { if (!b || b.disabled) return false;
    const r = b.getBoundingClientRect(); if (!r.width) return false;
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const t = el && (el.closest('button') || el); if (t === b) { t.click(); return true; } return false; };
  window.__screens = []; window.__seen = {};
  setInterval(() => {
    const on = document.querySelector('#game-root .screen.on'); if (!on) return;
    if (window.__screens[window.__screens.length - 1] !== on.id) window.__screens.push(on.id);
    const g = (id) => { const e = document.getElementById(id); return e ? e.textContent.trim() : ''; };
    if (on.id === 'frp-r') window.__seen['r:' + g('frp-rt')] = 1;
    if (on.id === 'frp-fq') window.__seen['fq:' + g('frp-fpw') + '|' + document.querySelectorAll('#frp-fledger .frp-row').length + '|' + g('frp-fmine')] = 1;
    if (on.id === 'frp-wx') window.__seen['wx:' + g('frp-xname')] = 1;
    if (on.id === 'frp-vote') {
      window.__seen['vote:' + document.querySelectorAll('#frp-pwopts .frp-pwbtn').length] = 1;
      const b = document.querySelector('#frp-pwopts .frp-pwbtn[data-k="' + vote + '"]');
      if (b && !b.classList.contains('sel')) hit(b);
      return;
    }
    if (on.id !== 'frp-q' || mode === 'none') return;
    const go = document.getElementById('frp-go');
    const opts = [...document.querySelectorAll('#frp-opts .frp-opt')]; if (opts.length !== 4 || opts[0].disabled) return;
    let want = 0;
    if (mode === 'right') {
      let a; try { a = parent.__firstfrost.state().answer; } catch (e) { a = null; }
      if (!a) return; want = opts.findIndex((o) => o.textContent === a);
    }
    if (mode === 'wrong' || mode === 'told') {
      /* the test hands this phone the answer for the question it is on (a phone cannot know it) */
      const n = (document.getElementById('frp-n').textContent.match(/QUESTION (\d+)/) || [])[1];
      const k = window.__answer; if (!k || String(k.q) !== n) return;
      want = opts.findIndex((o) => mode === 'told' ? o.textContent === k.a : o.textContent !== k.a);
    }
    if (want < 0) return;
    if (!opts[want].classList.contains('sel')) hit(opts[want]); else hit(go);
  }, 150);
};
const VIEW = () => {
  const on = document.querySelector('#game-root .screen.on');
  const g = (id) => { const e = document.getElementById(id); return e ? e.textContent.trim() : ''; };
  return { on: on ? on.id : '', rules: g('frp-rules'), podme: g('frp-podme'), end1: g('frp-end1'), end2: g('frp-end2'),
    surv: document.querySelectorAll('#frp-podrows .frp-row').length, screens: (window.__screens || []).join(), seen: Object.keys(window.__seen || {}) };
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
  await host.goto(BASE + '/party/host.html?game=firstfrost&cloud=1&fr_fast=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2000);
  const lob = await host.evaluate(() => ({ code: document.getElementById('ps-code').textContent.trim(),
    mode: !document.getElementById('ps-mode').hidden, phonesOn: document.getElementById('ps-mode-phones').classList.contains('on'),
    seatRow: !document.getElementById('ps-seatrow').hidden }));
  ok(/^[A-Z0-9]{4}$/.test(lob.code), 'room code made');
  ok(lob.mode && lob.phonesOn && lob.seatRow, 'First Frost offers phones only, the default on a phone sized host, with a name field');
  await host.type('#ps-seat-name', 'Hosty');
  await host.tap('#ps-seat-go');
  const phones = [];
  for (const n of ['Penny', 'Jessie', 'Gus']) {
    const p = await fresh(PHONE);
    p.on('pageerror', (e) => errs.push(n + ': ' + e.message.slice(0, 140)));
    await p.goto(BASE + '/party/play.html?cloud=1&r=' + lob.code, { waitUntil: 'networkidle2', timeout: 90000 });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    await p.tap('#pj-go');
    phones.push({ n, p });
  }
  let roster = '';
  for (let i = 0; i < 30; i++) { await sleep(500); roster = await host.evaluate(() => document.getElementById('ps-roster').textContent);
    if (/Hosty \(you\)/.test(roster) && /Penny/.test(roster) && /Jessie/.test(roster) && /Gus/.test(roster)) break; }
  ok(/Hosty \(you\)/.test(roster) && /Gus/.test(roster), 'the host is in the roster as a player, with three phones');
  const seat = host.frames().find((f) => /seat=1/.test(f.url()));
  ok(!!seat, 'the host page carries its seat');
  await seat.evaluate(AUTOPILOT, 'right', 'chill');
  await phones[0].p.evaluate(AUTOPILOT, 'wrong', 'fog');
  await phones[1].p.evaluate(AUTOPILOT, 'told', 'freeze');
  await phones[2].p.evaluate(AUTOPILOT, 'none', 'chill');
  await host.tap('#ps-start');
  await sleep(1500);
  const all = () => [['seat', seat], ['Penny', phones[0].p], ['Jessie', phones[1].p], ['Gus', phones[2].p]];
  const views = async () => { const out = []; for (const [, p] of all()) out.push(await p.evaluate(VIEW)); return out; };
  let v = await views();
  ok(v.every((x) => x.on === 'frp-rules'), 'rules on every phone, the seat too: ' + v.map((x) => x.on).join(','));
  ok(/Three frost marks turn you into the Frost/.test(v[1].rules) && /Example:/.test(v[1].rules), 'the rules in Astra\'s words, with an example');
  const bar = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar === 'Start now,More reading time', 'the host bar offers Start now and More reading time during the rules: ' + bar);
  if (SHOTS) await phones[1].p.screenshot({ path: SHOTS + '/fr-phone-rules-412.png' });
  await host.evaluate(() => { const b = [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].find((x) => x.textContent === 'Start now'); b.click(); });
  const shot = {};
  let done = false; const t0 = Date.now();
  while (Date.now() - t0 < 300000) {
    const hs = await host.evaluate(() => { const s = window.__firstfrost.state(); return { q: s.qi + 1, a: s.answer, scr: s.screen }; });
    if (hs.scr === 'fr-q') for (const i of [0, 1]) await phones[i].p.evaluate((k) => { window.__answer = k; }, { q: hs.q, a: hs.a });
    v = await views();
    if (SHOTS) {
      if (!shot.q && v[1].on === 'frp-q') { shot.q = 1; await phones[1].p.screenshot({ path: SHOTS + '/fr-phone-question-412.png' }); }
      if (!shot.vote && v[3].on === 'frp-vote') { shot.vote = 1; await phones[2].p.screenshot({ path: SHOTS + '/fr-phone-vote-412.png' }); }
      if (!shot.fq && v[3].on === 'frp-fq') { shot.fq = 1; await sleep(300); await phones[2].p.screenshot({ path: SHOTS + '/fr-phone-frostq-412.png' }); }
      if (!shot.rev && v[0].on === 'frp-r') { shot.rev = 1; await host.screenshot({ path: SHOTS + '/fr-host-seat-reveal-412.png' }); }
      if (!shot.hq && v[0].on === 'frp-q') { shot.hq = 1; await host.screenshot({ path: SHOTS + '/fr-host-seat-question-412.png' }); }
    }
    if (v.every((x) => x.on === 'frp-pod')) { done = true; break; }
    await sleep(200);
  }
  ok(done, 'the game reached the podium on every phone in ' + Math.round((Date.now() - t0) / 1000) + ' s');
  const st = await host.evaluate(() => window.__firstfrost.state());
  v = await views();
  const names = ['seat', 'Penny', 'Jessie', 'Gus'];
  v.forEach((x, i) => console.log('  INFO  ' + names[i] + ' screens: ' + x.screens.slice(0, 160)));
  v.forEach((x, i) => {
    ok(/frp-q|frp-fq/.test(x.screens) && /frp-r,/.test(x.screens) && /frp-pod/.test(x.screens), `${names[i]} saw a question, a reveal and the podium`);
  });
  for (const i of [1, 3]) {
    const s = v[i].seen;
    ok(s.some((k) => k === 'r:You are the Frost. Choose the next weather.'), `${names[i]} froze and read "You are the Frost. Choose the next weather."`);
    ok(s.some((k) => k === 'vote:3'), `${names[i]} (Frost) had the weather vote with three choices`);
    ok(s.some((k) => /^fq:(The room chose [A-Z ]+\.|No weather this round\.)\|\d+\|Your weather points: \d+\.$/.test(k)),
      `${names[i]} (Frost) had the Frost question view: the weather, the ledger, its weather points: ` + JSON.stringify(s.filter((k) => /^fq:/.test(k)).slice(0, 2)));
  }
  const wxSeen = v.map((x) => x.seen.filter((k) => /^wx:/.test(k)));
  ok(wxSeen.every((w) => w.length > 0), 'the weather announcement reached every phone, the seat too: ' + JSON.stringify(wxSeen));
  const asked = st.qi, survivor = st.living.length === 1;   /* qi has moved past the last question asked */
  const want = 'You scored ' + (asked * 100 + (survivor ? 300 : 0)) + ' points.';
  ok(v[0].podme === want, 'the host seat (right every time) scored 100 a question' + (survivor ? ' + 300 as the last survivor' : '') + ': "' + v[0].podme + '" (want "' + want + '")');
  ok(!survivor && v[2].end1 === 'Twelve questions complete.' && v[2].end2 === 'Still standing: Hosty and Jessie.', 'the twelve question ending on a phone: "' + v[2].end1 + ' ' + v[2].end2 + '"');
  ok(v.every((x) => x.surv === 4), 'the survival panel lists all four on every phone');
  const bar2 = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar2 === 'Play again,Another game,End night', 'the host bar carries the podium controls: ' + bar2);
  if (SHOTS) { await phones[0].p.screenshot({ path: SHOTS + '/fr-phone-podium-412.png' }); await host.screenshot({ path: SHOTS + '/fr-host-seat-podium-412.png' }); }
  for (const [n, p] of all()) {
    const words = await p.evaluate(() => document.getElementById('game-root').innerText + ' ' + document.body.innerText);
    ok(!/big screen/i.test(words), `${n}: no "big screen" words on the phone`);
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await host.evaluate(async (c) => { try { await firebase.app('party').database().ref('party/' + c).remove(); } catch (e) {} }, lob.code);
  await b.close();
  console.log(fails.length ? 'NOTV_FIRSTFROST_FAIL ' + fails.length : 'NOTV_FIRSTFROST_PASS');
  process.exit(fails.length ? 1 : 0);
})();
