/* MOONGRAFT, host screen.

   Three plants. For each one every player is handed a different layer, draws it
   blind on their phone, and the room watches the parts assemble on the TV. Then
   the plant gets a Lucid Winds name and a Lucid Winds haiku, and everybody
   keeps the card.

   ⭐ NO SCORES, NO VOTING, NO LOSERS. This is the one title in the pack where
   nothing is a competition, and that is deliberate: a party needs somewhere for
   the person who does not want to be quizzed. The artifact is the reward, and
   gameComplete still mints for every participant.

   ⭐ THE POEM AND THE NAME ARE THE REAL ONES. word-banks.js is the same file
   Lucid Winds ships, and the selection maths below is lifted from getHaiku and
   getPlantName, so a Moongraft card reads exactly like a greenhouse card. The
   hash is made from the drawing itself, so the same plant always gets the same
   poem and a different plant never does.

   ⛔ Strokes travel as quantised integer point arrays, never images. A picture
   over the transport would be tens of kilobytes per player per round, and the
   phones rebuild the identical composite from the same arrays at the reveal. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
var LAYERS=window.MOONGRAFT_LAYERS||[], PAL=window.MOONGRAFT_PALETTE||['#e8dcc8'],
    WID=window.MOONGRAFT_WIDTHS||[3,7,14];
var CARD_W=900, CARD_H=1200, ROUNDS=3;

var root=$('game-root');
root.innerHTML=
 '<div class="mg-screen" id="mg-rules"><div class="mg-timer" id="mg-rt"></div>'+
 '<div class="mg-rules">Everybody gets one secret piece of the same plant.\n\nDraw only your piece. You will not see the others.\n\nWhen the time is up the plant grows on this screen.\n\nNo scores and no winners. You all keep the card.</div>'+
 '<button class="ps-btn" id="mg-next" style="margin-top:34px">Next</button></div>'+

 '<div class="mg-screen" id="mg-draw"><div class="mg-timer" id="mg-dt"></div>'+
 '<div class="mg-num" id="mg-dn"></div>'+
 '<div class="mg-head">Everybody is drawing</div>'+
 '<div class="mg-assign" id="mg-assign"></div>'+
 '<div class="mg-in" id="mg-din"></div></div>'+

 '<div class="mg-screen" id="mg-grow"><div class="mg-num" id="mg-gn"></div>'+
 '<div class="mg-stage"><canvas id="mg-canvas" width="'+CARD_W+'" height="'+CARD_H+'"></canvas></div>'+
 '<div class="mg-plate" id="mg-plate"></div></div>'+

 '<div class="mg-screen mg-gallery" id="mg-gal"><div class="mg-num">The moon garden</div>'+
 '<div class="mg-shelf" id="mg-shelf"></div>'+
 '<div class="mg-earn">Everyone earned sunbeams. The cards are yours to keep.</div>'+
 '<div class="mg-btnrow">'+
 '<button class="ps-btn" id="mg-again">Grow more</button>'+
 '<button class="ps-btn ghost" id="mg-other">Another game</button>'+
 '<button class="ps-btn ghost" id="mg-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.mg-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var names={}, order=[], ri=0, assign={}, strokes={}, plants=[], grown=0;
var FAST=/[?&]mg_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_DRAW=FAST?8:70, T_GROW=FAST?4:15;
var RM=false; try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}

/* ---------- the shared renderer (the phone runs an identical copy) ---------- */
function paintLayer(ctx,layer,st,W,H){
  if(!st||!st.length) return;
  var z=layer.zone, ox=z[0]*W, oy=z[1]*H, zw=z[2]*W, zh=z[3]*H;
  ctx.lineCap='round'; ctx.lineJoin='round';
  for(var i=0;i<st.length;i++){
    var s=st[i], p=s.p;
    if(!p||p.length<2) continue;
    ctx.strokeStyle=PAL[s.c%PAL.length];
    ctx.lineWidth=Math.max(1,(WID[s.w%WID.length]/320)*zw);
    ctx.beginPath();
    ctx.moveTo(ox+(p[0]/1000)*zw, oy+(p[1]/1000)*zh);
    for(var j=2;j<p.length;j+=2) ctx.lineTo(ox+(p[j]/1000)*zw, oy+(p[j+1]/1000)*zh);
    if(p.length===2) ctx.lineTo(ox+(p[0]/1000)*zw+0.6, oy+(p[1]/1000)*zh+0.6);
    ctx.stroke();
  }
}
function paintPlant(ctx,layerSet,W,H,upTo){
  ctx.clearRect(0,0,W,H);
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0f1826'); g.addColorStop(1,'#05070a');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  var arr=layerSet.slice().sort(function(a,b){return a.layer.z-b.layer.z;});
  var n=(upTo===undefined)?arr.length:upTo;
  for(var i=0;i<n&&i<arr.length;i++) paintLayer(ctx,arr[i].layer,arr[i].st,W,H);
}

