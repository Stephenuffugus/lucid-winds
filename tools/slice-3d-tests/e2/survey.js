// What a numbered dive's columns look like: per dive the stack columns (stk groups of 2+ slabs), their x, top, slab count,
// the vertical gap to the next column and what lies in between
var W=require('./world.js');
function columns(G){ var m=new Map(); G.world.slabs.forEach(function(s){ if(!m.has(s.stk))m.set(s.stk,[]); m.get(s.stk).push(s); });
  var cols=[]; m.forEach(function(a){ if(a.length<2)return; a.sort(function(u,v){ return v.y-u.y; }); cols.push({x:a[0].x, top:a[0].y+0.575, bot:a[a.length-1].y-0.575, n:a.length, slabs:a}); });
  cols.sort(function(a,b){ return b.top-a.top; }); return cols; }
var hist={}, gaps=[], dxs=[], nc=[];
for(var lvl=1;lvl<=40;lvl+=3) for(var s=1;s<=20;s++){ var G=W.dive(lvl,s), C=columns(G); nc.push(C.length);
  for(var i=0;i+1<C.length;i++){ gaps.push(C[i].bot-C[i+1].top); dxs.push(Math.abs(C[i+1].x-C[i].x)); } }
function q(a,p){ a=a.slice().sort(function(x,y){return x-y;}); return a[Math.floor(p*(a.length-1))].toFixed(2); }
console.log('columns per dive: min', Math.min.apply(null,nc), 'median', q(nc,0.5), 'max', Math.max.apply(null,nc));
console.log('vertical gap between consecutive columns: p10', q(gaps,0.1), 'p50', q(gaps,0.5), 'p90', q(gaps,0.9), 'min', q(gaps,0));
console.log('lateral distance: p10', q(dxs,0.1), 'p50', q(dxs,0.5), 'p90', q(dxs,0.9));
var G=W.dive(1,77), C=columns(G); C.forEach(function(c){ console.log('  col x', c.x.toFixed(2), 'top', c.top.toFixed(1), 'bot', c.bot.toFixed(1), 'n', c.n); });
