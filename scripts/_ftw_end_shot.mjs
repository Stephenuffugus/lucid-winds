import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
await p.setViewport({width:375,height:667,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2400);
await p.evaluate(()=>{document.querySelector('[data-m="CRISIS"]').click();});await sleep(250);
await p.evaluate(()=>document.getElementById("startBtn").click());await sleep(1300);
const pt=await p.evaluate(()=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  for(let fy=0.15;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
    const[wx,wy]=window._dbgPv.toWorld(r.width*fx,r.height*fy);
    const hit=countryAtPoint(wx,wy);if(hit&&hit.n==="Brazil")return{x:r.x+r.width*fx,y:r.y+r.height*fy};}return null;});
await p.touchscreen.tap(pt.x,pt.y);await sleep(400);
await p.evaluate(()=>document.getElementById("beginBtn").click());await sleep(1700);
await p.evaluate(()=>finish(true,'win'));
await sleep(1900);
await p.screenshot({path:"/workspaces/lucid-winds/portal-assets/review/ftw-notes-aug25/10-end-reel-statwait.png"});
console.log("title visible:",await p.evaluate(()=>{
  const t=document.getElementById("endTitle").getBoundingClientRect();
  return {top:t.top,vis:t.top>=0&&t.top<innerHeight&&t.height>0,txt:document.getElementById("endTitle").textContent};}));
await sleep(7000);
await p.screenshot({path:"/workspaces/lucid-winds/portal-assets/review/ftw-notes-aug25/10b-end-reel-mid.png"});
await p.evaluate(()=>document.getElementById("endStory").click());await sleep(1500);
await p.screenshot({path:"/workspaces/lucid-winds/portal-assets/review/ftw-notes-aug25/11-end-stats-in.png"});
console.log("statsIn opacity:",await p.evaluate(()=>getComputedStyle(document.getElementById("endStats")).opacity));
await br.close();