/* ---------- name and poem, same maths the greenhouse uses ---------- */
function hashOf(str){
  /* a stable 64 hex char digest of the drawing, so one plant is one poem */
  var h1=0x811c9dc5, h2=0x01000193, out='';
  for(var i=0;i<str.length;i++){
    h1=((h1^str.charCodeAt(i))>>>0); h1=(h1*16777619)>>>0;
    h2=((h2+str.charCodeAt(i)*(i+7))>>>0); h2=(h2^(h2<<5))>>>0;
  }
  for(var k=0;k<8;k++){
    h1=(h1*16777619+0x9e3779b9)>>>0; h2=(h2^(h1>>>3))>>>0;
    out+=('00000000'+((h1^h2)>>>0).toString(16)).slice(-8);
  }
  return out.slice(0,64);
}
/* the poem and the name come from the SAME file Lucid Winds ships, loaded on
   the host only (the phones never need it). It is fetched at module load and
   has the whole rules and drawing phase to arrive; if it somehow has not, the
   card still renders and simply carries no poem, which is honest. */
(function(){
  if(window._LW_BANKS) return;
  var s=document.createElement('script');
  s.src='/word-banks.js'; s.async=true;
  s.onerror=function(){};
  document.head.appendChild(s);
})();
function banks(){ return window._LW_BANKS||null; }
function plantName(h){
  var B=banks(); if(!B) return 'A Quiet Growth';
  var a=B.NAME_ADJ, n=B.NAME_NOUN, r=B.NAME_REALM;
  var name=a[(parseInt(h[22]+h[23]+h[24],16)||0)%a.length]+' '+
           n[(parseInt(h[32]+h[33]+h[34],16)||0)%n.length];
  if((parseInt(h[40],16)||0)<7) name+=' of the '+r[(parseInt(h[41]+h[42]+h[43],16)||0)%r.length];
  return name;
}
function haikuOf(h){
  var B=banks(); if(!B) return null;
  var KIG=[B.KIGO_SPRING,B.KIGO_SUMMER,B.KIGO_AUTUMN,B.KIGO_WINTER];
  var A=B.HAIKU_A, Bb=B.HAIKU_B, C=B.HAIKU_C.concat(B.HAIKU_A);
  var seas=(parseInt(h[22]+h[23],16)||0)%4;
  var KS=KIG[seas];
  var KB=(KS&&KS.length&&(parseInt(h[24],16)||0)<8)?KS:A;
  return {
    line1:KB[(parseInt(h[35]+h[26]+h[27],16)||0)%KB.length],
    line2:Bb[(parseInt(h[55]+h[28]+h[29],16)||0)%Bb.length],
    line3:C[(parseInt(h[63]+h[30]+h[31],16)||0)%C.length]
  };
}

/* Which assigned layer abuts this one, above and below. Naming the neighbour is
   the whole difference between a plant and three floating shapes: told that the
   pot is just under your edge, a person draws their stem DOWN to that edge.
   It leaks a word, never a picture, so the drawing stays blind. */
