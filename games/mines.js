// ═══ LUCID WINDS — Minesweeper (Root Rot) ═══
// Flesh-out 2026-07-03: 3 square difficulties, stat bar above the board, a timer that
// starts on your first tap, best-TIME per difficulty, win streak, a daily seeded board,
// CHORDING (tap a satisfied number to open its neighbours), LONG-PRESS to flag, a
// staggered reveal cascade + mine-hit shake, and matching styled controls. One file →
// in-app GAME tab, /play/ shell, and portal.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,_st=G.st,_setDiff=G.setDiff;

if(!document.getElementById('mn-style')){
  var stl=document.createElement('style');stl.id='mn-style';
  stl.textContent='@keyframes mnPop{from{transform:scale(.55);opacity:.2}to{transform:scale(1);opacity:1}}'
    +'.mn-pop{animation:mnPop .2s ease both}'
    +'@keyframes mnShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}'
    +'.mn-shake{animation:mnShake .4s ease}'
    +'.mn-stats{display:flex;gap:18px;justify-content:center;align-items:center;flex-wrap:wrap;padding:10px 8px 4px;font-family:"DM Mono",monospace;font-size:clamp(.85rem,3.6vw,1.05rem);color:#e8dcc8;letter-spacing:.03em}'
    +'.mn-stats b{color:#C8A84B;font-weight:700}'
    +'.mn-seg{display:inline-flex;border-radius:9px;overflow:hidden;border:1px solid rgba(122,179,86,.3)}'
    +'.mn-seg .mn-sb{padding:9px 12px;min-height:48px;min-width:52px;background:rgba(18,24,16,.6);color:#8a9178;border:none;font:inherit;font-size:.8rem;cursor:pointer}'
    +'.mn-seg .mn-sb.on{background:rgba(122,179,86,.32);color:#e8dcc8;font-weight:700}'
    +'.mn-btn{min-width:clamp(110px,30vw,140px);min-height:56px;padding:10px 14px;border-radius:16px;border:2px solid rgba(122,179,86,.32);background:linear-gradient(160deg,rgba(32,40,27,.96),rgba(17,23,15,.96));color:#e8dcc8;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;font-family:"DM Mono",monospace;box-shadow:0 3px 8px rgba(0,0,0,.3),inset 0 1px 0 rgba(200,168,75,.08);-webkit-tap-highlight-color:transparent;transition:transform .15s}'
    +'.mn-btn.on{border-color:#C8A84B;background:rgba(200,168,75,.14)}'
    +'.mn-btn .ic{font-size:1.4rem;line-height:1}.mn-btn .lb{font-size:.72rem;letter-spacing:.05em;opacity:.9}'
    +'.mn-btn:active{transform:scale(.95)}'
    +'.mn-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;padding:6px 0}';
  document.head.appendChild(stl);
}

