#!/usr/bin/env node
/* satellite_probe.js — canonical headless verifier for satellite games.
 *
 * Every satellite ships a dev hook (?<x>test=1 -> window.<X>_DEV). This probe
 * loads the game through the local server, fails on ANY pageerror/console
 * error, asserts window._sbCapEarn is a real function (Berry Vine #1 shipped
 * with only the guarded CALL and silently never earned), then evaluates each
 * check expression against the DEV object and prints one JSON report.
 *
 * Usage:
 *   node scripts/satellite_probe.js <slug> <DEV_GLOBAL> <testParam> [checks...]
 *     [--shot <path.png>] [--port 8901] [--settle 1200]
 *
 *   Checks are JS expressions evaluated as window.<DEV_GLOBAL>.<expr>,
 *   or raw window-level JS when prefixed "js:".
 *
 * Examples:
 *   node scripts/satellite_probe.js nova-bloom NB_DEV nbtest \
 *     "checkAll()" "autoplay(90)" "earnTest()" --shot /tmp/nb.png
 *   node scripts/satellite_probe.js orb-orchard OO_DEV ootest \
 *     "stageCheck()" "surroundCheck()" "zenCheck()" "dailyCheck(5)" \
 *     "detCheck(0)" "earnTest()"
 *
 * Server: python3 -m http.server 8901 from the repo root.
 * Exit code: 0 = clean load + all checks evaluated (inspect JSON for game-level
 * pass/fail), 1 = errors on page or a check threw.
 */
var puppeteer = require('puppeteer');

var args = process.argv.slice(2);
var slug = args[0], devGlobal = args[1], testParam = args[2];
var checks = [], shot = null, port = 8901, settle = 1200;
for (var i = 3; i < args.length; i++) {
  if (args[i] === '--shot') { shot = args[++i]; }
  else if (args[i] === '--port') { port = +args[++i]; }
  else if (args[i] === '--settle') { settle = +args[++i]; }
  else checks.push(args[i]);
}
if (!slug || !devGlobal || !testParam) {
  console.error('usage: satellite_probe.js <slug> <DEV_GLOBAL> <testParam> [checks...] [--shot p.png]');
  process.exit(1);
}

(async function () {
  var browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  var page = await browser.newPage();
  await page.setViewport({ width: 540, height: 960 });
  var pageErrors = [], consoleErrors = [];
  page.on('pageerror', function (e) { pageErrors.push(String(e && e.message || e)); });
  page.on('console', function (m) { if (m.type() === 'error') consoleErrors.push(m.text()); });

  var url = 'http://localhost:' + port + '/satellites/' + slug + '/?' + testParam + '=1';
  var report = { slug: slug, url: url, pageErrors: pageErrors, consoleErrors: consoleErrors, checks: {} };
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForFunction('typeof window.' + devGlobal + ' === "object"', { timeout: 10000 });
    await new Promise(function (r) { setTimeout(r, settle); });

    report.sbCapEarnIsFunction = await page.evaluate(
      'typeof window._sbCapEarn === "function"');

    for (var c = 0; c < checks.length; c++) {
      var expr = checks[c];
      var js = expr.indexOf('js:') === 0 ? expr.slice(3) : 'window.' + devGlobal + '.' + expr;
      try {
        report.checks[expr] = await page.evaluate(
          '(function(){ try { return JSON.parse(JSON.stringify(' + js + ')); }' +
          ' catch(e){ return {__threw:String(e&&e.message||e)}; } })()');
      } catch (e) {
        report.checks[expr] = { __threw: String(e && e.message || e) };
      }
    }
    if (shot) { await page.screenshot({ path: shot }); report.shot = shot; }
  } catch (e) {
    report.fatal = String(e && e.message || e);
  }
  await browser.close();

  var threw = Object.keys(report.checks).some(function (k) {
    return report.checks[k] && report.checks[k].__threw;
  });
  report.cleanLoad = pageErrors.length === 0 && consoleErrors.length === 0 && !report.fatal;
  report.ok = report.cleanLoad && !threw && report.sbCapEarnIsFunction === true;
  console.log(JSON.stringify(report, null, 1));
  process.exit(report.ok ? 0 : 1);
})();
