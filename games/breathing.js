// ═══ MEDITATION — breathing techniques with a guided recommender ═══
// Follow the bloom: inhale as it opens, exhale as it closes. Milestone
// every 5 breaths. 12 techniques drawn from pranayama, hatha yoga, vedic
// practice, and modern neuroscience. "Not sure what you need?" opens a
// 3-question non-personal quiz that recommends a technique to try.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;
window._gameFns=window._gameFns||{};

// ─── TECHNIQUE CATALOG ───────────────────────────────────────────────────
// Each entry: phases (name + duration seconds), short tag, origin, category,
// audible flag (filtered out in "quiet" quiz answer), advanced flag, cue.
// "cue" = short spoken-style instruction shown during the technique.
// Phase names the engine treats specially for bloom animation: INHALE, EXHALE,
// HOLD. Anything else (HUM, ROAR, TOP-UP) is read as hold-at-current.
var PATTERNS={
  coherent:{
    name:'COHERENT 5-5',
    phases:[{name:'INHALE',dur:5},{name:'EXHALE',dur:5}],
    tag:'Steady focus · heart-rate variability',
    origin:'Modern (rooted in pranayama)',
    cat:'focus',
    cue:'Even in, even out. A steady tide.'
  },
  box:{
    name:'BOX 4-4-4-4',
    phases:[{name:'INHALE',dur:4},{name:'HOLD',dur:4},{name:'EXHALE',dur:4},{name:'HOLD',dur:4}],
    tag:'Focus under pressure',
    origin:'Yoga · pranayama (used by Navy SEALs)',
    cat:'focus',
    cue:'Four corners. Equal sides of a square.'
  },
  calm:{
    name:'CALM 4-6',
    phases:[{name:'INHALE',dur:4},{name:'EXHALE',dur:6}],
    tag:'Gentle calm · longer exhale',
    origin:'Pranayama principle',
    cat:'calm',
    cue:'A little more out than in.'
  },
  relax:{
    name:'4-7-8 RELAX',
    phases:[{name:'INHALE',dur:4},{name:'HOLD',dur:7},{name:'EXHALE',dur:8}],
    tag:'Anxiety · sleep',
    origin:'Pranayama · Dr. Andrew Weil',
    cat:'sleep',
    cue:'Hold gently, release slowly.'
  },
  triangle:{
    name:'TRIANGLE 4-4-4',
    phases:[{name:'INHALE',dur:4},{name:'HOLD',dur:4},{name:'EXHALE',dur:4}],
    tag:'Beginner focus',
    origin:'Vedic simplification of box',
    cat:'focus',
    cue:'Three equal sides.'
  },
  bhramari:{
    name:'BHRAMARI · BEE HUM',
    phases:[{name:'INHALE',dur:4},{name:'HUM',dur:8}],
    tag:'Headache · stress · sleep',
    origin:'Ancient vedic pranayama',
    cat:'sleep',
    audible:true,
    cue:'Hum softly on every exhale — lips closed, gentle buzz.'
  },
  sitali:{
    name:'SITALI · COOLING',
    phases:[{name:'INHALE',dur:5},{name:'EXHALE',dur:5}],
    tag:'Overheated · frustrated',
    origin:'Hatha yoga',
    cat:'cool',
    cue:'Curl your tongue (or purse lips), inhale through it.'
  },
  ujjayi:{
    name:'UJJAYI · OCEAN',
    phases:[{name:'INHALE',dur:6},{name:'EXHALE',dur:6}],
    tag:'Warmth · focus',
    origin:'Hatha yoga',
    cat:'focus',
    cue:'Slight constriction in the throat — an ocean sound.'
  },
  physsigh:{
    name:'PHYSIOLOGICAL SIGH',
    phases:[{name:'INHALE',dur:3},{name:'TOP-UP',dur:1},{name:'EXHALE',dur:8}],
    tag:'Fast stress reset',
    origin:'Huberman Lab · ancient reflex',
    cat:'calm',
    cue:'Inhale, sip a second inhale on top, long slow exhale.'
  },
  nadi:{
    name:'NADI SHODHANA',
    phases:[
      {name:'INHALE',dur:4,label:'L inhale'},
      {name:'HOLD',dur:2},
      {name:'EXHALE',dur:4,label:'R exhale'},
      {name:'INHALE',dur:4,label:'R inhale'},
      {name:'HOLD',dur:2},
      {name:'EXHALE',dur:4,label:'L exhale'}
    ],
    tag:'Balance · nervous system',
    origin:'Hatha yoga',
    cat:'balance',
    advanced:true,
    cue:'Close one nostril at a time with a thumb/finger. Alternate.'
  },
  energy:{
    name:'ENERGY 2-2',
    phases:[{name:'INHALE',dur:2},{name:'EXHALE',dur:2}],
    tag:'Wake up · wired',
    origin:'Pranayama-inspired',
    cat:'energy',
    cue:'Quick and even. Feel the spark.'
  },
  kapalabhati:{
    name:'KAPALABHATI · SKULL SHINE',
    phases:[{name:'EXHALE',dur:0.6},{name:'INHALE',dur:0.6}],
    tag:'Energizing · advanced',
    origin:'Pranayama',
    cat:'energy',
    audible:true,
    advanced:true,
    cue:'Sharp active exhale through nose; inhale passive. Short bursts.'
  },
  lion:{
    name:"LION'S BREATH",
    phases:[{name:'INHALE',dur:4},{name:'ROAR',dur:6}],
    tag:'Tension release · bold',
    origin:'Yoga · Simhasana',
    cat:'energy',
    audible:true,
    cue:'Inhale nose. Exhale open mouth, tongue out, audible "haaa".'
  }
};
var CATS=[
  {id:'all',label:'ALL'},
  {id:'calm',label:'CALM'},
  {id:'focus',label:'FOCUS'},
  {id:'sleep',label:'SLEEP'},
  {id:'energy',label:'ENERGY'},
  {id:'cool',label:'COOLING'},
  {id:'balance',label:'BALANCE'}
];

