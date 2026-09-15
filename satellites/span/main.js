/* SPAN, the page (plans/span/HANDOFF-SPAN.md P1 and P2): the canyon, the modes, the pier reveal and the viaduct.
 *
 * The rules are engine.js's; this file only draws them and takes a child's hands. Mode 2 THE BLANK: a
 * stone goes on the blank's pier by a drag, five by a long press on the supply, one comes back by a tap on
 * that pier; by keyboard, arrow up and down add and take away and Enter lays the span. Mode 1 TRUE OR NOT:
 * two choices, the same or not the same, and the span is laid on either. Mode 3 RELATIONAL: a stone 1, a slab
 * 10 and a block 100, each with its numeral. There is no number pad and no digit key (S5).
 *
 * The reveal contract's order: while a child builds, both piers stand at one neutral height and the stones put
 * on sit in a labelled stack on the blank's pier, so nothing drawn tells the sides apart; the span goes down
 * when the child lays it (the seat: it drops the last inch and dust lifts), and only then do the piers move to
 * their true heights, the shortfall shaded between them, the caption a fact. The same animation on every path;
 * the seat is one sound per event (A1).
 *
 * A run is `count` items. The last item's next ends the run: one arch goes on the viaduct (thirty at most), and
 * start plays the next mode on the next seed, unless a teacher's link named the mode.
 */
import { settings, store, tokens, audio, SETTINGS_DEFAULTS, parseConfig, rng, collectOnce } from '../math/core/core.js?v=20260915h';
import { generateSet, evaluate, valueOf } from './engine.js?v=20260915h';
import { COPY, PALETTE } from './content.js?v=20260915h';
import { SPAN_SCHEMA } from './config.js?v=20260915h';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const MODES = SPAN_SCHEMA.mode.values;
/* the one schema the teacher's link builder registers too (config.js; test/config.mjs holds them equal) */
const CONFIG = parseConfig(location.search, SPAN_SCHEMA);
/* a link that names a mode is a teacher's choice and holds run after run */
const FIXED = MODES.some(m => new RegExp('(^|[?&])mode=' + m + '(&|$)').test(location.search));
/* a run is whole blocks of five (S1), which is all the schema offers */
const SIZE = Number(CONFIG.count);
const ARCHES = 30;
let MODE = CONFIG.mode, JUDGED = MODE === 'judge', SET = [], run = 0;

tokens.inject({ paper: PALETTE.paper, ink: PALETTE.ink, accent: PALETTE.span });
const panel = settings.mount({ gameId: 'span', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);
/* the seat: a deep stone set down, one per event (A1: never one per stone counted) */
audio.define({
  seat: {
    build(ac, out, t, rand) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(92, t);
      o.frequency.exponentialRampToValueAtTime(52, t + 0.22);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.34, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.34);
      const len = Math.floor(ac.sampleRate * 0.08), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (rand() * 2 - 1) * Math.pow(1 - i / len, 2);
      const src = ac.createBufferSource(), lp = ac.createBiquadFilter(), ng = ac.createGain();
      src.buffer = buf;
      lp.type = 'lowpass'; lp.frequency.value = 320;
      ng.gain.setValueAtTime(0.1, t);
      src.connect(lp); lp.connect(ng); ng.connect(out);
      src.start(t); src.stop(t + 0.09);
    }
  }
});

const el = id => document.getElementById(id);
const equationEl = el('equation'), canyon = el('canyon'), pierL = el('pier-left'), pierR = el('pier-right');
const spanEl = el('span'), shortfall = el('shortfall'), caption = el('caption'), stack = el('stack');
const sources = Array.from(document.querySelectorAll('#supply .stone-source')), layBtn = el('lay'), nextBtn = el('next');
const sameBtn = el('same'), apartBtn = el('apart'), viaduct = el('viaduct'), archesEl = el('arches'), againBtn = el('again');
sources.forEach(src => {
  const value = Number(src.dataset.value);
  src.setAttribute('aria-label', value === 100 ? COPY.block : value === 10 ? COPY.slab : COPY.stone);
});
layBtn.setAttribute('aria-label', COPY.lay);
nextBtn.setAttribute('aria-label', COPY.next);
sameBtn.setAttribute('aria-label', COPY.same);
apartBtn.setAttribute('aria-label', COPY.apart);
againBtn.setAttribute('aria-label', COPY.again);
el('start').setAttribute('aria-label', COPY.start);
canyon.setAttribute('aria-label', COPY.canyon);

