/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Inline game copy: picross
 *
 * COPY of the inline GX mount function from index.html
 * lines 66926-66948.
 *
 * DUPLICATE, NEVER MOVE. The original code in index.html is the
 * live source of truth for the in-LW play surface. This copy serves
 * the /play/picross.html shell only. To keep them aligned,
 * re-run scripts/extract_inline_games.js whenever index.html's
 * inline game block is edited.
 * ════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var G=window._G;
  var _e=G.e, _play=G.play, _playWin=G.playWin, _st=G.st, _xt=G.xt,
      ms=G.ms, mm=G.mm, mc=G.mc, sm=G.sm, sh=G.sh,
      _sr=G.sr, _gr=G.gr, _setDiff=G.setDiff,
      _solEnterFS=G.solEnterFS, _solClearFS=G.solClearFS, _solExitFS=G.solExitFS;
  window._gameFns=window._gameFns||{};

  function GX(a){var SZ=5,sol=[],bd=[],rowC=[],colC=[],won=false;ms(a);mm(a);
    if(!document.getElementById('x-anim-style')){var _xs=document.createElement('style');_xs.id='x-anim-style';_xs.textContent='@keyframes xBloomPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}@keyframes xRevealRing{0%{transform:scale(0.6);opacity:0}80%{opacity:1}100%{transform:scale(2.4);opacity:0}}@keyframes xLineIn{0%{transform:translateY(8px);opacity:0}100%{transform:translateY(0);opacity:1}}';document.head.appendChild(_xs);}
    var w=document.createElement('div');w.id='Xw';w.style.cssText='padding:8px;position:relative';a.appendChild(w);mc(a).innerHTML='<select class="gsl" id="Xd" onchange="_XN()"><option value="5" selected>5×5</option><option value="7">7×7</option><option value="10">10×10</option></select> <button class="gb-new" onclick="_XN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
    function gen(){sol=[];for(var i=0;i<SZ*SZ;i++)sol.push(Math.random()<.55?1:0);bd=new Array(SZ*SZ).fill(0);won=false;
      rowC=[];for(var r=0;r<SZ;r++){var s=[],c=0;for(var j=0;j<SZ;j++){if(sol[r*SZ+j])c++;else{if(c)s.push(c);c=0}}if(c)s.push(c);if(!s.length)s=[0];rowC.push(s)}
      colC=[];for(var c=0;c<SZ;c++){var s=[],n=0;for(var r=0;r<SZ;r++){if(sol[r*SZ+c])n++;else{if(n)s.push(n);n=0}}if(n)s.push(n);if(!s.length)s=[0];colC.push(s)}}
    function rn(){var h='<table style="border-collapse:collapse;margin:0 auto"><tr><td></td>';
      for(var c=0;c<SZ;c++)h+='<td style="text-align:center;font-size:.65rem;color:var(--sage);padding:2px;vertical-align:bottom;line-height:1.3;font-family:DM Mono,monospace">'+colC[c].join('<br>')+'</td>';h+='</tr>';
      for(var r=0;r<SZ;r++){h+='<tr><td style="text-align:right;font-size:.65rem;color:var(--sage);padding:0 6px;font-family:DM Mono,monospace">'+rowC[r].join(' ')+'</td>';
        for(var c=0;c<SZ;c++){var i=r*SZ+c;h+='<td style="width:52px;height:52px;border:1px solid rgba(74,124,53,.18);text-align:center;cursor:pointer;background:'+(bd[i]===1?'rgba(74,124,53,.4)':bd[i]===2?'rgba(199,80,80,.08)':'rgba(26,31,23,.6)')+';border-radius:3px;font-size:.7rem" onclick="_XT('+i+')">'+(bd[i]===2?'✕':'')+'</td>'}h+='</tr>'}h+='</table>';w.innerHTML=h;
      if(won)return;
      var win=true;for(var i=0;i<SZ*SZ;i++){if(sol[i]===1&&bd[i]!==1||sol[i]===0&&bd[i]===1){win=false;break}}if(win&&bd.some(function(v){return v===1})){won=true;_e('game_win');_playWin();_sr('picross',{w:true,s:SZ*SZ});
        // Ceremony — light up every filled cell one-by-one, then overlay
        var cells=w.querySelectorAll('table td');var fillCells=[];for(var ci=0;ci<cells.length;ci++){var style=cells[ci].getAttribute('style')||'';if(style.indexOf('rgba(74,124,53,.4)')>=0)fillCells.push(cells[ci]);}
        fillCells.forEach(function(cell,ii){setTimeout(function(){cell.style.background='rgba(122,179,86,0.7)';cell.style.boxShadow='0 0 10px rgba(122,179,86,0.6)';cell.style.transition='all .3s ease';},ii*40);});
        setTimeout(function(){
          var ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,rgba(122,179,86,0.3) 0%,rgba(13,16,12,0.92) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:xLineIn .3s ease;';
          ov.innerHTML='<div style="position:relative;width:140px;height:140px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;inset:0;border:3px solid rgba(122,179,86,0.5);border-radius:50%;animation:xRevealRing 1.2s ease-out;"></div><div style="position:absolute;inset:0;border:2px solid rgba(200,168,75,0.5);border-radius:50%;animation:xRevealRing 1.2s ease-out .3s;"></div><div style="animation:xBloomPop .7s cubic-bezier(.18,1.5,.3,1);filter:drop-shadow(0 0 20px rgba(122,179,86,0.8));"><img src="assets/fx/bloom-leaf.png" alt="" style="width:96px;height:96px;object-fit:contain;display:block;"></div></div><div style="font-family:Georgia,serif;font-size:1.8rem;font-weight:700;color:#7ab356;letter-spacing:0.1em;margin-top:16px;animation:xLineIn .5s ease-out .3s both;">REVEALED</div><div style="font-family:Georgia,serif;font-style:italic;font-size:0.85rem;color:#e8dcc8;margin-top:6px;animation:xLineIn .5s ease-out .55s both;">'+SZ+'×'+SZ+' grid solved</div><button onclick="this.parentElement.remove();_XN()" style="margin-top:24px;min-height:44px;padding:10px 24px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:8px;letter-spacing:0.05em;cursor:pointer;animation:xLineIn .5s ease-out .8s both;">↻ New Grid</button>';
          ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
          document.body.appendChild(ov);
        }, fillCells.length*40 + 300);
      }}
    window._XT=function(i){if(won)return;bd[i]=bd[i]===0?1:bd[i]===1?2:0;var correct=0;for(var j=0;j<SZ*SZ;j++){if(sol[j]===1&&bd[j]===1)correct++;}if(correct>0&&correct%5===0)_e('progress');_play('tap');rn()};window._XN=function(){SZ=parseInt((document.getElementById('Xd')||{}).value)||5;gen();sm('');rn()};_XN();}

  window._gameFns['picross']=GX;
})();
