import puppeteer from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-menu-aug24";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
for(const[w,h,name]of[[915,412,"land"],[412,915,"port"]]){
  await p.setViewport({width:w,height:h,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
  await sleep(2200);
  await p.evaluate(()=>document.getElementById("diffs").scrollIntoView({block:"center"}));
  await sleep(400);
  console.log(name,"diff labels:",await p.evaluate(()=>[...document.querySelectorAll(".diffbtn span")].map(e=>e.textContent).join(" / ")));
  await p.screenshot({path:`${OUT}/diffs_${name}.png`});
}
await br.close();
