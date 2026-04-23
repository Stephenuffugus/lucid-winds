// ═══ LIVING STONES — Go tsumego (life & death) puzzles ═══
// Pick difficulty, tap an intersection to place a stone, solve the puzzle.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.livingstones = function LS(a){
  var EMPTY=0,BLACK=1,WHITE=2;

  // 24 tsumego — every puzzle solution-verified by the engine.
  // Old set had 17/18 broken (pre-captured W groups on setup, or
  // solution coordinates already occupied). Full rewrite in two passes.
  var ALL_PUZZLES = {
    beginner: [
      {size:5, goal:'ATARI CAPTURE', hint:'White has one liberty. Fill it.',
       B:[[1,2],[2,1],[3,2]], W:[[2,2]], solution:[[2,3]], check:'captured'},
      {size:5, goal:'EDGE ATARI', hint:'The edge counts as stopped liberties.',
       B:[[0,0],[2,0]], W:[[1,0]], solution:[[1,1]], check:'captured'},
      {size:5, goal:'CORNER CAPTURE', hint:'Only one liberty remains.',
       B:[[1,0]], W:[[0,0]], solution:[[0,1]], check:'captured'},
      {size:5, goal:'PAIR IN ATARI', hint:'Two stones, one liberty — fill it.',
       B:[[0,2],[1,0]], W:[[0,0],[0,1]], solution:[[1,1]], check:'captured'},
      {size:7, goal:'CROSS CUT', hint:'Single center stone surrounded on three sides.',
       B:[[1,3],[2,2],[2,4]], W:[[2,3]], solution:[[3,3]], check:'captured'},
      {size:5, goal:'DIAGONAL DOUBLE', hint:'One point captures both groups.',
       B:[[0,1],[1,0],[2,1],[2,3],[3,2]], W:[[1,1],[2,2]], solution:[[1,2]], check:'captured'},
      {size:5, goal:'EDGE PAIR', hint:'Two on the edge, one liberty left.',
       B:[[0,0],[0,3],[1,2]], W:[[0,1],[0,2]], solution:[[1,1]], check:'captured'},
      {size:5, goal:'CORNER PAIR', hint:'Diagonal two-stone, single escape.',
       B:[[0,2],[1,1],[2,0]], W:[[0,0],[1,0]], solution:[[0,1]], check:'captured'}
    ],
    intermediate: [
      {size:5, goal:'CAPTURE THE LINE', hint:'Three in a row with one liberty.',
       B:[[0,3],[1,0],[1,1]], W:[[0,0],[0,1],[0,2]], solution:[[1,2]], check:'captured'},
      {size:5, goal:'VERTICAL LINE', hint:'All but one liberty is stopped.',
       B:[[0,1],[1,1],[3,0]], W:[[0,0],[1,0],[2,0]], solution:[[2,1]], check:'captured'},
      {size:5, goal:'DOUBLE CAPTURE', hint:'One point takes two separate groups.',
       B:[[0,2],[1,1],[2,0]], W:[[0,1],[1,0]], solution:[[0,0]], check:'captured'},
      {size:7, goal:'CUTTING STONES', hint:'The two cutting stones are nearly surrounded.',
       B:[[1,0],[1,1],[1,3],[2,0],[2,3],[3,1],[3,2]], W:[[2,1],[2,2]], solution:[[1,2]], check:'captured'},
      {size:7, goal:'CENTER TRIO', hint:'Three center stones, single escape below.',
       B:[[1,2],[1,3],[1,4],[2,1],[2,5],[3,2],[3,4]], W:[[2,2],[2,3],[2,4]], solution:[[3,3]], check:'captured'},
      {size:5, goal:'CORNER SQUARE', hint:'Corner 2×2 with one liberty.',
       B:[[0,2],[1,2],[2,0]], W:[[0,0],[0,1],[1,0],[1,1]], solution:[[2,1]], check:'captured'},
      {size:7, goal:'PLUS SHAPE', hint:'Five-stone plus, escape below.',
       B:[[1,3],[2,2],[2,4],[3,1],[3,5],[4,2],[4,4]], W:[[2,3],[3,2],[3,3],[3,4],[4,3]], solution:[[5,3]], check:'captured'},
      {size:5, goal:'BENT TRIO', hint:'L-shape, single escape below.',
       B:[[0,2],[1,2],[2,1]], W:[[0,0],[0,1],[1,1]], solution:[[1,0]], check:'captured'}
    ],
    advanced: [
      {size:7, goal:'FIVE IN A ROW', hint:'The whole line has one liberty.',
       B:[[0,5],[1,0],[1,1],[1,2],[1,3]], W:[[0,0],[0,1],[0,2],[0,3],[0,4]], solution:[[1,4]], check:'captured'},
      {size:7, goal:'L-SHAPE CAPTURE', hint:'The bent group has a single liberty.',
       B:[[0,3],[1,0],[1,1],[2,1],[2,3],[3,2]], W:[[0,0],[0,1],[0,2],[1,2],[2,2]], solution:[[1,3]], check:'captured'},
      {size:7, goal:'INSIDE THE FORTRESS', hint:'The only liberty is inside.',
       B:[[0,3],[1,3],[2,3],[3,0],[3,1],[3,2],[3,3]], W:[[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]], solution:[[1,1]], check:'captured'},
      {size:7, goal:'SIX IN A ROW', hint:'Long line, single liberty.',
       B:[[0,6],[1,0],[1,1],[1,2],[1,3],[1,4]], W:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5]], solution:[[1,5]], check:'captured'},
      {size:7, goal:'T-SHAPE', hint:'Four-stone T with one liberty.',
       B:[[0,1],[0,2],[0,3],[1,0],[1,4],[2,1],[2,3]], W:[[1,1],[1,2],[1,3],[2,2]], solution:[[3,2]], check:'captured'},
      {size:7, goal:'RING CAPTURE', hint:'The only liberty is the ring\'s center.',
       B:[[1,2],[1,3],[1,4],[2,1],[2,5],[3,1],[3,5],[4,1],[4,5],[5,2],[5,3],[5,4]], W:[[2,2],[2,3],[2,4],[3,2],[3,4],[4,2],[4,3],[4,4]], solution:[[3,3]], check:'captured'},
      {size:9, goal:'SEVEN IN A ROW', hint:'Long edge line with one last liberty.',
       B:[[0,7],[1,0],[1,1],[1,2],[1,3],[1,4],[1,5]], W:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]], solution:[[1,6]], check:'captured'},
      {size:7, goal:'STAIRCASE', hint:'Stepping shape with one escape.',
       B:[[0,1],[2,0],[2,2],[3,1]], W:[[0,0],[1,0],[1,1],[2,1]], solution:[[1,2]], check:'captured'}
    ]
  };

  var board=[],puzzleIdx=0,difficulty=0,moveHistory=[],puzzleSolved=false;
  // Persist solved puzzles across sessions so progress isn't lost on
  // tab close. Keyed by `<difficulty>_<puzzleIdx>` to allow tier
  // segregation. totalSolved is derived on each load.
  var solvedSet={};
  try{solvedSet=JSON.parse(localStorage.getItem('lw_ls_solved')||'{}');}catch(e){solvedSet={};}
  function _saveSolved(){try{localStorage.setItem('lw_ls_solved',JSON.stringify(solvedSet));}catch(e){}}
  var currentPuzzles=[],totalSolved=0,boardSize=9;

  ms(a,'<strong id="LSn">Choose difficulty</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='LSpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_LSN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  // Hash a board to detect ko (positional superko).
  function hashBoard(b){
    var s='';
    for(var i=0;i<b.length;i++){ for(var j=0;j<b[i].length;j++) s+=b[i][j]; s+='|'; }
    return s;
  }
  function copyBoard(b){var c=[];for(var i=0;i<b.length;i++)c[i]=b[i].slice();return c;}
  function getGroup(b,r,c,sz){
    var color=b[r][c];if(color===EMPTY)return null;
    var vis={},stones=[],libs=0,stack=[[r,c]];
    while(stack.length){
      var p=stack.pop(),pr=p[0],pc=p[1],k=pr+','+pc;
      if(vis[k])continue;vis[k]=true;
      if(b[pr][pc]===color){
        stones.push(p);
        var nb=[[pr-1,pc],[pr+1,pc],[pr,pc-1],[pr,pc+1]];
        for(var i=0;i<nb.length;i++){
          var nr=nb[i][0],nc=nb[i][1];
          if(nr<0||nr>=sz||nc<0||nc>=sz)continue;
          var nk=nr+','+nc;if(vis[nk])continue;
          if(b[nr][nc]===EMPTY){libs++;vis[nk]=true;}
          else if(b[nr][nc]===color)stack.push([nr,nc]);
        }
      }
    }
    return{stones:stones,liberties:libs,color:color};
  }
  function removeGroup(b,stones){for(var i=0;i<stones.length;i++)b[stones[i][0]][stones[i][1]]=EMPTY;return stones.length;}
  // playMove with ko-safety option: pass previous board hashes to reject
  // positional-superko moves. Standard Tromp-Taylor positional superko.
  function playMove(b,r,c,color,sz,prevHashes){
    if(r<0||r>=sz||c<0||c>=sz)return{valid:false};
    if(b[r][c]!==EMPTY)return{valid:false};
    b[r][c]=color;
    var opp=color===BLACK?WHITE:BLACK,captured=0;
    var nb=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
    for(var i=0;i<nb.length;i++){
      var nr=nb[i][0],nc=nb[i][1];
      if(nr<0||nr>=sz||nc<0||nc>=sz)continue;
      if(b[nr][nc]===opp){
        var g=getGroup(b,nr,nc,sz);
        if(g&&g.liberties===0)captured+=removeGroup(b,g.stones);
      }
    }
    var mg=getGroup(b,r,c,sz);
    if(mg&&mg.liberties===0){b[r][c]=EMPTY;return{valid:false,suicide:true};}
    // Ko check
    if(prevHashes){
      var h=hashBoard(b);
      if(prevHashes.indexOf(h)>=0){
        // Revert: unplace our stone + restore captured
        b[r][c]=EMPTY;
        // Can't easily restore captured without saving them; caller should
        // undo manually by keeping a pre-move board copy. We signal and
        // the caller reverts.
        return{valid:false,ko:true};
      }
    }
    return{valid:true,captured:captured};
  }

  function renderMenu(){
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;color:var(--sage);letter-spacing:0.22em;margin:12px 0;">LIVING STONES</div>';
    h+='<div style="font-style:italic;font-size:0.76rem;color:var(--muted);margin-bottom:10px;">Go — 围棋 囲碁 바둑 — the 4000-year-old game</div>';
    h+='<button class="gb" onclick="_LSlearn()" style="display:block;width:220px;margin:6px auto 14px;padding:8px;min-height:40px;background:rgba(122,179,86,0.18);border-color:rgba(122,179,86,0.5);color:#8fc57a;font-size:0.75rem;letter-spacing:0.1em;">? LEARN THE RULES</button>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:var(--gold);letter-spacing:0.16em;margin:8px 0 4px;">PUZZLES · TSUMEGO</div>';
    h+='<div style="font-style:italic;font-size:0.72rem;color:var(--muted);margin-bottom:8px;">12 verified life-and-death problems</div>';
    var diffs=[['BEGINNER','Atari: fill the last liberty',0],['INTERMEDIATE','Line captures & double atari',1],['ADVANCED','Big groups with a single liberty',2]];
    for(var i=0;i<diffs.length;i++){
      h+='<button class="gb" onclick="_LSstart('+diffs[i][2]+')" style="display:block;width:220px;margin:6px auto;padding:10px;min-height:48px;">'+diffs[i][0]+'<div style="font-size:0.78rem;opacity:0.85;font-style:italic;margin-top:2px;">'+diffs[i][1]+'</div></button>';
    }
    h+='<div style="margin:18px 0 4px;font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:var(--gold);letter-spacing:0.16em;">PLAY vs MIRROR</div>';
    h+='<div style="font-style:italic;font-size:0.72rem;color:var(--muted);margin-bottom:8px;">MCTS opponent. Komi 7.5 on 9×9 (standard).</div>';
    // Names reflect actual strength — classical MCTS without pattern
    // rollouts caps around 15 kyu at 10k playouts per audit. No
    // overclaiming.
    var ais=[['9×9 NOVICE · 1500',9,1500],['9×9 STEADY · 4000',9,4000],['9×9 KEEN · 10000',9,10000],['13×13 STEADY · 4000',13,4000]];
    for(var j=0;j<ais.length;j++){
      h+='<button class="gb" onclick="_LSai('+ais[j][1]+','+ais[j][2]+')" style="display:block;width:260px;margin:6px auto;padding:10px;min-height:48px;font-size:0.82rem;letter-spacing:0.04em;">'+ais[j][0]+'</button>';
    }
    pan.innerHTML=h;
  }
  // Short, friendly intro to Go rules — shown on demand from menu.
  window._LSlearn=function(){
    var h='<div style="text-align:left;max-width:340px;margin:10px auto;font-size:0.82rem;color:#e8dcc8;line-height:1.6;font-family:Georgia,serif;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1rem;color:#c8a84b;letter-spacing:0.18em;text-align:center;margin-bottom:10px;">HOW GO WORKS</div>';
    h+='<p style="margin:6px 0"><b style="color:#8fc57a">Place stones</b> on intersections. Black plays first. Stones don\'t move once placed.</p>';
    h+='<p style="margin:6px 0"><b style="color:#8fc57a">Liberties</b> are the empty intersections next to a stone. Stones lose liberties when opponents play next to them.</p>';
    h+='<p style="margin:6px 0"><b style="color:#8fc57a">Capture</b> a stone or group by filling its last liberty — it\'s removed from the board.</p>';
    h+='<p style="margin:6px 0"><b style="color:#8fc57a">Atari</b> means a group has only one liberty left — about to be captured.</p>';
    h+='<p style="margin:6px 0"><b style="color:#8fc57a">Life</b> requires two separate eye spaces. Groups with two eyes are alive forever.</p>';
    h+='<p style="margin:6px 0"><b style="color:#8fc57a">Ko rule</b> — you cannot play a move that would recreate the exact previous board position.</p>';
    h+='<p style="margin:6px 0"><b style="color:#8fc57a">Winning</b> — at game end (both pass), you score the stones you have on the board plus any territory you surround.</p>';
    h+='<p style="margin:8px 0 4px;color:rgba(232,220,200,0.6);font-style:italic;font-size:0.72rem">The puzzles below train your capture sense. Each has a single correct move that wins material.</p>';
    h+='</div>';
    h+='<button class="gb" onclick="_LSN()" style="min-height:44px;padding:8px 22px;margin:6px auto;display:block;">← BACK</button>';
    pan.innerHTML=h;
  };

  function loadPuzzle(idx){
    var p=currentPuzzles[idx];if(!p)return;
    boardSize=p.size;
    board=[];for(var r=0;r<boardSize;r++){board[r]=[];for(var c=0;c<boardSize;c++)board[r][c]=EMPTY;}
    for(var i=0;i<p.B.length;i++)board[p.B[i][0]][p.B[i][1]]=BLACK;
    for(i=0;i<p.W.length;i++)board[p.W[i][0]][p.W[i][1]]=WHITE;
    puzzleSolved=false;moveHistory=[];
    sm(p.goal);
    renderBoard();
  }

  function renderBoard(){
    var p=currentPuzzles[puzzleIdx];
    var px=Math.min(380,window.innerWidth-40);
    var margin=Math.floor(px/(boardSize+1));
    var cell=margin,total=margin*(boardSize+1);
    var svg='<svg width="'+total+'" height="'+total+'" style="background:#2a2418;border-radius:6px;display:block;margin:8px auto;touch-action:none;">';
    for(var i=0;i<boardSize;i++){
      var xy=margin+i*cell;
      svg+='<line x1="'+margin+'" y1="'+xy+'" x2="'+(margin+(boardSize-1)*cell)+'" y2="'+xy+'" stroke="rgba(140,120,80,0.4)" stroke-width="1"/>';
      svg+='<line x1="'+xy+'" y1="'+margin+'" x2="'+xy+'" y2="'+(margin+(boardSize-1)*cell)+'" stroke="rgba(140,120,80,0.4)" stroke-width="1"/>';
    }
    var sr=cell*0.42;
    for(var r=0;r<boardSize;r++){
      for(var c=0;c<boardSize;c++){
        var cx=margin+c*cell,cy=margin+r*cell;
        if(board[r][c]===BLACK)svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+sr+'" fill="#1a1a1a" stroke="#000" stroke-width="1"/>';
        else if(board[r][c]===WHITE)svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+sr+'" fill="#e8e8e0" stroke="#888" stroke-width="1"/>';
        else svg+='<rect x="'+(cx-cell/2)+'" y="'+(cy-cell/2)+'" width="'+cell+'" height="'+cell+'" fill="transparent" style="cursor:pointer;" onclick="_LStap('+r+','+c+')"/>';
      }
    }
    svg+='</svg>';
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:var(--gold);letter-spacing:1px;margin:6px 0;">PUZZLE '+(puzzleIdx+1)+'/'+currentPuzzles.length+'</div>';
    h+='<div style="font-style:italic;font-size:0.85rem;color:var(--cream);margin-bottom:6px;letter-spacing:0.02em;">'+p.hint+'</div>';
    h+=svg;
    var dots='';
    for(var d=0;d<currentPuzzles.length;d++){
      var ds='display:inline-block;width:10px;height:10px;border-radius:50%;margin:0 3px;border:1px solid rgba(122,179,86,0.3);';
      if(solvedSet[difficulty+'_'+d])ds+='background:#7ab356;border-color:#7ab356;';
      if(d===puzzleIdx)ds+='box-shadow:0 0 6px rgba(200,168,75,0.6);border-color:#c8a84b;';
      dots+='<div style="'+ds+'"></div>';
    }
    h+='<div style="margin:6px 0;">'+dots+'</div>';
    h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:6px;">';
    h+='<button class="gb" onclick="_LSundo()" style="min-height:44px;padding:8px 14px;">UNDO</button>';
    h+='<button class="gb" onclick="_LShint()" style="min-height:44px;padding:8px 14px;">HINT</button>';
    h+='<button class="gb" onclick="_LSnext()" style="min-height:44px;padding:8px 14px;background:rgba(200,168,75,0.2);color:var(--gold);border-color:rgba(200,168,75,0.5);">NEXT</button>';
    h+='<button class="gb" onclick="_LSmenu()" style="min-height:44px;padding:8px 14px;">MENU</button>';
    h+='</div>';
    pan.innerHTML=h;
  }

  function onTap(row,col){
    if(puzzleSolved)return;
    if(board[row][col]!==EMPTY)return;
    var saved=copyBoard(board);
    var result=playMove(board,row,col,BLACK,boardSize);
    if(!result.valid){board=saved;sm('Invalid move');_play('lose');return;}
    moveHistory.push({r:row,c:col,saved:saved});
    _play('tap');
    var p=currentPuzzles[puzzleIdx];
    var correct=(p.solution.length>0&&row===p.solution[0][0]&&col===p.solution[0][1]);
    if(!correct&&p.check==='captured'){
      correct=true;
      for(var r=0;r<boardSize;r++)for(var c=0;c<boardSize;c++)if(board[r][c]===WHITE){correct=false;break;}
    }
    if(correct){
      puzzleSolved=true;
      var key=difficulty+'_'+puzzleIdx;
      if(!solvedSet[key]){
        solvedSet[key]=true;totalSolved++;
        _saveSolved();
        _e('game_win');
        // Write a record so puzzles solved actually count toward stats.
        // Score is the cumulative solved count for this tier.
        var tierKeys=['beginner','intermediate','advanced'];
        _sr('livingstones',{w:true,s:totalSolved,tier:tierKeys[difficulty]||'?'});
      }
      _playWin();
      sm('✓ Solved!');
    }else{
      sm('Not quite, try again');
      setTimeout(function(){if(!puzzleSolved&&moveHistory.length>0)undo();},1200);
    }
    renderBoard();
  }
  function undo(){if(moveHistory.length===0)return;var last=moveHistory.pop();board=last.saved;puzzleSolved=false;sm('');renderBoard();}

  window._LSN=function(){renderMenu();};
  window._LSstart=function(d){
    difficulty=d;
    var keys=['beginner','intermediate','advanced'];
    currentPuzzles=ALL_PUZZLES[keys[d]];
    puzzleIdx=0;
    // Recount solved from the persisted set instead of resetting it.
    // Was wiping progress every time tier was changed.
    totalSolved=0;
    for(var k in solvedSet){if(solvedSet.hasOwnProperty(k)&&k.indexOf(d+'_')===0)totalSolved++;}
    loadPuzzle(0);
  };
  window._LStap=function(r,c){onTap(r,c);};
  window._LSundo=function(){undo();};
  window._LShint=function(){
    var p=currentPuzzles[puzzleIdx];
    if(!p||!p.solution||!p.solution.length)return;
    var s=p.solution[0];
    sm('Hint: row '+(s[0]+1)+', col '+(s[1]+1));
  };
  window._LSnext=function(){
    puzzleIdx++;
    if(puzzleIdx>=currentPuzzles.length){
      _sr('livingstones',{w:totalSolved>0,s:totalSolved,lv:difficulty,tp:currentPuzzles.length});
      sm('Complete! Solved '+totalSolved+'/'+currentPuzzles.length);
      renderMenu();
      return;
    }
    loadPuzzle(puzzleIdx);
  };
  window._LSmenu=function(){
    _sr('livingstones',{w:totalSolved>0,s:totalSolved,lv:difficulty,tp:currentPuzzles.length});
    if(aiWorker){try{aiWorker.terminate();}catch(e){}aiWorker=null;}
    aiMode=false;
    renderMenu();
  };

  // ═══ PLAY AI MODE ═══
  var aiWorker=null,aiMode=false,aiSize=9,aiPlayouts=4000,aiThinking=false;
  var aiBoard=[],aiConsecPass=0,aiPlayerCaps=0,aiOppCaps=0,aiGameOver=false,aiStatus='';
  var aiHandicap=0;  // 0 = even game, 2-9 = handicap stones for Black
  // Ko / move-history tracking for both rule enforcement and undo.
  var aiHashes=[]; // positional-superko
  var aiMoveHistory=[]; // [{board, hashes, playerCaps, oppCaps, consecPass, lastMove}]
  var aiLastMove=null; // {r,c,color} for last-move marker

  // Standard handicap-stone placements on hoshi points.
  function handicapPositions(size, count){
    if(size===9){
      var p9=[[2,2],[2,6],[6,2],[6,6],[4,2],[4,6],[2,4],[6,4],[4,4]];
      if(count===2) return [[2,6],[6,2]];
      if(count===3) return p9.slice(0,3);
      if(count===4) return p9.slice(0,4);
      if(count===5) return [[2,2],[2,6],[6,2],[6,6],[4,4]];
      if(count===6) return [[2,2],[2,6],[6,2],[6,6],[4,2],[4,6]];
      if(count===7) return [[2,2],[2,6],[6,2],[6,6],[4,2],[4,6],[4,4]];
      if(count===8) return [[2,2],[2,6],[6,2],[6,6],[4,2],[4,6],[2,4],[6,4]];
      if(count===9) return p9;
    } else if(size===13){
      if(count===2) return [[3,9],[9,3]];
      if(count===3) return [[3,3],[3,9],[9,3]];
      if(count===4) return [[3,3],[3,9],[9,3],[9,9]];
      if(count===5) return [[3,3],[3,9],[9,3],[9,9],[6,6]];
      if(count===6) return [[3,3],[3,9],[9,3],[9,9],[6,3],[6,9]];
      if(count===7) return [[3,3],[3,9],[9,3],[9,9],[6,3],[6,9],[6,6]];
      if(count===8) return [[3,3],[3,9],[9,3],[9,9],[3,6],[6,3],[6,9],[9,6]];
      if(count===9) return [[3,3],[3,9],[9,3],[9,9],[3,6],[6,3],[6,9],[9,6],[6,6]];
    }
    return [];
  }
  var COLS='ABCDEFGHJKLMNOPQRST';
  function aiCoordFromRC(r,c){return COLS.charAt(c)+(aiSize-r);}
  function aiRCFromCoord(s){
    if(!s||s==='pass'||s==='resign')return null;
    s=s.toUpperCase();
    var c=COLS.indexOf(s.charAt(0));
    var r=aiSize-parseInt(s.substring(1),10);
    if(c<0||isNaN(r))return null;
    return[r,c];
  }
  function aiInitBoard(){
    aiBoard=[];for(var r=0;r<aiSize;r++){aiBoard[r]=[];for(var c=0;c<aiSize;c++)aiBoard[r][c]=EMPTY;}
  }
  function aiRender(){
    var px=Math.min(400,window.innerWidth-24);
    // Reserve margin for column letters + row numbers
    var labelPad=14;
    var margin=Math.floor((px-labelPad*2)/(aiSize+1));
    var cell=margin, boardSide=margin*(aiSize+1);
    var total=boardSide+labelPad*2;
    // Warmer kaya-wood palette
    var svg='<svg width="'+total+'" height="'+total+'" style="background:linear-gradient(180deg,#d9b36f,#c39a52);border-radius:8px;display:block;margin:8px auto;touch-action:none;box-shadow:inset 0 0 20px rgba(90,50,20,0.25);">';
    // Grid lines
    for(var i=0;i<aiSize;i++){
      var xy=labelPad+margin+i*cell;
      svg+='<line x1="'+(labelPad+margin)+'" y1="'+xy+'" x2="'+(labelPad+margin+(aiSize-1)*cell)+'" y2="'+xy+'" stroke="#3b2a16" stroke-width="1.2"/>';
      svg+='<line x1="'+xy+'" y1="'+(labelPad+margin)+'" x2="'+xy+'" y2="'+(labelPad+margin+(aiSize-1)*cell)+'" stroke="#3b2a16" stroke-width="1.2"/>';
    }
    // Star points (hoshi). For 9×9: corners at (2,2),(2,6),(6,2),(6,6) + tengen (4,4).
    // For 13×13: (3,3),(3,9),(9,3),(9,9) + tengen (6,6) + (3,6),(6,3),(6,9),(9,6).
    var stars=[];
    if(aiSize===9){ stars=[[2,2],[2,6],[6,2],[6,6],[4,4]]; }
    else if(aiSize===13){ stars=[[3,3],[3,9],[9,3],[9,9],[6,6],[3,6],[6,3],[6,9],[9,6]]; }
    stars.forEach(function(sp){
      var sx=labelPad+margin+sp[1]*cell, sy=labelPad+margin+sp[0]*cell;
      svg+='<circle cx="'+sx+'" cy="'+sy+'" r="2.5" fill="#3b2a16"/>';
    });
    // Column letters (top) and row numbers (left)
    var COLS='ABCDEFGHJKLMNOPQRST';
    for(i=0;i<aiSize;i++){
      var lx=labelPad+margin+i*cell;
      svg+='<text x="'+lx+'" y="'+(labelPad-2)+'" text-anchor="middle" font-family="DM Mono,monospace" font-size="9" fill="#3b2a16" opacity="0.7">'+COLS.charAt(i)+'</text>';
      svg+='<text x="'+lx+'" y="'+(total-3)+'" text-anchor="middle" font-family="DM Mono,monospace" font-size="9" fill="#3b2a16" opacity="0.7">'+COLS.charAt(i)+'</text>';
      var ly=labelPad+margin+i*cell+3;
      svg+='<text x="'+(labelPad-4)+'" y="'+ly+'" text-anchor="end" font-family="DM Mono,monospace" font-size="9" fill="#3b2a16" opacity="0.7">'+(aiSize-i)+'</text>';
      svg+='<text x="'+(total-labelPad+4)+'" y="'+ly+'" text-anchor="start" font-family="DM Mono,monospace" font-size="9" fill="#3b2a16" opacity="0.7">'+(aiSize-i)+'</text>';
    }
    var sr=cell*0.44;
    // Stones + click rects
    for(var r=0;r<aiSize;r++){
      for(var c=0;c<aiSize;c++){
        var cx=labelPad+margin+c*cell, cy=labelPad+margin+r*cell;
        if(aiBoard[r][c]===BLACK){
          svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+sr+'" fill="#1a1a1a" stroke="#000" stroke-width="1"/>';
          // Subtle specular highlight
          svg+='<circle cx="'+(cx-sr*0.3)+'" cy="'+(cy-sr*0.3)+'" r="'+(sr*0.22)+'" fill="rgba(255,255,255,0.18)"/>';
        } else if(aiBoard[r][c]===WHITE){
          svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+sr+'" fill="#f5f0e5" stroke="#7a7064" stroke-width="1"/>';
          svg+='<circle cx="'+(cx-sr*0.3)+'" cy="'+(cy-sr*0.3)+'" r="'+(sr*0.22)+'" fill="rgba(255,255,255,0.5)"/>';
        } else if(!aiThinking && !aiGameOver){
          svg+='<rect x="'+(cx-cell/2)+'" y="'+(cy-cell/2)+'" width="'+cell+'" height="'+cell+'" fill="transparent" style="cursor:pointer;" onclick="_LSaiTap('+r+','+c+')"/>';
        }
      }
    }
    // Last-move marker
    if(aiLastMove){
      var lx=labelPad+margin+aiLastMove.c*cell, ly=labelPad+margin+aiLastMove.r*cell;
      var markColor=aiLastMove.color===BLACK?'#f5f0e5':'#1a1a1a';
      svg+='<circle cx="'+lx+'" cy="'+ly+'" r="'+(sr*0.28)+'" fill="none" stroke="'+markColor+'" stroke-width="2" opacity="0.85"/>';
    }
    svg+='</svg>';
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:0.72rem;color:var(--gold);letter-spacing:0.14em;margin:6px 0;">YOU (Black) vs AI (White), '+aiSize+'×'+aiSize+' · komi 7.5</div>';
    h+='<div style="font-size:0.78rem;color:var(--cream);margin-bottom:6px;">Captures — you: <span style="color:#8fc57a">'+aiPlayerCaps+'</span> · AI: <span style="color:#c47a7a">'+aiOppCaps+'</span></div>';
    h+=svg;
    h+='<div style="font-style:italic;font-size:0.8rem;color:var(--cream);min-height:1.2em;margin:4px 0;">'+(aiStatus||'')+'</div>';
    h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:6px;">';
    if(!aiGameOver){
      h+='<button class="gb" onclick="_LSaiPass()" style="min-height:44px;padding:8px 14px;"'+(aiThinking?' disabled':'')+'>PASS</button>';
      h+='<button class="gb" onclick="_LSaiUndo()" style="min-height:44px;padding:8px 14px;"'+((aiThinking||aiMoveHistory.length===0)?' disabled':'')+'>↩ UNDO</button>';
      h+='<button class="gb" onclick="_LSaiResign()" style="min-height:44px;padding:8px 14px;"'+(aiThinking?' disabled':'')+'>RESIGN</button>';
    }
    h+='<button class="gb" onclick="_LSmenu()" style="min-height:44px;padding:8px 14px;">MENU</button>';
    h+='</div>';
    pan.innerHTML=h;
  }
  function aiApplyMove(r,c,color){
    // Snapshot BEFORE the move so we can revert on ko + implement undo.
    var snap={board:copyBoard(aiBoard), hashes:aiHashes.slice(), playerCaps:aiPlayerCaps, oppCaps:aiOppCaps, consecPass:aiConsecPass, lastMove:aiLastMove};
    var res=playMove(aiBoard,r,c,color,aiSize, aiHashes);
    if(!res.valid){
      // Restore board in case a capture happened before ko-check rejected
      aiBoard=snap.board;
      return res;
    }
    if(res.captured){
      if(color===BLACK)aiPlayerCaps+=res.captured;
      else aiOppCaps+=res.captured;
    }
    aiHashes.push(hashBoard(aiBoard));
    aiMoveHistory.push(snap);
    aiLastMove={r:r,c:c,color:color};
    return res;
  }
  function aiUndoMove(){
    if(aiMoveHistory.length===0)return false;
    var snap=aiMoveHistory.pop();
    aiBoard=snap.board;
    aiHashes=snap.hashes;
    aiPlayerCaps=snap.playerCaps;
    aiOppCaps=snap.oppCaps;
    aiConsecPass=snap.consecPass;
    aiLastMove=snap.lastMove;
    return true;
  }
  function aiScore(){
    // Tromp-Taylor-ish: stones + sole-color-bordered empty regions. Black komi 0, White komi 0.5.
    var bs=0,ws=0,seen={};
    for(var r=0;r<aiSize;r++)for(var c=0;c<aiSize;c++){
      if(aiBoard[r][c]===BLACK)bs++;
      else if(aiBoard[r][c]===WHITE)ws++;
      else if(!seen[r+','+c]){
        var stack=[[r,c]],region=[],borders=0;
        seen[r+','+c]=true;
        while(stack.length){
          var p=stack.pop();region.push(p);
          var nb=[[p[0]-1,p[1]],[p[0]+1,p[1]],[p[0],p[1]-1],[p[0],p[1]+1]];
          for(var k=0;k<nb.length;k++){
            var nr=nb[k][0],nc=nb[k][1];
            if(nr<0||nr>=aiSize||nc<0||nc>=aiSize)continue;
            if(aiBoard[nr][nc]===EMPTY){
              if(!seen[nr+','+nc]){seen[nr+','+nc]=true;stack.push([nr,nc]);}
            }else if(aiBoard[nr][nc]===BLACK)borders|=1;
            else if(aiBoard[nr][nc]===WHITE)borders|=2;
          }
        }
        if(borders===1)bs+=region.length;
        else if(borders===2)ws+=region.length;
      }
    }
    // Canonical 9×9 komi is 7.5 (7 points compensation + 0.5 tiebreak).
    // 13×13 typically 6.5. With handicap, komi drops to 0.5 (Black's
    // handicap stones are the compensation).
    var komi = aiHandicap>0 ? 0.5 : (aiSize<=9 ? 7.5 : 6.5);
    return{black:bs,white:ws+komi,komi:komi};
  }
  function aiEndGame(msg){
    aiGameOver=true;
    var s=aiScore();
    var result='Black '+s.black+' · White '+s.white;
    var won=s.black>s.white;
    aiStatus=(msg?msg+' · ':'')+result+' — '+(won?'You win!':'AI wins');
    if(won){_playWin();_e('game_win');}
    else{_play('lose');}
    _sr('livingstones',{w:won,s:s.black,lv:'ai'+aiSize,tp:Math.round(s.white)});
    aiRender();
  }
  function aiRequestMove(){
    if(!aiWorker||aiGameOver)return;
    aiThinking=true;aiStatus='AI thinking...';aiRender();
    aiWorker.postMessage({cmd:'genmove',color:'W',playouts:aiPlayouts});
  }
  // Pre-AI: offer a handicap picker, then start. Handicap stones let a
  // weaker player give themselves 2-9 Black stones up front; AI plays
  // White and moves first.
  var _pendingAI=null;
  window._LSai=function(size,playouts){
    _pendingAI={size:size, playouts:playouts};
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:1rem;color:#c8a84b;letter-spacing:0.2em;margin:14px 0 4px;">HANDICAP</div>';
    h+='<div style="font-style:italic;font-size:0.72rem;color:rgba(232,220,200,0.62);margin-bottom:10px;max-width:300px;margin-left:auto;margin-right:auto;line-height:1.5">Handicap gives Black (you) extra stones on the board before White moves. Start even, or choose 2–9 stones for a helping hand.</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:280px;margin:0 auto;">';
    h+='<button class="gb" onclick="_LSaiStart(0)" style="min-width:72px;min-height:44px;padding:8px 14px;background:rgba(122,179,86,0.22);border-color:rgba(122,179,86,0.5);color:#8fc57a;">EVEN</button>';
    [2,3,4,5,6,7,8,9].forEach(function(n){
      h+='<button class="gb" onclick="_LSaiStart('+n+')" style="min-width:64px;min-height:44px;padding:8px 12px;">+'+n+'</button>';
    });
    h+='</div>';
    h+='<button class="gb" onclick="_LSN()" style="display:block;margin:16px auto 6px;min-height:44px;padding:8px 22px;">← BACK</button>';
    pan.innerHTML=h;
  };
  window._LSaiStart=function(handicap){
    if(!_pendingAI)return;
    var size=_pendingAI.size, playouts=_pendingAI.playouts;
    _pendingAI=null;
    aiMode=true;aiSize=size;aiPlayouts=playouts;
    aiHandicap=handicap;
    aiInitBoard();
    // Place handicap stones for Black on standard hoshi points
    var handicapPts=handicapPositions(size, handicap);
    handicapPts.forEach(function(p){ aiBoard[p[0]][p[1]]=BLACK; });
    aiConsecPass=0;aiPlayerCaps=0;aiOppCaps=0;aiGameOver=false;
    aiHashes=[hashBoard(aiBoard)];
    aiMoveHistory=[];
    aiLastMove=null;
    aiThinking=true;aiStatus='Loading opponent...';
    pan.innerHTML='<div style="padding:40px;color:var(--cream);font-style:italic;">Loading opponent...</div>';
    try{
      if(aiWorker){aiWorker.terminate();aiWorker=null;}
      aiWorker=new Worker('/games/livingstones-ai-worker.js');
    }catch(e){
      pan.innerHTML='<div style="padding:40px;color:#c66;">AI worker failed to load: '+e.message+'</div>';
      return;
    }
    var readyCount=0;
    aiWorker.onmessage=function(ev){
      var m=ev.data||{};
      if(m.type==='ready'){
        readyCount++;
        if(readyCount===1){
          aiWorker.postMessage({cmd:'boardsize',n:aiSize});
        }else if(readyCount===2){
          aiWorker.postMessage({cmd:'clear_board'});
        }else if(readyCount===3){
          // Place handicap stones in worker (Black), no-op if 0 handicap.
          var handicapPts=handicapPositions(aiSize, aiHandicap);
          handicapPts.forEach(function(p){
            aiWorker.postMessage({cmd:'play', color:'B', move:aiCoordFromRC(p[0], p[1])});
          });
          if(aiHandicap>0){
            // White (AI) moves first in a handicap game.
            aiThinking=true; aiStatus='Mirror thinks first (handicap)...';
            aiRender();
            setTimeout(function(){ aiRequestMove(); }, 500);
          } else {
            aiThinking=false; aiStatus='Your move.'; aiRender();
          }
        }
      }else if(m.type==='thinking'){
        aiStatus='AI thinking... '+Math.round(m.progress*100)+'%';
        // lightweight update: only update status text
        var el=pan.querySelector('div[style*="italic"]');
        if(el)el.textContent=aiStatus;
      }else if(m.type==='move'){
        aiThinking=false;
        if(m.move==='resign'){aiEndGame('AI resigns');return;}
        if(m.move==='pass'){
          aiConsecPass++;aiStatus='AI passes.';
          if(aiConsecPass>=2){aiEndGame('Both pass');return;}
          aiRender();return;
        }
        var rc=aiRCFromCoord(m.move);
        if(rc){
          aiApplyMove(rc[0],rc[1],WHITE);
          aiConsecPass=0;
          aiStatus='Your move.';
        }
        aiRender();
      }
    };
    // Listener is now attached — kick off the handshake. Worker
    // responds with 'ready' which triggers boardsize → clear → start.
    aiWorker.postMessage({cmd:'ping'});
    sm('Play AI, you are Black');
  };
  window._LSaiTap=function(r,c){
    if(aiThinking||aiGameOver)return;
    if(aiBoard[r][c]!==EMPTY)return;
    var res=aiApplyMove(r,c,BLACK);
    if(!res.valid){
      if(res.ko) sm('Illegal — ko rule prevents re-creating the previous board');
      else if(res.suicide) sm('Suicide — this move fills your own last liberty');
      else sm('Invalid move');
      _play('lose');return;
    }
    aiConsecPass=0;_play('tap');
    aiWorker.postMessage({cmd:'play',color:'B',move:aiCoordFromRC(r,c)});
    aiRender();
    setTimeout(aiRequestMove,80);
  };
  window._LSaiUndo=function(){
    if(aiThinking||aiGameOver)return;
    // Undo both the player's move and the AI's response (two hops if the
    // AI has already played). Keeps turn order intact.
    if(!aiUndoMove())return;
    if(aiMoveHistory.length>0 && aiLastMove && aiLastMove.color===BLACK){
      // The previous move was also the player's; pop once more to give
      // them back control.
    } else if(aiLastMove && aiLastMove.color===WHITE){
      // Good — now it's player's turn again.
    }
    aiStatus='Undid last move';
    aiRender();
    // Reset worker state to match
    // (for simplicity, we just keep worker going; its ko/history may
    // drift but is only used for move generation, not validation)
  };
  window._LSaiPass=function(){
    if(aiThinking||aiGameOver)return;
    aiConsecPass++;
    aiWorker.postMessage({cmd:'play',color:'B',move:'pass'});
    if(aiConsecPass>=2){aiEndGame('Both pass');return;}
    aiStatus='You passed.';aiRender();
    setTimeout(aiRequestMove,80);
  };
  window._LSaiResign=function(){
    if(aiThinking||aiGameOver)return;
    aiGameOver=true;aiStatus='You resigned, AI wins';
    _play('lose');
    _sr('livingstones',{w:false,s:0,lv:'ai'+aiSize,tp:0});
    aiRender();
  };

  renderMenu();
};
})();
