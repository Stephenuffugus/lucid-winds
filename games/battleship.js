// ═══ LUCID WINDS — Tide Hunt (Battleship 2.0) ═══
// 10x10 board, classic fleet [5,4,3,3,2]: Great Oak, Vine, Branch, Root, Seed
// 4 difficulty tiers: Sprout (random+hunt), Tide (+parity),
//                     Storm (PDF), Kraken (PDF + pattern memory)
// Specials (1 per game, both sides):
//   - Radar Ping: 3x3 scan, reveals count
//   - Tide Strike: plus-pattern 5-cell hit
// Salvo Mode toggle: fire one shot per alive ship per turn
// End-game stats, sink reveal, banners, coord labels.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt;

// ── Inject CSS once (animations, splashes, banners, radar rings) ──
if(!document.getElementById('th-kf')){
  var _kf=document.createElement('style');
  _kf.id='th-kf';
  _kf.textContent=[
    '@keyframes thSplash{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes thBurst{0%{transform:scale(0.2);opacity:0}45%{transform:scale(1.25);opacity:1}100%{transform:scale(1);opacity:0.95}}',
    '@keyframes thBanner{0%{opacity:0;transform:translate(-50%,-50%) scale(0.6)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}75%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.25)}}',
    '@keyframes thSinkReveal{0%{opacity:0;filter:blur(4px)}100%{opacity:0.85;filter:blur(0)}}',
    '@keyframes thRipple{0%{transform:scale(0.3);opacity:0.85}100%{transform:scale(2.4);opacity:0}}',
    '@keyframes thRadarSweep{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
    '@keyframes thAimPulse{0%,100%{box-shadow:0 0 0 3px rgba(200,168,75,0.85),0 0 14px rgba(200,168,75,0.55)}50%{box-shadow:0 0 0 3px rgba(200,168,75,1),0 0 22px rgba(200,168,75,0.9)}}',
    '@keyframes thTurnRing{0%,100%{box-shadow:inset 0 0 0 2px rgba(122,179,86,0.45)}50%{box-shadow:inset 0 0 0 2px rgba(122,179,86,0.95)}}',
    '.th-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;position:relative;cursor:default;transition:background 0.15s,transform 0.1s;user-select:none;-webkit-tap-highlight-color:transparent}',
    '.th-cell.clickable{cursor:pointer}',
    '.th-cell.clickable:hover{background:rgba(122,179,86,0.18)}',
    '.th-cell.clickable:active{transform:scale(0.94)}',
    '.th-cell.water{background:rgba(18,26,22,0.78)}',
    '.th-cell.water-alt{background:rgba(32,44,38,0.9)}',
    '.th-cell.placed{background:rgba(74,124,53,0.5);box-shadow:inset 0 0 0 1px rgba(122,179,86,0.7);border-radius:3px}',
    '.th-cell.ghost-ok{background:rgba(122,179,86,0.45)!important;box-shadow:inset 0 0 0 2px rgba(200,168,75,0.8)}',
    '.th-cell.ghost-bad{background:rgba(199,80,80,0.45)!important;box-shadow:inset 0 0 0 2px rgba(199,80,80,0.9)}',
    '.th-cell.hit{background:rgba(199,80,80,0.28)}',
    '.th-cell.miss{background:rgba(40,50,38,0.6)}',
    '.th-cell.aim{animation:thAimPulse 0.9s ease-in-out infinite;z-index:2}',
    '.th-splash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:clamp(0.7rem,2.2vw,1.05rem);pointer-events:none;animation:thSplash 0.38s ease-out both}',
    '.th-burst{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:clamp(0.75rem,2.4vw,1.15rem);pointer-events:none;animation:thBurst 0.42s ease-out both}',
    '.th-ripple{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(122,179,86,0.7);pointer-events:none;animation:thRipple 0.7s ease-out both}',
    '.th-sink-ship{position:absolute;background:linear-gradient(135deg,rgba(40,60,38,0.9),rgba(20,30,22,0.95));border-radius:6px;box-shadow:inset 0 0 0 1px rgba(200,168,75,0.5),0 2px 8px rgba(0,0,0,0.45);pointer-events:none;z-index:3;animation:thSinkReveal 0.9s ease-out both;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;color:rgba(200,168,75,0.85);letter-spacing:0.1em;font-size:0.55rem;text-shadow:0 1px 2px rgba(0,0,0,0.8)}',
    '.th-banner{position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,rgba(40,60,38,0.96),rgba(26,40,24,0.96));border:2px solid rgba(200,168,75,0.85);box-shadow:0 0 32px rgba(200,168,75,0.45),0 8px 24px rgba(0,0,0,0.6);padding:14px 36px;border-radius:10px;font-family:Bebas Neue,sans-serif;font-size:1.4rem;letter-spacing:0.18em;color:var(--cream);z-index:9999;pointer-events:none;animation:thBanner 1.4s ease-out forwards;text-align:center;white-space:nowrap}',
    '.th-banner.win{border-color:rgba(122,179,86,0.95);box-shadow:0 0 36px rgba(122,179,86,0.55),0 8px 28px rgba(0,0,0,0.7);color:var(--sage)}',
    '.th-banner.loss{border-color:rgba(199,80,80,0.9);box-shadow:0 0 32px rgba(199,80,80,0.45),0 8px 24px rgba(0,0,0,0.7);color:#e8a8a8}',
    '.th-radar-overlay{position:absolute;pointer-events:none;z-index:4;border-radius:50%;background:radial-gradient(circle,rgba(200,168,75,0.18) 0%,rgba(200,168,75,0.08) 60%,transparent 85%);box-shadow:inset 0 0 0 2px rgba(200,168,75,0.65)}',
    '.th-radar-overlay::before{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,rgba(200,168,75,0.45) 0deg,transparent 120deg);animation:thRadarSweep 1.1s linear 2}',
    '.th-radar-count{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:Bebas Neue,sans-serif;font-size:1.6rem;color:var(--gold);text-shadow:0 0 6px rgba(0,0,0,0.9);letter-spacing:0.05em;z-index:5}',
    '.th-grid-wrap{display:grid;grid-template-columns:16px 1fr;grid-template-rows:16px 1fr;gap:2px;width:100%;position:relative}',
    '.th-coord-row{display:grid;grid-template-columns:16px repeat(10,1fr);gap:1px;align-items:center;font-family:DM Mono,monospace;font-size:0.7rem;color:rgba(232,220,200,0.78);letter-spacing:0.02em}',
    '.th-coord-col{display:grid;grid-template-rows:repeat(10,1fr);gap:1px;align-items:center;justify-items:center;font-family:DM Mono,monospace;font-size:0.7rem;color:rgba(232,220,200,0.78);letter-spacing:0.02em}',
    '.th-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:1px;background:rgba(74,124,53,0.08);border:1.5px solid rgba(74,124,53,0.18);border-radius:6px;overflow:hidden;position:relative}',
    '.th-grid.turn-active{animation:thTurnRing 1.6s ease-in-out infinite}',
    '.th-ship-tray{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-bottom:6px}',
    '.th-ship-chip{background:rgba(122,179,86,0.18);border:1.5px solid rgba(122,179,86,0.5);border-radius:8px;padding:5px 5px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;flex:1 1 0;transition:transform 0.1s,background 0.12s,border-color 0.12s;-webkit-tap-highlight-color:transparent}',
    '.th-ship-chip.sel{background:rgba(200,168,75,0.28);border-color:var(--gold);transform:translateY(-1px)}',
    '.th-ship-chip.placed{background:rgba(74,124,53,0.12);border-color:rgba(74,124,53,0.4);opacity:0.65}',
    '.th-ship-chip.placed.sel{opacity:1;background:rgba(200,168,75,0.28);border-color:var(--gold)}',
    '.th-ship-chip:active{transform:scale(0.96)}',
    '.th-ship-dots{display:flex;gap:2px}',
    '.th-ship-dots.v{flex-direction:column}',
    '.th-ship-dot{width:10px;height:10px;background:rgba(122,179,86,0.75);border:1px solid rgba(122,179,86,0.95);border-radius:1px}',
    '.th-ship-chip.placed .th-ship-dot{background:rgba(74,124,53,0.5)}',
    '.th-diff-row{display:flex;gap:5px;justify-content:center;margin:4px 0 6px;flex-wrap:wrap}',
    '.th-diff-btn{background:rgba(18,26,20,0.65);border:1.5px solid rgba(200,168,75,0.75);border-radius:6px;padding:10px 14px;font-family:DM Mono,monospace;font-size:0.7rem;color:var(--cream);letter-spacing:0.06em;cursor:pointer;transition:all 0.12s;-webkit-tap-highlight-color:transparent;min-height:44px;display:inline-flex;align-items:center}',
    '.th-diff-btn.on{background:rgba(122,179,86,0.25);border-color:var(--sage);color:var(--cream)}',
    '.th-diff-btn:active{transform:scale(0.96)}',
    '.th-special-btn{background:rgba(26,36,28,0.8);border:1.5px solid rgba(200,168,75,0.75);color:var(--cream);font-family:Bebas Neue,sans-serif;letter-spacing:0.08em;font-size:0.68rem;padding:10px 14px;border-radius:6px;cursor:pointer;transition:all 0.12s;min-height:44px;-webkit-tap-highlight-color:transparent;display:inline-flex;align-items:center;justify-content:center}',
    '.th-special-btn:active{transform:scale(0.95)}',
    '.th-special-btn.armed{background:rgba(200,168,75,0.3);border-color:var(--gold);color:var(--cream);animation:thAimPulse 1.1s ease-in-out infinite}',
    '.th-special-btn.used{opacity:0.35;cursor:not-allowed}',
    '.th-stats{background:rgba(18,26,20,0.85);border:1px solid rgba(122,179,86,0.3);border-radius:8px;padding:14px;margin:8px auto;max-width:320px;font-family:DM Mono,monospace;font-size:0.72rem;color:var(--cream);line-height:1.7}',
    '.th-stats-row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dashed rgba(122,179,86,0.12)}',
    '.th-stats-row:last-child{border-bottom:none}',
    '.th-stats-row span:last-child{color:var(--gold);font-family:Bebas Neue,sans-serif;letter-spacing:0.08em}',
    '.th-hdr{font-family:Bebas Neue,sans-serif;letter-spacing:0.12em;text-align:center;margin:6px 0 4px}'
  ].join('');
  document.head.appendChild(_kf);
}

