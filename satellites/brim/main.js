/* BRIM, the page (plans/brim/HANDOFF-BRIM.md P1): MATCHING and the reveal.
 *
 * The rules are engine.js's; this file draws them and takes a child's hands. A round: two glasses the same size, empty, a
 * fraction under each; a tap (or Enter on a focused glass) commits. Then the chosen glass fills, then the other, each rising
 * past its level by a hair and settling onto it exactly, and one line of fact appears under them (B1: nothing fills before
 * the commit; the reveal contract: the same on every path, right or wrong). Next is unavailable until it is done.
 *
 * Rounds come in sessions of twelve from dealSession, which builds B2, B3 and B6 in; the page never picks a pair itself.
 */
import { settings, tokens, audio, SETTINGS_DEFAULTS, parseConfig, rng } from '../math/core/core.js?v=20260916b';
import { dealSession, scoreChoice, SESSION_LENGTH } from './engine.js?v=20260916b';
import { COPY, PALETTE, caption, brimCaption } from './content.js?v=20260916b';
import { BRIM_SCHEMA } from './config.js?v=20260916b';
import { mountVessel, setFraction, clearFill, fillTo, brightenHalf, lightEmpty } from './render.js?v=20260916b';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const CONFIG = parseConfig(location.search, BRIM_SCHEMA);
/* the reveal, in ms: the chosen glass over the first half, the other over the second; with less motion the fill is instant
   (the handoff's test gate) and the order still shows in the hold */
const REVEAL = 1400, HOLD = 450;
/* BRIM mode's band lights over this long after the fill (instant with less motion) */
const BAND = 500;
/* HALF: five right in a row, and the next session may serve pairs on one side of a half (the handoff's step 5) */
const STREAK_FOR_SAME_SIDE = 5;
const MODE = CONFIG.mode, GRADE = Number(CONFIG.grade);

tokens.inject({ paper: PALETTE.paper, ink: PALETTE.ink, accent: PALETTE.teal });
const panel = settings.mount({ gameId: 'brim', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

const el = id => document.getElementById(id);
const nextBtn = el('next'), captionEl = el('caption');
const vessels = { left: mountVessel(el('left')), right: mountVessel(el('right')) };
nextBtn.setAttribute('aria-label', COPY.next);
el('start').setAttribute('aria-label', COPY.start);
document.body.dataset.mode = MODE;

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const value = f => f.n / f.d;

/* one seeded run: sessions dealt back to back from one generator, so Node replays the page */
const r = rng(CONFIG.seed >>> 0);
let streak = 0, halfOpen = false;
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

/* a glass chosen: scored by engine.js, then the reveal */
function choose(side) {
  if (reveal || !el('first').hidden) return;
  const s = scoreChoice(pair, side);
  const result = { round, session, index, side, correct: s.correct, larger: s.larger, left: pair.left, right: pair.right,
    caseType: pair.caseType, byKey, revealAt: performance.now() };
  results.push(result);
  streak = s.correct ? streak + 1 : 0;
  if (MODE === 'half' && streak >= STREAK_FOR_SAME_SIDE) halfOpen = true;
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
  startRound();
  if (byKey) vessels.left.button.focus();
}

window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
el('left').addEventListener('click', () => choose('left'));
el('right').addEventListener('click', () => choose('right'));
nextBtn.addEventListener('click', next);
el('start').addEventListener('click', () => {
  el('first').hidden = true;
  if (byKey) vessels.left.button.focus();
});

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
  config: () => ({ mode: MODE, grade: String(CONFIG.grade), count: String(CONFIG.count) })
};
