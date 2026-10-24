// near human boss fights (real step, world.js on e4.html): fall onto the boss in the middle; at every bounce wait a reaction
// of R steps, then hold toward the boss's lane for T steps. And the ropes: from each lane, a hold toward the nearer rope.
var W=require('./world.js');
function fight(R, T, seed){ var g=W.dive(5,seed), b=g.world.boss, log=[]; g.x=0.3; g.y=b.y+20; g.vx=0; g.vy=-19; g.ang=Math.PI/2; g.w=0;
  var bounceN=-1, side=0;
  for(var n=0;n<9000&&!g.done;n++){ var l0=b.lobs, h0=b.hits, hold=0; if(bounceN>=0&&n>=bounceN+R&&n<bounceN+R+T)hold=side;
    W.step(g,1,hold); W.ctx.bossDraw(1/120);
    if(b.lobs>l0){ bounceN=n; side=(b.tx>g.x)?1:-1; log.push('lob@'+g.x.toFixed(1)+'>'+b.tx); } if(b.hits>h0)log.push('HIT'+b.hits); }
  return {hits:b.hits, cleared:b.cleared, skipped:b.skipped, done:g.done, failed:!!g.failed, t:+g.t.toFixed(1), log:log.join(' ')}; }
var tot=0, ok=0, fails=[];
for(var R=12;R<=48;R+=12)for(var T=6;T<=60;T+=6)[77,5,9,13,21].forEach(function(sd){ var r=fight(R,T,sd); tot++; if(r.cleared&&!r.failed&&r.done)ok++; else fails.push('R'+R+' T'+T+' s'+sd+' '+JSON.stringify(r)); });
console.log('fights cleared:', ok, 'of', tot, '(reactions 0.1 to 0.4 s, holds 0.05 to 0.5 s, five dives)'); console.log(fails.slice(0,6).join('\n'));
[0,-4.8,4.8].forEach(function(x0){ var side=x0<0?-1:1, hit=[], died=0; for(var T=6;T<=90;T+=6){ var g=W.dive(5,77), b=g.world.boss; b.hits=1; b.lobs=1; g.x=x0; g.y=b.netY+1; g.vx=0; g.vy=Math.sqrt(2*21*((b.y+5)-b.netY)); g.ang=Math.PI/2; g.w=0;
  for(var n=0;n<900;n++){ var l0=b.lobs; W.step(g,1,(n>=24&&n<24+T)?side:0); if(b.ropeCut||b.lobs>l0||g.done)break; } if(b.ropeCut){ hit.push(T); for(var m=0;m<900&&!g.done;m++)W.step(g,1,0); if(g.failed)died++; } } console.log("rope from lane", x0, "cut by a hold of", hit.join(",")||"none", "then died", died); });