function GBS(a){
  // ── constants ──
  var SZ=10;
  var SHIPS=[5,4,3,3,2];
  var SHIP_NAMES=['Great Oak','Vine','Branch','Root','Seed'];
  var DIFFS=[
    {k:'sprout',n:'Sprout',d:'Random + hunt'},
    {k:'tide',n:'Tide',d:'+ Parity'},
    {k:'storm',n:'Storm',d:'Probability density'},
    {k:'kraken',n:'Kraken',d:'Deep pattern memory'}
  ];

  // ── settings persisted ──
  var confirmAttack=false;
  try{confirmAttack=localStorage.getItem('lw_bs_confirm')==='on';}catch(e){}
  var enemyZoom=1;
  try{enemyZoom=parseFloat(localStorage.getItem('lw_bs_zoom')||'1')||1;}catch(e){}
  var diff='tide';
  try{var _d=localStorage.getItem('lw_bs_diff');if(_d)diff=_d;}catch(e){}
  var salvoMode=false;
  try{salvoMode=localStorage.getItem('lw_bs_salvo')==='on';}catch(e){}
  var specialsEnabled=true;
  try{specialsEnabled=localStorage.getItem('lw_bs_specials')!=='off';}catch(e){}

  // ── state ──
  var pGrid,eGrid,phase,selShip,placements,shipDirs;
  var gameOver,turn;
  var aiHitStack,aiKnownHits;
  // sunk ship manifest: {id -> {r,c,dir,len,name}}
  var pSunk,eSunk;
  // specials
  var radarUsedP,strikeUsedP,radarUsedAI,strikeUsedAI;
  var armedSpecial=null; // 'radar' | 'strike' | null
  // salvo turn state
  var pShotsLeft,aiShotsLeft;
  // stats
  var stats;
  // drag-to-move state for placed ships during setup
  var _dragShip=-1,_dragOrigR=0,_dragOrigC=0,_dragOrigDir='h',_dragMoved=false;
  var _dragMoveHandler=null,_dragEndHandler=null;
  // pending shot (for confirm-attack)
  var pendingShot=-1;
  // pending aiTurn() timeout — tracked so an in-app exit mid-turn can
  // cancel it instead of letting it fire sounds/banners over the picker
  var aiTimeoutId=0;
  // confirm-attack is auto-suppressed during salvo (would be too many taps)
  function effConfirm(){return confirmAttack&&!salvoMode;}

  // ── DOM setup ──
  ms(a,'<span id="BSph">Place your fleet</span>');mm(a);
  var wrap=document.createElement('div');
  wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:8px;padding:4px;width:100%';
  a.appendChild(wrap);
  var lbl=document.createElement('div');
  lbl.id='BSlbl';
  lbl.style.cssText='font-family:DM Mono,monospace;font-size:0.72rem;color:var(--muted);text-align:center;min-height:1.4em;width:100%';
  wrap.appendChild(lbl);
  var grids=document.createElement('div');
  grids.id='BSgrids';
  grids.style.cssText='display:flex;flex-direction:column;align-items:center;gap:clamp(10px,3vw,18px);width:100%';
  wrap.appendChild(grids);

  function _bsSyncCfm(){var b=document.getElementById('BSconfirmBtn');if(b)b.textContent=confirmAttack?'✓ CONFIRM ON':'CONFIRM OFF';}

  // Top-bar controls
  mc(a).innerHTML='<button class="gb" id="BSdir" onclick="_BSR()" style="min-width:86px">↻ Rotate</button> '+
    '<button class="gb" id="BSauto" onclick="_BSAuto()" style="min-width:80px">🎲 Auto</button> '+
    '<button class="gb" id="BSready" onclick="_BSready()" style="min-width:104px;background:rgba(74,124,53,0.28);opacity:0.4" disabled>✓ I\'M READY</button> '+
    '<button class="gb" id="BSconfirmBtn" onclick="_BSToggleConfirm()" style="min-width:120px;font-size:0.7rem;letter-spacing:0.06em;">'+(confirmAttack?'✓ CONFIRM ON':'CONFIRM OFF')+'</button> '+
    '<button class="gb" id="BSzoomBtn" onclick="_BSToggleZoom()" style="min-width:80px;font-size:0.7rem;letter-spacing:0.06em;">'+(enemyZoom>1?'🔍 1.5×':'🔍 1×')+'</button> '+
    '<button class="gb" onclick="_BSN()">↻ New Game</button>';

  // Leaving mid-turn (in-app exit, not the standalone shell's full nav):
  // cancel the pending aiTurn() timeout so it can't fire sounds/banners/
  // _e()/_sr() over whatever the player switched to, and detach any
  // document-level drag listeners left over from a mid-drag exit.
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    gameOver=true;
    if(aiTimeoutId){clearTimeout(aiTimeoutId);aiTimeoutId=0;}
    if(_dragMoveHandler){
      document.removeEventListener('touchmove',_dragMoveHandler);
      document.removeEventListener('mousemove',_dragMoveHandler);
      _dragMoveHandler=null;
    }
    if(_dragEndHandler){
      document.removeEventListener('touchend',_dragEndHandler);
      document.removeEventListener('touchcancel',_dragEndHandler);
      document.removeEventListener('mouseup',_dragEndHandler);
      _dragEndHandler=null;
    }
    _dragShip=-1;
  });

  // ── helpers ──
  function mkGrid(){var a=[];for(var i=0;i<SZ*SZ;i++)a.push(0);return a;}
  function idx(r,c){return r*SZ+c;}
  function inb(r,c){return r>=0&&r<SZ&&c>=0&&c<SZ;}
  function canPlace(grid,r,c,len,dir){
    for(var k=0;k<len;k++){
      var cr=dir==='h'?r:r+k;
      var cc=dir==='h'?c+k:c;
      if(!inb(cr,cc)||grid[idx(cr,cc)]!==0)return false;
    }
    return true;
  }
  function placeShip(grid,r,c,len,dir,id){
    for(var k=0;k<len;k++){
      var cr=dir==='h'?r:r+k;
      var cc=dir==='h'?c+k:c;
      grid[idx(cr,cc)]=id;
    }
  }
  function clearShip(grid,r,c,len,dir){
    for(var k=0;k<len;k++){
      var cr=dir==='h'?r:r+k;
      var cc=dir==='h'?c+k:c;
      grid[idx(cr,cc)]=0;
    }
  }
  function autoPlace(grid){
    for(var si=0;si<SHIPS.length;si++){
      for(var att=0;att<300;att++){
        var dir=Math.random()<0.5?'h':'v';
        var r=Math.floor(Math.random()*SZ);
        var c=Math.floor(Math.random()*SZ);
        if(canPlace(grid,r,c,SHIPS[si],dir)){placeShip(grid,r,c,SHIPS[si],dir,si+1);break;}
      }
    }
  }
  function shipCells(grid,id){
    var out=[];for(var i=0;i<SZ*SZ;i++)if(grid[i]===id||grid[i]===-100-id)out.push(i);return out;
  }
  // An "alive" cell is one containing an intact ship id (1..5), not yet hit.
  function shipAlive(grid,id){
    for(var i=0;i<SZ*SZ;i++)if(grid[i]===id)return true;
    return false;
  }
  function shipSunk(grid,id){
    // Ship sunk if ALL cells that were id have been hit. We encode hit
    // ship cells as -100-id on the actual board (so we can still identify
    // which ship a hit belonged to) and -2 on the viewed board.
    var anyIntact=false,everExisted=false;
    for(var i=0;i<SZ*SZ;i++){
      if(grid[i]===id){everExisted=true;anyIntact=true;}
      else if(grid[i]===-100-id){everExisted=true;}
    }
    return everExisted&&!anyIntact;
  }
  function allSunk(grid){
    for(var si=0;si<SHIPS.length;si++){
      if(shipAlive(grid,si+1))return false;
    }
    return true;
  }
  function countAliveShips(grid){
    var n=0;for(var si=0;si<SHIPS.length;si++)if(shipAlive(grid,si+1))n++;return n;
  }
  function allPlaced(){for(var si=0;si<SHIPS.length;si++)if(!placements[si])return false;return true;}
  function locateShip(grid,id){
    // returns {r,c,dir,len} for a ship id (any remaining or hit cell)
    var cells=[];
    for(var i=0;i<SZ*SZ;i++)if(grid[i]===id||grid[i]===-100-id)cells.push(i);
    if(!cells.length)return null;
    var rs=cells.map(function(i){return Math.floor(i/SZ);});
    var cs=cells.map(function(i){return i%SZ;});
    var rmin=Math.min.apply(null,rs),rmax=Math.max.apply(null,rs);
    var cmin=Math.min.apply(null,cs),cmax=Math.max.apply(null,cs);
    var dir=(rmax-rmin)>(cmax-cmin)?'v':'h';
    return {r:rmin,c:cmin,dir:dir,len:cells.length};
  }

  // ── ghost preview (placement) ──
  var ghostCells=[];
  function clearGhost(){
    for(var i=0;i<ghostCells.length;i++){
      var el=ghostCells[i];
      if(el&&el.classList){el.classList.remove('ghost-ok');el.classList.remove('ghost-bad');}
    }
    ghostCells=[];
  }
  function showGhost(si,r,c){
    clearGhost();
    if(si<0||!shipDirs)return;
    var dir=shipDirs[si],len=SHIPS[si];
    var ok=canPlace(pGrid,r,c,len,dir);
    for(var k=0;k<len;k++){
      var cr=dir==='h'?r:r+k;
      var cc=dir==='h'?c+k:c;
      if(!inb(cr,cc))continue;
      var tbl=grids.querySelector('.th-grid[data-side="you"]');
      if(!tbl)break;
      var el=tbl.children[idx(cr,cc)];
      if(el){el.classList.add(ok?'ghost-ok':'ghost-bad');ghostCells.push(el);}
    }
  }

  // ── drag to move placed ships during setup ──
  // Touch/mouse press on a placed ship cell starts drag. First movement
  // lifts the ship (removes from grid, shows ghost under finger). Release
  // drops the ship at the current cell if legal, else snaps back.
  // A touch that doesn't move at all falls through to the existing
  // tap handler (which calls pickUp).
  function _cellFromPoint(x,y){
    var el=document.elementFromPoint(x,y);
    if(!el||!el.closest)return null;
    return el.closest('.th-cell[data-i]');
  }
  function _dragStart(ev){
    if(phase!=='place')return;
    var t=ev.target.closest&&ev.target.closest('.th-cell');
    if(!t)return;
    var i=parseInt(t.getAttribute('data-i'),10);
    if(isNaN(i))return;
    var cellVal=pGrid[i];
    if(cellVal<=0)return; // not a placed ship — tap handler will deal with it
    var si=cellVal-1;
    var pl=placements[si];
    if(!pl)return;
    _dragShip=si;
    _dragOrigR=pl.r;_dragOrigC=pl.c;_dragOrigDir=pl.dir;
    _dragMoved=false;
    // Attach document-level move/end so drag keeps working even when
    // the finger leaves the original cell's bounds.
    _dragMoveHandler=function(e){_dragMove(e);};
    _dragEndHandler=function(e){_dragEnd(e);};
    document.addEventListener('touchmove',_dragMoveHandler,{passive:false});
    document.addEventListener('touchend',_dragEndHandler);
    document.addEventListener('touchcancel',_dragEndHandler);
    document.addEventListener('mousemove',_dragMoveHandler);
    document.addEventListener('mouseup',_dragEndHandler);
  }
  function _dragMove(ev){
    if(_dragShip<0)return;
    var pt=ev.touches&&ev.touches[0]?ev.touches[0]:ev;
    if(pt.clientX===undefined)return;
    // First detected move: lift the ship off the grid WITHOUT calling
    // rn() (which causes a visible jerk). Update pGrid + placements
    // directly, then strip the .placed class from the affected cells
    // so the grid visually matches state. The full rn() runs only on
    // drop.
    if(!_dragMoved){
      pickUp(_dragShip);
      selShip=_dragShip;
      _dragMoved=true;
      var tbl=grids.querySelector('.th-grid[data-side="you"]');
      if(tbl){
        for(var ci=0;ci<tbl.children.length;ci++){
          tbl.children[ci].classList.remove('placed');
        }
        for(var pi=0;pi<SHIPS.length;pi++){
          var p=placements[pi];if(!p)continue;
          for(var k=0;k<SHIPS[pi];k++){
            var cr=p.dir==='h'?p.r:p.r+k;
            var cc=p.dir==='h'?p.c+k:p.c;
            var el=tbl.children[idx(cr,cc)];
            if(el)el.classList.add('placed');
          }
        }
      }
    }
    var cell=_cellFromPoint(pt.clientX,pt.clientY);
    if(!cell)return;
    var i=parseInt(cell.getAttribute('data-i'),10);
    if(isNaN(i))return;
    var r=Math.floor(i/SZ),c=i%SZ;
    showGhost(_dragShip,r,c);
    // Prevent page scroll during the drag
    if(ev.cancelable)ev.preventDefault();
  }
  function _dragEnd(ev){
    if(_dragShip<0)return;
    // Detach document-level listeners first
    if(_dragMoveHandler){
      document.removeEventListener('touchmove',_dragMoveHandler);
      document.removeEventListener('mousemove',_dragMoveHandler);
      _dragMoveHandler=null;
    }
    if(_dragEndHandler){
      document.removeEventListener('touchend',_dragEndHandler);
      document.removeEventListener('touchcancel',_dragEndHandler);
      document.removeEventListener('mouseup',_dragEndHandler);
      _dragEndHandler=null;
    }
    if(!_dragMoved){
      // No drag happened — let the existing tap handler do its thing.
      // (Tap on a placed ship = pick it up. Handled by the onclick set
      // in renderGrid.)
      _dragShip=-1;
      return;
    }
    var pt=(ev.changedTouches&&ev.changedTouches[0])||ev;
    var cell=(pt.clientX!==undefined)?_cellFromPoint(pt.clientX,pt.clientY):null;
    var placed=false;
    if(cell){
      var i=parseInt(cell.getAttribute('data-i'),10);
      if(!isNaN(i)){
        var r=Math.floor(i/SZ),c=i%SZ;
        var len=SHIPS[_dragShip],dir=shipDirs[_dragShip];
        if(canPlace(pGrid,r,c,len,dir)){
          placeShip(pGrid,r,c,len,dir,_dragShip+1);
          placements[_dragShip]={r:r,c:c,dir:dir};
          _play('tap');
          placed=true;
        }
      }
    }
    if(!placed){
      // Snap back to origin
      placeShip(pGrid,_dragOrigR,_dragOrigC,SHIPS[_dragShip],_dragOrigDir,_dragShip+1);
      placements[_dragShip]={r:_dragOrigR,c:_dragOrigC,dir:_dragOrigDir};
    }
    clearGhost();
    var dropped=_dragShip;
    _dragShip=-1;
    _dragMoved=false;
    // Advance selection to next unplaced ship if we successfully moved
    if(placed){
      var nxt=-1;
      for(var si=0;si<SHIPS.length;si++)if(!placements[si]){nxt=si;break;}
      selShip=nxt;
    }
    rn();
  }

  // ── grid render ──
  function renderGrid(grid,host,side,onClick){
    // side: 'you' | 'enemy'
    var g=document.createElement('div');
    g.style.cssText='display:inline-block;text-align:center;width:100%;max-width:'+(phase==='place'?'clamp(280px,92vw,400px)':'clamp(300px,94vw,460px)');
    var title=document.createElement('div');
    title.className='th-hdr';
    title.style.color=side==='enemy'?'var(--gold)':'var(--sage)';
    title.style.fontSize='0.8rem';
    title.textContent=side==='enemy'?'⚔ ENEMY WATERS':'🌱 YOUR FLEET';
    g.appendChild(title);

    // 2-col wrap: [coords-left 16px][grid 1fr]
    var wrap2=document.createElement('div');
    wrap2.style.cssText='display:grid;grid-template-columns:16px 1fr;grid-template-rows:16px 1fr;gap:2px;width:100%';

    // top-left empty
    var tl=document.createElement('div');wrap2.appendChild(tl);
    // top coord row (A-J)
    var topRow=document.createElement('div');
    topRow.style.cssText='display:grid;grid-template-columns:repeat(10,1fr);gap:1px;align-items:center;justify-items:center;font-family:DM Mono,monospace;font-size:0.52rem;color:var(--muted);letter-spacing:0.02em';
    for(var a=0;a<SZ;a++){var lt=document.createElement('div');lt.textContent='ABCDEFGHIJ'.charAt(a);topRow.appendChild(lt);}
    wrap2.appendChild(topRow);

    // left coord col (1-10)
    var leftCol=document.createElement('div');
    leftCol.style.cssText='display:grid;grid-template-rows:repeat(10,1fr);gap:1px;align-items:center;justify-items:center;font-family:DM Mono,monospace;font-size:0.52rem;color:var(--muted);letter-spacing:0.02em';
    for(var n=0;n<SZ;n++){var ln=document.createElement('div');ln.textContent=String(n+1);leftCol.appendChild(ln);}
    wrap2.appendChild(leftCol);

    // the grid itself
    var tbl=document.createElement('div');
    tbl.className='th-grid';
    tbl.setAttribute('data-side',side);
    if(phase==='battle'&&!gameOver){
      var active=(side==='enemy'&&turn==='player')||(side==='you'&&turn==='ai');
      if(active)tbl.classList.add('turn-active');
    }
    for(var i=0;i<SZ*SZ;i++){
      var d=document.createElement('div');
      d.className='th-cell';
      var v=grid[i];
      var isShipCell=(typeof v==='number'&&v>0);
      var isHit=(v===-2);
      var isMiss=(v===-1);
      // alt water stripe for readability
      var r=Math.floor(i/SZ),c=i%SZ;
      var altWater=((r+c)%2===0);
      if(isHit){d.classList.add('hit');}
      else if(isMiss){d.classList.add('miss');}
      else if(side==='you'&&isShipCell){d.classList.add('placed');}
      else{d.classList.add(altWater?'water':'water-alt');}
      // marker text (fallback for when art isn't loaded)
      if(isHit)d.innerHTML='<span class="th-burst">💥</span>';
      else if(isMiss)d.innerHTML='<span class="th-splash">·</span>';
      if(onClick){
        d.classList.add('clickable');
        d.setAttribute('data-i',String(i));
        d.onclick=onClick;
      }
      tbl.appendChild(d);
    }
    wrap2.appendChild(tbl);
    g.appendChild(wrap2);
    host.appendChild(g);

    // overlay sunk ship silhouettes on enemy grid (and player grid)
    var sunkMap=(side==='enemy')?eSunk:pSunk;
    if(sunkMap){
      for(var sid in sunkMap){
        if(!Object.prototype.hasOwnProperty.call(sunkMap,sid))continue;
        var s=sunkMap[sid];
        drawSunkOverlay(tbl,s);
      }
    }
    return tbl;
  }

  function drawSunkOverlay(tbl,s){
    // silhouette spanning the ship's cells, positioned absolutely inside the grid.
    // tbl itself sits inside the 1.5x zoom wrapper on the enemy side, so
    // getBoundingClientRect() returns already-scaled px — divide back out
    // to local (unscaled) px, since these styles get scaled AGAIN by the
    // ancestor transform when rendered (double-scale bug otherwise).
    var scale=(tbl.getAttribute('data-side')==='enemy')?enemyZoom:1;
    var firstCell=tbl.children[idx(s.r,s.c)];
    if(!firstCell)return;
    var rect=firstCell.getBoundingClientRect();
    var tblRect=tbl.getBoundingClientRect();
    var cellW=rect.width/scale,cellH=rect.height/scale;
    if(cellW<2||cellH<2)return;
    var w=s.dir==='h'?cellW*s.len+(s.len-1):cellW;
    var h=s.dir==='v'?cellH*s.len+(s.len-1):cellH;
    var x=(rect.left-tblRect.left)/scale;
    var y=(rect.top-tblRect.top)/scale;
    var ov=document.createElement('div');
    ov.className='th-sink-ship';
    ov.style.cssText+='left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;';
    ov.textContent=s.name.toUpperCase();
    if(tbl.style.position!=='relative')tbl.style.position='relative';
    tbl.appendChild(ov);
  }

  function renderFleetTray(){
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:6px;text-align:center">FLEET</div>';
    h+='<div class="th-ship-tray">';
    for(var si=0;si<SHIPS.length;si++){
      var isPlaced=!!placements[si];
      var isSel=selShip===si;
      var dir=shipDirs[si];
      var len=SHIPS[si];
      var cls='th-ship-chip';
      if(isSel)cls+=' sel';
      if(isPlaced)cls+=' placed';
      h+='<div class="'+cls+'" onclick="_BSsel('+si+')">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.58rem;color:var(--cream);letter-spacing:0.04em;white-space:nowrap">'+SHIP_NAMES[si]+'</div>';
      h+='<div class="th-ship-dots '+(dir==='v'?'v':'')+'">';
      for(var k=0;k<len;k++)h+='<div class="th-ship-dot"></div>';
      h+='</div>';
      h+='<div style="font-size:0.62rem;color:'+(isPlaced?'var(--sage)':'var(--muted)')+';letter-spacing:0.04em">'+(isPlaced?'✓':isSel?'selected':'tap')+'</div>';   /* the tick alone: the word made five chips wrap to two rows at 375 and pushed the board below the fold; the chip's placed style says the rest */
      h+='</div>';
    }
    h+='</div>';
    return h;
  }

  function renderDiffRow(){
    var h='<div class="th-diff-row">';
    for(var i=0;i<DIFFS.length;i++){
      var d=DIFFS[i];
      h+='<button class="th-diff-btn'+(diff===d.k?' on':'')+'" onclick="_BSDiff(\''+d.k+'\')">'+d.n+'</button>';
    }
    h+='</div>';
    h+='<div style="font-family:DM Sans,sans-serif;font-size:0.55rem;color:var(--muted);text-align:center;margin-bottom:2px">Computer: '+(curDiff().d)+' • <button class="th-diff-btn'+(salvoMode?' on':'')+'" onclick="_BSToggleSalvo()" style="padding:2px 7px;font-size:0.58rem">SALVO '+(salvoMode?'ON':'OFF')+'</button> <button class="th-diff-btn'+(specialsEnabled?' on':'')+'" onclick="_BSToggleSpecials()" style="padding:2px 7px;font-size:0.58rem">SPECIALS '+(specialsEnabled?'ON':'OFF')+'</button></div>';
    return h;
  }

  function curDiff(){for(var i=0;i<DIFFS.length;i++)if(DIFFS[i].k===diff)return DIFFS[i];return DIFFS[1];}

  function renderSpecials(){
    if(!specialsEnabled)return '';
    var h='<div style="display:flex;gap:6px;justify-content:center;margin-top:4px;flex-wrap:wrap">';
    h+='<button class="th-special-btn'+(armedSpecial==='radar'?' armed':'')+(radarUsedP?' used':'')+'" onclick="_BSArm(\'radar\')" '+(radarUsedP?'disabled':'')+'>📡 RADAR</button>';
    h+='<button class="th-special-btn'+(armedSpecial==='strike'?' armed':'')+(strikeUsedP?' used':'')+'" onclick="_BSArm(\'strike\')" '+(strikeUsedP?'disabled':'')+'>🌊 TIDE STRIKE</button>';
    h+='</div>';
    return h;
  }

  // ── phase render ──
  function rn(){
    grids.innerHTML='';
    var dirBtn=document.getElementById('BSdir');
    var autoBtn=document.getElementById('BSauto');
    var readyBtn=document.getElementById('BSready');
    if(phase==='place'){
      if(dirBtn)dirBtn.style.display='';
      if(autoBtn)autoBtn.style.display='';
      if(readyBtn)readyBtn.style.display='';
      var tray=renderFleetTray();
      var diffRow=renderDiffRow();
      var instr;
      if(selShip>=0){
        // No direction arrow in the instruction — rotating the ship
        // used to change this text's width which shifted the board
        // below. Direction is shown only on the ship tile itself.
        instr='<div style="font-family:DM Sans,sans-serif;font-size:0.62rem;color:var(--cream);line-height:1.4">Tap grid or drag to place <strong style="color:var(--gold)">'+SHIP_NAMES[selShip]+'</strong></div>';
      }else if(allPlaced()){
        instr='<div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:var(--sage);letter-spacing:0.08em">ALL PLACED, TAP "I\'M READY"</div>';
      }else{
        instr='<div style="font-family:DM Sans,sans-serif;font-size:0.58rem;color:var(--muted);line-height:1.4">Tap a ship, then the grid. Drag placed ships to reposition. Tap Auto for random.</div>';
      }
      lbl.innerHTML=diffRow+tray+instr;
      if(readyBtn){
        if(allPlaced()){readyBtn.disabled=false;readyBtn.style.opacity='1';}
        else{readyBtn.disabled=true;readyBtn.style.opacity='0.4';}
      }
      renderGrid(pGrid,grids,'you',function(){
        var i=parseInt(this.getAttribute('data-i'),10);
        var r=Math.floor(i/SZ),c=i%SZ;
        var cellVal=pGrid[i];
        clearGhost();
        if(cellVal>0){pickUp(cellVal-1);_play('tap');rn();return;}
        if(selShip>=0){
          var len=SHIPS[selShip];
          var dir=shipDirs[selShip];
          if(!canPlace(pGrid,r,c,len,dir)){sm('No room there, rotate or pick another spot');return;}
          placeShip(pGrid,r,c,len,dir,selShip+1);
          placements[selShip]={r:r,c:c,dir:dir};
          _play('tap');
          // auto-advance to next unplaced ship for smoothness
          var nxt=-1;
          for(var si=0;si<SHIPS.length;si++)if(!placements[si]){nxt=si;break;}
          selShip=nxt;
          rn();
          return;
        }
        sm('Pick a ship from the fleet first');
      });
      // add hover-ghost for placement (mouse only; touch uses tap)
      var tbl=grids.querySelector('.th-grid[data-side="you"]');
      if(tbl){
        tbl.addEventListener('mousemove',function(ev){
          var t=ev.target.closest('.th-cell');
          if(!t||selShip<0)return;
          var ii=parseInt(t.getAttribute('data-i'),10);
          if(isNaN(ii))return;
          var rr=Math.floor(ii/SZ),cc=ii%SZ;
          showGhost(selShip,rr,cc);
        });
        tbl.addEventListener('mouseleave',clearGhost);
        // Drag-to-move: press on a placed ship cell, drag to new spot.
        // First detectable move lifts the ship; touchend drops it.
        tbl.addEventListener('touchstart',_dragStart,{passive:false});
        tbl.addEventListener('mousedown',_dragStart);
      }
    }else{
      // BATTLE phase
      if(dirBtn)dirBtn.style.display='none';
      if(autoBtn)autoBtn.style.display='none';
      if(readyBtn)readyBtn.style.display='none';
      var salvoTxt='';
      if(salvoMode){
        var shots=(turn==='player')?pShotsLeft:aiShotsLeft;
        salvoTxt=' • <strong style="color:var(--gold)">SALVO: '+shots+' shot'+(shots!==1?'s':'')+'</strong>';
      }
      var turnLbl=turn==='player'?'Your turn':'Enemy firing...';
      lbl.innerHTML='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:'+(turn==='player'?'var(--sage)':'var(--gold)')+';letter-spacing:0.1em">'+turnLbl+salvoTxt+'</div>'+renderSpecials();
      // Enemy grid with zoom wrapper
      var enemyZoomWrap=document.createElement('div');
      enemyZoomWrap.id='BSenemyZoom';
      // Wrap needs to overflow-auto so 1.5x zoom can scroll, but at
      // zoom=1 the inner must fill the wrap's width or the enemy grid
      // collapses to its natural content width (much smaller than the
      // player grid). Inner explicitly width:100% + origin fixes that.
      enemyZoomWrap.style.cssText='display:block;width:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:4px 0;';
      var enemyZoomInner=document.createElement('div');
      // transform-origin top LEFT — with 'top center' the zoomed grid's
      // left half landed at negative coordinates that overflow:auto can
      // never scroll to, leaving columns A/B untappable at 1.5×.
      enemyZoomInner.style.cssText='display:block;width:100%;transform:scale('+enemyZoom+');transform-origin:top left;transition:transform 0.2s ease;';
      enemyZoomWrap.appendChild(enemyZoomInner);
      grids.appendChild(enemyZoomWrap);
      renderGrid(eGrid,enemyZoomInner,'enemy',(turn==='player'&&!gameOver)?function(){
        var i=parseInt(this.getAttribute('data-i'),10);
        handlePlayerClick(i);
      }:null);
      grids.appendChild(document.createElement('div'));
      renderGrid(pGrid,grids,'you',null);
      // refresh sunk overlays after layout settles (needs real rects)
      setTimeout(function(){
        var eTbl=grids.querySelector('[data-side="enemy"]');
        var pTbl=grids.querySelector('[data-side="you"]');
        // wipe any existing overlays, then redraw
        if(eTbl){var ovs=eTbl.querySelectorAll('.th-sink-ship');for(var i=0;i<ovs.length;i++)ovs[i].remove();for(var sid in eSunk)drawSunkOverlay(eTbl,eSunk[sid]);}
        if(pTbl){var pvs=pTbl.querySelectorAll('.th-sink-ship');for(var j=0;j<pvs.length;j++)pvs[j].remove();for(var psid in pSunk)drawSunkOverlay(pTbl,pSunk[psid]);}
      },30);
    }
  }

  function pickUp(si){
    var pl=placements[si];if(!pl)return;
    clearShip(pGrid,pl.r,pl.c,SHIPS[si],pl.dir);
    delete placements[si];
    selShip=si;
  }

  // ── banners ──
  function banner(text,kind){
    // `a` (#fg-ag) is the app's permanent mount and never disconnects —
    // `wrap` is this game instance's own subtree, torn out via
    // ag.innerHTML='' on exit/switch, so it's the right isConnected check.
    if(!wrap||!wrap.isConnected)return;
    var b=document.createElement('div');
    b.className='th-banner'+(kind?' '+kind:'');
    b.textContent=text;
    document.body.appendChild(b);
    setTimeout(function(){if(b&&b.parentNode)b.parentNode.removeChild(b);},1500);
  }

  // ── shot resolution ──
  function resolvePlayerShot(i){
    // returns 'hit' | 'miss' | 'sunk'
    if(eGrid[i]<0)return null;
    var v=eGrid[i];
    stats.playerShots++;
    if(v>0){
      eGrid[i]=-2;
      stats.playerHits++;
      stats.playerStreak++;
      if(stats.playerStreak>stats.playerBestStreak)stats.playerBestStreak=stats.playerStreak;
      // check sink: if any other cell of ship v is still intact, not sunk
      var sid=v;
      // We need to check the original enemy board to tell if that ship
      // had additional cells. We hide ship data in a parallel array.
      if(!anyShipCellLeft(eGrid,sid)){
        var s=eShipMeta[sid];
        if(s){eSunk[sid]=s;}
        banner(SHIP_NAMES[sid-1].toUpperCase()+' SUNK','win');
        _play('win');
        return 'sunk';
      }
      _play('snap');
      return 'hit';
    }else{
      eGrid[i]=-1;
      stats.playerStreak=0;
      _play('tap');
      return 'miss';
    }
  }
  function anyShipCellLeft(grid,sid){
    for(var i=0;i<SZ*SZ;i++)if(grid[i]===sid)return true;
    return false;
  }

  function resolveAIShot(i){
    if(pGrid[i]<0)return null;
    stats.aiShots++;
    var v=pGrid[i];
    if(v>0){
      var sid=v;
      pGrid[i]=-2;
      stats.aiHits++;
      aiHitStack.push(i);
      aiKnownHits.push({i:i,sid:sid});
      // adjacency targets for hunt
      var r=Math.floor(i/SZ),c=i%SZ;
      var adj=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
      for(var j=0;j<adj.length;j++){
        var ar=adj[j][0],ac=adj[j][1];
        if(inb(ar,ac)){var ai=idx(ar,ac);if(pGrid[ai]>=0)aiHitStack.push(ai);}
      }
      if(!anyShipCellLeft(pGrid,sid)){
        var s=pShipMeta[sid];
        if(s)pSunk[sid]=s;
        banner(SHIP_NAMES[sid-1].toUpperCase()+' SUNK','loss');
        // prune hit stack of cells in this sunk ship's line so AI doesn't waste shots
        aiHitStack=aiHitStack.filter(function(ix){
          if(pGrid[ix]<0)return false;
          return true;
        });
        // forget the known hits for this ship
        aiKnownHits=aiKnownHits.filter(function(o){return o.sid!==sid;});
        return 'sunk';
      }
      return 'hit';
    }else{
      pGrid[i]=-1;
      return 'miss';
    }
  }

  // ── player click handler ──
  function handlePlayerClick(i){
    if(gameOver||turn!=='player')return;
    if(armedSpecial==='radar'){fireRadar(i,'player');return;}
    if(armedSpecial==='strike'){fireTideStrike(i,'player');return;}
    if(eGrid[i]<0)return;
    if(effConfirm()){
      if(pendingShot===i){pendingShot=-1;commitPlayerShot(i);return;}
      pendingShot=i;
      var coord='ABCDEFGHIJ'.charAt(i%SZ)+(Math.floor(i/SZ)+1);
      sm('🎯 Aimed at '+coord+', tap again to fire');
      var tbl=grids.querySelector('.th-grid[data-side="enemy"]');
      if(tbl){
        for(var k=0;k<tbl.children.length;k++)tbl.children[k].classList.remove('aim');
        var cell=tbl.children[i];if(cell)cell.classList.add('aim');
      }
      return;
    }
    commitPlayerShot(i);
  }
  function commitPlayerShot(i){
    var result=resolvePlayerShot(i);
    if(!result)return;
    if(allSunk(eGrid)){endGame(true);return;}
    // salvo: continue with remaining shots
    if(salvoMode){
      pShotsLeft--;
      if(pShotsLeft>0){
        // stay on player turn, just rerender
        rn();
        sm(result==='miss'?'· Miss':(result==='sunk'?'🌿 Sunk! '+(pShotsLeft)+' shots left':'💥 Hit! '+(pShotsLeft)+' shots left'));
        return;
      }
      // turn ends
      sm(result==='miss'?'· Miss, enemy turn':(result==='sunk'?'🌿 Sunk! Enemy turn':'💥 Hit! Enemy turn'));
    }else{
      sm(result==='miss'?'· Miss':(result==='sunk'?'🌿 Ship sunk!':'💥 Hit!'));
    }
    endPlayerTurn();
  }
  function endPlayerTurn(){
    turn='ai';
    aiShotsLeft=salvoMode?countAliveShips(pGrid):1;
    stats.turns++;
    rn();
    aiTimeoutId=setTimeout(aiTurn,salvoMode?420:650);
  }
  function endAITurn(){
    if(gameOver)return;
    turn='player';
    pShotsLeft=salvoMode?countAliveShips(eGrid):1;
    stats.turns++;
    pendingShot=-1;
    var ph=document.getElementById('BSph');if(ph)ph.innerHTML='Your turn';
    rn();
  }

  // ── specials ──
  function fireRadar(center,who){
    var r0=Math.floor(center/SZ),c0=center%SZ;
    // clamp so the 3x3 fits
    var r=Math.min(SZ-2,Math.max(1,r0));
    var c=Math.min(SZ-2,Math.max(1,c0));
    var count=0;
    var tGrid=(who==='player')?eGrid:pGrid;
    for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
      var v=tGrid[idx(r+dr,c+dc)];
      if(v>0)count++;
    }
    // Visual overlay on enemy (or player) grid
    var tbl=(who==='player')?grids.querySelector('.th-grid[data-side="enemy"]'):grids.querySelector('.th-grid[data-side="you"]');
    if(tbl){
      // enemy grid may be sitting inside the 1.5x zoom wrapper — see the
      // matching comment in drawSunkOverlay for why we divide by scale.
      var scale=(who==='player')?enemyZoom:1;
      var firstCell=tbl.children[idx(r-1,c-1)];
      if(firstCell){
        var rect=firstCell.getBoundingClientRect();
        var tblRect=tbl.getBoundingClientRect();
        var cellW=rect.width/scale;
        var x=(rect.left-tblRect.left)/scale;
        var y=(rect.top-tblRect.top)/scale;
        var ov=document.createElement('div');
        ov.className='th-radar-overlay';
        ov.style.cssText+='left:'+x+'px;top:'+y+'px;width:'+(cellW*3+2)+'px;height:'+(cellW*3+2)+'px;';
        var cd=document.createElement('div');cd.className='th-radar-count';cd.textContent=count;
        ov.appendChild(cd);
        if(tbl.style.position!=='relative')tbl.style.position='relative';
        tbl.appendChild(ov);
        setTimeout(function(){if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);},2400);
      }
    }
    if(who==='player'){radarUsedP=true;armedSpecial=null;sm('📡 Radar: '+count+' ship cells in that area');}
    else{radarUsedAI=true;sm('📡 Enemy radar swept your waters');}
    _play('snap');
    // Radar counts as the turn's action (one salvo shot, or the whole turn)
    if(who==='player'){
      if(salvoMode){pShotsLeft--;if(pShotsLeft<=0){endPlayerTurn();return;}}
      else{endPlayerTurn();return;}
      rn();
      return;
    }
    endAITurn();
  }
  function fireTideStrike(center,who){
    var r=Math.floor(center/SZ),c=center%SZ;
    // plus pattern: center + 4 orthogonal neighbors
    var cells=[[r,c],[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
    var hits=0,sinks=0;
    for(var k=0;k<cells.length;k++){
      var rr=cells[k][0],cc=cells[k][1];
      if(!inb(rr,cc))continue;
      var i=idx(rr,cc);
      var result=(who==='player')?resolvePlayerShot(i):resolveAIShot(i);
      if(result==='hit')hits++;
      if(result==='sunk'){hits++;sinks++;}
    }
    if(who==='player'){strikeUsedP=true;armedSpecial=null;sm('🌊 Tide Strike: '+hits+' hit'+(hits!==1?'s':'')+(sinks?', '+sinks+' sunk!':''));_play(hits?'win':'tap');}
    else{strikeUsedAI=true;sm('🌊 Enemy tide strike landed '+hits+' hit'+(hits!==1?'s':''));}
    if(who==='player'&&allSunk(eGrid)){endGame(true);return;}
    if(who==='ai'&&allSunk(pGrid)){endGame(false);return;}
    // counts as one turn (no salvo stacking)
    if(who==='player'){endPlayerTurn();return;}
    endAITurn();
  }

  // ── AI ──
  function aiTurn(){
    if(gameOver)return;
    // chance to fire a special (save for after mid-game for storm/kraken)
    if(specialsEnabled&&maybeAISpecial())return;
    var target=-1;
    if(diff==='sprout'){
      target=aiHuntTarget(false);
    }else if(diff==='tide'){
      target=aiHuntTarget(true);
    }else{
      // storm / kraken — full PDF
      target=aiPDFTarget(diff==='kraken');
    }
    if(target<0){turn='player';pShotsLeft=salvoMode?countAliveShips(eGrid):1;rn();return;}
    var r=resolveAIShot(target);
    if(allSunk(pGrid)){endGame(false);return;}
    if(salvoMode){
      aiShotsLeft--;
      if(aiShotsLeft>0){rn();aiTimeoutId=setTimeout(aiTurn,420);return;}
    }
    turn='player';
    pShotsLeft=salvoMode?countAliveShips(eGrid):1;
    stats.turns++;
    pendingShot=-1;
    var _bsph1=document.getElementById('BSph');if(_bsph1)_bsph1.innerHTML='Your turn';
    rn();
  }
  function aiHuntTarget(useParity){
    // follow-up on known hits first
    while(aiHitStack.length>0){
      var t=aiHitStack.pop();
      if(pGrid[t]>=0)return t;
    }
    // fresh shot
    var open=[];for(var i=0;i<SZ*SZ;i++)if(pGrid[i]>=0)open.push(i);
    if(!open.length)return -1;
    if(useParity){
      // find min remaining ship length to set parity step
      var minLen=2;
      for(var si=0;si<SHIPS.length;si++)if(shipAlive(pGrid,si+1)&&SHIPS[si]<minLen)minLen=SHIPS[si];
      var step=minLen; // parity-step 2 for destroyers
      var parity=open.filter(function(ix){
        var r=Math.floor(ix/SZ),c=ix%SZ;
        return ((r+c)%step)===0;
      });
      var pool=parity.length?parity:open;
      return pool[Math.floor(Math.random()*pool.length)];
    }
    return open[Math.floor(Math.random()*open.length)];
  }
  function aiPDFTarget(useMemory){
    // known hits that haven't been linked to a sunk ship — "target mode"
    var openHits=aiKnownHits.filter(function(o){return shipAlive(pGrid,o.sid);}).map(function(o){return o.i;});
    var heat=new Array(SZ*SZ);for(var q=0;q<SZ*SZ;q++)heat[q]=0;
    var remainingShips=[];
    for(var s=0;s<SHIPS.length;s++)if(shipAlive(pGrid,s+1))remainingShips.push(SHIPS[s]);
    // For each remaining ship length, try every legal placement
    for(var L=0;L<remainingShips.length;L++){
      var len=remainingShips[L];
      for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++){
        ['h','v'].forEach(function(dir){
          var coversHit=openHits.length===0; // if no open hits, fine
          var ok=true;
          for(var k=0;k<len;k++){
            var cr=dir==='h'?r:r+k;
            var cc=dir==='h'?c+k:c;
            if(!inb(cr,cc)){ok=false;return;}
            var v=pGrid[idx(cr,cc)];
            // miss or known-NOT-this-ship-at -2 would block
            if(v===-1){ok=false;return;}
            if(v===-2){
              // hit cell — placement must cover THIS if target mode
              if(openHits.length>0&&openHits.indexOf(idx(cr,cc))>=0)coversHit=true;
              else{
                // an unrelated hit (from a different now-sunk ship's trail)
                // is already treated as -2, but if it's on our target ship
                // we need this placement to go through it. Blocking here is
                // slightly pessimistic but keeps us safe.
                ok=false;return;
              }
            }
          }
          if(!ok||!coversHit)return;
          // add weight to each unhit cell in this placement
          for(var k=0;k<len;k++){
            var cr2=dir==='h'?r:r+k;
            var cc2=dir==='h'?c+k:c;
            var ix=idx(cr2,cc2);
            if(pGrid[ix]>=0)heat[ix]+=1;
          }
        });
      }
    }
    // pattern memory bias: Kraken adds a small bonus from past-game player placements
    if(useMemory){
      try{
        var mem=JSON.parse(localStorage.getItem('lw_tidehunt_kraken')||'[]');
        for(var m=0;m<mem.length&&m<5;m++){
          for(var mi=0;mi<mem[m].length;mi++){
            var cell=mem[m][mi];
            if(cell>=0&&cell<SZ*SZ&&pGrid[cell]>=0)heat[cell]+=0.3;
          }
        }
      }catch(e){}
    }
    // pick the max-heat open cell
    var bestI=-1,bestH=-1;
    for(var ii=0;ii<SZ*SZ;ii++){
      if(pGrid[ii]<0)continue;
      if(heat[ii]>bestH){bestH=heat[ii];bestI=ii;}
    }
    if(bestI<0){
      // fallback
      return aiHuntTarget(true);
    }
    return bestI;
  }
  function maybeAISpecial(){
    if(diff==='sprout')return false;
    // crude: radar early, strike when open hits exist
    if(!radarUsedAI&&stats.turns>=3&&stats.turns<=6){
      // pick a dense-heat 3x3
      var center=findDenseRadarCenter();
      if(center>=0){fireRadar(center,'ai');return true;}
    }
    if(!strikeUsedAI&&aiKnownHits.length>0&&Math.random()<0.5){
      var knownI=aiKnownHits[aiKnownHits.length-1].i;
      // aim at an adjacent cluster for plus-pattern
      fireTideStrike(knownI,'ai');
      return true;
    }
    return false;
  }
  function findDenseRadarCenter(){
    // a 3x3 with lots of unknowns and no confirmed info
    var best=-1,bestScore=-1;
    for(var r=1;r<SZ-1;r++)for(var c=1;c<SZ-1;c++){
      var score=0,bad=false;
      for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
        var v=pGrid[idx(r+dr,c+dc)];
        if(v===-1||v===-2){bad=true;break;}
        score++;
      }
      if(bad)continue;
      if(score>bestScore){bestScore=score;best=idx(r,c);}
    }
    return best;
  }

  // ── end game ──
  function endGame(playerWon){
    gameOver=true;turn='done';
    var dur=Date.now()-stats.started;
    stats.finished=dur;
    // remember player's placements for Kraken mode
    try{
      var mem=JSON.parse(localStorage.getItem('lw_tidehunt_kraken')||'[]');
      var cells=[];
      for(var si=0;si<SHIPS.length;si++){
        var pl=placements[si];if(!pl)continue;
        for(var k=0;k<SHIPS[si];k++){
          var cr=pl.dir==='h'?pl.r:pl.r+k;
          var cc=pl.dir==='h'?pl.c+k:pl.c;
          cells.push(idx(cr,cc));
        }
      }
      mem.unshift(cells);
      while(mem.length>10)mem.pop();
      localStorage.setItem('lw_tidehunt_kraken',JSON.stringify(mem));
    }catch(e){}
    // save record (lower-is-better: fewer shots to win is the skill signal)
    _sr('battleship',{w:playerWon,s:stats.playerShots,lo:1});
    var _bsphEnd=document.getElementById('BSph');
    if(_bsphEnd)_bsphEnd.innerHTML=playerWon?'Victory':'Defeated';
    if(playerWon){_e('game_win');_playWin();banner('🌿 VICTORY','win');}
    else{_e('game_loss');banner('🍂 DEFEATED','loss');}
    // render stats modal
    setTimeout(function(){showStats();},900);
    rn();
  }
  function showStats(){
    var acc=stats.playerShots?Math.round(100*stats.playerHits/stats.playerShots):0;
    var aiAcc=stats.aiShots?Math.round(100*stats.aiHits/stats.aiShots):0;
    var secs=Math.round(stats.finished/1000);
    var m=Math.floor(secs/60),s=secs%60;
    var h='<div class="th-stats">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.12em;color:var(--gold);text-align:center;margin-bottom:8px">BATTLE REPORT</div>';
    h+='<div class="th-stats-row"><span>Turns</span><span>'+stats.turns+'</span></div>';
    h+='<div class="th-stats-row"><span>Your shots</span><span>'+stats.playerShots+'</span></div>';
    h+='<div class="th-stats-row"><span>Your hits</span><span>'+stats.playerHits+'</span></div>';
    h+='<div class="th-stats-row"><span>Accuracy</span><span>'+acc+'%</span></div>';
    h+='<div class="th-stats-row"><span>Best streak</span><span>'+stats.playerBestStreak+'</span></div>';
    h+='<div class="th-stats-row"><span>Enemy accuracy</span><span>'+aiAcc+'%</span></div>';
    h+='<div class="th-stats-row"><span>Duration</span><span>'+m+'m '+s+'s</span></div>';
    h+='<div class="th-stats-row"><span>Difficulty</span><span>'+curDiff().n.toUpperCase()+(salvoMode?' • SALVO':'')+'</span></div>';
    h+='</div>';
    h+='<div style="text-align:center;margin-top:10px"><button class="gb" onclick="_BSN()">⟳ PLAY AGAIN</button></div>';
    var wrap2=document.createElement('div');wrap2.innerHTML=h;
    grids.appendChild(wrap2);
  }

  // ── meta maps for sunk ship locations (stored at placement time) ──
  var eShipMeta,pShipMeta;
  function snapshotMeta(grid){
    var out={};
    for(var si=0;si<SHIPS.length;si++){
      var loc=locateShip(grid,si+1);
      if(loc)out[si+1]={r:loc.r,c:loc.c,dir:loc.dir,len:loc.len,name:SHIP_NAMES[si]};
    }
    return out;
  }

  // ── window-exposed handlers ──
  window._BSR=function(){
    if(selShip<0){sm('Pick a ship to rotate');return;}
    shipDirs[selShip]=shipDirs[selShip]==='h'?'v':'h';
    sm('Rotated: '+(shipDirs[selShip]==='h'?'→ Horizontal':'↓ Vertical'));
    rn();
  };
  window._BSAuto=function(){
    if(phase!=='place')return;
    pGrid=mkGrid();placements={};shipDirs=['h','h','h','h','h'];
    autoPlace(pGrid);
    for(var si=0;si<SHIPS.length;si++){
      var loc=locateShip(pGrid,si+1);
      if(loc)placements[si]={r:loc.r,c:loc.c,dir:loc.dir};
    }
    selShip=-1;
    _play('win');
    sm('🎲 Fleet auto-placed');
    rn();
  };
  window._BSsel=function(si){
    if(phase!=='place')return;
    if(placements[si]){pickUp(si);_play('tap');rn();return;}
    selShip=(selShip===si)?-1:si;
    _play('tap');
    rn();
  };
  window._BSready=function(){
    if(phase!=='place')return;
    if(!allPlaced()){sm('Place all ships first');return;}
    phase='battle';turn='player';selShip=-1;
    pShotsLeft=salvoMode?SHIPS.length:1;
    aiShotsLeft=0;
    // enemy placement
    eGrid=mkGrid();autoPlace(eGrid);
    eShipMeta=snapshotMeta(eGrid);
    pShipMeta=snapshotMeta(pGrid);
    stats.started=Date.now();
    var _bsph2=document.getElementById('BSph');if(_bsph2)_bsph2.innerHTML='Your turn, tap enemy waters';
    _play('win');
    rn();
  };
  window._BSToggleConfirm=function(){
    confirmAttack=!confirmAttack;
    try{localStorage.setItem('lw_bs_confirm',confirmAttack?'on':'off');}catch(e){}
    var b=document.getElementById('BSconfirmBtn');
    if(b)b.textContent=confirmAttack?'✓ CONFIRM ON':'CONFIRM OFF';
    sm(confirmAttack?'Confirm-attack ON':'Confirm-attack OFF');
  };
  window._BSToggleZoom=function(){
    enemyZoom=enemyZoom>1?1:1.5;
    try{localStorage.setItem('lw_bs_zoom',String(enemyZoom));}catch(e){}
    var b=document.getElementById('BSzoomBtn');
    if(b)b.textContent=enemyZoom>1?'🔍 1.5×':'🔍 1×';
    rn();
  };
  window._BSDiff=function(k){
    diff=k;try{localStorage.setItem('lw_bs_diff',k);}catch(e){}
    sm('Difficulty: '+curDiff().n+' ('+curDiff().d+')');rn();
  };
  window._BSToggleSalvo=function(){
    salvoMode=!salvoMode;try{localStorage.setItem('lw_bs_salvo',salvoMode?'on':'off');}catch(e){}
    sm(salvoMode?'Salvo mode ON (one shot per alive ship)':'Salvo mode OFF');rn();
  };
  window._BSToggleSpecials=function(){
    specialsEnabled=!specialsEnabled;try{localStorage.setItem('lw_bs_specials',specialsEnabled?'on':'off');}catch(e){}
    sm(specialsEnabled?'Specials ON':'Specials OFF');rn();
  };
  window._BSArm=function(kind){
    if(turn!=='player'||gameOver||phase!=='battle')return;
    if(kind==='radar'&&radarUsedP){sm('Radar already used');return;}
    if(kind==='strike'&&strikeUsedP){sm('Tide strike already used');return;}
    armedSpecial=armedSpecial===kind?null:kind;
    if(armedSpecial==='radar')sm('📡 Radar armed. Tap a cell to scan a 3×3 area.');
    else if(armedSpecial==='strike')sm('🌊 Tide Strike armed. Tap a cell, hits a plus-pattern.');
    else sm('Special disarmed');
    rn();
  };
  window._BSN=function(){
    pGrid=mkGrid();eGrid=mkGrid();phase='place';
    selShip=0;placements={};shipDirs=['h','h','h','h','h'];
    gameOver=false;turn='player';
    aiHitStack=[];aiKnownHits=[];
    eSunk={};pSunk={};
    radarUsedP=false;strikeUsedP=false;radarUsedAI=false;strikeUsedAI=false;
    armedSpecial=null;pendingShot=-1;
    pShotsLeft=1;aiShotsLeft=0;
    stats={started:0,finished:0,turns:0,playerShots:0,playerHits:0,playerStreak:0,playerBestStreak:0,aiShots:0,aiHits:0};
    var _bsph3=document.getElementById('BSph');if(_bsph3)_bsph3.innerHTML='Place your fleet';
    sm('New battle, place your fleet');
    _bsSyncCfm();
    rn();
  };

  // INIT
  window._BSN();
}

window._gameFns=window._gameFns||{};
window._gameFns.battleship=GBS;
})();
