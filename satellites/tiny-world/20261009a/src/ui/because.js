// The Because system's telling side (design 14 §4). The sim writes story records (src/sim/story.js); this decides
// which one the player is told about, keeps the sparkle at its place, and shows the Because card when the sparkle
// is tapped: three enlarged pictures, A + B -> the result, no text needed.
// The rules (14 §4.1 and the ten Flow rules):
//   - one cue at a time: a new one never replaces the sparkle already on the field;
//   - a fight or a disaster suppresses a cue: while something loud is happening, the loud thing IS the story;
//   - a dropped cue is dropped, never queued: the world moved on, and a card about something already over is a lie;
//   - a first of anything on this device always gets through, loud or not (14 §4.3, the Scrapbook's Firsts);
//   - the card never pauses the world and fades on its own, and the world's sentences reach the status line only
//     through this arbiter (what the player did always answers at once: sim.js marks those lines).
// HIS CALLS OF 5 OCT 2026 ("we dont need to keep having everything that happens int he feed. new things should take precedence
// over something like an animal feeding its famioly or whatever"), which change the first and the third rule (pickTold, below):
//   - NEW TO HER: a sentence (its string key, never the record's kind) this device has never told her is told. It takes the line
//     and the sparkle even when an older sentence's sparkle is up, loud or not; it waits only for her own answer's moment, another
//     new thing's moment (ui.because.newMs) and the line before it to come all the way on (news.js room: the crawl never pushes a
//     line off unshown; and no creature's line pinned over hers, the review round); while new ones wait, her line hurries (news.js
//     hurry). Kept per device (tw_told, beside tw_firsts): a reload keeps it, and with no storage everything is new and nothing breaks.
//     THE REVIEW ROUND (5 Oct 2026, letGo below): one that waits longer than ui.because.newMaxMs of the world's clock, or a dawn or
//     dusk line once its light turns, is let go untold and stays new, told the next time it happens; the rarest waiting goes first.
//   - EVERYDAY: a sentence she has been told is told again at most once in ui.because.everyMs, only when nothing new waits, and only
//     as a cue always was (no sparkle up, no fight). An everyday record that is not told raises NO sparkle: the sparkle stands where
//     the sentence on her line happened, and one for a sentence her line does not say is a card she cannot place. A record with no
//     words (a game begun; a row saying its sentence once a minute) is everyday by its row: in her first world, a sparkle up 93
//     percent of the time, 834 of the 1116 sparkles of two hours had no sentence at all, 532 of them a game (seed 7).
//   - her own answers stay as they were: at once, always (status.js); a record she was answered with is no new thing again.
// Measured before (dev/oct05-calls.mjs, her first world as a new phone gets it, seeds 7 and 11, two hours): of the 168 and 164
// sentences offered for the first time, 44 and 46 were ever told; the rest of her line was the same births, beams and feedings.
import { drainStory } from '../sim/story.js';
import { EVI } from '../sim/events.js';
import { isNight } from '../sim/world.js'; // (the review round: a dawn or dusk line is let go once its light has turned)
import { picUrl } from '../art/sprites.js';
import { said } from './text.js';
import { cardKey, cardOf, momentOf } from './cards.js'; // (card polish 2: a sentence with a blank open says what its card says)
import { chipOf } from './chips.js'; // (card polish 3: the chip under a picture)

// A step with any of these in the events ring is a fight or a disaster.
export const LOUD = ['hit', 'shot', 'boom', 'quake', 'bolt'];
const FIRSTS_KEY = 'tw_firsts';
const TOLD_KEY = 'tw_told'; // (his calls of 5 Oct 2026: every sentence this device has told her, by its string key)

// The arbiter, kept apart from the page so it can be tested on its own (tools/because-check.mjs).
// records: this step's story records. spark: the record kinds that can raise a cue (story.json). firsts: the kinds
// this device has already seen. live: a sparkle is already on the field. loud: this step was a fight or a disaster.
// Returns the record to cue, or null.
// shows(r) (H2, 5 Oct 2026; card polish 3's check, note N9): whether the record's sparkle, tapped, would show anything. A record that
// shows nothing raises no sparkle and is no cue: when her hand put a thing down, come_and_look (design 17, a row with no picture:
// the nearest three walk over to look) raised one, and tapped it opened an EMPTY card, 33 and 41 times in 15 minutes of random
// play, the only empty strip; the next record of the step that shows something is the cue instead. Asked only of a record that
// would be picked.
export function pickCue(records, { spark, firsts, live, loud, shows = null }) {
  if (live) return null; // one at a time
  let first = null, any = null;
  for (const r of records) {
    if (!spark.has(r.kind)) continue;
    if (!(any === null || (first === null && !firsts.has(r.kind)))) continue;
    if (shows && !shows(r)) continue;
    if (any === null) any = r;
    if (first === null && !firsts.has(r.kind)) first = r;
  }
  if (first) return first; // a first always gets through
  return loud ? null : any;
}

