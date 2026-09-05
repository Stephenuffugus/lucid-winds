// ═══ LUCID WINDS — FreeCell ═══
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

function GFC(a){
  var tab=[],free=[null,null,null,null],fnd=[[],[],[],[]],sel=null,gameOver=false,moves=0;
  var history=[]; // LIFO stack of pre-move snapshots for undo
  var lastTap=0, lastTapKey=null; // double-tap detection for auto-route
  // ── THE DEAL (2026-08-21) ────────────────────────────────────
  // FreeCell went from "New Game" to a finished 52-card tableau in one frame.
  // Same cards, same columns, but nothing ever LOOKED dealt: the board arrived
  // as a puzzle diagram instead of as a hand somebody had just laid out.
  //
  // The choreography is a ROW AT A TIME across all eight columns, seven rows
  // (rows 1-6 reach every column, row 7 only reaches columns 1-4, which is
  // where the 7/7/7/7/6/6/6/6 split comes from). Klondike deals card by card
  // because its staircase IS the picture; here nothing is face down and every
  // column lands the same height, so the thing worth watching is the eight
  // columns growing level with one another. Card-at-a-time would be 52 full
  // rebuilds of gd.innerHTML to show the same even growth, and on a phone that
  // buys nothing but jitter.
  //
  // ⛔ NOTHING FLIES ACROSS THE TABLE. rn() rebuilds gd.innerHTML wholesale on
  // every step, which would kill an in-flight CSS transition mid-air. We stage
  // the state, re-render, and let CSS pop in the newest row — that reads as
  // dealing and it survives a full repaint.
  //
  // Budget: 850ms shuffle + 7 rows × 250ms = 2600ms, inside the 2-3.5s window.
  var dealtRows=0;  // rows laid so far; the model underneath is already whole
  var dealing=false,shuffling=false,dealHandle=null;
  function dealtTotal(){var n=0;for(var d=0;d<8;d++)n+=Math.min(dealtRows,tab[d].length);return n;}
  ms(a,'Moves: <strong id="FCmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='FCgd';a.appendChild(gd);
  var _fcStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb" id="FCundoBtn" onclick="_FCUndo()" disabled style="opacity:0.45;">↶ Undo</button> <button class="gb" onclick="_FCN()">↻ New Game</button> <button class="gb" id="FCstyle" onclick="_FCToggleStyle()" style="font-size:0.7rem;">'+_fcStyleLbl+'</button>';
  function snapshot(){
    history.push(JSON.stringify({tab:tab, free:free, fnd:fnd, moves:moves}));
    refreshUndoBtn();
  }
  function refreshUndoBtn(){
    var b=document.getElementById('FCundoBtn');
    if(!b)return;
    if(history.length>0&&!gameOver){b.disabled=false;b.style.opacity='1';}
    else{b.disabled=true;b.style.opacity='0.45';}
  }
  window._FCUndo=function(){
    if(dealing||history.length===0||gameOver)return;
    var snap=JSON.parse(history.pop());
    tab=snap.tab; free=snap.free; fnd=snap.fnd; moves=snap.moves;
    sel=null;
    _play('tap');
    upd();rn();refreshUndoBtn();
  };
  window._FCToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading, try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('FCstyle');
    if(b)b.textContent='🃏 Style';
    rn();
  };

  window._cdActiveRn=function(){try{rn()}catch(e){}};
  function init(){
    var deck=_cdSh(_cdMk());
    tab=[];free=[null,null,null,null];fnd=[[],[],[],[]];sel=null;gameOver=false;moves=0;
    history=[];
    for(var c=0;c<8;c++){tab[c]=[];var cnt=c<4?7:6;for(var i=0;i<cnt;i++){var cd=deck.pop();cd.up=true;tab[c].push(cd);}}
    upd();startDeal();
  }
  // The model above is already finished and correct. startDeal only decides how
  // much of it rn() is allowed to draw, so the cards never move behind the
  // player's back and the rules never see a half-built tableau.
  function startDeal(){
    // ⛔ CANCEL FIRST. New Game re-enters init() whenever the player likes, and
    // a deal still in flight would keep firing timers into a tableau that has
    // been replaced underneath it.
    if(dealHandle)dealHandle.cancel();
    dealtRows=0;dealing=true;shuffling=true;
    rn();
    var rows=[];for(var r=0;r<7;r++)rows.push(r);
    dealHandle=_cdDeal({
      steps:rows, shuffleMs:850, stepMs:250,
      alive:function(){return dealing;},
      onShuffle:function(){shuffling=true;},
      onShuffleEnd:function(){shuffling=false;rn();},
      onStep:function(row){dealtRows=row+1;rn();},
      onDone:function(){dealing=false;rn();refreshUndoBtn();}
    });
  }
  function upd(){var el=document.getElementById('FCmv');if(el)el.textContent=moves;}
  function mm_up(t){var el=document.getElementById('_gm');if(el)el.textContent=t;}
  function _fcWin(){
    gameOver=true;mm_up('\ud83c\udfc6 You win!');_play('win');_playWin();_e('game_win');_sr('freecell',{w:true,s:moves,lo:1});
    var w=(parseInt(localStorage.getItem('lw_freecell_w'),10)||0)+1;
    try{localStorage.setItem('lw_freecell_w',String(w));}catch(e){}
    if(window._lwGameEnd)window._lwGameEnd({won:true,title:'Garden cleared!',line:moves+' moves \u00b7 '+w+' lifetime wins',retry:function(){if(window._FCN)window._FCN();},retryLabel:'\u21bb NEW DEAL',viewLabel:'view the table',delay:900});
  }
  function checkWin(){for(var f=0;f<4;f++)if(fnd[f].length<13)return false;return true;}
  function emptyFree(){var n=0;for(var i=0;i<4;i++)if(!free[i])n++;return n;}
  function emptyCols(){var n=0;for(var c=0;c<8;c++)if(tab[c].length===0)n++;return n;}
  // Supermove capacity. Standard rule: when moving TO an empty column, that
  // column can't count toward the 2^empties multiplier.
  function maxMove(toEmpty){
    var ec=emptyCols();
    if(toEmpty)ec=Math.max(0,ec-1);
    return (1+emptyFree())*Math.pow(2,ec);
  }
  // A movable stack must be a legal run: descending ranks, alternating colors.
  function isRun(cards){
    for(var i=1;i<cards.length;i++){
      if(_cdIsRed(cards[i].s)===_cdIsRed(cards[i-1].s)||cards[i].r!==cards[i-1].r-1)return false;
    }
    return true;
  }
  function canFnd(card,fi){
    var pile=fnd[fi];
    // Empty foundation slot is suit-locked by its art — only that suit's Ace seeds it.
    if(pile.length===0)return card.r===0&&card.s===fi;
    return pile[pile.length-1].s===card.s&&card.r===pile[pile.length-1].r+1;
  }
  function canTab(card,ci){
    var col=tab[ci];if(col.length===0)return true;
    var top=col[col.length-1];
    return _cdIsRed(top.s)!==_cdIsRed(card.s)&&card.r===top.r-1;
  }
  // Auto-route a single card from the given source. Tries foundation first,
  // then any empty free cell, then first legal tableau column. Returns true
  // on success. Used by double-tap shortcut.
  function autoRoute(src){
    var card=null;
    if(src.type==='free')card=free[src.idx];
    else if(src.type==='tab'){
      var col=tab[src.idx];
      if(col.length===0||src.cardIdx!==col.length-1)return false; // only top card
      card=col[col.length-1];
    }
    if(!card)return false;
    // Foundation
    for(var f=0;f<4;f++){
      if(canFnd(card,f)){
        snapshot();
        if(src.type==='free')free[src.idx]=null;
        else tab[src.idx].pop();
        fnd[f].push(card);moves++;_e('progress');
        if(checkWin()){_fcWin();}
        sel=null;upd();rn();refreshUndoBtn();return true;
      }
    }
    // Legal tableau column
    for(var c=0;c<8;c++){
      if(src.type==='tab'&&src.idx===c)continue;
      if(canTab(card,c)){
        snapshot();
        if(src.type==='free')free[src.idx]=null;
        else tab[src.idx].pop();
        tab[c].push(card);moves++;
        sel=null;upd();rn();refreshUndoBtn();return true;
      }
    }
    // Empty free cell (only from tableau — free→free is pointless)
    if(src.type==='tab'){
      for(var fi=0;fi<4;fi++){
        if(!free[fi]){
          snapshot();
          tab[src.idx].pop();
          free[fi]=card;moves++;
          sel=null;upd();rn();refreshUndoBtn();return true;
        }
      }
    }
    return false;
  }
  function doSelect(type,idx,cardIdx){
    if(gameOver||dealing)return;
    // Double-tap detection — tapping the same card twice within 400ms triggers auto-route.
    var key=type+':'+idx+':'+(cardIdx===undefined?'':cardIdx);
    var now=Date.now();
    var isDoubleTap = (lastTapKey===key && now-lastTap<400);
    if(isDoubleTap){
      lastTap=0; lastTapKey=null;
      // Only auto-route single top cards.
      if(type==='free'&&free[idx]){if(autoRoute({type:'free',idx:idx}))return;}
      else if(type==='tab'&&tab[idx].length>0){
        var ci=(cardIdx===undefined)?tab[idx].length-1:cardIdx;
        if(ci===tab[idx].length-1&&tab[idx][ci].up){if(autoRoute({type:'tab',idx:idx,cardIdx:ci}))return;}
      }
      // Double-tap didn't route — fall through to normal tap handling.
    }
    lastTap=now; lastTapKey=key;
    if(sel){
      // Try to place
      if(type==='fnd'){
        // Place on foundation
        var cards=getSel();
        if(cards.length===1&&canFnd(cards[0],idx)){
          snapshot();
          removeSel();fnd[idx].push(cards[0]);moves++;_e('progress');
          if(checkWin()){_fcWin();}
          sel=null;upd();rn();refreshUndoBtn();return;
        }
        sel=null;rn();return;
      }
      if(type==='free'){
        var cards=getSel();
        if(cards.length===1&&!free[idx]){
          snapshot();
          removeSel();free[idx]=cards[0];moves++;sel=null;upd();rn();refreshUndoBtn();return;
        }
        if(free[idx]&&sel.type==='free'&&sel.idx===idx){sel=null;rn();return;}
        sel=null;rn();return;
      }
      if(type==='tab'){
        var cards=getSel();
        if(cards.length<=maxMove(tab[idx].length===0)&&isRun(cards)&&canTab(cards[0],idx)){
          snapshot();
          removeSel();for(var i=0;i<cards.length;i++)tab[idx].push(cards[i]);moves++;
          sel=null;upd();rn();refreshUndoBtn();return;
        }
        // Maybe selecting new source
        if(tab[idx].length>0&&tab[idx][cardIdx]&&tab[idx][cardIdx].up){
          if(!isRun(tab[idx].slice(cardIdx))){sm('Not a movable run');sel=null;rn();return;}
          sel={type:'tab',idx:idx,cardIdx:cardIdx};rn();return;
        }
        sel=null;rn();return;
      }
    }else{
      // Select
      if(type==='free'&&free[idx]){sel={type:'free',idx:idx};rn();return;}
      if(type==='tab'&&tab[idx].length>0){
        if(cardIdx===undefined)cardIdx=tab[idx].length-1;
        if(!tab[idx][cardIdx].up)return;
        if(!isRun(tab[idx].slice(cardIdx))){sm('Not a movable run');return;}
        sel={type:'tab',idx:idx,cardIdx:cardIdx};rn();return;
      }
    }
  }
  function getSel(){
    if(!sel)return [];
    if(sel.type==='free')return free[sel.idx]?[free[sel.idx]]:[];
    if(sel.type==='tab')return tab[sel.idx].slice(sel.cardIdx);
    return [];
  }
  function removeSel(){
    if(!sel)return;
    if(sel.type==='free')free[sel.idx]=null;
    if(sel.type==='tab')tab[sel.idx].splice(sel.cardIdx);
  }
  function rn(){
    var _ag=document.getElementById('fg-ag');
    var _scrollY=_ag?_ag.scrollTop:0;
    gd.innerHTML='';
    // Smart-drop: compute the selected run's head.
    var srcHead=null, srcIsSingle=true, srcFreeIdx=-1, srcTabIdx=-1;
    if(sel){
      var srcCards=getSel();
      if(srcCards.length>0){
        srcHead=srcCards[0];
        srcIsSingle=(srcCards.length===1);
      }
      if(sel.type==='free')srcFreeIdx=sel.idx;
      if(sel.type==='tab')srcTabIdx=sel.idx;
    }
    var topRow=document.createElement('div');
    // Top row has 8 wide slots (4 free + spacer + 4 fnd). Tableau has 8
    // columns. Both fit on the same 8-col budget.
    var fit=window._cdFit?window._cdFit(8,{maxW:90,gap:3,pad:10}):{w:'clamp(48px,13vw,84px)',h:'clamp(67px,18.2vw,117px)',font:'clamp(.6rem,1.75vw,.85rem)',gap:'3px',raw:{h:117,peek:20}};
    var fcW=fit.w,fcH=fit.h,fcF=fit.font;
    topRow.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center;padding:4px 0;width:100%;max-width:100vw;margin:0 auto;align-items:flex-start';
    // Free cells — legal target only if source is a single card and the cell is empty
    for(var i=0;i<4;i++){
      var el;
      if(free[i]){el=_cdEl(free[i]);if(sel&&sel.type==='free'&&sel.idx===i)el.className+=' gc-sel';}
      else{
        // Empty free cells were near-invisible on the dark felt — a new
        // player couldn't see the game's namesake mechanic. Brighter dash +
        // a FREE label.
        el=document.createElement('div');el.className='gc gc-empty';
        el.style.border='1px solid rgba(122,179,86,0.35)';el.style.boxShadow='inset 0 0 14px rgba(0,0,0,.5)';
        el.innerHTML='<span style="display:flex;align-items:center;justify-content:center;height:100%;font-family:DM Mono,monospace;font-size:0.72rem;letter-spacing:0.12em;color:rgba(122,179,86,0.85);pointer-events:none">FREE</span>';
      }
      el.style.width=fcW;el.style.height=fcH;el.style.fontSize=fcF;
      if(srcHead&&srcIsSingle&&!free[i]&&i!==srcFreeIdx)el.classList.add('gc-legal');
      (function(ii){el.onclick=function(){doSelect('free',ii)}})(i);
      if(!dealing)el.style.cursor='pointer';
      topRow.appendChild(el);
    }
    // THE DECK. FreeCell has no stock pile, so while the cards go out the deck
    // sits in the gap between the free cells and the foundations — the one spot
    // on a board whose eight columns are all spoken for from frame one. It is
    // the only thing on the table that moves during the deal: it wiggles, it
    // counts 52 down to 0 and it captions itself.
    //
    // ⛔ OUT OF FLOW, the way Klondike parks its deal deck. That caption is a
    // real block element, and in normal flow it would grow the top row for the
    // length of the deal and collapse it again on the exact frame the last row
    // lands — a whole-table jolt on the frame the player is watching.
    var sp=document.createElement('div');sp.style.cssText='width:clamp(4px,1.5vw,10px);position:relative;align-self:stretch';
    if(dealing){
      var dkH=Math.max(30,fit.raw.h-28),dkW=Math.max(22,Math.round(dkH/1.4247));
      sp.innerHTML='<div style="position:absolute;left:50%;top:0;transform:translateX(-50%);z-index:5;pointer-events:none">'
        +_cdDeckHtml(52-dealtTotal(),dkW,dkH,{shuffling:shuffling,label:shuffling?'shuffling\u2026':'dealing\u2026'})
        +'</div>';
    }
    topRow.appendChild(sp);
    // Foundations — legal only for single cards that can stack on the pile.
    for(var f=0;f<4;f++){
      var el;
      if(fnd[f].length>0){el=_cdEl(fnd[f][fnd[f].length-1]);}
      else{el=document.createElement('div');el.className='gc gc-fnd';if(window._cdFndEmpty)window._cdFndEmpty(el,f);else el.style.backgroundImage="url('"+_CD_BASE+_SUIT_NAME[f]+".png')";}
      el.style.width=fcW;el.style.height=fcH;el.style.fontSize=fcF;
      if(srcHead&&srcIsSingle&&canFnd(srcHead,f))el.classList.add('gc-legal');
      (function(fi){el.onclick=function(){doSelect('fnd',fi)}})(f);
      if(!dealing)el.style.cursor='pointer';
      topRow.appendChild(el);
    }
    gd.appendChild(topRow);
    // Tableau
    var tabRow=document.createElement('div');
    tabRow.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center;padding:4px 0;width:100%;max-width:100vw;margin:0 auto';
    for(var c=0;c<8;c++){
      var colDiv=document.createElement('div');colDiv.className='gc-stk';colDiv.style.minWidth=fcW;
      // Tableau legal: run fits within maxMove() and the top card accepts our head.
      var colLegal=false;
      if(srcHead && c!==srcTabIdx){
        var runLen = srcIsSingle?1:(tab[srcTabIdx]?tab[srcTabIdx].length-sel.cardIdx:1);
        if(runLen<=maxMove(tab[c].length===0) && canTab(srcHead,c))colLegal=true;
      }
      // Mid-deal the column is drawn short. The model behind it is already
      // whole — dealtRows is a curtain, not a build order — so every rule that
      // reads tab[] (runs, maxMove, the win check) stays exactly as it was.
      var shown=dealing?Math.min(dealtRows,tab[c].length):tab[c].length;
      if(shown===0){
        var em=document.createElement('div');em.className='gc gc-empty';em.style.width=fcW;em.style.height=fcH;
        if(colLegal)em.classList.add('gc-legal');
        (function(ci){em.onclick=function(){doSelect('tab',ci)}})(c);
        colDiv.appendChild(em);
      }else{
        // Peek math: match Klondike/Spider/Golf at 28% reveal so suits on
        // stacked cards stay readable. Compression kicks in past 8 cards.
        var depth=shown;
        var depthMult=depth>14?0.5:depth>11?0.65:depth>8?0.8:1.0;
        var peekOverlap=Math.round(fit.raw.h * (1 - 0.28*depthMult));
        for(var i=0;i<depth;i++){
          var cd=_cdEl(tab[c][i]);
          cd.style.width=fcW;cd.style.height=fcH;cd.style.fontSize=fcF;
          if(i>0)cd.style.marginTop=(-peekOverlap)+'px';
          if(i<depth-1)cd.classList.add('gc-peek');
          if(sel&&sel.type==='tab'&&sel.idx===c&&i>=sel.cardIdx)cd.className+=' gc-sel';
          if(colLegal&&i===depth-1)cd.classList.add('gc-legal');
          // Only the row that just landed animates. Everything above it is
          // already on the table and must not re-pop on the next rebuild.
          if(dealing&&i===dealtRows-1)cd.classList.add('cd-deal-in');
          (function(ci,ii){cd.onclick=function(){doSelect('tab',ci,ii)}})(c,i);
          if(!dealing)cd.style.cursor='pointer';
          colDiv.appendChild(cd);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
    if(_ag)_ag.scrollTop=_scrollY;
  }
  window._FCN=function(){init()};
  // Leaving mid-deal must stop the scheduler; otherwise its timers keep
  // rendering into a gd that belongs to whatever the player opened next.
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    dealing=false;
    if(dealHandle)dealHandle.cancel();
    if(window._cdActiveRn)window._cdActiveRn=null;
  });
  init();
}

window._gameFns.freecell=GFC;
})();
