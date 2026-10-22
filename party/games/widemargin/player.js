/* WIDE MARGIN, phone. A dial from 0 to 100. Renders from phase payloads only, so a rejoining phone lands in the
   live round.

   ⛔ THREE WAYS TO SET IT, because a slider alone is a bad phone control. You can drag the track for a rough sweep,
   tap the big minus and plus (or use the keyboard) for precision, and the number itself is enormous so you always
   know what you are about to save. A player who wants exactly 47 can get exactly 47 without fighting their thumb.

   ⭐ 18 Oct 2026, Astra's review (WIDEMARGIN-D02 to D04, the copy table B7.4, the no big screen version B7.5): this
   phone shows the whole room's view in BOTH modes, phase by phase. The rules with "25% means 25 out of 100" and the
   game's length; the question with the dial as a LOCAL DRAFT: nothing is sent until Save guess (an untouched 50 is
   not a guess; "Sending" until the host acknowledges, then "Saved guess: N%"; a change shows "Changes not saved."
   and Save changes); the reveal with the truth first, then every saved guess on the line by name and symbol with
   its distance, this phone's own distance and points (base and bonus apart), the source, and a score panel; the
   scores after round five; the podium. With no shared screen (PartyShell.noTv) this IS the room's screen, and the
   host plays from it too (its seat). */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

function hundredHTML(){
  var h='<div class="wmp-hundred" aria-label="25 of 100 squares filled">';
  for(var i=0;i<100;i++) h+='<i'+(i<25?' class="on"':'')+'></i>';
  return h+'</div>';
}

var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="wmp-wait"><div class="wmp-wait" id="wmp-wait-t">You are ready. The game will appear here.</div>'+
 '<div class="wmp-sub" id="wmp-wait-s"></div></div>'+

 '<div class="screen wmp-scroll" id="wmp-rules"><div class="wmp-timer" id="wmp-rt"></div>'+
 '<div class="wmp-head">Wide Margin</div><div class="wmp-lead">Here is how to play.</div>'+
 '<div class="wmp-rules">'+
 '<p>Guess a percentage from 0 to 100.</p>'+
 '<p>Set your number and tap Save guess.</p>'+
 '<p>Closer guesses earn more. The closest earn 50 extra.</p>'+
 '<p>Every saved guess earns at least 5 points.</p></div>'+
 '<div class="wmp-ex">'+hundredHTML()+'<div class="wmp-ex-t">25% means 25 out of 100.</div></div>'+
 '<div class="wmp-small" id="wmp-len"></div></div>'+

 '<div class="screen wmp-play" id="wmp-q">'+
 '<div class="wmp-timer" id="wmp-t"></div>'+
 '<div class="wmp-num" id="wmp-n"></div>'+
 '<div class="wmp-q" id="wmp-qt"></div>'+
 '<div class="wmp-value"><span id="wmp-val">50</span><em>%</em></div>'+
 '<div class="wmp-track" id="wmp-track" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-label="Your guess, in percent">'+
 '<div class="wmp-fill" id="wmp-fill"></div><div class="wmp-saved" id="wmp-savedmark" hidden></div><div class="wmp-knob" id="wmp-knob"></div></div>'+
 '<div class="wmp-steps">'+
 '<button class="wmp-step" id="wmp-down" aria-label="One less">&minus;</button>'+
 '<button class="wmp-step wide" id="wmp-lock">Save guess</button>'+
 '<button class="wmp-step" id="wmp-up" aria-label="One more">+</button></div>'+
 '<div class="wmp-status" id="wmp-note" aria-live="polite">Drag or use the buttons. Then save your guess.</div>'+
 '<div class="wmp-count" id="wmp-gc"></div></div>'+

 '<div class="screen wmp-scroll" id="wmp-r">'+
 '<div class="wmp-timer" id="wmp-vt"></div><div class="wmp-num" id="wmp-vn"></div>'+
 '<div class="wmp-rq" id="wmp-rq"></div>'+
 '<div class="wmp-truth" id="wmp-truth"></div>'+
 '<div class="wmp-line" id="wmp-vtrack"></div>'+
 '<div class="wmp-scale"><span>0</span><span>50</span><span>100</span></div>'+
 '<div class="wmp-result" id="wmp-rt2"></div>'+
 '<div class="wmp-rsub" id="wmp-rs"></div>'+
 '<div class="wmp-mine" id="wmp-total"></div>'+
 '<button class="wmp-toggle" id="wmp-tog">Show scores</button>'+
 '<div class="wmp-rows" id="wmp-room" hidden></div>'+
 '<div class="wmp-listh">Everyone this round</div>'+
 '<div class="wmp-rows wmp-marks" id="wmp-marks"></div>'+
 '<div class="wmp-src" id="wmp-src"></div></div>'+

 '<div class="screen wmp-scroll" id="wmp-stand"><div class="wmp-timer" id="wmp-st"></div><div class="wmp-head" id="wmp-standh">Scores so far</div>'+
 '<div class="wmp-place" id="wmp-standplace"></div><div class="wmp-rows" id="wmp-standrows"></div></div>'+

 '<div class="screen wmp-scroll" id="wmp-pod"><div class="wmp-head">Game complete</div>'+
 '<div class="wmp-mine" id="wmp-podme"></div><div class="wmp-place" id="wmp-podplace"></div><div class="wmp-rows" id="wmp-podrows"></div>'+
 '<div class="wmp-hint" id="wmp-podhint">Waiting for the host to choose what is next.</div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var SEATED=/[?&]seat=1(&|$)/.test(location.search);
