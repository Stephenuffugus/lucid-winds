/* NOTCH, the page (plans/notch/HANDOFF-NOTCH.md P1 and P2): TURN, stages 1 and 2, the slow reveal, and FIND.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands. A round: a carved piece stands over its notch,
 * turned. A thumb or a mouse drags anywhere on the bench and the piece turns about its centre, continuously (N1: the drag is the
 * training; there are no turn buttons). Arrow keys turn it 15 degrees a press (the one place stepping is allowed). When a drag
 * lets go, or a key press lands, within the tolerance of the notch, the piece seats. A piece that will not seat, whatever the
 * turn, is set aside with the button beside the bench. Then the reveal, the same on every path at 60 degrees a second: a right
 * piece turns home; a mirror turns all the way round, flips, and turns home. One thunk a round, when it seats at the reveal's
 * end. No numerals anywhere (N7).
 *
 * FIND (3.10): the piece above a carving of regions; the child taps the region that is the piece. The chosen region stays marked
 * and the piece's own region is outlined, the same on both paths, with one thunk; then go on.
 */
import { settings, tokens, audio, store, SETTINGS_DEFAULTS, rng, parseConfig } from '../math/core/core.js?v=20260916e';
import { dealSession, dealFind, seatCheck, keyStep, scoreTurn, tierFor, stageAfter, revealPlan, revealAt, SESSION_LENGTH, KEY_STEP } from './engine.js?v=20260916e';
import { COPY, PALETTE_TOKENS } from './content.js?v=20260916e';
import { NOTCH_SCHEMA } from './config.js?v=20260916e';
import { mountBench, doorPicture, piecePicture } from './render.js?v=20260916e';

const KEEP_SESSIONS = 10, BENCH = 420;
const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: { sessions: [] }, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
/* a teacher's link (config.js): the seed, the door a link names, and where TURN starts */
const CONFIG = parseConfig(location.search, NOTCH_SCHEMA);
const SEED = CONFIG.seed;
const NAMED_MODE = /[?&]mode=/.test(location.search);

audio.define({
  /* the seat: a low wooden thunk, the best sound in the game */
  thunk: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
      o.type = 'triangle';
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
      f.type = 'lowpass'; f.frequency.setValueAtTime(900, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(f); f.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.24);
    }
  },
  /* a soft tick as the grain passes each 15 degrees under a drag, never more often */
  tick: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(520, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.03, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.06);
    }
  },
  /* a mirror's flip in the reveal */
  flip: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(330, t);
      o.frequency.exponentialRampToValueAtTime(440, t + 0.25);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.32);
    }
  }
});
/* ⛔ YONDER's scar: a sound from inside a frame must never end the round */
function sound(name) {
  try { audio.play(name); } catch (e) { /* no sound on this device; the round goes on */ }
}

