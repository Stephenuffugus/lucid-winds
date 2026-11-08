// THE MUSIC PLAYER'S RULES (Stephen, 23 Sep 2026): "It should play every song ... we should have a music player in
// there that's very simple to open and pick which songs we listen to. Just like Jimothy. I think a few songs should be
// unlocked through actual play ... you should start with like three good songs that cycle. And if you don't like one,
// you can open the music menu very easily and press a button next to the song ... where you turn on and off the songs
// you want in your loop." Pure, so tools/audio-check.mjs can hold every rule.
//
//   songs      audio.json music.songs, in order: { id, title, url, start } or { ..., unlock: { minutes } }
//   progress   per device (localStorage tw_music): { secs, unlocked: [ids], off: [ids] }. `secs` is play time with
//              the game unpaused; a song unlocks when secs reaches its minutes, and stays unlocked in the list even
//              if the minutes are moved later. `off` is the songs she has switched out of the loop.
//   the loop   every unlocked song not switched off, in list order; played whole, one after another, wrapping.

export function unlockedIds(songs, progress) {
  const secs = Math.max(0, Number(progress.secs) || 0);
  const kept = new Set(progress.unlocked || []);
  return songs.filter((s) => s.start || kept.has(s.id) || (s.unlock && secs >= (s.unlock.minutes || 0) * 60)).map((s) => s.id);
}

// songs that have just crossed their minutes and are not yet on the kept list
export function newlyUnlocked(songs, progress) {
  const kept = new Set(progress.unlocked || []);
  return unlockedIds(songs, progress).filter((id) => { const s = songs.find((x) => x.id === id); return s && !s.start && !kept.has(id); });
}

export function loopIds(songs, progress) {
  const off = new Set(progress.off || []);
  return unlockedIds(songs, progress).filter((id) => !off.has(id));
}

// the song after `currentId` in the loop (wrapping); the first when the current one is not in it; null when empty
export function nextId(songs, progress, currentId) {
  const loop = loopIds(songs, progress);
  if (!loop.length) return null;
  const i = loop.indexOf(currentId);
  return loop[(i + 1) % loop.length];
}

// switch a song in or out of the loop; returns the id that should play now (or null)
export function toggle(songs, progress, id, on, currentId) {
  const off = new Set(progress.off || []);
  if (on) off.delete(id); else off.add(id);
  progress.off = songs.filter((s) => off.has(s.id)).map((s) => s.id);
  const loop = loopIds(songs, progress);
  if (!loop.length) return null;
  if (on) return loop.includes(currentId) ? currentId : id;
  if (currentId === id) return nextId(songs, progress, id);
  return loop.includes(currentId) ? currentId : loop[0];
}

// the minutes a locked song still needs
export function minutesLeft(song, progress) {
  if (!song.unlock) return 0;
  return Math.max(0, Math.ceil((song.unlock.minutes || 0) - (Math.max(0, Number(progress.secs) || 0)) / 60));
}
