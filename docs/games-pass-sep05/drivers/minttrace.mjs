import puppeteer from "puppeteer"; import { createServer } from "http"; import fs from "fs"; import path from "path";
const ROOT="/workspaces/Litter_Bug"; const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".svg":"image/svg+xml",".json":"application/json"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=path.join(ROOT,u.endsWith("/")?u+"index.html":u); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end()} r.writeHead(200,{"content-type":M[path.extname(p)]||"application/octet-stream"});r.end(fs.readFileSync(p))});
await new Promise(r=>s.listen(0,"127.0.0.1",r)); const port=s.address().port;
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
const pg=await b.newPage(); await pg.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await pg.evaluateOnNewDocument(()=>{ try{ localStorage.setItem('lb_how','1'); }catch(e){} });
await pg.goto(`http://127.0.0.1:${port}/index.html?lbtest=1`,{waitUntil:"load"}); await new Promise(r=>setTimeout(r,1000));
const trace=await pg.evaluate(async()=>{ const D=window.LB_DEV; D.reset(); D.setShinies(30); D.save(); document.getElementById('b-mint').style.display='';
  const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0=performance.now(); document.getElementById('b-mint').click();
  const out=[]; const art=document.getElementById('m-art'), jar=document.getElementById('m-jar'), wrap=document.getElementById('m-wrap');
  for(let i=0;i<14;i++){ await new Promise(r=>setTimeout(r,150)); const ca=getComputedStyle(art), cj=getComputedStyle(jar); out.push({t:Math.round(performance.now()-t0), cer:wrap.classList.contains('ceremony'), art:[ca.opacity, ca.animationName, ca.transform.slice(0,30)], jar:[cj.opacity, cj.animationName, cj.display]}); }
  return {rm, out}; });
console.log(JSON.stringify(trace,null,0)); await b.close(); s.close();
