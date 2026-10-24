// A near human Freefall controller: it decides every 0.1 s (a reaction), plans a program of at most two holds (wait, hold a
// side, wait, hold a side, each a whole number of 0.1 s ticks) with the game's own free fall integrator (no contacts), aims
// to arrive over the next target column blade down, slow and still, and each hold's edges are jittered by up to 2 steps
// (17 ms) as a thumb would. While the knife is carving a column it keeps its hands off.
var DT=1/120, TICK=12;
function kin(st, prog, untilY){   // the free fall step of stepWorld for the knife alone; prog: array of holds per step
  var x=st.x, y=st.y, vx=st.vx, vy=st.vy, w=st.w, ang=st.ang, i=0;
  while(y>untilY && i<4000){ var hd=prog[i]||0; vy-=21*DT; if(vy<-19)vy=-19;
    if(hd){ vx+=hd*30*DT; w+=hd*17*DT; if(w>7.5)w=7.5; if(w<-7.5)w=-7.5; } else w*=Math.pow(0.1,DT);
    vx*=Math.pow(0.5,DT); ang+=w*DT; x+=vx*DT; y+=vy*DT; i++;
    if(Math.abs(x)+3.135*Math.abs(Math.cos(ang))+0.715*Math.abs(Math.sin(ang))>9.2-0.05)return {wall:true, x:x, y:y, vx:vx, w:w, ang:ang, n:i}; }
  return {x:x, y:y, vx:vx, vy:vy, w:w, ang:ang, n:i};
}
/* the carve region measured with the real step (carvecal.js): within 1 u of the column's middle, the blade within about 25
   degrees of straight down, little spin and drift, carves every slab of a 10 slab column. Cost 0 inside it. */
function cost(a, tx){ if(a.wall)return 1e6; var dx=Math.abs(a.x-tx), s=Math.sin(a.ang), h=function(v,l){ return v>l?(v-l)*(v-l):0; };
  return h(dx,0.8)*20 + (s<0.9?(0.9-s)*(0.9-s)*400+ (s<0?50:0):0) + h(Math.abs(a.w),1.8)*20 + h(Math.abs(a.vx),2.8)*10; }
function plan(st, tx, ty){   // the best program of at most two holds (whole 0.1 s ticks) to arrive at height ty over x=tx
  var best=[], bc=cost(kin(st,[],ty),tx), k1, s1, m1, k2, s2, m2;
  var tArr=Math.max(0.1, timeTo(st, ty)), T=Math.min(30, Math.ceil(tArr/0.1));
  for(k1=0;k1<=T;k1++) for(s1=-1;s1<=1;s1+=2) for(m1=1;m1<=6&&k1+m1<=T+2;m1++){
    for(k2=0;k2<=20;k2+=(k2<6?1:2)) for(s2=-1;s2<=1;s2+=2) for(m2=0;m2<=6;m2++){
      if(m2===0&&(k2>0||s2===1))continue;
      var p=[], i; for(i=0;i<k1*TICK;i++)p.push(0); for(i=0;i<m1*TICK;i++)p.push(s1); for(i=0;i<k2*TICK;i++)p.push(0); for(i=0;i<m2*TICK;i++)p.push(s2);
      var c=cost(kin(st,p,ty),tx); if(c<bc){ bc=c; best=p; } } }
  return {prog:best, cost:bc};
}
/* seconds of fall from st down to height ty (gravity to the terminal speed, as the step does it) */
function timeTo(st, ty){ var y=st.y, vy=st.vy, t=0; while(y>ty&&t<20){ vy-=21*DT; if(vy<-19)vy=-19; y+=vy*DT; t+=DT; } return t; }
module.exports={kin:kin, cost:cost, plan:plan, timeTo:timeTo, DT:DT, TICK:TICK};
