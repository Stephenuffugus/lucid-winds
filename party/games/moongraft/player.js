/* MOONGRAFT, phone.

   You are handed ONE part and a blank surface that IS that part's rectangle on the finished card, so you draw big and
   comfortable and it still lands in the right place. You never see anybody else's part until the reveal.

   W3 (18 Oct 2026, Astra B5): the rules on every phone; small gold notches where your part meets its neighbour (D01);
   every stroke has an id, every send a revision, the room acknowledges it ("Saved"), and a reloaded phone gets its
   drawing back from this tab or from the room (D02); three labelled brush sizes, Undo, Clear with a question, and
   Done for now that you can take back (D03); the plant assembles here in the room's order, from the SAME renderer the
   TV uses (render.js); the gallery saves a clean 1200 x 1600 PNG card per plant, names only if you ask (D04).

   ⛔ Strokes go out as quantised integer arrays after every stroke, never an image and never only at the end. A phone
   that locks or dies mid round has still contributed everything the room acknowledged. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var MY_V=((document.currentScript&&/[?&]v=([^&]+)/.exec(document.currentScript.src))||[])[1]||'';
function needRender(cb){
  if(window.MoongraftRender){ cb(); return; }
  var s=document.createElement('script');
  s.src='games/moongraft/render.js'+(MY_V?'?v='+MY_V:'');
  s.onload=cb; s.onerror=function(){ cb(); };
  document.head.appendChild(s);
}

needRender(function(){
var R=window.MoongraftRender;
var SAY=(PartyShell.SAY)||{sending:'Sending', saved:'Saved. You can change it.', allSet:'All set. Finishing soon.'};

var root=$('game-root');
root.innerHTML=
 '<div class="screen mgp-scroll" id="mgp-rules"><div class="mgp-timer" id="mgp-rt"></div>'+
 '<div class="mgp-title">Here is how to play.</div>'+
 '<div class="mgp-rules">Each person draws one secret part of our plant.<br><br>Draw your part any way you like. The others stay hidden.<br><br>'+
 'When time runs out, we put every part together.<br><br>There are no scores. Everyone can save the finished card.</div>'+
 '<div class="mgp-sub">Your secret part will appear here.</div></div>'+

 '<div class="screen" id="mgp-wait"><div class="mgp-wait" id="mgp-wait-t">Preparing your drawing space.</div>'+
 '<div class="mgp-sub" id="mgp-wait-s">Keep this page open.</div></div>'+

 '<div class="screen mgp-play" id="mgp-draw">'+
 '<div class="mgp-timer" id="mgp-t"></div>'+
 '<div class="mgp-brief" id="mgp-brief"></div>'+
 '<div class="mgp-hint" id="mgp-hint"></div>'+
 '<div class="mgp-edge" id="mgp-above"></div>'+
 '<div class="mgp-canwrap"><canvas id="mgp-can"></canvas></div>'+
 '<div class="mgp-edge" id="mgp-below"></div>'+
 '<div class="mgp-status"><span id="mgp-save"></span><span id="mgp-count"></span></div>'+
 '<div class="mgp-pal" id="mgp-pal"></div>'+
 '<div class="mgp-tools" id="mgp-sizes">'+
 '<button class="mgp-tool mgp-size" data-w="0">Thin</button>'+
 '<button class="mgp-tool mgp-size on" data-w="1">Medium</button>'+
 '<button class="mgp-tool mgp-size" data-w="2">Thick</button></div>'+
 '<div class="mgp-tools" id="mgp-row2"></div>'+
 '</div>'+

 '<div class="screen mgp-play mgp-scroll" id="mgp-show">'+
 '<div class="mgp-num" id="mgp-sn"></div>'+
 '<div class="mgp-plantname" id="mgp-pn"></div>'+
 '<div class="mgp-canwrap keep"><canvas id="mgp-out" width="450" height="600"></canvas></div>'+
 '<div class="mgp-haiku" id="mgp-hk"></div>'+
 '<div class="mgp-sub" id="mgp-mine"></div>'+
 '<div class="mgp-sub" id="mgp-by"></div></div>'+

 '<div class="screen mgp-play" id="mgp-gal">'+
 '<div class="mgp-num">The moon garden</div>'+
 '<div class="mgp-title" id="mgp-gt">Three plants, grown together.</div>'+
 '<div class="mgp-sub mgp-tight">Our garden is ready. Save your cards below.</div>'+
 '<div class="mgp-shelf" id="mgp-shelf"></div>'+
 '<div class="mgp-cname" id="mgp-pick"></div>'+
 '<div class="mgp-gbtns" id="mgp-gbtns"></div>'+
 '<div class="mgp-sub mgp-tight" id="mgp-gfoot">Save your cards before you leave.</div></div>'+

 '<div class="screen mgp-play mgp-scroll" id="mgp-saves">'+
 '<div class="mgp-sheet-t" id="mgp-sheet-t">Your card</div>'+
 '<div class="mgp-gbtns" id="mgp-sheet-btns"></div>'+
 '<div class="mgp-sub mgp-tight" id="mgp-sheet-help">Tap Download, or press and hold a picture to save it.</div>'+
 '<div class="mgp-sheet-imgs" id="mgp-sheet-imgs"></div></div>';

var SCREENS=['mgp-rules','mgp-wait','mgp-draw','mgp-show','mgp-gal','mgp-saves'];
function show(id){ for(var i=0;i<SCREENS.length;i++) $(SCREENS[i]).classList.remove('on'); $(id).classList.add('on'); }

var PAL=['#e8dcc8'], WID=[3,7,14];
var curColor=0, curWidth=1, strokes=[], drawing=null, nextId=1, rev=0, ackRev=0, myLayer=null, amDone=false, finishing=false;
var resendT=null, growT=[], cards={}, gallery=[], includeNames=false, seenGallery=false;
var can=$('mgp-can'), ctx=can.getContext('2d');
var MAX_STROKES=220, MAX_PTS=260;
var IS_SEAT=!!PartyShell.isSeat;

/* ---------- D02: this tab keeps its own copy of the drawing until the room has it ---------- */
var STORE='mg_draw';
function saveLocal(){
  if(!myLayer) return;
  try{ sessionStorage.setItem(STORE,JSON.stringify({pid:PartyShell.playerId,g:myLayer.g,r:myLayer.r,key:myLayer.key,
    rev:rev,nextId:nextId,s:strokes})); }catch(e){}
}
function loadLocal(msg){
  try{ var d=JSON.parse(sessionStorage.getItem(STORE)||'null');
    if(d&&d.pid===PartyShell.playerId&&d.g===msg.g&&d.r===msg.r&&d.key===msg.key&&Array.isArray(d.s)) return d; }catch(e){}
  return null;
}

