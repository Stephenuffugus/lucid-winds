/* WIDE MARGIN RULES, from Astra's review (18 Oct 2026, WIDEMARGIN-D01 to D04), tested against the LIVE host module:
   D02 the score table keeps the copy's promise at EVERY distance from 0 to 100 (150/100/70/40/15/5 within
       3/7/12/20/30/beyond, never 0 for a saved guess); every player tied for closest earns 50 extra, apart from the
       base; a missing guess is missing (no points, never the closest); no saved guess means no bonus.
   D01 the quarantined entries (Astra's named drifting ice coverage, food water with no record, the catfish claim,
       the branded tile question, and the rest) never reach a game.
   D04 a deck of ten never deals two of one family, at most two science questions, at least four topics, and no two
       neighbours from the same topic.
   D03 played for real in a practice room (host page + three phone tabs, this browser, no network): the dial is a
       draft (moving after a save is not a save, and says so), a nudged but unsaved dial is not a guess ("No guess
       saved this round."), an untouched 50 saved on purpose counts; the phone shows its own distance and points;
       the reveal lists every saved guess; no phase payload before a reveal carries the answer or anybody's guess;
       the TV says "About N%" unless the answer is exact; the standings after round five name the round; the game
       completes exactly once.
   Run: node party/test/widemargin_rules.js      (serves the repo itself on port 8244) */
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((rq, rs) => { let p = rq.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { rs.writeHead(404); rs.end('nf'); return; }
    rs.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); rs.end(d); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://localhost:8244/party/';
const table = (d) => (d <= 3 ? 150 : d <= 7 ? 100 : d <= 12 ? 70 : d <= 20 ? 40 : d <= 30 ? 15 : 5);

/* the content sidecars, read straight from the file the game loads */
const sb = { window: {} };
new vm.Script(fs.readFileSync(path.join(ROOT, 'party/games/widemargin/content.js'), 'utf8')).runInNewContext(sb);
const QUAR = sb.window.WIDEMARGIN_QUARANTINE, FAM = sb.window.WIDEMARGIN_FAMILY, EXACT = sb.window.WIDEMARGIN_EXACT;
const BYID = {}; sb.window.WIDEMARGIN_BANK.forEach((q) => { BYID[q.id] = q; });

(async () => {
  await new Promise((r) => server.listen(8244, r));
  const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 30000, args: ['--no-sandbox', '--disable-dev-shm-usage',
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'] });
  const fails = []; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
  const errs = [];
  const page = async (tag, vp) => { const p = await b.newPage(); p.on('pageerror', (e) => errs.push(tag + ': ' + e.message.slice(0, 140)));
    await p.evaluateOnNewDocument(() => {
      try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {}
      window.__seen = []; const BC = window.BroadcastChannel;
      window.BroadcastChannel = function (n) { const c = new BC(n); c.addEventListener('message', (e) => window.__seen.push(e.data)); return c; };
      window.BroadcastChannel.prototype = BC.prototype;
    });
    if (vp) await p.setViewport(vp); return p; };
  const press = (pg, sel) => pg.evaluate((sel) => { const b = document.querySelector(sel); if (!b || b.disabled) return false;
    const r = b.getBoundingClientRect(); if (!r.width) return false;
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const t = el && (el.closest('button,[role=slider]') || el); if (t !== b) return false; b.click(); return true; }, sel);
  const key = (pg, k) => pg.evaluate((k) => { const t = document.getElementById('wmp-track');
    t.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })); }, k);

  // ---- D02, D01, D04 against the module's own functions
  const host = await page('host', { width: 1280, height: 720 });
  await host.goto(BASE + 'host.html?game=widemargin&wm_fast=1', { waitUntil: 'networkidle2' });
  await host.waitForFunction(() => window.__widemargin && window.__widemargin.award, { timeout: 15000 });
  const all = await host.evaluate(() => { const o = []; for (let d = 0; d <= 100; d++) o.push(window.__widemargin.award(d)); return o; });
  const bad = all.map((v, d) => (v !== table(d) ? d + ':' + v : null)).filter(Boolean);
  ok(bad.length === 0, 'D02: the table at every distance 0 to 100 is 150/100/70/40/15/5 within 3/7/12/20/30/beyond' + (bad.length ? ' (wrong at ' + bad.join(' ') + ')' : ''));
  ok(Math.min(...all) === 5 && all.every((v) => v >= 5), 'D02: the promise is true: every saved guess earns at least 5 at every distance (lowest ' + Math.min(...all) + ')');
  const edges = [0, 3, 4, 7, 8, 12, 13, 20, 21, 30, 31, 100].map((d) => all[d]);
  ok(JSON.stringify(edges) === JSON.stringify([150, 150, 100, 100, 70, 70, 40, 40, 15, 15, 5, 5]), 'D02: both sides of every band edge: ' + edges);
  const sc = await host.evaluate(() => {
    const S = window.__widemargin.score;
    return {
      tie: S(50, { g1: 45, g2: 55, g3: 80 }, ['g1', 'g2', 'g3'], ['g1', 'g2', 'g3']),
      missing: S(50, { g1: 50 }, ['g1', 'g2', 'g3'], ['g1', 'g2', 'g3']),
      none: S(50, {}, ['g1', 'g2'], ['g1', 'g2']),
      far: S(10, { g1: 95, g2: 100 }, ['g1', 'g2'], ['g1', 'g2']),
      edge: S(40, { g1: 43, g2: 44 }, ['g1', 'g2'], ['g1', 'g2']),
      out: S(40, { g1: 40 }, ['g1'], ['g1', 'g9']),
      endpoints: S(0, { g1: 0, g2: 100 }, ['g1', 'g2'], ['g1', 'g2'])
    };
  });
  ok(sc.tie.res.g1.pts === 150 && sc.tie.res.g2.pts === 150 && sc.tie.res.g1.base === 100 && sc.tie.res.g1.bonus === 50 && sc.tie.res.g2.bonus === 50,
    'D02: two players tied for closest (5 away) BOTH earn the 50, kept apart from the base: 100 + 50 each');
  ok(sc.tie.res.g3.pts === 15 && sc.tie.res.g3.bonus === 0, 'D02: 30 away earns 15 and no bonus');
  ok(sc.missing.res.g2.got === 'none' && sc.missing.res.g2.pts === 0 && sc.missing.res.g2.bonus === 0 && sc.missing.res.g1.pts === 200,
    'D02: a missing guess is missing (0, never closest); the only saved guess is exact and closest: 150 + 50');
  ok(sc.none.best === null && sc.none.res.g1.pts === 0 && sc.none.res.g2.pts === 0, 'D02: no saved guess, nobody scores, no closest bonus');
  ok(sc.far.res.g1.pts === 55 && sc.far.res.g1.base === 5 && sc.far.res.g2.pts === 5, 'D02: a far guess still earns 5, and the closer of two far guesses takes the 50 (55 and 5)');
  ok(sc.edge.res.g1.base === 150 && sc.edge.res.g2.base === 100, 'D02: 3 away earns 150, 4 away earns 100');
  ok(sc.out.res.g9.got === 'out' && sc.out.res.g9.pts === 0, 'D02: a player not in the room when the question opened is out, not a miss');
  ok(sc.endpoints.res.g1.pts === 200 && sc.endpoints.res.g2.pts === 5, 'D02: both endpoints score (0 on 0 is 150 + 50; 100 on 0 is 5)');

  const named = ['wm-0034', 'wm-0040', 'wm-0111', 'wm-0112', 'wm-0018', 'wm-0019', 'wm-0020', 'wm-0021', 'wm-0022', 'wm-0023', 'wm-0024', 'wm-0025', 'wm-0067', 'wm-0122'];
  ok(named.every((id) => QUAR[id]), 'D01: Astra\'s named entries are quarantined (ice coverage that drifts, food water with no record, the catfish, the branded tiles)');
  ok(Object.keys(QUAR).every((id) => BYID[id]), 'D01: every quarantined id is still in the bank file (ids never renumbered)');
  const q = await host.evaluate(() => window.__widemargin.quarantined());
  ok(q.length === 0, 'D01: no quarantined entry is in the live pool');
  ok(BYID['wm-0006'].answer === 69, 'D01: wm-0006 rounds USGS 68.7 half up to 69');
  const cats = new Set(sb.window.WIDEMARGIN_BANK.map((x) => x.category));
  ok([...cats].every((c) => ['earth', 'space', 'animals', 'plants', 'body', 'materials', 'world', 'science', 'food'].includes(c)), 'D01: every category is one of the declared nine: ' + [...cats].sort().join(' '));

  const decks = await host.evaluate(() => { const o = []; for (let i = 0; i < 300; i++) o.push(window.__widemargin.deck(10).map((x) => x.id)); return o; });
  let famRep = 0, sciOver = 0, fewTopics = 0, adjacent = 0, short = 0, quarDealt = 0, topicOver = 0;
  decks.forEach((d) => {
    if (d.length !== 10) short++;
    const f = {}, topics = new Set(), per = {}; let sci = 0;
    d.forEach((id, i) => { if (QUAR[id]) quarDealt++;
      const fam = FAM[id]; if (fam) { if (f[fam]) famRep++; f[fam] = 1; }
      const c = BYID[id].category; topics.add(c); per[c] = (per[c] || 0) + 1; if (c === 'science') sci++;
      if (i && BYID[d[i - 1]].category === c) adjacent++; });
    if (sci > 2) sciOver++; if (topics.size < 4) fewTopics++; if (Math.max(...Object.values(per)) > 3) topicOver++;
  });
  ok(short === 0 && quarDealt === 0, `D01/D04: 300 decks of ten, none short, no quarantined entry dealt (${quarDealt})`);
  ok(famRep === 0, `D04: no deck deals two entries of one family (${famRep} repeats in 300 decks)`);
  ok(sciOver === 0, `D04: at most two science questions per deck (${sciOver} decks over)`);
  ok(fewTopics === 0, `D04: every deck spans at least four topics (${fewTopics} under)`);
  ok(topicOver === 0, `D04: no topic more than three times in a deck (${topicOver} decks over)`);
  ok(adjacent === 0, `D04: no two neighbours share a topic (${adjacent} adjacent pairs in 300 decks)`);

  // ---- D03 played: a practice room, three phone tabs in this browser
  const code = await host.evaluate(() => document.getElementById('ps-code').textContent.trim());
  const phones = [];
  for (const n of ['Ada', 'Bo', 'Cy']) {
    const p = await page(n, { width: 412, height: 915, isMobile: true, hasTouch: true });
    await p.goto(BASE + 'play.html?r=' + code, { waitUntil: 'networkidle2' });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    await press(p, '#pj-go'); phones.push({ n, p });
  }
  await host.waitForFunction(() => !document.getElementById('ps-start').disabled, { timeout: 15000 });
  await press(host, '#ps-start');
  await host.waitForFunction(() => document.getElementById('wm-rules').classList.contains('on'), { timeout: 10000 });
  const rulesTV = await host.evaluate(() => document.getElementById('wm-rules').innerText);
  ok(/Every saved guess earns at least 5 points/.test(rulesTV) && /25% means 25 out of 100/.test(rulesTV), 'copy: the TV rules make the promise the table keeps, and teach out of one hundred');
  const onScreen = (p) => p.evaluate(() => { const s = document.querySelector('#game-root .screen.on'); return s ? s.id : ''; });
  const waitScreen = async (p, id, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { if ((await onScreen(p)) === id) return true; await sleep(80); } return false; };
  await waitScreen(phones[0].p, 'wmp-rules', 3000);
  const rulesPh = await phones[0].p.evaluate(() => document.getElementById('wmp-rules').innerText);
  ok(/Every saved guess earns at least 5 points/.test(rulesPh) && /25% means 25 out of 100/.test(rulesPh) && /This game: 10 questions/.test(rulesPh), 'copy: the phone rules carry the same promise, the hundred squares and the game\'s length');
  await press(host, '#wm-next');
  const [A, B, C] = phones;
  for (const ph of phones) ok(await waitScreen(ph.p, 'wmp-q'), `${ph.n} sees the question and the dial`);
  // A: Home, save (0); then End WITHOUT saving -> the saved 0 is what counts
  await key(A.p, 'Home'); await press(A.p, '#wmp-lock');
  await A.p.waitForFunction(() => /^Saved guess: 0%/.test(document.getElementById('wmp-note').textContent), { timeout: 3000 }).catch(() => {});
  const a1 = await A.p.evaluate(() => document.getElementById('wmp-note').textContent);
  ok(/^Saved guess: 0%\. You can change your number, then tap Save changes\./.test(a1), 'D03: Save sends, the host acknowledges: "' + a1 + '"');
  await key(A.p, 'End');
  const a2 = await A.p.evaluate(() => ({ t: document.getElementById('wmp-note').textContent, v: document.getElementById('wmp-val').textContent, b: document.getElementById('wmp-lock').textContent }));
  ok(a2.v === '100' && /^Changes not saved\. Your saved guess is 0%/.test(a2.t) && a2.b === 'Save changes', 'D03: moving after a save is not a save, and says so: "' + a2.t + '" [' + a2.b + ']');
  // B: nudges, never saves
  await press(B.p, '#wmp-up'); await press(B.p, '#wmp-up');
  // C: saves the untouched 50 on purpose
  await press(C.p, '#wmp-lock');
  const count = await host.evaluate(() => document.getElementById('wm-qin').textContent);
  ok(/^2 of 3 guesses saved$/.test(count), 'copy: the TV counts saved guesses, never what they are: "' + count + '"');
  ok(await waitScreen(A.p, 'wmp-r', 9000), 'the round reveals at the deadline (not everybody saved)');
  const txt = (p) => p.evaluate(() => document.getElementById('wmp-rt2').textContent + ' | ' + document.getElementById('wmp-rs').textContent + ' | ' + document.getElementById('wmp-truth').textContent);
  const rA = await txt(A.p), rB = await txt(B.p), rC = await txt(C.p);
  const st = await host.evaluate(() => window.__widemargin.state());
  const q0 = BYID[st.deck[0]], ans = q0.answer;
  const dA = Math.abs(0 - ans), dC = Math.abs(50 - ans);
  ok(new RegExp('^You were ' + dA + ' percentage points? away\\. \\+' + table(dA) + ' ').test(rA), `D03: the SAVED 0 counted, not the unsaved 100 (answer ${ans}): "${rA.split(' | ')[0]}"`);
  ok(/^No guess saved this round\./.test(rB), 'D03: a dial nudged but never saved is not a guess: "' + rB.split(' | ')[0] + '"');
  ok(new RegExp('^You were ' + dC + ' percentage points? away\\. \\+' + table(dC) + ' ').test(rC), 'D03: an untouched 50 saved on purpose counts: "' + rC.split(' | ')[0] + '"');
  const closer = dA < dC ? A : dC < dA ? C : null;
  if (closer) ok(/Closest in the room\. \+50 bonus/.test(await txt(closer.p)), 'D02: the closest phone says "Closest in the room. +50 bonus"');
  const truth = (EXACT[q0.id] ? '' : 'About ') + ans + '%';
  ok(rA.endsWith(truth + '.'), `D01: the phone states the truth as "${truth}." (exact: ${!!EXACT[q0.id]})`);
  const tv = await host.evaluate(() => ({ t: document.getElementById('wm-vtruth').textContent, d: document.querySelectorAll('#wm-vdist > span').length,
    marks: document.querySelectorAll('#wm-vline .wm-mark').length, src: document.getElementById('wm-vsrc').textContent }));
  ok(tv.t === truth && tv.marks === 2 && tv.d === 2 && /^Source: /.test(tv.src), `D04: the TV reveal: "${tv.t}", 2 markers, 2 distances, the source`);
  const marks = await B.p.evaluate(() => [...document.querySelectorAll('#wmp-marks .wmp-row')].map((r) => r.textContent));
  ok(marks.length === 2 && marks.every((m) => /% , \d+ away|%, \d+ away/.test(m)), 'D04: every phone lists every SAVED guess by name with its distance: ' + JSON.stringify(marks));

  // let the room play on to the podium (each phone saves a random number every round)
  for (const ph of phones) await ph.p.evaluate(() => { setInterval(() => {
    const on = document.querySelector('#game-root .screen.on'); if (!on || on.id !== 'wmp-q') return;
    const b = document.getElementById('wmp-lock'); if (!b.disabled) { document.getElementById('wmp-up').click(); b.click(); } }, 300); });
  let stand = '', done = false; const tEnd = Date.now() + 120000;
  while (Date.now() < tEnd) {
    if (!stand && (await onScreen(A.p)) === 'wmp-stand') stand = await A.p.evaluate(() => document.getElementById('wmp-standh').textContent + ' | ' + document.getElementById('wmp-standrows').innerText);
    if ((await host.evaluate(() => window.PartyShell.completed().n)) > 0) { done = true; break; }
    await sleep(200);
  }
  ok(/^Scores so far, after round 5 of 10/.test(stand) && /\(you\)/.test(stand), 'the standings after round five name the round and mark this phone: "' + stand.split(' | ')[0] + '"');
  ok(done, 'the game reaches the podium');
  await sleep(600);
  const comp = await host.evaluate(() => window.PartyShell.completed());
  ok(comp.n === 1 && Object.keys(comp.results || {}).length === 3, 'gameComplete fired exactly once, with all three players');
  const pod = await A.p.evaluate(() => ({ on: document.querySelector('#game-root .screen.on').id, me: document.getElementById('wmp-podme').textContent, rows: document.querySelectorAll('#wmp-podrows .wmp-row').length }));
  ok(pod.on === 'wmp-pod' && /^Your total is \d+/.test(pod.me) && pod.rows === 3, 'the phone podium: "' + pod.me + '", ' + pod.rows + ' rows');

  // the payloads: nothing before a reveal carries the answer or anybody's guess
  for (const ph of phones) {
    const seen = await ph.p.evaluate(() => window.__seen);
    const early = seen.filter((m) => m && m.t === 'phase' && m.name !== 'reveal' && m.data &&
      (m.data.answer !== undefined || m.data.marks !== undefined || m.data.results !== undefined));
    ok(early.length === 0, `${ph.n}'s phone received no phase payload carrying the answer or a guess before a reveal`);
    const acks = seen.filter((m) => m && m.t === 'game' && m.msg && m.msg.t === 'gack');
    ok(acks.length > 0 && acks.every((m) => m.to && m.to !== '*'), `every saved guess acknowledgement ${ph.n}'s phone could see is addressed to one phone (${acks.length} seen)`);
    const counts = seen.filter((m) => m && m.t === 'game' && m.msg && m.msg.t === 'gcount');
    ok(counts.every((m) => Object.keys(m.msg).sort().join() === 'n,of,r,t'), `the room wide count carries only the count (${counts.length} seen)`);
  }
  const intents = (await A.p.evaluate(() => window.__seen)).filter((m) => m && m.t === 'intent' && m.msg && m.msg.t === 'save');
  console.log('  NOTE  data level: Ada\'s practice channel carried ' + intents.length + ' save intents in all (each phone\'s own and the others\', dropped unread; no screen shows them)');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await b.close(); server.close();
  console.log(fails.length ? 'WIDEMARGIN_RULES_FAIL ' + fails.length : 'WIDEMARGIN_RULES_PASS');
  process.exit(fails.length ? 1 : 0);
})();
