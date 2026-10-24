// The proof for Clean Slice: the near human controller (ctl2) drives the REAL dive (world.js: the game's own build and step)
// down its line (cleanLine, from the game's code when it is there, else the scratch rule) and lands; every required slab must
// be cut and the dive must finish. Prints per dive and a summary. Usage: node prove2.js <lvlFrom> <lvlTo> <seeds> [jseed]
var W=require('./world.js'), C=require('./ctl3.js'), fs=require('fs');
if(W.SRC.indexOf('function cleanLine(')<0)W.vm.runInContext(fs.readFileSync(__dirname+'/cleanline.es5.js','utf8'), W.ctx);
function rnd(seed){ var a=seed>>>0; return function(){ a|=0; a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function hazards(A){ W.ctx.__A=A; var P=W.vm.runInContext('clParts(__A, 9.2)', W.ctx);
  return {B:P.B.filter(function(b){ return !b.gate; }), W:(A.wasps||[]).map(function(w){ return {cx:w.cx, y:w.y, r:w.r, range:w.range, speed:w.speed, phase:w.phase}; })}; }
/* a thumb's timing: every edge of every hold moves by up to 2 steps either way */
function blur(p, R){ var q=p.slice(), i=1; while(i<q.length){ if(q[i]!==q[i-1]){ var d=Math.floor(R()*5)-2, v=q[i]; if(d>0){ for(var j=i;j<Math.min(q.length,i+d);j++)q[j]=q[i-1]; } else if(d<0){ for(var j2=Math.max(0,i+d);j2<i;j2++)q[j2]=v; } i+=Math.max(1,d+1); } else i++; } return q; }
function drive(G, req, jseed){
  var plans=0;
  var R=rnd(jseed||1), ti=0, hold=0, nextDec=0, prog=[], pi=0, log=[], Hz=hazards(G.world), woods=0, sfx=W.ctx.SFX;
  W.ctx.SFX=new Proxy({},{get:function(t,k){ return function(){ if(k==='wood')woods++; }; }});
  try{ for(var n=0;n<40000&&!G.done;n++){
    var T=req[ti];
    while(T&&(T.slabs.every(function(s){ return s.cut; })||G.y<T.last.y-1.5)){ log.push({i:ti, cut:T.slabs.filter(function(s){ return s.cut; }).length, n:T.slabs.length}); ti++; T=req[ti]; }
    var carving=T&&G.y<T.top.y+2.3&&Math.abs(G.x-T.x)<3.2;
    if(n>=nextDec){ nextDec=n+C.TICK+Math.floor(R()*5)-2;
      if(carving){ prog=[]; pi=0; }
      else { var ty=T?T.top.y+2.1:G.world.floorY+2.2, tx=T?T.x:G.x, wx=T?1:0, st={x:G.x,y:G.y,vx:G.vx,vy:G.vy,w:G.w,ang:G.ang};
        /* a thumb commits: keep the move while it still arrives well, plan again only when it does not */
        var rest=prog.slice(pi), far=C.timeTo(st,ty)>C.HOR, keep=C.score(st, rest, tx, ty, Hz, G.t, wx, far)<(far?2:0.5);
        if(!keep){ var pl=C.plan(st, tx, ty, Hz, G.t, wx); prog=blur(pl.prog, R); pi=0; plans++; } } }
    hold=pi<prog.length?prog[pi++]:0;
    W.step(G,1,hold);
  } } finally { W.ctx.SFX=sfx; }
  while(ti<req.length){ var T2=req[ti]; log.push({i:ti, cut:T2.slabs.filter(function(s){ return s.cut; }).length, n:T2.slabs.length}); ti++; }
  var all=log.every(function(l){ return l.cut===l.n; });
  return {plans:plans, cols:req.length, cut:log.reduce(function(a,l){ return a+l.cut; },0), of:log.reduce(function(a,l){ return a+l.n; },0), finished:G.done&&!G.failed, chips:G.chips||0, clean:all&&G.done&&!G.failed, log:log};
}
module.exports={drive:drive, hazards:hazards};
if(require.main===module){
  var a=process.argv.slice(2).map(Number), L0=a[0]||1, L1=a[1]||40, NS=a[2]||3, J=a[3]||1, S={dives:0, withLine:0, clean:0, colsOk:0, cols:0, finished:0}, bad=[];
  var t0=Date.now();
  for(var lvl=L0;lvl<=L1;lvl++) for(var s=1;s<=NS;s++){ var G=W.dive(lvl,s); W.ctx.__A=G.world; var req=W.vm.runInContext('cleanLine(__A, 9.2)', W.ctx);
    S.dives++; if(!req.length)continue; S.withLine++;
    var r=drive(G, req, J*1000+lvl*7+s); S.cols+=r.cols; r.log.forEach(function(l){ if(l.cut===l.n)S.colsOk++; }); if(r.finished)S.finished++; if(r.clean)S.clean++; else bad.push('L'+lvl+' s'+s+' '+JSON.stringify(r)); }
  console.log(JSON.stringify(S), ((Date.now()-t0)/1000).toFixed(0)+'s'); console.log(bad.slice(0,15).join('\n'));
}
