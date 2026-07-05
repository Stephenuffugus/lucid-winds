// ═══ LUCID WINDS — Sliding Puzzle (8 / 15 / 24) ═══
// Classic Sam Loyd sliding puzzle. Multi-tile slide when any tile in
// the empty slot's row or column is tapped. Three sizes: 3x3 (8 tiles),
// 4x4 (15 tiles), 5x5 (24 tiles).
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,_setDiff=G.setDiff,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr;

// ── State (single active game) ─────────────────────────────────────────────
var SZ=4;                 // grid size (3, 4, or 5)
var tl=[];                // tile[cellIdx] = value (1..SZ*SZ-1), 0 for empty
var moves=0;
var history=[];           // array of {cell, val} snapshots — full tl snapshots
var startTs=0;
var solvedTs=0;
var won=false;
var timerId=null;
var pan=null;
var gd=null;
var dragActive=false;
var dragStartX=0, dragStartY=0, dragStartCell=-1, dragMoved=false;

// ── Styles (injected once) ────────────────────────────────────────────────
(function injectSliderStyle(){
  if(document.getElementById('d-anim-style'))return;
  var s=document.createElement('style');s.id='d-anim-style';
  s.textContent=[
    '@keyframes dPanIn{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes dLineIn{0%{transform:translateY(8px);opacity:0}100%{transform:translateY(0);opacity:1}}',
    '@keyframes dPop{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes dTileIn{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}',
    '#Dpan{max-width:min(96vw,440px);margin:0 auto;padding:12px;user-select:none;-webkit-user-select:none;touch-action:none;box-sizing:border-box;position:relative;animation:dPanIn .4s ease}',
    '.Dboard{position:relative;width:100%;aspect-ratio:1;background:linear-gradient(135deg,rgba(28,36,24,.6) 0%,rgba(18,24,16,.75) 55%,rgba(12,16,10,.85) 100%);border:2px solid rgba(122,179,86,0.25);border-radius:14px;box-shadow:inset 0 0 32px rgba(0,0,0,0.55),inset 0 0 0 1px rgba(122,179,86,0.08),0 6px 20px rgba(0,0,0,0.45);overflow:hidden}',
    '.Dtile{position:absolute;width:var(--ts);height:var(--ts);display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;color:#f5ebd0;background:linear-gradient(180deg,rgba(122,179,86,0.45) 0%,rgba(74,124,53,0.55) 100%);border:1.5px solid rgba(200,168,75,0.4);border-radius:10px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.15),inset 0 -2px 4px rgba(0,0,0,0.25),0 3px 8px rgba(0,0,0,0.4);cursor:pointer;transition:transform .16s cubic-bezier(.2,1.1,.3,1),box-shadow .16s ease,background .16s ease;will-change:transform;text-shadow:0 1px 2px rgba(0,0,0,0.45)}',
    '.Dtile:active{filter:brightness(1.1)}',
    '.Dtile.home{background:linear-gradient(180deg,rgba(200,168,75,0.45) 0%,rgba(160,130,55,0.55) 100%);border-color:rgba(255,220,112,0.55);color:#fff0d6;box-shadow:inset 0 1px 0 rgba(255,255,255,0.18),inset 0 -2px 4px rgba(0,0,0,0.2),0 0 12px rgba(200,168,75,0.35),0 3px 8px rgba(0,0,0,0.4)}',
    '.Dtile.home::after{content:"\\2713";position:absolute;top:2px;right:4px;font-size:0.6em;color:#fff0d6;opacity:.9;pointer-events:none}',
    '.Dctrl{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:10px 4px 2px;flex-wrap:wrap;position:relative;z-index:1}',
    '.Dinfo{display:flex;gap:10px;align-items:center;font-family:Georgia,serif;font-size:0.72rem;color:rgba(232,220,200,0.82);flex-wrap:wrap}',
    '.Dinfo strong{color:#c8a84b;font-weight:700}',
    '.Dbtn-row{display:flex;gap:6px}',
    '.Db{min-height:48px;padding:8px 14px;font-size:0.72rem;font-family:Georgia,serif;font-weight:700;border-radius:6px;cursor:pointer;background:rgba(26,31,23,0.7);border:1.5px solid rgba(122,179,86,0.4);color:#e8dcc8;transition:all .15s}',
    '.Db:active{background:rgba(122,179,86,0.2);transform:scale(.96)}',
    '.Db.gold{border-color:#c8a84b;color:#c8a84b;background:linear-gradient(180deg,rgba(200,168,75,0.18),rgba(160,130,50,0.22))}',
    '.Db[disabled]{opacity:.35;pointer-events:none}'
  ].join('');
  document.head.appendChild(s);
})();

