import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true });
p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');
const sc = await p.evaluate(() => window.RB_DEV.selfCheck ? window.RB_DEV.selfCheck() : 'no selfCheck');
console.log('selfCheck:', JSON.stringify(sc));
// shop: grant carrots, buy vine tier 1, verify reach + persistence
const shop = await p.evaluate(() => {
  localStorage.removeItem('rabbitsamurai_save');
  location.reload; // no-op marker
  return true;
});
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');
const r = await p.evaluate(() => {
  const w = window;
  // reach into closure via the shop UI: grant bank by writing save + reload is heavy;
  // instead drive the real UI after setting PROG through a cleared level shortcut:
  const save = JSON.parse(localStorage.getItem('rabbitsamurai_save') || '{}');
  save.bank = 100; save.up = { vine: 0, fling: 0, heart: 0, paws: 0 };
  localStorage.setItem('rabbitsamurai_save', JSON.stringify(save));
  return save;
});
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');
await p.click('#b-shop');
await new Promise(res => setTimeout(res, 300));
const before = await p.evaluate(() => document.getElementById('shop-bank').textContent);
await p.click('#shop-items button[data-buy="vine"]');
await new Promise(res => setTimeout(res, 300));
const after = await p.evaluate(() => ({
  bank: document.getElementById('shop-bank').textContent,
  saved: JSON.parse(localStorage.getItem('rabbitsamurai_save')).up.vine,
  pips: document.querySelector('.shopline .tier').textContent
}));
console.log('shop:', JSON.stringify({ before, after }));
if (before !== '100' || after.bank !== '70' || after.saved !== 1) { console.error('SHOP FLOW BROKEN'); process.exitCode = 1; }
// upgraded vine reach applies in-game
const reach = await p.evaluate(() => {
  window.RB_DEV.start(0);
  const D = window.RB_DEV;
  // teleport far under an anchor beyond base reach (235) but within 280
  const a = D.full().lvl.porcs[0];
  D.teleport(a.x + 0, a.y + 262);
  const g = D.grapple();
  return { attached: g.attached };
});
console.log('upgraded reach 262px:', JSON.stringify(reach));
if (!reach.attached) { console.error('VINE UPGRADE HAS NO EFFECT'); process.exitCode = 1; }
await p.screenshot({ path: '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/rs-shop.png' });
await b.close();
console.log(process.exitCode ? 'FAILED' : 'SHOP + REACH PASS');
