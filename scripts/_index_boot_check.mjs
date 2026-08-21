/* index.html is the live Lucid Winds game and 80k+ lines. A regex + vm script
   block checker has lied about this file before, so verify it the only way
   that cannot: load it and see whether it boots without throwing. */
import p from "puppeteer";
const b=await p.launch({headless:"new",args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage(); await pg.setViewport({width:430,height:932});
const errs=[]; pg.on("pageerror",e=>errs.push(String(e).slice(0,160)));
await pg.goto("http://127.0.0.1:8777/index.html",{waitUntil:"domcontentloaded",timeout:45000});
await new Promise(r=>setTimeout(r,6000));
const fns=await pg.evaluate(()=>["_generatePlantSVG","hashToTraits","getTerraGrade","switchTab",
  "renderGreenhouse","_e","getHaiku","FG_Wild"].map(n=>n+":"+(typeof window[n]!=="undefined"?"ok":"MISSING")));
console.log(" window fns  "+fns.join("  "));
console.log(errs.length?" PAGE ERRORS:\n  "+[...new Set(errs)].join("\n  "):" no page errors");
await b.close();
process.exit(errs.length||fns.some(f=>f.indexOf("MISSING")>=0)?1:0);
