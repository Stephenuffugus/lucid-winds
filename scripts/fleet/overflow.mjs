/* Horizontal overflow probe: does anything run past the right edge (or the left) of the
   viewport once the page is settled? Reports scrollWidth vs innerWidth and the widest
   offenders. This is the check that would have caught "it cuts half way across the 8".
     node scripts/fleet/overflow.mjs <path> [W] [H] [tapRegex]
   exit 0 = clean, 1 = overflow */
import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT=process.cwd();
const [path, Wa, Ha, startRe]=process.argv.slice(2); const W=+Wa||412, H=+Ha||915;
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
if(startRe){ await pg.evaluate((src)=>{const re=new RegExp(src,"i"); const b=[...document.querySelectorAll("button,a,[role=button]")].find(e=>re.test(e.textContent.trim())&&!/later/i.test(e.textContent)); if(b) b.click();}, startRe); await new Promise(r=>setTimeout(r,2500)); await dismiss(); }
// ⛔ innerWidth follows the LAYOUT viewport: when content is wider than the phone, mobile
// Chrome widens the layout viewport and innerWidth grows with it (412 -> 443 on Reversi),
// so scrollWidth vs innerWidth is always "clean". Measure against the device width.
const rep=await pg.evaluate((W)=>{
  const iw=W, sw=Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  const off=[]; const fixedOrHidden=(e)=>{ let n=e; while(n&&n!==document.body){ const cs=getComputedStyle(n); if(cs.display==="none"||cs.visibility==="hidden"||+cs.opacity===0) return true; n=n.parentElement;} return false; };
  for(const e of document.querySelectorAll("body *")){ const r=e.getBoundingClientRect(); if(r.width<24||r.height<12) continue; if(fixedOrHidden(e)) continue;
    const over=Math.max(r.right-iw, -r.left); if(over>0.5){ off.push({tag:e.tagName.toLowerCase(), id:e.id||"", cls:(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className||"").toString().split(/\s+/).slice(0,2).join("."), left:Math.round(r.left), right:Math.round(r.right), w:Math.round(r.width), over:Math.round(over*10)/10}); } }
  off.sort((a,b)=>b.over-a.over||b.w-a.w);
  // outermost offenders only: drop any whose ancestor is also listed
  const els=[...document.querySelectorAll("body *")];
  return {iw, sw, layout:window.innerWidth, n:off.length, top:off.slice(0,6)};
}, W);
console.log(JSON.stringify({path, W, layoutW:rep.layout, scrollWidth:rep.sw, overflowPx:Math.max(0,rep.sw-rep.iw), offenders:rep.n, top:rep.top}));
await b.close(); s.close(); process.exit(rep.sw>rep.iw||rep.n?1:0);
