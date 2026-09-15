/* BRIM, the page (plans/brim/HANDOFF-BRIM.md P1): MATCHING and the reveal.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands. A round: two glasses the same size, empty, a
 * fraction under each; a tap (or Enter on a focused glass) commits. Then the chosen glass fills, then the other, each rising
 * past its level by a hair and settling onto it exactly, and one line of fact appears under them (B1: nothing fills before
 * the commit; the reveal contract: the same on every path, right or wrong). Next is unavailable until it is done.
 *
 * Rounds come in sessions of twelve from dealSession, which builds B2, B3 and B6 in; the page never picks a pair itself.
 */
import { settings, tokens, audio, store, SETTINGS_DEFAULTS, parseConfig, rng } from '../math/core/core.js?v=20260916b';
import { spriteCanvas } from './draw.js?v=20260916b';
import { mountShelf } from './shelf.js?v=20260916b';
import { dealSession, scoreChoice, SESSION_LENGTH } from './engine.js?v=20260916b';
import { COPY, PALETTE, caption, brimCaption } from './content.js?v=20260916b';
import { BRIM_SCHEMA } from './config.js?v=20260916b';
import { mountVessel, setFraction, clearFill, fillTo, brightenHalf, lightEmpty, holdLevel, etch, fadeEtch, clearEtch } from './render.js?v=20260916b';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const CONFIG = parseConfig(location.search, BRIM_SCHEMA);
/* the reveal, in ms: the chosen glass over the first half, the other over the second; with less motion the fill is instant
   (the handoff's test gate) and the order still shows in the hold */
const REVEAL = 1400, HOLD = 450;
/* BRIM mode's band lights over this long after the fill (instant with less motion) */
const BAND = 500;
/* LEVEL: the glass re etches over this long, the child's split first and the true split second; the water never moves */
const ETCH = 1200;
/* HALF: five right in a row, and the next session may serve pairs on one side of a half (the handoff's step 5) */
const STREAK_FOR_SAME_SIDE = 5;
/* the mode: a link that names one keeps it (one door); otherwise the first screen's four doors choose */
const NAMED_MODE = /[?&]mode=/.test(location.search);
let MODE = CONFIG.mode;
const GRADE = Number(CONFIG.grade);
/* a run is `count` rounds, and its end earns a bottle (3.9) */
const RUN = Number(CONFIG.count);

/* the voices (plans/brim/HANDOFF-BRIM.md 3.1), every gain set by the voice that makes it: a glass or a split chosen, the
   pour, the settle, and LEVEL's ring, two sines at exactly two to one (an octave is a half, so the sound makes the point the
   picture makes). The same on every path, right or wrong. */
const RING = 523.25;
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
  tap: knock(300, 150, 0.12, 'triangle'),
  /* water poured: seeded noise, band passed low, swelling and falling over half a second */
  pour: {
    build(ac, out, t, rand) {
      const n = Math.ceil(ac.sampleRate * 0.6), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = rand() * 2 - 1;
      const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = buf;
      bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.7;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.15);
      g.gain.linearRampToValueAtTime(0.0001, t + 0.58);
      src.connect(bp); bp.connect(g); g.connect(out);
      src.start(t); src.stop(t + 0.6);
    }
  },
  settle: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(440, t);
      o.frequency.linearRampToValueAtTime(330, t + 0.22);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.02);
      g.gain.linearRampToValueAtTime(0.0001, t + 0.26);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.28);
    }
  },
  ring: {
    build(ac, out, t) {
      for (const [f, peak] of [[RING, 0.09], [RING * 2, 0.05]]) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
        o.connect(g); g.connect(out);
        o.start(t); o.stop(t + 1.15);
      }
    }
  }
});
/* ⛔ YONDER's scar: a sound is played from inside a reveal's frame, and a device whose audio throws must not end a round */
function sound(name) {
  try { audio.play(name); } catch (e) { /* no sound on this device; the round goes on */ }
}

