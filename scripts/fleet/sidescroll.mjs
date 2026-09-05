import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds";
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(8836,"127.0.0.1",r));
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio"]});
const games=(process.argv[2]||"petalfall,farkle,reversi,stopten,merge,backgammon,c4").split(",");
for(const g of games){
  const row=[g];
  for(const W of [375,320]){
    const pg=await b.newPage(); await pg.setViewport({width:W,height:W===375?667:568,isMobile:true,hasTouch:true});
    await pg.evaluateOnNewDocument((g)=>{try{localStorage.setItem("sws_dev_ok","1");localStorage.setItem("sws_dir_"+g,"1")}catch(e){}},g);
    const r=await pg.goto("http://127.0.0.1:8836/play/"+g+".html",{waitUntil:"load",timeout:40000}).catch(()=>null);
    if(!r||r.status()!==200){ row.push(W+":"+(r?r.status():"err")); await pg.close(); continue; }
    await new Promise(r=>setTimeout(r,2500));
    await pg.evaluate(()=>{const b=document.getElementById("shell-dir-play"); if(b) b.click();});
    await new Promise(r=>setTimeout(r,800));
    // into the play frame: the audit measured boards, not menus
    const started=await pg.evaluate(()=>{const b=[...document.querySelectorAll("button,a,[role=button]")].filter(e=>{const r=e.getBoundingClientRect();return r.width>70&&r.height>30}).find(e=>/new game|start|play|deal|begin|roll|go$|solo|vs cpu|1 player/i.test(e.textContent)); if(b){b.click();return b.textContent.trim().slice(0,16)} return null});
    await new Promise(r=>setTimeout(r,2500));
    const m=await pg.evaluate(()=>{const de=document.documentElement; const ov=Math.max(0,de.scrollWidth-window.innerWidth);
      // the widest element poking past the right edge
      let worst=null; for(const el of document.querySelectorAll("body *")){const rc=el.getBoundingClientRect(); if(rc.width>0&&rc.right>window.innerWidth+1){ if(!worst||rc.right>worst.r){worst={r:Math.round(rc.right),w:Math.round(rc.width),d:(el.id?"#"+el.id:el.tagName.toLowerCase()+(el.className&&typeof el.className==="string"?"."+el.className.split(" ")[0]:""))}}}}
      return {ov, worst};});
    row.push(W+" ["+started+"]: overflow "+m.ov+"px"+(m.worst?" ("+m.worst.d+" right="+m.worst.r+" w="+m.worst.w+")":""));
    if(W===375) await pg.screenshot({path:"/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/board-"+g+".png"});
    await pg.close();
  }
  console.log(row.join("  |  "));
}
await b.close(); s.close();
