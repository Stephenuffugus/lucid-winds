/* BEARING, phone. Renders from phase payloads only, so a rejoining phone lands on the right side of the Lantern /
   guesser difference.

   ⛔ NOTHING IS EVER TYPED HERE, and that is not an omission. The clue is SPOKEN out loud in the room. The house
   rule is that player text never reaches a screen, and speech never touches one, so this game gets the richest
   input a person has with no moderation surface at all. The Lantern's controls are "I have given my clue" and,
   once a round, "Need another pair".

   ⭐ 18 Oct 2026, Astra's review (BEARING-D01 to D04, the copy table B8.4, the no big screen version B8.5): this
   phone shows the whole room's view in BOTH modes, phase by phase. The rules with a worked example and the game's
   length; the Lantern sees the secret spot (told to this phone alone) and their two buttons; everybody else sees the
   two ends and who is choosing a clue; the guessers move a pointer and SAVE it (an unsaved pointer is not a guess;
   "Sending" until the host acknowledges, then the saved position); the Lantern waits with their spot and the count;
   the reveal shows the spot, the bands and every saved position by name and symbol, with a score panel; the podium.
   With no shared screen (PartyShell.noTv) this IS the room's screen, and the host plays from it too (its seat). */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="brp-wait"><div class="brp-wait" id="brp-wait-t">You are ready. The game will appear here.</div>'+
 '<div class="brp-sub" id="brp-wait-s"></div></div>'+

 '<div class="screen brp-scroll" id="brp-rules"><div class="brp-timer" id="brp-rt"></div>'+
 '<div class="brp-head">Bearing</div><div class="brp-lead">Here is how to play.</div>'+
 '<div class="brp-rules">'+
 '<p>One person sees a secret spot between two ideas.</p>'+
 '<p>They say one word to help everyone find that spot.</p>'+
 '<p>Everyone else saves a position on the line.</p>'+
 '<p>Closer guesses score more. The clue giver earns the average.</p>'+
 '<p class="brp-small">No numbers or words from the two ends. Save explanations for the reveal.</p>'+
 '</div>'+
 '<div class="brp-ex">'+
 '<div class="brp-ex-head">Example</div>'+
 '<div class="brp-ends"><span>Quiet</span><span>Noisy</span></div>'+
 '<div class="brp-line"><span class="brp-pin" style="left:14%"></span><span class="brp-exword" style="left:14%">Library</span></div>'+
 '<div class="brp-small">The secret spot is near Quiet, so the clue giver says: Library.</div></div>'+
 '<div class="brp-rules"><p class="brp-small">Play together in one room. The clue is spoken out loud. If someone cannot hear it, show the word the way your room agrees, on paper or by sign.</p>'+
 '<p class="brp-small" id="brp-len"></p></div></div>'+

 /* the Lantern, giving the clue */
 '<div class="screen brp-play" id="brp-lant">'+
 '<div class="brp-timer" id="brp-lt"></div><div class="brp-num" id="brp-ln"></div>'+
 '<div class="brp-role">You are the Lantern. Give the clue.</div>'+
 '<div class="brp-ends" id="brp-lends"></div>'+
 '<div class="brp-line brp-secret" id="brp-ltrack"></div>'+
 '<div class="brp-spot" id="brp-lspot"></div>'+
 '<div class="brp-say">Say one word. No numbers or words from the two ends.</div>'+
 '<button class="brp-go" id="brp-said">I have given my clue</button>'+
 '<button class="brp-ghost" id="brp-swap">Need another pair</button>'+
 '<div class="brp-note">Say your clue so everyone in the room can hear.</div></div>'+

 /* everybody else while the Lantern chooses a word */
 '<div class="screen brp-play" id="brp-watch">'+
 '<div class="brp-timer" id="brp-wt"></div><div class="brp-num" id="brp-wn"></div>'+
 '<div class="brp-ask" id="brp-wask"></div>'+
 '<div class="brp-ends" id="brp-wends"></div>'+
 '<div class="brp-line"></div>'+
 '<div class="brp-status" id="brp-ws">Listen for the clue.</div></div>'+

 /* the guessers */
 '<div class="screen brp-play" id="brp-guess">'+
 '<div class="brp-timer" id="brp-gt"></div><div class="brp-num" id="brp-gn"></div>'+
 '<div class="brp-ask">Where does that word belong?</div>'+
 '<div class="brp-ends" id="brp-gends"></div>'+
 '<div class="brp-value"><span id="brp-val">50</span></div>'+
 '<div class="brp-track" id="brp-track" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">'+
 '<div class="brp-fill" id="brp-fill"></div><div class="brp-saved" id="brp-savedmark" hidden></div><div class="brp-knob" id="brp-knob"></div></div>'+
 '<div class="brp-steps">'+
 '<button class="brp-step" id="brp-down" aria-label="Move left">&minus;</button>'+
 '<button class="brp-step wide" id="brp-lock">Save position</button>'+
 '<button class="brp-step" id="brp-up" aria-label="Move right">+</button></div>'+
 '<div class="brp-status" id="brp-gs" aria-live="polite">Move the pointer, then tap Save position.</div>'+
 '<div class="brp-count" id="brp-gc"></div></div>'+

 /* the Lantern while the room places */
 '<div class="screen brp-play" id="brp-lwait">'+
 '<div class="brp-timer" id="brp-mt"></div><div class="brp-num" id="brp-mn"></div>'+
 '<div class="brp-ask">Your clue is given. Everyone is choosing a position.</div>'+
 '<div class="brp-ends" id="brp-mends"></div>'+
 '<div class="brp-line brp-secret" id="brp-mtrack"></div>'+
 '<div class="brp-spot" id="brp-mspot"></div>'+
 '<div class="brp-status">You earn the average of everyone&rsquo;s guess scores.</div>'+
 '<div class="brp-count" id="brp-mc"></div></div>'+

 '<div class="screen brp-scroll" id="brp-r">'+
 '<div class="brp-timer" id="brp-vt"></div><div class="brp-num" id="brp-vn"></div>'+
 '<div class="brp-verdict" id="brp-verdict"></div>'+
 '<div class="brp-ends" id="brp-vends"></div>'+
 '<div class="brp-line brp-revline" id="brp-vtrack"></div>'+
 '<div class="brp-legend" id="brp-legend">Gold: within 5 scores 150. Then within 12 scores 100, within 20 scores 50, within 30 scores 20.</div>'+
 '<div class="brp-result" id="brp-rt2"></div>'+
 '<div class="brp-rsub" id="brp-rs"></div>'+
 '<div class="brp-rows brp-marks" id="brp-marks"></div>'+
 '<div class="brp-mine" id="brp-total"></div>'+
 '<button class="brp-toggle" id="brp-tog">Show scores</button>'+
 '<div class="brp-rows" id="brp-room" hidden></div></div>'+

 '<div class="screen brp-scroll" id="brp-pod"><div class="brp-head">Game complete</div>'+
 '<div class="brp-mine" id="brp-podme"></div><div class="brp-place" id="brp-podplace"></div><div class="brp-rows" id="brp-podrows"></div>'+
 '<div class="brp-hint" id="brp-podhint">Waiting for the host to choose what is next.</div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var SEATED=/[?&]seat=1(&|$)/.test(location.search);
