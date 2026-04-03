// ═══ LUCID WINDS — Merge Garden ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GR(a){
  // Plant tile hashes — progression from bare seed to cosmic specimen
  var _TH={
    2:'0000000111000000000000000000000000000000000000000000000000000000',
    4:'0112011151000000000000000000000000000000000000000000000000000000',
    8:'0224022015000000000000000000000000000000000000000000000000000000',
    16:'0336033010000000000000000000000000000000000000000000000000000000',
    32:'0548044051000000000000000000000000000000000000000000000000000000',
    64:'06d5033105805100000000000000000000000000000000000000000000000000',
    128:'07d8043015801300000000000000000000000000000000000000000000000000',
    256:'0bd9044015804400000008000000000000000000000000000000000000000000',
    512:'08da04401a80a400500009000000000000000000000000000000000000000000',
    1024:'09dc044fb081240090f80f000000000000000000000000000000000000000000',
    2048:'0fdf044fbff16400f0ff0f000000000000000000000000000000000000000000'
  };
  var ST={};
  (function(){
    var gen=window._generatePlantSVG;
    if(!gen)return;
    var vals=[2,4,8,16,32,64,128,256,512,1024,2048];
    for(var i=0;i<vals.length;i++){
      try{ST[vals[i]]=gen(_TH[vals[i]],56);}catch(e){ST[vals[i]]='🌱';}
    }
  })();
  var g=new Array(16).fill(0),sc=0,bt=2,ov=false,busy=false;
  ms(a,'🏆 <strong id="Rs">0</strong> · Best: <strong id="Rb">2</strong>');mm(a);

  // Grid container — CSS grid provides the cell positions
  var bd=document.createElement('div');bd.className='tb';bd.id='Rb2';
  bd.style.position='relative';
  a.appendChild(bd);

  // 16 static background cells (empty squares that never move)
  for(var ci=0;ci<16;ci++){
    var cell=document.createElement('div');
    cell.className='tc t0';
    bd.appendChild(cell);
  }

  // Direction buttons
  var db=document.createElement('div');
  db.style.cssText='display:flex;justify-content:center;gap:clamp(8px,3vw,14px);padding:clamp(10px,3vw,16px)';
  db.innerHTML='<button class="gb" style="min-width:64px;min-height:64px;font-size:1.5rem;padding:12px 18px" onclick="_Rm(\'left\')">⬅</button><button class="gb" style="min-width:64px;min-height:64px;font-size:1.5rem;padding:12px 18px" onclick="_Rm(\'up\')">⬆</button><button class="gb" style="min-width:64px;min-height:64px;font-size:1.5rem;padding:12px 18px" onclick="_Rm(\'down\')">⬇</button><button class="gb" style="min-width:64px;min-height:64px;font-size:1.5rem;padding:12px 18px" onclick="_Rm(\'right\')">➡</button>';
  a.appendChild(db);
  mc(a).innerHTML='<button class="gb" onclick="_RN()">🔄 New</button>';

  // Tile tracking — each active tile is an object {el, val, idx}
  var tiles=[];
  var tileId=0;

  // Get pixel position for a grid index (0-15)
  function posOf(idx){
    var gap=parseFloat(getComputedStyle(bd).gap)||6;
    var cellW=(bd.clientWidth-gap*3-parseFloat(getComputedStyle(bd).paddingLeft)*2)/4;
    if(cellW<=0) cellW=60;
    var pad=parseFloat(getComputedStyle(bd).paddingLeft)||8;
    var col=idx%4, row=Math.floor(idx/4);
    return {x:pad+col*(cellW+gap), y:pad+row*(cellW+gap), w:cellW};
  }

  // Create a tile DOM element at grid index with value
  function mkTile(idx,val,animate){
    var p=posOf(idx);
    var el=document.createElement('div');
    el.className='tc t'+Math.min(val,2048);
    el.style.cssText='position:absolute;left:'+p.x+'px;top:'+p.y+'px;width:'+p.w+'px;height:'+p.w+'px;'
      +'transition:left 150ms ease,top 150ms ease,transform 150ms ease,opacity 100ms ease;'
      +'z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    el.innerHTML='<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px">'+'<div class="ti" style="flex:1;width:100%;display:flex;align-items:center;justify-content:center">'+(ST[Math.min(val,2048)]||'🔥')+'</div>'+'<div style="font-size:clamp(.9rem,3vw,1.3rem);color:rgba(232,220,200,0.95);font-weight:800;font-family:DM Mono,monospace;text-shadow:0 1px 3px rgba(0,0,0,0.4);line-height:1;padding-bottom:4px">'+val+'</div></div>';
    if(animate){
      el.style.transform='scale(0)';
      setTimeout(function(){el.style.transform='scale(1)'},20);
    }
    bd.appendChild(el);
    var t={el:el,val:val,idx:idx,id:++tileId};
    tiles.push(t);
    return t;
  }

  // Remove a tile from DOM and tracking
  function rmTile(t){
    if(t.el&&t.el.parentNode)t.el.parentNode.removeChild(t.el);
    var i=tiles.indexOf(t);
    if(i>-1)tiles.splice(i,1);
  }

  // Move a tile element to a new grid index (animates via CSS transition)
  function mvTile(t,newIdx){
    var p=posOf(newIdx);
    t.el.style.left=p.x+'px';
    t.el.style.top=p.y+'px';
    t.idx=newIdx;
  }

  // Full redraw (no animation — used for new game and resize)
  function fullRedraw(){
    for(var i=tiles.length-1;i>=0;i--)rmTile(tiles[i]);
    tiles=[];
    for(var i=0;i<16;i++){
      if(g[i])mkTile(i,g[i],false);
    }
    document.getElementById('Rs').textContent=sc;
  }

  // Spawn a new tile in a random empty cell
  function sp(animate){
    var e=[];
    for(var i=0;i<16;i++)if(g[i]===0)e.push(i);
    if(!e.length)return;
    var idx=e[Math.floor(Math.random()*e.length)];
    var val=Math.random()<.9?2:4;
    g[idx]=val;
    mkTile(idx,val,animate!==false);
  }

  // Slide and merge one row/col array, return {result, moves}
  function sl(arr,indices){
    var moves=[];
    var x=[];
    var xi=[];
    for(var i=0;i<arr.length;i++){
      if(arr[i]){x.push(arr[i]);xi.push(indices[i]);}
    }
    var res=new Array(4).fill(0);
    var ri=0;
    for(var i=0;i<x.length;i++){
      if(i+1<x.length&&x[i]===x[i+1]){
        var nv=x[i]*2;
        res[ri]=nv;
        moves.push({from:xi[i],to:indices[ri],val:x[i],merge:true});
        moves.push({from:xi[i+1],to:indices[ri],val:x[i+1],merge:true,remove:true});
        sc+=nv;
        if(nv>bt){bt=nv;document.getElementById('Rb').textContent=bt;
          if([64,128,256,512,1024,2048].indexOf(nv)>-1)_e('reached_'+nv);
        }
        ri++;i++;
      } else {
        res[ri]=x[i];
        moves.push({from:xi[i],to:indices[ri],val:x[i],merge:false});
        ri++;
      }
    }
    return {result:res,moves:moves};
  }

  // Main move function
  window._Rm=function(d){
    if(ov||busy)return;
    var o=g.slice();
    var allMoves=[];

    if(d==='left'){
      for(var r=0;r<4;r++){
        var idx=[r*4,r*4+1,r*4+2,r*4+3];
        var row=[g[idx[0]],g[idx[1]],g[idx[2]],g[idx[3]]];
        var res=sl(row,idx);
        for(var c=0;c<4;c++)g[r*4+c]=res.result[c];
        allMoves=allMoves.concat(res.moves);
      }
    } else if(d==='right'){
      for(var r=0;r<4;r++){
        var idx=[r*4+3,r*4+2,r*4+1,r*4];
        var row=[g[idx[0]],g[idx[1]],g[idx[2]],g[idx[3]]];
        var res=sl(row,idx);
        for(var c=0;c<4;c++){g[idx[c]]=res.result[c];}
        allMoves=allMoves.concat(res.moves);
      }
    } else if(d==='up'){
      for(var c=0;c<4;c++){
        var idx=[c,c+4,c+8,c+12];
        var col=[g[idx[0]],g[idx[1]],g[idx[2]],g[idx[3]]];
        var res=sl(col,idx);
        for(var r=0;r<4;r++)g[idx[r]]=res.result[r];
        allMoves=allMoves.concat(res.moves);
      }
    } else if(d==='down'){
      for(var c=0;c<4;c++){
        var idx=[c+12,c+8,c+4,c];
        var col=[g[idx[0]],g[idx[1]],g[idx[2]],g[idx[3]]];
        var res=sl(col,idx);
        for(var r=0;r<4;r++)g[idx[r]]=res.result[r];
        allMoves=allMoves.concat(res.moves);
      }
    }

    // Check if anything changed
    var ch=false;
    for(var i=0;i<16;i++)if(g[i]!==o[i]){ch=true;break;}
    if(!ch)return;

    busy=true;

    // Animate existing tiles to new positions
    for(var m=0;m<allMoves.length;m++){
      var mv=allMoves[m];
      // Find the tile at the source position
      for(var t=0;t<tiles.length;t++){
        if(tiles[t].idx===mv.from&&tiles[t].val===mv.val){
          mvTile(tiles[t],mv.to);
          if(mv.remove)tiles[t]._remove=true;
          break;
        }
      }
    }

    // After animation completes, clean up merges, spawn new, check game over
    setTimeout(function(){
      // Remove merged-away tiles
      for(var t=tiles.length-1;t>=0;t--){
        if(tiles[t]._remove)rmTile(tiles[t]);
      }
      // Update surviving tiles: sync value with g[] and refresh visuals
      for(var t=0;t<tiles.length;t++){
        var ti=tiles[t];
        var nv=g[ti.idx];
        if(nv&&nv!==ti.val){
          ti.val=nv;
          ti.el.className='tc t'+Math.min(nv,2048);
          ti.el.querySelector('.ti').innerHTML=ST[Math.min(nv,2048)]||'🔥';
          ti.el.querySelector('.ti').parentNode.lastElementChild.textContent=nv;
          ti.el.classList.add('pop');setTimeout((function(e){return function(){e.classList.remove('pop')}})(ti.el),200);
        }
      }
      var _rsEl=document.getElementById('Rs');if(_rsEl)_rsEl.textContent=sc;

      sp(true);

      // Check game over
      var go=true;
      for(var i=0;i<16;i++){
        if(!g[i]||i%4<3&&g[i]===g[i+1]||i<12&&g[i]===g[i+4]){go=false;break;}
      }
      if(go){ov=true;_e('game_loss');_play('lose');sm('🍂 No moves! '+sc);_sr('merge',{w:false,s:sc});}
      busy=false;
    },160);
  };

  // Swipe handling
  bd.addEventListener('touchstart',function(e){bd._sx=e.touches[0].clientX;bd._sy=e.touches[0].clientY;},{passive:true});
  bd.addEventListener('touchend',function(e){if(bd._sx===undefined)return;var dx=e.changedTouches[0].clientX-bd._sx,dy=e.changedTouches[0].clientY-bd._sy;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;if(Math.abs(dx)>Math.abs(dy))_Rm(dx>0?'right':'left');else _Rm(dy>0?'down':'up');bd._sx=bd._sy=undefined;},{passive:true});

  // Keyboard handling
  document.addEventListener('keydown',function(e){var m={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(m[e.key]&&_a==='merge'){e.preventDefault();_Rm(m[e.key]);}});

  // New game
  window._RN=function(){g=new Array(16).fill(0);sc=0;bt=2;ov=false;busy=false;
    document.getElementById('Rb').textContent='2';
    for(var t=tiles.length-1;t>=0;t--)rmTile(tiles[t]);
    tiles=[];
    sp(false);sp(false);
    document.getElementById('Rs').textContent='0';
  };
  _RN();
}

window._gameFns.merge=GR;
})();
