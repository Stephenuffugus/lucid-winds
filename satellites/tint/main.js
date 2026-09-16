/* TINT, the page (plans/tint/HANDOFF-TINT.md P1 and P2): SAME COLOUR, FILL THE VAT and DOES IT SCALE.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands.
 *
 * SAME COLOUR: two vats, each with its recipe drawn as the engine dealt it (continuous bands or jugs to count) and its jug counts
 * written beside it (T8). The child says the same colour or a different colour; both vats pour at once and both cloths take the
 * colour (T5: the paint answers, not the app); only then the paint's answer is written, the child's choice kept marked.
 *
 * FILL THE VAT: a recipe, an order, and the ratio table, always there, a row added by the child at a time (build up is allowed to
 * run out of road). The child sets the white in half jugs and pours; the child's cloth and the recipe's cloth are dyed side by side
 * and the paint says whether they match. A rinse does not grow with the vat, and the page says so after the answer.
 *
 * DOES IT SCALE: a situation; the child decides; the demonstration plays (things side by side under one clock, a big square tiled
 * from small ones, rows growing in step, two marks keeping their gap), then the answer and why.
 *
 * One sound a round, guarded. With less motion every pour and demonstration lands at once.
 */
import { settings, tokens, audio, SETTINGS_DEFAULTS, rng, parseConfig } from '../math/core/core.js?v=20260916g';
import { dealCompare, dealFill, dealScales, scoreCompare, scoreFill, scoreScales } from './engine.js?v=20260916g';
import { DYES, mixLinear } from './colour.js?v=20260916g';
import { COPY, SITUATIONS, PALETTE_TOKENS } from './content.js?v=20260916g';
import { TINT_SCHEMA } from './config.js?v=20260916g';
import { fit, drawRecipe, drawPour, drawPoured, clothCentre, drawCloth, drawDemo, demoModel, STREAM_MS, RESOLVE_MS, CLOTH_MS } from './render.js?v=20260916g';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
/* a teacher's link (config.js): the seed, the door a link names, the stage */
const CONFIG = parseConfig(location.search, TINT_SCHEMA);
const SEED = CONFIG.seed;
const STAGE = CONFIG.stage === 'two' ? 2 : 1;
const NAMED_MODE = /[?&]mode=/.test(location.search);
const DEMO_MS = 1600, CLOTH_FILL_MS = 500, WHITE_STEP = 0.5, WHITE_MAX = 40;

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
  },
  /* the demonstration's start: a soft wooden knock */
  knock: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(140, t + 0.1);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.2);
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
el('start-fill').textContent = COPY.startFill;
el('start-scales').textContent = COPY.startScales;
el('th-dye').textContent = COPY.tableDye;
el('th-white').textContent = COPY.tableWhite;
el('add-row').textContent = COPY.addRow;
el('white-less').setAttribute('aria-label', COPY.lessWhite);
el('white-more').setAttribute('aria-label', COPY.moreWhite);
el('white-value').setAttribute('aria-label', COPY.whiteJugs);
el('fill-pour').textContent = COPY.pour;
el('cap-mine').textContent = COPY.clothMine;
el('cap-recipe').textContent = COPY.clothRecipe;
el('scales-yes').textContent = COPY.scales;
el('scales-no').textContent = COPY.not;
el('demo').setAttribute('role', 'img');
el('demo').setAttribute('aria-label', COPY.demo);

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
/* half jugs are written as halves */
const parts = n => (n % 1 === 0.5 ? Math.floor(n) + ' ' + COPY.half : String(n));

let r = rng(SEED >>> 0), MODE = 'compare';
const results = [];
let seen = new Set(), tasks = [], index = -1, current = null, phase = 'idle', pour = null, byKey = false, session = -1;
let fillTask = null, whiteValue = 0, tableRows = 1, fillReveal = null, scalesTask = null, demo = null;

function showView(mode) {
  document.body.dataset.mode = mode;
  el('compare-view').hidden = mode !== 'compare';
  el('fill-view').hidden = mode !== 'fill';
  el('scales-view').hidden = mode !== 'scales';
}

/* one deal a session for the mode, dealt from the seed in the order they come */
function nextTask() {
  index++;
  if (index >= tasks.length) {
    session++;
    if (MODE === 'compare') { const d = dealCompare(r, { stage: STAGE, seen }); seen = d.seen; tasks = d.tasks; }
    else if (MODE === 'fill') { const d = dealFill(r, { stage: STAGE, seen }); seen = d.seen; tasks = d.tasks; }
    else tasks = dealScales(r);
    index = 0;
  }
  return tasks[index];
}

/* ---- SAME COLOUR ---- */
function recipeOf(task, s) {
  const [dyeParts, whiteParts] = task[s];
  return { dye: DYES[task.dye], dyeParts, whiteParts, representation: task.representation };
}

