// E1 (Part E): the stack-wall bonk, measured through the REAL contact functions (harness2's vm: kReachX, ffWall, ffPad,
// verbStep) with four variants of the slab branch: v64 (live), slab (once per contact per slab), stack (once per contact
// per stack, contact set by a bonk), stackAny (per stack, contact set by any touch), clamp (per stack, held open only when the
// bonk's wall clamp bit: the shipped rule after the E1 review). No input falls past a stack.
var H=require('/workspaces/lucid-winds/tools/slice-3d-tests/fix/harness2.js'), ctx=H.ctx, vm=require('vm');
function variant(v){
  var bonk;
  if(v==='v64') bonk="var pshs=(G.x<sl.x)?-1:1; nx=sl.x+pshs*(sl.w/2+KR); G.vx=pshs*Math.max(4.5,Math.abs(G.vx)); if(G.vy>-3)G.vy=-3; G.combo=0; G.slabBonks=(G.slabBonks||0)+1; SFX.wood();";
  else bonk="var pshs=(G.x<sl.x)?-1:1, slim=SW-kReachX(G.ang); nx=Math.max(-slim,Math.min(slim,sl.x+pshs*(sl.w/2+KR))); G.vx=pshs*Math.max(4.5,Math.abs(G.vx)); if(G.vy>-3)G.vy=-3; G.combo=0; G.slabBonks=(G.slabBonks||0)+1; SFX.wood();";
  var C = v==='slab' ? 'sl' : 'sl.stk';
  var body =
"  var sls=G.world.slabs, isl, k, S;\n"+
(v==='v64'||v==='slab'?"":"  for(k=0;k<G.world.stks.length;k++)G.world.stks[k].now=false;\n")+
"  if(sls){ for(isl=0;isl<sls.length;isl++){ var sl=sls[isl]; if(sl.cut)continue;\n"+
"    if(nx+KR>sl.x-sl.w/2 && nx-KR<sl.x+sl.w/2 && ny+KR>sl.y-sl.h/2 && ny-KR<sl.y+sl.h/2){\n"+
(v==='stackAny'||v==='stack'||v==='clamp'?"      sl.stk.now=true;\n":"")+
"      var bXs=-Math.cos(G.ang), bYs=-Math.sin(G.ang);\n"+
"      if((sl.x-G.x)*bXs+(sl.y-G.y)*bYs > 0){ sl.cut=true; G.slabCuts=(G.slabCuts||0)+1; G.combo=Math.min(G.combo+1,30); "+(v==='stackAny'?"sl.stk.inside=true; ":"")+"}\n"+
(v==='v64' ? "      else { "+bonk+" }\n" : v==='clamp' ? "      else if(!sl.stk.inside){ "+bonk.replace('nx=Math.max(-slim,Math.min(slim,sl.x+pshs*(sl.w/2+KR)));','var tgt=sl.x+pshs*(sl.w/2+KR); nx=Math.max(-slim,Math.min(slim,tgt)); sl.stk.inside=(nx!==tgt);')+" }\n" : "      else if(!"+C+".inside){ "+C+".inside=true; "+bonk+" }\n")+
"    }"+(v==='slab'?" else sl.inside=false;":"")+" } }\n"+
(v==='v64'||v==='slab'?"":"  for(k=0;k<G.world.stks.length;k++){ S=G.world.stks[k]; if(!S.now)S.inside=false; }\n");
  var step = vm.runInContext('ffStep.toString()', ctx);
  var a=step.indexOf('  var sls=G.world.slabs'), b=step.indexOf('  var vbs=G.world.verbs');
  if(a<0||b<0) throw new Error('step shape');
  vm.runInContext(step.slice(0,a).replace('function ffStep(','function ffStep_'+v+'(')+body+step.slice(b), ctx);
}
['v64','slab','stack','stackAny','clamp'].forEach(variant);   /* clamp: the contact held open only when the wall clamp bit (shipped after the review) */
vm.runInContext('var ffStep_live=ffStep;', ctx);   /* the drift-checked copy of the SHIPPED step (harness2) */
vm.runInContext(
"function fallRun(o){\n"+
"  var slabs=[], stks=[], S0={inside:false}; stks.push(S0);\n"+
"  for(var k=0;k<o.n;k++)slabs.push({x:o.sx,y:-k*1.32,w:3.4,h:1.15,cut:false,stk:S0});\n"+
"  G={ mode:'ff', world:{SW:9.2, pads:[], slabs:slabs, stks:stks, verbs:[], ws:{id:'mossy_canyon'}}, x:o.kx, y:8, vx:o.vx||0, vy:-19, ang:o.ang, w:o.w||0, score:0, combo:3, comboBest:0, slices:0, t:0, lastSide:1, holding:false, hold:0, done:false, chips:0 };\n"+
"  var dt=1/120, run=0, maxRun=0, bonkT=null, stuckT=null, out=0, maxAbs=0, woods0=sfx.wood||0, step=this['ffStep_'+o.v];\n"+
"  for(var n=0;n<400;n++){ var bb=G.slabBonks||0; step(dt); var bonk=(G.slabBonks||0)>bb;\n"+
"    if(bonk){ run++; if(run>maxRun)maxRun=run; bonkT=G.t; } else run=0;\n"+
"    if(Math.abs(G.x)>9.2-kReachX(G.ang)+1e-6)out++; if(Math.abs(G.x)>maxAbs)maxAbs=Math.abs(G.x);\n"+
"    if(G.failed&&stuckT===null)stuckT=G.t; if(G.done||G.y<-o.n*1.32-6)break; }\n"+
"  return {bonks:G.slabBonks||0, woods:(sfx.wood||0)-woods0, cuts:G.slabCuts||0, maxRun:maxRun, stuck:!!G.failed, stuckSoon:!!G.failed&&bonkT!==null&&stuckT-bonkT<=0.15, out:out, maxAbs:maxAbs, x:G.x, chips:G.chips||0};\n"+
"}\n", ctx);
function run(o){ ctx.sfx={}; ctx.__o=o; return vm.runInContext('fallRun(__o)', ctx); }
module.exports={run:run, ctx:ctx};
if(require.main===module){
  var V=['v64','slab','stack','stackAny'];
  console.log('the plan case, stack at 5.7, handle down knife at 8.3:');
  V.forEach(function(v){ console.log('  '+v, JSON.stringify(run({v:v, n:10, sx:5.7, kx:8.3, ang:-Math.PI/2}))); });
  var R={}; V.forEach(function(v){ R[v]={n:0,bonks:0,woods:0,cuts:0,stuck:0,soon:0,run5:0,out:0,maxBonks:0,diffFromV64:0,diffNear:0}; });
  for(var sx=-5.7; sx<=5.7001; sx+=0.3) for(var kx=-8.4; kx<=8.4001; kx+=0.3) for(var a=0;a<360;a+=10){
    var base=null;
    V.forEach(function(v){ var r=run({v:v, n:10, sx:+sx.toFixed(2), kx:+kx.toFixed(2), ang:a*Math.PI/180}); var Q=R[v]; Q.n++;
      Q.bonks+=r.bonks; Q.woods+=r.woods; Q.cuts+=r.cuts; if(r.stuck)Q.stuck++; if(r.stuckSoon)Q.soon++; if(r.maxRun>=5)Q.run5++; if(r.out)Q.out++; if(r.bonks>Q.maxBonks)Q.maxBonks=r.bonks;
      if(v==='v64')base=r; else { var d=Math.abs(r.x-base.x)>1e-9||r.cuts!==base.cuts||r.stuck!==base.stuck; if(d){ Q.diffFromV64++; if(Math.abs(sx)>5.29)Q.diffNear++; } } });
  }
  console.log(JSON.stringify(R,null,1));
}
