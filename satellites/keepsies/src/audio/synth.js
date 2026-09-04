/**
 * Every sound in Keepsies is made from the physics. Nothing is a recording
 * (DESIGN 19, the studio signature carried over from Ripcord).
 *
 *   IMPACT   a filtered noise burst plus a modal resonance bank for the
 *            material. Glass rings high and short with a little inharmonicity,
 *            clay is damped and low, steel rings longest, stone sits between.
 *            Pitch scales INVERSELY with diameter, so a Peewee chirps and an
 *            oversize arena marble knocks. Amplitude and brightness come from
 *            the impact energy, and a per hit seeded detune keeps it from
 *            machine repeating.
 *   ROLLING  one looped filtered noise per moving marble, its cutoff and gain
 *            driven by contact speed through the surface's own curve. Dirt
 *            hisses, polish whirs, ice is nearly silent. This is most of what a
 *            marble game SOUNDS like and it is the first thing dropped when the
 *            budget is tight.
 *   WARMING  a soft band passed shimmer while the taw is being rubbed.
 *
 * One AudioContext, created on the first gesture and never before, because a
 * context made without one starts suspended and every later sound is silent.
 * Silent and harmless when the API is missing.
 *
 * The graph can also be rendered OFFLINE, which is how `audio_budget` measures
 * it: the same voice builders, an OfflineAudioContext, and real samples to
 * count rather than a promise that something was scheduled.
 */

let ctx = null;
let master = null;
let limiter = null;
let enabled = true;
let tuning = null;
let voices = 0;
const rolling = new Map();   // marble id -> {src, filt, gain}
let warm = null;

/** Give the module its numbers. Call once at boot. */
export function configure(t) { tuning = t; }

/** Turn the whole graph on or off from settings. */
export function setEnabled(on) {
  enabled = !!on;
  if (master) master.gain.value = enabled ? 1 : 0;
}

/** True once there is a running context. */
export function isRunning() { return !!ctx && ctx.state === 'running'; }

/** How many impact voices are alive. The budget gate reads this. */
export function voiceCount() { return voices; }
/** How many rolling loops are alive. */
export function loopCount() { return rolling.size; }

/**
 * Build the context. MUST be called from inside a real user gesture.
 * Returns false when the platform has no WebAudio, which is not an error.
 */
export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
  const AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return false;
  try { ctx = new AC(); } catch (e) { return false; }
  const built = buildBus(ctx);
  master = built.master; limiter = built.limiter;
  master.gain.value = enabled ? 1 : 0;
  if (ctx.state === 'suspended') ctx.resume();
  return true;
}

/** The master chain: a limiter, because a break is twenty impacts at once. */
function buildBus(c) {
  const lim = c.createDynamicsCompressor();
  lim.threshold.value = -8;
  lim.knee.value = 2;
  lim.ratio.value = 14;
  lim.attack.value = 0.002;
  lim.release.value = 0.14;
  const m = c.createGain();
  m.gain.value = 1;
  m.connect(lim);
  lim.connect(c.destination);
  return { master: m, limiter: lim };
}

/* A quarter second of white noise, made once per context and shared. */
const noiseBufs = new WeakMap();
function noiseBuffer(c) {
  let b = noiseBufs.get(c);
  if (b) return b;
  const n = Math.floor(c.sampleRate * 0.25);
  b = c.createBuffer(1, n, c.sampleRate);
  const d = b.getChannelData(0);
  let s = 987654321;
  for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = (s / 0x3fffffff) - 1; }
  noiseBufs.set(c, b);
  return b;
}

/* ------------------------------------------------------------------ impacts */

/**
 * Schedule one impact into any context, live or offline.
 * @returns {number} how many oscillator voices it created
 */
function impactInto(c, bus, hit, when) {
  const a = tuning.audio;
  const bank = a.modes[hit.material] || a.modes.glass;
  const speed = hit.relSpeed;
  if (speed < 0.12) return 0;                    // below this a real marble makes no sound

  const energy = Math.min(1, speed / 4.0);
  const t0 = when;
  const pitch = a.referenceDiameterMm / Math.max(4, hit.diameterMm);
  const seed = hit.seed == null ? 0.5 : hit.seed;
  const detune = 1 + (seed - 0.5) * (a.detuneCents / 1200) * 2;

  const g = c.createGain();
  g.gain.value = a.impactGain * (0.25 + 0.75 * energy) * (hit.surface ? 0.55 : 1);
  g.connect(bus);

  // the strike: noise through a bandpass that opens with energy
  const nz = c.createBufferSource();
  nz.buffer = noiseBuffer(c);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = (700 + 5200 * energy) * pitch;
  bp.Q.value = 1.1;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.9, t0);
  ng.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.012 + bank.decay * 0.08);
  nz.connect(bp); bp.connect(ng); ng.connect(g);
  nz.start(t0); nz.stop(t0 + 0.25);

  // the body: a few high Q modes, slightly inharmonic, so it is a marble not a bell
  let made = 0;
  const span = bank.hiHz - bank.loHz;
  for (let i = 0; i < bank.count; i++) {
    const ratio = i / Math.max(1, bank.count - 1);
    const f = (bank.loHz + span * ratio * ratio) * pitch * detune * (1 + i * 0.013);
    if (f > c.sampleRate * 0.45) continue;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const og = c.createGain();
    const amp = (0.42 / bank.count) * (1 - ratio * 0.55) * (0.3 + 0.7 * energy);
    og.gain.setValueAtTime(amp, t0);
    og.gain.exponentialRampToValueAtTime(0.0004, t0 + bank.decay * (1 - ratio * 0.5));
    osc.connect(og); og.connect(g);
    osc.start(t0); osc.stop(t0 + bank.decay + 0.05);
    made++;
    if (i === 0 && c.state !== undefined) {
      osc.onended = () => { voices = Math.max(0, voices - 1); try { g.disconnect(); } catch (e) { } };
    }
  }
  return made;
}

