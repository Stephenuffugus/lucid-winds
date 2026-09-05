P='/workspaces/lucid-winds/satellites/attic/index.html'
s=open(P).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)

rep("  function wipeReveal(slot, h, size) {\n    if (!slot) return;\n    wipeSettle();",
r"""  /* ── SOUND (2026-09-05) ──────────────────────────────────────────────
     A WebAudio synth in the page, no files, in the attic's voice: paper, wood and dust.
     A tap on any button, the rummage rustle, the wipe brushing, a plate sting that climbs
     with the grade (a thud for TRASHED, four notes for MINT, a fanfare for FACTORY SEALED),
     the dust panel's rustle and the stub ding, a scrap crumple, the want list bell, the card
     snap. Unlocked on the first touch, muted by the SOUND chip (kept in attic_snd), muted at
     the speaker so `log` still records every beat for the gate; `render(name, arg)` bounces
     one cue offline and returns its RMS so the gate can prove air moved. */
  var SFX = (function () {
    var ctx = null, master = null, on = true, log = [], noiseBuf = null, lastDust = 0;
    try { on = localStorage.getItem('attic_snd') !== '0'; } catch (e) {}
    function unlock() {
      if (ctx) { if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} } return ctx; }
      try { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
        ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.45; master.connect(ctx.destination); } catch (e) { ctx = null; }
      return ctx;
    }
    function tone(f0, f1, dur, type, vol, t0) {
      if (!ctx) return; var o = ctx.createOscillator(), g = ctx.createGain(), t = (t0 != null ? t0 : ctx.currentTime);
      o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
    }
    function noise(dur, vol, kind, freq, t0) {
      if (!ctx) return;
      if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) { var n = Math.floor(ctx.sampleRate * 0.6), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), i; for (i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; noiseBuf = b; }
      var src = ctx.createBufferSource(); src.buffer = noiseBuf; var f = ctx.createBiquadFilter(); f.type = kind || 'lowpass'; f.frequency.value = freq || 900; if (kind === 'bandpass') f.Q.value = 1.2;
      var g = ctx.createGain(), t = (t0 != null ? t0 : ctx.currentTime); g.gain.setValueAtTime(vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + dur + 0.03);
    }
    var GRADE_NOTES = { 'TRASHED': [], 'PLAYED': [392], 'GOOD': [440], 'FINE': [523, 659], 'NEAR MINT': [523, 659, 784], 'MINT': [523, 659, 784, 1047] };
    var cues = {
      tap: function () { tone(700, 500, 0.045, 'sine', 0.14); },
      rummage: function () { var t = ctx.currentTime; noise(0.22, 0.28, 'lowpass', 900, t); noise(0.18, 0.18, 'lowpass', 600, t + 0.16); tone(180, 120, 0.12, 'sine', 0.12, t + 0.05); },
      wipe: function () { var t = ctx.currentTime; noise(0.55, 0.22, 'bandpass', 1800, t); noise(0.4, 0.14, 'bandpass', 2600, t + 0.3); },
      plate: function (grade) {
        var t = ctx.currentTime, notes = GRADE_NOTES[grade] || [440], i;
        if (!notes.length) { noise(0.25, 0.3, 'lowpass', 300, t); tone(90, 50, 0.3, 'sine', 0.3, t); return; }
        for (i = 0; i < notes.length; i++) tone(notes[i], 0, 0.22, 'triangle', 0.18, t + i * 0.1);
      },
      sealed: function () { var t = ctx.currentTime, i, f = [523, 659, 784, 1047, 1319]; for (i = 0; i < 5; i++) tone(f[i], 0, 0.3, 'triangle', 0.18, t + i * 0.1); for (i = 0; i < 4; i++) tone(1800 + i * 300, 3200 + i * 200, 0.6, 'sine', 0.05, t + 0.4 + i * 0.05); noise(0.5, 0.05, 'highpass', 4000, t + 0.4); },
      dust: function () { noise(0.09, 0.16, 'bandpass', 1400); },
      stub: function () { var t = ctx.currentTime; noise(0.05, 0.2, 'highpass', 2500, t); tone(1568, 0, 0.18, 'sine', 0.16, t + 0.02); tone(2093, 0, 0.22, 'sine', 0.1, t + 0.1); },
      scrap: function () { var t = ctx.currentTime; noise(0.3, 0.3, 'lowpass', 1200, t); noise(0.15, 0.2, 'lowpass', 700, t + 0.12); },
      want: function () { var t = ctx.currentTime; tone(1319, 0, 0.3, 'sine', 0.18, t); tone(1760, 0, 0.4, 'sine', 0.14, t + 0.14); },
      flip: function () { noise(0.05, 0.3, 'highpass', 1800); tone(320, 200, 0.05, 'sine', 0.1); }
    };
    function play(name, arg) {
      var c = cues[name]; if (!c) return false;
      if (name === 'dust') { var now = Date.now(); if (now - lastDust < 110) return true; lastDust = now; }
      log.push(name); if (log.length > 80) log.shift();
      if (!on) return true;
      if (!unlock()) return true;
      try { c(arg); } catch (e) {}
      return true;
    }
    function toggle() { on = !on; try { localStorage.setItem('attic_snd', on ? '1' : '0'); } catch (e) {} if (on) play('tap'); return on; }
    function render(name, arg, done) {
      var c = cues[name]; if (!c) { done(-1); return; }
      var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC) { done(-1); return; }
      var sc = ctx, sm = master, sn = noiseBuf;
      try {
        ctx = new OAC(1, 44100, 44100); master = ctx.createGain(); master.gain.value = 0.45; master.connect(ctx.destination); noiseBuf = null;
        c(arg);
        var o = ctx; ctx = sc; master = sm; noiseBuf = sn;
        o.startRendering().then(function (buf) { var d = buf.getChannelData(0), i, sum = 0; for (i = 0; i < d.length; i++) sum += d[i] * d[i]; done(Math.sqrt(sum / d.length)); }, function () { done(-1); });
      } catch (e) { ctx = sc; master = sm; noiseBuf = sn; done(-1); }
    }
    try { document.addEventListener('touchstart', function () { unlock(); }, { passive: true }); document.addEventListener('pointerdown', function () { unlock(); }); } catch (e) {}
    return { play: play, toggle: toggle, on: function () { return on; }, unlock: unlock, cues: cues, log: log, reset: function () { log.length = 0; }, ctxRef: function () { return ctx; }, render: render };
  })();
  window.ATTIC_SFX = SFX;
  document.addEventListener('click', function (e) { var t = e.target; while (t && t !== document) { if (t.tagName === 'BUTTON') { SFX.play('tap'); break; } t = t.parentNode; } }, true);

  function wipeReveal(slot, h, size) {
    if (!slot) return;
    wipeSettle();
    SFX.play('wipe');""")
