/* Item 1 of the Aug 24 evening pass: Lobbying Blitz + Acquisition must hand the
   player a receipt with real numbers. Looked at, not trusted. */
import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-receipts-aug24";
fs.mkdirSync(OUT,{recursive:true});
const L={width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const errs=[];
p.on("pageerror",e=>errs.push("pageerror: "+String(e).slice(0,200)));
p.on("console",m=>{if(m.type()==="error")errs.push("console: "+m.text().slice(0,160));});
await p.evaluateOnNewDocument(()=>{
  try{localStorage.setItem("sws_dev_ok","1");}catch(e){}
  const hide=()=>{const s=document.createElement("style");
    s.textContent=".lwfb-fab,#lwfb-fab,[id*=lwfb]{display:none !important}";document.head.appendChild(s);};
  if(document.head)hide(); else document.addEventListener("DOMContentLoaded",hide);
});
await p.setViewport(L);
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2600);
async function shot(n){await p.screenshot({path:`${OUT}/${n}.png`});console.log("shot "+n);}

await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1400);
/* pick any region: ask the game's own hit test for the US */
const pick=await p.evaluate(()=>{
  const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  for(let fy=0.2;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.6;fx+=0.02){
    const sx=r.width*fx, sy=r.height*fy;
    const[wx,wy]=window._dbgPv.toWorld(sx,sy);
    const hit=countryAtPoint(wx,wy);
    if(hit&&hit.n==="United States of America")return{x:r.x+sx,y:r.y+sy};
  } return null;});
if(!pick){console.log("ABORT: no pick point");process.exit(1);}
await p.touchscreen.tap(pick.x,pick.y);await sleep(600);
await p.evaluate(()=>document.getElementById("beginBtn").click()); await sleep(2200);
await p.evaluate(()=>document.getElementById("guideSkip").click()); await sleep(400);

/* rich mid-game state: money, income, three markets held with room to grow */
await p.evaluate(()=>{
  S.cash=900*MONEY; S.net=40*MONEY; S.gross=55*MONEY; S.inf=20;
  ["NA","CA","SA"].forEach(id=>{const r=S.regions[id];r.active=true;r.coverage=0.3;});
  S.activeCount=3; setSpeed(0); openSheet("reg");
});
await sleep(700);

/* LOBBYING BLITZ: find the real button, prove the tap lands on it, tap it */
const lb=await p.evaluate(()=>{
  const b=document.querySelector("[data-lobby]"); if(!b)return null;
  b.scrollIntoView({block:"center"});
  const r=b.getBoundingClientRect(), x=r.x+r.width/2, y=r.y+r.height/2;
  const under=document.elementFromPoint(x,y);
  return{x,y,disabled:b.disabled,under:under?(under.closest("[data-lobby]")?"lobby-btn":under.tagName):"?"};
});
console.log("lobby button:",JSON.stringify(lb));
if(!lb||lb.disabled||lb.under!=="lobby-btn"){console.log("ABORT: lobby button not tappable");process.exit(1);}
await p.touchscreen.tap(lb.x,lb.y); await sleep(500);
console.log("lobby toast:",await p.evaluate(()=>{const t=document.querySelector("#toasts");return t?t.textContent.slice(0,160):"(none)";}));
console.log("lobby news:",await p.evaluate(()=>S.log&&S.log[0]?S.log[0].t.slice(0,160):"(none)"));
console.log("inf after (want 28):",await p.evaluate(()=>S.inf));
await shot("01_lobby_receipt");

/* ACQUISITION: same discipline */
const aq=await p.evaluate(()=>{
  const b=document.getElementById("acqBtn"); if(!b)return null;
  b.scrollIntoView({block:"center"});
  const r=b.getBoundingClientRect(), x=r.x+r.width/2, y=r.y+r.height/2;
  const under=document.elementFromPoint(x,y);
  return{x,y,disabled:b.disabled,under:under?(under.id==="acqBtn"||under.closest("#acqBtn")?"acq-btn":under.tagName):"?"};
});
console.log("acq button:",JSON.stringify(aq));
if(!aq||aq.disabled||aq.under!=="acq-btn"){console.log("ABORT: acq button not tappable");process.exit(1);}
const covBefore=await p.evaluate(()=>["NA","CA","SA"].map(id=>+(S.regions[id].coverage*100).toFixed(1)));
await p.touchscreen.tap(aq.x,aq.y); await sleep(500);
const covAfter=await p.evaluate(()=>["NA","CA","SA"].map(id=>+(S.regions[id].coverage*100).toFixed(1)));
console.log("coverage before/after:",JSON.stringify(covBefore),JSON.stringify(covAfter));
console.log("acq toast:",await p.evaluate(()=>{const t=document.querySelector("#toasts");return t?t.textContent.slice(0,200):"(none)";}));
console.log("acq news:",await p.evaluate(()=>S.log&&S.log[0]?S.log[0].t.slice(0,160):"(none)"));
await shot("02_acq_receipt");

console.log("\npage errors:",errs.length?errs:"none");
await br.close();
