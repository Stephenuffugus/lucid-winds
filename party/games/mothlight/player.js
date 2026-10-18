/* Mothlight PLAYER (phone). Renders from phase payloads only, so a phone
   that locked and rejoined lands in the live phase with everything it needs.

   ⭐ NO TV MODE (18 Oct 2026, Stephen: "can we make everyones screen the screen to watch?"). When the room says
   PartyShell.noTv, this phone IS the room's screen: it shows the rules, the moths landing on each answer, the
   whole reveal (the answer, its source, how everybody did), the standings and the podium. Without the flag it
   behaves exactly as before and points at the big screen. The host plays from the same view (its seat). */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="mlp-wait"><div class="mlp-wait" id="mlp-wait-t">Eyes up on the big screen.</div></div>'+
 '<div class="screen mlp-scroll" id="mlp-rules"><div class="mlp-timer" id="mlp-rt"></div>'+
 '<div class="mlp-head">Mothlight</div>'+
 '<div class="mlp-rules">'+
 '<p>A fact appears. Is it true or false?</p>'+
 '<p>Tap your answer. You can change it until the timer runs out.</p>'+
 '<p>Everyone sees whose moth is on which side.</p>'+
 '<p>Right scores 100. Right while most of the room is wrong scores 150.</p>'+
 '</div></div>'+
 '<div class="screen" id="mlp-q" style="justify-content:flex-start;padding-top:max(18px,env(safe-area-inset-top))">'+
 '<div class="mlp-timer" id="mlp-t"></div><div class="mlp-qnum" id="mlp-n"></div>'+
 '<div class="mlp-fact" id="mlp-f"></div>'+
 '<div class="mlp-btns">'+
 '<button class="mlp-btn true" id="mlp-true"><span class="mlp-lab">TRUE</span><span class="mlp-chips" id="mlp-ct"></span></button>'+
 '<button class="mlp-btn false" id="mlp-false"><span class="mlp-lab">FALSE</span><span class="mlp-chips" id="mlp-cf"></span></button>'+
 '</div></div>'+
 '<div class="screen" id="mlp-r">'+
 '<div class="mlp-timer" id="mlp-rvt"></div>'+
 '<div class="mlp-qnum" id="mlp-rn"></div>'+
 '<div class="mlp-answer" id="mlp-ans"></div>'+
 '<div class="mlp-result" id="mlp-rt2"></div>'+
 '<div class="mlp-src" id="mlp-src"></div>'+
 '<div class="mlp-rows" id="mlp-room"></div></div>'+
 '<div class="screen mlp-scroll" id="mlp-stand"><div class="mlp-timer" id="mlp-st"></div>'+
 '<div class="mlp-head">Standings</div><div class="mlp-rows" id="mlp-standrows"></div></div>'+
 '<div class="screen mlp-scroll" id="mlp-pod"><div class="mlp-head">The night is over</div>'+
 '<div class="mlp-mine" id="mlp-podme"></div><div class="mlp-rows" id="mlp-podrows"></div>'+
 '<div class="mlp-hint" id="mlp-podhint">The host picks what happens next.</div></div>';

function show(id){ var s=root.querySelectorAll('.screen'); for(var i=0;i<s.length;i++)s[i].classList.remove('on'); $(id).classList.add('on'); }
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
function noTv(){ return !!PartyShell.noTv; }
var curQ=0, sel=null;

