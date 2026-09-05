// ═══ LUCID WINDS — Golf Solitaire ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;
// Card utilities (loaded by _cards.js)
var _cdMk=window._cdMk,_cdSh=window._cdSh,_cdEl=window._cdEl,_cdArt=window._cdArt;
var _cdRnk=window._cdRnk,_cdSuit=window._cdSuit,_cdIsRed=window._cdIsRed,_cdBackStyle=window._cdBackStyle;
var _cdDeal=window._cdDeal,_cdDeckHtml=window._cdDeckHtml;
var _SUIT_SYM=window._SUIT_SYM,_SUIT_CLR=window._SUIT_CLR,_RANK_SYM=window._RANK_SYM;
var _SUIT_NAME=window._SUIT_NAME,_CD_BASE=window._CD_BASE,_CD_BACK=window._CD_BACK;

function GGF(a){
  var cols=[],stock=[],waste=[],deck,gameOver=false,score=35;
  var history=[]; // LIFO stack of pre-move snapshots for undo
  // ── THE DEAL (2026-08-21) ─────────────────────────────────────
  // Golf went from "New Game" to a finished thirty-five card course in one
  // frame. Same cards, same layout, but nothing ever LOOKED dealt — the board
  // arrived as a diagram instead of as a hand somebody just laid out for you.
  //
  // ROW BY ROW, NOT CARD BY CARD. Golf's shape is seven columns of five, and
  // what the player actually reads off the table is the peek strip: five ranks
  // stacked per column. A card at a time would be 35 full rebuilds of
  // gd.innerHTML and would draw the eye down one column at a time, against the
  // grain of the layout. Five rows of seven builds the strip in the direction
  // it will be read, in five beats instead of thirty-five.
  //
  // The last beats are the point. The deck squares up into the stock, the
  // dealer holds one beat with a hand on it, and then the top card turns over
  // into the foundation (cd-flip) on the same frame that unlocks input. That
  // flip IS the moment golf becomes playable — there is no legal move anywhere
  // on the table until there is an upcard to play ±1 against — so it gets the
  // pause, and it gets the only flip in the deal.
  //
  // ⛔ NOTHING FLIES ACROSS THE TABLE. rn() rebuilds gd.innerHTML wholesale on
  // every step, which would kill an in-flight CSS transition mid-air. We stage
  // state, re-render, and let CSS pop the newest row — that survives a full
  // repaint.
  //
  // Budget: 850ms shuffle + 7 × 250ms = 2600ms, inside the 2-3.5s window.
  var dealt=0;              // tableau ROWS laid so far (0-5); the model is already complete
  var dealing=false,shuffling=false,dealHandle=null;
  var stockDown=false,upcardDown=false;
  var rowPop=false,stockPop=false,flipUp=false;  // one-shot animation flags, consumed by rn()
  // 'beat' lays nothing. It is the dealer's pause before the turn, spent as a
  // step rather than a longer stepMs so the budget above stays one number.
  var DEAL_STEPS=['row','row','row','row','row','stock','beat'];
  ms(a,'Left: <strong id="GFsc">35</strong>');mm(a);
  var gd=document.createElement('div');gd.id='GFgd';a.appendChild(gd);
  var _gfStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb" id="GFundoBtn" onclick="_GFUndo()" disabled style="opacity:0.65;">↶ Undo</button> <button class="gb" onclick="_GFN()">↻ New Game</button> <button class="gb" id="GFstyle" onclick="_GFToggleStyle()" style="font-size:0.78rem;">'+_gfStyleLbl+'</button>';
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
    if(dealing||history.length===0||gameOver)return;
    var snap=JSON.parse(history.pop());
    cols=snap.cols; stock=snap.stock; waste=snap.waste; score=snap.score;
    _play('tap');
    rn();refreshUndoBtn();
    var el=document.getElementById('GFsc');if(el)el.textContent=countLeft();
  };
  window._GFToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading, try again in a sec.');return;}
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
    // ⛔ The model is dealt whole, right here, exactly as it always was. The
    // choreography below only decides how much of it the renderer may show yet.
    startDeal();
  }

  // Stage the deal over the finished model.
  function startDeal(){
    // ⛔ CANCEL FIRST. New Game is always one tap away, and a deal still in
    // flight would keep firing timers into a course that has been replaced
    // underneath it.
    if(dealHandle)dealHandle.cancel();
    dealt=0;stockDown=false;upcardDown=false;rowPop=false;stockPop=false;flipUp=false;
    // If the card kit never loaded, show the finished course rather than an
    // empty one that waits forever for a scheduler that is not there.
    if(typeof _cdDeal!=='function'){dealt=5;stockDown=true;upcardDown=true;dealing=false;rn();return;}
    dealing=true;shuffling=true;
    rn();
    dealHandle=_cdDeal({
      steps:DEAL_STEPS, shuffleMs:850, stepMs:250,
      alive:function(){return dealing;},
      onShuffle:function(){shuffling=true;},
      onShuffleEnd:function(){shuffling=false;rn();},
      onStep:function(step){
        // The pause deliberately does NOT repaint: rebuilding here would
        // recreate the stock mid-animation and cut its landing short.
        if(step==='beat')return;
        if(step==='row'){dealt++;rowPop=true;}else{stockDown=true;stockPop=true;}
        rn();
      },
      // The turn and the unlock land together, so the first frame the player
      // can act on is the frame the foundation card appears on.
      onDone:function(){upcardDown=true;flipUp=true;dealing=false;rn();refreshUndoBtn();}
    });
  }

  // Header count. Mid-deal it reports what is actually ON the table — "35
  // left" over an empty course is a lie the player can see.
  function shownLeft(){return dealing?dealt*7:countLeft();}

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
      if(window._lwCardEnd)_lwCardEnd({key:'golf',won:true,title:'COURSE CLEARED',line:'every card sunk',retry:window._GFN});
      return;
    }
    if(stock.length>0)return;
    for(var c=0;c<7;c++){
      if(cols[c].length>0&&canPlay(cols[c][cols[c].length-1]))return;
    }
    gameOver=true;
    var left=countLeft();score=left;
    mm_up(left+' left, no moves');
    _e('game_loss');_play('lose');_sr('golf',{w:false,s:35-left});
    if(window._lwCardEnd)_lwCardEnd({key:'golf',won:false,title:'OUT OF MOVES',line:left+' cards left on the course',retry:window._GFN});
  }

  function mm_up(txt){
    var el=document.getElementById('_gm');
    if(el)el.textContent=txt;
  }

  function tapCol(ci){
    if(dealing||gameOver)return;
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
    if(dealing||gameOver)return;
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
    // One-shot animation flags, read once by the render they belong to so a
    // later repaint cannot replay them.
    var lay=rowPop;rowPop=false;
    var pop=stockPop;stockPop=false;
    var flip=flipUp;flipUp=false;
    gd.innerHTML='';
    var sc=document.getElementById('GFsc');
    if(sc)sc.textContent=shownLeft();

    // Top row: stock, waste, score. Tableau is 7 columns.
    var fit=window._cdFit?window._cdFit(7,{maxW:72,gap:3,pad:10}):{w:'clamp(52px,13.5vw,72px)',h:'clamp(72px,18.9vw,100px)',font:'clamp(.6rem,1.7vw,.8rem)',gap:'3px',raw:{h:100}};
    var gfW=fit.w,gfH=fit.h,gfF=fit.font;
    var topRow=document.createElement('div');
    topRow.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center;padding:4px 0;width:100%;max-width:100vw;margin:0 auto;align-items:center';

    // Stock. Until the deck is set down, this slot IS the deck: it wiggles
    // through the shuffle and counts 52 down to 17 as the rows go out, and it
    // is the only thing on the table that moves while they do.
    //
    // ⛔ THE DECK FLOATS INSIDE THE SLOT. _cdDeckHtml's caption is a real
    // block element; left in normal flow it would grow the top row for the
    // length of the deal and collapse it the instant the deal ended — a
    // whole-course jolt on the exact frame the player is watching the last
    // card land. Out of flow it costs the row nothing.
    var stEl=document.createElement('div');
    // The upcard is still sitting on the pile until it turns, so the squared-up
    // stock reads 17 and drops to 16 on the flip.
    var stockShown=dealing?(stock.length+(upcardDown?0:1)):stock.length;
    if(dealing&&!stockDown){
      var dkH=Math.max(30,(fit.raw.h||100)-28),dkW=Math.max(22,Math.round(dkH/1.4247));
      stEl.style.cssText='position:relative;flex-shrink:0;';
      stEl.innerHTML='<div style="position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;align-items:center;">'
        +_cdDeckHtml(52-dealt*7,dkW,dkH,{shuffling:shuffling,label:shuffling?'shuffling\u2026':'dealing\u2026'})
        +'</div>';
    }else if(stockShown>0){
      stEl.className='gc gc-dn';
      _cdBackStyle(stEl);
      stEl.innerHTML='<span style="color:rgba(245,240,225,.95);font-size:clamp(.8rem,2.2vw,.9rem);font-weight:700;background:rgba(13,16,12,.6);padding:2px 9px;border-radius:12px;text-shadow:0 1px 4px rgba(0,0,0,.95)">'+stockShown+'</span>';
      // The deck being squared up into a pile is its own beat of the deal.
      if(pop)stEl.classList.add('cd-deal-in');
      if(!dealing){
        stEl.style.cursor='pointer';
        stEl.onclick=function(){tapStock()};
      }
    }else{
      stEl.className='gc gc-empty';
      stEl.innerHTML='<span style="color:var(--muted);font-size:clamp(.72rem,1.8vw,.8rem)">empty</span>';
    }
    stEl.style.width=gfW;stEl.style.height=gfH;
    topRow.appendChild(stEl);

    // Waste / foundation. Held empty until the deal turns the upcard: the slot
    // the whole course plays into should arrive last, and arrive turning.
    var wEl=document.createElement('div');
    if(waste.length>0&&(!dealing||upcardDown)){
      var wc=waste[waste.length-1];
      wEl=_cdEl(wc);
      wEl.style.boxShadow='0 0 8px rgba(200,168,78,.3)';
      if(flip)wEl.classList.add('cd-flip');
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
    lbl.textContent=shownLeft()+' left';
    topRow.appendChild(lbl);
    gd.appendChild(topRow);

    // Tableau — 7 columns of 5 cards each, peek-stacked so the bottom row stays visible.
    var tabRow=document.createElement('div');
    tabRow.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center;padding:4px 0;width:100%;max-width:100vw;margin:0 auto';

    for(var c=0;c<7;c++){
      var colDiv=document.createElement('div');
      colDiv.className='gc-stk';colDiv.style.minWidth=gfW;

      // Mid-deal the column is drawn short. The model behind it is already
      // whole — dealt is a curtain, not a build order — so canPlay, countLeft
      // and every other rule that reads cols[] stay exactly as they were.
      var depth=dealing?Math.min(dealt,cols[c].length):cols[c].length;
      if(depth===0){
        var em=document.createElement('div');
        em.className='gc gc-empty';em.style.width=gfW;em.style.height=gfH;
        colDiv.appendChild(em);
      }else{
        // Reveal ~28% of each card so rank+suit on the peek strip stays readable
        // even at smaller card sizes. 5 cards per column + 28% reveal fits a
        // landscape phone comfortably.
        var peekOverlap=Math.round(fit.raw.h * 0.72);
        for(var i=0;i<depth;i++){
          var cd=_cdEl(cols[c][i]);
          cd.style.width=gfW;cd.style.height=gfH;cd.style.fontSize=gfF;
          if(i>0)cd.style.marginTop=(-peekOverlap)+'px';
          if(i<depth-1)cd.classList.add('gc-peek');
          // Only the row that just landed pops, and only on the render that
          // laid it. ⛔ Keying this off dealt alone made the bottom row pop a
          // SECOND time when the stock came down 250ms later, because the
          // rebuild handed the same cards the same class again.
          if(lay&&i===dealt-1)cd.classList.add('cd-deal-in');
          if(i===depth-1&&!dealing){
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
  // Exit cleanup: a deal still in flight would keep firing timers into a board
  // that has been torn down, and _cdActiveRn would retain this game forever.
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    dealing=false;
    if(dealHandle)dealHandle.cancel();
    if(window._cdActiveRn)window._cdActiveRn=null;
  });
  init();
}

window._gameFns.golf=GGF;
})();
