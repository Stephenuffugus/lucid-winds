/* One picture per mode's stadium. A stadium is dressing rather than geometry, so
 * a gate cannot tell you whether it says what the mode is; only looking can.
 *   node tools/stadiums.mjs
 */
import puppeteer from '/workspaces/lucid-winds/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { fileURLToPath } from 'url';
import path from 'path'; import fs from 'fs'; import http from 'http';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'tools', 'shots'); fs.mkdirSync(OUT, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));
const TYPES = { '.html':'text/html','.js':'text/javascript','.json':'application/json',
                '.webmanifest':'application/manifest+json','.png':'image/png' };
const server = http.createServer((req,res)=>{
  const rel=decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'')||'index.html';
  const f=path.join(ROOT,rel);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
const URL_BASE = 'http://127.0.0.1:'+server.address().port+'/index.html';
await page.goto(URL_BASE,{waitUntil:'load'});
await wait(600);
// clear the ladder so every mode is open
await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('ripcord.save.v1')||'{}');
  s.rung=24; s.facing=24; s.seen={howto:1};
  localStorage.setItem('ripcord.save.v1',JSON.stringify(s));
});
await page.reload({waitUntil:'load'}); await wait(700);

const MODES = ['Pangkah','Uri','Taya','Target range'];
let n = 0;
for (const label of MODES){
  await page.evaluate(()=>{ document.getElementById('menu').classList.add('up');
                            document.getElementById('mModes').click(); });
  await wait(400);
  const hit = await page.evaluate((label)=>{
    const b=[...document.querySelectorAll('#modesBody .rung')].find(x=>x.textContent.trim().startsWith(label));
    if(!b||b.classList.contains('locked')) return { err:'missing or locked' };
    const r=b.getBoundingClientRect();
    return { x:r.left+r.width/2, y:r.top+r.height/2 };
  }, label);
  if(hit.err){ console.log('  ' + label + ': ' + hit.err); continue; }
  await page.mouse.click(hit.x,hit.y);
  await wait(800);
  await page.evaluate(()=>{ for(const id of ['card','hint','laps','dock','top'])
    { const e=document.getElementById(id); if(e) e.style.opacity='0'; } });
  await wait(200);
  await page.screenshot({ path: path.join(OUT,'stadium-'+label.replace(/\s+/g,'-').toLowerCase()+'.png'),
                          clip:{ x:6, y:110, width:363, height:420 } });
  n++;
}
console.log('stadiums captured: ' + n + ' of ' + MODES.length);
await browser.close(); server.close();
