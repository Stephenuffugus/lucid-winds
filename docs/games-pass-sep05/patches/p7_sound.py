P='/workspaces/Litter_Bug/index.html'
s=open(P).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)

# ── the synth, ahead of everything else in the main script ──
rep("var VW=540, VH=960, BUILD='v1.1';",
r"""var VW=540, VH=960, BUILD='v1.1';

/* ==========================================================================
   SOUND. A WebAudio synth, no files: every beat of the alley has a cue (a tap, a
   piece on the belt, a right bin, a wrong bin, a lid popping, a clean run of wire,
   the clean shift fanfare, the jar opening, a hit and a crit in the dumpster).
   Unlocked on the first touch, muted with the pill on the home screen, the
   choice kept in lb_snd. `log` is what fired, so a gate can read the beats
   without ears; `render(name)` bounces one cue offline and returns its RMS so
   the gate can also prove each cue makes air move.
   ========================================================================== */
var LB_SFX=(function(){
  var ctx=null, master=null, on=true, log=[], noiseBuf=null;
  try{ on=localStorage.getItem('lb_snd')!=='0'; }catch(e){}
  function unlock(){
    if(ctx){ if(ctx.state==='suspended'){ try{ ctx.resume(); }catch(e){} } return ctx; }
    try{ var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null;
      ctx=new AC(); master=ctx.createGain(); master.gain.value=0.5; master.connect(ctx.destination); }catch(e){ ctx=null; }
    return ctx;
  }
  function tone(f0,f1,dur,type,vol,t0){
    if(!ctx) return; var o=ctx.createOscillator(), g=ctx.createGain(), t=(t0!=null?t0:ctx.currentTime);
    o.type=type||'sine'; o.frequency.setValueAtTime(f0,t); if(f1) o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.3,t+0.008); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+0.03);
  }
  function noise(dur,vol,hp,t0){
    if(!ctx) return;
    if(!noiseBuf||noiseBuf.sampleRate!==ctx.sampleRate){ var n=Math.floor(ctx.sampleRate*0.5), b=ctx.createBuffer(1,n,ctx.sampleRate), d=b.getChannelData(0), i; for(i=0;i<n;i++) d[i]=Math.random()*2-1; noiseBuf=b; }
    var src=ctx.createBufferSource(); src.buffer=noiseBuf; var f=ctx.createBiquadFilter(); f.type=hp?'highpass':'lowpass'; f.frequency.value=hp||900;
    var g=ctx.createGain(), t=(t0!=null?t0:ctx.currentTime); g.gain.setValueAtTime(vol||0.2,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t+dur+0.03);
  }
  var cues={
    tick:  function(){ tone(900,700,0.05,'sine',0.16); },
    belt:  function(){ noise(0.05,0.07,2500); },
    good:  function(){ var t=ctx.currentTime; tone(660,0,0.07,'triangle',0.2,t); tone(990,0,0.09,'triangle',0.18,t+0.06); },
    bad:   function(){ tone(160,110,0.16,'square',0.12); },
    pry:   function(){ noise(0.08,0.25,400); tone(1400,500,0.09,'sine',0.18); },
    wire:  function(){ var t=ctx.currentTime; tone(523,0,0.1,'triangle',0.18,t); tone(659,0,0.1,'triangle',0.18,t+0.09); tone(784,0,0.16,'triangle',0.2,t+0.18); },
    clean: function(){ var t=ctx.currentTime, i, f=[523,659,784,1047]; for(i=0;i<4;i++) tone(f[i],0,0.22,'triangle',0.2,t+i*0.11); noise(0.4,0.05,3000,t+0.3); },
    over:  function(){ var t=ctx.currentTime; tone(440,0,0.18,'triangle',0.16,t); tone(330,0,0.3,'triangle',0.14,t+0.16); },
    stamp: function(){ tone(1568,1245,0.25,'sine',0.18); },
    jar:   function(){ var t=ctx.currentTime, i; for(i=0;i<5;i++) tone(400+i*160,800+i*220,0.5,'sine',0.07,t+i*0.07); noise(0.5,0.04,4000,t); },
    hit:   function(){ noise(0.12,0.3,0); tone(120,60,0.12,'sine',0.28); },
    crit:  function(){ noise(0.2,0.4,0); tone(90,40,0.2,'sine',0.32); tone(1200,300,0.15,'square',0.07); },
    dot:   function(){ tone(300,200,0.08,'sine',0.1); },
    'break': function(){ noise(0.25,0.3,900); tone(500,80,0.25,'sawtooth',0.1); },
    win:   function(){ var t=ctx.currentTime, i, f=[392,523,659,784,1047]; for(i=0;i<5;i++) tone(f[i],0,0.2,'triangle',0.18,t+i*0.09); },
    lose:  function(){ var t=ctx.currentTime, i, f=[392,349,311,262]; for(i=0;i<4;i++) tone(f[i],0,0.24,'triangle',0.14,t+i*0.14); }
  };
  function play(name){
    var c=cues[name]; if(!c) return false;
    log.push(name); if(log.length>80) log.shift();
    if(!on) return true;
    if(!unlock()) return true;
    try{ c(); }catch(e){}
    return true;
  }
  function toggle(){ on=!on; try{ localStorage.setItem('lb_snd', on?'1':'0'); }catch(e){} if(on) play('tick'); return on; }
  /* bounce one cue through an offline context and report its RMS: proof of air, not of a call */
  function render(name, done){
    var c=cues[name]; if(!c){ done(-1); return; }
    var OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext; if(!OAC){ done(-1); return; }
    var saveCtx=ctx, saveMaster=master, saveNoise=noiseBuf;
    try{
      ctx=new OAC(1, 44100*0.8, 44100); master=ctx.createGain(); master.gain.value=0.5; master.connect(ctx.destination); noiseBuf=null;
      c();
      var o=ctx; ctx=saveCtx; master=saveMaster; noiseBuf=saveNoise;
      o.startRendering().then(function(buf){ var d=buf.getChannelData(0), i, sum=0; for(i=0;i<d.length;i++) sum+=d[i]*d[i]; done(Math.sqrt(sum/d.length)); }, function(){ done(-1); });
    }catch(e){ ctx=saveCtx; master=saveMaster; noiseBuf=saveNoise; done(-1); }
  }
  try{
    document.addEventListener('touchstart', function(){ unlock(); }, {passive:true});
    document.addEventListener('pointerdown', function(){ unlock(); });
  }catch(e){}
  return { play:play, toggle:toggle, on:function(){ return on; }, unlock:unlock, cues:cues, log:log,
    reset:function(){ log.length=0; }, ctxRef:function(){ return ctx; }, render:render };
})();
window.LB_SFX=LB_SFX;
/* every button is a tick; the beats below add their own voice on top */
document.addEventListener('click', function(e){ var t=e.target; while(t&&t!==document){ if(t.classList&&t.classList.contains('btn')){ LB_SFX.play('tick'); break; } t=t.parentNode; } }, true);""")

