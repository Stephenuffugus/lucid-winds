#!/usr/bin/env node
/* YONDER Mode 5, MILEPOSTS (plans/yonder/HANDOFF-YONDER.md P2 step 4; the routing table's "inject MILEPOSTS rounds" and the
 * handoff's "halfway, then quarters, then an estimate on the marked road").
 *
 *   node test/mileposts.mjs          (in the foreground, under the gate lock)
 *
 * MILEPOSTS is reached by play, never set: on the road to 100 a child places every number where a logarithmic reading
 * puts it, by keys, until the routing calls a frontier. Every stage is replayed in Node from engine.js for the same seed
 * and the placements the page recorded.
 *
 * Asserted at 320x568 and at 1366x768, each watched to fail on a planted fault:
 *   1. a logarithmic record on the road to 100 is followed by a MILEPOSTS stage there, and its rounds are Node's
 *      milepostRounds: the halfway post, the quarter posts, then four estimates
 *   2. no post stands on the road before a post round's walk (Y4: only the child's own posts)
 *   3. after each post round's walk a post stands at its true place, with its numeral; every post stands through the
 *      rest of the stage, redrawn on each new road at its own number (Y3 moves the road, never a post's number)
 *   4. a post's numeral sits clear of the road's ends, of the other posts' numerals and of the truth's numeral
 *   5. the stage after MILEPOSTS has no post on its road and serves the probe again, first
 *   6. MILEPOSTS placements feed no reading: the road's record is the same before and after the stage
 */
