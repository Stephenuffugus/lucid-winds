// The cards (his calls, 1 and 2 Oct 2026, QUESTIONS Q50 "His calls, the cards"): every reaction row, and each of the
// Scrapbook's other firsts, is a card. She finds a card the first time its row happens in ANY of her worlds, and the device
// keeps it for good: "you unlock cards once on your account so people try to find all the interactions".
//   - a card is found once: the second time its row happens is no new card, and nothing is ever dropped (the Firsts page it
//     replaces kept forty and let the oldest go);
//   - a new card lies face down (`up` false) until she turns it, and then it is face up for good ("you flip and see what you got");
//   - it lands in ONE of six sections, worked out from what its row does (sectionOf), or from the row's own `cardKind` where
//     that reads wrong; the book shows the sections in SECTIONS' order ("they should probably go in their sections");
//   - the book counts what she has found against what she CAN find in play: every row the game compiles with its switches on
//     (the rows the suite's rows-all-happen law proves) and the other firsts. No outline of a card she has not found.
// The book is per device, never part of a world (IndexedDB `book`, key `cards`): a new world never empties it. The menu's
// Save to file carries the cards beside the world (packFile) and a file opened puts any she does not have into her book
// (unpackFile, merge), so a collection survives a new device.
// Kept apart from the page, so all of this is checked without one (tools/fixtures.mjs, the card fixtures): src/ui/scrap.js
// draws the book and src/ui/cardart.js paints a card. Nothing here reads or writes a world's save, and nothing here is in the
// sim (proof 19 is the same with or without it).
import { reactionRowId } from './book.js';
import { only, onlyThing } from '../sim/reactions.js'; // (who a row's scope takes, the sim's own test, asked after the step: momentOf)
import { sentence, str, fill, inSentence, aWord } from './text.js'; // (DOM free: the fixtures read the same words)

// The six sections, in the book's order. art.json `cardArt.kinds` paints each; strings.json `book.kind.<id>` names it.
export const SECTIONS = ['catch', 'birth', 'dig', 'love', 'going', 'power'];

// The Scrapbook's other firsts (story records that are not a reaction row), each a card of its own in a section. `laid` is
// the egg an animal lays by itself (reactions.js layEgg writes a reaction record with no row; the Firsts page keyed it
// "reaction:", with no row at all). A death is a going, gently: the game's own words for it, never more.
export const FIRSTS = { birth: 'birth', laid: 'birth', love: 'love', death: 'going', abducted: 'going', rescued: 'going', returned: 'going', landed: 'going', zombie: 'power' };
// A first's own words on its card, where the moment's are not the ones for a card she keeps: a death said gently (the log's
// "was killed by a wolf after 3.2 days" is the news, not a keepsake), a zombie without the days, and the heart of love, which
// says nothing on the field. `a`: which of the record's actors the words are about (a zombie's record is the new zombie, the
// one that bit, then the one bitten).
const FIRST_WORDS = { death: { key: 'book.first.death', a: 0 }, zombie: { key: 'book.first.zombie', a: 2 }, love: { key: 'book.first.love', a: 0 } };
const FIRST_RECORDS = ['birth', 'death', 'zombie', 'abducted', 'rescued', 'returned', 'landed', 'love'];

// What a row DOES, as a section (the ticket's reading: catch or eat; an egg, a hatch, a birth; dig, grow, make a thing, the
// land; a heart, tamed, a friend; arrive, leave, visit, migrate, follow; a power, the weather, a clock). First match wins.
// A row whose card reads wrong under this says so itself: `"cardKind": "<section>"` (validate-data checks it).
const MOVES = ['spawn', 'vanish', 'visit', 'migrate', 'follow', 'perchNear', 'comeOut', 'flee', 'sleep', 'launch'];
export function sectionOf(row) {
  if (row.cardKind) return row.cardKind;
  const fx = row.effects || [], has = (v) => fx.some((e) => e.do === v), heart = fx.some((e) => e.do === 'fx' && e.id === 'heart');
  if (has('lay')) return 'birth'; // an egg, a clutch, frogspawn
  if (has('bite') || has('eatGear') || has('feed')) return 'catch'; // something eaten
  if (row.when === 'eat') return has('makeThing') ? 'dig' : 'catch'; // a catch, the bones picked clean; a seed it dropped grows
  if (row.when === 'power' || row.when === 'hit') return 'power'; // her powers, the weather, a weapon's magic
  if (has('terrain') || has('makeThing') || has('grow') || has('cook')) return 'dig'; // the land, a thing made, a plant grown
  if (has('love') || heart) return 'love'; // a heart over them: love, a friend, a monster tamed
  if (row.when === 'clock') return MOVES.some((v) => v !== 'launch' && has(v)) ? 'going' : 'power'; // a clock: who comes and goes at dawn and dusk, else the hour itself
  if (MOVES.some(has)) return 'going'; // who arrives, leaves, goes somewhere, follows
  return 'power';
}

// The rows a game plays with its switches as they are (content.js compileRows: the old wording of a row a later design
// revised is read only while that design is off).
export function playRows(data) {
  const f = data.rules.flags;
  return data.reactions.rows.filter((r) => !(r.since && f['rows' + r.since] === false) && !(r.until && f['rows' + r.until] !== false));
}
// Every card she can find in play: a key each.
export function findable(data) {
  return new Set([...playRows(data).map((r) => 'reaction:' + r.id), ...Object.keys(FIRSTS)]);
}

