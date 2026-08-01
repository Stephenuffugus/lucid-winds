/* Can a player actually type into the feedback form?
 *
 *   node typing.mjs [game-dir ...]
 *
 * A player reported they could not type "s" or a space, and could not enter
 * their own email address, on vinewinder. Cause: games bind a global key
 * handler and preventDefault() their controls without checking whether the
 * player is typing. This opens the real page in a real browser, opens the real
 * feedback form, and TYPES the reporter's own email plus a sentence with spaces.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const puppeteer = createRequire(import.meta.url)('/workspaces/lucid-winds/node_modules/puppeteer');

const ROOT = '/workspaces/lucid-winds';
const GAMES = process.argv.slice(2);
const MIME = { '.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png',
  '.jpg':'image/jpeg','.webp':'image/webp','.css':'text/css','.svg':'image/svg+xml','.mp3':'audio/mpeg',
  '.woff2':'font/woff2','.glb':'model/gltf-binary' };
const srv = await new Promise(r => { const s = http.createServer((q, p) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (u.endsWith('/')) u += 'index.html';
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { p.writeHead(404); return p.end(); }
  p.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control':'no-store' });
  fs.createReadStream(f).pipe(p); }); s.listen(0, '127.0.0.1', () => r(s)); });
const PORT = srv.address().port;

const browser = await puppeteer.launch({ headless: 'new',
  args: ['--no-sandbox','--disable-setuid-sandbox','--enable-unsafe-swiftshader',
         '--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage'] });

const EMAIL = 'sonuyadav4755@gmail.com';           // the reporter's own address
const SENTENCE = 'space bar and the s key both work now';
let bad = 0;

for (const g of GAMES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 700 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  try {
    await page.goto(`http://127.0.0.1:${PORT}/satellites/${g}/`, { waitUntil:'load', timeout:60000 });
    await new Promise(r => setTimeout(r, 3500));       // feedback.js mounts on window load

    // open the real feedback panel the way a player does
    const opened = await page.evaluate(() => {
      if (window.LW_Feedback && window.LW_Feedback.open) { window.LW_Feedback.open({}); return true; }
      const fab = document.querySelector('.lwfb-fab, #lwfb-fab, [class*="lwfb"][class*="fab"]');
      if (fab) { fab.click(); return true; }
      return false;
    });
    if (!opened) { console.log(`  ??  ${g.padEnd(20)} no feedback widget found`); await page.close(); continue; }
    await new Promise(r => setTimeout(r, 700));

    await page.click('#lwfb-contact');
    await page.type('#lwfb-contact', EMAIL, { delay: 8 });
    await page.click('#lwfb-details');
    await page.type('#lwfb-details', SENTENCE, { delay: 8 });

    const got = await page.evaluate(() => ({
      contact: (document.getElementById('lwfb-contact') || {}).value || '',
      details: (document.getElementById('lwfb-details') || {}).value || '',
    }));
    const okMail = got.contact === EMAIL;
    const okText = got.details === SENTENCE;
    if (okMail && okText) console.log(`  ok  ${g.padEnd(20)} typed the email and a sentence with spaces`);
    else {
      bad++;
      console.log(`  FAIL ${g.padEnd(19)} email "${got.contact}" details "${got.details}"`);
    }
    if (errs.length) console.log(`       (js errors: ${errs.slice(0,2).join(' | ')})`);
  } catch (e) {
    bad++; console.log(`  FAIL ${g.padEnd(19)} ${String(e).slice(0,90)}`);
  }
  await page.close();
}
await browser.close(); srv.close();
console.log(bad ? `\ntyping: ${bad} FAILED` : `\ntyping: every game accepted the full email and spaces`);
process.exit(bad ? 1 : 0);
