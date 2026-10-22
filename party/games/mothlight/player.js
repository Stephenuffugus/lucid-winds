/* Mothlight PLAYER (phone). Renders from phase payloads only, so a phone
   that locked and rejoined lands in the live phase with everything it needs.

   ⭐ NO TV MODE (18 Oct 2026, Stephen: "can we make everyones screen the screen to watch?"). When the room says
   PartyShell.noTv, this phone IS the room's screen. The host plays from the same view (its seat).
   ⭐ ASTRA'S REVIEW (18 Oct, MOTHLIGHT-D01 to D04 and the copy table): the phone shows the rules, the moths on each
   side (name plus a symbol), whether the host has your answer ("Sending", then "Saved on True. You can change
   sides."), the answer with its source, your score line, and the room's scores, in BOTH modes; the shared screen
   adds the big picture, it no longer holds information back from the phones. The buttons never move under a thumb:
   they keep a fixed size however many moths land on them. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="mlp-wait"><div class="mlp-wait" id="mlp-wait-t">You are ready. The game will appear here.</div></div>'+
 '<div class="screen mlp-scroll" id="mlp-rules"><div class="mlp-timer" id="mlp-rt"></div>'+
 '<div class="mlp-head">Mothlight</div>'+
 '<div class="mlp-sub">Here is how to play.</div>'+
 '<div class="mlp-rules">'+
 '<p>Read the statement. Choose True or False.</p>'+
 '<p>Everyone can see where your moth lands.</p>'+
 '<p>You can change sides until time runs out.</p>'+
 '<p>Correct answers earn 100. A correct smaller group earns 150.</p>'+
 '<p class="mlp-small">The bonus needs at least three answers. Equal groups earn 100.</p>'+
 '</div></div>'+
 '<div class="screen" id="mlp-q" style="justify-content:flex-start;padding-top:max(18px,env(safe-area-inset-top))">'+
 '<div class="mlp-timer" id="mlp-t"></div><div class="mlp-qnum" id="mlp-n"></div>'+
 '<div class="mlp-fact" id="mlp-f"></div>'+
 '<div class="mlp-saved" id="mlp-saved" aria-live="polite"></div>'+
 '<div class="mlp-btns">'+
 '<button class="mlp-btn true" id="mlp-true"><span class="mlp-lab">TRUE</span><span class="mlp-chips" id="mlp-ct"></span></button>'+
 '<button class="mlp-btn false" id="mlp-false"><span class="mlp-lab">FALSE</span><span class="mlp-chips" id="mlp-cf"></span></button>'+
 '</div></div>'+
 '<div class="screen mlp-full" id="mlp-r">'+
 '<div class="mlp-timer" id="mlp-rvt"></div>'+
 '<div class="mlp-qnum" id="mlp-rn"></div>'+
 '<div class="mlp-stmt" id="mlp-stmt"></div>'+
 '<div class="mlp-answer" id="mlp-ans"></div>'+
 '<div class="mlp-expl" id="mlp-expl"></div>'+
 '<div class="mlp-result" id="mlp-rt2"></div>'+
 '<div class="mlp-src" id="mlp-src"></div>'+
 '<div class="mlp-rows" id="mlp-room"></div></div>'+
 '<div class="screen mlp-scroll" id="mlp-stand"><div class="mlp-timer" id="mlp-st"></div>'+
 '<div class="mlp-head">Scores so far</div><div class="mlp-mine" id="mlp-standme"></div><div class="mlp-rows" id="mlp-standrows"></div></div>'+
 '<div class="screen mlp-scroll" id="mlp-pod"><div class="mlp-head">Game complete</div>'+
 '<div class="mlp-mine" id="mlp-podme"></div><div class="mlp-place" id="mlp-podplace"></div><div class="mlp-rows" id="mlp-podrows"></div>'+
 '<div class="mlp-hint" id="mlp-podhint">Waiting for the host to choose what is next.</div></div>';

function show(id){ var s=root.querySelectorAll('.screen'); for(var i=0;i<s.length;i++)s[i].classList.remove('on'); $(id).classList.add('on'); }
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
var SEATED=/[?&]seat=1(&|$)/.test(location.search);
var SAY=PartyShell.SAY||{sending:'Sending'};
var curQ=0, sel=null;
function side(v){ return v?'True':'False'; }

/* SHELL-D04: "Sending" the moment a finger lands, "Saved on True" only when the host acknowledges that exact side */
function pick(v){
  sel=v;
  $('mlp-true').classList.toggle('sel',v===true);
  $('mlp-false').classList.toggle('sel',v===false);
  $('mlp-saved').textContent=SAY.sending;
  $('mlp-saved').className='mlp-saved sending';
  PartyShell.sendToHost({t:'answer',q:curQ,v:v});
}
$('mlp-true').addEventListener('click',function(){pick(true);});
$('mlp-false').addEventListener('click',function(){pick(false);});

PartyShell.onTimer(function(s){
  var ts=root.querySelectorAll('.mlp-timer');
  for(var i=0;i<ts.length;i++){
    if(s===null||s===undefined){ ts[i].textContent=''; continue; }
    ts[i].textContent=s; ts[i].classList.toggle('low',s<=5);
  }
});

