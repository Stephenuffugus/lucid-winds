import puppeteer from "puppeteer";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-aug27";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,180)));
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
// enter a 2nd market -> First Contract fires on the next tick's achCheck
const fired=await p.evaluate(()=>{setSpeed(0);
  const R2=REGIONS.find(R=>!S.regions[R.id].active);
  const x=S.regions[R2.id];x.active=true;x.coverage=0.1;S.activeCount++;
  achCheck(S,false);
  const el=document.getElementById("achpop");
  return {onClass:el.classList.contains("on"), html:el.innerHTML.slice(0,80), earned:(getRecs().ach||[])};
});
console.log("first-contract:",JSON.stringify(fired));
await sleep(700);
await p.screenshot({path:`${OUT}/20-achievement-moment.png`});
// Feed ledger: award a few more, open Feed
await p.evaluate(()=>{
  ['a_total','a_glove','a_photo'].forEach(id=>{const r=getRecs();r.ach=r.ach||[];if(r.ach.indexOf(id)<0){r.ach.push(id);localStorage.setItem('ftw_recs',JSON.stringify(r));}});
  openSheet('log');
});
await sleep(700);
await p.screenshot({path:`${OUT}/21-achievement-ledger.png`});
console.log("page errors:",errs.length?errs.join(" | "):"none");
await br.close();
