/* SPAN's equals sign screener (plans/span/HANDOFF-SPAN.md P3 step 1; docs/DECISIONS.md).
 *
 * TRUE OR NOT's ten items on the link's seed, so every device in a class sees the same ten. A choice moves straight
 * to the next item: no reveal, no mark, because a screener measures and does not teach. It ends after ten or when
 * the minutes run out (CORE's sessionStep, time handed in). Nothing is stored and nothing is sent; the result is
 * shown on this device only, and only after the teacher holds the teacher's control for two seconds.
 */
import { parseConfig, rng, sessionStep, tokens } from '../../math/core/core.js?v=20260915f';
import { generateSet, evaluate, isStandardLayout } from '../engine.js?v=20260915f';
import { COPY, PALETTE } from '../content.js?v=20260915f';
import { SCREEN_SCHEMA } from '../config.js?v=20260915f';

/* the one schema the teacher's link builder registers too (config.js; test/config.mjs holds them equal) */
const CONFIG = parseConfig(location.search, SCREEN_SCHEMA);
const ITEMS = generateSet(rng(CONFIG.seed), { mode: 'judge', size: 10, first: true });
const RUN = { runLength: ITEMS.length, capMs: CONFIG.minutes * 60000 };
const HOLD_MS = 2000, TICK_MS = 250;

tokens.inject({ paper: PALETTE.paper, ink: PALETTE.ink, accent: PALETTE.span });

const el = id => document.getElementById(id);
const equationEl = el('equation'), sameBtn = el('same'), apartBtn = el('apart');
const done = el('done'), teacherBtn = el('teacher'), result = el('result');
el('start').setAttribute('aria-label', COPY.start);
sameBtn.setAttribute('aria-label', COPY.same);
apartBtn.setAttribute('aria-label', COPY.apart);
teacherBtn.textContent = COPY.teacher;

const choices = [];
let index = 0, session = null, over = false, clock = null;

/* each side one unbreakable group, as on the game's page */
function render() {
  equationEl.textContent = '';
  const add = (parent, t, side) => {
    const span = document.createElement('span');
    span.className = 'term';
    if (t.op) { span.dataset.op = t.op; span.textContent = t.op === '-' ? '−' : t.op; }
    else { span.dataset.n = String(t.n); span.dataset.side = side; span.textContent = String(t.n); }
    parent.append(span);
  };
  const group = side => { const g = document.createElement('span'); g.className = 'side'; g.dataset.group = side; return g; };
  const eq = ITEMS[index], left = group('left'), right = group('right');
  eq.left.forEach(t => add(left, t, 'left'));
  eq.right.forEach(t => add(right, t, 'right'));
  equationEl.append(left);
  add(equationEl, { op: '=' });
  equationEl.append(right);
}

function end() {
  if (over) return;
  over = true;
  clearInterval(clock);
  el('play').hidden = true;
  done.hidden = false;
}

function choose(choice) {
  if (over || !session) return;
  choices.push(choice);
  session = sessionStep(session, { type: 'round', at: performance.now() }, RUN);
  if (session.ended || choices.length >= ITEMS.length) { end(); return; }
  index++;
  render();
}

/* the three lines for the teacher: correct of ten, correct among the ten's nonstandard items, reached of ten */
function showResult() {
  let correct = 0, nonCorrect = 0;
  const nonstandard = ITEMS.filter(eq => !isStandardLayout(eq)).length;
  choices.forEach((c, i) => {
    if ((c === 'same') !== evaluate(ITEMS[i], null)) return;
    correct++;
    if (!isStandardLayout(ITEMS[i])) nonCorrect++;
  });
  result.textContent = '';
  [[COPY.correct, correct, ITEMS.length], [COPY.nonstandardCorrect, nonCorrect, nonstandard], [COPY.reached, choices.length, ITEMS.length]]
    .forEach(([words, n, total]) => {
      const line = document.createElement('div');
      line.textContent = words + n + COPY.of + total;
      result.append(line);
    });
  result.hidden = false;
}

/* a hold of two seconds, by a finger or by holding Enter or Space; letting go sooner shows nothing */
let hold = null;
const startHold = () => { if (!over || hold) return; hold = setTimeout(() => { hold = null; showResult(); }, HOLD_MS); };
const stopHold = () => { clearTimeout(hold); hold = null; };
teacherBtn.addEventListener('pointerdown', e => { e.preventDefault(); startHold(); });
['pointerup', 'pointercancel', 'pointerleave'].forEach(type => teacherBtn.addEventListener(type, stopHold));
teacherBtn.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  if (!e.repeat) startHold();
});
teacherBtn.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') stopHold(); });

sameBtn.addEventListener('click', () => choose('same'));
apartBtn.addEventListener('click', () => choose('apart'));
el('start').addEventListener('click', () => {
  el('first').hidden = true;
  session = sessionStep(null, { type: 'start', at: performance.now() }, RUN);
  clock = setInterval(() => {
    session = sessionStep(session, { type: 'tick', at: performance.now() }, RUN);
    if (session.ended) end();
  }, TICK_MS);
});

render();

/* the game's offline shell covers the screener too: the worker lives in the game's folder, scoped to it */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js?v=20260915f', { scope: '../' }).catch(() => {});

window.SCREEN = { ready: true, choices, item: () => index, config: () => ({ minutes: CONFIG.minutes }) };
