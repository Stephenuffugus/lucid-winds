// the boss lob's tap window: for a lob peaking PEAK u above the boss and lanes LANE apart, which (start, hold) taps toward the
// boss's new lane land a hit before the knife is back on the net, and does no input miss? Real step (world.js on e4.html)
var W=require('./world.js');
function trial(o){ var g=W.dive(5,77), b=g.world.boss; b.x=b.tx=o.dx; b.hits=1; b.lobs=1; b.inside=false;
  g.x=0; g.y=b.netY+1; g.vx=0; g.vy=Math.sqrt(2*21*((b.y+o.peak)-b.netY)); g.w=0; g.ang=Math.PI/2;
  for(var n=0;n<900;n++){ var l0=b.lobs; W.step(g,1,(n>=o.S&&n<o.S+o.T)?(o.dx>0?1:-1):0); if(b.hits>1)return 1; if(b.lobs>l0||g.done)return 0; } return 0; }
var peaks=[5,9,13], lanes=[3.6,4.2,4.8];
peaks.forEach(function(pk){ lanes.forEach(function(ln){ var line='peak +'+pk+' lane '+ln+': none '+trial({dx:ln,peak:pk,S:0,T:0})+'/'+trial({dx:2*ln,peak:pk,S:0,T:0});
  [0,24,48,72].forEach(function(S){ var ok1=0, ok2=0; for(var T=6;T<=60;T+=6){ ok1+=trial({dx:ln,peak:pk,S:S,T:T}); ok2+=trial({dx:2*ln,peak:pk,S:S,T:T}); } line+=' | start '+S+': near '+ok1+'/10 far '+ok2+'/10'; });
  console.log(line); }); });
