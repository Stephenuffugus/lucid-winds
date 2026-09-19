// Event-driven sound (section 8). Music comes from the track manifest (data/tracks.json); the game only adds
// light notes on top, in the current track's key: strikes play scale degrees 1/3/5 by colour, a Lens charge
// is a rising filtered pad, its discharge the chord, loops become arpeggios quantised to sixteenth notes of
// the track's bpm, the music ducks 4 dB during a cast and swells on Dawn. Nothing is created before the
// first user gesture; mute persists. Plays back sim events only, like the renderer.
import TRACKS from '../data/tracks.json' with { type: 'json' };
import { notesFor, chordFor, quantize16, midiToHz } from './notes.js';

const store = {
  get(k) { try { return localStorage.getItem(`lumen.${k}`); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(`lumen.${k}`, v); } catch { /* private mode */ } },
};
const dbToGain = (db) => Math.pow(10, db / 20);

export function createAudio() {
  let ctx = null;
  let master, musicBus, sfxBus, verbSend, compressor;
  let music = null; // { el, src, gain, track }
  let track = TRACKS.tracks.find((t) => t.mood === 'title') || TRACKS.tracks[0];
  let mood = 'title';
  let muted = store.get('muted') === '1';
  let castT0 = 0;
  let voices = 0;
  let pad = null;
  let luxRun = 0, luxTarget = 1, crossed = false;
  const MAX_VOICES = 18;
  const played = []; // recent light notes (MIDI) for the in-key check
  const note = (m) => { played.push(m); if (played.length > 400) played.shift(); return midiToHz(m); };

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14; compressor.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(compressor).connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.8; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
    // a small generated room for the glass (no impulse file to download)
    const conv = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 1.6);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    conv.buffer = ir;
    verbSend = ctx.createGain(); verbSend.gain.value = 0.28;
    verbSend.connect(conv).connect(master);
    // ambient layer: very low room tone
    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const room = ctx.createBufferSource(); room.buffer = noise; room.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
    const rg = ctx.createGain(); rg.gain.value = dbToGain(-44);
    room.connect(lp).connect(rg).connect(master);
    room.start();
    startTrack(track);
  }

  // Created on the first gesture only (browsers forbid audio before one; the design asks for it too).
  function unlock() {
    if (!ctx) build();
    if (ctx.state === 'suspended') ctx.resume();
  }
  const gestureEvents = ['pointerdown', 'keydown', 'touchstart'];
  const onGesture = () => { unlock(); for (const ev of gestureEvents) window.removeEventListener(ev, onGesture, true); };
  for (const ev of gestureEvents) window.addEventListener(ev, onGesture, true);

  function startTrack(t) {
    if (music) {
      const old = music;
      old.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      setTimeout(() => { try { old.el.pause(); old.src.disconnect(); } catch { /* gone */ } }, 1600);
      music = null;
    }
    track = t;
    if (!ctx || !t || t.placeholder) return; // placeholders are silence; the key and bpm still drive the notes
    const el = new Audio(t.file);
    el.loop = true; el.crossOrigin = 'anonymous'; el.preload = 'auto';
    const src = ctx.createMediaElementSource(el);
    const gain = ctx.createGain(); gain.gain.value = 0;
    src.connect(gain).connect(musicBus);
    el.play().catch(() => { /* not yet allowed */ });
    gain.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
    music = { el, src, gain, track: t };
  }

  function setMood(m, index = 0) {
    if (m === mood && track) return;
    mood = m;
    const list = TRACKS.tracks.filter((t) => t.mood === m);
    if (!list.length) return;
    startTrack(list[index % list.length]);
  }

  function voice(freq, { type = 'sine', dur = 0.9, gain = 0.16, when = 0, attack = 0.004, cutoff = 6000, verb = true } = {}) {
    if (!ctx || voices >= MAX_VOICES) return;
    voices++;
    const t = Math.max(ctx.currentTime, when || ctx.currentTime);
    const o1 = ctx.createOscillator(); o1.type = type; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.756; // inharmonic glass partial
    const g2 = ctx.createGain(); g2.gain.value = 0.18;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o1.connect(f); o2.connect(g2).connect(f); f.connect(g).connect(sfxBus);
    if (verb) g.connect(verbSend);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    o1.onended = () => { voices--; };
  }

  function duck(on) {
    if (!ctx) return;
    musicBus.gain.setTargetAtTime(0.8 * (on ? dbToGain(TRACKS.duckDb) : 1), ctx.currentTime, 0.08);
  }
  function swell() {
    if (!ctx) return;
    const now = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setTargetAtTime(0.8 * dbToGain(TRACKS.dawnSwellDb), now, 0.05);
    musicBus.gain.setTargetAtTime(0.8 * dbToGain(TRACKS.duckDb), now + 0.6, 0.4);
  }

  function padStart() {
    if (!ctx || pad) return;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.value = midiToHz(chordFor(track, TRACKS.neutralKey)[0]);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300; f.Q.value = 6;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    o.connect(f).connect(g).connect(sfxBus);
    o.start();
    pad = { o, f, g, level: 0 };
  }
  function padRise() {
    if (!pad) padStart();
    if (!pad) return;
    pad.level = Math.min(1, pad.level + 0.25);
    const t = ctx.currentTime;
    pad.f.frequency.setTargetAtTime(300 + 2200 * pad.level, t, 0.2);
    pad.g.gain.setTargetAtTime(0.02 + 0.05 * pad.level, t, 0.15);
  }
  function padStop() {
    if (!pad) return;
    const p = pad; pad = null;
    p.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12);
    setTimeout(() => { try { p.o.stop(); } catch { /* stopped */ } }, 800);
  }

  function chord(bright = false) {
    const notes = chordFor(track, TRACKS.neutralKey);
    notes.forEach((m, i) => voice(note(m + (bright ? 12 : 0)), { type: 'triangle', dur: 2.2, gain: 0.09, attack: 0.02 + i * 0.015, cutoff: bright ? 9000 : 4000 }));
  }

  function onEvent(e) {
    if (!ctx) return;
    const now = ctx.currentTime;
    switch (e.type) {
      case 'strike': case 'split': {
        for (const m of notesFor(e.color, e.intensity, track, TRACKS.neutralKey)) voice(note(m), { dur: 0.8, gain: 0.12 });
        break;
      }
      case 'travel':
        if (e.reason === 'lap') {
          // loops become arpeggios, quantised to sixteenth notes of the track's bpm
          const when = castT0 + quantize16(now - castT0, track.bpm || 72);
          const ns = notesFor(e.color, e.intensity, track, TRACKS.neutralKey);
          ns.forEach((m, i) => voice(note(m + 12), { when: when + (i * 60) / (track.bpm || 72) / 4, dur: 0.35, gain: 0.08 }));
        }
        break;
      case 'charge': if (!e.lost) padRise(); break;
      case 'fire': padStop(); chord(false); break;
      case 'dawn': chord(true); swell(); break;
      case 'aperture': case 'absorb': {
        if (!e.lux) break;
        luxRun += e.lux;
        // pitch-rising ticks as the Lux counter rolls toward the target
        const k = Math.min(1.5, luxRun / Math.max(1, luxTarget));
        voice(900 + 900 * k, { type: 'square', dur: 0.06, gain: 0.03, cutoff: 3000, verb: false });
        if (!crossed && luxRun >= luxTarget) { crossed = true; chord(true); }
        break;
      }
      case 'end': if (e.beamId === -1) { duck(false); padStop(); } break;
      default: break;
    }
  }

  return {
    get ctxState() { return ctx ? ctx.state : 'none'; },
    get played() { return played.slice(); },
    get muted() { return muted; },
    get track() { return track; },
    setMuted(on) {
      muted = !!on;
      store.set('muted', muted ? '1' : '0');
      if (ctx) master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.05);
    },
    setMood,
    // hooks.sound(kind, payload) from the game controller
    handle(kind, p) {
      if (!ctx) return;
      if (kind === 'castStart') { castT0 = ctx.currentTime; duck(true); luxRun = p && p.luxBefore || 0; luxTarget = p && p.target || 1; crossed = luxRun >= luxTarget; }
      else if (kind === 'event') onEvent(p);
      else if (kind === 'drop') { voice(2400, { dur: 0.25, gain: 0.07, type: 'triangle' }); voice(3610, { dur: 0.18, gain: 0.04 }); }
      else if (kind === 'rotate') voice(1500, { type: 'square', dur: 0.035, gain: 0.025, cutoff: 2500, verb: false });
      else if (kind === 'drag') voice(4200 + Math.random() * 400, { dur: 0.05, gain: 0.012, verb: false });
      else if (kind === 'reveal') chord(true);
    },
  };
}
