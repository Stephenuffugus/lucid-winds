/* THE HUM, RENDERED AND MEASURED.
 *
 *   node test/sound.mjs
 *
 * ⛔ NOBODY HAS HEARD THIS. What a headless browser can say about a sound is
 * what the samples say: that a rig set to a fifth hums a fifth, that the render
 * has energy in it, that the hum dies with the swing, and that the toggle turned
 * off leaves silence. Whether it is a pleasant noise to draw to is Stephen's ear.
 *
 * The engine is built on an OfflineAudioContext handed in by this file, which is
 * the whole reason buildSound takes a context instead of reaching for one.
 */
import { serve, open, reporter, waitFrames, tap } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base, { width: 375, height: 667 });
const { fails, say } = reporter();
const T = (fn, ...a) => page.evaluate(fn, ...a);

/* render a throw's hum offline and measure it */
const render = (lengths, seconds, mute) => page.evaluate(async (lengths, seconds, mute) => {
  const SR = 22050;
  const ctx = new OfflineAudioContext(1, Math.round(SR * seconds), SR);
  const S = window.INKSWING_TEST.sim();
  const A = window.INKSWING_TEST.buildSound(ctx);
  const sh = S.newSheet({ rig: 'crossed', lengths: lengths });
  const thr = S.flingToThrow(sh, { x: 260, y: 200 }, { x: -400, y: 520 }, 0, 'irongall');
  sh.throws.push(thr);
  const hz = window.INKSWING_TEST.hum(A, thr);
  A.master.gain.value = mute ? 0 : 1;
  const buf = await ctx.startRendering();
  const d = buf.getChannelData(0);
  let peak = 0, sum = 0;
  for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; sum += d[i] * d[i]; }
  /* the pitch actually in there, by autocorrelation over a window */
  const pitch = (from, secs) => {
    const a = Math.round(from * SR), n = Math.round(secs * SR);
    const lo = Math.round(SR / 900), hi = Math.round(SR / 60);
    let best = 0, lag = lo;
    for (let L = lo; L <= hi; L++) {
      let s = 0;
      for (let i = 0; i < n - L; i += 2) s += d[a + i] * d[a + i + L];
      if (s > best) { best = s; lag = L; }
    }
    return SR / lag;
  };
  return { hz, peak, rms: Math.sqrt(sum / d.length), heard: pitch(0.3, 0.4) };
}, lengths, seconds, mute);

