/* GLIMPSE, the page (plans/glimpse/HANDOFF-GLIMPSE.md P1 and P2): FLASH, GROUPS, FRAME and SPREAD.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands. A round: the dark meadow; fireflies blink on for
 * the flash CORE's schedule times on animation frames (S1), measured from the frame they were painted (S2); on the frame they
 * go the grass stirs (GL1, S3) and stays 200 ms; then the pads for the round's range, each a numeral and its dots, or SPREAD's
 * three pictures (GL7). A pad chosen: the fireflies fade back where they were, then fly into structure one at a time (a dice
 * face or a ten frame; SPREAD's two swarms each into its own ten frame, the arrangement changed and the number not), and the
 * numeral comes. FRAME shows its frame with the flash, and at the reveal its empty cells glow. The same reveal on every path,
 * right or wrong. Nothing on the screen shows time (GL3).
 */
import { settings, tokens, audio, SETTINGS_DEFAULTS, parseConfig, rng, adaptTier, schedule } from '../math/core/core.js?v=20260916c';
import { dealSession, scoreAnswer, flashMs, padsFor, padRows, arrange, SESSION_LENGTH, TENFRAME_STEP } from './engine.js?v=20260916c';
import { COPY, PALETTE } from './content.js?v=20260916c';
import { GLIMPSE_SCHEMA } from './config.js?v=20260916c';
import { glowCanvas, fitMeadow, drawNight, drawFireflies, drawFrame, drawMask, padPattern, padSymbol, doorPicture } from './render.js?v=20260916c';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const CONFIG = parseConfig(location.search, GLIMPSE_SCHEMA);
/* the mode: a link that names one keeps it (one door); otherwise the first screen's four doors choose */
const NAMED_MODE = /[?&]mode=/.test(location.search);
let MODE = CONFIG.mode;
const TIER_CONFIG = Object.freeze({ tiers: 5, up: 3, down: 2, start: 0, floor: 0 });
/* the mask's 200 ms (GL1), the wait before a flash, and the reveal: the fade back, each landing, the hold */
const MASK_MS = 200, BEFORE_MS = 500, FADE = 400, LAND = 160, HOLD = 450;

/* GL2: one voice, played once a flash from the flash's show, never once a firefly. ⛔ the easiest fatal mistake in the
   catalog: a sound per firefly lets a child count by ear */
audio.define({
  blink: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(660, t + 0.15);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.22);
    }
  }
});
/* ⛔ YONDER's scar: a sound from inside a frame must never end the round */
function sound(name) {
  try { audio.play(name); } catch (e) { /* no sound on this device; the round goes on */ }
}

