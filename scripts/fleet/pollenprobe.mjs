import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds", TAG=process.argv[2]||"before";
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webp":"image/webp"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(8834,"127.0.0.1",r));
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio"]});
const pg=await b.newPage(); await pg.setViewport({width:375,height:667,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await pg.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dir_pollen","1")}catch(e){}});
const art=new Map();
pg.on("response", async r=>{ const u=r.url(); if(u.includes("masterpollinator")){ try{ const buf=await r.buffer(); art.set(u.split("/masterpollinator/")[1], {status:r.status(), bytes:buf.length}); }catch(e){ art.set(u.split("/masterpollinator/")[1], {status:r.status(), bytes:0}); } } });
await pg.goto("http://127.0.0.1:8834/play/pollen.html",{waitUntil:"load",timeout:60000});
await new Promise(r=>setTimeout(r,2500));
// get onto a board: press the first big primary button if a menu is up
const clicked=await pg.evaluate(()=>{const b=[...document.querySelectorAll("button")].find(e=>/new game|play|start|solo/i.test(e.textContent)&&e.getBoundingClientRect().width>80); if(b){b.click();return b.textContent.trim().slice(0,24)} return null});
await new Promise(r=>setTimeout(r,1500));
// the unlock card first, then the seats sheet's start button
const later=await pg.evaluate(()=>{const b=[...document.querySelectorAll("button")].find(e=>/^later$/i.test(e.textContent.trim())); if(b){b.click();return true} return false});
await new Promise(r=>setTimeout(r,600));
const started=await pg.evaluate(()=>{const b=[...document.querySelectorAll("button")].filter(e=>e.getBoundingClientRect().width>60).find(e=>/start|begin|deal|let.s go|play$/i.test(e.textContent.trim())); if(b){b.click();return b.textContent.trim().slice(0,24)} return [...document.querySelectorAll("button")].map(e=>e.textContent.trim().slice(0,14)).filter(Boolean).slice(0,12).join("|")});
console.log("  later="+later+" started="+started);
await new Promise(r=>setTimeout(r,3000));
// the shell's how-to sheet opens over the board under whatever id this game has: press its own button
const gotit=await pg.evaluate(()=>{const b=document.getElementById("shell-dir-play")||[...document.querySelectorAll("#PNrulesOV button, button")].find(e=>/^close$|got it|let.s play/i.test(e.textContent.trim())); if(b){b.click();return b.textContent.trim().slice(0,16)} return null});
console.log("  how-to dismissed via: "+gotit);
const diag=await pg.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=="hidden"};
  const btns=[...document.querySelectorAll("button")].filter(vis).map(e=>(e.id?"#"+e.id+":":"")+e.textContent.trim().slice(0,14)).slice(0,14);
  const top=document.elementsFromPoint(187,300).slice(0,3).map(e=>(e.id?"#"+e.id:e.tagName.toLowerCase()+"."+String(e.className).split(" ")[0]));
  return {btns, top}});
console.log("  visible buttons: "+diag.btns.join(" | ")); console.log("  at screen centre: "+diag.top.join(" > "));
await new Promise(r=>setTimeout(r,3000));
const cards=await pg.evaluate(()=>({cards:document.querySelectorAll(".pn-card").length, imgs:[...document.querySelectorAll(".pn-card img")].filter(i=>i.complete&&i.naturalWidth>0).length, hidden:[...document.querySelectorAll(".pn-card img")].filter(i=>i.style.display==="none").length}));
let total=0, ok=0, miss=0; for(const [k,v] of art){ total+=v.bytes; if(v.status===200) ok++; else miss++; }
console.log(`${TAG}: clicked=${clicked} cards=${cards.cards} imgs loaded=${cards.imgs} hidden=${cards.hidden}  art requests=${art.size} (200:${ok} other:${miss})  bytes=${(total/1048576).toFixed(1)} MB`);
const top=[...art.entries()].filter(([k,v])=>v.status===200).sort((a,b)=>b[1].bytes-a[1].bytes).slice(0,3).map(([k,v])=>k+" "+(v.bytes/1024).toFixed(0)+"KB"); console.log("  largest: "+top.join(", "));
await pg.screenshot({path:"/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/pollen-"+TAG+".png"});
// the inspect view: long press is the real gesture, but a click on the card also opens it per the code's tap handler
await pg.evaluate(()=>{const c=document.querySelector(".pn-card"); if(c){ const h=c.getAttribute("onclick"); if(h) (new Function(h))(); }});
await new Promise(r=>setTimeout(r,1800));
const big=await pg.evaluate(()=>{const i=document.querySelector(".pn-big-card img"); return i?{w:i.naturalWidth,src:i.getAttribute("src").split("/").slice(-2).join("/"),shown:i.style.display!=="none"}:null});
console.log("  inspect img: "+JSON.stringify(big));
await pg.screenshot({path:"/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/pollen-"+TAG+"-inspect.png"});
await b.close(); s.close();
