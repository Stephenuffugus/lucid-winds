/* Did lifting the clamp fix sticky, and WHICH games now sidescroll? Measured, not assumed. */
import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds";
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json",".woff2":"font/woff2"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end("404")}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(+process.argv[2]||8881,"127.0.0.1",r));
const PORT=+process.argv[2]||8881;
const ids=readFileSync(ROOT+"/portal/index.html","utf8"); // ids come from the catalog dump instead
const cat=JSON.parse(readFileSync("/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/catalog.json","utf8"));
const natives=cat.filter(g=>g.kind==="native"&&g.id&&g.id!=="pompond").map(g=>g.id);
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
const sticky=[], side=[], errs=[];
for(const id of natives){
  const pg=await b.newPage(); await pg.setViewport({width:375,height:667,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
  try{
    await pg.goto(`http://127.0.0.1:${PORT}/play/${id}.html`,{waitUntil:"domcontentloaded",timeout:30000});
    await new Promise(r=>setTimeout(r,2200));
    await pg.evaluate(()=>{const o=document.getElementById("shell-dir"); if(o){const btn=[...o.querySelectorAll("button")].pop(); if(btn)btn.click();}});
    await new Promise(r=>setTimeout(r,900));
    const o=await pg.evaluate(async()=>{
      const h=document.querySelector(".shell-hdr"); if(!h) return null;
      const de=document.documentElement;
      const sideScroll = Math.max(de.scrollWidth-de.clientWidth, document.body.scrollWidth-document.body.clientWidth);
      const tall = de.scrollHeight > innerHeight + 20;
      let stuck=null;
      if(tall){ window.scrollTo(0,120); await new Promise(r=>setTimeout(r,220));
        stuck = Math.round(h.getBoundingClientRect().top); window.scrollTo(0,0); }
      return { sideScroll:Math.round(sideScroll), tall, stuck };
    });
    if(!o){ errs.push(id+":no-hdr"); }
    else {
      if(o.tall) sticky.push({id, stuck:o.stuck});
      if(o.sideScroll>1) side.push({id, px:o.sideScroll});
    }
  }catch(e){ errs.push(id+":"+String(e).slice(0,40)); }
  await pg.close();
}
const stickOK=sticky.filter(x=>x.stuck===0), stickBad=sticky.filter(x=>x.stuck!==0);
console.log(`STICKY (games tall enough to scroll: ${sticky.length})`);
console.log(`  header now sticks: ${stickOK.length}   still scrolls away: ${stickBad.length}`);
if(stickBad.length) console.log("  still broken:", stickBad.map(x=>x.id+"("+x.stuck+")").join(", "));
console.log(`\nHORIZONTAL SCROLL introduced: ${side.length} of ${natives.length}`);
side.sort((a,b)=>b.px-a.px).forEach(x=>console.log(`  ${x.id.padEnd(16)} ${x.px}px wider than the screen`));
if(errs.length) console.log("\nerrors:", errs.join(", "));
await b.close(); s.close();
