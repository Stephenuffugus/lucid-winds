/* MOONGRAFT, host screen.

   Three plants. For each one every player is handed a different part, draws it blind on their phone, and the room
   watches the parts assemble. Then the plant gets a Lucid Winds name and a Lucid Winds haiku, and everybody can save
   the card.

   ⭐ NO SCORES, NO VOTING, NO LOSERS. This is the one title in the pack where nothing is a competition, and that is
   deliberate: a party needs somewhere for the person who does not want to be quizzed. The artifact is the reward.

   ⭐ THE POEM AND THE NAME ARE THE REAL ONES. word-banks.js is the same file Lucid Winds ships, and the selection maths
   below is lifted from getHaiku and getPlantName, so a Moongraft card reads exactly like a greenhouse card. The hash is
   made from the drawing itself, so the same plant always gets the same name and poem. (It is NOT a promise that every
   plant gets a poem nobody else has: a finite bank repeats, and Astra's review rightly cut that claim.)

   W3 (18 Oct 2026, Astra B5): one shared renderer for TV, phones and the saved card (render.js); a neutral connector
   stem when nobody draws the stem (D01); strokes carry a revision and are acknowledged, a reloaded phone gets its
   accepted drawing back (D02); Done for now with an honest three second finish, roles rotate across the three plants
   (D03); every phone can save a clean PNG card, the host can remove a card before anyone saves it (D04, SHELL-D10);
   prompt variants are pickable per role without new layers (D05, no variants live yet); no TV mode.

   ⛔ Strokes travel as quantised integer point arrays, never images. A picture over the transport would be tens of
   kilobytes per player per round, and the phones rebuild the identical composite from the same arrays. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

/* the shared renderer is its own file; boot once it is here (same ?v= as this module, so the pair never mismatch) */
var MY_V=((document.currentScript&&/[?&]v=([^&]+)/.exec(document.currentScript.src))||[])[1]||'';
function needRender(cb){
  if(window.MoongraftRender){ cb(); return; }
  var s=document.createElement('script');
  s.src='games/moongraft/render.js'+(MY_V?'?v='+MY_V:'');
  s.onload=cb;
  s.onerror=function(){ cb(); };
  document.head.appendChild(s);
}

needRender(function(){
var R=window.MoongraftRender;

function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }
function psym(pid){ try{ return PartyShell.symbolFor?PartyShell.symbolFor(pid):'●'; }catch(e){ return '●'; } }
function host(list){ try{ if(PartyShell.hostActions) PartyShell.hostActions(list); }catch(e){} }
var LAYERS=window.MOONGRAFT_LAYERS||[], VARIANTS=window.MOONGRAFT_VARIANTS||[],
    PAL=window.MOONGRAFT_PALETTE||['#e8dcc8'], WID=window.MOONGRAFT_WIDTHS||[3,7,14];
var CARD_W=900, CARD_H=1200, ROUNDS=3;

var root=$('game-root');
root.innerHTML=
 '<div class="mg-screen" id="mg-rules"><div class="mg-timer" id="mg-rt"></div>'+
 '<div class="mg-rules">Each person draws one secret part of our plant.\n\nDraw your part any way you like. The others stay hidden.\n\nWhen time runs out, we put every part together.\n\nThere are no scores. Everyone can save the finished card.</div>'+
 '<button class="ps-btn" id="mg-next" style="margin-top:34px">Next</button></div>'+

 '<div class="mg-screen" id="mg-draw"><div class="mg-timer" id="mg-dt"></div>'+
 '<div class="mg-num" id="mg-dn"></div>'+
 '<div class="mg-head">Our plant is taking shape</div>'+
 '<div class="mg-assign" id="mg-assign"></div>'+
 '<div class="mg-in" id="mg-din"></div>'+
 '<div class="mg-allset" id="mg-allset"></div></div>'+

 '<div class="mg-screen" id="mg-grow"><div class="mg-num" id="mg-gn"></div>'+
 /* the plant and its name side by side: stacked, a 720p TV cut the heading off the top and the poem off the bottom */
 '<div class="mg-growrow"><div class="mg-stage"><canvas id="mg-canvas" width="'+CARD_W+'" height="'+CARD_H+'"></canvas></div>'+
 '<div class="mg-plate" id="mg-plate"></div></div></div>'+

 '<div class="mg-screen mg-gallery" id="mg-gal"><div class="mg-num">The moon garden</div>'+
 '<div class="mg-shelf" id="mg-shelf"></div>'+
 '<div class="mg-earn">Our garden is ready. Save your cards on your phones.</div>'+
 '<div class="mg-btnrow">'+
 '<button class="ps-btn" id="mg-again">Grow more</button>'+
 '<button class="ps-btn ghost" id="mg-other">Another game</button>'+
 '<button class="ps-btn ghost" id="mg-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.mg-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var names={}, order=[], turnOrder=[], ri=0, assign={}, strokes={}, revs={}, done={}, plants=[], gid='';
var finishing=false, drawStart=0;
var FAST=/[?&]mg_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_DRAW=FAST?8:80, T_GROW=FAST?4:15, T_FINISH=FAST?1:3, MIN_DRAW=FAST?2:15;
var RM=false; try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}

