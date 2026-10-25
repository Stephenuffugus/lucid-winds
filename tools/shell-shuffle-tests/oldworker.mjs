// node tools/shell-shuffle-tests/oldworker.mjs <origin> prime|check [wantBuild]   (Shell Shuffle: no game worker; the fleet's root worker and the host cache sit in front)
// Deploy proof from a persistent profile per origin (lucidwinds.com and www.lucidwinds.com are two origins).
// prime: BEFORE the deploy, load the live Tally and let its worker install and fill its cache (the old build).
// check: AFTER the deploy, one reload in the same profile, then a REAL tap on Settings to read the build line;
// prints the worker script, the caches, the bundle the DOM loaded and the build. Exit 1 if wantBuild is given and differs.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const [origin, phase, want] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// FRESH=1: a brand new profile (a first visit), deleted after the run
const prof = '/tmp/claude-1000/ss-ow/' + (process.env.FRESH ? 'fresh-' : 'profile-') + origin.replace(/[^a-z]/g, '');
if (process.env.FRESH) (await import('node:fs')).rmSync(prof, { recursive: true, force: true });
// The host's LiteSpeed reCAPTCHA ("Bot Verification", memory project_portal_games_403_recaptcha_iframe) answers any
// browser-like user agent on an HTML page with a 403 challenge that cannot pass headless (and failed challenges get the
// IP blocked for every agent for a while); curl's own agent is served the page.
// It is set on the command line so the service worker's own fetches carry it too. The worker logic does not read it.
const b = await puppeteer.launch({ headless: 'new', userDataDir: prof, args: ['--no-sandbox', '--disable-dev-shm-usage', '--user-agent=curl/8.5.0'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
await p.goto(origin + '/satellites/shell-shuffle/', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(phase === 'prime' ? 6000 : 3000);
let build = null;
if (phase === 'check') {
  // How to play holds the build line (Part 0); open it with a real tap and read it
  const c = await p.evaluate(() => { const e = document.getElementById('openHelp'); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  if (c) { await p.touchscreen.tap(c.x, c.y); await sleep(500); }
  build = await p.evaluate(() => { const e = document.getElementById('buildLine'); return e ? e.textContent.trim() : null; });
}
const r = await p.evaluate(async () => {
  const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : [];
  const sw = regs.map((g) => (g.active && g.active.scriptURL) || (g.waiting && g.waiting.scriptURL) || (g.installing && g.installing.scriptURL));
  const keys = await caches.keys();
  const bundle = document.documentElement.outerHTML.length;
  return { href: location.href, title: document.title, sw, keys, controlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller), bundle };
});
console.log(phase, origin, JSON.stringify({ ...r, build }), 'errs', JSON.stringify(errs));
// stay open a moment, as a phone does: a stale-while-revalidate index refreshes in the background, and closing at once cuts it off
await sleep(8000);
await b.close();
process.exit(want && build !== want && build !== 'Build ' + want ? 1 : 0);   // the line reads "Build v1.3"; either spelling proves it
