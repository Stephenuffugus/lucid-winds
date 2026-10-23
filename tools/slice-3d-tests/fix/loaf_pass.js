// Variant B: after a handle bonk, does the knife's centre ever pass into the DRAWN loaf (2.8 x 1.1), and how deep?
var H=require('./harness2.js'), ctx=H.ctx, vm=require('vm');
vm.runInContext(
"function loafB(e, nx, ny){\n"+
"  var bX=-Math.cos(G.ang), bY=-Math.sin(G.ang), a=e.w/2+KR, b=e.h/2+KR, dy=ny-e.y, u=(nx-e.x)/a, v=dy/b, touch=u*u+v*v<1;\n"+
"  if(!touch){ e.inside=false; return nx; }\n"+
"  if(e.inside)return nx; e.inside=true;\n"+
"  if((e.x-G.x)*bX+(e.y-G.y)*bY>0){ e.done=true; return nx; }\n"+
"  var push=(G.x<e.x)?-1:1, lim=G.world.SW-kReachX(G.ang); G.vx=push*Math.max(4.5,Math.abs(G.vx)); if(G.vy>-3)G.vy=-3; e.bonks=(e.bonks||0)+1;\n"+
"  var hw=a*Math.sqrt(Math.max(0,1-v*v));\n"+
"  return Math.max(-lim, Math.min(lim, e.x+push*hw));\n"+
"}\n"+
"function runP(o){\n"+
"  var e={x:o.sx, y:-1.3, w:5.6, h:2.2, inside:false, done:false, bonks:0};\n"+
"  G={ mode:'ff', world:{SW:9.2, pads:[], slabs:[], verbs:[], ws:{id:'ember_kiln'}}, x:o.kx, y:8, vx:0, vy:-19, ang:o.ang, w:0, score:0, combo:3, comboBest:0, slices:0, t:0, lastSide:1, holding:false, hold:0, done:false, chips:0 };\n"+
"  var dt=1/120, centreIn=0, deep=0, overlapSteps=0;\n"+
"  for(var n=0;n<400;n++){ ffStep(dt); if(!e.done&&!G.done){ G.x=loafB(e, G.x, G.y); }\n"+
"    if(e.bonks&&!e.done){ var u=(G.x-e.x)/2.8, v=(G.y-e.y)/1.1, r=u*u+v*v; if(r<1){ centreIn++; } var u2=(G.x-e.x)/(2.8+0.5), v2=(G.y-e.y)/(1.1+0.5); if(u2*u2+v2*v2<1)overlapSteps++; }\n"+
"    if(G.done||G.y<-25)break; }\n"+
"  return {bonked:e.bonks>0, centreIn:centreIn, overlap:overlapSteps};\n"+
"}\n", ctx);
var N=0, B=0, C=0, O=0, maxO=0;
for(var sx=-5.7; sx<=5.7001; sx+=0.6) for(var kx=-8.4; kx<=8.4001; kx+=0.3) for(var a=0;a<360;a+=10){
  ctx.__o={sx:sx,kx:kx,ang:a*Math.PI/180}; var r=vm.runInContext('runP(__o)', ctx); N++;
  if(r.bonked){ B++; if(r.centreIn)C++; if(r.overlap>3)O++; if(r.overlap>maxO)maxO=r.overlap; } }
console.log('falls',N,'bonked',B,'knife centre inside the drawn loaf after a bonk',C,'knife within 0.5 of the bread for more than 3 steps',O,'most such steps',maxO);