function present(){ try{ return PartyShell.presentPlayers(); }catch(e){ return order.slice(); } }

/* ---------- name and poem, same maths the greenhouse uses ---------- */
function hashOf(str){
  /* a stable 64 hex char digest of the drawing: the same plant always gets the same name and poem */
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
/* the poem and the name come from the SAME file Lucid Winds ships, loaded on the host only (the phones get the
   finished words in the card). If it has not arrived, the card still renders and simply carries no poem. */
(function(){
  if(window._LW_BANKS) return;
  var s=document.createElement('script');
  s.src='/word-banks.js'; s.async=true;
  s.onerror=function(){};
  document.head.appendChild(s);
})();
function banks(){ return window._LW_BANKS||null; }
function plantName(h){
  var B=banks(); if(!B) return 'Our moon plant';
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

/* ---------- parts ---------- */
/* D05: a variant (key "<base>_rNNN") changes only the brief and the hint. The zone, the paint order and the
   assignment priority always come from the base part, so a variant can never move a piece or hand someone two. */
function baseOf(key){ return String(key).split('_r')[0]; }
function withVariant(L){
  var pool=[],i;
  for(i=0;i<VARIANTS.length;i++) if(baseOf(VARIANTS[i].key)===L.key) pool.push(VARIANTS[i]);
  if(!pool.length) return L;
  var pick=Math.floor(Math.random()*(pool.length+1));
  if(pick===pool.length) return L;              /* the base brief stays in the mix */
  var v=pool[pick];
  return {key:L.key, variant:v.key, z:L.z, zone:L.zone, brief:v.brief||L.brief, hint:v.hint||L.hint};
}
/* every player draws exactly one part, the part set grows with the room (three get pot, bloom and leaves; eight get
   all eight), and the roles ROTATE across the three plants so nobody draws the same part twice (D03) */
function partsFor(n){ return LAYERS.slice(0,Math.max(1,Math.min(n,LAYERS.length))); }
function assignFor(players,round){
  var pool=partsFor(players.length), out={};
  for(var k=0;k<players.length;k++) out[players[k]]=pool[(k+round)%pool.length];
  return out;
}

/* Which assigned part abuts this one, above and below, and WHERE on the shared edge (D01). Naming the neighbour is
   the whole difference between a plant and three floating shapes: told that the pot is just under your edge, a person
   draws their part DOWN to that edge. It leaks a word, never a picture, so the drawing stays blind. The x is where to
   meet, in the phone canvas's own 0..1: the plant's spine when it crosses this part, otherwise the middle of the
   overlap with the neighbour. */
function joinX(L,O){
  var lx=L.zone[0], lw=L.zone[2];
  if(R && R.SPINE_X>=lx && R.SPINE_X<=lx+lw) return Math.round(((R.SPINE_X-lx)/lw)*1000)/1000;
  var a=Math.max(lx,O.zone[0]), b=Math.min(lx+lw,O.zone[0]+O.zone[2]);
  return Math.round((((a+b)/2-lx)/lw)*1000)/1000;
}
function neighbours(L,set){
  var mineTop=L.zone[1], mineBot=L.zone[1]+L.zone[3], out={above:null,below:null,ax:0.5,bx:0.5};
  var bestA=9, bestB=9, k;
  for(k in set){
    var O=set[k]; if(!O||O.key===L.key) continue;
    var oTop=O.zone[1], oBot=O.zone[1]+O.zone[3];
    /* horizontal overlap, or it is not really a neighbour */
    var ox=Math.min(L.zone[0]+L.zone[2],O.zone[0]+O.zone[2])-Math.max(L.zone[0],O.zone[0]);
    if(ox<=0.04) continue;
    var dA=Math.abs(oBot-mineTop);
    if(oTop<mineTop&&dA<0.22&&dA<bestA){ bestA=dA; out.above=O.key; out.ax=joinX(L,O); }
    var dB=Math.abs(oTop-mineBot);
    if(oBot>mineBot&&dB<0.22&&dB<bestB){ bestB=dB; out.below=O.key; out.bx=joinX(L,O); }
  }
  return out;
}
function layerMsg(pid){
  var L=assign[pid], nb=neighbours(L,assign);
  return {t:'layer',g:gid,r:ri+1,key:L.key,part:R?R.partName(L.key):L.key,brief:L.brief,hint:L.hint,
    aspect:(L.zone[2]*CARD_W)/(L.zone[3]*CARD_H),palette:PAL,widths:WID,
    above:nb.above,below:nb.below,ax:nb.ax,bx:nb.bx,
    aboveName:nb.above&&R?R.partName(nb.above):nb.above, belowName:nb.below&&R?R.partName(nb.below):nb.below,
    /* D02: what the room has ACCEPTED from this phone, so a reloaded phone can have it back */
    st:strokes[pid]||[], rev:revs[pid]||0};
}

/* ---------- strokes, done, and the honest finish ---------- */
function eligible(){
  var here=present(), out=[];
  for(var i=0;i<order.length;i++) if(assign[order[i]]&&here.indexOf(order[i])>=0) out.push(order[i]);
  return out;
}
function startedCount(){ var n=0,k; for(k in strokes) if(strokes[k]&&strokes[k].length&&assign[k]) n++; return n; }
function paintProgress(){
  var el=eligible();
  $('mg-din').textContent=startedCount()+' of '+el.length+' '+(el.length===1?'person has':'people have')+' started drawing';
}
function draftData(){
  var el=eligible();
  return {g:gid,num:ri+1,total:ROUNDS,started:startedCount(),eligible:el.length,finishing:finishing};
}
function checkAllDone(){
  if(finishing||!$('mg-draw').classList.contains('on')) return;
  var el=eligible(); if(!el.length) return;
  for(var i=0;i<el.length;i++) if(!done[el[i]]) return;
  var waited=(Date.now()-drawStart)/1000;
  if(waited<MIN_DRAW){ setTimeout(checkAllDone,(MIN_DRAW-waited)*1000+50); return; }
  /* SHELL-D04: everybody has said Done for now. Say so, give three seconds, and never restart that countdown */
  finishing=true;
  $('mg-allset').textContent='All set. Finishing soon.';
  PartyShell.setPhase('draw',draftData());
  PartyShell.startTimer(T_FINISH,function(s){ var t=$('mg-dt'); t.textContent=s; t.classList.add('low'); },phaseGrow);
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='resend'&&assign[pid]){
    /* a rejoined phone has no brief: hand it the same part again, with everything it had already drawn */
    PartyShell.sendToPlayer(pid,layerMsg(pid));
    return;
  }
  if(msg.t==='art'&&msg.g===gid&&msg.r===ri+1&&assign[pid]&&$('mg-draw').classList.contains('on')){
    var rev=msg.rev|0;
    /* D02: the newest revision wins; a late or duplicated packet can never bring back an undone line */
    if(rev>=(revs[pid]||0)){
      revs[pid]=rev;
      strokes[pid]=Array.isArray(msg.s)?msg.s.slice(0,220):[];
    }
    PartyShell.sendToPlayer(pid,{t:'artack',g:gid,r:ri+1,rev:revs[pid]});
    paintProgress();
    /* the public count goes out as a light message, not a whole new phase */
    PartyShell.broadcast({t:'progress',g:gid,r:ri+1,started:startedCount(),eligible:eligible().length});
    return;
  }
  if(msg.t==='done'&&msg.g===gid&&msg.r===ri+1&&assign[pid]){
    done[pid]=!!msg.v;
    checkAllDone();
    return;
  }
  /* SHELL-D10: only the host's own seat may take a card off the shelf (no TV mode); on a big screen the
     TV's own Remove buttons do it */
  if(msg.t==='discard'&&PartyShell.seatId&&pid===PartyShell.seatId()){ discard(msg.num); return; }
});

