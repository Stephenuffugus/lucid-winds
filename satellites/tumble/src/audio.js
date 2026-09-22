// A tiny Web Audio synth for every cue in DESIGN 11 (no audio files this pass, OPUS_PROMPT).
// Fabric shuffle scaled to bodies disturbed, "thwip" on a ball, a wooden basket thud, a soft
// "huh" on a mismatch, dryer hum and rain for Laundry Day, a pulse that rises with the Rush
// streak, a duck on Results, and six generated radio stations.

// What each basket is made of, for 7.1. Every number here was tuned by ear against the original wicker thud,
// which is unchanged: a player who never buys a basket hears exactly what she always heard.
export const BASKET_MATERIAL = {
  wicker:  { body: 150, bodyTo: 70,  bodyType: 'sine',     bodyLen: 0.18, bodyPeak: 0.28, mid: 420, hiss: 900,  hissQ: 1.5, hissPeak: 0.12, hissLen: 0.12, taps: 3, tapGap: 0.045, tapF: 2200, tapPeak: 0.04 },
  wire:    { body: 210, bodyTo: 150, bodyType: 'triangle', bodyLen: 0.10, bodyPeak: 0.16, mid: 0,   hiss: 3200, hissQ: 4,   hissPeak: 0.10, hissLen: 0.06, taps: 2, tapGap: 0.03,  tapF: 4200, tapPeak: 0.05, ring: [1245, 1860, 2490], ringLen: 0.9, ringPeak: 0.035 },
  cloth:   { body: 110, bodyTo: 60,  bodyType: 'sine',     bodyLen: 0.16, bodyPeak: 0.22, mid: 0,   hiss: 520,  hissQ: 0.8, hissPeak: 0.10, hissLen: 0.16, taps: 1, tapGap: 0.05,  tapF: 900,  tapPeak: 0.02 },
  enamel:  { body: 320, bodyTo: 230, bodyType: 'triangle', bodyLen: 0.12, bodyPeak: 0.20, mid: 640, hiss: 2600, hissQ: 3,   hissPeak: 0.09, hissLen: 0.07, taps: 2, tapGap: 0.035, tapF: 3400, tapPeak: 0.04, ring: [880, 1320], ringLen: 1.2, ringPeak: 0.045 },
  plastic: { body: 190, bodyTo: 120, bodyType: 'square',   bodyLen: 0.08, bodyPeak: 0.17, mid: 520, hiss: 1600, hissQ: 2,   hissPeak: 0.09, hissLen: 0.07, taps: 2, tapGap: 0.04,  tapF: 2800, tapPeak: 0.035 },
};