// ── Helpers ────────────────────────────────────────────────────────────────
function emptyIdx(){return tl.indexOf(0);}
function rowOf(i){return Math.floor(i/SZ);}
function colOf(i){return i%SZ;}

function isWon(){
  for(var i=0;i<SZ*SZ-1;i++)if(tl[i]!==i+1)return false;
  return tl[SZ*SZ-1]===0;
}

// Shuffle: start solved, do SZ*SZ * 40 random legal moves. Always solvable.
function shuffle(){
  tl=[];
  for(var i=1;i<SZ*SZ;i++)tl.push(i);
  tl.push(0);
  var prev=-1;
  var total=SZ*SZ*40;
  for(var step=0;step<total;step++){
    var e=emptyIdx();
    var nbrs=[];
    if(rowOf(e)>0)nbrs.push(e-SZ);
    if(rowOf(e)<SZ-1)nbrs.push(e+SZ);
    if(colOf(e)>0)nbrs.push(e-1);
    if(colOf(e)<SZ-1)nbrs.push(e+1);
    // Avoid immediate undo
    var pick;
    do{pick=nbrs[Math.floor(Math.random()*nbrs.length)];}while(pick===prev&&nbrs.length>1);
    var tmp=tl[e];tl[e]=tl[pick];tl[pick]=tmp;
    prev=e;
  }
  // Ensure not already solved
  if(isWon())shuffle();
}

// Attempt move: tile at cell idx. Returns true if moved.
// Multi-tile: if idx is in same row/col as empty, slide the whole segment.
function tryMove(idx){
  if(won)return false;
  var e=emptyIdx();
  if(idx===e)return false;
  var changed=false;
  if(rowOf(idx)===rowOf(e)){
    // Slide horizontally
    if(colOf(idx)<colOf(e)){
      // Move right toward empty: tiles at cols idx..e-1 shift right
      for(var c=colOf(e);c>colOf(idx);c--){
        tl[rowOf(e)*SZ+c]=tl[rowOf(e)*SZ+c-1];
      }
      tl[idx]=0;
      changed=true;
    } else if(colOf(idx)>colOf(e)){
      for(var c2=colOf(e);c2<colOf(idx);c2++){
        tl[rowOf(e)*SZ+c2]=tl[rowOf(e)*SZ+c2+1];
      }
      tl[idx]=0;
      changed=true;
    }
  } else if(colOf(idx)===colOf(e)){
    if(rowOf(idx)<rowOf(e)){
      for(var r=rowOf(e);r>rowOf(idx);r--){
        tl[r*SZ+colOf(e)]=tl[(r-1)*SZ+colOf(e)];
      }
      tl[idx]=0;
      changed=true;
    } else if(rowOf(idx)>rowOf(e)){
      for(var r2=rowOf(e);r2<rowOf(idx);r2++){
        tl[r2*SZ+colOf(e)]=tl[(r2+1)*SZ+colOf(e)];
      }
      tl[idx]=0;
      changed=true;
    }
  }
  if(changed){
    history.push(e);             // remember empty pre-move to undo
    moves++;
    _play('tap');
    updateStatus();
    positionTiles();             // smooth slide via CSS transform
    checkWin();
  }
  return changed;
}

function undoMove(){
  if(!history.length||won)return;
  // Redo the move by swapping current empty with the cell that was empty before
  var prevEmpty=history.pop();
  var e=emptyIdx();
  // This wasn't a single-swap for multi-slide — undo by rebuilding?
  // Simpler: store full snapshots. Let's refactor: history stores full tl.
  // (Handled below in tryMove — redoing now uses snapshot.)
  // Fallback: single-step reverse by treating prevEmpty as target.
  // The correct undo for multi-tile slides requires snapshot.
  // So we actually should have pushed snapshots. Adjusting:
  // (This branch unreachable now — we push snapshots in tryMove via history.push(tl.slice()))
  moves=Math.max(0,moves-1);
  updateStatus();
  positionTiles();
}