function sizeCanvas(aspect){
  /* The surface is the part's own rectangle, so proportions carry through.
     ⛔ THE HEIGHT IS MEASURED, NEVER GUESSED: a fixed cap once pushed the tools BELOW THE FOLD on a 375x667 phone.
     Measure what is left after everything else on the screen, with visualViewport, never innerHeight. */
  var wrap=can.parentNode, screenEl=$('mgp-draw');
  var vh=(window.visualViewport&&window.visualViewport.height)||window.innerHeight||667;
  var used=0, kids=screenEl.children;
  for(var i=0;i<kids.length;i++){
    if(kids[i]===wrap||kids[i].id==='mgp-confirm') continue;
    var r=kids[i].getBoundingClientRect(), cs=getComputedStyle(kids[i]);
    used+=r.height+parseFloat(cs.marginTop||0)+parseFloat(cs.marginBottom||0);
  }
  var pad=parseFloat(getComputedStyle(screenEl).paddingTop||0)+parseFloat(getComputedStyle(screenEl).paddingBottom||0);
  var maxH=Math.max(150,Math.floor(vh-used-pad-18));
  var maxW=Math.min(380,wrap.clientWidth||340);
  var w=maxW, h=Math.round(w/(aspect||0.75));
  if(h>maxH){ h=maxH; w=Math.round(h*(aspect||0.75)); }
  can.style.width=w+'px'; can.style.height=h+'px';
  var dpr=Math.min(2,window.devicePixelRatio||1);
  can.width=Math.round(w*dpr); can.height=Math.round(h*dpr);
  ctx=can.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  repaint();
}
function notch(x,top,w,h){
  /* a small gold mark on the edge where the neighbour's part begins: a place to meet, not a picture of it */
  var cx=x*w, s=9;
  ctx.fillStyle='#c8a84b';
  ctx.beginPath();
  if(top){ ctx.moveTo(cx-s,0); ctx.lineTo(cx+s,0); ctx.lineTo(cx,s*1.2); }
  else { ctx.moveTo(cx-s,h); ctx.lineTo(cx+s,h); ctx.lineTo(cx,h-s*1.2); }
  ctx.closePath(); ctx.fill();
}
function repaint(){
  var w=can.clientWidth, h=can.clientHeight;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#0d1420'; ctx.fillRect(0,0,w,h);
  if(myLayer&&myLayer.above) notch(myLayer.ax,true,w,h);
  if(myLayer&&myLayer.below) notch(myLayer.bx,false,w,h);
  ctx.lineCap='round'; ctx.lineJoin='round';
  for(var i=0;i<strokes.length;i++){
    var s=strokes[i], p=s.p;
    if(!p||p.length<2) continue;
    ctx.strokeStyle=PAL[s.c%PAL.length];
    ctx.lineWidth=WID[s.w%WID.length];
    ctx.beginPath();
    ctx.moveTo((p[0]/1000)*w,(p[1]/1000)*h);
    for(var j=2;j<p.length;j+=2) ctx.lineTo((p[j]/1000)*w,(p[j+1]/1000)*h);
    if(p.length===2) ctx.lineTo((p[0]/1000)*w+0.6,(p[1]/1000)*h+0.6);
    ctx.stroke();
  }
}
function pt(ev){
  var r=can.getBoundingClientRect();
  var t=(ev.touches&&ev.touches[0])||ev;
  return [Math.round(Math.max(0,Math.min(1,(t.clientX-r.left)/r.width))*1000),
          Math.round(Math.max(0,Math.min(1,(t.clientY-r.top)/r.height))*1000)];
}
function begin(ev){
  if(!myLayer||strokes.length>=MAX_STROKES) return;
  ev.preventDefault();
  if(amDone) setDone(false);
  drawing={i:nextId++,c:curColor,w:curWidth,p:pt(ev)};
  strokes.push(drawing); repaint();
}
function move(ev){
  if(!drawing) return;
  ev.preventDefault();
  var p=pt(ev), n=drawing.p.length;
  if(n>=MAX_PTS*2) return;
  /* drop points almost on top of the last one: smaller payload, the same line */
  if(n>=2 && Math.abs(p[0]-drawing.p[n-2])<7 && Math.abs(p[1]-drawing.p[n-1])<7) return;
  drawing.p.push(p[0],p[1]); repaint();
}
function end(){ if(!drawing) return; drawing=null; sendArt(); }

