/*
 * Real-browser probe for the /play/ shells — measures time-to-mount and
 * captures console/page errors, with optional network throttling to
 * reproduce the portal "black screen for seconds" report.
 *
 *   node scripts/portal_shell_probe.js            # fast
 *   node scripts/portal_shell_probe.js slow       # throttled (Slow 3G-ish)
 *
 * Serves the repo root on a local port so root-relative /play, /games,
 * /sunbeam-sdk.js, /shared.css resolve exactly as in production.
 */
var http = require('http');
var fs = require('fs');
var path = require('path');
var puppeteer = require('puppeteer');

var ROOT = path.join(__dirname, '..');
var SLOW = process.argv.indexOf('slow') >= 0;
var GAMES = ['klondike', 'merge', 'chess', 'sudoku', 'petalfall', 'bloomwheel', 'rhythmvine'];

var MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff'
};

var server = http.createServer(function (req, res) {
  var u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') u = '/index.html';
  var fp = path.join(ROOT, u);
  if (!fp.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(fp, function (err, data) {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
});

(async function () {
  await new Promise(function (r) { server.listen(0, r); });
  var port = server.address().port;
  var base = 'http://localhost:' + port;

  var browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log('=== /play/ shell probe (' + (SLOW ? 'THROTTLED ~Slow-3G' : 'fast') + ') ===');
  for (var i = 0; i < GAMES.length; i++) {
    var id = GAMES[i];
    for (var e = 0; e < 2; e++) {
      var embed = e === 1;
      var page = await browser.newPage();
      var errs = [];
      page.on('pageerror', function (err) { errs.push('PAGEERR ' + (err.message || err).slice(0, 100)); });
      page.on('console', function (m) { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 100)); });
      if (SLOW) {
        var cdp = await page.target().createCDPSession();
        await cdp.send('Network.emulateNetworkConditions', {
          offline: false, downloadThroughput: 50 * 1024, uploadThroughput: 20 * 1024, latency: 400
        });
      }
      var url = base + '/play/' + id + '.html' + (embed ? '?embed=1' : '');
      var t0 = Date.now();
      var mounted = -1, placeholder = -1;
      // measure when the spinner/placeholder is actually laid out (painted)
      var phPromise = page.waitForFunction(function () {
        var p = document.getElementById('shell-loading');
        var b = document.querySelector('.shell-back');
        return (p && p.offsetHeight > 0) || (b && b.offsetHeight > 0);
      }, { timeout: 25000, polling: 50 }).then(function () { placeholder = Date.now() - t0; }).catch(function () {});
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction(function () {
          var m = document.getElementById('fg-ag');
          return m && m.children.length > 0;
        }, { timeout: 25000, polling: 100 });
        mounted = Date.now() - t0;
      } catch (ex) {
        mounted = -1;
        errs.push('NO-MOUNT ' + (ex.message || ex).slice(0, 80));
      }
      await phPromise;
      var label = id + (embed ? ' [embed]' : '        ');
      console.log('  ' + label + '  spinner=' + (placeholder < 0 ? '—' : placeholder + 'ms') +
        '  mount=' + (mounted < 0 ? 'FAILED' : mounted + 'ms') +
        (errs.length ? '  ERR:' + errs.slice(0, 2).join(' | ') : ''));
      await page.close();
    }
  }

  await browser.close();
  server.close();
})().catch(function (e) { console.error(e); process.exit(1); });
