import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds";
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(8832,"127.0.0.1",r));
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio"]});
for(const W of [320]){
  const pg=await b.newPage(); await pg.setViewport({width:W,height:667,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dir_klondike","1")}catch(e){}});
  await pg.goto("http://127.0.0.1:8832/play/klondike.html",{waitUntil:"domcontentloaded"});
  await new Promise(r=>setTimeout(r,3000));
  const out=await pg.evaluate(()=>{
    const pend=document.getElementById("shell-pend"); pend.innerHTML='(+8<span class="sb-pend-word"> pending</span>)';
    const hdr=document.querySelector(".shell-hdr");
    const kids=[...hdr.children].map(el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return `${el.id||el.className||el.tagName}:${Math.round(r.left)}-${Math.round(r.right)} (${Math.round(r.width)}w, ${cs.position}, disp ${cs.display})`});
    const chip=document.getElementById("sws-music-chip")||[...document.querySelectorAll("button")].find(x=>/Music/.test(x.textContent));
    const cr=chip&&chip.getBoundingClientRect(); const ccs=chip&&getComputedStyle(chip);
    const mb=document.getElementById("shell-music-btn"); const cs2=mb&&getComputedStyle(mb); return {mb: mb?{html: mb.outerHTML.slice(0,420), inline: mb.getAttribute("style"), w: cs2.width, minw: cs2.minWidth, pad: cs2.padding, font: cs2.font.slice(0,40)}:null, kids, chip: chip?`${chip.id} ${Math.round(cr.left)}-${Math.round(cr.right)} y${Math.round(cr.top)} pos ${ccs.position} parent ${chip.parentElement.tagName}.${chip.parentElement.className}`:null,
      title: document.getElementById("shell-title").getBoundingClientRect().width};
  });
  console.log(JSON.stringify(out.mb,null,1)); console.log(W+"px  title box "+Math.round(out.title)+"px\n  "+out.kids.join("\n  ")+"\n  chip: "+out.chip);
  await pg.close();
}
await b.close(); s.close();
