import puppeteer from "puppeteer";
const games=["bramblewick","dewball","burrow-bowl","rule-root","flipbook","seed-flutter","pollen-panic","shell-shuffle","bubblenaut","nectar-drop","bloom-breaker","attic"];
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox"]});
let hidden=0, shown=0;
for(const g of games){
  const ctx=await br.createBrowserContext(); const p=await ctx.newPage();
  await p.setViewport({width:390,height:844});
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
  try{
    await p.goto("http://127.0.0.1:8951/satellites/"+g+"/?probe="+Math.random(),{waitUntil:"domcontentloaded",timeout:15000});
    await new Promise(r=>setTimeout(r,5200));
    const r=await p.evaluate(()=>{const f=document.querySelector(".lwfb-fab");if(!f)return{n:"NO FAB"};const c=getComputedStyle(f);
      return {op:c.opacity, pe:c.pointerEvents, vis:c.opacity!=="0"&&c.pointerEvents!=="none"};});
    if(r.n){console.log(g.padEnd(16)+"no fab mounted");}
    else{ r.vis?shown++:hidden++; console.log(g.padEnd(16)+(r.vis?"VISIBLE":"hidden ")+"  opacity="+r.op+" pe="+r.pe); }
  }catch(e){console.log(g.padEnd(16)+"ERR "+e.message.slice(0,40));}
  await ctx.close();
}
console.log("\n"+shown+" visible, "+hidden+" hidden of "+games.length);
await br.close();
