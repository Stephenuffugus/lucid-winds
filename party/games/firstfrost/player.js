/* FIRST FROST, phone. Two jobs in one module: whoever is still standing answers; the Frost choose the weather and
   keep watching the room they are changing. Which job a phone shows comes from the frozen map in every phase payload,
   never from local state, so a phone that locks and rejoins always wakes up on the right one.

   ⭐ 19 Oct 2026, Astra's review (FIRSTFROST-D01 to D04, the copy table B4.4, the no big screen version B4.5): this
   phone shows the whole room's view in BOTH modes, phase by phase. The rules with both jobs and an example; the
   weather vote (the Frost: three private, editable choices, "Weather saved. You can change it until time runs
   out."; everybody else: the three effects and how many choices are in); the weather announcement before any clock
   runs; the question (standing: four options that only SELECT, one fixed "Final answer" button that commits once,
   "Sending", then "Final answer saved."; under Fog "Choices appear in N. Read the question first." and no choices at
   all until they come; the Frost: the weather, the question, the choices when they appear, the ledger of everybody
   still standing, how many final answers are in and their own weather points); the reveal (this phone's own outcome
   first, the answer, what happened to everybody); the podium with its two panels. With no shared screen
   (PartyShell.noTv) this IS the room's screen, and the host plays from it too (its seat).

   ⛔ NOTHING MOVES UNDER A THUMB: the options and Final answer sit in a fixed foot; everything that changes during a
   question (the count, the fog line) lives above it in fixed height rows. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="frp-wait"><div class="frp-wait" id="frp-wait-t">You are ready. The game will appear here.</div></div>'+

 '<div class="screen frp-scroll" id="frp-rules"><div class="frp-timer" id="frp-t0"></div>'+
 '<div class="frp-head">First Frost</div><div class="frp-lead">Here is how to play.</div>'+
 '<div class="frp-rules">'+
 '<p>Choose your answer before time runs out.</p>'+
 '<p>Three frost marks turn you into the Frost.</p>'+
 '<p>The Frost keep playing and choose the next weather.</p>'+
 '<p>Weather changes the time, the choices, or the marks.</p>'+
 '<p class="frp-small">A wrong answer or no answer adds one mark. Deep Freeze adds two.</p>'+
 '</div>'+
 '<div class="frp-jobs"><div class="frp-job"><b>Still standing</b>Choose an option, then tap Final answer. A right answer earns 100.</div>'+
 '<div class="frp-job frost"><b>The Frost</b>Choose the weather for the next question. Every new frost mark that round earns each of the Frost 40 weather points.</div></div>'+
 '<div class="frp-rules"><p class="frp-small">Example: Bo has two frost marks. The Frost choose Deep Freeze and Bo misses, so Bo joins the Frost and chooses the weather from the next round.</p>'+
 '<p class="frp-small quiet" id="frp-pace"></p></div></div>'+

 '<div class="screen frp-play" id="frp-vote">'+
 '<div class="frp-top"><span class="frp-num" id="frp-vn"></span><span class="frp-timer" id="frp-t1"></span></div>'+
 '<div class="frp-ghosthead">You are the Frost</div>'+
 '<div class="frp-ghostsub">Choose the weather for the next question.</div>'+
 '<div class="frp-pwopts" id="frp-pwopts"></div>'+
 '<div class="frp-status" id="frp-vnote">The most chosen weather wins. Ties rotate.</div>'+
 '<div class="frp-count" id="frp-vcount"></div></div>'+

 '<div class="screen frp-play" id="frp-vwait">'+
 '<div class="frp-top"><span class="frp-num" id="frp-wn"></span><span class="frp-timer" id="frp-t2"></span></div>'+
 '<div class="frp-ghosthead">The Frost are choosing</div>'+
 '<div class="frp-ghostsub" id="frp-wsub">Their weather changes the next question.</div>'+
 '<div class="frp-effects" id="frp-effects"></div>'+
 '<div class="frp-count" id="frp-wcount"></div>'+
 '<div class="frp-mine" id="frp-wmine"></div></div>'+

 '<div class="screen" id="frp-wx"><div class="frp-num" id="frp-xn"></div>'+
 '<div class="frp-wxlabel">Weather this round</div>'+
 '<div class="frp-wxname" id="frp-xname"></div><div class="frp-wxdesc" id="frp-xdesc"></div></div>'+

 '<div class="screen frp-play" id="frp-q">'+
 '<div class="frp-top"><span class="frp-num" id="frp-n"></span><span class="frp-timer" id="frp-t3"></span></div>'+
 '<div class="frp-line"><span class="frp-pw" id="frp-pw"></span><span class="frp-me" id="frp-me"></span></div>'+
 '<div class="frp-ledger" id="frp-ledger1"></div>'+
 '<div class="frp-qbox"><div class="frp-q" id="frp-qt"></div></div>'+
 '<div class="frp-fog" id="frp-fog"></div>'+
 '<div class="frp-foot">'+
 '<div class="frp-opts" id="frp-opts"></div>'+
 '<button class="frp-go" id="frp-go" disabled>Final answer</button>'+
 '<div class="frp-status" id="frp-note" aria-live="polite">Choose an option, then tap Final answer.</div>'+
 '<div class="frp-count" id="frp-qcount"></div>'+
 '</div></div>'+

 '<div class="screen frp-play frp-frostq" id="frp-fq">'+
 '<div class="frp-top"><span class="frp-num" id="frp-fn"></span><span class="frp-timer" id="frp-t4"></span></div>'+
 '<div class="frp-ghosthead small">You are the Frost</div>'+
 '<div class="frp-roomchose" id="frp-fpw"></div>'+
 '<div class="frp-q" id="frp-fqt"></div>'+
 '<div class="frp-fog" id="frp-ffog"></div>'+
 '<div class="frp-choices" id="frp-fopts"></div>'+
 '<div class="frp-count" id="frp-fcount"></div>'+
 '<div class="frp-sublabel">Still standing</div>'+
 '<div class="frp-rows" id="frp-fledger"></div>'+
 '<div class="frp-mine" id="frp-fmine"></div></div>'+

 '<div class="screen frp-scroll" id="frp-r">'+
 '<div class="frp-timer" id="frp-t5"></div><div class="frp-num" id="frp-rn"></div>'+
 '<div class="frp-result" id="frp-rt"></div>'+
 '<div class="frp-answer" id="frp-ra"></div>'+
 '<div class="frp-sublabel">Everyone this round</div>'+
 '<div class="frp-rows" id="frp-rroom"></div>'+
 '<div class="frp-mine" id="frp-rtot"></div></div>'+

 '<div class="screen frp-scroll" id="frp-pod"><div class="frp-head">Game complete</div>'+
 '<div class="frp-end" id="frp-end1"></div><div class="frp-end small" id="frp-end2"></div>'+
 '<div class="frp-mine" id="frp-podme"></div>'+
 '<div class="frp-sublabel">Survival</div><div class="frp-rows" id="frp-podrows"></div>'+
 '<div class="frp-sublabel">The Frost</div><div class="frp-most" id="frp-most"></div><div class="frp-rows" id="frp-frostrows"></div>'+
 '<div class="frp-hint" id="frp-podhint">Waiting for the host to choose what is next.</div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var SEATED=/[?&]seat=1(&|$)/.test(location.search);
var SAY=PartyShell.SAY||{sending:'Sending'};
var curQ=0, curR=0, curOpts=[], sel=-1, committed=false, finalSaved=false, pending=null, tries=0;
var myVote=null, voteAck=false, last={}, fogAt=null, lastS=null, fresh=true;
function me(){ return PartyShell.playerId; }
function plural(n,one,many){ return n===1?one:many; }
function marksWord(n){ return n+' frost '+plural(n,'mark','marks'); }
function newMarks(n){ return n+' new frost '+plural(n,'mark','marks'); }
function chip(d,id){
  return '<i class="frp-sym" style="color:'+esc((d.cols||{})[id]||'#e8dcc8')+'">'+esc((d.syms||{})[id]||'●')+'</i>';
}
function nameOf(d,id){ return esc((d.names||{})[id]||'')+(id===me()?' (you)':''); }
function pips(n){ var s=''; for(var j=0;j<3;j++) s+='<span class="frp-pip'+(j<n?' lit':'')+'"></span>'; return s; }
function standingIds(d){ return (d.order||Object.keys(d.names||{})).filter(function(x){ return !(d.frozen||{})[x]; }); }

/* the compact ledger on a standing phone: everybody still standing and their marks */
function ledgerChips(d){
  var ids=standingIds(d), html='';
  for(var i=0;i<ids.length;i++)
    html+='<span class="frp-lchip'+(ids[i]===me()?' me':'')+'">'+chip(d,ids[i])+esc((d.names||{})[ids[i]]||'')+
      '<span class="frp-pips">'+pips((d.marks||{})[ids[i]]||0)+'</span></span>';
  return html;
}
function ledgerRows(d){
  var ids=standingIds(d), html='';
  for(var i=0;i<ids.length;i++)
    html+='<div class="frp-row">'+chip(d,ids[i])+'<span class="nm">'+nameOf(d,ids[i])+'</span>'+
      '<span class="frp-pips">'+pips((d.marks||{})[ids[i]]||0)+'</span><b>'+((d.scores||{})[ids[i]]||0)+'</b></div>';
  return html;
}