# ── the beats ──
rep("  if(p.mat===k){ bump(1); puff(p.el, '#6fd08c'); }\n  else { bump(-1); puff(p.el, '#c4543e'); toast('Wrong bin'); }",
    "  if(p.mat===k){ bump(1); puff(p.el, '#6fd08c'); LB_SFX.play('good'); }\n  else { bump(-1); puff(p.el, '#c4543e'); toast('Wrong bin'); LB_SFX.play('bad'); }")
rep("  if(isGrub){ bump(2); puff(el,'#6fd08c'); if(!G.over) grubRound(); }\n  else { bump(-1); puff(el,'#c4543e'); toast('Just junk'); }",
    "  if(isGrub){ bump(2); puff(el,'#6fd08c'); LB_SFX.play('good'); if(!G.over) grubRound(); }\n  else { bump(-1); puff(el,'#c4543e'); toast('Just junk'); LB_SFX.play('bad'); }")
rep("    G.lids++; bump(3);\n", "    G.lids++; bump(3); LB_SFX.play('pry');\n")
rep("    bump(-1);\n    G.zone=Math.min(0.34, G.zone*1.10);", "    bump(-1); LB_SFX.play('bad');\n    G.zone=Math.min(0.34, G.zone*1.10);")
rep("  if(wireCrossings()===0){ bump(6); toast('Clean run'); if(!G.over) wireRound(); }",
    "  if(wireCrossings()===0){ bump(6); toast('Clean run'); LB_SFX.play('wire'); if(!G.over) wireRound(); }")
