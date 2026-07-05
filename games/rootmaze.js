// ═══ ROOT MAZE — Labyrinth rebuild ═══
// 5×5 shifting-tile treasure hunt. Build DOM once, draw canvas board
// each frame (small grid so full redraws are fine). Slide animation
// on row/col shifts, smarter AI with difficulty picker, target queue,
// responsive canvas sizing.
(function(){
'use strict';
var LWG=window._G;
var _e=LWG.e,_play=LWG.play,_playWin=LWG.playWin,_setDiff=LWG.setDiff,sm=LWG.sm,_sr=LWG.sr;

// ── Constants ───────────────────────────────────────────────────────────
// SZ is mutable — set at game start from the chosen variant. All the
// shift / reach / draw logic reads it as a module-level var, so larger
// grids "just work" without a deeper refactor.
var SZ=5;
var TREASURES=['🌻','🌹','🌷','🍄','🪻','🌵','🎋','🍀','🌸','🪴','🌺','🍁','🌾','🪷','🌿','🌱','🌳','🌲'];
// Connection arrays: [N,E,S,W] booleans — does the path exit this side?
var TYPES={
  S:[[1,0,1,0],[0,1,0,1]],           // Straight: two orientations
  C:[[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1]],  // Corner: four orientations
  T:[[1,1,1,0],[0,1,1,1],[1,0,1,1],[1,1,0,1]]   // T-junction: four orientations
};
// Variant = board shape. Each has a fixed size (odd) and a target count.
var VARIANTS={
  thicket:{size:5,treasuresEach:4,label:'THICKET',sub:'5×5 · 4 treasures · quick'},
  grove:  {size:7,treasuresEach:6,label:'GROVE',  sub:'7×7 · 6 treasures · deeper'},
  forest: {size:9,treasuresEach:8,label:'FOREST', sub:'9×9 · 8 treasures · long'}
};
var DIFF_META={
  easy:{label:'EASY MIRROR',sub:'Random shifts, greedy move.'},
  steady:{label:'STEADY MIRROR',sub:'Rotates spare, picks best shift for itself.'},
  keen:{label:'KEEN MIRROR',sub:'Also disrupts your best path.'}
};

// ── Styles ──────────────────────────────────────────────────────────────
(function injectStyle(){
  if(document.getElementById('rm-style'))return;
  var s=document.createElement('style');s.id='rm-style';
  s.textContent=[
    '@keyframes rmFade{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes rmPop{0%{transform:scale(0.5);opacity:0}55%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}',
    '#RMpan{max-width:min(100vw,520px);margin:0 auto;padding:6px;user-select:none;-webkit-user-select:none;box-sizing:border-box;font-family:Georgia,serif;animation:rmFade .3s ease}',
    // Difficulty picker
    '.RMdiffPick{display:flex;flex-direction:column;align-items:center;gap:14px;padding:26px 12px 14px;animation:rmFade .3s ease}',
    '.RMdiffTitle{font-family:Bebas Neue,sans-serif;font-size:1.7rem;letter-spacing:0.22em;color:#c8a84b}',
    '.RMdiffSub{font-family:Georgia,serif;font-size:0.78rem;color:rgba(232,220,200,0.72);text-align:center;max-width:320px;line-height:1.5}',
    '.RMdiffBtns{display:flex;flex-direction:column;gap:8px;width:100%;max-width:280px;margin-top:10px}',
    '.RMdiffBtn{min-height:58px;padding:10px 14px;border-radius:12px;background:rgba(26,36,22,0.85);border:1.5px solid rgba(122,179,86,0.35);color:#e8dcc8;font-family:Georgia,serif;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;flex-direction:column;align-items:flex-start;gap:2px}',
    '.RMdiffBtn:active{transform:scale(0.98);background:rgba(122,179,86,0.22)}',
    '.RMdiffBtn .RMdlv{font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.18em;color:#c8a84b}',
    '.RMdiffBtn .RMdsub{font-size:0.68rem;color:rgba(232,220,200,0.75)}',
    // Top bar
    '.RMtop{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:7px 8px;margin:2px 0 6px;background:linear-gradient(135deg,rgba(26,31,23,0.85),rgba(13,16,12,0.92));border:1.5px solid rgba(122,179,86,0.25);border-radius:10px;font-family:Bebas Neue,sans-serif}',
    '.RMtopCell{text-align:center}',
    '.RMtopLbl{font-size:0.58rem;letter-spacing:0.16em;color:rgba(232,220,200,0.55)}',
    '.RMtopVal{font-family:DM Mono,monospace;font-size:0.85rem;color:#c8a84b;font-weight:700;margin-top:1px}',
    // Target queue row
    '.RMquest{display:flex;gap:10px;justify-content:space-between;align-items:center;padding:6px 12px;margin:0 0 4px;background:rgba(12,16,10,0.55);border:1.5px solid rgba(122,179,86,0.22);border-radius:9px;font-family:Georgia,serif;font-size:0.72rem}',
    '.RMquestCell{display:flex;align-items:center;gap:6px}',
    '.RMquestLbl{font-family:Bebas Neue,sans-serif;font-size:0.58rem;letter-spacing:0.16em;color:rgba(232,220,200,0.55)}',
    '.RMquestCur{font-size:1.6rem;line-height:1;filter:drop-shadow(0 0 4px rgba(255,216,106,0.5))}',
    '.RMquestNext{font-size:1rem;opacity:0.55;line-height:1}',
    '.RMquestDone{color:#8fc57a;font-family:DM Mono,monospace;font-size:0.72rem}',
    // Status line
    '.RMstatus{text-align:center;font-family:Bebas Neue,sans-serif;font-size:0.82rem;letter-spacing:0.14em;padding:6px;margin:4px 0;border-radius:8px;background:rgba(26,31,23,0.65)}',
    '.RMstatus.shift{color:#c8a84b}',
    '.RMstatus.move{color:#8fc57a}',
    '.RMstatus.ai{color:rgba(232,220,200,0.7)}',
    '.RMstatus.over{color:#e8dcc8}',
    // Board container + canvas
    '.RMboardWrap{display:flex;justify-content:center;padding:2px 0}',
    '#RMboard{display:block;border-radius:8px;touch-action:none}',
    // Spare + actions
    '.RMspareRow{display:flex;align-items:center;gap:10px;justify-content:center;padding:8px 0;flex-wrap:wrap}',
    '.RMspareLbl{font-family:Bebas Neue,sans-serif;font-size:0.65rem;letter-spacing:0.14em;color:rgba(232,220,200,0.55)}',
    '#RMspare{border:2px solid #c8a84b;border-radius:6px;display:block;touch-action:none}',
    '.RMbtn{min-height:46px;padding:8px 14px;font-family:Bebas Neue,sans-serif;font-size:0.76rem;letter-spacing:0.14em;border-radius:9px;background:rgba(26,31,23,0.82);border:1.5px solid rgba(200,168,75,0.3);color:#c8a84b;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:4px}',
    '.RMbtn:active{transform:scale(0.96);background:rgba(200,168,75,0.22)}',
    '.RMbtn.primary{background:linear-gradient(180deg,rgba(122,179,86,0.32),rgba(74,124,53,0.4));border-color:rgba(122,179,86,0.55);color:#8fc57a;font-weight:700}',
    '.RMctrls{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;padding:4px 2px 8px}',
    // End card
    '.RMend{margin:14px auto;max-width:340px;padding:18px;background:linear-gradient(180deg,rgba(20,28,18,0.97),rgba(13,16,12,0.98));border:2px solid rgba(200,168,75,0.55);border-radius:14px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.6);animation:rmPop .32s cubic-bezier(.2,1.2,.3,1) both}',
    '.RMend.lose{border-color:rgba(199,80,80,0.45)}',
    '.RMendTitle{font-family:Bebas Neue,sans-serif;font-size:1.55rem;letter-spacing:0.14em;color:#ffdc70;margin-bottom:8px}',
    '.RMend.lose .RMendTitle{color:#e8dcc8}',
    '.RMendStats{font-family:DM Mono,monospace;font-size:0.82rem;color:#e8dcc8;margin-bottom:14px}'
  ].join('');
  document.head.appendChild(s);
})();

// ── State ───────────────────────────────────────────────────────────────
var S=null;
var hostEl=null, pan=null, topBar=null, questEl=null, statusEl=null, boardCanvas=null, boardCtx=null, spareCanvas=null, spareCtx=null, spareRow=null, ctrlRow=null, endCard=null;
var topEls={turn:null, phase:null, difficulty:null};
var animState=null;  // {axis:'row'|'col', idx, dir, startTime, durationMs}
var animFrameId=null;
var aiTimer=null;

// Canvas dimensions — set by sizeCanvas()
var CELL=60, PAD=26, BOARD_PX=360;

// ── Helpers ─────────────────────────────────────────────────────────────
function shuf(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function cloneTile(t){return {conn:t.conn.slice(), type:t.type, fixed:t.fixed, treasure:t.treasure};}
function cloneBoard(board){
  var out=[];
  for(var r=0;r<SZ;r++){out[r]=[];for(var c=0;c<SZ;c++)out[r][c]=cloneTile(board[r][c]);}
  return out;
}
function randomTile(){
  var types=['S','S','C','C','C','T','T'];
  var type=types[Math.floor(Math.random()*types.length)];
  var rotations=TYPES[type];
  var conn=rotations[Math.floor(Math.random()*rotations.length)].slice();
  return {conn:conn, type:type, fixed:false, treasure:null};
}

function canConnect(board, r1,c1, r2,c2){
  if(r2<0||r2>=SZ||c2<0||c2>=SZ)return false;
  var t1=board[r1][c1], t2=board[r2][c2];
  if(r2===r1-1)return t1.conn[0]&&t2.conn[2];
  if(r2===r1+1)return t1.conn[2]&&t2.conn[0];
  if(c2===c1-1)return t1.conn[3]&&t2.conn[1];
  if(c2===c1+1)return t1.conn[1]&&t2.conn[3];
  return false;
}
function getReachable(board, sr, sc){
  var vis={}; var q=[[sr,sc]]; vis[sr+','+sc]=true;
  while(q.length){
    var p=q.shift(); var r=p[0], c=p[1];
    var dirs=[[-1,0],[1,0],[0,-1],[0,1]];
    for(var i=0;i<4;i++){
      var nr=r+dirs[i][0], nc=c+dirs[i][1], key=nr+','+nc;
      if(!vis[key] && canConnect(board,r,c,nr,nc)){vis[key]=true; q.push([nr,nc]);}
    }
  }
  return vis;
}
function findTreasure(board, name){
  for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++) if(board[r][c].treasure===name)return [r,c];
  return null;
}

// ── Shift operations (pure: take state, return new state) ───────────────
// Applies the shift to board + spare + positions, returns new spare.
function applyShift(state, axis, idx, dir){
  var board=state.board;
  var newSpare;
  if(axis==='row'){
    if(dir===1){
      newSpare=board[idx][SZ-1];
      for(var c=SZ-1;c>0;c--) board[idx][c]=board[idx][c-1];
      board[idx][0]=state.spare;
      if(state.playerPos[0]===idx){state.playerPos[1]++; if(state.playerPos[1]>=SZ)state.playerPos[1]=0;}
      if(state.aiPos[0]===idx){state.aiPos[1]++; if(state.aiPos[1]>=SZ)state.aiPos[1]=0;}
    } else {
      newSpare=board[idx][0];
      for(var c2=0;c2<SZ-1;c2++) board[idx][c2]=board[idx][c2+1];
      board[idx][SZ-1]=state.spare;
      if(state.playerPos[0]===idx){state.playerPos[1]--; if(state.playerPos[1]<0)state.playerPos[1]=SZ-1;}
      if(state.aiPos[0]===idx){state.aiPos[1]--; if(state.aiPos[1]<0)state.aiPos[1]=SZ-1;}
    }
  } else {
    if(dir===1){
      newSpare=board[SZ-1][idx];
      for(var r=SZ-1;r>0;r--) board[r][idx]=board[r-1][idx];
      board[0][idx]=state.spare;
      if(state.playerPos[1]===idx){state.playerPos[0]++; if(state.playerPos[0]>=SZ)state.playerPos[0]=0;}
      if(state.aiPos[1]===idx){state.aiPos[0]++; if(state.aiPos[0]>=SZ)state.aiPos[0]=0;}
    } else {
      newSpare=board[0][idx];
      for(var r2=0;r2<SZ-1;r2++) board[r2][idx]=board[r2+1][idx];
      board[SZ-1][idx]=state.spare;
      if(state.playerPos[1]===idx){state.playerPos[0]--; if(state.playerPos[0]<0)state.playerPos[0]=SZ-1;}
      if(state.aiPos[1]===idx){state.aiPos[0]--; if(state.aiPos[0]<0)state.aiPos[0]=SZ-1;}
    }
  }
  newSpare.fixed=false;
  state.spare=newSpare;
}

// ── Shift with animation ────────────────────────────────────────────────
function startShift(axis, idx, dir){
  if(S.phase!=='shift') return;
  if(axis==='row' && (idx%2===0)) return;
  if(axis==='col' && (idx%2===0)) return;
  _play('dig');
  animState={axis:axis, idx:idx, dir:dir, startTime:performance.now(), durationMs:260};
  // While animating, player input is blocked. Board is drawn with interpolated offsets.
  S.phase='anim';
  startAnimLoop(function onDone(){
    applyShift(S, axis, idx, dir);
    S.phase='move';
    S.turns++;
    animState=null;
    drawAll();
    updateHUD();
  });
}

function startAnimLoop(onDone){
  if(animFrameId){cancelAnimationFrame(animFrameId);animFrameId=null;}
  function tick(){
    var now=performance.now();
    var t=Math.min(1, (now-animState.startTime)/animState.durationMs);
    drawAll();
    if(t>=1){
      animFrameId=null;
      onDone();
    } else {
      animFrameId=requestAnimationFrame(tick);
    }
  }
  animFrameId=requestAnimationFrame(tick);
}

// ── Movement ────────────────────────────────────────────────────────────
function movePlayer(r,c){
  if(S.phase!=='move')return;
  var reach=getReachable(S.board, S.playerPos[0], S.playerPos[1]);
  if(!reach[r+','+c]){sm("Can't reach there");return;}
  S.playerPos=[r,c];
  _play('snap');
  var tile=S.board[r][c];
  if(tile.treasure && S.playerTIdx<S.playerTargets.length && tile.treasure===S.playerTargets[S.playerTIdx]){
    sm('Found '+tile.treasure+'!');
    _e('progress');
    S.playerTIdx++;
    if(S.playerTIdx>=S.playerTargets.length){
      gameOver(true);
      return;
    }
  }
  S.phase='ai_shift';
  drawAll();
  updateHUD();
  aiTimer=setTimeout(aiTurn, 500);
}

// ── AI ──────────────────────────────────────────────────────────────────
// Difficulty levels:
//   easy   — random shift, no spare rotation, greedy move toward target
//   steady — rotate spare to any of 4 orientations + try all 8 shifts,
//            pick the combo that brings AI closest to its target
//   keen   — also disrupts player's best path (maximize ai_progress -
//            player_potential)
function aiTurn(){
  if(S.phase==='gameover'){return;}
  var plan=chooseAIPlan();
  if(!plan){
    // Fallback: random
    var axes=[['row',1],['row',3],['col',1],['col',3]];
    var a=axes[Math.floor(Math.random()*axes.length)];
    plan={axis:a[0], idx:a[1], dir:Math.random()<0.5?1:-1, spareConn:S.spare.conn.slice()};
  }
  // Apply spare rotation first (instant) if different
  S.spare.conn=plan.spareConn;
  drawAll();
  // Slide animation
  _play('dig');
  animState={axis:plan.axis, idx:plan.idx, dir:plan.dir, startTime:performance.now(), durationMs:260};
  S.phase='anim';
  startAnimLoop(function onDone(){
    applyShift(S, plan.axis, plan.idx, plan.dir);
    S.turns++;
    animState=null;
    // AI move phase
    aiTimer=setTimeout(aiMove, 250);
  });
}
function aiMove(){
  var tName=S.aiTIdx<S.aiTargets.length?S.aiTargets[S.aiTIdx]:null;
  var tpos=tName?findTreasure(S.board, tName):null;
  if(tpos){
    var reach=getReachable(S.board, S.aiPos[0], S.aiPos[1]);
    if(reach[tpos[0]+','+tpos[1]]){
      S.aiPos=[tpos[0], tpos[1]];
      var tile=S.board[tpos[0]][tpos[1]];
      if(tile.treasure===tName){
        sm('Mirror found '+tile.treasure);
        S.aiTIdx++;
        if(S.aiTIdx>=S.aiTargets.length){gameOver(false); return;}
      }
    } else {
      // Walk as close as possible toward target within reachable set
      var best=S.aiPos, bd=Infinity;
      for(var key in reach){
        var parts=key.split(',');
        var rr=parseInt(parts[0],10), cc=parseInt(parts[1],10);
        var dist=Math.abs(rr-tpos[0])+Math.abs(cc-tpos[1]);
        if(dist<bd){bd=dist; best=[rr,cc];}
      }
      S.aiPos=best;
    }
  }
  S.phase='shift';
  drawAll();
  updateHUD();
}

function shiftSlots(){
  // Odd indices only are shiftable — scales with SZ (5→[1,3], 7→[1,3,5], 9→[1,3,5,7])
  var out=[];
  for(var i=1;i<SZ;i+=2) out.push(i);
  return out;
}
function allShiftMoves(){
  var slots=shiftSlots();
  var out=[];
  slots.forEach(function(i){
    out.push({axis:'row',idx:i,dir:1});
    out.push({axis:'row',idx:i,dir:-1});
    out.push({axis:'col',idx:i,dir:1});
    out.push({axis:'col',idx:i,dir:-1});
  });
  return out;
}

function chooseAIPlan(){
  var diff=S.difficulty;
  if(diff==='easy'){
    var moves=allShiftMoves();
    var pick=moves[Math.floor(Math.random()*moves.length)];
    return {axis:pick.axis, idx:pick.idx, dir:pick.dir, spareConn:S.spare.conn.slice()};
  }
  // Enumerate all possible (shift × spare rotation) combos, score each
  var tName=S.aiTIdx<S.aiTargets.length?S.aiTargets[S.aiTIdx]:null;
  if(!tName)return null;
  var best=null, bestScore=-Infinity;
  var shifts=allShiftMoves();
  var rotations=rotationsFor(S.spare);
  shifts.forEach(function(sh){
    rotations.forEach(function(rotConn){
      var sim={
        board:cloneBoard(S.board),
        spare:{conn:rotConn.slice(), type:S.spare.type, fixed:false, treasure:S.spare.treasure},
        playerPos:[S.playerPos[0],S.playerPos[1]],
        aiPos:[S.aiPos[0],S.aiPos[1]]
      };
      applyShift(sim, sh.axis, sh.idx, sh.dir);
      var tpos=findTreasure(sim.board, tName);
      if(!tpos)return;  // shouldn't happen with 12 treasures
      var aiReach=getReachable(sim.board, sim.aiPos[0], sim.aiPos[1]);
      var aiScore;
      if(aiReach[tpos[0]+','+tpos[1]]){
        aiScore=100;  // can reach target THIS turn
      } else {
        // How close can AI get?
        var minDist=Infinity;
        for(var k in aiReach){
          var pp=k.split(','); var rr=parseInt(pp[0],10), cc=parseInt(pp[1],10);
          var d=Math.abs(rr-tpos[0])+Math.abs(cc-tpos[1]);
          if(d<minDist) minDist=d;
        }
        aiScore=-minDist;
      }
      var totalScore=aiScore;
      if(diff==='keen'){
        // Estimate how good this shift is for the PLAYER's next move
        var pName=S.playerTIdx<S.playerTargets.length?S.playerTargets[S.playerTIdx]:null;
        if(pName){
          var ppos=findTreasure(sim.board, pName);
          if(ppos){
            var pReach=getReachable(sim.board, sim.playerPos[0], sim.playerPos[1]);
            var pScore;
            if(pReach[ppos[0]+','+ppos[1]]) pScore=100;
            else {
              var pMin=Infinity;
              for(var kk in pReach){
                var ppp=kk.split(','); var prr=parseInt(ppp[0],10), pcc=parseInt(ppp[1],10);
                var pd=Math.abs(prr-ppos[0])+Math.abs(pcc-ppos[1]);
                if(pd<pMin) pMin=pd;
              }
              pScore=-pMin;
            }
            // Penalize plans that let the player win next turn
            totalScore -= pScore * 0.7;
          }
        }
      }
      if(totalScore>bestScore){
        bestScore=totalScore;
        best={axis:sh.axis, idx:sh.idx, dir:sh.dir, spareConn:rotConn.slice()};
      }
    });
  });
  return best;
}
function rotationsFor(tile){
  // Returns all 4 possible connection arrays (rotated 90° each), deduped.
  var list=TYPES[tile.type];
  return list.map(function(c){return c.slice();});
}

// ── Game over ───────────────────────────────────────────────────────────
function gameOver(playerWon){
  S.phase='gameover';
  animState=null;
  if(playerWon){_e('game_win');_playWin();sm('Maze mastered! '+S.turns+' turns');
    _sr('rootmaze',{w:true,s:Math.max(1,120-S.turns),r:S.turns});
    try{
      var bestKey='lw_rootmaze_best_'+S.variant+'_'+S.difficulty;
      var prev=parseInt(localStorage.getItem(bestKey)||'9999',10);
      if(S.turns<prev)localStorage.setItem(bestKey, String(S.turns));
    }catch(e){}
  } else {
    _e('game_loss');_play('lose');sm('Mirror wins the maze');
    _sr('rootmaze',{w:false,s:0,r:S.turns});
  }
  drawAll();
  updateHUD();
  showEndCard(playerWon);
}

// ── Rendering ───────────────────────────────────────────────────────────
function sizeCanvas(){
  // Fit canvas to viewport with a sensible upper bound
  var avail=Math.min(window.innerWidth-18, 460);
  // cell size: avail = (SZ+2*(PAD/CELL))*CELL. We'll set PAD = cell*0.42.
  var cell=Math.floor((avail-40)/(SZ+0.84));
  CELL=Math.max(44, Math.min(cell, 80));
  PAD=Math.max(24, Math.floor(CELL*0.42));
  BOARD_PX=SZ*CELL+PAD*2;
  if(boardCanvas){
    var dpr=window.devicePixelRatio||1;
    boardCanvas.width=BOARD_PX*dpr;
    boardCanvas.height=BOARD_PX*dpr;
    boardCanvas.style.width=BOARD_PX+'px';
    boardCanvas.style.height=BOARD_PX+'px';
    boardCtx=boardCanvas.getContext('2d');
    boardCtx.setTransform(dpr,0,0,dpr,0,0);
  }
  if(spareCanvas){
    var dpr2=window.devicePixelRatio||1;
    spareCanvas.width=CELL*dpr2;
    spareCanvas.height=CELL*dpr2;
    spareCanvas.style.width=CELL+'px';
    spareCanvas.style.height=CELL+'px';
    spareCtx=spareCanvas.getContext('2d');
    spareCtx.setTransform(dpr2,0,0,dpr2,0,0);
  }
}

function drawTile(ctx, x, y, tile, opts){
  opts=opts||{};
  ctx.save();
  // Background
  ctx.fillStyle=tile.fixed?'#2a2018':'#221a12';
  ctx.fillRect(x+1, y+1, CELL-2, CELL-2);
  if(opts.reachable){
    ctx.fillStyle='rgba(122,179,86,0.22)';
    ctx.fillRect(x+1, y+1, CELL-2, CELL-2);
    // Colorblind-safe cue: dashed ring, not just a color tint
    ctx.save();
    ctx.strokeStyle='rgba(232,220,200,0.9)';
    ctx.lineWidth=2;
    ctx.setLineDash([4,3]);
    ctx.strokeRect(x+4, y+4, CELL-8, CELL-8);
    ctx.restore();
  }
  if(tile.fixed){
    ctx.fillStyle='rgba(200,168,75,0.08)';
    ctx.fillRect(x+1, y+1, CELL-2, CELL-2);
  }
  // Path lines
  var cx=x+CELL/2, cy=y+CELL/2;
  var lw=Math.max(6, Math.floor(CELL*0.16));
  ctx.strokeStyle='#a88356';
  ctx.lineWidth=lw;
  ctx.lineCap='round';
  var conn=tile.conn;
  if(conn[0]){ ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,y+2); ctx.stroke(); }
  if(conn[1]){ ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x+CELL-2,cy); ctx.stroke(); }
  if(conn[2]){ ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,y+CELL-2); ctx.stroke(); }
  if(conn[3]){ ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x+2,cy); ctx.stroke(); }
  // Center knob
  ctx.fillStyle='#a88356';
  ctx.beginPath(); ctx.arc(cx, cy, Math.max(3, Math.floor(lw*0.45)), 0, Math.PI*2); ctx.fill();
  // Treasure
  if(tile.treasure){
    ctx.font=Math.floor(CELL*0.34)+'px sans-serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillStyle='#fff';
    ctx.fillText(tile.treasure, cx, cy);
  }
  ctx.restore();
}

