// ═══ LUCID WINDS — Potting Bench (speed attribute-match) ═══
// Uses Three Sisters shape set (clover / pot / droplet) for brand consistency.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

window._gameFns=window._gameFns||{};
window._gameFns.pottingbench=function PB(a){
  var SHAPES=['clover','pot','droplet'];
  var COLORS=['#7ab356','#c8a84b','#c47a7a','#5b9bd5','#e8dcc8'];
  var COUNTS=[1,2,3];

  var PATHS={
    clover:'M16 11 C14 7 8 5 6 9 C4 13 8 15 12 14 C9 15 4 17 5 22 C6 26 12 25 14 21 C14 24 16 28 19 28 C22 28 24 24 22 20 C25 23 30 22 30 18 C30 14 25 12 21 14 C24 12 24 7 20 6 C17 5 15 7 16 11Z',
    pot:'M5 8 L27 8 L23 28 L9 28 Z',
    droplet:'M16 3 C16 3 6 16 6 21 C6 26.5 10.5 30 16 30 C21.5 30 26 26.5 26 21 C26 16 16 3 16 3Z'
  };

  function shapeSVG(shape,color,cx,cy,scale){
    scale=scale||0.6;
    // Path space is 32×32; translate so center of path (16,16) lands on (cx,cy) after scale.
    var tx=cx-16*scale,ty=cy-16*scale;
    return '<g transform="translate('+tx.toFixed(2)+','+ty.toFixed(2)+') scale('+scale+')"><path d="'+PATHS[shape]+'" fill="'+color+'" stroke="'+color+'" stroke-width="1.2" stroke-linejoin="round"/></g>';
  }

  function allCards(){
    var out=[];
    for(var s=0;s<SHAPES.length;s++)for(var c=0;c<COLORS.length;c++)for(var n=0;n<COUNTS.length;n++)
      out.push({shape:SHAPES[s],color:COLORS[c],count:COUNTS[n]});
    return out;
  }
  function shuffle(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function shareAttr(a,b){var c=0;if(a.shape===b.shape)c++;if(a.color===b.color)c++;if(a.count===b.count)c++;return c;}

  var deck=[],hand=[],pileA=null,pileB=null,drawPile=[];
  var selected=-1,streak=0,startTime=0,elapsedMs=0,running=false,timerId=0;

  ms(a,'Potting Bench · <span id="PBt">0.0s</span> · <span id="PBq">30</span> left');
  mm(a);
  var pan=document.createElement('div');pan.id='PBpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:8px;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_PBN()">🌱 NEW</button> <button class="gb" onclick="_PBDR()">DRAW +2s</button>';

  function cardSVG(card,size){
    var s=size||50;
    var h='<svg width="'+s+'" height="'+(s*1.4)+'" viewBox="0 0 50 70" style="display:block;">';
    h+='<rect x="1" y="1" width="48" height="68" rx="6" fill="rgba(26,31,23,0.9)" stroke="rgba(122,179,86,0.4)" stroke-width="1.5"/>';
    var positions=card.count===1?[[25,35]]:card.count===2?[[17,35],[33,35]]:[[17,28],[33,28],[25,46]];
    var scale=card.count===1?0.65:0.5;
    for(var i=0;i<positions.length;i++){
      h+=shapeSVG(card.shape,card.color,positions[i][0],positions[i][1],scale);
    }
    h+='</svg>';
    return h;
  }

  function newGame(){
    deck=shuffle(allCards()).slice(0,30);
    pileA=deck[0];pileB=deck[1];
    while(shareAttr(pileA,pileB)===3){deck=shuffle(allCards()).slice(0,30);pileA=deck[0];pileB=deck[1];}
    hand=[deck[2],deck[3],deck[4]];
    drawPile=deck.slice(5);
    selected=-1;streak=0;
    startTime=Date.now();elapsedMs=0;running=true;
    if(timerId)clearInterval(timerId);
    timerId=setInterval(function(){
      elapsedMs=Date.now()-startTime;
      var t=document.getElementById('PBt');
      if(t)t.textContent=(elapsedMs/1000).toFixed(1)+'s';
    },100);
    render();
    sm('Match any attribute · speed wins');
  }

  function remainingCount(){return hand.length+drawPile.length;}

  function win(){
    running=false;if(timerId)clearInterval(timerId);
    _e('game_win');_playWin();
    var secs=(elapsedMs/1000).toFixed(1);
    sm('✓ Cleared in '+secs+'s');
    _sr('pottingbench',{w:true,s:Math.round(elapsedMs)});
  }

  // Returns true if at least one hand card can match either pile.
  // Used to detect soft-lock: no playable cards AND no draws left.
  function hasPlayableMove(){
    for(var i=0;i<hand.length;i++){
      if(shareAttr(hand[i],pileA)>=1||shareAttr(hand[i],pileB)>=1)return true;
    }
    return false;
  }

  function checkStuck(){
    // If draw is available, player can always force a new pileA, so
    // they're never truly stuck. Only end when both options exhausted.
    if(drawPile.length>0)return false;
    if(hasPlayableMove())return false;
    // Stuck — end with current state. Treat as a partial run: write
    // a non-win record so attempts count, but don't fire game_loss
    // since the player did real work.
    running=false;if(timerId)clearInterval(timerId);
    var secs=(elapsedMs/1000).toFixed(1);
    sm('🍂 Stuck — no matches left in hand. '+secs+'s');
    _sr('pottingbench',{w:false,s:Math.round(elapsedMs)});
    render();
    return true;
  }

  function playCard(pile){
    if(!running)return;
    if(selected<0){sm('Pick a card from your hand first');return;}
    var card=hand[selected];
    var top=pile==='A'?pileA:pileB;
    if(shareAttr(card,top)>=1){
      if(pile==='A')pileA=card;else pileB=card;
      hand.splice(selected,1);
      if(drawPile.length>0)hand.push(drawPile.shift());
      selected=-1;streak++;
      _e('progress');
      if(streak%5===0)_e('milestone');
      if(hand.length===0&&drawPile.length===0){win();return;}
      render();
      // Detect soft-lock after the new card is dealt. If still
      // playable, fine; otherwise end the run cleanly.
      checkStuck();
    } else {
      sm('No match');streak=0;
    }
  }

  function drawPenalty(){
    if(!running)return;
    if(drawPile.length===0){sm('Draw pile empty');return;}
    pileA=drawPile.shift();
    startTime-=2000;
    streak=0;selected=-1;
    sm('+2s penalty');
    render();
    // After force-swapping pileA, may have surfaced a stuck state if
    // hand still doesn't match and that was the last draw card.
    checkStuck();
  }

  function renderCard(card,idx,isSelected){
    var sty='display:inline-block;margin:4px;padding:2px;border-radius:8px;background:rgba(26,31,23,0.4);border:2px solid '+(isSelected?'var(--gold)':'rgba(122,179,86,0.3)')+';cursor:pointer;'+(isSelected?'transform:translateY(-6px);box-shadow:0 4px 12px rgba(200,168,75,0.4);':'');
    return '<div onclick="_PBH('+idx+')" style="'+sty+'">'+cardSVG(card)+'</div>';
  }

  function render(){
    var h='<div style="margin:10px 0;">';
    h+='<div style="display:flex;justify-content:center;gap:16px;margin-bottom:10px;">';
    h+='<div onclick="_PBP(\'A\')" style="cursor:pointer;padding:3px;border:2px solid rgba(122,179,86,0.3);border-radius:8px;background:rgba(26,31,23,0.6);">'+cardSVG(pileA,60)+'<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;color:var(--sage);">PILE A</div></div>';
    h+='<div onclick="_PBP(\'B\')" style="cursor:pointer;padding:3px;border:2px solid rgba(122,179,86,0.3);border-radius:8px;background:rgba(26,31,23,0.6);">'+cardSVG(pileB,60)+'<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;color:var(--sage);">PILE B</div></div>';
    h+='</div>';
    h+='<div style="font-size:0.65rem;opacity:0.6;margin:4px;">Draw pile: '+drawPile.length+'  ·  Streak: '+streak+(streak>=5?' 🔥':'')+'</div>';
    h+='<div style="margin-top:16px;">';
    for(var i=0;i<hand.length;i++)h+=renderCard(hand[i],i,selected===i);
    h+='</div>';
    h+='</div>';
    pan.innerHTML=h;
    var q=document.getElementById('PBq');if(q)q.textContent=remainingCount();
  }

  window._PBH=function(i){if(!running)return;selected=(selected===i?-1:i);render();};
  window._PBP=function(p){playCard(p);};
  window._PBDR=function(){drawPenalty();};
  window._PBN=function(){newGame();};

  // Tear down the elapsed-time setInterval if player exits mid-game,
  // otherwise it keeps ticking and updating a non-existent #PBt.
  var _watchExit=setInterval(function(){
    if(!document.body.classList.contains('game-active')){
      if(timerId){clearInterval(timerId);timerId=0;}
      clearInterval(_watchExit);
    }
  },1000);

  newGame();
};
})();
