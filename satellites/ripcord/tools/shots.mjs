/* Opens the built game in a real browser at a real phone size and takes pictures
 * of it, because a green test is not a look.
 *
 *   node tools/shots.mjs            375x667, the worst common phone
 *   node tools/shots.mjs 320 568    the narrowest thing anyone still carries
 *
 * It also measures every visible control with getBoundingClientRect and reports
 * anything under 48 RENDERED pixels, and scans the visible text for dashes,
 * because both of those are studio rules that a stylesheet can appear to satisfy
 * while the device disagrees.
 */
import puppeteer from '/workspaces/lucid-winds/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import http from 'http';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const OUT = path.join(HERE, 'shots');
fs.mkdirSync(OUT, { recursive: true });

const W = parseInt(process.argv[2] || '375', 10);
const H = parseInt(process.argv[3] || '667', 10);
const wait = ms => new Promise(r => setTimeout(r, ms));

/* Serve over http, not file://.
   ⛔ On file:// the origin is "null", so the manifest fetch is blocked by CORS
   and service worker registration throws. Both showed up as page errors that
   have nothing to do with the game and would have trained me to ignore the
   error list, which is the only thing in here that catches a real crash. */
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json',
  '.webmanifest':'application/manifest+json', '.png':'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--font-render-hinting=none']
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

await page.goto('http://127.0.0.1:' + PORT + '/index.html', { waitUntil: 'load' });
await wait(900);

const shot = async (name) => {
  await page.screenshot({ path: path.join(OUT, name + '.png') });
  return name;
};

// 1. first run: the rules sheet opens by itself, which is the studio rule that
//    directions come BEFORE play
await shot('01-first-run');

// 2. the rules, scrolled
await page.evaluate(() => document.querySelector('#howto .sheetBody').scrollTop = 620);
await wait(250);
await shot('02-rules-scrolled');

// 3. the menu, over a live round
await page.evaluate(() => document.querySelector('#howto [data-close]').click());
await wait(1600);
await shot('03-menu');

// 4. the workshop
await page.evaluate(() => document.getElementById('mShop').click());
await wait(500);
await shot('04-workshop-build');

// 5. weights and move
await page.evaluate(() => { document.getElementById('accTune').open = true; });
await wait(400);
await page.evaluate(() => document.querySelector('#sheet .sheetBody').scrollTop = 120);
await wait(250);
await shot('05-workshop-weights');

// 6. tuning
await page.evaluate(() => { document.getElementById('accMods').open = true; });
await wait(400);
await shot('06-workshop-tuning');

// 7. rigs. Fit a build that actually has one, so the panel is not empty.
await page.evaluate(() => {
  const chips = [...document.querySelectorAll('#slots .chip')];
  const want = ['Talon', 'Hook'];
  for (const w of want) { const c = chips.find(c => c.textContent.trim().startsWith(w)); if (c) c.click(); }
});
await wait(300);
await page.evaluate(() => { document.getElementById('accRigs').open = true; });
await wait(400);
await shot('07-workshop-rigs');

// 8. the ladder
await page.evaluate(() => { document.querySelector('#sheet [data-close]').click(); });
await wait(400);
await page.evaluate(() => { document.getElementById('mModes').click(); });
await wait(400);
await shot('08-modes');

// 9. winding, mid gesture
await page.evaluate(() => { document.querySelector('#modes [data-close]').click(); });
await wait(300);
await page.evaluate(() => { document.getElementById('mPlay').click(); });
await wait(700);
await shot('09-wind-empty');

const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.20;
await page.mouse.move(cx, cy - R);
await page.mouse.down();
for (let i = 1; i <= 46; i++) {
  const a = -Math.PI / 2 + (i / 46) * Math.PI * 2 * 2.2;
  const rr = R * (1 + 0.10 * Math.sin(i * 0.7));
  await page.mouse.move(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
}
await shot('10-wind-mid');
for (let i = 47; i <= 62; i++) {
  const a = -Math.PI / 2 + (i / 46) * Math.PI * 2 * 2.2;
  await page.mouse.move(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
}
await page.mouse.up();
await wait(400);
await shot('11-wind-graded');

// 10. the battle, three moments
await page.evaluate(() => document.getElementById('go').click());
await wait(700);  await shot('12-battle-early');
await wait(1400); await shot('13-battle-mid');
await wait(2600); await shot('14-battle-late');

// 11. the measurements. Rendered pixels, not CSS pixels.
await page.evaluate(() => {
  document.getElementById('menu').classList.add('up');
});
await wait(300);
const audit = await page.evaluate(() => {
  const small = [], dashes = [], tiny = [];
  const seen = new Set();
  const visible = el => {
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none' &&
           parseFloat(st.opacity) > 0.05;
  };
  const sheets = ['menu', 'howto', 'ladder', 'modes', 'sheet', 'settings'];
  for (const id of sheets) {
    const s = document.getElementById(id);
    s.classList.add('up'); s.style.visibility = 'visible';
    for (const el of s.querySelectorAll('button,summary,[role=button]')) {
      if (!visible(el) || seen.has(el)) continue;
      seen.add(el);
      const r = el.getBoundingClientRect();
      if (r.height < 48 || r.width < 48)
        small.push(id + ' :: ' + (el.textContent || el.ariaLabel || '?').trim().slice(0, 34) +
                   ' = ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
    for (const el of s.querySelectorAll('*')) {
      if (el.children.length || !el.textContent.trim() || !visible(el)) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 11) tiny.push(id + ' :: ' + el.textContent.trim().slice(0, 30) + ' = ' + fs + 'px');
    }
    if (id !== 'menu') { s.classList.remove('up'); s.style.visibility = ''; }
  }
  // dashes in anything the player reads
  // ⛔ Skip SCRIPT and STYLE. The first run reported eleven dashes and every one
  // was a source comment inside a bundled script block, which no player will
  // ever read. A checker that scans source instead of copy reports noise and
  // trains you to ignore it.
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => /^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentNode.nodeName)
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  let n;
  while ((n = walk.nextNode())) {
    const t = n.nodeValue;
    if (/[—–]/.test(t)) dashes.push('em or en dash: ' + t.trim().slice(0, 60));
    // a hyphen between two letters is prose; a ratchet code like 3-60 is a part
    // number and is the one allowed exception
    if (/[A-Za-z] - [A-Za-z]|[a-z]-[a-z]{2,}/.test(t) && !/^\s*\d-\d\d\s*$/.test(t.trim()))
      dashes.push('hyphen: ' + t.trim().slice(0, 60));
  }
  return { small, dashes: [...new Set(dashes)], tiny };
});

console.log('viewport ' + W + 'x' + H + ', device pixel ratio 2');
console.log('\nCONTROLS UNDER 48 RENDERED PIXELS: ' + (audit.small.length || 'none'));
audit.small.forEach(s => console.log('   ' + s));
console.log('\nTEXT UNDER 11px: ' + (audit.tiny.length || 'none'));
audit.tiny.forEach(s => console.log('   ' + s));
console.log('\nDASHES IN PLAYER COPY: ' + (audit.dashes.length || 'none'));
audit.dashes.forEach(s => console.log('   ' + s));
console.log('\nPAGE ERRORS: ' + (errors.length || 'none'));
errors.forEach(s => console.log('   ' + s));

await browser.close();
server.close();
console.log('\nshots in tools/shots/');
process.exit(errors.length || audit.small.length || audit.tiny.length || audit.dashes.length ? 1 : 0);
