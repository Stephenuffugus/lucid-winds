/* The thumb. Every press in here is a real PointerEvent at a point a thumb
   would land on, found with elementFromPoint.
   ⛔ nothing here calls a handler, and nothing proves a control works with
   el.click(). */
import { serve, open, reporter, waitFrames, sleep, centre, tapAt, drag, dragEnd } from './harness.mjs';

const s = await serve();
const { browser, page, errors } = await open(s.base);
const { fails, say } = reporter();

const V = await page.evaluate(() => ({ w: innerWidth, h: innerHeight }));

/* ---- a swipe down is a mist ---- */
const before = await page.evaluate(() => WARDIAN_TEST.surface());
await drag(page, V.w / 2, V.h * 0.30, V.w / 2, V.h * 0.30 + 120, 10);
await dragEnd(page, V.w / 2, V.h * 0.30 + 120);
await waitFrames(page, 2);
const after = await page.evaluate(() => ({ m: WARDIAN_TEST.surface(), parts: WARDIAN_TEST.parts() }));
const add = after.m - before;
say(add > 0.18 && add < 0.30, 'a 120 px swipe down mists the jar (surface up ' + add.toFixed(3) + ', MIST_ADD is 0.25)');
say(after.parts > 8, 'and droplets come off the swipe (' + after.parts + ')');

/* the cooldown is a real cooldown */
const m2 = await page.evaluate(() => WARDIAN_TEST.surface());
await drag(page, V.w / 2, V.h * 0.30, V.w / 2, V.h * 0.30 + 120, 10);
await dragEnd(page, V.w / 2, V.h * 0.30 + 120);
await waitFrames(page, 2);
const m3 = await page.evaluate(() => WARDIAN_TEST.surface());
say(Math.abs(m3 - m2) < 0.02, 'a second swipe inside the cooldown does nothing (' + (m3 - m2).toFixed(3) + ')');

/* a short drag is not a swipe */
const m4 = await page.evaluate(() => { WARDIAN_TEST.clearCooldown(); return WARDIAN_TEST.surface(); });
await drag(page, V.w / 2, V.h * 0.30, V.w / 2, V.h * 0.30 + 40, 6);
await dragEnd(page, V.w / 2, V.h * 0.30 + 40);
await waitFrames(page, 2);
const m5 = await page.evaluate(() => WARDIAN_TEST.surface());
say(Math.abs(m5 - m4) < 0.02, 'and a 40 px drag is not a swipe (' + (m5 - m4).toFixed(3) + ')');

/* ---- a tap over a pillbug rolls it ---- */
const bug = await page.evaluate(() => {
  const i = WARDIAN_TEST.place('pillbug', 12);
  const a = WARDIAN_TEST.state().agents[i];
  return { i, screen: WARDIAN_TEST.toScreen(a.x * 10, WARDIAN_TEST.soilY(a.x * 10) - a.y * 8) };
});
const hitEl = await tapAt(page, Math.round(bug.screen.x), Math.round(bug.screen.y));
say(hitEl === 'jar', 'the tap landed on the glass and not on a button (' + hitEl + ')');
await waitFrames(page, 2);
const rolled = await page.evaluate((i) => WARDIAN_TEST.state().agents[i].rolled, bug.i);
say(rolled > 2400 && rolled <= 3000, 'a tap over a pillbug rolls it up for about three seconds (' + rolled + ' ms)');
await sleep(900);
await waitFrames(page, 2);
const rolled2 = await page.evaluate((i) => WARDIAN_TEST.state().agents[i].rolled, bug.i);
say(rolled2 < rolled - 300, 'and it counts down in real time (' + rolled2 + ' ms)');

/* a tap far away leaves it alone */
await page.evaluate((i) => { WARDIAN_TEST.state().agents[i].rolled = 0; }, bug.i);
await tapAt(page, Math.round(V.w * 0.10), Math.round(V.h * 0.28));
await waitFrames(page, 2);
const rolled3 = await page.evaluate((i) => WARDIAN_TEST.state().agents[i].rolled, bug.i);
say(rolled3 === 0, 'a tap on the far side of the jar does not (' + rolled3 + ')');

/* ---- a long press opens edit mode, and a drag moves a stone ---- */
say(await page.evaluate(() => WARDIAN_TEST.edit()) === false, 'the jar does not start in edit mode');
const stone = await page.evaluate(() => {
  const p = WARDIAN_TEST.state().props[0];
  return { x0: p.x, screen: WARDIAN_TEST.toScreen(p.x, WARDIAN_TEST.soilY(p.x) + p.sink) };
});
await drag(page, Math.round(stone.screen.x), Math.round(stone.screen.y),
  Math.round(stone.screen.x), Math.round(stone.screen.y), 2, 620);
say(await page.evaluate(() => WARDIAN_TEST.edit()) === true, 'a 620 ms press opens edit mode');
const done = await centre(page, '#btnEditDone');
say(!!done && done.h >= 48 && done.onTop, 'and the done button is a 48 px target on top (' + (done ? done.h.toFixed(0) : 'missing') + ' px)');
await drag(page, Math.round(stone.screen.x), Math.round(stone.screen.y),
  Math.round(stone.screen.x) + 46, Math.round(stone.screen.y), 8);
await dragEnd(page, Math.round(stone.screen.x) + 46, Math.round(stone.screen.y));
await waitFrames(page, 2);
const moved = await page.evaluate(() => WARDIAN_TEST.state().props[0].x);
const wantWU = await page.evaluate(() => 46 / WARDIAN_TEST.view().k);
say(Math.abs((moved - stone.x0) - wantWU) < 3,
  'and a 46 px drag moves the stone by the drag distance (' + (moved - stone.x0).toFixed(1)
  + ' world units, the drag was ' + wantWU.toFixed(1) + ')');
say(await page.evaluate(() => WARDIAN_TEST.state().plants[0].x) === 7,
  'and dragging in edit mode never moves a plant');

/* ---- the loop stops when the tab hides ---- */
await page.evaluate(() => {
  window.__raf = 0;
  const real = window.requestAnimationFrame;
  window.requestAnimationFrame = function (fn) { window.__raf++; return real(fn); };
});
await waitFrames(page, 3);
const spun = await page.evaluate(() => window.__raf);
say(spun > 1, 'the loop is asking for frames while the tab is visible (' + spun + ')');
await page.evaluate(() => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));
  window.__raf = 0;
});
await sleep(1000);
const spunHidden = await page.evaluate(() => window.__raf);
say(spunHidden === 0, 'and it stops inside a second of the tab hiding (' + spunHidden + ' frames asked for)');
const saved = await page.evaluate(() => !!localStorage.getItem('lw_wardian_v1'));
say(saved, 'and the jar was written to the save on the way out');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));

await browser.close(); s.close();
if (fails.length) { console.log('\n' + fails.length + ' TOUCH FAILURE(S)'); process.exit(1); }
console.log('\nTOUCH OK');
