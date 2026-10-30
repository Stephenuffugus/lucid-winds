/* The layout gate (BUILD-PLAN.md T0.9, gate `layout`): the play screen at 412x915, 390x844, 360x780 and 320x568, in
 * the default and the mirrored strip, measured against section 1.5's rules computed HERE:
 *   - the canvas CSS width is 384 (768 only where 2x fits) when the viewport is 384 or wider, else innerWidth;
 *   - the backing store is 384 x VIEW_ROWS*16 and VIEW_ROWS = clamp(floor((h - 36 - 168) / 16), 20, 40)
 *     (40 at 412 and 390, 36 at 360, 22 at 320x568);
 *   - the top strip is 36 px; the control strip at least 168 and takes the spare height;
 *   - the rocker zones, A and B at least 56 px, the gap at least 16, none over the canvas or the reserved box;
 *   - every other control on the play screen at least 48 px and on top at its centre; the title's exit too;
 *   - the reserved box (412, 390, 360; released at 320): the bottom left 120x120, transparent, borderless, textless,
 *     the top hit at its centre and corners;
 *   - the fleet's chip, from the real /music-unlocks.js: on the title its rect is printed and it is on top and clear of
 *     the title's controls; in a room it is hidden (Q48's addendum, since sb-m0-2: the plan's "inside the reserved box
 *     in play" became "hidden in play" once the chip's saved drag was found to land anywhere);
 *   - landscape 800x360 with a coarse pointer: the rotate card, and five elementFromPoint probes all land on it; a fine
 *     pointer gets no card.
 * Watched red by CANVAS_100PCT, A_44PX, RESERVE_FILLED, MIRROR_OVERLAPS_CANVAS. */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep } from './harness.mjs';

const R = reporter('LAYOUT');
const srv = await serve();
const browser = await launch();
const TOP = 36, CTRL = 168, CELL = 16, ROWS_MIN = 20, ROWS_MAX = 40, WORLD = 384, RES = 120;
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

