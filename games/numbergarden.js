// ═══ NUMBER GARDEN — arithmetic drill (Kawashima-style) ═══
// 60-second sessions. Solve math problems; streaks raise difficulty.
// Win = >= 10 correct.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.numbergarden = function NG(a){
  var mode='add',answer='',correctAnswer=0;
  var correct=0,total=0,streak=0,bestStreak=0;
  var sessionTime=60,startTime=0,problemStartTime=0,totalSolveTime=0;
  var running=false,difficulty=1;
  var timerInterval=0;
  // Persisted lifetime best so progress carries over.
  var lifetimeBest=0;
  try{lifetimeBest=parseInt(localStorage.getItem('lw_ng_best')||'0',10)||0;}catch(e){}

  ms(a,'NUMBER GARDEN · 60s drill · best <strong id="NGbest">'+lifetimeBest+'</strong>');
  mm(a);
  var pan=document.createElement('div');
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;text-align:center;';
  a.appendChild(pan);

  var hud=document.createElement('div');
  hud.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:6px;background:rgba(26,31,23,0.5);border-radius:8px;margin:4px 0;font-family:DM Mono,monospace;';
  hud.innerHTML='<div><div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:#7ab356;letter-spacing:0.08em;">CORRECT</div><div id="NGc" style="font-size:1.1rem;color:#c8a84b;">0</div></div><div><div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:#7ab356;letter-spacing:0.08em;">SPEED</div><div id="NGsp" style="font-size:1.1rem;color:#e8dcc8;">—</div></div><div><div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:#7ab356;letter-spacing:0.08em;">STREAK</div><div id="NGst" style="font-size:1.1rem;color:#e8dcc8;">0</div></div>';
  pan.appendChild(hud);

  var bar=document.createElement('div');
  bar.style.cssText='width:90%;max-width:280px;height:4px;background:rgba(26,36,22,0.5);border-radius:2px;margin:6px auto;overflow:hidden;';
  bar.innerHTML='<div id="NGtb" style="height:100%;background:#7ab356;width:100%;transition:width .2s linear;"></div>';
  pan.appendChild(bar);

  var prob=document.createElement('div');
  prob.id='NGprob';
  prob.style.cssText='font-family:Bebas Neue,sans-serif;font-size:2.4rem;letter-spacing:3px;margin:10px 0;min-height:50px;color:#e8dcc8;';
  prob.textContent='Press START';
  pan.appendChild(prob);

  var ansD=document.createElement('div');
  ansD.id='NGans';
  ansD.style.cssText='font-family:Bebas Neue,sans-serif;font-size:2rem;color:#c8a84b;min-height:42px;margin:4px 0;letter-spacing:2px;border-bottom:2px solid rgba(200,168,75,0.3);padding-bottom:4px;min-width:80px;display:inline-block;';
  ansD.textContent='_';
  pan.appendChild(ansD);

  var fb=document.createElement('div');
  fb.id='NGfb';
  fb.style.cssText='font-family:Bebas Neue,sans-serif;font-size:0.9rem;min-height:24px;letter-spacing:1px;margin:4px 0;color:#7ab356;';
  pan.appendChild(fb);

  // Numpad
  var pad=document.createElement('div');
  pad.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:240px;margin:8px auto;padding:6px 0;';
  var pk=['1','2','3','4','5','6','7','8','9','←','0','✓'];
  var hp='';
  for(var i=0;i<pk.length;i++){
    var k=pk[i];
    var onc='_NGK(\''+k+'\')';
    var extra='';
    if(k==='←')extra='color:#c47a7a;border-color:rgba(196,122,122,0.4);';
    else if(k==='✓')extra='color:#7ab356;background:rgba(122,179,86,0.15);border-color:rgba(122,179,86,0.4);';
    hp+='<button onclick="'+onc+'" style="min-height:48px;border-radius:10px;background:rgba(26,36,22,0.6);border:1.5px solid rgba(122,179,86,0.25);color:#e8dcc8;font-family:Bebas Neue,sans-serif;font-size:1.3rem;cursor:pointer;'+extra+'">'+k+'</button>';
  }
  pad.innerHTML=hp;
  pan.appendChild(pad);

  // Mode row
  var mrow=document.createElement('div');
  mrow.style.cssText='display:flex;gap:4px;justify-content:center;padding:6px;flex-wrap:wrap;';
  pan.appendChild(mrow);
  function buildModes(){
    var modes=[['add','+ ADD'],['sub','− SUB'],['mul','× MUL'],['mix','MIX']];
    var h='';
    for(var i=0;i<modes.length;i++){
      var active=mode===modes[i][0];
      h+='<button class="gb" onclick="_NGMD(\''+modes[i][0]+'\')" style="padding:5px 10px;font-size:0.78rem;letter-spacing:0.06em;'+(active?'background:rgba(122,179,86,0.2);border-color:#7ab356;color:#7ab356;':'')+'">'+modes[i][1]+'</button>';
    }
    mrow.innerHTML=h;
  }
  buildModes();

  mc(a).innerHTML='<button class="gb" onclick="_NGN()">START</button>';

  function updateHUD(){
    var e;
    if(e=document.getElementById('NGc'))e.textContent=correct;
    if(e=document.getElementById('NGst'))e.textContent=streak;
    var avgSpeed=correct>0?Math.round(totalSolveTime/correct/100)/10+'s':'—';
    if(e=document.getElementById('NGsp'))e.textContent=avgSpeed;
  }
  function generateProblem(){
    if(!running)return;
    var elapsed=(Date.now()-startTime)/1000;
    if(elapsed>=sessionTime){endSession();return;}
    var a2,b2,op,ans;
    var ops=mode==='mix'?['+','-','×']:[mode==='add'?'+':mode==='sub'?'-':'×'];
    op=ops[Math.floor(Math.random()*ops.length)];
    var maxN=10+difficulty*5;
    if(op==='+'){a2=Math.floor(Math.random()*maxN)+1;b2=Math.floor(Math.random()*maxN)+1;ans=a2+b2;}
    else if(op==='-'){a2=Math.floor(Math.random()*maxN)+5;b2=Math.floor(Math.random()*Math.min(a2,maxN))+1;ans=a2-b2;}
    else {a2=Math.floor(Math.random()*Math.min(12,maxN))+2;b2=Math.floor(Math.random()*Math.min(12,maxN))+2;ans=a2*b2;}
    correctAnswer=ans;
    document.getElementById('NGprob').textContent=a2+' '+op+' '+b2+' =';
    document.getElementById('NGans').textContent='_';
    document.getElementById('NGfb').textContent='';
    answer='';
    problemStartTime=Date.now();
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
    var avgSpeed=correct>0?Math.round(totalSolveTime/correct/100)/10:0;
    var accuracy=total>0?Math.round(correct/total*100):0;
    var won=correct>=10;
    var newBest=correct>lifetimeBest;
    if(newBest){lifetimeBest=correct;try{localStorage.setItem('lw_ng_best',String(lifetimeBest));}catch(e){}}
    var bEl=document.getElementById('NGbest');if(bEl)bEl.textContent=lifetimeBest;
    sm((won?'✓ ':'')+correct+'/'+total+' · '+accuracy+'% · '+avgSpeed+'s avg'+(newBest?' · 🌟 NEW BEST':''));
    if(won){_playWin();_e('game_win');}else{_play('lose');_e('game_loss');}
    _sr('numbergarden',{w:won,s:correct,acc:accuracy,spd:avgSpeed,st:bestStreak});
    document.getElementById('NGprob').textContent='Done';
  }
  window._NGK=function(k){
    if(!running){sm('Press START to begin');return;}
    if(k==='←'){answer=answer.slice(0,-1);document.getElementById('NGans').textContent=answer||'_';_play('tap');return;}
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
        fbEl.textContent='✓ '+(solveTime<2000?'FAST!':solveTime<4000?'GOOD':'OK')+' ('+(Math.round(solveTime/100)/10)+'s)';
        fbEl.style.color='#7ab356';
        _play('snap');
        _e('progress');
        if(streak%10===0)_e('milestone');
      } else {
        streak=0;difficulty=Math.max(1,difficulty-1);
        fbEl.textContent='✗ Answer was '+correctAnswer;
        fbEl.style.color='#c47a7a';
        _play('lose');
      }
      answer='';updateHUD();
      setTimeout(generateProblem,300);
      return;
    }
    if(answer.length>=4)return;
    answer+=k;
    document.getElementById('NGans').textContent=answer||'_';
    _play('tap');
  };
  window._NGMD=function(m){mode=m;buildModes();_play('tap');};
  window._NGN=function(){
    correct=0;total=0;streak=0;bestStreak=0;difficulty=1;totalSolveTime=0;answer='';
    sessionTime=60;
    running=true;startTime=Date.now();
    updateHUD();generateProblem();
    if(timerInterval)clearInterval(timerInterval);
    timerInterval=setInterval(tickTimer,200);
    sm('GO! 60 seconds');
  };
};
})();
