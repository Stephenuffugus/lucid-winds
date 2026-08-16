import http from 'http'; import fs from 'fs'; import path from 'path'; import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds';
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(ROOT,u);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}
 r.writeHead(200,{'content-type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(8813,'127.0.0.1',r));
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',String(e).slice(0,200)));
await p.goto('http://127.0.0.1:8813/satellites/pong/index.html',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,400));
const out=await p.evaluate(()=>{
  const seed=n=>{let a=n>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
  Math.random=seed(20260816);
  const res={};
  for(const d of ['easy','normal','hard','expert']){
    let ret=0,miss=0,aiPts=0,pPts=0;
    for(let trial=0;trial<7;trial++){
      window.__PONG.start('classic',{diff:d,target:999});
      const g=window.__PONG.game, pp=g.playerPaddle();
      const hist=[]; let approaching=false, p0=g.scores.p;
      for(let n=0;n<20000;n++){
        const bb=g.balls.find(x=>!x.dead);
        if(bb){ hist.push(bb.y); if(hist.length>9)hist.shift();
          const seen=hist[0]; if(seen!=null) pp.setTargetFromPoint(0, seen+Math.sin(n*0.11)*30); }
        window.__PONG.step(1);
        const b2=g.balls.find(x=>!x.dead);
        if(b2 && g.state==='play'){
          if(!approaching && b2.vx>0) approaching=true;
          else if(approaching && b2.vx<0){ ret++; approaching=false; }
        }
        if(g.scores.p>p0){ if(approaching){ miss++; approaching=false; } p0=g.scores.p; }
      }
      aiPts+=g.scores.ai; pPts+=g.scores.p;
    }
    res[d]={rate:+(ret/Math.max(1,ret+miss)).toFixed(3), ret, miss, share:+(aiPts/Math.max(1,aiPts+pPts)).toFixed(3), aiPts, pPts};
  }
  return res;
});
console.log(JSON.stringify(out,null,1));
await b.close(); srv.close();
