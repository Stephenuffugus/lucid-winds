#!/usr/bin/env node
/* Fast boot signal for all five HANDOFF-11 games in ONE browser: does each page
   run without uncaught errors, and does it put any ink on the screen. A page
   with zero elements and no console error is not healthy, it is unwired.
     python3 -m http.server 8951 --bind 127.0.0.1
     node scripts/handoff11_boot.mjs */
import puppeteer from "puppeteer";
const B="http://127.0.0.1:8951";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
for(const id of ["deepwell","blackout","parallel","wireworm","siege"]){
  const ctx=await br.createBrowserContext(); const p=await ctx.newPage();
  await p.setViewport({width:390,height:844});
  const errs=[];
  p.on("pageerror",e=>errs.push(e.message.split("\n")[0].slice(0,120)));
  p.on("console",m=>{if(m.type()==="error"){const t=m.text();if(!/404|Failed to load resource|net::ERR/.test(t))errs.push(t.slice(0,120));}});
  try{
    await p.goto(B+"/satellites/"+id+"/?probe="+Math.random(),{waitUntil:"domcontentloaded",timeout:15000});
    await sleep(1300);
    const ink=await p.evaluate(()=>({t:(document.body.innerText||"").trim().length,e:document.body.querySelectorAll("*").length,c:!!document.querySelector("canvas")}));
    console.log(id.padEnd(9)+(errs.length?"ERRORS("+errs.length+"): "+errs[0]:"boots clean")+"   text="+ink.t+" els="+ink.e+(ink.c?" canvas":""));
  }catch(e){console.log(id.padEnd(9)+"LOAD FAIL: "+e.message.slice(0,70));}
  await ctx.close();
}
await br.close();
