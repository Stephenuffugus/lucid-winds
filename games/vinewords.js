// ═══ LUCID WINDS — Vine Words (Boggle-style word finder) ═══
// 4x4 grid. Drag or tap letters to chain adjacent cells (incl diagonal).
// Each die is based on traditional Boggle distribution so games feel real.
// Dictionary: ENABLE public-domain word list, 168,455 words of 3-15 letters.
// Scoring: 3-4 letters 1pt, 5=2, 6=3, 7=5, 8+=11 (official Boggle scoring).
// Timer 3 minutes (tournament standard). Pause button. Path drawing on
// canvas overlay. End-of-round summary shows your words AND the words you
// missed so the player actually learns vocabulary.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

// ── Dictionary (loaded from vinewords-dict.js as sorted array) ─────────────
// Build Set on first use for O(1) isWord, keep sorted array for prefix binary
// search (needed by the solver that enumerates missed words at end of round).
function getDictSet(){
  if(window.LW_VINE_DICT_SET)return window.LW_VINE_DICT_SET;
  var arr=window.LW_VINE_DICT_ARR||[];
  var s={};
  for(var i=0;i<arr.length;i++)s[arr[i]]=1;
  window.LW_VINE_DICT_SET=s;
  return s;
}
function isPrefix(p){
  var arr=window.LW_VINE_DICT_ARR||[];
  if(!arr.length)return false;
  var lo=0,hi=arr.length-1;
  while(lo<=hi){
    var mid=(lo+hi)>>>1;
    var w=arr[mid];
    if(w<p){lo=mid+1;}
    else if(w>p){
      // w > p — is p a prefix of w?
      if(w.indexOf(p)===0)return true;
      hi=mid-1;
    } else return true;
  }
  // Check neighbors (for when we narrowed to a word that's alphabetically just past p)
  if(lo<arr.length&&arr[lo].indexOf(p)===0)return true;
  return false;
}

// ── Traditional Boggle "New Generation" dice (2012 set, 16 dice × 6 faces) ──
// Ensures realistic letter frequency + playable Q (includes Qu on one die).
var DICE_NEW=[
  ['A','A','E','E','G','N'], ['A','B','B','J','O','O'], ['A','C','H','O','P','S'],
  ['A','F','F','K','P','S'], ['A','O','O','T','T','W'], ['C','I','M','O','T','U'],
  ['D','E','I','L','R','X'], ['D','E','L','R','V','Y'], ['D','I','S','T','T','Y'],
  ['E','E','G','H','N','W'], ['E','E','I','N','S','U'], ['E','H','R','T','V','W'],
  ['E','I','O','S','S','T'], ['E','L','R','T','T','Y'], ['H','I','M','N','U','QU'],
  ['H','L','N','N','R','Z']
];

// Inject CSS once for shake + timer-warn animations
if(!document.getElementById('vw-styles')){
  var _vws=document.createElement('style');_vws.id='vw-styles';
  _vws.textContent='@keyframes vwShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}.vw-shake{animation:vwShake .34s ease both}@keyframes vwPulse{0%,100%{color:#d05050;text-shadow:0 0 8px rgba(208,80,80,0.5)}50%{color:#ffb0b0;text-shadow:0 0 14px rgba(255,176,176,0.8)}}.vw-urgent{animation:vwPulse 1s ease-in-out infinite}@keyframes vwSpawn{0%{transform:scale(0.7);opacity:0}100%{transform:scale(1);opacity:1}}.vw-spawn{animation:vwSpawn .35s cubic-bezier(.34,1.56,.64,1) both}';
  document.head.appendChild(_vws);
}

