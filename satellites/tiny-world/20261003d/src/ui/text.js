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

// A kind's word inside a sentence: small letters, but a word that is all capitals keeps them ("a UFO", not "a ufo": the
// deploy line 2 look, 28 Sep; the card's own rule, doll.js inSentence).
export const inSentence = (s) => s.split(' ').map((x) => (x.length > 1 && x === x.toUpperCase() ? x : x.toLowerCase())).join(' ');
const kindName = (kind) => inSentence(SPECIES[kind].name);
// Whether a word takes "an" (his cards' review round, 2 Oct 2026: the backs of her cards said "a owl", "a eagle", "a otter", and
// the news line the same): "an" before a vowel sound, "a" before a u said "you" (a unicorn), and a word in capitals by the sound
// of its first letter (a UFO, an ATM).
const YOU = /^(?:uni|us[aeiou]|ut[aeiou]|ur[aeiou]|eu|ewe|one\b)/i;
export function an(word) {
  const s = String(word || '');
  if (s.length > 1 && s === s.toUpperCase() && /^[A-Z]/.test(s)) return 'AEFHILMNORSX'.includes(s[0]);
  return /^[aeiou]/i.test(s) && !YOU.test(s);
}
// "a heron" or "an owl" (`big`: "A heron", "An owl", to begin a sentence), for a kind's word as a sentence has it.
export const aWord = (word, big = false) => fill(STR[an(word) ? (big ? 'name.an' : 'name.anLower') : big ? 'name.a' : 'name.lower'], { kind: word });
// A creature's name, or "A wolf" at the start of a sentence / "a wolf" inside one ("An owl" / "an owl").
export const label = (r) => (r.name ? r.name : aWord(kindName(r.kind), true));
export const lower = (r) => (r.name ? r.name : aWord(kindName(r.kind)));

// The law of the blanks (sentence case, design 18 law 16; card polish, 3 Oct 2026): {A} and {B} are "A sheep" with a capital,
// {a} and {b} "a sheep" with a small letter (her friend's name either way: sentence() below). So a capital blank stands only
// where a sentence starts (the string's start, or after . ! or ? and a space), and a sentence never opens with a small one:
// "A good meal, and {A} laid an egg." showed "A good meal, and A chicken laid an egg." on the news line and on her After Dinner
// Egg card in her first minute. validate-data asks it of every string; the fixture a-blank-mid-sentence-is-small watches it.
export function blankFaults(strings) {
  const out = [];
  for (const [k, v] of Object.entries(strings || {})) {
    if (k[0] === '_' || typeof v !== 'string') continue;
    for (const m of v.matchAll(/\{([ABab])\}/g)) {
      const start = m.index === 0 || /[.!?]["')]? +$/.test(v.slice(0, m.index)), small = m[1] === m[1].toLowerCase();
      if (start && small) out.push(`strings.${k}: a sentence opens with {${m[1]}}, a small letter ("a sheep ..."); open it with {${m[1].toUpperCase()}}`);
      if (!start && !small) out.push(`strings.${k}: {${m[1]}} inside a sentence shows "A sheep" with a capital ("${v}"); inside a sentence it is {${m[1].toLowerCase()}}`);
    }
  }
  return out;
}

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
