// ═══ STONE GARDEN v2 — multi-touch shape-based stacking ═══
// Two trays (left + right) hold stones of different shapes and point
// values. Pick up with any finger; multiple fingers can each carry their
// own stone. Hold one stone steady while positioning another, build
// towers, rings, and arcs. Harder shapes (wedges, crescents) are worth
// more. Physics runs continuously, so stones in flight interact with
// settled ones immediately.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns=window._gameFns||{};
window._gameFns.stonegarden=function SG(a){
  // ─── CONSTANTS ───────────────────────────────────────────────────────
  var GRAVITY=580,RESTITUTION=0.12,FRICTION=0.65,ANG_DAMP=0.94,LIN_DAMP=0.998;
  var SETTLE_VEL=0.8,SETTLE_ANG=0.01,SETTLE_FRAMES=30,SUBSTEPS=4;
  var TRAY_W=62;          // pixels per side tray
  var TRAY_SLOTS=4;       // stones per tray
  var ARC_H_TOLERANCE=18; // same-row tolerance for arc detection
  var ARC_GAP_MAX=14;     // max gap between neighbors to count as arc

  // ─── SHAPE CLASSES ───────────────────────────────────────────────────
  // Each class has: label (HUD), pts (score), a shape function that returns
  // {w, h, verts[]}. Harder-to-stack shapes are worth more.
  var SHAPES={
    slab:    {label:'SLAB',    pts:1},
    pebble:  {label:'PEBBLE',  pts:2},
    boulder: {label:'BOULDER', pts:3},
    spire:   {label:'SPIRE',   pts:4},
    wedge:   {label:'WEDGE',   pts:5},
    crescent:{label:'CRESCENT',pts:7}
  };
  function _genSlab(){
    var w=70+Math.random()*28,h=12+Math.random()*8;
    return{w:w,h:h,verts:_oval(w,h,6,0.08)};
  }
  function _genPebble(){
    var w=30+Math.random()*18,h=22+Math.random()*10;
    return{w:w,h:h,verts:_oval(w,h,7,0.18)};
  }
  function _genBoulder(){
    var w=58+Math.random()*22,h=w*(0.72+Math.random()*0.18);
    return{w:w,h:h,verts:_oval(w,h,8,0.14)};
  }
  function _genSpire(){
    var w=22+Math.random()*12,h=52+Math.random()*28;
    return{w:w,h:h,verts:_oval(w,h,6,0.10)};
  }
  function _genWedge(){
    // Asymmetric triangle — one flat bottom, peak off-center.
    var w=42+Math.random()*18,h=32+Math.random()*20;
    var peak=-w/2+w*(0.25+Math.random()*0.5);
    var verts=[
      {x:peak,y:-h/2},
      {x:w/2,y:h/2},
      {x:-w/2,y:h/2}
    ];
    return{w:w,h:h,verts:verts};
  }
  function _genCrescent(){
    // Thin curved bar — samples a top arc + bottom arc offset for a
    // moon-crescent polygon. Hardest to balance.
    var w=60+Math.random()*28,h=36+Math.random()*14;
    var verts=[],N=10;
    // Top arc (outer curve)
    for(var i=0;i<=N;i++){
      var t=i/N,x=-w/2+w*t;
      var y=-h/2+(1-Math.sin(Math.PI*t))*h*0.12;
      verts.push({x:x,y:y});
    }
    // Bottom arc (inner curve, dipping up in the middle)
    for(var j=N;j>=0;j--){
      var t2=j/N,x2=-w/2+w*t2;
      var y2=h/2-(1-Math.sin(Math.PI*t2))*h*0.55;
      verts.push({x:x2,y:y2});
    }
    return{w:w,h:h,verts:verts};
  }
  function _oval(w,h,N,jitter){
    var verts=[],hw=w/2,hh=h/2;
    for(var i=0;i<N;i++){
      var ang=(i/N)*Math.PI*2-Math.PI/2;
      var rx=hw*(1-jitter+Math.random()*jitter*2);
      var ry=hh*(1-jitter+Math.random()*jitter*2);
      verts.push({x:Math.cos(ang)*rx,y:Math.sin(ang)*ry});
    }
    return verts;
  }

  // ─── STATE ───────────────────────────────────────────────────────────
  var state='menu',mode='zen';
  var stones=[];       // settled + in-flight stones (in physics)
  var trayL=[],trayR=[]; // {shape, data, slotIdx} — pre-rendered
  var carries={};      // pointerId → {stone (hover), fromTray:'L'|'R'|null, slotIdx}
  var particles=[];
  var score=0,stonesPlaced=0,bestScore=0,maxHeight=0,bestHeight=0,comboArc=0;
  var arcs=0,ringDetected=false;
  var canvas,ctx,W=360,H=520,GROUND_Y=440,dpr=1,running=false,lastTime=0;
  var msgTimer=0,msg='';

  try{bestScore=parseInt(localStorage.getItem('lw_sg_best_score')||'0',10)||0;}catch(e){}
  try{bestHeight=parseInt(localStorage.getItem('lw_sg_best')||'0',10)||0;}catch(e){}

  ms(a,'<strong id="SGh">Stone Garden</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='SGpan';
  pan.style.cssText='max-width:440px;margin:0 auto;padding:6px;user-select:none;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_SGmenu()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  // ─── MENU ────────────────────────────────────────────────────────────
  function showMenu(){
    state='menu';running=false;carries={};
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:1.4rem;color:var(--sage);letter-spacing:3px;margin:18px 0 4px;">STONE GARDEN</div>';
    h+='<div style="font-style:italic;font-size:0.78rem;color:var(--muted);margin-bottom:14px;line-height:1.4;">Stack shapes from both trays. Use multiple fingers — hold one stone while placing another. Build arcs and rings.</div>';
    h+='<button class="gb" onclick="_SGbegin(\'zen\')" style="display:block;width:260px;margin:6px auto;padding:12px;min-height:52px;">ZEN MODE<div style="font-size:0.75rem;opacity:0.85;font-style:italic;margin-top:2px;">No fail. Score freely.</div></button>';
    h+='<button class="gb" onclick="_SGbegin(\'challenge\')" style="display:block;width:260px;margin:6px auto;padding:12px;min-height:52px;">CHALLENGE<div style="font-size:0.75rem;opacity:0.85;font-style:italic;margin-top:2px;">3 topples ends the run.</div></button>';
    h+='<div style="margin-top:16px;font-size:0.72rem;color:var(--muted);line-height:1.6;">'
      +'Best Score: <span style="color:var(--gold)">'+bestScore+'</span><br>'
      +'Best Height: <span style="color:var(--gold)">'+bestHeight+'px</span>'
      +'</div>';
    // Shape legend
    h+='<div style="margin-top:14px;font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);letter-spacing:0.05em;">SHAPES · POINTS</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:6px;font-family:DM Mono,monospace;font-size:0.55rem;">';
    var ks=Object.keys(SHAPES);
    for(var i=0;i<ks.length;i++){
      var s=SHAPES[ks[i]];
      h+='<span style="padding:3px 7px;border:1px solid rgba(200,168,75,0.25);border-radius:4px;color:var(--cream);">'+s.label+' ·<span style="color:var(--gold);margin-left:4px;">+'+s.pts+'</span></span>';
    }
    h+='</div>';
    pan.innerHTML=h;
  }

  // ─── TRAY ────────────────────────────────────────────────────────────
  function newTrayStone(){
    var keys=Object.keys(SHAPES);
    // Weight toward easier early, wider variety later.
    var k=keys[Math.floor(Math.random()*keys.length)];
    return makeStone(k);
  }
  function fillTrays(){
    trayL=[];trayR=[];
    for(var i=0;i<TRAY_SLOTS;i++){trayL.push(newTrayStone());trayR.push(newTrayStone());}
  }
  function traySlotPos(side,idx){
    // Stones evenly spaced on each tray column, top to bottom.
    var x=side==='L'?TRAY_W/2:W-TRAY_W/2;
    var spacing=(GROUND_Y-30)/TRAY_SLOTS;
    var y=20+spacing/2+idx*spacing;
    return{x:x,y:y};
  }

  // ─── STONES ──────────────────────────────────────────────────────────
  function makeStone(shapeKey){
    var shape=SHAPES[shapeKey];
    var g;
    if(shapeKey==='slab')g=_genSlab();
    else if(shapeKey==='pebble')g=_genPebble();
    else if(shapeKey==='boulder')g=_genBoulder();
    else if(shapeKey==='spire')g=_genSpire();
    else if(shapeKey==='wedge')g=_genWedge();
    else g=_genCrescent();
    var mass=g.w*g.h*0.01,inertia=mass*(g.w*g.w+g.h*g.h)/12;
    var gray=92+Math.floor(Math.random()*35),warm=Math.floor(Math.random()*14)-5;
    return{
      shape:shapeKey,pts:shape.pts,
      x:0,y:0,vx:0,vy:0,angle:0,angVel:0,
      w:g.w,h:g.h,hw:g.w/2,hh:g.h/2,verts:g.verts,
      mass:mass,invMass:1/mass,inertia:inertia,invInertia:1/inertia,
      color:'rgb('+(gray+warm)+','+(gray+Math.floor(warm*0.5))+','+(gray-warm)+')',
      darkColor:'rgb('+(gray-22+warm)+','+(gray-22)+','+(gray-22-warm)+')',
      settled:false,settleTimer:0,inFlight:false
    };
  }

  // Verts → world corners via SAT. We keep the existing SAT because it
  // already handles arbitrary convex polygons; crescent is concave but
  // thin enough that physics still behaves acceptably (we approximate).
  function worldVerts(s){
    var c=Math.cos(s.angle),sn=Math.sin(s.angle);
    var out=[];
    for(var i=0;i<s.verts.length;i++){
      var v=s.verts[i];
      out.push({x:s.x+v.x*c-v.y*sn,y:s.y+v.x*sn+v.y*c});
    }
    return out;
  }
  // Use an axis-aligned bounding-rect SAT for collision detection — it's
  // cheaper and the shape fidelity is already carried by the rendered
  // verts. The w/h ratios still drive stability via inertia.
  function getCorners(s){
    var c=Math.cos(s.angle),sn=Math.sin(s.angle),hw=s.hw,hh=s.hh;
    return[
      {x:s.x+(-hw*c- -hh*sn),y:s.y+(-hw*sn+ -hh*c)},
      {x:s.x+( hw*c- -hh*sn),y:s.y+( hw*sn+ -hh*c)},
      {x:s.x+( hw*c-  hh*sn),y:s.y+( hw*sn+  hh*c)},
      {x:s.x+(-hw*c-  hh*sn),y:s.y+(-hw*sn+  hh*c)}
    ];
  }
  function getAxes(cs){var ax=[];for(var i=0;i<cs.length;i++){var j=(i+1)%cs.length;var ex=cs[j].x-cs[i].x,ey=cs[j].y-cs[i].y;var L=Math.sqrt(ex*ex+ey*ey);if(L<0.001)continue;ax.push({x:-ey/L,y:ex/L});}return ax;}
  function project(cs,ax){var mn=1e9,mx=-1e9;for(var i=0;i<cs.length;i++){var d=cs[i].x*ax.x+cs[i].y*ax.y;if(d<mn)mn=d;if(d>mx)mx=d;}return{min:mn,max:mx};}
  function satTest(a,b){
    var ca=getCorners(a),cb=getCorners(b);
    var axes=getAxes(ca).concat(getAxes(cb));
    var minOverlap=1e9,smallest=null;
    for(var i=0;i<axes.length;i++){
      var pa=project(ca,axes[i]),pb=project(cb,axes[i]);
      var o=Math.min(pa.max,pb.max)-Math.max(pa.min,pb.min);
      if(o<=0)return null;
      if(o<minOverlap){minOverlap=o;smallest=axes[i];}
    }
    var d={x:b.x-a.x,y:b.y-a.y};
    if(d.x*smallest.x+d.y*smallest.y<0){smallest.x=-smallest.x;smallest.y=-smallest.y;}
    return{axis:smallest,overlap:minOverlap};
  }
  function resolveCol(a,b,c){
    var totalInv=a.invMass+b.invMass;if(totalInv===0)return;
    var push=c.overlap/totalInv;
    a.x-=c.axis.x*push*a.invMass;a.y-=c.axis.y*push*a.invMass;
    b.x+=c.axis.x*push*b.invMass;b.y+=c.axis.y*push*b.invMass;
    var relVx=b.vx-a.vx,relVy=b.vy-a.vy;
    var relVel=relVx*c.axis.x+relVy*c.axis.y;
    if(relVel>0)return;
    var e=RESTITUTION,j=-(1+e)*relVel/totalInv;
    var jx=c.axis.x*j,jy=c.axis.y*j;
    a.vx-=jx*a.invMass;a.vy-=jy*a.invMass;
    b.vx+=jx*b.invMass;b.vy+=jy*b.invMass;
    // Friction tangent impulse (simplified)
    var tx=-c.axis.y,ty=c.axis.x;
    var relT=relVx*tx+relVy*ty;
    var jt=-relT/totalInv*FRICTION;
    a.vx-=tx*jt*a.invMass;a.vy-=ty*jt*a.invMass;
    b.vx+=tx*jt*b.invMass;b.vy+=ty*jt*b.invMass;
    a.settled=false;b.settled=false;a.settleTimer=0;b.settleTimer=0;
  }
  function groundCol(s){
    var cs=getCorners(s),lowestY=-1e9,lowest=null;
    for(var i=0;i<cs.length;i++)if(cs[i].y>lowestY){lowestY=cs[i].y;lowest=cs[i];}
    if(lowestY>GROUND_Y){
      var pen=lowestY-GROUND_Y;
      s.y-=pen;
      if(s.vy>0)s.vy=-s.vy*RESTITUTION;
      s.vx*=FRICTION;s.angVel*=0.7;
    }
  }

  // ─── PHYSICS ─────────────────────────────────────────────────────────
  function physicsStep(dt){
    var subDt=dt/SUBSTEPS;
    for(var step=0;step<SUBSTEPS;step++){
      for(var i=0;i<stones.length;i++){
        var s=stones[i];if(s.settled)continue;
        s.vy+=GRAVITY*subDt;
        s.vx*=LIN_DAMP;s.angVel*=ANG_DAMP;
        s.x+=s.vx*subDt;s.y+=s.vy*subDt;
        s.angle+=s.angVel*subDt;
        groundCol(s);
        // Keep in-bounds horizontally (leave the tray columns alone so
        // settled stones on the edge stay visible; clamp only to canvas).
        if(s.x<s.hw){s.x=s.hw;if(s.vx<0)s.vx=-s.vx*RESTITUTION;}
        if(s.x>W-s.hw){s.x=W-s.hw;if(s.vx>0)s.vx=-s.vx*RESTITUTION;}
      }
      for(var i2=0;i2<stones.length;i2++){
        for(var j=i2+1;j<stones.length;j++){
          if(stones[i2].settled&&stones[j].settled)continue;
          var col=satTest(stones[i2],stones[j]);
          if(col)resolveCol(stones[i2],stones[j],col);
        }
      }
    }
    for(var k=0;k<stones.length;k++){
      var st=stones[k];if(st.settled)continue;
      var sp=Math.sqrt(st.vx*st.vx+st.vy*st.vy);
      if(sp<SETTLE_VEL&&Math.abs(st.angVel)<SETTLE_ANG){
        st.settleTimer++;
        if(st.settleTimer>SETTLE_FRAMES){st.settled=true;st.vx=0;st.vy=0;st.angVel=0;onStoneSettled(st);}
      }else st.settleTimer=0;
    }
    for(var pi=particles.length-1;pi>=0;pi--){
      var p=particles[pi];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;p.life-=dt;
      if(p.life<=0)particles.splice(pi,1);
    }
  }

  function measureHeight(){
    var topY=GROUND_Y;
    for(var i=0;i<stones.length;i++){
      var cs=getCorners(stones[i]);
      for(var c=0;c<cs.length;c++)if(cs[c].y<topY)topY=cs[c].y;
    }
    return Math.max(0,Math.round(GROUND_Y-topY));
  }

  // Arc detection: any 3+ settled stones whose centers lie roughly on a
  // common horizontal band (within ARC_H_TOLERANCE) and whose neighbors
  // are horizontally close (gap ≤ ARC_GAP_MAX) count as an "arc". Award
  // bonus the frame the arc first appears.
  var arcSig=''; // last signature so we don't double-award
  function detectArc(){
    // Only settled stones, sorted by x.
    var set=[];
    for(var i=0;i<stones.length;i++)if(stones[i].settled)set.push(stones[i]);
    if(set.length<3)return null;
    set.sort(function(a,b){return a.x-b.x;});
    var best=null;
    for(var i2=0;i2<set.length;i2++){
      var anchor=set[i2];
      var chain=[anchor];
      for(var j=i2+1;j<set.length;j++){
        var prev=chain[chain.length-1];
        var sameRow=Math.abs(set[j].y-anchor.y)<ARC_H_TOLERANCE;
        var gap=set[j].x-prev.x-prev.hw-set[j].hw;
        if(sameRow&&gap<=ARC_GAP_MAX)chain.push(set[j]);
      }
      if(chain.length>=3&&(!best||chain.length>best.length))best=chain;
    }
    return best;
  }

  function onStoneSettled(s){
    if(s.__scored)return;s.__scored=true;
    score+=s.pts;
    stonesPlaced++;
    var h=measureHeight();
    if(h>maxHeight)maxHeight=h;
    // Puff of sand where it settled.
    for(var i=0;i<6;i++){
      particles.push({x:s.x+(Math.random()-0.5)*s.w,y:s.y+s.hh,vx:(Math.random()-0.5)*20,vy:-Math.random()*30,life:0.5+Math.random()*0.4,maxLife:0.9,size:1+Math.random()*2});
    }
    // Arc bonus
    var arc=detectArc();
    if(arc&&arc.length>=3){
      var sig=arc.map(function(x){return Math.round(x.x)+':'+Math.round(x.y);}).join(',');
      if(sig!==arcSig){
        arcSig=sig;arcs++;
        var bonus=arc.length*5;
        score+=bonus;
        _flash('ARC x'+arc.length+' +'+bonus,'#c8a84b');
        try{if(_playWin)_playWin();}catch(e){}
      }
    }
    _e('milestone');
  }

  function _flash(txt,color){
    msg=txt;msgTimer=1.6;msgColor=color||'#e8dcc8';
    if(state==='playing')sm(txt);
  }
  var msgColor='#e8dcc8';

  function _toppleCheck(){
    var any=false;
    for(var i=stones.length-1;i>=0;i--){
      if(stones[i].y>GROUND_Y+80||stones[i].x<-80||stones[i].x>W+80){
        score-=stones[i].pts;
        stones.splice(i,1);any=true;
      }
    }
    return any;
  }

  // ─── RENDER ──────────────────────────────────────────────────────────
  function drawStone(s,alpha){
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.angle);
    ctx.beginPath();ctx.moveTo(s.verts[0].x,s.verts[0].y);
    for(var i=1;i<s.verts.length;i++){
      var prev=s.verts[i-1],cur=s.verts[i];
      ctx.quadraticCurveTo(prev.x,prev.y,(prev.x+cur.x)/2,(prev.y+cur.y)/2);
    }
    var last=s.verts[s.verts.length-1],first=s.verts[0];
    ctx.quadraticCurveTo(last.x,last.y,(last.x+first.x)/2,(last.y+first.y)/2);
    ctx.closePath();
    var grd=ctx.createLinearGradient(-s.hw,-s.hh,s.hw,s.hh);
    grd.addColorStop(0,s.color);grd.addColorStop(1,s.darkColor);
    ctx.globalAlpha=alpha||1;
    ctx.fillStyle=grd;ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;ctx.stroke();
    ctx.globalAlpha=1;
    ctx.restore();
  }
  function drawTray(side){
    var tray=side==='L'?trayL:trayR;
    // Tray backdrop
    var x0=side==='L'?0:W-TRAY_W;
    var g=ctx.createLinearGradient(x0,0,x0+TRAY_W,0);
    if(side==='L'){g.addColorStop(0,'rgba(16,20,12,0.85)');g.addColorStop(1,'rgba(16,20,12,0.3)');}
    else{g.addColorStop(0,'rgba(16,20,12,0.3)');g.addColorStop(1,'rgba(16,20,12,0.85)');}
    ctx.fillStyle=g;ctx.fillRect(x0,0,TRAY_W,GROUND_Y);
    ctx.strokeStyle='rgba(200,168,75,0.12)';ctx.lineWidth=1;
    ctx.beginPath();
    if(side==='L')ctx.moveTo(TRAY_W,0),ctx.lineTo(TRAY_W,GROUND_Y);
    else ctx.moveTo(W-TRAY_W,0),ctx.lineTo(W-TRAY_W,GROUND_Y);
    ctx.stroke();
    for(var i=0;i<tray.length;i++){
      var s=tray[i];if(!s)continue;
      var pos=traySlotPos(side,i);
      s.x=pos.x;s.y=pos.y;s.angle=0;
      drawStone(s);
      // Point value chip
      ctx.fillStyle='rgba(200,168,75,0.85)';
      ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('+'+s.pts,pos.x,pos.y+s.hh+10);
    }
    ctx.textBaseline='alphabetic';
  }
  function render(){
    ctx.fillStyle='#0d100c';ctx.fillRect(0,0,W,H);
    // Sand band
    ctx.fillStyle='rgba(40,36,28,0.5)';ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);
    ctx.strokeStyle='rgba(60,55,45,0.18)';ctx.lineWidth=1;
    for(var y=GROUND_Y+5;y<H;y+=8){
      ctx.beginPath();ctx.moveTo(0,y);
      for(var x=0;x<W;x+=3)ctx.lineTo(x,y+Math.sin(x*0.02+y*0.1)*2);
      ctx.stroke();
    }
    ctx.strokeStyle='rgba(90,80,65,0.35)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,GROUND_Y);ctx.lineTo(W,GROUND_Y);ctx.stroke();
    // Trays (behind placed stones visually)
    drawTray('L');drawTray('R');
    // Placed + in-flight stones
    for(var i=0;i<stones.length;i++)drawStone(stones[i]);
    // Hover stones (one per active pointer)
    for(var pid in carries)if(carries.hasOwnProperty(pid)){
      var c=carries[pid];
      // Shadow line
      ctx.setLineDash([3,5]);ctx.strokeStyle='rgba(232,220,200,0.18)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(c.stone.x,c.stone.y+c.stone.hh);ctx.lineTo(c.stone.x,GROUND_Y);ctx.stroke();
      ctx.setLineDash([]);
      drawStone(c.stone,0.85);
    }
    // Particles
    for(var pi=0;pi<particles.length;pi++){
      var p=particles[pi],al=Math.max(0,p.life/p.maxLife);
      ctx.fillStyle='rgba(160,140,110,'+al+')';
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*al,0,Math.PI*2);ctx.fill();
    }
    // HUD
    ctx.fillStyle='rgba(232,220,200,0.9)';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText('SCORE '+score,W/2,6);
    ctx.font='10px sans-serif';ctx.fillStyle='rgba(232,220,200,0.6)';
    ctx.fillText(maxHeight+'px · '+stonesPlaced+' stones · '+arcs+' arc'+(arcs===1?'':'s'),W/2,22);
    ctx.textBaseline='alphabetic';
    // Flash message
    if(msgTimer>0){
      ctx.save();
      ctx.globalAlpha=Math.min(1,msgTimer);
      ctx.fillStyle=msgColor;ctx.font='bold 18px sans-serif';ctx.textAlign='center';
      ctx.fillText(msg,W/2,GROUND_Y-18);
      ctx.restore();
    }
  }

  // ─── POINTER LOGIC (multi-touch) ─────────────────────────────────────
  function hitTestTray(x,y){
    for(var i=0;i<trayL.length;i++){
      var s=trayL[i];if(!s)continue;
      if(x>=0&&x<=TRAY_W&&y>=s.y-s.hh-8&&y<=s.y+s.hh+14)return{side:'L',idx:i};
    }
    for(var j=0;j<trayR.length;j++){
      var r=trayR[j];if(!r)continue;
      if(x>=W-TRAY_W&&x<=W&&y>=r.y-r.hh-8&&y<=r.y+r.hh+14)return{side:'R',idx:j};
    }
    return null;
  }
  function pickUp(ev,id,x,y){
    if(state!=='playing')return;
    if(carries[id])return; // already carrying
    var hit=hitTestTray(x,y);
    if(!hit)return;
    var tray=hit.side==='L'?trayL:trayR;
    var stone=tray[hit.idx];if(!stone)return;
    tray[hit.idx]=null;
    carries[id]={stone:stone,fromTray:hit.side,slotIdx:hit.idx};
    stone.inFlight=false;
    stone.x=x;stone.y=y;
    try{_play('snap');}catch(e){}
  }
  function move(id,x,y){
    var c=carries[id];if(!c)return;
    c.stone.x=Math.max(c.stone.hw+4,Math.min(W-c.stone.hw-4,x));
    c.stone.y=Math.max(c.stone.hh+4,Math.min(GROUND_Y-c.stone.hh-2,y));
  }
  function release(id,x,y){
    var c=carries[id];if(!c)return;
    delete carries[id];
    // If released back on a tray position, return to tray.
    var hit=hitTestTray(x,y);
    if(hit&&hit.side===c.fromTray){
      var tray=hit.side==='L'?trayL:trayR;
      tray[c.slotIdx]=c.stone;
      return;
    }
    // Drop: enter physics
    c.stone.vx=0;c.stone.vy=0;c.stone.angVel=(Math.random()-0.5)*0.2;
    c.stone.settled=false;c.stone.settleTimer=0;c.stone.inFlight=true;c.stone.__scored=false;
    stones.push(c.stone);
    try{_play('dig');}catch(e){}
    // Refill the emptied tray slot with a fresh stone.
    var trayArr=c.fromTray==='L'?trayL:trayR;
    trayArr[c.slotIdx]=newTrayStone();
  }
  function canvasPos(e,touch){
    var rect=canvas.getBoundingClientRect();
    var cx=(touch||e).clientX,cy=(touch||e).clientY;
    return{x:cx-rect.left,y:cy-rect.top};
  }

  // Touch handlers use touch identifiers, mouse falls back to id 'm'.
  function onTouchStart(e){
    e.preventDefault();
    for(var i=0;i<e.changedTouches.length;i++){
      var t=e.changedTouches[i];var p=canvasPos(e,t);pickUp(e,t.identifier,p.x,p.y);
    }
  }
  function onTouchMove(e){
    e.preventDefault();
    for(var i=0;i<e.changedTouches.length;i++){
      var t=e.changedTouches[i];var p=canvasPos(e,t);move(t.identifier,p.x,p.y);
    }
  }
  function onTouchEnd(e){
    e.preventDefault();
    for(var i=0;i<e.changedTouches.length;i++){
      var t=e.changedTouches[i];var p=canvasPos(e,t);release(t.identifier,p.x,p.y);
    }
  }
  function onMouseDown(e){e.preventDefault();var p=canvasPos(e);pickUp(e,'m',p.x,p.y);}
  function onMouseMove(e){e.preventDefault();if(!carries.m)return;var p=canvasPos(e);move('m',p.x,p.y);}
  function onMouseUp(e){e.preventDefault();if(!carries.m)return;var p=canvasPos(e);release('m',p.x,p.y);}

  // ─── LOOP + LIFECYCLE ────────────────────────────────────────────────
  function loop(ts){
    if(!running)return;
    if(!document.body.classList.contains('game-active')){running=false;return;}
    var dt=lastTime?Math.min((ts-lastTime)/1000,0.04):0.016;
    lastTime=ts;
    physicsStep(dt);
    if(_toppleCheck()){
      if(mode==='challenge'){
        lives--;_flash('TOPPLE · '+lives+' left','#c75050');
        if(lives<=0)return gameOver();
      }else _flash('TOPPLE','#c75050');
    }
    if(msgTimer>0)msgTimer-=dt;
    render();
    requestAnimationFrame(loop);
  }

  var lives=3;
  function gameOver(){
    running=false;state='gameover';
    sm('Run ended — '+score+' pts · '+stonesPlaced+' stones');
    _e('game_loss');
    if(score>bestScore){bestScore=score;try{localStorage.setItem('lw_sg_best_score',String(bestScore));}catch(e){}}
    if(maxHeight>bestHeight){bestHeight=maxHeight;try{localStorage.setItem('lw_sg_best',String(bestHeight));}catch(e){}}
    _sr('stonegarden',{w:false,s:score,ht:maxHeight,stones:stonesPlaced,arcs:arcs,mode:mode});
    setTimeout(showMenu,2200);
  }
  function setupCanvas(){
    W=Math.min(420,window.innerWidth-40);H=560;GROUND_Y=H*0.82;
    dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr;canvas.height=H*dpr;
    canvas.style.width=W+'px';canvas.style.height=H+'px';
    ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function begin(m){
    mode=m;state='playing';carries={};stones=[];particles=[];
    score=0;stonesPlaced=0;maxHeight=0;arcs=0;ringDetected=false;arcSig='';lives=3;
    pan.innerHTML='';
    canvas=document.createElement('canvas');
    canvas.style.cssText='display:block;border-radius:8px;margin:8px auto;touch-action:none;background:#0d100c;';
    pan.appendChild(canvas);
    setupCanvas();
    canvas.addEventListener('mousedown',onMouseDown);
    window.addEventListener('mousemove',onMouseMove);
    window.addEventListener('mouseup',onMouseUp);
    canvas.addEventListener('touchstart',onTouchStart,{passive:false});
    canvas.addEventListener('touchmove',onTouchMove,{passive:false});
    canvas.addEventListener('touchend',onTouchEnd,{passive:false});
    canvas.addEventListener('touchcancel',onTouchEnd,{passive:false});
    // Bar under canvas: MENU + info
    var br=document.createElement('div');
    br.style.cssText='display:flex;gap:10px;justify-content:center;align-items:center;margin:8px 0;font-family:DM Mono,monospace;font-size:0.62rem;color:var(--muted);';
    br.innerHTML='<button class="gb" onclick="_SGmenu()" style="min-height:48px;">MENU</button>'
      +'<div style="flex:1;max-width:220px;line-height:1.3;">Drag from a tray into the garden. Multi-touch — hold one stone while placing another.</div>';
    pan.appendChild(br);
    fillTrays();
    running=true;lastTime=0;
    requestAnimationFrame(loop);
    sm(mode==='zen'?'Build freely. Arcs score bonus.':'3 topples end the run.');
  }

  window._SGmenu=function(){
    if(running&&stonesPlaced>0){
      _sr('stonegarden',{w:score>50,s:score,ht:maxHeight,stones:stonesPlaced,arcs:arcs,mode:mode});
      if(score>bestScore){bestScore=score;try{localStorage.setItem('lw_sg_best_score',String(bestScore));}catch(e){}}
      if(maxHeight>bestHeight){bestHeight=maxHeight;try{localStorage.setItem('lw_sg_best',String(bestHeight));}catch(e){}}
    }
    running=false;
    // Remove window listeners
    window.removeEventListener('mousemove',onMouseMove);
    window.removeEventListener('mouseup',onMouseUp);
    showMenu();
  };
  window._SGbegin=function(m){begin(m);};

  showMenu();
};
})();
