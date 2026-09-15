/* GAUGE, the page (plans/gauge/HANDOFF-GAUGE.md P1): WHICH IS MORE.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands. A round: two measures on the bench, decimals written as
 * the engine dealt them, in tabular figures; the child taps the one that is more, or the same (GA3). The choice stays marked; the one
 * that is more (both, when they are the same) is then lit, the same on a right and a wrong round. One detent a round.
 *
 * After every answer the engine classifies the run's pattern (GA1). The code is kept in memory and on this device for the routing to
 * come and is NEVER written to the page, not as a level, a badge, a word or a class (GA7). No floats touch a decimal (GA9): the
 * strings go to the page as written.
 */
import { settings, tokens, audio, store, SETTINGS_DEFAULTS, rng } from '../math/core/core.js?v=20260916h';
import { generateComparisonSet, classifyRun, predict } from './engine.js?v=20260916h';
import { COPY, PALETTE_TOKENS } from './content.js?v=20260916h';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: { code: null }, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
/* the link: read directly until P3 brings config.js */
const Q = new URLSearchParams(location.search);
const SEED = /^[0-9]+$/.test(Q.get('seed') || '') ? Math.floor(Q.get('seed') * 1) : Math.floor(Math.random() * 1e9);
const HOLD_MS = 450;

audio.define({
  /* a brass detent */
  detent: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(660, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.14);
    }
  }
});
/* ⛔ YONDER's scar: a sound must never end the round */
function sound(name) {
  try { audio.play(name); } catch (e) { /* no sound on this device; the round goes on */ }
}

tokens.inject(PALETTE_TOKENS);
const panel = settings.mount({ gameId: 'gauge', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

const el = id => document.getElementById(id);
const leftBtn = el('left'), rightBtn = el('right'), sameBtn = el('same'), nextBtn = el('next');
el('pair').setAttribute('aria-label', COPY.bench);
sameBtn.textContent = COPY.same;
nextBtn.setAttribute('aria-label', COPY.go);
el('start').textContent = COPY.startCompare;

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

const r = rng(SEED >>> 0);
const results = [];
let set = [], index = -1, current = null, phase = 'idle', reveal = null, byKey = false, runIndex = -1, code = null, responses = [];

function startRound() {
  index++;
  if (index >= set.length) {
    runIndex++;
    set = generateComparisonSet(r);
    index = 0;
    responses = [];
  }
  current = set[index];
  reveal = null;
  leftBtn.textContent = current.left;
  rightBtn.textContent = current.right;
  leftBtn.setAttribute('aria-label', COPY.thisOne + ' ' + current.left);
  rightBtn.setAttribute('aria-label', COPY.thisOne + ' ' + current.right);
  for (const b of [leftBtn, rightBtn, sameBtn]) { b.setAttribute('aria-pressed', 'false'); b.classList.remove('is-more'); b.disabled = false; }
  nextBtn.hidden = true;
  phase = 'answer';
  if (byKey) leftBtn.focus();
}

function choose(answer) {
  if (phase !== 'answer') return;
  const truth = predict.truth(current);
  const result = { run: runIndex, index, left: current.left, right: current.right, trap: current.trap || null, answer, truth, correct: answer === truth, byKey };
  results.push(result);
  responses.push({ item: { left: current.left, right: current.right }, answer });
  /* GA1: the pattern, never the score; GA7: kept, never drawn */
  code = classifyRun(responses);
  if (code) store.update('gauge', SCHEMA, rec => { rec.adapt = Object.assign({}, rec.adapt || {}, { code }); });
  ({ left: leftBtn, right: rightBtn, same: sameBtn })[answer].setAttribute('aria-pressed', 'true');
  for (const b of [leftBtn, rightBtn, sameBtn]) b.disabled = true;
  phase = 'reveal';
  sound('detent');
  const state = { done: false, startedAt: null };
  reveal = state;
  const hold = reduced() ? 0 : HOLD_MS;
  const frame = now => {
    if (state.startedAt === null) state.startedAt = now;
    if (now - state.startedAt >= hold) {
      if (truth === 'same') { leftBtn.classList.add('is-more'); rightBtn.classList.add('is-more'); sameBtn.classList.add('is-more'); }
      else ({ left: leftBtn, right: rightBtn })[truth].classList.add('is-more');
      state.done = true;
      phase = 'revealed';
      nextBtn.hidden = false;
      if (byKey) nextBtn.focus();
      return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function next() {
  if (!reveal || !reveal.done) return;
  startRound();
}

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
leftBtn.addEventListener('click', () => choose('left'));
rightBtn.addEventListener('click', () => choose('right'));
sameBtn.addEventListener('click', () => choose('same'));
nextBtn.addEventListener('click', next);
el('start').addEventListener('click', () => { el('first').hidden = true; startRound(); });

window.GAUGE = {
  ready: true,
  phase: () => phase,
  item: () => (current ? Object.assign({}, current) : null),
  set: () => set.map(x => Object.assign({}, x)),
  results,
  revealDone: () => !!(reveal && reveal.done),
  /* for gates only: the code the engine holds; GA7 forbids it on the page */
  code: () => code,
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    renderLoud: (seconds, master) => {
      const pattern = [];
      for (let t = 0; t < seconds; t += 0.6) pattern.push([t, 'detent']);
      return audio.renderLoud(pattern, seconds, master);
    }
  }
};
