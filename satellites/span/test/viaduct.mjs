#!/usr/bin/env node
/* SPAN's viaduct and its runs (plans/span/HANDOFF-SPAN.md P2 step 4; the handoff's build step 7).
 *
 *   node test/viaduct.mjs          (in the foreground, under the gate lock)
 *
 * A run is `count` items. Runs are played through by thumb, and what the viaduct draws and what the store keeps are
 * read off the page and localStorage; the gate never writes the state it asserts (the 30 cap starts from 29).
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a reload in the middle of a run adds no arch
 *   2. a run of five played through ends on the viaduct: one arch drawn, one arch in the store, a 56 px start
 *   3. start on the viaduct begins the next run in the next mode (THE BLANK, then TRUE OR NOT, then RELATIONAL), on
 *      the next seed, term for term against engine.js
 *   4. a second run adds a second arch, and the later arch recedes: narrower and no less hazy than the one before
 *   5. never more than 30 arches: a store holding 29 holds 30 after a run and still 30 after another
 *   6. a teacher's ?mode= holds: the run after a TRUE OR NOT link's run is TRUE OR NOT again
 *   7. nothing on the console, nothing fetched after load
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad } from '../../math/core/test/shared.mjs';
import { rng } from '../../math/core/pure.js';
import { generateSet } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.SPAN && window.SPAN.ready';
const pathFor = extra => '/span/index.html?seed=' + SEED + '&count=5&' + (extra || '');

const saved = page => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('lw:span:save')); } catch (e) { return null; } });
const collected = rec => (rec && Array.isArray(rec.collect) ? rec.collect : []);
const drawnArches = page => page.evaluate(() => {
  const v = document.getElementById('viaduct');
  if (!v || v.hidden || getComputedStyle(v).display === 'none') return null;
  return Array.from(v.querySelectorAll('.arch')).map(a => { const r = a.getBoundingClientRect(); return { w: r.width, o: Number(getComputedStyle(a).opacity) }; });
});
const pageTerms = page => page.evaluate(() => Array.from(document.querySelectorAll('#equation .term')).map(el =>
  el.dataset.blank !== undefined ? { blank: true, side: el.dataset.side } : el.dataset.op ? { op: el.dataset.op } : { n: Number(el.dataset.n), side: el.dataset.side }));
const sameTerms = (terms, eq) => {
  const want = eq.left.map(t => t.op ? t : Object.assign({}, t, { side: 'left' })).concat([{ op: '=' }], eq.right.map(t => t.op ? t : Object.assign({}, t, { side: 'right' })));
  return terms.length === want.length && terms.every((t, i) => want[i].op ? t.op === want[i].op : want[i].blank ? t.blank && t.side === want[i].side : t.n === want[i].n && t.side === want[i].side);
};

/* one item by thumb: a stone dragged on and the span laid, or in TRUE OR NOT the first choice; then next */
async function playItem(page) {
  const judged = await page.evaluate(() => document.body.dataset.mode === 'judge');
  if (judged) await tap(page, '#same');
  else {
    await page.evaluate(() => {
      const src = document.querySelector('#supply .stone-source'), side = document.querySelector('#equation .term[data-blank]').dataset.side;
      const a = src.getBoundingClientRect(), b = document.getElementById('pier-' + side).getBoundingClientRect();
      const fire = (type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
        { pointerId: 91, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
      fire('pointerdown', a.left + a.width / 2, a.top + a.height / 2);
      fire('pointermove', b.left + b.width / 2, b.top + 30);
      fire('pointerup', b.left + b.width / 2, b.top + 30);
    });
    await sleep(150);
    await tap(page, '#lay');
  }
  await page.waitForFunction(() => window.SPAN.revealDone(), { timeout: 30000 });
  await sleep(120);
  await tap(page, '#next');
  await sleep(220);
}
const playRun = async page => { for (let i = 0; i < 5; i++) await playItem(page); };

/* ---- a reload in the middle of a run, on its own page ---- */
/* ⛔ the first version reloaded the page the network law then read, and the reload's own requests turned G2 red; the
   reload is its own page now, and G2 is asserted on a page that was never reloaded */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: pathFor(), ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(200);
  await playItem(page);
  await playItem(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  say(collected(await saved(page)).length === 0, 'a reload in the middle of a run adds no arch (' + JSON.stringify(collected(await saved(page))) + ')');
  say(errors.length === 0, 'the reload: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- a bare link: two runs and the modes in order ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: pathFor(), ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(200);
  await playRun(page);
  const one = await drawnArches(page), store1 = collected(await saved(page));
  say(!!one && one.length === 1 && store1.length === 1, 'a run of five played through ends on the viaduct, one arch drawn and one in the store ('
    + (one ? one.length : 'no viaduct') + ' drawn, ' + JSON.stringify(store1) + ')');
  const again = await centre(page, '#again');
  say(!!again && again.w >= 56 && again.h >= 56 && again.onTop, 'the viaduct\'s start is a 56 px target a thumb lands on'
    + (again ? ' (' + Math.round(again.w) + 'x' + Math.round(again.h) + (again.onTop ? '' : ' COVERED') + ')' : ' (missing)'));

  if (again) {
    await tap(page, '#again');
    await sleep(250);
    const mode2 = await page.evaluate(() => document.body.dataset.mode), t2 = await pageTerms(page);
    const J = generateSet(rng(SEED + 1), { mode: 'judge', size: 5, first: true });
    say(mode2 === 'judge' && sameTerms(t2, J[0]), 'start begins the next run in the next mode, TRUE OR NOT, on the next seed, term for term (' + mode2 + ' ' + JSON.stringify(t2) + ')');
    await playRun(page);
    const two = await drawnArches(page), store2 = collected(await saved(page));
    say(!!two && two.length === 2 && store2.length === 2, 'a second run adds a second arch (' + (two ? two.length : 'no viaduct') + ' drawn, ' + JSON.stringify(store2) + ')');
    say(!!two && two.length === 2 && two[1].w < two[0].w - 0.5 && two[1].o <= two[0].o,
      'and the later arch recedes, narrower and no less hazy (' + (two ? two.map(a => Math.round(a.w) + ' px at ' + a.o.toFixed(2)).join(', ') : '') + ')');
    if (await centre(page, '#again')) {
      await tap(page, '#again');
      await sleep(250);
      const mode3 = await page.evaluate(() => document.body.dataset.mode), t3 = await pageTerms(page);
      const R = generateSet(rng(SEED + 2), { mode: 'relational', size: 5, stage: 2 });
      say(mode3 === 'relational' && sameTerms(t3, R[0]), 'and the run after that is RELATIONAL, on the seed after, term for term (' + mode3 + ' ' + JSON.stringify(t3) + ')');
    }
  }
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, 'nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- the cap: a store holding 29 arches ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: pathFor(), ready: READY }));
  const { browser, page, errors } = opened;
  await page.evaluate(() => {
    const rec = JSON.parse(localStorage.getItem('lw:span:save') || 'null') || { v: 1, adapt: {}, settings: { muted: true, reducedMotion: false, allModes: false, highContrast: false } };
    rec.v = 1;
    rec.collect = Array.from({ length: 29 }, (_, i) => 'arch-' + (i + 1));
    localStorage.setItem('lw:span:save', JSON.stringify(rec));
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  await tap(page, '#start');
  await sleep(200);
  await playRun(page);
  const after1 = collected(await saved(page)).length, drawn1 = await drawnArches(page);
  await tap(page, '#again');
  await sleep(250);
  await playRun(page);
  const after2 = collected(await saved(page)).length, drawn2 = await drawnArches(page);
  say(after1 === 30 && after2 === 30 && !!drawn1 && drawn1.length === 30 && !!drawn2 && drawn2.length === 30,
    'never more than 30 arches: 29 and a run is 30, and another run is still 30 (' + after1 + ' then ' + after2 + ' in the store, '
    + (drawn1 ? drawn1.length : 'none') + ' then ' + (drawn2 ? drawn2.length : 'none') + ' drawn)');
  say(errors.length === 0, 'the cap: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- a teacher's TRUE OR NOT link holds its mode ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: pathFor('mode=judge&'), ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(200);
  await playRun(page);
  if (await centre(page, '#again')) {
    await tap(page, '#again');
    await sleep(250);
  }
  const mode = await page.evaluate(() => document.body.dataset.mode), terms = await pageTerms(page);
  const J = generateSet(rng(SEED + 1), { mode: 'judge', size: 5, first: true });
  say(mode === 'judge' && sameTerms(terms, J[0]), 'a teacher\'s ?mode=judge holds: the next run is TRUE OR NOT again, on the next seed (' + mode + ' ' + JSON.stringify(terms) + ')');
  say(errors.length === 0, 'the link: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' VIADUCT FAILURE(S)'); process.exit(1); }
console.log('VIADUCT OK');
