// The loaf through the REAL fixed verbStep (w 4.2, ellipse, soft bonk), no input, the same sweep: deaths, bonk runs, and
// how often a bonked knife's centre ends up inside the DRAWN loaf (2.1 x 1.1), i.e. a visible pass through
var H=require('./harness2.js'), ctx=H.ctx, vm=require('vm');
function run(o){
  var e={kind:'loaf', grp:{}, x:o.sx, y:-1.3, w:4.2, h:2.2, mesh:{parent:null}, seams:[], ws:null, inside:false};
  ctx.sfx={};
  ctx.G={ mode:'ff', world:{SW:9.2, pads:[], slabs:[], verbs:[e], ws:{id:'ember_kiln'}}, x:o.kx, y:8, vx:0, vy:-19, ang:o.ang, w:0, score:0, combo:3, comboBest:0, slices:0, t:0, lastSide:1, holding:false, hold:0, done:false, chips:0 };
  var G=ctx.G, dt=1/120, run=0, maxRun=0, bonked=false, inBread=0, out=0;
  for(var n=0;n<400;n++){ var w0=ctx.sfx.wood||0; vm.runInContext('ffStep('+dt+')', ctx); var b=(ctx.sfx.wood||0)>w0;
    if(b){ bonked=true; run++; if(run>maxRun)maxRun=run; } else run=0;
    if(bonked&&!e.done){ var u=(G.x-e.x)/2.1, v=(G.y-e.y)/1.1; if(u*u+v*v<1)inBread++; }
    if(Math.abs(G.x)>9.2-0.71)out++;
    if(G.done||G.y<-25)break; }
  return {stuck:!!G.failed, bonked:bonked, run5:maxRun>=5, inBread:inBread, out:out>0, cut:!!e.done};
}
var Q={n:0,stuck:0,bonked:0,run5:0,passThrough:0,maxIn:0,out:0,cut:0};
for(var sx=-5.7; sx<=5.7001; sx+=0.6) for(var kx=-8.4; kx<=8.4001; kx+=0.3) for(var a=0;a<360;a+=10){
  var r=run({sx:sx,kx:kx,ang:a*Math.PI/180}); Q.n++; if(r.stuck)Q.stuck++; if(r.bonked)Q.bonked++; if(r.run5)Q.run5++; if(r.inBread){ Q.passThrough++; if(r.inBread>Q.maxIn)Q.maxIn=r.inBread; } if(r.out)Q.out++; if(r.cut)Q.cut++; }
console.log('loaf (real code)', JSON.stringify(Q));
