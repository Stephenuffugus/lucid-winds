// ═══ STONE GARDEN — zen rock stacking physics ═══
// Drag to position, release to drop. Zen mode = no fail; Challenge = reach target with 3 lives.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.stonegarden = function SG(a){
  var GRAVITY=580,RESTITUTION=0.12,FRICTION=0.65,ANG_DAMP=0.94,LIN_DAMP=0.998;
  var SETTLE_VEL=0.8,SETTLE_ANG=0.01,SETTLE_FRAMES=40,SUBSTEPS=4;

  var mode='zen',state='menu';
  var stones=[],hoverStone=null,particles=[];
  var stonesPlaced=0,maxHeight=0,bestHeight=0,lives=3,challengeLevel=1,targetHeight=120,toppleCount=0;
  var settleCounter=0,W=360,H=480,GROUND_Y=400;
  var canvas,ctx,dpr=1,running=false,lastTime=0;

  ms(a,'<strong id="SGh">Stone Garden</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='SGpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_SGmenu()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function showMenu(){
    state='menu';running=false;
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:1.2rem;color:var(--sage);letter-spacing:3px;margin:16px 0 4px;">STONE GARDEN</div>';
    h+='<div style="font-style:italic;font-size:0.75rem;color:var(--muted);margin-bottom:14px;">Stack stones in a zen garden</div>';
    h+='<button class="gb" onclick="_SGbegin(\'zen\')" style="display:block;width:240px;margin:6px auto;padding:12px;min-height:48px;">ZEN MODE<div style="font-size:0.6rem;opacity:0.7;font-style:italic;margin-top:2px;">No fail. Build freely.</div></button>';
    h+='<button class="gb" onclick="_SGbegin(\'challenge\')" style="display:block;width:240px;margin:6px auto;padding:12px;min-height:48px;">CHALLENGE<div style="font-size:0.6rem;opacity:0.7;font-style:italic;margin-top:2px;">Reach target. 3 lives.</div></button>';
    h+='<div style="margin-top:14px;font-size:0.7rem;color:var(--muted);">Best Height: <span style="color:var(--gold)">'+bestHeight+'</span></div>';
    pan.innerHTML=h;
  }

  function setupCanvas(){
    W=Math.min(380,window.innerWidth-40);H=520;GROUND_Y=H*0.85;
    dpr=window.devicePixelRatio||1;
    canvas.width=W*dpr;canvas.height=H*dpr;
    canvas.style.width=W+'px';canvas.style.height=H+'px';
    ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function makeStone(diff){
    var minW,maxW,minH,maxH;
    if(diff<=3){minW=50;maxW=90;minH=20;maxH=35;}
    else if(diff<=6){minW=35;maxW=85;minH=18;maxH=40;}
    else if(diff<=10){minW=25;maxW=80;minH=15;maxH=45;}
    else{minW=18;maxW=75;minH=12;maxH=50;}
    var w=minW+Math.random()*(maxW-minW),h=minH+Math.random()*(maxH-minH);
    var verts=[],hw=w/2,hh=h/2,numV=6+Math.floor(Math.random()*3);
    for(var i=0;i<numV;i++){
      var ang=(i/numV)*Math.PI*2-Math.PI/2;
      var rx=hw*(0.7+Math.random()*0.35),ry=hh*(0.7+Math.random()*0.35);
      verts.push({x:Math.cos(ang)*rx,y:Math.sin(ang)*ry});
    }
    var gray=90+Math.floor(Math.random()*40),warm=Math.floor(Math.random()*15)-5;
    var color='rgb('+(gray+warm)+','+(gray+Math.floor(warm*0.5))+','+(gray-warm)+')';
    var darkColor='rgb('+(gray-20+warm)+','+(gray-20)+','+(gray-20-warm)+')';
    var mass=w*h*0.01,inertia=mass*(w*w+h*h)/12;
    return{x:0,y:0,vx:0,vy:0,angle:0,angVel:0,w:w,h:h,hw:w/2,hh:h/2,
      mass:mass,invMass:1/mass,inertia:inertia,invInertia:1/inertia,
      verts:verts,color:color,darkColor:darkColor,settled:false,settleTimer:0,mossLevel:0};
  }

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
  function proj(cs,ax){var mn=Infinity,mx=-Infinity;for(var i=0;i<cs.length;i++){var p=cs[i].x*ax.x+cs[i].y*ax.y;if(p<mn)mn=p;if(p>mx)mx=p;}return{min:mn,max:mx};}
  function satTest(A,B){
    var ca=getCorners(A),cb=getCorners(B),axes=getAxes(ca).concat(getAxes(cb));
    var mo=Infinity,ma=null;
    for(var i=0;i<axes.length;i++){
      var ax=axes[i],pa=proj(ca,ax),pb=proj(cb,ax);
      var ov=Math.min(pa.max-pb.min,pb.max-pa.min);
      if(ov<=0)return null;
      if(ov<mo){mo=ov;ma=ax;}
    }
    var dx=B.x-A.x,dy=B.y-A.y;
    if(dx*ma.x+dy*ma.y<0)ma={x:-ma.x,y:-ma.y};
    return{normal:ma,depth:mo};
  }
  function resolveCol(A,B,col){
    var n=col.normal,d=col.depth,tim=A.invMass+B.invMass;if(tim===0)return;
    var sep=d/tim;
    A.x-=n.x*sep*A.invMass;A.y-=n.y*sep*A.invMass;
    B.x+=n.x*sep*B.invMass;B.y+=n.y*sep*B.invMass;
    var cpx=(A.x+B.x)*0.5,cpy=(A.y+B.y)*0.5;
    var raX=cpx-A.x,raY=cpy-A.y,rbX=cpx-B.x,rbY=cpy-B.y;
    var vaX=A.vx+(-A.angVel*raY),vaY=A.vy+(A.angVel*raX);
    var vbX=B.vx+(-B.angVel*rbY),vbY=B.vy+(B.angVel*rbX);
    var rvx=vbX-vaX,rvy=vbY-vaY,rvn=rvx*n.x+rvy*n.y;
    if(rvn>0)return;
    var raCN=raX*n.y-raY*n.x,rbCN=rbX*n.y-rbY*n.x;
    var ims=A.invMass+B.invMass+raCN*raCN*A.invInertia+rbCN*rbCN*B.invInertia;
    var j=-(1+RESTITUTION)*rvn/ims;
    A.vx-=j*n.x*A.invMass;A.vy-=j*n.y*A.invMass;A.angVel-=raCN*j*A.invInertia;
    B.vx+=j*n.x*B.invMass;B.vy+=j*n.y*B.invMass;B.angVel+=rbCN*j*B.invInertia;
    var tx=rvx-rvn*n.x,ty=rvy-rvn*n.y,tL=Math.sqrt(tx*tx+ty*ty);
    if(tL>0.001){
      tx/=tL;ty/=tL;
      var rvt=rvx*tx+rvy*ty,raCT=raX*ty-raY*tx,rbCT=rbX*ty-rbY*tx;
      var imt=A.invMass+B.invMass+raCT*raCT*A.invInertia+rbCT*rbCT*B.invInertia;
      var jt=-rvt/imt;
      if(Math.abs(jt)>Math.abs(j)*FRICTION)jt=(jt>0?1:-1)*Math.abs(j)*FRICTION;
      A.vx-=jt*tx*A.invMass;A.vy-=jt*ty*A.invMass;A.angVel-=raCT*jt*A.invInertia;
      B.vx+=jt*tx*B.invMass;B.vy+=jt*ty*B.invMass;B.angVel+=rbCT*jt*B.invInertia;
    }
    if(Math.abs(rvn)>60){spawnDust(cpx,cpy,Math.min(rvn*0.05,8));}
  }
  function groundCol(s){
    var cs=getCorners(s);
    for(var i=0;i<cs.length;i++){
      var cy=cs[i].y;
      if(cy>GROUND_Y){
        var pen=cy-GROUND_Y;s.y-=pen;
        var rx=cs[i].x-s.x,ry=cs[i].y-s.y;
        var vac=s.vy+s.angVel*rx;
        if(vac>0){
          var rcn=rx,iM=s.invMass+rcn*rcn*s.invInertia;
          var j=-(1+RESTITUTION)*vac/iM;
          s.vy+=j*s.invMass;s.angVel+=rcn*j*s.invInertia;
          var vtx=s.vx-s.angVel*ry,rct=-ry,iT=s.invMass+rct*rct*s.invInertia;
          var jt=-vtx/iT;
          if(Math.abs(jt)>Math.abs(j)*FRICTION)jt=(jt>0?1:-1)*Math.abs(j)*FRICTION;
          s.vx+=jt*s.invMass;s.angVel+=rct*jt*s.invInertia;
        }
        if(Math.abs(vac)>40)spawnDust(cs[i].x,GROUND_Y,Math.min(Math.abs(vac)*0.04,6));
      }
    }
    if(s.x-s.hw<0){s.x=s.hw;s.vx=Math.abs(s.vx)*0.3;}
    if(s.x+s.hw>W){s.x=W-s.hw;s.vx=-Math.abs(s.vx)*0.3;}
  }
  function spawnDust(x,y,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*60,vy:-20-Math.random()*40,life:0.5,maxLife:0.5,size:2+Math.random()*3});}

  function physicsStep(dt){
    var sd=dt/SUBSTEPS;
    for(var sub=0;sub<SUBSTEPS;sub++){
      for(var i=0;i<stones.length;i++){
        var s=stones[i];if(s.settled)continue;
        s.vy+=GRAVITY*sd;s.vx*=LIN_DAMP;
        s.x+=s.vx*sd;s.y+=s.vy*sd;
        s.angVel*=ANG_DAMP;s.angle+=s.angVel*sd;
      }
      for(i=0;i<stones.length;i++){
        groundCol(stones[i]);
        for(var j=i+1;j<stones.length;j++){
          var col=satTest(stones[i],stones[j]);
          if(col)resolveCol(stones[i],stones[j],col);
        }
      }
    }
    for(i=0;i<stones.length;i++){
      var st=stones[i];if(st.settled)continue;
      var sp=Math.sqrt(st.vx*st.vx+st.vy*st.vy);
      if(sp<SETTLE_VEL&&Math.abs(st.angVel)<SETTLE_ANG){
        st.settleTimer++;
        if(st.settleTimer>SETTLE_FRAMES){st.settled=true;st.vx=0;st.vy=0;st.angVel=0;}
      }else st.settleTimer=0;
    }
    for(i=particles.length-1;i>=0;i--){
      var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;p.life-=dt;
      if(p.life<=0)particles.splice(i,1);
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
  function checkTopple(){
    for(var i=stones.length-1;i>=0;i--){
      if(stones[i].y>GROUND_Y+100||stones[i].x<-100||stones[i].x>W+100){stones.splice(i,1);return true;}
    }
    var h=measureHeight();
    if(stonesPlaced>2&&h<maxHeight*0.5&&maxHeight>30)return true;
    return false;
  }

  function drawStone(s){
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
    ctx.fillStyle=grd;ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.25)';ctx.lineWidth=1;ctx.stroke();
    ctx.restore();
  }
  function render(){
    ctx.fillStyle='#0d100c';ctx.fillRect(0,0,W,H);
    // Sand lines
    ctx.strokeStyle='rgba(60,55,45,0.12)';ctx.lineWidth=1;
    for(var y=GROUND_Y+5;y<H;y+=8){
      ctx.beginPath();ctx.moveTo(0,y);
      for(var x=0;x<W;x+=3)ctx.lineTo(x,y+Math.sin(x*0.02+y*0.1)*2);
      ctx.stroke();
    }
    ctx.strokeStyle='rgba(90,80,65,0.3)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,GROUND_Y);ctx.lineTo(W,GROUND_Y);ctx.stroke();
    if(mode==='challenge'&&targetHeight>0){
      var ty=GROUND_Y-targetHeight;
      ctx.setLineDash([6,4]);ctx.strokeStyle='rgba(200,168,75,0.4)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(20,ty);ctx.lineTo(W-20,ty);ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(200,168,75,0.5)';ctx.font='10px sans-serif';ctx.textAlign='right';
      ctx.fillText('TARGET',W-24,ty-4);
    }
    for(var i=0;i<stones.length;i++)drawStone(stones[i]);
    if(hoverStone&&state==='placing'){
      ctx.setLineDash([3,5]);ctx.strokeStyle='rgba(232,220,200,0.15)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(hoverStone.x,hoverStone.y+hoverStone.hh);ctx.lineTo(hoverStone.x,GROUND_Y);ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha=0.8;drawStone(hoverStone);ctx.globalAlpha=1;
    }
    for(i=0;i<particles.length;i++){
      var p=particles[i],al=Math.max(0,p.life/p.maxLife);
      ctx.fillStyle='rgba(160,140,110,'+al+')';
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*al,0,Math.PI*2);ctx.fill();
    }
    // HUD
    ctx.fillStyle='rgba(232,220,200,0.8)';ctx.font='12px sans-serif';ctx.textAlign='left';
    ctx.fillText('H: '+maxHeight,8,16);
    ctx.textAlign='center';ctx.fillText('Stones: '+stonesPlaced,W/2,16);
    ctx.textAlign='right';
    if(mode==='zen')ctx.fillText('Best: '+bestHeight,W-8,16);
    else ctx.fillText('Lv '+challengeLevel+' ♥'+lives,W-8,16);
  }

  function spawnNext(){
    var diff=mode==='challenge'?challengeLevel:Math.min(20,Math.floor(stonesPlaced/3)+1);
    hoverStone=makeStone(diff);
    hoverStone.x=W/2;hoverStone.y=50;
    state='placing';
  }
  function dropStone(){
    if(!hoverStone||state!=='placing')return;
    state='dropping';stones.push(hoverStone);hoverStone=null;settleCounter=0;_play('dig');
  }
  function onAllSettled(){
    var h=measureHeight();
    if(h>maxHeight){maxHeight=h;if(h>bestHeight)bestHeight=h;}
    stonesPlaced++;
    if(checkTopple()){
      toppleCount++;
      _play('lose');
      if(mode==='challenge'){
        lives--;
        if(lives<=0){
          state='gameover';
          sm('Game Over — '+stonesPlaced+' stones');
          _e('game_loss');
          _sr('stonegarden',{w:false,s:stonesPlaced,ht:maxHeight,lv:challengeLevel,tp:toppleCount,mode:mode});
          setTimeout(showMenu,2500);
          return;
        }else sm('Topple! '+lives+' ♥ left');
      }else sm('Topple!');
    }else{
      if(mode==='challenge'&&maxHeight>=targetHeight){
        challengeLevel++;targetHeight=80+challengeLevel*40;maxHeight=0;stones=[];
        sm('Level '+challengeLevel+'!');_e('game_win');_playWin();
      }
      if(stonesPlaced%3===0)_e('milestone');
    }
    setTimeout(function(){if(state!=='gameover')spawnNext();},400);
  }
  function loop(ts){
    if(!running)return;
    var dt=lastTime?Math.min((ts-lastTime)/1000,0.04):0.016;
    lastTime=ts;
    if(state==='dropping'||state==='settling'){
      physicsStep(dt);
      var allSettled=true;
      for(var i=0;i<stones.length;i++){if(!stones[i].settled){allSettled=false;break;}}
      if(allSettled&&stones.length>0){
        settleCounter++;
        if(settleCounter>10){state='settling';onAllSettled();state='placing';}
      }
    }
    render();
    requestAnimationFrame(loop);
  }

  var dragging=false;
  function posX(e){
    var rect=canvas.getBoundingClientRect();
    var x=e.touches&&e.touches.length?e.touches[0].clientX:e.clientX;
    return x-rect.left;
  }
  function onDown(e){e.preventDefault();if(state!=='placing'||!hoverStone)return;dragging=true;hoverStone.x=Math.max(hoverStone.hw+5,Math.min(W-hoverStone.hw-5,posX(e)));}
  function onMove(e){e.preventDefault();if(!dragging||!hoverStone||state!=='placing')return;hoverStone.x=Math.max(hoverStone.hw+5,Math.min(W-hoverStone.hw-5,posX(e)));}
  function onUp(e){e.preventDefault();if(!dragging)return;dragging=false;dropStone();}

  function begin(m){
    mode=m;
    pan.innerHTML='';
    canvas=document.createElement('canvas');
    canvas.style.cssText='display:block;border-radius:6px;margin:8px auto;touch-action:none;background:#0d100c;';
    pan.appendChild(canvas);
    setupCanvas();
    canvas.addEventListener('mousedown',onDown);
    canvas.addEventListener('mousemove',onMove);
    canvas.addEventListener('mouseup',onUp);
    canvas.addEventListener('touchstart',onDown,{passive:false});
    canvas.addEventListener('touchmove',onMove,{passive:false});
    canvas.addEventListener('touchend',onUp,{passive:false});
    // Rotate buttons
    var br=document.createElement('div');
    br.style.cssText='display:flex;gap:10px;justify-content:center;margin:8px 0;';
    br.innerHTML='<button class="gb" onclick="_SGrot(-1)" style="min-height:48px;min-width:60px;">↺</button>'+
      '<button class="gb" onclick="_SGrot(1)" style="min-height:48px;min-width:60px;">↻</button>'+
      '<button class="gb" onclick="_SGmenu()" style="min-height:48px;min-width:60px;">MENU</button>';
    pan.appendChild(br);
    stones=[];particles=[];stonesPlaced=0;maxHeight=0;lives=3;challengeLevel=1;
    targetHeight=mode==='challenge'?120:0;toppleCount=0;
    running=true;lastTime=0;
    requestAnimationFrame(loop);
    spawnNext();
    sm(mode==='zen'?'Drag & release to drop':'Reach the target!');
  }

  window._SGmenu=function(){
    running=false;
    if(stonesPlaced>0)_sr('stonegarden',{w:maxHeight>100,s:stonesPlaced,ht:maxHeight,lv:challengeLevel,tp:toppleCount,mode:mode});
    showMenu();
  };
  window._SGbegin=function(m){begin(m);};
  window._SGrot=function(d){if(hoverStone&&state==='placing')hoverStone.angle+=d*0.26;};

  showMenu();
};
})();
