// Sentence building from strings.json. The sim hands over keys and parameters, never sentences.
let STR = {}, SPECIES = {};

export function initText(strings, creatures) {
  STR = strings;
  SPECIES = creatures;
}
export const str = (key) => STR[key];

export function fill(tpl, vals) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vals ? vals[k] : m));
}

const kindName = (kind) => SPECIES[kind].name.toLowerCase();
// A creature's name, or "A wolf" at the start of a sentence / "a wolf" inside one.
export const label = (r) => (r.name ? r.name : fill(STR['name.a'], { kind: kindName(r.kind) }));
export const lower = (r) => (r.name ? r.name : fill(STR['name.lower'], { kind: kindName(r.kind) }));

// Turns a sim log entry into the sentence the status line shows.
export function sentence(entry) {
  const p = entry.p || {}, v = {};
  if (p.a) { v.A = label(p.a); v.a = lower(p.a); }
  if (p.b) { v.B = label(p.b); v.b = lower(p.b); }
  if (p.days !== undefined) v.days = p.days.toFixed(1);
  if (p.n !== undefined) v.n = p.n;
  if (p.item !== undefined) v.item = p.item.toLowerCase();
  if (p.kind !== undefined) v.kind = kindName(p.kind);
  if (p.name !== undefined) v.name = p.name;
  const tpl = STR[entry.key];
  if (tpl === undefined) { // a missing sentence must never stop the game; show the key instead
    if (!missing.has(entry.key)) { missing.add(entry.key); console.error('strings.json has no "' + entry.key + '"'); }
    return entry.key;
  }
  return fill(tpl, v);
}
const missing = new Set();
