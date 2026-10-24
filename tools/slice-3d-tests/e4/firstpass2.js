// A knife entering the boss chamber from the shaft: uniform x, angle and spin, falling at terminal speed, no input.
// Counts rope cuts before any lob or hit (the review's "first pass" finding), and how each entry ends.
var W=require('./world.js');
var cuts=0, n=0, hits1=0, deaths=0, ex=[], dIn=0, dOut=0, dex=[];
[5,10,15,20,25,30,35,40].forEach(function(L){
  for(var xi=0;xi<24;xi++)for(var ai=0;ai<12;ai++)for(var wi=0;wi<3;wi++){
    var g=W.dive(L, 77), B=g.world.boss, SW=g.world.SW;
    g.x=-SW+1.2+(2*SW-2.4)*xi/23; g.y=B.y+16; g.vx=0; g.vy=-19; g.ang=ai*Math.PI/6; g.w=[0,4,-4][wi];
    var cut=false, k;
    for(k=0;k<600&&!g.done;k++){ W.step(g,1,0); if(B.ropeCut&&B.lobs===0&&B.hits===0){ cut=true; break; } if(B.lobs>0||B.hits>0)break; }
    n++; if(cut){ cuts++; if(ex.length<4)ex.push(L+' x'+(g.x).toFixed(2)+' a'+(ai*30)+' w'+[0,4,-4][wi]); }
    if(B.hits>0&&!cut)hits1++; if(g.failed){ deaths++; if(g.y<B.y+12){ dIn++; if(dex.length<4)dex.push(L+" y"+(g.y-B.y).toFixed(1)+" x"+g.x.toFixed(2)); } else dOut++; }
  } });
console.log('deaths in the padded chamber', dIn, 'above it', dOut, dex.join(' ; ')); console.log('entries', n, 'first pass rope cuts', cuts, '('+(100*cuts/n).toFixed(1)+'%)', 'first pass hits', hits1, 'deaths', deaths, ex.join(' ; '));
