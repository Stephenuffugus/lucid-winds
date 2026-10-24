// Is any fall still pushed past the wall's reach without being a stuck pose? (the stuck pose embeds the tip by design)
var M=require('./stackwall.js'), run=M.run, ctx=M.ctx, vm=require('vm');
vm.runInContext(
"function outRun(o){\n"+
"  var slabs=[], S0={inside:false}; for(var k=0;k<o.n;k++)slabs.push({x:o.sx,y:-k*1.32,w:3.4,h:1.15,cut:false,stk:S0});\n"+
"  G={ mode:'ff', world:{SW:9.2, pads:[], slabs:slabs, stks:[S0], verbs:[], ws:{id:'mossy_canyon'}}, x:o.kx, y:8, vx:0, vy:-19, ang:o.ang, w:0, score:0, combo:3, comboBest:0, slices:0, t:0, lastSide:1, holding:false, hold:0, done:false, chips:0 };\n"+
"  var step=this['ffStep_'+o.v], bad=0; for(var n=0;n<400;n++){ step(1/120); if(!G.done&&Math.abs(G.x)>9.2-kReachX(G.ang)+1e-6)bad++; if(G.done||G.y<-o.n*1.32-6)break; } return bad;\n"+
"}\n", ctx);
var R={v64:0,slab:0,stack:0}, N=0;
for(var sx=-5.7; sx<=5.7001; sx+=0.3) for(var kx=-8.4; kx<=8.4001; kx+=0.3) for(var a=0;a<360;a+=10){ N++;
  for(var v in R){ ctx.sfx={}; ctx.__o={v:v,n:10,sx:+sx.toFixed(2),kx:+kx.toFixed(2),ang:a*Math.PI/180}; if(vm.runInContext('outRun(__o)',ctx)>0)R[v]++; } }
console.log('falls with a live (not stuck) step past the wall reach, of', N, JSON.stringify(R));
