// ═══ PETAL MATCH — match-3 botanical swap puzzle ═══
// 8x8 grid, swipe adjacent to swap. 3+ in a row clears. Cascades combo.
// Objectives rotate per level: SCORE, DEW (jelly), GATHER (collect), THORNS (blockers), MIX.
// Chapters of 10 levels each: Meadow (0), Summer (1), Autumn (2), Winter (3+).
// Specials: Vine-Wrapped (4-match), Bloom Burst (L/T), Spore Cloud (5-match).
// Art: 6 flower gems drawn procedurally until artist delivers PNGs.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

if(!document.getElementById('pm-special-kf')){
  var _kf=document.createElement('style');
  _kf.id='pm-special-kf';
  _kf.textContent='@keyframes pmVineSpawn{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}@keyframes pmBurstGlow{0%,100%{opacity:0.6}50%{opacity:1}}@keyframes pmSporeSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes pmBanner{0%{opacity:0;transform:translate(-50%,-50%) scale(0.6)}25%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}75%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.3)}}@keyframes pmHintPulse{0%,100%{box-shadow:0 0 0 2px rgba(232,220,200,0.9),0 0 18px rgba(232,220,200,0.6)}50%{box-shadow:0 0 0 2px rgba(232,220,200,1),0 0 28px rgba(232,220,200,1)}}';
  document.head.appendChild(_kf);
}

