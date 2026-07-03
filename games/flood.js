// ═══ LUCID WINDS — Autumn Leaves (Flood Fill) ═══
// Flesh-out 2026-07-03: 6-colour size tiers, best-moves + best-time per tier, streak,
// daily seeded board (records move sequence for a future server-verified leaderboard),
// animated wave flood, star rating, stat bar above the board (togglable), timer that
// starts on the first move, matching NEW/STYLE buttons, and an Appearance picker with
// fill styles (Leaves/Solid/Gem) + colour packs incl. a colourblind-safe pack.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,_st=G.st;

if(!document.getElementById('ff-style')){
  var stl=document.createElement('style');stl.id='ff-style';
  stl.textContent='@keyframes ffPop{0%{transform:scale(1)}45%{transform:scale(1.16)}100%{transform:scale(1)}}'
    +'.ff-cell{will-change:transform}.ff-cell.ff-pop{animation:ffPop .22s ease}'
    +'.ff-gemgrid .lc{border-radius:26%}'
    +'@keyframes ffShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}'
    +'.ff-shake{animation:ffShake .4s ease}'
    +'.ff-stats{display:flex;gap:18px;justify-content:center;align-items:center;flex-wrap:wrap;padding:10px 8px 4px;font-family:"DM Mono",monospace;font-size:clamp(.85rem,3.6vw,1.05rem);color:#e8dcc8;letter-spacing:.03em}'
    +'.ff-stats b{color:#C8A84B;font-weight:700}'
    +'.ff-seg{display:inline-flex;border-radius:9px;overflow:hidden;border:1px solid rgba(122,179,86,.3);vertical-align:middle}'
    +'.ff-seg .ff-sb{padding:9px 12px;min-height:48px;min-width:48px;background:rgba(18,24,16,.6);color:#8a9178;border:none;font:inherit;font-size:.8rem;cursor:pointer}'
    +'.ff-seg .ff-sb.on{background:rgba(122,179,86,.32);color:#e8dcc8;font-weight:700}'
    // matching NEW / STYLE buttons (no image, same size)
    +'.ff-btn{min-width:clamp(120px,34vw,150px);min-height:60px;padding:10px 16px;border-radius:16px;border:2px solid rgba(122,179,86,.32);background:linear-gradient(160deg,rgba(32,40,27,.96),rgba(17,23,15,.96));color:#e8dcc8;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;font-family:"DM Mono",monospace;box-shadow:0 3px 8px rgba(0,0,0,.3),inset 0 1px 0 rgba(200,168,75,.08);-webkit-tap-highlight-color:transparent;transition:transform .15s}'
    +'.ff-btn .ic{font-size:1.5rem;line-height:1}.ff-btn .lb{font-size:.72rem;letter-spacing:.06em;opacity:.9}'
    +'.ff-btn:active{transform:scale(.95)}'
    +'.ff-row{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:center;padding:6px 0}'
    // appearance modal
    +'.ff-mbg{position:fixed;inset:0;background:rgba(4,10,6,.74);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px}'
    +'.ff-modal{background:linear-gradient(160deg,#1a2216,#10160e);border:2px solid rgba(200,168,75,.3);border-radius:20px;padding:20px;max-width:390px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 14px 44px rgba(0,0,0,.6)}'
    +'.ff-mtitle{font-family:"DM Mono",monospace;font-size:1.15rem;color:#C8A84B;text-align:center;margin-bottom:6px;letter-spacing:.08em}'
    +'.ff-mlabel{font-family:"DM Mono",monospace;font-size:.7rem;color:#8a9178;letter-spacing:.12em;margin:16px 0 8px}'
    +'.ff-mrow{display:flex;gap:10px}'
    +'.ff-opt{flex:1;min-height:52px;padding:10px;border-radius:12px;border:2px solid rgba(122,179,86,.2);background:rgba(18,24,16,.6);color:#c8d0bc;cursor:pointer;font-family:"DM Mono",monospace;font-size:.78rem;display:flex;flex-direction:column;align-items:center;gap:5px}'
    +'.ff-opt.sel{border-color:#C8A84B;background:rgba(200,168,75,.12);color:#e8dcc8}.ff-opt .ic{font-size:1.4rem}'
    +'.ff-pack{width:100%;display:flex;align-items:center;gap:12px;padding:9px 11px;border-radius:12px;border:2px solid rgba(122,179,86,.2);background:rgba(18,24,16,.6);cursor:pointer;margin-bottom:8px}'
    +'.ff-pack.sel{border-color:#C8A84B;background:rgba(200,168,75,.12)}'
    +'.ff-pack .pn{font-family:"DM Mono",monospace;font-size:.8rem;color:#e8dcc8;min-width:96px;text-align:left}'
    +'.ff-pack .sw{display:flex;gap:4px;flex:1}.ff-pack .sw i{width:20px;height:20px;border-radius:5px;display:block;flex:1;max-width:26px}'
    +'.ff-done{margin-top:18px;width:100%;min-height:54px;border-radius:14px;border:none;background:linear-gradient(160deg,#7ab356,#5a8f3e);color:#0b2415;font-family:"DM Mono",monospace;font-weight:700;font-size:.95rem;letter-spacing:.06em;cursor:pointer}';
  document.head.appendChild(stl);
}

