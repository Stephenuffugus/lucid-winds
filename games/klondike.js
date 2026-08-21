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
var _cdDeckHtml=window._cdDeckHtml,_cdDeal=window._cdDeal;

function GKL(a){
  var tableau=[],stock=[],waste=[],fnd=[],sel=null,gameOver=false,moves=0,drawCount=1,lastTap=0,lastTapCard=null;
  var history=[]; // LIFO stack of pre-move snapshots for undo
  var autoGen=0;  // auto-complete cascade generation (cancelled on new deal / exit)
  // ── THE DEAL (2026-08-21) ───────────────────────────────────────────────
  // Klondike went from "New Game" to a finished twenty-eight card tableau in
  // one frame. Same cards, same layout, but nothing ever LOOKED dealt, so the
  // board arrived as a puzzle diagram instead of as a hand somebody just laid
  // out for you.
  //
  // The choreography is the real one, card by card: one to columns 1-7, then
  // 2-7, then 3-7, down to a single card in column 7. Twenty-eight steps in
  // seven passes. Hearts batches a whole round per step because four hands of
  // thirteen would be 52 rebuilds; here 28 IS the showpiece — the staircase
  // building itself left to right is the most recognisable deal in solitaire
  // and batching a pass would throw the staircase away.
  //
  // Each pass hands its own column the face-up capstone FIRST, which is why
  // the flip falls out of the model for free: tableau[c][i] is face-up exactly
  // when i===c, and column c gets index c on pass c. The capstone wears
  // cd-flip, every other freshly laid card cd-deal-in.
  //
  // ⛔ NOTHING FLIES ACROSS THE TABLE. rn() rebuilds gd.innerHTML wholesale on
  // every step, which would kill any in-flight transition mid-air. We stage
  // state, re-render, and let CSS pop the newest card — that survives a full
  // repaint.
  //
  // Budget: 850ms shuffle + 28 x 80ms = 3090ms, inside the 2-3.5s window.
  var dealt=[0,0,0,0,0,0,0]; // cards revealed per column; the model is already complete
  var dealing=false,shuffling=false,dealHandle=null,laidCol=-1,laidIdx=-1,stockPop=false;
  function dealtTotal(){var n=0;for(var d=0;d<7;d++)n+=dealt[d];return n;}
  // sel = {src:'tab'|'waste', col:N, idx:N} or null
  ms(a,'Moves: <strong id="KLmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='KLgd';a.appendChild(gd);
  var _kStyleLbl='🃏 Style';
  mc(a).innerHTML='<select class="gsl" id="KLdraw" onchange="_KLDraw(this.value)"><option value="1" selected>Draw 1</option><option value="3">Draw 3</option></select> <button class="gb" id="KLundoBtn" onclick="_KLUndo()" disabled style="opacity:0.45;">↶ Undo</button> <button class="gb" id="KLautoBtn" onclick="_KLAuto()" style="display:none;background:rgba(200,168,75,0.18);border-color:rgba(200,168,75,0.5);color:var(--gold);">✨ Auto</button> <button class="gb" onclick="_KLN()">↻ New Game</button> <button class="gb" id="KLstyle" onclick="_KLToggleStyle()" style="font-size:0.7rem;">'+_kStyleLbl+'</button>';
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
    if(dealing||history.length===0||gameOver)return;
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
    if(dealing||gameOver)return false;
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
    if(dealing||!autoEligible())return;
    sel=null;
    // Generation token: bumped by init() and the exit cleanup so a cascade
    // can't keep chirping/moving (or fire game_win under another game) after
    // the player leaves or starts a new deal.
    var g=++autoGen;
    var drawsSinceMove=0;
    function step(){
      if(g!==autoGen||gameOver)return;
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
        // Nothing more to send. If stock has cards, draw one and try again.
        if(stock.length>0){
          var card=stock.pop();card.up=true;waste.push(card);
          drawsSinceMove++;
          rn();
          setTimeout(step, 40);
          return;
        }
        // Stock empty: recycle the waste and keep going — a needed card
        // buried in the waste used to stall the cascade here. Stop only
        // after a full fruitless pass (no foundation move in a whole cycle).
        if(waste.length>0&&drawsSinceMove<waste.length){
          snapshot();
          stock=waste.reverse();
          waste=[];
          for(var ri=0;ri<stock.length;ri++)stock[ri].up=false;
          rn();
          setTimeout(step, 40);
          return;
        }
        return;
      }
      drawsSinceMove=0;
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
        _kdWin();
        refreshAutoBtn();
        return;
      }
      setTimeout(step, 40);
    }
    step();
  };
  window._KLToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading, try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('KLstyle');
    if(b)b.textContent='🃏 Style';
    rn();
  };

  window._cdActiveRn=function(){try{rn()}catch(e){}};
  function init(){
    var deck=_cdSh(_cdMk());
    autoGen++; // cancel any auto-complete cascade from the previous deal
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
    startDeal();
  }

  // The model above is already finished and correct. startDeal only controls
  // how much of it rn() is allowed to draw, so the cards never move behind the
  // player's back and undo/win logic never sees a half-built tableau.
  function startDeal(){
    // ⛔ CANCEL FIRST. New Game and the Draw 1/3 selector both re-enter init()
    // whenever the player likes, and a deal still in flight would keep firing
    // timers into a tableau that has been replaced underneath it.
    if(dealHandle)dealHandle.cancel();
    dealt=[0,0,0,0,0,0,0];laidCol=-1;laidIdx=-1;stockPop=false;
    dealing=true;shuffling=true;
    rn();
    // Seven passes: pass k lays one card on every column from k to 6, and its
    // own column k gets that pass's first card (the face-up capstone).
    var order=[];
    for(var k=0;k<7;k++){for(var c=k;c<7;c++)order.push(c);}
    dealHandle=_cdDeal({
      steps:order, shuffleMs:850, stepMs:80,
      alive:function(){return dealing;},
      onShuffle:function(){shuffling=true;},
      onShuffleEnd:function(){shuffling=false;rn();},
      onStep:function(col){laidCol=col;dealt[col]++;laidIdx=dealt[col]-1;rn();},
      // The last beat is the stock: 24 cards left in hand get set down as a
      // pile, so the deck reads as "put down" rather than just stopping.
      onDone:function(){dealing=false;laidCol=-1;laidIdx=-1;stockPop=true;rn();
        refreshUndoBtn();refreshAutoBtn();}
    });
  }

  function mm_up(txt){
    var el=document.getElementById('_gm');
    if(el)el.textContent=txt;
  }

  // Campaign leftover: proper end overlay on top of the engine celebration.
  // No loss path exists in solitaire (you abandon), so we keep a plain
  // lifetime-wins counter instead of the W/P/streak triple.
  function _kdWin(){
    gameOver=true;mm_up('\ud83c\udfc6 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves,lo:1});
    var w=(parseInt(localStorage.getItem('lw_klondike_w'),10)||0)+1;
    try{localStorage.setItem('lw_klondike_w',String(w));}catch(e){}
    if(window._lwGameEnd)window._lwGameEnd({won:true,title:'Garden cleared!',line:moves+' moves \u00b7 '+w+' lifetime wins',retry:function(){if(window._KLN)window._KLN();},retryLabel:'\u21bb NEW DEAL',viewLabel:'view the table',delay:900});
  }
  function checkWin(){
    for(var f=0;f<4;f++)if(fnd[f].length<13)return false;
    return true;
  }

  function canPlaceOnFnd(card,fi){
    var pile=fnd[fi];
    // Foundation index fi IS the suit — the empty slot shows that suit's art,
    // so only that suit's Ace is legal to seed the pile.
    if(pile.length===0)return card.r===0&&card.s===fi;
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
    if(dealing)return;
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
    if(dealing||waste.length===0)return;
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
        if(checkWin()){_kdWin();}
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
    if(dealing)return;
    if(!sel){return}
    var card=null;
    if(sel.src==='waste'){
      card=waste[waste.length-1];
      if(canPlaceOnFnd(card,fi)){
        snapshot();
        waste.pop();fnd[fi].push(card);sel=null;doMove();
        if(checkWin()){_kdWin();}
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
          if(checkWin()){_kdWin();}
          rn();return;
        }
      }
    }
    sm('Can\'t place there');
  }

  function tapTab(ci,cardIdx){
    if(dealing||gameOver)return;
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
        if(checkWin()){_kdWin();}
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
    // Preserve the scrollable container's position across rebuilds — otherwise
    // every click that triggers rn() snaps the viewport back to the top.
    var _ag=document.getElementById('fg-ag');
    var _scrollY=_ag?_ag.scrollTop:0;
    gd.innerHTML='';
    // One-shot: the stock's landing pop must fire on exactly the render that
    // follows the deal, not on every render after it (rn() rebuilds the node,
    // so a sticky flag would restart the animation on every tap).
    var pop=stockPop;stockPop=false;
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
    // Cap at 72 so landscape phones aren't swamped by huge cards.
    var fit=window._cdFit?window._cdFit(7,{maxW:72,gap:3,pad:10}):{w:'clamp(52px,13.5vw,72px)',h:'clamp(72px,18.9vw,100px)',font:'clamp(.6rem,1.7vw,.8rem)',peek:'14px',raw:{w:66,h:100,peek:14}};
    var klW=fit.w,klH=fit.h,klF=fit.font;
    topRow.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center;padding:4px 0;width:100%;max-width:100vw;margin:0 auto;align-items:flex-start;flex-wrap:nowrap';

    // Stock. During the deal it is the undealt DECK — a stack of backs that
    // wiggles, counts down 52 to 24 and captions itself; it is the only thing
    // on the table that moves while the cards go out. Once the deal lands it
    // goes back to the ordinary stock slot, which is style-aware (_cdBackStyle
    // paints floral/classic/garden backs) where the shared deck art is not, and
    // the stock has to match the face-down tableau cards beside it.
    //
    // ⛔ THE DECK FLOATS IN A FIXED SLOT, the way Hearts and Spades park theirs
    // in an absolutely positioned box. That caption is a real block element,
    // and in normal flow it would grow the top row ~20px for the length of the
    // deal and collapse it again the instant the deal ended — a whole-tableau
    // jolt on the very frame the player is watching the last card land. The
    // deck is sized to leave the caption room inside one slot, so out of flow
    // it costs nothing and the row never moves.
    var stEl=document.createElement('div');
    if(dealing){
      var dkH=Math.max(30,fit.raw.h-28),dkW=Math.max(22,Math.round(dkH/1.4247));
      stEl.style.cssText='position:relative;flex-shrink:0;width:'+klW+';height:'+klH+';';
      stEl.innerHTML='<div style="position:absolute;left:0;right:0;top:0;display:flex;'
        +'flex-direction:column;align-items:center;">'
        +_cdDeckHtml(52-dealtTotal(),dkW,dkH,
          {shuffling:shuffling,label:shuffling?'shuffling\u2026':'dealing\u2026'})
        +'</div>';
    }else if(stock.length>0){
      stEl.className='gc gc-dn';
      _cdBackStyle(stEl);
      stEl.innerHTML='<span style="color:rgba(245,240,225,.95);font-size:clamp(.62rem,2vw,.82rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.95),0 0 10px rgba(0,0,0,.85)">'+stock.length+'</span>';
      stEl.style.cursor='pointer';
      stEl.style.width=klW;stEl.style.height=klH;stEl.style.fontSize=klF;
      // The deal's last beat: the 24 cards still in hand are set down as the
      // stock, so the pile arrives instead of simply being there.
      if(pop)stEl.classList.add('cd-deal-in');
      stEl.onclick=function(){tapStock()};
    }else{
      stEl.className='gc gc-empty';
      if(waste.length>0)stEl.innerHTML='<span style="color:var(--muted);font-size:clamp(.6rem,1.8vw,.8rem)">↺</span>';
      stEl.style.width=klW;stEl.style.height=klH;stEl.style.fontSize=klF;
      stEl.style.cursor='pointer';
      stEl.onclick=function(){tapStock()};
    }
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
    // radius, only the next card's overlap hides the bottom. Match Golf's 28%
    // reveal for face-up cards so the rank+suit is comfortable to read. Face-
    // down cards stay tighter at 14% since there's nothing to read on the back.
    var revealUp = 0.28;
    var revealDn = 0.14;

    for(var c=0;c<7;c++){
      var colDiv=document.createElement('div');
      colDiv.style.cssText='display:flex;flex-direction:column;min-width:'+klW+';align-items:center';
      // Smart-drop for this column — legal if source exists, column isn't the
      // source column, and the run head can be placed here.
      var colLegal = (srcCard && c!==srcColIdx && canPlaceOnTab(srcCard, c));
      // Mid-deal the column is drawn short. The model behind it is already
      // whole — dealt[c] is a curtain, not a build order — so face-up/face-down
      // and every rule that reads tableau[] stay exactly as they were.
      var shown = dealing ? dealt[c] : tableau[c].length;

      if(shown===0){
        var em=document.createElement('div');
        em.className='gc gc-empty';
        if(colLegal)em.classList.add('gc-legal');
        em.style.width=klW;em.style.height=klH;
        em.style.cursor='pointer';
        (function(ci){em.onclick=function(){tapTab(ci,0)}})(c);
        colDiv.appendChild(em);
      }else{
        var depth=shown;
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
          // Exactly one card animates per step. The capstone arrives face up,
          // so it turns (cd-flip); the buried cards just land (cd-deal-in).
          if(dealing&&c===laidCol&&i===laidIdx)cdEl.classList.add(card.up?'cd-flip':'cd-deal-in');
          if(card.up&&!dealing){
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
    if(_ag)_ag.scrollTop=_scrollY;
  }

  window._KLN=function(){init()};
  window._KLDraw=function(v){drawCount=parseInt(v)||1;init()};
  // Exit cleanup: cancel any running auto-complete cascade and drop the
  // resize-renderer hook so it stops retaining this game's state.
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    autoGen++;
    dealing=false;
    if(dealHandle)dealHandle.cancel();
    if(window._cdActiveRn)window._cdActiveRn=null;
  });
  init();
}

window._gameFns.klondike=GKL;
})();
