/* Blockspace gate: boots the real page headless (swiftshader WebGL), drives REAL
   pointer events on the canvas for the things a thumb does (tap the floor, tap a
   block's top, hold to draw a line, orbit), and the BS hook for the rest. Ends with
   screenshots in test/out/ that a human must LOOK at.  node test/check.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
const HERE=new URL('.', import.meta.url).pathname, ROOT=join(HERE,'..','..','..'); mkdirSync(join(HERE,'out'),{recursive:true});
const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png'};
const srv=createServer((q,r)=>{ const u=decodeURIComponent(q.url.split('?')[0]); let p=join(ROOT,u.endsWith('/')?u+'index.html':u); if(!existsSync(p)||statSync(p).isDirectory()){ r.writeHead(404); return r.end(); } r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'}); r.end(readFileSync(p)); }).listen(8969);
const b=await puppeteer.launch({headless:'new',protocolTimeout:120000,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
const pg=await b.newPage(); await pg.setViewport({width:375,height:667,deviceScaleFactor:1});
const errs=[]; pg.on('pageerror',e=>errs.push(String(e.message||e).slice(0,200))); pg.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text().slice(0,200)); });
const fails=[]; const ok=(c,m)=>{ console.log((c?'  PASS  ':'  FAIL  ')+m); if(!c) fails.push(m); };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const frames=n=>pg.evaluate(n=>new Promise(r=>{ let k=0; (function f(){ if(++k>=n) r(); else requestAnimationFrame(f); })(); }),n);
async function tap(x,y){ await pg.mouse.move(x,y); await pg.mouse.down(); await sleep(40); await pg.mouse.up(); await frames(3); }
const count=()=>pg.evaluate(()=>BS.S.P.blocks.length);
const blocks=()=>pg.evaluate(()=>BS.S.P.blocks.map(b=>({p:b.p,f:b.f,r:b.r,m:b.m})));
await pg.goto('http://127.0.0.1:8969/satellites/blockspace/?shtest=1',{waitUntil:'load',timeout:60000}); await sleep(1500);
console.log('── boot');
ok(await pg.evaluate(()=>!document.getElementById('welcome').hidden),'welcome card with directions shows before play');
ok(await pg.evaluate(()=>!!window.BS&&!!BS.renderer.getContext()),'WebGL renderer is up');
await pg.click('#wStart'); await frames(3);
ok(await pg.evaluate(()=>document.getElementById('welcome').hidden&&!document.getElementById('hint').hidden),'start hides the card and shows the tap hint');
await pg.screenshot({path:join(HERE,'out','1-empty.png')});
console.log('── thumb path: real taps');
const c0=await count();
await tap(187,420);   // floor, lower middle of the screen
ok(await count()===c0+1,'a tap on the floor places a block ('+await count()+')');
const first=(await blocks()).slice(-1)[0];
ok(first&&first.p[1]===0,'the block sits on the floor row 0  '+JSON.stringify(first&&first.p));
ok(await pg.evaluate(()=>document.getElementById('hint').hidden),'the tap hint dies after the first block');
// where is its top face on screen? project the world point and tap it
const top=await pg.evaluate(()=>{ const b=BS.S.P.blocks[BS.S.P.blocks.length-1]; const v=BS.worldOf(b.p); v.y+=0.5; v.project(BS.camera); return {x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight}; });
await frames(8); await tap(top.x,top.y);
const second=(await blocks()).slice(-1)[0];
ok(await count()===c0+2&&second.p[1]===1&&second.p[0]===first.p[0]&&second.p[2]===first.p[2],'a tap on its top face stacks a second block on it  '+JSON.stringify(second&&second.p));
await frames(10); // let the placement anim finish and chunks settle
ok(await pg.evaluate(()=>BS.chunks.size>=1&&[...BS.chunks.values()].some(c=>c.opaque)),'a merged chunk mesh exists');
console.log('── undo / redo');
await pg.click('#bUndo'); await frames(2); ok(await count()===c0+1,'undo removes the last block');
await pg.click('#bRedo'); await frames(2); ok(await count()===c0+2,'redo brings it back');
console.log('── hold to draw a line');
await pg.mouse.move(60,470); await pg.mouse.down(); await sleep(430); // hold past 350 ms = draw lock
for(let x=60;x<=320;x+=20){ await pg.mouse.move(x,470); await frames(1); }
await pg.mouse.up(); await frames(3);
const afterLine=await count(); ok(afterLine>=c0+2+4,'a held drag drew a line of blocks ('+(afterLine-c0-2)+' new)');
ok(await pg.evaluate(()=>BS.S.undo[BS.S.undo.length-1].ops.length>=4),'the whole stroke is ONE undo step');
console.log('── orbit');
const th0=await pg.evaluate(()=>BS.CAM.theta);
await pg.mouse.move(187,300); await pg.mouse.down(); for(let x=187;x<=300;x+=15){ await pg.mouse.move(x,300); await frames(1); } await pg.mouse.up(); await frames(3);
ok(Math.abs(await pg.evaluate(()=>BS.CAM.theta)-th0)>0.1,'a drag orbits the camera and places nothing ('+await count()+')');
ok(await count()===afterLine,'orbit drag did not place a block');
console.log('── paint, erase, select');
await pg.evaluate(()=>{ BS.setTool('paint'); BS.setColor(3); });
// paint the block whose top face is actually exposed: the top of the first stack
const bid=await pg.evaluate(()=>{ const b0=BS.S.P.blocks[0]; let top=b0; for(const b of BS.S.P.blocks) if(b.p[0]===b0.p[0]&&b.p[2]===b0.p[2]&&b.p[1]>top.p[1]) top=b; return top.id; });
const scr=await pg.evaluate(id=>{ const b=BS.S.byId.get(id); const v=BS.worldOf(b.p); v.y+=0.5; v.project(BS.camera); return {x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight}; },bid);
await tap(scr.x,scr.y); await frames(2);
const painted=await pg.evaluate(id=>BS.S.byId.get(id).f,bid);
ok(painted&&painted[2]===3&&painted[0]===0,'face paint recolors only the tapped top face  '+JSON.stringify(painted));
await pg.evaluate(()=>{ BS.setPaintMode('block'); }); await tap(scr.x,scr.y); await frames(2);
ok(await pg.evaluate(id=>BS.S.byId.get(id).f.every(c=>c===3),bid),'block paint recolors all six faces');
await pg.evaluate(()=>BS.setTool('erase')); const n1=await count(); await tap(scr.x,scr.y); await frames(2);
ok(await count()===n1-1,'erase removes the tapped block');
await pg.evaluate(()=>BS.setTool('select')); const s2=await pg.evaluate(()=>{ const b=BS.S.P.blocks[0]; const v=BS.worldOf(b.p); v.y+=0.5; v.project(BS.camera); return {x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight}; });
await tap(s2.x,s2.y); await frames(2);
ok(await pg.evaluate(()=>!!BS.S.sel&&!document.getElementById('selcard').hidden),'select shows the context card');
await pg.click('#sRotR'); await frames(2); ok(await pg.evaluate(()=>BS.S.byId.get(BS.S.sel).r[1]===7),'rotate right turns the block 45 degrees');
await pg.click('#sGlass'); await frames(2); ok(await pg.evaluate(()=>BS.S.byId.get(BS.S.sel).m===1),'glass toggles the block material');
await frames(6); ok(await pg.evaluate(()=>[...BS.chunks.values()].some(c=>c.glass)),'a glass chunk mesh exists');
console.log('── mirror, bucket, gradient');
await pg.evaluate(()=>{ BS.setTool('build'); BS.setColor(0); BS.toggleMirror(); BS.placeAt([5,0,3],[0,0,0,0,0,0],[0,0,0],0,false); });
ok(await pg.evaluate(()=>BS.S.occ.has(BS.key(18,0,3))),'mirror places the twin at N-1-x');
await pg.evaluate(()=>{ BS.toggleMirror(); for(let x=8;x<12;x++) for(let z=8;z<12;z++) if(!BS.S.occ.has(BS.key(x,0,z))) BS.placeAt([x,0,z],[1,1,1,1,1,1],[0,0,0],0,false); });
await pg.evaluate(()=>{ const b=BS.S.byId.get(BS.S.occ.get(BS.key(8,0,8))); BS.bucketFill(b,2,4); });
ok(await pg.evaluate(()=>{ let n=0; for(let x=8;x<12;x++) for(let z=8;z<12;z++){ const b=BS.S.byId.get(BS.S.occ.get(BS.key(x,0,z))); if(b&&b.f[2]===4) n++; } return n===16; }),'bucket fill floods the 4x4 top plane');
await pg.evaluate(()=>{ BS.S.grad={name:'t',stops:[0,4]}; BS.gradientSpan([8,0,8],[11,0,8]); });
ok(await pg.evaluate(()=>{ const a=BS.S.byId.get(BS.S.occ.get(BS.key(8,0,8))).f[2], b=BS.S.byId.get(BS.S.occ.get(BS.key(11,0,8))).f[2]; return a===0&&b===4; }),'gradient span steps from the first stop to the last');
console.log('── gravity');
await pg.evaluate(()=>{ BS.S.grad=null; BS.placeAt([2,6,2],[2,2,2,2,2,2],[0,0,0],0,false); BS.placeAt([2,7,2],[2,2,2,2,2,2],[0,0,0],0,false); });
await pg.evaluate(()=>BS.gravityCheck()); await sleep(900); await frames(4);
ok(await pg.evaluate(()=>BS.S.occ.has(BS.key(2,0,2))&&BS.S.occ.has(BS.key(2,1,2))&&!BS.S.occ.has(BS.key(2,6,2))),'the floating pair falls to the floor as one cluster');
const nAfter=await count(); await pg.evaluate(()=>BS.undo()); await frames(2);
ok(await pg.evaluate(()=>BS.S.occ.has(BS.key(2,7,2))),'one undo puts the fallen blocks back');
console.log('── save, thumbnail, reload');
const thumb=await pg.evaluate(()=>BS.makeThumb()); ok(typeof thumb==='string'&&thumb.startsWith('data:image/jpeg')&&thumb.length>2000,'thumbnail renders ('+thumb.length+' chars)');
const saved=await pg.evaluate(()=>{ BS.saveNow(); return {n:BS.S.P.blocks.length,id:BS.S.P.id,json:BS.exportJSON()}; });
await pg.reload({waitUntil:'load'}); await sleep(1200);
ok(await pg.evaluate(()=>!!BS&&BS.S.P.blocks.length)===saved.n&&await pg.evaluate(()=>BS.S.P.id)===saved.id,'reload restores the same build ('+saved.n+' blocks)');
ok(await pg.evaluate(()=>document.getElementById('welcome').hidden),'the welcome card does not come back on the second visit');
const rt=await pg.evaluate(j=>{ const p=JSON.parse(j); return JSON.stringify(p.blocks)===JSON.stringify(BS.S.P.blocks); },saved.json);
ok(rt,'export JSON round-trips the block list exactly');
await pg.evaluate(()=>BS.CAM.reframe()); await frames(20);
await pg.screenshot({path:join(HERE,'out','2-built.png')});
await pg.evaluate(()=>{ BS.startProject(BS.STARTERS[1].make()); BS.CAM.reframe(); }); await frames(30); await pg.screenshot({path:join(HERE,'out','3-house.png')});
await pg.evaluate(()=>{ BS.startProject(BS.STARTERS[0].make()); BS.CAM.reframe(); }); await frames(30); await pg.screenshot({path:join(HERE,'out','4-arch.png')});
await pg.evaluate(()=>{ BS.startProject(BS.STARTERS[2].make()); BS.CAM.reframe(); }); await frames(30); await pg.screenshot({path:join(HERE,'out','5-smiley.png')});
await pg.click('#pal'); await frames(4); await pg.screenshot({path:join(HERE,'out','6-palette.png')});
console.log('── perf: 2000 blocks');
await pg.evaluate(()=>{ const p=BS.newProject('perf'); p.gridSize=32; let id=1; for(let x=0;x<20;x++) for(let z=0;z<20;z++) for(let y=0;y<5;y++) p.blocks.push({id:id++,p:[x,y,z],r:[0,0,0],f:[x%12,z%12,y%12,3,4,5],m:(x+z)%9===0?1:0}); p.nid=id; BS.startProject(p); BS.CAM.reframe(); });
await frames(10);
const fps=await pg.evaluate(()=>new Promise(r=>{ let n=0; const t0=performance.now(); (function f(){ n++; if(performance.now()-t0>1500) r(n/((performance.now()-t0)/1000)); else requestAnimationFrame(f); })(); }));
console.log('  info  headless swiftshader fps at 2000 blocks: '+fps.toFixed(1)+' (a software rasterizer, not a phone number)');
const rebuild=await pg.evaluate(()=>{ const t0=performance.now(); BS.S.P.palette[0]='#ff00aa'; for(const k of BS.chunks.keys()) BS.chunks.get(k); BS.run({t:'batch',ops:[{t:'pal',i:0,from:'#e8dcc8',to:'#ff00aa'}]}); BS.flushChunks(1e9); return performance.now()-t0; });
ok(rebuild<400,'a full recolor rebuilds every chunk at 2000 blocks in '+rebuild.toFixed(0)+' ms (headless)');
await pg.screenshot({path:join(HERE,'out','7-perf.png')});
ok(errs.length===0,'no page errors'+(errs.length?':\n      '+errs.slice(0,6).join('\n      '):''));
await b.close(); srv.close();
console.log(fails.length?'BLOCKSPACE FAILED ('+fails.length+')':'BLOCKSPACE OK');
process.exit(fails.length?1:0);
