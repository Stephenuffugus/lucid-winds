/* THE TINE, RENDERED AND MEASURED.
 *
 *   node test/tine.mjs
 *
 * ⛔ NOBODY HAS HEARD THIS. What a headless browser can say about a sound is
 * what the samples say: that there is energy where the note starts, that the
 * energy is still there a second later and smaller (a tine RINGS and DECAYS),
 * that a short tine at the top of the comb dies before a long one at the
 * bottom, and that fifteen at once do not clip. It cannot say whether it sounds
 * like a music box. That is docs/shots/p0-tine.wav and Stephen's ear.
 *
 * The engine is built on an OfflineAudioContext handed in by this file, which
 * is the whole reason buildAudio takes a context instead of reaching for one.
 */
import { serve, open, reporter } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base, { width: 375, height: 667 });
const { fails, say } = reporter();
const T = (fn, ...a) => page.evaluate(fn, ...a);

/* render notes into an offline context and hand back the numbers */
const render = (spec) => page.evaluate(async (spec) => {
  const SR = 44100;
  const ctx = new OfflineAudioContext(2, Math.round(SR * spec.seconds), SR);
  const A = window.WINDUP_TEST.buildAudio(ctx);
  for (const n of spec.notes) window.WINDUP_TEST.tine(A, n.row, n.at, n.index || 0);
  const buf = await ctx.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  const rms = (from, to) => {
    const a = Math.max(0, Math.round(from * SR)), b = Math.min(L.length, Math.round(to * SR));
    let s = 0;
    for (let i = a; i < b; i++) { const v = (L[i] + R[i]) / 2; s += v * v; }
    return b > a ? Math.sqrt(s / (b - a)) : 0;
  };
  let peak = 0;
  for (let i = 0; i < L.length; i++) {
    const v = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    if (v > peak) peak = v;
  }
  /* where the loudest 50 ms window is, and where it has fallen to a tenth */
  const win = Math.round(SR * 0.05);
  let best = 0, bestAt = 0;
  for (let i = 0; i + win < L.length; i += win) {
    const r = rms(i / SR, (i + win) / SR);
    if (r > best) { best = r; bestAt = i / SR; }
  }
  let tenthAt = spec.seconds;
  for (let t = bestAt; t < spec.seconds - 0.05; t += 0.02) {
    if (rms(t, t + 0.05) < best * 0.1) { tenthAt = t; break; }
  }
  return { peak, best, bestAt, tenthAt, made: A.made, voices: A.voices.length,
    first: rms(0, 0.05), at1_2: rms(1.2, 1.3), at0_2: rms(0.2, 0.3) };
}, spec);

