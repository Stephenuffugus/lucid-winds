import puppeteer from "puppeteer";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-aug27";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,180)));
// FTW is public now — no dev flag needed, but set it so nothing else gates
await p.setViewport({width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2600);
await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1200);
const tap=await p.evaluate(()=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  for(let fy=0.05;fy<0.95;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){const sx=r.width*fx,sy=r.height*fy;
    const[wx,wy]=window._dbgPv.toWorld(sx,sy);const h=countryAtPoint(wx,wy);
    if(h&&h.n==="United States of America")return{x:r.x+sx,y:r.y+sy};}return null;});
if(tap){await p.touchscreen.tap(tap.x,tap.y);await sleep(600);}
await p.evaluate(()=>{const b=document.getElementById("beginBtn");if(b&&!b.disabled)b.click();});
await sleep(2200);
// force THE TICKET MACHINE (ord + plate)
await p.evaluate(()=>{setSpeed(0);S.inf=500;S.owned.add("ord");recompute(S);S.owned.add("plate");recompute(S);checkCombos(S);});
await sleep(900);
const st=await p.evaluate(()=>{const img=document.querySelector("#modalCard .synart");
  return{hasImg:!!img,natural:img?img.naturalWidth+"x"+img.naturalHeight:null,src:img?img.getAttribute("src"):null,
    modalOpen:document.getElementById("modal").classList.contains("on")};});
console.log("synergy modal:",JSON.stringify(st));
await p.screenshot({path:`${OUT}/18-synergy-plate.png`});
console.log("page errors:",errs.length?errs.join(" | "):"none");
await br.close();
