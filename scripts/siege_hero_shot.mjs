import puppeteer from 'puppeteer';
const SP = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
await p.goto('http://127.0.0.1:8777/satellites/siege/index.html', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('#startbtn'); await p.click('#startbtn');
await new Promise(r => setTimeout(r, 400));
const staged = await p.evaluate(() => {
  const s = window.G;
  window.SIM.startWave(s);
  s.player.lvl = 3; s.player.xp = 70;
  return s.phase;
});
await p.waitForFunction('window.G && window.G.enemies.length > 0', { timeout: 15000 });
// enemy far up the lane, then swing: should fire the arrow
await p.evaluate(() => { const e = window.G.enemies[0]; e.cell = 11; e.moveT = 60; });
await p.evaluate(() => { document.getElementById('atk').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
await new Promise(r => setTimeout(r, 180));
const facts = await p.evaluate(() => ({
  arrowInDom: !!document.querySelector('.arrowfx'),
  enemyHp: window.G.enemies[0].hp, enemyMax: window.G.enemies[0].maxHp,
  blade: document.getElementById('t-blade') ? document.getElementById('t-blade').textContent : (window.SIM.heroDamage(window.G) + '')
}));
console.log(JSON.stringify(facts));
await p.screenshot({ path: SP + 'siege-hero.png' });
if (!facts.arrowInDom && facts.enemyHp === facts.enemyMax) { console.error('LONGBOW DID NOT FIRE'); process.exitCode = 1; }
await b.close();
console.log(process.exitCode ? 'FAILED' : 'HERO SHOT PASS');
