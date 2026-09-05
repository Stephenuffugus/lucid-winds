import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds", OUT="/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/sat";
const M={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webp":"image/webp",".mp3":"audio/mpeg",".glb":"model/gltf-binary",".wasm":"application/wasm"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(8839,"127.0.0.1",r));
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]});
const list=(process.argv[2]||"sprout-dice,rootbound,twin-lanterns").split(",");
for(const slug of list){
  const pg=await b.newPage(); await pg.setViewport({width:430,height:932,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1")}catch(e){}});
  await pg.goto("http://127.0.0.1:8839/satellites/"+slug+"/",{waitUntil:"load",timeout:45000}).catch(e=>console.log(slug,"goto:",e.message.slice(0,50)));
  await new Promise(r=>setTimeout(r,3500));
  const dismiss=()=>pg.evaluate(()=>{const l=[...document.querySelectorAll("button")].find(e=>/^later$/i.test(e.textContent.trim())); if(l) l.click();});
  await dismiss();
  const shots=[];
  for(let step=0; step<3; step++){
    const clicked=await pg.evaluate(()=>{const b=[...document.querySelectorAll("button,a,[role=button]")].filter(e=>{const r=e.getBoundingClientRect();return r.width>80&&r.height>34&&r.top>60&&r.top<900}).find(e=>/new run|new game|new climb|start|play|begin|continue|tonight|first bed|easy|garden 1|free play|quick|^1$/i.test(e.textContent.trim())&&!/later|play it now|how to|records|back|settings|sound|music|all sky wolf/i.test(e.textContent)); if(b){b.click();return b.textContent.trim().slice(0,18)} return null});
    await new Promise(r=>setTimeout(r,2500)); await dismiss();
    if(!clicked){ const cell=await pg.evaluate(()=>{const c=[...document.querySelectorAll("div,span,a,button")].find(e=>e.children.length<=1&&e.textContent.trim()==="1"&&e.getBoundingClientRect().width>40); if(c){c.click();return "cell 1"} return null}); if(cell){ shots.push(cell); await new Promise(r=>setTimeout(r,2500)); continue; } }
    shots.push(clicked); if(!clicked) break;
  }
  // one more tap each, by what the frames showed: the topmost floor node, the seedbed's first cell, the names form's Save
  const EXTRA={"sprout-dice":/^floor 10|^floor 1\b|^floor/i, "rootbound":/^1\b/, "twin-lanterns":/^save$/i};
  if(EXTRA[slug]){ const hit=await pg.evaluate((src)=>{const re=new RegExp(src,"i"); const els=[...document.querySelectorAll("button,a,div,span,li")].filter(e=>{const r=e.getBoundingClientRect(); return r.width>=40&&r.height>=30&&r.top>60&&r.top<900&&re.test(e.textContent.trim())}); els.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top); const e=els.find(x=>x.textContent.trim().length<40)||els[0]; if(e){e.click();return e.textContent.trim().slice(0,20)} return null;}, EXTRA[slug].source);
    shots.push("extra:"+hit); await new Promise(r=>setTimeout(r,3000)); await dismiss(); }
  await pg.screenshot({path:OUT+"/"+slug+"-full.png"});
  // the square: the widest band of the viewport, centred on the game's visual middle (upper 60%)
  await pg.screenshot({path:OUT+"/"+slug+"-sq.png", clip:{x:0,y:120,width:430,height:430}});
  console.log(slug+": taps "+JSON.stringify(shots));
  await pg.close();
}
await b.close(); s.close();
