/* SIXFOLD STORE RAWS (13 Nov 2026). Eight captures from the REAL game, served as it is from /workspaces/sixfold
   (branch room-polish, the build about to go live), at a phone's 412 x 915 CSS, device scale 1640/915, so each raw is
   738 x 1640 and fits the kit frame's window exactly (compose.mjs draws the frame and the headline).
     1 a clean hit in an Ascent duel (rung 34, Hannya in Cherry Riverbank)   2 the Clash: break the bind
     3 the friend room, You and Player 2, over the live database             4 the title screen
     5 the Roster, a player 33 rungs in                                      6 the Ascent ladder
     7 the result card after a won duel                                      8 the Daily Duel and its trials
     9 (not a shot) the wordmark, the tagline and the icon for graphics.py
   The save is a player some days in: sixfold_seen, 33 Ascent rungs cleared, sunbeams, a streak, lifetime stats. Every
   screen is reached by tapping the game's own buttons. Two things are changed in the picture and nothing else:
     * this box has no colour emoji font, so emoji glyphs (U+1F000 and up, U+26E9, U+26F0, U+2B50) are removed from the
       page text just before each capture (they would draw as empty boxes; on a phone they are colour icons), and the
       room's Talk row (six emoji buttons) is hidden in shot 3;
     * lucidwinds.com (the Sunbeam SDK) is blocked, as the game's own two phone smoke does; it draws nothing.
   Shot 3 writes a real room under sixfold/friends/<CODE> on the live database and both phones leave, so the room
   removes itself. --no-room skips it (the old raw/3-room.png is kept).
   Run:  node store/sixfold-play/shoot.mjs [--only 1234] [--no-room] [--clean-at 0]
   then: python3 store/sixfold-play/graphics.py          (frame overlay, feature graphic, icon)
         node tools/store-kit/compose.mjs store/sixfold-play/kit.json   (play-shot-1..8) */
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const GAME = '/workspaces/sixfold', PORT = 8797, BASE = 'http://127.0.0.1:' + PORT + '/index.html';
const OUT = '/workspaces/lucid-winds/store/sixfold-play/raw/'; fs.mkdirSync(OUT, { recursive: true });
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const ONLY = String(arg('only', '123456789')), want = n => ONLY.includes(String(n)), ROOM = !process.argv.includes('--no-room');
const W = 412, H = 915, DPR = 1640 / 915, CLEAN_AT = +arg('clean-at', 0);   /* ms more after the verdict shows (it is up about 420 ms after the second tap) */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.css': 'text/css' };
const server = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(GAME, u === '/' ? '/index.html' : u);
  if (!f.startsWith(GAME) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); s.end(); return; }
  s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s);
});
await new Promise(r => server.listen(PORT, '127.0.0.1', r));
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb'] });
const errors = [];
/* a player some days in */
const SAVE = { sixfold_seen: '1', sixfold_ascent: '33', sixfold_sunbeams: '164', sixfold_beststreak: '5', sixfold_reads: '23',
  sixfold_stats: JSON.stringify({ matches: 41, wins: 24, bestUnpred: 81, stance: [38, 31, 35, 29, 33, 36] }),
  sixfold_resolvehint: '1', sixfold_predicthint: '1', sixfold_readhint: '1', sixfold_mirrorhint: '1', sixfold_friendcard: '1' };