/* ---- the weather vote ---- */
function renderPowers(powers){
  var html='';
  for(var i=0;i<powers.length;i++)
    html+='<button class="frp-pwbtn" data-k="'+esc(powers[i].key)+'" aria-pressed="false">'+
      '<span class="frp-pwn">'+esc(powers[i].name)+'</span><span class="frp-pwd">'+esc(powers[i].desc)+'</span></button>';
  var box=$('frp-pwopts'); box.innerHTML=html;
  var b=box.querySelectorAll('.frp-pwbtn');
  for(var k=0;k<b.length;k++) b[k].addEventListener('click',function(){
    myVote=this.getAttribute('data-k'); voteAck=false; paintVote();
    setVNote(SAY.sending);
    PartyShell.sendToHost({t:'vote',r:curR,v:myVote});
  });
}
function paintVote(){
  var b=$('frp-pwopts').querySelectorAll('.frp-pwbtn');
  for(var i=0;i<b.length;i++){ var on=b[i].getAttribute('data-k')===myVote;
    b[i].classList.toggle('sel',on); b[i].setAttribute('aria-pressed',on?'true':'false'); }
}
function setVNote(t,cls){ var n=$('frp-vnote'); n.textContent=t; n.className='frp-status'+(cls?' '+cls:''); }
function countLine(ids,of,what){ return (ids||[]).length+' of '+of+' '+what; }