function drawArrows(ctx){
  ctx.save();
  var arrowSize=Math.floor(PAD*0.85);
  for(var i=0;i<SZ;i++){
    if(i%2!==1)continue;
    // Backdrops
    ctx.fillStyle='rgba(200,168,75,0.18)';
    // top
    ctx.fillRect(PAD+i*CELL+3, 2, CELL-6, PAD-4);
    // bottom
    ctx.fillRect(PAD+i*CELL+3, PAD+SZ*CELL+2, CELL-6, PAD-4);
    // left
    ctx.fillRect(2, PAD+i*CELL+3, PAD-4, CELL-6);
    // right
    ctx.fillRect(PAD+SZ*CELL+2, PAD+i*CELL+3, PAD-4, CELL-6);
    // Arrows
    ctx.fillStyle='#c8a84b';
    ctx.font='bold '+arrowSize+'px sans-serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('▼', PAD+i*CELL+CELL/2, PAD/2);
    ctx.fillText('▲', PAD+i*CELL+CELL/2, PAD+SZ*CELL+PAD/2);
    ctx.fillText('►', PAD/2, PAD+i*CELL+CELL/2);
    ctx.fillText('◄', PAD+SZ*CELL+PAD/2, PAD+i*CELL+CELL/2);
  }
  ctx.restore();
}

