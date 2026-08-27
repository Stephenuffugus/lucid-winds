/* Flight recorder probe: play real moves, end the run, export the tape, and
   feed it to the coach script. The button must exist for the dev flag and
   stay hidden without it. */
import puppeteer from "puppeteer";
import fs from "fs";
import {execSync} from "child_process";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-aug27";
const SC="/tmp/claude-1000/-workspaces-lucid-winds/11775a56-84ad-44dd-843d-2127bac5510b/scratchpad";
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});

async function boot(page,dev){
  if(dev)await page.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
  await page.setViewport({width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await page.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
  await sleep(2400);
  await page.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1200);
  const tap=await page.evaluate(()=>{
    const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
    for(let fy=0.05;fy<0.95;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
      const sx=r.width*fx, sy=r.height*fy;
      const[wx,wy]=window._dbgPv.toWorld(sx,sy);
      const hit=countryAtPoint(wx,wy);
      if(hit&&hit.n==="United States of America")return{x:r.x+sx,y:r.y+sy};
    }return null;
  });
  if(tap){await page.touchscreen.tap(tap.x,tap.y);await sleep(600);}
  await page.evaluate(()=>{const b=document.getElementById("beginBtn");if(b&&!b.disabled)b.click();});
  await sleep(2200);
}

/* --- dev-flagged page: play, end, export --- */
const p=await br.newPage();
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,180)));
await boot(p,true);
await p.evaluate(()=>{
  setSpeed(0);
  S.inf=500;buyNode("ord");buyNode("pilot");
  /* run some sim days so snapshots land */
  for(let i=0;i<120;i++)tick();
  const gl=COUNTRIES.find(c=>c.n==="Greenland");
  const x=S.regions[gl.r];x.active=true;x.coverage=0.4;
  S.cash=5e9;doAction("concede",gl.r);S._concArm={rid:gl.r,at:Date.now()};doAction("concede",gl.r);
  for(let i=0;i<40;i++)tick();
  S.day=Math.max(S.day,400);S.oversight=100;finish(false,"coalition");
});
await sleep(3200);
const res=await p.evaluate(()=>{
  const dump=JSON.parse(FTW_FLIGHT.dump());
  const fb=document.getElementById("flightBtn");
  return{entries:dump.log.length,kinds:[...new Set(dump.log.map(e=>e.k))].sort(),
    header:dump.h,btnShown:fb&&fb.style.display!=="none",raw:FTW_FLIGHT.dump()};
});
console.log("entries:",res.entries,"kinds:",res.kinds.join(","));
console.log("header:",JSON.stringify(res.header),"button shown:",res.btnShown);
fs.writeFileSync(`${SC}/probe_runlog.json`,res.raw);
await p.screenshot({path:`${OUT}/17-flight-button.png`});
console.log("page errors:",errs.length?errs.join(" | "):"none");

/* --- plain player: the button must stay hidden. A flagless page cannot even
   boot headless (dev-gate blocks bots - the reason probes set the flag), so
   the honest test is in-page: drop the flag, re-run the ending, assert. --- */
const hidden=await p.evaluate(()=>{
  try{localStorage.removeItem("sws_dev_ok");}catch(e){}
  finish(false,"coalition");
  const fb=document.getElementById("flightBtn");
  const out=fb&&fb.style.display==="none";
  try{localStorage.setItem("sws_dev_ok","1");}catch(e){}
  return out;
});
console.log("plain player button hidden:",hidden);
await br.close();

/* --- the coach reads the tape --- */
console.log("\n--- coach output on the probe tape ---");
console.log(execSync(`node /workspaces/lucid-winds/scripts/ftw_coach.mjs ${SC}/probe_runlog.json`).toString());
const okAll=res.entries>4&&["snap","node","act","end"].every(k=>res.kinds.includes(k))&&res.btnShown&&hidden;
console.log(okAll?"FLIGHT RECORDER OK":"FAIL flight recorder");
