import puppeteer from "puppeteer"; import fs from "fs"; import { createRequire } from "module";
const require=createRequire(import.meta.url); const ROOT="/workspaces/lucid-winds/satellites/attic/";
const ATTIC=require(ROOT+"attic-engine.js"), OBJ=require(ROOT+"object-render.js");
const setByte=(h,n,v)=>h.slice(0,n*2)+('0'+v.toString(16)).slice(-2)+h.slice(n*2+2);
const rng=(i)=>{ let x=2166136261^i; return ()=>{ x^=x<<13; x>>>=0; x^=x>>>17; x^=x<<5; x>>>=0; return x; }; };
const hashes=[]; for(let i=0;i<6000;i++){ const r=rng(i*7+1); let h=''; for(let k=0;k<8;k++) h+=('0000000'+r().toString(16)).slice(-8); hashes.push(h); }
const recs=hashes.filter(h=>ATTIC.hashToItem(h).cls==='RECORD');
// four layouts: byte7 <128 with byte16 % 4 = 0..3, and byte7 >=128 with byte7%4 = 0..3
const rows=[]; for(let L=0;L<8;L++){ const base=recs[L]; let h=L<4? setByte(setByte(base,7,10),16,L) : setByte(base,7,128+L-4); rows.push(h); }
let html='<style>body{background:#171310;margin:0;padding:10px;font:11px ui-monospace,monospace;color:#c8b898}table{border-collapse:collapse}td{padding:3px;vertical-align:top}th{color:#d9a94e;font-weight:400;padding:4px}</style><table><tr><th></th>'+['1950s','1960s','1970s','1980s','1990s'].map(e=>'<th>'+e+'</th>').join('')+'</tr>';
rows.forEach((base,L)=>{ html+='<tr><th>layout '+L+'</th>'; for(let e=0;e<5;e++){ const h=setByte(setByte(base,1,e),2,0x88); html+='<td>'+OBJ.renderItem(h,200).svg+'</td>'; } html+='</tr>'; });
html+='</table>'; fs.writeFileSync(process.env.OUT+'/recsheet.html',html);
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu"]}); const pg=await b.newPage(); await pg.setViewport({width:1080,height:1800,deviceScaleFactor:1});
await pg.goto('file://'+process.env.OUT+'/recsheet.html'); await new Promise(r=>setTimeout(r,800)); await pg.screenshot({path:process.env.OUT+'/recsheet.png',fullPage:true}); await b.close(); console.log('record sheet written');