/* ---- the question ---- */
function setNote(text,cls){ var n=$('frp-note'); n.textContent=text; n.className='frp-status'+(cls?' '+cls:''); }
function paintGo(){
  var go=$('frp-go');
  if(committed){ go.disabled=true; go.textContent=finalSaved?'Saved':SAY.sending; go.classList.add('done'); return; }
  go.classList.remove('done');
  go.disabled=sel<0||!curOpts.length||!amEligible();
  go.textContent='Final answer';
}
function amEligible(){ return (last.eligible||[]).indexOf(me())>=0; }
function paintOpts(){
  var b=$('frp-opts').querySelectorAll('.frp-opt');
  for(var i=0;i<b.length;i++){
    b[i].classList.toggle('sel',i===sel);
    b[i].disabled=committed||!amEligible();
    b[i].setAttribute('aria-pressed',i===sel?'true':'false');
  }
}
function renderOpts(opts){
  var same=curOpts.length===opts.length;
  if(same) for(var i=0;i<opts.length;i++) if(curOpts[i]!==opts[i]) same=false;
  if(same) return;            /* a repeated payload must never redraw under a thumb */
  curOpts=opts.slice();
  var html='';
  for(var j=0;j<opts.length;j++) html+='<button class="frp-opt" data-i="'+j+'" aria-pressed="false">'+esc(opts[j])+'</button>';
  var box=$('frp-opts'); box.innerHTML=html;
  var b=box.querySelectorAll('.frp-opt');
  for(var k=0;k<b.length;k++) b[k].addEventListener('click',function(){
    if(committed||!amEligible()) return;
    sel=parseInt(this.getAttribute('data-i'),10);
    paintOpts(); paintGo();
    setNote('Tap Final answer to save it. You get one answer.');
  });
}
function commit(){
  if(committed||sel<0||!amEligible()) return;
  committed=true; finalSaved=false; paintOpts(); paintGo();
  setNote(SAY.sending,'sending');
  pending={t:'final',q:curQ,v:sel,o:curOpts[sel]}; tries=0;
  PartyShell.sendToHost(pending);
  retry();
}
/* an answer never acknowledged is sent again: the host keeps the first one it accepted, so this cannot replace it */
function retry(){
  setTimeout(function(){
    if(!pending||finalSaved||pending.q!==curQ||tries>=3) return;
    tries++; PartyShell.sendToHost(pending); retry();
  },2500);
}
$('frp-go').addEventListener('click',commit);

