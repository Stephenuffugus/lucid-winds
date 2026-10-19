/* LIFTING FOG, phone. Renders from phase payloads only, so a phone that locked and rejoined lands in the live clue
   with every clue so far, the current worth and (asked for privately) its own saved answer.

   ⭐ 18 Oct 2026, Astra's review (LIFTINGFOG-D01 to D04, the copy table B3.4, the no big screen version B3.5): this
   phone shows the whole room's view in BOTH modes, phase by phase. The rules with an example and the reading pace;
   the question with every clue so far stacked in order (a new clue never replaces an old one), the points it is worth
   now and "Next clue in N"; four options that only SELECT, and one fixed "Answer now for {points}" button that commits
   once ("Sending", then "Final answer saved at clue N." with the tier THE HOST accepted); who has saved a final answer,
   by name and symbol, never what; the reveal with this phone's own outcome first, the answer, the four clues with what
   each was worth, and everyone's clue and points; the scores; the podium. With no shared screen (PartyShell.noTv) this
   IS the room's screen, and the host plays from it too (its seat).

   ⛔ NOTHING MOVES UNDER A THUMB. The options and the Answer now button sit in a fixed block at the foot of the
   screen; the clue stack above them grows inside its own scrolling panel, so a new clue can never push an option
   down, and a tier change never redraws the options (same list, same buttons, same selection). Everything that
   changes size during a question (who has saved, above the clues) lives ABOVE that panel, which absorbs it; the one
   line under the button has a fixed height. (First build: the saved names sat in the foot, grew when Ada answered
   and lifted every option under the other thumbs; party/test/liftingfog_rules.js caught it.) */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="lfp-wait"><div class="lfp-wait" id="lfp-wait-t">You are ready. The game will appear here.</div></div>'+

 '<div class="screen lfp-scroll" id="lfp-rules"><div class="lfp-timer" id="lfp-t0"></div>'+
 '<div class="lfp-head">Lifting Fog</div><div class="lfp-lead">Here is how to play.</div>'+
 '<div class="lfp-rules">'+
 '<p>Four clues describe one thing.</p>'+
 '<p>Earlier answers earn more points.</p>'+
 '<p>Each new clue lowers the points: 100, 75, 50, then 25.</p>'+
 '<p>Choose an option, then tap Answer now. You get one answer.</p>'+
 '<p class="lfp-small">Example: "I live in the sea" could be Octopus or Lobster, so you might wait. "I have eight arms" leaves only Octopus.</p>'+
 '<p class="lfp-small quiet" id="lfp-pace"></p>'+
 '</div></div>'+

 '<div class="screen lfp-play" id="lfp-q">'+
 '<div class="lfp-top"><span class="lfp-num" id="lfp-n"></span><span class="lfp-timer" id="lfp-t1"></span></div>'+
 '<div class="lfp-worthline"><span class="lfp-worth" id="lfp-w"></span><span class="lfp-next" id="lfp-next"></span></div>'+
 '<div class="lfp-saved"><span class="lfp-count" id="lfp-count"></span><span class="lfp-who" id="lfp-who"></span></div>'+
 '<div class="lfp-clues" id="lfp-clues" aria-live="polite"></div>'+
 '<div class="lfp-foot">'+
 '<div class="lfp-opts" id="lfp-opts"></div>'+
 '<button class="lfp-go" id="lfp-go" disabled>Answer now</button>'+
 '<div class="lfp-status" id="lfp-note" aria-live="polite">Wait for a clue, or answer now.</div>'+
 '</div></div>'+

 '<div class="screen lfp-scroll" id="lfp-r">'+
 '<div class="lfp-timer" id="lfp-t2"></div><div class="lfp-num" id="lfp-rn"></div>'+
 '<div class="lfp-result" id="lfp-rt"></div>'+
 '<div class="lfp-answer" id="lfp-ra"></div>'+
 '<div class="lfp-ladder" id="lfp-rlad"></div>'+
 '<div class="lfp-sublabel">Everyone this round</div>'+
 '<div class="lfp-rows" id="lfp-rroom"></div>'+
 '<div class="lfp-mine" id="lfp-rtot"></div></div>'+

 '<div class="screen lfp-scroll" id="lfp-stand"><div class="lfp-head">Scores so far</div><div class="lfp-lead" id="lfp-standafter"></div>'+
 '<div class="lfp-mine" id="lfp-standme"></div><div class="lfp-place" id="lfp-standplace"></div>'+
 '<div class="lfp-rows" id="lfp-standrows"></div></div>'+

 '<div class="screen lfp-scroll" id="lfp-pod"><div class="lfp-head">Game complete</div>'+
 '<div class="lfp-mine" id="lfp-podme"></div><div class="lfp-place" id="lfp-podplace"></div>'+
 '<div class="lfp-rows" id="lfp-podrows"></div>'+
 '<div class="lfp-hint" id="lfp-podhint">Waiting for the host to choose what is next.</div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var SEATED=/[?&]seat=1(&|$)/.test(location.search);
