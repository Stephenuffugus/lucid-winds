import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');
const out = await p.evaluate(() => {
  const D = window.RB_DEV; D.start(0); D.startLevel(5);
  const G = D.full();
  const res = [];
  for (const spot of [[555, 751], [617, 809], [520, 700]]) {
    D.teleport(spot[0], spot[1]);
    const g = D.full();
    const near = g.lvl.porcs.map(a => ({ x: Math.round(a.x), y: Math.round(a.y),
      d: Math.round(Math.hypot(a.x - g.bx, a.y - g.by)), skip: a.y > g.by + 50 }))
      .sort((a, b) => a.d - b.d).slice(0, 3);
    const r = D.grapple();
    res.push({ spot, near, attach: r });
    D.release();
  }
  return res;
});
console.log(JSON.stringify(out, null, 1));
await b.close();
