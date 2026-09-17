// A tiny Web Audio synth for every cue in DESIGN 11 (no audio files this pass, OPUS_PROMPT).
// Fabric shuffle scaled to bodies disturbed, "thwip" on a ball, a wooden basket thud, a soft
// "huh" on a mismatch, dryer hum and rain for Laundry Day, a pulse that rises with the Rush
// streak, a duck on Results, and six generated radio stations.

export class Audio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicOn = true;
    this.beds = {};
    this.station = null;
    this.duckLevel = 1;
  }

  // must be called from a user gesture
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = new AC();
    this.ctx = c;
    this.master = c.createGain(); this.master.gain.value = 0.9;
    this.comp = c.createDynamicsCompressor();
    this.comp.threshold.value = -16; this.comp.ratio.value = 3;
    this.master.connect(this.comp).connect(c.destination);
    this.sfxBus = c.createGain(); this.sfxBus.gain.value = this.enabled ? 1 : 0; this.sfxBus.connect(this.master);
    this.bedBus = c.createGain(); this.bedBus.gain.value = this.musicOn ? 0.55 : 0; this.bedBus.connect(this.master);
    this.noise = this._noiseBuffer();
    // a small room so everything sits in the same laundry room
    this.verb = c.createConvolver();
    this.verb.buffer = this._impulse(1.2);
    const wet = c.createGain(); wet.gain.value = 0.16;
    this.sfxBus.connect(this.verb); this.verb.connect(wet).connect(this.master);
  }

  setEnabled(on) { this.enabled = on; if (this.sfxBus) this.sfxBus.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05); }
  setMusic(on) { this.musicOn = on; if (this.bedBus) this.bedBus.gain.setTargetAtTime(on ? 0.55 * this.duckLevel : 0, this.ctx.currentTime, 0.2); }
  duck(on) {
    this.duckLevel = on ? 0.35 : 1;
    if (this.bedBus && this.musicOn) this.bedBus.gain.setTargetAtTime(0.55 * this.duckLevel, this.ctx.currentTime, 0.3);
  }

  _noiseBuffer() {
    const c = this.ctx, len = c.sampleRate * 2;
    const b = c.createBuffer(1, len, c.sampleRate);
    const d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = last * 0.6 + w * 0.4; d[i] = last; }
    return b;
  }

  _impulse(sec) {
    const c = this.ctx, len = Math.floor(c.sampleRate * sec);
    const b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return b;
  }

  _env(g, t, a, peak, d, end = 0.0001) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(end, t + a + d);
  }

  _noise(t, dur, { type = 'bandpass', f = 1200, f2 = null, q = 1, peak = 0.3, attack = 0.005, dest = null } = {}) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const fl = c.createBiquadFilter();
    fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = c.createGain();
    this._env(g, t, attack, peak, dur);
    src.connect(fl).connect(g).connect(dest || this.sfxBus);
    src.start(t, Math.random() * 1.5, dur + attack + 0.05);
  }

  _tone(t, freq, dur, { type = 'sine', peak = 0.2, f2 = null, attack = 0.005, dest = null, detune = 0 } = {}) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = c.createGain();
    this._env(g, t, attack, peak, dur);
    o.connect(g).connect(dest || this.sfxBus);
    o.start(t); o.stop(t + attack + dur + 0.05);
  }

  play(name, p = {}) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + 0.005;
    const j = () => 0.94 + Math.random() * 0.12;
    switch (name) {
      case 'grab': this._noise(t, 0.09, { f: 2400 * j(), q: 0.8, peak: 0.12 }); break;
      case 'fly': this._noise(t, 0.2, { f: 900, f2: 2600, q: 1.2, peak: 0.07 }); break;
      case 'whoosh': this._noise(t, 0.22, { f: 700, f2: 2200, q: 0.9, peak: Math.min(0.2, 0.05 + (p.speed || 1) * 0.04) }); break;
      case 'toss': this._noise(t, 0.25, { f: 600, f2: 1800, q: 1, peak: 0.12 }); break;
      case 'shuffle': {
        const n = Math.min(10, 2 + Math.floor((p.bodies || 4) / 3));
        for (let i = 0; i < n; i++) this._noise(t + i * 0.035 * j(), 0.08, { f: 1500 + Math.random() * 1800, q: 0.7, peak: 0.07 });
        break;
      }
      case 'thwip': // two quick rising pluck and zip
        this._noise(t, 0.12, { f: 800, f2: 5000, q: 2, peak: 0.16 });
        this._tone(t + 0.05, 520 * j(), 0.14, { type: 'triangle', peak: 0.14, f2: 880 });
        this._tone(t + 0.1, 1040 * j(), 0.12, { type: 'sine', peak: 0.07 });
        break;
      case 'basket': { // wooden, woven thud
        const soft = p.soft ? 0.5 : 1;
        this._tone(t, 150 * j(), 0.18, { type: 'sine', peak: 0.35 * soft, f2: 70 });
        this._noise(t, 0.12, { type: 'bandpass', f: 900, q: 1.5, peak: 0.12 * soft });
        for (let i = 1; i < 4; i++) this._noise(t + i * 0.045, 0.04, { f: 2200 + i * 300, q: 3, peak: 0.04 * soft });
        break;
      }
      case 'rim': this._tone(t, 330 * j(), 0.12, { type: 'triangle', peak: 0.12, f2: 240 }); this._noise(t, 0.05, { f: 1800, q: 4, peak: 0.08 }); break;
      case 'land': this._noise(t, 0.08, { type: 'lowpass', f: 500, q: 0.7, peak: 0.12 }); break;
      case 'huh': // a soft, falling "hm"
        this._tone(t, 240, 0.28, { type: 'triangle', peak: 0.1, f2: 190, attack: 0.03 });
        this._tone(t, 480, 0.2, { type: 'sine', peak: 0.03, f2: 380, attack: 0.03 });
        break;
      case 'flip': this._noise(t, 0.1, { f: 3000, q: 1, peak: 0.1 }); this._tone(t + 0.04, 660, 0.1, { type: 'sine', peak: 0.06, f2: 990 }); break;
      case 'flipSoft': this._noise(t, 0.08, { f: 2600, q: 1, peak: 0.07 }); break;
      case 'bin': this._tone(t, 196, 0.2, { type: 'sine', peak: 0.2, f2: 120 }); this._noise(t, 0.08, { type: 'lowpass', f: 700, peak: 0.1 }); break;
      case 'reunion': [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this._tone(t + i * 0.09, f, 0.9, { type: 'sine', peak: 0.09, attack: 0.02 })); break;
      case 'match': this._tone(t, 784, 0.12, { type: 'sine', peak: 0.08 }); break;
      case 'doorOpen': this._noise(t, 0.25, { type: 'lowpass', f: 400, q: 0.5, peak: 0.14 }); this._tone(t, 90, 0.2, { peak: 0.1 }); break;
      case 'dryerEnd': this._noise(t, 0.6, { type: 'lowpass', f: 300, f2: 120, q: 0.6, peak: 0.08, attack: 0.1 }); break;
      case 'ding': this._tone(t, 1318.5, 1.1, { type: 'sine', peak: 0.12 }); this._tone(t, 2637, 0.6, { type: 'sine', peak: 0.03 }); break;
      case 'click': this._tone(t, 1200, 0.04, { type: 'square', peak: 0.03 }); break;
      case 'coin': this._tone(t, 988, 0.08, { type: 'square', peak: 0.04 }); this._tone(t + 0.07, 1319, 0.2, { type: 'square', peak: 0.04 }); break;
      case 'peg': [392, 523.25, 659.25].forEach((f, i) => this._tone(t + i * 0.07, f, 0.35, { type: 'triangle', peak: 0.07 })); break;
      case 'results': [392, 493.88, 587.33, 783.99].forEach((f, i) => this._tone(t + i * 0.12, f, 0.6, { type: 'triangle', peak: 0.08 })); break;
      case 'power': this._tone(t, 440, 0.3, { type: 'sawtooth', peak: 0.05, f2: 1320 }); this._noise(t, 0.3, { f: 3000, f2: 8000, peak: 0.06 }); break;
      case 'tick': this._tone(t, 1760, 0.03, { type: 'square', peak: 0.02 }); break;
      case 'tip': this._noise(t, 0.4, { type: 'lowpass', f: 600, peak: 0.2 }); this._tone(t, 160, 0.4, { peak: 0.2, f2: 60 }); break;
      default: break;
    }
  }

  // ---------- beds ----------
  hum(on, rich = false) {
    if (!this.ctx) return;
    const c = this.ctx;
    if (on && !this.beds.hum) {
      const g = c.createGain(); g.gain.value = 0;
      const o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = 58;
      const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = 116.4;
      const lfo = c.createOscillator(); lfo.frequency.value = rich ? 0.8 : 1.1;
      const lg = c.createGain(); lg.gain.value = 0.02;
      lfo.connect(lg).connect(g.gain);
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400;
      o1.connect(f); o2.connect(f); f.connect(g).connect(this.bedBus);
      // a soft tumble: filtered noise pulsing like a drum turning over
      const n = c.createBufferSource(); n.buffer = this.noise; n.loop = true;
      const nf = c.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = rich ? 260 : 200;
      const ng = c.createGain(); ng.gain.value = rich ? 0.06 : 0.035;
      const nl = c.createOscillator(); nl.frequency.value = 0.55; const nlg = c.createGain(); nlg.gain.value = rich ? 0.04 : 0.02;
      nl.connect(nlg).connect(ng.gain);
      n.connect(nf).connect(ng).connect(this.bedBus);
      [o1, o2, lfo, n, nl].forEach((x) => x.start());
      g.gain.setTargetAtTime(rich ? 0.07 : 0.05, c.currentTime, 1.5);
      this.beds.hum = { stop: () => { g.gain.setTargetAtTime(0, c.currentTime, 0.6); ng.gain.setTargetAtTime(0, c.currentTime, 0.6); setTimeout(() => [o1, o2, lfo, n, nl].forEach((x) => { try { x.stop(); } catch (e) { /* stopped */ } }), 3000); } };
    } else if (!on && this.beds.hum) { this.beds.hum.stop(); this.beds.hum = null; }
  }

  rain(on) {
    if (!this.ctx) return;
    const c = this.ctx;
    if (on && !this.beds.rain) {
      const n = c.createBufferSource(); n.buffer = this.noise; n.loop = true;
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
      const g = c.createGain(); g.gain.value = 0;
      n.connect(hp).connect(lp).connect(g).connect(this.bedBus);
      n.start();
      g.gain.setTargetAtTime(0.12, c.currentTime, 2);
      let alive = true;
      const drops = () => {
        if (!alive) return;
        const t = c.currentTime;
        for (let i = 0; i < 3; i++) this._noise(t + Math.random() * 0.3, 0.02, { f: 3000 + Math.random() * 3000, q: 6, peak: 0.02, dest: this.bedBus });
        setTimeout(drops, 250 + Math.random() * 250);
      };
      drops();
      this.beds.rain = { stop: () => { alive = false; g.gain.setTargetAtTime(0, c.currentTime, 0.8); setTimeout(() => { try { n.stop(); } catch (e) { /* stopped */ } }, 4000); } };
    } else if (!on && this.beds.rain) { this.beds.rain.stop(); this.beds.rain = null; }
  }

  // Rush: a low pulse that rises with the streak (DESIGN 11)
  pulse(on, level = 0) {
    if (!this.ctx) return;
    const c = this.ctx;
    if (on && !this.beds.pulse) {
      // the square LFO swings the gain by +-depth around a base of the same size, so the beat goes 0, 2x, 0, 2x
      const g = c.createGain(); g.gain.value = 0.05;
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = 55;
      const lfo = c.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 2;
      const lg = c.createGain(); lg.gain.value = 0.05;
      lfo.connect(lg).connect(g.gain);
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300;
      o.connect(f).connect(g).connect(this.bedBus);
      o.start(); lfo.start();
      this.beds.pulse = { o, lfo, g, f, stop: () => { g.gain.setTargetAtTime(0, c.currentTime, 0.3); lg.gain.setTargetAtTime(0, c.currentTime, 0.3); setTimeout(() => { try { o.stop(); lfo.stop(); } catch (e) { /* stopped */ } }, 2000); } };
      this.beds.pulse.lg = lg;
    }
    if (!on && this.beds.pulse) { this.beds.pulse.stop(); this.beds.pulse = null; return; }
    if (this.beds.pulse) {
      const b = this.beds.pulse, t = c.currentTime;
      b.o.frequency.setTargetAtTime(55 * Math.pow(2, level / 12 * 2), t, 0.3);
      b.lfo.frequency.setTargetAtTime(2 + level * 0.5, t, 0.3);
      b.f.frequency.setTargetAtTime(300 + level * 160, t, 0.3);
      const depth = 0.04 + level * 0.012;
      b.lg.gain.setTargetAtTime(depth, t, 0.3);
      b.g.gain.setTargetAtTime(depth, t, 0.3);
    }
  }

  // ---------- radio (DESIGN 9.5: loops under 30 s or generated in code) ----------
  radio(station) {
    if (!this.ctx) { this.station = station; return; }
    if (this.radioNode) { this.radioNode.stop(); this.radioNode = null; }
    this.station = station;
    if (!station) return;
    this.radioNode = new Station(this, station);
  }

  stopAll() {
    for (const k of Object.keys(this.beds)) { this.beds[k].stop(); this.beds[k] = null; }
    this.beds = {};
  }
}

