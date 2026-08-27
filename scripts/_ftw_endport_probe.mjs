import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
await p.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2400);
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
await p.evaluate(()=>{S.day=1296;S.oversight=100;finish(false,"coalition");});
await sleep(3400);
await p.screenshot({path:"/workspaces/lucid-winds/portal-assets/review/ftw-aug27/16-loss-portrait.png"});
console.log("shot 16 portrait");
await br.close();
