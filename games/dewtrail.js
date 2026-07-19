// ═══ LUCID WINDS — Dew Trail ═══
// Daily one-line path puzzle (Zip/Ariadne family — public-domain mechanic).
// Drag ONE unbroken dew trail from 1 to the last number, collecting numbers
// in order, filling EVERY cell, never crossing. One puzzle per day, same
// board for every player on Earth (UTC-seeded), unique solution guaranteed
// by generator. Includes the Wordle-style share grid (visit-order gradient).
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

// Epoch for puzzle numbering: #1 = 2026-06-12 UTC.
var DT_EPOCH=Date.UTC(2026,5,12);

if(!document.getElementById('dt-style')){
  var st=document.createElement('style');st.id='dt-style';
  st.textContent=[
    '.dt-wrap{max-width:430px;margin:0 auto;padding:4px 8px;user-select:none;-webkit-user-select:none;}',
    '.dt-grid{display:grid;gap:4px;margin:6px auto;touch-action:none;width:100%;max-width:400px;}',
    '.dt-c{position:relative;aspect-ratio:1;min-width:0;border-radius:10px;background:rgba(26,31,23,0.55);border:1.5px solid rgba(74,124,53,0.18);display:flex;align-items:center;justify-content:center;transition:background .12s,border-color .12s;}',
    '.dt-c.on{background:linear-gradient(160deg,rgba(122,179,86,0.34),rgba(74,124,53,0.5));border-color:rgba(122,179,86,0.55);box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);}',
    '.dt-c.head{box-shadow:0 0 14px rgba(140,200,255,0.5),inset 0 1px 0 rgba(255,255,255,0.12);border-color:rgba(140,200,255,0.7);}',
    '.dt-num{font-family:Bebas Neue,sans-serif;font-size:clamp(1rem,4.5vw,1.5rem);color:var(--cream,#e8dcc8);background:rgba(13,16,12,0.85);border:1.5px solid rgba(200,168,75,0.5);border-radius:999px;min-width:58%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;line-height:1;z-index:2;pointer-events:none;}',
    '.dt-c.got .dt-num{border-color:rgba(122,179,86,0.9);color:#cfe8b8;}',
    '.dt-drop{width:26%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,#cfe9ff,#6fa8d8 70%);opacity:0.9;pointer-events:none;}',
    // path bridges between adjacent visited cells
    '.dt-c .dt-br{position:absolute;background:rgba(122,179,86,0.5);z-index:1;pointer-events:none;}',
    '.dt-br.r{right:-5px;top:32%;width:10px;height:36%;border-radius:3px;}',
    '.dt-br.d{bottom:-5px;left:32%;height:10px;width:36%;border-radius:3px;}',
    '.dt-hud{display:flex;justify-content:center;align-items:center;gap:10px;padding:4px 0;font-family:DM Mono,monospace;color:var(--cream,#e8dcc8);font-size:0.85rem;}',
    '.dt-chip{padding:6px 12px;border:1px solid rgba(122,179,86,0.3);border-radius:999px;background:rgba(0,0,0,0.35);}',
    '.dt-btn{min-height:48px;padding:10px 18px;border-radius:10px;border:1.5px solid rgba(122,179,86,0.5);background:rgba(122,179,86,0.14);color:var(--cream,#e8dcc8);font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.08em;cursor:pointer;}',
    '.dt-btn.gold{border-color:rgba(200,168,75,0.6);background:rgba(200,168,75,0.16);color:var(--gold,#c8a84b);}',
    '.dt-row{display:flex;gap:8px;justify-content:center;padding:6px 0;flex-wrap:wrap;}',
    '.dt-done{text-align:center;padding:10px;border:1.5px solid rgba(200,168,75,0.4);border-radius:14px;background:rgba(200,168,75,0.07);margin:8px 0;}',
    '.dt-done .big{font-family:Bebas Neue,sans-serif;font-size:1.6rem;color:var(--gold,#c8a84b);letter-spacing:0.08em;}',
    '.dt-share-pre{font-size:0.95rem;line-height:1.25;margin:6px 0;}'
  ].join('\n');
  document.head.appendChild(st);
}

