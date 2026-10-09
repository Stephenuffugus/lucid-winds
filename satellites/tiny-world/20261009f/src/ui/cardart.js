// A card, painted (his calls, 1 and 2 Oct 2026: "really cool and each one unique ... actually look like cards"; the lead's
// draft THE CARD LOOK, kept in the lead's memory as scripts/cardlook/). Browser only: src/ui/scrap.js lays the book out with
// these, src/ui/cards.js keeps what is in it.
//   FRONT  the frame by the card's section (a colour and a little pattern round all four sides, stepped pixel corners), a
//          name plate, the picture (the ground where it happened, the things on it, the light of the hour, and the row's own
//          animals drawn big with a soft ink edge so a white one shows on the ice), the A + B -> what happened strip she
//          knows from the field, the words said. A friend she named puts their name on it, and it shines.
//   BACK   the photo of the moment (cut from the canvas the game was drawing, scrap.js shoot()), who was there, the day.
//   DECK   a card she has not turned yet: the back of every card, with New on it.
// Every picture is the game's own sprites (src/art/sprites.js) on the game's own terrain colours; nothing here draws the
// world (a card is painted from what it kept, never from a world).
import { sprite, picUrl, tileHash, restored } from '../art/sprites.js';
import { str, fill } from './text.js';
import { refPic, whoLine, nameKey } from './cards.js';
import { chipOf } from './chips.js';

