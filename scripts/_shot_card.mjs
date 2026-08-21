/* Look at a card game. ⛔ A visual change is not done until it has been looked
   at, and the shell puts a first-visit directions overlay in front of every
   game (localStorage key sws_dir_<gameId>), so seed it or you photograph a
   modal instead of a table. */
import p from "puppeteer";
const BASE="http://127.0.0.1:8777";
const slug=process.argv[2], waits=(process.argv[3]||"3500").split(",").map(Number);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await p.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox","--disable-gpu"]});
const pg=await b.newPage();
await pg.setViewport({width:430,height:932,deviceScaleFactor:2});
const errs=[]; pg.on("pageerror",e=>errs.push(String(e).slice(0,160)));
pg.on("console",m=>{ if(m.type()==="error") errs.push("console: "+m.text().slice(0,160)); });
await pg.evaluateOnNewDocument(s=>{
  try{ localStorage.clear(); localStorage.setItem("sws_dir_"+s,"1"); }catch(e){}
}, slug);
await pg.goto(`${BASE}/play/${slug}.html`,{waitUntil:"domcontentloaded",timeout:45000});
let i=0;
for(const w of waits){
  await sleep(i===0?w:w-waits[i-1]);
  await pg.screenshot({path:`scratch/cardback/shot_${slug}_${w}.png`});
  console.log("  shot at "+w+"ms");
  i++;
}
if(errs.length) console.log("PAGE ERRORS:\n  "+[...new Set(errs)].join("\n  "));
await b.close();
