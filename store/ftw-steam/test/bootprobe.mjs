/* Flock the World desktop-build boot gate: serves the VENDORED app/ folder, boots it,
   clicks past whatever gate stands in the way, and asserts a storefront build's rules:
   zero external requests, no portal exit on screen, no page errors. Then screenshots.
   node test/bootprobe.mjs  (from store/ftw-steam; uses the repo's puppeteer) */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
const HERE=new URL('.', import.meta.url).pathname, APP=process.env.FTW_APP||join(HERE,'..','app'), OUT=process.env.FTW_OUT||join(HERE,'out'); mkdirSync(OUT,{recursive:true});
if(!existsSync(join(APP,'index.html'))){ console.log('FAIL: run ./vendor.sh first'); process.exit(1); }
const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg'};
const srv=createServer((q,r)=>{ const u=decodeURIComponent(q.url.split('?')[0]); let p=join(APP,u==='/'?'index.html':u); if(!existsSync(p)||statSync(p).isDirectory()){ r.writeHead(404); return r.end(); } r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'}); r.end(readFileSync(p)); }).listen(8975);
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const pg=await b.newPage(); await pg.setViewport({width:1280,height:800});
const external=[], errs=[];
pg.on('request',r=>{ const u=r.url(); if(!u.startsWith('http://127.0.0.1:8975')&&!u.startsWith('data:')&&!u.startsWith('blob:')) external.push(u); });
pg.on('pageerror',e=>errs.push(String(e.message).slice(0,160)));
await pg.goto('http://127.0.0.1:8975/',{waitUntil:'networkidle2',timeout:60000}); await new Promise(r=>setTimeout(r,2500));
const state=await pg.evaluate(()=>{ const vis=el=>!!el&&el.getBoundingClientRect().width>0&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden';
  const exits=[...document.querySelectorAll('button,a')].filter(e=>/sky wolf|arcade|back to/i.test(e.textContent||'')&&vis(e)).map(e=>e.textContent.trim().slice(0,40));
  return {flag:window.__DESKTOP_BUILD===true, exits, title:document.title, buttons:[...document.querySelectorAll('button')].filter(vis).length}; });
await pg.screenshot({path:join(OUT,'boot.png')});
const fails=[]; const ok=(c,m)=>{ console.log((c?'  PASS  ':'  FAIL  ')+m); if(!c) fails.push(m); };
ok(state.flag,'desktop flag is set before the game reads it');
ok(external.length===0,'zero external requests'+(external.length?': '+external.slice(0,4).join(' '):''));
ok(state.exits.length===0,'no portal exit on screen'+(state.exits.length?': '+state.exits.join(' | '):''));
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
ok(state.buttons>0,'the game drew its buttons ('+state.buttons+')');
console.log('  title: '+state.title);
await b.close(); srv.close(); console.log(fails.length?'FTW BOOTPROBE FAILED':'FTW BOOTPROBE OK'); process.exit(fails.length?1:0);
