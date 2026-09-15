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
 *  10. the line's ends say what a game hands in (YONDER's road runs 0 to its range), and 0 and 1 when it hands in
 *      nothing, drawn by the real numberline.create in the page
 *  11. the line's snap (CREASE's folds): with four parts a stone let go at 0.3 lands, reports, commits and is drawn at
 *      0.25; one arrow key is one part; setSnap(3) moves it to the nearest third and a drag to 0.3 lands on 1/3; with no
 *      snap a stone let go at 0.3 stays at 0.3
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, reporter, SIZES, sleep, CORE } from './harness.mjs';

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
/* ⛔ the last frame is taken AFTER the reveal says it is done, two frames later: the first version stopped
   recording on the step the reveal finished, so a mark removed on that very step was never seen gone and "still
   there on the last frame" stayed green over a planted erase */
const waitReveal = page => page.waitForFunction(() => CORE_DEMO.results.length && CORE_DEMO.revealDone(), { timeout: 30000 })
  .then(() => page.evaluate(() => new Promise(done => {
    window.__revealDone = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const m = document.querySelector('#stage .lw-mark-learner');
      const cs = m && getComputedStyle(m);
      window.__frames.push({ t: performance.now(), after: true,
        learner: m ? { vis: cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0 } : null,
        truth: null, gap: null, caption: null });
      done({ frames: window.__frames, result: CORE_DEMO.results[CORE_DEMO.results.length - 1], loupe: window.__loupeSeen });
    }));
  })));
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

  /* the same animation on both paths. ⛔ Frames here are software rendered and can be 200 ms apart, so matching
     nearest frames, or lining the rounds up on the first frame the truth showed, would compare two different
     moments. Every frame is placed by its time since the page's own `truthAt`, and each round's curve is read
     against the other's by interpolating between the other's frames. */
  /* ⛔ the frame taken after the reveal (see waitReveal) carries no truth mark and is not part of the animation:
     read as opacity 0 it put a false drop at the end of one curve, and the erase plant's run showed 0.232 */
  const curve = rec => rec.frames.filter(f => !f.after && rec.result.truthAt !== null && f.t >= rec.result.truthAt)
    .map(f => ({ dt: f.t - rec.result.truthAt, o: f.truth ? f.truth.o : 0, go: f.gap ? f.gap.o : 0 }));
  const interp = (c, dt, k) => {
    for (let i = 0; i + 1 < c.length; i++) {
      if (c[i].dt <= dt && dt <= c[i + 1].dt) {
        const span = c[i + 1].dt - c[i].dt || 1;
        return c[i][k] + (c[i + 1][k] - c[i][k]) * (dt - c[i].dt) / span;
      }
    }
    return null;
  };
  const cw = curve(wrong), cr = curve(right);
  let worst = 0, compared = 0;
  for (const [a, b] of [[cw, cr], [cr, cw]]) {
    for (const p of a) {
      for (const k of ['o', 'go']) {
        const other = interp(b, p.dt, k);
        if (other === null) continue;
        worst = Math.max(worst, Math.abs(p[k] - other)); compared++;
      }
    }
  }
  say(cw.length > 2 && cr.length > 2 && compared >= 4 && worst < 0.1,
    'a right round and a wrong round run the same reveal (largest difference in the truth mark\'s and the gap\'s opacity '
    + worst.toFixed(3) + ' at the same moment, ' + compared + ' comparisons)');
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