function startGame(players){
  names={}; order=[]; plants=[]; ri=0;
  gid=String(Date.now())+Math.floor(Math.random()*1000);
  for(var i=0;i<players.length;i++){ names[players[i].id]=players[i].name; order.push(players[i].id); }
  turnOrder=order.slice();
  for(var a=turnOrder.length-1;a>0;a--){ var j=Math.floor(Math.random()*(a+1)); var t=turnOrder[a]; turnOrder[a]=turnOrder[j]; turnOrder[j]=t; }
  phaseRules();
}

function phaseRules(){
  show('mg-rules');
  PartyShell.setPhase('rules',{total:ROUNDS});
  PartyShell.startTimer(T_RULES,function(s){$('mg-rt').textContent=s;},phaseDraw);
  $('mg-next').onclick=function(){ PartyShell.stopTimer(); phaseDraw(); };
  host([{label:'Start now',fn:function(){ PartyShell.stopTimer(); phaseDraw(); }}]);
}

function phaseDraw(){
  host([]);
  if(ri>=ROUNDS){ phaseGallery(); return; }
  strokes={}; revs={}; done={}; finishing=false; drawStart=Date.now();
  var base=assignFor(turnOrder,ri); assign={};
  for(var k0 in base) assign[k0]=withVariant(base[k0]);
  show('mg-draw');
  $('mg-dn').textContent='PLANT '+(ri+1)+' OF '+ROUNDS;
  $('mg-allset').textContent='';
  paintProgress();
  /* the room sees WHO is drawing, never WHAT: the blindness is the game */
  var html='';
  for(var i=0;i<order.length;i++)
    html+='<span class="mg-chip" style="border-color:'+pcol(order[i])+'"><i style="color:'+
      pcol(order[i])+'">'+esc(psym(order[i]))+'</i>'+esc(names[order[i]])+'</span>';
  $('mg-assign').innerHTML=html;

  for(var k=0;k<order.length;k++) if(assign[order[k]]) PartyShell.sendToPlayer(order[k],layerMsg(order[k]));
  PartyShell.setPhase('draw',draftData());
  PartyShell.startTimer(T_DRAW,function(s){ var t=$('mg-dt'); t.textContent=s; t.classList.toggle('low',s<=10); },phaseGrow);
}

