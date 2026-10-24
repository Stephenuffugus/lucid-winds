// For each dive whose line a single attempt missed, try again with other jitter seeds: a line is clearable when any attempt
// carves every required slab (the run reaching the floor is reported apart: that is the base game, not the line)
var W=require('./world.js'), P=require('./prove3.js'), fs=require('fs');
if(W.SRC.indexOf('function cleanLine(')<0)W.vm.runInContext(fs.readFileSync(__dirname+'/cleanline.es5.js','utf8'), W.ctx);
var list=process.argv.slice(2).map(function(a){ return a.split('.').map(Number); }), out=[];
list.forEach(function(ls){ var lvl=ls[0], s=ls[1], best=null;
  for(var j=1;j<=6;j++){ var G=W.dive(lvl,s); W.ctx.__A=G.world; var req=W.vm.runInContext('cleanLine(__A, 9.2)', W.ctx);
    var r=P.drive(G, req, j*7919+lvl*7+s), full=r.log.every(function(x){ return x.cut===x.n; });
    if(full){ best={attempt:j, finished:r.finished}; break; } }
  out.push('L'+lvl+' s'+s+': '+(best?('line carved on attempt '+best.attempt+(best.finished?', floor reached':', died after the line')):'NO attempt carved the whole line')); });
console.log(out.join('\n'));
