// The Scrapbook (design 14 §4.3, §7 T12): three pages a child can look at without reading a word.
//   Firsts    the first time each thing happened in this child's world, with a picture taken at the moment and
//             the Because pictures beside it
//   Stickers  forty, shown only once earned, no outlines and no counts (14 §2)
//   Friends   the creatures the child named, alive or remembered
// Everything here is per device (IndexedDB `book`), never part of a world: a world given to somebody else does
// not carry their Scrapbook, and clearing a world does not empty it.
// The picture is cut from the canvas the game is already drawing — there is no second renderer, because whichever
// renderer draws first empties w.dirty and the other one would silently stop seeing painted tiles.
import { url } from '../art/sprites.js';
import { createBook, picOf } from './book.js';
import { str } from './text.js';

const KIND_ORDER = ['birth', 'death', 'zombie', 'abducted', 'rescued', 'returned', 'landed', 'love', 'reaction'];

export function createScrap({ data, getSim, store, cv, cam, now = () => Date.now() }) {
  const el = document.getElementById('scrap'), openB = document.getElementById('scrapB');
  const U = data.ui.scrap;
  let book = createBook({ data }), firsts = [], friends = [], fresh = 0, saveT = 0, page = 'firsts';

  // What was in the Scrapbook when the game started.
  async function load() {
    if (!store) return;
    try {
      const got = await store.book('stickers'), f = await store.book('firsts'), fr = await store.book('friends');
      book = createBook({ data, got: Array.isArray(got) ? got : [] });
      firsts = Array.isArray(f) ? f : [];
      friends = Array.isArray(fr) ? fr : [];
    } catch (e) { /* no store: the Scrapbook is empty this session and nothing breaks */ }
    mark();
  }
  const save = () => {
    if (!store) return;
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      store.putBook('stickers', [...book.earned]).catch(() => {});
      store.putBook('firsts', firsts).catch(() => {});
      store.putBook('friends', friends).catch(() => {});
    }, U.saveMs);
  };
  // The header's book glows when something new is inside, and never more than once a minute (14 §4.3).
  let glowAt = 0;
  function mark() {
    openB.classList.toggle('new', fresh > 0 && now() - glowAt > U.glowEveryMs);
    if (fresh > 0 && now() - glowAt > U.glowEveryMs) glowAt = now();
  }

  // Called once per step with the story records the Because system drained.
  function step(w, records) {
    if (!records || !records.length) return;
    const got = book.fromRecords(records);
    if (got.length) { fresh += got.length; save(); }
    for (const r of records) {
      if (!KIND_ORDER.includes(r.kind)) continue;
      const key = r.kind === 'reaction' ? 'reaction:' + rowIdOf(r) : r.kind;
      if (firsts.some((f) => f.key === key)) continue;
      firsts.push({ key, at: now(), day: Math.floor(w.time / w.daySec) + 1, pics: [r.causeA, r.causeB, r.result].filter((i) => i >= 0).map((i) => iconRef(w, i)), shot: shoot(r.place[0], r.place[1]) });
      if (firsts.length > U.firstsMax) firsts.shift();
      fresh++;
      save();
    }
    mark();
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

  // A picture of the moment, cut from the canvas the game just drew: a square around the place, at a size a
  // postcard can use. Returns a data URL, or null when the place was not on the screen.
  function shoot(wx, wy) {
    if (!cv || !cam) return null;
    const [cx, cy] = cam.toCanvas(wx, wy), q = cam.pixel();
    const px = Math.round(cx / q), py = Math.round(cy / q), half = Math.round(U.shot / 2);
    if (px < half || py < half || px > cv.width - half || py > cv.height - half) return null;
    try {
      const out = document.createElement('canvas');
      out.width = U.shot; out.height = U.shot;
      const g = out.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.drawImage(cv, px - half, py - half, U.shot, U.shot, 0, 0, U.shot, U.shot);
      return out.toDataURL('image/png');
    } catch (e) { return null; }
  }
  const iconRef = (w, i) => { const ic = w.C.icons[i]; return ic ? { spr: ic.spr, over: ic.over || null } : null; };
  const rowIdOf = (r) => (r.row >= 0 && data.reactions.rows[r.row] ? data.reactions.rows[r.row].id : '');

  // ---------- the screen ----------
  function open() {
    fresh = 0;
    openB.classList.remove('new');
    el.hidden = false;
    draw();
  }
  const close = () => { el.hidden = true; el.textContent = ''; };
  function draw() {
    const w = getSim() && getSim().w;
    el.textContent = '';
    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    for (const [id, label] of [['firsts', str('book.firsts')], ['stickers', str('book.stickers')], ['friends', str('book.friends')]]) {
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
    body.className = 'body';
    if (page === 'firsts') drawFirsts(body);
    else if (page === 'stickers') drawStickers(body, w);
    else drawFriends(body);
    el.appendChild(body);
  }
  function drawFirsts(body) {
    if (!firsts.length) { body.appendChild(empty(str('book.nothingYet'))); return; }
    for (const f of [...firsts].reverse()) {
      const card = document.createElement('div');
      card.className = 'card';
      if (f.shot) { const im = new Image(); im.src = f.shot; im.alt = ''; im.className = 'shot'; card.appendChild(im); }
      const row = document.createElement('div');
      row.className = 'pics';
      (f.pics || []).forEach((p, i) => {
        if (!p) return;
        if (i) { const s = document.createElement('span'); s.textContent = i === (f.pics.length - 1) ? '→' : '+'; row.appendChild(s); }
        const im = new Image();
        im.src = url(p.spr, p.over || undefined);
        im.alt = '';
        row.appendChild(im);
      });
      card.appendChild(row);
      const share = document.createElement('button');
      share.textContent = str('book.share');
      share.onclick = () => postcard(f);
      card.appendChild(share);
      body.appendChild(card);
    }
  }
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

  // A postcard: the picture with its Because pictures under it, handed to the player as a file (14 §4.3).
  function postcard(f) {
    const out = document.createElement('canvas');
    out.width = U.card; out.height = U.card + U.cardStrip;
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
        im.onload = im.onerror = () => { g.drawImage(im, at, U.card + 4, size, size); if (--left === 0) done(); };
        im.src = url(p.spr, p.over || undefined);
        x += size + gap;
      }
    };
    if (f.shot) {
      const im = new Image();
      im.onload = () => { g.drawImage(im, 0, 0, U.card, U.card); strip(); };
      im.onerror = () => strip();
      im.src = f.shot;
    } else strip();
  }

  openB.onclick = () => (el.hidden ? open() : close());
  load();
  return { step, command, tick, open, close, get fresh() { return fresh; }, get book() { return book; }, get firsts() { return firsts; }, get friends() { return friends; } };
}
function entOf(w, h) { for (let k = 0; k < w.count; k++) if (w.slotH[w.order[k]] === h) return w.order[k]; return -1; }
