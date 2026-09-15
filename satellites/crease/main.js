/* CREASE, the page (plans/crease/HANDOFF-CREASE.md P1): Mode 2 FREEHAND and the reveal.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands. A round: the fraction at the top, numerator
 * over denominator; the paper strip from 0 to its whole, its width and offset new every round (C1); the clip, CORE's number
 * line stone, dragged by a thumb (with CORE's loupe) or moved by arrow keys, and put down by letting go or by Enter.
 * Nothing on the strip but its ends and its pins (C2, C5).
 *
 * The reveal (the reveal contract): the clip stays where the child put it; the truth's clip fades in at the true place and
 * the gap between them is hatched; then the strip creases itself into whole times denominator equal parts, and only now
 * does a crease carry a fraction, the true place's (C8). The same reveal on every path, near or far, in one colour. Next is
 * unavailable until it is done.
 *
 * The tier ladder is CORE's adaptTier on this page's own results; the tier only sets how close counts as close, and nothing
 * on the screen shows it.
 */
import { settings, tokens, audio, store, SETTINGS_DEFAULTS, parseConfig, rng, numberline, adaptTier } from '../math/core/core.js?v=20260916a';
import { spriteCanvas } from './draw.js?v=20260916a';
import { mountShelf } from './shelf.js?v=20260916a';
import { freshRun, generateTask, scoreAttempt, TIER_CONFIG, judgeHalf } from './engine.js?v=20260916a';
import { COPY, PALETTE } from './content.js?v=20260916a';
import { CREASE_SCHEMA } from './config.js?v=20260916a';
import { placePins, clearReveal, buildReveal, setReveal, foldTo, clearFolds, markMiddle } from './render.js?v=20260916a';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const CONFIG = parseConfig(location.search, CREASE_SCHEMA);
/* the reveal, in ms: the truth and the gap, then the creases; with less motion it is shorter and still happens in order */
const REVEAL = 900, REVEAL_REDUCED = 320, HOLD = 350;
/* the mode: a link that names one keeps it (one door); otherwise the first screen's three doors choose */
const NAMED_MODE = /[?&]mode=/.test(location.search);
let MODE = CONFIG.mode;
/* CREASE mode: folds per whole, from one (no fold) to twelve */
let CREASING = MODE === 'crease';
const MAX_PARTS = 12;
/* HALFWAY: six seconds a round, never shown (G5); five right in a row bring exactly half */
let HALFWAY = MODE === 'halfway';
const HALF_MS = 6000, STREAK_FOR_HALF = 5;
/* a run is `count` rounds, and its end earns a specimen (3.9) */
const RUN = Number(CONFIG.count);

/* the four sounds (plans/crease/HANDOFF-CREASE.md 3.8), every gain set by the voice that makes it: a fold made, the clip or a
   side put down, the truth arriving, the creases settling. The same on every path, right or wrong. */
const knock = (f0, f1, peak, type) => ({
  build(ac, out, t) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.13);
  }
});
audio.define({
  /* paper creased: a short breath of seeded noise, band passed low enough not to hiss */
  crease: {
    build(ac, out, t, rand) {
      const n = Math.ceil(ac.sampleRate * 0.08), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = rand() * 2 - 1;
      const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = buf;
      bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 0.9;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
      src.connect(bp); bp.connect(g); g.connect(out);
      src.start(t); src.stop(t + 0.08);
    }
  },
  set: knock(330, 160, 0.12, 'triangle'),
  knock: knock(210, 120, 0.16, 'sine'),
  settle: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(392, t);
      o.frequency.linearRampToValueAtTime(294, t + 0.22);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.02);
      g.gain.linearRampToValueAtTime(0.0001, t + 0.26);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.28);
    }
  }
});
/* ⛔ YONDER's scar: a sound is played from inside the reveal's frame, and a device whose audio throws must not end a round */
function sound(name) {
  try { audio.play(name); } catch (e) { /* no sound on this device; the round goes on */ }
}

