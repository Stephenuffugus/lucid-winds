import puppeteer from 'puppeteer';
const SP = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/';
const ARGS = ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'];
async function boot(url) {
  const b = await puppeteer.launch({ headless: 'new', args: ARGS });
  const p = await b.newPage();
  await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2500));
  return { b, p };
}
// case 1: hub menu has all mode buttons
{
  const { b, p } = await boot('http://127.0.0.1:8777/satellites/slice-3d/');
  const menu = await p.evaluate(() => ({
    climb: !!document.getElementById('b-climb'), classic: !!document.getElementById('b-classic'),
    ff: !!document.getElementById('b-ff'), endless: !!document.getElementById('b-endless'),
    play: !!document.getElementById('b-play'),
    climbVisible: (function(){ const el = document.getElementById('b-climb'); if(!el) return false;
      const r = el.getBoundingClientRect(); return r.width > 60 && r.height >= 33; })()
  }));
  console.log('menu:', JSON.stringify(menu));
  if (!menu.climb || !menu.classic || !menu.climbVisible) { console.error('HUB MENU INCOMPLETE'); process.exitCode = 1; }
  await p.screenshot({ path: SP + 'slice-hub.png' });
  await b.close();
}
// case 2: two FF dives of the same level differ (the salt), worlds change by level band
{
  const { b, p } = await boot('http://127.0.0.1:8777/satellites/slice-3d/?dev=1');
  const sig = await p.evaluate(() => {
    function digest() {
      const w = window._S3.world();
      if (!w || !w.slabs) return null;
      return w.slabs.slice(0, 12).map(s => Math.round(s.mesh ? s.mesh.position.y : (s.y || 0))).join(',');
    }
    window._S3.newFF(3); const a = digest();
    window._S3.newFF(3); const bb = digest();
    return { a, b: bb, differ: a !== bb };
  });
  console.log('ff salt:', JSON.stringify(sig));
  if (!sig || !sig.differ) { console.error('FF LAYOUT DID NOT RANDOMIZE'); process.exitCode = 1; }
  await b.close();
}
// case 3: world palette shifts at level 6 — shoot both for the eye
for (const lvl of [1, 6]) {
  const { b, p } = await boot('http://127.0.0.1:8777/satellites/slice-3d/?dev=1');
  await p.evaluate(l => { window._S3.newFF(l); }, lvl);
  await new Promise(r => setTimeout(r, 1500));
  await p.screenshot({ path: SP + 'slice-ff-lvl' + lvl + '.png' });
  await b.close();
}
console.log(process.exitCode ? 'FAILED' : 'ALL PASS');