/* ---- 10: the line's end labels ---- */
{
  const STAMP = (readFileSync(join(CORE, 'STAMP.js'), 'utf8').match(/STAMP = '([0-9]{8}[a-z])'/) || [])[1];
  const { browser, page, errors } = await open(s.base, SIZES[1]);
  const drawn = await page.evaluate(async stamp => {
    const { numberline, lineGeometry, rng } = await import('/core/core.js?v=' + stamp);
    const box = document.createElement('div');
    box.style.cssText = 'position:relative;width:320px;height:200px';
    document.body.append(box);
    const g = lineGeometry(rng(7));
    const read = () => Array.from(box.querySelectorAll('.lw-end')).map(e => e.textContent);
    const given = numberline.create({ container: box, geom: g, onCommit: () => {}, ends: ['0', '20'] });
    const labelled = read();
    given.destroy();
    const plain = numberline.create({ container: box, geom: g, onCommit: () => {} });
    const unlabelled = read();
    plain.destroy();
    box.remove();
    return { labelled, unlabelled };
  }, STAMP);
  say(drawn.labelled.join() === '0,20' && drawn.unlabelled.join() === '0,1',
    'a line handed ends of 0 and 20 is labelled 0 and 20, and a line handed none is labelled 0 and 1 (' + JSON.stringify(drawn) + ')');
  say(errors.length === 0, 'the end labels: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- 11: the line's snap (CREASE's folds, plans/crease/HANDOFF-CREASE.md 3.6), by real pointer events and real keys on
   the real numberline.create in the page ---- */
{
  const STAMP = (readFileSync(join(CORE, 'STAMP.js'), 'utf8').match(/STAMP = '([0-9]{8}[a-z])'/) || [])[1];
  const { browser, page, errors } = await open(s.base, SIZES[1]);
  const got = await page.evaluate(async stamp => {
    const { numberline, fromNormalized } = await import('/core/core.js?v=' + stamp);
    const box = document.createElement('div');
    box.style.cssText = 'position:relative;width:320px;height:200px';
    document.body.append(box);
    const g = { widthPct: 0.8, offsetPct: 0.1 };
    const W = () => box.getBoundingClientRect().width;
    /* a drag of the stone let go at a value, by pointer events on the stone itself */
    const dragTo = (line, v) => {
      const st = line.stone, a = st.getBoundingClientRect(), r = box.getBoundingClientRect(), y = a.top + a.height / 2;
      const x = r.left + fromNormalized(v, g, W());
      const o = cx => ({ pointerId: 191, pointerType: 'mouse', isPrimary: true, bubbles: true, cancelable: true, clientX: cx, clientY: y });
      st.dispatchEvent(new PointerEvent('pointerdown', o(a.left + a.width / 2)));
      st.dispatchEvent(new PointerEvent('pointermove', o(x)));
      st.dispatchEvent(new PointerEvent('pointerup', o(x)));
    };
    const out = {};
    const quarters = numberline.create({ container: box, geom: g, onCommit: v => { out.quartersCommit = v; }, snap: 4 });
    dragTo(quarters, 0.3);
    out.quarters = quarters.value();
    out.quartersPx = parseFloat(quarters.stone.style.left);
    out.quartersWant = fromNormalized(0.25, g, W());
    quarters.destroy();
    const keys = numberline.create({ container: box, geom: g, onCommit: () => {}, snap: 4 });
    keys.stone.focus();
    keys.stone.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    out.oneKey = keys.value();
    keys.setSnap(3);
    out.afterSetSnap = keys.value();
    dragTo(keys, 0.3);
    out.thirds = keys.value();
    keys.destroy();
    const plain = numberline.create({ container: box, geom: g, onCommit: () => {} });
    dragTo(plain, 0.3);
    out.plain = plain.value();
    plain.destroy();
    box.remove();
    return out;
  }, STAMP);
  const near = (a, b, e) => Math.abs(a - b) <= e;
  say(near(got.quarters, 0.25, 1e-9) && near(got.quartersCommit, 0.25, 1e-9) && near(got.quartersPx, got.quartersWant, 0.5),
    'a line with four parts puts a stone let go at 0.3 on 0.25, reports it and commits it, and draws it there (' + JSON.stringify({ v: got.quarters, commit: got.quartersCommit, px: got.quartersPx, want: got.quartersWant }) + ')');
  say(near(got.oneKey, 0.25, 1e-9), 'one arrow key on four parts moves one part (' + got.oneKey + ')');
  say(near(got.afterSetSnap, 1 / 3, 1e-9) && near(got.thirds, 1 / 3, 1e-9), 'setSnap(3) puts the stone on the nearest third and a drag to 0.3 lands on 1/3 (' + got.afterSetSnap + ', ' + got.thirds + ')');
  say(near(got.plain, 0.3, 0.01), 'a line with no snap leaves a stone let go at 0.3 at 0.3 (' + got.plain + ')');
  say(errors.length === 0, 'the snap: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' DEMO FAILURE(S)'); process.exit(1); }
console.log('DEMO OK');
