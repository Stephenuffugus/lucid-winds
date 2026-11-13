/* SIXFOLD STORE RAWS, set two (13 Nov 2026). Eight captures from the REAL game, served as it is from /workspaces/sixfold
   (branch play-ready, f70ebf0, the build about to go live), opened with ?twa=1 as the Play app opens it (so the
   "All Sky Wolf games" link is hidden by the game itself). The phone is 360 x 800 CSS (a common Android width) at device
   scale 738/360, so each raw is 738 x 1640 and fits the kit frame's window exactly (compose.mjs draws the frame and the
   headline). Every state is reached by playing: tapping stances, the Ascent's own rung buttons, the room buttons.
     1 the secret pick: a stance aimed on the wheel, its clean and glance rings lit   (Ascent rung 36: Snow Heron, Sunset)
     2 the reveal: CLEAN!, the verdict in words, a name tag on each stance            (rung 56: Tide Guardian, Market)
     3 the clash: both on one stance, blades lock (the bind opens a beat later)       (rung 26: Karakasa Twins, Village)
     4 reading the foe: Foresight lights the foe's likely stance, the tell in the bar  (rung 21: Baku Calf, Frozen)
     5 a friend room duel, You against Player 2, over the live database               (arena: the game's random pick)
     6 the Roster, a player 60 rungs in                                               (list over the dimmed scene)
     7 the climb: the face off before a late Ascent duel                              (rung 63: Storm, Blood Mountain)
     8 the victory beat: the winner glows, the foe falls (before the result card)    (rung 30: Kabukimono, Cloud Sea)
     9 (not a shot) the wordmark, the tagline and the icon for graphics.py
   The save is a player some days in (Ascent cleared count set per shot so the wanted rung is the next one). Two things are
   changed in the picture and nothing else:
     * this box has no colour emoji font, so emoji glyphs (U+1F000 and up, U+26E9, U+26F0, U+2B50) are removed from the
       page text just before each capture (on a phone they are colour icons), and the room's Talk row is hidden;
     * lucidwinds.com (the Sunbeam SDK) is blocked, as the game's own two phone smoke does; it draws nothing.
   Shot 5 writes a real room under sixfold/friends/<CODE> on the live database and both phones leave, so the room
   removes itself.
   Run:  node store/sixfold-play/shoot.mjs [--only 12345678]
   then: node tools/store-kit/compose.mjs store/sixfold-play/kit.json   (play-shot-1..8)
         python3 store/sixfold-play/graphics.py --squeeze
   (plain graphics.py remakes frame, feature graphic and icon from raw 9; not needed for the shots) */
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const GAME = '/workspaces/sixfold', PORT = 8797, BASE = 'http://127.0.0.1:' + PORT + '/index.html';
const OUT = '/workspaces/lucid-winds/store/sixfold-play/raw/'; fs.mkdirSync(OUT, { recursive: true });
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const ONLY = String(arg('only', '12345678')), want = n => ONLY.includes(String(n));
const W = 360, H = 800, DPR = 738 / 360;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.css': 'text/css', '.woff2': 'font/woff2' };
const server = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(GAME, u === '/' ? '/index.html' : u);
  if (!f.startsWith(GAME) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); s.end(); return; }
  s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s);
});
await new Promise(r => server.listen(PORT, '127.0.0.1', r));
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb'] });
const errors = [];
const SAVE = { sixfold_seen: '1', sixfold_ascent: '33', sixfold_sunbeams: '164', sixfold_beststreak: '5', sixfold_reads: '23',
  sixfold_stats: JSON.stringify({ matches: 41, wins: 24, bestUnpred: 81, stance: [38, 31, 35, 29, 33, 36] }),
  sixfold_resolvehint: '1', sixfold_predicthint: '1', sixfold_readhint: '1', sixfold_mirrorhint: '1', sixfold_friendcard: '1', sixfold_whiffhint: '1' };
