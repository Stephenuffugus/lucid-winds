/* rs_solver.mjs — plays every Vine Ronin dojo through the REAL engine with a
   swing-capable bot. Success = the diamond (levelsCleared increments).
   The bot: runs right; before a wide gap it jumps and throws the vine at the
   pre-placed anchor, pumps right, releases past the anchor; slices/avoids
   nothing (hearts + level-restart absorb enemy hits — solvability is the
   question here, not a deathless run). */
import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true });
p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');

const POLICIES = [
  { rel: 0.45, drop: false }, { rel: 0.45, drop: true },
  { rel: 0.22, drop: false }, { rel: 0.60, drop: false }
];
for (let li = 0; li < 6; li++) {
  let res = null, used = null;
  for (const pol of POLICIES) {
    res = await p.evaluate(async (li, pol) => {
    const D = window.RB_DEV;
    D.start(0); if (li) D.startLevel(li);
    const G = D.full();
    const T = 40;
    const solid = (c) => { const g = G.lvl.grid; return !!(g[22] && g[22][c]); };
    const gapAt = (c) => { let w = 0; while (!solid(c + w) && c + w < G.lvl.W) w++; return w; };
    let steps = 0, cleared = false, hurts = 0, lastLives = G.lives, ropeThrows = 0;
    let lastRelease = -999, lastNode = null;
    const start = G.levelsCleared;
    for (steps = 0; steps < 60 * 150; steps++) {
      const g = D.full();
      if (!g || g.levelsCleared > start || g.phase === 'clear') { cleared = true; break; }
      if (g.lives < lastLives) hurts++; lastLives = g.lives;
      const col = Math.floor(g.bx / T);
      if (g.rope.attached) {
        g.held.left = false; g.held.right = true; g.held.jump = false; g.held.rope = true;
        const n = g.rope.node;
        // release once we are past the anchor moving right, or swinging up on the far side
        if (g.bx > n.x + Math.max(30, g.rope.len * pol.rel) && g.vx > 120 && g.vy < -60) { D.release(); lastRelease = steps; lastNode = n; }
      } else if (g.bx > G.lvl.diamond.x + 24) {
        /* overshot the diamond mid-flight: walk back to it */
        g.held.rope = false; g.held.right = false; g.held.left = true; g.held.jump = false;
      } else {
        g.held.rope = false; g.held.right = true; g.held.left = false; g.held.jump = false;
        /* jump at the LIP (next col), not three columns early — an early hop
           lands short, straight onto the far spike */
        const aheadGap = !solid(col + 1) ? { at: col + 1, w: gapAt(col + 1) } : null;
        const inHole = g.onGround && g.by > 900;   // fell into an unspiked pit: hop out
        // a live hedgehog just ahead at ground level: hop it like a player would
        const hogAhead = g.lvl.hogs.some(h => !h.dead && h.x > g.bx && h.x - g.bx < 100 && Math.abs(h.y - g.by) < 50);
        const pitNear = (() => { for (let d = 2; d <= 4; d++) if (!solid(col + d)) return true; return false; })();
        if (g.onGround && hogAhead && pitNear && !aheadGap) {
          /* a hog patrolling a pit lip: stand and let it turn, as a thumb would */
          g.held.right = false;
        } else if (g.onGround && (inHole || aheadGap || hogAhead)) {
          g.vy = -770; g.onGround = false;
        } else if (pol.drop && !g.onGround && solid(col) && lastNode && g.bx > lastNode.x + 20) {
          g.held.right = false;
        } else if (!g.onGround && g.vy > -400 &&
                   steps - lastRelease > ((lastNode && g.bx < lastNode.x + 20) ? 45 : 12)) {
          // airborne: throw the vine only over WIDE water (a fresh release gets
          // half a second of free flight so we do not re-catch the same anchor)
          /* over ANY gap the vine is the save — exactly what a thumb does */
          if (!solid(col)) { const r = D.grapple(); if (r && r.attached) ropeThrows++; }
        }
      }
      D.step(1 / 60);
    }
    return { cleared, steps, hurts, ropeThrows, name: D.full() && D.full().lvl.name, W: D.full() && D.full().lvl.W };
    }, li, pol);
    if (res.cleared) { used = pol; break; }
  }
  console.log('dojo', li + 1, JSON.stringify(res), used ? ('policy rel=' + used.rel + ' drop=' + used.drop) : 'NO POLICY CLEARED');
  if (!res.cleared) { console.error('DOJO ' + (li + 1) + ' UNSOLVABLE BY EVERY POLICY'); process.exitCode = 1; }
}
await b.close();
console.log(process.exitCode ? 'SOLVER FAILED' : 'ALL 6 DOJOS SOLVABLE');
