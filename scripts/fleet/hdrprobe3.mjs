import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds";
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json",".woff2":"font/woff2",".mp3":"audio/mpeg"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(8831,"127.0.0.1",r));
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio"]});
for(const W of [320,360,375,390]){
  const pg=await b.newPage(); await pg.setViewport({width:W,height:667,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dir_klondike","1")}catch(e){}}); await pg.goto("http://127.0.0.1:8831/play/klondike.html",{waitUntil:"domcontentloaded"});
  await new Promise(r=>setTimeout(r,3000));
  const out=await pg.evaluate(()=>{
    const hdr=document.querySelector(".shell-hdr"), pend=document.getElementById("shell-pend");
    const read=()=>{const clipped=[];for(const el of hdr.querySelectorAll("*")){const r=el.getBoundingClientRect();
      if(r.width>0&&r.right>innerWidth+0.5){const t=(el.textContent||"").trim().slice(0,16);if(t)clipped.push(t)}}
      return {ov:hdr.scrollWidth-hdr.clientWidth, h:Math.round(hdr.getBoundingClientRect().height), clipped:[...new Set(clipped)].slice(0,3)};};
    const before=read();
    pend.innerHTML="(+8<span class=\"sb-pend-word\"> pending</span>)";              // exactly what the SDK renders once you have earned
    const after=read();
    return {before, after};
  });
  console.log(`${W}px  empty-wallet: overflow=${out.before.ov} h=${out.before.h} clipped=${JSON.stringify(out.before.clipped)}`);
  console.log(`      +pending chip: overflow=${out.after.ov} h=${out.after.h} clipped=${JSON.stringify(out.after.clipped)}`);
  await pg.screenshot({path:"/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/hdr-after-"+W+".png", clip:{x:0,y:0,width:W,height:70}}); await pg.close();
}
await b.close(); s.close();