async function phone(o) {
  o = o || {};
  const save = Object.assign({}, SAVE, o.ascent != null ? { sixfold_ascent: String(o.ascent) } : {});
  const ctx = await browser.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: W, height: H, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr || DPR });
  p.on('pageerror', e => errors.push(String(e.message || e).slice(0, 160)));
  await p.setRequestInterception(true);
  p.on('request', r => (/lucidwinds\.com|google-analytics|googletagmanager/.test(r.url()) ? r.abort() : r.continue()));
  await p.evaluateOnNewDocument((save, name) => { try { if (!localStorage.getItem('sixfold_seen')) { for (const k in save) localStorage.setItem(k, save[k]); } if (name) localStorage.setItem('sixfold_netname', name); } catch (e) {} }, save, o.name || '');
  const q = o.query ? o.query + '&twa=1' : '?twa=1';
  await p.goto(BASE + q, { waitUntil: 'networkidle2', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  await sleep(900);
  p._ctx = ctx; return p;
}
const click = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
const text = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
const shown = (p, id) => p.evaluate(id => { const e = document.getElementById(id); return !!(e && e.classList.contains('show')); }, id);
async function waitFor(p, fn, ms, what, arg) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(fn, arg)) return true; await sleep(100); } throw new Error('timed out: ' + what); }
const STRIP = () => {
  const re = /[\u{1F000}-\u{1FAFF}⛩⛰⭐⚠]️?\s?/gu;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) if (re.test(n.nodeValue)) { re.lastIndex = 0; n.nodeValue = n.nodeValue.replace(re, ''); }
};
async function snap(p, name, css) {
  if (css) await p.addStyleTag({ content: css });
  /* never mid flash: the white hit flash and the gold READ wash run 0.3 to 0.6 s; wait them out */
  const t0 = Date.now(); while (Date.now() - t0 < 1500 && await p.evaluate(() => +getComputedStyle(document.getElementById('flash')).opacity > 0.01)) await sleep(50);
  await p.evaluate(STRIP);
  await p.screenshot({ path: OUT + name + '.png' }); console.log('  raw/' + name + '.png');
}
const home = async p => { if (!(await shown(p, 'title'))) await p.evaluate(() => document.querySelector('header h1').click()); await sleep(800); };
/* open the Ascent and fight the next rung (the save's cleared count picks which) */
async function startRung(p) {
  await home(p); await click(p, '#tAscent'); await sleep(900);
  await p.evaluate(() => { const b = document.querySelector('#ascent .rung button[data-rung]'); b.scrollIntoView({ block: 'center' }); b.click(); });
}
const ready = p => waitFor(p, () => /tap a stance|tap to aim/i.test((document.getElementById('sub') || {}).textContent || '') && !document.getElementById('bindstage').classList.contains('show') && !document.getElementById('resultscreen').classList.contains('show'), 20000, 'a stance to pick');
const tap = (p, i) => p.evaluate(i => document.querySelectorAll('#wheel .node')[i].click(), i);
async function pick(p, i) { await tap(p, i); await sleep(250); await tap(p, i); }
/* after a commit: wait for the verdict, return {verdict, sub, foe: the foe's stance index from its tag} */
async function reveal(p) {
  await waitFor(p, () => { const v = document.getElementById('verdict').textContent; return v && v !== '…' && v !== 'Strike?'; }, 15000, 'the verdict');
  return p.evaluate(() => { const nodes = [...document.querySelectorAll('#wheel .node')];
    const foe = nodes.findIndex(n => [...n.querySelectorAll('.ptag')].some(t => !/^you$/i.test(t.textContent.trim())));
    return { verdict: document.getElementById('verdict').textContent, sub: document.getElementById('sub').textContent, foe, round: document.getElementById('roundlbl').textContent }; });
}
/* answer a bind if one opens, then wait for the next pick or the end */
async function settle(p) {
  for (let k = 0; k < 40; k++) {
    if (await shown(p, 'resultscreen')) return 'over';
    if (await shown(p, 'bindstage')) { await sleep(700); await p.evaluate(() => { const b = document.querySelectorAll('.bindbtn-lg'); if (b.length) b[Math.floor(Math.random() * b.length)].click(); }); await sleep(1500); continue; }
    if (await p.evaluate(() => /tap a stance|tap to aim/i.test(document.getElementById('sub').textContent))) return 'pick';
    await sleep(250);
  }
  return 'stuck';
}
const R = () => Math.floor(Math.random() * 6);

