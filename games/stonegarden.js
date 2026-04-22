// ═══ STONE GARDEN v3 — Matter.js physics cairn stacker ═══
// Real rigid-body physics via Matter.js (lazy-loaded from CDN). Drag a
// stone to position, tap rotate to turn it, release to drop. Stack
// survives wobbles = higher score. Zen mode = unlimited stones with
// gentle wind. Challenge = reach target height in limited stones.
(function(){
'use strict';
var G=window._G||{};
var _e=G.e||function(){},_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm||function(){},_sr=G.sr||function(){};

var MATTER_URL='https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js';
var _matterLoading=false,_matterQueue=[];

function loadMatter(cb){
  if(window.Matter)return cb(null);
  _matterQueue.push(cb);
  if(_matterLoading)return;
  _matterLoading=true;
  var s=document.createElement('script');
  s.src=MATTER_URL;
  s.onload=function(){
    _matterLoading=false;
    var q=_matterQueue;_matterQueue=[];
    for(var i=0;i<q.length;i++)q[i](null);
  };
  s.onerror=function(){
    _matterLoading=false;
    var q=_matterQueue;_matterQueue=[];
    for(var i=0;i<q.length;i++)q[i](new Error('Could not load physics engine'));
  };
  document.head.appendChild(s);
}

window._gameFns=window._gameFns||{};
window._gameFns.stonegarden=function SG(a){
  if(ms)ms(a,'<strong id="SGh">Stone Garden</strong>');
  if(mm)mm(a);

  var pan=document.createElement('div');
  pan.id='SGpan';
  pan.style.cssText='max-width:440px;margin:0 auto;padding:4px;user-select:none;-webkit-user-select:none;text-align:center;';
  a.appendChild(pan);

  var loading=document.createElement('div');
  loading.style.cssText='text-align:center;padding:2.5rem 1rem;color:var(--muted);font-family:DM Sans,sans-serif;';
  loading.innerHTML='<div style="font-size:1.6rem;margin-bottom:10px;">🪨</div>Loading physics…';
  pan.appendChild(loading);

  loadMatter(function(err){
    if(err){
      loading.innerHTML='<div style="color:#c75050;">'+err.message+'</div><div style="margin-top:6px;font-size:0.7rem;">Check your connection and reopen the game.</div>';
      return;
    }
    loading.remove();
    startGame(pan,a);
  });
};

function startGame(pan,a){
  var M=window.Matter;
  var Engine=M.Engine,World=M.World,Bodies=M.Bodies,Body=M.Body,
      Composite=M.Composite,Events=M.Events,Vector=M.Vector,Sleeping=M.Sleeping;

  // ─── CONSTANTS ──────────────────────────────────────────────────
  var W=360,H=580;             // canvas size (adapted later)
  var GROUND_Y=H-40;            // pixel y of ground plane
  var SPAWN_Y=60;                // where hover stone appears
  var TOPPLE_X_SLACK=120;        // how far off-screen before considered toppled
  var TOPPLE_Y=H+160;
  var CAM_LEAD=0.32;             // camera raises when top stone is in top 32% of view
  var CAM_LERP=0.07;
  var WIND_INTERVAL=9;           // zen: wind every N stones settled
  var WIND_FORCE=0.0018;
  var CHALLENGE_TARGET=380;      // pixel height to reach to win

  // ─── SHAPE GENERATION ──────────────────────────────────────────
  // Each returns {verts:[{x,y}...], w, h}. Verts centered on (0,0).
  function ovalVerts(w,h,n,jitter){
    var vs=[],hw=w/2,hh=h/2;
    for(var i=0;i<n;i++){
      var t=(i/n)*Math.PI*2-Math.PI/2;
      var rx=hw*(1-jitter+Math.random()*jitter*2);
      var ry=hh*(1-jitter+Math.random()*jitter*2);
      vs.push({x:Math.cos(t)*rx,y:Math.sin(t)*ry});
    }
    return vs;
  }
  var SHAPES={
    slab:{pts:1,weight:16,tint:'warm',
      gen:function(){
        var w=74+Math.random()*22,h=14+Math.random()*6;
        return{w:w,h:h,verts:ovalVerts(w,h,10,0.12)};
      }},
    pebble:{pts:2,weight:14,tint:'cool',
      gen:function(){
        var w=34+Math.random()*14,h=26+Math.random()*10;
        return{w:w,h:h,verts:ovalVerts(w,h,9,0.18)};
      }},
    boulder:{pts:3,weight:9,tint:'warm',
      gen:function(){
        var w=58+Math.random()*22,h=w*(0.72+Math.random()*0.16);
        return{w:w,h:h,verts:ovalVerts(w,h,10,0.14)};
      }},
    coin:{pts:2,weight:9,tint:'moss',
      gen:function(){
        var r=14+Math.random()*6;
        return{w:r*2,h:r*2,verts:ovalVerts(r*2,r*2,12,0.05)};
      }},
    spire:{pts:4,weight:6,tint:'cool',
      gen:function(){
        var w=24+Math.random()*10,h=56+Math.random()*24;
        return{w:w,h:h,verts:ovalVerts(w,h,8,0.12)};
      }},
    wedge:{pts:5,weight:6,tint:'warm',
      gen:function(){
        var w=48+Math.random()*16,h=36+Math.random()*18;
        var peak=-w/2+w*(0.3+Math.random()*0.4);
        return{w:w,h:h,verts:[
          {x:peak,y:-h/2},
          {x:w/2,y:h/2},
          {x:-w/2,y:h/2}
        ]};
      }},
    crystal:{pts:6,weight:3,tint:'crystal',
      gen:function(){
        var w=26+Math.random()*10,h=52+Math.random()*18;
        return{w:w,h:h,verts:[
          {x:0,y:-h/2},
          {x:w/2,y:-h/4},
          {x:w/2*0.75,y:h/2},
          {x:-w/2*0.75,y:h/2},
          {x:-w/2,y:-h/4}
        ]};
      }}
  };
  function pickShape(){
    var keys=Object.keys(SHAPES),total=0;
    for(var i=0;i<keys.length;i++)total+=SHAPES[keys[i]].weight;
    var r=Math.random()*total;
    for(var j=0;j<keys.length;j++){
      r-=SHAPES[keys[j]].weight;
      if(r<=0)return keys[j];
    }
    return keys[0];
  }

  function makeColors(tint){
    var c,d;
    if(tint==='moss'){
      var g=72+Math.floor(Math.random()*22);
      c='rgb('+Math.round(g*0.55)+','+(g+22)+','+Math.round(g*0.48)+')';
      d='rgb('+Math.round(g*0.32)+','+(g-4)+','+Math.round(g*0.32)+')';
    } else if(tint==='cool'){
      var b=108+Math.floor(Math.random()*22);
      c='rgb('+b+','+(b+6)+','+(b+18)+')';
      d='rgb('+(b-30)+','+(b-26)+','+(b-14)+')';
    } else if(tint==='crystal'){
      var p=148+Math.floor(Math.random()*30);
      c='rgb('+(p-24)+','+(p-14)+','+(p+8)+')';
      d='rgb('+(p-60)+','+(p-42)+','+(p-18)+')';
    } else {
      var g2=96+Math.floor(Math.random()*30);
      var warm=Math.floor(Math.random()*10)-2;
      c='rgb('+(g2+warm)+','+(g2+Math.floor(warm*0.4))+','+(g2-warm-3)+')';
      d='rgb('+(g2-26+warm)+','+(g2-26)+','+(g2-28-warm)+')';
    }
    return{fill:c,shade:d};
  }

  // ─── STATE ──────────────────────────────────────────────────────
  var engine=null,world=null;
  var canvas,ctx,dpr=1;
  var ground=null,wallL=null,wallR=null;
  var stones=[];       // {body, shape, color, darkColor, settled, pts, w, h, scoreGiven}
  var hover=null;      // {body, shape, pts, color, w, h} — kinematic, follows pointer
  var nextShapeKey='slab';
  var dragging=false,dragOffsetX=0,dragOffsetY=0,lastPointerX=0,lastPointerY=0;
  var mode='zen',state='menu';
  var score=0,stonesPlaced=0,maxHeight=0;
  var lives=3,bestScore=0,bestHeight=0;
  var windTimer=0,windDir=1;
  var cameraY=0,targetCameraY=0;
  var particles=[];
  var running=false,lastTime=0,rafId=null;
  var flashMsg='',flashTimer=0,flashColor='#e8dcc8';

  try{bestScore=parseInt(localStorage.getItem('lw_sg_best_score')||'0',10)||0;}catch(e){}
  try{bestHeight=parseInt(localStorage.getItem('lw_sg_best')||'0',10)||0;}catch(e){}

  // ─── MENU ───────────────────────────────────────────────────────
  function showMenu(){
    state='menu';
    running=false;
    if(rafId)cancelAnimationFrame(rafId);
    if(engine){
      // Pause engine and clear world for a fresh start next round
      World.clear(world,false);
      Engine.clear(engine);
      engine=null;world=null;
    }
    stones=[];hover=null;particles=[];
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:1.5rem;color:var(--sage);letter-spacing:3px;margin:22px 0 6px;">STONE GARDEN</div>'
      +'<div style="font-style:italic;font-size:0.78rem;color:var(--muted);margin-bottom:18px;line-height:1.45;max-width:300px;margin-left:auto;margin-right:auto;">Drag to place. Tap rotate to turn. Release to drop. Build cairns on the sand.</div>'
      +'<button class="gb" onclick="_SGbegin(\'zen\')" style="display:block;width:260px;margin:8px auto;padding:14px;min-height:56px;">ZEN MODE<div style="font-size:0.72rem;opacity:0.85;font-style:italic;margin-top:2px;">No fail. Wind gusts shake the stack.</div></button>'
      +'<button class="gb" onclick="_SGbegin(\'challenge\')" style="display:block;width:260px;margin:8px auto;padding:14px;min-height:56px;">CHALLENGE<div style="font-size:0.72rem;opacity:0.85;font-style:italic;margin-top:2px;">Reach '+CHALLENGE_TARGET+'px. 3 topples and out.</div></button>'
      +'<div style="margin-top:18px;font-size:0.72rem;color:var(--muted);line-height:1.8;">'
      +'Best Score: <span style="color:var(--gold)">'+bestScore+'</span><br>'
      +'Best Height: <span style="color:var(--gold)">'+bestHeight+'px</span>'
      +'</div>';
    pan.innerHTML=h;
  }

  // ─── BODY CREATION ──────────────────────────────────────────────
  function createStone(shapeKey,x,y){
    var S=SHAPES[shapeKey];
    var g=S.gen();
    var colors=makeColors(S.tint||'warm');
    // Matter.Bodies.fromVertices expects world coords but auto-centers.
    // We pass verts relative to (0,0) and it adjusts to body center at (x,y).
    var body=Bodies.fromVertices(x,y,[g.verts],{
      friction:0.82,
      frictionStatic:1.1,
      restitution:0.06,
      density:0.0022,
      slop:0.02,
      sleepThreshold:60
    },false); // false = don't remove colinear points
    if(!body){
      // fromVertices can fail on very thin polys — fall back to ellipse
      body=Bodies.circle(x,y,Math.max(g.w,g.h)/2,{friction:0.82,restitution:0.06,density:0.0022});
    }
    return{
      body:body,
      shape:shapeKey,
      pts:S.pts,
      w:g.w,h:g.h,
      verts:g.verts,
      color:colors.fill,
      shade:colors.shade,
      settled:false,
      scoreGiven:false,
      bornAt:Date.now()
    };
  }

  function spawnHoverStone(){
    nextShapeKey=pickShape();
    // Create hover stone but DON'T add it to the physics world yet.
    // If we did, even as a static body it would shove settled stones
    // when the player drags through the stack. We render it manually
    // via Body.setPosition/setAngle; World.add happens on release.
    hover=createStone(nextShapeKey,W/2,SPAWN_Y);
    Body.setStatic(hover.body,true);
  }

  function releaseHover(){
    if(!hover)return;
    var h=hover;hover=null;
    dragging=false;
    Body.setStatic(h.body,false);
    Body.setVelocity(h.body,{x:0,y:0});
    Body.setAngularVelocity(h.body,0);
    World.add(world,h.body); // enter physics
    stones.push(h);
    if(_play)try{_play('dig');}catch(e){}
    // Short delay before next stone so player sees this one land
    setTimeout(function(){
      if(state==='playing'&&!hover)spawnHoverStone();
    },520);
  }

  // ─── SETTLING + SCORING ─────────────────────────────────────────
  function onStoneSettled(stone){
    if(stone.scoreGiven)return;
    stone.scoreGiven=true;
    stone.settled=true;
    score+=stone.pts;
    stonesPlaced++;
    // Puff of sand where it settled
    for(var i=0;i<7;i++){
      particles.push({
        x:stone.body.position.x+(Math.random()-0.5)*stone.w,
        y:stone.body.position.y+stone.h/2,
        vx:(Math.random()-0.5)*28,
        vy:-Math.random()*42-10,
        life:0.55+Math.random()*0.35,
        maxLife:0.9,
        size:1.2+Math.random()*2.2
      });
    }
    // Measure height
    var h=measureHeight();
    if(h>maxHeight)maxHeight=h;
    if(_e)try{_e('milestone');}catch(e){}
    // Wind in zen after N stones
    if(mode==='zen'&&stonesPlaced>0&&stonesPlaced%WIND_INTERVAL===0){
      scheduleWindGust();
    }
    // Challenge: reach target?
    if(mode==='challenge'&&h>=CHALLENGE_TARGET){
      setTimeout(function(){win();},900);
    }
  }

  function measureHeight(){
    var topY=GROUND_Y;
    for(var i=0;i<stones.length;i++){
      if(!stones[i].settled)continue;
      var vs=stones[i].body.vertices;
      for(var v=0;v<vs.length;v++)if(vs[v].y<topY)topY=vs[v].y;
    }
    return Math.max(0,Math.round(GROUND_Y-topY));
  }

  function checkToppled(){
    var any=false;
    for(var i=stones.length-1;i>=0;i--){
      var s=stones[i],p=s.body.position;
      if(p.y>TOPPLE_Y||p.x<-TOPPLE_X_SLACK||p.x>W+TOPPLE_X_SLACK){
        if(s.scoreGiven)score=Math.max(0,score-s.pts);
        World.remove(world,s.body);
        stones.splice(i,1);
        any=true;
      }
    }
    return any;
  }

  // ─── WIND ───────────────────────────────────────────────────────
  var windActive=false,windRemaining=0;
  function scheduleWindGust(){
    windActive=true;
    windRemaining=1.6; // seconds
    windDir=Math.random()<0.5?-1:1;
    flash('WIND','#5bafd4');
  }
  function applyWind(dt){
    if(!windActive)return;
    windRemaining-=dt;
    if(windRemaining<=0){windActive=false;return;}
    var t=windRemaining/1.6;
    var strength=WIND_FORCE*Math.sin(t*Math.PI); // ease in/out
    for(var i=0;i<stones.length;i++){
      var b=stones[i].body;
      if(b.isStatic)continue;
      Body.applyForce(b,b.position,{x:windDir*strength*b.mass,y:0});
    }
  }

  // ─── FLASH MSG ──────────────────────────────────────────────────
  function flash(txt,color){
    flashMsg=txt;
    flashTimer=1.6;
    flashColor=color||'#e8dcc8';
  }

  // ─── RENDER ─────────────────────────────────────────────────────
  function drawStone(s,alpha){
    var b=s.body,vs=b.vertices;
    ctx.save();
    ctx.globalAlpha=alpha||1;
    ctx.beginPath();
    ctx.moveTo(vs[0].x,vs[0].y-cameraY);
    for(var i=1;i<vs.length;i++)ctx.lineTo(vs[i].x,vs[i].y-cameraY);
    ctx.closePath();
    // Gradient from top-left highlight to bottom-right shadow
    var bx=b.position.x,by=b.position.y-cameraY;
    var grd=ctx.createLinearGradient(bx-s.w/2,by-s.h/2,bx+s.w/2,by+s.h/2);
    grd.addColorStop(0,s.color);
    grd.addColorStop(1,s.shade);
    ctx.fillStyle=grd;
    ctx.fill();
    // Outline
    ctx.strokeStyle='rgba(0,0,0,0.32)';
    ctx.lineWidth=1;
    ctx.stroke();
    // Top highlight — thin arc on the upper edge
    ctx.strokeStyle='rgba(255,255,255,0.14)';
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(vs[0].x,vs[0].y-cameraY);
    for(var k=1;k<Math.min(4,vs.length);k++)ctx.lineTo(vs[k].x,vs[k].y-cameraY);
    ctx.stroke();
    ctx.globalAlpha=1;
    ctx.restore();
  }

  function drawShadow(s){
    var b=s.body;
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(b.position.x,GROUND_Y-cameraY+4,s.w*0.45,4,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function render(){
    // Sky gradient background
    var sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#0f1410');
    sky.addColorStop(0.6,'#131a14');
    sky.addColorStop(1,'#181c14');
    ctx.fillStyle=sky;
    ctx.fillRect(0,0,W,H);
    // Stars (very subtle)
    ctx.fillStyle='rgba(232,220,200,0.06)';
    for(var st=0;st<8;st++){
      var sx=((st*137)%W),sy=(st*29)%(H*0.4);
      ctx.fillRect(sx,sy,1,1);
    }
    // Moon glow
    ctx.save();
    var mg=ctx.createRadialGradient(W*0.78,H*0.18,2,W*0.78,H*0.18,70);
    mg.addColorStop(0,'rgba(232,220,200,0.18)');
    mg.addColorStop(1,'rgba(232,220,200,0)');
    ctx.fillStyle=mg;
    ctx.fillRect(0,0,W,H*0.5);
    ctx.restore();
    // Sand band (in camera space — stays at bottom)
    var groundScreenY=GROUND_Y-cameraY;
    if(groundScreenY<H){
      ctx.fillStyle='rgba(42,38,28,0.6)';
      ctx.fillRect(0,groundScreenY,W,H-groundScreenY);
      // Wavy sand texture
      ctx.strokeStyle='rgba(70,60,45,0.22)';
      ctx.lineWidth=1;
      for(var y=groundScreenY+6;y<H;y+=7){
        ctx.beginPath();
        ctx.moveTo(0,y);
        for(var x=0;x<W;x+=3)ctx.lineTo(x,y+Math.sin(x*0.03+y*0.1)*1.5);
        ctx.stroke();
      }
      // Ground line
      ctx.strokeStyle='rgba(90,80,65,0.4)';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(0,groundScreenY);
      ctx.lineTo(W,groundScreenY);
      ctx.stroke();
    }
    // Shadow under hover stone
    if(hover&&(GROUND_Y-cameraY)<H)drawShadow(hover);
    // All placed stones
    for(var i=0;i<stones.length;i++)drawStone(stones[i]);
    // Hover stone on top
    if(hover){
      // Dashed guide line down to ground
      ctx.save();
      ctx.setLineDash([4,5]);
      ctx.strokeStyle='rgba(232,220,200,0.3)';
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(hover.body.position.x,hover.body.position.y-cameraY+hover.h/2);
      ctx.lineTo(hover.body.position.x,GROUND_Y-cameraY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      drawStone(hover,0.88);
    }
    // Particles
    for(var pi=0;pi<particles.length;pi++){
      var p=particles[pi],al=Math.max(0,p.life/p.maxLife);
      ctx.fillStyle='rgba(168,148,118,'+(al*0.75)+')';
      ctx.beginPath();
      ctx.arc(p.x,p.y-cameraY,p.size*al,0,Math.PI*2);
      ctx.fill();
    }
    // Wind lines overlay
    if(windActive){
      ctx.strokeStyle='rgba(140,190,230,'+(0.18*(windRemaining/1.6))+')';
      ctx.lineWidth=1;
      for(var wl=0;wl<5;wl++){
        var wy=((Date.now()*0.1+wl*60)%H);
        ctx.beginPath();
        ctx.moveTo(windDir<0?W:0,wy);
        ctx.lineTo(windDir<0?W-40:40,wy+4);
        ctx.stroke();
      }
    }
    // HUD (screen-space, not camera)
    ctx.save();
    ctx.fillStyle='rgba(13,16,12,0.55)';
    ctx.fillRect(0,0,W,28);
    ctx.fillStyle='#e8dcc8';
    ctx.font='bold 13px DM Sans,sans-serif';
    ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText('SCORE '+score,8,14);
    ctx.textAlign='right';
    ctx.font='11px DM Mono,monospace';
    ctx.fillStyle='rgba(232,220,200,0.75)';
    if(mode==='challenge'){
      ctx.fillText('LIVES '+lives+' · '+maxHeight+'/'+CHALLENGE_TARGET+'px',W-8,14);
    } else {
      ctx.fillText(maxHeight+'px · '+stonesPlaced+' stones',W-8,14);
    }
    // Next stone hint
    if(hover){
      ctx.textAlign='center';
      ctx.fillStyle='rgba(232,220,200,0.5)';
      ctx.font='10px DM Mono,monospace';
      ctx.fillText('NEXT: +'+hover.pts+' ('+hover.shape.toUpperCase()+')',W/2,14);
    }
    ctx.restore();
    // Flash message
    if(flashTimer>0){
      ctx.save();
      ctx.globalAlpha=Math.min(1,flashTimer);
      ctx.fillStyle=flashColor;
      ctx.font='bold 22px Bebas Neue,sans-serif';
      ctx.textAlign='center';
      ctx.fillText(flashMsg,W/2,H/2);
      ctx.restore();
    }
  }

  // ─── CAMERA ─────────────────────────────────────────────────────
  function updateCamera(){
    // Find highest stone y (in world space). Lower y = higher up.
    var topY=GROUND_Y;
    for(var i=0;i<stones.length;i++){
      if(!stones[i].settled)continue;
      var vs=stones[i].body.vertices;
      for(var v=0;v<vs.length;v++)if(vs[v].y<topY)topY=vs[v].y;
    }
    // If the highest stone is in top 32% of visible screen, raise camera
    var screenY=topY-cameraY;
    if(screenY<H*CAM_LEAD){
      targetCameraY=topY-H*CAM_LEAD;
    } else if(screenY>H*0.55){
      targetCameraY=Math.min(0,topY-H*CAM_LEAD); // slide back down
    }
    if(targetCameraY>0)targetCameraY=0; // don't drop below ground
    cameraY+=(targetCameraY-cameraY)*CAM_LERP;
    if(Math.abs(cameraY-targetCameraY)<0.5)cameraY=targetCameraY;
  }

  // ─── TICK LOOP ──────────────────────────────────────────────────
  function tick(ts){
    if(!running){rafId=null;return;}
    if(!document.body.classList.contains('game-active')){running=false;rafId=null;return;}
    var dt=lastTime?Math.min((ts-lastTime)/1000,0.033):0.016;
    lastTime=ts;
    // Step physics. Matter wants ms.
    Engine.update(engine,dt*1000);
    applyWind(dt);
    // Check sleep → settled
    for(var i=0;i<stones.length;i++){
      if(!stones[i].scoreGiven&&stones[i].body.isSleeping){
        onStoneSettled(stones[i]);
      }
    }
    if(checkToppled()){
      if(mode==='challenge'){
        lives--;
        flash('TOPPLE · '+lives+' LEFT','#c75050');
        if(_play)try{_play('buzz');}catch(e){}
        if(lives<=0){return lose();}
      } else {
        flash('TOPPLE','#c75050');
      }
    }
    // Particles
    for(var pi=particles.length-1;pi>=0;pi--){
      var p=particles[pi];
      p.x+=p.vx*dt;
      p.y+=p.vy*dt;
      p.vy+=60*dt;
      p.life-=dt;
      if(p.life<=0)particles.splice(pi,1);
    }
    updateCamera();
    if(flashTimer>0)flashTimer-=dt;
    render();
    rafId=requestAnimationFrame(tick);
  }

  // ─── INPUT ──────────────────────────────────────────────────────
  function getPoint(e,touch){
    var rect=canvas.getBoundingClientRect();
    var cx=(touch||e).clientX,cy=(touch||e).clientY;
    return{x:(cx-rect.left)*(W/rect.width),y:(cy-rect.top)*(H/rect.height)+cameraY};
  }

  function onDown(e,touch){
    if(state!=='playing'||!hover)return;
    e.preventDefault();
    var p=getPoint(e,touch);
    dragging=true;
    dragOffsetX=hover.body.position.x-p.x;
    dragOffsetY=hover.body.position.y-p.y;
    lastPointerX=p.x;lastPointerY=p.y;
    if(_play)try{_play('snap');}catch(e2){}
  }
  function onMove(e,touch){
    if(!dragging||!hover)return;
    e.preventDefault();
    var p=getPoint(e,touch);
    var nx=p.x+dragOffsetX;
    var ny=p.y+dragOffsetY;
    // Clamp to playable area
    var minX=hover.w/2+4,maxX=W-hover.w/2-4;
    var minY=cameraY+hover.h/2+20; // can't go above top of view
    var maxY=GROUND_Y-hover.h/2-6; // don't let it phase into ground while held
    nx=Math.max(minX,Math.min(maxX,nx));
    ny=Math.max(minY,Math.min(maxY,ny));
    Body.setPosition(hover.body,{x:nx,y:ny});
    lastPointerX=p.x;lastPointerY=p.y;
  }
  function onUp(e,touch){
    if(!dragging||!hover)return;
    e.preventDefault();
    releaseHover();
  }

  function rotateHover(deltaRad){
    if(!hover||!hover.body)return;
    var b=hover.body;
    Body.setAngle(b,b.angle+deltaRad);
    if(_play)try{_play('tap');}catch(e){}
  }

  // ─── LIFECYCLE ──────────────────────────────────────────────────
  function setupCanvas(){
    var target=Math.min(440,window.innerWidth-24);
    W=target;
    H=Math.min(640,window.innerHeight-260);
    if(H<420)H=420;
    GROUND_Y=H-36;
    SPAWN_Y=60;
    TOPPLE_Y=H+200;
    dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr;
    canvas.height=H*dpr;
    canvas.style.width=W+'px';
    canvas.style.height=H+'px';
    ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function setupWorld(){
    engine=Engine.create({enableSleeping:true});
    engine.gravity.y=1.0;
    engine.gravity.scale=0.0018;
    world=engine.world;
    // Ground
    ground=Bodies.rectangle(W/2,GROUND_Y+120,W*4,240,{
      isStatic:true,
      friction:0.95,
      frictionStatic:1.4
    });
    // Side walls — far off-screen so stacks can lean but won't fall off-camera
    wallL=Bodies.rectangle(-120,GROUND_Y-400,40,1600,{isStatic:true});
    wallR=Bodies.rectangle(W+120,GROUND_Y-400,40,1600,{isStatic:true});
    World.add(world,[ground,wallL,wallR]);
  }

  function begin(m){
    mode=m;state='playing';
    score=0;stonesPlaced=0;maxHeight=0;lives=3;cameraY=0;targetCameraY=0;
    stones=[];particles=[];hover=null;
    pan.innerHTML='';
    canvas=document.createElement('canvas');
    canvas.style.cssText='display:block;margin:4px auto 8px;border-radius:8px;background:#0d100c;touch-action:none;box-shadow:0 4px 16px rgba(0,0,0,0.4);';
    pan.appendChild(canvas);
    setupCanvas();
    setupWorld();
    // Controls bar
    var bar=document.createElement('div');
    bar.style.cssText='display:flex;gap:8px;justify-content:center;align-items:center;margin:4px 0 8px;flex-wrap:wrap;';
    bar.innerHTML=
      '<button class="gb" onclick="_SGrot(-1)" style="min-height:48px;min-width:58px;font-size:1.1rem;">↺</button>'
      +'<button class="gb" onclick="_SGrot(1)" style="min-height:48px;min-width:58px;font-size:1.1rem;">↻</button>'
      +'<button class="gb" onclick="_SGundo()" style="min-height:48px;" id="SGundo">↶ UNDO</button>'
      +'<button class="gb" onclick="_SGmenu()" style="min-height:48px;">MENU</button>';
    pan.appendChild(bar);
    // Tip line
    var tip=document.createElement('div');
    tip.style.cssText='font-family:DM Mono,monospace;font-size:0.6rem;color:var(--muted);text-align:center;line-height:1.4;margin:0 8px 4px;';
    tip.textContent=mode==='zen'
      ? 'Drag to place. ↺↻ rotate. Wind gusts every '+WIND_INTERVAL+' stones.'
      : 'Reach '+CHALLENGE_TARGET+'px. 3 topples and the run ends.';
    pan.appendChild(tip);
    // Input wiring
    canvas.addEventListener('mousedown',function(e){onDown(e);});
    window.addEventListener('mousemove',_mm);
    window.addEventListener('mouseup',_mu);
    canvas.addEventListener('touchstart',function(e){
      if(e.touches.length)onDown(e,e.touches[0]);
    },{passive:false});
    canvas.addEventListener('touchmove',function(e){
      if(e.touches.length)onMove(e,e.touches[0]);
    },{passive:false});
    canvas.addEventListener('touchend',function(e){
      onUp(e);
    },{passive:false});
    canvas.addEventListener('touchcancel',function(e){
      onUp(e);
    },{passive:false});
    // First stone
    spawnHoverStone();
    running=true;lastTime=0;
    rafId=requestAnimationFrame(tick);
    sm(mode==='zen'?'Zen. Build freely.':'Challenge. Reach '+CHALLENGE_TARGET+'px.');
  }

  function _mm(e){onMove(e);}
  function _mu(e){onUp(e);}

  function cleanupInput(){
    window.removeEventListener('mousemove',_mm);
    window.removeEventListener('mouseup',_mu);
  }

  function win(){
    running=false;state='won';
    if(rafId)cancelAnimationFrame(rafId);
    flash('CAIRN COMPLETE','#c8a84b');
    if(_playWin)try{_playWin();}catch(e){}
    if(_e)try{_e('game_win');}catch(e){}
    saveBest();
    _sr('stonegarden',{w:true,s:score,ht:maxHeight,stones:stonesPlaced,mode:mode});
    cleanupInput();
    setTimeout(showMenu,2200);
  }
  function lose(){
    running=false;state='gameover';
    if(rafId)cancelAnimationFrame(rafId);
    flash('RUN ENDED','#c75050');
    if(_e)try{_e('game_loss');}catch(e){}
    saveBest();
    _sr('stonegarden',{w:false,s:score,ht:maxHeight,stones:stonesPlaced,mode:mode});
    cleanupInput();
    setTimeout(showMenu,2200);
  }
  function saveBest(){
    if(score>bestScore){bestScore=score;try{localStorage.setItem('lw_sg_best_score',String(bestScore));}catch(e){}}
    if(maxHeight>bestHeight){bestHeight=maxHeight;try{localStorage.setItem('lw_sg_best',String(bestHeight));}catch(e){}}
  }

  // ─── WINDOW EXPOSURE ────────────────────────────────────────────
  window._SGbegin=function(m){begin(m);};
  window._SGmenu=function(){
    if(state==='playing')saveBest();
    cleanupInput();
    showMenu();
  };
  window._SGrot=function(dir){
    if(hover)rotateHover(dir*Math.PI/12); // 15 degrees per tap
  };
  window._SGundo=function(){
    if(state!=='playing'||!stones.length)return;
    var last=stones.pop();
    if(last.scoreGiven)score=Math.max(0,score-last.pts);
    World.remove(world,last.body);
    // Recompute max height after removal
    var h=measureHeight();
    if(h<maxHeight)maxHeight=h;
    if(_play)try{_play('tap');}catch(e){}
    flash('UNDO','#8a9178');
  };

  showMenu();
}
})();
