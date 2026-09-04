import RAPIER from '@dimforge/rapier3d-compat';
await RAPIER.init();
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
function run(cfg, seed){
  const rnd=mulberry(seed);
  const w=new RAPIER.World({x:0,y:-9.81,z:0}); w.timestep=1/120;
  w.createCollider(RAPIER.ColliderDesc.cuboid(5,0.05,5).setFriction(cfg.floorFr).setRestitution(0.35), w.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,-0.05,0)));
  const bodies=[]; const mibs=[];
  function ball(x,z,d,v){ const rb=w.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x,d/2,z).setLinearDamping(cfg.damp).setAngularDamping(cfg.damp).setCcdEnabled(true));
    w.createCollider(RAPIER.ColliderDesc.ball(d/2).setDensity(2500).setFriction(0.30).setRestitution(cfg.rest),rb); if(v) rb.setLinvel({x:v.x,y:0,z:v.z},true); bodies.push(rb); return rb; }
  const sp=0.075; for(let i=-3;i<=3;i++){ mibs.push(ball(i*sp,0,0.016)); if(i!==0) mibs.push(ball(0,i*sp,0.016)); }
  const ang=(rnd()-0.5)*2*(0.5*Math.PI/180); // +-2 deg aim jitter
  const taw=ball(Math.sin(ang)*-1.45*0+ (rnd()-0.5)*0.02,-1.45,0.022,{x:Math.sin(ang)*cfg.v,z:Math.cos(ang)*cfg.v});
  const g=9.81;
  for(let s=0;s<120*8;s++){
    if(cfg.roll>0){ for(const b of bodies){ if(b.isSleeping()) continue; const v=b.linvel(); const sp2=Math.hypot(v.x,v.z); if(sp2<1e-4) continue;
      const m=b.mass(); const f=cfg.roll*m*g; const dt=1/120; const fmax=sp2*m/dt; const ff=Math.min(f,fmax); b.resetForces(true); b.addForce({x:-v.x/sp2*ff,y:0,z:-v.z/sp2*ff},true); } }
    w.step(); }
  let out=0; for(const m of mibs){ const p=m.translation(); if(Math.hypot(p.x,p.z)>1.525) out++; }
  const tp=taw.translation(); const tawIn=Math.hypot(tp.x,tp.z)<=1.525;
  let moving=0; for(const b of bodies){ const v=b.linvel(); if(Math.hypot(v.x,v.z)>0.02) moving++; }
  return {out,tawIn,moving};
}
const N=6; const rows=[];
for(const v of [4.0,5.0,6.0]) for(const floorFr of [0.35,0.55]) for(const roll of [0,0.01,0.02,0.04]) for(const rest of [0.78]){
  const cfg={v,floorFr,roll,rest,damp: roll>0?0.02:0.18};
  let so=0,si=0,sm=0,dist={}; for(let s=1;s<=N;s++){ const r=run(cfg,s*7919); so+=r.out; si+=r.tawIn?1:0; sm+=r.moving; dist[r.out]=(dist[r.out]||0)+1; }
  rows.push({v,floorFr,roll,rest,meanOut:(so/N).toFixed(2),tawIn:(si/N).toFixed(2),stillMovingAt8s:(sm/N).toFixed(1),dist:JSON.stringify(dist)});
}
console.log('v  floorFr roll rest | meanOut tawIn moving@8s | dist');
for(const r of rows) console.log(`${r.v} ${r.floorFr} ${r.roll} ${r.rest} | ${r.meanOut} ${r.tawIn} ${r.stillMovingAt8s} | ${r.dist}`);
