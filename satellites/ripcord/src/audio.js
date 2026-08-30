/* RIPCORD AUDIO — every sound is synthesised, nothing is downloaded.
 *
 * The rule the rest of the game follows is that no dramatic moment is canned,
 * so no sound may be canned either. A hit is loud because the impulse was
 * large; the rail scrape rises with rim speed; the spin whine tracks w. If two
 * hits sound the same it is because the numbers were the same.
 *
 * One AudioContext, created on the first gesture because every mobile browser
 * refuses one before that. Silent and harmless if the API is missing.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AUDIO = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ctx = null, master = null, on = true, whine = null, whineGain = null, scrape = null, scrapeGain = null;

  function ready() {
    if (!on) return false;
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);
      return true;
    } catch (e) { return false; }
  }

  function env(node, peak, attack, decay) {
    var g = ctx.createGain(), t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    node.connect(g); g.connect(master);
    return g;
  }

  /* A short burst of filtered noise. Every impact in the game is one of these
   * with a different filter and length, which is why a glancing clip and a
   * heavy-side slam are audibly different events rather than the same sample
   * at two volumes. */
  function noise(dur, freq, q, peak, type) {
    var n = Math.max(64, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = ctx.createBufferSource(); s.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    s.connect(f);
    env(f, peak, 0.004, dur);
    s.start();
    return s;
  }

  function tone(freq, dur, peak, type, slideTo) {
    var o = ctx.createOscillator();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), ctx.currentTime + dur);
    env(o, peak, 0.006, dur);
    o.start(); o.stop(ctx.currentTime + dur + 0.05);
    return o;
  }

  return {
    setEnabled: function (v) {
      on = !!v;
      if (!on) { this.stopLoops(); if (master) master.gain.value = 0; }
      else if (master) master.gain.value = 0.32;
    },
    enabled: function () { return on; },
    unlock: function () { ready(); },

    /* The living sound of a round: a spin whine that falls as the top dies,
     * and a rail scrape that only exists while somebody is on the rail. Both
     * are one node held open for the whole round, driven every frame. */
    startLoops: function () {
      if (!ready() || whine) return;
      whine = ctx.createOscillator(); whine.type = 'triangle'; whine.frequency.value = 180;
      whineGain = ctx.createGain(); whineGain.gain.value = 0.0001;
      whine.connect(whineGain); whineGain.connect(master); whine.start();

      var n = Math.floor(ctx.sampleRate * 0.5);
      var buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      scrape = ctx.createBufferSource(); scrape.buffer = buf; scrape.loop = true;
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 5;
      scrapeGain = ctx.createGain(); scrapeGain.gain.value = 0.0001;
      scrape.connect(f); f.connect(scrapeGain); scrapeGain.connect(master); scrape.start();
    },
    stopLoops: function () {
      try { if (whine) { whine.stop(); whine.disconnect(); } } catch (e) {}
      try { if (scrape) { scrape.stop(); scrape.disconnect(); } } catch (e) {}
      whine = scrape = whineGain = scrapeGain = null;
    },
    /* spin 0..1 for each top, rail 0..1 for how hard anyone is on the rail */
    drive: function (spinA, spinB, rail) {
      if (!ctx || !whine) return;
      var s = Math.max(spinA, spinB);
      whine.frequency.setTargetAtTime(110 + 240 * s, ctx.currentTime, 0.08);
      whineGain.gain.setTargetAtTime(0.018 * s + 0.0001, ctx.currentTime, 0.10);
      scrapeGain.gain.setTargetAtTime(0.055 * rail + 0.0001, ctx.currentTime, 0.05);
    },

    /* imp is the collision impulse straight out of the sim. swing is the
     * heavy-side multiplier, so a top that connects on the heavy side does not
     * just hit harder, it cracks instead of clicking. */
    hit: function (imp, swing) {
      if (!ready()) return;
      var mag = Math.min(1.6, imp / 0.020);
      noise(0.05 + 0.09 * mag, 900 - 380 * mag, 1.4, 0.20 + 0.42 * mag);
      if (swing > 1.5 && mag > 0.6) tone(140 - 40 * mag, 0.20, 0.24, 'square', 60);
    },
    dash: function (power) {
      if (!ready()) return;
      noise(0.16, 1500 + 900 * power, 8, 0.10 + 0.10 * power);
      tone(320, 0.18, 0.08, 'sawtooth', 900);
    },
    burst: function () {
      if (!ready()) return;
      noise(0.34, 420, 0.6, 0.62, 'lowpass');
      tone(220, 0.30, 0.30, 'square', 55);
      setTimeout(function () { if (ctx) noise(0.22, 3200, 2, 0.20); }, 40);
    },
    ringout: function () {
      if (!ready()) return;
      noise(0.26, 700, 1.2, 0.34);
      tone(500, 0.34, 0.16, 'triangle', 150);
    },
    knockout: function () {
      if (!ready()) return;
      noise(0.30, 300, 0.8, 0.48, 'lowpass');
      tone(90, 0.36, 0.26, 'sine', 45);
    },
    spinout: function () { if (ready()) tone(240, 0.7, 0.14, 'sine', 70); },
    launch: function (power) {
      if (!ready()) return;
      tone(70, 0.42, 0.22, 'sawtooth', 300 + 260 * power);
      noise(0.30, 1200, 1.0, 0.14);
    },
    ability: function () {
      if (!ready()) return;
      tone(660, 0.16, 0.14, 'triangle', 1320);
      tone(990, 0.12, 0.07, 'sine');
    },
    tick: function () { if (ready()) noise(0.020, 2400, 6, 0.07); },
    win: function () {
      if (!ready()) return;
      [523, 659, 784, 1047].forEach(function (f, i) {
        setTimeout(function () { if (ctx) tone(f, 0.24, 0.16, 'triangle'); }, i * 95);
      });
    },
    lose: function () {
      if (!ready()) return;
      [392, 330, 262].forEach(function (f, i) {
        setTimeout(function () { if (ctx) tone(f, 0.30, 0.14, 'sine'); }, i * 130);
      });
    }
  };
});
