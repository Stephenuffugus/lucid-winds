// Sound (design 05 §7, 14 §7 T6), Web Audio only: no files are needed, every sound is a recipe from audio.json played on
// oscillators and a noise buffer. Silent until the first touch (browsers allow sound only after one; 14 §7: muted until
// first touch). What plays: the sim's events (src/sim/events.js), drained after every step; the player's own commands
// (placing chirps by species or clicks by material, erasing, giving, lifting, Undo); pokes; loops while their cause is in
// view (fire, tornado, rain, a UFO beaming); music (four synth loops, or Stephen's files when audio.json names them).
// Mixing rules: ./mixer.js. Settings (sound, music, quiet surprises, haptics) are per device, in localStorage tw_sound.
import { createMixer, recipeMs, chirpOf } from './mixer.js';
import { EV } from '../sim/events.js';

const SETTINGS = 'tw_sound';
// opts.ctx: an AudioContext to use instead of making one (dev/audio-render.mjs renders every recipe offline with it).
export function createAudio(data, opts = {}) {
  const A = data.audio, mixer = createMixer(A.mix);
  const settings = { sfx: true, music: true, quiet: false, haptics: true };
  try { Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS) || '{}')); } catch (e) { /* private mode: defaults */ }
  let ctx = null, sfxBus = null, musicBus = null, noise = null, loops = null, music = null;
  let cam = null, view = null, crowd = 0;

  function unlock() {
    if (ctx) { if (ctx.state === 'suspended' && !document.hidden) ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC && !opts.ctx) return;
    try {
      ctx = opts.ctx || new AC();
      sfxBus = ctx.createGain(); musicBus = ctx.createGain();
      sfxBus.connect(ctx.destination); musicBus.connect(ctx.destination);
      const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noise = b;
      volumes();
      loops = makeLoops();
      music = makeMusic();
    } catch (e) { ctx = null; }
  }
  function volumes() {
    if (!ctx) return;
    sfxBus.gain.value = settings.sfx ? A.volume.sfx : 0;
    musicBus.gain.value = settings.music ? A.volume.music : 0;
  }
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend().catch(() => {}); else ctx.resume().catch(() => {}); });

  // ---------- one recipe ----------
  function envelope(p, env, s, dur, g) {
    const peak = Math.max(0.0002, g);
    p.setValueAtTime(0.0001, s);
    if (env === 'flat') { p.linearRampToValueAtTime(peak, s + 0.005); p.setValueAtTime(peak, s + Math.max(0.006, dur - 0.02)); p.linearRampToValueAtTime(0.0001, s + dur); return dur; }
    if (env === 'tail') { p.linearRampToValueAtTime(peak, s + 0.005); p.setValueAtTime(peak, s + dur * 0.3); p.exponentialRampToValueAtTime(0.0001, s + dur * 1.5); return dur * 1.5; }
    p.linearRampToValueAtTime(peak, s + (env === 'fast' ? 0.002 : 0.005));
    p.exponentialRampToValueAtTime(0.0001, s + dur);
    return dur;
  }
  function layer(L, t0, g, pan, out) {
    const reps = L.rep || 1, dur = L.ms / 1000;
    for (let r = 0; r < reps; r++) {
      const s = t0 + ((L.delay || 0) + r * (L.ms + (L.gap || 0))) / 1000;
      let src, head;
      if (L.w === 'noise') {
        src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
        src.playbackRate.value = 0.5 + Math.random(); // not the same grain twice
        const f = ctx.createBiquadFilter();
        if (L.band === 'low') { f.type = 'lowpass'; f.frequency.value = 300; }
        else if (L.band === 'high') { f.type = 'highpass'; f.frequency.value = 4000; }
        else { f.type = 'bandpass'; f.Q.value = L.q || 1; if (Array.isArray(L.band)) { f.frequency.setValueAtTime(L.band[0], s); f.frequency.exponentialRampToValueAtTime(L.band[1], s + dur); } else f.frequency.value = L.band; }
        src.connect(f); head = f;
      } else {
        src = ctx.createOscillator(); src.type = L.w === 'saw' ? 'sawtooth' : L.w;
        if (L.notes) L.notes.forEach((hz, i) => src.frequency.setValueAtTime(hz, s + (i * dur) / L.notes.length));
        else { src.frequency.setValueAtTime(L.f[0], s); if (L.f[1] !== L.f[0]) src.frequency.exponentialRampToValueAtTime(L.f[1], s + dur); }
        if (L.vib) { const lfo = ctx.createOscillator(), depth = ctx.createGain(); lfo.frequency.value = L.vib; depth.gain.value = (L.f ? L.f[0] : L.notes[0]) * 0.03; lfo.connect(depth); depth.connect(src.frequency); lfo.start(s); lfo.stop(s + dur + 0.1); }
        head = src;
      }
      const env = ctx.createGain(), len = envelope(env.gain, L.env, s, dur, (L.gain || 1) * g);
      head.connect(env);
      let tail = env;
      if (L.trem) { const t = ctx.createGain(), lfo = ctx.createOscillator(), depth = ctx.createGain(); t.gain.value = 0.5; lfo.frequency.value = L.trem; depth.gain.value = 0.5; lfo.connect(depth); depth.connect(t.gain); lfo.start(s); lfo.stop(s + len + 0.1); env.connect(t); tail = t; }
      if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; tail.connect(p); p.connect(out); } else tail.connect(out);
      src.start(s); src.stop(s + len + 0.05);
    }
  }
  function play(r, g, pan) { for (const L of r.layers) layer(L, ctx.currentTime + 0.005, g, pan, sfxBus); }

  // Where a world point is heard: its pan across the screen, how near the camera is, and whether it is in view at all.
  function place(x, y) {
    if (!cam || !view || x < 0) return { pan: 0, near: 1, seen: true };
    const [cx, cy] = cam.toCanvas(x, y), css = [cx / cam.dpr, cy / cam.dpr], m = A.mix.margin;
    const seen = css[0] > -m && css[0] < view[0] + m && css[1] > -m && css[1] < view[1] + m;
    return { pan: (css[0] / Math.max(1, view[0])) * 2 - 1, near: Math.min(1, cam.zoom / cam.dpr / 2), seen };
  }
  function sfx(id, x = -1, y = -1, recipe = null) {
    if (!ctx || !settings.sfx) return;
    const r = recipe || A.recipes[id];
    if (!r) return;
    const p = place(x, y);
    if (!p.seen) return; // scale-aware: what is out of view is not heard
    const got = mixer.take(id, performance.now(), { dur: recipeMs(r), pan: p.pan, crowd, near: p.near, loud: !!r.loud, quiet: settings.quiet });
    if (got) try { play(r, got.gain, got.pan); } catch (e) { /* a node the browser refused: skip this sound */ }
  }
  function haptic(k) {
    if (!settings.haptics || !navigator.vibrate) return;
    try { navigator.vibrate(A.haptics[k]); } catch (e) { /* not allowed */ }
  }

  // ---------- loops: fire, tornado, rain, a UFO beaming ----------
  function makeLoops() {
    const L = A.loops, out = {};
    const noiseLoop = (band, q) => {
      const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
      const f = ctx.createBiquadFilter();
      if (band === 'high') { f.type = 'highpass'; f.frequency.value = 4000; } else { f.type = 'bandpass'; f.frequency.value = band; f.Q.value = q || 1; }
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(sfxBus); src.start();
      return { g, f };
    };
    out.fire = noiseLoop(L.fire.band, L.fire.q);
    out.tornado = noiseLoop(L.tornado.band, L.tornado.q);
    { const lfo = ctx.createOscillator(), depth = ctx.createGain(); lfo.frequency.value = L.tornado.sweep; depth.gain.value = L.tornado.band * 0.6; lfo.connect(depth); depth.connect(out.tornado.f.frequency); lfo.start(); }
    out.rain = noiseLoop('high');
    { const o = ctx.createOscillator(), lfo = ctx.createOscillator(), depth = ctx.createGain(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = (L.ufo.f[0] + L.ufo.f[1]) / 2; lfo.frequency.value = L.ufo.rate; depth.gain.value = (L.ufo.f[1] - L.ufo.f[0]) / 2; lfo.connect(depth); depth.connect(o.frequency); g.gain.value = 0; o.connect(g); g.connect(sfxBus); o.start(); lfo.start(); out.ufo = { g }; }
    return out;
  }
  function loopTo(l, v) { l.g.gain.setTargetAtTime(v, ctx.currentTime, 0.15); }

  // ---------- music: four synth loops (05 §7), or a file for a track ----------
  function makeMusic() {
    const M = A.music;
    let name = null, pat = null, T = null, step = 0, next = 0, el = null, elSrc = null, fading = 0;
    const out = ctx.createGain(); out.gain.value = 1; out.connect(musicBus);
    function rng(seed) { let s = seed | 0; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    function pattern(t) {
      const R = rng(t.seed * 7919), n = M.bars * M.steps, lead = new Int8Array(n);
      for (let i = 0; i < n; i++) lead[i] = R() < t.density ? Math.floor(R() * t.scale.length * 2) : -1;
      return lead;
    }
    const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
    function note(type, f, s, dur, g) {
      const o = ctx.createOscillator(), e = ctx.createGain();
      o.type = type; o.frequency.value = f;
      e.gain.setValueAtTime(0.0001, s); e.gain.linearRampToValueAtTime(g, s + 0.01); e.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      o.connect(e); e.connect(out); o.start(s); o.stop(s + dur + 0.05);
    }
    function hat(s) { const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), e = ctx.createGain(); src.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000; e.gain.setValueAtTime(M.hatGain, s); e.gain.exponentialRampToValueAtTime(0.0001, s + 0.05); src.connect(f); f.connect(e); e.connect(out); src.start(s); src.stop(s + 0.06); }
    function set(want) {
      if (want === name) return;
      name = want; T = M.tracks[want]; pat = pattern(T); step = 0; next = ctx.currentTime + 0.1;
      out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setValueAtTime(0.0001, ctx.currentTime); out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + M.fadeSec);
      if (el) { el.pause(); el = null; if (elSrc) { elSrc.disconnect(); elSrc = null; } }
      const file = M.files[want];
      if (file) { // Stephen's track for this place, looping; the synth stays quiet
        try { el = new Audio(new URL(file, document.baseURI).href); el.loop = true; el.crossOrigin = 'anonymous'; elSrc = ctx.createMediaElementSource(el); elSrc.connect(out); el.play().catch(() => { el = null; }); } catch (e) { el = null; }
      }
    }
    function tick(night) {
      if (!T || el) return;
      const dt = 60 / T.bpm / 2, n = pat.length, sc = T.scale;
      while (next < ctx.currentTime + 0.25) {
        const i = step % n, deg = pat[i], lift = night ? -12 : 0;
        if (deg >= 0) note(T.lead || M.lead, hz(T.root + lift + 12 * Math.floor(deg / sc.length) + sc[deg % sc.length]), next, dt * 0.9, M.leadGain);
        if (i % 4 === 0) note('triangle', hz(T.root - 24 + (i % 16 === 8 ? 7 : 0)), next, dt * 3.5, M.bassGain);
        if (!night && i % 2 === 1) hat(next);
        step++; next += dt;
      }
    }
    return { set, tick, get name() { return name; } };
  }

  // ---------- what the world asks for, every frame ----------
  let lastLook = 0, danger = 0, calm = 0;
  function frame(w, c, size, paused, night) {
    cam = c; view = size;
    if (!ctx) return;
    const now = performance.now();
    if (now - lastLook > 250) { // what is on screen: creatures, fires, tornadoes, UFOs beaming, foes, the land
      lastLook = now;
      const [x0, y0, x1, y1] = cam.view(), E = w.E, S = w.C.S;
      let n = 0, foes = 0, ufo = 0;
      for (let k = 0; k < w.count; k++) { const e = w.order[k], x = E.x[e], y = E.y[e]; if (x < x0 || x > x1 || y < y0 || y > y1) continue; n++; const sp = S[E.kind[e]]; if (sp.enemy || sp.hunts === 'all') foes++; if (E.cargo[e]) ufo++; }
      crowd = n;
      let fires = 0;
      for (const s of w.fires) { const x = s.tx * w.T, y = s.ty * w.T; if (x >= x0 && x <= x1 && y >= y0 && y <= y1) fires++; }
      let tw = 0;
      for (const t of w.twisters) if (t.x >= x0 && t.x <= x1 && t.y >= y0 && t.y <= y1) tw++;
      const on = !paused;
      loopTo(loops.fire, on && fires ? A.loops.fire.gain * Math.min(1, 0.5 + fires / 6) : 0);
      loopTo(loops.tornado, on && tw ? A.loops.tornado.gain * Math.min(1.5, tw) : 0);
      loopTo(loops.rain, on && w.rainT > 0 ? A.loops.rain.gain : 0);
      loopTo(loops.ufo, on && ufo ? A.loops.ufo.gain : 0);
      // Music: danger while dangerFoes hostiles are on screen (and dangerCalmSec after), else the land in view.
      if (foes >= A.music.dangerFoes) { danger = 1; calm = now; } else if (danger && now - calm > A.music.dangerCalmSec * 1000) danger = 0;
      let track = 'meadow';
      if (danger) track = 'danger';
      else {
        const tid = w.C.tid, cols = w.cols, T = w.T;
        let water = 0, cold = 0, all = 0;
        for (let y = Math.max(0, Math.floor(y0 / T)); y <= Math.min(w.rows - 1, Math.floor(y1 / T)); y += 2) for (let x = Math.max(0, Math.floor(x0 / T)); x <= Math.min(cols - 1, Math.floor(x1 / T)); x += 2) {
          const t = w.terr[y * cols + x]; all++; if (t === tid.water) water++; else if (t === tid.snow || t === tid.ice) cold++;
        }
        if (all && water / all >= A.music.biomeFrac) track = 'sea'; else if (all && cold / all >= A.music.biomeFrac) track = 'cold';
      }
      music.set(track);
    }
    music.tick(night);
  }

  // ---------- the world's events, and the player's own actions ----------
  function drain(w) {
    const v = w.ev;
    for (let i = 0; i < v.n; i++) {
      const k = EV[v.kind[i]];
      let id = A.events[k];
      if (k === 'boom' && v.a[i] >= A.bigBoom) id = 'meteor';
      sfx(id, v.x[i], v.y[i]);
      if (id === 'meteor') haptic('meteor');
      if (k === 'quake') haptic('quake');
    }
    v.n = 0;
  }
  function chirp(sp, x, y) { sfx('chirp:' + (sp.hp || 1) + ':' + (sp.humanoid ? 1 : 0), x, y, chirpOf(A, sp)); }
  function command(c, w) {
    const T = w.T;
    if (c.t === 'place') { chirp(w.C.S[c.kind], c.x, c.y); haptic('place'); }
    else if (c.t === 'build') { const m = A.thingMaterial[c.thing]; sfx('mat:' + m, c.tiles[0] * T + 4, c.tiles[1] * T + 4, A.materials[m]); haptic('place'); }
    else if (c.t === 'paint') { const m = A.terrainMaterial[c.terrain]; sfx('mat:' + m, c.tiles[0] * T + 4, c.tiles[1] * T + 4, A.materials[m]); }
    else if (c.t === 'give') sfx('give', c.x, c.y);
    else if (c.t === 'erase') sfx('erase', c.x, c.y);
    else if (c.t === 'lift' || c.t === 'liftItem') sfx('lift');
    else if (c.t === 'dropItem') sfx('give', c.x, c.y);
    else if (c.t === 'drop') sfx('drop', c.x, c.y);
    else if (c.t === 'undo') sfx('undo');
  }
  function set(k, v) {
    settings[k] = v;
    try { localStorage.setItem(SETTINGS, JSON.stringify(settings)); } catch (e) { /* private mode: this session only */ }
    volumes();
  }
  return { unlock, sfx, chirp, command, drain, frame, set, get settings() { return { ...settings }; }, get on() { return !!ctx; }, get music() { return music ? music.name : null; }, get mixer() { return mixer; } };
}
