/* GATE (H1: D18, D21, D24, D29, D12): the round's verdict, the review sheet, the coin line, lives.
   D18  no verdict line above the pad; the review has ONE heading (Bullseye, Very close, Close,
        Keep tuning) and the percentage once, as "N% color similarity".
   D21  the review sheet is opaque and covers the pad, the strip and LOCK IT IN; Next sits in the
        lock button's exact slot (same box, 1px tolerance), at 360x640 and 412x915.
   D24  the first Daily clear shows its coins with an icon, never SVG markup printed as text.
   D29  Endless names its lives ("Lives 3 of 3"); a miss says "Life lost · N remaining"; a stage
        clear says what really happened to lives ("Life restored · 3 of 3" or "Lives full"), never a
        "+1 life" that was not given; the last life says "Life lost · run over".
   D12  a rapid double tap locks once; a drag from the pad that ends on LOCK IT IN does not lock.
   Run: node satellites/hues/dev/gate-review.mjs [--plant=doublelock|releaselock] */
import { arg, launch, open, close, reporter, plantFromArgs, tap, startMode, guess, lock, next, playing, playSet, toMenu, waitFor, visible, rect, sleep } from './harness.mjs';

plantFromArgs();
const R = reporter('gate-review');
const browser = await launch();
const ONLY = arg('only');   /* --only=d12 runs just the lock checks (for their plants) */
const WORDS = ['Bullseye', 'Very close', 'Close', 'Keep tuning'];
const sheetText = (page) => page.evaluate(() => document.getElementById('breakdown').textContent.replace(/\s+/g, ' '));
const hudLives = (page) => page.evaluate(() => (document.getElementById('lives') || {}).textContent || '');

