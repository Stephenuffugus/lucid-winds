// The proposed Endless rule: a band's verb takes the first host slot at or below top-4 in the band's chunks, in build order
// (band 0 from chunk 1). Measures how many bands get their verb, for branch hosts and for the ice's stack host.
function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
var ECH_H=100;
function chunk(salt,k,host){
  var top=4-k*ECH_H, bot=top-ECH_H;
  var rng=mulberry32((salt^(((k+1)*2654435761)>>>0)^0x5EED)>>>0);
  for(var side=-1;side<=1;side+=2){ for(var wy=(k===0)?4:top-rng()*9; wy>bot; wy-=9+rng()*6){ rng(); rng(); } }
  var y=(k===0)?-4:top-4, yEnd=bot+6, yCap=bot+1.6, minY=top-4, bag=[], out=null;
  function bagFF(){ var b=['shelfL','shelfR','branch','stack','shelfL','shelfR','mid','stack','stack'];
    for(var bi=b.length-1;bi>0;bi--){ var bj=Math.floor(rng()*(bi+1)); var bt=b[bi]; b[bi]=b[bj]; b[bj]=bt; } return b; }
  while(y>yEnd){
    if(!bag.length)bag=bagFF();
    var seg=bag.pop(); rng();
    if(seg==='shelfL'||seg==='shelfR'){ rng(); if(rng()<0.45){ rng(); rng(); } }
    else if(seg==='mid'){ rng(); }
    else if(seg==='branch'){ if(host==='branch'&&!out&&y<=minY)out={y:y}; var nb=2+Math.floor(rng()*2); for(var i=0;i<nb;i++){ rng(); rng(); rng(); } }
    else if(seg==='stack'){ rng(); var skn=7+Math.floor(rng()*7); skn=Math.min(skn, Math.floor((y-yCap-0.575)/1.32)+1);
      if(host!=='branch'&&!out&&y<=minY&&skn*1.32+3.5>=11&&(host==='loaf'||y-10.5>=yCap))out={y:y, rel:y-bot};
      for(var s=0;s<skn;s++)rng(); y-=skn*1.32+3.5; continue; }
    y-=8.5+rng()*5;
  }
  return out;
}
var r0=mulberry32(777);
['branch','ice','loaf'].forEach(function(host){
  var N=0, miss=0, miss0=0, n0=0, where=[0,0,0];
  for(var t=0;t<5000;t++){ var salt=(r0()*4294967296)>>>0;
    for(var b=0;b<11;b++){ N++; if(b===0)n0++; var got=-1;
      for(var j=(b===0?1:0);j<3&&got<0;j++){ if(chunk(salt,3*b+j,host))got=j; }
      if(got<0){ miss++; if(b===0)miss0++; } else where[got]++; } }
  console.log(host,'bands',N,'missed',(100*miss/N).toFixed(2)+'%','band 0 missed',(100*miss0/n0).toFixed(2)+'%','placed in chunk 0/1/2 of the band',where.map(function(w){ return (100*w/N).toFixed(1)+'%'; }).join(' / '));
});