// A station: a short generative loop, re-scheduled every bar.
const SCALE = [0, 2, 4, 7, 9];
class Station {
  constructor(A, kind) {
    this.A = A;
    this.kind = kind;
    const c = A.ctx;
    this.out = c.createGain();
    this.out.gain.value = 0;
    this.out.gain.setTargetAtTime(kind === 'tv' ? 0.5 : 0.35, c.currentTime, 0.8);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = kind === 'tv' ? 900 : kind === 'jazz' ? 3200 : kind === 'hold' ? 4200 : 2600;
    this.out.connect(lp).connect(A.bedBus);
    this.bar = 0;
    this.alive = true;
    this.tempo = { lofi: 76, jazz: 92, hold: 104, resonarc: 64, rain: 60, tv: 60 }[kind] || 80;
    this.seed = Math.random() * 1000;
    if (kind === 'rain') A.rain(true);
    if (kind === 'jazz' || kind === 'lofi') this._crackle();
    this._schedule(c.currentTime + 0.1);
  }

  _rand() { this.seed = (this.seed * 9301 + 49297) % 233280; return this.seed / 233280; }

  _crackle() {
    const A = this.A, c = A.ctx;
    const tick = () => {
      if (!this.alive) return;
      const t = c.currentTime;
      if (Math.random() < 0.7) A._noise(t, 0.01, { f: 4000 + Math.random() * 3000, q: 8, peak: 0.02, dest: this.out });
      setTimeout(tick, 60 + Math.random() * 180);
    };
    tick();
  }

