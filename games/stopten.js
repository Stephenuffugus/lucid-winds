// ═══ LUCID WINDS — Stop at Ten (reflex timing) ═══
//
// Researched from similar precision-timing games (r/gamedev, reaction
// testers, JP arcade "Perfect 10" variants, Asian timing-game threads):
// - CLASSIC: visible ticker, stop at 10.00 (original mode)
// - BLIND: timer hidden while running, internal clock only (Stephen's ask)
// - HEARTBEAT: audio pulse every second, stop at the 10th beat
// - LADDER: target climbs 5 → 7 → 10 → 13 → 17 → 20 across 5 attempts
//
// Framed game area with a decorative border, a cute seed "buddy" that
// reacts to your result, per-mode stats, and a rules book.
// Art swap-in: replace the inline SVG in BUDDY with `<img src="…">` to
// drop in custom artwork. Three expressions: idle, focused, happy/sad.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

// Inject styles once
if(!document.getElementById('STstyle')){
  var stStyle=document.createElement('style');stStyle.id='STstyle';
  stStyle.textContent=[
    // Top-padding: only enough to clear the safe-area inset; the .game-hdr
    // sticky band (back-btn + rules-btn) handles its own spacing now. The
    // old 78px override created a dead zone ABOVE the header on this game.
    'body.game-active:has(#fg-ag[data-game="stopten"]) #fg-ag{padding-top:env(safe-area-inset-top,0px)!important;}',
    // Universal .gb-new is now 54x54 (matches .gb 48px sibling height).
    // Keep the .gcr gap/padding tighten since Stop at Ten's row is dense.
    'body.game-active:has(#fg-ag[data-game="stopten"]) .gcr .gb{min-height:48px!important;padding:8px 14px!important;font-size:0.68rem!important;letter-spacing:0.08em!important;}',
    'body.game-active:has(#fg-ag[data-game="stopten"]) .gcr{gap:6px!important;padding:4px 8px!important;align-items:center!important;}',
    // Frame + panel
    '#STpan{padding-top:4px;box-sizing:border-box;max-width:100%;overflow-x:hidden;}',
    '.st-frame{position:relative;width:calc(100% - 24px);max-width:360px;box-sizing:border-box;margin:8px auto;padding:18px 16px 20px;background:linear-gradient(180deg,rgba(28,34,22,0.9),rgba(16,20,12,0.96));border:3px solid transparent;border-radius:18px;box-shadow:0 14px 36px rgba(0,0,0,0.55),inset 0 2px 0 rgba(255,220,140,0.06),inset 0 -2px 6px rgba(0,0,0,0.3);background-clip:padding-box;}',
    // Decorative gradient border drawn INSIDE the frame footprint
    // (inset:0 rather than -3px). Previously the pseudo stuck 3px out
    // of the element and clipped against the viewport on narrow
    // phones. Now the whole frame fits cleanly inside its own box.
    '.st-frame::before{content:"";position:absolute;inset:0;border-radius:18px;padding:3px;background:linear-gradient(135deg,#c8a84b,#7ab356 45%,#3b2a14 90%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}',
    '.st-frame::after{content:"";position:absolute;inset:4px;border-radius:14px;pointer-events:none;box-shadow:inset 0 0 30px rgba(200,168,75,0.08);}',
    // Corner leaf ornaments (pure CSS — simple radial dots)
    '.st-corner{position:absolute;width:14px;height:14px;z-index:2;pointer-events:none;background:radial-gradient(circle,#c8a84b 0%,transparent 65%);opacity:0.7;}',
    '.st-c-tl{top:2px;left:2px}.st-c-tr{top:2px;right:2px}.st-c-bl{bottom:2px;left:2px}.st-c-br{bottom:2px;right:2px}',
    // Clock
    '.st-clock{font-family:DM Mono,monospace;font-size:clamp(3rem,13vw,4.4rem);font-weight:500;letter-spacing:0.04em;margin:8px 0;text-shadow:0 0 20px rgba(200,168,75,0.25);transition:color 0.15s,transform 0.15s;}',
    '.st-clock.blind{color:rgba(200,168,75,0.15);letter-spacing:0.35em;}',
    '.st-clock.running{color:var(--gold);}',
    '.st-clock.idle{color:var(--cream);}',
    // Buddy character
    '.st-buddy{width:74px;height:74px;margin:0 auto 4px;position:relative;animation:stBuddyIdle 3.6s ease-in-out infinite;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);}',
    '.st-buddy.focused{animation:none;transform:scale(0.94);}',
    '.st-buddy.happy{animation:stBuddyBounce 0.6s ease;}',
    '.st-buddy.sad{animation:stBuddyShake 0.6s ease;}',
    '@keyframes stBuddyIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}',
    '@keyframes stBuddyBounce{0%,100%{transform:translateY(0) scale(1)}35%{transform:translateY(-10px) scale(1.15)}70%{transform:translateY(2px) scale(0.95)}}',
    '@keyframes stBuddyShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px) rotate(-3deg)}60%{transform:translateX(4px) rotate(3deg)}}',
    // Buttons
    '.st-btn-row{display:flex;gap:8px;justify-content:center;padding:6px 0;flex-wrap:wrap;}',
    '.st-btn{min-width:140px;min-height:60px;padding:12px 24px;font-family:Bebas Neue,sans-serif;font-size:1.05rem;letter-spacing:0.14em;border-radius:12px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.4);-webkit-tap-highlight-color:transparent;transition:transform 0.1s ease,box-shadow 0.15s ease;border-width:2px;border-style:solid;}',
    '.st-btn:active{transform:translateY(1px) scale(0.97);}',
    '.st-btn.start{background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.22));border-color:var(--sage);color:var(--sage);}',
    '.st-btn.stop{background:linear-gradient(180deg,rgba(200,168,75,0.32),rgba(180,140,50,0.22));border-color:var(--gold);color:var(--gold);box-shadow:0 4px 18px rgba(200,168,75,0.35);}',
    // Mode tabs — horizontally scroll on narrow screens so all 9 fit.
    // Width-matched to .st-frame (max-width:360px;margin:0 auto) so the
    // chip row and frame share the same left/right edges. Without this,
    // chips spanned the full panel while the frame was inset 360→full —
    // reads as off-center even though both are technically centered.
    '.st-modes{display:flex;gap:4px;padding:2px 0 10px;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;width:calc(100% - 24px);max-width:360px;margin:0 auto;box-sizing:border-box;}',
    '.st-modes::-webkit-scrollbar{display:none;}',
    '.st-mode{padding:6px 12px;min-height:36px;font-family:DM Mono,monospace;font-size:0.62rem;letter-spacing:0.08em;background:rgba(26,31,23,0.6);border:1px solid rgba(122,179,86,0.22);border-radius:6px;color:rgba(232,220,200,0.7);cursor:pointer;transition:background 0.18s,border-color 0.18s,color 0.18s;flex:0 0 auto;white-space:nowrap;}',
    '.st-mode.on{background:rgba(200,168,75,0.18);border-color:var(--gold);color:var(--gold);}',
    // Result + stats
    '.st-result{min-height:58px;margin-top:14px;}',
    '.st-tier{font-family:Bebas Neue,sans-serif;font-size:1.4rem;letter-spacing:0.12em;animation:stFadeIn 0.3s ease;}',
    '@keyframes stFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
    '.st-delta{font-family:DM Mono,monospace;font-size:0.75rem;color:var(--cream);opacity:0.8;margin-top:4px;}',
    '.st-reward{font-family:DM Mono,monospace;font-size:0.68rem;color:var(--gold);margin-top:4px;}',
    '.st-stats{display:flex;justify-content:center;gap:14px;padding:2px 0;font-family:DM Mono,monospace;font-size:0.62rem;color:rgba(232,220,200,0.72);letter-spacing:0.06em;}',
    '.st-stats strong{color:var(--gold);}',
    '.st-attempts{font-family:DM Mono,monospace;font-size:0.6rem;color:var(--muted);letter-spacing:0.08em;margin-bottom:2px;}',
    '.st-target{font-family:Cormorant Garamond,serif;font-style:italic;font-size:0.88rem;color:rgba(200,168,75,0.88);margin-bottom:4px;}',
    // Rules modal
    '#STrulesOV{position:fixed;inset:0;z-index:200000;background:rgba(5,8,4,0.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;animation:stFadeIn 0.25s ease;}',
    '#STrulesOV .card{max-width:400px;width:100%;max-height:84vh;overflow-y:auto;padding:22px 20px;background:linear-gradient(180deg,rgba(18,22,14,0.98),rgba(10,12,8,0.98));border:1.5px solid rgba(200,168,75,0.35);border-radius:14px;box-shadow:0 32px 64px rgba(0,0,0,0.7);font-family:DM Mono,monospace;color:var(--cream);font-size:0.72rem;line-height:1.6;}',
    '#STrulesOV h2{font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.14em;color:var(--gold);border-bottom:1px solid rgba(200,168,75,0.3);margin:14px 0 8px;padding-bottom:4px;}'
  ].join('');
  document.head.appendChild(stStyle);
}