function drawPawn(ctx, cx, cy, color, icon){
  ctx.save();
  var r=Math.max(10, Math.floor(CELL*0.18));
  ctx.fillStyle=color;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.35)';
  ctx.lineWidth=2;
  ctx.stroke();
  ctx.font=Math.floor(r*1.3)+'px sans-serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='#fff';
  ctx.fillText(icon, cx, cy);
  ctx.restore();
}

function drawAll(){
  drawBoard();
  drawSpare();
}

function drawBoard(){
  if(!boardCtx)return;
  boardCtx.fillStyle='#0d100c';
  boardCtx.fillRect(0, 0, BOARD_PX, BOARD_PX);
  drawArrows(boardCtx);
  var reach=null;
  if(S.phase==='move') reach=getReachable(S.board, S.playerPos[0], S.playerPos[1]);
  // Compute animation offsets
  var offsetX=0, offsetY=0, animRow=-1, animCol=-1, t=0;
  if(animState){
    t=Math.min(1, (performance.now()-animState.startTime)/animState.durationMs);
    var slide=(t<0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2);  // easeInOut
    if(animState.axis==='row'){
      animRow=animState.idx;
      offsetX=slide * animState.dir * CELL;
    } else {
      animCol=animState.idx;
      offsetY=slide * animState.dir * CELL;
    }
  }
  for(var r=0;r<SZ;r++){
    for(var c=0;c<SZ;c++){
      var x=PAD+c*CELL, y=PAD+r*CELL;
      var dx=0, dy=0;
      if(r===animRow) dx=offsetX;
      if(c===animCol) dy=offsetY;
      // Clip to board so tiles don't draw outside during slide
      boardCtx.save();
      boardCtx.beginPath();
      boardCtx.rect(PAD, PAD, SZ*CELL, SZ*CELL);
      boardCtx.clip();
      drawTile(boardCtx, x+dx, y+dy, S.board[r][c], {reachable: reach && reach[r+','+c]});
      boardCtx.restore();
    }
  }
  // During animation, also draw the incoming spare tile sliding in
  if(animState){
    boardCtx.save();
    boardCtx.beginPath();
    boardCtx.rect(PAD, PAD, SZ*CELL, SZ*CELL);
    boardCtx.clip();
    if(animState.axis==='row'){
      var sx = animState.dir===1 ? PAD - CELL + offsetX : PAD+SZ*CELL + offsetX;
      drawTile(boardCtx, sx, PAD+animState.idx*CELL, S.spare, {});
    } else {
      var sy = animState.dir===1 ? PAD - CELL + offsetY : PAD+SZ*CELL + offsetY;
      drawTile(boardCtx, PAD+animState.idx*CELL, sy, S.spare, {});
    }
    boardCtx.restore();
  }
  // Pawns
  var pX=PAD+S.playerPos[1]*CELL+CELL/2 - CELL*0.16;
  var pY=PAD+S.playerPos[0]*CELL+CELL/2;
  if(S.playerPos[0]===animRow) pX+=offsetX;
  if(S.playerPos[1]===animCol) pY+=offsetY;
  drawPawn(boardCtx, pX, pY, '#7ab356', '🌱');
  var aX=PAD+S.aiPos[1]*CELL+CELL/2 + CELL*0.16;
  var aY=PAD+S.aiPos[0]*CELL+CELL/2;
  if(S.aiPos[0]===animRow) aX+=offsetX;
  if(S.aiPos[1]===animCol) aY+=offsetY;
  drawPawn(boardCtx, aX, aY, '#c47a7a', '🌸');
}

