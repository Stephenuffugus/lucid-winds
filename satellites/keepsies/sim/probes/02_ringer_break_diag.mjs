import RAPIER from '@dimforge/rapier3d-compat';
await RAPIER.init();
function run(cfg){
  const w = new RAPIER.World({x:0,y:-9.81,z:0}); w.timestep=1/120;
  w.createCollider(RAPIER.ColliderDesc.cuboid(5,0.05,5).setFriction(cfg.floorFr).setRestitution(0.35), w.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,-0.05,0)));
  const bodies=[]; const mibs=[];
  function ball(x,z,d,v){ const rb=w.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x,d/2,z).setLinearDamping(cfg.damp).setAngularDamping(cfg.adamp).setCcdEnabled(true));
    w.createCollider(RAPIER.ColliderDesc.ball(d/2).setDensity(2500).setFriction(0.30).setRestitution(0.78),rb); if(v) rb.setLinvel({x:v.x,y:0,z:v.z},true); bodies.push(rb); return rb; }
  const sp=0.075; for(let i=-3;i<=3;i++){ mibs.push(ball(i*sp,0,0.016)); if(i!==0) mibs.push(ball(0,i*sp,0.016)); }
  const taw=ball(0,-1.45,0.022,{x:0,z:cfg.v});
  const log=[]; let maxMib=0;
  for(let s=0;s<120*6;s++){ w.step(); const t=(s+1)/120;
    for(const m of mibs){ const v=m.linvel(); const sp2=Math.hypot(v.x,v.z); if(sp2>maxMib) maxMib=sp2; }
    if([0.1,0.3,0.5,0.7,1,2,4,6].includes(+t.toFixed(2))){ const p=taw.translation(), v=taw.linvel(); log.push(`t${t}: taw z=${p.z.toFixed(2)} y=${p.y.toFixed(3)} v=${Math.hypot(v.x,v.z).toFixed(2)} awake=${!taw.isSleeping()}`); } }
  let out=0, far=0; for(const m of mibs){ const p=m.translation(); const r=Math.hypot(p.x,p.z); if(r>1.525) out++; if(r>far) far=r; }
  return {cfg, out, farthestMib:far.toFixed(2), maxMibSpeed:maxMib.toFixed(2), log};
}
for(const cfg of [
  {v:3.5, damp:0.18, adamp:0.12, floorFr:0.55, note:'SPEC numbers'},
  {v:3.5, damp:0.0, adamp:0.0, floorFr:0.55, note:'no damping'},
  {v:6.0, damp:0.18, adamp:0.12, floorFr:0.55, note:'max launch 6 m/s'},
  {v:3.5, damp:0.05, adamp:0.05, floorFr:0.55, note:'light damping'},
]){ const r=run(cfg); console.log(cfg.note, '| mibs out', r.out, '| farthest mib r', r.farthestMib, '| max mib speed', r.maxMibSpeed); console.log('   '+r.log.join('\n   ')); }
