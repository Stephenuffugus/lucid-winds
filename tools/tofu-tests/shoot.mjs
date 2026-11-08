/* Shoot TOFU at 412x915 (2 device px per CSS px, touch on): ONE screen per visual step (THE TESTING LAW in
 * TOFU_BUILD_PLAN.md), measured from the shell, never opened. Made in step 0 from tools/sunforge-tests/shoot.mjs.
 *
 *   (cd /workspaces/lucid-winds/satellites/tofu && setsid python3 -m http.server 8791 >/dev/null 2>&1 &)   serve the game
 *   node tools/tofu-tests/shoot.mjs <outdir> title                 the title
 *   LEVEL=4 node tools/tofu-tests/shoot.mjs <outdir> card          the recipe card of level index 4 (?level=4)
 *   LEVEL=1 node tools/tofu-tests/shoot.mjs <outdir> play          level index 1 in play (TOFU.go), SETTLE ms after
 *   JS='...' runs after TOFU.go in play; PROBE='...' is evaluated just before the shot and printed
 *   W=360 H=780 ... a narrower phone; Q=extra=1 adds to the query; then pkill -f "http.server 8791"
 * Prints the shot's path, its size, and the page errors (or "no page errors"). */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/package.json');
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const out = process.argv[2] || '/home/codespace/overnight-nov08/scratch/tofu/shots';
const only = process.argv[3] || 'title';
const W = parseInt(process.env.W || '412', 10), H = parseInt(process.env.H || '915', 10);
const LEVEL = parseInt(process.env.LEVEL || '0', 10), SETTLE = parseInt(process.env.SETTLE || '1500', 10);
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'], protocolTimeout: 120000, timeout: 120000 });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const wait = ms => new Promise(r => setTimeout(r, ms));
const ev = async js => { try { return await page.evaluate(js); } catch (e) { console.log('  failed:', js, e.message); } };
const q = (only === 'card' ? 'level=' + LEVEL + '&' : '') + 'dev=1' + (process.env.Q ? '&' + process.env.Q : '');
await page.goto('http://localhost:8791/?' + q, { waitUntil: 'networkidle0', timeout: 90000 });
await wait(800);
const SCREENS = {
  title: async () => {},
  card: async () => {},
  play: async () => { await ev('TOFU.go(' + LEVEL + ')'); if (process.env.JS) await ev(process.env.JS); await wait(SETTLE); },
};
if (!SCREENS[only]) { console.log('unknown screen ' + only); await browser.close(); process.exit(1); }
await SCREENS[only]();
await wait(400);
if (process.env.PROBE) console.log('probe: ' + JSON.stringify(await ev(process.env.PROBE)));
const file = `${out}/${only}${only === 'title' ? '' : '-' + LEVEL}.png`;
await page.screenshot({ path: file, type: 'png' });
console.log(file + ' (shot taken, not opened)');
await browser.close();
console.log(errs.length ? 'PAGE ERRORS: ' + errs.join(' ; ') : 'no page errors');
