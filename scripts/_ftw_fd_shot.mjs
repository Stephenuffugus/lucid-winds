import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-menu-aug24";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
p.on("pageerror",e=>console.log("pageerror:",String(e).slice(0,150)));
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");localStorage.removeItem("ftw_run");}catch(e){}});
await p.setViewport({width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2400);
await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1200);
const pick=await p.evaluate(()=>{
  const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  for(let fy=0.2;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.6;fx+=0.02){
    const[wx,wy]=window._dbgPv.toWorld(r.width*fx,r.height*fy);
    const hit=countryAtPoint(wx,wy);
    if(hit&&hit.n==="United States of America")return{x:r.x+r.width*fx,y:r.y+r.height*fy};
  } return null;});
await p.touchscreen.tap(pick.x,pick.y);await sleep(500);
await p.evaluate(()=>document.getElementById("beginBtn").click()); await sleep(2200);
await p.evaluate(()=>{const g=document.getElementById("guideSkip");if(g)g.click();}); await sleep(300);
console.log("fdOn this run:",await p.evaluate(()=>JSON.stringify(S.fdOn)));
await p.evaluate(()=>{S.cash=5000*MONEY;S.evHeat=0.13;showEvent(S.events.find(e=>e.id==='vance_arc2'));}); await sleep(600);
await p.screenshot({path:`${OUT}/fd_vance2_modal.png`}); console.log("shot vance2");
await p.evaluate(()=>{noteCloseModal();showEvent(S.events.find(e=>e.id==='dataq'));}); await sleep(600);
await p.screenshot({path:`${OUT}/fd_dataq_modal.png`}); console.log("shot dataq");
await br.close();
