import puppeteer from "puppeteer"; import {writeFileSync,mkdirSync,existsSync} from "fs";
const D="/tmp/claude-1000/-workspaces-lucid-winds/5d3fb669-7586-4960-ab47-ebc7334caf3a/scratchpad/shots/loaf/";
if(!existsSync(D)) mkdirSync(D,{recursive:true});
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--autoplay-policy=no-user-gesture-required","--use-gl=swiftshader","--enable-unsafe-swiftshader"]});
for(const v of [{n:"phone",w:390,h:844},{n:"desktop",w:1280,h:800}]){
  const ctx=await br.createBrowserContext(); const p=await ctx.newPage();
  await p.setViewport({width:v.w,height:v.h,deviceScaleFactor:2});
  const errs=[]; p.on("pageerror",e=>errs.push(e.message.split("\n")[0].slice(0,100)));
  await p.goto("http://127.0.0.1:8951/loaf.html?probe="+Math.random(),{waitUntil:"domcontentloaded",timeout:25000});
  await new Promise(r=>setTimeout(r,4000));
  writeFileSync(D+v.n+"-01.png", await p.screenshot({type:"png"}));
  console.log(v.n+": "+(errs.length?errs.length+" ERR: "+errs[0]:"clean"));
  await ctx.close();
}
await br.close();
