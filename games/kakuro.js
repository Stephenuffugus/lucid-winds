// ═══ GARDEN SUMS — Kakuro rebuild ═══
// White cells hold 1-9. Each run must sum to its clue with no repeats.
// Procedural generator + delta render + active-run readout + combinations
// helper + pencil mode + auto-pencil + difficulty ladder + timer.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,_setDiff=G.setDiff,sm=G.sm,_sr=G.sr;

// ── Layout templates (hand-crafted patterns) ────────────────────────────
// Pattern chars: B = black, C = clue cell, W = white.
// Constraint: every run (contiguous W cells in a row or column) must
// have length >= 2 and be preceded by a C (or grid edge + C).
var LAYOUTS={
  easy:[
    [
      'BCCBB',
      'CWWBB',
      'CWWCB',
      'BCWWB',
      'BCWWB'
    ],
    [
      'BCCBBB',
      'CWWBBB',
      'CWWCCB',
      'BCWWWB',
      'BCWWWB',
      'BBCWWB'
    ],
    [
      'BBCCBB',
      'BCWWBB',
      'CWWWCB',
      'CWWCCB',
      'BCWWWB',
      'BBCWWB'
    ],
    [
      'BCCCBB',
      'CWWWBB',
      'CWWWCB',
      'CWWWCB',
      'BBCWWB',
      'BBCWWB'
    ]
  ],
  medium:[
    [
      'BCCCCBB',
      'CWWWWBB',
      'CWWWWCB',
      'CWWWWCB',
      'BBCWWWB',
      'BCWWWWB',
      'BCWWWWB'
    ],
    [
      'BCCCBBB',
      'CWWWBBB',
      'CWWWCCB',
      'BCWWWWB',
      'BCWWWWB',
      'BBCWWWB',
      'BBBCWWB'
    ]
  ],
  hard:[
    [
      'BCCCCBBB',
      'CWWWWBBB',
      'CWWWWCCB',
      'BCWWWWWB',
      'BCWWWWWB',
      'BBCWWWWB',
      'BBBCWWWB',
      'BBBBCWWB'
    ]
  ],
  master:[
    [
      'BCCCCCBBB',
      'CWWWWWBBB',
      'CWWWWWCCB',
      'BCWWWWWWB',
      'BCWWWWWWB',
      'BBCWWWWWB',
      'BBBCWWWWB',
      'BBBBCWWWB',
      'BBBBBCWWB'
    ]
  ]
};


// Difficulty display + hint/time budget
var DIFF_META={
  easy:{label:'EASY',sub:'5×5 · short runs',hints:3,parTime:180},
  medium:{label:'STEADY',sub:'6×6 with 3-cell runs',hints:3,parTime:360},
  hard:{label:'KEEN',sub:'8×8 longer runs',hints:2,parTime:720},
  master:{label:'MASTER',sub:'9×9 dense',hints:2,parTime:1200}
};