async function phone(o) {
  o = o || {};
  const ctx = await browser.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: W, height: H, isMobile: true, hasTouch: true, deviceScaleFactor: o.dpr || DPR });
  p.on('pageerror', e => errors.push(String(e.message || e).slice(0, 160)));
  await p.setRequestInterception(true);
  p.on('request', r => (/lucidwinds\.com|google-analytics|googletagmanager/.test(r.url()) ? r.abort() : r.continue()));
  await p.evaluateOnNewDocument((save, name) => { try { if (!localStorage.getItem('sixfold_seen')) { for (const k in save) localStorage.setItem(k, save[k]); } if (name) localStorage.setItem('sixfold_netname', name); } catch (e) {} }, o.save || SAVE, o.name || '');
  await p.goto(BASE + (o.query || ''), { waitUntil: 'networkidle2', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  await sleep(900);
  p._ctx = ctx; return p;
}
const click = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
const text = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
const shown = (p, id) => p.evaluate(id => { const e = document.getElementById(id); return !!(e && e.classList.contains('show')); }, id);
async function waitFor(p, fn, ms, what) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(fn)) return true; await sleep(250); } throw new Error('timed out: ' + what); }
/* remove emoji the box cannot draw (see the header), then capture */
const STRIP = () => {
  const re = /[\u{1F000}-\u{1FAFF}⛩⛰⭐]️?\s?/gu;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) if (re.test(n.nodeValue)) { re.lastIndex = 0; n.nodeValue = n.nodeValue.replace(re, ''); }
};
async function snap(p, name, css) {
  if (css) await p.addStyleTag({ content: css });
  await p.evaluate(STRIP); await sleep(120);
  await p.screenshot({ path: OUT + name + '.png' }); console.log('  raw/' + name + '.png');
}
const home = async p => { if (!(await shown(p, 'title'))) await p.evaluate(() => document.querySelector('header h1').click()); await sleep(800); };

/* one Ascent duel played the way a player plays it: a stance tapped twice, a bind answered. While it runs it keeps a
   clean hit by You (1) and the bind prompt (2); it returns the result. */
async function ascentDuel(p, got) {
  await home(p); await click(p, '#tAscent'); await sleep(900);
  await p.evaluate(() => { const b = document.querySelector('#ascent .rung button[data-rung]'); b.scrollIntoView({ block: 'center' }); b.click(); });
  await sleep(2600);
  for (let r = 0; r < 60; r++) {
    if (await shown(p, 'resultscreen')) break;
    if (await shown(p, 'bindstage')) {
      await sleep(650); if (!got.bind) { await snap(p, '2-bind'); got.bind = true; }
      await p.evaluate(() => { const b = document.querySelectorAll('.bindbtn-lg'); b[Math.floor(Math.random() * b.length)].click(); });
      await sleep(2600); continue;
    }
    const sub = await text(p, '#sub');
    if (!/tap a stance|tap to aim/i.test(sub)) { await sleep(400); continue; }
    const i = Math.floor(Math.random() * 6);
    await p.evaluate(i => document.querySelectorAll('#wheel .node')[i].click(), i); await sleep(300);
    await p.evaluate(i => document.querySelectorAll('#wheel .node')[i].click(), i);
    await sleep(420);
    const v = await text(p, '#verdict'), s = await text(p, '#sub');
    const r1 = /round 1\b/i.test(await text(p, '#roundlbl'));   /* round 1 only: the hearts drop when the next round opens, so a clean
                                                                    in a later round shows the hearts of the round before */
    if (!got.clean && r1 && /clean/i.test(v) && /^your /i.test(s)) { await sleep(CLEAN_AT); await snap(p, '1-clean'); got.clean = true; await sleep(2600 - CLEAN_AT); }
    else await sleep(2600);
    if (got.bind && got.win && !got.clean) return 'again';         /* only shot 1 left: no clean in round 1, start the rung over */
  }
  await sleep(1600);
  return text(p, '#resultscreen .result-word');
}

