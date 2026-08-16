import http from 'http'; import fs from 'fs'; import path from 'path'; import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/json'};
const s=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(ROOT,u);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}
 r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>s.listen(8791,'127.0.0.1',r));
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p=await b.newPage(); p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,200)));
await p.goto('http://127.0.0.1:8791/satellites/pong/index.html',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,200));
console.log(await p.evaluate(()=>{
  const out=[];
  for(const mode of ['classic','vertical','radial','gauntlet','multiball']){
    window.__PONG.start(mode,{diff:'normal',target:99});
    const g=window.__PONG.game;
    for(let pt=0;pt<4;pt++){
      const s0=g.scores.p+g.scores.ai; let n=0;
      while(g.scores.p+g.scores.ai===s0 && n<3600){ window.__PONG.step(1); n++; }
      out.push({mode,pt,n,secs:+(n/120).toFixed(1),state:g.state,balls:g.balls.length,
        ball:g.balls[0]?{x:Math.round(g.balls[0].x),y:Math.round(g.balls[0].y),sp:Math.round(Math.hypot(g.balls[0].vx,g.balls[0].vy)),stuck:!!g.balls[0].stuck,dead:g.balls[0].dead}:null,
        W:Math.round(g.W),H:Math.round(g.H)});
      if(n>=3600) break;
    }
  }
  return out;
}));
await b.close(); s.close();
