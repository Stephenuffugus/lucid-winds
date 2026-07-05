// ═══ FAST MATH — Soroban-inspired mental math trainer ═══
//
// Researched from Japanese soroban / anzan (暗算) tradition, Chinese
// mental-math classroom drills, and Kumon-style progressive practice.
// The goal: a drill that actually trains mental-math reflex the way
// elite Asian programs do — fast, rhythmic, progressive, with the
// signature FLASH ANZAN as the crown jewel.
//
// Eight modes:
//   BASIC  — ADD / SUB / MUL / MIX (the original 60-second drills)
//   FOCUS  — TABLES (rapid 2×2 to 12×12)
//            MAKE 10 (complements — foundation of Japanese 1st-grade math)
//            MAKE 100 (2-digit complements)
//   MASTER — ⚡ FLASH ANZAN (numbers flash in sequence, sum them all)
//
// Lifetime best saved per mode so each path has its own ladder.
// Difficulty climbs per 5-streak and drops back on misses.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns=window._gameFns||{};
window._gameFns.numbergarden=function NG(a){
  var MODE_META={
    add:    {label:'+ ADD',       cat:'BASIC',  hint:'Addition drill, 60 seconds'},
    sub:    {label:'− SUB',       cat:'BASIC',  hint:'Subtraction drill, 60 seconds'},
    mul:    {label:'× MUL',       cat:'BASIC',  hint:'Multiplication drill, 60 seconds'},
    mix:    {label:'MIX',         cat:'BASIC',  hint:'All three operations mixed'},
    tables: {label:'TABLES',      cat:'FOCUS',  hint:'Times tables 2×2 through 12×12'},
    make10: {label:'MAKE 10',     cat:'FOCUS',  hint:'Japanese friends-of-10 drill'},
    make100:{label:'MAKE 100',    cat:'FOCUS',  hint:'Two-digit complements'},
    span:   {label:'DIGIT SPAN',  cat:'FOCUS',  hint:'Watch the digits flash, type them in order'},
    flash:  {label:'⚡ FLASH ANZAN',cat:'MASTER',hint:'Numbers flash in sequence, sum them'}
  };
  var MODE_KEYS=['add','sub','mul','mix','tables','make10','make100','span','flash'];

  var mode=_loadMode();
  var answer='',correctAnswer=0;
  var correct=0,total=0,streak=0,bestStreak=0;
  var sessionTime=60,startTime=0,problemStartTime=0,totalSolveTime=0;
  var running=false,difficulty=1;
  var timerInterval=0;
  var flashTimer=0,flashNums=[],flashIdx=0,flashShowing='';
  var problem='';
  var mascotMood='idle'; // idle | happy | oops

  function _loadMode(){
    try{var m=localStorage.getItem('lw_ng_mode');if(MODE_META[m])return m;}catch(e){}
    return 'add';
  }

  // ─── Mascots ───────────────────────────────────────────────────
  // Two characters so kids have a friend to play with. Swap-in art:
  // drop PNGs at assets/games/numbergarden/abacus-owl-<mood>.png and
  // assets/games/numbergarden/sprout-<mood>.png; they'll override the
  // inline SVG automatically via <img onerror>. Moods: idle, happy, oops.
  // ART NOTE (2026-04-24): Stephen is drawing custom mascots. Inline
  // SVG is a placeholder — keeps the expression system wired so the
  // moment art drops in, everything animates correctly.
  function mascot(mood){
    mood=mood||'idle';
    // Choose owl for BASIC/FOCUS modes, sprout for MASTER (FLASH)
    var which=(mode==='flash')?'sprout':'owl';
    // Art file path if Stephen drops in PNGs
    var artPath='assets/games/numbergarden/'+(which==='owl'?'abacus-owl':'sprout')+'-'+mood+'.png';
    // Eyes + mouth change by mood
    var eyes,mouth,extras='';
    if(mood==='happy'){
      eyes='<path d="M20 28 q4 -4 8 0" stroke="#2a1f0a" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M44 28 q4 -4 8 0" stroke="#2a1f0a" stroke-width="2.4" stroke-linecap="round" fill="none"/>';
      mouth='<path d="M28 42 q8 7 16 0" stroke="#2a1f0a" stroke-width="2.4" stroke-linecap="round" fill="none"/>';
      extras='<circle cx="62" cy="14" r="2.2" fill="#fff"/><circle cx="10" cy="16" r="1.5" fill="#fff"/>';
    }else if(mood==='oops'){
      eyes='<circle cx="24" cy="30" r="2.2" fill="#2a1f0a"/><circle cx="48" cy="30" r="2.2" fill="#2a1f0a"/><path d="M18 24 l8 4 M54 24 l-8 4" stroke="#2a1f0a" stroke-width="1.5" stroke-linecap="round"/>';
      mouth='<path d="M28 46 q8 -5 16 0" stroke="#2a1f0a" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    }else{
      eyes='<circle cx="24" cy="30" r="2.5" fill="#2a1f0a"/><circle cx="48" cy="30" r="2.5" fill="#2a1f0a"/>';
      mouth='<path d="M28 42 q8 4 16 0" stroke="#2a1f0a" stroke-width="2" stroke-linecap="round" fill="none"/>';
    }
    var body;
    if(which==='owl'){
      // Abacus owl — wise teacher for the basic drills
      body='<ellipse cx="36" cy="44" rx="28" ry="24" fill="#8b6a3d"/>'
        +'<ellipse cx="36" cy="42" rx="23" ry="18" fill="#c8a876"/>'
        // Tufts
        +'<path d="M16 18 L12 6 L22 14 Z" fill="#8b6a3d"/>'
        +'<path d="M56 18 L60 6 L50 14 Z" fill="#8b6a3d"/>'
        // Eye patches
        +'<circle cx="24" cy="30" r="8" fill="#f6eccc"/>'
        +'<circle cx="48" cy="30" r="8" fill="#f6eccc"/>'
        // Beak
        +'<path d="M33 36 L36 42 L39 36 Z" fill="#d4903a"/>';
    }else{
      // Sprout — cheerful master for FLASH ANZAN
      body='<path d="M30 8 q-10 -4 -18 2 q6 8 18 8" fill="#4a7c35"/>'
        +'<path d="M42 8 q10 -4 18 2 q-6 8 -18 8" fill="#4a7c35"/>'
        +'<ellipse cx="36" cy="44" rx="26" ry="22" fill="#d4a843"/>'
        +'<ellipse cx="36" cy="42" rx="22" ry="18" fill="#e8c860"/>';
    }
    // Fallback img tag so a dropped PNG overrides the SVG
    return '<div style="position:relative;width:68px;height:68px;">'
      +'<img src="'+artPath+'" onerror="this.style.display=\'none\'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:2;">'
      +'<svg viewBox="0 0 72 72" width="100%" height="100%" style="position:absolute;inset:0;z-index:1;">'
      +body+eyes+mouth+extras
      +'</svg>'
      +'</div>';
  }
  function updateMascot(mood){
    mascotMood=mood;
    var el=document.getElementById('NGmascot');
    if(el){
      el.innerHTML=mascot(mood);
      el.classList.remove('happy','oops');
      if(mood==='happy')el.classList.add('happy');
      else if(mood==='oops')el.classList.add('oops');
    }
    // Auto-return to idle after a beat
    if(mood!=='idle'){
      clearTimeout(updateMascot._t);
      updateMascot._t=setTimeout(function(){
        var el2=document.getElementById('NGmascot');
        if(el2&&!running)return; // freeze on endgame
        mascotMood='idle';
        if(el2){el2.innerHTML=mascot('idle');el2.classList.remove('happy','oops');}
      },900);
    }
  }
  function _saveMode(){try{localStorage.setItem('lw_ng_mode',mode);}catch(e){}}
  function _bestKey(){return 'lw_ng_best_'+mode;}
  function _loadBest(){try{return parseInt(localStorage.getItem(_bestKey())||'0',10)||0;}catch(e){return 0;}}
  function _saveBest(v){try{localStorage.setItem(_bestKey(),String(v));}catch(e){}}

  // ─── CSS once ───
  if(!document.getElementById('NGstyle')){
    var st=document.createElement('style');st.id='NGstyle';
    st.textContent=[
      '#NGpan{padding:8px 6px;}',
      '.ng-stats{display:flex;justify-content:center;gap:14px;padding:2px 0;font-family:DM Mono,monospace;font-size:0.62rem;color:rgba(232,220,200,0.72);letter-spacing:0.06em;}',
      '.ng-stats strong{color:var(--gold);}',
      '.ng-hud{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:8px 6px;background:rgba(26,31,23,0.55);border-radius:8px;margin:4px 0;font-family:DM Mono,monospace;}',
      '.ng-hud .lbl{font-family:Bebas Neue,sans-serif;font-size:0.72rem;color:#7ab356;letter-spacing:0.08em;}',
      '.ng-hud .val{font-size:1.15rem;color:var(--gold);margin-top:2px;}',
      '.ng-timebar{width:100%;max-width:300px;height:5px;background:rgba(26,36,22,0.5);border-radius:3px;margin:6px auto;overflow:hidden;}',
      '.ng-timebar > div{height:100%;background:linear-gradient(90deg,#7ab356,#c8a84b);transition:width 0.2s linear;}',
      '.ng-prob{font-family:Bebas Neue,sans-serif;font-size:clamp(1.8rem,8vw,2.8rem);letter-spacing:0.06em;margin:14px 0 6px;min-height:56px;color:var(--cream);display:flex;align-items:center;justify-content:center;gap:10px;position:relative;}',
      '.ng-mascot{position:absolute;left:8px;top:50%;transform:translateY(-50%);width:64px;height:64px;pointer-events:none;transition:transform 0.2s ease;}',
      '.ng-mascot.happy{animation:ngHop 0.6s ease;}',
      '.ng-mascot.oops{animation:ngShake 0.4s ease;}',
      '@keyframes ngHop{0%{transform:translateY(-50%) scale(1)}40%{transform:translateY(-80%) scale(1.08)}100%{transform:translateY(-50%) scale(1)}}',
      '@keyframes ngShake{0%,100%{transform:translateY(-50%) translateX(0)}20%{transform:translateY(-50%) translateX(-6px) rotate(-6deg)}50%{transform:translateY(-50%) translateX(6px) rotate(6deg)}80%{transform:translateY(-50%) translateX(-3px) rotate(-3deg)}}',
      '@media (max-width:380px){.ng-mascot{width:52px;height:52px;left:4px;}}',
      '.ng-prob .flash-num{display:inline-block;animation:ngFlashIn 0.15s ease;color:var(--gold);font-size:clamp(2.6rem,11vw,4rem);}',
      '@keyframes ngFlashIn{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}',
      '.ng-ans{font-family:Bebas Neue,sans-serif;font-size:2rem;color:var(--gold);min-height:46px;margin:4px 0;letter-spacing:0.08em;border-bottom:2px solid rgba(200,168,75,0.35);padding:0 12px 4px;min-width:100px;display:inline-block;}',
      '.ng-fb{font-family:Bebas Neue,sans-serif;font-size:0.92rem;min-height:26px;letter-spacing:0.08em;margin:4px 0;transition:color 0.2s;}',
      '.ng-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:260px;margin:10px auto;padding:4px 0;}',
      '.ng-pad button{min-height:52px;border-radius:10px;background:rgba(26,36,22,0.65);border:1.5px solid rgba(122,179,86,0.3);color:var(--cream);font-family:Bebas Neue,sans-serif;font-size:1.35rem;cursor:pointer;transition:background 0.12s,transform 0.08s,border-color 0.12s;-webkit-tap-highlight-color:transparent;}',
      '.ng-pad button:active{transform:scale(0.94);background:rgba(122,179,86,0.25);}',
      '.ng-pad button.back{color:#c47a7a;border-color:rgba(196,122,122,0.35);}',
      '.ng-pad button.go{color:#7ab356;background:rgba(122,179,86,0.18);border-color:rgba(122,179,86,0.45);}',
      '.ng-modes{display:flex;gap:4px;padding:4px 4px 8px;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}',
      '.ng-modes::-webkit-scrollbar{display:none;}',
      '.ng-mode{padding:6px 12px;min-height:48px;display:flex;align-items:center;font-family:DM Mono,monospace;font-size:0.62rem;letter-spacing:0.06em;background:rgba(26,31,23,0.6);border:1px solid rgba(122,179,86,0.22);border-radius:6px;color:rgba(232,220,200,0.72);cursor:pointer;flex:0 0 auto;white-space:nowrap;transition:background 0.15s,border-color 0.15s,color 0.15s;}',
      '.ng-mode.on{background:rgba(200,168,75,0.2);border-color:var(--gold);color:var(--gold);}',
      '.ng-mode.master.on{background:linear-gradient(135deg,rgba(200,168,75,0.25),rgba(122,179,86,0.2));}',
      '.ng-desc{font-family:Cormorant Garamond,serif;font-style:italic;font-size:0.78rem;color:rgba(232,220,200,0.75);text-align:center;margin:4px auto 8px;max-width:300px;}',
      '#NGrulesOV{position:fixed;inset:0;z-index:200000;background:rgba(5,8,4,0.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;animation:ngFade 0.25s ease;}',
      '#NGrulesOV .card{max-width:420px;width:100%;max-height:84vh;overflow-y:auto;padding:22px 20px;background:linear-gradient(180deg,rgba(18,22,14,0.98),rgba(10,12,8,0.98));border:1.5px solid rgba(200,168,75,0.35);border-radius:14px;box-shadow:0 32px 64px rgba(0,0,0,0.7);font-family:DM Mono,monospace;color:var(--cream);font-size:0.72rem;line-height:1.6;}',
      '#NGrulesOV h2{font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.14em;color:var(--gold);border-bottom:1px solid rgba(200,168,75,0.3);margin:14px 0 8px;padding-bottom:4px;}',
      '@keyframes ngFade{from{opacity:0}to{opacity:1}}'
    ].join('');
    document.head.appendChild(st);
  }

  ms(a,'FAST MATH · <strong id="NGmode">'+MODE_META[mode].label+'</strong> · best <strong id="NGbest">'+_loadBest()+'</strong>');
  mm(a);
  var statsRow=document.createElement('div');statsRow.className='ng-stats';a.appendChild(statsRow);
  var pan=document.createElement('div');pan.id='NGpan';
  pan.style.cssText='max-width:min(96vw,440px);margin:0 auto;padding:6px;user-select:none;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_NGrules()" style="min-height:48px;padding:8px 18px;font-size:0.75rem;letter-spacing:0.1em">📖 RULES</button>'
    +'<button class="gb" onclick="_NGN()" style="min-height:48px;padding:8px 22px;font-size:0.82rem;letter-spacing:0.12em;background:rgba(122,179,86,0.2);color:var(--sage);border-color:rgba(122,179,86,0.5);">▶ START</button>';

  function renderStats(){
    var best=_loadBest();
    var metaCat=MODE_META[mode].cat;
    statsRow.innerHTML='category <strong>'+metaCat+'</strong> · mode best <strong>'+best+'</strong> · streak <strong>'+bestStreak+'</strong>';
  }

  function render(){
    var h='';
    // Mode tabs
    h+='<div class="ng-modes">';
    for(var i=0;i<MODE_KEYS.length;i++){
      var k=MODE_KEYS[i],meta=MODE_META[k];
      var on=(k===mode)?' on':'';
      var cls=(meta.cat==='MASTER')?' master':'';
      h+='<div class="ng-mode'+on+cls+'" data-mode="'+k+'" onclick="_NGMD(\''+k+'\')">'+meta.label+'</div>';
    }
    h+='</div>';
    h+='<div class="ng-desc">'+MODE_META[mode].hint+'</div>';
    // HUD
    h+='<div class="ng-hud">';
    h+='<div><div class="lbl">CORRECT</div><div class="val" id="NGc">'+correct+'</div></div>';
    h+='<div><div class="lbl">SPEED</div><div class="val" id="NGsp">—</div></div>';
    h+='<div><div class="lbl">STREAK</div><div class="val" id="NGst">'+streak+'</div></div>';
    h+='</div>';
    // Time bar (only shown during running)
    h+='<div class="ng-timebar"><div id="NGtb" style="width:'+(running?100:0)+'%"></div></div>';
    // Problem + answer (mascot sits to the left, outside NGprob so text updates don't wipe it)
    h+='<div style="position:relative;"><div class="ng-mascot" id="NGmascot">'+mascot(mascotMood)+'</div><div class="ng-prob" id="NGprob">'+(running?'Ready...':'Press START')+'</div></div>';
    h+='<div><span class="ng-ans" id="NGans">_</span></div>';
    h+='<div class="ng-fb" id="NGfb"></div>';
    // Numpad
    h+='<div class="ng-pad">';
    var pk=['1','2','3','4','5','6','7','8','9','←','0','✓'];
    for(var p=0;p<pk.length;p++){
      var k2=pk[p];
      var extra=k2==='←'?' class="back"':(k2==='✓'?' class="go"':'');
      h+='<button'+extra+' onclick="_NGK(\''+k2+'\')">'+k2+'</button>';
    }
    h+='</div>';
    pan.innerHTML=h;
    updateHUD();
  }

  function updateHUD(){
    var e;
    if(e=document.getElementById('NGc'))e.textContent=correct;
    if(e=document.getElementById('NGst'))e.textContent=streak;
    var avgSpeed=correct>0?(Math.round(totalSolveTime/correct/100)/10+'s'):'—';
    if(e=document.getElementById('NGsp'))e.textContent=avgSpeed;
    if(e=document.getElementById('NGmode'))e.textContent=MODE_META[mode].label;
    if(e=document.getElementById('NGbest'))e.textContent=_loadBest();
  }

  // ─── Problem generation per mode ───
  function genProblem(){
    if(!running)return;
    var elapsed=(Date.now()-startTime)/1000;
    if(elapsed>=sessionTime){endSession();return;}
    problemStartTime=Date.now();
    answer='';
    var ae=document.getElementById('NGans');if(ae)ae.textContent='_';
    var fe=document.getElementById('NGfb');if(fe)fe.textContent='';
    var pe=document.getElementById('NGprob');if(!pe)return;
    if(mode==='add'||mode==='sub'||mode==='mul'||mode==='mix'){
      var op;
      if(mode==='mix')op=['+','-','×'][Math.floor(Math.random()*3)];
      else op=mode==='add'?'+':mode==='sub'?'-':'×';
      var maxN=10+difficulty*5;
      var x,y;
      if(op==='+'){x=Math.floor(Math.random()*maxN)+1;y=Math.floor(Math.random()*maxN)+1;correctAnswer=x+y;}
      else if(op==='-'){x=Math.floor(Math.random()*maxN)+5;y=Math.floor(Math.random()*Math.min(x,maxN))+1;correctAnswer=x-y;}
      else {x=Math.floor(Math.random()*Math.min(12,maxN))+2;y=Math.floor(Math.random()*Math.min(12,maxN))+2;correctAnswer=x*y;}
      problem=x+' '+op+' '+y+' =';
      pe.textContent=problem;
    }
    else if(mode==='tables'){
      // 2x2 through 12x12, weighted to 4x-9x (the "tricky middle")
      var a2=Math.floor(Math.random()*11)+2;
      var b2=Math.floor(Math.random()*11)+2;
      correctAnswer=a2*b2;
      problem=a2+' × '+b2+' =';
      pe.textContent=problem;
    }
    else if(mode==='make10'){
      // Show a number 1-9, player must answer its 10-complement
      var n=Math.floor(Math.random()*9)+1;
      correctAnswer=10-n;
      problem=n+' + ? = 10';
      pe.textContent=problem;
    }
    else if(mode==='make100'){
      // Show a 2-digit number, player answers 100 complement
      var n2=Math.floor(Math.random()*89)+11; // 11-99
      correctAnswer=100-n2;
      problem=n2+' + ? = 100';
      pe.textContent=problem;
    }
    else if(mode==='span'){
      startSpanSequence();
      return; // span handles its own timing
    }
    else if(mode==='flash'){
      startFlashSequence();
      return; // flash handles its own timing
    }
  }

  // ─── Digit Span mode ───
  // Single digits flash in sequence; recall them in order.
  // Research: digit span is the canonical working-memory benchmark
  // (Wechsler). Average adult span ≈ 7. Elite anzan-trained kids hit 15+.
  //   d1: 3 digits @ 700ms     d2: 4 digits @ 600ms     d3: 5 digits @ 550ms
  //   d4: 6 digits @ 500ms     d5: 7 digits @ 450ms
  function spanParams(){
    var table=[
      null,
      {count:3,ms:700},
      {count:4,ms:600},
      {count:5,ms:550},
      {count:6,ms:500},
      {count:7,ms:450}
    ];
    return table[Math.min(5,difficulty)]||table[1];
  }
  var spanExpected='';
  function startSpanSequence(){
    var params=spanParams();
    flashNums=[];spanExpected='';
    // First digit is 1-9 so parseInt round-trips cleanly
    var first=Math.floor(Math.random()*9)+1;
    flashNums.push(first);spanExpected+=first;
    for(var i=1;i<params.count;i++){
      var d=Math.floor(Math.random()*10);
      flashNums.push(d);spanExpected+=d;
    }
    correctAnswer=parseInt(spanExpected,10);
    flashIdx=0;
    var pe=document.getElementById('NGprob');
    if(pe)pe.textContent='Watch the digits…';
    setTimeout(showNextSpanDigit,420);
  }
  function showNextSpanDigit(){
    if(!running||mode!=='span')return;
    var params=spanParams();
    var pe=document.getElementById('NGprob');if(!pe)return;
    if(flashIdx>=flashNums.length){
      pe.innerHTML='<span style="font-size:clamp(1.4rem,5vw,2rem);opacity:0.75">Type the sequence</span>';
      problemStartTime=Date.now();
      return;
    }
    var d=flashNums[flashIdx];
    pe.innerHTML='<span class="flash-num">'+d+'</span>';
    flashIdx++;
    _play('tap');
    flashTimer=setTimeout(function(){
      var pe2=document.getElementById('NGprob');if(pe2)pe2.innerHTML='';
      setTimeout(showNextSpanDigit,100);
    },params.ms);
  }

  // ─── Flash Anzan mode ───
  // Flashes N numbers in sequence. Player sums them in their head.
  // Count and digit range scale with difficulty:
  //   d1: 3 numbers, 1-9,        each shown 750ms
  //   d2: 4 numbers, 1-19,       each shown 600ms
  //   d3: 5 numbers, 10-99,      each shown 550ms
  //   d4: 6 numbers, 10-99,      each shown 450ms
  //   d5: 7 numbers, 20-199,     each shown 400ms
  function flashParams(){
    var table=[
      null,
      {count:3,min:1,max:9,ms:750},
      {count:4,min:1,max:19,ms:600},
      {count:5,min:10,max:99,ms:550},
      {count:6,min:10,max:99,ms:450},
      {count:7,min:20,max:199,ms:400}
    ];
    return table[Math.min(5,difficulty)]||table[1];
  }
  function startFlashSequence(){
    var params=flashParams();
    flashNums=[];correctAnswer=0;
    for(var i=0;i<params.count;i++){
      var n=Math.floor(Math.random()*(params.max-params.min+1))+params.min;
      flashNums.push(n);correctAnswer+=n;
    }
    flashIdx=0;
    var pe=document.getElementById('NGprob');
    if(pe)pe.textContent='Watch…';
    setTimeout(showNextFlash,420);
  }
  function showNextFlash(){
    if(!running)return;
    var params=flashParams();
    var pe=document.getElementById('NGprob');if(!pe)return;
    if(flashIdx>=flashNums.length){
      // All shown — prompt for answer
      pe.innerHTML='<span style="font-size:clamp(1.4rem,5vw,2rem);opacity:0.75">= ?</span>';
      problemStartTime=Date.now();
      return;
    }
    var n=flashNums[flashIdx];
    pe.innerHTML='<span class="flash-num">'+n+'</span>';
    flashIdx++;
    _play('tap');
    flashTimer=setTimeout(function(){
      var pe2=document.getElementById('NGprob');if(pe2)pe2.innerHTML='';
      setTimeout(showNextFlash,120);
    },params.ms);
  }

  function tickTimer(){
    if(!running)return;
    var elapsed=(Date.now()-startTime)/1000;
    var remaining=Math.max(0,sessionTime-elapsed);
    var el=document.getElementById('NGtb');
    if(el)el.style.width=(remaining/sessionTime*100)+'%';
    if(remaining<=0){endSession();return;}
  }

  function endSession(){
    running=false;
    if(timerInterval){clearInterval(timerInterval);timerInterval=0;}
    if(flashTimer){clearTimeout(flashTimer);flashTimer=0;}
    var avgSpeed=correct>0?(Math.round(totalSolveTime/correct/100)/10):0;
    var accuracy=total>0?Math.round(correct/total*100):0;
    var won=correct>=10;
    var prevBest=_loadBest();
    var newBest=correct>prevBest;
    if(newBest)_saveBest(correct);
    renderStats();
    var bEl=document.getElementById('NGbest');if(bEl)bEl.textContent=_loadBest();
    sm((won?'✓ ':'')+correct+'/'+total+' · '+accuracy+'% · '+avgSpeed+'s avg'+(newBest?' · 🌟 NEW BEST':''));
    if(won){_playWin();_e('game_win');}else{_play('lose');_e('game_loss');}
    _sr('numbergarden',{w:won,s:correct,acc:accuracy,spd:avgSpeed,st:bestStreak,mode:mode});
    var pe=document.getElementById('NGprob');if(pe)pe.textContent='Done';
    if(window._lwGameEnd)_lwGameEnd({won:won,
      title:won?'DRILL COMPLETE':'TIME\u2019S UP',
      line:'<b style="color:#c8a84b">'+correct+'</b>/'+total+' solved \u00b7 '+accuracy+'% \u00b7 '+avgSpeed+'s avg',
      sub:(newBest?'\u2b50 NEW BEST':'best '+_loadBest())+' \u00b7 top streak '+bestStreak,
      retry:function(){window._NGN();},retryLabel:'\u21bb DRILL AGAIN',viewLabel:'rest a moment'});
  }

  window._NGK=function(k){
    if(!running){sm('Press START to begin');return;}
    if(k==='←'){answer=answer.slice(0,-1);var ae=document.getElementById('NGans');if(ae)ae.textContent=answer||'_';_play('tap');return;}
    if(k==='✓'){
      if(answer==='')return;
      var num=parseInt(answer,10);
      total++;
      var fbEl=document.getElementById('NGfb');
      if(num===correctAnswer){
        correct++;streak++;
        if(streak>bestStreak)bestStreak=streak;
        if(streak%5===0)difficulty=Math.min(5,difficulty+1);
        var solveTime=Date.now()-problemStartTime;
        totalSolveTime+=solveTime;
        var tierMsg=solveTime<1500?'⚡ LIGHTNING':solveTime<2500?'FAST':solveTime<4000?'GOOD':'OK';
        fbEl.textContent='✓ '+tierMsg+' ('+(Math.round(solveTime/100)/10)+'s)';
        fbEl.style.color='#7ab356';
        _play('snap');
        updateMascot('happy');
        _e('progress');
        if(streak%10===0)_e('milestone');
      } else {
        streak=0;difficulty=Math.max(1,difficulty-1);
        // Span: show the expected sequence as spaced digits, not one big number
        var revealStr=(mode==='span'&&spanExpected)?spanExpected.split('').join(' '):String(correctAnswer);
        fbEl.textContent='✗ Answer was '+revealStr;
        fbEl.style.color='#c47a7a';
        _play('lose');
        updateMascot('oops');
      }
      answer='';updateHUD();
      setTimeout(genProblem,350);
      return;
    }
    // Span can need up to 7 digits; other modes never exceed 4
    var maxLen=(mode==='span')?7:4;
    if(answer.length>=maxLen)return;
    answer+=k;
    var ae2=document.getElementById('NGans');if(ae2)ae2.textContent=answer||'_';
    _play('tap');
  };
  window._NGMD=function(m){
    if(!MODE_META[m])return;
    if(running){sm('Finish the drill first');return;}
    mode=m;_saveMode();
    correct=0;total=0;streak=0;bestStreak=0;difficulty=1;totalSolveTime=0;answer='';
    renderStats();
    // Patch in place: update active tabs + description text only (no
    // full rebuild jump)
    var tabs=pan.querySelectorAll('.ng-mode');
    for(var i=0;i<tabs.length;i++){
      tabs[i].classList.toggle('on',tabs[i].getAttribute('data-mode')===m);
    }
    var desc=pan.querySelector('.ng-desc');if(desc)desc.textContent=MODE_META[mode].hint;
    var pe=document.getElementById('NGprob');if(pe)pe.textContent='Press START';
    var ae=document.getElementById('NGans');if(ae)ae.textContent='_';
    var fe=document.getElementById('NGfb');if(fe)fe.textContent='';
    var tb=document.getElementById('NGtb');if(tb)tb.style.width='0%';
    updateHUD();
  };
  window._NGN=function(){
    correct=0;total=0;streak=0;bestStreak=0;difficulty=1;totalSolveTime=0;answer='';
    sessionTime=60;
    running=true;startTime=Date.now();
    renderStats();updateHUD();
    var tb=document.getElementById('NGtb');if(tb)tb.style.width='100%';
    genProblem();
    if(timerInterval)clearInterval(timerInterval);
    timerInterval=setInterval(tickTimer,200);
    var msg={add:'GO! 60 seconds, ADD',sub:'GO! 60s, SUB',mul:'GO! 60s, MUL',mix:'GO! 60s, MIX',tables:'GO! Times tables',make10:'GO! Complements to 10',make100:'GO! Complements to 100',span:'GO! Watch the digits, recall the sequence',flash:'GO! Watch the numbers, sum them'};
    sm(msg[mode]||'GO!');
  };
  window._NGrules=function(){
    var existing=document.getElementById('NGrulesOV');
    if(existing){existing.remove();return;}
    var ov=document.createElement('div');ov.id='NGrulesOV';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
    var h='<div class="card">';
    h+='<div style="text-align:center;margin-bottom:8px;"><div style="font-family:Playfair Display,serif;font-style:italic;font-size:1.1rem;color:var(--cream);">Fast Math</div><div style="font-family:DM Mono,monospace;font-size:0.5rem;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;">A soroban-inspired mental math trainer</div></div>';
    h+='<h2>🎯 Goal</h2>';
    h+='<p>60-second drills. Solve as many problems as you can. 10+ correct = win. Each mode has its own personal best.</p>';
    h+='<h2>🎮 BASIC modes</h2>';
    h+='<p><strong style="color:var(--gold)">ADD / SUB / MUL</strong> — the core operations, one at a time. Numbers grow as your streak does.</p>';
    h+='<p><strong style="color:var(--gold)">MIX</strong> — all three operations interleaved. The unpredictable variant.</p>';
    h+='<h2>🧠 FOCUS modes</h2>';
    h+='<p><strong style="color:var(--gold)">TABLES</strong> — rapid-fire times tables from 2×2 through 12×12. The foundation every Japanese grade-schooler drills until it\'s reflex.</p>';
    h+='<p><strong style="color:var(--gold)">MAKE 10</strong> — Japanese <em>friends-of-ten</em> drill. You see a digit 1–9; type its complement. 7? Answer 3. 4? Answer 6. The mental reflex behind every fast addition.</p>';
    h+='<p><strong style="color:var(--gold)">MAKE 100</strong>, two-digit complements. 37? Answer 63. Unlocks fast mental addition of any 2-digit pair.</p>';
    h+='<p><strong style="color:var(--gold)">DIGIT SPAN</strong>, the classic working-memory benchmark. A short digit sequence flashes one at a time; type it back in order. Average adult span is about 7. Elite anzan-trained students reach 15 or more.</p>';
    h+='<h2>⚡ MASTER mode</h2>';
    h+='<p><strong style="color:var(--gold)">FLASH ANZAN</strong>, the signature Japanese mental-abacus drill. Numbers flash on screen one at a time (3 numbers at first, scaling up to 7). You must add them all in your head and type the total. Count and speed both climb as you get better.</p>';
    h+='<h2>🦉 Your study buddies</h2>';
    h+='<p>An abacus owl joins you for the basic and focus drills. A sprout cheers you on for Flash Anzan. They hop when you nail one and shake when you miss. Friendly company for the reps.</p>';
    h+='<h2>📈 Difficulty</h2>';
    h+='<p>Every 5-streak bumps difficulty; every miss drops it back. Bigger numbers, faster flashes, trickier values.</p>';
    h+='<h2>💡 Training tips</h2>';
    h+='<p>• <strong>Subvocalize the number, not the operation.</strong> Don\'t say "seven plus three equals ten." Say "seven, ten." Skip the middle.<br>• <strong>Use complement shortcuts.</strong> 8 + 5 isn\'t "eight plus five", it\'s "eight needs two, five leaves three, answer thirteen." The MAKE 10 drill builds this reflex.<br>• <strong>Chunk for span.</strong> 4-7-2-9-1 is easier as "47, 291" than five loose digits. Elite span starts as phone-number chunking.<br>• <strong>Start slow on FLASH.</strong> Beat 3-number rounds clean before you scale up. Elite anzan players sum 15 three-digit numbers in 2 seconds. You\'ll get there with reps.</p>';
    h+='<div style="text-align:center;margin-top:14px;"><button class="gb" onclick="document.getElementById(\'NGrulesOV\').remove()" style="min-height:48px;padding:10px 22px;">CLOSE</button></div>';
    h+='</div>';
    ov.innerHTML=h;
    document.body.appendChild(ov);
    try{localStorage.setItem('lw_ng_rules_seen','1');}catch(e){}
  };

  // First-time auto-open
  try{if(!localStorage.getItem('lw_ng_rules_seen'))setTimeout(function(){if(window._NGrules)window._NGrules();},700);}catch(e){}

  // Cleanup
  var _watchExit=setInterval(function(){
    if(!document.body.contains(pan)){
      running=false;
      if(timerInterval){clearInterval(timerInterval);timerInterval=0;}
      if(flashTimer){clearTimeout(flashTimer);flashTimer=0;}
      if(updateMascot._t){clearTimeout(updateMascot._t);updateMascot._t=0;}
      var _ngOv=document.getElementById('NGrulesOV');if(_ngOv)_ngOv.remove();
      clearInterval(_watchExit);
    }
  },1000);

  renderStats();render();
};
})();
