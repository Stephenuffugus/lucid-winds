// The near human controller, faster: far from its target (more than HOR seconds of fall) it only keeps calm (blade down,
// little spin and drift) and out of every hazard over the next HOR seconds with one hold at most; within HOR of the target
// it plans the full approach (two holds) to arrive over the target blade down, slow and still, meeting nothing on the way.
// Hazards: bumpers, crystals, thorns, gourds (boxes grown by the knife's KR), each wasp where it will be then, the walls.
var DT=1/120, TICK=12, HOR=3.0, K1=[0,1,2,3,4,6,8,11,15,20,25], K2=[0,1,2,3,5,8,12,20];
function h(v,l){ return v>l?(v-l)*(v-l):0; }
function arriveCost(a, tx, wx){ var dx=Math.abs(a.x-tx), s=Math.sin(a.ang);
  return h(dx,0.8)*20*wx + (s<0.9?(0.9-s)*(0.9-s)*400+(s<0?50:0):0) + h(Math.abs(a.w),1.8)*20 + h(Math.abs(a.vx),2.8)*10; }
function calmCost(a, tx, wx){ var s=Math.sin(a.ang); return (s<0.5?(0.5-s)*40:0) + h(Math.abs(a.w),3)*4 + h(Math.abs(a.vx),6)*2 + 0*tx*wx; }
function kin(st, prog, untilY, Hz, t0, maxN){
  var x=st.x, y=st.y, vx=st.vx, vy=st.vy, w=st.w, ang=st.ang, i=0, hit=0, n=prog.length, lim=maxN||4000;
  while(y>untilY && i<lim){ var hd=i<n?prog[i]:0; vy-=21*DT; if(vy<-19)vy=-19;
    if(hd){ vx+=hd*30*DT; w+=hd*17*DT; if(w>7.5)w=7.5; if(w<-7.5)w=-7.5; } else w*=Math.pow(0.1,DT);
    vx*=Math.pow(0.5,DT); ang+=w*DT; x+=vx*DT; y+=vy*DT; i++;
    if(Math.abs(x)+3.135*Math.abs(Math.cos(ang))+0.715*Math.abs(Math.sin(ang))>9.2-0.05)return {wall:true};
    if((i&3)===0&&Hz){ var B=Hz.B, j; for(j=0;j<B.length;j++){ var b=B[j]; if(y>=b.y0&&y<=b.y1&&x>=b.x0&&x<=b.x1){ hit++; break; } }
      var Wp=Hz.W, t=t0+i*DT; for(j=0;j<Wp.length;j++){ var wp=Wp[j]; if(Math.abs(y-wp.y)<wp.r+1.5){ var wx=wp.cx+Math.sin(t*wp.speed+wp.phase)*wp.range; if(Math.abs(x-wx)<wp.r+1.9){ hit++; break; } } } }
  }
  return {x:x, y:y, vx:vx, vy:vy, w:w, ang:ang, hit:hit, n:i};
}
function timeTo(st, ty){ var y=st.y, vy=st.vy, t=0; while(y>ty&&t<30){ vy-=21*DT; if(vy<-19)vy=-19; y+=vy*DT; t+=DT; } return t; }
function score(st, p, tx, ty, Hz, t0, wx, far){ var a=far?kin(st,p,-1e9,Hz,t0,Math.round(HOR/DT)):kin(st,p,ty,Hz,t0);
  return a.wall?1e6:(far?calmCost(a,tx,wx):arriveCost(a,tx,wx))+a.hit*300; }
function progOf(k1,s1,m1,k2,s2,m2){ var p=[], i; for(i=0;i<k1*TICK;i++)p.push(0); for(i=0;i<m1*TICK;i++)p.push(s1); for(i=0;i<k2*TICK;i++)p.push(0); for(i=0;i<m2*TICK;i++)p.push(s2); return p; }
function plan(st, tx, ty, Hz, t0, wx){
  var far=timeTo(st,ty)>HOR, best=[], bc=score(st,[],tx,ty,Hz,t0,wx,far), ii, jj, s1, m1, s2, m2, c, p;
  for(ii=0;ii<K1.length;ii++) for(s1=-1;s1<=1;s1+=2) for(m1=1;m1<=6;m1++){
    if(far){ p=progOf(K1[ii],s1,m1,0,1,0); c=score(st,p,tx,ty,Hz,t0,wx,true); if(c<bc){ bc=c; best=p; } continue; }
    for(jj=0;jj<K2.length;jj++) for(s2=-1;s2<=1;s2+=2) for(m2=0;m2<=5;m2++){
      if(m2===0&&(jj>0||s2===1))continue;
      p=progOf(K1[ii],s1,m1,K2[jj],s2,m2); c=score(st,p,tx,ty,Hz,t0,wx,false); if(c<bc){ bc=c; best=p; } } }
  return {prog:best, cost:bc, far:far};
}
module.exports={kin:kin, plan:plan, score:score, timeTo:timeTo, arriveCost:arriveCost, calmCost:calmCost, DT:DT, TICK:TICK, HOR:HOR};
