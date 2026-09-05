/* Portal thumbnail: 480x480 of the Rainbow Arch starter with the bars hidden. node test/thumb.mjs */
import puppeteer from 'puppeteer'; import { createServer } from 'http'; import { readFileSync, existsSync, statSync } from 'fs'; import { join, extname } from 'path';
const HERE=new URL('.', import.meta.url).pathname, ROOT=join(HERE,'..','..','..');
const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};
const srv=createServer((q,r)=>{ const u=decodeURIComponent(q.url.split('?')[0]); let p=join(ROOT,u.endsWith('/')?u+'index.html':u); if(!existsSync(p)||statSync(p).isDirectory()){ r.writeHead(404); return r.end(); } r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'}); r.end(readFileSync(p)); }).listen(8970);
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const pg=await b.newPage(); await pg.setViewport({width:480,height:480,deviceScaleFactor:2});
await pg.goto('http://127.0.0.1:8970/satellites/blockspace/?shtest=1',{waitUntil:'load'}); await new Promise(r=>setTimeout(r,1200));
await pg.evaluate(k=>{ window.__starter=k; document.getElementById('welcome').hidden=true; document.getElementById('hint').hidden=true; for(const id of ['top','bottom']) document.getElementById(id).style.display='none'; const m=document.querySelector('[class*=music],[id*=music]'); if(m) m.style.display='none';
  BS.startProject(BS.STARTERS[window.__starter||0].make()); BS.CAM.theta=0.95; BS.CAM.phi=1.05; BS.CAM.reframe(); BS.CAM.dist*=0.86; BS.CAM.apply(); }, +(process.env.STARTER||0));
await new Promise(r=>setTimeout(r,900));
await pg.evaluate(()=>{ for(const el of document.querySelectorAll('body > *')) { if(!['sky','stage'].includes(el.id) && el.tagName!=='SCRIPT') el.style.visibility='hidden'; } });
await pg.screenshot({path:process.env.OUT||join(ROOT,'portal-assets','thumbs','blockspace.jpg'),type:'jpeg',quality:82});
await b.close(); srv.close(); console.log('thumb written');
