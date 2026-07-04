/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Inline game copy: picross
 *
 * COPY of the inline GX mount function from index.html
 * lines 68652-68714.
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

  function GX(a){var SZ=5,sol=[],bd=[],rowC=[],colC=[],won=false,_xtm=[];ms(a);mm(a);
    function _xClear(){for(var q=0;q<_xtm.length;q++)clearTimeout(_xtm[q]);_xtm=[];}
    if(!document.getElementById('x-anim-style')){var _xs=document.createElement('style');_xs.id='x-anim-style';_xs.textContent='@keyframes xBloomPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}@keyframes xRevealRing{0%{transform:scale(0.6);opacity:0}80%{opacity:1}100%{transform:scale(2.4);opacity:0}}@keyframes xLineIn{0%{transform:translateY(8px);opacity:0}100%{transform:translateY(0);opacity:1}}';document.head.appendChild(_xs);}
    var w=document.createElement('div');w.id='Xw';w.style.cssText='padding:8px;position:relative;overflow-x:auto';a.appendChild(w);mc(a).innerHTML='<select class="gsl" id="Xd" onchange="_XN()"><option value="5" selected>5\u00d75</option><option value="7">7\u00d77</option><option value="10">10\u00d710</option><option value="12">12\u00d712</option></select> <button class="gb-new" onclick="_XN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
    function segs(arr){var s=[],c=0,i;for(i=0;i<arr.length;i++){if(arr[i])c++;else{if(c)s.push(c);c=0;}}if(c)s.push(c);if(!s.length)s=[0];return s;}
    function eqA(x,y){if(x.length!==y.length)return false;for(var i=0;i<x.length;i++)if(x[i]!==y[i])return false;return true;}
    function rowCells(src,r){var o=[],j;for(j=0;j<SZ;j++)o.push(src[r*SZ+j]===1?1:0);return o;}
    function colCells(src,c){var o=[],r;for(r=0;r<SZ;r++)o.push(src[r*SZ+c]===1?1:0);return o;}
    // Organic boards: random seed + ONE 3\u00d73 majority-smoothing pass (big boards
    // only) so the hidden picture is blobby and clue sets play fair (was pure
    // noise). Reroll degenerate fills. 2026-07-03 rebuild.
    function gen(){var tries=0,fill,interest;
      do{sol=[];var i;for(i=0;i<SZ*SZ;i++)sol.push(Math.random()<.5?1:0);
        if(SZ>=10){ // big boards: one smoothing pass for organic blobs; small
          var nx=[];// boards keep raw texture (smoothing turns 5x5 into one blob)
          for(var r=0;r<SZ;r++)for(var c=0;c<SZ;c++){var n=0,t=0;
            for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){var rr=r+dr,cc=c+dc;t++;if(rr>=0&&rr<SZ&&cc>=0&&cc<SZ)n+=sol[rr*SZ+cc];}
            nx.push(n*2>t?1:0);}
          sol=nx;
        }
        fill=0;for(var f=0;f<SZ*SZ;f++)fill+=sol[f];
        // "interesting" = enough rows AND cols whose clue has 2+ runs; one
        // smoothing pass keeps texture, this reroll kills the giant-blob boards
        interest=0;var need=Math.max(2,Math.floor(SZ/3));
        var ri=0;for(var r5=0;r5<SZ;r5++)if(segs(rowCells(sol,r5)).length>=2)ri++;
        var ci=0;for(var c5=0;c5<SZ;c5++)if(segs(colCells(sol,c5)).length>=2)ci++;
        interest=(ri>=need&&ci>=need)?1:0;tries++;
      }while(tries<40&&(fill<SZ*SZ*0.3||fill>SZ*SZ*0.65||!interest));
      bd=new Array(SZ*SZ).fill(0);won=false;
      rowC=[];for(var r2=0;r2<SZ;r2++)rowC.push(segs(rowCells(sol,r2)));
      colC=[];for(var c2=0;c2<SZ;c2++)colC.push(segs(colCells(sol,c2)));}
    function rn(){
      // responsive cells: 52px cap, shrinks so 10\u00d710/12\u00d712 fit a phone (was fixed 52px overflow)
      var cs=Math.max(22,Math.min(52,Math.floor(((a.clientWidth||window.innerWidth||360)-104)/SZ)));
      var h='<table style="border-collapse:collapse;margin:0 auto"><tr><td></td>';
      for(var c=0;c<SZ;c++){var cSat=eqA(segs(colCells(bd,c)),colC[c]);
        h+='<td style="text-align:center;font-size:.65rem;color:'+(cSat?'rgba(138,145,120,.4)':'var(--sage)')+';padding:2px;vertical-align:bottom;line-height:1.3;font-family:DM Mono,monospace">'+colC[c].join('<br>')+'</td>';}
      h+='</tr>';
      for(var r=0;r<SZ;r++){var rSat=eqA(segs(rowCells(bd,r)),rowC[r]);
        h+='<tr><td style="text-align:right;font-size:.65rem;color:'+(rSat?'rgba(138,145,120,.4)':'var(--sage)')+';padding:0 6px;font-family:DM Mono,monospace;white-space:nowrap">'+rowC[r].join(' ')+'</td>';
        for(var c3=0;c3<SZ;c3++){var i=r*SZ+c3;
          h+='<td style="width:'+cs+'px;height:'+cs+'px;border:1px solid rgba(74,124,53,.18);text-align:center;cursor:pointer;background:'+(bd[i]===1?'rgba(74,124,53,.4)':bd[i]===2?'rgba(199,80,80,.08)':'rgba(26,31,23,.6)')+';border-radius:3px;font-size:'+Math.max(10,Math.round(cs*0.42))+'px" onclick="_XT('+i+')">'+(bd[i]===2?'\u2715':'')+'</td>';}
        h+='</tr>';}
      h+='</table>';w.innerHTML=h;
      if(won)return;
      // WIN = every row and column clue satisfied. ANY valid arrangement counts \u2014
      // the old exact-picture compare made alternate logical solutions unwinnable
      // (rigged-feeling; fixed 2026-07-03).
      var win=bd.some(function(v){return v===1;});
      if(win)for(var r4=0;r4<SZ&&win;r4++)if(!eqA(segs(rowCells(bd,r4)),rowC[r4]))win=false;
      if(win)for(var c4=0;c4<SZ&&win;c4++)if(!eqA(segs(colCells(bd,c4)),colC[c4]))win=false;
      if(win){won=true;_e('game_win');_playWin();_sr('picross',{w:true,s:SZ*SZ});
        // Ceremony — light up every filled cell one-by-one, then overlay
        var cells=w.querySelectorAll('table td');var fillCells=[];for(var ci=0;ci<cells.length;ci++){var style=cells[ci].getAttribute('style')||'';if(style.indexOf('rgba(74,124,53,.4)')>=0)fillCells.push(cells[ci]);}
        fillCells.forEach(function(cell,ii){_xtm.push(setTimeout(function(){cell.style.background='rgba(122,179,86,0.7)';cell.style.boxShadow='0 0 10px rgba(122,179,86,0.6)';cell.style.transition='all .3s ease';},ii*40));});
        _xtm.push(setTimeout(function(){
          var ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,rgba(122,179,86,0.3) 0%,rgba(13,16,12,0.92) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:xLineIn .3s ease;';
          ov.innerHTML='<div style="position:relative;width:140px;height:140px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;inset:0;border:3px solid rgba(122,179,86,0.5);border-radius:50%;animation:xRevealRing 1.2s ease-out;"></div><div style="position:absolute;inset:0;border:2px solid rgba(200,168,75,0.5);border-radius:50%;animation:xRevealRing 1.2s ease-out .3s;"></div><div style="animation:xBloomPop .7s cubic-bezier(.18,1.5,.3,1);filter:drop-shadow(0 0 20px rgba(122,179,86,0.8));"><img src="assets/fx/bloom-leaf.png" alt="" style="width:96px;height:96px;object-fit:contain;display:block;"></div></div><div style="font-family:Georgia,serif;font-size:1.8rem;font-weight:700;color:#7ab356;letter-spacing:0.1em;margin-top:16px;animation:xLineIn .5s ease-out .3s both;">REVEALED</div><div style="font-family:Georgia,serif;font-style:italic;font-size:0.85rem;color:#e8dcc8;margin-top:6px;animation:xLineIn .5s ease-out .55s both;">'+SZ+'×'+SZ+' grid solved</div><button onclick="this.parentElement.remove();_XN()" style="margin-top:24px;min-height:44px;padding:10px 24px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:8px;letter-spacing:0.05em;cursor:pointer;animation:xLineIn .5s ease-out .8s both;">↻ New Grid</button>';
          ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
          document.body.appendChild(ov);
        }, fillCells.length*40 + 300));
      }}
    window._XT=function(i){if(won)return;bd[i]=bd[i]===0?1:bd[i]===1?2:0;var correct=0;for(var j=0;j<SZ*SZ;j++){if(sol[j]===1&&bd[j]===1)correct++;}if(correct>0&&correct%5===0)_e('progress');_play('tap');rn()};window._XN=function(){_xClear();SZ=parseInt((document.getElementById('Xd')||{}).value)||5;gen();sm('');rn()};if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(_xClear);_XN();}

  window._gameFns['picross']=GX;
})();
