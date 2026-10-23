var H=require('./harness2.js'), ctx=H.ctx, vm=require('vm');
function run(o){
  var ix=o.ix, iy=0, e={kind:'ice', grp:{}, x:ix, y:iy, w:3.8, h:2.6, stage:0, inside:false, mesh:{}, ws:null, sink:null};
  var pad={x:ix, y:iy-7.0, r:2, up:true, ice:e, mesh:[]};
  ctx.sfx={};
  ctx.G={ mode:'ff', endless:!!o.endless, depth:o.depth||0, world:{SW:9.2, pads:[pad], slabs:[], verbs:[e], ws:{id:'frost_chasm'}},
    x:ix+o.dx, y:iy+o.y0, vx:o.vx||0, vy:o.vy, ang:o.ang, w:o.w||0, score:0, combo:3, comboBest:0, slices:0, t:0, lastSide:1,
    holding:false, hold:0, done:false, chips:0 };
  var G=ctx.G, dt=1/120, crack=false, chipAfter=false, up=false, ups=0, apexAbove=-1e9;
  for(var n=0;n<1500;n++){ var t=n*dt;
    if(o.hold && t>=o.hold.t0 && t<o.hold.t0+o.hold.d){ G.holding=true; G.hold=o.hold.s; G.lastSide=o.hold.s; } else { G.holding=false; G.hold=0; }
    var ch0=G.chips||0, vy0=G.vy; vm.runInContext('ffStep('+dt+')', ctx);
    if(e.stage>=1)crack=true; if(crack&&(G.chips||0)>ch0)chipAfter=true; if(vy0<0&&G.vy>=13){ up=true; ups++; }
    if(G.done||G.y<iy-30)break; }
  return {crack:crack, stage:e.stage, chipAfter:chipAfter, up:up, ups:ups, stuck:!!G.failed, padGone:!!pad.gone};
}
function sweep(vy, label){
  var tot=0, cr=0, chip=0, sh=0, stuck=0, multi=0, unsh=0;
  for(var ix=-2.5; ix<=2.5001; ix+=1.25) for(var dx=-3.3; dx<=3.3001; dx+=0.3) for(var a=-180;a<180;a+=10){
    var r=run({ix:ix, dx:dx, y0:6, vy:vy, ang:a*Math.PI/180, endless:vy<-19, depth:vy<-19?(-vy-19)/0.012:0});
    tot++; if(r.crack){ cr++; if(r.chipAfter)chip++; if(r.stage===2)sh++; else unsh++; if(r.stuck)stuck++; if(r.ups>1)multi++; } }
  console.log(label,'| entries',tot,'cracked',cr,'chip after the crack',chip,'shattered',sh,'cracked not shattered',unsh,'stuck after a crack',stuck,'more than one kick',multi);
}
sweep(-19,'no input, 19 u/s');
sweep(-30,'no input, 30 u/s (Endless cap)');
var r=run({ix:0, dx:0, y0:6, vy:-19, ang:Math.PI/2}); console.log('straight blade down, centre:', JSON.stringify(r));
// with holds: any single hold, blade near down
var tot=0, clean=0, chip=0, cr=0;
for(var ix of [-2.5,0,2.5]) for(var dx=-2; dx<=2; dx+=1) for(var a=60;a<=120;a+=15) for(var s of [-1,1]) for(var t0=0;t0<=0.9;t0+=0.1) for(var d=0.1;d<=0.6;d+=0.1){
  var q=run({ix:ix, dx:dx, y0:6, vy:-19, ang:a*Math.PI/180, hold:{s:s,t0:t0,d:d}}); tot++; if(q.crack){ cr++; if(q.chipAfter)chip++; if(q.stage===2&&!q.chipAfter&&!q.stuck)clean++; } }
console.log('with one hold: tries',tot,'cracked',cr,'chip after the crack',chip,'clean shatter',clean);
