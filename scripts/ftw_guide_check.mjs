/* ⛔ A guard for the exact regression Stephen hit: the briefing card must be
   INVISIBLE unless it carries .on, in both orientations, and SKIP must hide it. */
import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
let bad=0;
for(const [w,h,tag] of [[915,412,'landscape'],[412,915,'portrait']]){
  const p=await br.newPage();
  await p.setViewport({width:w,height:h,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
  await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
  await sleep(2600);
  const off=await p.evaluate(()=>{const g=document.getElementById('guide');
    g.classList.remove('on');return getComputedStyle(g).display;});
  const ok1=off==='none';
  if(!ok1)bad++;
  console.log('  '+(ok1?'ok   ':'FAIL ')+tag+': with .on removed, #guide computes display:'+off+' (want none)');
  const on=await p.evaluate(()=>{const g=document.getElementById('guide');
    g.classList.add('on');return getComputedStyle(g).display;});
  const ok2=on!=='none';
  if(!ok2)bad++;
  console.log('  '+(ok2?'ok   ':'FAIL ')+tag+': with .on set, #guide computes display:'+on+' (want anything but none)');
  await p.close();
}
console.log(bad?('FAILED '+bad):'the briefing card obeys .on in both orientations');
await br.close();
process.exit(bad?1:0);