// A card's own name (his call, 2 Oct: "every card gets its name"; the ticket `card names`, 3 Oct): strings.json
// card.<its row's id in camelCase>, or card.<the first> (card.birth), the same key for every wording of a row (a row kept
// twice is one card). The plate reads it (cardart.js nameOf). The whole list, for him to read: design-runs/sep24-plan/
// CARD-NAMES.md (node dev/card-names.mjs writes it).
const camelOf = (id) => id.replace(/_([a-z0-9])/g, (m, c) => c.toUpperCase());
export const nameKey = (key) => { const k = String(key); return 'card.' + camelOf(k.startsWith('reaction:') ? k.slice(9) : k); };
// The law of the names (validate-data asks it of the game's data; the fixture every-card-has-its-name watches it refuse each
// fault): every row in the file (every wording, every design's) and every other first has a name; a name is one to three words of
// plain letters (an apostrophe may sit in a word: "Crow's Nest"), no dash and no exclamation point, as wide as ONE line of the
// narrowest card's plate at most; no two cards share one (whatever its capitals); a card name is only ever a card's.
// The narrowest card is two across at 375 px (175 px wide): its plate's line is 111 px of the pixel font, bold, 12.5 px. A name
// wider than that wraps onto a second line, which pushes the picture down out of line with the card beside it and leaves the
// card's words a line less room (looked at, 3 Oct: fifteen of the first names did). PLATE is that line, measured in the real book with every name in it (dev/look-card-names.mjs
// prints all of it): each letter's advance as a part of the font's size, and the font's kerning, which moves a name up to 2.44
// px either way from the sum of its letters (so a name's sum plus PLATE.kern must fit).
export const PLATE = {
  px: 111, size: 12.5, kern: 2.5,
  em: { A: 0.6031, B: 0.6031, C: 0.6031, D: 0.6031, E: 0.6031, F: 0.5841, G: 0.6031, H: 0.6031, I: 0.4261, J: 0.6031, K: 0.6031, L: 0.6031, M: 0.7791, N: 0.6031, O: 0.6031, P: 0.6031, Q: 0.6031, R: 0.6031, S: 0.6031, T: 0.5461, U: 0.6031, V: 0.6031, W: 0.7791, X: 0.6031, Y: 0.6031, Z: 0.6031,
    a: 0.6446, b: 0.6031, c: 0.5746, d: 0.5841, e: 0.6031, f: 0.6031, g: 0.5841, h: 0.6031, i: 0.2491, j: 0.5151, k: 0.5841, l: 0.2491, m: 0.7791, n: 0.6031, o: 0.6031, p: 0.6031, q: 0.5746, r: 0.5746, s: 0.5841, t: 0.6256, u: 0.5841, v: 0.5741, w: 0.7791, x: 0.6031, y: 0.6031, z: 0.5936, "'": 0.2931, ' ': 0.2001 },
};
// A name's width on the plate, in CSS px, from its letters (a letter the table has not got counts as the widest, an M).
export const nameWidth = (s) => [...String(s)].reduce((a, ch) => a + (PLATE.em[ch] || PLATE.em.M) * PLATE.size, 0);
const NAME_RE = /^[A-Za-z][A-Za-z']*( [A-Za-z][A-Za-z']*){0,2}$/;
export function nameFaults(data) {
  const out = [], strings = data.strings || {}, owner = new Map();
  for (const r of data.reactions.rows || []) {
    const k = nameKey(r.id), was = owner.get(k);
    if (was && was !== 'the row ' + r.id) out.push(`the row ${r.id} and ${was} would share one card name ("${k}")`);
    else owner.set(k, 'the row ' + r.id);
  }
  for (const f of Object.keys(FIRSTS)) { const k = nameKey(f); if (owner.has(k)) out.push(`${owner.get(k)} and the first ${f} would share one card name ("${k}")`); owner.set(k, 'the first ' + f); }
  for (const [k, who] of owner) if (typeof strings[k] !== 'string' || !strings[k]) out.push(`${who} has no card name (strings.json "${k}")`);
  const names = new Map();
  for (const [k, v] of Object.entries(strings)) {
    if (!k.startsWith('card.')) continue;
    if (!owner.has(k)) out.push(`strings.${k}: no card is called "${k.slice(5)}" (card.<a row's id in camelCase>, or card.<a first>)`);
    if (typeof v !== 'string' || !NAME_RE.test(v)) { out.push(`strings.${k}: a card's name is 1 to 3 words of plain letters, no dash and no exclamation point ("${v}")`); continue; }
    const wide = nameWidth(v) + PLATE.kern;
    if (wide > PLATE.px) out.push(`strings.${k}: "${v}" is ${wide.toFixed(1)} px wide on its plate; the narrowest card's plate holds ${PLATE.px} px on one line (two across at 375 px)`);
    const low = v.toLowerCase();
    if (names.has(low)) out.push(`strings.${k}: "${v}" is already the name of ${names.get(low)}`); else names.set(low, k);
  }
  return out;
}

// A story record's card, as a key: `reaction:<row id>`, a first's own kind, or '' for a record that is no card.
export function cardKey(w, r) {
  if (r.kind === 'reaction') { if (r.row < 0) return 'laid'; const id = reactionRowId(w, r.row); return id ? 'reaction:' + id : ''; }
  return FIRST_RECORDS.includes(r.kind) ? r.kind : '';
}

// The hour a moment happened in, from where the world's day had got to (ui.json scrap.hours: where dawn, the day and dusk end,
// as parts of the day; night until the next dawn).
export const HOURS = ['dawn', 'day', 'dusk', 'night'];
export function hourOf(w, ends) {
  const f = (w.time % w.daySec) / w.daySec;
  let i = 0;
  while (i < ends.length && f >= ends[i]) i++;
  return HOURS[i];
}

// A thing's or a creature's picture by its reference ('creature:heron', 'thing:egg', 'thing:item:crown'), read from the data
// so a card shows the right picture whatever world it came from: { spr, over, name }, or null.
export function refPic(data, ref) {
  const at = String(ref).indexOf(':'), kind = String(ref).slice(0, at), id = String(ref).slice(at + 1);
  if (kind === 'creature') { const c = data.creatures[id]; return c ? { spr: c.spr || id, over: c.over, name: c.name } : null; }
  if (kind !== 'thing') return null;
  if (id.startsWith('item:')) {
    const k = id.slice(5), wp = data.weapons[k], g = data.gear.find((x) => x.id === k), it = wp || g;
    return it ? { spr: it.spr, over: it.over, name: it.name } : null;
  }
  const b = data.buildings[id];
  return b ? { spr: b.spr, over: b.over, name: b.name } : null;
}

