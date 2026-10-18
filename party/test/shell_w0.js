/* WHACK BOX SHELL FOUNDATION (Astra's review, 18 Oct 2026), end to end on a REAL room (?cloud=1, the live party
   database; separate browser contexts are separate phones). One Mothlight room, a shared screen host at 1280x720.
     D03  the lobby says who is here against the range; a pasted code (lower case, spaces, a whole invite link) still
          joins; a full room refuses the next phone in words; a late arrival is told "You play next game".
     D02  lite: the host page hidden mid question PAUSES the room (phones say so, the clock holds its seconds) and
          showing it again carries on from the time left, one question at a time, no burst of skipped reveals.
     D11  a room that drops below the minimum at the start of the next question waits ("Waiting for players"), the
          host is offered Return to lobby after 30 s, and the round carries on when the player comes back.
     D08  End night asks once: Keep playing keeps the room, End night closes it on every phone.
   Removes its room. Run: node party/test/shell_w0.js [base] [shotdir]   base default http://127.0.0.1:8765 */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const SHOTS = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const fails = []; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
  const errs = [];
  const fresh = async (vp, tag) => { const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
    p.on('pageerror', (e) => errs.push(tag + ': ' + e.message.slice(0, 140)));
    await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} });
    await p.setViewport(vp); return p; };
  const PHONE = { width: 412, height: 915, isMobile: true, hasTouch: true };
  const host = await fresh({ width: 1280, height: 720 }, 'host');
  await host.goto(BASE + '/party/host.html?game=mothlight&cloud=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2000);
  const code = await host.evaluate(() => document.getElementById('ps-code').textContent.trim());
  const lobby0 = await host.evaluate(() => ({ count: document.getElementById('ps-count').textContent, start: document.getElementById('ps-start').textContent,
    roster: document.getElementById('ps-roster').textContent, join: document.getElementById('ps-joinline').textContent }));
  console.log('lobby', code, JSON.stringify(lobby0));
  ok(/^0 joined\. This game is for 3 to 8 players\.$/.test(lobby0.count), 'D03: the lobby states the range: ' + lobby0.count);
  ok(lobby0.start === 'Waiting for 3 more players', 'D03: the Start button says what is missing: ' + lobby0.start);
  ok(lobby0.roster === 'Waiting for players', 'D03: the empty roster reads Waiting for players');
  ok(/Join at .*\/join\. Enter room code [A-Z0-9]{4}\./.test(lobby0.join), 'D03: the join line names the address and the code: ' + lobby0.join);
  if (SHOTS) await host.screenshot({ path: SHOTS + '/w0-host-lobby-1280.png' });
  await host.evaluate(() => PartyShell.setMaxPlayers(3));

  // three phones: a lower case code with spaces, a whole pasted invite link, and a plain code
  const entries = [['Penny', ' ' + code.slice(0, 2).toLowerCase() + ' ' + code.slice(2).toLowerCase() + ' '],
                   ['Jessie', 'https://lucidwinds.com/party/play.html?r=' + code.toLowerCase()], ['Stephen', code]];
  const phones = [];
  for (const [n, c] of entries) {
    const p = await fresh(PHONE, n);
    await p.goto(BASE + '/party/play.html?cloud=1', { waitUntil: 'networkidle2', timeout: 90000 });
    await p.evaluate((n, c) => { document.getElementById('pj-name').value = n; const el = document.getElementById('pj-code');
      el.value = c; el.dispatchEvent(new Event('input', { bubbles: true })); }, n, c);
    await p.tap('#pj-go');
    phones.push({ n, p });
  }
  await sleep(4000);
  for (const ph of phones) {
    const s = await ph.p.evaluate(() => ({ joinOpen: document.getElementById('ps-join').classList.contains('on'), err: document.getElementById('pj-err').textContent }));
    ok(!s.joinOpen && !s.err, `D03: ${ph.n} joined with the code as typed or pasted (err="${s.err}")`);
  }
  // a fourth phone: the room is full at 3 (a test cap)
  const p4 = await fresh(PHONE, 'Del');
  await p4.goto(BASE + '/party/play.html?cloud=1&r=' + code, { waitUntil: 'networkidle2', timeout: 90000 });
  await p4.evaluate(() => { document.getElementById('pj-name').value = 'Del'; });
  await p4.tap('#pj-go');
  let fullErr = '';
  for (let i = 0; i < 20 && !fullErr; i++) { await sleep(400); fullErr = await p4.evaluate(() => document.getElementById('pj-err').textContent); }
  ok(fullErr === 'This room is full. Ask the host about the next game.', 'D03: a full room refuses the next phone in words: "' + fullErr + '"');
  if (SHOTS) await p4.screenshot({ path: SHOTS + '/w0-phone-full-412.png' });
  const lobby1 = await host.evaluate(() => ({ count: document.getElementById('ps-count').textContent, start: document.getElementById('ps-start').textContent }));
  ok(/^3 joined\..*The room is full\.$/.test(lobby1.count) && lobby1.start === 'Start with 3 players', 'D03: the host sees a full room and Start: ' + JSON.stringify(lobby1));
  await host.evaluate(() => PartyShell.setMaxPlayers(8));

  // start, skip the rules, wait for question 1 on the phones
  await host.click('#ps-start');
  await sleep(1500);
  await host.click('#ml-next');
  const tOf = (p) => p.evaluate(() => { const on = document.querySelector('#game-root .screen.on');
    return { on: on ? on.id : '', t: (document.getElementById('mlp-t') || {}).textContent || '', n: (document.getElementById('mlp-n') || {}).textContent || '',
      paused: document.getElementById('ps-paused').classList.contains('on'), pt: document.getElementById('ps-paused-t').textContent,
      seat: document.getElementById('ps-seat').classList.contains('on'), bye: document.getElementById('ps-bye').classList.contains('on') }; });
  let v = null;
  for (let i = 0; i < 30; i++) { await sleep(400); v = await tOf(phones[0].p); if (v.on === 'mlp-q' && +v.t > 0 && +v.t <= 17) break; }
  ok(v.on === 'mlp-q', 'question 1 is on the phones: ' + v.n);

  // ---- D02 lite: hide the host page ----
  const setVis = (p, s) => p.evaluate((s) => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => s });
    document.dispatchEvent(new Event('visibilitychange')); }, s);
  await setVis(host, 'hidden');
  await sleep(1500);
  const held = await tOf(phones[0].p);
  ok(held.paused && held.pt === 'This round is paused', 'D02: the phones say the round is paused: ' + held.pt);
  if (SHOTS) await phones[0].p.screenshot({ path: SHOTS + '/w0-phone-paused-412.png' });
  const hostQ0 = await host.evaluate(() => document.getElementById('ml-qn').textContent);
  await sleep(5000);
  const held2 = await tOf(phones[0].p);
  const hostQ1 = await host.evaluate(() => document.getElementById('ml-qn').textContent);
  ok(held2.t === held.t && hostQ1 === hostQ0, `D02: the clock holds its seconds while hidden (${held.t} then ${held2.t}, ${hostQ1})`);
  await setVis(host, 'visible');
  await sleep(1300);
  const back = await tOf(phones[0].p);
  ok(!back.paused && back.on === 'mlp-q' && +back.t <= +held.t && +back.t >= +held.t - 2,
    `D02: back on the question with the time it had left (held ${held.t}, now ${back.t})`);
  // the rest of the question plays out, then exactly one reveal and then question 2
  const seq = [];
  for (let i = 0; i < 60; i++) { await sleep(500); const x = await tOf(phones[0].p); const key = x.on + ' ' + x.n;
    if (!seq.length || seq[seq.length - 1] !== key) seq.push(key); if (x.on === 'mlp-q' && /QUESTION 2 /.test(x.n)) break; }
  ok(seq.join(' > ').replace(/ QUESTION 1 OF 12/g, '') .startsWith('mlp-q') && seq.some((s) => s.startsWith('mlp-r')) && /QUESTION 2 OF 12$/.test(seq[seq.length - 1]),
    'D02: no burst on return, the room went question, reveal, next question: ' + seq.join(' > '));

  // ---- D11: Stephen leaves; the next question waits for players ----
  const st = phones[2];
  await st.p.goto('about:blank');
  let low = null;
  for (let i = 0; i < 80; i++) { await sleep(500); low = await tOf(phones[0].p); if (low.paused) break; }
  ok(low.paused && low.pt === 'Waiting for players', 'D11: the next question waits for players on the phones: ' + low.pt + ' ' + low.n);
  const bar = await host.evaluate(() => ({ shown: !document.getElementById('ps-pausebar').hidden, t: document.getElementById('ps-pausebar-t').textContent,
    lobby: !document.getElementById('ps-pause-lobby').hidden }));
  ok(bar.shown && /Waiting for players/.test(bar.t) && !bar.lobby, 'D11: the host screen says so, no Return to lobby yet: ' + bar.t);
  const lt0 = (await tOf(phones[0].p)).t;
  await sleep(31000);
  const bar2 = await host.evaluate(() => ({ lobby: !document.getElementById('ps-pause-lobby').hidden }));
  const lt1 = (await tOf(phones[0].p)).t;
  ok(bar2.lobby, 'D11: after 30 s the host is offered Return to lobby');
  ok(lt0 === lt1, `D11: the question clock held while the room waited (${lt0} then ${lt1})`);
  if (SHOTS) await host.screenshot({ path: SHOTS + '/w0-host-lowpause-1280.png' });
  // Stephen comes back in the same tab (same player)
  await st.p.goto(BASE + '/party/play.html?cloud=1&r=' + code, { waitUntil: 'networkidle2', timeout: 90000 });
  await st.p.tap('#pj-go');
  let res = null;
  for (let i = 0; i < 30; i++) { await sleep(500); res = await tOf(phones[0].p); if (!res.paused) break; }
  const bar3 = await host.evaluate(() => !document.getElementById('ps-pausebar').hidden);
  ok(!res.paused && !bar3, 'D11: the round carries on when the player is back (phones and host)');

  // ---- D03: a late arrival is told they play next game ----
  const late = await fresh(PHONE, 'Late');
  await late.goto(BASE + '/party/play.html?cloud=1&r=' + code, { waitUntil: 'networkidle2', timeout: 90000 });
  await late.evaluate(() => { document.getElementById('pj-name').value = 'Late'; });
  await late.tap('#pj-go');
  let lv = null;
  for (let i = 0; i < 20; i++) { await sleep(400); lv = await late.evaluate(() => ({ on: document.getElementById('ps-seat').classList.contains('on'),
    t: document.querySelector('#ps-seat .ps-lost-t').textContent })); if (lv.on) break; }
  ok(lv.on && lv.t === 'You play next game', 'D03: a late arrival reads "You play next game"');

  // ---- D08: End night asks once ----
  await host.evaluate(() => PartyShell.closeRoom());
  await sleep(300);
  const c1 = await host.evaluate(() => ({ shown: !document.getElementById('ps-confirm').hidden, t: document.getElementById('ps-confirm-t').textContent }));
  ok(c1.shown && c1.t === 'End this party for everyone?', 'D08: End night asks first: ' + c1.t);
  if (SHOTS) await host.screenshot({ path: SHOTS + '/w0-host-confirm-1280.png' });
  await host.click('#ps-confirm-no');
  await sleep(2500);
  const k = await tOf(phones[0].p);
  ok(!k.bye && !(await host.evaluate(() => !document.getElementById('ps-confirm').hidden)), 'D08: Keep playing keeps the room open');
  await host.evaluate(() => PartyShell.closeRoom());
  await sleep(200);
  await host.click('#ps-confirm-yes');
  let bye = null;
  for (let i = 0; i < 20; i++) { await sleep(400); bye = await tOf(phones[0].p); if (bye.bye) break; }
  const byeT = await phones[0].p.evaluate(() => document.querySelector('#ps-bye .ps-lost-t').textContent);
  ok(bye.bye && byeT === 'This room has closed', 'D08: End night closes the room on the phones: ' + byeT);
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await host.evaluate(async (c) => { try { await firebase.app('party').database().ref('party/' + c).remove(); } catch (e) {} }, code);
  await b.close();
  console.log(fails.length ? 'SHELL_W0_FAIL ' + fails.length : 'SHELL_W0_PASS');
  process.exit(fails.length ? 1 : 0);
})();