function GFL(a){
  var SIZES=[
    {id:'cozy',   label:'Cozy',   n:9,  par:19, cap:30},
    {id:'garden', label:'Garden', n:13, par:30, cap:45},
    {id:'wild',   label:'Wild',   n:17, par:42, cap:60}
  ];
  var NCOL=6;
  var AUTUMN=['#4a7c35','#C8A84B','#4a7aaa','#c76a30','#9b59b6','#c75050'];
  var LF=['assets/games/flood/leaf-sage.png','assets/games/flood/leaf-gold.png','assets/games/flood/leaf-slate.png','assets/games/flood/leaf-copper.png','assets/games/flood/leaf-plum.png','assets/games/flood/leaf-crimson.png'];
  var STYLES=[{id:'leaves',label:'Leaves',ic:'🍂'},{id:'solid',label:'Solid',ic:'⬤'},{id:'gem',label:'Gem',ic:'◆'}];
  var PACKS=[
    {id:'autumn',name:'Autumn',      cols:AUTUMN},
    {id:'jewel', name:'Jewel',       cols:['#1f9e63','#e8a51e','#3563cc','#d6314a','#8e3fc7','#e5731c']},
    {id:'candy', name:'Candy',       cols:['#6fd0a0','#f2d24e','#7cc4f2','#f2938a','#c79ae8','#e85d9a']},
    {id:'cb',    name:'Colourblind', cols:['#E69F00','#56B4E9','#009E73','#F0E442','#0072B2','#D55E00']}  // Wong palette — CVD-safe
  ];

  var si=0; try{var s0=parseInt(localStorage.getItem('lw_flood_size'),10);if(s0>=0&&s0<SIZES.length)si=s0;}catch(e){}
  var styleIdx=0; try{var sv=localStorage.getItem('lw_flood_style');for(var q=0;q<STYLES.length;q++)if(STYLES[q].id===sv)styleIdx=q;if(sv==null){var old=localStorage.getItem('lw_flood_leaves');if(old==='off')styleIdx=1;}}catch(e){}
  var packIdx=0; try{var pv=localStorage.getItem('lw_flood_pack');for(var q2=0;q2<PACKS.length;q2++)if(PACKS[q2].id===pv)packIdx=q2;}catch(e){}
  var showMoves=true, showTime=true;
  try{showMoves=localStorage.getItem('lw_flood_moves')!=='off';showTime=localStorage.getItem('lw_flood_time')!=='off';}catch(e){}

  var daily=false, SZ=SIZES[si].n, grid=[], moves=0, over=false, started=false;
  var cells=[], swatches=[], flowTimers=[], flowGen=0;
  var startAt=0, elapsed=0, timerIv=0, dailySeq=[];

  function tier(){ return daily?SIZES[1]:SIZES[si]; }
  function cap(){ return tier().cap; }
  function styleId(){ return STYLES[styleIdx].id; }
  function COL(k){ return PACKS[packIdx].cols[k]; }

  // ── persistence ──
  function bestKey(){ return 'lw_flood_best_'+(daily?'daily':SIZES[si].id); }
  function btKey(){ return 'lw_flood_bt_'+(daily?'daily':SIZES[si].id); }
  function getBest(){ try{var v=parseInt(localStorage.getItem(bestKey()),10);return v>0?v:0;}catch(e){return 0;} }
  function setBest(m){ try{localStorage.setItem(bestKey(),String(m));}catch(e){} }
  function getBT(){ try{var v=parseFloat(localStorage.getItem(btKey()));return v>0?v:0;}catch(e){return 0;} }
  function setBT(t){ try{localStorage.setItem(btKey(),String(t));}catch(e){} }
  function getStreak(){ try{return parseInt(localStorage.getItem('lw_flood_streak'),10)||0;}catch(e){return 0;} }
  function setStreak(v){ try{localStorage.setItem('lw_flood_streak',String(v));}catch(e){} }

  // ── daily seeded board ──
  function todayStr(){ var t=new Date(); return t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate(); }
  function seedNum(){ var s=0,d=todayStr(); for(var i=0;i<d.length;i++) s=(s*31+d.charCodeAt(i))|0; return s>>>0; }
  function mkRng(seed){ var s=seed>>>0; return function(){ s=(s+0x6D2B79F5)|0; var t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
  function dailyDone(){ try{var r=JSON.parse(localStorage.getItem('lw_flood_daily')||'{}');return r.d===todayStr()?r:null;}catch(e){return null;} }
  function markDaily(m,t){ try{localStorage.setItem('lw_flood_daily',JSON.stringify({d:todayStr(),m:m,t:Math.round(t),seq:dailySeq.slice()}));}catch(e){} }

  // ── timer (starts on FIRST move) ──
  function fmt(s){ var m=Math.floor(s/60),ss=Math.floor(s%60); return m+':'+(ss<10?'0':'')+ss; }
  function stopTimer(){ if(timerIv){ clearInterval(timerIv); timerIv=0; } }
  function beginPlay(){
    if(started) return; started=true; _st(); startAt=Date.now(); stopTimer();
    timerIv=setInterval(function(){
      if(!a.isConnected){ stopTimer(); return; }
      if(over) return;
      elapsed=(Date.now()-startAt)/1000; setTxt('FFtime',fmt(elapsed));
    },500);
  }

  // ── stat bar ABOVE the board ──
  var stats=document.createElement('div'); stats.className='ff-stats';
  stats.innerHTML='<span id="FFmoveWrap">Moves <b id="FFm">0</b>/<b id="FFcap">'+cap()+'</b></span>'
    +'<span id="FFtimeWrap">⏱ <b id="FFtime">0:00</b></span>'
    +'<span>🔥 <b id="FFstreak">0</b></span>';
  a.appendChild(stats);
  function setTxt(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; }
  function applyToggles(){
    var mw=document.getElementById('FFmoveWrap'); if(mw) mw.style.display=showMoves?'':'none';
    var tw=document.getElementById('FFtimeWrap'); if(tw) tw.style.display=showTime?'':'none';
  }
  function updateHeader(){
    setTxt('FFm',moves); setTxt('FFcap',cap()); setTxt('FFstreak',getStreak());
    var mEl=document.getElementById('FFm'); if(mEl) mEl.style.color=(cap()-moves)<=3?'#c75050':'';
  }
  function idleMsg(){
    if(daily){ var dd=dailyDone(); sm(dd?('Today’s garden — your best: '+dd.m+' moves · '+fmt(dd.t)):'Today’s garden. Everyone plays this exact board.'); return; }
    var b=getBest(),bt=getBT(); sm(b?('Best: '+b+' moves'+(bt?(' · '+fmt(bt)):'')):'');
  }

  // ── board ──
  var gd=document.createElement('div');gd.className='lg';gd.id='FFg';a.appendChild(gd);
  var pb=document.createElement('div');pb.className='lg';pb.style.gap='8px';pb.style.padding='10px';pb.style.width='clamp(300px,92vw,420px)';a.appendChild(pb);
  mm(a);

  function cellBg(idx){
    var k=grid[idx], s=styleId();
    if(s==='leaves') return 'url('+LF[k]+') center/cover '+AUTUMN[k];
    var color=COL(k);
    if(s==='gem') return 'radial-gradient(circle at 34% 28%,rgba(255,255,255,.55),rgba(255,255,255,0) 44%),radial-gradient(circle at 72% 82%,rgba(0,0,0,.22),transparent 42%),'+color;
    return color;
  }
  function cellBg2(c){ var s=styleId(); if(s==='leaves')return 'url('+LF[c]+') center/cover '+AUTUMN[c]; var color=COL(c); if(s==='gem')return 'radial-gradient(circle at 34% 28%,rgba(255,255,255,.55),rgba(255,255,255,0) 44%),'+color; return color; }
  function buildGrid(){
    clearFlow();
    gd.classList.toggle('ff-gemgrid', styleId()==='gem');
    var side='min(92vw, 52vh)';
    gd.style.width=side; gd.style.height=side; gd.style.padding='0'; gd.style.margin='0 auto';
    gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';
    gd.style.gridTemplateRows='repeat('+SZ+',1fr)';
    gd.style.gap=SZ>13?'1px':'2px';
    var rad=SZ>13?'3px':(SZ>10?'5px':'8px');
    gd.innerHTML=''; cells=[];
    for(var i=0;i<SZ*SZ;i++){
      var d=document.createElement('div');d.className='lc ff-cell';
      d.style.minHeight='0'; d.style.minWidth='0';
      d.style.borderRadius = styleId()==='gem'? '' : rad;
      d.style.transition='transform .18s ease'; d.style.background=cellBg(i);
      gd.appendChild(d); cells.push(d);
    }
  }
  function buildPad(){
    pb.innerHTML=''; swatches=[]; pb.style.gridTemplateColumns='repeat('+NCOL+',1fr)';
    for(var j=0;j<NCOL;j++){(function(c){
      var b=document.createElement('div');b.className='lc'+(grid[0]===c?' lo':'');b.style.minHeight='48px';
      if(styleId()==='gem') b.style.borderRadius='26%';
      b.style.background=cellBg2(c);
      b.onclick=function(){ pick(c); };
      pb.appendChild(b); swatches.push(b);
    })(j);}
  }
  function paintPad(){ for(var j=0;j<NCOL;j++){ if(swatches[j]) swatches[j].className='lc'+(grid[0]===j?' lo':''); } }
  function repaintAll(){
    gd.classList.toggle('ff-gemgrid', styleId()==='gem');
    var rad=SZ>13?'3px':(SZ>10?'5px':'8px');
    for(var i=0;i<cells.length;i++){ cells[i].style.borderRadius = styleId()==='gem'? '' : rad; cells[i].style.background=cellBg(i); }
    buildPad();
  }

  function floodFill(nc){
    var oc=grid[0],changed=[]; if(oc===nc) return changed;
    var vis=[]; for(var x=0;x<SZ*SZ;x++) vis.push(false);
    var qq=[{i:0,d:0}];
    while(qq.length){
      var node=qq.shift(),i=node.i,dp=node.d;
      if(i<0||i>=SZ*SZ||vis[i]) continue;
      if(grid[i]!==oc&&grid[i]!==nc) continue;
      vis[i]=true;
      if(grid[i]===oc){ grid[i]=nc; changed.push({i:i,d:dp}); }
      var r=Math.floor(i/SZ),c=i%SZ;
      if(r>0)qq.push({i:i-SZ,d:dp+1}); if(r<SZ-1)qq.push({i:i+SZ,d:dp+1});
      if(c>0)qq.push({i:i-1,d:dp+1}); if(c<SZ-1)qq.push({i:i+1,d:dp+1});
    }
    return changed;
  }
  function clearFlow(){ for(var k=0;k<flowTimers.length;k++) clearTimeout(flowTimers[k]); flowTimers=[]; }
  function paintWave(changed){
    flowGen++; var gen=flowGen;
    for(var k=0;k<changed.length;k++){(function(ch){
      var t=setTimeout(function(){
        if(gen!==flowGen) return; var cell=cells[ch.i]; if(!cell) return;
        cell.style.background=cellBg(ch.i);
        cell.classList.remove('ff-pop'); void cell.offsetWidth; cell.classList.add('ff-pop');
      }, ch.d*11);
      flowTimers.push(t);
    })(changed[k]);}
  }

  function pick(c){
    if(over||grid[0]===c) return;
    beginPlay();
    _play('tap'); if(daily) dailySeq.push(c);
    var changed=floodFill(c); moves++;
    setTxt('FFm',moves); var mEl=document.getElementById('FFm'); if(mEl) mEl.style.color=(cap()-moves)<=3?'#c75050':'';
    paintWave(changed); paintPad();
    var done=true,g0=grid[0]; for(var i=0;i<grid.length;i++){ if(grid[i]!==g0){ done=false; break; } }
    if(done) win(); else if(moves>=cap()) lose();
  }

  function win(){
    over=true; stopTimer(); var tm=elapsed; var S=tier();
    var st3=moves<=S.par?3:(moves<=S.par+Math.ceil((S.cap-S.par)/2)?2:1);
    var pb0=getBest(),isBest=(pb0===0||moves<pb0); if(isBest) setBest(moves);
    var bt0=getBT(),isBT=(bt0===0||tm<bt0); if(isBT) setBT(tm);
    var streak=getStreak()+1; setStreak(streak);
    if(daily) markDaily(moves,tm);
    updateHeader();
    _e('game_win'); _playWin();
    var stars=''; for(var k=0;k<3;k++) stars+=(k<st3?'★':'☆');
    var extra=isBest?'  ·  NEW BEST!':(showTime&&isBT?'  ·  best time!':'  ·  best '+getBest());
    sm(stars+'  '+(daily?'Daily ':'')+'flooded in '+moves+(showTime?' · '+fmt(tm):'')+extra+'   🔥'+streak);
    _sr('flood',{w:true,s:Math.max(1,S.cap-moves)});
  }
  function lose(){
    over=true; stopTimer(); setStreak(0); updateHeader();
    _e('game_loss'); _play('lose');
    gd.classList.remove('ff-shake'); void gd.offsetWidth; gd.classList.add('ff-shake');
    sm('Out of moves — the leaves scattered. Tap NEW to try again');
    _sr('flood',{w:false,s:0});
  }

  function newGame(){
    clearFlow(); stopTimer(); dailySeq=[]; started=false; elapsed=0;
    var rng = daily ? mkRng(seedNum()) : Math.random;
    SZ=tier().n; grid=[]; for(var i=0;i<SZ*SZ;i++) grid.push(Math.floor(rng()*NCOL));
    moves=0; over=false;
    buildGrid(); buildPad(); setTxt('FFtime','0:00'); updateHeader(); applyToggles(); idleMsg();
  }
  function setSize(idx){
    if(daily) return; si=idx; try{localStorage.setItem('lw_flood_size',String(si));}catch(e){}
    for(var k=0;k<sizeSeg.children.length;k++) sizeSeg.children[k].className='ff-sb'+(k===si?' on':'');
    newGame();
  }
  function toggleDaily(){
    daily=!daily; dailyBtn.className='gb'+(daily?' gon':''); dailyBtn.textContent=daily?'📅 Daily ✓':'📅 Daily';
    sizeSeg.style.opacity=daily?'.4':'1'; newGame();
  }

  // ── appearance picker (fill styles + colour packs incl. colourblind) ──
  function openAppearance(){
    var bg=document.createElement('div'); bg.className='ff-mbg';
    var box=document.createElement('div'); box.className='ff-modal'; bg.appendChild(box);
    box.innerHTML='<div class="ff-mtitle">Appearance</div><div class="ff-mlabel">FILL STYLE</div>';
    var fillRow=document.createElement('div'); fillRow.className='ff-mrow'; box.appendChild(fillRow);
    function renderFill(){
      fillRow.innerHTML='';
      for(var s=0;s<STYLES.length;s++){(function(idx){
        var o=document.createElement('div'); o.className='ff-opt'+(idx===styleIdx?' sel':'');
        o.innerHTML='<span class="ic">'+STYLES[idx].ic+'</span>'+STYLES[idx].label;
        o.onclick=function(){ styleIdx=idx; try{localStorage.setItem('lw_flood_style',styleId());}catch(e){} renderFill(); repaintAll(); };
        fillRow.appendChild(o);
      })(s);}
    }
    renderFill();
    var pl=document.createElement('div'); pl.className='ff-mlabel'; pl.textContent='COLOUR PACK (Solid & Gem)'; box.appendChild(pl);
    var packWrap=document.createElement('div'); box.appendChild(packWrap);
    function renderPacks(){
      packWrap.innerHTML='';
      for(var p=0;p<PACKS.length;p++){(function(idx){
        var row=document.createElement('div'); row.className='ff-pack'+(idx===packIdx?' sel':'');
        var sw=''; for(var c=0;c<PACKS[idx].cols.length;c++) sw+='<i style="background:'+PACKS[idx].cols[c]+'"></i>';
        row.innerHTML='<span class="pn">'+PACKS[idx].name+'</span><span class="sw">'+sw+'</span>';
        row.onclick=function(){
          packIdx=idx; try{localStorage.setItem('lw_flood_pack',PACKS[idx].id);}catch(e){}
          if(styleId()==='leaves'){ styleIdx=1; try{localStorage.setItem('lw_flood_style','solid');}catch(e){} renderFill(); }  // show the pack
          renderPacks(); repaintAll();
        };
        packWrap.appendChild(row);
      })(p);}
    }
    renderPacks();
    var done=document.createElement('button'); done.className='ff-done'; done.textContent='Done'; box.appendChild(done);
    function close(){ if(bg.parentNode) bg.parentNode.removeChild(bg); }
    done.onclick=close;
    bg.onclick=function(e){ if(e.target===bg) close(); };
    document.body.appendChild(bg);
  }

  // ── controls ──
  var cr=mc(a); cr.style.display='flex'; cr.style.flexDirection='column'; cr.style.gap='10px'; cr.style.alignItems='center';
  var row1=document.createElement('div');row1.className='ff-row';
  var newBtn=document.createElement('button');newBtn.className='ff-btn';newBtn.innerHTML='<span class="ic">🔄</span><span class="lb">NEW GAME</span>';newBtn.onclick=newGame;
  var styleBtn=document.createElement('button');styleBtn.className='ff-btn';styleBtn.innerHTML='<span class="ic">🎨</span><span class="lb">STYLE</span>';styleBtn.onclick=openAppearance;
  row1.appendChild(newBtn); row1.appendChild(styleBtn); cr.appendChild(row1);
  var row2=document.createElement('div');row2.className='ff-row';
  var sizeSeg=document.createElement('div');sizeSeg.className='ff-seg';
  for(var z=0;z<SIZES.length;z++){(function(idx){var sb=document.createElement('button');sb.className='ff-sb'+(idx===si?' on':'');sb.textContent=SIZES[idx].label;sb.onclick=function(){setSize(idx);};sizeSeg.appendChild(sb);})(z);}
  var dailyBtn=document.createElement('button');dailyBtn.className='gb';dailyBtn.textContent='📅 Daily';dailyBtn.onclick=toggleDaily;
  row2.appendChild(sizeSeg); row2.appendChild(dailyBtn); cr.appendChild(row2);
  var row3=document.createElement('div');row3.className='ff-row';
  var tBtn=document.createElement('button');tBtn.className='gb'+(showTime?' gon':'');tBtn.textContent='⏱ Timer';
  tBtn.onclick=function(){ showTime=!showTime; try{localStorage.setItem('lw_flood_time',showTime?'on':'off');}catch(e){} tBtn.className='gb'+(showTime?' gon':''); applyToggles(); };
  var mBtn=document.createElement('button');mBtn.className='gb'+(showMoves?' gon':'');mBtn.textContent='# Moves';
  mBtn.onclick=function(){ showMoves=!showMoves; try{localStorage.setItem('lw_flood_moves',showMoves?'on':'off');}catch(e){} mBtn.className='gb'+(showMoves?' gon':''); applyToggles(); };
  row3.appendChild(tBtn); row3.appendChild(mBtn); cr.appendChild(row3);

  newGame();
}

window._gameFns.flood=GFL;
})();
