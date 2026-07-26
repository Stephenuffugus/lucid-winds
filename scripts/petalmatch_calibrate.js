#!/usr/bin/env node
/* Petal Match difficulty CALIBRATOR.
 *
 * WHY
 *   Doc 06 §1c: "Rate each generated level with a difficulty score and reject
 *   any level that falls outside the band for its position. This is the real
 *   fix: stop hand-guessing and let the generator prove each level is in range."
 *
 *   A rating is only worth having if its numbers come from the real game. This
 *   measures, per objective kind, how much of that objective a competent player
 *   achieves PER MOVE. Those yields are what _loadOf() in games/petalmatch.js
 *   divides by. Nothing here is estimated.
 *
 * ⛔ IT RUNS THE REAL GAME, same contract as petalmatch_balance.js. It drives
 *   _PM_TEST, which drives the real handleEnd(). No reimplementation.
 *
 * ⛔ The bot plays until the moves run out (or it wins) and we divide progress
 *   by moves USED — so a loss is just as useful a sample as a win. That matters:
 *   sampling only wins would measure the lucky boards and overstate the yield.
 *
 * USAGE
 *   node scripts/petalmatch_calibrate.js            levels 1-30, 6 trials
 *   node scripts/petalmatch_calibrate.js 1 40 10
 */
const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const fs = require('fs');

const FROM   = parseInt(process.argv[2] || '1', 10);
const TO     = parseInt(process.argv[3] || '30', 10);
const TRIALS = parseInt(process.argv[4] || '6', 10);
const ROOT   = path.resolve(__dirname, '..');

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

/* Same bot as the balance harness — competent, not perfect: a random pick from
   the top third of moves by objective value. Balancing for a good human. */
const BOT = `(async () => {
  /* \u26d4 dew is counted in LAYER STRIPS by the game (see dewTotal() in
     games/petalmatch.js). The starting total is tiles x layers, NOT obj.dew.
     Using obj.dew here understated a double-layer level's achieved dew by half
     and would bake that straight into PM_YIELD.dew. */
  const dewTot = o => (o.dew || 0) * (o.doubleLayer ? 2 : 1);
  const T = window._PM_TEST;
  const sleep = ms => new Promise(r => (window.__rawTimeout || setTimeout)(r, ms));
  T.setLevel(LEVEL);
  const start = T.state();
  const startLevel = start.level, budget = start.budget;
  const obj = T.genLevel(LEVEL);
  let guard = 0;
  /* ⛔ REMEMBER THE PREVIOUS FRAME. On a win, checkState() advances the level
     AND resets moves to the NEXT level's budget, so reading s.moves after the
     fact gives the new budget, not what was left. That made every WIN look like
     it had played ~1 move, so the <5-move filter threw out all the wins and
     measured losses only — dew came out 31x too low. Track the last pre-win
     reading and add the one move that finished it. */
  let lastMoves = budget, lastScore = 0, lastDew = null, lastThorn = null, lastGath = 0;
  while (guard++ < 400) {
    let spins = 0;
    while (T.state().animating && spins++ < 400) await sleep(4);
    const s = T.state();
    if (s.level > startLevel) {
      /* A win means the FULL demand was satisfied — that is what winning is —
         so the achieved amount is the objective itself, not a stale frame read
         one move before the finish. */
      const used = Math.max(1, budget - lastMoves + 1);
      return { won: true, used, obj,
               score: obj.target || lastScore,
               dewDone: dewTot(obj),
               thornDone: obj.thorns || 0,
               gathered: (obj.perColor || 0) * (obj.colors || 1) };
    }
    if (s.lost || s.moves <= 0) {
      return { won: false, used: Math.max(1, budget - s.moves), obj,
               score: s.score, dewDone: dewTot(obj) - (s.dew||0),
               thornDone: (obj.thorns||0) - (s.thorns||0), gathered: s.gathered||0 };
    }
    lastMoves = s.moves; lastScore = s.score; lastDew = s.dew;
    lastThorn = s.thorns; lastGath = s.gathered || 0;
    const mv = T.movesScored();
    if (!mv.length) { await sleep(30); continue; }
    mv.sort((x, y) => y.s - x.s);
    const top = mv.slice(0, Math.max(1, Math.ceil(mv.length / 3)));
    const pick = top[Math.floor(Math.random() * top.length)];
    T.play(pick.a[0], pick.a[1], pick.b[0], pick.b[1]);
    await sleep(4);
  }
  const s = T.state();
  return { won: false, used: Math.max(1, budget - s.moves), obj, bailed: true,
           score: s.score, dewDone: dewTot(obj)-(s.dew||0),
           thornDone: (obj.thorns||0)-(s.thorns||0), gathered: s.gathered||0 };
})()`;

