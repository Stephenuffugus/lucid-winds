// ═══ BREATHING GARDEN — meditation timer ═══
// Follow the bloom: inhale as it opens, exhale as it closes. Milestone every 5 breaths.
(function(){
'use strict';
window._gameFns=window._gameFns||{};
window._gameFns.breathing=function BR(a){
  var PATTERNS={
    calm:{name:'CALM 4-6',phases:[{name:'INHALE',dur:4},{name:'EXHALE',dur:6}]},
    box:{name:'BOX 4-4-4-4',phases:[{name:'INHALE',dur:4},{name:'HOLD',dur:4},{name:'EXHALE',dur:4},{name:'HOLD',dur:4}]},
    relax:{name:'RELAX 4-7-8',phases:[{name:'INHALE',dur:4},{name:'HOLD',dur:7},{name:'EXHALE',dur:8}]},
    energy:{name:'ENERGY 2-2',phases:[{name:'INHALE',dur:2},{name:'EXHALE',dur:2}]}
  };
  var curKey='calm';
  var phases=PATTERNS.calm.phases;
  var phaseIdx=0,phaseTimer=0,breathing=false;
  var breathCount=0,totalTime=0;
  var bloomProgress=0.3,targetBloom=0;
  var particles=[];
  var raf=null,lastTime=0,stopped=false;
  var cvs,ctx,W,H,cx,cy,dpr;

  ms(a,'🌸 Breathing Garden — <strong id="BRt">0:00</strong>');
  mm(a,'READY');
  var pan=document.createElement('div');pan.id='BRpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;text-align:center;';
  pan.innerHTML='<canvas id="BRcv" style="display:block;margin:6px auto;width:100%;max-width:360px;height:300px;background:#0d100c;border-radius:8px;"></canvas>'+
    '<div id="BRph" style="font-family:Bebas Neue,sans-serif;font-size:1.4rem;color:#e8dcc8;letter-spacing:3px;opacity:.8;margin:4px 0;">READY</div>'+
    '<div id="BRct" style="font-family:Bebas Neue,sans-serif;font-size:2rem;color:rgba(232,220,200,0.35);min-height:2rem;"></div>'+
    '<div id="BRinfo" style="font-size:.65rem;opacity:.5;margin:4px 0;">Breaths: 0</div>'+
    '<div style="display:flex;gap:4px;justify-content:center;padding:4px;flex-wrap:wrap;">'+
      Object.keys(PATTERNS).map(function(k){return '<button class="gb" id="BRp_'+k+'" style="padding:4px 8px;font-size:.6rem;" onclick="_BRP(\''+k+'\')">'+PATTERNS[k].name+'</button>';}).join('')+
    '</div>';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" id="BRgo" onclick="_BRG()">▶ START</button> <button class="gb" onclick="_BRR()">↺ RESET</button>';

  cvs=document.getElementById('BRcv');ctx=cvs.getContext('2d');
  function resize(){
    dpr=window.devicePixelRatio||1;
    var rc=cvs.getBoundingClientRect();
    W=rc.width;H=rc.height;
    cvs.width=W*dpr;cvs.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cx=W/2;cy=H/2;
  }
  resize();

  function highlight(){
    var keys=Object.keys(PATTERNS);
    for(var i=0;i<keys.length;i++){
      var btn=document.getElementById('BRp_'+keys[i]);if(!btn)continue;
      if(keys[i]===curKey){btn.style.background='rgba(122,179,86,0.35)';btn.style.borderColor='#7ab356';}
      else{btn.style.background='';btn.style.borderColor='';}
    }
  }
  highlight();

  function updateBreath(dt){
    if(!breathing)return;
    phaseTimer+=dt;
    var ph=phases[phaseIdx];
    var prog=Math.min(1,phaseTimer/ph.dur);
    if(ph.name==='INHALE')targetBloom=prog;
    else if(ph.name==='EXHALE')targetBloom=1-prog;
    var rem=Math.ceil(ph.dur-phaseTimer);
    var ct=document.getElementById('BRct');if(ct)ct.textContent=rem>0?rem:'';
    var phEl=document.getElementById('BRph');if(phEl)phEl.textContent=ph.name;
    if(phaseTimer>=ph.dur){
      phaseTimer=0;phaseIdx=(phaseIdx+1)%phases.length;
      if(phaseIdx===0){
        breathCount++;
        if(breathCount%5===0){_e('milestone');try{if(window._play)_play('match');}catch(e){}}
      }
      try{navigator.vibrate&&navigator.vibrate(15);}catch(e){}
    }
    bloomProgress+=(targetBloom-bloomProgress)*0.08;
    totalTime+=dt;
    var mins=Math.floor(totalTime/60);var secs=Math.floor(totalTime%60);
    var te=document.getElementById('BRt');if(te)te.textContent=mins+':'+(secs<10?'0':'')+secs;
    var ie=document.getElementById('BRinfo');if(ie)ie.textContent='Breaths: '+breathCount+' · '+mins+':'+(secs<10?'0':'')+secs;
  }

  function drawBG(){
    ctx.fillStyle='#0d100c';ctx.fillRect(0,0,W,H);
    var g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*0.6);
    g.addColorStop(0,'rgba(26,36,22,0.2)');g.addColorStop(1,'rgba(13,16,12,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  function drawCircle(){
    var maxR=Math.min(W,H)*0.32;
    ctx.beginPath();ctx.arc(cx,cy,maxR,0,Math.PI*2);
    ctx.strokeStyle='rgba(122,179,86,0.1)';ctx.lineWidth=1;ctx.stroke();
    var r=maxR*0.2+maxR*0.8*bloomProgress;
    var glow=ctx.createRadialGradient(cx,cy,r,cx,cy,r+20);
    glow.addColorStop(0,'rgba(122,179,86,'+(0.2*bloomProgress)+')');
    glow.addColorStop(1,'rgba(122,179,86,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,r+20,0,Math.PI*2);ctx.fill();
    var cg=ctx.createRadialGradient(cx-r*0.2,cy-r*0.2,0,cx,cy,r);
    cg.addColorStop(0,'rgba(122,179,86,'+(0.2+bloomProgress*0.25)+')');
    cg.addColorStop(1,'rgba(74,124,53,'+(0.05+bloomProgress*0.1)+')');
    ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle='rgba(122,179,86,'+(0.25+bloomProgress*0.3)+')';ctx.lineWidth=1.5;ctx.stroke();
  }
  function drawFlower(){
    var maxR=Math.min(W,H)*0.28;
    var pr=maxR*bloomProgress;if(pr<3)return;
    ctx.save();ctx.translate(cx,cy);
    var colors=['rgba(196,122,122,','rgba(200,168,75,','rgba(122,179,86,','rgba(91,155,213,'];
    for(var i=0;i<8;i++){
      var ang=(Math.PI*2/8)*i+Math.sin(Date.now()*0.0003)*0.1;
      ctx.save();ctx.rotate(ang);
      var pl=pr*0.9,pw=pr*0.25;
      ctx.beginPath();ctx.moveTo(0,0);
      ctx.bezierCurveTo(pw,-pl*0.4,pw*0.6,-pl,0,-pl);
      ctx.bezierCurveTo(-pw*0.6,-pl,-pw,-pl*0.4,0,0);
      ctx.closePath();
      ctx.fillStyle=colors[i%4]+(0.2+bloomProgress*0.3)+')';ctx.fill();
      ctx.restore();
    }
    var crg=ctx.createRadialGradient(0,0,0,0,0,pr*0.15);
    crg.addColorStop(0,'rgba(200,168,75,'+(0.4+bloomProgress*0.4)+')');
    crg.addColorStop(1,'rgba(196,122,122,0.1)');
    ctx.fillStyle=crg;ctx.beginPath();ctx.arc(0,0,pr*0.15,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  function drawParticles(){
    for(var i=0;i<particles.length;i++){
      var p=particles[i];
      ctx.globalAlpha=Math.max(0,p.life/p.maxLife)*0.6;
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*(p.life/p.maxLife),0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  function spawnP(){
    if(breathing&&phases[phaseIdx].name==='EXHALE'&&Math.random()<0.15){
      var ang=Math.random()*Math.PI*2;
      var dist=bloomProgress*Math.min(W,H)*0.25;
      var cols=['rgba(122,179,86,1)','rgba(196,122,122,1)','rgba(200,168,75,1)'];
      particles.push({x:cx+Math.cos(ang)*dist,y:cy+Math.sin(ang)*dist,
        vx:Math.cos(ang)*8,vy:Math.sin(ang)*8-10,
        life:2+Math.random(),maxLife:2+Math.random(),
        size:1.5+Math.random()*2,color:cols[Math.floor(Math.random()*3)]});
    }
  }

  function loop(ts){
    if(stopped)return;
    var dt=lastTime?Math.min((ts-lastTime)/1000,0.05):0.016;
    lastTime=ts;
    updateBreath(dt);
    for(var i=particles.length-1;i>=0;i--){
      var p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=3*dt;
      p.life-=dt;if(p.life<=0)particles.splice(i,1);
    }
    spawnP();
    if(!breathing)bloomProgress=0.3+Math.sin(Date.now()*0.001)*0.1;
    drawBG();drawCircle();drawFlower();drawParticles();
    raf=requestAnimationFrame(loop);
  }
  raf=requestAnimationFrame(loop);

  window._BRG=function(){
    breathing=!breathing;
    var btn=document.getElementById('BRgo');
    if(breathing){
      btn.textContent='⏸ PAUSE';phaseIdx=0;phaseTimer=0;sm('Breathe with the bloom.');
    } else {
      btn.textContent='▶ START';
      var phEl=document.getElementById('BRph');if(phEl)phEl.textContent='PAUSED';
      sm('Paused.');
    }
  };
  window._BRR=function(){
    breathing=false;phaseIdx=0;phaseTimer=0;breathCount=0;totalTime=0;bloomProgress=0.3;
    var btn=document.getElementById('BRgo');if(btn)btn.textContent='▶ START';
    var phEl=document.getElementById('BRph');if(phEl)phEl.textContent='READY';
    var ct=document.getElementById('BRct');if(ct)ct.textContent='';
    var te=document.getElementById('BRt');if(te)te.textContent='0:00';
    var ie=document.getElementById('BRinfo');if(ie)ie.textContent='Breaths: 0';
    sm('');
  };
  window._BRP=function(k){
    curKey=k;phases=PATTERNS[k].phases;phaseIdx=0;phaseTimer=0;highlight();
    sm('Pattern: '+PATTERNS[k].name);
  };
};
})();