function drawSpare(){
  if(!spareCtx)return;
  spareCtx.clearRect(0, 0, CELL, CELL);
  drawTile(spareCtx, 0, 0, S.spare, {});
}

// ── DOM build ───────────────────────────────────────────────────────────
function buildDOM(host){
  pan=document.createElement('div'); pan.id='RMpan'; host.appendChild(pan);
  topBar=document.createElement('div'); topBar.className='RMtop'; pan.appendChild(topBar);
  topBar.innerHTML=
    '<div class="RMtopCell"><div class="RMtopLbl">TURNS</div><div class="RMtopVal" id="RMt">0</div></div>'+
    '<div class="RMtopCell"><div class="RMtopLbl">DIFFICULTY</div><div class="RMtopVal" id="RMd">—</div></div>'+
    '<div class="RMtopCell"><div class="RMtopLbl">BEST</div><div class="RMtopVal" id="RMb">—</div></div>';
  topEls.turns=topBar.querySelector('#RMt');
  topEls.difficulty=topBar.querySelector('#RMd');
  topEls.best=topBar.querySelector('#RMb');

  questEl=document.createElement('div'); questEl.className='RMquest'; pan.appendChild(questEl);

  statusEl=document.createElement('div'); statusEl.className='RMstatus shift'; pan.appendChild(statusEl);

  var bw=document.createElement('div'); bw.className='RMboardWrap'; pan.appendChild(bw);
  boardCanvas=document.createElement('canvas'); boardCanvas.id='RMboard'; bw.appendChild(boardCanvas);

  spareRow=document.createElement('div'); spareRow.className='RMspareRow'; pan.appendChild(spareRow);
  spareRow.innerHTML=
    '<span class="RMspareLbl">SPARE</span>'+
    '<canvas id="RMspare"></canvas>'+
    '<button class="RMbtn" data-act="rotate">↻ ROTATE</button>';
  spareCanvas=spareRow.querySelector('#RMspare');

  ctrlRow=document.createElement('div'); ctrlRow.className='RMctrls'; pan.appendChild(ctrlRow);

  // Wire events
  boardCanvas.addEventListener('click', onBoardClick);
  boardCanvas.addEventListener('touchstart', onBoardTouch, {passive:false});
  spareRow.addEventListener('click', function(e){
    var b=e.target.closest('[data-act="rotate"]');
    if(b) rotateSpare();
  });
  window.removeEventListener('resize', onResize);
  window.addEventListener('resize', onResize);
}

