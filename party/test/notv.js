/* NO TV MODE, end to end (18 Oct 2026, Stephen: "can we make everyones screen the screen to watch?").
   A phone sized host page (412x915) in no TV mode PLAYS TOO from its seat, and two phones in separate browser
   contexts join a real room (?cloud=1, the live party database). A full Mothlight game runs to the podium.
   Asserts: the lobby offers the mode and defaults to it on a phone; the host's seat is in the roster and counts
   toward the minimum; every phone (the seat included) shows the question text, the moths, the reveal answer and the
   standings; the seat's answers score; the host bar carries Start now and the podium controls. Removes its room.
   Run: node party/test/notv.js [base] [shotdir]      base default http://127.0.0.1:8765 (serve the repo root) */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const SHOTS = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the phones play themselves from inside the page, hit tested (the element really at the button's centre gets the
   tap, so a covered button does nothing, as for a person) */
const AUTOPILOT = (choice) => {
  setInterval(() => {
    const q = document.getElementById('mlp-q');
    if (!q || !q.classList.contains('on')) return;
    const b = document.getElementById(choice);
    if (!b || b.classList.contains('sel')) return;
    const r = b.getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const t = el && (el.closest('button') || el);
    if (t) t.click();
  }, 250);
};
const VIEW = () => {
  const on = document.querySelector('#game-root .screen.on');
  const g = (id) => { const e = document.getElementById(id); return e ? e.textContent.trim() : ''; };
  return { on: on ? on.id : '', fact: g('mlp-f'), ans: g('mlp-ans'), chips: document.querySelectorAll('#mlp-ct .mlp-chip, #mlp-cf .mlp-chip').length,
    room: document.querySelectorAll('#mlp-room .mlp-row').length, stand: document.querySelectorAll('#mlp-standrows .mlp-row').length,
    pod: document.querySelectorAll('#mlp-podrows .mlp-row').length, podme: g('mlp-podme'), wait: g('mlp-wait-t') };
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

  // 1. the host, on a phone
  const host = await fresh(PHONE);
  host.on('pageerror', (e) => errs.push('host: ' + e.message.slice(0, 140)));
  await host.goto(BASE + '/party/host.html?game=mothlight&cloud=1&ml_fast=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2000);
  const lob = await host.evaluate(() => ({ code: document.getElementById('ps-code').textContent.trim(),
    mode: !document.getElementById('ps-mode').hidden, phonesOn: document.getElementById('ps-mode-phones').classList.contains('on'),
    seatRow: !document.getElementById('ps-seatrow').hidden, note: document.getElementById('ps-mode-note').textContent,
    qr: !!document.querySelector('#ps-qr svg') }));
  console.log('lobby', JSON.stringify(lob));
  ok(/^[A-Z0-9]{4}$/.test(lob.code), 'room code made');
  ok(lob.mode && lob.phonesOn && lob.seatRow, 'a phone sized host defaults to On every phone, with a name field');
  ok(lob.qr, 'the join square is on the host phone for the others to scan');
  await host.type('#ps-seat-name', 'Hosty');
  await host.tap('#ps-seat-go');
  // 2. two phones in their own browsers
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
  ok(/Hosty \(you\)/.test(roster), 'the host is in the roster as a player: ' + roster.replace(/\s+/g, ' '));
  const startTxt = await host.evaluate(() => { const s = document.getElementById('ps-start'); return { d: s.disabled, t: s.textContent }; });
  ok(!startTxt.d && /3 players/.test(startTxt.t), 'the host seat counts toward the minimum: ' + startTxt.t);
  if (SHOTS) await host.screenshot({ path: SHOTS + '/notv-host-lobby-412.png' });
  const seat = host.frames().find((f) => /seat=1/.test(f.url()));
  ok(!!seat, 'the host page carries its seat (play.html?seat=1)');
  // autopilots: the seat says TRUE every time, Penny TRUE, Jessie FALSE
  await seat.evaluate(AUTOPILOT, 'mlp-true');
  await phones[0].p.evaluate(AUTOPILOT, 'mlp-true');
  await phones[1].p.evaluate(AUTOPILOT, 'mlp-false');
  await host.tap('#ps-start');
  await sleep(1200);
  // 3. rules: every phone shows them; the host bar offers Start now
  const views = async () => [await seat.evaluate(VIEW), await phones[0].p.evaluate(VIEW), await phones[1].p.evaluate(VIEW)];
  let v = await views();
  ok(v.every((x) => x.on === 'mlp-rules'), 'rules on every phone, the seat too: ' + v.map((x) => x.on).join(','));
  const bar = await host.evaluate(() => ({ cls: document.body.className, btns: [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent), mute: !!document.querySelector('#ps-hostbar .ps-hb-mute'), floatMute: getComputedStyle(document.getElementById('ps-mute')).display,
    frame: getComputedStyle(document.getElementById('ps-seat-frame')).display }));
  ok(bar.frame === 'block' && /notv-playing/.test(bar.cls), 'the host phone shows its seat once the game starts');
  ok(bar.btns.join() === 'Start now', 'the host bar offers Start now during the rules: ' + bar.btns.join());
  ok(bar.mute && bar.floatMute === 'none', 'the sound switch sits in the host bar, not over the seat');
  await host.tap('#ps-hostbar .ps-hb-btn');
  // 4. watch the whole game
  const seen = { q: [0, 0, 0], chips: [0, 0, 0], ans: [0, 0, 0], room: [0, 0, 0], stand: [0, 0, 0] };
  let shotQ = false, shotR = false, shotS = false, shotHQ = false, done = false;
  const t0 = Date.now();
  while (Date.now() - t0 < 150000) {
    v = await views();
    v.forEach((x, i) => {
      if (x.on === 'mlp-q' && x.fact) seen.q[i]++;
      if (x.chips >= 2) seen.chips[i]++;
      if (x.on === 'mlp-r' && /^It was (TRUE|FALSE)$/.test(x.ans)) seen.ans[i]++;
      if (x.on === 'mlp-r' && x.room === 3) seen.room[i]++;
      if (x.on === 'mlp-stand' && x.stand === 3) seen.stand[i]++;
    });
    if (SHOTS) {
      if (!shotQ && v[1].on === 'mlp-q' && v[1].chips >= 2) { shotQ = true; await phones[0].p.screenshot({ path: SHOTS + '/notv-phone-question-412.png' }); }
      if (!shotHQ && v[0].on === 'mlp-q') { shotHQ = true; await sleep(600); await host.screenshot({ path: SHOTS + '/notv-host-question-412.png' }); }
      if (!shotR && v[1].on === 'mlp-r' && v[1].room === 3) { shotR = true; await phones[0].p.screenshot({ path: SHOTS + '/notv-phone-reveal-412.png' }); }
      if (!shotS && v[1].on === 'mlp-stand') { shotS = true; await phones[0].p.screenshot({ path: SHOTS + '/notv-phone-standings-412.png' }); }
    }
    if (v.every((x) => x.on === 'mlp-pod')) { done = true; break; }
    await sleep(300);
  }
  ok(done, 'the game reached the podium on every phone in ' + Math.round((Date.now() - t0) / 1000) + ' s');
  ['seat', 'Penny', 'Jessie'].forEach((n, i) => {
    ok(seen.q[i] > 0, `${n} saw the question text`);
    ok(seen.chips[i] > 0, `${n} saw the moths land on each side`);
    ok(seen.ans[i] > 0, `${n} saw the reveal answer`);
    ok(seen.room[i] > 0, `${n} saw how the whole room answered`);
    ok(seen.stand[i] > 0, `${n} saw the standings`);
  });
  const pod = await seat.evaluate(VIEW);
  ok(pod.pod === 3 && /^You lit [1-9]\d*/.test(pod.podme), 'the host seat scored and sees the podium: "' + pod.podme + '"');
  const tvPod = await host.evaluate(() => document.getElementById('ml-podrows').textContent);
  ok(/Hosty/.test(tvPod), 'the room logic counted the host: ' + tvPod.replace(/\s+/g, ' ').slice(0, 80));
  const bar2 = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar .ps-hb-btn')].map((x) => x.textContent).join());
  ok(bar2 === 'Play again,Another game,End night', 'the host bar carries the podium controls: ' + bar2);
  if (SHOTS) { await phones[0].p.screenshot({ path: SHOTS + '/notv-phone-podium-412.png' }); await host.screenshot({ path: SHOTS + '/notv-host-podium-412.png' }); }
  const words = await phones[0].p.evaluate(() => document.body.innerText);
  ok(!/big screen/i.test(words), 'no "big screen" words on a phone in no TV mode');
  // 48 px targets on the host phone's bar and the phone's buttons
  const small = await host.evaluate(() => [...document.querySelectorAll('#ps-hostbar button')].filter((x) => { const r = x.getBoundingClientRect(); return r.height < 48; }).length);
  ok(small === 0, 'host bar buttons are 48 px or taller');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await host.evaluate(async (c) => { try { await firebase.app('party').database().ref('party/' + c).remove(); } catch (e) {} }, lob.code);
  await b.close();
  console.log(fails.length ? 'NOTV_FAIL ' + fails.length : 'NOTV_PASS');
  process.exit(fails.length ? 1 : 0);
})();
