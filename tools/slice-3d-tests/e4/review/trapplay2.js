// As played: a blade down knife falls onto the boss in the middle (hit 1, the boss hops to a side lane), lands on the net
// and is lobbed toward the boss's new lane. The player taps toward that lane (a hold of T steps starting S steps after the
// lob), then lets go. How many of these runs never end (the knife bouncing between the boss and the wall)?
var S=require('./sim.js');
function clearShaft(g){ var Wd=g.world; ['items','slabs','pads','crystals','thorns','wasps','planks','verbs','blocks'].forEach(function(k){ if(Wd[k])Wd[k]=[]; }); }
var seeds=(process.argv[2]||'77,1,2,3').split(',').map(Number), lim=+(process.argv[3]||60);
var stuckRope=0, stuckNet=0, tot=0, stuck=0, ex=[], cleared=0, skipped=0;
seeds.forEach(function(sd){
  for(var Sst=0;Sst<=120;Sst+=12)for(var T=6;T<=60;T+=6){
    var lobN=-1, side=0;
    var r=S.run({lvl:5, seed:sd, maxN:120*lim, setup:function(g,b){ clearShaft(g); g.x=0.3; g.y=b.y+20; g.vx=0; g.vy=-19; g.ang=Math.PI/2; g.w=0; },
      hold:function(n,g,b){ if(lobN<0&&b.hits===1&&b.lobs===1){ lobN=n; side=b.tx>g.x?1:-1; } return (lobN>=0&&n>=lobN+Sst&&n<lobN+Sst+T)?side:0; } });
    tot++; if(!r.done){ stuck++; if(r.ropeCut)stuckRope++; else stuckNet++; if(!r.ropeCut&&ex.length<6)ex.push('seed '+sd+' hold '+(side>0?'right':'left')+' from +'+Sst+' for '+T+' steps: after '+r.t+' s still in play, '+r.snd.wood+' wood sounds, knife x '+r.g.x.toFixed(2)+' boss x '+r.b.x+', hits '+r.hits+', lobs '+r.b.lobs+', net '+(r.b.netOn?'up':'down')+' | '+r.ev.join(' ')); }
    else { if(r.cleared)cleared++; if(r.skipped)skipped++; }
  } });
console.log('trapped after a rope cut', stuckRope, 'trapped with the net up', stuckNet); console.log('runs', tot, 'never ended in', lim, 's:', stuck, '| cleared', cleared, 'skipped', skipped); console.log(ex.join('\n'));