/* name plus symbol in the player's colour (MOTHLIGHT-D02): two Sams and a colour blind player can still tell moths apart */
function chip(name,col,sym){
  return '<span class="mlp-chip"><i class="mlp-sym" style="color:'+esc(col||'#e8dcc8')+'">'+esc(sym||'●')+'</i>'+esc(name)+'</span>';
}
function chips(list){
  var out='';
  for(var i=0;i<(list||[]).length;i++) out+=chip(list[i][0],list[i][1],list[i][2]);
  return out;
}
PartyShell.onMessage(function(msg){
  if(!msg||msg.q!==curQ) return;
  if(msg.t==='moths'){ $('mlp-ct').innerHTML=chips(msg.yes); $('mlp-cf').innerHTML=chips(msg.no); }
  else if(msg.t==='ack'&&msg.v===sel){
    $('mlp-saved').textContent='Saved on '+side(msg.v)+'. You can change sides.';
    $('mlp-saved').className='mlp-saved saved';
  }
});

/* one order and one place rule, the same as the host's: equal scores share a place */
function ranked(scores,names){
  var ids=Object.keys(names||{}); scores=scores||{};
  ids.sort(function(a,b){ return (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0, count={};
  for(var i=0;i<ids.length;i++){ var s=scores[ids[i]]||0; if(s!==last){ place=i+1; last=s; } places[ids[i]]=place; count[place]=(count[place]||0)+1; }
  return {ids:ids,places:places,count:count};
}
function rows(scores,names,cols,symz,extra){
  var r=ranked(scores,names), out='';
  for(var i=0;i<r.ids.length;i++){
    var id=r.ids[i], me=id===PartyShell.playerId;
    out+='<div class="mlp-row'+(me?' me':'')+'"><span class="pl">'+r.places[id]+'</span>'+
      '<i class="mlp-sym" style="color:'+esc((cols||{})[id]||'#e8dcc8')+'">'+esc((symz||{})[id]||'●')+'</i>'+
      '<span class="nm">'+esc(names[id])+(me?' (you)':'')+'</span>'+
      (extra?'<span class="ex">'+extra(id)+'</span>':'')+
      '<b>'+((scores||{})[id]||0)+'</b></div>';
  }
  return out;
}
function placeLine(scores,names){
  var r=ranked(scores,names), p=r.places[PartyShell.playerId];
  if(!p) return '';
  return r.count[p]>1?('Tied for '+p+' of '+r.ids.length):('Place '+p+' of '+r.ids.length);
}
var WORD={lone:'Smaller group',right:'Right',miss:'Wrong',none:'No answer'};

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){ show('mlp-rules'); }
  else if(name==='question'){
    curQ=data.num; sel=null;
    $('mlp-true').classList.remove('sel'); $('mlp-false').classList.remove('sel');
    $('mlp-ct').innerHTML=''; $('mlp-cf').innerHTML='';
    $('mlp-saved').textContent=''; $('mlp-saved').className='mlp-saved';
    $('mlp-n').textContent='QUESTION '+data.num+' OF '+data.total;
    $('mlp-f').textContent=data.text;
    show('mlp-q');
  }
  else if(name==='reveal'){
    var me=(data.results||{})[PartyShell.playerId]||{got:'none',pts:0,choice:null};
    var el=$('mlp-rt2'), ans=side(data.answer);
    if(me.got==='lone'){ el.textContent='Right with the smaller group. +150'; el.className='mlp-result lone'; }
    else if(me.got==='right'){ el.textContent='Right. +100'; el.className='mlp-result right'; }
    else if(me.got==='miss'){ el.textContent='Your answer was '+side(me.choice)+'. The answer is '+ans+'.'; el.className='mlp-result miss'; }
    else { el.textContent='No answer saved this round.'; el.className='mlp-result miss'; }
    $('mlp-rn').textContent='QUESTION '+data.num;
    /* the statement again, so the answer has something to answer (seen in the reveal shot: "True." about what?) */
    $('mlp-stmt').textContent=data.text||'';
    $('mlp-ans').textContent=ans+'.';
    $('mlp-ans').className='mlp-answer'+(data.answer?' t':' f');
    /* D03: an explanation only when the bank has one; none is ever made up here */
    $('mlp-expl').textContent=data.explanation||'';
    $('mlp-src').textContent=data.source?('Source: '+data.source):'';
    var pts={},k; for(k in (data.results||{})) pts[k]=data.results[k].pts||0;
    $('mlp-room').innerHTML=rows(pts,data.names,data.cols,data.syms,function(id){
      var r=(data.results||{})[id]||{got:'none'}; return WORD[r.got]||''; });
    show('mlp-r');
  }
  else if(name==='standings'){
    var sc=(data.scores||{})[PartyShell.playerId];
    $('mlp-standme').textContent=sc!==undefined?('Your total is '+sc+'. See everyone’s scores below.'):'';
    $('mlp-standrows').innerHTML=rows(data.scores,data.names,data.cols,data.syms);
    show('mlp-stand');
  }
  else if(name==='podium'||name==='over'){
    /* 'over' carries only places; the podium already shows everything, so it stays */
    if(name==='over'&&$('mlp-pod').classList.contains('on')) return;
    if(name==='over'&&!data.names){ return; }
    var sc0=(data.scores||{})[PartyShell.playerId];
    $('mlp-podme').textContent=sc0!==undefined?('Your total is '+sc0+'.'):'';
    $('mlp-podplace').textContent=sc0!==undefined?placeLine(data.scores,data.names):'';
    $('mlp-podrows').innerHTML=rows(data.scores,data.names,data.cols,data.syms);
    /* the host's own seat has the controls in the bar under it */
    $('mlp-podhint').textContent=SEATED?'Your controls are just below.':'Waiting for the host to choose what is next.';
    show('mlp-pod');
  }
});
show('mlp-wait');
})();
