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
import { settings, tokens, audio, SETTINGS_DEFAULTS, parseConfig, rng, numberline, adaptTier } from '../math/core/core.js?v=20260915a';
import { freshRun, generateTask, scoreAttempt, TIER_CONFIG, judgeHalf } from './engine.js?v=20260915a';
import { COPY, PALETTE } from './content.js?v=20260915a';
import { CREASE_SCHEMA } from './config.js?v=20260915a';
import { placePins, clearReveal, buildReveal, setReveal, foldTo, clearFolds, markMiddle } from './render.js?v=20260915a';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const CONFIG = parseConfig(location.search, CREASE_SCHEMA);
/* the reveal, in ms: the truth and the gap, then the creases; with less motion it is shorter and still happens in order */
const REVEAL = 900, REVEAL_REDUCED = 320, HOLD = 350;
/* CREASE mode: folds per whole, from one (no fold) to twelve */
const CREASING = CONFIG.mode === 'crease', MAX_PARTS = 12;
/* HALFWAY: six seconds a round, never shown (G5); five right in a row bring exactly half */
const HALFWAY = CONFIG.mode === 'halfway', HALF_MS = 6000, STREAK_FOR_HALF = 5;

tokens.inject({ paper: PALETTE.paper, ink: PALETTE.ink, accent: PALETTE.truth });
const panel = settings.mount({ gameId: 'crease', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

const el = id => document.getElementById(id);
const strip = el('strip'), nextBtn = el('next'), numEl = document.querySelector('#target .num'), denEl = document.querySelector('#target .den');
strip.setAttribute('aria-label', COPY.strip);
nextBtn.setAttribute('aria-label', COPY.next);
el('start').setAttribute('aria-label', COPY.start);
el('fold-more').setAttribute('aria-label', COPY.foldMore);
el('fold-less').setAttribute('aria-label', COPY.foldLess);
el('less').setAttribute('aria-label', COPY.less);
el('more').setAttribute('aria-label', COPY.more);
el('half').setAttribute('aria-label', COPY.half);
document.body.dataset.mode = CONFIG.mode;

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* one seeded run: the tasks from the seed, each task's tier from the results before it */
const r = rng(CONFIG.seed >>> 0);
let state = freshRun({ grade: Number(CONFIG.grade), mode: CONFIG.mode });
const results = [], tasks = [];
let task = null, round = -1, line = null, reveal = null, byKey = false, parts = 1, streak = 0, halfOpen = false, roundStart = 0;
/* a round left alone is no mark: it is not in the history the tier reads */
const tierNow = () => adaptTier(results.filter(x => !x.timedOut).map(x => x.correct), TIER_CONFIG);

function startRound() {
  round++;
  state.tier = tierNow();
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
  runReveal(result, value);
}

/* the reveal, the same on every path and in every mode: the child's mark (the clip, or HALFWAY's middle) stays, the truth
   comes second, the strip creases itself */
function runReveal(result, clipNorm) {
  buildReveal(strip, { geom: task.strip, parts: task.whole * task.denominator, perUnit: task.denominator, trueK: task.numerator,
    label: task.numerator + '/' + task.denominator, clipNorm, truthNorm: task.numerator / task.denominator / task.whole });
  const ms = reduced() ? REVEAL_REDUCED : REVEAL;
  const state0 = { done: false };
  reveal = state0;
  setFoldControls();
  const frame = now => {
    /* ⛔ YONDER's scar: a frame's time can come a hair before the reveal began; clamp it before it drives anything */
    const dt = Math.max(0, now - result.revealAt);
    setReveal(strip, Math.min(1, dt / ms));
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
}
function setFoldControls() {
  el('fold-less').setAttribute('aria-disabled', parts <= 1 || !!reveal ? 'true' : 'false');
  el('fold-more').setAttribute('aria-disabled', parts >= MAX_PARTS || !!reveal ? 'true' : 'false');
}

/* HALFWAY's six seconds, read on animation frames and shown nowhere; when they pass with no choice, the reveal runs */
function watchClock(forRound) {
  const frame = now => {
    if (round !== forRound || reveal) return;
    if (Math.max(0, now - roundStart) >= HALF_MS) { choose(null); return; }
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
    el(choice).setAttribute('aria-pressed', 'true');
    streak = result.correct ? streak + 1 : 0;
    if (streak >= STREAK_FOR_HALF) halfOpen = true;
  }
  for (const id of ['less', 'half', 'more']) el(id).setAttribute('aria-disabled', 'true');
  runReveal(result, 0.5);
}

function next() {
  if (!reveal || !reveal.done) return;
  startRound();
  if (byKey) (HALFWAY ? el('less') : line.stone).focus();
}

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
nextBtn.addEventListener('click', next);
for (const id of ['less', 'half', 'more']) el(id).addEventListener('click', () => choose(id));
el('fold-more').addEventListener('click', () => fold(1));
el('fold-less').addEventListener('click', () => fold(-1));
el('start').addEventListener('click', () => {
  el('first').hidden = true;
  if (byKey) line.stone.focus();
});

startRound();

window.CREASE = {
  ready: true,
  results,
  task: () => JSON.parse(JSON.stringify(task)),
  tasks: () => JSON.parse(JSON.stringify(tasks)),
  round: () => round,
  revealDone: () => !!(reveal && reveal.done),
  tier: tierNow,
  streak: () => streak,
  config: () => ({ mode: CONFIG.mode, grade: String(CONFIG.grade), count: String(CONFIG.count) })
};
