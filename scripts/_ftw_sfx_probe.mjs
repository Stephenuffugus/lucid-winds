import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
const p=await br.newPage();
const bad=[];
p.on("response",r=>{if(r.url().includes("/sfx/")&&r.status()>=400)bad.push(r.status()+" "+r.url().split("/").pop());});
p.on("console",m=>{if(m.type()==="error")bad.push("console: "+m.text().slice(0,120));});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
await p.setViewport({width:915,height:412});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2200);
const out=await p.evaluate(async()=>{
  sfxUnlock();SFX.muted=false;
  for(const id of SFX_HAVE){sfx(id);SFX.last={};await new Promise(r=>setTimeout(r,60));}
  await new Promise(r=>setTimeout(r,1200));
  return {have:SFX_HAVE.length, built:Object.keys(SFX.el).length,
    missing:Object.keys(SFX.missing), logged:SFX.log.length};
});
console.log(JSON.stringify(out));
console.log("bad responses:",bad.length?bad:"none");
await br.close();