/* BASE: a pier's footing; TOP_ROOM: the least sky left over the taller pier; SEAT and LIFT: the last inch, in ms and
   px; DUST: how long a puff lives; TILT: the most a span dips, in degrees, when its far end cannot reach the lower pier */
const BASE = 24, TOP_ROOM = 70, REVEAL = 600, HOLD = 400, SEAT = 200, LIFT = 14, DUST = 550, TILT = 4, SPAN_H = 10;
/* the settings panel's switch and the device's own wish both count */
const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const results = [];
let index = 0, count = 0, laid = false, reveal = null, selected = 'left';

const eq = () => SET[index];
const blankSide = () => eq().left.some(t => t.blank) ? 'left' : 'right';
const blankPier = () => blankSide() === 'left' ? pierL : pierR;
const sides = fill => ({ left: valueOf(eq().left, fill), right: valueOf(eq().right, fill) });
const termText = (terms, fill) => terms.map(t => t.op ? (t.op === '-' ? '−' : '+') : String(t.blank ? fill : t.n)).join(' ');
/* a side that is one number is named once: "One side is 9", "the other side is 9"; a value never starts a line alone,
   so the space before it does not break */
const tie = words => words.replace(/ $/, ' ');
const sideText = (terms, fill, value, first) => terms.length === 1
  ? tie(first ? COPY.oneSide : COPY.otherSide) + value
  : termText(terms, fill) + tie(COPY.is) + value;
/* two thirds of the way up, so the pier tops stand clear of the horizon and never read as the ground's edge */
const neutral = () => BASE + (canyon.clientHeight - BASE - TOP_ROOM) * 2 / 3;

/* each side is one group that never breaks across lines, so the equation can only wrap at the sign */
function renderEquation() {
  equationEl.textContent = '';
  const add = (parent, t, side) => {
    const span = document.createElement('span');
    span.className = 'term';
    if (t.op) { span.dataset.op = t.op; span.textContent = t.op === '-' ? '−' : t.op; }
    else if (t.blank) { span.dataset.blank = ''; span.dataset.side = side; span.dataset.count = String(count); span.textContent = count ? String(count) : ''; }
    else { span.dataset.n = String(t.n); span.dataset.side = side; span.textContent = String(t.n); }
    parent.append(span);
  };
  const group = side => { const g = document.createElement('span'); g.className = 'side'; g.dataset.group = side; return g; };
  const left = group('left'), right = group('right');
  eq().left.forEach(t => add(left, t, 'left'));
  eq().right.forEach(t => add(right, t, 'right'));
  equationEl.append(left);
  add(equationEl, { op: '=' });
  equationEl.append(right);
}

/* while building: one neutral height for both piers, whatever the stones; the stones as a labelled stack on the
   blank's pier; no span until it is laid. A side below zero cannot be laid. */
function drawBuild() {
  const v = sides(count), n = neutral(), side = blankSide();
  pierL.style.height = n + 'px';
  pierR.style.height = n + 'px';
  stack.hidden = count === 0;
  stack.textContent = String(count);
  stack.style.left = side === 'left' ? '12%' : '';
  stack.style.right = side === 'right' ? '12%' : '';
  stack.style.bottom = n + 'px';
  pierL.classList.toggle('selected', selected === 'left' && !laid && !JUDGED);
  pierR.classList.toggle('selected', selected === 'right' && !laid && !JUDGED);
  layBtn.setAttribute('aria-disabled', v.left >= 0 && v.right >= 0 && !laid ? 'false' : 'true');
}

