import puppeteer from "puppeteer"; import {writeFileSync,mkdirSync,existsSync} from "fs";
const D="/tmp/claude-1000/-workspaces-lucid-winds/5d3fb669-7586-4960-ab47-ebc7334caf3a/scratchpad/shots/party/";
if(!existsSync(D)) mkdirSync(D,{recursive:true});
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
for(const t of [{n:"host-tv",u:"/party/host.html",w:1280,h:720},{n:"phone-controller",u:"/party/play.html",w:390,h:844}]){
  const ctx=await br.createBrowserContext(); const p=await ctx.newPage();
  await p.setViewport({width:t.w,height:t.h,deviceScaleFactor:2});
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
  const errs=[]; p.on("pageerror",e=>errs.push(e.message.split("\n")[0].slice(0,100)));
  await p.goto("http://127.0.0.1:8951"+t.u+"?probe="+Math.random(),{waitUntil:"domcontentloaded",timeout:20000});
  await new Promise(r=>setTimeout(r,2500));
  writeFileSync(D+t.n+".png", await p.screenshot({type:"png"}));
  console.log(t.n+": "+(errs.length?errs.length+" ERR: "+errs[0]:"clean"));
  await ctx.close();
}
await br.close();