can.addEventListener('pointerdown',begin);
can.addEventListener('pointermove',move);
window.addEventListener('pointerup',end);
can.addEventListener('touchstart',begin,{passive:false});
can.addEventListener('touchmove',move,{passive:false});
window.addEventListener('touchend',end);

function saveState(txt,cls){ var el=$('mgp-save'); el.textContent=txt; el.className=cls||''; }
function sendNow(){
  if(!myLayer) return;
  PartyShell.sendToHost({t:'art',g:myLayer.g,r:myLayer.r,rev:rev,s:strokes});
  if(resendT) clearTimeout(resendT);
  /* no answer in 2.5 s: send the same revision again (the room ignores a duplicate) */
  resendT=setTimeout(function(){ if(ackRev<rev) sendNow(); },2500);
}
function sendArt(){
  rev++; saveLocal();
  saveState(SAY.sending,'sending');
  sendNow();
}

/* the second tool row: Undo, Clear drawing, Done for now; Clear asks first, in the same row (nothing covers the
   canvas or the other tools, and a stray tap on the question changes nothing) */
var asking=false;
function row2(){
  var r=$('mgp-row2');
  if(asking){
    r.innerHTML='<button class="mgp-tool mgp-warn" id="mgp-clear-yes">Clear drawing</button>'+
                '<button class="mgp-tool mgp-keep" id="mgp-clear-no">Keep drawing</button>';
    saveState('Clear your whole drawing?','sending');
    $('mgp-clear-yes').onclick=function(){ asking=false; strokes=[]; repaint(); row2(); sendArt(); };
    $('mgp-clear-no').onclick=function(){ asking=false; row2(); saveState(ackRev>=rev&&rev?'Saved':'', 'saved'); };
    return;
  }
  r.innerHTML='<button class="mgp-tool" id="mgp-undo">Undo</button>'+
              '<button class="mgp-tool" id="mgp-clear">Clear drawing</button>'+
              '<button class="mgp-tool mgp-done'+(amDone?' on':'')+'" id="mgp-done">'+(amDone?'Keep drawing':'Done for now')+'</button>';
  $('mgp-undo').onclick=function(){ if(!strokes.length) return; strokes.pop(); repaint(); sendArt(); };
  $('mgp-clear').onclick=function(){ if(!strokes.length) return; asking=true; row2(); };
  $('mgp-done').onclick=function(){ setDone(!amDone); };
}
var sizes=document.querySelectorAll('.mgp-size');
for(var z=0;z<sizes.length;z++) sizes[z].addEventListener('click',function(){
  curWidth=parseInt(this.getAttribute('data-w'),10);
  for(var m=0;m<sizes.length;m++) sizes[m].classList.toggle('on',sizes[m]===this);
});
function setDone(v){
  amDone=!!v; asking=false; row2();
  if(amDone) saveState('Done for now. You can keep drawing.','saved');
  if(myLayer) PartyShell.sendToHost({t:'done',g:myLayer.g,r:myLayer.r,v:amDone});
}

