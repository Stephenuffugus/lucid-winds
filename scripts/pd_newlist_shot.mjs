import p from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/pd-drop-aug25";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await p.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox","--disable-gpu"]});
const pg=await b.newPage();
await pg.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
pg.on("pageerror",e=>console.log("pageerror:",String(e).slice(0,200)));
await pg.evaluateOnNewDocument(()=>{try{localStorage.clear();localStorage.setItem('sws_dev_ok','1');}catch(e){}});
await pg.goto("http://127.0.0.1:8777/satellites/puppy-dash/index.html?pd_test=1&probe="+Math.random(),{waitUntil:"domcontentloaded",timeout:45000});
await sleep(1800);
const ready=await pg.evaluate(async()=>{
  const D=window.PD;
  ["fox","bunny","raccoon","kitten"].forEach(id=>D.loadCharArt(id));
  for(let i=0;i<60;i++){
    const miss=[];
    for(const id of ["fox","bunny","raccoon","kitten"]) if(!D.CH_READY[id]||!D.CH_READY[id].bank) miss.push(id+"/bank");
    if(!D.OB_READY.wall) miss.push("wall");
    if(!miss.length) return "all loaded";
    if(i===59) return "MISSING: "+miss.join(",");
    await new Promise(r=>setTimeout(r,250));
  }});
console.log(ready);
await pg.evaluate(()=>{document.querySelectorAll('.lwfb-fab,.lwfb-fab-x').forEach(e=>e.style.setProperty('display','none','important'));});
await pg.evaluate(()=>{ window.requestAnimationFrame=()=>0; });
await sleep(300);
await pg.screenshot({path:OUT+"/10_wordmark_select.png"}); console.log("shot wordmark");
for(const id of ["fox","kitten"]){
  await pg.evaluate(id=>{const D=window.PD;
    D.state.animal=D.ANIMALS.find(a=>a.id===id);
    D.startRun();D.state.spawnT=999;D.state.jetSpawnT=999;D.state.magnetSpawnT=999;
    const dt=1/60;for(let n=0;n<150;n++){D.state.objs.length=0;D.update(dt);}
    /* mid lane change: freeze the tween where the bank frame shows */
    D.state.targetLane=2;D.state.laneF=1.35;
    const HY=D.L.HY,T=D.L.PY-HY;
    D.state.objs.push({kind:"ob",o:{id:"wall",action:"dodge"},lane:1,y:HY+T*0.55,resolved:false});
    D.state.objs.push({kind:"ob",o:{id:"wall",action:"dodge"},lane:0,y:HY+T*0.22,resolved:false});
    D.render();},id);
  await pg.screenshot({path:OUT+"/11_bank_wall_"+id+".png"}); console.log("shot bank+wall "+id);
}
await b.close(); console.log("DONE");