import { join } from 'node:path';
import { serve, open, reporter, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { rng, fromNormalized } from '../../math/core/pure.js';
import { freshSession, planStage, recordStage, milepostRounds, generateStage, PROBE_TABLE } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242, MAX = 100;
const PAGE = { path: '/yonder/index.html?seed=' + SEED + '&road=100&', ready: 'window.YONDER && window.YONDER.ready' };
const logPlace = t => MAX * Math.log(Math.max(1, t)) / Math.log(MAX);

/* the posts as drawn, the road's geometry, and the numerals' boxes */
const drawn = page => page.evaluate(() => {
  const road = document.getElementById('road'), W = road.getBoundingClientRect().width;
  const box = e => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
  const posts = Array.from(document.querySelectorAll('#road .milepost')).filter(e => getComputedStyle(e).display !== 'none').map(e => ({
    value: Number(e.dataset.value), x: parseFloat(e.style.left), label: e.textContent, box: box(e.querySelector('.milepost-label') || e) }));
  const truth = document.getElementById('truth');
  return { W, offset: Number(road.dataset.offset), width: Number(road.dataset.width), posts,
    ends: Array.from(document.querySelectorAll('#road .lw-end')).map(box), truth: truth.hidden ? null : box(truth) };
});
const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;

for (const size of [SIZES[0], SIZES[3]]) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.focus('#start');
  await page.keyboard.press('Enter');
  await sleep(200);
  await page.focus('#road .lw-stone');
  const bad = { y4: [], stand: [], clear: [] };
  let session = freshSession(MAX), recordBefore = null, recordAfter = null, milepostsSeen = false, afterStage = null, stagesPlayed = 0;
  for (let guard = 0; guard < 80 && !afterStage; guard++) {
    const stageNo = session.stages;
    const plan = planStage(session, rng((SEED * 31 + 17 + stageNo) >>> 0));
    const deal = rng((SEED + stageNo) >>> 0);
    const rounds = plan.kind === 'mileposts' ? milepostRounds(deal, plan.max) : generateStage(deal, plan.max, { isNew: plan.isNew }).map(t => ({ kind: 'flag', target: t }));
    const pagePlan = await page.evaluate(() => window.YONDER.plan());
    const pageRounds = await page.evaluate(() => window.YONDER.rounds());
    if (pagePlan.kind !== plan.kind || pagePlan.max !== plan.max || pageRounds.map(r => r.kind + r.target).join() !== rounds.map(r => r.kind + r.target).join()) {
      say(false, at + ' stage ' + stageNo + ' on the page is Node\'s (page ' + pagePlan.kind + ' ' + pagePlan.max + ': ' + pageRounds.map(r => r.target).join(',') + '; Node ' + plan.kind + ' ' + plan.max + ': ' + rounds.map(r => r.target).join(',') + ')');
      break;
    }
    if (milepostsSeen && plan.kind !== 'mileposts') {
      afterStage = { plan, rounds, posts: (await drawn(page)).posts.length };
      recordAfter = JSON.stringify(session.roads[MAX].estimates);
      break;
    }
    if (plan.kind === 'mileposts') { milepostsSeen = true; recordBefore = JSON.stringify(session.roads[MAX].estimates); }
    const flagEstimates = [];
    for (const [k, rd] of rounds.entries()) {
      const before = await drawn(page);
      const stood = rounds.slice(0, k).filter(x => x.kind === 'post').map(x => x.target);
      if (plan.kind === 'mileposts') {
        const vals = before.posts.map(p => p.value).sort((a, b) => a - b).join();
        if (vals !== stood.slice().sort((a, b) => a - b).join()) bad.stand.push('round ' + k + ' of MILEPOSTS stands posts ' + vals + ', wanted ' + stood.join(','));
        for (const p of before.posts) {
          const want = fromNormalized(p.value / MAX, { offsetPct: before.offset, widthPct: before.width }, before.W);
          if (Math.abs(p.x - want) > 1 || p.label !== String(p.value)) bad.stand.push('post ' + p.value + ' at ' + p.x.toFixed(1) + ' px, its number at ' + want.toFixed(1) + ', labelled ' + JSON.stringify(p.label));
        }
      } else if (before.posts.length) bad.y4.push('stage ' + stageNo + ' round ' + k + ' has ' + before.posts.length + ' posts on a FLAG road');
      /* a logarithmic child, by keys: a hundredth of the road a press */
      const presses = Math.round(logPlace(rd.target));
      for (let i = 0; i < presses; i++) await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 15000 });
      await sleep(60);
      const done = await drawn(page);
      if (plan.kind === 'mileposts') {
        const want = stood.concat(rd.kind === 'post' ? [rd.target] : []);
        if (done.posts.map(p => p.value).sort((a, b) => a - b).join() !== want.slice().sort((a, b) => a - b).join()) bad.stand.push('after round ' + k + ' posts ' + done.posts.map(p => p.value).join(',') + ', wanted ' + want.join(','));
        for (const p of done.posts) {
          if (done.ends.some(e => hit(e, p.box))) bad.clear.push('post ' + p.value + ' numeral overlaps an end');
          if (done.truth && hit(done.truth, p.box) && !(rd.kind === 'post' && p.value === rd.target)) bad.clear.push('post ' + p.value + ' numeral overlaps the truth\'s ' + rd.target);
          for (const q of done.posts) if (q !== p && hit(p.box, q.box)) bad.clear.push('posts ' + p.value + ' and ' + q.value + ' overlap');
        }
      }
      if (rd.kind === 'flag') flagEstimates.push(await page.evaluate(() => { const r = window.YONDER.results[window.YONDER.results.length - 1]; return { target: r.target, placement: r.placement }; }));
      await page.keyboard.press('Enter');
      await sleep(80);
    }
    session = recordStage(session, { max: plan.max, kind: plan.kind, estimates: flagEstimates }, rng((SEED * 31 + 17 + stageNo) >>> 0)).session;
    stagesPlayed++;
  }
  say(milepostsSeen, at + ' a logarithmic record on the road to 100 is followed by a MILEPOSTS stage there, its rounds Node\'s (' + stagesPlayed + ' stages played)');
  say(bad.y4.length === 0, at + ' no post stands on a FLAG road (Y4)' + (bad.y4.length ? ': ' + bad.y4.slice(0, 2).join('; ') : ''));
  say(milepostsSeen && bad.stand.length === 0, at + ' after each post round a post stands at its true place with its numeral, through the rest of the stage, on every new road' + (bad.stand.length ? ': ' + bad.stand.slice(0, 3).join('; ') : ''));
  say(milepostsSeen && bad.clear.length === 0, at + ' every post\'s numeral sits clear of the ends, the other posts and the truth\'s numeral' + (bad.clear.length ? ': ' + Array.from(new Set(bad.clear)).slice(0, 3).join('; ') : ''));
  say(!!afterStage && afterStage.posts === 0 && afterStage.plan.isNew && afterStage.rounds[0].target === PROBE_TABLE[MAX],
    at + ' the stage after MILEPOSTS has no post and serves the probe first (' + (afterStage ? afterStage.posts + ' posts, first ' + afterStage.rounds[0].target : 'never reached') + ')');
  say(!!recordBefore && recordBefore === recordAfter, at + ' MILEPOSTS placements feed no reading: the road\'s record is unchanged by the stage');
  const kept = await page.evaluate(() => JSON.stringify(window.YONDER.session()));
  say(kept === JSON.stringify(session), at + ' and the session the page keeps is Node\'s replay');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' MILEPOSTS FAILURE(S)'); process.exit(1); }
console.log('MILEPOSTS OK');
