/* TINT, the page (plans/tint/HANDOFF-TINT.md P1): SAME COLOUR and the pour.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands. A round: two vats, each with its recipe drawn as the
 * engine dealt it (continuous bands or jugs to count) and its jug counts written beside it (T8). The child says the same colour or
 * a different colour. Then both vats pour at once and both cloths take the colour (T5: the paint answers, not the app), and only
 * then the paint's answer is written under them; the child's choice stays marked through all of it (the reveal contract). One
 * pour sound a round. With less motion the cloths are dyed at once.
 */
import { settings, tokens, audio, SETTINGS_DEFAULTS, rng } from '../math/core/core.js?v=20260916g';
import { dealCompare, scoreCompare } from './engine.js?v=20260916g';
import { DYES } from './colour.js?v=20260916g';
import { COPY, PALETTE_TOKENS } from './content.js?v=20260916g';
import { fit, drawRecipe, drawPour, drawPoured, clothCentre, STREAM_MS, RESOLVE_MS, CLOTH_MS } from './render.js?v=20260916g';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
/* P1 reads its link directly; config.js comes in P3 */
const Q = new URLSearchParams(location.search);
const SEED = /^\d+$/.test(Q.get('seed') || '') ? Math.floor(Q.get('seed') * 1) : Math.floor(Math.random() * 1e9);
const STAGE = Q.get('stage') === 'two' ? 2 : 1;

audio.define({
  /* the pour: a soft low wash of liquid */
  pour: {
    build(ac, out, t) {
      const len = Math.floor(ac.sampleRate * 0.9), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = buf; f.type = 'lowpass'; f.frequency.setValueAtTime(700, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      s.connect(f); f.connect(g); g.connect(out);
      s.start(t); s.stop(t + 0.9);
    }
  }
});
/* ⛔ YONDER's scar: a sound from inside a frame must never end the round */
function sound(name) {
  try { audio.play(name); } catch (e) { /* no sound on this device; the round goes on */ }
}

tokens.inject(PALETTE_TOKENS);
const panel = settings.mount({ gameId: 'tint', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

const el = id => document.getElementById(id);
const canvases = { left: el('vat-left'), right: el('vat-right') }, jugs = { left: el('jugs-left'), right: el('jugs-right') };
const sameBtn = el('same'), differentBtn = el('different'), truthEl = el('truth'), nextBtn = el('next');
canvases.left.setAttribute('role', 'img'); canvases.left.setAttribute('aria-label', COPY.vatLeft);
canvases.right.setAttribute('role', 'img'); canvases.right.setAttribute('aria-label', COPY.vatRight);
sameBtn.textContent = COPY.same;
differentBtn.textContent = COPY.different;
nextBtn.setAttribute('aria-label', COPY.go);
el('start').textContent = COPY.startCompare;

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
/* half jugs are written as halves, never as a float with a long tail */
const parts = n => (n % 1 === 0.5 ? Math.floor(n) + ' ' + COPY.half : String(n));

const r = rng(SEED >>> 0);
const results = [];
let seen = new Set(), tasks = [], index = -1, current = null, phase = 'idle', pour = null, byKey = false, session = -1;

function recipeOf(task, s) {
  const [dyeParts, whiteParts] = task[s];
  return { dye: DYES[task.dye], dyeParts, whiteParts, representation: task.representation };
}

function startRound() {
  index++;
  if (index >= tasks.length) {
    session++;
    const d = dealCompare(r, { stage: STAGE, seen });
    seen = d.seen; tasks = d.tasks; index = 0;
  }
  current = tasks[index];
  pour = null;
  for (const s of ['left', 'right']) {
    const { ctx, W, H } = fit(canvases[s]);
    const rec = recipeOf(current, s);
    drawRecipe(ctx, W, H, rec);
    jugs[s].textContent = parts(rec.dyeParts) + ' ' + COPY.dye + ' ' + COPY.and + ' ' + parts(rec.whiteParts) + ' ' + COPY.white;
  }
  for (const b of [sameBtn, differentBtn]) { b.setAttribute('aria-pressed', 'false'); b.disabled = false; }
  truthEl.textContent = '';
  nextBtn.hidden = true;
  phase = 'answer';
  if (byKey) sameBtn.focus();
}

function choose(choice) {
  if (phase !== 'answer') return;
  const s = scoreCompare(current, choice);
  const result = { round: results.length, session, index, left: current.left.slice(), right: current.right.slice(), dye: current.dye, representation: current.representation, errorTarget: current.errorTarget, answer: current.answer, choice, correct: s.correct, byKey };
  results.push(result);
  (choice === 'same' ? sameBtn : differentBtn).setAttribute('aria-pressed', 'true');
  sameBtn.disabled = true; differentBtn.disabled = true;
  phase = 'pour';
  runPour(result);
}

/* both vats pour together; the paint's answer is written only once both cloths are dyed */
function runPour(result) {
  const total = STREAM_MS + RESOLVE_MS + CLOTH_MS, instant = reduced();
  const state = { done: false, startedAt: null, mixed: {} };
  pour = state;
  sound('pour');
  const frame = now => {
    if (state.startedAt === null) state.startedAt = now;
    const t = instant ? total : now - state.startedAt;
    let over = true;
    for (const s of ['left', 'right']) {
      const { ctx, W, H } = fit(canvases[s]);
      const drawn = instant ? drawPoured(ctx, W, H, recipeOf(current, s)) : drawPour(ctx, W, H, recipeOf(current, s), t);
      state.mixed[s] = drawn.mixed;
      over = over && drawn.done;
    }
    if (over) {
      truthEl.textContent = COPY.paintSays + ' ' + (result.answer === 'same' ? COPY.same : COPY.different);
      state.done = true;
      phase = 'revealed';
      nextBtn.hidden = false;
      if (result.byKey) nextBtn.focus();
      return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function next() {
  if (!pour || !pour.done) return;
  startRound();
}

function begin() {
  el('first').hidden = true;
  startRound();
}

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
sameBtn.addEventListener('click', () => choose('same'));
differentBtn.addEventListener('click', () => choose('different'));
nextBtn.addEventListener('click', next);
el('start').addEventListener('click', begin);

window.TINT = {
  ready: true,
  phase: () => phase,
  task: () => (current ? JSON.parse(JSON.stringify(current)) : null),
  results,
  pourDone: () => !!(pour && pour.done),
  mixed: () => (pour ? Object.assign({}, pour.mixed) : null),
  /* where each cloth's centre is on the screen, for a gate reading the pixel the child sees */
  clothPoint: side => { const c = canvases[side], b = c.getBoundingClientRect(), [x, y] = clothCentre(c.clientWidth, c.clientHeight); return [b.left + x, b.top + y]; },
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    renderLoud: (seconds, master) => {
      const pattern = [];
      for (let t = 0; t < seconds; t += 1.3) pattern.push([t, 'pour']);
      return audio.renderLoud(pattern, seconds, master);
    }
  }
};
