var C=require('./ctl.js');
var G=[4.82,8,12,20,30,40,60], out=[];
G.forEach(function(g){ var maxOk=-1, row=[];
  for(var dx=0; dx<=11.41; dx+=0.5){ var pl=C.plan({x:0,y:0,vx:0,vy:-19,w:0,ang:Math.PI/2}, dx, -g); var ok=pl.cost<1; row.push(ok?'#':'.'); if(ok)maxOk=dx; }
  out.push('room '+String(g).padStart(5)+' u: '+row.join('')+'  max dx '+maxOk); });
console.log('from a finished carve, lateral distance 0 .. 11.4 by 0.5:\n'+out.join('\n'));
var S=[]; [6,10,15,20,30,45].forEach(function(dy){ var row=[]; for(var dx=-8;dx<=8.01;dx+=1){ var pl=C.plan({x:0,y:4,vx:0,vy:0,w:0,ang:0}, dx, 4-dy); row.push(pl.cost<1?'#':'.'); } S.push('from the start, column '+String(dy).padStart(3)+' u below, dx -8..8: '+row.join('')); });
console.log(S.join('\n'));
