/* Digging with a thumb.
   ⛔ NOTHING IN HERE CALLS A HANDLER. Every stroke is a run of real
   PointerEvents on the canvas, at points elementFromPoint agrees a thumb would
   land on, and what changes is read off the sediment grid afterwards.
   ⛔ The one thing the gate does NOT do with a thumb is the twenty passes of
   patient brushing it takes to free a whole bone; that is the test hook
   `clean`, which calls the game's own stroke function, and it is named here so
   nobody mistakes it for the thumb's path. Every claim about a TOOL and every
   claim about the TRACE is made with real pointers.
   Watched to fail: by making the brush rate nought, by filling the pressure
   meter with distance rather than time, by letting any stroke lift a bone, and
   by removing the crack the pick does. */
import { serve, open, reporter, waitFrames, sleep, tap, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const R = n => Math.round(n);

const { browser, page, errors } = await open(s.base, { width: 375, height: 667, deviceScaleFactor: 1 });
await waitFrames(page, 2);

/* a real thumb from the title into a cliff */
const dig = await centre(page, '#btnDig');
say(!!dig && dig.h >= 56 && dig.onTop, 'DIG is a reachable target on the title');
await tap(page, '#btnDig');
await waitFrames(page, 3);
say((await page.evaluate(() => STRATA_TEST.screen())) === 'Dig', 'one press opens a cliff');

/* a run of real pointer events along a line of screen points */
const sweep = (pts, dwell) => page.evaluate(async (pts, dwell) => {
  const cv = document.getElementById('board');
  const r = cv.getBoundingClientRect();
  const at = (x, y) => ({ pointerId: 5, pointerType: 'touch', isPrimary: true, bubbles: true,
    cancelable: true, clientX: r.left + x, clientY: r.top + y });
  const first = document.elementFromPoint(r.left + pts[0].x, r.top + pts[0].y);
  if (!first || first.id !== 'board') throw new Error('the stroke would not start on the cliff: '
    + (first ? first.id || first.tagName : 'nothing'));
  cv.dispatchEvent(new PointerEvent('pointerdown', at(pts[0].x, pts[0].y)));
  for (let i = 1; i < pts.length; i++) {
    cv.dispatchEvent(new PointerEvent('pointermove', at(pts[i].x, pts[i].y)));
    if (dwell) await new Promise(res => setTimeout(res, dwell));
  }
  cv.dispatchEvent(new PointerEvent('pointerup', at(pts[pts.length - 1].x, pts[pts.length - 1].y)));
}, pts, dwell || 0);
const line = (a, b, n) => {
  const out = [];
  for (let i = 0; i <= n; i++) out.push({ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n });
  return out;
};

/* ---- a real 120 px brush stroke lowers the density along its path ---- */
const start = await page.evaluate(() => {
  const v = STRATA_TEST.view();
  const a = { x: v.w * 0.18, y: v.h * 0.62 };
  return { a: a, b: { x: a.x + 120, y: a.y }, mid: { x: a.x + 60, y: a.y } };
});
const before = await page.evaluate((p) => STRATA_TEST.densityAt(STRATA_TEST.toGrid(p.x, p.y).x,
  STRATA_TEST.toGrid(p.x, p.y).y), start.mid);
await page.evaluate(() => STRATA_TEST.clearEvents());
await sweep(line(start.a, start.b, 16));
await waitFrames(page, 2);
const after = await page.evaluate((p) => STRATA_TEST.densityAt(STRATA_TEST.toGrid(p.x, p.y).x,
  STRATA_TEST.toGrid(p.x, p.y).y), start.mid);
say(before - after >= 0.13, 'a real hundred and twenty pixel brush stroke takes the rock down ('
  + before.toFixed(3) + ' to ' + after.toFixed(3) + ', the rate is 0.15)');
say((await page.evaluate(() => STRATA_TEST.dust())) > 0, 'and it pours dust ('
  + (await page.evaluate(() => STRATA_TEST.dust())) + ' grains)');
say((await page.evaluate(() => STRATA_TEST.events())).indexOf('shhh') >= 0, 'and it is heard');

/* ---- the chisel: a rest on a bone cracks it, and shivers first ---- */
/* ⛔ a bone A THUMB CAN REACH, not merely the biggest one. The first run of
   this gate aimed forty pixels to the left of a bone that was already at the
   edge of the cliff and the stroke would have begun on nothing at all; the
   guard inside `sweep` is what said so. */
const bn = await page.evaluate(() => STRATA_TEST.reachableBone());
say(!!bn && bn.cells > 30, 'there is a bone a thumb can reach without panning ('
  + (bn ? bn.kind + ', ' + bn.cells + ' cells' : 'NONE ON SCREEN') + ')');
const onBone = await page.evaluate((id) => {
  const b = STRATA_TEST.boneById(id);
  const m = b.spine[Math.floor(b.spine.length / 2)];
  return STRATA_TEST.toScreen(m.x, m.y);
}, bn.id);
await page.evaluate(() => { STRATA_TEST.tool('chisel'); STRATA_TEST.clearEvents(); });
const chisel = await centre(page, '#tChisel');
say(!!chisel && chisel.w >= 48 && chisel.h >= 48 && chisel.onTop, 'the chisel is a 48 px target on top');
/* first uncover it a little with the chisel, moving, which must be safe */
await sweep(line({ x: onBone.x - 40, y: onBone.y }, { x: onBone.x + 40, y: onBone.y }, 12));
await waitFrames(page, 2);
say(!(await page.evaluate((id) => STRATA_TEST.boneById(id).cracked, bn.id)),
  'a quick chisel stroke across a bone leaves it whole');
/* then rest on it, which must not */
let cracked = false, warned = false, tries = 0;
while (!cracked && tries < 8) {
  await sweep([{ x: onBone.x, y: onBone.y }, { x: onBone.x + 1, y: onBone.y },
    { x: onBone.x, y: onBone.y }, { x: onBone.x + 1, y: onBone.y }], 220);
  const st = await page.evaluate((id) => ({ cracked: STRATA_TEST.boneById(id).cracked,
    heard: STRATA_TEST.events() }), bn.id);
  cracked = st.cracked;
  if (st.heard.indexOf('warn') >= 0) warned = true;
  tries++;
}
say(cracked, 'resting the chisel on a bone cracks it (' + tries + ' rests)');
say(warned, 'and it shivers a warning before it does');
say((await page.evaluate(() => STRATA_TEST.events())).indexOf('crack') >= 0, 'and the crack is heard');
say(await page.evaluate((id) => {
  const bs = STRATA_TEST.bones(0);
  let others = 0;
  for (const b of bs) if (b.cracked && b.id !== id) others++;
  return others === 0;
}, bn.id), 'and nothing else on the animal is cracked');

/* ---- the pick cracks the moment it touches one ---- */
await page.evaluate(() => STRATA_TEST.site(777, 0));
await waitFrames(page, 2);
const bn2 = await page.evaluate(() => STRATA_TEST.reachableBone());
say(!!bn2, 'and the next site has one too');
const on2 = await page.evaluate((id) => {
  const b = STRATA_TEST.boneById(id);
  const m = b.spine[Math.floor(b.spine.length / 2)];
  return STRATA_TEST.toScreen(m.x, m.y);
}, bn2.id);
await page.evaluate(() => STRATA_TEST.tool('pick'));
await sweep(line({ x: on2.x - 12, y: on2.y }, { x: on2.x + 12, y: on2.y }, 6));
await waitFrames(page, 2);
say(await page.evaluate((id) => STRATA_TEST.boneById(id).cracked, bn2.id),
  'a pick stroke over a bone cracks it at once, with no warning at all');

/* ---- the trace ---- */
await page.evaluate(() => STRATA_TEST.site(4242, 0));
await waitFrames(page, 2);
const bn3 = await page.evaluate(() => STRATA_TEST.reachableBone());
say(!!bn3, 'and so does the one after that');
const clear = await page.evaluate((id) => STRATA_TEST.clean(id, 16), bn3.id);
say(clear >= 0.85, 'a patient brush frees a bone (' + (clear * 100).toFixed(0) + ' percent clear)');
await page.evaluate(() => STRATA_TEST.tool('brush'));
const path = await page.evaluate((id) => {
  const b = STRATA_TEST.boneById(id);
  const out = [];
  for (const p of b.spine) out.push(STRATA_TEST.toScreen(p.x, p.y));
  return out;
}, bn3.id);
/* a trace well off the bone is refused */
const offBy = await page.evaluate(() => STRATA_TEST.view().zoom * 30);
await sweep(line({ x: path[0].x, y: path[0].y + offBy },
  { x: path[path.length - 1].x, y: path[path.length - 1].y + offBy }, 14));
await waitFrames(page, 2);
say(!(await page.evaluate((id) => STRATA_TEST.boneById(id).out, bn3.id)),
  'a real trace a long way off the bone leaves it in the ground');
/* ⛔ and a stroke that RUNS ALONG the bone but starts out in the rock is
   digging, not lifting: without that rule a player cleaning around a rib keeps
   accidentally pulling it out of the ground, and the plaster jacket gesture the
   design asks for is not a gesture at all. */
/* ⛔ offset TOWARDS the middle of the cliff, not away: minus forty and minus
   forty put the start of the stroke off the screen and the guard in `sweep`
   said so, for the second time in this file. */
const centreOf = await page.evaluate(() => { const v = STRATA_TEST.view(); return { x: (v.w - 76) / 2, y: v.h / 2 }; });
const towards = (p, k) => ({ x: p.x + (centreOf.x - p.x) * k, y: p.y + (centreOf.y - p.y) * k });
const fromRock = [towards(path[0], 0.45)];
for (let i = 0; i + 1 < path.length; i++) fromRock.push(...line(path[i], path[i + 1], 8));
await sweep(fromRock);
await waitFrames(page, 2);
say(!(await page.evaluate((id) => STRATA_TEST.boneById(id).out, bn3.id)),
  'a stroke that runs along a freed bone but starts out in the rock is digging, not lifting');

/* and one along it lifts it */
const dense = [];
for (let i = 0; i + 1 < path.length; i++) dense.push(...line(path[i], path[i + 1], 8));
await page.evaluate(() => STRATA_TEST.clearEvents());
await sweep(dense);
await waitFrames(page, 2);
const lifted = await page.evaluate((id) => ({ out: STRATA_TEST.boneById(id).out,
  n: STRATA_TEST.lifted(), heard: STRATA_TEST.events() }), bn3.id);
say(lifted.out, 'a real trace along it lifts it out of the rock');
say(lifted.n >= 1, 'and the site knows one is out (' + lifted.n + ')');
say(lifted.heard.indexOf('jacket') >= 0, 'and the jacket is heard going round it');

/* ---- the scan, once per site ---- */
const scan = await centre(page, '#tScan');
say(!!scan && scan.w >= 48 && scan.onTop, 'SCAN is a 48 px target on top');
await tap(page, '#tScan');
await waitFrames(page, 2);
say((await page.evaluate(() => STRATA_TEST.events())).indexOf('scan') >= 0, 'and it shimmers once');
say(await page.evaluate(() => document.getElementById('tScan').disabled),
  'and then it is spent for this site');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
if (fails.length) { console.log('\n' + fails.length + ' DIG FAILURE(S)'); process.exit(1); }
console.log('\nDIG OK');
