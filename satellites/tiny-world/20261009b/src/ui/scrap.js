// The Scrapbook (design 14 §4.3, §7 T12): the header's book, three pages a child can look at without reading a word.
//   Cards     (his calls, 1 and 2 Oct 2026; it was Firsts) every card she has found, in its section: one a kind of moment, in a
//             fixed order, each headed by its frame's colour, pattern and name and how many of that kind she has found. A new
//             card lies face down until she turns it; a tap turns a card over and back. src/ui/cards.js keeps them,
//             src/ui/cardart.js paints them.
//   Stickers  forty, shown only once earned, no outlines and no counts (14 §2)
//   Friends   the creatures the child named, alive or remembered
// Everything here is per device (IndexedDB `book`), never part of a world: a world given to somebody else does not carry
// their Stickers or Friends, and clearing a world, or a new one, does not empty it. The cards ride in the menu's Save to
// file (main.js, cards.js packFile), so a collection can go to a new device.
// The photo on a card is cut from the canvas the game is already drawing: there is no second renderer, because whichever
// renderer draws first empties w.dirty and the other one would silently stop seeing painted tiles.
import { url, picUrl } from '../art/sprites.js';
import { createBook, picOf } from './book.js';
import { str, fill } from './text.js';
import { SECTIONS, takeCards, openCards, saveCards, createCards, createSeen, packFile, unpackFile } from './cards.js';
import { createCardArt } from './cardart.js';

