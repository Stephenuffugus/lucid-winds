import puppeteer from "puppeteer"; import { createServer } from "http"; import fs from "fs"; import path from "path";
const ROOT="/workspaces/Litter_Bug"; const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".svg":"image/svg+xml",".json":"application/json"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=path.join(ROOT,u.endsWith("/")?u+"index.html":u); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end()} r.writeHead(200,{"content-type":M[path.extname(p)]||"application/octet-stream"});r.end(fs.readFileSync(p))});
await new Promise(r=>s.listen(0,"127.0.0.1",r)); const port=s.address().port;
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
const pg=await b.newPage(); await pg.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await pg.goto(`http://127.0.0.1:${port}/index.html?lbtest=1`,{waitUntil:"load"}); await new Promise(r=>setTimeout(r,1000));
const out=await pg.evaluate(async()=>{ const D=window.LB_DEV, E=window.BUG_ENGINE; const fx=await (await fetch('fixtures/identity-60.json')).json(); const res=[];
  for(const f of fx){ const bb={cb:f.h, grade:E.bugGrade(f.h).grade, lvl:1, wins:0, at:Date.now()}; const cv=await new Promise(r=>D.renderCard(bb,r)); const ctx=cv.getContext('2d'); const band=ctx.getImageData(130,180,380,380).data; let lit=0,n=0; for(let i=0;i<band.length;i+=16){ n++; const r=band[i],g=band[i+1],bl=band[i+2]; if(Math.max(r,g,bl)-Math.min(r,g,bl)>40||Math.max(r,g,bl)>120) lit++; } res.push({h:f.h.slice(0,12), lit:+(lit/n).toFixed(3), marks:f.marks.length, grade:bb.grade}); }
  return res; });
out.sort((a,b)=>a.lit-b.lit); console.log('lowest 5', JSON.stringify(out.slice(0,5))); console.log('median', out[30].lit, 'highest', JSON.stringify(out.slice(-3)));
await b.close(); s.close();
