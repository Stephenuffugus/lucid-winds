/* One screenshot of a page from where the player stands, how-to sheet seeded closed, the
   music unlock card dismissed, an optional start tap.
     node scripts/fleet/shot.mjs <path> <out.png> [tapRegex[,tapRegex...]] [W] [H]
   e.g. node scripts/fleet/shot.mjs /play/doubleshutter.html /tmp/ds.png "roll" */
import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT=process.cwd();
const [path, out, startRe, Wa, Ha]=process.argv.slice(2); const W=+Wa||375, H=+Ha||667;
const M={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webp":"image/webp",".wasm":"application/wasm",".glb":"model/gltf-binary"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(0,"127.0.0.1",r)); const port=s.address().port;
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]});
const pg=await b.newPage(); await pg.setViewport({width:W,height:H,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const slug=(path.match(/\/play\/([a-z0-9-]+)\.html/)||[])[1];
await pg.evaluateOnNewDocument((slug)=>{try{localStorage.setItem("sws_dev_ok","1"); if(slug) localStorage.setItem("sws_dir_"+slug,"1");}catch(e){}},slug||"");
await pg.goto("http://127.0.0.1:"+port+path,{waitUntil:"load",timeout:45000});
await new Promise(r=>setTimeout(r,3000));
const dismiss=()=>pg.evaluate(()=>{const l=[...document.querySelectorAll("button")].find(e=>/^later$/i.test(e.textContent.trim())); if(l) l.click(); const d=document.getElementById("shell-dir-play"); if(d) d.click();});
await dismiss();
for(const oneRe of (startRe?startRe.split(","):[])){ const hit=await pg.evaluate((src)=>{const re=new RegExp(src,"i"); const b=[...document.querySelectorAll("button,a,[role=button]")].filter(e=>{const r=e.getBoundingClientRect();return r.width>60&&r.height>28}).find(e=>re.test(e.textContent.trim())&&!/later|play it now/i.test(e.textContent)); if(b){b.click();return b.textContent.trim().slice(0,20)} return null;}, oneRe); await new Promise(r=>setTimeout(r,2500)); await dismiss(); console.log("tap: "+hit); }
await pg.screenshot({path:out}); console.log("wrote "+out);
await b.close(); s.close();
