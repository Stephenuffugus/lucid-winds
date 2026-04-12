// ═══ LUCID WINDS — Seed Toss (flick-into-pot physics) ═══
// Distinct from the existing dice-based 'Seed Toss' (yahtzee) game.
(function(){
'use strict';



window._gameFns=window._gameFns||{};
window._gameFns.seedtoss2=function ST(a){
  var GRAVITY=800,SEED_RADIUS=8;
  var W=380,H=480,GROUND_Y;
  var canvas,ctx;
  var score=0,streak=0,bestStreak=0,level=1,seedsLeft=15,totalMade=0,totalThrown=0;
  var seed=null,pot=null,wind=0;
  var phase='ready';
  var particles=[];
  var touchStart=null,touchHistory=[];
  var rafId=0,running=false;

  ms(a,'Score <span id="STs">0</span> · Seeds <span id="STq">15</span> · L<span id="STl">1</span>');
  mm(a);
  var pan=document.createElement('div');pan.id='STpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:8px;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_STN()">🌱 NEW</button>';

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
    var minW=50,maxW=90;
    if(level>=3)maxW=80;
    if(level>=5){maxW=70;minW=40;}
    if(level>=8){maxW=60;minW=35;}
    var pw=minW+Math.random()*(maxW-minW);
    var ph=pw*0.7;
    var baseX=W*0.5,spread=W*0.15+level*W*0.02;
    var px=Math.max(pw/2+10,Math.min(W-pw/2-10,baseX+(Math.random()-0.5)*spread));
    var py=GROUND_Y;
    if(level>=4&&Math.random()<0.3)py=GROUND_Y-40-Math.random()*50;
    pot={x:px,y:py,width:pw,height:ph};
    wind=level>=3?(Math.random()-0.5)*60*Math.min(level*0.4,3):0;
  }

  function resetSeed(){
    seed={x:W/2,y:H*0.78,vx:0,vy:0,active:false,trail:[]};
    phase='ready';
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
    if(seed.y>GROUND_Y||seed.x<-50||seed.x>W+50||seed.y<-200)missed();
  }

  function scored(){
    phase='scored';seed.active=false;totalMade++;
    streak++;if(streak>bestStreak)bestStreak=streak;
    var pts=100*level+(streak>1?(streak-1)*25:0);
    var dist=Math.abs(seed.x-pot.x);
    if(dist<5)pts+=50;else if(dist<15)pts+=25;
    score+=pts;
    setMsg('+'+pts);
    for(var i=0;i<16;i++){var ang=Math.random()*Math.PI*2,sp=50+Math.random()*120;
      particles.push({x:pot.x,y:pot.y-pot.height,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-60,life:0.8,maxLife:0.8,size:2+Math.random()*3,color:['#7ab356','#c8a84b','#e8dcc8'][Math.floor(Math.random()*3)]});}
    _e('progress');
    if(streak%5===0)_e('milestone');
    if(totalMade%5===0){level++;setMsg('LEVEL '+level+'!');}
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
    sm('Final: '+score+' · '+totalMade+'/'+totalThrown);
  }

  function setMsg(t){var m=document.getElementById('STmsg');if(m){m.textContent=t;setTimeout(function(){if(m.textContent===t)m.textContent='';},1000);}}

  function updateHUD(){
    var s=document.getElementById('STs'),q=document.getElementById('STq'),l=document.getElementById('STl');
    if(s)s.textContent=score;if(q)q.textContent=seedsLeft;if(l)l.textContent=level;
  }

  function draw(){
    ctx.fillStyle='#0d100c';ctx.fillRect(0,0,W,H);
    // Ground
    ctx.fillStyle='rgba(40,35,25,0.4)';ctx.fillRect(0,GROUND_Y-3,W,H-GROUND_Y);
    ctx.strokeStyle='rgba(80,70,50,0.3)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,GROUND_Y);ctx.lineTo(W,GROUND_Y);ctx.stroke();
    // Pot
    if(pot){
      var px=pot.x,py=pot.y,pw=pot.width,ph=pot.height;
      ctx.fillStyle='#6b4a2a';
      ctx.beginPath();
      ctx.moveTo(px-pw/2,py);ctx.lineTo(px-pw*0.35,py-ph);ctx.lineTo(px+pw*0.35,py-ph);ctx.lineTo(px+pw/2,py);
      ctx.closePath();ctx.fill();
      ctx.fillStyle='#5a3a1a';ctx.fillRect(px-pw/2-6,py-ph-6,pw+12,8);
      ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(px-pw*0.3,py-ph-2,pw*0.6,6);
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
    // Seed
    if(seed&&phase!=='scored'){
      ctx.fillStyle='rgba(200,168,75,0.15)';
      ctx.beginPath();ctx.arc(seed.x,seed.y,SEED_RADIUS+5,0,Math.PI*2);ctx.fill();
      var gr=ctx.createRadialGradient(seed.x-2,seed.y-2,0,seed.x,seed.y,SEED_RADIUS);
      gr.addColorStop(0,'#e8c860');gr.addColorStop(1,'#a08030');
      ctx.fillStyle=gr;
      ctx.beginPath();ctx.arc(seed.x,seed.y,SEED_RADIUS,0,Math.PI*2);ctx.fill();
    }
    // Particles
    for(i=0;i<particles.length;i++){
      var p=particles[i];
      ctx.globalAlpha=Math.max(0,p.life/p.maxLife);
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*(p.life/p.maxLife),0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
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
    var dt=lastT?Math.min((ts-lastT)/1000,0.04):0.016;lastT=ts;
    updateSeed(dt);
    if(seed&&seed.trail)for(var i=seed.trail.length-1;i>=0;i--){seed.trail[i].life-=dt*2;if(seed.trail[i].life<=0)seed.trail.splice(i,1);}
    for(i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=120*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
    draw();
    rafId=requestAnimationFrame(loop);
  }

  window._STN=function(){
    if(rafId)cancelAnimationFrame(rafId);
    setup();
    score=0;streak=0;bestStreak=0;level=1;seedsLeft=15;totalMade=0;totalThrown=0;particles=[];
    genPot();resetSeed();updateHUD();
    running=true;lastT=0;
    rafId=requestAnimationFrame(loop);
    sm('Flick the seed into the pot');
  };

  _STN();
};
})();