// ── Styles ──────────────────────────────────────────────────────────────
(function injectStyle(){
  if(document.getElementById('kk-style'))return;
  var s=document.createElement('style');s.id='kk-style';
  s.textContent=[
    '@keyframes kkFade{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes kkPop{0%{transform:scale(0.5);opacity:0}55%{transform:scale(1.18);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes kkSolved{0%,100%{transform:scale(1)}50%{transform:scale(1.05);filter:brightness(1.3)}}',
    '#KKpan{max-width:min(100vw,520px);margin:0 auto;padding:6px;user-select:none;-webkit-user-select:none;box-sizing:border-box;font-family:Georgia,serif;animation:kkFade .3s ease}',
    // Difficulty picker
    '.KKdiffPick{display:flex;flex-direction:column;align-items:center;gap:14px;padding:28px 12px 16px;animation:kkFade .3s ease}',
    '.KKdiffTitle{font-family:Bebas Neue,sans-serif;font-size:1.7rem;letter-spacing:0.22em;color:#c8a84b}',
    '.KKdiffSub{font-family:Georgia,serif;font-size:0.78rem;color:rgba(232,220,200,0.72);text-align:center;max-width:320px;line-height:1.5}',
    '.KKdiffBtns{display:flex;flex-direction:column;gap:8px;width:100%;max-width:280px;margin-top:10px}',
    '.KKdiffBtn{min-height:58px;padding:10px 14px;border-radius:12px;background:rgba(26,36,22,0.85);border:1.5px solid rgba(122,179,86,0.35);color:#e8dcc8;font-family:Georgia,serif;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;flex-direction:column;align-items:flex-start;gap:2px}',
    '.KKdiffBtn:active{transform:scale(0.98);background:rgba(122,179,86,0.22)}',
    '.KKdiffBtn .KKdlv{font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.18em;color:#c8a84b;display:flex;justify-content:space-between;width:100%}',
    '.KKdiffBtn .KKdsub{font-size:0.7rem;font-weight:500;color:rgba(232,220,200,0.75)}',
    '.KKdiffBest{font-family:DM Mono,monospace;font-size:0.7rem;font-weight:500;color:#8fc57a;letter-spacing:0.04em}',
    // Top bar (difficulty / timer / errors)
    '.KKtop{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:6px 8px;margin:2px 0 6px;background:linear-gradient(135deg,rgba(26,31,23,0.85),rgba(13,16,12,0.92));border:1.5px solid rgba(122,179,86,0.25);border-radius:10px;font-family:Bebas Neue,sans-serif}',
    '.KKtopCell{text-align:center}',
    '.KKtopLbl{font-size:0.7rem;font-weight:500;letter-spacing:0.16em;color:rgba(232,220,200,0.55)}',
    '.KKtopVal{font-family:DM Mono,monospace;font-size:0.95rem;color:#c8a84b;font-weight:700;margin-top:1px}',
    // Active-run readout
    '.KKrun{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:7px 8px;margin:4px 0;background:rgba(12,16,10,0.55);border:1.5px solid rgba(122,179,86,0.22);border-radius:9px;font-family:Georgia,serif;min-height:48px;align-items:center}',
    '.KKrunCell{text-align:center}',
    '.KKrunLbl{font-family:Bebas Neue,sans-serif;font-size:0.7rem;font-weight:500;letter-spacing:0.14em;color:rgba(232,220,200,0.55)}',
    '.KKrunFrac{font-family:DM Mono,monospace;font-size:0.84rem;color:#e8dcc8;margin-top:2px}',
    '.KKrunNeed{font-size:0.7rem;font-weight:500;color:rgba(232,220,200,0.6);margin-top:2px}',
    '.KKrunFrac.done{color:#8fc57a}',
    '.KKrunFrac.over{color:#e07a7a}',
    '.KKcombos{font-family:DM Mono,monospace;font-size:0.7rem;font-weight:500;color:#c8a84b;cursor:pointer;text-decoration:underline;text-decoration-color:rgba(200,168,75,0.4);margin-top:2px;padding:6px 8px;border-radius:4px;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:inline-block}',
    '.KKcombos:active{background:rgba(200,168,75,0.15)}',
    // Grid
    '.KKboardWrap{display:flex;justify-content:center;padding:4px 0;overflow-x:auto;-webkit-overflow-scrolling:touch}',
    '.KKgrid{display:inline-grid;gap:1.5px;background:rgba(74,124,53,0.22);border:2px solid rgba(74,124,53,0.35);border-radius:6px;padding:2px;flex-shrink:0}',
    '.KKcell{box-sizing:border-box;position:relative;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif}',
    '.KKcell.black{background:#14100a}',
    '.KKcell.clue{background:#241a10;position:relative;overflow:hidden}',
    '.KKcell.clue::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,transparent calc(50% - 0.6px),rgba(200,168,75,0.38) calc(50% - 0.6px),rgba(200,168,75,0.38) calc(50% + 0.6px),transparent calc(50% + 0.6px))}',
    '.KKclueA{position:absolute;top:3px;right:4px;font-family:DM Mono,monospace;font-size:0.72rem;color:#e0b858;font-weight:700;z-index:2}',
    '.KKclueD{position:absolute;bottom:3px;left:4px;font-family:DM Mono,monospace;font-size:0.72rem;color:#e0b858;font-weight:700;z-index:2}',
    '.KKclueInfo{position:absolute;top:1px;right:1px;font-size:0.64rem;color:rgba(200,168,75,0.7);cursor:pointer;z-index:3;width:12px;height:12px;display:none;align-items:center;justify-content:center}',
    '.KKcell.white{background:rgba(245,240,225,0.9);color:#1a1f17;cursor:pointer;font-size:1.1rem;font-weight:700;-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
    '.KKcell.white.selected{background:rgba(200,168,75,0.42);outline:2px solid #c8a84b;outline-offset:-2px;z-index:3}',
    '.KKcell.white.highlighted{background:rgba(122,179,86,0.28)}',
    '.KKcell.white.error{background:rgba(224,122,122,0.32);color:#a03030}',
    '.KKcell.white.error::after{content:"!";position:absolute;top:1px;right:3px;font-size:0.68rem;font-weight:700;color:#a03030;line-height:1}',
    '.KKcell.white.solved{background:rgba(180,220,150,0.35);color:#1a1f17;animation:kkSolved .5s ease}',
    '.KKpencils{position:absolute;inset:2px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);font-size:0.62rem;color:rgba(122,179,86,0.95);font-family:DM Mono,monospace;font-weight:700;pointer-events:none}',
    '.KKpencils span{display:flex;align-items:center;justify-content:center}',
    // Numpad
    '.KKnumpad{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:6px 2px 4px}',
    '.KKnumBtn{min-height:48px;padding:6px;font-family:Georgia,serif;font-size:1.15rem;font-weight:700;border-radius:8px;background:rgba(26,36,22,0.78);border:1.5px solid rgba(122,179,86,0.3);color:#e8dcc8;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .08s ease,background .12s ease;position:relative}',
    '.KKnumBtn:active{transform:scale(0.95);background:rgba(122,179,86,0.24)}',
    '.KKnumBtn.pencil{background:rgba(58,48,32,0.78);border-color:rgba(200,168,75,0.4);color:#c8a84b;font-size:0.95rem}',
    '.KKnumBtn.erase{color:#e07a7a;border-color:rgba(224,122,122,0.4);font-size:1.2rem}',
    '.KKnumBtn.modeToggle{grid-column:span 5;min-height:38px;font-size:0.78rem;letter-spacing:0.14em;font-family:Bebas Neue,sans-serif;color:#c8a84b;background:rgba(26,36,22,0.55);border-color:rgba(200,168,75,0.3)}',
    '.KKnumBtn.modeToggle.active{background:rgba(200,168,75,0.22);color:#ffdc70;border-color:#c8a84b}',
    // Controls
    '.KKctrls{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;padding:6px 2px}',
    '.KKbtn{min-height:48px;padding:8px 10px;font-family:Georgia,serif;font-size:0.8rem;white-space:nowrap;letter-spacing:0.08em;border-radius:9px;background:rgba(26,31,23,0.8);border:1.5px solid rgba(220,180,120,0.32);color:#e8dcc8;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:4px}',
    '.KKbtn:active{transform:scale(0.96);background:rgba(200,168,75,0.22)}',
    '.KKbtn.primary{background:linear-gradient(180deg,rgba(122,179,86,0.34),rgba(74,124,53,0.4));border-color:rgba(122,179,86,0.55);color:#8fc57a;font-weight:700}',
    '.KKbtn.danger{background:rgba(112,40,40,0.35);border-color:rgba(224,122,122,0.42);color:#ffb3b3}',
    '.KKbtn[disabled]{opacity:0.4;pointer-events:none}',
    // Combinations modal
    '#KKcombosModal{position:fixed;inset:0;z-index:140;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(8,12,6,0.94);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:kkFade .2s ease}',
    '.KKcombosBox{background:linear-gradient(180deg,rgba(26,36,22,0.97),rgba(13,16,12,0.98));border:1.5px solid rgba(200,168,75,0.55);border-radius:12px;padding:14px 16px;max-width:360px;width:100%;max-height:70vh;overflow-y:auto;box-shadow:0 8px 28px rgba(0,0,0,0.7);font-family:Georgia,serif}',
    '.KKcombosTitle{font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.18em;color:#ffdc70;text-align:center;margin-bottom:8px}',
    '.KKcombosSub{font-family:DM Mono,monospace;font-size:0.68rem;color:rgba(232,220,200,0.7);text-align:center;margin-bottom:10px}',
    '.KKcombosList{display:flex;flex-direction:column;gap:5px}',
    '.KKcomboRow{font-family:DM Mono,monospace;font-size:0.78rem;color:#e8dcc8;background:rgba(122,179,86,0.08);padding:4px 8px;border-radius:5px;letter-spacing:0.08em;text-align:center}',
    '.KKcombosClose{width:100%;min-height:48px;margin-top:10px;background:rgba(122,179,86,0.22);border:1.5px solid rgba(122,179,86,0.5);color:#8fc57a;font-family:Bebas Neue,sans-serif;font-size:0.88rem;letter-spacing:0.14em;border-radius:8px;cursor:pointer}',
    // Win card
    '.KKwin{margin:14px auto;max-width:340px;padding:18px;background:linear-gradient(180deg,rgba(20,28,18,0.97),rgba(13,16,12,0.98));border:2px solid rgba(200,168,75,0.55);border-radius:14px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.6);animation:kkFade .3s ease}',
    '.KKwinTitle{font-family:Bebas Neue,sans-serif;font-size:1.55rem;letter-spacing:0.14em;color:#ffdc70;margin-bottom:8px}',
    '.KKwinStats{font-family:DM Mono,monospace;font-size:0.78rem;color:#e8dcc8;margin-bottom:14px;line-height:1.55}',
    '.KKstars{font-size:1.4rem;color:#ffdc70;letter-spacing:0.3em;margin-bottom:6px}'
  ].join('');
  document.head.appendChild(s);
})();