function onResize(){
  if(!S || !boardCanvas)return;
  sizeCanvas();
  drawAll();
}

function onBoardClick(e){
  if(!boardCanvas)return;
  var rect=boardCanvas.getBoundingClientRect();
  var scaleX=BOARD_PX/rect.width, scaleY=BOARD_PX/rect.height;
  var mx=(e.clientX-rect.left)*scaleX, my=(e.clientY-rect.top)*scaleY;
  handleBoardClick(mx, my);
}
function onBoardTouch(e){
  if(!boardCanvas)return;
  e.preventDefault();
  var rect=boardCanvas.getBoundingClientRect();
  var scaleX=BOARD_PX/rect.width, scaleY=BOARD_PX/rect.height;
  var t=e.touches[0]||e.changedTouches[0];
  if(!t)return;
  var mx=(t.clientX-rect.left)*scaleX, my=(t.clientY-rect.top)*scaleY;
  handleBoardClick(mx, my);
}
function handleBoardClick(mx, my){
  if(S.phase==='anim' || S.phase==='ai_shift' || S.phase==='gameover')return;
  // Edge arrows. During shift phase the inner board is inert, so taps get
  // half a cell of slop INTO the board — the raw arrow strips are
  // 18-33px on phones, genuine rage territory without forgiveness.
  var SLOP=(S.phase==='shift')?CELL/2:0;
  if(my<PAD+SLOP){
    var c=Math.floor((mx-PAD)/CELL);
    if(c>=0&&c<SZ&&c%2===1) startShift('col', c, 1);
    return;
  }
  if(my>PAD+SZ*CELL-SLOP){
    var c2=Math.floor((mx-PAD)/CELL);
    if(c2>=0&&c2<SZ&&c2%2===1) startShift('col', c2, -1);
    return;
  }
  if(mx<PAD+SLOP){
    var r=Math.floor((my-PAD)/CELL);
    if(r>=0&&r<SZ&&r%2===1) startShift('row', r, 1);
    return;
  }
  if(mx>PAD+SZ*CELL-SLOP){
    var r2=Math.floor((my-PAD)/CELL);
    if(r2>=0&&r2<SZ&&r2%2===1) startShift('row', r2, -1);
    return;
  }
  // Tile clicks during move phase
  if(S.phase==='move'){
    var col=Math.floor((mx-PAD)/CELL), row=Math.floor((my-PAD)/CELL);
    if(row>=0&&row<SZ&&col>=0&&col<SZ) movePlayer(row, col);
  }
}

