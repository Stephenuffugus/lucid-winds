import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
await p.setViewport({width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true});
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
/* popover pause + restore, driven through the real functions */
console.log("pre speed:",await p.evaluate(()=>S.speed));
await p.evaluate(()=>showRpop('SA','Brazil',200,200));await sleep(200);
console.log("open speed:",await p.evaluate(()=>S.speed),"prev:",await p.evaluate(()=>S._pausePrev));
await p.evaluate(()=>hideRpop());await sleep(200);
console.log("closed speed:",await p.evaluate(()=>S.speed),"prev:",await p.evaluate(()=>S._pausePrev));
/* popover -> sheet inherits pause, sheet close restores */
await p.evaluate(()=>showRpop('SA','Brazil',200,200));await sleep(150);
await p.evaluate(()=>openSheet('reg'));await sleep(250);
console.log("sheet over popover speed:",await p.evaluate(()=>S.speed));
await p.evaluate(()=>closeSheet());await sleep(200);
console.log("sheet closed speed:",await p.evaluate(()=>S.speed));
/* capstone landscape after the caps un-clamp */
await p.evaluate(()=>openSheet('war'));await sleep(450);
await p.evaluate(()=>{const el=document.getElementById("nd_caps_war");el&&el.scrollIntoView({block:"center"});});
await sleep(250);
await p.screenshot({path:"/workspaces/lucid-winds/portal-assets/review/ftw-notes-aug25/13-tree-war-capstone-landscape.png"});
console.log("capstone landscape:",await p.evaluate(()=>{const el=document.getElementById("nd_caps_war");
  const ds=el.querySelector(".ds");return{clip:ds.scrollHeight>ds.clientHeight+2,cardH:el.offsetHeight,
    full:ds.textContent.length,shown:ds.clientHeight};}));
await br.close();