// ── State ───────────────────────────────────────────────────────────────
var S=null;

// DOM refs
var hostEl=null, pan=null, topBar=null, runPanel=null, gridEl=null;
var numpad=null, ctrls=null, winCard=null, combosModal=null;
var topEls={diff:null,time:null,errs:null};
var runEls={h:null,v:null};
var cellEls={};  // cellEls[r+','+c] = DOM node
var timerInterval=null;

// ── Grid helpers ────────────────────────────────────────────────────────
function posKey(r,c){return r+','+c;}
function inBounds(r,c,size){return r>=0&&r<size&&c>=0&&c<size;}
function isWhite(grid,r,c){return inBounds(r,c,grid.length)&&grid[r][c]===-1;}
function isClue(grid,r,c){var v=grid[r] && grid[r][c]; return v && typeof v==='object'&&(v.a!==undefined||v.d!==undefined);}

function getHRun(grid,r,c){
  var size=grid.length, cells=[], sc=c;
  while(sc>0&&grid[r][sc-1]===-1)sc--;
  for(var cc=sc;cc<size&&grid[r][cc]===-1;cc++)cells.push([r,cc]);
  return cells;
}
function getVRun(grid,r,c){
  var size=grid.length, cells=[], sr=r;
  while(sr>0&&grid[sr-1][c]===-1)sr--;
  for(var rr=sr;rr<size&&grid[rr][c]===-1;rr++)cells.push([rr,c]);
  return cells;
}
// Clue for run: cell immediately before run-start. Returns clue object or null.
function findHClue(grid,run){
  if(!run.length)return null;
  var r=run[0][0], c=run[0][1]-1;
  if(c<0)return null;
  var v=grid[r][c];
  if(v&&typeof v==='object'&&v.a!==undefined)return v;
  return null;
}
function findVClue(grid,run){
  if(!run.length)return null;
  var r=run[0][0]-1, c=run[0][1];
  if(r<0)return null;
  var v=grid[r][c];
  if(v&&typeof v==='object'&&v.d!==undefined)return v;
  return null;
}

// ── Backtracking solver with a hard deadline ────────────────────────────
// Fills `player` in place with digits 1-9 satisfying run/clue constraints.
// Respects `deadline` (ms epoch) so no single solve ever locks up the UI.
// If the deadline is hit the solver aborts — callers should treat that
// as "no solution available right now".
var _solveDeadline=0, _solveAborted=false;
function solve(grid,player,randomize,deadline){
  _solveDeadline=deadline||(Date.now()+350);
  _solveAborted=false;
  return _solveInner(grid,player,randomize);
}
function _solveInner(grid,player,randomize){
  if(_solveAborted)return false;
  if(Date.now()>_solveDeadline){_solveAborted=true;return false;}
  var size=grid.length;
  for(var r=0;r<size;r++){
    for(var c=0;c<size;c++){
      if(grid[r][c]!==-1||player[r][c]>0)continue;
      var digits=[1,2,3,4,5,6,7,8,9];
      if(randomize){for(var i=digits.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=digits[i];digits[i]=digits[j];digits[j]=t;}}
      for(var di=0;di<9;di++){
        var n=digits[di];
        if(canAssign(grid,player,r,c,n)){
          player[r][c]=n;
          if(_solveInner(grid,player,randomize))return true;
          player[r][c]=0;
          if(_solveAborted)return false;
        }
      }
      return false;
    }
  }
  return true;
}
function canAssign(grid,player,r,c,n){
  // Horizontal run: dedup always, sum constraints only when clue is set
  // (during generator fill, clues are derived AFTER the fill completes —
  // so hClue will be null here and we rely on dedup alone).
  var hR=getHRun(grid,r,c);
  var hClue=findHClue(grid,hR);
  var used=0, filledAll=true;
  for(var i=0;i<hR.length;i++){
    var pr=hR[i][0], pc=hR[i][1];
    if(pr===r&&pc===c)continue;
    var v=player[pr][pc];
    if(v===n)return false;
    if(v>0)used+=v;
    else filledAll=false;
  }
  if(hClue){
    var sumAfter=used+n;
    if(sumAfter>hClue.a)return false;
    if(filledAll&&sumAfter!==hClue.a)return false;
  }
  var vR=getVRun(grid,r,c);
  var vClue=findVClue(grid,vR);
  var vused=0, vfilled=true;
  for(var j=0;j<vR.length;j++){
    var pr2=vR[j][0], pc2=vR[j][1];
    if(pr2===r&&pc2===c)continue;
    var v2=player[pr2][pc2];
    if(v2===n)return false;
    if(v2>0)vused+=v2;
    else vfilled=false;
  }
  if(vClue){
    var vsum=vused+n;
    if(vsum>vClue.d)return false;
    if(vfilled&&vsum!==vClue.d)return false;
  }
  return true;
}

