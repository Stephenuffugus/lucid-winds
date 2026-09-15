/* GAUGE, the page (plans/gauge/HANDOFF-GAUGE.md P1 and P2): WHICH IS MORE, ZOOM and SAME VALUE.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands. Decimals are strings from the engine to the page; no
 * float touches one (GA9).
 *
 * WHICH IS MORE: two measures; the child taps the one that is more, or the same (GA3). The choice stays marked; the one that is more
 * (both, when they are the same) is then lit, on right and wrong rounds alike. After every answer the engine classifies the run's
 * pattern (GA1); the code is kept in memory and on this device and never written to the page (GA7).
 *
 * ZOOM: a decimal to find. The rule shows exactly ten divisions (GA4). Left and right move the marker a division; ↑ opens the
 * division under the marker into ten finer ones, ↓ backs out ten wider; each move is one detent, pitched a step higher at each finer
 * place. Put it here scores the whole path the child opened. The child's rule stays with its marker; the true place comes second
 * on its own rule beneath, the value written by its division. The rules are a fixed pool of eleven ticks and labels each, moved and
 * relabelled, never rebuilt.
 *
 * SAME VALUE: a decimal and its partner with zeros added or moved; the child says the same value or not; the true answer is lit.
 */
import { settings, tokens, audio, store, SETTINGS_DEFAULTS, rng, parseConfig } from '../math/core/core.js?v=20260916h';
import { generateComparisonSet, classifyRun, predict, dealZoom, zoomPath, scoreZoom, subdivide, dealSame, scoreSame } from './engine.js?v=20260916h';
import { parse } from './decimal.js?v=20260916h';
import { COPY, PALETTE_TOKENS } from './content.js?v=20260916h';
import { GAUGE_SCHEMA } from './config.js?v=20260916h';
import { mountCase } from './case.js?v=20260916h';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: { code: null }, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const CONFIG = parseConfig(location.search, GAUGE_SCHEMA);
const SEED = CONFIG.seed;
const NAMED_MODE = /[?&]mode=/.test(location.search);
const HOLD_MS = 450;

/* a brass detent at each depth: a place finer, a step higher */
const detentAt = hz => ({
  build(ac, out, t) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(hz, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.14);
  }
});
const VOICES = { detent: detentAt(660), detent0: detentAt(440), detent1: detentAt(554), detent2: detentAt(660), detent3: detentAt(784) };
audio.define(VOICES);
/* for the ear gate: a voice rendered offline on its own and its pitch counted off the samples (zero crossings over its body) */
async function pitchOf(name) {
  const rate = 44100, ac = new OfflineAudioContext(1, Math.round(rate * 0.14), rate);
  VOICES[name].build(ac, ac.destination, 0);
  const d = (await ac.startRendering()).getChannelData(0);
  const from = Math.round(rate * 0.01), to = Math.round(rate * 0.11);
  let crossings = 0;
  for (let i = from + 1; i < to; i++) if ((d[i - 1] < 0) !== (d[i] < 0)) crossings++;
  return crossings / 2 / ((to - from) / rate);
}
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
el('start-zoom').textContent = COPY.startZoom;
el('start-same').textContent = COPY.startSame;
el('rule-mine').setAttribute('aria-label', COPY.rule);
el('rule-truth').setAttribute('aria-label', COPY.truthRule);
el('zoom-left').setAttribute('aria-label', COPY.moveLeft);
el('zoom-right').setAttribute('aria-label', COPY.moveRight);
el('zoom-in').setAttribute('aria-label', COPY.openIn);
el('zoom-out').setAttribute('aria-label', COPY.backOut);
el('zoom-commit').textContent = COPY.putHere;
el('same-pair').setAttribute('aria-label', COPY.pairOf);
el('same-yes').textContent = COPY.sameValue;
el('same-no').textContent = COPY.notSame;

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const later = (ms, fn) => { const t0 = performance.now(); const tick = now => (now - t0 >= ms ? fn() : requestAnimationFrame(tick)); requestAnimationFrame(tick); };

