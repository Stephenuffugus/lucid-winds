import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
await p.setViewport({width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true});
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
await p.evaluate(()=>doctrineModal());await sleep(450);
await p.screenshot({path:"/workspaces/lucid-winds/portal-assets/review/ftw-notes-aug25/12-doctrine-landscape.png"});
console.log(await p.evaluate(()=>{
  const card=document.getElementById("modalCard");
  const imgs=[...document.querySelectorAll(".docart")].map(i=>{const r=i.getBoundingClientRect();
    return{top:r.top,bottom:r.bottom,inView:r.top>=0&&r.bottom<=innerHeight};});
  const opts=[...document.querySelectorAll(".docopt")].map(o=>{const r=o.getBoundingClientRect();
    return{bottom:Math.round(r.bottom),inView:r.bottom<=innerHeight};});
  return{scroll:card.scrollHeight>card.clientHeight+2,imgs,opts,vh:innerHeight};}));
await br.close();