window._gameFns = window._gameFns || {};
window._gameFns.petalmatch = function PM(a){
  /* ⛔ TYPES STAYS AT 6. Stephen 2026-07-26: the 7th and 8th flowers
     (hydrangea, thistle) are cut and waiting, but they are for EXPANSIONS or
     far-later difficulty, not the base ladder. Raising TYPES makes every single
     level harder at once — fewer matches exist on a board with more colours —
     and the whole measured balance pass was calibrated at 6. If this ever goes
     to 8, re-run scripts/petalmatch_balance.js and expect to retune, do not
     just change the number. Art: base-7-hydrangea.png, base-8-thistle.png. */
  var ROWS=8,COLS=8,TYPES=6,CELL=36;
  var PM_FRAME=14;   // painted board-frame border, in px per side
  /* How much of a cell a painted piece fills. 1.0 = edge to edge. Just under
     that leaves a hairline so neighbouring flowers read as separate pieces
     instead of one carpet. Raise toward 1.0 for a denser board. */
  var PM_FILL=0.96;
  // 6 flower types: rose / daisy / violet / forgetmenot / clover / cherry
  var GEMS=[
    {name:'rose',color:'#c47a7a',mid:'#8b4d4d',hi:'#e8b5b5'},
    {name:'daisy',color:'#e8dcc8',mid:'#c8a84b',hi:'#fff4dc'},
    {name:'violet',color:'#9b6ba3',mid:'#634368',hi:'#c49bc9'},
    {name:'forgetmenot',color:'#5b9bd5',mid:'#34608a',hi:'#9cc4e8'},
    {name:'clover',color:'#7ab356',mid:'#4a7333',hi:'#a8d480'},
    {name:'cherry',color:'#f0b8d0',mid:'#b87090',hi:'#ffd8e4'}
  ];
  // Chapter biomes: Meadow, Summer, Autumn, Winter, then loop
  var CHAPTERS=[
    {name:'Meadow',bg:'#1a2416',tile1:'rgba(122,179,86,0.10)',tile2:'rgba(122,179,86,0.05)',accent:'#7ab356'},
    {name:'Summer',bg:'#2a1f14',tile1:'rgba(200,168,75,0.10)',tile2:'rgba(200,168,75,0.05)',accent:'#c8a84b'},
    {name:'Autumn',bg:'#2a1a10',tile1:'rgba(196,122,80,0.10)',tile2:'rgba(196,122,80,0.05)',accent:'#c47a50'},
    {name:'Winter',bg:'#161a22',tile1:'rgba(155,180,210,0.10)',tile2:'rgba(155,180,210,0.05)',accent:'#9bb4d2'}
  ];
  var grid=[],score=0,level=1,moves=30,won=false,lost=false;
  var selected=null,animating=false,comboCount=0;
  var canvas,ctx,dpr,overlayHost;
  var fx=[];
  var spinAngle=0;
  var bestLevel=1,bestScore=0;
  try{bestLevel=parseInt(localStorage.getItem('lw_pm_level')||'1',10)||1;bestScore=parseInt(localStorage.getItem('lw_pm_score')||'0',10)||0;}catch(e){}
  var objective=null; // see genLevel
  var objState={}; // runtime tracking for objective
  var hintTimer=0,hintCells=null,lastInputAt=Date.now();
  var lastBannerAt=0;

  level=bestLevel;
  objective=genLevel(level);
  moves=objective.moves;

  ms(a,'<strong id="PMchap">Meadow</strong> · L<strong id="PMlv">'+level+'</strong> · best L<strong id="PMbest">'+bestLevel+'</strong>');
  mm(a);
  /* ═══ CHAPTER BACKDROP ═══════════════════════════════════════════════
     Stephen painted four full-bleed conservatories, one per chapter, and the
     board was sitting on a flat #1a2416 rectangle instead. This is that art.

     It is an absolutely-positioned child of the mount, NOT a fixed layer and
     NOT an inline background on the mount itself. Both of those leak: the same
     #fg-ag element is reused for every game in LW's game tab, so a fixed
     backdrop would still be on screen behind Bloom Breaker. A child element
     dies with `mountEl.innerHTML=''` and cannot outlive the game.
     ═══════════════════════════════════════════════════════════════════ */
  /* ⛔ z-index:-1 plus isolation:isolate on the mount, NOT z-index:0.
     A positioned z-index:0 element paints ABOVE static in-flow content, so the
     backdrop swallowed the "Swipe to swap" hint line the shell writes straight
     into the mount. Negative z-index paints after the parent's background but
     before its in-flow children, which is exactly what a backdrop wants, and
     isolation:isolate makes the mount a stacking context so it cannot slide
     out behind the page instead. */
  try{ if(!a.style.position) a.style.position='relative'; a.style.isolation='isolate'; }catch(e){}
  var backdrop=document.createElement('div');
  backdrop.id='PMbg';
  backdrop.style.cssText='position:absolute;inset:0;z-index:-1;pointer-events:none;'+
    'background:#12160f center top/cover no-repeat;';
  a.appendChild(backdrop);
  var bgChapter=-1;
  function syncBackdrop(){
    var ci=objective?objective.chapter:0;
    if(ci===bgChapter) return;
    bgChapter=ci;
    /* Light scrim only. The first pass sat this painting under 0.55-0.72 black
       plus a heavy inset shadow and it read as a flat dark rectangle — all that
       work invisible. The panels and the board carry their own opaque backing,
       so the backdrop does not need to be dimmed to keep text legible. */
    backdrop.style.backgroundImage=
      'linear-gradient(rgba(10,13,9,0.18),rgba(10,13,9,0.34)),'+
      'url("/assets/games/petalmatch/runtime/chapter-bg-'+((ci%4)+1)+'.jpg")';
  }
  syncBackdrop();

  var pan=document.createElement('div');
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;text-align:center;position:relative;z-index:1;';
  a.appendChild(pan);

  var objBar=document.createElement('div');
  objBar.id='PMobj';
  /* Painted chrome (2026-07-26). border-image, NOT background-image: these
     frames have ornate corners that must stay their own size while the middle
     stretches. Each rule keeps its original background colour underneath, so if
     the art fails to load the panel reads exactly as it did before. */
  objBar.style.cssText='padding:10px 18px;background:rgba(26,31,23,0.55);border:14px solid transparent;border-image:url("/assets/games/petalmatch/runtime/ui-objbar.png") 34% 26% fill round;border-radius:8px;margin:4px 0;font-family:DM Mono,monospace;font-size:0.82rem;color:#e8dcc8;line-height:1.35;';
  pan.appendChild(objBar);

  var hud=document.createElement('div');
  hud.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:10px 16px;background:rgba(26,31,23,0.5);border:16px solid transparent;border-image:url("/assets/games/petalmatch/runtime/ui-panel.png") 26% fill round;border-radius:8px;margin:4px 0;font-family:DM Mono,monospace;';
  hud.innerHTML='<div><div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:#7ab356;letter-spacing:0.08em;">SCORE</div><div id="PMsc" style="font-size:1.1rem;color:#c8a84b;">0</div></div><div><div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:#7ab356;letter-spacing:0.08em;">LEVEL</div><div id="PMlv2" style="font-size:1.1rem;color:#e8dcc8;">'+level+'</div></div><div><div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:#7ab356;letter-spacing:0.08em;">MOVES</div><div id="PMmv" style="font-size:1.1rem;color:#e8dcc8;">'+moves+'</div></div>';
  pan.appendChild(hud);

  var bar=document.createElement('div');
  bar.style.cssText='width:90%;max-width:300px;height:6px;background:rgba(26,36,22,0.5);border-radius:3px;margin:4px auto;overflow:hidden;';
  bar.innerHTML='<div id="PMbar" style="height:100%;background:#7ab356;transition:width .3s;width:100%;"></div>';
  pan.appendChild(bar);

  canvas=document.createElement('canvas');
  canvas.style.cssText='display:block;border-radius:8px;margin:4px auto;touch-action:none;';
  /* ⛔ The frame goes on a WRAPPER, never on the canvas itself. A border on the
     canvas shifts the box the input handler measures against, and every tap
     would land on the wrong cell. */
  var boardWrap=document.createElement('div');
  boardWrap.style.cssText='display:inline-block;line-height:0;padding:2px;'+
    'border:'+PM_FRAME+'px solid transparent;border-image:url("/assets/games/petalmatch/runtime/ui-board.png") 24% fill round;';
  boardWrap.appendChild(canvas);
  pan.appendChild(boardWrap);

  overlayHost=document.createElement('div');
  overlayHost.style.cssText='position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);pointer-events:none;z-index:5;';
  pan.appendChild(overlayHost);

  mc(a).innerHTML='<button class="gb" onclick="_PMN()">↻ New Game</button> <button class="gb" onclick="_PMR()">RETRY LV</button> <button class="gb" onclick="_PMH()">HINT</button>';

  // ───────── level generator ─────────
  /* ═══════════════════════════════════════════════════════════════════
     LEVEL GENERATION — banded, 2026-07-25

     THE OLD VERSION rotated on a FIXED 10-step pattern that never varied:
       score, dew, gather, score, thorns, dew, gather, thorns, score, mix
     Two things were wrong with it, and a player felt both without seeing the
     code: "the levels that involve hitting the thorns are immensely more
     difficult than the levels between them" and "I fear when I beat level 25
     the next 2 levels will be very easy."

     1. The ORDER never changed, so after one chapter you knew what was coming.
     2. Each objective kind scaled on its own private numbers, so a blocker
        level and the score level next to it were nowhere near each other in
        difficulty. Measured: score and gather at 100%, dew at 31%.

     THE NEW VERSION drives every kind from ONE difficulty curve, d(lv), so a
     level's demand is set by where it sits on the ladder rather than by which
     objective it happens to be. The order is seeded per chapter so it varies
     while still guaranteeing every kind appears.

     ⛔ The numbers below were calibrated with scripts/petalmatch_balance.js,
     which plays the real game with a bot and reports the true win rate. If you
     change them, re-run it. Do not hand-tune this by eye — that is exactly how
     it ended up a sawtooth.
     ═══════════════════════════════════════════════════════════════════ */

  // 0 at level 1, approaching 1 deep in the ladder. Steep early so the game
  // stops being trivial quickly, then flattening so it never becomes hopeless.
  function _diff(lv){
    var d=1-Math.pow(0.965,lv-1);
    return d>0.97?0.97:d;
  }
  // Deterministic per-level shuffle, so the ladder is fixed for everyone
  // (shareable, comparable) but not the same 10 steps on repeat.
  function _lvRand(seed){
    var x=Math.sin(seed*12.9898)*43758.5453;
    return x-Math.floor(x);
  }
  function _chapterOrder(chapter){
    var kinds=['score','dew','gather','thorns','score','dew','gather','thorns','mix'];
    for(var i=kinds.length-1;i>0;i--){
      var j=Math.floor(_lvRand(chapter*97+i)*(i+1));
      var t=kinds[i];kinds[i]=kinds[j];kinds[j]=t;
    }
    return kinds;
  }

  function genLevel(lv){
    var chapter=Math.floor((lv-1)/10);
    var sub=(lv-1)%10;
    var ch=Math.min(chapter,3);
    var d=_diff(lv);

    // The last level of every chapter is a DELIBERATE wall. The player said the
    // challenge is their favourite part; what they disliked was it arriving at
    // random and then vanishing. So it is now scheduled, and it is the only one.
    var finale=(sub===9);
    var kind=finale?'mix':_chapterOrder(chapter)[sub];

    // Moves shrink slightly as a share of demand rather than growing forever.
    var mv=26+Math.floor(lv*0.45);
    if(mv>52)mv=52;
    if(finale)mv+=6;

    // Each kind is scaled from the SAME d, so neighbours land in one band.
    if(kind==='score'){
      /* ⛔ Score targets must scale SUPERLINEARLY. Points per clear are already
         multiplied by `level` in the scoring formula, so a target that grows
         linearly with level keeps the exact same difficulty forever — which is
         why score levels measured 100% at every depth. The lv*lv term is what
         makes a late score level actually ask something. */
      var tgt=Math.round((2600+lv*520+lv*lv*95)*(1+d*2.0));
      return {kind:'score',chapter:ch,moves:mv,target:tgt,finale:finale,
              label:'Reach '+tgt+' points'};
    }
    if(kind==='dew'){
      var dewN=Math.round(3+d*7);
      var dbl=d>0.55;
      if(dbl)dewN=Math.round(dewN*0.7);   // double layer already doubles the work
      return {kind:'dew',chapter:ch,moves:mv,dew:dewN,doubleLayer:dbl,finale:finale,
              label:'Clear '+dewN+' Dew tile'+(dewN===1?'':'s')+(dbl?' (double layer)':'')};
    }
    if(kind==='gather'){
      var per=Math.round(16+d*44);
      var colors=d<0.3?1:(d<0.6?2:3);
      return {kind:'gather',chapter:ch,moves:mv,perColor:per,colors:colors,finale:finale,
              label:'Gather '+per+' of '+colors+' flower'+(colors>1?' types':' type')};
    }
    if(kind==='thorns'){
      var th=Math.round(9+d*27);
      var hits=d<0.2?1:(d<0.55?2:3);
      return {kind:'thorns',chapter:ch,moves:mv,thorns:th,hits:hits,finale:finale,
              label:'Break '+th+' Thorn'+(th===1?'':'s')+(hits>1?' ('+hits+' hits each)':'')};
    }
    // mix — the chapter finale, and the one intentional spike
    var mDew=Math.round(2+d*6), mTh=Math.round(3+d*7);
    var mScore=Math.round((1800+lv*340+lv*lv*60)*(1+d*1.4));
    return {kind:'mix',chapter:ch,moves:mv,dew:mDew,thorns:mTh,target:mScore,finale:finale,
            label:'Mixed: score + clear tiles + break thorns'};
  }

  function resetObjState(){
    objState={dewRemaining:0,thornRemaining:0,gatherTargets:{},gatherGot:{}};
    if(objective.kind==='dew'||objective.kind==='mix'){objState.dewRemaining=objective.dew||0;}
    if(objective.kind==='thorns'||objective.kind==='mix'){objState.thornRemaining=objective.thorns||0;}
    if(objective.kind==='gather'){
      // pick N distinct types and per-color goal
      var pool=[0,1,2,3,4,5];
      for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=pool[i];pool[i]=pool[j];pool[j]=t;}
      for(var k=0;k<objective.colors;k++){objState.gatherTargets[pool[k]]=objective.perColor;objState.gatherGot[pool[k]]=0;}
    }
  }

  function renderObjective(){
    var o=objective,s=objState;
    var html='<div style="font-family:Bebas Neue,sans-serif;letter-spacing:0.08em;color:#c8a84b;font-size:0.82rem;margin-bottom:3px;">OBJECTIVE · '+CHAPTERS[o.chapter].name.toUpperCase()+'</div>';
    if(o.kind==='score'){
      html+='<div>Reach <strong style="color:#c8a84b;">'+o.target+'</strong> points</div>';
    } else if(o.kind==='dew'){
      html+='<div>Clear <strong style="color:#9cc4e8;">'+s.dewRemaining+'</strong> / '+o.dew+' Dew tile'+(o.dew===1?'':'s')+(o.doubleLayer?' (double)':'')+'</div>';
    } else if(o.kind==='gather'){
      var parts=[];
      for(var t in s.gatherTargets){
        var got=s.gatherGot[t]||0,need=s.gatherTargets[t];
        var flower=GEMS[t].name,color=GEMS[t].color;
        parts.push('<span style="color:'+color+';">●</span> '+Math.min(got,need)+'/'+need);
      }
      html+='<div>Gather '+parts.join(' &nbsp; ')+'</div>';
    } else if(o.kind==='thorns'){
      html+='<div>Break <strong style="color:#c47a50;">'+s.thornRemaining+'</strong> / '+o.thorns+' Thorn'+(o.thorns===1?'':'s')+(o.hits>1?' ('+o.hits+' hits each)':'')+'</div>';
    } else if(o.kind==='mix'){
      html+='<div>Score <strong>'+score+'</strong>/'+o.target+' &nbsp; Dew <strong style="color:#9cc4e8;">'+s.dewRemaining+'</strong>/'+o.dew+' &nbsp; Thorns <strong style="color:#c47a50;">'+s.thornRemaining+'</strong>/'+o.thorns+'</div>';
    }
    var oe=document.getElementById('PMobj');
    if(oe)oe.innerHTML=html;
  }

  function isObjComplete(){
    var o=objective,s=objState;
    if(o.kind==='score')return score>=o.target;
    if(o.kind==='dew')return s.dewRemaining<=0;
    if(o.kind==='gather'){
      for(var t in s.gatherTargets){if((s.gatherGot[t]||0)<s.gatherTargets[t])return false;}
      return true;
    }
    if(o.kind==='thorns')return s.thornRemaining<=0;
    if(o.kind==='mix')return score>=o.target&&s.dewRemaining<=0&&s.thornRemaining<=0;
    return false;
  }

  // ───────── banners (agent C: BLOOM! / PETAL STORM! / GARDEN'S GRACE!) ─────────
  function banner(text,color){
    var now=Date.now();
    if(now-lastBannerAt<400)return;
    lastBannerAt=now;
    var el=document.createElement('div');
    el.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:Bebas Neue,sans-serif;font-size:1.9rem;letter-spacing:0.18em;color:'+(color||'#c8a84b')+';text-shadow:0 0 18px rgba(200,168,75,0.8),0 2px 6px rgba(0,0,0,0.9);pointer-events:none;white-space:nowrap;animation:pmBanner 1.1s ease-out forwards;';
    el.textContent=text;
    overlayHost.appendChild(el);
    setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},1200);
  }

  // ───────── canvas + grid ─────────
  function initCanvas(){
    ctx=canvas.getContext('2d');
    dpr=window.devicePixelRatio||1;
    /* ⛔ PM_FRAME is subtracted here AND used as the wrapper border width below.
       The painted board frame adds real width; when only the wrapper knew about
       it the board overflowed the screen and the right column was cut off. One
       constant drives both so they can never disagree again. */
    var maxSize=Math.min((a.clientWidth||360)-24-(PM_FRAME*2),360);
    CELL=Math.floor(maxSize/COLS);
    var total=COLS*CELL;
    canvas.width=total*dpr;canvas.height=ROWS*CELL*dpr;
    canvas.style.width=total+'px';canvas.style.height=(ROWS*CELL)+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function mkCell(type,r,c,opts){
    opts=opts||{};
    return {type:type,x:c*CELL,targetX:c*CELL,y:(opts.yStart!==undefined?opts.yStart:r*CELL),targetY:r*CELL,scale:1,special:null,stripeDir:null,spawnAnim:0,jelly:0,block:0,clearAt:0,bounceAt:0};
  }
  /* ⛔ DEW BELONGS TO THE SQUARE, NOT THE GEM. Added 2026-07-25.
     jelly used to live only on the cell OBJECT, and processSegment moves cell
     objects downward on collapse. Two bugs fell out of that:
       1. A double-layer dew tile lost its second layer. The first match
          decremented 2 to 1, then the cell was nulled and replaced by a fresh
          gem with jelly 0, so the remaining layer vanished. Double-layer levels
          were quietly single-layer.
       2. Dew RODE THE FALLING GEM. An uncleared dew gem dropping into a gap
          carried the dew to a new square, so the pattern the level was seeded
          with slid around the board as you played.
     jellyBoard is now the source of truth, indexed by board position. cell.jelly
     is just a render mirror, re-synced after every collapse. */
  var jellyBoard=[];
  function initJellyBoard(){
    jellyBoard=[];
    for(var r=0;r<ROWS;r++){jellyBoard[r]=[];for(var c=0;c<COLS;c++)jellyBoard[r][c]=0;}
  }
  function syncJellyToCells(){
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
      if(grid[r]&&grid[r][c])grid[r][c].jelly=jellyBoard[r][c]||0;
    }
  }

  function initGrid(){
    grid=[];
    initJellyBoard();
    for(var r=0;r<ROWS;r++){grid[r]=[];
      for(var c=0;c<COLS;c++){
        var t;
        do{t=Math.floor(Math.random()*TYPES);}
        while((c>=2&&grid[r][c-1]&&grid[r][c-1].type===t&&grid[r][c-2]&&grid[r][c-2].type===t)||
              (r>=2&&grid[r-1][c]&&grid[r-1][c].type===t&&grid[r-2][c]&&grid[r-2][c].type===t));
        grid[r][c]=mkCell(t,r,c);
      }
    }
    seedObstacles();
  }

  function seedObstacles(){
    var placed;
    if(objective.kind==='dew'||objective.kind==='mix'){
      placed=0;
      var target=objective.dew;
      var layers=objective.doubleLayer?2:1;
      // distribute in lower-center band for visibility
      var tries=0;
      while(placed<target&&tries<400){
        tries++;
        var r=2+Math.floor(Math.random()*6);
        var c=Math.floor(Math.random()*COLS);
        if(grid[r][c]&&grid[r][c].jelly===0){grid[r][c].jelly=layers;jellyBoard[r][c]=layers;placed++;}
      }
    }
    if(objective.kind==='thorns'||objective.kind==='mix'){
      placed=0;
      var tgt2=objective.thorns;
      var hp=objective.hits||1;
      var tries2=0;
      // Thorns replace a cell entirely. Place along edges + center cluster
      while(placed<tgt2&&tries2<400){
        tries2++;
        var rr=Math.floor(Math.random()*ROWS);
        var cc=Math.floor(Math.random()*COLS);
        if(grid[rr][cc]&&!grid[rr][cc].block&&grid[rr][cc].jelly===0){
          var th=mkCell(-2,rr,cc);th.block=hp;grid[rr][cc]=th;
          placed++;
        }
      }
    }
  }

  function rawRuns(){
    var hGroups=[],vGroups=[];
    for(var r=0;r<ROWS;r++){
      var c=0;
      while(c<COLS-2){
        if(grid[r][c]&&grid[r][c+1]&&grid[r][c+2]&&grid[r][c].type===grid[r][c+1].type&&grid[r][c].type===grid[r][c+2].type&&grid[r][c].type>=0){
          var g=[{r:r,c:c},{r:r,c:c+1},{r:r,c:c+2}];
          var nc=c+3;
          while(nc<COLS&&grid[r][nc]&&grid[r][nc].type===grid[r][c].type){g.push({r:r,c:nc});nc++;}
          g.dir='h';g.type=grid[r][c].type;
          hGroups.push(g);c=nc;
        } else c++;
      }
    }
    for(var cc=0;cc<COLS;cc++){
      var r2=0;
      while(r2<ROWS-2){
        if(grid[r2][cc]&&grid[r2+1][cc]&&grid[r2+2][cc]&&grid[r2][cc].type===grid[r2+1][cc].type&&grid[r2][cc].type===grid[r2+2][cc].type&&grid[r2][cc].type>=0){
          var g2=[{r:r2,c:cc},{r:r2+1,c:cc},{r:r2+2,c:cc}];
          var nr=r2+3;
          while(nr<ROWS&&grid[nr][cc]&&grid[nr][cc].type===grid[r2][cc].type){g2.push({r:nr,c:cc});nr++;}
          g2.dir='v';g2.type=grid[r2][cc].type;
          vGroups.push(g2);r2=nr;
        } else r2++;
      }
    }
    return {h:hGroups,v:vGroups};
  }

  function findMatches(){
    var runs=rawRuns();
    var out=[];
    for(var i=0;i<runs.h.length;i++)out.push(runs.h[i]);
    for(var j=0;j<runs.v.length;j++)out.push(runs.v[j]);
    return out;
  }

  function detectMatches(lastSwap){
    var runs=rawRuns();
    var toClear={},spawns=[],consumed={};
    var hByCell={},vByCell={};
    var i,j,g;
    for(i=0;i<runs.h.length;i++){g=runs.h[i];for(j=0;j<g.length;j++){hByCell[g[j].r+','+g[j].c]=i;}}
    for(i=0;i<runs.v.length;i++){g=runs.v[i];for(j=0;j<g.length;j++){vByCell[g[j].r+','+g[j].c]=i;}}
    var ltSpawned={};
    for(var key in hByCell){
      if(vByCell.hasOwnProperty(key)){
        var hi=hByCell[key],vi=vByCell[key];
        var combo=hi+'x'+vi;
        if(ltSpawned[combo])continue;
        var hg=runs.h[hi],vg=runs.v[vi];
        var uniq={},ukey;
        for(j=0;j<hg.length;j++){ukey=hg[j].r+','+hg[j].c;uniq[ukey]=1;}
        for(j=0;j<vg.length;j++){ukey=vg[j].r+','+vg[j].c;uniq[ukey]=1;}
        var uc=0;for(ukey in uniq){uc++;}
        if(uc>=5){
          ltSpawned[combo]=1;
          var kp=key.split(',');
          var sr=parseInt(kp[0],10),sc=parseInt(kp[1],10);
          spawns.push({r:sr,c:sc,special:'burst',type:hg.type});
          consumed['h'+hi]=1;consumed['v'+vi]=1;
          for(j=0;j<hg.length;j++)toClear[hg[j].r+','+hg[j].c]=1;
          for(j=0;j<vg.length;j++)toClear[vg[j].r+','+vg[j].c]=1;
        }
      }
    }
    function pickSpawnCell(group){
      if(lastSwap){
        for(var k=0;k<group.length;k++){
          if(group[k].r===lastSwap.r&&group[k].c===lastSwap.c)return group[k];
        }
      }
      return group[Math.floor(group.length/2)];
    }
    for(i=0;i<runs.h.length;i++){
      if(consumed['h'+i])continue;
      g=runs.h[i];
      for(j=0;j<g.length;j++)toClear[g[j].r+','+g[j].c]=1;
      if(g.length>=5){var sc=pickSpawnCell(g);spawns.push({r:sc.r,c:sc.c,special:'spore',type:-1});}
      else if(g.length===4){var sc2=pickSpawnCell(g);spawns.push({r:sc2.r,c:sc2.c,special:'vine',stripeDir:'v',type:g.type});}
    }
    for(i=0;i<runs.v.length;i++){
      if(consumed['v'+i])continue;
      g=runs.v[i];
      for(j=0;j<g.length;j++)toClear[g[j].r+','+g[j].c]=1;
      if(g.length>=5){var sc3=pickSpawnCell(g);spawns.push({r:sc3.r,c:sc3.c,special:'spore',type:-1});}
      else if(g.length===4){var sc4=pickSpawnCell(g);spawns.push({r:sc4.r,c:sc4.c,special:'vine',stripeDir:'h',type:g.type});}
    }
    var rank={burst:3,spore:2,vine:1};
    var spawnMap={};
    for(i=0;i<spawns.length;i++){
      var sp=spawns[i],sk=sp.r+','+sp.c;
      if(!spawnMap[sk]||rank[sp.special]>rank[spawnMap[sk].special])spawnMap[sk]=sp;
    }
    var finalSpawns=[];
    for(var sk2 in spawnMap){
      finalSpawns.push(spawnMap[sk2]);
      delete toClear[sk2];
    }

    /* ⛔ THORNS TAKE DAMAGE FROM AN ADJACENT MATCH. Added 2026-07-25.
       A player: "the levels that involve hitting the thorns are immensely more
       difficult than the levels between them." The balance harness measured
       thorn levels at a 0% win rate against levels either side at 100%.
       The cause: toClear was only ever filled from match groups, and a match
       group requires type>=0 while a thorn is type -2. So a match right next to
       a thorn did NOTHING. Thorns could only be damaged by a special piece
       exploding on them, which is why those levels felt like a brick wall.
       Every game in this genre damages a blocker adjacent to a match. Now so do
       we. Deduped by key, so two matched cells touching the same thorn is one
       hit, not two. */
    var thornHitKeys={};
    for(var tk in toClear){
      var tp=tk.split(','),tr=parseInt(tp[0],10),tc=parseInt(tp[1],10);
      var nb=[[tr+1,tc],[tr-1,tc],[tr,tc+1],[tr,tc-1]];
      for(var nbi=0;nbi<4;nbi++){
        var nr=nb[nbi][0],ncc=nb[nbi][1];
        if(!inBounds(nr,ncc))continue;
        var ncell=grid[nr]&&grid[nr][ncc];
        if(ncell&&ncell.type===-2)thornHitKeys[nr+','+ncc]=1;
      }
    }
    for(var thk in thornHitKeys)toClear[thk]=1;

    return {toClear:toClear,spawns:finalSpawns};
  }

  function inBounds(r,c){return r>=0&&r<ROWS&&c>=0&&c<COLS;}

  function expandActivations(toClear,pendingBurstPop){
    var activated={};
    var queue=[];
    for(var k in toClear)queue.push(k);
    while(queue.length>0){
      var key=queue.shift();
      var p=key.split(','),r=parseInt(p[0],10),c=parseInt(p[1],10);
      if(activated[key])continue;
      activated[key]=1;
      var cell=grid[r]&&grid[r][c];
      if(!cell||!cell.special)continue;
      var spec=cell.special,dir=cell.stripeDir;
      if(spec==='vine'){
        fx.push({kind:'sweep',dir:dir,r:r,c:c,t:Date.now()});
        if(dir==='h'){
          for(var cc=0;cc<COLS;cc++){var nk=r+','+cc;if(!toClear[nk]){toClear[nk]=1;queue.push(nk);}}
        } else {
          for(var rr=0;rr<ROWS;rr++){var nk2=rr+','+c;if(!toClear[nk2]){toClear[nk2]=1;queue.push(nk2);}}
        }
      } else if(spec==='burst'){
        fx.push({kind:'flash',r:r,c:c,size:3,t:Date.now()});
        for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
          var rr2=r+dr,cc2=c+dc;if(!inBounds(rr2,cc2))continue;
          var nk3=rr2+','+cc2;if(!toClear[nk3]){toClear[nk3]=1;queue.push(nk3);}
        }
        pendingBurstPop.push({r:r,c:c});
      } else if(spec==='spore'){
        // When activated as a by-catch (not a direct swap), clear the most-represented color instead of random
        var counts=[0,0,0,0,0,0],maxT=0,maxN=0;
        for(var rz=0;rz<ROWS;rz++)for(var cz=0;cz<COLS;cz++){var cc3=grid[rz][cz];if(cc3&&cc3.type>=0)counts[cc3.type]++;}
        for(var tz=0;tz<TYPES;tz++)if(counts[tz]>maxN){maxN=counts[tz];maxT=tz;}
        clearColor(maxT,toClear,queue);
      }
    }
    return activated;
  }

  function clearColor(tgt,toClear,queue){
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
      var cell=grid[r][c];
      if(cell&&cell.type===tgt){
        var k=r+','+c;if(!toClear[k]){toClear[k]=1;if(queue)queue.push(k);}
        fx.push({kind:'beam',fromR:r,fromC:c,t:Date.now()});
      }
    }
  }

  function swap(r1,c1,r2,c2){
    var t=grid[r1][c1];grid[r1][c1]=grid[r2][c2];grid[r2][c2]=t;
    // Preserve each cell's current pixel position so render can lerp toward the new grid pos.
    if(grid[r1][c1]){grid[r1][c1].targetX=c1*CELL;grid[r1][c1].targetY=r1*CELL;}
    if(grid[r2][c2]){grid[r2][c2].targetX=c2*CELL;grid[r2][c2].targetY=r2*CELL;}
  }

  // Thorn blocks: can't be swapped, can't be part of a match.
  // Returns true if the cell is swappable.
  function canSwap(r,c){var cell=grid[r]&&grid[r][c];return cell&&cell.type>=-1;}

  // Find a valid swap. Returns [[r1,c1],[r2,c2]] or null.
  function findValidSwap(){
    for(var r=0;r<ROWS;r++){
      for(var c=0;c<COLS;c++){
        if(!canSwap(r,c))continue;
        if(c<COLS-1&&canSwap(r,c+1)){
          swap(r,c,r,c+1);
          if(findMatches().length>0){swap(r,c,r,c+1);return [[r,c],[r,c+1]];}
          swap(r,c,r,c+1);
        }
        if(r<ROWS-1&&canSwap(r+1,c)){
          swap(r,c,r+1,c);
          if(findMatches().length>0){swap(r,c,r+1,c);return [[r,c],[r+1,c]];}
          swap(r,c,r+1,c);
        }
      }
    }
    // Also consider any special piece — special+anything is always a valid move
    for(var r3=0;r3<ROWS;r3++)for(var c3=0;c3<COLS;c3++){
      var cell=grid[r3][c3];
      if(cell&&cell.special){
        if(c3<COLS-1&&canSwap(r3,c3+1))return [[r3,c3],[r3,c3+1]];
        if(c3>0&&canSwap(r3,c3-1))return [[r3,c3],[r3,c3-1]];
        if(r3<ROWS-1&&canSwap(r3+1,c3))return [[r3,c3],[r3+1,c3]];
        if(r3>0&&canSwap(r3-1,c3))return [[r3,c3],[r3-1,c3]];
      }
    }
    return null;
  }

  function handleSpecialCombo(a,b,toClear,queue,pendingBurstPop){
    if(!a||!b)return false;
    var sa=a.cell.special,sb=b.cell.special;
    if(!sa&&!sb)return false;
    var pts=0;
    if(sa==='spore'&&sb==='spore'){
      // Tuned down from full-board wipe to clearing 2 random colors.
      // Still the biggest combo but leaves the board with structure.
      var used={};
      var first=Math.floor(Math.random()*TYPES);used[first]=1;
      var second;
      do{second=Math.floor(Math.random()*TYPES);}while(used[second]);
      clearColor(first,toClear,queue);
      clearColor(second,toClear,queue);
      toClear[a.r+','+a.c]=1;toClear[b.r+','+b.c]=1;
      queue.push(a.r+','+a.c);queue.push(b.r+','+b.c);
      pts=1400;score+=pts;banner('GARDEN\'S GRACE!','#c8a84b');sm('GARDEN\'S GRACE! +'+pts);return true;
    }
    if(sa==='spore'||sb==='spore'){
      var sporeCell=sa==='spore'?a:b,otherCell=sa==='spore'?b:a;
      var tgt=otherCell.cell.type;
      if(tgt<0){tgt=Math.floor(Math.random()*TYPES);}
      var convertTo=otherCell.cell.special||'burst';
      for(var rr=0;rr<ROWS;rr++)for(var cc=0;cc<COLS;cc++){
        var cell=grid[rr][cc];
        if(cell&&cell.type===tgt){
          cell.special=convertTo;
          if(convertTo==='vine')cell.stripeDir=Math.random()<0.5?'h':'v';
          var k2=rr+','+cc;toClear[k2]=1;queue.push(k2);
        }
      }
      toClear[sporeCell.r+','+sporeCell.c]=1;queue.push(sporeCell.r+','+sporeCell.c);
      pts=500;score+=pts;banner('PETAL STORM!','#e8b5b5');sm('PETAL STORM! +'+pts);return true;
    }
    if(sa==='vine'&&sb==='vine'){
      var tr=b.r,tc=b.c;
      for(var cc2=0;cc2<COLS;cc2++){var k3=tr+','+cc2;toClear[k3]=1;queue.push(k3);}
      for(var rr2=0;rr2<ROWS;rr2++){var k4=rr2+','+tc;toClear[k4]=1;queue.push(k4);}
      pts=300;score+=pts;banner('VINE CROSS!','#7ab356');sm('VINE CROSS! +'+pts);return true;
    }
    if((sa==='vine'&&sb==='burst')||(sa==='burst'&&sb==='vine')){
      var tr2=b.r,tc2=b.c;
      for(var dc=-1;dc<=1;dc++)for(var ccA=0;ccA<COLS;ccA++){var rA=tr2+dc;if(!inBounds(rA,ccA))continue;var kA=rA+','+ccA;toClear[kA]=1;queue.push(kA);}
      for(var dr2=-1;dr2<=1;dr2++)for(var rrA=0;rrA<ROWS;rrA++){var cA=tc2+dr2;if(!inBounds(rrA,cA))continue;var kB=rrA+','+cA;toClear[kB]=1;queue.push(kB);}
      pts=600;score+=pts;banner('PLUS BLAST!','#c8a84b');sm('PLUS BLAST! +'+pts);return true;
    }
    if(sa==='burst'&&sb==='burst'){
      var tr3=b.r,tc3=b.c;
      for(var dr3=-2;dr3<=2;dr3++)for(var dc3=-2;dc3<=2;dc3++){
        var rx=tr3+dr3,cx=tc3+dc3;if(!inBounds(rx,cx))continue;
        var kC=rx+','+cx;toClear[kC]=1;queue.push(kC);
      }
      fx.push({kind:'flash',r:tr3,c:tc3,size:5,t:Date.now()});
      pts=800;score+=pts;banner('MEGA BURST!','#ffb060');sm('MEGA BURST! +'+pts);return true;
    }
    return false;
  }

  function processSegment(c,top,bot){
    if(top>bot)return;
    var writeR=bot;
    for(var r=bot;r>=top;r--){
      if(grid[r][c]){
        if(writeR!==r){
          grid[writeR][c]=grid[r][c];
          grid[writeR][c].targetY=writeR*CELL;
          grid[writeR][c].targetX=c*CELL;
          grid[writeR][c].bounceAt=Date.now()+Math.abs(writeR-r)*55; // stagger settle bounce
          grid[r][c]=null;
        }
        writeR--;
      }
    }
    for(var r2=writeR;r2>=top;r2--){
      if(grid[r2][c])continue;
      var t=Math.floor(Math.random()*TYPES);
      var nc=mkCell(t,r2,c,{yStart:(r2-writeR-2)*CELL}); // drop from above
      nc.bounceAt=Date.now()+(writeR-r2+2)*55;
      grid[r2][c]=nc;
    }
  }
  function collapseAndRefill(){
    collapseAndRefill_inner();
    syncJellyToCells();   // dew stays on its square after everything has moved
  }
  function collapseAndRefill_inner(){
    // Gems can't fall through thorns. Process each column as segments
    // separated by thorns: [top of segment .. bottom of segment]. Each segment
    // collapses + refills independently so gaps above a thorn get new gems.
    for(var c=0;c<COLS;c++){
      var segBottom=ROWS-1;
      for(var r=ROWS-1;r>=0;r--){
        if(grid[r][c]&&grid[r][c].type===-2){
          processSegment(c,r+1,segBottom);
          segBottom=r-1;
        }
      }
      processSegment(c,0,segBottom);
    }
  }

  function applyClear(toClear){
    var vineCells=0,burstCells=0,sporeCells=0,plainCells=0,dewStripped=0,thornHits=0,thornBroken=0;
    for(var k in toClear){
      var p=k.split(','),r=parseInt(p[0],10),c=parseInt(p[1],10);
      var cell=grid[r]&&grid[r][c];if(!cell)continue;
      // Thorns take a hit but don't clear unless hp reaches 0
      if(cell.type===-2){
        cell.block--;
        thornHits++;
        fx.push({kind:'flash',r:r,c:c,size:1,t:Date.now()});
        if(cell.block<=0){
          thornBroken++;
          grid[r][c]=null;
        }
        continue;
      }
      // Gather tracking before we remove
      if(objState.gatherTargets&&objState.gatherTargets.hasOwnProperty(cell.type)){
        objState.gatherGot[cell.type]=(objState.gatherGot[cell.type]||0)+1;
      }
      // Jelly strips a layer instead of removing the gem. Only strips ONCE per clear.
      if(jellyBoard[r][c]>0){
        jellyBoard[r][c]--;          // the SQUARE loses a layer, not the gem
        cell.jelly=jellyBoard[r][c];
        dewStripped++;
        fx.push({kind:'dewstrip',r:r,c:c,t:Date.now()});
        // Note: the gem still clears (standard match-3 jelly behavior)
      }
      if(cell.special==='vine')vineCells++;
      else if(cell.special==='burst')burstCells++;
      else if(cell.special==='spore')sporeCells++;
      else plainCells++;
      grid[r][c]=null;
    }
    if(dewStripped>0)objState.dewRemaining=Math.max(0,objState.dewRemaining-dewStripped);
    if(thornBroken>0)objState.thornRemaining=Math.max(0,objState.thornRemaining-thornBroken);
    return {v:vineCells,b:burstCells,s:sporeCells,p:plainCells,dew:dewStripped,thorns:thornHits};
  }

  function resolveCascade(initialSwap,swapPair,cb){
    var pendingBurstPop=[];
    var safety=0;
    function step(){
      safety++;if(safety>80){cb();return;} // hard cap on runaway cascades
      var det=detectMatches(initialSwap);
      initialSwap=null;
      var hasMatch=false;
      for(var k in det.toClear){hasMatch=true;break;}
      if(!hasMatch&&det.spawns.length===0&&pendingBurstPop.length===0&&(!swapPair)){
        if(comboCount>=4)banner('BLOOM!','#e8b5b5');
        comboCount=0;cb();return;
      }
      comboCount++;
      animating=true;
      if(swapPair){
        var q=[];
        handleSpecialCombo(swapPair.a,swapPair.b,det.toClear,q,pendingBurstPop);
        swapPair=null;
      }
      var queueE=[];for(var qk in det.toClear)queueE.push(qk);
      var expanded={};
      for(var i=0;i<queueE.length;i++)expanded[queueE[i]]=1;
      expandActivations(expanded,pendingBurstPop);
      for(var ek in expanded)det.toClear[ek]=1;
      var spawnBonus=0;
      for(var s=0;s<det.spawns.length;s++){
        var sp=det.spawns[s];
        var existing=grid[sp.r][sp.c];
        if(existing){
          existing.special=sp.special;
          existing.stripeDir=sp.stripeDir||null;
          if(sp.special==='spore')existing.type=-1;
          existing.spawnAnim=Date.now();
        }
        if(sp.special==='vine'){spawnBonus+=50;sm('VINE WRAPPED!');}
        else if(sp.special==='burst'){spawnBonus+=100;banner('BLOOM BURST!','#c8a84b');}
        else if(sp.special==='spore'){spawnBonus+=200;banner('SPORE CLOUD!','#e8dcc8');}
      }
      for(var ck in det.toClear){var cp=ck.split(',');var _cc=grid[cp[0]][cp[1]];if(_cc&&_cc.type!==-2&&!_cc.clearAt)_cc.clearAt=Date.now();}
      setTimeout(function(){
        var counts=applyClear(det.toClear);/* clear anim runs 280ms in render; we wait 300ms before actually nulling cells */
        var pts=(counts.p*10+counts.v*20+counts.b*30+counts.s*40+counts.dew*15+counts.thorns*25)*comboCount*level+spawnBonus;
        score+=pts;
        if(comboCount>1){sm(comboCount+'x COMBO! +'+pts);_play('snap');_e('milestone');
          if(comboCount===3)banner('BLOOM!','#e8b5b5');
          if(comboCount>=5)banner('PETAL STORM!','#c47a7a');
        }
        else if(pts>0){sm('+'+pts);_play('tap');_e('progress');}
        collapseAndRefill();
        updateHUD();
        function nextStep(){
          if(pendingBurstPop.length>0){
            var pops=pendingBurstPop;pendingBurstPop=[];
            var secondClear={},secondQueue=[];
            for(var pi=0;pi<pops.length;pi++){
              var pr=pops[pi].r,pc=pops[pi].c;
              for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){
                var rr=pr+dr,cc=pc+dc;if(!inBounds(rr,cc))continue;
                var k2=rr+','+cc;secondClear[k2]=1;secondQueue.push(k2);
              }
              fx.push({kind:'flash',r:pr,c:pc,size:3,t:Date.now()});
            }
            var newBurstPop=[];
            expandActivations(secondClear,newBurstPop);
            for(var sk in secondClear){var sp2=sk.split(',');var _cc2=grid[sp2[0]][sp2[1]];if(_cc2&&_cc2.type!==-2&&!_cc2.clearAt)_cc2.clearAt=Date.now();}
            setTimeout(function(){
              var cc2=applyClear(secondClear);
              var pp=(cc2.p*10+cc2.v*20+cc2.b*30+cc2.s*40+cc2.dew*15+cc2.thorns*25)*comboCount*level;
              score+=pp;
              collapseAndRefill();
              updateHUD();
              for(var np=0;np<newBurstPop.length;np++)pendingBurstPop.push(newBurstPop[np]);
              setTimeout(step,420); // give gravity time to settle
            },320);
          } else {
            setTimeout(step,420);
          }
        }
        if(pendingBurstPop.length>0){setTimeout(nextStep,200);}
        else setTimeout(step,420);
      },300);
    }
    step();
  }

  function updateHUD(){
    var e;
    if(e=document.getElementById('PMsc'))e.textContent=score;
    if(e=document.getElementById('PMlv2'))e.textContent=level;
    if(e=document.getElementById('PMlv'))e.textContent=level;
    if(e=document.getElementById('PMchap'))e.textContent=CHAPTERS[objective.chapter].name;
    syncBackdrop();   // the conservatory changes with the chapter
    if(e=document.getElementById('PMmv'))e.textContent=moves;
    if(e=document.getElementById('PMbar')){
      var pct;
      if(objective.kind==='score')pct=Math.min(100,score/objective.target*100);
      else if(objective.kind==='dew')pct=100-(objState.dewRemaining/objective.dew*100);
      else if(objective.kind==='thorns')pct=100-(objState.thornRemaining/objective.thorns*100);
      else if(objective.kind==='gather'){
        var got=0,need=0;
        for(var t in objState.gatherTargets){need+=objState.gatherTargets[t];got+=Math.min(objState.gatherGot[t]||0,objState.gatherTargets[t]);}
        pct=need>0?got/need*100:0;
      }
      else if(objective.kind==='mix'){
        var p1=Math.min(1,score/objective.target);
        var p2=1-(objState.dewRemaining/Math.max(1,objective.dew));
        var p3=1-(objState.thornRemaining/Math.max(1,objective.thorns));
        pct=(p1+p2+p3)/3*100;
      }
      else pct=100;
      e.style.width=pct+'%';
    }
    renderObjective();
  }

  function checkState(){
    if(isObjComplete()){
      level++;
      var prevLv=level-1;
      var finalScore=score; // capture BEFORE the reset — _sr recorded 0 for every win
      objective=genLevel(level);
      moves=objective.moves;
      score=0;
      resetObjState();
      sm('LEVEL '+prevLv+' COMPLETE!');
      banner('LEVEL COMPLETE','#c8a84b');
      _playWin();
      if(level>bestLevel){bestLevel=level;try{localStorage.setItem('lw_pm_level',String(bestLevel));}catch(e){}var bel=document.getElementById('PMbest');if(bel)bel.textContent=bestLevel;}
      if(!won){won=true;_e('game_win');}
      else _e('milestone');
      _sr('petalmatch',{w:true,s:finalScore,lv:prevLv});
      initGrid();while(findMatches().length>0||!findValidSwap())initGrid();
      updateHUD();render();return;
    }
    if(moves<=0){
      lost=true;
      sm('Out of moves. Retry the level or start over.');_play('lose');
      banner('OUT OF MOVES','#c47a7a');
      if(!won){_e('game_loss');_sr('petalmatch',{w:false,s:score,lv:level});}
      else _sr('petalmatch',{w:true,s:score,lv:level});
      return;
    }
    if(!findValidSwap()){
      sm('No moves, shuffling!');
      shuffleGrid();
    }
    lastInputAt=Date.now();hintCells=null;
  }

  function shuffleGrid(){
    // Shuffle types in place without making matches, capped retries.
    var attempts=0;
    while(attempts<40){
      attempts++;
      // Collect all non-thorn positions and types
      var types=[];
      for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        var cell=grid[r][c];
        if(cell&&cell.type>=0)types.push(cell.type);
      }
      // Fisher-Yates shuffle
      for(var i=types.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=types[i];types[i]=types[j];types[j]=t;}
      var idx=0;
      for(var r2=0;r2<ROWS;r2++)for(var c2=0;c2<COLS;c2++){
        var c2cell=grid[r2][c2];
        if(c2cell&&c2cell.type>=0){c2cell.type=types[idx++];}
      }
      if(findMatches().length===0&&findValidSwap())return;
    }
    // Fall back to fresh init if shuffles won't settle
    initGrid();
  }

  // ───────── hint ─────────
  function requestHint(){
    var v=findValidSwap();
    if(!v)return;
    hintCells=v;
    lastInputAt=Date.now()-10000; // keep visible until player moves
  }

  // ───────── drawing ─────────
  function drawFlower(type,cx,cy,sz,special){
    // Procedural flower by type. Each draws as 5-8 petals + center.
    var g=GEMS[type];
    ctx.save();
    var petalColor=g.color,midColor=g.mid,hiColor=g.hi;
    // Shadow base
    ctx.fillStyle='rgba(0,0,0,0.22)';
    ctx.beginPath();ctx.arc(cx,cy+sz*0.08,sz*0.88,0,Math.PI*2);ctx.fill();

    if(g.name==='rose'){
      // concentric rounded squares/circles, darker core
      for(var i=3;i>=0;i--){
        var rr=sz*(0.45+i*0.17);
        ctx.fillStyle=i===0?midColor:(i===1?petalColor:(i===2?hiColor:petalColor));
        ctx.globalAlpha=0.85+i*0.04;
        ctx.beginPath();
        for(var pi=0;pi<6;pi++){
          var ang=pi/6*Math.PI*2+i*0.3;
          var px=cx+Math.cos(ang)*rr;
          var py=cy+Math.sin(ang)*rr;
          if(pi===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
        }
        ctx.closePath();ctx.fill();
      }
      ctx.globalAlpha=1;
      ctx.fillStyle=midColor;
      ctx.beginPath();ctx.arc(cx,cy,sz*0.22,0,Math.PI*2);ctx.fill();
    } else if(g.name==='daisy'){
      // 8 oval white petals + yellow center
      ctx.fillStyle=petalColor;
      for(var k=0;k<8;k++){
        var ang2=k/8*Math.PI*2;
        ctx.save();
        ctx.translate(cx,cy);ctx.rotate(ang2);
        ctx.beginPath();ctx.ellipse(sz*0.5,0,sz*0.48,sz*0.22,0,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle=midColor;
      ctx.beginPath();ctx.arc(cx,cy,sz*0.38,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=hiColor;
      ctx.beginPath();ctx.arc(cx-sz*0.1,cy-sz*0.12,sz*0.14,0,Math.PI*2);ctx.fill();
    } else if(g.name==='violet'){
      // 5 petals, top 2 smaller
      ctx.fillStyle=petalColor;
      var angles=[-Math.PI/2-0.5,-Math.PI/2+0.5,Math.PI/2-0.7,Math.PI/2+0.7,Math.PI/2];
      var sizes=[0.42,0.42,0.55,0.55,0.6];
      for(var vi=0;vi<5;vi++){
        ctx.save();ctx.translate(cx,cy);ctx.rotate(angles[vi]);
        ctx.beginPath();ctx.ellipse(sz*0.42,0,sz*sizes[vi],sz*0.3,0,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle=midColor;
      ctx.beginPath();ctx.arc(cx,cy+sz*0.08,sz*0.16,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=hiColor;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(cx,cy+sz*0.08);ctx.lineTo(cx,cy+sz*0.4);ctx.stroke();
    } else if(g.name==='forgetmenot'){
      // 5 round petals + yellow center
      ctx.fillStyle=petalColor;
      for(var n=0;n<5;n++){
        var na=n/5*Math.PI*2-Math.PI/2;
        var px2=cx+Math.cos(na)*sz*0.5,py2=cy+Math.sin(na)*sz*0.5;
        ctx.beginPath();ctx.arc(px2,py2,sz*0.34,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle=midColor;
      ctx.beginPath();ctx.arc(cx,cy,sz*0.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff4dc';
      ctx.beginPath();ctx.arc(cx-sz*0.05,cy-sz*0.05,sz*0.08,0,Math.PI*2);ctx.fill();
    } else if(g.name==='clover'){
      // 3-leaf trefoil
      ctx.fillStyle=petalColor;
      var leafAngles=[-Math.PI/2,-Math.PI/2+2*Math.PI/3,-Math.PI/2+4*Math.PI/3];
      for(var ci=0;ci<3;ci++){
        var cla=leafAngles[ci];
        var lx=cx+Math.cos(cla)*sz*0.42,ly=cy+Math.sin(cla)*sz*0.42;
        ctx.beginPath();ctx.arc(lx,ly,sz*0.42,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle=midColor;
      ctx.beginPath();ctx.arc(cx,cy+sz*0.1,sz*0.18,0,Math.PI*2);ctx.fill();
      // highlight on top leaf
      ctx.fillStyle=hiColor;
      var tla=leafAngles[0];
      var hlx=cx+Math.cos(tla)*sz*0.36,hly=cy+Math.sin(tla)*sz*0.36;
      ctx.beginPath();ctx.arc(hlx-sz*0.1,hly-sz*0.1,sz*0.12,0,Math.PI*2);ctx.fill();
    } else if(g.name==='cherry'){
      // 5 notched petals
      ctx.fillStyle=petalColor;
      for(var ch=0;ch<5;ch++){
        var ca=ch/5*Math.PI*2-Math.PI/2;
        ctx.save();ctx.translate(cx,cy);ctx.rotate(ca);
        ctx.beginPath();
        ctx.moveTo(0,-sz*0.2);
        ctx.quadraticCurveTo(sz*0.3,-sz*0.6,sz*0.12,-sz*0.9);
        ctx.lineTo(0,-sz*0.7);
        ctx.lineTo(-sz*0.12,-sz*0.9);
        ctx.quadraticCurveTo(-sz*0.3,-sz*0.6,0,-sz*0.2);
        ctx.closePath();ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle=midColor;
      ctx.beginPath();ctx.arc(cx,cy,sz*0.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ffe8f0';
      ctx.beginPath();ctx.arc(cx-sz*0.07,cy-sz*0.07,sz*0.1,0,Math.PI*2);ctx.fill();
    }

    // Special overlays
    if(special==='vine'){
      ctx.strokeStyle='rgba(255,255,255,0.9)';ctx.lineWidth=Math.max(2,sz*0.14);
      ctx.beginPath();
      if(arguments.length>4&&arguments[5]==='h'){ctx.moveTo(cx-sz,cy);ctx.lineTo(cx+sz,cy);}
      else{ctx.moveTo(cx,cy-sz);ctx.lineTo(cx,cy+sz);}
      ctx.stroke();
    } else if(special==='burst'){
      var pulse=0.6+0.4*Math.sin(Date.now()*0.006);
      ctx.globalAlpha=pulse;
      ctx.strokeStyle='#ffd86b';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(cx,cy,sz*1.05,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
    }
    ctx.restore();
  }

  function drawThorn(cx,cy,sz,hp){
    ctx.save();
    ctx.fillStyle='#3a2216';
    ctx.strokeStyle='#1a0f08';ctx.lineWidth=2;
    // 6 jagged points
    ctx.beginPath();
    for(var i=0;i<12;i++){
      var a=i/12*Math.PI*2-Math.PI/2;
      var rad=i%2===0?sz:sz*0.5;
      var x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.fill();ctx.stroke();
    // HP dots on top
    ctx.fillStyle='#c47a50';
    for(var h=0;h<hp;h++){
      ctx.beginPath();ctx.arc(cx-sz*0.4+h*sz*0.3,cy-sz*0.75,sz*0.12,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawSpore(cx,cy,sz){
    var grad=ctx.createConicGradient?ctx.createConicGradient(spinAngle,cx,cy):null;
    if(grad){
      grad.addColorStop(0,'#c47a7a');grad.addColorStop(0.17,'#c8a84b');grad.addColorStop(0.33,'#7ab356');
      grad.addColorStop(0.5,'#5b9bd5');grad.addColorStop(0.67,'#9b6ba3');grad.addColorStop(0.83,'#e8dcc8');grad.addColorStop(1,'#c47a7a');
      ctx.fillStyle=grad;
    } else ctx.fillStyle='#e8dcc8';
    ctx.beginPath();ctx.arc(cx,cy,sz,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
    // inner swirl
    ctx.save();ctx.translate(cx,cy);ctx.rotate(spinAngle*2);
    ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.lineWidth=1.5;
    ctx.beginPath();
    for(var i=0;i<40;i++){
      var a=i/40*Math.PI*2,rad=sz*0.3+i*sz*0.014;
      var x=Math.cos(a)*rad,y=Math.sin(a)*rad;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════════════════════
     PAINTED ART (2026-07-26). Stephen's 23 sheets are cut, so the board
     draws his sprites instead of the procedural shapes it was standing in
     with. The procedural path is KEPT as the fallback and still runs if a
     sprite is missing or has not downloaded yet — the game is never blank
     while art loads, and it still works if the files ever go away.

     Sprites come from assets/games/petalmatch/runtime/, which holds 160px
     copies. The masters stay full size; a board cell is ~36 CSS px, so
     shipping 500px masters would be a 40MB download to draw thumbnails.
     ═══════════════════════════════════════════════════════════════════ */
  var PM_ART = (function(){
    var imgs = {}, base = '/assets/games/petalmatch/runtime/';
    var WANT = ['base-0','base-1','base-2','base-3','base-4','base-5',
                'spec-line-h','spec-line-v','spec-burst','spec-wild',
                'block-3','block-2','block-1','block-0','cover-2','cover-1',
                'cell-empty','cell-alt','cell-locked'];
    var loaded = 0;
    for(var i=0;i<WANT.length;i++){
      (function(k){
        var im = new Image();
        im.onload = function(){ imgs[k] = im; loaded++; };
        im.onerror = function(){ /* leave it out; the fallback covers it */ };
        im.src = base + k + '.png';
      })(WANT[i]);
    }
    /* box = the width AND height of the square the sprite must fit inside,
       in board pixels. Every sprite is trimmed hard to its own alpha (measured:
       the painted pixels reach all four edges of all 16 files), so a box of one
       CELL draws a flower edge to edge. Aspect is preserved, so a wide piece
       like spec-line-h fills the width and centres vertically. */
    function put(k,cx,cy,box){
      var im = imgs[k];
      if(!im) return false;
      var r = Math.min(box/im.width, box/im.height);
      var w = im.width*r, h = im.height*r;
      ctx.drawImage(im, cx-w/2, cy-h/2, w, h);
      return true;
    }
    return {
      count:function(){ return loaded; },
      /* The painted board tile, drawn UNDER everything. Full cell, no gap —
         these are square tiles with their own bevelled edge, so they butt up
         against each other the way the sheet was painted. */
      tile:function(alt,x,y,sz){
        return put(alt ? 'cell-alt' : 'cell-empty', x+sz/2, y+sz/2, sz);
      },
      /* The dew/ice tile cover, drawn UNDER the piece. jelly is the number of
         layers still on this square. */
      cover:function(layers,cx,cy,sz){
        return put(layers >= 2 ? 'cover-2' : 'cover-1', cx, cy, sz);
      },
      /* Returns true when it has drawn the cell, false to let the
         procedural renderer handle it. `box` is the full square to fill. */
      draw:function(cell,cx,cy,box){
        var k = null;
        if(cell.type === -2){
          var hp = cell.block|0;
          k = 'block-' + (hp>=3?3:(hp>=1?hp:0));
        } else if(cell.special === 'spore' || cell.type === -1){
          k = 'spec-wild';
        } else if(cell.special === 'vine'){
          k = (cell.stripeDir === 'v') ? 'spec-line-v' : 'spec-line-h';
        } else if(cell.special === 'burst'){
          k = 'spec-burst';
        } else if(cell.type >= 0){
          k = 'base-' + (cell.type % 6);
        }
        if(!k) return false;
        return put(k, cx, cy, box);
      }
    };
  })();
  window.PM_ART = PM_ART;

  function drawGem(cell,cx,cy,sz){
    /* ⛔ sz is the PROCEDURAL RADIUS (CELL*0.4 at rest, times the pop/bounce
       animation scale). The painted sprites are trimmed to their own alpha and
       want the whole CELL, so handing them sz drew every flower into a box
       under half a cell wide — a big petal painting floating in dead space.
       Stephen 2026-07-26: "the flowers should fill the boxes."
       Divide out the 0.4 to recover the animation scale, then multiply by the
       fill fraction. Keep it derived like this: the procedural fallback below
       still needs sz as a radius, so the two must not be hand-synced. */
    if(PM_ART.draw(cell,cx,cy,sz*(PM_FILL/0.4))) return;
    if(cell.type===-2){drawThorn(cx,cy,sz,cell.block);return;}
    if(cell.type===-1||cell.special==='spore'){drawSpore(cx,cy,sz);return;}
    drawFlower(cell.type,cx,cy,sz,cell.special,cell.stripeDir);
  }

  function drawFx(){
    var now=Date.now(),keep=[];
    for(var i=0;i<fx.length;i++){
      var f=fx[i],age=now-f.t;
      if(f.kind==='sweep'){
        if(age>180)continue;
        var a2=1-age/180;
        ctx.save();ctx.globalAlpha=a2;ctx.fillStyle='rgba(200,168,75,0.6)';
        if(f.dir==='h')ctx.fillRect(0,f.r*CELL,COLS*CELL,CELL);
        else ctx.fillRect(f.c*CELL,0,CELL,ROWS*CELL);
        ctx.restore();
      } else if(f.kind==='flash'){
        if(age>180)continue;
        var a3=1-age/180,half=(f.size||3)/2;
        ctx.save();ctx.globalAlpha=a3;ctx.fillStyle='rgba(255,216,107,0.5)';
        ctx.fillRect((f.c-Math.floor(half))*CELL,(f.r-Math.floor(half))*CELL,f.size*CELL,f.size*CELL);
        ctx.restore();
      } else if(f.kind==='dewstrip'){
        if(age>240)continue;
        var a4=1-age/240;
        ctx.save();ctx.globalAlpha=a4;ctx.strokeStyle='rgba(155,200,255,0.9)';ctx.lineWidth=2;
        var rad=(age/240)*CELL*0.7;
        ctx.beginPath();ctx.arc(f.c*CELL+CELL/2,f.r*CELL+CELL/2,rad,0,Math.PI*2);ctx.stroke();
        ctx.restore();
      } else if(f.kind==='beam'){
        if(age>250)continue;
      }
      keep.push(f);
    }
    fx=keep;
  }

  function render(){
    if(!ctx)return;
    spinAngle+=0.02;
    var ch=CHAPTERS[objective.chapter];
    var w=COLS*CELL,h=ROWS*CELL;
    ctx.fillStyle=ch.bg;ctx.fillRect(0,0,w,h);
    for(var r=0;r<ROWS;r++){
      for(var c=0;c<COLS;c++){
        var cell=grid[r][c];
        var jelly=cell&&cell.jelly||0;
        /* Painted board tile (cell-empty / cell-alt alternating) when it has
           loaded. The flat two-tone checker stays as the fallback so the board
           is never a blank rectangle while the art downloads. */
        if(!PM_ART.tile((r+c)%2===1, c*CELL, r*CELL, CELL)){
          ctx.fillStyle=(r+c)%2===0?ch.tile1:ch.tile2;
          ctx.fillRect(c*CELL,r*CELL,CELL,CELL);
        }
        // Jelly overlay — translucent dew/moss tint
        if(jelly>0){
          // Painted ice-cover art when it has loaded; the old tint is the
          // fallback so a dew level is never invisible while art downloads.
          if(!PM_ART.cover(jelly, c*CELL+CELL/2, r*CELL+CELL/2, CELL)){
            ctx.fillStyle=jelly===2?'rgba(155,200,255,0.35)':'rgba(155,200,255,0.2)';
            ctx.fillRect(c*CELL+2,r*CELL+2,CELL-4,CELL-4);
            ctx.strokeStyle='rgba(200,230,255,0.6)';ctx.lineWidth=1;
            ctx.strokeRect(c*CELL+3,r*CELL+3,CELL-6,CELL-6);
          }
        }
      }
    }
    // hint overlay
    if(hintCells&&Date.now()-lastInputAt>4500){
      ctx.save();
      ctx.strokeStyle='rgba(232,220,200,'+(0.5+0.5*Math.sin(Date.now()*0.008))+')';
      ctx.lineWidth=3;
      for(var hi=0;hi<hintCells.length;hi++){
        var hr=hintCells[hi][0],hc=hintCells[hi][1];
        ctx.strokeRect(hc*CELL+3,hr*CELL+3,CELL-6,CELL-6);
      }
      ctx.restore();
    }
    var now=Date.now();
    for(r=0;r<ROWS;r++){
      for(c=0;c<COLS;c++){
        var cell=grid[r][c];if(!cell)continue;
        // Lerp X and Y toward targets. 0.18 is the sweet spot — visible motion, no lag.
        if(cell.x===undefined){cell.x=c*CELL;cell.targetX=c*CELL;}
        if(cell.x!==cell.targetX){cell.x+=(cell.targetX-cell.x)*0.22;if(Math.abs(cell.x-cell.targetX)<0.5)cell.x=cell.targetX;}
        if(cell.y!==cell.targetY){cell.y+=(cell.targetY-cell.y)*0.18;if(Math.abs(cell.y-cell.targetY)<0.5)cell.y=cell.targetY;}
        var cx=cell.x+CELL/2,cy=cell.y+CELL/2;
        // Clear animation: 0-90ms pop up 1.0 to 1.25, 90-280ms fade down to 0 with slight spin
        var renderScale=cell.scale||1;
        if(cell.clearAt){
          var ca=now-cell.clearAt;
          if(ca<90){renderScale=1+(ca/90)*0.25;}
          else if(ca<280){renderScale=1.25*(1-(ca-90)/190);if(renderScale<0)renderScale=0;}
          else{renderScale=0;}
        }
        // Settle bounce: when a cell lands, briefly scale 1.0 -> 1.08 -> 1.0 over 180ms
        if(cell.bounceAt&&now>=cell.bounceAt&&cell.y===cell.targetY){
          var ba=now-cell.bounceAt;
          if(ba<180){renderScale=renderScale*(1+Math.sin(ba/180*Math.PI)*0.08);}
          else{cell.bounceAt=0;}
        }
        var spawnBoost=0;
        if(cell.spawnAnim){
          var age=now-cell.spawnAnim;
          if(age<280){var t=age/280;spawnBoost=Math.sin(t*Math.PI)*0.3;}
          else cell.spawnAnim=0;
        }
        var sz=CELL*0.4*renderScale*(1+spawnBoost);
        if(sz>0.5)drawGem(cell,cx,cy,sz);
        // Clear-spark ring when pop peaks
        if(cell.clearAt){
          var ca2=now-cell.clearAt;
          if(ca2>60&&ca2<220){
            var ringA=1-(ca2-60)/160;
            ctx.save();ctx.globalAlpha=ringA*0.7;
            ctx.strokeStyle=cell.type===-1?'#e8dcc8':(GEMS[cell.type]?GEMS[cell.type].color:'#c8a84b');
            ctx.lineWidth=2;
            var rad=CELL*0.35+(ca2-60)/160*CELL*0.5;
            ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.stroke();
            ctx.restore();
          }
        }
        if(selected&&selected.r===r&&selected.c===c){
          ctx.strokeStyle='#e8dcc8';ctx.lineWidth=2;
          ctx.strokeRect(c*CELL+2,r*CELL+2,CELL-4,CELL-4);
        }
      }
    }
    drawFx();
    // idle hint auto-trigger
    if(!animating&&!hintCells&&Date.now()-lastInputAt>5000){
      requestHint();
    }
  }

  var rafId=0;
  var _pmDead=false;
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){_pmDead=true;if(rafId){cancelAnimationFrame(rafId);rafId=0;}});
  function loop(){
    if(!document.body.classList.contains('game-active')){rafId=0;return;}
    if(_pmDead){rafId=0;return;} // game switched without leaving game-active (2026-07-03)
    render();rafId=requestAnimationFrame(loop);
  }

  // ───────── input ─────────
  var tsR=-1,tsC=-1;
  function handleStart(x,y){
    if(animating||lost||moves<=0)return;
    var rect=canvas.getBoundingClientRect();
    tsR=Math.floor((y-rect.top)/CELL);tsC=Math.floor((x-rect.left)/CELL);
    if(tsR<0||tsR>=ROWS||tsC<0||tsC>=COLS){tsR=-1;return;}
    if(!canSwap(tsR,tsC)){tsR=-1;return;}
    selected={r:tsR,c:tsC};
    lastInputAt=Date.now();hintCells=null;
  }
  function handleEnd(x,y){
    if(animating||lost||moves<=0||tsR<0)return;
    var rect=canvas.getBoundingClientRect();
    var endR=Math.floor((y-rect.top)/CELL),endC=Math.floor((x-rect.left)/CELL);
    var dr=endR-tsR,dc=endC-tsC;
    var swapR=tsR,swapC=tsC;
    if(Math.abs(dc)>Math.abs(dr)){swapC+=dc>0?1:-1;}
    else if(Math.abs(dr)>0){swapR+=dr>0?1:-1;}
    else{selected=null;return;}
    if(swapR<0||swapR>=ROWS||swapC<0||swapC>=COLS){selected=null;return;}
    if(!canSwap(swapR,swapC)){selected=null;tsR=-1;return;}
    var cellA=grid[tsR][tsC],cellB=grid[swapR][swapC];
    var aSpec=cellA&&cellA.special,bSpec=cellB&&cellB.special;
    swap(tsR,tsC,swapR,swapC);

    if(aSpec||bSpec){
      moves--;updateHUD();animating=true;hintCells=null;lastInputAt=Date.now();
      var swapPair=null;
      if(aSpec&&bSpec){
        swapPair={a:{r:swapR,c:swapC,cell:grid[swapR][swapC]},b:{r:tsR,c:tsC,cell:grid[tsR][tsC]}};
      } else if(aSpec===null&&bSpec==='spore'){
        swapPair={a:{r:tsR,c:tsC,cell:grid[tsR][tsC]},b:{r:swapR,c:swapC,cell:grid[swapR][swapC]}};
      } else if(aSpec==='spore'&&bSpec===null){
        swapPair={a:{r:swapR,c:swapC,cell:grid[swapR][swapC]},b:{r:tsR,c:tsC,cell:grid[tsR][tsC]}};
      }
      if(swapPair&&(swapPair.a.cell.special==='spore')&&!swapPair.b.cell.special){
        var tgt=swapPair.b.cell.type;
        var toClear={},queue=[];
        toClear[swapPair.a.r+','+swapPair.a.c]=1;queue.push(swapPair.a.r+','+swapPair.a.c);
        toClear[swapPair.b.r+','+swapPair.b.c]=1;
        if(tgt>=0)clearColor(tgt,toClear,queue);
        var pendBP=[];
        expandActivations(toClear,pendBP);
        var counts=applyClear(toClear);
        var pts=(counts.p*10+counts.v*20+counts.b*30+counts.s*40+counts.dew*15+counts.thorns*25)*5*level;
        score+=pts;banner('SPORE!','#e8dcc8');sm('SPORE! +'+pts);_play('snap');
        collapseAndRefill();updateHUD();
        setTimeout(function(){resolveCascade(null,null,function(){animating=false;selected=null;checkState();});},250);
      } else if(swapPair===null&&(aSpec==='vine'||aSpec==='burst'||bSpec==='vine'||bSpec==='burst')){
        var spR=aSpec?swapR:tsR,spC=aSpec?swapC:tsC;
        var toClear2={},pendBP2=[];
        toClear2[spR+','+spC]=1;
        expandActivations(toClear2,pendBP2);
        var counts2=applyClear(toClear2);
        var pts2=(counts2.p*10+counts2.v*20+counts2.b*30+counts2.s*40+counts2.dew*15+counts2.thorns*25)*level;
        score+=pts2;sm('+'+pts2);_play('snap');
        collapseAndRefill();updateHUD();
        setTimeout(function(){resolveCascade(null,null,function(){animating=false;selected=null;checkState();});},250);
      } else {
        resolveCascade({r:swapR,c:swapC},swapPair,function(){animating=false;selected=null;checkState();});
      }
    } else if(findMatches().length>0){
      moves--;updateHUD();animating=true;hintCells=null;lastInputAt=Date.now();
      resolveCascade({r:swapR,c:swapC},null,function(){animating=false;selected=null;checkState();});
    } else {
      // Invalid swap: let the pieces visibly try and bump back so the player
      // sees the rejection instead of the swap just vanishing.
      animating=true;
      var _tsR=tsR,_tsC=tsC,_swapR=swapR,_swapC=swapC;
      setTimeout(function(){
        swap(_tsR,_tsC,_swapR,_swapC);
        animating=false;selected=null;_play('tap');
      },160);
    }
    tsR=-1;tsC=-1;
  }

  canvas.addEventListener('touchstart',function(e){e.preventDefault();if(e.touches[0])handleStart(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
  canvas.addEventListener('touchend',function(e){e.preventDefault();if(e.changedTouches[0])handleEnd(e.changedTouches[0].clientX,e.changedTouches[0].clientY);},{passive:false});
  canvas.addEventListener('mousedown',function(e){handleStart(e.clientX,e.clientY);});
  canvas.addEventListener('mouseup',function(e){handleEnd(e.clientX,e.clientY);});

  /* ⛔ 2026-07-25, reported by a player: "when you run out of moves and start a new
     game, the hint it shows is always the last hint from the previous game and often
     incorrect." Exactly right. Both restart paths rebuilt the grid but never cleared
     hintCells, so the OLD board's coordinates survived and got drawn over the NEW
     board. lastInputAt has to move too, or the 5s idle timer fires a hint instantly
     on a board the player has not even looked at yet. */
  function clearHint(){ hintCells=null; hintTimer=0; lastInputAt=Date.now(); }

  window._PMN=function(){
    if(rafId)cancelAnimationFrame(rafId);
    clearHint();
    initCanvas();level=bestLevel;score=0;won=false;lost=false;animating=false;selected=null;fx=[];
    objective=genLevel(level);moves=objective.moves;
    resetObjState();
    initGrid();while(findMatches().length>0||!findValidSwap())initGrid();
    updateHUD();rafId=requestAnimationFrame(loop);
    sm('Swipe to swap. Match 3+ flowers.');
  };
  window._PMR=function(){
    // Retry this level with fresh board and moves, don't reset progression
    if(rafId)cancelAnimationFrame(rafId);
    clearHint();                    // same stale-hint bug as _PMN, same fix
    initCanvas();score=0;won=false;lost=false;animating=false;selected=null;fx=[];
    objective=genLevel(level);moves=objective.moves;
    resetObjState();
    initGrid();while(findMatches().length>0||!findValidSwap())initGrid();
    updateHUD();rafId=requestAnimationFrame(loop);
    sm('Retrying level '+level);
  };
  window._PMH=function(){requestHint();};

  /* ═══════════════════════════════════════════════════════════════════
     BALANCE HARNESS (2026-07-25)

     ⛔ THIS DUPLICATES NO GAME LOGIC ON PURPOSE. The rarity engine was
     hand-mirrored in a sim twice, drifted from the live code twice, and
     shipped a wrong distribution both times. So this hook drives the REAL
     handleEnd() through the REAL swap path with synthetic coordinates. If
     the game changes, the harness changes with it, for free.

     Used by scripts/petalmatch_balance.js to measure the actual win rate of
     every level with a bot, instead of guessing at difficulty numbers.
     Costs nothing at runtime: it defines functions and never calls them.
     ═══════════════════════════════════════════════════════════════════ */
  window._PM_TEST={
    // Every legal move on the board right now, as [[r1,c1],[r2,c2]] pairs.
    // Uses the real canSwap/findMatches, same as findValidSwap does.
    moves:function(){
      var out=[],r,c;
      for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++){
        if(!canSwap(r,c))continue;
        if(c<COLS-1&&canSwap(r,c+1)){
          swap(r,c,r,c+1);
          if(findMatches().length>0)out.push([[r,c],[r,c+1]]);
          swap(r,c,r,c+1);
        }
        if(r<ROWS-1&&canSwap(r+1,c)){
          swap(r,c,r+1,c);
          if(findMatches().length>0)out.push([[r,c],[r+1,c]]);
          swap(r,c,r+1,c);
        }
      }
      // special+anything is always legal
      for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++){
        var cell=grid[r][c];
        if(cell&&cell.special){
          if(c<COLS-1&&canSwap(r,c+1))out.push([[r,c],[r,c+1]]);
          else if(r<ROWS-1&&canSwap(r+1,c))out.push([[r,c],[r+1,c]]);
        }
      }
      return out;
    },
    /* Every legal move, SCORED by how much it advances the current objective.
       A random-move bot badly under-rates blocker levels, because a human aims
       at the blockers and a coin flip does not. Balancing against a bot weaker
       than a real player would make the whole ladder too easy.
       Uses the real findMatches(), so the cells counted here are the cells the
       engine would actually clear. */
    movesScored:function(){
      var kind=objective&&objective.kind, out=[], r, c;
      function scoreSwap(ar,ac,br,bc){
        swap(ar,ac,br,bc);
        var groups=findMatches(), n=0, jelly=0, thorn=0, seen={};
        for(var g=0;g<groups.length;g++){
          for(var i=0;i<groups[g].length;i++){
            var cell=groups[g][i], k=cell.r+','+cell.c;
            if(seen[k])continue; seen[k]=1; n++;
            var gc=grid[cell.r]&&grid[cell.r][cell.c];
            if(gc&&gc.jelly>0)jelly++;
            // a thorn is broken by a match ADJACENT to it, so look around
            var d=[[1,0],[-1,0],[0,1],[0,-1]];
            for(var q=0;q<4;q++){
              var nr=cell.r+d[q][0], nc2=cell.c+d[q][1];
              if(inBounds(nr,nc2)&&grid[nr][nc2]&&grid[nr][nc2].type===-2)thorn++;
            }
          }
        }
        swap(ar,ac,br,bc);
        if(!n)return -1;
        var s=n;                                  // bigger matches make specials
        if(n>=4)s+=3;                             // actively chase specials
        if(kind==='dew'||kind==='mix')s+=jelly*5;
        if(kind==='thorns'||kind==='mix')s+=thorn*5;
        return s;
      }
      for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++){
        if(!canSwap(r,c))continue;
        if(c<COLS-1&&canSwap(r,c+1)){
          var s1=scoreSwap(r,c,r,c+1);
          if(s1>=0)out.push({a:[r,c],b:[r,c+1],s:s1});
        }
        if(r<ROWS-1&&canSwap(r+1,c)){
          var s2=scoreSwap(r,c,r+1,c);
          if(s2>=0)out.push({a:[r,c],b:[r+1,c],s:s2});
        }
      }
      // firing an existing special is usually strong, rate it highly
      for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++){
        var cl=grid[r][c];
        if(cl&&cl.special){
          if(c<COLS-1&&canSwap(r,c+1))out.push({a:[r,c],b:[r,c+1],s:9});
          else if(r<ROWS-1&&canSwap(r+1,c))out.push({a:[r,c],b:[r+1,c],s:9});
        }
      }
      return out;
    },
    // Play one move by driving the REAL input handler.
    play:function(r1,c1,r2,c2){
      var rect=canvas.getBoundingClientRect();
      tsR=r1;tsC=c1;selected={r:r1,c:c1};
      handleEnd(rect.left+(c2+0.5)*CELL, rect.top+(r2+0.5)*CELL);
    },
    state:function(){
      return {level:level,score:score,moves:moves,lost:lost,won:won,
              animating:animating,objKind:objective&&objective.kind,
              objLabel:objective&&objective.label,
              dew:objState.dewRemaining,thorns:objState.thornRemaining,
              complete:isObjComplete()};
    },
    // Jump straight to a level for measurement.
    setLevel:function(lv){
      level=lv;objective=genLevel(lv);moves=objective.moves;
      score=0;won=false;lost=false;animating=false;selected=null;fx=[];
      resetObjState();
      initGrid();while(findMatches().length>0||!findValidSwap())initGrid();
      updateHUD();
    },
    genLevel:function(lv){return genLevel(lv);}
  };

  _PMN();
};
})();