tokens.inject({ paper: PALETTE.paper, ink: PALETTE.ink, accent: PALETTE.teal });
const panel = settings.mount({ gameId: 'brim', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

const el = id => document.getElementById(id);
const nextBtn = el('next'), captionEl = el('caption');
const goalNum = document.querySelector('#goal .num'), goalDen = document.querySelector('#goal .den');
const splitBtns = Array.from(document.querySelectorAll('#splits .split'));
for (const b of splitBtns) b.setAttribute('aria-label', COPY.splitInto + ' ' + b.dataset.k);
const vessels = { left: mountVessel(el('left')), right: mountVessel(el('right')) };
nextBtn.setAttribute('aria-label', COPY.next);
document.body.dataset.mode = MODE;
if (NAMED_MODE) document.body.dataset.fixed = MODE;
/* the doors: #start is the link's mode, or MATCHING when the link names none, beside the other three */
const DOOR = { matching: ['doorMatching', COPY.startMatching], half: ['doorHalf', COPY.startHalf], brim: ['doorBrim', COPY.startBrim], level: ['doorLevel', COPY.startLevel] };
const firstMode = NAMED_MODE ? MODE : 'matching';
el('start').dataset.mode = firstMode;
for (const [id, m] of [['start', firstMode], ['start-half', 'half'], ['start-brim', 'brim'], ['start-level', 'level']]) {
  el(id).setAttribute('aria-label', DOOR[m][1]);
  el(id).append(spriteCanvas(DOOR[m][0], 3));
}

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const value = f => f.n / f.d;

/* one seeded run: sessions dealt back to back from one generator, so Node replays the page */
let r = rng(CONFIG.seed >>> 0);
let streak = 0, halfOpen = false;
/* rounds finished in this run; kept in memory only, so a reload in the middle of a run earns nothing */
let runRounds = 0;
let session = 0, pairs = dealSession(r, { mode: MODE, grade: GRADE, session, sameSideOpen: halfOpen }), index = -1, round = -1;
let pair = null, reveal = null, byKey = false;
const results = [];

function startRound() {
  round++;
  index++;
  if (index >= SESSION_LENGTH) {
    session++;
    index = 0;
    pairs = dealSession(r, { mode: MODE, grade: GRADE, session, sameSideOpen: halfOpen });
  }
  pair = pairs[index];
  reveal = null;
  if (MODE === 'level') { startLevel(); return; }
  for (const side of ['left', 'right']) {
    const v = vessels[side], f = pair[side];
    setFraction(v, f);
    clearFill(v);
    v.button.setAttribute('aria-pressed', 'false');
    v.button.setAttribute('aria-label', COPY[side] + ', ' + f.n + ' ' + COPY.over + ' ' + f.d);
  }
  captionEl.textContent = '';
  nextBtn.hidden = true;
}

/* LEVEL (4b): one glass holding the target, etched into its parts; the goal names the same amount in more parts; the child
   picks how many pieces to cut each part into */
function startLevel() {
  const v = vessels.left, t = pair.target;
  setFraction(v, t);
  clearFill(v);
  clearEtch(v);
  if (MODE === 'level') holdLevel(v, value(t));
  etch(v, t.d, 'mark');
  v.button.setAttribute('aria-label', COPY.glass + ', ' + t.n + ' ' + COPY.over + ' ' + t.d);
  goalNum.textContent = String(pair.want.n);
  goalDen.textContent = String(pair.want.d);
  el('goal').setAttribute('aria-label', COPY.goal + ' ' + pair.want.n + ' ' + COPY.over + ' ' + pair.want.d);
  for (const b of splitBtns) { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-disabled', 'false'); }
  captionEl.textContent = '';
  nextBtn.hidden = true;
}

function chooseSplit(k) {
  if (MODE !== 'level' || reveal || !el('first').hidden || shelf.shown()) return;
  const correct = k === pair.split;
  const result = { round, session, index, split: k, truth: pair.split, correct, target: pair.target, want: pair.want, byKey, revealAt: performance.now() };
  results.push(result);
  /* A1: one tap for the split chosen */
  sound('tap');
  splitBtns.forEach(b => { b.setAttribute('aria-disabled', 'true'); if (Number(b.dataset.k) === k) b.setAttribute('aria-pressed', 'true'); });
  const v = vessels.left, t = pair.target, ms = reduced() ? 0 : ETCH;
  /* the reveal contract: the child's split drawn first, the true split second, the same on every path */
  etch(v, t.d * k, 'mark', 0);
  etch(v, t.d * pair.split, 'truth', 0);
  const state = { done: false, captioned: false, rung: false };
  reveal = state;
  const frame = now => {
    const dt = Math.max(0, now - result.revealAt), p = ms ? Math.min(1, dt / ms) : 1;
    fadeEtch(v, 'mark', Math.min(1, p / 0.5));
    fadeEtch(v, 'truth', Math.max(0, Math.min(1, (p - 0.5) / 0.5)));
    /* A1: one ring as the true split comes, one settle when it has */
    if (p >= 0.5 && !state.rung) { state.rung = true; sound('ring'); }
    if (p >= 1 && !state.captioned) {
      state.captioned = true;
      captionEl.textContent = caption(pair.target, pair.want, true);
      sound('settle');
    }
    if (dt >= ms + HOLD) {
      state.done = true;
      nextBtn.hidden = false;
      if (result.byKey) nextBtn.focus();
      return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* a glass chosen: scored by engine.js, then the reveal */
function choose(side) {
  if (MODE === 'level' || reveal || !el('first').hidden || shelf.shown()) return;
  const s = scoreChoice(pair, side);
  const result = { round, session, index, side, correct: s.correct, larger: s.larger, left: pair.left, right: pair.right,
    caseType: pair.caseType, byKey, revealAt: performance.now() };
  results.push(result);
  streak = s.correct ? streak + 1 : 0;
  if (MODE === 'half' && streak >= STREAK_FOR_SAME_SIDE) halfOpen = true;
  /* A1: one tap for the glass chosen, one pour for the fill */
  sound('tap');
  sound('pour');
  vessels[side].button.setAttribute('aria-pressed', 'true');
  runReveal(result);
}

function runReveal(result) {
  const ms = reduced() ? 0 : REVEAL, other = result.side === 'left' ? 'right' : 'left';
  const bandMs = MODE === 'brim' && !reduced() ? BAND : 0, total = ms + bandMs;
  const state = { done: false, captioned: false };
  reveal = state;
  const frame = now => {
    /* ⛔ YONDER's scar: a frame's time can come a hair before the reveal began; clamp it before it drives anything */
    const dt = Math.max(0, now - result.revealAt), p = ms ? Math.min(1, dt / ms) : 1;
    fillTo(vessels[result.side], value(pair[result.side]), Math.min(1, p / 0.5));
    fillTo(vessels[other], value(pair[other]), Math.max(0, Math.min(1, (p - 0.5) / 0.5)));
    /* BRIM: once both have filled, the empty band above each lights and its water dims (B10) */
    const q = MODE !== 'brim' || p < 1 ? 0 : bandMs ? Math.min(1, (dt - ms) / bandMs) : 1;
    if (MODE === 'brim' && q > 0) for (const side of ['left', 'right']) lightEmpty(vessels[side], value(pair[side]), q);
    if (MODE === 'half' && p >= 1) for (const side of ['left', 'right']) brightenHalf(vessels[side], true);
    if (p >= 1 && (MODE !== 'brim' || q >= 1) && !state.captioned) {
      state.captioned = true;
      const a = pair.left, b = pair.right, leftBig = value(a) >= value(b), big = leftBig ? a : b, small = leftBig ? b : a;
      captionEl.textContent = MODE === 'brim' ? brimCaption(big) + ' ' + COPY.and + ' ' + brimCaption(small) : caption(big, small, value(a) === value(b));
      /* A1: one settle when the reveal has landed */
      sound('settle');
    }
    if (dt >= total + HOLD) {
      state.done = true;
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
  runRounds++;
  const ended = runRounds >= RUN;
  if (ended) runRounds = 0;
  startRound();
  if (ended) shelf.earn(byKey);
  else if (byKey) focusRound();
}
/* focus follows a keyboard onto the round's first control: a glass, or in LEVEL the first split */
function focusRound() {
  (MODE === 'level' ? splitBtns[0] : vessels.left.button).focus();
}

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
el('left').addEventListener('click', () => choose('left'));
el('right').addEventListener('click', () => choose('right'));
for (const b of splitBtns) b.addEventListener('click', () => chooseSplit(Number(b.dataset.k)));
nextBtn.addEventListener('click', next);
/* a door: its mode, dealt fresh from the seed when it is not the mode already dealt, so Node replays it the same */
function begin(mode) {
  if (mode !== MODE) {
    MODE = mode;
    document.body.dataset.mode = mode;
    r = rng(CONFIG.seed >>> 0);
    session = 0; index = -1; round = -1; streak = 0; halfOpen = false; runRounds = 0;
    results.length = 0;
    pairs = dealSession(r, { mode: MODE, grade: GRADE, session, sameSideOpen: halfOpen });
    startRound();
  }
  el('first').hidden = true;
  if (byKey) focusRound();
}
el('start').addEventListener('click', () => begin(el('start').dataset.mode));
for (const m of ['half', 'brim', 'level']) el('start-' + m).addEventListener('click', () => begin(m));

/* the shelf, over the round that follows a run's end; go returns to it */
const shelf = mountShelf({ host: document.body, copy: { again: COPY.again }, store, gameId: 'brim', schema: SCHEMA,
  onGo: () => { if (byKey) focusRound(); } });

startRound();

window.BRIM = {
  ready: true,
  results,
  pair: () => JSON.parse(JSON.stringify(pair)),
  round: () => round,
  session: () => session,
  revealDone: () => !!(reveal && reveal.done),
  level: side => Number(vessels[side].water.dataset.level || 0),
  streak: () => streak,
  halfOpen: () => halfOpen,
  band: side => ({ lit: Number(vessels[side].band.dataset.lit || 0), h: parseFloat(vessels[side].band.style.height || '0'), dim: vessels[side].water.classList.contains('dim') }),
  halfBright: side => vessels[side].half.classList.contains('bright'),
  /* LEVEL: the water's top and every etch line, as drawn */
  glassNow: () => {
    const g = vessels.left.glass, gr = g.getBoundingClientRect(), bottom = gr.top + g.clientTop + g.clientHeight;
    /* each line read at its stroke's centre, where the eye reads it */
    const lines = kind => Array.from(g.querySelectorAll('.etch.' + kind)).map(e => ({ up: bottom - (e.getBoundingClientRect().top + parseFloat(getComputedStyle(e).borderTopWidth) / 2), o: Number(e.style.opacity) }));
    return { waterTop: vessels.left.water.getBoundingClientRect().top, inner: g.clientHeight, mark: lines('mark'), truth: lines('truth') };
  },
  config: () => ({ mode: MODE, grade: String(CONFIG.grade), count: String(CONFIG.count) }),
  runLength: () => RUN,
  shelf: { shown: () => shelf.shown(), cells: () => shelf.cells() },
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    renderLoud: (seconds, master) => audio.renderLoud(loudest(seconds), seconds, master),
    ringPeaks
  }
};

/* the loudest a child can make, a second at a time: a glass tapped, the pour, a level ring and the settle */
function loudest(seconds) {
  const pattern = [];
  for (let t = 0; t < seconds; t += 1) pattern.push([t, 'tap'], [t + 0.05, 'pour'], [t + 0.4, 'ring'], [t + 0.8, 'settle']);
  return pattern;
}

/* the ring rendered offline, and the two strongest frequencies in it, found by scanning 200 to 2000 Hz a hertz at a time */
function ringPeaks() {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OAC) return Promise.reject(new Error('no OfflineAudioContext'));
  const sr = 22050, ctx = new OAC(1, Math.ceil(sr * 0.6), sr);
  audio.voices.ring.build(ctx, ctx.destination, 0);
  return ctx.startRendering().then(buf => {
    const d = buf.getChannelData(0), n = d.length, power = [];
    for (let f = 200; f <= 2000; f++) {
      const w = 2 * Math.PI * f / sr, c = 2 * Math.cos(w);
      let s1 = 0, s2 = 0;
      for (let i = 0; i < n; i++) { const s0 = d[i] + c * s1 - s2; s2 = s1; s1 = s0; }
      power.push({ f, p: s1 * s1 + s2 * s2 - c * s1 * s2 });
    }
    const sorted = power.slice().sort((a, b) => b.p - a.p);
    const first = sorted[0], second = sorted.find(x => Math.abs(x.f - first.f) > 50);
    return [first.f, second.f].sort((a, b) => a - b);
  });
}

/* the offline shell: one worker for the game, its address carrying the stamp */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js?v=20260916b').catch(() => {});
