// The paper doll (design 14 §7 T10). Poke a creature and it stands here, bigger than it is on the field, wearing
// what it wears: the six slots around it, each with the piece in it or empty. No reading needed; a child sees the
// crown on the chicken's head and the boots on its feet.
// It never takes a touch (the world plays on under it) and it is gone the moment nothing is selected.
import { sprite, url } from '../art/sprites.js';
import { str, fill } from './text.js';
import { dial, DIALS } from '../sim/ai/decide.js';

const SLOTS = ['head', 'body', 'back', 'hand', 'feet', 'charm'];

export function createDoll({ data, getSim, command = () => {}, onClose = () => {}, now = () => performance.now() }) {
  const el = document.getElementById('doll');
  if (!el) return { update() {}, hide() {}, note() {} };
  const cv = el.querySelector('canvas'), g = cv.getContext('2d');
  const U = data.ui.doll;
  let shown = 0, lastKey = '', selectedH = 0;
  // The last five things that happened to a creature (design 14 §4.2), per device: fed from the story records the
  // Because system already drains, kept by handle, and never saved with the world.
  const history = new Map();
  cv.width = U.w; cv.height = U.h;

  function draw(w, e) {
    const E = w.E, S = w.C.S, kind = E.kind[e], sp = S[kind];
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, U.w, U.h);
    // The creature itself, eight times over, with what it wears drawn on it the way the field draws it.
    const body = sprite(sp.spr || kind, E.over[e] || sp.over);
    const z = U.zoom, bx = 2, by = U.h - 8 * z - 2; // its feet on the floor of the panel, room for a tall hat above
    if (body) g.drawImage(body, bx, by, 8 * z, 8 * z);
    // What it wears, layered on: the hand-drawn hats where there are any, else the piece's own picture, and the
    // body piece over the body. A paper doll that shows empty boxes beside a bare figure is not a doll.
    const G = E.gear[e], hat = G.head && data.art.hats[G.head];
    if (hat) for (const q of hat) { g.fillStyle = data.sprites.palette[q[0]]; g.fillRect(bx + q[1] * z, by + q[2] * z, q[3] * z, q[4] * z); }
    else if (G.head) layer(G.head, bx, by - 4 * z, z, 5); // four pixels above the body, where the field draws it
    // Armor is a tint on the field, not a picture, and the doll shows it the same way: a body sprite drawn whole
    // over the figure hid its face (looked at, Sep 20).
    if (G.armor && sp.humanoid) { g.fillStyle = data.art.armorTint[G.armor]; g.fillRect(bx + 2 * z, by + 4 * z, 4 * z, z); }
    // The six slots, two rows of three, each 8 px of picture at U.slotZoom, empty ones just an outline.
    for (let i = 0; i < SLOTS.length; i++) {
      const id = G[SLOTS[i]], piece = id && data.gear.find((p) => p.id === id);
      const sx = U.slotX + (i % 3) * U.slot, sy = U.slotY + ((i / 3) | 0) * U.slot;
      g.fillStyle = data.art.dollSlot; g.fillRect(sx, sy, U.slot - 2, U.slot - 2);
      if (!piece) continue;
      const can = sprite(piece.spr || piece.id, piece.over);
      if (can) g.drawImage(can, sx + 1, sy + 1, U.slot - 4, U.slot - 4);
    }
    // The last five things that happened to it, small, under the slots (14 §4.2).
    const past = history.get(w.slotH[e]);
    if (past) for (let i = 0; i < past.length; i++) {
      const icon = w.C.icons[past[i]], can = icon && sprite(icon.spr, icon.over);
      if (can) g.drawImage(can, U.slotX + i * (U.past + 2), U.pastY, U.past, U.past);
    }
    // (Its name is no longer drawn here: it is the title row over the picture, real text; title() below.)
    // Design 15 B2: what kind of creature this one is, as pictures — at most two, and only the dials that are
    // not middling, so an ordinary creature shows none and a character shows what makes it one.
    if (w.R.flags.dials) {
      const show = [];
      for (let k = 0; k < DIALS.length; k++) {
        const v = dial(w, e, k);
        if (v) show.push([Math.abs(v), DIALS[k] + (v > 0 ? 'High' : 'Low')]);
      }
      show.sort((a, b) => b[0] - a[0]);
      // Under the weapon box, where the panel is empty: over the figure they were half hidden by it (looked at)
      for (let i = 0; i < Math.min(2, show.length); i++) pixels(data.art.dials[show[i][1]], U.slotX + 3 * U.slot + i * 18, U.slotY + U.slot + 6, 2);
    }
    // The weapon, in a box of its own beside the slots, when it carries one.
    const wp = G.weapon && data.weapons[G.weapon];
    const wx = U.slotX + 3 * U.slot, wy = U.slotY;
    g.fillStyle = data.art.dollSlot; g.fillRect(wx, wy, U.slot - 2, U.slot - 2);
    if (wp) {
      const can = sprite(wp.spr || G.weapon, wp.over);
      if (can) g.drawImage(can, wx + 1, wy + 1, U.slot - 4, U.slot - 4);
    }
  }
  // A little pixel picture from art.json (the same shape as the save disk): one letter per pixel, space clear.
  function pixels(icon, x, y, z) {
    if (!icon) return;
    for (let j = 0; j < icon.px.length; j++) {
      const row = icon.px[j];
      for (let i = 0; i < row.length; i++) {
        const c = icon.col[row[i]];
        if (!c) continue;
        g.fillStyle = c;
        g.fillRect(x + i * z, y + j * z, z, z);
      }
    }
  }

  // One worn piece, drawn over the figure: `rows` of its 8x8 picture from the top (a hat is drawn in its top half).
  function layer(id, bx, by, z, rows) {
    const piece = data.gear.find((p) => p.id === id);
    const can = piece && sprite(piece.spr || piece.id, piece.over);
    if (can) g.drawImage(can, 0, 0, 8, rows, bx, by, 8 * z, rows * z);
  }

  // The title row (Stephen, 25 Sep: "it should tell you what animal youre looking at like where peoples names
  // usually are"): what dollTitle() says, in the game's own font. A shield before the name when naming is what
  // protects it (Pets safe, T11): the rule is invisible otherwise, and a child should be able to see that this one
  // is looked after (15 A5). The longest name with the longest kind is stepped down a pixel at a time until it fits.
  const tEl = document.getElementById('dollTitle'), tBig = tEl && tEl.querySelector('span'), tSmall = tEl && tEl.querySelector('small');
  if (tEl) {
    tBig.style.color = data.art.dollName;
    tEl.querySelector('path:last-child').setAttribute('fill', data.art.dollShield); // (the first path is its dark outline)
  }
  function title(w, e) {
    if (!tEl) return;
    const t = dollTitle(w, e, data.strings);
    tBig.textContent = t.big; tSmall.textContent = t.small;
    tEl.classList.toggle('safe', !!(w.E.named[e] && w.petsSafe));
    for (let s = U.nameSize; s >= U.titleMin; s--) {
      tBig.style.fontSize = s + 'px';
      tSmall.style.fontSize = Math.max(U.titleMin, s - U.nameSize + U.kindSize) + 'px';
      if (tEl.scrollWidth <= tEl.clientWidth) break;
    }
  }

  // The name button and the sheet of names, both real touch targets over the panel.
  const nameB = document.getElementById('dollName'), sheet = document.getElementById('namesheet');
  nameB.setAttribute('aria-label', str('ui.name'));
  nameB.onclick = () => openSheet();
  // A way out of the card (Stephen, Sep 20). It used to close only on a Hand tap on empty ground, so with any
  // build tool in hand there was no way to put it down at all.
  const closeB = document.getElementById('dollX');
  if (closeB) { closeB.setAttribute('aria-label', str('ui.close')); closeB.onclick = () => { closeSheet(); onClose(); }; }
  function openSheet() {
    const sim = getSim(), w = sim && sim.w, e = w && selectedH ? entOf(w, selectedH) : -1;
    if (e < 0) return;
    sheet.textContent = '';
    const row = document.createElement('div');
    for (const n of pickNames(w, e)) {
      const b = document.createElement('button');
      b.textContent = n;
      b.onclick = () => { command({ t: 'rename', h: selectedH, name: n }); closeSheet(); };
      row.appendChild(b);
    }
    sheet.appendChild(row);
    const clear = document.createElement('button');
    clear.className = 'wide';
    clear.textContent = str('ui.noName');
    clear.onclick = () => { command({ t: 'rename', h: selectedH, name: '' }); closeSheet(); };
    sheet.appendChild(clear);
    sheet.hidden = false;
  }
  const closeSheet = () => { sheet.hidden = true; sheet.textContent = ''; };
  // A touch anywhere on the field puts the sheet away, the way the crowded picker goes (14 §3: no dead ends).
  const field = document.getElementById('c');
  if (field) field.addEventListener('pointerdown', closeSheet, true);
  const pickNames = (w, e) => sheetNames(data.names, w.E.kind[e], !!w.C.S[w.E.kind[e]].pet, w.E.id[e]);

  return {
    // Called with whatever the HUD is showing (four times a second).
    update(sim, selected) {
      const w = sim.w, e = selected ? entOf(w, selected) : -1;
      selectedH = e >= 0 ? selected : 0;
      if (e < 0) { if (shown) { el.hidden = true; shown = 0; lastKey = ''; closeSheet(); } return; }
      const G = w.E.gear[e];
      const h = history.get(selected);
      const key = w.E.kind[e] + '|' + SLOTS.map((s) => G[s] || '').join(',') + '|' + (G.weapon || '') + '|' + selected +
        '|' + (w.E.name[e] || '') + '|' + (w.E.named[e] && w.petsSafe ? 1 : 0) + '|' + (h ? h.join(',') : '');
      if (!shown) { el.hidden = false; shown = 1; } // shown first: the title is measured to fit, and a hidden row measures nothing
      if (key !== lastKey) { lastKey = key; draw(w, e); title(w, e); }
    },
    // The story records this step, kept as the last five icons for whoever they were about (14 §4.2).
    note(w, records) {
      for (const r of records) {
        for (const a of r.actors) {
          if (!a.h) continue;
          let list = history.get(a.h);
          if (!list) { list = []; history.set(a.h, list); }
          const icon = r.result >= 0 ? r.result : r.causeA;
          if (icon >= 0) { list.push(icon); if (list.length > 5) list.shift(); }
        }
      }
      if (history.size > 200) { // a long game: forget the oldest handles, the panel only ever shows one creature
        const keys = [...history.keys()].slice(0, history.size - 200);
        for (const k of keys) history.delete(k);
      }
    },
    hide() { el.hidden = true; shown = 0; lastKey = ''; closeSheet(); history.clear(); },
  };
}
// What the card calls the one on it (Stephen, 25 Sep). DOM free, so the fixtures read exactly what the card prints.
// big: the name it has (given by her, or born with, as a pet is), else what it is ("Sheep", from creatures.json,
// the same word the tray shows). small: what it is, after a name ("the sheep"). People keep their names alone.
export function dollTitle(w, e, strings) {
  const kind = w.E.kind[e], what = w.C.S[kind].name, name = w.E.name[e];
  if (!name) return { big: what, small: '' };
  if (kind === 'human') return { big: name, small: '' };
  return { big: name, small: fill(strings['name.the'], { kind: inSentence(what) }) };
}
// A kind inside a sentence: "the polar bear", and "the UFO" (a word all in capitals keeps them).
const inSentence = (s) => s.split(' ').map((x) => (x.length > 1 && x === x.toUpperCase() ? x : x.toLowerCase())).join(' ');

// The twelve names her pencil offers: the ones this kind is given in the world, and the wild list, taken from the
// creature's own id so the same creature always offers the same twelve. DOM free, so a fixture reads what the sheet
// shows. The walk takes every 13th name, or on a long list a stride that crosses the whole of it in twelve steps
// (25 Sep: with the people's names grown past two thousand, in ABC order, every 13th name from one place was twelve
// names that all began with the same letter). The stride shares no factor with the length, so it comes back to
// where it started only after every name, and twelve steps are twelve different places.
export function sheetNames(N, kind, pet, id) {
  const pool = (kind === 'human' ? N.people : pet ? N.pets : N.wild).concat(N.wild), len = pool.length, out = [];
  let step = Math.max(13, Math.floor(len / 12));
  while (gcd(step, len) !== 1) step++;
  for (let i = 0; out.length < 12 && i < len * 2; i++) {
    const n = pool[(id * 7 + i * step) % len];
    if (!out.includes(n)) out.push(n);
  }
  return out;
}
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// The creature a handle names, or -1 (ents.js ent(), without importing the sim into the interface).
function entOf(w, h) {
  for (let k = 0; k < w.count; k++) if (w.slotH[w.order[k]] === h) return w.order[k];
  return -1;
}
