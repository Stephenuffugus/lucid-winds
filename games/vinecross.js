// ═══ VINE CROSS — Gomoku / Five in a Row ═══
// Place stones on intersections. First to connect 5 wins.
//
// Researched from top Gomoku/Five-in-Row apps:
// - Standard open Gomoku rules (no Renju restrictions, first-player
//   advantage accepted)
// - Star-point markers at traditional Go positions
// - Threat-aware minimax with open-pattern bonuses
// - UNDO + REDO, stats, hint, 4 tier-named difficulty levels
// - Canvas rendering scales to viewport for comfortable thumb play
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

// Persistent preferences
function _vcLoad(k,d){try{var v=localStorage.getItem(k);return v==null?d:v;}catch(e){return d;}}
function _vcSave(k,v){try{localStorage.setItem(k,String(v));}catch(e){}}

window._gameFns=window._gameFns||{};
window._gameFns.vinecross=function VC(a){
  var SZ=parseInt(_vcLoad('lw_vc_sz','13'),10)||13;
  var LVL=parseInt(_vcLoad('lw_vc_diff','3'),10)||3; // 1-4 tier
  var CELL=32,PAD=16;
  var board,turn,moves,hist,redoStack,gameOver,winner,lastMove,winLine;
  var thinking=false,hintPos=null;
  var cvs,ctx;
  var stats={w:0,l:0,d:0,streak:0,best:0};
  try{var _s=localStorage.getItem('lw_vc_stats');if(_s){var _p=JSON.parse(_s);for(var _k in _p)stats[_k]=_p[_k];}}catch(e){}

  ms(a,'<span style="color:#7ab356">●</span> Five in a Row, <strong id="VCst">Your turn</strong>');
  mm(a);
  // Stats strip
  var statsRow=document.createElement('div');statsRow.id='VCstats';
  statsRow.style.cssText='display:flex;justify-content:center;gap:14px;padding:2px 0;font-family:DM Mono,monospace;font-size:0.62rem;color:rgba(232,220,200,0.72);letter-spacing:0.06em';
  a.appendChild(statsRow);
  var pan=document.createElement('div');pan.id='VCpan';
  pan.style.cssText='max-width:560px;margin:0 auto;padding:4px;user-select:none;text-align:center;';
  a.appendChild(pan);
  // Tools row — Undo / Redo / Hint
  var toolRow=document.createElement('div');
  toolRow.style.cssText='display:flex;gap:6px;justify-content:center;padding:4px 0;flex-wrap:wrap';
  toolRow.innerHTML='<button class="gb" id="VCundo" onclick="_VCU()" style="min-height:44px;padding:8px 16px;font-size:0.65rem">↩ UNDO</button>'
    +'<button class="gb" id="VCredo" onclick="_VCR()" style="min-height:44px;padding:8px 16px;font-size:0.65rem">↪ REDO</button>'
    +'<button class="gb" id="VChint" onclick="_VCH()" style="min-height:44px;padding:8px 16px;font-size:0.65rem">💡 HINT</button>';
  a.appendChild(toolRow);
  // Diff + size + new game
  mc(a).innerHTML='<select class="gsl" id="VCd" onchange="_VCL(this.value)" style="min-width:140px">'
    +'<option value="1">Seedling</option>'
    +'<option value="2">Sapling</option>'
    +'<option value="3">Grove</option>'
    +'<option value="4">Old Growth</option>'
    +'</select>'
    +'<select class="gsl" id="VCs" onchange="_VCSZ(this.value)" style="min-width:100px">'
    +'<option value="9">9×9</option>'
    +'<option value="11">11×11</option>'
    +'<option value="13">13×13</option>'
    +'<option value="15">15×15</option>'
    +'</select>'
    +'<button class="gb-new" onclick="_VCN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function renderStats(){
    var played=stats.w+stats.l+stats.d;
    var pct=played?Math.round(stats.w/played*100):0;
    statsRow.innerHTML='played <strong style="color:var(--gold)">'+played+'</strong>'
      +' · won <strong style="color:var(--gold)">'+pct+'%</strong>'
      +' · streak <strong style="color:var(--gold)">'+stats.streak+'</strong>'
      +' · best <strong style="color:var(--gold)">'+stats.best+'</strong>';
  }
  function saveStats(){try{localStorage.setItem('lw_vc_stats',JSON.stringify(stats));}catch(e){}}

  function init(){
    board=[];for(var r=0;r<SZ;r++){board[r]=[];for(var c=0;c<SZ;c++)board[r][c]=0;}
    turn=1;moves=0;hist=[];redoStack=[];gameOver=false;winner=0;lastMove=null;winLine=null;thinking=false;hintPos=null;
    // Sync UI selects
    var ds=document.getElementById('VCd');if(ds)ds.value=String(LVL);
    var ss=document.getElementById('VCs');if(ss)ss.value=String(SZ);
    renderUI();drawBoard();updateButtons();
    var st=document.getElementById('VCst');if(st)st.textContent='Your turn';
  }

  function renderUI(){
    // Canvas fills the available width up to 560px, minus some padding
    var wrapW=Math.min(560,window.innerWidth-20);
    // Leave 16px padding each side in the canvas itself
    CELL=Math.floor((wrapW-PAD*2)/(SZ-1));
    if(CELL>46)CELL=46;
    if(CELL<18)CELL=18;
    var W=PAD*2+CELL*(SZ-1);
    var h='<canvas id="VCcv" width="'+W+'" height="'+W+'" style="display:block;margin:4px auto;border-radius:10px;touch-action:none;max-width:100%;box-shadow:0 8px 28px rgba(0,0,0,0.5),0 0 0 3px #3b2a14;"></canvas>';
    pan.innerHTML=h;
    cvs=document.getElementById('VCcv');ctx=cvs.getContext('2d');
    cvs.addEventListener('click',onClick);
    cvs.addEventListener('touchstart',function(e){
      e.preventDefault();var t=e.touches[0];
      onClick({clientX:t.clientX,clientY:t.clientY});
    },{passive:false});
  }

  function drawBoard(){
    if(!ctx)return;
    var W=PAD*2+CELL*(SZ-1);
    // Wood board background — soft warm gradient
    var bg=ctx.createLinearGradient(0,0,W,W);
    bg.addColorStop(0,'#4a3620');bg.addColorStop(0.5,'#6b4d2a');bg.addColorStop(1,'#4a3620');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,W);
    // Subtle inner shadow for depth
    var sh=ctx.createRadialGradient(W/2,W/2,W*0.3,W/2,W/2,W*0.72);
    sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,0.45)');
    ctx.fillStyle=sh;ctx.fillRect(0,0,W,W);
    // Grid lines — darker warm tone
    ctx.strokeStyle='rgba(28,20,10,0.72)';
    ctx.lineWidth=1.2;
    for(var i=0;i<SZ;i++){
      ctx.beginPath();ctx.moveTo(PAD+i*CELL,PAD);ctx.lineTo(PAD+i*CELL,PAD+(SZ-1)*CELL);ctx.stroke();
      ctx.beginPath();ctx.moveTo(PAD,PAD+i*CELL);ctx.lineTo(PAD+(SZ-1)*CELL,PAD+i*CELL);ctx.stroke();
    }
    // Star points (hoshi) — center + traditional corners based on size
    var stars=[];
    var cn=Math.floor(SZ/2);
    stars.push([cn,cn]);
    if(SZ>=11){
      var off=SZ>=15?3:(SZ>=13?3:2);
      stars.push([off,off],[off,SZ-1-off],[SZ-1-off,off],[SZ-1-off,SZ-1-off]);
    }
    ctx.fillStyle='rgba(28,20,10,0.85)';
    for(var si=0;si<stars.length;si++){
      var pt=stars[si];
      ctx.beginPath();ctx.arc(PAD+pt[1]*CELL,PAD+pt[0]*CELL,3,0,Math.PI*2);ctx.fill();
    }
    // Hint square glow — behind stones
    if(hintPos){
      var hx=PAD+hintPos[1]*CELL,hy=PAD+hintPos[0]*CELL;
      var hg=ctx.createRadialGradient(hx,hy,1,hx,hy,CELL*0.8);
      hg.addColorStop(0,'rgba(200,168,75,0.55)');
      hg.addColorStop(1,'rgba(200,168,75,0)');
      ctx.fillStyle=hg;ctx.beginPath();ctx.arc(hx,hy,CELL*0.9,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(200,168,75,0.95)';ctx.lineWidth=2;ctx.setLineDash([4,3]);
      ctx.beginPath();ctx.arc(hx,hy,CELL*0.45,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    }
    // Stones with rim + highlight
    var rad=CELL*0.46;
    for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++){
      if(board[r][c]===0)continue;
      var x=PAD+c*CELL,y=PAD+r*CELL;
      // Drop shadow
      ctx.fillStyle='rgba(0,0,0,0.35)';
      ctx.beginPath();ctx.arc(x+1.5,y+2,rad,0,Math.PI*2);ctx.fill();
      // Stone body
      var g=ctx.createRadialGradient(x-rad*0.35,y-rad*0.45,1,x,y,rad);
      if(board[r][c]===1){
        g.addColorStop(0,'#c3e896');g.addColorStop(0.5,'#7ab356');g.addColorStop(1,'#2d4a1a');
      }else{
        g.addColorStop(0,'#ffc8c8');g.addColorStop(0.5,'#c47a7a');g.addColorStop(1,'#6a2020');
      }
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=board[r][c]===1?'#243e18':'#5a1a1a';ctx.lineWidth=1;ctx.stroke();
      // Highlight
      ctx.beginPath();ctx.arc(x-rad*0.35,y-rad*0.4,rad*0.22,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fill();
    }
    // Last-move marker — gold ring around the stone
    if(lastMove){
      var lx=PAD+lastMove[1]*CELL,ly=PAD+lastMove[0]*CELL;
      ctx.strokeStyle='#c8a84b';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(lx,ly,rad+2,0,Math.PI*2);ctx.stroke();
    }
    // Win line — gold with glow
    if(winLine){
      ctx.strokeStyle='#f0c968';ctx.lineWidth=4;ctx.shadowColor='#c8a84b';ctx.shadowBlur=12;
      ctx.beginPath();
      ctx.moveTo(PAD+winLine[0][1]*CELL,PAD+winLine[0][0]*CELL);
      ctx.lineTo(PAD+winLine[winLine.length-1][1]*CELL,PAD+winLine[winLine.length-1][0]*CELL);
      ctx.stroke();ctx.shadowBlur=0;
    }
  }

  function onClick(e){
    if(gameOver||turn!==1||thinking)return;
    var rect=cvs.getBoundingClientRect();
    var scale=cvs.width/rect.width;
    var mx=(e.clientX-rect.left)*scale;var my=(e.clientY-rect.top)*scale;
    var c=Math.round((mx-PAD)/CELL),r=Math.round((my-PAD)/CELL);
    if(r<0||r>=SZ||c<0||c>=SZ||board[r][c]!==0)return;
    hintPos=null;
    redoStack=[]; // a fresh human move clears any redo history
    placeStone(r,c,1);
    updateButtons();
    if(gameOver)return;
    turn=2;thinking=true;
    var st=document.getElementById('VCst');if(st)st.textContent='AI thinking...';
    drawBoard();
    try{if(window._play)_play('tap');}catch(e2){}
    setTimeout(aiMove,220+Math.random()*200);
  }

  function placeStone(r,c,who){
    board[r][c]=who;lastMove=[r,c];moves++;
    hist.push({r:r,c:c,who:who});
    var wl=checkWin(r,c,who);
    if(wl){winLine=wl;winner=who;gameOver=true;drawBoard();
      setTimeout(function(){endGame(who);},500);return;}
    if(moves>=SZ*SZ){gameOver=true;winner=0;drawBoard();
      setTimeout(function(){endGame(0);},500);}
  }

  function endGame(w){
    var st=document.getElementById('VCst');
    if(w===1){
      sm('🟢 Vine complete! 5 in a row.');if(st)st.textContent='You win!';
      // portal shell: the engine win burst is a 2.8s transient — give the win a
      // persistent moment too (in-app the engine celebration owns it)
      if(window._lwGameEnd&&window.LW_PLAY)_lwGameEnd({won:true,title:'FIVE IN A ROW',line:'the vine completed',retry:function(){window._VCN();},retryLabel:'\u21bb REMATCH'});
      _e('game_win');try{_playWin();}catch(e){}_sr('vinecross',{w:true,s:moves});
      stats.w++;stats.streak++;if(stats.streak>stats.best)stats.best=stats.streak;
      saveStats();renderStats();
    } else if(w===2){
      sm('🌸 The garden overgrew. Try again.');if(st)st.textContent='AI wins';
      if(window._lwGameEnd)_lwGameEnd({won:false,title:'THE GARDEN OVERGREW',line:'the AI lined up five first',retry:function(){window._VCN();},retryLabel:'\u21bb REMATCH'});
      _e('game_loss');try{_play('lose');}catch(e){}_sr('vinecross',{w:false,s:moves});
      stats.l++;stats.streak=0;saveStats();renderStats();
    } else {
      sm('Draw, the board is full.');if(st)st.textContent='Draw';
      if(window._lwGameEnd)_lwGameEnd({won:false,title:'A FULL BOARD DRAW',line:'nobody found five',retry:function(){window._VCN();},retryLabel:'\u21bb REMATCH'});
      _sr('vinecross',{w:false,s:moves});
      stats.d++;stats.streak=0;saveStats();renderStats();
    }
    updateButtons();
  }

  function checkWin(r,c,who){
    var dirs=[[0,1],[1,0],[1,1],[1,-1]];
    for(var d=0;d<dirs.length;d++){
      var dr=dirs[d][0],dc=dirs[d][1];
      var line=[[r,c]];
      for(var i=1;i<5;i++){var nr=r+dr*i,nc=c+dc*i;if(nr>=0&&nr<SZ&&nc>=0&&nc<SZ&&board[nr][nc]===who)line.push([nr,nc]);else break;}
      for(var i2=1;i2<5;i2++){var nr2=r-dr*i2,nc2=c-dc*i2;if(nr2>=0&&nr2<SZ&&nc2>=0&&nc2<SZ&&board[nr2][nc2]===who)line.unshift([nr2,nc2]);else break;}
      if(line.length>=5)return line;
    }
    return null;
  }
  function checkWinFast(bd,r,c,who){
    var dirs=[[0,1],[1,0],[1,1],[1,-1]];
    for(var d=0;d<dirs.length;d++){
      var cnt=1;
      for(var i=1;i<5;i++){var nr=r+dirs[d][0]*i,nc=c+dirs[d][1]*i;if(nr>=0&&nr<SZ&&nc>=0&&nc<SZ&&bd[nr][nc]===who)cnt++;else break;}
      for(var i2=1;i2<5;i2++){var nr2=r-dirs[d][0]*i2,nc2=c-dirs[d][1]*i2;if(nr2>=0&&nr2<SZ&&nc2>=0&&nc2<SZ&&bd[nr2][nc2]===who)cnt++;else break;}
      if(cnt>=5)return true;
    }return false;
  }

  function aiMove(){
    if(gameOver){thinking=false;return;}
    if(!cvs||!document.body.contains(cvs)){thinking=false;return;}
    try{
      var pick=_bestMove(2);
      if(pick){placeStone(pick[0],pick[1],2);}
      drawBoard();
      var st=document.getElementById('VCst');if(st&&!gameOver)st.textContent='Your turn';
    } finally {
      turn=1;thinking=false;updateButtons();
    }
  }

  function _bestMove(who){
    var depth={1:1,2:2,3:3,4:4}[LVL]||2;
    // Seedling: mostly random among top candidates (beginner chaos)
    if(LVL===1){
      var c0=getCandidates(board,who).slice(0,6);
      if(!c0.length){outer:for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++)if(board[r][c]===0)return [r,c];return null;}
      return c0[Math.floor(Math.random()*c0.length)];
    }
    var cands=getCandidates(board,who);
    var opp=(who===1?2:1);
    // FORCED MOVES first — the eval's horizon can't see an open three
    // maturing into an unstoppable open four, so Sapling/Grove used to lose
    // to a plain straight line in 5 moves.
    // (1) Take an immediate win.
    for(var f0=0;f0<cands.length;f0++){
      board[cands[f0][0]][cands[f0][1]]=who;
      var wNow=checkWinFast(board,cands[f0][0],cands[f0][1],who);
      board[cands[f0][0]][cands[f0][1]]=0;
      if(wNow)return cands[f0];
    }
    // (2) Block the opponent's immediate win.
    for(var f1=0;f1<cands.length;f1++){
      board[cands[f1][0]][cands[f1][1]]=opp;
      var oWin=checkWinFast(board,cands[f1][0],cands[f1][1],opp);
      board[cands[f1][0]][cands[f1][1]]=0;
      if(oWin)return cands[f1];
    }
    // (3) Block an open three (0-p-p-p-0): pick the better end by search.
    var ends=openThreeEnds(opp);
    if(ends.length){
      var fb=null,fs=-Infinity;
      for(var f2=0;f2<ends.length;f2++){
        var em=ends[f2];
        board[em[0]][em[1]]=who;
        var es=-minimax(board,depth-1,false,-Infinity,Infinity,who);
        board[em[0]][em[1]]=0;
        if(es>fs){fs=es;fb=em;}
      }
      if(fb)return fb;
    }
    // Score every candidate WITHOUT jitter first.
    var scored=[],rawBest=-Infinity;
    for(var i=0;i<cands.length;i++){
      var m=cands[i];
      board[m[0]][m[1]]=who;
      var sc;
      if(checkWinFast(board,m[0],m[1],who))sc=1000000;
      else sc=-minimax(board,depth-1,false,-Infinity,Infinity,who);
      board[m[0]][m[1]]=0;
      scored.push({m:m,sc:sc});
      if(sc>rawBest)rawBest=sc;
    }
    // Personality jitter only among NEAR-EQUAL candidates. The old code
    // jittered every score, so Sapling/Grove routinely skipped forced
    // blocks — an open FOUR went unanswered and a straight line won in 5.
    var best=null,bestScore=-Infinity,jit=LVL===2?60:LVL===3?20:0;
    for(var j=0;j<scored.length;j++){
      var s2=scored[j].sc;
      if(jit&&s2>=rawBest-50)s2+=Math.random()*jit;
      if(s2>bestScore){bestScore=s2;best=scored[j].m;}
    }
    if(!best){for(var r2=0;r2<SZ;r2++)for(var c2=0;c2<SZ;c2++)if(board[r2][c2]===0)return [r2,c2];}
    return best;
  }

  // All 0-p-p-p-0 windows for player p → both open ends (forced block cells).
  function openThreeEnds(p){
    var ends=[],seen={},dirs=[[0,1],[1,0],[1,1],[1,-1]];
    for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++){
      for(var d=0;d<4;d++){
        var dr=dirs[d][0],dc=dirs[d][1];
        var er=r+4*dr,ec=c+4*dc;
        if(er<0||er>=SZ||ec<0||ec>=SZ)continue;
        if(board[r][c]!==0||board[er][ec]!==0)continue;
        if(board[r+dr][c+dc]===p&&board[r+2*dr][c+2*dc]===p&&board[r+3*dr][c+3*dc]===p){
          var k1=r*SZ+c,k2=er*SZ+ec;
          if(!seen[k1]){seen[k1]=1;ends.push([r,c]);}
          if(!seen[k2]){seen[k2]=1;ends.push([er,ec]);}
        }
      }
    }
    return ends;
  }

  function minimax(bd,depth,isMax,alpha,beta,aiP){
    if(depth<=0)return evaluate(bd,aiP);
    var who=isMax?aiP:(aiP===1?2:1);
    var cands=getCandidates(bd,who);
    if(cands.length===0)return evaluate(bd,aiP);
    if(isMax){
      var mx=-Infinity;
      for(var i=0;i<cands.length;i++){
        bd[cands[i][0]][cands[i][1]]=who;
        var sc=checkWinFast(bd,cands[i][0],cands[i][1],who)?100000:minimax(bd,depth-1,false,alpha,beta,aiP);
        bd[cands[i][0]][cands[i][1]]=0;
        if(sc>mx)mx=sc;if(sc>alpha)alpha=sc;if(beta<=alpha)break;
      }return mx;
    }
    var mn=Infinity;
    for(var i2=0;i2<cands.length;i2++){
      bd[cands[i2][0]][cands[i2][1]]=who;
      var sc2=checkWinFast(bd,cands[i2][0],cands[i2][1],who)?-100000:minimax(bd,depth-1,true,alpha,beta,aiP);
      bd[cands[i2][0]][cands[i2][1]]=0;
      if(sc2<mn)mn=sc2;if(sc2<beta)beta=sc2;if(beta<=alpha)break;
    }return mn;
  }

  function getCandidates(bd,who){
    var seen={},cands=[];
    for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++){
      if(bd[r][c]===0)continue;
      for(var dr=-2;dr<=2;dr++)for(var dc=-2;dc<=2;dc++){
        var nr=r+dr,nc=c+dc;
        if(nr<0||nr>=SZ||nc<0||nc>=SZ||bd[nr][nc]!==0)continue;
        var k=nr*SZ+nc;if(seen[k])continue;seen[k]=true;cands.push([nr,nc]);
      }
    }
    if(cands.length===0){var cn=Math.floor(SZ/2);cands.push([cn,cn]);}
    cands.sort(function(a,b){return scoreCand(bd,b,who)-scoreCand(bd,a,who);});
    return cands.slice(0,20);
  }

  function scoreCand(bd,pos,who){
    var sc=0;var r=pos[0],c=pos[1];var cn=Math.floor(SZ/2);
    sc-=Math.abs(r-cn)+Math.abs(c-cn);
    var dirs=[[0,1],[1,0],[1,1],[1,-1]];
    bd[r][c]=who;
    for(var d=0;d<dirs.length;d++){
      var cnt=1,open=0;
      for(var i=1;i<5;i++){var nr=r+dirs[d][0]*i,nc=c+dirs[d][1]*i;if(nr<0||nr>=SZ||nc<0||nc>=SZ){break;}if(bd[nr][nc]===who)cnt++;else{if(bd[nr][nc]===0)open++;break;}}
      for(var i2=1;i2<5;i2++){var nr2=r-dirs[d][0]*i2,nc2=c-dirs[d][1]*i2;if(nr2<0||nr2>=SZ||nc2<0||nc2>=SZ){break;}if(bd[nr2][nc2]===who)cnt++;else{if(bd[nr2][nc2]===0)open++;break;}}
      if(cnt>=5)sc+=100000;
      else if(cnt===4&&open>=1)sc+=2000;
      else if(cnt===3&&open===2)sc+=800;
      else if(cnt===3&&open===1)sc+=80;
      else if(cnt===2&&open===2)sc+=40;
    }
    bd[r][c]=0;
    var opp=who===1?2:1;bd[r][c]=opp;
    for(var d2=0;d2<dirs.length;d2++){
      var cnt2=1,open2=0;
      for(var i3=1;i3<5;i3++){var nr3=r+dirs[d2][0]*i3,nc3=c+dirs[d2][1]*i3;if(nr3<0||nr3>=SZ||nc3<0||nc3>=SZ){break;}if(bd[nr3][nc3]===opp)cnt2++;else{if(bd[nr3][nc3]===0)open2++;break;}}
      for(var i4=1;i4<5;i4++){var nr4=r-dirs[d2][0]*i4,nc4=c-dirs[d2][1]*i4;if(nr4<0||nr4>=SZ||nc4<0||nc4>=SZ){break;}if(bd[nr4][nc4]===opp)cnt2++;else{if(bd[nr4][nc4]===0)open2++;break;}}
      if(cnt2>=4)sc+=1500;
      else if(cnt2===3&&open2===2)sc+=700;
      else if(cnt2===3&&open2===1)sc+=60;
    }
    bd[r][c]=0;return sc;
  }

  function evaluate(bd,aiP){
    var sc=0;
    for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++){
      if(bd[r][c]===0)continue;
      var who=bd[r][c];var mult=(who===aiP)?1:-1;
      var dirs=[[0,1],[1,0],[1,1],[1,-1]];
      for(var d=0;d<dirs.length;d++){
        var cnt=1,open=0;
        for(var i=1;i<5;i++){var nr=r+dirs[d][0]*i,nc=c+dirs[d][1]*i;if(nr<0||nr>=SZ||nc<0||nc>=SZ)break;if(bd[nr][nc]===who)cnt++;else{if(bd[nr][nc]===0)open++;break;}}
        if(cnt>=5)sc+=100000*mult;
        else if(cnt===4&&open>0)sc+=5000*mult;
        else if(cnt===3&&open>0)sc+=500*mult;
        else if(cnt===2&&open>0)sc+=50*mult;
      }
    }
    return sc;
  }

  function updateButtons(){
    var ub=document.getElementById('VCundo');
    if(ub){var cU=hist.length>=2&&!thinking&&!gameOver;ub.disabled=!cU;ub.style.opacity=cU?'':'0.4';}
    var rb=document.getElementById('VCredo');
    if(rb){var cR=redoStack.length>0&&!thinking&&!gameOver;rb.disabled=!cR;rb.style.opacity=cR?'':'0.4';}
    var hb=document.getElementById('VChint');
    if(hb){var cH=!thinking&&!gameOver&&turn===1;hb.disabled=!cH;hb.style.opacity=cH?'':'0.4';}
  }

  window._VCN=function(){init();renderStats();};
  window._VCU=function(){
    if(hist.length<2||thinking||gameOver)return;
    // Undo AI + player move as a pair so the board returns to
    // the player's choice point.
    var m2=hist.pop();board[m2.r][m2.c]=0;moves--;
    redoStack.push(m2);
    var m1=hist.pop();board[m1.r][m1.c]=0;moves--;
    redoStack.push(m1);
    lastMove=hist.length>0?[hist[hist.length-1].r,hist[hist.length-1].c]:null;
    turn=1;winLine=null;winner=0;gameOver=false;hintPos=null;
    _play('tap');drawBoard();updateButtons();
    var st=document.getElementById('VCst');if(st)st.textContent='Your turn';
  };
  window._VCR=function(){
    // Redo last undone pair. redoStack was pushed [ai,player] so pop
    // reverses back: pop player first, then AI.
    if(redoStack.length<2||thinking||gameOver)return;
    var m1=redoStack.pop();board[m1.r][m1.c]=m1.who;hist.push(m1);moves++;lastMove=[m1.r,m1.c];
    var m2=redoStack.pop();board[m2.r][m2.c]=m2.who;hist.push(m2);moves++;lastMove=[m2.r,m2.c];
    _play('tap');drawBoard();updateButtons();
    // After redo, it's human's turn again (we redid a full pair)
    var wl=checkWin(m2.r,m2.c,m2.who);
    if(wl){winLine=wl;winner=m2.who;gameOver=true;drawBoard();setTimeout(function(){endGame(m2.who);},400);return;}
    turn=1;
    var st=document.getElementById('VCst');if(st)st.textContent='Your turn';
  };
  window._VCH=function(){
    if(thinking||gameOver||turn!==1)return;
    var savedLvl=LVL;LVL=4;
    var pick=_bestMove(1);
    LVL=savedLvl;
    if(!pick)return;
    hintPos=pick;
    _play('tap');
    drawBoard();
    setTimeout(function(){hintPos=null;drawBoard();},3500);
  };
  window._VCL=function(l){
    var n=parseInt(l,10);if(isNaN(n)||n<1||n>4)return;
    LVL=n;_vcSave('lw_vc_diff',String(n));
    updateButtons();
  };
  window._VCSZ=function(s){
    var n=parseInt(s,10);if(isNaN(n))return;
    SZ=n;_vcSave('lw_vc_sz',String(n));init();
  };

  // Handle window resize — recompute cell size + redraw
  var _vcResize=function(){if(cvs&&document.body.contains(cvs)){renderUI();drawBoard();}};
  window.addEventListener('resize',_vcResize);
  // Clean up the listener when the player leaves the game
  var _vcWatch=setInterval(function(){
    if(!document.body.classList.contains('game-active')){
      window.removeEventListener('resize',_vcResize);
      clearInterval(_vcWatch);
    }
  },1000);

  init();renderStats();
};
})();