let r = rng(SEED >>> 0), MODE = 'compare';
const results = [];
let set = [], index = -1, current = null, phase = 'idle', reveal = null, byKey = false, runIndex = -1, code = null, responses = [];

function showView(mode) {
  document.body.dataset.mode = mode;
  el('compare-view').hidden = mode !== 'compare';
  el('zoom-view').hidden = mode !== 'zoom';
  el('same-view').hidden = mode !== 'same';
}

/* ---- WHICH IS MORE ---- */
function startCompare() {
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

function chooseCompare(answer) {
  if (MODE !== 'compare' || phase !== 'answer') return;
  const truth = predict.truth(current);
  const result = { mode: 'compare', run: runIndex, index, left: current.left, right: current.right, trap: current.trap || null, answer, truth, correct: answer === truth, byKey };
  results.push(result);
  responses.push({ item: { left: current.left, right: current.right }, answer });
  /* GA1: the pattern, never the score; GA7: kept, never drawn */
  code = classifyRun(responses);
  if (code) store.update('gauge', SCHEMA, rec => { rec.adapt = Object.assign({}, rec.adapt || {}, { code }); });
  ({ left: leftBtn, right: rightBtn, same: sameBtn })[answer].setAttribute('aria-pressed', 'true');
  for (const b of [leftBtn, rightBtn, sameBtn]) b.disabled = true;
  phase = 'reveal';
  sound('detent');
  const state = { done: false };
  reveal = state;
  later(reduced() ? 0 : HOLD_MS, () => {
    if (truth === 'same') { leftBtn.classList.add('is-more'); rightBtn.classList.add('is-more'); sameBtn.classList.add('is-more'); }
    else ({ left: leftBtn, right: rightBtn })[truth].classList.add('is-more');
    state.done = true;
    phase = 'revealed';
    nextBtn.hidden = false;
    if (byKey) nextBtn.focus();
  });
}

/* ---- ZOOM ---- */
/* a rule: a fixed pool of eleven ticks and labels and one marker, built once; show() only moves and relabels them */
function mountRule(host) {
  const line = document.createElement('div'); line.className = 'line';
  host.append(line);
  const ticks = [], labels = [];
  for (let i = 0; i <= 10; i++) {
    const t = document.createElement('div'); t.className = 'tick';
    const l = document.createElement('div'); l.className = 'label';
    host.append(t, l);
    ticks.push(t); labels.push(l);
  }
  const marker = document.createElement('div'); marker.className = 'marker';
  host.append(marker);
  return {
    show(from, places, at, labelled) {
      const values = subdivide(from, places);
      for (let i = 0; i <= 10; i++) {
        const x = 4 + i * 9.2;
        ticks[i].style.left = x + '%';
        labels[i].style.left = x + '%';
        labels[i].textContent = values[i];
        labels[i].classList.toggle('faint', !(i === 0 || i === 10 || (labelled && (i === at || i === at + 1))));
      }
      marker.style.left = (4 + at * 9.2) + '%';
      marker.style.width = '9.2%';
      return values;
    },
    marker,
    nodes: () => host.childElementCount
  };
}
const ruleMine = mountRule(el('rule-mine')), ruleTruth = mountRule(el('rule-truth'));
ruleTruth.marker.classList.add('truth');

let zoomValues = [], zoomIndex = -1, target = null, levels = [], at = 0, zoomReveal = null;
const startLevel = v => (parse(v).whole > 0n ? { from: '0', places: 0 } : { from: '0', places: 1 });

function drawZoom() {
  const lvl = levels[levels.length - 1];
  ruleMine.show(lvl.from, lvl.places, at, false);
  el('zoom-out').disabled = levels.length <= 1;
}

function startZoom() {
  zoomIndex++;
  if (zoomIndex >= zoomValues.length) { runIndex++; zoomValues = dealZoom(r); zoomIndex = 0; }
  target = zoomValues[zoomIndex];
  zoomReveal = null;
  levels = [startLevel(target)];
  at = 0;
  el('target').textContent = target;
  el('rule-truth').hidden = true;
  for (const id of ['zoom-left', 'zoom-right', 'zoom-in', 'zoom-out', 'zoom-commit']) el(id).disabled = false;
  drawZoom();
  nextBtn.hidden = true;
  phase = 'answer';
  if (byKey) el('zoom-right').focus();
}

function moveZoom(kind) {
  if (MODE !== 'zoom' || phase !== 'answer') return;
  const lvl = levels[levels.length - 1];
  if (kind === 'left' && at > 0) at--;
  else if (kind === 'right' && at < 9) at++;
  else if (kind === 'in' && lvl.places < 3) {
    const values = subdivide(lvl.from, lvl.places);
    levels.push({ from: values[at], places: lvl.places + 1, chose: at });
    at = 0;
  } else if (kind === 'out' && levels.length > 1) {
    const back = levels.pop();
    at = back.chose;
  } else return;
  /* one detent a move, a step higher each place finer */
  sound('detent' + Math.max(0, Math.min(3, levels[levels.length - 1].places)));
  drawZoom();
}

function commitZoom() {
  if (MODE !== 'zoom' || phase !== 'answer') return;
  const path = levels.slice(1).map(l => l.chose).concat([at]);
  const s = scoreZoom(target, path);
  const truth = zoomPath(target);
  results.push({ mode: 'zoom', run: runIndex, index: zoomIndex, target, path, truth: truth.map(t => t.index), correct: s.correct, byKey });
  for (const id of ['zoom-left', 'zoom-right', 'zoom-in', 'zoom-out', 'zoom-commit']) el(id).disabled = true;
  phase = 'reveal';
  sound('detent');
  const state = { done: false };
  zoomReveal = state;
  later(reduced() ? 0 : HOLD_MS, () => {
    const last = truth[truth.length - 1];
    const values = ruleTruth.show(last.from, last.places, last.index, true);
    el('rule-truth').hidden = false;
    el('rule-truth').dataset.value = target;
    el('rule-truth').dataset.between = values[last.index] + ' ' + values[last.index + 1];
    state.done = true;
    phase = 'revealed';
    nextBtn.hidden = false;
    if (byKey) nextBtn.focus();
  });
}

/* ---- SAME VALUE ---- */
let sameItems = [], sameIndex = -1, sameItem = null, sameReveal = null;
function startSame() {
  sameIndex++;
  if (sameIndex >= sameItems.length) { runIndex++; sameItems = dealSame(r); sameIndex = 0; }
  sameItem = sameItems[sameIndex];
  sameReveal = null;
  el('same-left').textContent = sameItem.left;
  el('same-right').textContent = sameItem.right;
  for (const id of ['same-yes', 'same-no']) { const b = el(id); b.setAttribute('aria-pressed', 'false'); b.classList.remove('is-more'); b.disabled = false; }
  nextBtn.hidden = true;
  phase = 'answer';
  if (byKey) el('same-yes').focus();
}
function chooseSame(choice) {
  if (MODE !== 'same' || phase !== 'answer') return;
  const s = scoreSame(sameItem, choice);
  results.push({ mode: 'same', run: runIndex, index: sameIndex, left: sameItem.left, right: sameItem.right, kind: sameItem.kind, answer: sameItem.answer, choice, correct: s.correct, byKey });
  el(choice === 'same' ? 'same-yes' : 'same-no').setAttribute('aria-pressed', 'true');
  el('same-yes').disabled = true; el('same-no').disabled = true;
  phase = 'reveal';
  sound('detent');
  const state = { done: false };
  sameReveal = state;
  later(reduced() ? 0 : HOLD_MS, () => {
    el(sameItem.answer === 'same' ? 'same-yes' : 'same-no').classList.add('is-more');
    state.done = true;
    phase = 'revealed';
    nextBtn.hidden = false;
    if (byKey) nextBtn.focus();
  });
}

/* ---- doors, go on, keys ---- */
function roundDone() { return MODE === 'compare' ? !!(reveal && reveal.done) : MODE === 'zoom' ? !!(zoomReveal && zoomReveal.done) : !!(sameReveal && sameReveal.done); }
function next() {
  if (!roundDone() || instruments.shown()) return;
  /* a run is a session: its last round answered, the next round is dealt under the case, which opens over it */
  const ended = MODE === 'compare' ? index + 1 >= set.length : MODE === 'zoom' ? zoomIndex + 1 >= zoomValues.length : sameIndex + 1 >= sameItems.length;
  if (MODE === 'compare') startCompare(); else if (MODE === 'zoom') startZoom(); else startSame();
  /* ⛔ CREASE's plant sp5: a keyboard could reach the round under the case; the round is inert while the case covers it */
  if (ended) { instruments.earn(byKey); el('play').inert = true; }
}
const instruments = mountCase({ host: document.body, copy: { again: COPY.go }, store, gameId: 'gauge', schema: SCHEMA,
  onGo: () => {
    el('play').inert = false;
    if (byKey) (MODE === 'compare' ? leftBtn : MODE === 'zoom' ? el('zoom-right') : el('same-yes')).focus();
  } });
function begin(mode) {
  MODE = mode;
  r = rng(SEED >>> 0);
  set = []; index = -1; zoomValues = []; zoomIndex = -1; sameItems = []; sameIndex = -1; runIndex = -1;
  el('first').hidden = true;
  showView(mode);
  if (mode === 'compare') startCompare(); else if (mode === 'zoom') startZoom(); else startSame();
}

window.addEventListener('keydown', e => {
  byKey = true;
  if (MODE === 'zoom' && phase === 'answer' && el('first').hidden && !instruments.shown()) {
    const key = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'in', ArrowDown: 'out' }[e.key];
    if (key) { e.preventDefault(); moveZoom(key); }
    else if (e.key === 'Enter' && document.activeElement && document.activeElement.closest('#zoom-view') && document.activeElement.id !== 'zoom-commit') { e.preventDefault(); commitZoom(); }
  }
}, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
leftBtn.addEventListener('click', () => chooseCompare('left'));
rightBtn.addEventListener('click', () => chooseCompare('right'));
sameBtn.addEventListener('click', () => chooseCompare('same'));
el('zoom-left').addEventListener('click', () => moveZoom('left'));
el('zoom-right').addEventListener('click', () => moveZoom('right'));
el('zoom-in').addEventListener('click', () => moveZoom('in'));
el('zoom-out').addEventListener('click', () => moveZoom('out'));
el('zoom-commit').addEventListener('click', commitZoom);
el('same-yes').addEventListener('click', () => chooseSame('same'));
el('same-no').addEventListener('click', () => chooseSame('different'));
nextBtn.addEventListener('click', next);
el('start').addEventListener('click', () => begin('compare'));
el('start-zoom').addEventListener('click', () => begin('zoom'));
el('start-same').addEventListener('click', () => begin('same'));
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js?v=20260916h').catch(() => {});
/* a link that names a mode shows its one door */
if (NAMED_MODE) for (const [id, m] of [['start', 'compare'], ['start-zoom', 'zoom'], ['start-same', 'same']]) if (m !== CONFIG.mode) el(id).hidden = true;

window.GAUGE = {
  ready: true,
  mode: () => MODE,
  phase: () => phase,
  item: () => (current ? Object.assign({}, current) : null),
  set: () => set.map(x => Object.assign({}, x)),
  results,
  revealDone: () => roundDone(),
  /* for gates only: the code the engine holds; GA7 forbids it on the page */
  code: () => code,
  zoom: () => ({ target, depth: levels.length, at, levels: levels.map(l => Object.assign({}, l)), nodes: [ruleMine.nodes(), ruleTruth.nodes()] }),
  sameItem: () => (sameItem ? Object.assign({}, sameItem) : null),
  config: () => ({ mode: NAMED_MODE ? CONFIG.mode : MODE }),
  instruments: { shown: () => instruments.shown(), cells: () => instruments.cells(), held: () => instruments.held() },
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    pitchOf,
    renderLoud: (seconds, master) => {
      const pattern = [];
      for (let t = 0, k = 0; t < seconds; t += 0.3, k++) pattern.push([t, 'detent' + (k % 4)]);
      return audio.renderLoud(pattern, seconds, master);
    }
  }
};
