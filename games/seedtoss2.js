// ═══ LUCID WINDS — Seed Toss (flick-into-pot physics) ═══
// Distinct from the existing dice-based 'Seed Toss' (yahtzee) game.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;


// ── SEED & POT PROGRESSION (unlock at higher levels) ──
// Art is Midjourney-replaceable: each entry has {name, color, gradient[2], particles[3]} for seeds
// and {name, baseColor, rimColor} for pots. When art lands, swap colors for img refs.
var SEED_TIERS = [
  { lvl: 1,  name: 'Sunflower Seed',   inner:'#e8c860', outer:'#a08030', glow:'rgba(200,168,75,0.15)', particles:['#7ab356','#c8a84b','#e8dcc8'] },
  { lvl: 3,  name: 'Poppy Seed',       inner:'#c47a7a', outer:'#7a3a3a', glow:'rgba(196,122,122,0.18)', particles:['#c47a7a','#e8a0bf','#f0d0d0'] },
  { lvl: 5,  name: 'Acorn',            inner:'#a08040', outer:'#4a2a10', glow:'rgba(160,128,64,0.18)', particles:['#a08040','#6a4020','#e8dcc8'] },
  { lvl: 7,  name: 'Starfruit Pit',    inner:'#d4ff70', outer:'#6a9a2a', glow:'rgba(212,255,112,0.2)', particles:['#d4ff70','#7ab356','#ffffff'] },
  { lvl: 10, name: 'Moonstone Kernel', inner:'#e8e0f0', outer:'#8080a0', glow:'rgba(232,224,240,0.25)', particles:['#e8e0f0','#c8a8e8','#ffffff'] },
  { lvl: 15, name: 'Phoenix Ember',    inner:'#ffa040', outer:'#c04020', glow:'rgba(255,160,64,0.3)', particles:['#ffa040','#ff6020','#ffe0a0'] }
];
var POT_TIERS = [
  { lvl: 1,  name: 'Clay Pot',      base:'#6b4a2a', rim:'#5a3a1a' },
  { lvl: 4,  name: 'Terracotta',    base:'#b06040', rim:'#8a4020' },
  { lvl: 6,  name: 'Glazed Urn',    base:'#406080', rim:'#2a4060' },
  { lvl: 9,  name: 'Jade Vessel',   base:'#5aa070', rim:'#3a7050' },
  { lvl: 12, name: 'Golden Pot',    base:'#d4a843', rim:'#a07a20' },
  { lvl: 18, name: 'Cosmic Cradle', base:'#602080', rim:'#300a40' }
];
// Pot SIZES (separate from pot art tiers). Smaller = higher multiplier.
// Unlock cadence: LARGE is free, MEDIUM unlocks at a lifetime XP/level
// milestone, SMALL later. We store the highest level the player has
// ever reached in lw_st_best_lvl so they don't lose access if a run
// ends at L1.
var POT_SIZES=[
  { key:'large',  name:'LARGE',  unlockAt:1, mult:1.0, minW:60, maxW:90, hint:'Easy target, standard reward' },
  { key:'medium', name:'MEDIUM', unlockAt:4, mult:1.5, minW:40, maxW:60, hint:'1.5× score for every seed' },
  { key:'small',  name:'SMALL',  unlockAt:8, mult:2.5, minW:26, maxW:40, hint:'2.5× score · precision mode' }
];
function _STbestLevel(){try{return parseInt(localStorage.getItem('lw_st_best_lvl')||'1',10)||1;}catch(e){return 1;}}
function _STsaveBestLevel(n){try{var b=_STbestLevel();if(n>b)localStorage.setItem('lw_st_best_lvl',String(n));}catch(e){}}
function _STcurrentSeedTier(lvl){var t=SEED_TIERS[0];for(var i=0;i<SEED_TIERS.length;i++)if(lvl>=SEED_TIERS[i].lvl)t=SEED_TIERS[i];return t;}
function _STcurrentPotTier(lvl){var t=POT_TIERS[0];for(var i=0;i<POT_TIERS.length;i++)if(lvl>=POT_TIERS[i].lvl)t=POT_TIERS[i];return t;}
function _STnextSeedUnlock(lvl){for(var i=0;i<SEED_TIERS.length;i++)if(SEED_TIERS[i].lvl>lvl)return SEED_TIERS[i];return null;}
function _STnextPotUnlock(lvl){for(var i=0;i<POT_TIERS.length;i++)if(POT_TIERS[i].lvl>lvl)return POT_TIERS[i];return null;}