// ── Puzzle generation from a pattern ─────────────────────────────────────
// Pattern is an array of strings where each char is B/C/W.
// Process:
//  1. Build grid with clue placeholders (zeroed clues).
//  2. Populate clue neighbors by scanning run-starts.
//  3. Random-fill white cells.
//  4. Derive clue values from fill.
function buildGridFromPattern(pattern){
  var size=pattern.length;
  var grid=[];
  for(var r=0;r<size;r++){
    grid[r]=[];
    for(var c=0;c<size;c++){
      var ch=pattern[r][c];
      if(ch==='B')grid[r][c]=0;
      else if(ch==='C')grid[r][c]={};  // placeholder, will fill a/d below
      else grid[r][c]=-1;
    }
  }
  return grid;
}
function isValidPattern(grid){
  // Ensure every white cell has a horizontal AND vertical clue-anchor.
  var size=grid.length;
  for(var r=0;r<size;r++){
    for(var c=0;c<size;c++){
      if(grid[r][c]!==-1)continue;
      var hR=getHRun(grid,r,c);
      var vR=getVRun(grid,r,c);
      if(hR.length<2)return false;
      if(vR.length<2)return false;
      // A clue anchor must be adjacent: row = (r, hR[0][1]-1), col = (vR[0][0]-1, c)
      var hAnchor=[r,hR[0][1]-1], vAnchor=[vR[0][0]-1,c];
      if(hAnchor[1]<0)return false;
      if(vAnchor[0]<0)return false;
      var ha=grid[hAnchor[0]][hAnchor[1]];
      var va=grid[vAnchor[0]][vAnchor[1]];
      if(!ha||typeof ha!=='object')return false;
      if(!va||typeof va!=='object')return false;
    }
  }
  return true;
}
function generatePuzzleFromPattern(pattern){
  var grid=buildGridFromPattern(pattern);
  var size=grid.length;
  if(!isValidPattern(grid))return null;
  // Init empty player
  var player=[];
  for(var r=0;r<size;r++){player[r]=[];for(var c=0;c<size;c++)player[r][c]=0;}
  // Fill
  if(!solve(grid,player,true))return null;
  // Derive clue values from fill
  var seenHStarts={}, seenVStarts={};
  for(var rr=0;rr<size;rr++){
    for(var cc=0;cc<size;cc++){
      if(grid[rr][cc]!==-1)continue;
      var hR=getHRun(grid,rr,cc);
      var hStart=posKey(hR[0][0],hR[0][1]);
      if(!seenHStarts[hStart]){
        seenHStarts[hStart]=true;
        var sumH=0; for(var k=0;k<hR.length;k++)sumH+=player[hR[k][0]][hR[k][1]];
        var anchorH=[hR[0][0],hR[0][1]-1];
        grid[anchorH[0]][anchorH[1]].a=sumH;
      }
      var vR=getVRun(grid,rr,cc);
      var vStart=posKey(vR[0][0],vR[0][1]);
      if(!seenVStarts[vStart]){
        seenVStarts[vStart]=true;
        var sumV=0; for(var k2=0;k2<vR.length;k2++)sumV+=player[vR[k2][0]][vR[k2][1]];
        var anchorV=[vR[0][0]-1,vR[0][1]];
        grid[anchorV[0]][anchorV[1]].d=sumV;
      }
    }
  }
  // Any remaining clue-placeholder with no a/d set → strip to black (this
  // catches decorative-clue cells that happen to have no run).
  for(var rrr=0;rrr<size;rrr++){
    for(var ccc=0;ccc<size;ccc++){
      var v=grid[rrr][ccc];
      if(v&&typeof v==='object'&&v.a===undefined&&v.d===undefined)grid[rrr][ccc]=0;
    }
  }
  return {grid:grid,solution:player,size:size};
}
// Lazy: filter invalid layouts on first use (functions above must exist).
var _validLayouts=null;
function getValidLayouts(){
  if(_validLayouts)return _validLayouts;
  _validLayouts={};
  for(var diff in LAYOUTS){
    _validLayouts[diff]=LAYOUTS[diff].filter(function(p){
      return isValidPattern(buildGridFromPattern(p));
    });
  }
  return _validLayouts;
}
// Fallback chain so every difficulty always gets a playable puzzle.
var DIFF_FALLBACK={master:['master','hard','medium','easy'],hard:['hard','medium','easy'],medium:['medium','easy'],easy:['easy']};
function generatePuzzleForDifficulty(difficulty){
  var pools=getValidLayouts();
  var order=DIFF_FALLBACK[difficulty]||['easy'];
  for(var oi=0;oi<order.length;oi++){
    var pool=pools[order[oi]];
    if(!pool||!pool.length)continue;
    for(var attempts=0;attempts<12;attempts++){
      var pat=pool[Math.floor(Math.random()*pool.length)];
      var p=generatePuzzleFromPattern(pat);
      if(p)return p;
    }
  }
  return null;
}

// ── Combinations table (computed at runtime) ────────────────────────────
function getCombos(sum,cells){
  var out=[];
  function rec(start,remaining,chosen){
    if(chosen.length===cells){
      if(remaining===0)out.push(chosen.slice());
      return;
    }
    for(var d=start;d<=9;d++){
      if(d>remaining)break;
      chosen.push(d);
      rec(d+1,remaining-d,chosen);
      chosen.pop();
    }
  }
  rec(1,sum,[]);
  return out;
}

// ── Game actions ────────────────────────────────────────────────────────
function selectCell(r,c){
  if(!S||S.phase!=='play')return;
  if(S.grid[r][c]!==-1)return;
  S.selected=[r,c];
  refreshCells();
  updateRunPanel();
}
function enterDigit(n){
  if(!S||S.phase!=='play'||!S.selected)return;
  var r=S.selected[0], c=S.selected[1];
  if(S.grid[r][c]!==-1)return;
  if(S.pencilMode){
    togglePencil(r,c,n);
    return;
  }
  var kkChanged=S.player[r][c]!==n;
  var kkConflict=hasConflict(r,c,n);
  if(kkChanged&&kkConflict)S.errors++;
  S.player[r][c]=n;
  for(var i=0;i<9;i++)S.pencils[r][c][i]=false;
  autoEliminatePencils(r,c,n);
  _play('tap');
  if(kkChanged&&!kkConflict)_e('progress');
  refreshCells();
  updateRunPanel();
  updateTop();
  checkWin();
}
function togglePencil(r,c,n){
  if(S.player[r][c]>0)return;  // can't pencil a filled cell
  S.pencils[r][c][n-1]=!S.pencils[r][c][n-1];
  _play('tap');
  refreshCellOnly(r,c);
}
function eraseCell(){
  if(!S||S.phase!=='play'||!S.selected)return;
  var r=S.selected[0], c=S.selected[1];
  if(S.grid[r][c]!==-1)return;
  S.player[r][c]=0;
  for(var i=0;i<9;i++)S.pencils[r][c][i]=false;
  _play('tap');
  refreshCellOnly(r,c);
  updateRunPanel();
}
function togglePencilMode(){
  S.pencilMode=!S.pencilMode;
  updateNumpad();
}
function autoPencilAll(){
  if(!S||S.phase!=='play')return;
  var size=S.grid.length;
  for(var r=0;r<size;r++){
    for(var c=0;c<size;c++){
      if(S.grid[r][c]!==-1||S.player[r][c]>0)continue;
      for(var n=1;n<=9;n++){
        S.pencils[r][c][n-1]=canAssignSoft(r,c,n);
      }
    }
  }
  refreshCells();
}
// Like canAssign but ignores strict over-budget checks so partial pencil
// marks don't vanish when only some cells are filled.
function canAssignSoft(r,c,n){
  var hR=getHRun(S.grid,r,c);
  for(var i=0;i<hR.length;i++){
    var pr=hR[i][0], pc=hR[i][1];
    if(pr===r&&pc===c)continue;
    if(S.player[pr][pc]===n)return false;
  }
  var vR=getVRun(S.grid,r,c);
  for(var j=0;j<vR.length;j++){
    var pr2=vR[j][0], pc2=vR[j][1];
    if(pr2===r&&pc2===c)continue;
    if(S.player[pr2][pc2]===n)return false;
  }
  return true;
}
function autoEliminatePencils(r,c,n){
  var cells=getHRun(S.grid,r,c).concat(getVRun(S.grid,r,c));
  cells.forEach(function(p){
    if(p[0]===r&&p[1]===c)return;
    S.pencils[p[0]][p[1]][n-1]=false;
  });
}

