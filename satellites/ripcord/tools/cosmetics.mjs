/* A contact sheet of every decal and every launcher, drawn by the real game.
 * Cosmetics are the one part of this project a gate cannot judge: a decal either
 * reads at twenty five pixels across or it does not, and only a picture says so.
 *   node tools/cosmetics.mjs
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
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'load'});
await wait(700);
await page.evaluate(()=>{ document.querySelector('#howto [data-close]').click(); });
await wait(300);
await page.evaluate(()=>{ document.getElementById('mShop').click(); });
await wait(400);
await page.evaluate(()=>{ document.getElementById('accLooks').open = true; });
await wait(400);

/* Click a chip by its label inside the Looks panel, scrolling it in first. */
async function pickLook(label){
  const hit = await page.evaluate(async (label)=>{
    const chips=[...document.querySelectorAll('#looks .chip')];
    const t=chips.find(c=>c.textContent.trim()===label);
    if(!t) return { err:'no chip "'+label+'"' };
    t.scrollIntoView({block:'nearest',inline:'center'});
    await new Promise(r=>setTimeout(r,150));
    const r=t.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    if(cx<0||cy<0||cx>innerWidth||cy>innerHeight) return { err:'off screen' };
    const top=document.elementFromPoint(cx,cy);
    if(!top||(top!==t&&!t.contains(top))) return { err:'covered' };
    return { x:cx, y:cy };
  }, label);
  if(hit.err){ console.log('  could not pick ' + label + ': ' + hit.err); return false; }
  await page.mouse.click(hit.x,hit.y);
  await wait(220);
  return true;
}

const DECALS = ['none','stripe','sunburst','koi','tiger','wave','circuit','moth','flame','crane','chalk','knot'];
const shots = [];
for (const d of DECALS){
  if(!(await pickLook(d))) continue;
  const el = await page.$('#lookPrev');
  const f = path.join(OUT, 'decal-' + d + '.png');
  await el.screenshot({ path: f });
  shots.push(f);
}
console.log('decals captured: ' + shots.length + ' of ' + DECALS.length);

// launchers: shown on the wind screen, so leave the workshop and look at it
await page.evaluate(()=>{ document.querySelector('#sheet [data-close]').click(); });
await wait(300);
const LAUNCHERS = ['cord','ripcord','winder','bat','whip','spool'];
const lshots = [];
for (const l of LAUNCHERS){
  await page.evaluate(()=>{ document.getElementById('mShop').click(); });
  await wait(300);
  await page.evaluate(()=>{ document.getElementById('accLooks').open = true; });
  await wait(250);
  if(!(await pickLook(l))) continue;
  await page.evaluate(()=>{ document.querySelector('#sheet [data-close]').click(); });
  await wait(250);
  await page.evaluate(()=>{ document.getElementById('mPlay').click(); });
  await wait(600);
  const f = path.join(OUT, 'launcher-' + l + '.png');
  await page.screenshot({ path: f, clip: { x: 20, y: 150, width: 335, height: 340 } });
  lshots.push(f);
  await page.evaluate(()=>{ document.getElementById('menu').classList.add('up'); });
  await wait(200);
}
console.log('launchers captured: ' + lshots.length + ' of ' + LAUNCHERS.length);
await browser.close(); server.close();
