#!/usr/bin/env node
/* HUSH's living clearing (plans/hush/HANDOFF-HUSH.md 3.10; the shape of GAUGE's and BRIM's test/specimens.mjs): one creature earned
 * per settle through CORE's collectOnce, twenty four places at most, each at its far tier in a seeded spot, the species in turn,
 * cosmetic, never a count shown.
 *
 *   node test/specimens.mjs          (in the foreground, under the gate lock)
 *
 * A settle takes eighteen right trials. Before each settle the gate moves where the approach stands (the kept steps, a
 * precondition, docs/DECISIONS.md) to one trial short in the record the page wrote itself, reloads, and earns the settle by play.
 * It never writes the collection it counts: every creature is earned by the page.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the clearing is shut through the trial before a settle and opens after the settle, holding one creature, the deer
 *   2. go closes it onto a live round; the next two settles add the hare and then the fox, each in a spot of its own
 *   3. a reload in the middle of an approach earns nothing: the settle after it holds four
 *   4. the clearing shows no digit and no number in any label
 *   5. without less motion the clearing breathes (its idle frame turns within three seconds); with less motion it holds still
 *   6. twenty six settles hold twenty four creatures, every place in its own spot, the species deer, hare and fox in turn
 */
import { join } from 'node:path';
import { serve, open, reporter, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealRun, adaptAxes, SETTLE } from '../engine.js';
import { SPECIES } from '../sprites.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.HUSH && window.HUSH.ready';
const SEED = 4242;
const LINK = '/hush/index.html?seed=' + SEED + '&count=40&fork=careful&';
const livingNow = page => page.evaluate(() => ({ shown: window.HUSH.living.shown(), spots: window.HUSH.living.spots(), held: window.HUSH.living.held() }));

const opened = await open(s.base, Object.assign({}, SIZES[3], { path: '/hush/index.html?seed=' + SEED + '&', ready: READY }));
const { browser, page, errors } = opened;
/* the page writes its own complete record when a child chooses on the fork */
await page.evaluate(() => document.getElementById('fork-careful').click());
await sleep(150);