rep("""    saveWallet(); paintWallet();
    show(randHash());""", """    saveWallet(); paintWallet();
    show(randHash());
    SFX.play('rummage');""")
rep("""  function payForReveal(h, it) {""", """  function payForReveal(h, it) {
    /* the sting lands when the cloth is done, which is when the plate appears */
    setTimeout(function () { SFX.play(it.grade === 'FACTORY SEALED' ? 'sealed' : 'plate', it.grade); }, 900);""")
rep("""  function dustErase(D, x0, y0, x1, y1, stroke) {""", """  function dustErase(D, x0, y0, x1, y1, stroke) {
    SFX.play('dust');""")
rep("""    if (changed) document.getElementById('dustFound').textContent = D.found;""",
    """    if (changed) { document.getElementById('dustFound').textContent = D.found; SFX.play('stub'); }""")
rep("""    var paid = E.payScrap(WAL); saveWallet(); paintWallet();
    toast(paid ? 'Back in the pile. That is one ticket.'""",
    """    var paid = E.payScrap(WAL); saveWallet(); paintWallet();
    SFX.play('scrap');
    toast(paid ? 'Back in the pile. That is one ticket.'""")
rep("""      toast('WANT LIST: ' + hit[0] + '. Crossed off, plus ' + paid + ' tickets.', 4200);""",
    """      toast('WANT LIST: ' + hit[0] + '. Crossed off, plus ' + paid + ' tickets.', 4200);
      SFX.play('want');""")
rep("""    this.className = this.className.indexOf('flipped') >= 0 ? 'fcFlip' : 'fcFlip flipped';""",
    """    this.className = this.className.indexOf('flipped') >= 0 ? 'fcFlip' : 'fcFlip flipped';
    SFX.play('flip');""")
# the chip
rep("""  <div class="backrow"><button class="backchip" id="swsBack" type="button" aria-label="Back to the arcade">&#8249; BACK TO THE ARCADE</button></div>""",
    """  <div class="backrow"><button class="backchip" id="swsBack" type="button" aria-label="Back to the arcade">&#8249; BACK TO THE ARCADE</button><button class="backchip" id="sndBtn" type="button" aria-label="Sound on or off">SOUND ON</button></div>""")
