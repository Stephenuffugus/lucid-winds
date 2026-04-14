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
  // peaks: 28 slots. Rows 0-2 are face-down peaks, row 3 is 10 face-up cards
  // Layout: 3 mini-pyramids of 3 rows each (1+2+3=6 cards each = 18), plus 10 base cards
  ms(a,'Streak: <strong id="TPst">0</strong> · Left: <strong id="TPlf">28</strong>');mm(a);
  var gd=document.createElement('div');gd.id='TPgd';a.appendChild(gd);
  var _tpStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb" onclick="_TPN()">🔄 New</button> <button class="gb" id="TPstyle" onclick="_TPToggleStyle()" style="font-size:0.7rem;">'+_tpStyleLbl+'</button>';
  window._TPToggleStyle=function(){
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

  function init(){
    var deck=_cdSh(_cdMk());
    peaks=[];stock=[];waste=[];gameOver=false;moves=0;streak=0;removed={};
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
    upd();rn();
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
    if(gameOver||removed[idx]||!isExposed(idx)||!peaks[idx].up)return;
    if(!canPlay(peaks[idx])){sm('Need ±1 from waste');return;}
    waste.push(peaks[idx]);removed[idx]=true;streak++;moves++;_play('tap');_e('progress');
    flipParents();
    if(checkWin()){gameOver=true;mm_up('🏆 Cleared!');_play('win');_playWin();_e('game_win');_sr('tripeaks',{w:true,s:moves});}
    upd();rn();
    if(!gameOver&&checkLoss()){gameOver=true;var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;mm_up(left+' left — stuck');_e('game_loss');_play('lose');_sr('tripeaks',{w:false,s:28-left});}
  }
  function tapStock(){
    if(gameOver||stock.length===0)return;
    var cd=stock.pop();cd.up=true;waste.push(cd);streak=0;_play('tap');upd();rn();
    if(checkLoss()){gameOver=true;var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;mm_up(left+' left — stuck');_e('game_loss');_play('lose');_sr('tripeaks',{w:false,s:28-left});}
  }
  function rn(){
    gd.innerHTML='';
    // Peaks
    var peakDiv=document.createElement('div');
    peakDiv.style.cssText='display:flex;flex-direction:column;align-items:center;padding:clamp(2px,1vw,4px) 0';
    // Row 0: 3 peak tops (indices 0,6,12) with gaps
    var rows=[[0,6,12],[1,2,7,8,13,14],[3,4,5,9,10,11,15,16,17],[18,19,20,21,22,23,24,25,26,27]];
    for(var ri=0;ri<4;ri++){
      var rowDiv=document.createElement('div');
      rowDiv.style.cssText='display:flex;gap:clamp(2px,.5vw,3px);justify-content:center';
      if(ri>0)rowDiv.style.marginTop='clamp(-14px,-4vw,-20px)';
      // Add spacers between peaks for alignment
      for(var ci=0;ci<rows[ri].length;ci++){
        var pi=rows[ri][ci];
        // Add gap between peaks
        if(ri<3&&ci>0&&Math.floor(rows[ri][ci]/6)!==Math.floor(rows[ri][ci-1]/6)){
          var gap=document.createElement('div');
          var gapW=ri===0?'clamp(60px,18vw,84px)':ri===1?'clamp(20px,5.5vw,28px)':'clamp(2px,.5vw,3px)';
          gap.style.cssText='width:'+gapW;
          rowDiv.appendChild(gap);
        }
        if(removed[pi]){
          var em=document.createElement('div');em.style.cssText='width:clamp(46px,11vw,72px);height:clamp(64px,15.4vw,101px)';
          rowDiv.appendChild(em);
        }else{
          var cd=_cdEl(peaks[pi]);
          cd.style.width='clamp(42px,9.5vw,62px)';cd.style.height='clamp(59px,13.3vw,87px)';cd.style.fontSize='clamp(.6rem,1.7vw,.8rem)';
          if(!peaks[pi].up){cd.className='gc gc-dn';_cdBackStyle(cd);cd.style.width='clamp(42px,9.5vw,62px)';cd.style.height='clamp(59px,13.3vw,87px)';cd.innerHTML='';}
          else if(isExposed(pi)){cd.style.cursor='pointer';(function(ii){cd.onclick=function(){tapPeak(ii)}})(pi);}
          else{cd.style.opacity='.5';}
          rowDiv.appendChild(cd);
        }
      }
      peakDiv.appendChild(rowDiv);
    }
    gd.appendChild(peakDiv);
    // Stock + Waste
    var botRow=document.createElement('div');
    botRow.style.cssText='display:flex;gap:clamp(4px,1.2vw,6px);justify-content:center;padding:clamp(3px,1vw,6px) 0;align-items:center';
    var stEl=document.createElement('div');
    if(stock.length>0){stEl.className='gc gc-dn';_cdBackStyle(stEl);stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+stock.length+'</span>';stEl.style.cursor='pointer';stEl.onclick=function(){tapStock()};}
    else{stEl.className='gc gc-empty';}
    botRow.appendChild(stEl);
    var wEl;
    if(waste.length>0){wEl=_cdEl(waste[waste.length-1]);wEl.style.boxShadow='0 0 8px rgba(200,168,78,.3)';}
    else{wEl=document.createElement('div');wEl.className='gc gc-empty';}
    botRow.appendChild(wEl);
    var sp=document.createElement('div');sp.style.flex='1';botRow.appendChild(sp);
    var info=document.createElement('div');info.style.cssText='color:var(--gold);font-family:DM Mono,monospace;font-size:clamp(.55rem,1.8vw,.75rem)';
    var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;
    info.textContent='Streak: '+streak;botRow.appendChild(info);
    gd.appendChild(botRow);
  }
  window._TPN=function(){init()};
  init();
}

window._gameFns.tripeaks=GTP;
})();
