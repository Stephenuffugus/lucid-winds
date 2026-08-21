import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');
const out = await p.evaluate(() => {
  const D = window.RB_DEV; D.start(0); D.startLevel(2);
  const G = D.full(), T = 40;
  const solid = c => !!(G.lvl.grid[22] && G.lvl.grid[22][c]);
  let row = ''; for (let c = 0; c < G.lvl.W; c++) row += solid(c) ? '#' : '.';
  const spikes = G.lvl.spikes.map(s => Math.round(s.x / T));
  const hogs0 = G.lvl.hogs.map(h => ({ c: Math.round(h.x / T), min: Math.round(h.min / T), max: Math.round(h.max / T) }));
  const crows0 = G.lvl.crows.map(c2 => ({ c: Math.round(c2.x0 / T), y: Math.round(c2.y0) }));
  const anchors = G.lvl.porcs.map(a => ({ c: Math.round(a.x / T), y: Math.round(a.y) }));
  let lastLives = G.lives, deaths = [], traj = [];
  let lastRelease = -999;
  for (let s = 0; s < 60 * 30; s++) {
    const g = D.full();
    const pre = { x: Math.round(g.bx), y: Math.round(g.by), l: g.lives };
    const col = Math.floor(g.bx / T);
    if (g.rope.attached) {
      g.held.right = true; g.held.left = false; g.held.jump = false; g.held.rope = true;
      const n = g.rope.node;
      if (g.bx > n.x + Math.max(30, g.rope.len * 0.45) && g.vx > 120 && g.vy < -60) { D.release(); lastRelease = s; }
    } else if (g.bx > G.lvl.diamond.x + 24) {
      g.held.rope = false; g.held.right = false; g.held.left = true; g.held.jump = false;
    } else {
      g.held.rope = false; g.held.right = true; g.held.left = false; g.held.jump = false;
      const gapAt = c => { let w = 0; while (!solid(c + w) && c + w < G.lvl.W) w++; return w; };
      const aheadGap = !solid(col + 1) ? { at: col + 1, w: gapAt(col + 1) } : null;
      const inHole = g.onGround && g.by > 900;
      const hogAhead = g.lvl.hogs.some(h => !h.dead && h.x > g.bx && h.x - g.bx < 100 && Math.abs(h.y - g.by) < 50);
      const pitNear = (() => { for (let d = 2; d <= 4; d++) if (!solid(col + d)) return true; return false; })();
      if (g.onGround && hogAhead && pitNear && !aheadGap) { g.held.right = false; }
      else if (g.onGround && (inHole || aheadGap || hogAhead)) { g.vy = -770; g.onGround = false; }
      else if (!g.onGround && g.vy > -400 && s - lastRelease > 12) {
        if (!solid(col)) D.grapple();
      }
    }
    D.step(1 / 60);
    const g2 = D.full();
    if (g2.lives < pre.l || (g2.lives > pre.l)) deaths.push(pre); // any lives change: record where we WERE
    if (s < 720 && s % 8 === 0) traj.push(pre.x + ',' + pre.y);
  }
  return { row, spikes, hogs0, crows0, anchors, deaths: deaths.slice(0, 6), traj };
});
console.log(JSON.stringify(out, null, 1));
await b.close();
