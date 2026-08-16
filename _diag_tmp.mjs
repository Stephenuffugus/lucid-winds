import http from 'http'; import fs from 'fs'; import path from 'path'; import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds';
const M={'.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.css':'text/css'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':M[path.extname(f)]||'text/plain'});r.end(fs.readFileSync(f));});
await new Promise(r=>s.listen(8984,r));
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage(); await p.setViewport({width:375,height:667,isMobile:true,hasTouch:true});
await p.goto('http://127.0.0.1:8984/satellites/burr-blast/?bbtest=1',{waitUntil:'load'});
await new Promise(r=>setTimeout(r,600));
console.log(await p.evaluate(()=>{
  document.getElementById('btnComicSkip').click();
  window.BB_DEBUG.enter(1); try{window.dismissRotate();}catch(e){}
  document.getElementById('btnPlay').click();
  document.querySelectorAll('.screen').forEach(x=>x.classList.remove('show'));
  document.getElementById('scr-settings').classList.add('show');
  const el=document.getElementById('tgSound'), r=el.getBoundingClientRect();
  const cx=(r.left+r.right)/2, cy=(r.top+r.bottom)/2;
  const stack=(x,y)=>document.elementsFromPoint(x,y).slice(0,3).map(h=>h.tagName+'#'+(h.id||'')+'.'+(typeof h.className==='string'?h.className:'').slice(0,20));
  return { rect:[r.left|0,r.top|0,r.width|0,r.height|0], up:stack(cx,cy-23.5), down:stack(cx,cy+23.5), rot:document.getElementById('rotate').className };
}));
await b.close(); s.close(); process.exit(0);
