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
  var phase='menu'; // 'menu' | 'playing' | 'done'
  var bestMs=0;
  try{bestMs=parseInt(localStorage.getItem('lw_pb_best')||'0',10)||0;}catch(e){}

  ms(a,'Potting Bench · best <span id="PBb">'+(bestMs?(bestMs/1000).toFixed(2)+'s':'—')+'</span>');
  mm(a);
  var pan=document.createElement('div');pan.id='PBpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:8px;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_PBN()">↻ New Game</button> <button class="gb" onclick="_PBDR()" id="PBdrawBtn" style="align-self:center;min-height:48px;max-height:56px;padding:10px 16px;">DRAW +2s</button>';

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

  function dealDeck(){
    deck=shuffle(allCards()).slice(0,30);
    pileA=deck[0];pileB=deck[1];
    while(shareAttr(pileA,pileB)===3){deck=shuffle(allCards()).slice(0,30);pileA=deck[0];pileB=deck[1];}
    hand=[deck[2],deck[3],deck[4]];
    drawPile=deck.slice(5);
    selected=-1;streak=0;elapsedMs=0;
  }

  // Reset to the menu screen — cards dealt in background but hidden
  // behind the START overlay so player gets the "click to begin" beat.
  function showMenu(){
    phase='menu';
    if(timerId){clearInterval(timerId);timerId=0;}
    running=false;
    dealDeck();
    renderMenu();
    sm('');
  }

  // Click START — reveal cards, kick off the timer.
  function beginRun(){
    phase='playing';running=true;
    startTime=Date.now();elapsedMs=0;
    if(timerId)clearInterval(timerId);
    timerId=setInterval(function(){
      if(!running||phase!=='playing'){clearInterval(timerId);timerId=0;return;}
      elapsedMs=Date.now()-startTime;
      var t=document.getElementById('PBclock');
      if(t)t.textContent=(elapsedMs/1000).toFixed(2);
    },50);
    render();
    sm('Match any attribute · clear all 30 to beat your best');
  }

  function remainingCount(){return hand.length+drawPile.length;}

  function win(){
    running=false;phase='done';
    if(timerId){clearInterval(timerId);timerId=0;}
    _e('game_win');_playWin();
    var secs=(elapsedMs/1000).toFixed(2);
    var newBest=false;
    if(!bestMs||elapsedMs<bestMs){
      bestMs=elapsedMs;newBest=true;
      try{localStorage.setItem('lw_pb_best',String(bestMs));}catch(e){}
    }
    var bb=document.getElementById('PBb');
    if(bb)bb.textContent=(bestMs/1000).toFixed(2)+'s';
    sm((newBest?'🌟 NEW BEST · ':'✓ Cleared · ')+secs+'s');
    _sr('pottingbench',{w:true,s:Math.round(elapsedMs),lo:1});
    renderEnd(secs,newBest);
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
    if(drawPile.length>0)return false;
    if(hasPlayableMove())return false;
    running=false;phase='done';
    if(timerId){clearInterval(timerId);timerId=0;}
    var secs=(elapsedMs/1000).toFixed(2);
    sm('🍂 Stuck, no matches left in hand. '+secs+'s');
    _sr('pottingbench',{w:false,s:Math.round(elapsedMs),lo:1});
    renderEnd(secs,false,true);
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

  function renderMenu(){
    var bestStr=bestMs?(bestMs/1000).toFixed(2)+'s':'—';
    var h='';
    h+='<div style="margin:8px 0 14px;">';
    h+='<div style="font-family:Cormorant Garamond,serif;font-size:0.85rem;color:var(--muted);letter-spacing:0.06em;margin-bottom:6px;">Beat your best time</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:clamp(2.6rem,12vw,4rem);color:var(--cream);letter-spacing:0.04em;line-height:1;text-shadow:0 0 18px rgba(200,168,75,0.15);">0.00</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.72rem;color:var(--muted);opacity:0.7;letter-spacing:0.1em;margin:4px 0 18px;">SECONDS</div>';
    h+='<button onclick="_PBstart()" style="min-width:170px;min-height:72px;padding:18px 32px;font-family:Bebas Neue,sans-serif;font-size:1.3rem;letter-spacing:0.16em;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.25));border:2.5px solid var(--sage);color:var(--sage);border-radius:14px;cursor:pointer;box-shadow:0 4px 18px rgba(74,124,53,0.4);">▶ START</button>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--gold);margin-top:18px;letter-spacing:0.06em;">BEST: '+bestStr+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.72rem;color:var(--muted);opacity:0.7;margin-top:6px;">30 cards · match shape, color, or count</div>';
    h+='</div>';
    pan.innerHTML=h;
    var draw=document.getElementById('PBdrawBtn');if(draw)draw.style.display='none';
  }

  function renderEnd(secs,newBest,stuck){
    var bestStr=bestMs?(bestMs/1000).toFixed(2)+'s':'—';
    var h='';
    h+='<div style="margin:8px 0 14px;">';
    h+='<div style="font-family:Cormorant Garamond,serif;font-size:0.85rem;color:var(--muted);letter-spacing:0.06em;margin-bottom:6px;">'+(stuck?'STUCK':'CLEARED')+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:clamp(2.6rem,12vw,4rem);color:'+(newBest?'var(--gold)':'var(--cream)')+';letter-spacing:0.04em;line-height:1;text-shadow:0 0 18px '+(newBest?'rgba(200,168,75,0.4)':'rgba(122,179,86,0.15)')+';">'+secs+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.72rem;color:var(--muted);opacity:0.7;letter-spacing:0.1em;margin:4px 0 18px;">SECONDS</div>';
    if(newBest)h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;color:var(--gold);letter-spacing:0.14em;margin-bottom:14px;text-shadow:0 0 18px rgba(200,168,75,0.4);">🌟 NEW BEST</div>';
    h+='<button onclick="_PBstart()" style="min-width:170px;min-height:64px;padding:14px 28px;font-family:Bebas Neue,sans-serif;font-size:1.1rem;letter-spacing:0.14em;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.2));border:2px solid var(--sage);color:var(--sage);border-radius:12px;cursor:pointer;">↻ TRY AGAIN</button>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--gold);margin-top:14px;letter-spacing:0.06em;">BEST: '+bestStr+'</div>';
    h+='</div>';
    pan.innerHTML=h;
    var draw=document.getElementById('PBdrawBtn');if(draw)draw.style.display='none';
  }

  function render(){
    if(phase==='menu'){renderMenu();return;}
    if(phase==='done')return; // renderEnd handles this state
    var clk=(elapsedMs/1000).toFixed(2);
    var h='<div style="margin:6px 0 10px;">';
    h+='<div id="PBclock" style="font-family:DM Mono,monospace;font-size:clamp(1.8rem,7vw,2.4rem);color:var(--gold);letter-spacing:0.04em;text-shadow:0 0 14px rgba(200,168,75,0.25);">'+clk+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);opacity:0.7;letter-spacing:0.1em;">SECONDS</div>';
    h+='</div>';
    h+='<div style="display:flex;justify-content:center;gap:16px;margin-bottom:10px;">';
    h+='<div onclick="_PBP(\'A\')" style="cursor:pointer;padding:3px;border:2px solid rgba(122,179,86,0.3);border-radius:8px;background:rgba(26,31,23,0.6);">'+cardSVG(pileA,60)+'<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;color:var(--sage);">PILE A</div></div>';
    h+='<div onclick="_PBP(\'B\')" style="cursor:pointer;padding:3px;border:2px solid rgba(122,179,86,0.3);border-radius:8px;background:rgba(26,31,23,0.6);">'+cardSVG(pileB,60)+'<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;color:var(--sage);">PILE B</div></div>';
    h+='</div>';
    h+='<div style="font-size:0.65rem;opacity:0.6;margin:4px;">Draw pile: '+drawPile.length+'  ·  Cards left: '+remainingCount()+'</div>';
    h+='<div style="margin-top:16px;">';
    for(var i=0;i<hand.length;i++)h+=renderCard(hand[i],i,selected===i);
    h+='</div>';
    pan.innerHTML=h;
    var draw=document.getElementById('PBdrawBtn');if(draw)draw.style.display='';
  }

  window._PBH=function(i){if(!running)return;selected=(selected===i?-1:i);render();};
  window._PBP=function(p){playCard(p);};
  window._PBDR=function(){drawPenalty();};
  window._PBstart=function(){
    // Re-deal so each START is a fresh shuffle, then fire the run.
    dealDeck();beginRun();
  };
  // 🌱 NEW button = back to menu (re-deals + shows START)
  window._PBN=function(){showMenu();};

  // Tear down the elapsed-time setInterval if player exits mid-game,
  // otherwise it keeps ticking and updating a non-existent #PBt.
  var _watchExit=setInterval(function(){
    if(!document.body.classList.contains('game-active')){
      if(timerId){clearInterval(timerId);timerId=0;}
      clearInterval(_watchExit);
    }
  },1000);

  showMenu();
};
})();
