var S=require('./sim.js');
var S1=+(process.argv[2]||0), T1=+(process.argv[3]||48), d1=+(process.argv[4]||1), S2=+(process.argv[5]||48), T2=+(process.argv[6]||24), d2=+(process.argv[7]||-1), secs=+(process.argv[8]||40);
var lobN=-1, side=0, tr=[];
var r=S.run({lvl:5, seed:77, maxN:120*secs, setup:function(g,b){ g.x=0.3; g.y=b.y+20; g.vx=0; g.vy=-19; g.ang=Math.PI/2; g.w=0; },
  hold:function(k,g,b){ if(lobN<0&&b.hits===1&&b.lobs===1){ lobN=k; side=b.tx>0?1:-1; } if(lobN<0)return 0; var m=k-lobN; return (m>=S1&&m<S1+T1)?d1*side:((m>=S2&&m<S2+T2)?d2*side:0); },
  each:function(k,g,b){ if(k%60===0)tr.push((k/120).toFixed(1)+'s x'+g.x.toFixed(2)+' y-floor '+(g.y-g.world.floorY).toFixed(2)+' vy'+g.vy.toFixed(1)+' ang'+((g.ang*180/Math.PI)%360).toFixed(0)+' w'+g.w.toFixed(2)+' net'+(b.netOn?1:0)+' wood'+(S.SND.wood||0)); } });
console.log(r.ev.join(' ')); console.log('done', r.done, 'popups', JSON.stringify(r.log.map(function(p){ return p.txt; }).slice(-12)));
console.log(tr.slice(-30).join('\n'));