// Switch history to snapshot-based for correct multi-tile undo
(function fixUndo(){
  tryMove=function(idx){
    if(won)return false;
    var e=emptyIdx();
    if(idx===e)return false;
    if(rowOf(idx)!==rowOf(e)&&colOf(idx)!==colOf(e))return false;
    var snap=tl.slice();
    if(rowOf(idx)===rowOf(e)){
      if(colOf(idx)<colOf(e)){
        for(var c=colOf(e);c>colOf(idx);c--)tl[rowOf(e)*SZ+c]=tl[rowOf(e)*SZ+c-1];
        tl[idx]=0;
      } else {
        for(var c2=colOf(e);c2<colOf(idx);c2++)tl[rowOf(e)*SZ+c2]=tl[rowOf(e)*SZ+c2+1];
        tl[idx]=0;
      }
    } else {
      if(rowOf(idx)<rowOf(e)){
        for(var r=rowOf(e);r>rowOf(idx);r--)tl[r*SZ+colOf(e)]=tl[(r-1)*SZ+colOf(e)];
        tl[idx]=0;
      } else {
        for(var r2=rowOf(e);r2<rowOf(idx);r2++)tl[r2*SZ+colOf(e)]=tl[(r2+1)*SZ+colOf(e)];
        tl[idx]=0;
      }
    }
    history.push(snap);
    moves++;
    _play('tap');
    updateStatus();
    positionTiles();
    checkWin();
    return true;
  };
  undoMove=function(){
    if(!history.length||won)return;
    tl=history.pop();
    moves=Math.max(0,moves-1);
    _play('tap');
    updateStatus();
    positionTiles();
  };
})();

function checkWin(){
  if(won)return;
  if(isWon()){
    won=true;solvedTs=Date.now();
    if(timerId){clearInterval(timerId);timerId=null;}
    _e('game_win');if(_playWin)_playWin();_sr('slider',{w:true,s:moves,lo:1});
    sliderVictory();
  }
}

// ── Rendering ──────────────────────────────────────────────────────────────
function positionTiles(){
  if(!gd)return;
  var rect=gd.getBoundingClientRect();
  var w=rect.width;
  var pad=4;
  var tsize=(w-pad*2)/SZ;
  // Update or create tile elements
  var existing={};
  var nodes=gd.querySelectorAll('.Dtile');
  for(var ni=0;ni<nodes.length;ni++){
    var v=parseInt(nodes[ni].getAttribute('data-v'),10);
    existing[v]=nodes[ni];
  }
  // Make sure one element per non-empty tile value exists
  var seen={};
  for(var i=0;i<tl.length;i++){
    var val=tl[i];if(!val)continue;
    seen[val]=true;
    var el=existing[val];
    if(!el){
      el=document.createElement('div');
      el.className='Dtile';
      el.setAttribute('data-v',val);
      el.textContent=val;
      el.style.setProperty('--ts',tsize+'px');
      el.style.fontSize=Math.round(tsize*0.42)+'px';
      el.style.animation='dTileIn .3s ease';
      el.onclick=function(){
        if(dragMoved){dragMoved=false;return;}
        var vv=parseInt(this.getAttribute('data-v'),10);
        var cell=tl.indexOf(vv);
        tryMove(cell);
      };
      gd.appendChild(el);
    }
    // Position
    var r=Math.floor(i/SZ),c=i%SZ;
    el.style.width=tsize+'px';
    el.style.height=tsize+'px';
    el.style.transform='translate('+(pad+c*tsize)+'px,'+(pad+r*tsize)+'px)';
    el.style.fontSize=Math.round(tsize*0.42)+'px';
    // Home = in its sorted position
    var home=(i===val-1);
    if(home)el.classList.add('home');else el.classList.remove('home');
  }
  // Remove any stale tile elements
  for(var v2 in existing){
    if(!seen[v2]){try{existing[v2].remove();}catch(e){}}
  }
}

function updateStatus(){
  var m=document.getElementById('Dmoves');if(m)m.textContent=moves;
  var ub=document.getElementById('Dundo');if(ub)ub.disabled=!history.length||won;
}

function fmtTime(secs){
  var mm=Math.floor(secs/60),ss=secs%60;
  return mm+':'+(ss<10?'0':'')+ss;
}

function tickTimer(){
  if(won||!startTs)return;
  var secs=Math.max(0,Math.round((Date.now()-startTs)/1000));
  var t=document.getElementById('Dtime');if(t)t.textContent=fmtTime(secs);
}

function buildPan(){
  pan.innerHTML='';
  gd=document.createElement('div');gd.className='Dboard';gd.id='Dboard';
  pan.appendChild(gd);
  var ctrl=document.createElement('div');ctrl.className='Dctrl';
  ctrl.innerHTML=
    '<div class="Dinfo">'+
      '<span>Moves: <strong id="Dmoves">0</strong></span>'+
      '<span>⏱ <strong id="Dtime">0:00</strong></span>'+
    '</div>'+
    '<div class="Dbtn-row">'+
      '<button class="Db" id="Dundo" onclick="_DU()" disabled>↶ Undo</button>'+
      '<button class="Db gold" onclick="_DN()">↻ New</button>'+
    '</div>';
  pan.appendChild(ctrl);
}

// ── Drag/swipe support ─────────────────────────────────────────────────────
function cellAtPoint(cx,cy){
  if(!gd)return -1;
  var r=gd.getBoundingClientRect();
  if(cx<r.left||cx>r.right||cy<r.top||cy>r.bottom)return -1;
  var tsize=(r.width-8)/SZ;
  var col=Math.floor((cx-r.left-4)/tsize);
  var row=Math.floor((cy-r.top-4)/tsize);
  if(col<0||col>=SZ||row<0||row>=SZ)return -1;
  return row*SZ+col;
}