function rotateSpare(){
  if(S.phase!=='shift' && S.phase!=='move')return;
  if(S.phase==='move'){ sm('Shift first, then move'); return; }
  // Cycle to next rotation in TYPES[type]
  var list=TYPES[S.spare.type];
  var cur=S.spare.conn.join(',');
  var idx=0;
  for(var i=0;i<list.length;i++){ if(list[i].join(',')===cur){idx=i;break;} }
  S.spare.conn=list[(idx+1)%list.length].slice();
  _play('tap');
  drawSpare();
}

// ── HUD updates ─────────────────────────────────────────────────────────
function updateHUD(){
  if(!topEls.turns)return;
  topEls.turns.textContent=S.turns;
  var meta=DIFF_META[S.difficulty];
  var vMeta=VARIANTS[S.variant];
  topEls.difficulty.textContent=(vMeta?vMeta.label.charAt(0):'')+' · '+(meta?meta.label.replace(' MIRROR',''):'—');
  var bestKey='lw_rootmaze_best_'+S.variant+'_'+S.difficulty;
  var best=parseInt(localStorage.getItem(bestKey)||'9999',10);
  topEls.best.textContent=(best>=9999)?'—':best+'t';
  // Quest queue
  var qh='';
  qh+='<div class="RMquestCell"><span class="RMquestLbl">FIND</span>';
  var cur=S.playerTIdx<S.playerTargets.length?S.playerTargets[S.playerTIdx]:'✓';
  qh+='<span class="RMquestCur">'+cur+'</span>';
  var nexts=[];
  for(var i=S.playerTIdx+1;i<Math.min(S.playerTIdx+3,S.playerTargets.length);i++) nexts.push(S.playerTargets[i]);
  if(nexts.length) qh+='<span class="RMquestNext">→ '+nexts.join(' → ')+'</span>';
  qh+='<span class="RMquestDone"> ('+S.playerTIdx+'/'+S.playerTargets.length+')</span>';
  qh+='</div>';
  qh+='<div class="RMquestCell"><span class="RMquestLbl" style="color:rgba(224,122,122,0.65)">MIRROR</span><span class="RMquestDone" style="color:#e08a8a">'+S.aiTIdx+'/'+S.aiTargets.length+'</span></div>';
  questEl.innerHTML=qh;
  // Status line
  var msg, cls;
  if(S.phase==='shift'){ msg='TAP AN EDGE ARROW TO SHIFT'; cls='shift'; }
  else if(S.phase==='move'){ msg='TAP A MARKED TILE TO MOVE'; cls='move'; }
  else if(S.phase==='ai_shift' || S.phase==='anim'){ msg='MIRROR IS MOVING'; cls='ai'; }
  else { msg='GAME OVER'; cls='over'; }
  statusEl.textContent=msg;
  statusEl.className='RMstatus '+cls;
}

