#!/usr/bin/env node
/* THE LAST GATE, AND THE ONLY ONE THAT RUNS AGAINST THE HOST.
 *
 *   node tools/live.mjs                    the deployed page
 *   node tools/live.mjs --url=<any url>    somewhere else
 *
 * Everything else in tools/ and test/ measures a file on this disk through a
 * local server. The host is the last thing between that file and the player and
 * it is not a neutral pipe: this fleet has shipped a page that served `.mjs` as
 * text/plain, a page whose edge negative cached a 404 for a day, and a page that
 * looked perfect in every local gate and was a black screen on the domain
 * because a service worker's fetch never settled. A stamp in the HTML proves the
 * bytes arrived. It does not prove the game runs.
 *
 * So this opens a real browser on the real URL and asks the four questions a
 * curl cannot: did the page reach READY, is the first control actually there,
 * did anything fail to load, and did anything throw. It fails on any console
 * error, because a page that boots while complaining is a page that is about to
 * stop booting.
 */
import puppeteer from 'puppeteer';

const arg = (n, d) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith('--' + n + '='));
  return hit ? hit.slice(n.length + 3) : d;
};
const URL = arg('url', 'https://lucidwinds.com/satellites/marrowdeep/') +
  (arg('url', '').includes('?') ? '&' : '?') + 'probe=' + Date.now();

const b = await puppeteer.launch({ headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
const p = await b.newPage();
await p.setViewport({ width: 375, height: 667 });

const errs = [], failed = [];
p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
p.on('requestfailed', (r) => failed.push(r.url() + ' ' + ((r.failure() || {}).errorText || '')));

let gotoErr = '';
await p.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 }).catch((e) => { gotoErr = e.message; });

/* ⛔ MD_DEV.ready is a BOOLEAN the boot sets when the DOM is painted, not a
   function and not a frame counter. A probe that calls it throws, and the throw
   looks exactly like the page being broken. */
const ready = await p.waitForFunction(() => window.MD_DEV && window.MD_DEV.ready === true,
  { timeout: 30000 }).then(() => true).catch(() => false);

const info = await p.evaluate(() => ({
  stamp: window.MD_DEV ? window.MD_DEV.stamp : null,
  screen: window.MD_DEV ? window.MD_DEV.screen() : null,
  begin: !!document.getElementById('btnBegin'),
  wordmark: document.querySelector('.wordmark') ? document.querySelector('.wordmark').textContent.trim() : '',
  /* the two the page cannot paint without, one from each layer */
  peek: typeof (window.MD && window.MD.SIM && window.MD.SIM.peekCheck),
  prob: typeof (window.MD && window.MD.passProb)
})).catch((e) => ({ err: e.message }));

await p.screenshot({ path: 'docs/shots/live-title.png' });
await b.close();

const bad = [];
if (gotoErr) bad.push('the page never loaded: ' + gotoErr);
if (!ready) bad.push('the page never reached MD_DEV.ready');
if (!info.begin) bad.push('there is no BEGIN button on the title screen');
if (info.wordmark !== 'MARROWDEEP') bad.push('the wordmark reads ' + JSON.stringify(info.wordmark));
if (info.peek !== 'function') bad.push('SIM.peekCheck is ' + info.peek + ', so the odds cannot be shown');
if (info.prob !== 'function') bad.push('MD.passProb is ' + info.prob);
if (failed.length) bad.push(failed.length + ' request(s) failed: ' + failed.join(' | '));
if (errs.length) bad.push(errs.length + ' console error(s): ' + errs.join(' | '));

console.log('  url        ' + URL);
console.log('  stamp      ' + info.stamp);
console.log('  screen     ' + info.screen + (info.begin ? ', BEGIN is there' : ', NO BEGIN'));
console.log('  the shot   docs/shots/live-title.png');
if (bad.length) {
  console.log('');
  bad.forEach((x) => console.log('  X ' + x));
  console.log('LIVE FAILED');
  process.exit(1);
}
console.log('LIVE OK   the deployed page boots, paints and carries the engine');
