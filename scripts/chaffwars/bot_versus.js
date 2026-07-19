#!/usr/bin/env node
/* bot_versus.js — headless proof of Pop N Lock multiplayer (local relay).
 *
 * Opens TWO pages in one browser (same origin -> BroadcastChannel relay),
 * host creates room TEST via CW_DEV.mpCreate, guest joins via CW_DEV.mpJoin,
 * then both pages run an in-page bot interval (CW_DEV.mpBot) until one board
 * tops out. Asserts: both reach the fight, garbage EVENTS cross the wire,
 * exactly one winner + one loser, zero console/page errors on both pages.
 *
 * The production transport (Firestore cwRooms) shares every code path above
 * the transport layer (_mpPub/_mpOnOpp/startVersus), so this proves the
 * versus engine end to end; only the Firestore send/subscribe glue (and the
 * deployed cwRooms rules) differ in production.
 *
 * Usage: python3 -m http.server 8901 (repo root), then:
 *   node scripts/chaffwars/bot_versus.js [--port 8901] [--timeout 150]
 */
var puppeteer = require('puppeteer');

var port = 8901, timeoutS = 150;
process.argv.forEach(function (a, i) {
  if (a === '--port') port = +process.argv[i + 1];
  if (a === '--timeout') timeoutS = +process.argv[i + 1];
});
var URL = 'http://localhost:' + port + '/satellites/chaff-wars/?cwdev=1&mplocal=1';

function collectErrors(page, sink, tag) {
  page.on('pageerror', function (e) { sink.push(tag + ' pageerror: ' + e.message); });
  page.on('console', function (m) { if (m.type() === 'error') sink.push(tag + ' console: ' + m.text()); });
}

(async function () {
  var browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
  var errors = [];
  try {
    var A = await browser.newPage(); // host
    var B = await browser.newPage(); // guest
    collectErrors(A, errors, 'A'); collectErrors(B, errors, 'B');
    await A.goto(URL, { waitUntil: 'networkidle2' });
    await B.goto(URL, { waitUntil: 'networkidle2' });
    await A.waitForFunction('!!window.CW_DEV', { timeout: 15000, polling: 500 });
    await B.waitForFunction('!!window.CW_DEV', { timeout: 15000, polling: 500 });

    var code = await A.evaluate(function () { return CW_DEV.mpCreate('TEST'); });
    await B.evaluate(function () { return CW_DEV.mpJoin('TEST'); });

    // Both must reach the fight (count phase auto-advances)
    await A.waitForFunction("CW_DEV.mpState().phase==='fight'", { timeout: 20000, polling: 500 });
    await B.waitForFunction("CW_DEV.mpState().phase==='fight'", { timeout: 20000, polling: 500 });

    // Start in-page bots: uneven skill so a winner emerges quickly
    await A.evaluate(function () { window.__bot = setInterval(function () { CW_DEV.mpBot(0.85); }, 320); });
    await B.evaluate(function () { window.__bot = setInterval(function () { CW_DEV.mpBot(0.25); }, 380); });

    var deadline = Date.now() + timeoutS * 1000, sA, sB;
    while (Date.now() < deadline) {
      sA = await A.evaluate(function () { return CW_DEV.mpState(); });
      sB = await B.evaluate(function () { return CW_DEV.mpState(); });
      if (sA.phase === 'done' && sB.phase === 'done') break;
      await new Promise(function (r) { setTimeout(r, 1000); });
    }
    await A.evaluate(function () { clearInterval(window.__bot); });
    await B.evaluate(function () { clearInterval(window.__bot); });

    var checks = {
      code: code,
      bothDone: sA.phase === 'done' && sB.phase === 'done',
      results: [sA.result, sB.result],
      oneWinnerOneLoser: (sA.result === 'win' && sB.result === 'lose') || (sA.result === 'lose' && sB.result === 'win'),
      garbageCrossed: (sA.lastEvtIn > 0 || sB.lastEvtIn > 0),
      evtCounts: { A_out: sA.evtOut, A_in: sA.lastEvtIn, B_out: sB.evtOut, B_in: sB.lastEvtIn },
      scores: { A: sA.pf && sA.pf.score, B: sB.pf && sB.pf.score },
      forfeitFlags: [sA.forfeit, sB.forfeit],
      errors: errors
    };
    var pass = checks.bothDone && checks.oneWinnerOneLoser && checks.garbageCrossed && errors.length === 0;
    console.log(JSON.stringify({ VERSUS: pass ? 'PASS' : 'FAIL', checks: checks }, null, 1));
    process.exitCode = pass ? 0 : 1;
  } catch (e) {
    console.log(JSON.stringify({ VERSUS: 'FAIL', fatal: e.message, errors: errors }, null, 1));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