// which material each basket STYLE lands like. A style with no entry lands like wicker.
export const BASKET_STYLE_MATERIAL = {
  wicker: 'wicker', wire: 'wire', bag: 'cloth', doll: 'cloth', plastic: 'plastic',
  floatie: 'plastic', log: 'wicker', claw: 'plastic', tub: 'enamel', rope: 'cloth',
  suitcase: 'cloth', wagon: 'enamel', umbrella: 'cloth', paper: 'cloth', felt: 'cloth', bread: 'wicker',
};

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
    // a station picked before the first touch (the room at boot) starts now
    if (this.station) { const st = this.station, u = this.stationUrl || null; this.station = null; this.radio(st, u); }
  }

  setEnabled(on) { this.enabled = on; if (this.sfxBus) this.sfxBus.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05); }
  setMusic(on) { this.musicOn = on; if (this.bedBus) this.bedBus.gain.setTargetAtTime(on ? 0.55 * this.duckLevel : 0, this.ctx.currentTime, 0.2); }
  // `on` true is the results duck; 'deep' is the one a Reunion gets, which is nearly silence (DESIGN-T2 7.8).
  duck(on) {
    this.duckLevel = on === 'deep' ? 0.08 : on ? 0.35 : 1;
    if (this.bedBus && this.musicOn) this.bedBus.gain.setTargetAtTime(0.55 * this.duckLevel, this.ctx.currentTime, on === 'deep' ? 0.12 : 0.3);
  }

  // duck hard, hold, and come back up on its own. Nothing has to remember to undo it.
  hush(sec = 2.6) {
    if (!this.ctx) return;
    this.duck('deep');
    clearTimeout(this._hushT);
    this._hushT = setTimeout(() => { if (this.duckLevel < 0.2) this.duck(false); }, sec * 1000);
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
      // THE BALL LANDS IN THE BASKET'S OWN MATERIAL (DESIGN-T2 7.1). Wicker is the thud the game has always
      // had; wire rings, cloth swallows, enamel clanks, plastic knocks. `p.mat` comes from the equipped
      // basket's style, and anything unknown falls back to wicker, so a new basket is never silent.
      case 'basket': {
        const soft = p.soft ? 0.5 : 1;
        const mat = BASKET_MATERIAL[p.mat] ? p.mat : 'wicker';
        const M = BASKET_MATERIAL[mat];
        this._tone(t, M.body * j(), M.bodyLen, { type: M.bodyType, peak: M.bodyPeak * soft, f2: M.bodyTo });
        if (M.mid) this._tone(t, M.mid * j(), 0.07, { type: 'triangle', peak: 0.12 * soft, f2: M.mid * 0.62 });
        this._noise(t, M.hissLen, { type: 'bandpass', f: M.hiss, q: M.hissQ, peak: M.hissPeak * soft });
        for (let i = 1; i < M.taps + 1; i++) this._noise(t + i * M.tapGap, 0.04, { f: M.tapF + i * 300, q: 3, peak: M.tapPeak * soft });
        // wire and enamel keep ringing after the ball has stopped
        if (M.ring) for (let i = 0; i < M.ring.length; i++) this._tone(t + 0.01 * i, M.ring[i] * j(), M.ringLen, { type: 'sine', peak: M.ringPeak * soft, attack: 0.004 });
        break;
      }
      case 'rim': this._tone(t, 330 * j(), 0.12, { type: 'triangle', peak: 0.12, f2: 240 }); this._noise(t, 0.05, { f: 1800, q: 4, peak: 0.08 }); break;
      case 'land': this._noise(t, 0.08, { type: 'lowpass', f: 500, q: 0.7, peak: Math.min(0.16, 0.04 + (p.speed || 1) * 0.025) }); break;
      // A MISS IS A SOFT FLOP, NOT A CLATTER (DESIGN-T2 7.5). A ball of socks landing on a table is cloth
      // hitting cloth: low, dull, over at once, and quieter the harder it was thrown rather than louder.
      case 'flop':
        this._noise(t, 0.11, { type: 'lowpass', f: 330, f2: 180, q: 0.6, peak: Math.min(0.13, 0.05 + (p.speed || 1) * 0.016), attack: 0.006 });
        this._tone(t, 96, 0.09, { type: 'sine', peak: 0.05, f2: 62 });
        break;
      case 'huh': // a soft, falling "hm"
        this._tone(t, 240, 0.28, { type: 'triangle', peak: 0.1, f2: 190, attack: 0.03 });
        this._tone(t, 480, 0.2, { type: 'sine', peak: 0.03, f2: 380, attack: 0.03 });
        break;
      case 'flip': this._noise(t, 0.1, { f: 3000, q: 1, peak: 0.1 }); this._tone(t + 0.04, 660, 0.1, { type: 'sine', peak: 0.06, f2: 990 }); break;
      case 'flipSoft': this._noise(t, 0.08, { f: 2600, q: 1, peak: 0.07 }); break;
      case 'bin': this._tone(t, 196, 0.2, { type: 'sine', peak: 0.2, f2: 120 }); this._noise(t, 0.08, { type: 'lowpass', f: 700, peak: 0.1 }); break;
      // A REUNION IS MOSTLY SILENCE (DESIGN-T2 7.8): the radio ducks hard, ONE note, and the page. It used to
      // be a four note arpeggio played straight over the music, which is the opposite of the thing a reunion
      // is. The duck is done by the caller, because it has to come back up afterwards.
      case 'reunion':
        this._tone(t + 0.12, 659.25, 2.4, { type: 'sine', peak: 0.085, attack: 0.05 });
        this._tone(t + 0.12, 1318.5, 1.6, { type: 'sine', peak: 0.022, attack: 0.06 });
        break;
      case 'match': this._tone(t, 784, 0.12, { type: 'sine', peak: 0.08 }); break;
      case 'doorOpen': this._noise(t, 0.25, { type: 'lowpass', f: 400, q: 0.5, peak: 0.14 }); this._tone(t, 90, 0.2, { peak: 0.1 }); break;
      case 'dryerEnd': this._noise(t, 0.6, { type: 'lowpass', f: 300, f2: 120, q: 0.6, peak: 0.08, attack: 0.1 }); break;
      case 'ding': this._tone(t, 1318.5, 1.1, { type: 'sine', peak: 0.12 }); this._tone(t, 2637, 0.6, { type: 'sine', peak: 0.03 }); break;
      case 'click': this._tone(t, 1200, 0.04, { type: 'square', peak: 0.03 }); break;
      // pocket change: one coin sound per coin, pitched by kind. A penny is a thin tick, a quarter has weight
      // and a little ring to it (DESIGN-T2 1.5).
      case 'coin': {
        const k = p.kind || 'penny';
        const base = { penny: 1245, nickel: 1108, dime: 1480, quarter: 880 }[k] || 1245;
        const ring = { penny: 0.10, nickel: 0.16, dime: 0.20, quarter: 0.34 }[k] || 0.1;
        const vol = { penny: 0.035, nickel: 0.045, dime: 0.05, quarter: 0.07 }[k] || 0.035;
        this._noise(t, 0.03, { f: base * 2.2, q: 3, peak: vol * 0.8 });
        this._tone(t, base, ring, { type: 'triangle', peak: vol });
        this._tone(t + 0.02, base * 1.5, ring * 0.7, { type: 'sine', peak: vol * 0.55 });
        if (k === 'quarter' || k === 'dime') this._tone(t + 0.05, base * 2, ring * 0.5, { type: 'sine', peak: vol * 0.3 });
        break;
      }
      // twenty five cents fold into a paper wrapper: paper, then a settled little thunk
      case 'roll':
        this._noise(t, 0.26, { type: 'bandpass', f: 2600, f2: 1100, q: 0.8, peak: 0.10, attack: 0.02 });
        this._noise(t + 0.2, 0.1, { type: 'lowpass', f: 420, q: 0.7, peak: 0.13 });
        this._tone(t + 0.2, 196, 0.22, { type: 'sine', peak: 0.13, f2: 132 });
        this._tone(t + 0.26, 587.33, 0.5, { type: 'triangle', peak: 0.06 });
        break;
      // A POCKET FIND (DESIGN-T2 2.3): not a coin and not a Reunion. Something small and dry lands on the
      // table, then two soft notes: it is worth looking at, and it is over in a second.
      case 'find':
        this._noise(t, 0.05, { type: 'bandpass', f: 1700, q: 1.6, peak: 0.09 });
        this._noise(t + 0.06, 0.09, { type: 'lowpass', f: 620, q: 0.8, peak: 0.07 });
        this._tone(t + 0.12, 523.25, 0.5, { type: 'triangle', peak: 0.07, attack: 0.02 });
        this._tone(t + 0.26, 783.99, 0.7, { type: 'sine', peak: 0.055, attack: 0.02 });
        break;
      // a set is finished: the same two notes with a third under them, and nothing louder than that
      case 'findSet':
        [523.25, 659.25, 783.99].forEach((f, i) => this._tone(t + i * 0.13, f, 0.9, { type: 'triangle', peak: 0.075, attack: 0.02 }));
        this._tone(t + 0.26, 261.63, 1.2, { type: 'sine', peak: 0.05, attack: 0.04 });
        break;
      // PAPER (DESIGN-T2 7.4). A sheet of paper lifted and set down: a short brush of fibre, no tone at all.
      // Everything else in the game that opens has a note; a menu that is paper does not get one.
      case 'paper':
        this._noise(t, 0.16, { type: 'bandpass', f: 1900, f2: 3400, q: 0.7, peak: 0.055, attack: 0.012 });
        this._noise(t + 0.05, 0.1, { type: 'highpass', f: 2600, q: 0.6, peak: 0.028 });
        break;
      case 'paperOff':
        this._noise(t, 0.14, { type: 'bandpass', f: 3000, f2: 1500, q: 0.7, peak: 0.045, attack: 0.008 });
        this._noise(t + 0.06, 0.08, { type: 'lowpass', f: 900, q: 0.6, peak: 0.03 });
        break;
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
      const g = c.createGain(); g.gain.value = 0.03;
      // a sawtooth at 110 Hz: its harmonics reach a phone speaker, where a 55 Hz triangle was only clicks
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 110;
      const lfo = c.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 2;
      const lg = c.createGain(); lg.gain.value = 0.03;
      // round each step of the square to about 12 ms: a soft thump, not a click
      const edge = c.createBiquadFilter(); edge.type = 'lowpass'; edge.frequency.value = 30; edge.Q.value = -3;
      lfo.connect(lg).connect(edge).connect(g.gain);
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520;
      o.connect(f).connect(g).connect(this.bedBus);
      o.start(); lfo.start();
      this.beds.pulse = { o, lfo, g, f, stop: () => { g.gain.setTargetAtTime(0, c.currentTime, 0.3); lg.gain.setTargetAtTime(0, c.currentTime, 0.3); setTimeout(() => { try { o.stop(); lfo.stop(); } catch (e) { /* stopped */ } }, 2000); } };
      this.beds.pulse.lg = lg;
    }
    if (!on && this.beds.pulse) { this.beds.pulse.stop(); this.beds.pulse = null; return; }
    if (this.beds.pulse) {
      const b = this.beds.pulse, t = c.currentTime;
      b.o.frequency.setTargetAtTime(110 * Math.pow(2, level / 6), t, 0.3);
      b.lfo.frequency.setTargetAtTime(2 + level * 0.5, t, 0.3);
      b.f.frequency.setTargetAtTime(520 + level * 180, t, 0.3);
      const depth = 0.03 + level * 0.009;
      b.lg.gain.setTargetAtTime(depth, t, 0.3);
      b.g.gain.setTargetAtTime(depth, t, 0.3);
    }
  }

  // ---------- radio (DESIGN 9.5: loops under 30 s or generated in code) ----------
  // A station plays a real track when it has one (Stephen's beats: `look.url` on the radio item, served from /music),
  // else the generated loop. Same station and file already playing: nothing changes.
  radio(station, url = null) {
    if (!this.ctx) { this.station = station; this.stationUrl = url; return; }
    if (this.radioNode && this.radioNode.alive && this.station === station && (this.radioNode.url || null) === (url || null)) return;
    if (this.radioNode) { this.radioNode.stop(); this.radioNode = null; }
    this.station = station;
    this.stationUrl = url;
    if (!station) return;
    this.radioNode = url ? new Track(this, station, url) : new Station(this, station);
  }

  stopAll() {
    for (const k of Object.keys(this.beds)) { this.beds[k].stop(); this.beds[k] = null; }
    this.beds = {};
  }
}

