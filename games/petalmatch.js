// ═══ PETAL MATCH — match-3 botanical swap puzzle ═══
// 8x8 grid, swipe adjacent to swap. 3+ in a row clears. Cascades combo.
// 30 moves per level, target score rises per level.
// Specials: Vine-Wrapped (4-match), Bloom Burst (L/T), Spore Cloud (5-match).
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

// Inject special-piece keyframes once
if(!document.getElementById('pm-special-kf')){
  var _kf=document.createElement('style');
  _kf.id='pm-special-kf';
  _kf.textContent='@keyframes pmVineSpawn{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}@keyframes pmBurstGlow{0%,100%{opacity:0.6}50%{opacity:1}}@keyframes pmSporeSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
  document.head.appendChild(_kf);
}

window._gameFns = window._gameFns || {};
window._gameFns.petalmatch = function PM(a){
  var ROWS=8,COLS=8,TYPES=6,CELL=36;
  var GEMS=[
    {color:'#7ab356'},
    {color:'#c47a7a'},
    {color:'#5b9bd5'},
    {color:'#c8a84b'},
    {color:'#9b6ba3'},
    {color:'#e8dcc8'}
  ];
  var grid=[],score=0,level=1,moves=30,target=500,won=false;
  var selected=null,animating=false,comboCount=0;
  var canvas,ctx,dpr;
  var fx=[]; // transient visual effects (sweeps, flashes, beams)
  var spinAngle=0; // spore rainbow rotation
  var bestLevel=1,bestScore=0;
  try{bestLevel=parseInt(localStorage.getItem('lw_pm_level')||'1',10)||1;bestScore=parseInt(localStorage.getItem('lw_pm_score')||'0',10)||0;}catch(e){}
  level=bestLevel;target=500+(level-1)*300;moves=30+level*2;

  ms(a,'Level <strong id="PMlv">1</strong> · Target <strong id="PMtg">500</strong> · best L<strong id="PMbest">'+bestLevel+'</strong>');
  mm(a);
  var pan=document.createElement('div');
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;text-align:center;';
  a.appendChild(pan);
  var hud=document.createElement('div');
  hud.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:6px;background:rgba(26,31,23,0.5);border-radius:8px;margin:4px 0;font-family:DM Mono,monospace;';
  hud.innerHTML='<div><div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:#7ab356;letter-spacing:0.08em;">SCORE</div><div id="PMsc" style="font-size:1.1rem;color:#c8a84b;">0</div></div><div><div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:#7ab356;letter-spacing:0.08em;">LEVEL</div><div id="PMlv2" style="font-size:1.1rem;color:#e8dcc8;">1</div></div><div><div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:#7ab356;letter-spacing:0.08em;">MOVES</div><div id="PMmv" style="font-size:1.1rem;color:#e8dcc8;">30</div></div>';
  pan.appendChild(hud);
  var bar=document.createElement('div');
  bar.style.cssText='width:90%;max-width:300px;height:6px;background:rgba(26,36,22,0.5);border-radius:3px;margin:4px auto;overflow:hidden;';
  bar.innerHTML='<div id="PMbar" style="height:100%;background:#7ab356;transition:width .3s;width:100%;"></div>';
  pan.appendChild(bar);
  canvas=document.createElement('canvas');
  canvas.style.cssText='display:block;border-radius:8px;margin:4px auto;touch-action:none;';
  pan.appendChild(canvas);
  mc(a).innerHTML='<button class="gb" onclick="_PMN()">NEW GAME</button>';

  function initCanvas(){
    ctx=canvas.getContext('2d');
    dpr=window.devicePixelRatio||1;
    var maxSize=Math.min((a.clientWidth||360)-24,360);
    CELL=Math.floor(maxSize/COLS);
    var total=COLS*CELL;
    canvas.width=total*dpr;canvas.height=ROWS*CELL*dpr;
    canvas.style.width=total+'px';canvas.style.height=(ROWS*CELL)+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function initGrid(){
    grid=[];
    for(var r=0;r<ROWS;r++){grid[r]=[];
      for(var c=0;c<COLS;c++){
        var t;
        do{t=Math.floor(Math.random()*TYPES);}
        while((c>=2&&grid[r][c-1].type===t&&grid[r][c-2].type===t)||
              (r>=2&&grid[r-1][c].type===t&&grid[r-2][c].type===t));
        grid[r][c]={type:t,y:r*CELL,targetY:r*CELL,scale:1,special:null,stripeDir:null,spawnAnim:0};
      }
    }
  }

  // Raw match finder: returns {hGroups, vGroups} of runs >=3.
  // Each group is array of {r,c} and has .dir, .type.
  function rawRuns(){
    var hGroups=[],vGroups=[];
    for(var r=0;r<ROWS;r++){
      var c=0;
      while(c<COLS-2){
        if(grid[r][c]&&grid[r][c+1]&&grid[r][c+2]&&grid[r][c].type===grid[r][c+1].type&&grid[r][c].type===grid[r][c+2].type&&grid[r][c].type>=0){
          var g=[{r:r,c:c},{r:r,c:c+1},{r:r,c:c+2}];
          var nc=c+3;
          while(nc<COLS&&grid[r][nc]&&grid[r][nc].type===grid[r][c].type){g.push({r:r,c:nc});nc++;}
          g.dir='h';g.type=grid[r][c].type;
          hGroups.push(g);c=nc;
        } else c++;
      }
    }
    for(var cc=0;cc<COLS;cc++){
      var r2=0;
      while(r2<ROWS-2){
        if(grid[r2][cc]&&grid[r2+1][cc]&&grid[r2+2][cc]&&grid[r2][cc].type===grid[r2+1][cc].type&&grid[r2][cc].type===grid[r2+2][cc].type&&grid[r2][cc].type>=0){
          var g2=[{r:r2,c:cc},{r:r2+1,c:cc},{r:r2+2,c:cc}];
          var nr=r2+3;
          while(nr<ROWS&&grid[nr][cc]&&grid[nr][cc].type===grid[r2][cc].type){g2.push({r:nr,c:cc});nr++;}
          g2.dir='v';g2.type=grid[r2][cc].type;
          vGroups.push(g2);r2=nr;
        } else r2++;
      }
    }
    return {h:hGroups,v:vGroups};
  }

  // Legacy helper retained for move-validity checks (doesn't care about specials)
  function findMatches(){
    var runs=rawRuns();
    var out=[];
    for(var i=0;i<runs.h.length;i++)out.push(runs.h[i]);
    for(var j=0;j<runs.v.length;j++)out.push(runs.v[j]);
    return out;
  }

  // Detect matches AND spawn specials. lastSwap={r,c} or null.
  // Returns {toClear: obj keyed "r,c", spawns: [{r,c,special,stripeDir,type}]}.
  function detectMatches(lastSwap){
    var runs=rawRuns();
    var toClear={},spawns=[],consumed={};
    // Bucket by cell for L/T detection
    var hByCell={},vByCell={};
    var i,j,g,m;
    for(i=0;i<runs.h.length;i++){g=runs.h[i];for(j=0;j<g.length;j++){hByCell[g[j].r+','+g[j].c]=i;}}
    for(i=0;i<runs.v.length;i++){g=runs.v[i];for(j=0;j<g.length;j++){vByCell[g[j].r+','+g[j].c]=i;}}

    // L/T shapes: any cell in both h and v group where combined unique = 5
    var ltSpawned={}; // hIdx+'x'+vIdx
    for(var key in hByCell){
      if(vByCell.hasOwnProperty(key)){
        var hi=hByCell[key],vi=vByCell[key];
        var combo=hi+'x'+vi;
        if(ltSpawned[combo])continue;
        var hg=runs.h[hi],vg=runs.v[vi];
        var uniq={},ukey;
        for(j=0;j<hg.length;j++){ukey=hg[j].r+','+hg[j].c;uniq[ukey]=1;}
        for(j=0;j<vg.length;j++){ukey=vg[j].r+','+vg[j].c;uniq[ukey]=1;}
        var uc=0;for(ukey in uniq){uc++;}
        if(uc>=5){
          ltSpawned[combo]=1;
          var kp=key.split(',');
          var sr=parseInt(kp[0],10),sc=parseInt(kp[1],10);
          spawns.push({r:sr,c:sc,special:'burst',type:hg.type});
          // Mark these groups as consumed for spawn purposes
          consumed['h'+hi]=1;consumed['v'+vi]=1;
          for(j=0;j<hg.length;j++)toClear[hg[j].r+','+hg[j].c]=1;
          for(j=0;j<vg.length;j++)toClear[vg[j].r+','+vg[j].c]=1;
        }
      }
    }

    // Straight runs: size>=5 spawn spore, size===4 spawn vine
    function pickSpawnCell(group){
      if(lastSwap){
        for(var k=0;k<group.length;k++){
          if(group[k].r===lastSwap.r&&group[k].c===lastSwap.c)return group[k];
        }
      }
      return group[Math.floor(group.length/2)];
    }
    for(i=0;i<runs.h.length;i++){
      if(consumed['h'+i])continue;
      g=runs.h[i];
      for(j=0;j<g.length;j++)toClear[g[j].r+','+g[j].c]=1;
      if(g.length>=5){var sc=pickSpawnCell(g);spawns.push({r:sc.r,c:sc.c,special:'spore',type:-1});}
      else if(g.length===4){var sc2=pickSpawnCell(g);spawns.push({r:sc2.r,c:sc2.c,special:'vine',stripeDir:'v',type:g.type});}
    }
    for(i=0;i<runs.v.length;i++){
      if(consumed['v'+i])continue;
      g=runs.v[i];
      for(j=0;j<g.length;j++)toClear[g[j].r+','+g[j].c]=1;
      if(g.length>=5){var sc3=pickSpawnCell(g);spawns.push({r:sc3.r,c:sc3.c,special:'spore',type:-1});}
      else if(g.length===4){var sc4=pickSpawnCell(g);spawns.push({r:sc4.r,c:sc4.c,special:'vine',stripeDir:'h',type:g.type});}
    }

    // Dedupe spawns per cell: burst > spore > vine
    var rank={burst:3,spore:2,vine:1};
    var spawnMap={};
    for(i=0;i<spawns.length;i++){
      var sp=spawns[i],sk=sp.r+','+sp.c;
      if(!spawnMap[sk]||rank[sp.special]>rank[spawnMap[sk].special])spawnMap[sk]=sp;
    }
    var finalSpawns=[];
    for(var sk2 in spawnMap){
      finalSpawns.push(spawnMap[sk2]);
      delete toClear[sk2]; // spawn cell is kept, not cleared
    }
    return {toClear:toClear,spawns:finalSpawns};
  }

  function inBounds(r,c){return r>=0&&r<ROWS&&c>=0&&c<COLS;}

  // Activation BFS: given initial toClear, repeatedly expand any specials
  // inside the set into their effect cells. activatedSet prevents re-entry.
  function expandActivations(toClear,pendingBurstPop){
    var activated={};
    var queue=[];
    for(var k in toClear)queue.push(k);
    while(queue.length>0){
      var key=queue.shift();
      var p=key.split(','),r=parseInt(p[0],10),c=parseInt(p[1],10);
      if(activated[key])continue;
      activated[key]=1;
      var cell=grid[r]&&grid[r][c];
      if(!cell||!cell.special)continue;
      var spec=cell.special,dir=cell.stripeDir;
      if(spec==='vine'){
        fx.push({kind:'sweep',dir:dir,r:r,c:c,t:Date.now()});
        if(dir==='h'){
          for(var cc=0;cc<COLS;cc++){var nk=r+','+cc;if(!toClear[nk]){toClear[nk]=1;queue.push(nk);}}
        } else {
          for(var rr=0;rr<ROWS;rr++){var nk2=rr+','+c;if(!toClear[nk2]){toClear[nk2]=1;queue.push(nk2);}}
        }
      } else if(spec==='burst'){
        fx.push({kind:'flash',r:r,c:c,size:3,t:Date.now()});
        for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
          var rr2=r+dr,cc2=c+dc;if(!inBounds(rr2,cc2))continue;
          var nk3=rr2+','+cc2;if(!toClear[nk3]){toClear[nk3]=1;queue.push(nk3);}
        }
        // Queue second detonation
        pendingBurstPop.push({r:r,c:c});
      } else if(spec==='spore'){
        // Inert when activated by chain without swap context: clear random color
        var tgt=Math.floor(Math.random()*TYPES);
        clearColor(tgt,toClear,queue);
      }
    }
    return activated;
  }

  function clearColor(tgt,toClear,queue){
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
      var cell=grid[r][c];
      if(cell&&cell.type===tgt){
        var k=r+','+c;if(!toClear[k]){toClear[k]=1;if(queue)queue.push(k);}
        fx.push({kind:'beam',fromR:r,fromC:c,t:Date.now()});
      }
    }
  }

  function swap(r1,c1,r2,c2){var t=grid[r1][c1];grid[r1][c1]=grid[r2][c2];grid[r2][c2]=t;}
  function hasValidMove(){
    for(var r=0;r<ROWS;r++){
      for(var c=0;c<COLS;c++){
        if(c<COLS-1){swap(r,c,r,c+1);if(findMatches().length>0){swap(r,c,r,c+1);return true;}swap(r,c,r,c+1);}
        if(r<ROWS-1){swap(r,c,r+1,c);if(findMatches().length>0){swap(r,c,r+1,c);return true;}swap(r,c,r+1,c);}
      }
    }
    return false;
  }

  // Handle a swap combo between two specials. Returns true if handled.
  function handleSpecialCombo(a,b,toClear,queue,pendingBurstPop){
    if(!a||!b)return false;
    var sa=a.cell.special,sb=b.cell.special;
    if(!sa&&!sb)return false;
    var pts=0;
    if(sa==='spore'&&sb==='spore'){
      for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){var k=r+','+c;toClear[k]=1;queue.push(k);}
      pts=2000;score+=pts;sm('DOUBLE SPORE! +'+pts);return true;
    }
    if(sa==='spore'||sb==='spore'){
      var sporeCell=sa==='spore'?a:b,otherCell=sa==='spore'?b:a;
      var tgt=otherCell.cell.type;
      if(tgt<0){ // other is also a special type (-1) — fallback random
        tgt=Math.floor(Math.random()*TYPES);
      }
      var convertTo=otherCell.cell.special||'burst';
      for(var rr=0;rr<ROWS;rr++)for(var cc=0;cc<COLS;cc++){
        var cell=grid[rr][cc];
        if(cell&&cell.type===tgt){
          cell.special=convertTo;
          if(convertTo==='vine')cell.stripeDir=Math.random()<0.5?'h':'v';
          var k2=rr+','+cc;toClear[k2]=1;queue.push(k2);
        }
      }
      // Also clear the two specials themselves
      toClear[sporeCell.r+','+sporeCell.c]=1;queue.push(sporeCell.r+','+sporeCell.c);
      pts=500;score+=pts;sm('SPORE COMBO! +'+pts);return true;
    }
    if(sa==='vine'&&sb==='vine'){
      // cross-clear on target b
      var tr=b.r,tc=b.c;
      for(var cc2=0;cc2<COLS;cc2++){var k3=tr+','+cc2;toClear[k3]=1;queue.push(k3);}
      for(var rr2=0;rr2<ROWS;rr2++){var k4=rr2+','+tc;toClear[k4]=1;queue.push(k4);}
      pts=300;score+=pts;sm('VINE CROSS! +'+pts);return true;
    }
    if((sa==='vine'&&sb==='burst')||(sa==='burst'&&sb==='vine')){
      var tr2=b.r,tc2=b.c;
      for(var dc=-1;dc<=1;dc++)for(var ccA=0;ccA<COLS;ccA++){var rA=tr2+dc;if(!inBounds(rA,ccA))continue;var kA=rA+','+ccA;toClear[kA]=1;queue.push(kA);}
      for(var dr2=-1;dr2<=1;dr2++)for(var rrA=0;rrA<ROWS;rrA++){var cA=tc2+dr2;if(!inBounds(rrA,cA))continue;var kB=rrA+','+cA;toClear[kB]=1;queue.push(kB);}
      pts=600;score+=pts;sm('PLUS BLAST! +'+pts);return true;
    }
    if(sa==='burst'&&sb==='burst'){
      var tr3=b.r,tc3=b.c;
      for(var dr3=-2;dr3<=2;dr3++)for(var dc3=-2;dc3<=2;dc3++){
        var rx=tr3+dr3,cx=tc3+dc3;if(!inBounds(rx,cx))continue;
        var kC=rx+','+cx;toClear[kC]=1;queue.push(kC);
      }
      fx.push({kind:'flash',r:tr3,c:tc3,size:5,t:Date.now()});
      pts=800;score+=pts;sm('MEGA BURST! +'+pts);return true;
    }
    return false;
  }

  // Collapse + refill after a clear pass
  function collapseAndRefill(){
    for(var c=0;c<COLS;c++){
      var writeR=ROWS-1;
      for(var r=ROWS-1;r>=0;r--){
        if(grid[r][c]){grid[writeR][c]=grid[r][c];grid[writeR][c].targetY=writeR*CELL;if(writeR!==r)grid[r][c]=null;writeR--;}
      }
      for(var r2=writeR;r2>=0;r2--){
        var t=Math.floor(Math.random()*TYPES);
        grid[r2][c]={type:t,y:(r2-writeR-1)*CELL,targetY:r2*CELL,scale:1,special:null,stripeDir:null,spawnAnim:0};
      }
    }
  }

  // Clear the cells in toClear. Scoring per special type.
  function applyClear(toClear){
    var vineCells=0,burstCells=0,sporeCells=0,plainCells=0;
    for(var k in toClear){
      var p=k.split(','),r=parseInt(p[0],10),c=parseInt(p[1],10);
      var cell=grid[r]&&grid[r][c];if(!cell)continue;
      if(cell.special==='vine')vineCells++;
      else if(cell.special==='burst')burstCells++;
      else if(cell.special==='spore')sporeCells++;
      else plainCells++;
      grid[r][c]=null;
    }
    return {v:vineCells,b:burstCells,s:sporeCells,p:plainCells};
  }

  // Main resolve pipeline (cascading). initialSwap sets spawn bias.
  function resolveCascade(initialSwap,swapPair,cb){
    var pendingBurstPop=[];
    function step(){
      var det=detectMatches(initialSwap);
      initialSwap=null; // only biases first pass
      var hasMatch=false;
      for(var k in det.toClear){hasMatch=true;break;}
      if(!hasMatch&&det.spawns.length===0&&pendingBurstPop.length===0&&(!swapPair)){
        comboCount=0;cb();return;
      }
      comboCount++;
      animating=true;

      // If we have a swapPair (special combo), add its effects first
      if(swapPair){
        var queue=[];
        handleSpecialCombo(swapPair.a,swapPair.b,det.toClear,queue,pendingBurstPop);
        swapPair=null;
      }

      // Expand specials that ended up in toClear
      var queueE=[];for(var qk in det.toClear)queueE.push(qk);
      // Rebuild with BFS so specials in the clear set cascade
      var expanded={};
      for(var i=0;i<queueE.length;i++)expanded[queueE[i]]=1;
      expandActivations(expanded,pendingBurstPop);
      // Merge
      for(var ek in expanded)det.toClear[ek]=1;

      // Apply spawns BEFORE clear (so they survive — spawn cells were
      // already removed from toClear in detectMatches)
      var spawnBonus=0;
      for(var s=0;s<det.spawns.length;s++){
        var sp=det.spawns[s];
        var existing=grid[sp.r][sp.c];
        if(existing){
          existing.special=sp.special;
          existing.stripeDir=sp.stripeDir||null;
          if(sp.special==='spore')existing.type=-1;
          existing.spawnAnim=Date.now();
        }
        if(sp.special==='vine'){spawnBonus+=50;sm('VINE WRAPPED!');}
        else if(sp.special==='burst'){spawnBonus+=100;sm('BLOOM BURST!');}
        else if(sp.special==='spore'){spawnBonus+=200;sm('SPORE CLOUD!');}
      }

      // Scale cells to 0 for anim
      for(var ck in det.toClear){var cp=ck.split(',');if(grid[cp[0]][cp[1]])grid[cp[0]][cp[1]].scale=0;}

      setTimeout(function(){
        var counts=applyClear(det.toClear);
        var pts=(counts.p*10+counts.v*20+counts.b*30+counts.s*40)*comboCount*level+spawnBonus;
        score+=pts;
        if(comboCount>1){sm(comboCount+'x COMBO! +'+pts);_play('snap');_e('milestone');}
        else if(pts>0){sm('+'+pts);_play('tap');_e('progress');}
        collapseAndRefill();
        updateHUD();

        // Second burst pop after gravity settle
        function nextStep(){
          if(pendingBurstPop.length>0){
            var pops=pendingBurstPop;pendingBurstPop=[];
            var secondClear={},secondQueue=[];
            for(var pi=0;pi<pops.length;pi++){
              var pr=pops[pi].r,pc=pops[pi].c;
              for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
                var rr=pr+dr,cc=pc+dc;if(!inBounds(rr,cc))continue;
                var k2=rr+','+cc;secondClear[k2]=1;secondQueue.push(k2);
              }
              fx.push({kind:'flash',r:pr,c:pc,size:3,t:Date.now()});
            }
            var newBurstPop=[];
            expandActivations(secondClear,newBurstPop);
            for(var sk in secondClear){var sp2=sk.split(',');if(grid[sp2[0]][sp2[1]])grid[sp2[0]][sp2[1]].scale=0;}
            setTimeout(function(){
              var cc2=applyClear(secondClear);
              var pp=(cc2.p*10+cc2.v*20+cc2.b*30+cc2.s*40)*comboCount*level;
              score+=pp;
              collapseAndRefill();
              updateHUD();
              for(var np=0;np<newBurstPop.length;np++)pendingBurstPop.push(newBurstPop[np]);
              setTimeout(step,250);
            },200);
          } else {
            setTimeout(step,250);
          }
        }
        if(pendingBurstPop.length>0){setTimeout(nextStep,120);}
        else setTimeout(step,250); // was synchronous step() — could stack-overflow on long cascades AND skipped clear animation
      },200);
    }
    step();
  }

  function updateHUD(){
    var e;
    if(e=document.getElementById('PMsc'))e.textContent=score;
    if(e=document.getElementById('PMlv2'))e.textContent=level;
    if(e=document.getElementById('PMlv'))e.textContent=level;
    if(e=document.getElementById('PMtg'))e.textContent=target;
    if(e=document.getElementById('PMmv'))e.textContent=moves;
    if(e=document.getElementById('PMbar'))e.style.width=Math.max(0,moves/30*100)+'%';
  }
  function checkState(){
    if(score>=target){
      level++;moves=30+level*2;target=500+level*300;score=0;
      sm('LEVEL '+(level-1)+' COMPLETE!');_playWin();
      if(level>bestLevel){bestLevel=level;try{localStorage.setItem('lw_pm_level',String(bestLevel));}catch(e){}var bel=document.getElementById('PMbest');if(bel)bel.textContent=bestLevel;}
      // Was: only fired game_win on level 2. Players who cleared 5
      // levels never got a win record after the first. Now writes a
      // fresh _sr on every level clear and keeps milestone events for
      // additional Sunbeams.
      if(!won){won=true;_e('game_win');}
      else _e('milestone');
      _sr('petalmatch',{w:true,s:score,lv:level-1});
      initGrid();while(findMatches().length>0)initGrid();
      updateHUD();render();return;
    }
    if(moves<=0){
      sm('Out of moves. Final '+score);_play('lose');
      if(!won){_e('game_loss');_sr('petalmatch',{w:false,s:score,lv:level});}
      else _sr('petalmatch',{w:true,s:score,lv:level});
      return;
    }
    if(!hasValidMove()){sm('No moves — shuffling!');initGrid();while(findMatches().length>0)initGrid();}
  }

  function drawGem(cell,cx,cy,sz){
    var spec=cell.special;
    if(cell.type===-1||spec==='spore'){
      // rainbow spore
      var grad=ctx.createConicGradient?ctx.createConicGradient(spinAngle,cx,cy):null;
      if(grad){
        grad.addColorStop(0,'#c47a7a');grad.addColorStop(0.17,'#c8a84b');grad.addColorStop(0.33,'#7ab356');
        grad.addColorStop(0.5,'#5b9bd5');grad.addColorStop(0.67,'#9b6ba3');grad.addColorStop(0.83,'#e8dcc8');grad.addColorStop(1,'#c47a7a');
        ctx.fillStyle=grad;
      } else ctx.fillStyle='#e8dcc8';
      ctx.beginPath();ctx.arc(cx,cy,sz,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
      return;
    }
    var gem=GEMS[cell.type]||GEMS[0];
    ctx.fillStyle=gem.color;
    ctx.beginPath();ctx.arc(cx,cy,sz,0,Math.PI*2);ctx.fill();
    if(spec==='vine'){
      // stripe overlay
      ctx.save();ctx.strokeStyle='rgba(255,255,255,0.85)';ctx.lineWidth=Math.max(2,sz*0.18);
      if(cell.stripeDir==='h'){
        ctx.beginPath();ctx.moveTo(cx-sz,cy);ctx.lineTo(cx+sz,cy);ctx.stroke();
      } else {
        ctx.beginPath();ctx.moveTo(cx,cy-sz);ctx.lineTo(cx,cy+sz);ctx.stroke();
      }
      ctx.restore();
    } else if(spec==='burst'){
      ctx.save();
      var pulse=0.6+0.4*Math.sin(Date.now()*0.006);
      ctx.globalAlpha=pulse;ctx.strokeStyle='#ffd86b';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(cx,cy,sz*1.15,0,Math.PI*2);ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle='rgba(255,255,255,0.2)';
    ctx.beginPath();ctx.arc(cx-sz*0.2,cy-sz*0.2,sz*0.5,0,Math.PI*2);ctx.fill();
  }

  function drawFx(){
    var now=Date.now(),keep=[];
    for(var i=0;i<fx.length;i++){
      var f=fx[i],age=now-f.t;
      if(f.kind==='sweep'){
        if(age>180)continue;
        var a2=1-age/180;
        ctx.save();ctx.globalAlpha=a2;ctx.fillStyle='rgba(200,168,75,0.6)';
        if(f.dir==='h')ctx.fillRect(0,f.r*CELL,COLS*CELL,CELL);
        else ctx.fillRect(f.c*CELL,0,CELL,ROWS*CELL);
        ctx.restore();
      } else if(f.kind==='flash'){
        if(age>180)continue;
        var a3=1-age/180,half=(f.size||3)/2;
        ctx.save();ctx.globalAlpha=a3;ctx.fillStyle='rgba(255,216,107,0.5)';
        ctx.fillRect((f.c-Math.floor(half))*CELL,(f.r-Math.floor(half))*CELL,f.size*CELL,f.size*CELL);
        ctx.restore();
      } else if(f.kind==='beam'){
        if(age>250)continue;
        // already rendered by clearColor flash; keep tiny dot
      }
      keep.push(f);
    }
    fx=keep;
  }

  function render(){
    if(!ctx)return;
    spinAngle+=0.02;
    var w=COLS*CELL,h=ROWS*CELL;
    ctx.fillStyle='#0d100c';ctx.fillRect(0,0,w,h);
    for(var r=0;r<ROWS;r++){
      for(var c=0;c<COLS;c++){
        ctx.fillStyle=(r+c)%2===0?'rgba(26,36,22,0.2)':'rgba(26,36,22,0.1)';
        ctx.fillRect(c*CELL,r*CELL,CELL,CELL);
      }
    }
    for(r=0;r<ROWS;r++){
      for(c=0;c<COLS;c++){
        var cell=grid[r][c];if(!cell)continue;
        if(cell.y!==cell.targetY){cell.y+=(cell.targetY-cell.y)*0.3;if(Math.abs(cell.y-cell.targetY)<0.5)cell.y=cell.targetY;}
        var cx=c*CELL+CELL/2,cy=cell.y+CELL/2;
        var spawnBoost=0;
        if(cell.spawnAnim){
          var age=Date.now()-cell.spawnAnim;
          if(age<200){var t=age/200;spawnBoost=Math.sin(t*Math.PI)*0.3;}
          else cell.spawnAnim=0;
        }
        var sz=CELL*0.4*cell.scale*(1+spawnBoost);
        drawGem(cell,cx,cy,sz);
        if(selected&&selected.r===r&&selected.c===c){
          ctx.strokeStyle='#e8dcc8';ctx.lineWidth=2;
          ctx.strokeRect(c*CELL+2,r*CELL+2,CELL-4,CELL-4);
        }
      }
    }
    drawFx();
  }
  var rafId=0;
  function loop(){
    if(!document.body.classList.contains('game-active')){rafId=0;return;}
    render();rafId=requestAnimationFrame(loop);
  }

  var tsR=-1,tsC=-1;
  function handleStart(x,y){
    if(animating)return;
    var rect=canvas.getBoundingClientRect();
    tsR=Math.floor((y-rect.top)/CELL);tsC=Math.floor((x-rect.left)/CELL);
    if(tsR<0||tsR>=ROWS||tsC<0||tsC>=COLS){tsR=-1;return;}
    selected={r:tsR,c:tsC};
  }
  function handleEnd(x,y){
    if(animating||tsR<0)return;
    var rect=canvas.getBoundingClientRect();
    var endR=Math.floor((y-rect.top)/CELL),endC=Math.floor((x-rect.left)/CELL);
    var dr=endR-tsR,dc=endC-tsC;
    var swapR=tsR,swapC=tsC;
    if(Math.abs(dc)>Math.abs(dr)){swapC+=dc>0?1:-1;}
    else if(Math.abs(dr)>0){swapR+=dr>0?1:-1;}
    else{selected=null;return;}
    if(swapR<0||swapR>=ROWS||swapC<0||swapC>=COLS){selected=null;return;}
    var cellA=grid[tsR][tsC],cellB=grid[swapR][swapC];
    var aSpec=cellA&&cellA.special,bSpec=cellB&&cellB.special;
    swap(tsR,tsC,swapR,swapC);

    // Special combo swap: always valid if either side is special
    if(aSpec||bSpec){
      moves--;updateHUD();animating=true;
      var swapPair=null;
      if(aSpec&&bSpec){
        swapPair={a:{r:swapR,c:swapC,cell:grid[swapR][swapC]},b:{r:tsR,c:tsC,cell:grid[tsR][tsC]}};
      } else if(aSpec===null&&bSpec==='spore'){
        // spore at swapR/swapC (moved from tsR/tsC? After swap: grid[swapR][swapC]=A(plain), grid[tsR][tsC]=B(spore))
        swapPair={a:{r:tsR,c:tsC,cell:grid[tsR][tsC]},b:{r:swapR,c:swapC,cell:grid[swapR][swapC]}};
      } else if(aSpec==='spore'&&bSpec===null){
        swapPair={a:{r:swapR,c:swapC,cell:grid[swapR][swapC]},b:{r:tsR,c:tsC,cell:grid[tsR][tsC]}};
      }
      // For spore+normal, trigger color clear directly
      if(swapPair&&(swapPair.a.cell.special==='spore')&&!swapPair.b.cell.special){
        var tgt=swapPair.b.cell.type;
        var toClear={},queue=[];
        toClear[swapPair.a.r+','+swapPair.a.c]=1;queue.push(swapPair.a.r+','+swapPair.a.c);
        toClear[swapPair.b.r+','+swapPair.b.c]=1;
        if(tgt>=0)clearColor(tgt,toClear,queue);
        var pendBP=[];
        expandActivations(toClear,pendBP);
        var counts=applyClear(toClear);
        var pts=(counts.p*10+counts.v*20+counts.b*30+counts.s*40)*5*level;
        score+=pts;sm('SPORE! +'+pts);_play('snap');
        collapseAndRefill();updateHUD();
        setTimeout(function(){resolveCascade(null,null,function(){animating=false;selected=null;checkState();});},250);
      } else if(swapPair===null&&(aSpec==='vine'||aSpec==='burst'||bSpec==='vine'||bSpec==='burst')){
        // Bug fix: vine or burst swapped with a plain gem was NOT activating —
        // player lost a move for nothing. Now we explicitly seed toClear with
        // the special's NEW position (post-swap) so expandActivations fires its
        // effect (sweep row/col for vine, 3x3 burst for burst).
        var spR=aSpec?swapR:tsR,spC=aSpec?swapC:tsC; // after swap, A moved to (swapR,swapC)
        var toClear2={},pendBP2=[];
        toClear2[spR+','+spC]=1;
        expandActivations(toClear2,pendBP2);
        var counts2=applyClear(toClear2);
        var pts2=(counts2.p*10+counts2.v*20+counts2.b*30+counts2.s*40)*level;
        score+=pts2;sm('💥 +'+pts2);_play('snap');
        collapseAndRefill();updateHUD();
        setTimeout(function(){resolveCascade(null,null,function(){animating=false;selected=null;checkState();});},250);
      } else {
        resolveCascade({r:swapR,c:swapC},swapPair,function(){animating=false;selected=null;checkState();});
      }
    } else if(findMatches().length>0){
      moves--;updateHUD();animating=true;
      resolveCascade({r:swapR,c:swapC},null,function(){animating=false;selected=null;checkState();});
    } else {swap(tsR,tsC,swapR,swapC);selected=null;_play('tap');}
    tsR=-1;tsC=-1;
  }
  canvas.addEventListener('touchstart',function(e){e.preventDefault();if(e.touches[0])handleStart(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
  canvas.addEventListener('touchend',function(e){e.preventDefault();if(e.changedTouches[0])handleEnd(e.changedTouches[0].clientX,e.changedTouches[0].clientY);},{passive:false});
  canvas.addEventListener('mousedown',function(e){handleStart(e.clientX,e.clientY);});
  canvas.addEventListener('mouseup',function(e){handleEnd(e.clientX,e.clientY);});

  window._PMN=function(){
    if(rafId)cancelAnimationFrame(rafId);
    initCanvas();level=1;score=0;moves=30;target=500;animating=false;selected=null;won=false;fx=[];
    initGrid();while(findMatches().length>0)initGrid();
    updateHUD();rafId=requestAnimationFrame(loop);
    sm('Swipe to swap. 4-match=Vine, 5=Spore, L/T=Burst');
  };
  _PMN();
};
})();
