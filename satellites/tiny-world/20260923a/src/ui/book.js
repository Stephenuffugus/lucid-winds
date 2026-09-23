// The Scrapbook's book-keeping (design 14 §4.3, §7 T12), kept apart from the screen so it can be checked without
// a page. It watches what the game already produces — the story records the Because system drains, the events
// ring, the commands the child gives and the world itself — and says which stickers were earned just now.
// Silent by design: no toast, no outline, no count. A sticker gives nothing; it is a picture of something that
// happened to this child's world, shown only once it is earned.
import { EVI } from '../sim/events.js';

// A sticker's picture, as { spr, over }: the same five forms a reaction row uses.
export function picOf(w, data, ref) {
  const C = w.C, [kind, id] = String(ref).split(':');
  if (kind === 'creature') { const i = C.kid[id]; return i === undefined ? null : C.icons[i]; }
  if (kind === 'thing') { const i = C.iconOf['thing:' + id]; return i === undefined ? null : C.icons[i]; }
  if (kind === 'gear') { const i = C.iconOf['thing:item:' + id]; return i === undefined ? null : C.icons[i]; }
  if (kind === 'icon') { const i = C.iconOf[id]; return i === undefined ? null : C.icons[i]; }
  if (kind === 'spr') return { spr: id };
  return null;
}

// What a sticker row may watch. Anything else in a row is a mistake validate-data catches.
export const WHEN_KEYS = ['story', 'reaction', 'cmd', 'power', 'day', 'count', 'things'];

export function createBook({ data, got = [] }) {
  const rows = data.stickers.rows;
  const earned = new Set(got);
  const byStory = new Map(), byReaction = new Map(), byCmd = new Map(), byPower = new Map(), watching = [];
  for (const r of rows) {
    const w = r.when;
    if (w.story) push(byStory, w.story, r);
    else if (w.reaction) push(byReaction, w.reaction, r);
    else if (w.cmd) push(byCmd, w.cmd, r);
    else if (w.power) push(byPower, w.power, r);
    else watching.push(r); // day, count, things: looked at now and then, not on an event
  }

  // Everything earned by this step's story records (and the reactions among them). Returns the new ids, in row order.
  function fromRecords(records) {
    const out = [];
    for (const r of records) {
      const rowsFor = r.kind === 'reaction' ? byReaction.get(rowId(data, r.row)) : byStory.get(r.kind);
      take(rowsFor, out);
    }
    return out;
  }
  // Earned by something the child did. `c` is the command as the sim received it.
  function fromCommand(c) {
    const out = [];
    take(byCmd.get(c.t), out);
    if (c.t === 'power') take(byPower.get(c.id), out);
    return out;
  }
  // Earned by how the world is now: days gone by, how many of a kind, how many things.
  function fromWorld(w) {
    const out = [];
    for (const r of watching) {
      const when = r.when;
      if (when.day !== undefined && Math.floor(w.time / w.daySec) + 1 < when.day) continue;
      if (when.things !== undefined && w.structs.length < when.things) continue;
      if (when.count) { const k = w.C.kid[when.count.kind]; if (k === undefined || w.kindCount[k] < when.count.n) continue; }
      take([r], out);
    }
    return out;
  }
  function take(list, out) {
    if (!list) return;
    for (const r of list) { if (earned.has(r.id)) continue; earned.add(r.id); out.push(r.id); }
  }
  return {
    fromRecords, fromCommand, fromWorld,
    get earned() { return earned; },
    has: (id) => earned.has(id),
    rows,
    // Every row, with whether it is earned: the page draws this, and shows only the earned ones (14 §4.3).
    page: () => rows.map((r) => ({ ...r, got: earned.has(r.id) })),
  };
}
function push(map, key, row) { const list = map.get(key); if (list) list.push(row); else map.set(key, [row]); }
const rowId = (data, i) => (i >= 0 && data.reactions.rows[i] ? data.reactions.rows[i].id : '');

// The events ring, for the stickers that watch a sound rather than a record. Read before the audio drains it.
export const heard = (w, name) => { const k = EVI[name]; for (let i = 0; i < w.ev.n; i++) if (w.ev.kind[i] === k) return true; return false; };
