// ═══ LUCID WINDS — Hanoi (Root Stack) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,_setDiff=G.setDiff,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GH(a){var pegs=[[],[],[]],discs=5,moves=0,sp=-1;var COLS=['#4a7c35','#7ab356','#C8A84B','#c76a30','#4a7aaa','#9b59b6','#c75050'];
  ms(a,'👆<strong id="Hm">0</strong> · Opt:<strong id="Ho">31</strong>');mm(a);
  var pd=document.createElement('div');pd.className='hp';pd.id='Hp';a.appendChild(pd);mc(a).innerHTML='<select class="gsl" id="Hd" onchange="_HN()"><option value="4">4</option><option value="5" selected>5</option><option value="6">6</option><option value="7">7</option></select> discs <button class="gb" onclick="_HN()">🔄 New</button>';
  function rn(){pd.innerHTML='';for(var p=0;p<3;p++){var pg=document.createElement('div');pg.className='hpeg';pg.setAttribute('data-p',p);pg.onclick=function(){var pi=parseInt(this.getAttribute('data-p'));if(sp<0){if(pegs[pi].length)sp=pi;rn()}else{if(sp===pi){sp=-1;rn();return}if(pegs[pi].length&&pegs[pi][pegs[pi].length-1]<pegs[sp][pegs[sp].length-1]){sm('Too big!');sp=-1;rn();return}_play('snap');pegs[pi].push(pegs[sp].pop());moves++;if(moves%(discs*2)===0&&pegs[2].length<discs)_e('milestone');document.getElementById('Hm').textContent=moves;sp=-1;if(pegs[2].length===discs){_e('game_win');sm('🌿 '+moves+' moves!');_sr('hanoi',{w:true,s:moves})}rn()}};
    if(sp===p)pg.style.background='rgba(200,168,78,.08)';
    var rod=document.createElement('div');rod.style.cssText='width:4px;height:'+(discs*16+20)+'px;background:rgba(74,124,53,.3);border-radius:2px;position:absolute;bottom:0;left:50%;transform:translateX(-50%)';pg.appendChild(rod);
    pegs[p].forEach(function(d){var dk=document.createElement('div');dk.className='hdk';dk.style.width=(30+d*14)+'px';dk.style.background=COLS[d%7];pg.appendChild(dk)});pd.appendChild(pg)}}
  window._HN=function(){discs=parseInt(document.getElementById('Hd').value);_setDiff(discs<=4?'easy':discs<=5?'medium':discs<=6?'hard':'expert');pegs=[[],[],[]];for(var i=discs-1;i>=0;i--)pegs[0].push(i);moves=0;sp=-1;document.getElementById('Hm').textContent='0';document.getElementById('Ho').textContent=(Math.pow(2,discs)-1);sm('');rn()};_HN();}

window._gameFns.hanoi=GH;
})();
