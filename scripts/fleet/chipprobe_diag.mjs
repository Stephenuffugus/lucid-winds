import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT="/workspaces/lucid-winds";
const M={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webp":"image/webp"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(8833,"127.0.0.1",r));
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio"]});
const pages=process.argv.slice(2).length?process.argv.slice(2):["/satellites/petal-alchemy/","/satellites/rootbound/","/satellites/deepwell/"];
for(const path of pages){
  const pg=await b.newPage(); await pg.setViewport({width:375,height:667,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1")}catch(e){}});
  await pg.goto("http://127.0.0.1:8833"+path,{waitUntil:"load",timeout:40000}).catch(e=>console.log("  goto:",e.message.slice(0,60)));
  const read=(label)=>pg.evaluate((label)=>{
    const c=document.getElementById("sws-music-chip"); if(!c) return label+": no chip";
    const r=c.getBoundingClientRect(); const tight=c.classList.contains("swsm-tight")?" TIGHT":""; const cx=r.left+r.width/2, cy=r.top+r.height/2;
    c.style.visibility="hidden"; const under=document.elementsFromPoint(cx,cy).filter(e=>e!==document.body&&e!==document.documentElement).slice(0,2); c.style.visibility="";
    const desc=under.map(e=>(e.id?"#"+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==="string"?"."+e.className.split(" ")[0]:""))+" '"+(e.textContent||"").trim().slice(0,22).replace(/\s+/g," ")+"'").join(" / ");
    return label+": chip at "+Math.round(r.left)+","+Math.round(r.top)+" "+Math.round(r.width)+"x"+Math.round(r.height)+tight+"  under: "+desc;
  },label);
  await new Promise(r=>setTimeout(r,1300)); console.log(path); console.log("  "+await read("1.3s"));
  await new Promise(r=>setTimeout(r,3200)); console.log("  "+await read("4.5s"));
  // into the play screen where the audit saw the chip on the game's own top bar, then a reseat tick
  const clicked=await pg.evaluate(()=>{const b=[...document.querySelectorAll("button,a")].find(e=>/free alchemy|play|start/i.test(e.textContent)&&e.getBoundingClientRect().width>100); if(b){b.click(); return b.textContent.trim().slice(0,20)} return null});
  if(clicked){ await new Promise(r=>setTimeout(r,17000)); const diag=await pg.evaluate(()=>{const H=innerHeight; const pts={bottomLeft:[[18,H-50],[58,H-34],[98,H-18]], midLeft:[[18,H/2-16],[58,H/2],[98,H/2+16]]}; const out={};
  for(const k in pts){ out[k]=pts[k].map(([x,y])=>document.elementsFromPoint(x,y).filter(e=>e!==document.body&&e!==document.documentElement).slice(0,2).map(e=>(e.id?"#"+e.id:e.tagName.toLowerCase()+"."+String(e.className).split(" ")[0])+"@"+Math.round(e.getBoundingClientRect().width)+"x"+Math.round(e.getBoundingClientRect().height)).join(">")); }
  const c=document.getElementById("sws-music-chip"); out.chip={moved:c&&c._moved, pos:localStorage.getItem("sws_music_chip_pos"), corner:c&&c.getAttribute("data-corner")}; return out;});
console.log("  diag: "+JSON.stringify(diag).slice(0,200));
const keys=await pg.evaluate(()=>({t:typeof window.SWSMusic, k:window.SWSMusic?Object.keys(window.SWSMusic):null, src:[...document.scripts].map(s=>s.src.split("/").pop()).filter(s=>/music/.test(s))})); console.log("  SWSMusic: "+JSON.stringify(keys));
const corners=await pg.evaluate(()=>{const c=window.SWSMusic&&window.SWSMusic.corners?window.SWSMusic.corners():null; const after=window.SWSMusic&&window.SWSMusic.reseat?window.SWSMusic.reseat():null; return {c,after};});
console.log("  corners: "+(corners.c?corners.c.map(o=>o.css.replace(/calc\([^)]*\)/g,"E").replace(/px;/g," ")+"="+o.score).join(" | "):"none")+"\n  reseat now -> "+corners.after);
console.log("  after tapping '"+clicked+"' +6s: "+(await read("play"))); }
  await pg.screenshot({path:"/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/chip-"+path.replace(/[^a-z]/g,"")+".png"});
  await pg.close();
}
await b.close(); s.close();
