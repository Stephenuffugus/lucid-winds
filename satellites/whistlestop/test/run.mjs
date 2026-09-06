/* Running a railway with a thumb.
   ⛔ NOTHING IN HERE CALLS A HANDLER. The whistle is pressed, the lever is
   tapped on the rug where it is drawn, the train is tapped where it is drawn,
   and what changes is read off the sim.
   ⛔ A LEVER AND A TRAIN ARE DRAWN INTO A CANVAS, so the 48 px law cannot be
   measured with getBoundingClientRect. It is measured the only honest way
   there is: press the control a whole thumb radius off centre, in four
   directions, and the press still has to land on it.
   Watched to fail: by making flipLever a no op, by dropping the collision
   revert, by shrinking TAP_R to 8, and by making the whistle start nothing. */
import { serve, open, reporter, waitFrames, tap, tapAt, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const R = n => Math.round(n);

const { browser, page, errors } = await open(s.base, { width: 667, height: 375, deviceScaleFactor: 1 });
await waitFrames(page, 2);

/* ---- the first puzzle, reached by a thumb ---- */
await tap(page, '#btnPuzzles');
await waitFrames(page, 2);
await tap(page, '#puzzleList .card');
await waitFrames(page, 3);
say((await page.evaluate(() => WHISTLESTOP_TEST.screen())) === 'Play', 'the first puzzle opens');

const whistle = await centre(page, '#btnWhistle');
say(!!whistle && whistle.w >= 48 && whistle.h >= 48 && whistle.onTop,
  'the whistle is a 48 px target on top (' + (whistle ? whistle.w.toFixed(0) + 'x' + whistle.h.toFixed(0) : 'missing') + ')');

const before = await page.evaluate(() => WHISTLESTOP_TEST.trains()[0].speedIx);
await page.evaluate(() => WHISTLESTOP_TEST.clearEvents());
await tap(page, '#btnWhistle');
await waitFrames(page, 3);
const after = await page.evaluate(() => WHISTLESTOP_TEST.trains()[0].speedIx);
say(before === 0 && after > 0, 'a real press on the whistle starts the train (' + before + ' to ' + after + ')');
say((await page.evaluate(() => WHISTLESTOP_TEST.events())).indexOf('whistle') >= 0, 'and it hoots');

/* it really moves, and the wheels are heard */
const p0 = await page.evaluate(() => WHISTLESTOP_TEST.trainScreen(0));
await page.evaluate(() => WHISTLESTOP_TEST.advance(0.6));
await waitFrames(page, 2);
const p1 = await page.evaluate(() => WHISTLESTOP_TEST.trainScreen(0));
say(Math.hypot(p1.x - p0.x, p1.y - p0.y) > 20, 'and the train moves along the track ('
  + Math.hypot(p1.x - p0.x, p1.y - p0.y).toFixed(0) + ' px)');
say((await page.evaluate(() => WHISTLESTOP_TEST.events())).indexOf('clack') >= 0, 'and the wheels clack');

/* ---- a tap on the train changes its speed ---- */
/* ⛔ A MOVING TARGET HAS TO BE READ AND PRESSED IN THE SAME BREATH. The first
   version of this asked the page where the engine was, waited for the answer
   to come back over the wire, and then pressed there: under contention the
   train had gone, and the gate failed once in every two or three runs on
   perfectly good code. The press is still a real PointerEvent at a point
   elementFromPoint agrees a thumb would land on; it is only the gap that is
   closed. */
const tapMovingTrain = (i) => page.evaluate((i) => {
  const p = WHISTLESTOP_TEST.trainScreen(i);
  const el = document.elementFromPoint(p.x, p.y);
  if (!el) throw new Error('nothing under the train at ' + p.x + ',' + p.y);
  const o = { pointerId: 12, pointerType: 'touch', isPrimary: true, bubbles: true,
    cancelable: true, clientX: p.x, clientY: p.y };
  el.dispatchEvent(new PointerEvent('pointerdown', o));
  el.dispatchEvent(new PointerEvent('pointerup', o));
  return el.id || el.tagName;
}, i);
/* ⛔ and on a plain ring with NO SWITCH on it. The first version did this on
   the first puzzle, where the engine reaches the switch in under a second, so
   the press that was meant for the train landed on the lever beside it and the
   gate went red on correct code once in every two runs. */
await page.evaluate(() => {
  WHISTLESTOP_TEST.sandbox(0);
  WHISTLESTOP_TEST.buildOps([['at', 3.4, 2.6, 0], ['rep', 2, 'straight'], ['rep', 4, 'curveR'],
    ['rep', 2, 'straight'], ['rep', 4, 'curveR']]);
  const S = WHISTLESTOP_TEST.state();
  WHISTLESTOP_TEST.addTrain('green', S.g.edges[0].id, 10, 2);
});
await waitFrames(page, 2);
await tap(page, '#btnWhistle');
await waitFrames(page, 2);
const sBefore = await page.evaluate(() => WHISTLESTOP_TEST.trains()[0].speedIx);
const landedOn = await tapMovingTrain(0);
say(landedOn === 'board', 'the press on the train lands on the rug itself (' + landedOn + ')');
await waitFrames(page, 2);
const sAfter = await page.evaluate(() => WHISTLESTOP_TEST.trains()[0].speedIx);
say(sAfter !== sBefore, 'a tap on the train changes its speed (' + sBefore + ' to ' + sAfter + ')');
/* and the ambiguity that caused all this, asserted rather than avoided */
const both = await page.evaluate(() => {
  WHISTLESTOP_TEST.puzzle(0);
  const j = WHISTLESTOP_TEST.junctions()[0];
  const S = WHISTLESTOP_TEST.state();
  const nd = S.g.nodes[j.node];
  /* put the engine exactly on the switch */
  const jn = S.g.junctions[j.node];
  const tr = S.trains[0];
  const wasLever = jn.lever;
  const target = WHISTLESTOP_TEST.toScreen(nd.x, nd.y);
  /* walk it there */
  for (let i = 0; i < 600; i++) {
    tr.speedIx = 2;
    WHISTLESTOP_TEST.advance(1 / 60);
    const b = WHISTLESTOP_TEST.trainScreen(0);
    if (Math.hypot(b.x - target.x, b.y - target.y) < 10) break;
  }
  const p = WHISTLESTOP_TEST.trainScreen(0);
  const speedWas = tr.speedIx;
  const el = document.elementFromPoint(p.x, p.y);
  const o = { pointerId: 13, pointerType: 'touch', isPrimary: true, bubbles: true,
    cancelable: true, clientX: p.x, clientY: p.y };
  el.dispatchEvent(new PointerEvent('pointerdown', o));
  el.dispatchEvent(new PointerEvent('pointerup', o));
  return { speedWas, speedNow: tr.speedIx, leverWas: wasLever, leverNow: jn.lever,
    onSwitch: Math.hypot(p.x - target.x, p.y - target.y) };
});
say(both.onSwitch < 30, 'a train can be stood right on a switch (' + both.onSwitch.toFixed(0) + ' px from it)');
say(both.speedNow !== both.speedWas && both.leverNow === both.leverWas,
  'and a press there is the TRAIN, not the lever beside it (speed ' + both.speedWas + ' to '
  + both.speedNow + ', lever ' + both.leverWas + ' to ' + both.leverNow + ')');

/* ---- the 48 px law on a control that is painted, not laid out ---- */
await page.evaluate(() => WHISTLESTOP_TEST.puzzle(0));
await waitFrames(page, 3);
const js = await page.evaluate(() => WHISTLESTOP_TEST.junctions());
say(js.length === 1, 'the first puzzle has one switch on it (' + js.length + ')');
const lev = js[0];
let reach = 0;
for (const [dx, dy] of [[0, 0], [-23, 0], [23, 0], [0, -23], [0, 23]]) {
  /* ⛔ RE READ IT EVERY TIME. A lever lies along the road it has chosen, so
     throwing it MOVES it; the first draft measured all five presses against
     where the lever was before the first one and reported the target as too
     small. */
  const now0 = (await page.evaluate(() => WHISTLESTOP_TEST.junctions()))[0];
  const was = await page.evaluate(n => WHISTLESTOP_TEST.leverAt(n), lev.node);
  await tapAt(page, R(now0.screen.x + dx), R(now0.screen.y + dy));
  await waitFrames(page, 2);
  const now = await page.evaluate(n => WHISTLESTOP_TEST.leverAt(n), lev.node);
  if (now !== was) reach++;
}
say(reach === 5, 'the switch answers a thumb landing anywhere inside 46 px of its middle ('
  + reach + ' of 5 presses took)');

/* ---- and the train really goes the other way ---- */
async function runFromLever(setTo) {
  await page.evaluate(() => WHISTLESTOP_TEST.puzzle(0));
  await waitFrames(page, 2);
  const j = (await page.evaluate(() => WHISTLESTOP_TEST.junctions()))[0];
  if ((await page.evaluate(n => WHISTLESTOP_TEST.leverAt(n), j.node)) !== setTo) {
    await tapAt(page, R(j.screen.x), R(j.screen.y));
    await waitFrames(page, 2);
  }
  await tap(page, '#btnWhistle');
  await page.evaluate(() => WHISTLESTOP_TEST.advance(4));
  await waitFrames(page, 2);
  return page.evaluate(() => ({ where: WHISTLESTOP_TEST.trainScreen(0),
    path: WHISTLESTOP_TEST.edgePath(0), home: WHISTLESTOP_TEST.trains()[0].arrived }));
}
const straight = await runFromLever(0);
const branch = await runFromLever(1);
say(straight.path.join(',') !== branch.path.join(','),
  'a flipped switch really sends the train down a different road');
say(Math.hypot(straight.where.x - branch.where.x, straight.where.y - branch.where.y) > 40,
  'and four seconds later the two trains are nowhere near each other ('
  + Math.hypot(straight.where.x - branch.where.x, straight.where.y - branch.where.y).toFixed(0) + ' px apart)');
say(branch.home && !straight.home, 'and only one of the two roads is the one Red lives on');

/* ---- two trains nose to nose, on a rug a thumb built ---- */
await page.evaluate(() => {
  WHISTLESTOP_TEST.sandbox(0);
  WHISTLESTOP_TEST.buildOps([['at', 2, 4.5, 0], ['rep', 10, 'straight']]);
});
await waitFrames(page, 2);
await page.evaluate(() => {
  const S = WHISTLESTOP_TEST.state();
  WHISTLESTOP_TEST.addTrain('red', S.g.pieces[1].edges[0], 0, 2);
  const b = WHISTLESTOP_TEST.addTrain('blue', S.g.pieces[8].edges[0], 32, 2);
  S.trains[b].dir = -1;
  WHISTLESTOP_TEST.clearEvents();
});
await tap(page, '#btnWhistle');
await page.evaluate(() => WHISTLESTOP_TEST.advance(7));
await waitFrames(page, 2);
const crash = await page.evaluate(() => ({
  collided: WHISTLESTOP_TEST.state().collided,
  speeds: WHISTLESTOP_TEST.trains().map(t => t.speedIx),
  heard: WHISTLESTOP_TEST.events(),
  xs: WHISTLESTOP_TEST.trains().map((t, i) => WHISTLESTOP_TEST.trainScreen(i).x)
}));
say(crash.collided, 'two trains sent at each other stop');
say(crash.speeds.every(v => v === 0), 'and both of them are standing still (' + crash.speeds.join(',') + ')');
say(crash.heard.indexOf('clonk') >= 0, 'and there is a clonk');
say(crash.heard.indexOf('huff') >= 0, 'and a huff of steam');
say(crash.xs[0] < crash.xs[1], 'and neither has passed the other');

/* a tap on a stopped train backs it off, which is how a child unjams a toy */
const dirWas = await page.evaluate(() => WHISTLESTOP_TEST.trains()[0].dir);
const tp2 = await page.evaluate(() => WHISTLESTOP_TEST.trainScreen(0));
await tapAt(page, R(tp2.x), R(tp2.y));
await waitFrames(page, 2);
const backing = await page.evaluate(() => ({ dir: WHISTLESTOP_TEST.trains()[0].dir,
  speed: WHISTLESTOP_TEST.trains()[0].speedIx }));
say(backing.dir === -dirWas && backing.speed > 0,
  'a tap on a stopped train sends it back the way it came (' + dirWas + ' to ' + backing.dir + ')');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
if (fails.length) { console.log('\n' + fails.length + ' RUN FAILURE(S)'); process.exit(1); }
console.log('\nRUN OK');