// Firsts, per device. Storage can be off (private windows, cleared data): then nothing is a repeat, which only
// means more cues get through, and the game never breaks over it.
export function loadFirsts(store) {
  try { return new Set(JSON.parse(store.getItem(FIRSTS_KEY) || '[]')); } catch (e) { return new Set(); }
}
function saveFirsts(store, set) {
  try { store.setItem(FIRSTS_KEY, JSON.stringify([...set])); } catch (e) { /* no storage: the cue still showed */ }
}
// What this device has told her (his calls of 5 Oct 2026), kept the same way: storage off or damaged, nothing has been told yet.
export function loadTold(store) {
  try { const a = JSON.parse(store.getItem(TOLD_KEY) || '[]'); return new Set(Array.isArray(a) ? a.filter((k) => typeof k === 'string') : []); } catch (e) { return new Set(); }
}
function saveTold(store, set) {
  try { store.setItem(TOLD_KEY, JSON.stringify([...set])); } catch (e) { /* no storage: it was still told */ }
}
// The key a record is told by (his calls of 5 Oct 2026): its sentence's string key; a record with no words, its row (or its kind).
// `same` (sameWords): thirteen sentences have more than one key with the very same words (six rows' "The frog jumped at the bug and
// missed.", six birds' "{A} picked the bones clean."), and to her they are one sentence: each is told by the first key of its words.
export function toldKey(w, r, same = null) {
  if (r.say && r.say.key) return (same && same.get(r.say.key)) || r.say.key;
  return r.kind === 'reaction' && r.row >= 0 && w && w.C.RX[r.row] ? 'row:' + w.C.RX[r.row].id : 'kind:' + r.kind;
}
// Each string key whose words another key has too, to the first key with those words (strings.json order).
export function sameWords(strings) {
  const first = new Map(), out = new Map();
  for (const [k, v] of Object.entries(strings || {})) {
    if (k[0] === '_' || typeof v !== 'string') continue;
    if (!first.has(v)) first.set(v, k); else out.set(k, first.get(v));
  }
  return out;
}
// What this device remembers of her line (his calls of 5 Oct 2026; pickTold): the sentences it has told her, when each key was last
// told (the page's clock), the new ones waiting their turn ({ r, c, k, wt, light, n }: the record, what its sparkle shows, worked out
// when it happened, its key, the world's clock when it happened, for a dawn or dusk row's whether that was night, and how many times
// that sentence had happened before) and their keys, how many times each sentence has happened in her world since the page opened,
// when the last new one's moment ends, and whether `told` grew (to be kept).
export const newMemory = (told = new Set()) => ({ told, lastAt: new Map(), waiting: [], queued: new Set(), happened: new Map(), newUntil: 0, grew: false });
function markTold(mem, k, t) {
  mem.lastAt.set(k, t);
  if (!k.startsWith('row:') && !k.startsWith('kind:') && !mem.told.has(k)) { mem.told.add(k); mem.grew = true; } // (no words: never new)
}
// A new one that waited too long is let go, untold (his calls' review round, 5 Oct 2026). Kept until told, a new phone's first dusk
// and dawn put twenty new sentences a minute in front of a line that shows nine to thirteen: they were told a minute and more late, a
// dusk's "The frogs went to sleep." in the next morning's sun, the sparkle three to fourteen tiles from the one its line names (the
// review's probe, seeds 7 and 11); on a phone that had played (everything new at once after the update) four minutes late, and at
// the speed button's 4x twenty minutes of her world late. Now one that has waited longer than ui.because.newMaxMs of the WORLD's
// clock (the world moved on: a pause ages nothing, 4x ages it four times as fast as the page's), or a dawn or dusk row's once the
// light has turned, is let go and NOT marked told: the sentence is still new, and the next time it happens it is told then, fresh.
// And which new one goes first: the one that has happened the FEWEST times in her world (the rarest is the newest to her), then the
// one that happened first, and of the ones of one moment (one step of the world) the last written: a moment writes its trigger's
// record before the rows it raises, and a dawn its routines before its comings and goings (reactions.json: the clock rows in file
// order, design 19's arrivals and goings last). In the order they came, the bound lost a new phone's "The UFO flew home." on 3 of 5
// seeds (1, 2 and 11 of 1, 2, 3, 7, 11): it is the last dawn row, and at its dawn, her third, the dawn lines let go at the first two
// and the owl's first roost stood in front of it until it was let go too. What happens every dawn comes back at the next; the UFO
// goes once. Now it is told on all five (dev/oct05-calls.mjs).
function letGo(mem, o) {
  let n = 0;
  for (const q of mem.waiting) {
    if (o.worldNow - q.wt > o.newMaxMs || (q.light !== null && q.light !== !!o.night)) { mem.queued.delete(q.k); continue; }
    mem.waiting[n++] = q;
  }
  mem.waiting.length = n;
}
// The arbiter of his calls of 5 Oct 2026 (the header), kept apart from the page so it can be tested on its own (tools/because-check.mjs):
// which of this step's records her line tells, or one that waited. `records`: the step's records in order; `mem`: newMemory(); `o`:
// { spark, live, loud, answering (her answer's moment is up), room (a line told now comes straight onto her line, and no creature's
// line covers it: news.js), now, newMs, everyMs, keyOf(r), cue(r) ({ pics, .. }: what its sparkle would show, worked out once),
// isAnswer(r) (the record her finger was just answered with), worldNow (the world's clock, ms), newMaxMs (how long of it a new one
// may wait), night (whether it is night now), timed(r) (whether r is a dawn or dusk row's) }. Returns { r, c, fresh } or null; it
// changes `mem`.
export function pickTold(records, mem, o) {
  const t = o.now;
  for (const x of records) { // this step's NEW sentences join the ones waiting, each once, in the order they came
    if (!o.spark.has(x.kind) || !x.say || !x.say.key) continue;
    const k = o.keyOf(x), n = mem.happened.get(k) || 0;
    mem.happened.set(k, n + 1); // (how many times it has happened: the rarest new one goes first)
    if (mem.told.has(k) || mem.queued.has(k)) continue;
    if (o.isAnswer(x)) { markTold(mem, k, t); continue; } // her own answer: told at once (status.js), and no new thing again
    const c = o.cue(x);
    if (!c.pics.length) continue; // (a record that would show nothing is no cue: H2)
    mem.waiting.push({ r: x, c, k, wt: o.worldNow, light: o.timed(x) ? !!o.night : null, n });
    mem.queued.add(k);
  }
  letGo(mem, o); // (the review round: what waited too long, or a dawn or dusk line once its light turned, goes untold and stays new)
  if (mem.waiting.length) { // a new one first: over an older sparkle and through a fight, after her answer's moment and the last new one's
    if (t < mem.newUntil || o.answering || o.room === false) return null; // (room: the one before it has come all the way onto her line)
    let best = 0; // (the rarest first; between equals the one that happened first, and of one moment's the last written: letGo's note)
    for (let i = 1; i < mem.waiting.length; i++) { const a = mem.waiting[i], b = mem.waiting[best]; if (a.n < b.n || (a.n === b.n && a.wt === b.wt)) best = i; }
    const q = mem.waiting.splice(best, 1)[0];
    mem.queued.delete(q.k);
    mem.newUntil = t + o.newMs;
    markTold(mem, q.k, t);
    return { r: q.r, c: q.c, fresh: true };
  }
  // else an everyday one, as a cue always was (one at a time, never in a fight), whose key was not told in the last everyMs, and only
  // when her line has room for it now (one that cannot be told now is not told, as a cue never was). The record her finger was just
  // answered with is a cue as it always was, whatever its window and whatever her line (her answers stay as they were: its sparkle,
  // its pictures joining the answer up, status.js; it never crawls, so no room is asked of it: the review round's pin makes her line
  // roomless whenever she looks at a creature, and a poke then is answered as it was).
  const due = records.filter((x) => { if (o.isAnswer(x)) return true; if (o.room === false) return false; const at = mem.lastAt.get(o.keyOf(x)); return at === undefined || t - at >= o.everyMs; });
  const r = pickCue(due, { spark: o.spark, firsts: o.spark, live: o.live, loud: o.loud, shows: (x) => o.cue(x).pics.length > 0 });
  if (!r) return null;
  markTold(mem, o.keyOf(r), t);
  return { r, c: o.cue(r), fresh: false };
}

