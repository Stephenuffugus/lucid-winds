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
import { freshRun, generateTask, scoreAttempt, TIER_CONFIG } from './engine.js?v=20260915a';
import { COPY, PALETTE } from './content.js?v=20260915a';
import { CREASE_SCHEMA } from './config.js?v=20260915a';
import { placePins, clearReveal, buildReveal, setReveal } from './render.js?v=20260915a';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const CONFIG = parseConfig(location.search, CREASE_SCHEMA);
/* the reveal, in ms: the truth and the gap, then the creases; with less motion it is shorter and still happens in order */
const REVEAL = 900, REVEAL_REDUCED = 320, HOLD = 350;

tokens.inject({ paper: PALETTE.paper, ink: PALETTE.ink, accent: PALETTE.truth });
const panel = settings.mount({ gameId: 'crease', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

const el = id => document.getElementById(id);
const strip = el('strip'), nextBtn = el('next'), numEl = document.querySelector('#target .num'), denEl = document.querySelector('#target .den');
strip.setAttribute('aria-label', COPY.strip);
nextBtn.setAttribute('aria-label', COPY.next);
el('start').setAttribute('aria-label', COPY.start);

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* one seeded run: the tasks from the seed, each task's tier from the results before it */
const r = rng(CONFIG.seed >>> 0);
let state = freshRun({ grade: Number(CONFIG.grade), mode: CONFIG.mode });
const results = [], tasks = [];
let task = null, round = -1, line = null, reveal = null, byKey = false;
const tierNow = () => adaptTier(results.map(x => x.correct), TIER_CONFIG);

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
  line = numberline.create({ container: strip, geom, onCommit: plant, ends: ['0', String(task.whole)] });
  line.stone.setAttribute('aria-label', COPY.clip);
  placePins(strip, geom);
  numEl.textContent = String(task.numerator);
  denEl.textContent = String(task.denominator);
  document.getElementById('target').setAttribute('aria-label', task.numerator + ' ' + COPY.over + ' ' + task.denominator);
  nextBtn.hidden = true;
}

/* the clip goes down: scored in the strip's own numbers at this round's tier; then the reveal */
function plant(value) {
  const placement = value * task.whole;
  const scored = scoreAttempt(task, placement, task.tier);
  const result = Object.assign({ round, placement, value, byKey, revealAt: performance.now() }, scored);
  results.push(result);
  buildReveal(strip, { geom: task.strip, parts: task.whole * task.denominator, perUnit: task.denominator, trueK: task.numerator,
    label: task.numerator + '/' + task.denominator, clipNorm: value, truthNorm: scored.truePosition });
  const ms = reduced() ? REVEAL_REDUCED : REVEAL;
  const state0 = { done: false };
  reveal = state0;
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

function next() {
  if (!reveal || !reveal.done) return;
  startRound();
  if (byKey) line.stone.focus();
}

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
nextBtn.addEventListener('click', next);
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
  config: () => ({ mode: CONFIG.mode, grade: String(CONFIG.grade), count: String(CONFIG.count) })
};
