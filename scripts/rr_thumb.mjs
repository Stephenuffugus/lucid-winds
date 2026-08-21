import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 540, height: 960, deviceScaleFactor: 1 });
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1200));
const box = await p.evaluate(() => {
  const t = document.querySelector('.title-word').getBoundingClientRect();
  return { cx: t.left + t.width / 2, cy: t.top + t.height / 2 };
});
const y = Math.max(0, Math.min(960 - 480, box.cy - 160));
await p.screenshot({ path: '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/rr-title-full.png',
  clip: { x: 30, y, width: 480, height: 480 } });
await b.close();
console.log('shot at y=' + y);
