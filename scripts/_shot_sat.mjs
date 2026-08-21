/* Look at a satellite. Seeds the shell's first-visit overlay key and clicks
   past a start screen if there is one, so the shot is the game and not a modal. */
import p from "puppeteer";
const slug=process.argv[2], waits=(process.argv[3]||"3000").split(",").map(Number);
const clicks=(process.argv[4]||"").split(",").filter(Boolean);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await p.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox","--disable-gpu"]});
const pg=await b.newPage();
await pg.setViewport({width:430,height:932,deviceScaleFactor:2});
const errs=[]; pg.on("pageerror",e=>errs.push(String(e).slice(0,150)));
await pg.evaluateOnNewDocument(s=>{try{localStorage.clear();localStorage.setItem("sws_dir_"+s,"1");}catch(e){}},slug);
await pg.goto(`http://127.0.0.1:8777/satellites/${slug}/`,{waitUntil:"domcontentloaded",timeout:45000});
await sleep(2500);
for(const c of clicks){
  await pg.evaluate(t=>{
    const re=new RegExp(t,"i");
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    const el=Array.from(document.querySelectorAll("button,.btn,[role=button],a,div")).filter(vis)
      .find(e=>!e.children.length&&re.test((e.textContent||"").trim()));
    if(el)el.click();
  },c);
  await sleep(1400);
}
let i=0;
for(const w of waits){ await sleep(i===0?w:w-waits[i-1]);
  await pg.screenshot({path:`scratch/shots/${slug}_${w}.png`}); console.log("  shot "+w+"ms"); i++; }
if(errs.length)console.log(" PAGE ERRORS: "+[...new Set(errs)].slice(0,3).join(" | "));
await b.close();