/* move where the approach stands, keeping everything else the page wrote, and reload into the round */
async function standAt(steps) {
  await page.evaluate(n => {
    const rec = JSON.parse(localStorage.getItem('lw:hush:save'));
    rec.adapt.steps = n;
    localStorage.setItem('lw:hush:save', JSON.stringify(rec));
  }, steps);
  await page.goto(s.base + LINK, { waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
}
/* the first trial of a run, played right: a press on a go pose, nothing on a no-go (Careful earns a step either way) */
async function playFirstTrial(runs) {
  const t = dealRun(rng(SEED >>> 0), { n: 40, level: adaptAxes(runs, 'careful').ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' })[0];
  await page.evaluate(() => document.getElementById('start').focus());
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => { const l = window.HUSH.live(); return !!l && l.i === 0 && l.paintedAt !== null; }, { timeout: 20000, polling: 'raf' });
  if (t.type === 'go') await page.keyboard.press('Space');
  await page.waitForFunction(() => window.HUSH.trials().length > 0, { timeout: 20000, polling: 'raf' });
}
const keptRuns = () => page.evaluate(() => window.HUSH.kept().runs);
async function settleOnce() {
  await standAt(SETTLE - 1);
  const before = await livingNow(page);
  await playFirstTrial(await keptRuns());
  await page.waitForFunction(() => window.HUSH.living.shown(), { timeout: 30000, polling: 'raf' });
  await sleep(120);
  return { before, after: await livingNow(page) };
}
const closeLiving = async () => { await page.evaluate(() => document.getElementById('living-go').focus()); await page.keyboard.press('Enter'); await sleep(100); };

/* 1 */
await standAt(SETTLE - 1);
const short = await livingNow(page);
await playFirstTrial(await keptRuns());
await page.waitForFunction(() => window.HUSH.living.shown(), { timeout: 30000, polling: 'raf' });
await sleep(120);
const one = await livingNow(page);
say(!short.shown && one.shown && one.held === 1 && one.spots.length === 1 && one.spots[0].species === 'deer', 'the clearing is shut through the trial before a settle and opens after it holding one creature, the deer (' + JSON.stringify({ short: short.shown, shown: one.shown, held: one.held, species: one.spots.map(x => x.species) }) + ')');

/* 4 */
const words = await page.evaluate(() => {
  const c = document.getElementById('living');
  return (c.innerText || '') + ' ' + Array.from(c.querySelectorAll('*')).map(e => (e.getAttribute('aria-label') || '') + (e.getAttribute('title') || '')).join(' ');
});
say(!/\d/.test(words), 'the clearing shows no digit and no number in any label (' + JSON.stringify(words.trim()) + ')');

/* 5: without less motion the idle turns; then with less motion it holds.
   ⛔ the first run read [0,0] for both halves: the gate never said which way it wanted the device's motion setting, so the page's
   own reading of it decided, and a zero named nothing. Each half now sets that setting (the environment, not the state the law
   asserts) and the line reports what the page read. */
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await sleep(200);
const askedMoving = await page.evaluate(() => ({ media: matchMedia('(prefers-reduced-motion: reduce)').matches, klass: document.documentElement.classList.contains('lw-reduced-motion') }));
const f0 = await page.evaluate(() => window.HUSH.living.frame());
await sleep(3000);
const f1 = await page.evaluate(() => window.HUSH.living.frame());
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await sleep(200);
const askedStill = await page.evaluate(() => ({ media: matchMedia('(prefers-reduced-motion: reduce)').matches, klass: document.documentElement.classList.contains('lw-reduced-motion') }));
const g0 = await page.evaluate(() => window.HUSH.living.frame());
await sleep(3000);
const g1 = await page.evaluate(() => window.HUSH.living.frame());
say(f0 !== f1 && g0 === g1, 'without less motion the clearing breathes, and with less motion it holds still (' + JSON.stringify({ moving: [f0, f1], still: [g0, g1], askedMoving, askedStill }) + ')');

/* 2 */
await closeLiving();
const live = await page.evaluate(() => ({ shown: window.HUSH.living.shown(), inert: document.getElementById('play').inert, next: !document.getElementById('next').hidden }));
say(!live.shown && !live.inert && live.next, 'go closes the clearing onto a live round, go on offered (' + JSON.stringify(live) + ')');
const two = await settleOnce(); await closeLiving();
const three = await settleOnce(); await closeLiving();
const sp = three.after.spots, spotsOwn = new Set(sp.map(x => x.x.toFixed(4) + '/' + x.y.toFixed(4))).size === sp.length;
say(two.after.held === 2 && three.after.held === 3 && JSON.stringify(sp.map(x => x.species)) === JSON.stringify(['deer', 'hare', 'fox']) && spotsOwn,
  'the next two settles add the hare and then the fox, each in a spot of its own (' + JSON.stringify(sp.map(x => x.species)) + ')');

/* 3: a reload in the middle of an approach earns nothing */
await standAt(SETTLE - 3);
await playFirstTrial(await keptRuns());
await page.goto(s.base + LINK, { waitUntil: 'load' });
await page.waitForFunction(READY, { timeout: 30000 });
const midHeld = await page.evaluate(() => JSON.parse(localStorage.getItem('lw:hush:save')).collect.length);
const four = await settleOnce(); await closeLiving();
say(midHeld === 3 && four.after.held === 4, 'a reload in the middle of an approach earns nothing: after it the store still holds three, and the settle after it holds four (' + JSON.stringify({ midHeld, after: four.after.held }) + ')');

/* 6 */
for (let k = 4; k < 25; k++) { await settleOnce(); await closeLiving(); }
const full = await settleOnce();
const spots = full.after.spots;
const places = new Set(spots.map(x => x.x.toFixed(4) + '/' + x.y.toFixed(4)));
const inTurn = spots.every((x, i) => x.species === SPECIES[i % SPECIES.length]);
say(full.after.shown && full.after.held === 24 && spots.length === 24 && places.size === 24 && inTurn,
  'twenty six settles hold twenty four creatures, every place in its own spot, the species in turn (' + full.after.held + ' held, ' + spots.length + ' drawn, ' + places.size + ' spots, in turn ' + inTurn + ')');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SPECIMENS FAILURE(S)'); process.exit(1); }
console.log('SPECIMENS OK');
