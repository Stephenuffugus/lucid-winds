#!/bin/bash
# fresh seeds: single attempt over levels 1..40 x seeds 5..8, then every missed line retried
cd /tmp/claude-1000/ssb/e2
node -e "
var W=require('./world.js'), P=require('./prove3.js'), fs=require('fs');
if(W.SRC.indexOf('function cleanLine(')<0)W.vm.runInContext(fs.readFileSync(__dirname+'/cleanline.es5.js','utf8'), W.ctx);
var S={dives:0,withLine:0,cols:0,colsOk:0,clean:0,finished:0}, miss=[];
for(var lvl=1;lvl<=40;lvl++) for(var s=5;s<=8;s++){ var G=W.dive(lvl,s); W.ctx.__A=G.world; var req=W.vm.runInContext('cleanLine(__A, 9.2)', W.ctx); S.dives++; if(!req.length)continue; S.withLine++;
  var r=P.drive(G, req, 1000+lvl*7+s); S.cols+=r.cols; r.log.forEach(function(l){ if(l.cut===l.n)S.colsOk++; }); if(r.finished)S.finished++; if(r.clean)S.clean++; if(!r.log.every(function(l){ return l.cut===l.n; }))miss.push(lvl+'.'+s); }
console.log(JSON.stringify(S)); console.log('MISSED '+miss.join(' '));
" > sweep2.log 2>&1
M=$(grep '^MISSED' sweep2.log | cut -c8-); [ -n "$M" ] && node attempts.js $M >> sweep2.log 2>&1
echo DONE >> sweep2.log
