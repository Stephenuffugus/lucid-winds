/* BRIM's bench, drawn (plans/brim/HANDOFF-BRIM.md section 4): the glasses, their water, the meniscus and the shine. DOM only;
 * nothing here knows a rule, main.js hands in every number.
 *
 * ⛔ B1: the water has no height and is not drawn until fillTo, which main.js calls only from the reveal's frames; at a level
 * of zero it is hidden outright, so not even the meniscus shows before a commit.
 */
const make = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

/* one glass inside its button: the glass, its water, the fraction under it */
export function mountVessel(button) {
  button.textContent = '';
  const glass = make('div', 'glass'), water = make('div', 'water'), meniscus = make('div', 'meniscus'), shine = make('div', 'shine');
  /* HALF's etched line (shown by the page's mode) and BRIM's empty band (nothing until the reveal lights it, B10) */
  const half = make('div', 'half-line'), band = make('div', 'empty-band');
  water.append(meniscus);
  glass.append(band, water, half, shine);
  const label = make('div', 'label'), num = make('span', 'num'), bar = make('span', 'bar'), den = make('span', 'den');
  label.append(num, bar, den);
  button.append(glass, label);
  return { button, glass, water, half, band, num, den };
}

export function setFraction(v, f) {
  v.num.textContent = String(f.n);
  v.den.textContent = String(f.d);
}

export function clearFill(v) {
  v.water.style.height = '0px';
  v.water.style.visibility = 'hidden';
  v.water.dataset.level = '0';
  v.water.classList.remove('dim');
  v.band.style.height = '0px';
  v.band.style.opacity = '0';
  v.band.dataset.lit = '0';
  v.half.classList.remove('bright');
}

/* LEVEL: the glass already holds its water, given, not judged (its task is the split, not the comparison); the level is
   set once, as the round starts, and nothing moves it after */
export function holdLevel(v, value) {
  const h = value * v.glass.clientHeight;
  v.water.style.height = h + 'px';
  v.water.style.visibility = h > 0 ? 'visible' : 'hidden';
  v.water.dataset.level = String(value);
}

/* LEVEL's etching: `parts` equal lines up the glass, of a kind ('mark' the glass as given and the child's split, 'truth'
   the split that makes the goal), at opacity o */
export function etch(v, parts, kind, o = 1) {
  v.glass.querySelectorAll('.etch.' + kind).forEach(e => e.remove());
  for (let k = 1; k < parts; k++) {
    const e = make('div', 'etch ' + kind);
    e.style.bottom = (k / parts * 100) + '%';
    e.style.opacity = String(o);
    v.glass.append(e);
  }
  v.glass.dataset[kind] = String(parts);
}
export function fadeEtch(v, kind, o) {
  v.glass.querySelectorAll('.etch.' + kind).forEach(e => { e.style.opacity = String(o); });
}
export function clearEtch(v) {
  v.glass.querySelectorAll('.etch').forEach(e => e.remove());
  delete v.glass.dataset.mark;
  delete v.glass.dataset.truth;
}

/* HALF's reveal: the etched half line brightens once both glasses have filled */
export function brightenHalf(v, on) {
  v.half.classList.toggle('bright', !!on);
}

/* BRIM's reveal (B10): the empty band above the water lit and the water dimmed, at progress q; the band's height is the
   part missing, which is the lesson, so it is given one only here, after the choice */
export function lightEmpty(v, value, q) {
  v.band.style.height = ((1 - value) * v.glass.clientHeight) + 'px';
  v.band.style.opacity = String(q);
  v.band.dataset.lit = String(q);
  v.water.classList.toggle('dim', q > 0);
}

/* the level at progress p toward a value: a quick rise that passes the value by a hair, then settles onto it exactly */
export function levelAt(value, p) {
  if (p <= 0) return 0;
  if (p >= 1) return value;
  const over = Math.min(1, value * 1.04);
  return p < 0.8 ? over * (1 - Math.pow(1 - p / 0.8, 3)) : over + (value - over) * ((p - 0.8) / 0.2);
}

export function fillTo(v, value, p) {
  const level = levelAt(value, p), h = level * v.glass.clientHeight;
  v.water.style.height = h + 'px';
  v.water.style.visibility = h > 0 ? 'visible' : 'hidden';
  v.water.dataset.level = String(level);
}