function pick(v){
  sel=v;
  $('mlp-true').classList.toggle('sel',v===true);
  $('mlp-false').classList.toggle('sel',v===false);
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

/* the moths landing (no TV mode only): the host sends who is on which side as they tap */
function chips(list){
  var out='';
  for(var i=0;i<(list||[]).length;i++)
    out+='<span class="mlp-chip"><i style="background:'+esc(list[i][1])+'"></i>'+esc(list[i][0])+'</span>';
  return out;
}
PartyShell.onMessage(function(msg){
  if(!msg||msg.t!=='moths'||msg.q!==curQ||!noTv()) return;
  $('mlp-ct').innerHTML=chips(msg.yes); $('mlp-cf').innerHTML=chips(msg.no);
});

/* a list of the room, highest first; yours is marked */
/* one order for the list and for "place n of m", or a tie reads one way in the line and another in the list */
function order(scores,names){
  var ids=Object.keys(names||{});
  ids.sort(function(a,b){ return ((scores||{})[b]||0)-((scores||{})[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  return ids;
}
function rows(scores,names,cols,extra){
  var ids=order(scores,names), out='';
  for(var i=0;i<ids.length;i++){
    var id=ids[i], me=id===PartyShell.playerId;
    out+='<div class="mlp-row'+(me?' me':'')+'"><span class="pl">'+(i+1)+'</span>'+
      '<i style="background:'+esc((cols||{})[id]||'#e8dcc8')+'"></i>'+
      '<span class="nm">'+esc(names[id])+(me?' (you)':'')+'</span>'+
      (extra?'<span class="ex">'+extra(id)+'</span>':'')+
      '<b>'+((scores||{})[id]||0)+'</b></div>';
  }
  return out;
}
var WORD={lone:'Lone moth',right:'Right',miss:'Wrong',none:'No answer'};

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){
    if(noTv()){ show('mlp-rules'); return; }
    $('mlp-wait-t').textContent='Eyes up on the big screen.'; show('mlp-wait');
  }
  else if(name==='question'){
    curQ=data.num; sel=null;
    $('mlp-true').classList.remove('sel'); $('mlp-false').classList.remove('sel');
    $('mlp-ct').innerHTML=''; $('mlp-cf').innerHTML='';
    $('mlp-n').textContent='QUESTION '+data.num+' OF '+data.total;
    $('mlp-f').textContent=data.text;
    show('mlp-q');
  }
  else if(name==='reveal'){
    var me=(data.results||{})[PartyShell.playerId]||{got:'none',pts:0};
    var el=$('mlp-rt2');
    if(me.got==='lone'){ el.textContent='Lone moth, +150'; el.className='mlp-result lone'; }
    else if(me.got==='right'){ el.textContent='Right, +100'; el.className='mlp-result right'; }
    else if(me.got==='miss'){ el.textContent='Not this time'; el.className='mlp-result miss'; }
    else { el.textContent='No answer'; el.className='mlp-result miss'; }
    var nt=noTv();
    $('mlp-r').classList.toggle('mlp-full',nt);
    $('mlp-rn').textContent=nt?('QUESTION '+data.num):'';
    $('mlp-ans').textContent=nt?('It was '+(data.answer?'TRUE':'FALSE')):'';
    $('mlp-ans').className='mlp-answer'+(nt?(data.answer?' t':' f'):'');
    $('mlp-src').textContent=nt&&data.source?('Source: '+data.source):'';
    if(nt){
      var pts={},k; for(k in (data.results||{})) pts[k]=data.results[k].pts||0;
      $('mlp-room').innerHTML=rows(pts,data.names,data.cols,function(id){
        var r=(data.results||{})[id]||{got:'none'}; return WORD[r.got]||''; });
    } else $('mlp-room').innerHTML='';
    show('mlp-r');
  }
  else if(name==='standings'){
    if(noTv()){ $('mlp-standrows').innerHTML=rows(data.scores,data.names,data.cols); show('mlp-stand'); return; }
    $('mlp-wait-t').textContent='Standings on the big screen.'; show('mlp-wait');
  }
  else if(name==='podium'||name==='over'){
    if(noTv()){
      /* 'over' carries only places; the podium already shows everything, so it stays */
      if(name==='over'&&$('mlp-pod').classList.contains('on')) return;
      var sc0=(data.scores||{})[PartyShell.playerId], ids=order(data.scores,data.names), place=0;
      for(var j=0;j<ids.length;j++) if(ids[j]===PartyShell.playerId) place=j+1;
      $('mlp-podme').textContent=sc0!==undefined?('You lit '+sc0+(place?(', place '+place+' of '+ids.length):'')):'';
      $('mlp-podrows').innerHTML=rows(data.scores,data.names,data.cols);
      /* the host's own seat has the controls in the bar under it */
      $('mlp-podhint').textContent=/[?&]seat=1(&|$)/.test(location.search)?'Your controls are just below.':'The host picks what happens next.';
      show('mlp-pod'); return;
    }
    var sc=(data.scores||{})[PartyShell.playerId];
    $('mlp-wait-t').textContent=(sc!==undefined)?('The night is over. You lit '+sc+'.'):'The night is over.';
    show('mlp-wait');
  }
});
show('mlp-wait');
})();