// A track: a real audio file (his beats), looped, through the same music bus as the synth stations so the music
// switch and the Results duck apply to it. `kind` tells a gate which player is running.
class Track {
  constructor(A, station, url) {
    this.A = A;
    this.kind = 'track';
    this.station = station;
    this.url = url;
    this.alive = true;
    const c = A.ctx;
    const el = document.createElement('audio');
    el.crossOrigin = 'anonymous';
    el.loop = true;
    el.preload = 'auto';
    el.src = url;
    this.el = el;
    this.out = c.createGain();
    this.out.gain.value = 0;
    this.out.gain.setTargetAtTime(0.9, c.currentTime, 0.8);
    try { this.src = c.createMediaElementSource(el); this.src.connect(this.out).connect(A.bedBus); } catch (e) { /* an element that cannot be routed still plays on its own */ }
    // a file that cannot load or play (offline, a wrong path, autoplay refused) falls back to the generated loop
    const fallback = () => { if (!this.alive) return; this.stop(); if (A.station === station) { A.radioNode = new Station(A, station); } };
    el.addEventListener('error', fallback, { once: true });
    const p = el.play();
    if (p && p.catch) p.catch(fallback);
  }

  stop() {
    this.alive = false;
    const c = this.A.ctx;
    this.out.gain.setTargetAtTime(0, c.currentTime, 0.3);
    const el = this.el;
    setTimeout(() => { try { el.pause(); el.removeAttribute('src'); el.load(); } catch (e) { /* gone */ } if (this.src) { try { this.src.disconnect(); } catch (e) { /* gone */ } } }, 400);
  }
}

// A station: a short generative loop, re-scheduled every bar.
const SCALE = [0, 2, 4, 7, 9];
class Station {
  constructor(A, kind) {
    this.A = A;
    this.kind = 'synth';
    this.station = kind;
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
    const k = this.station;
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
    if (this.station === 'rain' && !this.A.keepRain) this.A.rain(false);
  }
}
