/* Dumps every part with every stat, plus the tier expansion targets.
 * node catalog.js > CATALOG.md */
const SIM=require('../src/sim2.js');
const L=[],o=s=>L.push(s);
const f=(v,d=2)=>typeof v==='number'?v.toFixed(d):String(v);
o('# RIPCORD — Part Catalogue');o('');
o('Generated from `sim2.js`. Every number the simulation reads is here.');o('');
o('All three tiers are built. Tier is not power: every tier spends the same');
o('budget and higher tiers spend it more extremely. A Relic also carries a named');
o('drawback the simulation enforces, listed at the bottom.');o('');
o('The gate is empirical, not editorial: `node tools/partaudit.js` must print');
o('PART AUDIT OK, which means every part has a build where it works and no');
o('higher tier lifts the average of whatever it is bolted to.');o('');
{
  const all=[].concat(SIM.CORES,SIM.BLADES,SIM.ASSISTS,SIM.RATCHETS,SIM.BITS);
  const t=[0,0,0,0]; all.forEach(p=>t[p.tier||1]++);
  const chassis=SIM.CORES.length*SIM.BLADES.length*SIM.ASSISTS.length*SIM.RATCHETS.length*SIM.BITS.length;
  o('| | count |');o('|---|---|');
  o('| Tier 1, Stock | '+t[1]+' |');
  o('| Tier 2, Forged | '+t[2]+' |');
  o('| Tier 3, Relic | '+t[3]+' |');
  o('| **total parts** | **'+all.length+'** |');
  o('| chassis, before counterweights | '+chassis.toLocaleString('en-US')+' |');
  o('| weight configurations | '+(function(){
      // choose up to MAX_WEIGHTS holes from RINGS*HOLES, each of 3 masses
      const slots=SIM.RINGS.length*SIM.HOLES; let n=0;
      const comb=(a,b)=>{let r=1;for(let i=0;i<b;i++)r=r*(a-i)/(i+1);return Math.round(r);};
      for(let k=0;k<=SIM.MAX_WEIGHTS;k++) n+=comb(slots,k)*Math.pow(SIM.WEIGHTS.length-1,k);
      return n.toLocaleString('en-US');})()+' |');
  o('');
}

function tbl(title,list,cols,keys){
  o('## '+title+' — '+list.length+' parts');o('');
  o('| '+cols.join(' | ')+' |');o('|'+cols.map(()=>'---').join('|')+'|');
  for(const p of list) o('| '+keys.map(k=>typeof k==='function'?k(p):f(p[k],k==='mass'?4:2)).join(' | ')+' |');
  o('');
}
const T=p=>['','Stock','Forged','Relic'][p.tier||1];
const D=p=>p.drawback||'';
tbl('Cores',SIM.CORES,['id','name','tier','role','mass kg','spin','ability','charge','drawback'],
  ['id','name',T,'role','mass',p=>p.dir>0?'right':'left','ability','charge',D]);
tbl('Blades',SIM.BLADES,['id','name','tier','role','mass kg','radius m','sharp','rest','gear','taken','drawback'],
  ['id','name',T,'role','mass',p=>f(p.radius,4),'sharp','rest','gear','taken',D]);
tbl('Assists',SIM.ASSISTS,['id','name','tier','role','mass kg','gearMul','absorb','radAdd','smash','drawback'],
  ['id','name',T,'role','mass','gearMul','absorb',p=>f(p.radAdd,4),'smash',D]);
tbl('Ratchets',SIM.RATCHETS,['id','tier','role','mass kg','height mm','lock','strikeHigh','drawback'],
  ['id',T,'role','mass',p=>String(p.height),'lock','strikeHigh',D]);
tbl('Bits',SIM.BITS,['id','name','tier','role','mass kg','stamina','drive','stable','dash','shaft','drawback'],
  ['id','name',T,'role','mass','stamina','drive','stable','dash','shaft',D]);

// ---- the things a stat table cannot say
o('## Relic drawbacks');o('');
o('A Relic takes one stat to an extreme and pays for it with a named behaviour');
o('the simulation actually enforces. A drawback that never fires is power creep');
o('in a costume, so each of these is measured and each of them bites.');o('');
o('| id | name | what it does |');o('|---|---|---|');
for(const d of SIM.DRAWBACKS) o('| '+d.id+' | '+d.name+' | '+d.desc+' |');
o('');

o('## Tuning operations');o('');
o('Free, reversible, and capped at '+SIM.MODS_PER_PART+' changes to any one part.');
o('There is no currency in this game and there is never going to be one.');o('');
o('| operation | slots | effect | max |');o('|---|---|---|---|');
for(const t of SIM.TUNING)
  o('| '+t.name+' | '+t.slots.join(', ')+' | '+
    Object.keys(t.d).map(k=>k+' '+(t.d[k]>0?'+':'')+t.d[k]).join(', ')+' | '+t.max+' |');
o('');

o('## Abilities and triggers');o('');
o('Programmed BEFORE launch and fired once. The player never touches the screen');
o('during a round, so the whole tactical decision is which two lines to write.');o('');
o('Abilities, one per core: '+[...new Set(SIM.CORES.map(c=>c.ability))].sort().join(', ')+'.');o('');
o('| trigger | fires when |');o('|---|---|');
for(const t of SIM.TRIGGERS) o('| '+t+' | '+(SIM.TRIGGER_LABEL[t]||'')+' |');
o('');

o('## Modes');o('');
o('| mode | arena | rules |');o('|---|---|---|');
for(const k of Object.keys(SIM.MODES)){const m=SIM.MODES[k];
  o('| '+m.name+' | '+(m.arenaR*1000).toFixed(0)+'mm | '+m.desc+' |');}
o('');
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
