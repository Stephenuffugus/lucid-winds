import puppeteer from "puppeteer";
const OUT="/tmp/claude-1000/-workspaces-lucid-winds/de9096cd-55a8-47ec-8dea-82aa7cb125d8/scratchpad/kinkfix";
import fs from "fs"; fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");localStorage.removeItem("ftw_run");
  localStorage.removeItem("ftw_seen");localStorage.removeItem("ftw_guide_done");}catch(e){}});
await p.setViewport({width:320,height:568,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2400);
await p.evaluate(()=>{document.querySelector('[data-m="CRISIS"]').click();});await sleep(250);
await p.evaluate(()=>document.getElementById("startBtn").click());await sleep(1400);
await p.screenshot({path:OUT+"/pick-back-320.png"});
const pt=await p.evaluate(()=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
  for(let fy=0.15;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
    const[wx,wy]=window._dbgPv.toWorld(r.width*fx,r.height*fy);
    const hit=countryAtPoint(wx,wy);if(hit&&hit.n==="Brazil")return{x:r.x+r.width*fx,y:r.y+r.height*fy};}return null;});
await p.touchscreen.tap(pt.x,pt.y);await sleep(400);
await p.evaluate(()=>document.getElementById("beginBtn").click());await sleep(1900);
/* guide is on (fresh seen) - fire a breaking banner and prove it paints above */
await p.evaluate(()=>{showBannerNow('ONE MORE EXPULSION ENDS THE RUN');});await sleep(400);
await p.screenshot({path:OUT+"/banner-over-guide-320.png"});
console.log("banner hit:",await p.evaluate(()=>{
  const b=document.getElementById("breaking").getBoundingClientRect();
  const el=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);
  return el?(el.closest('#breaking')?'breaking':el.id||el.className):'none';}));
await p.evaluate(()=>{document.getElementById("breakX").click();});await sleep(200);
/* tall armed region card at 320: refusal strip on + all actions -> must scroll */
await p.evaluate(()=>{
  S.lostCount=3;const w=S.regions.WE;w.active=true;w.pstate='uprising';
  ['agit','charter','blackout'].forEach(n=>S.owned.add(n));recompute(S);
  const r=S.regions.SA;r.active=true;r.coverage=0.5;r.unrest=45;r.resist=20;r.suspicion=12;S.cash=9e8;
  paintHud();showRpop('SA','Brazil',80,300);});
await sleep(500);
await p.screenshot({path:OUT+"/rpop-tall-320.png"});
console.log("rpop:",await p.evaluate(()=>{
  const e=document.getElementById('rpop'),r=e.getBoundingClientRect();
  const conc=[...e.querySelectorAll('.act')].map(b=>{const rr=b.getBoundingClientRect();
    return {t:b.textContent.slice(0,9),vis:rr.bottom<=innerHeight&&rr.top>=0};});
  return {h:Math.round(r.height),scrolls:e.scrollHeight>e.clientHeight+2,conc};}));
/* action subtext: crackdown below unrest 30 shows why */
await p.evaluate(()=>{S.regions.SA.unrest=20;refreshRpop();});await sleep(200);
await p.screenshot({path:OUT+"/actwhy-320.png"});
console.log("why:",await p.evaluate(()=>[...document.querySelectorAll('#rpop .why')].map(e=>e.textContent)));
await br.close();
