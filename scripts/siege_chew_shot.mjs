import puppeteer from 'puppeteer';
const SHOT = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/siege-chew.png';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
await p.goto('http://127.0.0.1:8777/satellites/siege/index.html', { waitUntil: 'networkidle2' });
await p.waitForSelector('#startbtn');
await p.click('#startbtn');
await new Promise(r => setTimeout(r, 400));
// stage the scene on the LIVE state: wall mid lane, chewer beside it, player at the wall
const staged = await p.evaluate(() => {
  const s = window.G;
  if (!s) return 'no G';
  window.SIM.placeTrap(s, 8, 'wall');
  window.SIM.startWave(s);
  s.player.cell = 7;
  return s.phase;
});
console.log('staged phase:', staged);
// wait for a spawned body, then teleport it to the wall face
await p.waitForFunction('window.G && window.G.enemies.length > 0', { timeout: 15000 });
await p.evaluate(() => { const e = window.G.enemies[0]; e.cell = 9; e.moveT = 0; });
// catch a chew frame: trap node carries .chew for 240ms after each wallhit
try {
  await p.waitForFunction(() => {
    const t = document.querySelectorAll('.trap');
    for (const n of t) if (n.classList.contains('chew')) return true;
    return false;
  }, { timeout: 6000, polling: 30 });
  console.log('chew frame caught');
} catch (e) { console.log('no chew frame seen'); process.exitCode = 1; }
const facts = await p.evaluate(() => {
  const w = window.G.traps[8];
  const atk = document.getElementById('atk');
  const bar = document.querySelector('.trap .wbar');
  return { wallHits: w ? w.hits : 'gone', urge: atk.classList.contains('urge'), wbar: !!bar };
});
console.log(JSON.stringify(facts));
await p.screenshot({ path: SHOT });
await b.close();
