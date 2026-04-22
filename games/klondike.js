// ═══ LUCID WINDS — Klondike Solitaire ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;
// Card utilities (loaded by _cards.js)
var _cdMk=window._cdMk,_cdSh=window._cdSh,_cdEl=window._cdEl,_cdArt=window._cdArt;
var _cdRnk=window._cdRnk,_cdSuit=window._cdSuit,_cdIsRed=window._cdIsRed,_cdBackStyle=window._cdBackStyle;
var _SUIT_SYM=window._SUIT_SYM,_SUIT_CLR=window._SUIT_CLR,_RANK_SYM=window._RANK_SYM;
var _SUIT_NAME=window._SUIT_NAME,_CD_BASE=window._CD_BASE,_CD_BACK=window._CD_BACK;

function GKL(a){
  var tableau=[],stock=[],waste=[],fnd=[],sel=null,gameOver=false,moves=0,drawCount=1,lastTap=0,lastTapCard=null;
  var history=[]; // LIFO stack of pre-move snapshots for undo
  // sel = {src:'tab'|'waste', col:N, idx:N} or null
  ms(a,'Moves: <strong id="KLmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='KLgd';a.appendChild(gd);
  var _kStyleLbl='🃏 Style';
  mc(a).innerHTML='<select class="gsl" id="KLdraw" onchange="_KLDraw(this.value)"><option value="1" selected>Draw 1</option><option value="3">Draw 3</option></select> <button class="gb" id="KLundoBtn" onclick="_KLUndo()" disabled style="opacity:0.45;">↶ Undo</button> <button class="gb" id="KLautoBtn" onclick="_KLAuto()" style="display:none;background:rgba(200,168,75,0.18);border-color:rgba(200,168,75,0.5);color:var(--gold);">✨ Auto</button> <button class="gb" onclick="_KLN()">🔄 New</button> <button class="gb" id="KLstyle" onclick="_KLToggleStyle()" style="font-size:0.7rem;">'+_kStyleLbl+'</button>';
  // Snapshot the full game state so undo can restore it exactly. Plain JSON
  // round-trip because every card is a flat {s,r,up} object. Called BEFORE
  // any mutation — every move, stock draw, and stock recycle.
  function snapshot(){
    history.push(JSON.stringify({
      tableau:tableau, stock:stock, waste:waste, fnd:fnd, moves:moves
    }));
    refreshUndoBtn();
  }
  function refreshUndoBtn(){
    var b=document.getElementById('KLundoBtn');
    if(!b)return;
    if(history.length>0&&!gameOver){b.disabled=false;b.style.opacity='1';}
    else{b.disabled=true;b.style.opacity='0.45';}
  }
  window._KLUndo=function(){
    if(history.length===0||gameOver)return;
    var snap=JSON.parse(history.pop());
    tableau=snap.tableau; stock=snap.stock; waste=snap.waste; fnd=snap.fnd; moves=snap.moves;
    sel=null; lastTap=0; lastTapCard=null;
    var el=document.getElementById('KLmv');if(el)el.textContent=moves;
    _play('tap');
    rn();
    refreshUndoBtn();
    refreshAutoBtn();
  };
  // Auto-complete eligibility — every tableau card must be face-up. Stock and
  // waste can still have cards; the cascade will drain them too.
  function autoEligible(){
    if(gameOver)return false;
    for(var c=0;c<7;c++){
      var col=tableau[c];
      for(var i=0;i<col.length;i++){if(!col[i].up)return false;}
    }
    return true;
  }
  function refreshAutoBtn(){
    var b=document.getElementById('KLautoBtn');
    if(!b)return;
    b.style.display=autoEligible()?'':'none';
  }
  // Cascade: find the lowest-rank card among tableau tops + waste top + stock
  // top that can go to any foundation, send it there, then schedule the next
  // step 40ms later. Rising-pitch chime per step. Stops when nothing legal.
  window._KLAuto=function(){
    if(!autoEligible())return;
    sel=null;
    function step(){
      if(gameOver)return;
      // Candidates: waste top, stock top (if we flip it up), each tableau top.
      var best=null; // {src, card, f}
      function consider(card, f, src){
        if(canPlaceOnFnd(card,f)){
          if(!best||card.r<best.card.r)best={src:src,card:card,f:f};
        }
      }
      if(waste.length>0){
        for(var f=0;f<4;f++)consider(waste[waste.length-1], f, 'waste');
      }
      for(var c=0;c<7;c++){
        if(tableau[c].length===0)continue;
        var top=tableau[c][tableau[c].length-1];
        if(!top.up)continue;
        for(var f2=0;f2<4;f2++)consider(top, f2, 'tab:'+c);
      }
      if(!best){
        // Nothing more to send. If stock has cards, draw one and try again;
        // otherwise we're done.
        if(stock.length>0){
          var card=stock.pop();card.up=true;waste.push(card);
          rn();
          setTimeout(step, 40);
          return;
        }
        return;
      }
      snapshot();
      if(best.src==='waste')waste.pop();
      else{
        var ci=parseInt(best.src.split(':')[1],10);
        tableau[ci].pop();
      }
      fnd[best.f].push(best.card);
      moves++;
      var el=document.getElementById('KLmv');if(el)el.textContent=moves;
      _play('tap');
      rn();
      refreshUndoBtn();
      if(checkWin()){
        gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});
        refreshAutoBtn();
        return;
      }
      setTimeout(step, 40);
    }
    step();
  };
  window._KLToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading — try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('KLstyle');
    if(b)b.textContent='🃏 Style';
    rn();
  };

  window._cdActiveRn=function(){try{rn()}catch(e){}};
  function init(){
    var deck=_cdSh(_cdMk());
    tableau=[];stock=[];waste=[];sel=null;gameOver=false;moves=0;lastTap=0;lastTapCard=null;
    history=[]; // reset undo stack — each new deal starts fresh
    fnd=[[],[],[],[]];
    for(var c=0;c<7;c++){
      tableau[c]=[];
      for(var i=0;i<=c;i++){
        var card=deck.pop();
        card.up=(i===c);
        tableau[c].push(card);
      }
    }
    stock=deck.slice();
    for(var si=0;si<stock.length;si++)stock[si].up=false;
    var el=document.getElementById('KLmv');if(el)el.textContent='0';
    rn();
  }

  function mm_up(txt){
    var el=document.getElementById('_gm');
    if(el)el.textContent=txt;
  }

  function checkWin(){
    for(var f=0;f<4;f++)if(fnd[f].length<13)return false;
    return true;
  }

  function canPlaceOnFnd(card,fi){
    var pile=fnd[fi];
    if(pile.length===0)return card.r===0;
    var top=pile[pile.length-1];
    return top.s===card.s&&card.r===top.r+1;
  }

  function canPlaceOnTab(card,ci){
    var col=tableau[ci];
    if(col.length===0)return card.r===12;
    var top=col[col.length-1];
    if(!top.up)return false;
    var topRed=_cdIsRed(top.s);
    var cardRed=_cdIsRed(card.s);
    return topRed!==cardRed&&card.r===top.r-1;
  }

  function autoToFnd(card){
    for(var f=0;f<4;f++){
      if(canPlaceOnFnd(card,f))return f;
    }
    return -1;
  }
  // Find first tableau column that accepts this card. Used as the fallback
  // after foundation in the double-tap router.
  function autoToTab(card, excludeCol){
    for(var c=0;c<7;c++){
      if(c===excludeCol)continue;
      if(canPlaceOnTab(card,c))return c;
    }
    return -1;
  }
  // Microsoft's "don't strand" safety check. If sending this card to foundation
  // would leave an opposite-color (r-1) card buried face-down somewhere it
  // could still have needed us, refuse the auto-foundation and let the player
  // do it manually via the foundation tap.
  function safeToFnd(card){
    if(card.r<=1)return true; // A, 2 always safe
    var oppSuits=_cdIsRed(card.s)?[0,3]:[1,2]; // red→black (spades=0,clubs=3), black→red (hearts=1,diamonds=2)
    var needR=card.r-1;
    for(var s=0;s<oppSuits.length;s++){
      var suit=oppSuits[s];
      for(var c=0;c<7;c++){
        var col=tableau[c];
        for(var k=0;k<col.length;k++){
          var tc=col[k];
          if(tc.s===suit&&tc.r===needR&&!tc.up)return false;
        }
      }
    }
    return true;
  }

  function doMove(){
    moves++;
    var el=document.getElementById('KLmv');if(el)el.textContent=moves;
    _play('tap');
    _e('progress');
    refreshUndoBtn();
    refreshAutoBtn();
  }

  function tapStock(){
    sel=null;
    if(stock.length===0){
      if(waste.length===0)return;
      snapshot();
      stock=waste.reverse();
      waste=[];
      for(var i=0;i<stock.length;i++)stock[i].up=false;
      rn();return;
    }
    snapshot();
    var cnt=Math.min(drawCount,stock.length);
    for(var i=0;i<cnt;i++){
      var card=stock.pop();card.up=true;
      waste.push(card);
    }
    _play('tap');
    rn();
  }

  function tapWaste(){
    if(waste.length===0)return;
    var now=Date.now();
    var topCard=waste[waste.length-1];
    // Double-tap auto-route: foundation first (if safe), then tableau fallback.
    if(lastTapCard&&lastTapCard.s===topCard.s&&lastTapCard.r===topCard.r&&now-lastTap<400){
      var fi=autoToFnd(topCard);
      if(fi>=0&&safeToFnd(topCard)){
        snapshot();
        waste.pop();
        fnd[fi].push(topCard);
        sel=null;doMove();
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
        rn();lastTap=0;lastTapCard=null;return;
      }
      var tc=autoToTab(topCard);
      if(tc>=0){
        snapshot();
        waste.pop();
        tableau[tc].push(topCard);
        sel=null;doMove();
        rn();lastTap=0;lastTapCard=null;return;
      }
    }
    lastTap=now;lastTapCard={s:topCard.s,r:topCard.r};
    if(sel&&sel.src==='waste'){sel=null;rn();return}
    sel={src:'waste',col:-1,idx:waste.length-1};
    rn();
  }

  function tapFnd(fi){
    if(!sel){return}
    var card=null;
    if(sel.src==='waste'){
      card=waste[waste.length-1];
      if(canPlaceOnFnd(card,fi)){
        snapshot();
        waste.pop();fnd[fi].push(card);sel=null;doMove();
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
        rn();return;
      }
    }else if(sel.src==='tab'){
      var col=tableau[sel.col];
      if(sel.idx===col.length-1){
        card=col[col.length-1];
        if(canPlaceOnFnd(card,fi)){
          snapshot();
          col.pop();fnd[fi].push(card);
          if(col.length>0&&!col[col.length-1].up)col[col.length-1].up=true;
          sel=null;doMove();
          if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
          rn();return;
        }
      }
    }
    sm('Can\'t place there');
  }

  function tapTab(ci,cardIdx){
    if(gameOver)return;
    var col=tableau[ci];

    // Tap on empty column
    if(col.length===0){
      if(!sel)return;
      // Move selected cards to empty column (only Kings)
      if(sel.src==='waste'){
        var wc=waste[waste.length-1];
        if(wc.r===12){snapshot();waste.pop();col.push(wc);sel=null;doMove();rn();return;}
        sm('Only Kings on empty');sel=null;rn();return;
      }
      if(sel.src==='tab'){
        var srcCol=tableau[sel.col];
        var card=srcCol[sel.idx];
        if(card.r===12){
          snapshot();
          var run=srcCol.splice(sel.idx);
          for(var ri=0;ri<run.length;ri++)col.push(run[ri]);
          if(srcCol.length>0&&!srcCol[srcCol.length-1].up)srcCol[srcCol.length-1].up=true;
          sel=null;doMove();rn();return;
        }
        sm('Only Kings on empty');sel=null;rn();return;
      }
      return;
    }

    var tappedCard=col[cardIdx];

    // Tap face-down card — flip it if it's the last
    if(!tappedCard.up){
      if(cardIdx===col.length-1){snapshot();tappedCard.up=true;rn();}
      return;
    }

    var now=Date.now();
    // Double-tap auto-route: foundation first (if safe), then tableau fallback.
    if(cardIdx===col.length-1&&lastTapCard&&lastTapCard.s===tappedCard.s&&lastTapCard.r===tappedCard.r&&now-lastTap<400){
      var fi=autoToFnd(tappedCard);
      if(fi>=0&&safeToFnd(tappedCard)){
        snapshot();
        col.pop();fnd[fi].push(tappedCard);
        if(col.length>0&&!col[col.length-1].up)col[col.length-1].up=true;
        sel=null;doMove();
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
        rn();lastTap=0;lastTapCard=null;return;
      }
      var tc2=autoToTab(tappedCard,ci);
      if(tc2>=0){
        snapshot();
        col.pop();tableau[tc2].push(tappedCard);
        if(col.length>0&&!col[col.length-1].up)col[col.length-1].up=true;
        sel=null;doMove();
        rn();lastTap=0;lastTapCard=null;return;
      }
    }
    lastTap=now;lastTapCard={s:tappedCard.s,r:tappedCard.r};

    // If nothing selected, select this card (and everything below it)
    if(!sel){
      sel={src:'tab',col:ci,idx:cardIdx};
      rn();return;
    }

    // If tapping same selection, deselect
    if(sel.src==='tab'&&sel.col===ci&&sel.idx===cardIdx){
      sel=null;rn();return;
    }

    // Try to place selected cards on this column
    var srcCard=null;
    if(sel.src==='waste'){
      srcCard=waste[waste.length-1];
      if(canPlaceOnTab(srcCard,ci)){
        snapshot();
        waste.pop();col.push(srcCard);sel=null;doMove();rn();return;
      }
    }else if(sel.src==='tab'){
      var srcCol=tableau[sel.col];
      srcCard=srcCol[sel.idx];
      if(canPlaceOnTab(srcCard,ci)){
        snapshot();
        var run=srcCol.splice(sel.idx);
        for(var ri=0;ri<run.length;ri++)col.push(run[ri]);
        if(srcCol.length>0&&!srcCol[srcCol.length-1].up)srcCol[srcCol.length-1].up=true;
        sel=null;doMove();rn();return;
      }
    }
    // Invalid move — reselect to tapped card
    sel={src:'tab',col:ci,idx:cardIdx};
    rn();
  }

  function rn(){
    gd.innerHTML='';
    // Smart-drop highlight source. When a card/run is selected, every legal
    // destination glows green so the player sees their options at a glance.
    var srcCard=null, srcIsSingle=true, srcColIdx=-1;
    if(sel){
      if(sel.src==='waste'&&waste.length>0){srcCard=waste[waste.length-1];}
      else if(sel.src==='tab'){
        srcCard=tableau[sel.col][sel.idx];
        srcIsSingle=(sel.idx===tableau[sel.col].length-1);
        srcColIdx=sel.col;
      }
    }

    // Top row: stock, waste, spacer, 4 foundations
    var topRow=document.createElement('div');
    // Auto-fit: 7 tableau columns drive sizing; top-row spacer absorbs leftover.
    // Cap at 80 so landscape phones aren't swamped by huge cards.
    var fit=window._cdFit?window._cdFit(7,{maxW:80,gap:4,pad:12}):{w:'clamp(56px,14.5vw,80px)',h:'clamp(78px,20.2vw,112px)',font:'clamp(.65rem,1.9vw,.85rem)',peek:'16px',raw:{h:112,peek:16}};
    var klW=fit.w,klH=fit.h,klF=fit.font;
    topRow.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center;padding:4px 0;width:100%;max-width:100vw;margin:0 auto;align-items:flex-start;flex-wrap:nowrap';

    // Stock
    var stEl=document.createElement('div');
    if(stock.length>0){
      stEl.className='gc gc-dn';
      _cdBackStyle(stEl);
      stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+stock.length+'</span>';
      stEl.style.cursor='pointer';
    }else{
      stEl.className='gc gc-empty';
      if(waste.length>0)stEl.innerHTML='<span style="color:var(--muted);font-size:clamp(.6rem,1.8vw,.8rem)">↺</span>';
    }
    stEl.style.width=klW;stEl.style.height=klH;stEl.style.fontSize=klF;
    stEl.onclick=function(){tapStock()};
    topRow.appendChild(stEl);

    // Waste (show top card only for draw-1; top 3 fanned for draw-3)
    var wasteWrap=document.createElement('div');
    wasteWrap.style.cssText='position:relative;width:'+klW+';height:'+klH;
    if(waste.length>0){
      var showCount=drawCount===3?Math.min(3,waste.length):1;
      for(var wi=0;wi<showCount;wi++){
        var wIdx=waste.length-showCount+wi;
        var wc=waste[wIdx];
        var wEl=_cdEl(wc);
        wEl.style.width=klW;wEl.style.height=klH;wEl.style.fontSize=klF;
        wEl.style.position='absolute';
        wEl.style.left=(wi*8)+'px';wEl.style.top='0';
        if(wi===showCount-1){
          if(sel&&sel.src==='waste')wEl.className+=' gc-sel';
          wEl.style.cursor='pointer';
          wEl.onclick=function(){tapWaste()};
        }
        wasteWrap.appendChild(wEl);
      }
    }else{
      var emW=document.createElement('div');emW.className='gc gc-empty';
      emW.style.width=klW;emW.style.height=klH;
      wasteWrap.appendChild(emW);
    }
    topRow.appendChild(wasteWrap);

    // Spacer
    var sp=document.createElement('div');
    sp.style.cssText='width:clamp(4px,1.5vw,10px);flex-shrink:0';
    topRow.appendChild(sp);

    // 4 Foundations
    for(var f=0;f<4;f++){
      var fEl=document.createElement('div');
      if(fnd[f].length>0){
        var topC=fnd[f][fnd[f].length-1];
        fEl=_cdEl(topC);
        fEl.className+=' gc-fnd';
      }else{
        fEl.className='gc gc-fnd';
        if(window._cdFndEmpty)window._cdFndEmpty(fEl,f);
        else fEl.style.backgroundImage="url('"+_CD_BASE+_SUIT_NAME[f]+".png')";
      }
      fEl.style.width=klW;fEl.style.height=klH;fEl.style.fontSize=klF;
      fEl.style.cursor='pointer';
      // Smart-drop: light up foundations that accept the selected single card.
      if(srcCard&&srcIsSingle&&canPlaceOnFnd(srcCard,f))fEl.classList.add('gc-legal');
      (function(fi){fEl.onclick=function(){tapFnd(fi)}})(f);
      topRow.appendChild(fEl);
    }
    gd.appendChild(topRow);

    // Tableau
    var tabRow=document.createElement('div');
    tabRow.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center;padding:4px 0;width:100%;max-width:100vw;margin:0 auto;align-items:flex-start';
    // Peek via negative margin-top — each card keeps its full height + border-
    // radius, only the next card's overlap hides the bottom. Face-up cards show
    // their top-left rank/suit corner (~20% reveal). Face-down cards reveal
    // less (~11%) so stacks stay tight and suits of lower cards stay legible.
    var revealUp = 0.18; // % of h shown per face-up card under top
    var revealDn = 0.11; // % of h shown per face-down card

    for(var c=0;c<7;c++){
      var colDiv=document.createElement('div');
      colDiv.style.cssText='display:flex;flex-direction:column;min-width:'+klW+';align-items:center';
      // Smart-drop for this column — legal if source exists, column isn't the
      // source column, and the run head can be placed here.
      var colLegal = (srcCard && c!==srcColIdx && canPlaceOnTab(srcCard, c));

      if(tableau[c].length===0){
        var em=document.createElement('div');
        em.className='gc gc-empty';
        if(colLegal)em.classList.add('gc-legal');
        em.style.width=klW;em.style.height=klH;
        em.style.cursor='pointer';
        (function(ci){em.onclick=function(){tapTab(ci,0)}})(c);
        colDiv.appendChild(em);
      }else{
        var depth=tableau[c].length;
        // Compress peek when the pile grows deep so the bottom stays on-screen.
        var depthMult = depth>14 ? 0.5 : depth>11 ? 0.65 : depth>8 ? 0.8 : 1.0;
        for(var i=0;i<depth;i++){
          var card=tableau[c][i];
          var cdEl=_cdEl(card);
          cdEl.style.width=klW;cdEl.style.height=klH;cdEl.style.fontSize=klF;
          cdEl.style.position='relative';
          cdEl.style.zIndex=i;
          // Overlap the previous card — reveal depends on face-up vs face-down.
          if(i>0){
            var prev=tableau[c][i-1];
            var reveal = (prev.up?revealUp:revealDn) * depthMult;
            var overlap = Math.round(fit.raw.h * (1 - reveal));
            cdEl.style.marginTop = (-overlap)+'px';
          }
          // All cards below the top hide their center art + bottom-right corner.
          if(i<depth-1)cdEl.classList.add('gc-peek');
          // Selection highlight
          if(sel&&sel.src==='tab'&&sel.col===c&&i>=sel.idx&&card.up){
            cdEl.className+=' gc-sel';
          }
          // Smart-drop: last card of a legal column glows.
          if(colLegal&&i===depth-1)cdEl.classList.add('gc-legal');
          if(card.up){
            cdEl.style.cursor='pointer';
            (function(ci,idx){cdEl.onclick=function(ev){ev.stopPropagation();tapTab(ci,idx)}})(c,i);
          }
          colDiv.appendChild(cdEl);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
    refreshAutoBtn();
  }

  window._KLN=function(){init()};
  window._KLDraw=function(v){drawCount=parseInt(v)||1;init()};
  init();
}

window._gameFns.klondike=GKL;
})();
