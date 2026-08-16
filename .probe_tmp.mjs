import fs from 'node:fs'; import http from 'node:http'; import path from 'node:path'; import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/'))p+='index.html';
 const f=path.join(ROOT,p); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end('no');return;}
 res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r)); const P=server.address().port;
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
const pg=await b.newPage(); await pg.setViewport({width:375,height:667,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await pg.goto(`http://127.0.0.1:${P}/satellites/burrow-bowl/?bb_test=1`,{waitUntil:'domcontentloaded'});
await pg.evaluate(()=>{localStorage.clear();localStorage.setItem('sws_dev_ok','1');});
await pg.goto(`http://127.0.0.1:${P}/satellites/burrow-bowl/?bb_test=1`,{waitUntil:'load'});
await new Promise(r=>setTimeout(r,600));
for(const s of ['s-title','s-how','s-set','s-sum','s-play']){
  const out=await pg.evaluate(id=>{ window.BB.show(id);
    const spots={ 'bottom-right':[375-90,667-174], 'top-left':[12,12], 'top-right':[375-90,12], 'bottom-left':[12,667-174] };
    const res={};
    const rects=[...document.querySelectorAll('button,.settingline')].filter(e=>!e.closest('.lwfb-fab')).map(e=>{const r=e.getBoundingClientRect(); return {id:e.id||e.className,r};}).filter(o=>o.r.width>2&&o.r.height>2);
    for(const k in spots){ const [x,y]=spots[k]; const f={left:x,top:y,right:x+78,bottom:y+78};
      res[k]=rects.filter(o=>o.r.left<f.right&&o.r.right>f.left&&o.r.top<f.bottom&&o.r.bottom>f.top).map(o=>o.id); }
    return {id, res, buttons:rects.map(o=>o.id+':'+Math.round(o.r.left)+','+Math.round(o.r.top)+' '+Math.round(o.r.width)+'x'+Math.round(o.r.height))};
  },s);
  console.log(out.id, JSON.stringify(out.res));
  if(s==='s-title'||s==='s-sum') console.log('   ', out.buttons.join(' | '));
}
await b.close(); server.close();
