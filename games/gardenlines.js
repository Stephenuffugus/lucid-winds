// ═══ GARDEN LINES — Qwirkle-style tile placement ═══
// Place tiles to build lines of matching shape OR color. 6 shapes × 6 colors, 3 copies each.
(function(){
'use strict';

window._gameFns = window._gameFns || {};
window._gameFns.gardenlines = function GL(a){
  var SHAPES=['🌸','🌿','💧','☀️','🌱','🍄'];
  var COLORS=['#C47A7A','#4A7C35','#5B9BD5','#D4A843','#E8DCC8','#9B59B6'];
  var G;

  ms(a,'🔶 <strong id="GLp">0</strong> - <strong id="GLa">0</strong> | Bag: <strong id="GLb">0</strong>');
  mm(a);
  var pan=document.createElement('div');
  pan.id='GLpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_GLN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function makeBag(){var b=[];for(var s=0;s<6;s++)for(var c=0;c<6;c++)for(var n=0;n<3;n++)b.push({shape:s,color:c});return shuf(b);}
  function shuf(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function tileKey(t){return t.shape+','+t.color;}
  function posKey(r,c){return r+','+c;}
  function getBoard(r,c){return G.board[posKey(r,c)]||null;}
  function setBoard(r,c,tile){
    G.board[posKey(r,c)]=tile;
    if(r<G.boardMin.r)G.boardMin.r=r;if(r>G.boardMax.r)G.boardMax.r=r;
    if(c<G.boardMin.c)G.boardMin.c=c;if(c>G.boardMax.c)G.boardMax.c=c;
  }
  function getLine(r,c,dr,dc){
    var line=[];var cr=r+dr,cc=c+dc;
    while(getBoard(cr,cc)){line.push({r:cr,c:cc,tile:getBoard(cr,cc)});cr+=dr;cc+=dc;}
    return line;
  }
  function getFullLine(r,c,dr,dc){
    var neg=getLine(r,c,-dr,-dc).reverse();
    var pos=getLine(r,c,dr,dc);
    var center=getBoard(r,c)?[{r:r,c:c,tile:getBoard(r,c)}]:[];
    return neg.concat(center).concat(pos);
  }
  function canPlace(r,c,tile){
    if(getBoard(r,c))return false;
    var isEmpty=Object.keys(G.board).length===0;
    if(!isEmpty){
      var hasAdj=getBoard(r-1,c)||getBoard(r+1,c)||getBoard(r,c-1)||getBoard(r,c+1);
      if(!hasAdj)return false;
    }
    setBoard(r,c,tile);
    var hL=getFullLine(r,c,0,1);var vL=getFullLine(r,c,1,0);
    var valid=true;
    if(hL.length>1)valid=valid&&isValidLine(hL);
    if(vL.length>1)valid=valid&&isValidLine(vL);
    delete G.board[posKey(r,c)];
    return valid;
  }
  function isValidLine(line){
    if(line.length>6)return false;
    var ss=true,sc=true;
    for(var i=1;i<line.length;i++){
      if(line[i].tile.shape!==line[0].tile.shape)ss=false;
      if(line[i].tile.color!==line[0].tile.color)sc=false;
    }
    if(!ss&&!sc)return false;
    var seen={};
    for(var j=0;j<line.length;j++){var k=tileKey(line[j].tile);if(seen[k])return false;seen[k]=true;}
    return true;
  }
  function scorePlace(r,c){
    var pts=0;
    var hL=getFullLine(r,c,0,1);var vL=getFullLine(r,c,1,0);
    if(hL.length>1){pts+=hL.length;if(hL.length===6)pts+=6;}
    if(vL.length>1){pts+=vL.length;if(vL.length===6)pts+=6;}
    if(hL.length<=1&&vL.length<=1)pts=1;
    return pts;
  }
  function getValidPositions(){
    var pos={};
    if(Object.keys(G.board).length===0)return[[0,0]];
    for(var key in G.board){
      var parts=key.split(',');var r=parseInt(parts[0]),c=parseInt(parts[1]);
      [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(function(p){
        var pk=posKey(p[0],p[1]);
        if(!G.board[pk])pos[pk]=p;
      });
    }
    return Object.keys(pos).map(function(k){return pos[k];});
  }
  function selectTile(idx){
    if(G.turn!=='player')return;
    G.selIdx=(G.selIdx===idx)?-1:idx;
    render();
  }
  function placeTile(r,c){
    if(G.selIdx<0||G.turn!=='player')return;
    var tile=G.pHand[G.selIdx];
    if(!canPlace(r,c,tile)){sm('Invalid placement');return;}
    setBoard(r,c,tile);
    G.pHand.splice(G.selIdx,1);
    var pts=scorePlace(r,c);
    G.pScore+=pts;
    G.placed.push({r:r,c:c});
    G.selIdx=-1;
    sm('+'+pts);
    _e('progress');
    if(pts>=12)_e('milestone'); // Garden Line bonus
    render();
  }
  function endTurn(){
    while(G.pHand.length<6&&G.bag.length>0)G.pHand.push(G.bag.pop());
    G.placed=[];
    if(G.pHand.length===0&&G.bag.length===0){
      G.pScore+=6;G.phase='gameover';render();
      setTimeout(showEnd,500);return;
    }
    G.turn='ai';render();setTimeout(aiTurn,600);
  }
  function swapTiles(){
    if(G.bag.length===0){sm('Bag is empty');return;}
    while(G.pHand.length>0)G.bag.push(G.pHand.pop());
    shuf(G.bag);
    while(G.pHand.length<6&&G.bag.length>0)G.pHand.push(G.bag.pop());
    G.placed=[];G.selIdx=-1;
    G.turn='ai';render();setTimeout(aiTurn,600);
  }
  function aiTurn(){
    var bestR,bestC,bestTile,bestIdx,bestScore=-1;
    var cands=getValidPositions();
    for(var i=0;i<G.aHand.length;i++){
      var tile=G.aHand[i];
      cands.forEach(function(pos){
        if(canPlace(pos[0],pos[1],tile)){
          setBoard(pos[0],pos[1],tile);
          var sc=scorePlace(pos[0],pos[1]);
          delete G.board[posKey(pos[0],pos[1])];
          if(sc>bestScore){bestScore=sc;bestR=pos[0];bestC=pos[1];bestTile=tile;bestIdx=i;}
        }
      });
    }
    if(bestScore>0){
      setBoard(bestR,bestC,bestTile);
      G.aHand.splice(bestIdx,1);
      G.aScore+=bestScore;
      sm('AI +'+bestScore);
    }else{
      if(G.bag.length>0){
        while(G.aHand.length>0)G.bag.push(G.aHand.pop());
        shuf(G.bag);sm('AI swapped');
      }
    }
    while(G.aHand.length<6&&G.bag.length>0)G.aHand.push(G.bag.pop());
    if(G.aHand.length===0&&G.bag.length===0){
      G.aScore+=6;G.phase='gameover';render();
      setTimeout(showEnd,500);return;
    }
    G.turn='player';G.placed=[];G.selIdx=-1;render();
  }
  function showEnd(){
    var won=G.pScore>G.aScore;
    if(won){_e('game_win');_playWin();sm('🔶 Garden complete! '+G.pScore+'-'+G.aScore);}
    else{_e('game_loss');_play('lose');sm('Garden resting. '+G.pScore+'-'+G.aScore);}
    _sr('gardenlines',{w:won,s:G.pScore});
  }
  function render(){
    var ps=document.getElementById('GLp');if(ps)ps.textContent=G.pScore;
    var as=document.getElementById('GLa');if(as)as.textContent=G.aScore;
    var bg=document.getElementById('GLb');if(bg)bg.textContent=G.bag.length;
    var h='';
    // Score banner
    h+='<div style="background:linear-gradient(135deg,rgba(26,31,23,0.85),rgba(13,16,12,0.9));border:1.5px solid rgba(122,179,86,0.25);border-radius:10px;padding:8px 12px;margin:4px 0;display:flex;justify-content:space-around;align-items:center;font-family:Bebas Neue,sans-serif;font-size:0.85rem;">';
    h+='<div><span style="color:var(--sage);">YOU</span> <strong style="color:var(--gold);font-size:1.1rem;">'+G.pScore+'</strong></div>';
    h+='<div style="font-size:0.7rem;color:'+(G.turn==='player'?'var(--sage)':'var(--muted)')+';">'+(G.turn==='player'?'YOUR TURN':'AI thinking...')+'</div>';
    h+='<div><span style="color:#c47a7a;">AI</span> <strong style="color:var(--gold);font-size:1.1rem;">'+G.aScore+'</strong></div>';
    h+='</div>';
    // Board
    var minR=G.boardMin.r-2,maxR=G.boardMax.r+2;
    var minC=G.boardMin.c-2,maxC=G.boardMax.c+2;
    if(Object.keys(G.board).length===0){minR=-2;maxR=2;minC=-2;maxC=2;}
    var cols=maxC-minC+1;
    var validPos={};
    if(G.turn==='player'&&G.selIdx>=0){
      var st=G.pHand[G.selIdx];
      getValidPositions().forEach(function(p){
        if(canPlace(p[0],p[1],st))validPos[posKey(p[0],p[1])]=true;
      });
    }
    h+='<div style="overflow:auto;max-height:320px;background:rgba(8,12,6,0.5);border:1px solid rgba(74,124,53,0.2);border-radius:8px;padding:4px;margin:4px 0;-webkit-overflow-scrolling:touch;">';
    h+='<div style="display:grid;grid-template-columns:repeat('+cols+',36px);gap:2px;justify-content:center;">';
    for(var r=minR;r<=maxR;r++){
      for(var c=minC;c<=maxC;c++){
        var t=getBoard(r,c);var pk=posKey(r,c);var isValid=validPos[pk];
        if(t){
          h+='<div style="width:36px;height:36px;border-radius:6px;background:'+COLORS[t.color]+';display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:1.5px solid rgba(0,0,0,0.25);box-shadow:0 1px 3px rgba(0,0,0,0.4);">'+SHAPES[t.shape]+'</div>';
        }else{
          var eStyle='width:36px;height:36px;border-radius:6px;border:1px dashed rgba(74,124,53,0.1);';
          if(isValid){eStyle='width:36px;height:36px;border-radius:6px;border:2px solid rgba(122,179,86,0.6);background:rgba(122,179,86,0.15);cursor:pointer;';}
          h+='<div style="'+eStyle+'" onclick="_GLPT('+r+','+c+')"></div>';
        }
      }
    }
    h+='</div></div>';
    // Hand
    h+='<div style="padding:4px;"><div style="font-size:0.55rem;color:var(--muted);text-align:center;margin-bottom:4px;">YOUR HAND · Tap a tile, then tap the board</div>';
    h+='<div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap;">';
    G.pHand.forEach(function(tile,i){
      var sel=G.selIdx===i;
      var sty='width:52px;height:52px;border-radius:8px;background:'+COLORS[tile.color]+';display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;border:2px solid '+(sel?'var(--gold)':'rgba(0,0,0,0.3)')+';box-shadow:'+(sel?'0 4px 12px rgba(200,168,75,0.5)':'0 2px 6px rgba(0,0,0,0.4)')+';transition:transform 0.15s;';
      if(sel)sty+='transform:translateY(-4px);';
      h+='<div style="'+sty+'" onclick="_GLST('+i+')">'+SHAPES[tile.shape]+'</div>';
    });
    h+='</div></div>';
    // Controls
    h+='<div style="display:flex;gap:8px;justify-content:center;padding:6px 0;flex-wrap:wrap;">';
    if(G.turn==='player'){
      if(G.placed.length>0){
        h+='<button class="gb" onclick="_GLET()" style="min-height:44px;padding:10px 20px;background:rgba(122,179,86,0.2);border-color:rgba(122,179,86,0.4);color:var(--sage);">✓ END TURN</button>';
      }
      h+='<button class="gb" onclick="_GLSW()" style="min-height:44px;padding:10px 20px;">🔄 SWAP ALL</button>';
    }
    h+='</div>';
    pan.innerHTML=h;
  }
  function init(){
    var bag=makeBag();
    G={bag:bag,board:{},boardMin:{r:0,c:0},boardMax:{r:0,c:0},
       pHand:bag.splice(0,6),aHand:bag.splice(0,6),
       pScore:0,aScore:0,turn:'player',selIdx:-1,placed:[],phase:'play'};
    render();
  }
  window._GLN=init;
  window._GLST=selectTile;
  window._GLPT=placeTile;
  window._GLET=endTurn;
  window._GLSW=swapTiles;
  init();
};
})();
