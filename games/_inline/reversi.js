/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Inline game copy: reversi
 *
 * COPY of the inline GRV mount function from index.html
 * lines 67333-67591.
 *
 * DUPLICATE, NEVER MOVE. The original code in index.html is the
 * live source of truth for the in-LW play surface. This copy serves
 * the /play/reversi.html shell only. To keep them aligned,
 * re-run scripts/extract_inline_games.js whenever index.html's
 * inline game block is edited.
 * ════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var G=window._G;
  var _e=G.e, _play=G.play, _playWin=G.playWin, _st=G.st, _xt=G.xt,
      ms=G.ms, mm=G.mm, mc=G.mc, sm=G.sm, sh=G.sh,
      _sr=G.sr, _gr=G.gr, _setDiff=G.setDiff,
      _solEnterFS=G.solEnterFS, _solClearFS=G.solClearFS, _solExitFS=G.solExitFS;
  window._gameFns=window._gameFns||{};

  function GRV(a){var bd=new Array(64).fill(0),tn=1,ov=false,lastMove=-1,flipCells=[];
    var undoStack=[],hintPos=-1,diff=2;
    try{var _d=parseInt(localStorage.getItem('lw_rv_diff'));if(_d>=1&&_d<=4)diff=_d;}catch(e){}
    var stats={w:0,l:0,d:0,streak:0,best:0};
    try{var _s=localStorage.getItem('lw_rv_stats');if(_s){var _p=JSON.parse(_s);for(var _k in _p)stats[_k]=_p[_k];}}catch(e){}
    // SVG pieces — Player: moss (green), AI: lichen (gold)
    var SVG_MOSS='<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#2a4a1e"/><circle cx="20" cy="20" r="13" fill="#3a6a2a"/><circle cx="20" cy="20" r="10" fill="#4a8a35"/><circle cx="16" cy="16" r="3" fill="#6ab356" opacity="0.6"/><circle cx="24" cy="18" r="2.5" fill="#7ab356" opacity="0.5"/><circle cx="20" cy="24" r="2" fill="#5a9a40" opacity="0.5"/><circle cx="14" cy="22" r="1.5" fill="#7ab356" opacity="0.4"/><circle cx="26" cy="23" r="1.8" fill="#6ab356" opacity="0.35"/></svg>';
    var SVG_LICHEN='<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#5a4520"/><circle cx="20" cy="20" r="13" fill="#7a6530"/><circle cx="20" cy="20" r="10" fill="#9a8040"/><circle cx="17" cy="17" r="3.5" fill="#C8A84B" opacity="0.5"/><circle cx="24" cy="19" r="2.5" fill="#b8984a" opacity="0.45"/><circle cx="20" cy="25" r="2" fill="#C8A84B" opacity="0.4"/><path d="M14 20 Q16 18 18 20 Q16 22 14 20Z" fill="#C8A84B" opacity="0.3"/><path d="M24 24 Q26 22 27 24 Q25 26 24 24Z" fill="#b8984a" opacity="0.3"/></svg>';
    var SVGS=[null,SVG_MOSS,SVG_LICHEN];
    ms(a,'');mm(a);
    // Stats strip
    var statsRow=document.createElement('div');statsRow.id='RVstats';
    statsRow.style.cssText='display:flex;justify-content:center;gap:14px;padding:2px 0;font-family:DM Mono,monospace;font-size:0.64rem;color:rgba(232,220,200,0.72);letter-spacing:0.06em';
    a.appendChild(statsRow);
    // Score bar
    var sb=document.createElement('div');sb.className='rv-score';sb.id='RVs';a.appendChild(sb);
    // Directions
    var dir=document.createElement('div');
    dir.style.cssText='text-align:center;padding:0.3rem 0.8rem;margin:0.1rem auto;max-width:400px;font-family:DM Sans,sans-serif;font-size:clamp(0.58rem,1.7vw,0.72rem);color:var(--cream);line-height:1.4;opacity:0.78';
    dir.innerHTML='Place your <strong style="color:#7ab356">moss</strong> to surround and flip <strong style="color:#C8A84B">lichen</strong>. Outgrow the board to win.';
    a.appendChild(dir);
    // Board wrapper with coordinate labels
    var boardWrap=document.createElement('div');boardWrap.className='rv-wrap';a.appendChild(boardWrap);
    var topCoords=document.createElement('div');topCoords.className='rv-coords rv-coords-top';
    for(var _ci=0;_ci<8;_ci++){var _cc=document.createElement('span');_cc.textContent=String.fromCharCode(97+_ci);topCoords.appendChild(_cc);}
    boardWrap.appendChild(topCoords);
    var boardRow=document.createElement('div');boardRow.className='rv-row';
    var leftCoords=document.createElement('div');leftCoords.className='rv-coords rv-coords-side';
    for(var _ri=0;_ri<8;_ri++){var _rs=document.createElement('span');_rs.textContent=String(_ri+1);leftCoords.appendChild(_rs);}
    boardRow.appendChild(leftCoords);
    var gd=document.createElement('div');gd.className='rvb';gd.id='RV';boardRow.appendChild(gd);
    boardRow.appendChild(leftCoords.cloneNode(true));
    boardWrap.appendChild(boardRow);
    boardWrap.appendChild(topCoords.cloneNode(true));
    // Tools: Undo + Hint
    var tools=document.createElement('div');
    tools.style.cssText='display:flex;gap:6px;justify-content:center;padding:4px 0';
    tools.innerHTML='<button class="gb" id="RVundo" onclick="_RVU()" style="min-height:40px;padding:4px 14px;font-size:0.65rem">↩ UNDO</button>'
      +'<button class="gb" id="RVhint" onclick="_RVH()" style="min-height:40px;padding:4px 14px;font-size:0.65rem">💡 HINT</button>';
    a.appendChild(tools);
    mc(a).innerHTML='<select class="gsl" id="RVd" onchange="_RVSetDiff(this.value)" style="min-width:140px">'
      +'<option value="1">Seedling</option><option value="2">Sapling</option><option value="3">Grove</option><option value="4">Old Growth</option>'
      +'</select><button class="gb-new" onclick="_RVN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
    function setup(){bd=new Array(64).fill(0);bd[27]=2;bd[28]=1;bd[35]=1;bd[36]=2;tn=1;ov=false;lastMove=-1;flipCells=[];undoStack=[];hintPos=-1;var dsel=document.getElementById('RVd');if(dsel)dsel.value=String(diff);}
    // -- Core helpers (take board as parameter for AI search) --
    function flipsOn(b,p,pos){
      if(b[pos]!==0)return [];
      var r=Math.floor(pos/8),c=pos%8,o=p===1?2:1,all=[];
      var dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      for(var di=0;di<8;di++){
        var d=dirs[di],f=[],nr=r+d[0],nc=c+d[1];
        while(nr>=0&&nr<8&&nc>=0&&nc<8&&b[nr*8+nc]===o){f.push(nr*8+nc);nr+=d[0];nc+=d[1];}
        if(nr>=0&&nr<8&&nc>=0&&nc<8&&b[nr*8+nc]===p&&f.length)all=all.concat(f);
      }
      return all;
    }
    function validOn(b,p){var m=[];for(var i=0;i<64;i++)if(flipsOn(b,p,i).length)m.push(i);return m;}
    function flips(p,pos){return flipsOn(bd,p,pos);}
    function valid(p){return validOn(bd,p);}
    function applyMove(b,p,pos){
      var f=flipsOn(b,p,pos);if(!f.length)return b;
      var nb=b.slice();nb[pos]=p;for(var i=0;i<f.length;i++)nb[f[i]]=p;
      return nb;
    }
  
    // -- Evaluation (Iago-style positional + mobility + corners) --
    var POS_W=[
      120,-20, 20,  5,  5, 20,-20,120,
      -20,-40, -5, -5, -5, -5,-40,-20,
       20, -5, 15,  3,  3, 15, -5, 20,
        5, -5,  3,  3,  3,  3, -5,  5,
        5, -5,  3,  3,  3,  3, -5,  5,
       20, -5, 15,  3,  3, 15, -5, 20,
      -20,-40, -5, -5, -5, -5,-40,-20,
      120,-20, 20,  5,  5, 20,-20,120
    ];
    var CORNERS=[0,7,56,63];
    function evaluate(b){
      var myC=0,oppC=0,total=0;
      for(var i=0;i<64;i++){if(b[i]===2){myC++;total++;}else if(b[i]===1){oppC++;total++;}}
      var phase=total<20?'early':total<50?'mid':'late';
      var positional=0;
      for(var j=0;j<64;j++){if(b[j]===2)positional+=POS_W[j];else if(b[j]===1)positional-=POS_W[j];}
      var myCor=0,oppCor=0;
      for(var ck=0;ck<4;ck++){if(b[CORNERS[ck]]===2)myCor++;else if(b[CORNERS[ck]]===1)oppCor++;}
      var cornerDiff=(myCor-oppCor)*25;
      var myMob=validOn(b,2).length,oppMob=validOn(b,1).length;
      var mobility=0;if(myMob+oppMob)mobility=100*(myMob-oppMob)/(myMob+oppMob);
      var myFront=0,oppFront=0;
      var fdirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      for(var fi=0;fi<64;fi++){
        if(!b[fi])continue;
        var fr=Math.floor(fi/8),fc=fi%8;
        for(var fk=0;fk<8;fk++){
          var nr=fr+fdirs[fk][0],nc=fc+fdirs[fk][1];
          if(nr>=0&&nr<8&&nc>=0&&nc<8&&b[nr*8+nc]===0){
            if(b[fi]===2)myFront++;else oppFront++;
            break;
          }
        }
      }
      var frontier=0;if(myFront+oppFront)frontier=-50*(myFront-oppFront)/(myFront+oppFront);
      if(phase==='early')return cornerDiff*10+mobility*8+positional*1+frontier*2;
      if(phase==='mid')return cornerDiff*10+mobility*5+positional*2+frontier*1;
      return cornerDiff*10+(myC-oppC)*15+positional*1;
    }
  
    // -- Minimax with alpha-beta --
    function minimax(b,depth,alpha,beta,isMax){
      var player=isMax?2:1;
      var moves=validOn(b,player);
      if(!moves.length){
        var oppMoves=validOn(b,isMax?1:2);
        if(!oppMoves.length){
          var c2=0,c1=0;
          for(var i=0;i<64;i++){if(b[i]===2)c2++;else if(b[i]===1)c1++;}
          if(c2>c1)return 100000;if(c1>c2)return -100000;return 0;
        }
        if(depth===0)return evaluate(b);
        return minimax(b,depth-1,alpha,beta,!isMax);
      }
      if(depth===0)return evaluate(b);
      moves.sort(function(x,y){return POS_W[y]-POS_W[x];});
      var best=isMax?-999999:999999;
      for(var m=0;m<moves.length;m++){
        var nb=applyMove(b,player,moves[m]);
        var val=minimax(nb,depth-1,alpha,beta,!isMax);
        if(isMax){if(val>best)best=val;if(best>alpha)alpha=best;}
        else{if(val<best)best=val;if(best<beta)beta=best;}
        if(beta<=alpha)break;
      }
      return best;
    }
    function bestMoveFor(player){
      var moves=valid(player);
      if(!moves.length)return -1;
      if(diff===1&&player===2)return moves[Math.floor(Math.random()*moves.length)];
      var depth={1:1,2:3,3:5,4:6}[diff]||3;
      var isMax=(player===2);
      var bestVal=isMax?-999999:999999,candidates=[];
      moves.sort(function(x,y){return POS_W[y]-POS_W[x];});
      for(var i=0;i<moves.length;i++){
        var nb=applyMove(bd,player,moves[i]);
        var val=minimax(nb,depth-1,-999999,999999,!isMax);
        if(isMax){if(val>bestVal){bestVal=val;candidates=[moves[i]];}else if(val===bestVal)candidates.push(moves[i]);}
        else{if(val<bestVal){bestVal=val;candidates=[moves[i]];}else if(val===bestVal)candidates.push(moves[i]);}
      }
      return candidates[Math.floor(Math.random()*candidates.length)];
    }
  
    // -- Rendering --
    function renderStats(){
      var played=stats.w+stats.l+stats.d;
      var pct=played?Math.round(stats.w/played*100):0;
      statsRow.innerHTML='played <strong style="color:var(--gold)">'+played+'</strong>'
        +' · won <strong style="color:var(--gold)">'+pct+'%</strong>'
        +' · streak <strong style="color:var(--gold)">'+stats.streak+'</strong>'
        +' · best <strong style="color:var(--gold)">'+stats.best+'</strong>';
    }
    function updateScore(){
      var p1=0,p2=0;for(var i=0;i<64;i++){if(bd[i]===1)p1++;if(bd[i]===2)p2++;}
      var m1=valid(1).length,m2=valid(2).length;
      var el=document.getElementById('RVs');if(!el)return;
      var status=tn===1&&!ov?'Your turn · '+m1+' moves':tn===2&&!ov?'AI thinking · '+m2+' moves':'Game over';
      el.innerHTML='<span style="color:#7ab356">&#9679; Moss: <strong>'+p1+'</strong></span>'
        +'<span style="color:var(--muted);font-family:DM Mono,monospace;font-size:0.58rem">'+status+'</span>'
        +'<span style="color:#C8A84B">Lichen: <strong>'+p2+'</strong> &#9679;</span>';
    }
    // Star-point markers (Go-board style hoshi) at key strategic squares
    var STAR_POINTS={18:1,21:1,42:1,45:1};
    function rn(){
      var vm=ov?[]:valid(tn);
      gd.innerHTML='';
      for(var i=0;i<64;i++){
        var d=document.createElement('div');
        var cls='rvc';
        if(vm.indexOf(i)>-1&&tn===1)cls+=' rvv';
        if(i===lastMove)cls+=' rv-last';
        if(flipCells.indexOf(i)>-1)cls+=' rv-flip';
        if(i===hintPos)cls+=' rv-hint';
        if(STAR_POINTS[i]&&!bd[i])cls+=' rv-star';
        d.className=cls;
        d.setAttribute('data-i',i);
        if(bd[i]>0)d.innerHTML=SVGS[bd[i]];
        if(tn===1&&vm.indexOf(i)>-1)d.addEventListener('click',function(){doPlay(1,parseInt(this.getAttribute('data-i')));});
        gd.appendChild(d);
      }
      updateScore();
      var ub=document.getElementById('RVundo');
      if(ub){var cU=undoStack.length>0&&tn===1&&!ov;ub.disabled=!cU;ub.style.opacity=cU?'':'0.4';}
      var hb=document.getElementById('RVhint');
      if(hb){var cH=hintPos<0&&tn===1&&!ov&&vm.length>0;hb.disabled=!cH;hb.style.opacity=cH?'':'0.4';}
      if(!ov&&!vm.length&&tn===1){sm('No moves, passing');tn=2;setTimeout(aiRV,500);}
      checkEnd();
    }
  
    // -- Interactions --
    function doPlay(p,pos){
      var f=flipsOn(bd,p,pos);if(!f.length)return;
      if(p===1)undoStack.push({bd:bd.slice(),tn:tn,lastMove:lastMove,flipCells:flipCells.slice()});
      hintPos=-1;
      _play('flip');
      bd[pos]=p;flipCells=f.slice();for(var i=0;i<f.length;i++)bd[f[i]]=p;
      lastMove=pos;
      if(p===1){
        if(f.length>=3)_e('flip');
        tn=2;rn();setTimeout(aiRV,400);
      }else{tn=1;rn();}
    }
    function aiRV(){
      if(tn!==2||ov)return;
      var pick=bestMoveFor(2);
      if(pick<0){sm('AI passes');tn=1;rn();return;}
      doPlay(2,pick);
    }
    function checkEnd(){
      if(valid(1).length||valid(2).length)return;
      ov=true;
      var p1=0,p2=0;for(var i=0;i<64;i++){if(bd[i]===1)p1++;if(bd[i]===2)p2++;}
      updateScore();
      if(p1>p2){
        _e('game_win');_playWin();sm('You win! '+p1+' – '+p2);_sr('reversi',{w:true,s:p1});
        stats.w++;stats.streak++;if(stats.streak>stats.best)stats.best=stats.streak;
        saveStats();renderStats();
      }else if(p2>p1){
        _e('game_loss');_play('lose');sm('AI wins '+p2+' – '+p1);_sr('reversi',{w:false,s:p1});
        stats.l++;stats.streak=0;saveStats();renderStats();
      }else{
        _e('milestone');sm('Draw! '+p1+' – '+p2);_sr('reversi',{w:false,s:p1});
        stats.d++;stats.streak=0;saveStats();renderStats();
      }
    }
    function saveStats(){try{localStorage.setItem('lw_rv_stats',JSON.stringify(stats));}catch(e){}}
  
    window._RVN=function(){setup();sm('');renderStats();rn();};
    window._RVU=function(){
      if(undoStack.length===0||tn!==1||ov)return;
      var s=undoStack.pop();
      bd=s.bd.slice();tn=s.tn;lastMove=s.lastMove;flipCells=s.flipCells.slice();
      hintPos=-1;_play('tap');sm('Undone');rn();
    };
    window._RVH=function(){
      if(tn!==1||ov||hintPos>=0)return;
      var savedDiff=diff;diff=4;
      var pick=bestMoveFor(1);
      diff=savedDiff;
      if(pick<0)return;
      hintPos=pick;_play('tap');
      var r=Math.floor(pick/8),c=pick%8;
      sm('Hint: '+String.fromCharCode(97+c)+(r+1));
      rn();
      setTimeout(function(){hintPos=-1;rn();},3500);
    };
    window._RVSetDiff=function(v){
      var n=parseInt(v,10);if(isNaN(n)||n<1||n>4)return;
      diff=n;try{localStorage.setItem('lw_rv_diff',String(n));}catch(e){}
    };
    _RVN();
  }

  window._gameFns['reversi']=GRV;
})();
