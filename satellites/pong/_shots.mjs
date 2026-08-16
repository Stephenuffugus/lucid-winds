import http from 'http'; import fs from 'fs'; import path from 'path'; import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds';
const OUT='/tmp/claude-1000/-workspaces-lucid-winds/5d3fb669-7586-4960-ab47-ebc7334caf3a/scratchpad/shots';
fs.mkdirSync(OUT,{recursive:true});
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(ROOT,u);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}
 r.writeHead(200,{'content-type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(8801,'127.0.0.1',r));
const B='http://127.0.0.1:8801';
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function shot(name,url,vp,fn){
  const p=await b.newPage(); await p.setViewport(vp);
  p.on('pageerror',e=>console.log('  ERR',name,String(e).slice(0,140)));
  await p.goto(B+url,{waitUntil:'domcontentloaded'}); await wait(500);
  if(fn) await fn(p,wait);
  await p.screenshot({path:path.join(OUT,name+'.png')}); await p.close();
  console.log('shot',name);
}
const PH={width:375,height:667,deviceScaleFactor:2};
const DT={width:1280,height:800,deviceScaleFactor:1};

await shot('pong-menu-phone','/satellites/pong/index.html',PH);
await shot('pong-play-phone','/satellites/pong/index.html',PH,async(p,w)=>{
  await p.evaluate(()=>{ window.__PONG.start('gauntlet',{diff:'normal',target:7}); });
  for(let i=0;i<6;i++){ await p.evaluate(()=>{for(let k=0;k<120;k++)window.__PONG.step(1);}); await w(60); }
  await w(300);});
await shot('pong-how-phone','/satellites/pong/index.html',PH,async(p,w)=>{ await p.evaluate(()=>document.querySelector('[data-go="how"]').click()); await w(200);});
await shot('pong-menu-desktop','/satellites/pong/index.html',DT);

await shot('pp-title-phone','/satellites/petal-plunge/index.html',PH);
await shot('pp-play-phone','/satellites/petal-plunge/index.html',PH,async(p,w)=>{
  await p.evaluate(()=>{ window.PP.startRun('free'); });
  for(let i=0;i<8;i++){ await p.evaluate(()=>{ for(let k=0;k<60;k++){ const L=window.PP.laneAt(window.PP.S.depth+30); const dx=(L?L.c:0)-window.PP.S.x; window.PP.setInput(Math.abs(dx)<4?0:(dx<0?-1:1),false); window.PP.step(1/60);} }); await w(40); }
  await p.evaluate(()=>{ window.PP.setInput(1,false); }); await w(400);});
await shot('pp-settings-phone','/satellites/petal-plunge/index.html',PH,async(p,w)=>{ await p.evaluate(()=>document.getElementById('tSet').click()); await w(250);});

await shot('gp-title-phone','/satellites/greenhouse-pinball/index.html?gptest=1',PH);
await shot('gp-play-phone','/satellites/greenhouse-pinball/index.html?gptest=1',PH,async(p,w)=>{
  await p.evaluate(()=>{ window.PIN_DEV.start('classic'); }); await w(120);
  await p.evaluate(()=>{ window.PIN_DEV.chargePlunge(0.8); });
  for(let i=0;i<10;i++){ await p.evaluate(()=>{for(let k=0;k<30;k++)window.PIN_DEV.step(1/60);}); await w(30); }
  await p.evaluate(()=>window.PIN_DEV.render()); await w(200);});
await shot('gp-pause-phone','/satellites/greenhouse-pinball/index.html?gptest=1',PH,async(p,w)=>{
  await p.evaluate(()=>{ window.PIN_DEV.start('zen'); }); await w(120);
  await p.evaluate(()=>document.getElementById('b-pause').click()); await w(250);});
await shot('gp-skins-phone','/satellites/greenhouse-pinball/index.html?gptest=1',PH,async(p,w)=>{
  await p.evaluate(()=>document.getElementById('b-skins').click()); await w(400);});
await shot('gp-title-desktop','/satellites/greenhouse-pinball/index.html?gptest=1',DT);
await b.close(); srv.close();
