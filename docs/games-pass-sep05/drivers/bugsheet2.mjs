import puppeteer from "puppeteer"; import fs from "fs";
const which=process.argv[2]||"after", OUT=process.argv[3]||("lb/vocab-"+which+".png");
const src=fs.readFileSync(which==="before"?"bug-engine.before.js":"/workspaces/Litter_Bug/bug-engine.js","utf8");
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu"]}); const pg=await b.newPage(); await pg.setViewport({width:1200,height:1400,deviceScaleFactor:2});
await pg.setContent(`<body style="margin:0;background:#0b0d10;color:#8fa0b2;font:11px system-ui"><div id="s"></div></body>`);
await pg.addScriptTag({content:src});
const hs=[]; const hex='0123456789abcdef'; let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; }; for(let i=0;i<24;i++){ let h=''; for(let j=0;j<64;j++) h+=hex[(rnd()*16)|0]; hs.push(h); }
await pg.evaluate((hs)=>{ const grow=l=>Math.max(1,Math.round(7+l*0.8)); let h='<div style="padding:10px;display:grid;grid-template-columns:repeat(6,1fr);gap:8px">';
  for(const x of hs){ const P=window.BUG_ENGINE.bugPlan(x); const tag=P.patternKind!==undefined?('pat'+P.patternKind+' hd'+P.headKind+' wg'+P.wingStyle+' hn'+P.hornKind+' sp'+P.spineKind+' an'+P.antStyle+' ey'+P.eyeStyle+' lg'+P.legStyle):'old';
    h+='<div style="background:radial-gradient(circle at 50% 58%,#26323f 0%,#1a232c 52%,#131a22 74%);border:1px solid #28323d;border-radius:12px;padding:4px;text-align:center">'+window.BUG_ENGINE._generateBugSVG(x,180,grow(30))+'<div style="font-size:10px;color:#8fa0b2">'+window.BUG_ENGINE.bugName(x)+'</div><div style="font-size:9px;color:#5a6470">'+tag+'</div></div>'; }
  document.getElementById('s').innerHTML=h+'</div>'; }, hs);
await new Promise(r=>setTimeout(r,600)); const hgt=await pg.evaluate(()=>document.body.scrollHeight); await pg.setViewport({width:1200,height:Math.min(2400,hgt),deviceScaleFactor:2});
await pg.screenshot({path:OUT,fullPage:true}); console.log("wrote "+OUT); await b.close();