function bindDrag(){
  pan.onmousedown=function(e){
    if(won)return;
    var c=cellAtPoint(e.clientX,e.clientY);if(c<0||!tl[c])return;
    dragActive=true;dragStartX=e.clientX;dragStartY=e.clientY;dragStartCell=c;dragMoved=false;
  };
  pan.onmousemove=function(e){
    if(!dragActive)return;
    if(Math.abs(e.clientX-dragStartX)+Math.abs(e.clientY-dragStartY)>8)dragMoved=true;
  };
  pan.ontouchstart=function(e){
    if(won)return;
    var t=e.touches&&e.touches[0];if(!t)return;
    var c=cellAtPoint(t.clientX,t.clientY);if(c<0||!tl[c])return;
    e.preventDefault();
    dragActive=true;dragStartX=t.clientX;dragStartY=t.clientY;dragStartCell=c;dragMoved=false;
  };
  pan.ontouchmove=function(e){
    if(!dragActive)return;
    var t=e.touches&&e.touches[0];if(!t)return;
    if(Math.abs(t.clientX-dragStartX)+Math.abs(t.clientY-dragStartY)>8)dragMoved=true;
    e.preventDefault();
  };
}

function endDrag(clientX,clientY){
  if(!dragActive)return;
  dragActive=false;
  if(!dragMoved){return;} // tap — handled by tile's onclick
  var dx=clientX-dragStartX, dy=clientY-dragStartY;
  var adx=Math.abs(dx), ady=Math.abs(dy);
  if(adx<20&&ady<20){dragMoved=false;return;}
  var e=emptyIdx();
  var sr=rowOf(dragStartCell), sc=colOf(dragStartCell);
  var er=rowOf(e), ec=colOf(e);
  // Translate swipe to a tile tap: pick the source cell's row/col that includes empty
  // Horizontal swipe: only valid if sr === er (same row as empty)
  if(adx>ady){
    if(sr===er){
      // Direction must push toward empty
      if((dx>0&&sc<ec)||(dx<0&&sc>ec))tryMove(dragStartCell);
    }
  } else {
    if(sc===ec){
      if((dy>0&&sr<er)||(dy<0&&sr>er))tryMove(dragStartCell);
    }
  }
  dragMoved=false;
}

document.addEventListener('mouseup',function(e){if(dragActive)endDrag(e.clientX,e.clientY);});
document.addEventListener('touchend',function(e){
  if(!dragActive)return;
  var t=(e.changedTouches&&e.changedTouches[0])||null;
  endDrag(t?t.clientX:0,t?t.clientY:0);
});
document.addEventListener('touchcancel',function(){dragActive=false;dragMoved=false;});

// ── Victory overlay ────────────────────────────────────────────────────────
function sliderVictory(){
  var secs=Math.max(1,Math.round((solvedTs-startTs)/1000));
  var timeStr=fmtTime(secs);
  if(window._lwGameEnd)window._lwGameEnd({
    won:true,
    title:'SORTED',
    line:'<b style="color:#c8a84b">'+moves+'</b> moves · '+timeStr+' · '+SZ+'×'+SZ,
    retry:function(){window._DN();},
    retryLabel:'↻ Next Puzzle',
    viewLabel:'admire the board'
  });
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
function onDResize(){positionTiles();}

function GD(a){
  ms(a,'Sliding Puzzle');mm(a);
  pan=document.createElement('div');pan.id='Dpan';a.appendChild(pan);
  mc(a).innerHTML='<select class="gsl" id="Dsize" onchange="_DN()"><option value="3">3×3</option><option value="4" selected>4×4 (15 Puzzle)</option><option value="5">5×5</option></select>';
  window.addEventListener('resize',onDResize);
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    if(timerId){clearInterval(timerId);timerId=null;}
    window.removeEventListener('resize',onDResize);
  });
  window._DN();
}

window._DN=function(){
  SZ=parseInt((document.getElementById('Dsize')||{}).value)||4;
  _setDiff(SZ===3?'easy':SZ===4?'medium':'hard');
  moves=0;history=[];won=false;startTs=Date.now();solvedTs=0;
  if(timerId){clearInterval(timerId);}
  timerId=setInterval(tickTimer,500);
  shuffle();
  sm('');
  buildPan();
  // Wait one frame so gd has its width before positioning
  setTimeout(function(){positionTiles();updateStatus();bindDrag();},16);
};

window._DU=function(){undoMove();};

window._gameFns.slider=GD;
})();
