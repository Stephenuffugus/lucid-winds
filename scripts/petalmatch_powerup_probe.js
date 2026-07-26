#!/usr/bin/env node
/* Petal Match POWERUP PROBE.
 *
 * WHY
 *   A powerup that renders is not a powerup that works. The shelf can look
 *   perfect while the effect no-ops, the Petals never leave the wallet, or the
 *   objective counter and the board disagree — which is the exact bug family
 *   that has bitten this game four times now (thorns unbreakable, dew riding
 *   the falling gem, double-layer dew silently single, dewRemaining counting
 *   tiles while the board counted layers).
 *
 *   So this fires every powerup against the REAL engine and asserts on the
 *   REAL board afterwards. It reimplements nothing.
 *
 * USAGE
 *   node scripts/petalmatch_powerup_probe.js
 *
 * Exits non-zero if any check fails, so it can gate a commit.
 */
const puppeteer = require('puppeteer');
const path = require('path'); const http = require('http'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
               '.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.svg':'image/svg+xml' };
function serve(){ return new Promise(r=>{ const s=http.createServer((q,res)=>{
  let p=decodeURIComponent(q.url.split('?')[0]); if(p.endsWith('/'))p+='index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('x');}
  res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res); }); s.listen(0,'127.0.0.1',()=>r(s)); }); }


/* ⛔ REAL mouse events on the canvas, NOT _PM_TEST.play(). play() sets tsR/tsC
   itself and calls only handleEnd — it never goes through handleStart, which is
   where the powerup aim hook lives. Driving it through play() reported every
   targeted powerup as broken when the hook was fine, and would just as happily
   report a genuinely broken one as working. A finger sends mousedown. */
async function tapCell(page, r, c){
  const pt = await page.evaluate((rr,cc)=>{
    const cv=document.querySelector('canvas');
    const b=cv.getBoundingClientRect();
    const w=b.width/8, h=b.height/8;
    return { x:b.left+(cc+0.5)*w, y:b.top+(rr+0.5)*h };
  }, r, c);
  await page.mouse.click(pt.x, pt.y);
}

const results = [];
function check(name, pass, detail){ results.push({name, pass, detail}); }