for (const [w, h] of (ONLY === 'd12' ? [[412, 915]] : [[360, 640], [412, 915]])) {
  const W = w + 'x' + h;
  const page = await open(browser, { w, h, seed: { hues_rules: '1', 'hm.diff': 'normal' } });
  if (ONLY !== 'd12') {
  await startMode(page, 'daily');
  await guess(page, 'close'); await lock(page);
  const v = await visible(page, ['#verdict']);
  R.t(W + ' D18: no verdict line above the pad', v.length === 0, JSON.stringify(v));
  const head = await page.evaluate(() => (document.getElementById('shClose') || {}).textContent || '');
  R.t(W + ' D18: one heading word', WORDS.includes(head.trim()), JSON.stringify(head));
  const sim = await page.evaluate(() => (document.getElementById('shSim') || {}).textContent || '');
  R.t(W + ' D18: the percentage once, as color similarity', /^\d{1,3}% color similarity$/.test(sim.trim()), JSON.stringify(sim));
  const cover = await page.evaluate(() => {
    const sh = document.getElementById('breakdown'), pts = [];
    const add = (id, fy) => { const r = document.getElementById(id).getBoundingClientRect(); pts.push([id + '@' + fy, r.left + r.width / 2, r.top + Math.max(2, r.height * fy)]); };
    add('pad', 0); add('pad', 0.5); add('strip', 0.5); add('lockBtn', 0.5);
    return pts.map(([n, x, y]) => [n, sh.contains(document.elementFromPoint(x, y))]);
  });
  R.t(W + ' D21: the sheet covers pad, strip and LOCK IT IN', cover.every((c) => c[1]), JSON.stringify(cover));
  const a = await rect(page, '#bdNext'), b = await rect(page, '#lockBtn');
  const off = a && b ? Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.w - b.w), Math.abs(a.h - b.h)) : 99;
  R.t(W + ' D21: Next sits in the lock button\'s slot', off <= 1, 'next ' + JSON.stringify(a) + ' lock ' + JSON.stringify(b));
  const alpha = await page.evaluate(() => { const c = getComputedStyle(document.getElementById('breakdown')).backgroundColor.match(/[\d.]+/g); return c.length > 3 ? +c[3] : 1; });
  R.t(W + ' D21: the sheet is opaque', alpha === 1, 'alpha ' + alpha);
  await next(page);
  /* round 2: a bright, saturated guess puts the pad handle on the pad's top right corner */
  await playing(page);
  await page.evaluate(() => { const t = G.cur.target; G.guess = { h: (t.h + 9) % 360, s: 1, v: 1 }; renderControls(); renderYours(); });
  await lock(page);
  const peek = await page.evaluate(() => { const sh = document.getElementById('breakdown').getBoundingClientRect();
    return ['padHandle', 'stripHandle'].map((id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      return { id, top: Math.round(r.top), sheetTop: Math.round(sh.top), shown: cs.visibility !== 'hidden' && cs.display !== 'none' }; }).filter((x) => x.shown && x.top < x.sheetTop); });
  R.t(W + ' D21: no control handle peeks out above the review sheet', peek.length === 0, JSON.stringify(peek));
  await next(page);
  await playSet(page, ['close', 'close', 'close']);
  const coins = await page.evaluate(() => { const e = document.getElementById('resCoins'); return { text: e.textContent, svg: !!e.querySelector('svg') }; });
  R.t(W + ' D24: first Daily clear coins with an icon, no markup as text', coins.svg && !/[<>]/.test(coins.text), JSON.stringify(coins).slice(0, 140));
  }
  if (w === 412 && ONLY !== 'd12') {
    await toMenu(page);
    await startMode(page, 'endless');
    R.t('D29: the HUD names the lives', /Lives 3 of 3/.test(await hudLives(page)), JSON.stringify(await hudLives(page)));
    await guess(page, 'far'); await lock(page);
    let t = await sheetText(page);
    R.t('D29: a miss says Life lost · 2 remaining', /Life lost · 2 remaining/.test(t), t.slice(0, 120));
    await next(page); await playing(page);
    R.t('D29: the HUD counts down (Lives 2 of 3)', /Lives 2 of 3/.test(await hudLives(page)), JSON.stringify(await hudLives(page)));
    await guess(page, 'exact'); await lock(page); t = await sheetText(page);
    R.t('D29: a pass says Level survived', /Level survived/.test(t), t.slice(0, 120));
    await next(page);
    for (let i = 3; i <= 5; i++) { await playing(page); await guess(page, 'exact'); await lock(page); if (i < 5) await next(page); }
    t = await sheetText(page);
    R.t('D29: stage 1 with a life to give says Life restored · 3 of 3', /Life restored · 3 of 3/.test(t) && !/\+1 life/.test(t), t.slice(0, 200));
    await next(page);
    for (let i = 6; i <= 10; i++) { await playing(page); await guess(page, 'exact'); await lock(page); if (i < 10) await next(page); }
    t = await sheetText(page);
    R.t('D29: stage 2 at full lives says Lives full, no +1 life', /Lives full/.test(t) && !/\+1 life/.test(t), t.slice(0, 200));
    await next(page);
    for (let i = 0; i < 3; i++) { await playing(page); await guess(page, 'far'); await lock(page); if (i < 2) await next(page); }
    t = await sheetText(page);
    R.t('D29: the last life says Life lost · run over', /Life lost · run over/.test(t), t.slice(0, 160));
    await next(page);
    await waitFor(page, () => document.getElementById('result').classList.contains('on'), 6000); await sleep(300);
    await toMenu(page);
  }
  if (w === 412) {
    /* D12 */
    await startMode(page, 'daily');
    await guess(page, 'close');
    const lb = await rect(page, '#lockBtn'), cx = lb.x + lb.w / 2, cy = lb.y + lb.h / 2;
    await page.touchscreen.tap(cx, cy); await page.touchscreen.tap(cx, cy);
    await waitFor(page, () => document.getElementById('breakdown').classList.contains('show'), 6000); await sleep(500);
    const once = await page.evaluate(() => ({ n: G.history.length, idx: G.idx, score: G.score, pts: G.history[0] && G.history[0].pts }));
    R.t('D12: a rapid double tap locks once', once.n === 1 && once.score === once.pts, JSON.stringify(once));
    await next(page); await playing(page);
    const pr = await rect(page, '#pad'), lb2 = await rect(page, '#lockBtn');
    const x0 = pr.x + pr.w / 2, y0 = pr.y + pr.h / 2, x1 = lb2.x + lb2.w / 2, y1 = lb2.y + lb2.h / 2;
    await page.touchscreen.touchStart(x0, y0);
    for (let s = 1; s <= 10; s++) await page.touchscreen.touchMove(x0 + (x1 - x0) * s / 10, y0 + (y1 - y0) * s / 10);
    await page.touchscreen.touchEnd(); await sleep(500);
    const drag = await page.evaluate(() => ({ locked: G.locked, n: G.history.length }));
    R.t('D12: a drag that ends on LOCK IT IN does not lock', !drag.locked && drag.n === 1, JSON.stringify(drag));
  }
  R.t(W + ' no page errors', page._errors.length === 0, page._errors.slice(0, 3).join(' | '));
  await close(page);
}
await browser.close();
R.done();
