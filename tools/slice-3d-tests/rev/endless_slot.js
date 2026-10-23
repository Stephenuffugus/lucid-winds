// Replays endlessChunk's rng draw order (ledges, then ffSegments at lvl 1) to find where a 'stack' hosted verb lands.
function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
var NF=16, ECH_H=100;
function chunk(salt,k){
  var top=4-k*ECH_H, bot=top-ECH_H;
  var rng=mulberry32((salt^(((k+1)*2654435761)>>>0)^0x5EED)>>>0);
  for(var side=-1;side<=1;side+=2){ for(var wy=(k===0)?4:top-rng()*9; wy>bot; wy-=9+rng()*6){ rng(); rng(); } }
  var y=(k===0)?-4:top-4, yEnd=bot+6, yCap=bot+1.6, vb={minY:top-12, done:false}, bag=[], out=null;
  function bagFF(){ var b=['shelfL','shelfR','branch','stack','shelfL','shelfR','mid','stack','stack'];
    for(var bi=b.length-1;bi>0;bi--){ var bj=Math.floor(rng()*(bi+1)); var bt=b[bi]; b[bi]=b[bj]; b[bj]=bt; } return b; }
  while(y>yEnd){
    if(!bag.length)bag=bagFF();
    var seg=bag.pop(); rng(); // f
    if(seg==='shelfL'||seg==='shelfR'){ rng(); if(rng()<0.45){ rng(); rng(); } }
    else if(seg==='mid'){ rng(); }
    else if(seg==='branch'){ var nb=2+Math.floor(rng()*2); for(var i=0;i<nb;i++){ rng(); rng(); rng(); } }
    else if(seg==='stack'){
      var skx=(rng()*2-1)*(9.2-3.5); var skn=7+Math.floor(rng()*7);
      skn=Math.min(skn, Math.floor((y-yCap-0.575)/1.32)+1);
      var vbS=!vb.done&&y<=vb.minY&&skn*1.32+3.5>=11;
      for(var s=0;s<skn;s++)rng();
      if(vbS){ vb.done=true; out={y:y, rel:y-bot, skn:skn, skx:skx}; }
      y-=skn*1.32+3.5; continue;
    }
    y-=8.5+rng()*5;
  }
  return out;
}
var N=0, placed=0, crossBot=0, belowCap=0, cushBelow=0, none=0, s=12345;
var r0=mulberry32(99);
for(var t=0;t<20000;t++){
  var salt=(r0()*4294967296)>>>0;
  for(var k=1;k<=10;k+=3){ N++; var o=chunk(salt,k); if(!o){ none++; continue; } placed++;
    if(o.rel-10.5<0)crossBot++;          // the r 2 collider reaches below the chunk line
    if(o.rel-10.1<0)cushBelow++;          // the drawn cushion reaches below it
    if(o.rel-10.5<1.6)belowCap++;         // below yCap (the slab rule)
  }
}
console.log({chunks:N, placed:placed, noVerb:none, colliderBelowLine:crossBot, cushionBelowLine:cushBelow, footBelowYcap:belowCap,
  pctCollider:(100*crossBot/placed).toFixed(2)+'%', pctCushion:(100*cushBelow/placed).toFixed(2)+'%', pctBelowCap:(100*belowCap/placed).toFixed(2)+'%'});