tokens.inject(PALETTE_TOKENS);
const panel = settings.mount({ gameId: 'notch', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

const el = id => document.getElementById(id);
const svg = el('bench'), asideBtn = el('aside'), nextBtn = el('next');
svg.setAttribute('aria-label', COPY.piece);
svg.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight');
asideBtn.setAttribute('aria-label', COPY.aside);
nextBtn.setAttribute('aria-label', COPY.go);
el('start').setAttribute('aria-label', COPY.startTurn);
el('start').append(doorPicture());
el('start-find').setAttribute('aria-label', COPY.startFind);
el('start-find').append(piecePicture('crank', { px: 56 }));
el('target').setAttribute('aria-label', COPY.findTarget);
const bench = mountBench(svg, BENCH);

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

const kept = () => { const rec = store.load('notch', SCHEMA); return Object.assign({ sessions: [] }, rec.adapt || {}); };
let r = rng(SEED >>> 0), MODE = 'turn';
const results = [], revealLog = [];
let sessions = kept().sessions.slice(-KEEP_SESSIONS);
/* the device's own stage, unless a link names one */
const stageNow = () => (CONFIG.stage === 'one' ? 1 : CONFIG.stage === 'two' ? 2 : stageAfter(sessions));
let stage = stageNow();
let panelNow = null, findIndex = -1, findReveal = null;
let tasks = [], index = SESSION_LENGTH, current = null, angle = 0, phase = 'idle', t0 = 0, turns = 0, reveal = null, sessionResults = [], byKey = false;

function draw() { bench.update({ pieceId: current.pieceId, angle, mirror: current.isMirror && !(reveal && reveal.flipped) }); }

function startRound() {
  index++;
  if (index >= SESSION_LENGTH) {
    if (sessionResults.length) {
      sessions.push({ stage, results: sessionResults.map(x => ({ correct: x.correct })) });
      sessions = sessions.slice(-KEEP_SESSIONS);
      store.update('notch', SCHEMA, rec => { rec.adapt = Object.assign({ sessions: [] }, rec.adapt || {}, { sessions }); });
      stage = stageNow();
    }
    sessionResults = [];
    index = 0;
    tasks = dealSession(r, { stage, tier: tierFor(results.filter(x => x.stage === stage)) });
  }
  current = tasks[index];
  angle = current.startAngle;
  reveal = null;
  turns = 0;
  nextBtn.hidden = true;
  asideBtn.hidden = false;
  draw();
  phase = 'turn';
  requestAnimationFrame(t => { t0 = t; });
}

/* a drag: the angle follows the pointer about the bench's centre, continuously */
let drag = null, lastTick = null, frameAsked = false;
const pointerAngle = e => { const b = svg.getBoundingClientRect(); return Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2)) * 180 / Math.PI; };
const wrap = a => ((((a + 180) % 360) + 360) % 360) - 180;
function redrawSoon() { if (frameAsked) return; frameAsked = true; requestAnimationFrame(() => { frameAsked = false; if (current) draw(); }); }
function tickIfCrossed() {
  const step = Math.floor(angle / KEY_STEP);
  if (lastTick !== null && step !== lastTick) sound('tick');
  lastTick = step;
}
svg.addEventListener('pointerdown', e => {
  if (phase !== 'turn') return;
  e.preventDefault();
  svg.setPointerCapture(e.pointerId);
  drag = { id: e.pointerId, from: pointerAngle(e), angle };
  lastTick = Math.floor(angle / KEY_STEP);
  turns++;
});
svg.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id || phase !== 'turn') return;
  /* the screen's y runs down, so a clockwise drag lowers the piece's angle */
  angle = wrap(drag.angle - (pointerAngle(e) - drag.from));
  tickIfCrossed();
  redrawSoon();
});
const letGo = e => {
  if (!drag || e.pointerId !== drag.id) return;
  drag = null;
  if (phase === 'turn' && seatCheck(current, angle)) finish(false);
};
svg.addEventListener('pointerup', letGo);
svg.addEventListener('pointercancel', letGo);
svg.addEventListener('keydown', e => {
  if (phase !== 'turn' || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
  e.preventDefault();
  angle = keyStep(angle, e.key === 'ArrowLeft' ? 1 : -1);
  turns++;
  draw();
  if (seatCheck(current, angle)) finish(false);
});
asideBtn.addEventListener('click', () => { if (phase === 'turn') finish(true); });

function finish(setAside) {
  const rt = performance.now() - t0;
  const result = Object.assign({ round: results.length, stage, pieceId: current.pieceId, isMirror: current.isMirror, startAngle: current.startAngle, byKey },
    scoreTurn(current, { finalAngle: angle, setAside, rtMs: rt, turns }));
  results.push(result);
  sessionResults.push(result);
  phase = 'reveal';
  asideBtn.hidden = true;
  runReveal(result);
}

/* the reveal (3.6): the same on every path, driven by the engine's plan; one flip for a mirror, one thunk as it seats */
function runReveal(result) {
  const plan = revealPlan(current, angle, reduced());
  const state = { done: false, flipped: false, startedAt: null, frames: [] };
  reveal = state;
  let flippedOnce = false;
  const frame = now => {
    if (state.startedAt === null) state.startedAt = now;
    const at = revealAt(plan, now - state.startedAt);
    angle = at.angle;
    state.flipped = at.flipped;
    if (at.flipped && !flippedOnce) { flippedOnce = true; sound('flip'); }
    draw();
    state.frames.push({ t: now - state.startedAt, angle: at.angle, flipped: at.flipped });
    if (at.done) {
      state.done = true;
      angle = 0;
      draw();
      sound('thunk');
      revealLog.push({ round: result.round, isMirror: current.isMirror, from: result.startAngle, plan, ms: now - state.startedAt });
      nextBtn.hidden = false;
      if (byKey) nextBtn.focus();
      return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* FIND: a panel from the engine, the piece above it, one button a region */
function startFind() {
  findIndex++;
  panelNow = dealFind(r, { stage });
  findReveal = null;
  nextBtn.hidden = true;
  const target = el('target'), panelEl = el('panel');
  target.textContent = '';
  target.append(piecePicture(panelNow.pieceId, { px: 88 }));
  panelEl.textContent = '';
  for (const g of panelNow.regions) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lw-btn region';
    b.dataset.slot = String(g.slot);
    b.setAttribute('aria-label', COPY.region);
    b.setAttribute('aria-pressed', 'false');
    b.append(piecePicture(g.pieceId, { mirror: g.mirror, turn: g.turn, px: 88 }));
    b.addEventListener('click', () => chooseRegion(g.slot));
    panelEl.append(b);
  }
  phase = 'find';
  requestAnimationFrame(t => { t0 = t; });
  if (byKey) { const first = panelEl.querySelector('.region'); if (first) first.focus(); }
}

function chooseRegion(slot) {
  if (phase !== 'find') return;
  const g = panelNow.regions.find(x => x.slot === slot), piece = panelNow.regions.find(x => x.pieceId === panelNow.pieceId && !x.mirror && (x.turn || 0) === 0);
  const result = { round: results.length, mode: 'find', stage, pieceId: panelNow.pieceId, slot, pieceSlot: piece.slot, correct: g === piece, rtMs: performance.now() - t0, byKey };
  results.push(result);
  phase = 'reveal';
  const buttons = Array.from(el('panel').querySelectorAll('.region'));
  buttons.forEach(b => { if (Number(b.dataset.slot) === slot) b.setAttribute('aria-pressed', 'true'); b.disabled = true; });
  const state = { done: false };
  findReveal = state;
  const HOLD = reduced() ? 0 : 600, started = performance.now();
  buttons.forEach(b => { if (Number(b.dataset.slot) === piece.slot) b.classList.add('is-piece'); });
  sound('thunk');
  const wait = now => { if (now - started >= HOLD) { state.done = true; nextBtn.hidden = false; if (byKey) nextBtn.focus(); return; } requestAnimationFrame(wait); };
  requestAnimationFrame(wait);
}

function next() {
  if (MODE === 'find') { if (!findReveal || !findReveal.done) return; startFind(); return; }
  if (!reveal || !reveal.done) return;
  startRound();
  if (byKey) svg.focus();
}

/* a door: its mode, dealt fresh from the seed */
function begin(mode) {
  MODE = mode;
  document.body.dataset.mode = mode;
  r = rng(SEED >>> 0);
  el('first').hidden = true;
  el('find').hidden = mode !== 'find';
  if (mode === 'find') { startFind(); return; }
  startRound();
  if (byKey) svg.focus();
}

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
nextBtn.addEventListener('click', next);
/* a link that names a mode shows its one door */
if (NAMED_MODE) { document.body.dataset.fixed = CONFIG.mode; (CONFIG.mode === 'find' ? el('start') : el('start-find')).hidden = true; }
el('start').addEventListener('click', () => begin('turn'));
el('start-find').addEventListener('click', () => begin('find'));

window.NOTCH = {
  ready: true,
  phase: () => phase,
  task: () => (current ? Object.assign({}, current) : null),
  angle: () => angle,
  stage: () => stage,
  results,
  revealDone: () => (MODE === 'find' ? !!(findReveal && findReveal.done) : !!(reveal && reveal.done)),
  mode: () => MODE,
  config: () => ({ mode: NAMED_MODE ? CONFIG.mode : MODE, stage: CONFIG.stage }),
  panel: () => (panelNow ? JSON.parse(JSON.stringify(panelNow)) : null),
  revealFrames: () => (reveal ? reveal.frames.slice() : []),
  revealLog: () => revealLog.slice(),
  drawn: () => bench.drawn(),
  /* the bench's centre on the screen, where a drag turns about */
  centre: () => { const b = svg.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; },
  kept: () => JSON.parse(JSON.stringify(kept())),
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    renderLoud: (seconds, master) => {
      const pattern = [];
      for (let t = 0; t < seconds; t += 0.25) pattern.push([t, 'tick']);
      for (let t = 0.1; t < seconds; t += 1.2) pattern.push([t, 'thunk']);
      for (let t = 0.6; t < seconds; t += 6.6) pattern.push([t, 'flip']);
      return audio.renderLoud(pattern, seconds, master);
    }
  }
};

/* the offline shell: one worker for the game, its address carrying the stamp */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js?v=20260916e').catch(() => {});
