// THE RADIO IS A MUSIC PLAYER (Stephen, 23 Sep 2026): "when you click on the radio it should pop up all the songs
// you've unlocked ... press a button next to the song just like on jimothy where you turn on and off the songs you want
// in your loop"; "the songs on the radio should be titled the titles I gave them and the audio you made should be
// removed". Pure: the rules of the loop, so Node can hold them. src/screens.js draws the sheet, src/audio.js plays.
//
//   the songs   the radio items that carry a file (`look.url`), in catalogue order: his eight
//   the loop    every song she owns, minus the ones she has switched off (`save.radioOff`), in that order
//   playing     `save.equipped.radio` is the song playing now (null: the radio is off); when it ends, the next in
//               the loop plays, whole, and the loop wraps. One song in the loop simply repeats.
//   retired     the generated stations: a save that owned one gets its Lint back the first time it loads.

export function songs(items) {
  return (items || []).filter((i) => i && i.cat === 'radio' && i.look && i.look.url);
}

export function owned(save, item) {
  return !!item && (item.start || (save.unlocks || []).includes(item.id));
}

// the ids in the loop, in catalogue order
export function loopOf(items, save) {
  const off = new Set(save.radioOff || []);
  return songs(items).filter((i) => owned(save, i) && !off.has(i.id)).map((i) => i.id);
}

// the song to play after `currentId` (wrapping); the first in the loop when the current one is not in it; null when
// the loop is empty
export function nextSong(items, save, currentId) {
  const loop = loopOf(items, save);
  if (!loop.length) return null;
  const i = loop.indexOf(currentId);
  return loop[(i + 1) % loop.length];
}

// the song that should be playing now: the equipped one if it is in the loop, else the first of the loop, else null
export function currentSong(items, save) {
  const loop = loopOf(items, save);
  if (!loop.length) return null;
  return loop.includes(save.equipped.radio) ? save.equipped.radio : loop[0];
}

// switch a song in or out of the loop. Returns what the radio should play now (an id or null).
export function toggle(items, save, id, on) {
  const off = new Set(save.radioOff || []);
  if (on) off.delete(id); else off.add(id);
  save.radioOff = songs(items).filter((i) => off.has(i.id)).map((i) => i.id);
  if (on) {
    // switching a song on when the radio was off starts it; when something plays already, it waits its turn
    if (!save.equipped.radio || !loopOf(items, save).includes(save.equipped.radio)) save.equipped.radio = id;
  } else if (save.equipped.radio === id) {
    // the one playing goes off: the next in the loop plays, or the radio falls silent
    const loop = loopOf(items, save);
    save.equipped.radio = loop.length ? nextSong(items, { ...save, radioOff: save.radioOff }, id) : null;
  }
  return save.equipped.radio;
}

// the generated stations are gone: give a save that owned any of them its Lint back, once, and never let the
// radio point at one. Returns { refunded: [ids], lint }.
export function retireStations(save, unlocks) {
  const retired = (unlocks && unlocks.retired) || [];
  const out = { refunded: [], lint: 0 };
  if (!retired.length || !save) return out;
  const byId = new Map(retired.map((r) => [r.id, r]));
  const had = (save.unlocks || []).filter((id) => byId.has(id));
  for (const id of had) {
    const r = byId.get(id);
    const lint = (r.refund && r.refund.lint) || 0;
    save.economy.lint += lint;
    out.lint += lint;
    out.refunded.push(id);
  }
  if (had.length) save.unlocks = save.unlocks.filter((id) => !byId.has(id));
  if (save.equipped && byId.has(save.equipped.radio)) save.equipped.radio = null;
  return out;
}
