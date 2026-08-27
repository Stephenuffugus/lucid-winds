/* Loss-ending slideshow probe: the better world must be BEHIND the verdict,
   cross-fade on schedule, and stay put when the text scrolls. Looked at. */
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
await p.setViewport({width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2600);
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

/* stage the patriotism loss the way the sim would reach it */
await p.evaluate(()=>{S.day=1296;S.oversight=100;finish(false,"coalition");});
await sleep(3400);            /* the 1.1s dissolve + fade-in + first beat */
await p.screenshot({path:`${OUT}/13-loss-slideshow-a.png`});
console.log("shot 13 (image A)");
const st=await p.evaluate(()=>{
  const els=[...document.querySelectorAll("#endShots .eshot")];
  return{n:els.length,on:els.findIndex(e=>e.classList.contains("on")),
    fixed:getComputedStyle(document.getElementById("endShots")).position,
    shotVar:document.getElementById("end").style.getPropertyValue("--shot")||"(none)"};
});
console.log("state:",JSON.stringify(st));
await sleep(9500);            /* one cycle: image B should be up */
await p.screenshot({path:`${OUT}/14-loss-slideshow-b.png`});
const st2=await p.evaluate(()=>[...document.querySelectorAll("#endShots .eshot")].findIndex(e=>e.classList.contains("on")));
console.log("shot 14 (image B), on-index:",st2);
/* scroll the verdict: the backdrop must not move */
await p.evaluate(()=>{const e=document.getElementById("end");e.scrollTop=e.scrollHeight;});
await sleep(700);
await p.screenshot({path:`${OUT}/15-loss-scrolled.png`});
console.log("shot 15 (scrolled to stats)");
console.log("page errors:",errs.length?errs.join(" | "):"none");
console.log(st.n===2&&st.fixed==="fixed"&&st.shotVar==="(none)"&&st2!==st.on?"LOSS SLIDESHOW OK":"FAIL loss slideshow");
await br.close();