// ─── QUIZ LOGIC ──────────────────────────────────────────────────────────
// Non-personal questions only. Answer → list of candidate technique keys.
// Keys are ordered by recommendation strength. We intersect with time/quiet
// constraints and pick the first that still qualifies.
var QUIZ=[
  {
    q:'What feels most true right now?',
    opts:[
      {label:'I feel wired or anxious',       picks:['relax','physsigh','calm','coherent']},
      {label:'I feel tired or flat',           picks:['energy','kapalabhati','lion']},
      {label:'My mind is scattered',           picks:['box','coherent','triangle','ujjayi']},
      {label:"I can't sleep",                  picks:['relax','bhramari','calm']},
      {label:'I feel overheated or frustrated',picks:['sitali','lion','calm']},
      {label:'I just want to practice',        picks:['nadi','coherent','ujjayi','box']}
    ]
  },
  {
    q:'How much time do you have?',
    opts:[
      {label:'Under 2 minutes', maxDur:8},  // max phase cycle seconds
      {label:'2–5 minutes',     maxDur:20},
      {label:'5+ minutes',      maxDur:999}
    ]
  },
  {
    q:'Can you make sound where you are?',
    opts:[
      {label:'Yes — private or quiet',                 allowAudible:true},
      {label:'No — I need to stay quiet',              allowAudible:false}
    ]
  }
];
function _cycleDur(p){var t=0;for(var i=0;i<p.phases.length;i++)t+=p.phases[i].dur;return t;}
function _recommend(answers){
  // answers = [{pickI:0..}, {pickI:0..}, {pickI:0..}]
  var picks=QUIZ[0].opts[answers[0]].picks;
  var maxDur=QUIZ[1].opts[answers[1]].maxDur;
  var allowAudible=QUIZ[2].opts[answers[2]].allowAudible;
  // Try each candidate in order, return first that fits constraints.
  for(var i=0;i<picks.length;i++){
    var k=picks[i]; var p=PATTERNS[k]; if(!p)continue;
    if(!allowAudible&&p.audible)continue;
    if(_cycleDur(p)>maxDur)continue;
    return k;
  }
  // Nothing matched tightly — relax the constraints one step.
  for(var j=0;j<picks.length;j++){
    var k2=picks[j]; if(PATTERNS[k2]&&(allowAudible||!PATTERNS[k2].audible))return k2;
  }
  return picks[0]||'coherent';
}

