// ═══ LUCID WINDS — Vine Flow (Pipe) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GPP(a){var SZ=6,grid=[],_rc=0,srcI=0,endI=0,won=false;
  var VI='assets/games/pipe/';
  var IMG_ST=VI+'vine-straight.png',IMG_CR=VI+'vine-corner.png',IMG_SR=VI+'vine-source.png',IMG_EN=VI+'vine-end.png';
  var EX_ST=[1,0,1,0],EX_CR=[1,1,0,0],EX_EN=[0,0,0,1];
  ms(a,'<span id="PPc">0</span>/'+SZ*SZ+' vines');mm(a);
  var gd=document.createElement('div');gd.className='lg';gd.id='PP';gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';gd.style.gap='2px';gd.style.width='clamp(300px,92vw,420px)';a.appendChild(gd);
  mc(a).innerHTML='<button class="gb-new" onclick="_PPN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function dirOf(f,t){var d=t-f;return d===-SZ?0:d===1?1:d===SZ?2:d===-1?3:-1}
  function adjCnt(ci,vis){var cy=Math.floor(ci/SZ),cx=ci%SZ,c=0;if(cy>0&&!vis[ci-SZ])c++;if(cx<SZ-1&&!vis[ci+1])c++;if(cy<SZ-1&&!vis[ci+SZ])c++;if(cx>0&&!vis[ci-1])c++;return c}
  function makePath(){
    var vis=[];for(var i=0;i<SZ*SZ;i++)vis.push(false);
    var path=[0];vis[0]=true;
    while(path.length<SZ*SZ){
      var cur=path[path.length-1],cy=Math.floor(cur/SZ),cx=cur%SZ,nb=[];
      if(cy>0&&!vis[cur-SZ])nb.push(cur-SZ);if(cx<SZ-1&&!vis[cur+1])nb.push(cur+1);
      if(cy<SZ-1&&!vis[cur+SZ])nb.push(cur+SZ);if(cx>0&&!vis[cur-1])nb.push(cur-1);
      if(!nb.length)break;
      nb.sort(function(x,y){return adjCnt(x,vis)-adjCnt(y,vis)});
      var mn=adjCnt(nb[0],vis),ties=[];
      for(var t=0;t<nb.length;t++){if(adjCnt(nb[t],vis)===mn)ties.push(nb[t])}
      var pick=ties[Math.floor(Math.random()*ties.length)];
      path.push(pick);vis[pick]=true;
    }
    return path;
  }
  function gen(){
    grid=[];_rc=0;
    var path=makePath(),tries=0;
    while(path.length<SZ*SZ&&tries<200){path=makePath();tries++}
    srcI=path[0];endI=path[path.length-1];
    for(var i=0;i<SZ*SZ;i++)grid.push(null);
    for(var p=0;p<path.length;p++){
      var ci=path[p];
      if(p===0){
        // Stephen 2026-06-28: the source art (vine-source) read as a 4-way
        // crossroad, so players couldn't tell which way the vine left the
        // START. Use the clean single-exit END cap art for the start too
        // (it has the same one-exit shape, EX_EN), and a big arrow overlay
        // (added in rn()) makes the exit direction unmistakable.
        var d=dirOf(ci,path[1]);var erm=[1,2,3,0];
        grid[ci]={img:IMG_EN,ex:EX_EN,rot:erm[d],fixed:true};
      }else if(p===path.length-1){
        var d=dirOf(ci,path[p-1]);var erm=[1,2,3,0];
        grid[ci]={img:IMG_EN,ex:EX_EN,rot:erm[d],fixed:true};
      }else{
        var d1=dirOf(ci,path[p-1]),d2=dirOf(ci,path[p+1]);
        var lo=Math.min(d1,d2),hi=Math.max(d1,d2);
        if((lo===0&&hi===2)||(lo===1&&hi===3)){
          grid[ci]={img:IMG_ST,ex:EX_ST,rot:lo===0?0:1,fixed:false};
        }else{
          var cm={1:0,6:1,11:2,3:3};
          grid[ci]={img:IMG_CR,ex:EX_CR,rot:cm[lo*4+hi],fixed:false};
        }
      }
    }
    for(var i=0;i<SZ*SZ;i++){if(!grid[i])grid[i]={img:IMG_ST,ex:EX_ST,rot:0,fixed:false}}
    for(var i=0;i<SZ*SZ;i++){if(!grid[i].fixed){var s=Math.floor(Math.random()*3)+1;grid[i].rot=(grid[i].rot+s)%4}}
  }
  function pExit(i){var g=grid[i],r=g.rot%4,e=g.ex.slice();for(var rr=0;rr<r;rr++){e=[e[3],e[0],e[1],e[2]];}return e}
  function _ppCheck(){
    var vis=[];for(var x=0;x<SZ*SZ;x++)vis.push(false);
    var q=[srcI];vis[srcI]=true;var cnt=1;
    while(q.length){var ci=q.shift();var e=pExit(ci);var cy=Math.floor(ci/SZ),cx=ci%SZ;
      var nb=[cy>0?ci-SZ:-1,cx<SZ-1?ci+1:-1,cy<SZ-1?ci+SZ:-1,cx>0?ci-1:-1];
      var op=[2,3,0,1];
      for(var d=0;d<4;d++){var ni=nb[d];if(ni<0||vis[ni])continue;if(e[d]){var ne=pExit(ni);if(ne[op[d]]){vis[ni]=true;q.push(ni);cnt++}}}}
    return {won:vis[endI],count:cnt,vis:vis}}
  function rn(){
    gd.innerHTML='';var st=_ppCheck();var el=document.getElementById('PPc');if(el)el.textContent=st.count;
    for(var i=0;i<SZ*SZ;i++){
      var wrap=document.createElement('div');wrap.style.cssText='position:relative;';
      var d=document.createElement('div');d.className='lc';var g=grid[i];
      d.style.background='url('+g.img+') center/cover #1a1e16';d.style.transform='rotate('+(g.rot*90)+'deg)';d.style.transition='transform 0.15s ease';
      if(st.vis[i])d.style.boxShadow='inset 0 0 12px rgba(122,179,86,.4)';
      if(i===srcI)d.style.boxShadow='0 0 14px rgba(122,179,86,.85),inset 0 0 16px rgba(122,179,86,.55)';
      else if(i===endI)d.style.boxShadow='0 0 14px rgba(200,168,75,.85)'+(st.vis[i]?',inset 0 0 16px rgba(122,179,86,.5)':',inset 0 0 14px rgba(200,168,75,.35)');
      wrap.appendChild(d);
      // Source/end need crystal-clear visual labels — Stephen reported
      // the end "looks like a crossroad". Overlay a 🌱 START / 🌸 FINISH
      // marker in the corner that doesn't rotate with the tile.
      if(i===srcI){
        var s=document.createElement('div');s.style.cssText='position:absolute;top:1px;left:2px;font-size:0.55rem;font-family:Bebas Neue,sans-serif;color:#7ab356;letter-spacing:0.06em;text-shadow:0 0 4px #000,0 0 2px #000;pointer-events:none;z-index:2;';
        s.textContent='🌱 START';wrap.appendChild(s);
        // Big arrow showing exactly which way the vine leaves the start, so
        // it can never read as an ambiguous crossroad (Stephen 2026-06-28).
        var _se=pExit(srcI);var _arr=_se[0]?'↑':_se[1]?'→':_se[2]?'↓':_se[3]?'←':'';
        if(_arr){var ar=document.createElement('div');ar.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold;color:#aef08a;text-shadow:0 0 6px #000,0 0 3px #000;pointer-events:none;z-index:2;';ar.textContent=_arr;wrap.appendChild(ar);}
      } else if(i===endI){
        var f=document.createElement('div');f.style.cssText='position:absolute;top:1px;left:2px;font-size:0.55rem;font-family:Bebas Neue,sans-serif;color:'+(st.won?'#c8a84b':'#e8a0bf')+';letter-spacing:0.06em;text-shadow:0 0 4px #000,0 0 2px #000;pointer-events:none;z-index:2;'+(st.won?'':'animation:pipeBlink 1.4s ease-in-out infinite;');
        f.textContent=st.won?'🌸 BLOOM':'🌸 FINISH';wrap.appendChild(f);
      }
      if(!g.fixed){
        d.setAttribute('data-i',i);
        d.onclick=function(){
          if(won)return; // win latch — rotating filler tiles after the solve used to re-fire game_win per tap
          var idx=parseInt(this.getAttribute('data-i'));
          _play('click');grid[idx].rot=(grid[idx].rot+1)%4;_rc++;rn();
          var res=_ppCheck();
          if(res.won){won=true;_e('game_win');_playWin();sm('🌸 Root reached the bloom! '+_rc+' rotations');_sr('pipe',{w:true,s:_rc});}
        };
      }
      gd.appendChild(wrap);
    }
  }
  // Inject pulse keyframes for the FINISH marker
  if(!document.getElementById('pipe-blink-style')){
    var _ps=document.createElement('style');_ps.id='pipe-blink-style';
    _ps.textContent='@keyframes pipeBlink{0%,100%{opacity:1}50%{opacity:0.5}}';
    document.head.appendChild(_ps);
  }
  window._PPN=function(){gen();won=false;sm('Connect root to bloom');rn()};_PPN();}

window._gameFns.pipe=GPP;
})();
