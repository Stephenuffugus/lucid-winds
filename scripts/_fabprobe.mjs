import puppeteer from "puppeteer";
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox"]});
const p=await br.newPage();
await p.setViewport({width:390,height:844,deviceScaleFactor:1});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
await p.goto("http://127.0.0.1:8951/satellites/bramblewick/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await new Promise(r=>setTimeout(r,5000));
const r=await p.evaluate(()=>{
  const fab=document.querySelector(".lwfb-fab");
  if(!fab) return {err:"no fab"};
  const b=fab.getBoundingClientRect();
  const cs=getComputedStyle(fab);
  const pts=[[b.left+6,b.top+6],[b.right-6,b.top+6],[b.left+6,b.bottom-6],[b.right-6,b.bottom-6],[b.left+b.width/2,b.top+b.height/2]];
  const under=pts.map(([x,y])=>{
    // walk ANCESTORS, the way feedback.js does. A className-only filter keeps the
    // badge's classless inner span and over-reports what is under the chip.
    const ours=e=>{for(let n=e;n;n=n.parentElement){const c=n.className;if(c&&String(c).indexOf("lwfb")>=0)return true;}return false;};
    const els=document.elementsFromPoint(x,y).filter(e=>!ours(e));
    const e=els[0];
    if(!e) return "nothing";
    const r2=e.getBoundingClientRect();
    return (e.tagName.toLowerCase())+(e.id?"#"+e.id:"")+(e.className&&typeof e.className==="string"?"."+e.className.trim().split(/\s+/)[0]:"")
      +" ["+Math.round(r2.width)+"x"+Math.round(r2.height)+"] text="+JSON.stringify((e.textContent||"").trim().slice(0,28));
  });
  // a FADED chip keeps its rect and its left/top, so position alone lies
  const visible = cs.opacity!=="0" && cs.visibility!=="hidden" && cs.display!=="none" && cs.pointerEvents!=="none";
  return {visible, opacity:cs.opacity, pointerEvents:cs.pointerEvents,
    rect:{x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)},
    pos:cs.position, left:cs.left, top:cs.top, right:cs.right, bottom:cs.bottom,
    vw:innerWidth, vh:innerHeight, under, same:new Set(under).size===1};
});
console.log(JSON.stringify(r,null,1));
await br.close();