var SAY=PartyShell.SAY||{sending:'Sending'};
var curQ=0, curOpts=[], sel=-1, committed=false, finalTier=null, worth=100, tier=0, step=8, qlen=32;
var shownClues=0, last={}, pending=null, tries=0;
/* true until this page has handled its first phase: a phone that (re)loaded mid question asks the host for its own
   saved answer, once, privately */
var fresh=true;
function me(){ return PartyShell.playerId; }

function setNote(text,cls){ var n=$('lfp-note'); n.textContent=text; n.className='lfp-status'+(cls?' '+cls:''); }
function paintGo(){
  var go=$('lfp-go');
  if(committed){ go.disabled=true; go.textContent=finalTier?('Saved at clue '+finalTier):SAY.sending; go.classList.add('done'); return; }
  go.classList.remove('done');
  go.disabled=sel<0;
  go.textContent='Answer now for '+worth;
}
function paintOpts(){
  var b=$('lfp-opts').querySelectorAll('.lfp-opt');
  for(var i=0;i<b.length;i++){
    b[i].classList.toggle('sel',i===sel);
    b[i].disabled=committed;
    b[i].setAttribute('aria-pressed',i===sel?'true':'false');
  }
}

function renderOpts(opts){
  var same=curOpts.length===opts.length;
  if(same) for(var i=0;i<opts.length;i++) if(curOpts[i]!==opts[i]) same=false;
  if(same) return;            /* a tier change must never redraw under a thumb */
  curOpts=opts.slice();
  var html='';
  for(var j=0;j<opts.length;j++) html+='<button class="lfp-opt" data-i="'+j+'" aria-pressed="false">'+esc(opts[j])+'</button>';
  var box=$('lfp-opts'); box.innerHTML=html;
  var b=box.querySelectorAll('.lfp-opt');
  for(var k=0;k<b.length;k++) b[k].addEventListener('click',function(){
    if(committed) return;
    sel=parseInt(this.getAttribute('data-i'),10);
    paintOpts(); paintGo();
    setNote('Tap Answer now to save it. You get one answer.');
  });
}

/* the clue stack: only clues this phone has not drawn yet are added, so scroll and reading place survive a tier */
var PTS=[100,75,50,25];
function renderClues(list){
  var box=$('lfp-clues');
  if(list.length<shownClues){ box.innerHTML=''; shownClues=0; }
  /* the clues still in the fog show as quiet rows with what waiting for them costs */
  var g=box.querySelectorAll('.lfp-clue.ghost'); for(var x=0;x<g.length;x++) g[x].parentNode.removeChild(g[x]);
  for(var i=shownClues;i<list.length;i++){
    var d=document.createElement('div'); d.className='lfp-clue';
    d.innerHTML='<span class="lfp-cn">'+(i+1)+'</span><span>'+esc(list[i])+'</span>';
    box.appendChild(d);
  }
  var all=box.querySelectorAll('.lfp-clue');
  for(var k=0;k<all.length;k++) all[k].classList.toggle('fresh',k===all.length-1);
  for(var j=list.length;j<4;j++){
    var gh=document.createElement('div'); gh.className='lfp-clue ghost';
    gh.innerHTML='<span class="lfp-cn">'+(j+1)+'</span><span>Worth '+PTS[j]+' if you wait for it</span>';
    box.appendChild(gh);
  }
  if(list.length>shownClues&&all.length){ try{ all[all.length-1].scrollIntoView({block:'nearest'}); }catch(e){} }
  shownClues=list.length;
}

