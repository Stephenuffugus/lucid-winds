/* One pass over every card game after a day of surgery on the shared lib.
   Asks each one: does it boot without a page error, does it settle, and is
   there a card back actually painted on a face-down card? */
import p from "puppeteer";
const SLUGS=["bowergarden","gardenspades","bleedinghearts","cribbage","juniper",
             "klondike","spider","freecell","golf","tripeaks","pyramid"];
/* ⛔ FreeCell deals every card face up and its deck only exists during the
   deal, so zero card backs on a settled table is CORRECT there. The first run
   of this sweep failed FreeCell for it, which was the check being wrong rather
   than the game. */
const NO_BACKS=["freecell"];
const b=await p.launch({headless:"new",args:["--no-sandbox","--disable-gpu"]});
let bad=0;
for(const s of SLUGS){
  const pg=await b.newPage(); await pg.setViewport({width:430,height:932});
  const errs=[]; pg.on("pageerror",e=>errs.push(String(e).slice(0,110)));
  pg.on("console",m=>{if(m.type()==="error")errs.push("console:"+m.text().slice(0,110));});
  await pg.evaluateOnNewDocument(x=>{try{localStorage.clear();localStorage.setItem("sws_dir_"+x,"1");}catch(e){}},s);
  try{ await pg.goto(`http://127.0.0.1:8777/play/${s}.html`,{waitUntil:"domcontentloaded",timeout:40000}); }
  catch(e){ console.log(` ${s.padEnd(15)} ⛔ LOAD FAILED`); bad++; await pg.close(); continue; }
  await new Promise(r=>setTimeout(r,5200));
  const st=await pg.evaluate(()=>{
    /* is the real deck art painted anywhere on screen? */
    let back=0, ghost=0;
    for(const e of document.querySelectorAll('div')){
      const bg=getComputedStyle(e).backgroundImage||"";
      if(bg.indexOf('card-back')>=0) back++;
      /* the signature of the collision bug: a width that is not a number */
      if((e.getAttribute('style')||'').indexOf('[object')>=0) ghost++;
    }
    return {back, ghost, dealing:/dealing…|shuffling…/i.test(document.body.innerText||"")};
  }).catch(()=>({back:-1,ghost:-1}));
  const wantBacks = NO_BACKS.indexOf(s)<0;
  const ok = (wantBacks ? st.back>0 : st.back===0) && st.ghost===0 && !st.dealing && errs.length===0;
  if(!ok) bad++;
  console.log(` ${s.padEnd(15)} ${ok?"ok  ":"⛔  "} backs:${String(st.back).padStart(3)}${wantBacks?"":" (none expected)"}  broken-style:${st.ghost}  ${st.dealing?"STILL DEALING at 5.2s  ":""}${errs.length?"errors: "+[...new Set(errs)].slice(0,2).join(" | "):""}`);
  await pg.close();
}
await b.close();
console.log(`\n${SLUGS.length-bad}/${SLUGS.length} card games clean`);
process.exit(bad?1:0);
