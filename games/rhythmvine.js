// ═══ LUCID WINDS — Rhythm Vine (4-lane falling-note rhythm game) ═══
// Slice 1: audio-clock engine, synthetic chart, 4 seasonal lanes.
// Next slices: real audio file loading, song select, calibration.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

window._gameFns=window._gameFns||{};
window._gameFns.rhythmvine=function RV(a){
  // ─── Config ───────────────────────────────────────────────
  var LANES=4;
  var LANE_COLORS=['#E8A0BF','#D4A843','#D4842A','#A0C4E8']; // spring/summer/autumn/winter
  var LANE_KEYS=['d','f','j','k']; // desktop hotkeys
  var NOTE_FALL_MS=1600;            // time a note takes from top to hit line
  var HIT_PERFECT=0.040,HIT_GREAT=0.080,HIT_OK=0.120; // seconds either side
  var CALIBRATION=parseFloat(localStorage.getItem('lw_rv_calib')||'0'); // ms offset, +ve = audio runs ahead

  // ─── State ────────────────────────────────────────────────
  var audioCtx=null,masterGain=null;
  var chart=null;               // {bpm, notes:[[time,lane],...]}
  var songStartedAt=0;          // audioCtx.currentTime when first note's t=0
  var running=false;
  var notes=[];                 // active note objects
  var nextNoteIdx=0;
  var rafId=0;
  var endTimerId=0;             // tracked so PLAY-AGAIN doesn't stack timers
  var score=0,combo=0,maxCombo=0,hits={p:0,g:0,o:0,m:0};
  var lastResult=null;

  // ─── HUD header ───────────────────────────────────────────
  ms(a,'Rhythm Vine · <span id="RVs">0</span> · combo <span id="RVc">0</span>');
  mm(a);
  var pan=document.createElement('div');pan.id='RVpan';
  pan.style.cssText='position:relative;max-width:520px;margin:0 auto;padding:0;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_RVN()">🌱 NEW SONG</button> <button class="gb" onclick="_RVCAL()">⚙ CALIBRATE</button>';

  // ─── Styles (scoped ids only) ─────────────────────────────
  var css=document.createElement('style');
  css.textContent=''
    +'#RVpan{user-select:none;-webkit-user-select:none;touch-action:manipulation;}'
    +'#RVstage{position:relative;width:100%;aspect-ratio:3/5;max-height:min(720px,78vh);margin:0 auto;background:linear-gradient(180deg,rgba(13,16,12,0.96) 0%,rgba(20,28,18,0.9) 100%);border:1.5px solid rgba(122,179,86,0.18);border-radius:14px;overflow:hidden;box-shadow:inset 0 0 40px rgba(0,0,0,0.5),0 4px 20px rgba(0,0,0,0.6);}'
    +'.RVlane{position:absolute;top:0;bottom:0;border-left:1px solid rgba(122,179,86,0.08);border-right:1px solid rgba(122,179,86,0.08);}'
    +'.RVlane:first-child{border-left:1.5px solid rgba(122,179,86,0.2);}'
    +'.RVlane:last-child{border-right:1.5px solid rgba(122,179,86,0.2);}'
    +'#RVhitline{position:absolute;left:0;right:0;bottom:14%;height:3px;background:linear-gradient(90deg,transparent,rgba(200,168,75,0.9),transparent);box-shadow:0 0 18px rgba(200,168,75,0.65);z-index:4;pointer-events:none;}'
    +'.RVnote{position:absolute;width:84%;left:8%;height:22px;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.25);will-change:transform;z-index:3;}'
    +'.RVpad{position:absolute;bottom:0;height:14%;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-family:Bebas Neue,sans-serif;font-size:0.9rem;letter-spacing:0.14em;color:rgba(255,255,255,0.55);background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.35));border-top:1.5px solid rgba(200,168,75,0.3);transition:background 0.08s;z-index:5;user-select:none;}'
    +'.RVpad:active,.RVpad.active{background:linear-gradient(180deg,rgba(200,168,75,0.35),rgba(122,179,86,0.25));color:var(--cream);}'
    +'.RVpad .k{font-family:DM Mono,monospace;font-size:0.55rem;opacity:0.55;margin-top:2px;}'
    +'#RVjudge{position:absolute;left:0;right:0;top:45%;text-align:center;font-family:Bebas Neue,sans-serif;font-size:1.6rem;letter-spacing:0.12em;opacity:0;transition:opacity 0.25s;pointer-events:none;z-index:6;text-shadow:0 0 18px currentColor;}'
    +'#RVjudge.show{opacity:1;}'
    +'#RVcombo{position:absolute;top:12px;left:0;right:0;text-align:center;font-family:Bebas Neue,sans-serif;font-size:0.75rem;letter-spacing:0.14em;color:var(--gold);opacity:0.85;z-index:4;pointer-events:none;}'
    +'#RVstart{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(13,16,12,0.88);backdrop-filter:blur(6px);z-index:10;}'
    +'#RVstart .t{font-family:Cormorant Garamond,serif;font-size:1.8rem;color:var(--cream);letter-spacing:0.04em;}'
    +'#RVstart .s{font-family:DM Mono,monospace;font-size:0.65rem;color:var(--muted);max-width:300px;text-align:center;line-height:1.7;}'
    +'#RVstart button{min-height:56px;padding:12px 28px;font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.14em;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.2));border:2px solid var(--sage);color:var(--sage);border-radius:10px;cursor:pointer;}'
    +'';
  pan.appendChild(css);

  // ─── Build stage DOM ──────────────────────────────────────
  var stage=document.createElement('div');stage.id='RVstage';pan.appendChild(stage);
  var combosEl=document.createElement('div');combosEl.id='RVcombo';stage.appendChild(combosEl);
  var judgeEl=document.createElement('div');judgeEl.id='RVjudge';stage.appendChild(judgeEl);
  var hitLine=document.createElement('div');hitLine.id='RVhitline';stage.appendChild(hitLine);

  var laneEls=[],padEls=[];
  for(var i=0;i<LANES;i++){
    var w=(100/LANES).toFixed(4);
    var left=(i*100/LANES).toFixed(4);
    var lane=document.createElement('div');
    lane.className='RVlane';
    lane.style.cssText='left:'+left+'%;width:'+w+'%;';
    stage.appendChild(lane);
    laneEls.push(lane);
    var pad=document.createElement('div');
    pad.className='RVpad';
    pad.style.cssText='left:'+left+'%;width:'+w+'%;border-top-color:'+LANE_COLORS[i]+'66;';
    pad.innerHTML='<div style="color:'+LANE_COLORS[i]+'">'+String.fromCharCode(9679)+'</div><div class="k">'+LANE_KEYS[i].toUpperCase()+'</div>';
    stage.appendChild(pad);
    padEls.push(pad);
    (function(laneIdx,padEl){
      padEl.addEventListener('pointerdown',function(ev){ev.preventDefault();tap(laneIdx);padEl.classList.add('active');});
      padEl.addEventListener('pointerup',function(){padEl.classList.remove('active');});
      padEl.addEventListener('pointerleave',function(){padEl.classList.remove('active');});
    })(i,pad);
  }

  // Start overlay
  var startOv=document.createElement('div');startOv.id='RVstart';
  startOv.innerHTML='<div class="t">Rhythm Vine</div><div class="s">Tap each lane as the note crosses the gold line. Perfect hits score highest.</div><button id="RVgo">▶ PLAY</button>';
  stage.appendChild(startOv);
  document.getElementById('RVgo').addEventListener('click',function(){startRun();});

  // ─── Keyboard ─────────────────────────────────────────────
  function keyHandler(ev){
    if(!running)return;
    var k=(ev.key||'').toLowerCase();
    var idx=LANE_KEYS.indexOf(k);
    if(idx>=0){ev.preventDefault();tap(idx);padEls[idx].classList.add('active');setTimeout(function(){padEls[idx].classList.remove('active');},80);}
  }
  document.addEventListener('keydown',keyHandler);

  // ─── Audio ────────────────────────────────────────────────
  function initAudio(){
    if(audioCtx)return Promise.resolve();
    try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();}
    catch(e){return Promise.reject(e);}
    masterGain=audioCtx.createGain();masterGain.gain.value=0.5;
    masterGain.connect(audioCtx.destination);
    // iOS/Safari unlock
    if(audioCtx.state==='suspended')return audioCtx.resume();
    return Promise.resolve();
  }

  function playTick(lane,strong){
    if(!audioCtx)return;
    var t=audioCtx.currentTime;
    var o=audioCtx.createOscillator(),gn=audioCtx.createGain();
    o.type='triangle';
    var freqs=[523.25,659.25,784.0,987.77]; // C5 E5 G5 B5
    o.frequency.value=freqs[lane]||freqs[0];
    gn.gain.setValueAtTime(strong?0.22:0.14,t);
    gn.gain.exponentialRampToValueAtTime(0.001,t+0.14);
    o.connect(gn);gn.connect(masterGain);
    o.start(t);o.stop(t+0.16);
  }

  function playMiss(){
    if(!audioCtx)return;
    var t=audioCtx.currentTime;
    var o=audioCtx.createOscillator(),gn=audioCtx.createGain();
    o.type='sawtooth';o.frequency.value=130;
    gn.gain.setValueAtTime(0.15,t);
    gn.gain.exponentialRampToValueAtTime(0.001,t+0.18);
    o.connect(gn);gn.connect(masterGain);
    o.start(t);o.stop(t+0.2);
  }

  // ─── Chart: synthetic for Slice 1 ─────────────────────────
  // Generate ~60s of notes at 100bpm with gentle escalation.
  function buildSyntheticChart(){
    var bpm=100,beat=60/bpm,seed=1;
    function rand(){seed=(seed*9301+49297)%233280;return seed/233280;}
    var out=[];
    var t=1.5; // lead-in
    for(var bar=0;bar<32;bar++){
      var density=Math.min(4,1+Math.floor(bar/6));   // 1..4 notes per bar
      var positions=[0,1,2,3].sort(function(){return rand()-0.5;}).slice(0,density);
      positions.sort(function(x,y){return x-y;});
      for(var p=0;p<positions.length;p++){
        var lane=Math.floor(rand()*LANES);
        var sub=positions[p]*beat;
        out.push([+(t+sub).toFixed(3),lane]);
      }
      t+=4*beat;
    }
    return {bpm:bpm,notes:out};
  }

  // ─── Main loop ────────────────────────────────────────────
  function startRun(){
    initAudio().then(function(){
      // Tear down any leftover state from a previous song before starting
      // fresh — without this, PLAY AGAIN leaks the previous round's note
      // DOM elements and also stacks a second endRun timer.
      if(endTimerId){clearTimeout(endTimerId);endTimerId=0;}
      for(var i=notes.length-1;i>=0;i--){
        var oldN=notes[i];
        if(oldN.el&&oldN.el.parentNode)oldN.el.parentNode.removeChild(oldN.el);
      }
      notes.length=0;
      chart=buildSyntheticChart();
      nextNoteIdx=0;score=0;combo=0;maxCombo=0;
      hits={p:0,g:0,o:0,m:0};
      songStartedAt=audioCtx.currentTime+0.6;
      running=true;
      startOv.style.display='none';
      updateHUD();
      rafId=requestAnimationFrame(loop);
      var totalSec=chart.notes.length?chart.notes[chart.notes.length-1][0]+2:60;
      endTimerId=setTimeout(endRun,(totalSec+0.5)*1000);
    },function(){sm('Audio blocked, tap screen to unlock');});
  }

  function endRun(){
    if(!running)return;
    running=false;cancelAnimationFrame(rafId);
    // Clear lane notes visually
    for(var i=notes.length-1;i>=0;i--){if(notes[i].el&&notes[i].el.parentNode)notes[i].el.parentNode.removeChild(notes[i].el);}
    notes.length=0;
    var total=hits.p+hits.g+hits.o+hits.m;
    var acc=total?((hits.p+hits.g*0.7+hits.o*0.4)/total):0;
    var stars=acc>=0.95?5:acc>=0.85?4:acc>=0.70?3:acc>=0.50?2:acc>=0.30?1:0;
    var sbMap=[0,1,2,3,5,8];
    var sb=sbMap[stars]||0;
    for(var s=0;s<sb;s++)_e('progress');
    var won=stars>=3;
    if(won){_e('game_win');_playWin();}else{_e('game_loss');}
    _sr('rhythmvine',{w:won,s:score,combo:maxCombo,stars:stars});
    showEnd(stars,sb,acc);
  }

  function showEnd(stars,sb,acc){
    startOv.style.display='';
    var starStr='';for(var i=0;i<5;i++)starStr+=(i<stars?'★':'☆');
    startOv.innerHTML='<div class="t" style="color:var(--gold);">'+starStr+'</div>'
      +'<div class="s">Score '+score+' · Combo '+maxCombo+' · Accuracy '+(acc*100).toFixed(1)+'%</div>'
      +'<div class="s" style="color:var(--gold);">+'+sb+' Sunbeam progress</div>'
      +'<button id="RVgo2">↻ PLAY AGAIN</button>';
    document.getElementById('RVgo2').addEventListener('click',function(){startRun();});
  }

  function songTime(){return audioCtx.currentTime-songStartedAt;}

  function loop(){
    if(!running)return;
    var t=songTime();
    var stageH=stage.clientHeight;
    var hitY=stageH*0.86; // matches bottom:14%
    // Spawn upcoming notes
    while(chart&&nextNoteIdx<chart.notes.length){
      var nn=chart.notes[nextNoteIdx];
      // Spawn a bit before hit time so the note visibly travels
      if(nn[0]-t<=NOTE_FALL_MS/1000){
        spawnNote(nn[0],nn[1]);
        nextNoteIdx++;
      }else break;
    }
    // Move notes + cull missed
    for(var i=notes.length-1;i>=0;i--){
      var n=notes[i];
      var dt=n.hitTime-t;
      if(!n.hit){
        var y=hitY-(dt/(NOTE_FALL_MS/1000))*hitY;
        n.el.style.transform='translateY('+y.toFixed(1)+'px)';
        if(-dt>HIT_OK){
          // Auto-miss the moment the hit window closes. Previous threshold
          // (HIT_OK + 0.04) left a 40ms dead zone where the note was visible
          // but not hittable — players felt it as an unfair miss.
          n.el.style.opacity='0';n.hit=true;n.result='m';
          hits.m++;combo=0;updateHUD();judge('MISS','#c47a7a');
          setTimeout(cleanupDone,260);
        }
      }else if(n.result!=='hidden'){
        // fade out
      }
    }
    rafId=requestAnimationFrame(loop);
  }

  function cleanupDone(){
    for(var i=notes.length-1;i>=0;i--){
      var n=notes[i];
      if(n.hit){
        if(n.el&&n.el.parentNode)n.el.parentNode.removeChild(n.el);
        notes.splice(i,1);
      }
    }
  }

  function spawnNote(hitTime,lane){
    var el=document.createElement('div');el.className='RVnote';
    var w=(100/LANES);
    el.style.left=(lane*w+w*0.08).toFixed(3)+'%';
    el.style.width=(w*0.84).toFixed(3)+'%';
    el.style.background='linear-gradient(180deg,'+LANE_COLORS[lane]+',rgba(0,0,0,0.15))';
    el.style.borderTop='1px solid '+LANE_COLORS[lane];
    el.style.top='-30px';
    stage.appendChild(el);
    notes.push({hitTime:hitTime,lane:lane,el:el,hit:false,result:null});
  }

  function tap(lane){
    if(!running)return;
    var t=songTime()+(CALIBRATION/1000);
    // Find earliest unhit note in this lane within OK window
    var bestIdx=-1,bestDiff=Infinity;
    for(var i=0;i<notes.length;i++){
      var n=notes[i];
      if(n.hit||n.lane!==lane)continue;
      var d=Math.abs(n.hitTime-t);
      if(d<bestDiff&&d<=HIT_OK){bestDiff=d;bestIdx=i;}
    }
    if(bestIdx<0){judge('•','#888');return;}
    var nn=notes[bestIdx];nn.hit=true;
    var res,col,pts;
    if(bestDiff<=HIT_PERFECT){res='PERFECT';col=LANE_COLORS[lane];pts=300;hits.p++;}
    else if(bestDiff<=HIT_GREAT){res='GREAT';col='#c8a84b';pts=180;hits.g++;}
    else{res='OK';col='#7ab356';pts=80;hits.o++;}
    combo++;if(combo>maxCombo)maxCombo=combo;
    pts=Math.round(pts*(1+Math.min(combo,50)*0.02));
    score+=pts;
    playTick(lane,res==='PERFECT');
    nn.el.style.transition='opacity 0.2s, transform 0.2s';
    nn.el.style.opacity='0';
    nn.el.style.transform=nn.el.style.transform+' scale(1.35)';
    nn.result=res.charAt(0).toLowerCase();
    setTimeout(cleanupDone,220);
    judge(res,col);
    updateHUD();
  }

  function judge(text,color){
    judgeEl.textContent=text;
    judgeEl.style.color=color||'var(--cream)';
    judgeEl.classList.add('show');
    clearTimeout(judgeEl._t);
    judgeEl._t=setTimeout(function(){judgeEl.classList.remove('show');},280);
  }

  function updateHUD(){
    var s=document.getElementById('RVs'),c=document.getElementById('RVc');
    if(s)s.textContent=score;if(c)c.textContent=combo;
    combosEl.textContent=combo>3?('×'+combo):'';
  }

  // ─── Public controls ──────────────────────────────────────
  window._RVN=function(){
    if(running){running=false;cancelAnimationFrame(rafId);}
    if(endTimerId){clearTimeout(endTimerId);endTimerId=0;}
    // Wipe any visible notes from the previous run so the start overlay
    // doesn't render on top of stale tiles.
    for(var i=notes.length-1;i>=0;i--){
      var oldN=notes[i];
      if(oldN.el&&oldN.el.parentNode)oldN.el.parentNode.removeChild(oldN.el);
    }
    notes.length=0;
    startOv.style.display='';
    startOv.innerHTML='<div class="t">Rhythm Vine</div><div class="s">Tap each lane as the note crosses the gold line. Perfect hits score highest.</div><button id="RVgo">▶ PLAY</button>';
    document.getElementById('RVgo').addEventListener('click',function(){startRun();});
  };

  window._RVCAL=function(){
    var cur=CALIBRATION;
    var v=prompt('Audio offset in ms (negative = hits feel early). Current: '+cur,String(cur));
    if(v===null)return;
    var n=parseFloat(v);if(isNaN(n))return;
    n=Math.max(-200,Math.min(200,n));
    CALIBRATION=n;localStorage.setItem('lw_rv_calib',String(n));
    sm('Calibration saved: '+n+'ms');
  };

  // ─── Cleanup hook on game exit ────────────────────────────
  // The global back button removes the game container so listeners die with it,
  // but keydown is on document — remove explicitly.
  var origExit=a;
  var _obs=new MutationObserver(function(){
    if(!document.body.contains(stage)){
      document.removeEventListener('keydown',keyHandler);
      if(rafId)cancelAnimationFrame(rafId);
      if(endTimerId){clearTimeout(endTimerId);endTimerId=0;}
      running=false;
      _obs.disconnect();
    }
  });
  _obs.observe(document.body,{childList:true,subtree:true});
};
})();
