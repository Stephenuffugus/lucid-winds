/*
 * Lucid Winds — LIVE rarity simulator (2026-06-12).
 *
 * Runs the REAL engine (hashToTraits + getTerraGrade from index.html) in
 * headless Chrome — no hand-mirrored scorer to drift. The old
 * scripts/rarity_sim.js drifted from live code twice (wrong hb() indexing,
 * pre-May-03 mutation bands, pre-May-13 mythic bands) and was deleted.
 *
 * Usage:
 *   1. Serve the repo:  python3 -m http.server 8431  (repo root)
 *   2. node scripts/rarity_sim_live.js [N]           (default 200000)
 */
var puppeteer = require('puppeteer');
var N = parseInt(process.argv[2], 10) || 200000;

(async function () {
  var browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio'] });
  var page = await browser.newPage();
  await page.setViewport({ width: 540, height: 960 });
  await page.goto('http://localhost:8431/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(function (r) { setTimeout(r, 8000); });
  var out = await page.evaluate(function (N) {
    if (!window.hashToTraits || !window.getTerraGrade) return { error: 'engine not ready — wait longer or check boot' };
    function rnd(seed) { var x = seed; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
    var r = rnd(Date.now() >>> 0);
    var HEX = '0123456789abcdef';
    var counts = {}, scoreHist = {}, cic = 0, toad = 0, beh = 0, mut = 0;
    for (var i = 0; i < N; i++) {
      var h = '';
      for (var j = 0; j < 64; j++) h += HEX[Math.floor(r() * 16)];
      var t = window.hashToTraits(h);
      var g = window.getTerraGrade(t);
      counts[g.name] = (counts[g.name] || 0) + 1;
      scoreHist[g.score] = (scoreHist[g.score] || 0) + 1;
      if (t.companion === 33) cic++;
      if (t.companion === 32) toad++;
      if (t.companion === 38) beh++;
      if (t.mutationName && t.mutationName !== 'None') mut++;
    }
    var dist = {};
    var order = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Cosmic'];
    for (var k = 0; k < order.length; k++) dist[order[k]] = ((100 * (counts[order[k]] || 0)) / N).toFixed(3) + '%';
    return { N: N, distribution: dist, cicadaArt: (100 * cic / N).toFixed(2) + '%', toadArt: (100 * toad / N).toFixed(2) + '%', beholder: (100 * beh / N).toFixed(3) + '%', mutationRate: (100 * mut / N).toFixed(2) + '%', scoreHist: scoreHist };
  }, N);
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch(function (e) { console.error(e.message); process.exit(1); });