function fogLine(){
  if(fogAt===null||fogAt===undefined||curOpts.length) return '';
  var n=(lastS===null||lastS===undefined)?'':Math.max(1,lastS-fogAt);
  return 'Choices appear in '+n+'. Read the question first.';
}
function paintFog(){ var t=fogLine(); $('frp-fog').textContent=t; $('frp-ffog').textContent=t; }

PartyShell.onTimer(function(s){
  lastS=s;
  var ts=root.querySelectorAll('.frp-timer');
  for(var i=0;i<ts.length;i++){
    if(s===null||s===undefined){ ts[i].textContent=''; continue; }
    ts[i].textContent=s; ts[i].classList.toggle('low',s<=5);
  }
  paintFog();
});

PartyShell.onMessage(function(msg){
  if(!msg) return;
  if(msg.t==='fin'&&msg.q===curQ){
    committed=true; finalSaved=true; pending=null;
    var i=curOpts.indexOf(msg.o); if(i>=0) sel=i;
    paintOpts(); paintGo();
    setNote('Final answer saved.','saved');
  }
  else if(msg.t==='saved'&&msg.q===curQ){
    var t=countLine(msg.ids,msg.of,'final answers saved');
    $('frp-qcount').textContent=t; $('frp-fcount').textContent=t;
  }
  else if(msg.t==='vback'&&msg.r===curR){
    myVote=msg.v; voteAck=true; paintVote();
    setVNote('Weather saved. You can change it until time runs out.','saved');
  }
  else if(msg.t==='vcount'&&msg.r===curR){
    var c=countLine(msg.ids,msg.of,'weather choices saved');
    $('frp-vcount').textContent=c; $('frp-wcount').textContent=c;
  }
  else if(msg.t==='allset'&&msg.r===curR){
    setVNote(SAY.allSet||'All set. Finishing soon.','saved');
    $('frp-wcount').textContent=SAY.allSet||'All set. Finishing soon.';
  }
});

