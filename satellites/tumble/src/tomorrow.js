// TOMORROW (DESIGN-T2 phase 8): the room remembers her. Pure: tests/tomorrow.test.mjs.
//
// THE ODD BIN'S NOTE. When the next Laundry Day Load will bring a mate home, a note in the Bin says so. It must be
// TRUE: the next seed waits in the save (app.js `nextSeed`) and the reunion is the seed's own draw (loadgen), so the
// size or tier she picks at the door cannot change it. No line names a time: the next Load is whenever she plays it.
// (The lines are here and not in a JSON file: a JSON import needs a newer phone than the rest of the game does.)
import { sha256 } from '../engine/sha256.js';

const seedInt = (s) => parseInt(sha256(s).slice(0, 8), 16);

export const NOTE_LINES = [
  'Something in the next Load belongs in here.',
  'Keep a space. Someone is on the way.',
  'Nearly. The next Load, I think.',
  'One of these is about to be very happy.',
  'Save a corner. A match is coming.',
  'The next Load is bringing someone back.',
  'Do not give up on this one. Next Load.',
  'Someone in here has a feeling about the next Load.',
];

// the line a seed gets (the same seed, the same note, every time the room is opened)
export const noteLine = (seed) => (NOTE_LINES.length ? NOTE_LINES[seedInt(String(seed) + '|note') % NOTE_LINES.length] : null);

// does this Load bring someone in the Odd Bin home
export const mateIsNext = (load) => !!(load && load.odd && load.odd.some((o) => o.reunion));
