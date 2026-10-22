/* LIFTING FOG RULES, from Astra's review (18 Oct 2026, LIFTINGFOG-D01 to D04), tested against the LIVE modules:
   D01 a tap on an option only SELECTS (nothing reaches the host); "Answer now for {points}" commits once; the host
       assigns the points of the tier at which it accepts and acknowledges that tier privately; a second commit for
       the same question can never replace the first; a tier change never moves an option or loses the selection;
       every clue so far stays on the phone, in order.
   D02 "More reading time" lengthens every tier; a question ends early once everyone here has saved a final answer.
   D03 the quarantined entries are never dealt.
   D04 scoring fixtures (100, 75, 50, 25 by the clue accepted; a wrong answer names what was chosen; no answer is
       'none', never wrong); the reveal shows the answer, the four clues with their points and everyone's clue and
       points; correctness is the stored option text.
   PRIVACY: no phase payload carries a clue before its tier or marks the correct option before the reveal; every
   acknowledgement is addressed to one phone. What remains (data level, reported, not fixed): a phone's final answer
   travels to the host as an intent on the room's channel, which other phones receive and drop.
   Played in a practice room (host page + three phone tabs, this browser, no network).
   Run: node party/test/liftingfog_rules.js      (serves the repo itself on port 8248) */
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((rq, rs) => { let p = rq.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { rs.writeHead(404); rs.end('nf'); return; }
    rs.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); rs.end(d); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://localhost:8248/party/';
/* a hit tested tap from inside the page: whatever is really at the control's centre gets the click, so a covered
   button does nothing, as for a person */
const tapIn = (p, sel) => p.evaluate((sel) => {
  const b = document.querySelector(sel); if (!b || b.disabled) return 'missing or disabled ' + sel;
  const r = b.getBoundingClientRect(); if (!r.width) return 'no size ' + sel;
  const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  const t = el && (el.closest('button') || el); if (t !== b) return 'covered ' + sel;
  b.click(); return null; }, sel);

(async () => {
  await new Promise((r) => server.listen(8248, r));
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
      window.__screens = [];
      setInterval(() => { const s = document.querySelector('#game-root .screen.on');
        if (s && window.__screens[window.__screens.length - 1] !== s.id) window.__screens.push(s.id); }, 30);
    });
    if (vp) await p.setViewport(vp); return p; };

  // ---- D04 and D02 against the module's own functions, D03 against its deck
  const host = await page('host', { width: 1280, height: 720 });
  await host.goto(BASE + 'host.html?game=liftingfog&lf_fast=1', { waitUntil: 'networkidle2' });
  await host.waitForFunction(() => window.__liftingfog && window.__liftingfog.score, { timeout: 15000 });
  const f = await host.evaluate(() => {
    const F = window.__liftingfog, ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const ans = { a: { pick: 'Owl', tier: 0 }, b: { pick: 'Owl', tier: 1 }, c: { pick: 'Owl', tier: 2 }, d: { pick: 'Owl', tier: 3 }, e: { pick: 'Bat', tier: 0 } };
    return { res: F.score(ans, 'Owl', ids), tie: F.score({ a: { pick: 'Owl', tier: 1 }, b: { pick: 'Owl', tier: 1 } }, 'Owl', ['a', 'b']),
      t: [32, 25, 24, 17, 16, 9, 8, 1, 0].map((s) => F.tierAt(s, 32, 8)), t12: [48, 37, 36, 24, 12].map((s) => F.tierAt(s, 48, 12)),
      q: F.quarantine(), inDeck: F.quarantined(), pts: F.points };
  });
  ok(f.res.res.a.pts === 100 && f.res.res.b.pts === 75 && f.res.res.c.pts === 50 && f.res.res.d.pts === 25,
    'D04: the clue accepted sets the points: 100, 75, 50, 25');
  ok(f.res.res.a.tier === 1 && f.res.res.d.tier === 4, 'D04: results carry the clue number (1 to 4)');
  ok(f.res.res.e.got === 'wrong' && f.res.res.e.pts === 0 && f.res.res.e.pick === 'Bat', 'D04: a wrong answer scores 0 and names what was chosen');
  ok(f.res.res.f.got === 'none' && f.res.res.f.pts === 0 && f.res.res.f.pick === null, 'no answer is "none", never wrong');
  ok(f.res.found === 4, 'four found it');
  ok(f.tie.res.a.pts === 75 && f.tie.res.b.pts === 75, 'two right at the same clue both earn its points');
  ok(JSON.stringify(f.t) === JSON.stringify([0, 0, 1, 1, 2, 2, 3, 3, 3]), 'D02: 8 second tiers over 32 s: ' + f.t.join(','));
  ok(JSON.stringify(f.t12) === JSON.stringify([0, 0, 1, 2, 3]), 'D02: 12 second tiers over 48 s (more reading time): ' + f.t12.join(','));
  ok(f.q.length === 12 && f.inDeck.length === 0, 'D03: 12 entries quarantined, none of them in the live deck: ' + f.q.join(' '));

  // ---- played: a practice room, three phone tabs in this browser
  const code = await host.evaluate(() => document.getElementById('ps-code').textContent.trim());
  const N = ['Ada', 'Bo', 'Cy'], ph = {};
  for (const n of N) {
    const p = await page(n, { width: 360, height: 640, isMobile: true, hasTouch: true });
    await p.goto(BASE + 'play.html?r=' + code, { waitUntil: 'networkidle2' });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    await p.bringToFront(); await p.click('#pj-go'); ph[n] = p;
  }
  await host.waitForFunction(() => !document.getElementById('ps-start').disabled, { timeout: 15000 });
  await host.bringToFront(); await host.click('#ps-start');
  await host.waitForFunction(() => document.getElementById('lf-rules').classList.contains('on'), { timeout: 10000 });
  const txt = (p, id) => p.evaluate((id) => (document.getElementById(id) || {}).textContent || '', id);
  const rulesTxt = await txt(ph.Ada, 'lfp-rules');
  ok(/Four clues describe one thing\./.test(rulesTxt) && /Choose an option, then tap Answer now\. You get one answer\./.test(rulesTxt) &&
    /Example:/.test(rulesTxt), 'B3.4 + B3.5: the phone rules say it in Astra\'s words, with an example');
  // D02: more reading time, chosen on the rules screen, reaches every phone
  await host.bringToFront(); await host.click('#lf-slow'); await sleep(400);
  const pace = await txt(ph.Bo, 'lfp-pace'), st0 = await host.evaluate(() => window.__liftingfog.state());
  ok(/^More reading time is on/.test(pace) && st0.slow && st0.step === 3, 'D02: more reading time lengthens every tier (fast clocks: 2 s to 3 s): "' + pace + '"');
  await host.bringToFront(); await host.click('#lf-next');
  const state = () => host.evaluate(() => window.__liftingfog.state());
  const onScreen = (p) => p.evaluate(() => { const s = document.querySelector('#game-root .screen.on'); return s ? s.id : ''; });
  const waitScreen = async (p, id, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { if ((await onScreen(p)) === id) return true; await sleep(40); } return false; };
  const optIndex = (p, text) => p.evaluate((t) => [...document.querySelectorAll('#lfp-opts .lfp-opt')].findIndex((x) => x.textContent === t), text);
  const rects = (p) => p.evaluate(() => [...document.querySelectorAll('#lfp-opts .lfp-opt, #lfp-go')].map((x) => { const r = x.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(); }).join('|'));

  // ---- question 1: Ada right at clue 1, Bo wrong at clue 2, Cy only selects (never commits)
  ok(await waitScreen(ph.Ada, 'lfp-q'), 'question 1 is on the phone');
  const s1 = await state();
  const right = s1.answer, opts = await ph.Ada.evaluate(() => [...document.querySelectorAll('#lfp-opts .lfp-opt')].map((x) => x.textContent));
  const wrong = opts.find((o) => o !== right);
  const goTxt0 = await txt(ph.Ada, 'lfp-go'), goDis0 = await ph.Ada.evaluate(() => document.getElementById('lfp-go').disabled);
  ok(goDis0 && /^Answer now/.test(goTxt0), 'D01: Answer now waits for a choice: "' + goTxt0 + '"');
  const before = await host.evaluate(() => document.getElementById('lf-qin').textContent);
  ok(await tapIn(ph.Ada, `#lfp-opts .lfp-opt[data-i="${await optIndex(ph.Ada, right)}"]`) === null, 'Ada tapped an option');
  ok(await tapIn(ph.Cy, `#lfp-opts .lfp-opt[data-i="${await optIndex(ph.Cy, wrong)}"]`) === null, 'Cy tapped an option');
  await sleep(300);
  const afterSel = await host.evaluate(() => document.getElementById('lf-qin').textContent);
  const goTxt1 = await txt(ph.Ada, 'lfp-go');
  ok(before === '0 of 3 final answers saved' && afterSel === before, 'D01: a tap only selects; the host saw no answer: "' + afterSel + '"');
  ok(goTxt1 === 'Answer now for 100', 'D01 + copy: "' + goTxt1 + '"');
  const r0 = await rects(ph.Ada);
  ok(await tapIn(ph.Ada, '#lfp-go') === null, 'Ada tapped Answer now');
  await ph.Ada.waitForFunction(() => /Final answer saved at clue/.test(document.getElementById('lfp-note').textContent), { timeout: 4000 }).catch(() => {});
  const adaNote = await txt(ph.Ada, 'lfp-note');
  ok(adaNote === 'Final answer saved at clue 1.', 'D01: the host acknowledges the tier it accepted: "' + adaNote + '"');
  const disabled = await ph.Ada.evaluate(() => [...document.querySelectorAll('#lfp-opts .lfp-opt')].every((x) => x.disabled) && document.getElementById('lfp-go').disabled);
  ok(disabled, 'D01: after the final answer the options and the button are closed');
  const hostIn = await host.evaluate(() => document.getElementById('lf-qin').textContent);
  ok(hostIn === '1 of 3 final answers saved', 'copy: the host counts final answers: "' + hostIn + '"');
  const who = await txt(ph.Bo, 'lfp-who');
  ok(/Ada/.test(who) && !new RegExp(right.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(who), 'B3.5: every phone sees WHO saved (Ada), never what: "' + who + '"');
  // a second commit for the same question (sent straight from Ada's page) can never replace the first
  await ph.Ada.evaluate((w) => { const o = [...document.querySelectorAll('#lfp-opts .lfp-opt')].map((x) => x.textContent); PartyShell.sendToHost({ t: 'final', q: 1, v: o.indexOf(w), o: w }); }, wrong);
  await sleep(400);
  // the next clue lifts: wait for tier 2, then check nothing moved and the clue stack holds both clues in order
  await host.waitForFunction(() => window.__liftingfog.state().tier >= 1, { timeout: 8000 });
  await sleep(300);
  const r1 = await rects(ph.Ada);
  ok(r0 === r1, 'D01: a new clue moved no option and not the button (positions identical)');
  const clues = await ph.Bo.evaluate(() => [...document.querySelectorAll('#lfp-clues .lfp-clue:not(.ghost)')].map((x) => x.textContent));
  const st1 = await state();
  ok(clues.length === 2 && clues[0] === '1' + st1.clues[0] && clues[1] === '2' + st1.clues[1], 'D01: both clues stay, in order (' + clues.length + ')');
  const ghosts = await ph.Bo.evaluate(() => [...document.querySelectorAll('#lfp-clues .lfp-clue.ghost')].map((x) => x.textContent));
  ok(ghosts.length === 2 && /Worth 50 if you wait/.test(ghosts[0]) && /Worth 25/.test(ghosts[1]), 'the clues still in the fog show what waiting costs: ' + JSON.stringify(ghosts));
  const nextLine = await txt(ph.Bo, 'lfp-next');
  ok(/^Next clue (in [1-9]|now)/.test(nextLine), 'the next clue line was painted again with the new clue: "' + nextLine + '"');
  const cySel = await ph.Cy.evaluate(() => [...document.querySelectorAll('#lfp-opts .lfp-opt')].findIndex((x) => x.classList.contains('sel')));
  ok(cySel === await optIndex(ph.Cy, wrong), 'D01: Cy\'s selection survived the new clue');
  const boGo = await txt(ph.Bo, 'lfp-go'), boW = await txt(ph.Bo, 'lfp-w');
  ok(boW === '75 points', 'the worth follows the clue: "' + boW + '" (' + boGo + ')');
  await tapIn(ph.Bo, `#lfp-opts .lfp-opt[data-i="${await optIndex(ph.Bo, wrong)}"]`);
  ok(await tapIn(ph.Bo, '#lfp-go') === null, 'Bo committed at clue 2');
  await ph.Bo.waitForFunction(() => /Final answer saved at clue/.test(document.getElementById('lfp-note').textContent), { timeout: 4000 }).catch(() => {});
  const boNote = await txt(ph.Bo, 'lfp-note');
  ok(boNote === 'Final answer saved at clue 2.', 'D01: "' + boNote + '"');
  // Cy never commits: the question runs to its deadline
  ok(await waitScreen(ph.Ada, 'lfp-r', 16000), 'question 1 reveals at the deadline');
  const res = { Ada: await txt(ph.Ada, 'lfp-rt'), Bo: await txt(ph.Bo, 'lfp-rt'), Cy: await txt(ph.Cy, 'lfp-rt') };
  ok(res.Ada === 'Found it at clue 1. +100', 'D01: the second commit did not replace the first, and the copy: "' + res.Ada + '"');
  ok(res.Bo === 'You chose ' + wrong + '. It was ' + right + '.', 'copy: "' + res.Bo + '"');
  ok(res.Cy === 'No answer saved this round.', 'a selection never committed is no answer: "' + res.Cy + '"');
  const lad = await ph.Bo.evaluate(() => [...document.querySelectorAll('#lfp-rlad .lfp-lrow')].map((x) => x.textContent));
  ok(lad.length === 4 && /^100/.test(lad[0]) && /^25/.test(lad[3]), 'D04: the reveal shows all four clues with their points');
  const room = await ph.Cy.evaluate(() => [...document.querySelectorAll('#lfp-rroom .lfp-row')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  ok(room.length === 3 && /Ada.*clue 1 \+100/.test(room[0]) && room.some((r) => /Bo.*chose/.test(r)) && room.some((r) => /Cy.*no answer/.test(r)),
    'D04: everyone\'s clue and points, what they chose, or no answer: ' + JSON.stringify(room));
  const tvLad = await host.evaluate(() => document.querySelectorAll('#lf-vladder .lf-lrow').length);
  ok(tvLad === 4, 'D04: the TV reveal shows the four clues too');

  // ---- question 2: everyone commits at clue 1 -> the question ends early
  ok(await waitScreen(ph.Ada, 'lfp-q', 12000), 'question 2 opens');
  const s2 = await state();
  for (const n of N) { await tapIn(ph[n], `#lfp-opts .lfp-opt[data-i="${await optIndex(ph[n], s2.answer)}"]`); await tapIn(ph[n], '#lfp-go'); }
  const t0 = Date.now();
  ok(await waitScreen(ph.Bo, 'lfp-r', 6000), 'D02: everyone saved, so the question ends early');
  const early = await host.evaluate(() => window.__liftingfog.state().tier);
  ok(Date.now() - t0 < 2500 && early === 0, 'D02: it ended at clue 1 without waiting out the clock (tier ' + early + ')');
  ok((await txt(ph.Cy, 'lfp-rt')) === 'Found it at clue 1. +100', 'everyone found it at clue 1');

  // ---- the payloads
  for (const n of N) {
    const seen = await ph[n].evaluate(() => window.__seen);
    const qs = seen.filter((m) => m && m.t === 'phase' && m.name === 'question');
    const bad = qs.filter((m) => !m.data || !Array.isArray(m.data.clues) || m.data.clues.length !== (m.data.tier | 0) + 1 || m.data.answer !== undefined || m.data.results !== undefined);
    ok(qs.length >= 3 && bad.length === 0, `PRIVACY: ${n}'s phone got ${qs.length} question payloads, each with only the clues already revealed and no answer`);
    const acks = seen.filter((m) => m && m.t === 'game' && m.msg && m.msg.t === 'fin');
    ok(acks.length > 0 && acks.every((m) => m.to !== '*'), `PRIVACY: every final answer acknowledgement ${n} could see is addressed to one phone (${acks.length})`);
    if (n === 'Ada') {
      const others = seen.filter((m) => m && m.t === 'intent' && m.msg && m.msg.t === 'final');
      console.log(`  NOTE  what remains (data level): Ada's channel carried ${others.length} final answer intents from phones; the module drops them, no screen shows them`);
    }
  }
  // the reveal is the first payload that names the answer; the deck never dealt a quarantined id
  const dealt = await host.evaluate(() => ({ d: window.__liftingfog.dealt(), q: window.__liftingfog.quarantine() }));
  ok(dealt.d.length === 8 && dealt.d.every((id) => dealt.q.indexOf(id) < 0), 'D03: the eight dealt questions include no quarantined id');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 4)));
  await b.close(); server.close();
  console.log(fails.length ? 'LIFTINGFOG_RULES_FAIL ' + fails.length : 'LIFTINGFOG_RULES_PASS');
  process.exit(fails.length ? 1 : 0);
})();
