// A near human Freefall controller, hazard aware. It decides about every 0.1 s (each decision lands 0 to 2 steps late, a
// thumb's jitter), plans a program of at most two holds (whole 0.1 s ticks) with the game's own free fall integrator, and
// scores each program by where it arrives (over the target, blade down, slow, still) and by what it meets on the way:
// bumpers, crystals, thorns, gourds (fixed boxes grown by the knife's KR), each wasp where it will be at that moment, the walls.
var DT=1/120, TICK=12, K1=[0,1,2,3,4,6,8,11,15,20,25,30], K2=[0,1,2,3,5,8,12,20];
function h(v,l){ return v>l?(v-l)*(v-l):0; }
function arriveCost(a, tx, wx){ var dx=Math.abs(a.x-tx), s=Math.sin(a.ang);
  return h(dx,0.8)*20*wx + (s<0.9?(0.9-s)*(0.9-s)*400+(s<0?50:0):0) + h(Math.abs(a.w),1.8)*20 + h(Math.abs(a.vx),2.8)*10; }
function kin(st, prog, untilY, Hz, t0){
  var x=st.x, y=st.y, vx=st.vx, vy=st.vy, w=st.w, ang=st.ang, i=0, hit=0, n=prog.length;
  while(y>untilY && i<4000){ var hd=i<n?prog[i]:0; vy-=21*DT; if(vy<-19)vy=-19;
    if(hd){ vx+=hd*30*DT; w+=hd*17*DT; if(w>7.5)w=7.5; if(w<-7.5)w=-7.5; } else w*=Math.pow(0.1,DT);
    vx*=Math.pow(0.5,DT); ang+=w*DT; x+=vx*DT; y+=vy*DT; i++;
    if(Math.abs(x)+3.135*Math.abs(Math.cos(ang))+0.715*Math.abs(Math.sin(ang))>9.2-0.05)return {wall:true};
    if((i&3)===0&&Hz){ var B=Hz.B, j; for(j=0;j<B.length;j++){ var b=B[j]; if(y>=b.y0&&y<=b.y1&&x>=b.x0&&x<=b.x1){ hit++; break; } }
      var Wp=Hz.W, t=t0+i*DT; for(j=0;j<Wp.length;j++){ var wp=Wp[j]; if(Math.abs(y-wp.y)<wp.r+1.5){ var wx=wp.cx+Math.sin(t*wp.speed+wp.phase)*wp.range; if(Math.abs(x-wx)<wp.r+1.5+0.4){ hit++; break; } } } }
  }
  return {x:x, y:y, vx:vx, vy:vy, w:w, ang:ang, hit:hit};
}
function plan(st, tx, ty, Hz, t0, wx){
  var best=[], bc=1e9, k1, s1, m1, k2, s2, m2, a, c, p, i, ii, jj;
  a=kin(st,[],ty,Hz,t0); bc=a.wall?1e6:arriveCost(a,tx,wx)+a.hit*300;
  var T=Math.ceil(timeTo(st,ty)/0.1);
  for(ii=0;ii<K1.length;ii++){ k1=K1[ii]; if(k1>T+2)break;
    for(s1=-1;s1<=1;s1+=2) for(m1=1;m1<=6;m1++) for(jj=0;jj<K2.length;jj++){ k2=K2[jj];
      for(s2=-1;s2<=1;s2+=2) for(m2=0;m2<=5;m2++){
        if(m2===0&&(k2>0||s2===1))continue;
        p=[]; for(i=0;i<k1*TICK;i++)p.push(0); for(i=0;i<m1*TICK;i++)p.push(s1); for(i=0;i<k2*TICK;i++)p.push(0); for(i=0;i<m2*TICK;i++)p.push(s2);
        a=kin(st,p,ty,Hz,t0); c=a.wall?1e6:arriveCost(a,tx,wx)+a.hit*300; if(c<bc){ bc=c; best=p; } } } }
  return {prog:best, cost:bc};
}
function timeTo(st, ty){ var y=st.y, vy=st.vy, t=0; while(y>ty&&t<20){ vy-=21*DT; if(vy<-19)vy=-19; y+=vy*DT; t+=DT; } return t; }
module.exports={kin:kin, plan:plan, timeTo:timeTo, arriveCost:arriveCost, DT:DT, TICK:TICK};
