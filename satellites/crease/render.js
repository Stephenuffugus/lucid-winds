/* CREASE's strip, drawn (plans/crease/HANDOFF-CREASE.md section 4): the two pins, and the reveal's truth clip, the hatched
 * gap and the creases. DOM only; nothing here knows a rule. main.js hands in every number.
 *
 * ⛔ C2 and C8: a crease is made in one place, buildReveal, which runs only after the clip is down. FREEHAND's strip holds
 * no crease, tick or label before that, and tools/lint.mjs refuses a crease made anywhere else.
 */
import { fromNormalized } from '../math/core/core.js?v=20260915a';

const make = (tag, cls, id) => { const e = document.createElement(tag); if (cls) e.className = cls; if (id) e.id = id; return e; };

/* a pin at each end of the strip, at this round's geometry */
export function placePins(strip, geom) {
  strip.querySelectorAll('.pin').forEach(p => p.remove());
  const W = strip.getBoundingClientRect().width;
  for (const x of [0, 1]) {
    const pin = make('div', 'pin');
    pin.style.left = fromNormalized(x, geom, W) + 'px';
    strip.append(pin);
  }
}

/* the strip back to a plain strip: no truth, no gap, no creases */
export function clearReveal(strip) {
  strip.querySelectorAll('#truth-clip, #gap, .crease').forEach(e => e.remove());
}

/* the reveal's pieces, all at opacity 0 until setReveal: the gap from the child's clip to the truth, the truth's clip, and
   `parts` equal creases (parts minus one lines), the crease at `trueK` carrying `label` */
export function buildReveal(strip, { geom, parts, trueK, label, clipNorm, truthNorm, perUnit = parts }) {
  clearReveal(strip);
  const W = strip.getBoundingClientRect().width;
  const clipX = fromNormalized(clipNorm, geom, W), truthX = fromNormalized(truthNorm, geom, W);
  const gap = make('div', null, 'gap');
  gap.style.left = Math.min(clipX, truthX) + 'px';
  gap.style.width = Math.abs(truthX - clipX) + 'px';
  gap.style.opacity = '0';
  const truth = make('div', null, 'truth-clip');
  truth.style.left = truthX + 'px';
  truth.style.opacity = '0';
  strip.append(gap, truth);
  for (let k = 1; k < parts; k++) {
    const crease = make('div', 'crease');
    /* a whole's end on a strip longer than one */
    if (k % perUnit === 0) crease.classList.add('unit');
    crease.style.left = fromNormalized(k / parts, geom, W) + 'px';
    crease.style.opacity = '0';
    if (k === trueK) {
      const tag = make('span', 'crease-label');
      tag.textContent = label;
      crease.append(tag);
    }
    strip.append(crease);
  }
}

/* the reveal at progress p, 0 to 1, the same curve on every path: the truth and the gap in the first 60 percent, then the
   strip creases itself */
export function setReveal(strip, p) {
  const first = Math.min(1, Math.max(0, p / 0.6)), second = Math.min(1, Math.max(0, (p - 0.6) / 0.4));
  for (const id of ['truth-clip', 'gap']) { const e = strip.querySelector('#' + id); if (e) e.style.opacity = String(first); }
  strip.querySelectorAll('.crease').forEach(c => { c.style.opacity = String(second); });
}
