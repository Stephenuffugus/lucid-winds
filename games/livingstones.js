// ═══ LIVING STONES — Go tsumego (life & death) puzzles ═══
// Pick difficulty, tap an intersection to place a stone, solve the puzzle.
(function(){
'use strict';

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
  var solvedSet={},currentPuzzles=[],totalSolved=0,boardSize=9;

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
      h+='<button class="gb" onclick="_LSstart('+diffs[i][2]+')" style="display:block;width:220px;margin:6px auto;padding:10px;min-height:48px;">'+diffs[i][0]+'<div style="font-size:0.6rem;opacity:0.7;font-style:italic;margin-top:2px;">'+diffs[i][1]+'</div></button>';
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
    h+='<div style="font-style:italic;font-size:0.65rem;color:var(--muted);margin-bottom:4px;">'+p.hint+'</div>';
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
      if(!solvedSet[difficulty+'_'+puzzleIdx]){solvedSet[difficulty+'_'+puzzleIdx]=true;totalSolved++;_e('game_win');}
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
    puzzleIdx=0;totalSolved=0;solvedSet={};
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
    renderMenu();
  };

  renderMenu();
};
})();