window._gameFns=window._gameFns||{};
window._gameFns.seedtoss2=function ST(a){
  var GRAVITY=800,SEED_RADIUS=8;
  var W=380,H=480,GROUND_Y;
  var canvas,ctx;
  var score=0,streak=0,bestStreak=0,level=1,seedsLeft=15,totalMade=0,totalThrown=0;
  var seed=null,pot=null,wind=0,peakHeight=0;
  var phase='ready';
  var particles=[];
  var touchStart=null,touchHistory=[];
  var rafId=0,running=false;
  var currentSize=POT_SIZES[0];   // active pot size (LARGE by default)
  var scoreMult=1.0;                // multiplier applied to earned points
  // Visible default on the size picker. Defaults to last-used (persisted)
  // so returning players land on their preference, and the bottom NEW
  // button can launch directly with this without a second tap.
  var highlightedSize=(function(){
    try{
      var k=localStorage.getItem('lw_st_last_size')||'large';
      for(var i=0;i<POT_SIZES.length;i++)if(POT_SIZES[i].key===k)return POT_SIZES[i];
    }catch(e){}
    return POT_SIZES[0];
  })();
  var pickerOpen=false;             // true while the pre-round size modal is showing
  // Skin layer state — weather, parallax, pot sway, bullseye flash
  var weatherType=null;             // 'rain' | 'snow' | 'leaves' | 'mist' | null
  var weatherPoints=[];
  var parallaxT=0;
  var bullseyeFlash=0;              // 0..1, decays after a dead-center toss

  ms(a,'Score <span id="STs">0</span> · Toss <span id="STq">0</span>/15 · L<span id="STl">1</span>');
  mm(a);
  var pan=document.createElement('div');pan.id='STpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:8px;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_STN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function setup(){
    pan.innerHTML='<canvas id="STc" width="'+W+'" height="'+H+'" style="background:#0d100c;border:1px solid rgba(122,179,86,0.2);border-radius:10px;touch-action:none;max-width:100%;"></canvas><div id="STmsg" style="font-family:Bebas Neue,sans-serif;font-size:0.9rem;color:var(--cream);min-height:20px;margin-top:6px;"></div>';
    canvas=document.getElementById('STc');ctx=canvas.getContext('2d');
    GROUND_Y=H*0.88;
    canvas.addEventListener('touchstart',onDown,{passive:false});
    canvas.addEventListener('touchmove',onMove,{passive:false});
    canvas.addEventListener('touchend',onUp,{passive:false});
    canvas.addEventListener('mousedown',onDown);
    canvas.addEventListener('mousemove',onMove);
    canvas.addEventListener('mouseup',onUp);
  }

  function getPos(e){
    var r=canvas.getBoundingClientRect();
    var sx=W/r.width,sy=H/r.height;
    if(e.touches&&e.touches.length>0)return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy};
    return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};
  }

  function genPot(){
    GROUND_Y=H*0.88;
    // Pot width range comes from the player-chosen size, not from level.
    // Keeps the size contract honest: if they picked SMALL, every pot
    // is small. Level still controls art tier, wind, and position spread.
    var minW=currentSize.minW,maxW=currentSize.maxW;
    var pw=minW+Math.random()*(maxW-minW);
    var ph=pw*0.7;
    var baseX=W*0.5,spread=W*0.15+level*W*0.02;
    var px=Math.max(pw/2+10,Math.min(W-pw/2-10,baseX+(Math.random()-0.5)*spread));
    var py=GROUND_Y;
    if(level>=4&&Math.random()<0.3)py=GROUND_Y-40-Math.random()*50;
    pot={x:px,y:py,width:pw,height:ph};
    wind=level>=3?(Math.random()-0.5)*60*Math.min(level*0.4,3):0;
    pickWeather();
  }

  function resetSeed(){
    seed={x:W/2,y:H*0.78,vx:0,vy:0,active:false,trail:[]};
    phase='ready';
    peakHeight=seed.y;  // track topmost (smallest y) point reached
  }

  function onDown(e){
    e.preventDefault();
    if(phase!=='ready'||!seed)return;
    var p=getPos(e);
    var dx=p.x-seed.x,dy=p.y-seed.y;
    if(Math.sqrt(dx*dx+dy*dy)>60)return;
    phase='aiming';
    touchStart={x:p.x,y:p.y,time:Date.now()};
    touchHistory=[{x:p.x,y:p.y,time:Date.now()}];
  }

  function onMove(e){
    e.preventDefault();
    if(phase!=='aiming')return;
    var p=getPos(e);
    touchHistory.push({x:p.x,y:p.y,time:Date.now()});
    if(touchHistory.length>10)touchHistory.shift();
    seed.x=p.x;seed.y=p.y;
  }

  function onUp(e){
    e.preventDefault();
    if(phase!=='aiming')return;
    var vx=0,vy=0;
    if(touchHistory.length>=2){
      var recent=touchHistory[touchHistory.length-1];
      var older=touchHistory[Math.max(0,touchHistory.length-4)];
      var dt=(recent.time-older.time)/1000;
      if(dt>0.001){vx=(recent.x-older.x)/dt;vy=(recent.y-older.y)/dt;}
    }
    var speed=Math.sqrt(vx*vx+vy*vy);
    if(speed<100||vy>-50){resetSeed();return;}
    var cap=1200;if(speed>cap){var s=cap/speed;vx*=s;vy*=s;}
    seed.vx=vx;seed.vy=vy;seed.active=true;
    phase='flying';seedsLeft--;totalThrown++;
    updateHUD();
  }

  function updateSeed(dt){
    if(!seed||!seed.active)return;
    seed.vy+=GRAVITY*dt;seed.vx+=wind*dt;
    seed.x+=seed.vx*dt;seed.y+=seed.vy*dt;
    // Track peak arc height (min y) for bonus scoring
    if(seed.y<peakHeight)peakHeight=seed.y;
    seed.trail.push({x:seed.x,y:seed.y,life:0.5});
    if(seed.trail.length>20)seed.trail.shift();
    var pl=pot.x-pot.width/2,pr=pot.x+pot.width/2;
    var ptTop=pot.y-pot.height-4;
    if(seed.x>pl+4&&seed.x<pr-4&&seed.y>ptTop&&seed.y<ptTop+20&&seed.vy>0){scored();return;}
    if(seed.y>ptTop&&seed.y<pot.y){
      if((seed.x>pl-8&&seed.x<pl+8)||(seed.x>pr-8&&seed.x<pr+8)){
        seed.vx=-seed.vx*0.3;seed.vy=-seed.vy*0.2;
      }
    }
    // Let the seed fly arbitrarily high — peakHeight tracks it even above
    // the canvas edge so massive arcs still score. Only a side-exit or
    // landing past ground counts as a miss.
    if(seed.y>GROUND_Y||seed.x<-50||seed.x>W+50)missed();
  }

  function scored(){
    phase='scored';seed.active=false;totalMade++;
    streak++;if(streak>bestStreak)bestStreak=streak;
    var pts=100*level+(streak>1?(streak-1)*25:0);
    var dist=Math.abs(seed.x-pot.x);
    if(dist<5)pts+=50;else if(dist<15)pts+=25;
    // ── HEIGHT BONUS — higher arcs are harder and worth more ──
    // arcTop = pixels above pot rim that the seed peaked at. peakHeight
    // can go NEGATIVE (above the canvas top) — we score that too, since
    // the ladder extends off-screen. 1 point per 2 pixels of height,
    // capped at +1000 so the core "land it in the pot" reward still
    // leads the scoring.
    var potTop=pot.y-pot.height-4;
    var arcTop=Math.max(0,potTop-peakHeight);
    var heightBonus=Math.min(1000,Math.floor(arcTop/2));
    // Toast tier labels.
    var heightLabel='';
    if(heightBonus>=800)heightLabel=' · ORBIT!';
    else if(heightBonus>=500)heightLabel=' · STRATOSPHERE!';
    else if(heightBonus>=300)heightLabel=' · SKY!';
    else if(heightBonus>=150)heightLabel=' · HIGH';
    else if(heightBonus>=50)heightLabel=' · GOOD';
    else if(heightBonus>0)heightLabel=' · OK';
    pts+=heightBonus;
    if(heightBonus>0)heightLabel=' (+'+heightBonus+')'+heightLabel;
    // Apply pot-size multiplier
    pts=Math.round(pts*scoreMult);
    score+=pts;
    var multTag=scoreMult>1?' ×'+scoreMult:'';
    var isBullseye=dist<5;
    setMsg((isBullseye?'BULLSEYE · +':'+')+pts+multTag+heightLabel);
    // Pop particles — bigger burst + gold mix on bullseyes
    var seedTier=_STcurrentSeedTier(level);
    var burstCount=isBullseye?32:16;
    var burstSpeed=isBullseye?90:60;
    for(var i=0;i<burstCount;i++){
      var ang=Math.random()*Math.PI*2,sp=burstSpeed+Math.random()*120;
      var pcol=isBullseye&&i%3===0?'#ffe080':seedTier.particles[Math.floor(Math.random()*3)];
      particles.push({x:pot.x,y:pot.y-pot.height,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-80,life:isBullseye?1.1:0.8,maxLife:isBullseye?1.1:0.8,size:2+Math.random()*(isBullseye?4:3),color:pcol});
    }
    if(isBullseye){
      bullseyeFlash=1.0;
      try{if(_playWin)_playWin();}catch(e){}
    }
    _e('progress');
    if(streak%5===0)_e('milestone');
    if(totalMade%5===0){
      level++;
      _STsaveBestLevel(level);
      // Check for seed/pot art unlocks at this new level
      var unlockMsg='LEVEL '+level+'!';
      for(var u=0;u<SEED_TIERS.length;u++){if(SEED_TIERS[u].lvl===level){unlockMsg='🌱 '+SEED_TIERS[u].name.toUpperCase()+' UNLOCKED!';break;}}
      for(u=0;u<POT_TIERS.length;u++){if(POT_TIERS[u].lvl===level){unlockMsg='🏺 '+POT_TIERS[u].name.toUpperCase()+' UNLOCKED!';break;}}
      // Announce pot-SIZE unlocks too (separate from art tiers)
      for(u=0;u<POT_SIZES.length;u++){if(POT_SIZES[u].unlockAt===level){unlockMsg='🎯 '+POT_SIZES[u].name+' POT UNLOCKED · '+POT_SIZES[u].mult+'× score';break;}}
      setMsg(unlockMsg);
    }
    updateHUD();
    setTimeout(function(){if(seedsLeft>0){genPot();resetSeed();}else endGame();},500);
  }

  function missed(){
    phase='missed';seed.active=false;streak=0;updateHUD();
    setTimeout(function(){if(seedsLeft>0)resetSeed();else endGame();},350);
  }

  function endGame(){
    running=false;if(rafId)cancelAnimationFrame(rafId);
    var won=totalMade>=8;
    if(won){_e('game_win');_playWin();}else{_e('game_loss');_play('lose');}
    _sr('seedtoss2',{w:won,s:score,acc:totalThrown?Math.round(totalMade/totalThrown*100):0,st:bestStreak,lv:level});
    // Stephen 2026-06-28: on a loss there's no win overlay, so the round used
    // to "just stop" with a tiny line. Show a clear game-over summary that
    // names the result and points at New Game.
    sm((won?'🌻 Nice round! ':'🌱 Out of seeds. ')+totalMade+'/15 in the pot · Score '+score+' · tap New Game to play again.');
    var pb=0;try{pb=parseInt(localStorage.getItem('lw_seedtoss_best'),10)||0;}catch(e){}
    var rec=score>pb; if(rec){try{localStorage.setItem('lw_seedtoss_best',String(score));}catch(e){}}
    if(window._lwGameEnd)_lwGameEnd({won:won,
      title:won?'A FINE TOSSING ARM':'OUT OF SEEDS',
      line:'<b style="color:#c8a84b">'+totalMade+'</b>/15 in the pot \u00b7 score '+score,
      sub:rec?'\u2b50 NEW BEST':'best '+pb,
      retry:function(){window._STN();},retryLabel:'\u21bb TOSS AGAIN',viewLabel:'admire the pot'});
  }

  function setMsg(t){var m=document.getElementById('STmsg');if(m){m.textContent=t;setTimeout(function(){if(m.textContent===t)m.textContent='';},1000);}}

  function updateHUD(){
    var s=document.getElementById('STs'),q=document.getElementById('STq'),l=document.getElementById('STl');
    if(s)s.textContent=score;if(q)q.textContent=totalThrown;if(l)l.textContent=level;
  }

  // ─── WEATHER ──────────────────────────────────────────────────
  // Per-round ambient layer. Chosen when a new pot is generated so
  // the player gets visual variety from round to round. `null` = clear.
  function pickWeather(){
    var types=[null,null,'rain','snow','leaves','mist']; // null weighted for clear rounds
    weatherType=types[Math.floor(Math.random()*types.length)];
    weatherPoints=[];
    if(!weatherType)return;
    var count=weatherType==='mist'?5:(weatherType==='leaves'?18:50);
    for(var i=0;i<count;i++){
      weatherPoints.push({
        x:Math.random()*W,
        y:Math.random()*H,
        vx:weatherType==='rain'?-40:(weatherType==='leaves'?-30+Math.random()*60:-6+Math.random()*12),
        vy:weatherType==='rain'?320:(weatherType==='snow'?22+Math.random()*14:(weatherType==='leaves'?40+Math.random()*30:0)),
        size:1+Math.random()*2,
        rot:Math.random()*Math.PI*2,
        rotSpeed:(Math.random()-0.5)*2,
        color:weatherType==='leaves'?['#c76a30','#e8a050','#c8a84b','#8a4320'][Math.floor(Math.random()*4)]:null
      });
    }
  }
  function updateWeather(dt){
    if(!weatherType)return;
    for(var i=0;i<weatherPoints.length;i++){
      var p=weatherPoints[i];
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.rotSpeed)p.rot+=p.rotSpeed*dt;
      if(p.y>H+10){p.y=-10;p.x=Math.random()*W;}
      if(p.x<-30)p.x=W+10;
      if(p.x>W+30)p.x=-10;
    }
  }
  function drawWeather(){
    if(!weatherType)return;
    ctx.save();
    if(weatherType==='rain'){
      ctx.strokeStyle='rgba(140,180,220,0.35)';ctx.lineWidth=1;
      for(var i=0;i<weatherPoints.length;i++){
        var p=weatherPoints[i];
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-3,p.y+11);ctx.stroke();
      }
    } else if(weatherType==='snow'){
      ctx.fillStyle='rgba(255,255,255,0.75)';
      for(var s=0;s<weatherPoints.length;s++){
        var sp=weatherPoints[s];
        ctx.beginPath();ctx.arc(sp.x,sp.y,sp.size,0,Math.PI*2);ctx.fill();
      }
    } else if(weatherType==='leaves'){
      for(var l=0;l<weatherPoints.length;l++){
        var lp=weatherPoints[l];
        ctx.save();ctx.translate(lp.x,lp.y);ctx.rotate(lp.rot);
        ctx.fillStyle=lp.color;
        ctx.beginPath();ctx.ellipse(0,0,5,2.5,0,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
    } else if(weatherType==='mist'){
      for(var m=0;m<weatherPoints.length;m++){
        var mp=weatherPoints[m];
        var grd=ctx.createRadialGradient(mp.x,mp.y,0,mp.x,mp.y,90);
        grd.addColorStop(0,'rgba(200,214,224,0.18)');
        grd.addColorStop(1,'rgba(200,214,224,0)');
        ctx.fillStyle=grd;
        ctx.fillRect(mp.x-90,mp.y-35,180,70);
      }
    }
    ctx.restore();
  }

  // ─── PARALLAX — two silhouette layers drifting slowly ─────────
  function drawParallax(){
    // Distant hills
    ctx.fillStyle='rgba(28,40,30,0.55)';
    ctx.beginPath();
    ctx.moveTo(0,GROUND_Y-60);
    for(var x=0;x<=W;x+=24){
      var y=GROUND_Y-60-Math.sin(x*0.018+parallaxT*0.04)*14-Math.sin(x*0.032)*9;
      ctx.lineTo(x,y);
    }
    ctx.lineTo(W,GROUND_Y);ctx.lineTo(0,GROUND_Y);
    ctx.closePath();ctx.fill();
    // Mid tree line — jagged silhouette
    ctx.fillStyle='rgba(12,22,15,0.78)';
    ctx.beginPath();
    ctx.moveTo(0,GROUND_Y-26);
    for(var x2=0;x2<=W;x2+=14){
      var y2=GROUND_Y-26-Math.abs(Math.sin(x2*0.045+parallaxT*0.12))*18-Math.abs(Math.cos(x2*0.11))*6;
      ctx.lineTo(x2,y2);
    }
    ctx.lineTo(W,GROUND_Y);ctx.lineTo(0,GROUND_Y);
    ctx.closePath();ctx.fill();
  }

  function drawPotSkinned(px,py,pw,ph,tier){
    // Tapered flowerpot: narrower at the base, wider at the rim, with
    // an inner dark mouth, highlight strip, and ground shadow.
    // Subtle wind-driven sway — the whole pot tilts 0-2° sinusoidally,
    // scaled by current wind strength. Looks alive without being silly.
    var swayAngle=Math.abs(wind)>5?Math.sin(Date.now()*0.004)*(Math.abs(wind)/200)*0.035:0;
    ctx.save();
    if(swayAngle!==0){
      ctx.translate(px,py);
      ctx.rotate(swayAngle);
      ctx.translate(-px,-py);
    }
    // Ground shadow
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(px,py+2,pw*0.55,6,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
    // Body gradient for dimensionality
    var bodyGrd=ctx.createLinearGradient(px-pw/2,py-ph,px+pw/2,py);
    bodyGrd.addColorStop(0,tier.rim);
    bodyGrd.addColorStop(0.35,tier.base);
    bodyGrd.addColorStop(0.75,tier.base);
    bodyGrd.addColorStop(1,tier.rim);
    ctx.fillStyle=bodyGrd;
    ctx.beginPath();
    ctx.moveTo(px-pw/2,py);
    ctx.lineTo(px-pw*0.38,py-ph);
    ctx.lineTo(px+pw*0.38,py-ph);
    ctx.lineTo(px+pw/2,py);
    ctx.closePath();
    ctx.fill();
    // Highlight stroke on body's left edge for form
    ctx.strokeStyle='rgba(255,255,255,0.09)';
    ctx.lineWidth=1.2;
    ctx.beginPath();
    ctx.moveTo(px-pw/2+2,py-2);
    ctx.lineTo(px-pw*0.38+1,py-ph+2);
    ctx.stroke();
    // Rim — thicker band
    var rimGrd=ctx.createLinearGradient(px,py-ph-8,px,py-ph+4);
    rimGrd.addColorStop(0,tier.rim);
    rimGrd.addColorStop(0.5,tier.base);
    rimGrd.addColorStop(1,tier.rim);
    ctx.fillStyle=rimGrd;
    ctx.beginPath();
    ctx.moveTo(px-pw/2-4,py-ph+4);
    ctx.lineTo(px-pw/2-4,py-ph-4);
    ctx.lineTo(px+pw/2+4,py-ph-4);
    ctx.lineTo(px+pw/2+4,py-ph+4);
    ctx.closePath();
    ctx.fill();
    // Rim top highlight
    ctx.strokeStyle='rgba(255,255,255,0.18)';
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(px-pw/2-3,py-ph-3.5);
    ctx.lineTo(px+pw/2+3,py-ph-3.5);
    ctx.stroke();
    // Inner mouth — deeper shadow at center, softer at edges
    var mouthGrd=ctx.createLinearGradient(px,py-ph-2,px,py-ph+6);
    mouthGrd.addColorStop(0,'rgba(0,0,0,0.75)');
    mouthGrd.addColorStop(1,'rgba(0,0,0,0.45)');
    ctx.fillStyle=mouthGrd;
    ctx.beginPath();
    ctx.ellipse(px,py-ph-2,pw*0.34,4,0,0,Math.PI*2);
    ctx.fill();
    // A bit of soil peeking through
    ctx.fillStyle='rgba(60,40,20,0.6)';
    ctx.beginPath();
    ctx.ellipse(px,py-ph-1,pw*0.28,2.5,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore(); // closes the sway transform
  }
  function drawSeedSkinned(x,y,r,tier){
    // Outer glow
    ctx.fillStyle=tier.glow;
    ctx.beginPath();ctx.arc(x,y,r+5,0,Math.PI*2);ctx.fill();
    // Body — radial gradient from highlight to rim
    var gr=ctx.createRadialGradient(x-r*0.35,y-r*0.35,0,x,y,r);
    gr.addColorStop(0,'rgba(255,255,255,0.5)');
    gr.addColorStop(0.28,tier.inner);
    gr.addColorStop(1,tier.outer);
    ctx.fillStyle=gr;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    // Dark rim to seat it
    ctx.strokeStyle='rgba(0,0,0,0.45)';
    ctx.lineWidth=0.8;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();
    // Tiny specular dot
    ctx.fillStyle='rgba(255,255,255,0.85)';
    ctx.beginPath();ctx.arc(x-r*0.3,y-r*0.4,r*0.22,0,Math.PI*2);ctx.fill();
  }

  function draw(){
    // Dusk-to-night sky gradient background instead of flat black
    var sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#0a1016');
    sky.addColorStop(0.55,'#10160f');
    sky.addColorStop(1,'#1a1810');
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // Distant sparkle dots
    ctx.fillStyle='rgba(232,220,200,0.08)';
    for(var _s=0;_s<10;_s++){
      ctx.fillRect((_s*73)%W,(_s*41)%(H*0.45),1,1);
    }
    // ── HEIGHT LADDER — bigger bonus the higher the arc ──
    // Matches the scoring math: heightBonus = floor(arcTop / 2), so a
    // ladder bar labelled "+N" sits N×2 px above the pot rim. The
    // ladder intentionally extends off the top of the canvas so huge
    // arcs still earn — the arrow chip up top tells the player scoring
    // keeps climbing past what they can see.
    if(pot){
      var potTop=pot.y-pot.height-4;
      // Gradient: dim near pot, brightest near canvas top, so the high-
      // scoring region reads cool and bright as the arc climbs.
      var grd=ctx.createLinearGradient(0,0,0,potTop);
      grd.addColorStop(0,'rgba(91,155,213,0.18)');
      grd.addColorStop(0.5,'rgba(200,168,75,0.08)');
      grd.addColorStop(1,'rgba(13,16,12,0)');
      ctx.fillStyle=grd;ctx.fillRect(0,0,W,potTop);
      var ladder=[
        {pts:25,  label:'+25',               color:'rgba(122,179,86,0.45)'},
        {pts:50,  label:'+50',               color:'rgba(122,179,86,0.55)'},
        {pts:100, label:'+100',              color:'rgba(200,168,75,0.55)'},
        {pts:150, label:'+150 · SKY',        color:'rgba(232,160,191,0.7)'},
        {pts:200, label:'+200 · STRATOSPHERE',color:'rgba(91,155,213,0.8)'}
      ];
      ctx.save();
      ctx.setLineDash([6,4]);
      for(var zi=0;zi<ladder.length;zi++){
        var zY=potTop-ladder[zi].pts*2;
        if(zY<-10)continue; // off-canvas bars handled by the arrow chip
        ctx.strokeStyle=ladder[zi].color;
        ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(8,zY);ctx.lineTo(W-8,zY);ctx.stroke();
        ctx.fillStyle=ladder[zi].color.replace(/0\.\d+/,'0.95');
        ctx.font='bold 10px monospace';ctx.textAlign='left';ctx.textBaseline='bottom';
        ctx.fillText(ladder[zi].label,12,zY-2);
        ctx.textAlign='right';
        ctx.fillText(ladder[zi].label,W-12,zY-2);
      }
      ctx.restore();
      // Header at the top of the canvas — arcs flying above this still
      // score: +1 pt per 2 px, capped at +1000.
      ctx.fillStyle='rgba(232,220,200,0.75)';
      ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.textBaseline='top';
      ctx.fillText('▲ higher = more pts · keep climbing · cap +1000',W/2,2);
      ctx.textBaseline='alphabetic';
    }
    // Parallax silhouettes BEFORE the ground strip so ground sits on top
    drawParallax();
    // Ground
    ctx.fillStyle='rgba(40,35,25,0.4)';ctx.fillRect(0,GROUND_Y-3,W,H-GROUND_Y);
    ctx.strokeStyle='rgba(80,70,50,0.3)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,GROUND_Y);ctx.lineTo(W,GROUND_Y);ctx.stroke();
    // Pot — uses current level's pot tier
    if(pot){
      var potTier=_STcurrentPotTier(level);
      drawPotSkinned(pot.x,pot.y,pot.width,pot.height,potTier);
    }
    // Wind indicator
    if(Math.abs(wind)>5){
      ctx.fillStyle='rgba(91,155,213,0.5)';
      ctx.font='12px sans-serif';ctx.textAlign='right';
      ctx.fillText((wind>0?'→':'←')+' WIND',W-10,30);
    }
    // Seed trail
    if(seed&&seed.trail){
      for(var i=0;i<seed.trail.length;i++){
        var t=seed.trail[i];
        ctx.globalAlpha=t.life*0.4;ctx.fillStyle='#c8a84b';
        ctx.beginPath();ctx.arc(t.x,t.y,SEED_RADIUS*t.life,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    // Seed — uses current level's seed tier
    if(seed&&phase!=='scored'){
      var seedTier=_STcurrentSeedTier(level);
      drawSeedSkinned(seed.x,seed.y,SEED_RADIUS,seedTier);
    }
    // Particles
    for(i=0;i<particles.length;i++){
      var p=particles[i];
      ctx.globalAlpha=Math.max(0,p.life/p.maxLife);
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*(p.life/p.maxLife),0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    // Weather layer (on top of scene, below HUD text)
    drawWeather();
    // Bullseye gold flash — decays over the frames after a dead-center toss
    if(bullseyeFlash>0){
      ctx.fillStyle='rgba(200,168,75,'+(bullseyeFlash*0.28)+')';
      ctx.fillRect(0,0,W,H);
    }
    // Idle hint
    if(phase==='ready'&&totalThrown===0&&seed){
      ctx.fillStyle='rgba(232,220,200,0.5)';
      ctx.font='italic 13px serif';ctx.textAlign='center';
      ctx.fillText('Flick the seed upward ↑',seed.x,seed.y+30);
    }
  }

  var lastT=0;
  function loop(ts){
    if(!running)return;
    // Bail if player exited via tab switch — running flag wouldn't
    // catch it otherwise and rAF would burn CPU on a dead canvas.
    if(!document.body.classList.contains('game-active')){running=false;return;}
    var dt=lastT?Math.min((ts-lastT)/1000,0.04):0.016;lastT=ts;
    parallaxT+=dt;
    updateWeather(dt);
    if(bullseyeFlash>0)bullseyeFlash=Math.max(0,bullseyeFlash-dt*1.6);
    updateSeed(dt);
    if(seed&&seed.trail)for(var i=seed.trail.length-1;i>=0;i--){seed.trail[i].life-=dt*2;if(seed.trail[i].life<=0)seed.trail.splice(i,1);}
    for(i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=120*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
    draw();
    rafId=requestAnimationFrame(loop);
  }

  function showSizePicker(){
    // Pre-round modal: three pot-size tiles with multipliers.
    // Unlock gate uses best-ever level so the player doesn't lose access
    // to previously-unlocked sizes just because this run started at L1.
    pickerOpen=true;
    // If the persisted highlight is now locked (shouldn't normally happen
    // since best-level only grows), fall back to LARGE so NEW never
    // points at a locked tile.
    var bestLvl=_STbestLevel();
    if(bestLvl<highlightedSize.unlockAt)highlightedSize=POT_SIZES[0];
    pan.innerHTML='';
    var wrap=document.createElement('div');
    wrap.style.cssText='padding:14px 6px 4px;max-width:420px;margin:0 auto;';
    var title=document.createElement('div');
    title.style.cssText='font-family:Bebas Neue,sans-serif;font-size:1.2rem;color:var(--gold);letter-spacing:0.14em;text-align:center;margin-bottom:4px;';
    title.textContent='CHOOSE YOUR POT';
    wrap.appendChild(title);
    var sub=document.createElement('div');
    sub.style.cssText='font-family:DM Mono,monospace;font-size:0.58rem;color:var(--muted);text-align:center;margin-bottom:14px;letter-spacing:0.05em;line-height:1.5;';
    sub.textContent='Smaller pots are harder but pay more per seed.';
    wrap.appendChild(sub);
    var grid=document.createElement('div');
    grid.style.cssText='display:flex;gap:8px;justify-content:center;flex-wrap:wrap;';
    for(var i=0;i<POT_SIZES.length;i++){
      (function(sz){
        var unlocked=bestLvl>=sz.unlockAt;
        var isHi=unlocked&&sz.key===highlightedSize.key;
        var btn=document.createElement('button');
        var borderColor=isHi?'var(--gold)':(unlocked?'rgba(200,168,75,0.45)':'rgba(138,145,120,0.2)');
        var bgColor=isHi?'linear-gradient(180deg,rgba(200,168,75,0.28),rgba(40,50,24,0.75))'
                        :(unlocked?'linear-gradient(180deg,rgba(74,124,53,0.22),rgba(26,36,22,0.6))':'rgba(26,31,23,0.35)');
        var boxShadow=isHi?'0 0 18px rgba(200,168,75,0.35),0 3px 10px rgba(0,0,0,0.4)'
                          :(unlocked?'0 3px 10px rgba(0,0,0,0.35)':'none');
        btn.style.cssText='flex:1;min-width:105px;max-width:130px;padding:12px 8px;border-radius:12px;border:'+(isHi?'2':'1.5')+'px solid '+borderColor+';background:'+bgColor+';color:'+(unlocked?'var(--cream)':'var(--muted)')+';font-family:inherit;cursor:'+(unlocked?'pointer':'not-allowed')+';box-shadow:'+boxShadow+';min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;position:relative;';
        btn.innerHTML=
          '<div style="font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.1em;color:'+(unlocked?'var(--gold)':'var(--muted)')+';">'+sz.name+'</div>'+
          '<div style="font-family:DM Mono,monospace;font-size:1.2rem;color:'+(unlocked?'var(--cream)':'var(--muted)')+';font-weight:700;">'+sz.mult.toFixed(1).replace(/\.0$/,'')+'×</div>'+
          '<div style="font-family:DM Mono,monospace;font-size:0.48rem;color:var(--muted);line-height:1.35;padding:0 2px;">'+(unlocked?sz.hint:'Reach Lv '+sz.unlockAt+' to unlock')+'</div>';
        if(unlocked){btn.onclick=function(){beginRun(sz);};}
        grid.appendChild(btn);
      })(POT_SIZES[i]);
    }
    wrap.appendChild(grid);
    // Subtle hint under the grid so players know the bottom NEW button
    // will launch with the highlighted tile.
    var foot=document.createElement('div');
    foot.style.cssText='font-family:DM Mono,monospace;font-size:0.52rem;color:var(--muted);text-align:center;margin-top:10px;letter-spacing:0.05em;';
    foot.textContent='Tap a pot or press NEW to play with the gold-highlighted one.';
    wrap.appendChild(foot);
    pan.appendChild(wrap);
  }
  function beginRun(sz){
    pickerOpen=false;
    currentSize=sz;
    highlightedSize=sz;
    try{localStorage.setItem('lw_st_last_size',sz.key);}catch(e){}
    scoreMult=sz.mult;
    if(rafId)cancelAnimationFrame(rafId);
    setup();
    score=0;streak=0;bestStreak=0;level=1;seedsLeft=15;totalMade=0;totalThrown=0;particles=[];
    genPot();resetSeed();updateHUD();
    running=true;lastT=0;
    rafId=requestAnimationFrame(loop);
    sm(sz.mult>1?'×'+sz.mult+' multiplier · flick it in':'Flick the seed into the pot');
  }
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    running=false;
    if(rafId){cancelAnimationFrame(rafId);rafId=0;}
  });
  window._STN=function(){
    // If the size picker is already up, NEW commits to the highlighted
    // tile instead of re-rendering the same picker (that felt
    // unresponsive to Stephen). Falls back to LARGE if the highlight
    // is somehow locked.
    if(pickerOpen){
      var bestLvl=_STbestLevel();
      var pick=(bestLvl>=highlightedSize.unlockAt)?highlightedSize:POT_SIZES[0];
      beginRun(pick);
      return;
    }
    if(rafId)cancelAnimationFrame(rafId);
    running=false;
    showSizePicker();
  };

  _STN();
};
})();
