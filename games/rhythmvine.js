// ═══ LUCID WINDS — Rhythm Vine (tap-to-beat timing) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;


window._gameFns=window._gameFns||{};
window._gameFns.rhythmvine=function RV(a){
  var bpm=90,beatInterval=60/90;
  var score=0,streak=0,bestStreak=0,level=1,combo=0;
  var playing=false,missCount=0;
  var audioCtx=null,masterGain=null;
  var beats=[],nextBeatTime=0,beatCount=0;
  var rafId=0,tickerId=0;

  var PATTERNS=[
    [1,0,1,0],[1,0,1,0,1,0,1,0],[1,1,1,1],
    [1,0,1,1,1,0,1,1],[1,1,0,1,1,0,1,1],[1,0,1,0,1,1,0,1],
    [1,1,1,0,1,1,1,0],[1,0,1,1,0,1,1,0]
  ];

  ms(a,'Score <span id="RVs">0</span> · Streak <span id="RVk">0</span> · L<span id="RVl">1</span>');
  mm(a);
  var pan=document.createElement('div');pan.id='RVpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:8px;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_RVBPM(-10)">BPM-</button> <button class="gb" onclick="_RVBPM(10)">BPM+</button> <button class="gb" onclick="_RVN()">🌱 NEW</button>';

  function initAudio(){
    if(audioCtx)return;
    try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      masterGain=audioCtx.createGain();masterGain.gain.value=0.25;
      masterGain.connect(audioCtx.destination);
    }catch(e){}
  }

  function playClick(t,accent){
    if(!audioCtx)return;
    var o=audioCtx.createOscillator(),gn=audioCtx.createGain();
    o.type='sine';o.frequency.value=accent?880:660;
    gn.gain.setValueAtTime(accent?0.25:0.12,t);
    gn.gain.exponentialRampToValueAtTime(0.001,t+0.08);
    o.connect(gn);gn.connect(masterGain);
    o.start(t);o.stop(t+0.1);
  }

  function playTone(freq,dur,type){
    if(!audioCtx)return;
    var t=audioCtx.currentTime;
    var o=audioCtx.createOscillator(),gn=audioCtx.createGain();
    o.type=type||'triangle';o.frequency.value=freq;
    gn.gain.setValueAtTime(0.15,t);
    gn.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(gn);gn.connect(masterGain);
    o.start(t);o.stop(t+dur);
  }

  function schedule(){
    if(!playing||!audioCtx)return;
    var now=audioCtx.currentTime;
    beatInterval=60/bpm;
    var pattern=PATTERNS[Math.min(level-1,PATTERNS.length-1)];
    while(nextBeatTime<now+0.5){
      var isActive=pattern[beatCount%pattern.length]===1;
      var isDown=beatCount%4===0;
      playClick(nextBeatTime,isDown);
      if(isActive)beats.push({time:nextBeatTime,hit:false,missed:false});
      beatCount++;
      nextBeatTime+=beatInterval;
    }
    // Detect missed beats
    for(var i=beats.length-1;i>=0;i--){
      if(!beats[i].hit&&!beats[i].missed&&now-beats[i].time>0.25){
        beats[i].missed=true;missCount++;
        if(missCount>=3){streak=0;combo=0;updateHUD();}
      }
    }
    while(beats.length>0&&(beats[0].hit||beats[0].missed)&&now-beats[0].time>1)beats.shift();
  }

  function updateHUD(){
    var s=document.getElementById('RVs'),k=document.getElementById('RVk'),l=document.getElementById('RVl');
    if(s)s.textContent=score;if(k)k.textContent=streak;if(l)l.textContent=level;
  }

  function setMsg(t,c){
    var el=document.getElementById('RVmsg');if(!el)return;
    el.textContent=t;el.style.color=c||'var(--cream)';
    setTimeout(function(){if(el.textContent===t)el.textContent='';},700);
  }

  function render(){
    var h='<div style="padding:10px;">';
    h+='<div id="RVmsg" style="font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:2px;min-height:24px;color:var(--cream);"></div>';
    h+='<div style="position:relative;margin:20px auto;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(122,179,86,0.15),transparent);display:flex;align-items:center;justify-content:center;">';
    h+='<div id="RVring" style="position:absolute;inset:0;border-radius:50%;border:2px solid rgba(122,179,86,0.2);"></div>';
    h+='<button id="RVtap" onclick="_RVTAP()" style="width:140px;height:140px;border-radius:50%;background:rgba(26,36,22,0.7);border:3px solid rgba(122,179,86,0.4);color:var(--sage);font-family:Bebas Neue,sans-serif;font-size:1.2rem;letter-spacing:3px;cursor:pointer;">TAP</button>';
    h+='</div>';
    h+='<div style="font-size:0.7rem;opacity:0.5;">BPM: <span id="RVbpm">'+bpm+'</span></div>';
    h+='</div>';
    pan.innerHTML=h;
  }

  function flashTap(cls){
    var t=document.getElementById('RVtap');if(!t)return;
    if(cls==='hit'){t.style.background='rgba(122,179,86,0.4)';t.style.borderColor='#7ab356';t.style.boxShadow='0 0 20px rgba(122,179,86,0.4)';}
    else{t.style.background='rgba(196,122,122,0.3)';t.style.borderColor='#c47a7a';}
    setTimeout(function(){if(t){t.style.background='rgba(26,36,22,0.7)';t.style.borderColor='rgba(122,179,86,0.4)';t.style.boxShadow='';}},150);
  }

  window._RVTAP=function(){
    if(!playing||!audioCtx)return;
    var now=audioCtx.currentTime;
    var closestIdx=-1,closestDiff=Infinity;
    for(var i=0;i<beats.length;i++){
      if(beats[i].hit||beats[i].missed)continue;
      var diff=Math.abs(now-beats[i].time);
      if(diff<closestDiff){closestDiff=diff;closestIdx=i;}
    }
    if(closestIdx>=0&&closestDiff<0.2){
      beats[closestIdx].hit=true;missCount=0;
      var pts;
      if(closestDiff<0.05){pts=100;setMsg('PERFECT!','var(--sage)');}
      else if(closestDiff<0.1){pts=50;setMsg('GREAT','var(--gold)');}
      else{pts=25;setMsg('GOOD','var(--gold)');}
      pts=Math.round(pts*(1+combo*0.1));
      score+=pts;streak++;combo++;
      if(streak>bestStreak)bestStreak=streak;
      if(streak>0&&streak%20===0&&level<PATTERNS.length){level++;bpm=Math.min(160,bpm+5);setMsg('LEVEL '+level,'var(--sage)');_e('milestone');}
      playTone(523,0.15);flashTap('hit');
      if(streak%10===0)_e('progress');
    } else {
      streak=0;combo=0;
      setMsg('MISS','#c47a7a');playTone(120,0.12,'sawtooth');flashTap('miss');
    }
    updateHUD();
  };

  window._RVBPM=function(d){
    bpm=Math.max(60,Math.min(180,bpm+d));
    var b=document.getElementById('RVbpm');if(b)b.textContent=bpm;
  };

  window._RVN=function(){
    if(tickerId)clearInterval(tickerId);
    score=0;streak=0;bestStreak=0;level=1;combo=0;missCount=0;
    beats=[];beatCount=0;
    initAudio();
    if(!audioCtx){sm('Audio unavailable');return;}
    playing=true;
    nextBeatTime=audioCtx.currentTime+0.5;
    render();updateHUD();
    tickerId=setInterval(schedule,80);
    // End after ~90 seconds
    setTimeout(function(){
      if(!playing)return;
      playing=false;if(tickerId)clearInterval(tickerId);
      var won=score>=500;
      if(won){_e('game_win');_playWin();}else{_e('game_loss');_play('lose');}
      _sr('rhythmvine',{w:won,s:score,st:bestStreak});
      sm('Final: '+score+' · Best streak '+bestStreak);
    },90000);
  };

  render();
  sm('Tap NEW to start');
};
})();
