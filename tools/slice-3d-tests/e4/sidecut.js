var W=require('./world.js');
[-4.8,4.8].forEach(function(lane){ var side=lane<0?-1:1, cut=[];
  for(var T=4;T<=40;T+=2){ var g=W.dive(5,77), b=g.world.boss; b.hits=1; b.lobs=1; b.x=b.tx=lane; g.x=lane; g.y=b.netY+1; g.vx=0; g.vy=Math.sqrt(2*21*((b.y+5)-b.netY)); g.w=0; g.ang=Math.PI/2;
    for(var n=0;n<900&&!g.done&&b.tx===lane;n++){ W.step(g,1,(n>=24&&n<24+T)?side:0); W.ctx.bossDraw(1/120); if(b.ropeCut)break; } if(b.ropeCut)cut.push(T); }
  console.log(process.env.SRCF.split('/').pop(), 'lane', lane, 'cut by holds of', cut.join(',')||'none'); });