// ── End card ────────────────────────────────────────────────────────────
function showEndCard(won){
  if(endCard){endCard.remove();endCard=null;}
  endCard=document.createElement('div'); endCard.className='RMend'+(won?'':' lose');
  var bestKey='lw_rootmaze_best_'+S.variant+'_'+S.difficulty;
  var best=parseInt(localStorage.getItem(bestKey)||'9999',10);
  var bestStr=(best>=9999)?'—':best+' turns';
  endCard.innerHTML=
    '<div class="RMendTitle">'+(won?'MAZE MASTERED':'MIRROR WINS')+'</div>'+
    '<div class="RMendStats">'+S.turns+' turns  ·  best '+bestStr+'<br>'+S.playerTIdx+' / '+S.playerTargets.length+' treasures</div>';
  // NEW MAZE = same variant + same difficulty, fresh board
  var v=S.variant, d=S.difficulty;
  endCard.appendChild(mkBtn('↻ NEW MAZE','primary',function(){
    if(endCard){endCard.remove();endCard=null;}
    startGame(v, d);
  }));
  endCard.appendChild(document.createElement('br'));
  endCard.appendChild(mkBtn('← CHANGE SETTINGS','default',function(){ requestNewGame(); }));
  pan.appendChild(endCard);
}
function mkBtn(label, style, onClick){
  var b=document.createElement('button'); b.className='RMbtn';
  if(style==='primary')b.className+=' primary';
  b.textContent=label;
  b.addEventListener('click', function(e){ e.preventDefault(); onClick(); });
  return b;
}

// ── Variant picker (step 1 of 2) ────────────────────────────────────────
// Two-step flow so the variant × difficulty matrix (9 combos) stays
// browsable without cramming them all into one screen. Best-turn-count
// per (variant, difficulty) is tracked separately in localStorage.
var pendingVariant=null;
function showVariantPicker(){
  pendingVariant=null;
  if(pan){pan.innerHTML='';}
  else {pan=document.createElement('div');pan.id='RMpan';hostEl.appendChild(pan);}
  var ov=document.createElement('div'); ov.className='RMdiffPick'; pan.appendChild(ov);
  var btnHtml='';
  ['thicket','grove','forest'].forEach(function(k){
    var m=VARIANTS[k];
    // Show best time across any difficulty for this variant
    var best=Infinity;
    ['easy','steady','keen'].forEach(function(d){
      var b=parseInt(localStorage.getItem('lw_rootmaze_best_'+k+'_'+d)||'9999',10);
      if(b<best)best=b;
    });
    var bestStr=(best>=9999)?'':' · best '+best+'t';
    btnHtml+='<button class="RMdiffBtn" data-variant="'+k+'"><div class="RMdlv">'+m.label+bestStr+'</div><div class="RMdsub">'+m.sub+'</div></button>';
  });
  ov.innerHTML=
    '<div class="RMdiffTitle">ROOT MAZE</div>'+
    '<div class="RMdiffSub">Rotate the spare tile, push it in from any edge, then walk through connected path tiles to reach your treasures before the Mirror does. Pick a board size.</div>'+
    '<div class="RMdiffBtns">'+btnHtml+'</div>';
  ov.addEventListener('click', function(e){
    var b=e.target.closest('[data-variant]');
    if(!b)return;
    pendingVariant=b.getAttribute('data-variant');
    showDifficultyPicker();
  });
}

