import RAPIER from '@dimforge/rapier3d-compat';
await RAPIER.init();
function run(){
  const w = new RAPIER.World({x:0,y:-9.81,z:0});
  w.timestep = 1/120;
  // dirt ring floor: big cuboid
  w.createCollider(RAPIER.ColliderDesc.cuboid(5,0.05,5).setFriction(0.55).setRestitution(0.35), w.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,-0.05,0)));
  const glass = {density:2500, rest:0.78, fr:0.30};
  const bodies=[];
  function ball(x,z,d,v){
    const rb = w.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x,d/2,z).setLinearDamping(0.18).setAngularDamping(0.12).setCcdEnabled(true));
    w.createCollider(RAPIER.ColliderDesc.ball(d/2).setDensity(glass.density).setFriction(glass.fr).setRestitution(glass.rest), rb);
    if(v) rb.setLinvel({x:v.x,y:0,z:v.z},true);
    bodies.push(rb); return rb;
  }
  // 13 mibs in a + cross, 75mm spacing, 16mm
  const mibs=[]; const sp=0.075;
  for(let i=-3;i<=3;i++){ mibs.push(ball(i*sp,0,0.016)); if(i!==0) mibs.push(ball(0,i*sp,0.016)); }
  // taw 22mm from ring edge (1.525m) aimed at centre at 3.5 m/s
  const taw = ball(0,-1.45,0.022,{x:0,z:3.5});
  const t0=performance.now(); let steps=0;
  for(let s=0;s<120*6;s++){ w.step(); steps++; }
  const ms=performance.now()-t0;
  let out=0; for(const m of mibs){ const p=m.translation(); if(Math.hypot(p.x,p.z)>1.525) out++; }
  const tp=taw.translation(); const tawIn = Math.hypot(tp.x,tp.z)<=1.525;
  // state hash
  let h=0; for(const b of bodies){ const p=b.translation(); const s=[p.x,p.y,p.z].map(v=>v.toFixed(9)).join(','); for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; }
  return {mibsOut:out, tawIn, tawR:Math.hypot(tp.x,tp.z).toFixed(3), steps, msPer120:(ms/steps*120).toFixed(2), hash:h, bodies:bodies.length};
}
const a=run(), b=run();
console.log(JSON.stringify(a)); console.log('deterministic:', a.hash===b.hash, 'rapier', RAPIER.version());
