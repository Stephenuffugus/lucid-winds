/* Does the REAL feedback fab end up sitting on a control in these two games?
   Loads the live /feedback.js, waits for its yield watcher, then hit-tests the
   fab's own rect with elementsFromPoint (the browser's answer, not mine). */
import http from 'http'; import fs from 'fs'; import path from 'path';
import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds';
const MIME={'.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.css':'text/css'};
const server=http.createServer((req,res)=>{ let p=decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/'))p+='index.html';
  const f=path.join(ROOT,p); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'}); res.end(fs.readFileSync(f)); });
await new Promise(r=>server.listen(8978,r));
const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});

async function check(game, drive, label){
  const page=await browser.newPage();
  await page.setViewport({width:375,height:667,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await page.goto(`http://127.0.0.1:8978/satellites/${game}/`,{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,600));
  if(drive) await drive(page);
  await new Promise(r=>setTimeout(r,4000));   // let the yield watcher scan (600ms active / 2s idle)
  const out=await page.evaluate(()=>{
    const fab=document.querySelector('.lwfb-fab');
    if(!fab) return {mounted:false};
    const cs=getComputedStyle(fab), r=fab.getBoundingClientRect();
    const pts=[[r.left+6,r.top+6],[r.right-6,r.top+6],[r.left+6,r.bottom-6],[r.right-6,r.bottom-6],[(r.left+r.right)/2,(r.top+r.bottom)/2]];
    const under=[];
    pts.forEach(([x,y])=>{ document.elementsFromPoint(x,y).forEach(e=>{
      if(e.closest && e.closest('.lwfb-fab')) return;
      const tag=e.tagName; const cls=(typeof e.className==='string'?e.className:'');
      if(tag==='BUTTON'||tag==='A'||tag==='INPUT'||e.getAttribute&&e.getAttribute('role')==='button'||/btn|tab|cell|toggle|nstep|kbtn|card|sx|lt\b/.test(cls)){
        const k=tag+'#'+(e.id||'')+'.'+cls.slice(0,30); if(under.indexOf(k)<0)under.push(k); } }); });
    return { mounted:true, visible:cs.opacity!=='0'&&cs.display!=='none',
      rect:[r.left|0,r.top|0,r.right|0,r.bottom|0], opacity:cs.opacity, under };
  });
  console.log(label+':', JSON.stringify(out));
  await page.close();
}

await check('burr-blast', async p=>{
  await p.evaluate(()=>{ const b=document.getElementById('btnComicSkip'); b&&b.click(); });
  await new Promise(r=>setTimeout(r,300));
  await p.evaluate(()=>{ document.getElementById('btnPlay').click(); });
  await new Promise(r=>setTimeout(r,300));
  await p.evaluate(()=>{ document.querySelector('.ls-cell').click(); });
}, 'burr-blast loadout');
await check('burr-blast', null, 'burr-blast menu');
await check('garden-td', async p=>{ await p.evaluate(()=>{ __GTD.start('garden',1); }); }, 'garden-td in play');
await check('garden-td', null, 'garden-td menu');
await browser.close(); server.close(); process.exit(0);