// Helpers
function shuffle(arr){for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}return arr;}
function padTime(n){return n<10?'0'+n:''+n;}
function formatTime(sec){return Math.floor(sec/60)+':'+padTime(sec%60);}
function scoreFor(len){return len<=4?1:len===5?2:len===6?3:len===7?5:len>=8?11:0;}
function haptic(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
function loadStats(){
  var s={best:0,bestWord:'',bestWordLen:0,gamesPlayed:0,totalWords:0};
  try{var raw=localStorage.getItem('lw_vw_stats');if(raw){var p=JSON.parse(raw);for(var k in p)s[k]=p[k];}}catch(e){}
  return s;
}
function saveStats(s){try{localStorage.setItem('lw_vw_stats',JSON.stringify(s));}catch(e){}}
// Rank tiers based on % of maximum solvable score on this specific board
function rankFor(pct){
  if(pct>=0.50)return {name:'GARDEN MASTER',color:'#ffd86b'};
  if(pct>=0.35)return {name:'WORDSMITH',color:'#c8a84b'};
  if(pct>=0.22)return {name:'BOTANIST',color:'#a8c978'};
  if(pct>=0.12)return {name:'SPROUT',color:'#7ab356'};
  if(pct>=0.06)return {name:'SEEDLING',color:'rgba(232,220,200,0.85)'};
  return {name:'FRESH SOIL',color:'rgba(232,220,200,0.6)'};
}

window._gameFns=window._gameFns||{};
window._gameFns.vinewords=function VW(a){
  var DICT=getDictSet();
  var grid=[];                 // 4x4 of {letter:'A',display:'A'} — display handles 'QU'
  var savedBoard=null;         // remembered at newGame so "Replay board" can restore
  var path=[];                 // [[r,c], ...]
  var foundSet={},foundList=[];
  var score=0,timeLeft=180,timerId=0,playing=false,paused=false;
  var duration=180;            // seconds
  var allWords=null;           // solver result at game end
  var maxScore=0;              // cached from last solve for rank computation
  var draggingFromCanvas=false;
  var stats=loadStats();

  // UI chrome
  ms(a,'<span style="color:var(--gold)">Score <span id="VWs">0</span></span> · <span id="VWwords">0</span> words · <span id="VWt">3:00</span> · best <span id="VWbest">'+stats.best+'</span>');
  mm(a);
  var pan=document.createElement('div');pan.id='VWpan';
  pan.style.cssText='max-width:460px;margin:0 auto;padding:6px;user-select:none;-webkit-user-select:none;';
  a.appendChild(pan);

  // Current word display + action buttons
  var wordBar=document.createElement('div');
  wordBar.style.cssText='text-align:center;font-family:DM Mono,monospace;font-size:1.5rem;color:var(--cream);min-height:44px;padding:6px 0;letter-spacing:0.08em;font-weight:700;';
  wordBar.id='VWword';
  wordBar.textContent='—';
  pan.appendChild(wordBar);

  var btnRow=document.createElement('div');
  btnRow.style.cssText='display:flex;gap:6px;justify-content:center;padding:2px 0 8px;';
  btnRow.innerHTML=''+
    '<button id="VWsubmit" class="gb" style="min-height:44px;padding:8px 18px;font-size:0.82rem;letter-spacing:0.1em;">✓ SUBMIT</button>'+
    '<button id="VWclear" class="gb" style="min-height:44px;padding:8px 18px;font-size:0.82rem;letter-spacing:0.1em;">✗ CLEAR</button>'+
    '<button id="VWpause" class="gb" style="min-height:44px;padding:8px 18px;font-size:0.82rem;letter-spacing:0.1em;">⏸ PAUSE</button>';
  pan.appendChild(btnRow);

  // Board wrapper holds canvas for path drawing + cell grid
  var boardWrap=document.createElement('div');
  boardWrap.id='VWboard';
  boardWrap.style.cssText='position:relative;width:100%;max-width:400px;margin:4px auto;aspect-ratio:1/1;touch-action:none;';
  pan.appendChild(boardWrap);

  var gridHost=document.createElement('div');
  gridHost.style.cssText='position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:6px;padding:6px;';
  boardWrap.appendChild(gridHost);

  var overlay=document.createElement('canvas');
  overlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;';
  boardWrap.appendChild(overlay);

  // Found words list
  var foundBar=document.createElement('div');
  foundBar.id='VWfound';
  foundBar.style.cssText='margin-top:10px;padding:8px 10px;background:rgba(26,31,23,0.45);border:1px solid rgba(122,179,86,0.25);border-radius:8px;max-height:120px;overflow-y:auto;font-size:0.72rem;color:var(--cream);line-height:1.6;';
  foundBar.innerHTML='<div style="font-family:Bebas Neue,sans-serif;color:var(--gold);font-size:0.8rem;letter-spacing:0.12em;margin-bottom:4px;">FOUND · <span id="VWfcount">0</span></div><div id="VWflist" style="font-family:DM Mono,monospace;letter-spacing:0.02em;">—</div>';
  pan.appendChild(foundBar);

  // Summary / missed-words host (hidden until game ends)
  var summary=document.createElement('div');
  summary.id='VWsum';
  summary.style.cssText='display:none;margin-top:10px;padding:10px 12px;background:rgba(13,16,12,0.85);border:1.5px solid rgba(122,179,86,0.35);border-radius:10px;font-family:DM Mono,monospace;font-size:0.72rem;color:var(--cream);';
  pan.appendChild(summary);

  // Controls
  mc(a).innerHTML='<button class="gb" onclick="_VWN()">🌱 NEW</button>';

  // Pointer coords helper
  function boardRect(){return boardWrap.getBoundingClientRect();}
  function cellAt(x,y){
    var r=boardRect();
    var pad=8; // tolerate fingers straying just outside the board edges
    var dx=x-r.left,dy=y-r.top;
    if(dx<-pad||dy<-pad||dx>r.width+pad||dy>r.height+pad)return null;
    dx=Math.max(0,Math.min(r.width-0.01,dx));
    dy=Math.max(0,Math.min(r.height-0.01,dy));
    var col=Math.floor(dx/(r.width/4));
    var row=Math.floor(dy/(r.height/4));
    if(col<0)col=0;else if(col>3)col=3;
    if(row<0)row=0;else if(row>3)row=3;
    return [row,col];
  }

  function buildGrid(){
    grid=[];
    var dice=DICE_NEW.slice();shuffle(dice);
    for(var r=0;r<4;r++){
      grid[r]=[];
      for(var c=0;c<4;c++){
        var die=dice[r*4+c];
        var face=die[Math.floor(Math.random()*6)];
        grid[r][c]={letter:face.toLowerCase(),display:face==='QU'?'Qu':face};
      }
    }
    // Snapshot the board so "Replay" button can restore the exact same grid.
    savedBoard=JSON.parse(JSON.stringify(grid));
  }
  function restoreBoard(){
    if(!savedBoard)return;
    grid=JSON.parse(JSON.stringify(savedBoard));
  }

  // Build the 16 cells ONCE per round, then mutate in-place. Rebuilding
  // innerHTML every path change breaks iOS touch capture mid-drag — the
  // element that captured touchstart gets removed and the browser stops
  // dispatching further touchmove events. In-place class/style updates
  // keep the same DOM nodes alive so the drag stream survives.
  var cellEls=[]; // row-major array of the 16 cell DOM nodes
  function buildCells(){
    gridHost.innerHTML='';
    cellEls=[];
    for(var r=0;r<4;r++){
      for(var c=0;c<4;c++){
        var cell=document.createElement('div');
        cell.setAttribute('data-r',r);
        cell.setAttribute('data-c',c);
        cell.style.cssText='display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:clamp(1.4rem,5.5vw,2.2rem);color:#e8dcc8;cursor:pointer;border-radius:12px;transition:background .15s ease,border-color .15s ease,transform .1s ease,box-shadow .15s ease;letter-spacing:0.03em;border:2px solid rgba(122,179,86,0.25);background:linear-gradient(180deg,rgba(42,50,32,0.95),rgba(26,31,23,0.95));box-shadow:0 2px 0 rgba(0,0,0,0.35);';
        cell.textContent=grid[r][c].display;
        gridHost.appendChild(cell);
        cellEls.push(cell);
      }
    }
  }
  function renderCells(){
    // Path-state is the only thing that changes between calls; just reapply
    // the background/border/shadow on each of the 16 existing cells. Letters
    // don't change until a full board rebuild (newGame / replay).
    for(var r=0;r<4;r++){
      for(var c=0;c<4;c++){
        var cell=cellEls[r*4+c];
        if(!cell)continue;
        var inPath=isInPath(r,c);
        var isLast=path.length>0&&path[path.length-1][0]===r&&path[path.length-1][1]===c;
        cell.style.background=isLast?'rgba(200,168,75,0.38)':(inPath?'rgba(122,179,86,0.32)':'linear-gradient(180deg,rgba(42,50,32,0.95),rgba(26,31,23,0.95))');
        cell.style.borderColor=isLast?'#c8a84b':(inPath?'#7ab356':'rgba(122,179,86,0.25)');
        cell.style.boxShadow=isLast?'0 0 16px rgba(200,168,75,0.55)':(inPath?'0 0 10px rgba(122,179,86,0.35)':'0 2px 0 rgba(0,0,0,0.35)');
      }
    }
  }
  function rebuildBoardDOM(){buildCells();renderCells();}

  function isInPath(r,c){for(var i=0;i<path.length;i++)if(path[i][0]===r&&path[i][1]===c)return true;return false;}
  function pathWord(){
    var s='';
    for(var i=0;i<path.length;i++)s+=grid[path[i][0]][path[i][1]].letter;
    return s;
  }
  function adjacent(p1,p2){return Math.abs(p1[0]-p2[0])<=1&&Math.abs(p1[1]-p2[1])<=1&&!(p1[0]===p2[0]&&p1[1]===p2[1]);}

  function drawPath(){
    var r=boardRect();
    overlay.width=r.width;overlay.height=r.height;
    var ctx=overlay.getContext('2d');
    ctx.clearRect(0,0,r.width,r.height);
    if(path.length<2)return;
    var cw=r.width/4,ch=r.height/4;
    var curWord=pathWord();
    var valid=curWord.length>=3&&DICT[curWord]&&!foundSet[curWord];
    var stroke=valid?'rgba(200,168,75,0.85)':'rgba(122,179,86,0.75)';
    ctx.strokeStyle=stroke;
    ctx.lineWidth=Math.min(cw,ch)*0.14;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.beginPath();
    for(var i=0;i<path.length;i++){
      var p=path[i];
      var x=p[1]*cw+cw/2,y=p[0]*ch+ch/2;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
    // Draw node dots
    for(var j=0;j<path.length;j++){
      var pp=path[j];
      var cx=pp[1]*cw+cw/2,cy=pp[0]*ch+ch/2;
      ctx.fillStyle=j===path.length-1?'rgba(200,168,75,0.9)':stroke;
      ctx.beginPath();ctx.arc(cx,cy,Math.min(cw,ch)*0.08,0,Math.PI*2);ctx.fill();
    }
  }

  function updateWordBar(){
    var w=pathWord();
    var el=document.getElementById('VWword');
    if(!el)return;
    var canSubmit=w.length>=3&&DICT[w]&&!foundSet[w];
    el.style.color=canSubmit?'var(--sage)':(w.length>=3&&foundSet[w]?'rgba(200,168,75,0.7)':'var(--cream)');
    el.textContent=w?w.toUpperCase():'—';
    var sb=document.getElementById('VWsubmit');
    if(sb){sb.disabled=!canSubmit;sb.style.opacity=canSubmit?'1':'0.45';}
    var cb=document.getElementById('VWclear');
    if(cb){cb.disabled=w.length===0;cb.style.opacity=w.length>0?'1':'0.45';}
  }

  function render(){renderCells();drawPath();updateWordBar();}

  function addToPath(r,c){
    if(path.length===0){path.push([r,c]);return true;}
    var last=path[path.length-1];
    if(last[0]===r&&last[1]===c)return false;
    // If already in path and not the last, step back to that position
    for(var i=0;i<path.length-1;i++){
      if(path[i][0]===r&&path[i][1]===c){path=path.slice(0,i+1);return true;}
    }
    if(adjacent(last,[r,c])){path.push([r,c]);return true;}
    return false;
  }

  function shakeBoard(){
    boardWrap.classList.remove('vw-shake');
    void boardWrap.offsetWidth;
    boardWrap.classList.add('vw-shake');
    setTimeout(function(){boardWrap.classList.remove('vw-shake');},360);
  }
  function submitWord(){
    var w=pathWord();
    if(w.length<3){sm('3 letter min');shakeBoard();path=[];render();return;}
    if(!DICT[w]){sm('Not a word: '+w.toUpperCase());_play('lose');shakeBoard();haptic(40);path=[];render();return;}
    if(foundSet[w]){sm('Already found');shakeBoard();path=[];render();return;}
    foundSet[w]=1;foundList.unshift(w);
    var pts=scoreFor(w.length);
    score+=pts;
    _e('progress');
    if(foundList.length%5===0)_e('milestone');
    sm('+'+pts+' '+w.toUpperCase());
    _play('snap');
    haptic(w.length>=6?25:15);
    var el=document.getElementById('VWs');if(el)el.textContent=score;
    var we=document.getElementById('VWwords');if(we)we.textContent=foundList.length;
    renderFound();
    path=[];render();
  }

  function renderFound(){
    var fc=document.getElementById('VWfcount');if(fc)fc.textContent=foundList.length;
    var fl=document.getElementById('VWflist');
    if(!fl)return;
    if(foundList.length===0){fl.textContent='—';return;}
    // Group by length for quick read
    var parts=[];
    for(var i=0;i<foundList.length;i++){
      var w=foundList[i];
      var col=w.length>=8?'#ffd86b':w.length===7?'#c8a84b':w.length===6?'#a8c978':w.length===5?'#7ab356':'rgba(232,220,200,0.7)';
      parts.push('<span style="color:'+col+';">'+w.toUpperCase()+'</span>');
    }
    fl.innerHTML=parts.join(' · ');
  }

  // ── Pointer handling ──
  function onDown(e){
    if(!playing||paused)return;
    e.preventDefault();
    // Always enter drag mode so onMove can pick up the first cell even if
    // the initial touch landed in a gap.
    draggingFromCanvas=true;
    var pt=getPoint(e);
    var c=cellAt(pt.x,pt.y);
    if(!c)return;
    // If this cell is already the last in path, treat as "submit"
    if(path.length>0&&path[path.length-1][0]===c[0]&&path[path.length-1][1]===c[1]){
      submitWord();draggingFromCanvas=false;return;
    }
    // If this cell is in path (not last), trim to include this cell
    if(isInPath(c[0],c[1])){
      for(var i=0;i<path.length;i++){
        if(path[i][0]===c[0]&&path[i][1]===c[1]){path=path.slice(0,i+1);break;}
      }
    } else {
      // Start a new path at this cell unless we can extend the current one
      if(path.length>0){var last=path[path.length-1];if(adjacent(last,c))path.push(c);else path=[c];}
      else path=[c];
    }
    render();
  }
  function onMove(e){
    if(!playing||paused||!draggingFromCanvas)return;
    e.preventDefault();
    var pt=getPoint(e);
    var c=cellAt(pt.x,pt.y);
    if(!c)return;
    // First cell pickup if onDown missed and path is still empty.
    if(path.length===0){path=[c];render();return;}
    var last=path[path.length-1];
    if(last[0]===c[0]&&last[1]===c[1])return;
    if(addToPath(c[0],c[1]))render();
  }
  function onUp(e){
    if(!draggingFromCanvas)return;
    draggingFromCanvas=false;
    // Auto-submit if valid on finger release, otherwise leave for manual clear
    var w=pathWord();
    if(w.length>=3&&DICT[w]&&!foundSet[w]){submitWord();}
  }
  function getPoint(e){
    if(e.touches&&e.touches.length)return {x:e.touches[0].clientX,y:e.touches[0].clientY};
    if(e.changedTouches&&e.changedTouches.length)return {x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};
    return {x:e.clientX,y:e.clientY};
  }
  boardWrap.addEventListener('mousedown',onDown);
  boardWrap.addEventListener('mousemove',onMove);
  window.addEventListener('mouseup',onUp);
  boardWrap.addEventListener('touchstart',onDown,{passive:false});
  boardWrap.addEventListener('touchmove',onMove,{passive:false});
  window.addEventListener('touchend',onUp);

  // Also allow tap-cell semantics (for accessibility; user clicks each letter)
  gridHost.addEventListener('click',function(e){
    if(!playing||paused)return;
    if(draggingFromCanvas)return;
    var t=e.target;
    if(!t||!t.getAttribute)return;
    var r=parseInt(t.getAttribute('data-r'),10);
    var c=parseInt(t.getAttribute('data-c'),10);
    if(isNaN(r)||isNaN(c))return;
    if(path.length>0&&path[path.length-1][0]===r&&path[path.length-1][1]===c){submitWord();return;}
    if(addToPath(r,c))render();
  });

  // Buttons
  document.getElementById('VWsubmit').onclick=function(){submitWord();};
  document.getElementById('VWclear').onclick=function(){path=[];render();};
  document.getElementById('VWpause').onclick=function(){
    if(!playing)return;
    paused=!paused;
    this.textContent=paused?'▶ RESUME':'⏸ PAUSE';
    if(paused){sm('Paused');}else{sm('Go!');}
  };

  // ── Timer ──
  function tick(){
    if(paused)return;
    timeLeft--;
    var t=document.getElementById('VWt');
    if(t){
      t.textContent=formatTime(timeLeft);
      if(timeLeft<=30&&timeLeft>0)t.classList.add('vw-urgent');
      else t.classList.remove('vw-urgent');
      // Gentle haptic tick at 10s countdown
      if(timeLeft===30||timeLeft===10)haptic(30);
    }
    if(timeLeft<=0){endGame();}
  }

  // ── Solver: find every findable word on the current board ──
  function solveBoard(){
    // DFS each cell, prune by isPrefix. Collect unique words of length >= 3.
    var found={};
    var prefixCache={};
    function hasPref(p){if(prefixCache.hasOwnProperty(p))return prefixCache[p];var r=isPrefix(p);prefixCache[p]=r;return r;}
    function dfs(r,c,visited,prefix){
      // letter may be single char or "qu"
      var lf=grid[r][c].letter;
      var nextPrefix=prefix+lf;
      if(!hasPref(nextPrefix))return;
      if(nextPrefix.length>=3&&DICT[nextPrefix])found[nextPrefix]=1;
      if(nextPrefix.length>=15)return;
      visited[r*4+c]=1;
      for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
        if(dr===0&&dc===0)continue;
        var nr=r+dr,nc=c+dc;
        if(nr<0||nr>3||nc<0||nc>3)continue;
        if(visited[nr*4+nc])continue;
        dfs(nr,nc,visited,nextPrefix);
      }
      visited[r*4+c]=0;
    }
    for(var r=0;r<4;r++)for(var c=0;c<4;c++){dfs(r,c,{},'');}
    var arr=[];for(var w in found)arr.push(w);
    arr.sort(function(a,b){return b.length-a.length||a.localeCompare(b);});
    return arr;
  }

  function endGame(){
    if(!playing)return;
    playing=false;
    if(timerId)clearInterval(timerId);
    var t=document.getElementById('VWt');if(t)t.classList.remove('vw-urgent');
    var totalAvailable=null;
    try{totalAvailable=solveBoard();}catch(e){console.error(e);}
    allWords=totalAvailable;
    maxScore=0;
    if(allWords){for(var i=0;i<allWords.length;i++)maxScore+=scoreFor(allWords[i].length);}
    // Win bar scales with board size. 15% of a 600-word board is harder than of a 100-word board.
    var won=score>=Math.max(10,maxScore*0.12);
    if(won){_e('game_win');if(_playWin)_playWin();}
    else{_e('game_loss');_play('lose');}
    // Update persisted stats
    stats.gamesPlayed++;
    stats.totalWords+=foundList.length;
    if(score>stats.best)stats.best=score;
    for(var fi=0;fi<foundList.length;fi++){
      if(foundList[fi].length>stats.bestWordLen){stats.bestWordLen=foundList[fi].length;stats.bestWord=foundList[fi];}
    }
    saveStats(stats);
    var be=document.getElementById('VWbest');if(be)be.textContent=stats.best;
    sm('Time! Score '+score+' / '+maxScore);
    _sr('vinewords',{w:won,s:score});
    renderSummary(maxScore);
  }

  function renderSummary(maxScore){
    if(!allWords)return;
    var sumEl=document.getElementById('VWsum');
    var missed=[];
    for(var i=0;i<allWords.length;i++){if(!foundSet[allWords[i]])missed.push(allWords[i]);}
    function group(list){
      var buckets={};
      for(var i=0;i<list.length;i++){var L=list[i].length;if(!buckets[L])buckets[L]=[];buckets[L].push(list[i]);}
      var keys=[];for(var k in buckets)keys.push(parseInt(k,10));
      keys.sort(function(a,b){return b-a;});
      var html='';
      for(var ki=0;ki<keys.length;ki++){
        var L=keys[ki];var ws=buckets[L];
        var pts=scoreFor(L);
        html+='<div style="margin:4px 0;"><span style="color:var(--gold);font-family:Bebas Neue,sans-serif;letter-spacing:0.08em;">'+L+' LETTERS · '+pts+' pt · '+ws.length+'</span><br>';
        var parts=[];
        for(var wi=0;wi<ws.length;wi++){
          var col=L>=8?'#ffd86b':L===7?'#c8a84b':L===6?'#a8c978':'rgba(232,220,200,0.85)';
          parts.push('<span style="color:'+col+';">'+ws[wi].toUpperCase()+'</span>');
        }
        html+=parts.join(' · ')+'</div>';
      }
      return html||'<div>—</div>';
    }
    var pct=maxScore?score/maxScore:0;
    var rank=rankFor(pct);
    var html='';
    html+='<div style="font-family:Bebas Neue,sans-serif;color:var(--gold);font-size:1.1rem;letter-spacing:0.14em;margin-bottom:4px;">TIME UP</div>';
    html+='<div style="font-family:Bebas Neue,sans-serif;color:'+rank.color+';font-size:1.4rem;letter-spacing:0.14em;margin-bottom:6px;">'+rank.name+'</div>';
    html+='<div>Score <strong style="color:var(--gold);">'+score+'</strong> of <strong>'+maxScore+'</strong> possible · '+foundList.length+' of '+allWords.length+' findable words</div>';
    html+='<div style="margin:4px 0 10px;height:6px;background:rgba(26,36,22,0.5);border-radius:3px;overflow:hidden;"><div style="height:100%;background:'+rank.color+';width:'+Math.round(pct*100)+'%;"></div></div>';
    // Action buttons at top so they don't get buried under the missed list
    html+='<div style="display:flex;gap:6px;justify-content:center;margin:6px 0 10px;flex-wrap:wrap;">';
    html+='<button class="gb" onclick="_VWreplay()" style="min-height:44px;padding:8px 14px;background:rgba(200,168,75,0.25);border-color:rgba(200,168,75,0.5);color:#c8a84b;font-size:0.78rem;letter-spacing:0.1em;">↻ REPLAY BOARD</button>';
    html+='<button class="gb" onclick="_VWN()" style="min-height:44px;padding:8px 14px;background:rgba(122,179,86,0.25);border-color:rgba(122,179,86,0.5);color:#7ab356;font-size:0.78rem;letter-spacing:0.1em;">🌱 NEW BOARD</button>';
    html+='</div>';
    html+='<div style="font-family:Bebas Neue,sans-serif;color:var(--sage);font-size:0.9rem;letter-spacing:0.1em;margin-top:6px;">YOU FOUND · '+foundList.length+'</div>';
    html+=group(foundList);
    html+='<div style="font-family:Bebas Neue,sans-serif;color:#d08060;font-size:0.9rem;letter-spacing:0.1em;margin-top:12px;">MISSED · '+missed.length+'</div>';
    html+='<div style="max-height:260px;overflow-y:auto;padding-right:4px;border-top:1px solid rgba(200,168,75,0.15);padding-top:6px;">'+group(missed)+'</div>';
    sumEl.innerHTML=html;
    sumEl.style.display='block';
  }

  window._VWC=function(r,c){
    if(!playing||paused)return;
    if(path.length>0&&path[path.length-1][0]===r&&path[path.length-1][1]===c){submitWord();return;}
    if(addToPath(r,c))render();
  };
  window._VWsub=function(){if(playing)submitWord();};
  window._VWclr=function(){path=[];render();};
  function startRound(sameBoard){
    if(timerId)clearInterval(timerId);
    var sumEl=document.getElementById('VWsum');if(sumEl)sumEl.style.display='none';
    if(sameBoard&&savedBoard)restoreBoard();
    else buildGrid();
    path=[];foundSet={};foundList=[];score=0;timeLeft=duration;playing=true;paused=false;
    var pb=document.getElementById('VWpause');if(pb)pb.textContent='⏸ PAUSE';
    var se=document.getElementById('VWs');if(se)se.textContent='0';
    var we=document.getElementById('VWwords');if(we)we.textContent='0';
    var te=document.getElementById('VWt');if(te){te.textContent=formatTime(duration);te.classList.remove('vw-urgent');}
    renderFound();
    rebuildBoardDOM(); // reseat the 16 cell nodes with the new dice faces
    drawPath();updateWordBar();
    timerId=setInterval(tick,1000);
  }
  window._VWN=function(){startRound(false);};
  window._VWreplay=function(){startRound(true);};

  _VWN();
};
})();