// locked() / onLocked(): the Pi rail before the unlock keeps every section but the first behind the ask (src/ui/pi.js).
export function createScrap({ data, getSim, store, cv, cam, now = () => Date.now(), seen: stood0 = null, locked = () => false, onLocked = () => {} }) {
  const el = document.getElementById('scrap'), openB = document.getElementById('scrapB');
  const U = data.ui.scrap, art = createCardArt({ data, U });
  let book = createBook({ data }), cards = createCards({ data }), friends = [], fresh = 0, saveT = 0, page = 'cards', seen = null;
  let friendsRead = false; // (her friends are written only over a list that was read: a read that failed is no empty list)
  const stood = stood0 || createSeen(); // who stood where as the last step ended (the card of a row whose ones have gone: cards.js; the Because system's too, main.js)

  // What was in the Scrapbook when the game started (and the Firsts kept before the cards, each now its card face up). Each
  // part on its own: a part the device could not read is never written over (his cards' review round, 2 Oct: a read that
  // failed was an empty book, and the next save wrote this session's cards over all of hers). The cards and the stickers
  // merge into the store whenever they are saved; her friends wait for a read that works.
  async function load() {
    if (!store) return;
    try {
      try { const got = await store.book('stickers'); book = createBook({ data, got: [...(Array.isArray(got) ? got : []), ...book.earned] }); } catch (e) { /* merged at the next save */ }
      try { friends = mergeFriends(await store.book('friends')); friendsRead = true; } catch (e) { /* not written until a read works */ }
      const opened = await openCards(store, data);
      if (opened.ok) {
        const early = opened.cards.merge(cards.list()); // anything found before the store answered
        cards = opened.cards;
        if (opened.moved || early) save();
      } else save(); // this session's book: the save merges with the store and takes in what it holds (cards.js adopt)
    } catch (e) { /* no store: the Scrapbook is empty this session and nothing breaks */ }
    mark();
  }
  // Her friends as the device keeps them and as this session named them (one row a creature, the newest name), the oldest
  // dropped past U.friendsMax.
  function mergeFriends(stored) {
    const m = new Map(), id = (f) => f.h + ':' + f.kind;
    for (const f of Array.isArray(stored) ? stored : []) if (f && typeof f === 'object') m.set(id(f), f);
    for (const f of friends) m.set(id(f), f);
    return [...m.values()].sort((a, b) => (a.at || 0) - (b.at || 0)).slice(-U.friendsMax);
  }
  const save = () => {
    if (!store) return;
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      store.mergeBook('stickers', (got) => [...new Set([...(Array.isArray(got) ? got : []), ...book.earned])])
        .then((got) => { for (const id of Array.isArray(got) ? got : []) if (typeof id === 'string') book.earned.add(id); }).catch(() => {});
      saveCards(store, cards).then((before) => cards.adopt(before)).catch(() => {});
      if (friendsRead) store.putBook('friends', friends).catch(() => {});
      else store.book('friends').then((fr) => { friends = mergeFriends(fr); friendsRead = true; return store.putBook('friends', friends); }).catch(() => {});
    }, U.saveMs);
  };
  // The header's book glows when something new is inside, and never more than once a minute (14 §4.3).
  let glowAt = 0;
  function mark() {
    openB.classList.toggle('new', fresh > 0 && now() - glowAt > U.glowEveryMs);
    if (fresh > 0 && now() - glowAt > U.glowEveryMs) glowAt = now();
  }

  // Called once per step with the story records the Because system drained. A record whose card she has never found is a
  // new card, face down, with its photo cut now where it happened; one she has is nothing new. Every step, records or none:
  // the cards keep who stood where as the step ended (the heron's card is where it stood before it flew off).
  function step(w, records) {
    const recs = records || [];
    if (recs.length) { const got = book.fromRecords(recs, w); if (got.length) { fresh += got.length; save(); } }
    const found = takeCards(cards, w, recs, { U, shoot, now, seen: stood });
    if (found.length) { fresh += found.length; save(); }
    if (recs.length) mark();
  }
  // Called for every command the child gives.
  function command(w, c) {
    const got = book.fromCommand(c);
    if (got.length) { fresh += got.length; save(); mark(); }
    if (c.t === 'rename' && c.name) {
      const e = entOf(w, c.h);
      if (e >= 0) {
        const i = friends.findIndex((f) => f.h === c.h);
        const row = { h: c.h, name: c.name, kind: w.E.kind[e], at: now(), gone: false };
        if (i >= 0) friends[i] = row; else friends.push(row);
        if (friends.length > U.friendsMax) friends.shift();
        save();
      }
    }
  }
  // Now and then: the stickers that watch the world itself, and which friends are still alive.
  function tick(w) {
    const got = book.fromWorld(w);
    if (got.length) { fresh += got.length; save(); mark(); }
    for (const f of friends) if (!f.gone && entOf(w, f.h) < 0) { f.gone = true; save(); }
  }

  // A photo of the moment, cut from the canvas the game just drew: a box around the place (U.shot canvas pixels, a world
  // pixel each at play size). Returns a data URL, or null when the place was not on the screen.
  function shoot(wx, wy) {
    if (!cv || !cam) return null;
    const [cx, cy] = cam.toCanvas(wx, wy), q = cam.pixel(), [sw, sh] = U.shot;
    const px = Math.round(cx / q), py = Math.round(cy / q), hw = sw >> 1, hh = sh >> 1;
    if (px < hw || py < hh || px > cv.width - hw || py > cv.height - hh) return null;
    try {
      const out = document.createElement('canvas');
      out.width = sw; out.height = sh;
      const g = out.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.drawImage(cv, px - hw, py - hh, sw, sh, 0, 0, sw, sh);
      return out.toDataURL('image/webp', 1); // lossless (a browser that cannot write a WebP gives a PNG): 3 KB, not 7 (measured, 2 Oct)
    } catch (e) { return null; }
  }

  // ---------- the screen ----------
  function open() {
    fresh = 0;
    openB.classList.remove('new');
    // The book takes the whole screen under the header (the field, the news and the tray), so a page of cards has room to be
    // flipped through; the header's book still shuts it.
    const hd = document.querySelector('header');
    el.style.top = (hd ? Math.round(hd.getBoundingClientRect().bottom) : 0) + 'px';
    el.hidden = false;
    draw();
  }
  const close = () => { el.hidden = true; el.textContent = ''; if (seen) { seen.disconnect(); seen = null; } };
  function draw() {
    const w = getSim() && getSim().w;
    if (seen) { seen.disconnect(); seen = null; }
    el.textContent = '';
    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    for (const [id, label] of [['cards', str('book.cards')], ['stickers', str('book.stickers')], ['friends', str('book.friends')]]) {
      const b = document.createElement('button');
      b.textContent = label;
      b.className = page === id ? 'on' : '';
      b.onclick = () => { page = id; draw(); };
      tabs.appendChild(b);
    }
    const done = document.createElement('button');
    done.className = 'done';
    done.textContent = str('book.close');
    done.onclick = close;
    tabs.appendChild(done);
    el.appendChild(tabs);
    const body = document.createElement('div');
    body.className = 'body' + (page === 'cards' ? ' cards' : '');
    el.appendChild(body);
    if (page === 'cards') drawCards(body);
    else if (page === 'stickers') drawStickers(body, w);
    else drawFriends(body);
  }
  // The cards, in their sections: how many of all she has found, then each section's heading (its frame, its pattern, its
  // name, how many of that kind) and its cards, the newest first. Nothing for a card she has not found. A card is built only
  // when it comes near the screen (U.near), so a book of every card opens at once on a phone.
  function drawCards(body) {
    const c = cards.counts();
    const top = document.createElement('p');
    top.className = 'ctotal';
    art.numbers(top, fill(str('book.countAll'), { n: c.all.got, of: c.all.of })); // (its digits drawn so a 5 is no S: cardart.js numbers)
    body.appendChild(top);
    if (!cards.size) body.appendChild(empty(str('book.nothingYet')));
    seen = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((list) => {
      for (const it of list) if (it.isIntersecting) { seen.unobserve(it.target); it.target.build(); }
    }, { root: body, rootMargin: `${U.near}px 0px` });
    let askedOnce = false; // the Pi rail's panel is said once, after the first section; the later headings keep their counts
    for (const s of SECTIONS) {
      const sec = document.createElement('section');
      sec.className = 'csec';
      sec.dataset.kind = s;
      const h = document.createElement('h3');
      h.style.borderImageSource = `url(${art.frameUrl(s)})`;
      h.appendChild(art.glyph(s));
      const name = document.createElement('span');
      name.textContent = str('book.kind.' + s);
      const n = document.createElement('small');
      art.numbers(n, fill(str('book.count'), { n: c.kinds[s].got, of: c.kinds[s].of }));
      h.append(name, n);
      sec.appendChild(h);
      if (locked() && s !== SECTIONS[0]) { // the Pi rail's taster: the first section is hers, the rest wait for the unlock
        if (!askedOnce) {
          askedOnce = true;
          const p = document.createElement('p');
          p.className = 'clocked';
          p.textContent = str('pi.scrapLocked');
          const b = document.createElement('button');
          b.className = 'clockedB';
          b.textContent = str('pi.buy');
          b.onclick = () => onLocked();
          sec.append(p, b);
        }
        body.appendChild(sec);
        continue;
      }
      const grid = document.createElement('div');
      grid.className = 'cgrid';
      grid.style.gridTemplateColumns = `repeat(${U.across}, minmax(0, 1fr))`;
      for (const card of cards.section(s)) {
        const slot = document.createElement('div');
        slot.className = 'cslot';
        slot.dataset.key = card.key;
        slot.build = () => { if (!slot.firstChild) slot.appendChild(art.card(card, s, { onTurn: turned, onShare: postcard })); };
        grid.appendChild(slot);
        if (seen) seen.observe(slot); else slot.build();
      }
      sec.appendChild(grid);
      body.appendChild(sec);
    }
  }
  // She turned a new card face up (a card's first tap, cardart.js): it stays face up, on this device and in the next file she saves.
  function turned(key) { if (cards.turn(key)) save(); }
  function drawStickers(body, w) {
    const got = book.page().filter((r) => r.got);
    if (!got.length) { body.appendChild(empty(str('book.nothingYet'))); return; }
    for (const r of got) {
      const card = document.createElement('div');
      card.className = 'sticker';
      const pic = w && picOf(w, data, r.pic);
      if (pic) { const im = new Image(); im.src = url(pic.spr, pic.over); im.alt = ''; card.appendChild(im); }
      const cap = document.createElement('span');
      cap.textContent = r.name;
      card.appendChild(cap);
      body.appendChild(card);
    }
  }
  function drawFriends(body) {
    if (!friends.length) { body.appendChild(empty(str('book.nothingYet'))); return; }
    const w = getSim() && getSim().w;
    for (const f of [...friends].reverse()) {
      const card = document.createElement('div');
      card.className = 'sticker' + (f.gone ? ' gone' : '');
      const sp = w && w.C.S[f.kind];
      if (sp) { const im = new Image(); im.src = url(sp.spr || f.kind, sp.over); im.alt = ''; card.appendChild(im); }
      const cap = document.createElement('span');
      cap.textContent = f.name;
      card.appendChild(cap);
      body.appendChild(card);
    }
  }
  const empty = (text) => { const p = document.createElement('p'); p.className = 'empty'; p.textContent = text; return p; };

  // A postcard: a card's photo with its Because pictures under it, handed to the player as a file (14 §4.3). The photo keeps
  // its own shape (a card's is four by three; a First kept before the cards, square).
  function postcard(f) {
    const out = document.createElement('canvas'), ph = Math.round((U.card * U.shot[1]) / U.shot[0]);
    out.width = U.card; out.height = ph + U.cardStrip;
    const g = out.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.fillStyle = data.art.dollSlot;
    g.fillRect(0, 0, out.width, out.height);
    const done = () => {
      out.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = str('book.fileName').replace('{n}', String(f.day || 1));
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      }, 'image/png');
    };
    const strip = () => {
      const pics = (f.pics || []).filter(Boolean);
      const size = U.cardStrip - 8, gap = 6;
      let x = Math.round((U.card - (pics.length * size + (pics.length - 1) * gap)) / 2);
      let left = pics.length;
      if (!left) return done();
      for (const p of pics) {
        const im = new Image();
        const at = x;
        im.onload = im.onerror = () => { g.drawImage(im, at, ph + 4, size, size); if (--left === 0) done(); };
        im.src = picUrl(p);
        x += size + gap;
      }
    };
    if (f.shot) {
      const im = new Image();
      im.onload = () => { const k = Math.max(U.card / im.width, ph / im.height), dw = im.width * k, dh = im.height * k; g.drawImage(im, (U.card - dw) / 2, (ph - dh) / 2, dw, dh); strip(); };
      im.onerror = () => strip();
      im.src = f.shot;
    } else strip();
  }

  // The menu's Save to file carries the cards (main.js exportWorld: the world's text with her cards in it, cards.js packFile),
  // and a file opened (main.js importF) brings any she does not have into her book and hands the world's own text on to the
  // save code (cards.js unpackFile).
  const toFile = (text) => packFile(text, cards);
  function openFile(text) { const file = unpackFile(text); if (file.cards) fromFile(file.cards); return file.text; }
  function fromFile(list) {
    const n = cards.merge(list);
    if (n) { fresh += n; save(); mark(); if (!el.hidden && page === 'cards') draw(); }
    return n;
  }

  openB.onclick = () => (el.hidden ? open() : close());
  const ready = load(); // (resolves when the device's book has been read, or could not be: tools/card-wiring.mjs waits on it)
  return { step, command, tick, open, close, toFile, openFile, fromFile, turn: turned, ready, get fresh() { return fresh; }, get book() { return book; }, get cards() { return cards; }, get friends() { return friends; } };
}
function entOf(w, h) { for (let k = 0; k < w.count; k++) if (w.slotH[w.order[k]] === h) return w.order[k]; return -1; }
