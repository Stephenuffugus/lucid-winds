// ═══ ROOT FLOW — Flow Free rebuild ═══
// Canonical fill-every-cell rules. Puzzles are procedurally generated
// via snake-carving (random path growth) so every puzzle is solvable
// by construction — the generator's fill IS a valid solution. Five
// difficulty tiers. Delta render. Hint reveals one color's path.
(function(){
'use strict';
var LWG=window._G;
var _e=LWG.e,_play=LWG.play,_playWin=LWG.playWin,_setDiff=LWG.setDiff,sm=LWG.sm,_sr=LWG.sr;

// ── Config ──────────────────────────────────────────────────────────────
var COLORS=[
  '#E07A7A','#6BAD4A','#5B9BD5','#D4A843','#E08A4A',
  '#B578C2','#6BC7D4','#E8A0BF','#E8DCC8','#8B5A2B'
];
var TIERS={
  seedling:{size:5,pairs:3,label:'SEEDLING',sub:'5×5, 3 paths',hints:3},
  sprout:{size:6,pairs:4,label:'SPROUT',sub:'6×6, 4 paths',hints:3},
  sapling:{size:7,pairs:5,label:'SAPLING',sub:'7×7, 5 paths',hints:2},
  mature:{size:8,pairs:7,label:'MATURE',sub:'8×8, 7 paths',hints:2},
  keeper:{size:9,pairs:8,label:'KEEPER',sub:'9×9, 8 paths',hints:1}
};

// ── Styles ──────────────────────────────────────────────────────────────
(function injectStyle(){
  if(document.getElementById('rf-style'))return;
  var s=document.createElement('style');s.id='rf-style';
  s.textContent=[
    '@keyframes rfFade{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes rfPop{0%{transform:scale(0.5);opacity:0}55%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes rfGlow{0%,100%{box-shadow:0 0 14px var(--rfc,rgba(255,216,106,0.6))}50%{box-shadow:0 0 24px var(--rfc,rgba(255,216,106,0.9))}}',
    '#RFpan{max-width:min(100vw,560px);margin:0 auto;padding:6px;user-select:none;-webkit-user-select:none;box-sizing:border-box;font-family:Georgia,serif;animation:rfFade .3s ease}',
    // Tier picker
    '.RFtierPick{display:flex;flex-direction:column;align-items:center;gap:14px;padding:26px 12px 14px;animation:rfFade .3s ease}',
    '.RFtierTitle{font-family:Bebas Neue,sans-serif;font-size:1.7rem;letter-spacing:0.22em;color:#c8a84b}',
    '.RFtierSub{font-family:Georgia,serif;font-size:0.78rem;color:rgba(232,220,200,0.72);text-align:center;max-width:320px;line-height:1.5}',
    '.RFtierBtns{display:flex;flex-direction:column;gap:8px;width:100%;max-width:280px;margin-top:10px}',
    '.RFtierBtn{min-height:58px;padding:10px 14px;border-radius:12px;background:rgba(26,36,22,0.85);border:1.5px solid rgba(122,179,86,0.35);color:#e8dcc8;font-family:Georgia,serif;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;flex-direction:column;align-items:flex-start;gap:2px}',
    '.RFtierBtn:active{transform:scale(0.98);background:rgba(122,179,86,0.22)}',
    '.RFtierBtn .RFtlv{font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.18em;color:#c8a84b;display:flex;justify-content:space-between;width:100%}',
    '.RFtierBtn .RFtsub{font-size:0.68rem;color:rgba(232,220,200,0.75)}',
    '.RFtierSolved{font-family:DM Mono,monospace;font-size:0.62rem;color:#8fc57a;letter-spacing:0.04em}',
    // Top bar
    '.RFtop{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px;padding:7px 8px;margin:2px 0 6px;background:linear-gradient(135deg,rgba(26,31,23,0.85),rgba(13,16,12,0.92));border:1.5px solid rgba(122,179,86,0.25);border-radius:10px;font-family:Bebas Neue,sans-serif}',
    '.RFtopCell{text-align:center}',
    '.RFtopLbl{font-size:0.55rem;letter-spacing:0.16em;color:rgba(232,220,200,0.55)}',
    '.RFtopVal{font-family:DM Mono,monospace;font-size:0.82rem;color:#c8a84b;font-weight:700;margin-top:1px}',
    '.RFstatus{text-align:center;font-family:Georgia,serif;font-size:0.78rem;color:#e8dcc8;padding:2px 0 6px}',
    '.RFstatus em{color:#c8a84b;font-style:normal;font-weight:700}',
    // Board
    '.RFboardWrap{display:flex;justify-content:center;padding:4px 0}',
    '.RFgrid{display:inline-grid;gap:3px;background:rgba(13,16,12,0.55);border:2px solid rgba(74,124,53,0.3);border-radius:10px;padding:6px;touch-action:none}',
    '.RFcell{box-sizing:border-box;border-radius:5px;position:relative;background:rgba(13,16,12,0.5);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:none}',
    '.RFcell.filled{border-radius:4px}',
    '.RFcell.dot{border-radius:50%;border:2.5px solid rgba(0,0,0,0.35);box-shadow:0 0 10px var(--rfc,transparent),inset 0 2px 0 rgba(255,255,255,0.18),inset 0 -2px 0 rgba(0,0,0,0.22)}',
    '.RFcell.dot.drawing{animation:rfGlow 1s ease-in-out infinite}',
    '.RFcell.connected{box-shadow:0 0 12px var(--rfc,transparent),inset 0 2px 0 rgba(255,255,255,0.18),inset 0 -2px 0 rgba(0,0,0,0.22)}',
    // Progress pips
    '.RFprog{display:flex;justify-content:center;gap:6px;padding:4px 0}',
    '.RFpip{width:14px;height:14px;border-radius:50%;background:rgba(40,48,36,0.8);border:1.5px solid rgba(74,124,53,0.3);transition:transform .2s ease,box-shadow .2s ease}',
    '.RFpip.on{background:var(--rfc,#8fc57a);border-color:transparent;transform:scale(1.15);box-shadow:0 0 6px var(--rfc,rgba(255,216,106,0.6))}',
    // Controls
    '.RFctrls{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;padding:6px 2px}',
    '.RFbtn{min-height:44px;padding:8px 10px;font-family:Georgia,serif;font-size:0.74rem;letter-spacing:0.1em;border-radius:9px;background:rgba(26,31,23,0.8);border:1.5px solid rgba(220,180,120,0.32);color:#e8dcc8;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:4px}',
    '.RFbtn:active{transform:scale(0.96);background:rgba(200,168,75,0.2)}',
    '.RFbtn.primary{background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border-color:rgba(122,179,86,0.55);color:#8fc57a;font-weight:700}',
    '.RFbtn[disabled]{opacity:0.4;pointer-events:none}',
    // Win card
    '.RFwin{margin:14px auto;max-width:340px;padding:18px;background:linear-gradient(180deg,rgba(20,28,18,0.97),rgba(13,16,12,0.98));border:2px solid rgba(200,168,75,0.55);border-radius:14px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.6);animation:rfPop .32s cubic-bezier(.2,1.2,.3,1) both}',
    '.RFwinTitle{font-family:Bebas Neue,sans-serif;font-size:1.55rem;letter-spacing:0.14em;color:#ffdc70;margin-bottom:8px}',
    '.RFwinStats{font-family:DM Mono,monospace;font-size:0.82rem;color:#e8dcc8;margin-bottom:14px;line-height:1.55}'
  ].join('');
  document.head.appendChild(s);
})();

// ── State ───────────────────────────────────────────────────────────────
var S=null;
var hostEl=null, pan=null, topBar=null, statusEl=null, progEl=null, gridEl=null, ctrlRow=null, winCard=null;
var topEls={tier:null,puzzle:null,time:null,hints:null};
var cellEls={};
var timerInterval=null;
var drawingStateCaptured=false;

// ── Generator (snake-carving) ──────────────────────────────────────────
function generatePuzzle(size,pairs,maxAttempts){
  maxAttempts=maxAttempts||1500;
  for(var a=0;a<maxAttempts;a++){
    var p=genAttempt(size,pairs);
    if(p)return p;
  }
  return null;
}

function genAttempt(size,pairs){
  var grid=[], paths=[];
  for(var r=0;r<size;r++){grid[r]=[];for(var c=0;c<size;c++)grid[r][c]=-1;}
  var cells=[];
  for(var r2=0;r2<size;r2++)for(var c2=0;c2<size;c2++)cells.push([r2,c2]);
  for(var i=cells.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=cells[i];cells[i]=cells[j];cells[j]=t;}
  for(var p=0;p<pairs;p++){
    var seed=cells.shift();
    grid[seed[0]][seed[1]]=p;
    paths.push([[seed[0],seed[1]]]);
  }
  var remaining=size*size-pairs;
  while(remaining>0){
    var advanced=false;
    var order=[];for(var k=0;k<pairs;k++)order.push(k);
    for(var kk=order.length-1;kk>0;kk--){var jj=Math.floor(Math.random()*(kk+1));var tt=order[kk];order[kk]=order[jj];order[jj]=tt;}
    for(var oi=0;oi<order.length;oi++){
      var cc=order[oi];
      var h=paths[cc][paths[cc].length-1];
      var dirs=[[0,1],[0,-1],[1,0],[-1,0]];
      for(var di=dirs.length-1;di>0;di--){var dj=Math.floor(Math.random()*(di+1));var dt=dirs[di];dirs[di]=dirs[dj];dirs[dj]=dt;}
      for(var d=0;d<dirs.length;d++){
        var nr=h[0]+dirs[d][0], nc=h[1]+dirs[d][1];
        if(nr<0||nr>=size||nc<0||nc>=size)continue;
        if(grid[nr][nc]!==-1)continue;
        grid[nr][nc]=cc;
        paths[cc].push([nr,nc]);
        remaining--;
        advanced=true;
        break;
      }
    }
    if(!advanced)return null;
  }
  for(var p2=0;p2<pairs;p2++) if(paths[p2].length<2) return null;
  var dots=[];
  paths.forEach(function(path, idx){
    dots.push([path[0][0], path[0][1], idx]);
    dots.push([path[path.length-1][0], path[path.length-1][1], idx]);
  });
  return {size:size, pairs:pairs, dots:dots, solution:grid, solutionPaths:paths};
}

// ── Game actions ────────────────────────────────────────────────────────
function startPath(r,c){
  if(!S||S.phase!=='play')return;
  var cell=S.cells[r][c];
  if(!cell || !cell.isDot)return;
  // Clear any existing path of this color
  clearColor(cell.color);
  S.drawing={color:cell.color, points:[[r,c]]};
  S.cells[r][c].color=cell.color;
  S.cells[r][c].pathIdx=0;
  refreshColor(cell.color);
}

function extendPath(r,c){
  if(!S||!S.drawing)return;
  if(r<0||r>=S.size||c<0||c>=S.size)return;
  var points=S.drawing.points;
  var last=points[points.length-1];
  if(last[0]===r&&last[1]===c)return;
  var dist=Math.abs(r-last[0])+Math.abs(c-last[1]);
  if(dist!==1)return;
  // Backtrack: revisit within current path truncates
  for(var i=0;i<points.length;i++){
    if(points[i][0]===r&&points[i][1]===c){
      for(var j=i+1;j<points.length;j++){
        var p=points[j];
        S.cells[p[0]][p[1]].color=null;
        S.cells[p[0]][p[1]].pathIdx=-1;
      }
      points.length=i+1;
      refreshColor(S.drawing.color);
      return;
    }
  }
  var target=S.cells[r][c];
  // Refuse entering another color's dot
  if(target.isDot && target.color!==S.drawing.color)return;
  // If entering another color's path cells, clear that color's path
  if(target.color!==null && target.color!==S.drawing.color){
    var displaced=target.color;
    clearColor(displaced);
    refreshColor(displaced);
  }
  points.push([r,c]);
  S.cells[r][c].color=S.drawing.color;
  S.cells[r][c].pathIdx=points.length-1;
  // If we reached the other dot, complete the path
  if(S.cells[r][c].isDot && points.length>1){
    S.paths[S.drawing.color]=points.slice();
    var completedColor=S.drawing.color;
    S.drawing=null;
    refreshColor(completedColor);
    updateProgress();
    _play('tap');
    checkWin();
    return;
  }
  refreshColor(S.drawing.color);
}

function endPath(){
  if(!S||!S.drawing)return;
  // If the drawn path hasn't reached the other dot, clear it
  var points=S.drawing.points;
  if(points.length>1){
    var last=points[points.length-1];
    var isComplete = S.cells[last[0]][last[1]].isDot;
    if(!isComplete){
      clearColor(S.drawing.color);
      refreshColor(S.drawing.color);
    }
  } else {
    clearColor(S.drawing.color);
    refreshColor(S.drawing.color);
  }
  S.drawing=null;
  updateProgress();
}

function clearColor(color){
  S.paths[color]=[];
  for(var r=0;r<S.size;r++){
    for(var c=0;c<S.size;c++){
      if(S.cells[r][c].color===color && !S.cells[r][c].isDot){
        S.cells[r][c].color=null;
        S.cells[r][c].pathIdx=-1;
      }
    }
  }
}

function useHint(){
  if(!S||S.hintsLeft<=0){sm('No hints left');return;}
  // Find a color whose player-path doesn't match the generator's solution,
  // and auto-complete it from the generator's solution path.
  for(var c=0;c<S.pairs;c++){
    var pl=S.paths[c];
    var sol=S.solutionPaths[c];
    var already = pl.length===sol.length;
    if(already){
      // Check exact match (or reverse)
      var matches = pathsEqual(pl, sol) || pathsEqual(pl, sol.slice().reverse());
      if(matches) continue;
    }
    // Rebuild this color from generator's solution
    clearColor(c);
    sol.forEach(function(pt, idx){
      S.cells[pt[0]][pt[1]].color=c;
      S.cells[pt[0]][pt[1]].pathIdx=idx;
    });
    S.paths[c]=sol.slice();
    refreshColor(c);
    S.hintsLeft--;
    updateHUD();
    updateProgress();
    _play('tap');
    checkWin();
    return;
  }
  sm('Nothing to hint — looks solved');
}

function pathsEqual(a, b){
  if(a.length!==b.length)return false;
  for(var i=0;i<a.length;i++) if(a[i][0]!==b[i][0]||a[i][1]!==b[i][1])return false;
  return true;
}

function resetPuzzle(){
  if(!S)return;
  for(var c=0;c<S.pairs;c++) clearColor(c);
  S.drawing=null;
  refreshAll();
  updateProgress();
}

function checkWin(){
  var connected=0;
  var covered=0;
  for(var c=0;c<S.pairs;c++){
    var pl=S.paths[c];
    if(pl.length>=2){
      var a=pl[0], b=pl[pl.length-1];
      if(S.cells[a[0]][a[1]].isDot && S.cells[b[0]][b[1]].isDot){
        connected++;
        covered+=pl.length;
      }
    }
  }
  if(connected!==S.pairs)return;
  if(covered!==S.size*S.size){
    // All pairs connected but cells left empty — show status, don't win
    if(statusEl)statusEl.innerHTML='Connected all paths. Keep going — every cell must be covered.';
    return;
  }
  // Win
  S.phase='won';
  stopTimer();
  _e('game_win');_playWin();
  var elapsed=Math.round((Date.now()-S.startTime)/1000);
  S.solvedCount++;
  try{
    var solvedKey='lw_rootflow_solved_'+S.tier;
    var prev=parseInt(localStorage.getItem(solvedKey)||'0',10);
    localStorage.setItem(solvedKey, String(prev+1));
    var bestKey='lw_rootflow_best_'+S.tier;
    var prevBest=parseInt(localStorage.getItem(bestKey)||'9999',10);
    if(elapsed<prevBest)localStorage.setItem(bestKey, String(elapsed));
  }catch(e){}
  _sr('rootflow',{w:true,s:Math.max(100,800-elapsed*3)+(S.hintsLeft*50),lv:1});
  sm('Solved in '+fmtTime(elapsed)+'!');
  showWinCard(elapsed);
}

// ── Rendering (delta) ───────────────────────────────────────────────────
function buildDOM(host){
  pan=document.createElement('div'); pan.id='RFpan'; host.appendChild(pan);
  topBar=document.createElement('div'); topBar.className='RFtop'; pan.appendChild(topBar);
  topBar.innerHTML=
    '<div class="RFtopCell"><div class="RFtopLbl">TIER</div><div class="RFtopVal" id="RFtier">—</div></div>'+
    '<div class="RFtopCell"><div class="RFtopLbl">PUZZLE</div><div class="RFtopVal" id="RFpuz">1</div></div>'+
    '<div class="RFtopCell"><div class="RFtopLbl">TIME</div><div class="RFtopVal" id="RFtime">0:00</div></div>'+
    '<div class="RFtopCell"><div class="RFtopLbl">HINTS</div><div class="RFtopVal" id="RFh">—</div></div>';
  topEls.tier=topBar.querySelector('#RFtier');
  topEls.puzzle=topBar.querySelector('#RFpuz');
  topEls.time=topBar.querySelector('#RFtime');
  topEls.hints=topBar.querySelector('#RFh');
  statusEl=document.createElement('div'); statusEl.className='RFstatus'; pan.appendChild(statusEl);
  progEl=document.createElement('div'); progEl.className='RFprog'; pan.appendChild(progEl);
  var bw=document.createElement('div'); bw.className='RFboardWrap'; pan.appendChild(bw);
  gridEl=document.createElement('div'); gridEl.className='RFgrid'; bw.appendChild(gridEl);
  // Board event handlers — we use pointer events for cross-platform
  gridEl.addEventListener('mousedown', onPointerDown);
  gridEl.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', onPointerUp);
  gridEl.addEventListener('touchstart', onTouchStart, {passive:false});
  gridEl.addEventListener('touchmove', onTouchMove, {passive:false});
  gridEl.addEventListener('touchend', onPointerUp);
  gridEl.addEventListener('touchcancel', onPointerUp);
  ctrlRow=document.createElement('div'); ctrlRow.className='RFctrls'; pan.appendChild(ctrlRow);
}

function onPointerDown(e){
  var cell=e.target.closest('[data-r]'); if(!cell)return;
  var r=parseInt(cell.getAttribute('data-r'),10);
  var c=parseInt(cell.getAttribute('data-c'),10);
  startPath(r,c);
  if(e.preventDefault)e.preventDefault();
}
function onPointerMove(e){
  if(!S||!S.drawing)return;
  var cell=e.target.closest('[data-r]'); if(!cell)return;
  var r=parseInt(cell.getAttribute('data-r'),10);
  var c=parseInt(cell.getAttribute('data-c'),10);
  extendPath(r,c);
}
function onPointerUp(){ endPath(); }
function onTouchStart(e){
  var t=e.touches[0];
  var el=document.elementFromPoint(t.clientX,t.clientY);
  if(!el)return;
  var cell=el.closest?el.closest('[data-r]'):null;
  if(!cell)return;
  var r=parseInt(cell.getAttribute('data-r'),10);
  var c=parseInt(cell.getAttribute('data-c'),10);
  startPath(r,c);
  if(e.preventDefault)e.preventDefault();
}
function onTouchMove(e){
  if(!S||!S.drawing)return;
  if(e.preventDefault)e.preventDefault();
  var t=e.touches[0];
  var el=document.elementFromPoint(t.clientX,t.clientY);
  if(!el)return;
  var cell=el.closest?el.closest('[data-r]'):null;
  if(!cell)return;
  var r=parseInt(cell.getAttribute('data-r'),10);
  var c=parseInt(cell.getAttribute('data-c'),10);
  extendPath(r,c);
}

function buildGridCells(){
  if(!gridEl)return;
  cellEls={};
  var size=S.size;
  var cellSize = size<=5?54 : size<=6?48 : size<=7?42 : size<=8?37 : 33;
  gridEl.style.gridTemplateColumns='repeat('+size+','+cellSize+'px)';
  gridEl.innerHTML='';
  for(var r=0;r<size;r++){
    for(var c=0;c<size;c++){
      var el=document.createElement('div');
      el.style.width=cellSize+'px';
      el.style.height=cellSize+'px';
      el.setAttribute('data-r',r);
      el.setAttribute('data-c',c);
      el.className='RFcell';
      cellEls[r+','+c]=el;
      gridEl.appendChild(el);
    }
  }
  refreshAll();
}

function refreshAll(){
  for(var c=0;c<S.pairs;c++) refreshColor(c);
  refreshEmpties();
}

function refreshColor(color){
  var col=COLORS[color%COLORS.length];
  for(var r=0;r<S.size;r++){
    for(var c=0;c<S.size;c++){
      var cell=S.cells[r][c];
      if(cell.color===color || cell.isDot && cell.color===color){
        var el=cellEls[r+','+c]; if(!el)continue;
        el.style.setProperty('--rfc', col);
        var classes='RFcell';
        if(cell.isDot){
          classes+=' dot';
          if(S.drawing && S.drawing.color===color){
            var p0=S.drawing.points[0];
            if(p0[0]===r && p0[1]===c)classes+=' drawing';
          }
          el.style.background=col;
        } else {
          classes+=' filled';
          // Semi-transparent for path cells
          el.style.background=col+'c0';
        }
        // Check if this color is fully connected
        var pl=S.paths[color];
        if(pl.length>=2){
          var first=pl[0], last=pl[pl.length-1];
          if(S.cells[first[0]][first[1]].isDot && S.cells[last[0]][last[1]].isDot) classes+=' connected';
        }
        el.className=classes;
      }
    }
  }
  refreshEmpties();
}

function refreshEmpties(){
  for(var r=0;r<S.size;r++){
    for(var c=0;c<S.size;c++){
      var cell=S.cells[r][c];
      if(cell.color===null && !cell.isDot){
        var el=cellEls[r+','+c]; if(!el)continue;
        el.className='RFcell';
        el.style.background='';
        el.style.removeProperty('--rfc');
      }
    }
  }
}

function updateHUD(){
  if(!topEls.tier)return;
  var meta=TIERS[S.tier];
  topEls.tier.textContent=(meta&&meta.label)||'—';
  topEls.puzzle.textContent=S.solvedCount+1;
  topEls.hints.textContent=S.hintsLeft+'/'+(meta?meta.hints:0);
}

function updateProgress(){
  if(!progEl)return;
  var html='';
  for(var c=0;c<S.pairs;c++){
    var col=COLORS[c%COLORS.length];
    var pl=S.paths[c];
    var connected=false;
    if(pl.length>=2){
      var a=pl[0], b=pl[pl.length-1];
      if(S.cells[a[0]][a[1]].isDot && S.cells[b[0]][b[1]].isDot) connected=true;
    }
    html+='<div class="RFpip'+(connected?' on':'')+'" style="--rfc:'+col+'"></div>';
  }
  progEl.innerHTML=html;
  // Status: count of connected + fill%
  var conCount=0, filled=0;
  for(var c2=0;c2<S.pairs;c2++){
    var p2=S.paths[c2];
    if(p2.length>=2){
      var aa=p2[0], bb=p2[p2.length-1];
      if(S.cells[aa[0]][aa[1]].isDot && S.cells[bb[0]][bb[1]].isDot) conCount++;
    }
  }
  for(var r=0;r<S.size;r++)for(var c3=0;c3<S.size;c3++) if(S.cells[r][c3].color!==null) filled++;
  var pct=Math.round(100*filled/(S.size*S.size));
  if(statusEl && S.phase==='play'){
    if(conCount===S.pairs && filled<S.size*S.size){
      statusEl.innerHTML='All paths connected. <em>'+pct+'%</em> filled — every cell must be covered.';
    } else if(conCount===S.pairs){
      statusEl.innerHTML='<em>Solved.</em>';
    } else if(S.drawing){
      statusEl.innerHTML='Drawing… release at the matching dot.';
    } else {
      statusEl.innerHTML='<em>'+conCount+' of '+S.pairs+'</em> paths · <em>'+pct+'%</em> filled';
    }
  }
}

function updateControls(){
  if(!ctrlRow)return;
  ctrlRow.innerHTML='';
  if(S.phase==='won')return;
  ctrlRow.appendChild(mkBtn('💡 HINT','default',useHint,S.hintsLeft<=0));
  ctrlRow.appendChild(mkBtn('↺ RESET','default',resetPuzzle));
  ctrlRow.appendChild(mkBtn('↻ NEW','default',function(){ newPuzzle(); }));
  ctrlRow.appendChild(mkBtn('← TIER','default',function(){ requestNewGame(); }));
}
function mkBtn(label, style, onClick, disabled){
  var b=document.createElement('button'); b.className='RFbtn';
  if(style==='primary')b.className+=' primary';
  b.textContent=label;
  if(disabled)b.disabled=true;
  b.addEventListener('click', function(e){ e.preventDefault(); onClick(); });
  return b;
}

function fmtTime(sec){
  var m=Math.floor(sec/60), s=sec%60;
  return m+':'+(s<10?'0':'')+s;
}
function startTimer(){
  stopTimer();
  timerInterval=setInterval(function(){
    if(!S||S.phase!=='play')return;
    var elapsed=Math.round((Date.now()-S.startTime)/1000);
    if(topEls.time)topEls.time.textContent=fmtTime(elapsed);
  },500);
}
function stopTimer(){ if(timerInterval){clearInterval(timerInterval);timerInterval=null;} }

function showWinCard(elapsed){
  if(winCard){winCard.remove();}
  winCard=document.createElement('div'); winCard.className='RFwin';
  var bestKey='lw_rootflow_best_'+S.tier;
  var best=parseInt(localStorage.getItem(bestKey)||'9999',10);
  var bestStr=(best>=9999)?'—':fmtTime(best);
  var hintsUsed=TIERS[S.tier].hints-S.hintsLeft;
  winCard.innerHTML=
    '<div class="RFwinTitle">ROOTED</div>'+
    '<div class="RFwinStats">Time '+fmtTime(elapsed)+'  ·  best '+bestStr+'<br>Hints used '+hintsUsed+'  ·  solved '+S.solvedCount+' this tier</div>';
  winCard.appendChild(mkBtn('↻ NEXT PUZZLE','primary',function(){ newPuzzle(); }));
  winCard.appendChild(document.createElement('br'));
  winCard.appendChild(mkBtn('← PICK TIER','default',function(){ requestNewGame(); }));
  pan.appendChild(winCard);
}

// ── Tier picker ─────────────────────────────────────────────────────────
function showTierPicker(){
  if(pan){pan.innerHTML='';}
  else{pan=document.createElement('div');pan.id='RFpan';hostEl.appendChild(pan);}
  var ov=document.createElement('div');ov.className='RFtierPick';pan.appendChild(ov);
  var btnHtml='';
  var order=['seedling','sprout','sapling','mature','keeper'];
  order.forEach(function(key){
    var meta=TIERS[key];
    var solvedKey='lw_rootflow_solved_'+key;
    var solved=parseInt(localStorage.getItem(solvedKey)||'0',10);
    var bestKey='lw_rootflow_best_'+key;
    var best=parseInt(localStorage.getItem(bestKey)||'9999',10);
    var rightSide=(solved>0)?(solved+' solved · best '+fmtTime(best)):'';
    btnHtml+='<button class="RFtierBtn" data-tier="'+key+'"><div class="RFtlv"><span>'+meta.label+'</span><span class="RFtierSolved">'+rightSide+'</span></div><div class="RFtsub">'+meta.sub+'</div></button>';
  });
  ov.innerHTML=
    '<div class="RFtierTitle">ROOT FLOW</div>'+
    '<div class="RFtierSub">Drag from each colored dot to its twin. Fill every cell. Paths cannot cross. Infinite puzzles per tier.</div>'+
    '<div class="RFtierBtns">'+btnHtml+'</div>';
  ov.addEventListener('click', function(e){
    var btn=e.target.closest('[data-tier]');
    if(!btn)return;
    startTier(btn.getAttribute('data-tier'));
  });
}

// ── Lifecycle ───────────────────────────────────────────────────────────
function requestNewGame(){
  stopTimer();
  if(winCard){winCard.remove();winCard=null;}
  showTierPicker();
}

function startTier(tier){
  var meta=TIERS[tier];
  if(!meta){sm('Bad tier');return;}
  _setDiff(tier==='seedling'?'easy':tier==='sprout'?'easy':tier==='sapling'?'medium':tier==='mature'?'hard':'expert');
  S={
    tier:tier,
    size:meta.size,
    pairs:meta.pairs,
    cells:null, paths:null, dots:null, drawing:null,
    solution:null, solutionPaths:null,
    solvedCount:0,
    hintsLeft:meta.hints,
    startTime:0,
    phase:'play'
  };
  if(pan)pan.innerHTML='';
  buildDOM(hostEl);
  newPuzzle();
}

function newPuzzle(){
  if(winCard){winCard.remove();winCard=null;}
  if(!S)return;
  var puz=generatePuzzle(S.size, S.pairs);
  if(!puz){ sm('Generator failed — try again'); return; }
  S.cells=[];
  for(var r=0;r<S.size;r++){
    S.cells[r]=[];
    for(var c=0;c<S.size;c++){
      S.cells[r][c]={color:null, isDot:false, pathIdx:-1};
    }
  }
  puz.dots.forEach(function(d){
    S.cells[d[0]][d[1]].isDot=true;
    S.cells[d[0]][d[1]].color=d[2];
  });
  S.paths=[];
  for(var p=0;p<S.pairs;p++) S.paths.push([]);
  S.dots=puz.dots;
  S.solution=puz.solution;
  S.solutionPaths=puz.solutionPaths;
  S.drawing=null;
  S.hintsLeft=TIERS[S.tier].hints;
  S.startTime=Date.now();
  S.phase='play';
  buildGridCells();
  updateHUD();
  updateProgress();
  updateControls();
  startTimer();
}

window._gameFns = window._gameFns || {};
window._gameFns.rootflow = function(a){
  pan=null; topBar=null; statusEl=null; progEl=null; gridEl=null; ctrlRow=null;
  topEls={tier:null,puzzle:null,time:null,hints:null};
  cellEls={};
  stopTimer();
  if(winCard){winCard.remove();winCard=null;}
  hostEl=a;
  showTierPicker();
};
})();
// force-sync 1776961903
