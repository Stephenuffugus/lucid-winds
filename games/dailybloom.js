// ═══ DAILY BLOOM — 8 cognitive exercises, ~4 minute daily workout ═══
//
// Evidence-backed brain training. Each exercise targets a specific
// cognitive domain with adaptive difficulty. Per-domain scores tracked
// across 90 days of history.
//
// Exercise pool (rotate 5 per day based on calendar):
//  - wordRecall  — episodic memory
//  - math        — processing speed (arithmetic)
//  - reaction    — simple reaction time
//  - pattern     — visual memory
//  - stroop      — inhibition / selective attention
//  - nback       — working memory (Jaeggi et al. 2008)
//  - corsi       — spatial working memory (Corsi 1972)
//  - flanker     — selective attention (Eriksen 1974)
//
// Honest scope: these exercises train the specific tasks they measure.
// The research on "transfer" to general intelligence is mixed. Lumosity
// was fined $2M in 2016 for overclaiming. We don't promise brain-boost
// miracles — we promise a daily habit on tasks with published protocols.
(function(){
'use strict';
var LWG=window._G;
var _e=LWG.e,_play=LWG.play,_playWin=LWG.playWin,_setDiff=LWG.setDiff,sm=LWG.sm,_sr=LWG.sr;

// ── Exercise catalog ────────────────────────────────────────────────────
// label        — user-facing name
// domain       — cognitive domain key (memory/attention/speed/etc.)
// trains       — one-line educational explainer shown before exercise
// source       — research citation (short) for credibility
var EXERCISES={
  wordRecall:{label:'WORD RECALL',domain:'memory',
    trains:'Episodic memory: hold information in mind, retrieve it later.',
    source:'Standard free-recall paradigm (Ebbinghaus tradition)'},
  math:{label:'QUICK MATH',domain:'speed',
    trains:'Processing speed: solve arithmetic as fast as accuracy allows.',
    source:'Timed arithmetic, cognitive psychology standard'},
  reaction:{label:'REACTION',domain:'speed',
    trains:'Simple reaction time: how fast you can respond to a signal.',
    source:'Simple RT, one of the oldest measures in psychology'},
  pattern:{label:'PATTERN MATCH',domain:'visual',
    trains:'Visual memory: compare a pattern to distractors that differ slightly.',
    source:'Visual change detection paradigm'},
  stroop:{label:'COLOR NAMING',domain:'attention',
    trains:'Inhibition: tap the ink color of a word that spells a different color.',
    source:'Stroop 1935 — the Stroop effect'},
  nback:{label:'N-BACK',domain:'working',
    trains:'Working memory: "did this tile appear N steps ago?"',
    source:'Jaeggi et al. 2008, Proceedings of the National Academy of Sciences'},
  corsi:{label:'CORSI BLOCKS',domain:'spatial',
    trains:'Spatial working memory: reproduce a lighting sequence.',
    source:'Corsi 1972, tapping span test'},
  flanker:{label:'FLANKER',domain:'attention',
    trains:'Selective attention: tap the direction of the CENTER arrow, ignore flankers.',
    source:'Eriksen & Eriksen 1974'}
};
var EX_KEYS=['wordRecall','math','reaction','pattern','stroop','nback','corsi','flanker'];
var DOMAINS={
  memory:  {label:'MEMORY',color:'#a96bb8'},
  speed:   {label:'SPEED', color:'#d4a843'},
  visual:  {label:'VISUAL',color:'#5b9bd5'},
  attention:{label:'ATTENTION',color:'#e08a4a'},
  working:  {label:'WORKING MEM',color:'#e07a8a'},
  spatial:  {label:'SPATIAL',color:'#6bad4a'}
};

// ── Styles ──────────────────────────────────────────────────────────────
(function injectStyle(){
  if(document.getElementById('db-style'))return;
  var s=document.createElement('style');s.id='db-style';
  s.textContent=[
    '@keyframes dbFade{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes dbPop{0%{transform:scale(0.5);opacity:0}55%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes dbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}',
    '#DBpan{max-width:min(100vw,440px);margin:0 auto;padding:12px;user-select:none;-webkit-user-select:none;box-sizing:border-box;text-align:center;color:#e8dcc8;font-family:Georgia,serif;animation:dbFade .3s ease}',
    // Session hub
    '.DBhub{padding:16px 12px}',
    '.DBhubTitle{font-family:Bebas Neue,sans-serif;font-size:1.8rem;letter-spacing:0.22em;color:#c8a84b;margin-bottom:4px}',
    '.DBhubSub{font-size:0.78rem;color:rgba(232,220,200,0.72);line-height:1.5;margin-bottom:14px;max-width:340px;margin-left:auto;margin-right:auto}',
    '.DBhubRow{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0}',
    '.DBhubChip{display:flex;align-items:center;gap:6px;padding:5px 9px;border-radius:7px;background:rgba(26,36,22,0.6);border:1.5px solid rgba(122,179,86,0.22);font-family:DM Mono,monospace;font-size:0.7rem;font-weight:500;color:#e8dcc8}',
    '.DBhubChip .dom{font-family:Bebas Neue,sans-serif;letter-spacing:0.1em;font-size:0.7rem}',
    '.DBhubStart{min-height:60px;padding:14px 26px;margin-top:14px;border-radius:12px;background:linear-gradient(180deg,rgba(200,168,75,0.32),rgba(160,130,50,0.42));border:1.5px solid #c8a84b;color:#ffdc70;font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.2em;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;font-weight:700;box-shadow:0 4px 14px rgba(200,168,75,0.28)}',
    '.DBhubStart:active{transform:scale(0.98)}',
    '.DBhubNote{margin-top:14px;padding:9px 12px;font-size:0.7rem;font-weight:500;color:rgba(232,220,200,0.65);line-height:1.55;font-style:italic;border-top:1px solid rgba(74,124,53,0.2)}',
    // Progress dots
    '.DBdots{display:flex;gap:6px;justify-content:center;padding:6px 0}',
    '.DBdot{width:10px;height:10px;border-radius:50%;border:1.5px solid rgba(122,179,86,0.3);background:transparent;transition:all .2s ease}',
    '.DBdot.done{background:#7ab356;border-color:#7ab356}',
    '.DBdot.active{border-color:#c8a84b;box-shadow:0 0 8px rgba(200,168,75,0.45);animation:dbPulse 1.2s ease-in-out infinite}',
    // Exercise header
    '.DBexTitle{font-family:Bebas Neue,sans-serif;font-size:1.05rem;letter-spacing:0.14em;color:#8fc57a;margin:6px 0 2px}',
    '.DBexDesc{font-size:0.72rem;color:rgba(232,220,200,0.6);font-style:italic;margin-bottom:8px;min-height:1.5em}',
    // Explainer card (shown before each exercise for 2.5s)
    '.DBexplain{background:rgba(26,36,22,0.75);border:1.5px solid rgba(122,179,86,0.28);border-radius:10px;padding:14px 16px;margin:10px auto;max-width:360px;animation:dbPop .3s cubic-bezier(.2,1.2,.3,1) both}',
    '.DBexplainTitle{font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.18em;color:#c8a84b;margin-bottom:4px}',
    '.DBexplainDom{font-family:Bebas Neue,sans-serif;font-size:0.7rem;letter-spacing:0.16em;padding:2px 8px;border-radius:4px;display:inline-block;margin-bottom:8px}',
    '.DBexplainBody{font-size:0.78rem;color:#e8dcc8;line-height:1.5;margin-bottom:8px}',
    '.DBexplainSrc{font-size:0.7rem;font-weight:500;color:rgba(232,220,200,0.55);font-style:italic}',
    '.DBexplainLevel{margin-top:8px;font-family:DM Mono,monospace;font-size:0.7rem;font-weight:500;color:#8fc57a;letter-spacing:0.06em}',
    '.DBexplainGo{display:flex;align-items:center;justify-content:center;width:fit-content;min-height:48px;box-sizing:border-box;margin:14px auto 0;padding:8px 24px;border-radius:9px;background:rgba(122,179,86,0.25);border:1.5px solid rgba(122,179,86,0.5);color:#8fc57a;font-family:Bebas Neue,sans-serif;font-size:0.85rem;letter-spacing:0.16em;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;font-weight:700}',
    // Option buttons (word, math, flanker, stroop)
    '.DBopts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0}',
    '.DBopt{position:relative;min-height:48px;padding:10px 16px;border-radius:10px;background:rgba(26,36,22,0.75);border:1.5px solid rgba(122,179,86,0.3);color:#e8dcc8;font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.08em;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .08s ease}',
    '.DBopt:active{transform:scale(0.96)}',
    '.DBopt.good{background:rgba(122,179,86,0.3);border-color:#7ab356;color:#7ab356}',
    '.DBopt.bad{background:rgba(199,80,80,0.22);border-color:#c47a7a;color:#c47a7a}',
    // Colorblind-safe symbol overlays: right/wrong is never color-only
    '.DBopt.good::after,.DBopt.goodSym::after{content:"\\2713";position:absolute;top:1px;right:4px;font-size:0.75rem;font-weight:700;line-height:1;color:#7ab356;font-family:Georgia,serif}',
    '.DBopt.bad::after,.DBopt.badSym::after{content:"\\2717";position:absolute;top:1px;right:4px;font-size:0.75rem;font-weight:700;line-height:1;color:#c47a7a;font-family:Georgia,serif}',
    // Big prompt (math, Stroop, flanker)
    '.DBprompt{font-family:Bebas Neue,sans-serif;font-size:2.4rem;margin:14px 0;letter-spacing:0.06em;min-height:3rem;display:flex;align-items:center;justify-content:center}',
    // Reaction disc
    '#DBrt{width:150px;height:150px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:1rem;margin:12px auto;cursor:pointer;letter-spacing:2px;-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
    '#DBrt.wait{background:rgba(199,80,80,0.15);border:2.5px solid rgba(199,80,80,0.5);color:#c47a7a}',
    '#DBrt.go{background:rgba(122,179,86,0.3);border:2.5px solid #7ab356;color:#7ab356;animation:dbPulse .5s ease-out}',
    // Grid renderer (pattern, N-Back, Corsi)
    '.DBgridRow{display:flex;justify-content:center;gap:3px;margin:0}',
    '.DBgridCell{border-radius:4px;box-sizing:border-box}',
    '.DBgridCell.off{background:rgba(26,36,22,0.5);border:1px solid rgba(122,179,86,0.15)}',
    '.DBgridCell.on{background:rgba(122,179,86,0.6);border:1px solid rgba(122,179,86,0.3)}',
    '.DBgridCell.flash{background:rgba(200,168,75,0.8);border:1px solid #c8a84b;box-shadow:0 0 12px rgba(200,168,75,0.6)}',
    '.DBgridCell.player{background:rgba(91,155,213,0.55);border:1px solid #5b9bd5}',
    // Colorblind-safe glyphs: sequence flash vs your taps differ by symbol, not just hue
    '.DBgridCell.flash,.DBgridCell.player{display:flex;align-items:center;justify-content:center;font-family:Georgia,serif}',
    '.DBgridCell.flash::after{content:"\\2726";font-size:1rem;line-height:1;color:rgba(13,16,12,0.8)}',
    '.DBgridCell.player::after{content:"\\25CF";font-size:0.8rem;line-height:1;color:#e8dcc8}',
    '.DBgridCell.tap{cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
    // Flanker arrows
    '.DBflanker{font-family:serif;font-size:3.5rem;letter-spacing:0.05em;margin:20px 0;display:flex;justify-content:center;gap:6px}',
    '.DBflanker .center{color:#ffdc70;text-shadow:0 0 12px rgba(255,216,106,0.4)}',
    '.DBflanker .flank{color:rgba(232,220,200,0.6)}',
    // Status row (counter, timer)
    '.DBstatus{font-size:0.72rem;color:rgba(232,220,200,0.65);margin:6px 0}',
    '.DBstatus .ok{color:#8fc57a}',
    // Results
    '.DBresultsTitle{font-family:Bebas Neue,sans-serif;font-size:0.82rem;letter-spacing:0.18em;color:#c8a84b;margin:12px 0 2px}',
    '.DBbigScore{font-family:Bebas Neue,sans-serif;font-size:3.6rem;color:#c8a84b;line-height:1;margin-bottom:4px;animation:dbPop .4s cubic-bezier(.2,1.2,.3,1) both}',
    '.DBscoreSub{font-family:DM Mono,monospace;font-size:0.7rem;font-weight:500;color:rgba(232,220,200,0.6);letter-spacing:0.06em;margin-bottom:14px}',
    '.DBdomainGrid{margin:12px auto 8px;max-width:340px;font-size:0.72rem;text-align:left}',
    '.DBdomainRow{display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-family:Georgia,serif}',
    '.DBdomainLbl{font-family:Bebas Neue,sans-serif;letter-spacing:0.1em;font-size:0.72rem}',
    '.DBdomainVal{font-family:DM Mono,monospace;font-weight:700}',
    '.DBbar{height:5px;background:rgba(26,36,22,0.55);border-radius:3px;margin:2px 0 6px;overflow:hidden}',
    '.DBbar .fill{height:100%;border-radius:3px;transition:width .4s ease}',
    '.DBtrend{display:inline-flex;align-items:center;gap:2px;font-family:DM Mono,monospace;font-size:0.7rem;font-weight:500;color:rgba(232,220,200,0.5);margin-left:6px}',
    '.DBhonest{margin-top:18px;padding:10px 12px;font-size:0.7rem;font-weight:500;color:rgba(232,220,200,0.6);line-height:1.55;font-style:italic;border-top:1px solid rgba(74,124,53,0.18)}',
    '.DBreplay{margin-top:10px;font-family:DM Mono,monospace;font-size:0.7rem;font-weight:500;color:rgba(200,168,75,0.8);letter-spacing:0.08em;background:rgba(200,168,75,0.08);border:1px solid rgba(200,168,75,0.25);border-radius:6px;padding:6px 10px;display:inline-block}',
    '.DBretry{display:flex;align-items:center;justify-content:center;width:fit-content;min-height:48px;box-sizing:border-box;margin:14px auto 0;padding:8px 24px;border-radius:9px;background:rgba(26,31,23,0.7);border:1.5px solid rgba(220,180,120,0.35);color:#c8a84b;font-family:Bebas Neue,sans-serif;font-size:0.82rem;letter-spacing:0.14em;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}'
  ].join('');
  document.head.appendChild(s);
})();

// ── State ───────────────────────────────────────────────────────────────
var S=null;
var hostEl=null, pan=null;
// Exercise generation counter — bumped on every exercise start/finish and
// on remount. Every scheduled advance timer captures it via later() and
// bails if the generation moved, so a stale timer can never fire into the
// next exercise and double-advance the 5-exercise session.
var gen=0;
function later(fn, ms){
  var g=gen;
  return setTimeout(function(){ if(!alive() || gen!==g)return; fn(); }, ms);
}
// Adaptive difficulty store: per-exercise level saved in localStorage
function loadLevel(exKey, dflt){
  try{
    var v=parseInt(localStorage.getItem('db_level_'+exKey)||'',10);
    if(isNaN(v))return dflt;
    return v;
  }catch(e){return dflt;}
}
function saveLevel(exKey, v){
  try{localStorage.setItem('db_level_'+exKey, String(v));}catch(e){}
}
function adjustLevel(exKey, accuracy, min, max){
  var cur=loadLevel(exKey, min);
  var next=cur;
  if(accuracy>=0.85 && cur<max) next=cur+1;
  else if(accuracy<0.55 && cur>min) next=cur-1;
  if(next!==cur) saveLevel(exKey, next);
  return cur;
}

// ── Daily rotation ──────────────────────────────────────────────────────
// Deterministic shuffle seeded by the date; picks 5 exercises per day.
function todayKey(){
  var d=new Date();
  return d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate();
}
function dayOfYear(){
  var d=new Date();
  var start=new Date(d.getUTCFullYear(),0,0);
  var diff=(d-start)+((start.getTimezoneOffset()-d.getTimezoneOffset())*60*1000);
  return Math.floor(diff/86400000);
}
function pickDailyExercises(){
  var keys=EX_KEYS.slice();
  var doy=dayOfYear();
  // Seeded Fisher-Yates with LCG
  var seed=doy*2654435761 >>> 0;
  function rng(){ seed = (seed*9301+49297) % 233280; return seed/233280; }
  for(var i=keys.length-1;i>0;i--){var j=Math.floor(rng()*(i+1));var t=keys[i];keys[i]=keys[j];keys[j]=t;}
  return keys.slice(0,5);
}

// ── Helpers ─────────────────────────────────────────────────────────────
function dots(total, active){
  var h='<div class="DBdots">';
  for(var i=0;i<total;i++){
    var cls='DBdot';
    if(i<active)cls+=' done';
    else if(i===active)cls+=' active';
    h+='<div class="'+cls+'"></div>';
  }
  h+='</div>';
  return h;
}
function shuf(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

// ── Word Recall ─────────────────────────────────────────────────────────
var WORD_BANKS=[
  ['fern','moss','stone','river','cloud','bloom','thorn','petal','root','bark'],
  ['oak','rain','dew','soil','wind','leaf','vine','seed','pond','shade'],
  ['grove','dawn','mist','ridge','trail','creek','pine','cliff','meadow','frost']
];
function startWordRecall(){
  // Adaptive: level = number of words to remember, 4-8
  var level=loadLevel('wordRecall', 5);
  level=clamp(level, 4, 8);
  var bank=shuf(WORD_BANKS[Math.floor(Math.random()*WORD_BANKS.length)].slice());
  var target=bank.slice(0,level), distract=bank.slice(level,level*2);
  S.exData={phase:'mem', target:target, distract:distract, recalled:[], wrongs:0, level:level};
  var h='<div class="DBexTitle">WORD RECALL</div>';
  h+='<div class="DBexDesc">Memorize these '+level+' words · 10s</div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:14px 0;">';
  for(var w=0;w<target.length;w++)h+='<div style="padding:10px 14px;background:rgba(26,36,22,0.7);border:1px solid rgba(122,179,86,0.3);border-radius:8px;font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.08em;">'+target[w].toUpperCase()+'</div>';
  h+='</div>'+dots(5, S.exIndex);
  pan.innerHTML=h;
  later(function(){
    if(S.exData.phase!=='mem')return;
    S.exData.phase='recall';
    var all=shuf(S.exData.target.concat(S.exData.distract));
    var h2='<div class="DBexTitle">WORD RECALL</div>';
    h2+='<div class="DBexDesc">Tap the '+S.exData.level+' words you saw</div>';
    h2+='<div class="DBopts" id="DBwr">';
    for(var i=0;i<all.length;i++) h2+='<button class="DBopt" data-w="'+all[i]+'">'+all[i].toUpperCase()+'</button>';
    h2+='</div><div class="DBstatus" id="DBmsg">0/'+S.exData.level+' selected</div>'+dots(5, S.exIndex);
    pan.innerHTML=h2;
    pan.querySelector('#DBwr').addEventListener('click', function(e){
      var b=e.target.closest('[data-w]'); if(!b || S.exData.phase!=='recall' || b.disabled)return;
      b.disabled=true;
      var word=b.getAttribute('data-w');
      var isTgt=S.exData.target.indexOf(word)>=0;
      if(isTgt){ b.className='DBopt good'; S.exData.recalled.push(word); }
      else{ b.className='DBopt bad'; S.exData.wrongs++; }
      var msg=pan.querySelector('#DBmsg');
      if(msg)msg.textContent=S.exData.recalled.length+'/'+S.exData.level+' selected';
      if(S.exData.recalled.length>=S.exData.level || S.exData.wrongs>=3){
        S.exData.phase='done';
        var acc=S.exData.recalled.length/S.exData.level;
        var scoreRaw=Math.round(acc*100);
        adjustLevel('wordRecall', acc, 4, 8);
        finishExercise(scoreRaw, 'memory');
      }
    });
  }, 10000);
}

// ── Quick Math ──────────────────────────────────────────────────────────
function startMath(){
  var level=loadLevel('math', 1);  // 0=easy, 1=med, 2=hard
  level=clamp(level, 0, 2);
  S.exData={correct:0,total:0,startTime:Date.now(),maxTime:25000,level:level};
  showMath();
}
function showMath(){
  if(!alive())return;
  if(Date.now()-S.exData.startTime > S.exData.maxTime){
    var acc=S.exData.total>0 ? S.exData.correct/S.exData.total : 0;
    var scoreRaw=Math.min(100, Math.round(S.exData.correct * (S.exData.level===0?10:S.exData.level===1?12.5:15)));
    adjustLevel('math', acc, 0, 2);
    finishExercise(scoreRaw, 'speed');
    return;
  }
  var lvl=S.exData.level;
  var ops=lvl===0?['+','-'] : lvl===1?['+','-','×'] : ['+','-','×','÷'];
  var op=ops[Math.floor(Math.random()*ops.length)];
  var A,B,ans;
  if(op==='+'){
    var r=lvl===0?20:lvl===1?50:99;
    A=5+Math.floor(Math.random()*r); B=5+Math.floor(Math.random()*r); ans=A+B;
  } else if(op==='-'){
    var r2=lvl===0?20:lvl===1?50:99;
    A=20+Math.floor(Math.random()*r2); B=1+Math.floor(Math.random()*(A-1)); ans=A-B;
  } else if(op==='×'){
    var lim=lvl===1?12:13;
    A=2+Math.floor(Math.random()*lim); B=2+Math.floor(Math.random()*lim); ans=A*B;
  } else {
    B=2+Math.floor(Math.random()*11); ans=2+Math.floor(Math.random()*11); A=ans*B;
  }
  var wrongs=[];
  while(wrongs.length<3){
    var w=ans + Math.floor(Math.random()*11) - 5;
    if(w!==ans && wrongs.indexOf(w)<0 && w>=0) wrongs.push(w);
  }
  var opts=shuf([ans].concat(wrongs));
  var el=Math.max(0, Math.round((S.exData.maxTime-(Date.now()-S.exData.startTime))/1000));
  var h='<div class="DBexTitle">QUICK MATH</div>';
  h+='<div class="DBexDesc">Solve as many as you can · '+el+'s</div>';
  h+='<div class="DBprompt">'+A+' '+op+' '+B+'</div>';
  h+='<div class="DBopts">';
  for(var i=0;i<opts.length;i++) h+='<button class="DBopt" data-v="'+opts[i]+'" data-a="'+ans+'">'+opts[i]+'</button>';
  h+='</div><div class="DBstatus"><span class="ok">'+S.exData.correct+'</span> correct</div>'+dots(5, S.exIndex);
  pan.innerHTML=h;
  pan.querySelector('.DBopts').addEventListener('click', function(e){
    var b=e.target.closest('[data-v]'); if(!b || b.disabled)return;
    var all=this.querySelectorAll('[data-v]');
    for(var q=0;q<all.length;q++)all[q].disabled=true;
    S.exData.total++;
    var picked=parseInt(b.getAttribute('data-v'),10), correct=parseInt(b.getAttribute('data-a'),10);
    if(picked===correct){S.exData.correct++; b.className='DBopt good'; try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}}
    else b.className='DBopt bad';
    later(showMath, 250);
  });
}

// ── Reaction Time ───────────────────────────────────────────────────────
function startReaction(){
  S.exData={times:[], phase:'wait', attempts:0, max:7};
  showReaction();
}
function showReaction(){
  if(!alive())return;
  if(S.exData.attempts>=S.exData.max){
    var avg=0;
    S.exData.times.forEach(function(t){avg+=t;});
    avg=S.exData.times.length>0 ? Math.round(avg/S.exData.times.length) : 999;
    // Scoring: 100 at 200ms, 0 at 500ms, linear between
    var scoreRaw=clamp(Math.round(100 - (avg-200)/3), 0, 100);
    finishExercise(scoreRaw, 'speed');
    return;
  }
  S.exData.phase='wait';
  var last=S.exData.times.length>0 ? S.exData.times[S.exData.times.length-1]+'ms' : '';
  var h='<div class="DBexTitle">REACTION</div>';
  h+='<div class="DBexDesc">Tap the circle the instant it turns green · '+(S.exData.attempts+1)+'/'+S.exData.max+'</div>';
  h+='<div id="DBrt" class="wait">WAIT…</div>';
  h+='<div class="DBstatus" id="DBrmsg">'+last+'</div>'+dots(5, S.exIndex);
  pan.innerHTML=h;
  var delay=1200+Math.random()*2200;
  S.exData.timer=later(function(){
    if(S.exData.phase!=='wait')return;
    S.exData.phase='go'; S.exData.goTime=Date.now();
    var t=pan.querySelector('#DBrt');
    if(t){ t.className='go'; t.textContent='TAP!'; }
  }, delay);
  pan.querySelector('#DBrt').addEventListener('click', function(){
    if(S.exData.phase==='wait'){
      clearTimeout(S.exData.timer);
      S.exData.phase='early';
      var m=pan.querySelector('#DBrmsg');
      if(m){ m.innerHTML='<span style="color:#c47a7a">Too early — wait for green.</span>'; }
      later(showReaction, 700);
      return;
    }
    if(S.exData.phase==='go'){
      var dt=Date.now()-S.exData.goTime;
      S.exData.times.push(dt); S.exData.attempts++; S.exData.phase='done';
      var m2=pan.querySelector('#DBrmsg');
      if(m2){ m2.innerHTML='<span class="ok">'+dt+'ms</span>'; }
      try{navigator.vibrate&&navigator.vibrate(10);}catch(e){}
      later(showReaction, 600);
    }
  });
}

// ── Pattern Match ───────────────────────────────────────────────────────
function renderPatternGrid(g, cs){
  var h='';
  for(var r=0;r<g.length;r++){
    h+='<div class="DBgridRow">';
    for(var c=0;c<g[r].length;c++){
      h+='<div class="DBgridCell '+(g[r][c]?'on':'off')+'" style="width:'+cs+'px;height:'+cs+'px"></div>';
    }
    h+='</div>';
  }
  return h;
}
function startPattern(){
  var level=loadLevel('pattern', 0);  // 0=3x3, 1=4x4, 2=5x5
  level=clamp(level, 0, 2);
  S.exData={correct:0, round:0, max:5, level:level};
  showPattern();
}
function showPattern(){
  if(!alive())return;
  if(S.exData.round>=S.exData.max){
    var acc=S.exData.correct/S.exData.max;
    var scoreRaw=Math.round(acc*100);
    adjustLevel('pattern', acc, 0, 2);
    finishExercise(scoreRaw, 'visual');
    return;
  }
  S.exData.round++;
  var sz=3+S.exData.level;
  var pat=[];
  for(var r=0;r<sz;r++){ pat[r]=[]; for(var c=0;c<sz;c++) pat[r][c]=Math.random()>0.5?1:0; }
  // Generate 3 variants differing from original
  var opts=[pat];
  for(var v=0;v<3;v++){
    var vr=[]; for(var rr=0;rr<sz;rr++) vr[rr]=pat[rr].slice();
    var flips=1+Math.floor(Math.random()*2);
    for(var f=0;f<flips;f++){
      var fr=Math.floor(Math.random()*sz), fc=Math.floor(Math.random()*sz);
      vr[fr][fc]=vr[fr][fc]?0:1;
    }
    opts.push(vr);
  }
  var correctIdx=0;
  // Shuffle while tracking correct index
  for(var i=opts.length-1;i>0;i--){
    var jj=Math.floor(Math.random()*(i+1));
    var t=opts[i]; opts[i]=opts[jj]; opts[jj]=t;
    if(jj===correctIdx)correctIdx=i;
    else if(i===correctIdx)correctIdx=jj;
  }
  var cellOrig=sz<=3?36:sz===4?28:22;
  var cellOpt=sz<=3?22:sz===4?18:14;
  var h='<div class="DBexTitle">PATTERN MATCH</div>';
  h+='<div class="DBexDesc">Which grid matches the original? · '+S.exData.round+'/'+S.exData.max+'</div>';
  h+='<div style="margin:10px 0">'+renderPatternGrid(pat, cellOrig)+'</div>';
  h+='<div style="font-size:0.7rem;font-weight:500;opacity:0.6;margin:4px 0">↑ ORIGINAL ↑</div>';
  h+='<div id="DBpatOpts" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0">';
  for(var k=0;k<opts.length;k++){
    h+='<div class="DBopt" style="padding:6px;min-height:auto" data-i="'+k+'" data-c="'+correctIdx+'">'+renderPatternGrid(opts[k],cellOpt)+'</div>';
  }
  h+='</div>'+dots(5, S.exIndex);
  pan.innerHTML=h;
  pan.querySelector('#DBpatOpts').addEventListener('click', function(e){
    var el=e.target.closest('[data-i]');
    if(!el || this._done)return;
    this._done=1;
    var picked=parseInt(el.getAttribute('data-i'),10), correct=parseInt(el.getAttribute('data-c'),10);
    if(picked===correct){S.exData.correct++; el.classList.add('good'); try{navigator.vibrate&&navigator.vibrate(8);}catch(ev){}}
    else el.classList.add('bad');
    later(showPattern, 450);
  });
}

// ── Stroop (Color Naming) ───────────────────────────────────────────────
var STROOP_WORDS=['RED','GREEN','BLUE','YELLOW'];
var STROOP_HEX  =['#c47a7a','#7ab356','#5b9bd5','#c8a84b'];
function startStroop(){
  S.exData={correct:0, total:0, startTime:Date.now(), maxTime:20000};
  showStroop();
}
function showStroop(){
  if(!alive())return;
  if(Date.now()-S.exData.startTime > S.exData.maxTime){
    var scoreRaw=Math.min(100, Math.round(S.exData.correct*14));
    finishExercise(scoreRaw, 'attention');
    return;
  }
  var wi=Math.floor(Math.random()*4), ci;
  do{ ci=Math.floor(Math.random()*4); } while(ci===wi);
  var el=Math.max(0, Math.round((S.exData.maxTime-(Date.now()-S.exData.startTime))/1000));
  var h='<div class="DBexTitle">COLOR NAMING</div>';
  h+='<div class="DBexDesc">Tap the <b>ink color</b>, not the word · '+el+'s</div>';
  h+='<div class="DBprompt" style="color:'+STROOP_HEX[ci]+';letter-spacing:0.14em;font-size:2.8rem">'+STROOP_WORDS[wi]+'</div>';
  h+='<div class="DBopts">';
  for(var i=0;i<4;i++){
    h+='<button class="DBopt" style="border-color:'+STROOP_HEX[i]+'66;color:'+STROOP_HEX[i]+'" data-v="'+i+'" data-a="'+ci+'">'+STROOP_WORDS[i]+'</button>';
  }
  h+='</div><div class="DBstatus"><span class="ok">'+S.exData.correct+'</span> correct</div>'+dots(5, S.exIndex);
  pan.innerHTML=h;
  pan.querySelector('.DBopts').addEventListener('click', function(e){
    var b=e.target.closest('[data-v]'); if(!b || b.disabled)return;
    var all=this.querySelectorAll('[data-v]');
    for(var q=0;q<all.length;q++)all[q].disabled=true;
    S.exData.total++;
    var picked=parseInt(b.getAttribute('data-v'),10), correct=parseInt(b.getAttribute('data-a'),10);
    if(picked===correct){S.exData.correct++; b.style.background='rgba(122,179,86,0.25)'; b.classList.add('goodSym');}
    else{ b.style.background='rgba(199,80,80,0.22)'; b.classList.add('badSym'); }
    later(showStroop, 200);
  });
}

// ── N-Back (working memory) ─────────────────────────────────────────────
// Tiles flash one at a time in a 3x3 grid. Player taps MATCH if the
// current tile's position is the same as N steps ago, otherwise does
// nothing (or explicit NO-MATCH). 2-back is canonical; we adapt N.
function startNBack(){
  var level=loadLevel('nback', 1);  // 1..3 (N value)
  level=clamp(level, 1, 3);
  var trials=12;
  var sequence=[];
  for(var i=0;i<trials+level;i++) sequence.push(Math.floor(Math.random()*9));
  // Ensure at least 3 matches by forcing some positions to equal N steps back
  for(var m=0;m<3;m++){
    var pos=level+2+Math.floor(Math.random()*(trials-2));
    sequence[pos]=sequence[pos-level];
  }
  S.exData={
    level:level, trials:trials, sequence:sequence,
    idx:0, hits:0, misses:0, falseAlarms:0, answered:false,
    matchTotal:0
  };
  // Count how many matches exist in the sequence starting from idx=level
  for(var i2=level;i2<level+trials;i2++){
    if(sequence[i2]===sequence[i2-level]) S.exData.matchTotal++;
  }
  showNBackIntro();
}
function showNBackIntro(){
  var h='<div class="DBexTitle">N-BACK · '+S.exData.level+'-back</div>';
  h+='<div class="DBexDesc">Tap MATCH when the current tile is in the same spot as '+S.exData.level+' step'+(S.exData.level>1?'s':'')+' ago</div>';
  h+='<div style="display:flex;justify-content:center;margin:20px 0"><div style="display:inline-grid;grid-template-columns:repeat(3,56px);gap:4px">';
  for(var i=0;i<9;i++) h+='<div class="DBgridCell off" style="width:56px;height:56px"></div>';
  h+='</div></div>';
  h+='<button class="DBexplainGo">BEGIN</button>'+dots(5, S.exIndex);
  pan.innerHTML=h;
  pan.querySelector('.DBexplainGo').addEventListener('click', function(){
    S.exData.idx=0;
    nBackTick();
  });
}
function nBackTick(){
  if(!alive())return;
  var d=S.exData;
  // End condition
  if(d.idx >= d.level + d.trials){
    var nonMatch=d.trials - d.matchTotal;
    var acc = d.matchTotal>0 ? d.hits/d.matchTotal : 0;
    var correctReject = nonMatch>0 ? (nonMatch-d.falseAlarms)/nonMatch : 1;
    // Composite accuracy weights hits and correct rejections equally
    var composite = (acc + correctReject) / 2;
    var scoreRaw = clamp(Math.round(100*composite), 0, 100);
    adjustLevel('nback', composite, 1, 3);
    finishExercise(scoreRaw, 'working');
    return;
  }
  var pos=d.sequence[d.idx];
  var isMatchTrial = d.idx>=d.level;
  var expectMatch = isMatchTrial && d.sequence[d.idx]===d.sequence[d.idx-d.level];
  d.answered=false;
  d.expectMatch=expectMatch;
  var h='<div class="DBexTitle">N-BACK · '+d.level+'-back</div>';
  h+='<div class="DBexDesc">'+(d.idx < d.level ? 'Remember the positions' : 'Same spot as '+d.level+' ago?')+'</div>';
  h+='<div style="display:flex;justify-content:center;margin:16px 0"><div style="display:inline-grid;grid-template-columns:repeat(3,56px);gap:4px" id="DBnbackGrid">';
  for(var i=0;i<9;i++) h+='<div class="DBgridCell '+(i===pos?'flash':'off')+'" style="width:56px;height:56px"></div>';
  h+='</div></div>';
  h+='<div class="DBopts">';
  var dis=d.idx<d.level?'disabled style="opacity:0.3"':'';
  h+='<button class="DBopt" data-ans="match" '+dis+'>MATCH</button>';
  h+='<button class="DBopt" data-ans="no" '+dis+'>NO MATCH</button>';
  h+='</div>';
  h+='<div class="DBstatus" id="DBnbackMsg">'+(d.idx+1)+'/'+(d.level+d.trials)+' · <span class="ok">'+d.hits+'</span> hits · <span style="color:#c47a7a">'+d.falseAlarms+'</span> false</div>'+dots(5, S.exIndex);
  pan.innerHTML=h;
  pan.querySelectorAll('[data-ans]').forEach(function(btn){
    btn.addEventListener('click', function(){
      if(d.answered || d.idx < d.level)return;
      d.answered=true;
      var ans=btn.getAttribute('data-ans');
      var correct = (ans==='match') === expectMatch;
      if(ans==='match' && expectMatch) d.hits++;
      else if(ans==='match' && !expectMatch) d.falseAlarms++;
      // Visual feedback
      btn.classList.add(correct?'good':'bad');
      var msg=pan.querySelector('#DBnbackMsg');
      if(msg)msg.innerHTML=correct?'<span class="ok">✓ correct</span>':'<span style="color:#c47a7a">✗ '+(expectMatch?'was a match':'was not a match')+'</span>';
      try{navigator.vibrate&&navigator.vibrate(correct?8:[6,40,6]);}catch(ev){}
    });
  });
  later(function(){
    // Untimed no-answer = implicit miss (if expected match) or no-op
    if(!d.answered && isMatchTrial && expectMatch) d.misses++;
    d.idx++;
    nBackTick();
  }, 2200);  // 2.2s per tile gives time to look + decide
}

// ── Corsi Blocks (spatial working memory) ───────────────────────────────
function startCorsi(){
  var level=loadLevel('corsi', 3);  // span length
  level=clamp(level, 3, 7);
  S.exData={level:level, sequence:[], playerSeq:[], phase:'show', passed:0, failed:0, round:0, max:5};
  nextCorsiRound();
}
function nextCorsiRound(){
  if(!alive())return;
  var d=S.exData;
  if(d.round>=d.max){
    var acc=d.passed/d.max;
    var scoreRaw=Math.round(acc*100);
    adjustLevel('corsi', acc, 3, 7);
    finishExercise(scoreRaw, 'spatial');
    return;
  }
  d.round++;
  // Generate new sequence of `level` distinct cells (0-8)
  var pool=[0,1,2,3,4,5,6,7,8]; shuf(pool);
  d.sequence=pool.slice(0,d.level);
  d.playerSeq=[];
  d.phase='show';
  d.showIdx=-1;
  d.locked=false;
  renderCorsi();
  // Animate sequence — slower at higher spans so the sequence stays readable
  var delay = d.level<=4 ? 650 : d.level<=6 ? 750 : 850;
  function step(){
    if(d.phase!=='show')return;
    d.showIdx++;
    if(d.showIdx>=d.sequence.length){
      d.phase='recall';
      d.showIdx=-1;
      renderCorsi();
      return;
    }
    renderCorsi();
    later(step, delay);
  }
  later(step, 500);
}
function renderCorsi(){
  var d=S.exData;
  var h='<div class="DBexTitle">CORSI BLOCKS</div>';
  h+='<div class="DBexDesc">'+(d.phase==='show'?'Watch the order':'Tap the squares in the same order')+' · span '+d.level+' · round '+d.round+'/'+d.max+'</div>';
  h+='<div style="display:flex;justify-content:center;margin:16px 0"><div style="display:inline-grid;grid-template-columns:repeat(3,68px);gap:6px" id="DBcorsi">';
  for(var i=0;i<9;i++){
    var cls='DBgridCell';
    if(d.phase==='show' && d.showIdx>=0 && d.sequence[d.showIdx]===i) cls+=' flash';
    else if(d.phase==='recall' && d.playerSeq.indexOf(i)>=0) cls+=' player';
    else cls+=' off'+(d.phase==='recall'?' tap':'');
    h+='<div class="'+cls+'" data-i="'+i+'" style="width:68px;height:68px"></div>';
  }
  h+='</div></div>'+dots(5, S.exIndex);
  pan.innerHTML=h;
  if(d.phase==='recall'){
    pan.querySelector('#DBcorsi').addEventListener('click', function(e){
      var cell=e.target.closest('[data-i]'); if(!cell || d.locked)return;
      var idx=parseInt(cell.getAttribute('data-i'),10);
      if(d.playerSeq.indexOf(idx)>=0)return;
      d.playerSeq.push(idx);
      renderCorsi();
      var stepIdx=d.playerSeq.length-1;
      var correct=d.sequence[stepIdx]===idx;
      if(!correct){ d.failed++; d.locked=true; later(nextCorsiRound, 700); return; }
      if(d.playerSeq.length===d.sequence.length){
        d.passed++; d.locked=true;
        later(nextCorsiRound, 700);
      }
    });
  }
}

// ── Flanker (selective attention) ───────────────────────────────────────
function startFlanker(){
  var level=loadLevel('flanker', 0);  // 0=5 trials, 1=8, 2=12
  level=clamp(level, 0, 2);
  S.exData={level:level, trials:8+level*4, round:0, correct:0, startTime:0};
  nextFlankerTrial();
}
function nextFlankerTrial(){
  if(!alive())return;
  var d=S.exData;
  if(d.round>=d.trials){
    var acc=d.correct/d.trials;
    var scoreRaw=Math.round(acc*100);
    adjustLevel('flanker', acc, 0, 2);
    finishExercise(scoreRaw, 'attention');
    return;
  }
  d.round++;
  // Random: center direction, flanker direction (same=congruent, opposite=incongruent)
  var centerDir=Math.random()<0.5?'◀':'▶';
  var flankDir=Math.random()<0.5 ? centerDir : (centerDir==='◀'?'▶':'◀');
  d.centerDir=centerDir;
  d.startTime=Date.now();
  var h='<div class="DBexTitle">FLANKER</div>';
  h+='<div class="DBexDesc">Tap the direction of the <b>center</b> arrow · '+d.round+'/'+d.trials+'</div>';
  h+='<div class="DBflanker">';
  h+='<span class="flank">'+flankDir+'</span>';
  h+='<span class="flank">'+flankDir+'</span>';
  h+='<span class="center">'+centerDir+'</span>';
  h+='<span class="flank">'+flankDir+'</span>';
  h+='<span class="flank">'+flankDir+'</span>';
  h+='</div>';
  h+='<div class="DBopts">';
  h+='<button class="DBopt" data-d="◀" style="font-size:1.8rem;min-width:70px">◀</button>';
  h+='<button class="DBopt" data-d="▶" style="font-size:1.8rem;min-width:70px">▶</button>';
  h+='</div>';
  h+='<div class="DBstatus"><span class="ok">'+d.correct+'</span> correct</div>'+dots(5, S.exIndex);
  pan.innerHTML=h;
  pan.querySelector('.DBopts').addEventListener('click', function(e){
    var b=e.target.closest('[data-d]'); if(!b || b.disabled)return;
    var all=this.querySelectorAll('[data-d]');
    for(var q=0;q<all.length;q++)all[q].disabled=true;
    var picked=b.getAttribute('data-d');
    if(picked===d.centerDir){ d.correct++; b.classList.add('good'); try{navigator.vibrate&&navigator.vibrate(8);}catch(e){} }
    else b.classList.add('bad');
    later(nextFlankerTrial, 500);
  });
}

// ── Session flow ────────────────────────────────────────────────────────
function alive(){ return !!pan && document.body.contains(pan); }

function startExerciseByKey(key){
  gen++;
  S.currentKey=key;
  S.exData={};
  switch(key){
    case 'wordRecall': startWordRecall(); break;
    case 'math': startMath(); break;
    case 'reaction': startReaction(); break;
    case 'pattern': startPattern(); break;
    case 'stroop': startStroop(); break;
    case 'nback': startNBack(); break;
    case 'corsi': startCorsi(); break;
    case 'flanker': startFlanker(); break;
  }
}

function showExplainer(key, onStart){
  var ex=EXERCISES[key];
  var dom=DOMAINS[ex.domain];
  var level='';
  if(key==='wordRecall') level='Level '+loadLevel('wordRecall',5)+' words';
  else if(key==='math'){var ml=loadLevel('math',1);level='Level '+['Easy','Medium','Hard'][ml];}
  else if(key==='pattern'){var pl=loadLevel('pattern',0);level=(3+pl)+'×'+(3+pl)+' grids';}
  else if(key==='nback') level=loadLevel('nback',1)+'-back';
  else if(key==='corsi') level='Span '+loadLevel('corsi',3);
  else if(key==='flanker'){var fl=loadLevel('flanker',0);level=(5+fl*3)+' trials';}
  var h='<div class="DBexplain">';
  h+='<div class="DBexplainTitle">'+ex.label+'</div>';
  h+='<div class="DBexplainDom" style="color:'+dom.color+';background:'+dom.color+'22;border:1px solid '+dom.color+'55">'+dom.label+'</div>';
  h+='<div class="DBexplainBody">'+ex.trains+'</div>';
  h+='<div class="DBexplainSrc">'+ex.source+'</div>';
  if(level)h+='<div class="DBexplainLevel">'+level+'</div>';
  h+='<button class="DBexplainGo">BEGIN</button>';
  h+='</div>'+dots(5, S.exIndex);
  pan.innerHTML=h;
  pan.querySelector('.DBexplainGo').addEventListener('click', function(){ onStart(); });
}

function finishExercise(rawScore, domain){
  gen++;  // kill any timer still pending from the exercise that just ended
  S.results.push({key:S.currentKey, score:rawScore, domain:domain});
  S.exIndex++;
  if(S.exIndex>=S.exerciseQueue.length){
    showResults();
  } else {
    later(runCurrentExercise, 400);
  }
}

function runCurrentExercise(){
  var key=S.exerciseQueue[S.exIndex];
  showExplainer(key, function(){ startExerciseByKey(key); });
}

function startSession(){
  S.exerciseQueue=pickDailyExercises();
  S.exIndex=0;
  S.results=[];
  runCurrentExercise();
}

// ── History + sparklines ────────────────────────────────────────────────
function loadHistory(){
  try{return JSON.parse(localStorage.getItem('dailybloom_history')||'[]');}catch(e){return [];}
}
function saveHistory(h){
  try{localStorage.setItem('dailybloom_history', JSON.stringify(h.slice(-90)));}catch(e){}
}
function domainSparkline(domainKey){
  var hist=loadHistory();
  var pts=[];
  hist.slice(-7).forEach(function(entry){
    if(entry.domainScores && entry.domainScores[domainKey]!==undefined){
      pts.push(entry.domainScores[domainKey]);
    }
  });
  if(pts.length<2)return '';
  var col=DOMAINS[domainKey].color;
  var last=pts[pts.length-1], prev=pts[pts.length-2];
  var arrow=last>prev?'▲':last<prev?'▼':'—';
  var arrowCol=last>prev?'#8fc57a':last<prev?'#e07a7a':'rgba(232,220,200,0.5)';
  return '<span class="DBtrend" style="color:'+arrowCol+'">'+arrow+'</span>';
}

// ── Hub (landing screen) ────────────────────────────────────────────────
function showHub(){
  if(!hostEl)return;
  gen++;
  if(!pan){pan=document.createElement('div');pan.id='DBpan';hostEl.appendChild(pan);}
  S={exerciseQueue:null, exIndex:0, results:[], currentKey:null, exData:{}};
  var daily=pickDailyExercises();
  var today=todayKey();
  var hist=loadHistory();
  var alreadyToday=hist.some(function(h){return h.date===today && !h.replay;});
  var lastScore=hist.length>0 ? hist[hist.length-1].score : null;
  var streak=computeStreak(hist);
  var h='<div class="DBhub">';
  h+='<div class="DBhubTitle">DAILY BLOOM</div>';
  h+='<div class="DBhubSub">A short daily workout for attention, memory, and processing speed. 5 exercises, about 4 minutes. Your performance on each task is tracked over time.</div>';
  // Today's picks
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;letter-spacing:0.16em;color:rgba(232,220,200,0.55);margin-top:12px">TODAY</div>';
  h+='<div class="DBhubRow">';
  daily.forEach(function(k){
    var ex=EXERCISES[k]; var dom=DOMAINS[ex.domain];
    h+='<div class="DBhubChip"><span class="dom" style="color:'+dom.color+'">'+dom.label+'</span><span>'+ex.label.toLowerCase()+'</span></div>';
  });
  h+='</div>';
  // Streak + last score
  if(streak>0 || lastScore!==null){
    h+='<div style="display:flex;justify-content:center;gap:18px;margin:12px 0;font-family:DM Mono,monospace;font-size:0.72rem">';
    if(streak>0)h+='<div><span style="color:#c8a84b">🌿 '+streak+'</span> day streak</div>';
    if(lastScore!==null)h+='<div><span style="color:#8fc57a">'+lastScore+'</span> last bloom</div>';
    h+='</div>';
  }
  // Start button
  h+='<button class="DBhubStart" id="DBstart">'+(alreadyToday?'REPLAY (no reward)':'BEGIN TODAY\'S BLOOM')+'</button>';
  // Honest note
  h+='<div class="DBhubNote">These exercises are drawn from the published psychology literature. They train what they measure. The evidence for "brain games make you generally smarter" is mixed. What we can offer is a daily habit with specific, trackable practice.</div>';
  h+='</div>';
  pan.innerHTML=h;
  pan.querySelector('#DBstart').addEventListener('click', startSession);
}
function computeStreak(hist){
  if(!hist.length)return 0;
  var seen={};
  hist.forEach(function(e){ if(!e.replay)seen[e.date]=true; });
  var streak=0;
  var d=new Date();
  for(var i=0;i<90;i++){
    var key=d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate();
    if(seen[key])streak++;
    else if(i>0)break;
    d.setUTCDate(d.getUTCDate()-1);
  }
  return streak;
}

// ── Results ─────────────────────────────────────────────────────────────
function showResults(){
  if(!alive())return;
  // Compute overall bloom
  var total=0;
  S.results.forEach(function(r){total+=r.score;});
  var bloom=Math.round(total/S.results.length);
  // Compute per-domain scores
  var domainScores={}, domainCounts={};
  S.results.forEach(function(r){
    if(!domainScores[r.domain]){domainScores[r.domain]=0;domainCounts[r.domain]=0;}
    domainScores[r.domain]+=r.score; domainCounts[r.domain]++;
  });
  Object.keys(domainScores).forEach(function(k){
    domainScores[k]=Math.round(domainScores[k]/domainCounts[k]);
  });
  // Save history
  var today=todayKey();
  var hist=loadHistory();
  var alreadyToday=hist.some(function(h){return h.date===today && !h.replay;});
  if(alreadyToday){
    hist.push({date:today, score:bloom, domainScores:domainScores, replay:true});
  } else {
    hist.push({date:today, score:bloom, domainScores:domainScores});
    _e('milestone');
    if(bloom>=60){_e('game_win');try{_playWin();}catch(e){}}
  }
  saveHistory(hist);
  _sr('dailybloom',{w:bloom>=60,s:bloom});
  sm('Daily Bloom: '+bloom);
  // Render
  var h='<div class="DBresultsTitle">YOUR DAILY BLOOM</div>';
  h+='<div class="DBbigScore">'+bloom+'</div>';
  h+='<div class="DBscoreSub">overall · '+S.results.length+' exercises</div>';
  h+='<div class="DBdomainGrid">';
  Object.keys(domainScores).forEach(function(domKey){
    var dom=DOMAINS[domKey]; var v=domainScores[domKey];
    h+='<div>';
    h+='<div class="DBdomainRow"><span class="DBdomainLbl" style="color:'+dom.color+'">'+dom.label+domainSparkline(domKey)+'</span><span class="DBdomainVal" style="color:'+dom.color+'">'+v+'</span></div>';
    h+='<div class="DBbar"><div class="fill" style="width:'+v+'%;background:'+dom.color+'"></div></div>';
    h+='</div>';
  });
  h+='</div>';
  if(alreadyToday){
    h+='<div class="DBreplay">REPLAY · NO REWARD · COME BACK TOMORROW</div>';
  }
  h+='<div class="DBhonest">Scores reflect your performance on these specific tasks today. They\'re not an IQ measure. Watch the per-domain trend over weeks rather than today\'s number.</div>';
  h+='<button class="DBretry" id="DBretry">↩ BACK TO HUB</button>';
  pan.innerHTML=h;
  pan.querySelector('#DBretry').addEventListener('click', showHub);
}

// ── Entry point ────────────────────────────────────────────────────────
window._gameFns = window._gameFns || {};
window._gameFns.dailybloom = function(a){
  gen++;
  hostEl=a; pan=null; S=null;
  showHub();
};
})();
