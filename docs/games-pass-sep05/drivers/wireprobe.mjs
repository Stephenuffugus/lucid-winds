import puppeteer from "puppeteer"; import { createServer } from "http"; import fs from "fs"; import path from "path";
const ROOT="/workspaces/Litter_Bug";
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=path.join(ROOT,u.endsWith("/")?u+"index.html":u); if(!fs.existsSync(p)){r.writeHead(404);return r.end()} r.writeHead(200,{"content-type":p.endsWith(".js")?"text/javascript":"text/html"});r.end(fs.readFileSync(p))});
await new Promise(r=>s.listen(0,"127.0.0.1",r)); const port=s.address().port;
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu"]}); const pg=await b.newPage(); await pg.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await pg.goto(`http://127.0.0.1:${port}/index.html?lbtest=1`,{waitUntil:"load"}); await new Promise(r=>setTimeout(r,800));
const out=await pg.evaluate(async()=>{ const D=window.LB_DEV; D.reset(); D.show('s-home'); D.startJob('wire'); await new Promise(r=>setTimeout(r,200));
  const res={}; for(let lvl=1; lvl<=9; lvl++){ let solved=0, N=300, sumCross=0; for(let k=0;k<N;k++){ const G=D.state(); G.level=lvl-1; wireRound(); const c=wireCrossings(); if(c===0) solved++; sumCross+=c; } res[lvl]={pins:D.state().pins.length, solvedAtSpawn:(solved/N*100).toFixed(1)+'%', avgCross:(sumCross/N).toFixed(2)}; }
  D.endJob(); return res; });
console.log(JSON.stringify(out,null,1)); await b.close(); s.close();