function commit(){
  if(committed||sel<0) return;
  committed=true; finalTier=null; paintOpts(); paintGo();
  setNote(SAY.sending,'sending');
  pending={t:'final',q:curQ,v:sel,o:curOpts[sel]}; tries=0;
  PartyShell.sendToHost(pending);
  retry();
}
/* an answer that was never acknowledged is sent again: the host keeps the first one it accepted, so this can never
   replace an answer, only make sure it arrived */
function retry(){
  setTimeout(function(){
    if(!pending||finalTier||pending.q!==curQ||tries>=3) return;
    tries++; PartyShell.sendToHost(pending); retry();
  },2500);
}
$('lfp-go').addEventListener('click',commit);

function chipFor(id){
  return '<span class="lfp-whochip"><i class="lfp-sym" style="color:'+esc((last.cols||{})[id]||'#e8dcc8')+'">'+
    esc((last.syms||{})[id]||'●')+'</i>'+esc((last.names||{})[id]||'')+(id===me()?' (you)':'')+'</span>';
}
function paintSaved(ids,of){
  ids=ids||[];
  $('lfp-count').textContent=ids.length+' of '+of+' final answers saved';
  var html=''; for(var i=0;i<ids.length;i++) html+=chipFor(ids[i]);
  $('lfp-who').innerHTML=html;
}

/* "Next clue in N". The timer tick that crosses a tier arrives just BEFORE the payload with the new clue, so this is
   painted again when that payload lands (otherwise "Next clue in 0" stood under the new clue for a whole second). */
var lastS=null;
function paintNext(){
  if(lastS===null||lastS===undefined) { $('lfp-next').textContent=''; return; }
  var n=lastS-(qlen-(tier+1)*step);
  $('lfp-next').textContent=tier>=3?'Last clue':n>0?('Next clue in '+n):'Next clue now';
}
PartyShell.onTimer(function(s){
  lastS=s;
  var ts=root.querySelectorAll('.lfp-timer');
  for(var i=0;i<ts.length;i++){
    if(s===null||s===undefined){ ts[i].textContent=''; continue; }
    ts[i].textContent=s; ts[i].classList.toggle('low',s<=5);
  }
  if($('lfp-q').classList.contains('on')) paintNext();
});

PartyShell.onMessage(function(msg){
  if(!msg||msg.q!==curQ) return;
  if(msg.t==='fin'){
    /* this phone's own final answer, told to it alone, at the tier the host accepted */
    committed=true; finalTier=msg.tier; pending=null;
    var i=curOpts.indexOf(msg.o); if(i>=0) sel=i;
    paintOpts(); paintGo();
    setNote('Final answer saved at clue '+msg.tier+'.','saved');
  }
  else if(msg.t==='saved'){ paintSaved(msg.ids,msg.of); }
});

