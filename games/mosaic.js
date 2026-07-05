// ═══ MOSAIC GARDEN — Azul rebuild ═══
// Draft colored tiles from factories, fill staging rows, transfer to wall.
// Delta render, smart AI with difficulty picker, placement preview with
// score estimate, staggered opponent, undo-before-place, round + endgame
// breakdown cards.
(function(){
'use strict';
var LWG=window._G;
var _e=LWG.e,_play=LWG.play,_playWin=LWG.playWin,_setDiff=LWG.setDiff,sm=LWG.sm,_sr=LWG.sr;

// ── Tile data ───────────────────────────────────────────────────────────
var COLORS=['petal','leaf','berry','sun','frost'];
var ICONS={petal:'🌸',leaf:'🌿',berry:'💧',sun:'☀️',frost:'❄️'};
var BG={petal:'#e07a8a',leaf:'#6bad4a',berry:'#5b9bd5',sun:'#d4a843',frost:'#a0c4e8'};
var COLOR_NAMES={petal:'petals',leaf:'leaves',berry:'drops',sun:'suns',frost:'flakes'};
// Wall pattern — canonical Azul cycling
var WALL_PATTERN=[
  ['petal','leaf','berry','sun','frost'],
  ['frost','petal','leaf','berry','sun'],
  ['sun','frost','petal','leaf','berry'],
  ['berry','sun','frost','petal','leaf'],
  ['leaf','berry','sun','frost','petal']
];
var FLOOR_PEN=[-1,-1,-2,-2,-2,-3,-3];
var DIFF_META={
  easy:{label:'EASY MIRROR',sub:'Greedy picks. Good for learning.'},
  steady:{label:'STEADY MIRROR',sub:'Considers row fit + floor avoidance.'},
  keen:{label:'KEEN MIRROR',sub:'Wall adjacency + endgame awareness.'}
};

// ── Styles ──────────────────────────────────────────────────────────────
(function injectStyle(){
  if(document.getElementById('ms-style'))return;
  var s=document.createElement('style');s.id='ms-style';
  s.textContent=[
    '@keyframes msFade{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes msPop{0%{transform:scale(0.5);opacity:0}55%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes msShake{0%,100%{transform:translate(0)}25%{transform:translate(-2px,0)}75%{transform:translate(2px,0)}}',
    '#MSpan{max-width:min(100vw,540px);margin:0 auto;padding:6px;user-select:none;-webkit-user-select:none;box-sizing:border-box;font-family:Georgia,serif;animation:msFade .3s ease}',
    // Difficulty picker
    '.MSdiffPick{display:flex;flex-direction:column;align-items:center;gap:14px;padding:28px 12px 16px;animation:msFade .3s ease}',
    '.MSdiffTitle{font-family:Bebas Neue,sans-serif;font-size:1.7rem;letter-spacing:0.22em;color:#c8a84b}',
    '.MSdiffSub{font-family:Georgia,serif;font-size:0.78rem;color:rgba(232,220,200,0.72);text-align:center;max-width:320px;line-height:1.5}',
    '.MSdiffBtns{display:flex;flex-direction:column;gap:8px;width:100%;max-width:280px;margin-top:10px}',
    '.MSdiffBtn{min-height:58px;padding:10px 14px;border-radius:12px;background:rgba(26,36,22,0.85);border:1.5px solid rgba(122,179,86,0.35);color:#e8dcc8;font-family:Georgia,serif;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;flex-direction:column;align-items:flex-start;gap:2px}',
    '.MSdiffBtn:active{transform:scale(0.98);background:rgba(122,179,86,0.22)}',
    '.MSdiffBtn .MSdlv{font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.18em;color:#c8a84b}',
    '.MSdiffBtn .MSdsub{font-size:0.7rem;color:rgba(232,220,200,0.75)}',
    // Top bar
    '.MStop{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px 10px;margin:2px 0 6px;background:linear-gradient(135deg,rgba(26,31,23,0.88),rgba(13,16,12,0.92));border:1.5px solid rgba(122,179,86,0.25);border-radius:10px;font-family:Bebas Neue,sans-serif}',
    '.MStopCell{text-align:center}',
    '.MStopLbl{font-size:0.7rem;letter-spacing:0.16em;color:rgba(232,220,200,0.55)}',
    '.MStopVal{font-family:DM Mono,monospace;font-size:0.95rem;color:#c8a84b;font-weight:700;margin-top:1px}',
    '.MSturn{font-size:0.68rem;letter-spacing:0.14em;margin-top:2px}',
    '.MSturn.active{color:#8fc57a}',
    '.MSturn.ai{color:rgba(232,220,200,0.6)}',
    // Status line
    '.MSstatus{text-align:center;font-family:Georgia,serif;font-size:0.78rem;color:#e8dcc8;padding:4px 0 6px}',
    '.MSstatus em{color:#c8a84b;font-style:normal;font-weight:700}',
    // Bag tracker
    '.MSbagBar{display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap;padding:4px 4px 6px;font-family:Georgia,serif;font-size:0.7rem}',
    '.MSbagLbl{font-family:Bebas Neue,sans-serif;font-size:0.7rem;letter-spacing:0.16em;color:rgba(232,220,200,0.55);margin-right:2px}',
    '.MSbagChip{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:10px;border:1px solid;color:#e8dcc8;font-family:DM Mono,monospace}',
    '.MSbagChip b{font-weight:700;color:#e8dcc8}',
    '.MSbagTotal{font-family:DM Mono,monospace;font-size:0.7rem;color:rgba(232,220,200,0.5);letter-spacing:0.06em;margin-left:4px}',
    // Endgame warning badge
    '.MSboardTitle .warn{font-family:Bebas Neue,sans-serif;font-size:0.7rem;letter-spacing:0.14em;color:#ffb366;background:rgba(200,100,40,0.18);border:1px solid rgba(255,150,80,0.5);padding:1px 6px;border-radius:6px;margin-left:6px;animation:msFade .3s ease}',
    // Factories
    '.MSfactories{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin:4px 0}',
    '.MSfac{width:76px;height:76px;border-radius:50%;background:rgba(26,31,23,0.55);border:1.5px solid rgba(74,124,53,0.28);display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:3px;padding:10px;box-sizing:border-box;position:relative}',
    '.MSfac.empty{border-style:dashed;opacity:0.35}',
    // Center
    '.MScenter{padding:8px 10px;background:rgba(26,31,23,0.42);border:1.5px solid rgba(74,124,53,0.22);border-radius:12px;margin:4px 0;min-height:48px;display:flex;gap:4px;flex-wrap:wrap;justify-content:center;align-items:center;box-sizing:border-box}',
    '.MScenterEmpty{font-family:DM Mono,monospace;font-size:0.72rem;color:rgba(232,220,200,0.45);letter-spacing:0.08em}',
    '.MSfirstMarker{width:30px;height:30px;border-radius:5px;border:2px dashed rgba(200,168,75,0.75);display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:#c8a84b;letter-spacing:0.04em}',
    // Tiles
    '.MStile{border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;box-sizing:border-box;border:1px solid rgba(0,0,0,0.3);box-shadow:inset 0 1px 0 rgba(255,255,255,0.14),inset 0 -1px 0 rgba(0,0,0,0.22),0 1px 2px rgba(0,0,0,0.4);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .1s ease}',
    '.MStile.focus{outline:2px solid #ffd86a;outline-offset:-2px;transform:scale(1.08);z-index:2;box-shadow:0 0 10px rgba(255,216,106,0.55)}',
    '.MStile.ghost{opacity:0.28;cursor:default}',
    // Boards (player + AI)
    '.MSboards{display:grid;grid-template-columns:1fr;gap:6px}',
    '.MSboard{background:rgba(26,31,23,0.45);border:1.5px solid rgba(74,124,53,0.25);border-radius:12px;padding:8px 10px}',
    '.MSboard.ai{border-color:rgba(200,120,120,0.25)}',
    '.MSboardTitle{font-family:Bebas Neue,sans-serif;font-size:0.76rem;letter-spacing:0.2em;color:#e8dcc8;display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}',
    '.MSboardTitle .pts{font-family:DM Mono,monospace;font-size:0.88rem;color:#c8a84b;font-weight:700}',
    '.MSrows{display:flex;flex-direction:column;gap:3px}',
    '.MSrow{display:grid;grid-template-columns:1fr 14px 1fr;align-items:center;gap:6px;padding:2px}',
    '.MSstaging{display:flex;gap:2px;justify-content:flex-end;align-items:center;padding:2px 4px;border-radius:5px;transition:background .12s ease}',
    // Player rows are the placement tap targets — 48px fleet minimum
    '.MSrow.mine .MSstaging{min-height:48px;box-sizing:border-box}',
    '.MSstaging.compatible{background:rgba(200,168,75,0.18);cursor:pointer;box-shadow:inset 0 0 0 1.5px rgba(200,168,75,0.5)}',
    '.MSstaging.compatible:active{transform:scale(0.98);background:rgba(200,168,75,0.3)}',
    '.MSstaging.incompatible{background:rgba(199,80,80,0.06);opacity:0.4}',
    '.MSstageSlot{border-radius:4px;border:1px dashed rgba(74,124,53,0.22)}',
    '.MSarrow{color:rgba(232,220,200,0.4);font-size:0.7rem;text-align:center}',
    '.MSwall{display:flex;gap:2px;justify-content:flex-start;align-items:center}',
    '.MSrowGain{position:absolute;right:4px;top:50%;transform:translateY(-50%);font-family:DM Mono,monospace;font-size:0.7rem;color:#ffdc70;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,0.85);pointer-events:none;background:rgba(0,0,0,0.35);padding:1px 4px;border-radius:3px}',
    '.MSrow{position:relative}',
    // Floor
    '.MSfloor{display:flex;gap:3px;justify-content:center;align-items:center;min-height:48px;box-sizing:border-box;margin-top:6px;padding:6px 4px;border-top:1px solid rgba(74,124,53,0.15)}',
    '.MSfloorLbl{font-family:Bebas Neue,sans-serif;font-size:0.68rem;letter-spacing:0.12em;color:rgba(232,220,200,0.6);align-self:center;margin-right:6px}',
    '.MSfloor.dropTarget{background:rgba(199,80,80,0.14);border-radius:6px;cursor:pointer}',
    '.MSfloor.dropTarget:active{background:rgba(199,80,80,0.22)}',
    '.MSfloorSlot{width:26px;height:26px;border-radius:4px;border:1px solid rgba(74,124,53,0.18);display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:rgba(199,80,80,0.55);font-family:DM Mono,monospace}',
    '.MSfloorSlot.filled{border-color:rgba(199,80,80,0.5);background:rgba(199,80,80,0.15);color:#e8dcc8}',
    // Controls
    '.MSctrls{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;padding:8px 2px 6px}',
    '.MSbtn{min-height:48px;padding:8px 10px;font-family:Georgia,serif;font-size:0.76rem;letter-spacing:0.1em;border-radius:9px;background:rgba(26,31,23,0.8);border:1.5px solid rgba(220,180,120,0.32);color:#e8dcc8;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:4px}',
    '.MSbtn:active{transform:scale(0.96);background:rgba(200,168,75,0.22)}',
    '.MSbtn.primary{background:linear-gradient(180deg,rgba(122,179,86,0.32),rgba(74,124,53,0.4));border-color:rgba(122,179,86,0.55);color:#8fc57a;font-weight:700}',
    '.MSbtn.danger{background:rgba(112,40,40,0.42);border-color:rgba(224,122,122,0.5);color:#ffb3b3}',
    // Scoring breakdown popup
    '#MSbreak{position:fixed;bottom:96px;left:50%;transform:translateX(-50%);z-index:60;background:linear-gradient(180deg,rgba(26,36,22,0.95),rgba(13,16,12,0.96));border:1.5px solid rgba(200,168,75,0.55);border-radius:12px;padding:11px 15px 10px;min-width:240px;max-width:88vw;box-shadow:0 6px 24px rgba(0,0,0,0.7);font-family:Georgia,serif;animation:msPop .32s cubic-bezier(.2,1.2,.3,1) both}',
    '.MSbreakTitle{font-family:Bebas Neue,sans-serif;font-size:0.8rem;letter-spacing:0.18em;color:#c8a84b;text-align:center;margin-bottom:6px}',
    '.MSbreakLine{display:flex;justify-content:space-between;align-items:center;font-family:DM Mono,monospace;font-size:0.7rem;color:#e8dcc8;padding:2px 0;gap:10px}',
    '.MSbreakLine.pen{color:#ffb3b3}',
    '.MSbreakTotal{display:flex;justify-content:space-between;border-top:1px solid rgba(200,168,75,0.25);margin-top:6px;padding-top:6px;font-family:Bebas Neue,sans-serif;font-size:0.82rem;letter-spacing:0.14em;color:#ffdc70}',
    // End card
    '.MSend{margin:14px auto;max-width:400px;padding:18px;background:linear-gradient(180deg,rgba(20,28,18,0.97),rgba(13,16,12,0.98));border:2px solid rgba(200,168,75,0.55);border-radius:14px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.6);animation:msFade .3s ease}',
    '.MSendTitle{font-family:Bebas Neue,sans-serif;font-size:1.55rem;letter-spacing:0.14em;color:#ffdc70;margin-bottom:6px}',
    '.MSendScores{font-family:DM Mono,monospace;font-size:0.82rem;color:#e8dcc8;margin-bottom:10px}',
    '.MSendBreak{text-align:left;font-family:DM Mono,monospace;font-size:0.7rem;color:#e8dcc8;margin:8px 0 14px}',
    '.MSendBreak .row{display:flex;justify-content:space-between;padding:1px 0}',
    '.MSendBreak .total{border-top:1px solid rgba(200,168,75,0.3);margin-top:4px;padding-top:4px;color:#ffdc70}'
  ].join('');
  document.head.appendChild(s);
})();

// ── State ───────────────────────────────────────────────────────────────
var S=null;

// DOM refs
var hostEl=null, pan=null, topBar=null, statusEl=null, bagEl=null, facRow=null, centerEl=null;
var playerBoardEl=null, aiBoardEl=null, ctrlRow=null;
var topEls={score:null, ai:null, round:null};
var breakdownEl=null, endEl=null;
var aiBusy=false;
// Generation counter — bumped on mount / new game / cleanup so pending
// setTimeout chains (AI turn, scoring, round transition, endGame) from a
// dead game can never fire into the picker or a fresh game's S.
var gen=0;

// ── Helpers ─────────────────────────────────────────────────────────────
function shuf(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function groupCount(arr){var g={};arr.forEach(function(c){g[c]=(g[c]||0)+1;});return g;}
// Resolve which tile a tap MEANT: the one whose center is nearest the
// touch point. The 48px tap boxes overlap at factory/pond density, so raw
// DOM order would steal taps that land on a neighbour's visible pixels.
// maxDist 0 = no cap (a whole factory circle is one target zone).
function nearestTile(scope, e, sel, maxDist){
  var tiles=scope.querySelectorAll(sel);
  var best=null,bd=Infinity;
  for(var i=0;i<tiles.length;i++){
    var r=tiles[i].getBoundingClientRect();
    var dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
    var d=dx*dx+dy*dy;
    if(d<bd){bd=d;best=tiles[i];}
  }
  if(best&&maxDist&&bd>maxDist*maxDist)return null;
  return best;
}

// Check if a player's board can accept `color` on staging row `rowIdx`.
function canStage(board, rowIdx, color){
  var row=board.staging[rowIdx];
  var maxSize=rowIdx+1;
  if(row.length>0 && row[0]!==color)return false;
  var wallCol=WALL_PATTERN[rowIdx].indexOf(color);
  if(board.wall[rowIdx][wallCol])return false;
  return true;
}

// Score gained by PLACING `color` on row `rowIdx` now. Only scored at
// round end if the row becomes FULL — so if count+row.length < maxSize,
// delta is 0 (tiles don't score yet). If count+row.length >= maxSize,
// row fills and one tile transfers to the wall; return the adjacency
// score that wall placement will earn.
function placementDelta(board, rowIdx, color, count){
  if(!canStage(board, rowIdx, color))return 0;
  var row=board.staging[rowIdx];
  var maxSize=rowIdx+1;
  var placed=Math.min(count, maxSize-row.length);
  var newFill=row.length+placed;
  if(newFill<maxSize)return 0;
  // Row will fill — score the wall placement
  var wallCol=WALL_PATTERN[rowIdx].indexOf(color);
  return calcWallGain(board.wall, rowIdx, wallCol);
}
function calcWallGain(wall, row, col){
  var hCount=1;
  for(var c=col-1;c>=0&&wall[row][c];c--)hCount++;
  for(var c2=col+1;c2<5&&wall[row][c2];c2++)hCount++;
  var vCount=1;
  for(var r=row-1;r>=0&&wall[r][col];r--)vCount++;
  for(var r2=row+1;r2<5&&wall[r2][col];r2++)vCount++;
  if(hCount===1&&vCount===1)return 1;
  var pts=0;
  if(hCount>1)pts+=hCount;
  if(vCount>1)pts+=vCount;
  return pts;
}
// Floor cost if `tiles` spillover (plus optional first-player marker)
function floorCost(board, spillCount, takesFirst){
  var start=board.floor.length;
  var total=0;
  var slots=spillCount+(takesFirst?1:0);
  for(var i=0;i<slots;i++){
    var idx=start+i;
    if(idx<7)total+=FLOOR_PEN[idx];
  }
  return total;
}

// ── Game flow ───────────────────────────────────────────────────────────
function newBoard(){
  return {
    staging:[[],[],[],[],[]],
    wall:[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],
    floor:[],
    score:0
  };
}

function fillFactories(){
  // Reset the pond + first marker BEFORE filling — the tile-exhaustion
  // early return below used to skip this, so the '1st' marker never
  // reappeared and next-round turn order silently stuck.
  S.center=[];
  S.firstPlayerTaken=false;
  for(var f=0;f<5;f++){
    S.factories[f]=[];
    for(var i=0;i<4;i++){
      if(S.bag.length===0){
        if(S.discard.length===0)return; // both empty — end of game effectively
        S.bag=S.discard.slice(); S.discard=[]; shuf(S.bag);
      }
      S.factories[f].push(S.bag.pop());
    }
  }
}

// Select a color from a factory — all tiles of that color to `selected`,
// rest to the center.
function selectFromFactory(fi, color){
  if(S.phase!=='draft'||S.turn!=='player'||S.selected||aiBusy)return;
  var fac=S.factories[fi];
  var taken=fac.filter(function(c){return c===color;});
  if(taken.length===0)return;
  var rest=fac.filter(function(c){return c!==color;});
  S.factories[fi]=[];
  rest.forEach(function(c){S.center.push(c);});
  S.selected={source:'fac',facIdx:fi,color:color,tiles:taken,restored:{fi:fi,rest:rest}};
  _play('tap');
  updateAll();
}
function selectFromCenter(color){
  if(S.phase!=='draft'||S.turn!=='player'||S.selected||aiBusy)return;
  var taken=S.center.filter(function(c){return c===color;});
  if(taken.length===0)return;
  var remaining=S.center.filter(function(c){return c!==color;});
  S.center=remaining;
  var firstPlayer=!S.firstPlayerTaken;
  if(firstPlayer){S.firstPlayerTaken=true;S.firstTaker='player';}
  S.selected={source:'center',color:color,tiles:taken,firstPlayer:firstPlayer,restored:{tiles:taken.slice(),firstWasTaken:firstPlayer}};
  _play('tap');
  updateAll();
}
// Undo the current selection before placing
function undoSelection(){
  if(!S.selected)return;
  var sel=S.selected;
  if(sel.source==='fac'){
    // Return rest from center back to factory, and remove from center the ones that were sent there
    var restCount=sel.restored.rest.length;
    // The rest went to the *end* of the center — remove last restCount items of those colors
    // Simplest: remove N items from the end of center
    var newCenter=S.center.slice();
    // Remove from end
    for(var i=0;i<restCount;i++)newCenter.pop();
    S.center=newCenter;
    // Restore factory
    S.factories[sel.facIdx]=sel.tiles.concat(sel.restored.rest);
  } else {
    // Return tiles back to center; reset first-player taken if we were the one to take it
    S.center=S.center.concat(sel.tiles);
    if(sel.firstPlayer){S.firstPlayerTaken=false;S.firstTaker=null;}
  }
  S.selected=null;
  _play('tap');
  updateAll();
}

function placeOnRow(rowIdx){
  if(!S.selected)return;
  var board=S.player;
  if(!canStage(board, rowIdx, S.selected.color)){sm('Row cannot accept this color');return;}
  var row=board.staging[rowIdx];
  var maxSize=rowIdx+1;
  var space=maxSize-row.length;
  var tiles=S.selected.tiles;
  var firstPlayer=S.selected.firstPlayer;
  // The 'first' marker is NOT a tile — pushing it into the discard let the
  // bag recycle deal it as a broken tile (BG['first'] is undefined). When
  // the floor is full the marker is simply dropped: the floor penalty is
  // already maxed and the marker never returns to the bag in real Azul.
  if(firstPlayer && board.floor.length<7)board.floor.push('first');
  var spilled=0;
  for(var i=0;i<tiles.length;i++){
    if(i<space)row.push(tiles[i]);
    else { if(board.floor.length<7)board.floor.push(tiles[i]); else S.discard.push(tiles[i]); spilled++; }
  }
  S.selected=null;
  _play('tap');
  _e('progress');
  updateAll();
  endPlayerTurn();
}
function placeOnFloor(){
  if(!S.selected)return;
  var board=S.player;
  var tiles=S.selected.tiles;
  if(S.selected.firstPlayer){ if(board.floor.length<7)board.floor.push('first'); }
  for(var i=0;i<tiles.length;i++){
    if(board.floor.length<7)board.floor.push(tiles[i]);
    else S.discard.push(tiles[i]);
  }
  S.selected=null;
  _play('tap');
  updateAll();
  endPlayerTurn();
}

function endPlayerTurn(){
  if(checkRoundEnd())return;
  S.turn='ai';
  updateAll();
  aiBusy=true;
  var g=gen;
  setTimeout(function(){if(g!==gen)return;aiTurn();}, 500);
}

// ── AI ──────────────────────────────────────────────────────────────────
function aiTurn(){
  if(S.phase==='gameover'){aiBusy=false;return;}
  var plan=aiChooseMove();
  if(!plan){aiBusy=false;return;}
  // Animate: show the pick, brief delay, then place
  if(plan.source==='fac'){
    S.factories[plan.facIdx]=[];
    plan.rest.forEach(function(c){S.center.push(c);});
  } else {
    S.center=plan.remaining;
    if(plan.firstPlayer){S.firstPlayerTaken=true;S.firstTaker='ai';}
  }
  sm('Mirror took '+plan.count+' '+COLOR_NAMES[plan.color]);
  updateAll();
  var g=gen;
  setTimeout(function(){
    if(g!==gen)return;
    var board=S.ai;
    if(plan.target==='floor'){
      if(plan.firstPlayer){ if(board.floor.length<7)board.floor.push('first'); }
      for(var i=0;i<plan.count;i++){
        if(board.floor.length<7)board.floor.push(plan.color);
        else S.discard.push(plan.color);
      }
    } else {
      var row=board.staging[plan.target];
      var maxSize=plan.target+1;
      if(plan.firstPlayer){ if(board.floor.length<7)board.floor.push('first'); }
      var space=maxSize-row.length;
      for(var j=0;j<plan.count;j++){
        if(j<space)row.push(plan.color);
        else { if(board.floor.length<7)board.floor.push(plan.color); else S.discard.push(plan.color); }
      }
    }
    aiBusy=false;
    updateAll();
    if(checkRoundEnd())return;
    S.turn='player';
    updateAll();
  }, 600);
}
function aiChooseMove(){
  var best=null;
  var sources=[];
  for(var f=0;f<5;f++){
    if(S.factories[f].length===0)continue;
    var grouped=groupCount(S.factories[f]);
    for(var color in grouped){
      sources.push({source:'fac',facIdx:f,color:color,count:grouped[color],rest:S.factories[f].filter(function(c){return c!==color;})});
    }
  }
  if(S.center.length>0){
    var cg=groupCount(S.center);
    for(var color2 in cg){
      sources.push({source:'center',color:color2,count:cg[color2],firstPlayer:!S.firstPlayerTaken,remaining:S.center.filter(function(c){return c!==color2;})});
    }
  }
  if(sources.length===0)return null;
  sources.forEach(function(src){
    // Evaluate each possible placement target (rows 0-4 + floor)
    for(var row=0; row<=5; row++){
      var target=(row===5)?'floor':row;
      var plan={target:target};
      for(var k in src){if(src.hasOwnProperty(k))plan[k]=src[k];}
      if(target==='floor'){
        plan.score=evalFloor(src);
      } else {
        if(!canStage(S.ai, row, src.color)){continue;}
        plan.score=evalRowPlacement(src, row);
      }
      if(!best||plan.score>best.score)best=plan;
    }
  });
  return best;
}
function evalRowPlacement(src, rowIdx){
  var board=S.ai;
  var row=board.staging[rowIdx];
  var maxSize=rowIdx+1;
  var space=maxSize-row.length;
  var placed=Math.min(src.count, space);
  var spill=src.count-placed;
  var firstPen=src.firstPlayer ? FLOOR_PEN[board.floor.length]||0 : 0;
  var spillPen=0;
  for(var i=0;i<spill;i++){
    var idx=board.floor.length+(src.firstPlayer?1:0)+i;
    if(idx<7)spillPen+=FLOOR_PEN[idx];
  }
  var newFill=row.length+placed;
  var wallGain=0;
  if(newFill===maxSize){
    var wc=WALL_PATTERN[rowIdx].indexOf(src.color);
    wallGain=calcWallGain(board.wall, rowIdx, wc);
  }
  var progress=placed * 0.5; // valuing partial rows less
  var base=wallGain + progress + firstPen + spillPen;
  // Difficulty tweaks
  if(S.difficulty==='steady'){
    // Stronger penalty for large spill + prefer completing rows
    if(newFill===maxSize)base+=2;
    if(spill>=2)base-=spill*0.5;
  } else if(S.difficulty==='keen'){
    if(newFill===maxSize)base+=3;
    if(spill>=2)base-=spill*0.8;
    // Endgame: look for column/row/color completion paths
    if(newFill===maxSize){
      var wc2=WALL_PATTERN[rowIdx].indexOf(src.color);
      board.wall[rowIdx][wc2]=true;
      // Count how close this fills a row/col/color
      var rowFill=0; for(var rc=0;rc<5;rc++)if(board.wall[rowIdx][rc])rowFill++;
      var colFill=0; for(var rr=0;rr<5;rr++)if(board.wall[rr][wc2])colFill++;
      var colorFill=0; for(var rrr=0;rrr<5;rrr++){var ci=WALL_PATTERN[rrr].indexOf(src.color);if(board.wall[rrr][ci])colorFill++;}
      board.wall[rowIdx][wc2]=false;
      if(rowFill===5)base+=2;
      if(colFill===5)base+=7;
      if(colorFill===5)base+=10;
      base+=(rowFill-1)*0.3+(colFill-1)*0.5+(colorFill-1)*0.4;
    }
  }
  return base;
}
function evalFloor(src){
  var board=S.ai;
  var pen=0;
  var slots=src.count+(src.firstPlayer?1:0);
  for(var i=0;i<slots;i++){
    var idx=board.floor.length+i;
    if(idx<7)pen+=FLOOR_PEN[idx];
  }
  return pen - 10; // strong aversion
}

// ── Round end ──────────────────────────────────────────────────────────
function checkRoundEnd(){
  var allEmpty=true;
  for(var f=0;f<5;f++){if(S.factories[f].length>0){allEmpty=false;break;}}
  if(S.center.length>0)allEmpty=false;
  if(!allEmpty)return false;
  S.phase='score';
  updateAll();
  var g=gen;
  setTimeout(function(){if(g!==gen)return;scoringPhase();}, 400);
  return true;
}
function scoringPhase(){
  var pBreak=tallyBoard(S.player);
  var aBreak=tallyBoard(S.ai);
  S.player.score=Math.max(0, S.player.score+pBreak.net);
  S.ai.score=Math.max(0, S.ai.score+aBreak.net);
  if(pBreak.hadFirst)S.firstPlayerTakenLastRound=true;
  showBreakdown('Round '+S.round+' — you', pBreak.lines, pBreak.net);
  _play('snap');
  updateAll(); // paint the wall transfers + new scores immediately
  var g=gen;
  // Check game over
  var gameOver=false;
  for(var r=0;r<5;r++){var full=true;for(var c=0;c<5;c++)if(!S.player.wall[r][c]){full=false;break;}if(full){gameOver=true;break;}}
  if(!gameOver){for(var r2=0;r2<5;r2++){var f2=true;for(var c2=0;c2<5;c2++)if(!S.ai.wall[r2][c2]){f2=false;break;}if(f2){gameOver=true;break;}}}
  if(gameOver){
    setTimeout(function(){if(g!==gen)return;endGame();}, 1600);
    return;
  }
  S.round++;
  S.phase='draft';
  // Figure out who goes first next round: whoever took the first-player
  // marker. S.firstTaker is tracked at take time, so this survives the
  // marker being dropped on an already-full floor (the floor scan is the
  // legacy fallback).
  var nextTurn=S.firstTaker||null;
  if(!nextTurn){
    if(S.player.floor.indexOf('first')>=0)nextTurn='player';
    else if(S.ai.floor.indexOf('first')>=0)nextTurn='ai';
  }
  if(nextTurn)S.turn=nextTurn;
  // else stays as-is (whole round drafted without touching the pond)
  S.firstTaker=null;
  S.player.floor=[]; S.ai.floor=[];
  fillFactories();
  setTimeout(function(){
    if(g!==gen)return;
    updateAll();
    if(nextTurn==='ai'){ sm('Mirror goes first'); }
    else if(nextTurn==='player'){ sm('You go first'); }
    if(S.turn==='ai'){ aiBusy=true; setTimeout(function(){if(g!==gen)return;aiTurn();}, 700); }
  }, 1200);
}
function tallyBoard(board){
  var lines=[], net=0, hadFirst=false;
  for(var r=0;r<5;r++){
    var maxSize=r+1;
    if(board.staging[r].length===maxSize){
      var color=board.staging[r][0];
      var wallCol=WALL_PATTERN[r].indexOf(color);
      board.wall[r][wallCol]=true;
      var pts=calcWallGain(board.wall, r, wallCol);
      for(var i=0;i<board.staging[r].length-1;i++)S.discard.push(board.staging[r][i]);
      board.staging[r]=[];
      lines.push({label:'Row '+(r+1)+' · '+ICONS[color],pts:pts});
      net+=pts;
    }
  }
  var penalty=0;
  for(var j=0;j<board.floor.length&&j<7;j++){
    penalty+=FLOOR_PEN[j];
    if(board.floor[j]==='first'){ hadFirst=true; }
    else S.discard.push(board.floor[j]);
  }
  if(penalty!==0)lines.push({label:'Floor',pts:penalty,pen:true});
  net+=penalty;
  return {lines:lines, net:net, hadFirst:hadFirst};
}

function endGame(){
  S.phase='gameover';
  // Endgame bonuses
  var pBonus=endBonus(S.player);
  var aBonus=endBonus(S.ai);
  S.player.score+=pBonus.total;
  S.ai.score+=aBonus.total;
  var won=S.player.score>S.ai.score;
  var tied=S.player.score===S.ai.score;
  if(won){_e('game_win');_playWin();sm('Mosaic complete! '+S.player.score+' to '+S.ai.score);}
  else if(tied){sm('Tied '+S.player.score+' to '+S.ai.score);}
  else {_e('game_loss');sm('Mirror wins '+S.ai.score+' to '+S.player.score);}
  _sr('mosaic',{w:won,s:S.player.score});
  updateAll(); // final scores + 'Game over' HUD + last wall transfers
  showEndCard(pBonus, aBonus, won);
  if(window._lwGameEnd)window._lwGameEnd({
    won:won,
    title:won?'GARDEN COMPLETE':(tied?'GARDEN MIRRORED':'MIRROR WINS'),
    line:'YOU '+S.player.score+' · MIRROR '+S.ai.score,
    sub:'+'+pBonus.total+' end bonus · full tally on the board',
    retry:function(){requestNewGame();},
    retryLabel:'↻ NEW GARDEN',
    viewLabel:'view the boards'
  });
}
function endBonus(board){
  var out={rows:0,cols:0,colors:0,total:0};
  for(var r=0;r<5;r++){var full=true;for(var c=0;c<5;c++)if(!board.wall[r][c]){full=false;break;}if(full)out.rows++;}
  for(var c2=0;c2<5;c2++){var f2=true;for(var r2=0;r2<5;r2++)if(!board.wall[r2][c2]){f2=false;break;}if(f2)out.cols++;}
  COLORS.forEach(function(color){
    var count=0;
    for(var r3=0;r3<5;r3++){var ci=WALL_PATTERN[r3].indexOf(color);if(board.wall[r3][ci])count++;}
    if(count===5)out.colors++;
  });
  out.total=out.rows*2+out.cols*7+out.colors*10;
  return out;
}

// ── Rendering (delta) ───────────────────────────────────────────────────
function buildDOM(host){
  pan=document.createElement('div'); pan.id='MSpan'; host.appendChild(pan);
  topBar=document.createElement('div'); topBar.className='MStop'; pan.appendChild(topBar);
  topBar.innerHTML=
    '<div class="MStopCell"><div class="MStopLbl">YOU</div><div class="MStopVal" id="MSp">0</div></div>'+
    '<div class="MStopCell"><div class="MStopLbl">ROUND</div><div class="MStopVal" id="MSr">1</div><div class="MSturn" id="MSt">Your turn</div></div>'+
    '<div class="MStopCell"><div class="MStopLbl">MIRROR</div><div class="MStopVal" id="MSa">0</div></div>';
  topEls.score=topBar.querySelector('#MSp');
  topEls.ai=topBar.querySelector('#MSa');
  topEls.round=topBar.querySelector('#MSr');
  topEls.turn=topBar.querySelector('#MSt');
  statusEl=document.createElement('div'); statusEl.className='MSstatus'; pan.appendChild(statusEl);
  bagEl=document.createElement('div'); bagEl.className='MSbagBar'; pan.appendChild(bagEl);
  facRow=document.createElement('div'); facRow.className='MSfactories'; pan.appendChild(facRow);
  facRow.addEventListener('click', function(e){
    if(S.selected || aiBusy || S.turn!=='player') return;
    var fac=e.target.closest('.MSfac');
    var tile=fac?nearestTile(fac, e, '[data-fi][data-color]', 0):e.target.closest('[data-fi][data-color]');
    if(!tile)return;
    var fi=parseInt(tile.getAttribute('data-fi'),10);
    var color=tile.getAttribute('data-color');
    selectFromFactory(fi, color);
  });
  centerEl=document.createElement('div'); centerEl.className='MScenter'; pan.appendChild(centerEl);
  centerEl.addEventListener('click', function(e){
    if(S.selected || aiBusy || S.turn!=='player') return;
    var tile=nearestTile(centerEl, e, '[data-color]', 40);
    if(!tile)return;
    selectFromCenter(tile.getAttribute('data-color'));
  });
  var boards=document.createElement('div'); boards.className='MSboards'; pan.appendChild(boards);
  playerBoardEl=document.createElement('div'); playerBoardEl.className='MSboard'; boards.appendChild(playerBoardEl);
  aiBoardEl=document.createElement('div'); aiBoardEl.className='MSboard ai'; boards.appendChild(aiBoardEl);
  // Delegate clicks on player board for row/floor placement
  playerBoardEl.addEventListener('click', function(e){
    if(!S.selected) return;
    var rowEl=e.target.closest('[data-stage-row]');
    if(rowEl){
      var ri=parseInt(rowEl.getAttribute('data-stage-row'),10);
      placeOnRow(ri);
      return;
    }
    if(e.target.closest('[data-stage-floor]')){ placeOnFloor(); return; }
  });
  ctrlRow=document.createElement('div'); ctrlRow.className='MSctrls'; pan.appendChild(ctrlRow);
}

function showDifficultyPicker(){
  if(pan){pan.innerHTML='';}
  else{pan=document.createElement('div');pan.id='MSpan';hostEl.appendChild(pan);}
  var ov=document.createElement('div');ov.className='MSdiffPick';pan.appendChild(ov);
  ov.innerHTML=
    '<div class="MSdiffTitle">MOSAIC GARDEN</div>'+
    '<div class="MSdiffSub">Draft colored tiles from the beds and the pond. Fill a staging row to transfer one tile to your mosaic and score by adjacency.</div>'+
    '<div class="MSdiffBtns">'+
      '<button class="MSdiffBtn" data-diff="easy"><div class="MSdlv">EASY MIRROR</div><div class="MSdsub">Greedy picks. Good for learning.</div></button>'+
      '<button class="MSdiffBtn" data-diff="steady"><div class="MSdlv">STEADY MIRROR</div><div class="MSdsub">Row fit and floor avoidance.</div></button>'+
      '<button class="MSdiffBtn" data-diff="keen"><div class="MSdlv">KEEN MIRROR</div><div class="MSdsub">Wall adjacency and endgame bonuses.</div></button>'+
    '</div>';
  ov.addEventListener('click', function(e){
    var b=e.target.closest('[data-diff]');
    if(!b)return;
    startGame(b.getAttribute('data-diff'));
  });
}

function updateAll(){
  if(!topBar)return;
  updateHUD();
  updateStatus();
  updateBagBar();
  updateFactories();
  updateCenter();
  updateBoard(playerBoardEl, S.player, 'YOUR MOSAIC', true);
  updateBoard(aiBoardEl, S.ai, 'MIRROR', false);
  updateControls();
}

// Bag tracker — shows how many tiles of each color remain in the bag
// (and unavailable supply). Digital Azul apps often omit this and serious
// players want it for endgame planning.
function updateBagBar(){
  if(!bagEl)return;
  var counts={petal:0,leaf:0,berry:0,sun:0,frost:0};
  S.bag.forEach(function(c){counts[c]++;});
  S.discard.forEach(function(c){if(counts[c]!==undefined)counts[c]++;});
  var total=S.bag.length+S.discard.length;
  var html='<span class="MSbagLbl">POOL</span>';
  COLORS.forEach(function(c){
    html+='<span class="MSbagChip" style="background:'+BG[c]+'33;border-color:'+BG[c]+'55">'+ICONS[c]+' <b>'+counts[c]+'</b></span>';
  });
  html+='<span class="MSbagTotal">'+total+' left</span>';
  bagEl.innerHTML=html;
}

function updateHUD(){
  topEls.score.textContent=S.player.score;
  topEls.ai.textContent=S.ai.score;
  topEls.round.textContent=S.round;
  if(S.phase==='gameover'){
    topEls.turn.textContent='Game over';
    topEls.turn.className='MSturn ai';
  } else if(S.phase==='score'){
    topEls.turn.textContent='Scoring…';
    topEls.turn.className='MSturn ai';
  } else if(S.turn==='player'){
    topEls.turn.textContent='Your turn';
    topEls.turn.className='MSturn active';
  } else {
    topEls.turn.textContent='Mirror thinking';
    topEls.turn.className='MSturn ai';
  }
}

function updateStatus(){
  if(!statusEl)return;
  var txt='';
  if(S.phase==='gameover'){txt='Final score tallied.';}
  else if(S.phase==='score'){txt='Transferring full rows to the wall.';}
  else if(S.selected){
    txt='Picked <em>'+S.selected.tiles.length+' '+COLOR_NAMES[S.selected.color]+'</em>. Tap a highlighted row — or tap your floor to dump them.';
  } else if(S.turn==='player'){
    txt='Tap any tile in a <em>bed</em> or the <em>pond</em> to take all of that color.';
  } else {
    txt='Mirror is choosing a pick.';
  }
  statusEl.innerHTML=txt;
}

function tileHTML(color, extraCls, dataAttrs){
  var cls='MStile'+(extraCls?' '+extraCls:'');
  var attrs=dataAttrs||'';
  // 12px transparent padding + background-clip keeps the VISUAL tile 24px
  // while the tap target becomes 48px (fleet minimum). The boxes overlap
  // at factory density, so the delegated handlers resolve a tap to the
  // NEAREST tile center (see nearestTile) instead of DOM paint order.
  return '<div class="'+cls+'" '+attrs+' style="background:'+BG[color]+';background-clip:content-box;-webkit-background-clip:content-box;padding:12px;margin:-12px;width:24px;height:24px;box-sizing:content-box">'+ICONS[color]+'</div>';
}

function updateFactories(){
  if(!facRow)return;
  var html='';
  for(var f=0;f<5;f++){
    var cells=S.factories[f];
    var empty=cells.length===0?' empty':'';
    html+='<div class="MSfac'+empty+'">';
    cells.forEach(function(c){
      var focusCls=(S.selected && S.selected.source==='fac' && S.selected.facIdx===f && S.selected.color===c)?' focus':'';
      html+=tileHTML(c, focusCls, 'data-fi="'+f+'" data-color="'+c+'"');
    });
    html+='</div>';
  }
  facRow.innerHTML=html;
}

function updateCenter(){
  if(!centerEl)return;
  if(S.center.length===0 && !S.firstPlayerTaken){
    centerEl.innerHTML='<span class="MScenterEmpty">POND EMPTY</span>';
    return;
  }
  var html='';
  if(!S.firstPlayerTaken)html+='<div class="MSfirstMarker">1st</div>';
  var grouped=groupCount(S.center);
  for(var color in grouped){
    for(var i=0;i<grouped[color];i++){
      var focusCls=(S.selected && S.selected.source==='center' && S.selected.color===color)?' focus':'';
      html+=tileHTML(color, focusCls, 'data-color="'+color+'"');
    }
  }
  centerEl.innerHTML=html;
}

function updateBoard(el, board, title, isPlayer){
  if(!el)return;
  var html='';
  // Endgame-close warning: if any wall row has 4 tiles, one more completes
  // that row and ends the game. Visual cue for both boards so the player
  // sees when the opponent is about to trigger final scoring.
  var closeToEnd=false;
  for(var r=0;r<5;r++){
    var count=0; for(var c=0;c<5;c++)if(board.wall[r][c])count++;
    if(count>=4){closeToEnd=true;break;}
  }
  html+='<div class="MSboardTitle"><span>'+title+(closeToEnd?'<span class="warn">1 AWAY</span>':'')+'</span><span class="pts">'+board.score+' pts</span></div>';
  html+='<div class="MSrows">';
  for(var r=0;r<5;r++){
    var maxSize=r+1;
    var rowClass='MSrow'+(isPlayer?' mine':'');
    // Compatibility for player's row highlight
    var stagingCls='MSstaging';
    var rowGain='';
    if(isPlayer && S.selected){
      if(canStage(board, r, S.selected.color)){
        stagingCls+=' compatible';
        var delta=placementDelta(board, r, S.selected.color, S.selected.tiles.length);
        if(delta>0)rowGain='<span class="MSrowGain">+'+delta+'</span>';
      } else {
        stagingCls+=' incompatible';
      }
    }
    html+='<div class="'+rowClass+'" data-row-r="'+r+'">';
    html+='<div class="'+stagingCls+'"'+(isPlayer?' data-stage-row="'+r+'"':'')+'>';
    var row=board.staging[r];
    // Empty slots first, filled tiles on right
    for(var s=0;s<maxSize-row.length;s++) html+='<div class="MStile MSstageSlot" style="width:22px;height:22px;background:transparent"></div>';
    // Build directly (like the wall tiles below) — routing through tileHTML with
    // a second style="" collided with its hardcoded style attr; the browser kept
    // the first and DROPPED the tile's background color (2026-07-05 verify). The
    // .MSstaging row owns the 48px touch box, so these are 22px display tiles.
    for(var s2=0;s2<row.length;s2++) html+='<div class="MStile" style="background:'+BG[row[s2]]+';width:22px;height:22px">'+ICONS[row[s2]]+'</div>';
    html+='</div>';
    html+='<div class="MSarrow">→</div>';
    html+='<div class="MSwall">';
    for(var c=0;c<5;c++){
      var wc=WALL_PATTERN[r][c];
      if(board.wall[r][c]){
        html+='<div class="MStile" style="background:'+BG[wc]+';width:22px;height:22px;box-shadow:0 0 8px rgba(255,216,106,0.35),inset 0 1px 0 rgba(255,255,255,0.2)">'+ICONS[wc]+'</div>';
      } else {
        html+='<div class="MStile" style="background:'+BG[wc]+';width:22px;height:22px;opacity:0.22;border-style:dashed">'+ICONS[wc]+'</div>';
      }
    }
    html+='</div>'+rowGain;
    html+='</div>';
  }
  html+='</div>';
  // Floor
  var floorCls='MSfloor'+(isPlayer && S.selected?' dropTarget':'');
  html+='<div class="'+floorCls+'"'+(isPlayer?' data-stage-floor="1"':'')+'>';
  html+='<span class="MSfloorLbl">FLOOR</span>';
  for(var fl=0;fl<7;fl++){
    var filled=fl<board.floor.length;
    html+='<div class="MSfloorSlot'+(filled?' filled':'')+'">'+(filled?(board.floor[fl]==='first'?'1st':ICONS[board.floor[fl]]):FLOOR_PEN[fl])+'</div>';
  }
  html+='</div>';
  el.innerHTML=html;
}

function updateControls(){
  if(!ctrlRow)return;
  ctrlRow.innerHTML='';
  if(S.phase==='gameover')return;
  if(S.turn!=='player')return;
  if(S.selected){
    ctrlRow.appendChild(mkBtn('↩ UNDO PICK','default',undoSelection));
    ctrlRow.appendChild(mkBtn('DUMP TO FLOOR','danger',placeOnFloor));
  } else {
    ctrlRow.appendChild(mkBtn('↻ NEW','default',function(){ requestNewGame(); }));
  }
}
function mkBtn(label, style, onClick){
  var b=document.createElement('button'); b.className='MSbtn';
  if(style==='primary')b.className+=' primary';
  else if(style==='danger')b.className+=' danger';
  b.textContent=label;
  b.addEventListener('click', function(e){ e.preventDefault(); onClick(); });
  return b;
}

// ── Breakdown popup ─────────────────────────────────────────────────────
function showBreakdown(title, lines, total){
  if(breakdownEl){breakdownEl.remove();breakdownEl=null;}
  breakdownEl=document.createElement('div'); breakdownEl.id='MSbreak';
  var h='<div class="MSbreakTitle">'+title+'</div>';
  if(lines.length===0)h+='<div class="MSbreakLine">(nothing scored)</div>';
  lines.forEach(function(l){
    h+='<div class="MSbreakLine'+(l.pen?' pen':'')+'"><span>'+l.label+'</span><span>'+(l.pts>0?'+':'')+l.pts+'</span></div>';
  });
  h+='<div class="MSbreakTotal"><span>TOTAL</span><span>'+(total>0?'+':'')+total+'</span></div>';
  breakdownEl.innerHTML=h;
  document.body.appendChild(breakdownEl);
  // Capture THIS element — a stale fade timer must never touch a newer
  // popup (or one already removed by the exit cleanup).
  var el=breakdownEl;
  setTimeout(function(){
    if(breakdownEl!==el)return;
    el.style.transition='opacity .4s ease,transform .4s ease';
    el.style.opacity='0';
    el.style.transform='translateX(-50%) translateY(6px)';
    setTimeout(function(){if(breakdownEl===el){el.remove();breakdownEl=null;}}, 420);
  }, 2600);
}

// ── End card ────────────────────────────────────────────────────────────
function showEndCard(pBonus, aBonus, won){
  if(endEl){endEl.remove();}
  endEl=document.createElement('div'); endEl.className='MSend';
  var title=won?'GARDEN COMPLETE':(S.player.score===S.ai.score?'GARDEN MIRRORED':'MIRROR WINS');
  endEl.innerHTML=
    '<div class="MSendTitle">'+title+'</div>'+
    '<div class="MSendScores">YOU '+S.player.score+'  ·  MIRROR '+S.ai.score+'</div>'+
    '<div class="MSendBreak">'+
      '<div class="row"><span>Your rows ×2</span><span>+'+pBonus.rows*2+' ('+pBonus.rows+')</span></div>'+
      '<div class="row"><span>Your columns ×7</span><span>+'+pBonus.cols*7+' ('+pBonus.cols+')</span></div>'+
      '<div class="row"><span>Your color sets ×10</span><span>+'+pBonus.colors*10+' ('+pBonus.colors+')</span></div>'+
      '<div class="row total"><span>End bonus</span><span>+'+pBonus.total+'</span></div>'+
    '</div>';
  var btn=mkBtn('↻ NEW GARDEN','primary',function(){ requestNewGame(); });
  endEl.appendChild(btn);
  pan.appendChild(endEl);
  // The card sits below both boards — bring it into view on phones
  try{endEl.scrollIntoView({behavior:'smooth',block:'nearest'});}catch(e2){if(endEl.scrollIntoView)endEl.scrollIntoView(false);}
}

// ── Lifecycle ───────────────────────────────────────────────────────────
function requestNewGame(){
  gen++; // pending AI/scoring/endGame timers from the old match must die
  if(S)S.phase='idle';
  aiBusy=false;
  if(endEl){endEl.remove();endEl=null;}
  if(breakdownEl){breakdownEl.remove();breakdownEl=null;}
  showDifficultyPicker();
}

function startGame(difficulty){
  gen++; // kill any timers from a previous match
  _setDiff(difficulty==='easy'?'easy':difficulty==='steady'?'medium':'hard');
  var bag=[]; COLORS.forEach(function(c){for(var i=0;i<20;i++)bag.push(c);});shuf(bag);
  S={
    bag:bag,
    discard:[],
    factories:[[],[],[],[],[]],
    center:[],
    firstPlayerTaken:false,
    firstTaker:null,
    player:newBoard(),
    ai:newBoard(),
    round:1,
    turn:'player',
    phase:'draft',
    selected:null,
    difficulty:difficulty
  };
  fillFactories();
  if(pan)pan.innerHTML='';
  buildDOM(hostEl);
  updateAll();
}

window._gameFns = window._gameFns || {};
window._gameFns.mosaic = function(a){
  gen++;
  pan=null; topBar=null; statusEl=null; facRow=null; centerEl=null;
  playerBoardEl=null; aiBoardEl=null; ctrlRow=null;
  topEls={score:null,ai:null,round:null,turn:null};
  if(breakdownEl){breakdownEl.remove();breakdownEl=null;}
  if(endEl){endEl.remove();endEl=null;}
  aiBusy=false;
  hostEl=a;
  // On exit: kill all pending timers and pull the body-level popup so it
  // can't appear over the picker or another game.
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    gen++; aiBusy=false;
    if(breakdownEl){breakdownEl.remove();breakdownEl=null;}
    if(endEl){endEl.remove();endEl=null;}
  });
  showDifficultyPicker();
};
})();