// Hint: reveal the selected cell.
//
// Fast path: if all of the player's filled cells already match the
// generator's solution, the generator's solution is still reachable
// from their state — reveal from there (O(n) check, no solver call).
//
// Slow path: player has placed a digit that diverges from the stored
// solution (allowed because some puzzles have multiple valid fills).
// Re-solve from their state with a strict deadline so the UI can't
// freeze; if that aborts, reveal from the stored solution anyway with
// a nudge about the conflict.
function useHint(){
  if(!S||S.phase!=='play')return;
  if(S.hints<=0){sm('No hints left');return;}
  if(!S.selected){sm('Tap a cell to hint');return;}
  var r=S.selected[0], c=S.selected[1];
  if(S.grid[r][c]!==-1){sm('Tap a white cell');return;}
  var size=S.grid.length;
  var agrees=true;
  for(var rr=0;rr<size&&agrees;rr++){
    for(var cc=0;cc<size;cc++){
      if(S.grid[rr][cc]!==-1)continue;
      var pv=S.player[rr][cc];
      if(pv>0 && pv!==S.solution[rr][cc]){agrees=false;break;}
    }
  }
  var hintVal;
  if(agrees){
    hintVal=S.solution[r][c];
  } else {
    var snap=[];
    for(var rrr=0;rrr<size;rrr++)snap[rrr]=S.player[rrr].slice();
    snap[r][c]=0;
    if(solve(S.grid,snap,false)){
      hintVal=snap[r][c];
    } else {
      hintVal=S.solution[r][c];
      sm('Your path differs from mine, the hint may conflict with other cells');
    }
  }
  if(S.player[r][c]===hintVal){sm('Already correct');return;}
  S.player[r][c]=hintVal;
  for(var i=0;i<9;i++)S.pencils[r][c][i]=false;
  autoEliminatePencils(r,c,hintVal);
  S.hints--;
  _play('tap');
  refreshCells();
  updateRunPanel();
  updateTop();
  updateControls();
  checkWin();
}

function checkWin(){
  var size=S.grid.length;
  for(var r=0;r<size;r++){
    for(var c=0;c<size;c++){
      if(S.grid[r][c]!==-1)continue;
      var v=S.player[r][c];
      if(v<1||v>9)return;
    }
  }
  // Verify no conflicts + correct sums for every run
  var seenHStarts={}, seenVStarts={};
  for(var rr=0;rr<size;rr++){
    for(var cc=0;cc<size;cc++){
      if(S.grid[rr][cc]!==-1)continue;
      var hR=getHRun(S.grid,rr,cc);
      var hKey=posKey(hR[0][0],hR[0][1]);
      if(!seenHStarts[hKey]){
        seenHStarts[hKey]=true;
        var clueH=findHClue(S.grid,hR);
        var used={},sum=0;
        for(var i=0;i<hR.length;i++){var v=S.player[hR[i][0]][hR[i][1]];if(used[v])return;used[v]=true;sum+=v;}
        if(clueH&&sum!==clueH.a)return;
      }
      var vR=getVRun(S.grid,rr,cc);
      var vKey=posKey(vR[0][0],vR[0][1]);
      if(!seenVStarts[vKey]){
        seenVStarts[vKey]=true;
        var clueV=findVClue(S.grid,vR);
        var used2={},sum2=0;
        for(var j=0;j<vR.length;j++){var vv=S.player[vR[j][0]][vR[j][1]];if(used2[vv])return;used2[vv]=true;sum2+=vv;}
        if(clueV&&sum2!==clueV.d)return;
      }
    }
  }
  // Win!
  S.phase='won';
  stopTimer();
  updateControls();
  _e('game_win'); _playWin();
  var elapsed=Math.round((Date.now()-S.startTime)/1000);
  var stars=(S.errors===0&&S.hints===DIFF_META[S.difficulty].hints)?3:(S.errors===0?2:1);
  // Save best time
  var bestKey='lw_kakuro_best_'+S.difficulty;
  var prev=parseInt(localStorage.getItem(bestKey)||'9999',10);
  var isNewBest=elapsed<prev;
  if(isNewBest)try{localStorage.setItem(bestKey,String(elapsed));}catch(e){}
  _sr('kakuro',{w:true,s:Math.max(100,1000-elapsed*2)+stars*100,stars:stars});
  sm('Solved! '+elapsed+'s · '+stars+'⭐');
  // (duplicate game_win/_playWin + a puzzle_solved that isn't in kakuro's
  // payout row used to fire here — double celebration, wasted cap slot)
  showWinCard(elapsed, stars, isNewBest);
}

