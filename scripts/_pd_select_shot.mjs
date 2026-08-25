import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
for(const [w,h] of [[375,667],[360,740],[320,568]]){
  const p=await br.newPage();
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
  await p.setViewport({width:w,height:h,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.goto("http://127.0.0.1:8777/satellites/puppy-dash/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
  await sleep(2500);
  const info=await p.evaluate(()=>{
    const g=document.getElementById("animalGrid");
    const tiles=[...g.children].map(b=>{const r=b.getBoundingClientRect();
      return {name:b.querySelector('.nm').textContent,top:Math.round(r.top),bottom:Math.round(r.bottom),
        inView:r.top>=0&&r.bottom<=innerHeight};});
    const scr=document.getElementById("selectScreen");
    const cs=getComputedStyle(scr);
    return {tiles,canScroll:scr.scrollHeight>scr.clientHeight+2,overflow:cs.overflowY,
      scrollH:scr.scrollHeight,clientH:scr.clientHeight};});
  console.log(w+"x"+h, JSON.stringify(info,null,0).slice(0,600));
  await p.screenshot({path:`/tmp/claude-1000/-workspaces-lucid-winds/de9096cd-55a8-47ec-8dea-82aa7cb125d8/scratchpad/pd-select-${w}x${h}.png`});
  await p.close();
}
await br.close();
