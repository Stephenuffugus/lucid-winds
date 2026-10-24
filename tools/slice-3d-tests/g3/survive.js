// Part G3 (24 Oct): how deep does Endless let a GOOD player go? The near human controller (e2/ctl3, as g3/ctlE.js with the
// fall's speed as a parameter) in "calm" mode: keep the blade down with little spin and drift, stay off the walls and out of
// every hazard; Endless has no line to carve. It drives the REAL Endless dive: buildEndless and the chunk ring
// (endlessRing, endlessChunk, endlessDrop, endlessTick) with the real stepWorld, all pulled out of index.html into the e4 vm
// (world.js). Measurement only: nothing here changes the game.
// What a thumb can know: only hazards on screen (SIGHT u below the knife, the live camera's bottom edge measured by
// sight.mjs: 30 u at 20 u/s, 45 u at 60 u/s) and only RT seconds after they come into view. It decides every ~0.1 s, keeps a
// plan while it still works and blurs every hold edge by up to 2 steps (prove3b's thumb).
// node survive.js [seeds] [maxDepth]   env SIGHTK=<x the measured sight> RT=<s> (RT=0 SIGHTK=99 = sees everything) SRCF
var W=require('../e4/world.js'), ctx=W.ctx, vm=W.vm, C=require('./ctlE.js');
['endlessLvl','endlessExtra','endlessTerm','endlessChunk','endlessDrop','endlessRing','endlessTick','buildEndless','bandBack'].forEach(function(n){ vm.runInContext(W.grab(n), ctx); });
var mC=W.SRC.match(/var ENDLESS_LVL_MAX=[^\n]*?END_TERM_MAX=\d+;/); if(!mC)throw new Error('Endless constants moved'); vm.runInContext(mC[0], ctx);
ctx.worldEvict=function(){}; ctx.depthRing=function(){}; ctx.ffDecor=function(){};
var SIGHTK=+(process.env.SIGHTK||1), RT=process.env.RT!=null?+process.env.RT:0.25;
function sight(v){ return SIGHTK*(30.2+0.38*Math.max(0, v-20)); }   /* sight.mjs at 412 x 915: 20 u/s 30.2, 30 33.4, 47 40.3, 60 45.4 */
function rnd(seed){ var a=seed>>>0; return function(){ a|=0; a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function blur(p, R){ var q=p.slice(), i=1; while(i<q.length){ if(q[i]!==q[i-1]){ var d=Math.floor(R()*5)-2, v=q[i]; if(d>0){ for(var j=i;j<Math.min(q.length,i+d);j++)q[j]=q[i-1]; } else if(d<0){ for(var j2=Math.max(0,i+d);j2<i;j2++)q[j2]=v; } i+=Math.max(1,d+1); } else i++; } return q; }
function endless(salt){
  ctx.G_FFSALT=salt>>>0; ctx.G_ENDLESS=true; ctx.__finished=false; ctx.G={ world:null, lvl:1 };
  var Wd=vm.runInContext('buildFreefall(1)', ctx); ctx.G_ENDLESS=false;
  var G={ mode:'ff', endless:true, lvl:1, world:Wd, x:0, y:4, vx:0, vy:0, ang:0, w:0, grounded:false, score:0, combo:0, comboBest:0,
    slices:0, taps:0, depth:0, done:false, doneT:0, counted:false, mult:0, stuckY:0, shake:0, holdT:0, holding:false, t:0, lastSide:1, freezeT:0 };
  ctx.G=G; return G;
}
/* every hazard the planner can see, each with the time it first came into view (seen) */
function hazards(A, seen, G, sg){
  ctx.__A=A; var P=vm.runInContext('clParts(__A, 9.2)', ctx), B=[], Wp=[], i, k;
  for(i=0;i<P.B.length;i++){ var b=P.B[i]; if(b.gate)continue; k='b'+b.x0.toFixed(2)+','+b.y0.toFixed(2);
    if(b.y1>=G.y-sg&&seen[k]==null)seen[k]=G.t; if(seen[k]!=null&&G.t-seen[k]>=RT)B.push(b); }
  for(i=0;i<(A.wasps||[]).length;i++){ var w=A.wasps[i]; k='w'+w.cx.toFixed(2)+','+w.y.toFixed(2);
    if(w.y+w.r>=G.y-sg&&seen[k]==null)seen[k]=G.t; if(seen[k]!=null&&G.t-seen[k]>=RT)Wp.push({cx:w.cx, y:w.y, r:w.r, range:w.range, speed:w.speed, phase:w.phase}); }
  return {B:B, W:Wp};
}
function drive(G, jseed, maxDepth){
  var R=rnd(jseed), nextDec=0, prog=[], pi=0, plans=0, seen={}, hold, ev=[], n, vPre=0;
  var sfx=ctx.SFX; ctx.SFX=new Proxy({},{get:function(t,k){ return function(){ if(k!=='flip'&&k!=='milestone'&&k!=='tickup'){ ev.push({k:k, t:G.t}); if(ev.length>12)ev.shift(); } }; }});
  try{ for(n=0; n<400000 && !G.done && G.depth<maxDepth; n++){
    if(n>=nextDec){ nextDec=n+C.TICK+Math.floor(R()*5)-2;
      var v=Math.abs(G.vy), Hz=hazards(G.world, seen, G, sight(v)), st={x:G.x,y:G.y,vx:G.vx,vy:G.vy,w:G.w,ang:G.ang};
      C.PH.t=ctx.endlessTerm(G.depth); C.PH.g=vm.runInContext('ffGrav()', ctx);
      var rest=prog.slice(pi), keep=C.score(st, rest, 0, -1e9, Hz, G.t, 0, true)<2;
      if(!keep){ var pl=C.plan(st, 0, -1e9, Hz, G.t, 0); prog=blur(pl.prog, R); pi=0; plans++; } }
    hold=pi<prog.length?prog[pi++]:0;
    vPre=G.vy; W.step(G,1,hold);
  } } finally { ctx.SFX=sfx; }
  /* what happened in the last 1.5 s before the end: the shove that set it up (wood = a stack's handle bonk, sting = a wasp,
     crystal, bumper/pad, thorn ...) */
  var why=ev.filter(function(e){ return e.k!=='fail'&&G.t-e.t<=1.5; }).map(function(e){ return e.k+'@'+(G.t-e.t).toFixed(2); }).join(' ');
  return { depth:Math.round(G.depth), alive:!G.done, vy:+(-vPre).toFixed(1), term:+ctx.endlessTerm(G.depth).toFixed(1), t:+G.t.toFixed(1), plans:plans, why:why||'(none: the knife went into the wall by itself)',
    slices:G.slices, chips:G.chips||0 };
}
module.exports={ endless:endless, drive:drive, sight:sight };
if(require.main===module){
  var a=process.argv.slice(2).map(Number), NS=a[0]||5, MAXD=a[1]||8000, out=[], t0=Date.now();
  console.log('sight x'+SIGHTK+' (30.2 u at 20 u/s), react '+RT+' s, stop at '+MAXD+' m; slope past the knee '+ctx.END_TERM_SLOPE2);
  for(var s=1;s<=NS;s++){ var G=endless(s*7919); var r=drive(G, 1000+s, MAXD); out.push(r);
    if(s<=(+process.env.SHOW||5))console.log('seed '+s+': '+(r.alive?'ALIVE at ':'died at ')+r.depth+' m, falling '+r.vy+' u/s (terminal '+r.term+'), '+r.t+' s; before it: '+r.why+'; plans '+r.plans); }
  var ds=out.map(function(r){ return r.depth; }).sort(function(x,y){ return x-y; });
  console.log('depths', JSON.stringify(ds), 'median', ds[Math.floor(ds.length/2)], 'past 3000 m:', ds.filter(function(d){ return d>=3000; }).length+', past 4000 m:', ds.filter(function(d){ return d>=4000; }).length+' of '+ds.length, ((Date.now()-t0)/1000).toFixed(0)+'s');
}
