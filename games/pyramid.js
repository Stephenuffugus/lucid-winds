// ═══ LUCID WINDS — Pyramid Solitaire ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;
// Card utilities (loaded by _cards.js)
var _cdMk=window._cdMk,_cdSh=window._cdSh,_cdEl=window._cdEl,_cdArt=window._cdArt;
var _cdRnk=window._cdRnk,_cdSuit=window._cdSuit,_cdIsRed=window._cdIsRed,_cdBackStyle=window._cdBackStyle;
var _SUIT_SYM=window._SUIT_SYM,_SUIT_CLR=window._SUIT_CLR,_RANK_SYM=window._RANK_SYM;
var _SUIT_NAME=window._SUIT_NAME,_CD_BASE=window._CD_BASE,_CD_BACK=window._CD_BACK;
// Tangibility kit (also games/_cards.js) — the shared deck art + deal scheduler
var _cdDeckHtml=window._cdDeckHtml,_cdDeal=window._cdDeal;

function GPY(a){
  var pyr=[],stock=[],waste=[],sel=null,gameOver=false,moves=0,removed={};
  var history=[]; // LIFO stack of pre-move snapshots for undo
  // ── THE DEAL (2026-08-21) ─────────────────────────────────────────────────
  // Pyramid used to arrive whole: 28 cards already stacked into a triangle and
  // a stock already sitting under it, in a single frame. The SHAPE is the whole
  // identity of this game and the player never got to watch it get built.
  //
  // ⛔ A ROW AT A TIME, APEX DOWN — NOT A CARD AT A TIME. 28 card-by-card beats
  // at a readable pace blows well past four seconds, and rn() rebuilds the
  // board's innerHTML on every one of them. Seven rows is the thing the eye
  // actually reads (the triangle widening under it) for seven repaints instead
  // of twenty-eight. An eighth beat drops the leftover 24 into the stock, so
  // the deck the cards came out of visibly becomes the pile the player draws
  // from. 850ms shuffle + 8 steps x 300ms = 3250ms.
  //
  // ⛔ THE MODEL IS DEALT INSTANTLY. init() builds the finished pyramid and
  // stock exactly the way it always did; `dealt` only limits how much of it rn()
  // is allowed to draw. isExposed / checkLoss / undo never see a half-built
  // pyramid, so none of the game logic had to learn about dealing.
  var dealt=0,shuffling=false,dealHandle=null,dealing=false;
  function dealtRows(){return dealing?Math.min(dealt,7):7;}
  // Step 8 is the stock landing; before that the remainder is still "in hand".
  function stockDealt(){return !dealing||dealt>=8;}
  function isNewRow(r){return dealing&&r===dealt-1;}
  ms(a,'Cleared: <strong id="PYcl">0</strong>/28 · Moves: <strong id="PYmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='PYgd';a.appendChild(gd);
  var _pyStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb" id="PYundoBtn" onclick="_PYUndo()" disabled style="opacity:0.45;">↶ Undo</button> <button class="gb" onclick="_PYN()">↻ New Game</button> <button class="gb" id="PYstyle" onclick="_PYToggleStyle()" style="font-size:0.7rem;">'+_pyStyleLbl+'</button>';
  function snapshot(){
    history.push(JSON.stringify({stock:stock, waste:waste, moves:moves, removed:removed}));
    refreshUndoBtn();
  }
  function refreshUndoBtn(){
    var b=document.getElementById('PYundoBtn');
    if(!b)return;
    if(history.length>0&&!gameOver){b.disabled=false;b.style.opacity='1';}
    else{b.disabled=true;b.style.opacity='0.45';}
  }
  window._PYUndo=function(){
    // ⛔ every input path is gated on the deal being finished — see init()
    if(dealing||history.length===0||gameOver)return;
    var snap=JSON.parse(history.pop());
    stock=snap.stock; waste=snap.waste; moves=snap.moves; removed=snap.removed;
    sel=null;
    _play('tap');
    upd();rn();refreshUndoBtn();
  };
  window._PYToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading, try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('PYstyle');
    if(b)b.textContent='🃏 Style';
    rn();
  };

  window._cdActiveRn=function(){try{rn()}catch(e){}};
  function init(){
    var deck=_cdSh(_cdMk());
    pyr=[];stock=[];waste=[];sel=null;gameOver=false;moves=0;removed={};
    history=[];
    for(var i=0;i<28;i++){var cd=deck.pop();cd.up=true;pyr.push(cd);}
    stock=deck.slice();for(var i=0;i<stock.length;i++)stock[i].up=false;
    // ⛔ CANCEL FIRST. New Game is one tap away at every moment, including the
    // middle of a deal, and a deal still in flight would keep firing rn() into
    // a board that has been rebuilt underneath it.
    if(dealHandle)dealHandle.cancel();
    dealt=0;shuffling=true;dealing=true;
    upd();rn();refreshUndoBtn();
    // steps 0-6 = pyramid rows apex to base, step 7 = the stock pile
    var steps=[0,1,2,3,4,5,6,7];
    dealHandle=_cdDeal({
      steps:steps, shuffleMs:850, stepMs:300,
      alive:function(){return dealing;},
      onShuffle:function(){shuffling=true;},
      onShuffleEnd:function(){shuffling=false;rn();},
      onStep:function(step,i){dealt=i+1;rn();},
      onDone:function(){dealing=false;dealt=8;upd();rn();refreshUndoBtn();}
    });
  }
  function upd(){
    var cl=0;for(var k in removed)cl++;
    var e1=document.getElementById('PYcl');if(e1)e1.textContent=cl;
    var e2=document.getElementById('PYmv');if(e2)e2.textContent=moves;
  }
  function mm_up(t){var el=document.getElementById('_gm');if(el)el.textContent=t;}
  // Pyramid indexing: row r starts at index r*(r+1)/2, has r+1 cards
  function pyrRow(idx){var r=0;while((r+1)*(r+2)/2<=idx)r++;return r;}
  function pyrCol(idx){var r=pyrRow(idx);return idx-r*(r+1)/2;}
  function isExposed(idx){
    if(removed[idx])return false;
    var r=pyrRow(idx),c=pyrCol(idx);
    if(r===6)return true;
    var leftChild=((r+1)*(r+2)/2)+c;
    var rightChild=leftChild+1;
    return !!removed[leftChild]&&!!removed[rightChild];
  }
  function cardVal(card){return card.r+1;} // A=1..K=13
  function canPair(c1,c2){return cardVal(c1)+cardVal(c2)===13;}
  function isKing(card){return card.r===12;}
  function removePyr(idx){removed[idx]=true;}
  function checkWin(){var cl=0;for(var k in removed)cl++;return cl>=28;}
  function checkLoss(){
    if(stock.length>0)return false;
    // Check waste top against exposed pyramid
    var wTop=waste.length>0?waste[waste.length-1]:null;
    // A King on the waste is removable alone — that's a legal move (this
    // used to declare a premature loss and lock the game).
    if(wTop&&isKing(wTop))return false;
    for(var i=0;i<28;i++){
      if(removed[i])continue;
      if(!isExposed(i))continue;
      if(isKing(pyr[i]))return false;
      if(wTop&&canPair(pyr[i],wTop))return false;
      // Check against other exposed
      for(var j=i+1;j<28;j++){
        if(removed[j]||!isExposed(j))continue;
        if(canPair(pyr[i],pyr[j]))return false;
      }
    }
    return true;
  }
  // Single loss check used after every removal/draw — King removals and
  // waste pairs used to skip it entirely, silently dead-ending the game.
  function maybeLoss(){
    if(!gameOver&&checkLoss()){gameOver=true;mm_up('No moves left');_e('game_loss');_play('lose');_sr('pyramid',{w:false,s:moves});rn();if(window._lwCardEnd)_lwCardEnd({key:'pyramid',won:false,title:'NO MOVES LEFT',line:'the pyramid held this time',retry:window._PYN});}
  }
  function tapPyr(idx){
    if(dealing||gameOver||removed[idx]||!isExposed(idx))return;
    var card=pyr[idx];
    if(isKing(card)){snapshot();removePyr(idx);moves++;_play('tap');_e('progress');
      if(checkWin()){gameOver=true;mm_up('🏆 Cleared!');_play('win');_playWin();_e('game_win');_sr('pyramid',{w:true,s:moves,lo:1});if(window._lwCardEnd)_lwCardEnd({key:'pyramid',won:true,title:'PYRAMID CLEARED',line:moves+' moves',retry:window._PYN});}
      sel=null;upd();rn();refreshUndoBtn();maybeLoss();return;
    }
    if(sel){
      if(sel.type==='pyr'&&sel.idx===idx){sel=null;rn();return;}
      var other=sel.type==='pyr'?pyr[sel.idx]:waste[waste.length-1];
      if(canPair(card,other)){
        snapshot();
        removePyr(idx);
        if(sel.type==='pyr')removePyr(sel.idx);else waste.pop();
        moves++;_play('tap');_e('progress');
        if(checkWin()){gameOver=true;mm_up('🏆 Cleared!');_play('win');_playWin();_e('game_win');_sr('pyramid',{w:true,s:moves,lo:1});if(window._lwCardEnd)_lwCardEnd({key:'pyramid',won:true,title:'PYRAMID CLEARED',line:moves+' moves',retry:window._PYN});}
        sel=null;upd();rn();refreshUndoBtn();
        maybeLoss();
        return;
      }
      sel={type:'pyr',idx:idx};rn();return;
    }
    sel={type:'pyr',idx:idx};rn();
  }
  function tapWaste(){
    if(dealing||gameOver||waste.length===0)return;
    var card=waste[waste.length-1];
    if(isKing(card)){snapshot();waste.pop();moves++;_play('tap');_e('progress');sel=null;upd();rn();refreshUndoBtn();maybeLoss();return;}
    if(sel&&sel.type==='pyr'){
      if(canPair(pyr[sel.idx],card)){
        snapshot();
        removePyr(sel.idx);waste.pop();moves++;_play('tap');_e('progress');
        if(checkWin()){gameOver=true;mm_up('🏆 Cleared!');_play('win');_playWin();_e('game_win');_sr('pyramid',{w:true,s:moves,lo:1});if(window._lwCardEnd)_lwCardEnd({key:'pyramid',won:true,title:'PYRAMID CLEARED',line:moves+' moves',retry:window._PYN});}
        sel=null;upd();rn();refreshUndoBtn();maybeLoss();return;
      }
    }
    sel={type:'waste'};rn();
  }
  function tapStock(){
    if(dealing||gameOver||stock.length===0)return;
    snapshot();
    var cd=stock.pop();cd.up=true;waste.push(cd);_play('tap');sel=null;rn();refreshUndoBtn();
    maybeLoss();
  }
  function rn(){
    var _ag=document.getElementById('fg-ag');
    var _scrollY=_ag?_ag.scrollTop:0;
    gd.innerHTML='';
    // Smart-drop source: any exposed card that pairs (sum to 13) with selected.
    var srcCard=null;
    if(sel){
      if(sel.type==='pyr'&&!removed[sel.idx])srcCard=pyr[sel.idx];
      else if(sel.type==='waste'&&waste.length>0)srcCard=waste[waste.length-1];
    }
    // 7-wide base row drives sizing. The row-overlap shows ~60% of each card top.
    var fit=window._cdFit?window._cdFit(7,{maxW:84,gap:3,pad:10}):{w:'clamp(48px,13vw,84px)',h:'clamp(67px,18.2vw,117px)',font:'clamp(.65rem,1.8vw,.9rem)',gap:'3px',raw:{h:117}};
    var pyW=fit.w,pyH=fit.h,pyF=fit.font;
    var rowOverlap = Math.round(fit.raw.h * 0.42); // negative margin between rows
    // Pyramid
    var pyrDiv=document.createElement('div');
    pyrDiv.style.cssText='display:flex;flex-direction:column;align-items:center;padding:4px 0';
    var idx=0;
    var rowsOut=dealtRows();
    for(var r=0;r<7;r++){
      var rowDiv=document.createElement('div');
      rowDiv.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center';
      if(r>0)rowDiv.style.marginTop=(-rowOverlap)+'px';
      var fresh=isNewRow(r);
      for(var c=0;c<=r;c++){
        var pi=idx;
        // ⛔ AN UNDEALT ROW STILL TAKES UP ITS FULL GEOMETRY. Skipping the row
        // outright would let the triangle grow downward and shove the stock and
        // waste further down the screen seven times during one deal. With the
        // spacers the pyramid fills into a frame that never moves — which is
        // also why the same empty div already stands in for a removed card.
        if(r>=rowsOut||removed[pi]){
          var em=document.createElement('div');em.style.cssText='width:'+pyW+';height:'+pyH;
          rowDiv.appendChild(em);
        }else{
          var cd=_cdEl(pyr[pi]);
          cd.style.width=pyW;cd.style.height=pyH;cd.style.fontSize=pyF;
          // Only the row that just landed pops in; everything above it is
          // already on the table and must not re-animate on the next repaint.
          if(fresh)cd.className+=' cd-deal-in';
          if(!isExposed(pi))cd.style.opacity='.5';
          else cd.style.cursor='pointer';
          if(sel&&sel.type==='pyr'&&sel.idx===pi)cd.className+=' gc-sel';
          // Smart-drop: this exposed card pairs with the selection → glow green.
          // Kings glow whenever they're exposed (they remove alone).
          if(isExposed(pi)){
            if(srcCard&&!(sel&&sel.type==='pyr'&&sel.idx===pi)&&canPair(srcCard,pyr[pi]))cd.classList.add('gc-legal');
            else if(!srcCard&&isKing(pyr[pi]))cd.classList.add('gc-legal');
          }
          (function(ii){cd.onclick=function(){tapPyr(ii)}})(pi);
          rowDiv.appendChild(cd);
        }
        idx++;
      }
      pyrDiv.appendChild(rowDiv);
    }
    gd.appendChild(pyrDiv);
    // Stock + Waste row
    var botRow=document.createElement('div');
    botRow.style.cssText='display:flex;gap:clamp(4px,1.2vw,6px);justify-content:center;padding:clamp(3px,1vw,6px) 0;align-items:center';
    var stEl=document.createElement('div');
    if(!stockDealt()){
      // ⛔ SHOW THE DECK THE CARDS ARE COMING OUT OF, in the stock's own slot,
      // so the final beat of the deal is the very pile the player then taps.
      // .gc takes its size from a CSS clamp in index.html, so the clamp is
      // mirrored here instead of guessed — pick a different number and the deck
      // visibly resizes at the moment it becomes the stock.
      var _vw=window.innerWidth||360;
      var stkW=Math.round(Math.max(56,Math.min(110,_vw*0.135)));
      var stkH=Math.round(Math.max(78,Math.min(154,_vw*0.19)));
      // ⛔ THE CAPTION STAYS IN FLOW. Pinning this slot to the stock card's
      // height to stop the controls settling ~26px at the end of the deal was
      // tried and reverted: the caption then hangs out of the slot and on a
      // 375x667 phone it prints straight across the New Game button, because
      // there is only about 5px between the deck and the controls there. A
      // one-off 26px settle beats text on top of a button, and it is what
      // Hearts and Spades already do.
      stEl.innerHTML=_cdDeckHtml(52-(rowsOut*(rowsOut+1)/2),stkW,stkH,
        {shuffling:shuffling,label:shuffling?'shuffling\u2026':'dealing\u2026'});
    }
    else if(stock.length>0){stEl.className='gc gc-dn';_cdBackStyle(stEl);stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+stock.length+'</span>';stEl.style.cursor='pointer';stEl.onclick=function(){tapStock()};}
    else{stEl.className='gc gc-empty';}
    botRow.appendChild(stEl);
    var wEl;
    if(waste.length>0){
      wEl=_cdEl(waste[waste.length-1]);
      if(sel&&sel.type==='waste')wEl.className+=' gc-sel';
      // Waste highlights when it pairs with a selected pyr card, or when it's a King itself.
      if(sel&&sel.type==='pyr'&&srcCard&&canPair(srcCard,waste[waste.length-1]))wEl.classList.add('gc-legal');
      else if(!sel&&isKing(waste[waste.length-1]))wEl.classList.add('gc-legal');
      wEl.style.cursor='pointer';wEl.onclick=function(){tapWaste()};
    }
    else{wEl=document.createElement('div');wEl.className='gc gc-empty';}
    botRow.appendChild(wEl);
    gd.appendChild(botRow);
    if(_ag)_ag.scrollTop=_scrollY;
  }
  window._PYN=function(){init()};
  init();
}

window._gameFns.pyramid=GPY;
})();
