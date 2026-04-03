// ═══ LUCID WINDS — Word Search (Root Words) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GW(a){var SZ=10,grid=[],words=[],found=[],sel=[];
  var BANK=[['FERN','MOSS','SAGE','BLOOM','PETAL','ROOT'],['LEAF','THORN','MAPLE','TULIP','DAISY','CEDAR'],['SOIL','WATER','MULCH','PRUNE','SPORE','FLORA']];
  ms(a,'Found: <strong id="Wf">0</strong>/<strong id="Wt">6</strong>');mm(a);
  var gd=document.createElement('div');gd.className='wg';gd.id='Wg';gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';a.appendChild(gd);
  var wl=document.createElement('div');wl.id='Wl';wl.style.cssText='display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:8px;font-size:.55rem';a.appendChild(wl);mc(a).innerHTML='<select class="gsl" id="Wd" onchange="_WN()"><option value="8-5">Easy</option><option value="10-6" selected>Medium</option><option value="13-8">Hard</option></select> <button class="gb" onclick="_WN()">🔄 New</button>';
  function gen(){var dv=((document.getElementById('Wd')||{}).value||'10-6').split('-');SZ=parseInt(dv[0])||10;var wc=parseInt(dv[1])||6;gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';grid=[];for(var i=0;i<SZ*SZ;i++)grid.push('');var pool=[];BANK.forEach(function(b){b.forEach(function(w){if(w.length<=SZ)pool.push(w)})});words=sh(pool).slice(0,wc);found=[];
    words.forEach(function(w){for(var att=0;att<60;att++){var dir=Math.random()<.5?'h':'v';var r=Math.floor(Math.random()*(dir==='v'?SZ-w.length:SZ));var c=Math.floor(Math.random()*(dir==='h'?SZ-w.length:SZ));var ok=true;for(var k=0;k<w.length;k++){var gi=dir==='h'?r*SZ+c+k:(r+k)*SZ+c;if(grid[gi]&&grid[gi]!==w[k]){ok=false;break}}if(ok){for(var k=0;k<w.length;k++){var gi=dir==='h'?r*SZ+c+k:(r+k)*SZ+c;grid[gi]=w[k]}break}}});
    var A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';for(var i=0;i<SZ*SZ;i++)if(!grid[i])grid[i]=A[Math.floor(Math.random()*26)]}
  function rn(){gd.innerHTML='';for(var i=0;i<SZ*SZ;i++){var d=document.createElement('div');d.className='wc';d.textContent=grid[i];d.setAttribute('data-i',i);d.onclick=function(){var idx=parseInt(this.getAttribute('data-i'));sel.push(idx);this.classList.add('ws');chk()};gd.appendChild(d)}rnW()}
  function chk(){words.forEach(function(w){if(found.indexOf(w)>-1)return;for(var dir=0;dir<2;dir++){for(var r=0;r<SZ;r++)for(var c=0;c<=(dir?SZ-w.length:SZ-w.length);c++){var ids=[];for(var k=0;k<w.length;k++)ids.push(dir?(r+k)*SZ+c:r*SZ+c+k);if(dir&&r+w.length>SZ)continue;var m=true;for(var k=0;k<w.length;k++)if(grid[ids[k]]!==w[k]){m=false;break}if(m){var all=true;for(var k=0;k<ids.length;k++)if(sel.indexOf(ids[k])<0){all=false;break}if(all){found.push(w);_play('snap');ids.forEach(function(x){if(gd.children[x]){gd.children[x].classList.add('wf','wf-flash');setTimeout(function(){if(gd.children[x])gd.children[x].classList.remove('wf-flash')},420)}});sel=[];document.getElementById('Wf').textContent=found.length;rnW();if(found.length>=words.length){_e('game_win');_playWin();sm('🌿 All found!');_sr('wordsearch',{w:true,s:found.length})}else if(found.length%2===0)_e('milestone');return}}}}})}
  function rnW(){wl.innerHTML='';words.forEach(function(w){wl.innerHTML+='<span style="'+(found.indexOf(w)>-1?'text-decoration:line-through;opacity:0.4;color:var(--sage)':'color:var(--cream)')+'">'+w+'</span>'})}
  window._WN=function(){sel=[];gen();document.getElementById('Wf').textContent='0';document.getElementById('Wt').textContent=words.length;sm('');rn()};_WN();}

window._gameFns.wordsearch=GW;
})();