// Cute seed-sprout buddy (swap for <img src="assets/games/stopten/buddy.png">
// whenever Stephen ships art). Three faces: idle (default), focused
// (eyes closed, concentrating), happy (smile + sparkle), sad (frown).
function BUDDY(face){
  face=face||'idle';
  var eyes;
  if(face==='focused')eyes='<path d="M18 32 q4 -2 8 0" stroke="#2a1f0a" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M46 32 q4 -2 8 0" stroke="#2a1f0a" stroke-width="2" stroke-linecap="round" fill="none"/>';
  else if(face==='happy')eyes='<path d="M18 30 q4 -3 8 0" stroke="#2a1f0a" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M46 30 q4 -3 8 0" stroke="#2a1f0a" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
  else if(face==='sad')eyes='<circle cx="22" cy="32" r="2.2" fill="#2a1f0a"/><circle cx="50" cy="32" r="2.2" fill="#2a1f0a"/>';
  else eyes='<circle cx="22" cy="30" r="2.4" fill="#2a1f0a"/><circle cx="50" cy="30" r="2.4" fill="#2a1f0a"/>';
  var mouth;
  if(face==='happy')mouth='<path d="M28 42 q8 8 16 0" stroke="#2a1f0a" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
  else if(face==='sad')mouth='<path d="M28 46 q8 -6 16 0" stroke="#2a1f0a" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
  else if(face==='focused')mouth='<path d="M30 44 h12" stroke="#2a1f0a" stroke-width="2" stroke-linecap="round"/>';
  else mouth='<path d="M28 42 q8 4 16 0" stroke="#2a1f0a" stroke-width="2" stroke-linecap="round" fill="none"/>';
  var sparkle=(face==='happy')?'<circle cx="62" cy="14" r="2" fill="#fff"/><circle cx="10" cy="18" r="1.4" fill="#fff"/>':'';
  return '<svg viewBox="0 0 72 72" width="100%" height="100%">'
    // Leaf pair at top
    +'<path d="M30 8 q-10 -4 -18 2 q6 8 18 8" fill="#4a7c35"/>'
    +'<path d="M42 8 q10 -4 18 2 q-6 8 -18 8" fill="#4a7c35"/>'
    +'<path d="M20 10 q6 0 12 6" stroke="#3a5e28" stroke-width="1" fill="none"/>'
    +'<path d="M52 10 q-6 0 -12 6" stroke="#3a5e28" stroke-width="1" fill="none"/>'
    // Body: seed pod
    +'<ellipse cx="36" cy="44" rx="26" ry="22" fill="#d4a843"/>'
    +'<ellipse cx="36" cy="42" rx="22" ry="18" fill="#e8c860"/>'
    // Face
    +eyes
    +mouth
    +'<ellipse cx="15" cy="48" rx="4" ry="3" fill="#e89a9a" opacity="0.6"/>'
    +'<ellipse cx="57" cy="48" rx="4" ry="3" fill="#e89a9a" opacity="0.6"/>'
    +sparkle
    +'</svg>';
}

