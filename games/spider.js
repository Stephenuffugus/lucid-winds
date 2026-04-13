// ═══ LUCID WINDS — Spider Solitaire ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;
// Card utilities (loaded by _cards.js)
var _cdMk=window._cdMk,_cdSh=window._cdSh,_cdEl=window._cdEl,_cdArt=window._cdArt;
var _cdRnk=window._cdRnk,_cdSuit=window._cdSuit,_cdIsRed=window._cdIsRed,_cdBackStyle=window._cdBackStyle;
var _SUIT_SYM=window._SUIT_SYM,_SUIT_CLR=window._SUIT_CLR,_RANK_SYM=window._RANK_SYM;
var _SUIT_NAME=window._SUIT_NAME,_CD_BASE=window._CD_BASE,_CD_BACK=window._CD_BACK;

function GSP(a){
  var tab=[],stock=[],completed=0,sel=null,gameOver=false,moves=0,suits=1;
  ms(a,'Runs: <strong id="SPrn">0</strong>/8 · Moves: <strong id="SPmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='SPgd';a.appendChild(gd);
  mc(a).innerHTML='<select class="gsl" id="SPsuit" onchange="_SPS(this.value)"><option value="1" selected>1 Suit</option><option value="2">2 Suits</option><option value="4">4 Suits</option></select> <button class="gb" onclick="_SPN()">🔄 New</button>';

  function mkDeck(){
    var d=[];
    if(suits===1){for(var i=0;i<8;i++)for(var r=0;r<13;r++)d.push({s:0,r:r,up:false});}
    else if(suits===2){for(var i=0;i<4;i++)for(var s=0;s<2;s++)for(var r=0;r<13;r++)d.push({s:s,r:r,up:false});}
    else{for(var i=0;i<2;i++)for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({s:s,r:r,up:false});}
    return _cdSh(d);
  }
  function init(){
    var deck=mkDeck();
    tab=[];stock=[];completed=0;sel=null;gameOver=false;moves=0;
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
        tab[sel.col].splice(sel.idx);
        for(var i=0;i<cards.length;i++)col.push(cards[i]);
        moves++;flipTops();
        while(checkRun(ci)){}
        sel=null;upd();rn();
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
    for(var c=0;c<10;c++){
      if(stock.length===0)break;
      var cd=stock.pop();cd.up=true;tab[c].push(cd);
    }
    moves++;_play('tap');
    for(var c=0;c<10;c++)while(checkRun(c)){}
    flipTops();upd();rn();
  }
  function rn(){
    gd.innerHTML='';
    var topRow=document.createElement('div');
    topRow.style.cssText='display:flex;gap:clamp(4px,1.2vw,6px);justify-content:center;padding:clamp(2px,1vw,4px) 0;width:clamp(320px,100vw,700px);margin:0 auto;align-items:center';
    var stEl=document.createElement('div');
    if(stock.length>0){stEl.className='gc gc-dn';_cdBackStyle(stEl);stEl.style.cursor='pointer';stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+Math.ceil(stock.length/10)+'</span>';stEl.onclick=function(){dealStock()};}
    else{stEl.className='gc gc-empty';}
    topRow.appendChild(stEl);
    var sp=document.createElement('div');sp.style.flex='1';topRow.appendChild(sp);
    var info=document.createElement('div');info.style.cssText='color:var(--gold);font-family:DM Mono,monospace;font-size:clamp(.55rem,1.8vw,.75rem)';
    info.textContent=completed+'/8 runs';topRow.appendChild(info);
    gd.appendChild(topRow);
    var tabRow=document.createElement('div');
    var spW='clamp(40px,10.5vw,70px)',spH='clamp(56px,14.7vw,98px)',spF='clamp(.55rem,1.5vw,.72rem)';
    tabRow.style.cssText='display:flex;gap:clamp(1px,.3vw,2px);justify-content:flex-start;padding:clamp(2px,1vw,4px) 0;max-width:100vw;margin:0 auto;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin';
    for(var c=0;c<10;c++){
      var colDiv=document.createElement('div');colDiv.className='gc-stk';
      colDiv.style.minWidth=spW;
      if(tab[c].length===0){
        var em=document.createElement('div');em.className='gc gc-empty';em.style.width=spW;em.style.height=spH;
        (function(ci){em.onclick=function(){tapCol(ci)}})(c);
        colDiv.appendChild(em);
      }else{
        for(var i=0;i<tab[c].length;i++){
          var cd=_cdEl(tab[c][i]);
          cd.style.width=spW;cd.style.height=spH;cd.style.fontSize=spF;
          if(sel&&sel.col===c&&i>=sel.idx)cd.className+=' gc-sel';
          (function(ci,ii){cd.onclick=function(){tapCol(ci,ii)}})(c,i);
          colDiv.appendChild(cd);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
  }
  window._SPN=function(){init()};
  window._SPS=function(v){suits=parseInt(v)||1;_setDiff(suits<=1?'easy':suits<=2?'medium':'hard');init()};
  init();
}

window._gameFns.spider=GSP;
})();
