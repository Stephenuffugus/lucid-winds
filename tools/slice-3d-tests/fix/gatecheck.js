// E1 review: gate falls (a gate is three one slab stacks, 1.4 u apart, one hole). The shipped contact (harness2's drift
// checked copy, 'live') against v6.4 ('v64', from stackwall.js): no fall may stick where v6.4 survived, no live step past the
// wall's reach. Watch long enough (argv[3], u below the gate): a knife drifting at a wall blade first sticks a moment later.
// "deepInner": the knife's middle more than 0.4 u inside an INNER gate slab (the clamp can never bite there).
// The review's first cut of E1 held every bonk's contact open and stuck knives v6.4 bounced clear. node gatecheck.js [spin]
var M=require('./stackwall.js'), ctx=M.ctx, vm=require('vm');
vm.runInContext(
"function gateRun(o){\n"+
"  var slabs=[], SW=9.2; for(var gi=0;gi<4;gi++){ if(gi===o.hole)continue; slabs.push({x:-SW+2+gi*((SW*2-4)/3),y:0,w:3.4,h:1.15,cut:false,stk:{inside:false}}); }\n"+
"  G={ mode:'ff', world:{SW:SW, pads:[], slabs:slabs, stks:slabs.map(function(s){return s.stk;}), verbs:[], ws:{id:'mossy_canyon'}}, x:o.kx, y:5, vx:0, vy:-19, ang:o.ang, w:o.w||0, score:0, combo:3, comboBest:0, slices:0, t:0, lastSide:o.hold||1, holding:!!o.hold, hold:o.hold||0, done:false, chips:0 };\n"+
"  var step=this['ffStep_'+o.v], deepInner=0, liveOut=0;\n"+
"  for(var n=0;n<300;n++){ if(o.hold&&G.t>=0.3)G.holding=false; step(1/120);\n"+
"    for(var q=0;q<slabs.length;q++){ var s=slabs[q]; if(!s.cut&&Math.abs(s.x)<3&&Math.abs(G.x-s.x)<s.w/2-0.4&&Math.abs(G.y-s.y)<s.h/2+KR)deepInner++; }\n"+
"    if(!G.done&&Math.abs(G.x)>SW-kReachX(G.ang)+1e-6)liveOut++;\n"+
"    if(G.done||G.y<-o.until)break; }\n"+
"  return {bonks:G.slabBonks||0, cuts:G.slabCuts||0, stuck:!!G.failed, x:G.x, deepInner:deepInner, liveOut:liveOut};\n"+
"}\n", ctx);
function run(o){ ctx.sfx={}; ctx.__o=o; return vm.runInContext('gateRun(__o)', ctx); }
var V=['v64','live','stack'], R={};   /* stack: the review's first cut (every bonk holds the contact open) */ V.forEach(function(v){ R[v]={stuck:0, newStuck:0, deepInner:0, liveOut:0, bonks:0, cuts:0}; });
var spin=process.argv[2]==='spin', UNTIL=+(process.argv[3]||6), N=0, W=spin?[-6,6]:[0], H=spin?[0,1,-1]:[0], AS=spin?20:5, XS=spin?0.3:0.1;
for(var hole=0;hole<4;hole++) for(var kx=-8.4; kx<=8.4001; kx+=XS) for(var a=0;a<360;a+=AS) for(var wi=0;wi<W.length;wi++) for(var hi=0;hi<H.length;hi++){
  var o={hole:hole, kx:+kx.toFixed(2), ang:a*Math.PI/180, w:W[wi], hold:H[hi], until:UNTIL}, base=null; N++;
  V.forEach(function(v){ var r=run(Object.assign({v:v},o)), Q=R[v]; if(v==='v64')base=r;
    if(r.stuck)Q.stuck++; if(r.stuck&&!base.stuck)Q.newStuck++; if(r.deepInner)Q.deepInner++; if(r.liveOut)Q.liveOut++; Q.bonks+=r.bonks; Q.cuts+=r.cuts; }); }
console.log((spin?'spin/hold':'no input')+' gate falls:', N, 'watched to', UNTIL, 'u below the gate'); console.log(JSON.stringify(R));
