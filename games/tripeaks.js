// ═══ LUCID WINDS — TriPeaks Solitaire ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;
// Card utilities (loaded by _cards.js)
var _cdMk=window._cdMk,_cdSh=window._cdSh,_cdEl=window._cdEl,_cdArt=window._cdArt;
var _cdRnk=window._cdRnk,_cdSuit=window._cdSuit,_cdIsRed=window._cdIsRed,_cdBackStyle=window._cdBackStyle;
var _SUIT_SYM=window._SUIT_SYM,_SUIT_CLR=window._SUIT_CLR,_RANK_SYM=window._RANK_SYM;
var _SUIT_NAME=window._SUIT_NAME,_CD_BASE=window._CD_BASE,_CD_BACK=window._CD_BACK;

function GTP(a){
  var peaks=[],stock=[],waste=[],gameOver=false,moves=0,streak=0;
  var history=[]; // LIFO stack of pre-move snapshots for undo
  // peaks: 28 slots. Rows 0-2 are face-down peaks, row 3 is 10 face-up cards
  // Layout: 3 mini-pyramids of 3 rows each (1+2+3=6 cards each = 18), plus 10 base cards
  ms(a,'Streak: <strong id="TPst">0</strong> · Left: <strong id="TPlf">28</strong>');mm(a);
  var gd=document.createElement('div');gd.id='TPgd';a.appendChild(gd);
  var _tpStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb" id="TPundoBtn" onclick="_TPUndo()" disabled style="opacity:0.45;">↶ Undo</button> <button class="gb" onclick="_TPN()">↻ New Game</button> <button class="gb" id="TPstyle" onclick="_TPToggleStyle()" style="font-size:0.7rem;">'+_tpStyleLbl+'</button>';
  function snapshot(){
    history.push(JSON.stringify({peaks:peaks, stock:stock, waste:waste, moves:moves, streak:streak, removed:removed}));
    refreshUndoBtn();
  }
  function refreshUndoBtn(){
    var b=document.getElementById('TPundoBtn');
    if(!b)return;
    if(history.length>0&&!gameOver){b.disabled=false;b.style.opacity='1';}
    else{b.disabled=true;b.style.opacity='0.45';}
  }
  window._TPUndo=function(){
    if(dealing||history.length===0||gameOver)return;
    var snap=JSON.parse(history.pop());
    peaks=snap.peaks; stock=snap.stock; waste=snap.waste; moves=snap.moves; streak=snap.streak; removed=snap.removed;
    _play('tap');
    upd();rn();refreshUndoBtn();
  };
  window._TPToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading, try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('TPstyle');
    if(b)b.textContent='🃏 Style';
    rn();
  };

  // Peak structure: 3 peaks, each has rows of 1,2,3 cards
  // Peak 0: indices 0, 1,2, 3,4,5
  // Peak 1: indices 6, 7,8, 9,10,11
  // Peak 2: indices 12, 13,14, 15,16,17
  // Base row: indices 18-27 (10 cards)
  var removed={};

  // ── THE DEAL (2026-08-21) ─────────────────────────────────────────────────
  // TriPeaks used to arrive whole: twenty-eight cards, a stock and a face-up
  // waste, all in the frame after "New Game". Three peaks is the only shape in
  // the card set that is neither a grid nor a hand, and landing all at once it
  // reads as one lumpy drift of cards. Dealing it TIER BY TIER from the summits
  // down — 3, then 6, then 9, then the 10-card base — draws the three pyramids
  // in the air before the player has to pick them out of a static board. That
  // is why this game's choreography is by row and not by seat like Hearts.
  //
  // ⛔ THE MODEL IS BUILT INSTANTLY; ONLY THE VIEW IS STAGED. init() lays the
  // whole deal exactly as it always did and `dealt` just limits how much of it
  // rn() is allowed to draw. Building the model a tier at a time would run
  // isExposed(), flipParents() and the loss check against a half-built table.
  var TIERS=[[0,6,12],[1,2,7,8,13,14],[3,4,5,9,10,11,15,16,17],[18,19,20,21,22,23,24,25,26,27]];
  // Six beats: the four tiers, the stock landing, then the first waste card
  // turning over. 850ms shuffle + 6 x 350ms = 2950ms, inside the 2-3.5s the
  // rest of the card set deals in.
  var DEAL_STEPS=['tier0','tier1','tier2','base','stock','waste'];
  var dealt=0,shuffling=false,dealHandle=null,dealing=false;
  // `dealt` counts completed steps, so step i is on the table once dealt>i.
  // Every gate answers true when we are not dealing — one code path renders
  // both the staged table and the finished one.
  function tierDealt(ri){return !dealing||dealt>ri;}
  function tierNew(ri){return dealing&&dealt===ri+1;}
  function stockDealt(){return !dealing||dealt>4;}
  function stockNew(){return dealing&&dealt===5;}
  function wasteDealt(){return !dealing||dealt>5;}
  function wasteNew(){return dealing&&dealt===6;}
  // What is still in the dealer's hand: 52 minus everything already on felt.
  function deckLeft(){
    var n=0;
    for(var t=0;t<TIERS.length;t++)if(tierDealt(t))n+=TIERS[t].length;
    if(stockDealt())n+=stock.length;
    if(wasteDealt())n+=waste.length;
    return 52-n;
  }
  // _cdDeckHtml needs real pixels, but the bottom row is sized by the .gc clamp
  // in index.html, not by _cdFit (which only sizes the 10-wide tableau). Mirror
  // that clamp so deck, stock and waste card are all one size. If .gc changes,
  // change this with it.
  function botCardSize(){
    var w=Math.max(56,Math.min(110,Math.round((window.innerWidth||360)*0.135)));
    return {w:w,h:Math.round(w*1.4)};
  }

  window._cdActiveRn=function(){try{rn()}catch(e){}};
  function init(){
    var deck=_cdSh(_cdMk());
    peaks=[];stock=[];waste=[];gameOver=false;moves=0;streak=0;removed={};
    history=[];
    for(var i=0;i<28;i++){
      var cd=deck.pop();
      // Base row (18-27) is face-up, peak tops (0,6,12) face-down, etc.
      cd.up=(i>=18);
      // Second row of each peak face-down, third row face-up
      if(i<18){
        var pk=Math.floor(i/6);
        var pi=i%6;
        cd.up=(pi>=3); // row 2 (indices 3,4,5 within each peak) face-up
      }
      peaks.push(cd);
    }
    var first=deck.pop();first.up=true;
    waste=[first];stock=deck.slice();
    for(var i=0;i<stock.length;i++)stock[i].up=false;
    upd();startDeal();
  }
  function startDeal(){
    // ⛔ CANCEL FIRST. "New Game" is one tap away at all times, and a deal still
    // in flight would keep firing its timers into a table that has been rebuilt
    // underneath it — peaks it laid would reappear over the new ones.
    if(dealHandle)dealHandle.cancel();
    dealt=0;dealing=true;shuffling=true;rn();
    if(typeof _cdDeal!=='function'){
      // Card kit not up yet: show the finished table rather than an empty one.
      dealt=DEAL_STEPS.length;dealing=false;shuffling=false;rn();refreshUndoBtn();return;
    }
    dealHandle=_cdDeal({
      steps:DEAL_STEPS, shuffleMs:850, stepMs:350,
      alive:function(){return dealing;},
      onShuffle:function(){shuffling=true;},
      onShuffleEnd:function(){shuffling=false;rn();},
      // ⛔ STAGE, RE-RENDER, LET CSS POP THE NEW TIER IN. rn() rebuilds the
      // whole board's innerHTML, which would kill any card mid-flight across
      // the table, so nothing flies — the tier simply arrives.
      onStep:function(step,i){dealt=i+1;rn();},
      onDone:function(){dealing=false;dealt=DEAL_STEPS.length;rn();refreshUndoBtn();}
    });
  }
  function upd(){
    var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;
    var e1=document.getElementById('TPst');if(e1)e1.textContent=streak;
    var e2=document.getElementById('TPlf');if(e2)e2.textContent=left;
  }
  function mm_up(t){var el=document.getElementById('_gm');if(el)el.textContent=t;}
  function isExposed(idx){
    if(removed[idx])return false;
    if(idx>=18)return true; // base row always exposed
    var pk=Math.floor(idx/6);var pi=idx%6;
    if(pi>=3)return true; // bottom row of peak — check if base cards below are removed
    // Actually, let's use parent-child: row 0 (pi=0) covered by row 1 (pi=1,2), row 1 covered by row 2 (pi=3,4,5)
    if(pi===0){return !!removed[pk*6+1]&&!!removed[pk*6+2];}
    if(pi===1){return !!removed[pk*6+3]&&!!removed[pk*6+4];}
    if(pi===2){return !!removed[pk*6+4]&&!!removed[pk*6+5];}
    return true;
  }
  function flipParents(){
    for(var i=0;i<18;i++){
      if(!removed[i]&&!peaks[i].up&&isExposed(i))peaks[i].up=true;
    }
  }
  function canPlay(card){
    if(waste.length===0)return true;
    var top=waste[waste.length-1];
    var diff=Math.abs(card.r-top.r);
    return diff===1||(card.r===0&&top.r===12)||(card.r===12&&top.r===0); // wrapping
  }
  function checkWin(){for(var i=0;i<28;i++)if(!removed[i])return false;return true;}
  function checkLoss(){
    if(stock.length>0)return false;
    for(var i=0;i<28;i++){if(!removed[i]&&isExposed(i)&&peaks[i].up&&canPlay(peaks[i]))return false;}
    return true;
  }
  function tapPeak(idx){
    if(dealing||gameOver||removed[idx]||!isExposed(idx)||!peaks[idx].up)return;
    if(!canPlay(peaks[idx])){sm('Need ±1 from waste');return;}
    snapshot();
    waste.push(peaks[idx]);removed[idx]=true;streak++;moves++;_play('tap');_e('progress');
    flipParents();
    if(checkWin()){gameOver=true;mm_up('🏆 Cleared!');_play('win');_playWin();_e('game_win');_sr('tripeaks',{w:true,s:moves,lo:1});if(window._lwCardEnd)_lwCardEnd({key:'tripeaks',won:true,title:'THREE PEAKS CLEARED',line:moves+' moves',retry:window._TPN});}
    upd();rn();refreshUndoBtn();
    if(!gameOver&&checkLoss()){gameOver=true;var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;mm_up(left+' left, stuck');_e('game_loss');_play('lose');_sr('tripeaks',{w:false,s:28-left});if(window._lwCardEnd)_lwCardEnd({key:'tripeaks',won:false,title:'STUCK ON THE SLOPES',line:left+' cards left on the peaks',retry:window._TPN});}
  }
  function tapStock(){
    if(dealing||gameOver||stock.length===0)return;
    snapshot();
    var cd=stock.pop();cd.up=true;waste.push(cd);streak=0;_play('tap');upd();rn();refreshUndoBtn();
    if(checkLoss()){gameOver=true;var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;mm_up(left+' left, stuck');_e('game_loss');_play('lose');_sr('tripeaks',{w:false,s:28-left});if(window._lwCardEnd)_lwCardEnd({key:'tripeaks',won:false,title:'STUCK ON THE SLOPES',line:left+' cards left on the peaks',retry:window._TPN});}
  }
  function rn(){
    var _ag=document.getElementById('fg-ag');
    var _scrollY=_ag?_ag.scrollTop:0;
    gd.innerHTML='';
    // Peaks
    var peakDiv=document.createElement('div');
    peakDiv.style.cssText='display:flex;flex-direction:column;align-items:center;padding:4px 0';
    // Row 0: 3 peak tops (indices 0,6,12) with gaps
    var rows=TIERS;
    // 10-column base row drives sizing.
    var fit=window._cdFit?window._cdFit(10,{maxW:64,gap:2,pad:16}):{w:'clamp(42px,9.5vw,62px)',h:'clamp(59px,13.3vw,87px)',font:'clamp(.6rem,1.7vw,.8rem)',gap:'2px',raw:{w:62,h:87}};
    var tpW=fit.w,tpH=fit.h,tpF=fit.font;
    var rowOverlap = Math.round(fit.raw.h * 0.23); // overlap between rows
    // Inter-peak gap scales with card width — wider at top, narrower at base.
    var peakGap0 = (fit.raw.w * 1.3)+'px';
    var peakGap1 = (fit.raw.w * 0.4)+'px';
    var peakGap2 = fit.gap;
    for(var ri=0;ri<4;ri++){
      var rowDiv=document.createElement('div');
      rowDiv.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center';
      if(ri>0)rowDiv.style.marginTop=(-rowOverlap)+'px';
      // Add spacers between peaks for alignment
      for(var ci=0;ci<rows[ri].length;ci++){
        var pi=rows[ri][ci];
        // Add gap between peaks
        if(ri<3&&ci>0&&Math.floor(rows[ri][ci]/6)!==Math.floor(rows[ri][ci-1]/6)){
          var gap=document.createElement('div');
          var gapW=ri===0?peakGap0:ri===1?peakGap1:peakGap2;
          gap.style.cssText='width:'+gapW;
          rowDiv.appendChild(gap);
        }
        // An undealt tier holds its slots open with the same spacer a removed
        // card leaves behind, so the peaks fill in place instead of shoving the
        // stock and waste down the screen four times on the way in.
        if(removed[pi]||!tierDealt(ri)){
          var em=document.createElement('div');em.style.cssText='width:'+tpW+';height:'+tpH;
          rowDiv.appendChild(em);
        }else{
          var cd=_cdEl(peaks[pi]);
          cd.style.width=tpW;cd.style.height=tpH;cd.style.fontSize=tpF;
          // Peak rows (0-2) hide their big center art so adjacent cards don't
          // look like a wall of overlapping suits. Only the base row (r=3)
          // shows full face. Corner rank+suit stays visible on every card.
          if(ri<3)cd.classList.add('gc-peek');
          if(!peaks[pi].up){cd.className='gc gc-dn';_cdBackStyle(cd);cd.style.width=tpW;cd.style.height=tpH;cd.innerHTML='';}
          else if(isExposed(pi)){cd.style.cursor='pointer';(function(ii){cd.onclick=function(){tapPeak(ii)}})(pi);}
          else{cd.style.filter='brightness(.5) saturate(.8)';cd.style.boxShadow='inset 0 2px 0 rgba(200,168,75,.5),0 2px 6px rgba(0,0,0,.5)';}
          // Only the tier that just landed pops. Set last: the face-down branch
          // above reassigns className outright and would wipe it.
          if(tierNew(ri))cd.classList.add('cd-deal-in');
          rowDiv.appendChild(cd);
        }
      }
      peakDiv.appendChild(rowDiv);
    }
    gd.appendChild(peakDiv);
    // Stock + Waste
    var botRow=document.createElement('div');
    botRow.style.cssText='display:flex;gap:clamp(4px,1.2vw,6px);justify-content:center;padding:clamp(3px,1vw,6px) 0;align-items:center';
    // The deck deals from the slot the stock will occupy, so the pile the
    // player taps for the rest of the game is visibly the leftovers of the
    // shuffle they just watched, not a new object that appeared beside it.
    var bs=botCardSize();
    var stEl=document.createElement('div');
    stEl.style.flex='0 0 auto'; // .gc gave the old stock flex-shrink:0 for free
    if(!stockDealt()){
      stEl.innerHTML=_cdDeckHtml(deckLeft(),bs.w,bs.h,{shuffling:shuffling,label:shuffling?'shuffling\u2026':'dealing\u2026'});
    }else if(stock.length>0){
      stEl.innerHTML=_cdDeckHtml(stock.length,bs.w,bs.h,{});
      if(stockNew())stEl.className='cd-deal-in';
      if(!dealing){stEl.style.cursor='pointer';stEl.onclick=function(){tapStock()};}
    }
    else{stEl.className='gc gc-empty';}
    botRow.appendChild(stEl);
    var wEl;
    // The last beat of the deal: the opening waste card turns over. It stays an
    // empty slot until then so the turn is something the player sees happen.
    if(waste.length>0&&wasteDealt()){
      wEl=_cdEl(waste[waste.length-1]);wEl.style.boxShadow='0 0 8px rgba(200,168,78,.3)';
      if(wasteNew())wEl.classList.add('cd-flip');
    }
    else{wEl=document.createElement('div');wEl.className='gc gc-empty';}
    botRow.appendChild(wEl);
    var sp=document.createElement('div');sp.style.flex='1';botRow.appendChild(sp);
    var info=document.createElement('div');info.style.cssText='color:var(--gold);font-family:DM Mono,monospace;font-size:clamp(.55rem,1.8vw,.75rem)';
    var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;
    info.textContent='Streak: '+streak;botRow.appendChild(info);
    gd.appendChild(botRow);
    if(_ag)_ag.scrollTop=_scrollY;
  }
  window._TPN=function(){init()};
  init();
}

window._gameFns.tripeaks=GTP;
})();