// ui: the interface state the renderer draws from; this owns ui.spark ({ x, y, t0, ms } or null). seen (cards.js createSeen): who
// stood where as the last step ended, the Scrapbook's own (main.js hands both the same one), so the card a cue's record makes here
// is the card the Scrapbook makes of it.
export function createBecause({ data, wrap, cam, status, ui, getSim, seen = null, store = window.localStorage, now = () => performance.now() }) {
  const U = data.ui.because, kinds = Object.entries(data.story.kinds);
  const spark = new Set(kinds.filter(([, v]) => v.spark).map(([k]) => k)), why = new Set(kinds.filter(([, v]) => v.why).map(([k]) => k));
  const firsts = loadFirsts(store);
  const mem = newMemory(loadTold(store)), same = sameWords(data.strings); // (his calls of 5 Oct 2026: what this device has told her, the new ones waiting)
  const el = typeof document === 'undefined' ? null : document.getElementById('because'); // the checks run this module without a page
  let cue = null, strip = [], hideT = 0, drawn = []; // cue: the record the sparkle stands for; strip: the pictures it shows (cueOf)
  const shownOf = new Map(); // (this step's records asked whether they show anything: what each would show, cueOf)
  const iconTable = () => { const s = getSim && getSim(); return (s && s.w.C.icons) || []; };
  const records = [];

  // After every sim step, before the events ring is drained for sound: what happened, and was it loud?
  function step(w) {
    let loud = false;
    for (let i = 0; i < w.ev.n && !loud; i++) for (const k of LOUD) if (w.ev.kind[i] === EVI[k]) { loud = true; break; }
    records.length = 0;
    drainStory(w, (r) => records.push(r));
    const live = !!(ui.spark && now() - ui.spark.t0 < ui.spark.ms);
    // Cause icons (14 §4.2): a creature that has just changed what it is doing wears the reason over its head for a
    // second. Every why record shows, cue or no cue — they are the reason the world makes sense, not news — but one
    // already up is never restarted, so a creature that keeps changing its mind does not flicker.
    // At most U.whyMax up at once (design 18 F3): past it a new one is dropped, never queued.
    if (ui.why) {
      const t = now();
      let up = 0;
      for (const o of ui.why.values()) if (t - o.t0 <= U.whyMs) up++;
      for (const r of records) {
        if (!why.has(r.kind) || !r.actors.length || r.causeA < 0) continue;
        const h = r.actors[0].h, live0 = ui.why.get(h);
        if (live0 && t - live0.t0 <= U.whyMs) continue;
        if (up >= U.whyMax) continue;
        ui.why.set(h, { icon: r.causeA, t0: t });
        up++;
      }
    }
    shownOf.clear();
    // The animals' answer to the land's own change comes in the same step as the change, after it (reactions.js: the land trigger):
    // her ducks setting off when their puddle dried, a fish flopping to the water, a herd off to find grass. When an answer is there
    // the change is no cue of its own: the answer tells the moment, its card the ground too (the mud + a duck -> the water). As the
    // first record of the step (and, on a device that has never seen one, a first that always gets through) the change took the
    // line: "The puddle is only mud now.", and the ducks' line was never told (H2, 5 Oct 2026, the look).
    const landAnswer = records.some((x) => x.kind === 'reaction' && x.row >= 0 && w.C.RX[x.row] && w.C.RX[x.row].when === 'land');
    const order = landAnswer ? records.filter((x) => x.kind !== 'land') : records;
    // His calls of 5 Oct 2026 (the header, pickTold): a new sentence first, else an everyday one not told in the last everyMs.
    const cue1 = (x) => { let c = shownOf.get(x); if (!c) { c = cueOf(w, x); shownOf.set(x, c); } return c; };
    const told = pickTold(order, mem, { spark, live, loud, answering: !!(status.answering && status.answering()), room: status.room ? status.room() : true, now: now(), newMs: U.newMs, everyMs: U.everyMs, keyOf: (x) => toldKey(w, x, same), cue: cue1, isAnswer: (x) => !!(status.answers && status.answers(x.say)),
      worldNow: w.time * 1000, newMaxMs: U.newMaxMs, night: isNight(w), timed: (x) => x.kind === 'reaction' && x.row >= 0 && !!w.C.RX[x.row] && w.C.RX[x.row].when === 'clock' }); // (the review round: what waited too long goes untold)
    if (mem.grew) { mem.grew = false; saveTold(store, mem.told); }
    if (status.hurry) status.hurry(mem.waiting.length > 0); // (new ones waiting their turn: her line hurries, news.js)
    const r = told ? told.r : null;
    // The record her finger was just answered with (H2, status.js answers), cue or not: its strip joins the answer that is up. In her
    // world a sparkle is nearly always on the field, and then her answer's record is no cue (the dog that barked at her goblin).
    if (status.answers) for (const x of records) if (x !== r && x.say && status.answers(x.say)) { const c = shownOf.get(x) || cueOf(w, x); if (c.pics.length) status.news(said(x.say), c.pics, x.say); }
    if (!r) return records;
    if (!firsts.has(r.kind)) { firsts.add(r.kind); saveFirsts(store, firsts); }
    const c = told.c; // (what its sparkle shows, worked out when it happened: a new one may have waited its turn)
    cue = r; strip = c.pics;
    ui.spark = { x: c.at[0], y: c.at[1], t0: now(), ms: U.sparkMs };
    // The world's news: one sentence, the one the sparkle is about, with the pictures that go with it (15 A3): the strip.
    if (r.say) {
      // Card polish 2 (3 Oct 2026): a sentence with a blank left open. A dusk row about the one she named happens to nobody in
      // particular (a clock row has no A or B: reactions.js reactClock), so "{B} went to the place it likes best." reached her
      // news line as the log has it, every time it was told (three times in her first half hour, seed 11, a sheep and a hen
      // named). It says what its card says: the one its moment shows, by name, as the Scrapbook makes the card (cards.js cardOf:
      // one the row sent where it sends), so the news line and her Comfy Spot card name the same friend. With nobody to name
      // there are no words, and the status line shows no sentence with a blank open (status.js). (Card polish 3: whether a blank
      // is open is asked of the template and the values it had, text.js said: a sheep she named "{Pip}" is no open blank.)
      let s = said(r.say);
      if (s.open.length) s = c.card && c.card.say ? { t: c.card.say, open: [] } : s; // (the card's words hold no blank: cards.js cardOf)
      status.news(s, strip, r.say); // (the record's own line: when her finger was just answered with it, the strip joins that answer: status.js)
    }
    return records;
  }

  // What a cue shows, and where (card polish 3, 3 Oct 2026; card polish 2's check, note N5). The sparkle, tapped, drew the ROW's own
  // pictures (icons[r.causeA] + icons[r.causeB] -> icons[r.result]: the dusk row's moon + CAT -> heart) beside her news line's
  // "Clementine went to the place it likes best." and a sheep, and it stood at the record's place, the middle of the map, where a
  // clock row happens to nobody (reactions.js reactClock), not where her friend went. The class of his cards' mustFix "a card shows
  // an animal that was not there". Now one strip for all three: the card this record makes (cards.js cardOf, its A + B -> what
  // happened, where a creature that was not there is the one it stood for), drawn by the news line, by the sparkle's card when she
  // taps it, and on her card; and the sparkle stands where the card's moment is (momentOf: where the one who went was sent), or at
  // the record's place when the card knows nowhere. A record that is no card (a pet fed, a game played, the land's own change) shows
  // its own pictures at its own place. THE LAW (fixture the-sparkle-shows-what-her-card-shows): for every cue, the three the same.
  function cueOf(w, r) {
    const key = cardKey(w, r);
    if (key) {
      const m = momentOf(w, r, key, { U: data.ui.scrap, seen }), card = cardOf(w, r, key, { U: data.ui.scrap, moment: m });
      return { card, pics: card.pics, at: m.place || r.place };
    }
    const table = iconTable();
    return { card: null, pics: [r.causeA, r.causeB, r.result].filter((i) => i >= 0).map((i) => table[i]).filter(Boolean), at: r.place };
  }

  // A tap at a world point: the sparkle takes it when the finger lands within U.tapWorld px of it (the Hand's
  // taps only, main.js). Returns true when it did, so the tool underneath does nothing.
  function tap(x, y) {
    const s = ui.spark;
    if (!s || !cue || now() - s.t0 > s.ms) return false;
    if (Math.hypot(x - s.x, y - s.y) > U.tapWorld) return false;
    show(strip, s.x, s.y);
    ui.spark = null;
    return true;
  }

  // The card: A (+ B) -> the result, beside the spot, fading over U.cardMs. It never takes a touch (the world
  // keeps playing under it) and it never pauses anything. Card polish 3: the cue's strip (cueOf), as her card's strip draws it (the
  // last after the arrow, cardart.js), each picture on its chip (chips.js), beside the sparkle.
  function show(pics, x, y) {
    drawn = pics.map((p) => (p.spr ? p.spr : 'terrain:' + p.terr)); // (what the card shows, for the checks: kept with or without a page)
    if (!el) return;
    el.textContent = '';
    pics.forEach((p, k) => {
      if (k) el.appendChild(sign(k === pics.length - 1 ? '→' : '+'));
      el.appendChild(pic(p));
    });
    el.hidden = false; // shown first: the card is measured, never guessed at (it grows with its pictures)
    place(x, y);
    el.style.transition = 'none';
    el.style.opacity = '1';
    // Two frames: the browser must see opacity 1 with no transition before the fade is armed, or it jumps.
    // It holds still and solid first, then fades: a card that starts fading at once is read through a crowd of
    // creatures behind it (looked at over 60 sheep, Sep 19).
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = `opacity ${U.cardMs - U.cardHoldMs}ms linear ${U.cardHoldMs}ms`;
      el.style.opacity = '0';
    }));
    clearTimeout(hideT);
    hideT = setTimeout(() => { el.hidden = true; el.textContent = ''; }, U.cardMs + 50);
  }
  function pic(icon) {
    const im = new Image();
    im.src = picUrl(icon);
    im.alt = '';
    im.style.background = chipOf(data, icon); // (card polish 3: on the chip it reads on, as on her news line and her card)
    return im;
  }
  function sign(ch) { const s = document.createElement('span'); s.textContent = ch; return s; }
  // Beside the spot: to its right if there is room, else to its left, and never over the zoom rail or off an edge.
  // The card's size is measured, not assumed: it grows with the number of pictures.
  function place(wx, wy) {
    const r = wrap.getBoundingClientRect(), [cx, cy] = cam.toCanvas(wx, wy), box = el.getBoundingClientRect();
    const rail = document.getElementById('rail'), railW = rail ? rail.getBoundingClientRect().width + 8 : 0;
    const w = box.width, h = box.height, x0 = cx / cam.dpr, y0 = cy / cam.dpr;
    const maxX = Math.max(4, r.width - railW - w - 4);
    if (U.cardHead) {
      // ABOVE the spot, as a tooltip sits above a finger (design 17, looked at Sep 21): beside it, the card lay over
      // the very thing the poke had just made (a hen's new egg was under it for its two solid seconds), and a
      // finger already hides what is below. Clear of the creature's head; under the spot only with no room above.
      const head = (U.cardHead * cam.zoom) / cam.dpr, top = y0 - head - U.cardGap - h;
      el.style.left = Math.max(4, Math.min(maxX, x0 - w / 2)) + 'px';
      el.style.top = Math.max(4, Math.min(r.height - h - 4, top >= 4 ? top : y0 + U.cardGap)) + 'px';
      return;
    }
    const right = x0 + U.cardGap, left = x0 - U.cardGap - w;
    el.style.left = Math.max(4, Math.min(maxX, right <= maxX ? right : left)) + 'px';
    el.style.top = Math.max(4, Math.min(r.height - h - 4, y0 - h / 2)) + 'px';
  }

  return {
    step,
    tap,
    // A new world, an Undo of everything, a world that broke: no sparkle, no card, and the records so far are gone.
    clear() { cue = null; strip = []; ui.spark = null; mem.waiting.length = 0; mem.queued.clear(); mem.newUntil = 0; if (ui.why) ui.why.clear(); if (el) { clearTimeout(hideT); el.hidden = true; el.textContent = ''; } },
    get cue() { return cue; },
    get strip() { return strip; }, // the pictures the cue shows (cueOf), for the checks
    get firsts() { return firsts; },
    get told() { return mem.told; }, // (his calls of 5 Oct 2026: the sentences this device has told her, for the checks)
    get waiting() { return mem.waiting.length; }, // (and how many new ones wait their turn)
    get showing() { return !!(el && !el.hidden); },
    get drawn() { return drawn; }, // what the card showed when it was last tapped, for the checks
  };
}
