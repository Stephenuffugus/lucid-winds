/* Aug 27 notes pass, looked at rather than trusted: the HUD suspicion stat,
   the trouble ribbon + region country lines, the lit Enter market, the
   synergy modal, the aftermath machine note, the concede fatigue warning. */
import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-aug27";
fs.mkdirSync(OUT,{recursive:true});
const L={width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true};
const P={width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const errs=[];
p.on("pageerror",e=>errs.push("pageerror: "+String(e).slice(0,220)));
p.on("console",m=>{if(m.type()==="error")errs.push("console: "+m.text().slice(0,160));});
await p.evaluateOnNewDocument(()=>{
  try{localStorage.setItem("sws_dev_ok","1");}catch(e){}
});
await p.setViewport(L);
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2600);
async function shot(n){await p.screenshot({path:`${OUT}/${n}.png`});console.log("shot "+n);}

/* boot straight into a run via the game's own flow */
await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1400);
/* the proven pick: ask the game's own hit test where a big country lives */
const tap=await p.evaluate(()=>{
  const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  const pts=[];
  for(let fy=0.05;fy<0.95;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
    const sx=r.width*fx, sy=r.height*fy;
    const[wx,wy]=window._dbgPv.toWorld(sx,sy);
    const hit=countryAtPoint(wx,wy);
    if(hit&&hit.n==="United States of America")pts.push([sx,sy]);
  }
  if(!pts.length)return null;
  const cx=pts.reduce((a,q)=>a+q[0],0)/pts.length, cy=pts.reduce((a,q)=>a+q[1],0)/pts.length;
  let best=pts[0],bd=1e9;
  for(const q of pts){const d=(q[0]-cx)**2+(q[1]-cy)**2;if(d<bd){bd=d;best=q;}}
  return{x:r.x+best[0],y:r.y+best[1]};
});
console.log("US tap:",JSON.stringify(tap));
if(tap){await p.touchscreen.tap(tap.x,tap.y);await sleep(700);}
await p.evaluate(()=>{const b=document.getElementById("beginBtn");if(b&&!b.disabled)b.click();});
await sleep(2200);
console.log("in game:",await p.evaluate(()=>document.getElementById("game").classList.contains("on")));

/* 1) HUD with the new Suspicion stat, some suspicion on the board */
await p.evaluate(()=>{setSpeed(0);
  REGIONS.slice(0,6).forEach(R=>{const x=S.regions[R.id];x.active=true;x.coverage=0.5;x.suspicion=12;});
  S.avgSus=12;paintHud();});
await shot("01-hud-suspicion-landscape");

/* 2) trouble ribbon + rgeo lines + lit Enter market in the World tab.
      Force Western Europe (Greenland's region) into uprising first. */
await p.evaluate(()=>{
  const gl=COUNTRIES.find(c=>c.n==="Greenland");
  const x=S.regions[gl.r];x.active=true;x.coverage=0.4;x.unrest=90;x.pstate="uprising";
  S.cash=5e9;                       /* one market clearly affordable */
  paintHud();openSheet("reg");
});
await sleep(700);
await shot("02-world-trouble-ribbon");
/* tap the ribbon chip and shoot the located card */
await p.evaluate(()=>{const t=document.querySelector(".tchip");if(t)t.click();});
await sleep(900);
await shot("03-world-located-card");
/* poor state: broke player, Enter market should read dead + say how short */
await p.evaluate(()=>{S.cash=12;renderSheet("reg");});
await sleep(300);
await shot("04-world-enter-market-broke");
await p.evaluate(()=>{S.cash=5e9;renderSheet("reg");});

/* 3) concede fatigue warning at arm time */
await p.evaluate(()=>{
  S.day=Math.max(S.day,200);
  S.concLog=[S.day-5,S.day-9,S.day-14];
  const gl=COUNTRIES.find(c=>c.n==="Greenland");
  const btn=[...document.querySelectorAll('[data-act="concede"]')].find(b=>b.dataset.r===gl.r);
  if(btn)btn.click();
});
await sleep(500);
await shot("05-concede-fatigue-warning");
await p.evaluate(()=>{S._concArm=null;closeSheet();});

/* 4) synergy modal: buy the tutorial pair the way a player would */
await p.evaluate(()=>{
  S.inf=500;S.owned.add("ord");recompute(S);
  S.owned.add("plate");recompute(S);checkCombos(S);
});
await sleep(600);
await shot("06-synergy-modal");
await p.evaluate(()=>{const b=document.getElementById("synDone");if(b)b.click();});
await sleep(400);

/* 5) aftermath with the machine note: heavy story machine + a loud option */
await p.evaluate(()=>{
  S.fx.sup=14;   /* post-recompute override: probe the receipt, not the tree */
  showEvent({id:"probe_ev",kick:"Probe",t:"A very loud week",b:"The probe pushes suspicion up to watch the receipt explain the machine.",
    o:[{l:"Run it loud",h:"suspicion way up",f:s=>{bumpSus(s,10);}}]});
});
await sleep(900);                       /* arming window is 450ms */
await p.evaluate(()=>{const b=document.querySelector('[data-opt="0"]');if(b)b.click();});
await sleep(500);
await shot("07-aftermath-machine-note");
await p.evaluate(()=>{const b=document.getElementById("evDone");if(b)b.click();});

/* 6) portrait HUD: the 4th stat must not wreck the tuned wrap */
await p.setViewport(P);
await sleep(900);
await p.evaluate(()=>{paintHud();});
await sleep(400);
await shot("08-hud-suspicion-portrait");

console.log("page errors:",errs.length?errs.join(" | "):"none");
await br.close();
