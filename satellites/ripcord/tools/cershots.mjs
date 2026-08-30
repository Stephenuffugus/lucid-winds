/* cershots — photographs the ceremony from where the player stands.
 *
 * Per the studio rule: a visual change is not done until somebody has opened
 * the image. Twelve green gates once shipped a see-through floor. This plays
 * real rounds at a real phone size until a match ends, then saves every beat of
 * the ceremony plus the launch drop, so they can be read rather than asserted.
 *
 *   node tools/cershots.mjs [outDir]
 */
import puppeteer from '/workspaces/lucid-winds/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { fileURLToPath } from 'url';
import path from 'path'; import fs from 'fs'; import http from 'http';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || path.join(ROOT, 'docs', 'shots-ceremony');
fs.mkdirSync(OUT, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json',
                '.webmanifest':'application/manifest+json', '.png':'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const f = path.join(ROOT, rel);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL_BASE = 'http://127.0.0.1:' + server.address().port + '/index.html';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') console.log('  CONSOLE: ' + m.text()); });
const VW = parseInt(process.env.RC_W || '375', 10), VH = parseInt(process.env.RC_H || '667', 10);
await page.setViewport({ width: VW, height: VH, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
let n = 0;
const shot = async name => { const f = path.join(OUT, String(++n).padStart(2,'0') + '-' + name + '.png');
                             await page.screenshot({ path: f }); console.log('  ' + path.basename(f)); };

async function windIt(laps = 3.0) {
  const cx = Math.round(VW / 2), cy = Math.round(VH / 2), R = Math.round(Math.min(VW, VH) * 0.21);
  await page.mouse.move(cx, cy - R); await page.mouse.down();
  const steps = Math.round(20 * laps);
  for (let i = 1; i <= steps; i++) {
    const a = -Math.PI/2 + (i/steps) * Math.PI * 2 * laps;
    const rr = R * (1 + 0.06 * Math.sin(i * 0.9));
    await page.mouse.move(cx + Math.cos(a)*rr, cy + Math.sin(a)*rr);
  }
  await page.mouse.up(); await wait(250);
}
const cerUp = () => page.evaluate(() => document.getElementById('cer').classList.contains('up'));
const dockBack = () => page.evaluate(() => !document.getElementById('dock').classList.contains('hide'));

await page.goto(URL_BASE, { waitUntil: 'load' }); await wait(700);
await page.evaluate(() => { const d = document.querySelector('#howto [data-close]'); if (d) d.click(); });
await wait(500);
// rung one with a build that takes it, so the reward path is what gets photographed
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('ripcord.save.v1') || '{}');
  s.rung = 0; s.facing = 0;
  s.unlocked = (s.unlocked || []).concat(['moth','orbit','slick','5-60','needle','chip']);
  /* ⛔ Counterweights persist as `holes` (a 2 ring by 6 hole grid of weight
     indices: 0 none, 1 chip, 2 slug, 3 brick), NOT as the `weights` array the
     simulation takes. Writing `weights` here parsed fine, saved fine, and was
     silently dropped on load, so the run rode a stamina build with no weights
     on it and lost three times in a row looking like bad luck. */
  s.build = { core:'moth', blade:'orbit', assist:'slick', ratchet:'5-60', bit:'needle',
              holes: [[0,0,0,0,0,0],[1,0,1,0,1,0]], trigger:'charged', rigs:[] };
  localStorage.setItem('ripcord.save.v1', JSON.stringify(s));
});
await page.reload({ waitUntil: 'load' }); await wait(800);
console.log('  the game is riding: ' +
  await page.evaluate(() => JSON.stringify(window.__fitted ? window.__fitted() : 'no hook')));
await page.evaluate(() => document.getElementById('mPlay').click()); await wait(600);

console.log('THE LAUNCH BEAT');
await windIt(3.0);
await shot('wind-card');                       // the stats, mid fade in
await page.evaluate(() => document.getElementById('go').click());
await wait(120); await shot('drop-early');     // tops still coming down, cord out
await wait(260); await shot('drop-mid');
await wait(340); await shot('drop-landed');
await wait(1400); await shot('play');

console.log('\nPLAYING TO THE END OF A MATCH');
let ended = false;
for (let r = 0; r < 14 && !ended; r++) {
  for (let i = 0; i < 70; i++) {
    await wait(400);
    if (await cerUp()) { ended = true; break; }
    if (await dockBack()) break;
  }
  if (ended) break;
  if (!await dockBack()) continue;
  await windIt(3.0);
  await page.evaluate(() => document.getElementById('go').click());
  await wait(500);
}
console.log('\nTHE CEREMONY');
for (let i = 0; i < 12; i++) {
  if (!await cerUp()) break;
  await wait(420);
  const beat = await page.evaluate(() => ({
    kick: document.getElementById('cerKick').textContent.trim(),
    big: document.getElementById('cerBig').textContent.trim(),
    btns: [...document.querySelectorAll('#cerBtns .btn')].map(b => b.textContent.trim())
  }));
  await shot('beat-' + (beat.kick || 'x').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,22));
  console.log('        "' + beat.kick + '" / "' + beat.big + '"  [' + beat.btns.join(', ') + ']');
  if (beat.btns.length) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('#cerBtns .btn')];
      (b.find(x => /Fit it|Ready|Good/.test(x.textContent)) || b[0]).click();
    });
  } else { await page.mouse.click(Math.round(VW / 2), Math.round(VH * 0.3)); }
  await wait(700);
}
await wait(900); await shot('back-in-your-hands');
console.log('\n' + n + ' frames in ' + OUT);
await browser.close(); server.close();
