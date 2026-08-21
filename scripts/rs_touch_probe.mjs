/* rs_touch_probe.mjs — REAL-touch proof that Rabbit Samurai's JUMP works now
   that the feedback fab parks top-right instead of on the button.
   Asserts, per dojo 1 and 2:
     1. the fab (if mounted) is nowhere near the JUMP circle
     2. a real touchstart at JUMP's center sets G.held.jump and produces vy<0
     3. multitouch: left pad held + jump tap => moving AND jumping
   Run: node scripts/rs_touch_probe.mjs   (server on :8777 at repo root) */
import puppeteer from 'puppeteer';

const URL = 'http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1';
const VW = 540, VH = 960;

function fail(msg) { console.error('FAIL: ' + msg); process.exitCode = 1; }

const browser = await puppeteer.launch({ headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
page.on('pageerror', e => fail('pageerror: ' + e.message));
await page.goto(URL, { waitUntil: 'networkidle2' });
await page.waitForFunction('!!window.RB_DEV', { timeout: 8000 });
// let the load-event fab injector finish
await new Promise(r => setTimeout(r, 1200));

// game coords -> client px through the real letterbox (preserveAspectRatio meet)
const map = await page.evaluate((VW, VH) => {
  const s = Math.min(innerWidth / VW, innerHeight / VH);
  return { s, ox: (innerWidth - VW * s) / 2, oy: (innerHeight - VH * s) / 2 };
}, VW, VH);
const toClient = (gx, gy) => ({ x: map.ox + gx * map.s, y: map.oy + gy * map.s });

// button centers from source: BJUMP={x:VW-118,y:VH-124,w:96,h:96} -> center (470,884)
const JUMP = toClient(470, 884);
const LEFT = toClient(70, 884); // BLEFT mirrors on the left edge

async function realTouch(points, holdMs) {
  const tp = points.map(p => ({ x: p.x, y: p.y }));
  const cdp = await page.target().createCDPSession();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart',
    touchPoints: tp.map((p, i) => ({ ...p, id: i })) });
  const during = await page.evaluate(() => {
    const g = window.RB_DEV.full();
    return g ? { held: { ...g.held } } : null;
  });
  await new Promise(r => setTimeout(r, holdMs));
  const mid = await page.evaluate(() => window.RB_DEV.state());
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
  return { during, mid };
}

for (const dojo of [0, 1]) {
  await page.evaluate(li => { window.RB_DEV.start(li); }, dojo);
  await new Promise(r => setTimeout(r, 300));

  // 1. fab clear of JUMP?
  const fab = await page.evaluate((jx, jy) => {
    const f = document.querySelector('.lwfb-fab');
    if (!f) return { mounted: false };
    const r = f.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const d = Math.hypot(cx - jx, cy - jy);
    const el = document.elementFromPoint(jx, jy);
    return { mounted: true, fabAt: [Math.round(cx), Math.round(cy)], distToJump: Math.round(d),
      atJump: el ? el.tagName + (el.id ? '#' + el.id : '') + '.' + el.className : 'none' };
  }, JUMP.x, JUMP.y);
  console.log(`dojo ${dojo + 1} fab:`, JSON.stringify(fab));
  if (fab.mounted && fab.distToJump < 90) fail(`dojo ${dojo + 1}: fab ${fab.distToJump}px from JUMP center`);
  if (fab.mounted && /lwfb/.test(fab.atJump)) fail(`dojo ${dojo + 1}: fab element still on top of JUMP (${fab.atJump})`);

  // 2. solo jump via a REAL touch
  const solo = await realTouch([JUMP], 120);
  console.log(`dojo ${dojo + 1} solo:`, JSON.stringify({ held: solo.during && solo.during.held, vy: solo.mid.vy, onGround: solo.mid.onGround }));
  if (!solo.during || !solo.during.held.jump) fail(`dojo ${dojo + 1}: touch on JUMP did not set held.jump`);
  if (!(solo.mid.vy < -100)) fail(`dojo ${dojo + 1}: no upward velocity after jump tap (vy=${solo.mid.vy})`);
  await new Promise(r => setTimeout(r, 900)); // land

  // 3. move + jump multitouch (his exact report: "I can't move and jump")
  const cdp = await page.target().createCDPSession();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: LEFT.x, y: LEFT.y, id: 0 }] });
  await new Promise(r => setTimeout(r, 150));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart',
    touchPoints: [{ x: LEFT.x, y: LEFT.y, id: 0 }, { x: JUMP.x, y: JUMP.y, id: 1 }] });
  await new Promise(r => setTimeout(r, 100));
  const multi = await page.evaluate(() => {
    const g = window.RB_DEV.full();
    return { held: { ...g.held }, vy: Math.round(g.vy), vx: Math.round(g.vx) };
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
  console.log(`dojo ${dojo + 1} multi:`, JSON.stringify(multi));
  if (!multi.held.left || !multi.held.jump) fail(`dojo ${dojo + 1}: multitouch held=${JSON.stringify(multi.held)}`);
  await new Promise(r => setTimeout(r, 900));
}

await page.screenshot({ path: process.env.SHOT || '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/rs-fixed.png' });
await browser.close();
console.log(process.exitCode ? 'PROBE FAILED' : 'ALL PASS');