// ── Rendering ───────────────────────────────────────────────────────────
function buildDOM(a){
  pan=document.createElement('div'); pan.id='KKpan'; a.appendChild(pan);
  // Top bar
  topBar=document.createElement('div'); topBar.className='KKtop'; pan.appendChild(topBar);
  topBar.innerHTML=
    '<div class="KKtopCell"><div class="KKtopLbl">DIFFICULTY</div><div class="KKtopVal" id="KKdiff">·</div></div>'+
    '<div class="KKtopCell"><div class="KKtopLbl">TIME</div><div class="KKtopVal" id="KKtime">0:00</div></div>'+
    '<div class="KKtopCell"><div class="KKtopLbl">ERRORS</div><div class="KKtopVal" id="KKerrs">0</div></div>';
  topEls.diff=topBar.querySelector('#KKdiff');
  topEls.time=topBar.querySelector('#KKtime');
  topEls.errs=topBar.querySelector('#KKerrs');
  // Active-run readout
  runPanel=document.createElement('div'); runPanel.className='KKrun'; pan.appendChild(runPanel);
  runPanel.innerHTML=
    '<div class="KKrunCell" data-dir="h"><div class="KKrunLbl">ROW</div><div class="KKrunFrac">·</div><div class="KKrunNeed"></div><div class="KKcombos" style="display:none">Show options</div></div>'+
    '<div class="KKrunCell" data-dir="v"><div class="KKrunLbl">COLUMN</div><div class="KKrunFrac">·</div><div class="KKrunNeed"></div><div class="KKcombos" style="display:none">Show options</div></div>';
  runEls.h=runPanel.querySelector('[data-dir="h"]');
  runEls.v=runPanel.querySelector('[data-dir="v"]');
  runPanel.addEventListener('click', function(e){
    var tgt=e.target.closest('.KKcombos');
    if(!tgt)return;
    var cell=tgt.closest('.KKrunCell');
    if(!cell)return;
    var dir=cell.getAttribute('data-dir');
    showCombosForSelected(dir);
  });
  // Board
  var bw=document.createElement('div'); bw.className='KKboardWrap'; pan.appendChild(bw);
  gridEl=document.createElement('div'); gridEl.className='KKgrid'; bw.appendChild(gridEl);
  gridEl.addEventListener('click', function(e){
    var cell=e.target.closest('[data-r]');
    if(!cell)return;
    var r=parseInt(cell.getAttribute('data-r'),10);
    var c=parseInt(cell.getAttribute('data-c'),10);
    if(cell.classList.contains('clue')){
      var dir = e.target.classList && e.target.classList.contains('KKclueInfo') ? 'clue' : null;
      // Tap anywhere on a clue cell opens combos
      var v=S.grid[r][c];
      if(v&&typeof v==='object'){
        if(v.a!==undefined||v.d!==undefined){
          openClueCombos(r,c);
        }
      }
      return;
    }
    if(cell.classList.contains('white'))selectCell(r,c);
  });
  // Numpad
  numpad=document.createElement('div'); numpad.className='KKnumpad'; pan.appendChild(numpad);
  // Controls
  ctrls=document.createElement('div'); ctrls.className='KKctrls'; pan.appendChild(ctrls);
}

function buildGridCells(){
  if(!gridEl)return;
  cellEls={};
  var size=S.grid.length;
  // Fill the viewport: derive cellSize so the full grid uses available width.
  // Account for 1.5px gaps between cells + 4px internal padding + 4px wrapper.
  var availW=Math.min(window.innerWidth-24, 560);
  var gapsAndPad=1.5*(size-1)+8;
  var cellSize=Math.floor((availW-gapsAndPad)/size);
  if(cellSize<40)cellSize=40;       // 40px min so touch targets feel tappable; .KKboardWrap horizontal-scrolls if grid overflows on narrow phones
  if(cellSize>64)cellSize=64;       // cap on wide screens
  gridEl.style.gridTemplateColumns='repeat('+size+','+cellSize+'px)';
  gridEl.innerHTML='';
  for(var r=0;r<size;r++){
    for(var c=0;c<size;c++){
      var cell=S.grid[r][c];
      var el=document.createElement('div');
      el.style.width=cellSize+'px'; el.style.height=cellSize+'px';
      el.setAttribute('data-r',r); el.setAttribute('data-c',c);
      if(cell===0){
        el.className='KKcell black';
      } else if(cell && typeof cell==='object' && (cell.a!==undefined||cell.d!==undefined)){
        el.className='KKcell clue';
        if(cell.a!==undefined){var a=document.createElement('div');a.className='KKclueA';a.textContent=cell.a;el.appendChild(a);}
        if(cell.d!==undefined){var d=document.createElement('div');d.className='KKclueD';d.textContent=cell.d;el.appendChild(d);}
      } else {
        el.className='KKcell white';
      }
      cellEls[posKey(r,c)]=el;
      gridEl.appendChild(el);
    }
  }
  refreshCells();
}

function refreshCellOnly(r,c){
  var el=cellEls[posKey(r,c)];
  if(!el)return;
  var val=S.player[r][c];
  var isSel=S.selected&&S.selected[0]===r&&S.selected[1]===c;
  var isHl=isCellHighlighted(r,c);
  var conflict=val>0&&hasConflict(r,c,val);
  el.className='KKcell white'+(isSel?' selected':'')+(isHl?' highlighted':'')+(conflict?' error':'');
  var inner='';
  if(val>0){
    inner=String(val);
  } else {
    var hasP=false; for(var i=0;i<9;i++)if(S.pencils[r][c][i]){hasP=true;break;}
    if(hasP){
      inner='<div class="KKpencils">';
      for(var n=1;n<=9;n++)inner+='<span>'+(S.pencils[r][c][n-1]?n:'')+'</span>';
      inner+='</div>';
    }
  }
  el.innerHTML=inner;
}

function refreshCells(){
  var size=S.grid.length;
  for(var r=0;r<size;r++){
    for(var c=0;c<size;c++){
      if(S.grid[r][c]!==-1)continue;
      refreshCellOnly(r,c);
    }
  }
}

function isCellHighlighted(r,c){
  if(!S.selected)return false;
  var sr=S.selected[0], sc=S.selected[1];
  if(sr===r&&sc===c)return false;
  if(S.grid[r][c]!==-1)return false;
  // Same horizontal run?
  var hR=getHRun(S.grid,sr,sc);
  for(var i=0;i<hR.length;i++)if(hR[i][0]===r&&hR[i][1]===c)return true;
  var vR=getVRun(S.grid,sr,sc);
  for(var j=0;j<vR.length;j++)if(vR[j][0]===r&&vR[j][1]===c)return true;
  return false;
}

function hasConflict(r,c,val){
  var hR=getHRun(S.grid,r,c);
  for(var i=0;i<hR.length;i++){
    var pr=hR[i][0], pc=hR[i][1];
    if(pr===r&&pc===c)continue;
    if(S.player[pr][pc]===val)return true;
  }
  var vR=getVRun(S.grid,r,c);
  for(var j=0;j<vR.length;j++){
    var pr2=vR[j][0], pc2=vR[j][1];
    if(pr2===r&&pc2===c)continue;
    if(S.player[pr2][pc2]===val)return true;
  }
  return false;
}

