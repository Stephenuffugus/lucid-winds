/* The reveal gate (BUILD-PLAN.md T0.14, gate `reveal`): the develop reveal of DESIGN 5.2 from the sample room's tap.
 *   - no AudioContext before the first tap (SB_DEV.audioState() 'none'), exactly one after it, running or suspended;
 *   - the screen passes through reveal, then play; the marks measure hold, resolve and light up each within 50 ms of
 *     TUNING's 0.3, 0.8 and 0.5 s, and the tap to the hero's drop at most 1.6 s including the build;
 *   - the static layer is built once (SB_DEV.staticBuilds() === 1);
 *   - a second room, the reveal now seen, skips on a real tap; the first never does; after a reload (a new session)
 *     the first reveal skips too, the flag saved as onboarding.revealSeen (the M1 review);
 *   - with prefers-reduced-motion the transition completes under 0.6 s.
 * Watched red by STATIC_BUILT_TWICE, AUDIO_AT_LOAD, REVEAL_NO_SKIP, REVEAL_SEEN_NOT_SAVED and REVEAL_SEEN_NOT_LOADED. */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep } from './harness.mjs';

const R = reporter('REVEAL');
const srv = await serve();
const browser = await launch();
const T = { hold: 300, resolve: 800, light: 500 }, SLACK = 50;

async function waitPlay(page, ms) {
  const seen = [];
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const sc = await page.evaluate(() => window.SB_DEV.screen());
    if (seen[seen.length - 1] !== sc) seen.push(sc);
    if (sc === 'play') break;
    await sleep(10);
  }
  return seen;
}

try {
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base);
    await ready(page, { reveal: true });
    const before = await page.evaluate(() => [window.SB_DEV.audioState(), window.SB_DEV.audioMade()]);
    R.say(before[0] === 'none' && before[1] === 0, 'no AudioContext before the first tap (' + before.join(', ') + ')');
    await tap(page, '#sample');
    const seq = await waitPlay(page, 4000);
    const after = await page.evaluate(() => [window.SB_DEV.audioState(), window.SB_DEV.audioMade()]);
    R.say(after[1] === 1 && (after[0] === 'running' || after[0] === 'suspended'), 'exactly one AudioContext after the tap, ' + after[0] + ' (' + after[1] + ' made)');
    R.say(seq.includes('reveal') && seq[seq.length - 1] === 'play' && seq.indexOf('reveal') < seq.indexOf('play'), 'the screen passes through reveal, then play (' + seq.join(' to ') + ')');
    const m = await page.evaluate(() => window.SB_DEV.perf().reveal);
    /* a mark is the first frame at or past its beat; the beat fell inside the gap to the frame before, so each beat is
       held to 50 ms plus the gaps at its two ends (16 ms on a phone; swiftshader stalls up to 400 ms just after a room
       starts, with or without the reveal, measured T0.14) */
    const hold = m.hold - m.start, resolve = m.resolve - m.hold, light = m.end - m.resolve, total = m.end - m.start;
    R.say(Math.abs(hold - T.hold) <= SLACK + m.holdGap, 'the hold beat ' + hold.toFixed(0) + ' ms (300, within 50 + the frame gap ' + m.holdGap.toFixed(0) + '; the build ' + m.build.toFixed(1) + ' ms inside it)');
    R.say(Math.abs(resolve - T.resolve) <= SLACK + m.holdGap + m.resolveGap, 'the resolve beat ' + resolve.toFixed(0) + ' ms (800, within 50 + the gaps ' + m.holdGap.toFixed(0) + ' and ' + m.resolveGap.toFixed(0) + ')');
    R.say(Math.abs(light - T.light) <= SLACK + m.resolveGap + m.endGap, 'the light up beat ' + light.toFixed(0) + ' ms (500, within 50 + the gaps ' + m.resolveGap.toFixed(0) + ' and ' + m.endGap.toFixed(0) + ')');
    R.say(total <= 1600 + SLACK + m.endGap, 'the tap to the hero\'s drop ' + total.toFixed(0) + ' ms (at most 1.6 s, including the build, plus the last frame gap ' + m.endGap.toFixed(0) + ')');
    R.say(await page.evaluate(() => window.SB_DEV.staticBuilds()) === 1, 'the static layer is built once for the reveal and the play');
    R.say(m.skipped === false, 'the first reveal was not skipped');
    /* a second room: the reveal is seen, a real tap on the canvas skips it */
    await page.evaluate(() => window.SB_DEV.goto('title'));
    await tap(page, '#sample');
    await page.waitForFunction(() => window.SB_DEV.screen() === 'reveal', { timeout: 3000 }).catch(() => {});
    await sleep(100);
    const sc0 = await page.evaluate(() => window.SB_DEV.screen());
    const box = await page.evaluate(() => { const r = document.getElementById('view').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const f = await page.touchscreen.touchStart(box.x, box.y); await f.end();
    await sleep(80);
    const m2 = await page.evaluate(() => ({ s: window.SB_DEV.screen(), r: window.SB_DEV.perf().reveal, w: window.SB_DEV.lastInput() }));
    R.say(sc0 === 'reveal' && m2.s === 'play' && m2.r.skipped === true && m2.r.end - m2.r.start < 1000, 'a second room skips on a tap (the screen ' + sc0 + ' then ' + m2.s + ', ' + (m2.r.end - m2.r.start).toFixed(0) + ' ms)');
    /* a new session (the page reloaded): the reveal was seen and saved (onboarding.revealSeen), so its first reveal
       skips on a tap too (the M1 review: the flag lived for the session only) */
    await page.evaluate(() => window.SB.save.flush());
    await page.reload(); await ready(page, { reveal: true });
    await tap(page, '#sample');
    await page.waitForFunction(() => window.SB_DEV.screen() === 'reveal', { timeout: 3000 }).catch(() => {});
    await sleep(100);
    const sc1 = await page.evaluate(() => ({ s: window.SB_DEV.screen(), saved: JSON.parse(localStorage.getItem('shutterbug.v1')).onboarding.revealSeen }));
    const f2 = await page.touchscreen.touchStart(box.x, box.y); await f2.end();
    await sleep(80);
    const m3 = await page.evaluate(() => ({ s: window.SB_DEV.screen(), r: window.SB_DEV.perf().reveal }));
    R.say(sc1.saved === true && sc1.s === 'reveal' && m3.s === 'play' && m3.r.skipped === true, 'a new session skips its first reveal on a tap (saved ' + sc1.saved + ', the screen ' + sc1.s + ' then ' + m3.s + ')');
    R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  /* reduced motion: a crossfade */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await gotoGame(page, srv.base);
    await ready(page, { reveal: true });
    await tap(page, '#sample');
    await waitPlay(page, 3000);
    const m = await page.evaluate(() => window.SB_DEV.perf().reveal);
    R.say(m.reduced === true && m.end - m.start < 600, 'with reduced motion the transition completes in ' + (m.end - m.start).toFixed(0) + ' ms (under 600)');
    R.say(errors.length === 0, 'reduced motion: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
