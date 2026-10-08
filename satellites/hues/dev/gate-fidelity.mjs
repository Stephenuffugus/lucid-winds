/* GATE (H1, D14): the two judged colors are shown exactly as the game computes them.
   No grain, vignette, brightness flash, frame glow or neighbour shadow may change a swatch's
   pixels while it is being judged. For a fixed pair, the rendered pixels of BOTH swatches are
   sampled (center, four 25% inset points, and a point 3px inside the edge that faces the other
   swatch) at round start, deep in the warning, and just after lock, with each of the eight CSS
   frames equipped, and compared with the swatch's own computed color. Tolerance: 2 levels.
   (Image frames overlay the swatch edges by design; that is D15 in packet H4, not this gate.)
   Run: node satellites/hues/dev/gate-fidelity.mjs [--plant=flash]      412x915, sRGB forced. */
import { launch, open, close, reporter, plantFromArgs, tap, waitFor, setPair, setTimeFrac, snap, sleep } from './harness.mjs';

plantFromArgs();
const R = reporter('gate-fidelity');
const browser = await launch();
const FRAMES = ['hairline', 'bevel', 'frost', 'brutalist', 'gold', 'neon', 'deco', 'prism'];
const T = { h: 330, s: 0.62, v: 0.48 }, Y = { h: 333, s: 0.60, v: 0.50 };   /* close enough for the precision bonus (and its glow) */
const W = '412x915';
const page = await open(browser, { w: 412, h: 915, seed: { hues_rules: '1', 'hm.diff': 'normal' } });

async function sample(frame, when) {
  const geo = await page.evaluate(() => { const g = (id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, css: getComputedStyle(e).backgroundColor }; }; return { target: g('targetSwatch'), yours: g('yoursSwatch') }; });
  const img = await snap(page);
  for (const name of ['target', 'yours']) {
    const s = geo[name], want = s.css.match(/\d+/g).slice(0, 3).map(Number);
    /* a dense interior grid (7 x 5, 12% to 88%) at 1 level: a 3.5% overlay grain moves only a level or two, so a
       sparse grid at 2 levels let it through on the pre-H1 build. Plus three points 3px inside the edge that faces
       the other swatch, at 2 levels (antialiasing), where a neighbour's glow or shadow would land. */
    const pts = [];
    for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) pts.push([s.x + s.w * (0.12 + 0.76 * i / 6), s.y + s.h * (0.12 + 0.76 * j / 4), 1]);
    for (const fy of [0.3, 0.5, 0.7]) pts.push([name === 'target' ? s.x + s.w - 3 : s.x + 3, s.y + s.h * fy, 2]);
    let worst = 0, at = null, got = null, over = 0;
    for (const [x, y, tol] of pts) { const p = img.px(x, y), d = Math.max(...p.map((v, i) => Math.abs(v - want[i]))); if (d > tol) over++; if (d > worst) { worst = d; at = [Math.round(x), Math.round(y)]; got = p; } }
    R.t(W + ' ' + frame + ', ' + when + ': the ' + name + ' swatch shows exactly its color', over === 0, over + ' of ' + pts.length + ' points off; worst ' + worst + ' at ' + at + ', got ' + got + ', want ' + want);
  }
}

for (const frame of FRAMES) {
  await page.evaluate((id) => { const o = (Store.g(K.owned) || 'hairline').split(',').filter(Boolean); if (o.indexOf(id) < 0) o.push(id); Store.s(K.owned, o.join(',')); Store.s(K.equip, id); applyEquippedBorder(); }, frame);
  await tap(page, '[data-mode="endless"]');
  await waitFor(page, () => document.getElementById('game').classList.contains('on') && (typeof G !== "undefined" && G) && !G.locked && G.idx === 1, 6000);
  await setPair(page, T, Y);
  await sample(frame, 'round start');
  await setTimeFrac(page, 0.12); await sleep(160);
  await sample(frame, 'deep in the warning');
  await tap(page, '#lockBtn'); await sleep(120);
  await sample(frame, 'just after lock');
  await waitFor(page, () => document.getElementById('breakdown').classList.contains('show'), 6000); await sleep(450);
  await sample(frame, 'under the review');
  await tap(page, '#bdNext'); await waitFor(page, () => (typeof G !== "undefined" && G) && !G.locked && G.idx === 2, 6000);
  await tap(page, '#gMenu'); await waitFor(page, () => document.getElementById('menu').classList.contains('on'), 6000); await sleep(300);
}
R.t('no page errors', page._errors.length === 0, page._errors.slice(0, 3).join(' | '));
await close(page);
await browser.close();
R.done();