function updateRunPanel(){
  if(!runPanel)return;
  if(!S||!S.selected){
    runEls.h.querySelector('.KKrunFrac').textContent='·';
    runEls.h.querySelector('.KKrunNeed').textContent='Tap a cell';
    runEls.h.querySelector('.KKcombos').style.display='none';
    runEls.v.querySelector('.KKrunFrac').textContent='·';
    runEls.v.querySelector('.KKrunNeed').textContent='';
    runEls.v.querySelector('.KKcombos').style.display='none';
    return;
  }
  var r=S.selected[0], c=S.selected[1];
  // Horizontal
  var hR=getHRun(S.grid,r,c);
  var hClue=findHClue(S.grid,hR);
  renderRunCell(runEls.h, hR, hClue, 'a');
  // Vertical
  var vR=getVRun(S.grid,r,c);
  var vClue=findVClue(S.grid,vR);
  renderRunCell(runEls.v, vR, vClue, 'd');
}

function renderRunCell(cellEl, run, clue, clueKey){
  var fracEl=cellEl.querySelector('.KKrunFrac');
  var needEl=cellEl.querySelector('.KKrunNeed');
  var combosEl=cellEl.querySelector('.KKcombos');
  if(!clue){
    fracEl.textContent='·'; needEl.textContent='no clue'; combosEl.style.display='none';
    fracEl.className='KKrunFrac';
    return;
  }
  var clueVal=clue[clueKey];
  var sum=0, filled=0, total=run.length;
  for(var i=0;i<run.length;i++){
    var v=S.player[run[i][0]][run[i][1]];
    if(v>0){sum+=v;filled++;}
  }
  var empty=total-filled;
  var missing=clueVal-sum;
  fracEl.textContent=sum+' / '+clueVal;
  fracEl.className='KKrunFrac'+(empty===0&&sum===clueVal?' done':'')+(sum>clueVal?' over':'');
  if(empty===0){
    needEl.textContent=(sum===clueVal)?'complete':'off by '+(sum-clueVal);
  } else {
    needEl.textContent='need '+missing+' in '+empty+' cell'+(empty>1?'s':'');
  }
  combosEl.style.display='block';
  combosEl.textContent=empty>0?'Show options':'Show combos';
}

function updateNumpad(){
  if(!numpad)return;
  var pencilActive=S.pencilMode;
  var html='';
  html+='<button class="KKnumBtn modeToggle'+(pencilActive?' active':'')+'" data-act="mode">'+(pencilActive?'✎ PENCIL · ON':'✎ PENCIL · OFF')+'</button>';
  for(var n=1;n<=9;n++){
    html+='<button class="KKnumBtn'+(pencilActive?' pencil':'')+'" data-n="'+n+'">'+n+'</button>';
  }
  html+='<button class="KKnumBtn erase" data-act="erase">✕</button>';
  numpad.innerHTML=html;
  // Wire
  numpad.onclick=function(e){
    var btn=e.target.closest('button');
    if(!btn)return;
    var act=btn.getAttribute('data-act');
    if(act==='mode'){togglePencilMode();return;}
    if(act==='erase'){eraseCell();return;}
    var n=parseInt(btn.getAttribute('data-n'),10);
    if(n>=1&&n<=9)enterDigit(n);
  };
}

function updateControls(){
  if(!ctrls)return;
  ctrls.innerHTML='';
  if(S.phase==='won')return;
  ctrls.appendChild(mkBtn('💡 HINT ('+S.hints+')','default',useHint,S.hints<=0));
  ctrls.appendChild(mkBtn('AUTO ✎','default',autoPencilAll));
  ctrls.appendChild(mkBtn('↻ NEW','default',function(){ requestNewGame(); }));
}

function mkBtn(label, style, onClick, disabled){
  var b=document.createElement('button'); b.className='KKbtn';
  if(style==='primary')b.className+=' primary';
  else if(style==='danger')b.className+=' danger';
  b.textContent=label;
  if(disabled)b.disabled=true;
  b.addEventListener('click', function(e){ e.preventDefault(); onClick(); });
  return b;
}

function updateTop(){
  if(!topEls.diff)return;
  topEls.diff.textContent=(DIFF_META[S.difficulty]||{}).label||'·';
  topEls.errs.textContent=S.errors;
}

function fmtTime(sec){
  var m=Math.floor(sec/60), s=sec%60;
  return m+':'+(s<10?'0':'')+s;
}

function startTimer(){
  stopTimer();
  timerInterval=setInterval(function(){
    if(!S||S.phase==='won')return;
    var elapsed=Math.round((Date.now()-S.startTime)/1000);
    if(topEls.time)topEls.time.textContent=fmtTime(elapsed);
  }, 500);
}
function stopTimer(){
  if(timerInterval){clearInterval(timerInterval);timerInterval=null;}
}

// ── Combinations modal ──────────────────────────────────────────────────
function openClueCombos(r,c){
  var v=S.grid[r][c];
  if(!v||typeof v!=='object')return;
  // Figure out which runs this clue anchors + their lengths
  var parts=[];
  if(v.a!==undefined){
    // Across: first white cell is (r, c+1). Count white cells.
    var cells=0, cc=c+1;
    while(cc<S.grid.length&&S.grid[r][cc]===-1){cells++;cc++;}
    if(cells>=1)parts.push({dir:'Across',sum:v.a,cells:cells});
  }
  if(v.d!==undefined){
    var rcount=0, rr=r+1;
    while(rr<S.grid.length&&S.grid[rr][c]===-1){rcount++;rr++;}
    if(rcount>=1)parts.push({dir:'Down',sum:v.d,cells:rcount});
  }
  if(!parts.length)return;
  showCombosModal(parts);
}
function showCombosForSelected(dir){
  if(!S.selected)return;
  var r=S.selected[0], c=S.selected[1];
  var run, clue, clueKey, label;
  if(dir==='h'){run=getHRun(S.grid,r,c);clue=findHClue(S.grid,run);clueKey='a';label='Row';}
  else{run=getVRun(S.grid,r,c);clue=findVClue(S.grid,run);clueKey='d';label='Column';}
  if(!clue)return;
  // Build combos filtered by already-placed digits in the run
  var usedDigits={};
  var sumSoFar=0;
  for(var i=0;i<run.length;i++){
    var v=S.player[run[i][0]][run[i][1]];
    if(v>0){usedDigits[v]=true;sumSoFar+=v;}
  }
  var remaining=clue[clueKey]-sumSoFar;
  var emptyCells=run.length-Object.keys(usedDigits).length;
  var allCombos=getCombos(clue[clueKey], run.length);
  // Filter: keep combos that contain all usedDigits
  var usedKeys=Object.keys(usedDigits).map(function(k){return parseInt(k,10);});
  var filtered=allCombos.filter(function(combo){
    return usedKeys.every(function(d){return combo.indexOf(d)>=0;});
  });
  showCombosModal([{dir:label,sum:clue[clueKey],cells:run.length,combos:filtered,usedDigits:usedKeys}]);
}
function showCombosModal(parts){
  closeCombosModal();
  combosModal=document.createElement('div'); combosModal.id='KKcombosModal';
  var box=document.createElement('div'); box.className='KKcombosBox';
  var inner='';
  parts.forEach(function(p){
    var combos=p.combos||getCombos(p.sum,p.cells);
    inner+='<div class="KKcombosTitle">'+p.dir+' · '+p.sum+' in '+p.cells+'</div>';
    if(combos.length===0){
      inner+='<div class="KKcombosSub" style="color:#e07a7a">No valid combinations (over-constrained)</div>';
    } else {
      inner+='<div class="KKcombosSub">'+combos.length+' possible set'+(combos.length===1?'':'s')+'</div>';
      inner+='<div class="KKcombosList">';
      combos.forEach(function(combo){
        var cells=combo.map(function(d){
          if(p.usedDigits && p.usedDigits.indexOf(d)>=0) return '<span style="color:#c8a84b">'+d+'</span>';
          return d;
        }).join(' · ');
        inner+='<div class="KKcomboRow">'+cells+'</div>';
      });
      inner+='</div>';
    }
  });
  inner+='<button class="KKcombosClose">CLOSE</button>';
  box.innerHTML=inner;
  combosModal.appendChild(box);
  document.body.appendChild(combosModal);
  box.querySelector('.KKcombosClose').addEventListener('click', closeCombosModal);
  combosModal.addEventListener('click', function(e){ if(e.target===combosModal)closeCombosModal(); });
}
function closeCombosModal(){
  if(combosModal){combosModal.remove();combosModal=null;}
}

