/* HUSH, the page (plans/hush/HANDOFF-HUSH.md P1): STEP, the approach and the settle.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands. A trial: the creature half hidden in the grass for
 * the gap; a pose (grazing, or its head raised) shown for the duration CORE's schedule times on animation frames (S1); on the
 * hide frame the grass settles back over it (S3). A step is a press on the stone or Space, timed from the pose's paint (S2),
 * counted from paint to hide and 150 ms after; a step in the gap is ignored. A hit or Careful's freeze brings the creature a
 * step nearer (a soft step); a false alarm is one step back and a dry snap, nothing else (H4); a miss is nothing at all (H9).
 * At eighteen steps the creature lifts its head, looks out, holds two seconds and settles.
 */
import { settings, tokens, audio, SETTINGS_DEFAULTS, rng, schedule } from '../math/core/core.js?v=20260916d';
import { dealRun, scoreTrial, stepsDelta, approach, tierOf, settled, adaptAxes, GRACE_MS } from './engine.js?v=20260916d';
import { COPY, PALETTE_TOKENS } from './content.js?v=20260916d';
import { buildCreatures, creaturesBuilt, fitClearing, drawClearing, drawCreature, stonePicture, doorPicture } from './render.js?v=20260916d';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
/* P1 reads its link directly; the teacher's link builder entry and config.js come in P3 (docs/DECISIONS.md) */
const Q = new URLSearchParams(location.search);
const SEED = /^\d+$/.test(Q.get('seed') || '') ? Number(Q.get('seed')) : Math.floor(Math.random() * 1e9);
const RUN = ['40', '60', '80'].indexOf(Q.get('count')) >= 0 ? Number(Q.get('count')) : 40;
const FORK = Q.get('fork') === 'quick' ? 'quick' : 'careful';
const SETTLE_HOLD = 2000, AFTER_SETTLE = 600;

audio.define({
  /* a soft step on the grass */
  step: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(190, t);
      o.frequency.exponentialRampToValueAtTime(110, t + 0.12);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.18);
    }
  },
  /* a dry leaf snap on a false alarm: short, soft, not an alarm (H4) */
  snap: {
    build(ac, out, t) {
      const len = Math.floor(ac.sampleRate * 0.05), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = buf; f.type = 'lowpass'; f.frequency.setValueAtTime(1800, t);
      g.gain.setValueAtTime(0.12, t);
      s.connect(f); f.connect(g); g.connect(out);
      s.start(t); s.stop(t + 0.06);
    }
  },
  /* the settle's breath */
  breath: {
    build(ac, out, t) {
      const len = Math.floor(ac.sampleRate * 1.2), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = buf; f.type = 'lowpass'; f.frequency.setValueAtTime(600, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      s.connect(f); f.connect(g); g.connect(out);
      s.start(t); s.stop(t + 1.2);
    }
  }
});
/* ⛔ YONDER's scar: a sound from inside a frame must never end the trial */
function sound(name) {
  try { audio.play(name); } catch (e) { /* no sound on this device; the trial goes on */ }
}

