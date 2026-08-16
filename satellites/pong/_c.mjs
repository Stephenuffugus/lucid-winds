import http from 'http'; import fs from 'fs'; import path from 'path'; import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds';
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/json'};
const s=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(ROOT,u);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}
 r.writeHead(200,{'content-type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>s.listen(8792,'127.0.0.1',r));
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p=await b.newPage(); await p.setViewport({width:Number(process.env.VW||390),height:Number(process.env.VH||844),deviceScaleFactor:2}); await p.goto('http://127.0.0.1:8792/satellites/pong/index.html',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,200));
await p.evaluate((a)=>{window.__AIM=a;}, Number(process.env.AIM||0));
console.log(process.env.AIM||0, await p.evaluate(()=>{
  const out={};
  for(const d of ['easy','normal','hard','expert']){
    window.__PONG.start('classic',{diff:d,target:9});
    const g=window.__PONG.game, pp=g.playerPaddle(); pp.maxSpeed=1e6;
    const AIM=Number(window.__AIM||0);
    let n=0; while(g.state!=='over'&&n<90000){ const bb=g.balls.find(x=>!x.dead);
      if(bb){ let ty=bb.y;
        if(AIM){ const ai=g.aiPaddle(); const dir=(ai&&ai.center().y<g.H/2)?1:-1; ty=bb.y-dir*AIM*(pp.len/2); }
        pp.setTargetFromPoint(bb.x,ty); pp.off=pp.target; }
      window.__PONG.step(1); n++; }
    out[d]={over:g.state==='over',p:g.scores.p,ai:g.scores.ai,secs:+(n/120).toFixed(0),perPt:+(n/120/Math.max(1,g.scores.p)).toFixed(1)};
  }
  return out;
}));
await b.close(); s.close();
