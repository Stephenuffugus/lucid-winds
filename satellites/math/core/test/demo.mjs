#!/usr/bin/env node
/* THE REVEAL CONTRACT, against the demo (00-CORE-handoff 2.2; plans/math/HANDOFF-CORE.md P2).
 *
 *   node test/demo.mjs
 *
 * The demo is one round of the catalog's commonest shape: a fraction to place,
 * an unmarked line, a stone to drag or key onto it, and the reveal. The page
 * exposes what it decided (`CORE_DEMO.round()`, `CORE_DEMO.results`) so the gate
 * can compare; it never lets the gate decide anything. Every round is played by a
 * real drag or real keys.
 *
 * Asserted, each watched to fail on a planted fault (section 13):
 *   1. the child's mark is painted on an EARLIER frame than the truth mark, and it
 *      is still there on the last frame (never erased)
 *   2. the caption states a fact: `<n>/<d> is here`, or `close, <n>/<d> is here`
 *      for a near miss, and never a verdict word
 *   3. a right round and a wrong round run the SAME animation: the truth mark's
 *      and the gap's opacity and position, frame by frame, are the same curve
 *      (a differential between two rounds)
 *   4. no colour means correctness: every computed colour on the stage is the same
 *      in a right round and a wrong one (a differential)
 *   5. a near miss counts as correct and is captioned `close, `
 *   6. the loupe shows on a touch drag and not on a mouse drag
 *   7. the line's width and offset change every round, measured on the page (N1)
 *   8. the value the page committed is the pure half's reading of where the stone
 *      was dropped (the seam)
 *   9. by keyboard at 1366x768: Tab to the stone, arrows move it, Enter commits
 */
import { serve, open, reporter, SIZES, sleep } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const VERDICTS = /\b(wrong|incorrect|try again|missed|oops|no|nope|fail|failed|right|correct|good|great)\b/i;

/* the reveal, recorded frame by frame from the moment of the commit */
const RECORD = () => {
  window.__frames = [];
  const grab = () => {
    const q = sel => document.querySelector('#stage ' + sel);
    const learner = q('.lw-mark-learner'), truth = q('.lw-mark-truth'), gap = q('.lw-gap'), cap = q('.lw-caption');
    const box = el => {
      if (!el) return null;
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top), o: +cs.opacity, t: cs.transform, vis: cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0 };
    };
    window.__frames.push({ t: performance.now(), learner: box(learner), truth: box(truth), gap: box(gap),
      caption: cap && cap.textContent });
    if (window.__frames.length < 400 && !window.__revealDone) requestAnimationFrame(grab);
  };
  window.__revealDone = false;
  requestAnimationFrame(grab);
};