function renderPalette(){
  var html='';
  for(var i=0;i<PAL.length;i++)
    html+='<button class="mgp-sw'+(i===curColor?' on':'')+'" data-i="'+i+'" style="background:'+PAL[i]+'" aria-label="Colour '+(i+1)+'"></button>';
  var box=$('mgp-pal'); box.innerHTML=html;
  var b=box.querySelectorAll('.mgp-sw');
  for(var k=0;k<b.length;k++) b[k].addEventListener('click',function(){
    curColor=parseInt(this.getAttribute('data-i'),10);
    var all=$('mgp-pal').querySelectorAll('.mgp-sw');
    for(var m=0;m<all.length;m++) all[m].classList.toggle('on',parseInt(all[m].getAttribute('data-i'),10)===curColor);
  });
}
function countLine(started,eligible){
  if(eligible===undefined||eligible===null) return;
  $('mgp-count').textContent=started+' of '+eligible+' '+(eligible===1?'person has':'people have')+' started drawing';
}

PartyShell.onTimer(function(s){
  var ids=['mgp-t','mgp-rt'];
  for(var i=0;i<ids.length;i++){ var t=$(ids[i]); if(!t) continue;
    if(s===null||s===undefined){ t.textContent=''; continue; }
    t.textContent=s; t.classList.toggle('low',s<=10); }
});

