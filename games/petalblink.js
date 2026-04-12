// ═══ LUCID WINDS — Petal Blink (speed attribute-match card game) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;


window._gameFns=window._gameFns||{};
window._gameFns.petalblink=function PB(a){
  var SHAPES=['leaf','bloom','stem','seed','drop','vine'];
  var COLORS=['#7ab356','#c8a84b','#c47a7a','#5b9bd5','#e8dcc8'];
  var COUNTS=[1,2,3];

  // Build full 90-card deck
  function allCards(){
    var out=[];
    for(var s=0;s<SHAPES.length;s++)for(var c=0;c<COLORS.length;c++)for(var n=0;n<COUNTS.length;n++)
      out.push({shape:SHAPES[s],color:COLORS[c],count:COUNTS[n]});
    return out;
  }

  function shuffle(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}

  function shareAttr(a,b){
    var c=0;
    if(a.shape===b.shape)c++;
    if(a.color===b.color)c++;
    if(a.count===b.count)c++;
    return c;
  }

  var deck=[],hand=[],pileA=null,pileB=null,drawPile=[];
  var selected=-1,streak=0,startTime=0,elapsedMs=0,running=false;
  var timerId=0;

  ms(a,'Petal Blink · <span id="PBt">0.0s</span> · <span id="PBq">30</span> left');
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
    for(var i=0;i<positions.length;i++){
      var cx=positions[i][0],cy=positions[i][1];
      h+=shapeSVG(card.shape,card.color,cx,cy);
    }
    h+='</svg>';
    return h;
  }

  function shapeSVG(shape,color,cx,cy){
    switch(shape){
      case 'leaf':return '<path d="M'+cx+','+(cy-7)+' Q'+(cx+6)+','+(cy-4)+' '+(cx+5)+','+(cy+4)+' Q'+cx+','+(cy+7)+' '+(cx-5)+','+(cy+4)+' Q'+(cx-6)+','+(cy-4)+' '+cx+','+(cy-7)+' Z" fill="'+color+'"/>';
      case 'bloom':var p='';for(var k=0;k<5;k++){var ang=k*72*Math.PI/180;var px=cx+Math.cos(ang)*4,py=cy+Math.sin(ang)*4;p+='<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="2.5" fill="'+color+'"/>';}return p+'<circle cx="'+cx+'" cy="'+cy+'" r="1.8" fill="'+color+'" opacity="0.8"/>';
      case 'stem':return '<rect x="'+(cx-2)+'" y="'+(cy-6)+'" width="4" height="12" rx="2" fill="'+color+'"/>';
      case 'seed':return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="3.5" ry="5.5" fill="'+color+'"/>';
      case 'drop':return '<path d="M'+cx+','+(cy-6)+' Q'+(cx+5)+','+cy+' '+cx+','+(cy+6)+' Q'+(cx-5)+','+cy+' '+cx+','+(cy-6)+' Z" fill="'+color+'"/>';
      case 'vine':return '<path d="M'+(cx-5)+','+(cy-5)+' Q'+(cx+5)+','+(cy-2)+' '+(cx-5)+','+(cy+2)+' Q'+(cx+5)+','+(cy+4)+' '+(cx+2)+','+(cy+6)+'" stroke="'+color+'" stroke-width="2" fill="none"/>';
    }
    return '';
  }

  function newGame(){
    deck=shuffle(allCards()).slice(0,30);
    pileA=deck[0];pileB=deck[1];
    // Ensure different
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
    running=false;
    if(timerId)clearInterval(timerId);
    _e('game_win');_playWin();
    var secs=(elapsedMs/1000).toFixed(1);
    sm('✓ Cleared in '+secs+'s');
    _sr('petalblink',{w:true,s:Math.round(elapsedMs)});
  }

  function playCard(pile){
    if(!running||selected<0)return;
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
    } else {
      // shake feedback
      sm('No match');
      streak=0;
    }
  }

  function drawPenalty(){
    if(!running||drawPile.length===0)return;
    var top=drawPile.shift();
    // Apply to whichever pile differs less
    pileA=top;
    startTime-=2000; // 2 second penalty
    streak=0;selected=-1;
    sm('+2s penalty');
    render();
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

  newGame();
};
})();