/* the canonical card: everything a phone needs to paint the same picture, and nothing it should not keep */
function cardOf(set,nm,hk,num,by){
  return {v:R?R.VERSION:'', num:num, name:nm, haiku:hk, palette:PAL, widths:WID, W:CARD_W, H:CARD_H, by:by,
    layers:set.map(function(x){ return {key:x.layer.key, zone:x.layer.zone, z:x.layer.z, st:x.st}; })};
}

function phaseGrow(){
  PartyShell.stopTimer();
  var set=[];
  for(var i=0;i<order.length;i++){
    var pid=order[i], L=assign[pid];
    if(!L) continue;
    /* only what the room accepted; an untouched part stays blank (the connector covers a blank stem) */
    set.push({layer:L, st:strokes[pid]||[], by:names[pid]});
  }
  var sig=''; for(var s=0;s<set.length;s++){
    sig+=set[s].layer.key+':';
    var st=set[s].st;
    for(var t=0;t<st.length;t++){ sig+=st[t].c+','+st[t].w+','+st[t].p.length+','+(st[t].p[0]||0)+';'; }
  }
  var hash=hashOf(sig+'|'+ri+'|'+order.length);
  var nm=plantName(hash), hk=haikuOf(hash);
  var by=[]; for(var b=0;b<set.length;b++) by.push(set[b].by);
  var card=cardOf(set,nm,hk,ri+1,by);
  plants.push({card:card,hash:hash,removed:false});

  show('mg-grow');
  $('mg-gn').textContent='PLANT '+(ri+1)+' OF '+ROUNDS;
  $('mg-plate').innerHTML='';
  var cv=$('mg-canvas'), ctx=cv.getContext('2d');

  /* it assembles a part at a time, which is the whole payoff of drawing blind; the phones run the same schedule */
  var n=R?R.steps(card).length:set.length, step=0;
  var per=Math.max(220,Math.floor((T_GROW*1000*0.40)/Math.max(1,n))), lead=320;
  if(R) R.paint(ctx,card,CARD_W,CARD_H,0);
  function grow(){
    step++;
    if(R) R.paint(ctx,card,CARD_W,CARD_H,step);
    snd('pip');  /* one more part of somebody else's secret */
    if(step<n) setTimeout(grow,RM?0:per);
    else plate();
  }
  function plate(){
    snd('chime');  /* it has a name now */
    var lines='';
    if(hk) lines='<div class="mg-haiku">'+esc(hk.line1)+'<br>'+esc(hk.line2)+'<br>'+esc(hk.line3)+'</div>';
    $('mg-plate').innerHTML='<div class="mg-name">'+esc(nm)+'</div>'+lines+
      '<div class="mg-by">Grown together by '+esc(by.join(', '))+'</div>';
  }
  if(RM){ if(R) R.paint(ctx,card,CARD_W,CARD_H); plate(); } else setTimeout(grow,lead);

  /* phones rebuild the identical picture from the same arrays, no image sent */
  PartyShell.setPhase('grow',{num:ri+1,total:ROUNDS,card:card,per:per,lead:lead});
  PartyShell.startTimer(T_GROW,null,function(){ ri++; phaseDraw(); });
}