/* ---------- the part arrives (or arrives again after a reload) ---------- */
function edgeLine(nb){ return nb?('Your '+(myLayer.part||myLayer.key)+' '+R.meets(myLayer.key)+' the '+nb+' at this edge.'):''; }
PartyShell.onMessage(function(msg){
  if(!msg) return;
  if(msg.t==='artack'){ if(myLayer&&msg.g===myLayer.g&&msg.r===myLayer.r&&msg.rev>=rev){ ackRev=msg.rev; saveState(amDone?'Done for now. You can keep drawing.':'Saved','saved'); } return; }
  if(msg.t==='progress'){ if(myLayer&&msg.g===myLayer.g&&msg.r===myLayer.r) countLine(msg.started,msg.eligible); return; }
  if(msg.t!=='layer') return;
  var same=myLayer&&myLayer.g===msg.g&&myLayer.r===msg.r&&myLayer.key===msg.key;
  myLayer=msg;
  if(msg.palette) PAL=msg.palette;
  if(msg.widths) WID=msg.widths;
  if(!same){
    drawing=null; amDone=false; finishing=false; ackRev=0;
    /* D02: this tab's own copy first (it can hold strokes the room never acknowledged), then the room's */
    var local=loadLocal(msg), restored='';
    if(local&&local.s.length){ strokes=local.s; rev=local.rev; nextId=local.nextId||(local.s.length+1); restored='Your drawing is back.'; }
    else if(msg.st&&msg.st.length){ strokes=msg.st.slice(); rev=msg.rev||0; ackRev=rev;
      nextId=1; for(var i=0;i<strokes.length;i++) if((strokes[i].i|0)>=nextId) nextId=(strokes[i].i|0)+1;
      restored='Your saved strokes are back.'; }
    else { strokes=[]; rev=0; nextId=1; }
    curColor=0; curWidth=1;
    for(var m=0;m<sizes.length;m++) sizes[m].classList.toggle('on',m===1);
    asking=false; row2();
    saveState(restored,restored?'saved':'');
    if(local&&local.s.length&&local.rev>(msg.rev||0)) sendNow();   /* the room is behind this tab: catch it up */
  }
  $('mgp-brief').textContent=msg.brief;
  $('mgp-hint').textContent=msg.hint;
  /* draw TO these edges: somebody else's part is waiting on the other side */
  $('mgp-above').textContent=edgeLine(msg.aboveName);
  $('mgp-below').textContent=edgeLine(msg.belowName);
  renderPalette();
  show('mgp-draw');
  sizeCanvas(msg.aspect);
});

