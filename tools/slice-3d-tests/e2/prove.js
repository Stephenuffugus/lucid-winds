// Drive the near human controller down a REAL dive (world.js) along a list of target columns; report each column's carve
var W=require('./world.js'), C=require('./ctl.js');
function columns(G){ var m=new Map(); G.world.slabs.forEach(function(s){ if(!m.has(s.stk))m.set(s.stk,[]); m.get(s.stk).push(s); });
  var cols=[]; m.forEach(function(a){ if(a.length<2)return; a.sort(function(u,v){ return v.y-u.y; }); cols.push({x:a[0].x, top:a[0].y+0.575, bot:a[a.length-1].y-0.575, n:a.length, slabs:a, stk:a[0].stk}); });
  cols.sort(function(a,b){ return b.top-a.top; }); return cols; }
function rnd(seed){ var a=seed>>>0; return function(){ a|=0; a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function drive(G, targets, opt){
  opt=opt||{}; var R=rnd(opt.jseed||1), ti=0, queue=[], log=[], bonk0=0, hold=0;
  var sfx=W.ctx.SFX; var woods=0; W.ctx.SFX=new Proxy({},{get:function(t,k){ return function(){ if(k==='wood')woods++; }; }});
  try{
  for(var n=0;n<30000&&!G.done;n++){
    var T=targets[ti];
    if(T&&G.y<T.bot-0.3){ log.push({i:ti, cut:T.slabs.filter(function(s){ return s.cut; }).length, n:T.n}); ti++; queue=[]; T=targets[ti]; }
    var carving=T&&G.y<T.top+2.2&&G.y>T.bot-0.3;
    if(n%C.TICK===0&&!carving){
      var tx=T?T.x:0, ty=T?T.top+2.1:G.world.floorY+1.6;
      var pl=C.plan({x:G.x,y:G.y,vx:G.vx,vy:G.vy,w:G.w,ang:G.ang}, tx, ty);
      // execute the first tick of the program, its edges jittered by up to 2 steps
      queue=pl.prog.slice(0, C.TICK); var j=Math.floor(R()*5)-2; if(j>0)queue=Array(j).fill(queue[0]===undefined?0:(n>0?hold:0)).concat(queue).slice(0,C.TICK); else if(j<0)queue=queue.slice(-j).concat(Array(-j).fill(queue[queue.length-1]||0));
    }
    hold=carving?0:(queue.length?queue.shift():0);
    W.step(G,1,hold);
  }
  } finally { W.ctx.SFX=sfx; }
  while(ti<targets.length){ var T2=targets[ti]; log.push({i:ti, cut:T2.slabs.filter(function(s){ return s.cut; }).length, n:T2.n, late:true}); ti++; }
  return {log:log, done:G.done, failed:!!G.failed, mult:G.mult, chips:G.chips||0, woods:woods, clean:log.every(function(l){ return l.cut===l.n; })&&G.done&&!G.failed};
}
module.exports={columns:columns, drive:drive};
if(require.main===module){
  var G=W.dive(1,77), cols=columns(G), r=drive(G, cols, {jseed:7});
  console.log(JSON.stringify(r));
}