// Step 2 of 2: difficulty picker for the chosen variant
function showDifficultyPicker(){
  if(pan){pan.innerHTML='';}
  else {pan=document.createElement('div');pan.id='RMpan';hostEl.appendChild(pan);}
  var ov=document.createElement('div'); ov.className='RMdiffPick'; pan.appendChild(ov);
  var variantMeta=VARIANTS[pendingVariant];
  var btnHtml='';
  ['easy','steady','keen'].forEach(function(k){
    var m=DIFF_META[k];
    var bestKey='lw_rootmaze_best_'+pendingVariant+'_'+k;
    var best=parseInt(localStorage.getItem(bestKey)||'9999',10);
    var bestStr=(best>=9999)?'':' · best '+best+'t';
    btnHtml+='<button class="RMdiffBtn" data-diff="'+k+'"><div class="RMdlv">'+m.label+bestStr+'</div><div class="RMdsub">'+m.sub+'</div></button>';
  });
  btnHtml+='<button class="RMdiffBtn" data-back="1" style="border-color:rgba(232,220,200,0.25);color:rgba(232,220,200,0.6)"><div class="RMdlv">← BACK</div><div class="RMdsub">Pick a different board size</div></button>';
  ov.innerHTML=
    '<div class="RMdiffTitle">'+variantMeta.label+'</div>'+
    '<div class="RMdiffSub">'+variantMeta.sub+'. Pick a Mirror to play against.</div>'+
    '<div class="RMdiffBtns">'+btnHtml+'</div>';
  ov.addEventListener('click', function(e){
    var back=e.target.closest('[data-back]');
    if(back){ showVariantPicker(); return; }
    var b=e.target.closest('[data-diff]');
    if(!b)return;
    startGame(pendingVariant, b.getAttribute('data-diff'));
  });
}

// ── Lifecycle ───────────────────────────────────────────────────────────
function requestNewGame(){
  if(animFrameId){cancelAnimationFrame(animFrameId);animFrameId=null;}
  animState=null;
  if(endCard){endCard.remove();endCard=null;}
  showVariantPicker();
}

function startGame(variant, difficulty){
  var vMeta=VARIANTS[variant];
  if(!vMeta){ sm('Unknown variant '+variant); return; }
  SZ=vMeta.size;
  var targetsEach=vMeta.treasuresEach;
  _setDiff(difficulty==='easy'?'easy':difficulty==='steady'?'medium':'hard');
  // Build board
  var board=[];
  for(var r=0;r<SZ;r++){
    board[r]=[];
    for(var c=0;c<SZ;c++){
      var fixed=(r%2===0 && c%2===0);
      var tile=randomTile();
      tile.fixed=fixed;
      tile.treasure=null;
      board[r][c]=tile;
    }
  }
  // Treasures — need 2 * targetsEach distinct treasure tiles.
  var totalNeeded=2*targetsEach;
  var fixedPos=[];
  for(var r2=0;r2<SZ;r2++)for(var c2=0;c2<SZ;c2++){
    if(board[r2][c2].fixed && !((r2===0||r2===SZ-1)&&(c2===0||c2===SZ-1))) fixedPos.push([r2,c2]);
  }
  shuf(fixedPos);
  var tList=shuf(TREASURES.slice());
  var placed=0;
  // Place on fixed tiles first (canonical Labyrinth)
  for(var t=0;t<fixedPos.length && placed<totalNeeded;t++){
    board[fixedPos[t][0]][fixedPos[t][1]].treasure=tList[placed % tList.length];
    placed++;
  }
  // Fill remaining on random non-fixed tiles
  var guard=0;
  while(placed<totalNeeded && guard<500){
    guard++;
    var rr=Math.floor(Math.random()*SZ);
    var cc=Math.floor(Math.random()*SZ);
    if(!board[rr][cc].fixed && !board[rr][cc].treasure){
      board[rr][cc].treasure=tList[placed % tList.length];
      placed++;
    }
  }
  var spare=randomTile();
  // Collect all placed treasures and split evenly
  var all=[];
  for(var r4=0;r4<SZ;r4++)for(var c4=0;c4<SZ;c4++) if(board[r4][c4].treasure) all.push(board[r4][c4].treasure);
  shuf(all);
  var half=Math.floor(all.length/2);
  var playerTargets=all.slice(0, Math.min(targetsEach, half));
  var aiTargets=all.slice(half, half+Math.min(targetsEach, all.length-half));
  if(playerTargets.length===0) playerTargets=[TREASURES[0]];
  if(aiTargets.length===0) aiTargets=[TREASURES[1]];

  S={
    variant:variant,
    difficulty:difficulty,
    board:board, spare:spare,
    playerPos:[0,0], aiPos:[SZ-1,SZ-1],
    playerTargets:playerTargets, aiTargets:aiTargets,
    playerTIdx:0, aiTIdx:0,
    phase:'shift',
    turns:0
  };
  if(pan) pan.innerHTML='';
  buildDOM(hostEl);
  sizeCanvas();
  drawAll();
  updateHUD();
}

window._gameFns = window._gameFns || {};
window._gameFns.rootmaze = function(a){
  pan=null; topBar=null; questEl=null; statusEl=null; boardCanvas=null; boardCtx=null;
  spareCanvas=null; spareCtx=null; spareRow=null; ctrlRow=null; endCard=null;
  topEls={turns:null, phase:null, difficulty:null, best:null};
  if(animFrameId){cancelAnimationFrame(animFrameId);animFrameId=null;}
  animState=null;
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    if(animFrameId){cancelAnimationFrame(animFrameId);animFrameId=null;}
    if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}
    window.removeEventListener('resize', onResize);
  });
  hostEl=a;
  showVariantPicker();
};
})();
