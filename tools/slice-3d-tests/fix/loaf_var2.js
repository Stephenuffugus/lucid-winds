// Loaf variants against the same no-input sweep (stack baseline from loaf_fix.js: stuck 5677, soon 696, run5 241, out 176)
var H=require('./harness2.js'), ctx=H.ctx, vm=require('vm');
vm.runInContext(
"function loafC(e, nx, ny, o){\n"+
"  var bX=-Math.cos(G.ang), bY=-Math.sin(G.ang), a=e.w/2+KR, b=e.h/2+KR, dy=ny-e.y, touch;\n"+
"  if(o.ell){ var u=(nx-e.x)/a, v=dy/b; touch=u*u+v*v<1; } else touch=nx+KR>e.x-e.w/2 && nx-KR<e.x+e.w/2 && ny+KR>e.y-e.h/2 && ny-KR<e.y+e.h/2;\n"+
"  if(!touch){ e.inside=false; return nx; }\n"+
"  if(e.inside)return nx; e.inside=true;\n"+
"  if((e.x-G.x)*bX+(e.y-G.y)*bY>0){ e.done=true; return nx; }\n"+
"  var push=(G.x<e.x)?-1:1, lim=G.world.SW-kReachX(G.ang); G.vx=push*Math.max(o.kick||4.5,Math.abs(G.vx)); if(G.vy>-3)G.vy=-3; sfx.wood=(sfx.wood||0)+1;\n"+
"  var hw=(o.ell&&!o.full)?a*Math.sqrt(Math.max(0,1-(dy/b)*(dy/b))):a;\n"+
"  return Math.max(-lim, Math.min(lim, e.x+push*hw));\n"+
"}\n"+
"function runV(o){\n"+
"  var lx=Math.max(-o.lim, Math.min(o.lim, o.sx)), e={kind:'loafV', x:lx, y:-1.3, w:o.w, h:2.2, inside:false, done:false};\n"+
"  G={ mode:'ff', world:{SW:9.2, pads:[], slabs:[], verbs:[], ws:{id:'ember_kiln'}}, x:o.kx, y:8, vx:0, vy:-19, ang:o.ang, w:0, score:0, combo:3, comboBest:0, slices:0, t:0, lastSide:1, holding:false, hold:0, done:false, chips:0 };\n"+
"  var dt=1/120, run=0, maxRun=0, bonkT=null, stuckT=null, out=0;\n"+
"  for(var n=0;n<400;n++){ var wb=sfx.wood||0; ffStep(dt); if(!e.done&&!G.done){ G.x=loafC(e, G.x, G.y, o); } var bonk=(sfx.wood||0)>wb;\n"+
"    if(bonk){ run++; if(run>maxRun)maxRun=run; bonkT=G.t; } else run=0; if(Math.abs(G.x)>9.2-0.71)out++;\n"+
"    if(G.failed&&stuckT===null)stuckT=G.t; if(G.done||G.y<-25)break; }\n"+
"  return {stuck:!!G.failed, soon:!!G.failed&&bonkT!==null&&stuckT-bonkT<=0.15, run5:maxRun>=5, out:out>0, cut:e.done};\n"+
"}\n", ctx);
function sweep(label, o){
  var Q={n:0,stuck:0,soon:0,run5:0,out:0,cut:0};
  for(var sx=-5.7; sx<=5.7001; sx+=0.6) for(var kx=-8.4; kx<=8.4001; kx+=0.3) for(var a=0;a<360;a+=10){
    ctx.sfx={}; o.sx=sx; o.kx=kx; o.ang=a*Math.PI/180; ctx.__o=o; var r=vm.runInContext('runV(__o)', ctx);
    Q.n++; if(r.stuck)Q.stuck++; if(r.soon)Q.soon++; if(r.run5)Q.run5++; if(r.out)Q.out++; if(r.cut)Q.cut++; }
  console.log(label, JSON.stringify(Q));
}
var mid=function(w){ return 9.2-Math.hypot(5.70*0.55,1.3*0.55)-w/2-1.5-0.05; };
var which=process.argv[2]||'all';
if(which==='all'||which==='a')sweep('A box 5.6, stack x, fixed contact', {w:5.6, lim:99});
if(which==='all'||which==='b')sweep('B ellipse 5.6, stack x', {w:5.6, lim:99, ell:true});
if(which==='all'||which==='c')sweep('C ellipse 5.6, |x|<=4.1', {w:5.6, lim:4.1, ell:true});
if(which==='all'||which==='d')sweep('D ellipse 5.6, centred', {w:5.6, lim:mid(5.6), ell:true});
if(which==='all'||which==='e')sweep('E box 5.6, centred (the current fix)', {w:5.6, lim:mid(5.6)});
if(which==='b2')sweep('B2 ellipse 5.6, stack x, full side clear', {w:5.6, lim:99, ell:true, full:true});
if(which==='f')['F1 box 4.2 full','F2 ellipse 4.2 full','F3 ellipse 4.6 full','F4 box 4.6 full'].forEach(function(l,i){
  var o=[{w:4.2,lim:99},{w:4.2,lim:99,ell:true,full:true},{w:4.6,lim:99,ell:true,full:true},{w:4.6,lim:99}][i]; sweep(l+', stack x', o); });
if(which==='g')['G ellipse 4.2 full kick 3','H ellipse 5.6 full kick 3','I ellipse 4.6 full kick 3'].forEach(function(l,i){
  var o=[{w:4.2,lim:99,ell:true,full:true,kick:3},{w:5.6,lim:99,ell:true,full:true,kick:3},{w:4.6,lim:99,ell:true,full:true,kick:3}][i]; sweep(l+', stack x', o); });
if(which==='j')sweep('J ellipse 4.2 full kick 3, |x|<=4.83 (an upright knife always fits by the wall)', {w:4.2,lim:4.83,ell:true,full:true,kick:3});
