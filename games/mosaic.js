// ═══ MOSAIC GARDEN — Azul-style tile drafting ═══
// Draft tiles from shared factory displays, fill staging rows, transfer to mosaic wall for points.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.mosaic = function MS(a){
  var COLORS=['petal','leaf','berry','sun','frost'];
  var ICONS={petal:'🌸',leaf:'🌿',berry:'💧',sun:'☀️',frost:'❄️'};
  var BG={petal:'#c47a7a',leaf:'#4A7C35',berry:'#5b9bd5',sun:'#d4a843',frost:'#a0c4e8'};
  var WALL=[
    ['petal','leaf','berry','sun','frost'],
    ['frost','petal','leaf','berry','sun'],
    ['sun','frost','petal','leaf','berry'],
    ['berry','sun','frost','petal','leaf'],
    ['leaf','berry','sun','frost','petal']
  ];
  var FLOOR_PEN=[-1,-1,-2,-2,-2,-3,-3];
  var G;

  ms(a,'🪻 <strong id="MSs">0</strong> | Round <strong id="MSr">1</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='MSpan';
  pan.style.cssText='max-width:440px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_MShelp()" style="font-size:0.78rem;">❓ How to Play</button> <button class="gb-new" onclick="_MSN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  // First-launch how-to-play card. User reported "not sure how it works".
  // Auto-dismisses on click anywhere outside, persists dismissal so it
  // doesn't keep showing every game. ❓ button re-opens it.
  function _showHelp(){
    if(document.getElementById('msHelpOv'))return;
    var ov=document.createElement('div');ov.id='msHelpOv';
    ov.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(5,7,4,0.85);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:1rem;';
    ov.onclick=function(e){if(e.target===ov)ov.remove();};
    ov.innerHTML='<div style="max-width:380px;background:linear-gradient(180deg,rgba(20,28,18,0.97),rgba(13,16,12,0.98));border:1.5px solid rgba(200,168,75,0.35);border-radius:14px;padding:1.4rem 1.2rem;box-shadow:0 16px 48px rgba(0,0,0,0.7);font-family:DM Sans,sans-serif;color:var(--cream);font-size:0.78rem;line-height:1.6;">'+
      '<div style="font-family:Bebas Neue,sans-serif;font-size:1.2rem;color:var(--gold);letter-spacing:0.12em;text-align:center;margin-bottom:6px;">MOSAIC GARDEN</div>'+
      '<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);text-align:center;letter-spacing:0.1em;margin-bottom:1rem;">HOW TO PLAY</div>'+
      '<p style="margin:0 0 0.7rem;"><strong style="color:var(--sage);">1. DRAFT.</strong> Tap any tile in a circular bed (factory) — you take ALL tiles of that color from that bed. The rest go to the center.</p>'+
      '<p style="margin:0 0 0.7rem;"><strong style="color:var(--sage);">2. STAGE.</strong> Tap one of your 5 staging rows to place them. Rows fit 1, 2, 3, 4, or 5 tiles top-to-bottom. Excess tiles drop to your floor (penalty).</p>'+
      '<p style="margin:0 0 0.7rem;"><strong style="color:var(--sage);">3. SCORE.</strong> When all factories AND the center empty, full staging rows transfer to your wall. Adjacent tiles on the wall score points (1 alone, +1 per neighbor).</p>'+
      '<p style="margin:0 0 0.7rem;"><strong style="color:var(--gold);">END BONUS:</strong> +2 per full row, +7 per full column, +10 per all-5-of-a-color set.</p>'+
      '<p style="margin:0 0 1rem;"><strong style="color:#c47a7a;">END GAME:</strong> First completed wall row triggers final scoring.</p>'+
      '<button onclick="document.getElementById(\'msHelpOv\').remove();" style="display:block;width:100%;padding:0.65rem;min-height:48px;background:linear-gradient(180deg,rgba(46,40,32,0.7),rgba(32,30,24,0.8));border:1px solid rgba(200,168,75,0.25);color:var(--cream);font-family:Bebas Neue,sans-serif;font-size:0.85rem;letter-spacing:0.12em;border-radius:8px;cursor:pointer;">I GOT IT</button>'+
      '</div>';
    document.body.appendChild(ov);
  }
  window._MShelp=_showHelp;
  // Auto-show on first ever launch
  try{if(!localStorage.getItem('lw_ms_helped')){_showHelp();localStorage.setItem('lw_ms_helped','1');}}catch(e){}

  function shuf(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function newGame(){
    var bag=[];COLORS.forEach(function(c){for(var i=0;i<20;i++)bag.push(c);});shuf(bag);
    G={bag:bag,discard:[],score:0,round:1,
       factories:[[],[],[],[],[]],center:[],
       staging:[[],[],[],[],[]],
       wall:[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],
       floor:[],phase:'draft',selected:null,firstPlayerTaken:false};
    fillFactories();render();
  }
  function fillFactories(){
    for(var f=0;f<5;f++){
      G.factories[f]=[];
      for(var i=0;i<4;i++){
        if(G.bag.length===0){G.bag=G.discard.slice();G.discard=[];shuf(G.bag);}
        if(G.bag.length>0)G.factories[f].push(G.bag.pop());
      }
    }
    G.center=[];G.firstPlayerTaken=false;
  }
  function selectFromFactory(fi,color){
    var fac=G.factories[fi];
    var taken=fac.filter(function(c){return c===color;});
    var rest=fac.filter(function(c){return c!==color;});
    G.factories[fi]=[];
    rest.forEach(function(c){G.center.push(c);});
    G.selected={source:'fac',facIdx:fi,color:color,tiles:taken};
    render();
  }
  function selectFromCenter(color){
    var taken=G.center.filter(function(c){return c===color;});
    G.center=G.center.filter(function(c){return c!==color;});
    var fp=!G.firstPlayerTaken;
    if(fp)G.firstPlayerTaken=true;
    G.selected={source:'center',color:color,tiles:taken,firstPlayer:fp};
    render();
  }
  function placeInRow(rowIdx){
    if(!G.selected)return;
    var row=G.staging[rowIdx];var maxSize=rowIdx+1;
    var wallCol=WALL[rowIdx].indexOf(G.selected.color);
    if(row.length>0&&row[0]!==G.selected.color){sm('Row has different color');return;}
    if(G.wall[rowIdx][wallCol]){sm('Wall position filled');return;}
    var space=maxSize-row.length;var tiles=G.selected.tiles;
    if(G.selected.firstPlayer)G.floor.push('first');
    var placed=0;
    for(var i=0;i<tiles.length;i++){
      if(placed<space){row.push(tiles[i]);placed++;}
      else{if(G.floor.length<7)G.floor.push(tiles[i]);else G.discard.push(tiles[i]);}
    }
    G.selected=null;_e('progress');
    ghostTurn();checkDraftEnd();render();
  }
  function placeOnFloor(){
    if(!G.selected)return;
    if(G.selected.firstPlayer)G.floor.push('first');
    G.selected.tiles.forEach(function(c){if(G.floor.length<7)G.floor.push(c);else G.discard.push(c);});
    G.selected=null;
    ghostTurn();checkDraftEnd();render();
  }
  function ghostTurn(){
    var bestSource=null,bestColor=null,bestCount=0;
    for(var f=0;f<5;f++){
      if(G.factories[f].length===0)continue;
      var counts={};G.factories[f].forEach(function(c){counts[c]=(counts[c]||0)+1;});
      for(var c in counts){if(counts[c]>bestCount){bestCount=counts[c];bestColor=c;bestSource={type:'fac',idx:f};}}
    }
    if(G.center.length>0){
      var cc={};G.center.forEach(function(c){cc[c]=(cc[c]||0)+1;});
      for(var c2 in cc){if(cc[c2]>bestCount){bestCount=cc[c2];bestColor=c2;bestSource={type:'center'};}}
    }
    if(!bestSource)return;
    if(bestSource.type==='fac'){
      var fac=G.factories[bestSource.idx];
      var taken=fac.filter(function(c){return c===bestColor;});
      var rest=fac.filter(function(c){return c!==bestColor;});
      G.factories[bestSource.idx]=[];
      rest.forEach(function(c){G.center.push(c);});
      taken.forEach(function(c){G.discard.push(c);});
    }else{
      var taken2=G.center.filter(function(c){return c===bestColor;});
      G.center=G.center.filter(function(c){return c!==bestColor;});
      taken2.forEach(function(c){G.discard.push(c);});
      if(!G.firstPlayerTaken)G.firstPlayerTaken=true;
    }
  }
  function checkDraftEnd(){
    var allEmpty=true;
    for(var f=0;f<5;f++){if(G.factories[f].length>0){allEmpty=false;break;}}
    if(G.center.length>0)allEmpty=false;
    if(allEmpty)scoringPhase();
  }
  function scoringPhase(){
    G.phase='score';var roundScore=0;
    for(var r=0;r<5;r++){
      var maxSize=r+1;
      if(G.staging[r].length===maxSize){
        var color=G.staging[r][0];var col=WALL[r].indexOf(color);
        G.wall[r][col]=true;
        var pts=calcPlacementScore(r,col);roundScore+=pts;
        for(var i=0;i<G.staging[r].length-1;i++)G.discard.push(G.staging[r][i]);
        G.staging[r]=[];
      }
    }
    var penalty=0;
    for(var i=0;i<G.floor.length&&i<7;i++){
      penalty+=FLOOR_PEN[i];
      if(G.floor[i]!=='first')G.discard.push(G.floor[i]);
    }
    roundScore+=penalty;
    G.score=Math.max(0,G.score+roundScore);G.floor=[];
    sm('Round '+G.round+': '+(roundScore>=0?'+':'')+roundScore);
    _e('milestone');
    var gameOver=false;
    for(var r2=0;r2<5;r2++){var full=true;for(var c=0;c<5;c++)if(!G.wall[r2][c]){full=false;break;}if(full){gameOver=true;break;}}
    if(gameOver){endgameScoring();}
    else{G.round++;G.phase='draft';fillFactories();render();}
  }
  function calcPlacementScore(row,col){
    var pts=0;
    var hCount=1;
    for(var c=col-1;c>=0&&G.wall[row][c];c--)hCount++;
    for(var c2=col+1;c2<5&&G.wall[row][c2];c2++)hCount++;
    var vCount=1;
    for(var r=row-1;r>=0&&G.wall[r][col];r--)vCount++;
    for(var r2=row+1;r2<5&&G.wall[r2][col];r2++)vCount++;
    if(hCount===1&&vCount===1)return 1;
    if(hCount>1)pts+=hCount;
    if(vCount>1)pts+=vCount;
    return pts;
  }
  function endgameScoring(){
    G.phase='gameover';var bonus=0;
    var rows=0;for(var r=0;r<5;r++){var full=true;for(var c=0;c<5;c++)if(!G.wall[r][c]){full=false;break;}if(full){rows++;bonus+=2;}}
    var cols=0;for(var c2=0;c2<5;c2++){var f2=true;for(var r2=0;r2<5;r2++)if(!G.wall[r2][c2]){f2=false;break;}if(f2){cols++;bonus+=7;}}
    var colorSets=0;COLORS.forEach(function(color){var count=0;for(var r3=0;r3<5;r3++){var ci=WALL[r3].indexOf(color);if(G.wall[r3][ci])count++;}if(count===5){colorSets++;bonus+=10;}});
    G.score+=bonus;
    _e('game_win');_playWin();
    sm('🪻 Mosaic complete! '+G.score+' pts');
    _sr('mosaic',{w:true,s:G.score});
    setTimeout(function(){render();setTimeout(newGame,3000);},500);
  }
  function tileDiv(color,size,extra){
    size=size||26;extra=extra||'';
    return '<div style="width:'+size+'px;height:'+size+'px;border-radius:4px;background:'+BG[color]+';display:inline-flex;align-items:center;justify-content:center;font-size:'+Math.round(size*0.55)+'px;'+extra+'">'+ICONS[color]+'</div>';
  }
  function render(){
    var ss=document.getElementById('MSs');if(ss)ss.textContent=G.score;
    var rr=document.getElementById('MSr');if(rr)rr.textContent=G.round;
    var h='';
    h+='<div style="text-align:center;font-family:DM Mono,monospace;font-size:0.85rem;color:var(--cream);padding:6px 0;letter-spacing:0.04em;">'+
      (G.phase==='draft'?(G.selected?'Selected '+G.selected.tiles.length+' '+ICONS[G.selected.color]+' — tap a staging row':'Tap tiles in a bed, or in the center'):(G.phase==='score'?'Scoring...':'Game over'))+'</div>';
    // Factories
    h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:4px 0;">';
    for(var f=0;f<5;f++){
      h+='<div style="padding:4px;background:rgba(26,31,23,0.5);border:1.5px solid rgba(74,124,53,0.2);border-radius:50%;width:72px;height:72px;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:2px;">';
      G.factories[f].forEach(function(c){
        h+='<div onclick="_MSTF('+f+',\''+c+'\')" style="cursor:pointer;">'+tileDiv(c,26)+'</div>';
      });
      h+='</div>';
    }
    h+='</div>';
    // Center
    h+='<div style="text-align:center;padding:6px;background:rgba(26,31,23,0.3);border-radius:10px;margin:4px 0;min-height:36px;display:flex;gap:3px;flex-wrap:wrap;justify-content:center;align-items:center;">';
    if(G.center.length===0)h+='<span style="font-family:DM Mono,monospace;font-size:0.78rem;color:var(--muted);letter-spacing:0.06em;">CENTER EMPTY</span>';
    else{
      if(!G.firstPlayerTaken)h+='<div style="width:30px;height:30px;border-radius:4px;border:2px dashed rgba(200,168,75,0.7);display:inline-flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:var(--gold);">1st</div>';
      var grouped={};G.center.forEach(function(c){grouped[c]=(grouped[c]||0)+1;});
      for(var gc in grouped){
        for(var gi=0;gi<grouped[gc];gi++){
          h+='<div onclick="_MSTC(\''+gc+'\')" style="cursor:pointer;">'+tileDiv(gc,26)+'</div>';
        }
      }
    }
    h+='</div>';
    // Board
    h+='<div style="background:rgba(26,31,23,0.4);border:1.5px solid rgba(74,124,53,0.2);border-radius:10px;padding:8px;margin:6px 0;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);text-align:center;letter-spacing:0.1em;margin-bottom:6px;">YOUR MOSAIC</div>';
    for(var r=0;r<5;r++){
      var maxSize=r+1;
      h+='<div style="display:flex;align-items:center;gap:4px;margin:3px 0;">';
      h+='<div onclick="_MSTR('+r+')" style="display:flex;gap:2px;justify-content:flex-end;flex:1;cursor:pointer;padding:2px;border-radius:4px;'+(G.selected?'background:rgba(200,168,75,0.08);':'')+'">';
      for(var s=0;s<maxSize;s++){
        if(s<G.staging[r].length)h+=tileDiv(G.staging[r][s],22);
        else h+='<div style="width:22px;height:22px;border-radius:3px;border:1px dashed rgba(74,124,53,0.2);"></div>';
      }
      h+='</div>';
      h+='<div style="color:var(--muted);">→</div>';
      h+='<div style="display:flex;gap:2px;">';
      for(var c=0;c<5;c++){
        var wc=WALL[r][c];
        if(G.wall[r][c])h+=tileDiv(wc,22,'box-shadow:0 0 8px rgba(200,168,75,0.4);');
        else h+=tileDiv(wc,22,'opacity:0.25;');
      }
      h+='</div>';
      h+='</div>';
    }
    // Floor
    h+='<div style="display:flex;gap:2px;justify-content:center;margin-top:6px;">';
    h+='<span style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;color:var(--cream);letter-spacing:0.1em;align-self:center;margin-right:6px;">FLOOR</span>';
    for(var fl=0;fl<7;fl++){
      var filled=fl<G.floor.length;
      h+='<div onclick="_MSFL()" style="width:26px;height:26px;border-radius:4px;border:1px solid '+(filled?'rgba(199,80,80,0.4)':'rgba(74,124,53,0.2)')+';background:'+(filled?'rgba(199,80,80,0.15)':'transparent')+';display:flex;align-items:center;justify-content:center;font-size:0.55rem;color:'+(filled?'var(--cream)':'rgba(199,80,80,0.5)')+';cursor:pointer;">';
      if(filled){h+=(G.floor[fl]==='first'?'1st':ICONS[G.floor[fl]]);}
      else h+=FLOOR_PEN[fl];
      h+='</div>';
    }
    h+='</div>';
    h+='</div>';
    pan.innerHTML=h;
  }

  window._MSN=newGame;
  window._MSTF=function(fi,color){if(G.phase!=='draft'||G.selected)return;if(G.factories[fi].length===0)return;selectFromFactory(fi,color);};
  window._MSTC=function(color){if(G.phase!=='draft'||G.selected)return;if(G.center.length===0)return;selectFromCenter(color);};
  window._MSTR=function(r){if(!G.selected)return;placeInRow(r);};
  window._MSFL=function(){if(G.selected)placeOnFloor();};

  newGame();
};
})();
