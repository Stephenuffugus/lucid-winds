var H=require('./harness3.js'), ctx=H.ctx, vm=require('vm');
var LIM=vm.runInContext('verbMidX(9.2, 5.6)', ctx), LIMI=vm.runInContext('verbMidX(9.2, 3.8)', ctx);
console.log('loaf clamp', LIM.toFixed(3), 'ice clamp', LIMI.toFixed(3));
vm.runInContext(
"function slotRun(o){\n"+
"  var verbs=[], slabs=[], x=o.sx, y=0;\n"+
"  if(o.kind==='loaf'){ var lx=Math.max(-o.lim, Math.min(o.lim, x)); verbs.push({kind:'loaf', grp:{}, x:lx, y:y-1.3, w:5.6, h:2.2, mesh:{parent:null}, seams:[], ws:null}); }\n"+
"  else for(var k=0;k<o.n;k++)slabs.push({x:x,y:y-k*1.32,w:3.4,h:1.15,cut:false});\n"+
"  G={ mode:'ff', world:{SW:9.2, pads:[], slabs:slabs, verbs:verbs, ws:{id:'ember_kiln'}}, x:o.kx, y:8, vx:0, vy:-19, ang:o.ang, w:0, score:0, combo:3, comboBest:0, slices:0, t:0, lastSide:1, holding:false, hold:0, done:false, chips:0 };\n"+
"  var dt=1/120, maxRun=0, run=0, bonkT=null, stuckT=null, out=0;\n"+
"  for(var n=0;n<400;n++){ var wb=(sfx.wood||0)+(G.slabBonks||0); ffStep(dt); var bonk=(sfx.wood||0)+(G.slabBonks||0)>wb;\n"+
"    if(bonk){ run++; if(run>maxRun)maxRun=run; bonkT=G.t; } else run=0; if(Math.abs(G.x)>9.2-0.71)out++;\n"+
"    if(G.failed&&stuckT===null)stuckT=G.t; if(G.done||G.y<-25)break; }\n"+
"  return {maxRun:maxRun, stuck:!!G.failed, stuckSoon:!!G.failed&&bonkT!==null&&stuckT-bonkT<=0.15, bonked:bonkT!==null, out:out};\n"+
"}\n", ctx);
function run(o){ ctx.sfx={}; ctx.__o=o; o.lim=LIM; return vm.runInContext('slotRun(__o)', ctx); }
console.log('the review case, loaf asked at x=4.4, handle down knife at x=8.0:', JSON.stringify(run({kind:'loaf', sx:4.4, kx:8.0, ang:-Math.PI/2})));
console.log('loaf asked at x=5.7, knife at 8.3:', JSON.stringify(run({kind:'loaf', sx:5.7, kx:8.3, ang:-Math.PI/2})));
var R={loaf:{n:0,stuck:0,soon:0,run5:0,out:0}, stack:{n:0,stuck:0,soon:0,run5:0,out:0}};
for(var sx=-5.7; sx<=5.7001; sx+=0.6) for(var kx=-8.4; kx<=8.4001; kx+=0.3) for(var a=0;a<360;a+=10){
  ['loaf','stack'].forEach(function(kd){ var r=run({kind:kd, n:10, sx:sx, kx:kx, ang:a*Math.PI/180}); var Q=R[kd]; Q.n++; if(r.stuck)Q.stuck++; if(r.stuckSoon)Q.soon++; if(r.maxRun>=5)Q.run5++; if(r.out)Q.out++; }); }
console.log(JSON.stringify(R));