tokens.inject({ paper: PALETTE.paper, ink: PALETTE.ink, accent: PALETTE.truth });
const panel = settings.mount({ gameId: 'crease', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

const el = id => document.getElementById(id);
const strip = el('strip'), nextBtn = el('next'), numEl = document.querySelector('#target .num'), denEl = document.querySelector('#target .den');
strip.setAttribute('aria-label', COPY.strip);
nextBtn.setAttribute('aria-label', COPY.next);
el('fold-more').setAttribute('aria-label', COPY.foldMore);
el('fold-less').setAttribute('aria-label', COPY.foldLess);
el('less').setAttribute('aria-label', COPY.less);
el('more').setAttribute('aria-label', COPY.more);
el('half').setAttribute('aria-label', COPY.half);
document.body.dataset.mode = MODE;
if (NAMED_MODE) document.body.dataset.fixed = MODE;
/* the doors: #start is the link's mode, or FREEHAND when the link names none, beside the other two */
const DOOR = { freehand: ['doorFreehand', COPY.startFreehand], crease: ['doorCrease', COPY.startCrease], halfway: ['doorHalfway', COPY.startHalfway] };
const firstMode = NAMED_MODE ? MODE : 'freehand';
el('start').dataset.mode = firstMode;
for (const [id, m] of [['start', firstMode], ['start-crease', 'crease'], ['start-halfway', 'halfway']]) {
  el(id).setAttribute('aria-label', DOOR[m][1]);
  el(id).append(spriteCanvas(DOOR[m][0], 3));
}
el('fold-less').append(spriteCanvas('foldLess', 3));
el('fold-more').append(spriteCanvas('foldMore', 3));

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* one seeded run: the tasks from the seed, each task's tier from the results before it */
let r = rng(CONFIG.seed >>> 0);
let state = freshRun({ grade: Number(CONFIG.grade), mode: MODE });
const results = [], tasks = [];
let task = null, round = -1, line = null, reveal = null, byKey = false, parts = 1, streak = 0, halfOpen = false, roundStart = 0;
/* rounds finished in this run; kept in memory only, so a reload in the middle of a run earns nothing */
let runRounds = 0;
/* a round left alone is no mark: it is not in the history the tier reads */
const tierNow = () => adaptTier(results.filter(x => !x.timedOut).map(x => x.correct), TIER_CONFIG);

function startRound() {
  round++;
  state.tier = tierNow();
  state.halfOpen = halfOpen;
  const step = generateTask(r, state);
  task = step.task;
  state = step.state;
  tasks.push(task);
  reveal = null;
  if (line) line.destroy();
  clearReveal(strip);
  const geom = task.strip;
  strip.dataset.offset = String(geom.offsetPct);
  strip.dataset.width = String(geom.widthPct);
  strip.dataset.whole = String(task.whole);
  parts = 1;
  strip.dataset.parts = '1';
  line = numberline.create({ container: strip, geom, onCommit: plant, ends: ['0', String(task.whole)], snap: CREASING ? task.whole * parts : 0 });
  line.stone.setAttribute('aria-label', COPY.clip);
  line.stone.append(spriteCanvas('clip', 3));
  placePins(strip, geom);
  if (CREASING) foldTo(strip, geom, task.whole * parts, parts);
  setFoldControls();
  if (HALFWAY) {
    markMiddle(strip, geom);
    for (const id of ['less', 'half', 'more']) { el(id).setAttribute('aria-pressed', 'false'); el(id).setAttribute('aria-disabled', 'false'); }
    el('half').hidden = !halfOpen;
    roundStart = performance.now();
    watchClock(round);
  }
  numEl.textContent = String(task.numerator);
  denEl.textContent = String(task.denominator);
  document.getElementById('target').setAttribute('aria-label', task.numerator + ' ' + COPY.over + ' ' + task.denominator);
  nextBtn.hidden = true;
}

/* the clip goes down: scored in the strip's own numbers at this round's tier; then the reveal */
function plant(value) {
  const placement = value * task.whole;
  const scored = scoreAttempt(task, placement, task.tier);
  /* the folds made are the child's; the reveal's creases are the truth's, drawn fresh */
  clearFolds(strip);
  const result = Object.assign({ round, placement, value, byKey, revealAt: performance.now() }, scored);
  results.push(result);
  /* A1: one sound for the clip put down */
  sound('set');
  /* C4: a chain's third round stacks the chain's three equal fractions over their one point */
  const stack = task.stackReveal ? tasks.slice(-3).map(t => t.numerator + '/' + t.denominator) : [];
  runReveal(result, value, stack);
}

/* the reveal, the same on every path and in every mode: the child's mark (the clip, or HALFWAY's middle) stays, the truth
   comes second, the strip creases itself */
function runReveal(result, clipNorm, stack = []) {
  buildReveal(strip, { geom: task.strip, parts: task.whole * task.denominator, perUnit: task.denominator, trueK: task.numerator,
    label: task.numerator + '/' + task.denominator, clipNorm, truthNorm: task.numerator / task.denominator / task.whole, stack });
  const ms = reduced() ? REVEAL_REDUCED : REVEAL;
  const state0 = { done: false };
  reveal = state0;
  setFoldControls();
  let heard = 0;
  const frame = now => {
    /* ⛔ YONDER's scar: a frame's time can come a hair before the reveal began; clamp it before it drives anything */
    const dt = Math.max(0, now - result.revealAt), p = Math.min(1, dt / ms);
    setReveal(strip, p);
    /* A1: one knock as the truth has arrived and one settle as the creases land, however many creases there are */
    if (heard < 1 && p >= 0.6) { heard = 1; sound('knock'); }
    if (heard < 2 && p >= 1) { heard = 2; sound('settle'); }
    if (dt >= ms + HOLD) {
      state0.done = true;
      nextBtn.hidden = false;
      if (result.byKey) nextBtn.focus();
      return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* a fold more or a fold less: the strip creases itself into whole times parts equal parts and the clip snaps to them */
function fold(delta) {
  if (!CREASING || reveal) return;
  const to = Math.max(1, Math.min(MAX_PARTS, parts + delta));
  if (to === parts) return;
  parts = to;
  strip.dataset.parts = String(parts);
  foldTo(strip, task.strip, task.whole * parts, parts);
  line.setSnap(task.whole * parts);
  setFoldControls();
  /* A1: one crease sound for the press, never one per crease made */
  sound('crease');
}
function setFoldControls() {
  el('fold-less').setAttribute('aria-disabled', parts <= 1 || !!reveal ? 'true' : 'false');
  el('fold-more').setAttribute('aria-disabled', parts >= MAX_PARTS || !!reveal ? 'true' : 'false');
}

/* HALFWAY's six seconds, read on animation frames and shown nowhere; when they pass with no choice, the reveal runs */
function watchClock(forRound) {
  const frame = now => {
    if (round !== forRound || reveal) return;
    /* the seconds count only while the round is on the screen, never under the first screen or the shelf */
    if (!el('first').hidden || shelf.shown()) roundStart = now;
    else if (Math.max(0, now - roundStart) >= HALF_MS) { choose(null); return; }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* a side chosen (or none, when the seconds pass): the truth from judgeHalf, the streak, and the reveal */
function choose(choice) {
  if (!HALFWAY || reveal) return;
  const truth = judgeHalf(task), value = task.numerator / task.denominator;
  const result = { round, choice, truth, correct: choice === null ? null : choice === truth, timedOut: choice === null,
    placement: value, value, byKey, revealAt: performance.now() };
  results.push(result);
  if (choice !== null) {
    /* A1: one sound for the side put down; a round left alone says nothing */
    sound('set');
    el(choice).setAttribute('aria-pressed', 'true');
    streak = result.correct ? streak + 1 : 0;
    if (streak >= STREAK_FOR_HALF) halfOpen = true;
  }
  for (const id of ['less', 'half', 'more']) el(id).setAttribute('aria-disabled', 'true');
  runReveal(result, 0.5);
}

function next() {
  if (!reveal || !reveal.done) return;
  runRounds++;
  const ended = runRounds >= RUN;
  if (ended) runRounds = 0;
  startRound();
  /* ⛔ plant sp5 showed a keyboard could still reach the round under the shelf and play it unseen; the round is inert while
     the shelf covers it */
  if (ended) { shelf.earn(byKey); el('play').inert = true; }
  else if (byKey) (HALFWAY ? el('less') : line.stone).focus();
}

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
nextBtn.addEventListener('click', next);
for (const id of ['less', 'half', 'more']) el(id).addEventListener('click', () => choose(id));
el('fold-more').addEventListener('click', () => fold(1));
el('fold-less').addEventListener('click', () => fold(-1));
/* a door: its mode, dealt fresh from the seed when it is not the mode already dealt, so Node replays it the same */
function begin(mode) {
  if (mode !== MODE) {
    MODE = mode;
    CREASING = mode === 'crease';
    HALFWAY = mode === 'halfway';
    document.body.dataset.mode = mode;
    r = rng(CONFIG.seed >>> 0);
    state = freshRun({ grade: Number(CONFIG.grade), mode });
    results.length = 0; tasks.length = 0;
    round = -1; streak = 0; halfOpen = false; runRounds = 0;
    startRound();
  }
  el('first').hidden = true;
  if (byKey) (HALFWAY ? el('less') : line.stone).focus();
}
el('start').addEventListener('click', () => begin(el('start').dataset.mode));
el('start-crease').addEventListener('click', () => begin('crease'));
el('start-halfway').addEventListener('click', () => begin('halfway'));

/* the shelf, over the round that follows a run's end; go returns to it */
const shelf = mountShelf({ host: document.body, copy: { again: COPY.again }, store, gameId: 'crease', schema: SCHEMA,
  onGo: () => { el('play').inert = false; if (byKey) (HALFWAY ? el('less') : line.stone).focus(); } });

startRound();

/* the loudest a child can make, a second at a time: four folds, the clip put down, the truth's knock and the settle */
const loudest = seconds => {
  const pattern = [];
  for (let t = 0; t < seconds; t += 1) pattern.push([t, 'crease'], [t + 0.15, 'crease'], [t + 0.3, 'crease'], [t + 0.45, 'crease'], [t + 0.6, 'set'], [t + 0.72, 'knock'], [t + 0.9, 'settle']);
  return pattern;
};

window.CREASE = {
  ready: true,
  results,
  task: () => JSON.parse(JSON.stringify(task)),
  tasks: () => JSON.parse(JSON.stringify(tasks)),
  round: () => round,
  revealDone: () => !!(reveal && reveal.done),
  tier: tierNow,
  streak: () => streak,
  config: () => ({ mode: MODE, grade: String(CONFIG.grade), count: String(CONFIG.count) }),
  runLength: () => RUN,
  shelf: { shown: () => shelf.shown(), cells: () => shelf.cells(), held: () => shelf.held() },
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    renderLoud: (seconds, master) => audio.renderLoud(loudest(seconds), seconds, master)
  }
};

/* the offline shell: one worker for the game, its address carrying the stamp */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js?v=20260916a').catch(() => {});