try {
  if (want(1)) {   /* the secret pick */
    const p = await phone({ ascent: 35 }); await startRung(p); await ready(p);
    await pick(p, R()); await reveal(p); await settle(p); await ready(p);
    await tap(p, 4); await sleep(900); await snap(p, '1-pick'); await p._ctx.close();
  }
  if (want(2)) {   /* the reveal: a clean by you */
    let done = false;
    for (let m = 0; m < 8 && !done; m++) {
      const p = await phone({ ascent: 55 }); await startRung(p);
      for (let r = 0; r < 14 && !done; r++) {
        if ((await settle(p)) !== 'pick') break;
        await pick(p, R()); const v = await reveal(p);
        if (/clean/i.test(v.verdict) && /^your /i.test(v.sub)) { await sleep(+arg('d2', 900)); await snap(p, '2-reveal'); done = true; }
      }
      await p._ctx.close();
    }
    if (!done) console.log('  MISSING 2');
  }
  if (want(3)) {   /* the clash and the bind: the Mirror copies your last stance, so play the same one twice; the bind card
                      opens at once, a choice is made on it, and the frame is the wheel just after, both on one stance and
                      the bind's result in words, in full light */
    let done = false;
    for (let m = 0; m < 14 && !done; m++) {   /* early rounds only: a long run of one stance draws the "readable" toast */
      const p = await phone({ ascent: 25 }); await startRung(p);
      const last = R();
      for (let r = 0; r < 3 && !done; r++) {
        const st = await settle(p); if (st !== 'pick') break;
        await pick(p, last);
        await waitFor(p, () => { const v = document.getElementById('verdict').textContent; return v && v !== '…' && v !== 'Strike?'; }, 15000, 'verdict');
        if (!(await shown(p, 'bindstage'))) continue;
        await sleep(700); await p.evaluate(() => { const b = document.querySelectorAll('.bindbtn-lg'); b[Math.floor(Math.random() * b.length)].click(); });
        await waitFor(p, () => !document.getElementById('bindstage').classList.contains('show'), 8000, 'the bind to close');
        const v = await text(p, '#verdict'), sb = await text(p, '#sub'); console.log('   bind: ' + v + ' / ' + sb);
        if (/you win the bind|bind won/i.test(v + ' ' + sb)) { await sleep(+arg('d3', 700)); await snap(p, '3-bind'); done = true; }
      }
      await p._ctx.close();
    }
    if (!done) console.log('  MISSING 3');
  }
  if (want(4)) {   /* reading the foe: Foresight */
    let done = false;
    for (let m = 0; m < 4 && !done; m++) {
      const p = await phone({ ascent: 20 }); await startRung(p);
      for (let r = 0; r < 14 && !done; r++) {
        if ((await settle(p)) !== 'pick') break;
        if (await p.evaluate(() => !document.getElementById('foresightbtn').disabled)) {
          await click(p, '#foresightbtn'); await sleep(500);
          const f = await p.evaluate(() => [...document.querySelectorAll('#wheel .node')].findIndex(n => n.classList.contains('foresight')));
          if (f >= 0) { await tap(p, (f + 5) % 6); await sleep(700); await snap(p, '4-read'); done = true; break; }
        }
        await pick(p, R()); await reveal(p);
      }
      await p._ctx.close();
    }
    if (!done) console.log('  MISSING 4');
  }
  if (want(5)) for (let tries = 0, got5 = false; tries < 6 && !got5; tries++) {   /* a friend room duel; the room deals a random
                      arena, so a room that deals one the other shots use is left and another is opened */
    const A = await phone({ name: 'You', ascent: 69 });
    await click(A, '#tDuel'); await sleep(900); await click(A, '#friendbtn'); await sleep(600); await click(A, '#fhost');
    await waitFor(A, () => /^[A-Z2-9]{4}$/.test((document.getElementById('rcode') || {}).textContent || ''), 45000, 'room code');
    const code = await text(A, '#rcode');
    const B = await phone({ name: 'Player 2', query: '?room=' + code });
    try {
      await waitFor(A, () => /Player 2/.test((document.getElementById('rfrname') || {}).textContent || ''), 30000, 'Player 2 in the room');
      await click(B, '#rready'); await sleep(800); await click(A, '#rready');
      let done = false;
      const inDuel = q => q.evaluate(() => /Friendly/i.test(document.getElementById('modetag').textContent) && !document.getElementById('duelscreen').classList.contains('show'));
      const t1 = Date.now(); while (Date.now() - t1 < 30000 && !((await inDuel(A)) && (await inDuel(B)))) await sleep(300);
      const st = q => q.evaluate(() => ['modetag', 'foename', 'verdict', 'sub'].map(i => document.getElementById(i).textContent).join(' | ') + ' duelscreen=' + document.getElementById('duelscreen').classList.contains('show'));
      console.log('   A: ' + (await st(A)) + '\n   B: ' + (await st(B)));
      const arena = await A.evaluate(() => (getComputedStyle(document.querySelector('#scene .scenebg')).backgroundImage.match(/backgrounds\/(\w+)/) || [])[1] || '?');
      console.log('   room arena: ' + arena);
      if (/sunset|market|village|frozen|bloodmtn|cloudsea/.test(arena)) continue;
      for (let r = 0; r < 8 && !done; r++) {
        await ready(A); await ready(B);
        await pick(B, R()); await sleep(400); await pick(A, R());
        const v = await reveal(A);
        if (/clean/i.test(v.verdict) && /^your /i.test(v.sub) && r >= 1) { await sleep(+arg('d5', 450)); await snap(A, '5-room', '#talkpop,#rtalk{display:none!important}'); done = true; got5 = true; }
        await settle(A); await settle(B);
      }
      if (!done) console.log('  MISSING 5');
    } finally {
      await click(A, '#rleave').catch(() => {}); await sleep(1500); await click(B, '#rleave').catch(() => {}); await sleep(2500);
      await A._ctx.close(); await B._ctx.close();
    }
  }
  if (want(6)) {   /* the Roster */
    const p = await phone({ ascent: 60 });
    await home(p); await click(p, '#tRoster'); await sleep(1500);
    await p.evaluate(() => { const o = document.getElementById('collection'); const g = o.querySelector('.ccard'); g.scrollIntoView({ block: 'start' }); });
    await sleep(500); await snap(p, '6-roster'); await p._ctx.close();
  }
  if (want(7)) {   /* the climb: the face off of a late rung */
    const p = await phone({ ascent: 62 }); await startRung(p);
    await waitFor(p, () => document.getElementById('verdict').classList.contains('vs'), 10000, 'face off');
    await sleep(+arg('d7', 450)); await snap(p, '7-climb'); await p._ctx.close();
  }
  if (want(8)) {   /* the victory beat: against the Mirror, cut the stance you played last */
    let done = false;
    for (let m = 0; m < 8 && !done; m++) {
      const p = await phone({ ascent: 29 }); await startRung(p);
      let last = R();
      for (let r = 0; r < 20; r++) {
        const s = await settle(p);
        if (s !== 'pick') break;
        const mine = r === 0 ? last : (last + 5) % 6;
        await pick(p, mine); last = mine; await reveal(p);
        const won = await p.evaluate(() => document.getElementById('pstage').classList.contains('victor') || document.getElementById('astage').classList.contains('victor'));
        let t0 = Date.now(), vic = false;
        while (Date.now() - t0 < 4000) { vic = await p.evaluate(() => document.getElementById('pstage').classList.contains('victor')); const lost = await p.evaluate(() => document.getElementById('astage').classList.contains('victor')); if (vic || lost || await p.evaluate(() => /tap a stance|tap to aim/i.test(document.getElementById('sub').textContent)) || await shown(p, 'bindstage')) break; await sleep(100); }
        if (vic) { await sleep(+arg('d8', 120)); if (!(await shown(p, 'resultscreen'))) { await snap(p, '8-victory'); done = true; } break; }
        if (won) break;
      }
      console.log('  duel ' + (m + 1) + (done ? ' won' : ' no'));
      await p._ctx.close();
    }
    if (!done) console.log('  MISSING 8');
  }
  if (want(9)) { const p = await phone({ dpr: 4 });
    await home(p);
    await p.evaluate(() => { const t = document.getElementById('title'); for (const e of t.querySelectorAll('.tbg,.tscrim,.tvig,.thero,.tmenu,.tgrid,.tfoot,.ttop')) e.style.visibility = 'hidden';
      t.style.background = 'transparent'; document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent';
      const s = document.getElementById('scene'); if (s) s.style.visibility = 'hidden'; for (const e of document.body.children) if (e.id !== 'title') e.style.visibility = 'hidden'; });
    await sleep(300);
    const el = await p.$('#title .tmark'); await el.screenshot({ path: OUT + 'wordmark.png', omitBackground: true });
    const tg = await p.$('#title .ttag'); await tg.screenshot({ path: OUT + 'tagline.png', omitBackground: true });
    const ic = await p._ctx.newPage(); await ic.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
    const svg = fs.readFileSync(path.join(GAME, 'icon.svg'), 'utf8');
    await ic.setContent('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@600;800&display=block">' +
      '<style>html,body{margin:0;background:#171d30}svg{display:block}</style>' + svg, { waitUntil: 'networkidle0' });
    await ic.evaluate(async () => { await document.fonts.load('800 64px "Shippori Mincho"', '六'); await document.fonts.ready; });
    await sleep(300); await ic.screenshot({ path: OUT + 'icon-512.png', clip: { x: 0, y: 0, width: 512, height: 512 } });
    console.log('  raw/wordmark.png raw/tagline.png raw/icon-512.png');
    await p._ctx.close(); }
  console.log(errors.length ? 'PAGE ERRORS: ' + errors.join(' ; ') : 'raws done, no page errors');
} finally { await browser.close(); server.close(); }
