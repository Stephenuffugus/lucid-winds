import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');
const bad = await p.evaluate(() => {
  const D = window.RB_DEV, T = 40; let out = [];
  for (let li = 0; li < 24; li++) {
    D.start(0); D.startLevel(li);
    const g = D.full(), grid = g.lvl.grid;
    let n = 0;
    for (const ca of g.lvl.carrots) {
      const c = Math.floor(ca.x / T), r = Math.floor(ca.y / T);
      if (grid[r] && grid[r][c]) n++;
    }
    if (n) out.push({ li, boxed: n });
  }
  return out;
});
console.log(bad.length ? 'BOXED CARROTS: ' + JSON.stringify(bad) : 'ZERO boxed carrots across all 24 dojos');
process.exit(bad.length ? 1 : 0);