PartyShell.onPhase(function(name,data){
  data=data||{};
  handle(name,data);
  fresh=false;
});
function iAmFrost(d){ return !!(d.frozen||{})[me()]; }
function handle(name,d){
  if(name==='rules'){
    $('frp-pace').textContent=(d.slow?'More reading time is on: ':'')+(d.len||24)+' seconds to answer each question.';
    show('frp-rules');
  }
  else if(name==='vote'){
    last=d;
    if(d.num!==curR){ curR=d.num; myVote=null; voteAck=false; }
    var c=countLine(d.saved,(d.eligible||[]).length,'weather choices saved');
    if(iAmFrost(d)&&(d.eligible||[]).indexOf(me())>=0){
      $('frp-vn').textContent='BEFORE QUESTION '+d.num+' OF '+d.total;
      if(!$('frp-pwopts').children.length) renderPowers(d.powers||[]);
      paintVote();
      if(!myVote) setVNote('The most chosen weather wins. Ties rotate.');
      $('frp-vcount').textContent=c;
      if(fresh) PartyShell.sendToHost({t:'vmine?',r:curR});
      show('frp-vote');
    } else {
      $('frp-wn').textContent='BEFORE QUESTION '+d.num+' OF '+d.total;
      $('frp-wsub').textContent=iAmFrost(d)?'You choose the weather from the next round.':'Their weather changes the next question.';
      var eh='', pw=d.powers||[];
      for(var i=0;i<pw.length;i++) eh+='<div class="frp-effect"><b>'+esc(pw[i].name)+'</b>'+esc(pw[i].desc)+'</div>';
      $('frp-effects').innerHTML=eh;
      $('frp-wcount').textContent=c;
      var m=(d.marks||{})[me()]||0;
      $('frp-wmine').textContent=iAmFrost(d)?('Your weather points: '+((d.weather||{})[me()]||0)+'.'):('You have '+marksWord(m)+'.');
      show('frp-vwait');
    }
  }
  else if(name==='weather'){
    $('frp-xn').textContent='QUESTION '+d.num+' OF '+d.total;
    $('frp-xname').textContent=d.powerName||'';
    $('frp-xdesc').textContent=d.powerDesc||'';
    show('frp-wx');
  }
  else if(name==='question'){
    last=d;
    if(d.num!==curQ){
      curQ=d.num; sel=-1; committed=false; finalSaved=false; pending=null; curOpts=[];
      $('frp-opts').innerHTML='';
      setNote('Choose an option, then tap Final answer.');
    }
    fogAt=d.fogAt;
    var count=countLine(d.saved,(d.eligible||[]).length,'final answers saved');
    if(iAmFrost(d)){
      $('frp-fn').textContent='QUESTION '+d.num+' OF '+d.total;
      $('frp-fpw').textContent=d.powerName?('The room chose '+d.powerName+'.'):'No weather this round.';
      $('frp-fqt').textContent=d.q||'';
      var oh='';
      if(d.options) for(var o=0;o<d.options.length;o++) oh+='<div class="frp-choice">'+esc(d.options[o])+'</div>';
      $('frp-fopts').innerHTML=oh;
      curOpts=d.options?d.options.slice():[];
      $('frp-fcount').textContent=count;
      $('frp-fledger').innerHTML=ledgerRows(d);
      $('frp-fmine').textContent='Your weather points: '+((d.weather||{})[me()]||0)+'.';
      paintFog();
      show('frp-fq');
      return;
    }
    $('frp-n').textContent='QUESTION '+d.num+' OF '+d.total;
    $('frp-pw').textContent=d.powerName?('Weather: '+d.powerName):'';
    var m2=(d.marks||{})[me()]||0;
    $('frp-me').innerHTML='You: <span class="frp-pips">'+pips(m2)+'</span>';
    $('frp-ledger1').innerHTML=ledgerChips(d);
    $('frp-qt').textContent=d.q||'';
    /* under Fog four empty slots hold the choices' places, so nothing moves when they arrive */
    if(d.options) renderOpts(d.options);
    else { curOpts=[]; $('frp-opts').innerHTML='<div class="frp-ghostopt"></div><div class="frp-ghostopt"></div><div class="frp-ghostopt"></div><div class="frp-ghostopt"></div>'; }
    paintOpts(); paintGo(); paintFog();
    if(!amEligible()) setNote('You were away when this question opened. You play the next one.');
    $('frp-qcount').textContent=count;
    if(fresh&&!committed&&amEligible()) PartyShell.sendToHost({t:'mine?',q:curQ});
    show('frp-q');
  }
  else if(name==='reveal'){
    var r=(d.results||{})[me()]||{got:'none'}, el=$('frp-rt'), mk=(d.marks||{})[me()]||0;
    $('frp-rn').textContent='QUESTION '+d.num+' OF '+d.total;
    if(r.got==='right'){ el.textContent='Right. +'+r.pts; el.className='frp-result right'; }
    else if(r.froze){ el.textContent='You are the Frost. Choose the next weather.'; el.className='frp-result frost'; }
    else if(r.got==='wrong'){ el.textContent='You chose '+r.pick+'. You have '+marksWord(mk)+'.'; el.className='frp-result miss'; }
    else if(r.got==='none'){ el.textContent='No answer saved this round. You have '+marksWord(mk)+'.'; el.className='frp-result miss'; }
    else if(r.got==='away'){ el.textContent='You were away for this one. No mark.'; el.className='frp-result miss'; }
    else if(r.got==='frost'&&!r.idle){ el.textContent=d.applied?(newMarks(d.applied)+'. +'+r.weather+' weather points'):'No new frost marks this round.'; el.className='frp-result frost'; }
    else { el.textContent='No weather points this round.'; el.className='frp-result frost'; }
    $('frp-ra').textContent='The answer was '+d.answer+'.';
    var ids=(d.order||Object.keys(d.names||{})), out='';
    for(var i2=0;i2<ids.length;i2++){
      var id=ids[i2], x=(d.results||{})[id]||{got:'none'}, what;
      if(x.got==='right') what='right <b>+'+x.pts+'</b>';
      else if(x.froze) what=(x.got==='wrong'?'chose '+esc(x.pick)+', ':'no answer, ')+'joins the Frost';
      else if(x.got==='wrong') what='chose '+esc(x.pick)+', +'+x.add+' '+plural(x.add,'mark','marks');
      else if(x.got==='none') what='no answer, +'+x.add+' '+plural(x.add,'mark','marks');
      else if(x.got==='away') what='away';
      else if(x.got==='frost') what='Frost'+(x.weather?' <b class="wx">+'+x.weather+'</b>':'');
      else what='';
      out+='<div class="frp-row'+(id===me()?' me':'')+((d.frozen||{})[id]?' out':'')+'">'+chip(d,id)+'<span class="nm">'+nameOf(d,id)+'</span>'+
        '<span class="ex">'+what+'</span></div>';
    }
    $('frp-rroom').innerHTML=out;
    $('frp-rtot').textContent=iAmFrost(d)?('Your weather points: '+((d.weather||{})[me()]||0)+'.'):('Your points: '+((d.scores||{})[me()]||0)+'.');
    show('frp-r');
  }
  else if(name==='podium'||name==='over'){
    if(name==='over'&&($('frp-pod').classList.contains('on')||!d.names)) return;
    var L=d.lines||[];
    $('frp-end1').textContent=L[0]||''; $('frp-end2').textContent=L[1]||'';
    var sc=(d.scores||{})[me()], wx=(d.weather||{})[me()]||0;
    $('frp-podme').textContent=sc===undefined?'':(((d.frozen||{})[me()])?('You scored '+sc+' points and '+wx+' weather points.'):('You scored '+sc+' points.'));
    var sv=d.survival||[], h='';
    for(var s=0;s<sv.length;s++){ var sid=sv[s];
      h+='<div class="frp-row'+(sid===me()?' me':'')+((d.frozen||{})[sid]?' out':'')+'"><span class="pl">'+((d.survivalPlaces||{})[sid]||'')+'</span>'+chip(d,sid)+
        '<span class="nm">'+nameOf(d,sid)+'</span><span class="ex">'+((d.frozen||{})[sid]?('frozen at question '+(d.frozeAt||{})[sid]):'still standing')+'</span>'+
        '<b>'+((d.scores||{})[sid]||0)+'</b></div>'; }
    $('frp-podrows').innerHTML=h;
    var fr=d.frost||[], fh='';
    for(var f=0;f<fr.length;f++){ var fid=fr[f];
      fh+='<div class="frp-row out'+(fid===me()?' me':'')+'"><span class="pl">'+((d.frostPlaces||{})[fid]||'')+'</span>'+chip(d,fid)+
        '<span class="nm">'+nameOf(d,fid)+'</span><b class="wx">'+((d.weather||{})[fid]||0)+'</b></div>'; }
    $('frp-frostrows').innerHTML=fh;
    var most=(d.most||[]).map(function(x){ return (d.names||{})[x]; });
    $('frp-most').textContent=!fr.length?'Nobody became the Frost this game.':most.length?
      ('Most weather points: '+(most.length>1?most.slice(0,-1).join(', ')+' and '+most[most.length-1]:most[0])):'No weather points this game.';
    $('frp-podhint').textContent=SEATED?'Your controls are just below.':'Waiting for the host to choose what is next.';
    show('frp-pod');
  }
}
show('frp-wait');
})();