/* dust at canyon point (x, y): a few puffs rise and fade after delay ms, and are gone after DUST more */
function dust(x, y, delay) {
  if (reduced()) return;
  [-16, -7, 7, 16].forEach(dx => {
    const d = document.createElement('div');
    d.className = 'dust';
    d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.opacity = '0';
    canyon.append(d);
    d.animate([{ opacity: 0, transform: 'translate(0, 0)' }, { opacity: 0.9, transform: 'translate(0, 0)', offset: delay / (delay + DUST) },
      { opacity: 0, transform: 'translate(' + dx + 'px, -16px)' }], { duration: delay + DUST, easing: 'linear' });
    setTimeout(() => d.remove(), delay + DUST);
  });
}

/* a stone drops the last inch onto the stack, and dust lifts where it lands */
function seatStone() {
  if (reduced() || stack.hidden) return;
  stack.animate([{ transform: 'translateY(-' + LIFT + 'px)' }, { transform: 'translateY(0)' }], { duration: SEAT, easing: 'cubic-bezier(0.55, 0, 1, 0.45)' });
  const y = stack.offsetTop + stack.offsetHeight;
  dust(stack.offsetLeft, y, SEAT);
  dust(stack.offsetLeft + stack.offsetWidth, y, SEAT);
}

function setCount(n) {
  if (laid || JUDGED) return;
  count = Math.max(0, Math.min(999, n));
  renderEquation();
  drawBuild();
}
function addStones(n) {
  if (laid || JUDGED) return;
  setCount(count + n);
  audio.play('seat');
  seatStone();
}

