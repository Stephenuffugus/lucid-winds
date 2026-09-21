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
import { drainStory } from '../sim/story.js';
import { EVI } from '../sim/events.js';
import { url } from '../art/sprites.js';
import { sentence } from './text.js';

// A step with any of these in the events ring is a fight or a disaster.
export const LOUD = ['hit', 'shot', 'boom', 'quake', 'bolt'];
const FIRSTS_KEY = 'tw_firsts';

// The arbiter, kept apart from the page so it can be tested on its own (tools/because-check.mjs).
// records: this step's story records. spark: the record kinds that can raise a cue (story.json). firsts: the kinds
// this device has already seen. live: a sparkle is already on the field. loud: this step was a fight or a disaster.
// Returns the record to cue, or null.
export function pickCue(records, { spark, firsts, live, loud }) {
  if (live) return null; // one at a time
  let first = null, any = null;
  for (const r of records) {
    if (!spark.has(r.kind)) continue;
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

// ui: the interface state the renderer draws from; this owns ui.spark ({ x, y, t0, ms } or null).
export function createBecause({ data, wrap, cam, status, ui, getSim, store = window.localStorage, now = () => performance.now() }) {
  const U = data.ui.because, kinds = Object.entries(data.story.kinds);
  const spark = new Set(kinds.filter(([, v]) => v.spark).map(([k]) => k)), why = new Set(kinds.filter(([, v]) => v.why).map(([k]) => k));
  const firsts = loadFirsts(store);
  const el = typeof document === 'undefined' ? null : document.getElementById('because'); // the checks run this module without a page
  let cue = null, hideT = 0, drawn = []; // cue: the record the sparkle stands for
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
    if (ui.why) {
      const t = now();
      for (const r of records) {
        if (!why.has(r.kind) || !r.actors.length || r.causeA < 0) continue;
        const h = r.actors[0].h, live0 = ui.why.get(h);
        if (!live0 || t - live0.t0 > U.whyMs) ui.why.set(h, { icon: r.causeA, t0: t });
      }
    }
    const r = pickCue(records, { spark, firsts, live, loud });
    if (!r) return records;
    if (!firsts.has(r.kind)) { firsts.add(r.kind); saveFirsts(store, firsts); }
    cue = r;
    ui.spark = { x: r.place[0], y: r.place[1], t0: now(), ms: U.sparkMs };
    // The world's news: one sentence, the one the sparkle is about, with the pictures that go with it (15 A3).
    if (r.say) {
      const table = iconTable();
      const pics = [r.causeA, r.causeB, r.result].filter((i) => i >= 0).map((i) => table[i]).filter(Boolean);
      status.news(sentence(r.say), pics);
    }
    return records;
  }

  // A tap at a world point: the sparkle takes it when the finger lands within U.tapWorld px of it (the Hand's
  // taps only, main.js). Returns true when it did, so the tool underneath does nothing.
  function tap(x, y) {
    const s = ui.spark;
    if (!s || !cue || now() - s.t0 > s.ms) return false;
    if (Math.hypot(x - s.x, y - s.y) > U.tapWorld) return false;
    show(cue);
    ui.spark = null;
    return true;
  }

  // The card: A (+ B) -> the result, beside the spot, fading over U.cardMs. It never takes a touch (the world
  // keeps playing under it) and it never pauses anything.
  function show(r) {
    if (!el) return;
    const icons = iconTable();
    el.textContent = '';
    drawn = [];
    const pics = [r.causeA, r.causeB].filter((i) => i >= 0), out = r.result;
    pics.forEach((i, k) => {
      if (!icons[i]) return;
      if (k && el.childNodes.length) el.appendChild(sign('+'));
      el.appendChild(pic(icons[i]));
    });
    if (out >= 0) { el.appendChild(sign('→')); el.appendChild(pic(icons[out])); }
    el.hidden = false; // shown first: the card is measured, never guessed at (it grows with its pictures)
    place(r.place[0], r.place[1]);
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
  function pic(icon, baby) {
    const im = new Image();
    im.src = url(icon.spr, icon.over);
    im.alt = '';
    if (baby) im.className = 'baby';
    drawn.push(icon.spr);
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
    clear() { cue = null; ui.spark = null; if (ui.why) ui.why.clear(); if (el) { clearTimeout(hideT); el.hidden = true; el.textContent = ''; } },
    get cue() { return cue; },
    get firsts() { return firsts; },
    get showing() { return !!(el && !el.hidden); },
    get drawn() { return drawn; }, // what the card is showing, for the checks
  };
}
