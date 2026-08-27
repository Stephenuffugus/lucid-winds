import puppeteer from "puppeteer";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-aug27";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,150)));
await p.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2400);
await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1200);
const tap=await p.evaluate(()=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  for(let fy=0.05;fy<0.95;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){const sx=r.width*fx,sy=r.height*fy;
    const[wx,wy]=window._dbgPv.toWorld(sx,sy);const h=countryAtPoint(wx,wy);
    if(h&&h.n==="United States of America")return{x:r.x+sx,y:r.y+sy};}return null;});
if(tap){await p.touchscreen.tap(tap.x,tap.y);await sleep(600);}
await p.evaluate(()=>{const b=document.getElementById("beginBtn");if(b&&!b.disabled)b.click();});
await sleep(2200);
// THE WELCOME MAT = face + door
const r=await p.evaluate(()=>{setSpeed(0);S.inf=500;S.owned.add("face");recompute(S);S.owned.add("door");recompute(S);checkCombos(S);
  const img=document.querySelector("#modalCard .synart");
  return{src:img?img.getAttribute("src"):null,nat:img?img.naturalWidth:0};});
console.log("welcomemat plate:",JSON.stringify(r));
await sleep(700);
await p.screenshot({path:`${OUT}/23-welcomemat-plate.png`});
console.log("errors:",errs.length?errs.join(" | "):"none");
await br.close();
