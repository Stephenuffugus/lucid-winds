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
  // sel = {src:'tab'|'waste', col:N, idx:N} or null
  ms(a,'Moves: <strong id="KLmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='KLgd';a.appendChild(gd);
  var _kStyleLbl=(window._cdStyle&&window._cdStyle()==='classic')?'🃏 Classic':'🃏 Garden';
  mc(a).innerHTML='<select class="gsl" id="KLdraw" onchange="_KLDraw(this.value)"><option value="1" selected>Draw 1</option><option value="3">Draw 3</option></select> <button class="gb" onclick="_KLN()">🔄 New</button> <button class="gb" id="KLstyle" onclick="_KLToggleStyle()" style="font-size:0.7rem;">'+_kStyleLbl+'</button>';
  window._KLToggleStyle=function(){
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('KLstyle');
    if(b)b.textContent=nxt==='classic'?'🃏 Classic':'🃏 Garden';
    rn();
  };

  function init(){
    var deck=_cdSh(_cdMk());
    tableau=[];stock=[];waste=[];sel=null;gameOver=false;moves=0;lastTap=0;lastTapCard=null;
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

  function doMove(){
    moves++;
    var el=document.getElementById('KLmv');if(el)el.textContent=moves;
    _play('tap');
    _e('progress');
  }

  function tapStock(){
    sel=null;
    if(stock.length===0){
      if(waste.length===0)return;
      stock=waste.reverse();
      waste=[];
      for(var i=0;i<stock.length;i++)stock[i].up=false;
      rn();return;
    }
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
    // Double-tap auto-foundation
    if(lastTapCard&&lastTapCard.s===topCard.s&&lastTapCard.r===topCard.r&&now-lastTap<400){
      var fi=autoToFnd(topCard);
      if(fi>=0){
        waste.pop();
        fnd[fi].push(topCard);
        sel=null;doMove();
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
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
        waste.pop();fnd[fi].push(card);sel=null;doMove();
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
        rn();return;
      }
    }else if(sel.src==='tab'){
      var col=tableau[sel.col];
      if(sel.idx===col.length-1){
        card=col[col.length-1];
        if(canPlaceOnFnd(card,fi)){
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
        if(wc.r===12){waste.pop();col.push(wc);sel=null;doMove();rn();return;}
        sm('Only Kings on empty');sel=null;rn();return;
      }
      if(sel.src==='tab'){
        var srcCol=tableau[sel.col];
        var card=srcCol[sel.idx];
        if(card.r===12){
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
      if(cardIdx===col.length-1){tappedCard.up=true;rn();}
      return;
    }

    var now=Date.now();
    // Double-tap auto-foundation (only for top card)
    if(cardIdx===col.length-1&&lastTapCard&&lastTapCard.s===tappedCard.s&&lastTapCard.r===tappedCard.r&&now-lastTap<400){
      var fi=autoToFnd(tappedCard);
      if(fi>=0){
        col.pop();fnd[fi].push(tappedCard);
        if(col.length>0&&!col[col.length-1].up)col[col.length-1].up=true;
        sel=null;doMove();
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
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
        waste.pop();col.push(srcCard);sel=null;doMove();rn();return;
      }
    }else if(sel.src==='tab'){
      var srcCol=tableau[sel.col];
      srcCard=srcCol[sel.idx];
      if(canPlaceOnTab(srcCard,ci)){
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

    // Top row: stock, waste, spacer, 4 foundations
    var topRow=document.createElement('div');
    var klW='clamp(56px,14.5vw,92px)',klH='clamp(78px,20.2vw,128px)',klF='clamp(.65rem,1.9vw,.9rem)';
    topRow.style.cssText='display:flex;gap:clamp(2px,.8vw,4px);justify-content:center;padding:clamp(2px,1vw,4px) 0;width:clamp(320px,100vw,680px);margin:0 auto;align-items:flex-start;flex-wrap:nowrap';

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
        fEl.style.backgroundImage="url('"+_CD_BASE+_SUIT_NAME[f]+".png')";
      }
      fEl.style.width=klW;fEl.style.height=klH;fEl.style.fontSize=klF;
      fEl.style.cursor='pointer';
      (function(fi){fEl.onclick=function(){tapFnd(fi)}})(f);
      topRow.appendChild(fEl);
    }
    gd.appendChild(topRow);

    // Tableau
    var tabRow=document.createElement('div');
    tabRow.style.cssText='display:flex;gap:clamp(2px,.8vw,4px);justify-content:center;padding:clamp(2px,.8vw,3px) 0;width:clamp(320px,100vw,680px);margin:0 auto;align-items:flex-start';

    for(var c=0;c<7;c++){
      var colDiv=document.createElement('div');
      colDiv.style.cssText='display:flex;flex-direction:column;min-width:'+klW+';align-items:center';

      if(tableau[c].length===0){
        var em=document.createElement('div');
        em.className='gc gc-empty';
        em.style.width=klW;em.style.height=klH;
        em.style.cursor='pointer';
        (function(ci){em.onclick=function(){tapTab(ci,0)}})(c);
        colDiv.appendChild(em);
      }else{
        var depth=tableau[c].length;
        for(var i=0;i<depth;i++){
          var card=tableau[c][i];
          var cdEl=_cdEl(card);
          cdEl.style.width=klW;cdEl.style.height=klH;cdEl.style.fontSize=klF;

          // Stacked cards: show peek only, last card full height
          if(i<depth-1){
            // Compress peek when stack is deep
            var peekUp=depth>10?'clamp(12px,3.5vw,16px)':depth>7?'clamp(14px,4vw,18px)':'clamp(16px,4.5vw,22px)';
            var peekDn=depth>10?'clamp(8px,2.5vw,12px)':depth>7?'clamp(10px,3vw,14px)':'clamp(12px,3.5vw,16px)';
            cdEl.style.height=card.up?peekUp:peekDn;
            cdEl.style.overflow='hidden';
            cdEl.style.alignItems='flex-start';
            cdEl.style.paddingTop='2px';
            cdEl.style.fontSize=klF;
          }
          // Selection highlight
          if(sel&&sel.src==='tab'&&sel.col===c&&i>=sel.idx&&card.up){
            cdEl.className+=' gc-sel';
          }
          if(card.up){
            cdEl.style.cursor='pointer';
            cdEl.style.position='relative';
            cdEl.style.zIndex=i;
            (function(ci,idx){cdEl.onclick=function(ev){ev.stopPropagation();tapTab(ci,idx)}})(c,i);
          }
          colDiv.appendChild(cdEl);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
  }

  window._KLN=function(){init()};
  window._KLDraw=function(v){drawCount=parseInt(v)||1;init()};
  init();
}

window._gameFns.klondike=GKL;
})();
