// Light notes in the key of the current track (section 8). Pure: no Web Audio here, so it is tested in Node.
// Strike notes are scale degrees 1, 3 and 5 of the track's key: red = 1, green = 3, blue = 5; mixed colours
// play every degree they contain; white plays the triad. The octave rises with Intensity. A track with
// key null (frequent key changes) falls back to a neutral open fifth (1 and 5, no third).
const NAMES = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

export function keyRoot(key) {
  if (!(key in NAMES)) throw new Error(`unknown key ${key}`);
  return NAMES[key];
}

// Semitone offsets for degrees 1, 3, 5 in a mode; key null -> open fifth.
export function degreeOffsets(track, neutralKey = 'C') {
  if (!track || track.key === null || track.key === undefined) return { root: keyRoot(neutralKey), d1: 0, d3: null, d5: 7 };
  return { root: keyRoot(track.key), d1: 0, d3: track.mode === 'minor' ? 3 : 4, d5: 7 };
}

// MIDI notes for a beam colour at an intensity. Base octave: the root in octave 4 (MIDI 60 + root), up one
// octave per decade of Intensity above 10 (capped at +3 octaves).
export function notesFor(colorMask, intensity, track, neutralKey = 'C') {
  const o = degreeOffsets(track, neutralKey);
  const octave = Math.max(0, Math.min(3, Math.floor(Math.log10(Math.max(1, intensity)) - 1)));
  const base = 60 + o.root + 12 * octave;
  const out = [];
  if (colorMask & 1) out.push(base + o.d1);
  if (colorMask & 2) out.push(o.d3 === null ? base + o.d5 : base + o.d3); // no third in an open fifth
  if (colorMask & 4) out.push(base + o.d5);
  return [...new Set(out)];
}

// The chord a Lens discharge plays: the triad (or open fifth), voiced across two octaves.
export function chordFor(track, neutralKey = 'C') {
  const o = degreeOffsets(track, neutralKey);
  const base = 48 + o.root;
  const c = [base, base + 12 + o.d5, base + 12];
  if (o.d3 !== null) c.push(base + 12 + o.d3, base + 24 + o.d3);
  else c.push(base + 24 + o.d5);
  return c;
}

export function pitchClassesOf(track, neutralKey = 'C') {
  const o = degreeOffsets(track, neutralKey);
  return [o.d1, o.d3, o.d5].filter((x) => x !== null).map((x) => (o.root + x) % 12);
}

// Quantise a time (seconds since the cast began) up to the next sixteenth note of the track's bpm.
export function quantize16(t, bpm) {
  const step = 60 / bpm / 4;
  return Math.ceil(t / step - 1e-9) * step;
}

export const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
