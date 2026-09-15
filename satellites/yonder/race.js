/* YONDER Mode 1, THE RACE (plans/yonder/HANDOFF-YONDER.md P2; the handoff's Y1, Y2, Y7 and Y10).
 *
 * Ten numbered squares in one row that never wraps; a strip that scrolls sideways when a phone is narrower than the row
 * (Y10). A card lies face down; a tap (or Enter) turns it over to show 1 or 2 (a card, never a spinner or a round die,
 * Y1). Then the child moves the traveler ONE square per input: a tap on the next square, or Enter on it, and each square's
 * numeral is shown large and named as it is reached (Y2, Y7). When the card's count is walked, it turns face down again.
 *
 * ⛔ Y2 is the intervention: nothing in this file moves the traveler except an input event. There is no timer, no
 * animation callback and no loop that steps, and tools/lint.mjs refuses one (a step called from anywhere but an event
 * listener's body). Do not add an auto move, a skip to the end or a hold to repeat, even as an accessibility option.
 */
import { rng } from '../math/core/core.js?v=20260915b';
import { raceMoves } from './engine.js?v=20260915b';

export const SQUARES = 10;
/* enough cards for a long visit; a race uses at most ten */
const DECK = 400;

export function mountRace({ host, seed, copy, speak, sound, onEnd }) {
  const make = (tag, id, cls) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; return e; };
  const numberEl = make('div', 'race-number');
  numberEl.setAttribute('aria-live', 'polite');
  const strip = make('div', 'strip');
  const track = make('div', 'track');
  track.setAttribute('role', 'group');
  track.setAttribute('aria-label', copy.track);
  const home = make('div', null, 'square square-start');
  home.dataset.n = '0';
  track.append(home);
  const squares = [home];
  for (let n = 1; n <= SQUARES; n++) {
    const sq = make('button', null, 'square');
    sq.type = 'button';
    sq.dataset.n = String(n);
    sq.textContent = String(n);
    sq.tabIndex = -1;
    track.append(sq);
    squares.push(sq);
  }
  const racer = make('div', 'racer');
  racer.append(make('i'), make('b'), make('s'), make('u'));
  track.append(racer);
  strip.append(track);
  const card = make('button', 'card', 'lw-btn');
  card.type = 'button';
  card.setAttribute('aria-label', copy.card);
  card.dataset.face = 'down';
  const face = make('span', null, 'card-face');
  card.append(face);
  const again = make('button', 'race-again', 'lw-btn');
  again.type = 'button';
  again.setAttribute('aria-label', copy.again);
  again.innerHTML = '&#9654;';
  again.hidden = true;
  const row = make('div', 'race-controls');
  row.append(card, again);
  host.append(numberEl, strip, row);

  const moves = raceMoves(rng(seed >>> 0), DECK);
  const log = { flips: [], steps: [], races: 0 };
  let pos = 0, remaining = 0, dealt = 0, byKey = false;

  const place = () => {
    const sq = squares[pos];
    racer.style.left = (sq.offsetLeft + sq.offsetWidth / 2) + 'px';
    squares.forEach((s, n) => { s.tabIndex = n === pos + 1 && remaining > 0 ? 0 : -1; s.classList.toggle('here', n === pos); });
    const want = squares[Math.min(SQUARES, pos + 1)];
    const sr = strip.getBoundingClientRect(), wr = want.getBoundingClientRect(), hr = sq.getBoundingClientRect();
    if (wr.right > sr.right - 8) strip.scrollLeft += wr.right - sr.right + 8;
    if (hr.left < sr.left + 8) strip.scrollLeft -= sr.left + 8 - hr.left;
  };
  const faceDown = () => { card.dataset.face = 'down'; face.textContent = ''; card.setAttribute('aria-disabled', pos >= SQUARES ? 'true' : 'false'); };
  const follow = () => {
    if (!byKey) return;
    if (remaining > 0) squares[pos + 1].focus();
    else if (pos >= SQUARES) again.focus();
    else card.focus();
  };

  /* the card turns over only when the traveler has walked the last one, and never at the finish */
  function flip() {
    if (remaining > 0 || pos >= SQUARES) return false;
    const m = moves[dealt++ % DECK];
    remaining = m;
    card.dataset.face = String(m);
    face.textContent = String(m);
    log.flips.push({ move: m, at: pos });
    /* one sound for the one card (A1) */
    sound('flip');
    place();
    follow();
    return true;
  }
  /* one square, and only the next one, and only while the card still has a count (Y2) */
  function step(n) {
    if (remaining <= 0 || n !== pos + 1 || n > SQUARES) return false;
    pos = n;
    remaining = pos >= SQUARES ? 0 : remaining - 1;
    numberEl.textContent = String(n);
    log.steps.push({ to: n });
    /* one step, one sound, and the square's numeral named (Y7) */
    sound('step');
    speak(n);
    if (remaining === 0) faceDown();
    let handled = false;
    if (pos >= SQUARES) { again.hidden = false; log.races++; if (onEnd) handled = !!onEnd(log.races); }
    place();
    if (!handled) follow();
    return true;
  }
  function reset() {
    pos = 0; remaining = 0;
    numberEl.textContent = '';
    again.hidden = true;
    faceDown();
    strip.scrollLeft = 0;
    place();
    follow();
  }

  host.addEventListener('keydown', () => { byKey = true; }, true);
  host.addEventListener('pointerdown', () => { byKey = false; }, true);
  card.addEventListener('click', () => { flip(); });
  squares.slice(1).forEach(sq => sq.addEventListener('click', () => { step(Number(sq.dataset.n)); }));
  again.addEventListener('click', () => { reset(); });
  window.addEventListener('resize', () => { place(); });
  reset();

  return {
    state: () => ({ pos, remaining, face: card.dataset.face, dealt, flips: log.flips.slice(), steps: log.steps.slice(), races: log.races }),
    refresh: () => place()
  };
}
