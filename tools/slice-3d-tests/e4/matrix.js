// fight.js's near-human, tabulated: cleared fights by hold length T (steps of 1/120 s) and reaction R, five dives each;
// plus the same player who only taps when the lob would MISS (looks at where the knife will come down, then corrects).
var W=require('./world.js');
function fight(R, T, seed, smart){ var g=W.dive(5,seed), b=g.world.boss; g.x=0.3; g.y=b.y+20; g.vx=0; g.vy=-19; g.ang=Math.PI/2; g.w=0;
  var bounceN=-1, side=0;
  for(var n=0;n<9000&&!g.done;n++){ var l0=b.lobs, hold=0; if(bounceN>=0&&n>=bounceN+R&&n<bounceN+R+T)hold=side;
    W.step(g,1,hold); W.ctx.bossDraw(1/120);
    if(b.lobs>l0){ bounceN=n; var need=b.tx-g.x;
      if(smart){ /* where does the lob come down? the drift it will carry is vx*(1-0.5^T)/ln2; tap only if that misses by a body */
        var gF=21, v0=g.vy, Tf=v0/gF+Math.sqrt(2*3/gF), land=g.x+g.vx*(1-Math.pow(0.5,Tf))/Math.LN2; side=Math.abs(land-b.tx)>2?((b.tx>land)?1:-1):0; }
      else side=(b.tx>g.x)?1:-1; } }
  return {cleared:b.cleared, skipped:b.skipped, done:g.done, failed:!!g.failed}; }
var rows=[];
[false,true].forEach(function(smart){ for(var T=6;T<=60;T+=6){ var ok=0, tot=0, dead=0, open=0; for(var R=12;R<=48;R+=12)[77,5,9,13,21].forEach(function(sd){ var r=fight(R,T,sd,smart); tot++; if(r.cleared&&r.done&&!r.failed)ok++; if(r.failed)dead++; if(!r.done)open++; });
  rows.push((smart?'smart ':'blind ')+'hold '+(T/120).toFixed(2)+'s: cleared '+ok+' of '+tot+(dead?' DIED '+dead:'')+(open?' NOT ENDED '+open:'')); } });
console.log(rows.join('\n'));
