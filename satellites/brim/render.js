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
  water.append(meniscus);
  glass.append(water, shine);
  const label = make('div', 'label'), num = make('span', 'num'), bar = make('span', 'bar'), den = make('span', 'den');
  label.append(num, bar, den);
  button.append(glass, label);
  return { button, glass, water, num, den };
}

export function setFraction(v, f) {
  v.num.textContent = String(f.n);
  v.den.textContent = String(f.d);
}

export function clearFill(v) {
  v.water.style.height = '0px';
  v.water.style.visibility = 'hidden';
  v.water.dataset.level = '0';
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