  _schedule(t0) {
    if (!this.alive) return;
    const A = this.A, c = A.ctx;
    const beat = 60 / this.tempo;
    const bars = 1;
    const root = [0, -3, -5, -1][this.bar % 4];
    const base = 220 * Math.pow(2, root / 12);
    const k = this.kind;
    const note = (deg, oct = 0) => base * Math.pow(2, (SCALE[((deg % 5) + 5) % 5] + 12 * (oct + Math.floor(deg / 5))) / 12);
    if (k === 'lofi' || k === 'jazz' || k === 'resonarc') {
      // chord pad
      const chord = k === 'jazz' ? [0, 2, 4, 6] : [0, 2, 4];
      chord.forEach((d, i) => A._tone(t0 + i * 0.01, note(d, k === 'resonarc' ? -1 : 0) * (k === 'jazz' ? 1 : 1), beat * 3.8, { type: k === 'resonarc' ? 'sine' : 'triangle', peak: 0.035, attack: k === 'resonarc' ? 0.8 : 0.05, dest: this.out, detune: (this._rand() - 0.5) * 12 }));
      // melody
      for (let b = 0; b < 4; b++) {
        if (this._rand() < (k === 'resonarc' ? 0.35 : 0.55)) {
          const d = Math.floor(this._rand() * 7) + 3;
          A._tone(t0 + b * beat + (k === 'lofi' ? 0.03 : 0), note(d, 1), beat * (k === 'resonarc' ? 2.5 : 0.8), { type: k === 'jazz' ? 'triangle' : 'sine', peak: 0.05, attack: 0.01, dest: this.out });
        }
      }
      if (k !== 'resonarc') {
        // soft kick and brush
        for (let b = 0; b < 4; b++) {
          if (b % 2 === 0) A._tone(t0 + b * beat, 70, 0.2, { peak: 0.1, f2: 45, dest: this.out });
          A._noise(t0 + b * beat + beat / 2, 0.08, { f: 6000, q: 0.6, peak: k === 'jazz' ? 0.03 : 0.02, dest: this.out });
        }
        if (k === 'jazz') for (let b = 0; b < 4; b++) A._tone(t0 + b * beat, note(b === 3 ? 4 : b, -1), beat * 0.9, { type: 'sine', peak: 0.07, dest: this.out });
      }
    } else if (k === 'hold') {
      const mel = [0, 2, 4, 5, 4, 2, 0, -1];
      mel.forEach((d, i) => A._tone(t0 + i * beat / 2, note(d, 1), beat / 2 * 0.9, { type: 'square', peak: 0.025, dest: this.out }));
      [0, 2, 4].forEach((d) => A._tone(t0, note(d, 0), beat * 3.8, { type: 'sine', peak: 0.03, dest: this.out }));
    } else if (k === 'tv') {
      // muffled voices from the next room: formant blips with laughter swells
      for (let i = 0; i < 10; i++) {
        const t = t0 + this._rand() * beat * 4;
        A._tone(t, 110 + this._rand() * 90, 0.12 + this._rand() * 0.2, { type: 'sawtooth', peak: 0.03, dest: this.out });
      }
      if (this._rand() < 0.25) A._noise(t0 + beat, beat * 1.5, { f: 900, q: 0.8, peak: 0.03, attack: 0.3, dest: this.out });
    } else if (k === 'rain') {
      if (this._rand() < 0.3) A._tone(t0, note(Math.floor(this._rand() * 5), 1), beat * 3, { type: 'sine', peak: 0.02, attack: 0.5, dest: this.out });
    }
    this.bar++;
    const next = t0 + beat * 4 * bars;
    this.timer = setTimeout(() => this._schedule(next), Math.max(10, (next - c.currentTime - 0.15) * 1000));
  }

  stop() {
    this.alive = false;
    clearTimeout(this.timer);
    const c = this.A.ctx;
    this.out.gain.setTargetAtTime(0, c.currentTime, 0.3);
    if (this.kind === 'rain' && !this.A.keepRain) this.A.rain(false);
  }
}
