/* Every sound the game can make, rendered and MEASURED.
 *
 *   node test/sound.mjs
 *
 * ⛔ A GATE THAT COUNTS CALLS TO play() IS A TEST OF THE GATE. Windup's scar
 * and Inkswing's: two of its sound assertions passed with the code under them
 * deleted, because they scheduled their own notes. This one swaps the game's
 * own audio context for an OfflineAudioContext, calls the game's own play(),
 * renders the result and looks at the samples. A cue that makes silence fails.
 *
 * What it asserts, each watched to fail:
 *   1. every cue in the game makes an audible sound
 *   2. the whistle really is two hoots a fourth apart, measured out of the
 *      rendered samples rather than read off the source
 *   3. the loop chime rises rather than falls, because a falling chime reads as
 *      a mistake and a rising one reads as a reward
 *   4. the clonk is low and the klk is high, so a bump and a snap can be told
 *      apart with the phone in a pocket
 *   5. the clickety clack is budgeted: three trains at full speed cannot make
 *      more taps per second than the budget allows
 *
 * ⛔⛔ THE GAME KEEPS PLAYING WHILE YOU RECORD. This gate swaps the game's audio
 * context for an offline one and then AWAITS the render, and the game does not
 * stop for that: the title screen runs a demo layout, its trains clack over
 * every joint, and every one of those clacks was landing in the buffer being
 * measured, because the context they were being scheduled onto was the offline
 * one. The cow measured 375 Hz alone and 501 Hz inside the suite off the same
 * three oscillators, and 400 is where the assertion sits. So every capture
 * below puts a DOOR on play() first: only the cue being recorded goes through,
 * and everything the game plays into the microphone is dropped on the floor.
 * Found on the last run of the night by refusing to bank two green reruns.
 */
import { serve, open, reporter, waitFrames, tap } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();

const { browser, page, errors } = await open(s.base, { width: 667, height: 375, deviceScaleFactor: 1 });
await waitFrames(page, 2);

/* render one cue through the game's own AUDIO object into an offline context */
const CUES = ['klk', 'set', 'chime', 'whistle', 'clack', 'couple', 'bell', 'clonk', 'huff',
  'flip', 'bump', 'click', 'moo'];
const rendered = await page.evaluate(async (cues) => {
  const A = WHISTLESTOP_TEST.audio();
  const realPlay = A.play;
  const out = {};
  for (const id of cues) {
    /* ⛔ the door: only the cue being recorded reaches the offline context */
    A.play = function (pid) { if (pid !== id) return; return realPlay.call(this, pid); };
    const off = new OfflineAudioContext(1, 44100 * 1.6, 44100);
    const keepCtx = A.ctx, keepMaster = A.master, keepOn = A.on;
    A.ctx = off;
    A.master = off.createGain();
    A.master.gain.value = 1;
    A.master.connect(off.destination);
    A.on = true;
    A.play(id);
    const buf = await off.startRendering();
    A.ctx = keepCtx; A.master = keepMaster; A.on = keepOn; A.play = realPlay;
    const d = buf.getChannelData(0);
    let peak = 0, sum = 0;
    for (let i = 0; i < d.length; i++) {
      const v = d[i];
      if (Math.abs(v) > peak) peak = Math.abs(v);
      sum += v * v;
    }
    let first = -1, lastOn = -1;
    for (let i = 0; i < d.length; i++) {
      if (Math.abs(d[i]) > peak * 0.08) { if (first < 0) first = i; lastOn = i; }
    }
    const span = Math.max(1, lastOn - first);
    /* ⛔ NOT ZERO CROSSINGS. The first draft of this gate counted sign changes
       above a fixed floor and reported a 660 Hz hoot as 186 crossings a second
       and a low thud as none at all, because the samples either side of a
       crossing fall under any fixed floor. A bank of Goertzel bins asks the
       render where its energy actually is, which is the question. */
    const BINS = [90, 160, 280, 480, 820, 1400, 2400, 4100, 6800];
    const a0 = Math.max(0, first), a1 = Math.min(d.length, first + Math.min(span, 22050));
    const spec = BINS.map(f => {
      let re = 0, im = 0;
      for (let i = a0; i < a1; i++) {
        const t = i / 44100;
        re += d[i] * Math.cos(2 * Math.PI * f * t);
        im += d[i] * Math.sin(2 * Math.PI * f * t);
      }
      return Math.sqrt(re * re + im * im) / Math.max(1, a1 - a0);
    });
    let top = 0;
    for (let i = 1; i < spec.length; i++) if (spec[i] > spec[top]) top = i;
    /* the centre of gravity of the spectrum, which is what "high" and "low"
       actually mean to an ear */
    let num = 0, den = 0;
    for (let i = 0; i < BINS.length; i++) { num += BINS[i] * spec[i]; den += spec[i]; }
    out[id] = { peak, rms: Math.sqrt(sum / d.length), ms: span / 44.1,
      startMs: first / 44.1, top: BINS[top], centre: den > 0 ? num / den : 0 };
  }
  return out;
}, CUES);

