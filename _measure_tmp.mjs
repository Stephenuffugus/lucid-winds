/* one-off measurement pass: touch targets + fab gutter, at 375x667.
   Serves the REPO ROOT so /feedback.js and /sunbeam-sdk.js resolve. */
import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const ROOT = '/workspaces/lucid-winds';
const MIME = { '.html':'text/html', '.js':'application/javascript', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.css':'text/css', '.svg':'image/svg+xml' };

const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if(p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if(!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404); res.end('nope'); return; }
  res.writeHead(200,{'Content-Type': MIME[path.extname(f)]||'application/octet-stream'});
  res.end(fs.readFileSync(f));
});
await new Promise(r=>server.listen(8977,r));

const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-dev-shm-usage'] });
const which = process.argv[2] || 'both';

async function run(game, drive){
  const page = await browser.newPage();
  await page.setViewport({ width:375, height:667, deviceScaleFactor:1, isMobile:true, hasTouch:true });
  const errs=[];
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  page.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE '+m.text().slice(0,160)); });
  await page.goto(`http://127.0.0.1:8977/satellites/${game}/`, { waitUntil:'domcontentloaded' });
  await new Promise(r=>setTimeout(r,900));
  if(drive) await drive(page);
  await new Promise(r=>setTimeout(r,500));

  const out = await page.evaluate(()=>{
    const vw=innerWidth, vh=innerHeight;
    // the feedback fab's real footprint: right:12 bottom:12, ~78x48 (min-height 48)
    const fab={ left:vw-90, top:vh-60, right:vw-12, bottom:vh-12 };
    const small=[], underFab=[];
    const sel='button,[role=button],input,.toggle,.ls-cell,.diff-card,.tab,.seg button,.kbtn,.exp-node,.draft-card,.load-seed,.nstep,.lt,.card .act,.sx,.rot-dismiss';
    document.querySelectorAll(sel).forEach(el=>{
      const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden'||cs.opacity==='0') return;
      const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return;
      if(r.bottom<0||r.top>vh||r.right<0||r.left>vw) return;
      const id=(el.id||el.className||el.tagName)+'';
      if(r.width<47.5||r.height<47.5) small.push({id:id.slice(0,48), w:+r.width.toFixed(1), h:+r.height.toFixed(1)});
      if(r.left<fab.right && r.right>fab.left && r.top<fab.bottom && r.bottom>fab.top)
        underFab.push({id:id.slice(0,48), rect:[r.left|0,r.top|0,r.right|0,r.bottom|0]});
    });
    // what the browser says is topmost in the middle of the fab gutter
    const cx=(fab.left+fab.right)/2, cy=(fab.top+fab.bottom)/2;
    const stack=document.elementsFromPoint(cx,cy).slice(0,4).map(e=>(e.tagName+'#'+(e.id||'')+'.'+(typeof e.className==='string'?e.className:'')).slice(0,48));
    const shown=[...document.querySelectorAll('.screen')].filter(s=>getComputedStyle(s).display!=='none').map(s=>s.id);
    return { small, underFab, stack, shown, vw, vh };
  });
  console.log('\n===== '+game+' =====');
  console.log('screens shown:', out.shown.join(',')||'(none, in play)');
  console.log('UNDER 48px rendered:', out.small.length? JSON.stringify(out.small): 'none');
  console.log('IN FAB GUTTER:', out.underFab.length? JSON.stringify(out.underFab): 'none');
  console.log('fab-gutter stack:', out.stack.join(' | '));
  if(errs.length) console.log('ERRORS:', errs.slice(0,6).join('\n  '));
  await page.close();
}

if(which==='both'||which==='burr-blast'){
  await run('burr-blast', async p=>{
    await p.evaluate(()=>{ document.getElementById('btnComicSkip')&&document.getElementById('btnComicSkip').click(); });
    await new Promise(r=>setTimeout(r,300));
    await p.evaluate(()=>{ document.getElementById('btnPlay').click(); });
    await new Promise(r=>setTimeout(r,300));
    await p.evaluate(()=>{ document.querySelector('.ls-cell').click(); });   // level 1 -> loadout
  });
}
if(which==='both'||which==='garden-td'){
  await run('garden-td', async p=>{
    await p.evaluate(()=>{ __GTD.start('garden',1); });
  });
}
await browser.close();
server.close();
process.exit(0);