window._gameFns.breathing=function BR(a){
  var curKey='coherent';
  var phases=PATTERNS[curKey].phases;
  var curCat='all';
  var phaseIdx=0,phaseTimer=0,breathing=false;
  var breathCount=0,totalTime=0,_brWon=false;
  var bloomProgress=0.3,targetBloom=0;
  var particles=[];
  var raf=null,lastTime=0,stopped=false;
  var cvs,ctx,W,H,cx,cy,dpr;

  ms(a,'🌸 Meditation — <strong id="BRt">0:00</strong>');
  mm(a,'READY');
  var pan=document.createElement('div');pan.id='BRpan';
  pan.style.cssText='max-width:460px;margin:0 auto;padding:6px;user-select:none;text-align:center;';

  // Single-structure shell — techniques + cat chips injected below after render.
  pan.innerHTML=''+
    '<canvas id="BRcv" style="display:block;margin:6px auto;width:100%;max-width:360px;height:260px;background:#0d100c;border-radius:8px;"></canvas>'+
    '<div id="BRph" style="font-family:Bebas Neue,sans-serif;font-size:1.4rem;color:#e8dcc8;letter-spacing:3px;opacity:.85;margin:4px 0;">READY</div>'+
    '<div id="BRct" style="font-family:Bebas Neue,sans-serif;font-size:2rem;color:rgba(232,220,200,0.35);min-height:2rem;"></div>'+
    '<div id="BRinfo" style="font-size:.65rem;opacity:.55;margin:4px 0;">Breaths: 0</div>'+
    '<div id="BRname" style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;letter-spacing:0.08em;color:var(--gold);margin-top:6px;"></div>'+
    '<div id="BRtag"  style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--sage);opacity:0.85;margin:2px 0 0;"></div>'+
    '<div id="BRorig" style="font-family:DM Mono,monospace;font-size:0.5rem;color:var(--muted);margin:2px 0 4px;"></div>'+
    '<div id="BRcue"  style="font-family:Playfair Display,serif;font-size:0.7rem;font-style:italic;color:var(--cream);opacity:0.75;padding:0 10px;line-height:1.35;margin:4px 0 10px;"></div>'+
    // "Not sure" banner
    '<button class="gb" id="BRquiz" style="padding:8px 14px;font-size:0.65rem;letter-spacing:0.08em;margin:6px auto 12px;background:linear-gradient(135deg,rgba(122,179,86,0.22),rgba(200,168,75,0.18));border:1px solid rgba(200,168,75,0.35);min-height:48px;">🔍 Not sure what you need?</button>'+
    // Category chips
    '<div id="BRcats" style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;padding:2px 4px 6px;"></div>'+
    // Technique cards container
    '<div id="BRlist" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px;"></div>';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" id="BRgo" onclick="_BRG()">▶ START</button> <button class="gb" onclick="_BRR()">↺ RESET</button>';

  cvs=document.getElementById('BRcv');ctx=cvs.getContext('2d');
  function resize(){
    dpr=window.devicePixelRatio||1;
    var rc=cvs.getBoundingClientRect();
    W=rc.width;H=rc.height;
    cvs.width=W*dpr;cvs.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cx=W/2;cy=H/2;
  }
  resize();

  function renderCats(){
    var el=document.getElementById('BRcats');if(!el)return;
    el.innerHTML=CATS.map(function(c){
      var sel=c.id===curCat;
      return '<button class="gb" onclick="_BRCat(\''+c.id+'\')" style="padding:4px 8px;font-size:0.55rem;letter-spacing:0.08em;min-height:44px;'
        +(sel?'background:rgba(200,168,75,0.25);border-color:var(--gold);color:var(--gold);':'')+'">'+c.label+'</button>';
    }).join('');
  }
  function renderList(){
    var el=document.getElementById('BRlist');if(!el)return;
    var keys=Object.keys(PATTERNS).filter(function(k){
      return curCat==='all'||PATTERNS[k].cat===curCat;
    });
    el.innerHTML=keys.map(function(k){
      var p=PATTERNS[k];var sel=k===curKey;
      var adv=p.advanced?'<span style="color:var(--gold);font-size:0.45rem;margin-left:4px;">◆</span>':'';
      var aud=p.audible?'<span style="color:var(--sage);font-size:0.45rem;margin-left:4px;">🔈</span>':'';
      return '<button class="gb" onclick="_BRP(\''+k+'\')" style="padding:8px 6px;text-align:left;min-height:64px;display:flex;flex-direction:column;justify-content:center;gap:2px;font-family:inherit;'
        +(sel?'background:rgba(122,179,86,0.22);border-color:var(--sage);':'')+'">'
        +'<div style="font-family:Bebas Neue,sans-serif;font-size:0.68rem;letter-spacing:0.05em;color:var(--cream);">'+p.name+adv+aud+'</div>'
        +'<div style="font-family:DM Mono,monospace;font-size:0.46rem;color:var(--sage);opacity:0.85;">'+p.tag+'</div>'
        +'</button>';
    }).join('');
  }
  function renderHero(){
    var p=PATTERNS[curKey];if(!p)return;
    var nm=document.getElementById('BRname');if(nm)nm.textContent=p.name;
    var tg=document.getElementById('BRtag');if(tg)tg.textContent=p.tag;
    var og=document.getElementById('BRorig');if(og)og.textContent=p.origin;
    var cu=document.getElementById('BRcue');if(cu)cu.textContent=p.cue||'';
  }
  function renderAll(){renderCats();renderList();renderHero();}
  renderAll();

  // ─── QUIZ MODAL ─────────────────────────────────────────────────────
  var quizStep=0,quizAns=[];
  function _openQuiz(){
    quizStep=0;quizAns=[];
    var ov=document.getElementById('BRquizOV');
    if(!ov){
      ov=document.createElement('div');
      ov.id='BRquizOV';
      ov.style.cssText='position:fixed;inset:0;z-index:99992;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.92);backdrop-filter:blur(10px);padding:16px;animation:panelFadeIn 0.3s ease;';
      ov.addEventListener('click',function(e){if(e.target===ov)_closeQuiz();});
      document.body.appendChild(ov);
    }
    _renderQuiz();
  }
  function _closeQuiz(){
    var ov=document.getElementById('BRquizOV');if(ov)ov.remove();
  }
  function _renderQuiz(){
    var ov=document.getElementById('BRquizOV');if(!ov)return;
    if(quizStep>=QUIZ.length){_renderQuizResult();return;}
    var q=QUIZ[quizStep];
    var h='<div style="max-width:380px;width:100%;background:rgba(15,20,12,0.96);border:1px solid rgba(200,168,75,0.35);border-radius:12px;padding:20px 18px;font-family:DM Mono,monospace;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;letter-spacing:0.12em;color:var(--sage);margin-bottom:8px;">STEP '+(quizStep+1)+' / '+QUIZ.length+'</div>';
    h+='<div style="font-family:Playfair Display,serif;font-size:1rem;color:var(--cream);margin-bottom:16px;line-height:1.3;">'+q.q+'</div>';
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    for(var i=0;i<q.opts.length;i++){
      h+='<button class="gb" onclick="_BRQuizAns('+i+')" style="text-align:left;padding:12px 14px;font-size:0.7rem;letter-spacing:0.04em;min-height:52px;font-family:inherit;">'+q.opts[i].label+'</button>';
    }
    h+='</div>';
    h+='<button class="gb" onclick="_BRQuizClose()" style="margin-top:14px;width:100%;padding:8px;font-size:0.55rem;color:var(--muted);border-color:rgba(138,145,120,0.2);min-height:44px;">Cancel</button>';
    h+='</div>';
    ov.innerHTML=h;
  }
  function _renderQuizResult(){
    var ov=document.getElementById('BRquizOV');if(!ov)return;
    var key=_recommend(quizAns);
    var p=PATTERNS[key];
    var h='<div style="max-width:380px;width:100%;background:rgba(15,20,12,0.96);border:1px solid rgba(200,168,75,0.45);border-radius:12px;padding:20px 18px;font-family:DM Mono,monospace;text-align:center;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;letter-spacing:0.15em;color:var(--sage);margin-bottom:8px;">WE SUGGEST</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.4rem;letter-spacing:0.08em;color:var(--gold);margin-bottom:4px;">'+p.name+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--sage);margin-bottom:6px;">'+p.tag+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;color:var(--muted);margin-bottom:12px;">'+p.origin+'</div>';
    h+='<div style="font-family:Playfair Display,serif;font-style:italic;font-size:0.78rem;color:var(--cream);opacity:0.85;line-height:1.4;margin-bottom:16px;">'+(p.cue||'')+'</div>';
    h+='<button class="gb" onclick="_BRQuizAccept(\''+key+'\')" style="width:100%;padding:12px;font-size:0.8rem;letter-spacing:0.1em;color:var(--sage);border-color:var(--sage);min-height:52px;margin-bottom:8px;">TRY IT</button>';
    h+='<button class="gb" onclick="_BRQuizRetry()" style="width:100%;padding:8px;font-size:0.6rem;color:var(--muted);border-color:rgba(138,145,120,0.25);min-height:44px;">Ask again</button>';
    h+='</div>';
    ov.innerHTML=h;
  }
  window._BRQuizAns=function(i){
    quizAns.push(i);quizStep++;_renderQuiz();
  };
  window._BRQuizClose=function(){_closeQuiz();};
  window._BRQuizRetry=function(){quizStep=0;quizAns=[];_renderQuiz();};
  window._BRQuizAccept=function(k){
    _closeQuiz();window._BRP(k);
    // Auto-start so they're not hunting for the button.
    if(!breathing)setTimeout(function(){window._BRG();},200);
  };
  document.getElementById('BRquiz').onclick=_openQuiz;

  // ─── ENGINE ─────────────────────────────────────────────────────────
  function updateBreath(dt){
    if(!breathing)return;
    phaseTimer+=dt;
    var ph=phases[phaseIdx];
    var prog=Math.min(1,phaseTimer/ph.dur);
    // Bloom mapping: INHALE opens, EXHALE closes, all holds keep position.
    if(ph.name==='INHALE')targetBloom=prog;
    else if(ph.name==='EXHALE'||ph.name==='HUM'||ph.name==='ROAR')targetBloom=1-prog;
    // TOP-UP is a tiny extra inhale on the physiological sigh.
    else if(ph.name==='TOP-UP')targetBloom=Math.min(1,0.9+prog*0.1);
    var rem=Math.ceil(ph.dur-phaseTimer);
    var ct=document.getElementById('BRct');if(ct)ct.textContent=rem>0?rem:'';
    var phEl=document.getElementById('BRph');if(phEl)phEl.textContent=ph.label||ph.name;
    if(phaseTimer>=ph.dur){
      phaseTimer=0;phaseIdx=(phaseIdx+1)%phases.length;
      if(phaseIdx===0){
        breathCount++;
        if(breathCount%5===0){_e('milestone');try{if(window._play)_play('match');}catch(e){}}
        // Mint a hash after 10 completed breaths. Fires once per launch.
        if(breathCount===10&&!_brWon){_brWon=true;_e('game_win');try{if(window._sr)window._sr('breathing',{w:true,s:breathCount});}catch(e){}}
      }
      try{navigator.vibrate&&navigator.vibrate(15);}catch(e){}
    }
    bloomProgress+=(targetBloom-bloomProgress)*0.08;
    totalTime+=dt;
    var mins=Math.floor(totalTime/60);var secs=Math.floor(totalTime%60);
    var te=document.getElementById('BRt');if(te)te.textContent=mins+':'+(secs<10?'0':'')+secs;
    var ie=document.getElementById('BRinfo');if(ie)ie.textContent='Breaths: '+breathCount+' · '+mins+':'+(secs<10?'0':'')+secs;
  }

  function drawBG(){
    ctx.fillStyle='#0d100c';ctx.fillRect(0,0,W,H);
    var g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*0.6);
    g.addColorStop(0,'rgba(26,36,22,0.2)');g.addColorStop(1,'rgba(13,16,12,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  function drawCircle(){
    var maxR=Math.min(W,H)*0.32;
    ctx.beginPath();ctx.arc(cx,cy,maxR,0,Math.PI*2);
    ctx.strokeStyle='rgba(122,179,86,0.1)';ctx.lineWidth=1;ctx.stroke();
    var r=maxR*0.2+maxR*0.8*bloomProgress;
    var glow=ctx.createRadialGradient(cx,cy,r,cx,cy,r+20);
    glow.addColorStop(0,'rgba(122,179,86,'+(0.2*bloomProgress)+')');
    glow.addColorStop(1,'rgba(122,179,86,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,r+20,0,Math.PI*2);ctx.fill();
    var cg=ctx.createRadialGradient(cx-r*0.2,cy-r*0.2,0,cx,cy,r);
    cg.addColorStop(0,'rgba(122,179,86,'+(0.2+bloomProgress*0.25)+')');
    cg.addColorStop(1,'rgba(74,124,53,'+(0.05+bloomProgress*0.1)+')');
    ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle='rgba(122,179,86,'+(0.25+bloomProgress*0.3)+')';ctx.lineWidth=1.5;ctx.stroke();
  }
  function drawFlower(){
    var maxR=Math.min(W,H)*0.28;
    var pr=maxR*bloomProgress;if(pr<3)return;
    ctx.save();ctx.translate(cx,cy);
    var colors=['rgba(196,122,122,','rgba(200,168,75,','rgba(122,179,86,','rgba(91,155,213,'];
    for(var i=0;i<8;i++){
      var ang=(Math.PI*2/8)*i+Math.sin(Date.now()*0.0003)*0.1;
      ctx.save();ctx.rotate(ang);
      var pl=pr*0.9,pw=pr*0.25;
      ctx.beginPath();ctx.moveTo(0,0);
      ctx.bezierCurveTo(pw,-pl*0.4,pw*0.6,-pl,0,-pl);
      ctx.bezierCurveTo(-pw*0.6,-pl,-pw,-pl*0.4,0,0);
      ctx.closePath();
      ctx.fillStyle=colors[i%4]+(0.2+bloomProgress*0.3)+')';ctx.fill();
      ctx.restore();
    }
    var crg=ctx.createRadialGradient(0,0,0,0,0,pr*0.15);
    crg.addColorStop(0,'rgba(200,168,75,'+(0.4+bloomProgress*0.4)+')');
    crg.addColorStop(1,'rgba(196,122,122,0.1)');
    ctx.fillStyle=crg;ctx.beginPath();ctx.arc(0,0,pr*0.15,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  function drawParticles(){
    for(var i=0;i<particles.length;i++){
      var p=particles[i];
      ctx.globalAlpha=Math.max(0,p.life/p.maxLife)*0.6;
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*(p.life/p.maxLife),0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  function spawnP(){
    if(!breathing)return;
    var ph=phases[phaseIdx];
    // Petals scatter on any releasing phase.
    var releasing=ph.name==='EXHALE'||ph.name==='HUM'||ph.name==='ROAR';
    if(releasing&&Math.random()<0.15){
      var ang=Math.random()*Math.PI*2;
      var dist=bloomProgress*Math.min(W,H)*0.25;
      var cols=['rgba(122,179,86,1)','rgba(196,122,122,1)','rgba(200,168,75,1)'];
      particles.push({x:cx+Math.cos(ang)*dist,y:cy+Math.sin(ang)*dist,
        vx:Math.cos(ang)*8,vy:Math.sin(ang)*8-10,
        life:2+Math.random(),maxLife:2+Math.random(),
        size:1.5+Math.random()*2,color:cols[Math.floor(Math.random()*3)]});
    }
  }

  function loop(ts){
    if(stopped||!document.body.contains(pan)){stopped=true;return;}
    var dt=lastTime?Math.min((ts-lastTime)/1000,0.05):0.016;
    lastTime=ts;
    updateBreath(dt);
    for(var i=particles.length-1;i>=0;i--){
      var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=3*dt;
      p.life-=dt;if(p.life<=0)particles.splice(i,1);
    }
    spawnP();
    if(!breathing)bloomProgress=0.3+Math.sin(Date.now()*0.001)*0.1;
    drawBG();drawCircle();drawFlower();drawParticles();
    raf=requestAnimationFrame(loop);
  }
  raf=requestAnimationFrame(loop);

  window._BRG=function(){
    breathing=!breathing;
    var btn=document.getElementById('BRgo');
    if(breathing){
      btn.textContent='⏸ PAUSE';phaseIdx=0;phaseTimer=0;sm('Breathe with the bloom.');
    } else {
      btn.textContent='▶ START';
      var phEl=document.getElementById('BRph');if(phEl)phEl.textContent='PAUSED';
      sm('Paused.');
    }
  };
  window._BRR=function(){
    breathing=false;phaseIdx=0;phaseTimer=0;breathCount=0;totalTime=0;bloomProgress=0.3;_brWon=false;
    var btn=document.getElementById('BRgo');if(btn)btn.textContent='▶ START';
    var phEl=document.getElementById('BRph');if(phEl)phEl.textContent='READY';
    var ct=document.getElementById('BRct');if(ct)ct.textContent='';
    var te=document.getElementById('BRt');if(te)te.textContent='0:00';
    var ie=document.getElementById('BRinfo');if(ie)ie.textContent='Breaths: 0';
    sm('');
  };
  window._BRP=function(k){
    if(!PATTERNS[k])return;
    curKey=k;phases=PATTERNS[k].phases;phaseIdx=0;phaseTimer=0;
    renderAll();
    sm('Technique: '+PATTERNS[k].name);
  };
  window._BRCat=function(c){curCat=c;renderAll();};
};
})();
