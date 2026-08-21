import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');
for (const li of [0, 2, 3]) {
  const out = await p.evaluate((li) => {
    const D = window.RB_DEV; D.start(0); if (li) D.startLevel(li);
    const G = D.full(), T = 40;
    const solid = c => !!(G.lvl.grid[22] && G.lvl.grid[22][c]);
    const gapAt = c => { let w = 0; while (!solid(c + w) && c + w < G.lvl.W) w++; return w; };
    let lastLives = G.lives, hurtsAt = [], lastRelease = -999, throwsOk = 0, stuckHist = {};
    for (let s = 0; s < 60 * 100; s++) {
      const g = D.full();
      if (g.phase !== 'play') break;
      if (g.lives < lastLives) hurtsAt.push(Math.round(g.bx));
      lastLives = g.lives;
      const col = Math.floor(g.bx / T);
      stuckHist[col] = (stuckHist[col] || 0) + 1;
      if (g.rope.attached) {
        g.held.left = false; g.held.right = true; g.held.jump = false; g.held.rope = true;
        const n = g.rope.node;
        if (g.bx > n.x + 30 && g.vx > 120) { D.release(); lastRelease = s; }
      } else {
        g.held.rope = false; g.held.right = true; g.held.left = false; g.held.jump = false;
        const aheadGap = (() => { for (let d = 0; d <= 2; d++) { const c = col + 1 + d; if (!solid(c)) return { at: c, w: gapAt(c) }; } return null; })();
        const inHole = g.onGround && g.by > 900;
        const hogAhead = g.lvl.hogs.some(h => !h.dead && h.x > g.bx && h.x - g.bx < 100 && Math.abs(h.y - g.by) < 50);
        if (g.onGround && (inHole || aheadGap || hogAhead)) { g.vy = -770; g.onGround = false; }
        else if (!g.onGround && g.vy > -400 && s - lastRelease > 30) {
          const overGap = !solid(col) || (aheadGap && aheadGap.w >= 3);
          if (overGap) { const r = D.grapple(); if (r && r.attached) throwsOk++; }
        }
      }
      D.step(1 / 60);
    }
    const g2 = D.full();
    // most-visited column = where it loops
    let topCol = null, topN = 0;
    for (const c in stuckHist) if (stuckHist[c] > topN) { topN = stuckHist[c]; topCol = +c; }
    const near = {
      solidHere: solid(topCol), gapW: solid(topCol) ? 0 : gapAt(topCol),
      hogs: g2.lvl.hogs.filter(h => Math.abs(h.x / 40 - topCol) < 6).map(h => ({ x: Math.round(h.x), dead: h.dead, min: Math.round(h.min), max: Math.round(h.max) })),
      spikes: g2.lvl.spikes.filter(sp => Math.abs(sp.x / 40 - topCol) < 4).length,
      anchors: g2.lvl.porcs.filter(a => Math.abs(a.x / 40 - topCol) < 7).map(a => ({ x: Math.round(a.x), y: Math.round(a.y) }))
    };
    return { li, phase: g2.phase, cleared: g2.levelsCleared, x: Math.round(g2.bx), y: Math.round(g2.by),
      topCol, topN, near, hurtsAt: hurtsAt.slice(0, 10), throwsOk };
  }, li);
  console.log(JSON.stringify(out));
}
await b.close();