function shelfCards(){ var out=[]; for(var i=0;i<plants.length;i++) if(!plants[i].removed) out.push(plants[i].card); return out; }
function paintShelf(){
  var html='';
  for(var i=0;i<plants.length;i++){
    if(plants[i].removed) continue;
    html+='<div class="mg-frame"><canvas class="mg-thumb" data-i="'+i+'" width="450" height="600"></canvas>'+
          '<div class="mg-fname">'+esc(plants[i].card.name)+'</div>'+
          '<button class="ps-btn ghost mg-remove" data-i="'+i+'">Remove</button></div>';
  }
  if(!html) html='<div class="mg-fname">Every card was removed.</div>';
  $('mg-shelf').innerHTML=html;
  var cvs=$('mg-shelf').querySelectorAll('.mg-thumb');
  for(var c=0;c<cvs.length;c++){
    var idx=parseInt(cvs[c].getAttribute('data-i'),10);
    if(R) R.paint(cvs[c].getContext('2d'),plants[idx].card,450,600);
  }
  var rm=$('mg-shelf').querySelectorAll('.mg-remove');
  for(var r=0;r<rm.length;r++) rm[r].onclick=function(){ discard(plants[parseInt(this.getAttribute('data-i'),10)].card.num); };
}
/* SHELL-D10: a card that should not leave the room comes off every shelf, the phones' included */
function discard(num){
  var hit=false;
  for(var i=0;i<plants.length;i++) if(plants[i].card.num===num&&!plants[i].removed){ plants[i].removed=true; hit=true; }
  if(!hit) return;
  paintShelf();
  PartyShell.setPhase('gallery',{cards:shelfCards(),total:plants.length});
}

function phaseGallery(){
  snd('fanfare');
  show('mg-gal');
  paintShelf();
  var results={};
  for(var k=0;k<order.length;k++) results[order[k]]={score:plants.length,place:1};
  PartyShell.setPhase('gallery',{cards:shelfCards(),total:plants.length});
  PartyShell.gameComplete(results);
  $('mg-again').onclick=function(){ startGame(PartyShell.players()); };
  $('mg-other').onclick=function(){ PartyShell.backToPicker(); };
  $('mg-end').onclick=function(){ PartyShell.closeRoom(); };
  host([{label:'Grow more',fn:function(){ startGame(PartyShell.players()); }},
        {label:'Another game',ghost:true,fn:function(){ PartyShell.backToPicker(); }},
        {label:'End night',ghost:true,fn:function(){ PartyShell.closeRoom(); }}]);
}

/* read only state hook for the end to end driver and the rules test (lower case: upper case window names are banks) */
window.__mgState=function(){ return {ri:ri,plants:plants.length,
  drew:Object.keys(strokes).length,assigned:Object.keys(assign).length,finishing:finishing,
  done:Object.keys(done).filter(function(k){return done[k];}).length,
  cards:plants.map(function(p){return p.card;}), assign:(function(){ var o={},k; for(k in assign) o[k]=assign[k].key; return o; })(),
  counts:(function(){ var o={},k; for(k in strokes) o[k]=(strokes[k]||[]).length; return o; })(), revs:revs, gid:gid}; };
window.__moongraft={assignFor:assignFor, partsFor:partsFor, neighbours:neighbours, withVariant:withVariant};

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
});
})();
