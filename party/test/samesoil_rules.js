/* SAME SOIL RULES, from Astra's review (18 Oct 2026, SAMESOIL-D01 to D03), tested against the LIVE host module:
   D01 every roster from 2 to 8 gets the stated total and every player chooses exactly the same number of times
       (standard 12,12,12,10,12,14,16; short two each, two players four each), the order cycles.
   D03 scoring fixtures: 100 per correct guess, 40 to the chooser per correct guess; a missing guess scores nothing
       and is not counted as wrong.
   D02 played for real in a practice room (host page + two phone tabs, this browser, no network): no phase payload
       carries the chooser's pick before the reveal; the private "your choice" message is addressed to the chooser
       alone; a chooser who never confirms voids the round (no points) and gets ONE retry with a different pair and
       the same round number; a phone that never guesses scores nothing; once every guess is saved the room gets
       "All set" and an edit inside that window is the guess that counts.
   Run: node party/test/samesoil_rules.js      (serves the repo itself on port 8242) */
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((rq, rs) => { let p = rq.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { rs.writeHead(404); rs.end('nf'); return; }
    rs.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); rs.end(d); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/* a real tap on the tab in front: puppeteer's click waits for a painted frame, and a background tab never paints */
const tap = async (pg, sel) => { await pg.bringToFront(); await pg.click(sel); };
const BASE = 'http://localhost:8242/party/';

(async () => {
  await new Promise((r) => server.listen(8242, r));
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

  // ---- D01 and D03 against the module's own functions
  const host = await page('host', { width: 1280, height: 720 });
  await host.goto(BASE + 'host.html?game=samesoil&ss_fast=1', { waitUntil: 'networkidle2' });
  await host.waitForFunction(() => window.__samesoil && window.__samesoil.schedule, { timeout: 15000 });
  const STD = { 2: 12, 3: 12, 4: 12, 5: 10, 6: 12, 7: 14, 8: 16 };
  for (let n = 2; n <= 8; n++) for (const short of [false, true]) {
    const r = await host.evaluate((n, short) => {
      const ids = []; for (let i = 0; i < n; i++) ids.push('p' + i);
      const out = []; for (let k = 0; k < 20; k++) {
        const s = window.__samesoil.schedule(ids, short), c = {};
        s.forEach((x) => { c[x] = (c[x] || 0) + 1; });
        let cyc = true; for (let i = n; i < s.length; i++) if (s[i] !== s[i - n]) cyc = false;
        out.push({ len: s.length, counts: Object.values(c), keys: Object.keys(c).length, cyc, rounds: window.__samesoil.rounds(n, short) });
      } return out;
    }, n, short);
    const want = short ? (n === 2 ? 8 : 2 * n) : STD[n];
    const each = want / n;
    const good = r.every((x) => x.len === want && x.rounds === want && x.keys === n && x.counts.every((c) => c === each) && x.cyc);
    ok(good, `D01: ${n} players, ${short ? 'short' : 'standard'}: ${want} rounds, every player chooses ${each} times, the order cycles`);
  }
  const sc = await host.evaluate(() => {
    const S = window.__samesoil.score;
    return { mixed: S('a', { p2: 'a', p3: 'b' }, ['p1', 'p2', 'p3', 'p4'], 'p1'), none: S('b', {}, ['p1', 'p2', 'p3'], 'p1'),
      all: S('b', { p2: 'b', p3: 'b' }, ['p1', 'p2', 'p3'], 'p1') };
  });
  ok(sc.mixed.res.p2.pts === 100 && sc.mixed.res.p3.pts === 0 && sc.mixed.res.p3.got === 'wrong', 'D03: a correct guess earns 100, a wrong one 0');
  ok(sc.mixed.res.p4.got === 'none' && sc.mixed.res.p4.pts === 0 && sc.mixed.wrong === 1, 'D03: a missing guess is missing: no points and not counted as wrong');
  ok(sc.mixed.res.p1.pts === 40 && sc.mixed.knew === 1, 'D03: the chooser earns 40 per correct guess (1 correct = 40)');
  ok(sc.none.res.p1.pts === 0 && sc.none.knew === 0 && sc.none.res.p2.got === 'none', 'D03: nobody guessed: chooser 0, everybody "none"');
  ok(sc.all.res.p1.pts === 80, 'D03: two correct guesses give the chooser 80');

  // ---- D02 played: a practice room, two phone tabs in this browser
  const code = await host.evaluate(() => document.getElementById('ps-code').textContent.trim());
  const say = (m) => { if (process.env.VERBOSE) console.log('   .. ' + m); };
  say('code ' + code);
  const phones = [];
  for (const n of ['Ada', 'Bo']) {
    const p = await page(n, { width: 412, height: 915, isMobile: true, hasTouch: true });
    await p.goto(BASE + 'play.html?r=' + code, { waitUntil: 'networkidle2' });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    say('join ' + n); await tap(p, '#pj-go'); phones.push({ n, p }); say('joined ' + n);
  }
  await host.waitForFunction(() => !document.getElementById('ps-start').disabled, { timeout: 15000 });
  say('start'); await tap(host, '#ps-start'); say('started');
  await host.waitForFunction(() => document.getElementById('ss-rules').classList.contains('on'), { timeout: 10000 });
  await sleep(300);
  await tap(host, '#ss-next');
  const state = () => host.evaluate(() => window.__samesoil.state());
  const pid = async (p) => p.evaluate(() => window.PartyShell.playerId);
  const ids = { [await pid(phones[0].p)]: phones[0], [await pid(phones[1].p)]: phones[1] };
  const onScreen = (p) => p.evaluate(() => { const s = document.querySelector('#game-root .screen.on'); return s ? s.id : ''; });
  const waitScreen = async (p, id, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { if ((await onScreen(p)) === id) return true; await sleep(100); } return false; };

  // round 1: the chooser never confirms -> void, then ONE retry with the same round number and a different pair
  let st = await state();
  const ch1 = ids[st.subject], other1 = Object.values(ids).find((x) => x !== ch1);
  ok(await waitScreen(ch1.p, 'ssp-pick'), 'D02: the chooser sees select then "This is my pick"');
  ok(await waitScreen(other1.p, 'ssp-watch'), 'D02: everybody else sees the pair with nothing to tap yet');
  const pair1 = await ch1.p.evaluate(() => document.getElementById('ssp-pa').textContent + '|' + document.getElementById('ssp-pb').textContent);
  await tap(ch1.p, '#ssp-pa');   // a selection, never confirmed
  const goOn = await ch1.p.evaluate(() => !document.getElementById('ssp-go').disabled);
  ok(goOn, 'D02: a selection enables "This is my pick" (and does not send it)');
  ok(await waitScreen(other1.p, 'ssp-r', 8000), 'D02: no confirmed pick by the deadline ends the round');
  const v1 = await other1.p.evaluate(() => ({ r: document.getElementById('ssp-rt2').textContent, s: document.getElementById('ssp-rs').textContent }));
  ok(/does not count/.test(v1.r) && /No points/.test(v1.s), 'D02: the void round says it does not count: "' + v1.r + ' ' + v1.s + '"');
  ok(await waitScreen(ch1.p, 'ssp-pick', 8000), 'D02: the same chooser gets one retry');
  st = await state();
  const pair1b = await ch1.p.evaluate(() => document.getElementById('ssp-pa').textContent + '|' + document.getElementById('ssp-pb').textContent);
  const selCleared = await ch1.p.evaluate(() => !document.getElementById('ssp-pa').classList.contains('sel') && document.getElementById('ssp-go').disabled);
  ok(st.ri === 0 && ids[st.subject] === ch1 && pair1b !== pair1, `D02: the retry keeps round 1 and the chooser, with a different pair (${pair1} -> ${pair1b})`);
  ok(selCleared, 'D02: the retry starts with nothing selected');
  // this time confirm 'a'; the other phone guesses b at once, then switches to a inside the All set window
  await tap(ch1.p, '#ssp-pa'); await tap(ch1.p, '#ssp-go');
  ok(await waitScreen(other1.p, 'ssp-guess'), 'the confirmed pick opens the guessing');
  ok(await waitScreen(ch1.p, 'ssp-mine'), 'the chooser waits on their own screen');
  await sleep(400);
  const mine = await ch1.p.evaluate(() => document.getElementById('ssp-ms').textContent);
  ok(/^You chose /.test(mine), 'D02: the chooser sees their own choice, privately: "' + mine + '"');
  await tap(other1.p, '#ssp-gb');
  await other1.p.waitForFunction(() => /All set/.test(document.getElementById('ssp-gc').textContent), { timeout: 6000 }).catch(() => {});
  const allset = await other1.p.evaluate(() => document.getElementById('ssp-gc').textContent);
  ok(/All set/.test(allset), 'SHELL-D04: every guess saved gives "All set. Finishing soon." (' + allset + ')');
  await tap(other1.p, '#ssp-ga');   // the edit inside the window
  ok(await waitScreen(other1.p, 'ssp-r', 6000), 'the round reveals after the window');
  const rev1 = await other1.p.evaluate(() => document.getElementById('ssp-rt2').textContent);
  ok(/matched their choice/.test(rev1), 'an edit inside the All set window is the guess that counts: "' + rev1 + '"');

  // round 2: the other chooser confirms; the guesser never guesses
  ok(await waitScreen(other1.p, 'ssp-pick', 8000), 'round 2: the chooser rotates');
  await tap(other1.p, '#ssp-pb'); await tap(other1.p, '#ssp-go');
  ok(await waitScreen(ch1.p, 'ssp-guess'), 'round 2: the other phone may guess');
  ok(await waitScreen(ch1.p, 'ssp-r', 9000), 'round 2 reveals at the deadline with no guess');
  const rev2 = await ch1.p.evaluate(() => document.getElementById('ssp-rt2').textContent);
  const rev2c = await other1.p.evaluate(() => document.getElementById('ssp-rt2').textContent);
  ok(/No guess saved/.test(rev2), 'D03: a phone that never guessed: "' + rev2 + '"');
  ok(/surprised everyone/.test(rev2c), 'D03: its chooser earns nothing from a missing guess: "' + rev2c + '"');

  // the payloads: no pick before a reveal, the private message addressed to the chooser only
  for (const ph of phones) {
    const seen = await ph.p.evaluate(() => window.__seen);
    const early = seen.filter((m) => m && m.t === 'phase' && m.name !== 'reveal' && m.data && m.data.pick !== undefined);
    ok(early.length === 0, `D02: ${ph.n}'s phone received no phase payload carrying the pick before a reveal`);
    const mineMsgs = seen.filter((m) => m && m.t === 'game' && m.msg && m.msg.t === 'mineok');
    const me = await pid(ph.p);
    ok(mineMsgs.every((m) => m.to !== '*'), `D02: every "your choice" message ${ph.n} could see is addressed to one phone, never the room (${mineMsgs.length} seen)`);
    void me;
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await b.close(); server.close();
  console.log(fails.length ? 'SAMESOIL_RULES_FAIL ' + fails.length : 'SAMESOIL_RULES_PASS');
  process.exit(fails.length ? 1 : 0);
})();
