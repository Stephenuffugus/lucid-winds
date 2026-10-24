// the boss with the aimed lob (real step, world.js on e4.html): a blade down knife with no input, a handle down one, a knife
// arriving off the middle, the ropes from each lane, many dives and levels (5, 10 ... 40)
var W=require('./world.js');
function run(o){ var g=W.dive(o.lvl||5,o.seed||77), b=g.world.boss, log=[]; g.x=o.x||0.3; g.y=b.y+20; g.vx=0; g.vy=-19; g.ang=o.ang!=null?o.ang:Math.PI/2; g.w=0;
  for(var n=0;n<9000&&!g.done;n++){ var l0=b.lobs, h0=b.hits; W.step(g,1,o.hold?o.hold(n,g,b):0); W.ctx.bossDraw(1/120); if(b.lobs>l0)log.push('lob'); if(b.hits>h0)log.push('HIT'+b.hits); }
  return {hits:b.hits, cleared:b.cleared, skipped:b.skipped, failed:!!g.failed, done:g.done, t:+g.t.toFixed(1), mult:g.mult, log:log.join(' ')}; }
console.log('blade down, no input:', JSON.stringify(run({})));
console.log('handle down, no input:', JSON.stringify(run({ang:-Math.PI/2})));
console.log('arriving 2 u off the middle, no input:', JSON.stringify(run({x:2})));
var tot=0, ok=0, bad=[]; for(var l=5;l<=40;l+=5)for(var sd=1;sd<=6;sd++){ var r=run({lvl:l, seed:sd}); tot++; if(r.cleared&&!r.failed)ok++; else bad.push('L'+l+'s'+sd+' '+JSON.stringify(r)); }
console.log('levels 5..40, 6 dives each, blade down no input: cleared', ok, 'of', tot); console.log(bad.slice(0,4).join('\n'));
[0,-4.8,4.8].forEach(function(lane){ var cut=[], died=0; for(var T=6;T<=60;T+=6){ var g=W.dive(5,77), b=g.world.boss; b.hits=1; b.lobs=1; b.x=b.tx=lane; g.x=lane; g.y=b.netY+1; g.vx=0; g.vy=Math.sqrt(2*21*((b.y+5)-b.netY)); g.ang=Math.PI/2; g.w=0;
  var side=lane<0?-1:1; for(var n=0;n<900&&!g.done;n++){ var l0=b.lobs; W.step(g,1,(n>=24&&n<24+T)?side:0); if(b.ropeCut||b.lobs>l0)break; }
  if(b.ropeCut){ cut.push(T); for(var m=0;m<1200&&!g.done;m++)W.step(g,1,0); if(g.failed)died++; } } console.log('rope from lane', lane, 'cut by a hold of', cut.join(',')||'none', '; then died', died); });
