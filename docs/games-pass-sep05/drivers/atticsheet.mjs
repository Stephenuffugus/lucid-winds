import puppeteer from "puppeteer"; import fs from "fs";
const which=process.argv[2]||"after", OUT=process.argv[3]||("attic/layout-"+which+".png");
const A="/workspaces/lucid-winds/satellites/attic/";
const eng=fs.readFileSync(A+"attic-engine.js","utf8"), econ=fs.readFileSync(A+"attic-econ.js","utf8");
const slv=fs.readFileSync(which==="before"?"sleeve-render.before.js":A+"sleeve-render.js","utf8");
const obj=fs.readFileSync(which==="before"?"object-render.before.js":A+"object-render.js","utf8");
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu"]}); const pg=await b.newPage(); await pg.setViewport({width:1260,height:2000,deviceScaleFactor:2});
await pg.setContent(`<body style="margin:0;background:#171310;color:#c4b294;font:11px Georgia,serif"><div id="s"></div></body>`);
for(const src of [eng,econ,slv,obj]) await pg.addScriptTag({content:src});
/* deterministic hash set: for each class, six hashes, preferring ones whose new-layout byte is high so the after sheet shows the bank */
const hex='0123456789abcdef'; let seed=11; const rnd=()=>{ seed=(seed*48271)%2147483647; return seed/2147483647; };
const picked=await pg.evaluate((hexs)=>{ const want={RECORD:7,VHS:8,CEREAL:9,COMIC:10,TOY:11,HANDHELD:12,GAME:13,PAPERBACK:14,LUNCHBOX:15,ZINE:30}; const out={}; let seed=11; const rnd=()=>{ seed=(seed*48271)%2147483647; return seed/2147483647; };
  for(let tries=0; tries<40000; tries++){ let h=''; for(let j=0;j<64;j++) h+=hexs[(rnd()*16)|0]; const it=window.ATTIC.hashToItem(h); const cls=it.cls; out[cls]=out[cls]||[]; if(out[cls].length>=6) continue; const byte=parseInt(h.substr(want[cls]*2,2),16); const wantHigh=out[cls].length<4; if((wantHigh&&byte>=128)||(!wantHigh&&byte<128)) out[cls].push(h); if(Object.values(out).every(a=>a.length>=6)&&Object.keys(out).length>=10) break; }
  return out; }, hex);
await pg.evaluate((picked)=>{ let h=''; for(const cls of Object.keys(picked)){ h+='<div style="padding:6px 10px;font-size:13px;color:#d9a94e;letter-spacing:.2em">'+cls+'</div><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:0 10px 8px">'; for(const x of picked[cls]){ const it=window.ATTIC.hashToItem(x); h+='<div style="background:#221b14;border:1px solid #4a3b26;border-radius:8px;padding:4px;text-align:center">'+window.ATTIC_OBJECT.renderItem(x,190).svg+'<div style="font-size:10px;margin-top:3px;height:26px;overflow:hidden">'+it.name+'</div><div style="font-size:9px;color:#8a7a5e">'+it.era+' · '+it.grade+'</div></div>'; } h+='</div>'; } document.getElementById('s').innerHTML=h; }, picked);
await new Promise(r=>setTimeout(r,600)); const hgt=await pg.evaluate(()=>document.body.scrollHeight); await pg.setViewport({width:1260,height:Math.min(6000,hgt),deviceScaleFactor:1.5});
await pg.screenshot({path:OUT,fullPage:true}); console.log("wrote "+OUT+" h="+hgt); await b.close();
