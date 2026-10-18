/* FIREFLY FUTURES RULES, from Astra's review (18 Oct 2026, FIREFLY-D01 to D04), tested against the LIVE modules:
   D01 the denominator: only saved Yes or No answers count; a Pass or a missing answer is left out, never a No; with
       fewer than three answers the round is void, shows nothing about the answers, and the same round number gets
       ONE more question; every phone and the TV show the same M and a 0 to M grid; scoring uses that M.
   D03 scoring fixtures: exact 100 (a tie gives both 100), the only exact guess 130 in total, one away 40 (at both
       ends of the range too), anything else or no guess 0.
   D02 privacy: no phase payload ever carries anybody's answer; M travels before the reveal, Y never does; every
       "your answer" acknowledgement is addressed to one phone, never the room. What remains (data level, reported,
       not fixed): a phone's own answer travels to the host as an intent on the room's channel, which other phones
       receive and drop.
   D04 the guess shows "Your guess" and "Guess saved"; this phone's own answer is shown to it alone while it guesses.
   Played in a practice room (host page + four phone tabs, this browser, no network).
   Run: node party/test/firefly_rules.js      (serves the repo itself on port 8243) */
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((rq, rs) => { let p = rq.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { rs.writeHead(404); rs.end('nf'); return; }
    rs.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); rs.end(d); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://localhost:8243/party/';
/* a hit tested tap from inside the page: whatever is really at the control's centre gets the click, so a covered
   button does nothing, as for a person (the fast clocks leave no time for a bring-to-front per tap) */
const tapIn = (p, sel) => p.evaluate((sel) => {
  const b = document.querySelector(sel); if (!b || b.disabled) return 'missing ' + sel;
  const r = b.getBoundingClientRect(); if (!r.width) return 'no size ' + sel;
  const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  const t = el && (el.closest('button') || el); if (t !== b) return 'covered ' + sel;
  b.click(); return null; }, sel);

(async () => {
  await new Promise((r) => server.listen(8243, r));
  const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 30000, args: ['--no-sandbox', '--disable-dev-shm-usage',
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'] });
  const fails = []; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
  const errs = [];
  const page = async (tag, vp) => { const p = await b.newPage(); p.on('pageerror', (e) => errs.push(tag + ': ' + e.message.slice(0, 140)));
    await p.evaluateOnNewDocument(() => {
      try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {}
      /* record every room message this page receives (the practice transport is a BroadcastChannel) */
      window.__seen = []; const BC = window.BroadcastChannel;
      window.BroadcastChannel = function (n) { const c = new BC(n); c.addEventListener('message', (e) => window.__seen.push(e.data)); return c; };
      window.BroadcastChannel.prototype = BC.prototype;
      /* every screen this page shows, in order: a 2 s reveal is over before a poll from outside comes round */
      window.__screens = [];
      setInterval(() => { const s = document.querySelector('#game-root .screen.on');
        if (s && window.__screens[window.__screens.length - 1] !== s.id) window.__screens.push(s.id); }, 30);
    });
    if (vp) await p.setViewport(vp); return p; };

  // ---- D01 and D03 against the module's own functions
  const host = await page('host', { width: 1280, height: 720 });
  await host.goto(BASE + 'host.html?game=firefly&ff_fast=1', { waitUntil: 'networkidle2' });
  await host.waitForFunction(() => window.__firefly && window.__firefly.score, { timeout: 15000 });
  const f = await host.evaluate(() => {
    const F = window.__firefly;
    return { t1: F.tally({ a: true, b: false, c: 'pass', d: true }), t2: F.tally({ a: true, b: 'pass' }), min: F.minAnswers,
      tie: F.score(3, { a: 3, b: 3, c: 2, d: 5 }, ['a', 'b', 'c', 'd', 'e']).res,
      sole: F.score(3, { a: 3, b: 4 }, ['a', 'b']).res,
      low: F.score(0, { a: 1, b: 0, c: 2 }, ['a', 'b', 'c']).res, high: F.score(4, { a: 3 }, ['a']).res };
  });
  ok(f.t1.m === 3 && f.t1.y === 2 && f.t1.passed === 1, 'D01: a Pass is left out of M and is not a No (Yes, No, Pass, Yes = 2 of 3)');
  ok(f.t2.m === 1 && f.t2.y === 1, 'D01: a missing answer is simply not counted');
  ok(f.min === 3, 'D01: fewer than three answers voids the round');
  ok(f.tie.a.pts === 100 && f.tie.b.pts === 100 && f.tie.a.got === 'exact', 'D03: two exact guesses both earn 100');
  ok(f.tie.c.pts === 40 && f.tie.c.got === 'close' && f.tie.d.pts === 0 && f.tie.d.got === 'miss', 'D03: one away earns 40, further earns 0');
  ok(f.tie.e.got === 'none' && f.tie.e.pts === 0, 'D03: no guess earns 0 and is "none", not a miss');
  ok(f.sole.a.pts === 130 && f.sole.a.got === 'sole' && f.sole.b.pts === 40, 'D03: the only exact guess earns 130 in total');
  ok(f.low.a.pts === 40 && f.low.b.pts === 130 && f.low.c.pts === 0, 'D03: at the bottom of the range, one away (1 when it was 0) earns 40');
  ok(f.high.a.pts === 40, 'D03: at the top of the range, one away (3 when it was 4) earns 40');

  // ---- played: a practice room, four phone tabs in this browser
  const code = await host.evaluate(() => document.getElementById('ps-code').textContent.trim());
  const N = ['Ada', 'Bo', 'Cy', 'Di'], ph = {};
  for (const n of N) {
    const p = await page(n, { width: 412, height: 915, isMobile: true, hasTouch: true });
    await p.goto(BASE + 'play.html?r=' + code, { waitUntil: 'networkidle2' });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    await p.bringToFront(); await p.click('#pj-go'); ph[n] = p;
  }
  await host.waitForFunction(() => !document.getElementById('ps-start').disabled, { timeout: 15000 });
  await host.bringToFront(); await host.click('#ps-start');
  await host.waitForFunction(() => document.getElementById('ff-rules').classList.contains('on'), { timeout: 10000 });
  const rulesTxt = await ph.Ada.evaluate(() => document.getElementById('ffp-rules').textContent);
  ok(/Example: four people answer and three say Yes/.test(rulesTxt) && /give an answer away/.test(rulesTxt),
    'B2.5: the phone rules carry the worked example and say plainly a total can give an answer away');
  await host.bringToFront(); await host.click('#ff-next');
  const state = () => host.evaluate(() => window.__firefly.state());
  const onScreen = (p) => p.evaluate(() => { const s = document.querySelector('#game-root .screen.on'); return s ? s.id : ''; });
  const waitScreen = async (p, id, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { if ((await onScreen(p)) === id) return true; await sleep(60); } return false; };
  const txt = (p, id) => p.evaluate((id) => (document.getElementById(id) || {}).textContent || '', id);
  /* each phone has shown this screen since its last mark (marks move on at every step, so a step never counts the last one) */
  const marks0 = {};
  const all = async (id, ms = 12000) => {
    const t = Date.now(), got = {};
    while (Date.now() - t < ms) {
      for (const n of N) if (!got[n]) {
        const s = await ph[n].evaluate(() => window.__screens);
        const i = s.indexOf(id, marks0[n] || 0);
        if (i >= 0) { got[n] = true; marks0[n] = i + 1; }
      }
      if (N.every((n) => got[n])) return true;
      await sleep(60);
    }
    return false; };

  // round 1, first question: Yes, No, Pass, nothing -> 2 answers -> void, then ONE more question, same round
  ok(await all('ffp-poll'), 'round 1: every phone shows the question with Yes, No and Pass');
  const q1 = (await state()).text;
  const tapsA = [await tapIn(ph.Ada, '#ffp-yes'), await tapIn(ph.Bo, '#ffp-no'), await tapIn(ph.Cy, '#ffp-pass')];
  ok(tapsA.every((x) => x === null), 'the taps reached Yes, No and Pass: ' + JSON.stringify(tapsA));
  await sleep(500);
  const saved = await txt(ph.Ada, 'ffp-note1'), passed = await txt(ph.Cy, 'ffp-note1');
  ok(/^Saved\. You can change your answer/.test(saved), 'D04: an answer is acknowledged by the host: "' + saved + '"');
  ok(/^Passed\./.test(passed), 'D02: a Pass is acknowledged quietly on that phone only: "' + passed + '"');
  ok(await all('ffp-void', 8000), 'D01: two answers (a Pass and a missing one left out) void the round on every phone');
  const voidTxt = await txt(ph.Bo, 'ffp-void');
  ok(/Too few answers this time\. Let us try another question\./.test(voidTxt) && !/\d of \d/.test(voidTxt.replace(/ROUND \d+ OF \d+/, '')),
    'D01: the void says so and shows nothing about the answers: "' + voidTxt.replace(/\s+/g, ' ').trim() + '"');
  ok(await all('ffp-poll', 8000), 'D01: the same round gets one more question');
  const st1 = await state();
  ok(st1.ri === 0 && st1.att === 1 && st1.text !== q1, `D01: still round 1 (attempt 2) with a different question (${q1} -> ${st1.text})`);
  const fresh = await ph.Ada.evaluate(() => !document.getElementById('ffp-yes').classList.contains('sel'));
  ok(fresh, 'the new question starts with nothing selected');

  // the retry: Yes, No, Yes, nothing -> M = 3, Y = 2; Di did not answer and still guesses
  await tapIn(ph.Ada, '#ffp-yes'); await tapIn(ph.Bo, '#ffp-no'); await tapIn(ph.Cy, '#ffp-yes');
  ok(await all('ffp-mkt', 8000), 'round 1: the guess opens on every phone');
  const asks = await Promise.all(N.map((n) => txt(ph[n], 'ffp-ask')));
  const grids = await Promise.all(N.map((n) => ph[n].evaluate(() => [...document.querySelectorAll('#ffp-grid .ffp-numbtn')].map((x) => x.textContent).join())));
  const tvAsk = await txt(host, 'ff-ask');
  ok(asks.every((a) => a === 'How many of these 3 answers were Yes?') && tvAsk === asks[0],
    'D01: every phone and the TV ask "How many of these 3 answers were Yes?" (the missing answer left out)');
  ok(grids.every((g) => g === '0,1,2,3'), 'D01: every phone offers 0 to 3: ' + grids[0]);
  const own = { Ada: await txt(ph.Ada, 'ffp-own'), Cy: await txt(ph.Cy, 'ffp-own'), Di: await txt(ph.Di, 'ffp-own') };
  ok(own.Ada === 'You answered Yes.' && own.Cy === 'You answered Yes.' && own.Di === 'You did not answer this one.',
    'B2.5: each phone sees its own answer, privately: ' + JSON.stringify(own));
  const hint = await txt(ph.Bo, 'ffp-note2');
  ok(/^Tap your guess\. Include your own Yes/.test(hint), 'copy: "' + hint + '"');
  await tapIn(ph.Ada, '#ffp-grid .ffp-numbtn[data-v="2"]'); await tapIn(ph.Bo, '#ffp-grid .ffp-numbtn[data-v="2"]');
  await tapIn(ph.Cy, '#ffp-grid .ffp-numbtn[data-v="1"]'); await tapIn(ph.Di, '#ffp-grid .ffp-numbtn[data-v="3"]');
  await sleep(400);
  const yours = await txt(ph.Ada, 'ffp-yours'), gsaved = await txt(ph.Ada, 'ffp-note2');
  ok(yours === 'Your guess: 2' && /^Guess saved/.test(gsaved), `D04: "${yours}" and "${gsaved}"`);
  await ph.Bo.waitForFunction(() => /All set/.test(document.getElementById('ffp-c2').textContent), { timeout: 5000 }).catch(() => {});
  ok(/All set/.test(await txt(ph.Bo, 'ffp-c2')), 'SHELL-D04: every guess saved gives "All set. Finishing soon."');
  ok(await all('ffp-r', 8000), 'round 1 reveals on every phone');
  const r1 = {}; for (const n of N) r1[n] = await txt(ph[n], 'ffp-rt');
  const yl = await txt(ph.Ada, 'ffp-yes-line');
  ok(yl === '2 of 3 answers were Yes.', 'the total first: "' + yl + '"');
  ok(r1.Ada === 'Exactly right. +100' && r1.Bo === 'Exactly right. +100', 'D03: a tied exact guess earns 100 each');
  ok(r1.Cy === 'One away. +40' && r1.Di === 'One away. +40', 'D03: one away earns 40 (Cy 1, Di 3): ' + r1.Cy + ' / ' + r1.Di);
  const marks = await ph.Cy.evaluate(() => [...document.querySelectorAll('#ffp-marks .ffp-mrow')].map((r) => r.textContent.replace(/\s+/g, ' ').trim()));
  ok(marks.length >= 3 && marks.some((m) => /^2\D*Ada.*Bo/.test(m)), 'every guess by name under its number: ' + JSON.stringify(marks));
  const revWords = await ph.Cy.evaluate(() => document.getElementById('ffp-r').textContent);
  ok(!/answered (Yes|No)|said (yes|no)/i.test(revWords.replace(/answers were Yes/g, '')), 'D02: no screen ties a name to a Yes or a No');

  // round 2: Yes, Yes, Yes, No -> M = 4, Y = 3; Ada 3 (the only exact), Bo 1, Cy nothing, Di 2
  ok(await all('ffp-poll', 9000), 'round 2 opens');
  await tapIn(ph.Ada, '#ffp-yes'); await tapIn(ph.Bo, '#ffp-yes'); await tapIn(ph.Cy, '#ffp-yes'); await tapIn(ph.Di, '#ffp-no');
  ok(await all('ffp-mkt', 8000), 'round 2: the guess opens');
  ok((await txt(ph.Di, 'ffp-ask')) === 'How many of these 4 answers were Yes?', 'D01: four answers, M = 4');
  await tapIn(ph.Ada, '#ffp-grid .ffp-numbtn[data-v="3"]'); await tapIn(ph.Bo, '#ffp-grid .ffp-numbtn[data-v="1"]');
  await tapIn(ph.Di, '#ffp-grid .ffp-numbtn[data-v="2"]');
  ok(await all('ffp-r', 9000), 'round 2 reveals at the deadline (Cy never guessed)');
  const r2 = {}; for (const n of N) r2[n] = await txt(ph[n], 'ffp-rt');
  ok(r2.Ada === 'The only exact guess. +130', 'D03: "' + r2.Ada + '"');
  ok(r2.Bo === 'You guessed 1. The total was 3.', 'copy: "' + r2.Bo + '"');
  ok(r2.Cy === 'No guess saved this round.', 'D03: a phone that never guessed: "' + r2.Cy + '"');
  ok(r2.Di === 'One away. +40', 'D03: "' + r2.Di + '"');
  const tot = await txt(ph.Ada, 'ffp-tot');
  ok(tot === 'Your total is 230.', 'the scores add up (100 + 130): "' + tot + '"');

  // the payloads
  for (const n of N) {
    const seen = await ph[n].evaluate(() => window.__seen);
    const phases = seen.filter((m) => m && m.t === 'phase');
    const leak = phases.filter((m) => m.data && (m.data.polls || m.data.answers || (m.name !== 'reveal' && m.data.yes !== undefined)));
    ok(leak.length === 0, `D02: ${n}'s phone got no phase payload with anybody's answer or the Yes count before a reveal (${phases.length} phases)`);
    const voids = phases.filter((m) => m.name === 'void');
    ok(voids.length > 0 && voids.every((m) => m.data.m === undefined && m.data.yes === undefined), `D01: ${n}'s void payloads carry no count`);
    const acks = seen.filter((m) => m && m.t === 'game' && m.msg && m.msg.t === 'pack');
    ok(acks.length > 0 && acks.every((m) => m.to !== '*'), `D02: every answer acknowledgement ${n} could see is addressed to one phone (${acks.length})`);
    if (n === 'Ada') {
      const others = seen.filter((m) => m && m.t === 'intent' && m.msg && m.msg.t === 'poll');
      console.log(`  NOTE  what remains (data level): Ada's channel carried ${others.length} poll intents from other phones; the module drops them, no screen shows them`);
    }
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await b.close(); server.close();
  console.log(fails.length ? 'FIREFLY_RULES_FAIL ' + fails.length : 'FIREFLY_RULES_PASS');
  process.exit(fails.length ? 1 : 0);
})();
