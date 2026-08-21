import puppeteer from 'puppeteer';
const SP = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');
// worlds: burrows 3 (li 8), grove 4 (li 15, spitters), peaks 2 (li 19)
for (const [li, tag] of [[8, 'burrows'], [15, 'grove'], [19, 'peaks']]) {
  await p.evaluate(l => { window.RB_DEV.start(0); window.RB_DEV.startLevel(l); }, li);
  await new Promise(r => setTimeout(r, 600));
  await p.evaluate(() => { const g = window.RB_DEV.full(); g.held.right = true; });
  await new Promise(r => setTimeout(r, 1600));
  await p.evaluate(() => { const g = window.RB_DEV.full(); g.held.right = false; });
  await p.screenshot({ path: SP + 'rr-' + tag + '.png' });
}
// dash: unlock, then real airborne double jump
const dash = await p.evaluate(() => {
  const D = window.RB_DEV, save = JSON.parse(localStorage.getItem('rabbitsamurai_save') || '{}');
  save.cleared = 6; localStorage.setItem('rabbitsamurai_save', JSON.stringify(save));
  return true;
});
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');
await p.evaluate(() => { const D = window.RB_DEV; D.start(0); D.startLevel(1); });
await new Promise(r => setTimeout(r, 400));
await p.evaluate(() => { window.RB_DEV.full().held.jump = true; });
await new Promise(r => setTimeout(r, 80));
await p.evaluate(() => { window.RB_DEV.full().held.jump = false; });
await new Promise(r => setTimeout(r, 200));
const dashRes = await p.evaluate(() => {
  const g = window.RB_DEV.full();
  const pre = { air: !g.onGround, vy: Math.round(g.vy) };
  g.held.jump = true;
  return pre;
});
await new Promise(r => setTimeout(r, 90));
const dashAfter = await p.evaluate(() => {
  const g = window.RB_DEV.full(); g.held.jump = false;
  return { vx: Math.round(g.vx), dashT: g.dashT > 0 || Math.abs(g.vx) > 450, dashed: g.dashed };
});
Object.assign(dashRes, dashAfter);
console.log('dash:', JSON.stringify(dashRes));
if (!dashRes.air || !dashRes.dashed || Math.abs(dashRes.vx) < 400) { console.error('DASH DID NOT FIRE'); process.exitCode = 1; }
// select screen
await p.evaluate(() => { document.querySelectorAll('.screen').forEach(s => s.classList.remove('on')); });
await p.click('#b-select').catch(() => {});
await p.evaluate(() => { window.dispatchEvent(new Event('resize')); });
await p.evaluate(() => { const el = document.getElementById('s-select'); if (!el.classList.contains('on')) { window.RB_DEV && null; } });
await p.evaluate(() => { if (!document.getElementById('s-select').classList.contains('on')) { document.getElementById('b-select') && document.getElementById('b-select').click(); } });
await new Promise(r => setTimeout(r, 400));
const sel = await p.evaluate(() => ({
  on: document.getElementById('s-select').classList.contains('on'),
  cells: document.querySelectorAll('.dojocell').length,
  locked: document.querySelectorAll('.dojocell.locked').length
}));
console.log('select:', JSON.stringify(sel));
await p.screenshot({ path: SP + 'rr-select.png' });
if (!sel.on || sel.cells !== 24 || sel.locked !== 17) { console.error('SELECT SCREEN WRONG (cleared=6 -> 17 locked)'); process.exitCode = 1; }
await b.close();
console.log(process.exitCode ? 'FAILED' : 'WORLDS + DASH + SELECT PASS');
