/* Shots for the Aug 25 Assets11 pass: diff ring, FD event art, cast
   portraits, bigger bubbles, and the epilogue reel on both end screens. */
import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-assets11-aug25";
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
p.on("pageerror",e=>console.log("pageerror:",String(e).slice(0,200)));
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");localStorage.removeItem("ftw_run");}catch(e){}});

/* ---- 1. the menu: diff selection ring (portrait, the played orientation) */
await p.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2200);
await p.evaluate(()=>document.getElementById("diffs").scrollIntoView({block:"center"}));
await sleep(400);
await p.screenshot({path:OUT+"/menu_diff_ring.png"});
console.log("shot menu_diff_ring");
/* select a different one so the ring is proven to MOVE */
await p.evaluate(()=>{const b=[...document.querySelectorAll(".diffbtn")];if(b[2])b[2].click();});
await sleep(400);
await p.screenshot({path:OUT+"/menu_diff_ring_moved.png"});
console.log("shot menu_diff_ring_moved");

/* ---- 2. into a run (landscape) for events, bubbles, endings */
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

/* FD modals with their plates + the new portraits */
for(const id of ["vance_arc2","dataq","audit_arc2","lena_arc2"]){
  await p.evaluate(x=>{S.cash=5000*MONEY;S.evHeat=0.13;
    const m=document.getElementById("modal");if(m.classList.contains("on"))noteCloseModal();
    showEvent(S.events.find(e=>e.id===x));},id);
  await sleep(700);
  await p.screenshot({path:OUT+"/fd_"+id+".png"});
  console.log("shot fd_"+id);
}
await p.evaluate(()=>noteCloseModal()); await sleep(300);

/* bubbles, forced to spawn so the new size is visible */
await p.evaluate(()=>{for(let i=0;i<6;i++)spawnBubble(S);}); await sleep(600);
await p.screenshot({path:OUT+"/bubbles.png"}); console.log("shot bubbles");

/* ---- 3. endings: win and loss with the epilogue revealed */
await p.evaluate(()=>{S.subj=0.975;S.oversight=41;S.outlet=1;S.fdPagesEver=7;S.evPaid=4;
  S.warHeat=0.5;S.doctrine="glove";S.popWatched=S.popWatched||5;S.popCompliant=S.popCompliant||3;
  finish(true,"win_econ");});
await sleep(900);
await p.evaluate(()=>document.getElementById("endStory").click()); await sleep(1100);
await p.screenshot({path:OUT+"/end_win_epilogue.png",fullPage:false});
console.log("shot end_win_epilogue");
console.log("win beats:",await p.evaluate(()=>[...document.querySelectorAll("#endStory p")].map(e=>e.textContent.slice(0,60))));

await p.evaluate(()=>{S.over=false;S.lostCount=4;S.doctrine="fist";finish(false,"refusal");});
await sleep(900);
await p.evaluate(()=>document.getElementById("endStory").click()); await sleep(1100);
await p.screenshot({path:OUT+"/end_loss_epilogue.png"});
console.log("shot end_loss_epilogue");
console.log("loss beats:",await p.evaluate(()=>[...document.querySelectorAll("#endStory p")].map(e=>e.textContent.slice(0,60))));

await br.close();
console.log("DONE ->",OUT);
