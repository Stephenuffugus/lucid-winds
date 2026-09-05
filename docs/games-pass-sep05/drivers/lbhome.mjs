import puppeteer from "puppeteer"; import { createServer } from "http"; import fs from "fs"; import path from "path";
const ROOT="/workspaces/Litter_Bug", OUT=process.env.OUT; const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".svg":"image/svg+xml",".json":"application/json"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=path.join(ROOT,u.endsWith("/")?u+"index.html":u); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end()} r.writeHead(200,{"content-type":M[path.extname(p)]||"application/octet-stream"});r.end(fs.readFileSync(p))});
await new Promise(r=>s.listen(0,"127.0.0.1",r)); const port=s.address().port;
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
for(const [W,H] of [[412,915],[320,568]]){ const pg=await b.newPage(); await pg.setViewport({width:W,height:H,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument(()=>{ try{ localStorage.setItem('lb_how','1'); }catch(e){} });
  await pg.goto(`http://127.0.0.1:${port}/index.html?lbtest=1`,{waitUntil:"load"}); await new Promise(r=>setTimeout(r,1000));
  const m=await pg.evaluate(()=>{ const p=document.getElementById('b-snd').getBoundingClientRect(), e=document.getElementById('b-exit').getBoundingClientRect(), st=document.querySelector('.stamp').getBoundingClientRect(); const hit=document.elementFromPoint(p.left+p.width/2,p.top+p.height/2); return {pill:[p.left|0,p.top|0,p.width|0,p.height|0], exit:[e.left|0,e.top|0,e.width|0,e.height|0], stamp:[st.left|0,st.top|0,st.width|0,st.height|0], hitOk: hit&&hit.id==='b-snd', gap: (p.left-(e.left+e.width))|0}; });
  console.log(W+'x'+H, JSON.stringify(m)); await pg.screenshot({path:OUT+`/home-${W}.png`}); await pg.close(); }
await b.close(); s.close();