// The digits of a count or a day, drawn as the game's pixel font draws them (fonts/pixelify-sans, five pixels by seven, a pixel
// 0.09 of the text's size), but for its 5, which the font draws as its S at every size, one step apart (his cards' review round,
// 2 Oct: "18 of 35" read "18 of 3S" in the book's counts): the 5 here has a flat top. Inline SVG in the text's own colour.
const DIGITS = {
  0: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], 1: ['.#.', '#.#', '..#', '..#', '..#', '..#', '..#'], // (the 1 is three wide, as the font's)
  2: ['.###.', '#...#', '....#', '.###.', '#....', '#...#', '.###.'], 3: ['.###.', '#...#', '....#', '.###.', '....#', '#...#', '.###.'],
  4: ['...##', '..#.#', '.#..#', '#...#', '#####', '....#', '....#'], 5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#...#', '#....', '####.', '#...#', '#...#', '.###.'], 7: ['.###.', '#...#', '....#', '....#', '....#', '....#', '....#'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'], 9: ['.###.', '#...#', '#...#', '.####', '....#', '#...#', '.###.'],
};
const DIGIT_PATH = Object.fromEntries(Object.entries(DIGITS).map(([d, rows]) => [d, rows.flatMap((r, y) => [...r].map((c, x) => (c === '#' ? `M${x} ${y}h1v1h-1z` : ''))).join('')]));
// Text with its digits drawn so (the book's count, a section's count, the day on a card): into `node`, in place of its text.
export function numbers(node, text) {
  node.textContent = '';
  for (const part of String(text).split(/(\d)/)) {
    if (!part) continue;
    if (!DIGIT_PATH[part]) { node.appendChild(document.createTextNode(part)); continue; }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${DIGITS[part][0].length} 7`); svg.setAttribute('shape-rendering', 'crispEdges'); svg.setAttribute('class', part === '1' ? 'dg n1' : 'dg');
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', part);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', DIGIT_PATH[part]);
    svg.appendChild(path);
    node.appendChild(svg);
  }
  return node;
}
const SHIELD = '<svg viewBox="-1 -1 9 10" shape-rendering="crispEdges" aria-hidden="true"><path d="M-1 -1h9v7H-1zM0 6h7v2H0zM1 8h5v1H1z"/><path d="M0 0h7v5H0zM1 5h5v2H1zM2 7h3v1H2z"/></svg>';

export function createCardArt({ data, U }) {
  const A = data.art.cardArt, INK = A.ink;
  const frames = {}, glyphs = {}, inks = {};
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const img = (src, cls) => { const i = new Image(); i.src = src; i.alt = ''; if (cls) i.className = cls; return i; };

  // The frame as a nine-slice picture (CSS border-image, slice 7): stepped corners, an inked outline, a bevel lit on the top
  // and left, and the section's pattern running round all four sides.
  function frameUrl(kind) {
    if (frames[kind]) return frames[kind];
    const K = A.kinds[kind], P = K.motif[0].length, S = 14 + P;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d'), put = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const inX = x >= 7 && x < 7 + P, inY = y >= 7 && y < 7 + P;
      if (inX && inY) continue; // the middle: the card's own body
      if (!inX && !inY) { // a corner, stepped
        const right = x >= 7 + P, bottom = y >= 7 + P, cx = right ? S - 1 - x : x, cy = bottom ? S - 1 - y : y, s = cx + cy;
        if (s <= 2) continue;
        if (s === 3 || cx === 0 || cy === 0 || (cx === 6 && cy === 6)) { put(x, y, INK); continue; }
        const lit = (cy === 1 && !bottom) || (cx === 1 && !right), shade = (cy === 1 && bottom) || (cx === 1 && right);
        put(x, y, lit && !shade ? K.light : shade && !lit ? K.dark : K.base);
        continue;
      }
      let d, u, lit; // a side: d how far in from the outside edge, u how far along it
      if (inX) { if (y < 7) { d = y; lit = true; } else { d = S - 1 - y; lit = false; } u = x - 7; } else { if (x < 7) { d = x; lit = true; } else { d = S - 1 - x; lit = false; } u = y - 7; }
      if (d === 0 || d === 6) { put(x, y, INK); continue; }
      if (d === 1) { put(x, y, lit ? K.light : K.dark); continue; }
      put(x, y, K.motif[d - 2][u % P] === 'x' ? K.light : K.base);
    }
    return (frames[kind] = c.toDataURL());
  }
  // The section's pattern, small, for a name plate and a section's heading.
  function glyph(kind) {
    if (!glyphs[kind]) {
      const K = A.kinds[kind], c = document.createElement('canvas'); c.width = c.height = 7;
      const g = c.getContext('2d');
      g.fillStyle = K.dark; g.fillRect(0, 0, 7, 7); g.fillStyle = K.base; g.fillRect(1, 1, 5, 5); g.fillStyle = K.light;
      for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) if (K.motif[j][i % K.motif[j].length] === 'x') g.fillRect(1 + i, 1 + j, 1, 1);
      glyphs[kind] = c.toDataURL();
    }
    return img(glyphs[kind], 'glyph');
  }

  // An animal (or a thing) on a card: a soft ink edge first, so a white one shows on white ice, then the game's own sprite.
  function inked(g, ref, x, y, flip) {
    const p = refPic(data, ref);
    if (p) inkedSprite(g, sprite(p.spr, p.over), p.spr + JSON.stringify(p.over || null), x, y, flip);
  }
  let lost = restored(); // (a lost GPU context wipes every canvas: the edges are made again after one, as the sprites are)
  function inkedSprite(g, s, key, x, y, flip) {
    if (restored() !== lost) { lost = restored(); for (const k in inks) delete inks[k]; }
    if (!inks[key]) {
      const c = document.createElement('canvas'); c.width = c.height = 8;
      const k = c.getContext('2d');
      k.drawImage(s, 0, 0); k.globalCompositeOperation = 'source-in'; k.fillStyle = INK; k.fillRect(0, 0, 8, 8);
      inks[key] = c;
    }
    const at = (cv, dx, dy) => { g.save(); if (flip) { g.translate(x + dx + 8, y + dy); g.scale(-1, 1); } else g.translate(x + dx, y + dy); g.drawImage(cv, 0, 0); g.restore(); };
    const a = g.globalAlpha;
    g.globalAlpha = a * A.inkAlpha;
    at(inks[key], -1, 0); at(inks[key], 1, 0); at(inks[key], 0, -1); at(inks[key], 0, 1);
    g.globalAlpha = a;
    at(s, 0, 0);
  }

  // A picture in the strip: the game's own (picUrl), a sprite with the same soft ink edge as on the picture, so a green frog
  // shows on the grass chip (the look, 2 Oct: it did not). 10 by 10: the sprite and its edge.
  const chips = {};
  function chip(p) {
    if (p.cols) return picUrl(p); // a terrain is its own tile, edge to edge
    const key = p.spr + JSON.stringify(p.over || null);
    if (!chips[key]) {
      const c = document.createElement('canvas'); c.width = c.height = 10;
      inkedSprite(c.getContext('2d'), sprite(p.spr, p.over), key, 1, 1, false);
      chips[key] = c.toDataURL();
    }
    return chips[key];
  }

  // The picture: the ground round the place as it was (its terrain's three colours, the game's tile noise), the things
  // standing there, the light of the hour, and the row's own animals, the first on the left facing the second on the right.
  // A card kept from before the cards has no ground: the middle of its photo is the ground, as it was at that moment.
  function picture(card, kind) {
    const [gc, gr] = U.ground, W = gc * 8, H = gr * 8;
    const c = document.createElement('canvas'); c.width = W; c.height = H; c.className = 'scene';
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    const cast = card.cast && card.cast.length ? card.cast : [];
    const people = () => {
      g.globalAlpha = card.hour === 'night' ? A.nightCast : 1;
      if (cast.length >= 2) { inked(g, cast[0], 4, H - 15, false); inked(g, cast[1], W - 12, H - 12, true); } else if (cast.length) inked(g, cast[0], (W - 8) >> 1, H - 13, false);
      g.globalAlpha = 1;
    };
    const light = () => { const t = card.hour && A.hours[card.hour]; if (t) { g.fillStyle = t; g.fillRect(0, 0, W, H); } };
    const G = card.ground;
    if (G) {
      const cols = G.w, rows = Math.ceil(G.m.length / cols);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const tx = Math.min(cols - 1, Math.floor((x / W) * cols)), ty = Math.min(rows - 1, Math.floor((y / H) * rows));
        const ter = data.terrain[G.t[parseInt(G.m[ty * cols + tx], 36)]], r = tileHash(x, y, 3);
        g.fillStyle = ter ? ter.cols[r < 0.6 ? 0 : r < 0.82 ? 1 : 2] : A.kinds[kind].dark;
        g.fillRect(x, y, 1, 1);
      }
      for (const [i, type] of G.th) {
        const p = refPic(data, 'thing:' + type);
        if (p) g.drawImage(sprite(p.spr, p.over), Math.round(((i % cols) * W) / cols), Math.round((Math.floor(i / cols) * H) / rows));
      }
      light(); people();
    } else if (card.shot) {
      g.fillStyle = A.kinds[kind].dark; g.fillRect(0, 0, W, H);
      const im = new Image();
      im.onload = () => { g.drawImage(im, (im.width - W) >> 1, (im.height - H) >> 1, W, H, 0, 0, W, H); };
      im.src = card.shot;
    } else { g.fillStyle = A.kinds[kind].dark; g.fillRect(0, 0, W, H); people(); }
    return c;
  }

  // The name on the plate: the card's own (strings.json card.<row id in camelCase>, every card has one since the ticket
  // card names, 3 Oct: cards.js nameFaults), else its animals' names ("Heron and Frog"), else its section's (a card kept
  // from a row the game no longer has).
  function nameOf(card, kind) {
    const own = str(plateKey(card.key));
    if (own) return own;
    const names = (card.cast || []).map((r) => (refPic(data, r) || {}).name).filter(Boolean);
    if (names.length >= 2) return fill(str('book.and'), { x: names[0], y: names[1] });
    return names[0] || str('book.kind.' + kind);
  }
  // Who was there: her name for one she named, "a heron" or "an owl" for one she did not (cards.js whoLine).
  const whoOf = (card) => whoLine(card, data);
  const whenOf = (card) => fill(str(card.hour ? 'book.when.' + card.hour : 'book.when') || str('book.when'), { n: card.day });

  function front(card, kind) {
    const f = el('div', 'pc-face pc-front' + (card.friend ? ' shine' : ''));
    f.style.borderImageSource = `url(${frameUrl(kind)})`;
    const t = el('div', 'pc-title');
    t.appendChild(el('span', null, nameOf(card, kind)));
    t.appendChild(glyph(kind));
    f.appendChild(t);
    const art = el('div', 'pc-art');
    art.appendChild(picture(card, kind));
    const wh = el('div', 'pc-when');
    wh.appendChild(img(picUrl({ spr: card.hour === 'dusk' || card.hour === 'night' ? 'moon' : 'sun' })));
    wh.appendChild(numbers(el('span'), fill(str('book.when'), { n: card.day })));
    art.appendChild(wh);
    if (card.friend) { const fr = el('div', 'pc-friend'); fr.innerHTML = SHIELD; fr.appendChild(document.createTextNode(card.friend)); art.appendChild(fr); }
    f.appendChild(art);
    const strip = el('div', 'pc-strip');
    (card.pics || []).forEach((p, i, all) => {
      if (i) strip.appendChild(el('b', null, i === all.length - 1 ? '→' : '+'));
      const box = el('i'); box.style.background = chipOf(data, p); box.appendChild(img(chip(p))); strip.appendChild(box); // (on the chip it reads on: chips.js, card polish 3)
    });
    f.appendChild(strip);
    f.appendChild(el('p', 'pc-say', card.say || ''));
    return f;
  }
  // The back of a card she has turned: the photo of the moment, who was there, the day; with no photo (the place was off the
  // screen), the card's own picture of the place in the print instead. Never the game's picture: that is the back of a card
  // still face down (the review round, 2 Oct: 9 to 18 of her cards turned over looked face down).
  function back(card, kind, onShare) {
    const b = el('div', 'pc-face pc-back');
    b.style.borderImageSource = `url(${frameUrl('deck')})`;
    const ph = el('div', 'pc-photo');
    ph.appendChild(card.shot ? img(card.shot) : picture(card, kind));
    b.appendChild(ph);
    b.appendChild(el('p', 'pc-who', whoOf(card)));
    b.appendChild(numbers(el('p', 'pc-day'), whenOf(card)));
    if (card.shot && onShare) {
      const s = el('button', 'pc-share', str('book.share'));
      s.onclick = (ev) => { ev.stopPropagation(); onShare(card); };
      b.appendChild(s);
    }
    return b;
  }
  // The back of every card: what a new one shows until she turns it, the deck's pattern all over it like a real card's back.
  let dots = null;
  function deck() {
    const b = el('div', 'pc-face pc-back pc-deck');
    b.style.borderImageSource = `url(${frameUrl('deck')})`;
    if (!dots) {
      const K = A.kinds.deck, c = document.createElement('canvas'); c.width = c.height = 6;
      const g = c.getContext('2d');
      g.fillStyle = K.dark; g.fillRect(1, 1, 1, 1); g.fillRect(4, 4, 1, 1); g.fillStyle = K.base; g.fillRect(4, 1, 1, 1); g.fillRect(1, 4, 1, 1);
      dots = c.toDataURL();
    }
    b.style.backgroundImage = `url(${dots})`;
    b.appendChild(img('icons/icon-192.png', 'pc-emblem'));
    b.appendChild(el('p', 'pc-mark', str('book.emblem')));
    return b;
  }

  // One card, as the book shows it. Face down until she turns it (onTurn, once, with the card's key); a tap after that turns
  // it over and back. The faces are built when the card is first shown (scrap.js draws the book lazily).
  function card(c, kind, { onTurn, onShare } = {}) {
    const root = el('div', 'pcard' + (c.up ? '' : ' fresh flipped'));
    root.tabIndex = 0;
    root.setAttribute('role', 'button');
    const label = () => root.setAttribute('aria-label', c.up ? fill(str('book.turn'), { name: nameOf(c, kind) }) : str('book.turnNew'));
    label();
    const inner = el('div', 'pc-inner');
    inner.appendChild(front(c, kind));
    let backFace = c.up ? back(c, kind, onShare) : deck();
    inner.appendChild(backFace);
    root.appendChild(inner);
    root.appendChild(el('div', 'pc-new', str('book.new')));
    const turn = () => {
      if (!c.up) {
        // the first turn: face up for good, and the back she sees from now on is the photo
        root.classList.remove('fresh', 'flipped');
        if (onTurn) onTurn(c.key);
        c.up = true;
        label();
        setTimeout(() => { const nb = back(c, kind, onShare); inner.replaceChild(nb, backFace); backFace = nb; }, 700);
        return;
      }
      root.classList.toggle('flipped');
    };
    root.addEventListener('click', turn);
    root.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); turn(); } });
    return root;
  }

  return { frameUrl, glyph, picture, card, nameOf, numbers };
}
// The strings.json key of a card's own name: card.<its row's id in camelCase>, or card.<the first> (card.birth): cards.js nameKey.
export const plateKey = nameKey;