var SAY=PartyShell.SAY||{sending:'Sending',allSet:'All set. Finishing soon.'};
var curR=0, curKey='', cur={}, val=50, saved=null, sending=false, dragging=false, spot=null, showScores=false;
function me(){ return PartyShell.playerId; }

/* ---- the guessers: a pointer that only counts once SAVED (D03) ---- */
function paint(){
  $('brp-val').textContent=val;
  $('brp-fill').style.width=val+'%';
  $('brp-knob').style.left=val+'%';
  var tr=$('brp-track'); tr.setAttribute('aria-valuenow',val);
  tr.setAttribute('aria-label','Position between '+(cur.a||'one end')+' and '+(cur.b||'the other end'));
  var sm=$('brp-savedmark');
  if(saved!==null){ sm.hidden=false; sm.style.left=saved+'%'; } else sm.hidden=true;
  var lock=$('brp-lock');
  if(saved!==null&&val===saved&&!sending){ lock.textContent='Saved at '+saved; lock.disabled=true; }
  else { lock.textContent='Save position'; lock.disabled=false; }
  var st=$('brp-gs');
  if(sending){ st.textContent=SAY.sending; st.className='brp-status sending'; }
  else if(saved===null){ st.textContent='Move the pointer, then tap Save position.'; st.className='brp-status'; }
  else if(val===saved){ st.textContent='Saved position: '+saved+'. Move your pointer and save again to change it.'; st.className='brp-status saved'; }
  else { st.textContent='Not saved yet. Your saved position is '+saved+'.'; st.className='brp-status warn'; }
}
function setVal(v){ val=Math.max(0,Math.min(100,Math.round(v))); paint(); }
function save(){
  if(saved!==null&&val===saved) return;
  sending=true; paint();
  PartyShell.sendToHost({t:'point',r:curR,v:val});
}
function fromEvent(ev){
  var tr=$('brp-track').getBoundingClientRect();
  var t=(ev.touches&&ev.touches[0])||ev;
  return ((t.clientX-tr.left)/tr.width)*100;
}
function down(ev){ dragging=true; ev.preventDefault(); setVal(fromEvent(ev)); }
function move(ev){ if(!dragging) return; ev.preventDefault(); setVal(fromEvent(ev)); }
function up(){ dragging=false; }
var track=$('brp-track');
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
$('brp-down').addEventListener('click',function(){ setVal(val-1); });
$('brp-up').addEventListener('click',function(){ setVal(val+1); });
$('brp-lock').addEventListener('click',save);

