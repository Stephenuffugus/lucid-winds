// ═══ LUCID WINDS — Golf Solitaire ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;
// Card utilities (loaded by _cards.js)
var _cdMk=window._cdMk,_cdSh=window._cdSh,_cdEl=window._cdEl,_cdArt=window._cdArt;
var _cdRnk=window._cdRnk,_cdSuit=window._cdSuit,_cdIsRed=window._cdIsRed,_cdBackStyle=window._cdBackStyle;
var _SUIT_SYM=window._SUIT_SYM,_SUIT_CLR=window._SUIT_CLR,_RANK_SYM=window._RANK_SYM;
var _SUIT_NAME=window._SUIT_NAME,_CD_BASE=window._CD_BASE,_CD_BACK=window._CD_BACK;

function GGF(a){
  var cols=[],stock=[],waste=[],deck,gameOver=false,score=35;
  var history=[]; // LIFO stack of pre-move snapshots for undo
  ms(a,'Left: <strong id="GFsc">35</strong>');mm(a);
  var gd=document.createElement('div');gd.id='GFgd';a.appendChild(gd);
  var _gfStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb" id="GFundoBtn" onclick="_GFUndo()" disabled style="opacity:0.45;">↶ Undo</button> <button class="gb" onclick="_GFN()">🔄 New</button> <button class="gb" id="GFstyle" onclick="_GFToggleStyle()" style="font-size:0.7rem;">'+_gfStyleLbl+'</button>';
  function snapshot(){
    history.push(JSON.stringify({cols:cols, stock:stock, waste:waste, score:score}));
    refreshUndoBtn();
  }
  function refreshUndoBtn(){
    var b=document.getElementById('GFundoBtn');
    if(!b)return;
    if(history.length>0&&!gameOver){b.disabled=false;b.style.opacity='1';}
    else{b.disabled=true;b.style.opacity='0.45';}
  }
  window._GFUndo=function(){
    if(history.length===0||gameOver)return;
    var snap=JSON.parse(history.pop());
    cols=snap.cols; stock=snap.stock; waste=snap.waste; score=snap.score;
    _play('tap');
    rn();refreshUndoBtn();
    var el=document.getElementById('GFsc');if(el)el.textContent=countLeft();
  };
  window._GFToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading — try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('GFstyle');
    if(b)b.textContent='🃏 Style';
    rn();
  };

  window._cdActiveRn=function(){try{rn()}catch(e){}};
  function init(){
    deck=_cdSh(_cdMk());
    cols=[];stock=[];waste=[];gameOver=false;score=35;
    history=[];
    for(var c=0;c<7;c++){
      cols[c]=[];
      for(var i=0;i<5;i++){
        var card=deck.pop();card.up=true;
        cols[c].push(card);
      }
    }
    var first=deck.pop();first.up=true;
    waste=[first];
    stock=deck.slice();
    for(var si=0;si<stock.length;si++)stock[si].up=false;
    rn();
  }

  function countLeft(){
    var n=0;
    for(var c=0;c<7;c++)n+=cols[c].length;
    return n;
  }

  function canPlay(card){
    if(waste.length===0)return false;
    var top=waste[waste.length-1];
    var diff=Math.abs(card.r-top.r);
    return diff===1;
  }

  function checkEnd(){
    if(countLeft()===0){
      gameOver=true;score=0;
      mm_up('🏆 Cleared!');
      _play('win');_playWin();
      _e('game_win');_sr('golf',{w:true,s:35});
      return;
    }
    if(stock.length>0)return;
    for(var c=0;c<7;c++){
      if(cols[c].length>0&&canPlay(cols[c][cols[c].length-1]))return;
    }
    gameOver=true;
    var left=countLeft();score=left;
    mm_up(left+' left — no moves');
    _e('game_loss');_play('lose');_sr('golf',{w:false,s:35-left});
  }

  function mm_up(txt){
    var el=document.getElementById('_gm');
    if(el)el.textContent=txt;
  }

  function tapCol(ci){
    if(gameOver)return;
    var col=cols[ci];
    if(col.length===0)return;
    var card=col[col.length-1];
    if(!canPlay(card)){sm('Need ±1 rank');return}
    snapshot();
    col.pop();
    waste.push(card);
    _play('tap');
    _e('progress');
    score=countLeft();
    rn();refreshUndoBtn();
    checkEnd();
  }

  function tapStock(){
    if(gameOver)return;
    if(stock.length===0){sm('Stock empty');return}
    snapshot();
    var card=stock.pop();card.up=true;
    waste.push(card);
    _play('tap');
    rn();refreshUndoBtn();
    checkEnd();
  }

  function rn(){
    var _ag=document.getElementById('fg-ag');
    var _scrollY=_ag?_ag.scrollTop:0;
    gd.innerHTML='';
    var sc=document.getElementById('GFsc');
    if(sc)sc.textContent=countLeft();

    // Top row: stock, waste, score. Tableau is 7 columns.
    var fit=window._cdFit?window._cdFit(7,{maxW:72,gap:3,pad:10}):{w:'clamp(52px,13.5vw,72px)',h:'clamp(72px,18.9vw,100px)',font:'clamp(.6rem,1.7vw,.8rem)',gap:'3px',raw:{h:100}};
    var gfW=fit.w,gfH=fit.h,gfF=fit.font;
    var topRow=document.createElement('div');
    topRow.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center;padding:4px 0;width:100%;max-width:100vw;margin:0 auto;align-items:center';

    // Stock
    var stEl=document.createElement('div');
    if(stock.length>0){
      stEl.className='gc gc-dn';
      _cdBackStyle(stEl);
      stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+stock.length+'</span>';
      stEl.style.cursor='pointer';
      stEl.onclick=function(){tapStock()};
    }else{
      stEl.className='gc gc-empty';
      stEl.innerHTML='<span style="color:var(--muted);font-size:clamp(.5rem,1.5vw,.7rem)">empty</span>';
    }
    stEl.style.width=gfW;stEl.style.height=gfH;
    topRow.appendChild(stEl);

    // Waste
    var wEl=document.createElement('div');
    if(waste.length>0){
      var wc=waste[waste.length-1];
      wEl=_cdEl(wc);
      wEl.style.boxShadow='0 0 8px rgba(200,168,78,.3)';
    }else{
      wEl.className='gc gc-empty';
    }
    wEl.style.width=gfW;wEl.style.height=gfH;
    topRow.appendChild(wEl);

    // Spacer
    var sp=document.createElement('div');sp.style.cssText='flex:1';
    topRow.appendChild(sp);

    // Score label
    var lbl=document.createElement('div');
    lbl.style.cssText='color:var(--gold);font-family:DM Mono,monospace;font-size:clamp(.65rem,2vw,.85rem)';
    lbl.textContent=countLeft()+' left';
    topRow.appendChild(lbl);
    gd.appendChild(topRow);

    // Tableau — 7 columns of 5 cards each, peek-stacked so the bottom row stays visible.
    var tabRow=document.createElement('div');
    tabRow.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center;padding:4px 0;width:100%;max-width:100vw;margin:0 auto';

    for(var c=0;c<7;c++){
      var colDiv=document.createElement('div');
      colDiv.className='gc-stk';colDiv.style.minWidth=gfW;

      if(cols[c].length===0){
        var em=document.createElement('div');
        em.className='gc gc-empty';em.style.width=gfW;em.style.height=gfH;
        colDiv.appendChild(em);
      }else{
        var depth=cols[c].length;
        // Reveal ~28% of each card so rank+suit on the peek strip stays readable
        // even at smaller card sizes. 5 cards per column + 28% reveal fits a
        // landscape phone comfortably.
        var peekOverlap=Math.round(fit.raw.h * 0.72);
        for(var i=0;i<depth;i++){
          var cd=_cdEl(cols[c][i]);
          cd.style.width=gfW;cd.style.height=gfH;cd.style.fontSize=gfF;
          if(i>0)cd.style.marginTop=(-peekOverlap)+'px';
          if(i<depth-1)cd.classList.add('gc-peek');
          if(i===depth-1){
            cd.style.cursor='pointer';
            (function(ci){cd.onclick=function(){tapCol(ci)}})(c);
          }
          colDiv.appendChild(cd);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
    if(_ag)_ag.scrollTop=_scrollY;
  }

  window._GFN=function(){init()};
  init();
}

window._gameFns.golf=GGF;
})();