/**
 * One impact, live.
 * @param {{material:string, diameterMm:number, relSpeed:number, seed?:number, surface?:string|null}} hit
 */
export function impact(hit) {
  if (!ctx || !enabled || !tuning) return;
  // ⛔ bounded, always. A break is twenty impacts inside a tenth of a second and
  // an unbounded voice count is a tick that eats the world.
  if (voices > 24) return;
  const made = impactInto(ctx, master, hit, ctx.currentTime);
  if (made > 0) voices++;
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

/* ------------------------------------------------------------------ rolling */

/**
 * The sound of a marble travelling, which is most of what this game sounds like.
 *
 * @param {{id:number, speed:number, surface:string, diameterMm:number}[]} moving
 *   every marble in contact with the ground and actually going somewhere
 */
export function updateRolling(moving) {
  if (!ctx || !enabled || !tuning) { return; }
  const a = tuning.audio;
  const seen = new Set();
  // loudest first, so the cap drops the quietest rather than an arbitrary one
  const list = moving.slice().sort((x, y) => y.speed - x.speed).slice(0, a.maxRollingLoops);
  for (const m of list) {
    seen.add(m.id);
    let v = rolling.get(m.id);
    if (!v) {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx);
      src.loop = true;
      const filt = ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.Q.value = 0.7;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(filt); filt.connect(gain); gain.connect(master);
      try { src.start(); } catch (e) { }
      v = { src, filt, gain };
      rolling.set(m.id, v);
    }
    // the surface's own curve: dirt hisses, polish whirs, ice is nearly silent
    const surf = (tuning.surface[m.surface] || tuning.surface.dirt);
    const grit = Math.min(1, surf.rollingMu / 0.06);
    const pitch = a.referenceDiameterMm / Math.max(4, m.diameterMm);
    const s01 = Math.min(1, m.speed / 3.0);
    v.filt.frequency.value = (240 + 2600 * s01) * pitch;
    v.gain.gain.value = 0.06 * s01 * s01 * (0.25 + 0.75 * grit);
  }
  for (const [id, v] of rolling) {
    if (seen.has(id)) continue;
    try { v.src.stop(); } catch (e) { }
    try { v.gain.disconnect(); } catch (e) { }
    rolling.delete(id);
  }
}

/** Everything stops: a match ended, or the tab went away. */
export function stopAll() {
  for (const [, v] of rolling) { try { v.src.stop(); } catch (e) { } try { v.gain.disconnect(); } catch (e) { } }
  rolling.clear();
  stopWarming();
}

/* ------------------------------------------------------------------ warming */

/** The shimmer while the taw is being rubbed. Ritual, and audible. */
export function startWarming() {
  if (!ctx || !enabled || warm) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 3200;
  filt.Q.value = 9;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.25);
  src.connect(filt); filt.connect(gain); gain.connect(master);
  try { src.start(); } catch (e) { }
  warm = { src, filt, gain };
}

export function stopWarming() {
  if (!warm) return;
  const w = warm; warm = null;
  try {
    w.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    w.src.stop(ctx.currentTime + 0.25);
  } catch (e) { }
}

/* ------------------------------------------------------------------ offline */

/**
 * Render a scripted burst of contacts into an OfflineAudioContext and hand back
 * the samples. This is what `audio_budget` measures: real numbers off a real
 * render, not a count of things that were scheduled.
 *
 * @param {{t:number, material:string, diameterMm:number, relSpeed:number, seed?:number, surface?:string|null}[]} hits
 * @param {number} seconds
 * @returns {Promise<{peak:number, rms:number, clipped:number, voices:number, sampleRate:number}>}
 */
export async function measureOffline(hits, seconds) {
  const OAC = (typeof window !== 'undefined') && (window.OfflineAudioContext || window.webkitOfflineAudioContext);
  if (!OAC || !tuning) return null;
  const rate = 44100;
  const c = new OAC(1, Math.ceil(rate * seconds), rate);
  const bus = buildBus(c);
  let made = 0;
  for (const h of hits) made += impactInto(c, bus.master, h, h.t);
  const buf = await c.startRendering();
  const d = buf.getChannelData(0);
  let peak = 0, sum = 0, clipped = 0;
  for (let i = 0; i < d.length; i++) {
    const v = d[i] < 0 ? -d[i] : d[i];
    if (v > peak) peak = v;
    if (v >= 0.999) clipped++;
    sum += d[i] * d[i];
  }
  return { peak, rms: Math.sqrt(sum / d.length), clipped, voices: made, sampleRate: rate };
}