/* ---- the Lantern ---- */
$('brp-said').addEventListener('click',function(){
  this.disabled=true; this.textContent='Clue given';
  $('brp-swap').disabled=true;
  PartyShell.sendToHost({t:'spoken',r:curR,att:cur.att});
});
$('brp-swap').addEventListener('click',function(){
  this.disabled=true; this.textContent='Finding another pair';
  PartyShell.sendToHost({t:'newpair',r:curR});
});
/* the spot, drawn only on this phone (it arrives on its own private message) */
function drawSpot(id,spotId){
  if(spot===null){ $(id).innerHTML=''; $(spotId).textContent='Finding your secret spot...'; return; }
  $(id).innerHTML='<span class="brp-pin" style="left:'+spot+'%"></span>';
  $(spotId).textContent='Your secret spot: '+spot+' of 100.';
}

$('brp-tog').addEventListener('click',function(){ showScores=!showScores; paintToggle(); });
function paintToggle(){ $('brp-room').hidden=!showScores; $('brp-tog').textContent=showScores?'Hide scores':'Show scores'; }

PartyShell.onTimer(function(s){
  var ts=root.querySelectorAll('.brp-timer');
  for(var i=0;i<ts.length;i++){
    if(s===null||s===undefined){ ts[i].textContent=''; continue; }
    ts[i].textContent=s; ts[i].classList.toggle('low',s<=5);
  }
});

PartyShell.onMessage(function(msg){
  if(!msg||msg.r!==curR) return;
  if(msg.t==='target'){
    if(msg.att!==undefined&&cur.att!==undefined&&msg.att!==cur.att) return;
    spot=msg.v; drawSpot('brp-ltrack','brp-lspot'); drawSpot('brp-mtrack','brp-mspot');
  }
  else if(msg.t==='pack'){ sending=false; saved=msg.v; paint(); }
  else if(msg.t==='gcount'){
    var line=msg.n+' of '+msg.of+' positions saved';
    $('brp-gc').textContent=line; $('brp-mc').textContent=line;
  }
  else if(msg.t==='allset'){ $('brp-gc').textContent=SAY.allSet; $('brp-mc').textContent=SAY.allSet; }
});

