/* Dumps every part with every stat, plus the tier expansion targets.
 * node catalog.js > CATALOG.md */
const SIM=require('../src/sim2.js');
const L=[],o=s=>L.push(s);
const f=(v,d=2)=>typeof v==='number'?v.toFixed(d):String(v);
o('# RIPCORD — Part Catalogue');o('');
o('Generated from `sim2.js`. Every number the simulation reads is here.');o('');
o('Tier 1 is what exists today. Tiers 2 and 3 are specified but NOT built —');
o('see "Tier expansion" at the bottom and HANDOFF.md section 6.');o('');

function tbl(title,list,cols,keys){
  o('## '+title+' — '+list.length+' parts');o('');
  o('| '+cols.join(' | ')+' |');o('|'+cols.map(()=>'---').join('|')+'|');
  for(const p of list) o('| '+keys.map(k=>typeof k==='function'?k(p):f(p[k],k==='mass'?4:2)).join(' | ')+' |');
  o('');
}
tbl('Cores',SIM.CORES,['id','name','role','mass kg','spin','ability','charge rate'],
  ['id','name','role','mass',p=>p.dir>0?'right':'left','ability','charge']);
tbl('Blades',SIM.BLADES,['id','name','role','mass kg','radius m','sharp','rest','gear','taken'],
  ['id','name','role','mass',p=>f(p.radius,4),'sharp','rest','gear','taken']);
tbl('Assists',SIM.ASSISTS,['id','name','role','mass kg','gearMul','absorb','radAdd','smash'],
  ['id','name','role','mass','gearMul','absorb',p=>f(p.radAdd,4),'smash']);
tbl('Ratchets',SIM.RATCHETS,['id','role','mass kg','height mm','lock','strikeHigh'],
  ['id','role','mass',p=>String(p.height),'lock','strikeHigh']);
tbl('Bits',SIM.BITS,['id','name','role','mass kg','stamina','drive','stable','dash','shaft'],
  ['id','name','role','mass','stamina','drive','stable','dash','shaft']);
tbl('Weights',SIM.WEIGHTS.slice(1),['id','name','mass kg'],['id','name','mass']);
o('Weight rings: '+SIM.RINGS.map(r=>(r*100)+'% of blade radius').join(', ')+
  '; '+SIM.HOLES+' holes per ring; max '+SIM.MAX_WEIGHTS+' fitted.');o('');

o('## Tuned constants');o('');
o('| key | value | what it does |');o('|---|---|---|');
const NOTE={dt:'fixed timestep',arenaR:'stadium radius m',bowl:'inward pull; TIGHT forces engagement',
 ridgeAt:'where the dish becomes rail',ridgeFall:'slope reversal on the rail',railDrag:'rail is smooth',
 exitNeed:'radial speed to leave',pockets:'low points in the lip',pocketMu:'pocket exit discount',
 floorMu:'floor drag',spinBase:'baseline spin decay',spinLean:'lean cost',spinSlip:'travel cost',
 stamPow:'stamina exponent',massCost:'mass punishes spin',iRef:'reference inertia',
 inertiaPow:'rim mass protects spin',driveK:'travel force',fallK:'topple rate',riseK:'self-righting rate',
 leanEq:'equilibrium lean',wStable:'stability threshold',precMax:'precession clamp',precScale:'precession gain',
 tiltHit:'strike destabilisation',thetaMax:'topple angle',theta0:'launch lean',spinDead:'spinout threshold',
 wallE:'wall restitution',muMax:'rim friction ceiling',jtCap:'tangential vs normal cap',
 tanLin:'linear share of rim friction',hitDrain:'smash damage',recoil:'striker payback share',
 hitGap:'strike debounce',hitFloor:'minimum real strike',ringOut:'exit radius',launchSpin:'launch rad/s',
 imbDrive:'wobble buys travel',imbDrain:'wobble costs spin',imbSwing:'heavy-side swing',
 imbDash:'wobble bites the rail',dashSpeed:'rail engage speed',dashGain:'rail acceleration',
 dashCost:'spin paid per dash',dashGap:'dash cooldown',burstWear:'wear to burst',burstK:'wear per reference hit',
 burstPow:'wear superlinearity',impRef:'reference strike',burstBack:'striker wear share',
 chargeHit:'charge per strike',chargeTaken:'charge per hit absorbed',chargeRidge:'charge per rail second'};
for(const k of Object.keys(SIM.K)) o('| `'+k+'` | '+SIM.K[k]+' | '+(NOTE[k]||'')+' |');
o('');
o('## Tier expansion (to build)');o('');
o('Tiers are NOT power levels. Every tier shares one stat budget; higher tiers');
o('spend it more extremely. A Tier 3 part is more specialised and more');
o('punishing, never strictly better. The part audit in `partaudit.js` is the');
o('gate: if a Tier 3 part raises the MEAN win rate of builds containing it by');
o('more than 4 points over its Tier 1 sibling, it is power creep and it is wrong.');o('');
o('| Tier | Name | Count target | Rule |');o('|---|---|---|---|');
o('| 1 | Stock | 50 (built) | Balanced trade-offs, forgiving, no drawback keyword |');
o('| 2 | Forged | 40 (to build) | One stat pushed ~25% past Tier 1 range, one pulled back further |');
o('| 3 | Relic | 20 (to build) | One stat at an extreme, plus a named drawback the sim enforces |');
o('');
o('Target totals per slot after expansion: 22 cores, 22 blades, 22 assists,');
o('20 ratchets, 24 bits — **110 parts**, '+(22*22*22*20*24).toLocaleString()+' chassis.');
console.log(L.join('\n'));
