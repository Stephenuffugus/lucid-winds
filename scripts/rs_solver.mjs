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
/* a player cannot stand in dojo 7+ without having cleared world 1, which
   is the AIR DASH unlock — so the bot gets it too and uses it as a save */
await p.evaluateOnNewDocument(() => { try {
  localStorage.setItem('rabbitsamurai_save', JSON.stringify({ cleared: 6, up: { vine: 0, fling: 0, heart: 0, paws: 0 }, bank: 0, stars: {} }));
} catch (e) {} });
await p.goto('http://127.0.0.1:8777/satellites/rabbit-samurai/index.html?rstest=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction('!!window.RB_DEV');

const POLICIES = [
  { rel: 0.45, drop: false }, { rel: 0.45, drop: true },
  { rel: 0.22, drop: false }, { rel: 0.60, drop: false },
  /* lip variants: jump at the pit edge instead of a column early, and hop
     straight up when a hog closes in mid-wait. Needed at the calmer run
     speed for the late Peaks; the early-jump variants stay for the dojos
     tuned around them. */
  { rel: 0.45, drop: false, lip: true }, { rel: 0.22, drop: false, lip: true }
];
for (let li = 0; li < 24; li++) {
  let res = null, used = null;
  for (const pol of POLICIES) {
    res = await p.evaluate(async (li, pol) => {
    const D = window.RB_DEV;
    D.start(0); D.startLevel(li);
    const G = D.full();
    const T = 40;
    const solid = (c) => { const g = G.lvl.grid; return !!(g[22] && g[22][c]); };
    const gapAt = (c) => { let w = 0; while (!solid(c + w) && c + w < G.lvl.W) w++; return w; };
    let steps = 0, cleared = false, hurts = 0, lastLives = G.lives, ropeThrows = 0;
    let lastRelease = -999, lastNode = null, dashPulse = 0;
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
        /* jump when the FRONT FOOT is at the lip, not a whole column early —
           at the calmer run speed an early hop lands a 2 wide pit short */
        const atLip = aheadGap && (aheadGap.at * T - g.bx) < 26;
        const jumpCue = pol.lip ? atLip : !!aheadGap;
        if (g.onGround && hogAhead && pitNear && !aheadGap) {
          /* a hog patrolling a pit lip: stand and let it turn, as a thumb
             would. Lip variants also hop straight up if one closes in from
             either side (pure standing was a sitting duck on the return leg). */
          g.held.right = false;
          if (pol.lip) {
            const hogClose = g.lvl.hogs.some(h => !h.dead && Math.abs(h.x - g.bx) < 55 && Math.abs(h.y - g.by) < 50);
            if (hogClose) { g.vy = -770; g.onGround = false; }
          }
        } else if (g.onGround && (inHole || jumpCue || hogAhead)) {
          g.vy = -770; g.onGround = false;
        } else if (pol.drop && !g.onGround && solid(col) && lastNode && g.bx > lastNode.x + 20) {
          g.held.right = false;
        } else if (!g.onGround && g.vy > -400 &&
                   steps - lastRelease > ((lastNode && g.bx < lastNode.x + 20) ? 45 : 12)) {
          // airborne: throw the vine only over WIDE water (a fresh release gets
          // half a second of free flight so we do not re-catch the same anchor)
          /* over ANY gap the vine is the save — exactly what a thumb does;
             when nothing catches and we are falling, the AIR DASH is the
             second save, exactly like a player's thumb */
          if (!solid(col)) {
            const r = D.grapple(); if (r && r.attached) ropeThrows++;
            else if (g.vy > 120 && !g.dashed && dashPulse === 0) dashPulse = 2;
          }
        }
        g.held.jump = dashPulse === 2;
        if (dashPulse > 0) dashPulse--;
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
console.log(process.exitCode ? 'SOLVER FAILED' : 'ALL 24 DOJOS SOLVABLE');
