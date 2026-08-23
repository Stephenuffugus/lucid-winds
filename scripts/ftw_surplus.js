/* THE SURPLUS METER.
   Stephen's complaint is "I had $200,000 left over with nothing to spend it on".
   This measures exactly that: run the balanced bot that check.js already proves
   wins, and report what it is holding at the end and what it could still buy.
   Lifts check.js's own makeCtx so the harness is the trusted one. */
const fs=require('fs'), vm=require('vm');
const CHK='/workspaces/lucid-winds/satellites/flock-the-world/check.js';
const src=fs.readFileSync(CHK,'utf8');
const preamble=src.slice(0,src.indexOf('let C = null;'));
const box=vm.createContext({require,module,performance,Set,Map,Promise,Error,console:{log(){}},
  process,Buffer,__dirname:'/workspaces/lucid-winds/satellites/flock-the-world',__filename:CHK});
vm.runInContext(preamble+'\nthis.__mk=makeCtx;',box,{filename:CHK});
const makeCtx=box.__mk;

/* ⛔ THE SEED HAS TO GO IN BEFORE THE GAME SCRIPT RUNS.
   The first version set c.Math AFTER makeCtx, which runs the game script at the
   end of itself, so the sim had already closed over the real Math and the seed
   did nothing. Identical runs then reported 5/5, 4/5 and 3/5 wins, and I nearly
   read a CSS-only change as a balance regression. makeCtx hands the context the
   PROCESS's Math object, so seeding it here is what actually reaches the sim. */
/* ⛔ HISTORY, corrected by the Fable review 2026-08-24. This comment used to say
   the residual non-determinism was "most likely Date, which makeCtx also hands
   through from the process". Wrong on both counts: the vm box contextifies its
   OWN Date (the sandbox does not pass one), and no Date use reachable from the
   headless sim affects state. The real cause was Math, found below: the sandbox
   passes no Math either, so the box grew its own, and seeding the process's
   Math.random never reached the sim. With both realms seeded (lines below),
   three consecutive runs are byte identical and every figure here is a point. */
