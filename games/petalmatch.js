// ═══ PETAL MATCH — match-3 botanical swap puzzle ═══
// 8x8 grid, swipe adjacent to swap. 3+ in a row clears. Cascades combo.
// 30 moves per level, target score rises per level.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

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

  ms(a,'Level <strong id="PMlv">1</strong> · Target <strong id="PMtg">500</strong>');
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
        grid[r][c]={type:t,y:r*CELL,targetY:r*CELL,scale:1};
      }
    }
  }
  function findMatches(){
    var matches=[];
    for(var r=0;r<ROWS;r++){
      for(var c=0;c<COLS-2;c++){
        if(grid[r][c]&&grid[r][c+1]&&grid[r][c+2]&&grid[r][c].type===grid[r][c+1].type&&grid[r][c].type===grid[r][c+2].type){
          var m=[{r:r,c:c},{r:r,c:c+1},{r:r,c:c+2}];
          var nc=c+3;
          while(nc<COLS&&grid[r][nc]&&grid[r][nc].type===grid[r][c].type){m.push({r:r,c:nc});nc++;}
          matches.push(m);c=nc-3;
        }
      }
    }
    for(var c2=0;c2<COLS;c2++){
      for(var r2=0;r2<ROWS-2;r2++){
        if(grid[r2][c2]&&grid[r2+1][c2]&&grid[r2+2][c2]&&grid[r2][c2].type===grid[r2+1][c2].type&&grid[r2][c2].type===grid[r2+2][c2].type){
          var m2=[{r:r2,c:c2},{r:r2+1,c:c2},{r:r2+2,c:c2}];
          var nr=r2+3;
          while(nr<ROWS&&grid[nr][c2]&&grid[nr][c2].type===grid[r2][c2].type){m2.push({r:nr,c:c2});nr++;}
          matches.push(m2);r2=nr-3;
        }
      }
    }
    return matches;
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
  function resolveMatches(cb){
    var matches=findMatches();
    if(matches.length===0){comboCount=0;cb();return;}
    comboCount++;
    animating=true;
    var toRemove={},totalCleared=0;
    for(var i=0;i<matches.length;i++)for(var j=0;j<matches[i].length;j++){var m=matches[i][j];toRemove[m.r+','+m.c]=true;totalCleared++;}
    var pts=totalCleared*10*comboCount*level;
    score+=pts;
    if(comboCount>1){sm(comboCount+'x COMBO! +'+pts);_play('snap');_e('milestone');}
    else{sm('+'+pts);_play('tap');_e('progress');}
    for(var key in toRemove){var parts=key.split(',');if(grid[parts[0]][parts[1]])grid[parts[0]][parts[1]].scale=0;}
    setTimeout(function(){
      for(var k in toRemove){var p=k.split(',');grid[p[0]][p[1]]=null;}
      for(var c=0;c<COLS;c++){
        var writeR=ROWS-1;
        for(var r=ROWS-1;r>=0;r--){
          if(grid[r][c]){grid[writeR][c]=grid[r][c];grid[writeR][c].targetY=writeR*CELL;if(writeR!==r)grid[r][c]=null;writeR--;}
        }
        for(var r2=writeR;r2>=0;r2--){
          var t=Math.floor(Math.random()*TYPES);
          grid[r2][c]={type:t,y:(r2-writeR-1)*CELL,targetY:r2*CELL,scale:1};
        }
      }
      updateHUD();
      setTimeout(function(){resolveMatches(cb);},250);
    },200);
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
      // Clearing level 1 (advancing to level 2) is the canonical win
      // event — fires once per game session so the player gets a
      // proper win record and reward for the first clear. After that,
      // each additional level fires a milestone for incremental SB.
      if(level===2&&!won){won=true;_e('game_win');_sr('petalmatch',{w:true,s:score,lv:level-1});}
      else _e('milestone');
      initGrid();while(findMatches().length>0)initGrid();
      updateHUD();render();return;
    }
    if(moves<=0){
      sm('Out of moves. Final '+score);_play('lose');
      // Only record a loss if the player never cleared level 1.
      // Otherwise their session is logged as the win they earned.
      if(!won){_e('game_loss');_sr('petalmatch',{w:false,s:score,lv:level});}
      else _sr('petalmatch',{w:true,s:score,lv:level});
      return;
    }
    if(!hasValidMove()){sm('No moves — shuffling!');initGrid();while(findMatches().length>0)initGrid();}
  }
  function render(){
    if(!ctx)return;
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
        var gem=GEMS[cell.type];
        var cx=c*CELL+CELL/2,cy=cell.y+CELL/2;
        var sz=CELL*0.4*cell.scale;
        ctx.fillStyle=gem.color;
        ctx.beginPath();ctx.arc(cx,cy,sz,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.2)';
        ctx.beginPath();ctx.arc(cx-sz*0.2,cy-sz*0.2,sz*0.5,0,Math.PI*2);ctx.fill();
        if(selected&&selected.r===r&&selected.c===c){
          ctx.strokeStyle='#e8dcc8';ctx.lineWidth=2;
          ctx.strokeRect(c*CELL+2,r*CELL+2,CELL-4,CELL-4);
        }
      }
    }
  }
  var rafId=0;
  // Loop checks game-active so it dies when player exits — without
  // this it kept requesting frames forever on a detached canvas.
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
    swap(tsR,tsC,swapR,swapC);
    if(findMatches().length>0){
      moves--;updateHUD();animating=true;
      resolveMatches(function(){animating=false;selected=null;checkState();});
    } else {swap(tsR,tsC,swapR,swapC);selected=null;_play('tap');}
    tsR=-1;tsC=-1;
  }
  canvas.addEventListener('touchstart',function(e){e.preventDefault();if(e.touches[0])handleStart(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
  canvas.addEventListener('touchend',function(e){e.preventDefault();if(e.changedTouches[0])handleEnd(e.changedTouches[0].clientX,e.changedTouches[0].clientY);},{passive:false});
  canvas.addEventListener('mousedown',function(e){handleStart(e.clientX,e.clientY);});
  canvas.addEventListener('mouseup',function(e){handleEnd(e.clientX,e.clientY);});

  window._PMN=function(){
    if(rafId)cancelAnimationFrame(rafId);
    initCanvas();level=1;score=0;moves=30;target=500;animating=false;selected=null;won=false;
    initGrid();while(findMatches().length>0)initGrid();
    updateHUD();rafId=requestAnimationFrame(loop);
    sm('Swipe to swap adjacent petals');
  };
  _PMN();
};
})();
