import puppeteer from "puppeteer"; import { createServer } from "http"; import fs from "fs"; import path from "path";
const ROOT="/workspaces/Litter_Bug", OUT=process.env.OUT; const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".svg":"image/svg+xml",".json":"application/json"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=path.join(ROOT,u.endsWith("/")?u+"index.html":u); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end()} r.writeHead(200,{"content-type":M[path.extname(p)]||"application/octet-stream"});r.end(fs.readFileSync(p))});
await new Promise(r=>s.listen(0,"127.0.0.1",r)); const port=s.address().port;
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
const pg=await b.newPage(); await pg.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await pg.evaluateOnNewDocument(()=>{ try{ localStorage.setItem('lb_how','1'); }catch(e){} });
await pg.goto(`http://127.0.0.1:${port}/index.html?lbtest=1`,{waitUntil:"load"}); await new Promise(r=>setTimeout(r,1000));
await pg.evaluate(()=>{ const D=window.LB_DEV; D.reset(); D.setShinies(30); D.save(); document.getElementById('b-mint').style.display=''; });
/* a real tap on A BUG IS READY, then frames at four moments */
const r=await pg.evaluate(()=>{ const e=document.getElementById('b-mint').getBoundingClientRect(); return {x:e.left+e.width/2,y:e.top+e.height/2}; });
const t0=Date.now(); await pg.touchscreen.tap(r.x,r.y);
for(const [ms,name] of [[250,'jar'],[900,'rise'],[1500,'stamp'],[2400,'settled']]){ const d=ms-(Date.now()-t0); if(d>0) await new Promise(r=>setTimeout(r,d)); await pg.screenshot({path:OUT+`/mint-${name}.png`}); }
console.log('mint frames written'); await b.close(); s.close();