const REAL_RANDOM=Math.random;
function bot(strat,maxDays,seed){
  let n=seed>>>0;
  const rnd=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};
  /* the meter's own loop (bubble collection etc) runs in the process */
  Math.random=rnd;
  /* ⛔ FOUND IT, 2026-08-24 (Fable review). The sandbox handed to
     vm.createContext has NO Math in it, so the vm box grew its OWN contextified
     Math global, and makeCtx (defined inside the box) hands the BOX's Math to
     every game context. Seeding the process Math.random above therefore never
     reached the sim at all: the meter's own bot logic was seeded while the game
     underneath it kept rolling real dice. That is the whole "identical runs say
     3/5 then 4/5" mystery. Seed the box's Math too, through the box. */
  box.__rnd=rnd;
  vm.runInContext('Math.random=__rnd;',box);
  const c=makeCtx();
  c.doctrineModal=()=>{};
  const s=vm.runInContext(`S=newState('CONTRACTOR','Vendor','NA');S`,c);
  c.showEvent=ev=>{const evc=o=>{if(!o.cost||!o.cost.cash)return 0;
      return Math.round(o.cost.cash*vm.runInContext('evScale(S)',c)/5)*5;};
    for(const o of ev.o){const cc=evc(o);
      if((!o.c||o.c(s))&&(!cc||s.cash>=cc)){s.cash-=cc;if(o.cost&&o.cost.inf)s.inf-=o.cost.inf;o.f(s);return;}}
    ev.o[ev.o.length-1].f(s);};
  const cl=(fn,...a)=>{c.__a=a;return vm.runInContext(fn+'(...__a)',c);};
  const NODES=vm.runInContext('NODES',c);
  let peakCash=0, spentEntry=0, spentNodes=0, peakNet=0, spentActions=0, spentAcq=0, spentOps=0; const entryDays=[]; let grossIncome=0;
  for(let d=0;d<maxDays;d++){
    s.bubbles=s.bubbles.filter(b=>{
      if(Math.random()>(strat.collectP==null?1:strat.collectP))return b.life>1;
      if(b.k==='cash')s.cash+=b.v; else if(b.k==='inf')s.inf+=b.v;
      else {s.inf+=1;s.oversight=Math.max(0,s.oversight-0.6);}
      return false;});
    if(strat.buy){const av=NODES.filter(x=>!s.owned.has(x.id)&&cl('nodeState',x)==='avail')
        .sort((a,b)=>cl('nodeCost',a)-cl('nodeCost',b));
      if(av.length&&s.inf>=cl('nodeCost',av[0])){spentNodes+=cl('nodeCost',av[0]);cl('buyNode',av[0].id);}}
    if(strat.expand&&d%30===0){
      const t=Object.keys(s.regions).map(k=>s.regions[k]).filter(r=>!r.active)
        .sort((a,b)=>cl('entryCost',a)-cl('entryCost',b));
      if(t.length&&s.cash>cl('entryCost',t[0])*1.5){const r=t[0];const ec=cl('entryCost',r);
        s.cash-=ec;spentEntry+=ec;entryDays.push(d);
        if(r.lost){r.lost=false;s.lostCount=Math.max(0,s.lostCount-1);r.unrest=45;}
        r.active=true;r.coverage=0.005;s.activeCount++;}}
    if(strat.concede&&d%12===0){for(const k of Object.keys(s.regions)){const r=s.regions[k];
      if(r.active&&r.resist>52){cl('doAction','concede',k);break;}}}
    /* A PLAYER WHO ACTUALLY SPENDS. The old bot only bought nodes and markets,
       which is a correct model of the complaint (nothing to spend on) but a
       useless model of the fix. This one uses the repeatable region actions the
       way a rich player would: crack down where unrest is high, black out where
       suspicion is high, every day it can afford to. */
    if(strat.spend){
      const before=s.cash;
      for(const k of Object.keys(s.regions)){
        const r=s.regions[k]; if(!r.active||r.cd>0) continue;
        if(r.suspicion>45&&s.has&&s.has('blackout')){cl('doAction','blackout',k);}
        else if(r.unrest>50){cl('doAction','crack',k);}
        if(s.cash<before) break;   /* one purchase a day, like a person */
      }
      spentActions+=Math.max(0,before-s.cash);
      /* and the always open sink: a rich player buys install base.
         ⛔ The first version bought whenever it could afford to and LOST 5 of 5:
         it spent the expansion war chest and never entered the markets the win
         condition needs. That is a real hazard of an always open sink, and it is
         also just a bad player. A person keeps their entry money back. This one
         reserves the next market's price before it buys anything. */
      const un=Object.keys(s.regions).map(k=>s.regions[k]).filter(r=>!r.active);
      const reserve=un.length?Math.min(...un.map(r=>cl('entryCost',r)))*1.6:0;
      /* ⛔ Second bad bot: it bought whenever it could, so heat pinned at its
         0.55 cap and every purchase cost 69% of the treasury, forever. That is
         not a player, that is a compulsion. A person watches the price climb and
         waits for it to come back down, and lets the heat bleed off. */
      /* the desk: buy whatever is on it that is a comfortable bite. This is what
         a player with money and three offers in front of them does. */
      const offs=cl('deskOffers',s)||[];
      for(const o of offs){
        const pr=cl('opPrice',s,o);
        if(pr>0&&s.cash-reserve>pr*1.8){const b3=s.cash;if(cl('doOp',o.id))spentOps+=Math.max(0,b3-s.cash);break;}
      }
      const ap=cl('acqPrice',s);
      const heat=(s.acqHeat||0);
      if(ap>0&&heat<0.18&&s.cash-reserve>ap*1.5){const b2=s.cash;if(cl('doAcquire'))spentAcq+=Math.max(0,b2-s.cash);}
    }
    if(!s.doctrine&&s.subj>=0.14){s.doctrine=strat.doctrine||'fist';cl('recompute',s);}
    const cashBefore=s.cash;
    cl('tick');
    grossIncome+=Math.max(0,s.cash-cashBefore);
    if(s.cash>peakCash)peakCash=s.cash;
    if((s.net||0)>peakNet)peakNet=s.net;
    if(s.over)break;
  }
  /* what could the leftover still buy? */
  const stillToEnter=Object.keys(s.regions).map(k=>s.regions[k]).filter(r=>!r.active)
    .reduce((a,r)=>a+cl('entryCost',r),0);
  /* the structural numbers: what the grid earns and what it costs to run */
  const infra=Object.keys(s.regions).reduce((a,k)=>{const r=s.regions[k];
    const R=vm.runInContext('REGIONS',c).find(x=>x.id===k);
    return a+(R?R.pop*r.coverage*R.wealth:0);},0);
  const upk=infra*vm.runInContext('CFG',c).upkeepK*(1+(s.avgMil||0)*0.8);
  Math.random=REAL_RANDOM;
  return {day:s.day,won:!!s.won,over:!!s.over,subj:+(s.subj||0).toFixed(3),
    infra:Math.round(infra),upkeep:Math.round(upk),
    grossEst:Math.round((s.net||0)+upk),
    marginPct:Math.round(100*(s.net||0)/Math.max(1,(s.net||0)+upk)),
    endCash:Math.round(s.cash),peakCash:Math.round(peakCash),net:Math.round(s.net||0),
    spentEntry:Math.round(spentEntry),marketsHeld:s.activeCount,
    unenteredMarketCost:Math.round(stillToEnter),
    peakNet:Math.round(peakNet),
    /* ⛔ "markets held" was the wrong question and it answered 14/14 at every
       setting: entry is a ONE TIME cost against an unbounded income stream, so
       given enough days you can always afford everything. Stephen's complaint
       was that he could buy in "super fast". WHEN the last door opens, and what
       share of lifetime income the doors cost, are the questions that measure it. */
    lastMarketDay:entryDays.length?entryDays[entryDays.length-1]:null,
    halfMarketsDay:entryDays.length>=7?entryDays[6]:null,
    entryPctOfIncome:grossIncome>0?Math.round(100*spentEntry/grossIncome):null,spentActions:Math.round(spentActions),spentAcq:Math.round(spentAcq),spentOps:Math.round(spentOps),dcs:(s.dcs||0),acqHeat:+((s.acqHeat)||0).toFixed(2),
    /* ⛔ "days of END income banked" divides by a number this change drives to
       zero, so it reported 231,756 days once. Peak net is the stable yardstick:
       how many days of your BEST income are you sitting on at the end. */
    daysOfPeakIncomeBanked:(peakNet>0?+(s.cash/peakNet).toFixed(0):null),
    endNetPctOfPeak:(peakNet>0?Math.round(100*(s.net||0)/peakNet):null)};
}
const MODE=process.argv[2]||'spend';
const STRAT={buy:1,expand:1,doctrine:'glove',collectP:0.10,concede:1,spend:MODE==='spend'?1:0};
console.log('THE SURPLUS, balanced bot ('+(STRAT.spend?'A PLAYER WHO SPENDS':'the hoarder, spends on nothing repeatable')+')\n');
const rows=[];
for(const seed of [7,19,42,101,256]){
  const r=bot(STRAT,4000,seed); rows.push(r);
  console.log('  seed '+String(seed).padEnd(4)+' day '+String(r.day).padStart(4)
    +'  '+(r.won?'WON ':'lost')+'  subj '+r.subj
    +'  endCash '+String(r.endCash).padStart(8)
    +'  net/day '+String(r.net).padStart(5)
    +'  peakNet '+String(r.peakNet).padStart(4)
    +'  banked '+String(r.daysOfPeakIncomeBanked).padStart(4)+'d of peak'
    +'  endNet '+String(r.endNetPctOfPeak).padStart(4)+'% of peak'
    +'  desk $'+String(r.spentOps).padStart(9)+' dc '+r.dcs
    +'  lastMkt d'+String(r.lastMarketDay).padStart(4)
    +'  entry '+String(r.entryPctOfIncome).padStart(3)+'% of income'
    +'  mkts '+r.marketsHeld+'/14');
}
const won=rows.filter(r=>r.won);
console.log('\n  wins: '+won.length+' of '+rows.length);
if(won.length){
  const avg=k=>Math.round(won.reduce((a,r)=>a+r[k],0)/won.length);
  console.log('  average end cash on a WIN: '+avg('endCash')
    +'   peak net/day: '+avg('peakNet')
    +'   = '+Math.round(avg('endCash')/Math.max(1,avg('peakNet')))+' DAYS OF PEAK INCOME BANKED');
  console.log('  endgame net as a share of peak: '+avg('endNetPctOfPeak')+'%');
  console.log('  average markets held: '+(won.reduce((a,r)=>a+r.marketsHeld,0)/won.length).toFixed(1)+' of 14');
  console.log('  LAST market opens on day '+avg('lastMarketDay')+'   half the world by day '+avg('halfMarketsDay'));
  console.log('  market entry costs '+avg('entryPctOfIncome')+'% of everything you earn');
}
