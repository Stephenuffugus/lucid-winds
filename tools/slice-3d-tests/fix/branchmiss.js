// Replays endlessChunk's draw order (ledges, then ffSegments lvl 1) and reports where a branch hosted verb can land.
function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
var ECH_H=100;
function chunk(salt,k,minOff){
  var top=4-k*ECH_H, bot=top-ECH_H;
  var rng=mulberry32((salt^(((k+1)*2654435761)>>>0)^0x5EED)>>>0);
  for(var side=-1;side<=1;side+=2){ for(var wy=(k===0)?4:top-rng()*9; wy>bot; wy-=9+rng()*6){ rng(); rng(); } }
  var y=(k===0)?-4:top-4, yEnd=bot+6, yCap=bot+1.6, minY=top-minOff, bag=[], out=null;
  function bagFF(){ var b=['shelfL','shelfR','branch','stack','shelfL','shelfR','mid','stack','stack'];
    for(var bi=b.length-1;bi>0;bi--){ var bj=Math.floor(rng()*(bi+1)); var bt=b[bi]; b[bi]=b[bj]; b[bj]=bt; } return b; }
  while(y>yEnd){
    if(!bag.length)bag=bagFF();
    var seg=bag.pop(); rng();
    if(seg==='shelfL'||seg==='shelfR'){ rng(); if(rng()<0.45){ rng(); rng(); } }
    else if(seg==='mid'){ rng(); }
    else if(seg==='branch'){ if(!out&&y<=minY)out={y:y,rel:top-y}; var nb=2+Math.floor(rng()*2); for(var i=0;i<nb;i++){ rng(); rng(); rng(); } }
    else if(seg==='stack'){ rng(); var skn=7+Math.floor(rng()*7); skn=Math.min(skn, Math.floor((y-yCap-0.575)/1.32)+1); for(var s=0;s<skn;s++)rng(); y-=skn*1.32+3.5; continue; }
    y-=8.5+rng()*5;
  }
  return out;
}
var r0=mulberry32(4242);
[12,4].forEach(function(minOff){
  var N=0, m1=0, m12=0;
  for(var t=0;t<6000;t++){ var salt=(r0()*4294967296)>>>0;
    for(var b=0;b<11;b++){ N++; var a=chunk(salt,3*b+1,minOff); if(!a){ m1++; var c=chunk(salt,3*b+2,minOff); if(!c)m12++; } } }
  console.log('minY top-'+minOff+': bands',N,'miss middle only',(100*m1/N).toFixed(1)+'%','miss middle and last',(100*m12/N).toFixed(2)+'%');
});