function neighbours(L){
  var mineTop=L.zone[1], mineBot=L.zone[1]+L.zone[3], out={above:null,below:null};
  var bestA=9, bestB=9, k;
  for(k in assign){
    var O=assign[k]; if(!O||O.key===L.key) continue;
    var oTop=O.zone[1], oBot=O.zone[1]+O.zone[3];
    /* horizontal overlap, or it is not really a neighbour */
    var ox=Math.min(L.zone[0]+L.zone[2],O.zone[0]+O.zone[2])-Math.max(L.zone[0],O.zone[0]);
    if(ox<=0.04) continue;
    var dA=Math.abs(oBot-mineTop);
    if(oTop<mineTop&&dA<0.22&&dA<bestA){ bestA=dA; out.above=O.key; }
    var dB=Math.abs(oTop-mineBot);
    if(oBot>mineBot&&dB<0.22&&dB<bestB){ bestB=dB; out.below=O.key; }
  }
  return out;
}

/* ---------- rounds ---------- */
function assignLayers(){
  /* every player draws exactly one layer, and the layer set grows with the
     room: three people get the three that matter most, eight get all eight */
  var pool=LAYERS.slice(0,Math.max(1,Math.min(order.length,LAYERS.length)));
  var shuffledPlayers=order.slice();
  for(var i=shuffledPlayers.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var t=shuffledPlayers[i]; shuffledPlayers[i]=shuffledPlayers[j]; shuffledPlayers[j]=t;
  }
  assign={};
  for(var k=0;k<shuffledPlayers.length;k++) assign[shuffledPlayers[k]]=pool[k%pool.length];
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='resend'&&assign[pid]){
    /* a rejoined phone has no brief, so hand it the same layer again rather
       than leaving it on a canvas it cannot label */
    var L=assign[pid], nb=neighbours(L);
    PartyShell.sendToPlayer(pid,{t:'layer',r:ri+1,key:L.key,brief:L.brief,hint:L.hint,
      aspect:(L.zone[2]*CARD_W)/(L.zone[3]*CARD_H),palette:PAL,widths:WID,
      above:nb.above,below:nb.below});
    return;
  }
  if(msg.t==='art'&&msg.r===ri+1&&$('mg-draw').classList.contains('on')){
    strokes[pid]=Array.isArray(msg.s)?msg.s.slice(0,220):[];
    var done=0,k; for(k in strokes) if(strokes[k]&&strokes[k].length) done++;
    $('mg-din').textContent=done+' of '+order.length+' have put something down';
  }
});

function startGame(players){
  names={}; order=[]; plants=[]; ri=0;
  for(var i=0;i<players.length;i++){ names[players[i].id]=players[i].name; order.push(players[i].id); }
  phaseRules();
}

function phaseRules(){
  show('mg-rules');
  PartyShell.setPhase('rules',{});
  PartyShell.startTimer(T_RULES,function(s){$('mg-rt').textContent=s;},phaseDraw);
  $('mg-next').onclick=function(){ PartyShell.stopTimer(); phaseDraw(); };
}

function phaseDraw(){
  if(ri>=ROUNDS){ phaseGallery(); return; }
  strokes={}; assignLayers();
  show('mg-draw');
  $('mg-dn').textContent='PLANT '+(ri+1)+' OF '+ROUNDS;
  $('mg-din').textContent='0 of '+order.length+' have put something down';
  /* the room sees WHO is drawing, never WHAT: the blindness is the game */
  var html='';
  for(var i=0;i<order.length;i++)
    html+='<span class="mg-chip">'+esc(names[order[i]])+'</span>';
  $('mg-assign').innerHTML=html;

  for(var k=0;k<order.length;k++){
    var L=assign[order[k]], nb=neighbours(L);
    PartyShell.sendToPlayer(order[k],{t:'layer',r:ri+1,key:L.key,brief:L.brief,hint:L.hint,
      aspect:(L.zone[2]*CARD_W)/(L.zone[3]*CARD_H),palette:PAL,widths:WID,
      above:nb.above,below:nb.below});
  }
  PartyShell.setPhase('draw',{num:ri+1,total:ROUNDS});
  PartyShell.startTimer(T_DRAW,function(s){ var t=$('mg-dt'); t.textContent=s; t.classList.toggle('low',s<=10); },phaseGrow);
}

