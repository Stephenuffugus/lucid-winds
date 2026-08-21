import puppeteer from 'puppeteer';
const SP = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sw_dev_unlock', '1'); localStorage.setItem('lw_dev_unlocked','1'); } catch (e) {} });
await p.goto('http://127.0.0.1:8777/satellites/parallel/index.html', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1500));
await p.screenshot({ path: SP + 'par-boot.png' });
// try to enter level 1: click the first star / play button
const clicked = await p.evaluate(() => {
  const cands = document.querySelectorAll('button, [data-level], .star, circle');
  for (const el of cands) { const t = (el.textContent || '').trim().toLowerCase();
    if (/play|start|begin/.test(t)) { el.click(); return 'btn:' + t; } }
  return null;
});
await new Promise(r => setTimeout(r, 1000));
await p.screenshot({ path: SP + 'par-1.png' });
console.log('clicked:', clicked);
await b.close();