// The world's icon indexes back to the references a card keeps (C.iconOf turned round, once per compiled content).
const backs = new WeakMap();
function refOfIcon(C, i) {
  if (i < 0) return null;
  if (i < C.kinds.length) return 'creature:' + C.kinds[i];
  let m = backs.get(C);
  if (!m) { m = new Map(); for (const [k, v] of Object.entries(C.iconOf)) if (k.startsWith('thing:') && !m.has(v)) m.set(v, k); backs.set(C, m); }
  return m.get(i) || null;
}
// The pictures a row's card draws big: the creatures and things among its A, B and what happened, at most two, A first.
function castOf(refs) {
  const out = [];
  for (const r of refs) if (r && (r.startsWith('creature:') || r.startsWith('thing:')) && !out.includes(r) && out.length < 2) out.push(r);
  return out;
}
// A row's own animals: its picture list, else the kind it brings or sends off (the five rows with no picture and no words, the
// bugs and fireflies that come and go at dawn and dusk, still show who: by its kind, or the first kinds that carry its tags,
// `species` being the creatures by kind). A card kept from before the cards has only its row's.
export function castOfRow(row, species = null) {
  if (!row) return [];
  const pic = castOf(row.pic || []);
  if (pic.length) return pic;
  const kinds = [];
  for (const e of row.effects || []) if (e.do === 'spawn') kinds.push(...[].concat(e.kind || e.any || []));
  const only = row.scope && row.scope.only;
  if (only) kinds.push(...[].concat(only.kind || only.kinds || []));
  if (only && only.tags && species) for (const [k, sp] of Object.entries(species)) if (only.tags.every((t) => (sp.tags || []).includes(t))) kinds.push(k);
  return castOf(kinds.filter((k) => typeof k === 'string').map((k) => 'creature:' + k));
}

const iconRef = (C, i) => { const ic = C.icons[i]; return ic ? (ic.cols ? { terr: ic.terr, cols: ic.cols } : { spr: ic.spr, over: ic.over || null }) : null; };
function entOf(w, h) { for (let k = 0; k < w.count; k++) if (w.slotH[w.order[k]] === h) return w.order[k]; return -1; }

// ---------- where it happened, and who was there (his cards' review round, 2 Oct) ----------
// A record keeps where its row happened and the creatures among its A and B. Two kinds of record keep less than a card needs:
//   - a clock row that happens nowhere in particular (no `at`) and an instant power (rain, Feed all) are raised at the middle of
//     the map (reactions.js reactClock, powers.js useInstant), so a row of theirs that reaches the whole world has its record
//     there whatever it was about: a quarter of her first book was the village's lawn, "The little fish went to sleep." on a
//     lawn and a path (placeless, below; a row with a short reach really happened there: the rain's mud round the middle);
//   - a row whose A is the hour, a power or a thing has nobody in its record, and the card drew the row's own picture of a
//     creature: a crow for her sparrows, a deer at the water in a world with no deer, a cat for her named sheep.
// So the card asks the world, in the step it happened, who its row took (its scope, as the sim itself takes them: reactions.js
// only) and shows one of them where it was, or where it was sent; and every creature on a card, in the picture and in the
// strip, is a kind that was there.
const SENDS = ['visit', 'perchNear', 'migrate']; // the verbs that send somebody somewhere: the moment is where they were sent
const COSMETIC = { fx: 1, sound: 1 }; // (reactions.js: a row of these alone changes nobody, so it may fire with nobody there)

// Whether a record sits at the middle of the map because its row has no place of its own (above): a clock or power row with no
// `at`, at the middle, whose scope is the whole world.
export function placeless(w, r, row) {
  if (!row || row.at || (row.when !== 'clock' && row.when !== 'power') || r.place[0] !== w.W / 2 || r.place[1] !== w.H / 2) return false;
  const sc = row.scope || {};
  return sc.kind === 'world' || ((sc.kind === 'radius' || sc.kind === 'things') && sc.r >= Math.max(w.W, w.H));
}

// Who stood where when the last step ended (takeCards keeps it after every step, when it is handed one): a card of a row whose
// ones are gone by the time its record is read (the heron that flew off at dusk, the fireflies at first light, the troll that is
// a stone now) shows the ground where one of THEM stood a moment before, never one of its kind that stayed (her named heron by
// the other pond). Every creature out in the world: its handle, kind and place; reused arrays, nothing a world keeps.
export function createSeen() {
  let C = null, n = 0, hs = new Float64Array(0), ks = [], xs = new Float64Array(0), ys = new Float64Array(0);
  return {
    look(w) {
      C = w.C;
      if (hs.length < w.count) { const m = Math.max(64, w.count * 2); hs = new Float64Array(m); ks = new Array(m).fill(''); xs = new Float64Array(m); ys = new Float64Array(m); }
      const E = w.E;
      n = 0;
      for (let q = 0; q < w.count; q++) {
        const e = w.order[q];
        if (E.dead[e] || E.inside[e]) continue;
        hs[n] = w.slotH[e]; ks[n] = E.kind[e]; xs[n] = E.x[e]; ys[n] = E.y[e]; n++;
      }
    },
    // Where one of `kind` that has gone since, or is something else now, stood a moment ago; null when every one of it is still
    // here as it was (they are not the ones a row sent away or changed).
    at(w, kind) {
      if (C !== w.C) return null;
      let now = null;
      for (let i = 0; i < n; i++) {
        if (ks[i] !== kind) continue;
        if (!now) { now = new Map(); for (let q = 0; q < w.count; q++) { const e = w.order[q]; if (!w.E.dead[e]) now.set(w.slotH[e], w.E.kind[e]); } }
        if (now.get(hs[i]) !== kind) return [xs[i], ys[i]];
      }
      return null;
    },
    // The kinds out in the world a moment ago.
    kinds(w) { const out = new Set(); if (C === w.C) for (let i = 0; i < n; i++) out.add(ks[i]); return [...out]; },
  };
}

