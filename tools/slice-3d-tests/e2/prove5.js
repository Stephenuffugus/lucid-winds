// the proof on the rule after the E2 review (SRCF = the fixed page): single attempt, then every missed line retried
var W=require('./world.js'), P=require('./prove3.js');
var a=process.argv.slice(2).map(Number), L0=a[0]||1, L1=a[1]||40, S0=a[2]||1, S1=a[3]||4, S={dives:0,withLine:0,cols:0,colsOk:0,clean:0}, miss=[];
function line(G){ W.ctx.__A=G.world; return W.vm.runInContext('cleanLine(__A, 9.2, __A.floorY)', W.ctx); }
for(var lvl=L0;lvl<=L1;lvl++) for(var s=S0;s<=S1;s++){ var G=W.dive(lvl,s), req=line(G); S.dives++; if(!req.length)continue; S.withLine++;
  var r=P.drive(G, req, 1000+lvl*7+s); S.cols+=r.cols; r.log.forEach(function(l){ if(l.cut===l.n)S.colsOk++; }); if(r.clean)S.clean++; if(!r.log.every(function(l){ return l.cut===l.n; }))miss.push([lvl,s]); }
console.log(JSON.stringify(S)); var never=[];
miss.forEach(function(m){ var ok=false; for(var j=1;j<=6&&!ok;j++){ var G=W.dive(m[0],m[1]), req=line(G), r=P.drive(G, req, j*7919+m[0]*7+m[1]); ok=r.log.every(function(l){ return l.cut===l.n; }); if(ok)console.log('L'+m[0]+' s'+m[1]+' carved on attempt '+j); } if(!ok)never.push('L'+m[0]+' s'+m[1]); });
console.log('missed first time', miss.length, '; never carved in 6 attempts:', never.length, never.join(' '));
