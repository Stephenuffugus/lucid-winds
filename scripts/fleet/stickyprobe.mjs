import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds";
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json",".woff2":"font/woff2"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(8851,"127.0.0.1",r));
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu"]});
for (const id of ["set","trellis","sudoku","battleship","wordsearch"]) {
  const pg=await b.newPage(); await pg.setViewport({width:375,height:667,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1")}catch(e){}});
  await pg.goto(`http://127.0.0.1:8851/play/${id}.html`,{waitUntil:"domcontentloaded"});
  await new Promise(r=>setTimeout(r,2600));
  const o=await pg.evaluate(async()=>{
    const h=document.querySelector(".shell-hdr"); if(!h) return {no:1};
    const cs=getComputedStyle(h);
    const before=Math.round(h.getBoundingClientRect().top);
    window.scrollTo(0,120); await new Promise(r=>setTimeout(r,220));
    const after=Math.round(h.getBoundingClientRect().top);
    // a sticky element's nearest scrolling ancestor must be the one that scrolls
    const bodyOF=getComputedStyle(document.body).overflow, htmlOF=getComputedStyle(document.documentElement).overflow;
    return {position:cs.position, top:cs.top, before, after, scrolled:window.scrollY,
            docH:document.documentElement.scrollHeight, vh:innerHeight, bodyOF, htmlOF,
            parentDisplay:getComputedStyle(h.parentElement).display};
  });
  console.log(id.padEnd(12), JSON.stringify(o));
  await pg.close();
}
await b.close(); s.close();
