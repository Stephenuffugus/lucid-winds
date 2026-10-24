var A=require('child_process');
function lines(src){ return JSON.parse(A.execSync('SRCF='+src+' node -e "var W=require(\'./world.js\'), o={}; for(var l=3;l<=40;l++)for(var s=77;s<83;s++){ var g=W.dive(l,s), m=new Map(); g.world.slabs.forEach(function(x){ if(x.req){ if(!m.has(x.stk))m.set(x.stk,[]); m.get(x.stk).push(x); } }); o[l+\'.\'+s]=Array.from(m.values()).map(function(a){ a.sort(function(u,v){return v.y-u.y;}); return a[0].x.toFixed(2)+\'@\'+a[0].y.toFixed(2)+\'x\'+a.length; }).sort().join(\'|\'); } console.log(JSON.stringify(o));"', {cwd:__dirname, maxBuffer:1<<26}).toString()); }
var base=lines('/tmp/claude-1000/ssb/e2fix/e2.html'), nw=lines('/tmp/claude-1000/ssb/e2fix/nowasp.html'), ng=lines('/tmp/claude-1000/ssb/e2fix/nogourd.html');
var dw=Object.keys(base).filter(function(k){ return base[k]!==nw[k]; }), dg=Object.keys(base).filter(function(k){ return base[k]!==ng[k]; });
console.log('wasp rule changes', dw.length, dw.slice(0,4).map(function(k){ return k+' '+JSON.stringify(base[k]); }).join(' ; '));
console.log('gourd margin changes', dg.length, dg.slice(0,4).map(function(k){ return k+' '+JSON.stringify(base[k]); }).join(' ; '));