window._gameFns=window._gameFns||{};
window._gameFns.stopten=function ST(a){
  var MAX_ATTEMPTS=3,AUTO_STOP_AT=25;
  var startMs=0,elapsed=0,running=false,rafId=0,attempts=0,best=Infinity;
  var sessionDone=false;
  var MODES=['classic','blind','beat','ladder','heartbeat','countdown','twostop','chaos','daily'];
  var mode='classic';
  try{var _m=localStorage.getItem('lw_st_mode');if(MODES.indexOf(_m)>=0)mode=_m;}catch(e){}
  var target=10;        // seconds
  var audioCtx=null,beatTimer=0,beatCount=0;
  var hapticTimer=0;      // heartbeat mode
  var chaosTimer=0;       // chaos mode fake-flicker scheduler
  var chaosFakeDigit='';  // currently-displayed fake value (empty = show real)
  var twostopPhase=0;     // 0 not started, 1 awaiting second stop
  var twostopDelta1=0;    // delta from 5s in twostop mode
  var stats=_loadStats();

  function _loadStats(){
    var d={w:0,l:0,streak:0,best:0};
    try{var _s=localStorage.getItem('lw_st_stats');if(_s){var _p=JSON.parse(_s);for(var _k in _p)d[_k]=_p[_k];}}catch(e){}
    return d;
  }
  function _saveStats(){try{localStorage.setItem('lw_st_stats',JSON.stringify(stats));}catch(e){}}

  ms(a,'Stop at Ten · <span id="STa">0</span>/'+MAX_ATTEMPTS+' · best <span id="STb">—</span>');
  mm(a);
  var statsRow=document.createElement('div');statsRow.className='st-stats';statsRow.id='STstats';a.appendChild(statsRow);
  var pan=document.createElement('div');pan.id='STpan';
  pan.style.cssText='max-width:440px;margin:0 auto;padding:6px;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_STR()" style="min-height:48px;padding:8px 18px;font-size:0.75rem;letter-spacing:0.1em">📖 RULES</button>'
    +'<button class="gb-new" onclick="_STN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function tiers(delta){
    if(delta<0.005)return {lbl:'PERFECT',col:'#c8a84b',face:'happy',sb:3};
    if(delta<=0.015)return {lbl:'SO CLOSE',col:'#7ab356',face:'happy',sb:2};
    if(delta<=0.035)return {lbl:'NICE',col:'#7ab356',face:'happy',sb:1};
    if(delta<=0.1)return {lbl:'CLOSE',col:'var(--cream)',face:'idle',sb:0};
    return {lbl:'MISS',col:'#c47a7a',face:'sad',sb:0};
  }
  function currentTarget(){
    if(mode==='ladder'){
      var seq=[5,7,10,13,17,20];
      return seq[attempts%seq.length];
    }
    // twostop shows target 5 for phase 0, 10 for phase 1
    if(mode==='twostop')return twostopPhase===0?5:10;
    return 10;
  }
  function _todayKey(){
    var d=new Date();
    return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
  }
  function _dailyDone(){
    try{
      var raw=localStorage.getItem('lw_st_daily');
      if(raw){var p=JSON.parse(raw);if(p.day===_todayKey())return p;}
    }catch(e){}
    return null;
  }
  function _dailyLock(result){
    try{localStorage.setItem('lw_st_daily',JSON.stringify({day:_todayKey(),best:result.best,attempts:result.attempts,tier:result.tier}));}catch(e){}
  }
  function renderStats(){
    var p=stats.w+stats.l;
    var pct=p?Math.round(stats.w/p*100):0;
    statsRow.innerHTML='mode <strong>'+mode.toUpperCase()+'</strong> · played <strong>'+p+'</strong> · hit <strong>'+pct+'%</strong> · streak <strong>'+stats.streak+'</strong> · best ±<strong>'+(stats.best?stats.best.toFixed(2)+'s':'—')+'</strong>';
  }

  function tick(){
    if(!running)return;
    elapsed=(Date.now()-startMs)/1000;
    var el=document.getElementById('STclock');
    if(el){
      if(mode==='blind'||mode==='heartbeat')el.textContent='• • •';
      else if(mode==='countdown'){
        var rem=Math.max(0,10-elapsed);
        el.textContent=rem.toFixed(2);
      }
      else if(mode==='chaos'&&chaosFakeDigit){
        el.textContent=chaosFakeDigit;
      }
      else el.textContent=elapsed.toFixed(2);
    }
    if(elapsed>=AUTO_STOP_AT){stop(true);return;}
    rafId=requestAnimationFrame(tick);
  }

  function ensureAudio(){
    if(audioCtx)return audioCtx;
    try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
    return audioCtx;
  }
  function playBeat(){
    var ac=ensureAudio();if(!ac)return;
    var t=ac.currentTime;
    var o=ac.createOscillator(),g=ac.createGain();
    o.type='sine';o.frequency.value=beatCount===9?660:440;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.22,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
    o.connect(g);g.connect(ac.destination);
    o.start(t);o.stop(t+0.13);
  }
  function startBeats(){
    beatCount=0;
    beatTimer=setInterval(function(){
      if(!running){clearInterval(beatTimer);return;}
      beatCount++;
      playBeat();
    },1000);
  }
  function startHaptics(){
    // navigator.vibrate pulse every 1s. No audio — for silent play.
    beatCount=0;
    if(!navigator.vibrate)return;
    hapticTimer=setInterval(function(){
      if(!running){clearInterval(hapticTimer);return;}
      beatCount++;
      try{navigator.vibrate(beatCount===10?150:40);}catch(e){}
    },1000);
  }
  function startChaos(){
    // Every 350-700ms flash a fake digit for 60-120ms, optionally a
    // fake beep. Keeps the player's mental clock fighting the noise.
    function sched(){
      if(!running){chaosTimer=0;return;}
      var wait=350+Math.random()*350;
      chaosTimer=setTimeout(function(){
        if(!running)return;
        // Fake value = real elapsed ± random drift
        var drift=(Math.random()-0.5)*4;
        var fake=Math.max(0,elapsed+drift);
        chaosFakeDigit=fake.toFixed(2);
        // Fake beep 40% of the time
        if(Math.random()<0.4){
          var ac=ensureAudio();
          if(ac){
            var t=ac.currentTime;
            var o=ac.createOscillator(),g=ac.createGain();
            o.type='sine';o.frequency.value=220+Math.random()*440;
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(0.12,t+0.01);
            g.gain.exponentialRampToValueAtTime(0.001,t+0.08);
            o.connect(g);g.connect(ac.destination);
            o.start(t);o.stop(t+0.1);
          }
        }
        // Flash clears after 60-120ms
        setTimeout(function(){chaosFakeDigit='';},60+Math.random()*60);
        sched();
      },wait);
    }
    sched();
  }

  function playStartChime(){
    // Three rising notes so BLIND / COUNTDOWN / TWO-STOP players hear
    // a clear 'go!' cue even when the clock is hidden. Short and
    // musical — not a harsh beep.
    var ac=ensureAudio();if(!ac)return;
    var t=ac.currentTime;
    var notes=[523.25,659.25,783.99]; // C5, E5, G5
    for(var n=0;n<notes.length;n++){
      var o=ac.createOscillator(),g=ac.createGain();
      o.type='sine';o.frequency.value=notes[n];
      var st=t+n*0.09,en=st+0.16;
      g.gain.setValueAtTime(0,st);
      g.gain.linearRampToValueAtTime(0.18,st+0.02);
      g.gain.exponentialRampToValueAtTime(0.001,en);
      o.connect(g);g.connect(ac.destination);
      o.start(st);o.stop(en+0.05);
    }
    try{if(navigator.vibrate)navigator.vibrate(20);}catch(e){}
  }

  function start(){
    if(running||sessionDone)return;
    // Daily mode: check if today's attempt was already made
    if(mode==='daily'){
      var done=_dailyDone();
      if(done){
        sm('Daily already played. Come back tomorrow.');
        return;
      }
    }
    target=currentTarget();
    startMs=Date.now();elapsed=0;running=true;
    chaosFakeDigit='';
    // Start chime — especially critical for BLIND (no clock to watch)
    // but helpful on every mode as a clear 'go!'. Skipped on BEAT
    // because the first second-tick plays at t=1s which is already a
    // cue and stacking chimes would fight.
    if(mode!=='beat')playStartChime();
    if(mode==='beat')startBeats();
    else if(mode==='heartbeat')startHaptics();
    else if(mode==='chaos')startChaos();
    render();
    tick();
  }

  function stop(autoStop){
    if(!running)return;
    // Twostop: first tap records phase-1 delta and keeps clock running.
    if(mode==='twostop'&&twostopPhase===0&&!autoStop){
      elapsed=(Date.now()-startMs)/1000;
      twostopDelta1=Math.abs(elapsed-5);
      twostopPhase=1;
      target=10;
      sm('First stop: '+elapsed.toFixed(2)+'s · now catch 10');
      _play('tap');
      // Refresh the display so the target line updates
      render();
      rafId=requestAnimationFrame(tick);
      running=true;
      return;
    }
    running=false;cancelAnimationFrame(rafId);
    if(beatTimer){clearInterval(beatTimer);beatTimer=0;}
    if(hapticTimer){clearInterval(hapticTimer);hapticTimer=0;}
    if(chaosTimer){clearTimeout(chaosTimer);chaosTimer=0;}
    chaosFakeDigit='';
    elapsed=(Date.now()-startMs)/1000;
    var delta;
    if(mode==='twostop'&&twostopPhase===1){
      var delta2=Math.abs(elapsed-10);
      delta=twostopDelta1+delta2;
      twostopPhase=0;twostopDelta1=0;
    } else {
      delta=Math.abs(elapsed-target);
    }
    var t=tiers(delta);
    attempts++;
    if(delta<best)best=delta;
    var ba=document.getElementById('STa');if(ba)ba.textContent=attempts;
    var bb=document.getElementById('STb');if(bb)bb.textContent=isFinite(best)?('±'+best.toFixed(2)+'s'):'—';
    // Reward — drip Sunbeam progress per tier
    if(t.sb>0){for(var i=0;i<t.sb;i++)_e('progress');}
    if(t.lbl==='PERFECT'){_e('game_win');_playWin();_sr('stopten',{w:true,s:Math.round(delta*1000),mode:mode});}
    else if(t.sb>0){_e('milestone');}
    // Lifetime stats — tier NICE or better counts as a hit
    if(t.sb>0){
      stats.w++;stats.streak++;
      if(!stats.best||delta<stats.best)stats.best=delta;
    } else {
      stats.l++;stats.streak=0;
    }
    _saveStats();renderStats();
    renderResult(delta,t,autoStop);
    if(autoStop)sm('Auto-stopped at '+AUTO_STOP_AT+'s · '+t.lbl);
    else sm(t.lbl+' · '+elapsed.toFixed(2)+'s (±'+delta.toFixed(2)+' from '+target+')');
    if(attempts>=MAX_ATTEMPTS){
      sessionDone=true;
      if(isFinite(best)&&best>=0.005){
        _sr('stopten',{w:false,s:Math.round(best*1000),mode:mode});
      }
      // Daily mode: lock the session for the rest of the day
      if(mode==='daily'&&isFinite(best)){
        var dTier=tiers(best);
        _dailyLock({best:best,attempts:attempts,tier:dTier.lbl});
      }
      setTimeout(function(){if(document.body.contains(pan))renderSessionSummary();},900);
    }
  }

  function modeDescription(){
    if(mode==='classic')return 'Stop the clock at exactly 10.00';
    if(mode==='blind')return 'Timer hidden · count in your head to 10';
    if(mode==='beat')return 'Stop on the 10th beat';
    if(mode==='ladder')return 'Target climbs each round';
    if(mode==='heartbeat')return 'Silent vibration pulse · stop on 10th';
    if(mode==='countdown')return 'Counts down from 10.00 · stop at zero';
    if(mode==='twostop')return 'Stop at 5.00, then again at 10.00';
    if(mode==='chaos')return 'Distractions and fakes · trust your clock';
    if(mode==='daily')return 'One session per day · shareable result';
    return '';
  }

  function render(){
    var face=running?'focused':'idle';
    var blindCls=((mode==='blind'||mode==='heartbeat')&&running)?'blind':'';
    var clkCls='st-clock '+blindCls+' '+(running?'running':'idle');
    var tgt=currentTarget();
    var tgtText;
    if(mode==='twostop')tgtText=twostopPhase===0?'First stop at 5 seconds':'Now catch 10 seconds';
    else if(mode==='countdown')tgtText='Stop when the clock hits zero';
    else tgtText='Target, '+tgt+' seconds';
    var tgtLine='<div class="st-target">'+tgtText+'</div>';
    var h='';
    // Mode tabs (horizontal scroll on narrow screens so 9 fit)
    h+='<div class="st-modes">';
    var modes=[
      ['classic','CLASSIC'],['blind','BLIND'],['beat','BEAT'],['heartbeat','HEARTBEAT'],
      ['countdown','COUNTDOWN'],['ladder','LADDER'],['twostop','TWO-STOP'],['chaos','CHAOS'],
      ['daily','📅 DAILY']
    ];
    for(var m=0;m<modes.length;m++){
      var on=modes[m][0]===mode?' on':'';
      h+='<div class="st-mode'+on+'" data-mode="'+modes[m][0]+'" onclick="_STM(\''+modes[m][0]+'\')">'+modes[m][1]+'</div>';
    }
    h+='</div>';
    // Framed play area
    h+='<div class="st-frame">';
    h+='<div class="st-corner st-c-tl"></div><div class="st-corner st-c-tr"></div><div class="st-corner st-c-bl"></div><div class="st-corner st-c-br"></div>';
    h+='<div style="font-family:Cormorant Garamond,serif;font-size:0.82rem;color:var(--muted);letter-spacing:0.04em;margin-bottom:6px;">'+modeDescription()+'</div>';
    h+=tgtLine;
    h+='<div class="st-buddy'+(running?' focused':'')+'" id="STbuddy">'+BUDDY(face)+'</div>';
    h+='<div class="st-attempts">ATTEMPT '+Math.min(attempts+1,MAX_ATTEMPTS)+' / '+MAX_ATTEMPTS+'</div>';
    h+='<div id="STclock" class="'+clkCls+'">'+(mode==='blind'&&running?'• • •':elapsed.toFixed(2))+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);opacity:0.65;margin-bottom:14px;">SECONDS</div>';
    // Daily mode: if today's attempt is locked, show the recap in place
    // of the Start button.
    var dailyLocked=false,dailyDone=null;
    if(mode==='daily'){
      dailyDone=_dailyDone();
      dailyLocked=!!dailyDone;
    }
    h+='<div class="st-btn-row">';
    if(dailyLocked){
      h+='<div style="font-family:DM Mono,monospace;font-size:0.72rem;color:var(--gold);padding:10px 14px;border:1.5px solid rgba(200,168,75,0.35);border-radius:10px;background:rgba(200,168,75,0.06);">✅ Today\'s daily: <strong>'+dailyDone.tier+'</strong> · ±'+dailyDone.best.toFixed(2)+'s<br><span style="color:var(--muted);font-size:0.58rem;letter-spacing:0.08em;">NEXT CODE AT MIDNIGHT</span></div>';
    } else if(!running){
      var lbl=sessionDone?'▶ NEW SESSION':'▶ START';
      var act=sessionDone?'_STN':'_STS';
      h+='<button class="st-btn start" onclick="'+act+'()">'+lbl+'</button>';
      if(sessionDone&&mode==='daily'){
        h+='<button class="st-btn" onclick="_STshare()" style="background:linear-gradient(180deg,rgba(200,168,75,0.2),rgba(180,140,50,0.12));border-color:var(--gold);color:var(--gold);">📤 SHARE</button>';
      }
    }else{
      h+='<button class="st-btn stop" onclick="_STX()">■ STOP</button>';
    }
    h+='</div>';
    h+='<div id="STresult" class="st-result"></div>';
    h+='</div>';
    pan.innerHTML=h;
  }

  function renderResult(delta,t,autoStop){
    var el=document.getElementById('STresult');if(!el)return;
    var sign=elapsed>=target?'+':'-';
    var label=autoStop?'TIME OUT':t.lbl;
    var col=autoStop?'#c47a7a':t.col;
    el.innerHTML='<div class="st-tier" style="color:'+col+';text-shadow:0 0 18px '+col+'33;">'+label+'</div>'
      +'<div class="st-delta">'+sign+delta.toFixed(2)+'s from '+target+'.00</div>'
      +(t.sb>0?'<div class="st-reward">+'+t.sb+' Sunbeam progress</div>':'');
    // Update buddy face
    var b=document.getElementById('STbuddy');
    if(b){
      b.classList.remove('focused','happy','sad');
      b.classList.add(t.face==='happy'?'happy':(t.face==='sad'?'sad':''));
      b.innerHTML=BUDDY(autoStop?'sad':t.face);
    }
  }

  function renderSessionSummary(){
    var el=document.getElementById('STresult');if(!el)return;
    var ranking;
    if(best<0.005)ranking={lbl:'GROVE LEGEND',col:'#c8a84b'};
    else if(best<=0.015)ranking={lbl:'KEEN EYE',col:'#7ab356'};
    else if(best<=0.05)ranking={lbl:'STEADY HAND',col:'#7ab356'};
    else if(best<=0.2)ranking={lbl:'GOOD TRY',col:'var(--cream)'};
    else ranking={lbl:'KEEP PRACTICING',col:'var(--muted)'};
    el.innerHTML='<div style="margin-top:10px;padding:14px;background:rgba(26,31,23,0.6);border:1.5px solid rgba(74,124,53,0.25);border-radius:10px;">'
      +'<div style="font-family:Cormorant Garamond,serif;font-size:0.7rem;color:var(--muted);letter-spacing:0.06em;">SESSION COMPLETE</div>'
      +'<div style="font-family:Bebas Neue,sans-serif;font-size:1.3rem;color:'+ranking.col+';letter-spacing:0.12em;margin:6px 0;">'+ranking.lbl+'</div>'
      +'<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--cream);opacity:0.85;">Best: ±'+best.toFixed(2)+'s</div>'
      +'<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);margin-top:8px;">Tap NEW SESSION to play again</div>'
      +'</div>';
  }

  window._STS=function(){start();};
  window._STX=function(){stop(false);};
  window._STshare=function(){
    var d=_dailyDone();
    if(!d)return;
    var text='STOP AT TEN · Daily '+_todayKey()+'\n'+d.tier+' · ±'+d.best.toFixed(2)+'s\n\nlucidwinds.com';
    if(navigator.share)navigator.share({text:text}).catch(function(){_copyToClip(text);});
    else _copyToClip(text);
  };
  function _copyToClip(t){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(t).then(function(){sm('Copied!');}).catch(function(){_fallbackClip(t);});
    }else _fallbackClip(t);
  }
  function _fallbackClip(t){
    var ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.left='-9999px';
    document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');sm('Copied!');}catch(e){}
    document.body.removeChild(ta);
  }
  window._STN=function(){
    if(running){running=false;cancelAnimationFrame(rafId);}
    if(beatTimer){clearInterval(beatTimer);beatTimer=0;}
    attempts=0;best=Infinity;elapsed=0;sessionDone=false;
    var ba=document.getElementById('STa');if(ba)ba.textContent=0;
    var bb=document.getElementById('STb');if(bb)bb.textContent='—';
    renderStats();render();
  };
  // Switch mode WITHOUT rebuilding the whole panel. Just flip the
  // active tab and refresh the text bits that depend on mode — this
  // kills the jump/reflow Stephen flagged when picking a mode.
  window._STM=function(m){
    if(running)return;
    if(MODES.indexOf(m)<0)return;
    if(m===mode){return;}
    mode=m;
    try{localStorage.setItem('lw_st_mode',m);}catch(e){}
    attempts=0;best=Infinity;elapsed=0;sessionDone=false;
    twostopPhase=0;twostopDelta1=0;chaosFakeDigit='';
    // Daily mode has a special layout (locked recap card vs Start
    // button) — fall back to full render for that case to keep logic
    // simple. All other mode switches patch in place.
    if(m==='daily'){render();return;}
    // Update active tab class in place via data-mode attr
    var tabs=pan.querySelectorAll('.st-mode');
    for(var i=0;i<tabs.length;i++){
      var tab=tabs[i];
      tab.classList.toggle('on',tab.getAttribute('data-mode')===m);
    }
    // Refresh only the frame contents — no tab/stats reflow
    var frame=pan.querySelector('.st-frame');
    if(!frame){render();return;}
    // Update text bits
    var descEl=frame.querySelector('div[style*="Cormorant"]');
    if(descEl)descEl.textContent=modeDescription();
    var tgtEl=frame.querySelector('.st-target');
    if(tgtEl){
      var tgtText;
      if(mode==='twostop')tgtText=twostopPhase===0?'First stop at 5 seconds':'Now catch 10 seconds';
      else if(mode==='countdown')tgtText='Stop when the clock hits zero';
      else tgtText='Target, '+currentTarget()+' seconds';
      tgtEl.textContent=tgtText;
    }
    var attEl=frame.querySelector('.st-attempts');
    if(attEl)attEl.textContent='ATTEMPT 1 / '+MAX_ATTEMPTS;
    var clk=document.getElementById('STclock');
    if(clk){
      clk.className='st-clock idle';
      clk.textContent=elapsed.toFixed(2);
    }
    var buddy=document.getElementById('STbuddy');
    if(buddy){buddy.classList.remove('focused','happy','sad');buddy.innerHTML=BUDDY('idle');}
    var res=document.getElementById('STresult');if(res)res.innerHTML='';
    // Ensure the start button is present (after a sessionDone state)
    var btnRow=frame.querySelector('.st-btn-row');
    if(btnRow){
      btnRow.innerHTML='<button class="st-btn start" onclick="_STS()">▶ START</button>';
    }
    // Refresh stats strip (shows mode name)
    renderStats();
  };
  window._STR=function(){
    var existing=document.getElementById('STrulesOV');
    if(existing){existing.remove();return;}
    var ov=document.createElement('div');ov.id='STrulesOV';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
    var h='<div class="card">';
    h+='<div style="text-align:center;margin-bottom:10px;"><div style="font-family:Playfair Display,serif;font-style:italic;font-size:1.1rem;color:var(--cream);">Stop at Ten</div><div style="font-family:DM Mono,monospace;font-size:0.5rem;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;">A reflex-timing game</div></div>';
    h+='<h2>🎯 Goal</h2>';
    h+='<p>Hit ▶ START. Tap ■ STOP as close to the target as you can. 3 attempts per session. Personal best is the smallest difference you ever hit.</p>';
    h+='<h2>📊 Scoring</h2>';
    h+='<p>• <strong style="color:#c8a84b">PERFECT</strong> — within 0.005s (+3 sunbeams)<br>• <strong style="color:#7ab356">SO CLOSE</strong> — within 0.015s (+2)<br>• <strong style="color:#7ab356">NICE</strong> — within 0.035s (+1)<br>• <strong>CLOSE</strong> — within 0.1s (no reward, streak survives)<br>• <strong style="color:#c47a7a">MISS</strong> — further than 0.1s (streak resets)</p>';
    h+='<h2>🎮 Modes</h2>';
    h+='<p><strong style="color:var(--gold)">CLASSIC</strong> — visible clock, stop at 10.00s.</p>';
    h+='<p><strong style="color:var(--gold)">BLIND</strong> — clock hidden mid-run. Count in your head. The only feedback is your result.</p>';
    h+='<p><strong style="color:var(--gold)">BEAT</strong> — audio pulse every second. Stop on the 10th beat (the higher-pitch one).</p>';
    h+='<p><strong style="color:var(--gold)">HEARTBEAT</strong> — silent vibration pulse every second. Play anywhere without audio. Stop on the 10th pulse (the longer one).</p>';
    h+='<p><strong style="color:var(--gold)">COUNTDOWN</strong> — clock starts at 10.00 and counts down. Stop when it hits zero. Easier for some, harder for others.</p>';
    h+='<p><strong style="color:var(--gold)">LADDER</strong> — target climbs across attempts: 5 → 7 → 10 → 13 → 17 → 20. Tests how your rhythm scales.</p>';
    h+='<p><strong style="color:var(--gold)">TWO-STOP</strong> — tap STOP once at 5 seconds, then again at 10. The score is the combined drift from both targets.</p>';
    h+='<p><strong style="color:var(--gold)">CHAOS</strong> — visible clock, but the display flashes random fake values and random fake beeps interrupt. Don\'t trust what you see — trust your clock.</p>';
    h+='<p><strong style="color:var(--gold)">📅 DAILY</strong> — one session per day (3 attempts), locked after you play. Result is shareable so you can compare with friends.</p>';
    h+='<h2>💡 Tips</h2>';
    h+='<p>• Breathe with a steady beat — many players count in "seconds Mississippi" or a mental metronome.<br>• BLIND is hardest on the first attempt. A few CLASSIC rounds first calibrate your inner clock.<br>• In BEAT, don\'t fight your reflex — listen, then let your finger fall on the 10th tick.</p>';
    h+='<div style="text-align:center;margin-top:14px;"><button class="gb" onclick="document.getElementById(\'STrulesOV\').remove()" style="min-height:48px;padding:10px 22px;">CLOSE</button></div>';
    h+='</div>';
    ov.innerHTML=h;
    document.body.appendChild(ov);
  };

  // Cleanup — kill the rAF loop + beats when the panel detaches
  var _watchExit=setInterval(function(){
    if(!document.body.contains(pan)){
      running=false;
      if(rafId)cancelAnimationFrame(rafId);
      if(beatTimer){clearInterval(beatTimer);beatTimer=0;}
      clearInterval(_watchExit);
    }
  },1000);

  renderStats();render();
};
})();
