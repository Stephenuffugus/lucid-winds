import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-assets11-aug25";
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
p.on("pageerror",e=>console.log("pageerror:",String(e).slice(0,200)));
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
/* the new kesh plates */
for(const id of ["kesh_arc1","kesh_arc2","kesh_arc3"]){
  await p.evaluate(x=>{S.cash=5000*MONEY;
    const m=document.getElementById("modal");if(m.classList.contains("on"))noteCloseModal();
    showEvent(S.events.find(e=>e.id===x));},id);
  await sleep(600);
  await p.screenshot({path:OUT+"/plate_"+id+".png"}); console.log("shot",id);
}
await p.evaluate(()=>noteCloseModal()); await sleep(200);
/* the three win doors */
for(const why of ["win_glove","win_fist","win_econ"]){
  await p.evaluate(w=>{S.over=false;S.subj=0.975;S.oversight=40;S.doctrine=w==="win_fist"?"fist":"glove";
    finish(true,w);},why);
  await sleep(700);
  await p.evaluate(()=>document.getElementById("endStory").click()); await sleep(400);
  await p.screenshot({path:OUT+"/end_"+why+".png"}); console.log("shot",why);
  await p.evaluate(()=>document.getElementById("end").classList.remove("on"));
}
await br.close(); console.log("DONE");
