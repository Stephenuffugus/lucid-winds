/* picker + done screen at a size: ROOT W H OUT */
import puppeteer from "puppeteer"; import { createServer } from "http"; import fs from "fs"; import path from "path";
const ROOT="/workspaces/Litter_Bug", W=+process.env.W||320, H=+process.env.H||568, OUT=process.env.OUT;
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".svg":"image/svg+xml",".json":"application/json"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=path.join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[path.extname(p)]||"application/octet-stream"});r.end(fs.readFileSync(p))});
await new Promise(r=>s.listen(0,"127.0.0.1",r)); const port=s.address().port;
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
const pg=await b.newPage(); await pg.setViewport({width:W,height:H,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await pg.evaluateOnNewDocument(()=>{ try{ localStorage.setItem('lb_how','1'); }catch(e){} });
await pg.goto(`http://127.0.0.1:${port}/index.html?lbtest=1`,{waitUntil:"load"}); await new Promise(r=>setTimeout(r,1200));
const st=await pg.evaluate(async()=>{ const D=window.LB_DEV; D.reset(); const f=D.featured(); D.startJob(f); await new Promise(r=>setTimeout(r,250)); for(let i=0;i<40&&!D.state().over;i++) D.bump(2); return {f, head:document.getElementById('d-head').textContent}; });
await pg.screenshot({path:OUT+`/pick-${W}-done.png`});
await pg.evaluate(()=>{ window.LB_DEV.show('s-home'); document.getElementById('b-scav').click(); }); await new Promise(r=>setTimeout(r,500));
await pg.screenshot({path:OUT+`/pick-${W}-picker.png`});
const m=await pg.evaluate(()=>{ const pad=document.querySelector('#s-block .pad'); const strip=document.querySelector('#block-week .week'); const r=strip.getBoundingClientRect(); const cell=strip.firstElementChild.getBoundingClientRect(); const fb=document.querySelector('#s-block .fb').getBoundingClientRect(); const wl=strip.querySelector('.wl'); const fs=getComputedStyle(wl).fontSize; return {padScroll:pad.scrollHeight, padClient:pad.clientHeight, stripW:r.width, cellW:cell.width, cellH:cell.height, stripBottom:r.bottom, innerH:innerHeight, chip:[fb.width,fb.height], wlFont:fs, scale:getComputedStyle(document.getElementById('stage')).transform}; });
console.log(W+'x'+H, JSON.stringify(st), JSON.stringify(m));
await b.close(); s.close();
