/* FIRST FROST RULES, from Astra's review (19 Oct 2026, FIRSTFROST-D01 to D04), tested against the LIVE modules:
   D01 the mark law (a wrong answer or no answer adds one mark, Deep Freeze two, never past three; a mark past the
       third counts for nothing), every ending reachable and said the same way (the last survivor +300 once; everyone
       frozen together, no bonus; twelve questions, still standing named, no bonus; nobody standing here), survival
       and the Frost's weather points as two panels with shared places for ties, gameComplete exactly once.
   D02 the weather differs: Chill halves the time, Fog shows the question and keeps the CHOICES out of every payload
       until they appear, Deep Freeze costs two marks; More reading time x1.5; the weather is announced on every phone
       before the question clock runs.
   D03 the vote: private, editable, acknowledged to one phone; the most chosen weather wins; a tie rotates Chill, Fog,
       Deep Freeze after the last winner; no votes, no weather; each Frost member frozen at the start of the round
       earns 40 for every mark actually added, whether or not their choice won; a player frozen this round earns
       nothing for it and votes from the next.
   D04 a Frost phone has a job in EVERY round: the vote, then during the question the weather, the question, the
       ledger of everybody still standing and its own weather points; freezing says "You are the Frost. Choose the
       next weather."
   Missing stays missing: an eligible player who never commits is 'none' (it costs the mark the rules say it costs)
   and is never reported as a wrong pick; a player away when a question opened takes no mark.
   Played in a practice room (host page + four phone tabs, this browser, no network), on fast clocks.
   Run: node party/test/firstfrost_rules.js      (serves the repo itself on port 8249) */
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((rq, rs) => { let p = rq.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { rs.writeHead(404); rs.end('nf'); return; }
    rs.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); rs.end(d); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://localhost:8249/party/';
const SHOTS = process.argv[2] || '';
/* a hit tested tap from inside the page: whatever is really at the control's centre gets the click */
const shot = async (p, file) => { if (!SHOTS) return; await p.bringToFront(); await sleep(120); await p.screenshot({ path: SHOTS + '/' + file }); };
const tapIn = (p, sel) => p.evaluate((sel) => {
  const b = document.querySelector(sel); if (!b || b.disabled) return 'missing or disabled ' + sel;
  const r = b.getBoundingClientRect(); if (!r.width) return 'no size ' + sel;
  const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  const t = el && (el.closest('button') || el); if (t !== b) return 'covered ' + sel;
  b.click(); return null; }, sel);

(async () => {
  await new Promise((r) => server.listen(8249, r));
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
      window.__screens = [];
      setInterval(() => { const s = document.querySelector('#game-root .screen.on');
        if (s && window.__screens[window.__screens.length - 1] !== s.id) window.__screens.push(s.id); }, 25);
    });
    if (vp) await p.setViewport(vp); return p; };

  // ---- D01, D02, D03 against the module's own pure functions (a host page on REAL clocks)
  const unit = await page('unit', { width: 1280, height: 720 });
  await unit.goto(BASE + 'host.html?game=firstfrost', { waitUntil: 'networkidle2' });
  await unit.waitForFunction(() => window.__firstfrost && window.__firstfrost.resolve, { timeout: 15000 });
  const u = await unit.evaluate(() => {
    const F = window.__firstfrost;
    const deep = F.resolve({ live: ['a', 'b', 'c', 'd'], elig: ['a', 'b', 'c', 'd'], marks: { a: 2, b: 0, c: 0, d: 1 },
      answers: { a: 'X', b: 'X', d: 'Right' }, correct: 'Right', power: 'freeze', frostElig: ['f', 'g'] });
    const plain = F.resolve({ live: ['a', 'b', 'c', 'e'], elig: ['a', 'b', 'c'], marks: { a: 0, b: 0, c: 0, e: 0 },
      answers: { a: 'Right', b: 'Wrong' }, correct: 'Right', power: null, frostElig: [] });
    const together = F.resolve({ live: ['a', 'b'], elig: ['a', 'b'], marks: { a: 2, b: 2 }, answers: { a: 'W', b: 'W' }, correct: 'R', power: null, frostElig: ['f'] });
    const capped = F.resolve({ live: ['a'], elig: ['a'], marks: { a: 2 }, answers: {}, correct: 'R', power: 'freeze', frostElig: ['f'] });
    return { deep, plain, together, capped,
      endings: [F.ending(0, 4, 12), F.ending(1, 4, 12), F.ending(2, 12, 12), F.ending(3, 5, 12), F.ending(2, 7, 7)],
      text: { last: F.endingText('last', ['Del'], 12), together: F.endingText('together', [], 12), cap: F.endingText('cap', ['Ada', 'Bo', 'Cy'], 12),
        away: F.endingText('away', ['Bo'], 12) },
      tally: [F.tally({ a: 'fog', b: 'fog', c: 'chill' }, ['a', 'b', 'c'], null), F.tally({ a: 'fog', b: 'chill' }, ['a', 'b'], null),
        F.tally({ a: 'fog', b: 'chill' }, ['a', 'b'], 'chill'), F.tally({ a: 'fog', b: 'chill' }, ['a', 'b'], 'fog'),
        F.tally({}, ['a', 'b'], null), F.tally({ a: 'freeze', z: 'fog', y: 'fog' }, ['a'], null), F.tally({ a: 'freeze', b: 'chill', c: 'fog' }, ['a', 'b', 'c'], 'freeze')],
      timing: [F.timing(null, false), F.timing('chill', false), F.timing('fog', false), F.timing('freeze', false),
        F.timing(null, true), F.timing('chill', true), F.timing('fog', true)],
      q: F.quarantine() };
  });
  const d = u.deep;
  ok(d.res.a.add === 1 && d.res.a.marks === 3 && d.res.a.froze, 'D01: Deep Freeze on a player with two marks adds ONE (never past three) and freezes them');
  ok(d.res.b.add === 2 && d.res.b.marks === 2 && !d.res.b.froze, 'D02: Deep Freeze, a wrong answer adds two marks');
  ok(d.res.c.got === 'none' && d.res.c.add === 2 && d.res.c.pick === null, 'D01: Deep Freeze, no answer adds two marks and is "none", never a wrong pick');
  ok(d.res.d.got === 'right' && d.res.d.pts === 100 && d.res.d.add === 0, 'D01: a right answer earns 100 and no mark');
  ok(d.applied === 5 && d.frostPts === 200 && d.res.f.weather === 200 && d.res.g.weather === 200,
    'D03: the Frost earn 40 for every mark ACTUALLY added (1 + 2 + 2 = 5, so 200 each); a mark past three counts for nothing');
  ok(u.capped.applied === 1 && u.capped.frostPts === 40, 'D03: two marks owed to a player at two count only once (40, not 80)');
  const pl = u.plain;
  ok(pl.res.b.got === 'wrong' && pl.res.b.add === 1 && pl.res.b.pick === 'Wrong', 'D01: an ordinary wrong answer adds one mark and names the pick');
  ok(pl.res.c.got === 'none' && pl.res.c.add === 1, 'D01: an ordinary missing answer adds one mark (the rules say so) and stays "none"');
  ok(pl.res.e.got === 'away' && pl.res.e.add === 0 && pl.res.e.marks === 0, 'SHELL-D11: a player away when the question opened takes no mark');
  ok(pl.frostPts === 0 && Object.keys(pl.res).length === 4, 'no Frost this round, no weather points');
  ok(u.together.froze.length === 2 && u.endings[0] === 'together', 'D01: simultaneous final eliminations freeze both and end "together"');
  ok(JSON.stringify(u.endings) === JSON.stringify(['together', 'last', 'cap', null, 'cap']), 'D01: every ending is defined: ' + JSON.stringify(u.endings));
  ok(u.text.last[0] === 'Del is the last survivor. +300', 'copy: "' + u.text.last[0] + '"');
  ok(u.text.together[0] === 'Everyone became the Frost together.' && u.text.together.length === 1, 'copy: "' + u.text.together[0] + '" (no invented survivor)');
  ok(u.text.cap[0] === 'Twelve questions complete.' && u.text.cap[1] === 'Still standing: Ada, Bo and Cy.', 'copy: "' + u.text.cap.join(' ') + '"');
  ok(u.text.away[0] === 'Nobody still standing is here.', 'the away ending says so: "' + u.text.away.join(' ') + '"');
  ok(JSON.stringify(u.tally) === JSON.stringify(['fog', 'chill', 'fog', 'chill', null, 'freeze', 'chill']),
    'D03: majority wins; a tie rotates Chill, Fog, Deep Freeze after the last winner; no votes, no weather; non voters ignored: ' + JSON.stringify(u.tally));
  const T = u.timing;
  ok(T[0].len === 24 && T[0].fog === 0 && T[1].len === 12 && T[2].len === 24 && T[2].fog === 8 && T[3].len === 24,
    'D02: 24 s; Chill 12 s; Fog 24 s with the choices after 8 s; Deep Freeze 24 s');
  ok(T[4].len === 36 && T[5].len === 18 && T[6].len === 36 && T[6].fog === 12, 'D02: More reading time multiplies all of it by 1.5');
  ok(u.q.length === 5, 'the quarantine holds five entries: ' + u.q.join(' '));
  await unit.close();

  // ---- played: a practice room, four phone tabs in this browser, fast clocks
  const host = await page('host', { width: 1280, height: 720 });
  await host.goto(BASE + 'host.html?game=firstfrost&fr_fast=1', { waitUntil: 'networkidle2' });
  await host.waitForFunction(() => window.__firstfrost && window.__firstfrost.state, { timeout: 15000 });
  const code = await host.evaluate(() => document.getElementById('ps-code').textContent.trim());
  const N = ['Ada', 'Bo', 'Cy', 'Del'], ph = {};
  for (const n of N) {
    const p = await page(n, { width: 360, height: 640, isMobile: true, hasTouch: true });
    await p.goto(BASE + 'play.html?r=' + code, { waitUntil: 'networkidle2' });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    await p.bringToFront(); await p.click('#pj-go'); ph[n] = p;
  }
  await host.waitForFunction(() => !document.getElementById('ps-start').disabled, { timeout: 15000 });
  await host.bringToFront(); await host.click('#ps-start');
  await host.waitForFunction(() => document.getElementById('fr-rules').classList.contains('on'), { timeout: 10000 });
  const txt = (p, id) => p.evaluate((id) => (document.getElementById(id) || {}).textContent || '', id);
  await sleep(300);
  const rulesTxt = await txt(ph.Ada, 'frp-rules');
  const jobs = await ph.Ada.evaluate(() => document.querySelector('.frp-jobs').textContent);
  ok(/Three frost marks turn you into the Frost\./.test(rulesTxt) && /A wrong answer or no answer adds one mark\. Deep Freeze adds two\./.test(rulesTxt)
    && /Example:/.test(rulesTxt), 'D01 + B4.4: one law, the same words on the phone rules, with an example');
  ok(/Still standing/.test(jobs) && /The Frost/.test(jobs) && /40 weather points/.test(jobs), 'D04: both jobs are shown before question one');
  const tvRules = await host.evaluate(() => document.getElementById('fr-rules').textContent);
  ok(/Three frost marks turn you into the Frost\./.test(tvRules) && !/Three wrong answers/.test(tvRules), 'D01: the TV says the same law ("Three wrong answers" is gone)');
  if (SHOTS) await shot(ph.Bo, 'fr-phone-rules-360.png');
  await host.bringToFront(); await host.click('#fr-next');

  const st = () => host.evaluate(() => window.__firstfrost.state());
  const waitFor = async (fn, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { const s = await st(); if (fn(s)) return s; await sleep(30); } return null; };
  const optIndex = (p, text) => p.evaluate((t) => [...document.querySelectorAll('#frp-opts .frp-opt')].findIndex((x) => x.textContent === t), text);
  const answer = async (p, text) => { const i = await optIndex(p, text); if (i < 0) return 'no option ' + text;
    const a = await tapIn(p, `#frp-opts .frp-opt[data-i="${i}"]`); if (a) return a; return tapIn(p, '#frp-go'); };
  const wrongOf = async (p, right) => p.evaluate((r) => [...document.querySelectorAll('#frp-opts .frp-opt')].map((x) => x.textContent).find((x) => x !== r), right);
  const play = async (qn, plan, hook) => {
    const s = await waitFor((s) => s.screen === 'fr-q' && s.qi === qn - 1 && s.optsShown, 15000);
    if (!s) return null;
    for (const n of Object.keys(plan)) {
      if (plan[n] === 'none') continue;
      await ph[n].waitForFunction(() => document.querySelectorAll('#frp-opts .frp-opt').length === 4, { timeout: 4000 }).catch(() => {});
      const pick = plan[n] === 'right' ? s.answer : await wrongOf(ph[n], s.answer);
      const r = await answer(ph[n], pick); if (r) console.log('  NOTE  ' + n + ' could not answer: ' + r);
      if (hook) await hook(n);
    }
    return s;
  };

  // ---- questions 1 to 3: no Frost yet, so no vote; Ada misses every time and freezes at question 3
  for (let q = 1; q <= 3; q++) {
    const s = await play(q, { Ada: 'wrong', Bo: 'right', Cy: 'right', Del: 'right' }, q === 2 ? async (n) => {
      if (n !== 'Bo') return;
      await ph.Bo.waitForFunction(() => /Final answer saved\./.test(document.getElementById('frp-note').textContent), { timeout: 3000 }).catch(() => {});
      await shot(ph.Bo, 'fr-phone-committed-360.png');
    } : null);
    ok(!!s && s.power === null, `question ${q}: open with no weather (no Frost yet)`);
    if (q === 1) {
      await ph.Ada.waitForFunction(() => /Final answer saved\./.test(document.getElementById('frp-note').textContent), { timeout: 4000 }).catch(() => {});
      ok((await txt(ph.Ada, 'frp-note')) === 'Final answer saved.', 'SHELL-D04 + copy: "Final answer saved." after the one commit');
    }
    await waitFor((s) => s.screen === 'fr-rev' && s.qi === q - 1, 8000);
    await sleep(150);
    if (q === 3) {
      const adaR = await txt(ph.Ada, 'frp-rt');
      ok(adaR === 'You are the Frost. Choose the next weather.', 'D04: freezing says "' + adaR + '"');
      const tvRev = await host.evaluate(() => document.getElementById('fr-took').textContent);
      ok(/Ada joins the Frost next round\./.test(tvRev), 'copy: the TV says "Ada joins the Frost next round."');
      if (SHOTS) await shot(ph.Ada, 'fr-phone-frozen-360.png');
    }
  }
  const s3 = await st();
  ok(s3.frozen[Object.keys(s3.frozen).find((k) => s3.frozeAt[k] === 3)] === true && s3.ghosts.length === 1, 'Ada froze at question 3 (three single marks)');

  // ---- question 4: the first weather vote; Ada chooses FOG
  const v4 = await waitFor((s) => s.screen === 'fr-vote' && s.qi === 3, 8000);
  ok(!!v4 && v4.frostElig.length === 1, 'D03: a Frost member votes the round after freezing');
  await sleep(200);
  const adaScr = await ph.Ada.evaluate(() => document.querySelector('#game-root .screen.on').id);
  const boScr = await ph.Bo.evaluate(() => document.querySelector('#game-root .screen.on').id);
  const btns = await ph.Ada.evaluate(() => [...document.querySelectorAll('#frp-pwopts .frp-pwbtn')].map((x) => x.textContent));
  await shot(host, 'fr-tv-vote-720.png');
  ok(adaScr === 'frp-vote' && btns.length === 3 && /CHILL/.test(btns[0]) && /Half the answering time\./.test(btns[0]), 'D03 + copy: the Frost phone has three weather choices: ' + JSON.stringify(btns));
  const effects = await ph.Bo.evaluate(() => document.getElementById('frp-effects').textContent);
  ok(boScr === 'frp-vwait' && /FOG/.test(effects) && /The choices appear after a short wait\./.test(effects), 'B4.5: a standing phone sees the three public effects while the Frost choose');
  if (SHOTS) await shot(ph.Ada, 'fr-phone-vote-360.png');
  ok(await tapIn(ph.Ada, '.frp-pwbtn[data-k="chill"]') === null, 'Ada chose CHILL first');
  await sleep(250);
  ok(await tapIn(ph.Ada, '.frp-pwbtn[data-k="fog"]') === null, 'Ada changed her mind to FOG (editable)');
  await ph.Ada.waitForFunction(() => /Weather saved\. You can change it until time runs out\.|All set/.test(document.getElementById('frp-vnote').textContent), { timeout: 3000 }).catch(() => {});
  const vnote = await txt(ph.Ada, 'frp-vnote');
  ok(/^(Weather saved\. You can change it until time runs out\.|All set\. Finishing soon\.)$/.test(vnote), 'copy: "' + vnote + '"');
  const wcount = await txt(ph.Bo, 'frp-wcount');
  ok(/^(1 of 1 weather choices saved|All set\. Finishing soon\.)$/.test(wcount), 'every phone sees how many weather choices are in: "' + wcount + '"');
  const wx = await waitFor((s) => s.screen === 'fr-wx' && s.qi === 3, 6000);
  ok(!!wx && wx.power === 'fog', 'D03: the vote closed on the LAST choice (FOG), not the first');
  await sleep(150);
  const wxPhones = await Promise.all(N.map((n) => ph[n].evaluate(() => ({ on: document.querySelector('#game-root .screen.on').id, w: document.getElementById('frp-xname').textContent }))));
  ok(wxPhones.every((x) => x.on === 'frp-wx' && x.w === 'FOG'), 'D02: every phone shows "Weather this round: FOG" before the question clock');
  if ((await st()).screen === 'fr-wx') await shot(host, 'fr-tv-weather-720.png');
  // fog: the question first, no choices anywhere
  const fq = await waitFor((s) => s.screen === 'fr-q' && s.qi === 3, 6000);
  ok(!!fq && fq.fogAt !== null && !fq.optsShown, 'D02: under Fog the question opens with the choices hidden');
  await sleep(120);
  const boFog = await ph.Bo.evaluate(() => ({ n: document.querySelectorAll('#frp-opts .frp-opt').length, go: document.getElementById('frp-go').disabled,
    fog: document.getElementById('frp-fog').textContent, q: document.getElementById('frp-qt').textContent }));
  ok(boFog.n === 0 && boFog.go && /^Choices appear in \d+\. Read the question first\.$/.test(boFog.fog) && boFog.q.length > 5,
    'D02 + copy: a standing phone reads the question, no choices to tap, "' + boFog.fog + '"');
  const tvVeil = await host.evaluate(() => document.getElementById('fr-veil').textContent);
  ok(tvVeil === 'The choices are in the fog', 'copy: the TV says "' + tvVeil + '"');
  const adaQ = await ph.Ada.evaluate(() => ({ on: document.querySelector('#game-root .screen.on').id, pw: document.getElementById('frp-fpw').textContent,
    q: document.getElementById('frp-fqt').textContent, rows: document.querySelectorAll('#frp-fledger .frp-row').length, mine: document.getElementById('frp-fmine').textContent }));
  ok(adaQ.on === 'frp-fq' && adaQ.pw === 'The room chose FOG.' && adaQ.q.length > 5 && adaQ.rows === 3 && /^Your weather points: 0\.$/.test(adaQ.mine),
    'D04: during the question the Frost phone shows the weather, the question, the three still standing and its weather points: ' + JSON.stringify(adaQ));
  // a hidden choice cannot be answered, even sent straight from the page
  await ph.Bo.evaluate((a) => PartyShell.sendToHost({ t: 'final', q: 4, v: 0, o: a }), fq.answer);
  await sleep(200);
  ok((await st()).elig.length === 3 && (await host.evaluate(() => document.getElementById('fr-qin').textContent)) === '0 of 3 final answers saved',
    'D02: an answer sent before the choices appear is ignored');
  if (SHOTS && !(await st()).optsShown) { await shot(ph.Bo, 'fr-phone-fog-360.png'); await shot(host, 'fr-tv-fog-720.png'); }
  await play(4, { Bo: 'wrong', Cy: 'wrong', Del: 'right' }, async (n) => { if (n === 'Cy') { await shot(ph.Ada, 'fr-phone-frostq-360.png'); await shot(host, 'fr-tv-question-720.png'); } });
  const adaQ2 = await ph.Ada.evaluate(() => document.querySelectorAll('#frp-fopts .frp-choice').length);
  ok(adaQ2 === 4, 'the Frost phone shows the four choices once they appear (never which is right)');
  await waitFor((s) => s.screen === 'fr-rev' && s.qi === 3, 8000); await sleep(150);
  await shot(host, 'fr-tv-reveal-720.png');
  const adaR4 = await txt(ph.Ada, 'frp-rt');
  ok(adaR4 === '2 new frost marks. +80 weather points', 'D03 + copy: "' + adaR4 + '"');
  if (SHOTS) await shot(ph.Bo, 'fr-phone-reveal-360.png');

  // ---- question 5: CHILL halves the time
  await waitFor((s) => s.screen === 'fr-vote' && s.qi === 4, 8000);
  await tapIn(ph.Ada, '.frp-pwbtn[data-k="chill"]');
  const c5 = await waitFor((s) => s.screen === 'fr-q' && s.qi === 4, 8000);
  ok(!!c5 && c5.power === 'chill' && c5.len === 4 && c5.optsShown, 'D02: Chill halves the answering time (fast clocks: 8 s to 4 s), choices shown at once');
  await play(5, { Bo: 'wrong', Cy: 'wrong', Del: 'right' });
  await waitFor((s) => s.screen === 'fr-rev' && s.qi === 4, 8000);

  // ---- question 6: DEEP FREEZE; Bo misses, Cy never answers; both at two marks take ONE more and freeze; Del is left
  await waitFor((s) => s.screen === 'fr-vote' && s.qi === 5, 8000);
  await tapIn(ph.Ada, '.frp-pwbtn[data-k="freeze"]');
  const f6 = await waitFor((s) => s.screen === 'fr-q' && s.qi === 5, 8000);
  ok(!!f6 && f6.power === 'freeze' && f6.len === 8, 'D02: Deep Freeze keeps the full time');
  await play(6, { Bo: 'wrong', Cy: 'none', Del: 'right' });
  const r6 = await waitFor((s) => s.screen === 'fr-rev' && s.qi === 5, 12000);
  ok(!!r6 && r6.last.applied === 2 && r6.last.frostPts === 80, 'D03: Deep Freeze on two players at two marks adds two marks in all, not four (80 weather points)');
  await sleep(150);
  const cyR = await txt(ph.Cy, 'frp-rt');
  ok(cyR === 'You are the Frost. Choose the next weather.', 'Cy (no answer) froze too: "' + cyR + '"');
  const room = await ph.Del.evaluate(() => [...document.querySelectorAll('#frp-rroom .frp-row')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  ok(room.some((r) => /^.Cy.*no answer, joins the Frost$/.test(r)) && room.some((r) => /Bo.*chose .*, joins the Frost$/.test(r)),
    'missing stays missing: Cy reads "no answer", never a wrong pick: ' + JSON.stringify(room));

  // ---- the podium: Del is the last survivor; two panels
  const pod = await waitFor((s) => s.screen === 'fr-pod', 10000);
  ok(!!pod, 'the game ended at the podium');
  await sleep(300);
  const tvPod = await host.evaluate(() => ({ win: document.getElementById('fr-winline').textContent, most: document.getElementById('fr-most').textContent,
    surv: [...document.querySelectorAll('#fr-podrows .fr-row')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()),
    frost: [...document.querySelectorAll('#fr-frostrows .fr-row')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()) }));
  ok(tvPod.win === 'Del is the last survivor. +300', 'D01 + copy: "' + tvPod.win + '"');
  ok(tvPod.surv.length === 4 && /^1.*Del.*still standing.*900$/.test(tvPod.surv[0]) && /^2.*frozen at question 6/.test(tvPod.surv[1]) && /^2.*frozen at question 6/.test(tvPod.surv[2]) &&
    /^4.*Ada.*frozen at question 3.*0$/.test(tvPod.surv[3]), 'D01: survival, with Bo and Cy sharing second (frozen together): ' + JSON.stringify(tvPod.surv));
  ok(tvPod.most === 'Most weather points: Ada' && /^1.*Ada.*240$/.test(tvPod.frost[0]) && tvPod.frost.length === 3 && /^2.*0$/.test(tvPod.frost[1]) && /^2.*0$/.test(tvPod.frost[2]),
    'D01 + D03: the Frost panel apart: Ada 240 (80 x 3), Bo and Cy share 2nd with 0 (frozen at question 6, nothing for their own round): ' + JSON.stringify(tvPod.frost));
  const adaPod = await txt(ph.Ada, 'frp-podme'), delPod = await txt(ph.Del, 'frp-podme');
  ok(adaPod === 'You scored 0 points and 240 weather points.' && delPod === 'You scored 900 points.', 'the phones say each player\'s two numbers: "' + adaPod + '" / "' + delPod + '"');
  await shot(ph.Ada, 'fr-phone-podium-360.png'); await shot(host, 'fr-tv-podium-720.png');
  const comp = await host.evaluate(() => window.PartyShell.completed());
  ok(comp.n === 1 && Object.keys(comp.results).length === 4, 'gameComplete fired exactly once, with all four');

  // ---- D04: from question 4 on, Ada had a job every round: the vote, then the Frost question view
  const aScreens = await ph.Ada.evaluate(() => window.__screens.join(','));
  const after = aScreens.slice(aScreens.indexOf('frp-r,frp-vote'));
  const rounds = after.split('frp-r,').filter((x) => x.length);
  ok(rounds.length >= 3 && rounds.slice(0, 3).every((r) => /frp-vote/.test(r) && /frp-fq/.test(r)), 'D04: every round after freezing gave Ada the vote AND the Frost question view: ' + after);

  // ---- the payloads
  for (const n of N) {
    const seen = await ph[n].evaluate(() => window.__seen);
    const qs = seen.filter((m) => m && m.t === 'phase' && m.name === 'question');
    const leak = qs.filter((m) => m.data && (m.data.answer !== undefined || m.data.results !== undefined));
    ok(qs.length >= 6 && leak.length === 0, `PRIVACY: ${n}'s phone got ${qs.length} question payloads, none naming the answer`);
    const fogFirst = qs.find((m) => m.data && m.data.num === 4);
    ok(fogFirst && fogFirst.data.options === null, `D02 PRIVACY: ${n}'s first question 4 payload (Fog) carried no choices`);
    const acks = seen.filter((m) => m && m.t === 'game' && m.msg && (m.msg.t === 'fin' || m.msg.t === 'vback'));
    ok(acks.every((m) => m.to !== '*'), `PRIVACY: every answer or weather acknowledgement ${n} could see is addressed to one phone (${acks.length})`);
    const votes = seen.filter((m) => m && m.t === 'game' && m.msg && m.msg.t === 'vcount');
    ok(votes.every((m) => !m.msg.v && !m.msg.votes), `PRIVACY: the weather count ${n} saw carries who, never which weather`);
    if (n === 'Bo') {
      const intents = seen.filter((m) => m && m.t === 'intent' && m.msg && (m.msg.t === 'final' || m.msg.t === 'vote'));
      console.log(`  NOTE  what remains (data level): Bo's channel carried ${intents.length} answer and vote intents from phones; the module drops them, no screen shows them`);
    }
  }
  const dealt = await host.evaluate(() => ({ d: window.__firstfrost.dealt(), q: window.__firstfrost.quarantine() }));
  ok(dealt.d.length === 12 && dealt.d.every((id) => dealt.q.indexOf(id) < 0), 'no quarantined id was dealt');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await b.close(); server.close();
  console.log(fails.length ? 'FIRSTFROST_RULES_FAIL ' + fails.length : 'FIRSTFROST_RULES_PASS');
  process.exit(fails.length ? 1 : 0);
})();