// The creatures a record's row took: its scope as the sim takes them, alive now, within its reach of the record's place, the
// nearest first (ties to the older one), no more than its `max`. A scope that takes "the same kind as whoever it met" cannot be
// asked after the step (it reads the meeting's scratch): nobody.
function takersOf(w, r, sc) {
  const out = [];
  if (!sc || sc.kind !== 'radius' || (sc.only && sc.only.sameKind)) return out;
  const E = w.E, px = r.place[0], py = r.place[1], r2 = sc.r * sc.r;
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k];
    if (E.dead[e] || E.inside[e]) continue;
    const dx = E.x[e] - px, dy = E.y[e] - py, d = dx * dx + dy * dy;
    if (d <= r2 && (!sc.only || only(w, sc, e))) out.push({ e, d });
  }
  out.sort((a, b) => a.d - b.d || E.id[a.e] - E.id[b.e]);
  return sc.max > 0 ? out.slice(0, sc.max) : out;
}
// Whether this row sent e where it sends: up on something now (a roost), or on its way to the row's `to` (a visit's or a
// line's errand ends on such a tile, or beside it: a visit stops beside what it cannot walk into, reactions.js visit). One of
// its kind that an earlier row of the same dawn sent somewhere else is not this moment (a raccoon on its way to its log is not
// going down to the water; reactions.js claims).
function sentHere(w, row, e) {
  const E = w.E, C = w.C, T = w.T, tg = C.tags;
  for (const x of row.effects || []) {
    if (x.do === 'perchNear') { if (E.perch[e]) return true; continue; }
    if ((x.do !== 'visit' && x.do !== 'migrate') || !(E.errT[e] > 0)) continue;
    const cx = Math.floor(E.errX[e] / T), cy = Math.floor(E.errY[e] / T);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const tx = cx + dx, ty = cy + dy;
      if (tx < 0 || ty < 0 || tx >= w.cols || ty >= w.rows) continue;
      const i = ty * w.cols + tx, ti = w.terr[i], tt = C.TERR[ti], st = w.grid[i];
      if (x.to === 'water') { if (tt.deep === 1 || tt.shallow === 1 || (st && st.def.water)) return true; continue; }
      if (x.to === 'fav') { if (E.favTile[e] === i) return true; continue; }
      if ((x.vTerr && x.vTerr.has(ti)) || (x.vT0 !== undefined && (tg.terr0[ti] & x.vT0) === x.vT0 && (tg.terr1[ti] & x.vT1) === x.vT1)) return true;
      if (st && ((x.vThing && x.vThing.has(st.type)) || (x.vH0 !== undefined && ((tg.thing0[st.type] || 0) & x.vH0) === x.vH0 && ((tg.thing1[st.type] || 0) & x.vH1) === x.vH1))) return true;
    }
  }
  return false;
}
// The one a placeless card shows: one the row sent where it sends, when it sends them (its words are about them; the rest may
// be asleep where they stood), one she did not name unless the row is about the named (an earlier row of the same dusk sends
// her named ones to their favourite place, reactions.js claims), then the nearest to the middle.
function repOf(w, row, sc, takers) {
  const E = w.E, sends = (row.effects || []).some((x) => SENDS.includes(x.do)), named = [].concat((sc.only && sc.only.is) || []).includes('named');
  let best = takers[0], bk = 9;
  for (const t of takers) {
    const k = (!E.named[t.e] !== !named ? 2 : 0) + (sends && !sentHere(w, row, t.e) ? 1 : 0);
    if (k < bk) { best = t; bk = k; if (!k) break; }
  }
  return best;
}
// The kinds a row's scope names, for when the ones it took are gone: its kind or kinds, else (a scope by tags) the kinds seen a
// moment ago that carry its tags.
function namedKinds(w, sc, seen) {
  const o = sc.only || {}, C = w.C;
  if (o.kind) return [o.kind];
  if (o.kinds) return [].concat(o.kinds);
  if (!o.tags || !seen) return [];
  return seen.kinds(w).filter((k) => { const i = C.kid[k]; return (C.tags.kind0[i] & sc.onlyM0) === sc.onlyM0 && (C.tags.kind1[i] & sc.onlyM1) === sc.onlyM1; });
}
// The kinds a row makes: what it spawns, what it turns somebody into, and what a creature goes back to (its picture's last).
function madeKinds(row) {
  const out = [];
  for (const x of row.effects || []) {
    if (x.do === 'spawn') out.push(...[].concat(x.kind || x.any || []));
    if (x.do === 'become' && x.kind) out.push(x.kind);
    if (x.do === 'revert' && row.pic && /^creature:/.test(row.pic[2] || '')) out.push(row.pic[2].slice(9));
  }
  return out.filter((k, i, a) => typeof k === 'string' && a.indexOf(k) === i);
}
// The nearest live creature of a kind to a point (within r px), or -1.
function nearestOf(w, kind, x, y, r = Infinity) {
  const E = w.E;
  let best = -1, bd = r * r;
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k];
    if (E.dead[e] || E.inside[e] || E.kind[e] !== kind) continue;
    const dx = E.x[e] - x, dy = E.y[e] - y, d = dx * dx + dy * dy;
    if (d <= bd && (best < 0 || d < bd || E.id[e] < E.id[best])) { best = e; bd = d; }
  }
  return best;
}