/* one order and one place rule, the same as the host's: equal scores share a place */
function ranked(scores,names){
  var ids=Object.keys(names||{}); scores=scores||{};
  ids.sort(function(a,b){ return (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, lastS=null, place=0, count={};
  for(var i=0;i<ids.length;i++){ var s=scores[ids[i]]||0; if(s!==lastS){ place=i+1; lastS=s; } places[ids[i]]=place; count[place]=(count[place]||0)+1; }
  return {ids:ids,places:places,count:count};
}
function rows(scores,names,cols,symz){
  var r=ranked(scores,names), out='';
  for(var i=0;i<r.ids.length;i++){
    var id=r.ids[i], mine=id===me();
    out+='<div class="lfp-row'+(mine?' me':'')+'"><span class="pl">'+r.places[id]+'</span>'+
      '<i class="lfp-sym" style="color:'+esc((cols||{})[id]||'#e8dcc8')+'">'+esc((symz||{})[id]||'●')+'</i>'+
      '<span class="nm">'+esc(names[id])+(mine?' (you)':'')+'</span>'+
      '<b>'+((scores||{})[id]||0)+'</b></div>';
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
  handle(name,data);
  fresh=false;
});
function handle(name,data){
  if(name==='rules'){
    $('lfp-pace').textContent=data.slow?('More reading time is on: each clue stays for '+data.step+' seconds.'):
      ('Each clue stays for '+(data.step||8)+' seconds.');
    show('lfp-rules');
  }
  else if(name==='question'){
    last=data;
    if(data.num!==curQ){
      curQ=data.num; sel=-1; committed=false; finalTier=null; pending=null; curOpts=[]; shownClues=0;
      $('lfp-clues').innerHTML='';
      setNote('Wait for a clue, or answer now.');
    }
    tier=data.tier|0; worth=data.worth; step=data.step||8; qlen=data.len||32;
    $('lfp-n').textContent='QUESTION '+data.num+' OF '+data.total;
    $('lfp-w').textContent=worth+' points';
    renderClues(data.clues||[]);
    paintNext();
    renderOpts(data.options||[]);
    paintOpts(); paintGo();
    paintSaved(data.saved,data.eligible||0);
    if(fresh&&!committed) PartyShell.sendToHost({t:'mine?',q:curQ});
    show('lfp-q');
  }
  else if(name==='reveal'){
    var r=(data.results||{})[me()]||{got:'none',pts:0}, el=$('lfp-rt');
    $('lfp-rn').textContent='QUESTION '+data.num+' OF '+data.total;
    if(r.got==='right'){ el.textContent='Found it at clue '+r.tier+'. +'+r.pts; el.className='lfp-result right'; }
    else if(r.got==='wrong'){ el.textContent='You chose '+r.pick+'. It was '+data.answer+'.'; el.className='lfp-result miss'; }
    else { el.textContent='No answer saved this round.'; el.className='lfp-result miss'; }
    $('lfp-ra').textContent=data.found?('It was '+data.answer+'.'):('This one stayed hidden. It was '+data.answer+'.');
    var lad='', pts=data.points||[100,75,50,25];
    for(var c=0;c<(data.clues||[]).length;c++)
      lad+='<div class="lfp-lrow'+(r.tier===c+1?' mine':'')+'"><span class="lfp-lpts">'+pts[c]+'</span><span>'+esc(data.clues[c])+'</span></div>';
    $('lfp-rlad').innerHTML=lad;
    var ids=Object.keys(data.names||{}), out='';
    ids.sort(function(x,y){ var rx=data.results[x]||{pts:0}, ry=data.results[y]||{pts:0};
      return (ry.pts-rx.pts) || String(data.names[x]).localeCompare(String(data.names[y])); });
    for(var i=0;i<ids.length;i++){
      var id=ids[i], x=(data.results||{})[id]||{got:'none'}, mine=id===me(), what;
      if(x.got==='right') what='clue '+x.tier+' <b>+'+x.pts+'</b>';
      else if(x.got==='wrong') what='chose '+esc(x.pick);
      else what='no answer';
      out+='<div class="lfp-row'+(mine?' me':'')+'"><i class="lfp-sym" style="color:'+esc((data.cols||{})[id]||'#e8dcc8')+'">'+
        esc((data.syms||{})[id]||'●')+'</i><span class="nm">'+esc(data.names[id])+(mine?' (you)':'')+'</span>'+
        '<span class="ex">'+what+'</span></div>';
    }
    $('lfp-rroom').innerHTML=out;
    var tot=(data.scores||{})[me()];
    $('lfp-rtot').textContent=tot!==undefined?('Your total is '+tot+'.'):'';
    show('lfp-r');
  }
  else if(name==='standings'){
    var sc=(data.scores||{})[me()];
    $('lfp-standafter').textContent=data.num?('After question '+data.num+' of '+data.total+'.'):'';
    $('lfp-standme').textContent=sc!==undefined?('Your total is '+sc+'.'):'';
    $('lfp-standplace').textContent=sc!==undefined?placeLine(data.scores,data.names):'';
    $('lfp-standrows').innerHTML=rows(data.scores,data.names,data.cols,data.syms);
    show('lfp-stand');
  }
  else if(name==='podium'||name==='over'){
    /* 'over' carries only places; the podium already shows everything, so it stays */
    if(name==='over'&&$('lfp-pod').classList.contains('on')) return;
    if(name==='over'&&!data.names) return;
    var f=(data.scores||{})[me()];
    $('lfp-podme').textContent=f!==undefined?('Game complete. Your total is '+f+'.'):'Game complete.';
    $('lfp-podplace').textContent=f!==undefined?placeLine(data.scores,data.names):'';
    $('lfp-podrows').innerHTML=rows(data.scores,data.names,data.cols,data.syms);
    $('lfp-podhint').textContent=SEATED?'Your controls are just below.':'Waiting for the host to choose what is next.';
    show('lfp-pod');
  }
}
show('lfp-wait');
})();
