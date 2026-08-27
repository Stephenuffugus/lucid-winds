/* Aug 27 probe 2: portrait HUD date must be WHOLE with the 4th stat, and the
   Enter market button must read lit when affordable, dead + why when not. */
import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-aug27";
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const errs=[];
p.on("pageerror",e=>errs.push("pageerror: "+String(e).slice(0,220)));
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
await p.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2400);
await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1200);
const tap=await p.evaluate(()=>{
  const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  for(let fy=0.05;fy<0.95;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
    const sx=r.width*fx, sy=r.height*fy;
    const[wx,wy]=window._dbgPv.toWorld(sx,sy);
    const hit=countryAtPoint(wx,wy);
    if(hit&&hit.n==="United States of America")return{x:r.x+sx,y:r.y+sy};
  }return null;
});
if(tap){await p.touchscreen.tap(tap.x,tap.y);await sleep(600);}
await p.evaluate(()=>{const b=document.getElementById("beginBtn");if(b&&!b.disabled)b.click();});
await sleep(2200);
await p.evaluate(()=>{setSpeed(0);
  /* worst-case widths: a long month date, billions, fat influence, red suspicion */
  S.day=328; S.cash=5.02e9; S.inf=522;
  REGIONS.slice(0,6).forEach(R=>{const x=S.regions[R.id];x.active=true;x.suspicion=17;});
  S.avgSus=17; paintHud();});
await sleep(300);
const trunc=await p.evaluate(()=>{
  const out={};
  ["vDate","vCash","vInf","vSusHud"].forEach(id=>{const e=document.getElementById(id);
    out[id]={w:e.scrollWidth,c:e.clientWidth,cut:e.scrollWidth>e.clientWidth+1,t:e.textContent};});
  const row=document.querySelector(".hudrow");
  out.rowOverflow=row.scrollWidth>row.clientWidth+1;
  return out;
});
console.log("portrait truncation:",JSON.stringify(trunc));
await p.screenshot({path:`${OUT}/09-hud-portrait-fixed.png`});
if(Object.values(trunc).some(v=>v&&v.cut)||trunc.rowOverflow){console.log("FAIL: HUD still truncates");}

/* Enter market states, landscape */
await p.setViewport({width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await sleep(800);
await p.evaluate(()=>{S.cash=5e9;openSheet("reg");});
await sleep(600);
const st=await p.evaluate(()=>{
  const b=document.querySelector("[data-enter]");
  if(!b)return{err:"no enter button found"};
  b.scrollIntoView({block:"center"});
  const cs=getComputedStyle(b);
  return{disabled:b.disabled,glow:cs.boxShadow!=="none",txt:b.textContent.trim().slice(0,60)};
});
console.log("enter (rich):",JSON.stringify(st));
await sleep(400);
await p.screenshot({path:`${OUT}/10-enter-market-lit.png`});
await p.evaluate(()=>{S.cash=12;renderSheet("reg");});
await sleep(300);
const st2=await p.evaluate(()=>{
  const b=document.querySelector("[data-enter]");
  if(!b)return{err:"no enter button"};
  b.scrollIntoView({block:"center"});
  const cs=getComputedStyle(b);
  return{disabled:b.disabled,glow:cs.boxShadow!=="none",why:(b.querySelector(".why")||{}).textContent||""};
});
console.log("enter (broke):",JSON.stringify(st2));
await sleep(400);
await p.screenshot({path:`${OUT}/11-enter-market-broke.png`});
const okLit=st.disabled===false&&st.glow===true;
const okBroke=st2.disabled===true&&st2.glow===false&&/short on cash/.test(st2.why);
console.log(okLit&&okBroke?"ENTER MARKET STATES OK":"FAIL enter market states");
console.log("page errors:",errs.length?errs.join(" | "):"none");
await br.close();