(async () => {
  const srv = await serve();
  const browser = await puppeteer.launch({ args:['--no-sandbox','--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width:412, height:915, deviceScaleFactor:1, isMobile:true, hasTouch:true });
  page.on('pageerror', e => check('no page errors', false, e.message));

  // Bank Petals BEFORE the game mounts — PM_PETALS reads localStorage at init.
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('lw_pm_petals','500'); localStorage.setItem('lw_pm_paid',''); }catch(e){}
  });
  await page.goto('http://127.0.0.1:'+srv.address().port+'/play/petalmatch.html',{waitUntil:'networkidle2',timeout:30000});
  await new Promise(r=>setTimeout(r,2200));
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,.gb,[onclick]')]
    .filter(e=>e.offsetParent!==null).find(e=>/let.?s play|play|start|begin/i.test(e.textContent||'')); if(b)b.click(); });
  await new Promise(r=>setTimeout(r,1400));

  const has = await page.evaluate(()=>!!(window._PM_TEST&&window._PM_TEST.board&&window._PM_TEST.tapShop));
  if(!has){ console.error('probe hooks missing from _PM_TEST'); process.exit(1); }

  const settle = () => page.evaluate(()=>new Promise(res=>{
    let n=0; (function spin(){ if(!window._PM_TEST.state().animating || n++>200) return res(); setTimeout(spin,25); })();
  }));

  check('wallet loaded from localStorage', (await page.evaluate(()=>window._PM_TEST.board().petals))===500);

  // ── TROWEL ────────────────────────────────────────────────────────────
  await settle();
  let before = await page.evaluate(()=>window._PM_TEST.board());
  const target = before.flowers[20];
  const armed = await page.evaluate(k=>window._PM_TEST.tapShop(k), 'trowel');
  check('trowel arms aim mode', armed==='trowel', 'aiming='+armed);
  await tapCell(page, target[0], target[1]);
  await settle();
  let after = await page.evaluate(()=>window._PM_TEST.board());
  check('trowel charged 15 Petals', after.petals===before.petals-15, before.petals+' -> '+after.petals);
  check('trowel disarmed after firing', after.aiming===null, 'aiming='+after.aiming);

  // ── SHEARS ────────────────────────────────────────────────────────────
  before = await page.evaluate(()=>window._PM_TEST.board());
  const sc = await page.evaluate(()=>window._PM_TEST.state().score);
  await page.evaluate(k=>window._PM_TEST.tapShop(k), 'shears');
  await tapCell(page, 3, 3);
  await settle();
  after = await page.evaluate(()=>window._PM_TEST.board());
  const sc2 = await page.evaluate(()=>window._PM_TEST.state().score);
  check('shears charged 25 Petals', after.petals===before.petals-25, before.petals+' -> '+after.petals);
  check('shears scored points (board actually cleared)', sc2>sc, sc+' -> '+sc2);

  // ── WATERING CAN on a THORN ───────────────────────────────────────────
  // Level 5 is the teaching thorns level, 1 hit each.
  await page.evaluate(()=>window._PM_TEST.setLevel(5));
  await settle();
  before = await page.evaluate(()=>window._PM_TEST.board());
  let st = await page.evaluate(()=>window._PM_TEST.state());
  check('level 5 seeded thorns', before.thorns.length>0, before.thorns.length+' thorns');
  if(before.thorns.length){
    const th = before.thorns[0];
    await page.evaluate(k=>window._PM_TEST.tapShop(k), 'can');
    await tapCell(page, th[0], th[1]);
    await settle();
    after = await page.evaluate(()=>window._PM_TEST.board());
    const st2 = await page.evaluate(()=>window._PM_TEST.state());
    check('can charged 20 Petals', after.petals===before.petals-20, before.petals+' -> '+after.petals);
    check('can removed the thorn from the board', after.thorns.length===before.thorns.length-1,
          before.thorns.length+' -> '+after.thorns.length);
    check('can decremented the thorn OBJECTIVE too', st2.thorns===st.thorns-1,
          st.thorns+' -> '+st2.thorns);
  }

  // ── WATERING CAN refuses a plain flower and charges nothing ───────────
  before = await page.evaluate(()=>window._PM_TEST.board());
  await page.evaluate(k=>window._PM_TEST.tapShop(k), 'can');
  await tapCell(page, before.flowers[0][0], before.flowers[0][1]);
  await settle();
  after = await page.evaluate(()=>window._PM_TEST.board());
  check('can charges NOTHING on an invalid target', after.petals===before.petals,
        before.petals+' -> '+after.petals);

  // ── DEEP BREATH ───────────────────────────────────────────────────────
  await page.evaluate(()=>window._PM_TEST.setLevel(6));
  await settle();
  before = await page.evaluate(()=>window._PM_TEST.board());
  st = await page.evaluate(()=>window._PM_TEST.state());
  await page.evaluate(()=>window._PM_TEST.buyBoost('breath'));
  await settle();
  after = await page.evaluate(()=>window._PM_TEST.board());
  let st2 = await page.evaluate(()=>window._PM_TEST.state());
  check('deep breath charged 20 Petals', after.petals===before.petals-20, before.petals+' -> '+after.petals);
  check('deep breath added 5 moves', st2.moves===st.moves+5, st.moves+' -> '+st2.moves);

  // ── THIN MEADOW ───────────────────────────────────────────────────────
  await page.evaluate(()=>window._PM_TEST.setLevel(7));
  await settle();
  before = await page.evaluate(()=>window._PM_TEST.board());
  const t0 = await page.evaluate(()=>window._PM_TEST.types());
  await page.evaluate(()=>window._PM_TEST.buyBoost('thin'));
  await settle();
  after = await page.evaluate(()=>window._PM_TEST.board());
  const t1 = await page.evaluate(()=>window._PM_TEST.types());
  check('thin meadow charged 40 Petals', after.petals===before.petals-40, before.petals+' -> '+after.petals);
  check('thin meadow dropped a flower type', t1===t0-1, t0+' -> '+t1);
  // and it must NOT leak into the next level
  await page.evaluate(()=>window._PM_TEST.setLevel(8));
  await settle();
  const t2 = await page.evaluate(()=>window._PM_TEST.types());
  check('thin meadow does NOT leak to the next level', t2===6, 'activeTypes='+t2);

  // ── AFFORDABILITY GATE ────────────────────────────────────────────────
  /* ⛔ A SEPARATE BROWSER CONTEXT, not setItem + reload on this page.
     evaluateOnNewDocument re-runs on every navigation, so the reload put the
     500 Petals straight back and the broke-player test was silently running
     with a full wallet — it "failed" for a reason that had nothing to do with
     the game. Separate context, separate localStorage, seeded to zero. */
  const ctx = await (browser.createBrowserContext
    ? browser.createBrowserContext() : browser.createIncognitoBrowserContext());
  const page2 = await ctx.newPage();
  await page2.setViewport({ width:412, height:915, deviceScaleFactor:1, isMobile:true, hasTouch:true });
  await page2.evaluateOnNewDocument(() => {
    try { localStorage.setItem('lw_pm_petals','0'); localStorage.setItem('lw_pm_paid',''); }catch(e){}
  });
  await page2.goto('http://127.0.0.1:'+srv.address().port+'/play/petalmatch.html',{waitUntil:'networkidle2',timeout:30000});
  await new Promise(r=>setTimeout(r,2200));
  await page2.evaluate(()=>{ const b=[...document.querySelectorAll('button,.gb,[onclick]')]
    .filter(e=>e.offsetParent!==null).find(e=>/let.?s play|play|start|begin/i.test(e.textContent||'')); if(b)b.click(); });
  await new Promise(r=>setTimeout(r,1400));
  const brokeArm = await page2.evaluate(()=>window._PM_TEST.tapShop('trowel'));
  const brokeBal = await page2.evaluate(()=>window._PM_TEST.board().petals);
  check('cannot arm a powerup at 0 Petals', brokeArm==null||brokeArm===undefined, 'aiming='+brokeArm);
  check('balance never goes negative', brokeBal===0, 'petals='+brokeBal);
  const boostRefused = await page2.evaluate(()=>window._PM_TEST.buyBoost('thin'));
  check('cannot buy a boost at 0 Petals', boostRefused===false, 'returned '+boostRefused);

  console.log('\nPOWERUP PROBE');
  console.log('─'.repeat(62));
  let bad=0;
  results.forEach(r=>{
    if(!r.pass)bad++;
    console.log((r.pass?'  ok  ':'  FAIL')+'  '+r.name+(r.detail?'   ('+r.detail+')':''));
  });
  console.log('─'.repeat(62));
  console.log(bad?('⛔ '+bad+' FAILED'):'✓ all '+results.length+' checks passed');

  await browser.close(); srv.close();
  process.exit(bad?1:0);
})();
