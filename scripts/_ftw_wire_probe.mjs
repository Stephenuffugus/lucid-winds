/* Wire engine probe: the corpus must load on the real page, match the run,
   and land a reactive line in the actual ticker. Looked at, not trusted. */
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

const res=await p.evaluate(()=>{
  const out={corpus:(window.WIRE_CORPUS||[]).length};
  setSpeed(0);
  S.day=120; S.owned.add("pilot"); S.owned.add("school"); recompute(S);
  const w=wirePick(S);
  out.picked=w?w.id:null;
  if(w){wireFire(S,w); out.text=S.log[0]&&S.log[0].t; refreshTicker();
    out.ticker=document.getElementById("tickTrack").textContent.slice(0,200);
    out.braces=/[{}]/.test(out.text||"");}
  return out;
});
console.log(JSON.stringify(res,null,1));
await sleep(500);
await p.screenshot({path:`${OUT}/12-wire-corpus-line.png`});
console.log("shot 12-wire-corpus-line");
console.log("page errors:",errs.length?errs.join(" | "):"none");
const ok=res.corpus>=55&&res.picked&&!res.braces&&res.ticker&&res.ticker.length>40;
console.log(ok?"WIRE ENGINE LIVE OK":"FAIL wire engine");
await br.close();
