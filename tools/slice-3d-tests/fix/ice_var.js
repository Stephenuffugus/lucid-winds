// The ice through the REAL fixed verbStep/ffPad/iceStage, no input, the same sweep as the loaf: centred (|x|<=2.53) vs at the stack's x
var H=require('./harness2.js'), ctx=H.ctx, vm=require('vm');
function run(o){
  var ix=Math.max(-o.lim, Math.min(o.lim, o.sx)), iy=-1.5, e={kind:'ice', grp:{}, x:ix, y:iy, w:3.8, h:2.6, stage:0, inside:false, mesh:{}, ws:null, sink:null};
  var pad={x:ix, y:iy-7.0, r:2, up:true, ice:e, mesh:[]};
  ctx.sfx={};
  ctx.G={ mode:'ff', world:{SW:9.2, pads:[pad], slabs:[], verbs:[e], ws:{id:'frost_chasm'}}, x:o.kx, y:8, vx:0, vy:-19, ang:o.ang, w:0, score:0, combo:3, comboBest:0, slices:0, t:0, lastSide:1, holding:false, hold:0, done:false, chips:0 };
  var G=ctx.G, dt=1/120;
  for(var n=0;n<500;n++){ vm.runInContext('ffStep('+dt+')', ctx); if(G.done||G.y<-30)break; }
  return {stuck:!!G.failed, chips:G.chips||0, shatter:e.stage===2};
}
['centred','stack x'].forEach(function(label){ var Q={n:0,stuck:0,chipped:0,shatter:0};
  for(var sx=-5.7; sx<=5.7001; sx+=0.6) for(var kx=-8.4; kx<=8.4001; kx+=0.3) for(var a=0;a<360;a+=10){
    var r=run({sx:sx,kx:kx,ang:a*Math.PI/180,lim:label==='centred'?2.534:99}); Q.n++; if(r.stuck)Q.stuck++; if(r.chips)Q.chipped++; if(r.shatter)Q.shatter++; }
  console.log('ice', label, JSON.stringify(Q)); });
