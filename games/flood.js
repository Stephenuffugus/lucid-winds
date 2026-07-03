// ═══ LUCID WINDS — Autumn Leaves (Flood Fill) ═══
// Full flesh-out pass 2026-07-03: size tiers (Cozy/Garden/Wild), best-moves per
// size, win streak, a daily seeded board, an animated flood that sweeps outward
// in waves, and a 3-star rating vs par. Same file powers the in-app GAME tab,
// the /play/ shell, and the portal.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,_st=G.st;

// ── one-time juice styles ──
if(!document.getElementById('ff-style')){
  var stl=document.createElement('style');stl.id='ff-style';
  stl.textContent='@keyframes ffPop{0%{transform:scale(1)}45%{transform:scale(1.16)}100%{transform:scale(1)}}'
    +'.ff-cell{will-change:transform}.ff-cell.ff-pop{animation:ffPop .22s ease}'
    +'@keyframes ffShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}'
    +'.ff-shake{animation:ffShake .4s ease}'
    +'.ff-seg{display:inline-flex;gap:0;border-radius:9px;overflow:hidden;border:1px solid rgba(122,179,86,.3);vertical-align:middle}'
    +'.ff-seg .ff-sb{padding:9px 12px;min-height:44px;min-width:46px;background:rgba(18,24,16,.6);color:#8a9178;border:none;font:inherit;font-size:.8rem;cursor:pointer}'
    +'.ff-seg .ff-sb.on{background:rgba(122,179,86,.32);color:#e8dcc8;font-weight:700}'
    +'.ff-hd{white-space:nowrap}';
  document.head.appendChild(stl);
}

