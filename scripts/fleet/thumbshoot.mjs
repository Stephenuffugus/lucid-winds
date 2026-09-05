import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds", OUT=process.argv[3]||"/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/thumbs";
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webp":"image/webp"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(8837,"127.0.0.1",r));
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio"]});
for(const slug of (process.argv[2]||"chess,c4,pipe,lights,slider").split(",")){
  const pg=await b.newPage(); await pg.setViewport({width:430,height:932,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument((g)=>{try{localStorage.setItem("sws_dir_"+g,"1")}catch(e){}},slug);
  await pg.goto("http://127.0.0.1:8837/play/"+slug+".html",{waitUntil:"load",timeout:40000}).catch(e=>console.log(slug,"goto:",e.message.slice(0,50)));
  await new Promise(r=>setTimeout(r,3000));
  await pg.evaluate(()=>{const l=[...document.querySelectorAll("button")].find(e=>/^later$/i.test(e.textContent.trim())); if(l) l.click(); const d=document.getElementById("shell-dir-play"); if(d) d.click();});
  await new Promise(r=>setTimeout(r,700));
  const started=await pg.evaluate(()=>{const b=[...document.querySelectorAll("button,a,[role=button]")].filter(e=>{const r=e.getBoundingClientRect();return r.width>70&&r.height>30&&r.top<900}).find(e=>/new game|start|play|begin|deal|solo|1 player|vs cpu|easy|classic/i.test(e.textContent)&&!/later|play it now/i.test(e.textContent)); if(b){b.click();return b.textContent.trim().slice(0,16)} return null});
  await new Promise(r=>setTimeout(r,2500));
  await pg.evaluate(()=>{const l=[...document.querySelectorAll("button")].find(e=>/^later$/i.test(e.textContent.trim())); if(l) l.click();});
  await new Promise(r=>setTimeout(r,400));
  // a few discs on a Four in a Row board: tap five columns, the CPU answers each
  if(slug==="c4"){ const g=await pg.evaluate(()=>{const e=document.getElementById("C4g"); if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height};});
    if(g){ for(const c of [3,3,2,4,3]){ await pg.mouse.click(g.x+g.w*(c+0.5)/7, g.y+g.h*0.5); await new Promise(r=>setTimeout(r,900)); } } }
  if(process.env.INNER) await pg.evaluate(()=>{window.__INNER=true;});
  const box=await pg.evaluate(()=>{
    const cands=[...document.querySelectorAll("canvas,[class*=board],[id*=board],[class*=grid],[id*=grid],table,#game,.game,[class*=puzzle],[id*=puzzle],svg,.gb,#C4g,#PP,#Lg")];
    let best=null; for(const el of cands){const r=el.getBoundingClientRect(); if(r.width<120||r.height<120||r.top>900||r.bottom<60) continue; const a=Math.min(r.width,innerWidth)*Math.min(r.height,innerHeight); if(!best||a>best.a) best={a,x:r.left,y:r.top,w:r.width,h:r.height,d:(el.id?"#"+el.id:el.tagName.toLowerCase()+"."+String(el.className).split(" ")[0])};}
    // a tall board (chess is 406x501 with its captured rows) crops a rank off each end in a
    // square: use its largest square-ish descendant, the playing grid itself
    if(best && (window.__INNER || Math.abs(best.w-best.h)>Math.min(best.w,best.h)*0.12)){
      const host=document.querySelector(best.d.startsWith("#")?best.d:best.d.replace(/^([a-z]+)\.(.*)$/,"$1.$2"));
      if(host){ let sq=null; for(const el of host.querySelectorAll("*")){const r=el.getBoundingClientRect(); if(r.width<160||r.height<160) continue; if(Math.abs(r.width-r.height)>Math.min(r.width,r.height)*0.08) continue; const a=r.width*r.height; if(!sq||a>sq.a) sq={a,x:r.left,y:r.top,w:r.width,h:r.height,d:best.d+" > "+(el.id?"#"+el.id:el.tagName.toLowerCase()+"."+String(el.className).split(" ")[0])};}
        if(sq) best=sq; }
    }
    return best;});
  if(!box){ console.log(slug+": no board element found (started="+started+")"); await pg.screenshot({path:OUT+"/"+slug+"-full.png"}); await pg.close(); continue; }
  const PAD=parseInt(process.env.PAD||"24",10);
  if(PAD===0){ await pg.screenshot({path:OUT+"/"+slug+"-crop.png", clip:{x:box.x,y:box.y,width:box.w,height:box.h}}); }
  else { const side=Math.min(430, Math.max(box.w, box.h)+PAD); let x=box.x+box.w/2-side/2, y=box.y+box.h/2-side/2; x=Math.max(0,Math.min(430-side,x)); y=Math.max(0,Math.min(932-side,y));
    await pg.screenshot({path:OUT+"/"+slug+"-crop.png", clip:{x,y,width:side,height:side}}); }
  console.log(slug+": started="+started+"  board="+box.d+" "+Math.round(box.w)+"x"+Math.round(box.h)+" at "+Math.round(box.x)+","+Math.round(box.y)+"  crop "+(PAD===0?"exact":Math.round(Math.min(430, Math.max(box.w, box.h)+PAD))+"px square"));
  await pg.close();
}
await b.close(); s.close();
