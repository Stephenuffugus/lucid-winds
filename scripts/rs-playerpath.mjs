import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true });
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'networkidle2' });
await p.waitForFunction('!!window.RB_DEV');
await new Promise(r => setTimeout(r, 1000));
// start dojo 1, teleport beside the diamond, let the REAL loop carry us through
// levelClear -> clear phase -> advanceLevel (the in-loop transition)
await p.evaluate(() => {
  window.RB_DEV.start(0);
  const g = window.RB_DEV.full();
  window.RB_DEV.teleport(g.lvl.diamond.x - 30, g.lvl.diamond.y);
  g.held.right = true;
});
await p.waitForFunction('window.RB_DEV.full() && window.RB_DEV.full().li===1 && window.RB_DEV.full().phase==="play"', { timeout: 8000 });
await p.evaluate(() => { window.RB_DEV.full().held.right = false; });
await new Promise(r => setTimeout(r, 600)); // settle on dojo 2 ground
const pre = await p.evaluate(() => { const g = window.RB_DEV.full(); return { onG: g.onGround, li: g.li }; });
// REAL touch on JUMP
const map = await p.evaluate(() => { const s = Math.min(innerWidth/540, innerHeight/960); return { s, ox:(innerWidth-540*s)/2, oy:(innerHeight-960*s)/2 }; });
const cdp = await p.target().createCDPSession();
await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{ x: map.ox+470*map.s, y: map.oy+884*map.s, id:0 }] });
await new Promise(r => setTimeout(r, 120));
const mid = await p.evaluate(() => { const g = window.RB_DEV.full(); return { vy: Math.round(g.vy), jump: g.held.jump }; });
await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
console.log(JSON.stringify({ pre, mid }));
if (!pre.onG || pre.li !== 1 || !mid.jump || !(mid.vy < -100)) { console.log('PLAYER-PATH FAIL'); process.exit(1); }
console.log('PLAYER-PATH PASS: cleared dojo 1 in-loop, jumped on dojo 2 with a real touch');
await b.close();
