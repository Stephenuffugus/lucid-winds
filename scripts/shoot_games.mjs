/* Boot + one play frame of any satellites at 375x667, served from the repo root on 8791.
   node scripts/shoot_games.mjs <outdir> <slug> [<slug>...]   (looks, not gates) */
import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds", OUT=process.argv[2], games=process.argv.slice(3);
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json",".mp3":"audio/mpeg",".woff2":"font/woff2"};
const srv=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);let p=join(ROOT,u.endsWith("/")?u+"index.html":u);
 if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{"content-type":MIME[extname(p)]||"application/octet-stream"});r.end(readFileSync(p));});
await new Promise(r=>srv.listen(8791,"127.0.0.1",r));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio"]});
for(const g of games){
  const pg=await br.newPage(); await pg.setViewport({width:375,height:667,isMobile:true,hasTouch:true});
  const errs=[]; pg.on("pageerror",e=>errs.push(String(e).slice(0,120)));
  try{ await pg.goto(`http://127.0.0.1:8791/satellites/${g}/?dev=1`,{waitUntil:"domcontentloaded",timeout:30000}); await new Promise(r=>setTimeout(r,2500));
    await pg.screenshot({path:`${OUT}/${g}-1boot.png`});
    // tap the biggest visible button-ish thing that says play/start/begin, then a few taps mid screen
    const t=await pg.evaluate(()=>{const els=[...document.querySelectorAll("button,a,[onclick],[role=button],.btn")].filter(e=>{const r=e.getBoundingClientRect();return r.width>40&&r.height>20&&r.top>=0&&r.bottom<=667&&/play|start|begin|go|dive|descend|enter|continue|new/i.test(e.textContent||"")});
      if(!els.length)return null;const r=els[0].getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,t:els[0].textContent.trim().slice(0,30)};});
    if(t){await pg.touchscreen.tap(t.x,t.y);await new Promise(r=>setTimeout(r,1500));}
    for(let i=0;i<6;i++){await pg.touchscreen.tap(187+(i%3-1)*80,400+(i%2)*60);await new Promise(r=>setTimeout(r,500));}
    await new Promise(r=>setTimeout(r,1500)); await pg.screenshot({path:`${OUT}/${g}-2play.png`});
    console.log(g,"ok tapped:",t?t.t:"nothing","errors:",errs.length?errs[0]:0);
  }catch(e){console.log(g,"ERR",String(e).slice(0,100));}
  await pg.close();
}
await br.close(); srv.close();
