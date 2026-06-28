// ═══ LUCID WINDS — Spider Solitaire ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,_setDiff=G.setDiff,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;
// Card utilities (loaded by _cards.js)
var _cdMk=window._cdMk,_cdSh=window._cdSh,_cdEl=window._cdEl,_cdArt=window._cdArt;
var _cdRnk=window._cdRnk,_cdSuit=window._cdSuit,_cdIsRed=window._cdIsRed,_cdBackStyle=window._cdBackStyle;
var _SUIT_SYM=window._SUIT_SYM,_SUIT_CLR=window._SUIT_CLR,_RANK_SYM=window._RANK_SYM;
var _SUIT_NAME=window._SUIT_NAME,_CD_BASE=window._CD_BASE,_CD_BACK=window._CD_BACK;

function GSP(a){
  var tab=[],stock=[],completed=0,sel=null,gameOver=false,moves=0,suits=1;
  var history=[]; // LIFO stack of pre-move snapshots for undo
  ms(a,'Runs: <strong id="SPrn">0</strong>/8 · Moves: <strong id="SPmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='SPgd';a.appendChild(gd);
  var _spStyleLbl='🃏 Style';
  mc(a).innerHTML='<select class="gsl" id="SPsuit" onchange="_SPS(this.value)"><option value="1" selected>1 Suit</option><option value="2">2 Suits</option><option value="4">4 Suits</option></select> <button class="gb" id="SPundoBtn" onclick="_SPUndo()" disabled style="opacity:0.45;">↶ Undo</button> <button class="gb-new" onclick="_SPN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button> <button class="gb" id="SPstyle" onclick="_SPToggleStyle()" style="font-size:0.7rem;">'+_spStyleLbl+'</button>';
  function snapshot(){
    history.push(JSON.stringify({tab:tab, stock:stock, completed:completed, moves:moves}));
    refreshUndoBtn();
  }
  function refreshUndoBtn(){
    var b=document.getElementById('SPundoBtn');
    if(!b)return;
    if(history.length>0&&!gameOver){b.disabled=false;b.style.opacity='1';}
    else{b.disabled=true;b.style.opacity='0.45';}
  }
  window._SPUndo=function(){
    if(history.length===0||gameOver)return;
    var snap=JSON.parse(history.pop());
    tab=snap.tab; stock=snap.stock; completed=snap.completed; moves=snap.moves;
    sel=null;
    _play('tap');
    upd();rn();refreshUndoBtn();
  };
  window._SPToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading, try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('SPstyle');
    if(b)b.textContent='🃏 Style';
    rn();
  };

  function mkDeck(){
    var d=[];
    if(suits===1){for(var i=0;i<8;i++)for(var r=0;r<13;r++)d.push({s:0,r:r,up:false});}
    else if(suits===2){for(var i=0;i<4;i++)for(var s=0;s<2;s++)for(var r=0;r<13;r++)d.push({s:s,r:r,up:false});}
    else{for(var i=0;i<2;i++)for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({s:s,r:r,up:false});}
    return _cdSh(d);
  }
  window._cdActiveRn=function(){try{rn()}catch(e){}};
  function init(){
    var deck=mkDeck();
    tab=[];stock=[];completed=0;sel=null;gameOver=false;moves=0;
    history=[];
    for(var c=0;c<10;c++){
      tab[c]=[];
      var cnt=c<4?6:5;
      for(var i=0;i<cnt;i++){var cd=deck.pop();cd.up=(i===cnt-1);tab[c].push(cd);}
    }
    stock=deck.slice();
    upd();rn();
  }
  function upd(){
    var el=document.getElementById('SPrn');if(el)el.textContent=completed;
    var el2=document.getElementById('SPmv');if(el2)el2.textContent=moves;
  }
  function mm_up(t){var el=document.getElementById('_gm');if(el)el.textContent=t;}
  function flipTops(){for(var c=0;c<10;c++){var col=tab[c];if(col.length>0&&!col[col.length-1].up)col[col.length-1].up=true;}}
  function checkRun(ci){
    var col=tab[ci];if(col.length<13)return false;
    var st=col.length-13;var s=col[st].s;
    for(var i=0;i<13;i++){if(col[st+i].r!==12-i||col[st+i].s!==s||!col[st+i].up)return false;}
    col.splice(st,13);completed++;_e('milestone');
    flipTops();
    if(completed>=8){gameOver=true;mm_up('🏆 All 8 runs!');_play('win');_playWin();_e('game_win');_sr('spider',{w:true,s:moves});}
    return true;
  }
  function getRunLen(ci,idx){
    var col=tab[ci];if(idx>=col.length||!col[idx].up)return 0;
    var len=1;
    for(var i=idx+1;i<col.length;i++){
      if(!col[i].up||col[i].s!==col[i-1].s||col[i].r!==col[i-1].r-1)break;
      len++;
    }
    return len;
  }
  function tapCol(ci,idx){
    if(gameOver)return;
    var col=tab[ci];
    if(sel){
      // Try to place
      if(ci===sel.col){sel=null;rn();return;}
      var cards=tab[sel.col].slice(sel.idx);
      var bot=cards[0];
      if(col.length===0||bot.r===col[col.length-1].r-1){
        snapshot();
        tab[sel.col].splice(sel.idx);
        for(var i=0;i<cards.length;i++)col.push(cards[i]);
        moves++;flipTops();
        while(checkRun(ci)){}
        sel=null;upd();rn();refreshUndoBtn();
      }else{sel=null;rn();}
    }else{
      if(idx===undefined)idx=col.length-1;
      if(idx<0||idx>=col.length||!col[idx].up)return;
      var runLen=getRunLen(ci,idx);
      if(idx+runLen!==col.length){sm('Same suit run only');return;}
      sel={col:ci,idx:idx};rn();
    }
  }
  function dealStock(){
    if(gameOver||stock.length===0)return;
    for(var c=0;c<10;c++){if(tab[c].length===0){sm('Fill empty columns first');return;}}
    snapshot();
    for(var c=0;c<10;c++){
      if(stock.length===0)break;
      var cd=stock.pop();cd.up=true;tab[c].push(cd);
    }
    moves++;_play('tap');
    for(var c=0;c<10;c++)while(checkRun(c)){}
    flipTops();upd();rn();refreshUndoBtn();
  }
  function rn(){
    var _ag=document.getElementById('fg-ag');
    var _scrollY=_ag?_ag.scrollTop:0;
    gd.innerHTML='';
    // Smart-drop source — the head (bottom, lowest-rank) of the selected run.
    var srcHead=null, srcColIdx=-1;
    if(sel){ srcHead=tab[sel.col][sel.idx]; srcColIdx=sel.col; }
    var topRow=document.createElement('div');
    // min(100vw,700px) + right padding — the old clamp(...,100vw,...) with a
    // flex:1 spacer pushed the runs counter flush past the right edge
    // ("0/8 ru" at every phone width).
    topRow.style.cssText='display:flex;gap:clamp(4px,1.2vw,6px);justify-content:center;padding:clamp(2px,1vw,4px) 12px;width:min(calc(100vw - 8px),700px);max-width:100%;margin:0 auto;align-items:center;box-sizing:border-box';
    var stEl=document.createElement('div');
    if(stock.length>0){stEl.className='gc gc-dn';_cdBackStyle(stEl);stEl.style.cursor='pointer';stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+Math.ceil(stock.length/10)+'</span>';stEl.onclick=function(){dealStock()};}
    else{stEl.className='gc gc-empty';}
    topRow.appendChild(stEl);
    var sp=document.createElement('div');sp.style.flex='1';topRow.appendChild(sp);
    var info=document.createElement('div');info.style.cssText='color:var(--gold);font-family:DM Mono,monospace;font-size:clamp(.55rem,1.8vw,.75rem)';
    info.textContent=completed+'/8 runs';topRow.appendChild(info);
    gd.appendChild(topRow);
    var tabRow=document.createElement('div');
    // 10-column Spider — tightest horizontal budget of any solitaire.
    var fit=window._cdFit?window._cdFit(10,{maxW:72,gap:2,pad:6}):{w:'clamp(40px,10.5vw,70px)',h:'clamp(56px,14.7vw,98px)',font:'clamp(.55rem,1.5vw,.72rem)',gap:'2px',raw:{w:70,h:98}};
    var spW=fit.w,spH=fit.h,spF=fit.font;
    tabRow.style.cssText='display:flex;gap:'+fit.gap+';justify-content:center;padding:4px 0;width:100%;max-width:100vw;margin:0 auto';
    for(var c=0;c<10;c++){
      var colDiv=document.createElement('div');colDiv.className='gc-stk';
      colDiv.style.minWidth=spW;
      // Spider's drop rule: empty col OR top-of-col rank is srcHead.r+1. Any suit.
      var colLegal = false;
      if(srcHead && c!==srcColIdx){
        if(tab[c].length===0)colLegal=true;
        else{var topC=tab[c][tab[c].length-1];if(topC.up&&topC.r===srcHead.r+1)colLegal=true;}
      }
      if(tab[c].length===0){
        var em=document.createElement('div');em.className='gc gc-empty';em.style.width=spW;em.style.height=spH;
        if(colLegal)em.classList.add('gc-legal');
        (function(ci){em.onclick=function(){tapCol(ci)}})(c);
        colDiv.appendChild(em);
      }else{
        // Peek math — Spider piles can grow to 18+ cards, so the peek
        // compresses with depth but starts at Klondike's 28% reveal so
        // ranks and suits are legible on all but the deepest piles.
        var depth=tab[c].length;
        var depthMult=depth>14?0.5:depth>11?0.65:depth>8?0.8:1.0;
        // Stephen 2026-06-28: deep piles (15+) compressed to a ~14% reveal,
        // "smooshing" the rank+suit corner so it was both illegible AND too
        // thin a strip to tap — which is why a full K-to-2 run couldn't be
        // grabbed by its head card. Floor the reveal at 26% of card height so
        // the top-left corner stays readable and tappable at any depth. The
        // column scrolls, so the extra height is fine.
        var revealFrac=0.28*depthMult; if(revealFrac<0.26)revealFrac=0.26;
        var peekOverlap=Math.round(fit.raw.h * (1 - revealFrac));
        for(var i=0;i<depth;i++){
          var cd=_cdEl(tab[c][i]);
          cd.style.width=spW;cd.style.height=spH;cd.style.fontSize=spF;
          if(i>0)cd.style.marginTop=(-peekOverlap)+'px';
          // Only the bottom (top-of-stack) card shows its full face.
          // Every card under it should hide center art + bottom-right
          // corner so they don't leak through via the overlap math.
          if(i<depth-1)cd.classList.add('gc-peek');
          if(sel&&sel.col===c&&i>=sel.idx)cd.className+=' gc-sel';
          if(colLegal&&i===depth-1)cd.classList.add('gc-legal');
          (function(ci,ii){cd.onclick=function(){tapCol(ci,ii)}})(c,i);
          colDiv.appendChild(cd);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
    if(_ag)_ag.scrollTop=_scrollY;
  }
  window._SPN=function(){init()};
  window._SPS=function(v){suits=parseInt(v)||1;_setDiff(suits<=1?'easy':suits<=2?'medium':'hard');init()};
  init();
}

window._gameFns.spider=GSP;
})();
