// Part F3 (24 Oct): does the boss fight forgive a steering thumb? The real step and boss code (e4 world.js on SRCF, with
// lobSteer and the new constants pulled in). At every lob, after a reaction of R steps, hold TOWARD the boss's lane for T
// steps: reactions 0.1 to 0.4 s, holds 0.05 to 1.5 s, five dives. Then the ropes: from each lane, a hold toward the rope on
// the far side, which must still cut. And the grade: misses -> x5 / x3 / x2.
var W=require('../e4/world.js'), ctx=W.ctx, vm=W.vm, SRC=W.SRC;
// (world.js pulls the F3 lob code when the page has it)
function fight(R, T, seed){ var g=W.dive(5,seed), b=g.world.boss; g.x=0.3; g.y=b.y+20; g.vx=0; g.vy=-19; g.ang=Math.PI/2; g.w=0;
  var lobN=-1, side=0;
  for(var n=0;n<9000&&!g.done;n++){ var l0=b.lobs, hold=0; if(lobN>=0&&n>=lobN+R&&n<lobN+R+T)hold=side;
    W.step(g,1,hold); ctx.bossDraw(1/120); if(b.lobs>l0){ lobN=n; side=(b.tx>g.x)?1:-1; } }
  return {cleared:b.cleared, skipped:b.skipped, failed:!!g.failed, miss:b.miss||0, grade:g.bossGrade||0, pts:g.bossPts||0}; }
var rows=[], tot=0, ok=0, grades={};
for(var R=12;R<=48;R+=12){ var line=[]; for(var T=6;T<=180;T+=12){ var c=0; [77,5,9,13,21].forEach(function(sd){ var r=fight(R,T,sd); tot++; if(r.cleared&&!r.failed){ ok++; c++; } grades[r.grade]=(grades[r.grade]||0)+1; }); line.push(c); }
  rows.push('react '+(R/120).toFixed(2)+'s  holds 0.05..1.45s cleared of 5: '+line.join(' ')); }
console.log((process.env.SRCF||'index.html').split('/').pop(), 'cleared', ok, 'of', tot); console.log(rows.join('\n')); console.log('grades', JSON.stringify(grades));
[-4.8,0,4.8].forEach(function(lane){ var cut=[]; for(var T=6;T<=180;T+=12){ var g=W.dive(5,77), b=g.world.boss; b.hits=1; b.lobs=1; b.x=b.tx=lane; g.x=lane; g.y=b.netY+1; g.vx=0; g.vy=Math.sqrt(2*21*(b.y+5-b.netY)); g.ang=Math.PI/2; g.w=0; g.lob=true;
  var side=lane<=0?1:-1; for(var n=0;n<900&&!g.done;n++){ var l0=b.lobs; W.step(g,1,(n>=24&&n<24+T)?side:0); if(b.ropeCut||b.lobs>l0)break; } if(b.ropeCut)cut.push(T); }
  console.log('boss in lane', lane, ': a hold away from it cuts the far rope with holds of', cut.length?cut[0]+'..'+cut[cut.length-1]+' steps ('+cut.length+' of 15)':'NONE'); });
