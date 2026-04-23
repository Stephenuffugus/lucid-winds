// ═══ LUCID WINDS — Block Drop (premium Tetris rebuild) ═══
// Scope locked 2026-04-23: full SRS wall kicks, 500ms lock delay with reset,
// T-spin/B2B/combo scoring, line-clear freeze, DAS/ARR, visible hold +
// 5-piece preview, seasonal palette per level bracket, screen shake,
// swipe gestures. Mobile control layout: side-flanking move+rotate
// buttons, bottom action row with hard + hold-for-soft drop.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,_setDiff=G.setDiff,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

// ── Constants ────────────────────────────────────────────────────────────
var COLS=10, ROWS=20;
var LOCK_DELAY_MS=500;
var LOCK_MAX_RESETS=15;
var DAS_MS=170;  // time before auto-repeat kicks in
var ARR_MS=50;   // auto-repeat interval
var LINE_FREEZE_MS=280;
var SOFT_DROP_MULTIPLIER=20;  // soft-drop speed multiplier of gravity

// ── Tetromino shapes at rotation state 0 (spawn) ────────────────────────
// Each shape stored as a bounding-box grid. Rotation produces new grids
// (not rotated-around-center) to match SRS expectations.
var PIECES={
  I:{ shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color:'#7EC4D4', name:'I' },
  O:{ shape:[[1,1],[1,1]],                             color:'#E8C968', name:'O' },
  T:{ shape:[[0,1,0],[1,1,1],[0,0,0]],                 color:'#B785C2', name:'T' },
  S:{ shape:[[0,1,1],[1,1,0],[0,0,0]],                 color:'#8FC57A', name:'S' },
  Z:{ shape:[[1,1,0],[0,1,1],[0,0,0]],                 color:'#D78689', name:'Z' },
  J:{ shape:[[1,0,0],[1,1,1],[0,0,0]],                 color:'#7095C2', name:'J' },
  L:{ shape:[[0,0,1],[1,1,1],[0,0,0]],                 color:'#D48A5A', name:'L' }
};
var PIECE_KEYS=['I','O','T','S','Z','J','L'];

