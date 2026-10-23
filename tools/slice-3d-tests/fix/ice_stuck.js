var H=require('./harness2.js'), ctx=H.ctx, vm=require('vm');
function run(o, trace){
  var ix=o.ix, iy=0, e={kind:'ice', grp:{}, x:ix, y:iy, w:3.8, h:2.6, stage:0, inside:false, mesh:{}, ws:null, sink:null};
  var pad={x:ix, y:iy-7.0, r:2, up:true, ice:e, mesh:[]};
  ctx.sfx={};
  ctx.G={ mode:'ff', world:{SW:9.2, pads:o.nopad?[]:[pad], slabs:[], verbs:o.noice?[]:[e], ws:{id:'frost_chasm'}},
    x:ix+o.dx, y:iy+o.y0, vx:0, vy:o.vy, ang:o.ang, w:0, score:0, combo:3, comboBest:0, slices:0, t:0, lastSide:1, holding:false, hold:0, done:false, chips:0 };
  var G=ctx.G, dt=1/120, ev=[], st=0, w0=0;
  for(var n=0;n<1500;n++){ var s0=e.stage, wd=ctx.sfx.wood||0, sp=ctx.sfx.spring||0; vm.runInContext('ffStep('+dt+')', ctx);
    if(e.stage!==s0)ev.push('stage'+e.stage+'@'+G.t.toFixed(3)+' x'+G.x.toFixed(2)+' y'+G.y.toFixed(2)+' ang'+(G.ang*180/Math.PI).toFixed(0));
    if((ctx.sfx.wood||0)>wd)ev.push('wood@'+G.t.toFixed(3)+' x'+G.x.toFixed(2)+' y'+G.y.toFixed(2)+' vx'+G.vx.toFixed(1));
    if((ctx.sfx.spring||0)>sp)ev.push('spring@'+G.t.toFixed(3)+' x'+G.x.toFixed(2)+' vy'+G.vy.toFixed(1)+' vx'+G.vx.toFixed(1));
    if(G.done||G.y<iy-30)break; }
  return {stage:e.stage, stuck:!!G.failed, ev:ev, endX:G.x.toFixed(2)};
}
var shown=0, base=0, cnt=0;
for(var ix=-2.5; ix<=2.5001; ix+=1.25) for(var dx=-3.3; dx<=3.3001; dx+=0.3) for(var a=-180;a<180;a+=10){
  var o={ix:ix, dx:dx, y0:6, vy:-19, ang:a*Math.PI/180};
  var r=run(o); if(r.stage>=1&&r.stuck){ cnt++; var b=run(Object.assign({noice:true,nopad:true},o)); if(b.stuck)base++;
    if(shown<6){ shown++; console.log(JSON.stringify({ix:ix,dx:+dx.toFixed(2),a:a}), JSON.stringify(r)); } } }
console.log('cracked then stuck',cnt,'of which stuck with no ice and no bumper too',base);