/* ---------- the reveal, in the room's order, from the room's renderer ---------- */
function clearGrow(){ while(growT.length) clearTimeout(growT.pop()); }
function growOn(card,per,lead){
  clearGrow();
  var cv=$('mgp-out'), c=cv.getContext('2d'), n=R.steps(card).length, RM=false;
  try{ RM=matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  if(RM){ R.paint(c,card,450,600); return; }
  R.paint(c,card,450,600,0);
  for(var s=1;s<=n;s++) (function(k){ growT.push(setTimeout(function(){ R.paint(c,card,450,600,k); },lead+(k-1)*per)); })(s);
}

/* ---------- the gallery and saving (D04) ----------
   The gallery fits one phone screen: the three plants as a row you tap to pick, then Save card, Save all three and
   Include our names. Saving opens its own screen with the finished PNG cards (1200 x 1600): Share or save opens the
   phone's share sheet where the browser allows sharing files (Android Chrome, iPhone Safari: Save Image / Save to
   Photos are in that sheet), each card has a Download link (Android: the Downloads folder; iPhone: Files), and on
   iPhone pressing and holding the picture offers Save to Photos as well. */
function fileName(card){ return 'moongraft-'+String(card.name||'our-moon-plant').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.png'; }
function pngOf(card,cb){
  var cv=R.cardCanvas(card,{names:includeNames?card.by:null});
  if(cv.toBlob) cv.toBlob(function(b){ cb(b,cv); },'image/png');
  else cb(null,cv);
}
var urls=[], picked=0;
function freeUrls(){ while(urls.length){ try{ URL.revokeObjectURL(urls.pop()); }catch(e){} } }
function backToGarden(){ freeUrls(); $('mgp-sheet-imgs').innerHTML=''; show('mgp-gal'); }
function openSaves(list){
  freeUrls();
  var box=$('mgp-sheet-imgs'); box.innerHTML='';
  $('mgp-sheet-t').textContent=list.length>1?'Your cards':'Your card';
  $('mgp-sheet-help').textContent='Tap Download, or press and hold a picture to save it.';
  $('mgp-sheet-btns').innerHTML='<button class="mgp-tool mgp-wide" id="mgp-saves-back">Back to the garden</button>';
  $('mgp-saves-back').onclick=backToGarden;
  show('mgp-saves');
  var files=[], left=list.length;
  for(var i=0;i<list.length;i++) (function(card){
    pngOf(card,function(blob,cv){
      var src=blob?URL.createObjectURL(blob):cv.toDataURL('image/png');
      if(blob){ urls.push(src); try{ files.push(new File([blob],fileName(card),{type:'image/png'})); }catch(e){} }
      var d=document.createElement('div'); d.className='mgp-sheet-card';
      d.innerHTML='<img alt="'+esc(card.name||'Our moon plant')+'" src="'+src+'">'+
        '<a class="mgp-tool mgp-dl" href="'+src+'" download="'+fileName(card)+'">Download</a>';
      box.appendChild(d);
      if(--left===0){
        var ok=false; try{ ok=!!(navigator.canShare&&files.length&&navigator.canShare({files:files})); }catch(e){}
        if(!ok) return;
        /* only a phone that can share files gets the button: no dead control anywhere else */
        $('mgp-sheet-btns').innerHTML='<button class="ps-btn mgp-wide" id="mgp-share">Share or save</button>'+
          '<button class="mgp-tool mgp-wide" id="mgp-saves-back">Back to the garden</button>';
        $('mgp-saves-back').onclick=backToGarden;
        $('mgp-share').onclick=function(){
          navigator.share({files:files,title:'Moongraft'}).catch(function(){
            $('mgp-sheet-help').textContent='Sharing did not open. Tap Download, or press and hold a picture to save it.'; });
        };
      }
    });
  })(list[i]);
}

function gardenButtons(){
  var n=gallery.length, h='';
  if(n) h+='<button class="ps-btn mgp-wide" id="mgp-save1">Save card</button>';
  if(n>1) h+='<button class="mgp-tool mgp-wide" id="mgp-all">'+(n===3?'Save all three':'Save all '+n)+'</button>';
  if(n) h+='<button class="mgp-tool mgp-wide mgp-namesw'+(includeNames?' on':'')+'" id="mgp-names" aria-pressed="'+includeNames+'">Include our names: '+(includeNames?'on':'off')+'</button>';
  /* SHELL-D10: the host's own seat can take a card off every shelf before anybody saves it */
  if(n&&IS_SEAT) h+='<button class="mgp-tool mgp-wide mgp-rm" id="mgp-rm">Remove this card</button>';
  $('mgp-gbtns').innerHTML=h;
  if(!n) return;
  $('mgp-save1').onclick=function(){ openSaves([gallery[picked]]); };
  if($('mgp-all')) $('mgp-all').onclick=function(){ openSaves(gallery); };
  $('mgp-names').onclick=function(){ includeNames=!includeNames; gardenButtons(); };
  if($('mgp-rm')) $('mgp-rm').onclick=function(){ PartyShell.sendToHost({t:'discard',num:gallery[picked].num}); };
}
function pick(i){
  picked=Math.max(0,Math.min(gallery.length-1,i));
  var th=$('mgp-shelf').querySelectorAll('.mgp-thumbbtn');
  for(var k=0;k<th.length;k++) th[k].classList.toggle('on',k===picked);
  $('mgp-pick').textContent=gallery.length?(gallery[picked].name||'Our moon plant'):'';
}
function renderGallery(list){
  gallery=list||[];
  var n=gallery.length;
  $('mgp-gt').textContent=n===3?'Three plants, grown together.':n===0?'The garden is empty.':(n===1?'One plant, grown together.':'Two plants, grown together.');
  var html='';
  for(var i=0;i<n;i++)
    html+='<button class="mgp-thumbbtn" data-i="'+i+'" aria-label="'+esc(gallery[i].name||'Our moon plant')+'">'+
      '<canvas class="mgp-thumb" width="180" height="240" data-i="'+i+'"></canvas></button>';
  $('mgp-shelf').innerHTML=html;
  var cvs=$('mgp-shelf').querySelectorAll('.mgp-thumb');
  for(var c=0;c<cvs.length;c++) R.paint(cvs[c].getContext('2d'),gallery[parseInt(cvs[c].getAttribute('data-i'),10)],180,240);
  var tb=$('mgp-shelf').querySelectorAll('.mgp-thumbbtn');
  for(var b=0;b<tb.length;b++) tb[b].addEventListener('click',function(){ pick(parseInt(this.getAttribute('data-i'),10)); });
  pick(picked<n?picked:0);
  gardenButtons();
  try{ localStorage.setItem('mg_garden',JSON.stringify({at:Date.now(),cards:gallery})); }catch(e){}
}

/* the host ending the night must not take the cards away (D04): the closed room screen offers them back */
document.addEventListener('party-bye',function(){
  if(!seenGallery||!gallery.length) return;
  var bye=$('ps-bye'); if(!bye||$('mgp-back')) return;
  var w=document.createElement('div');
  w.innerHTML='<button class="ps-btn" id="mgp-back" style="margin-top:14px">Save your cards</button>';
  bye.appendChild(w.firstChild);
  $('mgp-back').addEventListener('click',function(){ bye.classList.remove('on'); show('mgp-gal'); });
});

/* read only state hook for the rules test (lower case: upper case window names are banks to the static gate) */
window.__mgpState=function(){ var on=document.querySelector('#game-root .screen.on');
  return {strokes:strokes.length, rev:rev, ack:ackRev, key:myLayer&&myLayer.key, g:myLayer&&myLayer.g, r:myLayer&&myLayer.r,
    done:amDone, save:$('mgp-save').textContent, screen:on?on.id:'', gallery:gallery.length}; };

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){ clearGrow(); myLayer=null; show('mgp-rules'); }
  else if(name==='draw'){
    finishing=!!data.finishing;
    countLine(data.started,data.eligible);
    if(finishing) saveState(SAY.allSet,'saved');
    /* a phone that rejoins mid round waits for its part to be resent rather than showing a canvas with no brief */
    if(myLayer && myLayer.r===data.num && (!data.g||myLayer.g===data.g)){ if(!$('mgp-draw').classList.contains('on')){ show('mgp-draw'); sizeCanvas(myLayer.aspect); } }
    else {
      $('mgp-wait-t').textContent='Preparing your drawing space.';
      $('mgp-wait-s').textContent='Keep this page open.';
      show('mgp-wait');
      PartyShell.sendToHost({t:'resend',r:data.num});
    }
  }
  else if(name==='grow'){
    var card=data.card; if(!card) return;
    cards[card.num]=card;
    $('mgp-sn').textContent='PLANT '+card.num+' OF '+(data.total||3);
    $('mgp-pn').textContent=card.name||'Our moon plant';
    var hk=card.haiku;
    $('mgp-hk').innerHTML=hk?(esc(hk.line1)+'<br>'+esc(hk.line2)+'<br>'+esc(hk.line3)):'';
    $('mgp-mine').textContent=(myLayer&&myLayer.r===card.num)?('Your part was the '+(myLayer.part||myLayer.key)+'. You helped grow '+(card.name||'Our moon plant')+'.'):'';
    $('mgp-by').textContent=card.by&&card.by.length?('Grown together by '+card.by.join(', ')):'';
    show('mgp-show');
    growOn(card,data.per||300,data.lead||320);
  }
  else if(name==='gallery'){
    clearGrow(); seenGallery=true;
    renderGallery(data.cards||[]);
    show('mgp-gal');
  }
  /* 'over' is the shell's game complete: it lands on the gallery that is already showing */
  else if(name==='over'){ if(seenGallery&&!$('mgp-saves').classList.contains('on')) show('mgp-gal'); }
});
show('mgp-wait');
});
})();