rep("""  .backchip:active { background:#2a2016; color:#d9a94e; }""",
    """  .backchip:active { background:#2a2016; color:#d9a94e; }
  #sndBtn { margin-left:auto; }
  #sndBtn.off { color:#5e5240; text-decoration:line-through; }""")
rep("""  document.getElementById('wantOpen').onclick = function () { paintWants(); document.getElementById('wantSheet').className = 'sheet on'; };""",
    """  function paintSnd() { var b = document.getElementById('sndBtn'); if (!b) return; b.textContent = SFX.on() ? 'SOUND ON' : 'SOUND OFF'; b.className = 'backchip' + (SFX.on() ? '' : ' off'); }
  document.getElementById('sndBtn').onclick = function () { SFX.toggle(); paintSnd(); };
  paintSnd();
  document.getElementById('wantOpen').onclick = function () { paintWants(); document.getElementById('wantSheet').className = 'sheet on'; };""")
rep("""    window.ATTIC_DEV = {""", """    window.ATTIC_DEV = {
      sfx: SFX,""")
open(P,'w').write(s); print('attic sound patched')

C='/workspaces/lucid-winds/satellites/attic/check.js'
s=open(C).read()
anchor="    group('persistence survives a reload');"
assert s.count(anchor)==1
s=s.replace(anchor, r"""    group('sound: every beat has a cue, every cue moves air, the chip mutes it');
    const snd = await page.evaluate(async () => {
      const S = window.ATTIC_SFX, D = window.ATTIC_DEV; const wait = ms => new Promise(r => setTimeout(r, ms));
      S.reset();
      const names = Object.keys(S.cues);
      const rms = {};
      for (const n of names) rms[n] = await new Promise(res => S.render(n, n === 'plate' ? 'GOOD' : undefined, res));
      rms['plate TRASHED'] = await new Promise(res => S.render('plate', 'TRASHED', res));
      rms['plate MINT'] = await new Promise(res => S.render('plate', 'MINT', res));
      const silent = Object.keys(rms).filter(k => !(rms[k] > 0.002));
      /* the beats from the real paths */
      D.setTix(30);
      document.getElementById('go').click(); const rummage = S.log.indexOf('rummage') >= 0 && S.log.indexOf('tap') >= 0;
      document.getElementById('gb').click(); await wait(1300); const wipe = S.log.indexOf('wipe') >= 0, sting = S.log.indexOf('plate') >= 0 || S.log.indexOf('sealed') >= 0;
      D.dustOpen(); const st = D.dustState(); D.dustStroke(0, st.h / 2, st.w, st.h / 2); const dust = S.log.indexOf('dust') >= 0;
      D.dustSweeps(40); const stub = S.log.indexOf('stub') >= 0; D.dustEnd();
      /* the chip */
      const chip = document.getElementById('sndBtn'); const r = chip.getBoundingClientRect();
      const label1 = chip.textContent; chip.click(); const off = !S.on(); const stored = localStorage.getItem('attic_snd'); const label2 = chip.textContent;
      S.reset(); document.getElementById('wantOpen').click(); document.getElementById('wantClose').click(); const loggedWhileOff = S.log.indexOf('tap') >= 0;
      chip.click(); const back = S.on();
      return { cues: names.length, silent, rummage, wipe, sting, dust, stub, chipH: Math.round(r.height), label1, label2, off, stored, loggedWhileOff, back, ctx: !!S.ctxRef() };
    });
    ok('a cue for every beat of the attic', snd.cues >= 10, snd.cues);
    ok('every cue moves air when bounced offline, the plate at three grades too', snd.silent.length === 0, snd.silent.join(', '));
    ok('a rummage, a wipe and its plate sting, a dust stroke and a stub each speak from the real path', snd.rummage && snd.wipe && snd.sting && snd.dust && snd.stub, JSON.stringify({ rummage: snd.rummage, wipe: snd.wipe, sting: snd.sting, dust: snd.dust, stub: snd.stub }));
    ok('the SOUND chip mutes, remembers and unmutes, at 48px', snd.chipH >= 48 && snd.label1 === 'SOUND ON' && snd.label2 === 'SOUND OFF' && snd.off && snd.stored === '0' && snd.back, JSON.stringify({ h: snd.chipH, l1: snd.label1, l2: snd.label2, stored: snd.stored }));
    ok('muted still logs the beat: the mute is at the speaker', snd.loggedWhileOff);
    ok('an AudioContext exists after the first beat', snd.ctx);

"""+anchor)
open(C,'w').write(s); print('gate patched')
