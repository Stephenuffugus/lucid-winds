var C=require('./ctl.js'), out=[];
[60,90,130].forEach(function(g){ var row=[], mx=-1; for(var dx=0; dx<=11.41; dx+=0.5){ var pl=C.plan({x:0,y:0,vx:0,vy:-19,w:0,ang:Math.PI/2}, dx, -g); var ok=pl.cost<1; row.push(ok?'#':'.'); if(ok)mx=dx; } out.push('carve room '+g+': '+row.join('')+' max '+mx); });
[60,90,130].forEach(function(dy){ var row=[]; for(var dx=-8;dx<=8.01;dx+=1){ var pl=C.plan({x:0,y:4,vx:0,vy:0,w:0,ang:0}, dx, 4-dy); row.push(pl.cost<1?'#':'.'); } out.push('start '+dy+' u, dx -8..8: '+row.join('')); });
console.log(out.join('\n'));