/* drag the stone to a normalized position on the current line, as a thumb or a mouse would */
async function dropAt(page, x, pointerType) {
  const where = await page.evaluate((x) => {
    const R = CORE_DEMO.round(), stone = document.querySelector('#stage .lw-stone'), line = document.querySelector('#stage .lw-line');
    const sr = stone.getBoundingClientRect(), lr = line.getBoundingClientRect(), st = document.getElementById('stage').getBoundingClientRect();
    return { sx: sr.left + sr.width / 2, sy: sr.top + sr.height / 2,
      tx: st.left + CORE_DEMO.pixelFor(x), ty: lr.top + lr.height / 2, geom: R.geom };
  }, x);
  await page.evaluate(RECORD);
  await page.evaluate((w, pointerType) => {
    const fire = (type, x, y, target) => (target || document.elementFromPoint(x, y)).dispatchEvent(new PointerEvent(type,
      { pointerId: 31, pointerType, isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
    fire('pointerdown', w.sx, w.sy);
    window.__loupeSeen = false;
    const stone = document.querySelector('#stage .lw-stone');
    for (let i = 1; i <= 8; i++) {
      fire('pointermove', w.sx + (w.tx - w.sx) * i / 8, w.sy + (w.ty - w.sy) * i / 8, stone);
      const l = document.querySelector('.lw-loupe');
      if (l && getComputedStyle(l).display !== 'none' && !l.hidden) window.__loupeSeen = true;
    }
    fire('pointerup', w.tx, w.ty, stone);
  }, where, pointerType);
  return where;
}
const waitReveal = page => page.waitForFunction(() => CORE_DEMO.results.length && CORE_DEMO.revealDone(), { timeout: 30000 })
  .then(() => page.evaluate(() => { window.__revealDone = true; return { frames: window.__frames, result: CORE_DEMO.results[CORE_DEMO.results.length - 1], loupe: window.__loupeSeen }; }));
const colours = page => page.evaluate(() => Array.from(document.querySelectorAll('#stage, #stage *')).map(el => {
  const cs = getComputedStyle(el);
  return [cs.color, cs.backgroundColor, cs.borderTopColor, cs.fill, cs.outlineColor].join('|');
}).join('\n'));
const next = page => page.evaluate(() => CORE_DEMO.next()).then(() => sleep(150));

/* ---- a phone, by touch ---- */
{
  const { browser, page, errors } = await open(s.base, SIZES[1]);
  const truthOf = () => page.evaluate(() => CORE_DEMO.round().value);

  /* a WRONG round: the stone a long way from the truth */
  const t1 = await truthOf();
  const w1 = await dropAt(page, t1 > 0.5 ? 0.05 : 0.95, 'touch');
  const wrong = await waitReveal(page);
  const wrongColours = await colours(page);
  const firstLearner = wrong.frames.findIndex(f => f.learner && f.learner.vis);
  const firstTruth = wrong.frames.findIndex(f => f.truth && f.truth.vis);
  const last = wrong.frames[wrong.frames.length - 1];
  say(firstLearner >= 0 && firstTruth > firstLearner, 'the child\'s mark is painted before the truth (frame ' + firstLearner + ' against ' + firstTruth + ')');
  say(!!(last && last.learner && last.learner.vis), 'and it is still there on the last frame of the reveal');
  say(!wrong.result.correct && !wrong.result.near, 'a drop far from the truth is scored as neither right nor near');
  const cap1 = wrong.result.caption;
  say(/^\d+\/\d+ is here$/.test(cap1) && !VERDICTS.test(cap1), 'its caption states a fact (' + JSON.stringify(cap1) + ')');
  say(wrong.loupe, 'the loupe shows while a thumb drags the stone');
  const seam = await page.evaluate((w) => CORE_DEMO.valueAt(w.tx), w1);
  say(Math.abs(seam - wrong.result.value) < 1e-6, 'the committed value is the pure half\'s reading of the drop point ('
    + wrong.result.value.toFixed(4) + ' against ' + seam.toFixed(4) + ')');
  const g1 = await page.evaluate(() => { const r = document.querySelector('#stage .lw-line').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width)]; });

  /* a RIGHT round: the stone exactly on the truth */
  await next(page);
  const t2 = await truthOf();
  await dropAt(page, t2, 'touch');
  const right = await waitReveal(page);
  const rightColours = await colours(page);
  say(right.result.correct && !right.result.near, 'a drop on the truth is scored right');
  say(/^\d+\/\d+ is here$/.test(right.result.caption), 'and its caption is the same kind of fact (' + JSON.stringify(right.result.caption) + ')');
  const g2 = await page.evaluate(() => { const r = document.querySelector('#stage .lw-line').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width)]; });

  /* the same animation on both paths, compared by time since the truth first showed */
  const curve = rec => {
    const i0 = rec.frames.findIndex(f => f.truth && f.truth.vis);
    if (i0 < 0) return [];
    const t0 = rec.frames[i0].t;
    return rec.frames.slice(i0).map(f => ({ dt: f.t - t0, o: f.truth ? f.truth.o : 0, t: f.truth ? f.truth.t : '', go: f.gap ? f.gap.o : 0 }));
  };
  const cw = curve(wrong), cr = curve(right);
  const sampleAt = (c, dt, k) => { let best = c[0]; for (const p of c) if (Math.abs(p.dt - dt) < Math.abs(best.dt - dt)) best = p; return best ? best[k] : null; };
  let worst = 0;
  for (const dt of [0, 100, 200, 300, 450, 600, 800]) {
    worst = Math.max(worst, Math.abs(sampleAt(cw, dt, 'o') - sampleAt(cr, dt, 'o')), Math.abs(sampleAt(cw, dt, 'go') - sampleAt(cr, dt, 'go')));
  }
  say(cw.length > 3 && cr.length > 3 && worst < 0.2, 'a right round and a wrong round run the same reveal (largest difference in the truth mark\'s and the gap\'s opacity '
    + worst.toFixed(2) + ' at the same moment)');
  say(wrongColours === rightColours, 'and no colour on the stage differs between a right round and a wrong one');
  say(g1[0] !== g2[0] || g1[1] !== g2[1], 'the line moved between rounds (' + g1.join(',') + ' then ' + g2.join(',') + ')');

  /* a NEAR round: inside the tolerance, not on it */
  await next(page);
  const t3 = await truthOf();
  const tol = await page.evaluate(() => CORE_DEMO.round().tolerance);
  await dropAt(page, Math.min(1, Math.max(0, t3 + (t3 > 0.5 ? -1 : 1) * tol * 0.6)), 'touch');
  const near = await waitReveal(page);
  say(near.result.correct && near.result.near, 'a near miss counts as correct and is marked near');
  say(/^close, \d+\/\d+ is here$/.test(near.result.caption), 'and its caption is prefixed close (' + JSON.stringify(near.result.caption) + ')');

  /* a MOUSE drag shows no loupe */
  await next(page);
  await dropAt(page, 0.5, 'mouse');
  const mouse = await waitReveal(page);
  say(!mouse.loupe, 'a mouse drag shows no loupe');

  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- the Chromebook, by keyboard ---- */
{
  const { browser, page, errors } = await open(s.base, SIZES[3]);
  let reached = false;
  for (let i = 0; i < 12 && !reached; i++) {
    await page.keyboard.press('Tab');
    reached = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('lw-stone'));
  }
  say(reached, 'Tab reaches the stone');
  const before = await page.evaluate(() => CORE_DEMO.stoneValue());
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  const after = await page.evaluate(() => CORE_DEMO.stoneValue());
  say(after > before, 'the right arrow moves it along the line (' + before.toFixed(3) + ' to ' + after.toFixed(3) + ')');
  await page.evaluate(RECORD);
  await page.keyboard.press('Enter');
  const kb = await waitReveal(page);
  say(Math.abs(kb.result.value - after) < 1e-6, 'and Enter commits where it stands (' + kb.result.value.toFixed(3) + ')');
  say(kb.frames.some(f => f.truth && f.truth.vis), 'and the reveal plays');
  say(errors.length === 0, 'nothing landed on the console at 1366x768' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' DEMO FAILURE(S)'); process.exit(1); }
console.log('DEMO OK');
