import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/tmp/claude-1000/-workspaces-lucid-winds/de9096cd-55a8-47ec-8dea-82aa7cb125d8/scratchpad/r2shots";
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");localStorage.removeItem("ftw_run");
  localStorage.setItem("ftw_guide_done","1");localStorage.setItem("ftw_seen",JSON.stringify({brief_CONTRACTOR:1}));}catch(e){}});
await p.setViewport({width:740,height:360,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2400);
await p.evaluate(()=>{document.querySelector('[data-m="CONTRACTOR"]').click();});await sleep(250);
await p.evaluate(()=>document.getElementById("startBtn").click());await sleep(1400);
const pt=await p.evaluate(()=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  for(let fy=0.15;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
    const[wx,wy]=window._dbgPv.toWorld(r.width*fx,r.height*fy);
    const hit=countryAtPoint(wx,wy);if(hit&&hit.n==="Brazil")return{x:r.x+r.width*fx,y:r.y+r.height*fy};}return null;});
await p.touchscreen.tap(pt.x,pt.y);await sleep(400);
await p.evaluate(()=>document.getElementById("beginBtn").click());await sleep(1900);
/* refusal strip in landscape */
await p.evaluate(()=>{S.lostCount=3;const w=S.regions.WE,e=S.regions.EE;
  w.active=true;w.pstate='uprising';e.active=true;e.pstate='uprising';paintHud();});
await sleep(300);
console.log("hud:",await p.evaluate(()=>({h:document.getElementById('hud').offsetHeight,inset:gv.inset})));
await p.screenshot({path:OUT+"/refusal-740x360.png"});
await p.evaluate(()=>{S.lostCount=0;S.regions.WE.pstate='calm';S.regions.EE.pstate='calm';paintHud();});
/* event modal: both options must be discoverable at 360h */
await p.evaluate(()=>{S.cash=9e8;showEvent(S.events.find(e=>e.id==='lena_arc2')||S.events.find(e=>e.id==='docu')||S.events.filter(e=>e.k==='choice')[0]);});
await sleep(700);
console.log("opts:",await p.evaluate(()=>[...document.querySelectorAll('[data-opt]')].map(b=>{const r=b.getBoundingClientRect();
  return {t:b.textContent.slice(0,16),top:Math.round(r.top),inView:r.top<innerHeight-8};})));
await p.screenshot({path:OUT+"/event-740x360.png"});
await br.close();
