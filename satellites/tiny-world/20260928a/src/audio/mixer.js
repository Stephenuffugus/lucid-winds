// The mixing rules (design 05 §7, 14 §2 "scale-aware sound", 14 §7 T6), kept apart from Web Audio so they can be
// tested in Node (tools/audio-check.mjs). take() says whether a sound plays now, and at what gain and pan:
//   - the same sound again within mix.dedupeMs is dropped;
//   - at most mix.maxVoices sound at once (a voice is busy until its sound ends);
//   - more than mix.crowdFrom creatures on screen scale every sound down by crowdFrom / count;
//   - zoomed right out (near 0) a sound plays at mix.farGain, close in (near 1) at full;
//   - a loud sound (meteor, quake, roar) plays at mix.quietGain when Quiet surprises is on.
export function createMixer(M) {
  const ends = []; // when each busy voice ends (ms)
  const last = new Map(); // sound id -> when it last started
  return {
    // now: ms; o: { dur (ms), pan (-1..1), crowd (creatures on screen), near (0..1), loud, quiet }. null: not played.
    take(id, now, o) {
      const t = last.get(id);
      if (t !== undefined && now - t < M.dedupeMs) return null;
      for (let i = ends.length - 1; i >= 0; i--) if (ends[i] <= now) ends.splice(i, 1);
      if (ends.length >= M.maxVoices) return null;
      last.set(id, now);
      ends.push(now + (o.dur || 0));
      let gain = M.master;
      if (o.crowd > M.crowdFrom) gain *= M.crowdFrom / o.crowd;
      const near = o.near === undefined ? 1 : Math.max(0, Math.min(1, o.near));
      gain *= M.farGain + (1 - M.farGain) * near;
      if (o.loud && o.quiet) gain *= M.quietGain;
      return { gain, pan: Math.max(-1, Math.min(1, o.pan || 0)) };
    },
    get voices() { return ends.length; },
  };
}

// A recipe's length in ms: its longest layer, with delays and repeats.
export function recipeMs(r) {
  let end = 0;
  for (const L of r.layers) end = Math.max(end, (L.delay || 0) + L.ms * (L.rep || 1) + (L.gap || 0) * ((L.rep || 1) - 1) + (L.env === 'tail' ? L.ms * 0.5 : 0));
  return end;
}

// A species' voice (14 §7 T6): the pitch by body size, the wave by kind of body.
export function chirpOf(A, sp) {
  const C = A.chirp;
  let hz = C.sizes[C.sizes.length - 1][1];
  for (const [upTo, f] of C.sizes) if ((sp.hp || 1) <= upTo) { hz = f; break; }
  const kind = sp.humanoid ? 'humanoid' : sp.fly ? 'flier' : sp.enemy || sp.hunts === 'all' ? 'enemy' : sp.water ? 'sea' : 'animal';
  return { layers: [{ w: C.waves[kind], notes: [hz, hz * C.rise], ms: C.ms * 2 + C.gap, env: 'decay', gain: C.gain }] };
}
