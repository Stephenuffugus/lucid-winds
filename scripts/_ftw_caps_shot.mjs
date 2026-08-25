import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
for(const [w,h,tag] of [[375,667,"portrait"],[915,412,"landscape"]]){
  const p=await br.newPage();
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");localStorage.removeItem("ftw_run");
    localStorage.setItem("ftw_guide_done","1");}catch(e){}});
  await p.setViewport({width:w,height:h,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
  await sleep(2300);
  await p.evaluate(()=>{document.querySelector('[data-m="CRISIS"]').click();});await sleep(250);
  await p.evaluate(()=>document.getElementById("startBtn").click());await sleep(1300);
  const pt=await p.evaluate(()=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
    for(let fy=0.15;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
      const[wx,wy]=window._dbgPv.toWorld(r.width*fx,r.height*fy);
      const hit=countryAtPoint(wx,wy);if(hit&&hit.n==="Brazil")return{x:r.x+r.width*fx,y:r.y+r.height*fy};}return null;});
  await p.touchscreen.tap(pt.x,pt.y);await sleep(400);
  await p.evaluate(()=>document.getElementById("beginBtn").click());await sleep(1700);
  await p.evaluate(()=>openSheet('war'));await sleep(600);
  await p.evaluate(()=>{const el=document.getElementById("nd_caps_war");el&&el.scrollIntoView({block:"center"});});
  await sleep(400);
  await p.screenshot({path:`/tmp/claude-1000/-workspaces-lucid-winds/de9096cd-55a8-47ec-8dea-82aa7cb125d8/scratchpad/caps-${tag}.png`});
  console.log(tag,await p.evaluate(()=>{const el=document.getElementById("nd_caps_war");
    const ds=el.querySelector(".ds"),im=el.querySelector(".nico");
    return {icon:!!im&&im.naturalWidth>0,clip:ds.scrollHeight>ds.clientHeight+2,cardH:el.offsetHeight};}));
  await p.close();
}
await br.close();
