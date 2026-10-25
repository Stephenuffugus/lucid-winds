// node tools/tally-tests/oldworker.mjs <origin> prime|check [wantBuild]
// Deploy proof from a persistent profile per origin (lucidwinds.com and www.lucidwinds.com are two origins).
// prime: BEFORE the deploy, load the live Tally and let its worker install and fill its cache (the old build).
// check: AFTER the deploy, one reload in the same profile, then a REAL tap on Settings to read the build line;
// prints the worker script, the caches, the bundle the DOM loaded and the build. Exit 1 if wantBuild is given and differs.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const [origin, phase, want] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const prof = '/tmp/claude-1000/tally-ow/profile-' + origin.replace(/[^a-z]/g, '');
// The host's LiteSpeed reCAPTCHA ("Bot Verification", memory project_portal_games_403_recaptcha_iframe) answers any
// browser-like user agent on an HTML page with a 403 challenge that cannot pass headless (and failed challenges get the
// IP blocked for every agent for a while); curl's own agent is served the page.
// It is set on the command line so the service worker's own fetches carry it too. The worker logic does not read it.
const b = await puppeteer.launch({ headless: 'new', userDataDir: prof, args: ['--no-sandbox', '--disable-dev-shm-usage', '--user-agent=curl/8.5.0'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
await p.goto(origin + '/satellites/tally/', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(phase === 'prime' ? 6000 : 3000);
let build = null;
if (phase === 'check') {
  // close a first run How to play if it is up, then open Settings with a real tap
  const c = await p.evaluate(() => {
    const at = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; };
    return { howto: document.querySelector('.mv-howto') ? at('.mv-modal .mv-btn.primary') : null, settings: at('[aria-label="Settings"]') };
  });
  if (c.howto) { await p.touchscreen.tap(c.howto.x, c.howto.y); await sleep(500); }
  const s = await p.evaluate(() => { const e = document.querySelector('[aria-label="Settings"]'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.touchscreen.tap(s.x, s.y); await sleep(600);
  build = await p.evaluate(() => { const e = document.querySelector('.mv-set-build'); return e ? e.textContent.trim() : null; });
}
const r = await p.evaluate(async () => {
  const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : [];
  const sw = regs.map((g) => (g.active && g.active.scriptURL) || (g.waiting && g.waiting.scriptURL) || (g.installing && g.installing.scriptURL));
  const keys = await caches.keys();
  const bundle = [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src')).filter((s) => /assets\/index-/.test(s));
  return { href: location.href, title: document.title, sw, keys, controlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller), bundle };
});
console.log(phase, origin, JSON.stringify({ ...r, build }), 'errs', JSON.stringify(errs));
await b.close();
process.exit(want && build !== want ? 1 : 0);
