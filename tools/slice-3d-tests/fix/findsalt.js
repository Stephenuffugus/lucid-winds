function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
var WIDS=['mossy_canyon','frost_chasm','ember_kiln','glowcave','orchard_loft','lantern_night','deep_tide','clockwork_well'];
function chunkBranch(salt,k,minOff){
  var top=4-k*100, bot=top-100, rng=mulberry32((salt^(((k+1)*2654435761)>>>0)^0x5EED)>>>0);
  for(var side=-1;side<=1;side+=2){ for(var wy=(k===0)?4:top-rng()*9; wy>bot; wy-=9+rng()*6){ rng(); rng(); } }
  var y=(k===0)?-4:top-4, yEnd=bot+6, yCap=bot+1.6, minY=top-minOff, bag=[];
  function bagFF(){ var b=['shelfL','shelfR','branch','stack','shelfL','shelfR','mid','stack','stack']; for(var bi=b.length-1;bi>0;bi--){ var bj=Math.floor(rng()*(bi+1)); var bt=b[bi]; b[bi]=b[bj]; b[bj]=bt; } return b; }
  while(y>yEnd){ if(!bag.length)bag=bagFF(); var seg=bag.pop(); rng();
    if(seg==='shelfL'||seg==='shelfR'){ rng(); if(rng()<0.45){ rng(); rng(); } } else if(seg==='mid'){ rng(); }
    else if(seg==='branch'){ if(y<=minY)return y; var nb=2+Math.floor(rng()*2); for(var i=0;i<nb;i++){ rng(); rng(); rng(); } }
    else if(seg==='stack'){ rng(); var skn=7+Math.floor(rng()*7); skn=Math.min(skn, Math.floor((y-yCap-0.575)/1.32)+1); for(var s=0;s<skn;s++)rng(); y-=skn*1.32+3.5; continue; }
    y-=8.5+rng()*5; }
  return null;
}
var found=0;
for(var salt=1; salt<4000 && found<6; salt++){
  var r=mulberry32(((((1*1597334677)>>>0)^0xFA11)^salt)>>>0), FWI=Math.floor(r()*8);
  for(var b=1;b<=2;b++){ var w=WIDS[(FWI+b)%8]; if(w!=='orchard_loft'&&w!=='lantern_night')continue;
    var old=chunkBranch(salt,3*b+1,12); if(old!=null)continue;
    var at=null; for(var j=0;j<3&&at==null;j++){ var yy=chunkBranch(salt,3*b+j,4); if(yy!=null)at={k:3*b+j,y:yy}; }
    if(at){ found++; console.log(JSON.stringify({salt:salt, FWI:FWI, band:b, world:w, newChunk:at.k, newY:+at.y.toFixed(2)})); } }
}