function GN(a){
  var DIFFS=[
    {id:'easy',   label:'Easy',   n:8,  mines:10},
    {id:'medium', label:'Medium', n:12, mines:26},
    {id:'hard',   label:'Hard',   n:16, mines:50}
  ];
  var di=0; try{var d0=parseInt(localStorage.getItem('lw_mines_diff'),10);if(d0>=0&&d0<DIFFS.length)di=d0;}catch(e){}
  var daily=false, N=DIFFS[di].n, mn=DIFFS[di].mines;
  var bd=[], over=false, firstClick=true, flagMode=false, rv=0, fg=0, sf=0, started=false;
  var startAt=0, elapsed=0, timerIv=0, revSeq=[];

  function diff(){ return daily?DIFFS[1]:DIFFS[di]; }
  function ix(r,c){ return r*N+c; }

  // ── persistence ──
  function btKey(){ return 'lw_mines_bt_'+(daily?'daily':DIFFS[di].id); }
  function getBT(){ try{var v=parseFloat(localStorage.getItem(btKey()));return v>0?v:0;}catch(e){return 0;} }
  function setBT(t){ try{localStorage.setItem(btKey(),String(t));}catch(e){} }
  function getStreak(){ try{return parseInt(localStorage.getItem('lw_mines_streak'),10)||0;}catch(e){return 0;} }
  function setStreak(v){ try{localStorage.setItem('lw_mines_streak',String(v));}catch(e){} }
  function todayStr(){ var t=new Date(); return t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate(); }
  function seedNum(){ var s=0,d='mn'+todayStr(); for(var i=0;i<d.length;i++) s=(s*31+d.charCodeAt(i))|0; return s>>>0; }
  function mkRng(seed){ var s=seed>>>0; return function(){ s=(s+0x6D2B79F5)|0; var t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
  function dailyDone(){ try{var r=JSON.parse(localStorage.getItem('lw_mines_daily')||'{}');return r.d===todayStr()?r:null;}catch(e){return null;} }
  function markDaily(t,w){ try{localStorage.setItem('lw_mines_daily',JSON.stringify({d:todayStr(),t:Math.round(t),w:!!w}));}catch(e){} }

  // ── timer ──
  function fmt(s){ var m=Math.floor(s/60),ss=Math.floor(s%60); return m+':'+(ss<10?'0':'')+ss; }
  function stopTimer(){ if(timerIv){ clearInterval(timerIv); timerIv=0; } }
  function beginPlay(){
    if(started) return; started=true; _st(); startAt=Date.now(); stopTimer();
    timerIv=setInterval(function(){
      if(!a.isConnected){ stopTimer(); return; }
      if(over) return;
      elapsed=(Date.now()-startAt)/1000; setTxt('Ntime',fmt(elapsed));
    },500);
  }

  // ── stat bar ABOVE the board ──
  var stats=document.createElement('div'); stats.className='mn-stats';
  stats.innerHTML='<span>🦠 <b id="Nn">'+mn+'</b></span><span>⏱ <b id="Ntime">0:00</b></span><span>🔥 <b id="Nstreak">0</b></span>';
  a.appendChild(stats);
  function setTxt(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; }
  function minesLeft(){ return mn-fg; }
  function updateHeader(){ setTxt('Nn',minesLeft()); setTxt('Nstreak',getStreak()); }
  function idleMsg(){
    if(daily){ var dd=dailyDone(); sm(dd?(dd.w?('Daily cleared in '+fmt(dd.t)):'Daily: try again for a clean clear'):'Today’s field. Everyone plays the same mines.'); return; }
    var bt=getBT(); sm(bt?('Best time: '+fmt(bt)+' · long-press to flag'):'Tap to dig · long-press to flag');
  }

  // ── board ──
  var gd=document.createElement('div');gd.className='ng';gd.id='Ng';a.appendChild(gd);
  mm(a);

  function fitBoard(){
    var side='min(94vw, 56vh)';
    gd.style.width=side; gd.style.height=side; gd.style.margin='0 auto';
    gd.style.gridTemplateColumns='repeat('+N+',1fr)';
    gd.style.gridTemplateRows='repeat('+N+',1fr)';
  }
  function neigh(r,c,fn){ for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){ if(!dr&&!dc)continue; var nr=r+dr,nc=c+dc; if(nr>=0&&nr<N&&nc>=0&&nc<N) fn(nr,nc); } }

  function place(rng, ar, ac){
    var p=0, guard=0;
    while(p<mn && guard<20000){ guard++;
      var r=Math.floor(rng()*N), c=Math.floor(rng()*N);
      if(Math.abs(r-ar)<=1&&Math.abs(c-ac)<=1) continue;
      if(bd[ix(r,c)].m) continue;
      bd[ix(r,c)].m=true; p++;
    }
    for(var r2=0;r2<N;r2++)for(var c2=0;c2<N;c2++){ if(bd[ix(r2,c2)].m)continue; var n=0; neigh(r2,c2,function(nr,nc){ if(bd[ix(nr,nc)].m)n++; }); bd[ix(r2,c2)].a=n; }
  }

  function reveal(r,c){
    var x=bd[ix(r,c)]; if(x.rv||x.fl) return;
    x.rv=true; rv++; revSeq.push(ix(r,c));
    if(x.m){ x.ht=true; return; }              // hit — caller handles loss
    if(x.a===0) neigh(r,c,function(nr,nc){ reveal(nr,nc); });
  }
  function loseAt(){ over=true; stopTimer(); setStreak(0);
    for(var i=0;i<bd.length;i++){ if(bd[i].m) bd[i].sm=true; }
    _e('game_loss'); _play('lose');
    render(); gd.classList.remove('mn-shake'); void gd.offsetWidth; gd.classList.add('mn-shake');
    if(daily) markDaily(elapsed,false);
    updateHeader(); sm('🦠 Root rot. Tap NEW to try again'); _sr('mines',{w:false,s:rv});
  }
  function checkWin(){
    if(over) return; if(rv!==sf) return;
    over=true; stopTimer(); var tm=elapsed;
    var bt0=getBT(), isBest=(bt0===0||tm<bt0); if(isBest) setBT(tm);
    var streak=getStreak()+1; setStreak(streak);
    if(daily) markDaily(tm,true);
    updateHeader();
    _e('game_win'); _playWin();
    sm('🌿 Cleared in '+fmt(tm)+(isBest?'  ·  BEST TIME!':(getBT()?'  ·  best '+fmt(getBT()):''))+'   🔥'+streak);
    _sr('mines',{w:true,s:Math.max(1,sf-Math.floor(tm))});
  }

  // ── tap / chord / flag ──
  function toggleFlag(r,c){ var x=bd[ix(r,c)]; if(x.rv)return; x.fl=!x.fl; fg+=x.fl?1:-1; _play('snap'); setTxt('Nn',minesLeft()); render(); }
  function chord(r,c){
    var x=bd[ix(r,c)]; if(!x.rv||!x.a) return;
    var f=0; neigh(r,c,function(nr,nc){ if(bd[ix(nr,nc)].fl)f++; });
    if(f!==x.a) return;
    var hit=false; revSeq=[];
    neigh(r,c,function(nr,nc){ var y=bd[ix(nr,nc)]; if(!y.fl&&!y.rv){ reveal(nr,nc); if(y.m) hit=true; } });
    _play('dig'); if(hit){ loseAt(); return; } render(); checkWin();
  }
  function onTap(r,c){
    if(over) return;
    var x=bd[ix(r,c)];
    if(flagMode){ if(!x.rv) toggleFlag(r,c); return; }
    if(x.fl) return;
    if(x.rv){ chord(r,c); return; }
    beginPlay();
    if(firstClick && !daily){ place(Math.random, r, c); firstClick=false; }
    revSeq=[]; reveal(r,c); _play('dig');
    if(bd[ix(r,c)].ht){ loseAt(); return; }
    render(); checkWin();
  }

  // ── render ──
  function render(){
    gd.innerHTML='';
    for(var r=0;r<N;r++)for(var c=0;c<N;c++){
      var x=bd[ix(r,c)]; var d=document.createElement('div');
      d.setAttribute('data-r',r); d.setAttribute('data-c',c);
      if(x.rv){ d.className='nc '+(x.ht?'nb':'nr'+(x.a?' x'+x.a:'')); d.textContent=x.ht?'':(x.a||''); }
      else if(x.sm){ d.className='nc nb'; }
      else if(x.fl){ d.className='nc nf'; }
      else { d.className='nc nh'; }
      gd.appendChild(d);
    }
    // reveal cascade — stagger the freshly-opened cells
    for(var s=0;s<revSeq.length;s++){ var cell=gd.children[revSeq[s]]; if(cell){ cell.classList.add('mn-pop'); cell.style.animationDelay=Math.min(s*5,320)+'ms'; } }
    revSeq=[];
  }

  // ── input: tap = dig/chord/unflag, long-press = flag ──
  var lpTimer=0,lpCell=null,lpMoved=false,sx=0,sy=0,suppress=false;
  function cellOf(e){ var t=e.target; return (t&&t.closest)?t.closest('.nc'):null; }
  gd.addEventListener('pointerdown',function(e){
    var cell=cellOf(e); if(!cell) return; lpCell=cell; lpMoved=false; suppress=false; sx=e.clientX; sy=e.clientY;
    lpTimer=setTimeout(function(){
      if(lpMoved||over||flagMode) return;
      var r=+cell.getAttribute('data-r'), c=+cell.getAttribute('data-c'); var x=bd[ix(r,c)];
      if(!x.rv){ toggleFlag(r,c); suppress=true; if(navigator.vibrate)navigator.vibrate(15); }
    },430);
  });
  gd.addEventListener('pointermove',function(e){ if(lpCell && Math.hypot(e.clientX-sx,e.clientY-sy)>8) lpMoved=true; });
  function endLP(){ clearTimeout(lpTimer); }
  gd.addEventListener('pointerup',function(e){
    clearTimeout(lpTimer); var cell=cellOf(e);
    if(!cell||cell!==lpCell){ lpCell=null; return; }
    lpCell=null; if(suppress){ suppress=false; return; } if(lpMoved) return;
    onTap(+cell.getAttribute('data-r'), +cell.getAttribute('data-c'));
  });
  gd.addEventListener('pointercancel',endLP); gd.addEventListener('pointerleave',endLP);
  gd.addEventListener('contextmenu',function(e){ e.preventDefault(); });   // right-click won't pop a menu

  // ── new game / controls ──
  function newGame(){
    stopTimer(); revSeq=[]; started=false; elapsed=0; over=false; flagMode=false;
    N=diff().n; mn=diff().mines; sf=N*N-mn; rv=0; fg=0;
    bd=[]; for(var i=0;i<N*N;i++) bd.push({m:false,rv:false,fl:false,a:0,ht:false,sm:false});
    firstClick=true;
    if(daily){ place(mkRng(seedNum()), (N-1)/2|0, (N-1)/2|0); firstClick=false; }  // seeded, centre-safe
    fitBoard(); render();
    flagBtn.className='mn-btn'; setTxt('Ntime','0:00'); updateHeader(); idleMsg();
  }
  function setDiffIdx(idx){
    if(daily) return; di=idx; try{localStorage.setItem('lw_mines_diff',String(di));}catch(e){}
    _setDiff(idx===0?'easy':idx===1?'medium':'hard');
    for(var k=0;k<seg.children.length;k++) seg.children[k].className='mn-sb'+(k===di?' on':'');
    newGame();
  }
  function toggleDaily(){
    daily=!daily; dailyBtn.className='mn-btn'+(daily?' on':''); dailyBtn.querySelector('.lb').textContent=daily?'DAILY ✓':'DAILY';
    seg.style.opacity=daily?'.4':'1'; newGame();
  }
  function toggleFlagMode(){ flagMode=!flagMode; flagBtn.className='mn-btn'+(flagMode?' on':''); }

  var cr=mc(a); cr.style.display='flex'; cr.style.flexDirection='column'; cr.style.gap='10px'; cr.style.alignItems='center';
  var row1=document.createElement('div');row1.className='mn-row';
  var flagBtn=document.createElement('button');flagBtn.className='mn-btn';flagBtn.innerHTML='<span class="ic">🚩</span><span class="lb">FLAG</span>';flagBtn.onclick=toggleFlagMode;
  var newBtn=document.createElement('button');newBtn.className='mn-btn';newBtn.innerHTML='<span class="ic">🔄</span><span class="lb">NEW GAME</span>';newBtn.onclick=newGame;
  row1.appendChild(flagBtn); row1.appendChild(newBtn); cr.appendChild(row1);
  var row2=document.createElement('div');row2.className='mn-row';
  var seg=document.createElement('div');seg.className='mn-seg';
  for(var z=0;z<DIFFS.length;z++){(function(idx){var sb=document.createElement('button');sb.className='mn-sb'+(idx===di?' on':'');sb.textContent=DIFFS[idx].label;sb.onclick=function(){setDiffIdx(idx);};seg.appendChild(sb);})(z);}
  var dailyBtn=document.createElement('button');dailyBtn.className='mn-btn';dailyBtn.innerHTML='<span class="ic">📅</span><span class="lb">DAILY</span>';dailyBtn.onclick=toggleDaily;
  row2.appendChild(seg); row2.appendChild(dailyBtn); cr.appendChild(row2);

  newGame();
}

window._gameFns.mines=GN;
})();
