const SIM=require('../src/sim2.js');
const NAMES=Object.keys(SIM.ARCHETYPES);
const N=parseInt(process.argv[2]||'400',10);
const spec=(n,d)=>SIM.build(Object.assign({},SIM.ARCHETYPES[n],{dir:d}));
const pct=x=>(x*100).toFixed(1).padStart(5);
function run(){
 const durs=[],c={},mat={};
 for(const A of NAMES){mat[A]={};for(const B of NAMES){let w=0;
  for(let i=0;i<N;i++){const rnd=SIM.mulberry(i*7919+A.length*31+B.length*17);
   const r=SIM.resolveMatch(spec(A,1),spec(B,(i%2?-1:1)),{rnd,
    a:{angle:rnd()*6.283,power:.94+rnd()*.12,lean:.03+rnd()*.05,phase:rnd()*6.283},
    b:{angle:rnd()*6.283,power:.94+rnd()*.12,lean:.03+rnd()*.05,phase:rnd()*6.283}});
   if(r.winner==='a')w++;durs.push(r.duration);c[r.cause]=(c[r.cause]||0)+1;
   // run the same pairing with the roles swapped so seat order cannot bias
   const r2=SIM.resolveMatch(spec(B,(i%2?-1:1)),spec(A,1),{rnd:SIM.mulberry(i*104729+A.length*7+B.length*3),
    a:{angle:rnd()*6.283,power:.94+rnd()*.12,lean:.03+rnd()*.05,phase:rnd()*6.283},
    b:{angle:rnd()*6.283,power:.94+rnd()*.12,lean:.03+rnd()*.05,phase:rnd()*6.283}});
   if(r2.winner==='b')w++;durs.push(r2.duration);c[r2.cause]=(c[r2.cause]||0)+1;}
  mat[A][B]=w/(N*2);}}
 durs.sort((x,y)=>x-y);const q=f=>durs[Math.floor(f*(durs.length-1))];
 console.log('\nWIN MATRIX  (row beats column, %)');
 console.log('           '+NAMES.map(n=>n.padStart(8)).join(''));
 for(const A of NAMES)console.log(A.padEnd(11)+NAMES.map(B=>pct(mat[A][B])+'  ').join(''));
 console.log('\nDURATION   p10 %s  median %s  p90 %s  max %s',
  q(.10).toFixed(1),q(.50).toFixed(1),q(.90).toFixed(1),q(1).toFixed(1));
 const tot=Object.values(c).reduce((a,b)=>a+b,0);
 console.log('FINISHES   '+Object.entries(c).map(([k,v])=>`${k} ${(100*v/tot).toFixed(1)}%`).join('   '));
 const totAll=Object.values(c).reduce((a,b)=>a+b,0);
 const fails=[];
 for(const A of NAMES)for(const B of NAMES){const w=mat[A][B];
  if(A===B){const dec=w/Math.max(1-((c.double||0)/totAll),0.01); if(dec<.44||dec>.56)fails.push(`mirror ${A} ${pct(dec)} of decisive`);}
  else if(w<.30||w>.70)fails.push(`${A}>${B} ${pct(w)}`);}
 const med=q(.5),p90=q(.9);
 if(med<6||med>12)fails.push(`round median ${med.toFixed(1)}s`);
 if(p90>25)fails.push(`round p90 ${p90.toFixed(1)}s`);
 const ko=((c.knockout||0)+(c.burst||0))/tot;
 if(ko<.05||ko>.20)fails.push(`ko+burst ${(ko*100).toFixed(1)}%`);
 console.log('\n'+(fails.length?'FAIL: '+fails.join(' | '):'ALL ACCEPTANCE TARGETS MET'));
 return {mat,med,p90,tot,c};
}
const res=run();
// match-level pacing: rounds until one side banks 4 points
{const names=Object.keys(SIM.ARCHETYPES);let lens=[],rounds=[];
 for(let i=0;i<600;i++){const rnd=SIM.mulberry(i*31337);
  const A=names[i%4],B=names[(i*3+1)%4];let pa=0,pb=0,t=0,rc=0;
  while(pa<4&&pb<4&&rc<12){const r=SIM.resolveMatch(spec(A,1),spec(B,(rc%2?-1:1)),{rnd,
   a:{angle:rnd()*6.283,power:.94+rnd()*.12,lean:.03+rnd()*.05,phase:rnd()*6.283},
   b:{angle:rnd()*6.283,power:.94+rnd()*.12,lean:.03+rnd()*.05,phase:rnd()*6.283}});
   if(r.winner==='a')pa+=r.points;else if(r.winner==='b')pb+=r.points;
   t+=r.duration+4.5;rc++;}
  lens.push(t);rounds.push(rc);}
 lens.sort((a,b)=>a-b);rounds.sort((a,b)=>a-b);
 const q=(arr,f)=>arr[Math.floor(f*(arr.length-1))];
 console.log('\nMATCH (first to 4 points, +4.5s per relaunch)');
 console.log('  rounds  p10 %s  median %s  p90 %s', q(rounds,.1), q(rounds,.5), q(rounds,.9));
 console.log('  seconds p10 %s  median %s  p90 %s', q(lens,.1).toFixed(0), q(lens,.5).toFixed(0), q(lens,.9).toFixed(0));}
