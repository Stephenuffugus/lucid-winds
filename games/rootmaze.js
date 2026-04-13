// ═══ ROOT MAZE — shifting-tile treasure hunt ═══
// 5x5 grid with shiftable odd rows/cols. Rotate spare, push it in, then move
// through connected path tiles to collect your treasures before the AI.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.rootmaze = function RootMaze(a){
  var SZ=5,CS=60,PAD=26;
  var TREASURES=['🌻','🌹','🌷','🍄','🪻','🌵','🎋','🍀','🌸','🪴','🌺','🍁'];
  var TYPES={
    S:[[1,0,1,0],[0,1,0,1]],
    C:[[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1]],
    T:[[1,1,1,0],[0,1,1,1],[1,0,1,1],[1,1,0,1]]
  };
  var board,spare,playerPos,aiPos,playerTargets,aiTargets,playerTIdx,aiTIdx,phase,turns;

  ms(a,'🌀 Turn <strong id="RMt">0</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='RMpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_RMN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function shuf(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function randomTile(){
    var types=['S','S','C','C','C','T','T'];
    var type=types[Math.floor(Math.random()*types.length)];
    var rotations=TYPES[type];
    var conn=rotations[Math.floor(Math.random()*rotations.length)].slice();
    return{conn:conn,type:type};
  }

  function init(){
    board=[];turns=0;phase='shift';
    for(var r=0;r<SZ;r++){
      board[r]=[];
      for(var c=0;c<SZ;c++){
        var fixed=(r%2===0&&c%2===0);
        var tile=randomTile();tile.fixed=fixed;tile.treasure=null;
        board[r][c]=tile;
      }
    }
    var fixedPos=[];
    for(var r2=0;r2<SZ;r2++)for(var c2=0;c2<SZ;c2++){
      if(board[r2][c2].fixed&&!((r2===0||r2===SZ-1)&&(c2===0||c2===SZ-1)))fixedPos.push([r2,c2]);
    }
    shuf(fixedPos);
    var tList=shuf(TREASURES.slice());
    var ti=0;
    for(var t=0;t<Math.min(fixedPos.length,8);t++){
      board[fixedPos[t][0]][fixedPos[t][1]].treasure=tList[ti++];
    }
    for(var r3=0;r3<SZ;r3++)for(var c3=0;c3<SZ;c3++){
      if(!board[r3][c3].fixed&&!board[r3][c3].treasure&&Math.random()<0.2){
        board[r3][c3].treasure=tList[ti]||TREASURES[Math.floor(Math.random()*TREASURES.length)];
        ti++;
      }
    }
    spare=randomTile();spare.fixed=false;spare.treasure=null;
    playerPos=[0,0];aiPos=[SZ-1,SZ-1];
    var all=[];
    for(var r4=0;r4<SZ;r4++)for(var c4=0;c4<SZ;c4++)if(board[r4][c4].treasure)all.push(board[r4][c4].treasure);
    shuf(all);
    var half=Math.floor(all.length/2);
    playerTargets=all.slice(0,Math.min(half,4));
    aiTargets=all.slice(half,half+Math.min(half,4));
    if(playerTargets.length===0)playerTargets=[TREASURES[0]];
    if(aiTargets.length===0)aiTargets=[TREASURES[1]];
    playerTIdx=0;aiTIdx=0;
    render();
  }

  function rotateSpare(){var c=spare.conn;spare.conn=[c[3],c[0],c[1],c[2]];render();}

  function shiftRow(r,dir){
    if(r%2===0||phase!=='shift')return;
    var ns;
    if(dir===1){
      ns=board[r][SZ-1];
      for(var c=SZ-1;c>0;c--)board[r][c]=board[r][c-1];
      board[r][0]=spare;
      if(playerPos[0]===r){playerPos[1]++;if(playerPos[1]>=SZ)playerPos[1]=0;}
      if(aiPos[0]===r){aiPos[1]++;if(aiPos[1]>=SZ)aiPos[1]=0;}
    }else{
      ns=board[r][0];
      for(var c2=0;c2<SZ-1;c2++)board[r][c2]=board[r][c2+1];
      board[r][SZ-1]=spare;
      if(playerPos[0]===r){playerPos[1]--;if(playerPos[1]<0)playerPos[1]=SZ-1;}
      if(aiPos[0]===r){aiPos[1]--;if(aiPos[1]<0)aiPos[1]=SZ-1;}
    }
    spare=ns;spare.fixed=false;
    phase='move';turns++;_play('dig');render();
  }
  function shiftCol(c,dir){
    if(c%2===0||phase!=='shift')return;
    var ns;
    if(dir===1){
      ns=board[SZ-1][c];
      for(var r=SZ-1;r>0;r--)board[r][c]=board[r-1][c];
      board[0][c]=spare;
      if(playerPos[1]===c){playerPos[0]++;if(playerPos[0]>=SZ)playerPos[0]=0;}
      if(aiPos[1]===c){aiPos[0]++;if(aiPos[0]>=SZ)aiPos[0]=0;}
    }else{
      ns=board[0][c];
      for(var r2=0;r2<SZ-1;r2++)board[r2][c]=board[r2+1][c];
      board[SZ-1][c]=spare;
      if(playerPos[1]===c){playerPos[0]--;if(playerPos[0]<0)playerPos[0]=SZ-1;}
      if(aiPos[1]===c){aiPos[0]--;if(aiPos[0]<0)aiPos[0]=SZ-1;}
    }
    spare=ns;spare.fixed=false;
    phase='move';turns++;_play('dig');render();
  }
  function shiftRowSilent(r,dir){
    var ns;
    if(dir===1){ns=board[r][SZ-1];for(var c=SZ-1;c>0;c--)board[r][c]=board[r][c-1];board[r][0]=spare;
      if(aiPos[0]===r){aiPos[1]++;if(aiPos[1]>=SZ)aiPos[1]=0;}
      if(playerPos[0]===r){playerPos[1]++;if(playerPos[1]>=SZ)playerPos[1]=0;}}
    else{ns=board[r][0];for(var c2=0;c2<SZ-1;c2++)board[r][c2]=board[r][c2+1];board[r][SZ-1]=spare;
      if(aiPos[0]===r){aiPos[1]--;if(aiPos[1]<0)aiPos[1]=SZ-1;}
      if(playerPos[0]===r){playerPos[1]--;if(playerPos[1]<0)playerPos[1]=SZ-1;}}
    spare=ns;spare.fixed=false;
  }
  function shiftColSilent(c,dir){
    var ns;
    if(dir===1){ns=board[SZ-1][c];for(var r=SZ-1;r>0;r--)board[r][c]=board[r-1][c];board[0][c]=spare;
      if(aiPos[1]===c){aiPos[0]++;if(aiPos[0]>=SZ)aiPos[0]=0;}
      if(playerPos[1]===c){playerPos[0]++;if(playerPos[0]>=SZ)playerPos[0]=0;}}
    else{ns=board[0][c];for(var r2=0;r2<SZ-1;r2++)board[r2][c]=board[r2+1][c];board[SZ-1][c]=spare;
      if(aiPos[1]===c){aiPos[0]--;if(aiPos[0]<0)aiPos[0]=SZ-1;}
      if(playerPos[1]===c){playerPos[0]--;if(playerPos[0]<0)playerPos[0]=SZ-1;}}
    spare=ns;spare.fixed=false;
  }

  function canConnect(r1,c1,r2,c2){
    if(r2<0||r2>=SZ||c2<0||c2>=SZ)return false;
    var t1=board[r1][c1],t2=board[r2][c2];
    if(r2===r1-1)return t1.conn[0]&&t2.conn[2];
    if(r2===r1+1)return t1.conn[2]&&t2.conn[0];
    if(c2===c1-1)return t1.conn[3]&&t2.conn[1];
    if(c2===c1+1)return t1.conn[1]&&t2.conn[3];
    return false;
  }
  function getReachable(sr,sc){
    var vis={};var q=[[sr,sc]];vis[sr+','+sc]=true;
    while(q.length>0){
      var p=q.shift();var r=p[0],c=p[1];
      var dirs=[[-1,0],[1,0],[0,-1],[0,1]];
      for(var i=0;i<4;i++){
        var nr=r+dirs[i][0],nc=c+dirs[i][1];var key=nr+','+nc;
        if(!vis[key]&&canConnect(r,c,nr,nc)){vis[key]=true;q.push([nr,nc]);}
      }
    }
    return vis;
  }

  function findTreasure(name){for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++)if(board[r][c].treasure===name)return[r,c];return null;}

  function movePlayer(r,c){
    if(phase!=='move')return;
    var reach=getReachable(playerPos[0],playerPos[1]);
    if(!reach[r+','+c]){sm("Can't reach there");return;}
    playerPos=[r,c];_play('snap');
    var tile=board[r][c];
    if(tile.treasure&&playerTIdx<playerTargets.length&&tile.treasure===playerTargets[playerTIdx]){
      sm('Found '+tile.treasure+'!');_e('progress');
      playerTIdx++;
      if(playerTIdx>=playerTargets.length){
        phase='gameover';_e('game_win');_playWin();sm('🌀 Maze Mastered! '+turns+' turns');
        _sr('rootmaze',{w:true,s:Math.max(1,100-turns),r:turns});
        render();setTimeout(init,3000);return;
      }
    }
    phase='ai_shift';render();
    setTimeout(aiTurn,600);
  }

  function aiTurn(){
    var shifts=[];
    [1,3].forEach(function(r){shifts.push({type:'row',idx:r,dir:1});shifts.push({type:'row',idx:r,dir:-1});});
    [1,3].forEach(function(c){shifts.push({type:'col',idx:c,dir:1});shifts.push({type:'col',idx:c,dir:-1});});
    var pick=shifts[Math.floor(Math.random()*shifts.length)];
    if(pick.type==='row')shiftRowSilent(pick.idx,pick.dir);
    else shiftColSilent(pick.idx,pick.dir);
    var tName=aiTIdx<aiTargets.length?aiTargets[aiTIdx]:null;
    var tpos=tName?findTreasure(tName):null;
    if(tpos){
      var reach=getReachable(aiPos[0],aiPos[1]);
      if(reach[tpos[0]+','+tpos[1]]){
        aiPos=[tpos[0],tpos[1]];
        var tile=board[tpos[0]][tpos[1]];
        if(tile.treasure===tName){
          sm('AI found '+tile.treasure);
          aiTIdx++;
          if(aiTIdx>=aiTargets.length){
            phase='gameover';_e('game_loss');_play('lose');sm('AI wins the maze');
            _sr('rootmaze',{w:false,s:0,r:turns});
            render();setTimeout(init,3000);return;
          }
        }
      }else{
        var bestR=aiPos[0],bestC=aiPos[1],bd=999;
        for(var key in reach){
          var parts=key.split(',');var rr=parseInt(parts[0],10),cc=parseInt(parts[1],10);
          var dist=Math.abs(rr-tpos[0])+Math.abs(cc-tpos[1]);
          if(dist<bd){bd=dist;bestR=rr;bestC=cc;}
        }
        aiPos=[bestR,bestC];
      }
    }
    phase='shift';render();
  }

  function render(){
    var te=document.getElementById('RMt');if(te)te.textContent=turns;
    var W=SZ*CS+PAD*2;
    var pTarget=playerTIdx<playerTargets.length?playerTargets[playerTIdx]:'✓';
    var h='';
    h+='<div style="text-align:center;padding:6px 0;font-family:Bebas Neue,sans-serif;letter-spacing:0.06em;">';
    h+='<div style="font-size:0.85rem;color:var(--cream);">FIND: <span style="font-size:2rem;">'+pTarget+'</span> <span style="font-size:0.7rem;color:var(--muted);">('+playerTIdx+'/'+playerTargets.length+')</span></div>';
    h+='<div style="font-size:0.65rem;color:#c47a7a;letter-spacing:0.08em;margin-top:3px;">AI: '+aiTIdx+'/'+aiTargets.length+'</div>';
    h+='</div>';
    var phaseMsg=phase==='shift'?'⇄ TAP AN EDGE ARROW TO SHIFT THE MAZE':phase==='move'?'👣 TAP A GREEN TILE TO MOVE':phase==='ai_shift'?"⏳ AI's turn…":'🏁 Game Over';
    var phaseColor=phase==='shift'?'#c8a84b':phase==='move'?'#7ab356':phase==='ai_shift'?'#c47a7a':'var(--cream)';
    h+='<div style="text-align:center;font-family:Bebas Neue,sans-serif;font-size:0.95rem;color:'+phaseColor+';padding:6px;letter-spacing:0.08em;background:rgba(26,31,23,0.6);border-radius:8px;margin:4px 12px;">'+phaseMsg+'</div>';
    h+='<canvas id="RMcv" width="'+W+'" height="'+W+'" style="display:block;margin:4px auto;border-radius:6px;"></canvas>';
    h+='<div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:6px 0;">';
    h+='<span style="font-size:0.7rem;opacity:0.5;">Spare:</span>';
    h+='<canvas id="RMsp" width="'+CS+'" height="'+CS+'" style="border:2px solid #c8a84b;border-radius:4px;"></canvas>';
    h+='<div onclick="_RMR()" style="padding:10px 14px;background:rgba(122,179,86,0.2);border:1px solid rgba(122,179,86,0.3);border-radius:8px;color:#e8dcc8;font-size:0.75rem;cursor:pointer;min-height:44px;display:flex;align-items:center;">↻ Rotate</div>';
    h+='</div>';
    pan.innerHTML=h;
    drawBoard();drawSpare();
    var cv=document.getElementById('RMcv');
    if(cv){
      cv.addEventListener('click',function(e){
        var rect=cv.getBoundingClientRect();
        var scaleX=cv.width/rect.width,scaleY=cv.height/rect.height;
        var mx=(e.clientX-rect.left)*scaleX,my=(e.clientY-rect.top)*scaleY;
        handleClick(mx,my);
      });
      cv.addEventListener('touchstart',function(e){
        e.preventDefault();
        var rect=cv.getBoundingClientRect();
        var scaleX=cv.width/rect.width,scaleY=cv.height/rect.height;
        var t=e.touches[0];
        handleClick((t.clientX-rect.left)*scaleX,(t.clientY-rect.top)*scaleY);
      },{passive:false});
    }
  }

  function handleClick(mx,my){
    if(my<PAD){var c=Math.floor((mx-PAD)/CS);if(c>=0&&c<SZ&&c%2===1)shiftCol(c,1);return;}
    if(my>PAD+SZ*CS){var c2=Math.floor((mx-PAD)/CS);if(c2>=0&&c2<SZ&&c2%2===1)shiftCol(c2,-1);return;}
    if(mx<PAD){var r=Math.floor((my-PAD)/CS);if(r>=0&&r<SZ&&r%2===1)shiftRow(r,1);return;}
    if(mx>PAD+SZ*CS){var r2=Math.floor((my-PAD)/CS);if(r2>=0&&r2<SZ&&r2%2===1)shiftRow(r2,-1);return;}
    if(phase==='move'){
      var col=Math.floor((mx-PAD)/CS);var row=Math.floor((my-PAD)/CS);
      if(row>=0&&row<SZ&&col>=0&&col<SZ)movePlayer(row,col);
    }
  }

  function drawTile(ctx,x,y,tile,reachable){
    ctx.fillStyle=tile.fixed?'#2a2018':'#221a12';
    ctx.fillRect(x+1,y+1,CS-2,CS-2);
    if(reachable){ctx.fillStyle='rgba(122,179,86,.18)';ctx.fillRect(x+1,y+1,CS-2,CS-2);}
    var cx=x+CS/2,cy=y+CS/2;
    ctx.strokeStyle='#8B7355';ctx.lineWidth=9;ctx.lineCap='round';
    var conn=tile.conn;
    ctx.fillStyle='#8B7355';ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fill();
    if(conn[0]){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,y);ctx.stroke();}
    if(conn[1]){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x+CS,cy);ctx.stroke();}
    if(conn[2]){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,y+CS);ctx.stroke();}
    if(conn[3]){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,cy);ctx.stroke();}
    if(tile.treasure){
      ctx.font='18px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(tile.treasure,cx,cy);
    }
    if(tile.fixed){ctx.fillStyle='rgba(200,168,75,.12)';ctx.fillRect(x+1,y+1,CS-2,CS-2);}
  }

  function drawBoard(){
    var cv=document.getElementById('RMcv');if(!cv)return;
    var ctx=cv.getContext('2d');var W=SZ*CS+PAD*2;
    ctx.fillStyle='#0d100c';ctx.fillRect(0,0,W,W);
    // Bigger gold arrows so it's obvious where to tap to shift.
    // Was 14px which was almost invisible at the canvas margin.
    ctx.fillStyle='#c8a84b';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    for(var i=0;i<SZ;i++){
      if(i%2===1){
        // Subtle highlight pad behind each arrow so it reads as tappable
        ctx.fillStyle='rgba(200,168,75,0.12)';
        ctx.fillRect(PAD+i*CS+4,2,CS-8,PAD-4);                              // top
        ctx.fillRect(PAD+i*CS+4,PAD+SZ*CS+2,CS-8,PAD-4);                    // bottom
        ctx.fillRect(2,PAD+i*CS+4,PAD-4,CS-8);                              // left
        ctx.fillRect(PAD+SZ*CS+2,PAD+i*CS+4,PAD-4,CS-8);                    // right
        ctx.fillStyle='#c8a84b';
        ctx.fillText('▼',PAD+i*CS+CS/2,PAD/2);
        ctx.fillText('▲',PAD+i*CS+CS/2,PAD+SZ*CS+PAD/2);
        ctx.fillText('►',PAD/2,PAD+i*CS+CS/2);
        ctx.fillText('◄',PAD+SZ*CS+PAD/2,PAD+i*CS+CS/2);
      }
    }
    var reach=null;
    if(phase==='move')reach=getReachable(playerPos[0],playerPos[1]);
    for(var r=0;r<SZ;r++){
      for(var c=0;c<SZ;c++){
        var x=PAD+c*CS,y=PAD+r*CS;
        drawTile(ctx,x,y,board[r][c],reach&&reach[r+','+c]);
        if(playerPos[0]===r&&playerPos[1]===c){
          ctx.fillStyle='#7ab356';ctx.beginPath();ctx.arc(x+CS/2-9,y+CS/2,10,0,Math.PI*2);ctx.fill();
          ctx.font='12px sans-serif';ctx.fillStyle='#fff';ctx.fillText('🌱',x+CS/2-9,y+CS/2+1);
        }
        if(aiPos[0]===r&&aiPos[1]===c){
          ctx.fillStyle='#c47a7a';ctx.beginPath();ctx.arc(x+CS/2+9,y+CS/2,10,0,Math.PI*2);ctx.fill();
          ctx.font='12px sans-serif';ctx.fillStyle='#fff';ctx.fillText('🌸',x+CS/2+9,y+CS/2+1);
        }
      }
    }
  }
  function drawSpare(){
    var cv=document.getElementById('RMsp');if(!cv)return;
    var ctx=cv.getContext('2d');ctx.clearRect(0,0,CS,CS);
    drawTile(ctx,0,0,spare,false);
  }

  window._RMN=function(){init();};
  window._RMR=function(){rotateSpare();};

  init();
};
})();
