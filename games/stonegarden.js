// ═══ STONE GARDEN v4 — two-handed multi-touch cairn stacker ═══
// Matter.js rigid-body physics. Real two-tray, four-finger multi-touch.
// Touch 1: picks up a rock from a tray; rock follows that finger.
// Touch 2 (while 1 is holding): becomes the rotator. Angle from finger 1
// to finger 2 controls rock rotation. Move finger 2 in a circle around
// finger 1 to spin the rock. Touches 3 & 4 do the same for a second rock.
// Carried rocks ghost through placed rocks until released.
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
      Composite=M.Composite,Events=M.Events;

  // ─── CONSTANTS ──────────────────────────────────────────────────
  var W=360,H=580;
  var GROUND_Y=H-36;
  var TRAY_W=64;                         // width of each tray column
  var TRAY_SLOTS=4;                      // rocks per tray
  var TOPPLE_X_SLACK=140;
  var TOPPLE_Y=H+200;
  var CAM_LEAD=0.32;
  var CAM_LERP=0.07;
  var WIND_INTERVAL=9;
  var WIND_FORCE=0.0018;
  var CHALLENGE_TARGET=380;
  var ROTATOR_MIN_DIST=14;               // ignore rotator touches too close to carrier (no reliable angle)

  // ─── SHAPE GENERATION ──────────────────────────────────────────
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
      gen:function(){var w=62+Math.random()*18,h=13+Math.random()*5;return{w:w,h:h,verts:ovalVerts(w,h,10,0.12)};}},
    pebble:{pts:2,weight:14,tint:'cool',
      gen:function(){var w=30+Math.random()*12,h=24+Math.random()*9;return{w:w,h:h,verts:ovalVerts(w,h,9,0.18)};}},
    boulder:{pts:3,weight:9,tint:'warm',
      gen:function(){var w=50+Math.random()*18,h=w*(0.72+Math.random()*0.16);return{w:w,h:h,verts:ovalVerts(w,h,10,0.14)};}},
    coin:{pts:2,weight:9,tint:'moss',
      gen:function(){var r=12+Math.random()*5;return{w:r*2,h:r*2,verts:ovalVerts(r*2,r*2,12,0.05)};}},
    spire:{pts:4,weight:6,tint:'cool',
      gen:function(){var w=22+Math.random()*8,h=50+Math.random()*20;return{w:w,h:h,verts:ovalVerts(w,h,8,0.12)};}},
    wedge:{pts:5,weight:6,tint:'warm',
      gen:function(){
        var w=42+Math.random()*14,h=32+Math.random()*16;
        var peak=-w/2+w*(0.3+Math.random()*0.4);
        return{w:w,h:h,verts:[{x:peak,y:-h/2},{x:w/2,y:h/2},{x:-w/2,y:h/2}]};
      }},
    crystal:{pts:6,weight:3,tint:'crystal',
      gen:function(){
        var w=22+Math.random()*8,h=46+Math.random()*15;
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
    for(var j=0;j<keys.length;j++){r-=SHAPES[keys[j]].weight;if(r<=0)return keys[j];}
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
  var stones=[];                   // rocks in physics world (placed + falling)
  var trayL=[],trayR=[];           // rocks sitting in trays (not in physics world)
  var carries={};                  // touchId -> {rock, isCarrier, rotatorTouchId, rotatorBaseAngle, rockBaseAngle, trayFrom, trayIdx}
  var rockToCarrier={};            // rock._sgId -> carrierTouchId
  var touchPos={};                 // touchId -> {x,y} cached for rotation lookups
  var rockIdSeq=1;

  var mode='zen',state='menu';
  var score=0,stonesPlaced=0,maxHeight=0;
  var lives=3,bestScore=0,bestHeight=0;
  var windActive=false,windRemaining=0,windDir=1;
  var cameraY=0,viewScale=1;               // zoom-to-fit scale, 1 = no zoom
  var particles=[];
  var running=false,lastTime=0,rafId=null;
  function onWinMouseMove(e){
    if(!carries['m'])return;
    e.preventDefault();
    var fakeEvt={preventDefault:function(){},changedTouches:[{identifier:'m',clientX:e.clientX,clientY:e.clientY}]};
    onTouchMove(fakeEvt);
  }
  function onWinMouseUp(e){
    if(!carries['m'])return;
    e.preventDefault();
    var fakeEvt={preventDefault:function(){},changedTouches:[{identifier:'m',clientX:e.clientX,clientY:e.clientY}]};
    onTouchEnd(fakeEvt);
  }
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    running=false;
    if(rafId){cancelAnimationFrame(rafId);rafId=null;}
    window.removeEventListener('mousemove',onWinMouseMove);
    window.removeEventListener('mouseup',onWinMouseUp);
  });
  var flashMsg='',flashTimer=0,flashColor='#e8dcc8';
  var spinning=false;                      // true while ROTATE button held
  var TRAY_SPIN_SPEED=1.2;                 // radians/sec

  try{bestScore=parseInt(localStorage.getItem('lw_sg_best_score')||'0',10)||0;}catch(e){}
  try{bestHeight=parseInt(localStorage.getItem('lw_sg_best')||'0',10)||0;}catch(e){}

  // ─── MENU ───────────────────────────────────────────────────────
  function showMenu(){
    state='menu';running=false;
    if(rafId)cancelAnimationFrame(rafId);
    if(engine){World.clear(world,false);Engine.clear(engine);engine=null;world=null;}
    stones=[];trayL=[];trayR=[];carries={};rockToCarrier={};touchPos={};particles=[];
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:1.5rem;color:var(--sage);letter-spacing:3px;margin:22px 0 6px;">STONE GARDEN</div>'
      +'<div style="font-style:italic;font-size:0.78rem;color:var(--muted);margin-bottom:18px;line-height:1.45;max-width:320px;margin-left:auto;margin-right:auto;">Pick stones from either tray. Hold with one finger, spin with a second. Use both hands at once to balance two stones.</div>'
      +'<button class="gb" onclick="_SGbegin(\'zen\')" style="display:block;width:260px;margin:8px auto;padding:14px;min-height:56px;">ZEN MODE<div style="font-size:0.72rem;opacity:0.85;font-style:italic;margin-top:2px;">No fail. Wind gusts shake the stack.</div></button>'
      +'<button class="gb" onclick="_SGbegin(\'challenge\')" style="display:block;width:260px;margin:8px auto;padding:14px;min-height:56px;">CHALLENGE<div style="font-size:0.72rem;opacity:0.85;font-style:italic;margin-top:2px;">Reach '+CHALLENGE_TARGET+'px. 3 topples and out.</div></button>'
      +'<div style="margin-top:18px;font-size:0.72rem;color:var(--muted);line-height:1.8;">'
      +'Best Score: <span style="color:var(--gold)">'+bestScore+'</span><br>'
      +'Best Height: <span style="color:var(--gold)">'+bestHeight+'px</span>'
      +'</div>';
    pan.innerHTML=h;
  }

  // ─── ROCK CREATION ──────────────────────────────────────────────
  function createRock(shapeKey,x,y){
    var S=SHAPES[shapeKey];
    var g=S.gen();
    var colors=makeColors(S.tint||'warm');
    var opts={friction:0.82,frictionStatic:1.1,restitution:0.06,density:0.0022,slop:0.02,sleepThreshold:160};
    // Collision body is a regular 10-gon scaled to the rock's silhouette —
    // NOT Bodies.fromVertices(g.verts). fromVertices needs poly-decomp
    // (never shipped) for the concave procedural outlines; without it the
    // bodies got invalid geometry: stones tunneled through the ground and
    // matter's _findSupports crashed the tick loop every session (zero
    // stones ever settled). The DRAWN shape stays the original verts; only
    // the physics shape is simplified.
    var pr=Math.max(6,(g.w+g.h)/4);
    var body=Bodies.polygon(x,y,10,pr,opts);
    try{
      // Squash the 10-gon to the rock's real aspect ratio so flat stones
      // still stack like flat stones.
      if(Matter.Body&&Matter.Body.scale&&g.w>0&&g.h>0){
        Matter.Body.scale(body,(g.w/2)/pr,(g.h/2)/pr);
      }
    }catch(e){}
    if(!body||!isFinite(body.position.x)||!isFinite(body.position.y)||!isFinite(body.mass)||body.mass===0){
      body=Bodies.rectangle(x,y,Math.max(6,g.w),Math.max(6,g.h),opts);
    }
    body._sgId=rockIdSeq++;
    return{
      body:body,shape:shapeKey,pts:S.pts,
      w:g.w,h:g.h,verts:g.verts,color:colors.fill,shade:colors.shade,
      settled:false,scoreGiven:false,_sgId:body._sgId
    };
  }

  function fillTrays(){
    trayL=[];trayR=[];
    for(var i=0;i<TRAY_SLOTS;i++){
      trayL.push(createRock(pickShape(),TRAY_W/2,traySlotY(i)));
      trayR.push(createRock(pickShape(),W-TRAY_W/2,traySlotY(i)));
    }
    // Trays are NOT in the physics world — they're rendered manually.
    // We still Body.setStatic to keep them sleeping.
    for(var j=0;j<trayL.length;j++){if(trayL[j])Body.setStatic(trayL[j].body,true);}
    for(var k=0;k<trayR.length;k++){if(trayR[k])Body.setStatic(trayR[k].body,true);}
  }
  function traySlotY(idx){
    var top=22,bot=GROUND_Y-8,span=bot-top;
    return top+span*((idx+0.5)/TRAY_SLOTS);
  }
  function syncTrayPositions(){
    // Keep tray rocks pinned to their slots but preserve angle — the
    // ROTATE button drives angle externally so players can freeze a
    // piece at a chosen orientation by grabbing it mid-spin.
    for(var i=0;i<trayL.length;i++){
      if(trayL[i])Body.setPosition(trayL[i].body,{x:TRAY_W/2,y:traySlotY(i)});
    }
    for(var j=0;j<trayR.length;j++){
      if(trayR[j])Body.setPosition(trayR[j].body,{x:W-TRAY_W/2,y:traySlotY(j)});
    }
  }
  function spinTrayStones(dAngle){
    for(var i=0;i<trayL.length;i++){
      if(trayL[i])Body.setAngle(trayL[i].body,trayL[i].body.angle+dAngle);
    }
    for(var j=0;j<trayR.length;j++){
      if(trayR[j])Body.setAngle(trayR[j].body,trayR[j].body.angle+dAngle);
    }
  }

  // ─── INPUT: MULTI-TOUCH WITH ROTATOR FINGERS ───────────────────
  function canvasPt(clientX,clientY){
    var rect=canvas.getBoundingClientRect();
    return{x:(clientX-rect.left)*(W/rect.width),y:(clientY-rect.top)*(H/rect.height)+cameraY};
  }
  function hitTestTray(x,y){
    // Check left tray
    if(x<=TRAY_W){
      for(var i=0;i<trayL.length;i++){
        var r=trayL[i];if(!r)continue;
        if(Math.abs(y-traySlotY(i))<=r.h/2+10)return{side:'L',idx:i,rock:r};
      }
    }
    if(x>=W-TRAY_W){
      for(var j=0;j<trayR.length;j++){
        var r2=trayR[j];if(!r2)continue;
        if(Math.abs(y-traySlotY(j))<=r2.h/2+10)return{side:'R',idx:j,rock:r2};
      }
    }
    return null;
  }
  function hitTestCarriedRock(x,y){
    // Any currently-carried rock that contains (x,y) in its vertex polygon
    for(var tid in carries){
      if(!carries.hasOwnProperty(tid))continue;
      var c=carries[tid];
      if(!c.isCarrier)continue;
      var b=c.rock.body;
      // Rough AABB test first
      var b0=b.bounds;
      if(x<b0.min.x-20||x>b0.max.x+20||y<b0.min.y-20||y>b0.max.y+20)continue;
      // Accept if within bounding box expanded slightly (generous grab region)
      return{carrierTouchId:tid,carry:c};
    }
    return null;
  }

  function onTouchStart(e){
    if(state!=='playing')return;
    e.preventDefault();
    for(var i=0;i<e.changedTouches.length;i++){
      var t=e.changedTouches[i];
      var pt=canvasPt(t.clientX,t.clientY);
      touchPos[t.identifier]={x:pt.x,y:pt.y};
      // Tray hit? Pick up a rock. Rock keeps its current tray angle
      // (set by the ROTATE button prior) so players can freeze a piece
      // at a chosen orientation by grabbing mid-spin.
      var trayHit=hitTestTray(pt.x,pt.y);
      if(!trayHit)continue;
      var r=trayHit.rock;
      if(trayHit.side==='L')trayL[trayHit.idx]=null;
      else trayR[trayHit.idx]=null;
      // NOTE: no Body.setStatic here. The carried body isn't in the world
      // (position is driven manually), and Matter 0.19's static toggle
      // corrupts part mass/inertia on restore — the source of the
      // Resolver crash that froze every session.
      Body.setPosition(r.body,{x:pt.x,y:pt.y});
      r.body.collisionFilter.group=-1;
      carries[t.identifier]={
        rock:r,isCarrier:true,
        trayFrom:trayHit.side,trayIdx:trayHit.idx
      };
      rockToCarrier[r._sgId]=t.identifier;
      if(_play)try{_play('snap');}catch(e2){}
    }
  }

  function onTouchMove(e){
    if(state!=='playing')return;
    e.preventDefault();
    for(var i=0;i<e.changedTouches.length;i++){
      var t=e.changedTouches[i];
      var pt=canvasPt(t.clientX,t.clientY);
      touchPos[t.identifier]={x:pt.x,y:pt.y};
      var c=carries[t.identifier];
      if(!c||!c.isCarrier)continue;
      // Update rock position. Clamp within playfield (world coords).
      var minX=c.rock.w/2+4,maxX=W-c.rock.w/2-4;
      var viewTop=cameraY+c.rock.h/2+8;
      var maxY=GROUND_Y-c.rock.h/2-4;
      var nx=Math.max(minX,Math.min(maxX,pt.x));
      var ny=Math.max(viewTop,Math.min(maxY,pt.y));
      Body.setPosition(c.rock.body,{x:nx,y:ny});
      // Angle unchanged — angle is set by ROTATE button while in tray
    }
  }

  function onTouchEnd(e){
    if(state!=='playing')return;
    e.preventDefault();
    for(var i=0;i<e.changedTouches.length;i++){
      var t=e.changedTouches[i];
      delete touchPos[t.identifier];
      var c=carries[t.identifier];
      if(c&&c.isCarrier)releaseCarry(t.identifier);
    }
  }

  function releaseCarry(carrierId){
    var c=carries[carrierId];
    if(!c)return;
    var r=c.rock;
    // Restore collision and add to world (body was never made static — see
    // onTouchStart note).
    r.body.collisionFilter.group=0;
    Body.setVelocity(r.body,{x:0,y:0});
    Body.setAngularVelocity(r.body,0);
    World.add(world,r.body);
    stones.push(r);
    if(_play)try{_play('dig');}catch(e){}
    // Clean up
    delete rockToCarrier[r._sgId];
    // Any rotator tied to this carry becomes orphaned; clean later when they lift
    delete carries[carrierId];
    // Refill the tray slot
    setTimeout(function(){
      if(state==='playing'){
        if(c.trayFrom==='L')trayL[c.trayIdx]=makeTrayStone();
        else trayR[c.trayIdx]=makeTrayStone();
      }
    },400);
  }

  function makeTrayStone(){
    return createRock(pickShape(),W/2,0);
  }

  // ─── PHYSICS LIFECYCLE ─────────────────────────────────────────
  function onStoneSettled(stone){
    if(stone.scoreGiven)return;
    stone.scoreGiven=true;
    stone.settled=true;
    score+=stone.pts;
    stonesPlaced++;
    for(var i=0;i<7;i++){
      particles.push({
        x:stone.body.position.x+(Math.random()-0.5)*stone.w,
        y:stone.body.position.y+stone.h/2,
        vx:(Math.random()-0.5)*28,vy:-Math.random()*42-10,
        life:0.55+Math.random()*0.35,maxLife:0.9,size:1.2+Math.random()*2.2
      });
    }
    var h=measureHeight();
    if(h>maxHeight)maxHeight=h;
    if(_e)try{_e('milestone');}catch(e){}
    if(mode==='zen'&&stonesPlaced>0&&stonesPlaced%WIND_INTERVAL===0)scheduleWindGust();
    if(mode==='challenge'&&h>=CHALLENGE_TARGET){setTimeout(function(){win();},900);}
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
        stones.splice(i,1);any=true;
      }
    }
    return any;
  }

  // ─── WIND ───────────────────────────────────────────────────────
  function scheduleWindGust(){
    windActive=true;windRemaining=1.6;windDir=Math.random()<0.5?-1:1;
    flash('WIND','#5bafd4');
  }
  function applyWind(dt){
    if(!windActive)return;
    windRemaining-=dt;
    if(windRemaining<=0){windActive=false;return;}
    var t=windRemaining/1.6;
    var strength=WIND_FORCE*Math.sin(t*Math.PI);
    for(var i=0;i<stones.length;i++){
      var b=stones[i].body;
      if(b.isStatic)continue;
      Body.applyForce(b,b.position,{x:windDir*strength*b.mass,y:0});
    }
  }

  function flash(txt,color){flashMsg=txt;flashTimer=1.6;flashColor=color||'#e8dcc8';}

  // ─── RENDER ─────────────────────────────────────────────────────
  function drawStoneBody(body,w,h,color,shade,alpha){
    var vs=body.vertices;
    var bx=body.position.x,by=body.position.y-cameraY;
    // Defensive: skip render if any coordinate has gone non-finite.
    // Matter.js can produce NaN positions on degenerate polygons or
    // after freak collisions; a NaN crashes createLinearGradient.
    if(!isFinite(bx)||!isFinite(by)||!vs||!vs.length||!isFinite(vs[0].x)||!isFinite(vs[0].y))return;
    ctx.save();
    ctx.globalAlpha=alpha||1;
    ctx.beginPath();
    ctx.moveTo(vs[0].x,vs[0].y-cameraY);
    for(var i=1;i<vs.length;i++)ctx.lineTo(vs[i].x,vs[i].y-cameraY);
    ctx.closePath();
    var grd=ctx.createLinearGradient(bx-w/2,by-h/2,bx+w/2,by+h/2);
    grd.addColorStop(0,color);grd.addColorStop(1,shade);
    ctx.fillStyle=grd;ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.32)';ctx.lineWidth=1;ctx.stroke();
    ctx.globalAlpha=1;
    ctx.restore();
  }

  function drawTrayZone(side){
    var x0=side==='L'?0:W-TRAY_W;
    var g=ctx.createLinearGradient(x0,0,x0+TRAY_W,0);
    if(side==='L'){g.addColorStop(0,'rgba(16,20,12,0.92)');g.addColorStop(1,'rgba(16,20,12,0.35)');}
    else{g.addColorStop(0,'rgba(16,20,12,0.35)');g.addColorStop(1,'rgba(16,20,12,0.92)');}
    ctx.fillStyle=g;ctx.fillRect(x0,0,TRAY_W,H);
    ctx.strokeStyle='rgba(200,168,75,0.14)';ctx.lineWidth=1;
    ctx.beginPath();
    if(side==='L'){ctx.moveTo(TRAY_W,0);ctx.lineTo(TRAY_W,H);}
    else{ctx.moveTo(W-TRAY_W,0);ctx.lineTo(W-TRAY_W,H);}
    ctx.stroke();
  }

  function drawTrayRocks(){
    for(var i=0;i<trayL.length;i++){
      var r=trayL[i];if(!r)continue;
      drawStoneBody(r.body,r.w,r.h,r.color,r.shade,1);
      ctx.fillStyle='rgba(200,168,75,0.8)';
      ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('+'+r.pts,TRAY_W/2,traySlotY(i)+r.h/2+10);
    }
    for(var j=0;j<trayR.length;j++){
      var r2=trayR[j];if(!r2)continue;
      drawStoneBody(r2.body,r2.w,r2.h,r2.color,r2.shade,1);
      ctx.fillStyle='rgba(200,168,75,0.8)';
      ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('+'+r2.pts,W-TRAY_W/2,traySlotY(j)+r2.h/2+10);
    }
    ctx.textBaseline='alphabetic';
  }

  function drawCarriedRocks(){
    for(var tid in carries){
      if(!carries.hasOwnProperty(tid))continue;
      var c=carries[tid];
      if(!c.isCarrier)continue;
      // Dashed ghost line from held rock straight down to ground
      ctx.save();
      ctx.setLineDash([4,5]);
      ctx.strokeStyle='rgba(232,220,200,0.28)';
      ctx.lineWidth=1;
      ctx.beginPath();
      var px=c.rock.body.position.x,py=c.rock.body.position.y-cameraY;
      ctx.moveTo(px,py+c.rock.h/2);
      ctx.lineTo(px,GROUND_Y-cameraY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      drawStoneBody(c.rock.body,c.rock.w,c.rock.h,c.rock.color,c.rock.shade,0.88);
    }
  }

  function render(){
    var sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#0f1410');sky.addColorStop(0.6,'#131a14');sky.addColorStop(1,'#181c14');
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // Stars
    ctx.fillStyle='rgba(232,220,200,0.06)';
    for(var st=0;st<8;st++){
      var sx=((st*137)%W),sy=(st*29)%(H*0.4);
      ctx.fillRect(sx,sy,1,1);
    }
    // Moon
    ctx.save();
    var mg=ctx.createRadialGradient(W*0.78,H*0.18,2,W*0.78,H*0.18,70);
    mg.addColorStop(0,'rgba(232,220,200,0.18)');mg.addColorStop(1,'rgba(232,220,200,0)');
    ctx.fillStyle=mg;ctx.fillRect(0,0,W,H*0.5);
    ctx.restore();
    // Sand band
    var groundScreenY=GROUND_Y-cameraY;
    if(groundScreenY<H){
      ctx.fillStyle='rgba(42,38,28,0.6)';ctx.fillRect(0,groundScreenY,W,H-groundScreenY);
      ctx.strokeStyle='rgba(70,60,45,0.22)';ctx.lineWidth=1;
      for(var y=groundScreenY+6;y<H;y+=7){
        ctx.beginPath();ctx.moveTo(0,y);
        for(var x=0;x<W;x+=3)ctx.lineTo(x,y+Math.sin(x*0.03+y*0.1)*1.5);
        ctx.stroke();
      }
      ctx.strokeStyle='rgba(90,80,65,0.4)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(0,groundScreenY);ctx.lineTo(W,groundScreenY);ctx.stroke();
    }
    // Trays backdrop (always visible at screen space, behind rocks)
    drawTrayZone('L');drawTrayZone('R');
    // Placed stones
    for(var i=0;i<stones.length;i++)drawStoneBody(stones[i].body,stones[i].w,stones[i].h,stones[i].color,stones[i].shade,1);
    // Tray rocks
    drawTrayRocks();
    // Carried (kinematic) rocks
    drawCarriedRocks();
    // Particles
    for(var pi=0;pi<particles.length;pi++){
      var p=particles[pi],al=Math.max(0,p.life/p.maxLife);
      ctx.fillStyle='rgba(168,148,118,'+(al*0.75)+')';
      ctx.beginPath();ctx.arc(p.x,p.y-cameraY,p.size*al,0,Math.PI*2);ctx.fill();
    }
    // Wind lines
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
    // HUD
    ctx.save();
    ctx.fillStyle='rgba(13,16,12,0.55)';ctx.fillRect(0,0,W,28);
    ctx.fillStyle='#e8dcc8';ctx.font='bold 13px DM Sans,sans-serif';
    ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText('SCORE '+score,8,14);
    ctx.textAlign='right';ctx.font='11px DM Mono,monospace';
    ctx.fillStyle='rgba(232,220,200,0.75)';
    if(mode==='challenge'){ctx.fillText('LIVES '+lives+' · '+maxHeight+'/'+CHALLENGE_TARGET+'px',W-8,14);}
    else{ctx.fillText(maxHeight+'px · '+stonesPlaced+' stones',W-8,14);}
    ctx.restore();
    // Flash
    if(flashTimer>0){
      ctx.save();
      ctx.globalAlpha=Math.min(1,flashTimer);
      ctx.fillStyle=flashColor;ctx.font='bold 22px Bebas Neue,sans-serif';
      ctx.textAlign='center';ctx.fillText(flashMsg,W/2,H/2);
      ctx.restore();
    }
  }

  // ─── CAMERA ─────────────────────────────────────────────────────
  // Keep the ground pinned to the bottom of the view at all times.
  // When the stack is taller than the canvas, the top portion simply
  // scrolls out of view above — players will still always see the
  // base of the cairn. (Earlier version scrolled camera up to follow
  // the top and the ground fell off the bottom; Stephen flagged this.)
  function updateCamera(){
    cameraY=0;
    // Future enhancement: if stack exceeds canvas height by a lot,
    // could auto-scale view to fit. For now, keep simple + predictable.
  }

  // ─── LOOP ───────────────────────────────────────────────────────
  function tick(ts){
    if(!running){rafId=null;return;}
    if(!document.body.classList.contains('game-active')){running=false;rafId=null;return;}
    var dt=lastTime?Math.min((ts-lastTime)/1000,0.033):0.016;
    lastTime=ts;
    try{
      Engine.update(engine,dt*1000);
    }catch(err){
      // A physics-step crash used to kill the rAF loop permanently (frozen
      // mid-air stone, dead game). Recover: crumble the newest stone — it's
      // the body the resolver choked on — and keep playing.
      try{
        var bad=stones.pop();
        if(bad&&bad.body)World.remove(world,bad.body);
        flash('STONE CRUMBLED','#c75050');
      }catch(e2){}
    }
    applyWind(dt);
    for(var i=0;i<stones.length;i++){
      if(!stones[i].scoreGiven&&stones[i].body.isSleeping)onStoneSettled(stones[i]);
    }
    if(checkToppled()){
      if(mode==='challenge'){
        lives--;flash('TOPPLE · '+lives+' LEFT','#c75050');
        if(_play)try{_play('buzz');}catch(e){}
        if(lives<=0)return lose();
      } else flash('TOPPLE','#c75050');
    }
    // Particles
    for(var pi=particles.length-1;pi>=0;pi--){
      var p=particles[pi];
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;p.life-=dt;
      if(p.life<=0)particles.splice(pi,1);
    }
    // ROTATE button held: spin all tray pieces in sync
    if(spinning)spinTrayStones(TRAY_SPIN_SPEED*dt);
    // Re-sync tray rock positions (kinematic bodies don't auto-stay put)
    syncTrayPositions();
    updateCamera();
    if(flashTimer>0)flashTimer-=dt;
    render();
    rafId=requestAnimationFrame(tick);
  }

  // ─── SETUP + LIFECYCLE ─────────────────────────────────────────
  function setupCanvas(){
    var target=Math.min(440,window.innerWidth-24);
    W=target;
    H=Math.min(640,window.innerHeight-240);
    if(H<420)H=420;
    GROUND_Y=H-36;
    TOPPLE_Y=H+200;
    dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr;canvas.height=H*dpr;
    canvas.style.width=W+'px';canvas.style.height=H+'px';
    ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function setupWorld(){
    engine=Engine.create({enableSleeping:true});
    engine.gravity.y=1.0;engine.gravity.scale=0.0018;
    world=engine.world;
    ground=Bodies.rectangle(W/2,GROUND_Y+120,W*4,240,{isStatic:true,friction:0.95,frictionStatic:1.4});
    wallL=Bodies.rectangle(-120,GROUND_Y-400,40,1600,{isStatic:true});
    wallR=Bodies.rectangle(W+120,GROUND_Y-400,40,1600,{isStatic:true});
    World.add(world,[ground,wallL,wallR]);
  }
  function begin(m){
    mode=m;state='playing';
    score=0;stonesPlaced=0;maxHeight=0;lives=3;cameraY=0;
    stones=[];particles=[];carries={};rockToCarrier={};touchPos={};
    pan.innerHTML='';
    canvas=document.createElement('canvas');
    canvas.style.cssText='display:block;margin:4px auto 8px;border-radius:8px;background:#0d100c;touch-action:none;box-shadow:0 4px 16px rgba(0,0,0,0.4);';
    pan.appendChild(canvas);
    setupCanvas();
    setupWorld();
    fillTrays();
    // Controls bar
    var bar=document.createElement('div');
    bar.style.cssText='display:flex;gap:8px;justify-content:center;align-items:center;margin:4px 0 8px;flex-wrap:wrap;';
    bar.innerHTML=
      '<button class="gb" id="SGrotate" style="min-height:52px;min-width:92px;border-color:rgba(200,168,75,0.45);color:var(--gold,#c8a84b);">⟳ ROTATE</button>'
      +'<button class="gb" onclick="_SGundo()" style="min-height:52px;" id="SGundo">↶ UNDO</button>'
      +'<button class="gb" onclick="_SGmenu()" style="min-height:52px;">MENU</button>';
    pan.appendChild(bar);
    // Hold ROTATE to spin all tray pieces. Grab a piece mid-spin to
    // freeze it at that angle.
    var rotateBtn=document.getElementById('SGrotate');
    var rotStart=function(e){e.preventDefault();spinning=true;rotateBtn.style.background='rgba(200,168,75,0.2)';};
    var rotStop=function(e){if(e)e.preventDefault();spinning=false;rotateBtn.style.background='';};
    rotateBtn.addEventListener('mousedown',rotStart);
    rotateBtn.addEventListener('mouseup',rotStop);
    rotateBtn.addEventListener('mouseleave',rotStop);
    rotateBtn.addEventListener('touchstart',rotStart,{passive:false});
    rotateBtn.addEventListener('touchend',rotStop,{passive:false});
    rotateBtn.addEventListener('touchcancel',rotStop,{passive:false});
    var tip=document.createElement('div');
    tip.style.cssText='font-family:DM Mono,monospace;font-size:0.6rem;color:var(--muted);text-align:center;line-height:1.4;margin:0 8px 4px;';
    tip.innerHTML=mode==='zen'
      ? 'Hold ⟳ to spin tray pieces · grab to freeze · two hands = two stones'
      : 'Reach '+CHALLENGE_TARGET+'px · 3 topples end the run';
    pan.appendChild(tip);
    // Input wiring — all multi-touch on the canvas
    canvas.addEventListener('touchstart',onTouchStart,{passive:false});
    canvas.addEventListener('touchmove',onTouchMove,{passive:false});
    canvas.addEventListener('touchend',onTouchEnd,{passive:false});
    canvas.addEventListener('touchcancel',onTouchEnd,{passive:false});
    // Mouse support (single-point, for desktop) — simulate tid='m'
    canvas.addEventListener('mousedown',function(e){
      e.preventDefault();
      var fakeEvt={preventDefault:function(){},changedTouches:[{identifier:'m',clientX:e.clientX,clientY:e.clientY}]};
      onTouchStart(fakeEvt);
    });
    // begin() runs per round — named handlers + remove-before-add so
    // window listeners never stack across rounds or survive game exit
    window.removeEventListener('mousemove',onWinMouseMove);
    window.addEventListener('mousemove',onWinMouseMove);
    window.removeEventListener('mouseup',onWinMouseUp);
    window.addEventListener('mouseup',onWinMouseUp);
    running=true;lastTime=0;
    rafId=requestAnimationFrame(tick);
    sm(mode==='zen'?'Zen. Build freely.':'Challenge. Reach '+CHALLENGE_TARGET+'px.');
  }

  function win(){
    running=false;state='won';
    if(rafId)cancelAnimationFrame(rafId);
    flash('CAIRN COMPLETE','#c8a84b');
    if(_playWin)try{_playWin();}catch(e){}
    if(_e)try{_e('game_win');}catch(e){}
    saveBest();
    _sr('stonegarden',{w:true,s:score,ht:maxHeight,stones:stonesPlaced,mode:mode});
    setTimeout(showMenu,2200);
  }
  function lose(){
    running=false;state='gameover';
    if(rafId)cancelAnimationFrame(rafId);
    flash('RUN ENDED','#c75050');
    if(_e)try{_e('game_loss');}catch(e){}
    saveBest();
    _sr('stonegarden',{w:false,s:score,ht:maxHeight,stones:stonesPlaced,mode:mode});
    setTimeout(showMenu,2200);
  }
  function saveBest(){
    if(score>bestScore){bestScore=score;try{localStorage.setItem('lw_sg_best_score',String(bestScore));}catch(e){}}
    if(maxHeight>bestHeight){bestHeight=maxHeight;try{localStorage.setItem('lw_sg_best',String(bestHeight));}catch(e){}}
  }

  window._SGbegin=function(m){begin(m);};
  window._SGmenu=function(){if(state==='playing')saveBest();showMenu();};
  window._SGundo=function(){
    if(state!=='playing'||!stones.length)return;
    var last=stones.pop();
    if(last.scoreGiven)score=Math.max(0,score-last.pts);
    World.remove(world,last.body);
    var h=measureHeight();
    if(h<maxHeight)maxHeight=h;
    if(_play)try{_play('tap');}catch(e){}
    flash('UNDO','#8a9178');
  };

  showMenu();
}
})();
