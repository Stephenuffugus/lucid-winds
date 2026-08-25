import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
await p.setViewport({width:375,height:667,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2400);
await p.evaluate(()=>{document.querySelector('[data-m="CRISIS"]').click();});
await sleep(250);
await p.evaluate(()=>document.getElementById("startBtn").click());await sleep(1300);
const pt=await p.evaluate(()=>{
  const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  for(let fy=0.15;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
    const[wx,wy]=window._dbgPv.toWorld(r.width*fx,r.height*fy);
    const hit=countryAtPoint(wx,wy);
    if(hit&&hit.n==="Brazil")return{x:r.x+r.width*fx,y:r.y+r.height*fy};}
  return null;});
await p.touchscreen.tap(pt.x,pt.y);await sleep(400);
await p.evaluate(()=>document.getElementById("beginBtn").click());await sleep(1700);
/* age the HQ region so the bars have something to show */
await p.evaluate(()=>{const r=S.regions.SA;r.coverage=0.42;r.unrest=51;r.resist=33;r.suspicion=22;r.compliance=0.61;
  showRpop('SA','Brazil',140,260);refreshRpop();});
await sleep(400);
await p.screenshot({path:"/workspaces/lucid-winds/portal-assets/review/ftw-notes-aug25/03-rpop-bars.png"});
console.log("bars:",await p.evaluate(()=>[...document.querySelectorAll('#rpop .rpB .m .k')].map(e=>e.textContent.trim())));
console.log("title:",await p.evaluate(()=>document.querySelector('#rpop .rpH').textContent));
await br.close();