var SAY=PartyShell.SAY||{sending:'Sending',allSet:'All set. Finishing soon.'};
var curR=0, val=50, saved=null, sending=false, dragging=false, showScores=false;
function me(){ return PartyShell.playerId; }

/* ---- the dial: a local draft that only counts once SAVED (D03) ---- */
function paint(){
  $('wmp-val').textContent=val;
  $('wmp-fill').style.width=val+'%';
  $('wmp-knob').style.left=val+'%';
  $('wmp-track').setAttribute('aria-valuenow',val);
  var sm=$('wmp-savedmark');
  if(saved!==null){ sm.hidden=false; sm.style.left=saved+'%'; } else sm.hidden=true;
  var lock=$('wmp-lock');
  if(saved!==null&&val===saved&&!sending){ lock.textContent='Saved at '+saved+'%'; lock.disabled=true; }
  else { lock.textContent=saved===null?'Save guess':'Save changes'; lock.disabled=false; }
  var st=$('wmp-note');
  if(sending){ st.textContent=SAY.sending; st.className='wmp-status sending'; }
  else if(saved===null){ st.textContent='Drag or use the buttons. Then save your guess.'; st.className='wmp-status'; }
  else if(val===saved){ st.textContent='Saved guess: '+saved+'%. You can change your number, then tap Save changes.'; st.className='wmp-status saved'; }
  else { st.textContent='Changes not saved. Your saved guess is '+saved+'%.'; st.className='wmp-status warn'; }
}
function setVal(v){ val=Math.max(0,Math.min(100,Math.round(v))); paint(); }
function save(){
  if(saved!==null&&val===saved) return;
  sending=true; paint();
  PartyShell.sendToHost({t:'save',r:curR,v:val});
}
function fromEvent(ev){
  var tr=$('wmp-track').getBoundingClientRect();
  var t=(ev.touches&&ev.touches[0])||ev;
  return ((t.clientX-tr.left)/tr.width)*100;
}
function down(ev){ dragging=true; ev.preventDefault(); setVal(fromEvent(ev)); }
function move(ev){ if(!dragging) return; ev.preventDefault(); setVal(fromEvent(ev)); }
function up(){ dragging=false; }
var track=$('wmp-track');
track.addEventListener('pointerdown',down);
track.addEventListener('pointermove',move);
window.addEventListener('pointerup',up);
track.addEventListener('touchstart',down,{passive:false});
track.addEventListener('touchmove',move,{passive:false});
window.addEventListener('touchend',up);
track.addEventListener('keydown',function(ev){
  var k=ev.key, d=null;
  if(k==='ArrowLeft'||k==='ArrowDown') d=val-1; else if(k==='ArrowRight'||k==='ArrowUp') d=val+1;
  else if(k==='PageDown') d=val-10; else if(k==='PageUp') d=val+10;
  else if(k==='Home') d=0; else if(k==='End') d=100;
  else if(k==='Enter'||k===' '){ ev.preventDefault(); save(); return; }
  if(d!==null){ ev.preventDefault(); setVal(d); }
});
$('wmp-down').addEventListener('click',function(){ setVal(val-1); });
$('wmp-up').addEventListener('click',function(){ setVal(val+1); });
$('wmp-lock').addEventListener('click',save);