try {
  say(await T(() => typeof window.WINDUP_TEST.buildAudio === 'function'),
    'the engine can be built on a context this file hands it');

  /* ---- one middle C ---- */
  const c4 = await render({ seconds: 2.6, notes: [{ row: 0, at: 0.01, index: 0 }] });
  const db = 20 * Math.log10(Math.max(1e-9, c4.first));
  say(db > -30, 'a middle C has real energy in its first fifty milliseconds ('
    + db.toFixed(1) + ' dBFS)');
  const ratio = c4.at1_2 / Math.max(1e-9, c4.best);
  say(ratio > 0.05 && ratio < 0.30,
    'and at one and a fifth seconds it is still ringing and well down ('
    + (ratio * 100).toFixed(1) + ' percent of its loudest window)');
  say(c4.peak < 0.99, 'one note does not clip (' + c4.peak.toFixed(3) + ')');
  say(c4.bestAt < 0.2, 'and it is loudest at the start, the way a plucked bar is ('
    + c4.bestAt.toFixed(2) + ' s)');

  /* ---- the comb is a comb: short bars die first ---- */
  const low = await render({ seconds: 3.2, notes: [{ row: 0, at: 0.01 }] });
  const high = await render({ seconds: 3.2, notes: [{ row: 14, at: 0.01 }] });
  say(high.tenthAt < low.tenthAt,
    'the top of the comb dies before the bottom (' + high.tenthAt.toFixed(2)
    + ' s against ' + low.tenthAt.toFixed(2) + ' s to a tenth)');
  const want = await T(() => ({ lo: window.WINDUP_TEST.sim().decayFor(0),
    hi: window.WINDUP_TEST.sim().decayFor(14) }));
  say(Math.abs((low.tenthAt - high.tenthAt) - (want.lo - want.hi)) < 0.9,
    'and the difference is about the one the config asks for (heard '
    + (low.tenthAt - high.tenthAt).toFixed(2) + ' s, asked '
    + (want.lo - want.hi).toFixed(2) + ' s)');

  /* ---- fifteen at once, which is one hole in every row ---- */
  const chord = await render({
    seconds: 3, notes: Array.from({ length: 15 }, (_, r) => ({ row: r, at: 0.01, index: r }))
  });
  say(chord.peak < 0.99, 'fifteen tines at once do not clip (' + chord.peak.toFixed(3) + ')');
  say(chord.peak > 0.2, 'and they are not silent either (' + chord.peak.toFixed(3) + ')');

  /* ---- the voice count is bounded ---- */
  const many = await T(async () => {
    const SR = 22050;
    const ctx = new OfflineAudioContext(1, SR * 4, SR);
    const A = window.WINDUP_TEST.buildAudio(ctx);
    let most = 0;
    for (let i = 0; i < 200; i++) {
      window.WINDUP_TEST.tine(A, i % 15, 0.01 + i * 0.005, i);
      if (A.voices.length > most) most = A.voices.length;
    }
    await ctx.startRendering();
    return { most, cap: window.WINDUP_TEST.config().VOICES_MAX };
  });
  say(many.most <= many.cap,
    'two hundred notes in a second never leave more than ' + many.cap
    + ' tines ringing at once (' + many.most + ')');

  /* ---- a bar of Twinkle, which is the thing a person will actually hear ---- */
  const bar = await T(async () => {
    const S = window.WINDUP_TEST.sim();
    const strip = S.newStrip(S.STARTERS.twinkle);
    const per = 60 / window.WINDUP_TEST.config().AUTO_BPM / 2;
    const SR = 44100, secs = 6;
    const ctx = new OfflineAudioContext(2, SR * secs, SR);
    const A = window.WINDUP_TEST.buildAudio(ctx);
    let n = 0;
    for (let i = 0; i < strip.holes.length; i++) {
      const t = 0.02 + strip.holes[i][0] * per;
      if (t > secs - 0.2) break;
      window.WINDUP_TEST.tine(A, strip.holes[i][1], t, i);
      n++;
    }
    const buf = await ctx.startRendering();
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    let peak = 0, sum = 0, quiet = 0;
    const win = Math.round(SR * 0.1);
    for (let i = 0; i < L.length; i++) {
      const v = Math.max(Math.abs(L[i]), Math.abs(R[i]));
      if (v > peak) peak = v;
      sum += v * v;
    }
    for (let i = 0; i + win < L.length; i += win) {
      let s = 0;
      for (let k = i; k < i + win; k++) s += L[k] * L[k];
      if (Math.sqrt(s / win) < 0.0005) quiet++;
    }
    return { peak, rms: Math.sqrt(sum / L.length), notes: n, quietWindows: quiet,
      windows: Math.floor(L.length / win) };
  });
  say(bar.notes > 8, 'the first seconds of Twinkle put real notes on the paper (' + bar.notes + ')');
  say(bar.peak < 0.99, 'and the tune does not clip (' + bar.peak.toFixed(3) + ')');
  say(bar.rms > 0.01, 'and it is not a whisper (rms ' + bar.rms.toFixed(4) + ')');
  say(bar.quietWindows < bar.windows * 0.35,
    'and it is not mostly silence (' + bar.quietWindows + ' quiet windows of ' + bar.windows + ')');

  /* ---- THE AUTO PLAY THROUGH A STALL ----
     The scheduler is driven with a clock this file owns, against an offline
     context: a 25 ms tick from 0 to the end, with one hole of 200 ms in the
     ticks at one second where a slow phone dropped its frames. Every hole must
     be given to the audio clock (none dropped), every note must sit on the
     strip's own grid within 5 ms (none late), and no two must be squeezed
     closer than the strip put them (none bunched). Rendered, the buffer must
     rise at each grid time. `--legacy` drives the old per frame advance through
     the same stall and this assertion must go red on it. */
  const legacy = process.argv.includes('--legacy');
  const auto = await page.evaluate(async (legacy) => {
    const SR = 44100;
    const S = window.WINDUP_TEST.sim();
    const per = 60 / window.WINDUP_TEST.config().AUTO_BPM / 2;
    const strip = S.newStrip(S.STARTERS.twinkle);
    const holes = strip.holes.slice().sort((a, b) => a[0] - b[0]);
    const last = holes[holes.length - 1][0];
    const secs = Math.min(9, 0.06 + (last + 2) * per);
    const ctx = new OfflineAudioContext(2, Math.round(SR * secs), SR);
    const A = window.WINDUP_TEST.buildAudio(ctx);
    const T0 = 0.06;
    const log = [];
    if (!legacy) {
      window.WINDUP_TEST.auto.begin(A, strip, 0, 0);
      for (let now = 0; now < secs; now += 0.025) {
        if (now >= 1.0 && now < 1.2) continue;               /* the stall */
        window.WINDUP_TEST.auto.fill(A, strip, now, 0.1);
      }
      for (const w of window.WINDUP_TEST.auto.state().log) log.push(w);
    } else {
      /* the old algorithm: paper advanced by the frame's dt, clamped at 120,
         each crossed hole scheduled a fraction of that frame after now */
      let play = 0, now = T0;
      const frames = [];
      for (let t = T0; t < secs; t += 0.016) frames.push((t >= 1.0 && t < 1.2) ? 0 : 0.016);
      let stalled = 0;
      for (const dt of frames) {
        if (dt === 0) { stalled += 0.016; continue; }
        const d = Math.min(0.12, dt + stalled); stalled = 0;
        now += dt + (d > dt ? d - dt : 0);
        const from = play; play += d / per;
        for (let i = 0; i < holes.length; i++) {
          const st = holes[i][0];
          if (st <= from || st > play) continue;
          const frac = (st - from) / (play - from);
          const when = now + frac * d;
          log.push(when);
          window.WINDUP_TEST.tine(A, holes[i][1], when, i);
        }
      }
    }
    const buf = await ctx.startRendering();
    const L = buf.getChannelData(0);
    const energy = (a, b) => {
      let s = 0; const i0 = Math.max(0, Math.round(a * SR)), i1 = Math.min(L.length, Math.round(b * SR));
      for (let i = i0; i < i1; i++) s += L[i] * L[i];
      return i1 > i0 ? s / (i1 - i0) : 0;
    };
    const steps = [...new Set(holes.map(h => h[0]))];
    let onGrid = 0, rises = 0, worst = 0;
    for (const st of steps) {
      const t = T0 + st * per;
      const near = log.filter(w => Math.abs(w - t) < per * 0.45);
      const err = near.length ? Math.min(...near.map(w => Math.abs(w - t))) : per;
      if (err > worst) worst = err;
      if (err <= 0.005) onGrid++;
      if (energy(t, t + 0.02) > 3 * energy(t - 0.02, t)) rises++;
    }
    const sorted = log.slice().sort((a, b) => a - b);
    let bunched = 0;
    for (let i = 1; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] > 1e-6 && sorted[i] - sorted[i - 1] < per * 0.6) bunched++;
    return { holes: holes.length, scheduled: log.length, steps: steps.length, onGrid, rises, bunched, worst };
  }, legacy);
  say(auto.scheduled === auto.holes, 'through a 200 ms stall the auto play hands every hole to the audio clock ('
    + auto.scheduled + ' of ' + auto.holes + ')');
  say(auto.onGrid === auto.steps, 'every one on the strip grid within 5 ms (' + auto.onGrid + ' of ' + auto.steps
    + ', worst ' + (auto.worst * 1000).toFixed(0) + ' ms)');
  say(auto.bunched === 0, 'none squeezed closer than the strip put them (' + auto.bunched + ' bunched)');
  say(auto.rises === auto.steps, 'and the rendered buffer rises at every grid time (' + auto.rises + ' of ' + auto.steps + ')');

  say(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
} finally {
  await browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' TINE FAILURE(S)'); process.exit(1); }
console.log('TINE OK');