for (const id of CUES) {
  const r = rendered[id];
  say(r && r.peak > 0.01, 'the ' + id + ' makes a sound (peak ' + (r ? r.peak.toFixed(3) : '?')
    + ', ' + (r ? r.ms.toFixed(0) : '?') + ' ms)');
}

/* ---- the whistle, measured ---- */
/* two sines a fourth apart at 660 and 880 beat at 220 Hz and their zero
   crossing rate sits between the two: this asserts the RENDER, not the source */
const w = rendered.whistle;
say(w.top >= 480 && w.top <= 1400, 'the whistle sounds in the register a wooden hoot sits in (loudest bin '
  + w.top + ' Hz, centre of gravity ' + w.centre.toFixed(0) + ' Hz)');
say(w.ms > 280, 'and it lasts long enough to be a hoot rather than a beep (' + w.ms.toFixed(0) + ' ms)');
const partials = await page.evaluate(async () => {
  /* the two tones, found by correlating the render against 660 and 880 Hz */
  const A = WHISTLESTOP_TEST.audio();
  const off = new OfflineAudioContext(1, 44100, 44100);
  const k = { ctx: A.ctx, m: A.master, on: A.on, p: A.play };
  A.ctx = off; A.master = off.createGain(); A.master.gain.value = 1;
  A.master.connect(off.destination); A.on = true;
  /* ⛔ the door, again: the demo layout is clacking while this renders */
  A.play = function (pid) { if (pid !== 'whistle') return; return k.p.call(this, pid); };
  A.play('whistle');
  const buf = await off.startRendering();
  A.ctx = k.ctx; A.master = k.m; A.on = k.on; A.play = k.p;
  const d = buf.getChannelData(0);
  const power = (f) => {
    let re = 0, im = 0;
    for (let i = 2000; i < 14000; i++) {
      const t = i / 44100;
      re += d[i] * Math.cos(2 * Math.PI * f * t);
      im += d[i] * Math.sin(2 * Math.PI * f * t);
    }
    return Math.sqrt(re * re + im * im) / 12000;
  };
  return { f660: power(660), f880: power(880), f770: power(770), f1320: power(1320) };
});
say(partials.f660 > 0.004 && partials.f880 > 0.004,
  'and both of its notes are really in there (660 Hz ' + partials.f660.toFixed(4)
  + ', 880 Hz ' + partials.f880.toFixed(4) + ')');
say(partials.f660 > partials.f770 * 1.6 && partials.f880 > partials.f770 * 1.6,
  'and they are two notes a fourth apart, not one note in between (770 Hz '
  + partials.f770.toFixed(4) + ')');

