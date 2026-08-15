const vm=require('vm'),fs=require('fs');
const src=fs.readFileSync(process.env.SRC||'game.js','utf8');
function stubEl(){return{classList:{contains:()=>false,add(){},remove(){},toggle(){}},
  style:{},innerHTML:'',textContent:'',querySelector:()=>null,querySelectorAll:()=>[],
  appendChild(){},addEventListener(){},onclick:null,dataset:{}};}
function makeCtx(){
  const ctx={console,Math,Date,JSON,performance,
    setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{},
    requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{},
    devicePixelRatio:1,window:{addEventListener(){}},
    document:{getElementById:()=>stubEl(),querySelectorAll:()=>[],querySelector:()=>stubEl(),createElement:()=>stubEl()}};
  ctx.globalThis=ctx;
  vm.createContext(ctx);
  vm.runInContext(src,ctx);
  return ctx;
}
function run(mode,diff,start,strategy,maxDays){
  const c=makeCtx();
  const S=vm.runInContext(`S=newState('${mode}','${diff}','${start}');S`,c);
  c.showEvent=ev=>{ // auto-resolve: first affordable option
    for(const o of ev.o){ if(!o.c||o.c(S)){ if(o.cost){if(o.cost.cash)S.cash-=o.cost.cash;if(o.cost.inf)S.inf-=o.cost.inf;} o.f(S); return; } }
    ev.o[ev.o.length-1].f(S);
  };
  c.doctrineModal=()=>{};
  const NODES=vm.runInContext('NODES',c), REGIONS=vm.runInContext('REGIONS',c);
  const call=(fn,...args)=>{c.__a=args;return vm.runInContext(`${fn}(...__a)`,c);};
  const trace=[];
  for(let d=0;d<maxDays;d++){
    // bot: collect all bubbles instantly
    S.bubbles=S.bubbles.filter(b=>{
      if(Math.random()>(strategy.collectP??1))return b.life>1; // missed this tick
      if(b.k==='cash')S.cash+=b.v; else if(b.k==='inf')S.inf+=b.v;
      else{S.inf+=1;S.oversight=Math.max(0,S.oversight-0.6);}
      return false;
    });
    // bot: buy cheapest available node
    if(strategy.buy){
      const av=NODES.filter(n=>!S.owned.has(n.id)&&(!strategy.trees||strategy.trees.includes(n.t))&&call('nodeState',n)==='avail')
        .sort((a,b)=>call('nodeCost',a)-call('nodeCost',b));
      if(av.length&&S.inf>=call('nodeCost',av[0]))call('buyNode',av[0].id);
    }
    // bot: enter cheapest inactive market when rich
    if(strategy.expand&&d%30===0){
      const targets=REGIONS.map(r=>S.regions[r.id]).filter(r=>!r.active)
        .sort((a,b)=>call('entryCost',a)-call('entryCost',b));
      if(targets.length&&S.cash>call('entryCost',targets[0])*1.5){
        const r=targets[0],cost=call('entryCost',r);
        S.cash-=cost; if(r.lost){r.lost=false;S.lostCount=Math.max(0,S.lostCount-1);r.unrest=45;}
        r.active=true;r.coverage=0.005;
      }
    }
    // bot: de-escalate over-organized regions (free action)
    if(strategy.crack&&S.day%12===0){
      for(const id in S.regions){const r=S.regions[id];
        if(r.active&&r.resist>52&&r.unrest<62)call('doAction','concede',id);}}
    // bot: the manufactured-riot playbook
    if(strategy.crack&&S.has('charter')){
      for(const id in S.regions){const r=S.regions[id];
        if(!r.active)continue;
        if(r.pstate==='peaceful'&&S.has('agit')&&S.cash>=220){
          call('doAction','agitate',id);call('doAction','crack',id);}
        else if(r.unrest>60&&S.cash>=120){call('doAction','crack',id);}}
    }
    if(!S.doctrine&&S.subj>=0.14){S.doctrine=strategy.doctrine||'fist';call('recompute',S);}
    call('tick');
    if(d%200===0)trace.push({d,subj:+(S.subj*100).toFixed(1),ovr:+S.oversight.toFixed(1),
      cash:Math.round(S.cash),inf:Math.round(S.inf),act:S.activeCount,lost:S.lostCount,
      sus:+S.avgSus.toFixed(0),nodes:S.owned.size});
    if(S.over)break;
  }
  return {won:S.won,over:S.over,day:S.day,subj:+(S.subj*100).toFixed(1),
    ovr:+S.oversight.toFixed(1),lost:S.lostCount,nodes:S.owned.size,trace,ov:c.OV};
}
const scenarios=[
 ['CONTRACTOR','Vendor','NA',{buy:1,expand:1,crack:1,doctrine:'glove',collectP:0.10}],
 ['CONTRACTOR','Vendor','NA',{buy:1,expand:1,crack:0,doctrine:'fist',trees:['dep','cap'],collectP:0.10}],
 ['CONTRACTOR','Vendor','SEA',{buy:1,expand:1,crack:1,doctrine:'fist'}],
 ['CONTRACTOR','Vendor','NA',{buy:1,expand:1,crack:1,doctrine:'glove'}],
 ['DEEPSTATE','Vendor','EA',{buy:1,expand:1,crack:1,doctrine:'fist'}],
 ['CRISIS','Vendor','ME',{buy:1,expand:1,crack:1,doctrine:'fist'}],
 ['CONTRACTOR','Incumbent','WE',{buy:1,expand:1,crack:1,doctrine:'glove'}],
 ['CONTRACTOR','Vendor','NA',{buy:0,expand:0,crack:0}], // do-nothing baseline
];
for(const[m,df,st,strat]of scenarios){
  const r=run(m,df,st,strat,4000);
  console.log(`\n=== ${m}/${df}/${st} doctrine=${strat.doctrine||'-'} buy=${!!strat.buy}`);
  if(r.ov)console.log('   OV:',JSON.stringify(Object.fromEntries(Object.entries(r.ov).map(([k,v])=>[k,+v.toFixed(1)]))));
  console.log(`   result: ${r.won?'WIN':r.over?'LOSS':'TIMEOUT'} day=${r.day} subj=${r.subj}% ovr=${r.ovr}% lost=${r.lost} nodes=${r.nodes}`);
  for(const t of r.trace.filter((_,i)=>i%3===0))console.log('  ',JSON.stringify(t));
}