$('wmp-tog').addEventListener('click',function(){ showScores=!showScores; paintToggle(); });
function paintToggle(){ $('wmp-room').hidden=!showScores; $('wmp-tog').textContent=showScores?'Hide scores':'Show scores'; }

PartyShell.onTimer(function(s){
  var ts=root.querySelectorAll('.wmp-timer');
  for(var i=0;i<ts.length;i++){
    if(s===null||s===undefined){ ts[i].textContent=''; continue; }
    ts[i].textContent=s; ts[i].classList.toggle('low',s<=5);
  }
});

PartyShell.onMessage(function(msg){
  if(!msg||msg.r!==curR) return;
  if(msg.t==='gack'){ sending=false; saved=msg.v; paint(); }
  else if(msg.t==='gcount') $('wmp-gc').textContent=msg.n+' of '+msg.of+' guesses saved';
  else if(msg.t==='allset') $('wmp-gc').textContent=SAY.allSet;
});

/* one order and one place rule, the same as the host's: equal scores share a place */
function ranked(scores,names){
  var ids=Object.keys(names||{}); scores=scores||{};
  ids.sort(function(a,b){ return (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0, count={};
  for(var i=0;i<ids.length;i++){ var s=scores[ids[i]]||0; if(s!==last){ place=i+1; last=s; } places[ids[i]]=place; count[place]=(count[place]||0)+1; }
  return {ids:ids,places:places,count:count};
}
function sym(c,s){ return '<i class="wmp-sym" style="color:'+esc(c||'#e8dcc8')+'">'+esc(s||'●')+'</i>'; }
function rows(scores,names,cols,symz,extra){
  var r=ranked(scores,names), out='';
  for(var i=0;i<r.ids.length;i++){
    var id=r.ids[i], mine=id===me();
    out+='<div class="wmp-row'+(mine?' me':'')+'"><span class="pl">'+r.places[id]+'</span>'+
      sym((cols||{})[id],(symz||{})[id])+
      '<span class="nm">'+esc(names[id])+(mine?' (you)':'')+'</span>'+
      (extra?'<span class="ex">'+extra(id)+'</span>':'')+
      '<b>'+((scores||{})[id]||0)+'</b></div>';
  }
  return out;
}
/* rows for markers on the phone line: two guesses closer than 6 points share no row */
function stackRows(list){
  var sorted=list.slice().sort(function(a,b){ return a.v-b.v; }), placed=[], out=[];
  for(var i=0;i<sorted.length;i++){
    var r=0, clash=true;
    while(clash){ clash=false;
      for(var j=0;j<placed.length;j++) if(placed[j].row===r&&Math.abs(placed[j].v-sorted[i].v)<6){ clash=true; r++; break; } }
    var m={}, k; for(k in sorted[i]) m[k]=sorted[i][k]; m.row=r; placed.push(m); out.push(m);
  }
  return out;
}
function placeLine(scores,names){
  var r=ranked(scores,names), p=r.places[me()];
  if(!p) return '';
  return r.count[p]>1?('Tied for '+p+' of '+r.ids.length):('Place '+p+' of '+r.ids.length);
}

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){
    $('wmp-len').textContent=data.total?('This game: '+data.total+' questions. About '+data.lo+' to '+data.hi+' minutes.'):'';
    show('wmp-rules');
  }
  else if(name==='question'){
    if(data.num!==curR){ curR=data.num; val=50; saved=null; sending=false; $('wmp-gc').textContent=''; }
    $('wmp-n').textContent='ROUND '+data.num+' OF '+data.total;
    $('wmp-qt').textContent=data.q;
    if(!$('wmp-gc').textContent) $('wmp-gc').textContent='0 of '+(data.eligible||0)+' guesses saved';
    paint();
    show('wmp-q');
  }
  else if(name==='reveal'){
    curR=data.num;
    var names=data.names||{}, r=(data.results||{})[me()]||{got:'none',pts:0};
    $('wmp-vn').textContent='ROUND '+data.num+' OF '+data.total;
    $('wmp-rq').textContent=data.q||'';
    $('wmp-truth').textContent=(data.truth||(data.answer+'%'))+'.';
    /* the truth, then every saved guess on the line (this phone's own drawn larger). Guesses near each other stack
       in rows instead of hiding one another (seen 18 Oct: 52, 55 and 59 drew as one clump at 412). */
    var t=data.answer, marks=stackRows(data.marks||[]), rowsN=1, i;
    for(i=0;i<marks.length;i++) rowsN=Math.max(rowsN,marks[i].row+1);
    var step=Math.min(22,Math.max(10,Math.floor(96/rowsN))), lineH=Math.max(56,28+(rowsN-1)*step);
    var html='<span class="wmp-pin" style="left:'+t+'%"></span>';
    for(i=0;i<marks.length;i++)
      /* drawn inside the line: a guess of 99 used to be half cut off by the edge at 360 */
      html+='<span class="wmp-mk'+(marks[i].id===me()?' me':'')+'" style="left:'+Math.max(3,Math.min(97,marks[i].v))+'%;top:'+(lineH-14-marks[i].row*step)+'px;color:'+esc(marks[i].c)+';animation-delay:'+(0.4+i*0.08)+'s">'+esc(marks[i].s)+'</span>';
    $('wmp-vtrack').style.height=lineH+'px';
    $('wmp-vtrack').innerHTML=html;
    marks=data.marks||[];
    var el=$('wmp-rt2'), sub=$('wmp-rs');
    if(r.got==='bull'||r.got==='near'||r.got==='far'){
      el.textContent='You were '+r.diff+' percentage point'+(r.diff===1?'':'s')+' away. +'+r.base;
      el.className='wmp-result '+(r.got==='bull'?'bull':(r.got==='near'?'near':'far'));
      sub.textContent=r.closest?'Closest in the room. +50 bonus':('You said '+r.guess+'%.');
    } else if(r.got==='out'){ el.textContent='You were away for this round.'; el.className='wmp-result far'; sub.textContent=''; }
    else { el.textContent='No guess saved this round.'; el.className='wmp-result far'; sub.textContent=''; }
    /* every saved guess, by name and symbol, closest first, with its distance and points */
    var list=marks.slice().sort(function(a,b){ return a.diff-b.diff || String(a.n).localeCompare(String(b.n)); }), mk='';
    for(i=0;i<list.length;i++)
      mk+='<div class="wmp-row'+(list[i].id===me()?' me':'')+'">'+sym(list[i].c,list[i].s)+
        '<span class="nm">'+esc(list[i].n)+(list[i].id===me()?' (you)':'')+'</span>'+
        '<span class="ex">'+list[i].v+'%, '+list[i].diff+' away</span><b>+'+list[i].pts+'</b></div>';
    if(!list.length) mk='<div class="wmp-rsub">No guesses were saved this round.</div>';
    $('wmp-marks').innerHTML=mk;
    $('wmp-src').textContent=data.source?('Source: '+data.source):'';
    var tot=(data.scores||{})[me()];
    $('wmp-total').textContent=tot!==undefined?('Your total is '+tot+'.'):'';
    $('wmp-room').innerHTML=rows(data.scores,names,data.cols,data.syms,function(id){
      var x=(data.results||{})[id]; return x&&x.pts?('+'+x.pts):''; });
    paintToggle();
    show('wmp-r');
  }
  else if(name==='standings'){
    $('wmp-standh').textContent='Scores so far, after round '+(data.after||'')+' of '+(data.total||'');
    $('wmp-standplace').textContent=placeLine(data.scores,data.names);
    $('wmp-standrows').innerHTML=rows(data.scores,data.names,data.cols,data.syms);
    show('wmp-stand');
  }
  else if(name==='podium'||name==='over'){
    /* 'over' carries only places; the podium already shows everything, so it stays */
    if(name==='over'&&$('wmp-pod').classList.contains('on')) return;
    if(name==='over'&&!data.names) return;
    var f=(data.scores||{})[me()];
    $('wmp-podme').textContent=f!==undefined?('Your total is '+f+'.'):'';
    $('wmp-podplace').textContent=f!==undefined?placeLine(data.scores,data.names):'';
    $('wmp-podrows').innerHTML=rows(data.scores,data.names,data.cols,data.syms);
    $('wmp-podhint').textContent=SEATED?'Your controls are just below.':'Waiting for the host to choose what is next.';
    show('wmp-pod');
  }
});
paint();
show('wmp-wait');
})();
