// ═══ LUCID WINDS — Sudoku (Soil Grid) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GU(a){var bd=new Array(81).fill(0),sol=new Array(81).fill(0),fix=new Array(81).fill(false),sel=-1,_fc=0;_setDiff('medium');ms(a);mm(a);
  var gd=document.createElement('div');gd.className='ug';gd.id='Ug';a.appendChild(gd);
  var pd=document.createElement('div');pd.className='up';for(var n=1;n<=9;n++)pd.innerHTML+='<div class="upb" onclick="_UN('+n+')">'+n+'</div>';pd.innerHTML+='<div class="upb" onclick="_UN(0)" style="color:var(--muted)">✕</div>';a.appendChild(pd);mc(a).innerHTML='<select class="gsl" id="Ud" onchange="_UG()"><option value="35">Easy</option><option value="45" selected>Medium</option><option value="52">Hard</option></select> <button class="gb" onclick="_UG()">🔄 New</button>';
  function gen(){var b=new Array(81).fill(0);function vl(p,n){var r=Math.floor(p/9),c=p%9,br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;for(var i=0;i<9;i++)if(b[r*9+i]===n||b[i*9+c]===n)return false;for(var dr=0;dr<3;dr++)for(var dc=0;dc<3;dc++)if(b[(br+dr)*9+(bc+dc)]===n)return false;return true}function s(p){if(p>=81)return true;var nums=sh([1,2,3,4,5,6,7,8,9]);for(var i=0;i<9;i++){if(vl(p,nums[i])){b[p]=nums[i];if(s(p+1))return true;b[p]=0}}return false}s(0);sol=b.slice();bd=b.slice();var rm=parseInt((document.getElementById('Ud')||{}).value)||45;_setDiff(rm<=35?'easy':rm<=45?'medium':'hard');while(rm>0){var i=Math.floor(Math.random()*81);if(bd[i]){bd[i]=0;rm--}}for(var i=0;i<81;i++)fix[i]=bd[i]!==0;_fc=0}
  function rn(){gd.innerHTML='';for(var i=0;i<81;i++){var d=document.createElement('div');d.className='uc'+(fix[i]?' uf':'')+(i===sel?' us':'')+(bd[i]&&!fix[i]&&bd[i]!==sol[i]?' ue':'');d.textContent=bd[i]||'';d.setAttribute('data-i',i);if(!fix[i])d.onclick=function(){sel=parseInt(this.getAttribute('data-i'));rn()};gd.appendChild(d)}var done=true;for(var i=0;i<81;i++)if(bd[i]!==sol[i]){done=false;break}if(done&&bd[0]){_e('game_win');_playWin();sm('🌿 Complete!');_sr('sudoku',{w:true,s:81})}}
  window._UN=function(n){if(sel<0||fix[sel])return;_play('tap');var prev=bd[sel];bd[sel]=n;if(n&&n===sol[sel]&&prev!==sol[sel]){_fc++;if(_fc%9===0)_e('progress')}rn()};window._UG=function(){sel=-1;_fc=0;gen();sm('');rn()};_UG();}

window._gameFns.sudoku=GU;
})();
