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
  ms(a,'Moves: <strong id="FCmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='FCgd';a.appendChild(gd);
  var _fcStyleLbl='🃏 '+(window._cdStyleLabel?window._cdStyleLabel():'Garden');
  mc(a).innerHTML='<button class="gb" onclick="_FCN()">🔄 New</button> <button class="gb" id="FCstyle" onclick="_FCToggleStyle()" style="font-size:0.7rem;">'+_fcStyleLbl+'</button>';
  window._FCToggleStyle=function(){
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('FCstyle');
    if(b)b.textContent='🃏 '+(window._cdStyleLabel?window._cdStyleLabel(nxt):'Garden');
    rn();
  };

  function init(){
    var deck=_cdSh(_cdMk());
    tab=[];free=[null,null,null,null];fnd=[[],[],[],[]];sel=null;gameOver=false;moves=0;
    for(var c=0;c<8;c++){tab[c]=[];var cnt=c<4?7:6;for(var i=0;i<cnt;i++){var cd=deck.pop();cd.up=true;tab[c].push(cd);}}
    upd();rn();
  }
  function upd(){var el=document.getElementById('FCmv');if(el)el.textContent=moves;}
  function mm_up(t){var el=document.getElementById('_gm');if(el)el.textContent=t;}
  function checkWin(){for(var f=0;f<4;f++)if(fnd[f].length<13)return false;return true;}
  function emptyFree(){var n=0;for(var i=0;i<4;i++)if(!free[i])n++;return n;}
  function emptyCols(){var n=0;for(var c=0;c<8;c++)if(tab[c].length===0)n++;return n;}
  function maxMove(){return (1+emptyFree())*Math.pow(2,emptyCols());}
  function canFnd(card,fi){
    var pile=fnd[fi];if(pile.length===0)return card.r===0;
    return pile[pile.length-1].s===card.s&&card.r===pile[pile.length-1].r+1;
  }
  function canTab(card,ci){
    var col=tab[ci];if(col.length===0)return true;
    var top=col[col.length-1];
    return _cdIsRed(top.s)!==_cdIsRed(card.s)&&card.r===top.r-1;
  }
  function tryAutoFnd(card,src){
    for(var f=0;f<4;f++){
      if(canFnd(card,f)){
        fnd[f].push(card);
        if(src.type==='free')free[src.idx]=null;
        else if(src.type==='tab')tab[src.idx].pop();
        else if(src.type==='waste'){}
        moves++;_e('progress');
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('freecell',{w:true,s:moves});}
        upd();rn();return true;
      }
    }
    return false;
  }
  function doSelect(type,idx,cardIdx){
    if(gameOver)return;
    if(sel){
      // Try to place
      if(type==='fnd'){
        // Place on foundation
        var cards=getSel();
        if(cards.length===1&&canFnd(cards[0],idx)){
          removeSel();fnd[idx].push(cards[0]);moves++;_e('progress');
          if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('freecell',{w:true,s:moves});}
          sel=null;upd();rn();return;
        }
        sel=null;rn();return;
      }
      if(type==='free'){
        var cards=getSel();
        if(cards.length===1&&!free[idx]){
          removeSel();free[idx]=cards[0];moves++;sel=null;upd();rn();return;
        }
        if(free[idx]&&sel.type==='free'&&sel.idx===idx){sel=null;rn();return;}
        sel=null;rn();return;
      }
      if(type==='tab'){
        var cards=getSel();
        if(cards.length<=maxMove()&&canTab(cards[0],idx)){
          removeSel();for(var i=0;i<cards.length;i++)tab[idx].push(cards[i]);moves++;
          sel=null;upd();rn();return;
        }
        // Maybe selecting new source
        if(tab[idx].length>0&&tab[idx][cardIdx]&&tab[idx][cardIdx].up){
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
    gd.innerHTML='';
    var topRow=document.createElement('div');
    var fcW='clamp(48px,13vw,84px)',fcH='clamp(67px,18.2vw,117px)',fcF='clamp(.6rem,1.75vw,.85rem)';
    topRow.style.cssText='display:flex;gap:clamp(2px,.6vw,4px);justify-content:center;padding:clamp(2px,1vw,4px) 0;width:clamp(320px,100vw,680px);margin:0 auto;align-items:flex-start';
    // Free cells
    for(var i=0;i<4;i++){
      var el;
      if(free[i]){el=_cdEl(free[i]);if(sel&&sel.type==='free'&&sel.idx===i)el.className+=' gc-sel';}
      else{el=document.createElement('div');el.className='gc gc-empty';}
      el.style.width=fcW;el.style.height=fcH;el.style.fontSize=fcF;
      (function(ii){el.onclick=function(){doSelect('free',ii)}})(i);
      el.style.cursor='pointer';topRow.appendChild(el);
    }
    var sp=document.createElement('div');sp.style.cssText='width:clamp(4px,1.5vw,10px)';topRow.appendChild(sp);
    // Foundations
    for(var f=0;f<4;f++){
      var el;
      if(fnd[f].length>0){el=_cdEl(fnd[f][fnd[f].length-1]);}
      else{el=document.createElement('div');el.className='gc gc-fnd';el.style.backgroundImage="url('"+_CD_BASE+_SUIT_NAME[f]+".png')";}
      el.style.width=fcW;el.style.height=fcH;el.style.fontSize=fcF;
      (function(fi){el.onclick=function(){doSelect('fnd',fi)}})(f);
      el.style.cursor='pointer';topRow.appendChild(el);
    }
    gd.appendChild(topRow);
    // Tableau
    var tabRow=document.createElement('div');
    tabRow.style.cssText='display:flex;gap:clamp(2px,.6vw,3px);justify-content:center;padding:clamp(2px,.8vw,3px) 0;width:clamp(320px,100vw,680px);margin:0 auto';
    for(var c=0;c<8;c++){
      var colDiv=document.createElement('div');colDiv.className='gc-stk';colDiv.style.minWidth=fcW;
      if(tab[c].length===0){
        var em=document.createElement('div');em.className='gc gc-empty';em.style.width=fcW;em.style.height=fcH;
        (function(ci){em.onclick=function(){doSelect('tab',ci)}})(c);
        colDiv.appendChild(em);
      }else{
        for(var i=0;i<tab[c].length;i++){
          var cd=_cdEl(tab[c][i]);
          cd.style.width=fcW;cd.style.height=fcH;cd.style.fontSize=fcF;
          if(sel&&sel.type==='tab'&&sel.idx===c&&i>=sel.cardIdx)cd.className+=' gc-sel';
          (function(ci,ii){cd.onclick=function(){doSelect('tab',ci,ii)}})(c,i);
          cd.style.cursor='pointer';colDiv.appendChild(cd);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
  }
  window._FCN=function(){init()};
  init();
}

window._gameFns.freecell=GFC;
})();
