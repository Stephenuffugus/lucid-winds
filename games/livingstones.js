// ═══ LIVING STONES — Go tsumego (life & death) puzzles ═══
// Pick difficulty, tap an intersection to place a stone, solve the puzzle.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.livingstones = function LS(a){
  var EMPTY=0,BLACK=1,WHITE=2;

  var ALL_PUZZLES = {
    beginner: [
      {size:5, goal:'BLACK — CAPTURE', hint:'Fill the last liberty',
       B:[[1,1],[1,3],[2,0],[2,2],[3,1]], W:[[2,1]], solution:[[3,0]], check:'captured'},
      {size:5, goal:'BLACK — SNAP-BACK', hint:'Sacrifice to capture more',
       B:[[1,1],[1,2],[1,3],[2,0],[2,3],[3,1],[3,2],[3,3]], W:[[2,1],[2,2]], solution:[[2,3]], check:'captured'},
      {size:7, goal:'BLACK — KILL THE GROUP', hint:'Find the vital point',
       B:[[0,3],[1,1],[1,4],[2,0],[2,4],[3,0],[3,1],[3,2],[3,3],[3,4]],
       W:[[0,1],[0,2],[1,2],[1,3],[2,1],[2,2],[2,3]], solution:[[0,0]], check:'dead'},
      {size:7, goal:'BLACK — KILL WHITE', hint:'Play inside the eye space',
       B:[[1,0],[1,1],[1,2],[1,3],[1,4],[0,4]], W:[[0,0],[0,1],[0,2],[0,3]],
       solution:[[0,1]], check:'dead'},
      {size:7, goal:'BLACK — KILL WHITE', hint:'Two eyes needed to live',
       B:[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[1,5],[0,5]],
       W:[[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,1],[1,2],[1,3],[1,4]],
       solution:[[0,2]], check:'dead'},
      {size:5, goal:'BLACK — CAPTURE', hint:'Reduce liberties first',
       B:[[0,0],[0,1],[1,2],[2,0],[2,1],[2,2]], W:[[1,0],[1,1]],
       solution:[[0,2]], check:'captured'},
      {size:7, goal:'BLACK — EDGE CAPTURE', hint:'Edge stones have fewer liberties',
       B:[[1,0],[1,1],[1,2],[0,2]], W:[[0,0],[0,1]], solution:[[0,0]], check:'captured'}
    ],
    intermediate: [
      {size:7, goal:'BLACK — CAPTURE RACE', hint:'Count liberties carefully',
       B:[[0,3],[1,3],[2,3],[2,2],[2,1],[2,0]], W:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],
       solution:[[0,0]], check:'captured'},
      {size:7, goal:'BLACK — KILL BULKY FIVE', hint:'Play in the center',
       B:[[3,0],[3,1],[3,2],[3,3],[3,4],[3,5],[2,5],[1,5],[0,5]],
       W:[[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[2,1],[2,2],[2,3],[2,4]],
       solution:[[1,2]], check:'dead'},
      {size:7, goal:'BLACK — THE HANE', hint:'Diagonal attachment is key',
       B:[[2,0],[2,1],[2,2],[2,3],[1,3],[0,3]], W:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],
       solution:[[0,0]], check:'dead'},
      {size:7, goal:'BLACK — UNDER THE STONES', hint:'The obvious move works',
       B:[[1,0],[1,1],[1,2],[1,3],[0,3]], W:[[0,0],[0,1],[0,2]],
       solution:[[0,0]], check:'captured'},
      {size:7, goal:'BLACK — DOUBLE ATARI', hint:'One move threatens two groups',
       B:[[0,0],[0,2],[1,1],[1,3],[2,0],[2,2],[2,4],[3,1],[3,3]], W:[[1,0],[1,2],[1,4]],
       solution:[[0,1]], check:'captured'},
      {size:7, goal:'BLACK — SQUEEZE', hint:'Tighten the noose',
       B:[[0,3],[1,0],[1,3],[2,0],[2,1],[2,2],[2,3]], W:[[0,0],[0,1],[0,2],[1,1],[1,2]],
       solution:[[0,0]], check:'captured'}
    ],
    advanced: [
      {size:9, goal:'BLACK — KILL CORNER', hint:'The 1-1 point is vital',
       B:[[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]],
       W:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
       solution:[[0,0]], check:'dead'},
      {size:9, goal:'BLACK — KILL WHITE', hint:'Reduce to a false eye',
       B:[[4,0],[4,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,4],[0,4]],
       W:[[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,0],[3,1],[3,2],[3,3]],
       solution:[[1,1]], check:'dead'},
      {size:9, goal:'BLACK — WIN SEMEAI', hint:'Fill outside liberties first',
       B:[[0,4],[1,4],[2,4],[2,3],[2,2],[2,1],[2,0]],
       W:[[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3]],
       solution:[[0,0]], check:'captured'},
      {size:9, goal:'BLACK — KILL L+2 GROUP', hint:'Classic L-group',
       B:[[0,5],[1,5],[2,5],[2,4],[2,3],[2,2],[2,1],[2,0]],
       W:[[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,1],[1,2],[1,3],[1,4]],
       solution:[[0,2]], check:'dead'},
      {size:7, goal:'BLACK — CAPTURE CUTTING STONES', hint:'Net them in',
       B:[[0,0],[0,2],[1,3],[2,0],[2,2],[3,1]], W:[[1,1],[1,2]],
       solution:[[0,1]], check:'captured'},
      {size:9, goal:'BLACK — KILL BIG GROUP', hint:'Center play defeats a five-row',
       B:[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[1,6],[0,6]],
       W:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,0],[1,1],[1,2],[1,3],[1,4],[1,5]],
       solution:[[0,2]], check:'dead'}
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
  function playMove(b,r,c,color,sz){
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
    return{valid:true,captured:captured};
  }

  function renderMenu(){
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:1rem;color:var(--sage);letter-spacing:2px;margin:12px 0;">LIVING STONES</div>';
    h+='<div style="font-style:italic;font-size:0.75rem;color:var(--muted);margin-bottom:16px;">Go life-and-death puzzles</div>';
    var diffs=[['BEGINNER','1-move captures & kills',0],['INTERMEDIATE','Capture race & killing shapes',1],['ADVANCED','Corner life & death',2]];
    for(var i=0;i<diffs.length;i++){
      h+='<button class="gb" onclick="_LSstart('+diffs[i][2]+')" style="display:block;width:220px;margin:6px auto;padding:10px;min-height:48px;">'+diffs[i][0]+'<div style="font-size:0.78rem;opacity:0.85;font-style:italic;margin-top:2px;">'+diffs[i][1]+'</div></button>';
    }
    h+='<div style="margin:18px 0 6px;font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--gold);letter-spacing:2px;">PLAY AI</div>';
    h+='<div style="font-style:italic;font-size:0.72rem;color:var(--muted);margin-bottom:8px;">Full game vs. MCTS opponent</div>';
    var ais=[['9×9 EASY',9,1500],['9×9 MEDIUM',9,4000],['9×9 HARD',9,10000],['13×13 MEDIUM',13,4000]];
    for(var j=0;j<ais.length;j++){
      h+='<button class="gb" onclick="_LSai('+ais[j][1]+','+ais[j][2]+')" style="display:block;width:220px;margin:6px auto;padding:10px;min-height:48px;">'+ais[j][0]+'</button>';
    }
    pan.innerHTML=h;
  }

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
      sm('Not quite — try again');
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
    var px=Math.min(380,window.innerWidth-40);
    var margin=Math.floor(px/(aiSize+1));
    var cell=margin,total=margin*(aiSize+1);
    var svg='<svg width="'+total+'" height="'+total+'" style="background:#2a2418;border-radius:6px;display:block;margin:8px auto;touch-action:none;">';
    for(var i=0;i<aiSize;i++){
      var xy=margin+i*cell;
      svg+='<line x1="'+margin+'" y1="'+xy+'" x2="'+(margin+(aiSize-1)*cell)+'" y2="'+xy+'" stroke="rgba(140,120,80,0.4)" stroke-width="1"/>';
      svg+='<line x1="'+xy+'" y1="'+margin+'" x2="'+xy+'" y2="'+(margin+(aiSize-1)*cell)+'" stroke="rgba(140,120,80,0.4)" stroke-width="1"/>';
    }
    var sr=cell*0.42;
    for(var r=0;r<aiSize;r++){
      for(var c=0;c<aiSize;c++){
        var cx=margin+c*cell,cy=margin+r*cell;
        if(aiBoard[r][c]===BLACK)svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+sr+'" fill="#1a1a1a" stroke="#000" stroke-width="1"/>';
        else if(aiBoard[r][c]===WHITE)svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+sr+'" fill="#e8e8e0" stroke="#888" stroke-width="1"/>';
        else if(!aiThinking&&!aiGameOver)svg+='<rect x="'+(cx-cell/2)+'" y="'+(cy-cell/2)+'" width="'+cell+'" height="'+cell+'" fill="transparent" style="cursor:pointer;" onclick="_LSaiTap('+r+','+c+')"/>';
      }
    }
    svg+='</svg>';
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:var(--gold);letter-spacing:1px;margin:6px 0;">YOU (Black) vs AI (White) — '+aiSize+'×'+aiSize+'</div>';
    h+='<div style="font-size:0.78rem;color:var(--cream);margin-bottom:6px;">Captures — you: '+aiPlayerCaps+' · AI: '+aiOppCaps+'</div>';
    h+=svg;
    h+='<div style="font-style:italic;font-size:0.8rem;color:var(--cream);min-height:1.2em;margin:4px 0;">'+(aiStatus||'')+'</div>';
    h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:6px;">';
    if(!aiGameOver){
      h+='<button class="gb" onclick="_LSaiPass()" style="min-height:44px;padding:8px 14px;"'+(aiThinking?' disabled':'')+'>PASS</button>';
      h+='<button class="gb" onclick="_LSaiResign()" style="min-height:44px;padding:8px 14px;"'+(aiThinking?' disabled':'')+'>RESIGN</button>';
    }
    h+='<button class="gb" onclick="_LSmenu()" style="min-height:44px;padding:8px 14px;">MENU</button>';
    h+='</div>';
    pan.innerHTML=h;
  }
  function aiApplyMove(r,c,color){
    var res=playMove(aiBoard,r,c,color,aiSize);
    if(res.valid&&res.captured){
      if(color===BLACK)aiPlayerCaps+=res.captured;
      else aiOppCaps+=res.captured;
    }
    return res;
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
    return{black:bs,white:ws+0.5};
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
  window._LSai=function(size,playouts){
    aiMode=true;aiSize=size;aiPlayouts=playouts;
    aiInitBoard();
    aiConsecPass=0;aiPlayerCaps=0;aiOppCaps=0;aiGameOver=false;
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
          // first 'ready' is auto on load; set size now
          aiWorker.postMessage({cmd:'boardsize',n:aiSize});
        }else if(readyCount===2){
          aiWorker.postMessage({cmd:'clear_board'});
        }else if(readyCount===3){
          aiThinking=false;aiStatus='Your move.';aiRender();
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
    sm('Play AI — you are Black');
  };
  window._LSaiTap=function(r,c){
    if(aiThinking||aiGameOver)return;
    if(aiBoard[r][c]!==EMPTY)return;
    var res=aiApplyMove(r,c,BLACK);
    if(!res.valid){sm('Invalid move');_play('lose');return;}
    aiConsecPass=0;_play('tap');
    aiWorker.postMessage({cmd:'play',color:'B',move:aiCoordFromRC(r,c)});
    aiRender();
    setTimeout(aiRequestMove,80);
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
    aiGameOver=true;aiStatus='You resigned — AI wins';
    _play('lose');
    _sr('livingstones',{w:false,s:0,lv:'ai'+aiSize,tp:0});
    aiRender();
  };

  renderMenu();
};
})();
