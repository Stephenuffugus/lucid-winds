/* BEARING RULES, from Astra's review (18 Oct 2026, BEARING-D01 to D04), tested against the LIVE host module:
   D02 every roster from 3 to 8 gets two full Lantern cycles (6 to 16 rounds) and the Short game one cycle; every
       player holds the Lantern exactly the same number of times; the order cycles. The bands score 150/100/50/20/0
       within 5/12/20/30. The Lantern earns the average over every ELIGIBLE guesser, a missing position counting 0,
       rounded half up; no valid position pays nothing; the Lantern is never scored as a guesser.
   D04 the quarantined pairs never reach a game.
   D01 + D03 played for real in a practice room (host page + four phone tabs, this browser, no network): only the
       Lantern's phone shows the secret spot; "Need another pair" gives a new pair once, same round; a Lantern who
       never gives the clue voids the round (no points) and gets ONE retry; an unsaved pointer is not a guess (moved
       but never saved scores "No position saved"); saving again changes the position, and moving after a save is not
       a save; the Lantern's average matches the rule; no phase payload before a reveal carries the spot, and every
       private spot message is addressed to one phone; the TV never draws the spot before the reveal; a Lantern who
       has LEFT the room is skipped (the game ends without their turn).
   Run: node party/test/bearing_rules.js      (serves the repo itself on port 8243) */
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((rq, rs) => { let p = rq.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { rs.writeHead(404); rs.end('nf'); return; }
    rs.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); rs.end(d); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://localhost:8243/party/';
const award = (d) => (d <= 5 ? 150 : d <= 12 ? 100 : d <= 20 ? 50 : d <= 30 ? 20 : 0);

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
    });
    if (vp) await p.setViewport(vp); return p; };
  /* a click from inside the page on the element really at the button's centre (a covered button does nothing),
     so background tabs need no paint */
  const press = (pg, sel) => pg.evaluate((sel) => { const b = document.querySelector(sel); if (!b || b.disabled) return false;
    const r = b.getBoundingClientRect(); if (!r.width) return false;
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const t = el && (el.closest('button,[role=slider]') || el); if (t !== b) return false; b.click(); return true; }, sel);
  const key = (pg, k) => pg.evaluate((k) => { const t = document.getElementById('brp-track');
    t.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })); }, k);

  // ---- D02 and D04 against the module's own functions
  const host = await page('host', { width: 1280, height: 720 });
  await host.goto(BASE + 'host.html?game=bearing&br_fast=1', { waitUntil: 'networkidle2' });
  await host.waitForFunction(() => window.__bearing && window.__bearing.schedule, { timeout: 15000 });
  for (let n = 3; n <= 8; n++) for (const short of [false, true]) {
    const r = await host.evaluate((n, short) => {
      const ids = []; for (let i = 0; i < n; i++) ids.push('p' + i);
      const out = []; for (let k = 0; k < 20; k++) {
        const s = window.__bearing.schedule(ids, short), c = {};
        s.forEach((x) => { c[x] = (c[x] || 0) + 1; });
        let cyc = true; for (let i = n; i < s.length; i++) if (s[i] !== s[i - n]) cyc = false;
        out.push({ len: s.length, counts: Object.values(c), keys: Object.keys(c).length, cyc, rounds: window.__bearing.rounds(n, short) });
      } return out;
    }, n, short);
    const want = short ? n : 2 * n, each = want / n;
    ok(r.every((x) => x.len === want && x.rounds === want && x.keys === n && x.counts.every((c) => c === each) && x.cyc),
      `D02: ${n} players, ${short ? 'short' : 'standard'}: ${want} rounds, every player holds the Lantern ${each} time${each > 1 ? 's' : ''}, the order cycles`);
  }
  const bands = await host.evaluate(() => [0, 5, 6, 12, 13, 20, 21, 30, 31, 92].map((d) => window.__bearing.award(d)));
  ok(JSON.stringify(bands) === JSON.stringify([150, 150, 100, 100, 50, 50, 20, 20, 0, 0]), 'D02: bands 150/100/50/20/0 within 5/12/20/30 at every edge: ' + bands);
  const sc = await host.evaluate(() => {
    const S = window.__bearing.score;
    return {
      frac: S(40, { g1: 40, g2: 50 }, ['g1', 'g2', 'g3'], 'L', ['L', 'g1', 'g2', 'g3']),   // 150 + 100 + missing 0 = 83.33
      half: S(40, { g1: 40, g2: 90 }, ['g1', 'g2', 'g3', 'g4'], 'L', ['L', 'g1', 'g2', 'g3', 'g4']),   // 150 + 0 + 0 + 0 = 37.5
      two: S(40, { g1: 40, g2: 95 }, ['g1', 'g2'], 'L', ['L', 'g1', 'g2']),   // (150 + 0) / 2 = 75
      none: S(40, {}, ['g1', 'g2'], 'L', ['L', 'g1', 'g2']),
      misses: S(10, { g1: 90, g2: 95 }, ['g1', 'g2'], 'L', ['L', 'g1', 'g2']),
      selfie: S(40, { L: 40, g1: 90 }, ['g1'], 'L', ['L', 'g1']),
      gone: S(40, { g1: 40 }, ['g1'], 'L', ['L', 'g1', 'g9'])
    };
  });
  ok(sc.frac.res.L.pts === 83 && sc.frac.res.g3.got === 'none' && sc.frac.res.g3.pts === 0, 'D02: a missing position counts 0 in the average: (150 + 100 + 0) / 3 = 83');
  ok(sc.half.res.L.pts === 38, 'D02: rounded half up: (150 + 0 + 0 + 0) / 4 = 37.5 -> ' + sc.half.res.L.pts);
  ok(sc.two.res.L.pts === 75 && sc.two.res.g2.pts === 0 && sc.two.res.g2.got === 'far', 'D02: a far position scores 0 and still counts: (150 + 0) / 2 = 75');
  ok(sc.none.res.L.pts === 0 && sc.none.valid === 0, 'D02: no valid position pays nothing');
  ok(sc.misses.res.L.pts === 0 && sc.misses.valid === 2, 'D02: all misses: the Lantern earns 0');
  ok(sc.selfie.res.L.got === 'lantern' && sc.selfie.res.L.pts === 0 && sc.selfie.of === 1, 'D02: the Lantern is never scored as a guesser (their own position is ignored)');
  ok(sc.gone.res.g9.got === 'out' && sc.gone.res.L.pts === 150 && sc.gone.of === 1, 'D02: a player who was not in the room when the placing opened is not in the average');
  const q = await host.evaluate(() => window.__bearing.quarantined());
  ok(q.length === 0, 'D04: no quarantined pair (Morning to Night and the rest) can reach a game');

  // ---- D01 and D03 played: a practice room, four phone tabs in this browser
  const code = await host.evaluate(() => document.getElementById('ps-code').textContent.trim());
  const phones = [];
  for (const n of ['Ada', 'Bo', 'Cy', 'Del']) {
    const p = await page(n, { width: 412, height: 915, isMobile: true, hasTouch: true });
    await p.goto(BASE + 'play.html?r=' + code, { waitUntil: 'networkidle2' });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    await press(p, '#pj-go'); phones.push({ n, p });
  }
  await host.waitForFunction(() => !document.getElementById('ps-start').disabled, { timeout: 15000 });
  await press(host, '#ps-start');
  await host.waitForFunction(() => document.getElementById('br-rules').classList.contains('on'), { timeout: 10000 });
  await sleep(300);
  await press(host, '#br-short');
  const state = () => host.evaluate(() => window.__bearing.state());
  let st = await state();
  ok(st.short && st.total === 4 && new Set(st.schedule).size === 4, 'Short game for four: 4 rounds, everybody once');
  await press(host, '#br-next');
  const ids = {};
  for (const ph of phones) ids[await ph.p.evaluate(() => window.PartyShell.playerId)] = ph;
  const onScreen = (p) => p.evaluate(() => { const s = document.querySelector('#game-root .screen.on'); return s ? s.id : ''; });
  const waitScreen = async (p, id, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { if ((await onScreen(p)) === id) return true; await sleep(100); } return false; };
  const ends = (p, id) => p.evaluate((id) => document.getElementById(id).textContent, id);

  st = await state();
  const L1 = ids[st.lantern], gs = phones.filter((x) => x !== L1);
  const leaver = ids[st.schedule[3]];
  ok(await waitScreen(L1.p, 'brp-lant'), 'D01: the Lantern sees the secret spot and the clue buttons');
  await L1.p.waitForFunction(() => /Your secret spot: \d+ of 100/.test(document.getElementById('brp-lspot').textContent), { timeout: 5000 }).catch(() => {});
  const spotTxt = await L1.p.evaluate(() => document.getElementById('brp-lspot').textContent);
  ok(/Your secret spot: \d+ of 100/.test(spotTxt), 'D01: the spot is drawn on the Lantern\'s phone: "' + spotTxt + '"');
  ok(await waitScreen(gs[0].p, 'brp-watch'), 'D01: everybody else sees the two ends and who is choosing a clue');
  const others = await Promise.all(gs.map((g) => g.p.evaluate(() => document.body.innerText)));
  ok(others.every((t) => !/secret spot: \d/.test(t)), 'D01: no other phone screen shows the spot');
  const tvClue = await host.evaluate(() => !!document.querySelector('#br-cspec .br-bullseye'));
  ok(!tvClue, 'D01: the TV draws no spot while the clue is being chosen');
  // "Need another pair": once, same round, a new pair
  const pairA = await ends(gs[0].p, 'brp-wends');
  ok(await press(L1.p, '#brp-swap'), 'D01: the Lantern can ask for another pair');
  await gs[0].p.waitForFunction((a) => document.getElementById('brp-wends').textContent !== a, { timeout: 5000 }, pairA).catch(() => {});
  const pairB = await ends(gs[0].p, 'brp-wends');
  st = await state();
  const swapHidden = await L1.p.evaluate(() => document.getElementById('brp-swap').hidden);
  ok(pairB !== pairA && st.ri === 0 && st.swapped, `D01: a new pair, the same round (${pairA} -> ${pairB})`);
  ok(swapHidden, 'D01: only once a round');
  // the Lantern never gives the clue -> void, then ONE retry for the same Lantern
  ok(await waitScreen(gs[0].p, 'brp-r', 9000), 'D01: no clue by the deadline ends the attempt');
  const v1 = await gs[0].p.evaluate(() => document.getElementById('brp-rt2').textContent + ' ' + document.getElementById('brp-rs').textContent);
  ok(/does not count/.test(v1) && /another pair/.test(v1), 'D01: the void says so: "' + v1 + '"');
  ok(await waitScreen(L1.p, 'brp-lant', 8000), 'D01: the same Lantern gets one retry');
  st = await state();
  ok(st.ri === 0 && ids[st.lantern] === L1 && st.retried, 'D01: the retry keeps round 1 and the Lantern');
  const sc0 = await host.evaluate(() => [...document.querySelectorAll('#br-strip0 b')].map((x) => x.textContent));
  ok(sc0.length === 4 && sc0.every((x) => x === '0'), 'D01: the void scored nobody (' + sc0.join(',') + ')');
  // the clue, then the placing
  await L1.p.waitForFunction(() => !document.getElementById('brp-said').disabled, { timeout: 4000 }).catch(() => {});
  ok(await press(L1.p, '#brp-said'), 'the Lantern says they have given the clue');
  for (const g of gs) ok(await waitScreen(g.p, 'brp-guess'), `${g.n} may place a position`);
  ok(await waitScreen(L1.p, 'brp-lwait'), 'the Lantern waits with their spot');
  const tvGuess = await host.evaluate(() => !!document.querySelector('#br-gspec .br-bullseye'));
  ok(!tvGuess, 'D01: the TV draws no spot while the room places');
  // g0: Home, save (0); then End without saving -> the saved 0 is what counts
  await key(gs[0].p, 'Home'); await press(gs[0].p, '#brp-lock');
  await gs[0].p.waitForFunction(() => /Saved position: 0/.test(document.getElementById('brp-gs').textContent), { timeout: 4000 }).catch(() => {});
  const s0 = await gs[0].p.evaluate(() => document.getElementById('brp-gs').textContent);
  ok(/^Saved position: 0\./.test(s0), 'D03: Save sends, the host acknowledges: "' + s0 + '"');
  await key(gs[0].p, 'End');
  const s0b = await gs[0].p.evaluate(() => ({ t: document.getElementById('brp-gs').textContent, v: document.getElementById('brp-val').textContent }));
  ok(s0b.v === '100' && /Not saved yet\. Your saved position is 0/.test(s0b.t), 'D03: moving after a save is not a save: "' + s0b.t + '"');
  // g1: moves with the nudges, never saves
  await press(gs[1].p, '#brp-up'); await press(gs[1].p, '#brp-up');
  // g2: saves the untouched pointer on purpose (an explicit save counts)
  await press(gs[2].p, '#brp-lock');
  ok(await waitScreen(gs[0].p, 'brp-r', 9000), 'the round reveals at the deadline');
  const txt = async (p) => p.evaluate(() => document.getElementById('brp-rt2').textContent + ' | ' + document.getElementById('brp-rs').textContent);
  const r0 = await txt(gs[0].p), r1 = await txt(gs[1].p), r2 = await txt(gs[2].p), rl = await txt(L1.p);
  const t = +(/The secret spot was (\d+)/.exec(r0) || [])[1];
  ok(Number.isFinite(t), 'the reveal names the spot: "' + r0 + '"');
  const p0 = award(Math.abs(0 - t)), p2 = award(Math.abs(50 - t));
  ok(p0 ? new RegExp('\\+' + p0 + '$').test(r0.split(' | ')[0]) : /was \d+ away/.test(r0), `D03: the SAVED position (0) is the one that counted, not the unsaved 100: "${r0.split(' | ')[0]}"`);
  ok(/No position saved this round/.test(r1), 'D03: a pointer moved but never saved is not a guess: "' + r1.split(' | ')[0] + '"');
  ok(p2 ? new RegExp('\\+' + p2 + '$').test(r2.split(' | ')[0]) : /was \d+ away/.test(r2), 'D03: an untouched pointer saved on purpose counts: "' + r2.split(' | ')[0] + '"');
  const want = Math.floor((p0 + p2 + 0) / 3 + 0.5);
  ok((p0 + p2) === 0 ? /nobody scores|earn 0/.test(rl) : new RegExp('You earn ' + want + ' for your clue').test(rl), `D02: the Lantern earns the average over all three eligible (${p0} + 0 + ${p2}) / 3 = ${want}: "${rl}"`);
  const marks = await gs[1].p.evaluate(() => document.querySelectorAll('#brp-marks .brp-row').length);
  ok(marks === 2, 'D04: the reveal lists every SAVED position by name and symbol (2): ' + marks);
  const tvRev = await host.evaluate(() => !!document.querySelector('#br-vspec .br-bullseye') && /room average|found the spot|spread out|close together/.test(document.getElementById('br-vavg').textContent + document.getElementById('br-vverdict').textContent));
  ok(tvRev, 'D04: the TV reveal draws the spot and the bands and says the Lantern\'s average');

  // the Lantern of the LAST round leaves; rounds 2 and 3 play, round 4 is skipped
  const leaverName = leaver.n;
  await leaver.p.close();
  const live = phones.filter((x) => x !== leaver);
  const lanterns = []; let tEnd = Date.now() + 90000, done = false;
  while (Date.now() < tEnd) {
    st = await state();
    /* after the last round the module skips past the end with the old Lantern still set: only real rounds count */
    if (st.ri >= 1 && st.ri < st.total && st.lantern && !lanterns.includes(st.lantern + '@' + st.ri)) lanterns.push(st.lantern + '@' + st.ri);
    for (const ph of live) {
      const on = await onScreen(ph.p).catch(() => '');
      if (on === 'brp-lant') await press(ph.p, '#brp-said').catch(() => {});
      if (on === 'brp-guess') { const dis = await ph.p.evaluate(() => document.getElementById('brp-lock').disabled).catch(() => true); if (!dis) await press(ph.p, '#brp-lock').catch(() => {}); }
    }
    if ((await host.evaluate(() => window.PartyShell.completed().n)) > 0) { done = true; break; }
    await sleep(250);
  }
  ok(done, 'the game reaches the podium');
  const leaverId = Object.keys(ids).find((k) => ids[k] === leaver);
  ok(!lanterns.some((x) => x.startsWith(leaverId + '@')), `D02: ${leaverName}, who left, was skipped as the Lantern (${lanterns.length} Lantern turns seen after the first round)`);
  ok(lanterns.length === 2, 'D02: the two remaining scheduled Lanterns each had their turn: ' + lanterns.length);

  // the payloads: no spot before a reveal, the private spot message addressed to the Lantern only
  for (const ph of live) {
    const seen = await ph.p.evaluate(() => window.__seen);
    const early = seen.filter((m) => m && m.t === 'phase' && m.name !== 'reveal' && m.data && m.data.target !== undefined);
    ok(early.length === 0, `D01: ${ph.n}'s phone received no phase payload carrying the spot before a reveal`);
    const tgt = seen.filter((m) => m && m.t === 'game' && m.msg && m.msg.t === 'target');
    ok(tgt.length > 0 && tgt.every((m) => m.to && m.to !== '*'), `D01: every spot message ${ph.n}'s phone could see is addressed to one phone, never the room (${tgt.length} seen)`);
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await b.close(); server.close();
  console.log(fails.length ? 'BEARING_RULES_FAIL ' + fails.length : 'BEARING_RULES_PASS');
  process.exit(fails.length ? 1 : 0);
})();
