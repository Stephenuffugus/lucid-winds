import puppeteer from 'puppeteer';
const SP = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
await p.goto('http://127.0.0.1:8777/satellites/stop-the-light/index.html?stl_test=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.STL');
await p.evaluate(() => { STL.launch('free'); });
await new Promise(r => setTimeout(r, 600));
for (const [round, name] of [[3, 'square'], [7, 'inf'], [9, 'twin']]) {
  const st = await p.evaluate(rr => { STL.setRound(rr); return { shape: STL.state.shape, twin: STL.state.twin }; }, round);
  await new Promise(r => setTimeout(r, 1400)); // let the light fly a bit
  const bar = await p.evaluate(() => document.getElementById('twinbar').classList.contains('on'));
  console.log(name, JSON.stringify(st), 'twinbar:', bar);
  await p.screenshot({ path: SP + 'stl-' + name + '.png' });
}
// twin resolution via the real buttons: aim gold+violet into the band by hand
const res = await p.evaluate(() => {
  const G = STL.state;
  if (G.phase === 'ready') G.phase = 'run';
  G.theta = G.bandC;                       // gold on the heart
  document.getElementById('tb-gold').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  const mid = { frozen: G.frozen, frozen2: G.frozen2, phase: G.phase };
  G.m2 = G.bandC;                          // violet on the heart
  document.getElementById('tb-violet').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  return { mid, after: { hit: G.hit, hit2: G.hit2, gain: G.gain, phase: G.phase, roundVal: G.roundVal } };
});
console.log('twin buttons:', JSON.stringify(res));
await p.screenshot({ path: SP + 'stl-twin-stop.png' });
await b.close();
