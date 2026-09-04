/**
 * Every sound in Keepsies is made from the physics. Nothing is a recording
 * (DESIGN 19, the studio signature carried over from Ripcord).
 *
 * An impact is a filtered noise burst plus a modal resonance bank for the
 * material: glass rings high and short with a little inharmonicity, clay is
 * damped and low, steel rings longest, stone sits between. Pitch scales
 * INVERSELY with diameter, so a Peewee chirps and an oversize arena marble
 * knocks. Amplitude and brightness come from the impact energy, and a tiny per
 * hit seeded detune keeps it from machine repeating.
 *
 * One AudioContext, created on the first gesture and never before, because a
 * context made without one starts suspended and every later sound is silent.
 * Silent and harmless when the API is missing.
 */

let ctx = null;
let master = null;
let limiter = null;
let enabled = true;
let tuning = null;
let voices = 0;

/** Give the module its numbers. Call once at boot. */
export function configure(t) { tuning = t; }

/** Turn the whole graph on or off from settings. */
export function setEnabled(on) {
  enabled = !!on;
  if (master) master.gain.value = enabled ? 1 : 0;
}

/** True once there is a running context. */
export function isRunning() { return !!ctx && ctx.state === 'running'; }

/**
 * Build the context. MUST be called from inside a real user gesture.
 * Returns false when the platform has no WebAudio, which is not an error.
 */
export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
  const AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return false;
  try { ctx = new AC(); } catch (e) { return false; }
  limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -8;
  limiter.knee.value = 2;
  limiter.ratio.value = 14;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.14;
  master = ctx.createGain();
  master.gain.value = enabled ? 1 : 0;
  master.connect(limiter);
  limiter.connect(ctx.destination);
  if (ctx.state === 'suspended') ctx.resume();
  return true;
}

/* A short burst of white noise, reused by every voice. */
let noiseBuf = null;
function noise() {
  if (!noiseBuf) {
    const n = Math.floor(ctx.sampleRate * 0.25);
    noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let s = 987654321;
    for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = (s / 0x3fffffff) - 1; }
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  return src;
}

/**
 * One impact.
 * @param {{material:string, diameterMm:number, relSpeed:number, seed?:number, surface?:string|null}} hit
 */
export function impact(hit) {
  if (!ctx || !enabled || !tuning) return;
  const a = tuning.audio;
  const bank = a.modes[hit.material] || a.modes.glass;
  const speed = hit.relSpeed;
  if (speed < 0.12) return;                      // below this a real marble makes no sound
  if (voices > 24) return;                       // the tick that eats the world, bounded

  const energy = Math.min(1, speed / 4.0);
  const t0 = ctx.currentTime;
  const pitch = a.referenceDiameterMm / Math.max(4, hit.diameterMm);
  const seed = hit.seed == null ? 0.5 : hit.seed;
  const detune = 1 + (seed - 0.5) * (a.detuneCents / 1200) * 2;

  const bus = ctx.createGain();
  bus.gain.value = a.impactGain * (0.25 + 0.75 * energy) * (hit.surface ? 0.55 : 1);
  bus.connect(master);
  voices++;
  const done = () => { voices = Math.max(0, voices - 1); try { bus.disconnect(); } catch (e) { } };

  // the strike itself: noise through a bandpass that opens with energy
  const nz = noise();
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = (700 + 5200 * energy) * pitch;
  bp.Q.value = 1.1;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.9, t0);
  ng.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.012 + bank.decay * 0.08);
  nz.connect(bp); bp.connect(ng); ng.connect(bus);
  nz.start(t0); nz.stop(t0 + 0.25);

  // the body: a few high Q modes, slightly inharmonic so it is a marble and not a bell
  const span = bank.hiHz - bank.loHz;
  for (let i = 0; i < bank.count; i++) {
    const ratio = i / Math.max(1, bank.count - 1);
    const f = (bank.loHz + span * ratio * ratio) * pitch * detune * (1 + i * 0.013);
    if (f > ctx.sampleRate * 0.45) continue;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const g = ctx.createGain();
    const amp = (0.42 / bank.count) * (1 - ratio * 0.55) * (0.3 + 0.7 * energy);
    g.gain.setValueAtTime(amp, t0);
    g.gain.exponentialRampToValueAtTime(0.0004, t0 + bank.decay * (1 - ratio * 0.5));
    osc.connect(g); g.connect(bus);
    osc.start(t0); osc.stop(t0 + bank.decay + 0.05);
    if (i === 0) osc.onended = done;
  }
  if (bank.count === 0) done();
}

/**
 * Feed a step's contact events straight in. The renderer and the referee both
 * read the same events; nothing downstream ever reads the world.
 */
export function playContacts(events, lookup) {
  if (!ctx || !enabled) return;
  for (const e of events) {
    const m = lookup(e.a);
    if (!m) continue;
    impact({
      material: m.materialClass,
      diameterMm: m.diameterMm,
      relSpeed: e.relSpeed,
      surface: e.surface,
      seed: ((e.a * 2654435761 + (e.b || 0) * 40503 + Math.round(e.t * 1000)) >>> 8 & 1023) / 1023
    });
  }
}

/** How many voices are alive. The `audio_budget` gate reads this. */
export function voiceCount() { return voices; }
