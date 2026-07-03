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

function GFC(a){
  var tab=[],free=[null,null,null,null],fnd=[[],[],[],[]],sel=null,gameOver=false,moves=0;
  var history=[]; // LIFO stack of pre-move snapshots for undo
  var lastTap=0, lastTapKey=null; // double-tap detection for auto-route
  ms(a,'Moves: <strong id="FCmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='FCgd';a.appendChild(gd);
  var _fcStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb" id="FCundoBtn" onclick="_FCUndo()" disabled style="opacity:0.45;">↶ Undo</button> <button class="gb-new" onclick="_FCN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button> <button class="gb" id="FCstyle" onclick="_FCToggleStyle()" style="font-size:0.7rem;">'+_fcStyleLbl+'</button>';
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
    if(history.length===0||gameOver)return;
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
    upd();rn();
  }
  function upd(){var el=document.getElementById('FCmv');if(el)el.textContent=moves;}
  function mm_up(t){var el=document.getElementById('_gm');if(el)el.textContent=t;}
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
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('freecell',{w:true,s:moves,lo:1});}
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
    if(gameOver)return;
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
          if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('freecell',{w:true,s:moves,lo:1});}
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
        el.style.border='1.5px dashed rgba(122,179,86,0.55)';
        el.innerHTML='<span style="display:flex;align-items:center;justify-content:center;height:100%;font-family:DM Mono,monospace;font-size:0.48rem;letter-spacing:0.12em;color:rgba(122,179,86,0.6);pointer-events:none">FREE</span>';
      }
      el.style.width=fcW;el.style.height=fcH;el.style.fontSize=fcF;
      if(srcHead&&srcIsSingle&&!free[i]&&i!==srcFreeIdx)el.classList.add('gc-legal');
      (function(ii){el.onclick=function(){doSelect('free',ii)}})(i);
      el.style.cursor='pointer';topRow.appendChild(el);
    }
    var sp=document.createElement('div');sp.style.cssText='width:clamp(4px,1.5vw,10px)';topRow.appendChild(sp);
    // Foundations — legal only for single cards that can stack on the pile.
    for(var f=0;f<4;f++){
      var el;
      if(fnd[f].length>0){el=_cdEl(fnd[f][fnd[f].length-1]);}
      else{el=document.createElement('div');el.className='gc gc-fnd';if(window._cdFndEmpty)window._cdFndEmpty(el,f);else el.style.backgroundImage="url('"+_CD_BASE+_SUIT_NAME[f]+".png')";}
      el.style.width=fcW;el.style.height=fcH;el.style.fontSize=fcF;
      if(srcHead&&srcIsSingle&&canFnd(srcHead,f))el.classList.add('gc-legal');
      (function(fi){el.onclick=function(){doSelect('fnd',fi)}})(f);
      el.style.cursor='pointer';topRow.appendChild(el);
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
      if(tab[c].length===0){
        var em=document.createElement('div');em.className='gc gc-empty';em.style.width=fcW;em.style.height=fcH;
        if(colLegal)em.classList.add('gc-legal');
        (function(ci){em.onclick=function(){doSelect('tab',ci)}})(c);
        colDiv.appendChild(em);
      }else{
        // Peek math: match Klondike/Spider/Golf at 28% reveal so suits on
        // stacked cards stay readable. Compression kicks in past 8 cards.
        var depth=tab[c].length;
        var depthMult=depth>14?0.5:depth>11?0.65:depth>8?0.8:1.0;
        var peekOverlap=Math.round(fit.raw.h * (1 - 0.28*depthMult));
        for(var i=0;i<depth;i++){
          var cd=_cdEl(tab[c][i]);
          cd.style.width=fcW;cd.style.height=fcH;cd.style.fontSize=fcF;
          if(i>0)cd.style.marginTop=(-peekOverlap)+'px';
          if(i<depth-1)cd.classList.add('gc-peek');
          if(sel&&sel.type==='tab'&&sel.idx===c&&i>=sel.cardIdx)cd.className+=' gc-sel';
          if(colLegal&&i===depth-1)cd.classList.add('gc-legal');
          (function(ci,ii){cd.onclick=function(){doSelect('tab',ci,ii)}})(c,i);
          cd.style.cursor='pointer';colDiv.appendChild(cd);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
    if(_ag)_ag.scrollTop=_scrollY;
  }
  window._FCN=function(){init()};
  init();
}

window._gameFns.freecell=GFC;
})();