tokens.inject(PALETTE_TOKENS);
const panel = settings.mount({ gameId: 'hush', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

const el = id => document.getElementById(id);
const canvas = el('clearing'), stone = el('stone'), nextBtn = el('next');
canvas.setAttribute('role', 'img');
canvas.setAttribute('aria-label', COPY.clearing);
stone.setAttribute('aria-label', COPY.step);
stone.append(stonePicture());
nextBtn.setAttribute('aria-label', COPY.go);
el('start').setAttribute('aria-label', COPY.startStep);
el('start').append(doorPicture());
/* every tier and pose drawn before anything can start (the decode stall law) */
buildCreatures();

/* a wait on animation frames against a measured deadline, never a timer (S1) */
const waitMs = ms => new Promise(resolve => { const t0 = performance.now(); const tick = t => (t - t0 >= ms ? resolve(t) : requestAnimationFrame(tick)); requestAnimationFrame(tick); });
/* the no-go pose for a cue similarity: the nearest of the three drawn (3.3) */
const noGoPose = s => (s < 0.25 ? 'up' : s < 0.75 ? 'half' : 'ear');

const r = rng(SEED >>> 0);
const runs = [], trials = [];
let steps = 0, phase = 'idle', run = [], runIndex = -1, trialIndex = -1, live = null, byKey = false;

function paint(pose, hidden) {
  const { ctx, W, H } = fitClearing(canvas);
  drawClearing(ctx, W, H);
  drawCreature(ctx, W, H, tierOf(steps), pose, hidden);
}

/* a step from the stone or Space: only the first inside a live trial's window counts; any other is ignored */
function step(at) {
  if (!live || live.stepAt !== null) return;
  if (live.paintedAt === null || at < live.paintedAt) return;
  if (live.hiddenAt !== null && at > live.hiddenAt + GRACE_MS) return;
  live.stepAt = at;
}

/* one trial, one sound: a soft step when the creature came nearer, a dry snap on a false alarm, nothing on a miss (H4, H9) */
function voice(outcome, before) {
  if (steps > before) sound('step');
  else if (outcome === 'falseAlarm') sound('snap');
}

async function playRun() {
  runIndex++;
  const axes = adaptAxes(runs, FORK);
  run = dealRun(r, { n: RUN, level: axes.ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' });
  const outcomes = [];
  nextBtn.hidden = true;
  for (trialIndex = 0; trialIndex < run.length; trialIndex++) {
    const t = run[trialIndex], pose = t.type === 'go' ? 'graze' : noGoPose(axes.cueSimilarity);
    phase = 'gap';
    paint('graze', true);
    await waitMs(t.gapMs);
    live = { run: runIndex, i: trialIndex, type: t.type, pose, durationMs: axes.durationMs, gapMs: t.gapMs, paintedAt: null, hiddenAt: null, stepAt: null, tier: tierOf(steps) };
    phase = 'pose';
    const res = await schedule.flash({
      durationMs: axes.durationMs,
      onShow: () => paint(pose, false),
      onPainted: at => { live.paintedAt = at; },
      onHide: () => paint('graze', true),
      onMasked: () => { phase = 'grace'; }
    });
    live.hiddenAt = res.hiddenAt;
    await waitMs(GRACE_MS);
    const s = scoreTrial(live);
    const before = steps;
    steps = approach(steps, stepsDelta(s.outcome, FORK));
    voice(s.outcome, before);
    const record = Object.assign({}, live, { outcome: s.outcome, rtMs: s.rtMs, stepsAfter: steps, shownMs: res.hiddenAt - res.shownAt, requestedAt: res.requestedAt });
    trials.push(record);
    outcomes.push({ type: t.type, outcome: s.outcome });
    live = null;
    if (settled(steps)) break;
  }
  runs.push(outcomes);
  if (settled(steps)) await settle();
  else { phase = 'rest'; paint('graze', true); }
  nextBtn.hidden = false;
  if (byKey) nextBtn.focus();
}

/* the settle (section 6): the head lifts, the creature looks out and holds two seconds, then settles and stays */
async function settle() {
  phase = 'settle';
  paint('up', false);
  sound('breath');
  await waitMs(SETTLE_HOLD);
  paint('graze', false);
  await waitMs(AFTER_SETTLE);
  phase = 'settled';
}

function next() {
  if (phase !== 'rest' && phase !== 'settled') return;
  if (phase === 'settled') steps = 0;
  playRun();
}

function begin() {
  el('first').hidden = true;
  playRun();
}

window.addEventListener('keydown', e => {
  byKey = true;
  /* Space steps once the first screen is gone, except on go on, where it presses go on */
  if (e.code === 'Space' && el('first').hidden && document.activeElement !== nextBtn) { e.preventDefault(); step(performance.now()); }
}, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
stone.addEventListener('pointerdown', e => { e.preventDefault(); step(performance.now()); });
nextBtn.addEventListener('click', next);
el('start').addEventListener('click', begin);

window.HUSH = {
  ready: true,
  phase: () => phase,
  steps: () => steps,
  tier: () => tierOf(steps),
  fork: () => FORK,
  runLength: () => RUN,
  creaturesBuilt,
  trials: () => trials.map(t => Object.assign({}, t)),
  run: () => run.map(t => Object.assign({}, t)),
  runs: () => runs.map(x => x.slice()),
  live: () => (live ? Object.assign({}, live) : null),
  axes: () => adaptAxes(runs, FORK),
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    /* the loudest a child can make: a step or a snap every 1100 ms, the shortest trial a run allows, and a breath */
    renderLoud: (seconds, master) => {
      const pattern = [[0, 'breath']];
      for (let t = 0.2, k = 0; t < seconds; t += 1.1, k++) pattern.push([t, k % 4 === 3 ? 'snap' : 'step']);
      return audio.renderLoud(pattern, seconds, master);
    }
  },
  /* the page's own pose path for the timing gate: a pose drawn on the show frame and the grass on the hide frame, timed by CORE's
     schedule, resolving its measured times */
  poseOnce: durationMs => schedule.flash({ durationMs, onShow: () => paint('up', false), onHide: () => paint('graze', true), onMasked: () => {} })
};
