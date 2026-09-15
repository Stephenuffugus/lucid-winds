/* GLIMPSE, the page (plans/glimpse/HANDOFF-GLIMPSE.md P1): FLASH, the mask, the pads and the reveal.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands. A round: the dark meadow; fireflies blink on for
 * the flash CORE's schedule times on animation frames (S1), measured from the frame they were painted (S2); on the frame they
 * go the grass stirs (GL1, S3) and stays 200 ms; then the pads for the round's range, each a numeral and its dots (GL7). A pad
 * chosen: the fireflies fade back where they were, then fly into a dice face or a ten frame one at a time, and the numeral
 * comes. The same reveal on every path, right or wrong. Nothing on the screen shows time (GL3).
 */
import { settings, tokens, audio, SETTINGS_DEFAULTS, parseConfig, rng, adaptTier, schedule } from '../math/core/core.js?v=20260916c';
import { dealSession, scoreAnswer, flashMs, padsFor, padRows, arrange, SESSION_LENGTH } from './engine.js?v=20260916c';
import { COPY, PALETTE } from './content.js?v=20260916c';
import { GLIMPSE_SCHEMA } from './config.js?v=20260916c';
import { glowCanvas, fitMeadow, drawNight, drawFireflies, drawMask, padPattern } from './render.js?v=20260916c';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const CONFIG = parseConfig(location.search, GLIMPSE_SCHEMA);
const MODE = CONFIG.mode;
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
el('start').setAttribute('aria-label', COPY.start);
document.body.dataset.mode = MODE;
const glow = glowCanvas('glowBlue');

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
/* a wait on animation frames against a measured deadline, never a timer (S1) */
const waitMs = ms => new Promise(resolve => { const t0 = performance.now(); const tick = t => (t - t0 >= ms ? resolve(t) : requestAnimationFrame(tick)); requestAnimationFrame(tick); });

const r = rng(CONFIG.seed >>> 0);
const results = [], flashLog = [];
let session = -1, pairs = [], index = SESSION_LENGTH, round = -1, current = null, phase = 'idle', shownAt = 0, reveal = null, byKey = false;
/* a slow right answer counts and does not climb (GL3): it is left out of what the tier reads */
const tierNow = () => adaptTier(results.filter(x => x.correct === x.climbs || !x.correct).map(x => x.correct), TIER_CONFIG);

function renderPads(round) {
  padsEl.textContent = '';
  for (const row of padRows(padsFor(round))) {
    const rowEl = document.createElement('div');
    rowEl.className = 'pad-row';
    for (const value of row) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lw-btn pad';
      b.dataset.value = String(value);
      b.setAttribute('aria-disabled', 'true');
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', COPY.pad + ' ' + value);
      const num = document.createElement('span');
      num.className = 'pad-num';
      num.textContent = String(value);
      b.append(num, padPattern(Number(value)));
      b.addEventListener('click', () => choose(Number(value)));
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

function runFlash(forRound) {
  if (forRound !== round) return;
  const { ctx, W } = fitMeadow(canvas);
  const durationMs = flashMs(current.count, CONFIG.flash === 'auto' ? undefined : CONFIG.flash);
  phase = 'flash';
  let maskedAt = null;
  schedule.flash({
    durationMs,
    onShow: () => {
      drawFireflies(ctx, W, current.dots, glow);
      /* GL2: one sound for the one flash */
      sound('blink');
    },
    onPainted: t => { shownAt = t; },
    onHide: () => drawNight(ctx, W),
    onMasked: () => { drawMask(ctx, W, round * 7); maskedAt = performance.now(); phase = 'mask'; }
  }).then(res => {
    flashLog.push({ round, durationMs, shownAt: res.shownAt, hiddenAt: res.hiddenAt, maskedAt: res.maskedAt, interval: res.interval, count: current.count });
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
  const result = { round, session, index, answer: value, truth: current.answer, correct: s.correct, climbs: s.climbs, rt, byKey, revealAt: performance.now() };
  results.push(result);
  phase = 'reveal';
  padsEl.querySelectorAll('.pad').forEach(b => { if (Number(b.dataset.value) === value) b.setAttribute('aria-pressed', 'true'); });
  setPads(false);
  runReveal(result);
}

/* where the fireflies land: a dice face for six or fewer, a ten frame past that, from a fixed generator so the landing never
   draws from the round's own */
const structureFor = n => arrange(rng(1), n <= 6 ? 'dice' : 'tenframe', n, 'size');

function runReveal(result) {
  const { ctx, W } = fitMeadow(canvas);
  const from = current.dots, to = structureFor(current.count);
  const fade = reduced() ? 0 : FADE, land = reduced() ? 0 : LAND, total = fade + land * from.length;
  const state = { done: false };
  reveal = state;
  const frame = now => {
    const dt = Math.max(0, now - result.revealAt);
    drawNight(ctx, W);
    if (dt < fade) drawFireflies(ctx, W, from, glow, dt / fade);
    else {
      const moved = from.map((d, i) => {
        const p = land ? Math.min(1, Math.max(0, (dt - fade - i * land) / land)) : 1;
        return { x: d.x + (to[i].x - d.x) * p, y: d.y + (to[i].y - d.y) * p, r: d.r + (to[i].r - d.r) * p };
      });
      drawFireflies(ctx, W, moved, glow);
    }
    if (dt >= total && truthEl.hidden) { truthEl.textContent = String(current.count); truthEl.hidden = false; }
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

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
nextBtn.addEventListener('click', next);
el('start').addEventListener('click', () => {
  el('first').hidden = true;
  startRound();
});

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
  /* the page's own flash path for the timing gate: the round's fireflies drawn on the show frame, the mask on the hide frame,
     timed by CORE's schedule, resolving its measured times */
  flashOnce: durationMs => {
    const { ctx, W } = fitMeadow(canvas), dots = current ? current.dots : [];
    return schedule.flash({ durationMs, onShow: () => drawFireflies(ctx, W, dots, glow), onHide: () => drawNight(ctx, W), onMasked: () => drawMask(ctx, W, 0) });
  },
  audio: { sounded: () => audio.log.slice(), clear: () => { audio.log.length = 0; } }
};