/* lay the span: THE BLANK with the stones on the pier, TRUE OR NOT with the child's choice ('same' or 'apart') */
function lay(choice) {
  if (laid) return;
  if (JUDGED && choice !== 'same' && choice !== 'apart') return;
  const fill = JUDGED ? null : count;
  const v = sides(fill);
  if (v.left < 0 || v.right < 0) return;
  laid = true;
  layBtn.setAttribute('aria-disabled', 'true');
  if (JUDGED) {
    (choice === 'same' ? sameBtn : apartBtn).setAttribute('aria-pressed', 'true');
    sameBtn.setAttribute('aria-disabled', 'true');
    apartBtn.setAttribute('aria-disabled', 'true');
  }
  pierL.classList.remove('selected');
  pierR.classList.remove('selected');
  caption.textContent = v.left === v.right
    ? termText(eq().left, fill) + COPY.sameAs + termText(eq().right, fill)
    : sideText(eq().left, fill, v.left, true) + COPY.and + sideText(eq().right, fill, v.right, false);
  /* the taller pier leaves room for the caption over it, however many lines the caption takes */
  const H = canyon.clientHeight, room = Math.max(TOP_ROOM, caption.offsetTop + caption.offsetHeight + 20);
  const unit = (H - BASE - room) / Math.max(v.left, v.right, 1);
  canyon.dataset.base = String(BASE);
  canyon.dataset.unit = String(unit);
  const from = neutral(), toL = BASE + v.left * unit, toR = BASE + v.right * unit;
  const tilt = Math.sign(v.left - v.right);
  spanEl.dataset.tilt = String(tilt);
  /* the span turns about its end on the taller pier, so that end stays put and the other dips toward the lower one */
  spanEl.style.transformOrigin = tilt > 0 ? 'left center' : tilt < 0 ? 'right center' : 'center';
  const lower = v.left < v.right ? 'left' : 'right';
  shortfall.style.left = lower === 'left' ? '12%' : '';
  shortfall.style.right = lower === 'right' ? '12%' : '';
  stack.hidden = true;
  spanEl.hidden = false;
  const result = { item: index, fill, same: evaluate(eq(), fill), revealAt: performance.now() };
  if (JUDGED) result.choice = choice;
  results.push(result);
  audio.play('seat');
  const lift = reduced() ? 0 : LIFT;
  const state = { done: false };
  reveal = state;
  const draw = now => {
    const dt = now - result.revealAt, p = Math.min(1, Math.max(0, dt / REVEAL)), s = Math.min(1, Math.max(0, dt / SEAT));
    const hL = from + (toL - from) * p, hR = from + (toR - from) * p, tall = Math.max(hL, hR), low = Math.min(hL, hR);
    pierL.style.height = hL + 'px';
    pierR.style.height = hR + 'px';
    shortfall.style.bottom = low + 'px';
    shortfall.style.height = (tall - low) + 'px';
    shortfall.style.opacity = String(p);
    caption.style.opacity = String(p);
    const w = spanEl.offsetWidth || 1, angle = Math.min(TILT, Math.asin(Math.min(1, (tall - low) / w)) * 180 / Math.PI);
    spanEl.style.top = (H - tall - SPAN_H) + 'px';
    spanEl.style.transform = 'translateY(' + (-lift * (1 - s * s)) + 'px) rotate(' + (tilt * angle) + 'deg)';
    return dt;
  };
  draw(result.revealAt);
  const span = spanEl.offsetWidth, foot = H - from;
  dust(spanEl.offsetLeft, foot, SEAT);
  dust(spanEl.offsetLeft + span, foot, SEAT);
  const step = now => {
    if (draw(now) >= REVEAL + HOLD) { draw(result.revealAt + REVEAL + HOLD); state.done = true; nextBtn.hidden = false; return; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* the canyon back to an empty item: no span, no shortfall, no caption, no choice made */
function clearItem() {
  count = 0; laid = false; reveal = null;
  selected = blankSide();
  shortfall.style.opacity = '0'; shortfall.style.height = '0px';
  caption.style.opacity = '0'; caption.textContent = '';
  spanEl.hidden = true; spanEl.dataset.tilt = '0'; spanEl.style.transform = ''; spanEl.style.transformOrigin = '';
  [sameBtn, apartBtn].forEach(b => { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-disabled', 'false'); });
  nextBtn.hidden = true;
  renderEquation();
  drawBuild();
}

function next(byKey) {
  if (!laid) return;
  if (index >= SET.length - 1) { finishRun(byKey); return; }
  index++;
  clearItem();
}

/* ---- runs and the viaduct ---- */
/* run n plays the mode n after the link's (or the link's own, when a teacher named it) on the seed n after the link's;
   S6 asks for three digit numbers from stage 2, which is where RELATIONAL always plays */
function startRun(n) {
  run = n;
  MODE = FIXED ? CONFIG.mode : MODES[(MODES.indexOf(CONFIG.mode) + n) % MODES.length];
  JUDGED = MODE === 'judge';
  SET = generateSet(rng(CONFIG.seed + n), { mode: MODE, size: SIZE, stage: MODE === 'relational' ? 2 : 1, first: MODE !== 'relational' });
  document.body.dataset.mode = MODE;
  /* in RELATIONAL each source carries its numeral, the quantity on the object */
  sources.forEach(src => { src.textContent = MODE === 'relational' ? src.dataset.value : ''; });
  index = 0;
  clearItem();
}

/* the arches earned so far, the first nearest and each later one narrower and hazier, into the distance */
function drawViaduct(total) {
  archesEl.textContent = '';
  for (let i = 0; i < total; i++) {
    const a = document.createElement('div');
    a.className = 'arch';
    const w = 44 * Math.pow(0.9, i);
    a.style.width = w + 'px';
    a.style.height = (w * 1.1) + 'px';
    a.style.opacity = String(Math.max(0.3, 1 - i * 0.024));
    archesEl.append(a);
  }
  const newest = archesEl.lastElementChild;
  if (newest && !reduced()) newest.animate([{ transform: 'translateY(-' + LIFT + 'px)' }, { transform: 'translateY(0)' }], { duration: SEAT, easing: 'cubic-bezier(0.55, 0, 1, 0.45)' });
}

/* a run played through: one arch through collectOnce, never past thirty, then the viaduct */
function finishRun(byKey) {
  const rec = store.update('span', SCHEMA, r => {
    const shelf = Array.isArray(r.collect) ? r.collect : [];
    r.collect = shelf.length < ARCHES ? collectOnce(shelf, 'arch-' + (shelf.length + 1)) : shelf;
  });
  drawViaduct(Math.min(ARCHES, rec.collect.length));
  viaduct.hidden = false;
  audio.play('seat');
  /* focus follows a keyboard; a thumb gets no ring it did not ask for */
  if (byKey) againBtn.focus();
}

/* ---- hands ---- */
/* the stack is part of the blank's pier to a hand: a stone dropped on it goes on, a tap on it takes one off */
const pierOf = node => node === stack ? blankPier() : node;
const pierAt = (x, y) => {
  const hit = document.elementFromPoint(x, y);
  if (!hit) return null;
  return hit.closest('#stack') ? blankPier() : hit.closest('#pier-left, #pier-right');
};
let press = null;
sources.forEach(src => src.addEventListener('pointerdown', e => {
  if (laid) return;
  e.preventDefault();
  const ghost = document.createElement('div');
  ghost.className = 'ghost';
  ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px';
  document.body.append(ghost);
  press = { id: e.pointerId, x: e.clientX, y: e.clientY, ghost, stack: false, value: Number(src.dataset.value) };
  /* a long press puts down five of what was pressed */
  press.timer = setTimeout(() => { if (press && !press.moved) { press.stack = true; addStones(5 * press.value); } }, 500);
}));
window.addEventListener('pointermove', e => {
  if (!press || e.pointerId !== press.id) return;
  if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > 12) press.moved = true;
  press.ghost.style.left = e.clientX + 'px'; press.ghost.style.top = e.clientY + 'px';
});
window.addEventListener('pointerup', e => {
  if (!press || e.pointerId !== press.id) return;
  clearTimeout(press.timer);
  press.ghost.remove();
  const target = pierAt(e.clientX, e.clientY);
  if (!press.stack && target && target === blankPier()) addStones(press.value);
  press = null;
});
let pierPress = null;
[pierL, pierR, stack].forEach(node => {
  node.addEventListener('pointerdown', e => { pierPress = { id: e.pointerId, pier: pierOf(node), x: e.clientX, y: e.clientY }; });
  node.addEventListener('pointerup', e => {
    if (pierPress && pierPress.pier === pierOf(node) && Math.hypot(e.clientX - pierPress.x, e.clientY - pierPress.y) < 12
      && pierOf(node) === blankPier() && count > 0) setCount(count - 1);
    pierPress = null;
  });
});
canyon.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { selected = 'left'; drawBuild(); }
  else if (e.key === 'ArrowRight') { selected = 'right'; drawBuild(); }
  /* a stone by the arrows, a slab with Shift, a block by Page Up and Page Down */
  else if (e.key === 'ArrowUp' || e.key === 'PageUp') { if (selected === blankSide()) addStones(e.key === 'PageUp' ? 100 : e.shiftKey ? 10 : 1); }
  else if (e.key === 'ArrowDown' || e.key === 'PageDown') { if (selected === blankSide() && count > 0) setCount(count - (e.key === 'PageDown' ? 100 : e.shiftKey ? 10 : 1)); }
  else if (e.key === 'Enter') { if (laid) next(true); else lay(); }
  else return;
  e.preventDefault();
});
layBtn.addEventListener('click', () => lay());
sameBtn.addEventListener('click', () => lay('same'));
apartBtn.addEventListener('click', () => lay('apart'));
nextBtn.addEventListener('click', () => next(false));
againBtn.addEventListener('click', () => { viaduct.hidden = true; startRun(run + 1); });
el('start').addEventListener('click', () => { el('first').hidden = true; drawBuild(); });

startRun(0);
requestAnimationFrame(() => drawBuild());

/* the offline shell: one worker for the game and its screener (sw.js), its address carrying the stamp */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js?v=20260915h').catch(() => {});

/* the loudest a child can make: a stone put on every quarter second, and each second a span laid 40 ms after one */
const loudest = seconds => {
  const pattern = [];
  for (let t = 0; t < seconds; t += 0.25) pattern.push([t, 'seat']);
  for (let t = 0.04; t < seconds; t += 1) pattern.push([t, 'seat']);
  return pattern;
};

window.SPAN = {
  ready: true,
  results,
  revealDone: () => !!(reveal && reveal.done),
  item: () => index,
  run: () => run,
  /* what this page is playing, for the link gate: the mode and the length of the run */
  config: () => ({ mode: MODE, count: SET.length }),
  /* what the speaker was asked to play, and the ear gate's offline render through the same builders */
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    renderLoud: (seconds, master) => audio.renderLoud(loudest(seconds), seconds, master)
  }
};