/* ---- the chime rises ---- */
const chime = await page.evaluate(async () => {
  const A = WHISTLESTOP_TEST.audio();
  const off = new OfflineAudioContext(1, 44100, 44100);
  const k = { ctx: A.ctx, m: A.master, on: A.on, p: A.play };
  A.ctx = off; A.master = off.createGain(); A.master.gain.value = 1;
  A.master.connect(off.destination); A.on = true;
  /* ⛔ the door, again: the demo layout is clacking while this renders */
  A.play = function (pid) { if (pid !== 'chime') return; return k.p.call(this, pid); };
  A.play('chime');
  const buf = await off.startRendering();
  A.ctx = k.ctx; A.master = k.m; A.on = k.on; A.play = k.p;
  const d = buf.getChannelData(0);
  const power = (f, a, b) => {
    let re = 0, im = 0;
    for (let i = a; i < b; i++) {
      const t = i / 44100;
      re += d[i] * Math.cos(2 * Math.PI * f * t);
      im += d[i] * Math.sin(2 * Math.PI * f * t);
    }
    return Math.sqrt(re * re + im * im) / (b - a);
  };
  /* the third note is the top of the triad: it should be strongest late */
  return { earlyLow: power(523.25, 500, 3500), lateHigh: power(783.99, 10000, 16000),
    earlyHigh: power(783.99, 500, 3000) };
});
say(chime.lateHigh > chime.earlyHigh * 1.5,
  'the loop chime RISES: its top note arrives after its bottom one (early '
  + chime.earlyHigh.toFixed(5) + ', late ' + chime.lateHigh.toFixed(5) + ')');

/* ---- a bump and a snap can be told apart ---- */
say(rendered.clonk.centre < rendered.klk.centre * 0.5,
  'a bump is low and a snap is high, so they are not the same event to an ear ('
  + rendered.clonk.centre.toFixed(0) + ' Hz against ' + rendered.klk.centre.toFixed(0) + ' Hz)');
say(rendered.bell.centre > rendered.bump.centre * 2,
  'and a station bell is nothing like a buffer (' + rendered.bell.centre.toFixed(0)
  + ' Hz against ' + rendered.bump.centre.toFixed(0) + ' Hz)');
say(rendered.moo.centre < 400, 'and a cow is the lowest thing on the rug ('
  + rendered.moo.centre.toFixed(0) + ' Hz)');

/* ---- the clickety clack is budgeted ---- */
/* ⛔ a real press first, because the engine is opened inside pointerdown and
   without one clackFor returns before it counts anything, which is how the
   first run of this gate reported a budget of nought and passed the ceiling */
await tap(page, '#btnWhistle');
await waitFrames(page, 2);
const budget = await page.evaluate(() => {
  WHISTLESTOP_TEST.sandbox(0);
  WHISTLESTOP_TEST.buildOps([['at', 4.4, 2.4, 0], ['rep', 2, 'straight'], ['rep', 4, 'curveR'],
    ['rep', 2, 'straight'], ['rep', 4, 'curveR']]);
  const S = WHISTLESTOP_TEST.state();
  WHISTLESTOP_TEST.addTrain('red', S.g.edges[0].id, 0, 6);
  WHISTLESTOP_TEST.addTrain('blue', S.g.edges[4].id, 0, 6);
  WHISTLESTOP_TEST.addTrain('green', S.g.edges[8].id, 0, 6);
  for (const t of S.trains) t.speedIx = 3;
  WHISTLESTOP_TEST.clearEvents();
  const A = WHISTLESTOP_TEST.audio();
  /* one whole second of three full trains at full speed */
  for (let i = 0; i < 60; i++) A.clackFor(3 * 7 * 2, 3.6, 1 / 60);
  return WHISTLESTOP_TEST.events().filter(e => e === 'clack').length;
});
say(budget > 0, 'three trains at full speed do clack (' + budget + ' in a second)');
say(budget <= 180, 'and the clack is budgeted, not one tap per bogie per sleeper ('
  + budget + ' in a second)');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
if (fails.length) { console.log('\n' + fails.length + ' SOUND FAILURE(S)'); process.exit(1); }
console.log('\nSOUND OK');
