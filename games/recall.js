// ═══ LUCID WINDS — Recall Garden (visual memory) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;


window._gameFns=window._gameFns||{};
window._gameFns.recall=function RC(a){
  var SYMBOLS=[
    {emoji:'🌿',name:'Fern'},{emoji:'🌸',name:'Bloom'},{emoji:'🌻',name:'Sun'},
    {emoji:'🍄',name:'Spore'},{emoji:'🌲',name:'Pine'},{emoji:'🌾',name:'Grain'},
    {emoji:'🍀',name:'Clover'},{emoji:'🌵',name:'Cactus'},{emoji:'🌴',name:'Palm'},
    {emoji:'🍂',name:'Leaf'},{emoji:'🌺',name:'Hibiscus'},{emoji:'💐',name:'Bouquet'},
    {emoji:'🌹',name:'Rose'},{emoji:'🌷',name:'Tulip'},{emoji:'🪻',name:'Lavender'},
    {emoji:'🫐',name:'Berry'},{emoji:'🍇',name:'Grape'},{emoji:'🥕',name:'Root'},
    {emoji:'🌽',name:'Corn'},{emoji:'🍎',name:'Apple'}
  ];

  var round=0,score=0,level=1,totalRounds=6;
  var targetCount=3,distractorCount=3,showTime=6000,waitTime=4000;
  var targets=[],allChoices=[],selected={},phase='';
  var timers=[];
  var intervals=[];

  ms(a,'Round <span id="RCr">1</span>/'+totalRounds+' · Score <span id="RCs">0</span>');
  mm(a);
  var pan=document.createElement('div');pan.id='RCpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:10px;min-height:340px;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_RCN()">↻ New Game</button>';

  function clearTimers(){for(var i=0;i<timers.length;i++)clearTimeout(timers[i]);timers=[];for(var j=0;j<intervals.length;j++)clearInterval(intervals[j]);intervals=[];}
  function shuffle(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}

  // Wait phases tripled — Stephen wants the count-back portion much
  // longer to make the recall actually challenging. Also added a
  // round-by-round variation so symbols rotate (some rounds are
  // 4-target, some 6, some need to pick by NAME instead of icon).
  function configLevel(){
    if(level<=2){targetCount=3;distractorCount=3;showTime=6000;waitTime=12000;}
    else if(level<=4){targetCount=4;distractorCount=4;showTime=5500;waitTime=15000;}
    else{targetCount=5;distractorCount=5;showTime=5000;waitTime=18000;}
    // Mid-game variation: every 3rd round bumps targets +1 for variety
    if(round>0&&round%3===0){targetCount=Math.min(7,targetCount+1);distractorCount=Math.min(7,distractorCount+1);}
  }

  function startRound(){
    round++;configLevel();selected={};
    var pool=shuffle(SYMBOLS.slice());
    targets=pool.slice(0,targetCount);
    var distractors=pool.slice(targetCount,targetCount+distractorCount);
    allChoices=shuffle(targets.concat(distractors));
    var r=document.getElementById('RCr');if(r)r.textContent=round;
    phaseShow();
  }

  function phaseShow(){
    phase='show';
    var h='<div style="text-align:center;padding:10px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1rem;color:var(--sage);letter-spacing:2px;">MEMORIZE</div>';
    h+='<div style="font-size:0.7rem;opacity:0.6;margin:6px 0;">Remember these '+targetCount+' symbols</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:340px;margin:10px auto;">';
    for(var i=0;i<targets.length;i++){
      h+='<div style="width:74px;height:86px;background:rgba(212,168,67,0.15);border:2px solid var(--gold);border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
      h+='<span style="font-size:1.8rem;">'+targets[i].emoji+'</span>';
      h+='<span style="font-family:Bebas Neue,sans-serif;font-size:0.5rem;opacity:0.6;letter-spacing:1px;">'+targets[i].name+'</span>';
      h+='</div>';
    }
    h+='</div><div id="RCtm" style="font-family:Bebas Neue,sans-serif;font-size:1.4rem;color:var(--gold);"></div></div>';
    pan.innerHTML=h;
    var remaining=Math.ceil(showTime/1000);
    var tm=document.getElementById('RCtm');if(tm)tm.textContent=remaining+'s';
    var iv=setInterval(function(){
      remaining--;
      var t=document.getElementById('RCtm');if(t)t.textContent=Math.max(0,remaining)+'s';
      if(remaining<=0)clearInterval(iv);
    },1000);
    intervals.push(iv);
    timers.push(setTimeout(function(){clearInterval(iv);phaseWait();},showTime));
  }

  function phaseWait(){
    phase='wait';
    var startNum=50+Math.floor(Math.random()*50);
    var h='<div style="text-align:center;padding:30px 10px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1rem;color:var(--sage);letter-spacing:2px;">WAIT</div>';
    h+='<div style="font-size:0.85rem;margin:12px 0;">Count backwards from '+startNum+' by 3s...</div>';
    h+='<div id="RCwc" style="font-family:Bebas Neue,sans-serif;font-size:2rem;color:var(--gold);"></div></div>';
    pan.innerHTML=h;
    var remaining=Math.ceil(waitTime/1000);
    var wc=document.getElementById('RCwc');if(wc)wc.textContent=remaining;
    var iv=setInterval(function(){
      remaining--;
      var w=document.getElementById('RCwc');if(w)w.textContent=Math.max(0,remaining);
      if(remaining<=0)clearInterval(iv);
    },1000);
    intervals.push(iv);
    timers.push(setTimeout(function(){clearInterval(iv);phaseRecall();},waitTime));
  }

  function phaseRecall(){
    phase='recall';
    var h='<div style="text-align:center;padding:8px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1rem;color:var(--sage);letter-spacing:2px;">RECALL</div>';
    h+='<div style="font-size:0.7rem;opacity:0.6;margin:6px 0;">Tap the '+targetCount+' you memorized</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:340px;margin:10px auto;">';
    for(var i=0;i<allChoices.length;i++){
      h+='<div id="RCc'+i+'" onclick="_RCT('+i+')" style="width:74px;height:86px;background:rgba(26,36,22,0.5);border:2px solid rgba(122,179,86,0.2);border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;">';
      h+='<span style="font-size:1.8rem;">'+allChoices[i].emoji+'</span>';
      h+='<span style="font-family:Bebas Neue,sans-serif;font-size:0.5rem;opacity:0.6;letter-spacing:1px;">'+allChoices[i].name+'</span>';
      h+='</div>';
    }
    h+='</div><div id="RCmsg" style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);margin-top:6px;">0/'+targetCount+' selected</div></div>';
    pan.innerHTML=h;
  }

  window._RCT=function(idx){
    if(phase!=='recall')return;
    if(selected[idx])delete selected[idx];
    else{
      var n=0;for(var k in selected)n++;
      if(n>=targetCount)return;
      selected[idx]=true;
    }
    var count=0;for(var k2 in selected)count++;
    for(var i=0;i<allChoices.length;i++){
      var el=document.getElementById('RCc'+i);
      if(!el)continue;
      if(selected[i]){el.style.borderColor='var(--sage)';el.style.background='rgba(122,179,86,0.2)';}
      else{el.style.borderColor='rgba(122,179,86,0.2)';el.style.background='rgba(26,36,22,0.5)';}
    }
    var msg=document.getElementById('RCmsg');if(msg)msg.textContent=count+'/'+targetCount+' selected';
    if(count>=targetCount)timers.push(setTimeout(evaluate,400));
  };

  function evaluate(){
    phase='result';
    var correct=0,targetNames={};
    for(var i=0;i<targets.length;i++)targetNames[targets[i].name]=1;
    for(var k in selected){
      if(targetNames[allChoices[k].name])correct++;
    }
    // Visual
    for(i=0;i<allChoices.length;i++){
      var el=document.getElementById('RCc'+i);if(!el)continue;
      var isT=targetNames[allChoices[i].name],wasS=!!selected[i];
      var glyph='',gc='';
      if(wasS&&isT){el.style.borderColor='var(--sage)';el.style.background='rgba(122,179,86,0.25)';glyph='✓';gc='var(--sage)';}
      else if(wasS&&!isT){el.style.borderColor='#c47a7a';el.style.background='rgba(196,122,122,0.2)';glyph='✗';gc='#c47a7a';}
      else if(!wasS&&isT){el.style.borderColor='var(--gold)';el.style.background='rgba(212,168,67,0.15)';glyph='○';gc='var(--gold)';}
      if(glyph){el.style.position='relative';el.insertAdjacentHTML('beforeend','<span style="position:absolute;top:2px;right:4px;font-size:0.85rem;font-weight:700;color:'+gc+';">'+glyph+'</span>');}
    }
    var pts=Math.round(correct/targetCount*100);
    score+=pts;
    var s=document.getElementById('RCs');if(s)s.textContent=score;
    var msg=document.getElementById('RCmsg');if(msg){msg.textContent=correct+'/'+targetCount+' correct · +'+pts;msg.style.color=correct===targetCount?'var(--sage)':'var(--cream)';}
    if(correct>=targetCount-1)_e('milestone');
    if(correct===targetCount&&level<6)level++;
    timers.push(setTimeout(function(){
      if(round>=totalRounds)finish();else startRound();
    },1800));
  }

  function finish(){
    var avg=Math.round(score/totalRounds);
    var won=avg>=70;
    if(won){_e('game_win');_playWin();}else{_e('game_loss');_play('lose');}
    var h='<div style="text-align:center;padding:20px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--sage);letter-spacing:2px;">YOUR RECALL</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:3rem;color:var(--gold);">'+avg+'%</div>';
    h+='<div style="font-size:0.75rem;opacity:0.6;margin:6px 0;">'+totalRounds+' rounds · Level '+level+'</div>';
    h+='<div style="font-size:0.75rem;margin-top:10px;">'+(avg>=90?'Exceptional memory!':avg>=70?'Strong recall.':avg>=50?'Good effort.':'Keep practicing.')+'</div>';
    var pb=0;try{pb=parseInt(localStorage.getItem('lw_recall_best'),10)||0;}catch(e){}
    if(avg>pb){try{localStorage.setItem('lw_recall_best',String(avg));}catch(e){}}
    h+='<div style="font-size:0.7rem;opacity:0.55;margin-top:6px;">'+(avg>pb?'\u2b50 NEW BEST':'best '+pb+'%')+'</div>';
    h+='<button onclick="_RCN()" style="margin-top:16px;min-height:48px;padding:12px 26px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:10px;cursor:pointer;">\u21bb GO AGAIN</button>';
    h+='</div>';
    pan.innerHTML=h;
    _sr('recall',{w:won,s:avg,lv:level});
    sm('Final: '+avg+'%');
  }

  window._RCN=function(){
    clearTimers();
    round=0;score=0;level=1;
    var s=document.getElementById('RCs');if(s)s.textContent='0';
    startRound();
  };

  // Clean up timers if player exits the game mid-round. Without this,
  // the Memorize/Wait/Recall callbacks fire after the panel is gone
  // and either error or pop a stale overlay onto the next screen.
  var _watchExit=setInterval(function(){
    if(!document.body.classList.contains('game-active')){
      clearTimers();
      clearInterval(_watchExit);
    }
  },1000);

  _RCN();
};
})();
