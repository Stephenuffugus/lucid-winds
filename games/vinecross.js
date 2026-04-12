// ═══ VINE CROSS — Gomoku (5 in a row) ═══
// Place stones on intersections. First to connect 5 wins. Minimax AI.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;
window._gameFns=window._gameFns||{};
window._gameFns.vinecross=function VC(a){
  var SZ=11,CELL=28,PAD=14;
  var board,turn,moves,hist,gameOver,winner,lastMove,winLine,LVL=5,thinking=false;
  var cvs,ctx;

  ms(a,'⚫ Vine Cross — <strong id="VCst">Your turn</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='VCpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_VCU()">↩ UNDO</button> <button class="gb-new" onclick="_VCN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function init(){
    board=[];for(var r=0;r<SZ;r++){board[r]=[];for(var c=0;c<SZ;c++)board[r][c]=0;}
    turn=1;moves=0;hist=[];gameOver=false;winner=0;lastMove=null;winLine=null;thinking=false;
    renderUI();drawBoard();
    var st=document.getElementById('VCst');if(st)st.textContent='Your turn';
  }

  function renderUI(){
    // Adapt cell size to viewport
    CELL=Math.min(30,Math.floor(Math.min(340,window.innerWidth-40)/SZ));
    var W=SZ*CELL+PAD*2;
    var h='<canvas id="VCcv" width="'+W+'" height="'+W+'" style="display:block;margin:4px auto;border-radius:8px;touch-action:none;max-width:100%;"></canvas>';
    h+='<div style="display:flex;gap:4px;justify-content:center;padding:4px;flex-wrap:wrap;">';
    [3,5,7,9].forEach(function(l){
      var act=LVL===l?'background:rgba(122,179,86,0.35);border-color:#7ab356;':'';
      h+='<button class="gb" style="padding:4px 10px;font-size:.7rem;'+act+'" onclick="_VCL('+l+')">Lv'+l+'</button>';
    });
    h+='</div>';
    h+='<div style="display:flex;gap:4px;justify-content:center;padding:2px;">';
    [9,11,13].forEach(function(s){
      var act=SZ===s?'background:rgba(122,179,86,0.35);border-color:#7ab356;':'';
      h+='<button class="gb" style="padding:4px 10px;font-size:.7rem;'+act+'" onclick="_VCSZ('+s+')">'+s+'×'+s+'</button>';
    });
    h+='</div>';
    pan.innerHTML=h;
    cvs=document.getElementById('VCcv');ctx=cvs.getContext('2d');
    cvs.addEventListener('click',onClick);
    cvs.addEventListener('touchstart',function(e){
      e.preventDefault();var t=e.touches[0];
      var rc=cvs.getBoundingClientRect();
      onClick({clientX:t.clientX,clientY:t.clientY});
    },{passive:false});
  }

  function drawBoard(){
    if(!ctx)return;
    var W=SZ*CELL+PAD*2;
    ctx.fillStyle='#1a1f17';ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(200,168,75,0.35)';ctx.lineWidth=1;
    for(var i=0;i<SZ;i++){
      ctx.beginPath();ctx.moveTo(PAD+i*CELL,PAD);ctx.lineTo(PAD+i*CELL,PAD+(SZ-1)*CELL);ctx.stroke();
      ctx.beginPath();ctx.moveTo(PAD,PAD+i*CELL);ctx.lineTo(PAD+(SZ-1)*CELL,PAD+i*CELL);ctx.stroke();
    }
    var cn=Math.floor(SZ/2);
    ctx.fillStyle='rgba(200,168,75,0.5)';
    ctx.beginPath();ctx.arc(PAD+cn*CELL,PAD+cn*CELL,2.5,0,Math.PI*2);ctx.fill();
    for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++){
      if(board[r][c]===0)continue;
      var x=PAD+c*CELL,y=PAD+r*CELL,rad=CELL/2-2;
      var g=ctx.createRadialGradient(x-2,y-2,1,x,y,rad);
      if(board[r][c]===1){g.addColorStop(0,'#9fd670');g.addColorStop(1,'#3a6028');}
      else{g.addColorStop(0,'#e89090');g.addColorStop(1,'#8a3030');}
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=board[r][c]===1?'#2d4a1e':'#6a2020';ctx.lineWidth=1;ctx.stroke();
    }
    if(lastMove){
      ctx.fillStyle='#c8a84b';ctx.beginPath();
      ctx.arc(PAD+lastMove[1]*CELL,PAD+lastMove[0]*CELL,3,0,Math.PI*2);ctx.fill();
    }
    if(winLine){
      ctx.strokeStyle='#c8a84b';ctx.lineWidth=3;ctx.shadowColor='#c8a84b';ctx.shadowBlur=10;
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
    placeStone(r,c,1);
    if(gameOver)return;
    turn=2;thinking=true;
    var st=document.getElementById('VCst');if(st)st.textContent='AI thinking...';
    drawBoard();
    try{if(window._play)_play('tap');}catch(e2){}
    setTimeout(aiMove,250+Math.random()*300);
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
    if(w===1){sm('🟢 Vine complete! 5 in a row.');if(st)st.textContent='You win!';_e('game_win');try{_playWin();}catch(e){}_sr('vinecross',{w:true,s:moves});}
    else if(w===2){sm('🌸 The garden overgrew. Try again.');if(st)st.textContent='AI wins';_e('game_loss');try{_play('lose');}catch(e){}_sr('vinecross',{w:false,s:moves});}
    else{sm('Draw — the board is full.');if(st)st.textContent='Draw';_sr('vinecross',{w:false,s:moves});}
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
    var best=null,bestScore=-Infinity;
    var depth=Math.min(Math.ceil(LVL/2),4);
    var cands=getCandidates(board,2);
    for(var i=0;i<cands.length;i++){
      var m=cands[i];
      board[m[0]][m[1]]=2;
      var sc;
      if(checkWinFast(board,m[0],m[1],2))sc=1000000;
      else sc=-minimax(board,depth-1,false,-Infinity,Infinity);
      board[m[0]][m[1]]=0;
      if(LVL<=3)sc+=Math.random()*500;
      else if(LVL<=5)sc+=Math.random()*80;
      if(sc>bestScore){bestScore=sc;best=m;}
    }
    if(!best){
      outer:for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++)if(board[r][c]===0){best=[r,c];break outer;}
    }
    if(best)placeStone(best[0],best[1],2);
    turn=1;thinking=false;drawBoard();
    var st=document.getElementById('VCst');if(st&&!gameOver)st.textContent='Your turn';
  }

  function minimax(bd,depth,isMax,alpha,beta){
    if(depth<=0)return evaluate(bd,2);
    var who=isMax?2:1;
    var cands=getCandidates(bd,who);
    if(cands.length===0)return evaluate(bd,2);
    if(isMax){
      var mx=-Infinity;
      for(var i=0;i<cands.length;i++){
        bd[cands[i][0]][cands[i][1]]=who;
        var sc=checkWinFast(bd,cands[i][0],cands[i][1],who)?100000:minimax(bd,depth-1,false,alpha,beta);
        bd[cands[i][0]][cands[i][1]]=0;
        if(sc>mx)mx=sc;if(sc>alpha)alpha=sc;if(beta<=alpha)break;
      }return mx;
    }
    var mn=Infinity;
    for(var i2=0;i2<cands.length;i2++){
      bd[cands[i2][0]][cands[i2][1]]=who;
      var sc2=checkWinFast(bd,cands[i2][0],cands[i2][1],who)?-100000:minimax(bd,depth-1,true,alpha,beta);
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
    return cands.slice(0,18);
  }

  function scoreCand(bd,pos,who){
    var sc=0;var r=pos[0],c=pos[1];var cn=Math.floor(SZ/2);
    sc-=Math.abs(r-cn)+Math.abs(c-cn);
    var dirs=[[0,1],[1,0],[1,1],[1,-1]];
    bd[r][c]=who;
    for(var d=0;d<dirs.length;d++){
      var cnt=1;
      for(var i=1;i<5;i++){var nr=r+dirs[d][0]*i,nc=c+dirs[d][1]*i;if(nr>=0&&nr<SZ&&nc>=0&&nc<SZ&&bd[nr][nc]===who)cnt++;else break;}
      for(var i2=1;i2<5;i2++){var nr2=r-dirs[d][0]*i2,nc2=c-dirs[d][1]*i2;if(nr2>=0&&nr2<SZ&&nc2>=0&&nc2<SZ&&bd[nr2][nc2]===who)cnt++;else break;}
      if(cnt>=4)sc+=1000;else if(cnt>=3)sc+=100;else if(cnt>=2)sc+=10;
    }
    bd[r][c]=0;
    var opp=who===1?2:1;bd[r][c]=opp;
    for(var d2=0;d2<dirs.length;d2++){
      var cnt2=1;
      for(var i3=1;i3<5;i3++){var nr3=r+dirs[d2][0]*i3,nc3=c+dirs[d2][1]*i3;if(nr3>=0&&nr3<SZ&&nc3>=0&&nc3<SZ&&bd[nr3][nc3]===opp)cnt2++;else break;}
      for(var i4=1;i4<5;i4++){var nr4=r-dirs[d2][0]*i4,nc4=c-dirs[d2][1]*i4;if(nr4>=0&&nr4<SZ&&nc4>=0&&nc4<SZ&&bd[nr4][nc4]===opp)cnt2++;else break;}
      if(cnt2>=4)sc+=800;else if(cnt2>=3)sc+=80;
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

  window._VCN=function(){init();};
  window._VCU=function(){
    if(hist.length<2||thinking)return;
    var m2=hist.pop();board[m2.r][m2.c]=0;moves--;
    var m1=hist.pop();board[m1.r][m1.c]=0;moves--;
    lastMove=hist.length>0?[hist[hist.length-1].r,hist[hist.length-1].c]:null;
    turn=1;winLine=null;gameOver=false;drawBoard();
    var st=document.getElementById('VCst');if(st)st.textContent='Your turn';
  };
  window._VCL=function(l){LVL=l;init();};
  window._VCSZ=function(s){SZ=s;init();};

  init();
};
})();
