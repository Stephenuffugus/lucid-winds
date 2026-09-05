/* Where is a thing on the screen, really? Prints the bounding rect and the computed
   display / visibility / opacity of every match of a selector once the page is settled.
     node scripts/fleet/rect.mjs <path> <selector> [W] [H] [tapRegex] */
import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const ROOT=process.cwd();
const [path, sel, Wa, Ha, startRe]=process.argv.slice(2); const W=+Wa||412, H=+Ha||915;
const M={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webp":"image/webp"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[extname(p)]||"application/octet-stream"});r.end(readFileSync(p))});
await new Promise(r=>s.listen(0,"127.0.0.1",r)); const port=s.address().port;
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio"]});
const pg=await b.newPage(); await pg.setViewport({width:W,height:H,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const slug=(path.match(/\/play\/([a-z0-9-]+)\.html/)||[])[1];
await pg.evaluateOnNewDocument((slug)=>{try{localStorage.setItem("sws_dev_ok","1"); if(slug) localStorage.setItem("sws_dir_"+slug,"1");}catch(e){}},slug||"");
await pg.goto("http://127.0.0.1:"+port+path,{waitUntil:"load",timeout:45000});
await new Promise(r=>setTimeout(r,3000));
await pg.evaluate(()=>{const l=[...document.querySelectorAll("button")].find(e=>/^later$/i.test(e.textContent.trim())); if(l) l.click(); const d=document.getElementById("shell-dir-play"); if(d) d.click();});
if(startRe){ await pg.evaluate((src)=>{const re=new RegExp(src,"i"); const b=[...document.querySelectorAll("button,a,[role=button]")].find(e=>re.test(e.textContent.trim())); if(b) b.click();}, startRe); await new Promise(r=>setTimeout(r,2000)); }
const out=await pg.evaluate((sel)=>[...document.querySelectorAll(sel)].map(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); let n=e, hiddenBy=null; while(n&&n!==document.body){const c=getComputedStyle(n); if(c.display==="none"||c.visibility==="hidden"||+c.opacity===0){hiddenBy=n.tagName.toLowerCase()+(n.id?"#"+n.id:"")+(n.className&&typeof n.className==="string"?"."+n.className.split(/\s+/)[0]:"")+" ("+(c.display==="none"?"display:none":c.visibility==="hidden"?"visibility:hidden":"opacity:0")+")"; break;} n=n.parentElement;}
  return {tag:e.tagName.toLowerCase(), id:e.id, cls:(typeof e.className==="string"?e.className:"").slice(0,40), x:Math.round(r.left), y:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height), display:cs.display, fontSize:cs.fontSize, color:cs.color, hiddenBy, text:(e.textContent||"").trim().slice(0,60)};}), sel);
console.log(JSON.stringify({path, W, H, sel, scrollY: await pg.evaluate(()=>scrollY), matches:out}, null, 1));
await b.close(); s.close();
