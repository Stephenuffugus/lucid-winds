import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true });
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'networkidle2' });
await p.waitForFunction('!!window.RB_DEV');
// mimic the probe order: dojo1 start, brief play, then dojo2 start
await p.evaluate(() => { window.RB_DEV.start(0); });
await new Promise(r => setTimeout(r, 500));
const s1 = await p.evaluate(() => ({ t: window.RB_DEV.full().t.toFixed(2), run: window.__rsRun ? 1 : 0 }));
await p.evaluate(() => { window.RB_DEV.start(1); });
for (const ms of [100, 400, 800]) {
  await new Promise(r => setTimeout(r, ms));
  const s = await p.evaluate(() => {
    const g = window.RB_DEV.full();
    return { t: +g.t.toFixed(3), phase: g.phase, vy: Math.round(g.vy), onG: g.onGround, li: g.li };
  });
  console.log(ms, JSON.stringify(s));
}
await b.close();
