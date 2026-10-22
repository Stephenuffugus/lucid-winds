/* NO TV MODE, SAME SOIL end to end (18 Oct 2026, W2 from Astra's review B6.5).
   A phone sized host page (412x915) in no TV mode PLAYS TOO from its seat, and two phones in separate browser
   contexts join a real room (?cloud=1, the live party database). A full Same Soil game runs to the podium, and the
   chooser role rotates through the host's seat like anybody.
   Asserts: phones only is offered and is the default on a phone; the seat is in the roster; every phone (the seat
   included) shows the rules with the game's length, has a turn choosing, sees its own choice privately while the room
   guesses, watches someone else choose, guesses, and sees the reveal with every guess by name and symbol; the seat
   scores; the host bar carries Start now and Short game, then the podium controls. Removes its room.
   Run: node party/test/notv_samesoil.js [base] [shotdir]      base default http://127.0.0.1:8765 (serve the repo root) */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const SHOTS = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the phones play themselves from inside the page, hit tested (the element really at the button's centre gets the
   tap, so a covered button does nothing, as for a person): choose a side and confirm when choosing, guess when guessing */
const AUTOPILOT = (side) => {
  const hit = (id) => { const b = document.getElementById(id); if (!b || b.disabled) return false;
    const r = b.getBoundingClientRect(); if (!r.width) return false;
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const t = el && (el.closest('button') || el); if (t === b) { t.click(); return true; } return false; };
  setInterval(() => {
    const on = document.querySelector('#game-root .screen.on'); if (!on) return;
    if (on.id === 'ssp-pick') { const s = document.getElementById('ssp-p' + side);
      if (!s.classList.contains('sel')) hit('ssp-p' + side); else hit('ssp-go'); }
    if (on.id === 'ssp-guess' && !document.getElementById('ssp-g' + side).classList.contains('sel')) hit('ssp-g' + side);
  }, 250);
};
const VIEW = () => {
  const on = document.querySelector('#game-root .screen.on');
  const g = (id) => { const e = document.getElementById(id); return e ? e.textContent.trim() : ''; };
  return { on: on ? on.id : '', watch: g('ssp-wask') + ' ' + g('ssp-wa') + ' ' + g('ssp-wb'), mine: g('ssp-ms'),
    chips: document.querySelectorAll('#ssp-r .ssp-chip').length, result: g('ssp-rt2'), said: g('ssp-said'),
    pod: document.querySelectorAll('#ssp-podrows .ssp-row').length, podme: g('ssp-podme'), len: g('ssp-len') };
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
  await host.goto(BASE + '/party/host.html?game=samesoil&cloud=1&ss_fast=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2000);
  const lob = await host.evaluate(() => ({ code: document.getElementById('ps-code').textContent.trim(),
    mode: !document.getElementById('ps-mode').hidden, phonesOn: document.getElementById('ps-mode-phones').classList.contains('on'),
    seatRow: !document.getElementById('ps-seatrow').hidden }));
  ok(/^[A-Z0-9]{4}$/.test(lob.code), 'room code made');
  ok(lob.mode && lob.phonesOn && lob.seatRow, 'Same Soil offers phones only, the default on a phone sized host, with a name field');
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
  // everybody picks and guesses "a": every guess matches, so the seat scores both as chooser and as guesser
  await seat.evaluate(AUTOPILOT, 'a');
  await phones[0].p.evaluate(AUTOPILOT, 'a');
  await phones[1].p.evaluate(AUTOPILOT, 'a');
  await host.tap('#ps-start');
  await sleep(1500);
  const views = async () => [await seat.evaluate(VIEW), await phones[0].p.evaluate(VIEW), await phones[1].p.evaluate(VIEW)];
  let v = await views();
  ok(v.every((x) => x.on === 'ssp-rules'), 'rules on every phone, the seat too: ' + v.map((x) => x.on).join(','));
  ok(/12 rounds\. Each of you chooses 4 times/.test(v[1].len), 'the rules say this game\'s length: "' + v[1].len + '"');
  const bar = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar === 'Start now,Short game', 'the host bar offers Start now and Short game during the rules: ' + bar);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/ss-phone-rules-412.png' });
  await host.tap('#ps-hostbar .ps-hb-btn');
  const seen = { watch: [0, 0, 0], pick: [0, 0, 0], mine: [0, 0, 0], guess: [0, 0, 0], chips: [0, 0, 0], said: [0, 0, 0] };
  const shot = {};
  let done = false; const t0 = Date.now();
  while (Date.now() - t0 < 200000) {
    v = await views();
    v.forEach((x, i) => {
      if (x.on === 'ssp-watch' && / is choosing\. /.test(x.watch)) seen.watch[i]++;
      if (x.on === 'ssp-pick') seen.pick[i]++;
      if (x.on === 'ssp-mine' && /^You chose /.test(x.mine)) seen.mine[i]++;
      if (x.on === 'ssp-guess') seen.guess[i]++;
      if (x.on === 'ssp-r' && x.chips >= 2) seen.chips[i]++;
      if (x.on === 'ssp-r' && / chose$/.test(x.said)) seen.said[i]++;
    });
    if (SHOTS) {
      const P = phones[0].p;
      if (!shot.pick && v[1].on === 'ssp-pick') { shot.pick = 1; await P.screenshot({ path: SHOTS + '/ss-phone-chooser-412.png' }); }
      if (!shot.guess && v[1].on === 'ssp-guess') { shot.guess = 1; await P.screenshot({ path: SHOTS + '/ss-phone-guesser-412.png' }); }
      if (!shot.watch && v[1].on === 'ssp-watch') { shot.watch = 1; await P.screenshot({ path: SHOTS + '/ss-phone-watch-412.png' }); }
      if (!shot.mine && v[1].on === 'ssp-mine' && /^You chose/.test(v[1].mine)) { shot.mine = 1; await P.screenshot({ path: SHOTS + '/ss-phone-mine-412.png' }); }
      if (!shot.rev && v[1].on === 'ssp-r' && v[1].chips >= 2) { shot.rev = 1;
        await P.evaluate(() => { const t = document.getElementById('ssp-tog'); if (t && /Show/.test(t.textContent)) t.click(); });
        await P.screenshot({ path: SHOTS + '/ss-phone-reveal-412.png' }); }
      if (!shot.hostpick && v[0].on === 'ssp-pick') { shot.hostpick = 1; await sleep(300); await host.screenshot({ path: SHOTS + '/ss-host-seat-choosing-412.png' }); }
    }
    if (v.every((x) => x.on === 'ssp-pod')) { done = true; break; }
    await sleep(200);
  }
  ok(done, 'the game reached the podium on every phone in ' + Math.round((Date.now() - t0) / 1000) + ' s');
  ['seat', 'Penny', 'Jessie'].forEach((n, i) => {
    ok(seen.pick[i] > 0, `${n} had a turn as the chooser`);
    ok(seen.mine[i] > 0, `${n} saw their own choice while the room guessed`);
    ok(seen.watch[i] > 0, `${n} watched someone else choose (the pair and who is choosing)`);
    ok(seen.guess[i] > 0, `${n} guessed`);
    ok(seen.chips[i] > 0 && seen.said[i] > 0, `${n} saw the reveal with every guess by name and symbol`);
  });
  const pod = await seat.evaluate(VIEW);
  ok(pod.pod === 3 && /^Your total is [1-9]\d*/.test(pod.podme), 'the host seat scored and sees the podium: "' + pod.podme + '"');
  const bar2 = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar2 === 'Play again,Another game,End night', 'the host bar carries the podium controls: ' + bar2);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/ss-phone-podium-412.png' });
  const words = await phones[0].p.evaluate(() => document.body.innerText);
  ok(!/big screen/i.test(words), 'no "big screen" words on a phone in no TV mode');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await host.evaluate(async (c) => { try { await firebase.app('party').database().ref('party/' + c).remove(); } catch (e) {} }, lob.code);
  await b.close();
  console.log(fails.length ? 'NOTV_SAMESOIL_FAIL ' + fails.length : 'NOTV_SAMESOIL_PASS');
  process.exit(fails.length ? 1 : 0);
})();
