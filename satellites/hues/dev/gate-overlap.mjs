/* GATE (H1, D01 + D02): nothing floats over Hues while the player is working.
   In every state, the fleet's floating chrome (the music card, its folded pill, the music toast and
   chip, the feedback ladybug) must not be visible, with ONE exception: after a FINISHED set, back on
   the menu, the song card may appear as a dialog (Stephen's P11 "congratulations" moment, moved from
   boot to a break). It must appear there at least once on a fresh save, or the reward was lost.
   Hues' own reward notices (a goal complete, a new best) must not float over the review sheet; they
   belong inside it.
   Run: node satellites/hues/dev/gate-overlap.mjs [--plant=pill]      at 360x640 and 412x915.
   Red on the pre-H1 build:  HUES_REV=<sha> MUSIC_REV=<sha> node satellites/hues/dev/gate-overlap.mjs */
import { launch, open, close, reporter, plantFromArgs, presentState, declaredState, visible, CHROME, describe, rect, intersects,
  tap, tapText, startMode, guess, lock, next, playing, playSet, toMenu, waitFor, sleep } from './harness.mjs';

plantFromArgs();
const R = reporter('gate-overlap');
const browser = await launch();
const PROTECT = { play: ['#pad', '#strip', '#lockBtn'], review: ['#bdNext', '#shScroll'], rules: ['.rules-card'], share: ['#shareImg', '#shareImgBtn', '#shareSaveBtn', '#shareTextBtn', '#shareCloseBtn'], result: ['#resActions'] };

async function noChrome(page, where, W) {
  const st = await presentState(page), list = await visible(page, CHROME);
  R.t(W + ' ' + where + ' (' + st + '): no floating fleet chrome', list.length === 0, describe(list));
  for (const sel of PROTECT[st] || []) {
    const r = await rect(page, sel); const hit = list.filter((c) => intersects(c, r));
    if (hit.length) R.t(W + ' ' + where + ': chrome clear of ' + sel, false, describe(hit));
  }
  return list;
}

for (const [w, h] of [[360, 640], [412, 915]]) {
  const W = w + 'x' + h;
  /* ---- a fresh save, first boot, first set ---- */
  let page = await open(browser, { w, h, settleMs: 1700 });
  await noChrome(page, 'menu at first boot', W);
  R.t(W + ' Hues declares its presentation state (menu)', (await declaredState(page)) === 'menu', 'data-hues=' + (await declaredState(page)));
  await tap(page, '[data-mode="daily"]'); await sleep(500);
  if ((await presentState(page)) === 'rules') { await noChrome(page, 'first run rules', W); R.t(W + ' declared state rules', (await declaredState(page)) === 'rules'); await tap(page, '#rulesGo'); }
  await playing(page);
  await noChrome(page, 'Daily round 1', W);
  R.t(W + ' declared state play', (await declaredState(page)) === 'play');
  await guess(page, 'close'); await lock(page);
  await noChrome(page, 'round 1 review', W);
  R.t(W + ' declared state review', (await declaredState(page)) === 'review');
  await next(page);
  await playSet(page, ['close', 'exact', 'close', 'far']);
  await noChrome(page, 'Daily result', W);
  R.t(W + ' declared state result', (await declaredState(page)) === 'result');
  await tapText(page, '#resActions', 'Share'); await sleep(600);
  await noChrome(page, 'share preview', W);
  R.t(W + ' declared state share', (await declaredState(page)) === 'share');
  await tap(page, '#shareCloseBtn'); await sleep(300);
  await toMenu(page);
  /* the reward moment, after play */
  let card = null;
  try { await waitFor(page, () => { const c = document.getElementById('sws-music-card'); return c && getComputedStyle(c).display !== 'none'; }, 3000); card = true; } catch (e) { card = false; }
  R.t(W + ' after a finished set the song card appears on the menu', card);
  if (card) {
    const list = await visible(page, CHROME);
    R.t(W + ' the card is the only floating thing, and it is a dialog', list.length === 1 && list[0].sel === '#sws-music-card' && (await page.evaluate(() => document.getElementById('sws-music-card').getAttribute('role'))) === 'dialog', describe(list));
    await tap(page, '#sws-music-later'); await sleep(400);
    await noChrome(page, 'menu after Later', W);
  }
  await tap(page, '#shopLink'); await sleep(500);
  await noChrome(page, 'shop', W);
  await toMenu(page);
  await startMode(page, 'endless');
  await noChrome(page, 'Endless level 1', W);
  await close(page);

  /* ---- a returning save: a new best is earned on the first lock ---- */
  page = await open(browser, { w, h, seed: { hues_rules: '1', 'hm.endless.best': '1', 'hm.diff': 'normal' } });
  await noChrome(page, 'returning menu at boot', W);
  await startMode(page, 'endless');
  await guess(page, 'close'); await tap(page, '#lockBtn');
  await waitFor(page, () => document.getElementById('breakdown').classList.contains('show'), 6000); await sleep(300);
  const toastUp = await visible(page, ['#toast.show']);
  R.t(W + ' a new best does not float over the review sheet', toastUp.length === 0, describe(toastUp));
  const inSheet = await page.evaluate(() => /new best/i.test(document.getElementById('breakdown').textContent));
  R.t(W + ' the new best is told inside the review', inSheet);
  await close(page);
}
await browser.close();
R.done();
