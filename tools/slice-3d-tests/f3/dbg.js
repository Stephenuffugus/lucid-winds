var W=require('../e4/world.js'), ctx=W.ctx, vm=W.vm, SRC=W.SRC;
var m=SRC.match(/var BOSS_PTS=\d+, LOB_STEER=[0-9.]+;/); if(m){ vm.runInContext(m[0], ctx); vm.runInContext(W.grab('lobSteer'), ctx); }
var R=+process.argv[2], T=+process.argv[3], g=W.dive(5,77), b=g.world.boss; g.x=0.3; g.y=b.y+20; g.vx=0; g.vy=-19; g.ang=Math.PI/2; g.w=0;
var lobN=-1, side=0, ev=[];
for(var n=0;n<9000&&!g.done;n++){ var l0=b.lobs, h0=b.hits, m0=b.miss||0, in0=b.inside, hold=0; if(lobN>=0&&n>=lobN+R&&n<lobN+R+T)hold=side;
  W.step(g,1,hold); ctx.bossDraw(1/120);
  if(b.lobs>l0){ lobN=n; side=(b.tx>g.x)?1:-1; ev.push('n'+n+' LOB x'+g.x.toFixed(1)+' boss '+b.tx+' hold '+side); }
  if(b.hits>h0)ev.push('n'+n+' HIT'+b.hits+' x'+g.x.toFixed(1));
  if((b.miss||0)>m0)ev.push('n'+n+' MISS x'+g.x.toFixed(1)+' ang'+(((g.ang%6.283)+6.283)%6.283).toFixed(2));
  if(hold===0&&lobN>=0&&n===lobN+R+T)ev.push('n'+n+' release x'+g.x.toFixed(1)+' y-boss '+(g.y-b.y).toFixed(1)+' vy'+g.vy.toFixed(1)+' ang'+(((g.ang%6.283)+6.283)%6.283).toFixed(2)+' lob'+!!g.lob);
  if(b.skipped&&!ev.skip){ ev.skip=1; ev.push('n'+n+' SKIPPED'); } }
console.log(ev.slice(0,24).join('\n'));
