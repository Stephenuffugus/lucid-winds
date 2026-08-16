import fs from 'node:fs'; import http from 'node:http'; import path from 'node:path'; import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds';
const OUT='/tmp/claude-1000/-workspaces-lucid-winds/5d3fb669-7586-4960-ab47-ebc7334caf3a/scratchpad/shots';
fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/'))p+='index.html';
 const f=path.join(ROOT,p); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end('no');return;}
 res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r)); const P=server.address().port;
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
async function shot(url,name,setup,wait){
  const ctx=await b.createBrowserContext(); const pg=await ctx.newPage();
  await pg.setViewport({width:375,height:667,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await pg.bringToFront();
  await pg.goto(url,{waitUntil:'domcontentloaded'});
  await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('sws_dev_ok','1');localStorage.setItem('rr_how_v1','1');localStorage.setItem('fb_helpseen','1');});
  await pg.goto(url,{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,1500));
  if(setup) await pg.evaluate(setup);
  await new Promise(r=>setTimeout(r,wait||600));
  await pg.screenshot({path:path.join(OUT,name+'.png')});
  await ctx.close();
}
const RR=`http://127.0.0.1:${P}/satellites/rule-root/?rrtest=1`;
const BB=`http://127.0.0.1:${P}/satellites/burrow-bowl/?bb_test=1`;
const FB=`http://127.0.0.1:${P}/satellites/flipbook/?fbtest=1`;
await shot(RR,'rr-title');
await shot(RR,'rr-play',()=>{RR_DEV.load(0);},900);
await shot(BB,'bb-title');
await shot(BB,'bb-set',()=>{document.getElementById('b-set').click();});
await shot(FB,'fb-draw',()=>{ if(!document.getElementById('acc-draw').classList.contains('open'))document.getElementById('tab-draw').click(); document.getElementById('b-palette').click(); FB_DEV.stroke(120,200,400,320); });
await shot(FB,'fb-savebar',()=>{ FB_DEV.stroke(120,200,400,320);
  const real=localStorage.setItem.bind(localStorage);
  localStorage.setItem=function(k,v){ if(k==='fb_book'){const e=new Error('q');e.name='QuotaExceededError';throw e;} return real(k,v); };
  FB_DEV.save(); });
await b.close(); server.close(); console.log('shots in',OUT);
