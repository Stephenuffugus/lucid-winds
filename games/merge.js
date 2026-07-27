// ═══ LUCID WINDS — Merge Garden ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GR(a){
  // ── Tile art: pre-rendered REAL LW plant SVGs (assets/games/merge/plant-*.svg,
  // baked from _generatePlantSVG Jul 17 via scripts — the live renderer only
  // exists inside the LW app, so the portal shell used to downgrade to a stub
  // sprout; the baked files give every surface the true art).
  // Sheet themes activate when their art drops (prompt packs: art-asset-lists/merge/).
  var THEMES=[
    {key:'grove', name:'Midnight Grove', kind:'svg',   wired:true,  unlock:0},
    {key:'ember', name:'Ember Forge',    kind:'sheet', wired:true,  unlock:256},
    {key:'tide',  name:'Tidepool',       kind:'sheet', wired:true,  unlock:512},
    {key:'cosmos',name:'Tiny Cosmos',    kind:'sheet', wired:true,  unlock:1024},
    {key:'sugar', name:'Sugar Rush',     kind:'sheet', wired:true,  unlock:2048}
  ];
  var MK='lw_merge_maxtile';
  function gMax(){try{return parseInt(localStorage.getItem(MK),10)||0;}catch(e){return 0;}}
  function sMax(v){try{if(v>gMax())localStorage.setItem(MK,String(v));}catch(e){}}
  var _thCur=(function(){
    var k='grove';
    try{k=localStorage.getItem('lw_merge_theme')||'grove';}catch(e){}
    for(var i=0;i<THEMES.length;i++)if(THEMES[i].key===k&&THEMES[i].wired&&THEMES[i].unlock<=gMax())return THEMES[i];
    return THEMES[0];
  })();
  function tileArt(val){
    var v=Math.min(val,2048);
    // Stephen 2026-07-27: the plants read tiny on the cards — the SVGs are tall
    // (70x95), so contain-fit letterboxes them hard in a square tile. Scaled up
    // 1.55x; the spill past the tile edge is transparent margin, and overflow
    // stays visible on the tile stack. Sheet themes keep 100%: their tile art is
    // painted to a deliberate size ladder (45%->90%) and must not be inflated.
    // Grove serves baked PNGs (scripts/bake_merge_tiles.js), not the raw SVGs:
    // each plant SVG is ~400 paths + Gaussian blurs, and 16 of them re-rasterizing
    // on every merge is what made the board crawl. Same art, bitmap decode.
    if(_thCur.kind==='svg')return '<img src="assets/games/merge/plant-'+v+'.png" style="width:100%;height:100%;object-fit:contain;pointer-events:none;transform:scale(1.55);transform-origin:center 58%" alt="">';
    return '<img src="assets/games/merge/themes/'+_thCur.key+'/t'+v+'.png" style="width:100%;height:100%;object-fit:contain;pointer-events:none" alt="">';
  }
  // Warm the current theme's 11 tile images up front — without this the first
  // merge to each new value stalls on a network fetch mid-animation.
  function _warm(){
    var vals=[2,4,8,16,32,64,128,256,512,1024,2048];
    for(var i=0;i<vals.length;i++){
      var im=new Image();
      im.src=_thCur.kind==='svg'?'assets/games/merge/plant-'+vals[i]+'.png':'assets/games/merge/themes/'+_thCur.key+'/t'+vals[i]+'.png';
    }
  }
  _warm();
  var g=new Array(16).fill(0),sc=0,bt=2,ov=false,busy=false,won=false;
  // Best = best SCORE, persisted (2026-07-03: was best-tile-this-session,
  // reset to 2 on every new game — meaningless as a record).
  var BK='lw_merge_best',_recordThisGame=false;
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){var o=document.getElementById('R-over');if(o)o.remove();var th=document.getElementById('RThemeOv');if(th)th.remove();if(window._RmergeRs){window.removeEventListener('resize',window._RmergeRs);window._RmergeRs=null;}});
  function gBest(){try{return parseInt(localStorage.getItem(BK),10)||0;}catch(e){return 0;}}
  function sBest(v){try{localStorage.setItem(BK,String(v));}catch(e){}}
  ms(a,'🏆 <strong id="Rs">0</strong> · Best: <strong id="Rb">'+gBest()+'</strong>');mm(a);

  // Grid container — CSS grid provides the cell positions
  var bd=document.createElement('div');bd.className='tb';bd.id='Rb2';
  bd.style.position='relative';
  // Bigger board (Stephen 2026-07-27). Inline so it wins over shared.css's
  // clamp(280px,88vw,400px) without touching the fleet-wide stylesheet — only
  // this game uses .tb. posOf() reads clientWidth, so cells scale with it.
  bd.style.width='min(96vw,480px)';
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
  mc(a).innerHTML='<button class="gb" onclick="_RN()">↻ New Game</button><button class="gb" onclick="_RThemeOv(1)">✿ Themes</button>';

  // ── Theme picker overlay ──
  function _thBuildOv(){
    var old=document.getElementById('RThemeOv');
    if(old&&old.parentNode)old.parentNode.removeChild(old);
    var ov=document.createElement('div');ov.id='RThemeOv';
    ov.style.cssText='display:none;position:fixed;inset:0;background:rgba(8,10,6,.96);z-index:99997;overflow-y:auto;padding:16px;backdrop-filter:blur(10px)';
    var mx=gMax();
    var h='<div style="max-width:440px;margin:0 auto">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
    h+='<div style="font-family:\'Bebas Neue\',sans-serif;font-size:1.1rem;letter-spacing:.08em;color:var(--gold)">GARDEN THEMES</div>';
    h+='<button class="gb" onclick="_RThemeOv(0)">✕ Close</button></div>';
    for(var i=0;i<THEMES.length;i++){
      var t=THEMES[i];
      var open=t.unlock<=mx;
      var pick=open&&t.wired;
      var thumb=t.kind==='svg'?'<img src="assets/games/merge/plant-2048.png" style="width:52px;height:52px;object-fit:contain">':(t.wired?'<img src="assets/games/merge/themes/'+t.key+'/t2048.png" style="width:52px;height:52px;object-fit:contain">':'<span style="font-family:\'Bebas Neue\',sans-serif;font-size:'+(open?'0.7rem':'1.05rem')+';color:var(--muted);letter-spacing:.05em">'+(open?'SOON':t.unlock)+'</span>');
      var sub=pick?(t.key===_thCur.key?'in bloom now':'tap to plant this look')
        :(open?'unlocked · art arriving soon':'grow a '+t.unlock+' bloom to unlock');
      h+='<div onclick="'+(pick?'_RTheme(\''+t.key+'\')':'')+'" style="display:flex;align-items:center;gap:12px;background:rgba(18,24,16,.85);border:1px solid '+(t.key===_thCur.key?'var(--gold)':'rgba(74,124,53,.25)')+';border-radius:12px;padding:10px 14px;margin-bottom:10px;min-height:64px;'+(pick?'cursor:pointer':'opacity:.62')+'">';
      h+='<div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+thumb+'</div>';
      h+='<div><div style="color:var(--cream);font-family:Georgia,serif;font-weight:700;font-size:.92rem">'+t.name+'</div>';
      h+='<div style="color:var(--muted);font-family:\'DM Mono\',monospace;font-size:.62rem;margin-top:3px">'+sub+'</div></div></div>';
    }
    h+='<div style="color:var(--muted);font-size:.6rem;font-family:\'DM Mono\',monospace;text-align:center;padding:6px 0 14px">grow bigger blooms to unlock new gardens</div></div>';
    ov.innerHTML=h;
    document.body.appendChild(ov);
    return ov;
  }
  window._RThemeOv=function(open){
    var ov=document.getElementById('RThemeOv')||_thBuildOv();
    if(open){ov=_thBuildOv();ov.style.display='block';}
    else ov.style.display='none';
  };
  window._RTheme=function(key){
    for(var i=0;i<THEMES.length;i++){
      if(THEMES[i].key===key&&THEMES[i].wired&&THEMES[i].unlock<=gMax()){
        _thCur=THEMES[i];
        try{localStorage.setItem('lw_merge_theme',key);}catch(e){}
        _warm();
        _play('click');
        window._RThemeOv(0);
        fullRedraw();
        return;
      }
    }
  };

  // Tile tracking — each active tile is an object {el, val, idx}
  var tiles=[];
  var tileId=0;

  // Get pixel position for a grid index (0-15). Board metrics are cached —
  // the old version ran getComputedStyle twice per tile per move (up to ~32
  // forced style recalcs a swipe). Cache invalidates on resize.
  var _pm=null;
  function _metrics(){
    if(_pm)return _pm;
    var cs=getComputedStyle(bd);
    var gap=parseFloat(cs.gap)||6;
    var pad=parseFloat(cs.paddingLeft)||8;
    var cellW=(bd.clientWidth-gap*3-pad*2)/4;
    if(cellW<=0)cellW=60;
    _pm={gap:gap,pad:pad,w:cellW};
    return _pm;
  }
  function posOf(idx){
    var m=_metrics();
    var col=idx%4, row=Math.floor(idx/4);
    return {x:m.pad+col*(m.w+m.gap), y:m.pad+row*(m.w+m.gap), w:m.w};
  }
  function _onRs(){_pm=null;fullRedraw();}
  if(window._RmergeRs)window.removeEventListener('resize',window._RmergeRs);
  window._RmergeRs=_onRs;
  window.addEventListener('resize',_onRs);

  // Create a tile DOM element at grid index with value
  function mkTile(idx,val,animate){
    var p=posOf(idx);
    var el=document.createElement('div');
    el.className='tc t'+Math.min(val,2048);
    el.style.cssText='position:absolute;left:0;top:0;width:'+p.w+'px;height:'+p.w+'px;'
      +'transform:translate('+p.x+'px,'+p.y+'px);'
      +'transition:transform 120ms ease-out,opacity 100ms ease;'
      +'z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    el._tx=p.x;el._ty=p.y;
    el.innerHTML='<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px">'+'<div class="ti" style="flex:1;width:100%;display:flex;align-items:center;justify-content:center;min-height:0">'+tileArt(val)+'</div>'+'<div style="font-size:clamp(.9rem,3vw,1.3rem);color:rgba(232,220,200,0.95);font-weight:800;font-family:DM Mono,monospace;text-shadow:0 1px 3px rgba(0,0,0,0.4);line-height:1;padding-bottom:4px">'+val+'</div></div>';
    if(animate){
      el.style.transform='translate('+p.x+'px,'+p.y+'px) scale(0)';
      setTimeout(function(){el.style.transform='translate('+p.x+'px,'+p.y+'px) scale(1)';
        setTimeout(function(){el.style.transform='translate('+p.x+'px,'+p.y+'px)';},180);
      },20);
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
    t.el.style.transform='translate('+p.x+'px,'+p.y+'px)';
    t.el._tx=p.x;t.el._ty=p.y;
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
        if(nv>bt){bt=nv;
          // theme unlocks ride the best-tile-ever ladder
          var _wasMax=gMax();sMax(nv);
          if(nv>_wasMax){
            for(var _u=0;_u<THEMES.length;_u++){
              if(THEMES[_u].unlock>_wasMax&&THEMES[_u].unlock<=nv&&THEMES[_u].unlock>0){
                sm(THEMES[_u].wired?('🎨 Theme unlocked: '+THEMES[_u].name+'!'):('🎨 '+THEMES[_u].name+' theme unlocked — art arriving soon!'));
              }
            }
          }
          if([64,128,256,512,1024,2048].indexOf(nv)>-1)_e('reached_'+nv);
          // Reaching 2048 is the canonical win condition. Fire it
          // exactly once per game so the player gets the standard
          // win reward + celebration on first 2048 tile.
          if(nv===2048&&!won){won=true;_e('game_win');if(_playWin)_playWin();sm('🌿 You reached 2048! Keep going for a higher score.');_sr('merge',{w:true,s:sc});}
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

  // Main move function. A swipe that lands during the 160ms animation lock is
  // QUEUED (last one wins) instead of eaten — dropped inputs were half of why
  // fast play felt sluggish.
  var pend=null;
  window._Rm=function(d){
    if(ov)return;
    if(busy){pend=d;return;}
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

    // Stephen 2026-05-11: fire match sound once per move that contained
    // any merge. Chain merges in one swipe still only ping once — feels
    // like a "tile success" beat, not a rapid-fire noise.
    var _anyMerged=false;
    for(var _mm=0;_mm<allMoves.length;_mm++)if(allMoves[_mm].merge&&!allMoves[_mm].remove){_anyMerged=true;break;}
    if(_anyMerged)_play('match');

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
          ti.el.querySelector('.ti').innerHTML=tileArt(nv);
          ti.el.querySelector('.ti').parentNode.lastElementChild.textContent=nv;
          // pop the inner wrapper, NOT the positioned tile — a transform
          // animation on the tile itself erases its translate(x,y) and it
          // flashes at the board corner (Stephen bug report Jul 17)
          var _pw=ti.el.firstElementChild;
          if(_pw){_pw.classList.add('tin-pop');setTimeout((function(e){return function(){e.classList.remove('tin-pop')}})(_pw),220);}
        }
      }
      var _rsEl=document.getElementById('Rs');if(_rsEl)_rsEl.textContent=sc;
      if(sc>gBest()){_recordThisGame=true;sBest(sc);var _rbEl=document.getElementById('Rb');if(_rbEl)_rbEl.textContent=sc;}

      sp(true);

      // Check game over
      var go=true;
      for(var i=0;i<16;i++){
        if(!g[i]||i%4<3&&g[i]===g[i+1]||i<12&&g[i]===g[i+4]){go=false;break;}
      }
      if(go){ov=true;_e('game_loss');_play('lose');sm('🍂 No moves! '+sc);_sr('merge',{w:false,s:sc});_RGameOver();}
      busy=false;
      if(pend&&!ov){var p=pend;pend=null;window._Rm(p);}else pend=null;
    },160);
  };

  // Swipe handling
  bd.addEventListener('touchstart',function(e){bd._sx=e.touches[0].clientX;bd._sy=e.touches[0].clientY;},{passive:true});
  bd.addEventListener('touchend',function(e){if(bd._sx===undefined)return;var dx=e.changedTouches[0].clientX-bd._sx,dy=e.changedTouches[0].clientY-bd._sy;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;if(Math.abs(dx)>Math.abs(dy))_Rm(dx>0?'right':'left');else _Rm(dy>0?'down':'up');bd._sx=bd._sy=undefined;},{passive:true});

  // Keyboard handling — only fire while the merge board is in the DOM
  if(!window._RmergeKeyBound){
    window._RmergeKeyBound=true;
    document.addEventListener('keydown',function(e){
      var m={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
      if(!m[e.key])return;
      var active=document.getElementById('Rb')||document.getElementById('Rs');
      if(!active)return;
      e.preventDefault();
      if(window._RmergeMove)window._RmergeMove(m[e.key]);
    });
  }
  window._RmergeMove=_Rm;

  // Game-over overlay — a proper ending with the score, the record, and a
  // one-tap retry (2026-07-03: game over used to be a status-bar whisper).
  function _RGameOver(){
    var old=document.getElementById('R-over');if(old)old.remove();
    var isRecord=_recordThisGame&&sc>0;   // strictly beat the old record this game (a tie is not NEW BEST)
    for(var gi=0;gi<16;gi++)if(g[gi]>bt)bt=g[gi];   // count spawned tiles too, not just merges
    sMax(bt);
    var ovl=document.createElement('div');ovl.id='R-over';
    ovl.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,rgba(199,106,48,0.22) 0%,rgba(13,16,12,0.92) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;';
    ovl.innerHTML='<div style="font-size:3rem;line-height:1;">🍂</div>'
      +'<div style="font-family:Georgia,serif;font-size:1.6rem;font-weight:700;color:#c8a84b;letter-spacing:0.08em;margin-top:12px;">GARDEN FULL</div>'
      +'<div style="font-family:Georgia,serif;font-size:1.05rem;color:#e8dcc8;margin-top:10px;">Score <b style="color:#c8a84b">'+sc+'</b>'+(isRecord?'  ·  <span style="color:#7ab356">★ NEW BEST</span>':'  ·  Best <b style="color:#c8a84b">'+gBest()+'</b>')+'</div>'
      +'<div style="font-family:Georgia,serif;font-style:italic;font-size:0.8rem;color:#8a9178;margin-top:6px;">biggest bloom: '+bt+'</div>'
      +'<button id="R-again" style="margin-top:22px;min-height:48px;padding:12px 28px;font-family:Georgia,serif;font-weight:700;font-size:0.9rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:10px;letter-spacing:0.05em;cursor:pointer;">↻ PLANT AGAIN</button>'
      +'<button id="R-view" style="margin-top:10px;min-height:44px;padding:8px 20px;background:transparent;border:1px solid rgba(138,145,120,0.4);color:#8a9178;border-radius:10px;font-size:0.75rem;cursor:pointer;">view the board</button>';
    ovl.querySelector('#R-again').onclick=function(){ovl.remove();window._RN();};
    ovl.querySelector('#R-view').onclick=function(){ovl.remove();};
    ovl.onclick=function(ev){if(ev.target===ovl)ovl.remove();};
    document.body.appendChild(ovl);
  }

  // New game
  window._RN=function(){g=new Array(16).fill(0);sc=0;bt=2;ov=false;busy=false;won=false;_recordThisGame=false;pend=null;
    var _ro=document.getElementById('R-over');if(_ro)_ro.remove();
    var _rbN=document.getElementById('Rb');if(_rbN)_rbN.textContent=String(gBest());else return;
    for(var t=tiles.length-1;t>=0;t--)rmTile(tiles[t]);
    tiles=[];
    sp(false);sp(false);
    var _rsN=document.getElementById('Rs');if(_rsN)_rsN.textContent='0';
  };
  _RN();
}

window._gameFns.merge=GR;
})();
