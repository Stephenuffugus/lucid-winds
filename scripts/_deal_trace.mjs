/* How fast is the deal ACTUALLY going out? Poll the table text, do not infer
   it from a couple of screenshots. */
import p from "puppeteer";
const slug=process.argv[2]||"bleedinghearts";
const b=await p.launch({headless:"new",args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage();
await pg.setViewport({width:430,height:932});
await pg.evaluateOnNewDocument(s=>{try{localStorage.clear();localStorage.setItem("sws_dir_"+s,"1");}catch(e){}},slug);
const t0=Date.now();
await pg.goto(`http://127.0.0.1:8777/play/${slug}.html`,{waitUntil:"domcontentloaded"});
let last="";
for(let i=0;i<70;i++){
  const st=await pg.evaluate(()=>{
    const t=document.body.innerText||"";
    const counts=(t.match(/×\d+/g)||[]).join(",");
    const deck=(t.match(/dealing…|shuffling…/)||[""])[0];
    const el=Array.from(document.querySelectorAll('div')).find(e=>!e.children.length&&/^\d+$/.test((e.textContent||"").trim())&&e.style.position==='absolute');
    return counts+" | "+deck;
  }).catch(()=>"");
  if(st!==last){ console.log(String(Date.now()-t0).padStart(5)+"ms  "+st); last=st; }
  await new Promise(r=>setTimeout(r,80));
}
await b.close();
