// ═══ GARDEN LINES — Qwirkle rebuild ═══
// 108-tile Qwirkle with canonical multi-line scoring, per-spot score
// preview, undo-in-turn, partial swap, Qwirkle celebration, difficulty
// picker, delta-render (no more whole-DOM rebuild per tap).
(function(){
'use strict';
var LWG=window._G;
var _e=LWG.e,_play=LWG.play,_playWin=LWG.playWin,_setDiff=LWG.setDiff,ms=LWG.ms,mm=LWG.mm,mc=LWG.mc,sm=LWG.sm,_sr=LWG.sr;

// ── Tile constants ──────────────────────────────────────────────────────
var SHAPES=['\u{1F338}','\u{1F33F}','\u{1F4A7}','☀️','\u{1F331}','\u{1F344}'];
var COLORS=['#E07A8A','#6BAD4A','#5B9BD5','#D4A843','#D8C7A8','#A96BB8'];
var SHAPE_NAMES=['Blossom','Leaf','Drop','Sun','Sprout','Mushroom'];

// ── Styles ──────────────────────────────────────────────────────────────
(function injectStyle(){
  if(document.getElementById('gl-style'))return;
  var s=document.createElement('style');s.id='gl-style';
  s.textContent=[
    '@keyframes glFade{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes glPop{0%{transform:scale(0.5);opacity:0}55%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes glQwirkleSplash{0%{opacity:0;transform:translate(-50%,-50%) scale(0.3) rotate(-14deg)}30%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(3deg)}55%{transform:translate(-50%,-50%) scale(0.94) rotate(-2deg)}100%{opacity:0;transform:translate(-50%,-60%) scale(1) rotate(0)}}',
    '@keyframes glCellShake{0%,100%{transform:translate(0)}25%{transform:translate(-2px,1px)}50%{transform:translate(2px,-1px)}75%{transform:translate(-1px,2px)}}',
    '#GLpan{max-width:min(100vw,560px);margin:0 auto;padding:6px;user-select:none;-webkit-user-select:none;box-sizing:border-box;font-family:Georgia,serif;animation:glFade .3s ease}',
    // Difficulty picker (game start)
    '.GLdiffPick{display:flex;flex-direction:column;align-items:center;gap:14px;padding:36px 12px 20px;animation:glFade .3s ease}',
    '.GLdiffTitle{font-family:Bebas Neue,sans-serif;font-size:1.7rem;letter-spacing:0.22em;color:#c8a84b}',
    '.GLdiffSub{font-family:Georgia,serif;font-size:0.78rem;color:rgba(232,220,200,0.7);text-align:center;max-width:320px;line-height:1.5}',
    '.GLdiffBtns{display:flex;flex-direction:column;gap:10px;width:100%;max-width:280px;margin-top:12px}',
    '.GLdiffBtn{min-height:62px;padding:10px 14px;border-radius:12px;background:rgba(26,36,22,0.85);border:1.5px solid rgba(122,179,86,0.35);color:#e8dcc8;font-family:Georgia,serif;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;flex-direction:column;align-items:flex-start;gap:2px}',
    '.GLdiffBtn:active{transform:scale(0.98);background:rgba(122,179,86,0.22)}',
    '.GLdiffBtn .GLdlv{font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.18em;color:#c8a84b}',
    '.GLdiffBtn .GLdsub{font-size:0.68rem;color:rgba(232,220,200,0.75)}',
    // Score banner
    '.GLscore{display:grid;grid-template-columns:1fr 1.1fr 1fr;gap:6px;padding:8px 10px;margin:2px 0 6px;background:linear-gradient(135deg,rgba(26,31,23,0.88),rgba(13,16,12,0.92));border:1.5px solid rgba(122,179,86,0.25);border-radius:10px;font-family:Bebas Neue,sans-serif}',
    '.GLscoreCell{text-align:center}',
    '.GLscoreLbl{font-size:0.6rem;letter-spacing:0.18em;color:rgba(232,220,200,0.55)}',
    '.GLscoreVal{font-family:DM Mono,monospace;font-size:1.15rem;color:#c8a84b;font-weight:700;margin-top:1px}',
    '.GLscoreMid{text-align:center}',
    '.GLturn{font-size:0.68rem;letter-spacing:0.16em;margin-top:1px}',
    '.GLturn.active{color:#8fc57a}',
    '.GLturn.ai{color:rgba(232,220,200,0.55)}',
    '.GLbagRow{font-family:DM Mono,monospace;font-size:0.62rem;color:rgba(232,220,200,0.55);margin-top:2px}',
    // Board frame
    '.GLboardWrap{position:relative;background:rgba(8,12,6,0.55);border:1.5px solid rgba(74,124,53,0.3);border-radius:10px;padding:4px;margin:4px 0;overflow:auto;-webkit-overflow-scrolling:touch;max-height:56vh;min-height:260px}',
    '.GLboardGrid{display:grid;gap:3px;justify-content:center;padding:2px}',
    '.GLtile{width:44px;height:44px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;box-sizing:border-box;position:relative;box-shadow:0 1px 3px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.12),inset 0 -1px 0 rgba(0,0,0,0.22);border:1.5px solid rgba(0,0,0,0.3)}',
    '.GLtile.just{animation:glPop .35s cubic-bezier(.2,1.2,.3,1) both}',
    '.GLtile.tentative{outline:2px solid #ffd86a;outline-offset:-2px;box-shadow:0 0 12px rgba(255,216,106,0.55),0 1px 3px rgba(0,0,0,0.5);z-index:2}',
    '.GLtile.qwirkle-glow{animation:glCellShake .45s ease-in-out;box-shadow:0 0 18px rgba(255,216,106,0.75),inset 0 0 8px rgba(255,216,106,0.4)}',
    '.GLempty{width:44px;height:44px;border-radius:7px;box-sizing:border-box;position:relative}',
    '.GLempty.inbounds{border:1px dashed rgba(74,124,53,0.14)}',
    '.GLempty.valid{border:2px solid rgba(122,179,86,0.55);background:rgba(122,179,86,0.12);cursor:pointer}',
    '.GLempty.valid:active{background:rgba(122,179,86,0.24)}',
    '.GLprev{position:absolute;bottom:2px;right:3px;font-family:DM Mono,monospace;font-size:0.56rem;font-weight:700;color:#c8a84b;text-shadow:0 1px 2px rgba(0,0,0,0.9);pointer-events:none}',
    '.GLprev.qwirkle{color:#ffd86a;font-size:0.66rem;text-shadow:0 0 5px rgba(255,216,106,0.8),0 1px 2px rgba(0,0,0,0.9)}',
    // Hand + swap mode
    '.GLhandBox{padding:4px 2px 2px}',
    '.GLhandLbl{font-family:Bebas Neue,sans-serif;font-size:0.65rem;letter-spacing:0.16em;color:rgba(232,220,200,0.7);text-align:center;margin-bottom:4px}',
    '.GLhandLbl.swap{color:#ffb3b3}',
    '.GLhand{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;min-height:60px}',
    '.GLhandTile{width:52px;height:52px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1.55rem;cursor:pointer;box-sizing:border-box;border:2px solid rgba(0,0,0,0.3);box-shadow:0 2px 6px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.14),inset 0 -1px 0 rgba(0,0,0,0.22);transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease;-webkit-tap-highlight-color:transparent;touch-action:manipulation;position:relative}',
    '.GLhandTile.sel{border-color:#ffd86a;transform:translateY(-5px);box-shadow:0 6px 14px rgba(255,216,106,0.5),0 2px 6px rgba(0,0,0,0.4)}',
    '.GLhandTile.marked{border-color:#e07a7a;outline:2px dashed rgba(224,122,122,0.7);outline-offset:2px}',
    '.GLhandTile.marked::after{content:"✕";position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:9px;background:#e07a7a;color:#fff;font-size:0.7rem;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;box-shadow:0 1px 3px rgba(0,0,0,0.5)}',
    // Controls
    '.GLctrls{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;padding:8px 2px 6px}',
    '.GLbtn{min-height:46px;padding:9px 12px;font-family:Georgia,serif;font-size:0.78rem;letter-spacing:0.1em;border-radius:9px;background:rgba(26,31,23,0.8);border:1.5px solid rgba(220,180,120,0.32);color:#e8dcc8;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:6px}',
    '.GLbtn:active{transform:scale(0.96);background:rgba(200,168,75,0.22)}',
    '.GLbtn.primary{background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.4));border-color:rgba(122,179,86,0.55);color:#8fc57a;font-weight:700}',
    '.GLbtn.danger{background:rgba(112,40,40,0.42);border-color:rgba(224,122,122,0.5);color:#ffb3b3}',
    '.GLbtn.gold{background:linear-gradient(180deg,rgba(200,168,75,0.28),rgba(160,130,50,0.36));border-color:#c8a84b;color:#ffdc70;font-weight:700}',
    '.GLbtn[disabled]{opacity:0.4;cursor:default;pointer-events:none}',
    // Qwirkle splash
    '#GLqwirkle{position:absolute;top:50%;left:50%;pointer-events:none;z-index:10;font-family:Bebas Neue,sans-serif;font-size:clamp(2.4rem,8vw,3.8rem);color:#ffd86a;letter-spacing:0.22em;text-shadow:0 0 20px rgba(255,216,106,0.9),0 2px 8px rgba(0,0,0,0.85),0 0 40px rgba(255,216,106,0.5)}',
    // Score breakdown popup
    '#GLbreak{position:fixed;bottom:96px;left:50%;transform:translateX(-50%);z-index:60;background:linear-gradient(180deg,rgba(26,36,22,0.95),rgba(13,16,12,0.96));border:1.5px solid rgba(200,168,75,0.55);border-radius:12px;padding:11px 15px 10px;min-width:220px;max-width:88vw;box-shadow:0 6px 24px rgba(0,0,0,0.7);font-family:Georgia,serif;animation:glPop .32s cubic-bezier(.2,1.2,.3,1) both}',
    '.GLbreakTitle{font-family:Bebas Neue,sans-serif;font-size:0.78rem;letter-spacing:0.18em;color:#c8a84b;text-align:center;margin-bottom:6px}',
    '.GLbreakLine{display:flex;justify-content:space-between;align-items:center;font-family:DM Mono,monospace;font-size:0.72rem;color:#e8dcc8;padding:2px 0;gap:10px}',
    '.GLbreakLine .qpill{font-family:Bebas Neue,sans-serif;background:linear-gradient(180deg,#f5dc95,#c8a84b);color:#0d100c;padding:1px 6px;border-radius:4px;font-size:0.58rem;letter-spacing:0.1em;font-weight:700}',
    '.GLbreakTotal{display:flex;justify-content:space-between;border-top:1px solid rgba(200,168,75,0.25);margin-top:6px;padding-top:6px;font-family:Bebas Neue,sans-serif;font-size:0.82rem;letter-spacing:0.14em;color:#ffdc70}',
    // Game-over card
    '.GLend{margin:14px auto;max-width:360px;padding:20px;background:linear-gradient(180deg,rgba(20,28,18,0.97),rgba(13,16,12,0.98));border-radius:14px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.6);animation:glFade .3s ease}',
    '.GLend.win{border:2px solid rgba(200,168,75,0.55)}',
    '.GLend.lose{border:2px solid rgba(199,80,80,0.42)}',
    '.GLendTitle{font-family:Bebas Neue,sans-serif;font-size:1.6rem;letter-spacing:0.14em;margin-bottom:10px}',
    '.GLendScores{font-family:DM Mono,monospace;font-size:0.9rem;color:#e8dcc8;margin-bottom:14px}'
  ].join('');
  document.head.appendChild(s);
})();

// ── State ───────────────────────────────────────────────────────────────
var S=null;

// DOM refs — built once, mutated
var pan=null, diffOverlay=null, scoreBar=null, boardWrap=null, boardGrid=null;
var handBox=null, handLbl=null, handGrid=null, ctrlRow=null;
var scoreEls={you:null,ai:null,bag:null,turn:null};
var breakdownEl=null, qwirkleEl=null, endEl=null;

// ── Tile helpers ────────────────────────────────────────────────────────
function shuf(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function makeBag(){var b=[];for(var s=0;s<6;s++)for(var c=0;c<6;c++)for(var n=0;n<3;n++)b.push({shape:s,color:c});return shuf(b);}
function tileKey(t){return t.shape+','+t.color;}
function pk(r,c){return r+','+c;}
function get(r,c){return S.board[pk(r,c)]||null;}
function put(r,c,t){S.board[pk(r,c)]=t;if(r<S.bMin.r)S.bMin.r=r;if(r>S.bMax.r)S.bMax.r=r;if(c<S.bMin.c)S.bMin.c=c;if(c>S.bMax.c)S.bMax.c=c;}
function del(r,c){delete S.board[pk(r,c)];}

// ── Line detection + validation ─────────────────────────────────────────
function getLineSegment(r,c,dr,dc){
  var line=[];var cr=r+dr,cc=c+dc;
  while(get(cr,cc)){line.push({r:cr,c:cc,tile:get(cr,cc)});cr+=dr;cc+=dc;}
  return line;
}
function getFullLine(r,c,dr,dc){
  var neg=getLineSegment(r,c,-dr,-dc).reverse();
  var pos=getLineSegment(r,c,dr,dc);
  var center=get(r,c)?[{r:r,c:c,tile:get(r,c)}]:[];
  return neg.concat(center).concat(pos);
}
function isValidLine(line){
  if(line.length>6)return false;
  var sameShape=true,sameColor=true;
  for(var i=1;i<line.length;i++){
    if(line[i].tile.shape!==line[0].tile.shape)sameShape=false;
    if(line[i].tile.color!==line[0].tile.color)sameColor=false;
  }
  if(!sameShape&&!sameColor)return false;
  var seen={};
  for(var j=0;j<line.length;j++){var k=tileKey(line[j].tile);if(seen[k])return false;seen[k]=true;}
  return true;
}

// Can a tile go at (r,c) based purely on line rules + adjacency (ignoring
// turn-axis constraints that apply during multi-tile placements).
function canPlaceIsolated(r,c,tile){
  if(get(r,c))return false;
  var isFirst=Object.keys(S.board).length===0;
  if(!isFirst){
    var hasAdj=get(r-1,c)||get(r+1,c)||get(r,c-1)||get(r,c+1);
    if(!hasAdj)return false;
  }
  put(r,c,tile);
  var hL=getFullLine(r,c,0,1), vL=getFullLine(r,c,1,0);
  var ok=true;
  if(hL.length>1)ok=ok&&isValidLine(hL);
  if(vL.length>1)ok=ok&&isValidLine(vL);
  del(r,c);
  return ok;
}

// Additional constraint: during a turn, all placed tiles must lie in the
// same row or same column AND be contiguous (with existing board tiles
// filling gaps).
function canPlaceThisTurn(r,c,tile){
  if(!canPlaceIsolated(r,c,tile))return false;
  if(S.placed.length===0)return true;
  var sameRow=S.placed.every(function(p){return p.r===r;});
  var sameCol=S.placed.every(function(p){return p.c===c;});
  if(!sameRow&&!sameCol)return false;
  if(sameRow){
    var cols=S.placed.map(function(p){return p.c;}).concat([c]);
    var minC=Math.min.apply(null,cols), maxC=Math.max.apply(null,cols);
    for(var cc=minC;cc<=maxC;cc++){
      var placedHere=(cc===c)||S.placed.some(function(p){return p.c===cc;});
      if(!placedHere&&!get(r,cc))return false;
    }
  } else {
    var rows=S.placed.map(function(p){return p.r;}).concat([r]);
    var minR=Math.min.apply(null,rows), maxR=Math.max.apply(null,rows);
    for(var rr=minR;rr<=maxR;rr++){
      var ph=(rr===r)||S.placed.some(function(p){return p.r===rr;});
      if(!ph&&!get(rr,c))return false;
    }
  }
  return true;
}

// Candidate positions — cells adjacent to any placed tile.
function getCandidatePositions(){
  var pos={};
  if(Object.keys(S.board).length===0){pos[pk(0,0)]=[0,0];return[[0,0]];}
  for(var key in S.board){
    var parts=key.split(',');var r=parseInt(parts[0],10),c=parseInt(parts[1],10);
    var nbr=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
    for(var i=0;i<nbr.length;i++){
      var p=nbr[i];var k=pk(p[0],p[1]);
      if(!S.board[k])pos[k]=p;
    }
  }
  return Object.keys(pos).map(function(k){return pos[k];});
}

// ── Scoring (canonical — each line scored once per turn) ────────────────
function scoreTurn(){
  if(S.placed.length===0)return {pts:0,lines:[]};
  var scored={}, pts=0, lines=[];
  S.placed.forEach(function(p){
    var hL=getFullLine(p.r,p.c,0,1);
    if(hL.length>1){
      var hK='H:'+hL[0].r+':'+hL[0].c;
      if(!scored[hK]){
        scored[hK]=true;
        var hP=hL.length+(hL.length===6?6:0);
        pts+=hP; lines.push({dir:'H',length:hL.length,pts:hP,qwirkle:hL.length===6,cells:hL});
      }
    }
    var vL=getFullLine(p.r,p.c,1,0);
    if(vL.length>1){
      var vK='V:'+vL[0].r+':'+vL[0].c;
      if(!scored[vK]){
        scored[vK]=true;
        var vP=vL.length+(vL.length===6?6:0);
        pts+=vP; lines.push({dir:'V',length:vL.length,pts:vP,qwirkle:vL.length===6,cells:vL});
      }
    }
  });
  // Canonical singleton: first tile of game scores 1 if no line formed.
  if(pts===0&&S.placed.length===1)pts=1;
  return {pts:pts,lines:lines};
}

// How many points would placing `tile` at (r,c) add to the turn total?
function scoreDelta(r,c,tile){
  if(!canPlaceThisTurn(r,c,tile))return null;
  var before=scoreTurn().pts;
  put(r,c,tile);
  S.placed.push({r:r,c:c,tile:tile,slotIdx:-1});
  var after=scoreTurn().pts;
  S.placed.pop();
  del(r,c);
  return after-before;
}

// ── Turn actions ────────────────────────────────────────────────────────
function selectTile(slotIdx){
  if(S.phase!=='play'||S.turn!=='player')return;
  if(S.mode==='swap'){toggleSwapMark(slotIdx);return;}
  if(!S.pHand[slotIdx])return;
  S.selIdx=(S.selIdx===slotIdx)?-1:slotIdx;
  updateHand();
  updateBoard();
}

function placeTile(r,c){
  if(S.phase!=='play'||S.turn!=='player'||S.mode==='swap')return;
  if(S.selIdx<0)return;
  var tile=S.pHand[S.selIdx];
  if(!tile){S.selIdx=-1;updateHand();return;}
  if(!canPlaceThisTurn(r,c,tile)){sm('Invalid placement');return;}
  var slotIdx=S.selIdx;
  put(r,c,tile);
  S.placed.push({r:r,c:c,tile:tile,slotIdx:slotIdx,justPlaced:true});
  S.pHand[slotIdx]=null;
  S.selIdx=-1;
  _play('tap');
  _e('progress');
  updateHand();
  updateBoard();
  updateHUD();
  updateControls();
}

function undoLastPlacement(){
  if(S.placed.length===0)return;
  var last=S.placed.pop();
  del(last.r,last.c);
  S.pHand[last.slotIdx]=last.tile;
  _play('tap');
  // Drop a previous "justPlaced" flag so the pop animation doesn't replay
  S.placed.forEach(function(p){p.justPlaced=false;});
  updateHand();
  updateBoard();
  updateHUD();
  updateControls();
}

function endTurn(){
  if(S.placed.length===0)return;
  var breakdown=scoreTurn();
  S.pScore+=breakdown.pts;
  var anyQwirkle=breakdown.lines.some(function(l){return l.qwirkle;});
  // Drop "justPlaced" markers so next render doesn't animate
  S.placed.forEach(function(p){p.justPlaced=false;});
  // Refill hand
  S.pHand=compactHand(S.pHand);
  while(S.pHand.length<6&&S.bag.length>0)S.pHand.push(S.bag.pop());
  S.placed=[];
  S.selIdx=-1;
  _play('snap');
  // A Qwirkle is a MID-GAME milestone — firing _e('game_win') here triggered
  // the full win celebration + companion/achievement bumps during play and
  // double-paid on top of the real end-of-game win (Jun 10 audit).
  if(anyQwirkle){ _playWin(); showQwirkleSplash('QWIRKLE +'+breakdown.lines.filter(function(l){return l.qwirkle;}).length*6); }
  _e('milestone');
  S.passCount=0;
  showBreakdown(breakdown.lines, breakdown.pts);
  // Check game-over
  if(S.pHand.length===0&&S.bag.length===0){
    S.pScore+=6; // canonical +6 end bonus
    S.phase='gameover';
    updateAll();
    setTimeout(showEnd,600);
    return;
  }
  S.turn='ai';
  updateAll();
  setTimeout(aiTurn, 700);
}

function compactHand(hand){
  return hand.filter(function(t){return t!==null;});
}

function enterSwapMode(){
  if(S.bag.length===0){sm('Bag is empty');return;}
  if(S.placed.length>0){sm('Finish or undo placements first');return;}
  S.mode='swap';
  S.swapMark={};
  S.selIdx=-1;
  updateAll();
}

function cancelSwap(){
  S.mode='play';
  S.swapMark={};
  updateAll();
}

function toggleSwapMark(slotIdx){
  if(!S.pHand[slotIdx])return;
  if(S.swapMark[slotIdx])delete S.swapMark[slotIdx];
  else S.swapMark[slotIdx]=true;
  updateHand();
  updateControls();
}

function confirmSwap(){
  var marked=Object.keys(S.swapMark).map(function(k){return parseInt(k,10);});
  if(marked.length===0){sm('Tap tiles to swap');return;}
  if(marked.length>S.bag.length){sm('Not enough tiles in bag');return;}
  // Return marked tiles to bag
  marked.forEach(function(i){ S.bag.push(S.pHand[i]); S.pHand[i]=null; });
  shuf(S.bag);
  S.pHand=compactHand(S.pHand);
  while(S.pHand.length<6&&S.bag.length>0)S.pHand.push(S.bag.pop());
  S.mode='play';
  S.swapMark={};
  sm('Swapped '+marked.length);
  _play('tap');
  S.turn='ai';
  updateAll();
  setTimeout(aiTurn, 700);
}

// ── AI ──────────────────────────────────────────────────────────────────
// Three difficulty levels:
//   easy   — best single-tile play (greedy)
//   medium — best play up to 2 tiles in one row/column
//   hard   — best play up to full-hand tiles in one row/column
// Hard adds a light defensive penalty when the move would leave the
// opponent a guaranteed Qwirkle opportunity.

function aiTurn(){
  if(S.phase==='gameover')return;
  var depth=(S.difficulty==='easy')?1:(S.difficulty==='medium')?2:6;
  var best=aiFindBest(depth);
  if(!best||best.score<=0){
    // No viable play — swap if bag has tiles, otherwise pass
    if(S.bag.length>0){
      var n=Math.min(S.aHand.length, S.bag.length);
      for(var i=0;i<S.aHand.length;i++)S.bag.push(S.aHand[i]);
      S.aHand=[];
      shuf(S.bag);
      while(S.aHand.length<6&&S.bag.length>0)S.aHand.push(S.bag.pop());
      sm('Mirror swapped '+n);
    } else {
      sm('Mirror passed');
      // Two consecutive passes with an empty bag = game over (canonical).
      S.passCount=(S.passCount||0)+1;
      if(S.passCount>=2){S.phase='gameover';updateAll();setTimeout(showEnd,500);return;}
    }
    if(S.aHand.length===0&&S.bag.length===0){
      S.aScore+=6; S.phase='gameover'; updateAll(); setTimeout(showEnd,500); return;
    }
    S.turn='player'; S.placed=[]; S.selIdx=-1; updateAll(); return;
  }
  // Stagger the placements so the player sees each tile drop with the
  // score ticking up, instead of all tiles appearing simultaneously.
  S.placed=[];
  S.passCount=0;
  var savedAi=S.aScore;
  var moves=best.moves.slice();
  var idx=0;
  function step(){
    if(idx>=moves.length){
      var turnScore=scoreTurn();
      // S.aScore already updated incrementally as each placement went down
      sm('Mirror +'+turnScore.pts);
      var anyQ=turnScore.lines.some(function(l){return l.qwirkle;});
      if(anyQ)showQwirkleSplash('MIRROR QWIRKLE');
      // Remove used tiles from AI hand (descending to keep idx valid)
      var usedIdxs=moves.map(function(m){return m.idx;}).sort(function(a,b){return b-a;});
      usedIdxs.forEach(function(i){S.aHand.splice(i,1);});
      while(S.aHand.length<6&&S.bag.length>0)S.aHand.push(S.bag.pop());
      // Hold the highlight for a beat, then hand off
      setTimeout(function(){
        S.placed.forEach(function(p){p.justPlaced=false;});
        S.placed=[];
        if(S.aHand.length===0&&S.bag.length===0){
          S.aScore+=6; S.phase='gameover'; updateAll(); setTimeout(showEnd,500); return;
        }
        S.turn='player'; S.selIdx=-1; updateAll();
      }, 800);
      updateAll();
      return;
    }
    var m=moves[idx];
    put(m.r,m.c,m.tile);
    S.placed.push({r:m.r,c:m.c,tile:m.tile,slotIdx:m.idx,justPlaced:true});
    S.aScore=savedAi+scoreTurn().pts;
    _play('tap');
    updateBoard(); updateHUD();
    idx++;
    setTimeout(step, 340);
  }
  step();
}

function aiFindBest(maxDepth){
  var best=null;
  var hand=S.aHand;
  var savedPlaced=S.placed;
  // AI uses the same placed/turn model — start from empty placed.
  S.placed=[];
  var cands=getCandidatePositions();
  function record(score, moves){
    if(!best||score>best.score){best={score:score, moves:moves.slice()};}
  }
  function search(currentMoves, availableIdxs, anchorDir){
    // Score current turn
    var cur=scoreTurn();
    if(currentMoves.length>0) record(cur.pts, currentMoves);
    if(currentMoves.length>=maxDepth)return;
    // Extend: try placing one more tile
    var validCells = (currentMoves.length===0) ? cands : extendCells(currentMoves, anchorDir);
    for(var ci=0;ci<validCells.length;ci++){
      var pos=validCells[ci];
      for(var i=0;i<availableIdxs.length;i++){
        var idx=availableIdxs[i];
        var tile=hand[idx];
        if(!canPlaceThisTurn(pos[0],pos[1],tile))continue;
        // Determine new anchor direction after this placement
        var nextDir=anchorDir;
        if(currentMoves.length>=1&&!anchorDir){
          nextDir=(currentMoves[0].r===pos[0])?'H':'V';
        }
        put(pos[0],pos[1],tile);
        S.placed.push({r:pos[0],c:pos[1],tile:tile,slotIdx:idx,justPlaced:false});
        currentMoves.push({r:pos[0],c:pos[1],tile:tile,idx:idx});
        var nextAvailable=availableIdxs.filter(function(x){return x!==idx;});
        search(currentMoves, nextAvailable, nextDir);
        // Unwind
        currentMoves.pop();
        S.placed.pop();
        del(pos[0],pos[1]);
      }
    }
  }
  function extendCells(moves, dir){
    // Cells that are valid extensions of the current row/col placement
    if(dir==='H'){
      var r=moves[0].r;
      var cols=moves.map(function(m){return m.c;});
      var minC=Math.min.apply(null,cols), maxC=Math.max.apply(null,cols);
      var out=[];
      // Walk left from minC over existing tiles to find next empty
      var cc=minC-1; while(get(r,cc))cc--;
      if(!get(r,cc))out.push([r,cc]);
      cc=maxC+1; while(get(r,cc))cc++;
      if(!get(r,cc))out.push([r,cc]);
      return out;
    } else if(dir==='V'){
      var c=moves[0].c;
      var rows=moves.map(function(m){return m.r;});
      var minR=Math.min.apply(null,rows), maxR=Math.max.apply(null,rows);
      var out=[];
      var rr=minR-1; while(get(rr,c))rr--;
      if(!get(rr,c))out.push([rr,c]);
      rr=maxR+1; while(get(rr,c))rr++;
      if(!get(rr,c))out.push([rr,c]);
      return out;
    } else {
      // After one move, direction not yet fixed — both H and V extend from single point
      var mv=moves[0];
      var o=[];
      var cc2=mv.c-1; while(get(mv.r,cc2))cc2--; if(!get(mv.r,cc2))o.push([mv.r,cc2]);
      cc2=mv.c+1; while(get(mv.r,cc2))cc2++; if(!get(mv.r,cc2))o.push([mv.r,cc2]);
      var rr2=mv.r-1; while(get(rr2,mv.c))rr2--; if(!get(rr2,mv.c))o.push([rr2,mv.c]);
      rr2=mv.r+1; while(get(rr2,mv.c))rr2++; if(!get(rr2,mv.c))o.push([rr2,mv.c]);
      return o;
    }
  }
  var allIdxs=[]; for(var i=0;i<hand.length;i++)allIdxs.push(i);
  search([], allIdxs, null);
  // Restore
  S.placed=savedPlaced;
  return best;
}

// ── Rendering ───────────────────────────────────────────────────────────
// Build DOM once; update functions mutate only what changed.
function buildDOM(host){
  pan=document.createElement('div'); pan.id='GLpan'; host.appendChild(pan);
  // Score bar
  scoreBar=document.createElement('div'); scoreBar.className='GLscore'; pan.appendChild(scoreBar);
  scoreBar.innerHTML=
    '<div class="GLscoreCell"><div class="GLscoreLbl">YOU</div><div class="GLscoreVal" id="GLp">0</div></div>'+
    '<div class="GLscoreMid"><div class="GLscoreLbl" id="GLdiffLbl">EASY</div><div class="GLturn" id="GLturn">YOUR TURN</div><div class="GLbagRow">Bag <span id="GLb">0</span></div></div>'+
    '<div class="GLscoreCell"><div class="GLscoreLbl">MIRROR</div><div class="GLscoreVal" id="GLa">0</div></div>';
  scoreEls.you=scoreBar.querySelector('#GLp');
  scoreEls.ai=scoreBar.querySelector('#GLa');
  scoreEls.bag=scoreBar.querySelector('#GLb');
  scoreEls.turn=scoreBar.querySelector('#GLturn');
  scoreEls.diff=scoreBar.querySelector('#GLdiffLbl');
  // Board
  boardWrap=document.createElement('div'); boardWrap.className='GLboardWrap'; pan.appendChild(boardWrap);
  boardGrid=document.createElement('div'); boardGrid.className='GLboardGrid'; boardWrap.appendChild(boardGrid);
  boardGrid.addEventListener('click', function(e){
    var cell=e.target.closest('[data-r]');
    if(!cell)return;
    var r=parseInt(cell.getAttribute('data-r'),10);
    var c=parseInt(cell.getAttribute('data-c'),10);
    placeTile(r,c);
  });
  // Qwirkle splash overlay (inside boardWrap)
  qwirkleEl=document.createElement('div'); qwirkleEl.id='GLqwirkle'; qwirkleEl.style.display='none'; boardWrap.appendChild(qwirkleEl);
  // Hand
  handBox=document.createElement('div'); handBox.className='GLhandBox'; pan.appendChild(handBox);
  handLbl=document.createElement('div'); handLbl.className='GLhandLbl'; handBox.appendChild(handLbl);
  handGrid=document.createElement('div'); handGrid.className='GLhand'; handBox.appendChild(handGrid);
  handGrid.addEventListener('click', function(e){
    var tile=e.target.closest('[data-slot]');
    if(!tile)return;
    var idx=parseInt(tile.getAttribute('data-slot'),10);
    selectTile(idx);
  });
  // Controls
  ctrlRow=document.createElement('div'); ctrlRow.className='GLctrls'; pan.appendChild(ctrlRow);
}

function showDifficultyPicker(host){
  diffOverlay=document.createElement('div'); diffOverlay.className='GLdiffPick';
  diffOverlay.innerHTML=
    '<div class="GLdiffTitle">GARDEN LINES</div>'+
    '<div class="GLdiffSub">Place tiles in lines of matching shape OR matching color. Six of either direction is a Qwirkle and doubles the score.</div>'+
    '<div class="GLdiffBtns">'+
      '<button class="GLdiffBtn" data-diff="easy"><div class="GLdlv">EASY MIRROR</div><div class="GLdsub">Greedy one-tile plays. Good for learning.</div></button>'+
      '<button class="GLdiffBtn" data-diff="medium"><div class="GLdlv">STEADY MIRROR</div><div class="GLdsub">Two-tile combinations. A fair match.</div></button>'+
      '<button class="GLdiffBtn" data-diff="hard"><div class="GLdlv">KEEN MIRROR</div><div class="GLdsub">Full-hand search. Ruthless.</div></button>'+
    '</div>';
  host.appendChild(diffOverlay);
  diffOverlay.addEventListener('click', function(e){
    var btn=e.target.closest('[data-diff]');
    if(!btn)return;
    var d=btn.getAttribute('data-diff');
    diffOverlay.remove(); diffOverlay=null;
    startGame(d, host);
  });
}

function updateHUD(){
  if(scoreEls.you) scoreEls.you.textContent=S.pScore;
  if(scoreEls.ai)  scoreEls.ai.textContent=S.aScore;
  if(scoreEls.bag) scoreEls.bag.textContent=S.bag.length;
  if(scoreEls.turn){
    var turnText = (S.turn==='player') ? 'YOUR TURN' : 'MIRROR THINKING';
    scoreEls.turn.textContent = turnText;
    scoreEls.turn.className = 'GLturn ' + (S.turn==='player' ? 'active' : 'ai');
  }
  if(scoreEls.diff){
    var map={easy:'EASY',medium:'STEADY',hard:'KEEN'};
    scoreEls.diff.textContent=map[S.difficulty]||'EASY';
  }
}

function updateBoard(){
  if(!boardGrid)return;
  var pad=2;
  var minR=S.bMin.r-pad, maxR=S.bMax.r+pad;
  var minC=S.bMin.c-pad, maxC=S.bMax.c+pad;
  if(Object.keys(S.board).length===0){minR=-2;maxR=2;minC=-2;maxC=2;}
  var cols=maxC-minC+1;
  boardGrid.style.gridTemplateColumns='repeat('+cols+',44px)';

  // Precompute valid spots + score delta for current selection
  var showPreview = (S.mode==='play') && S.turn==='player' && S.selIdx>=0 && S.pHand[S.selIdx];
  var selTile = showPreview ? S.pHand[S.selIdx] : null;

  var html='';
  for(var r=minR;r<=maxR;r++){
    for(var c=minC;c<=maxC;c++){
      var t=get(r,c);
      if(t){
        var justCls='';
        var placedEntry=null;
        for(var pi=0;pi<S.placed.length;pi++){
          if(S.placed[pi].r===r && S.placed[pi].c===c){ placedEntry=S.placed[pi]; break; }
        }
        if(placedEntry){ justCls=placedEntry.justPlaced?' just tentative':' tentative'; }
        html += '<div class="GLtile'+justCls+'" style="background:'+COLORS[t.color]+'">'+SHAPES[t.shape]+'</div>';
      } else {
        var cls='GLempty inbounds';
        var preview='';
        if(showPreview){
          var delta=scoreDelta(r,c,selTile);
          if(delta!==null){
            cls='GLempty valid';
            var qwKey = isAboutToQwirkle(r,c,selTile);
            preview='<span class="GLprev'+(qwKey?' qwirkle':'')+'">+'+delta+(qwKey?' Q':'')+'</span>';
          }
        }
        html += '<div class="'+cls+'" data-r="'+r+'" data-c="'+c+'">'+preview+'</div>';
      }
    }
  }
  boardGrid.innerHTML=html;
}

// Check if placing tile at (r,c) would complete any 6-long line
function isAboutToQwirkle(r,c,tile){
  put(r,c,tile);
  var h=getFullLine(r,c,0,1), v=getFullLine(r,c,1,0);
  del(r,c);
  return h.length===6 || v.length===6;
}

function updateHand(){
  if(!handGrid)return;
  if(S.mode==='swap'){
    handLbl.className='GLhandLbl swap';
    handLbl.textContent='SWAP MODE · tap tiles to mark, then CONFIRM';
  } else {
    handLbl.className='GLhandLbl';
    handLbl.textContent=S.turn==='player'?'YOUR HAND · tap a tile, then tap the board':'HAND';
  }
  var html='';
  for(var i=0;i<S.pHand.length;i++){
    var t=S.pHand[i];
    if(!t)continue;
    var cls='GLhandTile';
    if(S.mode==='swap' && S.swapMark[i]) cls+=' marked';
    else if(S.selIdx===i) cls+=' sel';
    html += '<div class="'+cls+'" data-slot="'+i+'" style="background:'+COLORS[t.color]+'">'+SHAPES[t.shape]+'</div>';
  }
  handGrid.innerHTML=html;
}

function updateControls(){
  if(!ctrlRow)return;
  ctrlRow.innerHTML='';
  if(S.phase!=='play'||S.turn!=='player')return;
  if(S.mode==='swap'){
    var markedCount=Object.keys(S.swapMark).length;
    ctrlRow.appendChild(makeBtn('CONFIRM SWAP '+(markedCount?'('+markedCount+')':''), 'primary', confirmSwap, markedCount===0));
    ctrlRow.appendChild(makeBtn('CANCEL', 'danger', cancelSwap));
    return;
  }
  if(S.placed.length>0){
    // Show turn score preview
    var turnPts=scoreTurn().pts;
    ctrlRow.appendChild(makeBtn('END TURN +'+turnPts, 'primary', endTurn));
    ctrlRow.appendChild(makeBtn('↩ UNDO', 'default', undoLastPlacement));
  } else {
    // With an empty bag SWAP is impossible — without PASS, a player holding
    // only unplayable tiles was softlocked (game over needs an empty hand).
    if(S.bag.length===0)ctrlRow.appendChild(makeBtn('PASS', 'default', playerPass));
    else ctrlRow.appendChild(makeBtn('SWAP TILES', 'default', enterSwapMode));
    ctrlRow.appendChild(makeBtn('↻ NEW', 'default', function(){ requestNewGame(); }));
  }
}

function playerPass(){
  if(S.phase!=='play'||S.turn!=='player')return;
  if(S.bag.length>0){sm('Bag still has tiles — play or swap');return;}
  if(S.placed.length>0){sm('Finish or undo placements first');return;}
  S.passCount=(S.passCount||0)+1;
  sm('Passed');
  if(S.passCount>=2){S.phase='gameover';updateAll();setTimeout(showEnd,500);return;}
  S.turn='ai';S.selIdx=-1;updateAll();
  setTimeout(aiTurn,700);
}

function makeBtn(label, style, onClick, disabled){
  var b=document.createElement('button'); b.className='GLbtn';
  if(style==='primary')b.className+=' primary';
  else if(style==='danger')b.className+=' danger';
  else if(style==='gold')b.className+=' gold';
  b.textContent=label;
  if(disabled)b.disabled=true;
  b.addEventListener('click', function(e){ e.preventDefault(); onClick(); });
  return b;
}

function updateAll(){
  updateHUD(); updateBoard(); updateHand(); updateControls();
}

// ── Qwirkle splash + breakdown popup ────────────────────────────────────
function showQwirkleSplash(text){
  if(!qwirkleEl)return;
  qwirkleEl.style.display='block';
  qwirkleEl.textContent=text;
  qwirkleEl.style.animation='none'; void qwirkleEl.offsetWidth;
  qwirkleEl.style.animation='glQwirkleSplash 1.6s cubic-bezier(.2,1.2,.3,1) both';
  setTimeout(function(){ if(qwirkleEl)qwirkleEl.style.display='none'; }, 1700);
}

function showBreakdown(lines, total){
  if(breakdownEl){ breakdownEl.remove(); breakdownEl=null; }
  if(!lines || lines.length===0)return;
  breakdownEl=document.createElement('div'); breakdownEl.id='GLbreak';
  var h='<div class="GLbreakTitle">SCORE</div>';
  lines.forEach(function(l){
    var dirLbl=(l.dir==='H')?'Row':(l.dir==='V')?'Column':'Seed';
    var qpill=l.qwirkle?'<span class="qpill">QWIRKLE</span>':'';
    h += '<div class="GLbreakLine"><span>'+dirLbl+' of '+l.length+'</span>'+qpill+'<span>+'+l.pts+'</span></div>';
  });
  h += '<div class="GLbreakTotal"><span>TOTAL</span><span>+'+total+'</span></div>';
  breakdownEl.innerHTML=h;
  document.body.appendChild(breakdownEl);
  setTimeout(function(){
    if(breakdownEl){
      breakdownEl.style.transition='opacity .4s ease,transform .4s ease';
      breakdownEl.style.opacity='0';
      breakdownEl.style.transform='translateX(-50%) translateY(6px)';
      setTimeout(function(){ if(breakdownEl){breakdownEl.remove();breakdownEl=null;} }, 420);
    }
  }, 2400);
}

// ── Game over ───────────────────────────────────────────────────────────
function showEnd(){
  var won=S.pScore>S.aScore;
  var tie=S.pScore===S.aScore;
  if(won){_e('game_win');_playWin();sm('Garden complete '+S.pScore+' to '+S.aScore);}
  else if(tie){sm('Tied '+S.pScore+' to '+S.aScore);}
  else{_e('game_loss');_play('lose');sm('Garden resting '+S.pScore+' to '+S.aScore);}
  _sr('gardenlines',{w:won,s:S.pScore});
  endEl=document.createElement('div');
  endEl.className='GLend '+(won?'win':'lose');
  endEl.innerHTML=
    '<div class="GLendTitle" style="color:'+(won?'#ffdc70':'#e8dcc8')+'">'+(won?'GARDEN COMPLETE':tie?'GARDEN MIRRORED':'GARDEN RESTING')+'</div>'+
    '<div class="GLendScores">YOU '+S.pScore+'  ·  MIRROR '+S.aScore+'</div>';
  var btn=makeBtn('↻ NEW GARDEN','primary',function(){ requestNewGame(); });
  endEl.appendChild(btn);
  pan.appendChild(endEl);
}

// ── Lifecycle ───────────────────────────────────────────────────────────
var hostEl=null;

function requestNewGame(){
  if(endEl){endEl.remove();endEl=null;}
  if(breakdownEl){breakdownEl.remove();breakdownEl=null;}
  // Clear pan and show picker again
  if(pan){pan.innerHTML='';}
  else { pan=document.createElement('div'); pan.id='GLpan'; hostEl.appendChild(pan); }
  showDifficultyPicker(pan);
}

function startGame(difficulty, host){
  _setDiff(difficulty);
  var bag=makeBag();
  S={
    bag:bag,
    board:{},
    bMin:{r:0,c:0}, bMax:{r:0,c:0},
    pHand:bag.splice(0,6),
    aHand:bag.splice(0,6),
    pScore:0, aScore:0,
    turn:'player', selIdx:-1,
    placed:[],
    phase:'play',
    mode:'play',
    swapMark:{},
    difficulty:difficulty
  };
  // Clear the picker's host and build game DOM
  if(pan){pan.innerHTML='';}
  buildDOM(host);
  updateAll();
}

window._gameFns = window._gameFns || {};
window._gameFns.gardenlines = function(a){
  // Teardown any stale DOM refs from a previous session
  pan=null; diffOverlay=null; scoreBar=null; boardWrap=null; boardGrid=null;
  handBox=null; handLbl=null; handGrid=null; ctrlRow=null;
  scoreEls={you:null,ai:null,bag:null,turn:null,diff:null};
  if(breakdownEl){breakdownEl.remove();breakdownEl=null;}
  if(endEl){endEl.remove();endEl=null;}
  hostEl=a;
  pan=document.createElement('div'); pan.id='GLpan'; a.appendChild(pan);
  showDifficultyPicker(pan);
};
})();
