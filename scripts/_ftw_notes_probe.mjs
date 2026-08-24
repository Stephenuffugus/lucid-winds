/* Aug 24 win-notes pass, looked at rather than trusted: Canada as its own
   region, the danger tint, the paused banner with its X, the guide NEXT. */
import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-notes-aug24";
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
const live=()=>p.evaluate(()=>{const on=[...document.querySelectorAll(".screen")].filter(e=>e.classList.contains("on")).map(e=>e.id);return on.length?on.join(","):"(?)";});
async function shot(n){await p.screenshot({path:`${OUT}/${n}.png`});console.log("shot "+n+"  screen="+await live());}

await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1400);

/* find Canada on the pick map by asking the game's own hit test over a grid */
const can=await p.evaluate(()=>{
  const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  const pts=[];
  for(let fy=0.05;fy<0.95;fy+=0.015)for(let fx=0.05;fx<0.95;fx+=0.015){
    const sx=r.width*fx, sy=r.height*fy;
    const[wx,wy]=window._dbgPv.toWorld(sx,sy);
    const hit=countryAtPoint(wx,wy);
    if(hit&&hit.n==="Canada")pts.push([sx,sy]);
  }
  if(!pts.length)return null;
  const cx=pts.reduce((a,q)=>a+q[0],0)/pts.length, cy=pts.reduce((a,q)=>a+q[1],0)/pts.length;
  let best=pts[0],bd=1e9;
  for(const q of pts){const d=(q[0]-cx)**2+(q[1]-cy)**2;if(d<bd){bd=d;best=q;}}
  const el=document.elementFromPoint(r.x+best[0],r.y+best[1]);
  return{x:r.x+best[0],y:r.y+best[1],hits:pts.length,under:el?el.tagName+"#"+el.id:"?"};
});
console.log("canada tap point:",JSON.stringify(can));
if(can){await p.touchscreen.tap(can.x,can.y);await sleep(700);}
const pinfo=await p.evaluate(()=>document.getElementById("pickInfo").textContent.slice(0,140));
console.log("pickInfo:",pinfo);
if(!/Canada/.test(pinfo)){console.log("ABORT: Canada pick did not take");process.exit(1);}
console.log("beginBtn:",await p.evaluate(()=>document.getElementById("beginBtn").textContent));
await shot("01_pick_canada");

await p.evaluate(()=>document.getElementById("beginBtn").click()); await sleep(2400);
await shot("02_game_canada_hq_guide");   /* guide step 1 with NEXT visible */

/* walk the guide with the new NEXT button */
const nextShown=await p.evaluate(()=>getComputedStyle(document.getElementById("guideNext")).display!=="none");
console.log("guide NEXT visible:",nextShown);
await p.evaluate(()=>document.getElementById("guideNext").click()); await sleep(400);
await p.evaluate(()=>document.getElementById("guideNext").click()); await sleep(400);
console.log("guide advanced to:",await p.evaluate(()=>document.getElementById("guideTxt").textContent.slice(0,60)));
await p.evaluate(()=>document.getElementById("guideSkip").click()); await sleep(300);

/* force a spread of states to see the danger tint: US violent, WE organizing */
await p.evaluate(()=>{
  const us=S.regions.NA, we=S.regions.WE, ca=S.regions.CND;
  us.active=true;us.coverage=0.5;us.unrest=75;us.pstate="violent";
  we.active=true;we.coverage=0.4;we.unrest=40;we.resist=55;we.pstate="murmur";
  ca.coverage=0.35;
  drawWorld(gv,S,null);
});
await sleep(300);
await shot("03_danger_tint");

/* paused banner with X: pause, fire a crit line, verify it HOLDS */
await p.evaluate(()=>{setSpeed(0);pushNews(S,"Probe: this banner must hold while paused and carry an X.","crit");});
await sleep(9000);   /* longer than the old 5.2s death */
const held=await p.evaluate(()=>document.getElementById("breaking").classList.contains("on"));
console.log("banner still up after 9s paused:",held);
await shot("04_banner_paused_holds");
await p.evaluate(()=>document.getElementById("breakX").click()); await sleep(400);
console.log("banner dismissed by X:",await p.evaluate(()=>!document.getElementById("breaking").classList.contains("on")));

/* world tab: 15 cards incl United States + Canada, legends with MORE pill */
await p.evaluate(()=>{setSpeed(1);openSheet("reg");}); await sleep(700);
console.log("legend more pill:",await p.evaluate(()=>{
  const m=document.querySelector(".legend .lgm");if(!m)return "MISSING";
  const st=getComputedStyle(m,"::after");return getComputedStyle(m).display+" content="+st.content;}));
console.log("region cards:",await p.evaluate(()=>document.querySelectorAll(".rcard").length));
console.log("US card id rc_NA:",await p.evaluate(()=>!!document.getElementById("rc_NA")));
console.log("Canada card id rc_CND:",await p.evaluate(()=>!!document.getElementById("rc_CND")));
await shot("05_world_tab_top");
/* scroll persistence: scroll down, buy nothing, re-render, confirm kept */
await p.evaluate(()=>{const b=document.getElementById("shBody");b.scrollTop=600;renderSheet("reg");});
await sleep(300);
console.log("scroll kept after re-render:",await p.evaluate(()=>document.getElementById("shBody").scrollTop));
await p.evaluate(()=>{document.getElementById("rc_CND").scrollIntoView({block:"start"});}); await sleep(300);
await shot("06_world_canada_card");

/* the rpop with working numbers on a country poke (tap the US mid-country) */
await p.evaluate(()=>closeSheet()); await sleep(400);
const us=await p.evaluate(()=>{
  const w=document.getElementById("mapWrap").getBoundingClientRect();
  const pts=[];
  for(let fy=0.15;fy<0.95;fy+=0.015)for(let fx=0.02;fx<0.7;fx+=0.015){
    const sx=w.width*fx, sy=w.height*fy;
    const[wx,wy]=window._dbgGv.toWorld(sx,sy);
    const hit=countryAtPoint(wx,wy);
    if(hit&&hit.n==="United States of America")pts.push([sx,sy]);
  }
  if(!pts.length)return null;
  const cx=pts.reduce((a,q)=>a+q[0],0)/pts.length, cy=pts.reduce((a,q)=>a+q[1],0)/pts.length;
  let best=pts[0],bd=1e9;
  for(const q of pts){const d=(q[0]-cx)**2+(q[1]-cy)**2;if(d<bd){bd=d;best=q;}}
  return{x:w.x+best[0],y:w.y+best[1]};});
if(us){await p.touchscreen.tap(us.x,us.y);await sleep(600);}
console.log("rpop text:",await p.evaluate(()=>{const e=document.getElementById("rpop");return e.classList.contains("on")?e.textContent.slice(0,200):"(closed)";}));
await shot("07_rpop_us_stats");

console.log("\npage errors:",errs.length?errs:"none");
await br.close();