/* one order and one place rule, the same as the host's: equal scores share a place */
function ranked(scores,names){
  var ids=Object.keys(names||{}); scores=scores||{};
  ids.sort(function(a,b){ return (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0, count={};
  for(var i=0;i<ids.length;i++){ var s=scores[ids[i]]||0; if(s!==last){ place=i+1; last=s; } places[ids[i]]=place; count[place]=(count[place]||0)+1; }
  return {ids:ids,places:places,count:count};
}
function sym(c,s){ return '<i class="brp-sym" style="color:'+esc(c||'#e8dcc8')+'">'+esc(s||'●')+'</i>'; }
function rows(scores,names,cols,symz,extra){
  var r=ranked(scores,names), out='';
  for(var i=0;i<r.ids.length;i++){
    var id=r.ids[i], mine=id===me();
    out+='<div class="brp-row'+(mine?' me':'')+'"><span class="pl">'+r.places[id]+'</span>'+
      sym((cols||{})[id],(symz||{})[id])+
      '<span class="nm">'+esc(names[id])+(mine?' (you)':'')+'</span>'+
      (extra?'<span class="ex">'+extra(id)+'</span>':'')+
      '<b>'+((scores||{})[id]||0)+'</b></div>';
  }
  return out;
}
function placeLine(scores,names){
  var r=ranked(scores,names), p=r.places[me()];
  if(!p) return '';
  return r.count[p]>1?('Tied for '+p+' of '+r.ids.length):('Place '+p+' of '+r.ids.length);
}
function ends(id){ $(id).innerHTML='<span>'+esc(cur.a)+'</span><span>'+esc(cur.b)+'</span>'; }
function numLine(id){ $(id).textContent='ROUND '+cur.num+' OF '+cur.total; }
function band(diff){ return diff<=5?5:diff<=12?12:diff<=20?20:30; }
function bandSpan(cls,t,w){ var l=Math.max(0,t-w), r=Math.min(100,t+w);
  return '<span class="brp-band '+cls+'" style="left:'+l+'%;width:'+(r-l)+'%"></span>'; }

/* a new round, a new pair ("Need another pair") or a void retry clears this phone */
function enterRound(data){
  var key=data.num+'.'+(data.att||0);
  if(key!==curKey){ curKey=key; val=50; saved=null; sending=false; spot=null;
    $('brp-said').disabled=false; $('brp-said').textContent='I have given my clue';
    $('brp-gc').textContent=''; $('brp-mc').textContent='';
  }
  curR=data.num; cur=data;
}

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){
    $('brp-len').textContent=data.total?('This game: '+data.total+' rounds. Each of you gives the clue '+
      (data.turns===1?'once':(data.turns+' times'))+'. About '+data.lo+' to '+data.hi+' minutes.'):'';
    show('brp-rules');
  }
  else if(name==='clue'){
    enterRound(data);
    if(data.lantern===me()){
      numLine('brp-ln'); ends('brp-lends');
      var sw=$('brp-swap');
      sw.hidden=!data.canSwap; if(data.canSwap){ sw.disabled=false; sw.textContent='Need another pair'; }
      drawSpot('brp-ltrack','brp-lspot');
      /* the spot arrives on its own private message, not in this payload; a reloaded phone asks again */
      if(spot===null) PartyShell.sendToHost({t:'needtarget'});
      show('brp-lant');
    } else {
      numLine('brp-wn'); ends('brp-wends');
      $('brp-wask').textContent=data.lanternName+' is choosing a clue.';
      $('brp-ws').textContent=data.att>1?'A new pair. Listen for the clue.':'Listen for the clue.';
      show('brp-watch');
    }
  }
  else if(name==='guess'){
    enterRound(data);
    var line='0 of '+(data.eligible||0)+' positions saved';
    if(data.lantern===me()){
      numLine('brp-mn'); ends('brp-mends'); drawSpot('brp-mtrack','brp-mspot');
      if(!$('brp-mc').textContent) $('brp-mc').textContent=line;
      if(spot===null) PartyShell.sendToHost({t:'needtarget'});
      show('brp-lwait');
    } else {
      numLine('brp-gn'); ends('brp-gends');
      if(!$('brp-gc').textContent) $('brp-gc').textContent=line;
      paint();
      show('brp-guess');
    }
  }
  else if(name==='reveal'){
    enterRound(data);
    var r=(data.results||{})[me()]||{got:'none',pts:0};
    var el=$('brp-rt2'), sub=$('brp-rs');
    numLine('brp-vn'); ends('brp-vends');
    var names=data.names||{}, mine=data.lantern===me();
    if(data.skipped){
      $('brp-verdict').textContent=(mine?'You':data.lanternName)+' did not give a clue.';
      $('brp-vtrack').innerHTML=''; $('brp-legend').hidden=true;
      el.textContent='This round does not count.'; el.className='brp-result far';
      sub.textContent=data.retry?(mine?'You get another pair next.':data.lanternName+' gets another pair next.'):'No points this round.';
      $('brp-marks').innerHTML='';
    } else {
      /* the verdict, worked out here from the results (never "lost them") */
      var bulls=[], k;
      for(k in data.results) if(data.results[k].got==='bull') bulls.push(k===me()?'You':names[k]);
      $('brp-verdict').textContent=bulls.length===1?(bulls[0]+' found the spot.'):
        bulls.length===2?(bulls[0]+' and '+bulls[1]+' found the spot.'):
        bulls.length>2?(bulls.length+' people found the spot.'):
        !data.valid?'Nobody saved a position this round.':
        (data.avg>=50?'The guesses landed close together.':'The guesses spread out this time.');
      var t=data.target, marks=data.marks||[], html=
        bandSpan('wide',t,30)+bandSpan('mid',t,20)+bandSpan('near',t,12)+bandSpan('core',t,5)+
        '<span class="brp-pin" style="left:'+t+'%"></span>';
      for(var i=0;i<marks.length;i++)
        html+='<span class="brp-mk'+(marks[i].id===me()?' me':'')+'" style="left:'+marks[i].v+'%;color:'+esc(marks[i].c)+'">'+esc(marks[i].s)+'</span>';
      $('brp-vtrack').innerHTML=html; $('brp-legend').hidden=false;
      if(mine){
        el.textContent=data.valid?('You earn '+data.avg+' for your clue.'):'No positions were saved, so nobody scores.';
        el.className='brp-result lant';
        sub.textContent=data.valid?('The average guess score was '+data.avg+'. The secret spot was '+t+'.'):('The secret spot was '+t+'.');
      } else {
        if(r.got==='bull'||r.got==='near'){ el.textContent='Within '+band(r.diff)+' of the spot. +'+r.pts; el.className='brp-result '+(r.got==='bull'?'bull':'near'); }
        else if(r.got==='far'){ el.textContent='Your position was '+r.diff+' away.'; el.className='brp-result far'; }
        else if(r.got==='out'){ el.textContent='You were away for this round.'; el.className='brp-result far'; }
        else { el.textContent='No position saved this round.'; el.className='brp-result far'; }
        sub.textContent='The secret spot was '+t+'. '+(data.valid?(data.lanternName+' earns the room average: '+data.avg+'.'):'');
      }
      /* every saved position, by name and symbol, closest first */
      var list=marks.slice().sort(function(a,b){ return Math.abs(a.v-t)-Math.abs(b.v-t); }), mk='';
      for(i=0;i<list.length;i++)
        mk+='<div class="brp-row'+(list[i].id===me()?' me':'')+'">'+sym(list[i].c,list[i].s)+
          '<span class="nm">'+esc(list[i].n)+(list[i].id===me()?' (you)':'')+'</span>'+
          '<span class="ex">at '+list[i].v+'</span><b>'+(list[i].pts?('+'+list[i].pts):'0')+'</b></div>';
      $('brp-marks').innerHTML=mk;
    }
    var tot=(data.scores||{})[me()];
    $('brp-total').textContent=tot!==undefined?('Your total is '+tot+'.'):'';
    $('brp-room').innerHTML=rows(data.scores,names,data.cols,data.syms,function(id){
      var x=(data.results||{})[id]; return x&&x.pts?('+'+x.pts):''; });
    paintToggle();
    show('brp-r');
  }
  else if(name==='podium'||name==='over'){
    /* 'over' carries only places; the podium already shows everything, so it stays */
    if(name==='over'&&$('brp-pod').classList.contains('on')) return;
    if(name==='over'&&!data.names) return;
    var f=(data.scores||{})[me()];
    $('brp-podme').textContent=f!==undefined?('Your total is '+f+'.'):'';
    $('brp-podplace').textContent=f!==undefined?placeLine(data.scores,data.names):'';
    $('brp-podrows').innerHTML=rows(data.scores,data.names,data.cols,data.syms);
    $('brp-podhint').textContent=SEATED?'Your controls are just below.':'Waiting for the host to choose what is next.';
    show('brp-pod');
  }
});
paint();
show('brp-wait');
})();