function startCompare() {
  current = nextTask();
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

function chooseCompare(choice) {
  if (MODE !== 'compare' || phase !== 'answer') return;
  const s = scoreCompare(current, choice);
  const result = { mode: 'compare', round: results.length, session, index, left: current.left.slice(), right: current.right.slice(), dye: current.dye, representation: current.representation, errorTarget: current.errorTarget, answer: current.answer, choice, correct: s.correct, byKey };
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

/* ---- FILL THE VAT ---- */
function renderTable() {
  const body = el('table-body');
  body.textContent = '';
  for (let k = 1; k <= tableRows; k++) {
    const tr = document.createElement('tr'), a = document.createElement('td'), b = document.createElement('td');
    a.textContent = parts(fillTask.recipe[0] * k);
    b.textContent = parts(fillTask.recipe[1] * k);
    tr.append(a, b);
    body.append(tr);
  }
  /* ⛔ this scrolled to the bottom on every render, the first one too: before the header held still that hid the header, and after
     it that hid the recipe's own first row under it. A child's added row is worth scrolling to; the recipe is not scrolled away. */
  const scroll = el('table-scroll');
  if (tableRows > 1) scroll.scrollTop = scroll.scrollHeight;
}

function setWhite(v) {
  whiteValue = Math.max(0, Math.min(WHITE_MAX, v));
  el('white-value').value = parts(whiteValue);
  el('white-value').textContent = parts(whiteValue);
}

function startFill() {
  fillTask = nextTask();
  fillReveal = null;
  tableRows = 1;
  const dye = DYES[fillTask.dyeName], [a, b] = fillTask.recipe;
  const sw = el('recipe-swatch'), sctx = fit(sw);
  drawCloth(sctx.ctx, sctx.W, sctx.H, mixLinear(dye, a, b).hex);
  el('recipe-text').textContent = COPY.recipe + ' ' + parts(a) + ' ' + COPY.dye + ' ' + COPY.and + ' ' + parts(b) + ' ' + COPY.white;
  el('order').textContent = fillTask.kind === 'rinse'
    ? COPY.rinseSmall + ' ' + parts(fillTask.fixed) + ' ' + COPY.white + '. ' + COPY.rinseBig + ' ' + parts(fillTask.dye) + ' ' + COPY.dye + '. ' + COPY.rinseAsk
    : COPY.vatTakes + ' ' + parts(fillTask.dye) + ' ' + COPY.dye + '. ' + COPY.howMuchWhite;
  renderTable();
  setWhite(0);
  for (const id of ['white-less', 'white-more', 'fill-pour', 'add-row']) el(id).disabled = false;
  el('fill-cloths').hidden = true;
  delete el('fill-view').dataset.poured;
  el('fill-truth').textContent = '';
  nextBtn.hidden = true;
  phase = 'answer';
  if (byKey) el('white-more').focus();
}

function pourFill() {
  if (MODE !== 'fill' || phase !== 'answer') return;
  const s = scoreFill(fillTask, whiteValue);
  const result = { mode: 'fill', round: results.length, session, index, kind: fillTask.kind, recipe: fillTask.recipe.slice(), dye: fillTask.dye, answer: fillTask.answer, choice: whiteValue, correct: s.correct, rows: tableRows, byKey };
  results.push(result);
  for (const id of ['white-less', 'white-more', 'fill-pour', 'add-row']) el(id).disabled = true;
  /* the table, the stepper and pour give their room to the cloths and the paint's answer (index.html) */
  el('fill-view').dataset.poured = '';
  phase = 'pour';
  const state = { done: false, startedAt: null, mine: null, recipe: null };
  fillReveal = state;
  sound('pour');
  const dye = DYES[fillTask.dyeName], [a, b] = fillTask.recipe, instant = reduced();
  const rinse = fillTask.kind === 'rinse';
  if (!rinse) {
    state.mine = mixLinear(dye, fillTask.dye, whiteValue).hex;
    state.recipe = mixLinear(dye, a, b).hex;
    el('fill-cloths').hidden = false;
  }
  const frame = now => {
    if (state.startedAt === null) state.startedAt = now;
    const p = instant ? 1 : Math.min(1, (now - state.startedAt) / CLOTH_FILL_MS);
    if (!rinse) {
      for (const [id, hex] of [['cloth-mine', state.mine], ['cloth-recipe', state.recipe]]) { const c = fit(el(id)); drawCloth(c.ctx, c.W, c.H, hex, p); }
    }
    if (p >= 1) {
      el('fill-truth').textContent = rinse
        ? COPY.rinseSame + ' ' + parts(fillTask.fixed) + ' ' + COPY.white
        : COPY.paintSays + ' ' + (state.mine === state.recipe ? COPY.matches : COPY.notMatch);
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

/* ---- DOES IT SCALE ---- */
function startScales() {
  scalesTask = nextTask();
  demo = null;
  el('situation').textContent = SITUATIONS[scalesTask.id].ask;
  for (const id of ['scales-yes', 'scales-no']) { el(id).setAttribute('aria-pressed', 'false'); el(id).disabled = false; }
  const c = fit(el('demo'));
  drawDemo(c.ctx, c.W, c.H, scalesTask.id, 0);
  el('scales-truth').textContent = '';
  delete el('scales-view').dataset.answered;
  nextBtn.hidden = true;
  phase = 'answer';
  if (byKey) el('scales-yes').focus();
}

function chooseScales(choice) {
  if (MODE !== 'scales' || phase !== 'answer') return;
  const s = scoreScales(scalesTask, choice);
  const result = { mode: 'scales', round: results.length, session, index, id: scalesTask.id, isProportional: scalesTask.isProportional, choice, correct: s.correct, byKey };
  results.push(result);
  el(choice === 'scales' ? 'scales-yes' : 'scales-no').setAttribute('aria-pressed', 'true');
  el('scales-yes').disabled = true; el('scales-no').disabled = true;
  /* on a short screen the situation's words give their room to the demonstration (index.html) */
  el('scales-view').dataset.answered = '';
  phase = 'demo';
  const state = { done: false, startedAt: null };
  demo = state;
  sound('knock');
  const instant = reduced();
  const frame = now => {
    if (state.startedAt === null) state.startedAt = now;
    const p = instant ? 1 : Math.min(1, (now - state.startedAt) / DEMO_MS);
    const c = fit(el('demo'));
    drawDemo(c.ctx, c.W, c.H, scalesTask.id, p);
    if (p >= 1) {
      el('scales-truth').textContent = COPY.answerIs + ' ' + scalesTask.actual + '. ' + SITUATIONS[scalesTask.id].why;
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

/* ---- the doors, go on ---- */
function roundDone() {
  return MODE === 'compare' ? !!(pour && pour.done) : MODE === 'fill' ? !!(fillReveal && fillReveal.done) : !!(demo && demo.done);
}
function next() {
  if (!roundDone()) return;
  if (MODE === 'compare') startCompare(); else if (MODE === 'fill') startFill(); else startScales();
}
/* a door: its mode, dealt fresh from the seed */
function begin(mode) {
  MODE = mode;
  r = rng(SEED >>> 0);
  seen = new Set(); tasks = []; index = -1; session = -1;
  el('first').hidden = true;
  showView(mode);
  if (mode === 'compare') startCompare(); else if (mode === 'fill') startFill(); else startScales();
}

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
sameBtn.addEventListener('click', () => chooseCompare('same'));
differentBtn.addEventListener('click', () => chooseCompare('different'));
el('add-row').addEventListener('click', () => { if (MODE === 'fill' && phase === 'answer') { tableRows++; renderTable(); } });
el('white-less').addEventListener('click', () => { if (MODE === 'fill' && phase === 'answer') setWhite(whiteValue - WHITE_STEP); });
el('white-more').addEventListener('click', () => { if (MODE === 'fill' && phase === 'answer') setWhite(whiteValue + WHITE_STEP); });
el('fill-pour').addEventListener('click', pourFill);
el('scales-yes').addEventListener('click', () => chooseScales('scales'));
el('scales-no').addEventListener('click', () => chooseScales('not'));
nextBtn.addEventListener('click', next);
/* a link that names a mode shows its one door */
if (NAMED_MODE) for (const [id, m] of [['start', 'compare'], ['start-fill', 'fill'], ['start-scales', 'scales']]) if (m !== CONFIG.mode) el(id).hidden = true;
el('start').addEventListener('click', () => begin('compare'));
el('start-fill').addEventListener('click', () => begin('fill'));
el('start-scales').addEventListener('click', () => begin('scales'));

window.TINT = {
  ready: true,
  mode: () => MODE,
  config: () => ({ mode: NAMED_MODE ? CONFIG.mode : MODE, stage: CONFIG.stage }),
  phase: () => phase,
  task: () => (current ? JSON.parse(JSON.stringify(current)) : null),
  fillTask: () => (fillTask ? JSON.parse(JSON.stringify(fillTask)) : null),
  scalesTask: () => (scalesTask ? JSON.parse(JSON.stringify(scalesTask)) : null),
  white: () => whiteValue,
  rows: () => tableRows,
  results,
  pourDone: () => !!(pour && pour.done),
  fillDone: () => !!(fillReveal && fillReveal.done),
  fillColours: () => (fillReveal ? { mine: fillReveal.mine, recipe: fillReveal.recipe } : null),
  demoDone: () => !!(demo && demo.done),
  demoModel: () => (scalesTask ? demoModel(scalesTask.id) : null),
  mixed: () => (pour ? Object.assign({}, pour.mixed) : null),
  /* where each cloth's centre is on the screen, for a gate reading the pixel the child sees */
  clothPoint: side => { const c = canvases[side], b = c.getBoundingClientRect(), [x, y] = clothCentre(c.clientWidth, c.clientHeight); return [b.left + x, b.top + y]; },
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    renderLoud: (seconds, master) => {
      const pattern = [];
      for (let t = 0; t < seconds; t += 1.3) pattern.push([t, 'pour']);
      for (let t = 0.6; t < seconds; t += 2.2) pattern.push([t, 'knock']);
      return audio.renderLoud(pattern, seconds, master);
    }
  }
};

/* the offline shell: one worker for the game, its address carrying the stamp */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js?v=20260916g').catch(() => {});