try {
  say(await T(() => typeof window.INKSWING_TEST.buildSound === 'function'),
    'the hum can be built on a context this file hands it');

  /* ---- a fifth hums a fifth ---- */
  const fifth = await render([12, 19], 1.5, false);
  const ratio = Math.max(fifth.hz[0], fifth.hz[1]) / Math.min(fifth.hz[0], fifth.hz[1]);
  say(Math.abs(ratio - 1.5) / 1.5 < 0.01,
    'a rig set to a fifth hums two notes a fifth apart (' + fifth.hz[0].toFixed(1) + ' and '
    + fifth.hz[1].toFixed(1) + ' hertz, a ratio of ' + ratio.toFixed(4) + ')');
  say(fifth.peak > 0.01, 'and there is a sound there (peak ' + fifth.peak.toFixed(4) + ')');
  say(fifth.rms > 0.005, 'and it is not a click (rms ' + fifth.rms.toFixed(4) + ')');
  say(fifth.peak < 0.99, 'and it does not clip (' + fifth.peak.toFixed(3) + ')');
  const low = Math.min(fifth.hz[0], fifth.hz[1]);
  say(Math.abs(fifth.heard - low) / low < 0.06 || Math.abs(fifth.heard - low / 2) / (low / 2) < 0.06,
    'and the note that comes out is the one the rig was set to ('
    + fifth.heard.toFixed(1) + ' hertz against ' + low.toFixed(1) + ')');

  /* ---- an octave hums an octave ---- */
  const oct = await render([12, 24], 1.2, false);
  const r2 = Math.max(oct.hz[0], oct.hz[1]) / Math.min(oct.hz[0], oct.hz[1]);
  say(Math.abs(r2 - 2) / 2 < 0.01, 'and an octave hums an octave (' + r2.toFixed(4) + ')');

  /* ⛔ THE TOGGLE OFF IS SILENCE, not a quiet noise. */
  const muted = await render([12, 19], 1.2, true);
  say(muted.peak < 1e-4, 'with the hum turned off the render is silent (peak '
    + muted.peak.toExponential(1) + ')');

  /* ⛔ THE NEXT TWO GO THROUGH THE GAME, NOT THROUGH THIS FILE. Written as an
     offline render that scheduled its own decay and set its own master to zero,
     they passed with the page's fade and the page's sound toggle both deleted:
     they were tests of the test. The hum has to die because soundTick faded it
     and the silence has to come from the toggle. */

  /* ---- and in the page: no engine before a gesture ---- */  /* ---- and in the page: no engine before a gesture ---- */
  say((await T(() => window.INKSWING_TEST.sound().open)) === false,
    'nothing opens an audio engine before a gesture');
  await T(() => {
    const S = window.INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'crossed', lengths: [12, 19] });
    sh.throws.push(S.flingToThrow(sh, { x: 260, y: 200 }, { x: -400, y: 520 }, 0, 'irongall'));
    window.INKSWING_TEST.loadSheet(sh);
    window.INKSWING_TEST.soundStart();
  });
  await waitFrames(page, 3);
  const live = await T(() => window.INKSWING_TEST.sound());
  say(live.open && live.voices === 2, 'a throw starts two hums (' + live.voices + ')');
  const liveRatio = Math.max(live.hz[0], live.hz[1]) / Math.min(live.hz[0], live.hz[1]);
  say(Math.abs(liveRatio - 1.5) / 1.5 < 0.01,
    'and they are the interval the rig is set to (' + liveRatio.toFixed(4) + ')');
  /* the hum has to fade because the SWING faded, and the page is what does it */
  const loud = await T(() => window.INKSWING_TEST.sound().master);
  /* ⛔ far enough along that the answer is not a race with a ramp. A brass bob
     loses about two thirds of its swing in eighty five seconds, and the gain
     ramp settles in half of one. */
  await T(() => { window.INKSWING_TEST.state().drawing = true; window.INKSWING_TEST.advance(85); });
  await new Promise(r => setTimeout(r, 900));
  await waitFrames(page, 4);
  const faded = await T(() => window.INKSWING_TEST.sound().master);
  say(faded < 0.6 && faded < loud * 0.75,
    'and by the end of the drawing the hum has faded with the swing ('
    + loud.toFixed(3) + ' to ' + faded.toFixed(3) + ')');
  say(faded > 0, 'without ever quite stopping while the pendulum still moves ('
    + faded.toExponential(1) + ')');
  await T(() => window.INKSWING_TEST.soundStop());
  await waitFrames(page, 6);
  say((await T(() => window.INKSWING_TEST.sound().voices)) === 0, 'and stopping stops them');

  /* ⛔ AND THE TOGGLE, THROUGH THE GAME. With the hum switched off in the menu,
     a throw must not build an engine at all. */
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.INKSWING_TEST && window.INKSWING_TEST.frames() > 2, { timeout: 30000 });
  await T(() => {
    document.getElementById('btnMenu').click();
    document.getElementById('btnSound').click();
    document.getElementById('btnMenuClose').click();
  });
  await waitFrames(page, 3);
  say((await T(() => window.INKSWING_TEST.settings().sound)) === 0, 'the menu turns the hum off');
  await T(() => {
    const S = window.INKSWING_TEST.sim();
    const sh = S.newSheet({ rig: 'crossed', lengths: [12, 19] });
    sh.throws.push(S.flingToThrow(sh, { x: 260, y: 200 }, { x: -400, y: 520 }, 0, 'irongall'));
    window.INKSWING_TEST.loadSheet(sh);
    window.INKSWING_TEST.soundStart();
  });
  await waitFrames(page, 4);
  const off = await T(() => window.INKSWING_TEST.sound());
  say(off.open === false && off.voices === 0,
    'and then a throw makes no sound at all, and no engine to make one with');

  say(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
} finally {
  await browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' SOUND FAILURE(S)'); process.exit(1); }
console.log('SOUND OK');