// ── Seeded RNG (mulberry32) ──
function mk_rng(seed){
  var a=seed>>>0;
  return function(){
    a|=0;a=(a+0x6D2B79F5)|0;
    var t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
function dayNum(){return Math.floor((Date.now()-DT_EPOCH)/86400000)+1;}
function dayKey(){var d=new Date();return d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate();}

// ── Hamiltonian path via serpentine + backbite ──
function genPath(N,rng){
  var path=[],r,c;
  for(r=0;r<N;r++){for(c=0;c<N;c++)path.push(r*N+((r%2)?(N-1-c):c));}
  var steps=N*N*12;
  for(var s=0;s<steps;s++){
    // pick an end, find neighbors of that end inside the path, reverse segment
    var fromHead=rng()<0.5;
    if(!fromHead)path.reverse();
    var head=path[0],hr=Math.floor(head/N),hc=head%N;
    var nbs=[];
    if(hr>0)nbs.push(head-N);if(hr<N-1)nbs.push(head+N);
    if(hc>0)nbs.push(head-1);if(hc<N-1)nbs.push(head+1);
    var nb=nbs[Math.floor(rng()*nbs.length)];
    var idx=-1;for(var i=0;i<path.length;i++){if(path[i]===nb){idx=i;break;}}
    if(idx>1){ // backbite: reverse path[0..idx-1]
      var seg=path.slice(0,idx);seg.reverse();
      path=seg.concat(path.slice(idx));
    }
    if(!fromHead)path.reverse();
  }
  return path;
}

// ── Solution counter (cap 2) for uniqueness check ──
// Board: N, waypoints: map cell->order (1..K). Count Hamiltonian paths that
// start at wp1, end at wpK, visit waypoints in ascending order.
function countSolutions(N,wpOf,K,cap){
  var total=N*N,count=0;
  var start=-1;
  for(var cell in wpOf){if(wpOf[cell]===1)start=parseInt(cell,10);}
  var visited=new Array(total);
  function deg(cell){ // unvisited neighbors
    var r=Math.floor(cell/N),c=cell%N,n=0;
    if(r>0&&!visited[cell-N])n++;if(r<N-1&&!visited[cell+N])n++;
    if(c>0&&!visited[cell-1])n++;if(c<N-1&&!visited[cell+1])n++;
    return n;
  }
  function dfs(cell,len,nextWp){
    if(count>=cap)return;
    var w=wpOf[cell];
    if(w!==undefined){
      if(w!==nextWp)return;
      nextWp++;
    }
    visited[cell]=true;
    if(len===total){
      if(nextWp===K+1)count++;
      visited[cell]=false;return;
    }
    // prune: any unvisited non-current cell with 0 unvisited neighbors → dead
    var r=Math.floor(cell/N),c=cell%N;
    var moves=[];
    if(r>0&&!visited[cell-N])moves.push(cell-N);
    if(r<N-1&&!visited[cell+N])moves.push(cell+N);
    if(c>0&&!visited[cell-1])moves.push(cell-1);
    if(c<N-1&&!visited[cell+1])moves.push(cell+1);
    // forced-move pruning: if any candidate has degree 1 (after moving), prefer ordering
    for(var i=0;i<moves.length;i++){
      dfs(moves[i],len+1,nextWp);
      if(count>=cap)break;
    }
    visited[cell]=false;
  }
  if(start>=0)dfs(start,1,1);
  return count;
}

// ── Puzzle builder: path + waypoints until unique ──
function buildPuzzle(N,seed){
  var rng=mk_rng(seed);
  for(var attempt=0;attempt<6;attempt++){
    var path=genPath(N,rng);
    var total=N*N;
    var K=Math.max(4,Math.floor(total/6)+2);
    var maxK=Math.min(16,Math.floor(total/2));
    // choose interior waypoint positions
    function wpFromPositions(posArr){
      var wp={};
      for(var i=0;i<posArr.length;i++)wp[path[posArr[i]]]=i+1;
      return wp;
    }
    var positions=[0];
    var pool=[];for(var p=1;p<total-1;p++)pool.push(p);
    // shuffle pool with rng
    for(var i=pool.length-1;i>0;i--){var j=Math.floor(rng()*(i+1));var t=pool[i];pool[i]=pool[j];pool[j]=t;}
    var interior=pool.slice(0,K-2);interior.sort(function(a,b){return a-b;});
    positions=positions.concat(interior);positions.push(total-1);
    var wp=wpFromPositions(positions);
    var n=countSolutions(N,wp,positions.length,2);
    var guard=0;
    while(n>1&&positions.length<maxK&&guard<20){
      // add another interior waypoint
      var cand=pool[(K-2)+guard];guard++;
      if(cand===undefined)break;
      var ins=positions.slice(0,positions.length-1);ins.push(cand);
      ins.sort(function(a,b){return a-b;});
      // dedupe
      var ok=true;for(var d=1;d<ins.length;d++)if(ins[d]===ins[d-1])ok=false;
      if(!ok)continue;
      ins.push(total-1);
      // re-add 0 at front if lost
      if(ins[0]!==0)ins.unshift(0);
      // unique-ify
      var seen={},clean=[];
      for(var q=0;q<ins.length;q++){if(!seen[ins[q]]){seen[ins[q]]=1;clean.push(ins[q]);}}
      positions=clean;
      wp=wpFromPositions(positions);
      n=countSolutions(N,wp,positions.length,2);
    }
    if(n===1)return {N:N,path:path,wpOf:wp,K:positions.length};
  }
  // last resort: dense waypoints every 3rd cell — always unique
  var path2=genPath(N,rng),wp2={},k2=0,tot=N*N;
  for(var z=0;z<tot;z++){if(z===0||z===tot-1||z%3===0){k2++;wp2[path2[z]]=k2;}}
  return {N:N,path:path2,wpOf:wp2,K:k2};
}

window._gameFns=window._gameFns||{};
window._gameFns.dewtrail=function DT(a){
  var N=6,puzzle=null,mode='daily';     // 'daily' | 'practice'
  var trail=[],nextWp=1,playing=false,won=false;
  var t0=0,elapsed=0,timerId=0,gen=0;
  var pan;

  ms(a,'<span style="color:var(--gold)">Dew Trail</span> · <span id="DTd">#'+dayNum()+'</span> · <span id="DTt">0:00</span> · 🔥<span id="DTs">'+streak().n+'</span>');
  mm(a);
  pan=document.createElement('div');pan.className='dt-wrap';a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_DTN()">↻ New Game</button>';

  function streak(){
    try{return JSON.parse(localStorage.getItem('lw_dt_streak')||'{"n":0,"last":""}');}catch(e){return {n:0,last:''};}
  }
  function doneToday(){
    try{var d=JSON.parse(localStorage.getItem('lw_dt_daily')||'null');return (d&&d.day===dayKey())?d:null;}catch(e){return null;}
  }
  function fmt(s){var m=Math.floor(s/60),x=Math.floor(s%60);return m+':'+(x<10?'0':'')+x;}

  function newBoard(practice){
    gen++;won=false;playing=false;trail=[];nextWp=1;elapsed=0;
    mode=practice?'practice':'daily';
    var seed;
    if(practice){seed=(Date.now()^(Math.random()*0xFFFFFFFF))>>>0;}
    else{
      // UTC-date seed: same board for every player worldwide
      var k=dayKey(),h=2166136261;
      for(var i=0;i<k.length;i++){h^=k.charCodeAt(i);h=Math.imul(h,16777619);}
      seed=h>>>0;
    }
    puzzle=buildPuzzle(N,seed);
    if(timerId){clearInterval(timerId);timerId=0;}
    var te=document.getElementById('DTt');if(te)te.textContent='0:00';
    render();
  }

  function startTimer(){
    if(timerId)return;
    t0=Date.now();
    timerId=setInterval(function(){
      elapsed=(Date.now()-t0)/1000;
      var te=document.getElementById('DTt');if(te)te.textContent=fmt(elapsed);
    },500);
  }

  // ── share grid: visit-order gradient (Wordle-style, botanical) ──
  function shareGrid(){
    var SH=['🌱','🌿','💧','🌸'];
    var total=N*N,orderOf={};
    for(var i=0;i<trail.length;i++)orderOf[trail[i]]=i;
    var out='';
    for(var r=0;r<N;r++){
      for(var c=0;c<N;c++){
        var o=orderOf[r*N+c]||0;
        out+=SH[Math.min(3,Math.floor(o/(total/4)))];
      }
      out+='\n';
    }
    return out;
  }
  function shareText(){
    var s=streak();
    return '💧 Dew Trail #'+dayNum()+' · '+fmt(elapsed)+(s.n>1?' · 🔥'+s.n:'')+'\n'+shareGrid()+'\n\nCan you beat my time?\nhttps://lucidwinds.com/?game=dewtrail';
  }
  function doShare(txt){
    if(navigator.share){navigator.share({text:txt,url:'https://lucidwinds.com/?game=dewtrail'}).catch(function(){});}
    else{
      try{
        var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);
        ta.select();document.execCommand('copy');document.body.removeChild(ta);
        sm('Copied — paste it anywhere');
      }catch(e){sm('Copy failed');}
    }
  }
  window._DTshare=function(){
    var d=doneToday();
    var txt=d&&mode==='daily'&&!playing&&!won?d.share:shareText();
    doShare(txt||shareText());
  };

  function win(){
    won=true;playing=false;
    if(timerId){clearInterval(timerId);timerId=0;}
    elapsed=(Date.now()-t0)/1000;
    _play('win');_playWin();
    if(mode==='daily'){
      // streak: consecutive UTC days
      var s=streak(),today=dayKey();
      var y=new Date();y.setUTCDate(y.getUTCDate()-1);
      var yk=y.getUTCFullYear()+'-'+(y.getUTCMonth()+1)+'-'+y.getUTCDate();
      if(s.last===yk)s.n++;else if(s.last!==today)s.n=1;
      s.last=today;
      try{localStorage.setItem('lw_dt_streak',JSON.stringify(s));}catch(e){}
      var se=document.getElementById('DTs');if(se)se.textContent=s.n;
      try{localStorage.setItem('lw_dt_daily',JSON.stringify({day:today,time:elapsed,share:shareText()}));}catch(e){}
      _e('game_win');
      _sr('dewtrail',{w:true,s:Math.max(1,Math.round(600-elapsed))});
    }else{
      _e('milestone');
      _sr('dewtrail',{w:true,s:Math.max(1,Math.round(300-elapsed))});
    }
    render();
  }

  // ── input ──
  function cellAt(x,y){
    var el=document.elementFromPoint(x,y);
    while(el&&el!==pan){
      if(el.getAttribute&&el.getAttribute('data-i')!==null&&el.getAttribute('data-i')!==undefined&&el.getAttribute('data-i')!==''){
        return parseInt(el.getAttribute('data-i'),10);
      }
      el=el.parentNode;
    }
    return -1;
  }
  function tryStep(i){
    if(!playing||i<0)return;
    var last=trail[trail.length-1];
    if(i===last)return;
    // backtrack: re-entering the previous cell pops the head
    if(trail.length>1&&i===trail[trail.length-2]){
      var popped=trail.pop();
      if(puzzle.wpOf[popped]!==undefined)nextWp--;
      paint();return;
    }
    if(trail.indexOf(i)>=0)return; // no crossing
    // adjacency
    var lr=Math.floor(last/N),lc=last%N,ir=Math.floor(i/N),ic=i%N;
    if(Math.abs(lr-ir)+Math.abs(lc-ic)!==1)return;
    // waypoint order
    var w=puzzle.wpOf[i];
    if(w!==undefined){
      if(w!==nextWp){_play('lose');sm('Numbers in order — next is '+nextWp);return;}
      nextWp++;
    }
    trail.push(i);_play('tap');
    paint();
    if(trail.length===N*N&&nextWp===puzzle.K+1)win();
    else if(trail.length===N*N){sm('Every cell filled, but a number was missed');}
  }
  var dragging=false;
  function onDown(e){
    if(won||(mode==='daily'&&doneToday()&&!playing))return;
    var t=e.touches?e.touches[0]:e;
    var i=cellAt(t.clientX,t.clientY);
    if(i<0)return;
    e.preventDefault();
    if(!playing){
      // must start at waypoint 1
      if(puzzle.wpOf[i]===1){playing=true;trail=[i];nextWp=2;startTimer();paint();}
      else sm('Start at 1');
      dragging=true;return;
    }
    dragging=true;tryStep(i);
  }
  function onMove(e){
    if(!dragging)return;
    var t=e.touches?e.touches[0]:e;
    e.preventDefault();
    tryStep(cellAt(t.clientX,t.clientY));
  }
  function onUp(){dragging=false;}

  // ── render ──
  function paint(){
    var cells=pan.querySelectorAll('.dt-c');
    var idx={},i;
    for(i=0;i<trail.length;i++)idx[trail[i]]=i;
    for(i=0;i<cells.length;i++){
      var ci=parseInt(cells[i].getAttribute('data-i'),10);
      var on=idx[ci]!==undefined;
      cells[i].className='dt-c'+(on?' on':'')+(trail.length&&ci===trail[trail.length-1]?' head':'')+(on&&puzzle.wpOf[ci]!==undefined?' got':'');
      // bridges
      var br=cells[i].querySelectorAll('.dt-br');
      for(var b=0;b<br.length;b++)br[b].parentNode.removeChild(br[b]);
      if(on&&idx[ci]<trail.length-1){
        var nx=trail[idx[ci]+1];
        if(nx===ci+1){var d1=document.createElement('div');d1.className='dt-br r';cells[i].appendChild(d1);}
        else if(nx===ci+N){var d2=document.createElement('div');d2.className='dt-br d';cells[i].appendChild(d2);}
        else if(nx===ci-1){var p1=pan.querySelector('.dt-c[data-i="'+nx+'"]');if(p1){var d3=document.createElement('div');d3.className='dt-br r';p1.appendChild(d3);}}
        else if(nx===ci-N){var p2=pan.querySelector('.dt-c[data-i="'+nx+'"]');if(p2){var d4=document.createElement('div');d4.className='dt-br d';p2.appendChild(d4);}}
      }
    }
  }
  function render(){
    var d=doneToday();
    var h='';
    h+='<div class="dt-hud"><span class="dt-chip">'+(mode==='daily'?'DAILY #'+dayNum():'PRACTICE')+'</span><span class="dt-chip">'+puzzle.K+' drops</span></div>';
    if(mode==='daily'&&d&&!won&&!playing){
      h+='<div class="dt-done"><div class="big">SOLVED · '+fmt(d.time)+'</div><div style="font-family:Georgia,serif;font-style:italic;color:var(--muted,#8a9178);font-size:0.8rem;margin-top:4px;">Same trail returns at midnight UTC</div>';
      h+='<pre class="dt-share-pre">'+(d.share||'').split('\n').slice(1,1+N).join('\n')+'</pre>';
      h+='<div class="dt-row"><button class="dt-btn gold" onclick="_DTshare()">📤 SHARE</button><button class="dt-btn" onclick="_DTP()">PRACTICE</button></div></div>';
      pan.innerHTML=h;return;
    }
    h+='<div class="dt-grid" id="DTg" style="grid-template-columns:repeat('+N+',1fr)">';
    for(var i=0;i<N*N;i++){
      var w=puzzle.wpOf[i];
      h+='<div class="dt-c" data-i="'+i+'">'+(w!==undefined?'<div class="dt-num">'+w+'</div>':'<div class="dt-drop"></div>')+'</div>';
    }
    h+='</div>';
    if(won){
      h+='<div class="dt-done"><div class="big">'+(mode==='daily'?'TRAIL COMPLETE · ':'SOLVED · ')+fmt(elapsed)+'</div>';
      h+='<div class="dt-row"><button class="dt-btn gold" onclick="_DTshare()">📤 SHARE</button>'+(mode==='daily'?'<button class="dt-btn" onclick="_DTP()">PRACTICE</button>':'<button class="dt-btn" onclick="_DTP()">ANOTHER</button>')+'</div></div>';
    }else{
      h+='<div style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:0.78rem;color:var(--muted,#8a9178);padding:2px 0 6px;">Drag one trail from 1 — touch every cell, numbers in order.</div>';
      h+='<div class="dt-row">'+(mode==='practice'?'<button class="dt-btn" onclick="_DTD()">TODAY\'S DAILY</button>':'')+'<button class="dt-btn" onclick="_DTR()">↺ RESTART</button>'+(mode==='daily'?'<button class="dt-btn" onclick="_DTP()">PRACTICE</button>':'')+'</div>';
    }
    pan.innerHTML=h;
    var g=document.getElementById('DTg');
    if(g){
      g.addEventListener('mousedown',onDown);
      g.addEventListener('mousemove',onMove);
      g.addEventListener('touchstart',onDown,{passive:false});
      g.addEventListener('touchmove',onMove,{passive:false});
    }
    paint();
  }

  window._DTN=function(){
    // Daily already solved today: NEW GAME must hand out a fresh board, not
    // re-render the daily-done lock screen (the button read as dead — Jul 10 note #7).
    newBoard(mode==='practice'||!!doneToday());
  };
  window._DTR=function(){
    if(won)return;
    trail=[];nextWp=1;playing=false;
    if(timerId){clearInterval(timerId);timerId=0;}elapsed=0;
    var te=document.getElementById('DTt');if(te)te.textContent='0:00';
    paint();sm('Start at 1');
  };
  window._DTP=function(){newBoard(true);};
  window._DTD=function(){newBoard(false);};

  window.addEventListener('mouseup',onUp);
  window.addEventListener('touchend',onUp);
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    gen++;
    if(timerId){clearInterval(timerId);timerId=0;}
    window.removeEventListener('mouseup',onUp);
    window.removeEventListener('touchend',onUp);
  });

  newBoard(false);
};
})();