rep("  var el=document.createElement('div'); el.className='falling';", "  LB_SFX.play('belt');\n  var el=document.createElement('div'); el.className='falling';")
rep("  $('d-head').textContent = clean ? 'CLEAN SHIFT' : 'SHIFT OVER';",
    "  $('d-head').textContent = clean ? 'CLEAN SHIFT' : 'SHIFT OVER';\n  LB_SFX.play(clean ? 'clean' : 'over'); if(stamped) setTimeout(function(){ LB_SFX.play('stamp'); }, 600);")
rep("  $('m-kicker').textContent='SPECIMEN '+((SAVE.dex||[]).length+1);\n  var gl=growthLeft(gr,1);",
    "  $('m-kicker').textContent='SPECIMEN '+((SAVE.dex||[]).length+1);\n  LB_SFX.play('jar');\n  var gl=growthLeft(gr,1);")
rep("      hitFlash(tb, e.crit?'crit':'hit'); dmgPop(tb, '-'+e.dmg);",
    "      hitFlash(tb, e.crit?'crit':'hit'); dmgPop(tb, '-'+e.dmg); LB_SFX.play(e.crit?'crit':'hit');")
rep("      var db=boxes[e.side]; dmgPop(db, '-'+e.dmg); updateBars(db, e.side==='a'?st.a:st.b);",
    "      var db=boxes[e.side]; dmgPop(db, '-'+e.dmg); updateBars(db, e.side==='a'?st.a:st.b); LB_SFX.play('dot');")
rep("      var bb=boxes[e.side]; bb.classList.remove('brk'); void bb.offsetWidth; bb.classList.add('brk');",
    "      var bb=boxes[e.side]; bb.classList.remove('brk'); void bb.offsetWidth; bb.classList.add('brk'); LB_SFX.play('break');")
rep("  var st=AR.st, k=kingState(), won=(!st.draw && st.winner==='a');\n  var head, note='', me=(SAVE.dex||[])[AR.dexIdx];",
    "  var st=AR.st, k=kingState(), won=(!st.draw && st.winner==='a');\n  var head, note='', me=(SAVE.dex||[])[AR.dexIdx];\n  LB_SFX.play(won ? 'win' : 'lose');")

# ── the pill ──
rep('    <div class="exitpill" id="b-exit">◀ Sky Wolf Studio Arcade</div>',
    '    <div class="exitpill" id="b-exit">◀ Sky Wolf Studio Arcade</div>\n    <button class="sndpill" id="b-snd" type="button">SOUND ON</button>')
rep(".stamp{position:absolute;right:12px;bottom:14px;z-index:60;font-size:12px;color:#3d4956}",
    ".stamp{position:absolute;right:12px;bottom:92px;z-index:60;font-size:12px;color:#3d4956}\n"
    "/* the sound pill sits where the stamp sat; 72 tall for the same reason as the exit pill */\n"
    ".sndpill{position:absolute;right:12px;bottom:12px;z-index:60;height:72px;padding:0 18px;border-radius:26px;border:1px solid var(--line);\n"
    "  background:#0f151bdd;color:var(--dim);font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}\n"
    ".sndpill.off{color:#3d4956;text-decoration:line-through}")