(async () => {
  const srv = await serve();
  const GAME = 'http://127.0.0.1:' + srv.address().port + '/play/petalmatch.html';
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  page.on('pageerror', e => {
    if (!/ServiceWorker|URL protocol/.test(e.message)) console.error('  page error:', e.message.slice(0, 90));
  });
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('sws_dir_petalmatch', '1'); } catch (e) {}
    const _st = window.setTimeout;
    window.__rawTimeout = _st;
    window.setTimeout = function (fn, ms) {
      const rest = Array.prototype.slice.call(arguments, 2);
      return _st.apply(window, [fn, Math.max(0, Math.floor((ms || 0) / 30))].concat(rest));
    };
    window.requestAnimationFrame = function (cb) { return _st(function () { cb(Date.now()); }, 1); };
    window.cancelAnimationFrame = function (id) { clearTimeout(id); };
  });
  await page.goto(GAME, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button,.gb,[onclick]')]
      .filter(e => e.offsetParent !== null)
      .find(e => /let.?s play|play|start|begin/i.test(e.textContent || ''));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  if (!await page.evaluate(() => !!window._PM_TEST)) {
    console.error('_PM_TEST missing'); process.exit(1);
  }

  // yield samples per kind
  const samp = { score: [], dew: [], gather: [], thorns: [] };
  const usedAll = [];
  let dropped = 0, bailed = 0;
  /* ⛔ A run that played almost no moves is a MEASUREMENT FAILURE, not a hard
     level, and it lands in the sample as a yield of 0. Left in, those zeros
     drag the median down and every level then gets rated harder than it plays.
     Require a real run before believing it. */
  const MIN_MOVES = 5;
  console.log(`measuring yields, levels ${FROM}-${TO}, ${TRIALS} trials each\n`);

  for (let lv = FROM; lv <= TO; lv++) {
    for (let t = 0; t < TRIALS; t++) {
      const r = await page.evaluate(new Function('LEVEL', 'return ' + BOT), lv);
      const k = r.obj.kind, used = Math.max(1, r.used);
      usedAll.push(used);
      if (r.bailed) bailed++;
      if (used < MIN_MOVES) { dropped++; continue; }
      if (k === 'score')  samp.score.push((r.score / used) / lv);   // per move PER LEVEL unit
      // \u26d4 NO x2 here: dewDone is already counted in layers by dewTot().
      //    Multiplying again double-counted every double-layer sample.
      if (k === 'dew')    samp.dew.push((r.dewDone||0) / used);
      if (k === 'gather') samp.gather.push((r.gathered||0) / used);
      if (k === 'thorns') samp.thorns.push(((r.thornDone||0) * (r.obj.hits||1)) / used);
      // a mix run advances all three out of one shared budget, so its per-part
      // rate is not comparable to a dedicated level. Deliberately not sampled.
    }
    process.stdout.write('.');
  }
  console.log('\n');
  const us = usedAll.slice().sort((a, b) => a - b);
  console.log(`runs ${usedAll.length}   moves used: min ${us[0]}  median ${us[Math.floor(us.length/2)]}  max ${us[us.length-1]}`);
  console.log(`dropped (under ${MIN_MOVES} moves, measurement failures): ${dropped}   bot bailed on guard: ${bailed}\n`);

  function stat(a) {
    if (!a.length) return null;
    const s = a.slice().sort((x, y) => x - y);
    const mean = a.reduce((x, y) => x + y, 0) / a.length;
    return { n: a.length, mean, median: s[Math.floor(s.length / 2)],
             p25: s[Math.floor(s.length * 0.25)], p75: s[Math.floor(s.length * 0.75)] };
  }

  console.log('MEASURED YIELD PER MOVE');
  console.log('kind      n     mean    median     p25     p75');
  console.log('─'.repeat(52));
  const out = {};
  for (const k of ['score', 'dew', 'gather', 'thorns']) {
    const st = stat(samp[k]);
    if (!st) { console.log(`  ${k.padEnd(8)} no samples`); continue; }
    // MEDIAN, not mean: a couple of runaway cascade runs would drag the mean up
    // and make every level look easier than it plays.
    out[k] = +st.median.toFixed(4);
    console.log(`  ${k.padEnd(7)}${String(st.n).padStart(4)}  ${st.mean.toFixed(3).padStart(7)}` +
                `  ${st.median.toFixed(3).padStart(7)}  ${st.p25.toFixed(3).padStart(6)}  ${st.p75.toFixed(3).padStart(6)}`);
  }
  console.log('\nPaste into games/petalmatch.js:');
  console.log('  var PM_YIELD={score:' + out.score + ',dew:' + out.dew +
              ',gather:' + out.gather + ',thorns:' + out.thorns + '};');
  console.log('\n  (score is per move PER LEVEL — _loadOf multiplies it back up by lv)');

  await browser.close();
  srv.close();
})();
