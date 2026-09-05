import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds";
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(8835,"127.0.0.1",r));
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio"]});
for(const path of ["/satellites/glyph-forge/","/satellites/tarot-run/"]){
  const pg=await b.newPage(); await pg.setViewport({width:375,height:667,isMobile:true,hasTouch:true});
  const reqs=[]; pg.on("response", r=>{ const u=r.url(); if(u.includes("art-slots/")) reqs.push({u:u.split("art-slots/")[1], s:r.status()}); });
  await pg.goto("http://127.0.0.1:8835"+path,{waitUntil:"load",timeout:40000}).catch(e=>console.log("  goto:",e.message.slice(0,60)));
  await new Promise(r=>setTimeout(r,4000));
  // poke into a run so the enemy portrait renders with a real id
  await pg.evaluate(()=>{const b=[...document.querySelectorAll("button")].find(e=>/start|play|begin|new run|forge/i.test(e.textContent)&&e.getBoundingClientRect().width>60); if(b) b.click();});
  await new Promise(r=>setTimeout(r,3000));
  const bad=reqs.filter(r=>/[{}$?]/.test(r.u)); const legit=reqs.filter(r=>!/[{}$?]/.test(r.u));
  console.log(path+"  art-slot requests "+reqs.length+"  malformed "+bad.length+(bad.length?" ("+bad.map(r=>r.u).join(", ")+")":"")+"  legit: "+legit.map(r=>r.u+":"+r.s).slice(0,6).join(" "));
  await pg.close();
}
const pg=await b.newPage(); const r=await pg.goto("http://127.0.0.1:8835/assets/icons/icon-192x192.png"); console.log("shared icon: "+r.status()); await pg.close();
await b.close(); s.close();