function GFL(a){
  // Tiers scale BOTH size and colour count, so Cozy is genuinely easy and Wild is a
  // real test. cap = generous enough that a thoughtful player wins (streaks build);
  // par is the 3-star target so the best-score chase is where the skill lives.
  var SIZES=[
    {id:'cozy',   label:'Cozy',   n:9,  colors:4, par:11, cap:24},
    {id:'garden', label:'Garden', n:13, colors:5, par:22, cap:40},
    {id:'wild',   label:'Wild',   n:17, colors:6, par:34, cap:56}
  ];
  var CC=['#4a7c35','#C8A84B','#4a7aaa','#c76a30','#9b59b6','#c75050'];
  var LF=['assets/games/flood/leaf-sage.png','assets/games/flood/leaf-gold.png','assets/games/flood/leaf-slate.png','assets/games/flood/leaf-copper.png','assets/games/flood/leaf-plum.png','assets/games/flood/leaf-crimson.png'];

  var si=0;         // size index
  try{var s0=parseInt(localStorage.getItem('lw_flood_size'),10);if(s0>=0&&s0<SIZES.length)si=s0;}catch(e){}
  var daily=false, SZ=SIZES[si].n, grid=[], moves=0, over=false;
  var cells=[], swatches=[], flowTimers=[], flowGen=0;

  var leavesOn=true;
  try{leavesOn=localStorage.getItem('lw_flood_leaves')!=='off';}catch(e){}

  function tier(){ return daily?SIZES[1]:SIZES[si]; }
  function cap(){ return tier().cap; }
  function NC(){ return tier().colors; }

  // ── persistence helpers ──
  function bestKey(){ return 'lw_flood_best_'+(daily?'daily':SIZES[si].id); }
  function getBest(){ try{var v=parseInt(localStorage.getItem(bestKey()),10);return v>0?v:0;}catch(e){return 0;} }
  function setBest(m){ try{localStorage.setItem(bestKey(),String(m));}catch(e){} }
  function getStreak(){ try{return parseInt(localStorage.getItem('lw_flood_streak'),10)||0;}catch(e){return 0;} }
  function setStreak(v){ try{localStorage.setItem('lw_flood_streak',String(v));}catch(e){} }

  // ── daily seeded board ──
  function todayStr(){ var t=new Date(); return t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate(); }
  function seedNum(){ var s=0,d=todayStr(); for(var i=0;i<d.length;i++) s=(s*31+d.charCodeAt(i))|0; return s>>>0; }
  function mkRng(seed){ var s=seed>>>0; return function(){ s=(s+0x6D2B79F5)|0; var t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
  function dailyDoneToday(){ try{var r=JSON.parse(localStorage.getItem('lw_flood_daily')||'{}');return r.d===todayStr()?r:null;}catch(e){return null;} }
  function markDaily(m){ try{localStorage.setItem('lw_flood_daily',JSON.stringify({d:todayStr(),m:m}));}catch(e){} }

  // ── header (built ONCE; spans updated in place) ──
  ms(a,'<span class="ff-hd">Moves <strong id="FFm">0</strong>/<span id="FFcap">'+cap()+'</span></span>'
    +' · <span class="ff-hd" id="FFmode">Best <strong id="FFbest">—</strong></span>'
    +' · <span class="ff-hd">🔥<strong id="FFstreak">0</strong></span>');
  mm(a);
  function setTxt(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; }
  function updateHeader(){
    setTxt('FFm',moves); setTxt('FFcap',cap());
    var b=getBest(); setTxt('FFbest', b?b:'—'); setTxt('FFstreak',getStreak());
    var mEl=document.getElementById('FFm');
    if(mEl) mEl.style.color=(cap()-moves)<=3?'#c75050':'';
    var modeEl=document.getElementById('FFmode');
    if(modeEl){ modeEl.style.color=daily?'#C8A84B':''; }
  }

  // ── board DOM ──
  var gd=document.createElement('div');gd.className='lg';gd.id='FFg';a.appendChild(gd);
  var pb=document.createElement('div');pb.className='lg';pb.style.gridTemplateColumns='repeat(6,1fr)';pb.style.gap='8px';pb.style.padding='12px';pb.style.width='clamp(300px,92vw,420px)';a.appendChild(pb);

  function cellBg(idx){ var color=CC[grid[idx]]; return leavesOn?('url('+LF[grid[idx]]+') center/cover '+color):color; }

  function buildGrid(){
    clearFlow();
    gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';
    gd.style.gap=SZ>14?'1px':'2px';
    gd.style.width='clamp(300px,92vw,'+(SZ>14?460:420)+'px)';
    gd.innerHTML=''; cells=[];
    for(var i=0;i<SZ*SZ;i++){
      var d=document.createElement('div');d.className='lc ff-cell';
      d.style.transition='transform .18s ease';
      d.style.background=cellBg(i);
      gd.appendChild(d); cells.push(d);
    }
  }
  function buildPad(){
    pb.innerHTML=''; swatches=[];
    pb.style.gridTemplateColumns='repeat('+NC()+',1fr)';
    for(var j=0;j<NC();j++){
      (function(c){
        var b=document.createElement('div');b.className='lc'+(grid[0]===c?' lo':'');
        b.style.minHeight='44px';
        b.style.background=leavesOn?('url('+LF[c]+') center/cover '+CC[c]):CC[c];
        b.onclick=function(){ pick(c); };
        pb.appendChild(b); swatches.push(b);
      })(j);
    }
  }
  function paintPad(){ for(var j=0;j<NC();j++){ if(swatches[j]) swatches[j].className='lc'+(grid[0]===j?' lo':''); } }

  // ── flood with BFS depth, so the fill can sweep outward in waves ──
  function floodFill(nc){
    var oc=grid[0], changed=[];
    if(oc===nc) return changed;
    var vis=[]; for(var x=0;x<SZ*SZ;x++) vis.push(false);
    var q=[{i:0,d:0}];
    while(q.length){
      var node=q.shift(), i=node.i, dp=node.d;
      if(i<0||i>=SZ*SZ||vis[i]) continue;
      if(grid[i]!==oc&&grid[i]!==nc) continue;
      vis[i]=true;
      if(grid[i]===oc){ grid[i]=nc; changed.push({i:i,d:dp}); }
      var r=Math.floor(i/SZ),c=i%SZ;
      if(r>0)q.push({i:i-SZ,d:dp+1}); if(r<SZ-1)q.push({i:i+SZ,d:dp+1});
      if(c>0)q.push({i:i-1,d:dp+1}); if(c<SZ-1)q.push({i:i+1,d:dp+1});
    }
    return changed;
  }
  function clearFlow(){ for(var k=0;k<flowTimers.length;k++) clearTimeout(flowTimers[k]); flowTimers=[]; }
  function paintWave(changed){
    flowGen++; var gen=flowGen;
    for(var k=0;k<changed.length;k++){
      (function(ch){
        var t=setTimeout(function(){
          if(gen!==flowGen) return;
          var cell=cells[ch.i]; if(!cell) return;
          cell.style.background=cellBg(ch.i);
          cell.classList.remove('ff-pop'); void cell.offsetWidth; cell.classList.add('ff-pop');
        }, ch.d*11);
        flowTimers.push(t);
      })(changed[k]);
    }
  }

  function pick(c){
    if(over||grid[0]===c) return;
    _play('tap');
    var changed=floodFill(c); moves++;
    setTxt('FFm',moves);
    var mEl=document.getElementById('FFm'); if(mEl) mEl.style.color=(cap()-moves)<=3?'#c75050':'';
    paintWave(changed); paintPad();
    var done=true; var g0=grid[0];
    for(var i=0;i<grid.length;i++){ if(grid[i]!==g0){ done=false; break; } }
    if(done) win();
    else if(moves>=cap()) lose();
  }

  function win(){
    over=true;
    var S=tier();
    var st3=moves<=S.par?3:(moves<=S.par+Math.ceil((S.cap-S.par)/2)?2:1);
    var prev=getBest(), isBest=(prev===0||moves<prev);
    if(isBest) setBest(moves);
    var streak=getStreak()+1; setStreak(streak);
    if(daily) markDaily(moves);
    updateHeader();
    _e('game_win'); _playWin();
    var stars=''; for(var k=0;k<3;k++) stars+=(k<st3?'★':'☆');
    sm(stars+'  '+(daily?'Daily ':'')+'flooded in '+moves+(isBest?'  ·  NEW BEST!':'  ·  best '+getBest())+'   🔥'+streak);
    _sr('flood',{w:true,s:Math.max(1,S.cap-moves)});
  }
  function lose(){
    over=true; setStreak(0); updateHeader();
    _e('game_loss'); _play('lose');
    gd.classList.remove('ff-shake'); void gd.offsetWidth; gd.classList.add('ff-shake');
    sm('Out of moves — the leaves scattered. Tap NEW to try again');
    _sr('flood',{w:false,s:0});
  }

  // ── new game / mode switches ──
  function newGame(){
    clearFlow();
    var rng = daily ? mkRng(seedNum()) : Math.random;
    SZ=tier().n; var nc=NC(); grid=[]; for(var i=0;i<SZ*SZ;i++) grid.push(Math.floor(rng()*nc));
    moves=0; over=false;
    buildGrid(); buildPad(); updateHeader();
    _st();  // start the shell timer + anti-farm clock
    if(daily){ var dd=dailyDoneToday(); sm(dd?('Today’s garden — your best was '+dd.m+' moves'):'Today’s garden. Everyone plays this exact board.'); }
    else sm('');
  }
  function setSize(idx){
    if(daily) return; si=idx; try{localStorage.setItem('lw_flood_size',String(si));}catch(e){}
    if(sizeSeg) for(var k=0;k<sizeSeg.children.length;k++) sizeSeg.children[k].className='ff-sb'+(k===si?' on':'');
    newGame();
  }
  function toggleDaily(){
    daily=!daily; dailyBtn.textContent=daily?'📅 Daily ✓':'📅 Daily';
    dailyBtn.style.color=daily?'#C8A84B':'';
    if(sizeSeg) sizeSeg.style.opacity=daily?'.4':'1';
    newGame();
  }
  function toggleLeaves(){
    leavesOn=!leavesOn; try{localStorage.setItem('lw_flood_leaves',leavesOn?'on':'off');}catch(e){}
    leafBtn.textContent=leavesOn?'🍂 Leaves':'⬤ Plain';
    for(var i=0;i<cells.length;i++) cells[i].style.background=cellBg(i);
    buildPad();
  }

  // ── controls ──
  var cr=mc(a);
  var newBtn=document.createElement('button');newBtn.className='gb-new';newBtn.innerHTML='<img src="assets/games/new-game-btn.png" alt="New Game">';newBtn.onclick=newGame;
  var sizeSeg=document.createElement('div');sizeSeg.className='ff-seg';
  for(var z=0;z<SIZES.length;z++){(function(idx){var sb=document.createElement('button');sb.className='ff-sb'+(idx===si?' on':'');sb.textContent=SIZES[idx].label;sb.onclick=function(){setSize(idx);};sizeSeg.appendChild(sb);})(z);}
  var dailyBtn=document.createElement('button');dailyBtn.className='gb';dailyBtn.textContent='📅 Daily';dailyBtn.onclick=toggleDaily;
  var leafBtn=document.createElement('button');leafBtn.className='gb';leafBtn.textContent=leavesOn?'🍂 Leaves':'⬤ Plain';leafBtn.onclick=toggleLeaves;
  cr.appendChild(newBtn); cr.appendChild(sizeSeg); cr.appendChild(dailyBtn); cr.appendChild(leafBtn);

  newGame();
}

window._gameFns.flood=GFL;
})();