// Where a record's moment happened and who was in it, read from the world in the step it happened:
//   place  a world point; null when there is nowhere true to show (the ones it was about are gone and none was seen)
//   rep    the slot of the one a record with nobody in it shows (its name if she named it), or -1
//   lead   the kind the card shows first when its record has nobody in it (the one shown, else the kind that went)
//   kinds  every creature kind that was there: who the record keeps; the kinds its A and B name (they matched: a dragon the
//          ice turned into an ice dragon is there as both); who its row took; the kind of the ones that have gone; and what it
//          made, where one of it now stands near the place (U.madeNear)
//   near   the kinds alive near the place (the reach of what the row asks for, or U.madeNear), and `reason` the kind it came for
export function momentOf(w, r, key, { U = {}, seen = null } = {}) {
  const C = w.C, E = w.E, row = key.startsWith('reaction:') && r.row >= 0 ? C.RX[r.row] : null;
  const kinds = new Set(), m = { place: r.place, rep: -1, lead: '', kinds, near: new Set(), reason: '' };
  for (const a of r.actors) if (a.k >= 0 && a.k < C.kinds.length) kinds.add(C.kinds[a.k]);
  if (!row) return m; // a first (a birth, a death, love, a landing): its own place and its own ones
  const free = placeless(w, r, row), near = U.madeNear || 64;
  if (kinds.size) {
    for (const s of [row.a, row.b]) if (s) { if (C.S[s.kind]) kinds.add(s.kind); if (C.S[s.id]) kinds.add(s.id); }
  } else {
    const sc = w.rx.R.rows[r.row].scope; // (the compiled scope: the masks only() reads)
    if (free && sc.kind === 'things') { // the nearest of the things it took (rain on her graves)
      let bd = Infinity;
      for (const st of w.structs) {
        if (sc.only && !onlyThing(w, sc, st)) continue;
        const x = st.tx * w.T + 4, y = st.ty * w.T + 4, d = (x - r.place[0]) * (x - r.place[0]) + (y - r.place[1]) * (y - r.place[1]);
        if (d < bd) { bd = d; m.place = [x, y]; }
      }
      if (bd === Infinity) m.place = null;
    }
    // (A row that sends them away has none of them left to ask: whoever its scope takes now came after it, in the same step:
    // the fireflies and caterpillars that come out at dusk after the day's bugs have gone. Their place is a moment ago.)
    const left = (row.effects || []).some((x) => x.do === 'vanish');
    const takers = left ? [] : takersOf(w, r, sc);
    for (const t of takers) kinds.add(E.kind[t.e]);
    // (A row that brings somebody: the newcomer is the moment, the nearest of what it brings to the place: the fireflies out at
    // the flowers, the bees out of the hive, never whoever its scope found standing by the place, a person by the hive or the
    // caterpillar another row of the same dusk brought to the same flower; the look, 2 Oct.)
    let born = -1, bd = Infinity;
    for (const x of row.effects || []) if (x.do === 'spawn') for (const k of [].concat(x.kind || x.any || [])) {
      const e = typeof k === 'string' ? nearestOf(w, k, r.place[0], r.place[1], near) : -1;
      if (e < 0) continue;
      const d = (E.x[e] - r.place[0]) * (E.x[e] - r.place[0]) + (E.y[e] - r.place[1]) * (E.y[e] - r.place[1]);
      if (d < bd) { bd = d; born = e; }
    }
    if (born >= 0) {
      m.rep = born; m.lead = E.kind[born]; kinds.add(m.lead);
      if (free) m.place = [E.x[born], E.y[born]];
    } else if (takers.length) {
      const e = (free ? repOf(w, row, sc, takers) : takers[0]).e;
      m.rep = e; m.lead = E.kind[e];
      // (where it was sent: a visit aims three px past the middle of its tile, away from the walker, which for one coming from
      // above is the top edge of the tile below, reactions.js visit; one px back up is the tile it was sent to)
      if (free) m.place = E.errT[e] > 0 && sentHere(w, row, e) ? [E.errX[e], E.errY[e] - 1] : [E.x[e], E.y[e]];
    } else if (sc.kind === 'radius' && (row.effects || []).some((x) => !COSMETIC[x.do])) {
      // Nobody it takes is here now (or it sent them away), and it changed somebody: they have gone (the heron that flew off) or
      // changed (the troll is a stone now). Their kind was there; the place is where one of them stood a moment ago (never seen:
      // nowhere).
      let at = null;
      for (const k of namedKinds(w, sc, seen)) {
        const p = seen ? seen.at(w, k) : null;
        if (seen && !p) continue;
        kinds.add(k);
        if (!m.lead) m.lead = k;
        if (!at && p) at = p;
      }
      if (free) m.place = at;
    } else if (free && sc.kind !== 'things') m.place = null; // (its ground changed under it, lava to stone by the rain: nowhere to show)
  }
  // What it made, where one of it now stands near the place; a placeless one with no place yet is where the nearest of it is.
  for (const k of madeKinds(row)) {
    if (!C.S[k]) continue;
    if (m.place) { if (nearestOf(w, k, m.place[0], m.place[1], near) >= 0) kinds.add(k); continue; }
    if (!free) continue;
    const e = nearestOf(w, k, r.place[0], r.place[1]);
    if (e >= 0) { m.place = [E.x[e], E.y[e]]; kinds.add(k); }
  }
  if (!m.lead && !r.actors.length) m.lead = [...kinds][0] || '';
  // Who else was near the place (a looser there than `kinds`, for what the strip shows of what came of it, or of a record with
  // nobody in it): every kind alive within the reach of what the row asks for (the rabbits the fox came for, 200 px) or
  // U.madeNear; and the kind it came for, when one is near (the reason an arrival row shows).
  m.near = new Set();
  m.reason = '';
  if (m.place) {
    const c = row.needs && row.needs.count, R = Math.max(near, (c && c.r) || 0), R2 = R * R, ct = c && c.tags ? w.C.tags.of(c.tags) : null;
    let rd = Infinity;
    for (let q = 0; q < w.count; q++) {
      const e = w.order[q];
      if (E.dead[e] || E.inside[e]) continue;
      const dx = E.x[e] - m.place[0], dy = E.y[e] - m.place[1], d = dx * dx + dy * dy;
      if (d > R2) continue;
      m.near.add(E.kind[e]);
      const ki = C.kid[E.kind[e]];
      if (c && d < rd && (c.kind ? E.kind[e] === c.kind : ct && (C.tags.kind0[ki] & ct[0]) === ct[0] && (C.tags.kind1[ki] & ct[1]) === ct[1])) { rd = d; m.reason = E.kind[e]; }
    }
  }
  return m;
}