tokens.inject({ paper: PALETTE.night, ink: PALETTE.ink, accent: PALETTE.amber });
const panel = settings.mount({ gameId: 'glimpse', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

const el = id => document.getElementById(id);
const canvas = el('meadow'), padsEl = el('pads'), truthEl = el('truth'), nextBtn = el('next');
canvas.setAttribute('aria-label', COPY.meadow);
canvas.setAttribute('role', 'img');
nextBtn.setAttribute('aria-label', COPY.next);
document.body.dataset.mode = MODE;
if (NAMED_MODE) document.body.dataset.fixed = MODE;
/* the doors: #start is the link's mode, or FLASH when the link names none, beside the other three */
const DOOR_WORDS = { flash: COPY.startFlash, groups: COPY.startGroups, frame: COPY.startFrame, spread: COPY.startSpread };
const firstMode = NAMED_MODE ? MODE : 'flash';
el('start').dataset.mode = firstMode;
for (const [id, m] of [['start', firstMode], ['start-groups', 'groups'], ['start-frame', 'frame'], ['start-spread', 'spread']]) {
  el(id).setAttribute('aria-label', DOOR_WORDS[m]);
  el(id).append(doorPicture(m));
}
const glow = glowCanvas('glowBlue'), glowAmber = glowCanvas('glowAmber');

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
/* a wait on animation frames against a measured deadline, never a timer (S1) */
const waitMs = ms => new Promise(resolve => { const t0 = performance.now(); const tick = t => (t - t0 >= ms ? resolve(t) : requestAnimationFrame(tick)); requestAnimationFrame(tick); });

let r = rng(CONFIG.seed >>> 0);
const results = [], flashLog = [];
let session = -1, pairs = [], index = SESSION_LENGTH, round = -1, current = null, phase = 'idle', shownAt = 0, reveal = null, byKey = false;
/* a slow right answer counts and does not climb (GL3): it is left out of what the tier reads */
const tierNow = () => adaptTier(results.filter(x => x.correct === x.climbs || !x.correct).map(x => x.correct), TIER_CONFIG);
const countOf = x => (x.mode === 'spread' ? Math.max(x.a.n, x.b.n) : x.count);
const parse = v => (/^\d+$/.test(v) ? Number(v) : v);

/* where a round's fireflies stand: one field, or SPREAD's two side by side, blue on the left and amber on the right (GL8) */
function fieldsOf(x, W) {
  if (x.mode !== 'spread') return [{ dots: x.dots, S: W, ox: 0, oy: 0, glow }];
  const half = Math.floor(W / 2) - 4, oy = Math.round((W - half) / 2);
  return [{ dots: x.a.dots, S: half, ox: 0, oy, glow }, { dots: x.b.dots, S: half, ox: W - half, oy, glow: glowAmber }];
}

function renderPads(x) {
  padsEl.textContent = '';
  for (const row of padRows(padsFor(x))) {
    const rowEl = document.createElement('div');
    rowEl.className = 'pad-row';
    for (const value of row) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lw-btn pad';
      b.dataset.value = String(value);
      b.setAttribute('aria-disabled', 'true');
      b.setAttribute('aria-pressed', 'false');
      if (typeof value === 'number') {
        b.setAttribute('aria-label', COPY.pad + ' ' + value);
        const num = document.createElement('span');
        num.className = 'pad-num';
        num.textContent = String(value);
        b.append(num, padPattern(value));
      } else {
        b.setAttribute('aria-label', COPY[value]);
        b.append(padSymbol(value));
      }
      b.addEventListener('click', () => choose(parse(b.dataset.value)));
      rowEl.append(b);
    }
    padsEl.append(rowEl);
  }
}
const setPads = on => padsEl.querySelectorAll('.pad').forEach(b => b.setAttribute('aria-disabled', on ? 'false' : 'true'));

function startRound() {
  round++;
  index++;
  if (index >= SESSION_LENGTH) {
    session++;
    index = 0;
    pairs = dealSession(r, { mode: MODE, tier: tierNow(), session });
  }
  current = pairs[index];
  reveal = null;
  truthEl.hidden = true;
  truthEl.textContent = '';
  nextBtn.hidden = true;
  renderPads(current);
  const { ctx, W } = fitMeadow(canvas);
  drawNight(ctx, W);
  phase = 'waiting';
  waitMs(BEFORE_MS).then(() => runFlash(round));
}

/* the stimulus, drawn on the flash's show frame: FRAME's frame first, then every field's fireflies */
function drawStimulus(ctx, W, x) {
  drawNight(ctx, W);
  if (x.mode === 'frame') drawFrame(ctx, W, x.dots, TENFRAME_STEP);
  for (const f of fieldsOf(x, W)) drawFireflies(ctx, f.S, f.dots, f.glow, 1, f.ox, f.oy);
}

function runFlash(forRound) {
  if (forRound !== round) return;
  const { ctx, W } = fitMeadow(canvas);
  const durationMs = flashMs(countOf(current), CONFIG.flash === 'auto' ? undefined : CONFIG.flash);
  phase = 'flash';
  schedule.flash({
    durationMs,
    onShow: () => {
      drawStimulus(ctx, W, current);
      /* GL2: one sound for the one flash */
      sound('blink');
    },
    onPainted: t => { shownAt = t; },
    onHide: () => drawNight(ctx, W),
    onMasked: () => { drawMask(ctx, W, round * 7); phase = 'mask'; }
  }).then(res => {
    flashLog.push({ round, durationMs, shownAt: res.shownAt, hiddenAt: res.hiddenAt, maskedAt: res.maskedAt, interval: res.interval, count: countOf(current), mode: current.mode });
    return waitMs(MASK_MS);
  }).then(() => {
    if (forRound !== round) return;
    drawNight(ctx, W);
    phase = 'answer';
    setPads(true);
    if (byKey) { const first = padsEl.querySelector('.pad'); if (first) first.focus(); }
  });
}

function choose(value) {
  if (phase !== 'answer') return;
  const rt = performance.now() - shownAt, s = scoreAnswer(current, value, rt);
  const result = { round, session, index, mode: current.mode, answer: value, truth: current.answer, correct: s.correct, climbs: s.climbs, rt, byKey, revealAt: performance.now() };
  results.push(result);
  phase = 'reveal';
  padsEl.querySelectorAll('.pad').forEach(b => { if (parse(b.dataset.value) === value) b.setAttribute('aria-pressed', 'true'); });
  setPads(false);
  runReveal(result);
}

/* where a field's fireflies land: a dice face for six or fewer, a ten frame past that (SPREAD always a ten frame, FRAME
   where they already stand), from a fixed generator so the landing never draws from the round's own */
function landingOf(x, dots) {
  if (x.mode === 'frame') return dots;
  const n = dots.length;
  return arrange(rng(1), x.mode !== 'spread' && n <= 6 ? 'dice' : 'tenframe', n, 'size');
}
const truthText = x => (x.mode === 'spread' ? x.a.n + '   ' + x.b.n : String(x.answer));

function runReveal(result) {
  const { ctx, W } = fitMeadow(canvas);
  const x = current, fields = fieldsOf(x, W).map(f => Object.assign({}, f, { to: landingOf(x, f.dots) }));
  const most = Math.max(...fields.map(f => f.dots.length));
  const fade = reduced() ? 0 : FADE, land = reduced() ? 0 : LAND, total = fade + land * most;
  const state = { done: false };
  reveal = state;
  const frame = now => {
    const dt = Math.max(0, now - result.revealAt);
    drawNight(ctx, W);
    if (x.mode === 'frame') drawFrame(ctx, W, x.dots, TENFRAME_STEP, x.ask === 'complement' && dt >= fade);
    for (const f of fields) {
      if (dt < fade) { drawFireflies(ctx, f.S, f.dots, f.glow, dt / fade, f.ox, f.oy); continue; }
      const moved = f.dots.map((d, i) => {
        const p = land ? Math.min(1, Math.max(0, (dt - fade - i * land) / land)) : 1;
        return { x: d.x + (f.to[i].x - d.x) * p, y: d.y + (f.to[i].y - d.y) * p, r: d.r + (f.to[i].r - d.r) * p };
      });
      drawFireflies(ctx, f.S, moved, f.glow, 1, f.ox, f.oy);
    }
    if (dt >= total && truthEl.hidden) { truthEl.textContent = truthText(x); truthEl.hidden = false; }
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
  startRound();
}

/* a door: its mode, dealt fresh from the seed when it is not the mode the page opened on */
function begin(mode) {
  if (mode !== MODE) {
    MODE = mode;
    document.body.dataset.mode = mode;
    r = rng(CONFIG.seed >>> 0);
    session = -1; index = SESSION_LENGTH; round = -1;
    results.length = 0; flashLog.length = 0;
  }
  el('first').hidden = true;
  startRound();
}

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
nextBtn.addEventListener('click', next);
el('start').addEventListener('click', () => begin(el('start').dataset.mode));
for (const m of ['groups', 'frame', 'spread']) el('start-' + m).addEventListener('click', () => begin(m));

window.GLIMPSE = {
  ready: true,
  results,
  round: () => round,
  phase: () => phase,
  current: () => (current ? JSON.parse(JSON.stringify(current)) : null),
  flashLog: () => flashLog.slice(),
  revealDone: () => !!(reveal && reveal.done),
  tier: tierNow,
  config: () => ({ mode: MODE, flash: CONFIG.flash, count: String(CONFIG.count) }),
  audio: { sounded: () => audio.log.slice(), clear: () => { audio.log.length = 0; } },
  /* the page's own flash path for the timing gate: the round's stimulus drawn on the show frame, the mask on the hide frame,
     timed by CORE's schedule, resolving its measured times */
  flashOnce: durationMs => {
    const { ctx, W } = fitMeadow(canvas);
    return schedule.flash({ durationMs, onShow: () => { if (current) drawStimulus(ctx, W, current); }, onHide: () => drawNight(ctx, W), onMasked: () => drawMask(ctx, W, 0) });
  }
};
