/* MOONGRAFT, phone.

   You are handed ONE layer and a blank surface that IS that layer's rectangle
   on the finished card, so you draw big and comfortable and it still lands in
   the right place. You never see anybody else's piece until the reveal.

   ⛔ Strokes are sent as quantised integer arrays after every stroke, not as an
   image and not only at the end. A phone that locks or dies mid round has still
   contributed everything it had drawn up to that moment, which matters because
   phones lock every session.

   The renderer at the bottom is a deliberate twin of the one in host.js. The
   two must stay identical or the card a player keeps would not be the card the
   room saw, so any change to one is a change to both. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="mgp-wait"><div class="mgp-wait" id="mgp-wait-t">Eyes up on the big screen.</div>'+
 '<div class="mgp-sub" id="mgp-wait-s"></div></div>'+

 '<div class="screen mgp-play" id="mgp-draw">'+
 '<div class="mgp-timer" id="mgp-t"></div>'+
 '<div class="mgp-brief" id="mgp-brief"></div>'+
 '<div class="mgp-hint" id="mgp-hint"></div>'+
 '<div class="mgp-edge" id="mgp-above"></div>'+
 '<div class="mgp-canwrap"><canvas id="mgp-can"></canvas></div>'+
 '<div class="mgp-edge" id="mgp-below"></div>'+
 '<div class="mgp-pal" id="mgp-pal"></div>'+
 '<div class="mgp-tools">'+
 '<button class="mgp-tool" id="mgp-size">Brush</button>'+
 '<button class="mgp-tool" id="mgp-undo">Undo</button>'+
 '<button class="mgp-tool" id="mgp-clear">Clear</button>'+
 '</div></div>'+

 '<div class="screen mgp-play" id="mgp-show">'+
 '<div class="mgp-plantname" id="mgp-pn"></div>'+
 '<div class="mgp-canwrap keep"><canvas id="mgp-out" width="450" height="600"></canvas></div>'+
 '<div class="mgp-haiku" id="mgp-hk"></div>'+
 '<div class="mgp-sub" id="mgp-mine"></div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var PAL=['#e8dcc8'], WID=[3,7,14];
var curColor=0, curWidth=1, strokes=[], drawing=null, curRound=0, myLayer=null;
var can=$('mgp-can'), ctx=can.getContext('2d');
var MAX_STROKES=220, MAX_PTS=260;

function sizeCanvas(aspect){
  /* the surface is the layer's own rectangle, so proportions carry through */
  var wrap=can.parentNode;
  var maxW=Math.min(340,wrap.clientWidth||340), maxH=372;
  var w=maxW, h=Math.round(w/(aspect||0.75));
  if(h>maxH){ h=maxH; w=Math.round(h*(aspect||0.75)); }
  can.style.width=w+'px'; can.style.height=h+'px';
  var dpr=Math.min(2,window.devicePixelRatio||1);
  can.width=Math.round(w*dpr); can.height=Math.round(h*dpr);
  ctx=can.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  repaint();
}
function repaint(){
  var w=can.clientWidth, h=can.clientHeight;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#0d1420'; ctx.fillRect(0,0,w,h);
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
  if(strokes.length>=MAX_STROKES) return;
  ev.preventDefault();
  drawing={c:curColor,w:curWidth,p:pt(ev)};
  strokes.push(drawing); repaint();
}
function move(ev){
  if(!drawing) return;
  ev.preventDefault();
  var p=pt(ev), n=drawing.p.length;
  if(n>=MAX_PTS*2) return;
  /* drop points that are almost on top of the last one: smaller payload, and
     the line looks the same */
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

function sendArt(){ PartyShell.sendToHost({t:'art',r:curRound,s:strokes}); }

$('mgp-undo').addEventListener('click',function(){ strokes.pop(); repaint(); sendArt(); });
$('mgp-clear').addEventListener('click',function(){ strokes=[]; repaint(); sendArt(); });
$('mgp-size').addEventListener('click',function(){
  curWidth=(curWidth+1)%WID.length;
  this.textContent=['Thin','Brush','Thick'][curWidth]||'Brush';
});

function renderPalette(){
  var html='';
  for(var i=0;i<PAL.length;i++)
    html+='<button class="mgp-sw'+(i===curColor?' on':'')+'" data-i="'+i+'" style="background:'+PAL[i]+'"></button>';
  var box=$('mgp-pal'); box.innerHTML=html;
  var b=box.querySelectorAll('.mgp-sw');
  for(var k=0;k<b.length;k++) b[k].addEventListener('click',function(){
    curColor=parseInt(this.getAttribute('data-i'),10);
    var all=$('mgp-pal').querySelectorAll('.mgp-sw');
    for(var m=0;m<all.length;m++) all[m].classList.toggle('on',
      parseInt(all[m].getAttribute('data-i'),10)===curColor);
  });
}

/* ---- the twin renderer: identical maths to host.js paintPlant ---- */
function paintComposite(cv,layers,W,H){
  var c=cv.getContext('2d');
  c.clearRect(0,0,W,H);
  var g=c.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0f1826'); g.addColorStop(1,'#05070a');
  c.fillStyle=g; c.fillRect(0,0,W,H);
  var arr=(layers||[]).slice().sort(function(a,b){return a.z-b.z;});
  c.lineCap='round'; c.lineJoin='round';
  for(var i=0;i<arr.length;i++){
    var z=arr[i].zone, st=arr[i].st||[];
    var ox=z[0]*W, oy=z[1]*H, zw=z[2]*W, zh=z[3]*H;
    for(var s=0;s<st.length;s++){
      var p=st[s].p;
      if(!p||p.length<2) continue;
      c.strokeStyle=PAL[st[s].c%PAL.length];
      c.lineWidth=Math.max(1,(WID[st[s].w%WID.length]/320)*zw);
      c.beginPath();
      c.moveTo(ox+(p[0]/1000)*zw, oy+(p[1]/1000)*zh);
      for(var j=2;j<p.length;j+=2) c.lineTo(ox+(p[j]/1000)*zw, oy+(p[j+1]/1000)*zh);
      if(p.length===2) c.lineTo(ox+(p[0]/1000)*zw+0.6, oy+(p[1]/1000)*zh+0.6);
      c.stroke();
    }
  }
}

PartyShell.onTimer(function(s){
  var t=$('mgp-t');
  if(s===null||s===undefined){ t.textContent=''; return; }
  t.textContent=s; t.classList.toggle('low',s<=10);
});

PartyShell.onMessage(function(msg){
  if(!msg||msg.t!=='layer') return;
  myLayer=msg;
  if(msg.palette) PAL=msg.palette;
  if(msg.widths) WID=msg.widths;
  curRound=msg.r; strokes=[]; drawing=null; curColor=0; curWidth=1;
  $('mgp-size').textContent='Brush';
  $('mgp-brief').textContent=msg.brief;
  $('mgp-hint').textContent=msg.hint;
  /* draw TO these edges: somebody else's piece is waiting on the other side */
  $('mgp-above').textContent=msg.above?('the '+msg.above+' meets this edge'):'';
  $('mgp-below').textContent=msg.below?('the '+msg.below+' meets this edge'):'';
  renderPalette();
  show('mgp-draw');
  sizeCanvas(msg.aspect);
});

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){
    $('mgp-wait-t').textContent='Eyes up on the big screen.';
    $('mgp-wait-s').textContent='You will each get a secret piece to draw.';
    show('mgp-wait');
  }
  else if(name==='draw'){
    /* a phone that rejoins mid round waits for its layer to be resent rather
       than showing a canvas it has no brief for */
    if(myLayer && myLayer.r===data.num) show('mgp-draw');
    else {
      $('mgp-wait-t').textContent='Finding your piece.';
      $('mgp-wait-s').textContent='It will appear in a moment.';
      show('mgp-wait');
      PartyShell.sendToHost({t:'resend',r:data.num});
    }
  }
  else if(name==='grow'){
    $('mgp-pn').textContent=data.name||'';
    if(data.palette) PAL=data.palette;
    if(data.widths) WID=data.widths;
    paintComposite($('mgp-out'),data.layers,450,600);
    var hk=data.haiku;
    $('mgp-hk').innerHTML=hk?(esc(hk.line1)+'<br>'+esc(hk.line2)+'<br>'+esc(hk.line3)):'';
    $('mgp-mine').textContent=myLayer?('You drew the '+myLayer.key+'.'):'';
    show('mgp-show');
  }
  else if(name==='gallery'||name==='over'){
    $('mgp-wait-t').textContent='The moon garden is full.';
    $('mgp-wait-s').textContent=(data.count?('You helped grow '+data.count+' plants. '):'')+
      'You earned sunbeams, and the cards are yours.';
    show('mgp-wait');
  }
});
show('mgp-wait');
})();