// The card a story record makes, read from the world in the step it happened. `shot` is the photo cut from the canvas
// (scrap.js shoot()) at the moment's place, null where that was not on the screen. U: ui.json scrap. `seen` (createSeen): where
// each kind stood a moment before; `moment` (momentOf), when the caller has worked it out already.
export function cardOf(w, r, key, { U, shot = null, now = 0, seen = null, moment = null } = {}) {
  const C = w.C, T = w.T, E = w.E, row = key.startsWith('reaction:') && r.row >= 0 ? C.RX[r.row] : null;
  const m = moment || momentOf(w, r, key, { U, seen });
  // The ground round the place: a window of tiles (U.ground: columns, rows), slid inside the world at its edges, its ground
  // and the things standing on it, so the picture is where it happened. No place, no ground (the section's own colour).
  let ground = null, atTile = -1;
  const th = [];
  if (m.place) {
    const [gc, gr] = U.ground, cols = Math.min(gc, w.cols), rows = Math.min(gr, w.rows);
    const tx = Math.floor(m.place[0] / T), ty = Math.floor(m.place[1] / T);
    const x0 = Math.max(0, Math.min(w.cols - cols, tx - (cols >> 1))), y0 = Math.max(0, Math.min(w.rows - rows, ty - (rows >> 1)));
    const t = [], mm = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = (y0 + j) * w.cols + x0 + i, id = C.TERR[w.terr[k]].id;
      let n = t.indexOf(id);
      if (n < 0) { n = t.length; t.push(id); }
      mm.push(n.toString(36));
      const s = w.grid[k];
      if (s) th.push([j * cols + i, s.type]);
    }
    ground = { w: cols, t, m: mm.join(''), th };
    atTile = (ty - y0) * cols + (tx - x0);
  }
  const refs = [r.causeA, r.causeB, r.result].map((i) => refOfIcon(C, i));
  // Who was there: the record's own (her name for one she named), one a kind she never named (a zombie's record is two zombies
  // and the one bitten: "a zombie and a human"); with nobody in the record, the one its row took that the card shows.
  const actors = [], who = [];
  for (const a of r.actors) {
    if (a.k < 0 || a.k >= C.kinds.length) { actors.push(null); continue; }
    const e = entOf(w, a.h), x = { kind: C.kinds[a.k], name: e >= 0 && w.E.named[e] ? w.E.name[e] : '' };
    actors.push(x);
    if (x.name || !who.some((y) => !y.name && y.kind === x.kind)) who.push(x);
  }
  const xs = actors.filter(Boolean);
  if (!xs.length && m.rep >= 0) who.push({ kind: E.kind[m.rep], name: E.named[m.rep] ? E.name[m.rep] : '' });
  // The animals drawn big: who it happened to, A first, then the things in its pictures (the egg, the bones, the tree). With
  // nobody in the record: the one shown (or the kind that went), its picture's creatures that were there (the troll and the
  // stone it turned into) and its picture's things standing in the picture (the barn the herd went to). Never a creature that
  // was not there: a row about many kinds has one kind in its picture (her sparrows under the row's crow, the fireflies round
  // her sheep under the row's cat; the review, 2 Oct), and anybody else its scope took is no more the moment than the one shown
  // (a butterfly beside the sheep at the water).
  const mine = xs.map((x) => 'creature:' + x.kind), things = refs.filter((x) => x && x.startsWith('thing:'));
  const nearby = (k) => m.kinds.has(k) || m.near.has(k);
  let cast;
  if (!row) cast = castOf([...mine, ...(mine.length ? things : refs)]); // a first: the sim's own pictures
  else if (mine.length) cast = castOf([...mine, ...things]);
  else {
    // (its picture's things that stand in the picture; one that does not is the thing standing at the place when the place IS
    // its thing, a thing put down, poked, or a row's site: the flower2 she put down for a row whose picture is a flower, the
    // apple cooked for its bush. Elsewhere the thing on a creature's tile is nobody's: never the barn the herd had none of.)
    const ownPlace = !placeless(w, r, row) && (row.when === 'placed' || row.when === 'poke' || !!(row.at && row.at.things));
    const standing = new Set(th.map(([, type]) => 'thing:' + type)), at = ownPlace && ground ? th.find(([i]) => i === atTile) : null;
    const own = things.map((x) => (standing.has(x) ? x : at ? 'thing:' + at[1] : null)).filter(Boolean);
    cast = castOf([...(m.lead ? ['creature:' + m.lead] : []), ...refs.filter((x) => x && x.startsWith('creature:') && nearby(x.slice(9))), ...own]);
  }
  for (const ref of cast) if (ref.startsWith('creature:') && !who.some((y) => y.kind === ref.slice(9))) who.push({ kind: ref.slice(9), name: '' });
  // A thing drawn big is not drawn a second time where it stands (the look, 3 Oct: the village flag her duck sat on was two
  // flags): of that kind, the one nearest the moment's tile leaves the ground's things.
  if (ground) for (const ref of cast) {
    if (!ref.startsWith('thing:')) continue;
    let best = -1, bd = Infinity;
    for (let n = 0; n < th.length; n++) {
      if ('thing:' + th[n][1] !== ref) continue;
      const i = th[n][0], d = Math.abs((i % ground.w) - (atTile % ground.w)) + Math.abs(Math.floor(i / ground.w) - Math.floor(atTile / ground.w));
      if (d < bd) { bd = d; best = n; }
    }
    if (best >= 0) th.splice(best, 1);
  }
  const friend = (who.find((x) => x.name) || {}).name || '';
  // The A + B -> what happened strip: the record's pictures, where a creature that was not there is the one it stood for, or
  // left out with nobody to be. A creature in A's or B's place of a record with somebody in it stands for that one (the first of
  // the record in A's, the last in B's: the row's sheep for the person who walked into the flowers, its cat for her sheep the
  // fireflies danced round); what came of it, and any picture of a record with nobody in it, was there when one of its kind
  // was near (the fish the person scattered, the rabbits the fox came for), else it is the one it came for, else the one shown.
  // A first's pictures are the sim's own (a death's killer is in them, not in its record).
  const xk = xs.map((x) => x.kind), pics = [];
  [r.causeA, r.causeB, r.result].forEach((i, slot) => {
    if (i < 0) return;
    let ic = i;
    if (row && i < C.kinds.length) {
      const kind = C.kinds[i], strict = xk.length && slot < 2;
      if (strict ? !m.kinds.has(kind) : !nearby(kind)) {
        const k = xk.length ? (slot === 1 ? xk[xk.length - 1] : xk[0]) : m.reason || m.lead;
        if (!k) return;
        ic = C.kid[k];
      }
    }
    const p = iconRef(C, ic);
    if (p) pics.push(p);
  });
  // The words: what was said at that moment; a row that kept quiet then (its minute) still has its own sentence; a first in
  // FIRST_WORDS has its own. A record keeps only the creatures among its A and B (a poke's A is her finger), so a lone one is
  // whichever of the two the words name; with nobody in the record, the words name the one shown ("Pip went to the place it
  // likes best."). Words with a blank left in them are no words.
  const p = (x) => (x ? { name: x.name, kind: x.kind } : null), own = FIRST_WORDS[key];
  let say = own ? (actors[own.a] ? sentence({ key: own.key, p: { a: p(actors[own.a]) } }) : '') : r.say ? sentence(r.say) : '';
  if (!own && row && row.say && str(row.say) && (!say || (!xs.length && /\{/.test(say)))) {
    const ys = xs.length ? xs : m.rep >= 0 ? [who[0]] : [], tpl = str(row.say), onlyB = /\{[Bb]\}/.test(tpl) && !/\{[Aa]\}/.test(tpl);
    const [a, b] = ys.length >= 2 ? ys : onlyB ? [null, ys[0]] : [ys[0], null];
    say = sentence({ key: row.say, p: { a: p(a), b: p(b) } });
  }
  if (/\{/.test(say)) say = '';
  return {
    key, at: now, day: Math.floor(w.time / w.daySec) + 1, hour: hourOf(w, U.hours),
    ground, pics, cast, who, friend, say, shot, up: false,
  };
}

// Who was there, as the back of a card says it: her name for one she named, "a heron" or "an owl" for one she did not (his
// cards' review round, 2 Oct: the backs said "a owl", "a eagle"), "Pip and a frog", "a zombie, a zombie and a human".
export function whoLine(card, data) {
  const n = (card.who || []).map((x) => x.name || aWord(inSentence((data.creatures[x.kind] || { name: x.kind }).name)));
  if (n.length <= 1) return n[0] || '';
  const last = fill(str('book.and'), { x: n[n.length - 2], y: n[n.length - 1] });
  return n.length === 2 ? last : n.slice(0, -2).join(', ') + ', ' + last;
}

// A First kept before the cards (the Scrapbook's Firsts page: { key, at, day, pics, shot }): its card, face up, because she
// has seen it. The record that had no row ("reaction:") is the egg an animal laid by itself.
export function fromFirst(f, data) {
  const key = f.key === 'reaction:' ? 'laid' : f.key;
  const row = key.startsWith('reaction:') ? playRows(data).find((r) => r.id === key.slice(9)) : null;
  // Its row's words, unless they name somebody: a First kept no names, and a blank in the words is worse than none.
  const tpl = row && row.say ? str(row.say) : '';
  const say = tpl && !/\{/.test(tpl) ? tpl : '';
  return { key, at: Number(f.at) || 0, day: Number(f.day) || 1, hour: null, ground: null, pics: Array.isArray(f.pics) ? f.pics.filter(Boolean) : [], cast: castOfRow(row, data.creatures), who: [], friend: '', say, shot: typeof f.shot === 'string' ? f.shot : null, up: true };
}

// A card as the device or a file holds it, checked: anything that is not one is left out, never a broken page.
const okPic = (p) => p && typeof p === 'object' && ((typeof p.spr === 'string') || (typeof p.terr === 'string' && Array.isArray(p.cols)));
export function cleanCard(c) {
  if (!c || typeof c !== 'object' || typeof c.key !== 'string' || !c.key || c.key.length > 96) return null;
  const g = c.ground && typeof c.ground === 'object' && Number.isInteger(c.ground.w) && c.ground.w > 0 && Array.isArray(c.ground.t) && typeof c.ground.m === 'string' ? c.ground : null;
  return {
    key: c.key, at: Number.isFinite(c.at) ? c.at : 0, day: Number.isInteger(c.day) && c.day > 0 ? c.day : 1,
    hour: typeof c.hour === 'string' ? c.hour : null,
    ground: g ? { w: g.w, t: g.t.filter((x) => typeof x === 'string'), m: g.m, th: Array.isArray(g.th) ? g.th.filter((x) => Array.isArray(x) && Number.isInteger(x[0]) && typeof x[1] === 'string') : [] } : null,
    pics: Array.isArray(c.pics) ? c.pics.filter(okPic) : [],
    cast: Array.isArray(c.cast) ? c.cast.filter((x) => typeof x === 'string').slice(0, 2) : [],
    who: Array.isArray(c.who) ? c.who.filter((x) => x && typeof x.kind === 'string').map((x) => ({ kind: x.kind, name: typeof x.name === 'string' ? x.name : '' })).slice(0, 3) : [],
    friend: typeof c.friend === 'string' ? c.friend : '', say: typeof c.say === 'string' ? c.say : '',
    shot: typeof c.shot === 'string' && c.shot.startsWith('data:image/') ? c.shot : null, up: c.up === true,
  };
}

// The book: what she has found, on this device.
export function createCards({ data, got = [] }) {
  const rows = new Map(playRows(data).map((r) => [r.id, r])), can = findable(data), cards = new Map();
  // The section a card's key is in, worked out now (a card keeps no section of its own, so a row's `cardKind` moves its
  // card even after she found it).
  const sectionOfKey = (key) => (key.startsWith('reaction:') ? (rows.has(key.slice(9)) ? sectionOf(rows.get(key.slice(9))) : 'power') : FIRSTS[key] || 'power');
  const add = (c) => { const k = cleanCard(c); if (!k || cards.has(k.key)) return false; cards.set(k.key, k); return true; };
  for (const c of Array.isArray(got) ? got : []) add(c);
  return {
    has: (key) => cards.has(key),
    get: (key) => cards.get(key),
    add,
    // Every card in `list` she does not have yet (a file, the old Firsts): how many came in. Hers are never changed by it.
    merge(list) { let n = 0; for (const c of Array.isArray(list) ? list : []) if (add(c)) n++; return n; },
    // What the device held when a save merged into it (saveCards: another tab's cards, or hers from before a read that failed):
    // each card she does not have comes in as it was, and one turned face up there is face up here. How many changed.
    adopt(list) {
      let n = 0;
      for (const c of Array.isArray(list) ? list : []) {
        const k = cleanCard(c);
        if (!k) continue;
        const mine = cards.get(k.key);
        if (!mine) { cards.set(k.key, k); n++; } else if (k.up && !mine.up) { mine.up = true; n++; }
      }
      return n;
    },
    // Face up for good. True when it was face down.
    turn(key) { const c = cards.get(key); if (!c || c.up) return false; c.up = true; return true; },
    list: () => [...cards.values()],
    sectionOfKey,
    // One section's cards, the newest first (a new one face down at the top).
    section: (s) => [...cards.values()].filter((c) => sectionOfKey(c.key) === s).sort((a, b) => b.at - a.at),
    // "12 of 40": what she has found of what she can find, for the book and for each section.
    counts() {
      const kinds = Object.fromEntries(SECTIONS.map((s) => [s, { got: 0, of: 0 }])), all = { got: 0, of: can.size };
      for (const k of can) kinds[sectionOfKey(k)].of++;
      for (const c of cards.values()) if (can.has(c.key)) { all.got++; kinds[sectionOfKey(c.key)].got++; }
      return { all, kinds };
    },
    get down() { let n = 0; for (const c of cards.values()) if (!c.up) n++; return n; },
    get size() { return cards.size; },
  };
}

// One step's story records into the book (scrap.js calls it after every step, records or none): each record whose card she has
// never found is a new card, face down, its photo cut by `shoot` (scrap.js) at that moment, where it happened; one she has is
// nothing new. `seen` (createSeen), when given, is kept up to date here. Returns the new cards.
export function takeCards(cards, w, records, { U, shoot = () => null, now = () => 0, seen = null }) {
  const out = [];
  for (const r of records) {
    const key = cardKey(w, r);
    if (!key || cards.has(key)) continue;
    const m = momentOf(w, r, key, { U, seen }); // (where it happened: the photo is cut there, never at the middle of the map)
    const c = cardOf(w, r, key, { U, shot: m.place ? shoot(m.place[0], m.place[1]) : null, now: now(), moment: m });
    if (cards.add(c)) out.push(cards.get(key));
  }
  if (seen) seen.look(w); // where each kind stands as this step ends: the next step's cards of the ones that have gone
  return out;
}

// The device's book from what its store holds: the cards it keeps, and any First kept before the cards came, each turned
// into its card face up. Returns { cards, moved }: moved, how many old Firsts became cards.
export function bookFrom(got, firsts, data) {
  const cards = createCards({ data, got });
  const moved = cards.merge((Array.isArray(firsts) ? firsts : []).map((f) => fromFirst(f || {}, data)));
  return { cards, moved };
}
// `store` is ui/store.js's (book(key), mergeBook(key, merge)). The old Firsts are left where they are (an older game still reads
// them); the cards are written under `cards`. `ok` false: the device's book could not be read (his cards' review round, 2 Oct:
// it was taken for an empty book, and the next save wrote this session's cards over hers). The book is then this session's
// alone, and nothing is ever written over the store: a save merges (saveCards), and takes in what the store holds (adopt).
export async function openCards(store, data) {
  let got = [], firsts = [], ok = true;
  try { got = (await store.book('cards')) || []; } catch (e) { ok = false; }
  try { firsts = (await store.book('firsts')) || []; } catch (e) { ok = false; }
  return { ...bookFrom(got, firsts, data), ok };
}
// What the device keeps when she saves: every card it holds and every card of this session, by key (the review round, 2 Oct: a
// save wrote this session's list over the store, so a read that failed, or a second tab, the installed app and a tab, wiped
// her book). A card both have is the one found first, face up if either is (one tap turns a card face up for good, in any
// tab). Anything stored that is not a card is left out. A save never leaves fewer cards than were stored.
export function unionCards(stored, mine) {
  const out = new Map();
  for (const c of Array.isArray(stored) ? stored : []) { const k = cleanCard(c); if (k && !out.has(k.key)) out.set(k.key, k); }
  for (const c of Array.isArray(mine) ? mine : []) {
    const k = cleanCard(c);
    if (!k) continue;
    const o = out.get(k.key);
    out.set(k.key, !o ? k : { ...(k.at < o.at ? k : o), up: o.up || k.up });
  }
  return [...out.values()];
}
// Her cards written to the device in one transaction with what it holds (store.js mergeBook, unionCards): never over it, and
// nothing at all when it cannot be read. Resolves with what the device held before (for the book to adopt).
export const saveCards = (store, cards) => store.mergeBook('cards', (stored) => unionCards(stored, cards.list()));

// A world file with her cards in it: the world's own text (sim/save.js toText) with one more key, `cards`, which the
// world's save code never reads (a file from before the cards has none; an older game opens a new file and leaves them).
export function packFile(text, cards) {
  return cards && cards.size ? text.replace(/\}\s*$/, '') + ',"cards":' + JSON.stringify(cards.list()) + '}' : text;
}
// The world's text and the cards from a file's text. Text that is not a JSON object goes on as it is, for the save code
// to say what is wrong with it.
export function unpackFile(text) {
  let obj;
  try { obj = JSON.parse(text); } catch (e) { return { text, cards: null }; }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.cards)) return { text, cards: null };
  const cards = obj.cards;
  delete obj.cards;
  return { text: JSON.stringify(obj), cards };
}
