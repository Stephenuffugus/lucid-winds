/* Does a reduced-motion player still have to wait out the deal?
   Emulates the OS preference and measures how long until the table is playable. */
import p from "puppeteer";
const slug=process.argv[2];
const b=await p.launch({headless:"new",args:["--no-sandbox","--disable-gpu"]});
for(const reduce of [false,true]){
  const pg=await b.newPage();
  await pg.setViewport({width:430,height:932});
  await pg.emulateMediaFeatures([{name:"prefers-reduced-motion",value:reduce?"reduce":"no-preference"}]);
  await pg.evaluateOnNewDocument(s=>{try{localStorage.clear();localStorage.setItem("sws_dir_"+s,"1");}catch(e){}},slug);
  const t0=Date.now();
  await pg.goto(`http://127.0.0.1:8777/play/${slug}.html`,{waitUntil:"domcontentloaded"});
  let settled=null;
  for(let i=0;i<80;i++){
    const dealing=await pg.evaluate(()=>/dealing…|shuffling…/i.test(document.body.innerText||"")).catch(()=>false);
    if(!dealing && i>4){ settled=Date.now()-t0; break; }
    await new Promise(r=>setTimeout(r,60));
  }
  console.log((reduce?"reduce      ":"no-preference")+"  table settled at "+(settled==null?"never":settled+"ms"));
  await pg.close();
}
await b.close();
