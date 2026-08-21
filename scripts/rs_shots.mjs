import puppeteer from 'puppeteer';
const SP = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');
await new Promise(r => setTimeout(r, 1200));
await p.screenshot({ path: SP + 'vr-title.png' });
await p.evaluate(() => { window.RB_DEV.start(0); });
await new Promise(r => setTimeout(r, 800));
await p.screenshot({ path: SP + 'vr-play.png' });
// stage a swing over the first wide pit
await p.evaluate(() => {
  const D = window.RB_DEV, G = D.full();
  const key = G.lvl.porcs.find(a => a.key) || G.lvl.porcs[0];
  D.teleport(key.x - 90, key.y + 150); G.vx = 220;
  D.grapple();
});
await new Promise(r => setTimeout(r, 350));
await p.screenshot({ path: SP + 'vr-swing.png' });
const sw = await p.evaluate(() => { const g = window.RB_DEV.full(); return { attached: g.rope.attached, x: Math.round(g.bx), y: Math.round(g.by) }; });
console.log('swing staged:', JSON.stringify(sw));
await b.close();