// ── Win card ────────────────────────────────────────────────────────────
function showWinCard(elapsed, stars, isNewBest){
  if(winCard){winCard.remove();}
  winCard=document.createElement('div'); winCard.className='KKwin';
  var starsStr=''; for(var i=0;i<3;i++)starsStr+=(i<stars?'★':'☆');
  var bestKey='lw_kakuro_best_'+S.difficulty;
  var best=parseInt(localStorage.getItem(bestKey)||'9999',10);
  var bestStr=(best>=9999)?'none yet':fmtTime(best);
  winCard.innerHTML=
    '<div class="KKwinTitle">GARDEN SOLVED</div>'+
    '<div class="KKstars">'+starsStr+'</div>'+
    '<div class="KKwinStats">Time '+fmtTime(elapsed)+(isNewBest?'  <span style="color:#ffdc70">★ new best</span>':'  ·  best '+bestStr)+'<br>Errors '+S.errors+'  ·  Hints used '+(DIFF_META[S.difficulty].hints-S.hints)+'</div>';
  winCard.appendChild(mkBtn('↻ NEXT PUZZLE','primary',function(){ startGame(S.difficulty); }));
  pan.appendChild(winCard);
  if(winCard.scrollIntoView)winCard.scrollIntoView({behavior:'smooth',block:'center'});
}

// ── Difficulty picker ───────────────────────────────────────────────────
function showDifficultyPicker(){
  if(pan){pan.innerHTML='';}
  else { pan=document.createElement('div'); pan.id='KKpan'; hostEl.appendChild(pan); }
  var overlay=document.createElement('div'); overlay.className='KKdiffPick'; pan.appendChild(overlay);
  var diffs=['easy','medium','hard','master'];
  var btnsHtml='';
  diffs.forEach(function(d){
    var meta=DIFF_META[d];
    var bestKey='lw_kakuro_best_'+d;
    var best=parseInt(localStorage.getItem(bestKey)||'9999',10);
    var bestStr=(best>=9999)?'none yet':fmtTime(best);
    btnsHtml+='<button class="KKdiffBtn" data-diff="'+d+'"><div class="KKdlv"><span>'+meta.label+'</span><span class="KKdiffBest">best '+bestStr+'</span></div><div class="KKdsub">'+meta.sub+'</div></button>';
  });
  overlay.innerHTML=
    '<div class="KKdiffTitle">GARDEN SUMS</div>'+
    '<div class="KKdiffSub">Fill the white plots with digits 1-9. Each row and column run must sum to its clue, with no repeats.</div>'+
    '<div class="KKdiffBtns">'+btnsHtml+'</div>';
  overlay.addEventListener('click', function(e){
    var btn=e.target.closest('[data-diff]');
    if(!btn)return;
    startGame(btn.getAttribute('data-diff'));
  });
}

// ── Lifecycle ───────────────────────────────────────────────────────────
function requestNewGame(){
  if(S)S.phase='idle';
  stopTimer();
  if(winCard){winCard.remove();winCard=null;}
  closeCombosModal();
  showDifficultyPicker();
}

function startGame(difficulty){
  var p=generatePuzzleForDifficulty(difficulty);
  if(!p){sm('Could not generate puzzle');return;}
  _setDiff(difficulty);
  var size=p.size;
  S={
    difficulty:difficulty,
    grid:p.grid,
    solution:p.solution,
    player:[],
    pencils:[],
    selected:null,
    pencilMode:false,
    errors:0,
    hints:DIFF_META[difficulty].hints,
    startTime:Date.now(),
    phase:'play'
  };
  for(var r=0;r<size;r++){
    S.player[r]=[]; S.pencils[r]=[];
    for(var c=0;c<size;c++){
      S.player[r][c]=0;
      S.pencils[r][c]=[false,false,false,false,false,false,false,false,false];
    }
  }
  if(pan){pan.remove();pan=null;}
  buildDOM(hostEl);
  buildGridCells();
  updateTop();
  updateNumpad();
  updateControls();
  updateRunPanel();
  startTimer();
}

window._gameFns = window._gameFns || {};
window._gameFns.kakuro = function(a){
  // Sweep any stale combos overlay left behind by a previous mount (the
  // module-level combosModal ref gets wiped below, so id-lookup is the
  // only way back to an orphan).
  var kkStaleModal=document.getElementById('KKcombosModal');
  if(kkStaleModal)kkStaleModal.remove();
  // Reset refs
  pan=null; topBar=null; runPanel=null; gridEl=null; numpad=null; ctrls=null;
  winCard=null; combosModal=null;
  topEls={diff:null,time:null,errs:null};
  runEls={h:null,v:null};
  cellEls={};
  stopTimer();
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    try{stopTimer();}catch(e){}
    try{closeCombosModal();}catch(e){}
    try{var m=document.getElementById('KKcombosModal'); if(m)m.remove();}catch(e){}
  });
  hostEl=a;
  showDifficultyPicker();
};
})();
