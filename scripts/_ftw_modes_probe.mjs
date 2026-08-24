/* Item 4 of the Aug 24 evening pass: mode identity made visible.
   Deep Partnership briefing banner + leak chips; Crisis tree discount header. */
import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-modes-aug24";
fs.mkdirSync(OUT,{recursive:true});
const L={width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});

async function boot(mode){
  const p=await br.newPage();
  p.on("pageerror",e=>console.log("pageerror:",String(e).slice(0,160)));
  await p.evaluateOnNewDocument(()=>{
    try{localStorage.setItem("sws_dev_ok","1");localStorage.removeItem("ftw_run");}catch(e){}
    const hide=()=>{const s=document.createElement("style");
      s.textContent=".lwfb-fab,#lwfb-fab,[id*=lwfb]{display:none !important}";document.head.appendChild(s);};
    if(document.head)hide(); else document.addEventListener("DOMContentLoaded",hide);
  });
  await p.setViewport(L);
  await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
  await sleep(2400);
  const picked=await p.evaluate(m=>{
    const b=[...document.querySelectorAll(".modecard")].find(x=>x.dataset.m===m);
    if(!b)return false; b.click(); return true;
  },mode);
  if(!picked){console.log("ABORT: no modecard for "+mode);process.exit(1);}
  await sleep(400);
  await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1400);
  const pick=await p.evaluate(()=>{
    const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
    for(let fy=0.2;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.6;fx+=0.02){
      const sx=r.width*fx, sy=r.height*fy;
      const[wx,wy]=window._dbgPv.toWorld(sx,sy);
      const hit=countryAtPoint(wx,wy);
      if(hit&&hit.n==="United States of America")return{x:r.x+sx,y:r.y+sy};
    } return null;});
  await p.touchscreen.tap(pick.x,pick.y);await sleep(600);
  await p.evaluate(()=>document.getElementById("beginBtn").click()); await sleep(2400);
  return p;
}

/* DEEP PARTNERSHIP: banner at boot, leak chips in World tab */
{
  const p=await boot("DEEPSTATE");
  console.log("briefing news:",await p.evaluate(()=>S.log.map(l=>l.t).find(t=>/DEEP PARTNERSHIP/.test(t))||"(MISSING)"));
  console.log("banner up:",await p.evaluate(()=>document.getElementById("breaking").classList.contains("on")));
  await p.screenshot({path:`${OUT}/01_deepstate_briefing.png`});
  await p.evaluate(()=>{document.getElementById("guideSkip")&&document.getElementById("guideSkip").click();}); await sleep(300);
  await p.evaluate(()=>openSheet("reg")); await sleep(700);
  console.log("leak chips:",await p.evaluate(()=>[...document.querySelectorAll(".chip.leak")].length));
  await p.evaluate(()=>{document.getElementById("rc_WE").scrollIntoView({block:"center"});}); await sleep(300);
  await p.screenshot({path:`${OUT}/02_deepstate_leak_chips.png`});
  await p.close();
}
/* CRISIS: tree header chip */
{
  const p=await boot("CRISIS");
  console.log("crisis briefing:",await p.evaluate(()=>S.log.map(l=>l.t).find(t=>/CRISIS ENGINE/.test(t))||"(MISSING)"));
  await p.evaluate(()=>{document.getElementById("guideSkip")&&document.getElementById("guideSkip").click();}); await sleep(300);
  await p.evaluate(()=>openSheet("war")); await sleep(700);
  console.log("tree header chip:",await p.evaluate(()=>{
    const d=[...document.querySelectorAll(".treedesc")].map(e=>e.textContent).find(t=>/CRISIS ENGINE/.test(t));return d?d.slice(0,90):"(MISSING)";}));
  await p.screenshot({path:`${OUT}/03_crisis_tree_header.png`});
  await p.close();
}
await br.close();
console.log("done");
