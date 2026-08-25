/* Aug 25 notes pass, looked at rather than trusted: doctrine cards uncropped
   beside their text, event plates contained, aftermath receipt, rpop bars +
   pause, refusal strip, capstone cards unclipped, staged end sequence,
   crisis guide, tips toggle. */
import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-notes-aug25";
fs.mkdirSync(OUT,{recursive:true});
const PORT={width:375,height:667,deviceScaleFactor:2,isMobile:true,hasTouch:true};
const LAND={width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const errs=[];
async function newPage(vp){
  const p=await br.newPage();
  p.on("pageerror",e=>errs.push("pageerror: "+String(e).slice(0,200)));
  p.on("console",m=>{if(m.type()==="error")errs.push("console: "+m.text().slice(0,160));});
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
  await p.setViewport(vp);
  await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
  await sleep(2400);
  return p;
}
async function shot(p,n){await p.screenshot({path:`${OUT}/${n}.png`});console.log("shot "+n);}
async function startCrisis(p){
  await p.evaluate(()=>{document.querySelector('[data-m="CRISIS"]').click();});
  await sleep(300);
  await p.evaluate(()=>document.getElementById("startBtn").click());
  await sleep(1400);
  const pt=await p.evaluate(()=>{
    const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
    for(let fy=0.15;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
      const sx=r.width*fx, sy=r.height*fy;
      const[wx,wy]=window._dbgPv.toWorld(sx,sy);
      const hit=countryAtPoint(wx,wy);
      if(hit&&hit.n==="Brazil")return{x:r.x+r.width*fx,y:r.y+r.height*fy};
    }
    return null;});
  if(!pt){console.log("NO PICK POINT");process.exit(2);}
  await p.touchscreen.tap(pt.x,pt.y);await sleep(500);
  await p.evaluate(()=>document.getElementById("beginBtn").click());
  await sleep(1800);
}

/* ---------- portrait page ---------- */
const p=await newPage(PORT);
await shot(p,"01-menu-tips");
const tipsRow=await p.evaluate(()=>{const t=document.getElementById("tipsChk");if(!t)return null;
  const r=t.closest("label").getBoundingClientRect();return{h:r.height,checked:t.checked};});
console.log("tips row:",JSON.stringify(tipsRow));
await startCrisis(p);
await shot(p,"02-guide-crisis");
console.log("guide beat:",await p.evaluate(()=>document.getElementById("guideTxt").textContent.slice(0,90)));

/* rpop: tap the HQ region on the live map */
const rp=await p.evaluate(()=>{
  const c=document.getElementById("map");const r=c.getBoundingClientRect();
  for(let fy=0.2;fy<0.9;fy+=0.03)for(let fx=0.1;fx<0.9;fx+=0.03){
    const sx=r.width*fx, sy=r.height*fy;
    const[wx,wy]=window._dbgGv.toWorld(sx,sy);
    if(regionAtPoint(wx,wy))return{x:r.x+r.width*fx,y:r.y+r.height*fy};
  }return null;});
await p.touchscreen.tap(rp.x,rp.y);await sleep(600);
console.log("rpop paused? speed=",await p.evaluate(()=>S.speed),
  " bars=",await p.evaluate(()=>document.querySelectorAll("#rpop .rpB .m").length));
await shot(p,"03-rpop-bars");
await p.touchscreen.tap(rp.x,rp.y);await sleep(400);
console.log("after close speed=",await p.evaluate(()=>S.speed));

/* doctrine modal */
await p.evaluate(()=>doctrineModal());await sleep(400);
await shot(p,"04-doctrine-portrait");
const doc=await p.evaluate(()=>{
  const im=document.querySelector(".docart");const r=im.getBoundingClientRect();
  const card=document.getElementById("modalCard").getBoundingClientRect();
  return{imgW:r.width,imgH:r.height,natural:[im.naturalWidth,im.naturalHeight],
    cardBottom:card.bottom,vh:innerHeight,fits:card.bottom<=innerHeight};});
console.log("doctrine:",JSON.stringify(doc));
await p.evaluate(()=>document.querySelector('[data-doc="glove"]').click());await sleep(300);

/* committee event + aftermath */
await p.evaluate(()=>{S.cash=5e8*window.MONEY||S.cash;showEvent(S.events.find(e=>e.id==='kesh_arc3'));});
await sleep(300);
console.log("armed early-click ignored? ",await p.evaluate(()=>{
  const b=document.querySelector('[data-opt]');const before=document.getElementById("modalCard").innerHTML.length;
  b&&b.click();return document.getElementById("modalCard").innerHTML.length===before;}));
await sleep(600);
await shot(p,"05-event-committee");
const ev=await p.evaluate(()=>{const im=document.querySelector(".evart");if(!im)return null;
  const r=im.getBoundingClientRect();return{w:r.width,h:r.height,natural:[im.naturalWidth,im.naturalHeight],
    ratioShown:(r.w||r.width)/(r.height)};});
console.log("evart:",JSON.stringify(ev));
await p.evaluate(()=>{const bs=document.querySelectorAll('[data-opt]');bs[bs.length-1].click();});
await sleep(400);
await shot(p,"06-event-aftermath");
console.log("aftermath rows:",await p.evaluate(()=>{const e=document.querySelector(".evrcpt");return e?e.textContent:null;}));
await p.evaluate(()=>{const d=document.getElementById("evDone");d&&d.click();});await sleep(300);

/* refusal strip */
await p.evaluate(()=>{S.lostCount=3;const r=S.regions.EA;r.active=true;r.pstate='uprising';paintHud();});
await sleep(200);
await shot(p,"07-hud-refusal");
console.log("refusal:",await p.evaluate(()=>{const e=document.getElementById("refusal");
  return{on:e.classList.contains("on"),blink:e.classList.contains("blink"),txt:e.textContent};}));
await p.evaluate(()=>{S.lostCount=0;S.regions.EA.pstate='calm';paintHud();});

/* war tree capstone, portrait */
await p.evaluate(()=>openSheet('war'));await sleep(500);
await p.evaluate(()=>{const el=document.getElementById("nd_caps_war");el&&el.scrollIntoView({block:"center"});});
await sleep(300);
await shot(p,"08-tree-war-capstone-portrait");
console.log("capstone portrait:",await p.evaluate(()=>{const el=document.getElementById("nd_caps_war");
  const ds=el.querySelector(".ds");return{ml:getComputedStyle(ds).marginLeft,clip:ds.scrollHeight>ds.clientHeight+2,
    dsText:ds.textContent.slice(0,40)};}));
await p.evaluate(()=>closeSheet());await sleep(300);

/* end sequence */
await p.evaluate(()=>finish(true,'win'));
await sleep(600);
await shot(p,"09-end-fading");
await sleep(1200);
await shot(p,"10-end-reel-statwait");
console.log("statwait:",await p.evaluate(()=>{const e=document.getElementById("end");
  return{statwait:e.classList.contains("statwait"),
    statsOpacity:getComputedStyle(document.getElementById("endStats")).opacity};}));
await p.evaluate(()=>document.getElementById("endStory").click());await sleep(1400);
await shot(p,"11-end-stats-in");
console.log("stats in:",await p.evaluate(()=>getComputedStyle(document.getElementById("endStats")).opacity));

/* ---------- landscape page ---------- */
const q=await newPage(LAND);
await startCrisis(q);
await q.evaluate(()=>doctrineModal());await sleep(400);
await shot(q,"12-doctrine-landscape");
console.log("doctrine landscape fits:",await q.evaluate(()=>{
  const card=document.getElementById("modalCard").getBoundingClientRect();
  return{bottom:card.bottom,vh:innerHeight,fits:card.bottom<=innerHeight+1};}));
await q.evaluate(()=>document.querySelector('[data-doc="glove"]').click());await sleep(300);
await q.evaluate(()=>openSheet('war'));await sleep(500);
await q.evaluate(()=>{const el=document.getElementById("nd_caps_war");el&&el.scrollIntoView({block:"center"});});
await sleep(300);
await shot(q,"13-tree-war-capstone-landscape");
console.log("capstone landscape:",await q.evaluate(()=>{const el=document.getElementById("nd_caps_war");
  const ds=el.querySelector(".ds");return{ml:getComputedStyle(ds).marginLeft,clip:ds.scrollHeight>ds.clientHeight+2,
    cardH:el.offsetHeight};}));

await br.close();
console.log("errors:",errs.length?errs.join(" | "):"none");