// ── SRS wall-kick tables — per (fromState → toState) ─────────────────────
// Offsets in our coord system where +y means DOWN. Standard SRS uses +y up,
// so all +y values here are flipped relative to the canonical spec.
// JLSTZ share one table; I has its own; O has no kicks (0,0 only).
var KICKS_JLSTZ={
  '0>1':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '1>0':[[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '1>2':[[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '2>1':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '2>3':[[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '3>2':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '3>0':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '0>3':[[0,0],[1,0],[1,-1],[0,2],[1,2]]
};
var KICKS_I={
  '0>1':[[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '1>0':[[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '1>2':[[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
  '2>1':[[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '2>3':[[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '3>2':[[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '3>0':[[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '0>3':[[0,0],[-1,0],[2,0],[-1,-2],[2,1]]
};

// ── Seasonal palette per 10-level bracket ────────────────────────────────
var SEASONS=[
  { name:'Spring', bg1:'#0d1410', bg2:'#1a2a1a', accent:'#E8A0BF', vignette:'rgba(232,160,191,0.08)' },
  { name:'Summer', bg1:'#0d1410', bg2:'#1a2218', accent:'#D4A843', vignette:'rgba(212,168,67,0.08)' },
  { name:'Autumn', bg1:'#0d100c', bg2:'#1a1410', accent:'#D4842A', vignette:'rgba(212,132,42,0.10)' },
  { name:'Winter', bg1:'#0d1014', bg2:'#151a20', accent:'#A0C4E8', vignette:'rgba(160,196,232,0.08)' }
];
function seasonForLevel(lv){ return SEASONS[Math.floor((lv-1)/10)%SEASONS.length]; }

// ── Styles ────────────────────────────────────────────────────────────────
(function injectStyle(){
  if(document.getElementById('pf-style'))return;
  var s=document.createElement('style');s.id='pf-style';
  s.textContent=[
    '@keyframes pfFade{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes pfSplash{0%{opacity:0;transform:translate(-50%,-35%) scale(0.7)}40%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}60%{transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-55%) scale(1)}}',
    '@keyframes pfComboPulse{0%,100%{transform:translate(-50%,0) scale(1)}50%{transform:translate(-50%,0) scale(1.12)}}',
    '@keyframes pfFlash{0%,100%{filter:brightness(1)}50%{filter:brightness(2.4) saturate(0.2)}}',
    '@keyframes pfShake{10%,90%{transform:translate(-1px,0)}20%,80%{transform:translate(2px,0)}30%,50%,70%{transform:translate(-3px,0)}40%,60%{transform:translate(3px,0)}}',
    // Container
    '#PFpan{max-width:min(100vw,520px);margin:0 auto;padding:6px;user-select:none;-webkit-user-select:none;box-sizing:border-box;position:relative;animation:pfFade .4s ease;font-family:Georgia,serif}',
    // Top HUD
    '.PFtopBar{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:4px 4px 6px}',
    '.PFtopItem{text-align:center}',
    '.PFtopLabel{font-family:Bebas Neue,sans-serif;font-size:0.58rem;letter-spacing:0.16em;color:rgba(232,220,200,0.55)}',
    '.PFtopValue{font-family:DM Mono,monospace;font-size:0.88rem;color:#c8a84b;font-weight:700;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    // Preview row (HOLD + NEXT)
    '.PFpreviewRow{display:flex;align-items:flex-end;gap:10px;padding:2px 2px 6px;justify-content:flex-start}',
    '.PFpvItem{display:flex;flex-direction:column}',
    '.PFpvLabel{font-family:Bebas Neue,sans-serif;font-size:0.6rem;letter-spacing:0.16em;color:rgba(232,220,200,0.55);margin-bottom:3px}',
    '.PFpvBox{background:rgba(13,16,12,0.55);border:1.5px solid rgba(122,179,86,0.22);border-radius:6px;padding:3px;display:inline-block}',
    '.PFpvBox canvas{display:block}',
    // Play zone
    '.PFplayzone{display:flex;gap:clamp(4px,1.2vw,8px);align-items:stretch;justify-content:center;padding:2px 0}',
    '.PFsideCtrl{flex:0 0 auto;width:56px;display:grid;grid-template-rows:1fr 2fr;gap:6px}',
    '.PFbigBtn{background:rgba(26,36,22,0.85);border:1.5px solid rgba(122,179,86,0.3);border-radius:12px;color:#e8dcc8;font-size:1.7rem;font-family:Georgia,serif;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .08s ease,background .12s ease;display:flex;align-items:center;justify-content:center;min-height:48px;padding:0;line-height:1}',
    '.PFbigBtn:active,.PFbigBtn.pressed{background:rgba(122,179,86,0.3);transform:scale(0.96)}',
    '.PFbigBtn.arrow{font-size:2.1rem}',
    '.PFboardWrap{position:relative;border-radius:8px;border:2px solid rgba(74,124,53,0.25);box-shadow:0 4px 16px rgba(0,0,0,0.45),inset 0 0 24px rgba(0,0,0,0.3);overflow:visible;background:#0d100c;flex:0 0 auto}',
    '.PFboardWrap.shake{animation:pfShake .25s ease-in-out}',
    '.PFboardWrap.flash canvas{animation:pfFlash .28s ease-in-out}',
    '.PFvignette{position:absolute;inset:0;pointer-events:none;border-radius:7px;box-shadow:inset 0 0 38px rgba(0,0,0,0.35)}',
    // Overlays
    '#PFsplash{position:absolute;top:38%;left:50%;transform:translate(-50%,-50%);pointer-events:none;text-align:center;font-family:Bebas Neue,sans-serif;color:#ffdc70;text-shadow:0 2px 10px rgba(0,0,0,0.9),0 0 18px rgba(255,220,112,0.6);letter-spacing:0.1em;z-index:3}',
    '.PFsplashBig{font-size:clamp(1.6rem,5vw,2.4rem);animation:pfSplash 1.1s cubic-bezier(.2,1.2,.3,1) both}',
    '.PFsplashSmall{font-size:clamp(0.9rem,2.4vw,1.15rem);color:#c8a84b;margin-top:4px;animation:pfSplash 1.1s cubic-bezier(.2,1.2,.3,1) 80ms both}',
    '#PFcombo{position:absolute;bottom:12%;left:50%;transform:translate(-50%,0);pointer-events:none;font-family:Bebas Neue,sans-serif;font-size:clamp(1.1rem,3vw,1.5rem);color:#f5ebd0;text-shadow:0 1px 6px rgba(0,0,0,0.9),0 0 12px rgba(122,179,86,0.6);letter-spacing:0.14em;animation:pfComboPulse .42s ease-in-out}',
    // Bottom action row
    '.PFactionRow{display:grid;grid-template-columns:1fr 1.8fr 1.3fr 1fr;gap:6px;padding:8px 2px 6px}',
    '.PFactBtn{min-height:54px;padding:0.35rem 0.2rem;font-family:Georgia,serif;border-radius:10px;background:rgba(26,31,23,0.75);border:1.5px solid rgba(220,180,120,0.3);color:#e8dcc8;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .08s ease,background .12s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}',
    '.PFactBtn:active,.PFactBtn.pressed{background:rgba(200,168,75,0.24);transform:scale(0.96)}',
    '.PFactBtn.gold{background:linear-gradient(180deg,rgba(200,168,75,0.28),rgba(160,130,50,0.32));border-color:#c8a84b;color:#ffdc70;font-weight:600}',
    '.PFactIcon{font-size:1.15rem;line-height:1}',
    '.PFactBtn.gold .PFactIcon{font-size:1.4rem}',
    '.PFactLabel{font-size:0.58rem;font-family:Bebas Neue,sans-serif;letter-spacing:0.14em}'
  ].join('');
  document.head.appendChild(s);
})();

// ── Persistence ─────────────────────────────────────────────────────────
function loadBest(){ try{return parseInt(localStorage.getItem('lw_petalfall_best')||'0',10)||0;}catch(e){return 0;} }
function saveBest(n){ try{localStorage.setItem('lw_petalfall_best',String(n));}catch(e){} }

// ── State ───────────────────────────────────────────────────────────────
var grid=[];                  // grid[r][c] = color string or null
var current=null;             // { key, rotation (0-3), shape, x, y }
var nextQueue=[];             // array of piece keys (always kept >= 5)
var bag=[];                   // current 7-bag
var holdKey=null, canHold=true;
var score=0, lines=0, level=1, best=0;
var combo=-1;                 // -1 means no active combo
var back2back=false;          // true if last scoring clear was Tetris or T-spin
var lastKickIdx=-1;           // which kick index produced the current orientation (for T-spin)
var lastMoveWasRotate=false;  // for T-spin detection
var lockTimer=0, lockResets=0, lockTouching=false;
var freezeTimer=0;            // >0 while line-clear freeze is active
var freezeRows=[];            // rows being cleared during freeze
var pfOver=false;
var dropTimer=0;
var dropInterval=1000;
var softDropping=false;
var lastTime=0;
var shakeUntil=0;
var splashFade=0;
var comboFade=0;
var particles=[];

// DOM refs
var pan=null, playzone=null, boardWrap=null, boardCanvas=null, boardCtx=null;
var holdBox=null, holdCanvas=null, holdCtx=null;
var nextBox=null, nextCanvas=null, nextCtx=null;
var scoreEl=null, linesEl=null, levelEl=null, bestEl=null;
var splashEl=null, splashBig=null, splashSmall=null, comboEl=null;
var CELL=24, dpr=1, SIDE_CELL=14;
var NEXT_SLOT_GAP=6;

// Input state
var keyHold={left:false,right:false,down:false};
var keyTimer={left:0,right:0,down:0};
var keyDas={left:false,right:false};
var touchPointer=null;  // { startX, startY, moved, downAt }

// ── Piece geometry helpers ──────────────────────────────────────────────
function cloneShape(s){ return s.map(function(r){return r.slice();}); }
function rotateCW(s){
  var n=s.length, m=s[0].length;
  var out=[]; for(var r=0;r<m;r++){ out.push([]); for(var c=0;c<n;c++) out[r].push(s[n-1-c][r]); }
  return out;
}
function shapeForRotation(key,rot){
  var s=cloneShape(PIECES[key].shape);
  for(var i=0;i<rot;i++) s=rotateCW(s);
  return s;
}
function collides(shape,px,py){
  for(var r=0;r<shape.length;r++){
    for(var c=0;c<shape[r].length;c++){
      if(!shape[r][c]) continue;
      var gx=px+c, gy=py+r;
      if(gx<0||gx>=COLS||gy>=ROWS) return true;
      if(gy>=0 && grid[gy][gx]) return true;
    }
  }
  return false;
}

// ── 7-bag randomizer + queue ────────────────────────────────────────────
function refillBag(){
  bag=PIECE_KEYS.slice();
  for(var i=bag.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var t=bag[i]; bag[i]=bag[j]; bag[j]=t;
  }
}
function popNext(){
  if(!bag.length) refillBag();
  return bag.pop();
}
function fillQueue(){
  while(nextQueue.length<5) nextQueue.push(popNext());
}
function nextPiece(){
  fillQueue();
  return nextQueue.shift();
}

// ── Spawn + lock ────────────────────────────────────────────────────────
function spawn(key){
  var shape=shapeForRotation(key,0);
  var x=Math.floor((COLS-shape[0].length)/2);
  current={ key:key, rotation:0, shape:shape, x:x, y:0 };
  canHold=true;
  lockTimer=0; lockResets=0; lockTouching=false;
  lastKickIdx=-1; lastMoveWasRotate=false;
  if(collides(shape,x,0)){
    gameOver();
  }
  fillQueue();
}

function lockPiece(){
  if(!current) return;
  var s=current.shape;
  var any=false, anyAbove=false;
  for(var r=0;r<s.length;r++){
    for(var c=0;c<s[r].length;c++){
      if(!s[r][c]) continue;
      var gy=current.y+r, gx=current.x+c;
      if(gy<0){ anyAbove=true; continue; }
      grid[gy][gx]=PIECES[current.key].color;
      any=true;
    }
  }
  if(anyAbove && !any){ gameOver(); return; }
  _play('tap');
  // T-spin detection BEFORE clearLines (we need to know before rows move)
  var tSpin=detectTSpin();
  var cleared=findClearedLines();
  if(cleared.length){
    beginFreeze(cleared, tSpin);
  } else {
    scoreAndAdvance(0, tSpin);
  }
}

function findClearedLines(){
  var out=[];
  for(var r=ROWS-1;r>=0;r--){
    var full=true;
    for(var c=0;c<COLS;c++){ if(!grid[r][c]){ full=false; break; } }
    if(full) out.push(r);
  }
  return out;
}

// ── T-Spin detection (3-corner test, simplified) ─────────────────────────
// Must have: (a) piece is T, (b) last successful move was a rotation,
// (c) 3+ of the 4 corners of the T's 3x3 bbox are filled.
function detectTSpin(){
  if(!current || current.key!=='T' || !lastMoveWasRotate) return 0;
  var cx=current.x, cy=current.y;
  // T shape is 3x3; corners at (0,0), (0,2), (2,0), (2,2) of local bbox
  var corners=[[0,0],[0,2],[2,0],[2,2]];
  var filled=0;
  for(var i=0;i<corners.length;i++){
    var gx=cx+corners[i][1], gy=cy+corners[i][0];
    if(gx<0||gx>=COLS||gy>=ROWS) { filled++; continue; } // wall counts
    if(grid[gy]&&grid[gy][gx]) filled++;
  }
  if(filled>=3) return 1; // 1 = t-spin (v1 doesn't distinguish mini)
  return 0;
}

// ── Line clear freeze (280ms flash before shatter) ──────────────────────
var pendingTSpin=0;
var pendingRows=[];
function beginFreeze(rows, tSpin){
  freezeTimer=LINE_FREEZE_MS;
  freezeRows=rows.slice();
  pendingRows=rows.slice();
  pendingTSpin=tSpin;
  boardWrap.classList.add('flash');
}
function endFreeze(){
  boardWrap.classList.remove('flash');
  // Spawn petal particles from each cleared cell for the shatter feel
  for(var i=0;i<pendingRows.length;i++){
    var ry=pendingRows[i];
    for(var c=0;c<COLS;c++){
      var col=grid[ry][c]||'#D4A843';
      for(var p=0;p<4;p++){
        particles.push({
          x:c*CELL+CELL/2,
          y:ry*CELL+CELL/2,
          vx:(Math.random()-0.5)*180,
          vy:-30-Math.random()*120,
          life:0.55+Math.random()*0.45,
          maxLife:0.9,
          size:2+Math.random()*3,
          rot:Math.random()*Math.PI*2,
          vr:(Math.random()-0.5)*10,
          color:col
        });
      }
    }
  }
  // Splice rows out, shift everything down
  for(var j=0;j<pendingRows.length;j++){
    grid.splice(pendingRows[j],1);
    grid.unshift(new Array(COLS).fill(null));
  }
  var clearCount=pendingRows.length;
  scoreAndAdvance(clearCount, pendingTSpin);
  pendingRows=[]; pendingTSpin=0; freezeRows=[];
}

// ── Scoring ─────────────────────────────────────────────────────────────
function scoreAndAdvance(clearCount, tSpin){
  var label='', sub='';
  var pts=0;
  var isDifficult=false; // Tetris or T-spin-with-clear — enables B2B
  if(tSpin && clearCount===0){
    // Empty T-spin (no clear) still scores
    pts=400*level; label='T-SPIN';
    isDifficult=true; // keeps B2B alive
  } else if(tSpin && clearCount>=1){
    var tpts=[0,800,1200,1600];
    pts=tpts[clearCount]*level;
    label='T-SPIN '+['','SINGLE','DOUBLE','TRIPLE'][clearCount];
    isDifficult=true;
  } else if(clearCount===1){
    pts=100*level; label='SINGLE';
  } else if(clearCount===2){
    pts=300*level; label='DOUBLE';
  } else if(clearCount===3){
    pts=500*level; label='TRIPLE';
  } else if(clearCount===4){
    pts=800*level; label='TETRIS';
    isDifficult=true;
  }
  // Back-to-back: 1.5× bonus if this is a difficult clear AND last was too
  if(isDifficult && back2back && clearCount>0){
    pts=Math.floor(pts*1.5);
    sub='BACK-TO-BACK';
  }
  // Combo: +50 × combo × level
  if(clearCount>0){
    combo++;
    if(combo>=1){
      pts+=50*combo*level;
      if(!sub && combo>=2) sub='COMBO '+combo;
      else if(sub && combo>=2) sub=sub+' , COMBO '+combo;
    }
  } else {
    combo=-1;
  }
  // Perfect clear detection
  var allClear=true;
  for(var r=0;r<ROWS && allClear;r++){
    for(var c=0;c<COLS;c++){ if(grid[r][c]){ allClear=false; break; } }
  }
  if(allClear && clearCount>0){
    pts+=[0,800,1200,1800,2000][clearCount]*level;
    label='PERFECT CLEAR '+label;
  }
  // Update B2B flag for next clear
  if(clearCount>0){
    back2back = isDifficult;
  }
  if(pts>0){
    score+=pts;
    if(label) showSplash(label, sub, isDifficult);
    _e('milestone');
    if(clearCount===4 || tSpin) _e('game_win'); // hash reward for big plays
    _play('snap');
  }
  lines+=clearCount;
  var nl=Math.floor(lines/10)+1;
  if(nl!==level){
    level=nl;
    dropInterval=Math.max(80, 1000-((level-1)*75));
    applySeason();
  }
  updHUD();
  spawnNext();
}

function spawnNext(){
  if(pfOver) return;
  var key=nextPiece();
  spawn(key);
}

// ── Splash text ─────────────────────────────────────────────────────────
function showSplash(big, small, premium){
  if(!splashEl) return;
  splashBig.textContent=big;
  splashSmall.textContent=small||'';
  splashBig.className='PFsplashBig';
  splashSmall.className='PFsplashSmall';
  // Reflow to restart animations
  void splashBig.offsetWidth;
  splashFade=1.1; // seconds
  if(combo>=2 && comboEl){
    comboEl.textContent='COMBO '+combo;
    comboEl.style.display='block';
    void comboEl.offsetWidth;
    comboEl.style.animation='none'; void comboEl.offsetWidth;
    comboEl.style.animation='pfComboPulse .42s ease-in-out';
    comboFade=0.6;
  }
}

function applySeason(){
  var s=seasonForLevel(level);
  if(boardWrap){
    boardWrap.style.background='linear-gradient(180deg,'+s.bg1+' 0%,'+s.bg2+' 100%)';
    boardWrap.style.borderColor=s.accent;
  }
}

// ── Movement / rotation ─────────────────────────────────────────────────
function tryMove(dx,dy){
  if(!current||pfOver||freezeTimer>0) return false;
  if(!collides(current.shape, current.x+dx, current.y+dy)){
    current.x+=dx; current.y+=dy;
    lastMoveWasRotate=false;
    if(dx!==0||dy!==0){
      if(lockTouching && lockResets<LOCK_MAX_RESETS){ lockTimer=0; lockResets++; }
    }
    return true;
  }
  return false;
}

function tryRotate(dir){
  if(!current||pfOver||freezeTimer>0) return false;
  if(current.key==='O') return false; // O-piece doesn't rotate
  var from=current.rotation;
  var to=(from+(dir>0?1:3))%4;
  var newShape=shapeForRotation(current.key, to);
  var table=(current.key==='I')?KICKS_I:KICKS_JLSTZ;
  var key=from+'>'+to;
  var kicks=table[key]||[[0,0]];
  for(var i=0;i<kicks.length;i++){
    var dx=kicks[i][0], dy=kicks[i][1];
    if(!collides(newShape, current.x+dx, current.y+dy)){
      current.shape=newShape;
      current.rotation=to;
      current.x+=dx;
      current.y+=dy;
      lastKickIdx=i;
      lastMoveWasRotate=true;
      if(lockTouching && lockResets<LOCK_MAX_RESETS){ lockTimer=0; lockResets++; }
      _play('tap');
      return true;
    }
  }
  return false;
}

function hardDrop(){
  if(!current||pfOver||freezeTimer>0) return;
  var dy=0;
  while(!collides(current.shape, current.x, current.y+dy+1)) dy++;
  current.y+=dy;
  score+=dy*2;
  _play('drop');
  triggerShake();
  lockPiece();
}

function softDropStep(){
  if(!current||pfOver||freezeTimer>0) return;
  if(!collides(current.shape, current.x, current.y+1)){
    current.y++;
    score+=1;
  }
  lastMoveWasRotate=false;
}

function setSoft(on){ softDropping = !!on; }

function hold(){
  if(!current||pfOver||freezeTimer>0||!canHold) return;
  canHold=false;
  if(holdKey===null){
    holdKey=current.key;
    spawnNext();
  } else {
    var tmp=holdKey; holdKey=current.key;
    spawn(tmp);
  }
  _play('tap');
  drawHold();
}

// ── Game loop ───────────────────────────────────────────────────────────
function tickGravity(dt){
  if(!current) return;
  if(freezeTimer>0){
    freezeTimer-=dt*1000;
    if(freezeTimer<=0){ freezeTimer=0; endFreeze(); }
    return;
  }
  var interval=softDropping ? Math.max(30, dropInterval/SOFT_DROP_MULTIPLIER) : dropInterval;
  dropTimer+=dt*1000;
  // Lock delay
  if(collides(current.shape, current.x, current.y+1)){
    if(!lockTouching){ lockTouching=true; lockTimer=0; }
    lockTimer+=dt*1000;
    if(lockTimer>=LOCK_DELAY_MS){
      lockPiece();
      return;
    }
  } else {
    lockTouching=false; lockTimer=0; lockResets=0;
    if(dropTimer>=interval){
      dropTimer=0;
      if(!collides(current.shape, current.x, current.y+1)) current.y++;
      if(softDropping) score+=1;
    }
  }
}

function tickInput(dt){
  // Keyboard DAS/ARR
  ['left','right'].forEach(function(side){
    if(keyHold[side]){
      keyTimer[side]+=dt*1000;
      if(!keyDas[side] && keyTimer[side]>=DAS_MS){
        keyDas[side]=true; keyTimer[side]=0;
      }
      if(keyDas[side] && keyTimer[side]>=ARR_MS){
        keyTimer[side]=0;
        tryMove(side==='left'?-1:1, 0);
      }
    }
  });
  if(keyHold.down){
    keyTimer.down+=dt*1000;
    if(keyTimer.down>=30){ keyTimer.down=0; softDropStep(); }
  }
}

function tickParticles(dt){
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=320*dt;
    p.rot+=p.vr*dt; p.life-=dt;
    if(p.life<=0) particles.splice(i,1);
  }
}

function gameLoop(ts){
  if(!pan||!boardCtx) return;
  if(pfOver){ render(); return; }
  var dt=lastTime? Math.min(0.05, (ts-lastTime)/1000) : 0.016;
  lastTime=ts;
  tickInput(dt);
  tickGravity(dt);
  tickParticles(dt);
  // Fade splash/combo
  if(splashFade>0){
    splashFade-=dt;
    if(splashFade<=0 && splashBig){ splashBig.textContent=''; splashSmall.textContent=''; }
  }
  if(comboFade>0){
    comboFade-=dt;
    if(comboFade<=0 && comboEl){ comboEl.style.display='none'; }
  }
  render();
  requestAnimationFrame(gameLoop);
}

// ── Rendering ───────────────────────────────────────────────────────────
function drawCell(ctx,x,y,sz,color,alpha){
  ctx.globalAlpha=alpha==null?1:alpha;
  ctx.fillStyle=color;
  ctx.fillRect(x+1,y+1,sz-2,sz-2);
  // Gloss highlight
  ctx.fillStyle='rgba(255,255,255,0.18)';
  ctx.fillRect(x+1,y+1,sz-2,2);
  ctx.fillRect(x+1,y+1,2,sz-2);
  // Shadow edge
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.fillRect(x+1,y+sz-3,sz-2,2);
  ctx.fillRect(x+sz-3,y+1,2,sz-2);
  ctx.globalAlpha=1;
}

function drawGhostCell(ctx,x,y,sz,color){
  ctx.strokeStyle=color;
  ctx.lineWidth=1.5;
  ctx.setLineDash([4,3]);
  ctx.strokeRect(x+2, y+2, sz-4, sz-4);
  ctx.setLineDash([]);
}

function render(){
  if(!boardCtx) return;
  var w=COLS*CELL, h=ROWS*CELL;
  // Background
  var s=seasonForLevel(level);
  var g=boardCtx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,s.bg1); g.addColorStop(1,s.bg2);
  boardCtx.fillStyle=g;
  boardCtx.fillRect(0,0,w,h);
  // Subtle grid
  boardCtx.strokeStyle='rgba(74,124,53,0.06)'; boardCtx.lineWidth=0.5;
  for(var r=1;r<ROWS;r++){ boardCtx.beginPath(); boardCtx.moveTo(0,r*CELL); boardCtx.lineTo(w,r*CELL); boardCtx.stroke(); }
  for(var c=1;c<COLS;c++){ boardCtx.beginPath(); boardCtx.moveTo(c*CELL,0); boardCtx.lineTo(c*CELL,h); boardCtx.stroke(); }
  // Locked cells
  for(r=0;r<ROWS;r++){
    var isFreeze=freezeTimer>0 && freezeRows.indexOf(r)>=0;
    for(c=0;c<COLS;c++){
      if(grid[r][c]){
        if(isFreeze){
          // Flash: alternate between white and piece color during freeze
          var t=freezeTimer;
          var white=(Math.floor(t/55))%2===0;
          drawCell(boardCtx, c*CELL, r*CELL, CELL, white?'#fff8e8':grid[r][c]);
        } else {
          drawCell(boardCtx, c*CELL, r*CELL, CELL, grid[r][c]);
        }
      }
    }
  }
  // Ghost + current piece
  if(current && !pfOver && freezeTimer<=0){
    var gy=current.y;
    while(!collides(current.shape, current.x, gy+1)) gy++;
    if(gy!==current.y){
      for(r=0;r<current.shape.length;r++){
        for(c=0;c<current.shape[r].length;c++){
          if(current.shape[r][c]){
            drawGhostCell(boardCtx, (current.x+c)*CELL, (gy+r)*CELL, CELL, PIECES[current.key].color);
          }
        }
      }
    }
    for(r=0;r<current.shape.length;r++){
      for(c=0;c<current.shape[r].length;c++){
        if(current.shape[r][c]){
          var py=current.y+r;
          if(py>=0) drawCell(boardCtx, (current.x+c)*CELL, py*CELL, CELL, PIECES[current.key].color);
        }
      }
    }
  }
  // Petals / particles
  for(var i=0;i<particles.length;i++){
    var p=particles[i];
    var al=Math.max(0,p.life/p.maxLife);
    boardCtx.globalAlpha=al;
    boardCtx.fillStyle=p.color;
    boardCtx.save();
    boardCtx.translate(p.x,p.y);
    boardCtx.rotate(p.rot);
    // Petal = rounded rect
    boardCtx.beginPath();
    var sz=p.size*al;
    boardCtx.ellipse(0,0,sz*1.3,sz*0.6,0,0,Math.PI*2);
    boardCtx.fill();
    boardCtx.restore();
  }
  boardCtx.globalAlpha=1;
  drawNext();
}

function drawPreviewPiece(ctx, key, offsetX, offsetY, slotW, slotH, cellSize){
  if(!key) return;
  var shape=PIECES[key].shape;
  // Trim empty rows/cols for visual centering
  var minR=999,maxR=-1,minC=999,maxC=-1;
  for(var r=0;r<shape.length;r++)for(var c=0;c<shape[r].length;c++){
    if(shape[r][c]){ if(r<minR)minR=r; if(r>maxR)maxR=r; if(c<minC)minC=c; if(c>maxC)maxC=c; }
  }
  var w=(maxC-minC+1)*cellSize, h=(maxR-minR+1)*cellSize;
  var ox=offsetX+(slotW-w)/2, oy=offsetY+(slotH-h)/2;
  for(r=minR;r<=maxR;r++){
    for(c=minC;c<=maxC;c++){
      if(shape[r][c]){
        drawCell(ctx, ox+(c-minC)*cellSize, oy+(r-minR)*cellSize, cellSize, PIECES[key].color);
      }
    }
  }
}

function drawNext(){
  if(!nextCtx) return;
  var slotW=4*SIDE_CELL, slotH=2*SIDE_CELL, gap=NEXT_SLOT_GAP;
  var w=5*slotW+4*gap, h=slotH;
  nextCtx.clearRect(0,0,w,h);
  for(var i=0;i<Math.min(5,nextQueue.length);i++){
    var slotX=i*(slotW+gap);
    nextCtx.fillStyle='rgba(26,31,23,0.4)';
    nextCtx.fillRect(slotX, 0, slotW, slotH);
    drawPreviewPiece(nextCtx, nextQueue[i], slotX, 0, slotW, slotH, SIDE_CELL);
  }
}
function drawHold(){
  if(!holdCtx) return;
  var w=4*SIDE_CELL, h=2*SIDE_CELL;
  holdCtx.clearRect(0,0,w,h);
  holdCtx.fillStyle='rgba(26,31,23,0.4)';
  holdCtx.fillRect(0,0,w,h);
  if(holdKey) drawPreviewPiece(holdCtx, holdKey, 0, 0, w, h, SIDE_CELL);
}

// ── HUD ─────────────────────────────────────────────────────────────────
function updHUD(){
  if(scoreEl) scoreEl.textContent=score;
  if(linesEl) linesEl.textContent=lines;
  if(levelEl) levelEl.textContent=level;
  if(bestEl) bestEl.textContent=Math.max(best,score);
}

function triggerShake(){
  if(!boardWrap) return;
  boardWrap.classList.remove('shake'); void boardWrap.offsetWidth;
  boardWrap.classList.add('shake');
}

// ── Game over ───────────────────────────────────────────────────────────
function gameOver(){
  if(pfOver) return;
  pfOver=true;
  if(score>best){ best=score; saveBest(best); }
  _e('game_loss');
  sm('Garden Full , '+score+' pts');
  _sr('petalfall',{w:false,s:score});
  showSplash('GARDEN FULL', score+' pts',false);
}

// ── Input wiring ────────────────────────────────────────────────────────
var cleanupFns=[];
function cleanupAll(){
  while(cleanupFns.length){ try{cleanupFns.pop()();}catch(e){} }
}

var kbHandler=null;
function bindKeyboard(){
  kbHandler=function(e){
    if(window._a!=='petalfall') return;
    var handled=true;
    switch(e.key){
      case 'ArrowLeft':  if(!e.repeat){ keyHold.left=true; keyTimer.left=0; keyDas.left=false; tryMove(-1,0); } break;
      case 'ArrowRight': if(!e.repeat){ keyHold.right=true; keyTimer.right=0; keyDas.right=false; tryMove(1,0); } break;
      case 'ArrowDown':  if(!e.repeat){ keyHold.down=true; keyTimer.down=0; softDropping=true; softDropStep(); } break;
      case 'ArrowUp':
      case 'x':
      case 'X':          if(!e.repeat) tryRotate(1); break;
      case 'z':
      case 'Z':
      case 'Control':    if(!e.repeat) tryRotate(-1); break;
      case ' ':          if(!e.repeat) hardDrop(); break;
      case 'c':
      case 'C':
      case 'Shift':      if(!e.repeat) hold(); break;
      default: handled=false;
    }
    if(handled) e.preventDefault();
  };
  var kuHandler=function(e){
    if(e.key==='ArrowLeft'){ keyHold.left=false; keyDas.left=false; }
    if(e.key==='ArrowRight'){ keyHold.right=false; keyDas.right=false; }
    if(e.key==='ArrowDown'){ keyHold.down=false; softDropping=false; }
  };
  document.addEventListener('keydown', kbHandler);
  document.addEventListener('keyup', kuHandler);
  cleanupFns.push(function(){
    document.removeEventListener('keydown', kbHandler);
    document.removeEventListener('keyup', kuHandler);
  });
}

// Touch swipe gestures layered on the board — tap=rotate, swipe=move, flick-up=hard drop.
function bindBoardTouch(){
  var SWIPE_CELL_PX=24;    // px per column-shift during drag
  var HARD_FLICK_PX=80;    // upward distance to trigger hard drop
  var HARD_FLICK_MS=250;   // max duration
  var TAP_MAX_PX=10;       // tap movement cap
  var moved=0, lastXCell=0, lastYCell=0, softOn=false;
  function onStart(e){
    var t=e.touches?e.touches[0]:e;
    touchPointer={ startX:t.clientX, startY:t.clientY, downAt:Date.now() };
    moved=0; lastXCell=0; lastYCell=0; softOn=false;
    if(e.touches) e.preventDefault();
  }
  function onMove(e){
    if(!touchPointer) return;
    var t=e.touches?e.touches[0]:e;
    var dx=t.clientX-touchPointer.startX, dy=t.clientY-touchPointer.startY;
    var cellDx=Math.round(dx/SWIPE_CELL_PX), cellDy=Math.round(dy/SWIPE_CELL_PX);
    while(cellDx>lastXCell){ tryMove(1,0); lastXCell++; moved++; }
    while(cellDx<lastXCell){ tryMove(-1,0); lastXCell--; moved++; }
    if(cellDy>lastYCell+1 && !softOn){ softOn=true; softDropping=true; }
    if(e.touches) e.preventDefault();
  }
  function onEnd(e){
    if(!touchPointer) return;
    var t=(e.changedTouches&&e.changedTouches[0]) || e;
    var dx=t.clientX-touchPointer.startX, dy=t.clientY-touchPointer.startY;
    var dur=Date.now()-touchPointer.downAt;
    if(softOn){ softDropping=false; }
    if(Math.abs(dx)<TAP_MAX_PX && Math.abs(dy)<TAP_MAX_PX && dur<400){
      tryRotate(1);
    } else if(dy<-HARD_FLICK_PX && dur<HARD_FLICK_MS){
      hardDrop();
    }
    touchPointer=null;
  }
  boardCanvas.addEventListener('touchstart', onStart, {passive:false});
  boardCanvas.addEventListener('touchmove', onMove, {passive:false});
  boardCanvas.addEventListener('touchend', onEnd);
  boardCanvas.addEventListener('touchcancel', onEnd);
  cleanupFns.push(function(){
    boardCanvas.removeEventListener('touchstart', onStart);
    boardCanvas.removeEventListener('touchmove', onMove);
    boardCanvas.removeEventListener('touchend', onEnd);
    boardCanvas.removeEventListener('touchcancel', onEnd);
  });
}

// Side-button wiring: tap fires once, hold does DAS/ARR for move arrows,
// rotate buttons fire once per tap (no auto-repeat).
function wireSideButton(btn){
  var act = btn.getAttribute('data-act');
  var holdTimer=null, interval=null, started=false;
  function fire(){
    if(act==='left') tryMove(-1,0);
    else if(act==='right') tryMove(1,0);
    else if(act==='rotCW') tryRotate(1);
    else if(act==='rotCCW') tryRotate(-1);
  }
  function start(e){
    if(e && e.preventDefault) e.preventDefault();
    if(started) return;
    started=true;
    btn.classList.add('pressed');
    fire();
    if(act==='left'||act==='right'){
      holdTimer=setTimeout(function(){
        interval=setInterval(fire, ARR_MS);
      }, DAS_MS);
    }
  }
  function end(){
    started=false;
    btn.classList.remove('pressed');
    if(holdTimer){ clearTimeout(holdTimer); holdTimer=null; }
    if(interval){ clearInterval(interval); interval=null; }
  }
  btn.addEventListener('touchstart', start, {passive:false});
  btn.addEventListener('touchend', function(e){ if(e && e.preventDefault) e.preventDefault(); end(); }, {passive:false});
  btn.addEventListener('touchcancel', end);
  btn.addEventListener('mousedown', start);
  btn.addEventListener('mouseup', end);
  btn.addEventListener('mouseleave', end);
  cleanupFns.push(end);
}

// Action button wiring — HOLD / HARD DROP / SOFT DROP (hold-to-drop) / NEW GAME
function wireActionButton(btn){
  var act = btn.getAttribute('data-act');
  if(act==='soft'){
    // Press-and-hold for rapid descent
    var softEnd = function(e){ if(e && e.preventDefault) e.preventDefault(); btn.classList.remove('pressed'); setSoft(false); };
    var softStart = function(e){ if(e && e.preventDefault) e.preventDefault(); btn.classList.add('pressed'); setSoft(true); };
    btn.addEventListener('touchstart', softStart, {passive:false});
    btn.addEventListener('touchend', softEnd, {passive:false});
    btn.addEventListener('touchcancel', softEnd);
    btn.addEventListener('mousedown', softStart);
    btn.addEventListener('mouseup', softEnd);
    btn.addEventListener('mouseleave', softEnd);
    cleanupFns.push(softEnd);
    return;
  }
  // Single-tap buttons
  var fire = function(e){
    if(e && e.preventDefault) e.preventDefault();
    if(act==='hold') hold();
    else if(act==='hard') hardDrop();
    else if(act==='newgame') newGame();
  };
  btn.addEventListener('click', fire);
}

// ── DOM build ───────────────────────────────────────────────────────────
function buildLayout(a){
  pan=document.createElement('div'); pan.id='PFpan'; a.appendChild(pan);
  // Top HUD bar
  var top=document.createElement('div'); top.className='PFtopBar'; pan.appendChild(top);
  top.innerHTML=
    '<div class="PFtopItem"><div class="PFtopLabel">SCORE</div><div class="PFtopValue" id="PFscore">0</div></div>'+
    '<div class="PFtopItem"><div class="PFtopLabel">LEVEL</div><div class="PFtopValue" id="PFlevel">1</div></div>'+
    '<div class="PFtopItem"><div class="PFtopLabel">LINES</div><div class="PFtopValue" id="PFlines">0</div></div>'+
    '<div class="PFtopItem"><div class="PFtopLabel">BEST</div><div class="PFtopValue" id="PFbest">0</div></div>';
  scoreEl=top.querySelector('#PFscore');
  levelEl=top.querySelector('#PFlevel');
  linesEl=top.querySelector('#PFlines');
  bestEl=top.querySelector('#PFbest');

  // Preview row — HOLD then NEXT strip
  var prow=document.createElement('div'); prow.className='PFpreviewRow'; pan.appendChild(prow);
  var holdItem=document.createElement('div'); holdItem.className='PFpvItem'; prow.appendChild(holdItem);
  var holdLbl=document.createElement('div'); holdLbl.className='PFpvLabel'; holdLbl.textContent='HOLD'; holdItem.appendChild(holdLbl);
  holdBox=document.createElement('div'); holdBox.className='PFpvBox'; holdItem.appendChild(holdBox);
  holdCanvas=document.createElement('canvas'); holdBox.appendChild(holdCanvas);
  holdCtx=holdCanvas.getContext('2d');

  var nextItem=document.createElement('div'); nextItem.className='PFpvItem'; prow.appendChild(nextItem);
  var nextLbl=document.createElement('div'); nextLbl.className='PFpvLabel'; nextLbl.textContent='NEXT'; nextItem.appendChild(nextLbl);
  nextBox=document.createElement('div'); nextBox.className='PFpvBox'; nextItem.appendChild(nextBox);
  nextCanvas=document.createElement('canvas'); nextBox.appendChild(nextCanvas);
  nextCtx=nextCanvas.getContext('2d');

  // Play zone — left controls | board | right controls
  playzone=document.createElement('div'); playzone.className='PFplayzone'; pan.appendChild(playzone);
  var sideL=document.createElement('div'); sideL.className='PFsideCtrl PFsideLeft'; playzone.appendChild(sideL);
  sideL.innerHTML=
    '<button class="PFbigBtn rot" data-act="rotCCW" aria-label="Rotate left">↺</button>'+
    '<button class="PFbigBtn arrow" data-act="left" aria-label="Move left">←</button>';

  boardWrap=document.createElement('div'); boardWrap.className='PFboardWrap'; playzone.appendChild(boardWrap);
  boardCanvas=document.createElement('canvas'); boardCanvas.style.cssText='display:block;position:relative;z-index:1;touch-action:none'; boardWrap.appendChild(boardCanvas);
  boardCtx=boardCanvas.getContext('2d');
  var vig=document.createElement('div'); vig.className='PFvignette'; boardWrap.appendChild(vig);
  splashEl=document.createElement('div'); splashEl.id='PFsplash'; boardWrap.appendChild(splashEl);
  splashBig=document.createElement('div'); splashBig.className='PFsplashBig'; splashEl.appendChild(splashBig);
  splashSmall=document.createElement('div'); splashSmall.className='PFsplashSmall'; splashEl.appendChild(splashSmall);
  comboEl=document.createElement('div'); comboEl.id='PFcombo'; comboEl.style.display='none'; boardWrap.appendChild(comboEl);

  var sideR=document.createElement('div'); sideR.className='PFsideCtrl PFsideRight'; playzone.appendChild(sideR);
  sideR.innerHTML=
    '<button class="PFbigBtn rot" data-act="rotCW" aria-label="Rotate right">↻</button>'+
    '<button class="PFbigBtn arrow" data-act="right" aria-label="Move right">→</button>';

  // Bottom action row
  var actRow=document.createElement('div'); actRow.className='PFactionRow'; pan.appendChild(actRow);
  actRow.innerHTML=
    '<button class="PFactBtn" data-act="hold"><span class="PFactIcon">⧉</span><span class="PFactLabel">HOLD</span></button>'+
    '<button class="PFactBtn gold" data-act="hard"><span class="PFactIcon">⏬</span><span class="PFactLabel">DROP</span></button>'+
    '<button class="PFactBtn" data-act="soft"><span class="PFactIcon">↓</span><span class="PFactLabel">FAST</span></button>'+
    '<button class="PFactBtn" data-act="newgame"><span class="PFactIcon">↻</span><span class="PFactLabel">NEW</span></button>';

  // Wire side buttons (DAS/ARR for arrows, single-tap for rotates)
  var sideBtns=playzone.querySelectorAll('.PFbigBtn');
  for(var i=0;i<sideBtns.length;i++) wireSideButton(sideBtns[i]);
  // Wire action buttons
  var actBtns=actRow.querySelectorAll('.PFactBtn');
  for(var j=0;j<actBtns.length;j++) wireActionButton(actBtns[j]);
}

function sizeCanvases(){
  dpr=window.devicePixelRatio||1;
  // Available width = pan width minus 2 side columns (56px each) minus gaps + padding
  var panW=Math.min(window.innerWidth, 520) - 12;
  var sideTotal=56*2 + 16; // 2 cols + 2 gaps of ~8px
  var availW=Math.max(200, panW - sideTotal);
  // Available height = viewport minus topBar (~42) + preview (~66) + actionRow (~64) + margins (~80)
  var availH=Math.max(320, window.innerHeight - 260);
  CELL=Math.floor(Math.min(availW/COLS, availH/ROWS));
  CELL=Math.max(18, Math.min(CELL, 32));
  boardCanvas.width=COLS*CELL*dpr; boardCanvas.height=ROWS*CELL*dpr;
  boardCanvas.style.width=(COLS*CELL)+'px'; boardCanvas.style.height=(ROWS*CELL)+'px';
  boardCtx.setTransform(dpr,0,0,dpr,0,0);

  // Side columns match board height so arrow + rotate fill the side
  var sideH=ROWS*CELL;
  var sides=playzone.querySelectorAll('.PFsideCtrl');
  for(var si=0;si<sides.length;si++) sides[si].style.height=sideH+'px';

  // Preview cell size — scale with CELL but cap for legibility
  SIDE_CELL=Math.max(12, Math.min(16, Math.floor(CELL*0.5)));
  // Hold canvas: 4 cols × 2 rows
  holdCanvas.width=4*SIDE_CELL*dpr; holdCanvas.height=2*SIDE_CELL*dpr;
  holdCanvas.style.width=(4*SIDE_CELL)+'px'; holdCanvas.style.height=(2*SIDE_CELL)+'px';
  holdCtx.setTransform(dpr,0,0,dpr,0,0);
  // Next canvas: 5 slots × 4 cols + 4 gaps
  var nw=5*(4*SIDE_CELL)+4*NEXT_SLOT_GAP;
  var nh=2*SIDE_CELL;
  nextCanvas.width=nw*dpr; nextCanvas.height=nh*dpr;
  nextCanvas.style.width=nw+'px'; nextCanvas.style.height=nh+'px';
  nextCtx.setTransform(dpr,0,0,dpr,0,0);
}

// ── Lifecycle ───────────────────────────────────────────────────────────
function initGrid(){
  grid=[];
  for(var r=0;r<ROWS;r++){ grid[r]=[]; for(var c=0;c<COLS;c++) grid[r][c]=null; }
}

function newGame(){
  cleanupAll();
  initGrid();
  score=0; lines=0; level=1; dropInterval=1000; dropTimer=0;
  pfOver=false; holdKey=null; canHold=true; particles=[];
  nextQueue=[]; bag=[]; fillQueue();
  combo=-1; back2back=false;
  softDropping=false;
  best=loadBest();
  lastTime=0;
  sizeCanvases();
  applySeason();
  spawn(nextPiece());
  updHUD();
  drawHold(); drawNext();
  bindKeyboard();
  bindBoardTouch();
  _setDiff('medium');
  requestAnimationFrame(gameLoop);
}

function GPF(a){
  ms(a,'Block Drop'); mm(a);
  buildLayout(a);
  mc(a);
  newGame();
}

window._gameFns=window._gameFns||{};
window._gameFns.petalfall=GPF;
})();
