import puppeteer from "puppeteer"; import fs from "fs";
const before=fs.readFileSync("bug-engine.before.js","utf8"), after=fs.readFileSync("/workspaces/Litter_Bug/bug-engine.js","utf8");
const OUT=process.argv[2]||"lb/bugsheet.png";
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu"]}); const pg=await b.newPage(); await pg.setViewport({width:1180,height:1500,deviceScaleFactor:2});
await pg.setContent(`<body style="margin:0;background:#0b0d10;color:#8fa0b2;font:12px system-ui"><div id="s"></div></body>`);
await pg.addScriptTag({content: before + "\nwindow.BEFORE=window.BUG_ENGINE;"});
await pg.addScriptTag({content: after + "\nwindow.AFTER=window.BUG_ENGINE;"});
const hashes=["b96525c728658b68e968801887738eb0cde0532fc11e15d7146c12d87fe71981","815e74794564ed9197d2540aedd549f80ddef361bd403c0c43b912e41c7ff876","4501191ac48e25d8a0f2c6b7e3d1c9a4f5b6e7d8c9a0b1c2d3e4f5a6b7c8d9e0","eb2aaea89252c9b5f1d2e3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4","0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef","deadbeefcafef00d1234567890abcdef1122334455667788990011223344aabb","a9f3c2e17b5d4680fedcba9876543210fedcba9876543210fedcba9876543210","5e8004f4b621ac0fce2820d75f72606b28f05335500db59438c823b419a9b0ac"];
await pg.evaluate((hashes)=>{ const grow=l=>Math.max(1,Math.round(7+l*0.8)); let h='<div style="padding:12px;display:grid;grid-template-columns:120px 120px 250px 250px 250px;gap:10px;align-items:center"><div></div><div>84px before | after</div><div>230px BEFORE (lv 30)</div><div>230px AFTER (lv 30)</div><div>230px AFTER (lv 1)</div>';
  for(const x of hashes){ const n=window.AFTER.bugName(x); h+='<div style="font-size:11px">'+n+'</div>';
    h+='<div style="display:flex;gap:6px"><div style="background:#131a22;border:1px solid #28323d;border-radius:10px;padding:4px">'+window.BEFORE._generateBugSVG(x,84,grow(30))+'</div><div style="background:#131a22;border:1px solid #28323d;border-radius:10px;padding:4px">'+window.AFTER._generateBugSVG(x,84,grow(30))+'</div></div>';
    h+='<div style="background:radial-gradient(circle at 50% 58%,#26323f 0%,#1a232c 52%,transparent 74%)">'+window.BEFORE._generateBugSVG(x,230,grow(30))+'</div>';
    h+='<div style="background:radial-gradient(circle at 50% 58%,#26323f 0%,#1a232c 52%,transparent 74%)">'+window.AFTER._generateBugSVG(x,230,grow(30))+'</div>';
    h+='<div style="background:radial-gradient(circle at 50% 58%,#26323f 0%,#1a232c 52%,transparent 74%)">'+window.AFTER._generateBugSVG(x,230,grow(1))+'</div>'; }
  document.getElementById('s').innerHTML=h+'</div>'; }, hashes);
await new Promise(r=>setTimeout(r,800)); const hgt=await pg.evaluate(()=>document.body.scrollHeight); await pg.setViewport({width:1180,height:Math.min(3000,hgt),deviceScaleFactor:2});
await pg.screenshot({path:OUT,fullPage:true}); console.log("wrote "+OUT+" h="+hgt); await b.close();