try {
  for (const [w, h] of [[412, 915], [390, 844], [360, 780], [320, 568]]) {
    const tag = w + 'x' + h;
    const { page, errors } = await newPage(browser, { width: w, height: h });
    await gotoGame(page, srv.base);
    await ready(page);

    /* the title: the exit control, and the fleet chip once it arrives */
    await page.waitForFunction(() => !!document.getElementById('sws-music-chip'), { timeout: 8000 }).catch(() => {});
    await sleep(300);
    const title = await page.evaluate(() => {
      const box = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
      const topAt = el => { const r = el.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (t === el || el.contains(t)); };
      const exit = document.getElementById('exit'), chip = document.getElementById('sws-music-chip');
      const ctrls = [...document.querySelectorAll('#title button, #title a')].filter(e => getComputedStyle(e).display !== 'none').map(box);
      return { exit: box(exit), exitTop: topAt(exit), chip: chip && getComputedStyle(chip).display !== 'none' ? box(chip) : null, chipTop: chip ? topAt(chip) : false, ctrls };
    });
    R.say(title.exit.w >= 48 && title.exit.h >= 48 && title.exitTop, tag + ': the exit control is ' + title.exit.w.toFixed(0) + 'x' + title.exit.h.toFixed(0) + ' and on top');
    if (title.chip) {
      const clear = title.ctrls.every(c => !overlap(c, title.chip));
      console.log('  info  ' + tag + ': the fleet chip on the title at ' + [title.chip.x, title.chip.y, title.chip.w, title.chip.h].map(v => v.toFixed(0)).join(',') + (title.chipTop ? ', on top' : ', NOT on top'));
      R.say(title.chipTop && clear, tag + ': on the title the fleet chip is on top and clear of the title\'s controls');
    } else console.log('  info  ' + tag + ': no fleet chip on the title (the catalogue did not place one)');

    await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample');
    for (const mirror of [false, true]) {
      const tg = tag + (mirror ? ' mirrored' : '');
      const m = await page.evaluate(mir => {
        document.getElementById('strip').classList.toggle('mirror', mir);
        const box = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
        const q = s => document.querySelector(s), cv = q('#view'), res = q('#reserve'), cs = getComputedStyle(res);
        const topIs = (el, x, y) => { const t = document.elementFromPoint(x, y); return !!t && (t === el || el.contains(t)); };
        const rb = res.getBoundingClientRect(), resShown = cs.display !== 'none' && rb.width > 0;
        const corners = resShown ? [[rb.left + 2, rb.top + 2], [rb.right - 2, rb.top + 2], [rb.left + 2, rb.bottom - 2], [rb.right - 2, rb.bottom - 2], [rb.left + rb.width / 2, rb.top + rb.height / 2]] : [];
        const chip = q('#sws-music-chip');
        return {
          vw: window.innerWidth, vh: window.innerHeight, cssW: cv.getBoundingClientRect().width, bw: cv.width, bh: cv.height,
          rows: window.SB_DEV.level().viewRows, canvas: box(cv), top: box(q('#top')), strip: box(q('#strip')),
          zl: box(q('#rocker .zl')), zr: box(q('#rocker .zr')), gap: box(q('#rocker .gap')), rocker: box(q('#rocker')),
          A: box(q('#btnA')), B: box(q('#btnB')), back: box(q('#back')), backTop: topIs(q('#back'), q('#back').getBoundingClientRect().left + 24, q('#back').getBoundingClientRect().top + 24),
          res: resShown ? box(res) : null, resClear: resShown ? cs.backgroundColor === 'rgba(0, 0, 0, 0)' && parseFloat(cs.borderTopWidth) === 0 && res.textContent === '' : true,
          resTop: corners.every(([x, y]) => topIs(res, x, y)),
          chipShown: !!chip && getComputedStyle(chip).display !== 'none'
        };
      }, mirror);
      const wantW = m.vw >= WORLD ? WORLD : m.vw;
      const wantRows = Math.max(ROWS_MIN, Math.min(ROWS_MAX, Math.floor((m.vh - TOP - CTRL) / CELL)));
      R.say(Math.abs(m.cssW - wantW) < 0.5, tg + ': the canvas is ' + m.cssW.toFixed(1) + ' CSS px wide (want ' + wantW + ')');
      R.say(m.bw === WORLD && m.bh === m.rows * CELL && m.rows === wantRows, tg + ': the backing store is ' + m.bw + 'x' + m.bh + ', VIEW_ROWS ' + m.rows + ' (the formula gives ' + wantRows + ')');
      R.say(Math.abs(m.top.h - TOP) < 0.5 && m.strip.h >= CTRL - 0.5 && Math.abs(m.top.h + m.canvas.h + m.strip.h - m.vh) < 1.5,
        tg + ': the top strip ' + m.top.h.toFixed(0) + ' px, the control strip ' + m.strip.h.toFixed(0) + ' px (168 or more, the spare height), filling the ' + m.vh + ' px screen');
      const verbs = { 'left zone': m.zl, 'right zone': m.zr, A: m.A, B: m.B };
      for (const [name, b] of Object.entries(verbs)) {
        R.say(b.w >= 56 - 0.5 && b.h >= 56 - 0.5, tg + ': ' + name + ' measures ' + b.w.toFixed(0) + 'x' + b.h.toFixed(0) + ' (56 or more)');
        R.say(!overlap(b, m.canvas) && (!m.res || !overlap(b, m.res)), tg + ': ' + name + ' is clear of the canvas' + (m.res ? ' and the reserved box' : ''));
      }
      R.say(m.gap.w >= 16 - 0.5, tg + ': the rocker\'s gap is ' + m.gap.w.toFixed(0) + ' px (16 or more)');
      R.say(!overlap(m.rocker, m.canvas) && !overlap(m.A, m.B) && !overlap(m.A, m.rocker) && !overlap(m.B, m.rocker), tg + ': the rocker, A and B are disjoint and clear of the canvas');
      R.say(m.back.w >= 48 && m.back.h >= 48 && m.backTop, tg + ': Title is ' + m.back.w.toFixed(0) + 'x' + m.back.h.toFixed(0) + ' and on top');
      if (w >= 360) {
        R.say(!!m.res && Math.abs(m.res.x) < 0.5 && Math.abs(m.res.w - RES) < 0.5 && Math.abs(m.res.h - RES) < 0.5 && Math.abs(m.res.y + m.res.h - m.vh) < 0.5,
          tg + ': the reserved box is the bottom left 120x120 (' + (m.res ? [m.res.x, m.res.y, m.res.w, m.res.h].map(v => v.toFixed(0)).join(',') : 'missing') + ')');
        R.say(m.resClear && m.resTop, tg + ': the reserved box is transparent, borderless and textless, and the top hit at its centre and corners');
      } else R.say(!m.res, tg + ': under 360 the reserved box is released (hidden)');
      R.say(!m.chipShown, tg + ': in a room the fleet chip is hidden (Q48\'s addendum)');
    }
    R.say(errors.length === 0, tag + ': zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* a phone turned sideways mid room: under the rotate card the loop holds (nothing moves, no moth comes), and
     turned back it runs on (the fourth review: the moths kept coming behind the card) */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915, touch: true, dpr: 3 });
    await gotoGame(page, srv.base); await ready(page);
    await tap(page, '#sample');
    await new Promise(r => setTimeout(r, 2500));   /* past the develop reveal (at most 1.6 s) */
    const f0 = await page.evaluate(() => window.SB_DEV.frames());
    await new Promise(r => setTimeout(r, 300));
    const fA = await page.evaluate(() => window.SB_DEV.frames());
    await page.setViewport({ width: 915, height: 412, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
    await new Promise(r => setTimeout(r, 300));
    const s1 = await page.evaluate(() => ({ f: window.SB_DEV.frames(), card: getComputedStyle(document.getElementById('rotate')).display !== 'none' }));
    await new Promise(r => setTimeout(r, 700));
    const f2 = await page.evaluate(() => window.SB_DEV.frames());
    await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
    await new Promise(r => setTimeout(r, 500));
    const f3 = await page.evaluate(() => window.SB_DEV.frames());
    R.say(fA > f0 && s1.card && f2 === s1.f && f3 > f2, 'turned sideways mid room the loop holds under the rotate card (running before: ' + f0 + ' to ' + fA + '; sideways ' + s1.f + ' then ' + f2 + ' in 0.7 s) and runs on when turned back (' + f3 + ')');
    R.say(errors.length === 0, 'sideways and back: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* landscape: a phone held sideways gets the rotate card over everything; a desktop window does not */
  for (const coarse of [true, false]) {
    const { page, errors } = await newPage(browser, { width: 800, height: 360, touch: coarse, dpr: coarse ? 3 : 1 });
    await gotoGame(page, srv.base);
    await ready(page);
    const r = await page.evaluate(() => {
      const card = document.getElementById('rotate'), shown = getComputedStyle(card).display !== 'none';
      const probes = [[400, 180], [40, 40], [760, 40], [40, 320], [760, 320]].map(([x, y]) => { const t = document.elementFromPoint(x, y); return !!t && (t === card || card.contains(t)); });
      return { shown, probes, coarse: matchMedia('(pointer: coarse)').matches, text: card.textContent };
    });
    if (coarse) R.say(r.coarse && r.shown && r.probes.every(Boolean), '800x360 with a coarse pointer: the rotate card ("' + r.text + '") covers the screen, five probes land on it (' + r.probes.map(p => (p ? 'card' : 'NOT')).join(' ') + ')');
    else R.say(!r.coarse && !r.shown, '800x360 with a fine pointer: no rotate card');
    R.say(errors.length === 0, '800x360 ' + (coarse ? 'coarse' : 'fine') + ': zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
