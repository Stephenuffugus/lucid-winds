// prove3 with the looser corridor (rule2) loaded first: single attempt over a range, then every missed line retried
var W=require('./world.js'); require('./rule2.js')(W);
var P=require('./prove3.js');
var a=process.argv.slice(2).map(Number), L0=a[0]||1, L1=a[1]||40, S0=a[2]||1, S1=a[3]||2, S={dives:0,withLine:0,cols:0,colsOk:0,clean:0,finished:0}, miss=[];
for(var lvl=L0;lvl<=L1;lvl++) for(var s=S0;s<=S1;s++){ var G=W.dive(lvl,s); W.ctx.__A=G.world; var req=W.vm.runInContext('cleanLine(__A, 9.2)', W.ctx); S.dives++; if(!req.length)continue; S.withLine++;
  var r=P.drive(G, req, 1000+lvl*7+s); S.cols+=r.cols; r.log.forEach(function(l){ if(l.cut===l.n)S.colsOk++; }); if(r.finished)S.finished++; if(r.clean)S.clean++; if(!r.log.every(function(l){ return l.cut===l.n; }))miss.push([lvl,s]); }
console.log(JSON.stringify(S)); var never=[];
miss.forEach(function(m){ var ok=false; for(var j=1;j<=6&&!ok;j++){ var G=W.dive(m[0],m[1]); W.ctx.__A=G.world; var req=W.vm.runInContext('cleanLine(__A, 9.2)', W.ctx); var r=P.drive(G, req, j*7919+m[0]*7+m[1]); ok=r.log.every(function(l){ return l.cut===l.n; }); if(ok)console.log('L'+m[0]+' s'+m[1]+' carved on attempt '+j); } if(!ok)never.push('L'+m[0]+' s'+m[1]); });
console.log('missed first time', miss.length, '; never carved in 6 attempts:', never.length, never.join(' '));