function phaseGrow(){
  var set=[];
  for(var i=0;i<order.length;i++){
    var pid=order[i], L=assign[pid];
    if(!L) continue;
    set.push({layer:L, st:strokes[pid]||[], by:names[pid]});
  }
  var sig=''; for(var s=0;s<set.length;s++){
    sig+=set[s].layer.key+':';
    var st=set[s].st;
    for(var t=0;t<st.length;t++){ sig+=st[t].c+','+st[t].w+','+st[t].p.length+','+(st[t].p[0]||0)+';'; }
  }
  var hash=hashOf(sig+'|'+ri+'|'+order.length);
  var nm=plantName(hash), hk=haikuOf(hash);
  var plant={set:set,hash:hash,name:nm,haiku:hk,num:ri+1};
  plants.push(plant);

  show('mg-grow');
  $('mg-gn').textContent='PLANT '+(ri+1)+' OF '+ROUNDS;
  $('mg-plate').innerHTML='';
  var cv=$('mg-canvas'), ctx=cv.getContext('2d');

  /* it assembles a layer at a time, which is the whole payoff of drawing blind */
  var sorted=set.slice().sort(function(a,b){return a.layer.z-b.layer.z;});
  var step=0;
  paintPlant(ctx,set,CARD_W,CARD_H,0);
  var per=Math.max(220,Math.floor((T_GROW*1000*0.40)/Math.max(1,sorted.length)));
  function grow(){
    step++;
    paintPlant(ctx,set,CARD_W,CARD_H,step);
    snd('pip');  /* one more layer of somebody else's secret */
    if(step<sorted.length) setTimeout(grow,RM?0:per);
    else plate();
  }
  function plate(){
    snd('chime');  /* it has a name now */
    var lines='';
    if(hk) lines='<div class="mg-haiku">'+esc(hk.line1)+'<br>'+esc(hk.line2)+'<br>'+esc(hk.line3)+'</div>';
    var by=[]; for(var i=0;i<set.length;i++) by.push(set[i].by);
    $('mg-plate').innerHTML='<div class="mg-name">'+esc(nm)+'</div>'+lines+
      '<div class="mg-by">grown by '+esc(by.join(', '))+'</div>';
  }
  if(RM){ paintPlant(ctx,set,CARD_W,CARD_H); plate(); } else setTimeout(grow,320);

  /* phones rebuild the identical picture from the same arrays, no image sent */
  PartyShell.setPhase('grow',{num:ri+1,total:ROUNDS,name:nm,haiku:hk,
    layers:set.map(function(x){return {zone:x.layer.zone,z:x.layer.z,st:x.st};}),
    mine:{}, palette:PAL, widths:WID});

  PartyShell.startTimer(T_GROW,null,function(){ ri++; phaseDraw(); });
}

function phaseGallery(){
  snd('fanfare');
  show('mg-gal');
  var html='';
  for(var i=0;i<plants.length;i++)
    html+='<div class="mg-frame"><canvas class="mg-thumb" data-i="'+i+'" width="450" height="600"></canvas>'+
          '<div class="mg-fname">'+esc(plants[i].name)+'</div></div>';
  $('mg-shelf').innerHTML=html;
  var cvs=$('mg-shelf').querySelectorAll('.mg-thumb');
  for(var c=0;c<cvs.length;c++){
    var idx=parseInt(cvs[c].getAttribute('data-i'),10);
    paintPlant(cvs[c].getContext('2d'),plants[idx].set,450,600);
  }
  var results={};
  for(var k=0;k<order.length;k++) results[order[k]]={score:plants.length,place:1};
  PartyShell.setPhase('gallery',{count:plants.length,
    names:plants.map(function(p){return p.name;})});
  PartyShell.gameComplete(results);
  $('mg-again').onclick=function(){ startGame(PartyShell.players()); };
  $('mg-other').onclick=function(){ PartyShell.backToPicker(); };
  $('mg-end').onclick=function(){ PartyShell.closeRoom(); };
}

/* read only state hook for the end to end driver */
window.__mgState=function(){ return {ri:ri,plants:plants.length,
  drew:Object.keys(strokes).length,assigned:Object.keys(assign).length}; };

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