rep("$('b-exit').onclick=function(){ window.SWS_EXIT(); };",
    "$('b-exit').onclick=function(){ window.SWS_EXIT(); };\n"
    "function paintSnd(){ var b=$('b-snd'); if(!b) return; b.textContent = LB_SFX.on() ? 'SOUND ON' : 'SOUND OFF'; b.classList.toggle('off', !LB_SFX.on()); }\n"
    "$('b-snd').onclick=function(){ LB_SFX.toggle(); paintSnd(); };\n"
    "paintSnd();")
rep("    plan:BUG_ENGINE.bugPlan, svg:bugSVG, openSpec:openSpec, renderCard:renderBugCard,",
    "    plan:BUG_ENGINE.bugPlan, svg:bugSVG, openSpec:openSpec, renderCard:renderBugCard, sfx:LB_SFX,")
open(P,'w').write(s); print('sound patched')

C='/workspaces/Litter_Bug/check.js'
s=open(C).read()
anchor="    // ══ A CORRUPT SAVE ════════════════════════════════════════════════\n"
assert s.count(anchor)==1
s=s.replace(anchor, r"""    // ══ SOUND ═════════════════════════════════════════════════════════
    group('sound: every beat has a cue, every cue moves air, the pill mutes it');
    const sndPage = await open(FILE + '?lbtest=1');
    const snd = await sndPage.evaluate(async () => {
      const S = window.LB_SFX, D = window.LB_DEV; const wait = ms => new Promise(r => setTimeout(r, ms));
      D.reset(); S.reset();
      const names = Object.keys(S.cues);
      /* every cue bounced offline: RMS above the floor or it is a call with no sound behind it */
      const rms = {}; for (const n of names) rms[n] = await new Promise(res => S.render(n, res));
      const silent = names.filter(n => !(rms[n] > 0.002));
      /* the beats fire from the game's own paths */
      document.getElementById('b-dex').click(); const tick = S.log.indexOf('tick') >= 0; D.show('s-home');
      D.startJob('sort'); await wait(300); D.bump(3); D.endJob(); const over = S.log.indexOf('over') >= 0;
      D.startJob('pry'); await wait(300); for (let i = 0; i < 40 && !D.state().over; i++) D.bump(2); const clean = S.log.indexOf('clean') >= 0;
      D.setShinies(D.mintCost); await D.doMint(); const jar = S.log.indexOf('jar') >= 0; D.keep();
      /* the pill */
      const pill = document.getElementById('b-snd'); const r = pill.getBoundingClientRect();
      const label1 = pill.textContent; pill.click(); const off = !S.on(); const stored = localStorage.getItem('lb_snd'); const label2 = pill.textContent;
      S.reset(); document.getElementById('b-dex').click(); const loggedWhileOff = S.log.indexOf('tick') >= 0; D.show('s-home');
      pill.click(); const back = S.on();
      return { cues: names.length, silent, tick, over, clean, jar, pillH: r.height, pillW: r.width, label1, label2, off, stored, loggedWhileOff, back, ctx: !!S.ctxRef() };
    });
    await sndPage.close();
    ok(snd.cues >= 14, 'a cue for every beat of the alley and the dumpster', snd.cues);
    ok(snd.silent.length === 0, 'every cue moves air when bounced offline', snd.silent);
    ok(snd.tick && snd.over && snd.clean && snd.jar, 'a button, a shift ending, a clean shift and the jar each speak from the real path', { tick: snd.tick, over: snd.over, clean: snd.clean, jar: snd.jar });
    ok(snd.pillH >= 48 && snd.label1 === 'SOUND ON' && snd.label2 === 'SOUND OFF' && snd.off && snd.stored === '0' && snd.back, 'the SOUND pill mutes, remembers, and unmutes', { pillH: snd.pillH, label1: snd.label1, label2: snd.label2, stored: snd.stored });
    ok(snd.loggedWhileOff, 'muted still logs the beat (the mute is at the speaker, not the game)', snd.loggedWhileOff);
    ok(snd.ctx, 'an AudioContext exists after the first beat', snd.ctx);

"""+anchor)
open(C,'w').write(s); print('gate patched')