try {
  if (want(1) || want(2) || want(7)) {
    const got = { clean: !want(1), bind: !want(2), win: !want(7) };
    for (let m = 0; m < 24 && !(got.clean && got.bind && got.win); m++) {
      const p = await phone();
      const word = await ascentDuel(p, got);
      console.log('  duel ' + (m + 1) + ': ' + word);
      if (!got.win && /VICTORY/.test(word)) { await snap(p, '7-result'); got.win = true; }
      await p._ctx.close();
    }
    if (!(got.clean && got.bind && got.win)) console.log('  MISSING after 24 duels: ' + JSON.stringify(got));
  }
  if (want(3) && ROOM) {
    const A = await phone({ name: 'You' });
    await click(A, '#tDuel'); await sleep(900); await click(A, '#friendbtn'); await sleep(600); await click(A, '#fhost');
    await waitFor(A, () => /^[A-Z2-9]{4}$/.test((document.getElementById('rcode') || {}).textContent || ''), 45000, 'room code');
    const code = await text(A, '#rcode');
    const B = await phone({ name: 'Player 2', query: '?room=' + code });
    try {
      await waitFor(A, () => /Player 2/.test((document.getElementById('rfrname') || {}).textContent || ''), 30000, 'Player 2 in the room');
      await click(B, '#rready'); await sleep(2500);
      await snap(A, '3-room', '#rtalk{display:none!important}');
    } finally {
      await click(A, '#rleave'); await sleep(1500); await click(B, '#rleave'); await sleep(2500);
      await A._ctx.close(); await B._ctx.close();
    }
  }
  if (want(4) || want(5) || want(6) || want(8)) {
    const p = await phone();
    if (want(4)) { await home(p); await sleep(1500); await snap(p, '4-title'); }
    if (want(5)) { await home(p); await click(p, '#tRoster'); await sleep(1500); await p.evaluate(() => { const o = document.getElementById('collection'); const g = o.querySelector('.ccard.got:nth-of-type(6)') || o.querySelector('.ccard'); g.scrollIntoView({ block: 'start' }); }); await sleep(500); await snap(p, '5-roster'); await p.evaluate(() => document.getElementById('collection').classList.remove('show')); }
    if (want(6)) { await home(p); await click(p, '#tAscent'); await sleep(1200); await snap(p, '6-ascent'); await p.evaluate(() => document.getElementById('ascent').classList.remove('show')); }
    if (want(8)) { await home(p); await click(p, '#tDaily'); await sleep(1200); await snap(p, '8-daily'); }
    await p._ctx.close();
  }
  /* the art for the feature graphic and the icon: the title's own wordmark and tagline (transparent) and icon.svg at 512 */
  if (want(9)) { const p = await phone({ dpr: 4 });
    await home(p);
    await p.evaluate(() => { const t = document.getElementById('title'); for (const e of t.querySelectorAll('.tbg,.tscrim,.tvig,.thero,.tmenu,.tgrid,.tfoot,.ttop')) e.style.visibility = 'hidden';
      t.style.background = 'transparent'; document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent';
      const s = document.getElementById('scene'); if (s) s.style.visibility = 'hidden'; for (const e of document.body.children) if (e.id !== 'title') e.style.visibility = 'hidden'; });
    await sleep(300);
    const el = await p.$('#title .tmark'); await el.screenshot({ path: OUT + 'wordmark.png', omitBackground: true });
    const tg = await p.$('#title .ttag'); await tg.screenshot({ path: OUT + 'tagline.png', omitBackground: true });
    const ic = await p._ctx.newPage(); await ic.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
    /* the seal's 六 is set in Shippori Mincho; this box has no CJK font, so the svg is drawn inline under the game's own
       Google Fonts link (a phone draws it with its system font when the svg stands alone) */
    const svg = fs.readFileSync(path.join(GAME, 'icon.svg'), 'utf8');
    await ic.setContent('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@600;800&display=block">' +
      '<style>html,body{margin:0;background:#171d30}svg{display:block}</style>' + svg, { waitUntil: 'networkidle0' });
    await ic.evaluate(async () => { await document.fonts.load('800 64px "Shippori Mincho"', '六'); await document.fonts.ready; });
    await sleep(300); await ic.screenshot({ path: OUT + 'icon-512.png', clip: { x: 0, y: 0, width: 512, height: 512 } });
    console.log('  raw/wordmark.png raw/tagline.png raw/icon-512.png');
    await p._ctx.close(); }
  console.log(errors.length ? 'PAGE ERRORS: ' + errors.join(' ; ') : 'raws done, no page errors');
} finally { await browser.close(); server.close(); }
